// Feature: maija-portfolio
//
// Static portfolio card seed data (Req 7.4, 7.5, 7.6, 12.7).
//
// This module is NOT the runtime source of truth. At runtime the Portfolio
// cards are fetched from the CMS via `useCmsResource` and mapped to
// `PortfolioCardData[]` by `mapPortfolio`. These values are the authoring
// reference used to populate Sanity and to seed tests; their shape matches the
// CMS-mapped `PortfolioCardData[]` exactly, so the pure logic and correctness
// properties (`filterCards`, `distinctTags`) are unaffected.
//
// The `PortfolioCardData` type lives in `src/lib/filterCards.ts` — the single
// source of truth — and is re-exported here for convenience of seed consumers.

import type { PortfolioCardData } from "../lib/filterCards";

export type { PortfolioCardData } from "../lib/filterCards";

// Seed cards covering the three required categories (Req 7.4): short video
// editing projects, social media management case studies, and written works —
// including works published in Helsingin Sanomat and Pärskeitä (Req 7.5).
//
// Every card carries exactly one placeholder image frame, a description of at
// most 300 characters, and between 1 and 5 tags (Req 7.6).
export const portfolioCards: PortfolioCardData[] = [
  // --- Video editing projects (Req 7.4) ---
  {
    id: "video-premiere-teaser",
    category: "video",
    imagePlaceholder: "/images/portfolio-video-teaser.svg",
    description:
      "Short teaser edit for an independent film premiere: paced cuts, rhythm-matched music, and clean color grading to build anticipation ahead of the November 2026 release.",
    tags: ["Video Editing", "Teaser", "Color Grading"],
  },
  {
    id: "video-reel-highlight",
    category: "video",
    imagePlaceholder: "/images/portfolio-video-reel.svg",
    description:
      "Highlight reel assembled from event footage into a tight one-minute short, with motion titles and beat-synced transitions for social distribution.",
    tags: ["Video Editing", "Short Form", "Motion Graphics"],
  },

  // --- Social media management case studies (Req 7.4) ---
  {
    id: "social-brand-campaign",
    category: "social",
    imagePlaceholder: "/images/portfolio-social-campaign.svg",
    description:
      "Multi-week social media campaign spanning content calendar, on-brand visuals, and community engagement that lifted reach and follower growth for a local arts collective.",
    tags: ["Social Media", "Campaign", "Content Strategy"],
  },
  {
    id: "social-account-growth",
    category: "social",
    imagePlaceholder: "/images/portfolio-social-growth.svg",
    description:
      "Account growth case study: audience research, posting cadence, and analytics-driven iteration that grew engagement across Instagram and TikTok.",
    tags: ["Social Media", "Analytics", "Growth"],
  },

  // --- Written works (Req 7.4, 7.5) ---
  {
    id: "writing-hs-feature",
    category: "writing",
    imagePlaceholder: "/images/portfolio-writing-hs.svg",
    description:
      "Feature article published in Helsingin Sanomat exploring the intersection of youth theatre and contemporary storytelling, reported and written for a general readership.",
    tags: ["Writing", "Journalism", "Feature"],
    publication: "Helsingin Sanomat",
  },
  {
    id: "writing-parskeita-essay",
    category: "writing",
    imagePlaceholder: "/images/portfolio-writing-parskeita.svg",
    description:
      "Personal essay published in Pärskeitä reflecting on performance, craft, and creative life, written in a reflective first-person voice.",
    tags: ["Writing", "Essay"],
    publication: "Pärskeitä",
  },
];
