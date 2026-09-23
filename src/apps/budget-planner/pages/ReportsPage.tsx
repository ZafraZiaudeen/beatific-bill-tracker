import { useMemo, useState } from 'react';
import { PageIntroBanner } from '../components/PageIntroBanner';
import { useLedgerlyStore } from '../store/useLedgerlyStore';
import { fmt, fmtYMFull } from '../utils/formatters';
import type { BudgetMethod, Transaction } from '../types';
import { accountVisibleIn } from '../utils/accounts';
import flower02 from '../../../assets/budget-assets/flowers-and-leaves/flowers-and-leaves-02.png';
import flower05 from '../../../assets/budget-assets/flowers-and-leaves/flowers-and-leaves-05.png';
import sprig03 from '../../../assets/budget-assets/botanical-sprigs/botanical-sprigs-03.png';
import sprig01 from '../../../assets/budget-assets/botanical-sprigs/botanical-sprigs-01.png';
import heart03 from '../../../assets/budget-assets/hearts/heart-03.png';
import stationery01 from '../../../assets/budget-assets/stationery-accents/stationery-accents-01.png';
import stationery03 from '../../../assets/budget-assets/stationery-accents/stationery-accents-03.png';

type ReportTab = 'spending' | 'cashflow' | 'networth' | 'budget';
type RangePreset = 'current' | 'last' | '3m' | 'ytd' | 'custom';

const TAB_LABELS: Record<ReportTab, string> = {
  spending: 'Spending',
  cashflow: 'Cash flow',
  networth: 'Net worth',
  budget: 'Budget vs actual',
};

const RANGE_LABELS: Record<RangePreset, string> = {
  current: 'Current month',
  last: 'Last month',
  '3m': 'Last 3 months',
  ytd: 'Year to date',
  custom: 'Custom range',
};

const METHOD_LABELS: Record<BudgetMethod, string> = {
  zero: 'Zero-based',
  '503020': '50/30/20',
  paycheck: 'Paycheck plan',
};

function signed(n: number) {
  return `${n >= 0 ? '+' : '-'}${fmt(Math.abs(n))}`;
}

function signedPct(n: number) {
  return `${n >= 0 ? '+' : '-'}${Math.abs(n).toFixed(1)}%`;
}

function monthStart(month: string) {
  return `${month}-01`;
}

function monthEnd(month: string) {
  const [year, monthIndex] = month.split('-').map(Number);
  return `${month}-${String(new Date(year, monthIndex, 0).getDate()).padStart(2, '0')}`;
}

