import { useEffect, useMemo, useRef, useState } from 'react';
import { PageIntroBanner } from '../components/PageIntroBanner';
import { useLedgerlyStore } from '../store/useLedgerlyStore';
import sprig02 from '../../../assets/budget-assets/botanical-sprigs/botanical-sprigs-02.png';
import sprig04 from '../../../assets/budget-assets/botanical-sprigs/botanical-sprigs-04.png';
import flower03 from '../../../assets/budget-assets/flowers-and-leaves/flowers-and-leaves-03.png';
import flower06 from '../../../assets/budget-assets/flowers-and-leaves/flowers-and-leaves-06.png';
import sunSparkle01 from '../../../assets/budget-assets/sun-sparkles/sun-sparkles-01.png';

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

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function Icon({ name }: { name: 'lock' | 'timer' | 'key' | 'download' | 'upload' | 'file' | 'trash' | 'moon' | 'sun' | 'database' | 'help' | 'keyboard' | 'mail' | 'user' | 'check' | 'x' }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      {name === 'lock'     && <><rect {...p} x="4" y="11" width="16" height="10" rx="2" /><path {...p} d="M8 11V7a4 4 0 0 1 8 0v4" /></>}
      {name === 'timer'    && <><circle {...p} cx="12" cy="13" r="8" /><path {...p} d="M12 9v4l3 2M9 2h6" /></>}
      {name === 'key'      && <><circle {...p} cx="7.5" cy="14.5" r="3.5" /><path {...p} d="M10 12l8-8 2 2-2 2 2 2-2 2-2-2-4 4" /></>}
      {name === 'download' && <><path {...p} d="M12 3v12" /><path {...p} d="M7 10l5 5 5-5" /><path {...p} d="M5 21h14" /></>}
      {name === 'upload'   && <><path {...p} d="M12 21V9" /><path {...p} d="M7 14l5-5 5 5" /><path {...p} d="M5 3h14" /></>}
      {name === 'file'     && <><path {...p} d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path {...p} d="M14 2v6h6" /></>}
      {name === 'trash'    && <><path {...p} d="M3 6h18" /><path {...p} d="M8 6V4h8v2" /><path {...p} d="M19 6l-1 14H6L5 6" /></>}
      {name === 'moon'     && <path {...p} d="M21 12.8A8 8 0 1 1 11.2 3a6.5 6.5 0 0 0 9.8 9.8z" />}
      {name === 'sun'      && <><circle {...p} cx="12" cy="12" r="4" /><path {...p} d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></>}
      {name === 'database' && <><ellipse {...p} cx="12" cy="5" rx="8" ry="3" /><path {...p} d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5" /><path {...p} d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" /></>}
      {name === 'help'     && <><circle {...p} cx="12" cy="12" r="10" /><path {...p} d="M9.1 9a3 3 0 1 1 5.8 1c0 2-3 2.5-3 4" /><path {...p} d="M12 17h.01" /></>}
      {name === 'keyboard' && <><rect {...p} x="3" y="5" width="18" height="14" rx="2" /><path {...p} d="M7 9h.01M11 9h.01M15 9h.01M7 13h10" /></>}
      {name === 'mail'     && <><rect {...p} x="3" y="5" width="18" height="14" rx="2" /><path {...p} d="M3 7l9 6 9-6" /></>}
      {name === 'user'     && <><circle {...p} cx="12" cy="8" r="4" /><path {...p} d="M4 21a8 8 0 0 1 16 0" /></>}
      {name === 'check'    && <path {...p} d="M5 12l5 5L20 7" />}
      {name === 'x'        && <><path {...p} d="M18 6L6 18" /><path {...p} d="M6 6l12 12" /></>}
    </svg>
  );
}

