import { LitElement, type PropertyDeclarations, css, html, nothing } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import "./components/forecast-chart";
import { renderSummaryHeader } from "./components/summary-header";
import { DEFAULT_TITLE } from "./constants";
import "./editor/weather-graph-card-editor";
import { renderWindLegendArrowHtml } from "./icons/weather-icons";
import { buildThemeVars, resolveModePalette } from "./theme/palette";
import { getPreviewPaletteMode, onPreviewPaletteModeChange } from "./theme/preview-mode";
import type {
  CurrentObservation,
  HomeAssistant,
  NormalizedForecastPayload,
  WeatherGraphCardConfig,
} from "./types";
import {
  computeDewPointC,
  normalizeClientHaForecast,
  normalizeWindBearing,
  resolveWeatherEntityId,
} from "./utils/forecast-utils";
import { normalizeSummaryMetrics, resolveUvTimes } from "./utils/summary-metrics";

const CARD_VERSION = "1.3.1";

export class WeatherGraphCard extends LitElement {
  static properties: PropertyDeclarations = {
    hass: { attribute: false },
    samplePayload: { attribute: false },
    _config: { state: true },
    _payload: { state: true },
    _selectedIndex: { state: true },
    _showTemperature: { state: true },
    _showRain: { state: true },
    _showWind: { state: true },
    _loading: { state: true },
    _error: { state: true },
    _prefersDark: { state: true },
  };

  declare hass?: HomeAssistant;
  declare samplePayload?: NormalizedForecastPayload;
  declare private _config: WeatherGraphCardConfig;
  declare private _payload: NormalizedForecastPayload | null;
  declare private _selectedIndex: number;
  declare private _showTemperature: boolean;
  declare private _showRain: boolean;
  declare private _showWind: boolean;
  declare private _loading: boolean;
  declare private _error: string | null;
  declare private _prefersDark: boolean;

  constructor() {
    super();
    this._config = {
      type: "custom:weather-graph-card",
      hours_to_show: 48,
      visible_hours: 24,
      show_temperature: true,
      show_rain: true,
      show_wind: true,
    };
    this._payload = null;
    this._selectedIndex = 0;
    this._showTemperature = true;
    this._showRain = true;
    this._showWind = true;
    this._loading = true;
    this._error = null;
    this._prefersDark = true;
  }

  private _darkQuery?: MediaQueryList;
  private _unsubPreviewMode?: () => void;
  private readonly _onSchemeChange = (e: MediaQueryListEvent) => {
    this._prefersDark = e.matches;
  };
  private _unsubForecast?: () => void;
  private _subscribedKey = "";
  private _subscribing = false;

