import { LitElement, type PropertyDeclarations, css, html } from "lit";
import type {
  HassEntityState,
  HomeAssistant,
  NormalizedForecastPayload,
  WeatherGraphCardConfig,
} from "../types";
import "../weather-graph-card";
import { SAMPLE_BOM_PROFILES } from "./bom-sample-profiles";

function createSimulatedHass(): HomeAssistant {
  const states: Record<string, HassEntityState> = {};

  for (const prof of SAMPLE_BOM_PROFILES) {
    states[prof.dailyEntityId] = {
      entity_id: prof.dailyEntityId,
      state: "partlycloudy",
      attributes: {
        friendly_name: `${prof.payload.location.name} (BOM Daily)`,
        supported_features: 1,
        temperature: prof.payload.current?.temperature ?? 24,
        humidity: prof.payload.current?.humidity ?? 65,
        wind_speed: prof.payload.current?.wind_speed_kmh ?? 15,
        wind_bearing: prof.payload.current?.wind_direction ?? "N",
        temperature_unit: "°C",
        wind_speed_unit: "km/h",
      },
    };

    states[prof.hourlyEntityId] = {
      entity_id: prof.hourlyEntityId,
      state: "lightning-rainy",
      attributes: {
        friendly_name: `${prof.payload.location.name} Hourly (BOM)`,
        supported_features: 2,
        temperature: prof.payload.current?.temperature ?? 24,
        humidity: prof.payload.current?.humidity ?? 65,
        wind_speed: prof.payload.current?.wind_speed_kmh ?? 15,
        wind_bearing: prof.payload.current?.wind_direction ?? "N",
        temperature_unit: "°C",
        wind_speed_unit: "km/h",
      },
    };
  }

  return {
    states,
    config: {
      time_zone: "Australia/Sydney",
      unit_system: {
        temperature: "°C",
        wind_speed: "km/h",
        accumulated_precipitation: "mm",
      },
    },
    connection: {
      async subscribeMessage<T>(
        callback: (msg: T) => void,
        subscribeMessage: Record<string, unknown>
      ): Promise<() => void> {
        const msgType = String(subscribeMessage.type ?? "");
        const entityId = String(subscribeMessage.entity_id ?? "weather.sydney_hourly");
        const hours = Number(subscribeMessage.hours ?? 48);

        const matched =
          SAMPLE_BOM_PROFILES.find(
            (p) =>
              p.hourlyEntityId === entityId || p.dailyEntityId === entityId
          ) ?? SAMPLE_BOM_PROFILES[0];

        if (msgType === "weather_graph/subscribe_forecast") {
          const sliced: NormalizedForecastPayload = {
            ...matched.payload,
            hourly: matched.payload.hourly.slice(0, hours),
          };
          queueMicrotask(() => callback(sliced as unknown as T));
          return () => {};
        }

        throw new Error(`Unsupported mock command: ${msgType}`);
      },
      async sendMessagePromise<T>(): Promise<T> {
        return {} as T;
      },
    },
  };
}

export class WgPreviewWorkbench extends LitElement {
  static properties: PropertyDeclarations = {
    _hass: { state: true },
    _activeProfileId: { state: true },
    _cardConfig: { state: true },
  };

  declare private _hass: HomeAssistant;
  declare private _activeProfileId: string;
  declare private _cardConfig: WeatherGraphCardConfig;

  constructor() {
    super();
    this._hass = createSimulatedHass();
    this._activeProfileId = SAMPLE_BOM_PROFILES[0].id;
    this._cardConfig = {
      type: "custom:weather-graph-card",
      entity: SAMPLE_BOM_PROFILES[0].hourlyEntityId,
      title: "Next 48 Hours",
      hours_to_show: 48,
      visible_hours: 24,
      show_temperature: true,
      show_rain: true,
      show_wind: true,
      show_location: false,
    };
  }

  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
      background: radial-gradient(circle at top left, #132844 0%, #07111e 65%);
      color: #e2e8f0;
      font-family: "Plus Jakarta Sans", "Inter", system-ui, -apple-system, sans-serif;
    }

    .shell {
      max-width: 1120px;
      margin: 0 auto;
      padding: 28px 20px 56px;
    }

