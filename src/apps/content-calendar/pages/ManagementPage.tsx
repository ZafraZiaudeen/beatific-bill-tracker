import { useState } from 'react';
import { sha256 } from '@/lib/crypto';
import type { ContentCalendarView } from '../types';

const CC_HASH_SALT = 'cc-lic-v1';
const REGISTRY_KEY = 'cc-license-registry';

const LOCKABLE_VIEWS: { view: ContentCalendarView; label: string; emoji: string }[] = [
  { view: 'dashboard',  label: 'Dashboard',    emoji: '🏠' },
  { view: 'calendar',   label: 'Calendar',     emoji: '📅' },
  { view: 'pipeline',   label: 'Pipeline',     emoji: '📋' },
  { view: 'ideas',      label: 'Ideas',        emoji: '💡' },
  { view: 'analytics',  label: 'Analytics',    emoji: '📊' },
  { view: 'templates',  label: 'Templates',    emoji: '🗂️' },
  { view: 'campaigns',  label: 'Campaigns',    emoji: '🚀' },
  { view: 'platforms',  label: 'Platforms',    emoji: '🌐' },
  { view: 'composer',   label: 'Post Composer',emoji: '✏️' },
];

interface LicenseRecord {
  id: string;
  customer: string;
  code: string;
  hash: string;
  date: string;
  lockedViews?: ContentCalendarView[];
}

const MGMT_CSS = `
.cc-mgmt-page { max-width: 700px; margin: 0 auto; padding: 32px 24px 48px; }
.cc-mgmt-header { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 24px; }
.cc-mgmt-header-icon {
  width: 44px; height: 44px; border-radius: 12px;
  background: rgba(217,120,86,.12); display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.cc-mgmt-header-icon svg { stroke: #b5522a; }
.cc-mgmt-header h1 { font-family: 'DM Serif Display', Georgia, serif; font-size: 1.4rem; font-weight: 400; color: var(--cc-text); margin: 0 0 4px; }
.cc-mgmt-header p  { font-size: .875rem; color: var(--cc-text-2); margin: 0; }
.cc-mgmt-build-note {
  padding: 10px 14px; background: var(--cc-bg-2); border: 1px solid var(--cc-border);
  border-radius: 8px; font-size: .82rem; color: var(--cc-text-2); margin-bottom: 20px;
}
.cc-mgmt-build-note code { background: var(--cc-bg-3); border-radius: 4px; padding: 1px 5px; font-family: monospace; font-size: .85em; }
.cc-mgmt-status { padding: 9px 14px; background: rgba(217,120,86,.1); border: 1px solid rgba(217,120,86,.25); border-radius: 8px; font-size: .85rem; color: #b5522a; margin-bottom: 16px; }
.cc-mgmt-tabs { display: flex; gap: 2px; background: var(--cc-bg-2); border: 1px solid var(--cc-border); border-radius: 10px; padding: 3px; margin-bottom: 20px; width: fit-content; }
.cc-mgmt-tabs button {
  padding: 7px 18px; border: none; border-radius: 8px; font: 600 .85rem 'Nunito', sans-serif;
  cursor: pointer; transition: all .15s; background: transparent; color: var(--cc-text-2);
}
.cc-mgmt-tabs button.active { background: var(--cc-card); color: var(--cc-text); box-shadow: 0 1px 4px rgba(0,0,0,.08); }
.cc-mgmt-panel {
  background: var(--cc-card); border: 1px solid var(--cc-border);
  border-radius: 12px; padding: 22px;
}
.cc-mgmt-form { display: flex; flex-direction: column; gap: 16px; }
.cc-mgmt-form label { display: flex; flex-direction: column; gap: 6px; }
.cc-mgmt-form label > span { font-size: .82rem; font-weight: 700; color: var(--cc-text-2); }
.cc-mgmt-form input {
  padding: 9px 12px; border: 1.5px solid var(--cc-border); border-radius: 8px;
  background: var(--cc-input); color: var(--cc-text);
  font: 500 .9rem 'Nunito', sans-serif; outline: none;
}
.cc-mgmt-form input:focus { border-color: var(--cc-accent); }
.cc-mgmt-code-row { display: flex; gap: 6px; }
.cc-mgmt-code-row input { flex: 1; }
.cc-mgmt-code-row button {
  padding: 9px 13px; border: 1px solid var(--cc-border); border-radius: 8px;
  background: var(--cc-bg-2); color: var(--cc-text-2);
  font: 600 .82rem 'Nunito', sans-serif; cursor: pointer; white-space: nowrap;
}
.cc-mgmt-code-row button:hover { background: var(--cc-bg-3); }
.cc-mgmt-primary-btn {
  padding: 10px 22px; border: none; border-radius: 9px;
  background: var(--cc-accent); color: #fff;
  font: 700 .9rem 'Nunito', sans-serif; cursor: pointer;
  transition: filter .12s; align-self: flex-start;
}
.cc-mgmt-primary-btn:disabled { opacity: .5; cursor: not-allowed; }
.cc-mgmt-primary-btn:not(:disabled):hover { filter: brightness(1.08); }
.cc-mgmt-table-wrap { overflow-x: auto; }
.cc-mgmt-table { width: 100%; border-collapse: collapse; font-size: .85rem; }
.cc-mgmt-table th { text-align: left; padding: 8px 10px; border-bottom: 2px solid var(--cc-border); color: var(--cc-text-2); font-size: .78rem; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; }
.cc-mgmt-table td { padding: 9px 10px; border-bottom: 1px solid var(--cc-border); color: var(--cc-text); vertical-align: middle; }
.cc-mgmt-table tr:last-child td { border-bottom: none; }
.cc-mgmt-table code { background: var(--cc-bg-2); border-radius: 4px; padding: 2px 6px; font-family: monospace; }
.cc-mgmt-table-actions { display: flex; gap: 5px; flex-wrap: wrap; }
.cc-mgmt-table-actions button {
  padding: 5px 10px; border: 1px solid var(--cc-border); border-radius: 6px;
  background: var(--cc-bg-2); color: var(--cc-text-2);
  font: 600 .78rem 'Nunito', sans-serif; cursor: pointer;
}
.cc-mgmt-table-actions button:hover { background: var(--cc-bg-3); }
.cc-mgmt-table-actions button.danger { border-color: rgba(224,80,80,.3); color: #c04040; background: rgba(224,80,80,.06); }
.cc-mgmt-table-actions button.danger:hover { background: rgba(224,80,80,.12); }
.cc-mgmt-empty { color: var(--cc-text-2); font-size: .88rem; }
.cc-mgmt-feat-section { margin-top: 20px; background: var(--cc-card); border: 1px solid var(--cc-border); border-radius: 12px; padding: 20px; }
.cc-mgmt-feat-title { display: flex; align-items: center; gap: 8px; font-size: .9rem; font-weight: 700; color: var(--cc-text); margin-bottom: 6px; }
.cc-mgmt-feat-sub { font-size: .82rem; color: var(--cc-text-2); margin: 0 0 14px; }
.cc-mgmt-feat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 8px; }
.cc-mgmt-feat-row {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 12px; border: 1px solid var(--cc-border);
  border-radius: 9px; background: var(--cc-bg-2);
  cursor: pointer; transition: all .12s;
}
.cc-mgmt-feat-row:hover { background: var(--cc-bg-3); }
.cc-mgmt-feat-row-locked { background: rgba(217,120,86,.06); border-color: rgba(217,120,86,.25); }
.cc-mgmt-feat-emoji { font-size: 16px; flex-shrink: 0; }
.cc-mgmt-feat-name { flex: 1; font-size: .83rem; font-weight: 600; color: var(--cc-text); }
.cc-mgmt-feat-checkbox { accent-color: var(--cc-accent); width: 15px; height: 15px; cursor: pointer; flex-shrink: 0; }
.cc-mgmt-feat-locked-note { margin-top: 10px; font-size: .82rem; color: #b5522a; }
`;

