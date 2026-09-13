// src/studio/schemas/skillsAndLanguages.ts — Sanity document schema (canonical).
//
// Authoring surface for the Resume "Career/Business" → Skills & Languages
// section. Typically ONE published document per language; the frontend uses the
// first one matching the active `language`.
import { defineType, defineField } from "sanity";

export default defineType({
  name: "skillsAndLanguages",
  title: "Skills & Languages",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: 'e.g. "Main Skills Profile".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "coreSkills",
      title: "Core Skills",
      type: "array",
      of: [{ type: "string" }],
      description: 'e.g. ["Scriptwriting", "Communication"].',
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: "spokenLanguages",
      title: "Spoken Languages",
      type: "array",
      of: [{ type: "string" }],
      description: 'e.g. ["Finnish (Native)", "English"].',
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: "language",
      title: "Language",
      type: "string",
      description: "Authoring language; the site shows the entry matching the toggle.",
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
    select: { title: "title" },
  },
});
