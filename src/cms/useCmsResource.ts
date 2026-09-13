// src/cms/useCmsResource.ts — CMS fetch hook (Req 12.1, 12.3–12.5)
//
// Each of the Resume, Portfolio, and Blog pages calls `useCmsResource(kind)` to
// obtain its runtime content from Sanity. The hook issues the resource's GROQ
// query through the read-only `sanityClient`, applies the matching pure mapper
// (`mapTimeline`/`mapPortfolio`/`mapBlog`) to turn Sanity documents into the
// existing typed models, and exposes a small state machine:
//
//   { status: "loading" | "success" | "error", data, error }
//
// A 10-second timeout is enforced via `AbortController` (Req 12.4): if the
// fetch has not resolved by then the request is aborted and the hook
// transitions to `error`. Any previously loaded data is RETAINED in
// `state.data` across a failed refetch (Req 12.5) — failures never clear the
// last-good content.
import { useEffect, useState } from "react";
import { sanityClient } from "./sanityClient";
import { isSanityConfigured } from "./config";
import { mockBlog, mockCareer, mockPortfolio, mockTimeline } from "./mockData";
import {
  buildBlogQuery,
  buildCareerQuery,
  buildPortfolioQuery,
  buildTimelineQuery,
  mapBlog,
  mapCareer,
  mapPortfolio,
  mapTimeline,
  type SanityBlogEntry,
  type SanityCareerResult,
  type SanityPortfolioCard,
  type SanityTimelineEntry,
} from "./queries";
import type { TimelineCategory } from "../data/timeline";
import type { CareerContent } from "../data/careerContent";
import type { PortfolioCardData } from "../lib/filterCards";
import type { BlogEntry } from "../lib/sortBlog";
import type { Language } from "../i18n/types";

/** The CMS resource kinds and their mapped model types. */
export interface CmsResourceMap {
  timeline: TimelineCategory[];
  portfolio: PortfolioCardData[];
  blog: BlogEntry[];
  career: CareerContent;
}

export type CmsResourceKind = keyof CmsResourceMap;

export type CmsStatus = "loading" | "success" | "error";

export interface CmsResourceState<T> {
  status: CmsStatus;
  /** Last successfully loaded data; retained across a failed refetch (Req 12.5). */
  data: T | null;
  error: Error | null;
}

/** Timeout for a single CMS fetch before it is aborted and failed (Req 12.4). */
const FETCH_TIMEOUT_MS = 10_000;

/**
 * Resolve a resource kind to its GROQ query and a function that maps the raw
 * Sanity documents into the typed model for that kind. The mapper is typed as
 * accepting `unknown[]` because `sanityClient.fetch` returns `any`; each
 * concrete mapper narrows its own input.
 */
function resourceConfig<K extends CmsResourceKind>(
  kind: K,
  withLanguage: boolean,
): { query: string; map: (raw: unknown) => CmsResourceMap[K] } {
  switch (kind) {
    case "timeline":
      return {
        query: buildTimelineQuery(withLanguage),
        map: (raw) =>
          mapTimeline((raw ?? []) as SanityTimelineEntry[]) as CmsResourceMap[K],
      };
    case "portfolio":
      return {
        query: buildPortfolioQuery(withLanguage),
        map: (raw) =>
          mapPortfolio((raw ?? []) as SanityPortfolioCard[]) as CmsResourceMap[K],
      };
    case "blog":
      return {
        query: buildBlogQuery(withLanguage),
        map: (raw) =>
          mapBlog((raw ?? []) as SanityBlogEntry[]) as CmsResourceMap[K],
      };
    case "career":
      return {
        query: buildCareerQuery(withLanguage),
        // The career query returns a projected OBJECT (four arrays), not an
        // array — pass it straight to `mapCareer`.
        map: (raw) =>
          mapCareer((raw ?? {}) as SanityCareerResult) as CmsResourceMap[K],
      };
    default: {
      // Exhaustiveness guard: every kind must be handled above.
      const never: never = kind;
      throw new Error(`Unknown CMS resource kind: ${String(never)}`);
    }
  }
}

