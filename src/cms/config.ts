// src/cms/config.ts — runtime detection of whether a real Sanity project is
// configured.
//
// The site ships with placeholder/dummy env values in local development (e.g.
// `dummyprojid23`) so that the UI can be previewed without a live CMS. When the
// project ID is missing, empty, or an obvious dummy value we MUST NOT attempt a
// network request to `apicdn.sanity.io` — instead the data layer serves local
// mock content instantly (see `mockData.ts` and `useCmsResource.ts`).

/**
 * A Sanity project ID is only considered "configured" when it is a non-empty
 * string that does not look like a placeholder. Sanity project IDs are lower
 * case alphanumeric; our seeded dummy values contain the literal word "dummy",
 * so we treat any value containing "dummy" (case-insensitive) as unconfigured,
 * along with a small set of common placeholder tokens.
 */
const PLACEHOLDER_PATTERNS = [
  /dummy/i,
  /placeholder/i,
  /^your[-_]?project/i,
  /^example$/i,
  /^changeme$/i,
  /^xxx+$/i,
  /^todo$/i,
];

/** True when `value` is a non-empty string that is not a known placeholder. */
function isRealValue(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (trimmed.length === 0) return false;
  return !PLACEHOLDER_PATTERNS.some((re) => re.test(trimmed));
}

/**
 * Whether a real, usable Sanity project is configured. When this is `false`,
 * the data layer serves local mock content and never issues a network request
 * (avoids `apicdn.sanity.io` failures and raw error strings in the UI).
 *
 * Both the project ID and dataset must be real (non-placeholder) values.
 */
export function isSanityConfigured(): boolean {
  return (
    isRealValue(import.meta.env.VITE_SANITY_PROJECT_ID) &&
    isRealValue(import.meta.env.VITE_SANITY_DATASET)
  );
}
