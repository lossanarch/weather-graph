"""Unit tests for the Weather Graph Home Assistant integration."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
import json
from pathlib import Path
from types import SimpleNamespace

from custom_components.weather_graph.bom_adapter import (
    build_bom_forecast_payload,
    build_generic_ha_forecast_payload,
    compute_dew_point_c,
    normalize_wind_bearing,
    resolve_bom_entry,
    resolve_hourly_weather_entity_id,
    slugify_name,
)

REPO_ROOT = Path(__file__).resolve().parent.parent
INTEGRATION_DIR = REPO_ROOT / "custom_components" / "weather_graph"


class DummyState:
    def __init__(self, entity_id: str, supported_features: int) -> None:
        self.entity_id = entity_id
        self.attributes = {"supported_features": supported_features}


def _make_mock_bom_collector(flattened: bool = True) -> SimpleNamespace:
    base_utc = datetime(2026, 11, 20, 2, 0, 0, tzinfo=timezone.utc)  # Fri 1pm AEDT
    hourly_rows = []
    for idx in range(52):
        stamp = (base_utc + timedelta(hours=idx)).strftime("%Y-%m-%dT%H:%M:%SZ")
        is_night = 7 <= idx <= 16
        icon = "sunny" if is_night and idx == 10 else ("storm" if idx < 6 else "partly_cloudy")
        if flattened:
            hourly_rows.append(
                {
                    "time": stamp,
                    "temp": 24 if idx == 0 else 20,
                    "temp_feels_like": 25.2,
                    "relative_humidity": 69 if idx == 0 else 75,
                    "rain_chance": 53 if idx == 0 else 20,
                    "rain_amount_min": 0,
                    "rain_amount_max": 2,
                    "wind_speed_kilometre": 15 if idx == 0 else 10,
                    "wind_gust_speed_kilometre": 22,
                    "wind_direction": "N" if idx == 0 else "SSE",
                    "icon_descriptor": icon,
                    "is_night": is_night,
                    "uv": 0 if is_night else 8,
                }
            )
        else:
            hourly_rows.append(
                {
                    "time": stamp,
                    "temp": 24,
                    "temp_feels_like": 25.2,
                    "relative_humidity": 69,
                    "rain": {"amount": {"min": 0, "max": 2, "units": "mm"}, "chance": 53},
                    "wind": {
                        "speed_kilometre": 15,
                        "gust_speed_kilometre": 22,
                        "direction": "N",
                    },
                    "icon_descriptor": icon,
                    "is_night": is_night,
                    "uv": 8,
                }
            )

    daily_rows = [
        {
            "date": "2026-11-19T13:00:00Z",
            **(
                {
                    "astronomical_sunrise_time": "2026-11-19T18:41:00Z",
                    "astronomical_sunset_time": "2026-11-20T08:42:00Z",
                    "uv_start_time": "2026-11-19T22:10:00Z",
                    "uv_end_time": "2026-11-20T05:00:00Z",
                    "uv_max_index": 10,
                }
                if flattened
                else {
                    "astronomical": {
                        "sunrise_time": "2026-11-19T18:41:00Z",
                        "sunset_time": "2026-11-20T08:42:00Z",
                    },
                    "uv": {
                        "start_time": "2026-11-19T22:10:00Z",
                        "end_time": "2026-11-20T05:00:00Z",
                        "max_index": 10,
                    },
                }
            ),
        },
        {"date": "2026-11-20T13:00:00Z", "uv_max_index": 2, "uv_start_time": None},
        {"date": "2026-11-21T13:00:00Z"},
    ]

    observations = {
        "data": {
            "temp": 24.1,
            "temp_feels_like": 25.0,
            "humidity": 69,
            "wind_speed_kilometre": 15,
            "wind_direction": "N",
            "gust_speed_kilometre": 21,
            "rain_since_9am": 1.2,
        }
    }

    return SimpleNamespace(
        locations_data={
            "data": {
                "name": "Carlton North",
                "state": "VIC",
                "timezone": "Australia/Melbourne",
            }
        },
        daily_forecasts_data={"data": daily_rows},
        hourly_forecasts_data={"data": hourly_rows},
        observations_data=observations,
    )


def test_magnus_tetens_dew_point_calculation() -> None:
    # 24°C + 69% RH -> 18.0°C dew point
    dew = compute_dew_point_c(24, 69)
    assert dew == 18.0
    assert round(dew) == 18

    assert compute_dew_point_c(30, 80) == 26.2
    assert compute_dew_point_c(-2, 90) == -3.4
    assert compute_dew_point_c(None, 69) is None
    assert compute_dew_point_c(24, None) is None
    assert compute_dew_point_c(24, 0) is None


def test_normalize_wind_bearing_cardinal_and_numeric() -> None:
    assert normalize_wind_bearing("N") == ("N", 0.0)
    assert normalize_wind_bearing("sse") == ("SSE", 157.5)
    assert normalize_wind_bearing("WNW") == ("WNW", 292.5)
    assert normalize_wind_bearing("calm") == (None, None)
    assert normalize_wind_bearing("unavailable") == (None, None)

    assert normalize_wind_bearing(0) == ("N", 0.0)
    assert normalize_wind_bearing(180) == ("S", 180.0)
    assert normalize_wind_bearing(355) == ("N", 355.0)
    assert normalize_wind_bearing("225") == ("SW", 225.0)


def test_resolve_bom_split_hourly_weather_entity() -> None:
    states = {
        "weather.carlton_north": DummyState("weather.carlton_north", supported_features=1),
        "weather.carlton_north_hourly": DummyState(
            "weather.carlton_north_hourly", supported_features=2
        ),
        "weather.home": DummyState("weather.home", supported_features=3),
    }

    assert (
        resolve_hourly_weather_entity_id(states, "weather.carlton_north")
        == "weather.carlton_north_hourly"
    )
    assert (
        resolve_hourly_weather_entity_id(states, "weather.carlton_north_hourly")
        == "weather.carlton_north_hourly"
    )
    assert resolve_hourly_weather_entity_id(states, "weather.home") == "weather.home"


def test_resolve_bom_entry_by_slug_and_registry() -> None:
    collector = _make_mock_bom_collector()
    bom_data = {
        "entry_abc": {"collector": collector, "coordinator": object()},
    }

    matched = resolve_bom_entry(bom_data, entity_id="weather.carlton_north")
    assert matched is not None
    assert matched[0] == "entry_abc"

    matched_hourly = resolve_bom_entry(bom_data, entity_id="weather.carlton_north_hourly")
    assert matched_hourly is not None
    assert matched_hourly[0] == "entry_abc"

    reg_map = {"weather.custom_melb": "entry_abc"}
    matched_custom = resolve_bom_entry(
        bom_data, entity_id="weather.custom_melb", entity_registry_map=reg_map
    )
    assert matched_custom is not None
    assert matched_custom[0] == "entry_abc"
    assert slugify_name("Carlton North") == "carlton_north"


def test_build_bom_forecast_payload_flattened_and_nested() -> None:
    now_utc = datetime(2026, 11, 20, 2, 15, 0, tzinfo=timezone.utc)

    for flattened in (True, False):
        collector = _make_mock_bom_collector(flattened=flattened)
        payload = build_bom_forecast_payload(
            collector,
            entity_id="weather.carlton_north_hourly",
            max_hours=48,
            now_utc=now_utc,
        )

        assert payload["source"] == "bureau_of_meteorology"
        assert payload["location"]["name"] == "Carlton North"
        assert payload["location"]["timezone"] == "Australia/Melbourne"
        assert len(payload["hourly"]) == 48
        assert len(payload["sun_windows"]) == 1

        first = payload["hourly"][0]
        assert first["temperature"] == 24.0
        assert first["humidity"] == 69.0
        assert first["dew_point"] == 18.0
        assert first["rain_chance"] == 53.0
        assert first["wind_speed_kmh"] == 15.0
        assert first["wind_direction"] == "N"
        assert first["wind_bearing_deg"] == 0.0
        assert first["icon_descriptor"] == "storm"
        assert first["datetime"].endswith("+11:00")

        assert payload["hourly"][10]["is_night"] is True
        assert payload["hourly"][10]["icon_descriptor"] == "clear"

        assert payload["uv_windows"] == [
            {
                "date": "2026-11-20",
                "start": "2026-11-20T09:10:00+11:00",
                "start_ms": int(datetime(2026, 11, 19, 22, 10, tzinfo=timezone.utc).timestamp() * 1000),
                "end": "2026-11-20T16:00:00+11:00",
                "end_ms": int(datetime(2026, 11, 20, 5, 0, tzinfo=timezone.utc).timestamp() * 1000),
                "max_index": 10.0,
            },
            {
                "date": "2026-11-21",
                "start": None,
                "start_ms": None,
                "end": None,
                "end_ms": None,
                "max_index": 2.0,
            },
        ]


def test_build_generic_ha_forecast_payload_unit_conversion() -> None:
    rows = [
        {
            "datetime": "2026-11-20T02:00:00Z",
            "temperature": 75.2,
            "humidity": 69,
            "precipitation_probability": 53,
            "wind_speed": 9.32,
            "wind_bearing": 180,
            "condition": "lightning-rainy",
        }
    ]
    payload = build_generic_ha_forecast_payload(
        rows,
        entity_id="weather.us_station",
        timezone_name="Australia/Sydney",
        temp_unit="°F",
        wind_unit="mph",
    )

    assert payload["source"] == "homeassistant_weather"
    pt = payload["hourly"][0]
    assert pt["temperature"] == 24.0
    assert pt["dew_point"] == 18.0
    assert pt["wind_speed_kmh"] == 15.0
    assert pt["wind_direction"] == "S"
    assert pt["wind_bearing_deg"] == 180.0


def test_hacs_and_manifest_structure() -> None:
    hacs_json = json.loads((REPO_ROOT / "hacs.json").read_text(encoding="utf-8"))
    manifest = json.loads((INTEGRATION_DIR / "manifest.json").read_text(encoding="utf-8"))
    strings = json.loads((INTEGRATION_DIR / "strings.json").read_text(encoding="utf-8"))
    en_trans = json.loads(
        (INTEGRATION_DIR / "translations" / "en.json").read_text(encoding="utf-8")
    )

    assert hacs_json["name"] == "Weather Graph"
    assert manifest["domain"] == "weather_graph"
    assert set(manifest["dependencies"]) >= {"http", "frontend", "lovelace"}
    assert "bureau_of_meteorology" in manifest["after_dependencies"]
    assert strings == en_trans

    bundled_js = INTEGRATION_DIR / "frontend" / "weather-graph-card.js"
    assert bundled_js.is_file()
    assert bundled_js.stat().st_size > 10_000
