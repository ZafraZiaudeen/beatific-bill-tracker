import { useState } from 'react';
import { PageIntroBanner } from '../components/PageIntroBanner';
import { useLedgerlyStore } from '../store/useLedgerlyStore';
import { fmt } from '../utils/formatters';
import type { ReactNode } from 'react';
import { getAllBillOccurrencesForMonth } from '../utils/bills';
import { accountVisibleIn } from '../utils/accounts';

import sprig01 from '../../../assets/budget-assets/botanical-sprigs/botanical-sprigs-01.png';
import sprig02 from '../../../assets/budget-assets/botanical-sprigs/botanical-sprigs-02.png';
import sprig03 from '../../../assets/budget-assets/botanical-sprigs/botanical-sprigs-03.png';
import sprig05 from '../../../assets/budget-assets/botanical-sprigs/botanical-sprigs-05.png';
import flower02 from '../../../assets/budget-assets/flowers-and-leaves/flowers-and-leaves-02.png';
import flower03 from '../../../assets/budget-assets/flowers-and-leaves/flowers-and-leaves-03.png';
import flower05 from '../../../assets/budget-assets/flowers-and-leaves/flowers-and-leaves-05.png';
import heart02 from '../../../assets/budget-assets/hearts/heart-02.png';

const REFLECTIONS = [
  "You're making steady progress, and that's something to be proud of.",
  'Every dollar you save is a vote for the future you want.',
  'Small consistent steps lead to big financial change.',
  'Awareness is the first step you\'re already ahead.',
  "Today's discipline is tomorrow's freedom.",
];

const FUND_COLORS = ['#7a9e7e', '#c4a35a', '#c48a8a', '#9e8abe', '#6b9ec4', '#e89e6e'];

function fmtIsoDay(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function CashFlowSvg({ data }: { data: { label: string; income: number; spending: number }[] }) {
  const W = 420, H = 160, padL = 40, padR = 12, padT = 10, padB = 32;
  const cW = W - padL - padR, cH = H - padT - padB;
  const n = data.length || 1;
  const groupW = cW / n;
  const barW = Math.min(22, groupW * 0.38);
  const gap = 4;
  const maxVal = Math.max(...data.flatMap(d => [d.income, d.spending]), 1);
  const yMax = Math.ceil(maxVal / 500) * 500 || 2000;
  const yLabels = [0, 500, 1000, 1500, 2000].filter(v => v <= yMax);

  const els: ReactNode[] = [];
  yLabels.forEach(v => {
    const y = padT + cH - (v / yMax) * cH;
    els.push(<line key={`gl${v}`} x1={padL} y1={y} x2={W - padR} y2={y} stroke="#d5ddd0" strokeWidth={1} />);
    els.push(<text key={`gt${v}`} x={padL - 6} y={y + 4} textAnchor="end" fontSize={9} fill="#8a9e8b">{v >= 1000 ? `$${v / 1000}k` : `$${v}`}</text>);
  });
  data.forEach((d, i) => {
    const cx = padL + i * groupW + groupW / 2;
    const ix = cx - barW - gap / 2;
    const sx = cx + gap / 2;
    const ih = (d.income / yMax) * cH;
    const sh = (d.spending / yMax) * cH;
    els.push(<rect key={`ib${i}`} x={ix} y={padT + cH - ih} width={barW} height={Math.max(ih, 1)} fill="#7a9e7e" rx={3} />);
    els.push(<rect key={`sb${i}`} x={sx} y={padT + cH - sh} width={barW} height={Math.max(sh, 1)} fill="#c48a8a" rx={3} />);
    els.push(<text key={`xl${i}`} x={cx} y={H - padB + 17} textAnchor="middle" fontSize={9} fill="#8a9e8b">{d.label}</text>);
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 155 }} preserveAspectRatio="xMidYMid meet">
      {els}
    </svg>
  );
}