function ThemeToggle({ theme, onChange }: { theme: 'light' | 'dark'; onChange: (theme: 'light' | 'dark') => void }) {
  const isDark = theme === 'dark';
  return (
    <div className="ldg-sec2-theme-row">
      <button
        onClick={() => onChange('light')}
        className={`ldg-sec2-theme-btn${!isDark ? ' ldg-sec2-theme-btn-active' : ''}`}
      >
        <span className="ldg-sec2-theme-icon"><Icon name="sun" /></span>
        Light
      </button>
      <button
        onClick={() => onChange('dark')}
        className={`ldg-sec2-theme-btn${isDark ? ' ldg-sec2-theme-btn-active' : ''}`}
      >
        <span className="ldg-sec2-theme-icon"><Icon name="moon" /></span>
        Dark
      </button>
    </div>
  );
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      className={`ldg-sec-toggle ${on ? 'ldg-sec-toggle-on' : 'ldg-sec-toggle-off'}`}
      onClick={onToggle}
      aria-pressed={on}
    >
      <span className="ldg-sec-toggle-thumb" style={{ left: on ? '22px' : '4px' }} />
    </button>
  );
}

const REMINDER_LABELS: Record<number, string> = { 3: 'Every 3 days', 7: 'Weekly', 14: 'Every 2 weeks', 30: 'Monthly' };

