// src/studio/schemas/index.ts — the canonical Studio schema types array.
//
// Aggregates every document schema that backs the site's CMS content.
// Consumed by both the embedded Studio route (src/studio/StudioPage.tsx) and
// the standalone `sanity` CLI config (studio/sanity.config.ts).
import timelineEntry from "./timelineEntry";
import portfolioCard from "./portfolioCard";
import blogEntry from "./blogEntry";
import workExperience from "./workExperience";
import educationEntry from "./educationEntry";
import volunteeringEntry from "./volunteeringEntry";
import skillsAndLanguages from "./skillsAndLanguages";

export const schemaTypes = [
  timelineEntry,
  portfolioCard,
  blogEntry,
  workExperience,
  educationEntry,
  volunteeringEntry,
  skillsAndLanguages,
];
