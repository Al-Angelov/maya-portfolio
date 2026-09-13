// Feature: maija-portfolio, Property 12: CMS mapping faithfully transforms
// documents into typed models.
//
// Design Property 12 (Validates: Requirements 12.1):
//   THE Portfolio_Site SHALL source the Timeline_Component entries, the
//   Portfolio_Section cards, and the Blog_Section entries from the CMS. The
//   pure mappers `mapTimeline`, `mapPortfolio`, and `mapBlog` SHALL faithfully
//   transform raw Sanity documents into the typed models consumed by the app:
//     - every source document is preserved exactly once (none dropped, added,
//       or duplicated);
//     - fields map correctly (including the `_id → id` and
//       `image → imagePlaceholder` renames);
//     - the timeline result groups by category, emits the categories in the
//       fixed order Theatre → TV & Film → Directing & Writing, and preserves
//       the ascending (stable) within-category `order`.
//
// This suite exercises the three mappers with fast-check across >= 100 runs.

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  mapTimeline,
  mapPortfolio,
  mapBlog,
  type SanityTimelineEntry,
  type SanityPortfolioCard,
  type SanityBlogEntry,
} from "../src/cms/queries";

const NUM_RUNS = 200;

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/** Multiset (key -> count) helper for preservation / permutation checks. */
function counts<T>(items: T[], keyOf: (item: T) => string): Map<string, number> {
  const map = new Map<string, number>();
  for (const item of items) {
    const key = keyOf(item);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return map;
}

// ---------------------------------------------------------------------------
// Timeline
// ---------------------------------------------------------------------------

const TIMELINE_CATEGORIES = [
  "Theatre",
  "TV & Film",
  "Directing & Writing",
] as const;

/** Fixed emission order required by Req 6.9. */
const EXPECTED_CATEGORY_ORDER: readonly string[] = TIMELINE_CATEGORIES;

/**
 * Arbitrary producing the "content" fields of a SanityTimelineEntry (everything
 * except the `_id`, which is assigned per-array to guarantee uniqueness). The
 * `order` field is optional so the undefined-order (treated as 0) branch is
 * exercised. Categories are drawn from the three valid labels.
 */
const timelineFieldsArb = fc.record(
  {
    role: fc.string(),
    production: fc.string(),
    venue: fc.string(),
    year: fc.integer({ min: 1900, max: 2100 }),
    premiere: fc.option(fc.string(), { nil: undefined }),
    category: fc.constantFrom(...TIMELINE_CATEGORIES),
    order: fc.option(fc.integer({ min: -50, max: 50 }), { nil: undefined }),
  },
  { requiredKeys: ["role", "production", "venue", "year", "category"] },
);

/**
 * Arbitrary yielding an array of SanityTimelineEntry with guaranteed-unique
 * `_id`s (assigned by index). A `docKey` combining the mapped fields is used to
 * match mapped entries back to their source document.
 */
const timelineDocsArb: fc.Arbitrary<SanityTimelineEntry[]> = fc
  .array(timelineFieldsArb, { minLength: 0, maxLength: 40 })
  .map((fields) =>
    fields.map(
      (f, index): SanityTimelineEntry => ({
        _id: `tl-${index}`,
        _type: "timelineEntry",
        ...f,
      }),
    ),
  );

describe("Property 12: mapTimeline groups by category with fixed + within-category order (Req 12.1)", () => {
  it("emits categories in the fixed order Theatre → TV & Film → Directing & Writing", () => {
    fc.assert(
      fc.property(timelineDocsArb, (docs) => {
        const result = mapTimeline(docs);
        expect(result.map((c) => c.label)).toEqual([...EXPECTED_CATEGORY_ORDER]);
      }),
      { numRuns: NUM_RUNS },
    );
  });

  it("places every input doc in exactly one category matching its category field (none dropped/added/duplicated)", () => {
    fc.assert(
      fc.property(timelineDocsArb, (docs) => {
        const result = mapTimeline(docs);

        // Total mapped entries across all categories equals the input count.
        const totalMapped = result.reduce((n, c) => n + c.entries.length, 0);
        expect(totalMapped).toBe(docs.length);

        // Per-category counts equal the number of source docs with that category.
        for (const category of result) {
          const expectedCount = docs.filter(
            (d) => d.category === category.label,
          ).length;
          expect(category.entries.length).toBe(expectedCount);
        }
      }),
      { numRuns: NUM_RUNS },
    );
  });

  it("sorts each category by year DESCENDING (newest first), stable for ties, and maps fields correctly", () => {
    fc.assert(
      fc.property(timelineDocsArb, (docs) => {
        const result = mapTimeline(docs);

        for (const category of result) {
          // Source docs for this category in their original document order.
          const sourceDocs = docs.filter((d) => d.category === category.label);

          // Expected: stable DESCENDING sort by year (newest first). The test
          // arb generates numeric years, so a numeric compare matches the
          // mapper's `yearValue`-based sort exactly.
          const expectedSorted = [...sourceDocs].sort(
            (a, b) => Number(b.year) - Number(a.year),
          );

          expect(category.entries.length).toBe(expectedSorted.length);

          // Verify year-descending ordering of the produced entries by aligning
          // against the expected stable sort.
          for (let i = 0; i < category.entries.length; i++) {
            const entry = category.entries[i];
            const src = expectedSorted[i];

            // Field mapping is correct. `production` prefers `title`, falling
            // back to the legacy `production` (the arb only sets `production`).
            expect(entry.role).toBe(src.role);
            expect(entry.production).toBe(src.title ?? src.production ?? "");
            expect(entry.venue).toBe(src.venue);
            expect(entry.year).toBe(src.year);
            expect(entry.premiere).toBe(src.premiere);
          }

          // Independent monotonicity check: years are non-increasing.
          for (let i = 1; i < category.entries.length; i++) {
            expect(Number(category.entries[i - 1].year)).toBeGreaterThanOrEqual(
              Number(category.entries[i].year),
            );
          }
        }
      }),
      { numRuns: NUM_RUNS },
    );
  });
});

// ---------------------------------------------------------------------------
// Portfolio
// ---------------------------------------------------------------------------

const portfolioFieldsArb = fc.record(
  {
    category: fc.constantFrom("video", "social", "writing") as fc.Arbitrary<
      SanityPortfolioCard["category"]
    >,
    image: fc.string(),
    description: fc.string(),
    tags: fc.array(fc.string(), { minLength: 0, maxLength: 6 }),
    publication: fc.option(
      fc.constantFrom("Helsingin Sanomat", "Pärskeitä") as fc.Arbitrary<
        NonNullable<SanityPortfolioCard["publication"]>
      >,
      { nil: undefined },
    ),
  },
  { requiredKeys: ["category", "image", "description", "tags"] },
);

const portfolioDocsArb: fc.Arbitrary<SanityPortfolioCard[]> = fc
  .array(portfolioFieldsArb, { minLength: 0, maxLength: 40 })
  .map((fields) =>
    fields.map(
      (f, index): SanityPortfolioCard => ({
        _id: `pc-${index}`,
        _type: "portfolioCard",
        ...f,
      }),
    ),
  );

describe("Property 12: mapPortfolio faithfully transforms documents (Req 12.1)", () => {
  it("preserves count and each doc exactly once (none dropped/added/duplicated), mapping fields correctly", () => {
    fc.assert(
      fc.property(portfolioDocsArb, (docs) => {
        const result = mapPortfolio(docs);

        // Length preserved.
        expect(result.length).toBe(docs.length);

        // Same multiset of ids (== _id): none dropped, added, or duplicated.
        const before = counts(docs, (d) => d._id);
        const after = counts(result, (c) => c.id);
        expect(after.size).toBe(before.size);
        for (const [id, count] of before) {
          expect(after.get(id)).toBe(count);
        }

        // Field-by-field mapping, positionally (map preserves order).
        for (let i = 0; i < docs.length; i++) {
          const doc = docs[i];
          const card = result[i];
          expect(card.id).toBe(doc._id);
          expect(card.category).toBe(doc.category);
          expect(card.imagePlaceholder).toBe(doc.image);
          expect(card.description).toBe(doc.description);
          expect(card.tags).toEqual(doc.tags);
          expect(card.publication).toBe(doc.publication);
        }
      }),
      { numRuns: NUM_RUNS },
    );
  });
});

// ---------------------------------------------------------------------------
// Blog
// ---------------------------------------------------------------------------

const blogFieldsArb = fc.record(
  {
    title: fc.string(),
    publishedDate: fc
      .date({
        min: new Date("1970-01-01T00:00:00.000Z"),
        max: new Date("2100-12-31T00:00:00.000Z"),
      })
      .map((d) => d.toISOString().slice(0, 10)),
    body: fc.string(),
    language: fc.option(
      fc.constantFrom("EN", "FI") as fc.Arbitrary<
        NonNullable<SanityBlogEntry["language"]>
      >,
      { nil: undefined },
    ),
  },
  { requiredKeys: ["title", "publishedDate", "body"] },
);

const blogDocsArb: fc.Arbitrary<SanityBlogEntry[]> = fc
  .array(blogFieldsArb, { minLength: 0, maxLength: 40 })
  .map((fields) =>
    fields.map(
      (f, index): SanityBlogEntry => ({
        _id: `be-${index}`,
        _type: "blogEntry",
        ...f,
      }),
    ),
  );

describe("Property 12: mapBlog faithfully transforms documents (Req 12.1)", () => {
  it("preserves count and each doc exactly once (none dropped/added/duplicated), passing fields through", () => {
    fc.assert(
      fc.property(blogDocsArb, (docs) => {
        const result = mapBlog(docs);

        // Length preserved.
        expect(result.length).toBe(docs.length);

        // Same multiset of ids (== _id): none dropped, added, or duplicated.
        const before = counts(docs, (d) => d._id);
        const after = counts(result, (e) => e.id);
        expect(after.size).toBe(before.size);
        for (const [id, count] of before) {
          expect(after.get(id)).toBe(count);
        }

        // Field-by-field passthrough, positionally (map preserves order).
        for (let i = 0; i < docs.length; i++) {
          const doc = docs[i];
          const entry = result[i];
          expect(entry.id).toBe(doc._id);
          expect(entry.title).toBe(doc.title);
          expect(entry.publishedDate).toBe(doc.publishedDate);
          expect(entry.body).toBe(doc.body);
        }
      }),
      { numRuns: NUM_RUNS },
    );
  });
});
