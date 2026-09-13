// Component tests for LanguageToggle and the i18n defaults it depends on.
//
// These example-based tests cover the language-toggle behaviour visible in the
// TopBar and the default-language behaviour of the i18n layer:
//   - Default EN on first load with no stored preference (Req 4.1)
//   - Exactly two selectable options labeled "EN" and "FI", the active one
//     marked selected (Req 4.2)
//   - Selecting an option updates the selected state (Req 4.3)
//   - Content/labels resolved via useI18n update when the language changes,
//     using the structured translation resource (Req 4.3, 4.5)

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { I18nProvider, useI18n } from "../src/i18n/I18nProvider";
import { LanguageToggle } from "../src/components/LanguageToggle";

// A small consumer that renders a translated label, so we can assert that
// user-facing content updates when the language toggles (Req 4.3, 4.5). It
// uses the same `useI18n().t(key)` path as real page components.
function ContactLabel() {
  const { t } = useI18n();
  return <span data-testid="contact-label">{t("nav.contact")}</span>;
}

function renderToggle() {
  return render(
    <I18nProvider>
      <LanguageToggle />
      <ContactLabel />
    </I18nProvider>,
  );
}

// Start every test from a clean session so there is no stored language
// preference and the default-language behaviour is exercised (Req 4.1).
beforeEach(() => {
  window.sessionStorage.clear();
});

afterEach(() => {
  cleanup();
  window.sessionStorage.clear();
});

describe("LanguageToggle", () => {
  it("defaults to EN on first load when no preference is stored (Req 4.1, 4.2)", () => {
    renderToggle();

    const en = screen.getByRole("radio", { name: "EN" });
    const fi = screen.getByRole("radio", { name: "FI" });

    expect(en.getAttribute("aria-checked")).toBe("true");
    expect(fi.getAttribute("aria-checked")).toBe("false");
  });

  it("presents exactly two options labeled EN and FI (Req 4.2)", () => {
    renderToggle();

    const options = screen.getAllByRole("radio");
    expect(options).toHaveLength(2);
    expect(options.map((option) => option.textContent)).toEqual(["EN", "FI"]);
  });

  it("updates the selected state when a language option is chosen (Req 4.3)", async () => {
    const user = userEvent.setup();
    renderToggle();

    const en = screen.getByRole("radio", { name: "EN" });
    const fi = screen.getByRole("radio", { name: "FI" });

    await user.click(fi);

    expect(fi.getAttribute("aria-checked")).toBe("true");
    expect(en.getAttribute("aria-checked")).toBe("false");
  });

  it("updates user-facing content/labels when the language toggles (Req 4.3, 4.5)", async () => {
    const user = userEvent.setup();
    renderToggle();

    // EN is the default, so the label starts as the English value.
    const label = screen.getByTestId("contact-label");
    expect(label.textContent).toBe("Contact me");

    await user.click(screen.getByRole("radio", { name: "FI" }));

    // After switching to FI the same key resolves to the Finnish value.
    expect(screen.getByTestId("contact-label").textContent).toBe(
      "Ota yhteyttä",
    );
  });
});
