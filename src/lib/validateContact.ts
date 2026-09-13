/**
 * Pure contact-form validation logic (Req 9.6, 9.7).
 *
 * These functions perform no I/O and never mutate their inputs. They are the
 * single source of validation truth, run by `ContactForm` before any Web3Forms
 * submission is attempted (Req 13.6, 13.7).
 */

/** The four contact-form field values (mirrors the design-doc shape). */
export interface ContactFormValues {
  name: string;
  phone: string;
  email: string;
  message: string;
}

/** Result of validating a set of contact-form values. */
export interface ValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof ContactFormValues, string>>;
}

/**
 * Return true when `email` is valid per Req 9.6: it contains exactly one "@"
 * character, with at least one non-empty character before it, and after it at
 * least one character and at least one "." (with the "." not being the only
 * character, i.e. there is a non-empty character on each side of a "." in the
 * domain part is NOT required by the spec — only that a "." exists after "@"
 * and the domain is non-empty).
 *
 * Rules enforced:
 *  - exactly one "@"
 *  - the local part (before "@") is non-empty
 *  - the domain part (after "@") is non-empty and contains at least one "."
 */
export function isValidEmail(email: string): boolean {
  // Exactly one "@".
  const atIndex = email.indexOf("@");
  if (atIndex === -1) return false;
  if (email.indexOf("@", atIndex + 1) !== -1) return false;

  const local = email.slice(0, atIndex);
  const domain = email.slice(atIndex + 1);

  // Non-empty local part.
  if (local.length === 0) return false;

  // Domain must have at least one character and contain a ".".
  if (domain.length === 0) return false;
  if (!domain.includes(".")) return false;

  return true;
}

/** True when a required field is empty or contains only whitespace (Req 9.7). */
function isBlank(value: string): boolean {
  return value.trim().length === 0;
}

/**
 * Validate the contact-form values. The Name, Email, and Message fields are
 * required and must be non-empty and non-whitespace (Req 9.7); Phone is
 * optional. When Email is present, it must additionally satisfy `isValidEmail`
 * (Req 9.6). Returns `{ valid, errors }` where `errors` holds one message per
 * offending field. Pure: `values` is never mutated.
 */
export function validateContact(values: ContactFormValues): ValidationResult {
  const errors: Partial<Record<keyof ContactFormValues, string>> = {};

  if (isBlank(values.name)) {
    errors.name = "Name is required.";
  }

  if (isBlank(values.message)) {
    errors.message = "Message is required.";
  }

  if (isBlank(values.email)) {
    errors.email = "Email is required.";
  } else if (!isValidEmail(values.email)) {
    errors.email = "Email is invalid.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
