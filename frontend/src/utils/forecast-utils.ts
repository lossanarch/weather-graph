import type {
  DualAxisScales,
  HomeAssistant,
  NormalizedForecastPayload,
  NormalizedHourPoint,
  SunWindow,
} from "../types";

const CARDINAL_DIRECTIONS = [
  "N",
  "NNE",
  "NE",
  "ENE",
  "E",
  "ESE",
  "SE",
  "SSE",
  "S",
  "SSW",
  "SW",
  "WSW",
  "W",
  "WNW",
  "NW",
  "NNW",
] as const;

const CARDINAL_TO_DEGREES: Record<string, number> = {
  N: 0,
  NNE: 22.5,
  NE: 45,
  ENE: 67.5,
  E: 90,
  ESE: 112.5,
  SE: 135,
  SSE: 157.5,
  S: 180,
  SSW: 202.5,
  SW: 225,
  WSW: 247.5,
  W: 270,
  WNW: 292.5,
  NW: 315,
  NNW: 337.5,
};

/**
 * Magnus-Tetens dew point formula matching BOM's observation sensor calculation.
 */
export function computeDewPointC(
  tempC: number | null | undefined,
  relHumidity: number | null | undefined
): number | null {
  if (
    tempC === null ||
    tempC === undefined ||
    relHumidity === null ||
    relHumidity === undefined ||
    !Number.isFinite(tempC) ||
    !Number.isFinite(relHumidity) ||
    relHumidity <= 0
  ) {
    return null;
  }

  const clampedRh = Math.max(1, Math.min(100, relHumidity));
  const a = 17.27;
  const b = 237.7;
  const gamma = (a * tempC) / (b + tempC) + Math.log(clampedRh / 100);
  const denom = a - gamma;
  if (Math.abs(denom) < 1e-9) {
    return null;
  }
  return Math.round(((b * gamma) / denom) * 10) / 10;
}

/**
 * Normalize either a 16-point BOM cardinal string ("N", "SSE") or numeric bearing (0-360).
 */
export function normalizeWindBearing(
  raw: string | number | null | undefined
): { cardinal: string | null; degrees: number | null } {
  if (raw === null || raw === undefined) {
    return { cardinal: null, degrees: null };
  }

  if (typeof raw === "number") {
    if (!Number.isFinite(raw)) {
      return { cardinal: null, degrees: null };
    }
    const deg = ((raw % 360) + 360) % 360;
    const idx = Math.floor((deg + 11.25) / 22.5) % 16;
    return {
      cardinal: CARDINAL_DIRECTIONS[idx],
      degrees: Math.round(deg * 10) / 10,
    };
  }

  if (typeof raw === "string") {
    const token = raw.trim().toUpperCase();
    if (!token || token === "CALM" || token === "UNAVAILABLE" || token === "UNKNOWN") {
      return { cardinal: null, degrees: null };
    }
    if (token in CARDINAL_TO_DEGREES) {
      return { cardinal: token, degrees: CARDINAL_TO_DEGREES[token] };
    }
    const parsed = Number(token);
    if (Number.isFinite(parsed)) {
      return normalizeWindBearing(parsed);
    }
  }

  return { cardinal: null, degrees: null };
}

/**
 * Meteorological bearing is the direction wind blows FROM (0 = North).
 * With the arrow glyph pointing UP (North) at 0deg, a Northerly wind blowing
 * southward rotates to 180deg (downward).
 */
export function windArrowRotationDeg(bearingDeg: number | null | undefined): number {
  if (bearingDeg === null || bearingDeg === undefined || !Number.isFinite(bearingDeg)) {
    return 0;
  }
  return (((bearingDeg + 180) % 360) + 360) % 360;
}

/**
 * Parse both timezone-aware ISO strings and BOM's timezone-naive local ISO strings.
 */
