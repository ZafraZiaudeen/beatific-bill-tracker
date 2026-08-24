import { create } from "zustand";
import type { IncomeEntry } from "@/types/income";

const LS_KEY = "pdj-income";

interface IncomeStore {
  entries: IncomeEntry[];
  hydrated: boolean;
  hydrate: () => void;
  addEntry: (e: IncomeEntry) => void;
  updateEntry: (id: string, changes: Partial<IncomeEntry>) => void;
  deleteEntry: (id: string) => void;
}

function persist(entries: IncomeEntry[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(entries));
}

export const useIncomeStore = create<IncomeStore>((set) => ({
  entries: [],
  hydrated: false,

  hydrate() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        set({ entries: JSON.parse(raw) as IncomeEntry[], hydrated: true });
      } else {
        set({ entries: [], hydrated: true });
      }
    } catch {
      set({ entries: [], hydrated: true });
    }
  },

  addEntry(e) {
    set((s) => {
      const next = [e, ...s.entries];
      persist(next);
      return { entries: next };
    });
  },

  updateEntry(id, changes) {
    set((s) => {
      const next = s.entries.map((e) => (e.id === id ? { ...e, ...changes } : e));
      persist(next);
      return { entries: next };
    });
  },

  deleteEntry(id) {
    set((s) => {
      const next = s.entries.filter((e) => e.id !== id);
      persist(next);
      return { entries: next };
    });
  },
}));
