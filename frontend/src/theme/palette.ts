export type PaletteSlot =
  | "background"
  | "daytime"
  | "temperature"
  | "rain"
  | "wind"
  | "text";

export type PaletteColors = Record<PaletteSlot, string>;

export interface PalettePreset {
  id: string;
  name: string;
  colors: PaletteColors;
}

export const PALETTE_SLOTS: ReadonlyArray<{ slot: PaletteSlot; label: string }> = [
  { slot: "background", label: "Background" },
  { slot: "daytime", label: "Daytime shading" },
  { slot: "temperature", label: "Temperature" },
  { slot: "rain", label: "Chance of rain" },
  { slot: "wind", label: "Wind" },
  { slot: "text", label: "Text" },
];

export const PALETTE_PRESETS: ReadonlyArray<PalettePreset> = [
  {
    id: "dusk",
    name: "Dusk",
    colors: {
      background: "#1b1a2e",
      daytime: "#3a3762",
      temperature: "#ff8f6b",
      rain: "#59c3c3",
      wind: "#d9d4ff",
      text: "#f3f1fa",
    },
  },
  {
    id: "midnight",
    name: "Midnight",
    colors: {
      background: "#0f2137",
      daytime: "#2b5272",
      temperature: "#f5be36",
      rain: "#4cc9f0",
      wind: "#ffffff",
      text: "#f8fafc",
    },
  },
  {
    id: "forest",
    name: "Forest",
    colors: {
      background: "#142019",
      daytime: "#2c4434",
      temperature: "#f4c95d",
      rain: "#7cb8e8",
      wind: "#e6efe2",
      text: "#eef4ec",
    },
  },
  {
    id: "ember",
    name: "Ember",
    colors: {
      background: "#211816",
      daytime: "#46322b",
      temperature: "#ffb15c",
      rain: "#74b9e6",
      wind: "#f6e9df",
      text: "#f8efe9",
    },
  },
  {
    id: "daylight",
    name: "Daylight",
    colors: {
      background: "#e4eaf2",
      daytime: "#ffffff",
      temperature: "#d9622b",
      rain: "#2b7fc4",
      wind: "#2f3b4a",
      text: "#1c2633",
    },
  },
];

export const DEFAULT_PALETTE_ID = "dusk";
export const DEFAULT_LIGHT_PALETTE_ID = "daylight";

export type PaletteMode = "dark" | "light";

export interface ModePaletteConfig {
  palette?: string;
  colors?: Partial<Record<PaletteSlot, string>>;
  light_palette?: string;
  light_colors?: Partial<Record<PaletteSlot, string>>;
}

export interface ModePaletteSelection {
  paletteKey: "palette" | "light_palette";
  colorsKey: "colors" | "light_colors";
  paletteId: string;
  defaultId: string;
  overrides: Partial<Record<PaletteSlot, string>> | undefined;
}

/** Which config keys and preset apply in dark or light mode. */
export function modePaletteSelection(
  config: ModePaletteConfig,
  mode: PaletteMode
): ModePaletteSelection {
  const light = mode === "light";
  const defaultId = light ? DEFAULT_LIGHT_PALETTE_ID : DEFAULT_PALETTE_ID;
  return {
    paletteKey: light ? "light_palette" : "palette",
    colorsKey: light ? "light_colors" : "colors",
    paletteId: getPalettePreset(light ? config.light_palette : config.palette, defaultId).id,
    defaultId,
    overrides: light ? config.light_colors : config.colors,
  };
}

export function resolveModePalette(config: ModePaletteConfig, mode: PaletteMode): PaletteColors {
  const { paletteId, overrides } = modePaletteSelection(config, mode);
  return resolvePalette(paletteId, overrides);
}

const HEX_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

export function normalizeHex(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!HEX_RE.test(trimmed)) return null;
  if (trimmed.length === 4) {
    const [, r, g, b] = trimmed;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return trimmed.toLowerCase();
}

export function getPalettePreset(
  id: string | undefined,
  fallbackId: string = DEFAULT_PALETTE_ID
): PalettePreset {
  return (
    PALETTE_PRESETS.find((p) => p.id === id) ??
    PALETTE_PRESETS.find((p) => p.id === fallbackId) ??
    PALETTE_PRESETS.find((p) => p.id === DEFAULT_PALETTE_ID)!
  );
}

/** Preset colours with any valid per-slot overrides applied on top. */
export function resolvePalette(
  paletteId: string | undefined,
  overrides: Partial<Record<PaletteSlot, string>> | undefined
): PaletteColors {
  const resolved: PaletteColors = { ...getPalettePreset(paletteId).colors };
  for (const { slot } of PALETTE_SLOTS) {
    const hex = normalizeHex(overrides?.[slot]);
    if (hex) resolved[slot] = hex;
  }
  return resolved;
}

