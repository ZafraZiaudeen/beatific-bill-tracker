import { create } from 'zustand';
import type {
  Goal, Debt, Bill, Account, Transaction, DebtPlan, LedgerlyView,
  BudgetCategory, CashflowEntry, SinkingFund, NetWorthData, SecuritySettings,
  BudgetMethod, BudgetSettings, AccountVisibilityScope, GoalKind,
} from '../types';
import { accountGroupForType, accountVisibleIn, normalizeAccountType } from '../utils/accounts';

const LS_KEY = 'ldg-state';

const DEFAULT_SECURITY: SecuritySettings = {
  pinEnabled: false,
  pinHash: null,
  autoLockMinutes: 10,
  theme: 'light',
  backupReminderDays: 7,
  lastBackupAt: null,
  syncCodeEnabled: false,
};

const STARTER_CATEGORIES: BudgetCategory[] = [
  { id: 1, name: 'Income', budget: 0, spent: 0, color: '#7a9e7e', group: 'Income', kind: 'income', icon: '💼' },
  { id: 2, name: 'Housing', budget: 0, spent: 0, color: '#c4a35a', group: 'Needs', kind: 'need', icon: '🏠' },
  { id: 3, name: 'Groceries', budget: 0, spent: 0, color: '#c48a8a', group: 'Needs', kind: 'need', icon: '🛒' },
  { id: 4, name: 'Utilities', budget: 0, spent: 0, color: '#6b9ec4', group: 'Needs', kind: 'need', icon: '⚡' },
  { id: 5, name: 'Transport', budget: 0, spent: 0, color: '#9e8abe', group: 'Needs', kind: 'need', icon: '🚗' },
  { id: 6, name: 'Health', budget: 0, spent: 0, color: '#8aaec4', group: 'Needs', kind: 'need', icon: '♡' },
  { id: 7, name: 'Dining', budget: 0, spent: 0, color: '#e89e6e', group: 'Wants', kind: 'want', icon: '🍽️' },
  { id: 8, name: 'Entertainment', budget: 0, spent: 0, color: '#c48aae', group: 'Wants', kind: 'want', icon: '🎬' },
  { id: 9, name: 'Shopping', budget: 0, spent: 0, color: '#7a8e9e', group: 'Wants', kind: 'want', icon: '🛍️' },
  { id: 10, name: 'Savings', budget: 0, spent: 0, color: '#5f8d68', group: 'Savings', kind: 'saving', icon: '🌿' },
  { id: 11, name: 'Debt', budget: 0, spent: 0, color: '#c48a8a', group: 'Debt', kind: 'debt', icon: '💳' },
  { id: 12, name: 'Other', budget: 0, spent: 0, color: '#8a9e8b', group: 'Other', kind: 'other', icon: '📌' },
];

const DEFAULT_BUDGET_SETTINGS: BudgetSettings = {
  paycheckCadence: 'biweekly',
  firstPayday: '',
};

const GOAL_KIND_COLORS: Record<GoalKind, { color: string; bg: string; icon: string }> = {
  emergency: { color: '#4a7060', bg: 'rgba(122,158,126,.15)', icon: '🛟' },
  vacation: { color: '#6b9ec4', bg: 'rgba(107,158,196,.15)', icon: '✈️' },
  purchase: { color: '#c4a35a', bg: 'rgba(196,163,90,.15)', icon: '🛍️' },
  sinking: { color: '#9e8abe', bg: 'rgba(158,138,190,.15)', icon: '🌿' },
  other: { color: '#c48a8a', bg: 'rgba(196,138,138,.15)', icon: '🎯' },
};

const KIND_BY_GROUP: Record<string, BudgetCategory['kind']> = {
  Income: 'income',
  Needs: 'need',
  Housing: 'need',
  Food: 'need',
  Essentials: 'need',
  Wants: 'want',
  Lifestyle: 'want',
  Savings: 'saving',
  Debt: 'debt',
};

const COLOR_BY_GROUP: Record<string, string> = {
  Income: '#7a9e7e',
  Needs: '#7a9e7e',
  Housing: '#c4a35a',
  Food: '#c48a8a',
  Transport: '#9e8abe',
  Essentials: '#7a9e7e',
  Wants: '#c48a8a',
  Lifestyle: '#6b9ec4',
  Savings: '#5f8d68',
  Debt: '#c48a8a',
  Other: '#8a9e8b',
};

function normalizeBudgetMethod(method: unknown): BudgetMethod {
  if (method === '503020') return '503020';
  if (method === 'paycheck' || method === 'payself') return 'paycheck';
  return 'zero';
}

