"""WebSocket endpoints for the Weather Graph integration."""
from __future__ import annotations

from datetime import datetime, timezone
import logging
from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import Event, HomeAssistant, callback
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.event import async_track_state_change_event

from .bom_adapter import (
    build_bom_forecast_payload,
    build_generic_ha_forecast_payload,
    resolve_bom_entry,
    resolve_hourly_weather_entity_id,
    slugify_name,
)
from .const import BOM_DOMAIN, DEFAULT_HOURS, DOMAIN

_LOGGER = logging.getLogger(__name__)


def _build_entity_registry_bom_map(hass: HomeAssistant) -> dict[str, str]:
    """Map entity_id -> config_entry_id for all `bureau_of_meteorology` weather entities."""
    mapping: dict[str, str] = {}
    try:
        reg = er.async_get(hass)
        for entity_id, entry in reg.entities.items():
            if entry.platform == BOM_DOMAIN and entry.config_entry_id:
                mapping[entity_id] = entry.config_entry_id
    except Exception:  # pragma: no cover
        pass
    return mapping


def _extract_sun_windows_from_hass(hass: HomeAssistant) -> list[dict[str, Any]]:
    """Extract next rising/setting from `sun.sun` when generic HA weather is used."""
    sun_state = hass.states.get("sun.sun")
    if sun_state is None:
        return []
    rising_str = sun_state.attributes.get("next_rising")
    setting_str = sun_state.attributes.get("next_setting")
    windows: list[dict[str, Any]] = []
    try:
        sr = datetime.fromisoformat(rising_str.replace("Z", "+00:00")) if rising_str else None
        ss = datetime.fromisoformat(setting_str.replace("Z", "+00:00")) if setting_str else None
        if sr or ss:
            windows.append(
                {
                    "sunrise": sr.isoformat() if sr else None,
                    "sunrise_ms": int(sr.timestamp() * 1000) if sr else None,
                    "sunset": ss.isoformat() if ss else None,
                    "sunset_ms": int(ss.timestamp() * 1000) if ss else None,
                }
            )
    except (ValueError, TypeError):
        pass
    return windows


async def _async_get_generic_forecast_rows(
    hass: HomeAssistant,
    entity_id: str,
) -> list[dict[str, Any]]:
    """Fetch hourly forecast rows from a generic Home Assistant weather entity."""
    try:
        response = await hass.services.async_call(
            "weather",
            "get_forecasts",
            {"entity_id": entity_id, "type": "hourly"},
            blocking=True,
            return_response=True,
        )
        if isinstance(response, dict):
            entity_data = response.get(entity_id) or {}
            forecast = entity_data.get("forecast")
            if isinstance(forecast, list):
                return forecast
    except Exception as err:
        _LOGGER.debug("weather.get_forecasts unavailable for %s: %s", entity_id, err)

    state_obj = hass.states.get(entity_id)
    if state_obj and isinstance(state_obj.attributes.get("forecast"), list):
        return state_obj.attributes["forecast"]
    return []


