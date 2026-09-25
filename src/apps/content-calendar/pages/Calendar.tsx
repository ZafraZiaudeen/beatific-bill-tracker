import { useState } from 'react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, parseISO, isSameMonth, format,
  addMonths, subMonths, addDays,
} from 'date-fns';
import { useContentCalendarStore } from '../store';
import type { ContentPost, PostType } from '../types';
import sparkleImg from '../../../assets/budget-assets/sun-sparkles/sun-sparkles-02.png';
import underlineImg from '../../../assets/budget-assets/stationery-accents/stationery-accents-02.png';

const POST_TYPE_ICONS: Record<string, string> = {
  Reel: '🎬', Carousel: '📸', Story: '◷', Static: '🖼',
};

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  Carousel: { bg: '#fce8e3', text: '#c27b6a' },
  Reel:     { bg: '#fde8d0', text: '#b5672b' },
  Story:    { bg: '#e3f0e8', text: '#4a7c5f' },
  Static:   { bg: '#e8e9ec', text: '#555f72' },
};

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  Scheduled: { bg: '#ede8f8', text: '#6b52a8', dot: '#6b52a8' },
  Planned:   { bg: '#fdf0e5', text: '#b56e2f', dot: '#d4924a' },
  Published: { bg: '#e3f0e8', text: '#4a7c5f', dot: '#4a7c5f' },
  Idea:      { bg: '#f0f0f0', text: '#888',     dot: '#aaa' },
};

// Tiny platform icons
function IgIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  );
}

function TkIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.74a8.18 8.18 0 0 0 4.78 1.52V6.79a4.85 4.85 0 0 1-1.01-.1z"/>
    </svg>
  );
}

function YtIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
      <polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C8.13 0 5 3.13 5 7c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  );
}

function PlatformIconSmall({ platform }: { platform: string }) {
  const color = platform === 'instagram' ? '#c27b6a'
    : platform === 'tiktok' ? '#555'
    : platform === 'youtube' ? '#c0392b'
    : '#8a4a5f';
  return (
    <span style={{ color, display: 'inline-flex', alignItems: 'center' }}>
      {platform === 'instagram' && <IgIcon />}
      {platform === 'tiktok' && <TkIcon />}
      {platform === 'youtube' && <YtIcon />}
      {platform === 'pinterest' && <PinIcon />}
    </span>
  );
}

