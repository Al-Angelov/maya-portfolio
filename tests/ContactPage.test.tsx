// Component tests for ContactPage, ContactForm, and Footer (Req 9, 10, 13).
//
// These example-based tests exercise the Contact_Section rendered through the
// real I18nProvider so labels, submit text, status/error copy, and the footer
// copyright resolve exactly as they do in the running app:
//   - ContactPage layout: Sweet_Pink root, Warm_Ivory form card, Footer below
//     (Req 9.1, 9.2, 10.1)
//   - ContactForm: exactly four labeled fields with EN (and FI) labels
//     (Req 9.3, 9.4) and a Primary_Dark / Warm_Ivory "Send" submit button
//     (Req 9.5)
//   - Validation gating: submitContact is never called when validateContact
//     fails, field errors show, and typed values are retained (Req 13.6, 13.7)
//   - Success confirmation on resolved submitContact (Req 9.8)
//   - Failure error + value retention on rejected submitContact (Req 9.9)
//   - Footer links + copyright (Req 10.2, 10.3, 10.4)
//
// The submitContact I/O adapter is mocked so no real network request is issued;
// each test sets its resolved/rejected behaviour and the mock is reset between
// tests. Assertions use plain DOM APIs plus Testing Library queries.

import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import {
  render,
  screen,
  cleanup,
  waitFor,
  type RenderResult,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect } from "react";

import { MemoryRouter } from "react-router-dom";

import { I18nProvider, useI18n } from "../src/i18n/I18nProvider";
import type { Language } from "../src/i18n/types";
import App from "../src/App";
import ContactPage from "../src/pages/ContactPage";
import ContactForm from "../src/components/ContactForm";
import Footer from "../src/components/Footer";

// Mock the single I/O boundary so no real fetch happens. Each test configures
// resolve/reject via the typed mock below.
vi.mock("../src/lib/submitContact", () => ({
  submitContact: vi.fn(),
}));

import { submitContact } from "../src/lib/submitContact";

const mockedSubmitContact = vi.mocked(submitContact);

/** Render children inside the real i18n context (defaults to EN). */
function withI18n(node: React.ReactNode): RenderResult {
  return render(<I18nProvider>{node}</I18nProvider>);
}

/**
 * Helper that flips the active language on mount so FI labels can be asserted
 * without a visible toggle in the Contact_Section.
 */
function SetLanguage({ lang }: { lang: Language }) {
  const { setLanguage } = useI18n();
  useEffect(() => {
    setLanguage(lang);
  }, [lang, setLanguage]);
  return null;
}

beforeEach(() => {
  mockedSubmitContact.mockReset();
});

afterEach(() => {
  cleanup();
  // The FI helper persists the language to sessionStorage; clear it so each
  // test starts from the default EN language.
  window.sessionStorage.clear();
});

