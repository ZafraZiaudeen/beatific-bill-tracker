import { useRef, useState } from 'react';
import { useContentCalendarStore } from '../store';

const LS_KEY = 'cc-onboarding-seen';

type Step = {
  icon: string;
  title: string;
  body: string;
  accent: 'terracotta' | 'blue' | 'gold' | 'mauve';
};

const STEPS: Step[] = [
  {
    icon: '✨',
    title: 'Welcome to The Content Edit',
    body: "Your personal content calendar — beautiful, private, and always on your device. Let's get you set up in under a minute.",
    accent: 'terracotta',
  },
  {
    icon: '🔒',
    title: 'Your content stays private',
    body: 'Everything is stored right here in your browser. No servers, no syncing, no accounts. Your content strategy belongs to you.',
    accent: 'blue',
  },
  {
    icon: '📅',
    title: 'Plan with a visual calendar',
    body: 'See your whole month at a glance. Drag posts to reschedule, filter by platform, and never miss a posting day again.',
    accent: 'gold',
  },
  {
    icon: '🚀',
    title: 'From idea to published, tracked',
    body: 'Move content through Ideas → Drafting → Ready → Published. The Pipeline keeps every post organised from spark to screen.',
    accent: 'mauve',
  },
  {
    icon: '🎯',
    title: "You're all set!",
    body: 'Start by exploring your Calendar, composing your first post, or dropping an idea into the Pipeline.',
    accent: 'terracotta',
  },
];

const ACCENT_COLORS: Record<string, { bg: string; border: string; iconBg: string; iconColor: string }> = {
  terracotta: { bg: 'rgba(217,120,86,.08)', border: 'rgba(217,120,86,.25)', iconBg: 'rgba(217,120,86,.15)', iconColor: '#b5522a' },
  blue:       { bg: 'rgba(122,157,181,.08)', border: 'rgba(122,157,181,.25)', iconBg: 'rgba(122,157,181,.15)', iconColor: '#3a6e96' },
  gold:       { bg: 'rgba(212,168,67,.08)',  border: 'rgba(212,168,67,.25)',  iconBg: 'rgba(212,168,67,.15)',  iconColor: '#8a6020' },
  mauve:      { bg: 'rgba(158,96,128,.08)',  border: 'rgba(158,96,128,.25)',  iconBg: 'rgba(158,96,128,.15)',  iconColor: '#7a3860' },
};

const ONBOARDING_CSS = `
.cc-ob-backdrop {
  position: fixed; inset: 0; z-index: 9000;
  background: var(--cc-overlay, rgba(35,31,29,.4));
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
}
.cc-ob-card {
  position: relative; overflow: hidden;
  background: var(--cc-card, #fff);
  border: 1px solid var(--cc-border, #ece4da);
  border-radius: 18px;
  box-shadow: 0 20px 60px rgba(48,39,34,.18);
  padding: 36px 32px 28px;
  width: 100%; max-width: 420px;
  display: flex; flex-direction: column; align-items: center;
  gap: 14px;
}
.cc-ob-icon-wrap {
  width: 60px; height: 60px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.cc-ob-icon { font-size: 26px; line-height: 1; }
.cc-ob-title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 1.35rem; font-weight: 400; line-height: 1.2;
  color: var(--cc-text, #3d2f2f);
  text-align: center; margin: 0;
}
.cc-ob-body {
  font-size: .9rem; line-height: 1.6;
  color: var(--cc-text-2, #6b5a52);
  text-align: center; margin: 0;
}
.cc-ob-name-wrap { width: 100%; display: flex; flex-direction: column; gap: 6px; }
.cc-ob-name-input {
  width: 100%; box-sizing: border-box;
  padding: 10px 14px;
  border: 1.5px solid var(--cc-border, #ece4da);
  border-radius: 10px;
  background: var(--cc-input, #fff);
  color: var(--cc-text, #3d2f2f);
  font: 500 .95rem 'Nunito', sans-serif;
  outline: none; transition: border-color .15s;
}
.cc-ob-name-input:focus { border-color: var(--cc-accent, #d97856); }
.cc-ob-name-input-err { border-color: #e05050 !important; }
.cc-ob-name-err { font-size: .8rem; color: #e05050; }
.cc-ob-quick-links {
  width: 100%; display: flex; flex-direction: column; gap: 8px;
}
.cc-ob-quick-item {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 14px;
  background: var(--cc-bg-2, #f3ede6);
  border: 1px solid var(--cc-border, #ece4da);
  border-radius: 10px;
}
.cc-ob-quick-icon { font-size: 18px; flex-shrink: 0; }
.cc-ob-quick-label { font-size: .875rem; font-weight: 700; color: var(--cc-text, #3d2f2f); }
.cc-ob-quick-desc  { font-size: .78rem; color: var(--cc-text-2, #6b5a52); margin-top: 1px; }
.cc-ob-dots {
  display: flex; gap: 6px; align-items: center;
}
.cc-ob-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--cc-border-2, #d9cfc8);
  transition: all .2s;
}
.cc-ob-dot-active {
  width: 20px; border-radius: 4px;
  background: var(--cc-accent, #d97856);
}
.cc-ob-actions {
  display: flex; gap: 8px; width: 100%; justify-content: flex-end;
  margin-top: 4px;
}
.cc-ob-btn-skip {
  padding: 9px 16px; border: 1px solid var(--cc-border, #ece4da);
  border-radius: 9px; background: transparent;
  color: var(--cc-text-2, #6b5a52); font: 500 .875rem 'Nunito', sans-serif;
  cursor: pointer; transition: background .12s;
}
.cc-ob-btn-skip:hover { background: var(--cc-bg-2, #f3ede6); }
.cc-ob-btn-primary {
  padding: 9px 20px; border: none; border-radius: 9px;
  color: #fff; font: 700 .9rem 'Nunito', sans-serif;
  cursor: pointer; transition: filter .12s; display: flex; align-items: center; gap: 6px;
}
.cc-ob-btn-primary:hover { filter: brightness(1.1); }
.cc-ob-privacy {
  display: flex; align-items: center; gap: 5px;
  font-size: .72rem; color: var(--cc-text-3, #8a7a72);
}
`;

