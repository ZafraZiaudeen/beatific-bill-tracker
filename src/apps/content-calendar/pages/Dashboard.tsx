import { useMemo, useState } from 'react';
import { addDays, parseISO, startOfWeek } from 'date-fns';
import { useContentCalendarStore } from '../store';
import StatCard from '../components/StatCard';
import WeekSchedule from '../components/WeekSchedule';
import DraftsPanel from '../components/DraftsPanel';
import FeedPreview from '../components/FeedPreview';
import SavedIdeas from '../components/SavedIdeas';
import sparkleImg from '../../../assets/budget-assets/sun-sparkles/sun-sparkles-02.png';
import underlineImg from '../../../assets/budget-assets/stationery-accents/stationery-accents-02.png';
import type { ComposerDraft, ContentPost, PipelineItem, PostType } from '../types';
import { getActivePlatformOptions, getActivePostTypes, getPlatformConfig } from '../platformConfig';
import { useMediaAssets } from '../components/useMediaAssets';
import { backupReminderIsDue } from '../settings';

const POST_TYPE_ICONS: Record<string, string> = {
  Reel: '🎬', Carousel: '📸', Story: '◷', Static: '🖼',
};

type DashboardPeriod = 'week' | 'month' | '30days';
type DashboardPost = ContentPost & { searchText: string };

function localDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function periodBounds(period: DashboardPeriod, weekStart?: string) {
  if (period === 'week' && weekStart) {
    return { from: weekStart, to: localDateKey(addDays(parseISO(weekStart), 6)) };
  }
  const end = new Date();
  const start = new Date(end);
  if (period === 'month') start.setDate(1);
  else if (period === '30days') start.setDate(end.getDate() - 29);
  else {
    const day = start.getDay() || 7;
    start.setDate(start.getDate() - day + 1);
  }
  return { from: localDateKey(start), to: localDateKey(end) };
}

function dashboardKey(item: { id: string; composerId?: string; pipelineId?: string }) {
  return item.pipelineId ? `pipeline:${item.pipelineId}` : item.composerId ? `composer:${item.composerId}` : `id:${item.id}`;
}

function pipelineStatus(stage: PipelineItem['stage']): ContentPost['status'] {
  return stage === 'published' ? 'Published' : stage === 'ready' ? 'Scheduled' : stage === 'drafting' ? 'Draft' : 'Planned';
}

