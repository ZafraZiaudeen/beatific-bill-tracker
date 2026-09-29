/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react';
import type { FormEvent } from 'react';
import { CalendarDays, MapPin, Sparkles, Plus, Pencil, Trash2, X } from 'lucide-react';
import { useContentCalendarStore } from '../store';
import type { Campaign, CampaignStatus, Platform } from '../types';
import { getActivePlatformOptions, getPlatformConfig } from '../platformConfig';
import { LocalImageUpload } from '../components/LocalImageUpload';
import { mediaUrl } from '../mediaStorage';
import { useMediaAssets as useStoredMediaAssets } from '../components/useMediaAssets';
import { formatContentDate } from '../settings';

export const PAGE_CSS = `
.cc-camp-page{background:var(--cc-bg);color:var(--cc-text);min-height:100%;padding-bottom:32px}

/* Header */
.cc-camp-header{display:flex;align-items:flex-start;justify-content:space-between;gap:24px;padding:16px 22px 12px}
.cc-camp-heading-row{display:flex;align-items:center;gap:9px}
.cc-camp-heading{font-family:'DM Serif Display',Georgia,serif;font-weight:400;font-size:28px;line-height:1;letter-spacing:-.02em;margin:0;color:var(--cc-text);white-space:nowrap}
.cc-camp-star{color:#e6ad3f;transform:rotate(-10deg);flex-shrink:0}
.cc-camp-swoop{display:block;width:130px;height:11px;margin-top:8px;border-top:3px solid var(--cc-accent);border-radius:50%;transform:rotate(-3deg)}
.cc-camp-header-right{flex-shrink:0;display:flex;flex-direction:column;align-items:flex-end;gap:10px}
.cc-camp-meta{display:flex;align-items:center;gap:18px;font-weight:650;font-size:12px}
.cc-camp-date{display:flex;align-items:center;gap:7px;color:var(--cc-text)}
.cc-camp-local{display:flex;align-items:center;gap:7px;padding:6px 14px;background:var(--cc-accent-light);border-radius:99px;font-size:11px;color:var(--cc-text-2)}
.cc-camp-toolbar{display:flex;align-items:center;gap:7px}
.cc-camp-search{height:31px;min-width:220px;display:flex;align-items:center;gap:8px;padding:0 11px;background:var(--cc-card);border:1px solid var(--cc-border);border-radius:11px;font-size:10.5px;color:var(--cc-text-3)}
.cc-camp-select-wrap{position:relative}
.cc-camp-select{appearance:none;height:31px;padding:0 26px 0 11px;border:1px solid var(--cc-border);border-radius:11px;background:var(--cc-card);font-size:10.5px;color:var(--cc-text);outline:0;cursor:pointer;font-family:inherit}
.cc-camp-select-wrap svg{position:absolute;right:8px;top:10px;pointer-events:none;color:var(--cc-text-2)}
.cc-camp-add-btn{height:32px;display:flex;align-items:center;gap:6px;padding:0 16px;border-radius:18px;background:linear-gradient(90deg,#d96d49,#dc815f);color:#fff;font-size:11px;font-weight:700;border:none;cursor:pointer;white-space:nowrap;box-shadow:0 4px 10px rgba(201,99,65,.18);font-family:inherit}

/* Body layout */
.cc-camp-body{display:grid;grid-template-columns:minmax(0,1fr) 270px;gap:16px;padding:4px 22px 0}

/* Section header */
.cc-camp-section-title{font-family:'DM Serif Display',Georgia,serif;font-weight:400;font-size:19px;color:var(--cc-text);margin:0 0 14px;display:flex;align-items:center;gap:8px}

/* ── Campaign card ── */
.cc-camp-card{display:flex;flex-direction:row;min-width:0;background:var(--cc-card);border:1px solid var(--cc-border);border-radius:12px;overflow:hidden;margin-bottom:12px;transition:box-shadow .15s}
.cc-camp-card:last-child{margin-bottom:0}
.cc-camp-card:hover{box-shadow:0 6px 20px rgba(60,40,30,.08)}

/* Image: left side, padded, square */
.cc-camp-img-wrap{width:136px;flex-shrink:0;padding:10px;display:flex;align-items:stretch}
.cc-camp-img{flex:1;border-radius:8px;position:relative;display:flex;align-items:flex-end;padding:8px;overflow:hidden;min-height:130px}
.cc-camp-img-overlay{position:absolute;inset:0}

/* Content: right of image */
.cc-camp-content{flex:1;min-width:0;padding:12px 15px 12px 14px;display:flex;flex-direction:column;gap:8px;border-left:1px solid #f0e8e0}

/* Badge + view btn row — spans all 3 cols */
.cc-camp-top-row{display:flex;align-items:center;justify-content:space-between;gap:8px}
.cc-camp-badge{display:inline-block;padding:3px 9px;border-radius:99px;font-size:9px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;position:relative;z-index:2}
.cc-camp-img .cc-camp-badge{position:absolute;left:8px;bottom:8px}
.cc-camp-badge.launch{background:#fce3dc;color:#c05d45}
.cc-camp-badge.growth{background:#ddeaf3;color:#3a6f92}
.cc-camp-badge.brand{background:#ede0ce;color:#7a5a35}
.cc-camp-view-btn{font-size:10.5px;font-weight:700;color:var(--cc-accent);background:none;border:none;cursor:pointer;padding:0;white-space:nowrap;font-family:inherit}

/* 3-column body row */
.cc-camp-cols{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0;flex:1;align-items:start;min-width:0}

/* Col 1: info */
.cc-camp-col-info{min-width:0;padding-right:12px}
.cc-camp-name{font-family:'DM Serif Display',Georgia,serif;font-weight:400;font-size:22px;color:var(--cc-text);margin:0 0 5px;line-height:1.1}
.cc-camp-date-row{display:flex;align-items:center;gap:5px;font-size:11px;color:var(--cc-text-2);font-weight:500;margin-bottom:6px}
.cc-camp-goal-label{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:var(--cc-text-3);margin-bottom:3px;display:flex;align-items:center;gap:5px}
.cc-camp-goal-text{font-size:11px;color:var(--cc-text-2);line-height:1.45}

/* Col 2: platforms */
.cc-camp-col-platforms{min-width:0;padding:0 12px;border-left:1px solid #f0e8e0}
.cc-camp-col-label{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:var(--cc-text-3);margin-bottom:7px}
.cc-camp-platform-row{display:flex;align-items:center;gap:7px;font-size:10.5px;color:var(--cc-text-2);font-weight:500;margin-bottom:5px}
.cc-camp-platform-row:last-child{margin-bottom:0}

/* Col 3: posts */
.cc-camp-col-posts{min-width:0;border-left:1px solid #f0e8e0;padding-left:12px}
.cc-camp-posts-count{font-family:'DM Serif Display',Georgia,serif;font-size:28px;color:var(--cc-text);line-height:1;display:flex;align-items:baseline;gap:3px;margin-bottom:6px}
.cc-camp-posts-total{font-size:15px;color:var(--cc-text-3);font-family:'Nunito',sans-serif}
.cc-camp-progress-wrap{width:100%;height:5px;background:var(--cc-bg-3);border-radius:99px;overflow:hidden;margin-bottom:4px}
.cc-camp-progress-bar{height:100%;border-radius:99px}
.cc-camp-pct{font-size:10px;color:var(--cc-text-3);font-weight:600}

/* Platform icon colors */
.cc-camp-ig{color:#e44637}
.cc-camp-tt{color:#1a1a2e}
.cc-camp-yt{color:#c0302e}
.cc-camp-pin{color:#c8253a}
.cc-camp-em{color:#5a7a9a}
.cc-camp-blog{color:#7a6a9a}

/* ── Timeline sidebar ── */
.cc-camp-timeline-card{background:var(--cc-card);border:1px solid var(--cc-border);border-radius:12px;padding:15px 16px 14px}
.cc-camp-tl-title{font-family:'DM Serif Display',Georgia,serif;font-weight:400;font-size:17px;color:var(--cc-text);margin:0 0 14px;display:flex;align-items:center;gap:8px}
.cc-camp-tl-list{display:flex;flex-direction:column;gap:0;position:relative}
.cc-camp-tl-list::before{content:'';position:absolute;left:7px;top:8px;bottom:8px;width:1.5px;background:var(--cc-bg-3);z-index:0}
.cc-camp-tl-item{display:flex;gap:11px;padding-bottom:18px;position:relative;z-index:1}
.cc-camp-tl-item:last-child{padding-bottom:0}
.cc-camp-tl-dot{width:15px;height:15px;border-radius:50%;flex-shrink:0;margin-top:3px}
.cc-camp-tl-body{flex:1;min-width:0}
.cc-camp-tl-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:3px}
.cc-camp-tl-name{font-size:12.5px;font-weight:700;color:var(--cc-text)}
.cc-camp-tl-count{font-size:10px;color:var(--cc-text-3);font-weight:600}
.cc-camp-tl-badge{display:inline-block;padding:2px 7px;border-radius:99px;font-size:8px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;margin-bottom:3px}
.cc-camp-tl-date{font-size:10px;color:var(--cc-text-3);margin-bottom:5px}
.cc-camp-tl-items{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:2px}
.cc-camp-tl-items li{font-size:10px;color:var(--cc-text-2);display:flex;align-items:center;gap:4px}
.cc-camp-tl-items li::before{content:'•';color:#c0a898;font-size:12px;line-height:1}
.cc-camp-handwriting{font-family:'Caveat',cursive;font-size:18px;color:#c07050;line-height:1.3;text-align:center;margin:16px 0 14px;display:flex;flex-direction:column;align-items:center;gap:1px}
.cc-camp-handwriting-star{color:#e6ad3f;margin-left:3px;font-family:sans-serif;font-size:14px}
.cc-camp-add-campaign-btn{width:100%;display:flex;align-items:center;justify-content:center;gap:6px;padding:9px;border:1.5px dashed #d0c4b8;border-radius:9px;background:transparent;color:var(--cc-text-3);font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;transition:background .12s,color .12s}
.cc-camp-add-campaign-btn:hover{background:#f5ede5;color:var(--cc-text-2)}

@media (max-width: 1080px){
  .cc-camp-body{grid-template-columns:minmax(0,1fr)}
  .cc-camp-timeline-card{margin-top:16px}
}

/* Legacy renderer retained only as a migration reference.
function LegacyCampaigns() {
  const { campaigns, pipelineItems } = useContentCalendarStore();
  const { items, urls } = useStoredMediaAssets();
  const [status, setStatus] = useState('all');
  const [platform, setPlatform] = useState('all');
  const [period, setPeriod] = useState('all');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Campaign | undefined>();
  const [showForm, setShowForm] = useState(false);
  const [viewing, setViewing] = useState<Campaign | undefined>();
  const options = getActivePlatformOptions();
  const filtered = campaigns.filter(campaign => {
    const linkedText = pipelineItems.filter(item => item.campaignId === campaign.id).map(item => item.title).join(' ');
    if (search && false) return false;
    if (status !== 'all' && campaign.status !== status) return false;
    if (platform !== 'all' && !campaign.platforms.includes(platform)) return false;
    if (period !== 'all') {
      const now = new Date(); const start = new Date(now); const end = new Date(now);
      if (period === 'month') { start.setDate(1); end.setMonth(end.getMonth() + 1, 0); }
      if (period === '30') start.setDate(start.getDate() - 30);
      if (!(campaign.endDate >= todayKey(start) && campaign.startDate <= todayKey(end))) return false;
    }
    return true;
  });
  return <div className="cc-camp-page">
    <div className="cc-camp-header"><div><div className="cc-camp-heading-row"><h1 className="cc-camp-heading">Give every post a reason to belong.</h1><Sparkles size={22} className="cc-camp-star" /></div><span className="cc-camp-swoop" /></div><div className="cc-camp-header-right"><div className="cc-camp-meta"><span><CalendarDays size={14} color="#c27b6a" /> {todayKey()}</span><span className="cc-camp-local"><MapPin size={11} /> Local only</span></div><div className="cc-camp-toolbar"><input className="cc-camp-search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search campaigns..." /><select className="cc-camp-select" value={status} onChange={event => setStatus(event.target.value)}><option value="all">All statuses</option>{CAMPAIGN_STATUSES.map(item => <option key={item} value={item}>{item}</option>)}</select><select className="cc-camp-select" value={platform} onChange={event => setPlatform(event.target.value)}><option value="all">All platforms</option>{options.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select><select className="cc-camp-select" value={period} onChange={event => setPeriod(event.target.value)}><option value="all">All time</option><option value="month">This month</option><option value="30">Last 30 days</option></select><button className="cc-camp-add-btn" onClick={() => { setEditing(undefined); setShowForm(true); }}><Plus size={13} />Add campaign</button></div></div></div>
    <div className="legacy-render-body" />
    {showForm && <CampaignForm initial={editing} onClose={() => setShowForm(false)} />}{viewing && <CampaignDetail campaign={campaigns.find(item => item.id === viewing.id) ?? viewing} onClose={() => setViewing(undefined)} onEdit={() => { setEditing(viewing); setViewing(undefined); setShowForm(true); }} />}
  </div></>;
}

*/
@media (max-width: 720px){
  .cc-camp-header{display:block}
  .cc-camp-heading{white-space:normal}
  .cc-camp-header-right{align-items:stretch;margin-top:16px}
  .cc-camp-meta,.cc-camp-toolbar{flex-wrap:wrap;justify-content:flex-start}
  .cc-camp-toolbar{align-items:stretch}
  .cc-camp-search{flex:1 1 100%;min-width:0}
  .cc-camp-card{display:block}
  .cc-camp-img-wrap{width:auto;height:136px}
  .cc-camp-content{border-left:0;border-top:1px solid #f0e8e0}
  .cc-camp-cols{grid-template-columns:minmax(0,1fr) 110px}
  .cc-camp-col-platforms{grid-column:1 / -1;grid-row:2;border-left:0;border-top:1px solid #f0e8e0;margin-top:12px;padding:12px 0 0;display:flex;flex-wrap:wrap;gap:5px 14px}
  .cc-camp-col-platforms .cc-camp-col-label{width:100%;margin-bottom:0}
  .cc-camp-platform-row{margin-bottom:0}
}
`;

