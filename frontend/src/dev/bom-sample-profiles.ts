import type { NormalizedForecastPayload, NormalizedHourPoint } from "../types";
import { computeDewPointC, normalizeWindBearing } from "../utils/forecast-utils";

interface RawProfileSeed {
  id: string;
  entityId: string;
  dailyEntityId: string;
  name: string;
  state: string;
  timezone: string;
  description: string;
  startEpochMs: number;
  sunWindows: Array<{ sunriseOffsetH: number; sunsetOffsetH: number }>;
  buildHour: (h: number) => {
    temp: number;
    humidity: number;
    rainChance: number;
    windSpeed: number;
    windDir: string;
    icon: string;
  };
}

function generatePayload(seed: RawProfileSeed): NormalizedForecastPayload {
  const sun_windows = seed.sunWindows.map((w) => {
    const srMs = seed.startEpochMs + w.sunriseOffsetH * 3600_000;
    const ssMs = seed.startEpochMs + w.sunsetOffsetH * 3600_000;
    return {
      sunrise: new Date(srMs).toISOString(),
      sunrise_ms: srMs,
      sunset: new Date(ssMs).toISOString(),
      sunset_ms: ssMs,
    };
  });

  const day0SunriseMs = seed.startEpochMs - 7.3 * 3600_000;
  const day0SunsetMs = seed.startEpochMs + 6.7 * 3600_000;
  sun_windows.unshift({
    sunrise: new Date(day0SunriseMs).toISOString(),
    sunrise_ms: day0SunriseMs,
    sunset: new Date(day0SunsetMs).toISOString(),
    sunset_ms: day0SunsetMs,
  });

  const isNightMs = (ms: number): boolean => {
    for (const win of sun_windows) {
      if (
        win.sunrise_ms !== null &&
        win.sunset_ms !== null &&
        ms >= win.sunrise_ms &&
        ms < win.sunset_ms
      ) {
        return false;
      }
    }
    return true;
  };

  const hourly: NormalizedHourPoint[] = [];

  for (let i = 0; i < 48; i++) {
    const epochMs = seed.startEpochMs + i * 3600_000;
    const spec = seed.buildHour(i);
    const { cardinal, degrees } = normalizeWindBearing(spec.windDir);
    const night = isNightMs(epochMs);

    hourly.push({
      datetime: new Date(epochMs).toISOString(),
      epoch_ms: epochMs,
      temperature: Math.round(spec.temp * 10) / 10,
      feels_like: Math.round((spec.temp + (spec.humidity > 70 ? 1.2 : -0.6)) * 10) / 10,
      humidity: Math.round(spec.humidity),
      dew_point: computeDewPointC(spec.temp, spec.humidity),
      rain_chance: Math.max(0, Math.min(100, Math.round(spec.rainChance))),
      rain_min_mm: spec.rainChance >= 50 ? 0.4 : 0,
      rain_max_mm: spec.rainChance >= 50 ? Math.round((spec.rainChance / 20) * 10) / 10 : 0,
      wind_speed_kmh: Math.round(spec.windSpeed * 10) / 10,
      wind_gust_kmh: Math.round(spec.windSpeed * 1.45),
      wind_direction: cardinal,
      wind_bearing_deg: degrees,
      icon_descriptor: spec.icon,
      condition: spec.icon === "storm" ? "lightning-rainy" : "partlycloudy",
      is_night: night,
      uv_index: night ? 0 : Math.max(1, Math.round(9 * Math.sin(((i % 24) / 12) * Math.PI))),
    });
  }

  const first = hourly[0];
  return {
    source: "bureau_of_meteorology",
    entity_id: seed.entityId,
    location: {
      name: seed.name,
      state: seed.state,
      timezone: seed.timezone,
    },
    units: {
      temperature: "°C",
      wind_speed: "km/h",
      precipitation: "mm",
    },
    current: {
      temperature: first.temperature,
      feels_like: first.feels_like,
      humidity: first.humidity,
      dew_point: first.dew_point,
      wind_speed_kmh: first.wind_speed_kmh,
      wind_gust_kmh: first.wind_gust_kmh,
      wind_direction: first.wind_direction,
      wind_bearing_deg: first.wind_bearing_deg,
      rain_since_9am_mm: 1.4,
    },
    sun_windows,
    hourly,
  };
}

