import { useRef } from 'react';
import { useLedgerlyStore } from '../store/useLedgerlyStore';
import type { Debt } from '../types';

const C = { border: '#e5e2db', text: '#1a1a1a', text2: '#6b7280', accent: '#a05050' };

const DEBT_TYPES = ['Credit Card', 'Personal Loan', 'Student Loan', 'Auto Loan', 'Mortgage', 'Medical', 'Other'];

const PRESET_ICONS: Record<string, string> = {
  'Credit Card': '💳', 'Personal Loan': '🏦', 'Student Loan': '🎓',
  'Auto Loan': '🚗', Mortgage: '🏠', Medical: '🏥', Other: '💰',
};

const PRESET_COLORS: Array<{ color: string; bg: string }> = [
  { color: '#c48a8a', bg: 'rgba(196,138,138,.15)' },
  { color: '#c4a35a', bg: 'rgba(196,163,90,.15)' },
  { color: '#9e8abe', bg: 'rgba(158,138,190,.15)' },
  { color: '#6b9ec4', bg: 'rgba(107,158,196,.15)' },
  { color: '#7a9e7e', bg: 'rgba(122,158,126,.15)' },
];

interface Props { debt: Debt | null; onClose: () => void; }

export function DebtDialog({ debt, onClose }: Props) {
  const addDebt = useLedgerlyStore(s => s.addDebt);
  const updateDebt = useLedgerlyStore(s => s.updateDebt);

  const nameRef = useRef<HTMLInputElement>(null);
  const institutionRef = useRef<HTMLInputElement>(null);
  const accountNumRef = useRef<HTMLInputElement>(null);
  const typeRef = useRef<HTMLSelectElement>(null);
  const balanceRef = useRef<HTMLInputElement>(null);
  const aprRef = useRef<HTMLInputElement>(null);
  const minPayRef = useRef<HTMLInputElement>(null);
  const extraPayRef = useRef<HTMLInputElement>(null);
  const iconRef = useRef<HTMLInputElement>(null);
  const openedRef = useRef<HTMLInputElement>(null);
  const targetRef = useRef<HTMLInputElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);

  const save = () => {
    const name = nameRef.current?.value.trim() ?? '';
    const institution = institutionRef.current?.value.trim() ?? '';
    const accountNumber = accountNumRef.current?.value.trim() ?? '';
    const type = typeRef.current?.value ?? 'Other';
    const balance = parseFloat(balanceRef.current?.value ?? '0');
    const apr = parseFloat(aprRef.current?.value ?? '0') || 0;
    const minimumPayment = parseFloat(minPayRef.current?.value ?? '0') || 0;
    const extraPayment = parseFloat(extraPayRef.current?.value ?? '0') || 0;
    const icon = iconRef.current?.value.trim() || PRESET_ICONS[type] || '💰';
    const openedDate = openedRef.current?.value ?? '';
    const targetPayoffDate = targetRef.current?.value ?? '';
    const notes = notesRef.current?.value.trim() ?? '';

    if (!name || Number.isNaN(balance) || balance <= 0) {
      alert('Please fill in the debt name and a positive balance.');
      return;
    }

    const preset = debt ? { color: debt.color, bg: debt.bg } : PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)];
    const data = {
      name,
      institution,
      accountNumber,
      type,
      balance,
      apr,
      minimumPayment,
      extraPayment,
      icon,
      color: preset.color,
      bg: preset.bg,
      openedDate,
      targetPayoffDate,
      notes,
    };
    if (debt) updateDebt(debt.id, data);
    else addDebt(data);
    onClose();
  };

  const fieldStyle = {
    width: '100%', border: `1px solid ${C.border}`, borderRadius: 8,
    padding: '9px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const,
  };
  const labelStyle = { fontSize: 12, fontWeight: 600 as const, color: C.text2, display: 'block' as const, marginBottom: 5 };

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    >
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 560, boxShadow: '0 8px 40px rgba(0,0,0,.18)', overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: `1px solid ${C.border}` }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: C.text }}>{debt ? 'Edit Debt' : 'Add Debt'}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: C.text2, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Debt name</label>
            <input ref={nameRef} type="text" placeholder="e.g. Chase Sapphire" defaultValue={debt?.name ?? ''} style={fieldStyle} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Institution</label>
              <input ref={institutionRef} type="text" placeholder="e.g. Chase" defaultValue={debt?.institution ?? ''} style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle}>Account # (last 4)</label>
              <input ref={accountNumRef} type="text" placeholder="4291" maxLength={4} defaultValue={debt?.accountNumber ?? ''} style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle}>Debt type</label>
              <select ref={typeRef} defaultValue={debt?.type ?? 'Credit Card'} style={{ ...fieldStyle, background: '#fff' }}>
                {DEBT_TYPES.map(type => <option key={type}>{type}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Icon</label>
              <input ref={iconRef} type="text" placeholder="💳" maxLength={4} defaultValue={debt?.icon ?? ''} style={fieldStyle} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Current balance</label>
              <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
                <span style={{ padding: '0 10px', color: C.text2, fontSize: 13 }}>$</span>
                <input ref={balanceRef} type="number" min="0" step="0.01" defaultValue={debt?.balance ?? ''}
                  style={{ flex: 1, border: 'none', padding: '9px 8px', fontSize: 14, outline: 'none', minWidth: 0 }} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>APR (%)</label>
              <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
                <input ref={aprRef} type="number" min="0" step="0.01" defaultValue={debt?.apr ?? ''}
                  style={{ flex: 1, border: 'none', padding: '9px 8px 9px 12px', fontSize: 14, outline: 'none', minWidth: 0 }} />
                <span style={{ padding: '0 10px', color: C.text2, fontSize: 13 }}>%</span>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Minimum payment / mo</label>
              <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
                <span style={{ padding: '0 10px', color: C.text2, fontSize: 13 }}>$</span>
                <input ref={minPayRef} type="number" min="0" step="0.01" defaultValue={debt?.minimumPayment ?? ''}
                  style={{ flex: 1, border: 'none', padding: '9px 8px', fontSize: 14, outline: 'none', minWidth: 0 }} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Extra payment / mo</label>
              <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
                <span style={{ padding: '0 10px', color: C.text2, fontSize: 13 }}>$</span>
                <input ref={extraPayRef} type="number" min="0" step="0.01" defaultValue={debt?.extraPayment ?? ''}
                  style={{ flex: 1, border: 'none', padding: '9px 8px', fontSize: 14, outline: 'none', minWidth: 0 }} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Opened date</label>
              <input ref={openedRef} type="date" defaultValue={debt?.openedDate ?? ''} style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle}>Target payoff month</label>
              <input ref={targetRef} type="month" defaultValue={debt?.targetPayoffDate ?? ''} style={fieldStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Notes</label>
            <textarea ref={notesRef} rows={3} defaultValue={debt?.notes ?? ''} placeholder="Promo APR, payoff reminder, or lender note"
              style={{ ...fieldStyle, resize: 'vertical' }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, padding: '14px 22px', borderTop: `1px solid ${C.border}`, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '9px 20px', border: `1px solid ${C.border}`, borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', background: '#fff' }}>Cancel</button>
          <button onClick={save} style={{ padding: '9px 20px', background: C.accent, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>{debt ? 'Save Changes' : 'Add Debt'}</button>
        </div>
      </div>
    </div>
  );
}
