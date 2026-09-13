/**
 * Tag filtering logic for the Portfolio section (Req 7.7, 7.8, 7.10).
 *
 * A portfolio card as consumed by the Portfolio page. Mirrors the design-doc
 * shape; the runtime value is produced by the CMS `mapPortfolio` mapper.
 */
// Legacy seed categories plus any free-form category string authored in the CMS
// (e.g. "Short Video", "Writing"). Kept as a widened string so Studio content
// with arbitrary category labels renders without a schema change.
export type PortfolioCategory = "video" | "social" | "writing" | (string & {});

export interface PortfolioCardData {
  id: string;
  category: PortfolioCategory;
  /** Optional work title (authored in the CMS). */
  title?: string;
  /** Resolved image URL (CMS `mainImage`) or a placeholder path. */
  imagePlaceholder: string;
  /** Description text. */
  description: string;
  /** Tags used for filtering. */
  tags: string[];
  /** Present for written works (Req 7.5). */
  publication?: "Helsingin Sanomat" | "Pärskeitä";
  /** Optional external link to the published work (CMS `externalLink`). */
  externalLink?: string;
}

/**
 * Return every distinct tag present across `cards`, each appearing exactly once
 * (Req 7.7). First-seen order is preserved. Pure: no inputs are mutated.
 */
export function distinctTags(cards: PortfolioCardData[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const card of cards) {
    for (const tag of card.tags) {
      if (!seen.has(tag)) {
        seen.add(tag);
        result.push(tag);
      }
    }
  }
  return result;
}

/**
 * Return the cards matching `tag` (Req 7.8). When `tag` is `null`, the full,
 * unchanged set of cards is returned (Req 7.10). Pure: no inputs are mutated;
 * the returned array is always a fresh array.
 */
export function filterCards(
  cards: PortfolioCardData[],
  tag: string | null,
): PortfolioCardData[] {
  if (tag === null) return [...cards];
  return cards.filter((card) => card.tags.includes(tag));
}
