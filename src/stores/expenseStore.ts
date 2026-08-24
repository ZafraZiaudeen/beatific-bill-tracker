import { create } from "zustand";
import type { Expense } from "@/types/expense";

const LS_KEY = "pdj-expenses";

const SEED_EXPENSES: Expense[] = [
  { id: "exp-seed-1",  date: "2026-08-01", description: "Morning Coffee",  category: "Food & Drinks",  iconKey: "Coffee",         amount: 4.50  },
  { id: "exp-seed-2",  date: "2026-08-02", description: "Groceries Run",   category: "Groceries",      iconKey: "ShoppingCart",   amount: 68.75 },
  { id: "exp-seed-3",  date: "2026-08-03", description: "Gas Station",     category: "Transportation", iconKey: "Car",            amount: 45.00 },
  { id: "exp-seed-4",  date: "2026-08-05", description: "Bookstore",       category: "Education",      iconKey: "BookOpen",       amount: 24.99 },
  { id: "exp-seed-5",  date: "2026-08-06", description: "Movie Night",     category: "Entertainment",  iconKey: "Film",           amount: 32.00 },
  { id: "exp-seed-6",  date: "2026-08-07", description: "Takeout Dinner",  category: "Food & Drinks",  iconKey: "UtensilsCrossed",amount: 28.40 },
  { id: "exp-seed-7",  date: "2026-08-10", description: "Birthday Gift",   category: "Gifts",          iconKey: "Gift",           amount: 45.00 },
  { id: "exp-seed-8",  date: "2026-08-12", description: "Plant Shop",      category: "Personal Care",  iconKey: "Leaf",           amount: 26.35 },
  { id: "exp-seed-9",  date: "2026-08-14", description: "Clothing",        category: "Shopping",       iconKey: "Scissors",       amount: 89.90 },
  { id: "exp-seed-10", date: "2026-08-15", description: "Smoothie",        category: "Food & Drinks",  iconKey: "Coffee",         amount: 6.25  },
  { id: "exp-seed-11", date: "2026-08-08", description: "Ride Share",      category: "Transportation", iconKey: "Car",            amount: 18.50 },
  { id: "exp-seed-12", date: "2026-08-09", description: "Streaming Sub",   category: "Entertainment",  iconKey: "Film",           amount: 15.99 },
  { id: "exp-seed-13", date: "2026-08-11", description: "Supermarket",     category: "Groceries",      iconKey: "ShoppingCart",   amount: 82.30 },
  { id: "exp-seed-14", date: "2026-08-13", description: "Gym Wear",        category: "Shopping",       iconKey: "Scissors",       amount: 54.99 },
  { id: "exp-seed-15", date: "2026-08-16", description: "Dinner Out",      category: "Food & Drinks",  iconKey: "UtensilsCrossed",amount: 42.80 },
  { id: "exp-seed-16", date: "2026-08-04", description: "Skincare",        category: "Personal Care",  iconKey: "Leaf",           amount: 38.50 },
  { id: "exp-seed-17", date: "2026-08-17", description: "Online Course",   category: "Education",      iconKey: "BookOpen",       amount: 29.99 },
  { id: "exp-seed-18", date: "2026-08-18", description: "Concert Ticket",  category: "Entertainment",  iconKey: "Film",           amount: 65.00 },
  { id: "exp-seed-19", date: "2026-08-19", description: "Weekly Shop",     category: "Groceries",      iconKey: "ShoppingCart",   amount: 74.20 },
  { id: "exp-seed-20", date: "2026-08-20", description: "Bus Pass",        category: "Transportation", iconKey: "Car",            amount: 32.00 },
];

interface ExpenseStore {
  expenses: Expense[];
  hydrated: boolean;
  hydrate: () => void;
  addExpense: (e: Expense) => void;
  updateExpense: (id: string, changes: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
}

function persist(expenses: Expense[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(expenses));
}

export const useExpenseStore = create<ExpenseStore>((set) => ({
  expenses: [],
  hydrated: false,

  hydrate() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        set({ expenses: JSON.parse(raw) as Expense[], hydrated: true });
      } else {
        persist(SEED_EXPENSES);
        set({ expenses: SEED_EXPENSES, hydrated: true });
      }
    } catch {
      set({ expenses: SEED_EXPENSES, hydrated: true });
    }
  },

  addExpense(e) {
    set((s) => {
      const next = [e, ...s.expenses];
      persist(next);
      return { expenses: next };
    });
  },

  updateExpense(id, changes) {
    set((s) => {
      const next = s.expenses.map((ex) => (ex.id === id ? { ...ex, ...changes } : ex));
      persist(next);
      return { expenses: next };
    });
  },

  deleteExpense(id) {
    set((s) => {
      const next = s.expenses.filter((ex) => ex.id !== id);
      persist(next);
      return { expenses: next };
    });
  },
}));
