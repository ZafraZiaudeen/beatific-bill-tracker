import { useState } from 'react';
import { useLedgerlyStore } from '../store/useLedgerlyStore';
import { fmt, addMonthsToYM, fmtYM, fmtYMFull } from '../utils/formatters';
import { GoalDialog } from '../dialogs/GoalDialog';
import { ContribDialog } from '../dialogs/ContribDialog';
import type { GoalKind } from '../types';
import heart01 from '../../../assets/budget-assets/hearts/heart-01.png';
import flower01 from '../../../assets/budget-assets/flowers-and-leaves/flowers-and-leaves-01.png';
import flower03 from '../../../assets/budget-assets/flowers-and-leaves/flowers-and-leaves-03.png';
import sprig02 from '../../../assets/budget-assets/botanical-sprigs/botanical-sprigs-02.png';
import stationery05 from '../../../assets/budget-assets/stationery-accents/stationery-accents-05.png';

const GOAL_KIND_LABELS: Record<GoalKind, string> = {
  emergency: 'Emergency fund',
  vacation: 'Vacation',
  purchase: 'Planned purchase',
  sinking: 'Sinking fund',
  other: 'Other goal',
};

function monthDiff(fromYM: string, toYM: string) {
  const [fy, fm] = fromYM.split('-').map(Number);
  const [ty, tm] = toYM.split('-').map(Number);
  return (ty - fy) * 12 + (tm - fm);
}

function projection(goal: { savedAmount: number; targetAmount: number; monthlyContribution: number; targetDate: string }, currentMonth: string) {
  const remaining = Math.max(0, goal.targetAmount - goal.savedAmount);
  const pct = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100)) : 0;
  const months = remaining === 0 ? 0 : goal.monthlyContribution > 0 ? Math.ceil(remaining / goal.monthlyContribution) : null;
  const projectedMonth = months === null ? null : addMonthsToYM(currentMonth, months);
  const targetMonths = goal.targetDate ? monthDiff(currentMonth, goal.targetDate) : null;
  const state =
    remaining === 0 ? 'complete' :
    goal.monthlyContribution <= 0 ? 'no-contribution' :
    targetMonths !== null && targetMonths < 0 ? 'past-target' :
    projectedMonth && goal.targetDate && projectedMonth > goal.targetDate ? 'behind-target' :
    'on-track';
  return { remaining, pct, months, projectedMonth, targetMonths, state };
}

function ProjectionChart({
  saved,
  target,
  monthly,
  currentMonth,
  color,
}: {
  saved: number;
  target: number;
  monthly: number;
  currentMonth: string;
  color: string;
}) {
  const W = 620, H = 220, padL = 58, padR = 22, padT = 18, padB = 40;
  const totalMonths = Math.min(36, Math.max(6, monthly > 0 ? Math.ceil(Math.max(0, target - saved) / monthly) + 2 : 12));
  const maxVal = Math.max(target, saved, 1);
  const points = Array.from({ length: totalMonths + 1 }, (_, month) => {
    const value = Math.min(maxVal, saved + monthly * month);
    const x = padL + (month / totalMonths) * (W - padL - padR);
    const y = padT + (1 - value / maxVal) * (H - padT - padB);
    return { x, y, value, month };
  });
  const line = points.map(point => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' ');
  const area = `${points[0].x},${H - padB} ${line} ${points[points.length - 1].x},${H - padB}`;
  const ticks = [0, Math.floor(totalMonths / 2), totalMonths];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id="goal-detail-projection" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".22" />
          <stop offset="100%" stopColor={color} stopOpacity=".02" />
        </linearGradient>
      </defs>
      {[0, maxVal / 2, maxVal].map(value => {
        const y = padT + (1 - value / maxVal) * (H - padT - padB);
        return (
          <g key={value}>
            <line x1={padL} x2={W - padR} y1={y} y2={y} stroke="rgba(180,195,180,.35)" />
            <text x={padL - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#8a9e8b">{fmt(value)}</text>
          </g>
        );
      })}
      <polygon points={area} fill="url(#goal-detail-projection)" />
      <polyline points={line} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {points.filter((_, index) => index === 0 || index === points.length - 1).map(point => (
        <circle key={point.month} cx={point.x} cy={point.y} r="5" fill={color} stroke="#fff" strokeWidth="2" />
      ))}
      {ticks.map(month => {
        const x = padL + (month / totalMonths) * (W - padL - padR);
        return <text key={month} x={x} y={H - 10} textAnchor="middle" fontSize="10" fill="#8a9e8b">{fmtYM(addMonthsToYM(currentMonth, month))}</text>;
      })}
    </svg>
  );
}