@callback
def async_register_websocket_handlers(hass: HomeAssistant) -> None:
    """Register Weather Graph WebSocket commands once."""
    if hass.data.setdefault(DOMAIN, {}).get("ws_registered"):
        return
    websocket_api.async_register_command(hass, ws_get_locations)
    websocket_api.async_register_command(hass, ws_subscribe_forecast)
    hass.data[DOMAIN]["ws_registered"] = True


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/get_locations",
    }
)
@callback
def ws_get_locations(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return discovered BOM locations and hourly-capable HA weather entities."""
    bom_entries: list[dict[str, Any]] = []
    bom_data = hass.data.get(BOM_DOMAIN) or {}
    if isinstance(bom_data, dict):
        for entry_id, item in bom_data.items():
            if not isinstance(item, dict) or "collector" not in item:
                continue
            collector = item["collector"]
            loc = (getattr(collector, "locations_data", None) or {}).get("data") or {}
            name = loc.get("name") or entry_id
            slug = slugify_name(str(name))
            hourly_entity = f"weather.{slug}_hourly"
            bom_entries.append(
                {
                    "entry_id": entry_id,
                    "name": name,
                    "state": loc.get("state"),
                    "timezone": loc.get("timezone"),
                    "entity_id": hourly_entity,
                }
            )

    weather_entities: list[dict[str, Any]] = []
    for state_obj in hass.states.async_all("weather"):
        features = int(state_obj.attributes.get("supported_features", 0) or 0)
        weather_entities.append(
            {
                "entity_id": state_obj.entity_id,
                "name": state_obj.attributes.get("friendly_name") or state_obj.entity_id,
                "supports_hourly": (features & 2) != 0,
            }
        )

    connection.send_result(
        msg["id"],
        {
            "bom_locations": bom_entries,
            "weather_entities": weather_entities,
        },
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/subscribe_forecast",
        vol.Optional("entity_id"): str,
        vol.Optional("entry_id"): str,
        vol.Optional("hours", default=DEFAULT_HOURS): vol.All(
            vol.Coerce(int), vol.Range(min=12, max=72)
        ),
    }
)
@websocket_api.async_response
async def ws_subscribe_forecast(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Subscribe to enriched 48-hour forecast updates backed by BOM or HA Weather."""
    requested_entity: str | None = msg.get("entity_id")
    requested_entry_id: str | None = msg.get("entry_id")
    hours: int = msg.get("hours", DEFAULT_HOURS)

    bom_domain_data = hass.data.get(BOM_DOMAIN)
    reg_map = _build_entity_registry_bom_map(hass)
    bom_match = resolve_bom_entry(
        bom_domain_data,
        entity_id=requested_entity,
        entry_id=requested_entry_id,
        entity_registry_map=reg_map,
    )

    if bom_match is not None:
        matched_entry_id, entry_runtime = bom_match
        collector = entry_runtime["collector"]
        coordinator = entry_runtime.get("coordinator")
        resolved_entity = (
            resolve_hourly_weather_entity_id(
                {s.entity_id: s for s in hass.states.async_all("weather")},
                requested_entity,
            )
            if requested_entity
            else f"weather.{slugify_name(((collector.locations_data or {}).get('data') or {}).get('name', matched_entry_id))}_hourly"
        )

        @callback
        def _push_bom_update() -> None:
            payload = build_bom_forecast_payload(
                collector,
                entity_id=resolved_entity,
                max_hours=hours,
                now_utc=datetime.now(timezone.utc),
            )
            connection.send_message(websocket_api.event_message(msg["id"], payload))

        if coordinator is not None and hasattr(coordinator, "async_add_listener"):
            unsub = coordinator.async_add_listener(_push_bom_update)
            connection.subscriptions[msg["id"]] = unsub
        else:
            connection.subscriptions[msg["id"]] = lambda: None

        connection.send_result(msg["id"])
        _push_bom_update()
        return

    if not requested_entity:
        weather_states = hass.states.async_all("weather")
        if not weather_states:
            connection.send_error(
                msg["id"],
                "entity_not_found",
                "No Bureau of Meteorology entry or weather entity found in Home Assistant.",
            )
            return
        requested_entity = weather_states[0].entity_id

    state_map = {s.entity_id: s for s in hass.states.async_all("weather")}
    resolved_entity = resolve_hourly_weather_entity_id(state_map, requested_entity)
    state_obj = hass.states.get(resolved_entity)
    if state_obj is None:
        connection.send_error(
            msg["id"],
            "entity_not_found",
            f"Weather entity '{resolved_entity}' does not exist.",
        )
        return

    async def _push_generic_update(_event: Event | None = None) -> None:
        latest_state = hass.states.get(resolved_entity)
        if latest_state is None:
            return
        rows = await _async_get_generic_forecast_rows(hass, resolved_entity)
        attrs = latest_state.attributes
        payload = build_generic_ha_forecast_payload(
            rows,
            entity_id=resolved_entity,
            timezone_name=hass.config.time_zone or "UTC",
            friendly_name=attrs.get("friendly_name"),
            temp_unit=attrs.get("temperature_unit"),
            wind_unit=attrs.get("wind_speed_unit"),
            state_attributes=attrs,
            sun_windows=_extract_sun_windows_from_hass(hass),
            max_hours=hours,
        )
        connection.send_message(websocket_api.event_message(msg["id"], payload))

    unsub_state = async_track_state_change_event(
        hass,
        [resolved_entity],
        lambda event: hass.async_create_task(_push_generic_update(event)),
    )
    connection.subscriptions[msg["id"]] = unsub_state

    connection.send_result(msg["id"])
    await _push_generic_update()
