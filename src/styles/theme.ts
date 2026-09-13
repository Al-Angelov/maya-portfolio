// styles/theme.ts — the single source of truth for the Design_System tokens
// (Req 2.6). These values are mirrored by tailwind.config.ts, which imports
// them directly so the hex values and font-family literal are declared exactly
// once in the codebase. No color hex value or font-family literal may be
// redeclared as a literal anywhere else.

/**
 * Design_System colors (Req 2.1, 2.2, 2.3).
 * - primaryDark: Primary_Dark — main backgrounds and dark text.
 * - sweetPink:  Sweet_Pink  — Top_Bar, section accents, Blog/Contact backgrounds.
 * - warmIvory:  Warm_Ivory  — card and text-box backgrounds.
 */
export const COLORS = {
  primaryDark: "#141414", // Primary_Dark
  sweetPink: "#F5CBDA", // Sweet_Pink
  warmIvory: "#FFF4EC", // Warm_Ivory
} as const;

/**
 * The font-family stack applied to all text (Req 2.4, 2.5): "Bookman Old Style"
 * as the first-choice font with Georgia (and the generic serif) as fallbacks.
 * Expressed as an ordered list so it can be consumed by Tailwind's fontFamily
 * config and, joined, as a CSS font-family string.
 */
export const FONT_FAMILY_SERIF = ['"Bookman Old Style"', "Georgia", "serif"] as const;

/** The font-family stack as a single CSS-ready string. */
export const FONT_STACK = FONT_FAMILY_SERIF.join(", ");

export type ColorToken = keyof typeof COLORS;
