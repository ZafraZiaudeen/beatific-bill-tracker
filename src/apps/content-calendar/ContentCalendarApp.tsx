import { useState } from 'react';
import { useContentCalendarStore } from './store';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Pipeline from './pages/Pipeline';
import Ideas from './pages/Ideas';
import Composer from './pages/Composer';
import Templates from './pages/Templates';
import Campaigns from './pages/CampaignsLive';
import Analytics from './pages/Analytics';
import PerformancePage from './pages/Performance';
import Settings from './pages/Settings';
import Platforms from './pages/Platforms';
import { ManagementPage } from './pages/ManagementPage';
import { ContentCalendarOnboardingModal } from './components/ContentCalendarOnboardingModal';
import { ContentCalendarPageIntro } from './components/ContentCalendarPageIntro';
import { sha256 } from '@/lib/crypto';

import type { ContentCalendarView } from './types';
import underlineImg from '../../assets/budget-assets/stationery-accents/stationery-accents-02.png';

const CC_HASH_SALT = 'cc-lic-v1';
const CC_ACTIVATED_KEY = 'cc_activated';

const IS_CUSTOMER_CC_BUILD =
  import.meta.env.VITE_CUSTOMER_CONTENT_CALENDAR_BUILD === 'true' ||
  (typeof window !== 'undefined' && Boolean(window.__CC_LICENSE_HASH__));

const HAS_LOCKED_VIEWS = typeof window !== 'undefined' && '__CC_LOCKED_VIEWS__' in window;
const LOCKED_VIEWS: ContentCalendarView[] = (
  typeof window !== 'undefined' ? (window.__CC_LOCKED_VIEWS__ ?? []) : []
) as ContentCalendarView[];

function LicenseOverlay({ onActivate }: { onActivate: () => void }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleUnlock = async () => {
    const trimmed = code.trim();
    if (!trimmed) { setError('Please enter your license code.'); return; }
    const expectedHash = window.__CC_LICENSE_HASH__;
    if (!expectedHash) { setError('This file is missing its embedded license hash.'); return; }
    const hash = await sha256(CC_HASH_SALT + trimmed);
    if (hash === expectedHash) {
      localStorage.setItem(CC_ACTIVATED_KEY, '1');
      setCode(''); setError(''); onActivate(); return;
    }
    setError('Invalid license code. Please check and try again.');
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9100, background: 'rgba(35,31,29,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'var(--cc-card)', border: '1px solid var(--cc-border)', borderRadius: 18, padding: '36px 32px', maxWidth: 380, width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(217,120,86,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#b5522a" strokeWidth="2" width="24" height="24"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
        </div>
        <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '1.3rem', fontWeight: 400, color: 'var(--cc-text)', margin: 0 }}>Unlock Content Calendar</h2>
        <p style={{ fontSize: '.875rem', color: 'var(--cc-text-2)', margin: 0 }}>Enter your license code to open this Content Calendar.</p>
        <input
          autoFocus value={code}
          onChange={e => { setCode(e.target.value); setError(''); }}
          onKeyDown={e => { if (e.key === 'Enter') void handleUnlock(); }}
          placeholder="License code"
          style={{ padding: '10px 14px', border: '1.5px solid var(--cc-border)', borderRadius: 10, background: 'var(--cc-input)', color: 'var(--cc-text)', font: '500 .9rem Nunito,sans-serif', outline: 'none' }}
        />
        {error && <span style={{ fontSize: '.82rem', color: '#e05050' }}>{error}</span>}
        <button onClick={() => void handleUnlock()} style={{ padding: '10px', border: 'none', borderRadius: 9, background: 'var(--cc-accent)', color: '#fff', font: '700 .9rem Nunito,sans-serif', cursor: 'pointer' }}>Unlock</button>
      </div>
    </div>
  );
}

