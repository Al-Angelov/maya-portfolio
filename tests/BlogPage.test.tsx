// Component + edge-case tests for BlogPage — the "On My Mind" page (Task 12.3).
//
// BlogPage consumes the CMS `blog` resource via useCmsResource and drives a
// status machine (loading / success / error) on top of a Sweet_Pink layout.
// These tests stub useCmsResource so each state can be exercised
// deterministically, and assert:
//   - Sweet_Pink root background on success                     (Req 8.1)
//   - the November 2026 movie-premiere entry renders            (Req 8.4)
//   - the autumn networking entry renders                       (Req 8.5)
//   - the empty-list placeholder when success returns no posts  (Req 8.6)
//   - a loading indicator (role="status") while fetching        (Req 12.3)
//   - success rendering of all mapped entries                   (Req 12.1)
//   - error-with-retained-data (role="alert" + entries remain)  (Req 12.5)
//   - error empty-state fallback to the Req 8.6 placeholder     (Req 8.6)

import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

import BlogPage from "../src/pages/BlogPage";
import { I18nProvider } from "../src/i18n/I18nProvider";
import { useCmsResource } from "../src/cms/useCmsResource";
import { blogEntries } from "../src/data/blog";

// Stub the CMS hook so we control the { status, data, error } returned per test.
vi.mock("../src/cms/useCmsResource", () => ({
  useCmsResource: vi.fn(),
}));

const useCmsResourceMock = vi.mocked(useCmsResource);

// The "no posts currently available" placeholder copy (t("blog.empty"), Req 8.6).
const EMPTY_MESSAGE = "No posts currently available.";

// Named seed entries used by the November-2026 (Req 8.4) and autumn-networking
// (Req 8.5) assertions. Resolved from the shared seed so the tests stay in sync
// with the authoring content.
const premiereEntry = blogEntries.find((entry) =>
  /november 2026/i.test(entry.title),
)!;
const autumnEntry = blogEntries.find((entry) =>
  /autumn networking/i.test(entry.title),
)!;

/** Render the page inside the i18n provider it depends on. */
function renderPage() {
  return render(
    <I18nProvider>
      <BlogPage />
    </I18nProvider>,
  );
}

afterEach(() => {
  cleanup();
  useCmsResourceMock.mockReset();
  window.sessionStorage.clear();
});

describe("BlogPage", () => {
  it("shows a loading indicator while the blog resource is loading (Req 12.3)", () => {
    useCmsResourceMock.mockReturnValue({
      status: "loading",
      data: null,
      error: null,
    });

    renderPage();

    expect(screen.getByRole("status")).toBeTruthy();
  });

  it("renders on a Sweet_Pink background on success (Req 8.1)", () => {
    useCmsResourceMock.mockReturnValue({
      status: "success",
      data: blogEntries,
      error: null,
    });

    const { container } = renderPage();

    const section = container.querySelector("section");
    expect(section).not.toBeNull();
    expect(section!.classList.contains("bg-sweetPink")).toBe(true);
  });

  it("renders the November 2026 movie-premiere entry on success (Req 8.4)", () => {
    useCmsResourceMock.mockReturnValue({
      status: "success",
      data: blogEntries,
      error: null,
    });

    renderPage();

    expect(premiereEntry).toBeTruthy();
    expect(screen.getByText(premiereEntry.title)).toBeTruthy();
  });

  it("renders the autumn networking entry on success (Req 8.5)", () => {
    useCmsResourceMock.mockReturnValue({
      status: "success",
      data: blogEntries,
      error: null,
    });

    renderPage();

    expect(autumnEntry).toBeTruthy();
    expect(screen.getByText(autumnEntry.title)).toBeTruthy();
  });

  it("renders all mapped entries on success (Req 12.1)", () => {
    useCmsResourceMock.mockReturnValue({
      status: "success",
      data: blogEntries,
      error: null,
    });

    renderPage();

    for (const entry of blogEntries) {
      expect(screen.getByText(entry.title)).toBeTruthy();
    }
  });

  it("shows the empty placeholder when success returns no posts (Req 8.6)", () => {
    useCmsResourceMock.mockReturnValue({
      status: "success",
      data: [],
      error: null,
    });

    renderPage();

    expect(screen.getByText(EMPTY_MESSAGE)).toBeTruthy();
  });

  it("shows an error indication while still rendering retained entries (Req 12.5)", () => {
    useCmsResourceMock.mockReturnValue({
      status: "error",
      data: blogEntries,
      error: new Error("refetch failed"),
    });

    renderPage();

    // The error is surfaced as an alert (Req 12.5).
    expect(screen.getByRole("alert")).toBeTruthy();

    // Retained/last-good entries are still rendered (Req 12.5).
    for (const entry of blogEntries) {
      expect(screen.getByText(entry.title)).toBeTruthy();
    }
  });

  it("falls back to the empty placeholder on error with no prior data (Req 8.6)", () => {
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
