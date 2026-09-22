import { useState } from 'react';
import { useLedgerlyStore } from '../store/useLedgerlyStore';
import { fmt, getBillNextDate } from '../utils/formatters';
import { BillDialog } from '../dialogs/BillDialog';
import type { Bill } from '../types';

const C = {
  bg: '#f5f4f0', surface: '#fff', border: '#e5e2db', accent: '#22c55e',
  text: '#1a1a1a', text2: '#6b7280', shadow: '0 1px 3px rgba(0,0,0,.08)',
};

const CAT_COLORS: Record<string, string> = {
  Housing: '#f97316', Utilities: '#eab308', Insurance: '#3b82f6',
  Entertainment: '#a855f7', Debt: '#94a3b8', 'Food & Dining': '#ef4444',
  Transport: '#475569', Health: '#f43f5e', Other: '#9ca3af',
};

const CURRENT_YM = '2026-09';

function AutopayToggle({ bill }: { bill: Bill }) {
  const toggleAutopay = useLedgerlyStore(s => s.toggleAutopay);
  return (
    <label
      onClick={e => { e.stopPropagation(); toggleAutopay(bill.id); }}
      style={{ position: 'relative', display: 'inline-block', width: 40, height: 22, cursor: 'pointer' }}
    >
      <input type="checkbox" checked={!!bill.autopay} onChange={() => {}} style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }} />
      <span style={{
        position: 'absolute', inset: 0, borderRadius: 11, transition: 'background .2s',
        background: bill.autopay ? C.accent : '#d1d5db',
      }} />
      <span style={{
        position: 'absolute', width: 16, height: 16, borderRadius: '50%', background: '#fff',
        top: 3, left: bill.autopay ? 21 : 3, transition: 'left .2s',
        boxShadow: '0 1px 3px rgba(0,0,0,.2)',
      }} />
    </label>
  );
}

