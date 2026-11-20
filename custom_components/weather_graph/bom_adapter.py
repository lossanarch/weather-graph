"""Adapter utilities for Bureau of Meteorology (PyBoM) and generic HA weather forecasts."""
from __future__ import annotations

from collections.abc import Iterable, Mapping
from datetime import datetime, timedelta, timezone
import math
import re
from typing import Any
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from .const import (
    BOM_CONDITION_TO_HA,
    CARDINAL_DIRECTIONS,
    CARDINAL_TO_DEGREES,
)


def slugify_name(value: str) -> str:
    """Convert a location or entity name to a Home Assistant style slug."""
    cleaned = re.sub(r"[^a-z0-9]+", "_", value.strip().lower())
    return cleaned.strip("_")


def compute_dew_point_c(
    temp_c: float | int | None,
    rel_humidity: float | int | None,
) -> float | None:
    """Compute dew point in Celsius via the Magnus-Tetens formula used by BOM."""
    if temp_c is None or rel_humidity is None:
        return None
    try:
        t = float(temp_c)
        rh = float(rel_humidity)
    except (TypeError, ValueError):
        return None

    if math.isnan(t) or math.isnan(rh) or rh <= 0:
        return None

    clamped_rh = max(1.0, min(100.0, rh))
    a = 17.27
    b = 237.7
    gamma = ((a * t) / (b + t)) + math.log(clamped_rh / 100.0)
    denom = a - gamma
    if abs(denom) < 1e-9:
        return None
    return round((b * gamma) / denom, 1)


def normalize_wind_bearing(
    raw_bearing: str | int | float | None,
) -> tuple[str | None, float | None]:
    """Normalize either a 16-point cardinal string or numeric bearing to (cardinal, degrees)."""
    if raw_bearing is None:
        return None, None

    if isinstance(raw_bearing, (int, float)) and not isinstance(raw_bearing, bool):
        if math.isnan(float(raw_bearing)):
            return None, None
        deg = float(raw_bearing) % 360.0
        idx = int((deg + 11.25) // 22.5) % 16
        return CARDINAL_DIRECTIONS[idx], round(deg, 1)

    if isinstance(raw_bearing, str):
        token = raw_bearing.strip().upper()
        if not token or token in {"UNAVAILABLE", "UNKNOWN", "NONE", "CALM"}:
            return None, None
        if token in CARDINAL_TO_DEGREES:
            return token, CARDINAL_TO_DEGREES[token]
        try:
            numeric = float(token)
        except ValueError:
            return None, None
        return normalize_wind_bearing(numeric)

    return None, None


def _safe_float(value: Any) -> float | None:
    """Convert numeric values while ignoring 'unavailable' or None."""
    if value is None or isinstance(value, bool):
        return None
    try:
        result = float(value)
    except (TypeError, ValueError):
        return None
    return None if math.isnan(result) else result


def _parse_iso_datetime(value: str | None, default_tz: ZoneInfo) -> datetime | None:
    """Parse ISO 8601 strings (handling trailing Z and naive local timestamps)."""
    if not value or not isinstance(value, str):
        return None
    normalized = value.strip()
    if normalized.endswith("Z"):
        normalized = normalized[:-1] + "+00:00"
    try:
        dt = datetime.fromisoformat(normalized)
    except ValueError:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=default_tz)
    return dt.astimezone(default_tz)


def _get_zoneinfo(tz_name: str | None) -> ZoneInfo:
    """Resolve an IANA timezone with safe UTC fallback."""
    if tz_name:
        try:
            return ZoneInfo(tz_name)
        except ZoneInfoNotFoundError:
            pass
    return ZoneInfo("UTC")


def resolve_hourly_weather_entity_id(
    available_states: Mapping[str, Any] | Iterable[str],
    entity_id: str,
) -> str:
    """Resolve BOM split daily/hourly entities (`weather.foo` -> `weather.foo_hourly`)."""
    if not entity_id:
        return entity_id

    hourly_candidate = (
        entity_id if entity_id.endswith("_hourly") else f"{entity_id}_hourly"
    )

    if isinstance(available_states, Mapping):
        state_obj = available_states.get(entity_id)
        supported = 0
        if state_obj is not None:
            attrs = getattr(state_obj, "attributes", None)
            if isinstance(attrs, Mapping):
                supported = int(attrs.get("supported_features", 0) or 0)
            elif isinstance(state_obj, Mapping):
                supported = int(
                    state_obj.get("attributes", {}).get("supported_features", 0) or 0
                )
        # WeatherEntityFeature.FORECAST_HOURLY == 2
        if (supported & 2) != 0:
            return entity_id
        if hourly_candidate in available_states:
            return hourly_candidate
        return entity_id

    state_set = set(available_states)
    if hourly_candidate in state_set and not entity_id.endswith("_hourly"):
        return hourly_candidate
    return entity_id


