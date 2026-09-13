// src/studio/schemas/portfolioCard.ts — Sanity document schema (canonical).
//
// Authoring surface for the Portfolio (Req 7). Primary fields: title, category,
// mainImage (uploaded image with hotspot), description, tags, externalLink.
// Legacy/optional fields (image, publication) are retained so previously
// authored documents keep working; the frontend prefers the uploaded mainImage
// and falls back to the legacy `image` string.
import { defineType, defineField } from "sanity";

export default defineType({
  name: "portfolioCard",
  title: "Portfolio Item",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      description: 'e.g. "Short Video", "Social Media", "Writing".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "mainImage",
      title: "Main Image",
      type: "image",
      description: "The cover image for this portfolio item.",
      options: { hotspot: true },
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      description: "A few descriptive tags used for filtering.",
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: "externalLink",
      title: "External Link",
      type: "url",
      description:
        "Optional link to the published work (e.g. article or video).",
      validation: (rule) => rule.uri({ scheme: ["http", "https"] }),
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

    // --- Optional / legacy fields ---
    defineField({
      name: "image",
      title: "Image (legacy path)",
      type: "string",
      description:
        "Legacy placeholder image path. Prefer uploading Main Image above.",
    }),
    defineField({
      name: "publication",
      title: "Publication",
      type: "string",
      description: "Optional publication attribution for written works.",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "category", media: "mainImage" },
  },
});
