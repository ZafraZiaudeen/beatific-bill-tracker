import { useMemo, useRef, useState } from 'react';
import { PageIntroBanner } from '../components/PageIntroBanner';
import { useLedgerlyStore } from '../store/useLedgerlyStore';
import { fmt, fmtTimeAgo, fmtYMFull } from '../utils/formatters';
import { AccountDialog } from '../dialogs/AccountDialog';
import type { Account, AccountVisibilityScope } from '../types';
import { ACCOUNT_GROUP_ORDER, accountGroupForType, accountVisibleIn, normalizeAccountType } from '../utils/accounts';
import flower02 from '../../../assets/budget-assets/flowers-and-leaves/flowers-and-leaves-02.png';
import flower04 from '../../../assets/budget-assets/flowers-and-leaves/flowers-and-leaves-04.png';
import sprig03 from '../../../assets/budget-assets/botanical-sprigs/botanical-sprigs-03.png';
import heart01 from '../../../assets/budget-assets/hearts/heart-01.png';

const GROUP_CFG: Record<string, { icon: string; color: string; bg: string }> = {
  Cash: { icon: '💵', color: '#4a7060', bg: 'rgba(122,158,126,.15)' },
  'Credit cards': { icon: '💳', color: '#a05050', bg: 'rgba(196,138,138,.15)' },
  Loans: { icon: '🎓', color: '#8a6020', bg: 'rgba(196,163,90,.15)' },
  'Other assets': { icon: '🏠', color: '#3a6e96', bg: 'rgba(107,158,196,.15)' },
};

const IMPORT_FIELDS = [
  { key: 'name', label: 'Account name' },
  { key: 'balance', label: 'Current balance' },
  { key: 'type', label: 'Type' },
  { key: 'institution', label: 'Institution' },
  { key: 'accountNumber', label: 'Last 4' },
  { key: 'openingBalance', label: 'Opening balance' },
  { key: 'lastUpdated', label: 'Last updated' },
] as const;

type ImportField = typeof IMPORT_FIELDS[number]['key'];
type ColumnMap = Partial<Record<ImportField, string>>;

function parseDelimited(text: string) {
  const delimiter = text.includes('\t') ? '\t' : ',';
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];
    if (ch === '"' && quoted && next === '"') {
      cell += '"';
      i += 1;
    } else if (ch === '"') {
      quoted = !quoted;
    } else if (ch === delimiter && !quoted) {
      row.push(cell.trim());
      cell = '';
    } else if ((ch === '\n' || ch === '\r') && !quoted) {
      if (ch === '\r' && next === '\n') i += 1;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += ch;
    }
  }
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function inferMapping(headers: string[]): ColumnMap {
  const find = (...needles: string[]) => headers.find(header => needles.some(needle => header.toLowerCase().includes(needle)));
  return {
    name: find('account', 'name'),
    balance: find('balance', 'current'),
    type: find('type'),
    institution: find('institution', 'bank'),
    accountNumber: find('last 4', 'last4', 'number'),
    openingBalance: find('opening'),
    lastUpdated: find('updated', 'date'),
  };
}

