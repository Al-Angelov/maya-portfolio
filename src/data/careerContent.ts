// src/data/careerContent.ts — the runtime model for the Resume "Career/Business"
// tab, produced by the CMS mappers and consumed by ResumePage.
//
// Each dated entry (experience / education / volunteering) shares the same
// shape the tab renders: a headline, a subheading, a date range, an optional
// location, and an optional detail line whose label ("Description" or
// "Activities") is chosen by `detailKind`.

export interface CareerDatedEntry {
  /** Stable key for React lists (the Sanity `_id`). */
  id: string;
  /** Primary line, e.g. job title / school / volunteering role. */
  role: string;
  /** Secondary line, e.g. company / degree / organization. */
  organization: string;
  /** Human-readable date range, e.g. "Jun 2024 – Jul 2024". */
  period: string;
  /** Optional location (Experience only). */
  location?: string;
  /** Optional detail line text (description / activities). */
  detail?: string;
  /** Which localized label prefixes the detail line. */
  detailKind?: "description" | "activities";
}

/** The Skills & Languages block. */
export interface CareerSkills {
  /** e.g. "Main Skills Profile" (authored title; may be shown or not). */
  title: string;
  coreSkills: string[];
  spokenLanguages: string[];
}

/** The full Career/Business tab content for the active language. */
export interface CareerContent {
  experience: CareerDatedEntry[];
  education: CareerDatedEntry[];
  volunteering: CareerDatedEntry[];
  /** The first matching Skills & Languages document, or null when none. */
  skills: CareerSkills | null;
}
