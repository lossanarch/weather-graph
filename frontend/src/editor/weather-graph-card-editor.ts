import { LitElement, type PropertyDeclarations, css, html } from "lit";
import {
  DEFAULT_PALETTE_ID,
  PALETTE_PRESETS,
  PALETTE_SLOTS,
  type PaletteColors,
  type PaletteSlot,
  effectiveOverrides,
  getPalettePreset,
  resolvePalette,
} from "../theme/palette";
import { assignPaletteColors, paletteToCsv, parsePaletteInput } from "../theme/palette-import";
import type { HomeAssistant, SummaryMetric, WeatherGraphCardConfig } from "../types";
import {
  MAX_SUMMARY_METRICS,
  SUMMARY_METRIC_OPTIONS,
  normalizeSummaryMetrics,
} from "../utils/summary-metrics";

const PASTE_PLACEHOLDER = [
  "c7eae4,a7e8bd,fcbcb8,efa7a7,ffd972",
  "#c7eae4, #a7e8bd, #fcbcb8, #efa7a7, #ffd972",
  '["c7eae4","a7e8bd","fcbcb8","efa7a7","ffd972"]',
  '{"background":"c7eae4","rain":"efa7a7", ...}',
].join("\n");

export class WeatherGraphCardEditor extends LitElement {
  static properties: PropertyDeclarations = {
    hass: { attribute: false },
    _config: { state: true },
    _pasteText: { state: true },
    _pasteNote: { state: true },
  };

  declare hass?: HomeAssistant;
  declare private _config: WeatherGraphCardConfig;
  declare private _pasteText: string;
  declare private _pasteNote?: { kind: "error" | "success"; text: string };

  constructor() {
    super();
    this._config = {
      type: "custom:weather-graph-card",
    };
    this._pasteText = "";
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

    .row-3 {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 10px;
    }

    .section-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }

    .swatches {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 8px 12px;
    }

    .swatch {
      display: flex;
      align-items: center;
      gap: 9px;
      font-size: 13px;
      cursor: pointer;
    }

    .swatch input[type="color"] {
      width: 34px;
      height: 28px;
      padding: 0;
      border: 1px solid var(--divider-color, rgba(148, 163, 184, 0.3));
      border-radius: 6px;
      background: none;
      cursor: pointer;
      flex: none;
    }

    .swatch-text {
      display: flex;
      flex-direction: column;
      line-height: 1.25;
    }

