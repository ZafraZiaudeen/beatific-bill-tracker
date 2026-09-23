import './ledgerly.css';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import sbDeco from '../../assets/budget-assets/flowers-and-leaves/flowers-and-leaves-06.png';
import sbDecoBotLeft from '../../assets/budget-assets/botanical-sprigs/botanical-sprigs-04.png';
import { useLedgerlyStore } from './store/useLedgerlyStore';
import { GoalsPage }        from './pages/GoalsPage';
import { GoalDetailPage }   from './pages/GoalDetailPage';
import { DebtPlannerPage }  from './pages/DebtPlannerPage';
import { BillsPage }        from './pages/BillsPage';
import { AccountsPage }     from './pages/AccountsPage';
import { DashboardPage }    from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { BudgetPage }       from './pages/BudgetPage';
import { NetWorthPage }     from './pages/NetWorthPage';
import { ReportsPage }      from './pages/ReportsPage';
import { CategoriesPage }   from './pages/CategoriesPage';
import { DataSecurityPage } from './pages/DataSecurityPage';
import { HelpPrivacyPage }  from './pages/HelpPrivacyPage';
import { ManagementPage }   from './pages/ManagementPage';
import { LedgerlyOnboardingModal } from './components/LedgerlyOnboardingModal';
import type { LedgerlyView } from './types';
import { sha256 } from '@/lib/crypto';

const LDG_HASH_SALT = 'ldg-lic-v1';
const LDG_ACTIVATED_KEY = 'ldg_activated';

declare global {
  interface Window {
    __LDG_LICENSE_HASH__?: string;
    __LDG_LOCKED_VIEWS__?: string[];
  }
}

const HAS_LOCKED_VIEWS = '__LDG_LOCKED_VIEWS__' in window;
const LOCKED_VIEWS: LedgerlyView[] = (window.__LDG_LOCKED_VIEWS__ ?? []) as LedgerlyView[];

const IS_CUSTOMER_BUDGET_BUILD =
  import.meta.env.VITE_CUSTOMER_BUDGET_BUILD === 'true' ||
  (typeof window !== 'undefined' && Boolean(window.__LDG_LICENSE_HASH__));

