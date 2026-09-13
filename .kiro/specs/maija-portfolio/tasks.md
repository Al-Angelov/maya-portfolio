# Implementation Plan: Maija Portfolio

## Overview

This plan implements the Maija Portfolio site as a React 18 + Vite + TypeScript static app, styled with Tailwind CSS and routed with react-router-dom. Work proceeds bottom-up: scaffolding and the single-source design tokens first, then the i18n layer and pure logic modules (each with property tests), then the typed seed data modules, then the Sanity.io CMS data-access layer (read-only public client, GROQ queries, pure mappers, and a fetch hook with a 10s timeout), then the shell/routing and per-page components that consume the CMS via `useCmsResource` with loading/error/empty states, the Web3Forms contact delivery adapter, and finally responsive verification and build/smoke checks. Pure business logic (validation, filtering, blog ordering, translation resolution, and the CMS document-to-model mappers) is isolated in `src/lib/`, `src/i18n/`, and `src/cms/` so the 12 correctness properties can be exercised directly with fast-check. The single I/O boundaries — Sanity fetching in `src/cms/` and Web3Forms delivery in `src/lib/submitContact.ts` — are kept thin and independently testable with mocked fetch. Each task builds on the previous ones and wires new code into the running app so nothing is orphaned.

## Tasks

- [x] 1. Scaffold project structure and tooling
  - Initialize a Vite + React + TypeScript project with `package.json` defining `"dev": "vite"`, `"build": "vite build"`, and `"test": "vitest run"`
  - Add dependencies: `react`, `react-dom`, `react-router-dom`, `@sanity/client`; dev deps: `vite`, `typescript`, `tailwindcss`, `postcss`, `autoprefixer`, `vitest`, `fast-check`, `@testing-library/react`, `@testing-library/user-event`, `jsdom`
  - Create the folder structure: `src/pages/`, `src/components/`, `src/styles/`, `src/i18n/`, `src/data/`, `src/cms/`, `src/lib/`, `public/images/`, `public/fonts/`, `tests/`, and optionally `studio/schemas/` for the Sanity Studio authoring schemas
  - Add a git-ignored `.env` (add `.env` to `.gitignore`) declaring the runtime configuration variables `VITE_SANITY_PROJECT_ID`, `VITE_SANITY_DATASET`, and `VITE_WEB3FORMS_ACCESS_KEY` (all public/read-only values; no secret write token)
  - Add `index.html` SPA entry, `vite.config.ts` (with jsdom test env + configurable base), and `tsconfig.json`
  - Write `README.md` documenting the name/purpose of each top-level directory (including `src/cms/` and the optional `studio/`), the required `.env` variables and that `.env` is git-ignored, and the exact launch command (`npm install` then `npm run dev`)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.6_

- [x] 2. Define the single-source design-system theme
  - [x] 2.1 Create the centralized token module and Tailwind theme
    - In `src/styles/theme.ts`, declare `COLORS` (`primaryDark #141414`, `sweetPink #F5CBDA`, `warmIvory #FFF4EC`) and `FONT_STACK` (`"Bookman Old Style", Georgia, serif`) exactly once
    - In `tailwind.config.ts`, extend `colors` (primaryDark/sweetPink/warmIvory) and `fontFamily.serif = ['"Bookman Old Style"', 'Georgia', 'serif']`, referencing the token values as the single source
    - In `src/styles/index.css`, add Tailwind directives, the `@font-face`/font-family setup, and set `body` font-family so all text inherits Bookman Old Style with Georgia fallback
    - Ensure no hex value or font-family literal is redeclared anywhere else in the codebase
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 2.2 Write single-source token scan test
    - Static-scan test asserting each hex value (`#141414`, `#F5CBDA`, `#FFF4EC`) and the font-family literal appear only in the token module / Tailwind config
    - _Requirements: 2.6_

