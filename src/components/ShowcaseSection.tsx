// ShowcaseSection — the pre-footer "About" showcase block (Sointu Borg style).
//
// A spacious two-column band placed just above the global footer:
//   - Left: a large serif section header, 2–3 concise paragraphs on Maija's
//     core skills, a CTA question, and a high-contrast solid-black button that
//     navigates to the Contact page.
//   - Right: a vertical portrait frame with a subtle offset "drop-card" behind
//     it for an editorial layered effect.
//
// All copy resolves through the i18n `t()` resolver (EN with FI fallback). The
// component is reusable: the surface tone can be set to Warm_Ivory (default) or
// Sweet_Pink so it can front different pages.

import { Link } from "react-router-dom";

import PhotoFrame from "./PhotoFrame";
import { useI18n } from "../i18n/I18nProvider";

export interface ShowcaseSectionProps {
  /** Background surface tone. Defaults to Warm_Ivory. */
  tone?: "ivory" | "pink";
}

export default function ShowcaseSection({
  tone = "ivory",
}: ShowcaseSectionProps) {
  const { t } = useI18n();

  const surface = tone === "pink" ? "bg-sweetPink" : "bg-warmIvory";
  // The offset drop-card behind the portrait uses a contrasting accent so the
  // layering reads on either surface tone.
  const dropCard = tone === "pink" ? "bg-warmIvory" : "bg-sweetPink";

  return (
    <section
      aria-labelledby="showcase-heading"
      className={`${surface} text-primaryDark`}
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-16 md:grid-cols-2 md:gap-16 md:py-24 lg:px-12">
        {/* Left column: header, skills copy, and CTA. */}
        <div className="order-2 flex flex-col md:order-1">
          <h2
            id="showcase-heading"
            className="text-4xl font-normal tracking-tight md:text-5xl"
          >
            {t("showcase.heading")}
          </h2>

          <div className="mt-8 flex max-w-md flex-col gap-5 text-base leading-relaxed text-primaryDark/80">
            <p>{t("showcase.body.1")}</p>
            <p>{t("showcase.body.2")}</p>
          </div>

          <p className="mt-10 text-lg font-medium text-primaryDark">
            {t("showcase.cta.question")}
          </p>

          {/* High-contrast solid-black CTA → Contact page. */}
          <div className="mt-6">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center bg-primaryDark px-8 py-4 text-sm uppercase tracking-[0.2em] text-warmIvory transition-opacity duration-200 hover:opacity-90"
            >
              {t("showcase.cta.button")}
            </Link>
          </div>
        </div>

        {/* Right column: portrait with a layered offset drop-card behind it. */}
        <div className="order-1 md:order-2">
          <div className="relative mx-auto w-full max-w-sm md:max-w-md">
            {/* Offset accent rectangle creating the editorial drop-card effect. */}
            <div
              aria-hidden="true"
              className={`absolute inset-0 translate-x-4 translate-y-4 ${dropCard}`}
            />
            <div className="relative">
              <PhotoFrame alt="Portrait of Maija" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
