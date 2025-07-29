import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { DiscoverPage } from "./components/pages/DiscoverPage";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <DiscoverPage />
  </StrictMode>,
);