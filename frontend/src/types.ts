export interface WeatherGraphCardConfig {
  type: string;
  entity?: string;
  bom_entry_id?: string;
  title?: string;
  hours_to_show?: number;
  visible_hours?: number;
  show_temperature?: boolean;
  show_rain?: boolean;
  show_wind?: boolean;
  show_location?: boolean;
  show_feels_like_in_tooltip?: boolean;
  temperature_entity?: string;
  humidity_entity?: string;
  wind_speed_entity?: string;
  wind_direction_entity?: string;
}

export interface SunWindow {
  sunrise: string | null;
  sunrise_ms: number | null;
  sunset: string | null;
  sunset_ms: number | null;
}

export interface CurrentObservation {
  temperature: number | null;
  feels_like: number | null;
  humidity: number | null;
  dew_point: number | null;
  wind_speed_kmh: number | null;
  wind_gust_kmh: number | null;
  wind_direction: string | null;
  wind_bearing_deg: number | null;
  rain_since_9am_mm: number | null;
}

export interface NormalizedHourPoint {
  datetime: string;
  epoch_ms: number;
  temperature: number | null;
  feels_like: number | null;
  humidity: number | null;
  dew_point: number | null;
  rain_chance: number;
  rain_min_mm: number | null;
  rain_max_mm: number | null;
  wind_speed_kmh: number;
  wind_gust_kmh: number | null;
  wind_direction: string | null;
  wind_bearing_deg: number | null;
  icon_descriptor: string | null;
  condition: string;
  is_night: boolean;
  uv_index: number | null;
}

export interface NormalizedForecastPayload {
  source: "bureau_of_meteorology" | "homeassistant_weather" | "sample";
  entity_id: string | null;
  location: {
    name: string;
    state: string | null;
    timezone: string;
  };
  units: {
    temperature: string;
    wind_speed: string;
    precipitation: string;
  };
  current: CurrentObservation | null;
  sun_windows: SunWindow[];
  hourly: NormalizedHourPoint[];
}

export interface AxisScale {
  min: number;
  max: number;
  step: number;
  ticks: number[]; // Ordered bottom -> top (length 5)
}

export interface DualAxisScales {
  temp: AxisScale;
  wind: AxisScale;
  gridCount: number;
}

export interface DayNightBand {
  startX: number;
  endX: number;
  isNight: boolean;
}

export interface HassEntityState {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed?: string;
  last_updated?: string;
}

export interface HassConnection {
  subscribeMessage<T>(
    callback: (msg: T) => void,
    subscribeMessage: Record<string, unknown>
  ): Promise<() => void>;
  sendMessagePromise<T>(message: Record<string, unknown>): Promise<T>;
}

export interface HomeAssistant {
  states: Record<string, HassEntityState>;
  config: {
    latitude?: number;
    longitude?: number;
    time_zone?: string;
    unit_system?: {
      temperature?: string;
      wind_speed?: string;
      accumulated_precipitation?: string;
    };
  };
  connection: HassConnection;
  callWS?: <T>(msg: Record<string, unknown>) => Promise<T>;
}
