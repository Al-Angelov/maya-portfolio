// src/cms/queries.ts — GROQ queries + pure Sanity-document → typed-model mappers
//
// Content is stored in Sanity as three document types whose field shapes mirror
// the typed models consumed by the app. The mappers below transform the raw
// Sanity documents into those typed models, performing NO I/O (Req 12.1).
import type { TimelineCategory, TimelineEntry } from "../data/timeline";
import type { PortfolioCardData, PortfolioCategory } from "../lib/filterCards";
import type { BlogEntry } from "../lib/sortBlog";
import type {
  CareerContent,
  CareerDatedEntry,
  CareerSkills,
} from "../data/careerContent";

// ---------------------------------------------------------------------------
// Sanity document shapes (as returned by GROQ). `_type`/`_id` are Sanity
// system fields.
// ---------------------------------------------------------------------------

/**
 * timelineEntry — the Studio document for a Resume timeline row. `title` is the
 * primary work-title field; `production` is a legacy alias still accepted for
 * back-compat. `category` may use the Studio label "Film & TV", which the
 * mapper normalizes to the frontend's canonical "TV & Film".
 */
export interface SanityTimelineEntry {
  _id: string;
  _type: "timelineEntry";
  /** Primary work title (preferred). */
  title?: string;
  /** Legacy alias for `title`. */
  production?: string;
  role: string;
  /** Venue or company. */
  venue: string;
  /** Year as authored — a number or a string like "2023 – 2026". */
  year: number | string;
  /** e.g. "November 2026" (Directing & Writing only). */
  premiere?: string;
  category:
    | "Theatre"
    | "TV & Film"
    | "Film & TV"
    | "Directing & Writing"
    | "Career/Business";
  /** Optional authoring language; EN treated as default. */
  language?: "EN" | "FI";
  /** Preserves the required within-category order (Req 6.6–6.8). */
  order?: number;
}

/**
 * portfolioCard — the Studio document for a Portfolio item. `mainImage` is an
 * uploaded image whose asset URL is resolved in GROQ (`mainImageUrl`); `image`
 * is a legacy plain-string path fallback. `category` is a free-form string.
 */
export interface SanityPortfolioCard {
  _id: string;
  _type: "portfolioCard";
  /** Optional work title. */
  title?: string;
  category: PortfolioCategory;
  /** Resolved URL of the uploaded `mainImage` asset (via GROQ). */
  mainImageUrl?: string | null;
  /** Legacy plain-string image path. */
  image?: string;
  /** Description text. */
  description: string;
  /** Tags used for filtering. */
  tags: string[];
  /** Optional external link to the published work. */
  externalLink?: string;
  /** Optional authoring language; EN treated as default. */
  language?: "EN" | "FI";
  /** Present for written works (Req 7.5). */
  publication?: "Helsingin Sanomat" | "Pärskeitä";
}

/** A single Portable Text block (as returned for `body`). */
export interface PortableTextBlock {
  _type: string;
  children?: { _type?: string; text?: string }[];
}

/**
 * blogEntry — the Studio document for an "On My Mind" post. `body` is Block
 * Content (Portable Text); it may also be a plain string for legacy/seed data.
 * The mapper flattens it to plain text.
 */
export interface SanityBlogEntry {
  _id: string;
  _type: "blogEntry";
  title: string;
  /** ISO date "YYYY-MM-DD". */
  publishedDate: string;
  body: string | PortableTextBlock[];
  /** Optional authoring language; EN treated as default. */
  language?: "EN" | "FI";
}

// --- Career/Business tab documents (Resume) ------------------------------

/** workExperience — one job in the Experience section. */
export interface SanityWorkExperience {
  _id: string;
  _type: "workExperience";
  jobTitle: string;
  company: string;
  dateRange: string;
  location?: string;
  description: string;
  language?: "EN" | "FI";
}

