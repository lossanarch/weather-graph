import { describe, expect, it } from "vitest";
import "../editor/weather-graph-card-editor";
import "../weather-graph-card";
import { SAMPLE_BOM_PROFILES } from "../dev/bom-sample-profiles";
import type { WeatherGraphCardEditor } from "../editor/weather-graph-card-editor";
import { contrastRatio, resolvePalette } from "../theme/palette";
import {
  assignPaletteColors,
  autoTextColor,
  paletteToCsv,
  parsePaletteInput,
} from "../theme/palette-import";
import type { HomeAssistant, WeatherGraphCardConfig } from "../types";

const PASTEL = ["#c7eae4", "#a7e8bd", "#fcbcb8", "#efa7a7", "#ffd972"];
const CURRENT = resolvePalette("dusk", undefined);

function parsed(text: string) {
  const result = parsePaletteInput(text);
  if (!result.ok) throw new Error(result.error);
  return result.input;
}

describe("parsePaletteInput", () => {
  it.each([
    ["CSV", "c7eae4,a7e8bd,fcbcb8,efa7a7,ffd972"],
    ["CSV with #", "#c7eae4, #a7e8bd, #fcbcb8, #efa7a7, #ffd972"],
    ["JSON array", '["c7eae4","a7e8bd","fcbcb8","efa7a7","ffd972"]'],
    [
      "object keyed by colour names",
      '{"Mint":"c7eae4","Celadon":"a7e8bd","Melon":"fcbcb8","Pink":"efa7a7","Naples":"ffd972"}',
    ],
  ])("reads %s as an ordered list", (_name, text) => {
    expect(parsed(text)).toEqual({ kind: "list", colors: PASTEL });
  });

  it("reads an object keyed by slot names, case-insensitively", () => {
    expect(
      parsed(
        '{"background":"c7eae4","Daytime":"a7e8bd","temperature":"fcbcb8","rain":"efa7a7","wind":"ffd972"}'
      )
    ).toEqual({
      kind: "keyed",
      colors: {
        background: "#c7eae4",
        daytime: "#a7e8bd",
        temperature: "#fcbcb8",
        rain: "#efa7a7",
        wind: "#ffd972",
      },
    });
  });

  it("pulls hex codes out of a palette generator URL", () => {
    expect(parsed("https://coolors.co/264653-2a9d8f-e9c46a-f4a261-e76f51")).toEqual({
      kind: "list",
      colors: ["#264653", "#2a9d8f", "#e9c46a", "#f4a261", "#e76f51"],
    });
  });

  it("expands 3-digit hex codes", () => {
    expect(parsed("#abc #FFF")).toEqual({ kind: "list", colors: ["#aabbcc", "#ffffff"] });
    expect(parsed('["abc"]')).toEqual({ kind: "list", colors: ["#aabbcc"] });
  });

  it("explains empty and invalid input", () => {
    expect(parsePaletteInput("   ")).toEqual({ ok: false, error: "Paste some colours first." });
    expect(parsePaletteInput("no colours here")).toMatchObject({ ok: false });
    expect(parsePaletteInput('["c7eae4","blue"]')).toEqual({
      ok: false,
      error: '"blue" isn\'t a hex colour.',
    });
    expect(parsePaletteInput('{"rain":"nope"}')).toMatchObject({
      ok: false,
      error: expect.stringContaining("rain"),
    });
    expect(parsePaletteInput(Array(13).fill("abcdef").join(","))).toMatchObject({
      ok: false,
      error: expect.stringContaining("Too many"),
    });
  });
});