export function DataSecurityPage() {
  const settings            = useLedgerlyStore(s => s.securitySettings);
  const updateSecuritySettings = useLedgerlyStore(s => s.updateSecuritySettings);
  const getBackupData       = useLedgerlyStore(s => s.getBackupData);
  const importBackupData    = useLedgerlyStore(s => s.importBackupData);
  const resetLedgerlyData   = useLedgerlyStore(s => s.resetLedgerlyData);
  const recordBackup        = useLedgerlyStore(s => s.recordBackup);
  const userName            = useLedgerlyStore(s => s.userName);
  const setUserName         = useLedgerlyStore(s => s.setUserName);
  const transactions        = useLedgerlyStore(s => s.transactions);
  const accounts            = useLedgerlyStore(s => s.accounts);
  const goals               = useLedgerlyStore(s => s.goals);
  const bills               = useLedgerlyStore(s => s.bills);

  const fileInputRef  = useRef<HTMLInputElement>(null);
  const pinInputRef   = useRef<HTMLInputElement>(null);
  const [modal, setModal]           = useState<Modal>(null);
  const [status, setStatus]         = useState('');
  const [showPinForm, setShowPinForm] = useState(false);
  const [pinValue, setPinValue]     = useState('');
  const [pinErr, setPinErr]         = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [hintsEnabled, setHintsEnabled] = useState(
    () => localStorage.getItem('ldg-hints-enabled') !== 'false'
  );

  const toggleHints = (on: boolean) => {
    setHintsEnabled(on);
    if (on) {
      localStorage.setItem('ldg-hints-enabled', 'true');
      localStorage.removeItem('ldg-page-intros');
    } else {
      localStorage.setItem('ldg-hints-enabled', 'false');
    }
  };

  const storageSummary = useMemo(() => [
    { label: 'Transactions', value: transactions.length, color: '#7a9e7e' },
    { label: 'Accounts',     value: accounts.length,     color: '#6b9ec4' },
    { label: 'Goals',        value: goals.length,        color: '#9e8abe' },
    { label: 'Bills',        value: bills.length,        color: '#c4a35a' },
  ], [accounts.length, bills.length, goals.length, transactions.length]);

  const nextReminderDate = useMemo(() => {
    const base = settings.lastBackupAt ? new Date(settings.lastBackupAt) : new Date();
    base.setDate(base.getDate() + settings.backupReminderDays);
    return base.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }, [settings.lastBackupAt, settings.backupReminderDays]);

  const flash = (msg: string) => setStatus(msg);

  useEffect(() => {
    if (!status) return;
    const t = window.setTimeout(() => setStatus(''), 4000);
    return () => clearTimeout(t);
  }, [status]);

  useEffect(() => {
    if (showPinForm) pinInputRef.current?.focus();
  }, [showPinForm]);

  /* ── Actions ── */
  const exportBackup = () => {
    downloadText(`ledgerly-backup-${todayStamp()}.json`, JSON.stringify(getBackupData(), null, 2), 'application/json');
    recordBackup();
    flash('Backup exported.');
  };

  const exportTransactionsCsv = () => {
    const rows = [
      ['Date', 'Merchant', 'Category', 'Account', 'Amount', 'Notes'],
      ...transactions.map(t => [t.date, t.merchant, t.category, t.account, String(t.amount), t.notes ?? '']),
    ];
    const csv = rows.map(row => row.map(cell => `"${cell.replaceAll('"', '""')}"`).join(',')).join('\n');
    downloadText(`ledgerly-transactions-${todayStamp()}.csv`, csv, 'text/csv');
    flash('Transactions CSV exported.');
  };

  const importFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw = JSON.parse(String(reader.result));
        if (!raw || typeof raw !== 'object' || !('version' in raw)) {
          flash('This does not look like a Ledgerly backup.');
          return;
        }
        flash(importBackupData(raw) ? 'Backup restored successfully.' : 'Could not restore backup.');
      } catch {
        flash('Invalid backup file.');
      }
    };
    reader.readAsText(file);
  };

  const submitPinForm = async () => {
    if (!/^\d{4}$/.test(pinValue)) { setPinErr('PIN must be exactly 4 digits.'); return; }
    updateSecuritySettings({ pinEnabled: true, pinHash: await sha256(pinValue) });
    setPinValue(''); setPinErr(''); setShowPinForm(false);
    flash('PIN lock updated.');
  };

  const removePin = () => {
    updateSecuritySettings({ pinEnabled: false, pinHash: null });
    flash('PIN lock removed.');
  };

  const manualLock = () => {
    window.dispatchEvent(new Event('ledgerly-lock'));
  };

  const confirmReset = () => {
    resetLedgerlyData();
    setShowResetConfirm(false);
    flash('Ledgerly data reset to defaults.');
  };

  const changeReminderDays = (n: number) => {
    updateSecuritySettings({ backupReminderDays: n });
    flash(`Reminder set to ${REMINDER_LABELS[n] ?? `every ${n} days`}.`);
  };

  return (
    <div className="ldg-sec-page">
      <PageIntroBanner view="security" />

      {/* ── Page header ── */}
      <div className="ldg-sec-header">
        <div>
          <div className="ldg-sec-title">
            <span style={{ width: 26, height: 26, display: 'flex', color: '#4a7060' }}><ShieldIcon /></span>
            Data &amp; Security
          </div>
          <div className="ldg-sec-subtitle">Your financial life. Private, secure, and in your control.</div>
        </div>
        <div className="ldg-privacy-badge">🔒 Local only · Nothing sent to any server</div>
      </div>

      {/* ── Status toast ── */}
      {status && (
        <div className="ldg-sec2-toast">
          <span style={{ width: 14, height: 14, display: 'flex', color: '#4a7060' }}><Icon name="check" /></span>
          {status}
        </div>
      )}

      {/* ── Row 1: Storage + Backup info ── */}
      <div className="ldg-sec2-row2">

        {/* Storage snapshot */}
        <div className="ldg-card ldg-sec2-card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div className="ldg-sec-card-title"><Icon name="database" />Local Storage</div>
          <div className="ldg-sec-card-sub">All your data lives on this device - nowhere else.</div>

          <div className="ldg-sec2-summary">
            {storageSummary.map(item => (
              <div key={item.label} className="ldg-sec2-summary-item">
                <span className="ldg-sec2-summary-val" style={{ color: item.color }}>{item.value}</span>
                <span className="ldg-sec2-summary-label">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="ldg-sec-row" style={{ marginTop: 12, borderBottom: 'none' }}>
            <div className="ldg-sec-status-dot" style={{ background: '#7a9e7e' }} />
            <div className="ldg-sec-row-body">
              <div className="ldg-sec-row-label">Stored locally</div>
              <div className="ldg-sec-row-desc">Encrypted in browser storage</div>
            </div>
          </div>
          <img src={sprig02} alt="" className="ldg-stat-deco" />
        </div>

        {/* Last backup + reminder */}
        <div className="ldg-card ldg-sec2-card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div className="ldg-sec-card-title"><Icon name="timer" />Backup Status</div>
          <div className="ldg-sec-card-sub">Keep a copy of your data for peace of mind.</div>

          {/* Last backup */}
          <div className="ldg-sec-row">
            <div className="ldg-sec-status-dot" style={{ background: settings.lastBackupAt ? '#7a9e7e' : '#d1d5db' }} />
            <div className="ldg-sec-row-body">
              <div className="ldg-sec-row-label">{timeAgo(settings.lastBackupAt)}</div>
              <div className="ldg-sec-row-desc">
                {settings.lastBackupAt
                  ? new Date(settings.lastBackupAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                  : 'No backup created yet'}
              </div>
            </div>
          </div>

          {/* Reminder interval */}
          <div className="ldg-sec-row" style={{ borderBottom: 'none' }}>
            <div className="ldg-sec-row-body">
              <div className="ldg-sec-row-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>Reminder</span>
                <span className="ldg-sec2-badge">
                  {REMINDER_LABELS[settings.backupReminderDays] ?? `Every ${settings.backupReminderDays} days`}
                </span>
              </div>
              <div className="ldg-sec-row-desc">Next: {nextReminderDate}</div>
            </div>
          </div>

          {/* Reminder interval selector */}
          <div className="ldg-sec2-reminder-pills">
            {([3, 7, 14, 30] as const).map(n => (
              <button
                key={n}
                onClick={() => changeReminderDays(n)}
                className={`ldg-sec2-pill${settings.backupReminderDays === n ? ' ldg-sec2-pill-active' : ''}`}
              >
                {REMINDER_LABELS[n]}
              </button>
            ))}
          </div>

          <img src={flower03} alt="" className="ldg-stat-deco" />
        </div>
      </div>

      {/* ── Row 2: Security Controls (full width) ── */}
      <div className="ldg-card ldg-sec2-card ldg-sec2-full" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="ldg-sec-card-title"><Icon name="lock" />Security Controls</div>
        <div className="ldg-sec-card-sub">Add an extra layer of protection to your budget data.</div>

        <div className="ldg-sec2-controls">

          {/* PIN lock row */}
          <div className="ldg-sec2-ctrl-row">
            <div className="ldg-sec2-ctrl-icon" style={{ background: 'rgba(122,158,126,.1)' }}>
              <Icon name="lock" />
            </div>
            <div className="ldg-sec-row-body">
              <div className="ldg-sec-row-label">PIN lock</div>
              <div className="ldg-sec-row-desc">
                {settings.pinEnabled ? 'PIN is active - app requires PIN to open' : 'Require a PIN to open Ledgerly'}
              </div>
            </div>
            <div className="ldg-sec2-ctrl-actions">
              {settings.pinEnabled && (
                <button className="ldg-sec-btn ldg-sec-btn-secondary ldg-sec2-sm-btn" onClick={removePin}>Remove</button>
              )}
              <button
                className="ldg-sec-btn ldg-sec-btn-secondary ldg-sec2-sm-btn"
                onClick={() => { setShowPinForm(v => !v); setPinValue(''); setPinErr(''); }}
              >
                {settings.pinEnabled ? 'Change PIN' : 'Set up PIN'}
              </button>
              <Toggle on={settings.pinEnabled} onToggle={() => settings.pinEnabled ? removePin() : setShowPinForm(v => !v)} />
            </div>
          </div>

          {/* Inline PIN form */}
          {showPinForm && (
            <div className="ldg-sec2-pin-form">
              <input
                ref={pinInputRef}
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pinValue}
                onChange={e => { setPinValue(e.target.value.replace(/\D/g, '').slice(0, 4)); setPinErr(''); }}
                onKeyDown={e => { if (e.key === 'Enter') void submitPinForm(); if (e.key === 'Escape') setShowPinForm(false); }}
                placeholder={settings.pinEnabled ? 'New 4-digit PIN' : 'Create 4-digit PIN'}
                className="ldg-sec2-pin-input"
              />
              {pinErr && <span className="ldg-sec2-pin-err">{pinErr}</span>}
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="ldg-sec-btn ldg-sec-btn-primary" onClick={() => void submitPinForm()}>
                  Save PIN
                </button>
                <button className="ldg-sec-btn ldg-sec-btn-secondary" onClick={() => { setShowPinForm(false); setPinValue(''); setPinErr(''); }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Auto-lock timer */}
          <div className="ldg-sec2-ctrl-row">
            <div className="ldg-sec2-ctrl-icon" style={{ background: 'rgba(107,158,196,.1)' }}>
              <Icon name="timer" />
            </div>
            <div className="ldg-sec-row-body">
              <div className="ldg-sec-row-label">Auto-lock timer</div>
              <div className="ldg-sec-row-desc">Lock the app after inactivity{!settings.pinEnabled ? ' (requires PIN)' : ''}</div>
            </div>
            <select
              value={settings.autoLockMinutes}
              onChange={e => updateSecuritySettings({ autoLockMinutes: Number(e.target.value) })}
              className="ldg-sec-select"
              disabled={!settings.pinEnabled}
            >
              {[1, 5, 10, 30, 60].map(v => <option key={v} value={v}>{v} minutes</option>)}
            </select>
          </div>

          {/* Your name */}
          <div className="ldg-sec2-ctrl-row" style={{ border: 'none' }}>
            <div className="ldg-sec2-ctrl-icon" style={{ background: 'rgba(196,163,90,.1)' }}>
              <Icon name="user" />
            </div>
            <div className="ldg-sec-row-body">
              <div className="ldg-sec-row-label">Your name</div>
              <div className="ldg-sec-row-desc">Used in greetings and backup filenames</div>
            </div>
            <input
              value={userName}
              onChange={e => setUserName(e.target.value)}
              placeholder="Your name"
              aria-label="Your name"
              className="ldg-sec-name-input"
            />
          </div>
        </div>

        {/* Lock now button */}
        {settings.pinEnabled && (
          <div style={{ marginTop: 12 }}>
            <button className="ldg-sec-btn ldg-sec-btn-secondary" onClick={manualLock} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 14, height: 14, display: 'flex' }}><Icon name="lock" /></span>
              Lock now
            </button>
          </div>
        )}

        <img src={flower06} alt="" className="ldg-stat-deco" />
      </div>

      {/* ── Row 3: Backup Actions + Appearance ── */}
      <div className="ldg-sec2-row2">

        {/* Backup actions */}
        <div className="ldg-card ldg-sec2-card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div className="ldg-sec-card-title"><Icon name="download" />Backup &amp; Restore</div>
          <div className="ldg-sec-card-sub">Save or restore your data whenever you like.</div>

          <button className="ldg-sec-action-row" onClick={exportBackup}>
            <div className="ldg-sec-action-icon" style={{ background: 'rgba(122,158,126,.12)' }}><Icon name="file" /></div>
            <div>
              <div className="ldg-sec-action-name">Export JSON</div>
              <div className="ldg-sec-action-desc">Full backup - recommended</div>
            </div>
            <span className="ldg-sec2-action-arrow">→</span>
          </button>

          <button className="ldg-sec-action-row" onClick={exportTransactionsCsv}>
            <div className="ldg-sec-action-icon" style={{ background: 'rgba(107,158,196,.12)', color: '#3a6e96' }}><Icon name="file" /></div>
            <div>
              <div className="ldg-sec-action-name">Export CSV</div>
              <div className="ldg-sec-action-desc">Transactions &amp; categories only</div>
            </div>
            <span className="ldg-sec2-action-arrow">→</span>
          </button>

          <button className="ldg-sec-action-row" onClick={() => fileInputRef.current?.click()}>
            <div className="ldg-sec-action-icon" style={{ background: 'rgba(196,163,90,.12)', color: '#8a6020' }}><Icon name="upload" /></div>
            <div>
              <div className="ldg-sec-action-name">Import backup</div>
              <div className="ldg-sec-action-desc">Restore from a previous JSON backup</div>
            </div>
            <span className="ldg-sec2-action-arrow">→</span>
          </button>

          {/* Danger zone */}
          <div className="ldg-sec2-danger-zone">
            <div className="ldg-sec2-danger-title">
              <span style={{ width: 14, height: 14, display: 'flex' }}><Icon name="trash" /></span>
              Reset all data
            </div>
            <div className="ldg-sec2-danger-desc">Return Ledgerly to defaults. This cannot be undone.</div>

            {showResetConfirm ? (
              <div className="ldg-sec2-confirm-row">
                <span className="ldg-sec2-confirm-label">Are you sure?</span>
                <button className="ldg-sec-btn ldg-sec-btn-danger" onClick={confirmReset} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 14, height: 14, display: 'flex' }}><Icon name="check" /></span>
                  Yes, reset
                </button>
                <button className="ldg-sec-btn ldg-sec-btn-secondary" onClick={() => setShowResetConfirm(false)}>
                  Cancel
                </button>
              </div>
            ) : (
              <button className="ldg-sec-btn ldg-sec-btn-danger" onClick={() => setShowResetConfirm(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 14, height: 14, display: 'flex' }}><Icon name="trash" /></span>
                Reset data
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={e => { const file = e.target.files?.[0]; if (file) importFile(file); e.currentTarget.value = ''; }}
          />
        </div>

        {/* Appearance & quick links */}
        <div className="ldg-card ldg-sec2-card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div className="ldg-sec-card-title"><Icon name="sun" />Appearance</div>
          <div className="ldg-sec-card-sub">Choose your preferred look for Ledgerly.</div>
          <ThemeToggle theme={settings.theme} onChange={theme => updateSecuritySettings({ theme })} />

          <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '.82rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon name="help" />Page hints
                </div>
                <div style={{ fontSize: '.75rem', color: 'var(--text2)', marginTop: 2 }}>
                  Show a tips dialog on first visit to each page
                </div>
              </div>
              <div className="ldg-sec2-theme-row" style={{ marginTop: 0, marginBottom: 0 }}>
                <button
                  className={`ldg-sec2-theme-btn${hintsEnabled ? ' ldg-sec2-theme-btn-active' : ''}`}
                  onClick={() => toggleHints(true)}
                >On</button>
                <button
                  className={`ldg-sec2-theme-btn${!hintsEnabled ? ' ldg-sec2-theme-btn-active' : ''}`}
                  onClick={() => toggleHints(false)}
                >Off</button>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 24 }}>
            <div className="ldg-sec-card-title" style={{ marginBottom: 6 }}><Icon name="help" />Quick links</div>
            <div className="ldg-sec2-links">
              <button className="ldg-sec2-link-btn" onClick={() => setModal('help')}>
                <span style={{ width: 14, height: 14, display: 'flex' }}><Icon name="help" /></span>
                Help
              </button>
              <button className="ldg-sec2-link-btn" onClick={() => setModal('shortcuts')}>
                <span style={{ width: 14, height: 14, display: 'flex' }}><Icon name="keyboard" /></span>
                Shortcuts
              </button>
              <a
                href="mailto:support@example.com?subject=Ledgerly%20feedback"
                className="ldg-sec2-link-btn"
              >
                <span style={{ width: 14, height: 14, display: 'flex' }}><Icon name="mail" /></span>
                Feedback
              </a>
            </div>
          </div>
          <img src={sunSparkle01} alt="" className="ldg-stat-deco" style={{ opacity: .35 }} />
        </div>

      </div>

      {/* ── Backup reminder card for narrow screens ── */}
      <div className="ldg-sec2-sprig-footer">
        <img src={sprig04} alt="" style={{ width: 48, height: 48, opacity: .5 }} />
        <span>Your data. Your rules. Everything stays private on this device.</span>
      </div>

      {/* ── Modal (help / shortcuts) ── */}
      {modal && (
        <div className="security-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="security-modal">
            <div className="security-modal-header">
              <h2>{modal === 'help' ? 'Help articles' : 'Keyboard shortcuts'}</h2>
              <button onClick={() => setModal(null)} aria-label="Close">
                <span style={{ width: 18, height: 18, display: 'flex' }}><Icon name="x" /></span>
              </button>
            </div>
            {modal === 'help' ? (
              <div className="security-help-list">
                <p><strong>Where is my data stored?</strong><br />In local browser storage on this device. Nothing is sent anywhere.</p>
                <p><strong>How do I move devices?</strong><br />Export a JSON backup on this page, then import it on your new device.</p>
                <p><strong>Can Ledgerly see my data?</strong><br />No - this budget planner uses no server sync whatsoever.</p>
                <p><strong>What does Reset do?</strong><br />It wipes all transactions, accounts, goals, and settings back to the factory defaults.</p>
              </div>
            ) : (
              <div className="security-help-list">
                <p><strong>Esc</strong> - closes modals and menus.</p>
                <p><strong>Tab</strong> - moves focus between controls.</p>
                <p><strong>Ctrl/Cmd + P</strong> - print or save reports as PDF.</p>
                <p><strong>Enter</strong> - confirms dialogs and forms.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
