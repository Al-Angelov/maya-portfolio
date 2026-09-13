// src/cms/mockData.ts — local mock content served when Sanity is unconfigured.
//
// When `isSanityConfigured()` is false (missing/dummy project ID), the data
// layer resolves these values INSTANTLY instead of hitting the network. They
// reuse the authoring seed data (`src/data/*`) which already matches the typed
// runtime models exactly, so the pages render fully-populated, realistic
// content in local/preview mode with zero API calls and no error states.

import { timelineCategories, type TimelineCategory } from "../data/timeline";
import { portfolioCards, type PortfolioCardData } from "../data/portfolio";
import { blogEntries } from "../data/blog";
import type { BlogEntry } from "../lib/sortBlog";
import {
  coreSkills,
  education,
  experience,
  languages,
  volunteering,
  type CareerEntry,
} from "../data/career";
import type {
  CareerContent,
  CareerDatedEntry,
} from "../data/careerContent";

/** Timeline categories used as instant mock content (Resume page). */
export const mockTimeline: TimelineCategory[] = timelineCategories;

/** Portfolio cards used as instant mock content (Portfolio page). */
export const mockPortfolio: PortfolioCardData[] = portfolioCards;

/** Blog entries used as instant mock content ("On My Mind" page). */
export const mockBlog: BlogEntry[] = blogEntries;

/** Adapt a legacy static `CareerEntry` to the runtime `CareerDatedEntry`. */
function toDatedEntry(entry: CareerEntry): CareerDatedEntry {
  return {
    id: entry.id,
    role: entry.role,
    organization: entry.organization,
    period: entry.period,
    ...(entry.location !== undefined ? { location: entry.location } : {}),
    ...(entry.detail
      ? { detail: entry.detail.text, detailKind: entry.detail.kind }
      : {}),
  };
}

/**
 * Career/Business tab content used as instant mock content when Sanity is
 * unconfigured (offline/preview). Reuses the existing static seed so the tab
 * renders fully-populated content without a network call.
 */
export const mockCareer: CareerContent = {
  experience: experience.map(toDatedEntry),
  education: education.map(toDatedEntry),
  volunteering: volunteering.map(toDatedEntry),
  skills: {
    title: "Main Skills Profile",
    coreSkills: [...coreSkills],
    spokenLanguages: [...languages],
  },
};