export function ContentCalendarOnboardingModal() {
  const userName    = useContentCalendarStore(s => s.userName);
  const setUserName = useContentCalendarStore(s => s.setUserName);
  const setActiveView = useContentCalendarStore(s => s.setActiveView);

  const alreadySeen = Boolean(
    (typeof localStorage !== 'undefined' && localStorage.getItem(LS_KEY)) || userName,
  );
  const [open, setOpen]     = useState(!alreadySeen);
  const [step, setStep]     = useState(0);
  const [name, setName]     = useState('');
  const [nameErr, setNameErr] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const s = STEPS[step]!;
  const accent = ACCENT_COLORS[s.accent]!;
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
    setActiveView('dashboard');
    window.dispatchEvent(new Event('cc-onboarding-complete'));
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
    window.dispatchEvent(new Event('cc-onboarding-complete'));
  }

  return (
    <>
      <style>{ONBOARDING_CSS}</style>
      <div className="cc-ob-backdrop" onClick={e => { if (e.target === e.currentTarget) skip(); }}>
        <div className="cc-ob-card">

          {/* Icon bubble */}
          <div className="cc-ob-icon-wrap" style={{ background: accent.iconBg, color: accent.iconColor }}>
            <span className="cc-ob-icon">{s.icon}</span>
          </div>

          {/* Text */}
          <h2 className="cc-ob-title">{s.title}</h2>
          <p className="cc-ob-body">{s.body}</p>

          {/* Name input on first step */}
          {isFirst && (
            <div className="cc-ob-name-wrap">
              <input
                ref={inputRef}
                className={`cc-ob-name-input${nameErr ? ' cc-ob-name-input-err' : ''}`}
                value={name}
                onChange={e => { setName(e.target.value); setNameErr(false); }}
                onKeyDown={e => { if (e.key === 'Enter') next(); }}
                placeholder="What should we call you?"
                autoFocus
                maxLength={40}
              />
              {nameErr && <span className="cc-ob-name-err">Please enter your name to continue.</span>}
            </div>
          )}

          {/* Last step quick-start links */}
          {isLast && (
            <div className="cc-ob-quick-links">
              <div className="cc-ob-quick-item">
                <span className="cc-ob-quick-icon">📅</span>
                <div>
                  <div className="cc-ob-quick-label">Open the Calendar</div>
                  <div className="cc-ob-quick-desc">Plan your first week of content</div>
                </div>
              </div>
              <div className="cc-ob-quick-item">
                <span className="cc-ob-quick-icon">✏️</span>
                <div>
                  <div className="cc-ob-quick-label">Create a post</div>
                  <div className="cc-ob-quick-desc">Open the Composer and write your first caption</div>
                </div>
              </div>
              <div className="cc-ob-quick-item">
                <span className="cc-ob-quick-icon">💡</span>
                <div>
                  <div className="cc-ob-quick-label">Drop an idea</div>
                  <div className="cc-ob-quick-desc">Capture a content idea before it fades</div>
                </div>
              </div>
            </div>
          )}

          {/* Progress dots */}
          <div className="cc-ob-dots">
            {STEPS.map((_, i) => (
              <div key={i} className={`cc-ob-dot${i === step ? ' cc-ob-dot-active' : ''}`} />
            ))}
          </div>

          {/* Buttons */}
          <div className="cc-ob-actions">
            {!isLast && (
              <button className="cc-ob-btn-skip" onClick={skip}>Skip</button>
            )}
            <button
              className="cc-ob-btn-primary"
              onClick={next}
              style={{ background: accent.iconColor }}
            >
              {isLast ? 'Get started ✓' : isFirst ? 'Continue →' : 'Next →'}
            </button>
          </div>

          {/* Privacy note */}
          <div className="cc-ob-privacy">
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" width="11" height="11">
              <rect x="2" y="6" width="10" height="7" rx="1.5"/>
              <path d="M5 6V4.5a2 2 0 014 0V6"/>
            </svg>
            Local only · Nothing ever leaves your device
          </div>
        </div>
      </div>
    </>
  );
}
