import { useEffect, useState } from 'react';
import type { ContentCalendarView } from '../types';
import { useContentCalendarStore } from '../store';

export const CONTENT_CALENDAR_PAGE_INTROS_KEY = 'cc-page-intros';
export const CONTENT_CALENDAR_HINTS_KEY = 'cc-hints-enabled';
const ONBOARDING_KEY = 'cc-onboarding-seen';
const ONBOARDING_COMPLETE_EVENT = 'cc-onboarding-complete';

type IntroConfig = {
  icon: string;
  title: string;
  description: string;
  tip: string;
  accent: string;
};

const PAGE_INTROS: Partial<Record<ContentCalendarView, IntroConfig>> = {
  dashboard: {
    icon: '📊',
    title: 'Your content dashboard',
    description: 'See what is planned, scheduled, published, and still waiting for a spark. The dashboard brings your drafts, ideas, and upcoming posts together.',
    tip: 'Use the time-range controls to switch between this week, this month, and the last 30 days.',
    accent: '#b5522a',
  },
  calendar: {
    icon: '📅',
    title: 'Plan on the calendar',
    description: 'The Calendar gives you a visual view of your publishing schedule. Switch between month and week views, filter the schedule, and move posts to new dates.',
    tip: 'Drag a post to another day when your publishing plan changes.',
    accent: '#8a6020',
  },
  campaigns: {
    icon: '🚀',
    title: 'Organise campaigns',
    description: 'Group related content into campaigns with goals, dates, platforms, and timelines so every post supports a bigger story.',
    tip: 'Open a campaign to see its timeline and the content connected to it.',
    accent: '#7a3860',
  },
  pipeline: {
    icon: '🔄',
    title: 'Move ideas toward publish',
    description: 'The Pipeline shows your content moving from Ideas to Drafting, Ready, and Published. Each card keeps the next action visible.',
    tip: 'Drag cards between stages and use the checklist to make each post publish-ready.',
    accent: '#4a7c5f',
  },
  ideas: {
    icon: '💡',
    title: 'Capture every idea',
    description: 'Save rough ideas with a format, category, platform, description, and notes before they disappear. Turn promising ideas into pipeline work when you are ready.',
    tip: 'Use Convert to Pipeline when an idea is ready for a proper draft workflow.',
    accent: '#d4a843',
  },
  analytics: {
    icon: '📈',
    title: 'Learn from your content',
    description: 'Analytics combines your schedule, platform mix, campaign output, and recorded performance so you can see what is working over time.',
    tip: 'Record performance on published posts to make the insights more useful.',
    accent: '#3a6e96',
  },
  templates: {
    icon: '🧩',
    title: 'Reuse what works',
    description: 'Templates store repeatable post structures, hooks, captions, calls to action, hashtags, media, and checklists for faster creation.',
    tip: 'Use a template from the Composer to start with a proven structure instead of a blank page.',
    accent: '#9e6080',
  },
  platforms: {
    icon: '◉',
    title: 'Shape each platform',
    description: 'Choose which platforms are active and review the post types, fields, and preview rules available for each one.',
    tip: 'Keep only the platforms you actively publish to so your Composer stays focused.',
    accent: '#7a9db5',
  },
  composer: {
    icon: '✍️',
    title: 'Build a publish-ready post',
    description: 'The Composer brings together post type, platform-specific content, media, captions, hashtags, scheduling, previews, and a quality checklist.',
    tip: 'Complete the checklist before saving or scheduling so every post is clear, useful, and on brand.',
    accent: '#b5522a',
  },
};

function readSeenPages(): Record<string, boolean> {
  try {
    const raw = window.localStorage.getItem(CONTENT_CALENDAR_PAGE_INTROS_KEY);
    return raw ? JSON.parse(raw) as Record<string, boolean> : {};
  } catch {
    return {};
  }
}

function onboardingComplete(userName: string) {
  return Boolean(window.localStorage.getItem(ONBOARDING_KEY) || userName);
}

function shouldShow(view: ContentCalendarView, userName: string) {
  if (!PAGE_INTROS[view]) return false;
  if (window.localStorage.getItem(CONTENT_CALENDAR_HINTS_KEY) === 'false') return false;
  if (!onboardingComplete(userName)) return false;
  return readSeenPages()[view] !== true;
}

function markSeen(view: ContentCalendarView) {
  try {
    window.localStorage.setItem(
      CONTENT_CALENDAR_PAGE_INTROS_KEY,
      JSON.stringify({ ...readSeenPages(), [view]: true }),
    );
  } catch {
    // localStorage may be unavailable in private or restricted browser contexts.
  }
}

