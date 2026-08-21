import { create } from "zustand";
import type { AppSettings, BillGroup } from "@/types/settings";
import { DEFAULT_SETTINGS, DEFAULT_BILL_GROUPS, UNLOCK_CODE } from "@/lib/constants";

interface SettingsStore {
  settings: AppSettings;
  billGroups: BillGroup[];
  budgetLimits: Record<string, number>;
  monthlyNotes: Record<string, string>;
  activated: boolean;
  hydrated: boolean;

  hydrate: () => void;
  setSettings: (s: AppSettings | ((prev: AppSettings) => AppSettings)) => void;
  setBillGroups: (g: BillGroup[] | ((prev: BillGroup[]) => BillGroup[])) => void;
  setBudgetLimit: (cat: string, limit: number) => void;
  setMonthlyNote: (key: string, text: string) => void;
  tryUnlock: (code: string) => boolean;
  resetToDefaults: () => void;
  importData: (raw: {
    settings?: Partial<AppSettings>;
    billGroups?: BillGroup[];
    monthlyNotes?: Record<string, string>;
    budgetLimits?: Record<string, number>;
    _activated?: boolean;
  }) => void;
}

const LS = {
  settings: "pdj-settings",
  billGroups: "pdj-bill-groups",
  budgetLimits: "pdj-budget-limits",
  monthlyNotes: "pdj-monthly-notes",
  activated: "billTrackerActivated",
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  billGroups: DEFAULT_BILL_GROUPS,
  budgetLimits: {},
  monthlyNotes: {},
  activated: false,
  hydrated: false,

  hydrate() {
    try {
      const s = localStorage.getItem(LS.settings);
      const bg = localStorage.getItem(LS.billGroups);
      const bl = localStorage.getItem(LS.budgetLimits);
      const mn = localStorage.getItem(LS.monthlyNotes);
      set({
        settings: s ? { ...DEFAULT_SETTINGS, ...JSON.parse(s) } : DEFAULT_SETTINGS,
        billGroups: bg ? JSON.parse(bg) : DEFAULT_BILL_GROUPS,
        budgetLimits: bl ? JSON.parse(bl) : {},
        monthlyNotes: mn ? JSON.parse(mn) : {},
        activated: localStorage.getItem(LS.activated) === "true",
        hydrated: true,
      });
    } catch {
      set({ hydrated: true });
    }
  },

  setSettings(updater) {
    set((s) => {
      const next = typeof updater === "function" ? updater(s.settings) : updater;
      localStorage.setItem(LS.settings, JSON.stringify(next));
      return { settings: next };
    });
  },

  setBillGroups(updater) {
    set((s) => {
      const next = typeof updater === "function" ? updater(s.billGroups) : updater;
      localStorage.setItem(LS.billGroups, JSON.stringify(next));
      return { billGroups: next };
    });
  },

  setBudgetLimit(cat, limit) {
    set((s) => {
      const next = { ...s.budgetLimits, [cat]: limit };
      localStorage.setItem(LS.budgetLimits, JSON.stringify(next));
      return { budgetLimits: next };
    });
  },

  setMonthlyNote(key, text) {
    set((s) => {
      const next = { ...s.monthlyNotes, [key]: text };
      localStorage.setItem(LS.monthlyNotes, JSON.stringify(next));
      return { monthlyNotes: next };
    });
  },

  tryUnlock(code) {
    if (code !== UNLOCK_CODE) return false;
    localStorage.setItem(LS.activated, "true");
    set({ activated: true });
    return true;
  },

  resetToDefaults() {
    localStorage.setItem(LS.settings, JSON.stringify(DEFAULT_SETTINGS));
    localStorage.setItem(LS.billGroups, JSON.stringify(DEFAULT_BILL_GROUPS));
    localStorage.setItem(LS.budgetLimits, JSON.stringify({}));
    localStorage.setItem(LS.monthlyNotes, JSON.stringify({}));
    set({
      settings: DEFAULT_SETTINGS,
      billGroups: DEFAULT_BILL_GROUPS,
      budgetLimits: {},
      monthlyNotes: {},
    });
  },

  importData(raw) {
    const next = {
      settings: raw.settings ? { ...DEFAULT_SETTINGS, ...raw.settings } : get().settings,
      billGroups: raw.billGroups ?? get().billGroups,
      budgetLimits: raw.budgetLimits ?? get().budgetLimits,
      monthlyNotes: raw.monthlyNotes ?? get().monthlyNotes,
      activated: raw._activated ? true : get().activated,
    };
    if (raw._activated) localStorage.setItem(LS.activated, "true");
    localStorage.setItem(LS.settings, JSON.stringify(next.settings));
    localStorage.setItem(LS.billGroups, JSON.stringify(next.billGroups));
    localStorage.setItem(LS.budgetLimits, JSON.stringify(next.budgetLimits));
    localStorage.setItem(LS.monthlyNotes, JSON.stringify(next.monthlyNotes));
    set(next);
  },
}));
