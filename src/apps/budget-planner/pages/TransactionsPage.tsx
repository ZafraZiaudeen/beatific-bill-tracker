import { useState, useRef } from 'react';
import { useLedgerlyStore } from '../store/useLedgerlyStore';

const C = {
  bg: '#f5f4f0', surface: '#fff', border: '#e5e2db',
  accent: '#22c55e', accentDark: '#16a34a',
  text: '#1a1f2e', text2: '#6b7280', text3: '#9ca3af',
  shadow: '0 1px 3px rgba(0,0,0,.08)',
};
const R = '1rem';
const PER_PAGE = 8;

const CAT_COLORS: Record<string, { bg: string; color: string; dot: string }> = {
  Income:        { bg: '#f0fdf4', color: '#16a34a', dot: '#22c55e' },
  Housing:       { bg: '#fff7ed', color: '#c2410c', dot: '#f97316' },
  Groceries:     { bg: '#f0fdf4', color: '#15803d', dot: '#22c55e' },
  Entertainment: { bg: '#faf5ff', color: '#7c3aed', dot: '#8b5cf6' },
  Transport:     { bg: '#f1f5f9', color: '#334155', dot: '#1e293b' },
  Utilities:     { bg: '#eff6ff', color: '#1d4ed8', dot: '#3b82f6' },
  Shopping:      { bg: '#fffbeb', color: '#b45309', dot: '#f59e0b' },
  'Food & Dining':{ bg: '#fef2f2', color: '#b91c1c', dot: '#ef4444' },
  Health:        { bg: '#fdf4ff', color: '#a21caf', dot: '#c026d3' },
};
function catStyle(cat: string) {
  return CAT_COLORS[cat] ?? { bg: '#f3f4f6', color: '#4b5563', dot: '#9ca3af' };
}

function fmtDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function fmtAmt(n: number) {
  const abs = Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n >= 0 ? `+$${abs}` : `-$${abs}`;
}

const ACCOUNTS = ['Chase Checking', 'Amex Credit', 'Savings Account'];
const CATEGORIES = ['Income', 'Housing', 'Groceries', 'Entertainment', 'Transport', 'Utilities', 'Shopping', 'Food & Dining', 'Health', 'Other'];

