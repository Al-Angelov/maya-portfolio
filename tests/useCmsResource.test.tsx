// Feature: maija-portfolio — tests for the useCmsResource fetch hook state
// machine (Req 12.3, 12.4, 12.5).
//
// Req 12.3: while a section's content is being fetched the hook is in the
//   `loading` state until the fetch resolves or fails.
// Req 12.4: if a fetch does not complete within 10 seconds it is treated as
//   failed (the hook aborts and transitions to `error`).
// Req 12.5: on a failed (re)fetch the hook RETAINS any previously loaded data
//   in `state.data` — a failure never blanks out the last-good content.
//
// The hook's only I/O is `sanityClient.fetch(query, {}, { signal })`, so we
// mock the `sanityClient` module and drive each state transition by controlling
// what that mock returns.

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useCmsResource } from "../src/cms/useCmsResource";
import type { SanityBlogEntry } from "../src/cms/queries";

// ---------------------------------------------------------------------------
// Mock the read-only Sanity client. `fetch` is a vi.fn we reconfigure per test.
// ---------------------------------------------------------------------------
const fetchMock = vi.fn();

vi.mock("../src/cms/sanityClient", () => ({
  sanityClient: {
    fetch: (...args: unknown[]) => fetchMock(...args),
  },
}));

// Force the "Sanity is configured" path so these tests exercise the real
// network-backed state machine (loading → success/error, timeout, retention).
// When Sanity is NOT configured the hook short-circuits to local mock content
// and never touches the client — that offline behavior is covered separately.
vi.mock("../src/cms/config", () => ({
  isSanityConfigured: () => true,
}));

/** A couple of sample blog documents as returned by the blog GROQ query. */
const sampleBlogDocs: SanityBlogEntry[] = [
  {
    _id: "be-1",
    _type: "blogEntry",
    title: "First post",
    publishedDate: "2024-03-01",
    body: "Hello world.",
    language: "EN",
  },
  {
    _id: "be-2",
    _type: "blogEntry",
    title: "Second post",
    publishedDate: "2024-05-10",
    body: "More thoughts.",
  },
];

/** The typed BlogEntry array `mapBlog` produces from `sampleBlogDocs`. */
const expectedBlog = [
  {
    id: "be-1",
    title: "First post",
    publishedDate: "2024-03-01",
    body: "Hello world.",
  },
  {
    id: "be-2",
    title: "Second post",
    publishedDate: "2024-05-10",
    body: "More thoughts.",
  },
];

beforeEach(() => {
  fetchMock.mockReset();
});

afterEach(() => {
  // Ensure any test that switched to fake timers restores real ones.
  vi.useRealTimers();
});

describe("useCmsResource state machine (Req 12.3–12.5)", () => {
  it("starts loading, then transitions to success with mapped data on a resolved fetch (Req 12.3)", async () => {
    fetchMock.mockResolvedValue(sampleBlogDocs);

    const { result } = renderHook(() => useCmsResource("blog"));

    // Initial synchronous render: the hook is loading with no data yet (Req 12.3).
    expect(result.current.status).toBe("loading");
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();

    await waitFor(() => {
      expect(result.current.status).toBe("success");
    });

    // The raw documents are passed through `mapBlog` into typed BlogEntry[].
    expect(result.current.data).toEqual(expectedBlog);
    expect(result.current.error).toBeNull();
  });

  it("transitions loading → error on a rejected fetch (Req 12.3)", async () => {
    const failure = new Error("network down");
    fetchMock.mockRejectedValue(failure);

    const { result } = renderHook(() => useCmsResource("blog"));

    expect(result.current.status).toBe("loading");

    await waitFor(() => {
      expect(result.current.status).toBe("error");
    });

    expect(result.current.error).toBe(failure);
    // No prior successful load, so there is no retained data.
    expect(result.current.data).toBeNull();
  });

  it("treats a hanging fetch as failed after the 10s timeout (Req 12.4)", async () => {
    vi.useFakeTimers();

    // The fetch never resolves on its own; it only rejects once its
    // AbortController signal fires, mirroring @sanity/client's abort behaviour.
    fetchMock.mockImplementation(
      (_query: string, _params: unknown, opts: { signal: AbortSignal }) =>
        new Promise((_resolve, reject) => {
          opts.signal.addEventListener("abort", () => {
            reject(new Error("The operation was aborted."));
          });
        }),
    );

    const { result } = renderHook(() => useCmsResource("blog"));
    expect(result.current.status).toBe("loading");

    // Advance past the 10s budget so the hook aborts the request (Req 12.4).
    // The abort triggers the fetch rejection, whose `.catch` setState is a
    // microtask — wrap the flush in act() so React applies the transition.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000);
    });

    expect(result.current.status).toBe("error");
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.data).toBeNull();
  });

  it("retains previously loaded data across a failed refetch (Req 12.5)", async () => {
    // First mount succeeds and populates data.
    fetchMock.mockResolvedValueOnce(sampleBlogDocs);

    const { result, rerender } = renderHook(
      ({ kind }: { kind: "blog" | "portfolio" }) => useCmsResource(kind),
      { initialProps: { kind: "blog" } as { kind: "blog" | "portfolio" } },
    );

    await waitFor(() => {
      expect(result.current.status).toBe("success");
    });
    expect(result.current.data).toEqual(expectedBlog);

    // A subsequent refetch (kind change triggers the effect again) rejects.
    fetchMock.mockRejectedValueOnce(new Error("refetch failed"));
    rerender({ kind: "portfolio" });

    await waitFor(() => {
      expect(result.current.status).toBe("error");
    });

    // The last successfully loaded data is retained despite the failure (Req 12.5).
    expect(result.current.data).toEqual(expectedBlog);
    expect(result.current.error).toBeInstanceOf(Error);
  });
});

describe("useCmsResource — language filtering (EN/FI toggle)", () => {
  it("passes the active language as a GROQ param and uses the language-filtered query", async () => {
    fetchMock.mockResolvedValue([]);

    const { result } = renderHook(() => useCmsResource("blog", "FI"));

    await waitFor(() => {
      expect(result.current.status).toBe("success");
    });

    expect(fetchMock).toHaveBeenCalled();
    const [query, params] = fetchMock.mock.calls[0];
    // The query filters by $language and the param binds the active language.
    expect(query).toContain("language == $language");
    expect(params).toEqual({ language: "FI" });
  });

  it("re-fetches with the new language when the toggle changes", async () => {
    fetchMock.mockResolvedValue([]);

    const { rerender } = renderHook(
      ({ lang }: { lang: "EN" | "FI" }) => useCmsResource("blog", lang),
      { initialProps: { lang: "EN" } },
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
    expect(fetchMock.mock.calls[0][1]).toEqual({ language: "EN" });

    // Toggling the language triggers a fresh fetch bound to "FI".
    rerender({ lang: "FI" });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
    expect(fetchMock.mock.calls[1][1]).toEqual({ language: "FI" });
  });
});
