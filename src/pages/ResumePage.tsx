// ResumePage — resume/timeline page (Req 6, 12.1, 12.3–12.5). Rendered at
// "/resume".
//
// Editorial layout (Req 6.1–6.5): a Sweet_Pink full-bleed section frames the
// performer content. The "As a Performer" introduction sits in a spacious
// Warm_Ivory editorial panel, and two text-style tabs — "Performer" (active by
// default) and "Career/Business" — switch the content. Selecting
// Career/Business swaps in a heading plus a "not yet available" message.
//
// CMS-driven timeline states (Req 12.1, 12.3–12.5): the timeline categories are
// obtained via `useCmsResource('timeline')`. While the Performer tab is active:
//   - status === "loading": a loading indicator is shown in the timeline region.
//   - status === "error": a friendly (non-raw) error indication is shown; the
//     retained/last-good categories are rendered when present, otherwise an
//     empty-timeline fallback. Raw API error strings are NEVER shown.
//   - status === "success": the mapped TimelineCategory[] is passed to Timeline.
// All display strings flow through the i18n `t()` resolver (Req 4.5, 4.6).

import { useState } from "react";

import Timeline from "../components/Timeline";
import { useCmsResource } from "../cms/useCmsResource";
import { useI18n } from "../i18n/I18nProvider";
import type { CareerDatedEntry } from "../data/careerContent";

/** Static image (served from public/images at the site root). */
const PERFORMER_IMAGE = "/images/resume-performer.jpg";

/** Which resume tab is currently active (Req 6.4). */
type ResumeTab = "performer" | "career";

/** Text-style editorial tab; active tab is emphasized with weight + underline. */
function tabClasses(active: boolean): string {
  const base =
    "pb-2 text-sm uppercase tracking-[0.18em] text-primaryDark transition-all duration-200 underline-offset-8";
  return active
    ? `${base} font-semibold underline decoration-2`
    : `${base} font-normal no-underline opacity-50 hover:opacity-100`;
}

/**
 * An editorial CV section: a large serif title, a hairline divider, and its
 * children. Rendered on a Warm_Ivory card by the Career panel.
 */
function CareerSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-6 border-b border-primaryDark/20 pb-3 font-serif text-2xl tracking-tight md:text-3xl">
        {title}
      </h3>
      {children}
    </section>
  );
}

/** A single dated CV entry (experience / education / volunteering). */
function CareerEntryRow({
  entry,
  detailLabelFor,
}: {
  entry: CareerDatedEntry;
  detailLabelFor: (kind: "description" | "activities") => string;
}) {
  return (
    <div className="py-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-lg font-semibold text-primaryDark md:text-xl">
          {entry.role}
          <span className="font-normal text-primaryDark/60">
            {" "}
            · {entry.organization}
          </span>
        </p>
        <p className="text-sm italic text-primaryDark/60">
          {entry.period}
          {entry.location ? ` · ${entry.location}` : ""}
        </p>
      </div>
      {entry.detail ? (
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-primaryDark/80">
          <span className="font-semibold">
            {detailLabelFor(entry.detailKind ?? "description")}:
          </span>{" "}
          {entry.detail}
        </p>
      ) : null}
    </div>
  );
}

/** A minimal, clean tag "pill". */
function Pill({ label }: { label: string }) {
  return (
    <li className="border border-primaryDark/30 px-3 py-1 text-xs uppercase tracking-[0.1em] text-primaryDark/80">
      {label}
    </li>
  );
}

