import { useMemo, useRef, useState } from 'react';
import {
  CalendarDays, Sparkles, Sun, Moon, Download, Upload,
  Printer, Clock, Lock, ShieldCheck, HardDrive, FileCheck,
  ChevronRight, Target, Share2, AlertTriangle, RotateCw,
} from 'lucide-react';
import { useContentCalendarStore } from '../store';
import { getActivePlatformOptions, getPlatformConfig } from '../platformConfig';
import { backupReminderIsDue, formatContentDate } from '../settings';
import {
  createScheduleCsv,
  createWorkspaceBackup,
  downloadTextFile,
  parseScheduleCsv,
  restoreWorkspaceBackup,
} from '../workspaceTransfer';
import type { ContentCalendarAccent, DateFormatPreference, WeekStartPreference } from '../types';
import { CONTENT_CALENDAR_HINTS_KEY, CONTENT_CALENDAR_PAGE_INTROS_KEY } from '../components/ContentCalendarPageIntro';

const PAGE_CSS = `
.cc-st-page{background:radial-gradient(circle at 70% 6%,rgba(255,255,255,.08),transparent 30%),var(--cc-bg);color:var(--cc-text);min-height:100%;padding-bottom:40px}

/* Header */
.cc-st-header{display:flex;align-items:flex-start;justify-content:space-between;gap:24px;padding:18px clamp(18px,2.3vw,32px) 16px;border-bottom:1px solid var(--cc-border)}
.cc-st-heading-row{display:flex;align-items:center;gap:10px}
.cc-st-heading{font-family:'DM Serif Display',Georgia,serif;font-weight:400;font-size:32px;line-height:1;letter-spacing:-.02em;margin:0;color:var(--cc-text)}
.cc-st-swoop{display:block;width:162px;height:11px;margin-top:9px;border-top:3px solid var(--cc-accent);border-radius:50%;transform:rotate(-2deg)}
.cc-st-header-right{flex-shrink:0;display:flex;flex-direction:column;align-items:flex-end;gap:10px}
.cc-st-meta{display:flex;align-items:center;gap:18px;font-size:12px;font-weight:650;color:var(--cc-text)}
/* Grid layout */
.cc-st-body{width:100%;max-width:1680px;margin:0 auto;padding:18px clamp(18px,2.3vw,32px) 0;box-sizing:border-box;display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:18px;align-items:start}
.cc-st-row1{display:contents}
.cc-st-row2{grid-column:1/-1;display:grid;grid-template-columns:minmax(0,1.45fr) minmax(340px,.95fr);gap:18px;align-items:start}
.cc-st-card-appearance{grid-column:span 6}
.cc-st-card-backup,.cc-st-card-privacy{grid-column:span 3}
.cc-st-card-hints{grid-column:2;grid-row:1}
.cc-st-card-loc{grid-column:1;grid-row:1 / span 2}
.cc-st-card-danger{grid-column:2;grid-row:2}

/* Cards */
.cc-st-card{background:var(--cc-card);border:1px solid var(--cc-border);border-radius:12px;padding:20px;box-sizing:border-box;min-width:0;box-shadow:0 10px 26px rgba(48,39,34,.035)}
.cc-st-card-title{font-family:'DM Serif Display',Georgia,serif;font-weight:400;font-size:20px;color:var(--cc-text);margin:0 0 6px;display:flex;align-items:center;gap:8px}
.cc-st-swoop-sm{display:block;max-width:100%;height:10px;border-top:2.5px solid var(--cc-accent);border-radius:50%;transform:rotate(-2deg);margin-bottom:16px}

/* Labels */
.cc-st-label{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:var(--cc-text-3);margin-bottom:8px}

/* Theme toggles */
.cc-st-theme-btns{display:flex;gap:10px;margin-bottom:10px}
.cc-st-theme-btn{width:64px;height:52px;border-radius:10px;border:2px solid transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:border-color .15s}
.cc-st-theme-btn.active{border-color:var(--cc-accent);box-shadow:0 2px 8px rgba(0,0,0,.15)}
.cc-st-theme-light{background:#f5ede5;color:#c27b6a}
.cc-st-theme-dark{background:#2a2020;color:#fff}
.cc-st-hint-toggle .cc-st-theme-btn{width:64px;height:52px;background:var(--cc-bg-2);color:var(--cc-text-2);font-weight:700}
.cc-st-hint-toggle .cc-st-theme-btn.active{background:var(--cc-accent-light);color:var(--cc-text)}

/* Accent circles */
.cc-st-accents{display:flex;gap:10px;margin-bottom:18px}
.cc-st-accent-btn{width:28px;height:28px;border-radius:50%;border:2.5px solid transparent;cursor:pointer;transition:transform .12s,border-color .12s;display:flex;align-items:center;justify-content:center}
.cc-st-accent-btn.active{border-color:#fff;box-shadow:0 0 0 2.5px var(--cc-accent);transform:scale(1.12)}

/* Caveat decorative text */
.cc-st-caveat{font-family:'Caveat',cursive;font-size:18px;color:var(--cc-accent);display:flex;align-items:center;gap:6px;margin-top:10px}

/* Action rows (data & backup) */
.cc-st-action-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 0;border-bottom:1px solid var(--cc-border);cursor:pointer;color:var(--cc-text);font-size:12.5px;font-weight:500;transition:color .12s}
.cc-st-action-row{width:100%;background:none;border-left:0;border-right:0;border-top:0;font-family:inherit;text-align:left}
.cc-st-action-row:hover{color:var(--cc-accent)}
.cc-st-action-row:disabled{cursor:wait;opacity:.55}
.cc-st-action-row:last-child{border-bottom:none}
.cc-st-action-left{display:flex;align-items:center;gap:9px;color:inherit}
.cc-st-backup-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding-top:14px}
.cc-st-backup-label{display:flex;align-items:center;gap:7px;font-size:12px;font-weight:700;color:var(--cc-text)}
.cc-st-backup-sub{font-size:11px;color:var(--cc-text-3);display:flex;align-items:center;justify-content:flex-end;gap:8px;white-space:nowrap}

/* Select inputs */
.cc-st-select{appearance:none;border:1px solid var(--cc-border);border-radius:9px;padding:6px 28px 6px 10px;font-size:12px;color:var(--cc-text);background:var(--cc-card);outline:0;cursor:pointer;font-family:inherit}
.cc-st-select-wrap{position:relative;display:inline-flex}
.cc-st-select-wrap .cc-st-select{width:100%}
.cc-st-select-arrow{position:absolute;right:8px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--cc-text-3)}

/* Privacy rows */
.cc-st-priv-row{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;padding:12px 0;border-bottom:1px solid var(--cc-border)}
.cc-st-priv-row:last-child{border-bottom:none}
.cc-st-priv-left{display:flex;align-items:flex-start;gap:10px}
.cc-st-priv-icon-wrap{width:30px;height:30px;border-radius:50%;background:var(--cc-bg-3);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}
.cc-st-priv-title{font-size:12.5px;font-weight:700;color:var(--cc-text);margin-bottom:2px}
.cc-st-priv-sub{font-size:11px;color:var(--cc-text-3)}

/* Localisation */
.cc-st-loc-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
.cc-st-loc-field{display:flex;flex-direction:column;gap:6px}
.cc-st-field-label{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:700;color:var(--cc-text-2)}
.cc-st-input{border:1px solid var(--cc-border);border-radius:9px;padding:7px 11px;font-size:12px;color:var(--cc-text);background:var(--cc-card);outline:0;font-family:inherit;width:100%;box-sizing:border-box}
.cc-st-goal-row{display:flex;align-items:center;gap:8px}
.cc-st-goal-input{border:1px solid var(--cc-border);border-radius:9px;padding:7px 11px;font-size:12px;color:var(--cc-text);background:var(--cc-card);outline:0;font-family:inherit;width:72px;text-align:right}
.cc-st-goal-unit{font-size:12px;color:var(--cc-text-3)}
.cc-st-plat-list{display:flex;flex-direction:column;gap:9px;margin-top:4px}
.cc-st-plat-row{display:flex;align-items:center;gap:9px;font-size:12.5px;color:var(--cc-text)}
.cc-st-plat-name{flex:1}
.cc-st-plat-count{font-weight:700;color:var(--cc-text)}
.cc-st-target-input{width:54px;border:1px solid var(--cc-border);border-radius:7px;background:var(--cc-card);color:var(--cc-text);font:inherit;font-size:11px;padding:5px 7px;text-align:right}
.cc-st-message{margin-top:10px;padding:8px 10px;border-radius:8px;background:var(--cc-accent-light);color:var(--cc-text-2);font-size:10.5px;line-height:1.4}
.cc-st-message.error{background:#fbe5e2;color:#a3493e}
.cc-st-reminder{margin-top:12px;padding:10px;border:1px solid var(--cc-border);border-radius:9px;background:var(--cc-bg-2);font-size:10.5px;color:var(--cc-text-2)}
.cc-st-reminder button{border:0;background:none;color:var(--cc-accent);font:inherit;font-weight:700;cursor:pointer;padding:4px 0 0}
.cc-st-print-report{display:none}

/* Danger zone */
.cc-st-danger-title{color:#c05040}
.cc-st-danger-swoop{border-top-color:#e07060}
.cc-st-reset-row{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;color:var(--cc-text);margin-bottom:8px}
.cc-st-reset-desc{font-size:11px;color:var(--cc-text-3);line-height:1.5;margin-bottom:16px}
.cc-st-reset-btn{width:100%;height:38px;display:flex;align-items:center;justify-content:center;gap:7px;background:linear-gradient(90deg,#d96d49,#dc815f);color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;box-shadow:0 4px 12px rgba(201,99,65,.22)}
.cc-st-reset-btn:hover{opacity:.92}
@media(max-width:1320px){.cc-st-card-appearance{grid-column:span 12}.cc-st-card-backup,.cc-st-card-privacy{grid-column:span 6}.cc-st-row2{grid-template-columns:repeat(2,minmax(0,1fr))}.cc-st-card-loc{grid-column:1/-1;grid-row:auto}.cc-st-card-hints,.cc-st-card-danger{grid-column:auto;grid-row:auto}}
@media(max-width:760px){.cc-st-header{flex-direction:column}.cc-st-header-right{align-items:flex-start}.cc-st-meta{flex-wrap:wrap;gap:10px}.cc-st-body{grid-template-columns:1fr}.cc-st-card-appearance,.cc-st-card-backup,.cc-st-card-privacy{grid-column:1/-1;max-width:none}.cc-st-row2{grid-template-columns:1fr}.cc-st-card-loc,.cc-st-card-hints,.cc-st-card-danger{grid-column:1/-1;grid-row:auto}.cc-st-loc-grid{grid-template-columns:1fr}.cc-st-backup-row{align-items:flex-start;flex-direction:column}.cc-st-backup-sub{justify-content:flex-start;white-space:normal}.cc-st-heading{font-size:28px}}
@media print{body *{visibility:hidden!important}.cc-st-print-report,.cc-st-print-report *{visibility:visible!important}.cc-st-print-report{display:block!important;position:absolute;inset:0;background:#fff;color:#222;padding:30px;font-family:Arial,sans-serif}.cc-st-print-report table{width:100%;border-collapse:collapse;margin-top:18px}.cc-st-print-report th,.cc-st-print-report td{border-bottom:1px solid #ddd;padding:7px;text-align:left;font-size:11px}.cc-st-print-report h1,.cc-st-print-report h2{font-family:Georgia,serif}}
`;

