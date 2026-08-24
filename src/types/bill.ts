export interface Bill {
  id: string;
  seriesId: string;
  name: string;
  category: string;
  type: "payment" | "refund";
  amount: number;
  actualAmount: number | null;
  dueDate: string;
  actualDate: string | null;
  priority: number;
  frequency: "one-time" | "daily" | "weekly" | "monthly" | "yearly";
  interval: number;
  endDate: string | null;
  paid: boolean;
  notes: string;
  iconKey: string;
  tint: string;
}

export type BillStatus = "paid" | "overdue" | "upcoming";
export type BillDisplayStatus = "Upcoming" | "Overdue" | "Paid";
export type BillFilter = "All" | "Upcoming" | "Overdue" | "Paid";
export type Section =
  | "Dashboard"
  | "Bills"
  | "Calendar"
  | "Budget"
  | "Expenses"
  | "Reports"
  | "Goals"
  | "Notes"
  | "Yearly Overview"
  | "Backup"
  | "Settings"
  | "Management";
