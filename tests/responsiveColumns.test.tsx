// Responsive column-count contract tests (Task 15.3).
//
// jsdom does not evaluate CSS media queries or Tailwind breakpoints, so we
// cannot observe computed column counts by resizing the window. Instead we
// assert the responsive Tailwind class contract that *encodes* the required
// breakpoint behavior, since these classes deterministically map to the
// breakpoints defined in Requirement 11:
//
//   - Portfolio grid (src/pages/PortfolioPage.tsx):
//       grid-cols-1   → 1 column at <768px          (Req 11.3 mobile single-col)
//       md:grid-cols-2 → ≥2 columns at 768–1023px    (Req 11.2)
//       lg:grid-cols-3 → ≥3 columns at ≥1024px        (Req 11.3)
//     (Tailwind md=768, lg=1024.)
//
//   - TopBar navigation (src/components/TopBar.tsx):
//       flex-col      → single column ≤767px          (Req 11.1)
//       md:flex-row   → row layout at ≥768px           (Req 11.1)

import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import PortfolioPage from "../src/pages/PortfolioPage";
import TopBar from "../src/components/TopBar";
import { I18nProvider } from "../src/i18n/I18nProvider";
import { useCmsResource } from "../src/cms/useCmsResource";
import type { PortfolioCardData } from "../src/lib/filterCards";

// Stub the CMS hook so PortfolioPage renders its success grid deterministically.
vi.mock("../src/cms/useCmsResource", () => ({
  useCmsResource: vi.fn(),
}));

const useCmsResourceMock = vi.mocked(useCmsResource);

// A small set of sample cards so the grid renders its card container.
const sampleCards: PortfolioCardData[] = [
  {
    id: "a",
    category: "video",
    imagePlaceholder: "/images/a.svg",
    description: "Short-form editing reel",
    tags: ["editing", "video"],
  },
  {
    id: "b",
    category: "writing",
    imagePlaceholder: "/images/b.svg",
    description: "Feature article on city life",
    tags: ["writing"],
    publication: "Helsingin Sanomat",
  },
  {
    id: "c",
    category: "social",
    imagePlaceholder: "/images/c.svg",
    description: "Social campaign carousel",
    tags: ["social"],
  },
];

afterEach(() => {
  cleanup();
  useCmsResourceMock.mockReset();
  window.sessionStorage.clear();
});

describe("Responsive column-count contract", () => {
  it("renders the portfolio card grid single-column below 768px (grid-cols-1, Req 11.3)", () => {
    useCmsResourceMock.mockReturnValue({
      status: "success",
      data: sampleCards,
      error: null,
    });

    const { container } = render(
      <I18nProvider>
        <PortfolioPage />
      </I18nProvider>,
    );

    // Locate the card grid: the element carrying Tailwind grid column classes.
    const grid = container.querySelector("div.grid");
    expect(grid).not.toBeNull();

    // <768px: exactly one column (Req 11.3 mobile single-column).
    expect(grid!.className.includes("grid-cols-1")).toBe(true);
  });

  it("expands the portfolio grid to ≥2 columns at 768–1023px (md:grid-cols-2, Req 11.2)", () => {
    useCmsResourceMock.mockReturnValue({
      status: "success",
      data: sampleCards,
      error: null,
    });

    const { container } = render(
      <I18nProvider>
        <PortfolioPage />
      </I18nProvider>,
    );

    const grid = container.querySelector("div.grid");
    expect(grid).not.toBeNull();

    // md breakpoint (768px) → at least two columns for the 768–1023px range.
    expect(grid!.className.includes("md:grid-cols-2")).toBe(true);
  });

  it("expands the portfolio grid to ≥3 columns at ≥1024px (lg:grid-cols-3, Req 11.3)", () => {
    useCmsResourceMock.mockReturnValue({
      status: "success",
      data: sampleCards,
      error: null,
    });

    const { container } = render(
      <I18nProvider>
        <PortfolioPage />
      </I18nProvider>,
    );

    const grid = container.querySelector("div.grid");
    expect(grid).not.toBeNull();

    // lg breakpoint (1024px) → three or more columns at ≥1024px.
    expect(grid!.className.includes("lg:grid-cols-3")).toBe(true);
  });

  it("stacks navigation in a single column ≤767px and rows from 768px up (flex-col / md:flex-row, Req 11.1)", () => {
    render(
      <I18nProvider>
        <MemoryRouter initialEntries={["/"]}>
          <TopBar />
        </MemoryRouter>
      </I18nProvider>,
    );

    // The nav list is the <ul> inside the "Primary" navigation region.
    const nav = screen.getByRole("navigation", { name: "Primary" });
    const list = nav.querySelector("ul");
    expect(list).not.toBeNull();

    // ≤767px: single-column stack; ≥768px (md): horizontal row.
    expect(list!.className.includes("flex-col")).toBe(true);
    expect(list!.className.includes("md:flex-row")).toBe(true);
  });
});