function loadRegistry(): LicenseRecord[] {
  try { return JSON.parse(localStorage.getItem(REGISTRY_KEY) ?? '[]'); } catch { return []; }
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

async function buildContentCalendarHtml(hash: string, lockedViews: ContentCalendarView[]): Promise<string> {
  const res = await fetch('/customer-content-calendar-build/content-calendar-app.html');
  if (!res.ok) throw new Error('Content Calendar customer build not found. Run: npm run build:customer-content-calendar');
  const html = await res.text();
  const inject = `<script>window.__CC_LICENSE_HASH__="${hash}";window.__CC_LOCKED_VIEWS__=${JSON.stringify(lockedViews)};</script>`;
  const idx = html.lastIndexOf('</head>');
  return html.slice(0, idx) + inject + '\n' + html.slice(idx);
}

function downloadHtml(html: string, filename: string) {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function filenameFor(customer: string) {
  const name = customer === '-' ? 'customer' : customer;
  return `content-calendar-${name.toLowerCase().replace(/\s+/g, '-')}.html`;
}

export function ManagementPage() {
  const [tab, setTab]           = useState<'generate' | 'history'>('generate');
  const [customer, setCustomer] = useState('');
  const [code, setCode]         = useState('');
  const [status, setStatus]     = useState('');
  const [generating, setGenerating] = useState(false);
  const [records, setRecords]   = useState<LicenseRecord[]>(loadRegistry);
  const [lockedViews, setLockedViews] = useState<ContentCalendarView[]>([]);

  const handleGenerate = async () => {
    const trimmedCode = code.trim();
    if (!trimmedCode) { setStatus('Enter a license code first.'); return; }
    setGenerating(true); setStatus('');
    try {
      const hash = await sha256(CC_HASH_SALT + trimmedCode);
      const html = await buildContentCalendarHtml(hash, lockedViews);
      const record: LicenseRecord = {
        id: crypto.randomUUID(),
        customer: customer.trim() || '-',
        code: trimmedCode,
        hash,
        date: new Date().toISOString(),
        lockedViews,
      };
      downloadHtml(html, filenameFor(record.customer));
      const next = [record, ...loadRegistry()];
      saveRegistry(next);
      setRecords(next);
      setCustomer(''); setCode('');
      setTab('history');
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Failed to generate HTML.');
    } finally {
      setGenerating(false);
    }
  };

  const handleRedownload = async (record: LicenseRecord) => {
    try {
      downloadHtml(await buildContentCalendarHtml(record.hash, record.lockedViews ?? []), filenameFor(record.customer));
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Failed to re-download HTML.');
    }
  };

  const handleDelete = (id: string) => {
    const next = loadRegistry().filter(r => r.id !== id);
    saveRegistry(next); setRecords(next);
  };

  const toggleLockedView = (view: ContentCalendarView) => {
    setLockedViews(prev => prev.includes(view) ? prev.filter(v => v !== view) : [...prev, view]);
  };

  return (
    <>
      <style>{MGMT_CSS}</style>
      <div className="cc-mgmt-page">
        <header className="cc-mgmt-header">
          <div className="cc-mgmt-header-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
              <circle cx="7.5" cy="14.5" r="3.5"/>
              <path d="M10 12l8-8 2 2-2 2 2 2-2 2-2-2-4 4"/>
            </svg>
          </div>
          <div>
            <h1>License management</h1>
            <p>Generate code-protected Content Calendar HTML files for customers.</p>
          </div>
        </header>

        <div className="cc-mgmt-build-note">
          Build the customer HTML first: <code>npm run build:customer-content-calendar</code>
        </div>

        {status && <div className="cc-mgmt-status">{status}</div>}

        <div className="cc-mgmt-tabs">
          <button className={tab === 'generate' ? 'active' : ''} onClick={() => setTab('generate')}>Generate License</button>
          <button className={tab === 'history' ? 'active' : ''} onClick={() => setTab('history')}>History ({records.length})</button>
        </div>

        {tab === 'generate' ? (
          <div className="cc-mgmt-panel cc-mgmt-form">
            <label>
              <span>Customer name</span>
              <input value={customer} onChange={e => setCustomer(e.target.value)} placeholder="e.g. Jane Smith" />
            </label>
            <label>
              <span>License code</span>
              <div className="cc-mgmt-code-row">
                <input value={code} onChange={e => { setCode(e.target.value); setStatus(''); }} placeholder="Enter or auto-generate a code" />
                <button onClick={() => setCode(generateCode())}>Auto</button>
                <button disabled={!code} onClick={() => void navigator.clipboard.writeText(code)}>Copy</button>
              </div>
            </label>
            <button className="cc-mgmt-primary-btn" disabled={generating || !code.trim()} onClick={() => void handleGenerate()}>
              {generating ? 'Generating…' : 'Generate & Download HTML'}
            </button>
          </div>
        ) : (
          <div className="cc-mgmt-panel">
            {records.length === 0 ? (
              <p className="cc-mgmt-empty">No licenses generated yet.</p>
            ) : (
              <div className="cc-mgmt-table-wrap">
                <table className="cc-mgmt-table">
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
                          <div className="cc-mgmt-table-actions">
                            <button onClick={() => void navigator.clipboard.writeText(record.code)}>Copy</button>
                            <button onClick={() => void handleRedownload(record)}>HTML</button>
                            <button className="danger" onClick={() => handleDelete(record.id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === 'generate' && (
          <div className="cc-mgmt-feat-section">
            <div className="cc-mgmt-feat-title">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>
              </svg>
              Lock features behind the code
            </div>
            <p className="cc-mgmt-feat-sub">
              Select which pages require the license code to access. Leave all unchecked for a fully open app.
            </p>
            <div className="cc-mgmt-feat-grid">
              {LOCKABLE_VIEWS.map(({ view, label, emoji }) => {
                const checked = lockedViews.includes(view);
                return (
                  <label key={view} className={`cc-mgmt-feat-row${checked ? ' cc-mgmt-feat-row-locked' : ''}`}>
                    <span className="cc-mgmt-feat-emoji">{emoji}</span>
                    <span className="cc-mgmt-feat-name">{label}</span>
                    <input
                      type="checkbox"
                      className="cc-mgmt-feat-checkbox"
                      checked={checked}
                      onChange={() => toggleLockedView(view)}
                    />
                  </label>
                );
              })}
            </div>
            {lockedViews.length > 0 && (
              <p className="cc-mgmt-feat-locked-note">
                🔒 {lockedViews.length} feature{lockedViews.length > 1 ? 's' : ''} will be locked in the generated HTML.
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
