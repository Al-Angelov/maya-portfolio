// src/studio/schemas/blogEntry.ts — Sanity document schema (canonical).
//
// Authoring surface for the "On My Mind" Blog_Section (Req 8). `body` is
// Block Content (Portable Text) for rich text editing; the frontend mapper
// (src/cms/queries.ts) flattens it to plain text for rendering.
import { defineType, defineField } from "sanity";

export default defineType({
  name: "blogEntry",
  title: "Blog Entry",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "publishedDate",
      title: "Published Date",
      type: "date",
      description: 'ISO "YYYY-MM-DD" date (drives recency ordering).',
      options: { dateFormat: "YYYY-MM-DD" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      description: "Rich text body (Portable Text / Block Content).",
      of: [{ type: "block" }],
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
  ],
  preview: {
    select: { title: "title", subtitle: "publishedDate" },
  },
});