const SYDNEY_FRI_1PM_UTC = Date.UTC(2026, 10, 20, 2, 0, 0);

const SYDNEY_TEMPS_24 = [
  24.0, 24.2, 24.3, 24.1, 25.0, 24.4, 23.2, 21.6, 20.1, 19.2, 18.6, 18.1,
  17.7, 17.3, 16.9, 16.5, 16.2, 16.1, 16.6, 17.6, 18.9, 20.3, 22.0, 23.6,
];
const SYDNEY_RAIN_24 = [
  53, 55, 54, 50, 48, 52, 49, 46, 22, 18, 28, 33,
  24, 16, 25, 22, 14, 26, 44, 34, 26, 22, 15, 12,
];
const SYDNEY_WIND_24 = [
  15, 12, 14, 11, 12, 13, 14, 10, 10, 11, 9, 10,
  9, 8, 7, 6, 5, 5, 4, 4, 4, 5, 7, 11,
];
const SYDNEY_DIRS_24 = [
  "N", "WNW", "WSW", "SW", "WSW", "W", "WNW", "NNW", "N", "N", "N", "N",
  "N", "NNW", "NW", "WNW", "W", "WNW", "W", "W", "W", "W", "WNW", "NE",
];

export interface SampleProfileMeta {
  id: string;
  label: string;
  description: string;
  dailyEntityId: string;
  hourlyEntityId: string;
  payload: NormalizedForecastPayload;
}