describe("assignPaletteColors", () => {
  it("auto-assigns a dark-heavy 5-colour palette with a blue for rain", () => {
    const { colors, mode, count } = assignPaletteColors(
      parsed("264653-2a9d8f-e9c46a-f4a261-e76f51"),
      CURRENT
    );
    expect(mode).toBe("auto");
    expect(count).toBe(5);
    expect(colors.background).toBe("#264653");
    expect(colors.temperature).toBe("#f4a261");
    expect(colors.rain).toBe("#2a9d8f");
    expect(colors.wind).toBe("#e9c46a");
    // None of the pasted colours is subtle enough to fill the condition strip.
    expect(contrastRatio(colors.daytime, colors.background)).toBeLessThan(1.6);
    expect(contrastRatio(colors.text, colors.background)).toBeGreaterThan(7);
  });

  it("uses a subtle pasted colour for daytime shading when there is one", () => {
    const { colors } = assignPaletteColors(parsed("1b263b,243447,ff9f1c,2ec4b6,e0e1dd"), CURRENT);
    expect(colors).toMatchObject({
      background: "#1b263b",
      daytime: "#243447",
      temperature: "#ff9f1c",
      rain: "#2ec4b6",
      wind: "#e0e1dd",
    });
  });

  it("uses every colour of the all-pastel example exactly once", () => {
    const { colors } = assignPaletteColors({ kind: "list", colors: PASTEL }, CURRENT);
    const used = [colors.background, colors.daytime, colors.temperature, colors.rain, colors.wind];
    expect(new Set(used)).toEqual(new Set(PASTEL));
    expect(colors.temperature).toBe("#ffd972");
    expect(contrastRatio(colors.text, colors.background)).toBeGreaterThan(7);
  });

  it("puts a 6-colour list into slot order", () => {
    const list = ["#111111", "#222222", "#ff8800", "#0088ff", "#eeeeee", "#fafafa"];
    const { colors, mode } = assignPaletteColors({ kind: "list", colors: list }, CURRENT);
    expect(mode).toBe("ordered");
    expect(colors).toEqual({
      background: "#111111",
      daytime: "#222222",
      temperature: "#ff8800",
      rain: "#0088ff",
      wind: "#eeeeee",
      text: "#fafafa",
    });
  });

  it("generates readable text when a keyed object sets background but not text", () => {
    const { colors, mode } = assignPaletteColors(
      { kind: "keyed", colors: { background: "#f5f5f5", rain: "#0077cc" } },
      CURRENT
    );
    expect(mode).toBe("keyed");
    expect(colors.rain).toBe("#0077cc");
    expect(colors.temperature).toBe(CURRENT.temperature);
    expect(colors.text).toBe(autoTextColor("#f5f5f5"));
    expect(contrastRatio(colors.text, colors.background)).toBeGreaterThan(7);
  });

  it("fills missing accents from the current palette when given few colours", () => {
    const { colors } = assignPaletteColors({ kind: "list", colors: ["#101820", "#3399ff"] }, CURRENT);
    expect(colors.background).toBe("#101820");
    expect(colors.rain).toBe("#3399ff");
    expect(colors.temperature).toBe(CURRENT.temperature);
    expect(colors.wind).toBe(CURRENT.wind);
  });

  it("round-trips the current palette through CSV", () => {
    const csv = paletteToCsv(CURRENT);
    expect(assignPaletteColors(parsed(csv), resolvePalette("forest", undefined)).colors).toEqual(
      CURRENT
    );
  });
});

