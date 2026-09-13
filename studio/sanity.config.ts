// studio/sanity.config.ts — standalone Sanity Studio v3 configuration.
//
// This config is used by the `sanity` CLI (e.g. `sanity dev` / `sanity deploy`)
// for a separately-hosted Studio. The Studio embedded in the Vite app at the
// `/studio` route uses src/studio/sanity.config.ts instead; BOTH share the same
// canonical schema definitions in src/studio/schemas so there is no drift.
//
// projectId/dataset come from SANITY_STUDIO_* env vars for the CLI. They should
// match VITE_SANITY_PROJECT_ID / VITE_SANITY_DATASET used by the app.
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'

import {schemaTypes} from '../src/studio/schemas'

export default defineConfig({
  name: 'maija-portfolio',
  title: 'Maija Portfolio',

  projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? '',
  dataset: process.env.SANITY_STUDIO_DATASET ?? 'production',

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
})
