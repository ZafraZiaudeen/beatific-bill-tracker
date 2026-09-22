import { useMemo, useRef, useState } from 'react';
import { useLedgerlyStore } from '../store/useLedgerlyStore';

type Modal = 'help' | 'shortcuts' | null;

function downloadText(filename: string, text: string, type: string) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function sha256(text: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}

function timeAgo(iso: string | null) {
  if (!iso) return 'No backup yet';
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.max(1, Math.round(diffMs / 60000));
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  const days = Math.round(hrs / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function Icon({ name }: { name: 'shield' | 'lock' | 'timer' | 'key' | 'download' | 'upload' | 'file' | 'trash' | 'moon' | 'sun' | 'database' | 'help' | 'keyboard' | 'mail' | 'link' }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {name === 'shield' && <><path {...common} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path {...common} d="M9 12l2 2 4-4" /></>}
      {name === 'lock' && <><rect {...common} x="4" y="11" width="16" height="10" rx="2" /><path {...common} d="M8 11V7a4 4 0 0 1 8 0v4" /></>}
      {name === 'timer' && <><circle {...common} cx="12" cy="13" r="8" /><path {...common} d="M12 9v4l3 2M9 2h6" /></>}
      {name === 'key' && <><circle {...common} cx="7.5" cy="14.5" r="3.5" /><path {...common} d="M10 12l8-8 2 2-2 2 2 2-2 2-2-2-4 4" /></>}
      {name === 'download' && <><path {...common} d="M12 3v12" /><path {...common} d="M7 10l5 5 5-5" /><path {...common} d="M5 21h14" /></>}
      {name === 'upload' && <><path {...common} d="M12 21V9" /><path {...common} d="M7 14l5-5 5 5" /><path {...common} d="M5 3h14" /></>}
      {name === 'file' && <><path {...common} d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path {...common} d="M14 2v6h6" /></>}
      {name === 'trash' && <><path {...common} d="M3 6h18" /><path {...common} d="M8 6V4h8v2" /><path {...common} d="M19 6l-1 14H6L5 6" /></>}
      {name === 'moon' && <path {...common} d="M21 12.8A8 8 0 1 1 11.2 3a6.5 6.5 0 0 0 9.8 9.8z" />}
      {name === 'sun' && <><circle {...common} cx="12" cy="12" r="4" /><path {...common} d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></>}
      {name === 'database' && <><ellipse {...common} cx="12" cy="5" rx="8" ry="3" /><path {...common} d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5" /><path {...common} d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" /></>}
      {name === 'help' && <><circle {...common} cx="12" cy="12" r="10" /><path {...common} d="M9.1 9a3 3 0 1 1 5.8 1c0 2-3 2.5-3 4" /><path {...common} d="M12 17h.01" /></>}
      {name === 'keyboard' && <><rect {...common} x="3" y="5" width="18" height="14" rx="2" /><path {...common} d="M7 9h.01M11 9h.01M15 9h.01M7 13h10" /></>}
      {name === 'mail' && <><rect {...common} x="3" y="5" width="18" height="14" rx="2" /><path {...common} d="M3 7l9 6 9-6" /></>}
      {name === 'link' && <><path {...common} d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1" /><path {...common} d="M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 0 0 12 20.1l1.1-1.1" /></>}
    </svg>
  );
}

function ThemeToggle({ theme, onChange }: { theme: 'light' | 'dark'; onChange: (theme: 'light' | 'dark') => void }) {
  const isDark = theme === 'dark';
  return (
    <button
      className={`security-theme-toggle${isDark ? ' dark' : ''}`}
      onClick={() => onChange(isDark ? 'light' : 'dark')}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      <span className="security-theme-option"><Icon name="sun" />Light</span>
      <span className="security-theme-option"><Icon name="moon" />Dark</span>
      <span className="security-theme-thumb" />
    </button>
  );
}

export function DataSecurityPage() {
  const settings = useLedgerlyStore(s => s.securitySettings);
  const updateSecuritySettings = useLedgerlyStore(s => s.updateSecuritySettings);
  const getBackupData = useLedgerlyStore(s => s.getBackupData);
  const importBackupData = useLedgerlyStore(s => s.importBackupData);
  const resetLedgerlyData = useLedgerlyStore(s => s.resetLedgerlyData);
  const recordBackup = useLedgerlyStore(s => s.recordBackup);
  const transactions = useLedgerlyStore(s => s.transactions);
  const accounts = useLedgerlyStore(s => s.accounts);
  const goals = useLedgerlyStore(s => s.goals);
  const bills = useLedgerlyStore(s => s.bills);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [modal, setModal] = useState<Modal>(null);
  const [status, setStatus] = useState('');

  const storageSummary = useMemo(() => [
    { label: 'Transactions', value: transactions.length },
    { label: 'Accounts', value: accounts.length },
    { label: 'Goals', value: goals.length },
    { label: 'Bills', value: bills.length },
  ], [accounts.length, bills.length, goals.length, transactions.length]);

  const exportBackup = () => {
    const data = getBackupData();
    downloadText(`ledgerly-backup-${todayStamp()}.json`, JSON.stringify(data, null, 2), 'application/json');
    recordBackup();
    setStatus('Backup exported.');
  };

  const exportTransactionsCsv = () => {
    const rows = [
      ['Date', 'Merchant', 'Category', 'Account', 'Amount', 'Notes'],
      ...transactions.map(t => [t.date, t.merchant, t.category, t.account, String(t.amount), t.notes ?? '']),
    ];
    const csv = rows.map(row => row.map(cell => `"${cell.replaceAll('"', '""')}"`).join(',')).join('\n');
    downloadText(`ledgerly-transactions-${todayStamp()}.csv`, csv, 'text/csv');
    setStatus('Transactions CSV exported.');
  };

  const importFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw = JSON.parse(String(reader.result));
        if (!raw || typeof raw !== 'object' || !('version' in raw)) {
          setStatus('This does not look like a Ledgerly backup.');
          return;
        }
        const ok = importBackupData(raw);
        setStatus(ok ? 'Backup restored successfully.' : 'Could not restore backup.');
      } catch {
        setStatus('Invalid backup file.');
      }
    };
    reader.readAsText(file);
  };

  const setupPin = async () => {
    const nextPin = window.prompt(settings.pinEnabled ? 'Enter a new 4 digit PIN:' : 'Create a 4 digit PIN:');
    if (nextPin === null) return;
    if (!/^\d{4}$/.test(nextPin)) {
      window.alert('PIN must be exactly 4 digits.');
      return;
    }
    updateSecuritySettings({ pinEnabled: true, pinHash: await sha256(nextPin) });
    setStatus('PIN lock updated.');
  };

  const removePin = () => {
    if (!window.confirm('Remove PIN lock from Ledgerly?')) return;
    updateSecuritySettings({ pinEnabled: false, pinHash: null });
    setStatus('PIN lock removed.');
  };

  const resetData = () => {
    if (!window.confirm('Reset all Ledgerly budget planner data to defaults? This cannot be undone.')) return;
    resetLedgerlyData();
    setStatus('Ledgerly data reset to defaults.');
  };

  const manualLock = () => {
    window.dispatchEvent(new Event('ledgerly-lock'));
    setStatus('Ledgerly locked.');
  };

  return (
    <div className="security-page">
      <div className="security-header">
        <div className="security-header-icon">
          <Icon name="shield" />
        </div>
        <div>
          <h1>Data & security</h1>
          <p>Keep your financial data private, backed up, and in your control.</p>
        </div>
      </div>

      {status && <div className="security-status">{status}</div>}

      <section className="security-status-strip">
        <div>
          <span className="security-status-dot" />
          <strong>Local only</strong>
          <small>Nothing is sent to any server</small>
        </div>
        <div>
          <strong>{settings.pinEnabled ? 'PIN enabled' : 'PIN not set'}</strong>
          <small>{settings.pinEnabled ? 'Manual lock and auto-lock are available' : 'Set a PIN to enable app locking'}</small>
        </div>
        <div>
          <strong>{timeAgo(settings.lastBackupAt)}</strong>
          <small>Last local backup</small>
        </div>
      </section>

      <div className="security-dashboard-grid">
        <main className="security-main-column">
          <section className="security-panel">
            <div className="security-panel-header">
              <div>
                <h2>Privacy & access</h2>
                <p>Control who can open Ledgerly on this device.</p>
              </div>
            </div>
            <div className="security-setting-list">
              <div className="security-setting-row">
                <div className="security-card-icon green"><Icon name="shield" /></div>
                <div>
                  <h3>Private by default</h3>
                  <p>Your data stays in this browser on this device unless you export or import it.</p>
                </div>
                <span className="security-pill green">Local only</span>
              </div>
              <div className="security-setting-row">
                <div className="security-card-icon blue"><Icon name="lock" /></div>
                <div>
                  <h3>PIN lock</h3>
                  <p>Require a 4 digit PIN to open Ledgerly.</p>
                </div>
                <div className="security-actions-inline">
                  <button onClick={setupPin}>{settings.pinEnabled ? 'Change PIN' : 'Set up PIN'}</button>
                  {settings.pinEnabled && <button onClick={removePin}>Remove</button>}
                </div>
              </div>
              <div className="security-setting-row">
                <div className="security-card-icon orange"><Icon name="timer" /></div>
                <div>
                  <h3>Auto-lock timer</h3>
                  <p>Lock Ledgerly after a period of inactivity.</p>
                </div>
                <select value={settings.autoLockMinutes} onChange={e => updateSecuritySettings({ autoLockMinutes: Number(e.target.value) })}>
                  {[1, 5, 10, 30, 60].map(v => <option key={v} value={v}>{v} minutes</option>)}
                </select>
              </div>
              <div className="security-setting-row">
                <div className="security-card-icon purple"><Icon name="key" /></div>
                <div>
                  <h3>Manual lock</h3>
                  <p>Lock the app immediately when PIN lock is enabled.</p>
                </div>
                <button disabled={!settings.pinEnabled} onClick={manualLock}>Lock now</button>
              </div>
            </div>
          </section>

          <section className="security-panel">
            <div className="security-panel-header">
              <div>
                <h2>Backup & portability</h2>
                <p>Export, restore, or reset your local Ledgerly data.</p>
              </div>
            </div>
            <div className="security-setting-list">
              <div className="security-setting-row">
                <div className="security-card-icon teal"><Icon name="download" /></div>
                <div>
                  <h3>Backup reminder</h3>
                  <p>Last backup: {timeAgo(settings.lastBackupAt)}</p>
                </div>
                <select value={settings.backupReminderDays} onChange={e => updateSecuritySettings({ backupReminderDays: Number(e.target.value) })}>
                  {[3, 7, 14, 30].map(v => <option key={v} value={v}>Every {v} days</option>)}
                </select>
              </div>
              <div className="security-action-grid">
                <button className="security-primary-btn" onClick={exportBackup}><Icon name="download" />Export backup</button>
                <button onClick={() => fileInputRef.current?.click()}><Icon name="upload" />Restore backup</button>
                <button onClick={exportTransactionsCsv}><Icon name="file" />Export transactions CSV</button>
              </div>
              <div className="security-danger-zone">
                <div>
                  <h3>Reset all local data</h3>
                  <p>Return Ledgerly to defaults. This cannot be undone.</p>
                </div>
                <button className="danger" onClick={resetData}><Icon name="trash" />Reset data</button>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) importFile(file);
                e.currentTarget.value = '';
              }}
            />
          </section>

          <section className="security-help-strip">
            <div>
              <h2>Help & privacy</h2>
              <p>Get help, learn more, and manage your privacy habits.</p>
            </div>
            <button onClick={() => setModal('help')}><Icon name="help" />Search help</button>
            <button onClick={() => setModal('shortcuts')}><Icon name="keyboard" />Shortcuts</button>
            <button onClick={() => fileInputRef.current?.click()}><Icon name="upload" />Restore</button>
            <a href="mailto:support@example.com?subject=Ledgerly%20feedback"><Icon name="mail" />Feedback</a>
          </section>
        </main>

        <aside className="security-side-column">
          <section className="security-panel security-appearance-panel">
            <div className="security-panel-header">
              <div>
                <h2>Appearance</h2>
                <p>Choose your preferred Ledgerly theme.</p>
              </div>
            </div>
            <ThemeToggle theme={settings.theme} onChange={theme => updateSecuritySettings({ theme })} />
          </section>

          <section className="security-panel">
            <div className="security-panel-header">
              <div>
                <h2>Stored locally</h2>
                <p>Current records in this browser.</p>
              </div>
            </div>
            <div className="security-summary-grid">
              {storageSummary.map(item => (
                <div key={item.label}><strong>{item.value}</strong><span>{item.label}</span></div>
              ))}
            </div>
          </section>

          <section className="security-panel security-backup-note">
            <div className="security-card-icon green"><Icon name="database" /></div>
            <h2>Normal local backup</h2>
            <p>Backups are exported as readable JSON files from this device.</p>
            <span className="security-pill">Not encrypted</span>
          </section>

          <section className="security-panel security-backup-note">
            <div className="security-card-icon blue"><Icon name="link" /></div>
            <h2>Sync code</h2>
            <p>Manual transfer helper only. No server sync is used.</p>
            <button onClick={() => updateSecuritySettings({ syncCodeEnabled: !settings.syncCodeEnabled })}>{settings.syncCodeEnabled ? 'Enabled' : 'Disabled'}</button>
          </section>
        </aside>
      </div>

      {modal && (
        <div className="security-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="security-modal">
            <div className="security-modal-header">
              <h2>{modal === 'help' ? 'Help articles' : 'Keyboard shortcuts'}</h2>
              <button onClick={() => setModal(null)}>x</button>
            </div>
            {modal === 'help' ? (
              <div className="security-help-list">
                <p><strong>Where is my data stored?</strong> In local browser storage on this device.</p>
                <p><strong>How do I move devices?</strong> Export a JSON backup here, then restore it on the other device.</p>
                <p><strong>Can Ledgerly see my data?</strong> No server sync is used in this budget planner.</p>
              </div>
            ) : (
              <div className="security-help-list">
                <p><strong>Esc</strong> closes modals and menus.</p>
                <p><strong>Tab</strong> moves between controls.</p>
                <p><strong>Ctrl/Cmd + P</strong> prints reports or saves them as PDF.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
