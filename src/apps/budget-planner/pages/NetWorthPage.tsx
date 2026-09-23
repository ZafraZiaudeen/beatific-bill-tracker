import { useMemo, useState } from 'react';
import { PageIntroBanner } from '../components/PageIntroBanner';
import { AccountDialog } from '../dialogs/AccountDialog';
import { useLedgerlyStore } from '../store/useLedgerlyStore';
import { fmt, fmtYMFull } from '../utils/formatters';
import type { Account, NetWorthHistory } from '../types';
import { ACCOUNT_GROUP_ORDER, accountGroupForType, accountVisibleIn } from '../utils/accounts';
import sprig01 from '../../../assets/budget-assets/botanical-sprigs/botanical-sprigs-01.png';
import flower01 from '../../../assets/budget-assets/flowers-and-leaves/flowers-and-leaves-01.png';
import flower02 from '../../../assets/budget-assets/flowers-and-leaves/flowers-and-leaves-02.png';
import flower04 from '../../../assets/budget-assets/flowers-and-leaves/flowers-and-leaves-04.png';
import heart01 from '../../../assets/budget-assets/hearts/heart-01.png';

type ChartMode = 'net' | 'split';
type ChartPoint = NetWorthHistory & { live?: boolean };

const GROUP_CFG: Record<string, { color: string; bg: string; icon: string }> = {
  Checking: { color: '#4a7060', bg: 'rgba(122,158,126,.15)', icon: '$' },
  Savings: { color: '#5f8d68', bg: 'rgba(95,141,104,.15)', icon: 'S' },
  Cash: { color: '#7a9e7e', bg: 'rgba(122,158,126,.15)', icon: 'C' },
  'Credit cards': { color: '#a05050', bg: 'rgba(196,138,138,.15)', icon: 'CC' },
  Loans: { color: '#8a6020', bg: 'rgba(196,163,90,.15)', icon: 'L' },
  Investments: { color: '#3a6e96', bg: 'rgba(107,158,196,.15)', icon: 'I' },
  Property: { color: '#8c6f42', bg: 'rgba(196,163,90,.15)', icon: 'P' },
  Vehicles: { color: '#8a7ca8', bg: 'rgba(158,138,190,.15)', icon: 'V' },
  'Other assets': { color: '#667085', bg: 'rgba(102,112,133,.12)', icon: 'O' },
};

function pctChange(current: number, previous: number) {
  if (!previous) return 0;
  return ((current - previous) / Math.abs(previous)) * 100;
}

function monthLabel(month: string) {
  const parts = month.split('-');
  return parts.length === 2 ? fmtYMFull(month).slice(0, 3) : month;
}

function lastUpdatedLabel(value?: string) {
  if (!value) return 'Not updated yet';
  const time = new Date(value).getTime();
  if (!Number.isFinite(time)) return 'Updated manually';
  const diffDays = Math.max(0, Math.floor((Date.now() - time) / 86_400_000));
  if (diffDays === 0) return 'Updated today';
  if (diffDays === 1) return 'Updated yesterday';
  if (diffDays < 30) return `Updated ${diffDays} days ago`;
  return `Updated ${Math.floor(diffDays / 30)} mo. ago`;
}

function accountStatus(account: Account) {
  if (!accountVisibleIn(account, 'networth')) return 'Hidden from Net Worth';
  return account.reconciled ? 'Reconciled' : 'Needs review';
}

