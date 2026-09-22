import { useMemo, useState } from 'react';
import { AccountDialog } from '../dialogs/AccountDialog';
import { useLedgerlyStore } from '../store/useLedgerlyStore';
import { fmt } from '../utils/formatters';
import type { Account } from '../types';

type ChartMode = 'net' | 'split';

const GROUP_ORDER = ['Cash', 'Credit cards', 'Loans', 'Other assets'];

const GROUP_CFG: Record<string, { color: string; bg: string; icon: string }> = {
  Cash: { color: '#16a34a', bg: '#f0fdf4', icon: '$' },
  'Credit cards': { color: '#ef4444', bg: '#fef2f2', icon: 'CC' },
  Loans: { color: '#f97316', bg: '#fff7ed', icon: 'LN' },
  'Other assets': { color: '#8b5cf6', bg: '#f5f3ff', icon: 'OA' },
};

function signedFmt(n: number) {
  return n < 0 ? `-${fmt(n)}` : fmt(n);
}

function pctChange(current: number, previous: number) {
  if (!previous) return 0;
  return ((current - previous) / Math.abs(previous)) * 100;
}

function NetWorthChart({
  mode,
  history,
  assets,
  liabilities,
  currentNet,
}: {
  mode: ChartMode;
  history: { month: string; value: number }[];
  assets: number;
  liabilities: number;
  currentNet: number;
}) {
  const W = 760;
  const H = 280;
  const padL = 58;
  const padR = 22;
  const padT = 22;
  const padB = 42;
  const cW = W - padL - padR;
  const cH = H - padT - padB;
  const series = history.length ? history : [{ month: 'Now', value: currentNet }];
  const values = mode === 'split' ? [...series.map(h => Math.max(h.value, 0)), assets, liabilities] : [...series.map(h => h.value), currentNet];
  const minV = Math.min(0, ...values);
  const maxV = Math.max(1, ...values);
  const rangePad = Math.max((maxV - minV) * 0.12, 1000);
  const yMin = Math.min(0, minV - rangePad);
  const yMax = maxV + rangePad;
  const n = series.length;
  const xp = (i: number) => padL + (n === 1 ? cW : (i / (n - 1)) * cW);
  const yp = (v: number) => padT + cH - ((v - yMin) / (yMax - yMin)) * cH;
  const tickCount = 4;
  const yTicks = Array.from({ length: tickCount + 1 }, (_, i) => yMin + ((yMax - yMin) / tickCount) * i);

  const netPoints = series.map((h, i) => `${xp(i)},${yp(i === n - 1 ? currentNet : h.value)}`).join(' ');
  const areaPoints = `${xp(0)},${yp(0)} ${netPoints} ${xp(n - 1)},${yp(0)}`;

  const assetPoints = series.map((h, i) => {
    const value = i === n - 1 ? assets : Math.max(0, assets + (h.value - currentNet));
    return `${xp(i)},${yp(value)}`;
  }).join(' ');
  const liabilityPoints = series.map((_, i) => {
    const value = i === n - 1 ? liabilities : Math.max(0, liabilities);
    return `${xp(i)},${yp(value)}`;
  }).join(' ');

  return (
    <svg className="networth-chart-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Net worth history chart">
      <defs>
        <linearGradient id="networth-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {yTicks.map(tick => {
        const y = yp(tick);
        return (
          <g key={tick}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#e5e2db" strokeWidth="1" />
            <text x={padL - 10} y={y + 4} textAnchor="end" fontSize="12" fill="#6b7280">{fmt(tick)}</text>
          </g>
        );
      })}
      {mode === 'net' ? (
        <>
          <polygon points={areaPoints} fill="url(#networth-area)" />
          <polyline points={netPoints} fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {series.map((h, i) => (
            <circle key={h.month} cx={xp(i)} cy={yp(i === n - 1 ? currentNet : h.value)} r="4.5" fill="#22c55e" stroke="#fff" strokeWidth="2" />
          ))}
        </>
      ) : (
        <>
          <polyline points={assetPoints} fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points={liabilityPoints} fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {series.map((h, i) => (
            <g key={h.month}>
              <circle cx={xp(i)} cy={yp(i === n - 1 ? assets : Math.max(0, assets + (h.value - currentNet)))} r="4" fill="#22c55e" stroke="#fff" strokeWidth="2" />
              <circle cx={xp(i)} cy={yp(i === n - 1 ? liabilities : liabilities)} r="4" fill="#ef4444" stroke="#fff" strokeWidth="2" />
            </g>
          ))}
        </>
      )}
      {series.map((h, i) => (
        <text key={`${h.month}-label`} x={xp(i)} y={H - 12} textAnchor="middle" fontSize="12" fill="#6b7280">{h.month}</text>
      ))}
    </svg>
  );
}

