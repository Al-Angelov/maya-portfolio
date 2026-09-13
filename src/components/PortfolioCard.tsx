// PortfolioCard: presentational card for a single portfolio work (Req 7.6).
//
// Renders exactly one placeholder image frame, the card's description, and the
// card's tags (rendered as chips). Uses the Warm_Ivory card background and
// Design_System Tailwind tokens; holds no state and performs no I/O.

import type { PortfolioCardData } from "../lib/filterCards";

export interface PortfolioCardProps {
  card: PortfolioCardData;
}

/**
 * Render a single portfolio card: one image placeholder frame, the description
 * text, and the card's tags as chips (Req 7.6). Purely presentational.
 */
export function PortfolioCard({ card }: PortfolioCardProps) {
  const hasLink =
    typeof card.externalLink === "string" && card.externalLink.trim().length > 0;

  // The image is only rendered when a source is present (uploaded mainImage or
  // legacy placeholder path); an empty string means "no image yet".
  const imageEl = card.imagePlaceholder ? (
    <div className="aspect-[4/3] w-full overflow-hidden bg-primaryDark/5">
      <img
        src={card.imagePlaceholder}
        alt={card.title ?? card.description}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
      />
    </div>
  ) : null;

  return (
    <article className="group flex flex-col overflow-hidden border border-warmIvory/20 bg-warmIvory text-primaryDark transition-colors duration-200 hover:border-warmIvory/50">
      {/* Full-width image frame — links to the external work when available. */}
      {hasLink && imageEl ? (
        <a
          href={card.externalLink}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={card.title ?? card.description}
        >
          {imageEl}
        </a>
      ) : (
        imageEl
      )}

      {/* Generous padding around the card body. */}
      <div className="flex flex-1 flex-col gap-3 p-7">
        {/* Category / publication kicker. */}
        {card.publication ? (
          <p className="eyebrow text-primaryDark/50">{card.publication}</p>
        ) : card.category ? (
          <p className="eyebrow text-primaryDark/50">{card.category}</p>
        ) : null}

        {/* Optional work title. */}
        {card.title ? (
          <h3 className="text-xl font-semibold tracking-tight">
            {hasLink ? (
              <a
                href={card.externalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-opacity hover:opacity-70"
              >
                {card.title}
              </a>
            ) : (
              card.title
            )}
          </h3>
        ) : null}

        <p className="text-base leading-relaxed">{card.description}</p>

        {/* Tags rendered as understated, bordered chips (Req 7.6). */}
        <ul className="mt-auto flex flex-wrap gap-2 pt-2" aria-label="Tags">
          {card.tags.map((tag) => (
            <li
              key={tag}
              className="border border-primaryDark/25 px-3 py-1 text-xs uppercase tracking-[0.1em] text-primaryDark/70"
            >
              {tag}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export default PortfolioCard;
