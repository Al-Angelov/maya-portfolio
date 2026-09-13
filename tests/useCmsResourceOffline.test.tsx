// Offline/mock-fallback behavior for useCmsResource.
//
// When no real Sanity project is configured (missing/dummy VITE_SANITY_PROJECT_ID),
// the hook MUST:
//   - resolve to `success` with local mock content on the FIRST render (no
//     `loading` flash),
//   - never call the Sanity client (no network request to apicdn.sanity.io),
//   - never surface an error.
//
// This guards the data-fallback requirement so the UI shows realistic content
// and never a raw API error string in local/preview mode.

import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";

// A spy we assert is NEVER called in offline mode.
const fetchSpy = vi.fn();
vi.mock("../src/cms/sanityClient", () => ({
  sanityClient: {
    fetch: (...args: unknown[]) => fetchSpy(...args),
  },
}));

// Force the "not configured" path.
vi.mock("../src/cms/config", () => ({
  isSanityConfigured: () => false,
}));

import { useCmsResource } from "../src/cms/useCmsResource";
import {
  mockBlog,
  mockCareer,
  mockPortfolio,
  mockTimeline,
} from "../src/cms/mockData";

describe("useCmsResource offline/mock fallback", () => {
  it("returns mock blog content as success on first render without calling the client", () => {
    const { result } = renderHook(() => useCmsResource("blog"));

    expect(result.current.status).toBe("success");
    expect(result.current.data).toEqual(mockBlog);
    expect(result.current.error).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns mock portfolio content as success on first render", () => {
    const { result } = renderHook(() => useCmsResource("portfolio"));

    expect(result.current.status).toBe("success");
    expect(result.current.data).toEqual(mockPortfolio);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns mock timeline content as success on first render", () => {
    const { result } = renderHook(() => useCmsResource("timeline"));

    expect(result.current.status).toBe("success");
    expect(result.current.data).toEqual(mockTimeline);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns mock career content as success on first render", () => {
    const { result } = renderHook(() => useCmsResource("career"));

    expect(result.current.status).toBe("success");
    expect(result.current.data).toEqual(mockCareer);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