def resolve_bom_entry(
    bom_domain_data: Mapping[str, Any] | None,
    entity_id: str | None = None,
    entry_id: str | None = None,
    entity_registry_map: Mapping[str, str] | None = None,
) -> tuple[str, Mapping[str, Any]] | None:
    """Find the matching `bureau_of_meteorology` runtime entry for an entity or entry_id."""
    if not bom_domain_data or not isinstance(bom_domain_data, Mapping):
        return None

    valid_entries = {
        k: v
        for k, v in bom_domain_data.items()
        if isinstance(v, Mapping) and "collector" in v
    }
    if not valid_entries:
        return None

    if entry_id and entry_id in valid_entries:
        return entry_id, valid_entries[entry_id]

    if entity_id and entity_registry_map:
        base_entity = (
            entity_id[:-7] if entity_id.endswith("_hourly") else entity_id
        )
        for candidate in (entity_id, f"{base_entity}_hourly", base_entity):
            mapped_entry_id = entity_registry_map.get(candidate)
            if mapped_entry_id and mapped_entry_id in valid_entries:
                return mapped_entry_id, valid_entries[mapped_entry_id]

    if entity_id:
        target_slug = entity_id.removeprefix("weather.").removesuffix("_hourly").lower()
        for cand_entry_id, entry_data in valid_entries.items():
            collector = entry_data.get("collector")
            loc_data = (getattr(collector, "locations_data", None) or {}).get("data") or {}
            loc_name = loc_data.get("name")
            if isinstance(loc_name, str) and slugify_name(loc_name) == target_slug:
                return cand_entry_id, entry_data

    if entity_id is None and len(valid_entries) == 1:
        only_id = next(iter(valid_entries))
        return only_id, valid_entries[only_id]

    return None


def _extract_nested_or_flat(row: Mapping[str, Any], flat_key: str, group: str, subkey: str) -> Any:
    """Read a field whether `PyBoM.Collector` has flattened nested dicts or not."""
    if flat_key in row:
        return row.get(flat_key)
    nested = row.get(group)
    if isinstance(nested, Mapping):
        if subkey in nested:
            return nested.get(subkey)
        amount = nested.get("amount")
        if isinstance(amount, Mapping) and subkey in amount:
            return amount.get(subkey)
    return None


