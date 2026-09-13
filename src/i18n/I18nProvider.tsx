// I18nProvider: global language state with sessionStorage persistence (Req 4).
//
// Holds the active UI language in React state, initialized from
// sessionStorage["maija.lang"] and defaulting to EN when unset or invalid
// (Req 4.1). `setLanguage` validates the incoming code is a supported
// Language before applying it, updates state, and writes it back to
// sessionStorage (Req 4.4). `t(key)` resolves against the active language via
// the shared `translate` resolver (which applies the EN fallback, Req 4.6).

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { translate } from "./translate";
import { translations } from "./translations";
import type { Language, TranslationKey } from "./types";

/** sessionStorage key under which the active language is persisted (Req 4.1). */
export const LANGUAGE_STORAGE_KEY = "maija.lang";

/** The default language used when storage is unset or holds an invalid value. */
const DEFAULT_LANGUAGE: Language = "EN";

/**
 * The value exposed by the i18n context: the active language, a setter that
 * validates and persists, and a translation resolver bound to the active
 * language.
 */
export interface I18nContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

/** Type guard: true only for the supported language codes "EN" and "FI". */
function isLanguage(value: unknown): value is Language {
  return value === "EN" || value === "FI";
}

/**
 * Read the initial language from sessionStorage, defaulting to EN when the
 * key is unset or holds an unrecognized value (Req 4.1). Guarded so it is
 * safe in non-browser environments (e.g. SSR/tests without a DOM).
 */
function readInitialLanguage(): Language {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return DEFAULT_LANGUAGE;
  }

  const stored = window.sessionStorage.getItem(LANGUAGE_STORAGE_KEY);
  return isLanguage(stored) ? stored : DEFAULT_LANGUAGE;
}

export interface I18nProviderProps {
  children: ReactNode;
}

/**
 * Provides the i18n context to the app subtree. Initializes the active
 * language from sessionStorage and keeps storage in sync on every valid
 * language change.
 */
export function I18nProvider({ children }: I18nProviderProps) {
  const [language, setLanguageState] = useState<Language>(readInitialLanguage);

  const setLanguage = useCallback((lang: Language) => {
    // Validate before applying so invalid codes are ignored (Req 4.4).
    if (!isLanguage(lang)) {
      return;
    }

    setLanguageState(lang);

    if (typeof window !== "undefined" && window.sessionStorage) {
      window.sessionStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    }
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage,
      t: (key: TranslationKey) => translate(translations, language, key),
    }),
    [language, setLanguage]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/**
 * Access the i18n context. Throws when used outside an `I18nProvider` so the
 * missing-provider mistake surfaces immediately during development.
 */
export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
