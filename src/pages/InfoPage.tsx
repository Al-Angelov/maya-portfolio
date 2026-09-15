// Feature: maija-portfolio
//
// InfoPage — landing page (Req 5). Rendered as the index route ("/") so opening
// the site at its root shows this page (Req 1.5).
//
// Sticky-portrait editorial layout (minimalist, modern):
// - A centered, contained two-column grid (max-w-6xl) with generous gap so the
//   portrait and text never feel cramped. The LEFT column is Maija's portrait
//   (info-hero.jpg) on a rounded, softly-bordered panel that is `sticky top-8`
//   with a bounded height, so it locks in view — fully visible, never cut off —
//   as the content scrolls, reading like a curated magazine portrait (Req 5.5).
// - The RIGHT column is a scrollable content layer on the warm dark theme: a
//   role kicker, a bold serif statement headline, Maija's name (Req 5.3), the
//   introduction narrative with a classic drop-cap (Req 5.3, 5.4), and a single
//   "Contact Me" button with the LinkedIn icon inline beside it.
// - On mobile the portrait becomes a banner above the content.
// - Atmospheric top layer: a decorative nature background (info-bg.jpg) is
//   painted only across the TOP portion of the page — from behind the nav down
//   to behind roughly the top third of the portrait. It is heavily dimmed by a
//   dark scrim and fades out via a gradient mask so it dissolves completely into
//   the solid Primary_Dark before the middle of the page. The content sits above
//   it (z-10), so the portrait reads as layered over the fade and the right-hand
//   text column always rests on a pure, readable dark background.
//
// There is intentionally exactly ONE portrait frame and ONE bio narrative.

import { Link } from "react-router-dom";

import { useI18n } from "../i18n/I18nProvider";
import { LINKEDIN_URL } from "../config/site";

/** Static portrait image (served from public/images at the site root). */
const HERO_IMAGE = "/images/info-hero.jpg";

/**
 * Decorative nature background painted across the top of the page. Served from
 * public/images at the site root.
 */
const TOP_NATURE_IMAGE = "/images/info-bg.jpg";

/**
 * Gradient used both as the layer's opacity mask (via mask-image) and mirrored
 * on the scrim. The image is fully present at the very top and fades to nothing
 * before ~45% down the layer, so it never reaches the middle of the page.
 */
const TOP_FADE_MASK =
  "linear-gradient(to bottom, black 0%, black 18%, rgba(0,0,0,0.55) 34%, transparent 46%)";

/** Configuration for the Info_Page's external professional profile link. */
export interface InfoConfig {
  /** Maija's LinkedIn profile URL, or null when unavailable/unconfigured. */
  linkedInUrl: string | null;
}

/**
 * Info page configuration, sourced from the centralized site config so the
 * profile handle lives in one place (src/config/site.ts). When the URL is a
 * non-empty string the icon is clickable and opens in a new tab (Req 5.7);
 * a `null` value renders the icon in the non-clickable state (Req 5.8).
 */
export const infoConfig: InfoConfig = {
  linkedInUrl: LINKEDIN_URL,
};

/** Inline LinkedIn "in" glyph so the icon needs no external asset. */
function LinkedInGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.44-2.13 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0z" />
    </svg>
  );
}

/**
 * The LinkedIn icon shown inline beside the "Contact Me" button. Clickable
 * (opens in a new tab) when the URL is configured (Req 5.7); a non-navigating
 * disabled state otherwise (Req 5.8).
 */
function LinkedInIcon({ url, label }: { url: string | null; label: string }) {
  const hasUrl = typeof url === "string" && url.trim().length > 0;

  // A tidy square target so the icon visually balances the adjacent button.
  const iconBox =
    "inline-flex h-12 w-12 items-center justify-center rounded-md border border-sweetPink/60 transition-colors duration-200";

  if (hasUrl) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        title={label}
        className={`${iconBox} text-warmIvory/80 hover:bg-sweetPink hover:text-primaryDark`}
      >
        <LinkedInGlyph />
      </a>
    );
  }

  return (
    <span
      role="link"
      aria-disabled="true"
      aria-label={label}
      className={`${iconBox} cursor-not-allowed text-warmIvory/40`}
    >
      <LinkedInGlyph />
    </span>
  );
}

export default function InfoPage() {
  const { t } = useI18n();

  return (
    <section
      aria-labelledby="info-heading"
      className="relative overflow-hidden bg-primaryDark text-warmIvory"
    >
      {/* -------------------------------------------------------------
          Atmospheric top nature layer (decorative, not an <img>). Spans the
          full width from behind the nav down across the top ~55% of the hero.
          Its own gradient mask fades the whole layer out before the middle so
          it dissolves seamlessly into the solid Primary_Dark below; a heavy
          dark scrim keeps the imagery dim and non-distracting. Sits at the base
          of the stacking context (below the z-10 content grid).
          ------------------------------------------------------------- */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[55%] bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${TOP_NATURE_IMAGE})`,
          maskImage: TOP_FADE_MASK,
          WebkitMaskImage: TOP_FADE_MASK,
        }}
      >
        {/* Dark scrim over the nature image, itself masked with the same fade
            so the dimmed imagery and the overlay disappear together. */}
        <div
          className="absolute inset-0 bg-black/70"
          style={{ maskImage: TOP_FADE_MASK, WebkitMaskImage: TOP_FADE_MASK }}
        />
      </div>

      <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 items-start gap-12 px-6 py-12 md:grid-cols-2 md:gap-16 md:py-20 lg:gap-20">
        {/* -------------------------------------------------------------
            LEFT: the sticky, curated portrait. On desktop it locks in view
            (`sticky top-8`) with a bounded height so it stays fully visible as
            the right column scrolls — never cut off. Rendered as a cover
            background (not an <img>) on a rounded, softly-bordered panel so it
            reads like a magazine portrait rather than a heavy block. On mobile
            it is a normal banner above the content.
            ------------------------------------------------------------- */}
        <div
          data-testid="photo-frame"
          data-hero="banner"
          className="aspect-[4/5] w-full overflow-hidden rounded-2xl border border-warmIvory/15 bg-primaryDark bg-cover bg-no-repeat shadow-2xl ring-1 ring-black/20 [background-position:center_18%] md:sticky md:top-8 md:aspect-auto md:h-[calc(100vh-4rem)]"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        />

        {/* -------------------------------------------------------------
            RIGHT: the scrollable content layer on the clean dark theme.
            ------------------------------------------------------------- */}
        <div className="flex flex-col justify-center py-8 md:min-h-[calc(100vh-4rem)] md:py-16">
          <p className="eyebrow mb-6 text-warmIvory/70">{t("info.role")}</p>

          <p className="statement-headline text-5xl text-warmIvory md:text-8xl">
            {t("info.statement")}
          </p>

          <h1 id="info-heading" className="display-name mt-6 text-warmIvory/90">
            {t("info.name")}
          </h1>

          <p className="drop-cap mt-12 max-w-xl whitespace-pre-line text-lg leading-relaxed text-warmIvory/85 md:text-xl">
            {t("info.intro")}
          </p>

          {/* An elegant "Contact Me" button with the LinkedIn icon inline. */}
          <div className="mt-12 flex items-center gap-4">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-md border border-sweetPink bg-transparent px-10 py-4 font-serif text-base uppercase tracking-[0.18em] text-warmIvory transition-colors duration-200 hover:bg-sweetPink hover:text-primaryDark"
            >
              {t("info.cta")}
            </Link>

            <LinkedInIcon
              url={infoConfig.linkedInUrl}
              label={t("info.linkedin.label")}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