export function parseForecastTimestamp(
  isoString: string,
  timeZone?: string
): number | null {
  if (!isoString || typeof isoString !== "string") {
    return null;
  }
  const trimmed = isoString.trim();
  const hasExplicitOffset = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(trimmed);
  if (hasExplicitOffset) {
    const ms = Date.parse(trimmed);
    return Number.isFinite(ms) ? ms : null;
  }

  const match =
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/.exec(trimmed);
  if (!match) {
    const fallback = Date.parse(trimmed);
    return Number.isFinite(fallback) ? fallback : null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6] ?? "0");

  if (!timeZone) {
    return new Date(year, month - 1, day, hour, minute, second).getTime();
  }

  try {
    const utcGuess = Date.UTC(year, month - 1, day, hour, minute, second);
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });
    const parts = formatter.formatToParts(new Date(utcGuess));
    const map: Record<string, number> = {};
    for (const part of parts) {
      if (part.type !== "literal") {
        map[part.type] = Number(part.value);
      }
    }
    const zonedAsUtc = Date.UTC(
      map.year,
      (map.month ?? 1) - 1,
      map.day ?? 1,
      map.hour ?? 0,
      map.minute ?? 0,
      map.second ?? 0
    );
    const offsetMs = zonedAsUtc - utcGuess;
    return utcGuess - offsetMs;
  } catch {
    return new Date(year, month - 1, day, hour, minute, second).getTime();
  }
}

export function getLocalHour(epochMs: number, timeZone?: string): number {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timeZone || undefined,
      hour: "numeric",
      hourCycle: "h23",
    }).formatToParts(new Date(epochMs));
    const hourPart = parts.find((p) => p.type === "hour");
    return hourPart ? Number(hourPart.value) % 24 : new Date(epochMs).getHours();
  } catch {
    return new Date(epochMs).getHours();
  }
}

/**
 * Format selected header timestamp as uppercase day + 12h clock: "FRI 1PM", "SAT 12AM".
 */
