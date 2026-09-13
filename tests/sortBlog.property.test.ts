// Feature: maija-portfolio, Property 8: Blog entries are ordered
// most-recent-first and preserved.
//
// Design Property 8 (Validates: Requirements 8.3):
//   The Blog_Section SHALL display its entries ordered from most recent
//   publication date to oldest. `sortBlogByRecency` SHALL return a permutation
//   of its input ordered non-increasing by `publishedDate` (most-recent-first)
//   without dropping, adding, or duplicating any entry, and without mutating
//   the input array.
//
// This suite exercises `sortBlogByRecency` with fast-check across >= 100 runs,
// generating arrays of BlogEntry with random ISO "YYYY-MM-DD" dates. It asserts:
//   (a) the output is ordered non-increasing by publishedDate;
//   (b) the output is a permutation of the input (same multiset of ids, none
//       dropped / added / duplicated);
//   (c) the input array is not mutated.

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { sortBlogByRecency, type BlogEntry } from "../src/lib/sortBlog";

/**
 * Format a Date as an ISO "YYYY-MM-DD" string (UTC), matching the shape the CMS
 * `mapBlog` passthrough produces for `publishedDate`.
 */
function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Arbitrary yielding a valid ISO "YYYY-MM-DD" date string. */
const isoDateArb: fc.Arbitrary<string> = fc
  .date({
    min: new Date("1970-01-01T00:00:00.000Z"),
    max: new Date("2100-12-31T00:00:00.000Z"),
  })
  .map(toIsoDate);

/**
 * Arbitrary producing a BlogEntry with a unique id per array (ids are assigned
 * by index after generation) and a random ISO publication date. Titles/bodies
 * are arbitrary strings — irrelevant to ordering but exercised for passthrough.
 */
const blogEntryFieldsArb = fc.record({
  title: fc.string(),
  publishedDate: isoDateArb,
  body: fc.string(),
});

/**
 * Arbitrary yielding an array of BlogEntry with guaranteed-unique ids so the
 * permutation check can compare multisets of ids exactly. Dates may repeat,
 * which deliberately exercises the stable/equal-date branch of the comparator.
 */
const blogEntriesArb: fc.Arbitrary<BlogEntry[]> = fc
  .array(blogEntryFieldsArb, { minLength: 0, maxLength: 30 })
  .map((fields) =>
    fields.map((f, index) => ({ id: `entry-${index}`, ...f })),
  );

/** Multiset (id -> count) helper for the permutation check. */
function idCounts(entries: BlogEntry[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    counts.set(entry.id, (counts.get(entry.id) ?? 0) + 1);
  }
  return counts;
}

describe("Property 8: blog entries ordered most-recent-first and preserved (Req 8.3)", () => {
  it("orders the output non-increasing by publishedDate", () => {
    fc.assert(
      fc.property(blogEntriesArb, (entries) => {
        const sorted = sortBlogByRecency(entries);

        for (let i = 1; i < sorted.length; i++) {
          // Non-increasing: each date is >= the next one.
          expect(
            sorted[i - 1].publishedDate >= sorted[i].publishedDate,
          ).toBe(true);
        }
      }),
      { numRuns: 200 },
    );
  });

  it("returns a permutation of the input (same multiset of ids)", () => {
    fc.assert(
      fc.property(blogEntriesArb, (entries) => {
        const sorted = sortBlogByRecency(entries);

        // Same length: nothing dropped or added.
        expect(sorted.length).toBe(entries.length);

        // Same multiset of ids: none dropped, added, or duplicated.
        const before = idCounts(entries);
        const after = idCounts(sorted);
        expect(after.size).toBe(before.size);
        for (const [id, count] of before) {
          expect(after.get(id)).toBe(count);
        }
      }),
      { numRuns: 200 },
    );
  });

  it("does not mutate the input array", () => {
    fc.assert(
      fc.property(blogEntriesArb, (entries) => {
        const snapshot = entries.map((e) => ({ ...e }));

        sortBlogByRecency(entries);

        // Same references in the same order, with unchanged field values.
        expect(entries.length).toBe(snapshot.length);
        for (let i = 0; i < entries.length; i++) {
          expect(entries[i].id).toBe(snapshot[i].id);
          expect(entries[i].publishedDate).toBe(snapshot[i].publishedDate);
          expect(entries[i].title).toBe(snapshot[i].title);
          expect(entries[i].body).toBe(snapshot[i].body);
        }
      }),
      { numRuns: 200 },
    );
  });
});
