// Feature: maija-portfolio, Property 10: Empty or whitespace required fields
// are rejected.
//
// Design Property 10 (Validates: Requirements 9.7):
//   For any contact form values in which the Name, Email, or Message field is
//   empty or contains only whitespace, `validateContact` SHALL report each such
//   field as required/empty and SHALL mark the result as not valid.
//
// This suite exercises `validateContact` with fast-check across >= 100 runs,
// generating values in which at least one required field (name / email /
// message) is empty or whitespace-only. It asserts the result is invalid and
// that every blank required field carries an error.

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  validateContact,
  type ContactFormValues,
} from "../src/lib/validateContact";

/** Characters that render a required field "blank" once trimmed. */
const WHITESPACE_CHARS = [" ", "\t", "\n", "\r", "\f", "\v", "\u00a0"];

/**
 * Arbitrary producing strings that are empty or contain ONLY whitespace, using
 * a mix of spaces, tabs, and newlines (including the empty string).
 */
const whitespaceOnly: fc.Arbitrary<string> = fc
  .array(fc.constantFrom(...WHITESPACE_CHARS), { minLength: 0, maxLength: 10 })
  .map((chars) => chars.join(""));

/** True when a value is empty or whitespace-only (mirrors the blank check). */
function isBlank(value: string): boolean {
  return value.trim().length === 0;
}

/**
 * Arbitrary for a possibly-blank required field: sometimes whitespace-only /
 * empty, sometimes an arbitrary non-blank string. This lets us generate values
 * where any subset of the required fields is blank while still guaranteeing at
 * least one is blank (enforced via `.filter`).
 */
const maybeBlankField: fc.Arbitrary<string> = fc.oneof(
  whitespaceOnly,
  // A non-blank string: prepend a visible char so trimming can't empty it.
  fc.string().map((s) => `x${s}`),
);

const requiredFields = ["name", "email", "message"] as const;

describe("Property 10: empty/whitespace required fields are rejected (Req 9.7)", () => {
  it("marks the result invalid with an error for each blank required field", () => {
    fc.assert(
      fc.property(
        maybeBlankField, // name
        maybeBlankField, // email
        maybeBlankField, // message
        fc.string(), // phone (optional, unconstrained)
        (name, email, message, phone) => {
          const values: ContactFormValues = { name, email, message, phone };
          const result = validateContact(values);

          // Determine which required fields are actually blank.
          const blankFields = requiredFields.filter((field) =>
            isBlank(values[field]),
          );

          // The result must be invalid.
          expect(result.valid).toBe(false);

          // Every blank required field must carry an error message.
          for (const field of blankFields) {
            expect(result.errors[field]).toBeDefined();
            expect(typeof result.errors[field]).toBe("string");
            expect((result.errors[field] as string).length).toBeGreaterThan(0);
          }
        },
      ),
      { numRuns: 200 },
    );
  });

  it("always rejects when at least one required field is blank", () => {
    fc.assert(
      fc.property(
        maybeBlankField, // name
        maybeBlankField, // email
        maybeBlankField, // message
        fc.string(), // phone
        (name, email, message, phone) => {
          // Guarantee at least one required field is blank.
          fc.pre(
            isBlank(name) || isBlank(email) || isBlank(message),
          );

          const values: ContactFormValues = { name, email, message, phone };
          const result = validateContact(values);

          expect(result.valid).toBe(false);
        },
      ),
      { numRuns: 200 },
    );
  });
});

// Feature: maija-portfolio, Property 9: Invalid emails are rejected (Req 9.6)
//
// Requirement 9.6: an email address is valid only when it contains exactly one
// "@" with a non-empty local part before it and, after it, a non-empty domain
// containing at least one ".". Any address violating those rules is invalid.
//
// This property exercises `isValidEmail` and `validateContact` across many
// generated invalid emails:
//   - structured invalid forms (no "@", multiple "@", empty local part,
//     domain with no ".", empty domain), and
//   - arbitrary strings that fail `isValidEmail`.
// For every invalid email, `isValidEmail` must return false, and
// `validateContact` (given non-empty Name and Message) must report an `email`
// error and be `valid: false`.

import { isValidEmail } from "../src/lib/validateContact";

/** Arbitrary that yields strings which are NOT valid emails. */
const invalidEmailArb: fc.Arbitrary<string> = fc.oneof(
  // 1. Arbitrary strings, filtered down to the ones that are actually invalid.
  fc.string().filter((s) => !isValidEmail(s)),

  // 2. Strings with no "@" at all (built from a charset excluding "@").
  fc
    .stringOf(fc.constantFrom(..."abcdefghijklmnop.-_0123456789".split("")))
    .filter((s) => !s.includes("@")),

  // 3. Multiple "@": local@mid@domain.tld — two or more "@" is invalid.
  fc
    .tuple(
      fc.string({ minLength: 1 }),
      fc.string({ minLength: 1 }),
      fc.string({ minLength: 1 }),
    )
    .map(([a, b, c]) => `${a}@${b}@${c}.com`),

  // 4. Empty local part: "@domain.com".
  fc
    .stringOf(fc.constantFrom(..."abcdefghijklmnop".split("")), {
      minLength: 1,
    })
    .map((domain) => `@${domain}.com`),

  // 5. Domain with no ".": "local@domain" (no dot after "@").
  fc
    .tuple(
      fc.stringOf(fc.constantFrom(..."abcdefghijklmnop".split("")), {
        minLength: 1,
      }),
      fc
        .stringOf(fc.constantFrom(..."abcdefghijklmnop".split("")), {
          minLength: 1,
        })
        .filter((d) => !d.includes(".")),
    )
    .map(([local, domain]) => `${local}@${domain}`),

  // 6. Empty domain: "local@".
  fc
    .stringOf(fc.constantFrom(..."abcdefghijklmnop".split("")), {
      minLength: 1,
    })
    .map((local) => `${local}@`),
);

describe("Property 9: Invalid emails are rejected (Req 9.6)", () => {
  it("isValidEmail returns false and validateContact reports an email error for invalid emails", () => {
    fc.assert(
      fc.property(
        invalidEmailArb,
        // Non-empty Name and Message so that email is the only failing field.
        fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        (invalidEmail, name, message) => {
          // The email itself must be rejected by the pure predicate.
          expect(isValidEmail(invalidEmail)).toBe(false);

          const result = validateContact({
            name,
            phone: "",
            email: invalidEmail,
            message,
          });

          // validateContact must flag an email error and be invalid overall.
          expect(result.valid).toBe(false);
          expect(result.errors.email).toBeDefined();
        },
      ),
      { numRuns: 200 },
    );
  });
});