function addMonths(month: string, delta: number) {
  const [year, monthIndex] = month.split('-').map(Number);
  const date = new Date(year, monthIndex - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function dateToMonth(date: string) {
  return date.slice(0, 7);
}

function daysBetween(start: string, end: string) {
  return Math.max(1, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86_400_000) + 1);
}

function monthsInRange(start: string, end: string) {
  const months: string[] = [];
  let cursor = dateToMonth(start);
  const last = dateToMonth(end);
  while (cursor <= last) {
    months.push(cursor);
    cursor = addMonths(cursor, 1);
  }
  return months;
}

function rangeForPreset(preset: RangePreset, currentMonth: string, customStart: string, customEnd: string) {
  if (preset === 'custom') return { start: customStart, end: customEnd };
  if (preset === 'last') {
    const month = addMonths(currentMonth, -1);
    return { start: monthStart(month), end: monthEnd(month) };
  }
  if (preset === '3m') {
    const startMonth = addMonths(currentMonth, -2);
    return { start: monthStart(startMonth), end: monthEnd(currentMonth) };
  }
  if (preset === 'ytd') {
    return { start: `${currentMonth.slice(0, 4)}-01-01`, end: monthEnd(currentMonth) };
  }
  return { start: monthStart(currentMonth), end: monthEnd(currentMonth) };
}

function previousRange(start: string, end: string) {
  const days = daysBetween(start, end);
  const previousEnd = new Date(start);
  previousEnd.setDate(previousEnd.getDate() - 1);
  const previousStart = new Date(previousEnd);
  previousStart.setDate(previousStart.getDate() - days + 1);
  return {
    start: previousStart.toISOString().slice(0, 10),
    end: previousEnd.toISOString().slice(0, 10),
  };
}

function formatRange(start: string, end: string) {
  if (dateToMonth(start) === dateToMonth(end) && start.endsWith('-01') && end === monthEnd(dateToMonth(end))) {
    return fmtYMFull(dateToMonth(start));
  }
  return `${start} to ${end}`;
}

function LineChart({
  series,
  secondary,
  labels,
  colors = ['#7a9e7e', '#c48a8a'],
}: {
  series: number[];
  secondary?: number[];
  labels: string[];
  colors?: [string, string];
}) {
  const W = 760;
  const H = 260;
  const padL = 64;
  const padR = 22;
  const padT = 20;
  const padB = 40;
  const values = [...series, ...(secondary ?? [])];
  const minV = Math.min(0, ...values);
  const maxV = Math.max(1, ...values);
  const rangePad = Math.max((maxV - minV) * 0.12, 100);
  const yMin = Math.min(0, minV - rangePad);
  const yMax = maxV + rangePad;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const x = (index: number) => padL + (series.length <= 1 ? chartW / 2 : (index / (series.length - 1)) * chartW);
  const y = (value: number) => padT + chartH - ((value - yMin) / (yMax - yMin)) * chartH;
  const ticks = Array.from({ length: 5 }, (_, index) => yMin + ((yMax - yMin) / 4) * index);
  const points = series.map((value, index) => `${x(index)},${y(value)}`).join(' ');
  const secondaryPoints = secondary?.map((value, index) => `${x(index)},${y(value)}`).join(' ');
  const areaPoints = `${x(0)},${y(0)} ${points} ${x(series.length - 1)},${y(0)}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Report line chart" style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id="rpt-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colors[0]} stopOpacity=".18" />
          <stop offset="100%" stopColor={colors[0]} stopOpacity=".02" />
        </linearGradient>
      </defs>
      {ticks.map(tick => (
        <g key={tick}>
          <line x1={padL} y1={y(tick)} x2={W - padR} y2={y(tick)} stroke="rgba(200,210,195,.4)" strokeWidth="1" />
          <text x={padL - 10} y={y(tick) + 4} textAnchor="end" fontSize="11" fill="#9ca3af">{fmt(tick)}</text>
        </g>
      ))}
      {!secondary && series.length > 1 && <polygon points={areaPoints} fill="url(#rpt-grad)" />}
      <polyline points={points} fill="none" stroke={colors[0]} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {secondaryPoints && <polyline points={secondaryPoints} fill="none" stroke={colors[1]} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}
      {series.map((value, index) => <circle key={`p-${index}`} cx={x(index)} cy={y(value)} r="4" fill={colors[0]} stroke="#fff" strokeWidth="2" />)}
      {secondary?.map((value, index) => <circle key={`s-${index}`} cx={x(index)} cy={y(value)} r="4" fill={colors[1]} stroke="#fff" strokeWidth="2" />)}
      {labels.map((label, index) => <text key={`${label}-${index}`} x={x(index)} y={H - 10} textAnchor="middle" fontSize="11" fill="#9ca3af">{label}</text>)}
    </svg>
  );
}

function BarRows({ rows }: { rows: { name: string; value: number; total: number; color: string; detail?: string }[] }) {
  return (
    <div className="reports-bars">
      {rows.map(row => {
        const pct = row.total > 0 ? Math.min(100, Math.round((row.value / row.total) * 100)) : 0;
        return (
          <div className="reports-bar-row" key={row.name}>
            <div className="reports-bar-label">{row.name}{row.detail && <small>{row.detail}</small>}</div>
            <div className="reports-bar-track"><span style={{ width: `${pct}%`, background: row.color }} /></div>
            <div className="reports-bar-value">{fmt(row.value)}</div>
            <div className="reports-bar-pct">{pct}%</div>
          </div>
        );
      })}
    </div>
  );
}

function MiniRows({ rows }: { rows: { name: string; value: string; meta: string; color?: string }[] }) {
  return (
    <div className="reports-mini-rows">
      {rows.map(row => (
        <div className="reports-mini-row" key={row.name}>
          <span className="reports-mini-name"><i style={{ background: row.color ?? '#7a9e7e' }} />{row.name}</span>
          <span className="reports-mini-value">{row.value}</span>
          <span className="reports-mini-pct">{row.meta}</span>
        </div>
      ))}
    </div>
  );
}

export function ReportsPage() {
  const currentMonth = useLedgerlyStore(s => s.currentMonth);
  const transactions = useLedgerlyStore(s => s.transactions);
  const categories = useLedgerlyStore(s => s.categories);
  const accounts = useLedgerlyStore(s => s.accounts);
  const netWorth = useLedgerlyStore(s => s.netWorth);
  const budgetMethod = useLedgerlyStore(s => s.budgetMethod);
  const getLiveNetWorth = useLedgerlyStore(s => s.getLiveNetWorth);
  const [tab, setTab] = useState<ReportTab>('spending');
  const [rangePreset, setRangePreset] = useState<RangePreset>('current');
  const [customStart, setCustomStart] = useState(monthStart(currentMonth));
  const [customEnd, setCustomEnd] = useState(monthEnd(currentMonth));
  const [account, setAccount] = useState('All accounts');
  const [category, setCategory] = useState('All categories');
  const [method, setMethod] = useState('All methods');

  const report = useMemo(() => {
    const range = rangeForPreset(rangePreset, currentMonth, customStart, customEnd);
    const safeRange = range.start <= range.end ? range : { start: range.end, end: range.start };
    const prev = previousRange(safeRange.start, safeRange.end);
    const rangeMonths = monthsInRange(safeRange.start, safeRange.end);
    const categoryOptions = Array.from(new Set([...categories.map(c => c.name), ...transactions.map(t => t.category)])).sort();
    const accountOptions = Array.from(new Set([
      ...accounts.filter(a => accountVisibleIn(a, 'reports')).map(a => a.name),
      ...transactions.map(t => t.account),
    ])).sort();
    const methodOptions = ['All methods', METHOD_LABELS[budgetMethod]];
    const methodMatches = method === 'All methods' || method === METHOD_LABELS[budgetMethod];
    const filterTxn = (txn: Transaction, start: string, end: string, applyUiFilters = true) => {
      const inRange = txn.date >= start && txn.date <= end;
      if (!inRange) return false;
      if (!applyUiFilters) return true;
      const inAccount = account === 'All accounts' || txn.account === account;
      const inCategory = category === 'All categories' || txn.category === category;
      return inAccount && inCategory;
    };
    const filtered = transactions.filter(txn => filterTxn(txn, safeRange.start, safeRange.end));
    const previous = transactions.filter(txn => filterTxn(txn, prev.start, prev.end));
    const income = filtered.filter(txn => txn.amount > 0).reduce((sum, txn) => sum + txn.amount, 0);
    const expenses = Math.abs(filtered.filter(txn => txn.amount < 0).reduce((sum, txn) => sum + txn.amount, 0));
    const prevIncome = previous.filter(txn => txn.amount > 0).reduce((sum, txn) => sum + txn.amount, 0);
    const prevExpenses = Math.abs(previous.filter(txn => txn.amount < 0).reduce((sum, txn) => sum + txn.amount, 0));
    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
    const expenseByCategory = new Map<string, number>();
    for (const txn of filtered.filter(item => item.amount < 0)) {
      expenseByCategory.set(txn.category, (expenseByCategory.get(txn.category) ?? 0) + Math.abs(txn.amount));
    }
    const prevByCategory = new Map<string, number>();
    for (const txn of previous.filter(item => item.amount < 0)) {
      prevByCategory.set(txn.category, (prevByCategory.get(txn.category) ?? 0) + Math.abs(txn.amount));
    }
    const categoryRows = [...expenseByCategory.entries()]
      .map(([name, value], index) => ({
        name,
        value,
        total: expenses,
        color: categories.find(item => item.name === name)?.color ?? ['#7a9e7e', '#c48a8a', '#c4a35a', '#9e8abe'][index % 4],
        detail: signed(value - (prevByCategory.get(name) ?? 0)),
      }))
      .sort((a, b) => b.value - a.value);
    const biggest = categoryRows.reduce<{ name: string; delta: number; value: number } | null>((best, row) => {
      const delta = row.value - (prevByCategory.get(row.name) ?? 0);
      return !best || delta > best.delta ? { name: row.name, delta, value: row.value } : best;
    }, null);
    const monthlyBuckets = rangeMonths.map(monthName => {
      const bucket = filtered.filter(txn => dateToMonth(txn.date) === monthName);
      const bucketIncome = bucket.filter(txn => txn.amount > 0).reduce((sum, txn) => sum + txn.amount, 0);
      const bucketExpenses = Math.abs(bucket.filter(txn => txn.amount < 0).reduce((sum, txn) => sum + txn.amount, 0));
      return { month: monthName, income: bucketIncome, expenses: bucketExpenses, net: bucketIncome - bucketExpenses };
    });
    const liveNetWorth = getLiveNetWorth('reports');
    const netWorthPoints = netWorth.history
      .filter(point => point.month >= dateToMonth(safeRange.start) && point.month <= dateToMonth(safeRange.end))
      .map(point => ({ month: point.month, value: point.value }));
    const includeLive = currentMonth >= dateToMonth(safeRange.start) && currentMonth <= dateToMonth(safeRange.end);
    const netWorthSeries = (includeLive
      ? [...netWorthPoints.filter(point => point.month !== currentMonth), { month: currentMonth, value: liveNetWorth.value }]
      : netWorthPoints
    ).sort((a, b) => a.month.localeCompare(b.month));
    const netWorthChart = netWorthSeries.length
      ? netWorthSeries
      : [{ month: currentMonth, value: liveNetWorth.value }];
    const monthMultiplier = rangeMonths.length;
    const budgetRows = categories
      .filter(item => !item.archived && item.kind !== 'income')
      .map(item => {
        const actual = expenseByCategory.get(item.name) ?? 0;
        const planned = methodMatches ? item.budget * monthMultiplier : 0;
        return {
          name: item.name,
          planned,
          actual,
          variance: planned - actual,
          color: item.color,
          value: actual,
          total: Math.max(planned, actual, 1),
          detail: planned ? `${signed(planned - actual)} vs plan` : 'No plan',
        };
      })
      .sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance));
    return {
      range: safeRange,
      previousRange: prev,
      rangeMonths,
      categoryOptions,
      accountOptions,
      methodOptions,
      methodMatches,
      filtered,
      income,
      expenses,
      prevIncome,
      prevExpenses,
      savingsRate,
      categoryRows,
      biggest,
      monthlyBuckets,
      liveNetWorth,
      netWorthChart,
      budgetRows,
    };
  }, [account, accounts, budgetMethod, categories, category, currentMonth, customEnd, customStart, getLiveNetWorth, method, netWorth.history, rangePreset, transactions]);

  const incomeChange = report.prevIncome ? ((report.income - report.prevIncome) / report.prevIncome) * 100 : 0;
  const expenseChange = report.prevExpenses ? ((report.expenses - report.prevExpenses) / report.prevExpenses) * 100 : 0;
  const rangeLabel = formatRange(report.range.start, report.range.end);
  const labels = report.monthlyBuckets.map(bucket => fmtYMFull(bucket.month).slice(0, 3));
  const printRows = tab === 'budget'
    ? report.budgetRows.slice(0, 7).map(row => ({ name: row.name, value: fmt(row.actual), meta: `${signed(row.variance)} variance`, color: row.color }))
    : tab === 'cashflow'
      ? report.monthlyBuckets.map(row => ({ name: fmtYMFull(row.month), value: fmt(row.net), meta: `${fmt(row.income)} in / ${fmt(row.expenses)} out`, color: row.net >= 0 ? '#7a9e7e' : '#c48a8a' }))
      : tab === 'networth'
        ? report.netWorthChart.map(row => ({ name: fmtYMFull(row.month), value: fmt(row.value), meta: row.month === currentMonth ? 'Live balance' : 'Saved snapshot', color: '#7a9e7e' }))
        : report.categoryRows.slice(0, 7).map(row => ({ name: row.name, value: fmt(row.value), meta: row.detail ?? '', color: row.color }));

  const reportSummary = (() => {
    if (tab === 'spending') {
      const top = report.categoryRows[0];
      return top ? `${top.name} was the largest spending area at ${fmt(top.value)} for ${rangeLabel}.` : `No spending is recorded for ${rangeLabel}.`;
    }
    if (tab === 'cashflow') {
      const net = report.income - report.expenses;
      return net >= 0 ? `Income exceeded spending by ${fmt(net)} for this range.` : `Spending exceeded income by ${fmt(Math.abs(net))} for this range.`;
    }
    if (tab === 'networth') {
      const first = report.netWorthChart[0]?.value ?? 0;
      const last = report.netWorthChart[report.netWorthChart.length - 1]?.value ?? first;
      return last >= first ? `Net worth is up ${fmt(last - first)} across the selected range.` : `Net worth is down ${fmt(first - last)} across the selected range.`;
    }
    const over = report.budgetRows.filter(row => row.variance < 0).length;
    return over ? `${over} categories are over plan for this range.` : 'Actual spending is within planned category amounts for this range.';
  })();

  const KPI_DECOS = [flower02, sprig03, flower05, stationery01];
  const KPI_TINTS = ['ldg-stat-cream', 'ldg-stat-white', 'ldg-stat-blush', 'ldg-stat-white'];
  const kpiCards = [
    { label: 'Income', value: fmt(report.income), sub: `${signedPct(incomeChange)} vs previous range`, subColor: incomeChange >= 0 ? '#5a9060' : '#c46060' },
    { label: 'Spending', value: fmt(report.expenses), sub: `${signedPct(expenseChange)} vs previous range`, subColor: expenseChange <= 0 ? '#5a9060' : '#c46060' },
    { label: 'Net cash flow', value: fmt(report.income - report.expenses), sub: `${report.savingsRate.toFixed(1)}% savings rate`, subColor: report.income - report.expenses >= 0 ? '#5a9060' : '#c46060' },
    { label: 'Main change', value: report.biggest?.name ?? 'None', sub: report.biggest ? `${signed(report.biggest.delta)} vs previous range` : 'No category movement', subColor: (report.biggest?.delta ?? 0) <= 0 ? '#5a9060' : '#c46060' },
  ];

  return (
    <div className="ldg-rpt-page">
      <PageIntroBanner view="reports" />
      <div className="ldg-rpt-header">
        <div>
          <div className="ldg-rpt-title">Reports <img src={heart03} alt="" /></div>
          <div className="ldg-rpt-subtitle">Date-range feedback for spending, cash flow, net worth, and budget performance.</div>
        </div>
        <div className="ldg-rpt-filters">
          <select value={rangePreset} onChange={event => setRangePreset(event.target.value as RangePreset)} className="ldg-rpt-select">
            {(Object.keys(RANGE_LABELS) as RangePreset[]).map(value => <option key={value} value={value}>{RANGE_LABELS[value]}</option>)}
          </select>
          {rangePreset === 'custom' && (
            <>
              <input type="date" value={customStart} onChange={event => setCustomStart(event.target.value)} className="ldg-rpt-select" />
              <input type="date" value={customEnd} onChange={event => setCustomEnd(event.target.value)} className="ldg-rpt-select" />
            </>
          )}
          <select value={account} onChange={event => setAccount(event.target.value)} className="ldg-rpt-select">
            <option>All accounts</option>
            {report.accountOptions.map(value => <option key={value}>{value}</option>)}
          </select>
          <select value={category} onChange={event => setCategory(event.target.value)} className="ldg-rpt-select">
            <option>All categories</option>
            {report.categoryOptions.map(value => <option key={value}>{value}</option>)}
          </select>
          <select value={method} onChange={event => setMethod(event.target.value)} className="ldg-rpt-select">
            {report.methodOptions.map(value => <option key={value}>{value}</option>)}
          </select>
          <div className="ldg-privacy-badge">Local only</div>
        </div>
      </div>

      <div className="ldg-goals-tabs">
        {(Object.keys(TAB_LABELS) as ReportTab[]).map(id => (
          <button key={id} className={`ldg-goals-tab${tab === id ? ' active' : ''}`} onClick={() => setTab(id)}>
            {TAB_LABELS[id]}
          </button>
        ))}
      </div>

      <div className="ldg-stat-row" style={{ marginTop: 20 }}>
        {kpiCards.map((kpi, index) => (
          <div key={kpi.label} className={`ldg-stat-card ${KPI_TINTS[index]}`}>
            <img src={KPI_DECOS[index]} alt="" className="ldg-stat-deco" />
            <div className="ldg-stat-inner">
              <div className="ldg-stat-icon ldg-stat-icon-leaf">{index + 1}</div>
              <div className="ldg-stat-label">{kpi.label}</div>
              <div className="ldg-stat-amount">{kpi.value}</div>
              <div className="ldg-stat-sub" style={{ color: kpi.subColor }}>{kpi.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="ldg-rpt-main-grid">
        <div className="ldg-card ldg-rpt-analysis-card">
          <div className="ldg-rpt-chart-hdr">
            <div>
              <div className="ldg-card-title">
                {tab === 'spending' ? 'Where did money go?' : tab === 'cashflow' ? 'Did income exceed spending?' : tab === 'networth' ? 'Is net worth improving?' : 'Where did actual differ from plan?'}
              </div>
              <div className="ldg-rpt-range-line">{rangeLabel} · {report.filtered.length} transactions</div>
            </div>
            <div className="ldg-rpt-legend">
              {tab === 'cashflow' && <><span><i style={{ background: '#7a9e7e' }} />Income</span><span><i style={{ background: '#c48a8a' }} />Expenses</span></>}
              {tab === 'spending' && <span><i style={{ background: '#7a9e7e' }} />Category spend</span>}
              {tab === 'networth' && <span><i style={{ background: '#7a9e7e' }} />Net worth</span>}
              {tab === 'budget' && <><span><i style={{ background: '#7a9e7e' }} />Actual</span><span><i style={{ background: '#c4a35a' }} />Plan</span></>}
            </div>
          </div>
          <div className="ldg-rpt-summary-callout">{reportSummary}</div>
          <div className="ldg-rpt-chart-body">
            {tab === 'spending' && <BarRows rows={report.categoryRows.length ? report.categoryRows : [{ name: 'No spending', value: 0, total: 1, color: '#d1d5db' }]} />}
            {tab === 'cashflow' && <LineChart series={report.monthlyBuckets.map(item => item.income)} secondary={report.monthlyBuckets.map(item => item.expenses)} labels={labels} colors={['#7a9e7e', '#c48a8a']} />}
            {tab === 'networth' && <LineChart series={report.netWorthChart.map(item => item.value)} labels={report.netWorthChart.map(item => fmtYMFull(item.month).slice(0, 3))} colors={['#7a9e7e', '#c48a8a']} />}
            {tab === 'budget' && <BarRows rows={report.budgetRows.length ? report.budgetRows : [{ name: 'No budget categories', value: 0, total: 1, color: '#d1d5db' }]} />}
          </div>
          <img src={stationery03} alt="" className="ldg-rpt-card-deco" />
        </div>

        <div className="ldg-card ldg-rpt-print-card ldg-rpt-printable">
          <div>
            <div className="ldg-rpt-print-title">{TAB_LABELS[tab]} Report</div>
            <div className="ldg-rpt-print-month">{rangeLabel}</div>
            <div className="ldg-rpt-print-filters">
              {account} · {category} · {method}
            </div>
          </div>

          <div className="ldg-rpt-summary-grid">
            {[
              { label: 'Income', value: fmt(report.income), chg: `${signedPct(incomeChange)} prev.` },
              { label: 'Spending', value: fmt(report.expenses), chg: `${signedPct(expenseChange)} prev.` },
              { label: 'Cash flow', value: fmt(report.income - report.expenses), chg: '' },
              { label: 'Net worth', value: fmt(report.liveNetWorth.value), chg: 'Live accounts' },
            ].map(item => (
              <div key={item.label} className="ldg-rpt-summary-item">
                <div className="ldg-rpt-summary-label">{item.label}</div>
                <div className="ldg-rpt-summary-val">{item.value}</div>
                {item.chg && <div className="ldg-rpt-summary-chg">{item.chg}</div>}
              </div>
            ))}
          </div>

          <div className="ldg-rpt-print-summary">{reportSummary}</div>
          <MiniRows rows={printRows.length ? printRows : [{ name: 'No data', value: '$0', meta: 'Selected range', color: '#d1d5db' }]} />

          <div className="ldg-rpt-print-actions">
            <button onClick={() => window.print()} className="ldg-rpt-print-btn">Print</button>
            <button onClick={() => window.print()} className="ldg-goals-add-btn" style={{ flex: 1, padding: '9px', fontSize: '.80rem', justifyContent: 'center' }}>Save as PDF</button>
          </div>

          <div className="ldg-rpt-print-quote">Small steps. Big progress.</div>
          <img src={sprig03} alt="" className="ldg-rpt-print-deco" />
        </div>
      </div>

      <div className="ldg-card" style={{ marginTop: 16, position: 'relative', overflow: 'hidden' }}>
        <div className="ldg-rpt-chart-hdr">
          <div>
            <div className="ldg-card-title">Supporting rows</div>
            <div className="ldg-rpt-range-line">The table below changes with the selected report.</div>
          </div>
        </div>
        <div style={{ padding: '0 18px 16px' }}>
          <MiniRows rows={printRows.length ? printRows : [{ name: 'No data', value: '$0', meta: rangeLabel, color: '#d1d5db' }]} />
        </div>
      </div>

      <div className="ldg-reflection" style={{ marginTop: 20 }}>
        <img src={sprig01} alt="" className="ldg-reflection-deco-l" />
        <div className="ldg-reflection-inner">
          <div className="ldg-reflection-label">Understanding your finances</div>
          <div className="ldg-reflection-quote">is the first step to changing them.</div>
        </div>
        <img src={heart03} alt="" className="ldg-reflection-heart" />
      </div>
    </div>
  );
}