function LicenseGateOverlay({ viewName, onUnlock, onCancel }: { viewName: string; onUnlock: () => void; onCancel: () => void }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleUnlock = async () => {
    const trimmed = code.trim();
    if (!trimmed) { setError('Please enter your license code.'); return; }
    if (!window.__CC_LICENSE_HASH__) { setError('This file is missing its license hash.'); return; }
    const hash = await sha256(CC_HASH_SALT + trimmed);
    if (hash === window.__CC_LICENSE_HASH__) {
      try { localStorage.setItem('cc-license-activated', '1'); } catch { /* Storage can be unavailable in embedded HTML previews. */ }
      setCode(''); setError(''); onUnlock(); return;
    }
    setError('Invalid license code. Try again.');
    setCode('');
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9100, background: 'rgba(35,31,29,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'var(--cc-card)', border: '1px solid var(--cc-border)', borderRadius: 18, padding: '32px', maxWidth: 380, width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(217,120,86,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#b5522a" strokeWidth="2" width="22" height="22"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
        </div>
        <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '1.2rem', fontWeight: 400, color: 'var(--cc-text)', margin: 0 }}>License required</h2>
        <p style={{ fontSize: '.875rem', color: 'var(--cc-text-2)', margin: 0 }}>
          <strong>{viewName}</strong> requires a license.<br />Enter the code you received to unlock it.
        </p>
        <input
          autoFocus value={code} type="password"
          onChange={e => { setCode(e.target.value); setError(''); }}
          onKeyDown={e => { if (e.key === 'Enter') void handleUnlock(); }}
          placeholder="License code"
          style={{ padding: '10px 14px', border: '1.5px solid var(--cc-border)', borderRadius: 10, background: 'var(--cc-input)', color: 'var(--cc-text)', font: '500 .9rem Nunito,sans-serif', outline: 'none' }}
        />
        {error && <span style={{ fontSize: '.82rem', color: '#e05050' }}>{error}</span>}
        <button onClick={() => void handleUnlock()} disabled={!code.trim()} style={{ padding: '10px', border: 'none', borderRadius: 9, background: 'var(--cc-accent)', color: '#fff', font: '700 .9rem Nunito,sans-serif', cursor: 'pointer', opacity: code.trim() ? 1 : 0.5 }}>Unlock</button>
        <button onClick={onCancel} style={{ padding: '8px', border: '1px solid var(--cc-border)', borderRadius: 9, background: 'transparent', color: 'var(--cc-text-2)', font: '500 .875rem Nunito,sans-serif', cursor: 'pointer' }}>Cancel</button>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: '.72rem', color: 'var(--cc-text-3)' }}>
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" width="11" height="11"><rect x="2" y="6" width="10" height="7" rx="1.5"/><path d="M5 6V4.5a2 2 0 014 0V6"/></svg>
          Unlocks all licensed features for this session
        </div>
      </div>
    </div>
  );
}

const CC_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Caveat:wght@400;600;700&display=swap');

.cc-app {
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: var(--cc-bg);
  font-family: 'Nunito', -apple-system, sans-serif;
  color: var(--cc-text);

  --cc-bg:       #f9f5f0;
  --cc-bg-2:     #f3ede6;
  --cc-bg-3:     #ece4da;
  --cc-card:     #ffffff;
  --cc-text:     #3d2f2f;
  --cc-text-2:   #6b5a52;
  --cc-text-3:   #8a7a72;
  --cc-border:   #ece4da;
  --cc-border-2: #d9cfc8;
  --cc-raised:   #fffaf6;
  --cc-input:    #ffffff;
  --cc-overlay:  rgba(35,31,29,.28);
  --cc-shadow:   rgba(48,39,34,.16);
  --cc-placeholder: #b0a098;
  --cc-accent-light:  color-mix(in srgb, var(--cc-accent) 15%, white);
  --cc-accent-medium: color-mix(in srgb, var(--cc-accent) 28%, white);
  --cc-accent-hover:  color-mix(in srgb, var(--cc-accent) 85%, black);
}

