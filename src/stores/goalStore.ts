import { create } from "zustand";
import type { Goal } from "@/types/goal";

const LS_KEY = "pdj-goals";

const SEED_GOALS: Goal[] = [
  {
    id: "goal-1",
    title: "Emergency Fund",
    description: "Peace of mind for life's unexpected moments.",
    icon: "Umbrella",
    color: "mint",
    priority: "high",
    saved: 2300,
    target: 5000,
    monthlyContribution: 500,
    motivation: "You're building security for your future.",
    date: "2024-01-01",
  },
  {
    id: "goal-2",
    title: "Dream Vacation",
    description: "Create memories that last a lifetime.",
    icon: "Luggage",
    color: "blush",
    priority: "medium",
    saved: 1720,
    target: 3500,
    monthlyContribution: 420,
    motivation: "Adventure is calling—keep saving!",
    date: "2024-01-01",
  },
  {
    id: "goal-3",
    title: "New Laptop",
    description: "Invest in tools for growth and productivity.",
    icon: "Laptop",
    color: "lilac",
    priority: "low",
    saved: 1260,
    target: 2000,
    monthlyContribution: 200,
    motivation: "You're investing in a better tomorrow.",
    date: "2024-01-01",
  },
];

function persist(goals: Goal[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(goals));
}

interface GoalStore {
  goals: Goal[];
  hydrated: boolean;
  hydrate(): void;
  addGoal(g: Goal): void;
  updateGoal(id: string, changes: Partial<Omit<Goal, "id">>): void;
  deleteGoal(id: string): void;
}

export const useGoalStore = create<GoalStore>((set) => ({
  goals: [],
  hydrated: false,

  hydrate() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        set({ goals: JSON.parse(raw) as Goal[], hydrated: true });
      } else {
        persist(SEED_GOALS);
        set({ goals: SEED_GOALS, hydrated: true });
      }
    } catch {
      persist(SEED_GOALS);
      set({ goals: SEED_GOALS, hydrated: true });
    }
  },

  addGoal(g) {
    set((s) => {
      const next = [g, ...s.goals];
      persist(next);
      return { goals: next };
    });
  },

  updateGoal(id, changes) {
    set((s) => {
      const next = s.goals.map((g) => (g.id === id ? { ...g, ...changes } : g));
      persist(next);
      return { goals: next };
    });
  },

  deleteGoal(id) {
    set((s) => {
      const next = s.goals.filter((g) => g.id !== id);
      persist(next);
      return { goals: next };
    });
  },
}));
