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

from .const import CARD_FILENAME, DOMAIN, URL_BASE

_LOGGER = logging.getLogger(__name__)

MANIFEST_PATH = Path(__file__).parent / "manifest.json"
FRONTEND_DIR = Path(__file__).parent / "frontend"

_REGISTERED_KEY = "frontend_registered"


def _read_integration_version() -> str:
    try:
        data = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
        return str(data.get("version", "0"))
    except (OSError, ValueError):
        return "0"


def _extract_path_and_version(resource_url: str) -> tuple[str, str | None]:
    parsed = urlparse(resource_url)
    versions = parse_qs(parsed.query).get("v")
    return parsed.path, (versions[0] if versions else None)


def _get_lovelace_mode_and_resources(hass: HomeAssistant) -> tuple[str | None, Any]:
    """Read the Lovelace resource mode and collection across HA versions.

    HA < 2025.2 stores a dict, 2025.2-2026.1 a LovelaceData with `mode`, and
    2026.2+ renamed that attribute to `resource_mode`.
    """
    lovelace = hass.data.get("lovelace")
    if lovelace is None:
        return None, None
    if isinstance(lovelace, dict):
        return lovelace.get("resource_mode") or lovelace.get("mode"), lovelace.get(
            "resources"
        )
    mode = getattr(lovelace, "resource_mode", None) or getattr(lovelace, "mode", None)
    return mode, getattr(lovelace, "resources", None)


async def _async_ensure_resources_loaded(resources: Any) -> None:
    """Load the resource storage collection, which HA loads lazily."""
    if getattr(resources, "loaded", True):
        return
    ensure_loaded = getattr(resources, "_async_ensure_loaded", None)
    if ensure_loaded is not None:
        await ensure_loaded()
        return
    await resources.async_load()
    resources.loaded = True


async def _async_upsert_lovelace_resource(
    resources: Any, card_path: str, versioned_url: str, version: str
) -> None:
    await _async_ensure_resources_loaded(resources)

    matching = [
        item
        for item in resources.async_items()
        if isinstance(item.get("url"), str)
        and _extract_path_and_version(item["url"])[0] == card_path
    ]

    if not matching:
        await resources.async_create_item({"res_type": "module", "url": versioned_url})
        _LOGGER.info("Registered Lovelace resource %s", versioned_url)
        return

    first, *duplicates = matching
    if _extract_path_and_version(first["url"])[1] != version or first.get("type") != "module":
        await resources.async_update_item(
            first["id"], {"res_type": "module", "url": versioned_url}
        )
        _LOGGER.info("Updated Lovelace resource %s to v%s", card_path, version)
    for item in duplicates:
        await resources.async_delete_item(item["id"])
        _LOGGER.info("Removed duplicate Lovelace resource %s", item["url"])


async def async_register_frontend(hass: HomeAssistant) -> None:
    """Serve the bundled card JS and register it as a Lovelace module resource."""
    domain_data = hass.data.setdefault(DOMAIN, {})
    if domain_data.get(_REGISTERED_KEY):
        return
    domain_data[_REGISTERED_KEY] = True

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
    if mode == "storage" and resources is not None:
        try:
            await _async_upsert_lovelace_resource(
                resources, card_path, versioned_url, version
            )
            return
        except Exception:  # noqa: BLE001
            _LOGGER.exception(
                "Could not register Lovelace resource %s; loading it as an extra module",
                versioned_url,
            )
    else:
        _LOGGER.info(
            "Lovelace resources are in %s mode; loading %s as an extra module. "
            "You can also add it under your Lovelace resources as a JavaScript module",
            mode or "unknown",
            versioned_url,
        )

    add_extra_js_url(hass, versioned_url)
