import { useState } from 'react';
import { useLedgerlyStore } from '../store/useLedgerlyStore';
import { fmt, fmtTimeAgo } from '../utils/formatters';
import { AccountDialog } from '../dialogs/AccountDialog';
import type { Account } from '../types';

const C = {
  bg: '#f5f4f0', surface: '#fff', border: '#e5e2db', accent: '#22c55e',
  text: '#1a1a1a', text2: '#6b7280', shadow: '0 1px 3px rgba(0,0,0,.08)',
};

const GROUP_CFG: Record<string, { icon: string; color: string; bg: string }> = {
  Cash:         { icon: '💵', color: '#22c55e', bg: '#f0fdf4' },
  'Credit cards': { icon: '💳', color: '#3b82f6', bg: '#eff6ff' },
  Loans:        { icon: '📋', color: '#f97316', bg: '#fff7ed' },
  'Other assets': { icon: '🏠', color: '#8b5cf6', bg: '#faf5ff' },
};
const GROUP_ORDER = ['Cash', 'Credit cards', 'Loans', 'Other assets'];

export function AccountsPage() {
  const accounts       = useLedgerlyStore(s => s.accounts);
  const toggleVisibility = useLedgerlyStore(s => s.toggleVisibility);
  const markReconciled = useLedgerlyStore(s => s.markReconciled);

  const [collapsed, setCollapsed]   = useState<Record<string, boolean>>({});
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [editAcc, setEditAcc]       = useState<Account | null>(null);

  const totalCash   = accounts.filter(a => a.group === 'Cash').reduce((s, a) => s + a.balance, 0);
  const totalAssets = accounts.filter(a => a.balance > 0).reduce((s, a) => s + a.balance, 0);
  const totalLiab   = accounts.filter(a => a.balance < 0).reduce((s, a) => s + Math.abs(a.balance), 0);
  const netWorth    = totalAssets - totalLiab;

  const selected = accounts.find(a => a.id === selectedId) ?? null;

  const toggleGroup = (g: string) => setCollapsed(prev => ({ ...prev, [g]: !prev[g] }));

  return (
    <div style={{ padding: '32px 36px' }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: C.text, marginBottom: 24 }}>Accounts</h1>

      {/* KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { icon: '💵', bg: '#f0fdf4', ic: '#16a34a', label: 'Total cash', value: fmt(totalCash), sub: `${accounts.filter(a => a.group === 'Cash').length} accounts` },
          { icon: '🏦', bg: '#eff6ff', ic: '#3b82f6', label: 'Total assets', value: fmt(totalAssets), sub: `${accounts.filter(a => a.balance > 0).length} accounts` },
          { icon: '💳', bg: '#fef2f2', ic: '#ef4444', label: 'Total liabilities', value: fmt(totalLiab), sub: `${accounts.filter(a => a.balance < 0).length} accounts` },
          { icon: '📈', bg: '#1a1f2e', ic: C.accent, label: 'Net worth', value: fmt(netWorth), sub: '↑ 4.8% vs. last month', light: true },
        ].map(({ icon, bg, ic, label, value, sub, light }) => (
          <div key={label} style={{ background: light ? '#1a1f2e' : C.surface, border: `1px solid ${light ? '#2d3748' : C.border}`, borderRadius: 14, padding: '16px 18px', display: 'flex', alignItems: 'flex-start', gap: 12, boxShadow: C.shadow }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, flexShrink: 0, color: ic }}>{icon}</div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: light ? '#94a3b8' : C.text2, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: light ? '#fff' : C.text, lineHeight: 1.2 }}>{value}</div>
              <div style={{ fontSize: 11, color: light ? '#64748b' : C.text2, marginTop: 2 }}>{sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
        <button
          onClick={() => { setEditAcc(null); setShowDialog(true); }}
          style={{ background: C.accent, color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
        >
          ⊕ Add account manually
        </button>
        <button
          onClick={() => alert('Import: Upload a CSV with Account, Balance, Institution.')}
          style={{ background: C.surface, color: C.text, border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 18px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
        >
          ↑ Import balances
        </button>
      </div>

      {/* Split */}
      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 310px' : '1fr', gap: 16, alignItems: 'start' }}>
        {/* Groups */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {GROUP_ORDER.map(groupName => {
            const cfg  = GROUP_CFG[groupName] ?? { icon: '💰', color: '#6b7280', bg: '#f3f4f6' };
            const grpAccounts = accounts.filter(a => a.group === groupName);
            if (!grpAccounts.length) return null;
            const grpTotal = grpAccounts.reduce((s, a) => s + a.balance, 0);
            const isOpen   = !collapsed[groupName];
            return (
              <div key={groupName} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', boxShadow: C.shadow }}>
                <div
                  onClick={() => toggleGroup(groupName)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', cursor: 'pointer', borderBottom: isOpen ? `1px solid ${C.border}` : 'none' }}
                >
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0, color: cfg.color }}>{cfg.icon}</div>
                  <span style={{ fontWeight: 700, fontSize: 14, color: C.text, flex: 1 }}>{groupName}</span>
                  <span style={{ fontSize: 11, color: C.text2, marginRight: 8 }}>{grpAccounts.length} account{grpAccounts.length !== 1 ? 's' : ''}</span>
                  <span style={{ fontWeight: 700, fontSize: 14, color: C.text, marginRight: 8 }}>{grpTotal >= 0 ? fmt(grpTotal) : `-${fmt(Math.abs(grpTotal))}`}</span>
                  <span style={{ fontSize: 12, color: C.text2, transition: 'transform .2s', display: 'inline-block', transform: isOpen ? 'rotate(180deg)' : 'none' }}>▾</span>
                </div>
                {isOpen && (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f8f7f4' }}>
                        {['Account', 'Balance', 'Type', 'Last updated', 'Visibility'].map(h => (
                          <th key={h} style={{ padding: '8px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: C.text2, letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {grpAccounts.map(a => {
                        const balNeg = a.balance < 0;
                        const balStr = balNeg ? `-${fmt(Math.abs(a.balance))}` : fmt(a.balance);
                        return (
                          <tr
                            key={a.id}
                            onClick={() => setSelectedId(selectedId === a.id ? null : a.id)}
                            style={{ borderTop: `1px solid ${C.border}`, cursor: 'pointer', background: selectedId === a.id ? '#f0fdf4' : 'transparent', transition: 'background .1s' }}
                          >
                            <td style={{ padding: '12px 14px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 30, height: 30, borderRadius: 8, background: '#f3f0eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{cfg.icon}</div>
                                <div>
                                  <div style={{ fontWeight: 600, fontSize: 13 }}>{a.name}</div>
                                  <div style={{ fontSize: 11, color: C.text2 }}>{a.institution}{a.accountNumber ? ` · ${a.accountNumber}` : ''}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '12px 14px', fontWeight: 600, fontSize: 13, color: balNeg ? '#ef4444' : C.text }}>{balStr}</td>
                            <td style={{ padding: '12px 14px' }}>
                              <span style={{ background: '#f3f4f6', borderRadius: 99, padding: '3px 9px', fontSize: 11, fontWeight: 500, color: C.text2 }}>{a.type}</span>
                            </td>
                            <td style={{ padding: '12px 14px', fontSize: 12, color: C.text2 }}>
                              {new Date(a.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              <br />
                              <span style={{ fontSize: 11 }}>{fmtTimeAgo(a.lastUpdated)}</span>
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                              <button
                                onClick={e => { e.stopPropagation(); toggleVisibility(a.id); }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, opacity: a.visibility ? 1 : 0.4 }}
                              >
                                {a.visibility ? '👁️' : '🚫'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            );
          })}
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', boxShadow: C.shadow }}>
            <div style={{ padding: '16px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div>
                <button
                  onClick={() => setSelectedId(null)}
                  style={{ fontSize: 12, color: C.accent, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 8, display: 'block' }}
                >
                  ← Back to accounts
                </button>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: GROUP_CFG[selected.group]?.bg ?? '#f3f0eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 21 }}>
                  {GROUP_CFG[selected.group]?.icon ?? '💰'}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{selected.name}</div>
                <div style={{ fontSize: 12, color: C.text2 }}>{selected.institution}{selected.accountNumber ? ` · ${selected.accountNumber}` : ''}</div>
              </div>
            </div>
            <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Opening balance', value: selected.openingBalance >= 0 ? fmt(selected.openingBalance) : `-${fmt(Math.abs(selected.openingBalance))}`, sub: selected.openingDate },
                { label: 'Current balance', value: selected.balance >= 0 ? fmt(selected.balance) : `-${fmt(Math.abs(selected.balance))}`, sub: new Date(selected.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
              ].map(({ label, value, sub }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: C.text2 }}>{label}</span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{value}</div>
                    <div style={{ fontSize: 11, color: C.text2 }}>{sub}</div>
                  </div>
                </div>
              ))}
              <hr style={{ border: 'none', borderTop: `1px solid ${C.border}`, margin: 0 }} />
              {[
                { label: 'Account type', value: selected.type },
                { label: 'Institution', value: selected.institution },
                ...(selected.accountNumber ? [{ label: 'Account number', value: `···· ${selected.accountNumber}` }] : []),
                { label: 'Last updated', value: `${new Date(selected.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · ${fmtTimeAgo(selected.lastUpdated)}` },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: C.text2 }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.text, textAlign: 'right' }}>{value}</span>
                </div>
              ))}
            </div>
            <div style={{ padding: '14px 18px', borderTop: `1px solid ${C.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: selected.reconciled ? C.accent : '#d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11 }}>
                  {selected.reconciled ? '✓' : ''}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: selected.reconciled ? C.accent : C.text2 }}>{selected.reconciled ? 'Reconciled' : 'Not reconciled'}</div>
                  <div style={{ fontSize: 11, color: C.text2 }}>Reconciliation status</div>
                </div>
              </div>
              <button
                onClick={() => markReconciled(selected.id)}
                disabled={selected.reconciled}
                style={{ width: '100%', background: selected.reconciled ? '#d1d5db' : C.accent, color: '#fff', border: 'none', borderRadius: 8, padding: '11px 0', fontSize: 14, fontWeight: 600, cursor: selected.reconciled ? 'default' : 'pointer' }}
              >
                {selected.reconciled ? 'Already reconciled' : 'Mark as reconciled'}
              </button>
            </div>
          </div>
        )}
      </div>

      {showDialog && <AccountDialog account={editAcc} onClose={() => { setShowDialog(false); setEditAcc(null); }} />}
    </div>
  );
}
