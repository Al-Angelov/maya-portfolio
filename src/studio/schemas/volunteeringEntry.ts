// src/studio/schemas/volunteeringEntry.ts — Sanity document schema (canonical).
//
// Authoring surface for the Resume "Career/Business" → Volunteering section.
// One document per volunteering role. Filtered by the active `language`.
import { defineType, defineField } from "sanity";

export default defineType({
  name: "volunteeringEntry",
  title: "Volunteering Entry",
  type: "document",
  fields: [
    defineField({
      name: "role",
      title: "Role",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "organization",
      title: "Organization",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "dateRange",
      title: "Date Range",
      type: "string",
      description: 'e.g. "Aug 2023".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      validation: (rule) => rule.required(),
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
    select: { title: "role", subtitle: "organization" },
  },
});
