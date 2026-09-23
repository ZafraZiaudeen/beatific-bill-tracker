import { useRef, useState } from 'react';
import { useLedgerlyStore } from '../store/useLedgerlyStore';
import flower01 from '../../../assets/budget-assets/flowers-and-leaves/flowers-and-leaves-01.png';
import sprig03 from '../../../assets/budget-assets/botanical-sprigs/botanical-sprigs-03.png';
import heart03 from '../../../assets/budget-assets/hearts/heart-03.png';
import sparkle02 from '../../../assets/budget-assets/sun-sparkles/sun-sparkles-02.png';

const LS_KEY = 'ldg-onboarding-seen';

type Step = {
  icon: string;
  title: string;
  body: string;
  accent?: 'green' | 'blue' | 'gold' | 'rose';
};

const STEPS: Step[] = [
  {
    icon: '🌿',
    title: 'Welcome to Ledgerly',
    body: "Your personal budget planner - private, beautiful, and always on your device. Let's get you set up in under a minute.",
    accent: 'green',
  },
  {
    icon: '🔒',
    title: 'Your money stays private',
    body: 'Everything is stored right here in your browser. No servers, no syncing, no accounts. Your financial life belongs to you.',
    accent: 'blue',
  },
  {
    icon: '📊',
    title: 'Build a budget that works',
    body: 'Use zero-based, 50/30/20, or pay-yourself-first budgeting. The Budget wizard walks you through it step by step.',
    accent: 'gold',
  },
  {
    icon: '💳',
    title: 'Track every transaction',
    body: 'Log spending as it happens and watch your categories update in real time. No spreadsheets needed.',
    accent: 'rose',
  },
  {
    icon: '🎯',
    title: "You're all set!",
    body: 'Start by adding your income, then build your budget. Your Dashboard will show how you\'re doing at a glance.',
    accent: 'green',
  },
];

const ACCENT_COLORS: Record<string, { bg: string; border: string; iconBg: string; iconColor: string }> = {
  green: { bg: 'rgba(122,158,126,.08)', border: 'rgba(122,158,126,.25)', iconBg: 'rgba(122,158,126,.15)', iconColor: '#4a7060' },
  blue:  { bg: 'rgba(107,158,196,.08)', border: 'rgba(107,158,196,.25)', iconBg: 'rgba(107,158,196,.15)', iconColor: '#3a6e96' },
  gold:  { bg: 'rgba(196,163,90,.08)',  border: 'rgba(196,163,90,.25)',  iconBg: 'rgba(196,163,90,.15)',  iconColor: '#8a6020' },
  rose:  { bg: 'rgba(196,138,138,.08)', border: 'rgba(196,138,138,.25)', iconBg: 'rgba(196,138,138,.15)', iconColor: '#a05050' },
};

