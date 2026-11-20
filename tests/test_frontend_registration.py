"""Tests for Lovelace resource auto-registration of the bundled card."""
from __future__ import annotations

from dataclasses import dataclass
import importlib
import sys
import types
from typing import Any

import pytest


def _install_homeassistant_stubs() -> list[str]:
    """Provide the few Home Assistant symbols the module imports."""
    extra_js_urls: list[str] = []

    @dataclass
    class StaticPathConfig:
        url_path: str
        path: str
        cache_headers: bool = True

    modules = {
        "homeassistant": types.ModuleType("homeassistant"),
        "homeassistant.components": types.ModuleType("homeassistant.components"),
        "homeassistant.components.frontend": types.ModuleType(
            "homeassistant.components.frontend"
        ),
        "homeassistant.components.http": types.ModuleType("homeassistant.components.http"),
        "homeassistant.core": types.ModuleType("homeassistant.core"),
    }
    modules["homeassistant.components.frontend"].add_extra_js_url = (
        lambda hass, url, es5=False: extra_js_urls.append(url)
    )
    modules["homeassistant.components.http"].StaticPathConfig = StaticPathConfig
    modules["homeassistant.core"].HomeAssistant = object
    for name, module in modules.items():
        sys.modules.setdefault(name, module)
    return extra_js_urls


EXTRA_JS_URLS = _install_homeassistant_stubs()
registration = importlib.import_module(
    "custom_components.weather_graph.frontend_registration"
)
CARD_PATH = "/weather_graph/weather-graph-card.js"


class FakeResources:
    """Mimics HA's lazily loaded ResourceStorageCollection."""

    def __init__(self, stored: list[dict[str, Any]] | None = None) -> None:
        self.loaded = False
        self._stored = stored or []
        self.items: dict[str, dict[str, Any]] = {}

    async def _async_ensure_loaded(self) -> None:
        if not self.loaded:
            self.items = {item["id"]: dict(item) for item in self._stored}
            self.loaded = True

    def async_items(self) -> list[dict[str, Any]]:
        return list(self.items.values())

    async def async_create_item(self, data: dict[str, Any]) -> dict[str, Any]:
        assert self.loaded
        item = {"id": f"id{len(self.items) + 1}", "type": data["res_type"], "url": data["url"]}
        self.items[item["id"]] = item
        return item

    async def async_update_item(self, item_id: str, data: dict[str, Any]) -> dict[str, Any]:
        self.items[item_id].update({"type": data["res_type"], "url": data["url"]})
        return self.items[item_id]

    async def async_delete_item(self, item_id: str) -> None:
        del self.items[item_id]


@dataclass
class LovelaceData2026:
    resource_mode: str
    resources: Any


@dataclass
class LovelaceData2025:
    mode: str
    resources: Any


class FakeHttp:
    def __init__(self) -> None:
        self.static_paths: list[Any] = []

    async def async_register_static_paths(self, configs: list[Any]) -> None:
        self.static_paths.extend(configs)


class FakeHass:
    def __init__(self, lovelace: Any) -> None:
        self.data: dict[str, Any] = {"lovelace": lovelace}
        self.http = FakeHttp()

    async def async_add_executor_job(self, func: Any, *args: Any) -> Any:
        return func(*args)


@pytest.fixture(autouse=True)
def _reset_extra_js() -> None:
    EXTRA_JS_URLS.clear()


def _version() -> str:
    return registration._read_integration_version()


@pytest.mark.parametrize(
    "lovelace_factory",
    [
        lambda res: LovelaceData2026(resource_mode="storage", resources=res),
        lambda res: LovelaceData2025(mode="storage", resources=res),
        lambda res: {"mode": "storage", "resources": res},
    ],
)
async def test_registers_module_resource_in_storage_mode(lovelace_factory: Any) -> None:
    resources = FakeResources()
    hass = FakeHass(lovelace_factory(resources))

    await registration.async_register_frontend(hass)

    assert resources.async_items() == [
        {"id": "id1", "type": "module", "url": f"{CARD_PATH}?v={_version()}"}
    ]
    assert EXTRA_JS_URLS == []
    assert hass.http.static_paths[0].url_path == "/weather_graph"


async def test_updates_stale_version_and_removes_duplicates() -> None:
    resources = FakeResources(
        [
            {"id": "a", "type": "module", "url": f"{CARD_PATH}?v=1.0.0"},
            {"id": "b", "type": "js", "url": CARD_PATH},
            {"id": "c", "type": "module", "url": "/local/other-card.js"},
        ]
    )
    hass = FakeHass(LovelaceData2026(resource_mode="storage", resources=resources))

    await registration.async_register_frontend(hass)

    assert resources.async_items() == [
        {"id": "a", "type": "module", "url": f"{CARD_PATH}?v={_version()}"},
        {"id": "c", "type": "module", "url": "/local/other-card.js"},
    ]


async def test_registers_once_per_hass() -> None:
    resources = FakeResources()
    hass = FakeHass(LovelaceData2026(resource_mode="storage", resources=resources))

    await registration.async_register_frontend(hass)
    await registration.async_register_frontend(hass)

    assert len(resources.async_items()) == 1
    assert len(hass.http.static_paths) == 1


async def test_yaml_mode_falls_back_to_extra_module() -> None:
    hass = FakeHass(LovelaceData2026(resource_mode="yaml", resources=FakeResources()))

    await registration.async_register_frontend(hass)

    assert EXTRA_JS_URLS == [f"{CARD_PATH}?v={_version()}"]
