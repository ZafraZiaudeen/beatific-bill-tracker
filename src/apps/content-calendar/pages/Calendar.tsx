import { useEffect, useRef, useState } from 'react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, parseISO, isSameMonth, format,
  addMonths, subMonths, addDays, addWeeks, subWeeks,
  setMonth, setYear, isSameDay,
} from 'date-fns';
import { useContentCalendarStore } from '../store';
import type { ContentPost } from '../types';
import type { StoredMediaItem } from '../mediaStorage';
import { loadMedia, mediaUrl } from '../mediaStorage';
import { getPlatformConfig } from '../platformConfig';
import { formatContentDate } from '../settings';
import type { DateFormatPreference } from '../types';
import sparkleImg from '../../../assets/budget-assets/sun-sparkles/sun-sparkles-02.png';
import underlineImg from '../../../assets/budget-assets/stationery-accents/stationery-accents-02.png';

const POST_TYPE_ICONS: Record<string, string> = {
  Reel: '🎬', Carousel: '📸', Story: '◷', Static: '🖼',
};

void POST_TYPE_ICONS;

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

const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type CalendarView = 'month' | 'week';

function localDateKey(date: Date) {
  return format(date, 'yyyy-MM-dd');
}

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
  const cfg = getPlatformConfig(platform);
  const color = platform === 'instagram' ? '#c27b6a'
    : platform === 'tiktok' ? '#555'
    : platform === 'youtube' ? '#c0392b'
    : cfg.color ?? '#8a4a5f';
  return (
    <span title={cfg.label} style={{ color, display: 'inline-flex', alignItems: 'center', fontSize: 9, fontWeight: 800 }}>
      {platform === 'instagram' && <IgIcon />}
      {platform === 'tiktok' && <TkIcon />}
      {platform === 'youtube' && <YtIcon />}
      {platform === 'pinterest' && <PinIcon />}
      {!['instagram', 'tiktok', 'youtube', 'pinterest'].includes(platform) && (cfg.icon?.slice(0, 2) || cfg.label.charAt(0))}
    </span>
  );
}