/** educationEntry — one school/programme in the Education section. */
export interface SanityEducationEntry {
  _id: string;
  _type: "educationEntry";
  school: string;
  degree: string;
  dateRange: string;
  activities?: string;
  language?: "EN" | "FI";
}

/** volunteeringEntry — one role in the Volunteering section. */
export interface SanityVolunteeringEntry {
  _id: string;
  _type: "volunteeringEntry";
  role: string;
  organization: string;
  dateRange: string;
  description: string;
  language?: "EN" | "FI";
}

/** skillsAndLanguages — the Skills & Languages section (one per language). */
export interface SanitySkillsAndLanguages {
  _id: string;
  _type: "skillsAndLanguages";
  title: string;
  coreSkills?: string[];
  spokenLanguages?: string[];
  language?: "EN" | "FI";
}

// ---------------------------------------------------------------------------
// GROQ queries
// ---------------------------------------------------------------------------
//
// Each query optionally filters by the active UI `language` (passed as the
// `$language` GROQ param). When a language is provided, ONLY documents whose
// `language` field equals it are returned, so the language toggle strictly
// filters CMS content (EN shows EN-only, FI shows FI-only). When no language
// is provided the filter clause is omitted and all documents are returned
// (used by tooling/tests that are language-agnostic).

/**
 * The GROQ clause that restricts a document set to the active language. Returns
 * an empty string when `withLanguage` is false so callers can build an
 * unfiltered query.
 */
function languageClause(withLanguage: boolean): string {
  return withLanguage ? " && language == $language" : "";
}

/**
 * timelineEntry documents, newest-first. Sorted by `year` descending in the
 * query so the timeline shows the most recent work first; the mapper preserves
 * this order. Optionally filtered by the active language.
 */
export function buildTimelineQuery(withLanguage = false): string {
  return `*[_type == "timelineEntry"${languageClause(withLanguage)}] | order(year desc){
  _id,
  _type,
  title,
  production,
  role,
  venue,
  year,
  premiere,
  category,
  language,
  order
}`;
}

/**
 * portfolioCard documents. The uploaded `mainImage` asset URL is resolved
 * inline as `mainImageUrl`; the legacy `image` string is also selected as a
 * fallback. Optionally filtered by the active language.
 */
export function buildPortfolioQuery(withLanguage = false): string {
  return `*[_type == "portfolioCard"${languageClause(withLanguage)}]{
  _id,
  _type,
  title,
  category,
  "mainImageUrl": mainImage.asset->url,
  image,
  description,
  tags,
  externalLink,
  language,
  publication
}`;
}

/**
 * blogEntry documents, newest-first by publication date. `body` is Portable
 * Text (returned as-is and flattened by `mapBlog`). Optionally filtered by the
 * active language.
 */
export function buildBlogQuery(withLanguage = false): string {
  return `*[_type == "blogEntry"${languageClause(withLanguage)}] | order(publishedDate desc){
  _id,
  _type,
  title,
  publishedDate,
  body,
  language
}`;
}

/**
 * The four Career/Business tab document types, fetched together in a single
 * round trip via one projected GROQ query. Each collection is optionally
 * filtered by the active language. Dated sections are ordered by `_createdAt`
 * descending so the newest entries lead.
 */
export function buildCareerQuery(withLanguage = false): string {
  const clause = languageClause(withLanguage);
  return `{
  "experience": *[_type == "workExperience"${clause}] | order(_createdAt desc){
    _id, _type, jobTitle, company, dateRange, location, description, language
  },
  "education": *[_type == "educationEntry"${clause}] | order(_createdAt desc){
    _id, _type, school, degree, dateRange, activities, language
  },
  "volunteering": *[_type == "volunteeringEntry"${clause}] | order(_createdAt desc){
    _id, _type, role, organization, dateRange, description, language
  },
  "skills": *[_type == "skillsAndLanguages"${clause}] | order(_createdAt desc){
    _id, _type, title, coreSkills, spokenLanguages, language
  }
}`;
}

/**
 * The raw shape returned by `buildCareerQuery` — the four document arrays. The
 * mapper (`mapCareer`) transforms this into the typed `CareerContent`.
 */
