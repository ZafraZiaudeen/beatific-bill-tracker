import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../../index.css";
import BookTrackerDashboard from "./BookTrackerDashboard";

createRoot(document.getElementById("btk-root")!).render(
  <StrictMode>
    <BookTrackerDashboard />
  </StrictMode>
);