/** Overrides that differ from the preset; empty when nothing is customised. */
export function effectiveOverrides(
  paletteId: string | undefined,
  overrides: Partial<Record<PaletteSlot, string>> | undefined
): Partial<Record<PaletteSlot, string>> {
  const base = getPalettePreset(paletteId).colors;
  const result: Partial<Record<PaletteSlot, string>> = {};
  for (const { slot } of PALETTE_SLOTS) {
    const hex = normalizeHex(overrides?.[slot]);
    if (hex && hex !== base[slot]) result[slot] = hex;
  }
  return result;
}

type Rgb = [number, number, number];

function toRgb(hex: string): Rgb {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex([r, g, b]: Rgb): string {
  return `#${[r, g, b]
    .map((c) => Math.round(Math.max(0, Math.min(255, c))).toString(16).padStart(2, "0"))
    .join("")}`;
}

/** Linear blend from `a` (t = 0) to `b` (t = 1). */
export function mixHex(a: string, b: string, t: number): string {
  const ca = toRgb(a);
  const cb = toRgb(b);
  return toHex([0, 1, 2].map((i) => ca[i] + (cb[i] - ca[i]) * t) as Rgb);
}

export function hexToRgba(hex: string, alpha: number): string {
  const [r, g, b] = toRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = toRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio, from 1 (identical) to 21 (black on white). */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Hue in degrees (0-360); greys report 0. */
export function hexToHue(hex: string): number {
  const [r, g, b] = toRgb(hex).map((c) => c / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  if (delta === 0) return 0;
  let h: number;
  if (max === r) h = ((g - b) / delta) % 6;
  else if (max === g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;
  return (h * 60 + 360) % 360;
}

/** Chroma from 0 to 1; near-zero values are greys whose hue is meaningless. */
export function chroma(hex: string): number {
  const rgb = toRgb(hex);
  return (Math.max(...rgb) - Math.min(...rgb)) / 255;
}

/** CSS custom properties consumed by the card, chart and icons. */
export function buildThemeVars(colors: PaletteColors): Record<string, string> {
  const { background: bg, daytime, temperature, rain, wind, text } = colors;
  const isDark = relativeLuminance(bg) < 0.4;
  const panel = isDark ? mixHex(bg, "#000000", 0.38) : mixHex(bg, text, 0.05);
  const legend = isDark ? mixHex(bg, "#000000", 0.45) : mixHex(bg, text, 0.07);
  const nightPlot = mixHex(bg, daytime, 0.12);

  return {
    "--wg-bg": bg,
    "--wg-panel": panel,
    "--wg-legend-bg": legend,
    "--wg-text": text,
    "--wg-text-muted": mixHex(text, bg, 0.4),
    "--wg-border": hexToRgba(text, 0.12),
    "--wg-shadow": isDark ? "rgba(0, 0, 0, 0.36)" : "rgba(0, 0, 0, 0.12)",
    "--wg-temp": temperature,
    "--wg-rain": rain,
    "--wg-wind": wind,
    "--wg-rain-fill": hexToRgba(mixHex(rain, bg, 0.2), 0.48),
    "--wg-rain-stroke": hexToRgba(rain, 0.55),
    "--wg-wind-line": hexToRgba(wind, 0.25),
    "--wg-band-day-strip": daytime,
    "--wg-band-night-strip": mixHex(bg, daytime, 0.3),
    "--wg-band-day-plot": mixHex(bg, daytime, 0.45),
    "--wg-band-night-plot": nightPlot,
    "--wg-axis-fade": hexToRgba(nightPlot, 0.92),
    "--wg-axis-fade-clear": hexToRgba(nightPlot, 0),
    "--wg-grid": hexToRgba(text, 0.075),
    "--wg-grid-vertical": hexToRgba(text, 0.06),
    "--wg-strip-rule": hexToRgba(mixHex(text, daytime, 0.3), 0.36),
    "--wg-day-label": mixHex(rain, text, 0.5),
    "--wg-control-bg": hexToRgba(panel, 0.82),
    "--wg-control-border": hexToRgba(text, 0.18),
    "--wg-icon-filter": isDark
      ? "none"
      : "drop-shadow(0 0 0.6px rgba(0, 0, 0, 0.55)) drop-shadow(0 1px 1.5px rgba(0, 0, 0, 0.18))",
    "--wg-skeleton-a": hexToRgba(mixHex(bg, daytime, 0.4), 0.55),
    "--wg-skeleton-b": hexToRgba(mixHex(bg, daytime, 0.8), 0.75),
  };
}
