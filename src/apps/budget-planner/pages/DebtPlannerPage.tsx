import { useMemo, useState } from 'react';
import { useLedgerlyStore } from '../store/useLedgerlyStore';
import { fmt, fmtYM, fmtYMFull } from '../utils/formatters';
import { DebtEditorDialog as DebtDialog } from '../dialogs/DebtEditorDialog';
import { DebtPaymentDialog } from '../dialogs/DebtPaymentDialog';
import { payoffDateLabel, simulateDebtPayoff, type SimResult } from '../utils/debtSimulator';
import type { Debt, DebtPayment } from '../types';
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
  const debtPayments = useLedgerlyStore(s => s.debtPayments);
  const debtPlan = useLedgerlyStore(s => s.debtPlan);
  const setView = useLedgerlyStore(s => s.setView);
  const setDebtPlan = useLedgerlyStore(s => s.setDebtPlan);
  const deleteDebt = useLedgerlyStore(s => s.deleteDebt);
  const removeDebtPayment = useLedgerlyStore(s => s.removeDebtPayment);
  const selectedDebtId = useLedgerlyStore(s => s.selectedDebtId);
  const setSelectedDebtId = useLedgerlyStore(s => s.setSelectedDebtId);
  const currentMonth = useLedgerlyStore(s => s.currentMonth);
  const [showDebtDialog, setShowDebtDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [editDebt, setEditDebt] = useState<Debt | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  const [startMonth, setStartMonth] = useState(debtPlan.startMonth || currentMonth);
  const [simExtra, setSimExtra] = useState(debtPlan.extraPayment);
  const [activeStrategy, setActiveStrategy] = useState(debtPlan.strategy);
  const snowball = useMemo(() => simulateDebtPayoff(debts, 'snowball', simExtra, startMonth), [debts, simExtra, startMonth]);
  const avalanche = useMemo(() => simulateDebtPayoff(debts, 'avalanche', simExtra, startMonth), [debts, simExtra, startMonth]);
  const active = activeStrategy === 'snowball' ? snowball : avalanche;
  const compare = activeStrategy === 'snowball' ? avalanche : snowball;
  const oneDebt = debts.filter(debt => debt.balance > 0).length === 1;
  const totalBalance = debts.reduce((sum, debt) => sum + debt.balance, 0);
  const totalMin = debts.filter(debt => debt.balance > 0).reduce((sum, debt) => sum + debt.minimumPayment, 0);
  const totalExtra = debts.filter(debt => debt.balance > 0).reduce((sum, debt) => sum + debt.extraPayment, 0);
  const selectedDebt = debts.find(debt => debt.id === selectedDebtId) ?? null;
  const selectedPayoff = selectedDebt ? active.payoffOrder.find(item => item.id === selectedDebt.id) : null;
  const selectedPayments = selectedDebt
    ? debtPayments.filter(payment => payment.debtId === selectedDebt.id).sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
    : [];
  const interestDifference = Math.abs(snowball.totalInterest - avalanche.totalInterest);
  const lowerInterestStrategy = snowball.totalInterest === avalanche.totalInterest
    ? 'Same cost'
    : avalanche.totalInterest < snowball.totalInterest ? 'Avalanche' : 'Snowball';
  const planDirty = activeStrategy !== debtPlan.strategy || simExtra !== debtPlan.extraPayment || startMonth !== (debtPlan.startMonth || currentMonth);

  const savePlan = () => {
    setDebtPlan({ strategy: activeStrategy, extraPayment: simExtra, startMonth });
    setStatusMessage('Payoff plan saved. This updates forecasts only; record actual payments on a debt.');
  };

  const handleDeleteDebt = (debt: Debt) => {
    const paymentCount = debtPayments.filter(payment => payment.debtId === debt.id).length;
    const detail = paymentCount ? ` Its ${paymentCount} debt payment record${paymentCount === 1 ? '' : 's'} will be removed; generated transactions will remain in the ledger.` : '';
    if (confirm(`Delete "${debt.name}"?${detail}`)) {
      deleteDebt(debt.id);
      setStatusMessage(`${debt.name} was deleted.`);
    }
  };

  const handlePaymentSaved = (payment: DebtPayment) => {
    const remaining = Math.max(0, (selectedDebt?.balance ?? 0) - payment.amount);
    setStatusMessage(`${fmt(payment.amount)} payment recorded for ${selectedDebt?.name ?? 'debt'}. Remaining balance: ${fmt(remaining)}.`);
  };

  const handleRemovePayment = (payment: DebtPayment) => {
    if (!confirm(`Remove the ${fmt(payment.amount)} payment from ${payment.date}? The debt and linked account balances will be restored.`)) return;
    try {
      if (!removeDebtPayment(payment.id)) throw new Error('This payment is no longer available.');
      setStatusMessage(`${fmt(payment.amount)} payment removed and balances restored.`);
    } catch (reason) {
      setStatusMessage(reason instanceof Error ? reason.message : 'Payment could not be removed.');
    }
  };

  return (
    <div className="ldg-debt-planner-page">
      <div className="ldg-debt-planner-header">
        <div>
          <button className="ldg-goal-detail-back" onClick={() => setView('goals')}>← Goals &amp; Debt</button>
          <h1>{selectedDebt ? selectedDebt.name : 'Debt payoff planner'} <img src={heart01} alt="" /></h1>
          <p>{selectedDebt ? 'Record real payments, review progress, and see how this debt fits the saved payoff plan.' : 'Compare payoff strategies, then record real payments against each debt.'}</p>
        </div>
        <div className="ldg-goal-detail-actions">
          <span className="ldg-budget-method-pill">{fmtYMFull(startMonth)}</span>
          {selectedDebt ? (
            <>
              <button className="ldg-budget-secondary-btn" onClick={() => setSelectedDebtId(null)}>Show all debts</button>
              <button className="ldg-budget-secondary-btn" onClick={() => { setEditDebt(selectedDebt); setShowDebtDialog(true); }}>Edit debt</button>
              <button className="ldg-budget-primary-btn" disabled={selectedDebt.balance <= 0} onClick={() => setShowPaymentDialog(true)}>{selectedDebt.balance <= 0 ? 'Paid off' : 'Record payment'}</button>
            </>
          ) : (
            <button className="ldg-goals-add-btn ldg-goals-add-debt" onClick={() => { setEditDebt(null); setShowDebtDialog(true); }}>+ Add debt</button>
          )}
        </div>
      </div>

      {statusMessage && <div className="ldg-bills-save-message" role="status" aria-live="polite">✓ {statusMessage}</div>}

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
          {selectedDebt && (
            <section className="ldg-card ldg-debt-focus-card">
              <div className="ldg-debt-focus-summary">
                <div className="ldg-long-icon" style={{ background: selectedDebt.bg, color: selectedDebt.color }}>{selectedDebt.icon}</div>
                <div>
                  <span className={`ldg-debt-state${selectedDebt.balance <= 0 ? ' is-paid' : ''}`}>{selectedDebt.balance <= 0 ? 'Paid off' : 'In progress'}</span>
                  <h2>{selectedDebt.name}</h2>
                  <p>{selectedDebt.institution || 'Manual debt'}{selectedDebt.accountNumber ? ` · ••••${selectedDebt.accountNumber}` : ''}</p>
                </div>
                <button className="ldg-sec-btn ldg-sec-btn-danger" onClick={() => handleDeleteDebt(selectedDebt)}>Delete debt</button>
              </div>
              <div className="ldg-debt-focus-metrics">
                <div><span>Current balance</span><strong>{fmt(selectedDebt.balance)}</strong></div>
                <div><span>APR</span><strong>{selectedDebt.apr.toFixed(2)}%</strong></div>
                <div><span>Monthly commitment</span><strong>{fmt(selectedDebt.minimumPayment + selectedDebt.extraPayment)}</strong><small>{fmt(selectedDebt.minimumPayment)} minimum + {fmt(selectedDebt.extraPayment)} planned extra</small></div>
                <div><span>Projected payoff</span><strong>{selectedDebt.balance <= 0 ? 'Paid off' : selectedPayoff?.payoffDate ? fmtYM(selectedPayoff.payoffDate) : 'Needs review'}</strong><small>Using the {activeStrategy} forecast</small></div>
              </div>
              <div className="ldg-debt-payment-history">
                <div className="ldg-card-hdr">
                  <div><div className="ldg-card-title">Payment history</div><div className="ldg-card-sub">{selectedPayments.length} recorded payment{selectedPayments.length === 1 ? '' : 's'}</div></div>
                  {selectedDebt.balance > 0 && <button className="ldg-goals-add-btn" onClick={() => setShowPaymentDialog(true)}>+ Record payment</button>}
                </div>
                {selectedPayments.length === 0 ? <div className="ldg-long-empty">No payments recorded yet. Use Record payment to reduce this balance.</div> : (
                  <div className="ldg-debt-payment-list">
                    {selectedPayments.map(payment => (
                      <div key={payment.id} className="ldg-debt-payment-row">
                        <span>{new Date(`${payment.date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <strong>−{fmt(payment.amount)}</strong>
                        <em>{payment.account || 'Unlinked'}{payment.notes ? ` · ${payment.notes}` : ''}</em>
                        <button onClick={() => handleRemovePayment(payment)}>Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          <div className="ldg-stat-row">
            {[
              { label: 'Total balance', value: fmt(totalBalance), sub: `Across ${debts.length} debt${debts.length !== 1 ? 's' : ''}`, deco: flower05, tint: 'ldg-stat-blush' },
              { label: 'Minimum payments', value: fmt(totalMin), sub: 'Per month', deco: flower03, tint: 'ldg-stat-white' },
              { label: 'Estimated payoff', value: statusLabel(active, startMonth), sub: `${active.months} months · ${activeStrategy}`, deco: sprig03, tint: 'ldg-stat-cream' },
              { label: oneDebt ? 'One debt plan' : 'Lower-interest option', value: oneDebt ? 'Same order' : lowerInterestStrategy, sub: oneDebt || interestDifference === 0 ? 'Snowball and avalanche match' : `${fmt(interestDifference)} less projected interest`, deco: heart01, tint: 'ldg-stat-white' },
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
                  aria-pressed={activeStrategy === strategy}
                  onClick={() => { setActiveStrategy(strategy); setStatusMessage(''); }}
                >
                  <span>{strategy === 'snowball' ? 'Snowball' : 'Avalanche'}</span>
                  <strong>{statusLabel(result, startMonth)}</strong>
                  <em>{fmt(result.totalInterest)} projected interest · {result.months} months</em>
                  <small>{strategy === 'snowball'
                    ? 'Put extra money toward the smallest balance first for quicker early wins.'
                    : 'Put extra money toward the highest APR first, usually minimizing total interest.'}</small>
                </button>
              );
            })}
          </section>

          <div className="ldg-debt-note">
            <strong>Planning only:</strong> Snowball and Avalanche change the forecast and payoff order. They do not record payments or change any real balance.
          </div>

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
              <div className="ldg-card-title">Payoff forecast</div>
              <label className="ldg-goal-detail-field">
                Additional strategy amount / month
                <input type="number" min="0" value={simExtra} onChange={event => { setSimExtra(Math.max(0, Number(event.target.value) || 0)); setStatusMessage(''); }} />
                <small>Forecast only. This extra amount goes to the strategy’s priority debt.</small>
              </label>
              <input
                type="range"
                min="0"
                max="1000"
                step="25"
                value={simExtra}
                onChange={event => { setSimExtra(Number(event.target.value)); setStatusMessage(''); }}
                className="debt-sim-slider"
              />
              <label className="ldg-goal-detail-field">
                Start month
                <input type="month" value={startMonth} onChange={event => { setStartMonth(event.target.value || currentMonth); setStatusMessage(''); }} />
              </label>
              <button className="ldg-budget-primary-btn" onClick={savePlan} disabled={!planDirty}>Save payoff plan</button>
              <small className="ldg-debt-forecast-help">{planDirty ? 'You have unsaved forecast changes.' : 'Saved. Record actual payments from a debt’s detail view.'}</small>
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
                  <div className="ldg-card-title">Your debts</div>
                  <div className="ldg-card-sub">Open a debt to record payments or review its history.</div>
                </div>
              </div>
              <div className="ldg-debt-list">
                {debts.map(debt => (
                  <article key={debt.id} className={`ldg-debt-list-card${selectedDebt?.id === debt.id ? ' is-focused' : ''}`}>
                    <div className="ldg-long-icon" style={{ background: debt.bg, color: debt.color }}>{debt.icon}</div>
                    <div>
                      <strong>{debt.name}</strong>
                      <span>{debt.balance <= 0 ? 'Paid off' : `${fmt(debt.balance)} · ${debt.apr.toFixed(2)}% APR · ${fmt(debt.minimumPayment)} min`}</span>
                      {debt.notes ? <small>{debt.notes}</small> : null}
                    </div>
                    <div className="ldg-debt-list-actions">
                      <button onClick={() => setSelectedDebtId(debt.id)}>Open</button>
                      <button onClick={() => { setEditDebt(debt); setShowDebtDialog(true); }}>Edit</button>
                      <button className="danger" onClick={() => handleDeleteDebt(debt)}>Delete</button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </>
      )}

      {showDebtDialog && (
        <DebtDialog
          debt={editDebt}
          onSaved={saved => {
            setSelectedDebtId(saved.id);
            setStatusMessage(`${saved.name} was saved successfully.`);
          }}
          onClose={() => { setShowDebtDialog(false); setEditDebt(null); }}
        />
      )}
      {showPaymentDialog && selectedDebt && (
        <DebtPaymentDialog debt={selectedDebt} onSaved={handlePaymentSaved} onClose={() => setShowPaymentDialog(false)} />
      )}
    </div>
  );
}
