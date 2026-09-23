import type { Debt } from '../types';

export type DebtStrategy = 'snowball' | 'avalanche';

export interface DebtPayoffOrderItem {
  id: number;
  name: string;
  balance: number;
  apr: number;
  minimumPayment: number;
  payoffMonth: number | null;
  payoffDate: string | null;
  interestPaid: number;
}

export interface SimResult {
  strategy: DebtStrategy;
  months: number;
  totalInterest: number;
  totalPaid: number;
  monthlyBalances: number[];
  payoffOrder: DebtPayoffOrderItem[];
  status: 'empty' | 'complete' | 'stalled' | 'capped';
}

interface SimDebt {
  id: number;
  name: string;
  originalBalance: number;
  remaining: number;
  apr: number;
  min: number;
  interestPaid: number;
  payoffMonth: number | null;
}

export function addMonthsToYM(ym: string, months: number): string {
  const [year, month] = ym.split('-').map(Number);
  const date = new Date(year || new Date().getFullYear(), (month || 1) - 1 + months, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function strategySort(strategy: DebtStrategy) {
  return (a: SimDebt, b: SimDebt) => {
    if (strategy === 'snowball') return a.remaining - b.remaining || b.apr - a.apr;
    return b.apr - a.apr || a.remaining - b.remaining;
  };
}

export function simulateDebtPayoff(
  debts: Debt[],
  strategy: DebtStrategy,
  globalExtra: number,
  startYM = new Date().toISOString().slice(0, 7),
): SimResult {
  const activeDebts = debts
    .filter(debt => debt.balance > 0)
    .map<SimDebt>(debt => ({
      id: debt.id,
      name: debt.name,
      originalBalance: debt.balance,
      remaining: debt.balance,
      apr: Math.max(0, debt.apr),
      min: Math.max(0, debt.minimumPayment),
      interestPaid: 0,
      payoffMonth: null,
    }))
    .sort(strategySort(strategy));

  if (!activeDebts.length) {
    return { strategy, months: 0, totalInterest: 0, totalPaid: 0, monthlyBalances: [0], payoffOrder: [], status: 'empty' };
  }

  let months = 0;
  let totalInterest = 0;
  let totalPaid = 0;
  let freedMinimums = 0;
  const monthlyBalances = [activeDebts.reduce((sum, debt) => sum + debt.remaining, 0)];
  const originalTotal = monthlyBalances[0];
  let status: SimResult['status'] = 'complete';

  while (activeDebts.some(debt => debt.remaining > 0.01) && months < 480) {
    months += 1;
    const startBalance = activeDebts.reduce((sum, debt) => sum + debt.remaining, 0);

    for (const debt of activeDebts) {
      if (debt.remaining <= 0.01) continue;
      const interest = debt.remaining * (debt.apr / 100 / 12);
      debt.interestPaid += interest;
      totalInterest += interest;
      debt.remaining += interest;
    }

    for (const debt of activeDebts) {
      if (debt.remaining <= 0.01) continue;
      const payment = Math.min(debt.min, debt.remaining);
      debt.remaining -= payment;
      totalPaid += payment;
      if (debt.remaining <= 0.01 && debt.payoffMonth === null) debt.payoffMonth = months;
    }

    const target = activeDebts.filter(debt => debt.remaining > 0.01).sort(strategySort(strategy))[0];
    if (target) {
      const payment = Math.min(globalExtra + freedMinimums, target.remaining);
      target.remaining -= payment;
      totalPaid += payment;
      if (target.remaining <= 0.01 && target.payoffMonth === null) target.payoffMonth = months;
    }

    for (const debt of activeDebts) {
      if (debt.remaining <= 0.01) {
        debt.remaining = 0;
        if (debt.payoffMonth === months) freedMinimums += debt.min;
      }
    }

    const endBalance = activeDebts.reduce((sum, debt) => sum + debt.remaining, 0);
    monthlyBalances.push(Math.max(0, endBalance));
    if (endBalance >= startBalance && activeDebts.some(debt => debt.remaining > 0.01)) {
      status = 'stalled';
      break;
    }
  }

  if (months >= 480 && activeDebts.some(debt => debt.remaining > 0.01)) status = 'capped';

  const payoffOrder = [...activeDebts]
    .sort((a, b) => (a.payoffMonth ?? 9999) - (b.payoffMonth ?? 9999) || a.name.localeCompare(b.name))
    .map(debt => ({
      id: debt.id,
      name: debt.name,
      balance: debt.originalBalance,
      apr: debt.apr,
      minimumPayment: debt.min,
      payoffMonth: debt.payoffMonth,
      payoffDate: debt.payoffMonth === null ? null : addMonthsToYM(startYM, debt.payoffMonth),
      interestPaid: Math.round(debt.interestPaid),
    }));

  return {
    strategy,
    months,
    totalInterest: Math.round(totalInterest),
    totalPaid: Math.round(Math.max(totalPaid, originalTotal + totalInterest - monthlyBalances[monthlyBalances.length - 1])),
    monthlyBalances,
    payoffOrder,
    status,
  };
}

export function payoffDateLabel(months: number, startYM: string): string {
  const date = addMonthsToYM(startYM, months);
  const [y, m] = date.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}
