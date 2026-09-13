// Feature: maija-portfolio — single-source design-token scan (Req 2.6)
//
// Requirement 2.6: the Design_System defines each color value (#141414,
// #F5CBDA, #FFF4EC) and the typography values exactly once in a single shared
// definition, such that no color hex value or font-family declaration is
// redeclared as a literal in any other location.
//
// This static scan reads every source file under `src/` (TS/TSX/CSS,
// excluding tests) plus `tailwind.config.ts`, and asserts:
//   1. Each of the three brand hex values appears ONLY in `src/styles/theme.ts`
//      (the single source of truth). `tailwind.config.ts` imports the tokens
//      rather than restating the literals, so no hex should appear there either.
//   2. The full font-family STACK literal (e.g. `"Bookman Old Style", Georgia,
//      serif` / the array form) is not re-declared in component or module logic.
//      The `@font-face { font-family: "Bookman Old Style" }` registration in
//      `src/styles/index.css` declares only the font NAME (required for font
//      registration) and is explicitly allowed — it is not the full stack.

import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

// Vitest runs with the project root as the working directory, so resolve the
// scan roots from there (import.meta.url is not a file URL in this test env).
const projectRoot = process.cwd();
const srcRoot = join(projectRoot, "src");

/** The single source of truth for the design tokens (Req 2.6). */
const TOKEN_MODULE_REL = join("src", "styles", "theme.ts");

/** The brand color hex values that must live only in the token module. */
const HEX_VALUES = ["#141414", "#F5CBDA", "#FFF4EC"] as const;

/**
 * The font-family STACK literals that must not be re-declared outside the token
 * module. We look for the joined CSS string form and the ordered-array form,
 * matched case-insensitively. The bare `@font-face` name ("Bookman Old Style"
 * alone) is intentionally NOT in this list — registering the font name is
 * allowed; only restating the whole fallback stack is forbidden.
 */
const FONT_STACK_LITERALS = [
  '"bookman old style", georgia, serif', // FONT_STACK joined string
  "'bookman old style', 'georgia', 'serif'", // possible array-ish restatement
  '"bookman old style", "georgia", "serif"',
] as const;

const CODE_EXTENSIONS = [".ts", ".tsx", ".css"];

function isTestFile(path: string): boolean {
  const normalized = path.split(sep).join("/");
  return (
    /\/tests\//.test(normalized) ||
    /\.(test|spec)\.(ts|tsx)$/.test(normalized)
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

// Scan src/ (excluding tests) plus the Tailwind config, which is where the
// tokens are wired into the framework.
const scannedFiles: string[] = [
  ...collectSourceFiles(srcRoot),
  join(projectRoot, "tailwind.config.ts"),
];

function relPath(file: string): string {
  return relative(projectRoot, file);
}

/** Files (relative paths) where a given literal occurs, with a match count. */
function findOccurrences(
  needle: string,
  caseInsensitive: boolean,
): { file: string; count: number }[] {
  const target = caseInsensitive ? needle.toLowerCase() : needle;
  const results: { file: string; count: number }[] = [];
  for (const file of scannedFiles) {
    const raw = readFileSync(file, "utf8");
    const haystack = caseInsensitive ? raw.toLowerCase() : raw;
    let count = 0;
    let idx = haystack.indexOf(target);
    while (idx !== -1) {
      count += 1;
      idx = haystack.indexOf(target, idx + target.length);
    }
    if (count > 0) results.push({ file: relPath(file), count });
  }
  return results;
}

describe("Req 2.6: design tokens are declared in a single source", () => {
  it("has source files to scan", () => {
    // Sanity check: if this list is empty the scan below would trivially pass.
    expect(scannedFiles.length).toBeGreaterThan(0);
  });

  it.each(HEX_VALUES)(
    "declares the hex value %s only in the token module",
    (hex) => {
      const occurrences = findOccurrences(hex, true);
      const offenders = occurrences.filter((o) => o.file !== TOKEN_MODULE_REL);

      expect(
        offenders,
        `Hex value ${hex} must appear only in ${TOKEN_MODULE_REL}, but was ` +
          `also found in: ${offenders.map((o) => o.file).join(", ")}`,
      ).toEqual([]);

      // And it must actually be present in the token module (single source exists).
      const inTokenModule = occurrences.find(
        (o) => o.file === TOKEN_MODULE_REL,
      );
      expect(
        inTokenModule,
        `Hex value ${hex} was not found in the token module ${TOKEN_MODULE_REL}.`,
      ).toBeDefined();
    },
  );

  it("does not re-declare the full font-family stack literal outside the token module", () => {
    for (const literal of FONT_STACK_LITERALS) {
      const occurrences = findOccurrences(literal, true);
      const offenders = occurrences.filter(
        (o) => o.file !== TOKEN_MODULE_REL,
      );
      expect(
        offenders,
        `Font-family stack literal '${literal}' must not be re-declared ` +
          `outside ${TOKEN_MODULE_REL}, but was found in: ` +
          `${offenders.map((o) => o.file).join(", ")}`,
      ).toEqual([]);
    }
  });

  it("allows the @font-face font-family NAME registration in index.css", () => {
    // The @font-face block legitimately declares the "Bookman Old Style" NAME
    // for font registration. Assert index.css contains the @font-face name but
    // NOT the full fallback stack, confirming our scan draws that distinction.
    const indexCss = readFileSync(
      join(srcRoot, "styles", "index.css"),
      "utf8",
    );
    expect(indexCss).toMatch(/@font-face/);
    expect(indexCss.toLowerCase()).toContain('"bookman old style"');
    // The full stack must not be restated in the stylesheet.
    for (const literal of FONT_STACK_LITERALS) {
      expect(indexCss.toLowerCase()).not.toContain(literal);
    }
  });
});
