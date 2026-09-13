// Component tests for the pre-footer ShowcaseSection (Sointu Borg style).
//
// Verifies the two-column showcase band: the section header, the skills copy,
// the CTA question, the high-contrast CTA button linking to /contact, and the
// layered portrait frame. Rendered through the real I18nProvider (so copy
// resolves) and a MemoryRouter (the CTA is a react-router <Link>). Assertions
// use plain DOM APIs (no jest-dom matchers).

import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { I18nProvider } from "../src/i18n/I18nProvider";
import ShowcaseSection from "../src/components/ShowcaseSection";

function renderShowcase(tone?: "ivory" | "pink") {
  return render(
    <I18nProvider>
      <MemoryRouter>
        <ShowcaseSection tone={tone} />
      </MemoryRouter>
    </I18nProvider>,
  );
}

afterEach(() => {
  cleanup();
});

describe("ShowcaseSection", () => {
  it("renders the section header (default English 'About')", () => {
    const { container } = renderShowcase();

    const heading = container.querySelector("h2#showcase-heading");
    expect(heading).not.toBeNull();
    expect((heading?.textContent ?? "").trim()).toBe("About");
  });

  it("renders two paragraphs of skills copy and the CTA question", () => {
    renderShowcase();

    expect(
      screen.getByText(/Looking for a creator for your project\?/i),
    ).not.toBeNull();
    expect(screen.getByText(/short video/i)).not.toBeNull();
  });

  it("renders a high-contrast CTA button that navigates to /contact", () => {
    renderShowcase();

    const cta = screen.getByRole("link", { name: "Get in touch" });
    expect(cta.getAttribute("href")).toBe("/contact");
    expect(cta.classList.contains("bg-primaryDark")).toBe(true);
    expect(cta.classList.contains("text-warmIvory")).toBe(true);
  });

  it("renders the portrait frame with a layered offset drop-card", () => {
    const { container } = renderShowcase();

    // The portrait frame placeholder is present.
    expect(screen.getByTestId("photo-frame")).not.toBeNull();

    // A decorative, aria-hidden offset rectangle sits behind it.
    const dropCard = container.querySelector('[aria-hidden="true"]');
    expect(dropCard).not.toBeNull();
    expect(dropCard?.className).toContain("translate-x-4");
    expect(dropCard?.className).toContain("translate-y-4");
  });

  it("uses a Warm_Ivory surface by default and Sweet_Pink when tone='pink'", () => {
    const ivory = renderShowcase("ivory");
    expect(
      ivory.container.querySelector("section")?.classList.contains(
        "bg-warmIvory",
      ),
    ).toBe(true);
    cleanup();

    const pink = renderShowcase("pink");
    expect(
      pink.container.querySelector("section")?.classList.contains(
        "bg-sweetPink",
      ),
    ).toBe(true);
  });
});