.cc-app.dark {
  --cc-bg:       #1c1410;
  --cc-bg-2:     #231a14;
  --cc-bg-3:     #2e2218;
  --cc-card:     #261d16;
  --cc-text:     #f2e8df;
  --cc-text-2:   #b4a090;
  --cc-text-3:   #7a6858;
  --cc-border:   #38291e;
  --cc-border-2: #44332a;
  --cc-raised:   #2c2119;
  --cc-input:    #2a2018;
  --cc-overlay:  rgba(8,5,3,.68);
  --cc-shadow:   rgba(0,0,0,.38);
  --cc-placeholder: #897668;
  --cc-accent-light:  color-mix(in srgb, var(--cc-accent) 22%, #1c1410);
  --cc-accent-medium: color-mix(in srgb, var(--cc-accent) 35%, #1c1410);
}

.cc-sidebar {
  width: 190px;
  flex-shrink: 0;
  background: var(--cc-bg-2);
  border-right: 1px solid var(--cc-border);
  display: flex;
  flex-direction: column;
  padding: 0 0 16px;
  overflow-y: auto;
}

.cc-sidebar-logo {
  padding: 20px 20px 38px;
  margin-bottom: 8px;
}

.cc-sidebar-logo-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--cc-text);
  line-height: 1.15;
  font-family: 'Caveat', cursive;
}

.cc-nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 15px;
  font-size: 13px;
  font-weight: 500;
  color: var(--cc-text-2);
  cursor: pointer;
  border: none;
  background: transparent;
  width: calc(100% - 24px);
  margin: 2px 12px;
  text-align: left;
  border-radius: 7px;
  transition: background 0.12s, color 0.12s;
}

.cc-nav-item:hover {
  background: var(--cc-border);
  color: var(--cc-text);
}

.cc-nav-item.active {
  background: var(--cc-accent-light);
  color: var(--cc-text);
  font-weight: 700;
}

.cc-sidebar-footer {
  margin-top: auto;
  padding: 12px 16px 0;
}

.cc-local-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  background: var(--cc-card);
  border: 1px solid var(--cc-border);
  border-radius: 99px;
  font-size: 10.5px;
  color: var(--cc-text-3);
  white-space: nowrap;
}

.cc-main {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: auto;
  overscroll-behavior: contain;
}

.cc-header {
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 22px 14px;
  border-bottom: 1px solid var(--cc-border);
}

.cc-header-left {
  flex-shrink: 0;
}

.cc-header-title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 28px;
  font-weight: 400;
  color: var(--cc-text);
  line-height: 1.15;
  margin: 0;
}

.cc-header-title-row2 {
  display: flex;
  align-items: center;
  gap: 6px;
}

.cc-header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  flex-shrink: 0;
}

.cc-header-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cc-date-range {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--cc-text-2);
  font-weight: 500;
}

.cc-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cc-search {
  display: flex;
  align-items: center;
  gap: 7px;
  background: var(--cc-card);
  border: 1px solid var(--cc-border);
  border-radius: 8px;
  padding: 6px 11px;
  font-size: 12px;
  color: var(--cc-text-3);
  width: 200px;
}

.cc-search input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--cc-text);
  font: inherit;
}

.cc-search input::placeholder {
  color: var(--cc-text-3);
}

.cc-filter-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: var(--cc-card);
  border: 1px solid var(--cc-border);
  border-radius: 8px;
  font-size: 11.5px;
  color: var(--cc-text-2);
  cursor: pointer;
  font-weight: 500;
  white-space: nowrap;
}

.cc-filter-btn select {
  appearance: none;
  border: 0;
  outline: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}

.cc-create-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 13px;
  background: var(--cc-accent);
  border: none;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  white-space: nowrap;
}

.cc-create-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  background: var(--cc-card);
  border: 1px solid var(--cc-border);
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.10);
  min-width: 140px;
  z-index: 100;
  overflow: hidden;
}

.cc-create-dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px;
  font-size: 13px;
  color: var(--cc-text);
  cursor: pointer;
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
}

.cc-create-dropdown-item:hover {
  background: var(--cc-bg);
}

.cc-content {
  flex: 1;
  min-height: min-content;
}

.cc-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 22px;
  color: var(--cc-text-3);
  gap: 12px;
}

/* Calendar page styles */
.cc-cal-toggle {
  display: flex;
  border: 1px solid var(--cc-border);
  border-radius: 8px;
  overflow: hidden;
}

.cc-cal-toggle-btn {
  padding: 6px 18px;
  font-size: 12.5px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  font-family: 'Nunito', sans-serif;
}

.cc-cal-toggle-btn.active {
  background: var(--cc-accent-medium);
  color: var(--cc-text);
}

.cc-cal-toggle-btn:not(.active) {
  background: transparent;
  color: var(--cc-text-3);
}

