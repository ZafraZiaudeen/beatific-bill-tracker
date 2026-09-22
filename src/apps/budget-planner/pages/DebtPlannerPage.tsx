import { useState } from 'react';
import { useLedgerlyStore } from '../store/useLedgerlyStore';
import { fmt, addMonthsToYM, fmtYM } from '../utils/formatters';
import { simulateDebtPayoff, payoffDateLabel } from '../utils/debtSimulator';

const C = {
  bg: '#f5f4f0', surface: '#fff', border: '#e5e2db', accent: '#22c55e',
  text: '#1a1a1a', text2: '#6b7280', shadow: '0 1px 3px rgba(0,0,0,.08)',
};
const START_YM = '2026-09';

function DebtTimelineChart({ snowMonths, avMonths, snowBalances, avBalances }: {
  snowMonths: number; avMonths: number;
  snowBalances: number[]; avBalances: number[];
}) {
  const W = 580, H = 170, padL = 48, padR = 16, padT = 12, padB = 36;
  const totalMonths = Math.max(snowMonths, avMonths, 1);
  const maxBal = Math.max(snowBalances[0] ?? 1, avBalances[0] ?? 1);

  function toXY(balances: number[], totalM: number) {
    return balances.map((b, i) => {
      const x = padL + (i / totalM) * (W - padL - padR);
      const y = padT + (1 - b / maxBal) * (H - padT - padB);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
  }

  const snowPts = toXY(snowBalances, totalMonths).join(' ');
  const avPts   = toXY(avBalances,   totalMonths).join(' ');
  const firstX  = padL;
  const lastSnowX = padL + (snowMonths / totalMonths) * (W - padL - padR);
  const lastAvX   = padL + (avMonths  / totalMonths) * (W - padL - padR);
  const botY = padT + (H - padT - padB);

  // X-axis labels
  const xTicks = [0, Math.floor(totalMonths / 4), Math.floor(totalMonths / 2), Math.floor(3 * totalMonths / 4), totalMonths];
  // Y-axis labels
  const yVals = [0, Math.round(maxBal / 2 / 1000) * 1000, Math.round(maxBal / 1000) * 1000];

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', width: '100%' }}>
      <defs>
        <linearGradient id="snow-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0.01" />
        </linearGradient>
        <linearGradient id="av-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {/* Avalanche area */}
      <polygon points={`${firstX},${botY} ${avPts} ${lastAvX},${botY}`} fill="url(#av-grad)" />
      {/* Snowball area */}
      <polygon points={`${firstX},${botY} ${snowPts} ${lastSnowX},${botY}`} fill="url(#snow-grad)" />
      {/* Lines */}
      <polyline points={avPts}   fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={snowPts} fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* End dots */}
      <circle cx={lastAvX}   cy={padT + (H - padT - padB)} r="5" fill="#3b82f6" />
      <circle cx={lastSnowX} cy={padT + (H - padT - padB)} r="5" fill="#f97316" />
      {/* Y labels */}
      {yVals.map(v => {
        const yy = padT + (1 - v / maxBal) * (H - padT - padB);
        return <text key={v} x={padL - 4} y={yy + 4} textAnchor="end" fontSize="9" fill={C.text2}>{fmt(v)}</text>;
      })}
      {/* X labels */}
      {xTicks.map(m => {
        const xx = padL + (m / totalMonths) * (W - padL - padR);
        return <text key={m} x={xx} y={H - 4} textAnchor="middle" fontSize="9" fill={C.text2}>{fmtYM(addMonthsToYM(START_YM, m))}</text>;
      })}
    </svg>
  );
}

