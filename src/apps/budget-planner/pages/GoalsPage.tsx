import { useState } from 'react';
import { useLedgerlyStore } from '../store/useLedgerlyStore';
import { fmt, addMonthsToYM, fmtYM } from '../utils/formatters';
import { GoalDialog } from '../dialogs/GoalDialog';
import type { Goal, Debt } from '../types';

const C = {
  bg: '#f5f4f0', surface: '#fff', border: '#e5e2db', accent: '#22c55e',
  text: '#1a1f2e', text2: '#6b7280', text3: '#9ca3af',
  red: '#ef4444', shadow: '0 1px 3px rgba(0,0,0,.08)',
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
    <text x="${cx}" y="${cy - 4}" text-anchor="middle" font-size="18" font-weight="700" fill="${C.text}">${Math.round(pct)}%</text>
    <text x="${cx}" y="${cy + 14}" text-anchor="middle" font-size="11" fill="${C.text2}">complete</text>
  </svg>`;
}

function goalMonthsLeft(g: Goal): number {
  const left = Math.max(0, g.targetAmount - g.savedAmount);
  return g.monthlyContribution > 0 ? Math.ceil(left / g.monthlyContribution) : 999;
}

function GoalCard({ goal }: { goal: Goal }) {
  const setView = useLedgerlyStore(s => s.setView);
  const setSelectedGoalId = useLedgerlyStore(s => s.setSelectedGoalId);
  const pct = Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100));
  const months = goalMonthsLeft(goal);
  const estDate = addMonthsToYM('2026-09', months);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => { setSelectedGoalId(goal.id); setView('goal-detail'); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16,
        padding: '22px 24px', cursor: 'pointer', transition: 'box-shadow .15s, transform .15s',
        boxShadow: hovered ? '0 4px 16px rgba(0,0,0,.1)' : C.shadow,
        transform: hovered ? 'translateY(-2px)' : 'none',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Goal header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: goal.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{goal.icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: C.text }}>{goal.name}</div>
          <div style={{ fontSize: 12, color: C.text2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{goal.description}</div>
        </div>
      </div>

      {/* Progress ring centered */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}
        dangerouslySetInnerHTML={{ __html: progressRingSvg(pct, 100, 10, goal.color) }}
      />

      {/* Progress bar */}
      <div style={{ height: 5, background: '#e5e2db', borderRadius: 3, overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: goal.color, borderRadius: 3, transition: 'width .3s' }} />
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px' }}>
        {[
          { label: 'SAVED',      value: fmt(goal.savedAmount) },
          { label: 'TARGET',     value: fmt(goal.targetAmount) },
          { label: 'MONTHLY',    value: fmt(goal.monthlyContribution) },
          { label: 'EST. DATE',  value: months > 99 ? '—' : fmtYM(estDate) },
        ].map(({ label, value }) => (
          <div key={label}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.text2, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{value}</div>
          </div>
        ))}
      </div>

      {/* View details hint */}
      <div style={{ marginTop: 14, textAlign: 'right', fontSize: 12, color: hovered ? C.accent : C.text3, fontWeight: 600, transition: 'color .15s' }}>
        View details →
      </div>
    </div>
  );
}

function IndividualDebtCard({ debt, totalBalance }: { debt: Debt; totalBalance: number }) {
  const [hovered, setHovered] = useState(false);
  const pct = totalBalance > 0 ? (debt.balance / totalBalance) * 100 : 0;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16,
        padding: '22px 24px', boxShadow: hovered ? '0 4px 16px rgba(0,0,0,.1)' : C.shadow,
        transition: 'box-shadow .15s', cursor: 'default',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: debt.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{debt.icon}</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{debt.name}</div>
          <div style={{ fontSize: 11.5, color: C.text2 }}>{debt.institution} · ···{debt.accountNumber}</div>
        </div>
      </div>

      {/* Balance */}
      <div style={{ fontSize: 24, fontWeight: 800, color: C.red, marginBottom: 14 }}>{fmt(debt.balance)}</div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 14 }}>
        {[
          { label: 'APR',         value: `${debt.apr}%` },
          { label: 'MIN / MO',    value: fmt(debt.minimumPayment) },
          { label: 'EXTRA / MO',  value: debt.extraPayment > 0 ? fmt(debt.extraPayment) : '—' },
        ].map(({ label, value }, i) => (
          <div key={label} style={{ flex: 1, borderLeft: i > 0 ? `1px solid ${C.border}` : 'none', paddingLeft: i > 0 ? 12 : 0 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.text2, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Proportion bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.text2, marginBottom: 4 }}>
          <span>Share of total debt</span>
          <span style={{ fontWeight: 600 }}>{Math.round(pct)}%</span>
        </div>
        <div style={{ height: 5, background: '#e5e2db', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: debt.color, borderRadius: 3 }} />
        </div>
      </div>
    </div>
  );
}

function TotalDebtCard({ debts }: { debts: Debt[] }) {
  const setView = useLedgerlyStore(s => s.setView);
  const totalBalance = debts.reduce((s, d) => s + d.balance, 0);
  const totalMin     = debts.reduce((s, d) => s + d.minimumPayment, 0);
  const totalExtra   = debts.reduce((s, d) => s + d.extraPayment, 0);
  const avgApr       = debts.reduce((s, d) => s + d.apr, 0) / debts.length;
  const monthlyTotal = totalMin + totalExtra;
  const monthsToFree = monthlyTotal > 0 ? Math.ceil(totalBalance / monthlyTotal) : null;

  return (
    <div
      onClick={() => setView('debt-planner')}
      style={{ background: '#0f1623', borderRadius: 16, padding: '22px 24px', cursor: 'pointer', boxShadow: C.shadow }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>Total Debt</div>
        <span style={{ fontSize: 12, color: '#22c55e', fontWeight: 600 }}>Open Planner →</span>
      </div>
      <div style={{ fontSize: 30, fontWeight: 900, color: '#fff', marginBottom: 4 }}>{fmt(totalBalance)}</div>
      <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>
        {debts.length} debt{debts.length !== 1 ? 's' : ''} · {fmt(totalMin)}/mo minimum · avg {avgApr.toFixed(1)}% APR
      </div>
      {monthsToFree !== null && (
        <div style={{ background: 'rgba(34,197,94,.12)', border: '1px solid rgba(34,197,94,.2)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#4ade80', fontWeight: 600 }}>
          🎯 Debt-free in ~{monthsToFree} months at current pace
        </div>
      )}
    </div>
  );
}

export function GoalsPage() {
  const goals  = useLedgerlyStore(s => s.goals);
  const debts  = useLedgerlyStore(s => s.debts);
  const setView = useLedgerlyStore(s => s.setView);
  const [showDialog, setShowDialog] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);

  const totalBalance = debts.reduce((s, d) => s + d.balance, 0);

  return (
    <div style={{ padding: '32px 36px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: C.text }}>Goals & Debt</h1>
      </div>

      {/* Goals section */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: C.text }}>My Goals</h2>
          <button
            onClick={() => { setEditGoal(null); setShowDialog(true); }}
            style={{ background: C.accent, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
          >
            + Add Goal
          </button>
        </div>

        {/* 3-column grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {goals.map(g => <GoalCard key={g.id} goal={g} />)}
          {goals.length === 0 && (
            <div style={{ gridColumn: '1/-1', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 40, textAlign: 'center', color: C.text2 }}>
              No goals yet. Add your first savings goal to get started.
            </div>
          )}
        </div>
      </div>

      {/* Debts section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: C.text }}>My Debts</h2>
          <button
            onClick={() => setView('debt-planner')}
            style={{ background: C.surface, color: C.text2, border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 14px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
          >
            Open Debt Planner →
          </button>
        </div>

        {/* 3-col debt grid + summary card */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
          {debts.map(d => <IndividualDebtCard key={d.id} debt={d} totalBalance={totalBalance} />)}
        </div>
        <TotalDebtCard debts={debts} />
      </div>

      {showDialog && (
        <GoalDialog goal={editGoal} onClose={() => setShowDialog(false)} />
      )}
    </div>
  );
}
