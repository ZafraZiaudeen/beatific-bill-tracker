import { useLedgerlyStore } from '../store/useLedgerlyStore';
import { fmt } from '../utils/formatters';
import type { ReactNode } from 'react';

function fmtDay(dueDay: number, ym: string) {
  const [y, m] = ym.split('-').map(Number);
  const day = Math.min(dueDay, new Date(y, m, 0).getDate());
  return new Date(y, m - 1, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function CashFlowSvg({ data }: { data: { label: string; income: number; spending: number }[] }) {
  const W = 320, H = 150, padL = 36, padR = 10, padT = 10, padB = 28;
  const cW = W - padL - padR, cH = H - padT - padB;
  const n = data.length;
  const groupW = cW / n;
  const barW = Math.min(20, groupW * 0.35);
  const gap = 3;
  const maxVal = Math.max(...data.flatMap(d => [d.income, d.spending]), 1);
  const yMax = Math.ceil(maxVal / 500) * 500 || 2000;
  const yLabels = [0, 500, 1000, 1500, 2000].filter(v => v <= yMax);

  const els: ReactNode[] = [];
  yLabels.forEach(v => {
    const y = padT + cH - (v / yMax) * cH;
    els.push(<line key={`gl${v}`} x1={padL} y1={y} x2={W - padR} y2={y} stroke="#e5e2db" strokeWidth={1} />);
    els.push(<text key={`gt${v}`} x={padL - 4} y={y + 4} textAnchor="end" fontSize={9} fill="#9ca3af">{v >= 1000 ? `$${v / 1000}k` : `$${v}`}</text>);
  });
  data.forEach((d, i) => {
    const cx = padL + i * groupW + groupW / 2;
    const ix = cx - barW - gap / 2;
    const sx = cx + gap / 2;
    const ih = (d.income / yMax) * cH;
    const sh = (d.spending / yMax) * cH;
    els.push(<rect key={`ib${i}`} x={ix} y={padT + cH - ih} width={barW} height={ih} fill="#3b82f6" rx={2} />);
    els.push(<rect key={`sb${i}`} x={sx} y={padT + cH - sh} width={barW} height={sh} fill="#f97316" rx={2} />);
    els.push(<text key={`xl${i}`} x={cx} y={H - padB + 14} textAnchor="middle" fontSize={8.5} fill="#9ca3af">{d.label}</text>);
  });

  return (
    <svg className="cf-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">{els}</svg>
  );
}

function NwSvg({ history }: { history: { month: string; value: number }[] }) {
  if (history.length < 2) return null;
  const W = 280, H = 80, padL = 10, padR = 10, padT = 10, padB = 20;
  const cW = W - padL - padR, cH = H - padT - padB;
  const vals = history.map(h => h.value);
  const minV = Math.min(...vals) * 0.95;
  const maxV = Math.max(...vals) * 1.02;
  const n = history.length;
  const xp = (i: number) => padL + (i / (n - 1)) * cW;
  const yp = (v: number) => padT + cH - ((v - minV) / (maxV - minV)) * cH;
  const pts = history.map((h, i) => `${xp(i)},${yp(h.value)}`).join(' ');
  const polyPts = `${xp(0)},${padT + cH} ${pts} ${xp(n - 1)},${padT + cH}`;

  return (
    <svg className="nw-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity={0.25} />
          <stop offset="100%" stopColor="#22c55e" stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <polygon points={polyPts} fill="url(#nwGrad)" />
      <polyline points={pts} fill="none" stroke="#22c55e" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {history.map((h, i) => (
        <g key={i}>
          <circle cx={xp(i)} cy={yp(h.value)} r={3} fill="#22c55e" />
          <circle cx={xp(i)} cy={yp(h.value)} r={1.5} fill="white" />
          <text x={xp(i)} y={H} textAnchor="middle" fontSize={8} fill="#9ca3af">{h.month}</text>
        </g>
      ))}
    </svg>
  );
}

export function DashboardPage() {
  const income       = useLedgerlyStore(s => s.income);
  const categories   = useLedgerlyStore(s => s.categories);
  const cashflow     = useLedgerlyStore(s => s.cashflow);
  const sinkingFunds = useLedgerlyStore(s => s.sinkingFunds);
  const netWorth     = useLedgerlyStore(s => s.netWorth);
  const bills        = useLedgerlyStore(s => s.bills);
  const currentMonth = useLedgerlyStore(s => s.currentMonth);
  const setView      = useLedgerlyStore(s => s.setView);

  const totalBudget  = categories.reduce((s, c) => s + c.budget, 0);
  const totalSpent   = categories.reduce((s, c) => s + c.spent, 0);
  const left         = income - totalBudget;
  const safeToSpend  = Math.max(0, left);
  const budgetPct    = totalBudget > 0 && income > 0 ? Math.round(totalBudget / income * 100) : 0;

  const nwTotal    = netWorth.assets - netWorth.liabilities;
  const history    = netWorth.history;
  const prevNw     = history.length >= 2 ? history[history.length - 2].value : nwTotal;
  const nwChange   = prevNw > 0 ? ((nwTotal - prevNw) / prevNw * 100).toFixed(1) : '0.0';
  const nwUp       = parseFloat(nwChange) >= 0;

  const [ymYear, ymMon] = currentMonth.split('-');
  const monthLabel = new Date(parseInt(ymYear), parseInt(ymMon) - 1, 1)
    .toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const sortedBills = [...bills].sort((a, b) => a.dueDay - b.dueDay).slice(0, 5);

  return (
    <div className="dash-content">

      {/* Hero Row */}
      <div className="hero-row">
        <div className="hero-text">
          <h1>Your money, in focus.</h1>
          <p>A clear view of your budget, spending and goals — all on your device.<br />
            <strong>No cloud. No tracking. Just your data.</strong>
          </p>
        </div>
        <div className="hero-safe">
          <div className="hero-shield">
            <svg viewBox="0 0 24 24">
              <path d="M12 2l9 4v5c0 5-3.5 9.5-9 11C6.5 20.5 3 16 3 11V6z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <div className="hero-safe-text">
            <h3>Safe to spend</h3>
            <p>You've got money left after all your bills, goals and planned spending.</p>
          </div>
          <div className="hero-safe-amount">
            <div className="amount">{fmt(safeToSpend)}</div>
            <div className="label">this month</div>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="kpi-row">
        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon green">
              <svg viewBox="0 0 20 20"><path d="M10 2v16M5 7l5-5 5 5M5 13l5 5 5-5" /></svg>
            </div>
            <div className="kpi-label">Income</div>
          </div>
          <div className="kpi-amount">{fmt(income)}</div>
          <div className="kpi-sub">This month</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon blue">
              <svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="7" /><path d="M10 6v8M7 9h6" /></svg>
            </div>
            <div className="kpi-label">Assigned</div>
          </div>
          <div className="kpi-amount">{fmt(totalBudget)}</div>
          <div className="kpi-sub">This month</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon orange">
              <svg viewBox="0 0 20 20"><path d="M3 10h14M3 10l4-4M3 10l4 4" /></svg>
            </div>
            <div className="kpi-label">Spent</div>
          </div>
          <div className="kpi-amount">{fmt(totalSpent)}</div>
          <div className="kpi-sub">This month</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon dark">
              <svg viewBox="0 0 20 20"><rect x="3" y="5" width="14" height="11" rx="2" /><path d="M7 5V3.5A1.5 1.5 0 0113 3.5V5" /><circle cx="10" cy="11" r="2" /></svg>
            </div>
            <div className="kpi-label">Left</div>
          </div>
          <div className="kpi-amount" style={{ color: left < 0 ? 'var(--red)' : undefined }}>{fmt(left)}</div>
          <div className="kpi-sub">This month</div>
        </div>
      </div>

      {/* Mid Row */}
      <div className="mid-row">

        {/* Budget Allocation */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Every dollar has a job</div>
              <div className="card-sub">Zero-based budget · {fmt(totalBudget)} assigned</div>
            </div>
            <div className="budget-pct">{budgetPct}%</div>
          </div>
          <div className="budget-bar-wrap">
            <div className="stacked-bar">
              {categories.map(c => (
                <div
                  key={c.id}
                  className="bar-seg"
                  style={{ width: `${totalBudget > 0 ? (c.budget / totalBudget * 100) : 0}%`, background: c.color }}
                  title={`${c.name}: ${fmt(c.budget)}`}
                />
              ))}
            </div>
            <div className="cat-legend">
              {categories.map(c => (
                <div className="cat-legend-item" key={c.id}>
                  <div className="cat-dot" style={{ background: c.color }} />
                  <div className="cat-info">
                    <div className="cat-name">{c.name}</div>
                    <div className="cat-detail">{fmt(c.budget)} · {totalBudget > 0 ? Math.round(c.budget / totalBudget * 100) : 0}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cash Flow */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Cash Flow</div>
              <div className="card-sub">Income vs. spending · {monthLabel}</div>
            </div>
          </div>
          <div className="cashflow-svg-wrap">
            <div className="cashflow-legend">
              <div className="legend-dot"><span style={{ background: '#3b82f6' }} />Income</div>
              <div className="legend-dot"><span style={{ background: '#f97316' }} />Spending</div>
            </div>
            <CashFlowSvg data={cashflow} />
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="bottom-row">

        {/* Upcoming Bills */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <svg style={{ display: 'inline', verticalAlign: '-3px', width: 16, height: 16, strokeWidth: 2, stroke: 'currentColor', fill: 'none', marginRight: 6 }} viewBox="0 0 20 20">
                  <rect x="3" y="2" width="14" height="16" rx="2" /><path d="M7 7h6M7 10h6M7 13h4" />
                </svg>
                Upcoming Bills
              </div>
            </div>
            <button
              onClick={() => setView('bills')}
              style={{ padding: '4px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '.75rem', color: 'var(--accent)', fontWeight: 600, background: 'transparent', cursor: 'pointer' }}
            >
              View all →
            </button>
          </div>
          <div className="bills-list">
            {sortedBills.map(bill => (
              <div className="bill-item" key={bill.id}>
                <div className="bill-date">{fmtDay(bill.dueDay, currentMonth)}</div>
                <div className="bill-icon">{bill.icon}</div>
                <div className="bill-info">
                  <div className="bill-name">{bill.name}</div>
                  <div className="bill-cat">{bill.category} · Monthly</div>
                </div>
                <div className="bill-right">
                  <div className="bill-amt">{fmt(bill.amount)}</div>
                  <div className={`bill-badge${bill.autopay ? '' : ' due'}`}>{bill.autopay ? 'Autopay' : 'Scheduled'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sinking Funds */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <svg style={{ display: 'inline', verticalAlign: '-3px', width: 16, height: 16, strokeWidth: 2, stroke: 'currentColor', fill: 'none', marginRight: 6 }} viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="7" /><path d="M10 7v6M7 10h6" />
                </svg>
                Sinking Funds
              </div>
            </div>
            <button
              onClick={() => setView('goals')}
              style={{ padding: '4px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '.75rem', color: 'var(--accent)', fontWeight: 600, background: 'transparent', cursor: 'pointer' }}
            >
              View all →
            </button>
          </div>
          <div className="funds-list">
            {sinkingFunds.map(fund => {
              const pct = Math.min(100, Math.round(fund.current / fund.target * 100));
              return (
                <div className="fund-item" key={fund.id}>
                  <div className="fund-header">
                    <div className="fund-icon">{fund.icon}</div>
                    <div className="fund-name">{fund.name}</div>
                    <div className="fund-amounts">{fmt(fund.current)} / {fmt(fund.target)}</div>
                  </div>
                  <div className="fund-bar-bg">
                    <div className="fund-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="fund-footer">
                    <div className="fund-pct">{pct}%</div>
                    <div className="fund-target">{fund.targetDate}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Net Worth */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <svg style={{ display: 'inline', verticalAlign: '-3px', width: 16, height: 16, strokeWidth: 2, stroke: 'currentColor', fill: 'none', marginRight: 6 }} viewBox="0 0 20 20">
                  <polyline points="3,15 8,9 12,12 17,5" /><path d="M14 5h3v3" />
                </svg>
                Net Worth
              </div>
            </div>
            <button
              onClick={() => setView('networth')}
              style={{ padding: '4px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '.75rem', color: 'var(--accent)', fontWeight: 600, background: 'transparent', cursor: 'pointer' }}
            >
              View all →
            </button>
          </div>
          <div className="nw-hero">
            <div className="nw-main">
              <div className="nw-amount">{fmt(nwTotal)}</div>
              <div className="nw-change">{nwUp ? '↑' : '↓'} {Math.abs(parseFloat(nwChange))}%</div>
            </div>
            <div className="nw-vs">vs. last month</div>
          </div>
          <div className="nw-svg-wrap">
            <NwSvg history={history} />
          </div>
          <div className="nw-breakdown">
            <div>
              <div className="nw-bl">Assets</div>
              <div className="nw-bv">{fmt(netWorth.assets)}</div>
            </div>
            <div>
              <div className="nw-bl">Liabilities</div>
              <div className="nw-bv" style={{ color: 'var(--red)' }}>{fmt(netWorth.liabilities)}</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
