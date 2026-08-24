export interface IncomeEntry {
  id: string;
  date: string;     // "YYYY-MM-DD"
  source: string;   // e.g. "Salary", "Freelance"
  amount: number;
  notes?: string;
}
