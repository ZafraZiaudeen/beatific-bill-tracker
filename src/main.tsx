import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { useBillStore } from "@/stores/billStore";
import { useSettingsStore } from "@/stores/settingsStore";

useBillStore.getState().hydrate();
useSettingsStore.getState().hydrate();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
