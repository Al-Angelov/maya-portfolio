/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The base path is configurable so the site can be hosted at a subpath
// (e.g. GitHub Pages project sites) via the VITE_BASE environment variable.
// Defaults to "/" for root hosting (e.g. Vercel).
export default defineConfig({
  base: process.env.VITE_BASE ?? "/",
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/**/*.{test,spec}.{ts,tsx}", "src/**/*.{test,spec}.{ts,tsx}"],
  },
});