def build_bom_forecast_payload(
    collector: Any,
    *,
    entity_id: str | None = None,
    max_hours: int = 48,
    now_utc: datetime | None = None,
) -> dict[str, Any]:
    """Build an enriched 48-hour forecast graph payload from a BOM Collector."""
    now_ref = now_utc or datetime.now(timezone.utc)
    if now_ref.tzinfo is None:
        now_ref = now_ref.replace(tzinfo=timezone.utc)

    locations_raw = (getattr(collector, "locations_data", None) or {}).get("data") or {}
    tz_name = locations_raw.get("timezone") or "Australia/Sydney"
    tz = _get_zoneinfo(tz_name)
    location_name = locations_raw.get("name") or "BOM Forecast"
    location_state = locations_raw.get("state")

    sun_windows: list[dict[str, Any]] = []
    uv_windows: list[dict[str, Any]] = []
    daily_raw = (getattr(collector, "daily_forecasts_data", None) or {}).get("data") or []
    for day_row in daily_raw:
        if not isinstance(day_row, Mapping):
            continue
        sunrise_str = _extract_nested_or_flat(
            day_row, "astronomical_sunrise_time", "astronomical", "sunrise_time"
        )
        sunset_str = _extract_nested_or_flat(
            day_row, "astronomical_sunset_time", "astronomical", "sunset_time"
        )
        sunrise_dt = _parse_iso_datetime(sunrise_str, tz)
        sunset_dt = _parse_iso_datetime(sunset_str, tz)
        if sunrise_dt or sunset_dt:
            sun_windows.append(
                {
                    "sunrise": sunrise_dt.isoformat() if sunrise_dt else None,
                    "sunrise_ms": int(sunrise_dt.timestamp() * 1000) if sunrise_dt else None,
                    "sunset": sunset_dt.isoformat() if sunset_dt else None,
                    "sunset_ms": int(sunset_dt.timestamp() * 1000) if sunset_dt else None,
                }
            )
        uv_window = _build_uv_window(day_row, tz)
        if uv_window:
            uv_windows.append(uv_window)

    obs_raw = (getattr(collector, "observations_data", None) or {}).get("data") or {}
    current_obs: dict[str, Any] | None = None
    if isinstance(obs_raw, Mapping) and obs_raw:
        obs_temp = _safe_float(obs_raw.get("temp"))
        obs_hum = _safe_float(obs_raw.get("humidity"))
        obs_wind_speed = _safe_float(
            _extract_nested_or_flat(obs_raw, "wind_speed_kilometre", "wind", "speed_kilometre")
        )
        obs_wind_dir_raw = _extract_nested_or_flat(
            obs_raw, "wind_direction", "wind", "direction"
        )
        obs_cardinal, obs_deg = normalize_wind_bearing(obs_wind_dir_raw)
        obs_gust = _safe_float(
            _extract_nested_or_flat(obs_raw, "gust_speed_kilometre", "gust", "speed_kilometre")
        )
        current_obs = {
            "temperature": obs_temp,
            "feels_like": _safe_float(obs_raw.get("temp_feels_like")),
            "humidity": obs_hum,
            "dew_point": compute_dew_point_c(obs_temp, obs_hum),
            "wind_speed_kmh": obs_wind_speed,
            "wind_gust_kmh": obs_gust,
            "wind_direction": obs_cardinal,
            "wind_bearing_deg": obs_deg,
            "rain_since_9am_mm": _safe_float(obs_raw.get("rain_since_9am")),
        }

    hourly_raw = (getattr(collector, "hourly_forecasts_data", None) or {}).get("data") or []
    hours: list[dict[str, Any]] = []
    limit = max(1, min(72, int(max_hours)))

    for row in hourly_raw:
        if not isinstance(row, Mapping):
            continue
        dt_local = _parse_iso_datetime(row.get("time"), tz)
        if dt_local is None:
            continue

        if dt_local + timedelta(hours=1) <= now_ref.astimezone(tz):
            continue

        temp = _safe_float(row.get("temp"))
        feels_like = _safe_float(row.get("temp_feels_like"))
        humidity = _safe_float(row.get("relative_humidity"))
        rain_chance = _safe_float(
            _extract_nested_or_flat(row, "rain_chance", "rain", "chance")
        )
        rain_min = _safe_float(
            _extract_nested_or_flat(row, "rain_amount_min", "rain", "min")
        )
        rain_max = _safe_float(
            _extract_nested_or_flat(row, "rain_amount_max", "rain", "max")
        )
        if rain_max is None:
            rain_max = rain_min

        wind_speed = _safe_float(
            _extract_nested_or_flat(row, "wind_speed_kilometre", "wind", "speed_kilometre")
        )
        wind_gust = _safe_float(
            _extract_nested_or_flat(
                row, "wind_gust_speed_kilometre", "wind", "gust_speed_kilometre"
            )
        )
        wind_dir_raw = _extract_nested_or_flat(
            row, "wind_direction", "wind", "direction"
        )
        wind_cardinal, wind_deg = normalize_wind_bearing(wind_dir_raw)

        is_night = bool(row.get("is_night", False))
        icon_descriptor = row.get("icon_descriptor")
        if is_night and icon_descriptor in {"sunny", "mostly_sunny"}:
            icon_descriptor = "clear"
        elif not is_night and icon_descriptor == "clear":
            icon_descriptor = "sunny"

        condition = BOM_CONDITION_TO_HA.get(icon_descriptor) or "partlycloudy"

        hours.append(
            {
                "datetime": dt_local.isoformat(),
                "epoch_ms": int(dt_local.timestamp() * 1000),
                "temperature": temp,
                "feels_like": feels_like,
                "humidity": humidity,
                "dew_point": compute_dew_point_c(temp, humidity),
                "rain_chance": rain_chance if rain_chance is not None else 0.0,
                "rain_min_mm": rain_min,
                "rain_max_mm": rain_max,
                "wind_speed_kmh": wind_speed if wind_speed is not None else 0.0,
                "wind_gust_kmh": wind_gust,
                "wind_direction": wind_cardinal,
                "wind_bearing_deg": wind_deg,
                "icon_descriptor": icon_descriptor,
                "condition": condition,
                "is_night": is_night,
                "uv_index": _safe_float(row.get("uv")),
            }
        )
        if len(hours) >= limit:
            break

    return {
        "source": "bureau_of_meteorology",
        "entity_id": entity_id,
        "location": {
            "name": location_name,
            "state": location_state,
            "timezone": tz_name,
        },
        "units": {
            "temperature": "°C",
            "wind_speed": "km/h",
            "precipitation": "mm",
        },
        "current": current_obs,
        "sun_windows": sun_windows,
        "uv_windows": uv_windows,
        "hourly": hours,
    }


