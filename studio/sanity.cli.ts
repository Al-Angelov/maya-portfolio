// studio/sanity.cli.ts — config for the standalone Sanity CLI (`sanity dev`,
// `sanity build`, `sanity deploy`).
//
// projectId/dataset are read from SANITY_STUDIO_* env vars; set them to the same
// values as VITE_SANITY_PROJECT_ID / VITE_SANITY_DATASET used by the app. The
// embedded Studio at the app's /studio route does not use this file — it uses
// src/studio/sanity.config.ts and reads the VITE_SANITY_* vars directly.
import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? '',
    dataset: process.env.SANITY_STUDIO_DATASET ?? 'production',
  },
})