export function formatHeaderDayHour(epochMs: number, timeZone?: string): string {
  try {
    const opts: Intl.DateTimeFormatOptions = {
      weekday: "short",
      hour: "numeric",
      hour12: true,
      ...(timeZone ? { timeZone } : {}),
    };
    const parts = new Intl.DateTimeFormat("en-US", opts).formatToParts(
      new Date(epochMs)
    );
    const weekday = (
      parts.find((p) => p.type === "weekday")?.value ?? ""
    ).toUpperCase();
    const hour = parts.find((p) => p.type === "hour")?.value ?? "";
    const dayPeriod = (
      parts.find((p) => p.type === "dayPeriod")?.value ?? ""
    ).toUpperCase();
    return `${weekday} ${hour}${dayPeriod}`.trim();
  } catch {
    const d = new Date(epochMs);
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const h = d.getHours();
    const suffix = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${days[d.getDay()]} ${h12}${suffix}`;
  }
}

/**
 * Format 3-hourly timeline axis label as compact 12h clock: "3pm", "12am", "6am".
 */
export function formatAxisHour(epochMs: number, timeZone?: string): string {
  const h24 = getLocalHour(epochMs, timeZone);
  const suffix = h24 >= 12 ? "pm" : "am";
  const h12 = h24 % 12 || 12;
  return `${h12}${suffix}`;
}

export function formatShortWeekday(epochMs: number, timeZone?: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      ...(timeZone ? { timeZone } : {}),
    })
      .format(new Date(epochMs))
      .toUpperCase();
  } catch {
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    return days[new Date(epochMs).getDay()];
  }
}

/**
 * Compute aligned 5-gridline dual Y-axes:
 * - Left temperature axis in clean 5°C (or 10°C for extreme spread) steps
 * - Right wind axis starting at 0 km/h in clean 10/15/20 km/h steps
 */
export function computeDualAxisScales(hours: NormalizedHourPoint[]): DualAxisScales {
  const gridCount = 5;

  const temps = hours
    .map((h) => h.temperature)
    .filter((v): v is number => v !== null && Number.isFinite(v));

  let tempStep = 5;
  let tempMin = 10;

  if (temps.length > 0) {
    const rawMin = Math.min(...temps);
    const rawMax = Math.max(...temps);
    const rawSpan = rawMax - rawMin;

    if (rawSpan > 18) {
      tempStep = 10;
    } else {
      tempStep = 5;
    }

    const totalSpan = tempStep * (gridCount - 1);
    const mid = (rawMin + rawMax) / 2;
    tempMin = Math.round((mid - totalSpan / 2) / tempStep) * tempStep;

    if (rawMin <= tempMin + 0.5) {
      tempMin = Math.floor((rawMin - 1) / tempStep) * tempStep;
    }
    if (rawMax >= tempMin + totalSpan - 0.5) {
      if (rawMax - tempMin > totalSpan) {
        tempStep = Math.ceil((rawMax - rawMin + 4) / (gridCount - 1) / 5) * 5;
        tempMin = Math.floor((rawMin - 1) / 5) * 5;
      } else {
        tempMin = Math.ceil((rawMax + 1 - totalSpan) / tempStep) * tempStep;
      }
    }
  }

  const tempTicks = Array.from(
    { length: gridCount },
    (_, idx) => tempMin + idx * tempStep
  );

  const winds = hours
    .map((h) => h.wind_speed_kmh)
    .filter((v): v is number => Number.isFinite(v));
  const maxWind = winds.length > 0 ? Math.max(...winds) : 25;

  const candidateWindSteps = [10, 15, 20, 25, 30];
  let windStep = 10;
  for (const step of candidateWindSteps) {
    if (step * (gridCount - 1) >= Math.max(32, maxWind * 1.12)) {
      windStep = step;
      break;
    }
    windStep = step;
  }

  const windTicks = Array.from({ length: gridCount }, (_, idx) => idx * windStep);

  return {
    temp: {
      min: tempTicks[0],
      max: tempTicks[gridCount - 1],
      step: tempStep,
      ticks: tempTicks,
    },
    wind: {
      min: 0,
      max: windTicks[gridCount - 1],
      step: windStep,
      ticks: windTicks,
    },
    gridCount,
  };
}

/**
 * Automatically upgrade `weather.<loc>` to `weather.<loc>_hourly` when paired with BOM,
 * or select the best available hourly weather entity in Home Assistant.
 */
export function resolveWeatherEntityId(
  hass: HomeAssistant | undefined,
  configuredEntity?: string
): string | null {
  if (!hass?.states) {
    return configuredEntity || null;
  }

  if (configuredEntity) {
    const direct = hass.states[configuredEntity];
    const supported = Number(direct?.attributes?.supported_features ?? 0);
    if (direct && (supported & 2) !== 0) {
      return configuredEntity;
    }
    const hourlyVariant = configuredEntity.endsWith("_hourly")
      ? configuredEntity
      : `${configuredEntity}_hourly`;
    if (hass.states[hourlyVariant]) {
      return hourlyVariant;
    }
    if (direct) {
      return configuredEntity;
    }
  }

  const allWeatherIds = Object.keys(hass.states).filter((id) =>
    id.startsWith("weather.")
  );

  const bomHourly = allWeatherIds.find((id) => id.endsWith("_hourly"));
  if (bomHourly) {
    return bomHourly;
  }

  const hourlyCapable = allWeatherIds.find((id) => {
    const features = Number(hass.states[id]?.attributes?.supported_features ?? 0);
    return (features & 2) !== 0;
  });
  if (hourlyCapable) {
    return hourlyCapable;
  }

  return allWeatherIds[0] ?? null;
}

function safeNum(val: unknown): number | null {
  if (val === null || val === undefined || typeof val === "boolean") {
    return null;
  }
  const n = Number(val);
  return Number.isFinite(n) ? n : null;
}

function toCelsius(val: number | null, unit?: string): number | null {
  if (val === null) return null;
  if (unit && unit.toUpperCase().includes("F")) {
    return Math.round(((val - 32) * 5) / 9 * 10) / 10;
  }
  return Math.round(val * 10) / 10;
}

function toKmh(val: number | null, unit?: string): number | null {
  if (val === null) return null;
  const u = (unit ?? "km/h").trim().toLowerCase();
  if (u === "mph" || u === "mi/h") return Math.round(val * 1.60934 * 10) / 10;
  if (u === "m/s" || u === "mps") return Math.round(val * 3.6 * 10) / 10;
  if (u === "kn" || u === "kt" || u === "knots") return Math.round(val * 1.852 * 10) / 10;
  return Math.round(val * 10) / 10;
}

/**
 * Normalize raw Home Assistant `weather/subscribe_forecast` items on the client
 * when used without the Python WebSocket enrichment bridge.
 */
export function normalizeClientHaForecast(
  rawForecast: Array<Record<string, unknown>>,
  hass: HomeAssistant,
  entityId: string,
  maxHours = 48
): NormalizedForecastPayload {
  const stateObj = hass.states[entityId];
  const attrs = stateObj?.attributes ?? {};
  const timeZone = hass.config?.time_zone || "UTC";
  const tempUnit =
    (attrs.temperature_unit as string | undefined) ||
    hass.config?.unit_system?.temperature ||
    "°C";
  const windUnit =
    (attrs.wind_speed_unit as string | undefined) ||
    hass.config?.unit_system?.wind_speed ||
    "km/h";

  const sunState = hass.states["sun.sun"];
  const sunWindows: SunWindow[] = [];
  if (sunState?.attributes) {
    const srStr = sunState.attributes.next_rising as string | undefined;
    const ssStr = sunState.attributes.next_setting as string | undefined;
    const srMs = srStr ? Date.parse(srStr) : NaN;
    const ssMs = ssStr ? Date.parse(ssStr) : NaN;
    if (Number.isFinite(srMs) || Number.isFinite(ssMs)) {
      sunWindows.push({
        sunrise: Number.isFinite(srMs) ? new Date(srMs).toISOString() : null,
        sunrise_ms: Number.isFinite(srMs) ? srMs : null,
        sunset: Number.isFinite(ssMs) ? new Date(ssMs).toISOString() : null,
        sunset_ms: Number.isFinite(ssMs) ? ssMs : null,
      });
    }
  }

  const limit = Math.max(1, Math.min(72, maxHours));
  const hourly: NormalizedHourPoint[] = [];

  for (const item of rawForecast) {
    const dtStr = String(item.datetime ?? "");
    const epochMs = parseForecastTimestamp(dtStr, timeZone);
    if (epochMs === null) continue;

    const tempC = toCelsius(
      safeNum(item.temperature ?? item.native_temperature),
      tempUnit
    );
    const feelsC = toCelsius(
      safeNum(item.apparent_temperature ?? item.native_apparent_temperature),
      tempUnit
    );
    const humidity = safeNum(item.humidity);
    const rawDew = toCelsius(
      safeNum(item.dew_point ?? item.native_dew_point),
      tempUnit
    );
    const dewPoint = rawDew ?? computeDewPointC(tempC, humidity);

    const rainChance = safeNum(item.precipitation_probability) ?? 0;
    const rainMm = safeNum(item.precipitation ?? item.native_precipitation);

    const windSpeed =
      toKmh(safeNum(item.wind_speed ?? item.native_wind_speed), windUnit) ?? 0;
    const windGust = toKmh(
      safeNum(item.wind_gust_speed ?? item.native_wind_gust_speed),
      windUnit
    );
    const { cardinal, degrees } = normalizeWindBearing(
      item.wind_bearing as string | number | null | undefined
    );

    const condition = String(item.condition ?? "partlycloudy");
    const localH = getLocalHour(epochMs, timeZone);
    const isNight =
      Boolean(item.is_night) ||
      condition === "clear-night" ||
      localH < 6 ||
      localH >= 19;

    hourly.push({
      datetime: dtStr,
      epoch_ms: epochMs,
      temperature: tempC,
      feels_like: feelsC,
      humidity,
      dew_point: dewPoint,
      rain_chance: Math.max(0, Math.min(100, rainChance)),
      rain_min_mm: null,
      rain_max_mm: rainMm,
      wind_speed_kmh: Math.max(0, windSpeed),
      wind_gust_kmh: windGust,
      wind_direction: cardinal,
      wind_bearing_deg: degrees,
      icon_descriptor: (item.icon_descriptor as string | undefined) ?? null,
      condition,
      is_night: isNight,
      uv_index: safeNum(item.uv_index),
    });

    if (hourly.length >= limit) break;
  }

  return {
    source: "homeassistant_weather",
    entity_id: entityId,
    location: {
      name: String(attrs.friendly_name ?? entityId),
      state: null,
      timezone: timeZone,
    },
    units: {
      temperature: "°C",
      wind_speed: "km/h",
      precipitation: "mm",
    },
    current: null,
    sun_windows: sunWindows,
    hourly,
  };
}
