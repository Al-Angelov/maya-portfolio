# Maija Portfolio

A high-end, minimalistic, professional multi-page personal portfolio and CV website for
**Maija** — a Helsinki-based student, short video editor, social media manager, writer, and
performer. The site presents five pages (Info, Resume, Portfolio, On My Mind, Contact me),
follows a strict Nordic-editorial design system, ships English fully with a prepared Finnish
toggle, and deploys as pure static files (GitHub Pages / Vercel).

Dynamic content (the resume timeline, portfolio cards, and On My Mind blog entries) is managed
by Maija through the **Sanity.io** headless CMS and fetched at runtime, so she can edit and
publish without code changes. Contact form submissions are delivered through **Web3Forms**,
which routes messages directly to Maija's email without a custom backend.

## Tech stack

- **React 18 + TypeScript** application
- **Vite** for the dev server and static build
- **Tailwind CSS** for styling (single-source design tokens)
- **react-router-dom** for client-side routing (Info is the default route)
- **Sanity.io** (`@sanity/client`, read-only public access) as the content source
- **Web3Forms** for contact-form delivery
- **Vitest + fast-check + @testing-library/react** for testing

## Getting started (local launch)

Requires Node.js 18+ and npm.

```bash
npm install
npm run dev
```

`npm run dev` starts the Vite development server (default `http://localhost:5173`) and opens the
site at its root path, which renders the Info page. If startup fails (for example, dependencies
were not installed or the config is invalid), the command exits with a non-zero status and prints
the cause to the terminal — run `npm install` first.

## Other commands

| Command          | Description                                                        |
| ---------------- | ------------------------------------------------------------------ |
| `npm run dev`     | Start the local development server.                                |
| `npm run build`   | Produce the static build in `dist/` (HTML, CSS, JS, assets only).  |
| `npm run preview` | Serve the built `dist/` output locally.                            |
| `npm run test`    | Run the test suite once (`vitest run`).                            |

## Environment variables

The site reads runtime configuration from a `.env` file at the project root. **`.env` is
git-ignored** (see `.gitignore`); copy `.env.example` to `.env` and fill in the values. All
values are **public, read-only client configuration** — never add a secret Sanity write token.

| Variable                    | Purpose                                                            |
| --------------------------- | ------------------------------------------------------------------ |
| `VITE_SANITY_PROJECT_ID`    | Sanity.io project ID (public) for the read-only content source.    |
| `VITE_SANITY_DATASET`       | Sanity.io dataset name (public), e.g. `production`.                |
| `VITE_WEB3FORMS_ACCESS_KEY` | Web3Forms public access key that routes contact messages to Maija. |

An optional `VITE_BASE` variable sets the deployment base path (e.g. for GitHub Pages project
sites); it defaults to `/` for root hosting.

## Project structure

Top-level directories and their purpose:

| Directory        | Purpose                                                                             |
| ---------------- | ----------------------------------------------------------------------------------- |
| `src/pages/`     | One routed page component per file (Info, Resume, Portfolio, On My Mind, Contact).   |
| `src/components/`| Shared UI components (top bar, language toggle, footer, timeline, cards, form, ...). |
| `src/styles/`    | Global styles and the single-source design tokens (`theme.ts`, `index.css`).        |
| `src/i18n/`      | Internationalization layer: typed EN/FI translation resource, resolver, provider.   |
| `src/data/`      | Typed **seed content** authored into the CMS (timeline, portfolio, blog); also test fixtures. Not the runtime source. |
| `src/cms/`       | **CMS data-access layer**: read-only Sanity client, GROQ queries + pure mappers, and the runtime fetch hook. |
| `src/lib/`       | Pure business logic: contact validation, Web3Forms submit adapter, tag filtering, blog ordering. |
| `public/images/` | Static image assets (placeholders for the nature overlay, photo frame, backgrounds).|
| `public/fonts/`  | Optional local "Bookman Old Style" font faces used by the design system.            |
| `tests/`         | Property, unit, component, and smoke tests.                                          |
| `studio/`        | **Optional** Sanity Studio (content authoring schemas under `studio/schemas/`). Deployed separately or hosted by Sanity — **never bundled** into the static site. |

Key root files: `index.html` (SPA entry), `vite.config.ts` (build + test config with a jsdom
test environment and a configurable base), `tailwind.config.ts` (design-token theme),
`tsconfig.json`, `postcss.config.js`, and `package.json`.

## Content management (Sanity)

The timeline, portfolio cards, and blog entries are stored in Sanity and fetched at runtime via
`src/cms/`. Updates published in Sanity Studio appear on the next page load without a code change
or redeploy. The client uses **read-only public** access (`useCdn: true`, no write token), so no
secret is included in the static bundle. Content authoring happens in the Sanity Studio under
`studio/`, which is deployed separately from the portfolio site.

## Deployment

`npm run build` emits a fully static site in `dist/` that can be served without a server-side
runtime, suitable for GitHub Pages or Vercel.
