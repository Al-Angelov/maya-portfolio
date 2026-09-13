// LanguageToggle: a two-option segmented control for switching the interface
// language between English and Finnish (Req 3.6, 4.2, 4.3). Rendered inside the
// TopBar.
//
// Exposes exactly two selectable values labeled "EN" and "FI", implemented as a
// `role="radiogroup"` containing two `role="radio"` buttons. The option matching
// the active language is marked `aria-checked="true"` (the other
// `aria-checked="false"`) and styled as active (Req 4.2). Selecting an option
// calls `setLanguage(code)` from the i18n context, which updates state and
// persists the preference to sessionStorage (Req 4.3, 4.4).

import { useI18n } from "../i18n/I18nProvider";
import type { Language } from "../i18n/types";

/** The two selectable language options, in display order (Req 3.6, 4.2). */
const OPTIONS: readonly Language[] = ["EN", "FI"] as const;

/**
 * Render the language segmented control. Reads the active `language` and the
 * `setLanguage` setter from the i18n context; holds no state of its own.
 */
export function LanguageToggle() {
  const { language, setLanguage } = useI18n();

  const baseClasses =
    "rounded-full px-3 py-1 text-sm text-primaryDark transition-opacity";
  const activeClasses = "bg-warmIvory";
  const inactiveClasses = "bg-transparent opacity-70 hover:opacity-100";

  return (
    <div role="radiogroup" aria-label="Language" className="flex gap-1">
      {OPTIONS.map((code) => {
        const isActive = language === code;
        return (
          <button
            key={code}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => setLanguage(code)}
            className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
          >
            {code}
          </button>
        );
      })}
    </div>
  );
}

export default LanguageToggle;
