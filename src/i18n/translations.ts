// The translation resource for the Maija Portfolio site (Req 4.5).
//
// EN is the authoritative, complete dictionary keyed by dotted domains:
//   nav, info, resume, portfolio, blog, contact, footer.
// FI is intentionally PARTIAL to demonstrate the EN fallback (Req 4.6):
// keys omitted from FI resolve to their EN value via `translate`.

import type { TranslationResource } from "./types";

/**
 * Complete English dictionary. This is the single source of truth for every
 * user-facing key; the FI dictionary below overrides a subset of these.
 */
const EN = {
  // --- Navigation (Req 3.4) ---
  "nav.info": "Info",
  "nav.resume": "Resume",
  "nav.portfolio": "Portfolio",
  "nav.blog": "On My Mind",
  "nav.contact": "Contact me",

  // --- Info page (Req 5) ---
  "info.name": "Maija",
  "info.role": "Performer · Writer · Storyteller",
  "info.statement": "Stories, on stage and on screen.",
  "info.hero.placeholder": "Full-bleed hero photo placeholder",
  "info.hero.placeholder.note": "High-resolution portrait banner placement",
  "info.intro":
    "Hello! Very nice to see you here. I'm Maija, a performer, writer, and " +
    "storyteller working across theatre, film, and the written word. I love " +
    "shaping characters, crafting narratives, and finding the small human " +
    "moments that make a story land. Thank you for stopping by to learn a " +
    "little about my work and what keeps me curious.\n\nWarmly,\nMaija",
  "info.cta": "Contact me",
  "info.linkedin.label": "LinkedIn",

  // --- Resume page (Req 6) ---
  "resume.tab.performer": "Performer",
  "resume.tab.career": "Career/Business",
  "resume.performer.intro":
    "As a Performer, I bring stories to life on stage and screen. My work " +
    "spans summer theatre, independent film, and television, and I'm always " +
    "drawn to roles that let me explore something new about being human.",
  "resume.career.heading": "Career/Business",
  "resume.career.unavailable": "This content is not yet available.",
  "resume.career.section.experience": "Experience",
  "resume.career.section.education": "Education",
  "resume.career.section.volunteering": "Volunteering",
  "resume.career.section.skills": "Skills & Languages",
  "resume.career.label.description": "Description",
  "resume.career.label.activities": "Activities",
  "resume.career.label.coreSkills": "Core Skills",
  "resume.career.label.languages": "Languages",

  // --- Portfolio page (Req 7) ---
  "portfolio.filter.clear": "All",
  "portfolio.empty": "No work items match the selected filter.",

  // --- Blog / On My Mind page (Req 8) ---
  "blog.empty": "No posts currently available.",

  // --- Pre-footer showcase section (Sointu Borg style) ---
  "showcase.heading": "About",
  "showcase.body.1":
    "I'm Maija — a performer and storyteller who works across the stage, the " +
    "screen, and the page. Acting is where it started, and it still anchors " +
    "everything I make.",
  "showcase.body.2":
    "Alongside performing, I edit short video, run social media for creative " +
    "brands, and write — from features to personal essays. I like projects " +
    "that need both a narrative eye and a steady hand on the details.",
  "showcase.cta.question": "Looking for a creator for your project?",
  "showcase.cta.button": "Get in touch",

  // --- Contact page + form (Req 9, 13) ---
  "contact.label.name": "Name",
  "contact.label.phone": "Phone Number",
  "contact.label.email": "Email",
  "contact.label.message": "Message",
  "contact.submit": "Send",
  "contact.error.email": "Please enter a valid email address.",
  "contact.error.required": "This field is required.",
  "contact.success": "Thank you! Your message has been sent.",
  "contact.error.failed": "Your message was not sent. Please try again.",

  // --- Footer (Req 10) ---
  "footer.linkedin": "LinkedIn",
  "footer.email": "Email",
  "footer.brand.subline": "Student, Short Video Editor & Performer | Helsinki",
  "footer.links.heading": "Explore",
  "footer.contact.heading": "Contact",
  "footer.privacy": "Privacy Policy",
  "footer.copyright": "© 2026 Maija. All rights reserved.",
} satisfies Record<string, string>;

/**
 * Partial Finnish dictionary. Only a subset of keys are translated here to
 * demonstrate the EN fallback (Req 4.6): every omitted key resolves to its
 * EN value. Notably the info/resume long-form copy is intentionally left
 * untranslated so it falls back to English.
 */
