import type { Account, AccountVisibilityScope } from '../types';

export const ACCOUNT_TYPES = [
  'Checking',
  'Savings',
  'Cash',
  'Credit Card',
  'Student Loan',
  'Loan',
  'Mortgage',
  'Vehicle',
  'Investment',
  'Brokerage',
  'Retirement',
  'Property',
  'Real Estate',
  'Business',
  'Other',
];

export const ACCOUNT_GROUP_ORDER = ['Checking', 'Savings', 'Cash', 'Credit cards', 'Loans', 'Investments', 'Property', 'Vehicles', 'Other assets'];

export const ACCOUNT_GROUP_MAP: Record<string, string> = {
  Checking: 'Checking',
  Savings: 'Savings',
  Cash: 'Cash',
  'Credit Card': 'Credit cards',
  'Student Loan': 'Loans',
  Loan: 'Loans',
  Mortgage: 'Loans',
  Vehicle: 'Vehicles',
  Investment: 'Investments',
  Brokerage: 'Investments',
  Retirement: 'Investments',
  Property: 'Property',
  'Real Estate': 'Property',
  Business: 'Other assets',
  Other: 'Other assets',
};

export function accountGroupForType(type: string): string {
  return ACCOUNT_GROUP_MAP[type] ?? 'Other assets';
}

export function accountVisibleIn(account: Account, scope: AccountVisibilityScope): boolean {
  if (account.visibility === false) return false;
  return account.visibilityScopes?.[scope] !== false;
}

export function normalizeAccountType(type?: string): string {
  if (!type) return 'Checking';
  if (type === 'Brokerage') return 'Investment';
  if (type === 'Credit') return 'Credit Card';
  if (type === 'Real estate') return 'Real Estate';
  return ACCOUNT_TYPES.includes(type) ? type : 'Other';
}
