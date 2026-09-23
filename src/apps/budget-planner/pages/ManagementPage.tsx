import { useState } from 'react';
import { sha256 } from '@/lib/crypto';
import type { LedgerlyView } from '../types';

const LDG_HASH_SALT = 'ldg-lic-v1';
const REGISTRY_KEY = 'ldg-license-registry';

const LOCKABLE_VIEWS: { view: LedgerlyView; label: string; emoji: string }[] = [
  { view: 'dashboard',    label: 'Dashboard',      emoji: '🏠' },
  { view: 'budget',       label: 'Budget',         emoji: '📊' },
  { view: 'transactions', label: 'Transactions',   emoji: '💳' },
  { view: 'bills',        label: 'Bills',          emoji: '📅' },
  { view: 'accounts',     label: 'Accounts',       emoji: '🏦' },
  { view: 'goals',        label: 'Goals & Debt',   emoji: '🎯' },
  { view: 'networth',     label: 'Net Worth',      emoji: '📈' },
  { view: 'reports',      label: 'Reports',        emoji: '📋' },
  { view: 'categories',   label: 'Categories',     emoji: '🗂️' },
];

interface LicenseRecord {
  id: string;
  customer: string;
  code: string;
  hash: string;
  date: string;
  lockedViews?: LedgerlyView[];
}

