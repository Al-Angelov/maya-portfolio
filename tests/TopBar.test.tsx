// Component tests for TopBar (Task 8.3).
//
// Verifies the persistent navigation bar renders the five required links in
// order (Req 3.4), applies sticky positioning with the Sweet_Pink / Primary_Dark
// design tokens (Req 3.1, 3.3), marks the link matching the current route as the
// active page (Req 3.5), and updates its labels when the interface language
// changes (Req 3.7).

import { describe, it, expect, afterEach } from "vitest";
import { render, screen, within, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import TopBar from "../src/components/TopBar";
import { I18nProvider } from "../src/i18n/I18nProvider";

// The five nav labels, in the Req 3.4 display order (English defaults).
const EXPECTED_LABELS_EN = [
  "Info",
  "Resume",
  "Portfolio",
  "On My Mind",
  "Contact me",
];

/** Render TopBar inside the router + i18n providers it depends on. */
function renderTopBar(initialPath = "/") {
  return render(
    <I18nProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <TopBar />
      </MemoryRouter>
    </I18nProvider>,
  );
}

afterEach(() => {
  cleanup();
  window.sessionStorage.clear();
});

describe("TopBar", () => {
  it("renders exactly five navigation links in the required order (Req 3.4)", () => {
    renderTopBar();

    // The header contains ONLY the five nav links (plus the EN|FI toggle,
    // which is a radiogroup, not links), so every link is a nav link.
    const primaryNav = screen.getByRole("navigation", { name: "Primary" });
    const links = within(primaryNav).getAllByRole("link");
    expect(links).toHaveLength(5);
    expect(links.map((link) => link.textContent)).toEqual(EXPECTED_LABELS_EN);
  });

  it("keeps the header ultra-clean: only the EN|FI toggle, no social/email links", () => {
    renderTopBar();

    const header = screen.getByRole("banner");

    // No social/contact links remain in the header (Instagram fully removed).
    expect(within(header).queryByRole("link", { name: "LinkedIn" })).toBeNull();
    expect(within(header).queryByRole("link", { name: "Instagram" })).toBeNull();
    expect(within(header).queryByRole("link", { name: "Email" })).toBeNull();

    // The header links are the brand ("MAIJA") plus the five nav links.
    const headerLinks = within(header).getAllByRole("link");
    expect(headerLinks).toHaveLength(6);
    expect(within(header).getByRole("link", { name: "MAIJA" })).toBeTruthy();

    // The language toggle is still present.
    expect(within(header).getByRole("radio", { name: "EN" })).toBeTruthy();
    expect(within(header).getByRole("radio", { name: "FI" })).toBeTruthy();
  });

  it("applies sticky positioning with Sweet_Pink background and Primary_Dark text (Req 3.1, 3.3)", () => {
    renderTopBar();

    const header = screen.getByRole("banner");
    expect(header.classList.contains("sticky")).toBe(true);
    expect(header.classList.contains("top-0")).toBe(true);
    expect(header.classList.contains("bg-sweetPink")).toBe(true);
    expect(header.classList.contains("text-primaryDark")).toBe(true);
  });

  it("marks the link matching the current route as the active page (Req 3.5)", () => {
    renderTopBar("/");

    const infoLink = screen.getByRole("link", { name: "Info" });
    expect(infoLink.getAttribute("aria-current")).toBe("page");

    // Non-matching links must not be marked as the current page.
    const contactLink = screen.getByRole("link", { name: "Contact me" });
    expect(contactLink.getAttribute("aria-current")).toBeNull();
  });

  it("marks a different link active when starting on another route (Req 3.5)", () => {
    renderTopBar("/portfolio");

    const portfolioLink = screen.getByRole("link", { name: "Portfolio" });
    expect(portfolioLink.getAttribute("aria-current")).toBe("page");

    const infoLink = screen.getByRole("link", { name: "Info" });
    expect(infoLink.getAttribute("aria-current")).toBeNull();
  });

  it("exposes a mobile hamburger toggle that controls a collapsible menu (Req 3.7)", async () => {
    const user = userEvent.setup();
    renderTopBar();

    // The toggle starts collapsed and is labeled for opening.
    const toggle = screen.getByRole("button", { name: "Open menu" });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");

    // aria-controls points at the collapsible menu panel.
    const controlledId = toggle.getAttribute("aria-controls");
    expect(controlledId).toBeTruthy();

    // Opening it flips aria-expanded and the accessible label.
    await user.click(toggle);
    const openToggle = screen.getByRole("button", { name: "Close menu" });
    expect(openToggle.getAttribute("aria-expanded")).toBe("true");

    // Closing it returns to the collapsed state.
    await user.click(openToggle);
    expect(
      screen.getByRole("button", { name: "Open menu" }).getAttribute("aria-expanded"),
    ).toBe("false");
  });

  it("updates navigation labels when the language changes to Finnish (Req 3.7)", async () => {
    const user = userEvent.setup();
    renderTopBar();

    // English labels are shown initially.
    expect(screen.getByRole("link", { name: "Info" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Contact me" })).toBeTruthy();

    // Switch to Finnish via the LanguageToggle inside the bar.
    const header = screen.getByRole("banner");
    const fiToggle = within(header).getByRole("radio", { name: "FI" });
    await user.click(fiToggle);

    // Labels re-render in Finnish.
    expect(screen.getByRole("link", { name: "Tietoa" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Ota yhteyttä" })).toBeTruthy();

    // And the English labels are gone.
    expect(screen.queryByRole("link", { name: "Info" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Contact me" })).toBeNull();
  });
});
