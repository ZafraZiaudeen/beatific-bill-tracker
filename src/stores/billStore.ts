import { create } from "zustand";
import type { Bill } from "@/types/bill";
import {
  normalizeBill,
  extendRecurringSeries,
  syncRecurringSeriesEndDate,
} from "@/lib/billUtils";
import { SEED_BILLS } from "@/lib/constants";

interface BillStore {
  bills: Bill[];
  hydrated: boolean;
  hydrate: () => void;
  addBills: (newBills: Bill[]) => void;
  togglePaid: (id: string) => void;
  updateBill: (id: string, changes: Partial<Bill>, scope: "this" | "fromHere") => void;
  deleteBillById: (id: string) => void;
  deleteSeries: (seriesId: string) => void;
  rescheduleBill: (id: string, newDate: string) => void;
  resetToDefaults: () => void;
  importBills: (raw: Record<string, unknown>[]) => void;
}

const LS_BILLS = "pdj-bills";

function persist(bills: Bill[]) {
  localStorage.setItem(LS_BILLS, JSON.stringify(bills));
}

export const useBillStore = create<BillStore>((set, get) => ({
  bills: [],
  hydrated: false,

  hydrate() {
    try {
      const stored = localStorage.getItem(LS_BILLS);
      if (stored) {
        const raw = JSON.parse(stored) as Record<string, unknown>[];
        const normalized = raw.map(normalizeBill);
        const withoutSeeds = normalized.filter((b) => !b.id.startsWith("seed-"));
        set({
          bills: extendRecurringSeries(
            withoutSeeds.length > 0 ? withoutSeeds : [],
          ),
          hydrated: true,
        });
        return;
      }
    } catch {
      // ignore malformed data
    }
    set({ bills: [], hydrated: true });
  },

  addBills(newBills) {
    set((s) => {
      const updated = [...s.bills, ...newBills];
      persist(updated);
      return { bills: updated };
    });
  },

  togglePaid(id) {
    set((s) => {
      const updated = s.bills.map((b) => {
        if (b.id !== id) return b;
        if (b.paid) return { ...b, paid: false, actualAmount: null, actualDate: null };
        return { ...b, paid: true };
      });
      persist(updated);
      return { bills: updated };
    });
  },

  updateBill(id, changes, scope) {
    set((s) => {
      const bill = s.bills.find((b) => b.id === id);
      if (!bill) return {};
      const updatedBill = { ...bill, ...changes };

      let updated: Bill[];
      if (scope === "this" || bill.frequency === "one-time") {
        updated = syncRecurringSeriesEndDate(
          s.bills.map((b) => (b.id === id ? updatedBill : b)),
          updatedBill,
        );
      } else {
        const futureChanges = { ...changes };
        delete futureChanges.actualDate;
        delete futureChanges.endDate;
        updated = syncRecurringSeriesEndDate(
          s.bills.map((b) =>
            b.id === id
              ? updatedBill
              : b.seriesId === bill.seriesId &&
                  b.dueDate > bill.dueDate &&
                  !b.paid
                ? { ...b, ...futureChanges }
                : b,
          ),
          updatedBill,
        );
      }
      persist(updated);
      return { bills: updated };
    });
  },

  deleteBillById(id) {
    set((s) => {
      const updated = s.bills.filter((b) => b.id !== id);
      persist(updated);
      return { bills: updated };
    });
  },

  deleteSeries(seriesId) {
    set((s) => {
      const updated = s.bills.filter(
        (b) => !(b.seriesId === seriesId && !b.paid),
      );
      persist(updated);
      return { bills: updated };
    });
  },

  rescheduleBill(id, newDate) {
    set((s) => {
      const updated = s.bills.map((b) =>
        b.id === id ? { ...b, actualDate: newDate } : b,
      );
      persist(updated);
      return { bills: updated };
    });
  },

  resetToDefaults() {
    persist(SEED_BILLS);
    set({ bills: SEED_BILLS });
  },

  importBills(raw) {
    const normalized = extendRecurringSeries(raw.map(normalizeBill));
    persist(normalized);
    set({ bills: normalized });
  },
}));