export const SAMPLE_BOM_PROFILES: SampleProfileMeta[] = [
  {
    id: "sydney",
    label: "Sydney, NSW (Stormy Afternoon)",
    description: "Warm afternoon storms clearing overnight: 24°C, 53% rain chance, N 15 km/h wind, 69% RH, 18°C dew point.",
    dailyEntityId: "weather.sydney",
    hourlyEntityId: "weather.sydney_hourly",
    payload: generatePayload({
      id: "sydney",
      entityId: "weather.sydney_hourly",
      dailyEntityId: "weather.sydney",
      name: "Sydney",
      state: "NSW",
      timezone: "Australia/Sydney",
      description: "Afternoon storms clearing overnight to a warm Saturday",
      startEpochMs: SYDNEY_FRI_1PM_UTC,
      sunWindows: [
        { sunriseOffsetH: 16.7, sunsetOffsetH: 30.7 },
        { sunriseOffsetH: 40.7, sunsetOffsetH: 54.7 },
      ],
      buildHour: (h) => {
        if (h < 24) {
          const icon =
            h <= 6
              ? "storm"
              : h <= 9
              ? "shower"
              : h <= 16
              ? "partly_cloudy"
              : h <= 21
              ? "mostly_sunny"
              : "sunny";
          return {
            temp: SYDNEY_TEMPS_24[h],
            humidity: h === 0 ? 69 : Math.round(64 + (25 - SYDNEY_TEMPS_24[h]) * 2.1),
            rainChance: SYDNEY_RAIN_24[h],
            windSpeed: SYDNEY_WIND_24[h],
            windDir: SYDNEY_DIRS_24[h],
            icon,
          };
        }
        const h2 = h - 24;
        const temp = 24.5 + Math.sin(((h2 - 2) / 24) * Math.PI * 2) * 5.2;
        const rainChance = h2 >= 4 && h2 <= 10 ? 35 : 10;
        return {
          temp,
          humidity: Math.round(58 + (26 - temp) * 2),
          rainChance,
          windSpeed: 12 + Math.max(0, Math.sin(((h2 + 1) / 24) * Math.PI * 2) * 10),
          windDir: h2 < 8 ? "ENE" : h2 < 17 ? "NNE" : "NW",
          icon: rainChance > 25 ? "light_shower" : "mostly_sunny",
        };
      },
    }),
  },
  {
    id: "melbourne",
    label: "Melbourne, VIC (Cool Change)",
    description: "Gusty 31°C northerly ahead of a sharp 4pm Bass Strait cold front and rain band.",
    dailyEntityId: "weather.melbourne",
    hourlyEntityId: "weather.melbourne_hourly",
    payload: generatePayload({
      id: "melbourne",
      entityId: "weather.melbourne_hourly",
      dailyEntityId: "weather.melbourne",
      name: "Melbourne",
      state: "VIC",
      timezone: "Australia/Melbourne",
      description: "Sharp afternoon cool change with gusty winds",
      startEpochMs: SYDNEY_FRI_1PM_UTC,
      sunWindows: [
        { sunriseOffsetH: 16.9, sunsetOffsetH: 31.2 },
        { sunriseOffsetH: 40.9, sunsetOffsetH: 55.2 },
      ],
      buildHour: (h) => {
        const preFront = h < 4;
        const frontPassage = h >= 4 && h <= 9;
        const temp = preFront
          ? 29.5 + h * 0.6
          : frontPassage
          ? 31 - (h - 3) * 2.7
          : 15.5 + Math.sin(((h - 19) / 24) * Math.PI * 2) * 4.2;
        const rainChance = preFront
          ? 15 + h * 12
          : frontPassage
          ? 88 - Math.abs(h - 6) * 8
          : h < 18
          ? 35
          : 15;
        const windSpeed = preFront
          ? 30 + h * 2
          : frontPassage
          ? 36 - (h - 4) * 2.2
          : 16;
        const windDir = preFront ? "N" : frontPassage ? "SSW" : "SW";
        const icon = preFront
          ? "windy"
          : h === 4 || h === 5
          ? "storm"
          : frontPassage
          ? "rain"
          : "partly_cloudy";
        return {
          temp,
          humidity: preFront ? 32 : frontPassage ? 84 : 68,
          rainChance,
          windSpeed,
          windDir,
          icon,
        };
      },
    }),
  },
  {
    id: "darwin",
    label: "Darwin, NT (Build-Up Storms)",
    description: "Tropical Top End humidity with high dew points (24°C+) and evening monsoon storms.",
    dailyEntityId: "weather.darwin",
    hourlyEntityId: "weather.darwin_hourly",
    payload: generatePayload({
      id: "darwin",
      entityId: "weather.darwin_hourly",
      dailyEntityId: "weather.darwin",
      name: "Darwin",
      state: "NT",
      timezone: "Australia/Darwin",
      description: "Warm humid tropical build-up storms",
      startEpochMs: Date.UTC(2026, 10, 20, 3, 30, 0),
      sunWindows: [
        { sunriseOffsetH: 17.2, sunsetOffsetH: 29.8 },
        { sunriseOffsetH: 41.2, sunsetOffsetH: 53.8 },
      ],
      buildHour: (h) => {
        const cyc = h % 24;
        const temp = 30.5 + Math.cos((cyc / 24) * Math.PI * 2) * 3.4;
        const stormWindow = cyc >= 3 && cyc <= 9;
        return {
          temp,
          humidity: stormWindow ? 84 : 74,
          rainChance: stormWindow ? 75 : 30,
          windSpeed: stormWindow ? 22 : 11,
          windDir: cyc < 10 ? "NW" : "WNW",
          icon: stormWindow ? "storm" : "partly_cloudy",
        };
      },
    }),
  },
  {
    id: "perth",
    label: "Perth, WA (Fremantle Doctor)",
    description: "Dry sunny afternoon cooled by a brisk 28 km/h SW Indian Ocean sea breeze.",
    dailyEntityId: "weather.perth",
    hourlyEntityId: "weather.perth_hourly",
    payload: generatePayload({
      id: "perth",
      entityId: "weather.perth_hourly",
      dailyEntityId: "weather.perth",
      name: "Perth",
      state: "WA",
      timezone: "Australia/Perth",
      description: "Sunny with afternoon SW sea breeze",
      startEpochMs: Date.UTC(2026, 10, 20, 5, 0, 0),
      sunWindows: [
        { sunriseOffsetH: 16.2, sunsetOffsetH: 30.0 },
        { sunriseOffsetH: 40.2, sunsetOffsetH: 54.0 },
      ],
      buildHour: (h) => {
        const cyc = h % 24;
        const temp = 25 + Math.cos(((cyc - 1) / 24) * Math.PI * 2) * 6.5;
        const seaBreeze = cyc <= 6 || (cyc >= 22 && cyc <= 24);
        return {
          temp,
          humidity: seaBreeze ? 52 : 38,
          rainChance: 5,
          windSpeed: seaBreeze ? 28 : 14,
          windDir: seaBreeze ? "SW" : "ENE",
          icon: "sunny",
        };
      },
    }),
  },
];