function NwSvg({ history }: { history: { month: string; value: number }[] }) {
  if (history.length < 2) return null;
  const W = 280, H = 90, padL = 8, padR = 8, padT = 8, padB = 22;
  const cW = W - padL - padR, cH = H - padT - padB;
  const vals = history.map(h => h.value);
  const minV = Math.min(...vals) * 0.95;
  const maxV = Math.max(...vals) * 1.02;
  const range = maxV - minV || 1;
  const n = history.length;
  const xp = (i: number) => padL + (i / (n - 1)) * cW;
  const yp = (v: number) => padT + cH - ((v - minV) / range) * cH;
  const pts = history.map((h, i) => `${xp(i)},${yp(h.value)}`).join(' ');
  const polyPts = `${xp(0)},${padT + cH} ${pts} ${xp(n - 1)},${padT + cH}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 90 }} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="nwGradNew" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7a9e7e" stopOpacity={0.22} />
          <stop offset="100%" stopColor="#7a9e7e" stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <polygon points={polyPts} fill="url(#nwGradNew)" />
      <polyline points={pts} fill="none" stroke="#7a9e7e" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {history.map((h, i) => (
        <g key={i}>
          <circle cx={xp(i)} cy={yp(h.value)} r={3} fill="#7a9e7e" />
          <circle cx={xp(i)} cy={yp(h.value)} r={1.5} fill="white" />
          <text x={xp(i)} y={H} textAnchor="middle" fontSize={8} fill="#8a9e8b">{h.month}</text>
        </g>
      ))}
    </svg>
  );
}

function CalendarWidget({ currentMonth, billDays, onOpenBills, onPrev, onNext }: { currentMonth: string; billDays: Set<number>; onOpenBills: () => void; onPrev: () => void; onNext: () => void }) {
  const [ymYear, ymMon] = currentMonth.split('-').map(Number);
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === ymYear && (today.getMonth() + 1) === ymMon;
  const todayDay = isCurrentMonth ? today.getDate() : -1;
  const firstDay = new Date(ymYear, ymMon - 1, 1).getDay();
  const daysInMonth = new Date(ymYear, ymMon, 0).getDate();
  const monthLabel = new Date(ymYear, ymMon - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="ldg-cal-wrap">
      <div className="ldg-cal-header">
        <span className="ldg-cal-month">{monthLabel}</span>
        <div className="ldg-cal-nav">
          <button className="ldg-cal-btn" onClick={onPrev}>‹</button>
          <button className="ldg-cal-btn" onClick={onNext}>›</button>
        </div>
      </div>
      <div className="ldg-cal-grid">
        {['SUN','MON','TUE','WED','THU','FRI','SAT'].map(d => (
          <div key={d} className="ldg-cal-dow">{d}</div>
        ))}
        {cells.map((day, i) => (
          <button
            type="button"
            key={i}
            className={`ldg-cal-day${day === todayDay ? ' today' : ''}${day === null ? ' empty' : ''}`}
            onClick={() => day && billDays.has(day) && onOpenBills()}
            style={{ border: 0, cursor: day && billDays.has(day) ? 'pointer' : 'default' }}
          >
            {day ?? ''}
            {day && billDays.has(day) ? <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#c48a8a', display: 'block', margin: '2px auto 0' }} /> : null}
          </button>
        ))}
      </div>
      <img src={sprig03} alt="" className="ldg-cal-deco" />
    </div>
  );
}

export function DashboardPage() {
  const income       = useLedgerlyStore(s => s.income);
  const categories   = useLedgerlyStore(s => s.categories);
  const transactions = useLedgerlyStore(s => s.transactions);
  const cashflow     = useLedgerlyStore(s => s.cashflow);
  const sinkingFunds = useLedgerlyStore(s => s.sinkingFunds);
  const netWorth     = useLedgerlyStore(s => s.netWorth);
  const bills        = useLedgerlyStore(s => s.bills);
  const accounts     = useLedgerlyStore(s => s.accounts);
  const currentMonth = useLedgerlyStore(s => s.currentMonth);
  const setView      = useLedgerlyStore(s => s.setView);
  const userName     = useLedgerlyStore(s => s.userName);

  const totalBudget  = categories.reduce((s, c) => s + c.budget, 0);
  const safeToSpend  = Math.max(0, income - totalBudget);
  const billOccurrences = getAllBillOccurrencesForMonth(bills, currentMonth);
  const totalBills   = billOccurrences.reduce((s, occ) => s + occ.bill.amount, 0);

  const sfCurrent    = sinkingFunds.reduce((s, f) => s + f.current, 0);
  const sfTarget     = sinkingFunds.reduce((s, f) => s + f.target, 0);
  const sfPct        = sfTarget > 0 ? Math.round(sfCurrent / sfTarget * 100) : 0;

  const dashboardAccounts = accounts.filter(account => accountVisibleIn(account, 'dashboard'));
  const dashboardAssets = dashboardAccounts.filter(account => account.balance > 0).reduce((sum, account) => sum + account.balance, 0);
  const dashboardLiabilities = dashboardAccounts.filter(account => account.balance < 0).reduce((sum, account) => sum + Math.abs(account.balance), 0);
  const nwTotal      = dashboardAssets - dashboardLiabilities;
  const history      = netWorth.history;
  const prevNw       = history.length >= 2 ? history[history.length - 2].value : nwTotal;
  const nwChange     = prevNw > 0 ? ((nwTotal - prevNw) / prevNw * 100).toFixed(1) : '0.0';
  const nwUp         = parseFloat(nwChange) >= 0;

  const [ymYear, ymMon] = currentMonth.split('-');
  const monthLabel = new Date(parseInt(ymYear), parseInt(ymMon) - 1, 1)
    .toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const sortedBills = billOccurrences.filter(occ => occ.status !== 'paid').slice(0, 5);
  const goalBills   = billOccurrences.slice(0, 4);
  const billDays = new Set(billOccurrences.map(occ => occ.dueDay));
  const spentByCategory = new Map<string, number>();
  transactions
    .filter(transaction => transaction.date.startsWith(currentMonth) && transaction.amount < 0)
    .forEach(transaction => {
      spentByCategory.set(
        transaction.category,
        (spentByCategory.get(transaction.category) ?? 0) + Math.abs(transaction.amount),
      );
    });
  const budgetCategoryRows = categories
    .filter(category => !category.archived && category.kind !== 'income')
    .slice(0, 4);

  const dayOfMonth = new Date().getDate();
  const reflection  = REFLECTIONS[dayOfMonth % REFLECTIONS.length];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const displayName = userName || 'Dreamer';

  const [calMonth, setCalMonth] = useState(currentMonth);
  const calBillOccurrences = getAllBillOccurrencesForMonth(bills, calMonth);
  const calBillDays = new Set(calBillOccurrences.map(occ => occ.dueDay));
  const prevCalMonth = () => {
    const [y, m] = calMonth.split('-').map(Number);
    const d = new Date(y, m - 2, 1);
    setCalMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };
  const nextCalMonth = () => {
    const [y, m] = calMonth.split('-').map(Number);
    const d = new Date(y, m, 1);
    setCalMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  return (
    <div className="ldg-dash-new">
      <PageIntroBanner view="dashboard" />

      {/* ── Header ── */}
      <div className="ldg-dash-hdr">
        <div className="ldg-dash-hdr-left">
          <h1 className="ldg-greeting-text">
            {greeting}, {displayName}!
            <img src={heart02} alt="♡" className="ldg-heart-icon" />
          </h1>
          <p className="ldg-greeting-sub">Here's your financial overview for today.</p>
        </div>
        <div className="ldg-dash-hdr-right">
          <div className="ldg-month-chip">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="15" height="15">
              <rect x="1" y="2" width="14" height="13" rx="2"/><path d="M1 6h14M5 2v4M11 2v4"/>
            </svg>
            {monthLabel}
            <svg viewBox="0 0 10 6" fill="currentColor" width="9" height="6" style={{ opacity: .5 }}>
              <path d="M0 0l5 6 5-6z"/>
            </svg>
          </div>
          <div className="ldg-privacy-badge">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="13" height="13">
              <path d="M8 1.5L1.5 4.5v4c0 3.5 2.8 6.3 6.5 7 3.7-.7 6.5-3.5 6.5-7v-4L8 1.5z"/>
            </svg>
            Local only · Nothing sent to any server
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="ldg-stat-row">

        <div className="ldg-stat-card ldg-stat-cream">
          <div className="ldg-stat-inner">
            <div className="ldg-stat-icon ldg-stat-icon-leaf">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M10 2C10 2 4 6.5 4 12a6 6 0 0012 0C16 6.5 10 2 10 2z"/>
                <path d="M10 2v15" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="ldg-stat-label">Total balance</div>
            <div className="ldg-stat-amount">{fmt(nwTotal)}</div>
            <div className="ldg-stat-sub">Accounts total</div>
          </div>
          <img src={flower02} alt="" className="ldg-stat-deco" />
        </div>

        <div className="ldg-stat-card ldg-stat-white">
          <div className="ldg-stat-inner">
            <div className="ldg-stat-icon ldg-stat-icon-shield">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M10 2l7 3v5c0 4-3 7.5-7 9C3 18.5 0 15 0 10V5l7-3z" transform="translate(1.5 .5)"/>
                <path d="M7 10l2 2 4-4" transform="translate(1.5 .5)"/>
              </svg>
            </div>
            <div className="ldg-stat-label">Safe to spend</div>
            <div className="ldg-stat-amount">{fmt(safeToSpend)}</div>
            <div className="ldg-stat-sub">this month</div>
          </div>
          <img src={sprig01} alt="" className="ldg-stat-deco" />
        </div>

        <div className="ldg-stat-card ldg-stat-blush">
          <div className="ldg-stat-inner">
            <div className="ldg-stat-icon ldg-stat-icon-cal">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="3" width="16" height="14" rx="2"/>
                <path d="M2 7h16M7 3v4M13 3v4"/>
              </svg>
            </div>
            <div className="ldg-stat-label">Bills due</div>
            <div className="ldg-stat-amount">{fmt(totalBills)}</div>
            <div className="ldg-stat-sub">This month</div>
          </div>
          <img src={flower03} alt="" className="ldg-stat-deco" />
        </div>

        <div className="ldg-stat-card ldg-stat-lavender">
          <div className="ldg-stat-inner">
            <div className="ldg-stat-icon ldg-stat-icon-pig">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <ellipse cx="9" cy="11" rx="7" ry="5"/>
                <path d="M16 9.5c1.5.3 2.5 1.2 2.5 2.5" strokeLinecap="round"/>
                <circle cx="7" cy="10" r="1" fill="currentColor"/>
                <path d="M9.5 6C10.5 5.5 12 5 13 4" strokeLinecap="round"/>
                <path d="M7 15.5l-1 2M11 15.5l1 2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="ldg-stat-label">Savings progress</div>
            <div className="ldg-stat-amount">{fmt(sfCurrent)}</div>
            <div className="ldg-stat-sub">of {fmt(sfTarget)} goal</div>
            {sfTarget > 0 && (
              <div className="ldg-stat-pbar-wrap">
                <div className="ldg-stat-pbar">
                  <div className="ldg-stat-pbar-fill ldg-pbar-purple" style={{ width: `${sfPct}%` }} />
                </div>
                <span className="ldg-stat-pct">{sfPct}%</span>
              </div>
            )}
          </div>
          <img src={flower05} alt="" className="ldg-stat-deco" />
        </div>

      </div>

      {/* ── Middle Row: Cash Flow | Calendar | Goals ── */}
      <div className="ldg-mid-row">

        {/* Cash Flow */}
        <div className="ldg-card ldg-cf-card">
          <div className="ldg-card-hdr">
            <div>
              <div className="ldg-card-title">Cash Flow</div>
              <div className="ldg-card-sub">Income vs. spending · {monthLabel}</div>
            </div>
            <div className="ldg-cf-legend">
              <span><i style={{ background: '#7a9e7e', display: 'inline-block', width: 9, height: 9, borderRadius: 2, marginRight: 5 }} />Income</span>
              <span><i style={{ background: '#c48a8a', display: 'inline-block', width: 9, height: 9, borderRadius: 2, marginRight: 5 }} />Spending</span>
            </div>
          </div>
          <div className="ldg-cf-body">
            <CashFlowSvg data={cashflow} />
          </div>
          <img src={sprig02} alt="" className="ldg-card-deco-br" />
        </div>

        {/* Calendar */}
        <div className="ldg-card">
          <CalendarWidget currentMonth={calMonth} billDays={calBillDays} onOpenBills={() => setView('bills')} onPrev={prevCalMonth} onNext={nextCalMonth} />
        </div>

        {/* Goals / Bills list */}
        <div className="ldg-card">
          <div className="ldg-card-hdr">
            <div className="ldg-card-title">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" width="15" height="15" style={{ display: 'inline', verticalAlign: '-3px', marginRight: 6 }}>
                <circle cx="10" cy="10" r="8"/><circle cx="10" cy="10" r="5"/><circle cx="10" cy="10" r="2"/>
              </svg>
              Goals
            </div>
            <button className="ldg-view-all-btn" onClick={() => setView('bills')}>View all →</button>
          </div>
          <div className="ldg-goals-list">
            {goalBills.length === 0
              ? <div className="ldg-empty-msg">No bills yet, add some on the Bills page</div>
              : goalBills.map((occ, i) => {
                  const bill = occ.bill;
                  const pct = income > 0 ? Math.min(100, Math.round(bill.amount / income * 100)) : 0;
                  const color = FUND_COLORS[i % FUND_COLORS.length];
                  return (
                    <div className="ldg-goal-item" key={`${bill.id}-${occ.dueDate}`} onClick={() => setView('bills')} style={{ cursor: 'pointer' }}>
                      <div className="ldg-goal-icon">{bill.icon}</div>
                      <div className="ldg-goal-info">
                        <div className="ldg-goal-name">{bill.name}</div>
                        <div className="ldg-goal-sub">{bill.category} · Monthly</div>
                        <div className="ldg-goal-pbar-bg">
                          <div className="ldg-goal-pbar-fill" style={{ width: `${pct}%`, background: color }} />
                        </div>
                      </div>
                      <div className="ldg-goal-right">
                        <div className="ldg-goal-amt">{fmt(bill.amount)}</div>
                        <div className={`ldg-scheduled-badge${bill.autopay ? ' autopay' : ''}`}>
                          {bill.autopay ? 'Autopay' : 'Scheduled'}
                        </div>
                      </div>
                    </div>
                  );
                })
            }
          </div>
        </div>

      </div>

      {/* ── Bottom Row: Upcoming Bills | Budget Categories | Net Worth ── */}
      <div className="ldg-bot-row">

        {/* Upcoming Bills */}
        <div className="ldg-card">
          <div className="ldg-card-hdr">
            <div className="ldg-card-title">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" width="15" height="15" style={{ display: 'inline', verticalAlign: '-3px', marginRight: 6 }}>
                <rect x="3" y="2" width="14" height="16" rx="2"/><path d="M7 7h6M7 10h6M7 13h4"/>
              </svg>
              Upcoming Bills
            </div>
            <button className="ldg-view-all-btn" onClick={() => setView('bills')}>View all →</button>
          </div>
          <div className="ldg-ubills-list">
            {sortedBills.length === 0
              ? <div className="ldg-empty-msg">No bills yet</div>
              : sortedBills.map(occ => {
                  const bill = occ.bill;
                  return (
                  <div className="ldg-ubill-item" key={`${bill.id}-${occ.dueDate}`} onClick={() => setView('bills')} style={{ cursor: 'pointer' }}>
                    <div className="ldg-ubill-date">{fmtIsoDay(occ.dueDate)}</div>
                    <div className="ldg-ubill-icon">{bill.icon}</div>
                    <div className="ldg-ubill-info">
                      <div className="ldg-ubill-name">{bill.name}</div>
                      <div className="ldg-ubill-cat">{bill.category} · Monthly</div>
                    </div>
                    <div className="ldg-ubill-right">
                      <div className="ldg-ubill-amt">{fmt(bill.amount)}</div>
                      <div className={`ldg-scheduled-badge${bill.autopay ? ' autopay' : ''}`}>
                        {bill.autopay ? 'Autopay' : 'Scheduled'}
                      </div>
                    </div>
                  </div>
                  );
                })
            }
          </div>
        </div>

        {/* Budget Categories */}
        <div className="ldg-card">
          <div className="ldg-card-hdr">
            <div className="ldg-card-title">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" width="15" height="15" style={{ display: 'inline', verticalAlign: '-3px', marginRight: 6 }}>
                <circle cx="10" cy="10" r="7"/><path d="M10 7v6M7 10h6"/>
              </svg>
              Budget Categories
            </div>
            <button className="ldg-view-all-btn" onClick={() => setView('categories')}>View all →</button>
          </div>
          <div className="ldg-cats-list">
            {budgetCategoryRows.length === 0
              ? <div className="ldg-empty-msg">No budget categories yet</div>
              : budgetCategoryRows.map((category, i) => {
                  const actual = spentByCategory.get(category.name) ?? 0;
                  const pct = category.budget > 0 ? Math.min(100, Math.round(actual / category.budget * 100)) : 0;
                  const color = FUND_COLORS[i % FUND_COLORS.length];
                  return (
                    <div className="ldg-cat-item" key={category.id}>
                      <div className="ldg-cat-icon">{category.icon ?? '📌'}</div>
                      <div className="ldg-cat-info">
                        <div className="ldg-cat-name-row">
                          <span className="ldg-cat-name">{category.name}</span>
                          <span className="ldg-cat-pct">{pct}%</span>
                        </div>
                        <div className="ldg-cat-amounts">{fmt(actual)} / {fmt(category.budget)}</div>
                        <div className="ldg-cat-pbar-bg">
                          <div className="ldg-cat-pbar-fill" style={{ width: `${pct}%`, background: category.color || color }} />
                        </div>
                      </div>
                    </div>
                  );
                })
            }
          </div>
        </div>

        {/* Net Worth */}
        <div className="ldg-card">
          <div className="ldg-card-hdr">
            <div className="ldg-card-title">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" width="15" height="15" style={{ display: 'inline', verticalAlign: '-3px', marginRight: 6 }}>
                <polyline points="2,15 7,9 11,12 18,4"/><path d="M15 4h3v3"/>
              </svg>
              Net Worth
            </div>
            <button className="ldg-view-all-btn" onClick={() => setView('networth')}>View all →</button>
          </div>
          <div className="ldg-nw-body">
            <div className="ldg-nw-hero-row">
              <div className="ldg-nw-amount">{fmt(nwTotal)}</div>
              <div className={`ldg-nw-change${nwUp ? '' : ' down'}`}>{nwUp ? '↑' : '↓'} {Math.abs(parseFloat(nwChange))}%</div>
            </div>
            <div className="ldg-nw-vs">vs. last month</div>
            <NwSvg history={history} />
            <div className="ldg-nw-breakdown">
              <div>
                <div className="ldg-nw-lbl">Assets</div>
                <div className="ldg-nw-val">{fmt(dashboardAssets)}</div>
              </div>
              <div>
                <div className="ldg-nw-lbl">Liabilities</div>
                <div className="ldg-nw-val" style={{ color: 'var(--red)' }}>{fmt(dashboardLiabilities)}</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── Monthly Reflection ── */}
      <div className="ldg-reflection">
        <img src={sprig05} alt="" className="ldg-reflection-deco-l" />
        <div className="ldg-reflection-inner">
          <span className="ldg-reflection-label">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
              <path d="M8 1.5C8 1.5 3 5 3 9.5a5 5 0 0010 0C13 5 8 1.5 8 1.5z"/>
              <path d="M8 1.5v11" strokeLinecap="round"/>
            </svg>
            Monthly reflection
          </span>
          <em className="ldg-reflection-quote">{reflection}</em>
        </div>
        <img src={heart02} alt="♡" className="ldg-reflection-heart" />
      </div>

    </div>
  );
}