  static styles = css`
    :host {
      display: block;
      font-family: "Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont,
        "Segoe UI", Roboto, sans-serif;
    }

    .wg-card {
      container: wg-card / inline-size;
      background: var(--wg-bg);
      color: var(--wg-text);
      border-radius: var(--ha-card-border-radius, 14px);
      border: 1px solid var(--wg-border);
      box-shadow: var(--ha-card-box-shadow, 0 10px 28px var(--wg-shadow));
      overflow: hidden;
    }

    .wg-card-header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      padding: 18px 18px 12px;
      gap: 12px;
    }

    .wg-card-title {
      margin: 0;
      font-size: 21px;
      font-weight: 700;
      letter-spacing: -0.01em;
      color: var(--wg-text);
    }

    .wg-no-header .wg-summary-panel,
    .wg-no-header .wg-skeleton {
      margin-top: 14px;
    }

    .wg-card-subtitle {
      font-size: 12px;
      font-weight: 500;
      color: var(--wg-text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .wg-summary-panel {
      margin: 0 14px 14px;
      padding: 14px 18px;
      background: var(--wg-panel);
      border-radius: 10px;
      display: grid;
      grid-template-columns: auto minmax(110px, 1fr) auto;
      align-items: center;
      gap: 18px;
    }

    .wg-summary-panel.wg-no-metrics {
      grid-template-columns: auto 1fr;
    }

    .wg-summary-left {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      min-width: 58px;
    }

    .wg-summary-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 42px;
      filter: var(--wg-icon-filter, none);
    }

    .wg-summary-temp {
      font-size: 31px;
      font-weight: 600;
      line-height: 1.05;
      color: var(--wg-temp);
      font-variant-numeric: tabular-nums;
    }

    .wg-summary-center {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 6px;
    }

    .wg-summary-time {
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 0.02em;
      color: var(--wg-text);
    }

    .wg-summary-rain {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .wg-droplet {
      display: inline-flex;
      align-items: center;
    }

    .wg-summary-rain-val {
      font-size: 30px;
      font-weight: 600;
      line-height: 1.05;
      color: var(--wg-rain);
      font-variant-numeric: tabular-nums;
    }

    .wg-summary-metrics {
      display: grid;
      gap: 5px;
    }

    .wg-metric-row {
      display: grid;
      grid-template-columns: 92px auto;
      align-items: baseline;
      gap: 10px;
    }

    .wg-metric-label {
      font-size: 12.5px;
      font-weight: 500;
      letter-spacing: 0.03em;
      color: var(--wg-text-muted);
      text-transform: uppercase;
    }

    .wg-metric-value {
      font-size: 15.5px;
      font-weight: 700;
      color: var(--wg-text);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }

    .wg-legend-bar {
      display: flex;
      align-items: center;
      justify-content: space-around;
      padding: 12px 14px 14px;
      background: var(--wg-legend-bg);
      border-top: 1px solid var(--wg-border);
      gap: 8px;
    }

    .wg-legend-btn {
      appearance: none;
      background: transparent;
      border: none;
      padding: 4px 8px 8px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      font-family: inherit;
      font-size: 15px;
      font-weight: 700;
      position: relative;
      transition: opacity 0.18s ease, transform 0.12s ease;
    }

    .wg-legend-btn:hover {
      transform: translateY(-1px);
    }

    .wg-legend-btn::after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 3px;
      border-radius: 2px;
      background: currentColor;
      transition: opacity 0.18s ease, transform 0.18s ease;
    }

    .wg-legend-btn.inactive {
      opacity: 0.38;
    }

    .wg-legend-btn.inactive::after {
      transform: scaleX(0.35);
      opacity: 0.4;
    }

    .wg-legend-temp {
      color: var(--wg-temp);
    }

    .wg-legend-rain {
      color: var(--wg-rain);
    }

    .wg-legend-wind {
      color: var(--wg-wind);
    }

    .wg-status-box {
      padding: 36px 22px;
      text-align: center;
      color: var(--wg-text-muted);
      font-size: 14px;
      line-height: 1.5;
    }

    .wg-skeleton {
      margin: 0 14px 16px;
      height: 280px;
      border-radius: 10px;
      background: linear-gradient(
        90deg,
        var(--wg-skeleton-a) 25%,
        var(--wg-skeleton-b) 50%,
        var(--wg-skeleton-a) 75%
      );
      background-size: 200% 100%;
      animation: wg-shimmer 1.5s infinite linear;
    }

    @keyframes wg-shimmer {
      from {
        background-position: 200% 0;
      }
      to {
        background-position: -200% 0;
      }
    }

    @container wg-card (max-width: 480px) {
      .wg-summary-panel,
      .wg-summary-panel.wg-no-metrics {
        grid-template-columns: auto 1fr;
        gap: 12px 16px;
        padding: 12px 14px;
      }

      .wg-summary-center {
        flex-direction: row;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-evenly;
        gap: 6px 16px;
      }

      .wg-summary-metrics {
        grid-column: 1 / -1;
        grid-template-columns: repeat(var(--wg-metric-count, 3), 1fr);
        gap: 8px;
        padding-top: 8px;
        border-top: 1px solid var(--wg-border);
      }

      .wg-metric-row {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .wg-legend-btn {
        font-size: 13.5px;
      }
    }
  `;

  public static getConfigElement(): HTMLElement {
    return document.createElement("weather-graph-card-editor");
  }

