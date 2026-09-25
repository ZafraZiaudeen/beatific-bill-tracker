import { useState } from 'react';
import { CalendarDays, MapPin, Sparkles, Clock, Copy, Pencil, MoreHorizontal, Plus, ChevronDown } from 'lucide-react';

const PAGE_CSS = `
.cc-ht-page{background:radial-gradient(circle at 75% 8%,rgba(255,255,255,.7),transparent 28%),#faf7f2;color:#1f2c31;min-height:100%;padding-bottom:36px}

/* ── Header ── */
.cc-ht-header{display:flex;align-items:flex-start;justify-content:space-between;gap:24px;padding:16px 22px 14px;border-bottom:1px solid #ece4da}
.cc-ht-heading-row{display:flex;align-items:center;gap:9px}
.cc-ht-heading{font-family:'DM Serif Display',Georgia,serif;font-weight:400;font-size:29px;line-height:1;letter-spacing:-.02em;margin:0;color:#202e33;white-space:nowrap}
.cc-ht-swoop{display:block;width:115px;height:11px;margin-top:8px;border-top:3px solid #d97957;border-radius:50%;transform:rotate(-3deg)}
.cc-ht-header-right{flex-shrink:0;display:flex;flex-direction:column;align-items:flex-end;gap:10px}
.cc-ht-meta{display:flex;align-items:center;gap:18px;font-weight:650;font-size:12px}
.cc-ht-date{display:flex;align-items:center;gap:7px;color:#3d2f2f}
.cc-ht-local{display:flex;align-items:center;gap:7px;padding:6px 14px;background:#fae7c5;border-radius:99px;font-size:11px;color:#7a5a2a}

/* ── Toolbar row (full width below header) ── */
.cc-ht-toolbar{display:flex;align-items:center;gap:8px;padding:12px 22px;border-bottom:1px solid #ece4da}
.cc-ht-search{flex:1;height:33px;display:flex;align-items:center;gap:8px;padding:0 13px;background:rgba(255,255,255,.9);border:1px solid #ece6df;border-radius:11px;font-size:11px;color:#909399}
.cc-ht-select-wrap{position:relative;flex-shrink:0}
.cc-ht-select{appearance:none;height:33px;padding:0 28px 0 11px;border:1px solid #ece6df;border-radius:11px;background:rgba(255,255,255,.9);font-size:10.5px;color:#263238;outline:0;cursor:pointer;font-family:inherit;font-weight:500}
.cc-ht-select-wrap>svg{position:absolute;right:9px;top:11px;pointer-events:none;color:#6b5a52}
.cc-ht-plat-btn{height:33px;display:flex;align-items:center;gap:6px;padding:0 13px;background:rgba(255,255,255,.9);border:1px solid #ece6df;border-radius:11px;font-size:11px;font-weight:600;color:#3d2f2f;cursor:pointer;font-family:inherit;white-space:nowrap}
.cc-ht-plat-btn:hover{background:#f5f0ea}

/* ── Body ── */
.cc-ht-body{display:grid;grid-template-columns:1fr 258px;gap:18px;padding:18px 22px 0}

/* ── Set card ── */
.cc-ht-card{display:flex;background:rgba(255,255,255,.88);border:1px solid #ece4da;border-radius:11px;overflow:hidden;margin-bottom:12px;transition:box-shadow .15s}
.cc-ht-card:last-child{margin-bottom:0}
.cc-ht-card:hover{box-shadow:0 5px 18px rgba(60,40,30,.07)}
.cc-ht-icon-block{width:72px;flex-shrink:0;display:flex;align-items:center;justify-content:center}
.cc-ht-card-body{flex:1;padding:14px 16px;min-width:0}
.cc-ht-card-top{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:4px}
.cc-ht-card-title{font-family:'DM Serif Display',Georgia,serif;font-weight:400;font-size:20px;color:#1a2428;margin:0;line-height:1.1}
.cc-ht-card-actions{display:flex;align-items:center;gap:6px;flex-shrink:0}
.cc-ht-action-btn{display:flex;align-items:center;gap:4px;padding:5px 10px;background:rgba(255,255,255,.9);border:1px solid #ece4da;border-radius:8px;font-size:10.5px;font-weight:600;color:#4a3a35;cursor:pointer;font-family:inherit;white-space:nowrap}
.cc-ht-action-btn:hover{background:#f5ede5}
.cc-ht-more-btn{display:flex;align-items:center;justify-content:center;width:28px;height:28px;background:transparent;border:none;color:#9a8a82;cursor:pointer;border-radius:6px}
.cc-ht-more-btn:hover{background:#f0e8e0}
.cc-ht-card-desc{font-size:11px;color:#7a6a62;margin-bottom:9px;line-height:1.4}
.cc-ht-pills{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px}
.cc-ht-pill{padding:3px 10px;border-radius:99px;font-size:10px;font-weight:600;background:#f0e8e0;color:#5a4a42;white-space:nowrap}
.cc-ht-pill-more{padding:3px 10px;border-radius:99px;font-size:10px;font-weight:600;background:#fce3dc;color:#c05d45}
.cc-ht-card-bottom{display:flex;align-items:center;gap:8px;font-size:10.5px;color:#6b5a52;font-weight:500}
.cc-ht-uses{display:flex;align-items:center;gap:5px}
.cc-ht-sep{color:#d0c4b8;font-size:14px;line-height:1}
.cc-ht-color-pill{padding:3px 10px;border-radius:99px;font-size:9.5px;font-weight:700}

/* ── Right sidebar ── */
.cc-ht-create-card{background:rgba(255,255,255,.88);border:1px solid #ece4da;border-radius:12px;padding:18px 16px 16px;position:relative;overflow:hidden;margin-bottom:14px}
.cc-ht-create-sparkles{position:absolute;top:12px;right:12px;color:#e6ad3f;opacity:.8}
.cc-ht-create-icon{width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#f5d0c2,#ebb09a);display:flex;align-items:center;justify-content:center;margin-bottom:12px}
.cc-ht-create-title{font-family:'DM Serif Display',Georgia,serif;font-weight:400;font-size:18px;color:#1a2428;margin:0 0 6px;line-height:1.2}
.cc-ht-create-desc{font-size:11px;color:#7a6a62;line-height:1.45;margin-bottom:14px}
.cc-ht-create-btn{width:100%;height:36px;display:flex;align-items:center;justify-content:center;gap:6px;border-radius:20px;background:linear-gradient(90deg,#d96d49,#dc815f);color:#fff;font-size:11.5px;font-weight:700;border:none;cursor:pointer;font-family:inherit;margin-bottom:12px;box-shadow:0 4px 10px rgba(201,99,65,.18)}
.cc-ht-platform-label{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:#9a8a82;margin-bottom:5px}
.cc-ht-platform-select-wrap{position:relative}
.cc-ht-platform-select{appearance:none;width:100%;height:32px;padding:0 28px 0 11px;border:1px solid #ece4da;border-radius:9px;background:white;font-size:11px;color:#3d2f2f;outline:0;cursor:pointer;font-family:inherit}
.cc-ht-platform-select-wrap>svg{position:absolute;right:9px;top:10px;pointer-events:none;color:#9a8a82}

/* Recently used */
.cc-ht-recent{background:rgba(255,255,255,.88);border:1px solid #ece4da;border-radius:12px;padding:14px 16px}
.cc-ht-recent-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.cc-ht-recent-title{display:flex;align-items:center;gap:6px;font-size:13px;font-weight:700;color:#1a2428}
.cc-ht-view-all{font-size:10.5px;font-weight:700;color:#d97856;background:none;border:none;cursor:pointer;padding:0;font-family:inherit}
.cc-ht-recent-row{display:flex;align-items:center;gap:0;padding:7px 0;border-bottom:1px solid #f0e8e0}
.cc-ht-recent-row:last-child{border-bottom:none;padding-bottom:0}
.cc-ht-recent-tag{flex:1;min-width:0}
.cc-ht-tag-pill{display:inline-block;padding:3px 9px;border-radius:99px;font-size:10px;font-weight:700}
.cc-ht-recent-count{font-size:11px;font-weight:600;color:#6b5a52;min-width:36px;text-align:right;margin-right:10px}
.cc-ht-recent-icon{color:#e44637;flex-shrink:0}

/* ── Bottom tip ── */
.cc-ht-tip{display:flex;align-items:flex-start;gap:9px;padding:18px 22px 0;font-size:11.5px;color:#9a8a82;font-style:italic;line-height:1.5}
.cc-ht-tip-wrap{display:flex;flex-direction:column;gap:0}
.cc-ht-tip-swoop{display:block;width:80px;height:8px;margin-top:6px;border-top:2px solid #d97957;border-radius:50%;transform:rotate(-2deg);opacity:.6}

/* Platform icon colors */
.cc-ht-ig{color:#e44637}
.cc-ht-tt{color:#1a1a2e}
.cc-ht-yt{color:#c0302e}
`;