function parseMoney(value: string) {
  const cleaned = value.replace(/[$,\s]/g, '').replace(/^\((.*)\)$/, '-$1');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function fmtDate(isoStr: string) {
  try {
    return new Date(isoStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return isoStr;
  }
}

export function AccountsPage() {
  const accounts = useLedgerlyStore(s => s.accounts);
  const toggleVisibility = useLedgerlyStore(s => s.toggleVisibility);
  const setAccountVisibilityScope = useLedgerlyStore(s => s.setAccountVisibilityScope);
  const markReconciled = useLedgerlyStore(s => s.markReconciled);
  const deleteAccount = useLedgerlyStore(s => s.deleteAccount);
  const importAccountBalances = useLedgerlyStore(s => s.importAccountBalances);
  const currentMonth = useLedgerlyStore(s => s.currentMonth);

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [editAcc, setEditAcc] = useState<Account | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [importRows, setImportRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<ColumnMap>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const visibleNetWorthAccounts = accounts.filter(account => accountVisibleIn(account, 'networth'));
  const totalCash = accounts.filter(a => a.group === 'Cash' && accountVisibleIn(a, 'dashboard')).reduce((s, a) => s + a.balance, 0);
  const totalAssets = visibleNetWorthAccounts.filter(a => a.balance > 0).reduce((s, a) => s + a.balance, 0);
  const totalLiab = visibleNetWorthAccounts.filter(a => a.balance < 0).reduce((s, a) => s + Math.abs(a.balance), 0);
  const netWorth = totalAssets - totalLiab;
  const selected = accounts.find(a => a.id === selectedId) ?? null;
  const toggleGroup = (g: string) => setCollapsed(prev => ({ ...prev, [g]: !prev[g] }));

  const grouped = useMemo(() => {
    const groups = new Map<string, Account[]>();
    for (const account of accounts) {
      const group = account.group || 'Other assets';
      groups.set(group, [...(groups.get(group) ?? []), account]);
    }
    return [...ACCOUNT_GROUP_ORDER, ...[...groups.keys()].filter(group => !ACCOUNT_GROUP_ORDER.includes(group))]
      .map(groupName => ({ groupName, accounts: groups.get(groupName) ?? [] }))
      .filter(group => group.accounts.length > 0);
  }, [accounts]);

  const headers = importRows[0] ?? [];
  const previewRows = importRows.slice(1, 6);
  const mappedImport = importRows.slice(1).map(row => {
    const valueFor = (field: ImportField) => {
      const header = mapping[field];
      const index = header ? headers.indexOf(header) : -1;
      return index >= 0 ? row[index] ?? '' : '';
    };
    const name = valueFor('name').trim();
    const balance = parseMoney(valueFor('balance'));
    const type = normalizeAccountType(valueFor('type'));
    return {
      name,
      balance,
      type,
      institution: valueFor('institution').trim() || 'Imported',
      accountNumber: valueFor('accountNumber').trim(),
      openingBalance: valueFor('openingBalance') ? parseMoney(valueFor('openingBalance')) : balance,
      lastUpdated: valueFor('lastUpdated') || new Date().toISOString(),
      group: accountGroupForType(type),
    };
  }).filter(row => row.name);
  const importMatches = mappedImport.filter(row => accounts.some(account => account.name.toLowerCase() === row.name.toLowerCase())).length;

  function handleFile(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const rows = parseDelimited(String(reader.result ?? ''));
      setImportRows(rows);
      setMapping(inferMapping(rows[0] ?? []));
    };
    reader.readAsText(file);
  }

  function confirmImport() {
    if (!mapping.name || !mapping.balance) {
      alert('Please map at least Account name and Current balance.');
      return;
    }
    importAccountBalances(mappedImport);
    setShowImport(false);
    setImportRows([]);
    setMapping({});
  }

  const scopeLabels: Record<AccountVisibilityScope, string> = {
    dashboard: 'Dashboard',
    reports: 'Reports',
    networth: 'Net worth',
    budget: 'Budget',
  };

  return (
    <div className="ldg-acct-page">
      <PageIntroBanner view="accounts" />
      <div className="ldg-acct-header">
        <div>
          <div className="ldg-acct-title">Accounts <img src={heart01} alt="" /></div>
          <div className="ldg-acct-subtitle">Manual balances, reconciliation, and visibility for reliable net worth.</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="ldg-month-chip">📅 {fmtYMFull(currentMonth)}</div>
          <div className="ldg-privacy-badge">🔒 Local only · Nothing sent to any server</div>
        </div>
      </div>

      <div className="ldg-stat-row">
        <div className="ldg-stat-card ldg-stat-cream">
          <img src={flower02} alt="" className="ldg-stat-deco" />
          <div className="ldg-stat-inner">
            <div className="ldg-stat-icon ldg-stat-icon-leaf">💵</div>
            <div className="ldg-stat-label">Visible cash</div>
            <div className="ldg-stat-amount">{fmt(totalCash)}</div>
            <div className="ldg-stat-sub">{accounts.filter(a => a.group === 'Cash').length} cash accounts</div>
          </div>
        </div>
        <div className="ldg-stat-card ldg-stat-white">
          <img src={flower04} alt="" className="ldg-stat-deco" />
          <div className="ldg-stat-inner">
            <div className="ldg-stat-icon ldg-stat-icon-leaf">↗</div>
            <div className="ldg-stat-label">Visible assets</div>
            <div className="ldg-stat-amount">{fmt(totalAssets)}</div>
            <div className="ldg-stat-sub">{visibleNetWorthAccounts.filter(a => a.balance > 0).length} accounts</div>
          </div>
        </div>
        <div className="ldg-stat-card ldg-stat-blush">
          <img src={sprig03} alt="" className="ldg-stat-deco" />
          <div className="ldg-stat-inner">
            <div className="ldg-stat-icon ldg-stat-icon-cal">↘</div>
            <div className="ldg-stat-label">Visible liabilities</div>
            <div className="ldg-stat-amount">{fmt(totalLiab)}</div>
            <div className="ldg-stat-sub">{visibleNetWorthAccounts.filter(a => a.balance < 0).length} accounts</div>
          </div>
        </div>
        <div className="ldg-stat-card ldg-stat-white">
          <img src={heart01} alt="" className="ldg-stat-deco" />
          <div className="ldg-stat-inner">
            <div className="ldg-stat-icon ldg-stat-icon-leaf">♡</div>
            <div className="ldg-stat-label">Net worth</div>
            <div className="ldg-stat-amount" style={{ color: netWorth < 0 ? '#c46060' : 'var(--text)' }}>{fmt(Math.abs(netWorth))}</div>
            <div className="ldg-stat-sub">visibility-aware</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, margin: '16px 0', flexWrap: 'wrap' }}>
        <button className="ldg-goals-add-btn" onClick={() => { setEditAcc(null); setShowDialog(true); }}>
          ⊕ Add account manually
        </button>
        <button
          onClick={() => setShowImport(true)}
          style={{ background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 99, padding: '8px 18px', fontWeight: 600, fontSize: '.82rem', cursor: 'pointer' }}>
          ↑ Import balances
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? 'minmax(0, 1fr) 340px' : '1fr', gap: 16, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {grouped.map(({ groupName, accounts: grpAccounts }) => {
            const cfg = GROUP_CFG[groupName] ?? { icon: '💰', color: '#6b7280', bg: '#f3f4f6' };
            const grpTotal = grpAccounts.reduce((s, a) => s + a.balance, 0);
            const isOpen = !collapsed[groupName];
            return (
              <div key={groupName} className="ldg-acct-grp-card">
                <div className={`ldg-acct-grp-hdr${isOpen ? '' : ' ldg-acct-grp-hdr-collapsed'}`} onClick={() => toggleGroup(groupName)}>
                  <div className="ldg-acct-grp-icon" style={{ background: cfg.bg, color: cfg.color }}>{cfg.icon}</div>
                  <span className="ldg-acct-grp-name">{groupName}</span>
                  <span className="ldg-acct-grp-meta">{grpAccounts.length} account{grpAccounts.length !== 1 ? 's' : ''}</span>
                  <span className="ldg-acct-grp-total" style={{ color: grpTotal < 0 ? '#c46060' : 'var(--text)' }}>
                    {grpTotal < 0 ? '-' : ''}{fmt(Math.abs(grpTotal))}
                  </span>
                  <span className="ldg-acct-grp-chevron" style={{ transform: isOpen ? 'none' : 'rotate(-90deg)' }}>▾</span>
                </div>
                {isOpen && (
                  <table className="ldg-acct-table">
                    <thead>
                      <tr style={{ background: 'rgba(240,244,240,.5)' }}>
                        {['Account', 'Balance', 'Type', 'Last updated', 'Reconciled', 'Visibility'].map(h => (
                          <th key={h} className="ldg-acct-th">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {grpAccounts.map(a => {
                        const balNeg = a.balance < 0;
                        return (
                          <tr key={a.id} className={`ldg-acct-tr${selectedId === a.id ? ' selected' : ''}`} onClick={() => setSelectedId(selectedId === a.id ? null : a.id)}>
                            <td className="ldg-acct-td">
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div className="ldg-acct-icon" style={{ background: cfg.bg, color: cfg.color }}>{cfg.icon}</div>
                                <div>
                                  <div className="ldg-acct-acc-name">{a.name}</div>
                                  <div className="ldg-acct-acc-inst">{a.institution}{a.accountNumber ? ` · ${a.accountNumber}` : ''}</div>
                                </div>
                              </div>
                            </td>
                            <td className="ldg-acct-td" style={{ fontWeight: 600, color: balNeg ? '#c46060' : 'var(--text)' }}>{balNeg ? '-' : ''}{fmt(Math.abs(a.balance))}</td>
                            <td className="ldg-acct-td"><span style={{ background: 'rgba(200,210,200,.3)', borderRadius: 99, padding: '3px 9px', fontSize: '.72rem', fontWeight: 500, color: 'var(--text2)' }}>{a.type}</span></td>
                            <td className="ldg-acct-td">
                              <div style={{ fontSize: '.78rem', color: 'var(--text2)' }}>{fmtDate(a.lastUpdated)}</div>
                              <div style={{ fontSize: '.70rem', color: 'var(--text3)' }}>{fmtTimeAgo(a.lastUpdated)}</div>
                            </td>
                            <td className="ldg-acct-td">{a.reconciled ? '✓ Reconciled' : 'Needs review'}</td>
                            <td className="ldg-acct-td" style={{ textAlign: 'center' }}>
                              <button className="ldg-acct-vis-btn" onClick={e => { e.stopPropagation(); toggleVisibility(a.id); }} title={a.visibility ? 'Visible - click to hide everywhere' : 'Hidden - click to show everywhere'} style={{ opacity: a.visibility ? 1 : 0.45 }}>
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
          {accounts.length === 0 && (
            <div className="ldg-card" style={{ padding: 32, textAlign: 'center', color: 'var(--text3)', fontSize: '.85rem' }}>
              No accounts yet, add your first account to get started.
            </div>
          )}
        </div>

        {selected && (
          <div className="ldg-card ldg-acct-detail">
            <button className="ldg-acct-back" onClick={() => setSelectedId(null)}>← Back to accounts</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: GROUP_CFG[selected.group]?.bg ?? 'rgba(122,158,126,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                {GROUP_CFG[selected.group]?.icon ?? '💰'}
              </div>
              <div>
                <div className="ldg-acct-detail-name">{selected.name}</div>
                <div className="ldg-acct-detail-inst">{selected.institution}{selected.accountNumber ? ` · ${selected.accountNumber}` : ''}</div>
              </div>
            </div>

            <div>
              {[
                { label: 'Opening balance', value: (selected.openingBalance < 0 ? '-' : '') + fmt(Math.abs(selected.openingBalance)), sub: selected.openingDate },
                { label: 'Current balance', value: (selected.balance < 0 ? '-' : '') + fmt(Math.abs(selected.balance)), sub: fmtDate(selected.lastUpdated) },
              ].map(({ label, value, sub }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(200,210,195,.3)' }}>
                  <span style={{ fontSize: '.80rem', color: 'var(--text2)' }}>{label}</span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '.84rem', fontWeight: 600, color: 'var(--text)' }}>{value}</div>
                    <div style={{ fontSize: '.70rem', color: 'var(--text3)' }}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {(['dashboard', 'reports', 'networth', 'budget'] as AccountVisibilityScope[]).map(scope => (
              <label key={scope} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, fontSize: '.80rem', color: 'var(--text2)' }}>
                <span>Show in {scopeLabels[scope]}</span>
                <input
                  type="checkbox"
                  checked={accountVisibleIn(selected, scope)}
                  onChange={e => setAccountVisibilityScope(selected.id, scope, e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: '#6f8f72' }}
                />
              </label>
            ))}

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: selected.reconciled ? '#7a9e7e' : '#d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '.70rem', fontWeight: 700, flexShrink: 0 }}>
                {selected.reconciled ? '✓' : ''}
              </div>
              <div>
                <div style={{ fontSize: '.82rem', fontWeight: 600, color: selected.reconciled ? '#4a7060' : 'var(--text2)' }}>
                  {selected.reconciled ? 'Reconciled' : 'Not reconciled'}
                </div>
                <div style={{ fontSize: '.70rem', color: 'var(--text3)' }}>{selected.lastReconciledAt ? `Last reconciled ${fmtDate(selected.lastReconciledAt)}` : 'Balance needs review'}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button className="ldg-acct-edit-btn" onClick={() => { setEditAcc(selected); setShowDialog(true); }}>✏ Edit account</button>
              <button onClick={() => !selected.reconciled && markReconciled(selected.id)} disabled={selected.reconciled} className="ldg-acct-reconcile-btn">
                {selected.reconciled ? 'Reconciled' : 'Mark reconciled'}
              </button>
            </div>
            <button
              onClick={() => { if (confirm(`Delete ${selected.name}? Transactions will keep their historical account label.`)) { deleteAccount(selected.id); setSelectedId(null); } }}
              style={{ border: '1px solid rgba(196,96,96,.35)', background: 'rgba(196,96,96,.08)', color: '#a05050', borderRadius: 999, padding: '8px 12px', fontWeight: 700, cursor: 'pointer' }}
            >
              Delete account
            </button>
          </div>
        )}
      </div>

      {showImport && (
        <div onClick={e => { if (e.target === e.currentTarget) setShowImport(false); }} style={{ position: 'fixed', inset: 0, zIndex: 210, background: 'rgba(0,0,0,.45)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
          <div className="ldg-card" style={{ width: '100%', maxWidth: 760, maxHeight: '86vh', overflowY: 'auto', padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div>
                <div className="ldg-card-title">Import account balances</div>
                <div style={{ fontSize: '.78rem', color: 'var(--text3)' }}>CSV/TSV only. Files stay in your browser.</div>
              </div>
              <button onClick={() => setShowImport(false)} style={{ border: 0, background: 'transparent', fontSize: 22, cursor: 'pointer' }}>×</button>
            </div>
            <input ref={fileRef} type="file" accept=".csv,.tsv,text/csv,text/tab-separated-values" onChange={e => handleFile(e.target.files?.[0])} />
            {headers.length > 0 && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginTop: 16 }}>
                  {IMPORT_FIELDS.map(field => (
                    <label key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '.76rem', fontWeight: 700, color: 'var(--text2)' }}>
                      {field.label}
                      <select value={mapping[field.key] ?? ''} onChange={e => setMapping(prev => ({ ...prev, [field.key]: e.target.value || undefined }))} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px', background: 'var(--surface)', color: 'var(--text)' }}>
                        <option value="">Do not import</option>
                        {headers.map(header => <option key={header} value={header}>{header}</option>)}
                      </select>
                    </label>
                  ))}
                </div>
                <div style={{ marginTop: 14, fontSize: '.78rem', color: 'var(--text2)' }}>
                  Previewing {mappedImport.length} account row{mappedImport.length !== 1 ? 's' : ''}; {importMatches} likely update existing accounts.
                </div>
                <div style={{ overflowX: 'auto', marginTop: 10 }}>
                  <table className="ldg-acct-table">
                    <thead><tr>{headers.map(header => <th key={header} className="ldg-acct-th">{header}</th>)}</tr></thead>
                    <tbody>
                      {previewRows.map((row, idx) => (
                        <tr key={idx}>{headers.map((header, colIdx) => <td key={header} className="ldg-acct-td">{row[colIdx]}</td>)}</tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
                  <button onClick={() => { setImportRows([]); setMapping({}); if (fileRef.current) fileRef.current.value = ''; }} style={{ border: '1px solid var(--border)', background: 'var(--surface)', borderRadius: 999, padding: '8px 14px', cursor: 'pointer' }}>Clear</button>
                  <button className="ldg-goals-add-btn" onClick={confirmImport}>Import balances</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showDialog && <AccountDialog account={editAcc} onClose={() => { setShowDialog(false); setEditAcc(null); }} />}
    </div>
  );
}
