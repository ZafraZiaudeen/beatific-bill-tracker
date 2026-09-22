import { useMemo, useState } from 'react';
import { useLedgerlyStore } from '../store/useLedgerlyStore';
import { fmt, fmtYMFull } from '../utils/formatters';
import type { Transaction } from '../types';

type ReportTab = 'spending' | 'cashflow' | 'networth' | 'budget';

const TAB_LABELS: Record<ReportTab, string> = {
  spending: 'Monthly spending',
  cashflow: 'Cash flow',
  networth: 'Net worth',
  budget: 'Budget vs actual',
};

function signed(n: number) {
  return `${n >= 0 ? '+' : '-'}${fmt(n)}`;
}

function signedPct(n: number) {
  return `${n >= 0 ? '+' : '-'}${Math.abs(n).toFixed(1)}%`;
}

function inferMethod(t: Transaction) {
  const text = `${t.account} ${t.category}`.toLowerCase();
  if (t.amount > 0) return 'Income';
  if (text.includes('credit') || text.includes('amex')) return 'Credit card';
  if (text.includes('cash') || text.includes('checking') || text.includes('bank')) return 'Bank account';
  return 'Other';
}

function LineChart({
  series,
  secondary,
  labels,
  colors = ['#22c55e', '#f97316'],
}: {
  series: number[];
  secondary?: number[];
  labels: string[];
  colors?: [string, string];
}) {
  const W = 760, H = 260, padL = 58, padR = 22, padT = 20, padB = 38;
  const values = [...series, ...(secondary ?? [])];
  const maxV = Math.max(1, ...values);
  const yMax = Math.ceil(maxV / 1000) * 1000;
  const cW = W - padL - padR, cH = H - padT - padB;
  const xp = (i: number) => padL + (series.length <= 1 ? cW : (i / (series.length - 1)) * cW);
  const yp = (v: number) => padT + cH - (v / yMax) * cH;
  const ticks = [0, yMax * 0.25, yMax * 0.5, yMax * 0.75, yMax];
  const points = series.map((v, i) => `${xp(i)},${yp(v)}`).join(' ');
  const secondaryPoints = secondary?.map((v, i) => `${xp(i)},${yp(v)}`).join(' ');

  return (
    <svg className="reports-chart-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Report line chart">
      {ticks.map(tick => (
        <g key={tick}>
          <line x1={padL} y1={yp(tick)} x2={W - padR} y2={yp(tick)} stroke="#e5e2db" />
          <text x={padL - 10} y={yp(tick) + 4} textAnchor="end" fontSize="12" fill="#6b7280">{fmt(tick)}</text>
        </g>
      ))}
      <polyline points={points} fill="none" stroke={colors[0]} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {secondaryPoints && <polyline points={secondaryPoints} fill="none" stroke={colors[1]} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}
      {series.map((v, i) => <circle key={`p-${i}`} cx={xp(i)} cy={yp(v)} r="4" fill={colors[0]} stroke="#fff" strokeWidth="2" />)}
      {secondary?.map((v, i) => <circle key={`s-${i}`} cx={xp(i)} cy={yp(v)} r="4" fill={colors[1]} stroke="#fff" strokeWidth="2" />)}
      {labels.map((label, i) => <text key={label} x={xp(i)} y={H - 10} textAnchor="middle" fontSize="12" fill="#6b7280">{label}</text>)}
    </svg>
  );
}

function BarRows({ rows }: { rows: { name: string; value: number; total: number; color: string }[] }) {
  return (
    <div className="reports-bars">
      {rows.map(row => {
        const pct = row.total > 0 ? Math.round((row.value / row.total) * 100) : 0;
        return (
          <div className="reports-bar-row" key={row.name}>
            <div className="reports-bar-label">{row.name}</div>
            <div className="reports-bar-track"><span style={{ width: `${pct}%`, background: row.color }} /></div>
            <div className="reports-bar-value">{fmt(row.value)}</div>
            <div className="reports-bar-pct">{pct}%</div>
          </div>
        );
      })}
    </div>
  );
}

function MiniCategoryRows({ rows }: { rows: { name: string; value: number; total: number; color: string }[] }) {
  return (
    <div className="reports-mini-rows">
      {rows.map(row => {
        const pct = row.total > 0 ? Math.round((row.value / row.total) * 100) : 0;
        return (
          <div className="reports-mini-row" key={row.name}>
            <span className="reports-mini-name"><i style={{ background: row.color }} />{row.name}</span>
            <span className="reports-mini-value">{fmt(row.value)}</span>
            <span className="reports-mini-pct">{pct}%</span>
          </div>
        );
      })}
    </div>
  );
}