const CAMPAIGNS = [
  {
    id: 'spring-launch',
    badge: 'LAUNCH',
    badgeClass: 'launch',
    name: 'Spring launch',
    dateRange: 'Apr 21 – Apr 27, 2025',
    goal: 'Drive product awareness and early engagement with the new collection.',
    platforms: ['instagram', 'tiktok', 'pinterest'] as const,
    postsCompleted: 8,
    postsTotal: 12,
    progressColor: '#c27b6a',
    imgGradient: 'linear-gradient(155deg,#f2e8da 0%,#e4d0b8 100%)',
    imgAccentColor: 'rgba(210,175,140,.35)',
    timelineItems: ['Product teaser', 'Collection reveal', 'Customer UGC'],
    dotColor: '#d97856',
  },
  {
    id: 'weekly-newsletter',
    badge: 'GROWTH',
    badgeClass: 'growth',
    name: 'Weekly newsletter',
    dateRange: 'Apr 21 – Apr 27, 2025',
    goal: 'Grow subscriber list and increase email open rates.',
    platforms: ['instagram', 'email', 'blog'] as const,
    postsCompleted: 4,
    postsTotal: 4,
    progressColor: '#56819a',
    imgGradient: 'linear-gradient(155deg,#e8e2da 0%,#d4cbc0 100%)',
    imgAccentColor: 'rgba(180,165,148,.35)',
    timelineItems: ['Newsletter send', 'Blog post', 'Subscriber CTA'],
    dotColor: '#b0b8be',
  },
  {
    id: 'behind-brand',
    badge: 'BRAND',
    badgeClass: 'brand',
    name: 'Behind the brand',
    dateRange: 'Apr 22 – Apr 27, 2025',
    goal: 'Show the people, process and values behind The Content Edit.',
    platforms: ['instagram', 'tiktok', 'youtube'] as const,
    postsCompleted: 6,
    postsTotal: 8,
    progressColor: '#c27b6a',
    imgGradient: 'linear-gradient(155deg,#f0d8c4 0%,#e2c4a8 100%)',
    imgAccentColor: 'rgba(200,155,115,.35)',
    timelineItems: ['Founder story', 'Team day', 'Studio moments'],
    dotColor: '#d97856',
  },
];

