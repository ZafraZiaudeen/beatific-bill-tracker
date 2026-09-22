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
  currentMonth: '2026-09',
  income: 5200,

  categories: [
    { id: 1, name: 'Housing',       budget: 1500, spent: 1200, color: '#f97316' },
    { id: 2, name: 'Food',          budget: 600,  spent: 487,  color: '#22c55e' },
    { id: 3, name: 'Transport',     budget: 300,  spent: 276,  color: '#1e293b' },
    { id: 4, name: 'Utilities',     budget: 280,  spent: 275,  color: '#3b82f6' },
    { id: 5, name: 'Entertainment', budget: 200,  spent: 152,  color: '#8b5cf6' },
    { id: 6, name: 'Health',        budget: 150,  spent: 45,   color: '#ec4899' },
    { id: 7, name: 'Shopping',      budget: 400,  spent: 530,  color: '#f59e0b' },
    { id: 8, name: 'Savings',       budget: 530,  spent: 0,    color: '#64748b' },
  ] as BudgetCategory[],

  cashflow: [
    { label: 'Sep 1',  income: 2600, spending: 800  },
    { label: 'Sep 8',  income: 0,    spending: 1100 },
    { label: 'Sep 15', income: 0,    spending: 620  },
    { label: 'Sep 22', income: 850,  spending: 700  },
    { label: 'Sep 28', income: 0,    spending: 482  },
  ] as CashflowEntry[],

  sinkingFunds: [
    { id: 1, icon: '🛡️', name: 'Insurance',    current: 400, target: 660,  targetDate: 'Dec 2026' },
    { id: 2, icon: '🎄', name: 'Holiday Fund', current: 280, target: 800,  targetDate: 'Dec 2026' },
    { id: 3, icon: '🚗', name: 'Car Repair',   current: 150, target: 500,  targetDate: 'Mar 2027' },
  ] as SinkingFund[],

  netWorth: {
    assets: 104230,
    liabilities: 21780,
    history: [
      { month: 'Apr', value: 71000 },
      { month: 'May', value: 74500 },
      { month: 'Jun', value: 76200 },
      { month: 'Jul', value: 79100 },
      { month: 'Aug', value: 80900 },
      { month: 'Sep', value: 82450 },
    ],
  } as NetWorthData,

  securitySettings: DEFAULT_SECURITY,

  goals: [
    {
      id: 1, name: 'Emergency fund', icon: '🎯', color: '#3b82f6', bg: '#eff6ff',
      description: 'Build a cushion for unexpected expenses and financial peace of mind.',
      targetAmount: 3000, savedAmount: 1000, monthlyContribution: 125, targetDate: '2026-12',
      contributions: [
        { id: 1, date: '2026-09-01', amount: 125, source: 'Manual transfer' },
        { id: 2, date: '2026-08-01', amount: 125, source: 'Manual transfer' },
        { id: 3, date: '2026-07-01', amount: 125, source: 'Manual transfer' },
        { id: 4, date: '2026-06-01', amount: 125, source: 'Manual transfer' },
        { id: 5, date: '2026-05-01', amount: 125, source: 'Manual transfer' },
        { id: 6, date: '2026-04-01', amount: 125, source: 'Manual transfer' },
        { id: 7, date: '2026-03-01', amount: 125, source: 'Manual transfer' },
      ],
    },
    {
      id: 2, name: 'Vacation fund', icon: '✈️', color: '#f97316', bg: '#fff7ed',
      description: 'Save for a summer vacation to Europe.',
      targetAmount: 5000, savedAmount: 800, monthlyContribution: 200, targetDate: '2027-06',
      contributions: [
        { id: 1, date: '2026-09-01', amount: 200, source: 'Manual transfer' },
        { id: 2, date: '2026-08-01', amount: 200, source: 'Manual transfer' },
        { id: 3, date: '2026-07-01', amount: 200, source: 'Manual transfer' },
        { id: 4, date: '2026-06-01', amount: 200, source: 'Manual transfer' },
      ],
    },
    {
      id: 3, name: 'New laptop', icon: '💻', color: '#8b5cf6', bg: '#faf5ff',
      description: 'Save for a new development laptop.',
      targetAmount: 2500, savedAmount: 600, monthlyContribution: 150, targetDate: '2027-03',
      contributions: [
        { id: 1, date: '2026-09-01', amount: 150, source: 'Manual transfer' },
        { id: 2, date: '2026-08-01', amount: 150, source: 'Manual transfer' },
        { id: 3, date: '2026-07-01', amount: 150, source: 'Manual transfer' },
        { id: 4, date: '2026-06-01', amount: 150, source: 'Manual transfer' },
      ],
    },
  ] as Goal[],
  nextGoalId: 4,
  nextContribId: 10,

  debts: [
    { id: 1, name: 'Credit Card',  institution: 'Chase Freedom', accountNumber: '4821', icon: '💳', color: '#3b82f6', bg: '#eff6ff', type: 'Credit Card',  balance: 7820, apr: 22.4, minimumPayment: 320, extraPayment: 0 },
    { id: 2, name: 'Student Loan', institution: 'Nelnet',        accountNumber: '1234', icon: '🎓', color: '#22c55e', bg: '#f0fdf4', type: 'Student Loan', balance: 8460, apr: 6.8,  minimumPayment: 280, extraPayment: 0 },
    { id: 3, name: 'Car Loan',     institution: 'Chase Auto',    accountNumber: '5678', icon: '🚗', color: '#f97316', bg: '#fff7ed', type: 'Auto Loan',    balance: 5500, apr: 4.9,  minimumPayment: 120, extraPayment: 0 },
  ] as Debt[],
  nextDebtId: 4,
  debtPlan: { strategy: 'snowball', extraPayment: 200 } as DebtPlan,

  bills: [
    { id: 1, name: 'Rent',        category: 'Housing',       amount: 1200, dueDay: 3,  icon: '🏠', status: 'scheduled', autopay: true,  cadence: 'Monthly' },
    { id: 2, name: 'Internet',    category: 'Utilities',     amount: 70,   dueDay: 7,  icon: '📶', status: 'scheduled', autopay: true,  cadence: 'Monthly' },
    { id: 3, name: 'Electricity', category: 'Utilities',     amount: 120,  dueDay: 10, icon: '⚡', status: 'scheduled', autopay: false, cadence: 'Monthly' },
    { id: 4, name: 'Insurance',   category: 'Insurance',     amount: 220,  dueDay: 15, icon: '🛡️', status: 'scheduled', autopay: true,  cadence: 'Monthly' },
    { id: 5, name: 'Streaming',   category: 'Entertainment', amount: 16,   dueDay: 22, icon: '📺', status: 'scheduled', autopay: false, cadence: 'Monthly' },
    { id: 6, name: 'Credit Card', category: 'Debt',          amount: 180,  dueDay: 28, icon: '💳', status: 'scheduled', autopay: true,  cadence: 'Monthly' },
  ] as Bill[],
  nextBillId: 7,

  accounts: [
    { id: 1, name: 'Checking',    institution: 'Chase Bank',        accountNumber: '1234', type: 'Checking',    group: 'Cash',         balance: 2850,  openingBalance: 2450,  openingDate: '2026-05-01', lastUpdated: '2026-09-22T20:00:00', visibility: true, reconciled: true  },
    { id: 2, name: 'Savings',     institution: 'Ally Bank',         accountNumber: '5678', type: 'Savings',     group: 'Cash',         balance: 1430,  openingBalance: 1000,  openingDate: '2026-05-01', lastUpdated: '2026-09-22T18:00:00', visibility: true, reconciled: false },
    { id: 3, name: 'Credit Card', institution: 'Chase Freedom',     accountNumber: '9012', type: 'Credit Card', group: 'Credit cards', balance: -3200, openingBalance: 0,     openingDate: '2026-05-01', lastUpdated: '2026-09-22T21:00:00', visibility: true, reconciled: false },
    { id: 4, name: 'Student Loan',institution: 'Nelnet',            accountNumber: '3456', type: 'Student Loan',group: 'Loans',        balance: -7980, openingBalance: -8500, openingDate: '2026-05-01', lastUpdated: '2026-09-22T10:00:00', visibility: true, reconciled: false },
    { id: 5, name: 'Car',         institution: 'Toyota Camry · 2019',accountNumber: '',   type: 'Vehicle',     group: 'Other assets', balance: 12050, openingBalance: 15000, openingDate: '2026-05-01', lastUpdated: '2026-09-20T12:00:00', visibility: true, reconciled: false },
  ] as Account[],
  nextAccountId: 6,

  transactions: [
    { id:1,  merchant:'Salary Deposit',         icon:'💰', date:'2026-09-01', category:'Income',        account:'Chase Checking', amount:  5200    },
    { id:2,  merchant:'Rent',                   icon:'🏠', date:'2026-09-05', category:'Housing',       account:'Chase Checking', amount: -1200    },
    { id:3,  merchant:'Whole Foods',            icon:'🛒', date:'2026-09-07', category:'Groceries',     account:'Chase Checking', amount:   -87    },
    { id:4,  merchant:'Netflix',                icon:'📺', date:'2026-09-08', category:'Entertainment', account:'Amex Credit',    amount:   -15.99 },
    { id:5,  merchant:'Shell Gas Station',      icon:'⛽', date:'2026-09-09', category:'Transport',     account:'Chase Checking', amount:   -62    },
    { id:6,  merchant:'AT&T',                   icon:'📱', date:'2026-09-10', category:'Utilities',     account:'Chase Checking', amount:   -85    },
    { id:7,  merchant:"Trader Joe's",           icon:'🛒', date:'2026-09-12', category:'Groceries',     account:'Chase Checking', amount:   -54    },
    { id:8,  merchant:'Uber',                   icon:'🚗', date:'2026-09-13', category:'Transport',     account:'Amex Credit',    amount:   -14.32 },
    { id:9,  merchant:'Target',                 icon:'🎯', date:'2026-09-14', category:'Shopping',      account:'Amex Credit',    amount:   -78    },
    { id:10, merchant:'Internet Bill',          icon:'📶', date:'2026-09-15', category:'Utilities',     account:'Chase Checking', amount:   -70    },
    { id:11, merchant:'Starbucks',              icon:'☕', date:'2026-09-15', category:'Food & Dining', account:'Chase Checking', amount:    -5.48 },
    { id:12, merchant:'Amazon',                 icon:'📦', date:'2026-09-17', category:'Shopping',      account:'Amex Credit',    amount:   -62.17 },
    { id:13, merchant:'Nobu Restaurant',        icon:'🍽️', date:'2026-09-18', category:'Food & Dining', account:'Chase Checking', amount:  -120    },
    { id:14, merchant:'Freelance Payment',      icon:'💻', date:'2026-09-20', category:'Income',        account:'Chase Checking', amount:   850    },
    { id:15, merchant:'Spotify',                icon:'🎵', date:'2026-09-20', category:'Entertainment', account:'Amex Credit',    amount:    -9.99 },
    { id:16, merchant:'Pacific Gas & Electric', icon:'⚡', date:'2026-09-22', category:'Utilities',     account:'Chase Checking', amount:  -120    },
    { id:17, merchant:'Costco',                 icon:'🛒', date:'2026-09-22', category:'Groceries',     account:'Chase Checking', amount:  -142    },
    { id:18, merchant:"Gold's Gym",             icon:'💪', date:'2026-09-25', category:'Health',        account:'Chase Checking', amount:   -45    },
    { id:19, merchant:'Amazon Prime',           icon:'📦', date:'2026-09-27', category:'Shopping',      account:'Amex Credit',    amount:   -14.99 },
    { id:20, merchant:'Uchi Restaurant',        icon:'🍽️', date:'2026-09-28', category:'Food & Dining', account:'Chase Checking', amount:   -67    },
  ] as Transaction[],
  nextTransactionId: 21,
};

function load(): typeof DEFAULTS {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { ...DEFAULTS };
    const s = JSON.parse(raw) as Partial<typeof DEFAULTS>;
    return {
      ...DEFAULTS,
      ...s,
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
    };
  } catch {
    return { ...DEFAULTS };
  }
}

function save(state: Partial<typeof DEFAULTS>) {
  const {
    goals, debts, debtPlan, bills, accounts, transactions,
    categories, sinkingFunds, netWorth, cashflow, income,
    nextGoalId, nextContribId, nextDebtId, nextBillId,
    nextAccountId, nextTransactionId, currentMonth, securitySettings,
  } = state;
  localStorage.setItem(LS_KEY, JSON.stringify({
    goals, debts, debtPlan, bills, accounts, transactions,
    categories, sinkingFunds, netWorth, cashflow, income,
    nextGoalId, nextContribId, nextDebtId, nextBillId,
    nextAccountId, nextTransactionId, currentMonth, securitySettings,
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
