import { describe, expect, it } from "vitest";
import { SAMPLE_BOM_PROFILES } from "../dev/bom-sample-profiles";
import type { HomeAssistant } from "../types";
import {
  computeDewPointC,
  computeDualAxisScales,
  formatAxisHour,
  formatHeaderDayHour,
  normalizeWindBearing,
  parseForecastTimestamp,
  resolveWeatherEntityId,
  windArrowRotationDeg,
} from "../utils/forecast-utils";
import {
  buildMonotoneAreaPath,
  buildMonotoneLinePath,
  computeDayNightBands,
} from "../utils/svg-paths";
import "../weather-graph-card";

describe("forecast-utils", () => {
  it("computes Magnus-Tetens dew point matching BOM observation sensors", () => {
    expect(computeDewPointC(24, 69)).toBe(18);
    expect(computeDewPointC(30, 80)).toBe(26.2);
    expect(computeDewPointC(null, 65)).toBeNull();
    expect(computeDewPointC(22, 0)).toBeNull();
  });

  it("normalizes BOM 16-point cardinal strings and numeric degrees", () => {
    expect(normalizeWindBearing("N")).toEqual({ cardinal: "N", degrees: 0 });
    expect(normalizeWindBearing("SSE")).toEqual({
      cardinal: "SSE",
      degrees: 157.5,
    });
    expect(normalizeWindBearing(270)).toEqual({ cardinal: "W", degrees: 270 });
    expect(normalizeWindBearing("Calm")).toEqual({
      cardinal: null,
      degrees: null,
    });
  });

  it("rotates meteorological wind arrows to flow direction", () => {
    expect(windArrowRotationDeg(0)).toBe(180);
    expect(windArrowRotationDeg(180)).toBe(0);
    expect(windArrowRotationDeg(270)).toBe(90);
  });

  it("parses both timezone-aware and BOM timezone-naive local ISO timestamps", () => {
    const utcMs = parseForecastTimestamp(
      "2026-11-20T02:00:00Z",
      "Australia/Sydney"
    );
    const localNaiveMs = parseForecastTimestamp(
      "2026-11-20T13:00:00",
      "Australia/Sydney"
    );
    expect(utcMs).toBe(Date.UTC(2026, 10, 20, 2, 0, 0));
    expect(localNaiveMs).toBe(utcMs);

    expect(formatHeaderDayHour(utcMs!, "Australia/Sydney")).toBe("FRI 1PM");
    expect(formatAxisHour(utcMs! + 2 * 3600_000, "Australia/Sydney")).toBe(
      "3pm"
    );
    expect(formatAxisHour(utcMs! + 11 * 3600_000, "Australia/Sydney")).toBe(
      "12am"
    );
  });

  it("resolves BOM daily weather entity to its _hourly sibling", () => {
    const mockHass: HomeAssistant = {
      states: {
        "weather.sydney": {
          entity_id: "weather.sydney",
          state: "sunny",
          attributes: { supported_features: 1 },
        },
        "weather.sydney_hourly": {
          entity_id: "weather.sydney_hourly",
          state: "sunny",
          attributes: { supported_features: 2 },
        },
      },
      config: { time_zone: "Australia/Sydney" },
      connection: {
        subscribeMessage: async () => () => {},
        sendMessagePromise: async <T>() => ({} as T),
      },
    };

    expect(resolveWeatherEntityId(mockHass, "weather.sydney")).toBe(
      "weather.sydney_hourly"
    );
  });

  it("computes aligned 5-gridline temperature and wind scales", () => {
    const sydneyHours = SAMPLE_BOM_PROFILES[0].payload.hourly;
    const scales = computeDualAxisScales(sydneyHours);
    expect(scales.temp.ticks).toHaveLength(5);
    expect(scales.wind.ticks).toHaveLength(5);
    expect(scales.wind.min).toBe(0);
    expect(scales.temp.max).toBeGreaterThanOrEqual(29);
    expect(scales.temp.min).toBeLessThanOrEqual(16);
  });
});

describe("svg-paths", () => {
  it("builds monotone cubic line and closed area paths", () => {
    const pts = [
      { x: 10, y: 100 },
      { x: 30, y: 80 },
      { x: 50, y: 80 },
      { x: 70, y: 120 },
    ];
    const line = buildMonotoneLinePath(pts);
    expect(line.startsWith("M 10 100 C")).toBe(true);

    const area = buildMonotoneAreaPath(pts, 200);
    expect(area.endsWith("L 70 200 L 10 200 Z")).toBe(true);
  });

  it("computes sub-hour day/night background bands from BOM sun windows", () => {
    const profile = SAMPLE_BOM_PROFILES[0].payload;
    const bands = computeDayNightBands(
      profile.hourly,
      profile.sun_windows,
      (idx) => 50 + idx * 20,
      1050
    );
    expect(bands.length).toBeGreaterThanOrEqual(3);
    expect(bands[0].startX).toBe(0);
    expect(bands[0].isNight).toBe(false);
    expect(bands[bands.length - 1].endX).toBe(1050);
  });
});

describe("weather-graph-card custom element", () => {
  it("renders the summary header, 48-hour chart, and interactive series toggles", async () => {
    const el = document.createElement("weather-graph-card");
    el.samplePayload = SAMPLE_BOM_PROFILES[0].payload;
    document.body.appendChild(el);
    await el.updateComplete;

    const shadow = el.shadowRoot!;
    expect(shadow.querySelector(".wg-card-title")?.textContent).toBe("Weather");
    expect(shadow.querySelector(".wg-summary-temp")?.textContent?.trim()).toBe(
      "24°"
    );
    expect(shadow.querySelector(".wg-summary-time")?.textContent?.trim()).toBe(
      "FRI 1PM"
    );
    expect(
      shadow.querySelector(".wg-summary-rain-val")?.textContent?.trim()
    ).toBe("53%");

    const metricVals = Array.from(
      shadow.querySelectorAll(".wg-metric-value")
    ).map((n) => n.textContent?.trim());
    expect(metricVals).toEqual(["N 15 km/h", "69%", "18°C"]);

    const tempBtn = shadow.querySelector(
      ".wg-legend-temp"
    ) as HTMLButtonElement;
    expect(tempBtn.classList.contains("inactive")).toBe(false);
    tempBtn.click();
    await el.updateComplete;
    expect(tempBtn.classList.contains("inactive")).toBe(true);

    const chartEl = shadow.querySelector("wg-forecast-chart")!;
    await chartEl.updateComplete;
    const chartShadow = chartEl.shadowRoot!;
    expect(chartShadow.querySelector("svg.wg-chart-svg")).not.toBeNull();
    expect(chartShadow.querySelector(".wg-scrubber-cursor")).not.toBeNull();

    chartEl.dispatchEvent(
      new CustomEvent("hour-select", {
        detail: { index: 4 },
        bubbles: true,
        composed: true,
      })
    );
    await el.updateComplete;
    expect(shadow.querySelector(".wg-summary-time")?.textContent?.trim()).toBe(
      "FRI 5PM"
    );
    expect(shadow.querySelector(".wg-summary-temp")?.textContent?.trim()).toBe(
      "25°"
    );

    el.remove();
  });
});
