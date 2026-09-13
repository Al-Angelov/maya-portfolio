// src/cms/sanityClient.ts — read-only public Sanity access (Req 12.1, 12.6)
//
// The portfolio site consumes a published, public, read-only Sanity dataset.
// Content is delivered through the CDN (`useCdn: true`) and NO write token is
// configured, so no secret is ever included in the client bundle (Req 12.6).
//
// IMPORTANT: when no real Sanity project is configured (missing/dummy project
// ID — see `config.ts`), we DO NOT create a live client and NEVER issue a
// network request to `apicdn.sanity.io`. Instead a stub client is exported
// whose `fetch` rejects synchronously with a sentinel; the data layer detects
// the unconfigured state up front and serves local mock content, so this stub
// is effectively never called. This prevents raw API error strings from ever
// reaching the UI in local/preview mode.
import { createClient, type SanityClient } from "@sanity/client";
import { isSanityConfigured } from "./config";

/**
 * The minimal read-only surface the app relies on: a single `fetch` method.
 * Both the real Sanity client and the offline stub satisfy this.
 */
export interface ReadOnlySanityClient {
  fetch: SanityClient["fetch"];
}

/**
 * Build the read-only client. Only calls `createClient` (which resolves the
 * `apicdn.sanity.io` host) when a real project is configured. Otherwise returns
 * an offline stub so no network request is ever attempted.
 */
function createReadOnlyClient(): ReadOnlySanityClient {
  if (!isSanityConfigured()) {
    // Offline stub — the data layer short-circuits to mock content before this
    // is ever invoked, but we fail closed (no network) just in case.
    return {
      fetch: (async () => {
        throw new Error("Sanity is not configured; using local content.");
      }) as SanityClient["fetch"],
    };
  }

  return createClient({
    projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
    dataset: import.meta.env.VITE_SANITY_DATASET, // public, read-only
    apiVersion: "2024-01-01",
    useCdn: true, // cached, public content delivery
    // token: intentionally omitted — no secret write token client-side (Req 12.6)
  });
}

export const sanityClient: ReadOnlySanityClient = createReadOnlyClient();
