// Tests for the language-aware GROQ query builders and timeline sorting.
//
// The language toggle must strictly filter CMS content: when a language is
// active, the queries only request documents whose `language` field equals it.
// Timeline entries are additionally ordered newest-first (year descending).

import { describe, it, expect } from "vitest";
import {
  buildTimelineQuery,
  buildPortfolioQuery,
  buildBlogQuery,
  mapTimeline,
  type SanityTimelineEntry,
} from "../src/cms/queries";

describe("GROQ query builders — language filtering", () => {
  it("timeline query filters by $language and orders by year desc when a language is requested", () => {
    const q = buildTimelineQuery(true);
    expect(q).toContain("_type == \"timelineEntry\"");
    expect(q).toContain("language == $language");
    expect(q).toContain("order(year desc)");
  });

  it("portfolio query filters by $language when a language is requested", () => {
    const q = buildPortfolioQuery(true);
    expect(q).toContain("_type == \"portfolioCard\"");
    expect(q).toContain("language == $language");
    // The uploaded image URL is still resolved.
    expect(q).toContain("mainImage.asset->url");
  });

  it("blog query filters by $language and orders by publishedDate desc when a language is requested", () => {
    const q = buildBlogQuery(true);
    expect(q).toContain("_type == \"blogEntry\"");
    expect(q).toContain("language == $language");
    expect(q).toContain("order(publishedDate desc)");
  });

  it("omits the language clause when no language is requested (language-agnostic)", () => {
    expect(buildTimelineQuery(false)).not.toContain("language == $language");
    expect(buildPortfolioQuery(false)).not.toContain("language == $language");
    expect(buildBlogQuery(false)).not.toContain("language == $language");
  });
});

describe("mapTimeline — year-descending order (newest first)", () => {
  const base = {
    _type: "timelineEntry" as const,
    role: "Lead",
    venue: "A Venue",
    category: "Theatre" as const,
  };

  it("orders entries within a category by year descending", () => {
    const docs: SanityTimelineEntry[] = [
      { ...base, _id: "a", title: "Older", year: "2019" },
      { ...base, _id: "b", title: "Newest", year: "2026" },
      { ...base, _id: "c", title: "Middle", year: "2022" },
    ];
    const theatre = mapTimeline(docs).find((c) => c.label === "Theatre")!;
    expect(theatre.entries.map((e) => e.production)).toEqual([
      "Newest",
      "Middle",
      "Older",
    ]);
  });

  it("uses the most-recent year of a range like '2023 – 2026' for ordering", () => {
    const docs: SanityTimelineEntry[] = [
      { ...base, _id: "a", title: "Single", year: "2024" },
      { ...base, _id: "b", title: "Range", year: "2023 – 2026" },
    ];
    const theatre = mapTimeline(docs).find((c) => c.label === "Theatre")!;
    // "Range" resolves to 2026, so it sorts ahead of the 2024 single year.
    expect(theatre.entries.map((e) => e.production)).toEqual([
      "Range",
      "Single",
    ]);
  });
});