    .topbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      margin-bottom: 24px;
    }

    .brand h1 {
      margin: 0;
      font-size: 22px;
      font-weight: 700;
      color: #f8fafc;
      letter-spacing: -0.015em;
    }

    .brand p {
      margin: 4px 0 0;
      font-size: 13.5px;
      color: #94adc9;
    }

    .sample-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      border-radius: 999px;
      background: rgba(76, 201, 240, 0.12);
      border: 1px solid rgba(76, 201, 240, 0.3);
      color: #7dd3fc;
      font-size: 12px;
      font-weight: 600;
    }

    .profile-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 20px;
    }

    .profile-pill {
      appearance: none;
      border: 1px solid rgba(148, 179, 209, 0.22);
      background: rgba(15, 33, 55, 0.72);
      color: #cbd5e1;
      padding: 8px 14px;
      border-radius: 9px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .profile-pill:hover {
      border-color: rgba(245, 190, 54, 0.5);
      color: #ffffff;
    }

    .profile-pill.active {
      background: #173454;
      border-color: #f5be36;
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
    }

    .workspace-grid {
      display: grid;
      grid-template-columns: minmax(0, 560px) minmax(300px, 1fr);
      gap: 24px;
      align-items: start;
    }

    .panel {
      background: rgba(12, 25, 43, 0.85);
      border: 1px solid rgba(148, 179, 209, 0.16);
      border-radius: 14px;
      padding: 18px 20px;
    }

    .panel h3 {
      margin: 0 0 6px;
      font-size: 15px;
      font-weight: 700;
      color: #f8fafc;
    }

    .panel p.sub {
      margin: 0 0 14px;
      font-size: 12.5px;
      color: #94adc9;
      line-height: 1.45;
    }

    pre.yaml-box {
      margin: 14px 0 0;
      padding: 12px 14px;
      border-radius: 9px;
      background: #060e1a;
      border: 1px solid rgba(148, 179, 209, 0.16);
      color: #bae6fd;
      font-size: 12.5px;
      line-height: 1.5;
      overflow-x: auto;
    }

    .hint-bar {
      margin-top: 12px;
      font-size: 12.5px;
      color: #94adc9;
      display: flex;
      justify-content: space-between;
      gap: 10px;
    }

    @media (max-width: 900px) {
      .workspace-grid {
        grid-template-columns: 1fr;
      }
    }
  `;

  private _selectProfile(profileId: string): void {
    const prof = SAMPLE_BOM_PROFILES.find((p) => p.id === profileId);
    if (!prof) return;
    this._activeProfileId = prof.id;
    this._cardConfig = {
      ...this._cardConfig,
      entity: prof.hourlyEntityId,
    };
  }

  private _onEditorConfigChanged(
    ev: CustomEvent<{ config: WeatherGraphCardConfig }>
  ): void {
    this._cardConfig = { ...ev.detail.config };
    const matched = SAMPLE_BOM_PROFILES.find(
      (p) =>
        p.hourlyEntityId === this._cardConfig.entity ||
        p.dailyEntityId === this._cardConfig.entity
    );
    if (matched) {
      this._activeProfileId = matched.id;
    }
  }

  private _formatYaml(): string {
    const lines = [
      "type: custom:weather-graph-card",
      `entity: ${this._cardConfig.entity || "weather.sydney_hourly"}`,
    ];
    if (this._cardConfig.title && this._cardConfig.title !== "Next 48 Hours") {
      lines.push(`title: "${this._cardConfig.title}"`);
    }
    if (this._cardConfig.hours_to_show && this._cardConfig.hours_to_show !== 48) {
      lines.push(`hours_to_show: ${this._cardConfig.hours_to_show}`);
    }
    if (this._cardConfig.visible_hours && this._cardConfig.visible_hours !== 24) {
      lines.push(`visible_hours: ${this._cardConfig.visible_hours}`);
    }
    if (this._cardConfig.show_temperature === false) {
      lines.push("show_temperature: false");
    }
    if (this._cardConfig.show_rain === false) {
      lines.push("show_rain: false");
    }
    if (this._cardConfig.show_wind === false) {
      lines.push("show_wind: false");
    }
    if (this._cardConfig.show_location) {
      lines.push("show_location: true");
    }
    return lines.join("\n");
  }

  render() {
    const activeProfile =
      SAMPLE_BOM_PROFILES.find((p) => p.id === this._activeProfileId) ??
      SAMPLE_BOM_PROFILES[0];

    return html`
      <div class="shell">
        <header class="topbar">
          <div class="brand">
            <h1>Weather Graph for Home Assistant</h1>
            <p>
              HACS Custom Integration + Lovelace Card backed by
              <code>bremor/bureau_of_meteorology</code>
            </p>
          </div>
          <span class="sample-badge">
            Sample BOM Preview Data (Live HA uses WebSocket subscription)
          </span>
        </header>

        <div class="profile-bar" role="tablist" aria-label="Sample Australian BOM locations">
          ${SAMPLE_BOM_PROFILES.map(
            (prof) => html`
              <button
                type="button"
                class="profile-pill ${prof.id === this._activeProfileId
                  ? "active"
                  : ""}"
                @click=${() => this._selectProfile(prof.id)}
              >
                ${prof.label}
              </button>
            `
          )}
        </div>

        <div class="workspace-grid">
          <div>
            <weather-graph-card
              .hass=${this._hass}
            ></weather-graph-card>
            <div class="hint-bar">
              <span>Click or drag across the graph to scrub any hour; scroll horizontally for hours 25-48.</span>
            </div>
          </div>

          <div class="panel">
            <h3>Lovelace Visual Card Editor</h3>
            <p class="sub">${activeProfile.description}</p>

            <weather-graph-card-editor
              .hass=${this._hass}
              @config-changed=${this._onEditorConfigChanged}
            ></weather-graph-card-editor>

            <h3 style="margin-top: 18px;">Generated Dashboard YAML</h3>
            <pre class="yaml-box"><code>${this._formatYaml()}</code></pre>
          </div>
        </div>
      </div>
    `;
  }

  protected firstUpdated(): void {
    this._syncChildConfigs();
  }

  protected updated(changed: Map<string, unknown>): void {
    if (changed.has("_cardConfig")) {
      this._syncChildConfigs();
    }
  }

  private _syncChildConfigs(): void {
    const cardEl = this.shadowRoot?.querySelector("weather-graph-card");
    if (cardEl) {
      cardEl.setConfig(this._cardConfig);
    }
    const editorEl = this.shadowRoot?.querySelector(
      "weather-graph-card-editor"
    );
    if (editorEl) {
      editorEl.setConfig(this._cardConfig);
    }
  }
}

if (!customElements.get("wg-preview-workbench")) {
  customElements.define("wg-preview-workbench", WgPreviewWorkbench);
}