describe("ContactPage layout (Req 9.1, 9.2, 10.1)", () => {
  it("renders the root section on the Sweet_Pink background (Req 9.1)", () => {
    const { container } = withI18n(<ContactPage />);

    const section = container.querySelector("section");
    expect(section).not.toBeNull();
    expect(section?.classList.contains("bg-sweetPink")).toBe(true);
  });

  it("places the ContactForm inside a Warm_Ivory container (Req 9.2)", () => {
    const { container } = withI18n(<ContactPage />);

    const ivory = container.querySelector(".bg-warmIvory");
    expect(ivory).not.toBeNull();
    // The form is nested within the Warm_Ivory card container.
    expect(ivory?.querySelector("form")).not.toBeNull();
  });

  it("renders the global Footer below the form across the app shell (Req 10.1)", () => {
    // The unified footer is rendered globally by the AppShell, not by the page
    // itself. Render the whole app at /contact to exercise that composition.
    const { container } = render(
      <I18nProvider>
        <MemoryRouter initialEntries={["/contact"]}>
          <App />
        </MemoryRouter>
      </I18nProvider>,
    );

    const footer = container.querySelector("footer");
    const form = container.querySelector("form");
    expect(footer).not.toBeNull();
    expect(form).not.toBeNull();

    // The footer appears after the form in document order.
    const position = form!.compareDocumentPosition(footer!);
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("does not render its own footer in isolation (footer is global)", () => {
    // ContactPage itself no longer renders a <footer>; that lives in AppShell.
    const { container } = withI18n(<ContactPage />);
    expect(container.querySelector("footer")).toBeNull();
  });
});

describe("ContactForm fields (Req 9.3, 9.4, 9.5)", () => {
  it("renders exactly four labeled fields with EN labels (Req 9.3)", () => {
    withI18n(<ContactForm />);

    expect(screen.getByLabelText("Name")).not.toBeNull();
    expect(screen.getByLabelText("Phone Number")).not.toBeNull();
    expect(screen.getByLabelText("Email")).not.toBeNull();
    expect(screen.getByLabelText("Message")).not.toBeNull();

    // Exactly four editable fields (three inputs + one textarea).
    const inputs = screen.getAllByRole("textbox");
    expect(inputs.length).toBe(4);
  });

  it("renders the field labels in Finnish when the language is FI (Req 9.4)", async () => {
    withI18n(
      <>
        <SetLanguage lang="FI" />
        <ContactForm />
      </>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Nimi")).not.toBeNull();
    });
    expect(screen.getByLabelText("Puhelinnumero")).not.toBeNull();
    expect(screen.getByLabelText("Sähköposti")).not.toBeNull();
    expect(screen.getByLabelText("Miten voin auttaa?")).not.toBeNull();
  });

  it("renders a Primary_Dark / Warm_Ivory submit button labeled 'Send' (Req 9.5)", () => {
    withI18n(<ContactForm />);

    const button = screen.getByRole("button", { name: "Send" });
    expect(button.getAttribute("type")).toBe("submit");
    expect(button.classList.contains("bg-primaryDark")).toBe(true);
    expect(button.classList.contains("text-warmIvory")).toBe(true);
  });
});

describe("ContactForm validation gating (Req 13.6, 13.7)", () => {
  it("does not call submitContact and shows errors + retains values on empty submit", async () => {
    const user = userEvent.setup();
    withI18n(<ContactForm />);

    await user.click(screen.getByRole("button", { name: "Send" }));

    // Validation failed, so the I/O adapter must never be invoked (Req 13.6).
    expect(mockedSubmitContact).not.toHaveBeenCalled();

    // Per-field required errors are shown (Name, Email, Message required).
    const requiredErrors = screen.getAllByText("This field is required.");
    expect(requiredErrors.length).toBe(3);

    // Values retained (all empty here, but the inputs remain rendered/editable).
    expect(
      (screen.getByLabelText("Name") as HTMLInputElement).value,
    ).toBe("");
  });

  it("does not call submitContact and shows an email error for an invalid email (Req 13.7)", async () => {
    const user = userEvent.setup();
    withI18n(<ContactForm />);

    await user.type(screen.getByLabelText("Name"), "Alex");
    await user.type(screen.getByLabelText("Email"), "abc");
    await user.type(screen.getByLabelText("Message"), "Hello there");

    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(mockedSubmitContact).not.toHaveBeenCalled();
    expect(
      screen.getByText("Please enter a valid email address."),
    ).not.toBeNull();

    // Typed values are retained after the failed submit.
    expect((screen.getByLabelText("Name") as HTMLInputElement).value).toBe(
      "Alex",
    );
    expect((screen.getByLabelText("Email") as HTMLInputElement).value).toBe(
      "abc",
    );
    expect(
      (screen.getByLabelText("Message") as HTMLTextAreaElement).value,
    ).toBe("Hello there");
  });
});

describe("ContactForm submission outcomes (Req 9.8, 9.9)", () => {
  it("shows the success confirmation when submitContact resolves (Req 9.8)", async () => {
    mockedSubmitContact.mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    withI18n(<ContactForm />);

    await user.type(screen.getByLabelText("Name"), "Alex");
    await user.type(screen.getByLabelText("Email"), "a@b.com");
    await user.type(screen.getByLabelText("Message"), "Hello there");

    await user.click(screen.getByRole("button", { name: "Send" }));

    const status = await screen.findByRole("status");
    expect(status.textContent).toBe("Thank you! Your message has been sent.");
    expect(mockedSubmitContact).toHaveBeenCalledTimes(1);
  });

  it("shows the failure error and retains values when submitContact rejects (Req 9.9)", async () => {
    mockedSubmitContact.mockRejectedValueOnce(new Error("network"));
    const user = userEvent.setup();
    withI18n(<ContactForm />);

    await user.type(screen.getByLabelText("Name"), "Alex");
    await user.type(screen.getByLabelText("Email"), "a@b.com");
    await user.type(screen.getByLabelText("Message"), "Hello there");

    await user.click(screen.getByRole("button", { name: "Send" }));

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toBe(
      "Your message was not sent. Please try again.",
    );

    // Field values are retained after the failed submission.
    expect((screen.getByLabelText("Name") as HTMLInputElement).value).toBe(
      "Alex",
    );
    expect((screen.getByLabelText("Email") as HTMLInputElement).value).toBe(
      "a@b.com",
    );
    expect(
      (screen.getByLabelText("Message") as HTMLTextAreaElement).value,
    ).toBe("Hello there");
  });
});

// The Footer uses react-router NavLink for its quick-links, so it must render
// inside a Router in addition to the i18n provider.
function renderFooter(): RenderResult {
  return render(
    <I18nProvider>
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    </I18nProvider>,
  );
}

describe("Footer (Req 10.2, 10.3, 10.4)", () => {
  it("renders the black global footer surface with a crisp top border (Warm_Ivory text)", () => {
    const { container } = renderFooter();

    const footer = container.querySelector("footer");
    expect(footer).not.toBeNull();
    // Absolute-black surface separates it from Primary_Dark/Sweet_Pink bodies.
    expect(footer?.classList.contains("bg-black")).toBe(true);
    expect(footer?.classList.contains("text-warmIvory")).toBe(true);
    // Crisp 1px architectural top border.
    expect(footer?.classList.contains("border-t")).toBe(true);
    expect(footer?.classList.contains("border-neutral-800")).toBe(true);
  });

  it("renders a single LinkedIn link that opens in a new tab safely (Req 10.3)", () => {
    renderFooter();

    const socialLinks = screen
      .getAllByRole("link")
      .filter((a) => (a.getAttribute("href") ?? "").includes("linkedin.com"));

    // Exactly one LinkedIn link — the footer's only social mark.
    expect(socialLinks).toHaveLength(1);
    expect(socialLinks[0].getAttribute("target")).toBe("_blank");
    expect(socialLinks[0].getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("does not render any Instagram link (fully removed)", () => {
    renderFooter();

    const instagram = screen
      .getAllByRole("link")
      .find((a) => (a.getAttribute("href") ?? "").includes("instagram"));
    expect(instagram).toBeUndefined();
  });

  it("renders the email address, location, and an Email icon link beside LinkedIn", () => {
    const { container } = renderFooter();

    // The email address is shown as a mailto link.
    const mailtos = screen
      .getAllByRole("link")
      .filter((a) => (a.getAttribute("href") ?? "").startsWith("mailto:"));
    expect(mailtos.length).toBeGreaterThanOrEqual(1);

    // The restored Email icon link sits next to LinkedIn (accessible name "Email").
    const emailIcon = screen.getByRole("link", { name: "Email" });
    expect(emailIcon.getAttribute("href")?.startsWith("mailto:")).toBe(true);
    expect(screen.getByRole("link", { name: "LinkedIn" })).not.toBeNull();

    const text = container.querySelector("footer")?.textContent ?? "";
    expect(text).toContain("Helsinki, Finland");
  });

  it("renders quick links to all five main pages", () => {
    renderFooter();

    // The five nav labels (EN defaults) are present as footer links.
    for (const label of ["Info", "Resume", "Portfolio", "On My Mind", "Contact me"]) {
      expect(screen.getByRole("link", { name: label })).not.toBeNull();
    }
  });

  it("renders a copyright notice containing 'Maija' and a year (Req 10.4)", () => {
    const { container } = renderFooter();

    const text = container.querySelector("footer")?.textContent ?? "";
    expect(text).toContain("Maija");
    expect(/\d{4}/.test(text)).toBe(true);
  });
});
