import { describe, expect, it } from "vitest";
import { SAMPLE_BOM_PROFILES } from "../dev/bom-sample-profiles";
import {
  DEFAULT_PALETTE_ID,
  PALETTE_PRESETS,
  buildThemeVars,
  effectiveOverrides,
  mixHex,
  normalizeHex,
  resolvePalette,
} from "../theme/palette";
import type { NormalizedHourPoint } from "../types";
import {
  DEFAULT_SUMMARY_METRICS,
  formatSummaryMetric,
  normalizeSummaryMetrics,
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

  it("formats rain amount ranges", () => {
    const p = { ...point, rain_min_mm: 1, rain_max_mm: 5 };
    expect(formatSummaryMetric("rain_amount", p, false, null).value).toBe("1–5 mm");
  });
});

describe("card theming, fields and axes", () => {
  async function mountCard(config: Record<string, unknown>) {
    const el = document.createElement("weather-graph-card");
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