const SIDEBAR_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&display=swap');
.ldg-app { display: flex; height: 100%; background: var(--bg); overflow: hidden; font-family: Inter, system-ui, sans-serif; }
.ldg-sidebar { width: 240px; min-width: 240px; background: var(--sidebar-bg); display: flex; flex-direction: column; overflow: hidden; z-index: 200; position: relative; border-right: 1px solid var(--border); transition: transform .25s; }
.ldg-sb-brand { display: flex; align-items: center; gap: 10px; padding: 22px 18px 18px; border-bottom: 1px solid var(--border); flex-shrink: 0; position: relative; }
.ldg-sb-logo { width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ldg-sb-logo svg { width: 28px; height: 28px; stroke: var(--sidebar-text); stroke-width: 1.5; fill: none; }
.ldg-sb-name { font-family: "Playfair Display", serif; font-style: italic; font-size: 1.25rem; font-weight: 700; color: var(--sidebar-text-active); letter-spacing: -.2px; white-space: nowrap; }
.ldg-sb-nav { flex: 1; padding: 10px 10px; overflow-y: auto; overflow-x: hidden; }
.ldg-sb-nav::-webkit-scrollbar { width: 3px; }
.ldg-sb-nav::-webkit-scrollbar-track { background: transparent; }
.ldg-sb-nav::-webkit-scrollbar-thumb { background: rgba(90,126,94,.2); border-radius: 4px; }
.ldg-nav-item { display: flex; align-items: center; gap: 11px; padding: 9px 12px; border-radius: .75rem; color: var(--sidebar-text); font-size: .875rem; font-weight: 500; transition: all .15s; white-space: nowrap; width: 100%; text-align: left; position: relative; background: transparent; border: none; cursor: pointer; }
.ldg-nav-item svg { width: 17px; height: 17px; stroke-width: 1.8; flex-shrink: 0; stroke: var(--sidebar-text); }
.ldg-nav-item:hover { background: var(--sidebar-hover); color: var(--sidebar-text-active); }
.ldg-nav-item:hover svg { stroke: var(--sidebar-text-active); }
.ldg-nav-item.active { background: var(--sidebar-active-bg); color: var(--sidebar-text-active); box-shadow: 0 1px 4px rgba(45,74,46,.1); }
.ldg-nav-item.active svg { stroke: var(--sidebar-text); }
.ldg-sb-footer { padding: 12px 18px; border-top: 1px solid var(--border); font-size: .72rem; color: var(--text3); text-align: center; flex-shrink: 0; display: flex; align-items: center; justify-content: center; gap: 5px; }
.ldg-sb-lock-badge { margin-left: auto; font-size: .75rem; opacity: .7; flex-shrink: 0; }
.ldg-main { flex: 1; display: flex; flex-direction: column; min-width: 0; overflow: hidden; background: var(--bg); }
.ldg-content { flex: 1; overflow-y: auto; overflow-x: hidden; }
.ldg-content::-webkit-scrollbar { width: 6px; }
.ldg-content::-webkit-scrollbar-track { background: transparent; }
.ldg-content::-webkit-scrollbar-thumb { background: rgba(160,185,155,.4); border-radius: 6px; }
.ldg-mobile-topbar { display: none; align-items: center; gap: 10px; padding: 10px 16px; border-bottom: 1px solid var(--border); background: var(--sidebar-bg); flex-shrink: 0; }
.ldg-mobile-menu-btn { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border: none; background: none; cursor: pointer; color: var(--sidebar-text); border-radius: 8px; }
.ldg-mobile-menu-btn:hover { background: var(--sidebar-hover); }
.ldg-mobile-menu-btn svg { width: 20px; height: 20px; stroke: currentColor; stroke-width: 2; fill: none; }
.ldg-mobile-logo-name { font-family: "Playfair Display", serif; font-style: italic; font-size: 1.1rem; font-weight: 700; color: var(--sidebar-text-active); }
.ldg-sb-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,.45); z-index: 498; }
@media(max-width:768px){
  .ldg-mobile-topbar { display: flex; }
  .ldg-sidebar { position: fixed; top: 0; left: 0; height: 100%; transform: translateX(-100%); z-index: 500; width: 260px; min-width: 260px; box-shadow: 4px 0 24px rgba(0,0,0,.15); }
  .ldg-sidebar.ldg-sb-open { transform: translateX(0); }
  .ldg-sb-overlay.ldg-sb-open { display: block; }
}
@media(min-width:769px){
  .ldg-mobile-topbar { display: none !important; }
}
`;

const NAV: { id: LedgerlyView; label: string; icon: ReactNode }[] = [
  {
    id: 'dashboard', label: 'Dashboard',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>,
  },
  {
    id: 'budget', label: 'Budget',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21H16M12 17v4"/></svg>,
  },
  {
    id: 'transactions', label: 'Transactions',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M7 16L3 12l4-4M17 8l4 4-4 4"/><line x1="3" y1="12" x2="21" y2="12"/></svg>,
  },
  {
    id: 'bills', label: 'Bills',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/></svg>,
  },
  {
    id: 'accounts', label: 'Accounts',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  },
  {
    id: 'goals', label: 'Goals & Debt',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  },
  {
    id: 'networth', label: 'Net Worth',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>,
  },
  {
    id: 'reports', label: 'Reports',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 17V13M12 17V7M16 17v-5"/></svg>,
  },
  {
    id: 'categories', label: 'Categories',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1.5"/><circle cx="4" cy="12" r="1.5"/><circle cx="4" cy="18" r="1.5"/></svg>,
  },
  {
    id: 'security', label: 'Data & Security',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  },
  ...(!IS_CUSTOMER_BUDGET_BUILD ? [{
    id: 'management' as LedgerlyView, label: 'Management',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="7.5" cy="14.5" r="3.5"/><path d="M10 12l8-8 2 2-2 2 2 2-2 2-2-2-4 4"/></svg>,
  }] : []),
  {
    id: 'help', label: 'Help & Privacy',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  },
];

function getNavId(view: LedgerlyView): LedgerlyView {
  if (view === 'goal-detail' || view === 'debt-planner') return 'goals';
  return view;
}


function LockOverlay({ pinHash, onUnlock }: { pinHash: string; onUnlock: () => void }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const tryUnlock = async () => {
    if (await sha256(pin) === pinHash) {
      setPin('');
      setError('');
      onUnlock();
      return;
    }
    setError('Incorrect PIN. Try again.');
    setPin('');
  };

  return (
    <div className="ldg-lock-overlay">
      <div className="ldg-lock-card">
        <div className="ldg-lock-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="4" y="11" width="16" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
        </div>
        <h2>Ledgerly is locked</h2>
        <p>Enter your 4 digit PIN to continue.</p>
        <input
          autoFocus
          inputMode="numeric"
          maxLength={4}
          value={pin}
          onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
          onKeyDown={e => { if (e.key === 'Enter') void tryUnlock(); }}
          placeholder="PIN"
        />
        {error && <span className="ldg-lock-error">{error}</span>}
        <button onClick={() => void tryUnlock()} disabled={pin.length !== 4}>Unlock</button>
      </div>
    </div>
  );
}

function NameEntryModal() {
  const setUserName = useLedgerlyStore(s => s.setUserName);
  const [name, setName] = useState('');
  const [touched, setTouched] = useState(false);

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setTouched(true);
      return;
    }
    setUserName(trimmed);
  };

  return (
    <div className="ldg-name-overlay">
      <div className="ldg-name-card">
        <div className="ldg-name-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7h18" />
            <path d="M6 7v12h12V7" />
            <path d="M9 11h6" />
            <path d="M9 15h4" />
          </svg>
        </div>
        <h2>Welcome to Ledgerly</h2>
        <p>Your budget planner stays on this device. Before we begin, what should we call you?</p>
        <input
          autoFocus
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
          placeholder="Your name"
          aria-invalid={touched && !name.trim()}
        />
        {touched && !name.trim() && <span className="ldg-name-error">Please enter your name to continue.</span>}
        <button onClick={handleSubmit}>Get started</button>
      </div>
    </div>
  );
}

function LicenseOverlay({ onActivate }: { onActivate: () => void }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleUnlock = async () => {
    const trimmed = code.trim();
    if (!trimmed) {
      setError('Please enter your license code.');
      return;
    }
    const expectedHash = window.__LDG_LICENSE_HASH__;
    if (!expectedHash) {
      setError('This customer file is missing its embedded license hash.');
      return;
    }
    const hash = await sha256(LDG_HASH_SALT + trimmed);
    if (hash === expectedHash) {
      localStorage.setItem(LDG_ACTIVATED_KEY, '1');
      setCode('');
      setError('');
      onActivate();
      return;
    }
    setError('Invalid license code. Please check and try again.');
  };

  return (
    <div className="ldg-license-overlay">
      <div className="ldg-license-card">
        <div className="ldg-lock-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="4" y="11" width="16" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
        </div>
        <h2>Unlock Budget Planner</h2>
        <p>Enter your license code to open this Ledgerly budget planner.</p>
        <input
          autoFocus
          value={code}
          onChange={e => { setCode(e.target.value); setError(''); }}
          onKeyDown={e => { if (e.key === 'Enter') void handleUnlock(); }}
          placeholder="License code"
        />
        {error && <span className="ldg-lock-error">{error}</span>}
        <button onClick={() => void handleUnlock()}>Unlock</button>
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
    if (!window.__LDG_LICENSE_HASH__) { setError('This file is missing its license hash.'); return; }
    const hash = await sha256(LDG_HASH_SALT + trimmed);
    if (hash === window.__LDG_LICENSE_HASH__) {
      try { sessionStorage.setItem('ldg-license-activated', '1'); } catch {}
      setCode('');
      setError('');
      onUnlock();
      return;
    }
    setError('Invalid license code. Try again.');
    setCode('');
  };

  return (
    <div className="ldg-feat-lock-overlay">
      <div className="ldg-feat-lock-card">
        <div className="ldg-feat-lock-icon">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="11" width="16" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
        </div>
        <h2 className="ldg-feat-lock-title">License required</h2>
        <p className="ldg-feat-lock-desc">
          <strong>{viewName}</strong> requires a license.<br />
          Enter the code you received to unlock all licensed features.
        </p>
        <input
          autoFocus
          className="ldg-feat-lock-input"
          value={code}
          onChange={e => { setCode(e.target.value); setError(''); }}
          onKeyDown={e => { if (e.key === 'Enter') void handleUnlock(); }}
          placeholder="License code"
          type="password"
        />
        {error && <span className="ldg-lock-error">{error}</span>}
        <button className="ldg-feat-lock-btn" onClick={() => void handleUnlock()} disabled={!code.trim()}>
          Unlock
        </button>
        <button className="ldg-feat-lock-cancel" onClick={onCancel}>
          Cancel
        </button>
        <div className="ldg-feat-lock-note">
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" width="11" height="11">
            <rect x="2" y="6" width="10" height="7" rx="1.5"/>
            <path d="M5 6V4.5a2 2 0 014 0V6"/>
          </svg>
          Unlocks all licensed features for this session
        </div>
      </div>
    </div>
  );
}

export function LedgerlyApp() {
  const view    = useLedgerlyStore(s => s.view);
  const setView = useLedgerlyStore(s => s.setView);
  const setSelectedGoalId = useLedgerlyStore(s => s.setSelectedGoalId);
  const securitySettings = useLedgerlyStore(s => s.securitySettings);
  const userName = useLedgerlyStore(s => s.userName);
  const [locked, setLocked] = useState(() => securitySettings.pinEnabled && Boolean(securitySettings.pinHash));
  const [licenseActive, setLicenseActive] = useState(() =>
    !IS_CUSTOMER_BUDGET_BUILD ||
    !window.__LDG_LICENSE_HASH__ ||
    localStorage.getItem(LDG_ACTIVATED_KEY) === '1' ||
    sessionStorage.getItem('ldg-license-activated') === '1'
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const lockTimer = useRef<number | null>(null);

  const handleNav = (id: LedgerlyView) => {
    if (id === 'goals') setSelectedGoalId(null);
    setView(id);
    setSidebarOpen(false);
  };

  useEffect(() => {
    const lock = () => {
      if (securitySettings.pinEnabled && securitySettings.pinHash) setLocked(true);
    };
    window.addEventListener('ledgerly-lock', lock);
    return () => window.removeEventListener('ledgerly-lock', lock);
  }, [securitySettings.pinEnabled, securitySettings.pinHash]);

  useEffect(() => {
    if (!securitySettings.pinEnabled || !securitySettings.pinHash) return;
    if (locked) return;
    const resetTimer = () => {
      if (lockTimer.current) window.clearTimeout(lockTimer.current);
      lockTimer.current = window.setTimeout(() => setLocked(true), securitySettings.autoLockMinutes * 60_000);
    };
    const events = ['pointerdown', 'keydown', 'scroll'];
    events.forEach(event => window.addEventListener(event, resetTimer, { passive: true }));
    resetTimer();
    return () => {
      if (lockTimer.current) window.clearTimeout(lockTimer.current);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [locked, securitySettings.autoLockMinutes, securitySettings.pinEnabled, securitySettings.pinHash]);

  const activePageView = (view === 'goal-detail' || view === 'debt-planner') ? 'goals' : view;
  const needsLicense = HAS_LOCKED_VIEWS && LOCKED_VIEWS.includes(activePageView) && !licenseActive;

  const page = (() => {
    switch (view) {
      case 'dashboard':    return <DashboardPage />;
      case 'transactions': return <TransactionsPage />;
      case 'bills':        return <BillsPage />;
      case 'accounts':     return <AccountsPage />;
      case 'goals':        return <GoalsPage />;
      case 'goal-detail':  return <GoalDetailPage />;
      case 'debt-planner': return <DebtPlannerPage />;
      case 'budget':       return <BudgetPage />;
      case 'networth':     return <NetWorthPage />;
      case 'reports':      return <ReportsPage />;
      case 'categories':   return <CategoriesPage />;
      case 'security':     return <DataSecurityPage />;
      case 'management':   return IS_CUSTOMER_BUDGET_BUILD ? <DashboardPage /> : <ManagementPage />;
      case 'help':         return <HelpPrivacyPage />;
      default:             return <DashboardPage />;
    }
  })();

  const activeId = getNavId(view);

  return (
    <>
      <style>{SIDEBAR_CSS}</style>
      <div className={`ldg-app${securitySettings.theme === 'dark' ? ' ldg-theme-dark' : ''}`}>
        {/* Mobile sidebar overlay */}
        <div
          className={`ldg-sb-overlay${sidebarOpen ? ' ldg-sb-open' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />
        <aside className={`ldg-sidebar${sidebarOpen ? ' ldg-sb-open' : ''}`}>
          <img src={sbDeco} alt="" className="ldg-sb-deco" />
          <div className="ldg-sb-brand">
            <div className="ldg-sb-logo">
              <svg viewBox="0 0 24 24">
                <path d="M12 2C12 2 5 7 5 13a7 7 0 0014 0C19 7 12 2 12 2z"/>
                <path d="M12 2v18" strokeLinecap="round"/>
                <path d="M8 10c1-1 2.5-1.5 4-1" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="ldg-sb-name">Ledgerly</span>
          </div>
          <nav className="ldg-sb-nav">
            {NAV.map(({ id, label, icon }) => {
              const isLocked = HAS_LOCKED_VIEWS && LOCKED_VIEWS.includes(id) && !licenseActive;
              return (
                <button
                  key={id}
                  className={`ldg-nav-item${activeId === id ? ' active' : ''}`}
                  onClick={() => handleNav(id)}
                >
                  {icon}
                  {label}
                  {isLocked && <span className="ldg-sb-lock-badge" title="Requires license">⚡</span>}
                </button>
              );
            })}
          </nav>
          <img src={sbDecoBotLeft} alt="" className="ldg-sb-deco-bot" />
          <div className="ldg-sb-footer">
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" width="11" height="11">
              <rect x="2" y="6" width="10" height="7" rx="1.5"/>
              <path d="M5 6V4.5a2 2 0 014 0V6"/>
            </svg>
            Local only · Nothing sent to any server
          </div>
        </aside>
        <div className="ldg-main">
          {/* Mobile top bar with hamburger */}
          <div className="ldg-mobile-topbar">
            <button
              className="ldg-mobile-menu-btn"
              onClick={() => setSidebarOpen(o => !o)}
              aria-label="Open navigation"
            >
              <svg viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <span className="ldg-mobile-logo-name">Ledgerly</span>
          </div>
          <div className="ldg-content">
            {needsLicense ? (
              <LicenseGateOverlay
                viewName={activePageView.charAt(0).toUpperCase() + activePageView.slice(1)}
                onUnlock={() => setLicenseActive(true)}
                onCancel={() => setView('dashboard')}
              />
            ) : page}
          </div>
        </div>
        <LedgerlyOnboardingModal />
        {locked && securitySettings.pinHash && (
          <LockOverlay pinHash={securitySettings.pinHash} onUnlock={() => setLocked(false)} />
        )}
        {!licenseActive && !HAS_LOCKED_VIEWS && <LicenseOverlay onActivate={() => setLicenseActive(true)} />}
      </div>
    </>
  );
}
