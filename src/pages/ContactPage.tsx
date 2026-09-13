// ContactPage — the Contact_Section (Req 9). Rendered at "/contact".
//
// Layout (Req 9.1, 9.2): a Sweet_Pink root wrapper (bg-sweetPink, min-h-screen)
// that holds the Contact_Form inside a Warm_Ivory rounded card container
// (bg-warmIvory). The unified dark Footer is rendered globally by the AppShell
// below every page (Req 10.1), so it is no longer part of this page.
//
// The page itself holds no state: the form owns its controlled fields and
// submission lifecycle. The heading label is resolved from the active language
// via the nav.contact key with the EN fallback.

import ContactForm from "../components/ContactForm";
import { useI18n } from "../i18n/I18nProvider";

/** Static image (served from public/images at the site root). */
const CONTACT_BG = "/images/contact-bg.jpg";

export default function ContactPage() {
  const { t } = useI18n();

  return (
    <section
      aria-labelledby="contact-heading"
      className="relative flex min-h-screen flex-col overflow-hidden bg-sweetPink"
      style={{
        // All background shorthand properties are set inline together so the
        // position can't be overridden by a Tailwind utility or global CSS.
        // `center 65%` shows the umbrella at the top and frames her whole body.
        backgroundImage: `url(${CONTACT_BG})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center 65%",
      }}
    >
      {/* Soft, balanced Sweet_Pink scrim: light enough that Maija's figure in
          the lower portion of the image reads through, yet keeps the ivory
          contact card crisp and legible. */}
      <div aria-hidden="true" className="absolute inset-0 bg-sweetPink/60" />
      {/* Soft, balanced Sweet_Pink scrim: light enough that Maija's figure in
          the lower portion of the image reads through, yet keeps the ivory
          contact card crisp and legible. */}
      <div aria-hidden="true" className="absolute inset-0 bg-sweetPink/60" />

      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-12">
        <h1 id="contact-heading" className="font-serif text-3xl text-primaryDark">
          {t("nav.contact")}
        </h1>

        {/* Contact_Form inside a Warm_Ivory card container (Req 9.2). */}
        <div className="rounded-2xl bg-warmIvory p-6 shadow-lg md:p-8">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