function postMediaStyle(post: ContentPost, media: StoredMediaItem[], urls: Record<string, string>) {
  const item = (post.mediaIds ?? []).map(id => media.find(candidate => candidate.id === id)).find(Boolean);
  const url = item ? mediaUrl(item, urls) : '';
  return url ? { backgroundImage: `url(${url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { background: post.thumbnailBg ?? '#e8e0d8' };
}

function postMediaUrl(post: ContentPost, media: StoredMediaItem[], urls: Record<string, string>) {
  const item = (post.mediaIds ?? []).map(id => media.find(candidate => candidate.id === id)).find(Boolean);
  return item ? mediaUrl(item, urls) : '';
}

function PostMiniCard({ post, media, urls, onEdit, onDelete, onDragStart, onDragEnd }: {
  post: ContentPost
  media: StoredMediaItem[]
  urls: Record<string, string>
  onEdit?: React.MouseEventHandler<HTMLDivElement>
  onDelete?: React.MouseEventHandler<HTMLButtonElement>
  onDragStart?: React.DragEventHandler<HTMLDivElement>
  onDragEnd?: React.DragEventHandler<HTMLDivElement>
}) {
  const tc = TYPE_COLORS[post.type] ?? { bg: '#f0f0f0', text: '#666' };
  const sc = STATUS_COLORS[post.status] ?? STATUS_COLORS.Planned;
  return (
    <div className="cc-post-mini" draggable onClick={onEdit} onDragStart={onDragStart} onDragEnd={onDragEnd} title="Click to edit · Drag to move">
      {/* Thumbnail swatch */}
      {postMediaUrl(post, media, urls) ? <img src={postMediaUrl(post, media, urls)} alt="" style={{ width: 28, minHeight: 56, borderRadius: 4, objectFit: 'cover', flexShrink: 0 }} /> : <div style={{ width: 28, minHeight: 56, borderRadius: 4, ...postMediaStyle(post, media, urls), flexShrink: 0 }} />}
      {/* Info */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2, justifyContent: 'space-between' }}>
        <span style={{
          fontSize: 9, fontWeight: 700, padding: '1px 5px',
          borderRadius: 99, background: tc.bg, color: tc.text,
          whiteSpace: 'nowrap', display: 'inline-block', alignSelf: 'flex-start',
        }}>{post.type}</span>
        <div style={{
          fontSize: 10, color: 'var(--cc-text)', fontWeight: 600,
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
      <button className="cc-post-mini-delete" onClick={e => { e.stopPropagation(); onDelete?.(e) }} title="Delete post">×</button>
    </div>
  );
}

function WeekPostItem({ post, media, urls, dateFormat }: { post: ContentPost; media: StoredMediaItem[]; urls: Record<string, string>; dateFormat: DateFormatPreference }) {
  const tc = TYPE_COLORS[post.type] ?? { bg: '#f0f0f0', text: '#666' };
  const sc = STATUS_COLORS[post.status] ?? STATUS_COLORS.Planned;
  const date = parseISO(post.date);

  return (
    <div className="cc-week-post-item">
      {/* Date col */}
      <div style={{ width: 42, flexShrink: 0 }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--cc-accent)' }}>{formatContentDate(date, dateFormat)}</div>
        <div style={{ fontSize: 10, color: 'var(--cc-text-3)' }}>{format(date, 'EEE')}</div>
      </div>
      {/* Thumbnail */}
      {postMediaUrl(post, media, urls) ? <img src={postMediaUrl(post, media, urls)} alt="" style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 7, objectFit: 'cover' }} /> : <div style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 7, ...postMediaStyle(post, media, urls), overflow: 'hidden' }} />}
      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--cc-text)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
  const { posts, campaigns, settings, openComposer, deletePost, movePost } = useContentCalendarStore();
  const [media, setMedia] = useState<StoredMediaItem[]>([]);
  const [mediaUrls, setMediaUrls] = useState<Record<string, string>>({});
  const mediaUrlsRef = useRef<Record<string, string>>({});
  const [draggingPostId, setDraggingPostId] = useState<string | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [calendarView, setCalendarView] = useState<CalendarView>('month');
  const [focusedDate, setFocusedDate] = useState<Date>(() => new Date());
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(() => new Date().getFullYear());
  const [expandedMonthDate, setExpandedMonthDate] = useState<string | null>(null);
  const [campaignFilter, setCampaignFilter] = useState('all');

  useEffect(() => {
    let active = true;
    loadMedia().then(items => {
      if (!active) return;
      const urls: Record<string, string> = {};
      items.forEach(item => { if (item.blob) urls[item.id] = URL.createObjectURL(item.blob); });
      setMedia(items); setMediaUrls(urls); mediaUrlsRef.current = urls;
    }).catch(() => undefined);
    return () => { active = false; Object.values(mediaUrlsRef.current).forEach(url => URL.revokeObjectURL(url)); };
  }, []);

  const displayMonth = startOfMonth(focusedDate);
  const monthStart = startOfMonth(displayMonth);
  const monthEnd = endOfMonth(displayMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: settings.weekStartsOn });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: settings.weekStartsOn });
  const allDays = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const weeks: Date[][] = [];
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7));
  }

  const weekStart = startOfWeek(focusedDate, { weekStartsOn: settings.weekStartsOn });
  const weekEnd = addDays(weekStart, 6);
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const activeCampaignFilter = campaignFilter !== 'all' && campaigns.some(campaign => campaign.id === campaignFilter)
    ? campaignFilter
    : 'all';
  const filteredPosts = activeCampaignFilter === 'all'
    ? posts
    : posts.filter(post => post.campaignId === activeCampaignFilter);

  const postsByDate: Record<string, ContentPost[]> = {};
  for (const p of filteredPosts) {
    if (!postsByDate[p.date]) postsByDate[p.date] = [];
    postsByDate[p.date].push(p);
  }

  const weekPosts = weekDays.flatMap(day => postsByDate[localDateKey(day)] ?? []);
  const dateRangeLabel = `${formatContentDate(weekStart, settings.dateFormat)} - ${formatContentDate(weekEnd, settings.dateFormat)}`;
  const dayHeaders = Array.from({ length: 7 }, (_, index) => DAY_HEADERS[(settings.weekStartsOn + index) % 7]);

  function navigate(direction: -1 | 1) {
    setFocusedDate(current => calendarView === 'month'
      ? (direction > 0 ? addMonths(current, 1) : subMonths(current, 1))
      : (direction > 0 ? addWeeks(current, 1) : subWeeks(current, 1)));
    setPickerOpen(false);
  }

  function openComposerForDate(day: Date) {
    openComposer({ publishDate: localDateKey(day), returnView: 'calendar' });
  }

  function openComposerForPost(post: ContentPost) {
    openComposer({ sourcePost: post, returnView: 'calendar' });
  }

  function pickMonth(monthIndex: number) {
    setFocusedDate(current => setMonth(setYear(current, pickerYear), monthIndex));
    setPickerOpen(false);
  }

  function renderDay(day: Date, isOtherMonth = false) {
    const dateKey = localDateKey(day);
    const dayPosts = postsByDate[dateKey] ?? [];
    const visiblePosts = calendarView === 'month' && expandedMonthDate !== dateKey
      ? dayPosts.slice(0, 1)
      : dayPosts;
    const extraPostCount = dayPosts.length - visiblePosts.length;
    const isToday = isSameDay(day, new Date());
    const isDragOver = dragOverDate === dateKey;
    return (
      <div
        key={dateKey}
        className={`cc-cal-day${isOtherMonth ? ' other-month' : ''}${isToday ? ' today' : ''}${isDragOver ? ' drag-over' : ''}`}
        onDoubleClick={() => openComposerForDate(day)}
        onDragOver={e => { e.preventDefault(); setDragOverDate(dateKey); }}
        onDragLeave={() => setDragOverDate(null)}
        onDrop={e => {
          e.preventDefault();
          setDragOverDate(null);
          if (draggingPostId) movePost(draggingPostId, dateKey);
          setDraggingPostId(null);
        }}
        title="Double-click to compose · Drop here to reschedule"
      >
        <span className="cc-cal-day-num">{format(day, 'd')}</span>
        <div className={`cc-cal-posts${expandedMonthDate === dateKey ? ' expanded' : ''}`}>
          {visiblePosts.map(p => (
            <PostMiniCard
              key={p.id}
              post={p}
              media={media}
              urls={mediaUrls}
              onEdit={event => { event.stopPropagation(); openComposerForPost(p); }}
              onDelete={() => deletePost(p.id)}
              onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; setDraggingPostId(p.id); }}
              onDragEnd={() => { setDraggingPostId(null); setDragOverDate(null); }}
            />
          ))}
          {extraPostCount > 0 && (
            <button
              type="button"
              className="cc-cal-more"
              onClick={event => {
                event.stopPropagation();
                setExpandedMonthDate(dateKey);
              }}
            >
              +{extraPostCount} more <span>See more</span>
            </button>
          )}
        </div>
      </div>
    );
  }

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
              {dateRangeLabel}
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
              <span style={{ fontSize: 11.5, color: 'var(--cc-text-3)' }}>Search posts, ideas, or hashtags...</span>
            </div>
            <button className="cc-filter-btn">
              All platforms
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <button className="cc-filter-btn">
              All content types
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <label className="cc-filter-btn" aria-label="Filter by campaign">
              <select value={activeCampaignFilter} onChange={event => setCampaignFilter(event.target.value)}>
                <option value="all">All campaigns</option>
                {campaigns.map(campaign => <option key={campaign.id} value={campaign.id}>{campaign.name}</option>)}
              </select>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </label>
            <button className="cc-create-btn" onClick={() => openComposer({ publishDate: localDateKey(focusedDate), returnView: 'calendar' })}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add to calendar
            </button>
          </div>
        </div>
      </div>

      {/* Calendar body */}
      <div style={{ display: 'flex', gap: 16, padding: '16px 22px 24px', alignItems: 'flex-start' }}>

        {/* Calendar panel */}
        <div style={{ flex: 1, minWidth: 0, background: 'var(--cc-card)', border: '1px solid var(--cc-border)', borderRadius: 12, overflow: 'visible' }}>

          {/* Toggle + month nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--cc-border)' }}>
            <div className="cc-cal-toggle">
              <button className={`cc-cal-toggle-btn${calendarView === 'month' ? ' active' : ''}`} onClick={() => setCalendarView('month')}>Month</button>
              <button className={`cc-cal-toggle-btn${calendarView === 'week' ? ' active' : ''}`} onClick={() => setCalendarView('week')}>Week</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
              <button
                onClick={() => navigate(-1)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cc-text-3)', fontSize: 16, lineHeight: 1 }}
              >{'<'}</button>
              <button
                type="button"
                onClick={() => { setPickerYear(focusedDate.getFullYear()); setPickerOpen(open => !open); }}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: 'var(--cc-text)', minWidth: 130, textAlign: 'center', fontFamily: 'inherit' }}
              >
                {calendarView === 'month' ? format(displayMonth, 'MMMM yyyy') : `Week of ${format(weekStart, 'MMM d, yyyy')}`}
              </button>
              <button
                onClick={() => navigate(1)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cc-text-3)', fontSize: 16, lineHeight: 1 }}
              >{'>'}</button>
              {pickerOpen && (
                <div className="cc-month-picker">
                  <div className="cc-month-picker-head">
                    <button type="button" onClick={() => setPickerYear(year => year - 1)}>{'<'}</button>
                    <span>{pickerYear}</span>
                    <button type="button" onClick={() => setPickerYear(year => year + 1)}>{'>'}</button>
                  </div>
                  <div className="cc-month-picker-grid">
                    {MONTH_LABELS.map((month, index) => (
                      <button
                        key={month}
                        type="button"
                        className={pickerYear === focusedDate.getFullYear() && index === focusedDate.getMonth() ? 'active' : ''}
                        onClick={() => pickMonth(index)}
                      >
                        {month}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Day-of-week headers */}
          <div className="cc-cal-grid">
            {dayHeaders.map(d => (
              <div key={d} className="cc-cal-day-header">{d}</div>
            ))}
          </div>

          <div className={`cc-cal-grid${calendarView === 'week' ? ' week-view' : ''}`}>
            {(calendarView === 'month' ? weeks.flat() : weekDays).map(day => renderDay(day, calendarView === 'month' && !isSameMonth(day, displayMonth)))}
          </div>

          {/* Drag hint */}
          <div style={{ padding: '10px 16px', textAlign: 'center', borderTop: '1px solid var(--cc-border)' }}>
            <span style={{ fontSize: 11.5, color: 'var(--cc-text-3)', fontStyle: 'italic', letterSpacing: '0.02em' }}>
              Double-click a date to compose for that day
            </span>
          </div>
        </div>

        {/* Right panel */}
        <div style={{ width: 276, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* This Week's Posts */}
          <div style={{ background: 'var(--cc-card)', border: '1px solid var(--cc-border)', borderRadius: 12, padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--cc-text)', fontFamily: '"DM Serif Display", Georgia, serif' }}>
                This Week's Posts
              </span>
              <img src={sparkleImg} alt="" style={{ width: 18, height: 18, objectFit: 'contain' }} />
            </div>
            <div>
              {weekPosts.length ? weekPosts.map(p => (
                <WeekPostItem key={p.id} post={p} media={media} urls={mediaUrls} dateFormat={settings.dateFormat} />
              )) : (
                <div style={{ fontSize: 12, color: 'var(--cc-text-3)', padding: '8px 0' }}>No posts scheduled this week.</div>
              )}
            </div>
          </div>

          {/* Campaign Filter */}
          <div style={{ background: 'var(--cc-card)', border: '1px solid var(--cc-border)', borderRadius: 12, padding: '16px 18px' }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--cc-text)', marginBottom: 10 }}>
              Campaign Filter
            </div>
            <div style={{ fontSize: 15, fontFamily: "'Caveat', cursive", color: 'var(--cc-accent)', fontStyle: 'italic', marginBottom: 12, lineHeight: 1.3 }}>
              Keep your content aligned
              <img src={sparkleImg} alt="" style={{ width: 14, height: 14, objectFit: 'contain', verticalAlign: 'middle', marginLeft: 4 }} />
            </div>
            <div style={{ position: 'relative' }}>
              <select value={activeCampaignFilter} onChange={event => setCampaignFilter(event.target.value)} style={{
                width: '100%', padding: '8px 30px 8px 10px', appearance: 'none',
                background: 'var(--cc-card)', border: '1px solid var(--cc-border)', borderRadius: 8,
                fontSize: 12.5, color: 'var(--cc-text)', fontWeight: 600, cursor: 'pointer',
                fontFamily: 'inherit',
              }}>
                <option value="all">All campaigns</option>
                {campaigns.map(campaign => <option key={campaign.id} value={campaign.id}>{campaign.name}</option>)}
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