export function NetWorthPage() {
  const accounts = useLedgerlyStore(s => s.accounts);
  const netWorthSnapshot = useLedgerlyStore(s => s.netWorth);
  const [mode, setMode] = useState<ChartMode>('net');
  const [showDialog, setShowDialog] = useState(false);

  const totals = useMemo(() => {
    const assets = accounts.filter(a => a.balance > 0).reduce((sum, a) => sum + a.balance, 0);
    const liabilities = accounts.filter(a => a.balance < 0).reduce((sum, a) => sum + Math.abs(a.balance), 0);
    const netWorth = assets - liabilities;
    const history = netWorthSnapshot.history;
    const previous = history.length >= 2 ? history[history.length - 2].value : history[0]?.value ?? netWorth;
    const changeAmount = netWorth - previous;
    const changePct = pctChange(netWorth, previous);
    return { assets, liabilities, netWorth, previous, changeAmount, changePct };
  }, [accounts, netWorthSnapshot.history]);

  const groupedAccounts = useMemo(() => {
    const groups = new Map<string, Account[]>();
    for (const account of accounts) {
      const group = account.group || 'Other assets';
      groups.set(group, [...(groups.get(group) ?? []), account]);
    }
    return [...GROUP_ORDER, ...[...groups.keys()].filter(g => !GROUP_ORDER.includes(g))]
      .map(group => ({ group, accounts: groups.get(group) ?? [] }))
      .filter(item => item.accounts.length > 0);
  }, [accounts]);

  const changeUp = totals.changeAmount >= 0;

  return (
    <div className="networth-page">
      <div className="networth-header">
        <div>
          <h1 className="networth-title">Net worth</h1>
          <p className="networth-subtitle">See where you stand, track your progress, and keep your accounts up to date.</p>
        </div>
        <button className="networth-primary-btn" onClick={() => setShowDialog(true)}>
          <span aria-hidden="true">+</span>
          Add account manually
        </button>
      </div>

      <div className="networth-kpi-grid">
        <div className="networth-kpi-card">
          <div className="networth-kpi-icon green">$</div>
          <div>
            <div className="networth-kpi-label">Total assets</div>
            <div className="networth-kpi-value">{fmt(totals.assets)}</div>
            <div className="networth-kpi-sub">{accounts.filter(a => a.balance > 0).length} asset accounts</div>
          </div>
        </div>
        <div className="networth-kpi-card">
          <div className="networth-kpi-icon red">-</div>
          <div>
            <div className="networth-kpi-label">Total liabilities</div>
            <div className="networth-kpi-value">{fmt(totals.liabilities)}</div>
            <div className="networth-kpi-sub">{accounts.filter(a => a.balance < 0).length} liability accounts</div>
          </div>
        </div>
        <div className="networth-kpi-card dark">
          <div className="networth-kpi-icon dark">NW</div>
          <div>
            <div className="networth-kpi-label">Current net worth</div>
            <div className="networth-kpi-value">{signedFmt(totals.netWorth)}</div>
            <div className={`networth-kpi-sub ${changeUp ? 'positive' : 'negative'}`}>{changeUp ? '+' : '-'}{Math.abs(totals.changePct).toFixed(1)}% vs. last month</div>
          </div>
        </div>
        <div className="networth-kpi-card">
          <div className="networth-kpi-icon blue">%</div>
          <div>
            <div className="networth-kpi-label">Month-over-month</div>
            <div className="networth-kpi-value">{changeUp ? '+' : '-'}{fmt(totals.changeAmount)}</div>
            <div className={`networth-kpi-sub ${changeUp ? 'positive' : 'negative'}`}>{changeUp ? 'Improved' : 'Declined'} from prior snapshot</div>
          </div>
        </div>
      </div>

      <div className="networth-main-grid">
        <section className="networth-chart-card">
          <div className="networth-card-header">
            <div>
              <h2 className="networth-card-title">Net worth over time</h2>
              <p className="networth-card-sub">Historical trend with current totals from your accounts.</p>
            </div>
            <div className="networth-toggle" aria-label="Chart view">
              <button className={mode === 'net' ? 'active' : ''} onClick={() => setMode('net')}>Net worth</button>
              <button className={mode === 'split' ? 'active' : ''} onClick={() => setMode('split')}>Assets / Liabilities</button>
            </div>
          </div>
          <NetWorthChart
            mode={mode}
            history={netWorthSnapshot.history}
            assets={totals.assets}
            liabilities={totals.liabilities}
            currentNet={totals.netWorth}
          />
          {mode === 'split' && (
            <div className="networth-chart-legend">
              <span><i className="green" />Assets</span>
              <span><i className="red" />Liabilities</span>
            </div>
          )}
        </section>

        <aside className="networth-summary-card">
          <h2 className="networth-card-title">Net worth</h2>
          <div className="networth-summary-value">{signedFmt(totals.netWorth)}</div>
          <div className="networth-summary-list">
            <div>
              <span><i className="green" />Assets</span>
              <strong>{fmt(totals.assets)}</strong>
            </div>
            <div>
              <span><i className="red" />Liabilities</span>
              <strong>{fmt(totals.liabilities)}</strong>
            </div>
          </div>
          <div className="networth-summary-change">
            <span>MoM change</span>
            <strong className={changeUp ? 'positive' : 'negative'}>{changeUp ? '+' : '-'}{fmt(totals.changeAmount)}</strong>
            <small className={changeUp ? 'positive' : 'negative'}>{changeUp ? '+' : '-'}{Math.abs(totals.changePct).toFixed(1)}%</small>
          </div>
        </aside>
      </div>

      <section className="networth-accounts-section">
        <div className="networth-section-header">
          <div>
            <h2 className="networth-card-title">Your accounts</h2>
            <p className="networth-card-sub">Balances here power your current net worth.</p>
          </div>
          <button className="networth-secondary-btn" onClick={() => setShowDialog(true)}>+ Add account</button>
        </div>
        <div className="networth-account-grid">
          {groupedAccounts.map(({ group, accounts: groupAccounts }) => {
            const cfg = GROUP_CFG[group] ?? GROUP_CFG['Other assets'];
            return groupAccounts.map(account => (
              <article className="networth-account-card" key={account.id}>
                <div className="networth-account-top">
                  <div className="networth-account-icon" style={{ background: cfg.bg, color: cfg.color }}>{cfg.icon}</div>
                  <div>
                    <h3>{account.name}</h3>
                    <p>{group} / {account.type}</p>
                  </div>
                </div>
                <div className={account.balance < 0 ? 'networth-account-balance negative' : 'networth-account-balance'}>
                  {signedFmt(account.balance)}
                </div>
                <div className="networth-account-meta">
                  <span>{account.institution || 'Manual account'}</span>
                  <span>{account.visibility ? 'Visible' : 'Hidden'}</span>
                </div>
              </article>
            ));
          })}
        </div>
      </section>

      {showDialog && <AccountDialog account={null} onClose={() => setShowDialog(false)} />}
    </div>
  );
}