function loadRegistry(): LicenseRecord[] {
  try {
    return JSON.parse(localStorage.getItem(REGISTRY_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveRegistry(records: LicenseRecord[]) {
  localStorage.setItem(REGISTRY_KEY, JSON.stringify(records));
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(byte => chars[byte % chars.length])
    .join('');
}

async function buildBudgetPlannerHtml(hash: string, lockedViews: LedgerlyView[]): Promise<string> {
  const res = await fetch('/customer-budget-build/budget-planner-app.html');
  if (!res.ok) throw new Error('Budget Planner customer build not found. Run: npm run build:customer-budget');
  const html = await res.text();
  const inject = `<script>window.__LDG_LICENSE_HASH__="${hash}";window.__LDG_LOCKED_VIEWS__=${JSON.stringify(lockedViews)};</script>`;
  const idx = html.lastIndexOf('</head>');
  return html.slice(0, idx) + inject + '\n' + html.slice(idx);
}

function downloadHtml(html: string, filename: string) {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function filenameFor(customer: string) {
  const name = customer === '-' ? 'customer' : customer;
  return `budget-planner-${name.toLowerCase().replace(/\s+/g, '-')}.html`;
}

export function ManagementPage() {
  const [tab, setTab] = useState<'generate' | 'history'>('generate');
  const [customer, setCustomer] = useState('');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('');
  const [generating, setGenerating] = useState(false);
  const [records, setRecords] = useState<LicenseRecord[]>(loadRegistry);
  const [lockedViews, setLockedViews] = useState<LedgerlyView[]>([]);

  const handleGenerate = async () => {
    const trimmedCode = code.trim();
    if (!trimmedCode) {
      setStatus('Enter a license code first.');
      return;
    }
    setGenerating(true);
    setStatus('');
    try {
      const hash = await sha256(LDG_HASH_SALT + trimmedCode);
      const html = await buildBudgetPlannerHtml(hash, lockedViews);
      const record: LicenseRecord = {
        id: crypto.randomUUID(),
        customer: customer.trim() || '-',
        code: trimmedCode,
        hash,
        date: new Date().toISOString(),
      };
      downloadHtml(html, filenameFor(record.customer));
      const next = [{ ...record, lockedViews }, ...loadRegistry()];
      saveRegistry(next);
      setRecords(next);
      setCustomer('');
      setCode('');
      setTab('history');
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Failed to generate HTML.');
    } finally {
      setGenerating(false);
    }
  };

  const handleRedownload = async (record: LicenseRecord) => {
    try {
      downloadHtml(await buildBudgetPlannerHtml(record.hash, record.lockedViews ?? []), filenameFor(record.customer));
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Failed to re-download HTML.');
    }
  };

  const handleDelete = (id: string) => {
    const next = loadRegistry().filter(record => record.id !== id);
    saveRegistry(next);
    setRecords(next);
  };

  const toggleLockedView = (view: LedgerlyView) => {
    setLockedViews(prev =>
      prev.includes(view) ? prev.filter(v => v !== view) : [...prev, view]
    );
  };

  return (
    <div className="ldg-management-page">
      <header className="ldg-management-header">
        <div className="security-card-icon green">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="7.5" cy="14.5" r="3.5" />
            <path d="M10 12l8-8 2 2-2 2 2 2-2 2-2-2-4 4" />
          </svg>
        </div>
        <div>
          <h1>License management</h1>
          <p>Generate code-protected Budget Planner HTML files for customers.</p>
        </div>
      </header>

      <div className="ldg-management-build-note">
        Build the customer HTML first: <code>npm run build:customer-budget</code>
      </div>

      {status && <div className="security-status">{status}</div>}

      <div className="ldg-management-tabs">
        <button className={tab === 'generate' ? 'active' : ''} onClick={() => setTab('generate')}>Generate License</button>
        <button className={tab === 'history' ? 'active' : ''} onClick={() => setTab('history')}>History ({records.length})</button>
      </div>

      {tab === 'generate' ? (
        <section className="security-panel ldg-management-form">
          <label>
            <span>Customer name</span>
            <input value={customer} onChange={e => setCustomer(e.target.value)} placeholder="e.g. Jane Smith" />
          </label>
          <label>
            <span>License code</span>
            <div className="ldg-management-code-row">
              <input value={code} onChange={e => { setCode(e.target.value); setStatus(''); }} placeholder="Enter or auto-generate a code" />
              <button onClick={() => setCode(generateCode())}>Auto</button>
              <button disabled={!code} onClick={() => void navigator.clipboard.writeText(code)}>Copy</button>
            </div>
          </label>
          <button className="security-primary-btn" disabled={generating || !code.trim()} onClick={() => void handleGenerate()}>
            {generating ? 'Generating...' : 'Generate & Download HTML'}
          </button>
        </section>
      ) : (
        <section className="security-panel ldg-management-history">
          {records.length === 0 ? (
            <p>No licenses generated yet.</p>
          ) : (
            <table>
              <thead>
                <tr><th>Customer</th><th>Code</th><th>Date</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {records.map(record => (
                  <tr key={record.id}>
                    <td>{record.customer}</td>
                    <td><code>{record.code}</code></td>
                    <td>{new Date(record.date).toLocaleDateString()}</td>
                    <td>
                      <button onClick={() => void navigator.clipboard.writeText(record.code)}>Copy</button>
                      <button onClick={() => void handleRedownload(record)}>HTML</button>
                      <button className="danger" onClick={() => handleDelete(record.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      {/* ── Locked Views selector (shown on Generate tab only) ── */}
      {tab === 'generate' && (
        <section className="ldg-mgmt-feat-section">
          <div className="ldg-mgmt-feat-header">
            <div className="ldg-mgmt-feat-title">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
              Lock features behind the code
            </div>
            <p className="ldg-mgmt-feat-sub">
              Select which pages require the license code to access. The same code used above
              unlocks them. Leave all unchecked for a fully open app.
            </p>
          </div>

          <div className="ldg-mgmt-feat-grid">
            {LOCKABLE_VIEWS.map(({ view, label, emoji }) => {
              const checked = lockedViews.includes(view);
              return (
                <label key={view} className={`ldg-mgmt-feat-row ldg-mgmt-feat-check-row${checked ? ' ldg-mgmt-feat-row-locked' : ''}`}>
                  <span className="ldg-mgmt-feat-emoji">{emoji}</span>
                  <span className="ldg-mgmt-feat-name">{label}</span>
                  <input
                    type="checkbox"
                    className="ldg-mgmt-feat-checkbox"
                    checked={checked}
                    onChange={() => toggleLockedView(view)}
                  />
                </label>
              );
            })}
          </div>
          {lockedViews.length > 0 && (
            <p className="ldg-mgmt-feat-sub" style={{ marginTop: 10, color: '#4a7060' }}>
              🔒 {lockedViews.length} feature{lockedViews.length > 1 ? 's' : ''} will be locked in the generated HTML.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
