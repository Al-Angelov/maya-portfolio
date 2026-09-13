// src/studio/schemas/timelineEntry.ts — Sanity document schema (canonical).
//
// Authoring surface for the Resume Timeline (Req 6). Primary fields: title,
// role, venue, year, category, language. Optional/legacy fields (production,
// premiere, order) are retained so previously-authored documents and the
// frontend's ordering keep working. This lives under src/ so the embedded
// Studio route type-checks with the app; the standalone `sanity` CLI config
// re-imports it.
import { defineType, defineField } from "sanity";

export default defineType({
  name: "timelineEntry",
  title: "Timeline Entry",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: 'The production / work title, e.g. "Hölmöläisiä".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "role",
      title: "Role",
      type: "string",
      description:
        'e.g. "Pentti", "Background Actor", "Director & Writer". May be empty.',
    }),
    defineField({
      name: "venue",
      title: "Venue / Company",
      type: "string",
      description: "Venue or company. May be empty.",
    }),
    defineField({
      name: "year",
      title: "Year",
      type: "string",
      description: 'e.g. "2019", or a range like "2023 – 2026".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Theatre", value: "Theatre" },
          { title: "Film & TV", value: "Film & TV" },
          { title: "Directing & Writing", value: "Directing & Writing" },
          { title: "Career/Business", value: "Career/Business" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "language",
      title: "Language",
      type: "string",
      description: "Authoring language; EN treated as default.",
      options: {
        list: [
          { title: "EN", value: "EN" },
          { title: "FI", value: "FI" },
        ],
        layout: "radio",
      },
    }),

    // --- Optional / legacy fields (kept for back-compat + ordering) ---
    defineField({
      name: "premiere",
      title: "Premiere",
      type: "string",
      description: 'e.g. "November 2026" — Directing & Writing only. Optional.',
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      description: "Within-category ordering (ascending). Optional.",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "category" },
  },
});
