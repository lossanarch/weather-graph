"""Auto-register the bundled Lovelace custom card in Home Assistant."""
from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any
from urllib.parse import parse_qs, urlparse

from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant
from homeassistant.helpers.event import async_call_later

from .const import CARD_FILENAME, URL_BASE

_LOGGER = logging.getLogger(__name__)

MANIFEST_PATH = Path(__file__).parent / "manifest.json"
FRONTEND_DIR = Path(__file__).parent / "frontend"


def _read_integration_version() -> str:
    try:
        data = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
        return str(data.get("version", "1.0.0"))
    except (OSError, ValueError):
        return "1.0.0"


def _extract_path_and_version(resource_url: str) -> tuple[str, str | None]:
    parsed = urlparse(resource_url)
    versions = parse_qs(parsed.query).get("v")
    return parsed.path, (versions[0] if versions else None)


def _get_lovelace_mode_and_resources(hass: HomeAssistant) -> tuple[str | None, Any]:
    """Support both HA 2026+ LovelaceData attributes and legacy dict access."""
    lovelace = hass.data.get("lovelace")
    if lovelace is None:
        return None, None
    if isinstance(lovelace, dict):
        return lovelace.get("mode"), lovelace.get("resources")
    return getattr(lovelace, "mode", None), getattr(lovelace, "resources", None)


async def async_register_frontend(hass: HomeAssistant) -> None:
    """Serve the bundled card JS and register it as a Lovelace module resource."""
    version = await hass.async_add_executor_job(_read_integration_version)
    card_path = f"{URL_BASE}/{CARD_FILENAME}"
    versioned_url = f"{card_path}?v={version}"

    try:
        await hass.http.async_register_static_paths(
            [StaticPathConfig(URL_BASE, str(FRONTEND_DIR), False)]
        )
        _LOGGER.debug("Registered static path %s -> %s", URL_BASE, FRONTEND_DIR)
    except RuntimeError:
        _LOGGER.debug("Static path %s already registered", URL_BASE)

    mode, resources = _get_lovelace_mode_and_resources(hass)
    if mode != "storage" or resources is None:
        add_extra_js_url(hass, versioned_url)
        _LOGGER.debug("Registered extra JS URL for YAML Lovelace mode: %s", versioned_url)
        return

    async def _ensure_lovelace_resource(_now: Any = None) -> None:
        if not getattr(resources, "loaded", True):
            async_call_later(hass, 3, _ensure_lovelace_resource)
            return

        existing = [
            item
            for item in resources.async_items()
            if isinstance(item.get("url"), str) and item["url"].startswith(URL_BASE)
        ]

        for item in existing:
            path, item_ver = _extract_path_and_version(item["url"])
            if path == card_path:
                if item_ver != version:
                    await resources.async_update_item(
                        item["id"],
                        {"res_type": "module", "url": versioned_url},
                    )
                    _LOGGER.info("Updated Lovelace resource %s to v%s", card_path, version)
                return

        await resources.async_create_item(
            {"res_type": "module", "url": versioned_url}
        )
        _LOGGER.info("Registered Lovelace resource %s", versioned_url)

    await _ensure_lovelace_resource()
