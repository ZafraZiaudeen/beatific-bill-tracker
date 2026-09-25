import { useState } from 'react';
import { CalendarDays, MapPin, Sparkles, Plus } from 'lucide-react';

const PAGE_CSS = `
.cc-camp-page{background:radial-gradient(circle at 76% 10%,rgba(255,255,255,.7),transparent 26%),#faf7f2;color:#1f2c31;min-height:100%;padding-bottom:32px}

/* Header */
.cc-camp-header{display:flex;align-items:flex-start;justify-content:space-between;gap:24px;padding:16px 22px 12px}
.cc-camp-heading-row{display:flex;align-items:center;gap:9px}
.cc-camp-heading{font-family:'DM Serif Display',Georgia,serif;font-weight:400;font-size:28px;line-height:1;letter-spacing:-.02em;margin:0;color:#202e33;white-space:nowrap}
.cc-camp-star{color:#e6ad3f;transform:rotate(-10deg);flex-shrink:0}
.cc-camp-swoop{display:block;width:130px;height:11px;margin-top:8px;border-top:3px solid #d97957;border-radius:50%;transform:rotate(-3deg)}
.cc-camp-header-right{flex-shrink:0;display:flex;flex-direction:column;align-items:flex-end;gap:10px}
.cc-camp-meta{display:flex;align-items:center;gap:18px;font-weight:650;font-size:12px}
.cc-camp-date{display:flex;align-items:center;gap:7px;color:#3d2f2f}
.cc-camp-local{display:flex;align-items:center;gap:7px;padding:6px 14px;background:#fae7c5;border-radius:99px;font-size:11px;color:#7a5a2a}
.cc-camp-toolbar{display:flex;align-items:center;gap:7px}
.cc-camp-search{height:31px;min-width:220px;display:flex;align-items:center;gap:8px;padding:0 11px;background:rgba(255,255,255,.82);border:1px solid #ece6df;border-radius:11px;font-size:10.5px;color:#909399}
.cc-camp-select-wrap{position:relative}
.cc-camp-select{appearance:none;height:31px;padding:0 26px 0 11px;border:1px solid #ece6df;border-radius:11px;background:rgba(255,255,255,.82);font-size:10.5px;color:#263238;outline:0;cursor:pointer;font-family:inherit}
.cc-camp-select-wrap svg{position:absolute;right:8px;top:10px;pointer-events:none;color:#6b5a52}
.cc-camp-add-btn{height:32px;display:flex;align-items:center;gap:6px;padding:0 16px;border-radius:18px;background:linear-gradient(90deg,#d96d49,#dc815f);color:#fff;font-size:11px;font-weight:700;border:none;cursor:pointer;white-space:nowrap;box-shadow:0 4px 10px rgba(201,99,65,.18);font-family:inherit}

/* Body layout */
.cc-camp-body{display:grid;grid-template-columns:minmax(0,1fr) 270px;gap:16px;padding:4px 22px 0}

/* Section header */
.cc-camp-section-title{font-family:'DM Serif Display',Georgia,serif;font-weight:400;font-size:19px;color:#202e33;margin:0 0 14px;display:flex;align-items:center;gap:8px}

/* ── Campaign card ── */
.cc-camp-card{display:flex;flex-direction:row;min-width:0;background:rgba(255,255,255,.88);border:1px solid #ece4da;border-radius:12px;overflow:hidden;margin-bottom:12px;transition:box-shadow .15s}
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
.cc-camp-badge{display:inline-block;padding:3px 9px;border-radius:99px;font-size:9px;font-weight:800;letter-spacing:.07em;text-transform:uppercase}
.cc-camp-badge.launch{background:#fce3dc;color:#c05d45}
.cc-camp-badge.growth{background:#ddeaf3;color:#3a6f92}
.cc-camp-badge.brand{background:#ede0ce;color:#7a5a35}
.cc-camp-view-btn{font-size:10.5px;font-weight:700;color:#d97856;background:none;border:none;cursor:pointer;padding:0;white-space:nowrap;font-family:inherit}

/* 3-column body row */
.cc-camp-cols{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0;flex:1;align-items:start;min-width:0}

/* Col 1: info */
.cc-camp-col-info{min-width:0;padding-right:12px}
.cc-camp-name{font-family:'DM Serif Display',Georgia,serif;font-weight:400;font-size:22px;color:#1a2428;margin:0 0 5px;line-height:1.1}
.cc-camp-date-row{display:flex;align-items:center;gap:5px;font-size:11px;color:#6b5a52;font-weight:500;margin-bottom:6px}
.cc-camp-goal-label{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:#9a8a82;margin-bottom:3px;display:flex;align-items:center;gap:5px}
.cc-camp-goal-text{font-size:11px;color:#4a3a35;line-height:1.45}

/* Col 2: platforms */
.cc-camp-col-platforms{min-width:0;padding:0 12px;border-left:1px solid #f0e8e0}
.cc-camp-col-label{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:#9a8a82;margin-bottom:7px}
.cc-camp-platform-row{display:flex;align-items:center;gap:7px;font-size:10.5px;color:#4a3a35;font-weight:500;margin-bottom:5px}
.cc-camp-platform-row:last-child{margin-bottom:0}

/* Col 3: posts */
.cc-camp-col-posts{min-width:0;border-left:1px solid #f0e8e0;padding-left:12px}
.cc-camp-posts-count{font-family:'DM Serif Display',Georgia,serif;font-size:28px;color:#1a2428;line-height:1;display:flex;align-items:baseline;gap:3px;margin-bottom:6px}
.cc-camp-posts-total{font-size:15px;color:#9a8a82;font-family:'Nunito',sans-serif}
.cc-camp-progress-wrap{width:100%;height:5px;background:#ece4da;border-radius:99px;overflow:hidden;margin-bottom:4px}
.cc-camp-progress-bar{height:100%;border-radius:99px}
.cc-camp-pct{font-size:10px;color:#9a8a82;font-weight:600}

/* Platform icon colors */
.cc-camp-ig{color:#e44637}
.cc-camp-tt{color:#1a1a2e}
.cc-camp-yt{color:#c0302e}
.cc-camp-pin{color:#c8253a}
.cc-camp-em{color:#5a7a9a}
.cc-camp-blog{color:#7a6a9a}

/* ── Timeline sidebar ── */
.cc-camp-timeline-card{background:rgba(255,255,255,.82);border:1px solid #ece4da;border-radius:12px;padding:15px 16px 14px}
.cc-camp-tl-title{font-family:'DM Serif Display',Georgia,serif;font-weight:400;font-size:17px;color:#202e33;margin:0 0 14px;display:flex;align-items:center;gap:8px}
.cc-camp-tl-list{display:flex;flex-direction:column;gap:0;position:relative}
.cc-camp-tl-list::before{content:'';position:absolute;left:7px;top:8px;bottom:8px;width:1.5px;background:#ece4da;z-index:0}
.cc-camp-tl-item{display:flex;gap:11px;padding-bottom:18px;position:relative;z-index:1}
.cc-camp-tl-item:last-child{padding-bottom:0}
.cc-camp-tl-dot{width:15px;height:15px;border-radius:50%;flex-shrink:0;margin-top:3px}
.cc-camp-tl-body{flex:1;min-width:0}
.cc-camp-tl-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:3px}
.cc-camp-tl-name{font-size:12.5px;font-weight:700;color:#1a2428}
.cc-camp-tl-count{font-size:10px;color:#9a8a82;font-weight:600}
.cc-camp-tl-badge{display:inline-block;padding:2px 7px;border-radius:99px;font-size:8px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;margin-bottom:3px}
.cc-camp-tl-date{font-size:10px;color:#7a6a62;margin-bottom:5px}
.cc-camp-tl-items{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:2px}
.cc-camp-tl-items li{font-size:10px;color:#6b5a52;display:flex;align-items:center;gap:4px}
.cc-camp-tl-items li::before{content:'•';color:#c0a898;font-size:12px;line-height:1}
.cc-camp-handwriting{font-family:'Caveat',cursive;font-size:18px;color:#c07050;line-height:1.3;text-align:center;margin:16px 0 14px;display:flex;flex-direction:column;align-items:center;gap:1px}
.cc-camp-handwriting-star{color:#e6ad3f;margin-left:3px;font-family:sans-serif;font-size:14px}
.cc-camp-add-campaign-btn{width:100%;display:flex;align-items:center;justify-content:center;gap:6px;padding:9px;border:1.5px dashed #d0c4b8;border-radius:9px;background:transparent;color:#9a8a82;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;transition:background .12s,color .12s}
.cc-camp-add-campaign-btn:hover{background:#f5ede5;color:#6b5a52}

@media (max-width: 1080px){
  .cc-camp-body{grid-template-columns:minmax(0,1fr)}
  .cc-camp-timeline-card{margin-top:16px}
}

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

export default function Campaigns() {
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
              <span className="cc-camp-date">
                <CalendarDays size={14} color="#c27b6a" />
                Apr 21 – Apr 27, 2025
              </span>
              <span className="cc-camp-local">
                <MapPin size={11} />
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
