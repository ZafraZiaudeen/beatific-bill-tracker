import { useRef } from 'react';
import { useLedgerlyStore } from '../store/useLedgerlyStore';
import type { Bill } from '../types';

const C = { border: '#e5e2db', text: '#1a1a1a', text2: '#6b7280', accent: '#6f8f72' };
const CADENCES = ['Monthly', 'Weekly', 'Bi-weekly', 'Yearly'];

interface Props { bill: Bill | null; onClose: () => void; }

export function BillDialog({ bill, onClose }: Props) {
  const addBill = useLedgerlyStore(s => s.addBill);
  const updateBill = useLedgerlyStore(s => s.updateBill);
  const categories = useLedgerlyStore(s => s.categories);
  const accounts = useLedgerlyStore(s => s.accounts);
  const categoryNames = categories.filter(category => !category.archived).map(category => category.name);
  const categoriesForSelect = categoryNames.length ? categoryNames : ['Other'];

  const nameRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const cadenceRef = useRef<HTMLSelectElement>(null);
  const dueDayRef = useRef<HTMLInputElement>(null);
  const catRef = useRef<HTMLSelectElement>(null);
  const accountRef = useRef<HTMLSelectElement>(null);
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);
  const iconRef = useRef<HTMLInputElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const autopayRef = useRef<HTMLInputElement>(null);
  const activeRef = useRef<HTMLInputElement>(null);

  const save = () => {
    const name = nameRef.current?.value.trim() ?? '';
    const amount = parseFloat(amountRef.current?.value ?? '0');
    const cadence = cadenceRef.current?.value ?? 'Monthly';
    const dueDay = parseInt(dueDayRef.current?.value ?? '1', 10);
    const category = catRef.current?.value ?? 'Other';
    const account = accountRef.current?.value ?? '';
    const startDate = startRef.current?.value ?? '';
    const endDate = endRef.current?.value ?? '';
    const icon = iconRef.current?.value.trim() || '💸';
    const notes = notesRef.current?.value.trim() ?? '';
    const autopay = !!autopayRef.current?.checked;
    const active = !!activeRef.current?.checked;

    if (!name || !amount || amount <= 0 || !dueDay || dueDay < 1 || dueDay > 31) {
      alert('Please fill in name, amount, and due day (1-31).');
      return;
    }
    if (endDate && startDate && endDate < startDate) {
      alert('End date must be after the start date.');
      return;
    }

    const data = {
      name,
      amount,
      cadence,
      dueDay,
      category,
      account,
      startDate,
      endDate,
      icon,
      notes,
      autopay,
      active,
      status: bill?.status ?? 'scheduled',
      lastPaidDate: bill?.lastPaidDate ?? '',
      paymentTransactionId: bill?.paymentTransactionId,
    };
    if (bill) updateBill(bill.id, data);
    else addBill(data);
    onClose();
  };

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    >
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 560, boxShadow: '0 8px 40px rgba(0,0,0,.18)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: `1px solid ${C.border}` }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: C.text }}>{bill ? 'Edit Bill' : 'Add Recurring Bill'}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: C.text2, lineHeight: 1 }}>×</button>
        </div>

        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14, maxHeight: '72vh', overflowY: 'auto' }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.text2, display: 'block', marginBottom: 5 }}>Bill name</label>
            <input ref={nameRef} type="text" placeholder="e.g. Rent" defaultValue={bill?.name ?? ''}
              style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.text2, display: 'block', marginBottom: 5 }}>Amount</label>
              <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
                <span style={{ padding: '0 10px', color: C.text2, fontSize: 13 }}>$</span>
                <input ref={amountRef} type="number" min="0" step="0.01" defaultValue={bill?.amount ?? ''}
                  style={{ flex: 1, border: 'none', padding: '9px 8px', fontSize: 14, outline: 'none', minWidth: 0 }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.text2, display: 'block', marginBottom: 5 }}>Cadence</label>
              <select ref={cadenceRef} defaultValue={bill?.cadence ?? 'Monthly'}
                style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', fontSize: 14, outline: 'none', background: '#fff' }}>
                {CADENCES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.text2, display: 'block', marginBottom: 5 }}>Due day of month</label>
              <input ref={dueDayRef} type="number" min="1" max="31" placeholder="1-31" defaultValue={bill?.dueDay ?? ''}
                style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.text2, display: 'block', marginBottom: 5 }}>Category</label>
              <select ref={catRef} defaultValue={bill?.category ?? categoriesForSelect[0]}
                style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', fontSize: 14, outline: 'none', background: '#fff' }}>
                {categoriesForSelect.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.text2, display: 'block', marginBottom: 5 }}>Pay from account</label>
              <select ref={accountRef} defaultValue={bill?.account ?? ''}
                style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', fontSize: 14, outline: 'none', background: '#fff' }}>
                <option value="">No linked account</option>
                {accounts.map(account => <option key={account.id} value={account.name}>{account.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.text2, display: 'block', marginBottom: 5 }}>Icon</label>
              <input ref={iconRef} type="text" maxLength={4} placeholder="e.g. 🏠" defaultValue={bill?.icon ?? ''}
                style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.text2, display: 'block', marginBottom: 5 }}>Start date</label>
              <input ref={startRef} type="date" defaultValue={bill?.startDate ?? ''}
                style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.text2, display: 'block', marginBottom: 5 }}>End date</label>
              <input ref={endRef} type="date" defaultValue={bill?.endDate ?? ''}
                style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.text2, display: 'block', marginBottom: 5 }}>Notes</label>
            <textarea ref={notesRef} rows={3} defaultValue={bill?.notes ?? ''} placeholder="Confirmation number, reminder, or payment note"
              style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input ref={autopayRef} type="checkbox" defaultChecked={!!bill?.autopay} style={{ width: 16, height: 16, accentColor: C.accent }} />
              <span style={{ fontSize: 13, color: C.text }}>Autopay enabled</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input ref={activeRef} type="checkbox" defaultChecked={bill?.active !== false} style={{ width: 16, height: 16, accentColor: C.accent }} />
              <span style={{ fontSize: 13, color: C.text }}>Active schedule</span>
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, padding: '14px 22px', borderTop: `1px solid ${C.border}`, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '9px 20px', border: `1px solid ${C.border}`, borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', background: '#fff' }}>Cancel</button>
          <button onClick={save} style={{ padding: '9px 20px', background: C.accent, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>{bill ? 'Save Changes' : 'Add Bill'}</button>
        </div>
      </div>
    </div>
  );
}
