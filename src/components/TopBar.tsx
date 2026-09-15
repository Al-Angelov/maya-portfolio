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
// Responsive (Req 3.7): the header is a single flex container.
//  - From the `md` breakpoint (768px) up it lays out in a row — brand, the five
//    inline links, and the language toggle — and the hamburger is hidden.
//  - Below `md` the top row stays slim (brand + hamburger only) and the SAME
//    single nav + language toggle become a slide-down drawer that animates open
//    and closed. There is exactly one nav landmark and one set of links in the
//    DOM; only their layout and the collapse animation change with breakpoint,
//    so nothing is duplicated.

import { useCallback, useEffect, useId, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

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
// with a subtle underline + color emphasis marking the active route. Only the
// cheap paint properties (color/opacity/text-decoration) transition — avoiding
// `transition-all`, which would watch layout-affecting properties too.
const baseLinkClasses =
  "px-1 py-1 text-xs uppercase tracking-[0.18em] text-primaryDark transition-[color,opacity,text-decoration-color] duration-200 underline-offset-[6px] decoration-1";
const activeLinkClasses = "font-semibold underline decoration-primaryDark";
const inactiveLinkClasses =
  "font-normal no-underline opacity-60 hover:opacity-100 hover:underline";

/**
 * The persistent top navigation bar. Reads the translation resolver from the
 * i18n context and renders the fixed set of navigation links plus the language
 * toggle; owns only the mobile drawer's open/closed state.
 */
export function TopBar() {
  const { t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const drawerId = useId();

  // Collapse the mobile drawer whenever the route changes so tapping a link
  // returns the bar to its slim resting state.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Stable toggle handler. The only state this component owns is the drawer's
  // open/closed boolean, so toggling it re-renders TopBar alone — it never
  // touches the page layout or the InfoPage background layers.
  const toggleMenu = useCallback(() => setMenuOpen((open) => !open), []);

  return (
    <header className="sticky top-0 z-50 bg-sweetPink text-primaryDark">
      {/* One flex container, `relative` so the mobile drawer can anchor to its
          bottom edge (top-full) as an out-of-flow overlay. On mobile the slim
          bar is a single row (brand + hamburger); from md up it becomes the
          full inline row. */}
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-x-4 px-6 py-4">
        {/* Brand anchors the slim mobile bar and sits at the left on desktop. */}
        <NavLink
          to="/"
          end
          className="font-serif text-lg tracking-[0.2em] text-primaryDark no-underline"
        >
          MAIJA
        </NavLink>

        {/* Mobile (<md): hamburger toggle. Bars animate into a subtle "X". */}
        <button
          type="button"
          aria-label={menuOpen ? t("nav.menu.close") : t("nav.menu.open")}
          aria-expanded={menuOpen}
          aria-controls={drawerId}
          onClick={toggleMenu}
          className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-full text-primaryDark transition-opacity hover:opacity-70 md:hidden"
        >
          <span
            className={`block h-[1.5px] w-6 bg-primaryDark transition-transform duration-300 ${
              menuOpen ? "translate-y-[6.5px] rotate-45" : ""
            }`}
          />
          <span
            className={`block h-[1.5px] w-6 bg-primaryDark transition-opacity duration-300 ${
              menuOpen ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`block h-[1.5px] w-6 bg-primaryDark transition-transform duration-300 ${
              menuOpen ? "-translate-y-[6.5px] -rotate-45" : ""
            }`}
          />
        </button>

        {/* The one-and-only nav group.
            Mobile: an absolutely-positioned drawer BELOW the slim bar. Being
            out of the flex flow means opening it never reflows the header or
            the page beneath — the reveal is a pure GPU-composited animation of
            `transform` (translate-y) + `opacity`, with visibility toggled so
            the collapsed drawer isn't focusable. No `max-height`/`display`
            animation, so no per-frame layout.
            Desktop (md+): reverts to a static inline row alongside the brand —
            transform/visibility/positioning are all reset so it behaves exactly
            like a normal flex item. */}
        <div
          id={drawerId}
          className={`absolute inset-x-0 top-full origin-top transform-gpu bg-sweetPink transition-[transform,opacity] duration-200 ease-out will-change-[transform,opacity] md:static md:transform-none md:bg-transparent md:opacity-100 md:transition-none md:will-change-auto ${
            menuOpen
              ? "translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-2 opacity-0 md:pointer-events-auto md:translate-y-0"
          } ${menuOpen ? "visible" : "invisible md:visible"}`}
        >
          <div className="flex flex-col items-center gap-6 pb-6 pt-2 md:flex-row md:gap-8 md:py-0">
            <nav aria-label="Primary">
              <ul className="flex flex-col items-center gap-5 md:flex-row md:gap-8">
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
            <LanguageToggle />
          </div>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
