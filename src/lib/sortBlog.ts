/**
 * Blog recency ordering logic (Req 8.3).
 *
 * A blog entry as consumed by the "On My Mind" page. Mirrors the design-doc
 * shape; the runtime value is produced by the CMS `mapBlog` passthrough.
 */
export interface BlogEntry {
  id: string;
  title: string;
  /** ISO date string "YYYY-MM-DD". */
  publishedDate: string;
  body: string;
}

/**
 * Return a permutation of `entries` ordered non-increasing by `publishedDate`
 * (most-recent-first). Pure: the input array is not mutated.
 *
 * ISO "YYYY-MM-DD" strings are lexicographically comparable in chronological
 * order, so a plain string comparison yields the correct date ordering without
 * constructing Date objects.
 */
export function sortBlogByRecency(entries: BlogEntry[]): BlogEntry[] {
  return [...entries].sort((a, b) => {
    if (a.publishedDate < b.publishedDate) return 1;
    if (a.publishedDate > b.publishedDate) return -1;
    return 0;
  });
}