  public static getStubConfig(hass?: HomeAssistant): WeatherGraphCardConfig {
    const resolved = resolveWeatherEntityId(hass);
    return {
      type: "custom:weather-graph-card",
      entity: resolved ?? undefined,
      hours_to_show: 48,
      visible_hours: 24,
      show_temperature: true,
      show_rain: true,
      show_wind: true,
    };
  }

  public setConfig(config: WeatherGraphCardConfig): void {
    if (!config) {
      throw new Error("Invalid Weather Graph Card configuration.");
    }
    this._config = {
      hours_to_show: 48,
      visible_hours: 24,
      show_temperature: true,
      show_rain: true,
      show_wind: true,
      ...config,
    };
    this._showTemperature = this._config.show_temperature !== false;
    this._showRain = this._config.show_rain !== false;
    this._showWind = this._config.show_wind !== false;

    if (this.hass) {
      void this._ensureSubscription();
    }
  }

  public getCardSize(): number {
    const hasHeader = this._config.show_title !== false || Boolean(this._config.show_location);
    return hasHeader ? 7 : 6;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this._darkQuery = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (this._darkQuery) {
      this._prefersDark = this._darkQuery.matches;
      this._darkQuery.addEventListener?.("change", this._onSchemeChange);
    }
    this._unsubPreviewMode = onPreviewPaletteModeChange(() => this.requestUpdate());
    if (this.samplePayload) {
      this._payload = this.samplePayload;
      this._loading = false;
    } else if (this.hass) {
      void this._ensureSubscription();
    }
  }

  disconnectedCallback(): void {
    this._darkQuery?.removeEventListener?.("change", this._onSchemeChange);
    this._darkQuery = undefined;
    this._unsubPreviewMode?.();
    this._unsubPreviewMode = undefined;
    this._teardownSubscription();
    super.disconnectedCallback();
  }

  protected updated(changed: Map<string, unknown>): void {
    if (changed.has("samplePayload") && this.samplePayload) {
      this._teardownSubscription();
      this._payload = this.samplePayload;
      this._selectedIndex = 0;
      this._loading = false;
      this._error = null;
      return;
    }

    if (changed.has("hass") && this.hass && !this.samplePayload) {
      void this._ensureSubscription();
    }
  }

  private _teardownSubscription(): void {
    if (this._unsubForecast) {
      try {
        this._unsubForecast();
      } catch {
        // Ignore stale websocket teardown errors
      }
      this._unsubForecast = undefined;
    }
    this._subscribedKey = "";
  }

  private async _ensureSubscription(): Promise<void> {
    if (!this.hass?.connection || this._subscribing) return;

    const resolvedEntity = resolveWeatherEntityId(
      this.hass,
      this._config.entity
    );
    const hours = Math.max(12, Math.min(72, this._config.hours_to_show ?? 48));
    const subKey = `${resolvedEntity ?? ""}::${this._config.bom_entry_id ?? ""}::${hours}`;

    if (subKey === this._subscribedKey && this._unsubForecast) {
      return;
    }

    this._teardownSubscription();
    this._subscribedKey = subKey;
    this._subscribing = true;
    this._loading = !this._payload;
    this._error = null;

    try {
      this._unsubForecast = await this.hass.connection.subscribeMessage<NormalizedForecastPayload>(
        (eventPayload) => {
          this._payload = eventPayload;
          if (this._selectedIndex >= eventPayload.hourly.length) {
            this._selectedIndex = 0;
          }
          this._loading = false;
          this._error = null;
        },
        {
          type: "weather_graph/subscribe_forecast",
          ...(resolvedEntity ? { entity_id: resolvedEntity } : {}),
          ...(this._config.bom_entry_id
            ? { entry_id: this._config.bom_entry_id }
            : {}),
          hours,
        }
      );
    } catch {
      if (!resolvedEntity) {
        this._loading = false;
        this._error =
          "No hourly weather entity found. Install Bureau of Meteorology (HACS) or set `entity:` in card config.";
        this._subscribing = false;
        return;
      }

      try {
        this._unsubForecast = await this.hass.connection.subscribeMessage<{
          type: string;
          forecast: Array<Record<string, unknown>> | null;
        }>(
          (event) => {
            if (!this.hass) return;
            const normalized = normalizeClientHaForecast(
              event.forecast ?? [],
              this.hass,
              resolvedEntity,
              hours
            );
            this._payload = normalized;
            if (this._selectedIndex >= normalized.hourly.length) {
              this._selectedIndex = 0;
            }
            this._loading = false;
            this._error = null;
          },
          {
            type: "weather/subscribe_forecast",
            entity_id: resolvedEntity,
            forecast_type: "hourly",
          }
        );
      } catch (fallbackErr) {
        this._loading = false;
        this._error = `Unable to subscribe to hourly forecast for ${resolvedEntity}: ${
          fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr)
        }`;
      }
    } finally {
      this._subscribing = false;
    }
  }