export function GoalDetailPage() {
  const goals = useLedgerlyStore(s => s.goals);
  const selectedGoalId = useLedgerlyStore(s => s.selectedGoalId);
  const setView = useLedgerlyStore(s => s.setView);
  const deleteGoal = useLedgerlyStore(s => s.deleteGoal);
  const updateGoal = useLedgerlyStore(s => s.updateGoal);
  const currentMonth = useLedgerlyStore(s => s.currentMonth);
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [showContribDialog, setShowContribDialog] = useState(false);
  const goal = goals.find(item => item.id === selectedGoalId);
  const [draft, setDraft] = useState(() => ({
    targetAmount: goal?.targetAmount ?? 0,
    monthlyContribution: goal?.monthlyContribution ?? 0,
    targetDate: goal?.targetDate ?? currentMonth,
  }));

  if (!goal) {
    return (
      <div className="ldg-goal-detail-page">
        <button className="ldg-budget-secondary-btn" onClick={() => setView('goals')}>← Back to Goals & Debt</button>
        <div className="ldg-long-empty">Select a goal to view its detail workflow.</div>
      </div>
    );
  }

  const preview = {
    ...goal,
    targetAmount: draft.targetAmount,
    monthlyContribution: draft.monthlyContribution,
    targetDate: draft.targetDate,
  };
  const proj = projection(preview, currentMonth);
  const kindLabel = GOAL_KIND_LABELS[goal.kind ?? 'other'];
  const statusText: Record<typeof proj.state, string> = {
    complete: 'This goal is fully funded.',
    'no-contribution': 'Add a monthly contribution to project completion.',
    'past-target': 'The target date has passed. Update the date or contribution.',
    'behind-target': 'Projection lands after the target date.',
    'on-track': 'Projection is on track for the target date.',
  };

  const updateDraft = (patch: Partial<typeof draft>) => {
    const next = { ...draft, ...patch };
    setDraft(next);
    updateGoal(goal.id, next);
  };

  const handleDelete = () => {
    if (confirm(`Delete "${goal.name}"? This cannot be undone.`)) deleteGoal(goal.id);
  };

  return (
    <div className="ldg-goal-detail-page">
      <div className="ldg-goal-detail-header">
        <div>
          <button className="ldg-goal-detail-back" onClick={() => setView('goals')}>← Goals & Debt</button>
          <h1>{goal.name} <img src={heart01} alt="" /></h1>
          <p>{goal.description || `${kindLabel} progress and contribution planning.`}</p>
        </div>
        <div className="ldg-goal-detail-actions">
          <span className="ldg-budget-method-pill">{kindLabel}</span>
          <button className="ldg-budget-secondary-btn" onClick={() => setShowGoalDialog(true)}>Edit goal</button>
          <button className="ldg-budget-primary-btn" onClick={() => setShowContribDialog(true)}>Add contribution</button>
        </div>
      </div>

      <section className="ldg-goal-detail-hero">
        <img src={stationery05} alt="" className="ldg-budget-hero-deco" />
        <div className="ldg-goal-detail-icon" style={{ background: goal.bg, color: goal.color }}>{goal.icon}</div>
        <div className="ldg-goal-detail-hero-copy">
          <span className="ldg-budget-eyebrow">{statusText[proj.state]}</span>
          <h2>{proj.projectedMonth ? `Projected completion: ${fmtYM(proj.projectedMonth)}` : 'Projection needs a contribution'}</h2>
          <p>{fmt(proj.remaining)} remaining toward {fmt(preview.targetAmount)}.</p>
          <div className="ldg-goal-detail-progress">
            <div style={{ width: `${proj.pct}%`, background: goal.color }} />
          </div>
        </div>
      </section>

      <div className="ldg-stat-row">
        {[
          { label: 'Saved amount', value: fmt(goal.savedAmount), sub: `${proj.pct}% complete`, deco: flower01, tint: 'ldg-stat-cream' },
          { label: 'Target amount', value: fmt(preview.targetAmount), sub: `${fmt(proj.remaining)} left`, deco: sprig02, tint: 'ldg-stat-white' },
          { label: 'Monthly contribution', value: fmt(preview.monthlyContribution), sub: proj.months === null ? 'Set contribution' : `${proj.months} months projected`, deco: flower03, tint: 'ldg-stat-blush' },
          { label: 'Target date', value: preview.targetDate ? fmtYMFull(preview.targetDate) : 'Not set', sub: statusText[proj.state], deco: heart01, tint: 'ldg-stat-white' },
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

      <div className="ldg-goal-detail-grid">
        <section className="ldg-card ldg-goal-detail-chart-card">
          <div className="ldg-card-hdr">
            <div>
              <div className="ldg-card-title">Projection</div>
              <div className="ldg-card-sub">Updates immediately as you edit the plan.</div>
            </div>
          </div>
          <ProjectionChart
            saved={goal.savedAmount}
            target={preview.targetAmount}
            monthly={preview.monthlyContribution}
            currentMonth={currentMonth}
            color={goal.color || '#7a9e7e'}
          />
        </section>

        <section className="ldg-card ldg-goal-detail-edit-card">
          <div className="ldg-card-title">Adjust the plan</div>
          <label className="ldg-goal-detail-field">
            Target amount
            <input type="number" min="0" value={draft.targetAmount} onChange={event => updateDraft({ targetAmount: Math.max(0, Number(event.target.value) || 0) })} />
          </label>
          <label className="ldg-goal-detail-field">
            Monthly contribution
            <input type="number" min="0" value={draft.monthlyContribution} onChange={event => updateDraft({ monthlyContribution: Math.max(0, Number(event.target.value) || 0) })} />
          </label>
          <label className="ldg-goal-detail-field">
            Target date
            <input type="month" value={draft.targetDate} onChange={event => updateDraft({ targetDate: event.target.value || currentMonth })} />
          </label>
          <button className="ldg-sec-btn ldg-sec-btn-danger" onClick={handleDelete}>Delete goal</button>
        </section>
      </div>

      <section className="ldg-card ldg-goal-detail-history">
        <div className="ldg-card-hdr">
          <div>
            <div className="ldg-card-title">Contribution history</div>
            <div className="ldg-card-sub">{goal.contributions.length} contribution{goal.contributions.length !== 1 ? 's' : ''}</div>
          </div>
          <button className="ldg-goals-add-btn" onClick={() => setShowContribDialog(true)}>+ Add contribution</button>
        </div>
        {goal.contributions.length === 0 ? (
          <div className="ldg-long-empty">No contributions yet. Add one to start tracking progress.</div>
        ) : (
          <div className="ldg-goal-history-list">
            {goal.contributions.map(contribution => (
              <div key={contribution.id} className="ldg-goal-history-row">
                <span>{new Date(`${contribution.date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <strong>+{fmt(contribution.amount)}</strong>
                <em>{contribution.source}</em>
              </div>
            ))}
          </div>
        )}
      </section>

      {showGoalDialog && <GoalDialog goal={goal} onClose={() => setShowGoalDialog(false)} />}
      {showContribDialog && <ContribDialog goalId={goal.id} onClose={() => setShowContribDialog(false)} />}
    </div>
  );
}
