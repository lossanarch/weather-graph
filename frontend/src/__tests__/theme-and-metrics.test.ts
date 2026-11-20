import { describe, expect, it } from "vitest";
import { SAMPLE_BOM_PROFILES } from "../dev/bom-sample-profiles";
import {
  DEFAULT_LIGHT_PALETTE_ID,
  DEFAULT_PALETTE_ID,
  PALETTE_PRESETS,
  buildThemeVars,
  effectiveOverrides,
  mixHex,
  modePaletteSelection,
  normalizeHex,
  resolveModePalette,
  resolvePalette,
} from "../theme/palette";
import type { HomeAssistant, NormalizedHourPoint } from "../types";
import {
  DEFAULT_SUMMARY_METRICS,
  formatSummaryMetric,
  formatUvTimes,
  normalizeSummaryMetrics,
  resolveUvTimes,
  uvCategory,
} from "../utils/summary-metrics";
import "../weather-graph-card";

describe("palette", () => {
  it("ships 3-5 presets including the default and the original Midnight look", () => {
    expect(PALETTE_PRESETS.length).toBeGreaterThanOrEqual(3);
    expect(PALETTE_PRESETS.length).toBeLessThanOrEqual(5);
    expect(PALETTE_PRESETS.some((p) => p.id === DEFAULT_PALETTE_ID)).toBe(true);
    expect(resolvePalette("midnight", undefined)).toMatchObject({
      background: "#0f2137",
      temperature: "#f5be36",
      rain: "#4cc9f0",
      wind: "#ffffff",
    });
  });

  it("applies valid overrides and ignores invalid ones", () => {
    const colors = resolvePalette("forest", { rain: "#ABC", wind: "red", text: "#12345" });
    expect(colors.rain).toBe("#aabbcc");
    expect(colors.wind).toBe(resolvePalette("forest", undefined).wind);
    expect(colors.text).toBe(resolvePalette("forest", undefined).text);
    expect(resolvePalette("nope", undefined)).toEqual(resolvePalette(DEFAULT_PALETTE_ID, undefined));
  });

  it("drops overrides that match the preset", () => {
    const preset = resolvePalette("ember", undefined);
    expect(effectiveOverrides("ember", { rain: preset.rain, wind: "#000000" })).toEqual({
      wind: "#000000",
    });
  });

  it("derives shades in the right direction for light and dark backgrounds", () => {
    expect(normalizeHex(" #FFF ")).toBe("#ffffff");
    expect(mixHex("#000000", "#ffffff", 0.5)).toBe("#808080");
    const dark = buildThemeVars(resolvePalette("midnight", undefined));
    expect(dark["--wg-panel"]).toBe("#091422");
    const light = buildThemeVars(resolvePalette("daylight", undefined));
    expect(light["--wg-panel"] < light["--wg-bg"]).toBe(true);
  });

  it("keeps separate dark and light palettes with their own defaults", () => {
    expect(resolveModePalette({}, "dark")).toEqual(resolvePalette(DEFAULT_PALETTE_ID, undefined));
    expect(resolveModePalette({}, "light")).toEqual(
      resolvePalette(DEFAULT_LIGHT_PALETTE_ID, undefined)
    );
    const config = {
      palette: "forest",
      colors: { rain: "#111111" },
      light_palette: "nope",
      light_colors: { rain: "#222222" },
    };
    expect(resolveModePalette(config, "dark").rain).toBe("#111111");
    expect(resolveModePalette(config, "light")).toEqual({
      ...resolvePalette(DEFAULT_LIGHT_PALETTE_ID, undefined),
      rain: "#222222",
    });
    expect(modePaletteSelection(config, "light")).toMatchObject({
      paletteKey: "light_palette",
      colorsKey: "light_colors",
      paletteId: DEFAULT_LIGHT_PALETTE_ID,
    });
  });
});

