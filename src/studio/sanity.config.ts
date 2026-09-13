// src/studio/sanity.config.ts — the shared Sanity Studio configuration.
//
// Reads the project ID and dataset from the Vite env vars (VITE_SANITY_*) so
// the Studio points at exactly the same project/dataset the read-only frontend
// client consumes. This config backs the Studio embedded at the `/studio`
// route (see Studio.tsx); the standalone `sanity` CLI uses studio/sanity.config.ts
// which mirrors these values from SANITY_STUDIO_* env vars.
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";

import { schemaTypes } from "./schemas";

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID ?? "";
const dataset = import.meta.env.VITE_SANITY_DATASET ?? "production";

export const sanityConfig = defineConfig({
  name: "maija-portfolio",
  title: "Maija Portfolio",

  // Serve the embedded Studio from the /studio route of the Vite app.
  basePath: "/studio",

  projectId,
  dataset,

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
});

export default sanityConfig;
