/**
 * Web3Forms contact-delivery adapter (Req 13.1, 13.2, 13.4, 13.5).
 *
 * This module is the single I/O boundary for contact-form delivery. It issues a
 * POST to the Web3Forms API and resolves/rejects a bare `Promise<void>` so the
 * calling `ContactForm` can drive its `SubmitState` off success/failure alone.
 *
 * The adapter is only ever invoked after the pure `validateContact` logic has
 * passed (Req 13.6, 13.7); it performs no validation of its own.
 */

import type { ContactFormValues } from "./validateContact";

/** The Web3Forms submission endpoint (Req 13.1). */
const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

/** Maximum time to wait for the request before treating it as a failure (Req 13.5). */
const REQUEST_TIMEOUT_MS = 10_000;

/**
 * Deliver the contact-form `values` to Web3Forms.
 *
 * Issues a `fetch` POST to `https://api.web3forms.com/submit` with a JSON body
 * containing `access_key` (read from `import.meta.env.VITE_WEB3FORMS_ACCESS_KEY`,
 * never a hardcoded literal — Req 13.2) plus the `name`, `phone`, `email`, and
 * `message` field values (Req 13.1). The request is bounded by a 10-second
 * `AbortController` timeout (Req 13.5).
 *
 * Resolves when the service confirms delivery (HTTP 2xx with `success: true`).
 * Rejects with an `Error` on an error response (`success: false` or non-2xx),
 * a network error, or the 10-second timeout (Req 13.4, 13.5). Pure with respect
 * to `values`: the input is never mutated.
 */
export async function submitContact(values: ContactFormValues): Promise<void> {
  const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(WEB3FORMS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        access_key: accessKey,
        name: values.name,
        phone: values.phone,
        email: values.email,
        message: values.message,
      }),
      signal: controller.signal,
    });

    // Non-2xx responses are failures (Req 13.4).
    if (!response.ok) {
      throw new Error(
        `Web3Forms request failed with status ${response.status}.`
      );
    }

    // A 2xx response must additionally report success: true (Req 13.3, 13.4).
    const result = (await response.json()) as { success?: boolean };
    if (result.success !== true) {
      throw new Error("Web3Forms reported an unsuccessful submission.");
    }
  } catch (error) {
    // Normalize aborts (timeout) and network errors into a rejected Error
    // so callers see a single failure channel (Req 13.5).
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error("Web3Forms request timed out.");
      }
      throw error;
    }
    throw new Error("Web3Forms request failed.");
  } finally {
    clearTimeout(timeoutId);
  }
}