- [x] 3. Build the i18n layer
  - [x] 3.1 Define i18n types and the translation resource
    - In `src/i18n/types.ts`, define `Language = "EN" | "FI"`, `TranslationKey`, `LanguageDictionary`, and `TranslationResource` (`EN` complete, `FI` partial)
    - In `src/i18n/translations.ts`, author the EN dictionary (complete) keyed by dotted domains (nav, info, resume, portfolio, blog, contact, footer) and a partial FI dictionary
    - _Requirements: 4.5_

  - [x] 3.2 Implement the translate resolver with EN fallback
    - In `src/i18n/translate.ts`, implement `translate(resource, language, key)`: return FI value when present and non-empty; otherwise fall back to the EN value; if EN is missing return the key itself
    - _Requirements: 4.6_

  - [x] 3.3 Write property test for translation fallback
    - **Property 2: Missing FI translation falls back to EN**
    - **Validates: Requirements 4.6**
    - Tag: `// Feature: maija-portfolio, Property 2: ...`; min 100 iterations; generate resources with randomly-omitted/empty FI keys

  - [x] 3.4 Implement I18nProvider with sessionStorage persistence
    - In `src/i18n/I18nProvider.tsx`, create context exposing `{ language, setLanguage, t }`; initialize from `sessionStorage["maija.lang"]`, defaulting to `EN` when unset
    - `setLanguage` validates the code is EN/FI, updates state, and writes to `sessionStorage`; `t(key)` calls `translate` against the active language
    - _Requirements: 4.1, 4.4_

  - [x] 3.5 Write property test for language preference round-trip
    - **Property 1: Language preference round-trip persists**
    - **Validates: Requirements 4.4**
    - Tag: `// Feature: maija-portfolio, Property 1: ...`; min 100 iterations; generator `fc.constantFrom("EN","FI")`

- [x] 4. Implement pure logic modules
  - [x] 4.1 Implement contact validation logic
    - In `src/lib/validateContact.ts`, implement `isValidEmail(email)` (exactly one `@`, non-empty before, at least one char and one `.` after) and `validateContact(values)` returning `{ valid, errors }` for empty/whitespace Name, Email, Message and invalid Email
    - _Requirements: 9.6, 9.7_

  - [x] 4.2 Write property test for invalid email rejection
    - **Property 9: Invalid emails are rejected**
    - **Validates: Requirements 9.6**
    - Tag: `// Feature: maija-portfolio, Property 9: ...`; min 100 iterations; arbitrary strings + structured invalid emails

  - [x] 4.3 Write property test for empty/whitespace required fields
    - **Property 10: Empty or whitespace required fields are rejected**
    - **Validates: Requirements 9.7**
    - Tag: `// Feature: maija-portfolio, Property 10: ...`; min 100 iterations; values with whitespace-only required fields

  - [x] 4.4 Implement tag filtering logic
    - In `src/lib/filterCards.ts`, implement `distinctTags(cards)` (each present tag once) and `filterCards(cards, tag)` (matching cards for a tag; full unchanged set when tag is null)
    - _Requirements: 7.7, 7.8, 7.10_

  - [x] 4.5 Write property test for distinct tag controls
    - **Property 4: Tag filter controls equal the distinct tags present**
    - **Validates: Requirements 7.7**
    - Tag: `// Feature: maija-portfolio, Property 4: ...`; min 100 iterations; arrays of cards with overlapping tag sets

  - [x] 4.6 Write property test for filtering by a tag
    - **Property 5: Filtering by a tag selects exactly the matching cards**
    - **Validates: Requirements 7.8**
    - Tag: `// Feature: maija-portfolio, Property 5: ...`; min 100 iterations; arrays of cards + a tag from present/absent tags

  - [x] 4.7 Write property test for clearing the filter
    - **Property 6: Clearing the filter returns all cards**
    - **Validates: Requirements 7.10**
    - Tag: `// Feature: maija-portfolio, Property 6: ...`; min 100 iterations; arrays of cards, filter null

  - [x] 4.8 Implement blog recency ordering logic
    - In `src/lib/sortBlog.ts`, implement `sortBlogByRecency(entries)` returning a permutation of the input ordered non-increasing by `publishedDate`
    - _Requirements: 8.3_

  - [x] 4.9 Write property test for blog recency ordering
    - **Property 8: Blog entries are ordered most-recent-first and preserved**
    - **Validates: Requirements 8.3**
    - Tag: `// Feature: maija-portfolio, Property 8: ...`; min 100 iterations; arrays of entries with random ISO dates

