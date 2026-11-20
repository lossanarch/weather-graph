import { LitElement, type PropertyDeclarations, css, html } from "lit";
import type { HomeAssistant, WeatherGraphCardConfig } from "../types";

export class WeatherGraphCardEditor extends LitElement {
  static properties: PropertyDeclarations = {
    hass: { attribute: false },
    _config: { state: true },
  };

  declare hass?: HomeAssistant;
  declare private _config: WeatherGraphCardConfig;

  constructor() {
    super();
    this._config = {
      type: "custom:weather-graph-card",
    };
  }

  static styles = css`
    :host {
      display: block;
      font-family: inherit;
    }

    .editor-grid {
      display: grid;
      gap: 14px;
      padding: 8px 0;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    label {
      font-size: 13px;
      font-weight: 600;
      color: var(--primary-text-color, #e2e8f0);
    }

    .hint {
      font-size: 11.5px;
      color: var(--secondary-text-color, #94a3b8);
    }

    input[type="text"],
    input[type="number"],
    select {
      padding: 8px 10px;
      border-radius: 8px;
      border: 1px solid var(--divider-color, rgba(148, 163, 184, 0.3));
      background: var(--card-background-color, #0f172a);
      color: var(--primary-text-color, #f8fafc);
      font-size: 14px;
    }

    .row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .toggles {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      padding-top: 4px;
    }

    .toggle-item {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      font-size: 13.5px;
      cursor: pointer;
    }
  `;

  public setConfig(config: WeatherGraphCardConfig): void {
    this._config = { ...config };
  }

  private _update<K extends keyof WeatherGraphCardConfig>(
    key: K,
    value: WeatherGraphCardConfig[K]
  ): void {
    const nextConfig: WeatherGraphCardConfig = {
      ...this._config,
      [key]: value,
    };
    this._config = nextConfig;
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: nextConfig },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    const weatherEntities = Object.keys(this.hass?.states ?? {})
      .filter((id) => id.startsWith("weather."))
      .sort((a, b) => {
        const aHourly = a.endsWith("_hourly") ? -1 : 0;
        const bHourly = b.endsWith("_hourly") ? -1 : 0;
        if (aHourly !== bHourly) return aHourly - bHourly;
        return a.localeCompare(b);
      });

    return html`
      <div class="editor-grid">
        <div class="field">
          <label for="wg-entity">Weather Entity (BOM Hourly preferred)</label>
          <select
            id="wg-entity"
            .value=${this._config.entity ?? ""}
            @change=${(e: Event) =>
              this._update("entity", (e.target as HTMLSelectElement).value || undefined)}
          >
            <option value="">Auto-detect BOM / Hourly Weather</option>
            ${weatherEntities.map((id) => {
              const friendly =
                (this.hass?.states[id]?.attributes?.friendly_name as string) || id;
              return html`
                <option value=${id} ?selected=${this._config.entity === id}>
                  ${friendly} (${id})
                </option>
              `;
            })}
          </select>
          <span class="hint">
            Selecting a daily BOM entity (e.g. weather.sydney) automatically resolves to weather.sydney_hourly.
          </span>
        </div>

        <div class="field">
          <label for="wg-title">Card Title</label>
          <input
            id="wg-title"
            type="text"
            .value=${this._config.title ?? "Next 48 Hours"}
            @input=${(e: Event) =>
              this._update("title", (e.target as HTMLInputElement).value)}
          />
        </div>

        <div class="row-2">
          <div class="field">
            <label for="wg-hours">Forecast Horizon (hours)</label>
            <input
              id="wg-hours"
              type="number"
              min="12"
              max="72"
              step="6"
              .value=${String(this._config.hours_to_show ?? 48)}
              @change=${(e: Event) =>
                this._update(
                  "hours_to_show",
                  Math.max(12, Math.min(72, Number((e.target as HTMLInputElement).value) || 48))
                )}
            />
          </div>

          <div class="field">
            <label for="wg-vis-hours">Viewport Width (hours)</label>
            <input
              id="wg-vis-hours"
              type="number"
              min="12"
              max="48"
              step="6"
              .value=${String(this._config.visible_hours ?? 24)}
              @change=${(e: Event) =>
                this._update(
                  "visible_hours",
                  Math.max(12, Math.min(48, Number((e.target as HTMLInputElement).value) || 24))
                )}
            />
          </div>
        </div>

        <div class="field">
          <label>Default Enabled Layers</label>
          <div class="toggles">
            <label class="toggle-item">
              <input
                type="checkbox"
                .checked=${this._config.show_temperature !== false}
                @change=${(e: Event) =>
                  this._update("show_temperature", (e.target as HTMLInputElement).checked)}
              />
              Temperature
            </label>
            <label class="toggle-item">
              <input
                type="checkbox"
                .checked=${this._config.show_rain !== false}
                @change=${(e: Event) =>
                  this._update("show_rain", (e.target as HTMLInputElement).checked)}
              />
              Chance Rain
            </label>
            <label class="toggle-item">
              <input
                type="checkbox"
                .checked=${this._config.show_wind !== false}
                @change=${(e: Event) =>
                  this._update("show_wind", (e.target as HTMLInputElement).checked)}
              />
              Wind
            </label>
            <label class="toggle-item">
              <input
                type="checkbox"
                .checked=${Boolean(this._config.show_location)}
                @change=${(e: Event) =>
                  this._update("show_location", (e.target as HTMLInputElement).checked)}
              />
              Location Subtitle
            </label>
          </div>
        </div>
      </div>
    `;
  }
}

if (!customElements.get("weather-graph-card-editor")) {
  customElements.define(
    "weather-graph-card-editor",
    WeatherGraphCardEditor
  );
}

declare global {
  interface HTMLElementTagNameMap {
    "weather-graph-card-editor": WeatherGraphCardEditor;
  }
}