describe("summary metrics", () => {
  const point = SAMPLE_BOM_PROFILES[0].payload.hourly[0] as NormalizedHourPoint;

  it("normalizes configured metrics", () => {
    expect(normalizeSummaryMetrics(undefined)).toEqual(DEFAULT_SUMMARY_METRICS);
    expect(normalizeSummaryMetrics(["uv", "uv", "bogus", "wind", "humidity", "dew_point"])).toEqual([
      "uv",
      "wind",
      "humidity",
    ]);
    expect(normalizeSummaryMetrics([])).toEqual([]);
  });

  it("formats UV with its category", () => {
    expect(uvCategory(2)).toBe("Low");
    expect(uvCategory(7)).toBe("High");
    expect(uvCategory(11)).toBe("Extreme");
    expect(formatSummaryMetric("uv", { ...point, uv_index: 8.4 }, false, null).value).toBe(
      "8 Very High"
    );
    expect(formatSummaryMetric("uv", { ...point, uv_index: null }, false, null).value).toBe("--");
  });

  describe("UV time", () => {
    const tz = "Australia/Sydney";
    // 2026-11-20 is a Friday; Sydney is UTC+11 in November.
    const at = (day: number, hour: number, minute = 0) =>
      Date.UTC(2026, 10, day, hour - 11, minute);
    const hourly = (day: number, uvAt: (h: number) => number) =>
      Array.from({ length: 24 }, (_, h) => ({
        ...point,
        epoch_ms: at(day, h),
        uv_index: uvAt(h),
      }));

    it("uses BOM sun protection times for the selected hour's day", () => {
      const payload = {
        hourly: [],
        uv_windows: [
          { date: "2026-11-20", start_ms: at(20, 9, 10), end_ms: at(20, 16), max_index: 10 },
          { date: "2026-11-21", start_ms: null, end_ms: null, max_index: 2 },
        ],
      };
      const fri = resolveUvTimes(payload, at(20, 23), tz);
      expect(formatUvTimes(fri, tz)).toBe("9:10am–4pm");
      expect(formatUvTimes(resolveUvTimes(payload, at(21, 1), tz), tz)).toBe("Not needed");
      expect(formatUvTimes(resolveUvTimes(payload, at(22, 12), tz), tz)).toBe("--");
    });

    it("derives times from hourly UV index without BOM data", () => {
      const payload = { hourly: hourly(21, (h) => (h >= 10 && h <= 14 ? 6 : 1)) };
      expect(formatUvTimes(resolveUvTimes(payload, at(21, 20), tz), tz)).toBe("10am–3pm");
      const mild = { hourly: hourly(21, () => 2) };
      expect(formatUvTimes(resolveUvTimes(mild, at(21, 12), tz), tz)).toBe("Not needed");
    });

    it("gives up when the forecast misses the start of the day", () => {
      const payload = { hourly: hourly(21, (h) => (h >= 10 ? 6 : 1)).slice(13) };
      expect(resolveUvTimes(payload, at(21, 15), tz)).toBeNull();
    });

    it("is selectable as a summary field", () => {
      expect(normalizeSummaryMetrics(["uv_time"])).toEqual(["uv_time"]);
      const display = formatSummaryMetric("uv_time", point, false, null, {
        uvTimes: { start_ms: at(20, 8), end_ms: at(20, 17, 30) },
        timeZone: tz,
      });
      expect(display).toEqual({ id: "uv_time", label: "UV time", value: "8am–5:30pm" });
    });
  });

  it("formats rain amount ranges", () => {
    const p = { ...point, rain_min_mm: 1, rain_max_mm: 5 };
    expect(formatSummaryMetric("rain_amount", p, false, null).value).toBe("1–5 mm");
  });
});

describe("card theming, fields and axes", () => {
  async function mountCard(config: Record<string, unknown>, darkMode = true) {
    const el = document.createElement("weather-graph-card");
    el.hass = { states: {}, config: {}, themes: { darkMode } } as unknown as HomeAssistant;
    el.setConfig({ type: "custom:weather-graph-card", ...config });
    el.samplePayload = SAMPLE_BOM_PROFILES[0].payload;
    document.body.appendChild(el);
    await el.updateComplete;
    const chart = el.shadowRoot!.querySelector("wg-forecast-chart")!;
    await chart.updateComplete;
    return { el, shadow: el.shadowRoot!, chart };
  }

  it("renders the configured summary fields and palette variables", async () => {
    const { el, shadow } = await mountCard({
      metrics: ["uv", "feels_like"],
      palette: "forest",
      colors: { temperature: "#ff0000" },
    });
    const labels = Array.from(shadow.querySelectorAll(".wg-metric-label")).map((n) =>
      n.textContent?.trim()
    );
    expect(labels).toEqual(["UV index", "Feels like"]);
    const card = shadow.querySelector(".wg-card") as HTMLElement;
    expect(card.style.getPropertyValue("--wg-temp")).toBe("#ff0000");
    expect(card.style.getPropertyValue("--wg-bg")).toBe(resolvePalette("forest", undefined).background);
    el.remove();
  });

  it("switches to the light palette when Home Assistant is in light mode", async () => {
    const config = { palette: "forest", light_palette: "daylight", light_colors: { rain: "#0055aa" } };
    const { el, shadow } = await mountCard(config, false);
    const card = () => shadow.querySelector(".wg-card") as HTMLElement;
    expect(card().style.getPropertyValue("--wg-bg")).toBe(resolvePalette("daylight", undefined).background);
    expect(card().style.getPropertyValue("--wg-rain")).toBe("#0055aa");

    el.hass = { states: {}, config: {}, themes: { darkMode: true } } as unknown as HomeAssistant;
    await el.updateComplete;
    expect(card().style.getPropertyValue("--wg-bg")).toBe(resolvePalette("forest", undefined).background);
    el.remove();
  });

  it("shows sun protection times from the payload", async () => {
    const { el, shadow } = await mountCard({ metrics: ["uv_time"] });
    const value = shadow.querySelector(".wg-metric-value")?.textContent?.trim();
    expect(value).toMatch(/^\d{1,2}(:\d{2})?am–\d{1,2}(:\d{2})?pm$/);
    el.remove();
  });

  it("moves the rain scale onto the axis of a hidden series", async () => {
    const { el, chart } = await mountCard({});
    const axisUnits = () =>
      Array.from(chart.shadowRoot!.querySelectorAll(".wg-axis-unit")).map((n) =>
        n.textContent?.trim()
      );
    expect(axisUnits()).toEqual(["°C", "km/h"]);

    chart.showWind = false;
    await chart.updateComplete;
    expect(axisUnits()).toEqual(["°C", "%"]);
    const rightTicks = Array.from(
      chart.shadowRoot!.querySelectorAll(".wg-axis-right .wg-axis-tick")
    ).map((n) => n.textContent?.trim());
    expect(rightTicks).toEqual(["0", "25", "50", "75", "100"]);

    chart.showTemperature = false;
    await chart.updateComplete;
    expect(axisUnits()).toEqual(["%", "km/h"]);
    expect(chart.shadowRoot!.querySelector(".wg-axis-right")!.classList.contains("wg-axis-dim")).toBe(
      true
    );

    chart.showRain = false;
    await chart.updateComplete;
    expect(axisUnits()).toEqual(["°C", "km/h"]);
    el.remove();
  });
});