- [x] 5. Checkpoint - Ensure all pure-logic and i18n tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Author typed seed data modules (CMS seed / authoring reference / test fixtures)
  - [x] 6.1 Create timeline seed data
    - In `src/data/timeline.ts`, define `TimelineEntry`/`TimelineCategory` types and encode the exact entries: Theatre (5 entries, ordered), TV & Film (3 entries, ordered), Directing & Writing (1 entry with premiere), with categories in order Theatre → TV & Film → Directing & Writing
    - Note: these values are no longer the runtime source. They are the initial CMS seed/authoring reference (used to populate Sanity) and a test fixture; the runtime timeline is fetched from the CMS via `useCmsResource`. The shape matches the CMS-mapped `TimelineCategory[]` exactly so pure logic and Property 3 are unaffected.
    - _Requirements: 6.6, 6.7, 6.8, 6.9, 12.7_

  - [x] 6.2 Create portfolio card seed data
    - In `src/data/portfolio.ts`, define `PortfolioCardData` and seed cards covering video editing, social media, and written works — including Helsingin Sanomat and Pärskeitä publications — each with one image placeholder, description ≤300 chars, and 1–5 tags
    - Note: these values now serve as the CMS seed/authoring reference and test fixtures (they still back Property 3), not the runtime source; the runtime cards are fetched from the CMS.
    - _Requirements: 7.4, 7.5, 7.6, 12.7_

  - [x] 6.3 Write property test for card data invariants
    - **Property 3: Card data invariants hold**
    - **Validates: Requirements 7.6**
    - Tag: `// Feature: maija-portfolio, Property 3: ...`; min 100 iterations; generated `PortfolioCardData` plus the seed dataset

  - [x] 6.4 Create blog entry seed data
    - In `src/data/blog.ts`, define `BlogEntry` and seed 3–12 entries including the November 2026 movie premiere entry and the autumn networking events entry
    - Note: these values now serve as the CMS seed/authoring reference and test fixtures, not the runtime source; the runtime entries are fetched from the CMS.
    - _Requirements: 8.3, 8.4, 8.5, 12.7_

- [x] 7. Implement the Sanity CMS data-access layer
  - [x] 7.1 Implement the read-only Sanity client
    - In `src/cms/sanityClient.ts`, configure `@sanity/client` via `createClient` for read-only public access: `projectId` from `import.meta.env.VITE_SANITY_PROJECT_ID`, `dataset` from `import.meta.env.VITE_SANITY_DATASET`, `apiVersion: "2024-01-01"`, `useCdn: true`, and NO `token` (no secret write token in the client bundle)
    - _Requirements: 12.1, 12.6_

  - [x] 7.2 Implement GROQ queries and pure mappers
    - In `src/cms/queries.ts`, define the GROQ queries for the `timelineEntry`, `portfolioCard`, and `blogEntry` document types and the pure mapper functions `mapTimeline`, `mapPortfolio`, `mapBlog` (Sanity docs → typed `TimelineCategory[]` / `PortfolioCardData[]` / `BlogEntry[]`), performing no I/O
    - `mapTimeline` groups entries under their document `category` and preserves the required category order (Theatre → TV & Film → Directing & Writing) and the within-category ordering (Req 6.9); `mapPortfolio` renames `image → imagePlaceholder` and passes through fields; `mapBlog` is a field-for-field passthrough
    - _Requirements: 12.1_

  - [x] 7.3 Write property test for CMS mapping
    - **Property 12: CMS mapping faithfully transforms documents into typed models**
    - **Validates: Requirements 12.1**
    - Tag: `// Feature: maija-portfolio, Property 12: ...`; min 100 iterations; generators producing arrays of `SanityTimelineEntry` / `SanityPortfolioCard` / `SanityBlogEntry`; assert each source document is preserved exactly once (none dropped/added/duplicated), fields map correctly, and the timeline result groups by category with the required category and within-category order preserved

  - [x] 7.4 Implement the useCmsResource fetch hook
    - In `src/cms/useCmsResource.ts`, implement `useCmsResource(kind)` returning `{ status, data, error }` (`status: "loading" | "success" | "error"`); issue the resource's GROQ query through `sanityClient`, apply the matching mapper, and enforce a 10-second timeout via `AbortController` that aborts and transitions to `error` (Req 12.4)
    - Retain the last successfully loaded data in `state.data` across a failed refetch (Req 12.5)
    - _Requirements: 12.1, 12.3, 12.4, 12.5_

  - [x] 7.5 Add Sanity Studio schemas as the authoring surface
    - Under `studio/schemas/`, define the `timelineEntry`, `portfolioCard`, and `blogEntry` document schemas whose field shapes mirror the typed models (including `category`/`order` for timeline, `image`/`description`/`tags`/`publication` for portfolio, and `title`/`publishedDate`/`body`/optional `language` for blog), seeded from the existing `src/data` seed values; add a minimal `studio/sanity.config.ts`. This Studio is the authoring surface and is deployed separately (or hosted by Sanity), never bundled into the static site.
    - _Requirements: 12.7_

  - [x] 7.6 Write tests for the fetch hook states and no-write-token scan
    - With a mocked `sanityClient`, assert `useCmsResource` transitions loading → success (mapped data) on a resolved fetch, loading → error on a rejected fetch, and — with fake timers — a hanging fetch transitions to `error` at 10s (Req 12.4); assert previously loaded data is retained in `state.data` across a failed refetch (Req 12.5)
    - Static-scan test asserting `sanityClient.ts` configures no `token` and that no write-capable Sanity token is referenced anywhere in `src/` (Req 12.6)
    - _Requirements: 12.3, 12.4, 12.5, 12.6_

