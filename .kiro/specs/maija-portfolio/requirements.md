# Requirements Document

## Introduction

This document defines the requirements for **Maija Portfolio**, a high-end, minimalistic, professional multi-page personal portfolio and CV website for Maija, a Helsinki-based student, short video editor, social media manager, writer, and performer. The website presents Maija's professional identity across five pages (Info, Resume, Portfolio, On My Mind, Contact me), follows a strict Nordic-editorial design system, supports English as the primary language with a prepared Finnish toggle, and is optimized for static deployment (GitHub Pages / Vercel).

Dynamic content (the resume timeline, portfolio cards, and On My Mind blog entries) is managed by Maija through the Sanity.io headless CMS rather than being hardcoded, so she can edit and publish content without code changes. The site still builds and deploys as a static React application; it fetches CMS content at runtime. Contact form submissions are delivered through Web3Forms, a third-party service that routes messages directly to Maija's email without a custom backend.

The immediate deliverable is a modular folder structure with core component files that Maija can inspect and launch locally.

## Glossary

- **Portfolio_Site**: The complete multi-page personal portfolio and CV web application.
- **Top_Bar**: The fixed/sticky navigation bar rendered on every page in Sweet Pink with dark text.
- **Language_Toggle**: The UI control in the Top_Bar that switches the interface language between English (EN) and Finnish (FI).
- **Info_Page**: The landing page presenting Maija's introduction, photo frame, and professional social link.
- **Resume_Section**: The page presenting Maija's performer and career/business background, including a timeline.
- **Timeline_Component**: The structured component within the Resume_Section that displays dated career entries grouped by category.
- **Portfolio_Section**: The page showcasing video editing projects, social media case studies, and written works as filterable cards.
- **Blog_Section**: The "On My Mind" page presenting editorial thoughts, upcoming projects, and short-form commentary.
- **Contact_Section**: The page containing the contact form, submit control, and footer with social links.
- **Contact_Form**: The form within the Contact_Section collecting name, phone number, email, and message.
- **Design_System**: The defined set of colors, typography, and layout rules the Portfolio_Site must adhere to.
- **Primary_Dark**: The color `#141414`, used for main backgrounds and dark text.
- **Sweet_Pink**: The color `#F5CBDA`, used for the Top_Bar, section accents, and Blog/Contact backgrounds.
- **Warm_Ivory**: The color `#FFF4EC`, used for card and text-box backgrounds.
- **EN**: The English language mode, fully implemented.
- **FI**: The Finnish language mode, prepared via the Language_Toggle for future full implementation.
- **CMS**: The Sanity.io headless CMS that stores Maija's editable content, including Timeline_Component entries, Portfolio_Section cards, and Blog_Section entries.
- **Form_Delivery_Service**: Web3Forms, the third-party service that delivers Contact_Form submissions to Maija's email.

## Requirements

### Requirement 1: Project Structure and Local Launch

**User Story:** As Maija, I want a modular project folder structure with core component files, so that I can inspect the code and launch the site locally.

#### Acceptance Criteria

1. THE Portfolio_Site SHALL be organized into a folder structure containing separate top-level directories for pages, shared components, styles, and static assets, with each directory containing at least one corresponding file.
2. THE Portfolio_Site SHALL include a single documented command that starts a local development server and makes the site reachable on a local host address within 60 seconds of the command being issued.
3. THE Portfolio_Site SHALL produce a static build output consisting of only static files (HTML, CSS, JavaScript, and static assets) that can be served without a server-side runtime.
4. THE Portfolio_Site SHALL include a README file that documents the name and purpose of each top-level directory and provides the exact local launch command.
5. WHEN the local development server is started and the site is opened at its root path, THE Portfolio_Site SHALL render the Info_Page as the default route.
6. IF the documented local launch command fails to start the development server, THEN THE Portfolio_Site SHALL cause the command to return a non-zero exit status accompanied by an error message indicating the cause of the failure.

### Requirement 2: Design System Compliance

**User Story:** As Maija, I want the site to follow a consistent Nordic-editorial design system, so that the site looks high-end, minimalistic, and professional.

#### Acceptance Criteria

1. WHEN the Portfolio_Site renders any main background or dark text, THE Portfolio_Site SHALL apply the color `#141414` as the Primary_Dark color.
2. WHEN the Portfolio_Site renders the Top_Bar, section accents, or the Blog_Section and Contact_Section backgrounds, THE Portfolio_Site SHALL apply the color `#F5CBDA` as the Sweet_Pink color.
3. WHEN the Portfolio_Site renders a card background or a text-box background positioned under text, THE Portfolio_Site SHALL apply the color `#FFF4EC` as the Warm_Ivory color.
4. WHEN the Portfolio_Site renders any text element, THE Portfolio_Site SHALL apply the font family "Bookman Old Style", serif as the first-choice font.
5. IF the "Bookman Old Style" font fails to load or is unavailable, THEN THE Portfolio_Site SHALL render text using the fallback font Georgia, serif for every affected text element.
6. THE Design_System SHALL define each color value (`#141414`, `#F5CBDA`, `#FFF4EC`) and the typography values exactly once in a single shared definition, such that no color hex value or font-family declaration is redeclared as a literal in any other location.

