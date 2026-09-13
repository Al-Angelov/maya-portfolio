import type { Config } from "tailwindcss";
import { COLORS, FONT_FAMILY_SERIF } from "./src/styles/theme";

// The design-system tokens (colors + font stack) are the single source of truth
// (Req 2.6). They are declared once in `src/styles/theme.ts` and referenced here
// so no hex value or font-family literal is redeclared as a literal.
const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primaryDark: COLORS.primaryDark,
        sweetPink: COLORS.sweetPink,
        warmIvory: COLORS.warmIvory,
      },
      fontFamily: {
        // fontFamily.serif = ['"Bookman Old Style"', 'Georgia', 'serif']
        serif: [...FONT_FAMILY_SERIF],
      },
    },
  },
  plugins: [],
};

export default config;
