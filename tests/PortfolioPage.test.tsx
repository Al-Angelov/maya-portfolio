// Component + edge-case tests for PortfolioPage (Task 11.3).
//
// PortfolioPage consumes the CMS `portfolio` resource via useCmsResource and
// drives a status machine (loading / success / error) on top of a Primary_Dark
// layout with a reduced-opacity background placeholder frame. These tests stub
// useCmsResource so each state can be exercised deterministically, and assert:
//   - loading indicator (role="status") while fetching        (Req 12.3)
//   - Primary_Dark background + reduced-opacity placeholder    (Req 7.1)
//   - success rendering of mapped cards + publication text     (Req 7.4, 7.5, 12.1)
//   - tag filtering to matching cards and clearing behavior    (Req 7.8, 7.10)
//   - the "no items match" empty placeholder                   (Req 7.9)
//   - error-with-retained-data (role="alert" + cards remain)   (Req 12.5)
//   - error empty-state fallback to the Req 7.9 placeholder    (Req 7.9)

import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, within, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import PortfolioPage from "../src/pages/PortfolioPage";
import { I18nProvider } from "../src/i18n/I18nProvider";
import { useCmsResource } from "../src/cms/useCmsResource";
import type { PortfolioCardData } from "../src/lib/filterCards";

// Stub the CMS hook so we control the { status, data, error } returned per test.
vi.mock("../src/cms/useCmsResource", () => ({
  useCmsResource: vi.fn(),
}));

const useCmsResourceMock = vi.mocked(useCmsResource);

// The "no items match" placeholder copy (t("portfolio.empty"), Req 7.9).
const EMPTY_MESSAGE = "No work items match the selected filter.";

// A small mix of cards spanning categories, tags, and a publication (Req 7.5).
const cardA: PortfolioCardData = {
  id: "a",
  category: "video",
  imagePlaceholder: "/images/a.svg",
  description: "Short-form editing reel",
  tags: ["editing", "video"],
};
const cardB: PortfolioCardData = {
  id: "b",
  category: "writing",
  imagePlaceholder: "/images/b.svg",
  description: "Feature article on city life",
  tags: ["writing"],
  publication: "Helsingin Sanomat",
};
const cardC: PortfolioCardData = {
  id: "c",
  category: "social",
  imagePlaceholder: "/images/c.svg",
  description: "Social campaign carousel",
  tags: ["social"],
};

const allCards = [cardA, cardB, cardC];

/** Render the page inside the i18n provider it depends on. */
function renderPage() {
  return render(
    <I18nProvider>
      <PortfolioPage />
    </I18nProvider>,
  );
}

/**
 * True when a Tailwind opacity class expresses a value in the 5%–20% range,
 * i.e. `opacity-5`..`opacity-20` or an arbitrary `opacity-[0.05]`..`opacity-[0.2]`.
 */
function hasReducedOpacityClass(el: Element): boolean {
  for (const cls of Array.from(el.classList)) {
    const named = cls.match(/^opacity-(\d+)$/);
    if (named) {
      const pct = Number(named[1]);
      if (pct >= 5 && pct <= 20) return true;
    }
    const arbitrary = cls.match(/^opacity-\[0?\.(\d+)\]$/);
    if (arbitrary) {
      const value = Number(`0.${arbitrary[1]}`);
      if (value >= 0.05 && value <= 0.2) return true;
    }
  }
  return false;
}

afterEach(() => {
  cleanup();
  useCmsResourceMock.mockReset();
  window.sessionStorage.clear();
});

describe("PortfolioPage", () => {
  it("shows a loading indicator while the portfolio resource is loading (Req 12.3)", () => {
    useCmsResourceMock.mockReturnValue({
      status: "loading",
      data: null,
      error: null,
    });

    renderPage();

    expect(screen.getByRole("status")).toBeTruthy();
  });

  it("renders the mapped cards, publication, Primary_Dark bg and a reduced-opacity placeholder on success (Req 7.1, 7.4, 7.5, 12.1)", () => {
    useCmsResourceMock.mockReturnValue({
      status: "success",
      data: allCards,
      error: null,
    });

    const { container } = renderPage();

    // Every card's description renders (Req 7.4, 12.1).
    expect(screen.getByText(cardA.description)).toBeTruthy();
    expect(screen.getByText(cardB.description)).toBeTruthy();
    expect(screen.getByText(cardC.description)).toBeTruthy();

    // Root section uses the Primary_Dark background token (Req 7.1).
    const section = container.querySelector("section");
    expect(section).not.toBeNull();
    expect(section!.classList.contains("bg-primaryDark")).toBe(true);

    // A decorative background placeholder image renders at reduced opacity (Req 7.1).
    const bgPlaceholder = Array.from(
      container.querySelectorAll("img"),
    ).find((img) => hasReducedOpacityClass(img));
    expect(bgPlaceholder).toBeTruthy();

    // Publication attribution for the written work renders (Req 7.5).
    expect(screen.getByText("Helsingin Sanomat")).toBeTruthy();
  });

  it("filters to matching cards on tag select, then restores all cards on clear (Req 7.8, 7.10)", async () => {
    const user = userEvent.setup();
    useCmsResourceMock.mockReturnValue({
      status: "success",
      data: allCards,
      error: null,
    });

    renderPage();

    // All three cards are visible initially.
    expect(screen.getByText(cardA.description)).toBeTruthy();
    expect(screen.getByText(cardB.description)).toBeTruthy();
    expect(screen.getByText(cardC.description)).toBeTruthy();

    // Select the "writing" tag filter → only cardB remains (Req 7.8).
    const filterGroup = screen.getByRole("group", { name: "Tag filter" });
    await user.click(within(filterGroup).getByRole("button", { name: "writing" }));

    expect(screen.getByText(cardB.description)).toBeTruthy();
    expect(screen.queryByText(cardA.description)).toBeNull();
    expect(screen.queryByText(cardC.description)).toBeNull();

    // Clear via the "All" control → the full set is restored (Req 7.10).
    await user.click(within(filterGroup).getByRole("button", { name: "All" }));

    expect(screen.getByText(cardA.description)).toBeTruthy();
    expect(screen.getByText(cardB.description)).toBeTruthy();
    expect(screen.getByText(cardC.description)).toBeTruthy();
  });

  it("shows the 'no items match' placeholder when success returns no cards (Req 7.9)", () => {
    useCmsResourceMock.mockReturnValue({
      status: "success",
      data: [],
      error: null,
    });

    renderPage();

    expect(screen.getByText(EMPTY_MESSAGE)).toBeTruthy();
  });

  it("shows an error indication while still rendering retained cards (Req 12.5)", () => {
    useCmsResourceMock.mockReturnValue({
      status: "error",
      data: allCards,
      error: new Error("refetch failed"),
    });

    renderPage();

    // The error is surfaced as an alert (Req 12.5).
    expect(screen.getByRole("alert")).toBeTruthy();

    // Retained/last-good cards are still rendered (Req 12.5).
    expect(screen.getByText(cardA.description)).toBeTruthy();
    expect(screen.getByText(cardB.description)).toBeTruthy();
    expect(screen.getByText(cardC.description)).toBeTruthy();
  });

  it("falls back to the empty placeholder on error with no prior data (Req 7.9)", () => {
    useCmsResourceMock.mockReturnValue({
      status: "error",
      data: null,
      error: new Error("initial load failed"),
    });

    renderPage();

    // Error is still surfaced, and the empty placeholder stands in for content.
    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getByText(EMPTY_MESSAGE)).toBeTruthy();
  });
});
