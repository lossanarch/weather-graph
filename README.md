# Weather Graph (`weather-graph`)

Home Assistant **HACS Custom Integration** (`weather_graph`) and auto-registered Lovelace custom card (`custom:weather-graph-card`) for graphing 48-hour weather forecasts.

Designed to pair natively with the Australian [**Bureau of Meteorology (`bremor/bureau_of_meteorology`)**](https://github.com/bremor/bureau_of_meteorology) HACS integration as its primary backend, while also supporting any standard Home Assistant hourly `weather.*` entity as a universal fallback.

---

## Features

- **Next 48 Hours Interactive Forecast Layout**:
  - **Selected-Hour Summary Panel**: Weather condition icon, temperature (`°C`), day/hour label (`FRI 1PM`), rain probability (`53%`), and up to three fields of your choice: wind, wind gust, humidity, dew point, feels like, UV index, or rain amount. On narrow cards the fields wrap underneath and the time and rain spread across the row.
  - **Interactive 48-Hour Scrubber & Horizontal Scroll**: Click, drag, or use Left/Right arrow keys to move the vertical dashed cursor across any of the 48 hours while keeping the left `°C` and right `km/h` scales pinned in view.
  - **Day/Night Vertical Shading & 3-Hourly Condition Strip**: Daytime and nighttime background bands aligned to astronomical sunrise/sunset times, with 3-hourly condition icons and 1-hourly tick marks.
  - **Three Toggleable Data Layers**:
    - **Temperature**: Smooth monotone cubic spline curve (left `°C` scale).
    - **Chance Rain**: Smooth monotone cubic filled area (`0–100%` plot height).
    - **Wind**: Wind speed curve + hourly directional wind-flow vector arrows (right `km/h` scale).
    - Hiding temperature or wind hands that axis to the rain `%` scale.
- **Colour Palettes**: Five built-in palettes (Dusk, Midnight, Forest, Ember, Daylight), each with six editable colours and a one-click revert. Paste a palette from any generator, then drag swatches to swap colours.
- **Zero Manual Resource Setup**: Serves the bundled ES module via Home Assistant's async static HTTP API and automatically registers it in Lovelace resources (falls back to a frontend extra module when resources are managed in YAML).

---

## BOM Backend Integration Details (`bremor/bureau_of_meteorology`)

When `bremor/bureau_of_meteorology` is installed, `weather_graph` hooks directly into its `BomDataUpdateCoordinator` and `PyBoM.Collector` (making **zero extra HTTP calls** to BOM's servers) to handle BOM-specific behavior automatically:

1. **Automatic Split-Entity Resolution**: BOM creates two separate entities per location (`weather.<location>` for daily only and `weather.<location>_hourly` for hourly only). Selecting either entity automatically resolves to the hourly feed.
2. **Hourly Dew Point Calculation**: BOM's hourly forecast API omits `dew_point`. Both the backend WebSocket adapter and client fallback compute hourly dew point from `temp` and `relative_humidity` using the same Magnus-Tetens formula (`a = 17.27, b = 237.7`) used by BOM's observation sensors.
3. **16-Point Cardinal Wind Normalization**: BOM emits ordinal compass strings (`"N"`, `"SSE"`, `"WNW"`) for `wind_bearing` instead of numeric degrees. These are normalized bidirectionally to render rotated meteorological wind-flow arrows and header text.
4. **Granular BOM Icons & Astronomical Sun Windows**: Reads BOM's 19 native `icon_descriptor` values, `is_night` flags, and daily `astronomical_sunrise_time` / `astronomical_sunset_time` directly from `hass.data["bureau_of_meteorology"]`.

---

## Installation in Home Assistant (HACS)

1. Install and configure [**Bureau of Meteorology**](https://github.com/bremor/bureau_of_meteorology) from HACS (optional if using another hourly Home Assistant weather integration).
2. In Home Assistant, open **HACS** -> top-right menu -> **Custom repositories**.
3. Add `https://github.com/lossanarch/weather-graph` with category **Integration**, then click **Download**.
4. **Restart Home Assistant**.
5. Go to **Settings -> Devices & Services -> + Add Integration** and add **Weather Graph**. There is nothing to fill in; the integration serves the card and streams BOM data to it, and every display setting lives on the card.
6. Edit any Dashboard -> **Add Card** -> choose **Weather Graph** from the visual card picker.

If a dashboard shows `Custom element doesn't exist: weather-graph-card`, check **Settings -> Dashboards -> top-right menu -> Resources** for `/weather_graph/weather-graph-card.js?v=<version>` as a **JavaScript module**. The integration adds it on startup; if it is missing, add it there manually and reload the page.

---

## Card Configuration

All options can be configured in the **Lovelace Visual Card Editor** or via YAML:

```yaml
type: custom:weather-graph-card
entity: weather.sydney_hourly
title: Next 48 Hours
hours_to_show: 48
visible_hours: 24
show_temperature: true
show_rain: true
show_wind: true
show_location: false
metrics:            # up to 3: wind, wind_gust, humidity, dew_point, feels_like, uv, rain_amount
  - wind
  - humidity
  - dew_point
palette: dusk       # dusk (default), midnight, forest, ember, daylight
colors:             # optional overrides on top of the palette
  rain: "#59c3c3"
```

`colors` accepts `background`, `daytime`, `temperature`, `rain`, `wind` and `text` as hex values. Other shades (panels, night shading, grid lines) are derived from these, so light backgrounds work too.

### Paste a Palette

The **Paste a Palette** box under the colour swatches in the visual editor accepts any of these (Ctrl/⌘+Enter applies):

| Format | Example |
| --- | --- |
| CSV | `c7eae4,a7e8bd,fcbcb8,efa7a7,ffd972` |
| CSV with `#` | `#c7eae4, #a7e8bd, #fcbcb8, #efa7a7, #ffd972` |
| JSON array | `["c7eae4","a7e8bd","fcbcb8","efa7a7","ffd972"]` |
| JSON object, keyed by slot | `{"background":"264653","rain":"2a9d8f"}` |
| JSON object, keyed by colour names | `{"Mint":"c7eae4","Celadon":"a7e8bd", ...}` (read in order) |
| Anything with hex codes | `https://coolors.co/264653-2a9d8f-e9c46a-f4a261-e76f51` |

How the colours are used:

- **Keyed by slot:** only the named slots change. If you set `background` without `text`, a readable text colour is generated.
- **Exactly six colours:** they fill the slots in order: background, daytime shading, temperature, rain, wind, text.
- **Any other number (typically five):** colours are assigned automatically. The background is whichever colour keeps the others most legible. Temperature gets the warmest hue and rain the bluest, wind takes what's left. Daytime shading uses a pasted colour only if it's close to the background; otherwise it's a shade of the background. Text is generated to contrast with the background.

Then drag a swatch's handle onto another swatch to swap the two colours, or tap two handles in turn. Temperature, rain or wind colours that will be hard to see against the background get a **low contrast** marker. **Copy current** copies the six colours as CSV, so you can share a palette or paste it back later.

### Optional Sensor Overrides (Current Hour Header)

If you have a personal weather station or BOM observation sensors you want shown when the scrubber is on the first (current) hour:

```yaml
type: custom:weather-graph-card
entity: weather.sydney_hourly
temperature_entity: sensor.sydney_temp
humidity_entity: sensor.sydney_humidity
wind_speed_entity: sensor.sydney_wind_speed_kilometre
wind_direction_entity: sensor.sydney_wind_direction
```

---

## Local Development & Interactive Preview

An interactive browser workbench with sample 48-hour BOM profiles (Sydney, Melbourne, Darwin, Perth) and the live Lovelace Visual Editor lives in `frontend/`:

```bash
cd frontend
npm install
npm run dev
```

To rebuild the production single-file Lovelace card bundle into `custom_components/weather_graph/frontend/weather-graph-card.js` and run all tests:

```bash
# Build card bundle + preview app
cd frontend && npm run build:all

# Run frontend unit & component tests
cd frontend && npm test

# Run Python backend integration tests
python3 -m pytest
```
