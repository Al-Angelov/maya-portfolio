// Feature: maija-portfolio, Property 7: Blog entries render completely.
//
// For any blog entry, the rendered blog card SHALL contain the entry's title,
// its publication date, and its body text (Req 8.2). This property test
// generates arbitrary `BlogEntry` values and renders them through the real
// `BlogPage`, asserting that the title text, the body text, and the publication
// date are all present in the DOM for each generated entry.
//
// `BlogPage` obtains its data via `useCmsResource('blog')` and formats the date
// through `toLocaleDateString`. To avoid coupling the assertion to locale-
// specific date formatting, we assert on the semantic `<time dateTime=…>`
// element (which carries the raw ISO `publishedDate`) rather than the rendered
// text. The CMS hook is mocked to return the generated entry in a `success`
// state so the page renders the entry deterministically.

import { describe, it, expect, afterEach, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import fc from "fast-check";

import BlogPage from "../src/pages/BlogPage";
import { I18nProvider } from "../src/i18n/I18nProvider";
import type { BlogEntry } from "../src/lib/sortBlog";
import type { CmsResourceState } from "../src/cms/useCmsResource";

// ---------------------------------------------------------------------------
// Mock the CMS hook. The return value is driven per-iteration by a module-level
// variable the mock reads, letting each generated entry flow into the page.
// ---------------------------------------------------------------------------
let currentBlogState: CmsResourceState<BlogEntry[]> = {
  status: "success",
  data: [],
  error: null,
};

vi.mock("../src/cms/useCmsResource", () => ({
  useCmsResource: () => currentBlogState,
}));

// ---------------------------------------------------------------------------
// Generators
// ---------------------------------------------------------------------------

/**
 * A printable, non-collapsing string that is guaranteed non-empty after trim.
 * We build it from an alphanumeric-plus-space charset (avoiding characters that
 * HTML would collapse or that would make `textContent.includes` brittle) and
 * require at least one non-space character.
 */
const textArb: fc.Arbitrary<string> = fc
  .stringOf(
    fc.constantFrom(
      ..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ".split(
        "",
      ),
    ),
    { minLength: 1, maxLength: 40 },
  )
  .filter((s) => s.trim().length > 0);

/** A valid ISO "YYYY-MM-DD" publication date. */
const isoDateArb: fc.Arbitrary<string> = fc
  .date({
    min: new Date("2000-01-01T00:00:00Z"),
    max: new Date("2099-12-31T00:00:00Z"),
  })
  .map((d) => d.toISOString().slice(0, 10));

/** A fully-formed BlogEntry with non-empty title/body and a valid ISO date. */
const blogEntryArb: fc.Arbitrary<BlogEntry> = fc.record({
  id: fc.uuid(),
  title: textArb,
  publishedDate: isoDateArb,
  body: textArb,
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

afterEach(() => {
  cleanup();
});

// ---------------------------------------------------------------------------
// Property 7 (Validates: Requirements 8.2)
// ---------------------------------------------------------------------------

describe("Property 7: Blog entries render completely (Req 8.2)", () => {
  it("renders the title, publication date, and body for any generated entry", () => {
    fc.assert(
      fc.property(blogEntryArb, (entry) => {
        currentBlogState = { status: "success", data: [entry], error: null };

        const { container } = render(
          <I18nProvider>
            <BlogPage />
          </I18nProvider>,
        );

        const text = container.textContent ?? "";

        // Title and body text are present in the rendered DOM.
        expect(text).toContain(entry.title);
        expect(text).toContain(entry.body);

        // The publication date is rendered as a semantic <time> element whose
        // machine-readable dateTime matches the entry's ISO publishedDate.
        const time = container.querySelector("time");
        expect(time).not.toBeNull();
        expect(time?.getAttribute("dateTime")).toBe(entry.publishedDate);

        // Clean up this iteration's render before the next one.
        cleanup();
      }),
      { numRuns: 100 },
    );
  });
});
