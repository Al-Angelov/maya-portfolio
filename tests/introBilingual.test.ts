// Guards that the Info and Resume intro copy is bilingual and reacts to the
// active language, resolved through the shared i18n layer (same mechanism as
// the navigation).
//
//   - EN active  → the English intro copy.
//   - FI active  → the Finnish intro copy.

import { describe, it, expect } from "vitest";
import { translate } from "../src/i18n/translate";
import { translations } from "../src/i18n/translations";

describe("Info / Resume intro copy is bilingual", () => {
  it("shows the English intro copy when EN is active", () => {
    expect(translate(translations, "EN", "info.intro")).toContain(
      "Hello! Very nice to see you here",
    );
    expect(translate(translations, "EN", "resume.performer.intro")).toContain(
      "As a Performer",
    );
  });

  it("shows the Finnish intro copy when FI is active", () => {
    const infoFi = translate(translations, "FI", "info.intro");
    expect(infoFi).toContain("Hei! Ihanaa nähdä sinut täällä");
    expect(infoFi.trim().endsWith("Maija")).toBe(true);
    // No leftover placeholder text.
    expect(infoFi).not.toContain("PLACEHOLDER");

    const resumeFi = translate(translations, "FI", "resume.performer.intro");
    expect(resumeFi).toContain(
      "Esiintyjänä herätän tarinat eloon näyttämöllä ja ruudulla",
    );
    expect(resumeFi).not.toContain("PLACEHOLDER");
  });
});
