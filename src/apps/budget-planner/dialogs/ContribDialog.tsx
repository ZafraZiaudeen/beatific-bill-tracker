import { useRef } from 'react';
import { useLedgerlyStore } from '../store/useLedgerlyStore';

const C = { border: '#e5e2db', text: '#1a1a1a', text2: '#6b7280', accent: '#22c55e' };

interface Props { goalId: number; onClose: () => void; }

export function ContribDialog({ goalId, onClose }: Props) {
  const addContribution = useLedgerlyStore(s => s.addContribution);
  const amountRef = useRef<HTMLInputElement>(null);
  const dateRef   = useRef<HTMLInputElement>(null);
  const sourceRef = useRef<HTMLInputElement>(null);

  const today = new Date().toISOString().split('T')[0];

  const save = () => {
    const amount = parseFloat(amountRef.current?.value ?? '0');
    const date   = dateRef.current?.value ?? today;
    const source = sourceRef.current?.value.trim() || 'Manual transfer';
    if (!amount || amount <= 0) { alert('Please enter a valid amount.'); return; }
    addContribution(goalId, amount, date, source);
    onClose();
  };

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    >
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 400, boxShadow: '0 8px 40px rgba(0,0,0,.18)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: `1px solid ${C.border}` }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: C.text }}>Add Contribution</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: C.text2, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.text2, display: 'block', marginBottom: 5 }}>Amount</label>
            <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
              <span style={{ padding: '0 10px', color: C.text2, fontSize: 13 }}>$</span>
              <input ref={amountRef} type="number" min="0" step="0.01" placeholder="0.00"
                style={{ flex: 1, border: 'none', padding: '9px 8px', fontSize: 14, outline: 'none' }} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.text2, display: 'block', marginBottom: 5 }}>Date</label>
            <input ref={dateRef} type="date" defaultValue={today}
              style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.text2, display: 'block', marginBottom: 5 }}>Source</label>
            <input ref={sourceRef} type="text" defaultValue="Manual transfer" placeholder="e.g. Manual transfer"
              style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, padding: '14px 22px', borderTop: `1px solid ${C.border}`, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '9px 20px', border: `1px solid ${C.border}`, borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', background: '#fff' }}>Cancel</button>
          <button onClick={save} style={{ padding: '9px 20px', background: C.accent, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Add Contribution</button>
        </div>
      </div>
    </div>
  );
}
