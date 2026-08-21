import { create } from "zustand";
import { startOfMonth } from "date-fns";
import type { Bill } from "@/types/bill";
import type { BillFilter, Section } from "@/types/bill";

interface UIStore {
  activeSection: Section;
  setActiveSection: (s: Section) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Modals
  addOpen: boolean;
  addDefaultCategory: string;
  addDefaultDate: string;
  editingBill: Bill | null;
  deleteTarget: Bill | null;
  showUnlockModal: boolean;

  setAddOpen: (open: boolean) => void;
  setAddDefaultCategory: (cat: string) => void;
  setAddDefaultDate: (date: string) => void;
  setEditingBill: (bill: Bill | null) => void;
  setDeleteTarget: (bill: Bill | null) => void;
  setShowUnlockModal: (show: boolean) => void;

  // Calendar
  calendarMonth: Date;
  setCalendarMonth: (m: Date | ((prev: Date) => Date)) => void;
  selectedDay: number | null;
  setSelectedDay: (d: number | null | ((prev: number | null) => number | null)) => void;
  calStatusFilter: string;
  setCalStatusFilter: (f: string) => void;
  draggedBillId: string | null;
  setDraggedBillId: (id: string | null) => void;

  // Budget
  budgetMonth: Date;
  setBudgetMonth: (m: Date | ((prev: Date) => Date)) => void;

  // Yearly
  yearlyYear: number;
  setYearlyYear: (y: number | ((prev: number) => number)) => void;

  // Bills filters
  billFilter: BillFilter;
  setBillFilter: (f: BillFilter) => void;
  listMonthFilter: string;
  setListMonthFilter: (f: string) => void;
  listYearFilter: string;
  setListYearFilter: (f: string) => void;
  listPriorityFilter: string;
  setListPriorityFilter: (f: string) => void;
  listCategoryFilter: string;
  setListCategoryFilter: (f: string) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  activeSection: "Dashboard",
  setActiveSection: (s) => set({ activeSection: s }),
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  addOpen: false,
  addDefaultCategory: "",
  addDefaultDate: "",
  editingBill: null,
  deleteTarget: null,
  showUnlockModal: false,

  setAddOpen: (open) => set({ addOpen: open }),
  setAddDefaultCategory: (cat) => set({ addDefaultCategory: cat }),
  setAddDefaultDate: (date) => set({ addDefaultDate: date }),
  setEditingBill: (bill) => set({ editingBill: bill }),
  setDeleteTarget: (bill) => set({ deleteTarget: bill }),
  setShowUnlockModal: (show) => set({ showUnlockModal: show }),

  calendarMonth: startOfMonth(new Date()),
  setCalendarMonth: (m) =>
    set((s) => ({
      calendarMonth:
        typeof m === "function" ? m(s.calendarMonth) : m,
    })),
  selectedDay: null,
  setSelectedDay: (d) =>
    set((s) => ({
      selectedDay: typeof d === "function" ? d(s.selectedDay) : d,
    })),
  calStatusFilter: "all",
  setCalStatusFilter: (f) => set({ calStatusFilter: f }),
  draggedBillId: null,
  setDraggedBillId: (id) => set({ draggedBillId: id }),

  budgetMonth: startOfMonth(new Date()),
  setBudgetMonth: (m) =>
    set((s) => ({
      budgetMonth:
        typeof m === "function" ? m(s.budgetMonth) : m,
    })),

  yearlyYear: new Date().getFullYear(),
  setYearlyYear: (y) =>
    set((s) => ({
      yearlyYear: typeof y === "function" ? y(s.yearlyYear) : y,
    })),

  billFilter: "All",
  setBillFilter: (f) => set({ billFilter: f }),
  listMonthFilter: "all",
  setListMonthFilter: (f) => set({ listMonthFilter: f }),
  listYearFilter: "all",
  setListYearFilter: (f) => set({ listYearFilter: f }),
  listPriorityFilter: "all",
  setListPriorityFilter: (f) => set({ listPriorityFilter: f }),
  listCategoryFilter: "all",
  setListCategoryFilter: (f) => set({ listCategoryFilter: f }),
}));