function DonutChart({ assets, liabilities }: { assets: number; liabilities: number }) {
  const total = assets + liabilities || 1;
  const r = 76;
  const cx = 104;
  const cy = 104;
  const circumference = 2 * Math.PI * r;
  const assetDash = circumference * (assets / total);
  const liabilityDash = circumference * (liabilities / total);
  const offset = circumference / 4;
  return (
    <svg viewBox="0 0 208 208" width={188} height={188} style={{ display: 'block' }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(180,195,180,.2)" strokeWidth={22} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#7a9e7e" strokeWidth={22}
        strokeDasharray={`${assetDash} ${circumference - assetDash}`} strokeDashoffset={offset} strokeLinecap="round" />
      {liabilities > 0 && (
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#c48a8a" strokeWidth={22}
          strokeDasharray={`${liabilityDash} ${circumference - liabilityDash}`} strokeDashoffset={offset - assetDash} strokeLinecap="round" />
      )}
      <text x={cx} y={cy - 9} textAnchor="middle" fontSize="11" fill="currentColor" opacity=".6" fontFamily="inherit">Net worth</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="15" fontWeight="700" fill="currentColor" fontFamily="inherit">
        {fmt(assets - liabilities)}
      </text>
    </svg>
  );
}

function NetWorthChart({ mode, history }: { mode: ChartMode; history: ChartPoint[] }) {
  const W = 720;
  const H = 260;
  const padL = 62;
  const padR = 24;
  const padT = 20;
  const padB = 40;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const series = history.length ? history : [{ month: 'Now', value: 0, assets: 0, liabilities: 0, live: true }];
  const values = mode === 'split'
    ? series.flatMap(point => [point.assets ?? Math.max(point.value, 0), point.liabilities ?? 0])
    : series.map(point => point.value);
  const minV = Math.min(0, ...values);
  const maxV = Math.max(1, ...values);
  const rangePad = Math.max((maxV - minV) * 0.12, 500);
  const yMin = Math.min(0, minV - rangePad);
  const yMax = maxV + rangePad;
  const x = (index: number) => padL + (series.length === 1 ? chartW / 2 : (index / (series.length - 1)) * chartW);
  const y = (value: number) => padT + chartH - ((value - yMin) / (yMax - yMin)) * chartH;
  const ticks = Array.from({ length: 5 }, (_, index) => yMin + ((yMax - yMin) / 4) * index);
  const netPoints = series.map((point, index) => `${x(index)},${y(point.value)}`).join(' ');
  const assetPoints = series.map((point, index) => `${x(index)},${y(point.assets ?? Math.max(point.value, 0))}`).join(' ');
  const liabilityPoints = series.map((point, index) => `${x(index)},${y(point.liabilities ?? 0)}`).join(' ');
  const areaPoints = `${x(0)},${y(0)} ${netPoints} ${x(series.length - 1)},${y(0)}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Net worth over time" style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id="nwp-area-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7a9e7e" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#7a9e7e" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {ticks.map(tick => (
        <g key={tick}>
          <line x1={padL} y1={y(tick)} x2={W - padR} y2={y(tick)} stroke="rgba(200,210,195,.4)" strokeWidth="1" />
          <text x={padL - 8} y={y(tick) + 4} textAnchor="end" fontSize="10" fill="#9ca3af">{fmt(tick)}</text>
        </g>
      ))}
      {mode === 'net' ? (
        <>
          <polygon points={areaPoints} fill="url(#nwp-area-grad)" />
          <polyline points={netPoints} fill="none" stroke="#7a9e7e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {series.map((point, index) => (
            <circle key={`${point.month}-net`} cx={x(index)} cy={y(point.value)} r={point.live ? 5 : 4} fill="#7a9e7e" stroke="#fff" strokeWidth="2" />
          ))}
        </>
      ) : (
        <>
          <polyline points={assetPoints} fill="none" stroke="#7a9e7e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points={liabilityPoints} fill="none" stroke="#c48a8a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {series.map((point, index) => (
            <g key={`${point.month}-split`}>
              <circle cx={x(index)} cy={y(point.assets ?? 0)} r={point.live ? 5 : 4} fill="#7a9e7e" stroke="#fff" strokeWidth="2" />
              <circle cx={x(index)} cy={y(point.liabilities ?? 0)} r={point.live ? 5 : 4} fill="#c48a8a" stroke="#fff" strokeWidth="2" />
            </g>
          ))}
        </>
      )}
      {series.map((point, index) => (
        <text key={`${point.month}-label`} x={x(index)} y={H - 10} textAnchor="middle" fontSize="10" fill="#9ca3af">
          {point.live ? 'Live' : monthLabel(point.month)}
        </text>
      ))}
    </svg>
  );
}

export function NetWorthPage() {
  const accounts = useLedgerlyStore(s => s.accounts);
  const netWorthSnapshot = useLedgerlyStore(s => s.netWorth);
  const currentMonth = useLedgerlyStore(s => s.currentMonth);
  const getLiveNetWorth = useLedgerlyStore(s => s.getLiveNetWorth);
  const saveNetWorthSnapshot = useLedgerlyStore(s => s.saveNetWorthSnapshot);
  const [mode, setMode] = useState<ChartMode>('net');
  const [showDialog, setShowDialog] = useState(false);

  const live = getLiveNetWorth('networth');
  const visibleAccounts = useMemo(() => accounts.filter(account => accountVisibleIn(account, 'networth')), [accounts]);
  const hiddenAccounts = useMemo(() => accounts.filter(account => !accountVisibleIn(account, 'networth')), [accounts]);

  const historySeries = useMemo<ChartPoint[]>(() => {
    const history = netWorthSnapshot.history.filter(point => point.month !== currentMonth);
    return [...history, {
      month: currentMonth,
      value: live.value,
      assets: live.assets,
      liabilities: live.liabilities,
      capturedAt: 'Live',
      live: true,
    }].sort((a, b) => a.month.localeCompare(b.month));
  }, [currentMonth, live.assets, live.liabilities, live.value, netWorthSnapshot.history]);

  const previousPoint = [...historySeries].reverse().find(point => !point.live);
  const changeAmount = previousPoint ? live.value - previousPoint.value : 0;
  const changePct = previousPoint ? pctChange(live.value, previousPoint.value) : 0;
  const changeUp = changeAmount >= 0;
  const currentSnapshot = netWorthSnapshot.history.find(point => point.month === currentMonth);

  const groupedAccounts = useMemo(() => {
    const groups = new Map<string, Account[]>();
    for (const account of visibleAccounts) {
      const group = account.group || accountGroupForType(account.type);
      groups.set(group, [...(groups.get(group) ?? []), account]);
    }
    return [...ACCOUNT_GROUP_ORDER, ...[...groups.keys()].filter(group => !ACCOUNT_GROUP_ORDER.includes(group))]
      .map(group => ({ group, accounts: groups.get(group) ?? [] }))
      .filter(item => item.accounts.length > 0);
  }, [visibleAccounts]);

  const groupTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const account of visibleAccounts) {
      const group = account.group || accountGroupForType(account.type);
      totals[group] = (totals[group] ?? 0) + Math.abs(account.balance);
    }
    return totals;
  }, [visibleAccounts]);

  const totalAbsolute = Object.values(groupTotals).reduce((sum, value) => sum + value, 0) || 1;

  return (
    <div className="ldg-nwp-page">
      <PageIntroBanner view="networth" />
      <div className="ldg-nwp-header">
        <div>
          <div className="ldg-nwp-title">Net Worth <img src={heart01} alt="" /></div>
          <div className="ldg-nwp-subtitle">A full account-balance view of assets, liabilities, and progress over time.</div>
        </div>
        <div className="ldg-nwp-actions">
          <div className="ldg-month-chip">{fmtYMFull(currentMonth)}</div>
          <button className="ldg-rpt-print-btn" onClick={() => saveNetWorthSnapshot(currentMonth)}>
            {currentSnapshot ? 'Update this month' : 'Save snapshot'}
          </button>
          <button className="ldg-goals-add-btn" onClick={() => setShowDialog(true)}>
            + Add account
          </button>
        </div>
      </div>

      <div className="ldg-stat-row">
        <div className="ldg-stat-card ldg-stat-cream">
          <img src={flower01} alt="" className="ldg-stat-deco" />
          <div className="ldg-stat-inner">
            <div className="ldg-stat-icon ldg-stat-icon-leaf">+</div>
            <div className="ldg-stat-label">Total assets</div>
            <div className="ldg-stat-amount">{fmt(live.assets)}</div>
            <div className="ldg-stat-sub">{visibleAccounts.filter(account => account.balance > 0).length} visible asset accounts</div>
          </div>
        </div>
        <div className="ldg-stat-card ldg-stat-white">
          <img src={flower02} alt="" className="ldg-stat-deco" />
          <div className="ldg-stat-inner">
            <div className="ldg-stat-icon ldg-stat-icon-cal">-</div>
            <div className="ldg-stat-label">Total liabilities</div>
            <div className="ldg-stat-amount">{fmt(live.liabilities)}</div>
            <div className="ldg-stat-sub">{visibleAccounts.filter(account => account.balance < 0).length} visible liability accounts</div>
          </div>
        </div>
        <div className="ldg-stat-card ldg-stat-blush">
          <img src={sprig01} alt="" className="ldg-stat-deco" />
          <div className="ldg-stat-inner">
            <div className="ldg-stat-icon ldg-stat-icon-leaf">=</div>
            <div className="ldg-stat-label">Current net worth</div>
            <div className="ldg-stat-amount">{live.value < 0 ? '-' : ''}{fmt(Math.abs(live.value))}</div>
            <div className="ldg-stat-sub">Assets minus liabilities</div>
          </div>
        </div>
        <div className="ldg-stat-card ldg-nwp-stat-sage">
          <img src={flower04} alt="" className="ldg-stat-deco" />
          <div className="ldg-stat-inner">
            <div className="ldg-stat-icon" style={{ background: changeUp ? 'rgba(90,144,96,.12)' : 'rgba(196,96,96,.1)', color: changeUp ? '#5a9060' : '#c04040' }}>
              {changeUp ? '↑' : '↓'}
            </div>
            <div className="ldg-stat-label">Month-over-month</div>
            <div className="ldg-stat-amount" style={{ color: changeUp ? '#5a9060' : '#c46060' }}>
              {changeUp ? '+' : '-'}{fmt(Math.abs(changeAmount))}
            </div>
            <div className="ldg-stat-sub">
              {previousPoint ? (
                <span className={changeUp ? 'ldg-nwp-change-up' : 'ldg-nwp-change-down'}>
                  {Math.abs(changePct).toFixed(1)}% vs {fmtYMFull(previousPoint.month)}
                </span>
              ) : 'Save snapshots to compare months'}
            </div>
          </div>
        </div>
      </div>

      <div className="ldg-nwp-body">
        <div className="ldg-nwp-wide-column">
          <div className="ldg-card">
            <div className="ldg-nwp-chart-hdr">
              <div>
                <div className="ldg-card-title">Net Worth Over Time</div>
                <div className="ldg-nwp-card-sub">Saved monthly snapshots plus the live current month.</div>
              </div>
              <div className="ldg-nwp-mode-toggle">
                {(['net', 'split'] as ChartMode[]).map(item => (
                  <button key={item} type="button" className={mode === item ? 'active' : ''} onClick={() => setMode(item)}>
                    {item === 'net' ? 'Net' : 'Assets / liabilities'}
                  </button>
                ))}
              </div>
            </div>
            <div className="ldg-nwp-chart-wrap">
              <NetWorthChart mode={mode} history={historySeries} />
            </div>
            <div className="ldg-nwp-chart-legend">
              <span><i style={{ background: '#7a9e7e' }} />{mode === 'net' ? 'Net worth' : 'Assets'}</span>
              {mode === 'split' && <span><i style={{ background: '#c48a8a' }} />Liabilities</span>}
              <span>{currentSnapshot?.capturedAt ? `Snapshot saved ${lastUpdatedLabel(currentSnapshot.capturedAt).replace('Updated', '').toLowerCase()}` : 'Current month is live until saved'}</span>
            </div>
          </div>

          <div className="ldg-card">
            <div className="ldg-nwp-chart-hdr">
              <div>
                <div className="ldg-card-title">Net Worth by Account Type</div>
                <div className="ldg-nwp-card-sub">Checking, savings, debts, property, investments, and manual assets.</div>
              </div>
            </div>
            <div className="ldg-nwp-breakdown">
              {ACCOUNT_GROUP_ORDER.map(group => {
                const amount = groupTotals[group] ?? 0;
                if (amount === 0) return null;
                const pct = Math.round((amount / totalAbsolute) * 100);
                const cfg = GROUP_CFG[group] ?? GROUP_CFG['Other assets'];
                return (
                  <div key={group} className="ldg-nwp-breakdown-row">
                    <span className="ldg-nwp-group-icon" style={{ background: cfg.bg, color: cfg.color }}>{cfg.icon}</span>
                    <span className="ldg-nwp-bk-name">{group}</span>
                    <div className="ldg-nwp-bk-bar">
                      <div className="ldg-nwp-bk-fill" style={{ width: `${pct}%`, background: cfg.color }} />
                    </div>
                    <span className="ldg-nwp-bk-amt">{fmt(amount)}</span>
                    <span className="ldg-nwp-bk-pct">{pct}%</span>
                  </div>
                );
              })}
              {visibleAccounts.length === 0 && (
                <div className="ldg-nwp-empty">No net-worth accounts yet. Add checking, savings, property, investments, or liabilities to start.</div>
              )}
            </div>
          </div>
        </div>

        <div className="ldg-card ldg-nwp-donut-card">
          <div className="ldg-nwp-chart-hdr" style={{ width: '100%', padding: '14px 4px 8px' }}>
            <div className="ldg-card-title">Assets vs. Liabilities</div>
          </div>
          <DonutChart assets={live.assets} liabilities={live.liabilities} />
          <div className="ldg-nwp-donut-legend">
            <div className="ldg-nwp-legend-row">
              <div className="ldg-nwp-legend-label"><span className="ldg-nwp-legend-dot" style={{ background: '#7a9e7e' }} />Assets</div>
              <span className="ldg-nwp-legend-val">{fmt(live.assets)}</span>
            </div>
            <div className="ldg-nwp-legend-row">
              <div className="ldg-nwp-legend-label"><span className="ldg-nwp-legend-dot" style={{ background: '#c48a8a' }} />Liabilities</div>
              <span className="ldg-nwp-legend-val">{fmt(live.liabilities)}</span>
            </div>
          </div>
        </div>

        <div className="ldg-card ldg-nwp-accounts-card">
          <div className="ldg-nwp-chart-hdr">
            <div>
              <div className="ldg-card-title">Account health</div>
              <div className="ldg-nwp-card-sub">{hiddenAccounts.length} hidden from net worth</div>
            </div>
            <button className="ldg-nwp-view-all" onClick={() => setShowDialog(true)}>+ Add</button>
          </div>
          {accounts.length === 0 ? (
            <div className="ldg-nwp-empty">No accounts yet. Add one to make Net Worth useful.</div>
          ) : accounts.slice(0, 7).map(account => (
            <div className="ldg-nwp-acct-row" key={account.id}>
              <div className="ldg-nwp-acct-left">
                <div className="ldg-nwp-acct-icon">{GROUP_CFG[account.group || accountGroupForType(account.type)]?.icon ?? 'A'}</div>
                <div style={{ minWidth: 0 }}>
                  <div className="ldg-nwp-acct-name">{account.name}</div>
                  <div className="ldg-nwp-acct-inst">{account.institution} · {account.type}</div>
                </div>
              </div>
              <div className="ldg-nwp-acct-right">
                <div className="ldg-nwp-acct-amount" style={{ color: account.balance < 0 ? '#c46060' : 'var(--text)' }}>
                  {account.balance < 0 ? '-' : ''}{fmt(Math.abs(account.balance))}
                </div>
                <span className={`ldg-nwp-acct-badge ${account.reconciled ? 'ldg-nwp-acct-badge-liquid' : 'ldg-nwp-acct-badge-asset'}`}>
                  {accountStatus(account)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="ldg-nwp-acct-section">
        <div className="ldg-nwp-acct-section-hdr">
          <div>
            <div className="ldg-nwp-acct-section-title">Accounts powering net worth</div>
            <div className="ldg-nwp-card-sub">Manual property, investment, vehicle, cash, debt, and bank accounts all use this same account model.</div>
          </div>
          <button className="ldg-goals-add-btn" onClick={() => setShowDialog(true)}>+ Add account</button>
        </div>

        {visibleAccounts.length === 0 ? (
          <div className="ldg-card ldg-nwp-empty">No visible net-worth accounts yet.</div>
        ) : groupedAccounts.map(({ group, accounts: groupAccounts }) => {
          const cfg = GROUP_CFG[group] ?? GROUP_CFG['Other assets'];
          return (
            <section key={group} className="ldg-nwp-account-group">
              <div className="ldg-nwp-account-group-title">
                <span style={{ background: cfg.bg, color: cfg.color }}>{cfg.icon}</span>
                {group}
              </div>
              <div className="ldg-nwp-acct-grid">
                {groupAccounts.map(account => (
                  <div className="ldg-nwp-acct-full-card" key={account.id}>
                    <div className="ldg-nwp-acct-full-top">
                      <div className="ldg-nwp-acct-full-icon" style={{ background: cfg.bg, color: cfg.color }}>{cfg.icon}</div>
                      <div style={{ minWidth: 0 }}>
                        <div className="ldg-nwp-acct-full-name">{account.name}</div>
                        <div className="ldg-nwp-acct-full-sub">{account.institution || 'Manual'} · {account.type}</div>
                      </div>
                    </div>
                    <div className="ldg-nwp-acct-full-bal" style={{ color: account.balance < 0 ? '#c46060' : 'var(--text)' }}>
                      {account.balance < 0 ? '-' : ''}{fmt(Math.abs(account.balance))}
                    </div>
                    <div className="ldg-nwp-acct-full-meta">
                      <span>{lastUpdatedLabel(account.lastUpdated)}</span>
                      <span style={{ color: account.reconciled ? '#7a9e7e' : '#c48a8a' }}>
                        {account.reconciled ? 'Reconciled' : 'Needs review'}
                      </span>
                    </div>
                    <div className="ldg-nwp-acct-full-meta">
                      <span>{accountVisibleIn(account, 'dashboard') ? 'Dashboard visible' : 'Hidden from dashboard'}</span>
                      <span>{accountVisibleIn(account, 'reports') ? 'Reports visible' : 'Reports hidden'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <div className="ldg-reflection" style={{ marginTop: 20 }}>
        <img src={sprig01} alt="" className="ldg-reflection-deco-l" />
        <div className="ldg-reflection-inner">
          <div className="ldg-reflection-label">Building wealth isn't about perfection.</div>
          <div className="ldg-reflection-quote">It's about consistent, intentional steps forward.</div>
        </div>
        <img src={heart01} alt="" className="ldg-reflection-heart" />
      </div>

      {showDialog && <AccountDialog account={null} onClose={() => setShowDialog(false)} />}
    </div>
  );
}