### Requirement 3: Navigation Top Bar

**User Story:** As a visitor, I want a persistent navigation bar, so that I can move between all pages of the site from anywhere.

#### Acceptance Criteria

1. THE Top_Bar SHALL be rendered on every page of the Portfolio_Site.
2. WHILE the visitor scrolls the page content, THE Top_Bar SHALL remain fixed at the top of the viewport and remain fully visible.
3. THE Top_Bar SHALL use the Sweet_Pink background color with Primary_Dark text.
4. THE Top_Bar SHALL display exactly five navigation links in the left-to-right order: Info, Resume, Portfolio, On My Mind, Contact me.
5. WHEN a visitor selects a navigation link, THE Portfolio_Site SHALL display the page corresponding to that link and update the Top_Bar to indicate the selected link as active.
6. THE Top_Bar SHALL display the Language_Toggle as a control exposing exactly two selectable values labeled "EN" and "FI".
7. WHEN a visitor selects a value on the Language_Toggle, THE Portfolio_Site SHALL display all navigation link labels and page content in the selected language.

### Requirement 4: Language Toggle

**User Story:** As a visitor, I want to switch the interface language between English and Finnish, so that I can read the site in my preferred language.

#### Acceptance Criteria

1. WHEN a visitor loads the Portfolio_Site for the first time with no previously stored language preference, THE Portfolio_Site SHALL display all user-facing content in EN.
2. THE Language_Toggle SHALL present exactly two selectable options labeled EN and FI, with the option matching the currently active language indicated as selected.
3. WHEN a visitor selects a language option, THE Portfolio_Site SHALL update all displayed user-facing text to the selected language within 1 second.
4. WHEN a visitor selects a language option, THE Portfolio_Site SHALL persist the selected language as the active preference and apply it on subsequent page loads within the same browser session.
5. THE Portfolio_Site SHALL store all user-facing text in a structured translation resource keyed by language code (EN, FI), so that FI translations can be added without changing component logic.
6. IF a FI translation for a text entry is absent when FI is the active language, THEN THE Portfolio_Site SHALL display the EN text for that entry.

### Requirement 5: Info Page (Landing)

**User Story:** As a visitor, I want a welcoming landing page, so that I can quickly learn who Maija is and reach her professional profile.

#### Acceptance Criteria

1. THE Info_Page SHALL use the Primary_Dark background color.
2. THE Info_Page SHALL display a nature-themed placeholder overlay on the background.
3. THE Info_Page SHALL display the introduction copy inside a content box using the Warm_Ivory background with Primary_Dark text.
4. THE Info_Page SHALL display the introduction copy beginning with the text "Hello! Very nice to see you here" and ending with the signature "Maija".
5. THE Info_Page SHALL display a placeholder image frame reserved for a professional photo.
6. THE Info_Page SHALL display a clickable LinkedIn logo icon.
7. WHEN a visitor selects the LinkedIn logo icon, THE Portfolio_Site SHALL open Maija's professional social profile link in a new browser tab.
8. IF Maija's professional social profile link is unavailable or not configured, THEN THE Info_Page SHALL render the LinkedIn logo icon in a non-clickable state and SHALL NOT navigate away from the Info_Page.

### Requirement 6: Resume Section

**User Story:** As a visitor, I want to view Maija's performer background and career timeline, so that I can understand her professional experience.

#### Acceptance Criteria

1. THE Resume_Section SHALL use the Sweet_Pink background wrapper.
2. THE Resume_Section SHALL display the performer sub-section content inside Warm_Ivory containers.
3. THE Resume_Section SHALL display the "As a Performer" introduction copy.
4. THE Resume_Section SHALL display a tab labeled "Performer" and a tab labeled "Career/Business", with the "Performer" tab active by default on initial load.
5. WHEN a visitor selects the Career/Business tab, THE Resume_Section SHALL display career/business content consisting of a heading and a message indicating that this content is not yet available.
6. THE Timeline_Component SHALL display a category labeled "Theatre" containing exactly the following five entries in this order, each showing role, production, venue, and year: (1) "Ruma ankanpoikanen", Mustasaaren kesäteatteri, 2018; (2) Pentti, "Hölmöläisiä", Mustasaaren kesäteatteri, 2019; (3) Kilpikonna Albert, "Sirkuseläinten vallankumous", Falkullan eläintilan kesäteatteri, 2020; (4) Lady Agatha, "Perintö", Pukinmäen taidekoulujen teatteriryhmän kuunnelma, 2021; (5) Axel Candelberg, "Labyrintti", Pukinmäen taidekoulujen teatteriryhmän lopputyö, 2023.
7. THE Timeline_Component SHALL display a category labeled "TV & Film" containing exactly the following three entries in this order, each showing role, production, company, and year: (1) Background Actor, "Taivaan kansalaiset", Just Republic, 2026; (2) Minor Role, "Otava Brand Film", Otava Media Oy, 2026; (3) Background Actor, "Battery Commercial", Inspiroiva Creative Oy, 2026.
8. THE Timeline_Component SHALL display a category labeled "Directing & Writing" containing exactly one entry showing role "Director & Writer", production "You Will Never Walk Alone (Independent Production)", year 2026, and premiere date November 2026.
9. WHILE the Performer tab is active, THE Timeline_Component SHALL display the three categories in this order: "Theatre", "TV & Film", "Directing & Writing".