/* ── Platform icons (inline SVG) ── */
/* ── Reusable card swoop underline ── */
function Swoop({ className = '' }: { className?: string }) {
  return <span className={`cc-st-swoop-sm ${className}`} style={{ width: '78%' }} />;
}

/* ── Chevron down (for selects) ── */
function ChevDown() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}

export default function Settings() {
  const {
    clearWorkspaceData, theme, accent, settings, setTheme, setAccent, updateSettings,
    recordSuccessfulBackup, dismissBackupReminder, reloadWorkspaceData, importScheduleRecords,
    campaigns, posts, pipelineItems, performanceRecords, userName, setUserName,
  } = useContentCalendarStore();
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [hintsEnabled, setHintsEnabled] = useState(() => localStorage.getItem(CONTENT_CALENDAR_HINTS_KEY) !== 'false');
  const [now] = useState(() => new Date());
  const [displayNameDraft, setDisplayNameDraft] = useState(() => ({ source: userName, value: userName }));
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const activePlatforms = getActivePlatformOptions();
  const reminderDue = backupReminderIsDue(settings, now);
  const accents: ContentCalendarAccent[] = ['#d97856', '#9e6080', '#7a9db5', '#d4a843'];
  const currentDateLabel = now.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const displayName = displayNameDraft.source === userName ? displayNameDraft.value : userName;
  const reportRows = useMemo(() => {
    const rows = new Map<string, { id: string; composerId?: string; pipelineId?: string; title: string; status: string; date: string; platforms: string[]; type: string; campaignId?: string }>();
    posts.forEach(post => rows.set(post.pipelineId ? `pipeline:${post.pipelineId}` : `post:${post.id}`, { id: post.id, composerId: post.composerId, pipelineId: post.pipelineId, title: post.title, status: post.status, date: post.date, platforms: post.platforms, type: post.type, campaignId: post.campaignId }));
    pipelineItems.forEach(item => rows.set(`pipeline:${item.id}`, {
      id: item.id,
      composerId: item.composerId,
      pipelineId: item.id,
      title: item.title,
      status: item.stage === 'published' ? 'Published' : item.stage === 'ready' ? 'Scheduled' : item.stage === 'drafting' ? 'Draft' : 'Planned',
      date: item.scheduledDate,
      platforms: item.platforms,
      type: item.contentType,
      campaignId: item.campaignId,
    }));
    return Array.from(rows.values()).filter(row => row.date.startsWith(monthKey)).sort((a, b) => a.date.localeCompare(b.date));
  }, [monthKey, pipelineItems, posts]);
  const platformReport = activePlatforms.map(platform => ({
    label: platform.label,
    count: reportRows.filter(row => row.platforms.includes(platform.id)).length,
  })).filter(item => item.count > 0);
  const campaignReport = campaigns.map(campaign => ({
    campaign,
    count: reportRows.filter(row => row.campaignId === campaign.id).length,
  })).filter(item => item.count > 0);
  const performanceReport = performanceRecords.map(record => ({
    record,
    row: reportRows.find(row => [row.id, row.composerId, row.pipelineId].includes(record.postId)),
  })).filter(entry => entry.row);

  function saveDisplayName() {
    const trimmedName = displayName.trim();
    setUserName(trimmedName);
    setDisplayNameDraft({ source: trimmedName, value: trimmedName });
  }

  function toggleHints(enabled: boolean) {
    setHintsEnabled(enabled);
    localStorage.setItem(CONTENT_CALENDAR_HINTS_KEY, String(enabled));
    if (enabled) localStorage.removeItem(CONTENT_CALENDAR_PAGE_INTROS_KEY);
  }

  function showError(error: unknown) {
    setMessage({ text: error instanceof Error ? error.message : 'The action could not be completed.', error: true });
  }

  async function exportJson() {
    setBusy(true); setMessage(null);
    try {
      const backup = await createWorkspaceBackup(settings);
      downloadTextFile(`content-edit-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(backup, null, 2), 'application/json');
      recordSuccessfulBackup();
      setMessage({ text: `Backup exported with ${backup.media.length} image${backup.media.length === 1 ? '' : 's'}.` });
    } catch (error) { showError(error); } finally { setBusy(false); }
  }

  async function importJson(file: File) {
    setBusy(true); setMessage(null);
    try {
      const parsed = JSON.parse(await file.text()) as unknown;
      if (!window.confirm('Replace the current content-calendar workspace with this backup?')) return;
      await restoreWorkspaceBackup(parsed);
      reloadWorkspaceData();
      setMessage({ text: 'Workspace restored successfully.' });
    } catch (error) { showError(error); } finally { setBusy(false); if (jsonInputRef.current) jsonInputRef.current.value = ''; }
  }

  function exportCsv() {
    try {
      const csv = createScheduleCsv(posts, pipelineItems, campaigns);
      downloadTextFile(`content-edit-schedule-${new Date().toISOString().slice(0, 10)}.csv`, csv, 'text/csv;charset=utf-8');
      setMessage({ text: 'Content schedule exported.' });
    } catch (error) { showError(error); }
  }

  async function importCsv(file: File) {
    setBusy(true); setMessage(null);
    try {
      const result = parseScheduleCsv(await file.text(), {
        campaigns,
        validPlatforms: new Set(activePlatforms.map(platform => platform.id)),
        isValidPostType: (platform, postType) => getPlatformConfig(platform).postTypes.some(type => type.id === postType),
      });
      if (!result.records.length) throw new Error('No valid schedule rows were found.');
      importScheduleRecords(result.records);
      setMessage({ text: `Imported ${result.records.length} row${result.records.length === 1 ? '' : 's'}${result.skipped ? `; skipped ${result.skipped} invalid row${result.skipped === 1 ? '' : 's'}` : ''}.` });
    } catch (error) { showError(error); } finally { setBusy(false); if (csvInputRef.current) csvInputRef.current.value = ''; }
  }

  return (
    <>
      <style>{PAGE_CSS}</style>
      <div className="cc-st-page">

        {/* ── Header ── */}
        <div className="cc-st-header">
          <div>
            <div className="cc-st-heading-row">
              <h1 className="cc-st-heading">Make the workspace yours.</h1>
              <Sparkles size={22} style={{ color: '#e6ad3f', transform: 'rotate(-10deg)', flexShrink: 0 }} />
            </div>
            <span className="cc-st-swoop" />
          </div>
          <div className="cc-st-header-right">
            <div className="cc-st-meta">
              <div className="cc-date-range">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                {currentDateLabel}
              </div>
              <span className="cc-local-badge">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                Local only
              </span>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="cc-st-body">

          {/* ── Row 1 ── */}
          <div className="cc-st-row1">

            {/* 1. Appearance */}
            <div className="cc-st-card cc-st-card-appearance">
              <h2 className="cc-st-card-title">Appearance</h2>
              <Swoop />

              <div className="cc-st-label">Theme</div>
              <div className="cc-st-theme-btns">
                <button
                  className={`cc-st-theme-btn cc-st-theme-light${theme === 'light' ? ' active' : ''}`}
                  onClick={() => setTheme('light')}
                >
                  <Sun size={20} />
                </button>
                <button
                  className={`cc-st-theme-btn cc-st-theme-dark${theme === 'dark' ? ' active' : ''}`}
                  onClick={() => setTheme('dark')}
                >
                  <Moon size={20} />
                </button>
              </div>
             

              <div className="cc-st-label">Theme accent</div>
              <div className="cc-st-accents">
                {accents.map(c => (
                  <button
                    key={c}
                    className={`cc-st-accent-btn${accent === c ? ' active' : ''}`}
                    style={{ background: c, borderColor: accent === c ? '#fff' : 'transparent', boxShadow: accent === c ? `0 0 0 2.5px ${c}` : undefined }}
                    onClick={() => setAccent(c)}

                  >
                    {accent === c && (
                      <svg width="12" height="12" viewBox="0 0 12 12">
                        <polyline points="2,6 5,9 10,3" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round"/>
                      </svg>
                    )}
                  </button>
                ))}
              </div>

              <div className="cc-st-label">Your name</div>
              <input
                className="cc-st-input"
                value={displayName}
                onChange={event => setDisplayNameDraft({ source: userName, value: event.target.value })}
                onBlur={saveDisplayName}
                onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); saveDisplayName(); event.currentTarget.blur(); } }}
                placeholder="Your name"
                aria-label="Your name"
              />
              <div className="cc-st-priv-sub" style={{ marginTop: 6 }}>Used in your dashboard and post previews.</div>

              <div className="cc-st-caveat">
                Small details. Big mood.
                <Sparkles size={16} color="#d4a843" style={{ marginLeft: 'auto' }} />
              </div>
            </div>

            {/* 2. Data & backup */}
            <div className="cc-st-card cc-st-card-backup">
              <h2 className="cc-st-card-title">Data &amp; backup</h2>
              <Swoop />

              <button className="cc-st-action-row" disabled={busy} onClick={() => void exportJson()}><span className="cc-st-action-left"><Download size={14} />Export JSON</span><ChevronRight size={14} /></button>
              <button className="cc-st-action-row" disabled={busy} onClick={() => jsonInputRef.current?.click()}><span className="cc-st-action-left"><Upload size={14} />Import JSON</span><ChevronRight size={14} /></button>
              <button className="cc-st-action-row" disabled={busy} onClick={exportCsv}><span className="cc-st-action-left"><Download size={14} />Export CSV</span><ChevronRight size={14} /></button>
              <button className="cc-st-action-row" disabled={busy} onClick={() => csvInputRef.current?.click()}><span className="cc-st-action-left"><Upload size={14} />Import CSV</span><ChevronRight size={14} /></button>
              <button className="cc-st-action-row" disabled={busy} onClick={() => window.print()}><span className="cc-st-action-left"><Printer size={14} />Print report</span><ChevronRight size={14} /></button>
              <input ref={jsonInputRef} hidden type="file" accept="application/json,.json" onChange={event => { const file = event.target.files?.[0]; if (file) void importJson(file); }} />
              <input ref={csvInputRef} hidden type="file" accept="text/csv,.csv" onChange={event => { const file = event.target.files?.[0]; if (file) void importCsv(file); }} />

              <div className="cc-st-backup-row">
                <span className="cc-st-backup-label">
                  <Clock size={14} color="#9a8a82" />
                  Backup reminder
                </span>
                <span className="cc-st-backup-sub">
                  Remind me every
                  <div className="cc-st-select-wrap">
                    <select
                      className="cc-st-select"
                      value={settings.backupIntervalDays}
                      onChange={event => updateSettings({ backupIntervalDays: Number(event.target.value) as 3 | 7 | 14 | 30 })}
                    >
                      <option value={3}>3 days</option>
                      <option value={7}>7 days</option>
                      <option value={14}>14 days</option>
                      <option value={30}>30 days</option>
                    </select>
                    <span className="cc-st-select-arrow"><ChevDown /></span>
                  </div>
                </span>
              </div>
              {reminderDue && <div className="cc-st-reminder">Your workspace backup is due.<br /><button type="button" onClick={dismissBackupReminder}>Remind me tomorrow</button></div>}
              {message && <div className={`cc-st-message${message.error ? ' error' : ''}`}>{message.text}</div>}
            </div>

            {/* 3. Privacy */}
            <div className="cc-st-card cc-st-card-privacy">
              <h2 className="cc-st-card-title">Privacy</h2>
              <Swoop />

              {/* Local-only privacy */}
              <div className="cc-st-priv-row">
                <div className="cc-st-priv-left">
                  <div className="cc-st-priv-icon-wrap">
                    <Lock size={14} color="#9a8a82" />
                  </div>
                  <div>
                    <div className="cc-st-priv-title">Local-only privacy</div>
                    <div className="cc-st-priv-sub">Nothing sent to any server</div>
                  </div>
                </div>
                <ShieldCheck size={16} color="#c8bdb5" />
              </div>

              <div className="cc-st-priv-row">
                <div className="cc-st-priv-left">
                  <div className="cc-st-priv-icon-wrap">
                    <HardDrive size={14} color="#9a8a82" />
                  </div>
                  <div>
                    <div className="cc-st-priv-title">Stored on this device</div>
                    <div className="cc-st-priv-sub">Use JSON backup to move or protect your workspace</div>
                  </div>
                </div>
                <FileCheck size={16} color="#c8bdb5" />
              </div>
            </div>

          </div>{/* end row1 */}

          {/* ── Row 2 ── */}
          <div className="cc-st-row2">

            {/* 5. Page hints */}
            <div className="cc-st-card cc-st-card-hints">
              <h2 className="cc-st-card-title">Page hints</h2>
              <Swoop />
              <p className="cc-st-priv-sub" style={{ lineHeight: 1.5, marginBottom: 14 }}>
                Show a tips dialog on first visit to each page.
              </p>
              <div className="cc-st-theme-btns cc-st-hint-toggle" style={{ marginBottom: 0 }}>
                <button type="button" className={`cc-st-theme-btn${hintsEnabled ? ' active' : ''}`} onClick={() => toggleHints(true)}>On</button>
                <button type="button" className={`cc-st-theme-btn${!hintsEnabled ? ' active' : ''}`} onClick={() => toggleHints(false)}>Off</button>
              </div>
              {hintsEnabled && <div className="cc-st-message">Turning hints on resets the page explanations so you can review them again.</div>}
            </div>

            {/* 6. Localisation */}
            <div className="cc-st-card cc-st-card-loc">
              <h2 className="cc-st-card-title">Localisation</h2>
              <Swoop />

              <div className="cc-st-loc-grid" style={{ marginBottom: 0 }}>
                <div className="cc-st-loc-field">
                  <div className="cc-st-field-label">
                    <CalendarDays size={13} color="#9a8a82" /> Date format
                  </div>
                  <div className="cc-st-select-wrap">
                    <select className="cc-st-select" style={{ width: '100%' }} value={settings.dateFormat} onChange={event => updateSettings({ dateFormat: event.target.value as DateFormatPreference })}>
                      <option value="medium">Apr 21, 2025</option>
                      <option value="day-first">21/04/2025</option>
                      <option value="month-first">04/21/2025</option>
                      <option value="iso">2025-04-21</option>
                    </select>
                    <span className="cc-st-select-arrow"><ChevDown /></span>
                  </div>
                </div>
                <div className="cc-st-loc-field">
                  <div className="cc-st-field-label">
                    <CalendarDays size={13} color="#9a8a82" /> First day of week
                  </div>
                  <div className="cc-st-select-wrap">
                    <select className="cc-st-select" style={{ width: '100%' }} value={settings.weekStartsOn} onChange={event => updateSettings({ weekStartsOn: Number(event.target.value) as WeekStartPreference })}>
                      <option value={1}>Monday</option>
                      <option value={0}>Sunday</option>
                      <option value={6}>Saturday</option>
                    </select>
                    <span className="cc-st-select-arrow"><ChevDown /></span>
                  </div>
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--cc-border)', margin: '18px 0' }} />

              <div className="cc-st-loc-grid">
                <div className="cc-st-loc-field">
                  <div className="cc-st-field-label">
                    <Target size={13} color="#9a8a82" /> Content goals
                  </div>
                  <div style={{ fontSize: 11, color: '#9a8a82', marginBottom: 7 }}>Monthly content goal</div>
                  <div className="cc-st-goal-row">
                    <input
                      type="number"
                      min={0}
                      step={1}
                      className="cc-st-goal-input"
                      value={settings.monthlyContentGoal}
                      onChange={event => { const value = Number(event.target.value); if (Number.isInteger(value) && value >= 0) updateSettings({ monthlyContentGoal: value }); }}
                    />
                    <span className="cc-st-goal-unit">posts</span>
                  </div>
                </div>
                <div className="cc-st-loc-field">
                  <div className="cc-st-field-label">
                    <Share2 size={13} color="#9a8a82" /> Platform targets
                  </div>
                  <div className="cc-st-plat-list">
                    {activePlatforms.map(platform => (
                      <div key={platform.id} className="cc-st-plat-row">
                        <span aria-hidden="true" style={{ width: 18, height: 18, borderRadius: 5, display: 'grid', placeItems: 'center', background: platform.config.color, color: '#fff', fontSize: 9, fontWeight: 800 }}>{platform.label.charAt(0)}</span>
                        <span className="cc-st-plat-name">{platform.label}</span>
                        <input
                          className="cc-st-target-input"
                          type="number"
                          min={0}
                          step={1}
                          aria-label={`${platform.label} monthly target`}
                          value={settings.platformTargets[platform.id] ?? 0}
                          onChange={event => {
                            const value = Number(event.target.value);
                            if (Number.isInteger(value) && value >= 0) updateSettings({ platformTargets: { ...settings.platformTargets, [platform.id]: value } });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 7. Danger zone */}
            <div className="cc-st-card cc-st-card-danger">
              <h2 className="cc-st-card-title cc-st-danger-title">
                <AlertTriangle size={18} color="#d97856" />
                Danger zone
              </h2>
              <Swoop className="cc-st-danger-swoop" />

              <div className="cc-st-reset-row">
                <RotateCw size={15} color="#9a8a82" />
                Clear workspace data
              </div>
              <p className="cc-st-reset-desc">
                This removes content-calendar records and local media from this device. This action cannot be undone.
              </p>

              <button className="cc-st-reset-btn" onClick={() => { if (window.confirm('Clear all content-calendar data and media from this device?')) void clearWorkspaceData(); }}>
                <RotateCw size={13} />
                Clear workspace data
              </button>

              <div className="cc-st-caveat" style={{ marginTop: 18, justifyContent: 'flex-end' }}>
                Use with caution.
                <svg width="44" height="18" viewBox="0 0 44 18" fill="none" style={{ marginLeft: 4 }}>
                  <path d="M2,14 Q16,2 42,8" stroke="#d97856" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
                  <path d="M38,5 L42,8 L37.5,10.5" stroke="#d97856" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                </svg>
              </div>
            </div>

          </div>{/* end row2 */}

        </div>
        <section className="cc-st-print-report" aria-hidden="true">
          <h1>The Content Edit — Monthly Report</h1>
          <p>{monthKey} · Generated {now.toLocaleString()}</p>
          <p>
            Goal: {reportRows.length} / {settings.monthlyContentGoal} posts · Planned {reportRows.filter(row => row.status === 'Planned').length} · Scheduled {reportRows.filter(row => row.status === 'Scheduled').length} · Published {reportRows.filter(row => row.status === 'Published').length}
          </p>
          <h2>Platform totals</h2>
          <p>{platformReport.length ? platformReport.map(item => `${item.label}: ${item.count}`).join(' · ') : 'No platform output recorded this month.'}</p>
          <h2>Campaign output</h2>
          <p>{campaignReport.length ? campaignReport.map(item => `${item.campaign.name}: ${item.count}`).join(' · ') : 'No campaign output recorded this month.'}</p>
          <h2>Content schedule</h2>
          <table>
            <thead><tr><th>Date</th><th>Title</th><th>Status</th><th>Platform</th><th>Type</th><th>Campaign</th></tr></thead>
            <tbody>
              {reportRows.map((row, index) => <tr key={`${row.title}-${row.date}-${index}`}><td>{formatContentDate(row.date, settings.dateFormat)}</td><td>{row.title}</td><td>{row.status}</td><td>{row.platforms.map(platform => getPlatformConfig(platform).label).join(', ')}</td><td>{row.type}</td><td>{campaigns.find(campaign => campaign.id === row.campaignId)?.name ?? '—'}</td></tr>)}
            </tbody>
          </table>
          <h2>Recorded performance</h2>
          {performanceReport.length ? <table>
            <thead><tr><th>Content</th><th>Views</th><th>Likes</th><th>Comments</th><th>Saves</th><th>Shares</th><th>Clicks</th></tr></thead>
            <tbody>{performanceReport.map(({ record, row }) => <tr key={record.id}><td>{row?.title}</td><td>{record.views}</td><td>{record.likes}</td><td>{record.comments}</td><td>{record.saves}</td><td>{record.shares}</td><td>{record.clicks}</td></tr>)}</tbody>
          </table> : <p>No performance data recorded for this month's schedule.</p>}
        </section>
      </div>
    </>
  );
}
