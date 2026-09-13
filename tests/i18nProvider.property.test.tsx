// Feature: maija-portfolio, Property 1: Language preference round-trip persists.
//
// This file hosts the property test for the language-preference persistence
// behaviour of `I18nProvider` (Req 4.4). For any supported language chosen via
// the toggle, calling `setLanguage(lang)` must persist that choice to
// sessionStorage["maija.lang"], AND a freshly-mounted provider must read that
// same value back as its active language — i.e. the choice round-trips across
// a page load within the same browser session.

import { describe, it, expect, afterEach } from "vitest";
import { renderHook, act, cleanup } from "@testing-library/react";
import fc from "fast-check";
import type { ReactNode } from "react";

import {
  I18nProvider,
  useI18n,
  LANGUAGE_STORAGE_KEY,
} from "../src/i18n/I18nProvider";
import type { Language } from "../src/i18n/types";

// ---------------------------------------------------------------------------
// Generators
// ---------------------------------------------------------------------------

/** The language a visitor selects on the toggle: exactly EN or FI. */
const languageArb: fc.Arbitrary<Language> = fc.constantFrom("EN", "FI");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Wraps the hook under test in the provider so `useI18n` has a context. */
function wrapper({ children }: { children: ReactNode }) {
  return <I18nProvider>{children}</I18nProvider>;
}

// A fresh session between runs so each iteration starts from the default
// (no stored preference) state, isolating the round-trip under test.
afterEach(() => {
  cleanup();
  window.sessionStorage.clear();
});

// ---------------------------------------------------------------------------
// Property 1 (Validates: Requirements 4.4)
// ---------------------------------------------------------------------------

describe("Property 1: Language preference round-trip persists (Req 4.4)", () => {
  it("setLanguage(lang) persists to sessionStorage and a freshly-mounted provider reads it back", () => {
    fc.assert(
      fc.property(languageArb, (lang) => {
        // Clean session for this iteration (also covers the first run).
        window.sessionStorage.clear();

        // Mount a provider and select the language via the exposed setter.
        const first = renderHook(() => useI18n(), { wrapper });
        act(() => {
          first.result.current.setLanguage(lang);
        });

        // The choice becomes the active language and is persisted (Req 4.4).
        expect(first.result.current.language).toBe(lang);
        expect(window.sessionStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe(lang);

        // Unmount, then mount a brand-new provider — simulating a subsequent
        // page load within the same session. It must initialise from storage.
        first.unmount();
        const second = renderHook(() => useI18n(), { wrapper });

        // Round-trip: the freshly-mounted provider reads back the same choice.
        expect(second.result.current.language).toBe(lang);

        second.unmount();
      }),
      { numRuns: 100 },
    );
  });
});
