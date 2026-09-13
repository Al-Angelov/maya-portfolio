// BlogPage — the "On My Mind" page (Req 8). Rendered at "/on-my-mind".
//
// Layout (Req 8.1, 8.2): a Sweet_Pink root background (bg-sweetPink) with
// Primary_Dark text (text-primaryDark). Entries render as a single-column
// vertical list with consistent spacing (flex-col gap-…), each an <article>
// showing the title, publication date, and body.
//
// Data (Req 8.3, 8.5, 12.1, 12.3, 12.5): entries are obtained through
// `useCmsResource('blog')` and ordered most-recent-first via
// `sortBlogByRecency`. While loading a loading indicator is shown
// (role="status"). On error an error indication is shown (role="alert") and any
// retained/last-good entries are still rendered; when no prior entries exist
// the Req 8.6 "no posts currently available" placeholder is shown instead.
//
// Empty state (Req 8.4, 8.6): when there are simply no entries, the same
// placeholder (`blog.empty`) is shown.

import { useCmsResource } from "../cms/useCmsResource";
import { sortBlogByRecency, type BlogEntry } from "../lib/sortBlog";
import { useI18n } from "../i18n/I18nProvider";

/**
 * Atmospheric nature banner behind the top of the page — the sunset/nature
 * foliage shot (served from public/images at the site root).
 */
const BANNER_IMAGE = "/images/info-bg.jpg";

/**
 * Format an ISO "YYYY-MM-DD" publication date for display. Falls back to the
 * raw string if it cannot be parsed so a malformed date never blanks the entry.
 */
function formatPublishedDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Render the ordered list of blog entries, or the Req 8.6 placeholder when
 * `entries` is empty. Extracted so the success and error-with-retained-data
 * paths render identically.
 */
function BlogList({
  entries,
  emptyMessage,
}: {
  entries: BlogEntry[];
  emptyMessage: string;
}) {
  if (entries.length === 0) {
    return <p className="opacity-70">{emptyMessage}</p>;
  }

  return (
    <div className="flex flex-col gap-10">
      {entries.map((entry) => (
        <article
          key={entry.id}
          className="flex flex-col gap-4 border border-primaryDark/15 bg-warmIvory/60 p-8 md:p-10"
        >
          <time
            dateTime={entry.publishedDate}
            className="eyebrow text-primaryDark/50"
          >
            {formatPublishedDate(entry.publishedDate)}
          </time>
          <h2 className="text-2xl font-normal tracking-tight md:text-3xl">
            {entry.title}
          </h2>
          <p className="max-w-2xl whitespace-pre-line leading-relaxed text-primaryDark/80">
            {entry.body}
          </p>
        </article>
      ))}
    </div>
  );
}

export default function BlogPage() {
  const { t, language } = useI18n();
  // Filter blog entries by the active language (EN shows EN, FI shows FI).
  const { status, data } = useCmsResource("blog", language);

  const emptyMessage = t("blog.empty");

  return (
    <section
      aria-labelledby="blog-heading"
      className="relative min-h-screen overflow-hidden bg-sweetPink text-primaryDark"
    >
      {/* --------------------------------------------------------------
          Atmospheric nature banner across the top. The hero image is set as a
          muted texture behind a heavy Sweet_Pink scrim, then masked with a
          gradient so it fades gracefully into the solid Sweet_Pink background
          before the header and blog cards begin. Purely decorative.
          -------------------------------------------------------------- */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[45vh] bg-cover bg-center bg-no-repeat opacity-60 [mask-image:linear-gradient(to_bottom,black_0%,black_35%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_0%,black_35%,transparent_100%)]"
        style={{ backgroundImage: `url(${BANNER_IMAGE})` }}
      />
      {/* Sweet_Pink wash over the banner: lighter at the very top so the sunset
          foliage stays visible, deepening to fully opaque Sweet_Pink at the
          bottom so the image blends seamlessly into the page background. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[45vh] bg-gradient-to-b from-sweetPink/40 via-sweetPink/75 to-sweetPink"
      />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col gap-10 px-6 py-16 md:px-12 md:py-24">
        <header className="flex flex-col gap-3">
          <p className="eyebrow text-primaryDark/50">{t("nav.blog")}</p>
          <h1
            id="blog-heading"
            className="text-4xl font-normal tracking-tight md:text-6xl"
          >
            {t("nav.blog")}
          </h1>
        </header>

        <BlogBody status={status} data={data} emptyMessage={emptyMessage} />
      </div>
    </section>
  );
}

/**
 * The status-driven body of the On My Mind page. Split out from the page shell
 * so the loading/error/success branches read clearly.
 */
function BlogBody({
  status,
  data,
  emptyMessage,
}: {
  status: "loading" | "success" | "error";
  data: BlogEntry[] | null;
  emptyMessage: string;
}) {
  // Loading: show a loading indicator (Req 12.3).
  if (status === "loading") {
    return (
      <p role="status" className="opacity-70">
        Loading…
      </p>
    );
  }

  // Error: show a friendly (non-raw) error indication and render
  // retained/last-good entries, or the Req 8.6 placeholder when no prior
  // entries exist (Req 12.5, 8.6). Raw API error strings are NEVER shown.
  if (status === "error") {
    const retained = sortBlogByRecency(data ?? []);
    return (
      <div className="flex flex-col gap-8">
        <p role="alert" className="text-primaryDark/70">
          Posts are temporarily unavailable.
        </p>
        <BlogList entries={retained} emptyMessage={emptyMessage} />
      </div>
    );
  }

  // Success: order most-recent-first and render the list, or the Req 8.4/8.6
  // placeholder when there are no entries (Req 8.3, 12.1).
  const entries = sortBlogByRecency(data ?? []);
  return <BlogList entries={entries} emptyMessage={emptyMessage} />;
}