/**
 * The local mock content for a resource kind, served instantly when Sanity is
 * not configured (missing/dummy project ID). Reuses the authoring seed data,
 * which already matches the runtime models exactly.
 *
 * When a `language` is provided, the timeline mock is filtered by it so the
 * language toggle visibly filters even in offline/preview mode. Filtering is
 * lenient here: seed entries WITHOUT a `language` are shown under both
 * languages so local preview never goes blank. (Live Sanity content is filtered
 * strictly at the query level — see `buildTimelineQuery`.)
 */
function mockFor<K extends CmsResourceKind>(
  kind: K,
  language?: Language,
): CmsResourceMap[K] {
  switch (kind) {
    case "timeline": {
      if (!language) return mockTimeline as CmsResourceMap[K];
      const filtered = mockTimeline.map((category) => ({
        ...category,
        entries: category.entries.filter(
          (entry) => entry.language === undefined || entry.language === language,
        ),
      }));
      return filtered as CmsResourceMap[K];
    }
    case "portfolio":
      return mockPortfolio as CmsResourceMap[K];
    case "blog":
      return mockBlog as CmsResourceMap[K];
    case "career":
      return mockCareer as CmsResourceMap[K];
    default: {
      const never: never = kind;
      throw new Error(`Unknown CMS resource kind: ${String(never)}`);
    }
  }
}

/**
 * Fetch a CMS resource by kind, exposing a `{ status, data, error }` state
 * machine. On mount (and whenever `kind` changes) the hook issues the GROQ
 * query with a 10s `AbortController` timeout, applies the mapper on success,
 * and retains the previous `data` on failure (Req 12.3–12.5).
 */
export function useCmsResource<K extends CmsResourceKind>(
  kind: K,
  language?: Language,
): CmsResourceState<CmsResourceMap[K]> {
  // When no real Sanity project is configured, resolve local mock content
  // synchronously on the very first render — no `loading` flash, no network
  // request, no error path. The pages then render fully-populated content.
  const configured = isSanityConfigured();
  // Only filter by language when one is supplied.
  const withLanguage = language !== undefined;

  const [state, setState] = useState<CmsResourceState<CmsResourceMap[K]>>(() =>
    configured
      ? { status: "loading", data: null, error: null }
      : { status: "success", data: mockFor(kind, language), error: null },
  );

  useEffect(() => {
    // Offline/mock mode: never touch the network. Serve (language-filtered)
    // mock content for the current kind and bail out (also handles a change of
    // `kind` or `language`).
    if (!isSanityConfigured()) {
      setState({ status: "success", data: mockFor(kind, language), error: null });
      return;
    }

    let cancelled = false;
    const controller = new AbortController();
    const { query, map } = resourceConfig(kind, withLanguage);
    // GROQ params: only bind `$language` when the query filters by it.
    const params = withLanguage ? { language } : {};

    // Enter the loading state on (re)fetch while retaining any prior data so a
    // refetch never blanks out the last-good content (Req 12.5).
    setState((prev) => ({ status: "loading", data: prev.data, error: null }));

    // Abort the in-flight request after the 10s budget (Req 12.4).
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, FETCH_TIMEOUT_MS);

    sanityClient
      .fetch(query, params, { signal: controller.signal })
      .then((raw: unknown) => {
        if (cancelled) return;
        clearTimeout(timeoutId);
        // Each kind's `map` narrows and null-defaults the raw fetch result
        // (an array for timeline/portfolio/blog, an object for career).
        const mapped = map(raw);
        setState({ status: "success", data: mapped, error: null });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        clearTimeout(timeoutId);
        const error =
          err instanceof Error ? err : new Error(String(err));
        // Retain the last successfully loaded data on failure (Req 12.5).
        setState((prev) => ({ status: "error", data: prev.data, error }));
      });

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      controller.abort();
    };
    // Re-fetch when the resource kind OR the active language changes so the
    // language toggle refilters CMS content.
  }, [kind, language, withLanguage]);

  return state;
}