.cc-cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-left: 1px solid var(--cc-border);
  border-top: 1px solid var(--cc-border);
}

.cc-cal-day-header {
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  color: var(--cc-text-3);
  padding: 8px 4px;
  border-right: 1px solid var(--cc-border);
  border-bottom: 1px solid var(--cc-border);
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.cc-cal-day {
  height: 130px;
  min-height: 0;
  padding: 6px 6px 4px;
  border-right: 1px solid var(--cc-border);
  border-bottom: 1px solid var(--cc-border);
  vertical-align: top;
  cursor: default;
  box-sizing: border-box;
  overflow: hidden;
}

.cc-cal-grid.week-view .cc-cal-day {
  height: 520px;
  min-height: 0;
  overflow-y: auto;
}

.cc-cal-day.other-month {
  background: color-mix(in srgb, var(--cc-bg) 60%, var(--cc-bg-2));
}

.cc-cal-day-num {
  font-size: 12px;
  font-weight: 600;
  color: var(--cc-text);
  margin-bottom: 4px;
  display: inline-block;
  width: 22px;
  height: 22px;
  line-height: 22px;
  text-align: center;
  border-radius: 50%;
}

.cc-cal-day.other-month .cc-cal-day-num {
  color: var(--cc-border-2);
}

.cc-cal-day.today .cc-cal-day-num {
  background: var(--cc-accent);
  color: #fff;
}

.cc-cal-posts {
  height: calc(100% - 26px);
  overflow: hidden;
}

.cc-cal-posts.expanded {
  overflow-y: auto;
}

.cc-month-picker {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 20;
  width: 238px;
  padding: 10px;
  background: var(--cc-card);
  border: 1px solid var(--cc-border);
  border-radius: 8px;
  box-shadow: 0 12px 28px rgba(55,42,34,.16);
}

.cc-month-picker-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  color: var(--cc-text);
  font-size: 13px;
  font-weight: 700;
}

.cc-month-picker-head button,
.cc-month-picker-grid button {
  border: 1px solid var(--cc-border);
  background: var(--cc-card);
  color: var(--cc-text-2);
  border-radius: 6px;
  cursor: pointer;
  font-family: 'Nunito', sans-serif;
}

.cc-month-picker-head button {
  width: 28px;
  height: 26px;
}

.cc-month-picker-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.cc-month-picker-grid button {
  height: 30px;
  font-size: 11px;
  font-weight: 700;
}

.cc-month-picker-grid button.active {
  background: var(--cc-accent-light);
  border-color: var(--cc-accent);
  color: var(--cc-text);
}