  private _resolveCurrentObservation(
    base: CurrentObservation | null
  ): CurrentObservation | null {
    if (!this.hass) return base;
    const readSensorNum = (entityId?: string): number | null => {
      if (!entityId) return null;
      const raw = this.hass?.states[entityId]?.state;
      if (raw === undefined) return null;
      const n = Number(raw);
      return Number.isFinite(n) ? n : null;
    };

    const tempOverride = readSensorNum(this._config.temperature_entity);
    const humOverride = readSensorNum(this._config.humidity_entity);
    const windSpeedOverride = readSensorNum(this._config.wind_speed_entity);
    const windDirRaw = this._config.wind_direction_entity
      ? this.hass.states[this._config.wind_direction_entity]?.state
      : undefined;
    const windDirParsed = windDirRaw
      ? normalizeWindBearing(windDirRaw)
      : { cardinal: null, degrees: null };

    if (
      tempOverride === null &&
      humOverride === null &&
      windSpeedOverride === null &&
      !windDirParsed.cardinal
    ) {
      return base;
    }

    const mergedTemp = tempOverride ?? base?.temperature ?? null;
    const mergedHum = humOverride ?? base?.humidity ?? null;

    return {
      temperature: mergedTemp,
      feels_like: base?.feels_like ?? null,
      humidity: mergedHum,
      dew_point: computeDewPointC(mergedTemp, mergedHum) ?? base?.dew_point ?? null,
      wind_speed_kmh: windSpeedOverride ?? base?.wind_speed_kmh ?? null,
      wind_gust_kmh: base?.wind_gust_kmh ?? null,
      wind_direction: windDirParsed.cardinal ?? base?.wind_direction ?? null,
      wind_bearing_deg: windDirParsed.degrees ?? base?.wind_bearing_deg ?? null,
      rain_since_9am_mm: base?.rain_since_9am_mm ?? null,
    };
  }

  private _onHourSelect(ev: CustomEvent<{ index: number }>): void {
    this._selectedIndex = ev.detail.index;
  }

