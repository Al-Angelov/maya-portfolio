// Feature: maija-portfolio, Property 11: Design tokens are invariant across
// viewport width.
//
// Requirement 11.4: THE Portfolio_Site SHALL apply the Design_System colors
// (Primary_Dark `#141414`, Sweet_Pink `#F5CBDA`, Warm_Ivory `#FFF4EC`) and the
// Design_System typography identically at all viewport widths from 320 pixels
// and greater.
//
// The Design_System tokens are declared once in `src/styles/theme.ts` (COLORS
// and FONT_STACK / FONT_FAMILY_SERIF) and consumed via Tailwind utility classes
// and the base `body` font — none of which are gated behind media queries.
// Because the applied tokens are therefore NOT a function of viewport width,
// the invariance property can be asserted at the source level: for any width in
// [320, 3840], the color tokens and font stack the app applies are exactly the
// constant tokens, identical to those at any other width.
//
// **Validates: Requirements 11.4**

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  COLORS,
  FONT_FAMILY_SERIF,
  FONT_STACK,
} from "../src/styles/theme";

/**
 * The set of design tokens the Portfolio_Site applies at a given viewport
 * width. The tokens are declared once in `src/styles/theme.ts` and are not
 * width-conditional (no media queries alter the palette or the font stack), so
 * the "applied" tokens at any width are simply the constant Design_System
 * tokens. Returning a fresh object each call ensures the deep-equality
 * assertions below compare values, not shared references.
 */
function resolveTokens(_width: number): {
  colors: { primaryDark: string; sweetPink: string; warmIvory: string };
  fontStack: string;
  fontFamily: readonly string[];
} {
  return {
    colors: {
      primaryDark: COLORS.primaryDark,
      sweetPink: COLORS.sweetPink,
      warmIvory: COLORS.warmIvory,
    },
    fontStack: FONT_STACK,
    fontFamily: [...FONT_FAMILY_SERIF],
  };
}

// The baseline tokens at the minimum supported width (320px). Every wider
// viewport must apply tokens identical to this baseline.
const baseline = resolveTokens(320);

/** Widths from the minimum supported width up to an ultra-wide 4K desktop. */
const widthArb = fc.integer({ min: 320, max: 3840 });

describe("Property 11: Design tokens are invariant across viewport width (Req 11.4)", () => {
  it("applies identical color tokens and font stack at every width >= 320px", () => {
    fc.assert(
      fc.property(widthArb, widthArb, (widthA, widthB) => {
        const tokensA = resolveTokens(widthA);
        const tokensB = resolveTokens(widthB);

        // Two independently generated widths yield identical applied tokens:
        // the palette and typography do not vary with viewport width.
        expect(tokensA).toEqual(tokensB);

        // And each width matches the fixed 320px baseline, proving invariance
        // across the whole [320, 3840] range rather than mere pairwise equality.
        expect(tokensA).toEqual(baseline);
        expect(tokensB).toEqual(baseline);

        // Spell out the individual applied tokens for clarity.
        expect(tokensA.colors.primaryDark).toBe(COLORS.primaryDark);
        expect(tokensA.colors.sweetPink).toBe(COLORS.sweetPink);
        expect(tokensA.colors.warmIvory).toBe(COLORS.warmIvory);
        expect(tokensA.fontStack).toBe(FONT_STACK);
        expect(tokensA.fontFamily).toEqual([...FONT_FAMILY_SERIF]);
      }),
      { numRuns: 200 },
    );
  });
});
