// Feature: maija-portfolio
//
// Timeline (Req 6.6–6.9). Presentational component that renders the provided
// TimelineCategory[] in the order it receives them — the caller (ResumePage)
// supplies the CMS-sourced categories already ordered Theatre → TV & Film →
// Directing & Writing (Req 6.9). This component does NOT import the seed data;
// it consumes the categories via props so the runtime source stays the CMS.
//
// Each entry shows role (omitted when empty), production, venue/company, year,
// and — for the Directing & Writing entry — the premiere date (Req 6.6–6.8).

import type { TimelineCategory, TimelineEntry } from "../data/timeline";

export interface TimelineProps {
  categories: TimelineCategory[];
}

function TimelineEntryRow({ entry }: { entry: TimelineEntry }) {
  return (
    <li className="grid grid-cols-[3.5rem_1fr] gap-x-6 border-b border-primaryDark/10 py-5 last:border-b-0 md:grid-cols-[5rem_1fr]">
      {/* Year sits in a fixed left rail for a clean editorial ledger feel. */}
      <span className="pt-1 text-sm tabular-nums text-primaryDark/50">
        {entry.year}
      </span>

      <div>
        <p className="text-lg leading-snug text-primaryDark md:text-xl">
          <span className="italic">{entry.production}</span>
          {entry.role ? (
            <span className="text-primaryDark/60"> — {entry.role}</span>
          ) : null}
        </p>
        {entry.venue ? (
          <p className="mt-1 text-sm text-primaryDark/60">{entry.venue}</p>
        ) : null}
        {entry.premiere ? (
          <p className="mt-1 text-sm uppercase tracking-[0.12em] text-primaryDark/60">
            Premiere: {entry.premiere}
          </p>
        ) : null}
      </div>
    </li>
  );
}

export default function Timeline({ categories }: TimelineProps) {
  return (
    <div className="space-y-10">
      {categories.map((category) => (
        <section
          key={category.label}
          className="bg-warmIvory p-8 text-primaryDark md:p-12"
        >
          <h3 className="mb-6 border-b border-primaryDark/20 pb-3 text-sm uppercase tracking-[0.2em] text-primaryDark/70">
            {category.label}
          </h3>
          <ul>
            {category.entries.map((entry, index) => (
              <TimelineEntryRow key={`${entry.production}-${index}`} entry={entry} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
