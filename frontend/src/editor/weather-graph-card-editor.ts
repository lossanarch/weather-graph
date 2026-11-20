import { LitElement, type PropertyDeclarations, css, html } from "lit";
import {
  PALETTE_PRESETS,
  PALETTE_SLOTS,
  type PaletteColors,
  type PaletteSlot,
  contrastRatio,
  effectiveOverrides,
  getPalettePreset,
  modePaletteSelection,
  type PaletteMode,
  resolvePalette,
} from "../theme/palette";
import { assignPaletteColors, paletteToCsv, parsePaletteInput } from "../theme/palette-import";
import type { HomeAssistant, SummaryMetric, WeatherGraphCardConfig } from "../types";
import {
  MAX_SUMMARY_METRICS,
  SUMMARY_METRIC_OPTIONS,
  normalizeSummaryMetrics,
} from "../utils/summary-metrics";

const ACCENT_SLOTS: ReadonlySet<PaletteSlot> = new Set(["temperature", "rain", "wind"]);
const LOW_CONTRAST_RATIO = 1.5;
const DRAG_THRESHOLD_PX = 4;

interface SwatchDrag {
  slot: PaletteSlot;
  pointerId: number;
  startX: number;
  startY: number;
  dx: number;
  dy: number;
  moved: boolean;
  over?: PaletteSlot;
}

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
    _drag: { state: true },
    _tapSlot: { state: true },
    _paletteMode: { state: true },
  };

  declare hass?: HomeAssistant;
  declare private _config: WeatherGraphCardConfig;
  declare private _pasteText: string;
  declare private _pasteNote?: { kind: "error" | "success"; text: string };
  declare private _drag?: SwatchDrag;
  declare private _tapSlot?: PaletteSlot;
  declare private _paletteMode?: PaletteMode;

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
      grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
      gap: 8px;
    }

    .swatch {
      position: relative;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 8px 6px 4px;
      border: 1px solid var(--divider-color, rgba(148, 163, 184, 0.3));
      border-radius: 10px;
      font-size: 13px;
      transition:
        border-color 120ms ease,
        background-color 120ms ease,
        box-shadow 120ms ease;
    }

    .swatch.selected,
    .swatch.dragging {
      border-color: var(--primary-color, #03a9f4);
    }

    .swatch.drop-target {
      border-color: var(--primary-color, #03a9f4);
      background: color-mix(in srgb, var(--primary-color, #03a9f4) 14%, transparent);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary-color, #03a9f4) 35%, transparent);
    }

    .grip {
      appearance: none;
      display: grid;
      place-items: center;
      width: 22px;
      height: 32px;
      padding: 0;
      border: 0;
      border-radius: 6px;
      background: transparent;
      color: var(--secondary-text-color, #94a3b8);
      cursor: grab;
      touch-action: none;
      flex: none;
    }

    .grip:hover,
    .grip:focus-visible,
    .swatch.selected .grip {
      color: var(--primary-text-color, #f8fafc);
      background: color-mix(in srgb, var(--primary-text-color, #f8fafc) 8%, transparent);
    }

    .swatch.dragging .grip {
      cursor: grabbing;
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

    .swatch.dragging input[type="color"] {
      position: relative;
      z-index: 2;
      pointer-events: none;
      transform: translate(var(--drag-x, 0px), var(--drag-y, 0px)) scale(1.12);
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
    }

    .swatch-text {
      display: flex;
      flex-direction: column;
      min-width: 0;
      line-height: 1.25;
      font-weight: 400;
      cursor: pointer;
    }

    .swatch-hex {
      font-size: 11px;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      color: var(--secondary-text-color, #94a3b8);
    }

    .swatch-hex.custom {
      color: var(--primary-color, #03a9f4);
    }

    .low-contrast {
      align-self: flex-start;
      margin-top: 2px;
      padding: 0 6px;
      border-radius: 999px;
      font-size: 10.5px;
      font-weight: 600;
      line-height: 16px;
      color: var(--warning-color, #f59e0b);
      background: color-mix(in srgb, var(--warning-color, #f59e0b) 16%, transparent);
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

    .mode-switch {
      display: grid;
      grid-template-columns: 1fr 1fr;
      padding: 3px;
      gap: 3px;
      border-radius: 10px;
      border: 1px solid var(--divider-color, rgba(148, 163, 184, 0.3));
    }

    .mode-btn {
      appearance: none;
      border: 0;
      border-radius: 7px;
      padding: 6px 10px;
      background: transparent;
      color: var(--secondary-text-color, #94a3b8);
      font: inherit;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }

    .mode-btn[aria-pressed="true"] {
      background: var(--primary-color, #03a9f4);
      color: var(--text-primary-color, #ffffff);
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

  /** The mode being edited; starts on whichever mode Home Assistant is showing. */
  private get _mode(): PaletteMode {
    if (this._paletteMode) return this._paletteMode;
    const dark =
      this.hass?.themes?.darkMode ??
      window.matchMedia?.("(prefers-color-scheme: dark)").matches ??
      true;
    return dark ? "dark" : "light";
  }

  private get _selection() {
    return modePaletteSelection(this._config, this._mode);
  }

  private _resolvedColors(): PaletteColors {
    const { paletteId, overrides } = this._selection;
    return resolvePalette(paletteId, overrides);
  }

  private _setMode(mode: PaletteMode): void {
    this._paletteMode = mode;
    this._tapSlot = undefined;
    this._pasteNote = undefined;
  }

  private _setPalette(paletteId: string): void {
    const { paletteKey, colorsKey } = this._selection;
    const nextConfig: WeatherGraphCardConfig = { ...this._config, [paletteKey]: paletteId };
    delete nextConfig[colorsKey];
    this._emit(nextConfig);
  }

  private _setColor(slot: PaletteSlot, value: string): void {
    this._applyColors({ ...this._resolvedColors(), [slot]: value });
  }

  private _applyColors(colors: PaletteColors): void {
    const { paletteId, colorsKey } = this._selection;
    const overrides = effectiveOverrides(paletteId, colors);
    this._update(colorsKey, Object.keys(overrides).length > 0 ? overrides : undefined);
  }

  private _applyPaste(): void {
    const parsed = parsePaletteInput(this._pasteText);
    if (!parsed.ok) {
      this._pasteNote = { kind: "error", text: parsed.error };
      return;
    }
    const current = this._resolvedColors();
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
    const csv = paletteToCsv(this._resolvedColors());
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

  private _swapColors(a: PaletteSlot, b: PaletteSlot): void {
    if (a === b) return;
    const colors = this._resolvedColors();
    this._applyColors({ ...colors, [a]: colors[b], [b]: colors[a] });
  }

  private _slotAt(x: number, y: number): PaletteSlot | undefined {
    const hit = this.shadowRoot?.elementFromPoint(x, y);
    const tile = hit?.closest<HTMLElement>(".swatch[data-slot]");
    return tile?.dataset.slot as PaletteSlot | undefined;
  }

  private _tapGrip(slot: PaletteSlot): void {
    if (!this._tapSlot) {
      this._tapSlot = slot;
    } else {
      if (this._tapSlot !== slot) this._swapColors(this._tapSlot, slot);
      this._tapSlot = undefined;
    }
  }

  private _onGripDown(e: PointerEvent, slot: PaletteSlot): void {
    if (e.button !== 0) return;
    e.preventDefault();
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // Capture is best-effort; without it the drag still works while over the grip.
    }
    this._drag = {
      slot,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      dx: 0,
      dy: 0,
      moved: false,
    };
  }

  private _onGripMove(e: PointerEvent): void {
    const drag = this._drag;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    const moved = drag.moved || Math.hypot(dx, dy) > DRAG_THRESHOLD_PX;
    if (!moved) return;
    const over = this._slotAt(e.clientX, e.clientY);
    this._drag = { ...drag, dx, dy, moved, over: over !== drag.slot ? over : undefined };
    if (this._tapSlot) this._tapSlot = undefined;
  }

  private _onGripUp(e: PointerEvent): void {
    const drag = this._drag;
    if (!drag || drag.pointerId !== e.pointerId) return;
    this._drag = undefined;
    if (!drag.moved) {
      this._tapGrip(drag.slot);
    } else if (drag.over) {
      this._swapColors(drag.slot, drag.over);
    }
  }

  private _renderSwatch(
    slot: PaletteSlot,
    label: string,
    colors: PaletteColors,
    overrides: Partial<PaletteColors>
  ) {
    const drag = this._drag;
    const dragging = drag?.slot === slot && drag.moved;
    const lowContrast =
      ACCENT_SLOTS.has(slot) && contrastRatio(colors[slot], colors.background) < LOW_CONTRAST_RATIO;
    const classes = [
      "swatch",
      dragging ? "dragging" : "",
      drag?.over === slot ? "drop-target" : "",
      this._tapSlot === slot ? "selected" : "",
    ]
      .filter(Boolean)
      .join(" ");
    const swapHint = this._tapSlot && this._tapSlot !== slot;

    return html`
      <div
        class=${classes}
        data-slot=${slot}
        style=${dragging ? `--drag-x: ${drag.dx}px; --drag-y: ${drag.dy}px` : ""}
      >
        <button
          type="button"
          class="grip"
          aria-label=${swapHint ? `Swap with ${label}` : `Move ${label} colour`}
          aria-pressed=${this._tapSlot === slot ? "true" : "false"}
          title="Drag onto another colour to swap, or tap two handles"
          @pointerdown=${(e: PointerEvent) => this._onGripDown(e, slot)}
          @pointermove=${(e: PointerEvent) => this._onGripMove(e)}
          @pointerup=${(e: PointerEvent) => this._onGripUp(e)}
          @pointercancel=${() => (this._drag = undefined)}
          @click=${(e: MouseEvent) => {
            if (e.detail === 0) this._tapGrip(slot);
          }}
          @keydown=${(e: KeyboardEvent) => {
            if (e.key === "Escape") this._tapSlot = undefined;
          }}
        >
          <svg width="10" height="16" viewBox="0 0 10 16" aria-hidden="true">
            <g fill="currentColor">
              <circle cx="2.5" cy="3" r="1.5" /><circle cx="7.5" cy="3" r="1.5" />
              <circle cx="2.5" cy="8" r="1.5" /><circle cx="7.5" cy="8" r="1.5" />
              <circle cx="2.5" cy="13" r="1.5" /><circle cx="7.5" cy="13" r="1.5" />
            </g>
          </svg>
        </button>
        <input
          id="wg-color-${slot}"
          type="color"
          .value=${colors[slot]}
          @input=${(e: Event) => this._setColor(slot, (e.target as HTMLInputElement).value)}
        />
        <label class="swatch-text" for="wg-color-${slot}">
          <span>${label}</span>
          <span class="swatch-hex ${overrides[slot] ? "custom" : ""}">
            ${colors[slot]}${overrides[slot] ? " (custom)" : ""}
          </span>
          ${lowContrast
            ? html`<span class="low-contrast" title="Hard to see against the background">
                low contrast
              </span>`
            : null}
        </label>
      </div>
    `;
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
    const { paletteId, defaultId, overrides: rawOverrides, colorsKey } = this._selection;
    const preset = getPalettePreset(paletteId);
    const overrides = effectiveOverrides(paletteId, rawOverrides);
    const colors = this._resolvedColors();
    const hasOverrides = Object.keys(overrides).length > 0;
    const mode = this._mode;

    return html`
      <div class="field">
        <div class="section-head">
          <label for="wg-palette">Colour Palette</label>
          <button
            type="button"
            class="revert-btn"
            ?disabled=${!hasOverrides}
            @click=${() => this._update(colorsKey, undefined)}
          >
            Revert to ${preset.name}
          </button>
        </div>
        <div class="mode-switch" role="group" aria-label="Palette to edit">
          ${(["dark", "light"] as const).map(
            (m) => html`
              <button
                type="button"
                class="mode-btn"
                data-mode=${m}
                aria-pressed=${m === mode ? "true" : "false"}
                @click=${() => this._setMode(m)}
              >
                ${m === "dark" ? "Dark mode" : "Light mode"}
              </button>
            `
          )}
        </div>
        <select
          id="wg-palette"
          .value=${preset.id}
          @change=${(e: Event) => this._setPalette((e.target as HTMLSelectElement).value)}
        >
          ${PALETTE_PRESETS.map(
            (p) => html`
              <option value=${p.id} ?selected=${p.id === preset.id}>
                ${p.name}${p.id === defaultId ? " (default)" : ""}
              </option>
            `
          )}
        </select>
        <div class="swatches">
          ${PALETTE_SLOTS.map(({ slot, label }) =>
            this._renderSwatch(slot, label, colors, overrides)
          )}
        </div>
        <span class="hint">
          The card uses the dark palette when Home Assistant is in dark mode (by default it follows
          your system) and the light palette otherwise. Pick a built-in palette, then adjust any
          colour. Drag the handles (or tap two) to swap colours. Changing palette clears custom
          colours.
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
