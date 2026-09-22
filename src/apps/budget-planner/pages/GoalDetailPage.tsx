import { useState } from 'react';
import { useLedgerlyStore } from '../store/useLedgerlyStore';
import { fmt, addMonthsToYM, fmtYM, fmtYMFull } from '../utils/formatters';
import { GoalDialog } from '../dialogs/GoalDialog';
import { ContribDialog } from '../dialogs/ContribDialog';
import type { Goal } from '../types';

const C = {
  bg: '#f5f4f0', surface: '#fff', border: '#e5e2db', accent: '#22c55e',
  text: '#1a1a1a', text2: '#6b7280', shadow: '0 1px 3px rgba(0,0,0,.08)',
};

function progressRingSvg(pct: number, size: number, sw: number, color: string): string {
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.max(0, Math.min(1, pct / 100)));
  const cx = size / 2, cy = size / 2;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="display:block">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#e5e2db" stroke-width="${sw}"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${sw}"
      stroke-dasharray="${circ}" stroke-dashoffset="${offset}"
      stroke-linecap="round" transform="rotate(-90 ${cx} ${cy})"/>
    <text x="${cx}" y="${cy - 4}" text-anchor="middle" font-size="22" font-weight="700" fill="${C.text}">${Math.round(pct)}%</text>
    <text x="${cx}" y="${cy + 16}" text-anchor="middle" font-size="12" fill="${C.text2}">complete</text>
  </svg>`;
}

function ProjectionChart({ goal }: { goal: Goal }) {
  const W = 320, H = 130, padL = 42, padR = 16, padT = 10, padB = 30;
  const monthsLeft = goal.targetAmount / Math.max(1, goal.monthlyContribution);
  const totalMonths = Math.min(Math.ceil(monthsLeft + 3), 24);
  const points: { x: number; y: number }[] = [];
  let saved = goal.savedAmount;
  for (let i = 0; i <= totalMonths; i++) {
    const xPct = i / totalMonths;
    const yPct = Math.min(1, saved / goal.targetAmount);
    points.push({ x: padL + xPct * (W - padL - padR), y: padT + (1 - yPct) * (H - padT - padB) });
    saved += goal.monthlyContribution;
  }
  const polyline = points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const area = `${points[0].x},${(H - padB).toFixed(1)} ` + polyline + ` ${points[points.length - 1].x},${(H - padB).toFixed(1)}`;
  const targetY = padT;
  // x-axis labels
  const labelMonths = [0, Math.floor(totalMonths / 3), Math.floor((2 * totalMonths) / 3), totalMonths];
  const yLabels = [0, Math.floor(goal.targetAmount / 2), goal.targetAmount];

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', width: '100%' }}>
      <defs>
        <linearGradient id={`pg${goal.id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={goal.color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={goal.color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* Target line */}
      <line x1={padL} y1={targetY} x2={W - padR} y2={targetY} stroke="#22c55e" strokeWidth="1.5" strokeDasharray="5,4" />
      {/* Area */}
      <polygon points={area} fill={`url(#pg${goal.id})`} />
      {/* Line */}
      <polyline points={polyline} fill="none" stroke={goal.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Y-axis labels */}
      {yLabels.map(v => {
        const yy = padT + (1 - v / goal.targetAmount) * (H - padT - padB);
        return <text key={v} x={padL - 4} y={yy + 4} textAnchor="end" fontSize="9" fill={C.text2}>{fmt(v)}</text>;
      })}
      {/* X-axis labels */}
      {labelMonths.map(m => {
        const xPct = m / totalMonths;
        const xx = padL + xPct * (W - padL - padR);
        const ym = addMonthsToYM('2026-09', m);
        return <text key={m} x={xx} y={H - 4} textAnchor="middle" fontSize="9" fill={C.text2}>{fmtYM(ym)}</text>;
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

  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [showContribDialog, setShowContribDialog] = useState(false);

  const goal = goals.find(g => g.id === selectedGoalId);
  if (!goal) return null;

  const pct = Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100));
  const remaining = Math.max(0, goal.targetAmount - goal.savedAmount);
  const months = goal.monthlyContribution > 0 ? Math.ceil(remaining / goal.monthlyContribution) : null;
  const progressBarPct = (goal.savedAmount / goal.targetAmount) * 100;

  const handleDelete = () => {
    if (confirm(`Delete "${goal.name}"? This cannot be undone.`)) {
      deleteGoal(goal.id);
    }
  };

  return (
    <div style={{ padding: '28px 36px' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <button
          onClick={() => setView('goals')}
          style={{ color: C.accent, fontWeight: 600, fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          Goals & Debt
        </button>
        <span style={{ color: C.text2, fontSize: 13 }}>/ {goal.name}</span>
      </div>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: C.text, marginBottom: 24 }}>Goal detail</h1>

      {/* Main card */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '28px 28px', marginBottom: 20, boxShadow: C.shadow }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: goal.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>{goal.icon}</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.text }}>{goal.name}</div>
            <div style={{ fontSize: 13, color: C.text2, marginTop: 2 }}>{goal.description}</div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.text2, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Saved</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>{fmt(goal.savedAmount)}</div>
            <div style={{ fontSize: 12, color: C.text2 }}>of {fmt(goal.targetAmount)}</div>
            <div style={{ marginTop: 8, height: 6, background: '#e5e2db', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progressBarPct}%`, background: goal.color, borderRadius: 3, transition: 'width .3s' }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.text2, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Progress</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>{pct}%</div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.text2, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Target Date</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.text, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>📅</span> {fmtYMFull(goal.targetDate)}
            </div>
            <div style={{ fontSize: 12, color: C.text2 }}>
              {months !== null ? `${months} months left` : '—'}
            </div>
          </div>
        </div>

        {/* Progress ring */}
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 8 }}
          dangerouslySetInnerHTML={{ __html: progressRingSvg(pct, 140, 12, goal.color) }}
        />
      </div>

      {/* Insight */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '20px 24px', marginBottom: 20, boxShadow: C.shadow }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>💡 Insight</span>
          <span style={{ color: C.text2, fontSize: 13 }}>→</span>
        </div>
        {months !== null ? (
          <>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>
              At this pace you'll reach your goal in{' '}
              <span style={{ color: goal.color }}>{months} months.</span>
            </div>
            <div style={{ fontSize: 13, color: C.text2, marginTop: 4 }}>
              You're currently saving {fmt(goal.monthlyContribution)} per month. Keep it up!
            </div>
          </>
        ) : (
          <div style={{ fontSize: 15, color: C.text2 }}>Set a monthly contribution to see your projection.</div>
        )}
        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <button
            onClick={() => setShowContribDialog(true)}
            style={{ flex: 1, background: C.accent, color: '#fff', border: 'none', borderRadius: 10, padding: '12px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
          >
            Add contribution
          </button>
          <button
            onClick={() => setShowGoalDialog(true)}
            style={{ flex: 1, background: '#fff', color: C.text, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 0', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
          >
            ✏️ Edit goal
          </button>
        </div>
      </div>

      {/* Bottom 2-col: history + projection */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        {/* Contribution history */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '20px', boxShadow: C.shadow }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: C.text }}>🕐 Contribution history</span>
            <span style={{ fontSize: 12, color: C.accent, fontWeight: 600, cursor: 'pointer' }}>View all →</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['DATE', 'AMOUNT', 'SOURCE'].map(h => (
                  <th key={h} style={{ textAlign: 'left', fontSize: 10, fontWeight: 700, color: C.text2, letterSpacing: '0.06em', padding: '0 0 8px', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {goal.contributions.slice(0, 6).map(c => (
                <tr key={c.id} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td style={{ padding: '9px 0', fontSize: 12, color: C.text }}>
                    {new Date(c.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '9px 0', fontSize: 13, fontWeight: 700, color: '#22c55e' }}>+{fmt(c.amount)}</td>
                  <td style={{ padding: '9px 0', fontSize: 12, color: C.text2 }}>{c.source}</td>
                </tr>
              ))}
              {goal.contributions.length === 0 && (
                <tr><td colSpan={3} style={{ textAlign: 'center', color: C.text2, fontSize: 12, padding: '16px 0' }}>No contributions yet</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Projection + settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '20px', boxShadow: C.shadow }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 12 }}>📈 Projection</div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
              {[{ color: goal.color, label: 'Projected' }, { color: '#22c55e', label: 'Target' }].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: C.text2 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: l.color }} />{l.label}
                </div>
              ))}
            </div>
            <ProjectionChart goal={goal} />
          </div>

          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '20px', boxShadow: C.shadow }}>
            {[
              { label: 'Target amount', field: 'targetAmount' as const, value: goal.targetAmount, prefix: '$' },
              { label: 'Monthly contribution', field: 'monthlyContribution' as const, value: goal.monthlyContribution, prefix: '$' },
            ].map(({ label, field, value, prefix }) => (
              <div key={field} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.text2, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
                <div style={{ display: 'flex', alignItems: 'center', background: '#f8f7f4', border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
                  <span style={{ padding: '0 10px', color: C.text2, fontSize: 13 }}>{prefix}</span>
                  <input
                    type="number"
                    defaultValue={value}
                    onBlur={e => updateGoal(goal.id, { [field]: parseFloat(e.target.value) || 0 })}
                    style={{ flex: 1, border: 'none', background: 'transparent', padding: '9px 8px', fontSize: 14, fontWeight: 600, outline: 'none', color: C.text }}
                  />
                </div>
              </div>
            ))}
            <div style={{ marginBottom: 4 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.text2, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Target date</div>
              <input
                type="month"
                defaultValue={goal.targetDate}
                onBlur={e => updateGoal(goal.id, { targetDate: e.target.value })}
                style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', fontSize: 14, background: '#f8f7f4', color: C.text, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <button
              onClick={handleDelete}
              style={{ marginTop: 14, width: '100%', background: 'none', border: `1px solid #ef4444`, borderRadius: 8, color: '#ef4444', fontWeight: 600, fontSize: 13, padding: '9px 0', cursor: 'pointer' }}
            >
              🗑️ Delete goal
            </button>
          </div>
        </div>
      </div>

      {showGoalDialog && <GoalDialog goal={goal} onClose={() => setShowGoalDialog(false)} />}
      {showContribDialog && <ContribDialog goalId={goal.id} onClose={() => setShowContribDialog(false)} />}
    </div>
  );
}
