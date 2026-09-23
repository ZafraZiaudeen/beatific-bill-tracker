export interface Contribution {
  id: number;
  date: string;
  amount: number;
  source: string;
}

export type GoalKind = 'emergency' | 'vacation' | 'purchase' | 'sinking' | 'other';

export interface Goal {
  id: number;
  name: string;
  icon: string;
  color: string;
  bg: string;
  description: string;
  targetAmount: number;
  savedAmount: number;
  monthlyContribution: number;
  targetDate: string; // 'YYYY-MM'
  contributions: Contribution[];
  kind?: GoalKind;
}

export interface Debt {
  id: number;
  name: string;
  institution: string;
  accountNumber: string;
  icon: string;
  color: string;
  bg: string;
  type: string;
  balance: number;
  apr: number;
  minimumPayment: number;
  extraPayment: number;
  openedDate?: string;
  targetPayoffDate?: string;
  notes?: string;
}

export interface DebtPlan {
  strategy: 'snowball' | 'avalanche';
  extraPayment: number;
  startMonth?: string;
}

export type BudgetMethod = 'zero' | '503020' | 'paycheck';

export interface BudgetSettings {
  paycheckCadence: 'weekly' | 'biweekly';
  firstPayday: string;
}

export interface Bill {
  id: number;
  name: string;
  category: string;
  amount: number;
  dueDay: number;
  icon: string;
  status: string;
  autopay: boolean;
  cadence: string;
  account?: string;
  startDate?: string;
  endDate?: string;
  lastPaidDate?: string;
  paymentTransactionId?: number;
  notes?: string;
  active?: boolean;
}

export type AccountVisibilityScope = 'dashboard' | 'reports' | 'networth' | 'budget';

export type AccountVisibilityScopes = Partial<Record<AccountVisibilityScope, boolean>>;

export interface Account {
  id: number;
  name: string;
  institution: string;
  accountNumber: string;
  type: string;
  group: string;
  balance: number;
  openingBalance: number;
  openingDate: string;
  lastUpdated: string;
  visibility: boolean;
  visibilityScopes?: AccountVisibilityScopes;
  reconciled: boolean;
  lastReconciledAt?: string;
  notes?: string;
  importedAt?: string;
}

// amount: positive = income, negative = expense
export interface Transaction {
  id: number;
  merchant: string;
  icon: string;
  date: string;
  category: string;
  account: string;
  amount: number;
  notes?: string;
  billId?: number;
}

export interface BudgetCategory {
  id: number;
  name: string;
  budget: number;
  spent: number;
  color: string;
  group?: string;
  kind?: 'income' | 'need' | 'want' | 'saving' | 'debt' | 'other';
  icon?: string;
  archived?: boolean;
}

export interface CashflowEntry {
  label: string;
  income: number;
  spending: number;
}

export interface SinkingFund {
  id: number;
  icon: string;
  name: string;
  current: number;
  target: number;
  targetDate: string;
}

export interface NetWorthHistory {
  month: string;
  value: number;
  assets?: number;
  liabilities?: number;
  capturedAt?: string;
}

export interface NetWorthData {
  assets: number;
  liabilities: number;
  history: NetWorthHistory[];
}

export interface SecuritySettings {
  pinEnabled: boolean;
  pinHash: string | null;
  autoLockMinutes: number;
  theme: 'light' | 'dark';
  backupReminderDays: number;
  lastBackupAt: string | null;
  syncCodeEnabled: boolean;
}

export type LedgerlyView =
  | 'dashboard'
  | 'budget'
  | 'transactions'
  | 'bills'
  | 'accounts'
  | 'goals'
  | 'goal-detail'
  | 'debt-planner'
  | 'networth'
  | 'reports'
  | 'categories'
  | 'security'
  | 'management'
  | 'help';

