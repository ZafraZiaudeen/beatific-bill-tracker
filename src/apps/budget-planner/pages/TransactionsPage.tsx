import { useCallback, useMemo, useRef, useState } from 'react';
import { PageIntroBanner } from '../components/PageIntroBanner';
import { useLedgerlyStore } from '../store/useLedgerlyStore';
import type { BudgetCategory, Transaction } from '../types';
import heart02 from '../../../assets/budget-assets/hearts/heart-02.png';

const PER_PAGE = 10;
const CATEGORY_COLORS = ['#7a9e7e', '#c48a8a', '#c4a35a', '#9e8abe', '#6b9ec4', '#e89e6e'];

type TypeFilter = 'all' | 'income' | 'needs' | 'wants';
type MappingField = 'ignore' | 'date' | 'merchant' | 'amount' | 'category' | 'account' | 'notes' | 'type';

interface DraftTransaction {
  merchant: string;
  date: string;
  category: string;
  account: string;
  amount: string;
  notes: string;
  type: 'expense' | 'income';
}

interface ImportCandidate {
  row: string[];
  date: string;
  merchant: string;
  category: string;
  account: string;
  notes: string;
  amount: number;
  duplicate: boolean;
}

function monthBounds(ym: string) {
  const [year, month] = ym.split('-').map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  return {
    start: `${ym}-01`,
    end: `${ym}-${String(lastDay).padStart(2, '0')}`,
    label: new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
  };
}

function fmtDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function fmtAmt(amount: number): string {
  const abs = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${amount >= 0 ? '+' : '-'}$${abs}`;
}

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) & 0xffff;
  return CATEGORY_COLORS[Math.abs(hash) % CATEGORY_COLORS.length];
}

function parseDelimited(text: string, delimiter: ',' | '\t') {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"' && quoted && next === '"') {
      cell += '"';
      i++;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === delimiter && !quoted) {
      row.push(cell.trim());
      cell = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') i++;
      row.push(cell.trim());
      if (row.some(value => value !== '')) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  row.push(cell.trim());
  if (row.some(value => value !== '')) rows.push(row);
  return rows;
}

function parseAmount(raw: string) {
  const negativeParens = raw.includes('(') && raw.includes(')');
  const cleaned = raw.replace(/[$,\s()]/g, '');
  const amount = Number(cleaned);
  if (!Number.isFinite(amount)) return 0;
  return negativeParens ? -Math.abs(amount) : amount;
}

function parseDate(raw: string) {
  const value = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return new Date().toISOString().slice(0, 10);
  return parsed.toISOString().slice(0, 10);
}

function inferCategoryKind(category: BudgetCategory | undefined, transaction: Transaction | Pick<Transaction, 'amount'>) {
  if (transaction.amount > 0) return 'income';
  if (category?.kind) return category.kind;
  const group = category?.group?.toLowerCase() ?? '';
  if (group.includes('need')) return 'need';
  if (group.includes('want')) return 'want';
  return 'other';
}

function categoryDefaults(name: string, amount: number, index: number): Omit<BudgetCategory, 'id' | 'spent'> {
  const lower = name.toLowerCase();
  const isIncome = amount > 0 || lower.includes('income') || lower.includes('salary') || lower.includes('paycheck');
  const isDebt = lower.includes('debt') || lower.includes('credit') || lower.includes('loan');
  const isSaving = lower.includes('saving') || lower.includes('investment');
  const isWant = lower.includes('dining') || lower.includes('coffee') || lower.includes('shop') || lower.includes('entertain');
  const group = isIncome ? 'Income' : isDebt ? 'Debt' : isSaving ? 'Savings' : isWant ? 'Wants' : lower === 'other' ? 'Other' : 'Needs';
  const kind = isIncome ? 'income' : isDebt ? 'debt' : isSaving ? 'saving' : isWant ? 'want' : group === 'Other' ? 'other' : 'need';
  return {
    name,
    budget: 0,
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    group,
    kind,
    icon: isIncome ? '💼' : isDebt ? '💳' : isSaving ? '🌿' : isWant ? '♡' : '📌',
    archived: false,
  };
}

function transactionKey(t: Pick<Transaction, 'date' | 'merchant' | 'category' | 'account' | 'amount'>) {
  return [
    t.date,
    t.merchant.trim().toLowerCase(),
    t.category.trim().toLowerCase(),
    t.account.trim().toLowerCase(),
    t.amount.toFixed(2),
  ].join('|');
}

function TransactionModal({
  title,
  draft,
  categories,
  accounts,
  onChange,
  onClose,
  onSave,
}: {
  title: string;
  draft: DraftTransaction;
  categories: string[];
  accounts: string[];
  onChange: (draft: DraftTransaction) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <div className="ldg-txn-modal-backdrop" onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="ldg-txn-modal">
        <div className="ldg-txn-modal-header">
          <span>{title}</span>
          <button onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="ldg-txn-modal-body">
          <div className="ldg-txn-form-grid">
            <label>
              <span>Date</span>
              <input type="date" value={draft.date} onChange={event => onChange({ ...draft, date: event.target.value })} />
            </label>
            <label>
              <span>Type</span>
              <select value={draft.type} onChange={event => onChange({ ...draft, type: event.target.value as DraftTransaction['type'] })}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </label>
          </div>
          <label>
            <span>Merchant / Description</span>
            <input value={draft.merchant} onChange={event => onChange({ ...draft, merchant: event.target.value })} placeholder="e.g. Whole Foods" />
          </label>
          <div className="ldg-txn-form-grid">
            <label>
              <span>Category</span>
              <select value={draft.category} onChange={event => onChange({ ...draft, category: event.target.value })}>
                {categories.map(category => <option key={category}>{category}</option>)}
              </select>
            </label>
            <label>
              <span>Account</span>
              <select value={draft.account} onChange={event => onChange({ ...draft, account: event.target.value })}>
                {accounts.map(account => <option key={account}>{account}</option>)}
              </select>
            </label>
          </div>
          <div className="ldg-txn-form-grid">
            <label>
              <span>Amount</span>
              <input type="number" min="0" step="0.01" value={draft.amount} onChange={event => onChange({ ...draft, amount: event.target.value })} placeholder="0.00" />
            </label>
            <label>
              <span>Notes</span>
              <input value={draft.notes} onChange={event => onChange({ ...draft, notes: event.target.value })} placeholder="Optional note" />
            </label>
          </div>
        </div>
        <div className="ldg-txn-modal-footer">
          <button className="ldg-txn-btn-outline" onClick={onClose}>Cancel</button>
          <button className="ldg-txn-btn-primary" onClick={onSave}>Save transaction</button>
        </div>
      </div>
    </div>
  );
}

export function TransactionsPage() {
  const transactions = useLedgerlyStore(s => s.transactions);
  const addTransaction = useLedgerlyStore(s => s.addTransaction);
  const updateTransaction = useLedgerlyStore(s => s.updateTransaction);
  const deleteTransaction = useLedgerlyStore(s => s.deleteTransaction);
  const addCategory = useLedgerlyStore(s => s.addCategory);
  const accounts = useLedgerlyStore(s => s.accounts);
  const categories = useLedgerlyStore(s => s.categories);
  const currentMonth = useLedgerlyStore(s => s.currentMonth);

  const bounds = monthBounds(currentMonth);
  const accountNames = useMemo(
    () => (accounts.length ? accounts.map(account => account.name) : ['Default Account']),
    [accounts],
  );
  const categoryNames = useMemo(() => {
    const activeCategories = categories.filter(category => !category.archived);
    return activeCategories.length ? activeCategories.map(category => category.name) : ['Other'];
  }, [categories]);
  const categoryByName = useMemo(() => {
    const map = new Map<string, BudgetCategory>();
    categories.forEach(category => map.set(category.name.toLowerCase(), category));
    return map;
  }, [categories]);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [accountFilter, setAccountFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [startDate, setStartDate] = useState(bounds.start);
  const [endDate, setEndDate] = useState(bounds.end);
  const [page, setPage] = useState(1);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<DraftTransaction>({
    merchant: '',
    date: new Date().toISOString().slice(0, 10),
    category: categoryNames[0] ?? 'Other',
    account: accountNames[0] ?? 'Default Account',
    amount: '',
    notes: '',
    type: 'expense',
  });

  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState('');
  const [importRows, setImportRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<number, MappingField>>({});
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [importError, setImportError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const categoryOptions = useMemo(
    () => Array.from(new Set([...categoryNames, ...transactions.map(t => t.category), 'Other'])).sort(),
    [categoryNames, transactions],
  );
  const accountOptions = useMemo(
    () => Array.from(new Set([...accountNames, ...transactions.map(t => t.account)])).sort(),
    [accountNames, transactions],
  );

  const filtered = useMemo(() => transactions.filter(transaction => {
    const query = search.trim().toLowerCase();
    const category = categoryByName.get(transaction.category.toLowerCase());
    const kind = inferCategoryKind(category, transaction);
    const matchesSearch = !query
      || transaction.merchant.toLowerCase().includes(query)
      || transaction.category.toLowerCase().includes(query)
      || (transaction.notes ?? '').toLowerCase().includes(query);
    const matchesCategory = categoryFilter === 'all' || transaction.category === categoryFilter;
    const matchesAccount = accountFilter === 'all' || transaction.account === accountFilter;
    const matchesDate = (!startDate || transaction.date >= startDate) && (!endDate || transaction.date <= endDate);
    const matchesType =
      typeFilter === 'all'
        || (typeFilter === 'income' && transaction.amount > 0)
        || (typeFilter === 'needs' && kind === 'need')
        || (typeFilter === 'wants' && kind === 'want');
    return matchesSearch && matchesCategory && matchesAccount && matchesDate && matchesType;
  }), [accountFilter, categoryByName, categoryFilter, endDate, search, startDate, transactions, typeFilter]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const safePage = Math.min(page, Math.max(1, totalPages));
  const pageRows = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);
  const importHeaders = importRows[0] ?? [];

  const importCandidates = useMemo<ImportCandidate[]>(() => {
    if (importRows.length < 2) return [];
    const existing = new Set(transactions.map(transactionKey));
    const seen = new Set<string>();
    return importRows.slice(1).map(row => {
      const get = (field: MappingField) => {
        const index = Object.entries(mapping).find(([, mapped]) => mapped === field)?.[0];
        return index === undefined ? '' : row[Number(index)] ?? '';
      };
      const rawAmount = parseAmount(get('amount'));
      const rawType = get('type').toLowerCase();
      const signedAmount =
        rawType.includes('income') || rawType.includes('credit') || rawType.includes('deposit')
          ? Math.abs(rawAmount)
          : rawType.includes('expense') || rawType.includes('debit') || rawType.includes('payment')
            ? -Math.abs(rawAmount)
            : rawAmount;
      const candidate = {
        row,
        date: parseDate(get('date')),
        merchant: get('merchant') || 'Imported transaction',
        category: get('category') || (signedAmount > 0 ? 'Income' : 'Other'),
        account: get('account') || accountNames[0] || 'Default Account',
        notes: get('notes'),
        amount: signedAmount,
        duplicate: false,
      };
      const key = transactionKey(candidate);
      candidate.duplicate = existing.has(key) || seen.has(key);
      seen.add(key);
      return candidate;
    }).filter(candidate => candidate.merchant && candidate.amount !== 0);
  }, [accountNames, importRows, mapping, transactions]);

  const duplicateCount = importCandidates.filter(candidate => candidate.duplicate).length;
  const importableCount = importCandidates.filter(candidate => !skipDuplicates || !candidate.duplicate).length;

  const openAdd = () => {
    setEditingId(null);
    setDraft({
      merchant: '',
      date: new Date().toISOString().slice(0, 10),
      category: categoryNames[0] ?? 'Other',
      account: accountNames[0] ?? 'Default Account',
      amount: '',
      notes: '',
      type: 'expense',
    });
    setModalMode('add');
  };

  const openEdit = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setDraft({
      merchant: transaction.merchant,
      date: transaction.date,
      category: transaction.category,
      account: transaction.account,
      amount: String(Math.abs(transaction.amount)),
      notes: transaction.notes ?? '',
      type: transaction.amount >= 0 ? 'income' : 'expense',
    });
    setModalMode('edit');
  };

  const saveDraft = () => {
    const merchant = draft.merchant.trim();
    const amount = Number(draft.amount);
    if (!merchant || !draft.date || !Number.isFinite(amount) || amount <= 0) {
      window.alert('Please fill in merchant, date, and a positive amount.');
      return;
    }
    const payload = {
      merchant,
      icon: merchant[0].toUpperCase(),
      date: draft.date,
      category: draft.category || 'Other',
      account: draft.account || 'Default Account',
      amount: draft.type === 'income' ? amount : -amount,
      notes: draft.notes.trim(),
    };
    if (modalMode === 'edit' && editingId) updateTransaction(editingId, payload);
    else addTransaction(payload);
    setModalMode(null);
    setPage(1);
  };

  const handleImportFile = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? '');
      const delimiter: ',' | '\t' = text.split('\n')[0]?.includes('\t') ? '\t' : ',';
      const rows = parseDelimited(text, delimiter);
      if (rows.length < 2) {
        setImportError('This file needs a header row and at least one transaction row.');
        return;
      }
      const headers = rows[0];
      const autoMap: Record<number, MappingField> = {};
      headers.forEach((header, index) => {
        const lower = header.toLowerCase();
        if (lower.includes('date')) autoMap[index] = 'date';
        else if (lower.includes('merchant') || lower.includes('description') || lower.includes('payee')) autoMap[index] = 'merchant';
        else if (lower.includes('amount') || lower.includes('debit') || lower.includes('credit')) autoMap[index] = 'amount';
        else if (lower.includes('category')) autoMap[index] = 'category';
        else if (lower.includes('account')) autoMap[index] = 'account';
        else if (lower.includes('note') || lower.includes('memo')) autoMap[index] = 'notes';
        else if (lower.includes('type')) autoMap[index] = 'type';
        else autoMap[index] = 'ignore';
      });
      setImportFile(file.name);
      setImportRows(rows);
      setMapping(autoMap);
      setImportError('');
      setImportOpen(true);
    };
    reader.readAsText(file);
    event.currentTarget.value = '';
  }, []);

  const confirmImport = () => {
    const knownCategories = new Set(categories.map(category => category.name.toLowerCase()));
    const missingCategories = new Map<string, Omit<BudgetCategory, 'id' | 'spent'>>();
    importCandidates.forEach((candidate, index) => {
      if (skipDuplicates && candidate.duplicate) return;
      const key = candidate.category.toLowerCase();
      if (!knownCategories.has(key) && !missingCategories.has(key)) {
        missingCategories.set(key, categoryDefaults(candidate.category, candidate.amount, index));
      }
    });
    missingCategories.forEach(category => addCategory(category));
    importCandidates.forEach(candidate => {
      if (skipDuplicates && candidate.duplicate) return;
      addTransaction({
        merchant: candidate.merchant,
        icon: candidate.merchant[0].toUpperCase(),
        date: candidate.date,
        category: candidate.category,
        account: candidate.account,
        amount: candidate.amount,
        notes: candidate.notes,
      });
    });
    setImportOpen(false);
    setImportRows([]);
    setImportFile('');
    setMapping({});
    setPage(1);
  };

  const exportCsv = () => {
    const rows = [
      ['Date', 'Merchant', 'Category', 'Account', 'Amount', 'Type', 'Notes'],
      ...transactions.map(transaction => [
        transaction.date,
        transaction.merchant,
        transaction.category,
        transaction.account,
        transaction.amount.toString(),
        transaction.amount >= 0 ? 'income' : 'expense',
        transaction.notes ?? '',
      ]),
    ];
    const csv = rows.map(row => row.map(cell => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ledgerly-transactions.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="ldg-txn-page">
      <PageIntroBanner view="transactions" />
      <div className="ldg-txn-header">
        <div>
          <div className="ldg-txn-title">Transactions <img src={heart02} alt="" /></div>
          <div className="ldg-txn-subtitle">Track spending, income, imports, and category flow from one local ledger.</div>
        </div>
        <div className="ldg-txn-header-badges">
          <div className="ldg-month-chip">📅 {bounds.label}</div>
          <div className="ldg-privacy-badge">🔒 Local only · Nothing sent to any server</div>
        </div>
      </div>

      <div className="ldg-txn-actions">
        <button className="ldg-txn-btn-primary" onClick={openAdd}>+ Add transaction</button>
        <button className="ldg-txn-btn-outline" onClick={() => fileRef.current?.click()}>↑ Import CSV/TSV</button>
        <button className="ldg-txn-btn-outline" onClick={exportCsv}>↓ Export CSV</button>
        <input ref={fileRef} type="file" accept=".csv,.tsv,.txt,text/csv,text/tab-separated-values" hidden onChange={handleImportFile} />
      </div>

      <div className="ldg-txn-filters">
        {(['all', 'income', 'needs', 'wants'] as TypeFilter[]).map(filter => (
          <button
            key={filter}
            className={`ldg-txn-type-pill${typeFilter === filter ? ' active' : ''}`}
            onClick={() => { setTypeFilter(filter); setPage(1); }}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
        <select className="ldg-txn-cat-select" value={categoryFilter} onChange={event => { setCategoryFilter(event.target.value); setPage(1); }}>
          <option value="all">All categories</option>
          {categoryOptions.map(category => <option key={category}>{category}</option>)}
        </select>
        <select className="ldg-txn-cat-select" value={accountFilter} onChange={event => { setAccountFilter(event.target.value); setPage(1); }}>
          <option value="all">All accounts</option>
          {accountOptions.map(account => <option key={account}>{account}</option>)}
        </select>
        <input className="ldg-txn-date-input" type="date" value={startDate} onChange={event => { setStartDate(event.target.value); setPage(1); }} aria-label="Start date" />
        <input className="ldg-txn-date-input" type="date" value={endDate} onChange={event => { setEndDate(event.target.value); setPage(1); }} aria-label="End date" />
        <div className="ldg-txn-search-wrap">
          <span>⌕</span>
          <input className="ldg-txn-search" placeholder="Search merchant, category, note..." value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} />
        </div>
      </div>

      <div className="ldg-card ldg-txn-table-wrap">
        <table className="ldg-txn-table">
          <thead>
            <tr>
              <th className="ldg-txn-th">Merchant</th>
              <th className="ldg-txn-th">Date</th>
              <th className="ldg-txn-th">Category</th>
              <th className="ldg-txn-th">Account</th>
              <th className="ldg-txn-th ldg-txn-th-right">Amount</th>
              <th className="ldg-txn-th">Notes</th>
              <th className="ldg-txn-th">Action</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr><td colSpan={7} className="ldg-txn-empty">No transactions match your filters.</td></tr>
            ) : pageRows.map(transaction => {
              const category = categoryByName.get(transaction.category.toLowerCase());
              const kind = inferCategoryKind(category, transaction);
              return (
                <tr key={transaction.id} className="ldg-txn-tr">
                  <td className="ldg-txn-td">
                    <div className="ldg-txn-merchant-cell">
                      <div className="ldg-txn-avatar" style={{ background: avatarColor(transaction.merchant) }}>{transaction.icon || transaction.merchant[0]}</div>
                      <span className="ldg-txn-merchant-name">{transaction.merchant}</span>
                    </div>
                  </td>
                  <td className="ldg-txn-td" data-label="Date">{fmtDate(transaction.date)}</td>
                  <td className="ldg-txn-td" data-label="Category">
                    <div className="ldg-txn-cat-cell">
                      <span className="ldg-txn-cat-icon" style={{ color: category?.color }}>{category?.icon ?? '📌'}</span>
                      <div>
                        <div className="ldg-txn-cat-name">{transaction.category}</div>
                        <div className="ldg-txn-cat-type">{kind}</div>
                      </div>
                    </div>
                  </td>
                  <td className="ldg-txn-td" data-label="Account">{transaction.account}</td>
                  <td className={`ldg-txn-td ${transaction.amount >= 0 ? 'ldg-txn-amt-income' : 'ldg-txn-amt-expense'}`} data-label="Amount">{fmtAmt(transaction.amount)}</td>
                  <td className="ldg-txn-td" data-label="Notes"><span className="ldg-txn-notes">{transaction.notes}</span></td>
                  <td className="ldg-txn-td ldg-txn-row-actions">
                    <button className="ldg-txn-row-btn" onClick={() => openEdit(transaction)}>Edit</button>
                    <button className="ldg-txn-row-btn danger" onClick={() => window.confirm('Delete this transaction?') && deleteTransaction(transaction.id)}>Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="ldg-txn-footer">
          <span className="ldg-txn-count">
            {filtered.length === 0
              ? 'No transactions found'
              : `Showing ${(safePage - 1) * PER_PAGE + 1}-${Math.min(safePage * PER_PAGE, filtered.length)} of ${filtered.length} transactions`}
          </span>
          {totalPages > 1 && (
            <div className="ldg-txn-pagination">
              <button className="ldg-txn-page-btn" disabled={safePage === 1} onClick={() => setPage(pageValue => pageValue - 1)}>‹</button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(pageNumber => (
                <button key={pageNumber} className={`ldg-txn-page-btn${pageNumber === safePage ? ' active' : ''}`} onClick={() => setPage(pageNumber)}>{pageNumber}</button>
              ))}
              <button className="ldg-txn-page-btn" disabled={safePage === totalPages} onClick={() => setPage(pageValue => pageValue + 1)}>›</button>
            </div>
          )}
        </div>
      </div>

      {modalMode && (
        <TransactionModal
          title={modalMode === 'edit' ? 'Edit Transaction' : 'Add Transaction'}
          draft={draft}
          categories={categoryOptions}
          accounts={accountOptions}
          onChange={setDraft}
          onClose={() => setModalMode(null)}
          onSave={saveDraft}
        />
      )}

      {importOpen && (
        <div className="ldg-txn-drawer-backdrop" onClick={event => { if (event.target === event.currentTarget) setImportOpen(false); }}>
          <aside className="ldg-txn-import-drawer">
            <div className="ldg-txn-drawer-header">
              <div>
                <span className="ldg-budget-section-kicker">Local import</span>
                <h2>Map spreadsheet columns</h2>
                <p>{importFile || 'CSV/TSV file'} stays on this device.</p>
              </div>
              <button onClick={() => setImportOpen(false)} aria-label="Close import drawer">×</button>
            </div>

            {importError && <div className="ldg-txn-import-error">{importError}</div>}

            <div className="ldg-txn-map-list">
              {importHeaders.map((header, index) => (
                <label key={`${header}-${index}`}>
                  <span>{header || `Column ${index + 1}`}</span>
                  <select value={mapping[index] ?? 'ignore'} onChange={event => setMapping(current => ({ ...current, [index]: event.target.value as MappingField }))}>
                    <option value="ignore">Ignore</option>
                    <option value="date">Date</option>
                    <option value="merchant">Merchant</option>
                    <option value="amount">Amount</option>
                    <option value="category">Category</option>
                    <option value="account">Account</option>
                    <option value="notes">Notes</option>
                    <option value="type">Type</option>
                  </select>
                </label>
              ))}
            </div>

            <div className="ldg-txn-import-summary">
              <strong>{importableCount}</strong>
              <span>ready to import</span>
              <strong>{duplicateCount}</strong>
              <span>possible duplicates</span>
            </div>

            <label className="ldg-txn-skip-row">
              <input type="checkbox" checked={skipDuplicates} onChange={event => setSkipDuplicates(event.target.checked)} />
              Skip possible duplicates
            </label>

            <div className="ldg-txn-preview-scroll">
              <table className="ldg-txn-preview-table">
                <thead>
                  <tr><th>Date</th><th>Merchant</th><th>Category</th><th>Account</th><th>Amount</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {importCandidates.slice(0, 8).map((candidate, index) => (
                    <tr key={`${candidate.date}-${candidate.merchant}-${index}`} className={candidate.duplicate ? 'is-duplicate' : ''}>
                      <td>{candidate.date}</td>
                      <td>{candidate.merchant}</td>
                      <td>{candidate.category}</td>
                      <td>{candidate.account}</td>
                      <td>{fmtAmt(candidate.amount)}</td>
                      <td>{candidate.duplicate ? 'Duplicate' : 'New'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="ldg-txn-drawer-footer">
              <button className="ldg-txn-btn-outline" onClick={() => fileRef.current?.click()}>Choose another</button>
              <button
                className="ldg-txn-btn-primary"
                disabled={importableCount === 0 || !Object.values(mapping).includes('date') || !Object.values(mapping).includes('merchant') || !Object.values(mapping).includes('amount')}
                onClick={confirmImport}
              >
                Import transactions
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