export function DebtPlannerPage() {
  const debts     = useLedgerlyStore(s => s.debts);
  const debtPlan  = useLedgerlyStore(s => s.debtPlan);
  const setView   = useLedgerlyStore(s => s.setView);
  const setDebtPlan = useLedgerlyStore(s => s.setDebtPlan);

  const [simExtra, setSimExtra] = useState(debtPlan.extraPayment);

  const strategy = debtPlan.strategy;
  const snowRes = simulateDebtPayoff(debts, 'snowball',  simExtra);
  const avRes   = simulateDebtPayoff(debts, 'avalanche', simExtra);

  const activeRes   = strategy === 'snowball' ? snowRes : avRes;
  const inactiveRes = strategy === 'snowball' ? avRes   : snowRes;
  const interestSaved = Math.abs(inactiveRes.totalInterest - activeRes.totalInterest);

  const totalBalance = debts.reduce((s, d) => s + d.balance, 0);
  const totalMin     = debts.reduce((s, d) => s + d.minimumPayment, 0);
  const payoffDate   = payoffDateLabel(activeRes.months, START_YM);

  return (
    <div style={{ padding: '28px 36px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => setView('goals')}
          style={{ color: C.accent, fontWeight: 600, fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          ← Back
        </button>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Debt payoff planner</h1>
      </div>

      {/* KPI grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { icon: '💰', label: 'TOTAL BALANCE', value: fmt(totalBalance), sub: `Across ${debts.length} debts` },
          { icon: '📅', label: 'MINIMUM PAYMENTS', value: fmt(totalMin), sub: 'per month' },
          { icon: '🗓️', label: 'PAYOFF DATE', value: payoffDate, sub: 'With current plan' },
          { icon: '%',  label: 'INTEREST REMAINING', value: fmt(activeRes.totalInterest), sub: 'Total interest to be paid', iconBg: '#fff7ed', iconColor: '#f97316' },
        ].map(({ icon, label, value, sub, iconBg, iconColor }) => (
          <div key={label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: 14, boxShadow: C.shadow }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: iconBg ?? '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, color: iconColor ?? C.accent }}>{icon}</div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.text2, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.text, lineHeight: 1.2 }}>{value}</div>
              <div style={{ fontSize: 12, color: C.text2, marginTop: 2 }}>{sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Strategy selector */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        {(['snowball', 'avalanche'] as const).map(s => (
          <button
            key={s}
            onClick={() => setDebtPlan({ ...debtPlan, strategy: s })}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '16px 18px', border: `2px solid ${strategy === s ? C.accent : C.border}`,
              background: strategy === s ? '#f0fdf4' : C.surface,
              borderRadius: 12, cursor: 'pointer', textAlign: 'left',
            }}
          >
            <div style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${strategy === s ? C.accent : '#d1d5db'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {strategy === s && <div style={{ width: 10, height: 10, borderRadius: '50%', background: C.accent }} />}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: C.text, textTransform: 'capitalize' }}>{s}</div>
              <div style={{ fontSize: 12, color: C.text2 }}>{s === 'snowball' ? 'Pay smallest balance first' : 'Pay highest interest first'}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Timeline chart */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '20px 20px 10px', marginBottom: 20, boxShadow: C.shadow }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: C.text, marginBottom: 4 }}>Payoff timeline</div>
        <div style={{ fontSize: 12, color: C.text2, marginBottom: 14 }}>Total debt balance, by month · Snowball vs. Avalanche</div>
        <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
          {[
            { color: '#3b82f6', label: `Avalanche ${payoffDateLabel(avRes.months, START_YM)}` },
            { color: '#f97316', label: `Snowball ${payoffDateLabel(snowRes.months, START_YM)}` },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.text2 }}>
              <div style={{ width: 20, height: 3, background: l.color, borderRadius: 2 }} />{l.label}
            </div>
          ))}
        </div>
        <DebtTimelineChart
          snowMonths={snowRes.months} avMonths={avRes.months}
          snowBalances={snowRes.monthlyBalances} avBalances={avRes.monthlyBalances}
        />
      </div>

      {/* Debts table + plan panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, alignItems: 'start' }}>
        {/* Debts table */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', boxShadow: C.shadow }}>
          <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}`, fontWeight: 700, fontSize: 15, color: C.text }}>Your debts</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f7f4' }}>
                {['DEBT', 'BALANCE', 'APR', 'MINIMUM PAYMENT', 'EXTRA PAYMENT'].map(h => (
                  <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: C.text2, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {debts.map(d => (
                <tr key={d.id} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td style={{ padding: '14px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 9, background: d.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{d.icon}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: C.text }}>{d.name}</div>
                        <div style={{ fontSize: 11, color: C.text2 }}>{d.institution} · ···· {d.accountNumber}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 14px', fontWeight: 700, fontSize: 14, color: C.text }}>{fmt(d.balance)}</td>
                  <td style={{ padding: '14px 14px', fontSize: 13, color: C.text }}>{d.apr}%</td>
                  <td style={{ padding: '14px 14px', fontSize: 13, color: C.text }}>{fmt(d.minimumPayment)}</td>
                  <td style={{ padding: '14px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${C.border}`, borderRadius: 6, overflow: 'hidden', width: 90 }}>
                      <input
                        type="number"
                        value={simExtra}
                        onChange={e => setSimExtra(Math.max(0, parseInt(e.target.value) || 0))}
                        style={{ width: 60, border: 'none', padding: '6px 8px', fontSize: 13, outline: 'none', color: C.text }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <button onClick={() => setSimExtra(v => v + 10)} style={{ border: 'none', background: '#f3f4f6', cursor: 'pointer', padding: '2px 6px', fontSize: 10, lineHeight: 1 }}>▲</button>
                        <button onClick={() => setSimExtra(v => Math.max(0, v - 10))} style={{ border: 'none', background: '#f3f4f6', cursor: 'pointer', padding: '2px 6px', fontSize: 10, lineHeight: 1 }}>▼</button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Interest saved card */}
          <div style={{ background: '#0f1623', borderRadius: 14, padding: '22px 20px' }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 14 }}>💰</div>
            <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6 }}>Estimated interest saved</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#22c55e', marginBottom: 4 }}>{fmt(interestSaved)}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>with {strategy === 'snowball' ? 'Snowball vs. Avalanche' : 'Avalanche vs. Snowball'}</div>
          </div>

          {/* Plan simulator */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '20px', boxShadow: C.shadow }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 16 }}>Plan simulator</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: C.text }}>Extra monthly payment</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{fmt(simExtra)}</span>
            </div>
            <input
              type="range" min="0" max="500" step="25" value={simExtra}
              onChange={e => setSimExtra(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: C.accent, marginBottom: 4 }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.text2, marginBottom: 14 }}>
              <span>$0</span><span>$500</span>
            </div>
            <div style={{ fontSize: 12, color: C.text2, marginBottom: 14 }}>
              Start date: <span style={{ fontWeight: 600, color: C.text }}>📅 Sep 2026</span>
            </div>
            <button
              onClick={() => setDebtPlan({ ...debtPlan, extraPayment: simExtra })}
              style={{ width: '100%', background: '#f97316', color: '#fff', border: 'none', borderRadius: 10, padding: '13px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
            >
              Apply plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
