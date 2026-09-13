// TagFilter: presentational tag filter controls for the Portfolio page
// (Req 7.7). Renders one filter control per distinct tag (the parent passes
// `distinctTags(cards)`), marks the active one, and renders a "clear"/"All"
// control. Selecting a tag calls `onSelect(tag)`; the clear control calls
// `onSelect(null)`. Holds no state and performs no I/O.

import { useI18n } from "../i18n/I18nProvider";

export interface TagFilterProps {
  /** Distinct tags to render a control for; parent passes `distinctTags(cards)`. */
  tags: string[];
  /** The currently active tag, or null when the filter is cleared. */
  activeTag: string | null;
  /** Invoked with a tag to filter by, or null to clear the filter. */
  onSelect: (tag: string | null) => void;
}

/**
 * Render the clear/"All" control plus one control per distinct tag (Req 7.7).
 * The control matching `activeTag` (or the clear control when `activeTag` is
 * null) is marked active via `aria-pressed`. Purely presentational.
 */
export function TagFilter({ tags, activeTag, onSelect }: TagFilterProps) {
  const { t } = useI18n();

  const baseClasses =
    "rounded-full px-3 py-1 text-sm text-primaryDark transition-opacity";
  const activeClasses = "bg-sweetPink";
  const inactiveClasses = "bg-warmIvory opacity-80 hover:opacity-100";

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Tag filter">
      {/* Clear / "All" control: resets the filter (Req 7.10). */}
      <button
        type="button"
        aria-pressed={activeTag === null}
        onClick={() => onSelect(null)}
        className={`${baseClasses} ${activeTag === null ? activeClasses : inactiveClasses}`}
      >
        {t("portfolio.filter.clear")}
      </button>

      {/* One control per distinct tag (Req 7.7). */}
      {tags.map((tag) => (
        <button
          key={tag}
          type="button"
          aria-pressed={activeTag === tag}
          onClick={() => onSelect(tag)}
          className={`${baseClasses} ${activeTag === tag ? activeClasses : inactiveClasses}`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}

export default TagFilter;
