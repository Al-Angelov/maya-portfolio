// src/data/career.ts — content for the Resume "Career/Business" tab.
//
// This is static, factual CV content (proper nouns, roles, dates) authored
// once here and consumed by ResumePage. Section titles and field labels are
// localized via i18n; the entry content below is presented as-is.

/** A dated CV entry (experience, education, or volunteering). */
export interface CareerEntry {
  /** Stable key for React lists. */
  id: string;
  /** Primary role / title, e.g. "Media Planner (Seasonal)". */
  role: string;
  /** Organization / institution. */
  organization: string;
  /** Human-readable date range, e.g. "Jun 2024 – Jul 2024". */
  period: string;
  /** Optional location, e.g. "Finland". */
  location?: string;
  /**
   * Optional detail line. `kind` selects which localized label prefixes it
   * ("Description" vs "Activities").
   */
  detail?: { kind: "description" | "activities"; text: string };
}

/** A. Experience (Työkokemus). */
export const experience: readonly CareerEntry[] = [
  {
    id: "liikenneturva-media-planner",
    role: "Media Planner (Seasonal)",
    organization: "Liikenneturva (Finnish Road Safety Council)",
    period: "Jun 2024 – Jul 2024",
    location: "Finland",
    detail: {
      kind: "description",
      text: "Planned virtual traffic safety lessons and created social media posts for Liikenneturva.",
    },
  },
] as const;

/** B. Education (Koulutus). */
export const education: readonly CareerEntry[] = [
  {
    id: "ressu-ib",
    role: "Ressu IB World School",
    organization: "Abitur",
    period: "2023 – 2026",
    detail: {
      kind: "activities",
      text: "Writer for the school magazine 'Pärskeitä' and Current Leader of The Coffee Club.",
    },
  },
] as const;

/** C. Volunteering (Vapaaehtoistyö). */
export const volunteering: readonly CareerEntry[] = [
  {
    id: "porssisaatio-ambassador",
    role: "Bourse Ambassador (Pörssilähettiläs)",
    organization: "Pörssisäätiö (Finnish Foundation for Share Promotion)",
    period: "Aug 2023",
    detail: {
      kind: "description",
      text: "Participated in the Bourse Ambassador course and held Bourse Ambassador presentations for ninth graders regarding economic empowerment.",
    },
  },
] as const;

/** D. Skills & Languages (Taidot ja Kielet). */
export const coreSkills: readonly string[] = [
  "Scriptwriting",
  "Communication",
  "Social Media",
  "Project Planning",
  "Outsourcing",
] as const;

export const languages: readonly string[] = [
  "Finnish (Native)",
  "English",
  "Swedish",
  "German",
] as const;
