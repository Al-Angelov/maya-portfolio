// Feature: maija-portfolio, Property 3: Card data invariants hold.
//
// Design Property 3 (Validates: Requirements 7.6):
//   Every portfolio card SHALL carry exactly one non-empty image placeholder,
//   a description of at most 300 characters, and between 1 and 5 tags.
//
// This suite exercises the invariant validator with fast-check across >= 100
// runs, using both:
//   (a) a fast-check generator that produces valid `PortfolioCardData`, and
//   (b) each card in the `portfolioCards` seed dataset.
//
// The pure `cardInvariantsHold` validator encodes the Req 7.6 constraints so it
// can be asserted directly against generated data and the seed fixtures.

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import type { PortfolioCardData } from "../src/lib/filterCards";
import { portfolioCards } from "../src/data/portfolio";

/**
 * True when a card satisfies all Req 7.6 invariants:
 *   - exactly one image placeholder that is a non-empty (non-whitespace) string,
 *   - description length <= 300,
 *   - tags length between 1 and 5 (inclusive).
 * Pure: does not mutate its input.
 */
function cardInvariantsHold(card: PortfolioCardData): boolean {
  const hasImage =
    typeof card.imagePlaceholder === "string" &&
    card.imagePlaceholder.trim().length > 0;
  const descriptionOk =
    typeof card.description === "string" && card.description.length <= 300;
  const tagsOk =
    Array.isArray(card.tags) && card.tags.length >= 1 && card.tags.length <= 5;
  return hasImage && descriptionOk && tagsOk;
}

const categoryArb = fc.constantFrom("video", "social", "writing") as fc.Arbitrary<
  PortfolioCardData["category"]
>;

/** A non-empty image placeholder path (guaranteed at least one visible char). */
const imagePlaceholderArb: fc.Arbitrary<string> = fc
  .string()
  .map((s) => `/images/${s}.svg`);

/** A description constrained to at most 300 characters. */
const descriptionArb: fc.Arbitrary<string> = fc.string({ maxLength: 300 });

/** Between 1 and 5 tags. */
const tagsArb: fc.Arbitrary<string[]> = fc.array(fc.string(), {
  minLength: 1,
  maxLength: 5,
});

const publicationArb = fc.option(
  fc.constantFrom("Helsingin Sanomat", "Pärskeitä") as fc.Arbitrary<
    NonNullable<PortfolioCardData["publication"]>
  >,
  { nil: undefined },
);

/** Generator producing valid `PortfolioCardData` satisfying Req 7.6. */
const validCardArb: fc.Arbitrary<PortfolioCardData> = fc.record({
  id: fc.string({ minLength: 1 }),
  category: categoryArb,
  imagePlaceholder: imagePlaceholderArb,
  description: descriptionArb,
  tags: tagsArb,
  publication: publicationArb,
});

describe("Property 3: Card data invariants hold (Req 7.6)", () => {
  it("holds for generated valid PortfolioCardData", () => {
    fc.assert(
      fc.property(validCardArb, (card) => {
        expect(cardInvariantsHold(card)).toBe(true);

        // Spell out the individual invariants for a precise failure signal.
        expect(card.imagePlaceholder.trim().length).toBeGreaterThan(0);
        expect(card.description.length).toBeLessThanOrEqual(300);
        expect(card.tags.length).toBeGreaterThanOrEqual(1);
        expect(card.tags.length).toBeLessThanOrEqual(5);
      }),
      { numRuns: 200 },
    );
  });

  it("holds for every card in the portfolioCards seed dataset", () => {
    expect(portfolioCards.length).toBeGreaterThan(0);
    for (const card of portfolioCards) {
      expect(cardInvariantsHold(card)).toBe(true);
      expect(card.imagePlaceholder.trim().length).toBeGreaterThan(0);
      expect(card.description.length).toBeLessThanOrEqual(300);
      expect(card.tags.length).toBeGreaterThanOrEqual(1);
      expect(card.tags.length).toBeLessThanOrEqual(5);
    }
  });
});
