import { useState } from 'react';
import { useContentCalendarStore } from '../store';
import StatCard from '../components/StatCard';
import WeekSchedule from '../components/WeekSchedule';
import ContentRhythm from '../components/ContentRhythm';
import DraftsPanel from '../components/DraftsPanel';
import FeedPreview from '../components/FeedPreview';
import SavedIdeas from '../components/SavedIdeas';
import HashtagSets from '../components/HashtagSets';
import sparkleImg from '../../../assets/budget-assets/sun-sparkles/sun-sparkles-02.png';
import underlineImg from '../../../assets/budget-assets/stationery-accents/stationery-accents-02.png';
import type { PostType } from '../types';

const POST_TYPE_ICONS: Record<string, string> = {
  Reel: '🎬', Carousel: '📸', Story: '◷', Static: '🖼',
};

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c27b6a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b52a8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2a6090" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  );
}

function BulbIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a88a00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="9" y1="18" x2="15" y2="18"/>
      <line x1="10" y1="22" x2="14" y2="22"/>
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
    </svg>
  );
}

export default function Dashboard() {
  const { posts, weekOf, drafts, ideas, hashtagSets, contentRhythm, stats, setActiveView, openComposer } = useContentCalendarStore();
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>

      {/* Page header */}
      <div className="cc-header">
        <div className="cc-header-left">
          <h1 className="cc-header-title">Plan beautifully.</h1>
          <div className="cc-header-title-row2">
            <span className="cc-header-title" style={{ display: 'inline' }}>Publish intentionally.</span>
            <img src={sparkleImg} alt="" style={{ width: 30, height: 30, objectFit: 'contain', flexShrink: 0 }} />
          </div>
          <img
            src={underlineImg}
            alt=""
            style={{ width: 200, height: 20, objectFit: 'cover', objectPosition: 'center bottom', marginTop: 2, opacity: 0.85 }}
          />
        </div>

        <div className="cc-header-right">
          <div className="cc-header-meta">
            <div className="cc-date-range">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Apr 21 – Apr 27, 2025
            </div>
            <span className="cc-local-badge">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              Local only
            </span>
          </div>

          <div className="cc-toolbar">
            <div className="cc-search">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <span style={{ fontSize: 11.5, color: '#b0a098' }}>Search posts, ideas, or hashtags...</span>
            </div>
            <button className="cc-filter-btn">
              All platforms
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <button className="cc-filter-btn">
              All content types
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <button className="cc-filter-btn">
              This week
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div style={{ position: 'relative' }}>
              <button className="cc-create-btn" onClick={() => setShowCreateMenu((v) => !v)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Create post
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              {showCreateMenu && (
                <div className="cc-create-dropdown">
                  {Object.entries(POST_TYPE_ICONS).map(([type, icon]) => (
                    <button key={type} className="cc-create-dropdown-item" onClick={() => { setShowCreateMenu(false); openComposer({ postType: type as PostType, returnView: 'dashboard' }); }}>
                      <span>{icon}</span>{type}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards row */}
      <div style={{ display: 'flex', gap: 12, padding: '14px 22px', borderBottom: '1px solid #ece4da' }}>
        <StatCard label="Planned" value={stats.planned} iconBg="#f9d5cc" underlineColor="#e0906e" icon={<CalendarIcon />} />
        <StatCard label="Scheduled" value={stats.scheduled} iconBg="#ddd6f8" underlineColor="#7b5ea8" icon={<SendIcon />} />
        <StatCard label="Published" value={stats.published} iconBg="#d3e9fb" underlineColor="#3a80b0" icon={<CheckIcon />} />
        <StatCard label="Ideas" value={stats.ideas} iconBg="#fdf3c0" underlineColor="#c8a800" icon={<BulbIcon />} />
      </div>

      {/* 3-column content area */}
      <div style={{ display: 'flex', gap: 0, alignItems: 'flex-start' }}>

        {/* Column 1 — This Week's Schedule (~44%) */}
        <div style={{ flex: '0 0 44%', padding: '16px 14px 24px 22px', borderRight: '1px solid #ece4da' }}>
          <WeekSchedule posts={posts} weekOf={weekOf} onViewMonth={() => setActiveView('calendar')} />
        </div>

        {/* Column 2 — Content Rhythm + Drafts + Saved Ideas (~30%) */}
        <div style={{ flex: '0 0 30%', padding: '16px 12px 24px', borderRight: '1px solid #ece4da', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <ContentRhythm items={contentRhythm as unknown as { type: string; targetPerWeek: number; color: string }[]} />
          <DraftsPanel drafts={drafts} />
          <SavedIdeas ideas={ideas.slice(0, 3)} onViewAll={() => setActiveView('ideas')} />
        </div>

        {/* Column 3 — Feed Preview + Hashtag Sets (~26%) */}
        <div style={{ flex: '0 0 26%', padding: '16px 22px 24px 12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <FeedPreview posts={posts} />
          <HashtagSets sets={hashtagSets} onViewAll={() => setActiveView('hashtags')} />
        </div>
      </div>
    </div>
  );
}
