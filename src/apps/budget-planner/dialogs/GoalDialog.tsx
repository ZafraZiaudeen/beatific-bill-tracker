import { useRef } from 'react';
import { useLedgerlyStore } from '../store/useLedgerlyStore';
import type { Goal } from '../types';

const C = { border: '#e5e2db', text: '#1a1a1a', text2: '#6b7280', accent: '#22c55e' };

interface Props { goal: Goal | null; onClose: () => void; }

export function GoalDialog({ goal, onClose }: Props) {
  const addGoal    = useLedgerlyStore(s => s.addGoal);
  const updateGoal = useLedgerlyStore(s => s.updateGoal);

  const nameRef    = useRef<HTMLInputElement>(null);
  const descRef    = useRef<HTMLInputElement>(null);
  const iconRef    = useRef<HTMLInputElement>(null);
  const targetRef  = useRef<HTMLInputElement>(null);
  const savedRef   = useRef<HTMLInputElement>(null);
  const monthlyRef = useRef<HTMLInputElement>(null);
  const dateRef    = useRef<HTMLInputElement>(null);

  const save = () => {
    const name    = nameRef.current?.value.trim() ?? '';
    const target  = parseFloat(targetRef.current?.value ?? '0');
    const saved   = parseFloat(savedRef.current?.value ?? '0');
    const monthly = parseFloat(monthlyRef.current?.value ?? '0');
    const date    = dateRef.current?.value ?? '';
    if (!name || !target || !date) { alert('Please fill in name, target amount, and target date.'); return; }

    const data = {
      name,
      description: descRef.current?.value.trim() ?? '',
      icon: iconRef.current?.value.trim() || '🎯',
      color: goal?.color ?? '#3b82f6',
      bg: goal?.bg ?? '#eff6ff',
      targetAmount: target,
      savedAmount: saved,
      monthlyContribution: monthly,
      targetDate: date,
    };
    if (goal) updateGoal(goal.id, data);
    else addGoal(data);
    onClose();
  };

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    >
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 460, boxShadow: '0 8px 40px rgba(0,0,0,.18)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: `1px solid ${C.border}` }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: C.text }}>{goal ? 'Edit Goal' : 'Add Goal'}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: C.text2, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'Goal name', ref: nameRef, type: 'text', placeholder: 'e.g. Emergency fund', defaultValue: goal?.name },
            { label: 'Description', ref: descRef, type: 'text', placeholder: 'e.g. Build a safety net', defaultValue: goal?.description },
            { label: 'Icon (emoji)', ref: iconRef, type: 'text', placeholder: '🎯', defaultValue: goal?.icon },
          ].map(({ label, ref, type, placeholder, defaultValue }) => (
            <div key={label}>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.text2, display: 'block', marginBottom: 5 }}>{label}</label>
              <input ref={ref as React.RefObject<HTMLInputElement>} type={type} placeholder={placeholder} defaultValue={defaultValue ?? ''}
                style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Target amount', ref: targetRef, defaultValue: goal?.targetAmount },
              { label: 'Amount saved so far', ref: savedRef, defaultValue: goal?.savedAmount },
              { label: 'Monthly contribution', ref: monthlyRef, defaultValue: goal?.monthlyContribution },
            ].map(({ label, ref, defaultValue }) => (
              <div key={label}>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.text2, display: 'block', marginBottom: 5 }}>{label}</label>
                <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
                  <span style={{ padding: '0 10px', color: C.text2, fontSize: 13 }}>$</span>
                  <input ref={ref as React.RefObject<HTMLInputElement>} type="number" min="0" step="1" defaultValue={defaultValue ?? ''}
                    style={{ flex: 1, border: 'none', padding: '9px 8px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
            ))}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.text2, display: 'block', marginBottom: 5 }}>Target date</label>
              <input ref={dateRef} type="month" defaultValue={goal?.targetDate ?? ''}
                style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, padding: '14px 22px', borderTop: `1px solid ${C.border}`, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '9px 20px', border: `1px solid ${C.border}`, borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', background: '#fff' }}>Cancel</button>
          <button onClick={save} style={{ padding: '9px 20px', background: C.accent, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>{goal ? 'Save Changes' : 'Add Goal'}</button>
        </div>
      </div>
    </div>
  );
}
