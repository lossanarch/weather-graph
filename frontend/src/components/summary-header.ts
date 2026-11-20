import { html, type TemplateResult } from "lit";
import {
  renderRainDropletHtml,
  renderWeatherIconHtml,
  resolveWeatherVisualKind,
} from "../icons/weather-icons";
import type { CurrentObservation, NormalizedHourPoint } from "../types";
import { formatHeaderDayHour } from "../utils/forecast-utils";

export interface SummaryHeaderProps {
  point: NormalizedHourPoint;
  isFirstHour: boolean;
  currentObs: CurrentObservation | null;
  timeZone: string;
}

export function renderSummaryHeader({
  point,
  isFirstHour,
  currentObs,
  timeZone,
}: SummaryHeaderProps): TemplateResult {
  const temp =
    isFirstHour && currentObs?.temperature !== null && currentObs?.temperature !== undefined
      ? currentObs.temperature
      : point.temperature;

  const humidity =
    isFirstHour && currentObs?.humidity !== null && currentObs?.humidity !== undefined
      ? currentObs.humidity
      : point.humidity;

  const dewPoint =
    isFirstHour && currentObs?.dew_point !== null && currentObs?.dew_point !== undefined
      ? currentObs.dew_point
      : point.dew_point;

  const windSpeed =
    isFirstHour &&
    currentObs?.wind_speed_kmh !== null &&
    currentObs?.wind_speed_kmh !== undefined
      ? currentObs.wind_speed_kmh
      : point.wind_speed_kmh;

  const windDir =
    (isFirstHour && currentObs?.wind_direction ? currentObs.wind_direction : null) ??
    point.wind_direction ??
    "";

  const visualKind = resolveWeatherVisualKind(
    point.icon_descriptor,
    point.condition,
    point.is_night
  );

  const tempDisplay =
    temp !== null && temp !== undefined ? `${Math.round(temp)}°` : "--°";
  const rainDisplay = `${Math.round(point.rain_chance)}%`;
  const timeDisplay = formatHeaderDayHour(point.epoch_ms, timeZone);
  const windDisplay =
    windSpeed <= 0.4 && !windDir
      ? "Calm"
      : `${windDir ? `${windDir} ` : ""}${Math.round(windSpeed)} km/h`;
  const humidityDisplay =
    humidity !== null && humidity !== undefined ? `${Math.round(humidity)}%` : "--%";
  const dewPointDisplay =
    dewPoint !== null && dewPoint !== undefined ? `${Math.round(dewPoint)}°C` : "--°C";

  return html`
    <div class="wg-summary-panel" role="region" aria-label="Selected hour forecast details">
      <div class="wg-summary-left">
        <div class="wg-summary-icon">
          ${renderWeatherIconHtml(visualKind, 42)}
        </div>
        <div class="wg-summary-temp">${tempDisplay}</div>
      </div>

      <div class="wg-summary-center">
        <div class="wg-summary-time">${timeDisplay}</div>
        <div class="wg-summary-rain" title="Chance of precipitation">
          <span class="wg-droplet">${renderRainDropletHtml(17)}</span>
          <span class="wg-summary-rain-val">${rainDisplay}</span>
        </div>
      </div>

      <div class="wg-summary-metrics">
        <div class="wg-metric-row">
          <span class="wg-metric-label">WIND</span>
          <span class="wg-metric-value">${windDisplay}</span>
        </div>
        <div class="wg-metric-row">
          <span class="wg-metric-label">HUMIDITY</span>
          <span class="wg-metric-value">${humidityDisplay}</span>
        </div>
        <div class="wg-metric-row">
          <span class="wg-metric-label">DEW POINT</span>
          <span class="wg-metric-value">${dewPointDisplay}</span>
        </div>
      </div>
    </div>
  `;
}
