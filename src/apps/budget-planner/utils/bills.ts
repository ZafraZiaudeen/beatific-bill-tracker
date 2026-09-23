import type { Bill } from '../types';

export interface BillOccurrence {
  bill: Bill;
  dueDate: string;
  dueDay: number;
  status: 'paid' | 'overdue' | 'scheduled';
  daysUntil: number;
}

const DAY_MS = 86400000;

function parseLocalDate(iso: string): Date | null {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function toIsoDate(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function cadenceKey(cadence?: string): 'monthly' | 'weekly' | 'biweekly' | 'yearly' {
  const key = (cadence || 'Monthly').toLowerCase().replace(/[^a-z]/g, '');
  if (key === 'weekly') return 'weekly';
  if (key === 'biweekly') return 'biweekly';
  if (key === 'yearly' || key === 'annual' || key === 'annually') return 'yearly';
  return 'monthly';
}

function statusForBillDate(bill: Bill, dueDate: Date): BillOccurrence['status'] {
  const dueIso = toIsoDate(dueDate);
  const lastPaid = bill.lastPaidDate || '';
  const legacyPaid = bill.status === 'paid' && !bill.lastPaidDate;
  const isPaid = legacyPaid || lastPaid === dueIso;
  if (isPaid) return 'paid';
  const today = startOfDay(new Date());
  return startOfDay(dueDate).getTime() < today.getTime() ? 'overdue' : 'scheduled';
}

function occurrenceFromDate(bill: Bill, dueDate: Date): BillOccurrence {
  const today = startOfDay(new Date());
  const due = startOfDay(dueDate);
  return {
    bill,
    dueDate: toIsoDate(due),
    dueDay: due.getDate(),
    status: statusForBillDate(bill, due),
    daysUntil: Math.ceil((due.getTime() - today.getTime()) / DAY_MS),
  };
}

export function getBillOccurrencesForMonth(bill: Bill, ym: string): BillOccurrence[] {
  if (bill.active === false) return [];
  const [year, month] = ym.split('-').map(Number);
  if (!year || !month) return [];

  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0);
  const endLimit = bill.endDate ? parseLocalDate(bill.endDate) : null;
  const cadence = cadenceKey(bill.cadence);
  const dueDay = Math.min(Math.max(Number(bill.dueDay) || 1, 1), 31);

  if (cadence === 'monthly') {
    const due = new Date(year, month - 1, Math.min(dueDay, monthEnd.getDate()));
    if (endLimit && due > endLimit) return [];
    if (bill.startDate) {
      const start = parseLocalDate(bill.startDate);
      if (start && due < start) return [];
    }
    return [occurrenceFromDate(bill, due)];
  }

  if (cadence === 'yearly') {
    const anchor = bill.startDate ? parseLocalDate(bill.startDate) : null;
    const dueMonth = anchor ? anchor.getMonth() : month - 1;
    if (dueMonth !== month - 1) return [];
    const due = new Date(year, month - 1, Math.min(dueDay, monthEnd.getDate()));
    if (anchor && due < anchor) return [];
    if (endLimit && due > endLimit) return [];
    return [occurrenceFromDate(bill, due)];
  }

  const step = cadence === 'weekly' ? 7 : 14;
  const anchor = parseLocalDate(bill.startDate || '') ?? new Date(year, month - 1, Math.min(dueDay, monthEnd.getDate()));
  const first = startOfDay(anchor);
  while (first < monthStart) first.setDate(first.getDate() + step);

  const occurrences: BillOccurrence[] = [];
  const cursor = new Date(first);
  while (cursor <= monthEnd) {
    if ((!endLimit || cursor <= endLimit) && cursor >= monthStart) {
      occurrences.push(occurrenceFromDate(bill, cursor));
    }
    cursor.setDate(cursor.getDate() + step);
  }
  return occurrences;
}

export function getNextBillOccurrence(bill: Bill, ym: string): BillOccurrence | null {
  const inMonth = getBillOccurrencesForMonth(bill, ym);
  const upcoming = inMonth.filter(occ => occ.daysUntil >= 0).sort((a, b) => a.daysUntil - b.daysUntil);
  if (upcoming.length) return upcoming[0];
  return inMonth.sort((a, b) => b.daysUntil - a.daysUntil)[0] ?? null;
}

export function getAllBillOccurrencesForMonth(bills: Bill[], ym: string): BillOccurrence[] {
  return bills
    .flatMap(bill => getBillOccurrencesForMonth(bill, ym))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.bill.name.localeCompare(b.bill.name));
}

export function monthlyBillEquivalent(bill: Bill): number {
  const amount = Number(bill.amount) || 0;
  const cadence = cadenceKey(bill.cadence);
  if (cadence === 'weekly') return amount * 52 / 12;
  if (cadence === 'biweekly') return amount * 26 / 12;
  if (cadence === 'yearly') return amount / 12;
  return amount;
}