function buildDashboardPosts(posts: ContentPost[], pipelineItems: PipelineItem[], composerDrafts: ComposerDraft[]): DashboardPost[] {
  const keys = new Set<string>();
  const pipelineKeys = new Set<string>();
  const result: DashboardPost[] = [];
  posts.forEach(post => {
    if (post.pipelineId) {
      if (pipelineKeys.has(post.pipelineId)) return;
      pipelineKeys.add(post.pipelineId);
    }
    keys.add(dashboardKey(post));
    result.push({ ...post, mediaIds: post.mediaIds ?? [], searchText: `${post.title} ${post.category} ${post.type} ${post.platforms.join(' ')}` });
  });
  pipelineItems.forEach(item => {
    const alreadyTracked = keys.has(`pipeline:${item.id}`) || (item.composerId && keys.has(`composer:${item.composerId}`));
    keys.add(`pipeline:${item.id}`);
    if (alreadyTracked) return;
    result.push({
      id: item.id,
      title: item.title,
      status: pipelineStatus(item.stage),
      date: item.scheduledDate,
      time: item.scheduledTime,
      platforms: item.platforms,
      type: item.contentType,
      category: item.badgeLabel ?? item.campaign ?? '',
      mediaIds: item.mediaIds ?? [],
      imageCount: item.mediaIds?.length ?? 0,
      composerId: item.composerId,
      pipelineId: item.id,
      campaignId: item.campaignId,
      searchText: `${item.title} ${item.notes ?? ''} ${item.contentType} ${item.platforms.join(' ')} ${item.campaign ?? ''}`,
    });
  });
  composerDrafts.forEach(draft => {
    if (draft.status !== 'scheduled' || !draft.publishDate) return;
    const key = dashboardKey(draft);
    if (keys.has(key)) return;
    keys.add(key);
    result.push({
      id: draft.id,
      title: draft.caption.split('\n')[0] || 'Untitled scheduled post',
      status: 'Scheduled',
      date: draft.publishDate,
      time: draft.publishTime,
      platforms: draft.platforms,
      type: draft.postType,
      category: '',
      mediaIds: draft.mediaIds ?? [],
      imageCount: draft.mediaIds?.length ?? 0,
      composerId: draft.id,
      pipelineId: draft.pipelineId,
      campaignId: draft.campaignId,
      searchText: `${draft.caption} ${draft.hashtags.join(' ')} ${draft.postType} ${draft.platforms.join(' ')}`,
    });
  });
  return result;
}

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
  const { posts, drafts, composerDrafts, pipelineItems, ideas, settings, userName, dismissBackupReminder, setActiveView, openComposer } = useContentCalendarStore();
  const { items: mediaItems, urls: mediaUrls } = useMediaAssets();
  const [now] = useState(() => new Date());
  const platformOptions = getActivePlatformOptions();
  const [query, setQuery] = useState('');
  const [platform, setPlatform] = useState('all');
  const [type, setType] = useState('all');
  const [period, setPeriod] = useState<DashboardPeriod>('week');
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const availableTypes = platform === 'all' ? getActivePostTypes() : getPlatformConfig(platform).postTypes;
  const preferredWeekStart = localDateKey(startOfWeek(now, { weekStartsOn: settings.weekStartsOn }));
  const bounds = periodBounds(period, preferredWeekStart);
  const allDashboardPosts = useMemo(() => buildDashboardPosts(posts, pipelineItems, composerDrafts), [posts, pipelineItems, composerDrafts]);
  const backupDue = backupReminderIsDue(settings, now);
  const filteredPosts = useMemo(() => allDashboardPosts.filter(post => {
    const normalizedQuery = query.trim().toLowerCase();
    return (!normalizedQuery || post.searchText.toLowerCase().includes(normalizedQuery))
      && (platform === 'all' || post.platforms.includes(platform))
      && (type === 'all' || post.type === type)
      && post.date >= bounds.from && post.date <= bounds.to;
  }), [allDashboardPosts, query, platform, type, bounds.from, bounds.to]);
  const filteredIdeas = useMemo(() => ideas.filter(idea => {
    const normalizedQuery = query.trim().toLowerCase();
    return (!normalizedQuery || `${idea.title} ${idea.description} ${idea.notes} ${idea.type} ${idea.platform}`.toLowerCase().includes(normalizedQuery))
      && (platform === 'all' || idea.platform === platform)
      && (type === 'all' || idea.type === type);
  }), [ideas, query, platform, type]);
  const stats = {
    planned: filteredPosts.filter(post => post.status === 'Planned').length,
    scheduled: filteredPosts.filter(post => post.status === 'Scheduled').length,
    published: filteredPosts.filter(post => post.status === 'Published').length,
    ideas: filteredIdeas.length,
  };
  const schedulePosts = filteredPosts.filter(post => post.date >= preferredWeekStart && post.date <= localDateKey(addDays(parseISO(preferredWeekStart), 6)));
  const draftRows = useMemo(() => drafts.map(draft => {
    const source = composerDrafts.find(item => item.id === draft.id);
    return { ...draft, mediaIds: source?.mediaIds ?? [], source };
  }).filter(draft => {
    const normalizedQuery = query.trim().toLowerCase();
    const source = draft.source;
    if (source?.pipelineId && posts.some(p => p.pipelineId === source.pipelineId && p.status === 'Scheduled')) return false;
    return (!normalizedQuery || `${draft.title} ${draft.type} ${source?.caption ?? ''} ${source?.hashtags?.join(' ') ?? ''}`.toLowerCase().includes(normalizedQuery))
      && (platform === 'all' || Boolean(source?.platforms.includes(platform)))
      && (type === 'all' || draft.type === type)
      && (!source?.publishDate || (source.publishDate >= bounds.from && source.publishDate <= bounds.to));
  }), [drafts, composerDrafts, posts, query, platform, type, bounds.from, bounds.to]);
  const currentDateLabel = now.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>

      {/* Page header */}
      <div className="cc-header">
        <div className="cc-header-left">
          <div style={{ fontSize: 16, color: 'var(--cc-text-3)', marginBottom: 6 }}>Welcome back, <strong style={{ color: 'var(--cc-text-2)' }}>{userName || 'creator'}</strong>.</div>
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
              {currentDateLabel}
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
            <label className="cc-search">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search posts, ideas, or hashtags..." aria-label="Search posts, ideas, or hashtags" />
            </label>
            <label className="cc-filter-btn">
              <select value={platform} onChange={event => { setPlatform(event.target.value); setType('all'); }} aria-label="Filter by platform">
                <option value="all">All platforms</option>
                {platformOptions.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
              </select>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </label>
            <label className="cc-filter-btn">
              <select value={type} onChange={event => setType(event.target.value)} aria-label="Filter by content type">
                <option value="all">All content types</option>
                {availableTypes.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </label>
            <label className="cc-filter-btn">
              <select value={period} onChange={event => setPeriod(event.target.value as DashboardPeriod)} aria-label="Filter by period">
                <option value="week">This week</option>
                <option value="month">This month</option>
                <option value="30days">Last 30 days</option>
              </select>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </label>
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
                  {platformOptions.flatMap(option => option.config.postTypes.map(type => (
                    <button key={`${option.id}-${type.id}`} className="cc-create-dropdown-item" onClick={() => { setShowCreateMenu(false); openComposer({ platforms: [option.id], postType: type.id as PostType, returnView: 'dashboard' }); }}>
                      <span>{POST_TYPE_ICONS[type.id] ?? '•'}</span>{type.label}
                    </button>
                  )))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {backupDue && <div style={{ margin: '10px 22px 0', padding: '9px 12px', border: '1px solid var(--cc-border)', borderRadius: 9, background: 'var(--cc-accent-light)', color: 'var(--cc-text-2)', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <span>Your local workspace backup is due.</span>
        <span style={{ display: 'flex', gap: 10 }}><button style={{ border: 0, background: 'none', color: 'var(--cc-accent)', font: 'inherit', fontWeight: 700, cursor: 'pointer' }} onClick={() => setActiveView('settings')}>Open Settings</button><button style={{ border: 0, background: 'none', color: 'var(--cc-text-3)', font: 'inherit', cursor: 'pointer' }} onClick={dismissBackupReminder}>Tomorrow</button></span>
      </div>}

      {/* Stat cards row */}
      <div style={{ display: 'flex', gap: 12, padding: '14px 22px', borderBottom: '1px solid var(--cc-border)' }}>
        <StatCard label="Planned" value={stats.planned} iconBg="#f9d5cc" underlineColor="#e0906e" icon={<CalendarIcon />} />
        <StatCard label="Scheduled" value={stats.scheduled} iconBg="#ddd6f8" underlineColor="#7b5ea8" icon={<SendIcon />} />
        <StatCard label="Published" value={stats.published} iconBg="#d3e9fb" underlineColor="#3a80b0" icon={<CheckIcon />} />
        <StatCard label="Ideas" value={stats.ideas} iconBg="#fdf3c0" underlineColor="#c8a800" icon={<BulbIcon />} />
      </div>

      {/* 3-column content area */}
      <div style={{ display: 'flex', gap: 0, alignItems: 'flex-start' }}>

        {/* Column 1 — This Week's Schedule (~44%) */}
        <div style={{ flex: '0 0 44%', padding: '16px 14px 24px 22px', borderRight: '1px solid var(--cc-border)' }}>
          <WeekSchedule posts={schedulePosts} weekOf={preferredWeekStart} onViewMonth={() => setActiveView('calendar')} mediaItems={mediaItems} mediaUrls={mediaUrls} />
        </div>

        {/* Column 2 — Content Rhythm + Drafts + Saved Ideas (~30%) */}
        <div style={{ flex: '0 0 30%', padding: '16px 12px 24px', borderRight: '1px solid var(--cc-border)', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <DraftsPanel drafts={draftRows} mediaItems={mediaItems} mediaUrls={mediaUrls} />
          <SavedIdeas ideas={filteredIdeas.slice(0, 3)} onViewAll={() => setActiveView('ideas')} />
        </div>

        {/* Column 3 — Feed Preview (~26%) */}
        <div style={{ flex: '0 0 26%', padding: '16px 22px 24px 12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <FeedPreview posts={filteredPosts} mediaItems={mediaItems} mediaUrls={mediaUrls} onViewAll={() => setActiveView('calendar')} />
        </div>
      </div>
    </div>
  );
}
