import { LitElement, type PropertyDeclarations, css, html, nothing, svg } from "lit";
import {
  renderWeatherIconInSvg,
  resolveWeatherVisualKind,
} from "../icons/weather-icons";
import type { NormalizedHourPoint, SunWindow } from "../types";
import {
  computeDualAxisScales,
  formatAxisHour,
  formatShortWeekday,
  getLocalHour,
  windArrowRotationDeg,
} from "../utils/forecast-utils";
import {
  type Point2D,
  buildMonotoneAreaPath,
  buildMonotoneLinePath,
  computeDayNightBands,
} from "../utils/svg-paths";

const STRIP_HEIGHT = 76;
const PLOT_TOP = 112;
const PLOT_BOTTOM = 272;
const SVG_HEIGHT = 288;
const LEFT_GUTTER = 44;
const RIGHT_GUTTER = 44;
const INNER_EDGE_PAD = 14;

interface AxisView {
  unit: string;
  ticks: number[];
  tone: "temp" | "wind" | "rain";
  dim: boolean;
}

export class WgForecastChart extends LitElement {
  static properties: PropertyDeclarations = {
    hours: { attribute: false },
    sunWindows: { attribute: false },
    timeZone: { type: String },
    selectedIndex: { type: Number },
    visibleHours: { type: Number },
    showTemperature: { type: Boolean },
    showRain: { type: Boolean },
    showWind: { type: Boolean },
    _viewportWidth: { state: true },
    _canScrollLeft: { state: true },
    _canScrollRight: { state: true },
  };

  declare hours: NormalizedHourPoint[];
  declare sunWindows: SunWindow[];
  declare timeZone: string;
  declare selectedIndex: number;
  declare visibleHours: number;
  declare showTemperature: boolean;
  declare showRain: boolean;
  declare showWind: boolean;
  declare private _viewportWidth: number;
  declare private _canScrollLeft: boolean;
  declare private _canScrollRight: boolean;

  constructor() {
    super();
    this.hours = [];
    this.sunWindows = [];
    this.timeZone = "Australia/Sydney";
    this.selectedIndex = 0;
    this.visibleHours = 24;
    this.showTemperature = true;
    this.showRain = true;
    this.showWind = true;
    this._viewportWidth = 460;
    this._canScrollLeft = false;
    this._canScrollRight = false;
  }

  private get _scrollEl(): HTMLDivElement | null {
    return this.renderRoot?.querySelector(".wg-scroll-viewport") ?? null;
  }

  private _resizeObserver?: ResizeObserver;
  private _isScrubbing = false;
  private _activePointerId: number | null = null;