def _build_uv_window(day_row: Mapping[str, Any], tz: ZoneInfo) -> dict[str, Any] | None:
    """Sun protection times for one BOM daily row (the `uv_start_time_0` style sensors).

    BOM omits the times on days when the UV index stays below 3, so a row with a
    max index but no times means no protection is needed rather than missing data.
    """
    start_dt = _parse_iso_datetime(
        _extract_nested_or_flat(day_row, "uv_start_time", "uv", "start_time"), tz
    )
    end_dt = _parse_iso_datetime(
        _extract_nested_or_flat(day_row, "uv_end_time", "uv", "end_time"), tz
    )
    max_index = _safe_float(_extract_nested_or_flat(day_row, "uv_max_index", "uv", "max_index"))
    day_dt = _parse_iso_datetime(day_row.get("date"), tz) or start_dt
    if day_dt is None or (start_dt is None and end_dt is None and max_index is None):
        return None
    return {
        "date": day_dt.date().isoformat(),
        "start": start_dt.isoformat() if start_dt else None,
        "start_ms": int(start_dt.timestamp() * 1000) if start_dt else None,
        "end": end_dt.isoformat() if end_dt else None,
        "end_ms": int(end_dt.timestamp() * 1000) if end_dt else None,
        "max_index": max_index,
    }


def _convert_temp_to_celsius(value: float | None, unit: str | None) -> float | None:
    if value is None:
        return None
    if unit and "F" in unit.upper():
        return round((value - 32.0) * (5.0 / 9.0), 1)
    return round(value, 1)


def _convert_speed_to_kmh(value: float | None, unit: str | None) -> float | None:
    if value is None:
        return None
    if not unit:
        return round(value, 1)
    u = unit.strip().lower()
    if u in {"mph", "mi/h"}:
        return round(value * 1.60934, 1)
    if u in {"m/s", "mps"}:
        return round(value * 3.6, 1)
    if u in {"kn", "kt", "knots"}:
        return round(value * 1.852, 1)
    return round(value, 1)