### Requirement 7: Portfolio Section

**User Story:** As a visitor, I want to browse Maija's work samples, so that I can evaluate her video editing, social media, and writing skills.

#### Acceptance Criteria

1. THE Portfolio_Section SHALL use the Primary_Dark background with one or more background image placeholder frames rendered at reduced opacity between 5% and 20%.
2. WHILE the viewport width is 768 pixels or greater, THE Portfolio_Section SHALL display work items in a grid layout of 2 to 4 cards per row.
3. WHILE the viewport width is less than 768 pixels, THE Portfolio_Section SHALL display work items in a single-column grid layout of 1 card per row.
4. THE Portfolio_Section SHALL display cards representing short video editing projects, social media management case studies, and written works.
5. THE Portfolio_Section SHALL display cards referencing written works published in Helsingin Sanomat and Pärskeitä.
6. THE Portfolio_Section SHALL display each card with one placeholder image frame, a text description of up to 300 characters, and between 1 and 5 tags.
7. THE Portfolio_Section SHALL display one tag filter control for each distinct tag present across the displayed cards.
8. WHEN a visitor selects a tag filter, THE Portfolio_Section SHALL display only the cards associated with the selected tag and hide all other cards.
9. IF a selected tag filter matches zero cards, THEN THE Portfolio_Section SHALL display a message indicating that no work items match the selected filter.
10. WHEN a visitor clears the active tag filter, THE Portfolio_Section SHALL display all cards.

### Requirement 8: On My Mind (Blog) Section

**User Story:** As a visitor, I want to read Maija's recent thoughts and upcoming projects, so that I can follow her current activities.

#### Acceptance Criteria

1. THE Blog_Section SHALL use the Sweet_Pink background color.
2. THE Blog_Section SHALL present each entry with a title, a publication date, and body text, arranged in a single-column vertical list with consistent spacing between entries.
3. THE Blog_Section SHALL display between 3 and 12 entries, ordered from most recent publication date to oldest.
4. THE Blog_Section SHALL display an entry referencing the November 2026 movie premiere, including its title and publication date.
5. THE Blog_Section SHALL display an entry referencing autumn networking events, including its title and publication date.
6. IF no entries are available, THEN THE Blog_Section SHALL display a placeholder message indicating that no posts are currently available.

### Requirement 9: Contact Section

**User Story:** As a visitor, I want to send Maija a message through a contact form, so that I can reach her professionally.

#### Acceptance Criteria

1. THE Contact_Section SHALL use the Sweet_Pink background color.
2. THE Contact_Section SHALL display the Contact_Form inside a Warm_Ivory card container.
3. THE Contact_Form SHALL display exactly four input fields labeled Name, Phone Number, Email, and Message.
4. WHERE the selected language is FI, THE Contact_Form SHALL display the field labels as Nimi, Puhelinnumero, Sähköposti, and Miten voin auttaa?; WHERE the selected language is EN, THE Contact_Form SHALL display the field labels as Name, Phone Number, Email, and Message.
5. THE Contact_Form SHALL display a submit button using the Primary_Dark background with Warm_Ivory text, labeled "Send" WHERE the selected language is EN and "Lähetä" WHERE the selected language is FI.
6. WHEN a visitor submits the Contact_Form with the Email field containing a value that does not contain a single "@" character with at least one non-empty character before it and at least one non-empty character and one "." after it, THE Contact_Form SHALL display a validation message indicating the email is invalid, SHALL NOT submit, and SHALL retain all entered field values.
7. WHEN a visitor submits the Contact_Form with the Name, Email, or Message field empty or containing only whitespace, THE Contact_Form SHALL display a validation message identifying each empty required field, SHALL NOT submit, and SHALL retain all entered field values.
8. WHEN a visitor submits the Contact_Form with the Name, Email, and Message fields all non-empty and the Email field valid, THE Contact_Section SHALL display a confirmation message that the message was submitted within 3 seconds.
9. IF submission of a valid Contact_Form fails, THEN THE Contact_Section SHALL display an error message indicating the message was not sent and SHALL retain all entered field values.

