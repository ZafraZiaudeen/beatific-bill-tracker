import { useRef } from 'react';
import { useLedgerlyStore } from '../store/useLedgerlyStore';
import type { Account } from '../types';

const C = { border: '#e5e2db', text: '#1a1a1a', text2: '#6b7280', accent: '#22c55e' };
const TYPES = ['Checking', 'Savings', 'Credit Card', 'Student Loan', 'Vehicle', 'Investment', 'Mortgage', 'Other'];
const GROUP_MAP: Record<string, string> = {
  Checking: 'Cash', Savings: 'Cash', 'Credit Card': 'Credit cards',
  'Student Loan': 'Loans', Mortgage: 'Loans', Vehicle: 'Other assets',
  Investment: 'Other assets', Other: 'Other assets',
};

interface Props { account: Account | null; onClose: () => void; }

export function AccountDialog({ account, onClose }: Props) {
  const addAccount    = useLedgerlyStore(s => s.addAccount);
  const updateAccount = useLedgerlyStore(s => s.updateAccount);

  const nameRef    = useRef<HTMLInputElement>(null);
  const typeRef    = useRef<HTMLSelectElement>(null);
  const instRef    = useRef<HTMLInputElement>(null);
  const numRef     = useRef<HTMLInputElement>(null);
  const openingRef = useRef<HTMLInputElement>(null);
  const balRef     = useRef<HTMLInputElement>(null);

  const save = () => {
    const name    = nameRef.current?.value.trim() ?? '';
    const type    = typeRef.current?.value ?? 'Checking';
    const inst    = instRef.current?.value.trim() ?? '';
    const num     = numRef.current?.value.trim() ?? '';
    const opening = parseFloat(openingRef.current?.value ?? '0');
    const balance = parseFloat(balRef.current?.value ?? '0');
    if (!name) { alert('Please enter an account name.'); return; }
    const group = GROUP_MAP[type] ?? 'Other assets';
    const data = {
      name, type, institution: inst, accountNumber: num,
      openingBalance: opening, balance, group,
      openingDate: account?.openingDate ?? new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString(),
      visibility: true, reconciled: account?.reconciled ?? false,
    };
    if (account) updateAccount(account.id, data);
    else addAccount(data);
    onClose();
  };

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    >
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 460, boxShadow: '0 8px 40px rgba(0,0,0,.18)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: `1px solid ${C.border}` }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: C.text }}>{account ? 'Edit Account' : 'Add Account'}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: C.text2, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.text2, display: 'block', marginBottom: 5 }}>Account name</label>
              <input ref={nameRef} type="text" placeholder="e.g. Checking" defaultValue={account?.name ?? ''}
                style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.text2, display: 'block', marginBottom: 5 }}>Account type</label>
              <select ref={typeRef} defaultValue={account?.type ?? 'Checking'}
                style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', fontSize: 14, outline: 'none', background: '#fff' }}>
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.text2, display: 'block', marginBottom: 5 }}>Institution</label>
              <input ref={instRef} type="text" placeholder="e.g. Chase Bank" defaultValue={account?.institution ?? ''}
                style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.text2, display: 'block', marginBottom: 5 }}>Last 4 digits (optional)</label>
              <input ref={numRef} type="text" placeholder="1234" maxLength={4} defaultValue={account?.accountNumber ?? ''}
                style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.text2, display: 'block', marginBottom: 5 }}>Opening balance</label>
              <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
                <span style={{ padding: '0 10px', color: C.text2, fontSize: 13 }}>$</span>
                <input ref={openingRef} type="number" step="0.01" defaultValue={account?.openingBalance ?? '0'}
                  style={{ flex: 1, border: 'none', padding: '9px 8px', fontSize: 14, outline: 'none' }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.text2, display: 'block', marginBottom: 5 }}>Current balance</label>
              <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
                <span style={{ padding: '0 10px', color: C.text2, fontSize: 13 }}>$</span>
                <input ref={balRef} type="number" step="0.01" defaultValue={account?.balance ?? '0'}
                  style={{ flex: 1, border: 'none', padding: '9px 8px', fontSize: 14, outline: 'none' }} />
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, padding: '14px 22px', borderTop: `1px solid ${C.border}`, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '9px 20px', border: `1px solid ${C.border}`, borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', background: '#fff' }}>Cancel</button>
          <button onClick={save} style={{ padding: '9px 20px', background: C.accent, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>{account ? 'Save Changes' : 'Add Account'}</button>
        </div>
      </div>
    </div>
  );
}
