import type { CurrentObservation, NormalizedHourPoint, SummaryMetric } from "../types";

export const MAX_SUMMARY_METRICS = 3;

export const DEFAULT_SUMMARY_METRICS: SummaryMetric[] = ["wind", "humidity", "dew_point"];

export const SUMMARY_METRIC_OPTIONS: ReadonlyArray<{ id: SummaryMetric; label: string }> = [
  { id: "wind", label: "Wind" },
  { id: "wind_gust", label: "Wind gust" },
  { id: "humidity", label: "Humidity" },
  { id: "dew_point", label: "Dew point" },
  { id: "feels_like", label: "Feels like" },
  { id: "uv", label: "UV index" },
  { id: "rain_amount", label: "Rain amount" },
];

const VALID_IDS = new Set<string>(SUMMARY_METRIC_OPTIONS.map((o) => o.id));

/** Valid, de-duplicated metrics from config; defaults when the key is absent. */
export function normalizeSummaryMetrics(metrics: unknown): SummaryMetric[] {
  if (!Array.isArray(metrics)) return [...DEFAULT_SUMMARY_METRICS];
  const result: SummaryMetric[] = [];
  for (const m of metrics) {
    if (typeof m === "string" && VALID_IDS.has(m) && !result.includes(m as SummaryMetric)) {
      result.push(m as SummaryMetric);
    }
  }
  return result.slice(0, MAX_SUMMARY_METRICS);
}

export function uvCategory(uv: number): string {
  if (uv < 3) return "Low";
  if (uv < 6) return "Moderate";
  if (uv < 8) return "High";
  if (uv < 11) return "Very High";
  return "Extreme";
}

const isNum = (v: number | null | undefined): v is number =>
  v !== null && v !== undefined && Number.isFinite(v);

export interface MetricDisplay {
  id: SummaryMetric;
  label: string;
  value: string;
}

export function formatSummaryMetric(
  metric: SummaryMetric,
  point: NormalizedHourPoint,
  isFirstHour: boolean,
  currentObs: CurrentObservation | null
): MetricDisplay {
  const current = <K extends keyof CurrentObservation>(key: K) =>
    isFirstHour ? currentObs?.[key] ?? null : null;
  const label = SUMMARY_METRIC_OPTIONS.find((o) => o.id === metric)?.label ?? metric;
  const degrees = (v: number | null | undefined) => (isNum(v) ? `${Math.round(v)}°C` : "--°C");
  const kmh = (v: number | null | undefined) => (isNum(v) ? `${Math.round(v)} km/h` : "-- km/h");

  switch (metric) {
    case "wind": {
      const speed = (current("wind_speed_kmh") as number | null) ?? point.wind_speed_kmh;
      const dir = (current("wind_direction") as string | null) ?? point.wind_direction ?? "";
      const value =
        isNum(speed) && speed <= 0.4 && !dir
          ? "Calm"
          : `${dir ? `${dir} ` : ""}${kmh(speed)}`;
      return { id: metric, label, value };
    }
    case "wind_gust":
      return {
        id: metric,
        label,
        value: kmh((current("wind_gust_kmh") as number | null) ?? point.wind_gust_kmh),
      };
    case "humidity": {
      const v = (current("humidity") as number | null) ?? point.humidity;
      return { id: metric, label, value: isNum(v) ? `${Math.round(v)}%` : "--%" };
    }
    case "dew_point":
      return {
        id: metric,
        label,
        value: degrees((current("dew_point") as number | null) ?? point.dew_point),
      };
    case "feels_like":
      return {
        id: metric,
        label,
        value: degrees((current("feels_like") as number | null) ?? point.feels_like),
      };
    case "uv": {
      const uv = point.uv_index;
      return {
        id: metric,
        label,
        value: isNum(uv) ? `${Math.round(uv)} ${uvCategory(uv)}` : "--",
      };
    }
    case "rain_amount": {
      const lo = point.rain_min_mm;
      const hi = point.rain_max_mm;
      let value = "-- mm";
      if (isNum(lo) && isNum(hi) && hi > lo) value = `${lo}–${hi} mm`;
      else if (isNum(hi)) value = `${hi} mm`;
      else if (isNum(lo)) value = `${lo} mm`;
      return { id: metric, label, value };
    }
  }
}
