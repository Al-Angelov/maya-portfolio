// PortfolioPage — filterable work samples (Req 7). Consumes the CMS portfolio
// resource, renders a responsive grid of PortfolioCards, and supports tag
// filtering via the TagFilter control.
//
// Layout (Req 7.1, 11.2, 11.3): a Primary_Dark root (bg-primaryDark) layered
// with one or more decorative background placeholder frames rendered at reduced
// opacity (5%–20%). The card grid is single-column below 768px and 2–4 columns
// at ≥768px (grid-cols-1 md:grid-cols-2 lg:grid-cols-3).
//
// Data (Req 12.1, 12.3, 12.5): cards are obtained through
// `useCmsResource('portfolio')`. While loading a loading indicator is shown
// (role="status"). On error an error indication is shown (role="alert") and any
// retained/last-good cards are still rendered; when no prior cards exist the
// Req 7.9 empty placeholder is shown instead. On success the mapped
// PortfolioCardData[] is fed into `distinctTags`/`filterCards`.
//
// Filtering (Req 7.7, 7.8, 7.10): selecting a tag shows only matching cards;
// zero matches shows a "no items match" message (Req 7.9); clearing the filter
// restores the full set.

import { useState } from "react";

import PortfolioCard from "../components/PortfolioCard";
import TagFilter from "../components/TagFilter";
import { useCmsResource } from "../cms/useCmsResource";
import { distinctTags, filterCards } from "../lib/filterCards";
import type { PortfolioCardData } from "../lib/filterCards";
import { useI18n } from "../i18n/I18nProvider";

/** Path to the decorative background placeholder frame (Req 7.1). */
const BG_PLACEHOLDER = "/images/portfolio-bg-placeholder.svg";

/**
 * Render the responsive card grid, or the Req 7.9 empty/"no items match"
 * placeholder when `cards` is empty. Extracted so both the success and
 * error-with-retained-data paths render identically.
 */
function CardGrid({
  cards,
  emptyMessage,
}: {
  cards: PortfolioCardData[];
  emptyMessage: string;
}) {
  if (cards.length === 0) {
    return (
      <p className="text-warmIvory opacity-80">{emptyMessage}</p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <PortfolioCard key={card.id} card={card} />
      ))}
    </div>
  );
}

export default function PortfolioPage() {
  const { t, language } = useI18n();
  const [activeTag, setActiveTag] = useState<string | null>(null);
  // Filter portfolio items by the active language (EN shows EN, FI shows FI).
  const { status, data } = useCmsResource("portfolio", language);

  const emptyMessage = t("portfolio.empty");

  return (
    <section
      aria-labelledby="portfolio-heading"
      className="relative min-h-screen overflow-hidden bg-primaryDark"
    >
      {/* Decorative background placeholder frame(s) at reduced opacity (Req 7.1). */}
      <img
        src={BG_PLACEHOLDER}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-10"
      />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-6 py-16 md:px-12 md:py-24">
        <header className="flex flex-col gap-3">
          <p className="eyebrow text-warmIvory/50">{t("nav.portfolio")}</p>
          <h1
            id="portfolio-heading"
            className="text-4xl font-normal tracking-tight text-warmIvory md:text-6xl"
          >
            {t("nav.portfolio")}
          </h1>
        </header>

        <PortfolioBody
          status={status}
          data={data}
          activeTag={activeTag}
          onSelectTag={setActiveTag}
          emptyMessage={emptyMessage}
        />
      </div>
    </section>
  );
}

/**
 * The status-driven body of the Portfolio page. Split out from the page shell
 * so the loading/error/success branches read clearly.
 */
function PortfolioBody({
  status,
  data,
  activeTag,
  onSelectTag,
  emptyMessage,
}: {
  status: "loading" | "success" | "error";
  data: PortfolioCardData[] | null;
  activeTag: string | null;
  onSelectTag: (tag: string | null) => void;
  emptyMessage: string;
}) {
  // Loading: show a loading indicator (Req 12.3).
  if (status === "loading") {
    return (
      <p role="status" className="text-warmIvory opacity-80">
        Loading…
      </p>
    );
  }

  // Error: show a friendly (non-raw) error indication and render
  // retained/last-good cards, or the empty placeholder when no prior cards
  // exist (Req 12.5, 7.9). Raw API error strings are NEVER shown.
  if (status === "error") {
    const retained = data ?? [];
    const visible = filterCards(retained, activeTag);
    const tags = distinctTags(retained);
    return (
      <div className="flex flex-col gap-6">
        <p role="alert" className="text-warmIvory/70">
          Portfolio content is temporarily unavailable.
        </p>
        {retained.length > 0 ? (
          <>
            <TagFilter
              tags={tags}
              activeTag={activeTag}
              onSelect={onSelectTag}
            />
            <CardGrid cards={visible} emptyMessage={emptyMessage} />
          </>
        ) : (
          <p className="text-warmIvory opacity-80">{emptyMessage}</p>
        )}
      </div>
    );
  }

  // Success: feed the mapped cards into distinctTags/filterCards (Req 12.1).
  const cards = data ?? [];
  const tags = distinctTags(cards);
  const visible = filterCards(cards, activeTag);

  return (
    <div className="flex flex-col gap-6">
      <TagFilter tags={tags} activeTag={activeTag} onSelect={onSelectTag} />
      <CardGrid cards={visible} emptyMessage={emptyMessage} />
    </div>
  );
}
