"""Constants for the Weather Graph integration."""
from __future__ import annotations

from typing import Final

DOMAIN: Final[str] = "weather_graph"
BOM_DOMAIN: Final[str] = "bureau_of_meteorology"

URL_BASE: Final[str] = "/weather_graph"
CARD_FILENAME: Final[str] = "weather-graph-card.js"

DEFAULT_HOURS: Final[int] = 48

CARDINAL_TO_DEGREES: Final[dict[str, float]] = {
    "N": 0.0,
    "NNE": 22.5,
    "NE": 45.0,
    "ENE": 67.5,
    "E": 90.0,
    "ESE": 112.5,
    "SE": 135.0,
    "SSE": 157.5,
    "S": 180.0,
    "SSW": 202.5,
    "SW": 225.0,
    "WSW": 247.5,
    "W": 270.0,
    "WNW": 292.5,
    "NW": 315.0,
    "NNW": 337.5,
}

CARDINAL_DIRECTIONS: Final[tuple[str, ...]] = (
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
)

BOM_CONDITION_TO_HA: Final[dict[str | None, str | None]] = {
    "clear": "clear-night",
    "cloudy": "cloudy",
    "cyclone": "exceptional",
    "dust": "fog",
    "dusty": "fog",
    "fog": "fog",
    "frost": "snowy",
    "haze": "fog",
    "hazy": "fog",
    "heavy_shower": "pouring",
    "heavy_showers": "pouring",
    "light_rain": "rainy",
    "light_shower": "rainy",
    "light_showers": "rainy",
    "mostly_sunny": "partlycloudy",
    "partly_cloudy": "partlycloudy",
    "rain": "pouring",
    "shower": "rainy",
    "showers": "rainy",
    "snow": "snowy",
    "storm": "lightning-rainy",
    "storms": "lightning-rainy",
    "sunny": "sunny",
    "tropical_cyclone": "exceptional",
    "wind": "windy",
    "windy": "windy",
    None: None,
}
