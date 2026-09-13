// App — the AppShell + client-side routes (Req 1.5, 3.1, 3.4).
//
// A single layout route (`AppShell`) wraps every page with the persistent
// navigation and renders the active page through react-router's <Outlet />, so
// the navigation is present on every page (Req 3.1). The AppShell applies the
// Primary_Dark base document background (bg-primaryDark, Req 2.1) so individual
// pages layer their own backgrounds on top.
//
// Routes follow the Req 3.4 order — Info, Resume, Portfolio, On My Mind,
// Contact me — with Info as the index route ("/") so opening the site at its
// root renders the Info_Page (Req 1.5).

import { Suspense, lazy } from "react";
import { Outlet, Route, Routes } from "react-router-dom";

import TopBar from "./components/TopBar";
import Footer from "./components/Footer";
import BlogPage from "./pages/BlogPage";
import ContactPage from "./pages/ContactPage";
import InfoPage from "./pages/InfoPage";
import PortfolioPage from "./pages/PortfolioPage";
import ResumePage from "./pages/ResumePage";

// The embedded Sanity Studio is heavy; load it lazily so it only enters the
// bundle when the /studio route is visited.
const StudioPage = lazy(() => import("./studio/StudioPage"));

/**
 * The persistent shell wrapping every route. Renders the navigation once via
 * <TopBar />, the routed page content via <Outlet />, and the unified dark
 * <Footer /> at the absolute bottom of every page (Req 3.1, 10.1). The flex
 * column keeps the footer pinned below short pages.
 */
function AppShell() {
  return (
    <div className="flex min-h-screen flex-col bg-primaryDark">
      <TopBar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Embedded Sanity Studio — rendered full-screen, outside the AppShell
          (no site TopBar/Footer). `/studio/*` lets the Studio own its subroutes. */}
      <Route
        path="/studio/*"
        element={
          <Suspense fallback={null}>
            <StudioPage />
          </Suspense>
        }
      />

      <Route element={<AppShell />}>
        <Route index element={<InfoPage />} />
        <Route path="resume" element={<ResumePage />} />
        <Route path="portfolio" element={<PortfolioPage />} />
        <Route path="on-my-mind" element={<BlogPage />} />
        <Route path="contact" element={<ContactPage />} />
      </Route>
    </Routes>
  );
}
