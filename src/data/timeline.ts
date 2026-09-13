// Feature: maija-portfolio
//
// Static timeline seed data (Req 6.6–6.9, 12.7).
//
// This module is NOT the runtime source of truth. At runtime the Timeline is
// fetched from the CMS via `useCmsResource` and mapped to `TimelineCategory[]`.
// These values are the authoring reference used to populate Sanity and to seed
// tests; their shape matches the CMS-mapped `TimelineCategory[]` exactly, so the
// pure logic and correctness properties are unaffected.

export interface TimelineEntry {
  role: string; // e.g. "Pentti", "Background Actor", "Director & Writer"
  production: string; // the work title, e.g. "\"Hölmöläisiä\""
  venue: string; // venue or company
  year: number | string; // e.g. 2019 or "2023 – 2026"
  premiere?: string; // e.g. "November 2026" (Directing & Writing only)
  language?: "EN" | "FI"; // optional authoring language
}

export interface TimelineCategory {
  label: "Theatre" | "TV & Film" | "Directing & Writing" | "Career/Business";
  entries: TimelineEntry[];
}

// Categories ordered per Req 6.9: Theatre → TV & Film → Directing & Writing.
export const timelineCategories: TimelineCategory[] = [
  {
    // Req 6.6 — five entries, in order.
    label: "Theatre",
    entries: [
      {
        role: "",
        production: "\"Ruma ankanpoikanen\"",
        venue: "Mustasaaren kesäteatteri",
        year: 2018,
      },
      {
        role: "Pentti",
        production: "\"Hölmöläisiä\"",
        venue: "Mustasaaren kesäteatteri",
        year: 2019,
      },
      {
        role: "Kilpikonna Albert",
        production: "\"Sirkuseläinten vallankumous\"",
        venue: "Falkullan eläintilan kesäteatteri",
        year: 2020,
      },
      {
        role: "Lady Agatha",
        production: "\"Perintö\"",
        venue: "Pukinmäen taidekoulujen teatteriryhmän kuunnelma",
        year: 2021,
      },
      {
        role: "Axel Candelberg",
        production: "\"Labyrintti\"",
        venue: "Pukinmäen taidekoulujen teatteriryhmän lopputyö",
        year: 2023,
      },
    ],
  },
  {
    // Req 6.7 — three entries, in order.
    label: "TV & Film",
    entries: [
      {
        role: "Background Actor",
        production: "\"Taivaan kansalaiset\"",
        venue: "Just Republic",
        year: 2026,
      },
      {
        role: "Minor Role",
        production: "\"Otava Brand Film\"",
        venue: "Otava Media Oy",
        year: 2026,
      },
      {
        role: "Background Actor",
        production: "\"Battery Commercial\"",
        venue: "Inspiroiva Creative Oy",
        year: 2026,
      },
    ],
  },
  {
    // Req 6.8 — one entry with premiere date.
    label: "Directing & Writing",
    entries: [
      {
        role: "Director & Writer",
        production: "You Will Never Walk Alone (Independent Production)",
        venue: "",
        year: 2026,
        premiere: "November 2026",
      },
    ],
  },
];
