// i18n type definitions for the Maija Portfolio site.
// EN is the authoritative, complete dictionary; FI may be partial and falls
// back to EN at resolution time (Req 4.5, 4.6).

/**
 * Supported UI languages. EN is the primary language; FI is the prepared
 * secondary language exposed via the LanguageToggle.
 */
export type Language = "EN" | "FI";

/**
 * A translation key expressed as a dotted domain path, e.g. "nav.info",
 * "info.intro", or "contact.label.name". Keys are grouped by domain
 * (nav, info, resume, portfolio, blog, contact, footer) and flattened to
 * dotted strings.
 */
export type TranslationKey = string;

/**
 * A per-language dictionary mapping translation keys to their resolved
 * strings. The EN dictionary is complete; the FI dictionary may omit keys,
 * in which case the EN value is used as the fallback (Req 4.6).
 */
export type LanguageDictionary = Record<TranslationKey, string>;

/**
 * The full translation resource. EN is authoritative and complete; FI is
 * partial and added incrementally without touching component logic.
 */
export interface TranslationResource {
  /** Complete, authoritative English dictionary. */
  EN: LanguageDictionary;
  /** Partial Finnish dictionary; missing keys fall back to EN. */
  FI: Partial<LanguageDictionary>;
}
