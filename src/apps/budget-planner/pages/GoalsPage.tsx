import { useMemo, useState } from 'react';
import { PageIntroBanner } from '../components/PageIntroBanner';
import { useLedgerlyStore } from '../store/useLedgerlyStore';
import { fmt, addMonthsToYM, fmtYM, fmtYMFull } from '../utils/formatters';
import { simulateDebtPayoff, payoffDateLabel } from '../utils/debtSimulator';
import { GoalDialog } from '../dialogs/GoalDialog';
import { DebtDialog } from '../dialogs/DebtDialog';
import type { Debt, Goal, GoalKind } from '../types';
import flower01 from '../../../assets/budget-assets/flowers-and-leaves/flowers-and-leaves-01.png';
import flower03 from '../../../assets/budget-assets/flowers-and-leaves/flowers-and-leaves-03.png';
import flower05 from '../../../assets/budget-assets/flowers-and-leaves/flowers-and-leaves-05.png';
import sprig02 from '../../../assets/budget-assets/botanical-sprigs/botanical-sprigs-02.png';
import sprig03 from '../../../assets/budget-assets/botanical-sprigs/botanical-sprigs-03.png';
import heart02 from '../../../assets/budget-assets/hearts/heart-02.png';

const GOAL_KIND_LABELS: Record<GoalKind, string> = {
  emergency: 'Emergency fund',
  vacation: 'Vacation',
  purchase: 'Planned purchase',
  sinking: 'Sinking fund',
  other: 'Other goal',
};

const CARD_DECOS = [flower01, flower03, sprig02, flower05, sprig03];
const TINTS = ['ldg-stat-cream', 'ldg-stat-white', 'ldg-stat-blush', 'ldg-stat-white'];

function goalMonthsLeft(goal: Goal): number | null {
  const remaining = Math.max(0, goal.targetAmount - goal.savedAmount);
  if (remaining === 0) return 0;
  if (goal.monthlyContribution <= 0) return null;
  return Math.ceil(remaining / goal.monthlyContribution);
}

function goalProjection(goal: Goal, currentMonth: string) {
  const months = goalMonthsLeft(goal);
  if (months === null) return 'Add monthly contribution';
  if (months === 0) return 'Complete';
  return fmtYM(addMonthsToYM(currentMonth, months));
}

function GoalCard({ goal, index, currentMonth, onEdit, onDelete }: {
  goal: Goal;
  index: number;
  currentMonth: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const setView = useLedgerlyStore(s => s.setView);
  const setSelectedGoalId = useLedgerlyStore(s => s.setSelectedGoalId);
  const [menuOpen, setMenuOpen] = useState(false);
  const pct = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100)) : 0;
  const remaining = Math.max(0, goal.targetAmount - goal.savedAmount);
  const kind = GOAL_KIND_LABELS[goal.kind ?? 'other'];

  return (
    <article className={`ldg-stat-card ${TINTS[index % TINTS.length]} ldg-long-card`} onClick={() => { setSelectedGoalId(goal.id); setView('goal-detail'); }}>
      <img src={CARD_DECOS[index % CARD_DECOS.length]} alt="" className="ldg-long-card-deco" />
      <div className="ldg-long-card-top">
        <div className="ldg-long-icon" style={{ background: goal.bg || 'rgba(122,158,126,.15)', color: goal.color || '#4a7060' }}>{goal.icon}</div>
        <span className="ldg-long-kind">{kind}</span>
        <div className="ldg-long-menu-wrap" onClick={event => event.stopPropagation()}>
          <button className="ldg-goal-ctx-btn" style={{ position: 'static' }} onClick={() => setMenuOpen(open => !open)}>···</button>
          {menuOpen && (
            <div className="ldg-goal-ctx-menu" style={{ top: 28, right: 0 }}>
              <button className="ldg-goal-ctx-item" onClick={() => { onEdit(); setMenuOpen(false); }}>✏️ Edit</button>
              <button className="ldg-goal-ctx-item ldg-goal-ctx-delete" onClick={() => { onDelete(); setMenuOpen(false); }}>🗑️ Delete</button>
            </div>
          )}
        </div>
      </div>
      <h3 className="ldg-long-title">{goal.name}</h3>
      <p className="ldg-long-sub">{goal.description || 'Savings target'}</p>
      <div className="ldg-long-metric-row">
        <div><span>Saved</span><strong>{fmt(goal.savedAmount)}</strong></div>
        <div><span>Target</span><strong>{fmt(goal.targetAmount)}</strong></div>
        <div><span>Monthly</span><strong>{fmt(goal.monthlyContribution)}</strong></div>
      </div>
      <div className="ldg-long-progress">
        <div className="ldg-long-progress-fill" style={{ width: `${pct}%`, background: goal.color || '#7a9e7e' }} />
      </div>
      <div className="ldg-long-foot">
        <span>{pct}% complete · {fmt(remaining)} left</span>
        <strong>{goalProjection(goal, currentMonth)}</strong>
      </div>
    </article>
  );
}