const TL_POSTS = [8, 4, 6];

type PlatformId = 'instagram' | 'tiktok' | 'youtube' | 'pinterest' | 'email' | 'blog';

const PLATFORM_LABELS: Record<PlatformId, string> = {
  instagram: 'Instagram', tiktok: 'TikTok', youtube: 'YouTube',
  pinterest: 'Pinterest', email: 'Email', blog: 'Blog',
};

function PlatformIcon({ platform }: { platform: PlatformId }) {
  if (platform === 'instagram') return (
    <span className="cc-camp-ig">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <rect x="3" y="3" width="18" height="18" rx="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
      </svg>
    </span>
  );
  if (platform === 'tiktok') return (
    <span className="cc-camp-tt">
      <svg width="12" height="13" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.79 1.54V6.79a4.85 4.85 0 0 1-1.02-.1z"/>
      </svg>
    </span>
  );
  if (platform === 'youtube') return (
    <span className="cc-camp-yt">
      <svg width="14" height="11" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
        <path d="m9.75 15.02 5.75-3.02-5.75-3.02z" fill="white"/>
      </svg>
    </span>
  );
  if (platform === 'pinterest') return (
    <span className="cc-camp-pin" style={{ fontWeight: 800, fontFamily: 'Georgia,serif', fontSize: 14, lineHeight: 1 }}>P</span>
  );
  if (platform === 'email') return (
    <span className="cc-camp-em">
      <svg width="13" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="4" width="20" height="16" rx="2"/>
        <polyline points="2,4 12,13 22,4"/>
      </svg>
    </span>
  );
  return (
    <span className="cc-camp-blog">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <line x1="7" y1="8" x2="17" y2="8"/>
        <line x1="7" y1="12" x2="17" y2="12"/>
        <line x1="7" y1="16" x2="13" y2="16"/>
      </svg>
    </span>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function LegacyCampaigns() {
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [platformFilter, setPlatformFilter] = useState('All platforms');
  const [periodFilter, setPeriodFilter] = useState('This week');

  return (
    <>
      <style>{PAGE_CSS}</style>
      <div className="cc-camp-page">

        {/* ── Header ── */}
        <div className="cc-camp-header">
          <div>
            <div className="cc-camp-heading-row">
              <h1 className="cc-camp-heading">Give every post a reason to belong.</h1>
              <Sparkles size={22} className="cc-camp-star" />
            </div>
            <span className="cc-camp-swoop" />
          </div>

          <div className="cc-camp-header-right">
            <div className="cc-camp-meta">
              <div className="cc-date-range">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
              <span className="cc-local-badge">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                Local only
              </span>
            </div>
            <div className="cc-camp-toolbar">
              <div className="cc-camp-search">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                Search campaigns, goals, or platforms...
              </div>
              <div className="cc-camp-select-wrap">
                <select className="cc-camp-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option>All statuses</option><option>Active</option><option>Completed</option><option>Draft</option>
                </select>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              <div className="cc-camp-select-wrap">
                <select className="cc-camp-select" value={platformFilter} onChange={e => setPlatformFilter(e.target.value)}>
                  <option>All platforms</option><option>Instagram</option><option>TikTok</option><option>YouTube</option>
                </select>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              <div className="cc-camp-select-wrap">
                <select className="cc-camp-select" value={periodFilter} onChange={e => setPeriodFilter(e.target.value)}>
                  <option>This week</option><option>This month</option><option>Last 30 days</option>
                </select>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              <button className="cc-camp-add-btn">
                <Plus size={13} strokeWidth={2.5} />
                Add campaign
              </button>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="cc-camp-body">

          {/* Left: Campaign list */}
          <div>
            <h2 className="cc-camp-section-title">
              Active Campaigns
              <Sparkles size={16} color="#e6ad3f" />
            </h2>

            {CAMPAIGNS.map(camp => {
              const pct = Math.round((camp.postsCompleted / camp.postsTotal) * 100);
              return (
                <div key={camp.id} className="cc-camp-card">

                  {/* Image: left, padded, square */}
                  <div className="cc-camp-img-wrap">
                    <div
                      className="cc-camp-img"
                      style={{ background: camp.imgGradient }}
                    >
                      <div
                        className="cc-camp-img-overlay"
                        style={{ background: `radial-gradient(ellipse at 55% 30%, ${camp.imgAccentColor}, transparent 65%)` }}
                      />
                      {/* Outline star at bottom-left */}
                      <svg
                        width="18" height="18" viewBox="0 0 24 24"
                        fill="none" stroke="rgba(255,255,255,.6)" strokeWidth="1.5"
                        style={{ position: 'relative', zIndex: 1 }}
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="cc-camp-content">
                    {/* Badge + view btn */}
                    <div className="cc-camp-top-row">
                      <span className={`cc-camp-badge ${camp.badgeClass}`}>{camp.badge}</span>
                      <button className="cc-camp-view-btn">View campaign →</button>
                    </div>

                    {/* 3 columns */}
                    <div className="cc-camp-cols">

                      {/* Col 1: Name + Date + Goal */}
                      <div className="cc-camp-col-info">
                        <h3 className="cc-camp-name">{camp.name}</h3>
                        <div className="cc-camp-date-row">
                          <CalendarDays size={12} color="#c27b6a" />
                          {camp.dateRange}
                        </div>
                        <div className="cc-camp-goal-label">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                          Goal
                        </div>
                        <div className="cc-camp-goal-text">{camp.goal}</div>
                      </div>

                      {/* Col 2: Platforms */}
                      <div className="cc-camp-col-platforms">
                        <div className="cc-camp-col-label">Platforms</div>
                        {camp.platforms.map(p => (
                          <div key={p} className="cc-camp-platform-row">
                            <PlatformIcon platform={p as PlatformId} />
                            {PLATFORM_LABELS[p as PlatformId]}
                          </div>
                        ))}
                      </div>

                      {/* Col 3: Posts */}
                      <div className="cc-camp-col-posts">
                        <div className="cc-camp-col-label">Posts</div>
                        <div className="cc-camp-posts-count">
                          {camp.postsCompleted}
                          <span className="cc-camp-posts-total">/ {camp.postsTotal}</span>
                        </div>
                        <div className="cc-camp-progress-wrap">
                          <div
                            className="cc-camp-progress-bar"
                            style={{ width: `${pct}%`, background: camp.progressColor }}
                          />
                        </div>
                        <div className="cc-camp-pct">{pct}%</div>
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Timeline sidebar */}
          <div>
            <div className="cc-camp-timeline-card">
              <h2 className="cc-camp-tl-title">
                Campaign Timeline
                <Sparkles size={15} color="#e6ad3f" />
              </h2>

              <div className="cc-camp-tl-list">
                {CAMPAIGNS.map((camp, i) => (
                  <div key={camp.id} className="cc-camp-tl-item">
                    <div
                      className="cc-camp-tl-dot"
                      style={{ background: camp.dotColor, boxShadow: `0 0 0 2px #fff, 0 0 0 3.5px ${camp.dotColor}` }}
                    />
                    <div className="cc-camp-tl-body">
                      <div className="cc-camp-tl-top">
                        <span className="cc-camp-tl-name">{camp.name}</span>
                        <span className="cc-camp-tl-count">{TL_POSTS[i]} posts</span>
                      </div>
                      <span className={`cc-camp-tl-badge cc-camp-badge ${camp.badgeClass}`}>{camp.badge}</span>
                      <div className="cc-camp-tl-date">{camp.dateRange}</div>
                      <ul className="cc-camp-tl-items">
                        {camp.timelineItems.map(item => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cc-camp-handwriting">
                <span>Different stories.</span>
                <span>Same bigger picture.<span className="cc-camp-handwriting-star">✦</span></span>
              </div>

              <button className="cc-camp-add-campaign-btn">
                <Plus size={13} />
                Add campaign
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

void LegacyCampaigns;

export const CAMPAIGN_STATUSES: CampaignStatus[] = ['draft', 'active', 'completed'];
export const todayKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const emptyCampaign = (): Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'> => ({
  name: '', status: 'draft', startDate: todayKey(), endDate: todayKey(), goal: '', platforms: [], badge: 'Campaign', timelineItems: [''],
});

export function CampaignForm({ initial, onClose }: { initial?: Campaign; onClose: () => void }) {
  const addCampaign = useContentCalendarStore(state => state.addCampaign);
  const updateCampaign = useContentCalendarStore(state => state.updateCampaign);
  const options = getActivePlatformOptions();
  const [form, setForm] = useState<Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>>(() => initial ? { ...initial } : emptyCampaign());
  const [error, setError] = useState('');
  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm(current => ({ ...current, [key]: value }));
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!form.name.trim()) return setError('Campaign name is required.');
    if (!form.startDate || !form.endDate || form.endDate < form.startDate) return setError('Choose a valid date range.');
    if (!form.platforms.length) return setError('Select at least one platform.');
    const campaign = { ...form, name: form.name.trim(), goal: form.goal.trim(), badge: form.badge.trim() || 'Campaign', timelineItems: form.timelineItems.map(item => item.trim()).filter(Boolean), coverMediaId: form.coverMediaId || undefined };
    if (initial) updateCampaign(initial.id, campaign); else addCampaign(campaign);
    onClose();
  }
  function togglePlatform(platform: Platform) { update('platforms', form.platforms.includes(platform) ? form.platforms.filter(item => item !== platform) : [...form.platforms, platform]); }
  return <div className="cc-camp-modal-overlay" onMouseDown={event => event.target === event.currentTarget && onClose()}>
    <form className="cc-camp-modal" onSubmit={submit} role="dialog" aria-modal="true">
      <div className="cc-camp-modal-head"><h2>{initial ? 'Edit campaign' : 'Add campaign'}</h2><button type="button" onClick={onClose} aria-label="Close"><X size={16} /></button></div>
      <div className="cc-camp-form-grid">
        <label>Campaign name<input autoFocus value={form.name} onChange={event => update('name', event.target.value)} /></label>
        <label>Badge<input value={form.badge} onChange={event => update('badge', event.target.value)} /></label>
        <label>Status<select value={form.status} onChange={event => update('status', event.target.value as CampaignStatus)}>{CAMPAIGN_STATUSES.map(status => <option key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}</select></label>
        <label>Start date<input type="date" value={form.startDate} onChange={event => update('startDate', event.target.value)} /></label>
        <label>End date<input type="date" value={form.endDate} onChange={event => update('endDate', event.target.value)} /></label>
        <label className="full">Goal<textarea value={form.goal} onChange={event => update('goal', event.target.value)} /></label>
        <label className="full">Cover image<LocalImageUpload value={form.coverMediaId ? [form.coverMediaId] : []} multiple={false} folder="campaigns" label={form.coverMediaId ? 'Replace cover image' : 'Upload cover image'} onChange={ids => update('coverMediaId', ids[0])} /></label>
        <label className="full">Platforms<div className="cc-camp-platform-checks">{options.map(option => <button type="button" key={option.id} className={form.platforms.includes(option.id) ? 'selected' : ''} onClick={() => togglePlatform(option.id)}>{option.label}</button>)}</div></label>
        <label className="full">Timeline items<div className="cc-camp-timeline-inputs">{form.timelineItems.map((item, index) => <div key={index}><input value={item} placeholder="Milestone" onChange={event => update('timelineItems', form.timelineItems.map((value, i) => i === index ? event.target.value : value))} /><button type="button" onClick={() => update('timelineItems', form.timelineItems.filter((_, i) => i !== index))} aria-label="Remove milestone">×</button></div>)}<button type="button" onClick={() => update('timelineItems', [...form.timelineItems, ''])}>+ Add milestone</button></div></label>
      </div>
      {error && <p className="cc-camp-form-error">{error}</p>}
      <div className="cc-camp-modal-actions"><button type="button" className="cc-camp-secondary" onClick={onClose}>Cancel</button><button className="cc-camp-primary">{initial ? 'Save changes' : 'Add campaign'}</button></div>
    </form>
  </div>;
}

export function CampaignDetail({ campaign, onClose, onEdit }: { campaign: Campaign; onClose: () => void; onEdit: () => void }) {
  const { posts, pipelineItems, deleteCampaign, settings } = useContentCalendarStore();
  const { items, urls } = useStoredMediaAssets();
  const cover = campaign.coverMediaId ? items.find(item => item.id === campaign.coverMediaId) : undefined;
  const linkedPosts = posts.filter(post => post.campaignId === campaign.id);
  const linkedPipeline = pipelineItems.filter(item => item.campaignId === campaign.id);
  const total = linkedPipeline.length + linkedPosts.filter(post => !post.pipelineId).length;
  const complete = linkedPipeline.filter(item => item.stage === 'published').length + linkedPosts.filter(post => !post.pipelineId && post.status === 'Published').length;
  return <div className="cc-camp-modal-overlay" onMouseDown={event => event.target === event.currentTarget && onClose()}>
    <div className="cc-camp-detail-modal" role="dialog" aria-modal="true">
      <div className="cc-camp-modal-head"><div><span className="cc-camp-badge launch">{campaign.badge}</span><h2>{campaign.name}</h2></div><button onClick={onClose} aria-label="Close"><X size={16} /></button></div>
      <div className="cc-camp-detail-meta">{formatContentDate(campaign.startDate, settings.dateFormat)} - {formatContentDate(campaign.endDate, settings.dateFormat)} · {campaign.status}</div>
      {cover && <img className="cc-camp-detail-cover" src={mediaUrl(cover, urls)} alt={cover.description || `${campaign.name} cover`} />}
      <p>{campaign.goal || 'No goal added yet.'}</p>
      <div className="cc-camp-detail-stats"><strong>{complete}/{total}</strong><span>completed content items</span></div>
      <div className="cc-camp-detail-platforms">{campaign.platforms.map(platform => <span key={platform}>{getPlatformConfig(platform).label}</span>)}</div>
      <h3>Timeline</h3><ul>{campaign.timelineItems.length ? campaign.timelineItems.map(item => <li key={item}>{item}</li>) : <li>No milestones added.</li>}</ul>
      <h3>Linked content</h3><div className="cc-camp-linked-list">{[...linkedPipeline.map(item => item.title), ...linkedPosts.filter(post => !post.pipelineId).map(post => post.title)].map((title, index) => <div key={`${title}-${index}`}>{title}</div>)}{!total && <span>No content linked yet.</span>}</div>
      <div className="cc-camp-modal-actions"><button className="cc-camp-secondary" onClick={onEdit}><Pencil size={13} />Edit</button><button className="cc-camp-danger" onClick={() => { if (window.confirm('Delete this campaign and unassign its content?')) { deleteCampaign(campaign.id); onClose(); } }}><Trash2 size={13} />Delete</button></div>
    </div>
  </div>;
}

export default function Campaigns() {
  const { campaigns, pipelineItems } = useContentCalendarStore();
  const [status, setStatus] = useState('all');
  const [platform, setPlatform] = useState('all');
  const [period, setPeriod] = useState('all');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Campaign | undefined>();
  const [showForm, setShowForm] = useState(false);
  const [viewing, setViewing] = useState<Campaign | undefined>();
  const options = getActivePlatformOptions();
  const filtered = campaigns.filter(campaign => {
    const linkedText = pipelineItems.filter(item => item.campaignId === campaign.id).map(item => item.title).join(' ');
    const haystack = `${campaign.name} ${campaign.goal} ${campaign.badge} ${campaign.platforms.join(' ')} ${linkedText}`.toLowerCase();
    if (search && !haystack.includes(search.toLowerCase())) return false;
    if (status !== 'all' && campaign.status !== status) return false;
    if (platform !== 'all' && !campaign.platforms.includes(platform)) return false;
    if (period !== 'all') {
      const now = new Date(); const start = new Date(now); const end = new Date(now);
      if (period === 'month') { start.setDate(1); end.setMonth(end.getMonth() + 1, 0); }
      if (period === '30') start.setDate(start.getDate() - 30);
      if (!(campaign.endDate >= start.toISOString().slice(0, 10) && campaign.startDate <= end.toISOString().slice(0, 10))) return false;
    }
    return true;
  });
  return <><style>{PAGE_CSS}</style><style>{`\n.cc-camp-modal-overlay{position:fixed;inset:0;background:rgba(29,34,35,.32);z-index:1000;display:grid;place-items:center;padding:20px}.cc-camp-modal,.cc-camp-detail-modal{width:min(620px,100%);max-height:90vh;overflow:auto;background:var(--cc-card);border:1px solid var(--cc-border);border-radius:14px;padding:22px;box-shadow:0 18px 60px rgba(48,39,34,.2)}.cc-camp-modal-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}.cc-camp-modal-head h2{font:400 24px 'DM Serif Display',Georgia,serif;margin:6px 0 15px}.cc-camp-modal-head button{border:0;background:transparent;cursor:pointer}.cc-camp-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.cc-camp-form-grid label{display:flex;flex-direction:column;gap:5px;font-size:10px;font-weight:700;color:var(--cc-text-2)}.cc-camp-form-grid .full{grid-column:1/-1}.cc-camp-form-grid input,.cc-camp-form-grid select,.cc-camp-form-grid textarea{border:1px solid var(--cc-border);border-radius:8px;padding:9px;font:inherit;font-weight:400;background:var(--cc-card)}.cc-camp-form-grid textarea{min-height:58px;resize:vertical}.cc-camp-platform-checks{display:flex;gap:7px;flex-wrap:wrap}.cc-camp-platform-checks button{padding:7px 11px;border:1px solid var(--cc-border);border-radius:99px;background:var(--cc-input);cursor:pointer;color:var(--cc-text-2)}.cc-camp-platform-checks button.selected{background:var(--cc-accent-light);border-color:var(--cc-accent);color:var(--cc-accent)}.cc-camp-timeline-inputs{display:flex;flex-direction:column;gap:6px}.cc-camp-timeline-inputs div{display:flex;gap:6px}.cc-camp-timeline-inputs input{flex:1}.cc-camp-timeline-inputs button{border:0;background:transparent;color:var(--cc-accent);cursor:pointer}.cc-camp-form-error{color:#b34e44;font-size:11px}.cc-camp-modal-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:18px}.cc-camp-modal-actions button{display:flex;align-items:center;gap:6px;padding:9px 13px;border-radius:8px;border:1px solid var(--cc-border);cursor:pointer;color:var(--cc-text);background:var(--cc-input)}.cc-camp-primary{background:var(--cc-accent);color:white;border-color:var(--cc-accent)!important}.cc-camp-secondary{background:var(--cc-input)}.cc-camp-danger{background:var(--cc-bg-2);color:var(--cc-text)}.cc-camp-detail-meta{font-size:11px;color:var(--cc-text-3)}.cc-camp-detail-stats{display:flex;align-items:baseline;gap:8px;padding:12px;background:var(--cc-bg-2);border-radius:9px}.cc-camp-detail-stats strong{font:400 28px 'DM Serif Display',Georgia,serif}.cc-camp-detail-stats span{font-size:11px;color:var(--cc-text-3)}.cc-camp-detail-platforms{display:flex;gap:7px;flex-wrap:wrap;margin:12px 0}.cc-camp-detail-platforms span{padding:5px 9px;border-radius:99px;background:var(--cc-bg-3);font-size:10px;color:var(--cc-text-2)}.cc-camp-detail-modal h3{font-size:12px;margin:16px 0 7px}.cc-camp-detail-modal ul{margin:0;padding-left:18px;font-size:11px;color:var(--cc-text-2)}.cc-camp-linked-list{display:flex;flex-direction:column;gap:5px;font-size:11px;color:var(--cc-text-2)}.cc-camp-linked-list div{padding:7px 9px;background:var(--cc-bg-2);border-radius:6px}\n`}</style><div className="cc-camp-page">
    <div className="cc-camp-header"><div><div className="cc-camp-heading-row"><h1 className="cc-camp-heading">Give every post a reason to belong.</h1><Sparkles size={22} className="cc-camp-star" /></div><span className="cc-camp-swoop" /></div><div className="cc-camp-header-right"><div className="cc-camp-meta"><span><CalendarDays size={14} color="#c27b6a" /> {todayKey()}</span><span className="cc-camp-local"><MapPin size={11} /> Local only</span></div><div className="cc-camp-toolbar"><input className="cc-camp-search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search campaigns..." /><select className="cc-camp-select" value={status} onChange={event => setStatus(event.target.value)}><option value="all">All statuses</option>{CAMPAIGN_STATUSES.map(item => <option key={item} value={item}>{item}</option>)}</select><select className="cc-camp-select" value={platform} onChange={event => setPlatform(event.target.value)}><option value="all">All platforms</option>{options.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select><select className="cc-camp-select" value={period} onChange={event => setPeriod(event.target.value)}><option value="all">All time</option><option value="month">This month</option><option value="30">Last 30 days</option></select><button className="cc-camp-add-btn" onClick={() => { setEditing(undefined); setShowForm(true); }}><Plus size={13} />Add campaign</button></div></div></div>
    <div className="cc-camp-body"><div><h2 className="cc-camp-section-title">Campaigns <Sparkles size={16} color="#e6ad3f" /></h2>{filtered.length ? filtered.map(campaign => { const linked = pipelineItems.filter(item => item.campaignId === campaign.id); const complete = linked.filter(item => item.stage === 'published').length; const pct = linked.length ? Math.round(complete / linked.length * 100) : 0; return <div className="cc-camp-card" key={campaign.id}><div className="cc-camp-img-wrap"><div className="cc-camp-img" style={{ background: 'linear-gradient(155deg,#f2e8da,#e4d0b8)' }}><span className="cc-camp-badge launch">{campaign.badge}</span></div></div><div className="cc-camp-content"><div className="cc-camp-top-row"><span className={`cc-camp-badge ${campaign.status === 'active' ? 'launch' : campaign.status === 'completed' ? 'growth' : 'brand'}`}>{campaign.status}</span><div><button className="cc-camp-view-btn" onClick={() => setViewing(campaign)}>View campaign →</button><button className="cc-camp-view-btn" onClick={() => { setEditing(campaign); setShowForm(true); }} aria-label="Edit campaign"><Pencil size={12} /></button></div></div><div className="cc-camp-cols"><div className="cc-camp-col-info"><h3 className="cc-camp-name">{campaign.name}</h3><div className="cc-camp-date-row"><CalendarDays size={12} color="#c27b6a" />{campaign.startDate} – {campaign.endDate}</div><div className="cc-camp-goal-text">{campaign.goal || 'No goal added yet.'}</div></div><div className="cc-camp-col-platforms"><div className="cc-camp-col-label">Platforms</div>{campaign.platforms.map(item => <div className="cc-camp-platform-row" key={item}>{getPlatformConfig(item).label}</div>)}</div><div className="cc-camp-col-posts"><div className="cc-camp-col-label">Published</div><div className="cc-camp-posts-count">{complete}<span className="cc-camp-posts-total">/ {linked.length}</span></div><div className="cc-camp-progress-wrap"><div className="cc-camp-progress-bar" style={{ width: `${pct}%`, background: 'var(--cc-accent)' }} /></div><div className="cc-camp-pct">{pct}%</div></div></div></div></div>; }) : <div className="cc-camp-empty">No campaigns yet. Add your first campaign to organize content.</div>}</div><div><div className="cc-camp-timeline-card"><h2 className="cc-camp-tl-title">Campaign Timeline <Sparkles size={15} color="#e6ad3f" /></h2>{filtered.map(campaign => <div className="cc-camp-tl-item" key={campaign.id}><div className="cc-camp-tl-dot" style={{ background: 'var(--cc-accent)' }} /><div className="cc-camp-tl-body"><div className="cc-camp-tl-top"><span className="cc-camp-tl-name">{campaign.name}</span><span className="cc-camp-tl-count">{campaign.timelineItems.length} milestones</span></div><div className="cc-camp-tl-date">{campaign.startDate} – {campaign.endDate}</div><ul className="cc-camp-tl-items">{campaign.timelineItems.map(item => <li key={item}>{item}</li>)}</ul></div></div>)}{!filtered.length && <div className="cc-camp-empty">Your timeline will appear here.</div>}</div></div></div>
    {showForm && <CampaignForm initial={editing} onClose={() => setShowForm(false)} />}{viewing && <CampaignDetail campaign={campaigns.find(item => item.id === viewing.id) ?? viewing} onClose={() => setViewing(undefined)} onEdit={() => { setEditing(viewing); setViewing(undefined); setShowForm(true); }} />}
  </div></>;
}
