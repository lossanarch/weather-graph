import type { PaletteMode } from "./palette";

/**
 * Lets the open card editor show the palette being edited. Home Assistant gives
 * the editor no handle on its preview card, but both live in this bundle, so a
 * module-level value reaches every card. It is cleared when the editor closes.
 */
let previewMode: PaletteMode | undefined;
const listeners = new Set<() => void>();

export function getPreviewPaletteMode(): PaletteMode | undefined {
  return previewMode;
}

export function setPreviewPaletteMode(mode: PaletteMode | undefined): void {
  if (previewMode === mode) return;
  previewMode = mode;
  listeners.forEach((listener) => listener());
}

export function onPreviewPaletteModeChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