export default function ResumePage() {
  const { t, language } = useI18n();
  const [activeTab, setActiveTab] = useState<ResumeTab>("performer");
  // Filter timeline entries by the active language (EN shows EN, FI shows FI).
  const { status, data } = useCmsResource("timeline", language);
  // Career/Business tab content, also filtered by the active language.
  const career = useCmsResource("career", language);

  const performerActive = activeTab === "performer";
  const careerActive = activeTab === "career";

  // Only treat a genuine error with no retained data as a "problem" worth
  // surfacing; even then we show friendly copy, never a raw API error string.
  const showTimelineError = status === "error";
  const hasRetained = Boolean(data && data.length > 0);

  // The Career/Business content to render — retained across a failed refetch
  // (so a transient error never blanks the tab).
  const careerData = career.data;

  // Localized label prefix for a career entry's detail line.
  const detailLabelFor = (kind: "description" | "activities"): string =>
    kind === "activities"
      ? t("resume.career.label.activities")
      : t("resume.career.label.description");

  return (
    // Sweet_Pink full-bleed editorial section (Req 6.1).
    <section
      aria-labelledby="resume-heading"
      className="min-h-screen bg-sweetPink px-6 py-16 text-primaryDark md:px-12 lg:px-20"
    >
      <div className="mx-auto max-w-5xl">
        <p className="eyebrow mb-4 text-primaryDark/60">{t("nav.resume")}</p>
        <h1
          id="resume-heading"
          className="mb-12 text-4xl font-normal tracking-tight md:text-6xl"
        >
          {t("resume.tab.performer")}
        </h1>

        {/* Text-style tabs: Performer (default active) + Career/Business (Req 6.4). */}
        <div
          role="tablist"
          aria-label={t("nav.resume")}
          className="mb-12 flex gap-8 border-b border-primaryDark/20"
        >
          <button
            type="button"
            role="tab"
            id="resume-tab-performer"
            aria-selected={performerActive}
            aria-controls="resume-panel-performer"
            onClick={() => setActiveTab("performer")}
            className={tabClasses(performerActive)}
          >
            {t("resume.tab.performer")}
          </button>
          <button
            type="button"
            role="tab"
            id="resume-tab-career"
            aria-selected={careerActive}
            aria-controls="resume-panel-career"
            onClick={() => setActiveTab("career")}
            className={tabClasses(careerActive)}
          >
            {t("resume.tab.career")}
          </button>
        </div>

        {/* Performer panel (Req 6.2, 6.3, 6.9 + CMS states Req 12.3–12.5). */}
        {performerActive ? (
          <div
            role="tabpanel"
            id="resume-panel-performer"
            aria-labelledby="resume-tab-performer"
          >
            {/* "As a Performer" intro: a Warm_Ivory editorial panel pairing the
                performer portrait with the intro copy in a clean side-by-side
                layout (Req 6.2, 6.3). The portrait uses soft rounded corners
                and a subtle ring/shadow for a curated editorial feel. */}
            <div className="mb-12 grid grid-cols-1 items-center gap-10 bg-warmIvory p-8 text-primaryDark md:grid-cols-[minmax(0,18rem)_1fr] md:p-12">
              <img
                src={PERFORMER_IMAGE}
                alt="Maija performing"
                loading="lazy"
                className="aspect-[3/4] w-full rounded-2xl object-cover shadow-md ring-1 ring-primaryDark/10"
              />
              <p className="max-w-2xl whitespace-pre-line text-lg leading-relaxed md:text-xl">
                {t("resume.performer.intro")}
              </p>
            </div>

            {/* Timeline region: loading / error / success states (Req 12.3–12.5). */}
            <div aria-live="polite">
              {status === "loading" ? (
                <p role="status" className="bg-warmIvory p-8 text-primaryDark">
                  Loading…
                </p>
              ) : null}

              {showTimelineError ? (
                <>
                  {/* Friendly, non-raw error message (never the API error text). */}
                  <p
                    role="alert"
                    className="mb-6 bg-warmIvory p-6 text-primaryDark"
                  >
                    Timeline content is temporarily unavailable.
                  </p>
                  {hasRetained ? (
                    // Retain and render the last-good categories (Req 12.5).
                    <Timeline categories={data ?? []} />
                  ) : (
                    // Empty-timeline fallback when nothing was previously loaded.
                    <p className="bg-warmIvory p-8 text-primaryDark">
                      No timeline entries are currently available.
                    </p>
                  )}
                </>
              ) : null}

              {status === "success" ? (
                <Timeline categories={data ?? []} />
              ) : null}
            </div>
          </div>
        ) : null}

        {/* Career/Business panel: CMS-driven editorial CV content (Req 6.5).
            Experience, Education, Volunteering, and Skills & Languages are
            fetched from Sanity (filtered by the active language) and each sit on
            a spacious Warm_Ivory card with serif section titles. */}
        {careerActive ? (
          <div
            role="tabpanel"
            id="resume-panel-career"
            aria-labelledby="resume-tab-career"
            aria-live="polite"
            className="flex flex-col gap-8"
          >
            {career.status === "loading" && !career.data ? (
              <p role="status" className="bg-warmIvory p-8 text-primaryDark">
                Loading…
              </p>
            ) : null}

            {career.status === "error" && !career.data ? (
              <p role="alert" className="bg-warmIvory p-8 text-primaryDark">
                Career content is temporarily unavailable.
              </p>
            ) : null}

            {careerData ? (
              <>
                {/* A. Experience */}
                {careerData.experience.length > 0 ? (
                  <div className="bg-warmIvory p-8 text-primaryDark md:p-12">
                    <CareerSection title={t("resume.career.section.experience")}>
                      <div className="flex flex-col divide-y divide-primaryDark/10">
                        {careerData.experience.map((entry) => (
                          <CareerEntryRow
                            key={entry.id}
                            entry={entry}
                            detailLabelFor={detailLabelFor}
                          />
                        ))}
                      </div>
                    </CareerSection>
                  </div>
                ) : null}

                {/* B. Education */}
                {careerData.education.length > 0 ? (
                  <div className="bg-warmIvory p-8 text-primaryDark md:p-12">
                    <CareerSection title={t("resume.career.section.education")}>
                      <div className="flex flex-col divide-y divide-primaryDark/10">
                        {careerData.education.map((entry) => (
                          <CareerEntryRow
                            key={entry.id}
                            entry={entry}
                            detailLabelFor={detailLabelFor}
                          />
                        ))}
                      </div>
                    </CareerSection>
                  </div>
                ) : null}

                {/* C. Volunteering */}
                {careerData.volunteering.length > 0 ? (
                  <div className="bg-warmIvory p-8 text-primaryDark md:p-12">
                    <CareerSection title={t("resume.career.section.volunteering")}>
                      <div className="flex flex-col divide-y divide-primaryDark/10">
                        {careerData.volunteering.map((entry) => (
                          <CareerEntryRow
                            key={entry.id}
                            entry={entry}
                            detailLabelFor={detailLabelFor}
                          />
                        ))}
                      </div>
                    </CareerSection>
                  </div>
                ) : null}

                {/* D. Skills & Languages */}
                {careerData.skills ? (
                  <div className="bg-warmIvory p-8 text-primaryDark md:p-12">
                    <CareerSection title={t("resume.career.section.skills")}>
                      <div className="flex flex-col gap-6">
                        {careerData.skills.coreSkills.length > 0 ? (
                          <div>
                            <p className="eyebrow mb-3 text-primaryDark/60">
                              {t("resume.career.label.coreSkills")}
                            </p>
                            <ul className="flex flex-wrap gap-2">
                              {careerData.skills.coreSkills.map((skill) => (
                                <Pill key={skill} label={skill} />
                              ))}
                            </ul>
                          </div>
                        ) : null}
                        {careerData.skills.spokenLanguages.length > 0 ? (
                          <div>
                            <p className="eyebrow mb-3 text-primaryDark/60">
                              {t("resume.career.label.languages")}
                            </p>
                            <ul className="flex flex-wrap gap-2">
                              {careerData.skills.spokenLanguages.map((lang) => (
                                <Pill key={lang} label={lang} />
                              ))}
                            </ul>
                          </div>
                        ) : null}
                      </div>
                    </CareerSection>
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
