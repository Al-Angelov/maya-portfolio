import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { I18nProvider } from "./i18n/I18nProvider";
import "./styles/index.css";

// App bootstrap: mount <App /> inside the global providers.
//
// - I18nProvider supplies the active-language context to the whole tree (Req 4).
// - BrowserRouter enables client-side routing with a configurable base
//   (`import.meta.env.BASE_URL`, set from Vite's `base`) so the app works when
//   hosted under a subpath such as GitHub Pages project pages.
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('Root element "#root" was not found in index.html.');
}

createRoot(rootElement).render(
  <StrictMode>
    <I18nProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <App />
      </BrowserRouter>
    </I18nProvider>
  </StrictMode>,
);
