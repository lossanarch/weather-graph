"""The Weather Graph integration."""
from __future__ import annotations

import logging
from typing import TYPE_CHECKING

from .const import DOMAIN

if TYPE_CHECKING:
    from homeassistant.config_entries import ConfigEntry
    from homeassistant.core import HomeAssistant
    from homeassistant.helpers.typing import ConfigType

_LOGGER = logging.getLogger(__name__)

try:
    from homeassistant.helpers import config_validation as cv

    CONFIG_SCHEMA = cv.empty_config_schema(DOMAIN)
except ModuleNotFoundError:  # Allows importing pure submodules in lightweight test runners
    CONFIG_SCHEMA = None


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up the Weather Graph component (YAML or pre-entry bootstrap)."""
    from .frontend_registration import async_register_frontend
    from .websocket_api import async_register_websocket_handlers

    hass.data.setdefault(DOMAIN, {})
    await async_register_frontend(hass)
    async_register_websocket_handlers(hass)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Weather Graph from a UI config entry."""
    from .frontend_registration import async_register_frontend
    from .websocket_api import async_register_websocket_handlers

    hass.data.setdefault(DOMAIN, {})
    await async_register_frontend(hass)
    async_register_websocket_handlers(hass)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry; the card resource and WebSocket API stay registered."""
    return True
