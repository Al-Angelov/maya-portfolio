// src/studio/schemas/educationEntry.ts — Sanity document schema (canonical).
//
// Authoring surface for the Resume "Career/Business" → Education section.
// One document per school/programme. Filtered by the active `language`.
import { defineType, defineField } from "sanity";

export default defineType({
  name: "educationEntry",
  title: "Education Entry",
  type: "document",
  fields: [
    defineField({
      name: "school",
      title: "School",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "degree",
      title: "Degree",
      type: "string",
      description: 'e.g. "Abitur".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "dateRange",
      title: "Date Range",
      type: "string",
      description: 'e.g. "2023 – 2026".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "activities",
      title: "Activities",
      type: "text",
      description: "Notable activities, roles, or achievements.",
    }),
    defineField({
      name: "language",
      title: "Language",
      type: "string",
      description: "Authoring language; the site shows entries matching the toggle.",
      options: {
        list: [
          { title: "EN", value: "EN" },
          { title: "FI", value: "FI" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: "school", subtitle: "degree" },
  },
});