export interface SanityCareerResult {
  experience?: SanityWorkExperience[] | null;
  education?: SanityEducationEntry[] | null;
  volunteering?: SanityVolunteeringEntry[] | null;
  skills?: SanitySkillsAndLanguages[] | null;
}

/** Unfiltered, language-agnostic query constants (used by tooling/tests). */
export const timelineQuery = buildTimelineQuery(false);
export const portfolioQuery = buildPortfolioQuery(false);
export const blogQuery = buildBlogQuery(false);
export const careerQuery = buildCareerQuery(false);

// ---------------------------------------------------------------------------
// Pure mappers (no I/O)
// ---------------------------------------------------------------------------

/**
 * The fixed category order required by Req 6.9:
 * Theatre → TV & Film → Directing & Writing.
 */
const CATEGORY_ORDER: TimelineCategory["label"][] = [
  "Theatre",
  "TV & Film",
  "Directing & Writing",
];

/**
 * Group timeline documents under their `category` and produce the typed
 * `TimelineCategory[]`. Categories are emitted in the fixed order
 * Theatre → TV & Film → Directing & Writing (Req 6.9). Within each category,
 * entries are ordered by the `order` field ascending using a stable sort
 * (documents without an `order` value are treated as `0`); their relative
 * document order is preserved when `order` ties (Req 6.9). Pure: the input
 * array is not mutated.
 */
/**
 * Normalize a Studio category label to the frontend's canonical timeline label.
 * The Studio offers "Film & TV"; the frontend groups/labels it as "TV & Film".
 * Returns `null` for categories that are not part of the performer timeline
 * (e.g. "Career/Business", whose content is served by the static career tab).
 */
function canonicalTimelineLabel(
  category: SanityTimelineEntry["category"],
): TimelineCategory["label"] | null {
  switch (category) {
    case "Theatre":
      return "Theatre";
    case "TV & Film":
    case "Film & TV":
      return "TV & Film";
    case "Directing & Writing":
      return "Directing & Writing";
    default:
      // "Career/Business" and any unknown label are not shown in the timeline.
      return null;
  }
}

/**
 * Extract a comparable numeric year from a `year` value. Numbers pass through;
 * strings use the largest 4-digit year found (so a range like "2023 – 2026"
 * sorts by its most-recent year). Falls back to 0 when no year is present.
 */
function yearValue(year: number | string): number {
  if (typeof year === "number") return year;
  const matches = String(year).match(/\d{4}/g);
  if (!matches || matches.length === 0) return 0;
  return Math.max(...matches.map((m) => Number(m)));
}

export function mapTimeline(docs: SanityTimelineEntry[]): TimelineCategory[] {
  const groups = new Map<TimelineCategory["label"], SanityTimelineEntry[]>();
  for (const label of CATEGORY_ORDER) {
    groups.set(label, []);
  }
  for (const doc of docs) {
    const label = canonicalTimelineLabel(doc.category);
    if (label === null) continue;
    groups.get(label)!.push(doc);
  }

  const result: TimelineCategory[] = [];
  for (const label of CATEGORY_ORDER) {
    const bucket = groups.get(label)!;
    // Sort by year DESCENDING (newest first). Array.prototype.sort is stable
    // per the ECMAScript spec, so entries sharing a year retain their incoming
    // (query) order.
    const sorted = [...bucket].sort(
      (a, b) => yearValue(b.year) - yearValue(a.year),
    );
    const entries: TimelineEntry[] = sorted.map((doc) => {
      const entry: TimelineEntry = {
        role: doc.role,
        // Prefer the primary `title`; fall back to the legacy `production`.
        production: doc.title ?? doc.production ?? "",
        venue: doc.venue,
        year: doc.year,
      };
      if (doc.premiere !== undefined) entry.premiere = doc.premiere;
      if (doc.language !== undefined) entry.language = doc.language;
      return entry;
    });
    result.push({ label, entries });
  }
  return result;
}

