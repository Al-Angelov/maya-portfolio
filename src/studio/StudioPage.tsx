// src/studio/StudioPage.tsx — the embedded Sanity Studio, mounted at /studio.
//
// Renders the full Sanity Studio inside the Vite app so Maija can manage her
// content at `<site>/studio` without a separate deployment. The `<Studio />`
// component and its config are heavy, so this module is loaded lazily (see the
// route wiring in App.tsx) and only pulled into the bundle when /studio is
// visited.
//
// The Studio sizes itself to its parent, so we wrap it in a fixed, full-viewport
// container (`fixed inset-0`) that spans the entire window — this removes the
// white gap the Studio would otherwise leave at the bottom of the page. The
// container also carries the Studio's dark base background so there is no flash
// of empty white while the Studio mounts.

import { Studio } from "sanity";

import { sanityConfig } from "./sanity.config";

export default function StudioPage() {
  return (
    <div className="fixed inset-0 h-screen w-screen overflow-auto bg-white">
      <Studio config={sanityConfig} />
    </div>
  );
}