const HASHTAG_SETS = [
  {
    id: 'brand',
    title: 'Brand & Lifestyle',
    desc: 'Show your everyday, your brand, and what inspires your audience.',
    tags: ['#brandlove', '#lifestyle', '#everydaymagic', '#creativepreneur', '#smallbusiness'],
    extra: 3,
    uses: '1.2K',
    colorName: 'Peach',
    colorBg: '#fce3dc',
    colorText: '#c05d45',
    iconBg: '#f5e8e0',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#c27b6a" strokeWidth="1.8">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    id: 'travel',
    title: 'Travel & Experiences',
    desc: 'Capture the places, moments and adventures that matter.',
    tags: ['#travel', '#wanderlust', '#travelgram', '#exploremore', '#bucketlist'],
    extra: 4,
    uses: '2.8K',
    colorName: 'Blue',
    colorBg: '#ddeaf3',
    colorText: '#3a6f92',
    iconBg: '#e8f0f5',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#56819a" strokeWidth="1.8">
        <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
      </svg>
    ),
  },
  {
    id: 'wellness',
    title: 'Wellness & Mindset',
    desc: 'Inspire a healthier, happier and more intentional life.',
    tags: ['#wellness', '#mindset', '#selfcare', '#goodvibes', '#mentalhealth'],
    extra: 5,
    uses: '1.9K',
    colorName: 'Yellow',
    colorBg: '#fef3c0',
    colorText: '#a07a00',
    iconBg: '#fdf3d5',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#c8a000" strokeWidth="1.8">
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>
    ),
  },
  {
    id: 'product',
    title: 'Product & Launch',
    desc: 'Showcase what you create, launch and love.',
    tags: ['#newlaunch', '#productdrop', '#behindthescenes', '#madebyus', '#shopnow'],
    extra: 2,
    uses: '953',
    colorName: 'Terracotta',
    colorBg: '#f0e2d5',
    colorText: '#8a5a3a',
    iconBg: '#f0e2d5',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#a06040" strokeWidth="1.8">
        <path d="M12 22c0 0-8-5-8-12A8 8 0 0 1 12 2a8 8 0 0 1 8 8c0 7-8 12-8 12z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    ),
  },
];