export function BillsPage() {
  const bills        = useLedgerlyStore(s => s.bills);
  const deleteBill   = useLedgerlyStore(s => s.deleteBill);
  const [showDialog, setShowDialog] = useState(false);
  const [editBill, setEditBill]     = useState<Bill | null>(null);
  const [menuId, setMenuId]         = useState<number | null>(null);

  const sorted   = [...bills].sort((a, b) => a.dueDay - b.dueDay);
  const total    = bills.reduce((s, b) => s + b.amount, 0);
  const autopay  = bills.filter(b => b.autopay).length;
  const nextBill = sorted[0];

  const handleEdit = (b: Bill) => { setEditBill(b); setShowDialog(true); setMenuId(null); };
  const handleDelete = (id: number) => { if (confirm('Delete this bill?')) { deleteBill(id); setMenuId(null); } };

  // Timeline
  const timelineItems = sorted.slice(0, 8);

  // Cash impact weekly bars
  const weeks = [
    { label: '1–6', days: [1, 6] }, { label: '7–13', days: [7, 13] },
    { label: '14–20', days: [14, 20] }, { label: '21–27', days: [21, 27] },
    { label: '28+', days: [28, 31] },
  ];
  const weekTotals = weeks.map(w => bills.filter(b => b.dueDay >= w.days[0] && b.dueDay <= w.days[1]).reduce((s, b) => s + b.amount, 0));
  const maxWeek = Math.max(...weekTotals, 1);

  return (
    <div style={{ padding: '32px 36px' }} onClick={() => setMenuId(null)}>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: C.text, marginBottom: 24 }}>Recurring bills</h1>

      {/* KPI grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 18 }}>
        {[
          { icon: '📅', bg: '#eff6ff', ic: '#3b82f6', label: 'Due this month', value: fmt(total), sub: `${bills.length} bill${bills.length !== 1 ? 's' : ''}` },
          { icon: '🔄', bg: '#f0fdf4', ic: C.accent,  label: 'Autopay',          value: `${autopay} of ${bills.length}`, sub: 'Bills set to autopay' },
          { icon: '📊', bg: '#eff6ff', ic: '#3b82f6', label: 'Average monthly',  value: fmt(total), sub: 'Last 3 months' },
          { icon: '📆', bg: '#fff7ed', ic: '#f97316', label: 'Next due',
            value: nextBill ? getBillNextDate(nextBill.dueDay, CURRENT_YM) : '—',
            sub: nextBill ? `${nextBill.name} · ${fmt(nextBill.amount)}` : '—', small: true },
        ].map(({ icon, bg, ic, label, value, sub, small }) => (
          <div key={label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '16px 18px', display: 'flex', alignItems: 'flex-start', gap: 12, boxShadow: C.shadow }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, flexShrink: 0, color: ic }}>{icon}</div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.text2, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: small ? 15 : 20, fontWeight: 800, color: C.text, lineHeight: 1.2 }}>{value}</div>
              <div style={{ fontSize: 11, color: C.text2, marginTop: 2 }}>{sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '16px 18px', marginBottom: 18, boxShadow: C.shadow, overflowX: 'auto' }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: C.text, marginBottom: 10 }}>September 2026</div>
        <div style={{ display: 'flex', position: 'relative', minWidth: 500, alignItems: 'flex-start', gap: 0 }}>
          <div style={{ position: 'absolute', top: 18, left: 0, right: 0, height: 1, background: C.border }} />
          {timelineItems.map(b => (
            <div key={b.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: 10, color: C.text2, marginBottom: 6, fontWeight: 500 }}>{b.dueDay}</div>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: CAT_COLORS[b.category] ?? '#9ca3af', marginBottom: 6 }} />
              <div style={{ fontSize: 10, fontWeight: 600, color: C.text, textAlign: 'center', lineHeight: 1.3 }}>{b.name}</div>
              <div style={{ fontSize: 9, color: C.text2, textAlign: 'center' }}>{fmt(b.amount)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Body: table + cash impact */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 270px', gap: 18, alignItems: 'start' }}>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', boxShadow: C.shadow }}>
          <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}` }}>
            <button
              onClick={() => { setEditBill(null); setShowDialog(true); }}
              style={{ background: C.accent, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
            >
              + Add recurring bill
            </button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f7f4' }}>
                {['Bill', 'Amount', 'Cadence', 'Next due', 'Category', 'Autopay', ''].map(h => (
                  <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: C.text2, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map(b => (
                <tr key={b.id} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#f3f0eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{b.icon}</div>
                      <span style={{ fontWeight: 600, fontSize: 13, color: C.text }}>{b.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 600, fontSize: 13 }}>{fmt(b.amount)}</td>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: C.text2 }}>{b.cadence}</td>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: C.text2 }}>{getBillNextDate(b.dueDay, CURRENT_YM)}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: CAT_COLORS[b.category] ?? '#9ca3af', flexShrink: 0, display: 'inline-block' }} />
                      {b.category}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                    <AutopayToggle bill={b} />
                  </td>
                  <td style={{ padding: '12px 14px', position: 'relative' }}>
                    <button
                      onClick={e => { e.stopPropagation(); setMenuId(menuId === b.id ? null : b.id); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, letterSpacing: 2, color: C.text2, padding: '2px 4px' }}
                    >···</button>
                    {menuId === b.id && (
                      <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', right: 10, top: '100%', background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,.12)', zIndex: 50, minWidth: 130, padding: 4 }}>
                        <button onClick={() => handleEdit(b)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', fontSize: 13, color: C.text, background: 'none', border: 'none', cursor: 'pointer', borderRadius: 6 }}>✏️ Edit</button>
                        <button onClick={() => handleDelete(b.id)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', fontSize: 13, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 6 }}>🗑️ Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {bills.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: C.text2, padding: '32px 0', fontSize: 13 }}>No bills yet. Add your first recurring bill.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Cash impact */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px', boxShadow: C.shadow }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: C.text }}>Upcoming cash impact</span>
            <span style={{ fontSize: 11, color: C.text2 }}>Next 30 days</span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: C.text, marginBottom: 2 }}>{fmt(total)}</div>
          <div style={{ fontSize: 11, color: C.text2, marginBottom: 14 }}>↑ 4.8% vs. last 30 days</div>
          {/* Bar chart */}
          <svg viewBox="0 0 260 110" style={{ display: 'block', width: '100%', marginBottom: 14 }}>
            {weekTotals.map((v, i) => {
              const bw = 32, gap = (260 - bw * 5) / 6;
              const x = gap + i * (bw + gap);
              const bh = Math.round((80 * v) / maxWeek);
              const y = 88 - bh;
              return (
                <g key={i}>
                  <rect x={x} y={y} width={bw} height={bh} fill="#3b82f6" rx="3" />
                  <text x={x + bw / 2} y={104} textAnchor="middle" fontSize="9" fill={C.text2}>{weeks[i].label}</text>
                </g>
              );
            })}
          </svg>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: '#f8f7f4', borderRadius: 8, padding: '10px 12px' }}>
            <span style={{ fontSize: 16 }}>ℹ️</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>Reminders stay on this device.</div>
              <div style={{ fontSize: 11, color: C.text2, lineHeight: 1.4 }}>We'll show you upcoming bills here.</div>
            </div>
          </div>
        </div>
      </div>

      {showDialog && <BillDialog bill={editBill} onClose={() => { setShowDialog(false); setEditBill(null); }} />}
    </div>
  );
}