export function LedgerlyOnboardingModal() {
  const userName    = useLedgerlyStore(s => s.userName);
  const setUserName = useLedgerlyStore(s => s.setUserName);
  const setView     = useLedgerlyStore(s => s.setView);

  const alreadySeen = Boolean(
    (typeof localStorage !== 'undefined' && localStorage.getItem(LS_KEY)) || userName,
  );
  const [open, setOpen]   = useState(!alreadySeen);
  const [step, setStep]   = useState(0);
  const [name, setName]   = useState('');
  const [nameErr, setNameErr] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const s = STEPS[step]!;
  const accent = ACCENT_COLORS[s.accent ?? 'green']!;
  const isFirst = step === 0;
  const isLast  = step === STEPS.length - 1;

  function dismiss() {
    if (isFirst) {
      const trimmed = name.trim();
      if (!trimmed) { setNameErr(true); inputRef.current?.focus(); return; }
      setUserName(trimmed);
    }
    localStorage.setItem(LS_KEY, '1');
    setOpen(false);
    setView('dashboard');
  }

  function next() {
    if (isFirst) {
      const trimmed = name.trim();
      if (!trimmed) { setNameErr(true); inputRef.current?.focus(); return; }
      setUserName(trimmed);
    }
    if (isLast) { dismiss(); return; }
    setStep(n => n + 1);
  }

  function skip() {
    if (isFirst && name.trim()) setUserName(name.trim());
    localStorage.setItem(LS_KEY, '1');
    setOpen(false);
  }

  return (
    <div className="ldg-ob-backdrop" onClick={e => { if (e.target === e.currentTarget) skip(); }}>
      <div className="ldg-ob-card">
        {/* Decorative images */}
        <img src={flower01} alt="" className="ldg-ob-deco-tr" />
        <img src={sprig03}  alt="" className="ldg-ob-deco-bl" />

        {/* Icon bubble */}
        <div className="ldg-ob-icon-wrap" style={{ background: accent.iconBg, color: accent.iconColor }}>
          <span className="ldg-ob-icon">{s.icon}</span>
        </div>

        {/* Text */}
        <h2 className="ldg-ob-title">{s.title}</h2>
        <p className="ldg-ob-body">{s.body}</p>

        {/* Name input on first step */}
        {isFirst && (
          <div className="ldg-ob-name-wrap">
            <input
              ref={inputRef}
              className={`ldg-ob-name-input${nameErr ? ' ldg-ob-name-input-err' : ''}`}
              value={name}
              onChange={e => { setName(e.target.value); setNameErr(false); }}
              onKeyDown={e => { if (e.key === 'Enter') next(); }}
              placeholder="What should we call you?"
              autoFocus
              maxLength={40}
            />
            {nameErr && <span className="ldg-ob-name-err">Please enter your name to continue.</span>}
          </div>
        )}

        {/* Last step quick-start links */}
        {isLast && (
          <div className="ldg-ob-quick-links">
            <div className="ldg-ob-quick-item">
              <span className="ldg-ob-quick-icon">💳</span>
              <div>
                <div className="ldg-ob-quick-label">Add a transaction</div>
                <div className="ldg-ob-quick-desc">Log your first expense or income</div>
              </div>
            </div>
            <div className="ldg-ob-quick-item">
              <span className="ldg-ob-quick-icon">📊</span>
              <div>
                <div className="ldg-ob-quick-label">Build your budget</div>
                <div className="ldg-ob-quick-desc">Set up spending categories</div>
              </div>
            </div>
            <div className="ldg-ob-quick-item">
              <span className="ldg-ob-quick-icon">🎯</span>
              <div>
                <div className="ldg-ob-quick-label">Set a savings goal</div>
                <div className="ldg-ob-quick-desc">Track progress toward what matters</div>
              </div>
            </div>
          </div>
        )}

        {/* Progress dots */}
        <div className="ldg-ob-dots">
          {STEPS.map((_, i) => (
            <div key={i} className={`ldg-ob-dot${i === step ? ' ldg-ob-dot-active' : ''}`} />
          ))}
        </div>

        {/* Buttons */}
        <div className="ldg-ob-actions">
          {!isLast && (
            <button className="ldg-ob-btn-skip" onClick={skip}>Skip</button>
          )}
          <button
            className="ldg-ob-btn-primary"
            onClick={next}
            style={{ background: accent.iconColor }}
          >
            {isLast ? (
              <>
                <img src={heart03} alt="" style={{ width: 14, height: 14, display: 'inline', verticalAlign: 'middle', marginRight: 6, filter: 'brightness(10)' }} />
                Get started
              </>
            ) : (
              <>
                {isFirst ? 'Continue →' : 'Next →'}
                {isFirst && <img src={sparkle02} alt="" style={{ width: 14, height: 14, display: 'inline', verticalAlign: 'middle', marginLeft: 6, filter: 'brightness(10)', opacity: .7 }} />}
              </>
            )}
          </button>
        </div>

        {/* Privacy note */}
        <div className="ldg-ob-privacy">
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" width="11" height="11">
            <rect x="2" y="6" width="10" height="7" rx="1.5"/>
            <path d="M5 6V4.5a2 2 0 014 0V6"/>
          </svg>
          Local only · Nothing ever leaves your device
        </div>
      </div>
    </div>
  );
}