const INTRO_CSS = `
.cc-intro-backdrop{position:fixed;inset:0;z-index:9050;background:var(--cc-overlay,rgba(35,31,29,.48));display:flex;align-items:center;justify-content:center;padding:16px;animation:cc-intro-fade .18s ease}
@keyframes cc-intro-fade{from{opacity:0}to{opacity:1}}
.cc-intro-dialog{position:relative;width:min(480px,100%);overflow:hidden;background:var(--cc-card);border:1px solid var(--cc-border);border-radius:18px;box-shadow:0 20px 60px var(--cc-shadow);animation:cc-intro-pop .22s ease-out}
@keyframes cc-intro-pop{from{opacity:0;transform:translateY(10px) scale(.97)}to{opacity:1;transform:none}}
.cc-intro-accent{height:5px;background:var(--cc-intro-accent)}
.cc-intro-close{position:absolute;top:13px;right:14px;border:0;background:transparent;color:var(--cc-text-3);font-size:22px;line-height:1;cursor:pointer;padding:3px 6px;border-radius:6px}
.cc-intro-close:hover{background:var(--cc-bg-2);color:var(--cc-text)}
.cc-intro-body{display:flex;gap:16px;padding:28px 28px 20px}
.cc-intro-icon-wrap{width:54px;height:54px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;background:color-mix(in srgb,var(--cc-intro-accent) 14%,transparent)}
.cc-intro-icon{font-size:25px;line-height:1}
.cc-intro-copy{min-width:0;padding-right:20px}
.cc-intro-title{font-family:'DM Serif Display',Georgia,serif;font-size:22px;line-height:1.2;color:var(--cc-text);margin:1px 0 8px}
.cc-intro-description{font-size:13px;line-height:1.6;color:var(--cc-text-2);margin:0}
.cc-intro-tip{display:flex;gap:7px;align-items:flex-start;margin-top:14px;padding:10px 11px;border-radius:9px;background:var(--cc-bg-2);color:var(--cc-text-2);font-size:11.5px;line-height:1.45}
.cc-intro-tip-label{flex-shrink:0;color:var(--cc-intro-accent);font-weight:800}
.cc-intro-footer{display:flex;justify-content:flex-end;padding:0 28px 22px}
.cc-intro-button{border:0;border-radius:9px;padding:9px 18px;background:var(--cc-intro-accent);color:#fff;font:700 13px 'Nunito',sans-serif;cursor:pointer}
.cc-intro-button:hover{filter:brightness(1.08)}
@media(max-width:520px){.cc-intro-body{padding:24px 20px 17px;gap:12px}.cc-intro-copy{padding-right:12px}.cc-intro-footer{padding:0 20px 18px}}
`;

export function ContentCalendarPageIntro({ view }: { view: ContentCalendarView }) {
  const userName = useContentCalendarStore(state => state.userName);
  const [open, setOpen] = useState(() => typeof window !== 'undefined' && shouldShow(view, userName));
  const config = PAGE_INTROS[view];

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const refresh = () => setOpen(shouldShow(view, userName));
    refresh();
    window.addEventListener(ONBOARDING_COMPLETE_EVENT, refresh);
    return () => window.removeEventListener(ONBOARDING_COMPLETE_EVENT, refresh);
  }, [userName, view]);

  if (!config || !open) return null;

  function dismiss() {
    markSeen(view);
    setOpen(false);
  }

  return (
    <>
      <style>{INTRO_CSS}</style>
      <div
        className="cc-intro-backdrop"
        role="presentation"
        onClick={event => { if (event.target === event.currentTarget) dismiss(); }}
      >
        <div
          className="cc-intro-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cc-intro-title"
          style={{ '--cc-intro-accent': config.accent } as React.CSSProperties}
        >
          <div className="cc-intro-accent" />
          <button type="button" className="cc-intro-close" onClick={dismiss} aria-label="Close page explanation">×</button>
          <div className="cc-intro-body">
            <div className="cc-intro-icon-wrap" aria-hidden="true"><span className="cc-intro-icon">{config.icon}</span></div>
            <div className="cc-intro-copy">
              <h2 id="cc-intro-title" className="cc-intro-title">{config.title}</h2>
              <p className="cc-intro-description">{config.description}</p>
              <div className="cc-intro-tip"><span className="cc-intro-tip-label">Tip</span><span>{config.tip}</span></div>
            </div>
          </div>
          <div className="cc-intro-footer">
            <button type="button" className="cc-intro-button" onClick={dismiss}>Got it ✓</button>
          </div>
        </div>
      </div>
    </>
  );
}
