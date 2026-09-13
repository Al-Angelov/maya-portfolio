// Feature: maija-portfolio, Property 2: Missing FI translation falls back to EN.
//
// This file hosts the property test for the pure translation resolver in
// `src/i18n/translate.ts`. It exercises the EN-fallback behaviour (Req 4.6):
// when FI is the active language, a present, non-empty FI value wins; an
// omitted or empty-string FI key falls back to the EN value; and a key with no
// EN entry resolves to the key itself.

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { translate } from "../src/i18n/translate";
import type {
  LanguageDictionary,
  TranslationResource,
} from "../src/i18n/types";

// ---------------------------------------------------------------------------
// Generators
// ---------------------------------------------------------------------------

/**
 * A translation key drawn from a bounded pool so that, across a generated
 * resource, the same key space is shared by the EN and FI dictionaries and the
 * omit/present/empty variations all land on overlapping keys.
 */
const keyArb: fc.Arbitrary<string> = fc.constantFrom(
  "nav.info",
  "nav.resume",
  "nav.portfolio",
  "nav.blog",
  "nav.contact",
  "info.intro",
  "resume.performer",
  "portfolio.title",
  "blog.title",
  "contact.label.name",
  "footer.copyright",
);

/** A non-empty EN value (EN is authoritative and complete, Req 4.5). */
const enValueArb: fc.Arbitrary<string> = fc.string({ minLength: 1 });

/**
 * How a given key is represented in the FI dictionary:
 * - "omit": the key is absent from FI entirely.
 * - "empty": the key is present but maps to the empty string.
 * - "present": the key is present with a non-empty FI value.
 */
type FiKind = "omit" | "empty" | "present";
const fiKindArb: fc.Arbitrary<FiKind> = fc.constantFrom(
  "omit",
  "empty",
  "present",
);

/** A non-empty FI value (used when a key is "present" in FI). */
const fiValueArb: fc.Arbitrary<string> = fc.string({ minLength: 1 });

/**
 * A generated scenario: a set of keys, a complete EN dictionary over those
 * keys, and an FI dictionary that omits some keys, leaves some empty, and
 * fills others with a non-empty value. We track the intended FI kind and value
 * per key so the property can assert the exact fallback outcome.
 */
interface Scenario {
  resource: TranslationResource;
  /** Per-key: the FI treatment and (for "present") the FI value. */
  fiPlan: Record<string, { kind: FiKind; value?: string }>;
  /** The EN value authored for each key. */
  enPlan: Record<string, string>;
}

const scenarioArb: fc.Arbitrary<Scenario> = fc
  .uniqueArray(keyArb, { minLength: 1, maxLength: 11 })
  .chain((keys) =>
    fc
      .record({
        enValues: fc.array(enValueArb, {
          minLength: keys.length,
          maxLength: keys.length,
        }),
        fiKinds: fc.array(fiKindArb, {
          minLength: keys.length,
          maxLength: keys.length,
        }),
        fiValues: fc.array(fiValueArb, {
          minLength: keys.length,
          maxLength: keys.length,
        }),
      })
      .map(({ enValues, fiKinds, fiValues }) => {
        const EN: LanguageDictionary = {};
        const FI: Partial<LanguageDictionary> = {};
        const fiPlan: Scenario["fiPlan"] = {};
        const enPlan: Scenario["enPlan"] = {};

        keys.forEach((key, i) => {
          EN[key] = enValues[i];
          enPlan[key] = enValues[i];

          const kind = fiKinds[i];
          if (kind === "empty") {
            FI[key] = "";
            fiPlan[key] = { kind };
          } else if (kind === "present") {
            FI[key] = fiValues[i];
            fiPlan[key] = { kind, value: fiValues[i] };
          } else {
            // "omit": leave the key out of FI entirely.
            fiPlan[key] = { kind };
          }
        });

        return { resource: { EN, FI }, fiPlan, enPlan };
      }),
  );

// A key that is guaranteed absent from EN (and FI), to exercise the
// key-itself fallback when EN is missing.
const absentKeyArb: fc.Arbitrary<string> = fc.constantFrom(
  "does.not.exist",
  "missing.key",
  "unmapped.entry",
);

// ---------------------------------------------------------------------------
// Property 2 (Validates: Requirements 4.6)
// ---------------------------------------------------------------------------

describe("Property 2: Missing FI translation falls back to EN (Req 4.6)", () => {
  it("translate(resource, 'FI', key) returns the FI value when present and non-empty, otherwise the EN value", () => {
    fc.assert(
      fc.property(scenarioArb, (scenario) => {
        const { resource, fiPlan, enPlan } = scenario;

        for (const key of Object.keys(enPlan)) {
          const result = translate(resource, "FI", key);
          const plan = fiPlan[key];

          if (plan.kind === "present") {
            // A present, non-empty FI value is used verbatim.
            expect(result).toBe(plan.value);
          } else {
            // Omitted or empty FI value falls back to the EN value.
            expect(result).toBe(enPlan[key]);
          }
        }
      }),
      { numRuns: 200 },
    );
  });

  it("translate(resource, 'FI', key) returns the key itself when EN is also missing", () => {
    fc.assert(
      fc.property(scenarioArb, absentKeyArb, (scenario, absentKey) => {
        const { resource } = scenario;

        // Guard: the absent key must not collide with any generated key.
        fc.pre(resource.EN[absentKey] === undefined);
        fc.pre(resource.FI[absentKey] === undefined);

        // With no EN (or FI) entry, the resolver returns the key itself.
        expect(translate(resource, "FI", absentKey)).toBe(absentKey);
      }),
      { numRuns: 100 },
    );
  });
});