- [x] 8. Build the app shell, routing, and top bar
  - [x] 8.1 Implement AppShell and routing
    - In `src/App.tsx`, wrap routes with the persistent `TopBar` and render pages via `<Outlet />`; apply the Primary_Dark base document background
    - Configure routes with Info as the index route (`/`), plus `/resume`, `/portfolio`, `/on-my-mind`, `/contact`
    - In `src/main.tsx`, bootstrap the app inside `I18nProvider` and `BrowserRouter` (with configurable base), importing `styles/index.css`
    - Add temporary page stubs so routing renders while pages are built
    - _Requirements: 1.5, 3.1_

  - [x] 8.2 Implement TopBar with sticky nav and active state
    - In `src/components/TopBar.tsx`, render exactly five `NavLink`s in order (Info, Resume, Portfolio, On My Mind, Contact me) with labels from `t()`, sticky positioning (`position: sticky; top: 0`, high z-index), Sweet_Pink background with Primary_Dark text, and active state via `NavLink` (`aria-current="page"`)
    - Collapse links into a single-column stacked menu at viewports ≤767px
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.7, 11.1_

  - [x] 8.3 Write component tests for TopBar
    - Assert five links in order, sticky positioning, Sweet_Pink/Primary_Dark tokens, active state on navigation, and labels updating with language
    - _Requirements: 3.1, 3.3, 3.4, 3.5, 3.7_

  - [x] 8.4 Implement LanguageToggle wired to context
    - In `src/components/LanguageToggle.tsx`, render a two-option segmented control (`role="radiogroup"`, options `role="radio"`) labeled exactly "EN" and "FI"; mark the active language `aria-checked="true"`; on select call `setLanguage` from context (updates state + persists)
    - Render the toggle inside the TopBar
    - _Requirements: 3.6, 4.2, 4.3_

  - [x] 8.5 Write component tests for LanguageToggle and i18n defaults
    - Assert default EN on first load, exactly two options with selected state, and content/labels updating on toggle
    - _Requirements: 4.1, 4.2, 4.3, 4.5_

- [x] 9. Implement the Info page
  - [x] 9.1 Implement InfoPage and PhotoFrame
    - In `src/pages/InfoPage.tsx`, use Primary_Dark background with a nature-themed placeholder overlay; render intro copy (translation entry beginning "Hello! Very nice to see you here" and ending "Maija") inside a Warm_Ivory box with Primary_Dark text
    - In `src/components/PhotoFrame.tsx`, render the placeholder image frame reserved for a professional photo
    - Render a LinkedIn logo icon: when `linkedInUrl` is configured, open in a new tab (`target="_blank" rel="noopener noreferrer"`); when null/unconfigured, render non-clickable (no `href`, `aria-disabled="true"`, no navigation) via an `InfoConfig`
    - Replace the InfoPage stub in routing
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

  - [x] 9.2 Write component tests for InfoPage
    - Assert backgrounds, overlay, intro copy start/end text, photo frame presence, and LinkedIn configured vs unconfigured states
    - _Requirements: 5.1, 5.3, 5.4, 5.5, 5.7, 5.8_

