// Translation resolver with EN fallback (Req 4.6).
//
// Pure function: resolves a translation key against the active language.
// When FI is active and a non-empty FI value exists, that value is returned;
// otherwise the EN value is used. If the EN value is also missing, the key
// itself is returned as a development-time safety net (never expected in
// production content).

import type { Language, TranslationKey, TranslationResource } from "./types";

/**
 * Resolve a translation key to its display string for the given language.
 *
 * Resolution rules (Req 4.6):
 * - When `language` is "FI" and `resource.FI[key]` is present and non-empty,
 *   return that FI value.
 * - Otherwise fall back to `resource.EN[key]`.
 * - If the EN value is missing, return the `key` itself.
 *
 * This function performs no I/O and does not mutate its inputs.
 *
 * @param resource The full translation resource (EN complete, FI partial).
 * @param language The currently active language.
 * @param key The dotted translation key to resolve.
 * @returns The resolved display string.
 */
export function translate(
  resource: TranslationResource,
  language: Language,
  key: TranslationKey
): string {
  if (language === "FI") {
    const fiValue = resource.FI[key];
    if (fiValue !== undefined && fiValue !== "") {
      return fiValue;
    }
  }

  const enValue = resource.EN[key];
  if (enValue !== undefined) {
    return enValue;
  }

  return key;
}
