// Feature: maija-portfolio — access-key sourcing static scan
// (Validates: Requirements 13.2)
//
// Requirement 13.2: the Portfolio_Site obtains the Web3Forms access key from an
// environment variable / external configuration source, such that the access
// key value does NOT appear as a hardcoded literal within component logic.
//
// This static scan asserts:
//   1. `src/lib/submitContact.ts` reads the key from
//      `import.meta.env.VITE_WEB3FORMS_ACCESS_KEY` (the sanctioned source).
//   2. No source file assigns a hardcoded string literal to `access_key`
//      (e.g. `access_key: "abc123"` or `access_key = "abc123"`). The only
//      allowed forms bind `access_key` to the env-sourced variable, never to a
//      literal.

import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const projectRoot = process.cwd();
const srcRoot = join(projectRoot, "src");
const ADAPTER_REL = join("src", "lib", "submitContact.ts");

const CODE_EXTENSIONS = [".ts", ".tsx"];

function isTestFile(path: string): boolean {
  const normalized = path.split(sep).join("/");
  return (
    /\/tests\//.test(normalized) || /\.(test|spec)\.(ts|tsx)$/.test(normalized)
  );
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

const scannedFiles = collectSourceFiles(srcRoot);

function relPath(file: string): string {
  return relative(projectRoot, file);
}

/**
 * Matches an `access_key` bound to a STRING LITERAL, in object-literal or
 * assignment form, e.g.:
 *   access_key: "abc"        access_key: 'abc'
 *   access_key = "abc"       "access_key": "abc"
 * It does NOT match `access_key: accessKey` (a variable) or the env read.
 */
const ACCESS_KEY_LITERAL = /access_key["']?\s*[:=]\s*["'][^"']+["']/i;

describe("Req 13.2: access key is env-sourced, never a hardcoded literal", () => {
  it("has source files to scan", () => {
    expect(scannedFiles.length).toBeGreaterThan(0);
  });

  it("reads the access key from import.meta.env.VITE_WEB3FORMS_ACCESS_KEY in the adapter", () => {
    const adapter = readFileSync(join(projectRoot, ADAPTER_REL), "utf8");
    expect(adapter).toContain(
      "import.meta.env.VITE_WEB3FORMS_ACCESS_KEY",
    );
  });

  it("does not bind access_key to a hardcoded string literal in any source file", () => {
    const offenders: string[] = [];
    for (const file of scannedFiles) {
      const raw = readFileSync(file, "utf8");
      if (ACCESS_KEY_LITERAL.test(raw)) {
        offenders.push(relPath(file));
      }
    }
    expect(
      offenders,
      `access_key must be sourced from the environment, but a hardcoded ` +
        `literal was found in: ${offenders.join(", ")}`,
    ).toEqual([]);
  });
});