export function TransactionsPage() {
  const transactions    = useLedgerlyStore(s => s.transactions);
  const addTransaction  = useLedgerlyStore(s => s.addTransaction);
  const deleteTransaction = useLedgerlyStore(s => s.deleteTransaction);

  const [search, setSearch]   = useState('');
  const [catFilter, setCat]   = useState('All');
  const [page, setPage]       = useState(1);
  const [modal, setModal]     = useState(false);
  const [txnType, setTxnType] = useState<'expense' | 'income'>('expense');

  const merchantRef = useRef<HTMLInputElement>(null);
  const dateRef     = useRef<HTMLInputElement>(null);
  const amtRef      = useRef<HTMLInputElement>(null);
  const catRef      = useRef<HTMLSelectElement>(null);
  const accRef      = useRef<HTMLSelectElement>(null);
  const notesRef    = useRef<HTMLInputElement>(null);

  const today = new Date().toISOString().split('T')[0];

  const cats = ['All', ...Array.from(new Set(transactions.map(t => t.category))).sort()];

  const filtered = transactions.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !q || t.merchant.toLowerCase().includes(q) || t.category.toLowerCase().includes(q) || t.account.toLowerCase().includes(q);
    const matchCat = catFilter === 'All' || t.category === catFilter;
    return matchSearch && matchCat;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const safePage   = Math.min(page, Math.max(1, totalPages));
  const pageRows   = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const handleSearch = (v: string) => { setSearch(v); setPage(1); };
  const handleCat    = (c: string) => { setCat(c); setPage(1); };
  const clearFilters = () => { setSearch(''); setCat('All'); setPage(1); };

  const openModal = () => {
    setTxnType('expense');
    setModal(true);
  };

  const save = () => {
    const merchant = merchantRef.current?.value.trim() ?? '';
    const date     = dateRef.current?.value ?? today;
    const amt      = parseFloat(amtRef.current?.value ?? '0');
    const cat      = catRef.current?.value ?? 'Other';
    const acc      = accRef.current?.value ?? ACCOUNTS[0];
    const notes    = notesRef.current?.value.trim() ?? '';
    if (!merchant || !date || isNaN(amt) || amt <= 0) { alert('Please fill in merchant, date and a positive amount.'); return; }
    addTransaction({ merchant, icon: merchant[0].toUpperCase(), date, category: cat, account: acc, amount: txnType === 'income' ? amt : -amt, notes });
    setModal(false);
    setPage(1);
  };

  const btn = (label: string, onClick: () => void, primary = false) => (
    <button onClick={onClick} style={{ padding: '8px 16px', background: primary ? C.accent : C.surface, color: primary ? '#fff' : C.text2, border: `1px solid ${primary ? C.accent : C.border}`, borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>{label}</button>
  );

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1100, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: C.text }}>Transactions</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {btn('+ Add transaction', openModal, true)}
          {btn('↑ Import', () => alert('Import: upload a CSV with columns Date, Merchant, Category, Account, Amount.'))}
          {btn('↓ Export CSV', () => {
            const rows = [['Date','Merchant','Category','Account','Amount'], ...transactions.map(t => [t.date, t.merchant, t.category, t.account, t.amount.toString()])];
            const csv = rows.map(r => r.join(',')).join('\n');
            const a = document.createElement('a'); a.href = 'data:text/csv,' + encodeURIComponent(csv); a.download = 'transactions.csv'; a.click();
          })}
        </div>
      </div>

      {/* Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.text3, fontSize: 16 }}>🔍</span>
          <input
            value={search} onChange={e => handleSearch(e.target.value)}
            placeholder="Search transactions…"
            style={{ width: '100%', padding: '9px 12px 9px 38px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13.5, color: C.text, outline: 'none', background: C.surface, boxSizing: 'border-box' }}
          />
        </div>
        {(search || catFilter !== 'All') && btn('Clear filters', clearFilters)}
      </div>

      {/* Chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {cats.map(c => (
          <button key={c} onClick={() => handleCat(c)} style={{ padding: '6px 14px', borderRadius: 99, border: `1px solid ${c === catFilter ? C.text : C.border}`, background: c === catFilter ? C.text : C.surface, color: c === catFilter ? '#fff' : C.text2, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>{c}</button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: R, overflow: 'hidden', boxShadow: C.shadow }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}`, background: '#f8f7f4' }}>
              {['Merchant', 'Date', 'Category', 'Account', 'Amount', ''].map((h, i) => (
                <th key={i} style={{ padding: '11px 16px', textAlign: i === 4 ? 'right' : 'left', fontSize: 12, fontWeight: 700, color: C.text2, letterSpacing: '.04em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: C.text2 }}>No transactions match your filters.</td></tr>
            ) : pageRows.map(t => {
              const cs = catStyle(t.category);
              const isIncome = t.amount > 0;
              return (
                <tr key={t.id} style={{ borderBottom: '1px solid #f4f1ec' }}>
                  <td style={{ padding: '13px 16px', fontSize: 13.5, color: C.text }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f3f0eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{t.icon}</div>
                      <span style={{ fontWeight: 500 }}>{t.merchant}</span>
                    </div>
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: C.text2 }}>{fmtDate(t.date)}</td>
                  <td style={{ padding: '13px 16px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: cs.bg, color: cs.color, padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 500 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cs.dot, flexShrink: 0, display: 'inline-block' }} />
                      {t.category}
                    </span>
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: C.text2 }}>{t.account}</td>
                  <td style={{ padding: '13px 16px', textAlign: 'right', fontWeight: 600, fontSize: 13.5, color: isIncome ? '#16a34a' : C.text }}>{fmtAmt(t.amount)}</td>
                  <td style={{ padding: '13px 16px' }}>
                    <button onClick={() => deleteTransaction(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: C.text3, lineHeight: 1 }} title="Delete">×</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderTop: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 13, color: C.text2 }}>
            {filtered.length === 0
              ? 'No transactions found'
              : `Showing ${(safePage - 1) * PER_PAGE + 1}–${Math.min(safePage * PER_PAGE, filtered.length)} of ${filtered.length} transaction${filtered.length !== 1 ? 's' : ''}`}
          </div>
          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: 4 }}>
              <button disabled={safePage === 1} onClick={() => setPage(p => p - 1)}
                style={{ padding: '4px 10px', border: `1px solid ${C.border}`, borderRadius: 6, background: C.surface, cursor: safePage === 1 ? 'default' : 'pointer', color: safePage === 1 ? C.text3 : C.text, fontSize: 13 }}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  style={{ padding: '4px 10px', border: `1px solid ${p === safePage ? C.text : C.border}`, borderRadius: 6, background: p === safePage ? C.text : C.surface, color: p === safePage ? '#fff' : C.text2, cursor: 'pointer', fontSize: 13, fontWeight: p === safePage ? 700 : 400 }}>{p}</button>
              ))}
              <button disabled={safePage === totalPages} onClick={() => setPage(p => p + 1)}
                style={{ padding: '4px 10px', border: `1px solid ${C.border}`, borderRadius: 6, background: C.surface, cursor: safePage === totalPages ? 'default' : 'pointer', color: safePage === totalPages ? C.text3 : C.text, fontSize: 13 }}>›</button>
            </div>
          )}
        </div>
      </div>

      {/* Add Transaction Modal */}
      {modal && (
        <div onClick={e => { if (e.target === e.currentTarget) setModal(false); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: C.surface, borderRadius: 16, width: '100%', maxWidth: 480, boxShadow: '0 8px 40px rgba(0,0,0,.18)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontWeight: 700, fontSize: 16, color: C.text }}>Add Transaction</span>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: C.text2 }}>×</button>
            </div>
            <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.text2, display: 'block', marginBottom: 5 }}>Date</label>
                  <input ref={dateRef} type="date" defaultValue={today}
                    style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.text2, display: 'block', marginBottom: 5 }}>Type</label>
                  <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: `1px solid ${C.border}` }}>
                    {(['expense', 'income'] as const).map(tp => (
                      <button key={tp} onClick={() => setTxnType(tp)}
                        style={{ flex: 1, padding: '9px 0', background: txnType === tp ? C.text : C.surface, color: txnType === tp ? '#fff' : C.text2, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, textTransform: 'capitalize' }}>{tp}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.text2, display: 'block', marginBottom: 5 }}>Merchant / Description</label>
                <input ref={merchantRef} type="text" placeholder="e.g. Whole Foods"
                  style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.text2, display: 'block', marginBottom: 5 }}>Category</label>
                  <select ref={catRef} style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', fontSize: 14, outline: 'none', background: C.surface }}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.text2, display: 'block', marginBottom: 5 }}>Account</label>
                  <select ref={accRef} style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', fontSize: 14, outline: 'none', background: C.surface }}>
                    {ACCOUNTS.map(a => <option key={a}>{a}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.text2, display: 'block', marginBottom: 5 }}>Amount</label>
                  <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
                    <span style={{ padding: '0 10px', color: C.text2, fontSize: 13 }}>$</span>
                    <input ref={amtRef} type="number" min="0" step="0.01" placeholder="0.00"
                      style={{ flex: 1, border: 'none', padding: '9px 8px', fontSize: 14, outline: 'none' }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.text2, display: 'block', marginBottom: 5 }}>Notes (optional)</label>
                  <input ref={notesRef} type="text" placeholder="Optional note"
                    style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, padding: '14px 22px', borderTop: `1px solid ${C.border}`, justifyContent: 'flex-end' }}>
              <button onClick={() => setModal(false)} style={{ padding: '9px 20px', border: `1px solid ${C.border}`, borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', background: C.surface }}>Cancel</button>
              <button onClick={save} style={{ padding: '9px 20px', background: C.accent, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Add Transaction</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
