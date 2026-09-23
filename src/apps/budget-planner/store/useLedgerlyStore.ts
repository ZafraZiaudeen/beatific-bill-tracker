import { create } from 'zustand';
import type {
  Goal, Debt, Bill, Account, Transaction, DebtPlan, LedgerlyView,
  BudgetCategory, CashflowEntry, SinkingFund, NetWorthData, SecuritySettings,
} from '../types';

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

const DEFAULTS = {
  currentMonth: new Date().toISOString().slice(0, 7),
  income: 0,

  budgetMethod: 'zero' as 'zero' | '503020' | 'payself',
  budgetConfigured: false,

  categories: [] as BudgetCategory[],
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
  debtPlan: { strategy: 'snowball', extraPayment: 0 } as DebtPlan,

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
    const s = JSON.parse(raw) as Partial<typeof DEFAULTS>;
    return {
      ...DEFAULTS,
      ...s,
      currentMonth: s.currentMonth || new Date().toISOString().slice(0, 7),
      goals:        s.goals        ?? DEFAULTS.goals,
      debts:        s.debts        ?? DEFAULTS.debts,
      bills:        s.bills        ?? DEFAULTS.bills,
      accounts:     s.accounts     ?? DEFAULTS.accounts,
      debtPlan:     s.debtPlan     ?? DEFAULTS.debtPlan,
      transactions: s.transactions ?? DEFAULTS.transactions,
      categories:   s.categories   ?? DEFAULTS.categories,
      sinkingFunds: s.sinkingFunds ?? DEFAULTS.sinkingFunds,
      netWorth:     s.netWorth     ?? DEFAULTS.netWorth,
      cashflow:     s.cashflow     ?? DEFAULTS.cashflow,
      securitySettings: { ...DEFAULT_SECURITY, ...(s.securitySettings ?? {}) },
      budgetConfigured: s.budgetConfigured ?? false,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

function save(state: Partial<typeof DEFAULTS>) {
  const {
    goals, debts, debtPlan, bills, accounts, transactions,
    categories, sinkingFunds, netWorth, cashflow, income, budgetMethod,
    nextGoalId, nextContribId, nextDebtId, nextBillId,
    nextAccountId, nextTransactionId, currentMonth, securitySettings,
    budgetConfigured,
  } = state;
  localStorage.setItem(LS_KEY, JSON.stringify({
    goals, debts, debtPlan, bills, accounts, transactions,
    categories, sinkingFunds, netWorth, cashflow, income, budgetMethod,
    nextGoalId, nextContribId, nextDebtId, nextBillId,
    nextAccountId, nextTransactionId, currentMonth, securitySettings,
    budgetConfigured,
  }));
}

function backupFromState(state: Partial<typeof DEFAULTS>) {
  const {
    currentMonth, income, categories, cashflow, sinkingFunds, netWorth,
    goals, nextGoalId, nextContribId, debts, nextDebtId, debtPlan,
    bills, nextBillId, accounts, nextAccountId, transactions,
    nextTransactionId, securitySettings,
  } = state;
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    currentMonth, income, categories, cashflow, sinkingFunds, netWorth,
    goals, nextGoalId, nextContribId, debts, nextDebtId, debtPlan,
    bills, nextBillId, accounts, nextAccountId, transactions,
    nextTransactionId, securitySettings,
  };
}

function mergeImportedData(raw: Partial<typeof DEFAULTS>) {
  return {
    ...DEFAULTS,
    ...raw,
    goals: raw.goals ?? DEFAULTS.goals,
    debts: raw.debts ?? DEFAULTS.debts,
    bills: raw.bills ?? DEFAULTS.bills,
    accounts: raw.accounts ?? DEFAULTS.accounts,
    debtPlan: raw.debtPlan ?? DEFAULTS.debtPlan,
    transactions: raw.transactions ?? DEFAULTS.transactions,
    categories: raw.categories ?? DEFAULTS.categories,
    sinkingFunds: raw.sinkingFunds ?? DEFAULTS.sinkingFunds,
    netWorth: raw.netWorth ?? DEFAULTS.netWorth,
    cashflow: raw.cashflow ?? DEFAULTS.cashflow,
    securitySettings: { ...DEFAULT_SECURITY, ...(raw.securitySettings ?? {}) },
  };
}

interface LedgerlyStore extends ReturnType<typeof load> {
  // UI state (not persisted)
  view: LedgerlyView;
  selectedGoalId: number | null;

  setView(v: LedgerlyView): void;
  setSelectedGoalId(id: number | null): void;

  // Goals
  addGoal(g: Omit<Goal, 'id' | 'contributions'>): void;
  updateGoal(id: number, changes: Partial<Goal>): void;
  deleteGoal(id: number): void;
  addContribution(goalId: number, amount: number, date: string, source: string): void;

  // Debts
  updateDebt(id: number, changes: Partial<Debt>): void;
  setDebtPlan(plan: DebtPlan): void;

  // Bills
  addBill(b: Omit<Bill, 'id'>): void;
  updateBill(id: number, changes: Partial<Bill>): void;
  deleteBill(id: number): void;
  toggleAutopay(id: number): void;

  // Accounts
  addAccount(a: Omit<Account, 'id'>): void;
  updateAccount(id: number, changes: Partial<Account>): void;
  toggleVisibility(id: number): void;
  markReconciled(id: number): void;

  // Transactions
  addTransaction(t: Omit<Transaction, 'id'>): void;
  deleteTransaction(id: number): void;

  // Income, method & setup state
  setIncome(n: number): void;
  setBudgetMethod(m: 'zero' | '503020' | 'payself'): void;
  setBudgetConfigured(v: boolean): void;

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

    setView(v) { set({ view: v }); },
    setSelectedGoalId(id) { set({ selectedGoalId: id }); },

    addGoal(g) {
      set(s => {
        const next = [...s.goals, { ...g, id: s.nextGoalId, contributions: [] }];
        const upd = { goals: next, nextGoalId: s.nextGoalId + 1 };
        save({ ...s, ...upd });
        return upd;
      });
    },
    updateGoal(id, changes) {
      set(s => {
        const next = s.goals.map(g => g.id === id ? { ...g, ...changes } : g);
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
            ? { ...g, savedAmount: g.savedAmount + amount, contributions: [contrib, ...g.contributions] }
            : g
        );
        const upd = { goals: next, nextContribId: s.nextContribId + 1 };
        save({ ...s, ...upd });
        return upd;
      });
    },

    updateDebt(id, changes) {
      set(s => {
        const next = s.debts.map(d => d.id === id ? { ...d, ...changes } : d);
        save({ ...s, debts: next });
        return { debts: next };
      });
    },
    setDebtPlan(plan) {
      set(s => { save({ ...s, debtPlan: plan }); return { debtPlan: plan }; });
    },

    addBill(b) {
      set(s => {
        const next = [...s.bills, { ...b, id: s.nextBillId }];
        const upd = { bills: next, nextBillId: s.nextBillId + 1 };
        save({ ...s, ...upd });
        return upd;
      });
    },
    updateBill(id, changes) {
      set(s => {
        const next = s.bills.map(b => b.id === id ? { ...b, ...changes } : b);
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

    addAccount(a) {
      set(s => {
        const next = [...s.accounts, { ...a, id: s.nextAccountId }];
        const upd = { accounts: next, nextAccountId: s.nextAccountId + 1 };
        save({ ...s, ...upd });
        return upd;
      });
    },
    updateAccount(id, changes) {
      set(s => {
        const next = s.accounts.map(a => a.id === id ? { ...a, ...changes } : a);
        save({ ...s, accounts: next });
        return { accounts: next };
      });
    },
    toggleVisibility(id) {
      const { accounts } = get();
      const acc = accounts.find(a => a.id === id);
      if (acc) get().updateAccount(id, { visibility: !acc.visibility });
    },
    markReconciled(id) {
      get().updateAccount(id, { reconciled: true });
    },

    addTransaction(t) {
      set(s => {
        const next = [{ ...t, id: s.nextTransactionId }, ...s.transactions];
        const upd = { transactions: next, nextTransactionId: s.nextTransactionId + 1 };
        save({ ...s, ...upd });
        return upd;
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
    setBudgetConfigured(v) {
      set(s => { save({ ...s, budgetConfigured: v }); return { budgetConfigured: v }; });
    },

    addCategory(c) {
      set(s => {
        const id = Math.max(0, ...s.categories.map(x => x.id)) + 1;
        const next = [...s.categories, { ...c, id, spent: 0 }];
        save({ ...s, categories: next });
        return { categories: next };
      });
    },
    updateCategory(id, patch) {
      set(s => {
        const next = s.categories.map(c => c.id === id ? { ...c, ...patch } : c);
        save({ ...s, categories: next });
        return { categories: next };
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
      set({ ...next, view: get().view, selectedGoalId: null });
      return true;
    },
    resetLedgerlyData() {
      const next = mergeImportedData({});
      save(next);
      set({ ...next, view: 'dashboard', selectedGoalId: null });
    },
    recordBackup() {
      get().updateSecuritySettings({ lastBackupAt: new Date().toISOString() });
    },
  };
});
