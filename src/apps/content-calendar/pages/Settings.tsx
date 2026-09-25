import { useState } from 'react';
import {
  CalendarDays, MapPin, Sparkles, Sun, Moon, Download, Upload,
  Printer, Clock, Lock, ShieldCheck, Cloud, Copy, CheckCircle2,
  ChevronRight, Target, Share2, LayoutTemplate, AlertTriangle, RotateCw,
} from 'lucide-react';

const PAGE_CSS = `
.cc-st-page{background:radial-gradient(circle at 70% 6%,rgba(255,255,255,.65),transparent 30%),#faf7f2;color:#1f2c31;min-height:100%;padding-bottom:40px}

/* Header */
.cc-st-header{display:flex;align-items:flex-start;justify-content:space-between;gap:24px;padding:18px 24px 16px;border-bottom:1px solid #ece4da}
.cc-st-heading-row{display:flex;align-items:center;gap:10px}
.cc-st-heading{font-family:'DM Serif Display',Georgia,serif;font-weight:400;font-size:32px;line-height:1;letter-spacing:-.02em;margin:0;color:#202e33}
.cc-st-swoop{display:block;width:162px;height:11px;margin-top:9px;border-top:3px solid #d97957;border-radius:50%;transform:rotate(-2deg)}
.cc-st-header-right{flex-shrink:0;display:flex;flex-direction:column;align-items:flex-end;gap:10px}
.cc-st-meta{display:flex;align-items:center;gap:18px;font-size:12px;font-weight:650;color:#3d2f2f}
.cc-st-date{display:flex;align-items:center;gap:7px}
.cc-st-local{display:flex;align-items:center;gap:6px;padding:5px 13px;background:#fae7c5;border-radius:99px;font-size:11px;color:#7a5a2a}

/* Grid layout */
.cc-st-body{padding:18px 24px 0;display:flex;flex-direction:column;gap:16px}
.cc-st-row1{display:grid;grid-template-columns:2fr 1.15fr 1.15fr 0.9fr;gap:14px;align-items:start}
.cc-st-row2{display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:14px;align-items:start}

/* Cards */
.cc-st-card{background:rgba(255,255,255,.9);border:1px solid #ece4da;border-radius:14px;padding:20px}
.cc-st-card-title{font-family:'DM Serif Display',Georgia,serif;font-weight:400;font-size:20px;color:#202e33;margin:0 0 6px;display:flex;align-items:center;gap:8px}
.cc-st-swoop-sm{display:block;height:10px;border-top:2.5px solid #d97957;border-radius:50%;transform:rotate(-2deg);margin-bottom:16px}

/* Labels */
.cc-st-label{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:#9a8a82;margin-bottom:8px}

/* Theme toggles */
.cc-st-theme-btns{display:flex;gap:10px;margin-bottom:10px}
.cc-st-theme-btn{width:64px;height:52px;border-radius:10px;border:2px solid transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:border-color .15s}
.cc-st-theme-btn.active{border-color:#d97856;box-shadow:0 2px 8px rgba(201,99,65,.18)}
.cc-st-theme-light{background:#f5ede5;color:#c27b6a}
.cc-st-theme-dark{background:#2a2020;color:#fff}
.cc-st-radio-row{display:flex;align-items:center;gap:18px;font-size:12px;color:#4a3a35;margin-bottom:18px}
.cc-st-radio-row label{display:flex;align-items:center;gap:5px;cursor:pointer}

/* Accent circles */
.cc-st-accents{display:flex;gap:10px;margin-bottom:18px}
.cc-st-accent-btn{width:28px;height:28px;border-radius:50%;border:2.5px solid transparent;cursor:pointer;transition:transform .12s,border-color .12s;display:flex;align-items:center;justify-content:center}
.cc-st-accent-btn.active{border-color:#fff;box-shadow:0 0 0 2.5px #d97856;transform:scale(1.12)}

/* Caveat decorative text */
.cc-st-caveat{font-family:'Caveat',cursive;font-size:18px;color:#c27b6a;display:flex;align-items:center;gap:6px;margin-top:10px}

/* Action rows (data & backup) */
.cc-st-action-row{display:flex;align-items:center;justify-content:space-between;padding:11px 0;border-bottom:1px solid #f2ece5;cursor:pointer;color:#3d2f2f;font-size:12.5px;font-weight:500;transition:color .12s}
.cc-st-action-row:hover{color:#d97856}
.cc-st-action-row:last-child{border-bottom:none}
.cc-st-action-left{display:flex;align-items:center;gap:9px;color:inherit}
.cc-st-backup-row{display:flex;align-items:center;justify-content:space-between;gap:8px;padding-top:14px}
.cc-st-backup-label{display:flex;align-items:center;gap:7px;font-size:12px;font-weight:700;color:#3d2f2f}
.cc-st-backup-sub{font-size:11px;color:#9a8a82;display:flex;align-items:center;gap:8px}

/* Select inputs */
.cc-st-select{appearance:none;border:1px solid #ece4da;border-radius:9px;padding:6px 28px 6px 10px;font-size:12px;color:#3d2f2f;background:rgba(255,255,255,.9);outline:0;cursor:pointer;font-family:inherit}
.cc-st-select-wrap{position:relative;display:inline-flex}
.cc-st-select-wrap .cc-st-select{width:100%}
.cc-st-select-arrow{position:absolute;right:8px;top:50%;transform:translateY(-50%);pointer-events:none;color:#9a8a82}

/* Privacy rows */
.cc-st-priv-row{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;padding:12px 0;border-bottom:1px solid #f2ece5}
.cc-st-priv-row:last-child{border-bottom:none}
.cc-st-priv-left{display:flex;align-items:flex-start;gap:10px}
.cc-st-priv-icon-wrap{width:30px;height:30px;border-radius:50%;background:#f0ede8;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}
.cc-st-priv-title{font-size:12.5px;font-weight:700;color:#202e33;margin-bottom:2px}
.cc-st-priv-sub{font-size:11px;color:#9a8a82}

/* Toggle switch */
.cc-st-toggle{width:38px;height:22px;border-radius:11px;border:none;cursor:pointer;position:relative;flex-shrink:0;margin-top:4px;transition:background .2s}
.cc-st-toggle.on{background:#3bb8a0}
.cc-st-toggle.off{background:#c8bdb5}
.cc-st-toggle::after{content:'';position:absolute;top:3px;width:16px;height:16px;border-radius:50%;background:#fff;transition:left .2s;box-shadow:0 1px 3px rgba(0,0,0,.18)}
.cc-st-toggle.on::after{left:19px}
.cc-st-toggle.off::after{left:3px}

/* PIN dots */
.cc-st-pin-dots{display:flex;gap:7px;margin-top:10px}
.cc-st-pin-dot{width:10px;height:10px;border-radius:50%;background:#2a2020}

/* Cross-device sync */
.cc-st-sync-code{display:flex;align-items:center;justify-content:space-between;background:#f5ede5;border-radius:9px;padding:9px 13px;margin:12px 0 10px;font-size:14px;font-weight:700;letter-spacing:.12em;color:#3d2f2f}
.cc-st-sync-status{display:flex;align-items:center;gap:6px;font-size:11px;color:#9a8a82}
.cc-st-sync-curl{display:flex;align-items:flex-end;justify-content:flex-end;margin-top:14px}

/* Localisation */
.cc-st-loc-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.cc-st-loc-field{display:flex;flex-direction:column;gap:6px}
.cc-st-field-label{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:700;color:#4a3a35}
.cc-st-input{border:1px solid #ece4da;border-radius:9px;padding:7px 11px;font-size:12px;color:#3d2f2f;background:rgba(255,255,255,.9);outline:0;font-family:inherit;width:100%;box-sizing:border-box}
.cc-st-goal-row{display:flex;align-items:center;gap:8px}
.cc-st-goal-input{border:1px solid #ece4da;border-radius:9px;padding:7px 11px;font-size:12px;color:#3d2f2f;background:rgba(255,255,255,.9);outline:0;font-family:inherit;width:72px;text-align:right}
.cc-st-goal-unit{font-size:12px;color:#9a8a82}
.cc-st-plat-list{display:flex;flex-direction:column;gap:9px;margin-top:4px}
.cc-st-plat-row{display:flex;align-items:center;gap:9px;font-size:12.5px;color:#3d2f2f}
.cc-st-plat-name{flex:1}
.cc-st-plat-count{font-weight:700;color:#1a2428}

/* Template defaults */
.cc-st-tmpl-field{margin-bottom:13px}
.cc-st-tmpl-field:last-of-type{margin-bottom:0}
.cc-st-tmpl-label{font-size:11px;font-weight:700;color:#4a3a35;margin-bottom:5px}
.cc-st-tmpl-select-wrap{position:relative}
.cc-st-tmpl-select{appearance:none;border:1px solid #ece4da;border-radius:9px;padding:8px 28px 8px 11px;font-size:12px;color:#3d2f2f;background:rgba(255,255,255,.9);outline:0;cursor:pointer;font-family:inherit;width:100%}
.cc-st-tmpl-arrow{position:absolute;right:9px;top:50%;transform:translateY(-50%);pointer-events:none;color:#9a8a82}

/* Danger zone */
.cc-st-danger-title{color:#c05040}
.cc-st-danger-swoop{border-top-color:#e07060}
.cc-st-reset-row{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;color:#3d2f2f;margin-bottom:8px}
.cc-st-reset-desc{font-size:11px;color:#7a6a62;line-height:1.5;margin-bottom:16px}
.cc-st-reset-btn{width:100%;height:38px;display:flex;align-items:center;justify-content:center;gap:7px;background:linear-gradient(90deg,#d96d49,#dc815f);color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;box-shadow:0 4px 12px rgba(201,99,65,.22)}
.cc-st-reset-btn:hover{opacity:.92}
`;