  render() {
    const showTitle = this._config.show_title !== false;
    const title = this._config.title?.trim() || DEFAULT_TITLE;
    const hours = this._payload?.hourly ?? [];
    const selectedPoint =
      hours[Math.max(0, Math.min(hours.length - 1, this._selectedIndex))] ??
      null;
    const locationLabel =
      this._config.show_location && this._payload?.location?.name
        ? `${this._payload.location.name}${
            this._payload.location.state
              ? `, ${this._payload.location.state}`
              : ""
          }`
        : "";
    const hasHeader = showTitle || Boolean(locationLabel);

    // HA's own dark mode follows the system unless the user overrides it in their profile.
    const previewMode = getPreviewPaletteMode();
    const dark = previewMode
      ? previewMode === "dark"
      : (this.hass?.themes?.darkMode ?? this._prefersDark);
    const themeVars = buildThemeVars(resolveModePalette(this._config, dark ? "dark" : "light"));
    const timeZone =
      this._payload?.location?.timezone ?? this.hass?.config?.time_zone ?? "Australia/Sydney";
    const metrics = normalizeSummaryMetrics(this._config.metrics);

    return html`
      <div class="wg-card ${hasHeader ? "" : "wg-no-header"}" style=${styleMap(themeVars)}>
        ${hasHeader
          ? html`
              <div class="wg-card-header">
                ${showTitle ? html`<h2 class="wg-card-title">${title}</h2>` : nothing}
                ${locationLabel
                  ? html`<span class="wg-card-subtitle">${locationLabel}</span>`
                  : nothing}
              </div>
            `
          : nothing}

        ${this._loading
          ? html`<div class="wg-skeleton" aria-label="Loading forecast"></div>`
          : this._error
          ? html`<div class="wg-status-box">${this._error}</div>`
          : !selectedPoint
          ? html`
              <div class="wg-status-box">
                No hourly forecast points available for the selected weather entity.
              </div>
            `
          : html`
              <div class="wg-card-body">
                ${renderSummaryHeader({
                  point: selectedPoint,
                  isFirstHour: this._selectedIndex === 0,
                  currentObs: this._resolveCurrentObservation(
                    this._payload?.current ?? null
                  ),
                  timeZone,
                  metrics,
                  uvTimes: metrics.includes("uv_time")
                    ? resolveUvTimes(this._payload, selectedPoint.epoch_ms, timeZone)
                    : null,
                })}

                <wg-forecast-chart
                  .hours=${hours}
                  .sunWindows=${this._payload?.sun_windows ?? []}
                  .timeZone=${timeZone}
                  .selectedIndex=${this._selectedIndex}
                  .visibleHours=${this._config.visible_hours ?? 24}
                  .showTemperature=${this._showTemperature}
                  .showRain=${this._showRain}
                  .showWind=${this._showWind}
                  @hour-select=${this._onHourSelect}
                ></wg-forecast-chart>

                <div class="wg-legend-bar" role="group" aria-label="Toggle graph series">
                  <button
                    type="button"
                    class="wg-legend-btn wg-legend-temp ${this._showTemperature
                      ? ""
                      : "inactive"}"
                    aria-pressed=${String(this._showTemperature)}
                    @click=${() => {
                      this._showTemperature = !this._showTemperature;
                    }}
                  >
                    Temperature
                  </button>

                  <button
                    type="button"
                    class="wg-legend-btn wg-legend-rain ${this._showRain
                      ? ""
                      : "inactive"}"
                    aria-pressed=${String(this._showRain)}
                    @click=${() => {
                      this._showRain = !this._showRain;
                    }}
                  >
                    Chance Rain
                  </button>

                  <button
                    type="button"
                    class="wg-legend-btn wg-legend-wind ${this._showWind
                      ? ""
                      : "inactive"}"
                    aria-pressed=${String(this._showWind)}
                    @click=${() => {
                      this._showWind = !this._showWind;
                    }}
                  >
                    ${renderWindLegendArrowHtml(15)}
                    <span>Wind</span>
                  </button>
                </div>
              </div>
            `}
      </div>
    `;
  }
}

interface CustomCardEntry {
  type: string;
  name: string;
  description: string;
  preview?: boolean;
  documentationURL?: string;
}

if (!customElements.get("weather-graph-card")) {
  customElements.define("weather-graph-card", WeatherGraphCard);
}

declare global {
  interface Window {
    customCards?: CustomCardEntry[];
  }
  interface HTMLElementTagNameMap {
    "weather-graph-card": WeatherGraphCard;
  }
}

window.customCards = window.customCards || [];
if (
  !window.customCards.some((card) => card.type === "weather-graph-card")
) {
  window.customCards.push({
    type: "weather-graph-card",
    name: "Weather Graph",
    description:
      "Interactive 48-hour temperature, rain probability, and directional wind graph powered by Bureau of Meteorology (BOM) or Home Assistant weather.",
    preview: true,
  });
}

console.info(
  `%c WEATHER-GRAPH-CARD %c v${CARD_VERSION} `,
  "background:#1b1a2e;color:#ff8f6b;font-weight:700;padding:2px 6px;border-radius:4px 0 0 4px;",
  "background:#59c3c3;color:#1b1a2e;font-weight:700;padding:2px 6px;border-radius:0 4px 4px 0;"
);
