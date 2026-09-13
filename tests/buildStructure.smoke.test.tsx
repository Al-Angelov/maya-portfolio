// Build and structure smoke tests (Req 1.1, 1.3, 1.5, 1.6).
//
// These lightweight checks guard the project's shippable shape without running
// an expensive full build inside the unit suite:
//
//   - Structure (Req 1.1): the top-level source directories `src/pages/`,
//     `src/components/`, `src/styles/`, and the static-asset directory
//     `public/` each exist and are non-empty (contain at least one real file,
//     ignoring the `.gitkeep` placeholders).
//   - Default route (Req 1.5): rendering <App/> at the root path "/" renders
//     the Info page (its introduction copy and LinkedIn link are present).
//   - Static build output (Req 1.3): when a `dist/` build directory already
//     exists it must contain only static files (HTML, CSS, JS, and static
//     assets) with no server-runtime artifacts. This test is skipped when no
//     `dist/` is present so the unit suite never triggers a slow build; the
//     `npm run build` verification is run separately (see the spec task report).
//
// The broken-launch non-zero-exit behaviour (Req 1.6) is Vite's default
// tooling behaviour and is verified via the terminal rather than the unit
// suite (running Vite as a child process here would be slow and flaky).

import { readdirSync, existsSync } from "node:fs";
import { resolve, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Importing <App/> pulls in every page module, including the CMS-backed pages
// whose `sanityClient` is created eagerly at import time and would throw
// without Sanity env vars configured. The "/" (Info) route never touches the
// CMS, so we stub the client module so createClient never runs during import.
vi.mock("../src/cms/sanityClient", () => ({
  sanityClient: { fetch: vi.fn(async () => []) },
}));

import App from "../src/App";
import { I18nProvider } from "../src/i18n/I18nProvider";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** Directory entries that are placeholders, not real content. */
const PLACEHOLDERS = new Set([".gitkeep"]);

/** Real (non-placeholder) entries in a directory. */
function realEntries(dir: string): string[] {
  return readdirSync(dir).filter((name) => !PLACEHOLDERS.has(name));
}

afterEach(() => {
  cleanup();
});

describe("project structure (Req 1.1)", () => {
  const requiredDirs = [
    "src/pages",
    "src/components",
    "src/styles",
    "public",
  ];

  for (const rel of requiredDirs) {
    it(`${rel}/ exists and is non-empty`, () => {
      const abs = resolve(projectRoot, rel);
      expect(existsSync(abs)).toBe(true);
      expect(realEntries(abs).length).toBeGreaterThan(0);
    });
  }
});

describe("default route (Req 1.5)", () => {
  it("renders the Info page at the root path '/'", () => {
    render(
      <I18nProvider>
        <MemoryRouter initialEntries={["/"]}>
          <App />
        </MemoryRouter>
      </I18nProvider>,
    );

    // The Info page's introduction copy is unique to InfoPage.
    const intro = screen.getByText(/Hello! Very nice to see you here/i);
    expect(intro).not.toBeNull();

    // And a LinkedIn link (Req 5.6/5.7) is present. The landing view now also
    // renders the global footer (which has its own LinkedIn social icon), so
    // there may be more than one — assert at least one exists.
    const links = screen.getAllByRole("link", { name: "LinkedIn" });
    expect(links.length).toBeGreaterThanOrEqual(1);
  });
});

describe("static build output (Req 1.3)", () => {
  const distDir = resolve(projectRoot, "dist");
  // Extensions considered "static files" servable without a runtime.
  const staticExts = new Set([
    ".html",
    ".css",
    ".js",
    ".mjs",
    ".map",
    ".json",
    ".svg",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".webp",
    ".avif",
    ".ico",
    ".woff",
    ".woff2",
    ".ttf",
    ".otf",
    ".eot",
    ".txt",
    ".xml",
    ".webmanifest",
  ]);

  // Recursively collect every file path under a directory.
  function walk(dir: string): string[] {
    const out: string[] = [];
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = resolve(dir, entry.name);
      if (entry.isDirectory()) out.push(...walk(full));
      else out.push(full);
    }
    return out;
  }

  const hasDist = existsSync(distDir);

  it.skipIf(!hasDist)(
    "dist/ contains only static files (html/css/js/assets)",
    () => {
      const files = walk(distDir);
      expect(files.length).toBeGreaterThan(0);

      const nonStatic = files.filter((f) => {
        // `.gitkeep` placeholders copied from public/ carry no extension and
        // are inert markers, not server-runtime artifacts.
        if (PLACEHOLDERS.has(f.split(/[\\/]/).pop() ?? "")) return false;
        return !staticExts.has(extname(f).toLowerCase());
      });
      expect(nonStatic).toEqual([]);

      // An index.html entrypoint must be present.
      expect(files.some((f) => f.toLowerCase().endsWith("index.html"))).toBe(
        true,
      );
    },
  );
});
