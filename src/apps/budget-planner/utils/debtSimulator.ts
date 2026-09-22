import type { Debt } from '../types';

export interface SimResult {
  months: number;
  totalInterest: number;
  monthlyBalances: number[];
}

export function simulateDebtPayoff(
  debts: Debt[],
  strategy: 'snowball' | 'avalanche',
  globalExtra: number,
): SimResult {
  if (!debts.length) return { months: 0, totalInterest: 0, monthlyBalances: [0] };

  const d = debts.map(debt => ({
    remaining: debt.balance,
    apr: debt.apr,
    min: debt.minimumPayment,
    freed: false,
  }));

  if (strategy === 'snowball') d.sort((a, b) => a.remaining - b.remaining);
  else d.sort((a, b) => b.apr - a.apr);

  let months = 0;
  let totalInterest = 0;
  let freedMin = 0; // accumulates permanently as debts pay off

  const monthlyBalances = [d.reduce((s, x) => s + x.remaining, 0)];

  while (d.some(x => x.remaining > 0.01) && months < 360) {
    months++;
    // Apply monthly interest
    d.forEach(x => {
      if (x.remaining <= 0.01) return;
      const int = x.remaining * (x.apr / 100 / 12);
      totalInterest += int;
      x.remaining += int;
    });
    // Apply minimum payments
    d.forEach(x => {
      if (x.remaining <= 0.01) { x.remaining = 0; return; }
      const pay = Math.min(x.min, x.remaining);
      x.remaining = Math.max(0, x.remaining - pay);
    });
    // Apply globalExtra + all freed minimums → first active debt
    const toApply = globalExtra + freedMin;
    for (let i = 0; i < d.length; i++) {
      if (d[i].remaining > 0.01) {
        const pay = Math.min(toApply, d[i].remaining);
        d[i].remaining = Math.max(0, d[i].remaining - pay);
        break;
      }
    }
    // Permanently accumulate freed minimums when a debt reaches zero
    d.forEach(x => {
      if (x.remaining < 0.01 && !x.freed) {
        x.freed = true;
        x.remaining = 0;
        freedMin += x.min;
      }
    });
    monthlyBalances.push(Math.max(0, d.reduce((s, x) => s + Math.max(0, x.remaining), 0)));
  }

  return { months, totalInterest: Math.round(totalInterest), monthlyBalances };
}

export function payoffDateLabel(months: number, startYM: string): string {
  const [y, m] = startYM.split('-').map(Number);
  const d = new Date(y, m - 1 + months, 1);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}
