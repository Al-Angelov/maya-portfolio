// Tests for the CMS → frontend wiring introduced with the live Sanity schemas.
//
// These cover the mapper behaviors that let newly-published Studio content
// render on the frontend:
//   - timeline: `title` is used as the production; "Film & TV" normalizes to the
//     frontend's canonical "TV & Film"; "Career/Business" is not shown in the
//     performer timeline; string years pass through.
//   - portfolio: uploaded `mainImage` (resolved to `mainImageUrl`) is preferred
//     over the legacy `image` path; `title`/`externalLink` are surfaced.
//   - blog: Portable Text `body` is flattened to plain text; a string passes
//     through unchanged.

import { describe, it, expect } from "vitest";
import {
  mapTimeline,
  mapPortfolio,
  mapBlog,
  portableTextToPlain,
  type SanityTimelineEntry,
  type SanityPortfolioCard,
  type SanityBlogEntry,
} from "../src/cms/queries";

describe("mapTimeline — new schema wiring", () => {
  const base = {
    _type: "timelineEntry" as const,
    role: "Lead",
    venue: "A Venue",
    year: "2025",
  };

  it("uses `title` as the production and normalizes 'Film & TV' → 'TV & Film'", () => {
    const docs: SanityTimelineEntry[] = [
      { ...base, _id: "t1", title: "A Film", category: "Film & TV" },
    ];
    const result = mapTimeline(docs);

    const tvFilm = result.find((c) => c.label === "TV & Film");
    expect(tvFilm).toBeTruthy();
    expect(tvFilm!.entries).toHaveLength(1);
    expect(tvFilm!.entries[0].production).toBe("A Film");
    expect(tvFilm!.entries[0].year).toBe("2025");
  });

  it("accepts the canonical 'TV & Film' label too", () => {
    const docs: SanityTimelineEntry[] = [
      { ...base, _id: "t2", title: "Another", category: "TV & Film" },
    ];
    const result = mapTimeline(docs);
    expect(result.find((c) => c.label === "TV & Film")!.entries).toHaveLength(1);
  });

  it("does not surface 'Career/Business' entries in the performer timeline", () => {
    const docs: SanityTimelineEntry[] = [
      { ...base, _id: "t3", title: "A Job", category: "Career/Business" },
    ];
    const result = mapTimeline(docs);

    // Only the three canonical timeline categories are emitted, all empty.
    expect(result.map((c) => c.label)).toEqual([
      "Theatre",
      "TV & Film",
      "Directing & Writing",
    ]);
    const total = result.reduce((n, c) => n + c.entries.length, 0);
    expect(total).toBe(0);
  });

  it("falls back to legacy `production` when `title` is absent", () => {
    const docs: SanityTimelineEntry[] = [
      { ...base, _id: "t4", production: "Legacy Title", category: "Theatre" },
    ];
    const result = mapTimeline(docs);
    expect(result.find((c) => c.label === "Theatre")!.entries[0].production).toBe(
      "Legacy Title",
    );
  });
});

describe("mapPortfolio — new schema wiring", () => {
  it("prefers the resolved mainImage URL over the legacy image path", () => {
    const docs: SanityPortfolioCard[] = [
      {
        _id: "p1",
        _type: "portfolioCard",
        title: "Short Film",
        category: "Short Video",
        mainImageUrl: "https://cdn.sanity.io/images/x/y/abc-800x600.jpg",
        image: "/images/legacy.svg",
        description: "A short video edit.",
        tags: ["Video"],
        externalLink: "https://example.com/watch",
      },
    ];
    const [card] = mapPortfolio(docs);

    expect(card.imagePlaceholder).toBe(
      "https://cdn.sanity.io/images/x/y/abc-800x600.jpg",
    );
    expect(card.title).toBe("Short Film");
    expect(card.category).toBe("Short Video");
    expect(card.externalLink).toBe("https://example.com/watch");
  });

  it("falls back to the legacy image path when no mainImage is uploaded", () => {
    const docs: SanityPortfolioCard[] = [
      {
        _id: "p2",
        _type: "portfolioCard",
        category: "Writing",
        image: "/images/legacy.svg",
        description: "An article.",
        tags: ["Writing"],
      },
    ];
    const [card] = mapPortfolio(docs);
    expect(card.imagePlaceholder).toBe("/images/legacy.svg");
  });

  it("yields an empty image string when neither source is present", () => {
    const docs: SanityPortfolioCard[] = [
      {
        _id: "p3",
        _type: "portfolioCard",
        category: "Writing",
        description: "No image yet.",
        tags: ["Writing"],
      },
    ];
    expect(mapPortfolio(docs)[0].imagePlaceholder).toBe("");
  });
});

describe("mapBlog / portableTextToPlain — Portable Text flattening", () => {
  it("flattens Portable Text blocks to plain text with paragraph breaks", () => {
    const body = [
      {
        _type: "block",
        children: [
          { _type: "span", text: "First " },
          { _type: "span", text: "paragraph." },
        ],
      },
      {
        _type: "block",
        children: [{ _type: "span", text: "Second paragraph." }],
      },
    ];
    expect(portableTextToPlain(body)).toBe(
      "First paragraph.\n\nSecond paragraph.",
    );
  });

  it("passes a plain string body through unchanged", () => {
    expect(portableTextToPlain("Just text.")).toBe("Just text.");
  });

  it("mapBlog flattens a Portable Text body and preserves other fields", () => {
    const docs: SanityBlogEntry[] = [
      {
        _id: "b1",
        _type: "blogEntry",
        title: "A Post",
        publishedDate: "2026-01-02",
        body: [
          { _type: "block", children: [{ _type: "span", text: "Hello world." }] },
        ],
        language: "EN",
      },
    ];
    const [entry] = mapBlog(docs);
    expect(entry.id).toBe("b1");
    expect(entry.title).toBe("A Post");
    expect(entry.publishedDate).toBe("2026-01-02");
    expect(entry.body).toBe("Hello world.");
  });
});