function inferGoalKind(goal: Partial<Goal>): GoalKind {
  if (goal.kind && ['emergency', 'vacation', 'purchase', 'sinking', 'other'].includes(goal.kind)) return goal.kind;
  const text = `${goal.name ?? ''} ${goal.description ?? ''}`.toLowerCase();
  if (text.includes('emergency') || text.includes('rainy') || text.includes('safety')) return 'emergency';
  if (text.includes('vacation') || text.includes('travel') || text.includes('trip') || text.includes('holiday')) return 'vacation';
  if (text.includes('car') || text.includes('home') || text.includes('house') || text.includes('laptop') || text.includes('purchase')) return 'purchase';
  if (text.includes('sinking') || text.includes('annual') || text.includes('insurance') || text.includes('tax')) return 'sinking';
  return 'other';
}

function inferGroup(name: string, existing?: string): string {
  if (existing) return existing;
  const lower = name.toLowerCase();
  if (lower.includes('income') || lower.includes('salary') || lower.includes('paycheck')) return 'Income';
  if (lower.includes('save') || lower.includes('investment')) return 'Savings';
  if (lower.includes('debt') || lower.includes('credit') || lower.includes('loan')) return 'Debt';
  if (lower.includes('shop') || lower.includes('entertain') || lower.includes('coffee') || lower.includes('dining')) return 'Wants';
  if (lower.includes('housing') || lower.includes('rent') || lower.includes('mortgage')) return 'Needs';
  if (lower.includes('grocery') || lower.includes('food') || lower.includes('utility') || lower.includes('transport') || lower.includes('health') || lower.includes('insurance') || lower.includes('fuel') || lower.includes('phone')) return 'Needs';
  return 'Other';
}

function normalizeCategory(category: BudgetCategory, fallbackId: number): BudgetCategory {
  const group = inferGroup(category.name, category.group);
  return {
    ...category,
    id: Number.isFinite(category.id) ? category.id : fallbackId,
    name: category.name?.trim() || 'Other',
    budget: Number.isFinite(category.budget) ? Math.max(0, category.budget) : 0,
    spent: Number.isFinite(category.spent) ? Math.max(0, category.spent) : 0,
    color: category.color || COLOR_BY_GROUP[group] || '#8a9e8b',
    group,
    kind: category.kind || KIND_BY_GROUP[group] || 'other',
    icon: category.icon || STARTER_CATEGORIES.find(c => c.name === category.name)?.icon || '📌',
    archived: Boolean(category.archived),
  };
}

