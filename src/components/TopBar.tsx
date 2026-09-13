// TopBar: the persistent site navigation rendered on every page by the
// AppShell (Req 3.1). Renders exactly five NavLinks in the required order —
// Info, Resume, Portfolio, On My Mind, Contact me (Req 3.4) — with labels
// resolved from the active language via the i18n `t` resolver (Req 11.1), plus
// the LanguageToggle segmented control (Req 3.6).
//
// Presentation (Req 3.2, 3.3):
//  - Sticky at the top of the viewport (`sticky top-0`) with a high stacking
//    order (`z-50`) so it stays above scrolled page content.
//  - Sweet_Pink background with Primary_Dark text.
//
// Active state (Req 3.5): react-router's NavLink automatically applies
// `aria-current="page"` to the link matching the current route; the `className`
// function layers additional active styling on top.
//
// Responsive (Req 3.7): links stack in a single column at viewports ≤767px
// (`flex-col`) and lay out in a row from the `md` breakpoint (768px) upward
// (`md:flex-row`).

import { NavLink } from "react-router-dom";

import type { TranslationKey } from "../i18n/types";
import { useI18n } from "../i18n/I18nProvider";
import LanguageToggle from "./LanguageToggle";

/** A single navigation entry: its route path and its i18n label key. */
interface NavItem {
  path: string;
  labelKey: TranslationKey;
}

/**
 * The five navigation entries, in the Req 3.4 display order. Info is the index
 * route ("/"); `end` is applied to it so it only matches the exact root path.
 */
const NAV_ITEMS: readonly NavItem[] = [
  { path: "/", labelKey: "nav.info" },
  { path: "/resume", labelKey: "nav.resume" },
  { path: "/portfolio", labelKey: "nav.portfolio" },
  { path: "/on-my-mind", labelKey: "nav.blog" },
  { path: "/contact", labelKey: "nav.contact" },
] as const;

// Clean editorial text links: no pill outline. Uppercase, letter-spaced labels
// with a subtle underline + color emphasis marking the active route.
const baseLinkClasses =
  "px-1 py-1 text-xs uppercase tracking-[0.18em] text-primaryDark transition-all duration-200 underline-offset-[6px] decoration-1";
const activeLinkClasses = "font-semibold underline decoration-primaryDark";
const inactiveLinkClasses =
  "font-normal no-underline opacity-60 hover:opacity-100 hover:underline";

/**
 * The persistent top navigation bar. Reads the translation resolver from the
 * i18n context and renders the fixed set of navigation links plus the language
 * toggle; holds no state of its own.
 */
export function TopBar() {
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-50 bg-sweetPink text-primaryDark">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-4 md:flex-row md:justify-between">
        <nav aria-label="Primary">
          <ul className="flex flex-col items-center gap-4 md:flex-row md:gap-8">
            {NAV_ITEMS.map(({ path, labelKey }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  end={path === "/"}
                  className={({ isActive }) =>
                    `${baseLinkClasses} ${
                      isActive ? activeLinkClasses : inactiveLinkClasses
                    }`
                  }
                >
                  {t(labelKey)}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        {/* Right side: only the EN | FI language toggle (ultra-clean header). */}
        <LanguageToggle />
      </div>
    </header>
  );
}

export default TopBar;