  static styles = css`
    :host {
      display: block;
      position: relative;
      user-select: none;
      -webkit-user-select: none;
    }

    .wg-chart-shell {
      position: relative;
      width: 100%;
      height: ${SVG_HEIGHT}px;
      overflow: hidden;
      background: var(--wg-band-night-plot);
    }

    .wg-scroll-viewport {
      width: 100%;
      height: 100%;
      overflow-x: auto;
      overflow-y: hidden;
      scrollbar-width: thin;
      scrollbar-color: var(--wg-control-border) transparent;
      -webkit-overflow-scrolling: touch;
      cursor: crosshair;
    }

    .wg-scroll-viewport::-webkit-scrollbar {
      height: 5px;
    }

    .wg-scroll-viewport::-webkit-scrollbar-track {
      background: transparent;
    }

    .wg-scroll-viewport::-webkit-scrollbar-thumb {
      background: var(--wg-control-border);
      border-radius: 999px;
    }

    svg.wg-chart-svg {
      display: block;
      height: ${SVG_HEIGHT}px;
    }

    .wg-axis-overlay {
      position: absolute;
      top: ${STRIP_HEIGHT}px;
      height: ${SVG_HEIGHT - STRIP_HEIGHT}px;
      pointer-events: none;
      z-index: 3;
      transition: opacity 0.2s ease;
    }

    .wg-axis-temp {
      color: var(--wg-temp);
    }

    .wg-axis-wind {
      color: var(--wg-wind);
    }

    .wg-axis-rain {
      color: var(--wg-rain);
    }

    .wg-axis-dim {
      opacity: 0.35;
    }

    .wg-axis-left {
      left: 0;
      width: ${LEFT_GUTTER + 8}px;
      background: linear-gradient(
        90deg,
        var(--wg-axis-fade) 62%,
        var(--wg-axis-fade-clear) 100%
      );
    }

    .wg-axis-right {
      right: 0;
      width: ${RIGHT_GUTTER + 8}px;
      background: linear-gradient(
        270deg,
        var(--wg-axis-fade) 62%,
        var(--wg-axis-fade-clear) 100%
      );
    }

    .wg-axis-unit {
      position: absolute;
      top: 8px;
      font-size: 13px;
      font-weight: 600;
      line-height: 1;
      letter-spacing: 0.01em;
    }

    .wg-axis-left .wg-axis-unit {
      left: 10px;
    }

    .wg-axis-right .wg-axis-unit {
      right: 10px;
    }

    .wg-axis-tick {
      position: absolute;
      transform: translateY(-50%);
      font-size: 14px;
      font-weight: 700;
      line-height: 1;
      font-variant-numeric: tabular-nums;
    }

    .wg-axis-left .wg-axis-tick {
      left: 10px;
    }

    .wg-axis-right .wg-axis-tick {
      right: 10px;
    }

    .wg-pan-btn {
      position: absolute;
      top: 22px;
      z-index: 4;
      width: 26px;
      height: 32px;
      border: 1px solid var(--wg-control-border);
      border-radius: 6px;
      background: var(--wg-control-bg);
      color: var(--wg-text);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.16s ease, background 0.16s ease;
      padding: 0;
    }

    .wg-chart-shell:hover .wg-pan-btn,
    .wg-pan-btn:focus-visible {
      opacity: 1;
    }

    .wg-pan-btn:hover {
      background: var(--wg-panel);
    }

    .wg-pan-left {
      left: 6px;
    }

    .wg-pan-right {
      right: 6px;
    }

    .wg-series-layer {
      transition: opacity 0.2s ease;
    }

    .wg-series-hidden {
      opacity: 0;
      pointer-events: none;
    }

    .wg-day-pill {
      font-size: 9.5px;
      font-weight: 700;
      letter-spacing: 0.05em;
      fill: var(--wg-day-label);
    }

    .wg-band-day-strip {
      fill: var(--wg-band-day-strip);
    }

    .wg-band-night-strip {
      fill: var(--wg-band-night-strip);
    }

    .wg-band-day-plot {
      fill: var(--wg-band-day-plot);
    }

    .wg-band-night-plot {
      fill: var(--wg-band-night-plot);
    }

    .wg-grid-vertical {
      stroke: var(--wg-grid-vertical);
    }

    .wg-grid-horizontal {
      stroke: var(--wg-grid);
    }

    .wg-strip-rule {
      stroke: var(--wg-strip-rule);
    }

    .wg-hour-label {
      fill: var(--wg-text);
    }

    .wg-rain-area {
      fill: var(--wg-rain-fill);
    }

    .wg-rain-stroke {
      stroke: var(--wg-rain-stroke);
    }

    .wg-temp-line {
      stroke: var(--wg-temp);
    }

    .wg-wind-line {
      stroke: var(--wg-wind-line);
    }

    .wg-wind-marker {
      fill: var(--wg-wind);
    }

    .wg-scrubber-head {
      fill: var(--wg-text);
    }

    .wg-scrubber-line {
      stroke: var(--wg-text);
    }
  `;