- [x] 10. Implement the Resume page and Timeline
  - [x] 10.1 Implement Timeline component
    - In `src/components/Timeline.tsx`, render the provided `TimelineCategory[]` in order (Theatre, TV & Film, Directing & Writing); each entry shows role, production, venue/company, and year (plus premiere date for the directing entry). The component consumes the categories via props (fed from the CMS) rather than importing the seed data directly.
    - _Requirements: 6.6, 6.7, 6.8, 6.9_

  - [x] 10.2 Implement ResumePage with tabs consuming the CMS
    - In `src/pages/ResumePage.tsx`, use a Sweet_Pink background wrapper with performer content in Warm_Ivory containers; show "As a Performer" intro copy; render "Performer" (active by default) and "Career/Business" tabs; selecting Career/Business shows a heading and a "not yet available" message
    - Obtain the timeline categories via `useCmsResource('timeline')`; while `status === 'loading'` show a loading indicator in the timeline region; on `status === 'error'` show an error indication and, when data exists, render the retained/last-good categories, otherwise render an empty-timeline fallback; on `status === 'success'` pass the mapped `TimelineCategory[]` to `Timeline` while the Performer tab is active
    - Replace the ResumePage stub in routing
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 12.1, 12.3, 12.5_

  - [x] 10.3 Write component tests for ResumePage and Timeline
    - Assert backgrounds/containers, intro copy, tab default and switching behavior, and the exact Timeline entries, fields, and category order (from the seed dataset mapped as CMS success data)
    - With `useCmsResource` stubbed, assert the loading indicator (`status:'loading'`), success rendering of mapped categories, error-with-retained-data, and the empty fallback (error with no prior data)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 12.1, 12.3, 12.5_

- [x] 11. Implement the Portfolio page, cards, and tag filter
  - [x] 11.1 Implement PortfolioCard and TagFilter
    - In `src/components/PortfolioCard.tsx`, render one placeholder image frame, the description, and the card's tags
    - In `src/components/TagFilter.tsx`, render one filter control per distinct tag (via `distinctTags`) plus a clear control; call `onSelect(tag | null)`
    - _Requirements: 7.6, 7.7_

  - [x] 11.2 Implement PortfolioPage with responsive grid and filtering consuming the CMS
    - In `src/pages/PortfolioPage.tsx`, use Primary_Dark background with one or more background placeholder frames at reduced opacity (5%–20%); hold `activeTag` state
    - Obtain the cards via `useCmsResource('portfolio')`; while loading show a loading indicator; on error show an error indication and render retained/last-good cards, falling back to the Req 7.9 empty/"no items match" placeholder when no prior cards exist; on success feed the mapped `PortfolioCardData[]` into `filterCards`/`distinctTags`
    - Responsive grid: ≥768px shows 2–4 cards per row; <768px shows 1 per row
    - Selecting a tag shows only matching cards; zero matches shows a "no items match" message; clearing the filter shows all cards
    - Replace the PortfolioPage stub in routing
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.8, 7.9, 7.10, 11.2, 11.3, 12.1, 12.3, 12.5_

  - [x] 11.3 Write component and edge-case tests for PortfolioPage
    - Assert background + placeholder opacity range, category/publication coverage, filtering to matching cards, clearing behavior, and the zero-match "no items match" message
    - With `useCmsResource` stubbed, assert the loading indicator, success rendering of mapped cards, error-with-retained-data, and the empty-state fallback (error with no prior data → Req 7.9 placeholder)
    - _Requirements: 7.1, 7.4, 7.5, 7.8, 7.9, 7.10, 12.1, 12.3, 12.5_