const FI: Partial<Record<keyof typeof EN, string>> = {
  // --- Navigation ---
  "nav.info": "Tietoa",
  "nav.resume": "Ansioluettelo",
  "nav.portfolio": "Portfolio",
  "nav.blog": "Ajatuksia",
  "nav.contact": "Ota yhteyttä",

  // --- Info page ---
  "info.role": "Esiintyjä · Kirjoittaja · Tarinankertoja",
  "info.statement": "Tarinoita, lavalla ja valkokankaalla.",
  "info.hero.placeholder": "Koko näytön kansikuvan paikka",
  "info.hero.placeholder.note": "Korkearesoluutioisen muotokuvan paikka",
  "info.intro":
    "Hei! Ihanaa nähdä sinut täällä. Olen Maija, esiintyjä, kirjoittaja ja " +
    "tarinankertoja, joka työskentelee teatterin, elokuvan ja kirjoitetun " +
    "sanan parissa. Rakastan hahmojen muovaamista, tarinoiden rakentamista ja " +
    "niiden pienten inhimillisten hetkien löytämistä, jotka saavat tarinan " +
    "heräämään eloon. Kiitos, että pysähdyit tutustumaan työhöni ja siihen, " +
    "mikä pitää minut uteliaana.\n\nLämpimin terveisin,\n\nMaija",
  "info.cta": "Ota yhteyttä",

  // --- Pre-footer showcase section ---
  "showcase.heading": "Esittely",
  "showcase.body.1":
    "Olen Maija — esiintyjä ja tarinankertoja, joka työskentelee lavalla, " +
    "kameran edessä ja tekstin parissa. Näytteleminen on lähtökohta, joka " +
    "kantaa kaikessa mitä teen.",
  "showcase.body.2":
    "Esiintymisen ohella editoin lyhytvideoita, hoidan luovien brändien " +
    "sosiaalista mediaa ja kirjoitan. Pidän projekteista, jotka vaativat sekä " +
    "kerronnallista silmää että tarkkuutta yksityiskohdissa.",
  "showcase.cta.question": "Kaipaatko tekijää projektiisi?",
  "showcase.cta.button": "Ota yhteyttä",

  // --- Resume tabs ---
  "resume.tab.performer": "Esiintyjä",
  "resume.tab.career": "Ura/Liiketoiminta",

  "resume.performer.intro":
    "Esiintyjänä herätän tarinat eloon näyttämöllä ja ruudulla. Työni kattaa " +
    "niin kesäteatterin, indie-elokuvat kuin televisionkin, ja minua vetävät " +
    "aina puoleensa roolit, jotka antavat minun tutkia uusia puolia " +
    "ihmisyydestä.",

  // --- Resume Career/Business sections ---
  "resume.career.heading": "Ura/Liiketoiminta",
  "resume.career.section.experience": "Työkokemus",
  "resume.career.section.education": "Koulutus",
  "resume.career.section.volunteering": "Vapaaehtoistyö",
  "resume.career.section.skills": "Taidot ja Kielet",
  "resume.career.label.description": "Kuvaus",
  "resume.career.label.activities": "Toiminta",
  "resume.career.label.coreSkills": "Ydintaidot",
  "resume.career.label.languages": "Kielet",

  // --- Portfolio ---
  "portfolio.filter.clear": "Kaikki",

  // --- Contact form (Req 9.4, 9.5) ---
  "contact.label.name": "Nimi",
  "contact.label.phone": "Puhelinnumero",
  "contact.label.email": "Sähköposti",
  "contact.label.message": "Miten voin auttaa?",
  "contact.submit": "Lähetä",

  // --- Footer ---
  "footer.brand.subline":
    "Opiskelija, lyhytvideoeditoija & esiintyjä | Helsinki",
  "footer.links.heading": "Sivut",
  "footer.contact.heading": "Yhteystiedot",
  "footer.privacy": "Tietosuojaseloste",
  "footer.copyright": "© 2026 Maija. Kaikki oikeudet pidätetään.",

  // NOTE: keys such as "portfolio.empty", "blog.empty", and the contact
  // validation/status messages are intentionally omitted here and fall back to
  // EN (Req 4.6). The info/resume intro copy now has FI placeholder strings.
};

/**
 * The full translation resource consumed by `translate` and the
 * `I18nProvider`. EN is complete; FI is partial.
 */
export const translations: TranslationResource = {
  EN,
  FI,
};