    .swatch-hex {
      font-size: 11px;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      color: var(--secondary-text-color, #94a3b8);
    }

    .swatch-hex.custom {
      color: var(--primary-color, #03a9f4);
    }

    .revert-btn {
      appearance: none;
      border: 1px solid var(--divider-color, rgba(148, 163, 184, 0.3));
      background: transparent;
      color: var(--primary-text-color, #f8fafc);
      border-radius: 8px;
      padding: 6px 12px;
      font: inherit;
      font-size: 12.5px;
      font-weight: 600;
      cursor: pointer;
    }

    .paste-box {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 6px;
    }

    .paste-box textarea {
      min-height: 84px;
      resize: vertical;
      padding: 8px 10px;
      border-radius: 8px;
      border: 1px solid var(--divider-color, rgba(148, 163, 184, 0.3));
      background: var(--card-background-color, #0f172a);
      color: var(--primary-text-color, #f8fafc);
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 12.5px;
      line-height: 1.45;
    }

    .paste-box textarea[aria-invalid="true"] {
      border-color: var(--error-color, #ef4444);
    }

    .paste-actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
    }

    .paste-actions .spacer {
      flex: 1;
    }

    .apply-btn {
      background: var(--primary-color, #03a9f4);
      border-color: transparent;
      color: var(--text-primary-color, #ffffff);
    }

    .paste-note {
      font-size: 12px;
    }

    .paste-note.error {
      color: var(--error-color, #ef4444);
    }

    .paste-note.success {
      color: var(--success-color, #22c55e);
    }

    .revert-btn:disabled {
      opacity: 0.4;
      cursor: default;
    }

    @media (max-width: 420px) {
      .row-3 {
        grid-template-columns: 1fr;
      }
    }
  `;

  public setConfig(config: WeatherGraphCardConfig): void {
    this._config = { ...config };
  }

  private _update<K extends keyof WeatherGraphCardConfig>(
    key: K,
    value: WeatherGraphCardConfig[K]
  ): void {
    const nextConfig: WeatherGraphCardConfig = { ...this._config };
    if (value === undefined) {
      delete nextConfig[key];
    } else {
      nextConfig[key] = value;
    }
    this._emit(nextConfig);
  }

  private _emit(nextConfig: WeatherGraphCardConfig): void {
    this._config = nextConfig;
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: nextConfig },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _setMetric(position: number, value: string): void {
    const current: Array<SummaryMetric | ""> = normalizeSummaryMetrics(this._config.metrics);
    while (current.length < MAX_SUMMARY_METRICS) current.push("");
    current[position] = value as SummaryMetric | "";
    const next = current.filter(
      (m, i): m is SummaryMetric => m !== "" && current.indexOf(m) === i
    );
    this._update("metrics", next);
  }

  private _setPalette(paletteId: string): void {
    const nextConfig: WeatherGraphCardConfig = { ...this._config, palette: paletteId };
    delete nextConfig.colors;
    this._emit(nextConfig);
  }

  private _setColor(slot: PaletteSlot, value: string): void {
    const overrides = effectiveOverrides(this._config.palette, {
      ...this._config.colors,
      [slot]: value,
    });
    this._update("colors", Object.keys(overrides).length > 0 ? overrides : undefined);
  }

  private _applyColors(colors: PaletteColors): void {
    const overrides = effectiveOverrides(this._config.palette, colors);
    this._update("colors", Object.keys(overrides).length > 0 ? overrides : undefined);
  }

  private _applyPaste(): void {
    const parsed = parsePaletteInput(this._pasteText);
    if (!parsed.ok) {
      this._pasteNote = { kind: "error", text: parsed.error };
      return;
    }
    const current = resolvePalette(this._config.palette, this._config.colors);
    const { colors, mode, count } = assignPaletteColors(parsed.input, current);
    this._applyColors(colors);
    this._pasteText = "";
    const plural = count === 1 ? "colour" : "colours";
    const text =
      mode === "keyed"
        ? `Applied ${count} ${plural} to the named slots.`
        : mode === "ordered"
          ? "Applied 6 colours in slot order."
          : `${count} ${plural} auto-assigned. Drag swatches to rearrange.`;
    this._pasteNote = { kind: "success", text };
  }

  private async _copyCurrent(): Promise<void> {
    const csv = paletteToCsv(resolvePalette(this._config.palette, this._config.colors));
    try {
      await navigator.clipboard.writeText(csv);
      this._pasteNote = { kind: "success", text: "Current palette copied as CSV." };
    } catch {
      // Clipboard access needs a secure context, which plain-http HA installs lack.
      this._pasteText = csv;
      this._pasteNote = { kind: "success", text: "Current palette placed in the box to copy." };
      await this.updateComplete;
      this.shadowRoot?.querySelector<HTMLTextAreaElement>("#wg-paste")?.select();
    }
  }

  private _renderPasteBox() {
    const invalid = this._pasteNote?.kind === "error";
    return html`
      <div class="paste-box">
        <label for="wg-paste">Paste a Palette</label>
        <textarea
          id="wg-paste"
          spellcheck="false"
          aria-invalid=${invalid ? "true" : "false"}
          aria-describedby="wg-paste-note"
          placeholder=${PASTE_PLACEHOLDER}
          .value=${this._pasteText}
          @input=${(e: Event) => {
            this._pasteText = (e.target as HTMLTextAreaElement).value;
            if (invalid) this._pasteNote = undefined;
          }}
          @keydown=${(e: KeyboardEvent) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              this._applyPaste();
            }
          }}
        ></textarea>
        <div class="paste-actions">
          <button
            type="button"
            class="revert-btn apply-btn"
            ?disabled=${!this._pasteText.trim()}
            @click=${() => this._applyPaste()}
          >
            Apply
          </button>
          <button type="button" class="revert-btn" @click=${() => this._copyCurrent()}>
            Copy current
          </button>
          <span class="spacer"></span>
          <span id="wg-paste-note" class="paste-note ${this._pasteNote?.kind ?? ""}" role="status">
            ${this._pasteNote?.text ?? ""}
          </span>
        </div>
        <span class="hint">
          CSV, JSON, or any text with hex codes, such as a Coolors link. Five colours are
          auto-assigned; six fill the slots in order. Ctrl/⌘+Enter applies.
        </span>
      </div>
    `;
  }

  private _renderMetricsSection() {
    const metrics = normalizeSummaryMetrics(this._config.metrics);
    return html`
      <div class="field">
        <label>Summary Fields</label>
        <div class="row-3">
          ${Array.from({ length: MAX_SUMMARY_METRICS }, (_, i) => {
            const selected: SummaryMetric | "" = i < metrics.length ? metrics[i] : "";
            return html`
              <select
                aria-label="Summary field ${i + 1}"
                .value=${selected}
                @change=${(e: Event) =>
                  this._setMetric(i, (e.target as HTMLSelectElement).value)}
              >
                <option value="" ?selected=${selected === ""}>None</option>
                ${SUMMARY_METRIC_OPTIONS.map(
                  (opt) => html`
                    <option
                      value=${opt.id}
                      ?selected=${selected === opt.id}
                      ?disabled=${selected !== opt.id && metrics.includes(opt.id)}
                    >
                      ${opt.label}
                    </option>
                  `
                )}
              </select>
            `;
          })}
        </div>
        <span class="hint">Shown beside the selected hour's time and chance of rain.</span>
      </div>
    `;
  }

  private _renderColorsSection() {
    const preset = getPalettePreset(this._config.palette);
    const overrides = effectiveOverrides(this._config.palette, this._config.colors);
    const colors = resolvePalette(this._config.palette, this._config.colors);
    const hasOverrides = Object.keys(overrides).length > 0;

    return html`
      <div class="field">
        <div class="section-head">
          <label for="wg-palette">Colour Palette</label>
          <button
            type="button"
            class="revert-btn"
            ?disabled=${!hasOverrides}
            @click=${() => this._update("colors", undefined)}
          >
            Revert to ${preset.name}
          </button>
        </div>
        <select
          id="wg-palette"
          .value=${preset.id}
          @change=${(e: Event) => this._setPalette((e.target as HTMLSelectElement).value)}
        >
          ${PALETTE_PRESETS.map(
            (p) => html`
              <option value=${p.id} ?selected=${p.id === preset.id}>
                ${p.name}${p.id === DEFAULT_PALETTE_ID ? " (default)" : ""}
              </option>
            `
          )}
        </select>
        <div class="swatches">
          ${PALETTE_SLOTS.map(
            ({ slot, label }) => html`
              <label class="swatch">
                <input
                  type="color"
                  .value=${colors[slot]}
                  @input=${(e: Event) =>
                    this._setColor(slot, (e.target as HTMLInputElement).value)}
                />
                <span class="swatch-text">
                  <span>${label}</span>
                  <span class="swatch-hex ${overrides[slot] ? "custom" : ""}">
                    ${colors[slot]}${overrides[slot] ? " (custom)" : ""}
                  </span>
                </span>
              </label>
            `
          )}
        </div>
        <span class="hint">
          Pick a built-in palette, then adjust any colour. Changing palette clears custom colours.
        </span>
        ${this._renderPasteBox()}
      </div>
    `;
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

        ${this._renderMetricsSection()} ${this._renderColorsSection()}
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