function PostMiniCard({ post }: { post: ContentPost }) {
  const tc = TYPE_COLORS[post.type] ?? { bg: '#f0f0f0', text: '#666' };
  const sc = STATUS_COLORS[post.status] ?? STATUS_COLORS.Planned;
  return (
    <div className="cc-post-mini">
      {/* Thumbnail swatch */}
      <div style={{
        width: 28, minHeight: 56, borderRadius: 4,
        background: post.thumbnailBg, flexShrink: 0,
      }} />
      {/* Info */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2, justifyContent: 'space-between' }}>
        <span style={{
          fontSize: 9, fontWeight: 700, padding: '1px 5px',
          borderRadius: 99, background: tc.bg, color: tc.text,
          whiteSpace: 'nowrap', display: 'inline-block', alignSelf: 'flex-start',
        }}>{post.type}</span>
        <div style={{
          fontSize: 10, color: '#3d2f2f', fontWeight: 600,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{post.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          {post.platforms.slice(0, 3).map(p => (
            <PlatformIconSmall key={p} platform={p} />
          ))}
        </div>
        <span style={{
          fontSize: 8, fontWeight: 600, padding: '1px 5px',
          borderRadius: 99, background: sc.bg, color: sc.text,
          whiteSpace: 'nowrap', display: 'inline-block', alignSelf: 'flex-start',
        }}>{post.status}</span>
      </div>
    </div>
  );
}

function WeekPostItem({ post }: { post: ContentPost }) {
  const tc = TYPE_COLORS[post.type] ?? { bg: '#f0f0f0', text: '#666' };
  const sc = STATUS_COLORS[post.status] ?? STATUS_COLORS.Planned;
  const date = parseISO(post.date);

  return (
    <div className="cc-week-post-item">
      {/* Date col */}
      <div style={{ width: 42, flexShrink: 0 }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: '#c27b6a' }}>{format(date, 'MMM d')}</div>
        <div style={{ fontSize: 10, color: '#8a7a72' }}>{format(date, 'EEE')}</div>
      </div>
      {/* Thumbnail */}
      <div style={{
        width: 44, height: 44, flexShrink: 0, borderRadius: 7,
        background: post.thumbnailBg, overflow: 'hidden',
      }} />
      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#3d2f2f', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {post.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 99, background: tc.bg, color: tc.text }}>
            {post.type}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {post.platforms.map(p => (
            <PlatformIconSmall key={p} platform={p} />
          ))}
        </div>
      </div>
      {/* Status dot + label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: sc.dot }} />
        <span style={{ fontSize: 10, color: sc.text, fontWeight: 600 }}>{post.status}</span>
      </div>
    </div>
  );
}

export default function Calendar() {
  const { posts, weekOf, openComposer } = useContentCalendarStore();
  const [displayMonth, setDisplayMonth] = useState<Date>(() => parseISO('2025-04-01'));
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  // Build calendar grid
  const monthStart = startOfMonth(displayMonth);
  const monthEnd = endOfMonth(displayMonth);
  const gridStart = startOfWeek(monthStart); // Sunday
  const gridEnd = endOfWeek(monthEnd);       // Saturday
  const allDays = eachDayOfInterval({ start: gridStart, end: gridEnd });

  // Group days into weeks
  const weeks: Date[][] = [];
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7));
  }

  // Index posts by date
  const postsByDate: Record<string, ContentPost[]> = {};
  for (const p of posts) {
    if (!postsByDate[p.date]) postsByDate[p.date] = [];
    postsByDate[p.date].push(p);
  }

  // This week's posts (Apr 21-27)
  const weekStart = parseISO(weekOf);
  const weekDays = eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) });
  const weekPosts: ContentPost[] = [];
  for (const d of weekDays) {
    const key = format(d, 'yyyy-MM-dd');
    if (postsByDate[key]) weekPosts.push(...postsByDate[key]);
  }

  const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>

      {/* Page header */}
      <div className="cc-header">
        <div className="cc-header-left">
          <h1 className="cc-header-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            Your content, mapped out.
            <img src={sparkleImg} alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} />
          </h1>
          <img
            src={underlineImg}
            alt=""
            style={{ width: 220, height: 20, objectFit: 'cover', objectPosition: 'center bottom', marginTop: 2, opacity: 0.85 }}
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
              All campaigns
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div style={{ position: 'relative' }}>
              <button className="cc-create-btn" onClick={() => setShowCreateMenu(v => !v)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Create post
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              {showCreateMenu && (
                <div className="cc-create-dropdown">
                  {Object.entries(POST_TYPE_ICONS).map(([type, icon]) => (
                    <button key={type} className="cc-create-dropdown-item" onClick={() => { setShowCreateMenu(false); openComposer({ postType: type as PostType, returnView: 'calendar' }); }}>
                      <span>{icon}</span>{type}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar body */}
      <div style={{ display: 'flex', gap: 16, padding: '16px 22px 24px', alignItems: 'flex-start' }}>

        {/* Calendar panel */}
        <div style={{ flex: 1, minWidth: 0, background: '#fff', border: '1px solid #ece4da', borderRadius: 12, overflow: 'hidden' }}>

          {/* Toggle + month nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #ece4da' }}>
            <div className="cc-cal-toggle">
              <button className="cc-cal-toggle-btn active">Month</button>
              <button className="cc-cal-toggle-btn">Week</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button
                onClick={() => setDisplayMonth(m => subMonths(m, 1))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8a7a72', fontSize: 16, lineHeight: 1 }}
              >←</button>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#3d2f2f', minWidth: 90, textAlign: 'center' }}>
                {format(displayMonth, 'MMMM yyyy')}
              </span>
              <button
                onClick={() => setDisplayMonth(m => addMonths(m, 1))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8a7a72', fontSize: 16, lineHeight: 1 }}
              >→</button>
            </div>
          </div>

          {/* Day-of-week headers */}
          <div className="cc-cal-grid">
            {DAY_HEADERS.map(d => (
              <div key={d} className="cc-cal-day-header">{d}</div>
            ))}
          </div>

          {/* Calendar weeks */}
          <div className="cc-cal-grid">
            {weeks.flatMap((week) =>
              week.map((day) => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const dayPosts = postsByDate[dateKey] ?? [];
                const isOtherMonth = !isSameMonth(day, displayMonth);
                return (
                  <div key={dateKey} className={`cc-cal-day${isOtherMonth ? ' other-month' : ''}`}>
                    <span className="cc-cal-day-num">{format(day, 'd')}</span>
                    {dayPosts.map(p => (
                      <PostMiniCard key={p.id} post={p} />
                    ))}
                  </div>
                );
              })
            )}
          </div>

          {/* Drag hint */}
          <div style={{ padding: '10px 16px', textAlign: 'center', borderTop: '1px solid #ece4da' }}>
            <span style={{ fontSize: 11.5, color: '#b0a098', fontStyle: 'italic', letterSpacing: '0.02em' }}>
              ✦ Drag &amp; drop to reschedule ↔
            </span>
          </div>
        </div>

        {/* Right panel */}
        <div style={{ width: 276, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* This Week's Posts */}
          <div style={{ background: '#fff', border: '1px solid #ece4da', borderRadius: 12, padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#3d2f2f', fontFamily: '"DM Serif Display", Georgia, serif' }}>
                This Week's Posts
              </span>
              <img src={sparkleImg} alt="" style={{ width: 18, height: 18, objectFit: 'contain' }} />
            </div>
            <div>
              {weekPosts.map(p => (
                <WeekPostItem key={p.id} post={p} />
              ))}
            </div>
          </div>

          {/* Campaign Filter */}
          <div style={{ background: '#fff', border: '1px solid #ece4da', borderRadius: 12, padding: '16px 18px' }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: '#3d2f2f', marginBottom: 10 }}>
              Campaign Filter
            </div>
            <div style={{ fontSize: 15, fontFamily: "'Caveat', cursive", color: '#c27b6a', fontStyle: 'italic', marginBottom: 12, lineHeight: 1.3 }}>
              Keep your content aligned
              <img src={sparkleImg} alt="" style={{ width: 14, height: 14, objectFit: 'contain', verticalAlign: 'middle', marginLeft: 4 }} />
            </div>
            <div style={{ position: 'relative' }}>
              <select style={{
                width: '100%', padding: '8px 30px 8px 10px', appearance: 'none',
                background: '#fff', border: '1px solid #ece4da', borderRadius: 8,
                fontSize: 12.5, color: '#3d2f2f', fontWeight: 600, cursor: 'pointer',
                fontFamily: 'inherit',
              }}>
                <option>Spring Launch</option>
                <option>Summer Ready</option>
                <option>Brand Story</option>
                <option>All Campaigns</option>
              </select>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8a7a72" strokeWidth="2"
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
