import {
  PALETTE_SLOTS,
  type PaletteColors,
  type PaletteSlot,
  chroma,
  contrastRatio,
  hexToHue,
  mixHex,
  normalizeHex,
  relativeLuminance,
} from "./palette";

export const MAX_IMPORT_COLORS = 12;

export type PaletteInput =
  | { kind: "keyed"; colors: Partial<PaletteColors> }
  | { kind: "list"; colors: string[] };

export type PaletteParseResult =
  | { ok: true; input: PaletteInput }
  | { ok: false; error: string };

export type PaletteAssignMode = "keyed" | "ordered" | "auto";

export interface PaletteAssignment {
  colors: PaletteColors;
  mode: PaletteAssignMode;
  count: number;
}

const SLOT_NAMES = new Set<string>(PALETTE_SLOTS.map((s) => s.slot));
const HEX_TOKEN_RE = /#?\b[0-9a-f]{6}\b|#[0-9a-f]{3}\b/gi;

function toHex(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return normalizeHex(trimmed.startsWith("#") ? trimmed : `#${trimmed}`);
}

function describe(value: unknown): string {
  return typeof value === "string" ? `"${value}"` : JSON.stringify(value) ?? String(value);
}

function listResult(values: unknown[]): PaletteParseResult {
  const colors: string[] = [];
  for (const v of values) {
    const hex = toHex(v);
    if (!hex) return { ok: false, error: `${describe(v)} isn't a hex colour.` };
    colors.push(hex);
  }
  return checkCount({ kind: "list", colors });
}

function checkCount(input: PaletteInput): PaletteParseResult {
  const count = input.kind === "list" ? input.colors.length : Object.keys(input.colors).length;
  if (count === 0) return { ok: false, error: "No colours found." };
  if (count > MAX_IMPORT_COLORS) {
    return { ok: false, error: `Too many colours (${count}); paste ${MAX_IMPORT_COLORS} or fewer.` };
  }
  return { ok: true, input };
}

function parseJsonValue(data: unknown): PaletteParseResult | null {
  if (Array.isArray(data)) return listResult(data);
  if (data === null || typeof data !== "object") return null;

  const entries = Object.entries(data as Record<string, unknown>);
  const keyed = entries.length > 0 && entries.every(([k]) => SLOT_NAMES.has(k.toLowerCase()));
  if (!keyed) return listResult(entries.map(([, v]) => v));

  const colors: Partial<PaletteColors> = {};
  for (const [key, value] of entries) {
    const hex = toHex(value);
    if (!hex) return { ok: false, error: `${key}: ${describe(value)} isn't a hex colour.` };
    colors[key.toLowerCase() as PaletteSlot] = hex;
  }
  return checkCount({ kind: "keyed", colors });
}

/**
 * Accepts a JSON array, a JSON object keyed by palette slot (or by any names,
 * read in order), or any text containing hex codes such as CSV or a palette
 * generator URL.
 */
export function parsePaletteInput(text: string): PaletteParseResult {
  const trimmed = text.trim();
  if (!trimmed) return { ok: false, error: "Paste some colours first." };

  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    try {
      const fromJson = parseJsonValue(JSON.parse(trimmed));
      if (fromJson) return fromJson;
    } catch {
      // Not strict JSON (e.g. single quotes); fall back to pulling out hex codes.
    }
  }

  const tokens = trimmed.match(HEX_TOKEN_RE) ?? [];
  if (tokens.length === 0) {
    return { ok: false, error: "No hex colours found. Try c7eae4,a7e8bd,fcbcb8,efa7a7,ffd972." };
  }
  return listResult(tokens);
}

export function autoTextColor(background: string): string {
  return relativeLuminance(background) < 0.4
    ? mixHex(background, "#ffffff", 0.92)
    : mixHex(background, "#000000", 0.85);
}

function autoDaytimeColor(background: string): string {
  return relativeLuminance(background) < 0.4
    ? mixHex(background, "#ffffff", 0.14)
    : mixHex(background, "#ffffff", 0.7);
}

const hueDistance = (a: number, b: number) => {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
};

const ACCENT_TARGET_HUE: Record<"temperature" | "rain", number> = {
  temperature: 30,
  rain: 205,
};
const ACCENT_ROLES = ["temperature", "rain", "wind"] as const;
type AccentRole = (typeof ACCENT_ROLES)[number];

