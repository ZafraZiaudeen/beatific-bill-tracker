export type ExpenseCategory =
  | "Food & Drinks"
  | "Groceries"
  | "Transportation"
  | "Shopping"
  | "Entertainment"
  | "Personal Care"
  | "Education"
  | "Gifts"
  | "Others";

export interface Expense {
  id: string;
  date: string; // "YYYY-MM-DD"
  description: string;
  category: ExpenseCategory;
  iconKey: string;
  amount: number;
  notes?: string;
}
