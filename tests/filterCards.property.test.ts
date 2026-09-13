// Feature: maija-portfolio, Property 4: Tag filter controls equal the distinct
// tags present.
//
// This file hosts the property tests for the pure tag-filtering logic in
// `src/lib/filterCards.ts`. Properties 5 and 6 are appended as additional
// `describe` blocks below; the shared card generators declared near the top of
// this file are intended to be reused by those suites.

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  distinctTags,
  filterCards,
  type PortfolioCardData,
} from "../src/lib/filterCards";

// ---------------------------------------------------------------------------
// Shared generators (reused by Property 4/5/6 suites)
// ---------------------------------------------------------------------------

const categoryArb = fc.constantFrom(
  "video",
  "social",
  "writing",
) as fc.Arbitrary<PortfolioCardData["category"]>;

/**
 * A small pool of tags so generated cards have overlapping tag sets. Drawing
 * tags from a bounded pool guarantees that, across an array of cards, the same
 * tag appears on multiple cards frequently (the "overlapping tag sets" the
 * task calls for).
 */
const tagPool = [
  "editing",
  "social",
  "writing",
  "video",
  "instagram",
  "essay",
  "review",
  "documentary",
];

const tagArb: fc.Arbitrary<string> = fc.constantFrom(...tagPool);

/** Between 1 and 5 tags drawn from the shared pool (mirrors Req 7.6). */
const tagsArb: fc.Arbitrary<string[]> = fc
  .array(tagArb, { minLength: 1, maxLength: 5 })
  .map((tags) => Array.from(new Set(tags)));

const publicationArb = fc.option(
  fc.constantFrom("Helsingin Sanomat", "Pärskeitä") as fc.Arbitrary<
    NonNullable<PortfolioCardData["publication"]>
  >,
  { nil: undefined },
);

/** Generator producing a `PortfolioCardData` with tags from the shared pool. */
const cardArb: fc.Arbitrary<PortfolioCardData> = fc.record({
  id: fc.string({ minLength: 1 }),
  category: categoryArb,
  imagePlaceholder: fc.string().map((s) => `/images/${s}.svg`),
  description: fc.string({ maxLength: 300 }),
  tags: tagsArb,
  publication: publicationArb,
});

/**
 * An array of cards with overlapping tag sets. Length up to 12 keeps runs fast
 * while still exercising overlap and duplication across many cards.
 */
const cardsArb: fc.Arbitrary<PortfolioCardData[]> = fc.array(cardArb, {
  minLength: 0,
  maxLength: 12,
});

// ---------------------------------------------------------------------------
// Property 4 (Validates: Requirements 7.7)
// ---------------------------------------------------------------------------

describe("Property 4: Tag filter controls equal the distinct tags present (Req 7.7)", () => {
  it("distinctTags(cards) equals the union of all card tags, with no duplicates", () => {
    fc.assert(
      fc.property(cardsArb, (cards) => {
        const result = distinctTags(cards);

        // The union of every tag present across the cards.
        const union = new Set<string>();
        for (const card of cards) {
          for (const tag of card.tags) union.add(tag);
        }

        // No duplicates: each tag appears exactly once.
        expect(result.length).toBe(new Set(result).size);

        // As a set, the result equals the union of all card tags.
        expect(new Set(result)).toEqual(union);
        expect(result.length).toBe(union.size);

        // Every tag present on some card is included exactly once...
        for (const tag of union) {
          expect(result.filter((t) => t === tag).length).toBe(1);
        }
        // ...and every returned tag is actually present on some card.
        for (const tag of result) {
          expect(union.has(tag)).toBe(true);
        }
      }),
      { numRuns: 200 },
    );
  });
});
// ---------------------------------------------------------------------------
// Property 5 (Validates: Requirements 7.8)
// ---------------------------------------------------------------------------

// Feature: maija-portfolio, Property 5: Filtering by a tag selects exactly the
// matching cards.
//
// For `filterCards(cards, tag)` where `tag` is a real string, the result must
// contain exactly the cards whose `tags` include `tag` (and no others). The
// tag is drawn from both tags present in the generated cards and tags that are
// absent, so the absent-tag case (empty result) is exercised as well.

describe("Property 5: Filtering by a tag selects exactly the matching cards (Req 7.8)", () => {
  it("filterCards(cards, tag) returns exactly the cards whose tags include tag", () => {
    // Tags that are guaranteed absent from the pool, so filtering by them
    // yields an empty result set.
    const absentTagArb = fc.constantFrom(
      "nonexistent",
      "missing",
      "unused",
      "photography",
    );

    fc.assert(
      fc.property(
        cardsArb,
        // Draw the tag from present tags (pool) and absent tags alike.
        fc.oneof(tagArb, absentTagArb),
        (cards, tag) => {
          const result = filterCards(cards, tag);

          // The expected matching set: every card whose tags include `tag`.
          const expected = cards.filter((card) => card.tags.includes(tag));

          // Exactly the matching cards, in the same order, no others.
          expect(result).toEqual(expected);
          expect(result.length).toBe(expected.length);

          // Every returned card actually carries the tag...
          for (const card of result) {
            expect(card.tags.includes(tag)).toBe(true);
          }
          // ...and no matching card is left out.
          for (const card of cards) {
            if (card.tags.includes(tag)) {
              expect(result).toContain(card);
            } else {
              expect(result).not.toContain(card);
            }
          }

          // Pure: the returned array is a fresh array, not the input.
          expect(result).not.toBe(cards);
        },
      ),
      { numRuns: 200 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 6 (Validates: Requirements 7.10)
// ---------------------------------------------------------------------------

// Feature: maija-portfolio, Property 6: Clearing the filter returns all cards.
//
// When the active tag filter is cleared, `filterCards(cards, null)` must return
// the full, unchanged set of cards: same length, same cards in the same order,
// with no card dropped, added, or reordered. The result is a fresh array so the
// filtering logic never mutates or aliases its input.

describe("Property 6: Clearing the filter returns all cards (Req 7.10)", () => {
  it("filterCards(cards, null) returns every card, in order, dropping none", () => {
    fc.assert(
      fc.property(cardsArb, (cards) => {
        const result = filterCards(cards, null);

        // Same number of cards: none dropped, none added.
        expect(result.length).toBe(cards.length);

        // Same cards, in the same order (identical multiset and sequence).
        expect(result).toEqual(cards);

        // Every card of the input is present in the result and vice versa.
        for (const card of cards) {
          expect(result).toContain(card);
        }
        for (const card of result) {
          expect(cards).toContain(card);
        }

        // Pure: a fresh array is returned, not the input reference.
        expect(result).not.toBe(cards);
      }),
      { numRuns: 100 },
    );
  });
});
