// Footer — the unified dark global footer (Y4 Works / HS style), rendered at
// the bottom of every page via the AppShell.
//
// Layout:
//   - Absolute-black (`bg-black`) surface with Warm_Ivory text, plus a crisp
//     1px top border (`border-t border-neutral-800`) that draws a sharp
//     architectural line separating the footer from the page body above it —
//     whether that body is Primary_Dark (Info/Portfolio) or Sweet_Pink. Ample
//     inner padding keeps the content clear of the hard top border.
//   - Top row (3 columns): minimalist branding + subline; quick text links to
//     every main page (muted, brighten on hover); a contact column with the
//     email address, location, and the LinkedIn + Email icons side by side.
//   - Bottom sub-footer: a thin divider, then centered legal + copyright text
//     (Privacy Policy link and the © notice).
//
// The only social profile linked is LinkedIn (Instagram remains removed); the
// Email icon opens the user's mail client. The email, location, and LinkedIn
// URL come from the centralized site config.
//
// Labels resolve through the i18n `t()` resolver (EN with FI fallback).

import { NavLink } from "react-router-dom";

import type { TranslationKey } from "../i18n/types";
import { useI18n } from "../i18n/I18nProvider";
import { CONTACT_EMAIL, CONTACT_LOCATION, LINKEDIN_URL } from "../config/site";

/** Quick-links: the five main pages, matching the TopBar order and labels. */
interface FooterNavItem {
  path: string;
  labelKey: TranslationKey;
}

const FOOTER_NAV_ITEMS: readonly FooterNavItem[] = [
  { path: "/", labelKey: "nav.info" },
  { path: "/resume", labelKey: "nav.resume" },
  { path: "/portfolio", labelKey: "nav.portfolio" },
  { path: "/on-my-mind", labelKey: "nav.blog" },
  { path: "/contact", labelKey: "nav.contact" },
] as const;

/** Shared style for the footer's LinkedIn + Email icon buttons. */
const ICON_BUTTON_CLASSES =
  "inline-flex h-10 w-10 items-center justify-center rounded-full border border-warmIvory/40 text-warmIvory transition-colors duration-200 hover:bg-warmIvory hover:text-primaryDark";

/** Inline LinkedIn "in" glyph. */
function LinkedInGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.44-2.13 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0z" />
    </svg>
  );
}

/** Inline Email (envelope) glyph. */
function EmailGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M2 5.5A1.5 1.5 0 0 1 3.5 4h17A1.5 1.5 0 0 1 22 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 18.5v-13zm2.02.5 7.98 5.32L19.98 6H4.02zM20 7.44l-7.55 5.03a.8.8 0 0 1-.9 0L4 7.44V18h16V7.44z" />
    </svg>
  );
}

/**
 * The dark global footer. Reads labels from the i18n context and the
 * social/contact destinations from the centralized site config; holds no state.
 */
export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-neutral-800 bg-black text-warmIvory">
      <div className="mx-auto max-w-6xl px-6 py-16 md:px-12">
        {/* Top row: branding · quick links · contact & socials. */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {/* Left: minimalist branding + subline. */}
          <div>
            <p className="font-serif text-3xl tracking-tight text-warmIvory">
              {t("info.name")}
            </p>
            <p className="mt-3 max-w-xs text-sm text-warmIvory/60">
              {t("footer.brand.subline")}
            </p>
          </div>

          {/* Center: quick text links to all main pages. */}
          <nav aria-label="Footer">
            <p className="eyebrow mb-4 text-warmIvory/50">
              {t("footer.links.heading")}
            </p>
            <ul className="flex flex-col gap-3">
              {FOOTER_NAV_ITEMS.map(({ path, labelKey }) => (
                <li key={path}>
                  <NavLink
                    to={path}
                    end={path === "/"}
                    className="text-sm text-warmIvory/60 transition-colors duration-200 hover:text-warmIvory"
                  >
                    {t(labelKey)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right: contact details + circular social icon buttons. */}
          <div>
            <p className="eyebrow mb-4 text-warmIvory/50">
              {t("footer.contact.heading")}
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="block text-sm text-warmIvory/80 transition-colors duration-200 hover:text-warmIvory"
            >
              {CONTACT_EMAIL}
            </a>
            <p className="mt-1 text-sm text-warmIvory/60">{CONTACT_LOCATION}</p>

            {/* LinkedIn + Email icons, sitting together neatly. */}
            <div className="mt-5 flex items-center gap-3">
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("footer.linkedin")}
                title={t("footer.linkedin")}
                className={ICON_BUTTON_CLASSES}
              >
                <LinkedInGlyph />
              </a>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                aria-label={t("footer.email")}
                title={t("footer.email")}
                className={ICON_BUTTON_CLASSES}
              >
                <EmailGlyph />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom sub-footer: divider + centered legal / copyright. */}
        <div className="mt-14 flex flex-col items-center gap-3 border-t border-neutral-800 pt-8 text-center text-xs text-warmIvory/50 sm:flex-row sm:justify-between">
          <a
            href="#"
            className="transition-colors duration-200 hover:text-warmIvory"
          >
            {t("footer.privacy")}
          </a>
          <p>{t("footer.copyright")}</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
