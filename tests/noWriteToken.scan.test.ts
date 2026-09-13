// Feature: maija-portfolio — no-write-token static scan (Req 12.6)
//
// Requirement 12.6: the CMS integration SHALL use read-only public content
// access suitable for a static client, such that no secret write token is
// included in the client bundle.
//
// This static scan asserts:
//   1. `src/cms/sanityClient.ts` configures NO `token` key — the createClient
//      call must not pass a write token.
//   2. No file under `src/` references a write-capable Sanity token: no active
//      `token:` config key and no SANITY_WRITE_TOKEN / write-token env var.
//
// Because the site bundles everything under `src/`, any token literal or write
// token env reference there would ship a secret to the client — exactly what
// Req 12.6 forbids. Comments that merely explain the omission are allowed.

import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const projectRoot = process.cwd();
const srcRoot = join(projectRoot, "src");
const sanityClientRel = join("src", "cms", "sanityClient.ts");

const CODE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];

function isTestFile(path: string): boolean {
  const normalized = path.split(sep).join("/");
  return /\/tests\//.test(normalized) || /\.(test|spec)\.(ts|tsx)$/.test(normalized);
}

/** Recursively collect scannable source files under a directory. */
function collectSourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const stats = statSync(full);
    if (stats.isDirectory()) {
      if (name === "node_modules" || name === "dist") continue;
      out.push(...collectSourceFiles(full));
      continue;
    }
    if (!CODE_EXTENSIONS.some((ext) => full.endsWith(ext))) continue;
    if (isTestFile(full)) continue;
    out.push(full);
  }
  return out;
}

/**
 * Strip line (`// …`) and block (`/* … *\/`) comments so that explanatory
 * comments (which legitimately mention "token" to document its omission) do not
 * trip the scan. Only executable code is inspected.
 */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "") // block comments
    .replace(/\/\/[^\n]*/g, ""); // line comments
}

const srcFiles = collectSourceFiles(srcRoot);

describe("Req 12.6: no write-capable Sanity token in the client bundle", () => {
  it("has source files to scan", () => {
    expect(srcFiles.length).toBeGreaterThan(0);
  });

  it("sanityClient.ts configures no `token` key", () => {
    const code = stripComments(readFileSync(join(projectRoot, sanityClientRel), "utf8"));
    // An active token config key would look like `token:` (optionally spaced).
    expect(code).not.toMatch(/\btoken\s*:/);
  });

  it("does not declare an active `token:` config key anywhere under src/", () => {
    const offenders: string[] = [];
    for (const file of srcFiles) {
      const code = stripComments(readFileSync(file, "utf8"));
      if (/\btoken\s*:/.test(code)) {
        offenders.push(relative(projectRoot, file));
      }
    }
    expect(
      offenders,
      `An active \`token:\` config key must not appear under src/, but was ` +
        `found in: ${offenders.join(", ")}`,
    ).toEqual([]);
  });

  it("does not reference a write-capable Sanity token identifier anywhere under src/", () => {
    // Names that would denote a secret / write-capable token.
    const forbidden = [
      /SANITY_WRITE_TOKEN/i,
      /SANITY_[A-Z_]*SECRET/i,
      /writeToken/i,
      /sanityWriteToken/i,
      /VITE_SANITY_TOKEN/i,
    ];
    const offenders: string[] = [];
    for (const file of srcFiles) {
      const code = stripComments(readFileSync(file, "utf8"));
      if (forbidden.some((re) => re.test(code))) {
        offenders.push(relative(projectRoot, file));
      }
    }
    expect(
      offenders,
      `A write-capable Sanity token reference must not appear under src/, but ` +
        `was found in: ${offenders.join(", ")}`,
    ).toEqual([]);
  });
});