def build_generic_ha_forecast_payload(
    forecast_rows: Iterable[Mapping[str, Any]],
    *,
    entity_id: str,
    timezone_name: str = "UTC",
    friendly_name: str | None = None,
    temp_unit: str | None = "°C",
    wind_unit: str | None = "km/h",
    state_attributes: Mapping[str, Any] | None = None,
    sun_windows: list[dict[str, Any]] | None = None,
    max_hours: int = 48,
) -> dict[str, Any]:
    """Normalize standard Home Assistant `Forecast` dicts into the weather graph schema."""
    tz = _get_zoneinfo(timezone_name)
    limit = max(1, min(72, int(max_hours)))
    windows = sun_windows or []

    def _is_night_at(dt_val: datetime) -> bool:
        epoch_ms = int(dt_val.timestamp() * 1000)
        for win in windows:
            sr = win.get("sunrise_ms")
            ss = win.get("sunset_ms")
            if sr is not None and ss is not None and sr < ss:
                if sr <= epoch_ms < ss:
                    return False
        hour_local = dt_val.hour + (dt_val.minute / 60.0)
        return hour_local < 6.0 or hour_local >= 18.5

    hours: list[dict[str, Any]] = []
    for row in forecast_rows:
        if not isinstance(row, Mapping):
            continue
        dt_local = _parse_iso_datetime(row.get("datetime"), tz)
        if dt_local is None:
            continue

        raw_temp = _safe_float(
            row.get("temperature", row.get("native_temperature"))
        )
        temp_c = _convert_temp_to_celsius(raw_temp, temp_unit)

        raw_apparent = _safe_float(
            row.get("apparent_temperature", row.get("native_apparent_temperature"))
        )
        feels_c = _convert_temp_to_celsius(raw_apparent, temp_unit)

        humidity = _safe_float(row.get("humidity"))
        raw_dew = _safe_float(row.get("dew_point", row.get("native_dew_point")))
        dew_c = (
            _convert_temp_to_celsius(raw_dew, temp_unit)
            if raw_dew is not None
            else compute_dew_point_c(temp_c, humidity)
        )

        rain_chance = _safe_float(row.get("precipitation_probability"))
        precip_mm = _safe_float(
            row.get("precipitation", row.get("native_precipitation"))
        )

        raw_wind = _safe_float(row.get("wind_speed", row.get("native_wind_speed")))
        wind_kmh = _convert_speed_to_kmh(raw_wind, wind_unit)
        raw_gust = _safe_float(
            row.get("wind_gust_speed", row.get("native_wind_gust_speed"))
        )
        gust_kmh = _convert_speed_to_kmh(raw_gust, wind_unit)

        wind_cardinal, wind_deg = normalize_wind_bearing(row.get("wind_bearing"))
        condition = str(row.get("condition") or "partlycloudy")
        is_night = condition == "clear-night" or _is_night_at(dt_local)

        hours.append(
            {
                "datetime": dt_local.isoformat(),
                "epoch_ms": int(dt_local.timestamp() * 1000),
                "temperature": temp_c,
                "feels_like": feels_c,
                "humidity": humidity,
                "dew_point": dew_c,
                "rain_chance": rain_chance if rain_chance is not None else 0.0,
                "rain_min_mm": None,
                "rain_max_mm": precip_mm,
                "wind_speed_kmh": wind_kmh if wind_kmh is not None else 0.0,
                "wind_gust_kmh": gust_kmh,
                "wind_direction": wind_cardinal,
                "wind_bearing_deg": wind_deg,
                "icon_descriptor": None,
                "condition": condition,
                "is_night": is_night,
                "uv_index": _safe_float(row.get("uv_index")),
            }
        )
        if len(hours) >= limit:
            break

    current_obs: dict[str, Any] | None = None
    if state_attributes:
        cur_temp = _convert_temp_to_celsius(
            _safe_float(state_attributes.get("temperature")), temp_unit
        )
        cur_hum = _safe_float(state_attributes.get("humidity"))
        cur_dew_raw = _safe_float(state_attributes.get("dew_point"))
        cur_dew = (
            _convert_temp_to_celsius(cur_dew_raw, temp_unit)
            if cur_dew_raw is not None
            else compute_dew_point_c(cur_temp, cur_hum)
        )
        cur_wind = _convert_speed_to_kmh(
            _safe_float(state_attributes.get("wind_speed")), wind_unit
        )
        cur_card, cur_deg = normalize_wind_bearing(state_attributes.get("wind_bearing"))
        current_obs = {
            "temperature": cur_temp,
            "feels_like": _convert_temp_to_celsius(
                _safe_float(state_attributes.get("apparent_temperature")), temp_unit
            ),
            "humidity": cur_hum,
            "dew_point": cur_dew,
            "wind_speed_kmh": cur_wind,
            "wind_gust_kmh": _convert_speed_to_kmh(
                _safe_float(state_attributes.get("wind_gust_speed")), wind_unit
            ),
            "wind_direction": cur_card,
            "wind_bearing_deg": cur_deg,
            "rain_since_9am_mm": None,
        }

    return {
        "source": "homeassistant_weather",
        "entity_id": entity_id,
        "location": {
            "name": friendly_name or entity_id,
            "state": None,
            "timezone": timezone_name,
        },
        "units": {
            "temperature": "°C",
            "wind_speed": "km/h",
            "precipitation": "mm",
        },
        "current": current_obs,
        "sun_windows": windows,
        "hourly": hours,
    }
