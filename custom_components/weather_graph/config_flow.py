"""Config flow for the Weather Graph integration."""
from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import selector

from .bom_adapter import slugify_name
from .const import (
    BOM_DOMAIN,
    CONF_DEFAULT_ENTITY,
    CONF_HOURS,
    CONF_TITLE,
    DEFAULT_HOURS,
    DEFAULT_TITLE,
    DOMAIN,
)


def _discover_preferred_weather_entity(hass: HomeAssistant) -> str:
    """Prefer an installed Bureau of Meteorology `*_hourly` weather entity when available."""
    bom_data = hass.data.get(BOM_DOMAIN)
    if isinstance(bom_data, dict):
        for item in bom_data.values():
            if isinstance(item, dict) and "collector" in item:
                loc = (getattr(item["collector"], "locations_data", None) or {}).get("data") or {}
                name = loc.get("name")
                if isinstance(name, str) and name:
                    candidate = f"weather.{slugify_name(name)}_hourly"
                    if hass.states.get(candidate) is not None:
                        return candidate

    for state_obj in hass.states.async_all("weather"):
        if state_obj.entity_id.endswith("_hourly"):
            return state_obj.entity_id

    for state_obj in hass.states.async_all("weather"):
        features = int(state_obj.attributes.get("supported_features", 0) or 0)
        if (features & 2) != 0:
            return state_obj.entity_id

    all_weather = hass.states.async_all("weather")
    return all_weather[0].entity_id if all_weather else ""


class WeatherGraphConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Weather Graph."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> config_entries.ConfigFlowResult:
        """Handle the initial setup step."""
        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()

        if user_input is not None:
            return self.async_create_entry(
                title=user_input.get(CONF_TITLE) or "Weather Graph",
                data=user_input,
            )

        default_entity = _discover_preferred_weather_entity(self.hass)
        schema_fields: dict[Any, Any] = {
            vol.Optional(CONF_TITLE, default=DEFAULT_TITLE): str,
            vol.Optional(CONF_HOURS, default=DEFAULT_HOURS): vol.All(
                vol.Coerce(int), vol.Range(min=24, max=72)
            ),
        }
        if default_entity:
            schema_fields[vol.Optional(CONF_DEFAULT_ENTITY, default=default_entity)] = (
                selector.EntitySelector(selector.EntitySelectorConfig(domain="weather"))
            )
        else:
            schema_fields[vol.Optional(CONF_DEFAULT_ENTITY)] = selector.EntitySelector(
                selector.EntitySelectorConfig(domain="weather")
            )

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(schema_fields),
        )

    @staticmethod
    @callback
    def async_get_options_flow(
        config_entry: config_entries.ConfigEntry,
    ) -> WeatherGraphOptionsFlow:
        """Return the options flow handler."""
        return WeatherGraphOptionsFlow(config_entry)


class WeatherGraphOptionsFlow(config_entries.OptionsFlow):
    """Handle options updates for Weather Graph."""

    def __init__(self, config_entry: config_entries.ConfigEntry) -> None:
        """Initialize options flow."""
        self._config_entry = config_entry

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> config_entries.ConfigFlowResult:
        """Manage integration options."""
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        current_title = self._config_entry.options.get(
            CONF_TITLE, self._config_entry.data.get(CONF_TITLE, DEFAULT_TITLE)
        )
        current_hours = self._config_entry.options.get(
            CONF_HOURS, self._config_entry.data.get(CONF_HOURS, DEFAULT_HOURS)
        )
        current_entity = self._config_entry.options.get(
            CONF_DEFAULT_ENTITY, self._config_entry.data.get(CONF_DEFAULT_ENTITY, "")
        )

        schema_fields: dict[Any, Any] = {
            vol.Optional(CONF_TITLE, default=current_title): str,
            vol.Optional(CONF_HOURS, default=current_hours): vol.All(
                vol.Coerce(int), vol.Range(min=24, max=72)
            ),
        }
        if current_entity:
            schema_fields[vol.Optional(CONF_DEFAULT_ENTITY, default=current_entity)] = (
                selector.EntitySelector(selector.EntitySelectorConfig(domain="weather"))
            )
        else:
            schema_fields[vol.Optional(CONF_DEFAULT_ENTITY)] = selector.EntitySelector(
                selector.EntitySelectorConfig(domain="weather")
            )

        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(schema_fields),
        )
