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
// Leftover accents go to wind; this bias keeps temperature and rain filled first
// when there are fewer than three accents.
const WIND_COST = 60;
const DAYTIME_CONTRAST_COST = 40;

function accentCost(role: "temperature" | "rain" | "wind", hex: string): number {
  if (role === "wind") return WIND_COST;
  if (chroma(hex) < 0.12) return 180;
  return hueDistance(hexToHue(hex), ACCENT_TARGET_HUE[role]);
}

function assignAccents(accents: string[]): { cost: number; map: Partial<PaletteColors> } {
  const roles = ["temperature", "rain", "wind"] as const;
  const best = { cost: Infinity, map: {} as Partial<PaletteColors> };

  const search = (idx: number, used: Set<string>, cost: number, map: Partial<PaletteColors>) => {
    if (idx === accents.length) {
      if (cost < best.cost) {
        best.cost = cost;
        best.map = { ...map };
      }
      return;
    }
    for (const role of roles) {
      if (used.has(role)) continue;
      used.add(role);
      map[role] = accents[idx];
      search(idx + 1, used, cost + accentCost(role, accents[idx]), map);
      delete map[role];
      used.delete(role);
    }
  };
  search(0, new Set(), 0, {});
  return best;
}

function autoAssign(list: string[], current: PaletteColors): PaletteColors {
  const unique = [...new Set(list)];
  // The background is whichever colour leaves the three strongest accents most legible.
  const legibility = (candidate: string) => {
    const others = unique
      .filter((c) => c !== candidate)
      .map((c) => contrastRatio(c, candidate))
      .sort((a, b) => b - a)
      .slice(0, 3);
    return others.length ? others.reduce((sum, v) => sum + v, 0) / others.length : 0;
  };
  const background = unique.reduce((a, b) => (legibility(b) > legibility(a) ? b : a));
  const remaining = unique.filter((c) => c !== background);

  const strongest = (colors: string[]) =>
    [...colors]
      .sort((a, b) => contrastRatio(b, background) - contrastRatio(a, background))
      .slice(0, 3);

  let daytime = autoDaytimeColor(background);
  let accents = assignAccents(strongest(remaining));
  if (remaining.length > 3) {
    // Daytime shading should be subtle, but not at the cost of e.g. the only blue
    // that could represent rain, so it is chosen jointly with the accents.
    let bestCost = Infinity;
    for (const candidate of remaining) {
      const option = assignAccents(strongest(remaining.filter((c) => c !== candidate)));
      const cost = option.cost + DAYTIME_CONTRAST_COST * (contrastRatio(candidate, background) - 1);
      if (cost < bestCost) {
        bestCost = cost;
        daytime = candidate;
        accents = option;
      }
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
