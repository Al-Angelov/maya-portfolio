/**
 * Blog_Section ("On My Mind") seed content.
 *
 * This array is the authoring reference for the initial CMS seed content
 * (Req 12.7) and doubles as a test fixture for the Blog_Section. Each item
 * satisfies the {@link BlogEntry} shape consumed by the "On My Mind" page.
 *
 * Requirements satisfied by this seed set:
 * - 8.3: between 3 and 12 entries, orderable most-recent-first.
 * - 8.4: an entry referencing the November 2026 movie premiere (title + date).
 * - 8.5: an entry referencing autumn networking events (title + date).
 * - 12.7: represents the Blog_Section content as initial seed content.
 *
 * `publishedDate` values are ISO "YYYY-MM-DD" strings and are intentionally
 * varied so that recency ordering (via `sortBlogByRecency`) is meaningful.
 * They are declared here in no particular order to exercise that sort.
 */
import type { BlogEntry } from "@/lib/sortBlog";

export const blogEntries: BlogEntry[] = [
  {
    id: "movie-premiere-nov-2026",
    title: "Counting down to the November 2026 movie premiere",
    publishedDate: "2026-10-02",
    body: "The feature I have been editing all year finally has a date: it premieres in November 2026. I have been living inside the cutting room, shaping pacing and rhythm frame by frame, and seeing it move toward a real audience feels surreal. More behind-the-scenes notes to come as the premiere approaches.",
  },
  {
    id: "autumn-networking-events",
    title: "Autumn networking events wrap-up",
    publishedDate: "2026-09-18",
    body: "This autumn's networking events were a reminder of how much a room full of curious people can spark. I met editors, producers, and writers across a handful of meetups, traded a few too many business cards, and came away with a notebook full of ideas for the season ahead.",
  },
  {
    id: "editing-rhythm-notes",
    title: "Notes on finding a scene's rhythm",
    publishedDate: "2026-06-27",
    body: "Rhythm is the part of editing that resists explanation. A cut lands when the emotion is ready to turn, not when the dialogue ends. Lately I have been trimming on breath and glance rather than on line, and the scenes feel like they finally exhale.",
  },
  {
    id: "short-form-social-experiments",
    title: "Experiments in short-form social storytelling",
    publishedDate: "2026-03-11",
    body: "Short-form asks you to say something whole in fifteen seconds. I have been treating each clip like a tiny film with a beginning, a turn, and a landing. The constraint is brutal and clarifying in equal measure.",
  },
  {
    id: "written-work-return",
    title: "Returning to written work between edits",
    publishedDate: "2025-12-05",
    body: "Between projects I have been writing again, mostly essays about the craft of editing. Putting process into sentences forces a kind of honesty that the timeline never demands. It is slow, and I am grateful for the slowness.",
  },
];