function DebtCard({ debt, index, result, totalBalance, onEdit, onDelete }: {
  debt: Debt;
  index: number;
  result: ReturnType<typeof simulateDebtPayoff>;
  totalBalance: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const setView = useLedgerlyStore(s => s.setView);
  const setSelectedDebtId = useLedgerlyStore(s => s.setSelectedDebtId);
  const [menuOpen, setMenuOpen] = useState(false);
  const payoff = result.payoffOrder.find(item => item.id === debt.id);
  const share = totalBalance > 0 ? Math.round((debt.balance / totalBalance) * 100) : 0;
  const monthly = debt.minimumPayment + debt.extraPayment;

  return (
    <article className={`ldg-stat-card ${TINTS[(index + 1) % TINTS.length]} ldg-long-card ldg-long-debt`} onClick={() => { setSelectedDebtId(debt.id); setView('debt-planner'); }}>
      <img src={CARD_DECOS[(index + 2) % CARD_DECOS.length]} alt="" className="ldg-long-card-deco" />
      <div className="ldg-long-card-top">
        <div className="ldg-long-icon" style={{ background: debt.bg || 'rgba(196,138,138,.15)', color: debt.color || '#a05050' }}>{debt.icon}</div>
        <span className="ldg-long-kind">{debt.type}</span>
        <div className="ldg-long-menu-wrap" onClick={event => event.stopPropagation()}>
          <button className="ldg-goal-ctx-btn" style={{ position: 'static' }} onClick={() => setMenuOpen(open => !open)}>···</button>
          {menuOpen && (
            <div className="ldg-goal-ctx-menu" style={{ top: 28, right: 0 }}>
              <button className="ldg-goal-ctx-item" onClick={() => { onEdit(); setMenuOpen(false); }}>✏️ Edit</button>
              <button className="ldg-goal-ctx-item ldg-goal-ctx-delete" onClick={() => { onDelete(); setMenuOpen(false); }}>🗑️ Delete</button>
            </div>
          )}
        </div>
      </div>
      <h3 className="ldg-long-title">{debt.name}</h3>
      <p className="ldg-long-sub">{debt.institution || 'Manual debt'}{debt.accountNumber ? ` · ••••${debt.accountNumber}` : ''}</p>
      <div className="ldg-long-metric-row">
        <div><span>Balance</span><strong>{fmt(debt.balance)}</strong></div>
        <div><span>APR</span><strong>{debt.apr.toFixed(2)}%</strong></div>
        <div><span>Min / mo</span><strong>{fmt(debt.minimumPayment)}</strong></div>
      </div>
      <div className="ldg-long-progress">
        <div className="ldg-long-progress-fill" style={{ width: `${share}%`, background: debt.color || '#c48a8a' }} />
      </div>
      <div className="ldg-long-foot">
        <span>{fmt(monthly)} monthly · {share}% of debt</span>
        <strong>{payoff?.payoffDate ? fmtYM(payoff.payoffDate) : result.status === 'stalled' ? 'Needs payment' : 'Planning'}</strong>
      </div>
    </article>
  );
}

export function GoalsPage() {
  const goals = useLedgerlyStore(s => s.goals);
  const debts = useLedgerlyStore(s => s.debts);
  const income = useLedgerlyStore(s => s.income);
  const debtPlan = useLedgerlyStore(s => s.debtPlan);
  const deleteGoal = useLedgerlyStore(s => s.deleteGoal);
  const deleteDebt = useLedgerlyStore(s => s.deleteDebt);
  const setView = useLedgerlyStore(s => s.setView);
  const setSelectedDebtId = useLedgerlyStore(s => s.setSelectedDebtId);
  const currentMonth = useLedgerlyStore(s => s.currentMonth);
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [showDebtDialog, setShowDebtDialog] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);
  const [editDebt, setEditDebt] = useState<Debt | null>(null);

  const startMonth = debtPlan.startMonth || currentMonth;
  const debtResult = useMemo(
    () => simulateDebtPayoff(debts, debtPlan.strategy, debtPlan.extraPayment, startMonth),
    [debtPlan.extraPayment, debtPlan.strategy, debts, startMonth],
  );

  const totalSaved = goals.reduce((sum, goal) => sum + goal.savedAmount, 0);
  const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const monthlyGoalContrib = goals.reduce((sum, goal) => sum + goal.monthlyContribution, 0);
  const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
  const debtMinimums = debts.reduce((sum, debt) => sum + debt.minimumPayment + debt.extraPayment, 0);
  const monthlyPressure = monthlyGoalContrib + debtMinimums + debtPlan.extraPayment;
  const pressurePct = income > 0 ? Math.min(100, Math.round((monthlyPressure / income) * 100)) : 0;

  const handleDeleteGoal = (goal: Goal) => {
    if (confirm(`Delete "${goal.name}"?`)) deleteGoal(goal.id);
  };
  const handleDeleteDebt = (debt: Debt) => {
    if (confirm(`Delete "${debt.name}"?`)) deleteDebt(debt.id);
  };

  return (
    <div className="ldg-goals-page">
      <PageIntroBanner view="goals" />
      <div className="ldg-goals-header">
        <div>
          <div className="ldg-goals-title">Goals & Debt <img src={heart02} alt="" /></div>
          <div className="ldg-goals-subtitle">Long-term savings and payoff decisions in one shared cash plan.</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="ldg-month-chip">📅 {fmtYMFull(currentMonth)}</div>
          <button className="ldg-goals-add-btn" onClick={() => { setEditGoal(null); setShowGoalDialog(true); }}>+ Add goal</button>
          <button className="ldg-goals-add-btn ldg-goals-add-debt" onClick={() => { setEditDebt(null); setShowDebtDialog(true); }}>+ Add debt</button>
        </div>
      </div>

      <section className="ldg-long-hero">
        <img src={sprig02} alt="" className="ldg-long-hero-deco" />
        <div>
          <span className="ldg-budget-eyebrow">Long-term progress</span>
          <h2>Every future dollar has two jobs: build dreams and reduce drag.</h2>
          <p>Goals and debts compete for the same monthly cash, so Ledgerly keeps them together.</p>
        </div>
        <button
          type="button"
          className="ldg-budget-primary-btn"
          onClick={() => { setSelectedDebtId(null); setView('debt-planner'); }}
        >
          Open payoff planner →
        </button>
      </section>

      <div className="ldg-stat-row">
        {[
          { label: 'Saved toward goals', value: fmt(totalSaved), sub: `${goals.length} goal${goals.length !== 1 ? 's' : ''}`, deco: flower01, tint: 'ldg-stat-cream' },
          { label: 'Goal targets', value: fmt(totalTarget), sub: totalTarget > 0 ? `${Math.round((totalSaved / totalTarget) * 100)}% funded` : 'No targets yet', deco: flower03, tint: 'ldg-stat-white' },
          { label: 'Debt balance', value: fmt(totalDebt), sub: `${debts.length} debt${debts.length !== 1 ? 's' : ''}`, deco: flower05, tint: 'ldg-stat-blush' },
          { label: 'Monthly commitment', value: fmt(monthlyPressure), sub: income > 0 ? `${pressurePct}% of monthly income` : 'Goals + debt payments', deco: sprig03, tint: 'ldg-stat-white' },
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

      <div className="ldg-long-two-col">
        <section>
          <div className="ldg-goals-section-hdr">
            <div>
              <div className="ldg-goals-section-title">Savings goals</div>
              <div className="ldg-long-section-sub">Emergency funds, vacations, planned purchases, and sinking funds.</div>
            </div>
            <button className="ldg-goals-add-btn" onClick={() => { setEditGoal(null); setShowGoalDialog(true); }}>+ Add goal</button>
          </div>
          {goals.length === 0 ? (
            <div className="ldg-long-empty">No goals yet. Add your first savings target.</div>
          ) : (
            <div className="ldg-long-card-grid">
              {goals.map((goal, index) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  index={index}
                  currentMonth={currentMonth}
                  onEdit={() => { setEditGoal(goal); setShowGoalDialog(true); }}
                  onDelete={() => handleDeleteGoal(goal)}
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="ldg-goals-section-hdr">
            <div>
              <div className="ldg-goals-section-title">Debt payoff</div>
              <div className="ldg-long-section-sub">Balances, APRs, minimums, and payoff status.</div>
            </div>
            <button className="ldg-goals-add-btn ldg-goals-add-debt" onClick={() => { setEditDebt(null); setShowDebtDialog(true); }}>+ Add debt</button>
          </div>
          {debts.length === 0 ? (
            <div className="ldg-long-empty">No debts yet. Add one to compare payoff strategies.</div>
          ) : (
            <div className="ldg-long-card-grid">
              {debts.map((debt, index) => (
                <DebtCard
                  key={debt.id}
                  debt={debt}
                  index={index}
                  result={debtResult}
                  totalBalance={totalDebt}
                  onEdit={() => { setEditDebt(debt); setShowDebtDialog(true); }}
                  onDelete={() => handleDeleteDebt(debt)}
                />
              ))}
            </div>
          )}
          {debts.length > 0 && (
            <button className="ldg-long-planner-card" onClick={() => { setSelectedDebtId(null); setView('debt-planner'); }}>
              <span>
                {debtPlan.strategy === 'snowball' ? 'Snowball' : 'Avalanche'} plan · debt-free {debtResult.status === 'complete' ? payoffDateLabel(debtResult.months, startMonth) : 'needs review'}
              </span>
              <strong>Open planner →</strong>
            </button>
          )}
        </section>
      </div>

      {showGoalDialog && (
        <GoalDialog goal={editGoal} onClose={() => { setShowGoalDialog(false); setEditGoal(null); }} />
      )}
      {showDebtDialog && (
        <DebtDialog debt={editDebt} onClose={() => { setShowDebtDialog(false); setEditDebt(null); }} />
      )}
    </div>
  );
}