// Leftover accents go to wind; this bias keeps temperature and rain filled first.
const WIND_COST = 60;
const GREY_COST = 180;
// Only reached when there are fewer pasted colours than accent roles.
const KEEP_CURRENT_COST = 1000;
// Lines below this contrast against the background get harder to read.
const LEGIBLE_CONTRAST = 3;
const ILLEGIBLE_COST_PER_RATIO = 30;
// The daytime colour fills the whole condition strip, so it must stay close to the background.
const MAX_DAYTIME_CONTRAST = 2.2;
const DAYTIME_CONTRAST_COST = 40;
const GENERATED_DAYTIME_COST = 20;

function accentCost(role: AccentRole, hex: string, background: string): number {
  const contrast = contrastRatio(hex, background);
  // Small contrast term breaks ties toward the more visible colour.
  const legibility = ILLEGIBLE_COST_PER_RATIO * Math.max(0, LEGIBLE_CONTRAST - contrast) - contrast;
  if (role === "wind") return WIND_COST + legibility;
  if (chroma(hex) < 0.12) return GREY_COST + legibility;
  return hueDistance(hexToHue(hex), ACCENT_TARGET_HUE[role]) + legibility;
}

/** Pick up to three of `candidates` for temperature, rain and wind at the lowest total cost. */
function assignAccents(
  candidates: string[],
  background: string
): { cost: number; map: Partial<PaletteColors> } {
  const best = { cost: Infinity, map: {} as Partial<PaletteColors> };

  const search = (idx: number, used: Set<string>, cost: number, map: Partial<PaletteColors>) => {
    if (cost >= best.cost) return;
    if (idx === ACCENT_ROLES.length) {
      best.cost = cost;
      best.map = { ...map };
      return;
    }
    const role = ACCENT_ROLES[idx];
    for (const hex of candidates) {
      if (used.has(hex)) continue;
      used.add(hex);
      map[role] = hex;
      search(idx + 1, used, cost + accentCost(role, hex, background), map);
      delete map[role];
      used.delete(hex);
    }
    search(idx + 1, used, cost + KEEP_CURRENT_COST, map);
  };
  search(0, new Set(), 0, {});
  return best;
}

function autoAssign(list: string[], current: PaletteColors): PaletteColors {
  const unique = [...new Set(list)];
  // The background is whichever colour leaves the three strongest others most legible,
  // with a slight preference for darker backgrounds on ties.
  const legibility = (candidate: string) => {
    const others = unique
      .filter((c) => c !== candidate)
      .map((c) => contrastRatio(c, candidate))
      .sort((a, b) => b - a)
      .slice(0, 3);
    const mean = others.length ? others.reduce((sum, v) => sum + v, 0) / others.length : 0;
    return mean - relativeLuminance(candidate) * 0.01;
  };
  const background = unique.reduce((a, b) => (legibility(b) > legibility(a) ? b : a));
  const remaining = unique.filter((c) => c !== background);

  let daytime = autoDaytimeColor(background);
  let accents = assignAccents(remaining, background);
  let bestCost = accents.cost + GENERATED_DAYTIME_COST;
  for (const candidate of remaining) {
    const contrast = contrastRatio(candidate, background);
    if (contrast > MAX_DAYTIME_CONTRAST) continue;
    const option = assignAccents(
      remaining.filter((c) => c !== candidate),
      background
    );
    const cost = option.cost + DAYTIME_CONTRAST_COST * (contrast - 1);
    if (cost < bestCost) {
      bestCost = cost;
      daytime = candidate;
      accents = option;
    }
  }

  return {
    ...current,
    ...accents.map,
    background,
    daytime,
    text: autoTextColor(background),
  };
}

/** Turn parsed input into a full palette, starting from the current colours. */
export function assignPaletteColors(
  input: PaletteInput,
  current: PaletteColors
): PaletteAssignment {
  if (input.kind === "keyed") {
    const colors: PaletteColors = { ...current, ...input.colors };
    if (input.colors.background && !input.colors.text) {
      colors.text = autoTextColor(input.colors.background);
    }
    return { colors, mode: "keyed", count: Object.keys(input.colors).length };
  }

  if (input.colors.length === PALETTE_SLOTS.length) {
    const colors = { ...current };
    PALETTE_SLOTS.forEach(({ slot }, i) => {
      colors[slot] = input.colors[i];
    });
    return { colors, mode: "ordered", count: input.colors.length };
  }

  return { colors: autoAssign(input.colors, current), mode: "auto", count: input.colors.length };
}

/** The six current colours as CSV in slot order, ready to paste back in. */
export function paletteToCsv(colors: PaletteColors): string {
  return PALETTE_SLOTS.map(({ slot }) => colors[slot]).join(", ");
}
