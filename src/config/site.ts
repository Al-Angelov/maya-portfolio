// src/config/site.ts — centralized site identity and contact config.
//
// Maija's LinkedIn URL, contact email, and location live here in a single place
// so they can be updated without touching component code. Each value may be
// overridden at build time via an optional `VITE_*` env var (see
// src/vite-env.d.ts); when unset, the default below is used.
//
// Per the minimalist design, LinkedIn is the only social profile linked from
// the site (Instagram has been removed entirely).

/** Read an optional env override, falling back to `fallback` when unset/empty. */
function envOr(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
}

/** Maija's contact email address (single source of truth). */
export const CONTACT_EMAIL = envOr(
  import.meta.env.VITE_CONTACT_EMAIL,
  "maija.mattelmaki@icloud.com",
);

/** Maija's location, shown in the footer contact column. */
export const CONTACT_LOCATION = envOr(
  import.meta.env.VITE_CONTACT_LOCATION,
  "Helsinki, Finland",
);

/** LinkedIn profile URL — the only linked social profile. */
export const LINKEDIN_URL = envOr(
  import.meta.env.VITE_SOCIAL_LINKEDIN_URL,
  "https://www.linkedin.com/in/maija-m-977147354/",
);