/**
 * Map portfolioCard documents to `PortfolioCardData[]`, renaming
 * `image → imagePlaceholder` and passing through the remaining fields
 * (`_id → id`, category, description, tags, publication). Pure: the input array
 * is not mutated.
 */
export function mapPortfolio(docs: SanityPortfolioCard[]): PortfolioCardData[] {
  return docs.map((doc) => {
    // Prefer the uploaded image's resolved URL; fall back to the legacy path.
    const imagePlaceholder = doc.mainImageUrl ?? doc.image ?? "";
    const card: PortfolioCardData = {
      id: doc._id,
      category: doc.category,
      imagePlaceholder,
      description: doc.description,
      tags: doc.tags,
    };
    if (doc.title !== undefined) card.title = doc.title;
    if (doc.externalLink !== undefined) card.externalLink = doc.externalLink;
    if (doc.publication !== undefined) card.publication = doc.publication;
    return card;
  });
}

/**
 * Map blogEntry documents to `BlogEntry[]` — a field-for-field passthrough
 * (`_id → id`, title, publishedDate, body). Pure: the input array is not
 * mutated.
 */
/**
 * Flatten a `body` value into plain text. A plain string passes through
 * unchanged (legacy/seed data). Portable Text (an array of blocks) is reduced
 * to its concatenated span text, with blocks separated by blank lines so the
 * frontend's `whitespace-pre-line` rendering preserves paragraph breaks.
 */
export function portableTextToPlain(
  body: string | PortableTextBlock[],
): string {
  if (typeof body === "string") return body;
  if (!Array.isArray(body)) return "";
  return body
    .map((block) =>
      Array.isArray(block?.children)
        ? block.children.map((span) => span?.text ?? "").join("")
        : "",
    )
    .join("\n\n");
}

export function mapBlog(docs: SanityBlogEntry[]): BlogEntry[] {
  return docs.map((doc) => ({
    id: doc._id,
    title: doc.title,
    publishedDate: doc.publishedDate,
    body: portableTextToPlain(doc.body),
  }));
}

// ---------------------------------------------------------------------------
// Career/Business tab mapper
// ---------------------------------------------------------------------------

/**
 * Map the combined Career/Business query result into the typed `CareerContent`
 * consumed by ResumePage. Each dated section is mapped to the shared
 * `CareerDatedEntry` shape; the Skills & Languages block uses the first
 * matching document (there is normally one per language). Pure: no inputs are
 * mutated, and missing/empty arrays map to empty results.
 */
export function mapCareer(result: SanityCareerResult): CareerContent {
  const experience: CareerDatedEntry[] = (result.experience ?? []).map(
    (doc) => ({
      id: doc._id,
      role: doc.jobTitle,
      organization: doc.company,
      period: doc.dateRange,
      ...(doc.location !== undefined ? { location: doc.location } : {}),
      detail: doc.description,
      detailKind: "description" as const,
    }),
  );

  const education: CareerDatedEntry[] = (result.education ?? []).map((doc) => ({
    id: doc._id,
    role: doc.school,
    organization: doc.degree,
    period: doc.dateRange,
    ...(doc.activities !== undefined && doc.activities.length > 0
      ? { detail: doc.activities, detailKind: "activities" as const }
      : {}),
  }));

  const volunteering: CareerDatedEntry[] = (result.volunteering ?? []).map(
    (doc) => ({
      id: doc._id,
      role: doc.role,
      organization: doc.organization,
      period: doc.dateRange,
      detail: doc.description,
      detailKind: "description" as const,
    }),
  );

  const skillsDoc = (result.skills ?? [])[0];
  const skills: CareerSkills | null = skillsDoc
    ? {
        title: skillsDoc.title,
        coreSkills: skillsDoc.coreSkills ?? [],
        spokenLanguages: skillsDoc.spokenLanguages ?? [],
      }
    : null;

  return { experience, education, volunteering, skills };
}
