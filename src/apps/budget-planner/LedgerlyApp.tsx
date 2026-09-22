import './ledgerly.css';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
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
import { DataSecurityPage } from './pages/DataSecurityPage';
import { HelpPrivacyPage }  from './pages/HelpPrivacyPage';
import { PlaceholderPage }  from './pages/PlaceholderPage';
import type { LedgerlyView } from './types';

const SIDEBAR_CSS = `
.ldg-app { display: flex; height: 100%; background: #f5f4f0; overflow: hidden; font-family: Inter, system-ui, sans-serif; }
.ldg-sidebar { width: 240px; min-width: 240px; background: #0f1623; display: flex; flex-direction: column; overflow: hidden; z-index: 200; }
.ldg-sb-brand { display: flex; align-items: center; gap: 10px; padding: 20px 18px 16px; border-bottom: 1px solid rgba(255,255,255,.07); flex-shrink: 0; }
.ldg-sb-logo { width: 32px; height: 32px; background: #22c55e; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ldg-sb-logo svg { width: 18px; height: 18px; stroke: #fff; stroke-width: 2; fill: none; }
.ldg-sb-name { font-size: 1.1rem; font-weight: 700; color: #f1f5f9; letter-spacing: -.3px; white-space: nowrap; }
.ldg-sb-nav { flex: 1; padding: 8px 10px; overflow-y: auto; overflow-x: hidden; }
.ldg-sb-nav::-webkit-scrollbar { width: 4px; }
.ldg-sb-nav::-webkit-scrollbar-track { background: transparent; }
.ldg-sb-nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,.12); border-radius: 4px; }
.ldg-nav-item { display: flex; align-items: center; gap: 11px; padding: 9px 12px; border-radius: .5rem; color: #94a3b8; font-size: .875rem; font-weight: 500; transition: all .15s; white-space: nowrap; width: 100%; text-align: left; position: relative; background: transparent; border: none; cursor: pointer; }
.ldg-nav-item svg { width: 17px; height: 17px; stroke-width: 1.8; flex-shrink: 0; }
.ldg-nav-item:hover { background: rgba(255,255,255,.06); color: #e2e8f0; }
.ldg-nav-item.active { background: rgba(34,197,94,.15); color: #e2e8f0; }
.ldg-nav-item.active::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 3px; height: 20px; background: #22c55e; border-radius: 0 3px 3px 0; }
.ldg-nav-item.active svg { stroke: #22c55e; }
.ldg-sb-footer { padding: 12px 18px; border-top: 1px solid rgba(255,255,255,.07); font-size: .72rem; color: rgba(148,163,184,.5); text-align: center; flex-shrink: 0; }
.ldg-main { flex: 1; display: flex; flex-direction: column; min-width: 0; overflow: hidden; background: #f5f4f0; }
.ldg-content { flex: 1; overflow-y: auto; overflow-x: hidden; }
.ldg-content::-webkit-scrollbar { width: 6px; }
.ldg-content::-webkit-scrollbar-track { background: transparent; }
.ldg-content::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 6px; }
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
    id: 'security', label: 'Data & Security',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  },
  {
    id: 'help', label: 'Help & Privacy',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  },
];

function getNavId(view: LedgerlyView): LedgerlyView {
  if (view === 'goal-detail' || view === 'debt-planner') return 'goals';
  return view;
}

async function sha256(text: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
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

export function LedgerlyApp() {
  const view    = useLedgerlyStore(s => s.view);
  const setView = useLedgerlyStore(s => s.setView);
  const setSelectedGoalId = useLedgerlyStore(s => s.setSelectedGoalId);
  const securitySettings = useLedgerlyStore(s => s.securitySettings);
  const [locked, setLocked] = useState(() => securitySettings.pinEnabled && Boolean(securitySettings.pinHash));
  const lockTimer = useRef<number | null>(null);

  const handleNav = (id: LedgerlyView) => {
    if (id === 'goals') setSelectedGoalId(null);
    setView(id);
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
      case 'categories':   return <PlaceholderPage title="Categories & Rules" subtitle="Organize your spending into categories and set up auto-categorization rules." iconPath="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />;
      case 'security':     return <DataSecurityPage />;
      case 'help':         return <HelpPrivacyPage />;
      default:             return <DashboardPage />;
    }
  })();

  const activeId = getNavId(view);

  return (
    <>
      <style>{SIDEBAR_CSS}</style>
      <div className={`ldg-app${securitySettings.theme === 'dark' ? ' ldg-theme-dark' : ''}`}>
        <aside className="ldg-sidebar">
          <div className="ldg-sb-brand">
            <div className="ldg-sb-logo">
              <svg viewBox="0 0 20 20">
                <path d="M10 2L3 6v8l7 4 7-4V6L10 2z" fill="none" stroke="#fff" strokeWidth="1.5"/>
                <path d="M7 10h6M10 7v6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="ldg-sb-name">Ledgerly</span>
          </div>
          <nav className="ldg-sb-nav">
            {NAV.map(({ id, label, icon }) => (
              <button
                key={id}
                className={`ldg-nav-item${activeId === id ? ' active' : ''}`}
                onClick={() => handleNav(id)}
              >
                {icon}
                {label}
              </button>
            ))}
          </nav>
          <div className="ldg-sb-footer">Local only · Your data stays on this device</div>
        </aside>
        <div className="ldg-main">
          <div className="ldg-content">{page}</div>
        </div>
        {locked && securitySettings.pinHash && (
          <LockOverlay pinHash={securitySettings.pinHash} onUnlock={() => setLocked(false)} />
        )}
      </div>
    </>
  );
}