function normalizeCategories(categories?: BudgetCategory[]): BudgetCategory[] {
  if (!categories || categories.length === 0) return STARTER_CATEGORIES.map(c => ({ ...c }));
  const seen = new Set<string>();
  return categories
    .map((category, index) => normalizeCategory(category, index + 1))
    .filter(category => {
      const key = category.name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function normalizeTransaction(transaction: Transaction): Transaction {
  return {
    ...transaction,
    merchant: transaction.merchant?.trim() || 'Transaction',
    icon: transaction.icon || transaction.merchant?.trim()?.[0]?.toUpperCase() || 'T',
    date: transaction.date || new Date().toISOString().slice(0, 10),
    category: transaction.category?.trim() || 'Other',
    account: transaction.account?.trim() || 'Default Account',
    amount: Number(transaction.amount) || 0,
  };
}

function normalizeGoal(goal: Goal, fallbackId: number): Goal {
  const kind = inferGoalKind(goal);
  const preset = GOAL_KIND_COLORS[kind];
  return {
    ...goal,
    id: Number.isFinite(goal.id) ? goal.id : fallbackId,
    name: goal.name?.trim() || 'Savings goal',
    icon: goal.icon || preset.icon,
    color: goal.color || preset.color,
    bg: goal.bg || preset.bg,
    description: goal.description || '',
    targetAmount: Math.max(0, Number(goal.targetAmount) || 0),
    savedAmount: Math.max(0, Number(goal.savedAmount) || 0),
    monthlyContribution: Math.max(0, Number(goal.monthlyContribution) || 0),
    targetDate: goal.targetDate || new Date().toISOString().slice(0, 7),
    contributions: (goal.contributions ?? []).map((contribution, index) => ({
      id: Number.isFinite(contribution.id) ? contribution.id : index + 1,
      date: contribution.date || new Date().toISOString().slice(0, 10),
      amount: Math.max(0, Number(contribution.amount) || 0),
      source: contribution.source || 'Manual transfer',
    })),
    kind,
  };
}

function normalizeDebt(debt: Debt, fallbackId: number): Debt {
  return {
    ...debt,
    id: Number.isFinite(debt.id) ? debt.id : fallbackId,
    name: debt.name?.trim() || 'Debt',
    institution: debt.institution?.trim() || 'Manual',
    accountNumber: debt.accountNumber?.trim() || '',
    icon: debt.icon || '💳',
    color: debt.color || '#c48a8a',
    bg: debt.bg || 'rgba(196,138,138,.15)',
    type: debt.type || 'Other',
    balance: Math.max(0, Number(debt.balance) || 0),
    apr: Math.max(0, Number(debt.apr) || 0),
    minimumPayment: Math.max(0, Number(debt.minimumPayment) || 0),
    extraPayment: Math.max(0, Number(debt.extraPayment) || 0),
    openedDate: debt.openedDate || '',
    targetPayoffDate: debt.targetPayoffDate || '',
    notes: debt.notes || '',
  };
}

function normalizeBill(bill: Bill, fallbackId: number): Bill {
  const dueDay = Math.min(31, Math.max(1, Number(bill.dueDay) || 1));
  return {
    ...bill,
    id: Number.isFinite(bill.id) ? bill.id : fallbackId,
    name: bill.name?.trim() || 'Bill',
    category: bill.category?.trim() || 'Other',
    amount: Math.max(0, Number(bill.amount) || 0),
    dueDay,
    icon: bill.icon || '💸',
    status: bill.status || 'scheduled',
    autopay: Boolean(bill.autopay),
    cadence: bill.cadence || 'Monthly',
    account: bill.account?.trim() || '',
    startDate: bill.startDate || '',
    endDate: bill.endDate || '',
    lastPaidDate: bill.lastPaidDate || '',
    notes: bill.notes || '',
    active: bill.active !== false,
  };
}

function normalizeAccount(account: Account, fallbackId: number): Account {
  const type = normalizeAccountType(account.type);
  const visibility = account.visibility !== false;
  const reconciled = Boolean(account.reconciled);
  return {
    ...account,
    id: Number.isFinite(account.id) ? account.id : fallbackId,
    name: account.name?.trim() || 'Manual account',
    institution: account.institution?.trim() || 'Manual',
    accountNumber: account.accountNumber?.trim() || '',
    type,
    group: account.group || accountGroupForType(type),
    balance: Number(account.balance) || 0,
    openingBalance: Number(account.openingBalance) || 0,
    openingDate: account.openingDate || new Date().toISOString().slice(0, 10),
    lastUpdated: account.lastUpdated || new Date().toISOString(),
    visibility,
    visibilityScopes: {
      dashboard: visibility,
      reports: visibility,
      networth: visibility,
      budget: visibility,
      ...(account.visibilityScopes ?? {}),
    },
    reconciled,
    lastReconciledAt: account.lastReconciledAt || (reconciled ? account.lastUpdated || new Date().toISOString() : ''),
    notes: account.notes || '',
    importedAt: account.importedAt || '',
  };
}

function normalizeBills(bills?: Bill[]): Bill[] {
  return (bills ?? []).map((bill, index) => normalizeBill(bill, index + 1));
}

function normalizeAccounts(accounts?: Account[]): Account[] {
  return (accounts ?? []).map((account, index) => normalizeAccount(account, index + 1));
}

function normalizeGoals(goals?: Goal[]): Goal[] {
  return (goals ?? []).map((goal, index) => normalizeGoal(goal, index + 1));
}

function normalizeDebts(debts?: Debt[]): Debt[] {
  return (debts ?? []).map((debt, index) => normalizeDebt(debt, index + 1));
}

function normalizeDebtPlan(plan?: DebtPlan): DebtPlan {
  return {
    strategy: plan?.strategy === 'avalanche' ? 'avalanche' : 'snowball',
    extraPayment: Math.max(0, Number(plan?.extraPayment) || 0),
    startMonth: plan?.startMonth || new Date().toISOString().slice(0, 7),
  };
}

function normalizeNetWorthData(netWorth?: NetWorthData): NetWorthData {
  const history = (netWorth?.history ?? [])
    .map((entry, index) => {
      const value = Number.isFinite(Number(entry.value)) ? Number(entry.value) : 0;
      const assets = Number.isFinite(Number(entry.assets)) ? Math.max(0, Number(entry.assets)) : Math.max(value, 0);
      const liabilities = Number.isFinite(Number(entry.liabilities)) ? Math.max(0, Number(entry.liabilities)) : Math.max(assets - value, 0);
      return {
        month: entry.month || new Date().toISOString().slice(0, 7),
        value: Number.isFinite(Number(entry.value)) ? value : assets - liabilities,
        assets,
        liabilities,
        capturedAt: entry.capturedAt || '',
        _index: index,
      };
    })
    .sort((a, b) => a.month.localeCompare(b.month) || a._index - b._index)
    .map(entry => ({
      month: entry.month,
      value: entry.value,
      assets: entry.assets,
      liabilities: entry.liabilities,
      capturedAt: entry.capturedAt,
    }));

  return {
    assets: Math.max(0, Number(netWorth?.assets) || 0),
    liabilities: Math.max(0, Number(netWorth?.liabilities) || 0),
    history,
  };
}

function computeLiveNetWorth(accounts: Account[], scope: AccountVisibilityScope = 'networth') {
  const visibleAccounts = accounts.filter(account => accountVisibleIn(account, scope));
  const assets = visibleAccounts.filter(account => account.balance > 0).reduce((sum, account) => sum + account.balance, 0);
  const liabilities = visibleAccounts.filter(account => account.balance < 0).reduce((sum, account) => sum + Math.abs(account.balance), 0);
  return { assets, liabilities, value: assets - liabilities };
}

function syncNetWorthTotals(netWorth: NetWorthData, accounts: Account[]): NetWorthData {
  const normalized = normalizeNetWorthData(netWorth);
  const live = computeLiveNetWorth(accounts, 'networth');
  return { ...normalized, assets: live.assets, liabilities: live.liabilities };
}

function upsertNetWorthHistory(netWorth: NetWorthData, accounts: Account[], month: string): NetWorthData {
  const normalized = syncNetWorthTotals(netWorth, accounts);
  const live = computeLiveNetWorth(accounts, 'networth');
  const entry = {
    month,
    value: live.value,
    assets: live.assets,
    liabilities: live.liabilities,
    capturedAt: new Date().toISOString(),
  };
  const hasMonth = normalized.history.some(item => item.month === month);
  return {
    ...normalized,
    history: (hasMonth
      ? normalized.history.map(item => item.month === month ? entry : item)
      : [...normalized.history, entry]
    ).sort((a, b) => a.month.localeCompare(b.month)),
  };
}

const DEFAULTS = {
  userName: '',
  currentMonth: new Date().toISOString().slice(0, 7),
  income: 0,

  budgetMethod: 'zero' as BudgetMethod,
  budgetSettings: DEFAULT_BUDGET_SETTINGS,
  budgetConfigured: false,

  categories: STARTER_CATEGORIES.map(c => ({ ...c })) as BudgetCategory[],
  cashflow: [] as CashflowEntry[],
  sinkingFunds: [] as SinkingFund[],

  netWorth: {
    assets: 0,
    liabilities: 0,
    history: [],
  } as NetWorthData,

  securitySettings: DEFAULT_SECURITY,

  goals: [] as Goal[],
  nextGoalId: 1,
  nextContribId: 1,

  debts: [] as Debt[],
  nextDebtId: 1,
  debtPlan: { strategy: 'snowball', extraPayment: 0, startMonth: new Date().toISOString().slice(0, 7) } as DebtPlan,

  bills: [] as Bill[],
  nextBillId: 1,

  accounts: [] as Account[],
  nextAccountId: 1,

  transactions: [] as Transaction[],
  nextTransactionId: 1,
};

function load(): typeof DEFAULTS {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { ...DEFAULTS };
    const s = JSON.parse(raw) as Partial<typeof DEFAULTS> & { budgetMethod?: unknown };
    const categories = normalizeCategories(s.categories);
    const accounts = normalizeAccounts(s.accounts);
    const next = {
      ...DEFAULTS,
      ...s,
      userName: s.userName ?? DEFAULTS.userName,
      currentMonth: s.currentMonth || new Date().toISOString().slice(0, 7),
      goals:        normalizeGoals(s.goals),
      debts:        normalizeDebts(s.debts),
      bills:        normalizeBills(s.bills),
      accounts,
      debtPlan:     normalizeDebtPlan(s.debtPlan),
      transactions: (s.transactions ?? DEFAULTS.transactions).map(normalizeTransaction),
      categories,
      sinkingFunds: s.sinkingFunds ?? DEFAULTS.sinkingFunds,
      netWorth:     syncNetWorthTotals(normalizeNetWorthData(s.netWorth), accounts),
      cashflow:     s.cashflow     ?? DEFAULTS.cashflow,
      securitySettings: { ...DEFAULT_SECURITY, ...(s.securitySettings ?? {}) },
      budgetMethod: normalizeBudgetMethod(s.budgetMethod),
      budgetSettings: { ...DEFAULT_BUDGET_SETTINGS, ...(s.budgetSettings ?? {}) },
      budgetConfigured: s.budgetConfigured ?? false,
    };
    if (!s.categories || s.categories.length === 0 || (s.budgetMethod as string) === 'payself' || s.bills || s.accounts || s.goals || s.debts || s.debtPlan) save(next);
    return next;
  } catch {
    return { ...DEFAULTS };
  }
}

function save(state: Partial<typeof DEFAULTS>) {
  const {
    goals, debts, debtPlan, bills, accounts, transactions,
    categories, sinkingFunds, netWorth, cashflow, income, budgetMethod, budgetSettings,
    nextGoalId, nextContribId, nextDebtId, nextBillId,
    nextAccountId, nextTransactionId, currentMonth, securitySettings,
    budgetConfigured, userName,
  } = state;
  localStorage.setItem(LS_KEY, JSON.stringify({
    goals, debts, debtPlan, bills, accounts, transactions,
    categories, sinkingFunds, netWorth, cashflow, income, budgetMethod, budgetSettings,
    nextGoalId, nextContribId, nextDebtId, nextBillId,
    nextAccountId, nextTransactionId, currentMonth, securitySettings,
    budgetConfigured, userName,
  }));
}

function backupFromState(state: Partial<typeof DEFAULTS>) {
  const {
    userName, currentMonth, income, budgetMethod, budgetSettings, budgetConfigured,
    categories, cashflow, sinkingFunds, netWorth,
    goals, nextGoalId, nextContribId, debts, nextDebtId, debtPlan,
    bills, nextBillId, accounts, nextAccountId, transactions,
    nextTransactionId, securitySettings,
  } = state;
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    userName, currentMonth, income, budgetMethod, budgetSettings, budgetConfigured,
    categories, cashflow, sinkingFunds, netWorth,
    goals, nextGoalId, nextContribId, debts, nextDebtId, debtPlan,
    bills, nextBillId, accounts, nextAccountId, transactions,
    nextTransactionId, securitySettings,
  };
}

function mergeImportedData(raw: Partial<typeof DEFAULTS>) {
  return {
    ...DEFAULTS,
    ...raw,
    userName: raw.userName ?? DEFAULTS.userName,
    goals: normalizeGoals(raw.goals),
    debts: normalizeDebts(raw.debts),
    bills: normalizeBills(raw.bills),
    accounts: normalizeAccounts(raw.accounts),
    debtPlan: normalizeDebtPlan(raw.debtPlan),
    transactions: (raw.transactions ?? DEFAULTS.transactions).map(normalizeTransaction),
    categories: normalizeCategories(raw.categories),
    sinkingFunds: raw.sinkingFunds ?? DEFAULTS.sinkingFunds,
    netWorth: syncNetWorthTotals(normalizeNetWorthData(raw.netWorth), normalizeAccounts(raw.accounts)),
    cashflow: raw.cashflow ?? DEFAULTS.cashflow,
    budgetMethod: normalizeBudgetMethod(raw.budgetMethod),
    budgetSettings: { ...DEFAULT_BUDGET_SETTINGS, ...(raw.budgetSettings ?? {}) },
    securitySettings: { ...DEFAULT_SECURITY, ...(raw.securitySettings ?? {}) },
  };
}

interface LedgerlyStore extends ReturnType<typeof load> {
  // UI state (not persisted)
  view: LedgerlyView;
  selectedGoalId: number | null;
  selectedDebtId: number | null;

  setView(v: LedgerlyView): void;
  setSelectedGoalId(id: number | null): void;
  setSelectedDebtId(id: number | null): void;

  // Goals
  addGoal(g: Omit<Goal, 'id' | 'contributions'>): void;
  updateGoal(id: number, changes: Partial<Goal>): void;
  deleteGoal(id: number): void;
  addContribution(goalId: number, amount: number, date: string, source: string): void;

  // Debts
  addDebt(d: Omit<Debt, 'id'>): void;
  updateDebt(id: number, changes: Partial<Debt>): void;
  deleteDebt(id: number): void;
  setDebtPlan(plan: DebtPlan): void;

  // Bills
  addBill(b: Omit<Bill, 'id'>): void;
  updateBill(id: number, changes: Partial<Bill>): void;
  deleteBill(id: number): void;
  toggleAutopay(id: number): void;
  markBillPaid(id: number, paidDate?: string): void;
  recordBillPayment(id: number, paidDate?: string): boolean;

  // Accounts
  addAccount(a: Omit<Account, 'id'>): void;
  updateAccount(id: number, changes: Partial<Account>): void;
  deleteAccount(id: number): void;
  toggleVisibility(id: number): void;
  setAccountVisibilityScope(id: number, scope: AccountVisibilityScope, visible: boolean): void;
  updateAccountBalance(id: number, balance: number, updatedAt?: string): void;
  markReconciled(id: number): void;
  importAccountBalances(rows: Array<Partial<Account> & { name: string; balance: number }>): void;

  // Net worth
  getLiveNetWorth(scope?: AccountVisibilityScope): { assets: number; liabilities: number; value: number };
  saveNetWorthSnapshot(month?: string): void;

  // Transactions
  addTransaction(t: Omit<Transaction, 'id'>): void;
  updateTransaction(id: number, changes: Partial<Transaction>): void;
  deleteTransaction(id: number): void;

  // Income, method & setup state
  setIncome(n: number): void;
  setBudgetMethod(m: BudgetMethod): void;
  updateBudgetSettings(patch: Partial<BudgetSettings>): void;
  setBudgetConfigured(v: boolean): void;
  setUserName(name: string): void;

  // Categories
  addCategory(c: Omit<BudgetCategory, 'id' | 'spent'>): void;
  updateCategory(id: number, patch: Partial<BudgetCategory>): void;
  deleteCategory(id: number): void;

  // Data & security
  updateSecuritySettings(patch: Partial<SecuritySettings>): void;
  getBackupData(): ReturnType<typeof backupFromState>;
  importBackupData(raw: unknown): boolean;
  resetLedgerlyData(): void;
  recordBackup(): void;

}

export const useLedgerlyStore = create<LedgerlyStore>((set, get) => {
  const initial = load();
  return {
    ...initial,
    view: 'dashboard',
    selectedGoalId: null,
    selectedDebtId: null,
    setView(v) { set({ view: v }); },
    setSelectedGoalId(id) { set({ selectedGoalId: id }); },
    setSelectedDebtId(id) { set({ selectedDebtId: id }); },

    addGoal(g) {
      set(s => {
        const next = [...s.goals, normalizeGoal({ ...g, id: s.nextGoalId, contributions: [] }, s.nextGoalId)];
        const upd = { goals: next, nextGoalId: s.nextGoalId + 1 };
        save({ ...s, ...upd });
        return upd;
      });
    },
    updateGoal(id, changes) {
      set(s => {
        const next = s.goals.map(g => g.id === id ? normalizeGoal({ ...g, ...changes, id }, id) : g);
        save({ ...s, goals: next });
        return { goals: next };
      });
    },
    deleteGoal(id) {
      set(s => {
        const next = s.goals.filter(g => g.id !== id);
        save({ ...s, goals: next });
        return { goals: next, selectedGoalId: null, view: 'goals' as LedgerlyView };
      });
    },
    addContribution(goalId, amount, date, source) {
      set(s => {
        const contrib = { id: s.nextContribId, date, amount, source };
        const next = s.goals.map(g =>
          g.id === goalId
            ? normalizeGoal({ ...g, savedAmount: g.savedAmount + amount, contributions: [contrib, ...g.contributions] }, g.id)
            : g
        );
        const upd = { goals: next, nextContribId: s.nextContribId + 1 };
        save({ ...s, ...upd });
        return upd;
      });
    },

    addDebt(d) {
      set(s => {
        const next = [...s.debts, normalizeDebt({ ...d, id: s.nextDebtId }, s.nextDebtId)];
        const upd = { debts: next, nextDebtId: s.nextDebtId + 1 };
        save({ ...s, ...upd });
        return upd;
      });
    },
    updateDebt(id, changes) {
      set(s => {
        const next = s.debts.map(d => d.id === id ? normalizeDebt({ ...d, ...changes, id }, id) : d);
        save({ ...s, debts: next });
        return { debts: next };
      });
    },
    deleteDebt(id) {
      set(s => {
        const next = s.debts.filter(d => d.id !== id);
        save({ ...s, debts: next });
        return { debts: next, selectedDebtId: s.selectedDebtId === id ? null : s.selectedDebtId };
      });
    },
    setDebtPlan(plan) {
      set(s => {
        const next = normalizeDebtPlan(plan);
        save({ ...s, debtPlan: next });
        return { debtPlan: next };
      });
    },

    addBill(b) {
      set(s => {
        const next = [...s.bills, normalizeBill({ ...b, id: s.nextBillId }, s.nextBillId)];
        const upd = { bills: next, nextBillId: s.nextBillId + 1 };
        save({ ...s, ...upd });
        return upd;
      });
    },
    updateBill(id, changes) {
      set(s => {
        const next = s.bills.map(b => b.id === id ? normalizeBill({ ...b, ...changes, id }, id) : b);
        save({ ...s, bills: next });
        return { bills: next };
      });
    },
    deleteBill(id) {
      set(s => {
        const next = s.bills.filter(b => b.id !== id);
        save({ ...s, bills: next });
        return { bills: next };
      });
    },
    toggleAutopay(id) {
      const { bills } = get();
      const bill = bills.find(b => b.id === id);
      if (bill) get().updateBill(id, { autopay: !bill.autopay });
    },
    markBillPaid(id, paidDate) {
      get().updateBill(id, {
        status: 'paid',
        lastPaidDate: paidDate || new Date().toISOString().slice(0, 10),
      });
    },
    recordBillPayment(id, paidDate) {
      const paymentDate = paidDate || new Date().toISOString().slice(0, 10);
      const state = get();
      const bill = state.bills.find(b => b.id === id);
      if (!bill) return false;
      set(s => {
        const transactionId = s.nextTransactionId;
        const transaction = normalizeTransaction({
          id: transactionId,
          merchant: bill.name,
          icon: bill.icon || '💸',
          date: paymentDate,
          category: bill.category || 'Other',
          account: bill.account || 'Default Account',
          amount: -Math.abs(Number(bill.amount) || 0),
          notes: `Recurring bill payment${bill.autopay ? ' · autopay' : ''}`,
          billId: bill.id,
        });
        const transactions = [transaction, ...s.transactions];
        const bills = s.bills.map(b => b.id === id
          ? normalizeBill({ ...b, status: 'paid', lastPaidDate: paymentDate, paymentTransactionId: transactionId }, id)
          : b
        );
        const accounts = s.accounts.map(account => {
          if (!bill.account || account.name !== bill.account) return account;
          return normalizeAccount({
            ...account,
            balance: account.balance + transaction.amount,
            lastUpdated: new Date().toISOString(),
            reconciled: false,
            lastReconciledAt: '',
          }, account.id);
        });
        const netWorth = syncNetWorthTotals(s.netWorth, accounts);
        const upd = { transactions, bills, accounts, netWorth, nextTransactionId: s.nextTransactionId + 1 };
        save({ ...s, ...upd });
        return upd;
      });
      return true;
    },

    addAccount(a) {
      set(s => {
        const next = [...s.accounts, normalizeAccount({ ...a, id: s.nextAccountId }, s.nextAccountId)];
        const netWorth = syncNetWorthTotals(s.netWorth, next);
        const upd = { accounts: next, netWorth, nextAccountId: s.nextAccountId + 1 };
        save({ ...s, ...upd });
        return upd;
      });
    },
    updateAccount(id, changes) {
      set(s => {
        const next = s.accounts.map(a => {
          if (a.id !== id) return a;
          const balanceChanged = Object.prototype.hasOwnProperty.call(changes, 'balance') && changes.balance !== a.balance;
          return normalizeAccount({
            ...a,
            ...changes,
            reconciled: balanceChanged ? false : changes.reconciled ?? a.reconciled,
            lastReconciledAt: balanceChanged ? '' : changes.lastReconciledAt ?? a.lastReconciledAt,
          }, id);
        });
        const netWorth = syncNetWorthTotals(s.netWorth, next);
        save({ ...s, accounts: next, netWorth });
        return { accounts: next, netWorth };
      });
    },
    deleteAccount(id) {
      set(s => {
        const next = s.accounts.filter(a => a.id !== id);
        const netWorth = syncNetWorthTotals(s.netWorth, next);
        save({ ...s, accounts: next, netWorth });
        return { accounts: next, netWorth };
      });
    },
    toggleVisibility(id) {
      const { accounts } = get();
      const acc = accounts.find(a => a.id === id);
      if (acc) {
        const visible = !acc.visibility;
        get().updateAccount(id, {
          visibility: visible,
          visibilityScopes: {
            dashboard: visible,
            reports: visible,
            networth: visible,
            budget: visible,
          },
        });
      }
    },
    setAccountVisibilityScope(id, scope, visible) {
      const { accounts } = get();
      const acc = accounts.find(a => a.id === id);
      if (!acc) return;
      get().updateAccount(id, {
        visibility: true,
        visibilityScopes: { ...(acc.visibilityScopes ?? {}), [scope]: visible },
      });
    },
    updateAccountBalance(id, balance, updatedAt) {
      get().updateAccount(id, {
        balance,
        lastUpdated: updatedAt || new Date().toISOString(),
        reconciled: false,
        lastReconciledAt: '',
      });
    },
    markReconciled(id) {
      get().updateAccount(id, { reconciled: true, lastReconciledAt: new Date().toISOString() });
    },
    importAccountBalances(rows) {
      set(s => {
        let nextAccountId = s.nextAccountId;
        const now = new Date().toISOString();
        const keyFor = (a: Partial<Account> & { name: string }) => [
          a.name?.trim().toLowerCase(),
          a.institution?.trim().toLowerCase() || '',
          a.accountNumber?.trim() || '',
        ].join('|');
        const accounts = [...s.accounts];
        rows.forEach(row => {
          const name = row.name?.trim();
          if (!name || !Number.isFinite(Number(row.balance))) return;
          const type = normalizeAccountType(row.type);
          const incoming = normalizeAccount({
            ...row,
            id: nextAccountId,
            name,
            type,
            institution: row.institution?.trim() || 'Imported',
            accountNumber: row.accountNumber?.trim() || '',
            group: row.group || accountGroupForType(type),
            balance: Number(row.balance) || 0,
            openingBalance: Number(row.openingBalance ?? row.balance) || 0,
            openingDate: row.openingDate || new Date().toISOString().slice(0, 10),
            lastUpdated: row.lastUpdated || now,
            visibility: row.visibility !== false,
            reconciled: Boolean(row.reconciled),
            importedAt: now,
          }, nextAccountId);
          const key = keyFor(incoming);
          const matchIndex = accounts.findIndex(account => keyFor(account) === key || account.name.toLowerCase() === incoming.name.toLowerCase());
          if (matchIndex >= 0) {
            accounts[matchIndex] = normalizeAccount({
              ...accounts[matchIndex],
              ...incoming,
              id: accounts[matchIndex].id,
              openingBalance: accounts[matchIndex].openingBalance,
              openingDate: accounts[matchIndex].openingDate,
              reconciled: false,
              lastReconciledAt: '',
            }, accounts[matchIndex].id);
          } else {
            accounts.push(incoming);
            nextAccountId += 1;
          }
        });
        const netWorth = syncNetWorthTotals(s.netWorth, accounts);
        const upd = { accounts, netWorth, nextAccountId };
        save({ ...s, ...upd });
        return upd;
      });
    },

    getLiveNetWorth(scope = 'networth') {
      return computeLiveNetWorth(get().accounts, scope);
    },
    saveNetWorthSnapshot(month) {
      set(s => {
        const netWorth = upsertNetWorthHistory(s.netWorth, s.accounts, month || s.currentMonth);
        save({ ...s, netWorth });
        return { netWorth };
      });
    },

    addTransaction(t) {
      set(s => {
        const next = [normalizeTransaction({ ...t, id: s.nextTransactionId }), ...s.transactions];
        const upd = { transactions: next, nextTransactionId: s.nextTransactionId + 1 };
        save({ ...s, ...upd });
        return upd;
      });
    },
    updateTransaction(id, changes) {
      set(s => {
        const next = s.transactions.map(t => (
          t.id === id ? normalizeTransaction({ ...t, ...changes, id }) : t
        ));
        save({ ...s, transactions: next });
        return { transactions: next };
      });
    },
    deleteTransaction(id) {
      set(s => {
        const next = s.transactions.filter(t => t.id !== id);
        save({ ...s, transactions: next });
        return { transactions: next };
      });
    },

    setIncome(n) {
      set(s => { save({ ...s, income: n }); return { income: n }; });
    },
    setBudgetMethod(m) {
      set(s => { save({ ...s, budgetMethod: m }); return { budgetMethod: m }; });
    },
    updateBudgetSettings(patch) {
      set(s => {
        const next = { ...s.budgetSettings, ...patch };
        save({ ...s, budgetSettings: next });
        return { budgetSettings: next };
      });
    },
    setBudgetConfigured(v) {
      set(s => { save({ ...s, budgetConfigured: v }); return { budgetConfigured: v }; });
    },
    setUserName(name) {
      set(s => {
        const next = name.trim();
        save({ ...s, userName: next });
        return { userName: next };
      });
    },

    addCategory(c) {
      set(s => {
        const id = Math.max(0, ...s.categories.map(x => x.id)) + 1;
        const next = [...s.categories, normalizeCategory({ ...c, id, spent: 0 }, id)];
        save({ ...s, categories: next });
        return { categories: next };
      });
    },
    updateCategory(id, patch) {
      set(s => {
        const old = s.categories.find(c => c.id === id);
        const next = s.categories.map(c => c.id === id ? normalizeCategory({ ...c, ...patch }, id) : c);
        const renamed = old && patch.name && old.name !== patch.name;
        const transactions = renamed
          ? s.transactions.map(t => t.category === old.name ? { ...t, category: patch.name as string } : t)
          : s.transactions;
        const bills = renamed
          ? s.bills.map(b => b.category === old.name ? { ...b, category: patch.name as string } : b)
          : s.bills;
        save({ ...s, categories: next, transactions, bills });
        return { categories: next, transactions, bills };
      });
    },
    deleteCategory(id) {
      set(s => {
        const next = s.categories.filter(c => c.id !== id);
        save({ ...s, categories: next });
        return { categories: next };
      });
    },

    updateSecuritySettings(patch) {
      set(s => {
        const next = { ...s.securitySettings, ...patch };
        save({ ...s, securitySettings: next });
        return { securitySettings: next };
      });
    },
    getBackupData() {
      return backupFromState(get());
    },
    importBackupData(raw) {
      if (!raw || typeof raw !== 'object') return false;
      const next = mergeImportedData(raw as Partial<typeof DEFAULTS>);
      save(next);
      set({ ...next, view: get().view, selectedGoalId: null, selectedDebtId: null });
      return true;
    },
    resetLedgerlyData() {
      const next = mergeImportedData({});
      save(next);
      set({ ...next, view: 'dashboard', selectedGoalId: null, selectedDebtId: null });
    },
    recordBackup() {
      get().updateSecuritySettings({ lastBackupAt: new Date().toISOString() });
    },
  };
});