const RECENTLY_USED = [
  { tag: '#smallbusiness', count: '1.2K', platform: 'ig', bg: '#fce8e3', color: '#c05d45' },
  { tag: '#travelgram',   count: '2.3K', platform: 'ig', bg: '#fce8e3', color: '#c05d45' },
  { tag: '#selfcare',     count: '1.8K', platform: 'tt', bg: '#ececed', color: '#555' },
  { tag: '#newlaunch',    count: '942',  platform: 'ig', bg: '#fce8e3', color: '#c05d45' },
  { tag: '#goodvibes',    count: '1.6K', platform: 'tt', bg: '#ececed', color: '#555' },
  { tag: '#wanderlust',   count: '3.1K', platform: 'ig', bg: '#fce8e3', color: '#c05d45' },
];

function IgIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <rect x="3" y="3" width="18" height="18" rx="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  );
}

function TtIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size + 1} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.79 1.54V6.79a4.85 4.85 0 0 1-1.02-.1z"/>
    </svg>
  );
}

export default function Hashtags() {
  const [platformFilter, setPlatformFilter] = useState('All platforms');
  const [setsFilter, setSetsFilter] = useState('All sets');

  return (
    <>
      <style>{PAGE_CSS}</style>
      <div className="cc-ht-page">

        {/* ── Header ── */}
        <div className="cc-ht-header">
          <div>
            <div className="cc-ht-heading-row">
              <h1 className="cc-ht-heading">Find your next reach.</h1>
              <Sparkles size={22} style={{ color: '#e6ad3f', transform: 'rotate(-10deg)', flexShrink: 0 }} />
            </div>
            <span className="cc-ht-swoop" />
          </div>
          <div className="cc-ht-header-right">
            <div className="cc-ht-meta">
              <span className="cc-ht-date">
                <CalendarDays size={14} color="#c27b6a" />
                Apr 21 – Apr 27, 2025
              </span>
              <span className="cc-ht-local">
                <MapPin size={11} />
                Local only
              </span>
            </div>
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div className="cc-ht-toolbar">
          <div className="cc-ht-search">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Search hashtag sets or individual hashtags...
          </div>
          <div className="cc-ht-select-wrap">
            <select className="cc-ht-select" value={platformFilter} onChange={e => setPlatformFilter(e.target.value)}>
              <option>All platforms</option><option>Instagram</option><option>TikTok</option><option>YouTube</option>
            </select>
            <ChevronDown size={10} />
          </div>
          <button className="cc-ht-plat-btn">
            <span className="cc-ht-ig"><IgIcon /></span> Instagram
          </button>
          <button className="cc-ht-plat-btn">
            <span className="cc-ht-tt"><TtIcon /></span> TikTok
          </button>
          <button className="cc-ht-plat-btn">
            <span className="cc-ht-yt">
              <svg width="14" height="11" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
                <path d="m9.75 15.02 5.75-3.02-5.75-3.02z" fill="white"/>
              </svg>
            </span>
            YouTube
          </button>
          <div className="cc-ht-select-wrap">
            <select className="cc-ht-select" value={setsFilter} onChange={e => setSetsFilter(e.target.value)}>
              <option>All sets</option><option>My sets</option><option>Shared</option>
            </select>
            <ChevronDown size={10} />
          </div>
        </div>

        {/* ── Body ── */}
        <div className="cc-ht-body">

          {/* Left: set cards */}
          <div>
            {HASHTAG_SETS.map(set => (
              <div key={set.id} className="cc-ht-card">
                {/* Icon block */}
                <div className="cc-ht-icon-block" style={{ background: set.iconBg }}>
                  {set.icon}
                </div>

                {/* Card content */}
                <div className="cc-ht-card-body">
                  <div className="cc-ht-card-top">
                    <h3 className="cc-ht-card-title">{set.title}</h3>
                    <div className="cc-ht-card-actions">
                      <button className="cc-ht-action-btn">
                        <Copy size={11} /> Copy set
                      </button>
                      <button className="cc-ht-action-btn">
                        <Pencil size={11} /> Edit
                      </button>
                      <button className="cc-ht-more-btn">
                        <MoreHorizontal size={15} />
                      </button>
                    </div>
                  </div>
                  <div className="cc-ht-card-desc">{set.desc}</div>
                  <div className="cc-ht-pills">
                    {set.tags.map(t => (
                      <span key={t} className="cc-ht-pill">{t}</span>
                    ))}
                    <span className="cc-ht-pill-more">+{set.extra} more</span>
                  </div>
                  <div className="cc-ht-card-bottom">
                    <span className="cc-ht-uses">
                      <span className="cc-ht-ig"><IgIcon size={12} /></span>
                      {set.uses} uses
                    </span>
                    <span className="cc-ht-sep">•</span>
                    <span
                      className="cc-ht-color-pill"
                      style={{ background: set.colorBg, color: set.colorText }}
                    >
                      {set.colorName}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right sidebar */}
          <div>
            {/* Create card */}
            <div className="cc-ht-create-card">
              <div className="cc-ht-create-sparkles">
                <Sparkles size={20} />
              </div>
              <div className="cc-ht-create-icon">
                <Plus size={22} color="#fff" strokeWidth={2.5} />
              </div>
              <h3 className="cc-ht-create-title">Create hashtag set</h3>
              <p className="cc-ht-create-desc">
                Build a new set of hashtags for your next campaign or content theme.
              </p>
              <button className="cc-ht-create-btn">
                <Plus size={13} strokeWidth={2.5} />
                Create set
              </button>
              <div className="cc-ht-platform-label">Platform</div>
              <div className="cc-ht-platform-select-wrap">
                <select className="cc-ht-platform-select">
                  <option>All platforms</option>
                  <option>Instagram</option>
                  <option>TikTok</option>
                  <option>YouTube</option>
                </select>
                <ChevronDown size={11} />
              </div>
            </div>

            {/* Recently used */}
            <div className="cc-ht-recent">
              <div className="cc-ht-recent-hdr">
                <span className="cc-ht-recent-title">
                  <Clock size={14} color="#9a8a82" />
                  Recently used
                </span>
                <button className="cc-ht-view-all">View all →</button>
              </div>
              {RECENTLY_USED.map(r => (
                <div key={r.tag} className="cc-ht-recent-row">
                  <div className="cc-ht-recent-tag">
                    <span
                      className="cc-ht-tag-pill"
                      style={{ background: r.bg, color: r.color }}
                    >
                      {r.tag}
                    </span>
                  </div>
                  <span className="cc-ht-recent-count">{r.count}</span>
                  <span className={r.platform === 'ig' ? 'cc-ht-ig cc-ht-recent-icon' : 'cc-ht-tt cc-ht-recent-icon'}>
                    {r.platform === 'ig' ? <IgIcon /> : <TtIcon />}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom tip ── */}
        <div className="cc-ht-tip">
          <Sparkles size={15} color="#e6ad3f" style={{ flexShrink: 0, marginTop: 1 }} />
          <div className="cc-ht-tip-wrap">
            <span>Keep your hashtag sets relevant. Refresh them regularly with trending or seasonal tags to get the best reach.</span>
            <span className="cc-ht-tip-swoop" />
          </div>
        </div>

      </div>
    </>
  );
}
