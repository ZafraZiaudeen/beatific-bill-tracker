export interface AppSettings {
  currency: string;
  currencyPosition: "before" | "after";
  weekStart: "Sunday" | "Monday";
  priorityNames: [string, string, string, string, string];
  categoryNames: [string, string, string, string, string];
  menuVisible: boolean;
  quickStartVisible: boolean;
  contactVisible: boolean;
}

export interface BillGroup {
  title: string;
  names: string[];
}