.cc-post-mini {
  background: var(--cc-card);
  border: 1px solid var(--cc-border);
  border-radius: 5px;
  padding: 4px 5px;
  margin-bottom: 4px;
  display: flex;
  flex-direction: row;
  gap: 6px;
  align-items: stretch;
  position: relative;
  cursor: grab;
}
.cc-post-mini:active { cursor: grabbing; }
.cc-cal-more {
  display: block;
  width: 100%;
  padding: 3px 2px;
  border: none;
  background: transparent;
  color: #8a4a5f;
  font: 600 10px 'Nunito', sans-serif;
  text-align: left;
  cursor: pointer;
}
.cc-cal-more span {
  color: var(--cc-accent);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.cc-post-mini-delete {
  display: none;
  position: absolute;
  top: 2px;
  right: 2px;
  width: 16px;
  height: 16px;
  border-radius: 99px;
  background: #e05050;
  color: #fff;
  border: none;
  cursor: pointer;
  font-size: 11px;
  line-height: 1;
  padding: 0;
  align-items: center;
  justify-content: center;
}
.cc-post-mini:hover .cc-post-mini-delete { display: flex; }
.cc-cal-day.drag-over {
  background: var(--cc-accent-light);
  outline: 2px dashed var(--cc-accent);
  outline-offset: -2px;
}

.cc-week-post-item {
  display: flex;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid var(--cc-border);
  align-items: flex-start;
}

.cc-week-post-item:last-child {
  border-bottom: none;
}

/* Theme bridge for page-owned Peach styles. Layout and semantic colors stay page-owned. */
.cc-app{color-scheme:light}
.cc-app.dark{color-scheme:dark}
.cc-app.dark .cc-content,
.cc-app.dark .cc-an-page,
.cc-app.dark .cc-template-page,
.cc-app.dark .cc-pipeline-page,
.cc-app.dark .cc-ideas,
.cc-app.dark .cc-composer,
.cc-app.dark .cc-camp-page,
.cc-app.dark .pl-page{background:var(--cc-bg)!important;color:var(--cc-text)!important}
.cc-app.dark .cc-content h1,.cc-app.dark .cc-content h2,.cc-app.dark .cc-content h3,.cc-app.dark .cc-content h4,
.cc-app.dark .cc-content [class*="title"],.cc-app.dark .cc-content [class*="heading"],.cc-app.dark .cc-content [class*="name"]{color:var(--cc-text)!important}
.cc-app.dark .cc-content [class*="card"],.cc-app.dark .cc-content [class*="dialog"],.cc-app.dark .cc-content [class*="modal"],
.cc-app.dark .cc-content [class*="panel"],.cc-app.dark .cc-content [class*="toolbar"],.cc-app.dark .cc-content [class*="picker"]{background-color:var(--cc-card)!important;border-color:var(--cc-border)!important;box-shadow:none}
.cc-app.dark .cc-content input,.cc-app.dark .cc-content textarea,.cc-app.dark .cc-content select,
.cc-app.dark .cc-content [class*="search"]{background-color:var(--cc-input)!important;border-color:var(--cc-border)!important;color:var(--cc-text)!important}
.cc-app.dark .cc-content input::placeholder,.cc-app.dark .cc-content textarea::placeholder{color:var(--cc-placeholder)!important}
.cc-app.dark .cc-content [class*="overlay"]{background:var(--cc-overlay)!important}
.cc-app.dark .cc-content [style*="color: rgb(61, 47, 47)"],.cc-app.dark .cc-content [style*="color: rgb(31, 44, 49)"]{color:var(--cc-text)!important}
.cc-app.dark .cc-content [style*="background: rgb(255, 255, 255)"],.cc-app.dark .cc-content [style*="background-color: rgb(255, 255, 255)"]{background:var(--cc-card)!important}
.cc-app.dark .cc-an-stat,.cc-app.dark .cc-an-card,.cc-app.dark .cc-an-insights,
.cc-app.dark .cc-template-card,.cc-app.dark .cc-template-empty,.cc-app.dark .cc-template-note{background:var(--cc-card)!important;border-color:var(--cc-border)!important}
.cc-app.dark .cc-an-dialog,.cc-app.dark .cc-template-dialog,.cc-app.dark .cc-camp-modal,.cc-app.dark .cc-camp-detail-modal,
.cc-app.dark .cc-pipeline-modal{background:var(--cc-raised)!important;border-color:var(--cc-border)!important;color:var(--cc-text)!important}
.cc-app.dark .cc-template-description,.cc-app.dark .cc-template-detail-value,.cc-app.dark .cc-camp-goal-text,
.cc-app.dark .cc-details-list dt,.cc-app.dark .cc-field label,.cc-app.dark .cc-template-field label,
.cc-app.dark .cc-an-field label{color:var(--cc-text-2)!important}
.cc-app.dark .cc-template-icon-btn,.cc-app.dark .cc-camp-secondary,.cc-app.dark .cc-modal-secondary,
.cc-app.dark .cc-media-inline-trigger{background:var(--cc-input)!important;border-color:var(--cc-border)!important;color:var(--cc-text-2)!important}

.cc-app .cc-create-btn,.cc-app .cc-pipeline-add,.cc-app .cc-camp-add-btn,.cc-app .cc-template-add,
.cc-app .cc-an-create-btn,.cc-app .pl-add-btn,.cc-app .cc-composer-action.primary,
.cc-app .cc-add-idea,.cc-app .cc-modal-primary,.cc-app .cc-camp-primary,
.cc-app button.primary:not(.danger){background:var(--cc-accent)!important;border-color:var(--cc-accent)!important;color:var(--cc-accent-contrast)!important}
.cc-app .cc-pipeline-swoop,.cc-app .cc-ideas-line,.cc-app .cc-composer-line,.cc-app .cc-camp-swoop,
.cc-app .cc-an-swoop,.cc-app .cc-template-swoop,.cc-app .cc-template-line,.cc-app .pl-heading-line,
.cc-app .cc-st-swoop,.cc-app .cc-st-swoop-sm{border-color:var(--cc-accent)!important}
.cc-app .cc-an-details-btn,.cc-app .cc-template-use,.cc-app .cc-view-details,
.cc-app .cc-st-action-row:hover{color:var(--cc-accent)!important}
.cc-app .cc-asset-picker-upload{border-color:var(--cc-accent)!important;background:var(--cc-accent-light)!important;color:var(--cc-accent)!important}
.cc-app .cc-asset-picker-item.selected{box-shadow:inset 0 0 0 2px var(--cc-accent)!important}
.cc-app .cc-asset-picker-item input{accent-color:var(--cc-accent)}
.cc-app .cc-asset-picker-check,.cc-app .cc-camp-tl-dot,.cc-app .cc-camp-progress-bar{background:var(--cc-accent)!important}
.cc-app .cc-camp-platform-checks button.selected{border-color:var(--cc-accent)!important;background:var(--cc-accent-light)!important}
.cc-app :focus-visible{outline:2px solid var(--cc-accent)!important;outline-offset:2px}
.cc-app.dark .cc-pipeline-column{background:var(--cc-bg-2)!important}
.cc-app.dark [class^="cc-type-"],.cc-app.dark [class*=" cc-type-"]{background:var(--cc-bg-3)!important;color:var(--cc-text-2)!important}
.cc-app.dark .cc-social.tiktok{color:var(--cc-text-2)!important}
.cc-app.dark .cc-stat-icon{background:var(--cc-bg-3)!important}
.cc-app.dark .cc-camp-badge.launch,.cc-app.dark .cc-camp-badge.growth,.cc-app.dark .cc-camp-badge.brand,.cc-app.dark .cc-camp-tl-badge{background:var(--cc-bg-3)!important;color:var(--cc-text-2)!important}
`;

const NAV_ITEMS: { id: ContentCalendarView; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'campaigns', label: 'Campaigns' },
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'ideas', label: 'Ideas' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'performance', label: 'Performance' },
  { id: 'templates', label: 'Templates' },
  { id: 'platforms', label: 'Platforms' },
  { id: 'composer', label: 'Post Composer' },
  { id: 'settings', label: 'Settings' },
  ...(!IS_CUSTOMER_CC_BUILD ? [{ id: 'management' as ContentCalendarView, label: 'Management' }] : []),
];

const NAV_ICONS: Record<ContentCalendarView, React.ReactNode> = {
  dashboard: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  calendar: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  pipeline: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  ),
  ideas: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/>
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
    </svg>
  ),
  templates: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="7" rx="1"/>
      <rect x="3" y="14" width="8" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  analytics: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
      <line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  ),
  campaigns: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 11l19-9-9 19-2-8-8-2z"/>
    </svg>
  ),
  settings: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  platforms: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="4"/>
      <line x1="4.93" y1="4.93" x2="9.17" y2="9.17"/>
      <line x1="14.83" y1="14.83" x2="19.07" y2="19.07"/>
      <line x1="14.83" y1="9.17" x2="19.07" y2="4.93"/>
      <line x1="4.93" y1="19.07" x2="9.17" y2="14.83"/>
    </svg>
  ),
  composer: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z"/>
    </svg>
  ),
  performance: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  ),
  management: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="7.5" cy="14.5" r="3.5"/><path d="M10 12l8-8 2 2-2 2 2 2-2 2-2-2-4 4"/>
    </svg>
  ),
};

const VIEW_LABELS: Record<ContentCalendarView, string> = {
  dashboard: 'Dashboard', calendar: 'Calendar', pipeline: 'Pipeline',
  ideas: 'Ideas',
  templates: 'Templates', analytics: 'Analytics', campaigns: 'Campaigns',
  performance: 'Performance',
  settings: 'Settings',
  platforms: 'Platforms',
  composer: 'Post Composer',
  management: 'Management',
};

function PlaceholderView({ view }: { view: ContentCalendarView }) {
  return (
    <div className="cc-placeholder">
      <div style={{ fontSize: 40 }}>🗓</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: '#3d2f2f' }}>{VIEW_LABELS[view]}</div>
      <div style={{ fontSize: 13, color: '#8a7a72' }}>Coming soon — dashboard and calendar are fully implemented.</div>
    </div>
  );
}

export default function ContentCalendarApp() {
  const { activeView, setActiveView, openComposer, composerReturnView, theme, accent } = useContentCalendarStore();
  const accentContrast = accent === '#d4a843' ? '#30240f' : '#ffffff';

  const [licenseActive, setLicenseActive] = useState(() =>
    !IS_CUSTOMER_CC_BUILD ||
    !window.__CC_LICENSE_HASH__ ||
    localStorage.getItem(CC_ACTIVATED_KEY) === '1' ||
    localStorage.getItem('cc-license-activated') === '1'
  );

  const needsLicense = HAS_LOCKED_VIEWS && LOCKED_VIEWS.includes(activeView) && !licenseActive;

  const page = (() => {
    if (activeView === 'dashboard')   return <Dashboard />;
    if (activeView === 'campaigns')   return <Campaigns />;
    if (activeView === 'calendar')    return <Calendar />;
    if (activeView === 'pipeline')    return <Pipeline />;
    if (activeView === 'ideas')       return <Ideas />;
    if (activeView === 'analytics')   return <Analytics />;
    if (activeView === 'performance') return <PerformancePage />;
    if (activeView === 'templates')   return <Templates />;
    if (activeView === 'composer')    return <Composer />;
    if (activeView === 'platforms')   return <Platforms />;
    if (activeView === 'settings')    return <Settings />;
    if (activeView === 'management')  return IS_CUSTOMER_CC_BUILD ? <Dashboard /> : <ManagementPage />;
    return <PlaceholderView view={activeView} />;
  })();

  return (
    <>
      <style>{CC_CSS}</style>
      <div className={`cc-app${theme === 'dark' ? ' dark' : ''}`} style={{ '--cc-accent': accent, '--cc-accent-contrast': accentContrast } as React.CSSProperties}>

        {/* Sidebar */}
        <aside className="cc-sidebar">
          <div className="cc-sidebar-logo">
            <div className="cc-sidebar-logo-title">The Content<br />Edit</div>
          </div>

          <nav>
            {NAV_ITEMS.map((item) => {
              const isLocked = HAS_LOCKED_VIEWS && LOCKED_VIEWS.includes(item.id) && !licenseActive;
              return (
                <button
                  key={item.id}
                  className={`cc-nav-item${activeView === item.id ? ' active' : ''}`}
                  onClick={() => item.id === 'composer'
                    ? openComposer({ returnView: activeView === 'composer' ? composerReturnView : activeView })
                    : setActiveView(item.id)}
                >
                  <span style={{ opacity: 0.7 }}>{NAV_ICONS[item.id]}</span>
                  {item.label}
                  {isLocked && <span style={{ marginLeft: 'auto', fontSize: '.75rem', opacity: 0.7 }} title="Requires license">⚡</span>}
                </button>
              );
            })}
          </nav>

          <div className="cc-sidebar-footer">
            <div style={{ fontSize: 9, fontWeight: 700, color: '#b0a098', textAlign: 'center', lineHeight: 1.8, letterSpacing: '0.1em', marginBottom: 8, textTransform: 'uppercase' }}>
              Better content<br />builds a brighter<br />tomorrow
            </div>
            <img
              src={underlineImg}
              alt=""
              style={{ display: 'block', width: 80, height: 10, objectFit: 'cover', objectPosition: 'center bottom', opacity: 0.4, margin: '0 auto' }}
            />
          </div>
        </aside>

        {/* Main area */}
        <div className="cc-main">
          <div className="cc-content">
            {needsLicense ? (
              <LicenseGateOverlay
                viewName={VIEW_LABELS[activeView]}
                onUnlock={() => setLicenseActive(true)}
                onCancel={() => setActiveView('dashboard')}
              />
            ) : page}
          </div>
        </div>

        {!needsLicense && <ContentCalendarPageIntro view={activeView} />}
        <ContentCalendarOnboardingModal />
        {!licenseActive && !HAS_LOCKED_VIEWS && (
          <LicenseOverlay onActivate={() => setLicenseActive(true)} />
        )}
      </div>
    </>
  );
}
