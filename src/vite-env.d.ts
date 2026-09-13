/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SANITY_PROJECT_ID: string;
  readonly VITE_SANITY_DATASET: string;
  readonly VITE_WEB3FORMS_ACCESS_KEY: string;
  // Optional social / contact overrides (fall back to defaults in
  // src/config/site.ts when unset). Handles can be updated here without code
  // changes.
  readonly VITE_SOCIAL_LINKEDIN_URL?: string;
  readonly VITE_CONTACT_EMAIL?: string;
  readonly VITE_CONTACT_LOCATION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
