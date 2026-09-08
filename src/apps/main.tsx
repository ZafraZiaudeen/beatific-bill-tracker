import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AppStudio from "./AppStudio";

createRoot(document.getElementById("apps-root")!).render(
  <StrictMode>
    <AppStudio />
  </StrictMode>
);
