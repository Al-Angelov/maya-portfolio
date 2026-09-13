// Feature: maija-portfolio — submitContact Web3Forms adapter behavior
// (Validates: Requirements 13.1, 13.2, 13.4, 13.5)
//
// These unit tests exercise `submitContact`, the single I/O boundary for
// contact-form delivery, with a fully mocked `fetch` and a stubbed
// `import.meta.env`. They assert:
//   - Success (HTTP 2xx + { success: true }) resolves, and the POST targets
//     the Web3Forms endpoint with a JSON body carrying the env-sourced
//     access_key plus name/phone/email/message (Req 13.1, 13.2).
//   - An error response (success: false, or non-2xx) rejects (Req 13.4).
//   - A network error rejects (Req 13.5).
//   - A hanging request that is aborted at the 10s timeout rejects (Req 13.5).

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { submitContact } from "../src/lib/submitContact";
import type { ContactFormValues } from "../src/lib/validateContact";

const ENDPOINT = "https://api.web3forms.com/submit";
const TEST_KEY = "test-key";

/** A representative set of already-validated contact-form values. */
const VALUES: ContactFormValues = {
  name: "Ada Lovelace",
  phone: "+358 40 123 4567",
  email: "ada@example.com",
  message: "Hello Maija, I'd love to collaborate.",
};

/** Build a minimal Response-like object the adapter understands. */
function fakeResponse(init: {
  ok: boolean;
  status?: number;
  json?: () => unknown;
}): Response {
  return {
    ok: init.ok,
    status: init.status ?? (init.ok ? 200 : 500),
    json: async () => (init.json ? init.json() : {}),
  } as unknown as Response;
}

describe("submitContact adapter (Req 13.1, 13.2, 13.4, 13.5)", () => {
  beforeEach(() => {
    // Read the access key from the environment (Req 13.2) — never a literal.
    vi.stubEnv("VITE_WEB3FORMS_ACCESS_KEY", TEST_KEY);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("resolves and POSTs the values to Web3Forms on a successful response (Req 13.1, 13.2)", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(fakeResponse({ ok: true, json: () => ({ success: true }) }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(submitContact(VALUES)).resolves.toBeUndefined();

    // Targets the correct endpoint via a POST.
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(ENDPOINT);
    expect(options.method).toBe("POST");

    // Body contains the env-sourced access_key plus all four field values.
    const body = JSON.parse(options.body as string);
    expect(body.access_key).toBe(TEST_KEY);
    expect(body.name).toBe(VALUES.name);
    expect(body.phone).toBe(VALUES.phone);
    expect(body.email).toBe(VALUES.email);
    expect(body.message).toBe(VALUES.message);
  });

  it("rejects when the service reports success: false (Req 13.4)", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(fakeResponse({ ok: true, json: () => ({ success: false }) }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(submitContact(VALUES)).rejects.toThrow();
  });

  it("rejects on a non-2xx error response (Req 13.4)", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(fakeResponse({ ok: false, status: 500 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(submitContact(VALUES)).rejects.toThrow();
  });

  it("rejects on a network error (Req 13.5)", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValue(new Error("network down"));
    vi.stubGlobal("fetch", fetchMock);

    await expect(submitContact(VALUES)).rejects.toThrow();
  });

  it("rejects when the request hangs and is aborted at the 10s timeout (Req 13.5)", async () => {
    vi.useFakeTimers();

    // A hanging fetch that only settles when its AbortSignal fires. The adapter
    // installs a 10s timer that calls controller.abort(); when that happens we
    // reject with an AbortError, mirroring the real fetch abort contract.
    const fetchMock = vi.fn((_url: string, options: RequestInit) => {
      return new Promise<Response>((_resolve, reject) => {
        const signal = options.signal;
        if (signal) {
          signal.addEventListener("abort", () => {
            const abortError = new Error("The operation was aborted.");
            abortError.name = "AbortError";
            reject(abortError);
          });
        }
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const promise = submitContact(VALUES);
    // Attach a rejection handler synchronously so the pending rejection isn't
    // reported as unhandled while we advance the timers.
    const assertion = expect(promise).rejects.toThrow();

    // Fast-forward to the 10-second abort deadline.
    await vi.advanceTimersByTimeAsync(10_000);

    await assertion;
  });
});