  connectedCallback(): void {
    super.connectedCallback();
    this._resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        if (w > 80 && Math.abs(w - this._viewportWidth) >= 1) {
          this._viewportWidth = w;
          this._updateScrollIndicators();
        }
      }
    });
    this._resizeObserver.observe(this);
  }

  disconnectedCallback(): void {
    this._resizeObserver?.disconnect();
    super.disconnectedCallback();
  }

  protected firstUpdated(): void {
    const measured = this.getBoundingClientRect().width;
    if (measured > 80) {
      this._viewportWidth = measured;
    }
    this._updateScrollIndicators();
  }

  protected updated(changed: Map<string, unknown>): void {
    if (changed.has("hours") || changed.has("visibleHours")) {
      requestAnimationFrame(() => this._updateScrollIndicators());
    }
  }

  private _getGeometry() {
    const count = Math.max(1, this.hours.length);
    const vis = Math.max(8, Math.min(count, this.visibleHours || 24));
    const plotViewportWidth = Math.max(
      180,
      this._viewportWidth - LEFT_GUTTER - RIGHT_GUTTER - INNER_EDGE_PAD * 2
    );
    const hourSpacing = plotViewportWidth / Math.max(1, vis - 1);
    const firstX = LEFT_GUTTER + INNER_EDGE_PAD;
    const totalWidth = Math.max(
      this._viewportWidth,
      Math.ceil(
        firstX +
          (count - 1) * hourSpacing +
          RIGHT_GUTTER +
          INNER_EDGE_PAD
      )
    );
    const xForIndex = (index: number) => firstX + index * hourSpacing;
    return { count, hourSpacing, firstX, totalWidth, xForIndex };
  }

  private _emitSelectedIndex(nextIndex: number): void {
    if (this.hours.length === 0) return;
    const clamped = Math.max(0, Math.min(this.hours.length - 1, nextIndex));
    if (clamped !== this.selectedIndex) {
      this.dispatchEvent(
        new CustomEvent("hour-select", {
          detail: { index: clamped },
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  private _indexFromClientX(clientX: number): number {
    const scrollEl = this._scrollEl;
    if (!scrollEl || this.hours.length === 0) return 0;
    const rect = scrollEl.getBoundingClientRect();
    const { firstX, hourSpacing } = this._getGeometry();
    const contentX = clientX - rect.left + scrollEl.scrollLeft;
    const rawIdx = Math.round((contentX - firstX) / hourSpacing);
    return Math.max(0, Math.min(this.hours.length - 1, rawIdx));
  }

  private _onPointerDown(ev: PointerEvent): void {
    if (this.hours.length === 0) return;
    if (ev.pointerType === "mouse" && ev.button !== 0) return;

    const scrollEl = this._scrollEl;
    if (!scrollEl) return;

    if (ev.pointerType === "touch") {
      const rect = scrollEl.getBoundingClientRect();
      const { xForIndex } = this._getGeometry();
      const scrubberScreenX =
        rect.left + xForIndex(this.selectedIndex) - scrollEl.scrollLeft;
      if (Math.abs(ev.clientX - scrubberScreenX) <= 26) {
        this._isScrubbing = true;
        this._activePointerId = ev.pointerId;
        scrollEl.setPointerCapture(ev.pointerId);
        ev.preventDefault();
      }
      return;
    }

    this._isScrubbing = true;
    this._activePointerId = ev.pointerId;
    scrollEl.setPointerCapture(ev.pointerId);
    this._emitSelectedIndex(this._indexFromClientX(ev.clientX));
  }

  private _onPointerMove(ev: PointerEvent): void {
    if (!this._isScrubbing || ev.pointerId !== this._activePointerId) return;
    const nextIdx = this._indexFromClientX(ev.clientX);
    this._emitSelectedIndex(nextIdx);

    const scrollEl = this._scrollEl;
    if (scrollEl) {
      const rect = scrollEl.getBoundingClientRect();
      const edgeZone = 48;
      if (ev.clientX > rect.right - edgeZone) {
        scrollEl.scrollLeft += 14;
      } else if (ev.clientX < rect.left + edgeZone) {
        scrollEl.scrollLeft -= 14;
      }
    }
  }

  private _onPointerUp(ev: PointerEvent): void {
    if (ev.pointerId === this._activePointerId) {
      this._isScrubbing = false;
      this._activePointerId = null;
    }
  }

  private _onClick(ev: MouseEvent): void {
    if (this.hours.length === 0) return;
    this._emitSelectedIndex(this._indexFromClientX(ev.clientX));
  }

  private _onKeyDown(ev: KeyboardEvent): void {
    if (ev.key === "ArrowRight") {
      ev.preventDefault();
      const next = Math.min(this.hours.length - 1, this.selectedIndex + 1);
      this._emitSelectedIndex(next);
      this._scrollIndexIntoView(next);
    } else if (ev.key === "ArrowLeft") {
      ev.preventDefault();
      const prev = Math.max(0, this.selectedIndex - 1);
      this._emitSelectedIndex(prev);
      this._scrollIndexIntoView(prev);
    }
  }

  private _scrollIndexIntoView(index: number): void {
    const scrollEl = this._scrollEl;
    if (!scrollEl) return;
    const { xForIndex } = this._getGeometry();
    const x = xForIndex(index);
    const minVisible = scrollEl.scrollLeft + LEFT_GUTTER + 16;
    const maxVisible =
      scrollEl.scrollLeft + scrollEl.clientWidth - RIGHT_GUTTER - 16;
    if (x < minVisible) {
      scrollEl.scrollTo({ left: Math.max(0, x - LEFT_GUTTER - 24), behavior: "smooth" });
    } else if (x > maxVisible) {
      scrollEl.scrollTo({
        left: x - scrollEl.clientWidth + RIGHT_GUTTER + 24,
        behavior: "smooth",
      });
    }
  }

  private _panByHours(deltaHours: number): void {
    const scrollEl = this._scrollEl;
    if (!scrollEl) return;
    const { hourSpacing } = this._getGeometry();
    scrollEl.scrollBy({
      left: deltaHours * hourSpacing,
      behavior: "smooth",
    });
  }

  private _updateScrollIndicators(): void {
    const scrollEl = this._scrollEl;
    if (!scrollEl) return;
    this._canScrollLeft = scrollEl.scrollLeft > 4;
    this._canScrollRight =
      scrollEl.scrollLeft + scrollEl.clientWidth < scrollEl.scrollWidth - 4;
  }

  render() {
    if (this.hours.length === 0) {
      return nothing;
    }

    const { totalWidth, xForIndex } = this._getGeometry();
    const scales = computeDualAxisScales(this.hours);
    const plotSpanY = PLOT_BOTTOM - PLOT_TOP;

    const yForTemp = (temp: number) => {
      const span = scales.temp.max - scales.temp.min || 1;
      const ratio = (temp - scales.temp.min) / span;
      return PLOT_BOTTOM - ratio * plotSpanY;
    };

    const yForRain = (chance: number) => {
      const clamped = Math.max(0, Math.min(100, chance));
      return PLOT_BOTTOM - (clamped / 100) * plotSpanY;
    };

    const yForWind = (kmh: number) => {
      const span = scales.wind.max || 40;
      const clamped = Math.max(0, kmh);
      return PLOT_BOTTOM - Math.min(1.06, clamped / span) * plotSpanY;
    };

    const bands = computeDayNightBands(
      this.hours,
      this.sunWindows,
      xForIndex,
      totalWidth
    );

    const rainPoints: Point2D[] = this.hours.map((h, i) => ({
      x: xForIndex(i),
      y: yForRain(h.rain_chance),
    }));

    const tempPoints: Point2D[] = this.hours
      .map((h, i) =>
        h.temperature !== null
          ? { x: xForIndex(i), y: yForTemp(h.temperature) }
          : null
      )
      .filter((p): p is Point2D => p !== null);

    const windPoints: Point2D[] = this.hours.map((h, i) => ({
      x: xForIndex(i),
      y: yForWind(h.wind_speed_kmh),
    }));

    const rainAreaPath = buildMonotoneAreaPath(rainPoints, PLOT_BOTTOM);
    const rainStrokePath = buildMonotoneLinePath(rainPoints);
    const tempLinePath = buildMonotoneLinePath(tempPoints);
    const windLinePath = buildMonotoneLinePath(windPoints);

    const threeHourIndices: number[] = [];
    for (let i = 0; i < this.hours.length; i++) {
      const h24 = getLocalHour(this.hours[i].epoch_ms, this.timeZone);
      if (h24 % 3 === 0) {
        threeHourIndices.push(i);
      }
    }
    if (threeHourIndices.length === 0) {
      for (let i = 0; i < this.hours.length; i += 3) {
        threeHourIndices.push(i);
      }
    }

    const clampedSelected = Math.max(
      0,
      Math.min(this.hours.length - 1, this.selectedIndex)
    );
    const cursorX = xForIndex(clampedSelected);

    const gridYs = Array.from({ length: scales.gridCount }, (_, idx) => {
      const ratio = idx / (scales.gridCount - 1);
      return PLOT_BOTTOM - ratio * plotSpanY;
    });

    const rainAxis: AxisView = {
      unit: "%",
      ticks: Array.from({ length: scales.gridCount }, (_, idx) =>
        Math.round((idx * 100) / (scales.gridCount - 1))
      ),
      tone: "rain",
      dim: false,
    };
    const rainOnLeft = this.showRain && !this.showTemperature;
    const rainOnRight = this.showRain && this.showTemperature && !this.showWind;
    const leftAxis: AxisView = rainOnLeft
      ? rainAxis
      : { unit: "°C", ticks: scales.temp.ticks, tone: "temp", dim: !this.showTemperature };
    const rightAxis: AxisView = rainOnRight
      ? rainAxis
      : { unit: "km/h", ticks: scales.wind.ticks, tone: "wind", dim: !this.showWind };

    return html`
      <div
        class="wg-chart-shell"
        tabindex="0"
        role="slider"
        aria-label="48-hour forecast timeline scrubber"
        aria-valuemin="0"
        aria-valuemax=${this.hours.length - 1}
        aria-valuenow=${clampedSelected}
        @keydown=${this._onKeyDown}
      >
        ${this._canScrollLeft
          ? html`
              <button
                class="wg-pan-btn wg-pan-left"
                type="button"
                aria-label="Scroll earlier hours"
                @click=${() => this._panByHours(-12)}
              >
                &#8249;
              </button>
            `
          : nothing}
        ${this._canScrollRight
          ? html`
              <button
                class="wg-pan-btn wg-pan-right"
                type="button"
                aria-label="Scroll later hours"
                @click=${() => this._panByHours(12)}
              >
                &#8250;
              </button>
            `
          : nothing}

        <div
          class="wg-axis-overlay wg-axis-left wg-axis-${leftAxis.tone} ${leftAxis.dim
            ? "wg-axis-dim"
            : ""}"
          aria-hidden="true"
        >
          <span class="wg-axis-unit">${leftAxis.unit}</span>
          ${leftAxis.ticks.map(
            (val, idx) => html`
              <span
                class="wg-axis-tick"
                style="top: ${gridYs[idx] - STRIP_HEIGHT}px"
              >
                ${val}
              </span>
            `
          )}
        </div>

        <div
          class="wg-axis-overlay wg-axis-right wg-axis-${rightAxis.tone} ${rightAxis.dim
            ? "wg-axis-dim"
            : ""}"
          aria-hidden="true"
        >
          <span class="wg-axis-unit">${rightAxis.unit}</span>
          ${rightAxis.ticks.map(
            (val, idx) => html`
              <span
                class="wg-axis-tick"
                style="top: ${gridYs[idx] - STRIP_HEIGHT}px"
              >
                ${val}
              </span>
            `
          )}
        </div>

        <div
          class="wg-scroll-viewport"
          @scroll=${this._updateScrollIndicators}
          @pointerdown=${this._onPointerDown}
          @pointermove=${this._onPointerMove}
          @pointerup=${this._onPointerUp}
          @pointercancel=${this._onPointerUp}
          @click=${this._onClick}
        >
          <svg
            class="wg-chart-svg"
            width=${totalWidth}
            height=${SVG_HEIGHT}
            viewBox="0 0 ${totalWidth} ${SVG_HEIGHT}"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g class="wg-daynight-bands">
              ${bands.map((b) => {
                const w = Math.max(0, b.endX - b.startX);
                const tone = b.isNight ? "night" : "day";
                return svg`
                  <g>
                    <rect
                      x=${b.startX}
                      y="0"
                      width=${w + 0.5}
                      height=${STRIP_HEIGHT}
                      class="wg-band-${tone}-strip"
                    />
                    <rect
                      x=${b.startX}
                      y=${STRIP_HEIGHT}
                      width=${w + 0.5}
                      height=${SVG_HEIGHT - STRIP_HEIGHT}
                      class="wg-band-${tone}-plot"
                    />
                  </g>
                `;
              })}
            </g>

            <g class="wg-grid-vertical" stroke-width="1">
              ${threeHourIndices.map((idx) => {
                const x = xForIndex(idx);
                return svg`
                  <line x1=${x} y1="0" x2=${x} y2=${SVG_HEIGHT} />
                `;
              })}
            </g>

            <g class="wg-grid-horizontal" stroke-width="1">
              ${gridYs.map(
                (y) => svg`
                  <line x1="0" y1=${y} x2=${totalWidth} y2=${y} />
                `
              )}
            </g>

            <line
              x1="0"
              y1=${STRIP_HEIGHT}
              x2=${totalWidth}
              y2=${STRIP_HEIGHT}
              class="wg-strip-rule"
              stroke-width="1.2"
            />
            <g class="wg-strip-rule" stroke-width="1.2">
              ${this.hours.map((_, idx) => {
                const x = xForIndex(idx);
                return svg`
                  <line
                    x1=${x}
                    y1=${STRIP_HEIGHT - 6}
                    x2=${x}
                    y2=${STRIP_HEIGHT}
                  />
                `;
              })}
            </g>

            <g class="wg-strip-markers">
              ${threeHourIndices.map((idx) => {
                const pt = this.hours[idx];
                const x = xForIndex(idx);
                const kind = resolveWeatherVisualKind(
                  pt.icon_descriptor,
                  pt.condition,
                  pt.is_night
                );
                const label = formatAxisHour(pt.epoch_ms, this.timeZone);
                const isMidnight = getLocalHour(pt.epoch_ms, this.timeZone) === 0;
                const dayShort = isMidnight
                  ? formatShortWeekday(pt.epoch_ms, this.timeZone)
                  : null;
                return svg`
                  <g>
                    ${renderWeatherIconInSvg(kind, x - 16, 6, 32)}
                    <text
                      x=${x}
                      y="57"
                      text-anchor="middle"
                      class="wg-hour-label"
                      font-size="13"
                      font-weight="500"
                      font-family="inherit"
                    >
                      ${label}
                    </text>
                    ${dayShort
                      ? svg`
                          <text
                            x=${x}
                            y="69"
                            text-anchor="middle"
                            class="wg-day-pill"
                          >
                            ${dayShort}
                          </text>
                        `
                      : nothing}
                  </g>
                `;
              })}
            </g>

            <g
              class="wg-series-layer ${this.showRain ? "" : "wg-series-hidden"}"
            >
              <path d=${rainAreaPath} class="wg-rain-area" />
              <path
                d=${rainStrokePath}
                fill="none"
                class="wg-rain-stroke"
                stroke-width="1.4"
              />
            </g>

            <g
              class="wg-series-layer ${this.showTemperature
                ? ""
                : "wg-series-hidden"}"
            >
              <path
                d=${tempLinePath}
                fill="none"
                class="wg-temp-line"
                stroke-width="3.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </g>

            <g
              class="wg-series-layer ${this.showWind ? "" : "wg-series-hidden"}"
            >
              <path
                d=${windLinePath}
                fill="none"
                class="wg-wind-line"
                stroke-width="2"
                stroke-linecap="round"
              />
              ${this.hours.map((pt, idx) => {
                const wx = xForIndex(idx);
                const wy = yForWind(pt.wind_speed_kmh);
                if (pt.wind_bearing_deg === null || pt.wind_speed_kmh < 0.4) {
                  return svg`
                    <circle
                      cx=${wx}
                      cy=${wy}
                      r="3"
                      class="wg-wind-marker"
                      fill-opacity="0.7"
                    />
                  `;
                }
                const rot = windArrowRotationDeg(pt.wind_bearing_deg);
                return svg`
                  <path
                    d="M 0 -7.2 L 5.2 6.4 L 0 3.3 L -5.2 6.4 Z"
                    class="wg-wind-marker"
                    transform="translate(${wx}, ${wy}) rotate(${rot})"
                  />
                `;
              })}
            </g>

            <g class="wg-scrubber-cursor">
              <polygon
                points="${cursorX - 6.5},0 ${cursorX + 6.5},0 ${cursorX},8.5"
                class="wg-scrubber-head"
              />
              <line
                x1=${cursorX}
                y1="7"
                x2=${cursorX}
                y2=${SVG_HEIGHT}
                class="wg-scrubber-line"
                stroke-width="2.6"
                stroke-dasharray="9 6"
              />
            </g>
          </svg>
        </div>
      </div>
    `;
  }
}

if (!customElements.get("wg-forecast-chart")) {
  customElements.define("wg-forecast-chart", WgForecastChart);
}

declare global {
  interface HTMLElementTagNameMap {
    "wg-forecast-chart": WgForecastChart;
  }
}