### Requirement 10: Footer

**User Story:** As a visitor, I want a footer with social links and copyright, so that I can find additional ways to connect and identify site ownership.

#### Acceptance Criteria

1. THE Contact_Section SHALL display a footer at the bottom of the page below the Contact_Form.
2. THE footer SHALL display at least two social links, including a LinkedIn link to Maija's professional profile.
3. WHEN a visitor selects a social link in the footer, THE Portfolio_Site SHALL open the corresponding social profile link.
4. THE footer SHALL display a copyright notice containing the name "Maija" and a copyright year.

### Requirement 11: Responsive Layout

**User Story:** As a visitor on any device, I want the site to adapt to my screen size, so that I can use it comfortably on mobile, tablet, and desktop.

#### Acceptance Criteria

1. WHILE the viewport width is 767 pixels or less, THE Portfolio_Site SHALL present navigation and page content in a single-column layout.
2. WHILE the viewport width is between 768 and 1023 pixels inclusive, THE Portfolio_Section SHALL present cards in a grid of at least two columns.
3. WHILE the viewport width is 1024 pixels or greater, THE Portfolio_Section SHALL present cards in a grid of three or more columns.
4. THE Portfolio_Site SHALL apply the Design_System colors (Primary_Dark `#141414`, Sweet_Pink `#F5CBDA`, Warm_Ivory `#FFF4EC`) and the Design_System typography identically at all viewport widths from 320 pixels and greater.

### Requirement 12: Content Management (CMS)

**User Story:** As Maija, I want to manage my timeline, portfolio, and blog content through a headless CMS, so that I can edit and publish content myself without changing code or redeploying the site.

#### Acceptance Criteria

1. THE Portfolio_Site SHALL source the Timeline_Component entries, the Portfolio_Section cards, and the Blog_Section entries from the CMS.
2. WHEN CMS content is updated and published, THE Portfolio_Site SHALL reflect the updated content on the next page load or content fetch, within 60 seconds of publication, without requiring a code change or redeployment.
3. WHILE CMS content for a section is being fetched, THE relevant section SHALL display a loading indicator until the fetch resolves or fails.
4. IF a CMS content fetch does not complete successfully within 10 seconds, THEN THE relevant section SHALL treat the fetch as failed.
5. IF a CMS fetch fails, THEN THE relevant section SHALL display an error indication conveying that content could not be loaded, SHALL retain any previously loaded content for that section, and SHALL fall back to the empty-state placeholders defined for the Blog_Section (Requirement 8, criterion 6) and the Portfolio_Section (Requirement 7, criterion 9) when no previously loaded content exists.
6. THE CMS integration SHALL use read-only public content access suitable for a static client, such that no secret write token is included in the client bundle.
7. THE Timeline_Component, Portfolio_Section, and Blog_Section content values specified in Requirements 6, 7, and 8 SHALL be represented as the initial seed content authored in the CMS, such that those content requirements continue to hold.

### Requirement 13: Contact Form Delivery (Web3Forms)

**User Story:** As a visitor, I want my contact message delivered reliably to Maija without a custom backend, so that I can reach her professionally through the site.

#### Acceptance Criteria

1. WHEN a visitor submits a valid Contact_Form, THE Portfolio_Site SHALL send the submission to the Form_Delivery_Service within 1 second of submission, and the Form_Delivery_Service SHALL route the submission to Maija's configured email address.
2. THE Portfolio_Site SHALL obtain the Form_Delivery_Service access key from an environment variable or external configuration source, such that the access key value does not appear as a hardcoded literal within component logic.
3. WHEN the Form_Delivery_Service confirms successful delivery within 10 seconds of the request, THE Contact_Section SHALL display the success confirmation message defined in Requirement 9, criterion 8.
4. IF the Form_Delivery_Service returns an error response, THEN THE Contact_Section SHALL display the failure error message defined in Requirement 9, criterion 9, and SHALL retain all entered field values unchanged.
5. IF the request to the Form_Delivery_Service does not complete within 10 seconds or fails due to a network error, THEN THE Contact_Section SHALL display the failure error message defined in Requirement 9, criterion 9, and SHALL retain all entered field values unchanged.
6. WHEN a visitor submits the Contact_Form, THE Contact_Form SHALL run the client-side validation defined in Requirement 9, criteria 6 and 7, before sending any submission to the Form_Delivery_Service.
7. IF the client-side validation defined in Requirement 9, criteria 6 and 7, fails, THEN THE Contact_Form SHALL NOT send any submission to the Form_Delivery_Service.
