import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { useBillStore } from "@/stores/billStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useExpenseStore } from "@/stores/expenseStore";
import { useIncomeStore } from "@/stores/incomeStore";
import { useNoteStore } from "@/stores/noteStore";
import { useGoalStore } from "@/stores/goalStore";

useBillStore.getState().hydrate();
useSettingsStore.getState().hydrate();
useExpenseStore.getState().hydrate();
useIncomeStore.getState().hydrate();
useNoteStore.getState().hydrate();
useGoalStore.getState().hydrate();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
