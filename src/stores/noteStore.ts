import { create } from "zustand";
import type { Note } from "@/types/note";

const LS_KEY = "pdj-notes-v2";

const SEED_NOTES: Note[] = [
  {
    id: "n1",
    type: "journal",
    title: "Today's Thoughts",
    content:
      "Grateful for the little things today:\nA warm cup of tea\nA kind message from a friend\nProgress on my goals\nA peaceful evening",
    date: "2024-05-18",
  },
  {
    id: "n2",
    type: "journal",
    title: "Journal Entry",
    content:
      "Today was a productive day. I handled my bills, stayed within budget, and even saved a little! I'm feeling more in control of my finances and excited about what's ahead.\n\nNote to self: Keep going, you're doing amazing!",
    date: "2024-05-18",
  },
  {
    id: "n3",
    type: "journal",
    title: "Financial Reflection",
    content:
      "I'm proud of how I'm managing my money. Here's what I learned this month:\nPlanning ahead reduces stress.\nSmall savings add up over time.\nI can still enjoy life while staying within budget.",
    date: "2024-05-18",
  },
  {
    id: "n4",
    type: "reminder",
    title: "Reminders",
    content:
      "Pay off credit card balance by June\nBuild emergency fund (goal: $2,000)\nReview subscriptions and cancel unused ones\nPlan a relaxing weekend just for me",
    date: "2024-05-18",
  },
  {
    id: "n5",
    type: "dreams",
    title: "Dreams & Goals",
    content:
      "Travel to Japan\nStart my own online business\nAchieve financial freedom\nHelp my family\nLive a life filled with purpose and happiness",
    date: "2024-05-18",
  },
  {
    id: "n6",
    type: "affirmation",
    title: "Affirmations",
    content:
      "I am in control of my financial future.\nI make smart choices with my money.\nI am worthy of abundance.\nI work towards my dreams every day.",
    date: "2024-05-18",
  },
];

function persist(notes: Note[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(notes));
}

interface NoteStore {
  notes: Note[];
  hydrated: boolean;
  hydrate(): void;
  addNote(n: Note): void;
  updateNote(id: string, changes: Partial<Omit<Note, "id">>): void;
  deleteNote(id: string): void;
}

export const useNoteStore = create<NoteStore>((set) => ({
  notes: [],
  hydrated: false,

  hydrate() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        set({ notes: JSON.parse(raw) as Note[], hydrated: true });
      } else {
        persist(SEED_NOTES);
        set({ notes: SEED_NOTES, hydrated: true });
      }
    } catch {
      persist(SEED_NOTES);
      set({ notes: SEED_NOTES, hydrated: true });
    }
  },

  addNote(n) {
    set((s) => {
      const next = [n, ...s.notes];
      persist(next);
      return { notes: next };
    });
  },

  updateNote(id, changes) {
    set((s) => {
      const next = s.notes.map((n) => (n.id === id ? { ...n, ...changes } : n));
      persist(next);
      return { notes: next };
    });
  },

  deleteNote(id) {
    set((s) => {
      const next = s.notes.filter((n) => n.id !== id);
      persist(next);
      return { notes: next };
    });
  },
}));
