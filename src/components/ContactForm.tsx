// ContactForm: controlled contact form with validation + Web3Forms delivery
// (Req 9.3–9.9, 13.1, 13.3–13.7).
//
// Renders exactly four labeled fields (Name, Phone Number, Email, Message) as
// controlled inputs with EN/FI labels from translations (Req 9.3, 9.4) and a
// submit button styled Primary_Dark / Warm_Ivory labeled "Send"/"Lähetä"
// (Req 9.5). On submit it runs the pure `validateContact` first; only when
// validation passes does it call the `submitContact` I/O adapter (Req 13.6,
// 13.7). A `SubmitState` drives the success confirmation (Req 9.8, 13.3) and
// the "message was not sent" failure error (Req 9.9, 13.4, 13.5); field values
// are retained on both validation failure and submission failure.

import { useState, type FormEvent } from "react";

import { useI18n } from "../i18n/I18nProvider";
import { submitContact } from "../lib/submitContact";
import {
  validateContact,
  type ContactFormValues,
} from "../lib/validateContact";

/** Lifecycle of a submission attempt (mirrors the design-doc type). */
type SubmitState = "idle" | "submitting" | "success" | "error";

/** The four editable field keys. */
type FieldKey = keyof ContactFormValues;

/**
 * Render the contact form. Holds controlled state for all four fields plus the
 * current validation errors and submission state. Purely self-contained: the
 * only I/O is the guarded `submitContact` call.
 */
export function ContactForm() {
  const { t } = useI18n();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [errors, setErrors] = useState<
    Partial<Record<FieldKey, string>>
  >({});
  const [submitState, setSubmitState] = useState<SubmitState>("idle");

  /**
   * Map a raw validation error for a field to a user-facing, translated
   * message. The email field distinguishes "invalid" (Req 9.6) from the
   * generic required message (Req 9.7); all other fields use the required
   * message.
   */
  function messageFor(field: FieldKey, raw: string): string {
    if (field === "email" && /invalid/i.test(raw)) {
      return t("contact.error.email");
    }
    return t("contact.error.required");
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const values: ContactFormValues = { name, phone, email, message };
    const result = validateContact(values);

    // Validation failed: show inline messages, do NOT submit, retain values
    // (Req 9.6, 9.7, 13.6, 13.7).
    if (!result.valid) {
      setErrors(result.errors);
      setSubmitState("idle");
      return;
    }

    // Validation passed: clear errors and attempt delivery (Req 13.7).
    setErrors({});
    setSubmitState("submitting");

    try {
      await submitContact(values);
      // Success confirmation (Req 9.8, 13.3).
      setSubmitState("success");
    } catch {
      // Failure/timeout: show error, retain all values (Req 9.9, 13.4, 13.5).
      setSubmitState("error");
    }
  }

  const isSubmitting = submitState === "submitting";

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {/* Name (required, Req 9.3, 9.7) */}
      <div className="flex flex-col gap-1">
        <label htmlFor="contact-name" className="text-primaryDark">
          {t("contact.label.name")}
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? "contact-name-error" : undefined}
          className="rounded border border-primaryDark/30 bg-warmIvory px-3 py-2 text-primaryDark"
        />
        {errors.name && (
          <p id="contact-name-error" className="text-sm text-primaryDark">
            {messageFor("name", errors.name)}
          </p>
        )}
      </div>

      {/* Phone Number (optional, Req 9.3) */}
      <div className="flex flex-col gap-1">
        <label htmlFor="contact-phone" className="text-primaryDark">
          {t("contact.label.phone")}
        </label>
        <input
          id="contact-phone"
          name="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="rounded border border-primaryDark/30 bg-warmIvory px-3 py-2 text-primaryDark"
        />
      </div>

      {/* Email (required + format, Req 9.3, 9.6, 9.7) */}
      <div className="flex flex-col gap-1">
        <label htmlFor="contact-email" className="text-primaryDark">
          {t("contact.label.email")}
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "contact-email-error" : undefined}
          className="rounded border border-primaryDark/30 bg-warmIvory px-3 py-2 text-primaryDark"
        />
        {errors.email && (
          <p id="contact-email-error" className="text-sm text-primaryDark">
            {messageFor("email", errors.email)}
          </p>
        )}
      </div>

      {/* Message (required, Req 9.3, 9.7) */}
      <div className="flex flex-col gap-1">
        <label htmlFor="contact-message" className="text-primaryDark">
          {t("contact.label.message")}
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={
            errors.message ? "contact-message-error" : undefined
          }
          className="rounded border border-primaryDark/30 bg-warmIvory px-3 py-2 text-primaryDark"
        />
        {errors.message && (
          <p id="contact-message-error" className="text-sm text-primaryDark">
            {messageFor("message", errors.message)}
          </p>
        )}
      </div>

      {/* Submit button: Primary_Dark bg, Warm_Ivory text, "Send"/"Lähetä"
          (Req 9.5). */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded bg-primaryDark px-4 py-2 text-warmIvory transition-opacity disabled:opacity-60"
      >
        {t("contact.submit")}
      </button>

      {/* Success confirmation (Req 9.8, 13.3). */}
      {submitState === "success" && (
        <p role="status" className="text-primaryDark">
          {t("contact.success")}
        </p>
      )}

      {/* Failure / timeout error (Req 9.9, 13.4, 13.5). */}
      {submitState === "error" && (
        <p role="alert" className="text-primaryDark">
          {t("contact.error.failed")}
        </p>
      )}
    </form>
  );
}

export default ContactForm;