- [x] 12. Implement the On My Mind (Blog) page
  - [x] 12.1 Implement BlogPage consuming the CMS
    - In `src/pages/BlogPage.tsx`, use Sweet_Pink background; obtain entries via `useCmsResource('blog')`; render entries (ordered via `sortBlogByRecency`) as a single-column vertical list with consistent spacing, each showing title, publication date, and body
    - While loading show a loading indicator; on error show an error indication and render retained/last-good entries, falling back to the Req 8.6 "no posts currently available" placeholder when no prior entries exist; also show that placeholder when there are simply no entries
    - Replace the BlogPage stub in routing
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 12.1, 12.3, 12.5_

  - [x] 12.2 Write property test for blog entry render completeness
    - **Property 7: Blog entries render completely**
    - **Validates: Requirements 8.2**
    - Tag: `// Feature: maija-portfolio, Property 7: ...`; min 100 iterations; generated `BlogEntry`; assert title, date, and body all rendered

  - [x] 12.3 Write component and edge-case tests for BlogPage
    - Assert Sweet_Pink background, the November 2026 premiere entry, the autumn networking entry, and the empty-list placeholder
    - With `useCmsResource` stubbed, assert the loading indicator, success rendering of mapped entries, error-with-retained-data, and the empty fallback (error with no prior data → Req 8.6 placeholder)
    - _Requirements: 8.1, 8.4, 8.5, 8.6, 12.1, 12.3, 12.5_

- [x] 13. Implement the Web3Forms contact delivery adapter
  - [x] 13.1 Implement submitContact
    - In `src/lib/submitContact.ts`, implement `submitContact(values): Promise<void>` issuing a `fetch` POST to `https://api.web3forms.com/submit` with a JSON body containing `access_key` (read from `import.meta.env.VITE_WEB3FORMS_ACCESS_KEY`, never a hardcoded literal) plus the `name`, `phone`, `email`, and `message` field values
    - Bound the request with a 10-second `AbortController` timeout; resolve on a success response (HTTP 2xx with `success: true`); reject on an error response (`success: false` / non-2xx), a network error, or the timeout
    - _Requirements: 13.1, 13.2, 13.4, 13.5_

  - [x] 13.2 Write tests for submitContact adapter
    - With a mocked `fetch` (and stubbed `import.meta.env`): success response resolves and the POST targets `https://api.web3forms.com/submit` with a body containing `access_key` plus name/phone/email/message (Req 13.1, 13.2); an error response rejects (Req 13.4); a network error rejects (Req 13.5); with fake timers, a hanging request rejects at 10s (Req 13.5)
    - Static-scan test asserting the access key is read from `import.meta.env.VITE_WEB3FORMS_ACCESS_KEY` and no access-key literal appears in component logic (Req 13.2)
    - _Requirements: 13.1, 13.2, 13.4, 13.5_

