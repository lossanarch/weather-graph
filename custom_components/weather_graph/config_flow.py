"""Config flow for the Weather Graph integration."""
from __future__ import annotations

from typing import Any

from homeassistant import config_entries

from .const import DOMAIN


class WeatherGraphConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """One-step confirmation; all display settings live on each card."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> config_entries.ConfigFlowResult:
        """Confirm adding the integration."""
        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()

        if user_input is not None:
            return self.async_create_entry(title="Weather Graph", data={})

        return self.async_show_form(step_id="user")
