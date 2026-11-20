import { html, nothing, type TemplateResult } from "lit";
import {
  renderRainDropletHtml,
  renderWeatherIconHtml,
  resolveWeatherVisualKind,
} from "../icons/weather-icons";
import type { CurrentObservation, NormalizedHourPoint, SummaryMetric } from "../types";
import { formatHeaderDayHour } from "../utils/forecast-utils";
import { formatSummaryMetric } from "../utils/summary-metrics";

export interface SummaryHeaderProps {
  point: NormalizedHourPoint;
  isFirstHour: boolean;
  currentObs: CurrentObservation | null;
  timeZone: string;
  metrics: SummaryMetric[];
}

export function renderSummaryHeader({
  point,
  isFirstHour,
  currentObs,
  timeZone,
  metrics,
}: SummaryHeaderProps): TemplateResult {
  const temp =
    isFirstHour && currentObs?.temperature !== null && currentObs?.temperature !== undefined
      ? currentObs.temperature
      : point.temperature;

  const visualKind = resolveWeatherVisualKind(
    point.icon_descriptor,
    point.condition,
    point.is_night
  );

  const tempDisplay =
    temp !== null && temp !== undefined ? `${Math.round(temp)}°` : "--°";
  const rainDisplay = `${Math.round(point.rain_chance)}%`;
  const timeDisplay = formatHeaderDayHour(point.epoch_ms, timeZone);

  return html`
    <div
      class="wg-summary-panel ${metrics.length === 0 ? "wg-no-metrics" : ""}"
      role="region"
      aria-label="Selected hour forecast details"
      style="--wg-metric-count: ${Math.max(1, metrics.length)}"
    >
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

      ${metrics.length > 0
        ? html`
            <div class="wg-summary-metrics">
              ${metrics.map((m) => {
                const { label, value } = formatSummaryMetric(m, point, isFirstHour, currentObs);
                return html`
                  <div class="wg-metric-row">
                    <span class="wg-metric-label">${label}</span>
                    <span class="wg-metric-value">${value}</span>
                  </div>
                `;
              })}
            </div>
          `
        : nothing}
    </div>
  `;
}