- [x] 14. Implement the Contact page, form, and footer
  - [x] 14.1 Implement ContactForm with validation and Web3Forms submission
    - In `src/components/ContactForm.tsx`, render exactly four labeled fields (Name, Phone Number, Email, Message) as controlled inputs with EN/FI labels from translations and a submit button (Primary_Dark background, Warm_Ivory text, "Send"/"Lähetä")
    - On submit run `validateContact` first: invalid email → inline message, no submit, values retained; empty/whitespace Name/Email/Message → per-field messages, no submit, values retained. Only when validation passes call `submitContact`; never call `submitContact` when validation fails (Req 13.6, 13.7)
    - Track a `SubmitState`; on success show a confirmation (Req 9.8, 13.3); on failure/timeout show a "message was not sent" error and retain values (Req 9.9, 13.4, 13.5)
    - _Requirements: 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 13.1, 13.3, 13.4, 13.5, 13.6, 13.7_

  - [x] 14.2 Implement Footer
    - In `src/components/Footer.tsx`, render at least two social links (including a LinkedIn link to Maija's profile) that open the corresponding profiles, plus a copyright notice containing "Maija" and a copyright year
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [x] 14.3 Implement ContactPage wiring form and footer
    - In `src/pages/ContactPage.tsx`, use Sweet_Pink background; place `ContactForm` inside a Warm_Ivory card container; render `Footer` below the form
    - Replace the ContactPage stub in routing
    - _Requirements: 9.1, 9.2, 10.1_

  - [x] 14.4 Write component tests for ContactPage, ContactForm, and Footer
    - Assert backgrounds/containers, four labeled fields with EN/FI labels, submit button token + label, success confirmation (mocked `submitContact`/`fetch` resolve), failure error + value retention (mocked reject), and footer placement/links/copyright
    - Assert the mocked `fetch`/`submitContact` is never called when `validateContact` fails (Req 13.6, 13.7)
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.8, 9.9, 10.1, 10.2, 10.3, 10.4, 13.6, 13.7_

- [x] 15. Verify responsive layout and design-token invariance
  - [x] 15.1 Add responsive layout styles across breakpoints
    - Ensure single-column layout at ≤767px, Portfolio grid ≥2 columns at 768–1023px and ≥3 columns at ≥1024px, and identical Design_System colors/typography at all widths ≥320px
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [x] 15.2 Write property test for design-token invariance across widths
    - **Property 11: Design tokens are invariant across viewport width**
    - **Validates: Requirements 11.4**
    - Tag: `// Feature: maija-portfolio, Property 11: ...`; min 100 iterations; generator `fc.integer({ min: 320, max: 3840 })`; assert applied color tokens and font stack are identical

  - [x] 15.3 Write responsive column-count component tests
    - Assert single-column at ≤767px and column counts at representative widths (768–1023, ≥1024)
    - _Requirements: 11.1, 11.2, 11.3_

- [x] 16. Final checkpoint - Build and smoke verification
  - [x] 16.1 Add build and structure smoke tests
    - Add tests/checks asserting `pages/`, `components/`, `styles/`, and static-asset directories exist and are non-empty; assert the default route `/` renders InfoPage; run `vite build` and assert `dist/` contains only static files; assert a broken launch invocation exits non-zero
    - _Requirements: 1.1, 1.3, 1.5, 1.6_

  - [x] 16.2 Run the full verification suite
    - Run `npm run build` and `npm run test` (`vitest run`); ensure all tests pass, ask the user if questions arise.
    - _Requirements: 1.2, 1.3_

## Notes

- Tasks marked with `*` are optional test sub-tasks and can be skipped for a faster MVP; core implementation tasks are never optional.
- Each task references the specific requirements it implements for traceability; property test tasks also reference their design property number.
- Checkpoints (tasks 5 and 16) ensure incremental validation.
- All 12 correctness properties are wired to fast-check tests configured for a minimum of 100 iterations and tagged `// Feature: maija-portfolio, Property N: ...`. Property 12 covers the pure CMS document-to-model mappers (`mapTimeline`/`mapPortfolio`/`mapBlog`).
- The CMS integration (Req 12) is split into pure mappers (property-tested via Property 12) and thin I/O (`sanityClient`, `useCmsResource`) covered by mocked-fetch state/timeout tests and a no-write-token static scan. The `src/data` modules are the CMS seed/authoring reference and test fixtures, not the runtime source.
- Web3Forms delivery (Req 13) is isolated in `src/lib/submitContact.ts` (single I/O boundary) and covered by mocked-fetch success/error/network/timeout tests plus an env-key static scan; ContactForm runs `validateContact` before ever calling it.
- Property tests validate the pure logic layer; example, edge-case, integration, and smoke tests cover styling, fixed content, routing, responsive layout, CMS fetch states, Web3Forms delivery, and setup/build.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1", "7.1"] },
    { "id": 2, "tasks": ["2.2", "3.1", "4.1", "4.4", "4.8", "6.1", "6.2", "6.4"] },
    { "id": 3, "tasks": ["3.2", "4.2", "4.3", "4.5", "4.6", "4.7", "4.9", "6.3", "7.2", "13.1"] },
    { "id": 4, "tasks": ["3.3", "3.4", "7.3", "7.4", "7.5", "13.2"] },
    { "id": 5, "tasks": ["3.5", "7.6", "8.1", "10.1", "11.1"] },
    { "id": 6, "tasks": ["8.2", "8.4"] },
    { "id": 7, "tasks": ["8.3", "8.5", "9.1", "10.2", "11.2", "12.1", "14.1", "14.2"] },
    { "id": 8, "tasks": ["9.2", "10.3", "11.3", "12.2", "12.3", "14.3"] },
    { "id": 9, "tasks": ["14.4", "15.1"] },
    { "id": 10, "tasks": ["15.2", "15.3", "16.1"] },
    { "id": 11, "tasks": ["16.2"] }
  ]
}
```
