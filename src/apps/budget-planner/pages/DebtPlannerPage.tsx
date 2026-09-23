import { useMemo, useState } from 'react';
import { useLedgerlyStore } from '../store/useLedgerlyStore';
import { fmt, fmtYM, fmtYMFull } from '../utils/formatters';
import { DebtDialog } from '../dialogs/DebtDialog';
import { payoffDateLabel, simulateDebtPayoff, type SimResult } from '../utils/debtSimulator';
import type { Debt } from '../types';
import flower03 from '../../../assets/budget-assets/flowers-and-leaves/flowers-and-leaves-03.png';
import flower05 from '../../../assets/budget-assets/flowers-and-leaves/flowers-and-leaves-05.png';
import sprig02 from '../../../assets/budget-assets/botanical-sprigs/botanical-sprigs-02.png';
import sprig03 from '../../../assets/budget-assets/botanical-sprigs/botanical-sprigs-03.png';
import heart01 from '../../../assets/budget-assets/hearts/heart-01.png';

function TimelineChart({ active, compare, color }: { active: SimResult; compare: SimResult; color: string }) {
  const W = 720, H = 250, padL = 62, padR = 24, padT = 20, padB = 42;
  const totalMonths = Math.max(active.months, compare.months, 1);
  const maxBal = Math.max(active.monthlyBalances[0] ?? 0, compare.monthlyBalances[0] ?? 0, 1);
  const toPoints = (balances: number[]) => balances.map((balance, index) => {
    const x = padL + (index / totalMonths) * (W - padL - padR);
    const y = padT + (1 - balance / maxBal) * (H - padT - padB);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const activePts = toPoints(active.monthlyBalances);
  const comparePts = toPoints(compare.monthlyBalances);
  const ticks = [0, Math.floor(totalMonths / 2), totalMonths];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id="debt-active-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".2" />
          <stop offset="100%" stopColor={color} stopOpacity=".02" />
        </linearGradient>
      </defs>
      {[0, maxBal / 2, maxBal].map(value => {
        const y = padT + (1 - value / maxBal) * (H - padT - padB);
        return (
          <g key={value}>
            <line x1={padL} x2={W - padR} y1={y} y2={y} stroke="rgba(180,195,180,.35)" />
            <text x={padL - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#8a9e8b">{fmt(value)}</text>
          </g>
        );
      })}
      <polygon points={`${padL},${H - padB} ${activePts} ${W - padR},${H - padB}`} fill="url(#debt-active-grad)" />
      <polyline points={comparePts} fill="none" stroke="#c4a35a" strokeWidth="2" strokeDasharray="6 5" strokeLinecap="round" />
      <polyline points={activePts} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {ticks.map(month => {
        const x = padL + (month / totalMonths) * (W - padL - padR);
        return <text key={month} x={x} y={H - 10} textAnchor="middle" fontSize="10" fill="#8a9e8b">Month {month}</text>;
      })}
    </svg>
  );
}

function statusLabel(result: SimResult, startMonth: string) {
  if (result.status === 'empty') return 'No debts yet';
  if (result.status === 'stalled') return 'Payment too low';
  if (result.status === 'capped') return 'Longer than 40 years';
  return payoffDateLabel(result.months, startMonth);
}

export function DebtPlannerPage() {
  const debts = useLedgerlyStore(s => s.debts);
  const debtPlan = useLedgerlyStore(s => s.debtPlan);
  const setView = useLedgerlyStore(s => s.setView);
  const setDebtPlan = useLedgerlyStore(s => s.setDebtPlan);
  const deleteDebt = useLedgerlyStore(s => s.deleteDebt);
  const selectedDebtId = useLedgerlyStore(s => s.selectedDebtId);
  const setSelectedDebtId = useLedgerlyStore(s => s.setSelectedDebtId);
  const currentMonth = useLedgerlyStore(s => s.currentMonth);
  const [showDebtDialog, setShowDebtDialog] = useState(false);
  const [editDebt, setEditDebt] = useState<Debt | null>(null);

  const startMonth = debtPlan.startMonth || currentMonth;
  const [simExtra, setSimExtra] = useState(debtPlan.extraPayment);
  const activeStrategy = debtPlan.strategy;
  const snowball = useMemo(() => simulateDebtPayoff(debts, 'snowball', simExtra, startMonth), [debts, simExtra, startMonth]);
  const avalanche = useMemo(() => simulateDebtPayoff(debts, 'avalanche', simExtra, startMonth), [debts, simExtra, startMonth]);
  const active = activeStrategy === 'snowball' ? snowball : avalanche;
  const compare = activeStrategy === 'snowball' ? avalanche : snowball;
  const oneDebt = debts.filter(debt => debt.balance > 0).length === 1;
  const totalBalance = debts.reduce((sum, debt) => sum + debt.balance, 0);
  const totalMin = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
  const totalExtra = debts.reduce((sum, debt) => sum + debt.extraPayment, 0);
  const selectedDebt = debts.find(debt => debt.id === selectedDebtId) ?? null;
  const interestSaved = oneDebt ? 0 : Math.max(0, compare.totalInterest - active.totalInterest);

  const updatePlan = (patch: Partial<typeof debtPlan>) => {
    setDebtPlan({ ...debtPlan, ...patch });
  };

  const handleDeleteDebt = (debt: Debt) => {
    if (confirm(`Delete "${debt.name}"?`)) deleteDebt(debt.id);
  };

  return (
    <div className="ldg-debt-planner-page">
      <div className="ldg-debt-planner-header">
        <div>
          <button className="ldg-goal-detail-back" onClick={() => setView('goals')}>← Goals & Debt</button>
          <h1>Debt payoff planner <img src={heart01} alt="" /></h1>
          <p>Compare snowball and avalanche payoff strategies with a calm, month-by-month plan.</p>
        </div>
        <div className="ldg-goal-detail-actions">
          <span className="ldg-budget-method-pill">{fmtYMFull(startMonth)}</span>
          <button className="ldg-goals-add-btn ldg-goals-add-debt" onClick={() => { setEditDebt(null); setShowDebtDialog(true); }}>+ Add debt</button>
        </div>
      </div>

      {debts.length === 0 ? (
        <section className="ldg-long-hero">
          <img src={sprig02} alt="" className="ldg-long-hero-deco" />
          <div>
            <span className="ldg-budget-eyebrow">Debt-free planning</span>
            <h2>Add your first debt to compare payoff options.</h2>
            <p>Ledgerly will estimate payoff date, interest, and the order each balance clears.</p>
          </div>
          <button className="ldg-budget-primary-btn" onClick={() => { setEditDebt(null); setShowDebtDialog(true); }}>Add debt</button>
        </section>
      ) : (
        <>
          <div className="ldg-stat-row">
            {[
              { label: 'Total balance', value: fmt(totalBalance), sub: `Across ${debts.length} debt${debts.length !== 1 ? 's' : ''}`, deco: flower05, tint: 'ldg-stat-blush' },
              { label: 'Minimum payments', value: fmt(totalMin), sub: 'Per month', deco: flower03, tint: 'ldg-stat-white' },
              { label: 'Estimated payoff', value: statusLabel(active, startMonth), sub: `${active.months} months · ${activeStrategy}`, deco: sprig03, tint: 'ldg-stat-cream' },
              { label: oneDebt ? 'One debt plan' : 'Interest saved', value: oneDebt ? 'Same order' : fmt(interestSaved), sub: oneDebt ? 'Snowball and avalanche match' : `vs. ${compare.strategy}`, deco: heart01, tint: 'ldg-stat-white' },
            ].map(card => (
              <article key={card.label} className={`ldg-stat-card ${card.tint}`}>
                <img src={card.deco} alt="" className="ldg-stat-deco" />
                <div className="ldg-stat-inner">
                  <div className="ldg-stat-label">{card.label}</div>
                  <div className="ldg-stat-amount">{card.value}</div>
                  <div className="ldg-stat-sub">{card.sub}</div>
                </div>
              </article>
            ))}
          </div>

          <section className="ldg-debt-strategy-grid">
            {(['snowball', 'avalanche'] as const).map(strategy => {
              const result = strategy === 'snowball' ? snowball : avalanche;
              return (
                <button
                  key={strategy}
                  type="button"
                  className={`ldg-debt-strategy-card${activeStrategy === strategy ? ' is-active' : ''}`}
                  onClick={() => updatePlan({ strategy })}
                >
                  <span>{strategy === 'snowball' ? 'Snowball' : 'Avalanche'}</span>
                  <strong>{statusLabel(result, startMonth)}</strong>
                  <em>{fmt(result.totalInterest)} remaining interest · {result.months} months</em>
                  <small>{strategy === 'snowball' ? 'Smallest balance first' : 'Highest APR first'}</small>
                </button>
              );
            })}
          </section>

          {oneDebt && (
            <div className="ldg-debt-note">
              With only one debt, Snowball and Avalanche produce the same payoff order. The simulator still shows payoff date and interest impact.
            </div>
          )}
          {active.status === 'stalled' && (
            <div className="ldg-debt-note is-warning">
              Payments are not enough to reduce the balance after interest. Increase minimums or extra payment to create a payoff timeline.
            </div>
          )}

          <div className="ldg-debt-planner-grid">
            <section className="ldg-card ldg-debt-chart-card">
              <div className="ldg-card-hdr">
                <div>
                  <div className="ldg-card-title">Payoff timeline</div>
                  <div className="ldg-card-sub">Active strategy vs. comparison strategy</div>
                </div>
                <div className="ldg-rpt-legend">
                  <span><i style={{ background: '#7a9e7e' }} />{active.strategy}</span>
                  <span><i style={{ background: '#c4a35a' }} />{compare.strategy}</span>
                </div>
              </div>
              <TimelineChart active={active} compare={compare} color="#7a9e7e" />
            </section>

            <aside className="ldg-card ldg-debt-simulator-card">
              <div className="ldg-card-title">Simulator</div>
              <label className="ldg-goal-detail-field">
                Extra monthly payment
                <input type="number" min="0" value={simExtra} onChange={event => setSimExtra(Math.max(0, Number(event.target.value) || 0))} />
              </label>
              <input
                type="range"
                min="0"
                max="1000"
                step="25"
                value={simExtra}
                onChange={event => setSimExtra(Number(event.target.value))}
                className="debt-sim-slider"
              />
              <label className="ldg-goal-detail-field">
                Start month
                <input type="month" value={startMonth} onChange={event => updatePlan({ startMonth: event.target.value || currentMonth })} />
              </label>
              <button className="ldg-budget-primary-btn" onClick={() => updatePlan({ extraPayment: simExtra, startMonth })}>Apply plan</button>
              <div className="ldg-debt-sim-summary">
                <span>Total monthly debt effort</span>
                <strong>{fmt(totalMin + totalExtra + simExtra)}</strong>
              </div>
            </aside>
          </div>

          <div className="ldg-debt-planner-grid">
            <section className="ldg-card">
              <div className="ldg-card-hdr">
                <div>
                  <div className="ldg-card-title">Payoff order</div>
                  <div className="ldg-card-sub">The order balances are expected to clear.</div>
                </div>
              </div>
              <div className="ldg-debt-order-list">
                {active.payoffOrder.map((item, index) => (
                  <button
                    key={item.id}
                    className={`ldg-debt-order-row${selectedDebtId === item.id ? ' is-focused' : ''}`}
                    onClick={() => setSelectedDebtId(item.id)}
                  >
                    <span>{index + 1}</span>
                    <div>
                      <strong>{item.name}</strong>
                      <small>{item.apr.toFixed(2)}% APR · {fmt(item.minimumPayment)} min</small>
                    </div>
                    <em>{item.payoffDate ? fmtYM(item.payoffDate) : 'Needs review'}</em>
                  </button>
                ))}
              </div>
            </section>

            <section className="ldg-card">
              <div className="ldg-card-hdr">
                <div>
                  <div className="ldg-card-title">{selectedDebt ? 'Focused debt' : 'Your debts'}</div>
                  <div className="ldg-card-sub">{selectedDebt ? selectedDebt.name : 'Edit balances, APRs, and payments.'}</div>
                </div>
              </div>
              <div className="ldg-debt-list">
                {(selectedDebt ? [selectedDebt] : debts).map(debt => (
                  <article key={debt.id} className="ldg-debt-list-card">
                    <div className="ldg-long-icon" style={{ background: debt.bg, color: debt.color }}>{debt.icon}</div>
                    <div>
                      <strong>{debt.name}</strong>
                      <span>{fmt(debt.balance)} · {debt.apr.toFixed(2)}% APR · {fmt(debt.minimumPayment)} min</span>
                      {debt.notes ? <small>{debt.notes}</small> : null}
                    </div>
                    <div className="ldg-debt-list-actions">
                      <button onClick={() => { setEditDebt(debt); setShowDebtDialog(true); }}>Edit</button>
                      <button className="danger" onClick={() => handleDeleteDebt(debt)}>Delete</button>
                    </div>
                  </article>
                ))}
                {selectedDebt && <button className="ldg-budget-secondary-btn" onClick={() => setSelectedDebtId(null)}>Show all debts</button>}
              </div>
            </section>
          </div>
        </>
      )}

      {showDebtDialog && (
        <DebtDialog debt={editDebt} onClose={() => { setShowDebtDialog(false); setEditDebt(null); }} />
      )}
    </div>
  );
}
