// Component tests for InfoPage (Req 5).
//
// These example-based tests cover the cinematic, HS-style landing view,
// rendered through the real I18nProvider so the intro copy and labels resolve
// exactly as they do in the running app:
//   - Primary_Dark full-bleed hero, with NO watermark/tree overlay (Req 5.1)
//   - A large serif display headline for Maija's name (Req 5.3)
//   - Introduction copy starting "Hello! Very nice to see you here" and ending
//     "Maija" (Req 5.4)
//   - Exactly ONE photo/hero frame and ONE bio narrative (no duplicate
//     pre-footer "About" showcase block) (Req 5.5)
//   - A high-contrast Contact call-to-action that navigates to /contact
//   - The LinkedIn icon rendered clickable (opens in a new tab) when the URL
//     is configured (Req 5.7)
//
// InfoPage renders a react-router <Link> for its CTA, so it is wrapped in a
// MemoryRouter in addition to the I18nProvider. Assertions use plain DOM APIs
// (no jest-dom matchers).

import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { I18nProvider } from "../src/i18n/I18nProvider";
import InfoPage from "../src/pages/InfoPage";

function renderInfoPage() {
  return render(
    <I18nProvider>
      <MemoryRouter initialEntries={["/"]}>
        <InfoPage />
      </MemoryRouter>
    </I18nProvider>,
  );
}

afterEach(() => {
  cleanup();
});

describe("InfoPage", () => {
  it("renders the full-bleed hero on the Primary_Dark background (Req 5.1)", () => {
    const { container } = renderInfoPage();

    const section = container.querySelector("section");
    expect(section).not.toBeNull();
    expect(section?.classList.contains("bg-primaryDark")).toBe(true);
  });

  it("does not render a watermark/tree overlay image (clean solid dark space)", () => {
    const { container } = renderInfoPage();

    // The old nature-themed decorative overlay must be gone.
    const overlay = container.querySelector('img[aria-hidden="true"]');
    expect(overlay).toBeNull();
    expect(container.innerHTML).not.toContain("info-nature-placeholder");
  });

  it("renders a large serif display headline for Maija's name (Req 5.3)", () => {
    const { container } = renderInfoPage();

    const heading = container.querySelector("h1#info-heading");
    expect(heading).not.toBeNull();
    expect(heading?.classList.contains("display-name")).toBe(true);
    expect((heading?.textContent ?? "").trim()).toBe("Maija");
  });

  it("renders intro copy starting 'Hello! Very nice to see you here' and ending 'Maija' (Req 5.4)", () => {
    const { container } = renderInfoPage();

    const paragraph = container.querySelector("p.whitespace-pre-line");
    expect(paragraph).not.toBeNull();

    const text = (paragraph?.textContent ?? "").trim();
    expect(text.startsWith("Hello! Very nice to see you here")).toBe(true);
    expect(text.endsWith("Maija")).toBe(true);
  });

  it("renders exactly ONE full-bleed hero photo frame (no duplicate) (Req 5.5)", () => {
    renderInfoPage();

    const photoFrames = screen.getAllByTestId("photo-frame");
    expect(photoFrames.length).toBe(1);

    // The single frame is the full-bleed hero banner.
    expect(photoFrames[0].getAttribute("data-hero")).toBe("banner");
  });

  it("renders exactly ONE bio narrative and no duplicate 'About' showcase", () => {
    const { container } = renderInfoPage();

    // Only one paragraph carries the intro copy.
    const introParagraphs = container.querySelectorAll("p.whitespace-pre-line");
    expect(introParagraphs.length).toBe(1);

    // The removed pre-footer showcase block and its CTA must be gone.
    expect(screen.queryByRole("heading", { name: "About" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Get in touch" })).toBeNull();
  });

  it("renders the opening narrative with an editorial drop-cap (Req 5.3)", () => {
    const { container } = renderInfoPage();

    const intro = container.querySelector("p.whitespace-pre-line");
    expect(intro).not.toBeNull();
    expect(intro?.classList.contains("drop-cap")).toBe(true);
  });

  it("renders a bold cinematic statement headline (Req 5.3)", () => {
    const { container } = renderInfoPage();

    const statement = container.querySelector("p.statement-headline");
    expect(statement).not.toBeNull();
    // text-5xl base, scaling to text-8xl at md.
    expect(statement?.classList.contains("text-5xl")).toBe(true);
    expect(statement?.classList.contains("md:text-8xl")).toBe(true);
  });

  it("renders a 'Contact me' button that navigates to /contact, and no Instagram link", () => {
    renderInfoPage();

    const cta = screen.getByRole("link", { name: "Contact me" });
    expect(cta.getAttribute("href")).toBe("/contact");

    // Instagram remains fully removed.
    expect(screen.queryByRole("link", { name: "Instagram" })).toBeNull();
  });

  it("renders a single LinkedIn icon (clickable, new tab) inline beside the Contact button (Req 5.7)", () => {
    renderInfoPage();

    // Exactly one LinkedIn link remains as the sole social element.
    const links = screen.getAllByRole("link", { name: "LinkedIn" });
    expect(links).toHaveLength(1);

    const link = links[0];
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("href")).toBeTruthy();
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    // The configured link must NOT be in the disabled state (Req 5.8 is the
    // complementary unconfigured case).
    expect(link.getAttribute("aria-disabled")).toBeNull();
  });
});