/* ── Platform icons (inline SVG) ── */
function IgIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="ig-g" x1="0" y1="24" x2="24" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f09433"/><stop offset=".25" stopColor="#e6683c"/>
          <stop offset=".5" stopColor="#dc2743"/><stop offset=".75" stopColor="#cc2366"/>
          <stop offset="1" stopColor="#bc1888"/>
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#ig-g)"/>
      <circle cx="12" cy="12" r="5" fill="none" stroke="#fff" strokeWidth="2"/>
      <circle cx="17.5" cy="6.5" r="1.3" fill="#fff"/>
    </svg>
  );
}
function TikTokIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <rect width="24" height="24" rx="5" fill="#010101"/>
      <text x="12" y="17.5" textAnchor="middle" fontSize="13" fontWeight="900" fill="#fff" fontFamily="Arial,sans-serif">T</text>
    </svg>
  );
}
function YoutubeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <rect width="24" height="24" rx="5" fill="#ff0000"/>
      <polygon points="9.5,7.5 18,12 9.5,16.5" fill="#fff"/>
    </svg>
  );
}
function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <rect width="24" height="24" rx="5" fill="#0f1419"/>
      <text x="12" y="17" textAnchor="middle" fontSize="12" fontWeight="800" fill="#fff" fontFamily="Arial,sans-serif">X</text>
    </svg>
  );
}

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
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [accent, setAccent] = useState('#d97856');
  const [pinEnabled, setPinEnabled] = useState(true);
  const [backupInterval, setBackupInterval] = useState('7 days');
  const [autoLock, setAutoLock] = useState('10 minutes');
  const [dateFormat, setDateFormat] = useState('Apr 21, 2025');
  const [firstDay, setFirstDay] = useState('Monday');
  const [contentGoal, setContentGoal] = useState('20');
  const [defaultType, setDefaultType] = useState('Idea');
  const [defaultLayout, setDefaultLayout] = useState('Carousel');
  const [defaultStyle, setDefaultStyle] = useState('Story');

  const accents = ['#d97856', '#9e6080', '#7a9db5', '#d4a843'];

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
              <span className="cc-st-date">
                <CalendarDays size={14} color="#c27b6a" />
                Apr 21 – Apr 27, 2025
              </span>
              <span className="cc-st-local">
                <MapPin size={11} />
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
            <div className="cc-st-card">
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
                    style={{ background: c, borderColor: accent === c ? '#fff' : 'transparent' }}
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

              <div className="cc-st-caveat">
                Small details. Big mood.
                <Sparkles size={16} color="#d4a843" style={{ marginLeft: 'auto' }} />
              </div>
            </div>

            {/* 2. Data & backup */}
            <div className="cc-st-card">
              <h2 className="cc-st-card-title">Data &amp; backup</h2>
              <Swoop />

              {[
                { icon: <Download size={14} />, label: 'Export JSON' },
                { icon: <Upload size={14} />,   label: 'Import JSON' },
                { icon: <Download size={14} />, label: 'Export CSV' },
                { icon: <Upload size={14} />,   label: 'Import CSV' },
                { icon: <Printer size={14} />,  label: 'Print report' },
              ].map(row => (
                <div key={row.label} className="cc-st-action-row">
                  <span className="cc-st-action-left" style={{ color: '#6b5a52' }}>{row.icon}{row.label}</span>
                  <ChevronRight size={14} color="#c8bdb5" />
                </div>
              ))}

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
                      value={backupInterval}
                      onChange={e => setBackupInterval(e.target.value)}
                    >
                      <option>3 days</option>
                      <option>7 days</option>
                      <option>14 days</option>
                      <option>30 days</option>
                    </select>
                    <span className="cc-st-select-arrow"><ChevDown /></span>
                  </div>
                </span>
              </div>
            </div>

            {/* 3. Privacy & Security */}
            <div className="cc-st-card">
              <h2 className="cc-st-card-title">Privacy &amp; Security</h2>
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

              {/* PIN lock */}
              <div className="cc-st-priv-row" style={{ flexDirection: 'column', gap: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                  <div className="cc-st-priv-left">
                    <div className="cc-st-priv-icon-wrap">
                      <Lock size={14} color="#9a8a82" />
                    </div>
                    <div>
                      <div className="cc-st-priv-title">PIN lock</div>
                      <div className="cc-st-priv-sub">Require a PIN to open the app</div>
                    </div>
                  </div>
                  <button
                    className={`cc-st-toggle ${pinEnabled ? 'on' : 'off'}`}
                    onClick={() => setPinEnabled(p => !p)}
                    aria-label="Toggle PIN lock"
                  />
                </div>
                {pinEnabled && (
                  <div className="cc-st-pin-dots">
                    {[0, 1, 2, 3].map(i => <span key={i} className="cc-st-pin-dot" />)}
                  </div>
                )}
              </div>

              {/* Auto-lock */}
              <div className="cc-st-priv-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
                <div className="cc-st-priv-left">
                  <div className="cc-st-priv-icon-wrap">
                    <Clock size={14} color="#9a8a82" />
                  </div>
                  <div>
                    <div className="cc-st-priv-title">Auto-lock</div>
                    <div className="cc-st-priv-sub">Lock after inactivity</div>
                  </div>
                </div>
                <div className="cc-st-select-wrap" style={{ width: '100%' }}>
                  <select
                    className="cc-st-select"
                    style={{ width: '100%' }}
                    value={autoLock}
                    onChange={e => setAutoLock(e.target.value)}
                  >
                    <option>1 minute</option>
                    <option>5 minutes</option>
                    <option>10 minutes</option>
                    <option>30 minutes</option>
                    <option>Never</option>
                  </select>
                  <span className="cc-st-select-arrow"><ChevDown /></span>
                </div>
              </div>
            </div>

            {/* 4. Cross-device sync */}
            <div className="cc-st-card">
              <Cloud size={24} color="#9a8a82" style={{ marginBottom: 10 }} />
              <h2 className="cc-st-card-title" style={{ fontSize: 18, marginBottom: 6 }}>Cross-device sync</h2>
              <p style={{ fontSize: 12, color: '#7a6a62', lineHeight: 1.5, margin: '0 0 4px' }}>
                Sync your data across devices with a simple code.
              </p>

              <div className="cc-st-sync-code">
                <span>7F3K-9D2Q</span>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#9a8a82', display: 'flex' }}>
                  <Copy size={14} />
                </button>
              </div>

              <div className="cc-st-sync-status">
                <CheckCircle2 size={13} color="#c8bdb5" />
                Not connected
              </div>

              <div className="cc-st-sync-curl">
                <div style={{ textAlign: 'right' }}>
                  <div className="cc-st-caveat" style={{ fontSize: 16, justifyContent: 'flex-end' }}>
                    Same ideas. Everywhere.
                  </div>
                  <svg width="60" height="18" viewBox="0 0 60 18" fill="none" style={{ marginTop: 2 }}>
                    <path d="M4,14 Q20,2 56,8" stroke="#d97856" strokeWidth="2" strokeLinecap="round" fill="none"/>
                    <path d="M52,5 L56,8 L51,10" stroke="#d97856" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                  </svg>
                </div>
              </div>
            </div>

          </div>{/* end row1 */}

          {/* ── Row 2 ── */}
          <div className="cc-st-row2">

            {/* 5. Localisation */}
            <div className="cc-st-card">
              <h2 className="cc-st-card-title">Localisation</h2>
              <Swoop />

              <div className="cc-st-loc-grid" style={{ marginBottom: 0 }}>
                <div className="cc-st-loc-field">
                  <div className="cc-st-field-label">
                    <CalendarDays size={13} color="#9a8a82" /> Date format
                  </div>
                  <div className="cc-st-select-wrap">
                    <select className="cc-st-select" style={{ width: '100%' }} value={dateFormat} onChange={e => setDateFormat(e.target.value)}>
                      <option>Apr 21, 2025</option>
                      <option>21/04/2025</option>
                      <option>04/21/2025</option>
                      <option>2025-04-21</option>
                    </select>
                    <span className="cc-st-select-arrow"><ChevDown /></span>
                  </div>
                </div>
                <div className="cc-st-loc-field">
                  <div className="cc-st-field-label">
                    <CalendarDays size={13} color="#9a8a82" /> First day of week
                  </div>
                  <div className="cc-st-select-wrap">
                    <select className="cc-st-select" style={{ width: '100%' }} value={firstDay} onChange={e => setFirstDay(e.target.value)}>
                      <option>Monday</option>
                      <option>Sunday</option>
                      <option>Saturday</option>
                    </select>
                    <span className="cc-st-select-arrow"><ChevDown /></span>
                  </div>
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #f0e8e0', margin: '18px 0' }} />

              <div className="cc-st-loc-grid">
                <div className="cc-st-loc-field">
                  <div className="cc-st-field-label">
                    <Target size={13} color="#9a8a82" /> Content goals
                  </div>
                  <div style={{ fontSize: 11, color: '#9a8a82', marginBottom: 7 }}>Monthly content goal</div>
                  <div className="cc-st-goal-row">
                    <input
                      type="number"
                      className="cc-st-goal-input"
                      value={contentGoal}
                      onChange={e => setContentGoal(e.target.value)}
                    />
                    <span className="cc-st-goal-unit">posts</span>
                  </div>
                </div>
                <div className="cc-st-loc-field">
                  <div className="cc-st-field-label">
                    <Share2 size={13} color="#9a8a82" /> Platform targets
                  </div>
                  <div className="cc-st-plat-list">
                    {[
                      { icon: <IgIcon />,       name: 'Instagram',  count: 10 },
                      { icon: <TikTokIcon />,   name: 'TikTok',     count: 6 },
                      { icon: <YoutubeIcon />,  name: 'YouTube',    count: 3 },
                      { icon: <XIcon />,        name: 'X (Twitter)', count: 1 },
                    ].map(p => (
                      <div key={p.name} className="cc-st-plat-row">
                        {p.icon}
                        <span className="cc-st-plat-name">{p.name}</span>
                        <span className="cc-st-plat-count">{p.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 6. Template defaults */}
            <div className="cc-st-card">
              <h2 className="cc-st-card-title">
                <LayoutTemplate size={17} color="#9a8a82" />
                Template defaults
              </h2>
              <Swoop />

              {[
                { label: 'Default content type', value: defaultType,   set: setDefaultType,   opts: ['Idea', 'Post', 'Story', 'Reel'] },
                { label: 'Default layout',        value: defaultLayout, set: setDefaultLayout, opts: ['Carousel', 'Single', 'Grid'] },
                { label: 'Default style',         value: defaultStyle,  set: setDefaultStyle,  opts: ['Story', 'Minimal', 'Bold', 'Branded'] },
              ].map(f => (
                <div key={f.label} className="cc-st-tmpl-field">
                  <div className="cc-st-tmpl-label">{f.label}</div>
                  <div className="cc-st-tmpl-select-wrap">
                    <select className="cc-st-tmpl-select" value={f.value} onChange={e => f.set(e.target.value)}>
                      {f.opts.map(o => <option key={o}>{o}</option>)}
                    </select>
                    <span className="cc-st-tmpl-arrow"><ChevDown /></span>
                  </div>
                </div>
              ))}

              <div className="cc-st-caveat" style={{ marginTop: 18 }}>
                Start faster. Create more.
                <Sparkles size={14} color="#d4a843" style={{ marginLeft: 4 }} />
              </div>
            </div>

            {/* 7. Danger zone */}
            <div className="cc-st-card">
              <h2 className="cc-st-card-title cc-st-danger-title">
                <AlertTriangle size={18} color="#d97856" />
                Danger zone
              </h2>
              <Swoop className="cc-st-danger-swoop" />

              <div className="cc-st-reset-row">
                <RotateCw size={15} color="#9a8a82" />
                Reset demo data
              </div>
              <p className="cc-st-reset-desc">
                This will remove all sample content, including ideas, posts, and settings. This action cannot be undone.
              </p>

              <button className="cc-st-reset-btn">
                <RotateCw size={13} />
                Reset demo data
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
      </div>
    </>
  );
}