export function ReportsPage() {
  const currentMonth = useLedgerlyStore(s => s.currentMonth);
  const transactions = useLedgerlyStore(s => s.transactions);
  const categories = useLedgerlyStore(s => s.categories);
  const accounts = useLedgerlyStore(s => s.accounts);
  const netWorth = useLedgerlyStore(s => s.netWorth);
  const [tab, setTab] = useState<ReportTab>('spending');
  const [month, setMonth] = useState(currentMonth);
  const [account, setAccount] = useState('All accounts');
  const [category, setCategory] = useState('All categories');
  const [method, setMethod] = useState('All methods');

  const report = useMemo(() => {
    const monthOptions = Array.from(new Set([currentMonth, ...transactions.map(t => t.date.slice(0, 7))])).sort();
    const categoryOptions = Array.from(new Set(transactions.map(t => t.category))).sort();
    const accountOptions = Array.from(new Set(transactions.map(t => t.account))).sort();
    const methodOptions = Array.from(new Set(transactions.map(inferMethod))).sort();
    const filtered = transactions.filter(t => {
      const inMonth = t.date.startsWith(month);
      const inAccount = account === 'All accounts' || t.account === account;
      const inCategory = category === 'All categories' || t.category === category;
      const inMethod = method === 'All methods' || inferMethod(t) === method;
      return inMonth && inAccount && inCategory && inMethod;
    });
    const previousMonth = (() => {
      const [y, m] = month.split('-').map(Number);
      const d = new Date(y, m - 2, 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    })();
    const previous = transactions.filter(t => t.date.startsWith(previousMonth));
    const income = filtered.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const expenses = Math.abs(filtered.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
    const prevIncome = previous.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const prevExpenses = Math.abs(previous.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
    const expenseByCategory = new Map<string, number>();
    for (const txn of filtered.filter(t => t.amount < 0)) {
      expenseByCategory.set(txn.category, (expenseByCategory.get(txn.category) ?? 0) + Math.abs(txn.amount));
    }
    const prevByCategory = new Map<string, number>();
    for (const txn of previous.filter(t => t.amount < 0)) {
      prevByCategory.set(txn.category, (prevByCategory.get(txn.category) ?? 0) + Math.abs(txn.amount));
    }
    const categoryRows = [...expenseByCategory.entries()]
      .map(([name, value], i) => ({ name, value, total: expenses, color: categories.find(c => c.name === name)?.color ?? ['#22c55e', '#3b82f6', '#f97316', '#8b5cf6'][i % 4] }))
      .sort((a, b) => b.value - a.value);
    const biggest = categoryRows.reduce<{ name: string; delta: number; value: number } | null>((best, row) => {
      const delta = row.value - (prevByCategory.get(row.name) ?? 0);
      return !best || delta > best.delta ? { name: row.name, delta, value: row.value } : best;
    }, null);
    const assets = accounts.filter(a => a.balance > 0).reduce((sum, a) => sum + a.balance, 0);
    const liabilities = accounts.filter(a => a.balance < 0).reduce((sum, a) => sum + Math.abs(a.balance), 0);
    const liveNetWorth = assets - liabilities;
    const budgetRows = categories.map(c => ({ name: c.name, value: c.spent, total: Math.max(c.budget, c.spent), color: c.color }));
    const [, monthNum] = month.split('-').map(Number);
    const yearNum = Number(month.slice(0, 4));
    const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
    const bucketEnds = [7, 14, 21, daysInMonth];
    const chartLabels = bucketEnds.map((end, i) => `${i === 0 ? 1 : bucketEnds[i - 1] + 1}-${end}`);
    let runningIncome = 0;
    let runningExpenses = 0;
    const chartIncome: number[] = [];
    const chartExpenses: number[] = [];
    const chartNet: number[] = [];
    bucketEnds.forEach((end, i) => {
      const start = i === 0 ? 1 : bucketEnds[i - 1] + 1;
      const bucket = filtered.filter(t => {
        const day = Number(t.date.slice(8, 10));
        return day >= start && day <= end;
      });
      runningIncome += bucket.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
      runningExpenses += Math.abs(bucket.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
      chartIncome.push(runningIncome);
      chartExpenses.push(runningExpenses);
      chartNet.push(Math.max(0, runningIncome - runningExpenses));
    });
    return {
      monthOptions,
      categoryOptions,
      accountOptions,
      methodOptions,
      filtered,
      income,
      expenses,
      prevIncome,
      prevExpenses,
      savingsRate,
      categoryRows,
      biggest,
      liveNetWorth,
      budgetRows,
      chartLabels,
      chartIncome,
      chartExpenses,
      chartNet,
    };
  }, [account, accounts, categories, category, currentMonth, method, month, transactions]);

  const incomeChange = report.prevIncome ? ((report.income - report.prevIncome) / report.prevIncome) * 100 : 0;
  const expenseChange = report.prevExpenses ? ((report.expenses - report.prevExpenses) / report.prevExpenses) * 100 : 0;
  const netSeries = [...netWorth.history.map(h => h.value), report.liveNetWorth];
  const netLabels = [...netWorth.history.map(h => h.month), 'Now'];
  const monthName = fmtYMFull(month);

  return (
    <div className="reports-page">
      <div className="reports-header">
        <div>
          <h1 className="reports-title">Reports</h1>
          <p className="reports-subtitle">Review trends, compare spending, and print a clean financial summary.</p>
        </div>
        <div className="reports-header-actions">
          <select value={month} onChange={e => setMonth(e.target.value)} className="reports-select compact">
            {report.monthOptions.map(m => <option key={m} value={m}>{fmtYMFull(m)}</option>)}
          </select>
          <span className="reports-local-pill">Local only</span>
        </div>
      </div>

      <div className="reports-tabs">
        {(Object.keys(TAB_LABELS) as ReportTab[]).map(id => (
          <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>{TAB_LABELS[id]}</button>
        ))}
      </div>

      <div className="reports-filter-grid">
        <label><span>Account</span><select value={account} onChange={e => setAccount(e.target.value)}><option>All accounts</option>{report.accountOptions.map(v => <option key={v}>{v}</option>)}</select></label>
        <label><span>Category</span><select value={category} onChange={e => setCategory(e.target.value)}><option>All categories</option>{report.categoryOptions.map(v => <option key={v}>{v}</option>)}</select></label>
        <label><span>Method</span><select value={method} onChange={e => setMethod(e.target.value)}><option>All methods</option>{report.methodOptions.map(v => <option key={v}>{v}</option>)}</select></label>
      </div>

      <div className="reports-kpi-grid">
        <div className="reports-kpi"><div className="reports-kpi-icon green">+</div><div><span>Income</span><strong>{fmt(report.income)}</strong><small>{signedPct(incomeChange)} vs. last month</small></div></div>
        <div className="reports-kpi"><div className="reports-kpi-icon orange">-</div><div><span>Expenses</span><strong>{fmt(report.expenses)}</strong><small>{signedPct(expenseChange)} vs. last month</small></div></div>
        <div className="reports-kpi"><div className="reports-kpi-icon blue">%</div><div><span>Savings rate</span><strong>{report.savingsRate.toFixed(1)}%</strong><small>{fmt(report.income - report.expenses)} saved</small></div></div>
        <div className="reports-kpi"><div className="reports-kpi-icon dark">!</div><div><span>Biggest change</span><strong>{report.biggest?.name ?? 'None'}</strong><small>{report.biggest ? signed(report.biggest.delta) : '$0'} vs. prior month</small></div></div>
      </div>

      <div className="reports-main-grid">
        <section className="reports-card reports-chart-card">
          <div className="reports-card-header">
            <div>
              <h2>{tab === 'spending' ? 'Spending vs. income' : TAB_LABELS[tab]}</h2>
              <p>{monthName}</p>
            </div>
            <div className="reports-legend"><span><i className="green" />Income</span><span><i className="orange" />Expenses</span></div>
          </div>
          {tab === 'spending' && <LineChart series={report.chartIncome} secondary={report.chartExpenses} labels={report.chartLabels} colors={['#22c55e', '#f97316']} />}
          {tab === 'cashflow' && <LineChart series={report.chartNet} labels={report.chartLabels} colors={['#22c55e', '#f97316']} />}
          {tab === 'networth' && <LineChart series={netSeries} labels={netLabels} colors={['#22c55e', '#f97316']} />}
          {tab === 'budget' && <BarRows rows={report.budgetRows} />}
        </section>

        <aside className="reports-print-card">
          <h2>Print-friendly report</h2>
          <p>A clean, branded summary of your finances for {monthName}.</p>
          <div className="reports-print-preview">
            <strong>Ledgerly</strong>
            <h3>Monthly Financial Report</h3>
            <span>{monthName}</span>
            <div className="reports-print-metrics">
              <div><small>Income</small><b>{fmt(report.income)}</b></div>
              <div><small>Expenses</small><b>{fmt(report.expenses)}</b></div>
              <div><small>Savings</small><b>{report.savingsRate.toFixed(1)}%</b></div>
              <div><small>Net worth</small><b>{fmt(report.liveNetWorth)}</b></div>
            </div>
            <MiniCategoryRows rows={report.categoryRows.slice(0, 5)} />
          </div>
          <div className="reports-print-actions">
            <button onClick={() => window.print()} className="reports-primary-btn">Print</button>
            <button onClick={() => window.print()} className="reports-secondary-btn">Export PDF</button>
          </div>
        </aside>
      </div>

      <section className="reports-card reports-print-source">
        <div className="reports-card-header">
          <div>
            <h2>Expenses by category</h2>
            <p>Total spending - {monthName}</p>
          </div>
        </div>
        <BarRows rows={report.categoryRows.length ? report.categoryRows : [{ name: 'No expenses', value: 0, total: 1, color: '#d1d5db' }]} />
      </section>
    </div>
  );
}
