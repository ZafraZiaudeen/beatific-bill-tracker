export function fmt(n: number): string {
  return '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function fmtDec(n: number): string {
  return '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function addMonthsToYM(ym: string, n: number): string {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function fmtYM(ym: string): string {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function fmtYMFull(ym: string): string {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function fmtTimeAgo(isoStr: string): string {
  const now = new Date();
  const d = new Date(isoStr);
  const diff = Math.round((now.getTime() - d.getTime()) / 1000 / 60);
  if (diff < 60) return `${diff} minute${diff !== 1 ? 's' : ''} ago`;
  const hrs = Math.round(diff / 60);
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? 's' : ''} ago`;
  const days = Math.round(hrs / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

export function getBillNextDate(dueDay: number, ym: string): string {
  const [y, m] = ym.split('-').map(Number);
  const day = Math.min(dueDay, new Date(y, m, 0).getDate());
  return new Date(y, m - 1, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