describe("editor palette tools", () => {
  async function mountEditor(config: Partial<WeatherGraphCardConfig> = {}, darkMode = true) {
    const editor = document.createElement("weather-graph-card-editor") as WeatherGraphCardEditor;
    editor.hass = { states: {}, themes: { darkMode } } as unknown as HomeAssistant;
    editor.setConfig({ type: "custom:weather-graph-card", ...config });
    document.body.appendChild(editor);
    await editor.updateComplete;
    const changes: WeatherGraphCardConfig[] = [];
    editor.addEventListener("config-changed", (e) =>
      changes.push((e as CustomEvent<{ config: WeatherGraphCardConfig }>).detail.config)
    );
    return { editor, root: editor.shadowRoot!, changes };
  }

  it("applies a pasted palette to config.colors and clears the box", async () => {
    const { editor, root, changes } = await mountEditor();
    const textarea = root.querySelector<HTMLTextAreaElement>("#wg-paste")!;
    textarea.value = "264653,2a9d8f,e9c46a,f4a261,e76f51";
    textarea.dispatchEvent(new Event("input"));
    await editor.updateComplete;
    root.querySelector<HTMLButtonElement>(".apply-btn")!.click();
    await editor.updateComplete;

    expect(changes.at(-1)?.colors).toMatchObject({
      background: "#264653",
      rain: "#2a9d8f",
      temperature: "#f4a261",
    });
    expect(root.querySelector<HTMLTextAreaElement>("#wg-paste")!.value).toBe("");
    expect(root.querySelector(".paste-note")?.textContent).toContain("5 colours auto-assigned");
    editor.remove();
  });

  it("shows an inline error for unreadable input without changing config", async () => {
    const { editor, root, changes } = await mountEditor();
    const textarea = root.querySelector<HTMLTextAreaElement>("#wg-paste")!;
    textarea.value = "not a palette";
    textarea.dispatchEvent(new Event("input"));
    textarea.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", ctrlKey: true }));
    await editor.updateComplete;

    expect(changes).toHaveLength(0);
    expect(root.querySelector(".paste-note.error")?.textContent).toContain("No hex colours");
    expect(textarea.getAttribute("aria-invalid")).toBe("true");
    editor.remove();
  });

  it("swaps two colours when their grips are tapped in turn", async () => {
    const { editor, root, changes } = await mountEditor({ palette: "midnight" });
    const midnight = resolvePalette("midnight", undefined);
    const tap = async (slot: string) => {
      const grip = root.querySelector<HTMLButtonElement>(`.swatch[data-slot="${slot}"] .grip`)!;
      const init = { pointerId: 1, button: 0, clientX: 5, clientY: 5, bubbles: true };
      grip.dispatchEvent(new PointerEvent("pointerdown", init));
      grip.dispatchEvent(new PointerEvent("pointerup", init));
      await editor.updateComplete;
    };

    await tap("temperature");
    expect(root.querySelector(".swatch.selected")?.getAttribute("data-slot")).toBe("temperature");
    await tap("rain");

    expect(changes.at(-1)?.colors).toEqual({
      temperature: midnight.rain,
      rain: midnight.temperature,
    });
    expect(root.querySelector(".swatch.selected")).toBeNull();
    editor.remove();
  });

  it("edits the light palette without touching the dark one", async () => {
    const { editor, root, changes } = await mountEditor(
      { palette: "midnight", colors: { rain: "#123456" } },
      true
    );
    expect(root.querySelector('.mode-btn[aria-pressed="true"]')?.getAttribute("data-mode")).toBe(
      "dark"
    );
    expect(root.querySelector<HTMLSelectElement>("#wg-palette")!.value).toBe("midnight");

    root.querySelector<HTMLButtonElement>('.mode-btn[data-mode="light"]')!.click();
    await editor.updateComplete;
    const select = root.querySelector<HTMLSelectElement>("#wg-palette")!;
    expect(select.value).toBe("daylight");
    expect(select.selectedOptions[0].textContent).toContain("(default)");

    select.value = "forest";
    select.dispatchEvent(new Event("change"));
    await editor.updateComplete;
    const input = root.querySelector<HTMLInputElement>("#wg-color-wind")!;
    input.value = "#abcdef";
    input.dispatchEvent(new Event("input"));
    await editor.updateComplete;

    expect(changes.at(-1)).toMatchObject({
      palette: "midnight",
      colors: { rain: "#123456" },
      light_palette: "forest",
      light_colors: { wind: "#abcdef" },
    });
    editor.remove();
  });

  it("previews the palette being edited until the editor closes", async () => {
    const card = document.createElement("weather-graph-card");
    card.hass = { states: {}, config: {}, themes: { darkMode: true } } as unknown as HomeAssistant;
    card.setConfig({ type: "custom:weather-graph-card", palette: "forest" });
    card.samplePayload = SAMPLE_BOM_PROFILES[0].payload;
    document.body.appendChild(card);
    await card.updateComplete;
    const bg = () =>
      (card.shadowRoot!.querySelector(".wg-card") as HTMLElement).style.getPropertyValue("--wg-bg");
    const forest = resolvePalette("forest", undefined).background;
    const daylight = resolvePalette("daylight", undefined).background;
    expect(bg()).toBe(forest);

    const { editor, root } = await mountEditor({ palette: "forest" }, true);
    root.querySelector<HTMLButtonElement>('.mode-btn[data-mode="light"]')!.click();
    await card.updateComplete;
    expect(bg()).toBe(daylight);

    root.querySelector<HTMLButtonElement>('.mode-btn[data-mode="dark"]')!.click();
    await card.updateComplete;
    expect(bg()).toBe(forest);

    root.querySelector<HTMLButtonElement>('.mode-btn[data-mode="light"]')!.click();
    editor.remove();
    await card.updateComplete;
    expect(bg()).toBe(forest);
    card.remove();
  });

  it("starts on the light palette when Home Assistant is in light mode", async () => {
    const { editor, root } = await mountEditor({}, false);
    expect(root.querySelector('.mode-btn[aria-pressed="true"]')?.getAttribute("data-mode")).toBe(
      "light"
    );
    editor.remove();
  });

  it("flags accents that are hard to see against the background", async () => {
    const { editor, root } = await mountEditor({
      palette: "dusk",
      colors: { background: "#c7eae4", rain: "#a7e8bd" },
    });
    expect(root.querySelector('.swatch[data-slot="rain"] .low-contrast')).not.toBeNull();
    expect(root.querySelector('.swatch[data-slot="daytime"] .low-contrast')).toBeNull();
    editor.remove();
  });
});
