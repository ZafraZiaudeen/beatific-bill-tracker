import { useState } from 'react';
import { CalendarDays, MapPin, Sparkles, Plus, TrendingUp, Lightbulb, ChevronDown } from 'lucide-react';

const PAGE_CSS = `
.cc-an-page{background:radial-gradient(circle at 75% 8%,rgba(255,255,255,.7),transparent 28%),#faf7f2;color:#1f2c31;min-height:100%;padding-bottom:32px}

/* ── Header ── */
.cc-an-header{display:flex;align-items:flex-start;justify-content:space-between;gap:24px;padding:16px 22px 14px;border-bottom:1px solid #ece4da}
.cc-an-heading-row{display:flex;align-items:center;gap:9px}
.cc-an-heading{font-family:'DM Serif Display',Georgia,serif;font-weight:400;font-size:29px;line-height:1;letter-spacing:-.02em;margin:0;color:#202e33;white-space:nowrap}
.cc-an-swoop{display:block;width:115px;height:11px;margin-top:8px;border-top:3px solid #d97957;border-radius:50%;transform:rotate(-3deg)}
.cc-an-header-right{flex-shrink:0;display:flex;flex-direction:column;align-items:flex-end;gap:10px}
.cc-an-meta{display:flex;align-items:center;gap:18px;font-weight:650;font-size:12px}
.cc-an-date{display:flex;align-items:center;gap:7px;color:#3d2f2f}
.cc-an-local{display:flex;align-items:center;gap:7px;padding:6px 14px;background:#fae7c5;border-radius:99px;font-size:11px;color:#7a5a2a}

/* ── Toolbar ── */
.cc-an-toolbar{display:flex;align-items:center;gap:8px;padding:10px 22px 12px;border-bottom:1px solid #ece4da;justify-content:flex-end}
.cc-an-search{height:31px;min-width:220px;display:flex;align-items:center;gap:8px;padding:0 11px;background:rgba(255,255,255,.82);border:1px solid #ece6df;border-radius:11px;font-size:10.5px;color:#909399}
.cc-an-select-wrap{position:relative}
.cc-an-select{appearance:none;height:31px;padding:0 26px 0 11px;border:1px solid #ece6df;border-radius:11px;background:rgba(255,255,255,.82);font-size:10.5px;color:#263238;outline:0;cursor:pointer;font-family:inherit}
.cc-an-select-wrap>svg{position:absolute;right:8px;top:10px;pointer-events:none;color:#6b5a52}
.cc-an-create-btn{height:32px;display:flex;align-items:center;gap:6px;padding:0 16px;border-radius:18px;background:linear-gradient(90deg,#d96d49,#dc815f);color:#fff;font-size:11px;font-weight:700;border:none;cursor:pointer;white-space:nowrap;box-shadow:0 4px 10px rgba(201,99,65,.18);font-family:inherit}

/* ── Stat cards ── */
.cc-an-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;padding:16px 22px 0}
.cc-an-stat{background:rgba(255,255,255,.88);border:1px solid #ece4da;border-radius:11px;padding:14px 16px;display:flex;gap:13px;align-items:flex-start}
.cc-an-stat-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.cc-an-stat-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#9a8a82;margin-bottom:4px}
.cc-an-stat-value{font-family:'DM Serif Display',Georgia,serif;font-size:28px;font-weight:400;color:#1a2428;line-height:1;margin-bottom:3px}
.cc-an-stat-sub{font-size:10px;color:#9a8a82;line-height:1.3}
.cc-an-stat-value.reels{font-size:22px;padding-top:3px}

/* ── Body ── */
.cc-an-body{display:grid;grid-template-columns:1fr 258px;gap:16px;padding:16px 22px 0;align-items:start}
.cc-an-main{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.cc-an-card{background:rgba(255,255,255,.88);border:1px solid #ece4da;border-radius:11px;padding:16px}
.cc-an-card-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
.cc-an-card-title{font-family:'DM Serif Display',Georgia,serif;font-weight:400;font-size:16px;color:#1a2428;margin:0;display:flex;align-items:center;gap:7px}
.cc-an-details-btn{font-size:10.5px;font-weight:700;color:#d97856;background:none;border:none;cursor:pointer;padding:0;font-family:inherit;white-space:nowrap}

/* Donut chart */
.cc-an-donut-wrap{display:flex;align-items:center;gap:18px}
.cc-an-legend{display:flex;flex-direction:column;gap:12px;flex:1}
.cc-an-legend-row{display:flex;align-items:center;gap:10px;font-size:12.5px;color:#4a3a35}
.cc-an-legend-dot{width:12px;height:12px;border-radius:50%;flex-shrink:0}
.cc-an-legend-label{flex:1;font-size:13px}
.cc-an-legend-count{font-weight:700;min-width:18px;text-align:right;color:#1a2428;font-size:13px}
.cc-an-legend-pct{color:#9a8a82;min-width:36px;text-align:right;font-size:12px}

/* Bar chart */
.cc-an-bar-chart{width:100%}
.cc-an-bar-area{position:relative;height:120px;border-left:1px solid #ece4da;border-bottom:1px solid #ece4da;display:flex;align-items:flex-end;gap:0;padding-bottom:0}
.cc-an-y-labels{position:absolute;left:-24px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:space-between;font-size:9px;color:#9a8a82;text-align:right;padding:2px 0}
.cc-an-bar-group{flex:1;display:flex;flex-direction:column;align-items:center;gap:0}
.cc-an-bars{display:flex;gap:2px;align-items:flex-end;height:118px}
.cc-an-bar{border-radius:3px 3px 0 0;min-width:10px}
.cc-an-bar-label{font-size:8.5px;color:#9a8a82;text-align:center;margin-top:5px;line-height:1.3}

/* Top content table */
.cc-an-table{width:100%;border-collapse:collapse}
.cc-an-table-hdr{display:grid;grid-template-columns:1fr 60px 90px;gap:8px;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:#9a8a82;margin-bottom:8px;padding:0 2px}
.cc-an-table-row{display:grid;grid-template-columns:1fr 60px 90px;gap:8px;align-items:center;padding:8px 2px;border-top:1px solid #f0e8e0}
.cc-an-table-row:first-child{border-top:none}
.cc-an-post-info{display:flex;align-items:center;gap:9px;min-width:0}
.cc-an-post-thumb{width:36px;height:36px;border-radius:6px;flex-shrink:0}
.cc-an-post-title{font-size:11px;font-weight:600;color:#1a2428;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cc-an-post-meta{font-size:9.5px;color:#9a8a82}
.cc-an-type-pill{display:inline-block;padding:2px 8px;border-radius:99px;font-size:9px;font-weight:800;letter-spacing:.04em;white-space:nowrap}
.cc-an-rate-col{display:flex;flex-direction:column;align-items:flex-end;gap:2px}
.cc-an-rate{font-size:11px;font-weight:700;color:#1a2428}
.cc-an-delta{font-size:9.5px;color:#56a48a;font-weight:600}

/* Platform bar chart */
.cc-an-plat-chart{width:100%}
.cc-an-plat-bars{display:flex;align-items:flex-end;gap:14px;height:100px;margin-bottom:6px}
.cc-an-plat-col{display:flex;flex-direction:column;align-items:center;gap:4px;flex:1}
.cc-an-plat-pct{font-size:10.5px;font-weight:700;color:#1a2428}
.cc-an-plat-bar{width:100%;border-radius:5px 5px 0 0;min-height:4px}
.cc-an-plat-icon{margin-top:6px;font-size:11px;font-weight:600;color:#6b5a52}
.cc-an-plat-name{font-size:9.5px;color:#9a8a82;text-align:center}

/* ── Key Insights sidebar ── */
.cc-an-insights{background:rgba(255,255,255,.88);border:1px solid #ece4da;border-radius:12px;padding:15px 16px}
.cc-an-insights-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
.cc-an-insights-title{font-family:'DM Serif Display',Georgia,serif;font-weight:400;font-size:17px;color:#1a2428;margin:0;display:flex;align-items:center;gap:7px}
.cc-an-insight-card{margin-bottom:14px}
.cc-an-insight-card:last-child{margin-bottom:0}
.cc-an-insight-row{display:flex;align-items:flex-start;gap:10px}
.cc-an-insight-icon{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}
.cc-an-insight-body{flex:1;min-width:0}
.cc-an-insight-title{font-size:12px;font-weight:700;color:#1a2428;margin-bottom:4px}
.cc-an-insight-text{font-size:10.5px;color:#7a6a62;line-height:1.45}
.cc-an-insight-line{width:28px;height:0;border-top:2px solid #ece4da;border-radius:50%;margin-top:8px;transform:rotate(-2deg)}
`;

/* ── SVG Donut Chart ── */
function DonutChart() {
  const cx = 100, cy = 100, r = 80, stroke = 28;
  const circumference = 2 * Math.PI * r;
  const slices = [
    { pct: 43, color: '#d97856', label: 'Reels',        count: 6 },
    { pct: 21, color: '#9e6080', label: 'Carousels',    count: 3 },
    { pct: 21, color: '#7a9db5', label: 'Stories',      count: 3 },
    { pct: 14, color: '#d4a843', label: 'Static posts', count: 2 },
  ];

  let cumPct = 0;
  const labelPos = slices.map(s => {
    const mid = cumPct + s.pct / 2;
    const angle = (mid / 100) * 2 * Math.PI - Math.PI / 2;
    cumPct += s.pct;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });

  let offset = 0;
  return (
    <div className="cc-an-donut-wrap">
      <svg width="200" height="200" viewBox="0 0 200 200" style={{ flexShrink: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f0e8e0" strokeWidth={stroke}/>
        {slices.map((s, i) => {
          const dash = (s.pct / 100) * circumference;
          const gap = circumference - dash;
          const el = (
            <circle
              key={i} cx={cx} cy={cy} r={r}
              fill="none" stroke={s.color} strokeWidth={stroke}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset * circumference / 100}
              transform={`rotate(-90 ${cx} ${cy})`}
              strokeLinecap="butt"
            />
          );
          offset += s.pct;
          return el;
        })}
        <text x={cx} y={cy-8} textAnchor="middle" fontSize="28" fontFamily="'DM Serif Display',Georgia,serif" fill="#1a2428">14</text>
        <text x={cx} y={cy+13} textAnchor="middle" fontSize="10.5" fill="#9a8a82">posts</text>
        {slices.map((s, i) => (
          <text key={i} x={labelPos[i].x} y={labelPos[i].y+3.5} textAnchor="middle" fontSize="9.5" fontWeight="700" fill="rgba(255,255,255,0.92)">
            {s.pct}%
          </text>
        ))}
      </svg>
      <div className="cc-an-legend">
        {slices.map(s => (
          <div key={s.label} className="cc-an-legend-row">
            <div className="cc-an-legend-dot" style={{ background: s.color }}/>
            <span className="cc-an-legend-label">{s.label}</span>
            <span className="cc-an-legend-count">{s.count}</span>
            <span className="cc-an-legend-pct">{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConsistencyChart() {
  const VW = 310, VH = 155;
  const padL = 26, padB = 38, padT = 8, padR = 4;
  const chartW = VW - padL - padR;
  const chartH = VH - padB - padT;
  const scl = chartH / 8;
  const baseY = padT + chartH;

  const days = [
    { day: 'Mon', date: 'Apr 21', bottom: 3.8, cap: 0.6 },
    { day: 'Tue', date: 'Apr 22', bottom: 2.8, cap: 0.5 },
    { day: 'Wed', date: 'Apr 23', bottom: 5.8, cap: 0.9 },
    { day: 'Thu', date: 'Apr 24', bottom: 2.6, cap: 0.5 },
    { day: 'Fri', date: 'Apr 25', bottom: 3.6, cap: 0.6 },
    { day: 'Sat', date: 'Apr 26', bottom: 5.6, cap: 0.8 },
    { day: 'Sun', date: 'Apr 27', bottom: 2.4, cap: 0.5 },
  ];
  const colW = chartW / days.length;
  const barW = Math.floor(colW * 0.78);
  const barOff = (colW - barW) / 2;
  const R = 3;

  return (
    <svg width="100%" viewBox={`0 0 ${VW} ${VH}`} style={{ display: 'block' }}>
      <defs>
        {days.map((d, i) => {
          const totalH = (d.bottom + d.cap) * scl;
          const x = padL + i * colW + barOff;
          const topY = baseY - totalH;
          return (
            <clipPath key={i} id={`ccp${i}`}>
              <path d={`M${x+R},${topY} H${x+barW-R} Q${x+barW},${topY} ${x+barW},${topY+R} V${baseY} H${x} V${topY+R} Q${x},${topY} ${x+R},${topY}Z`}/>
            </clipPath>
          );
        })}
      </defs>

      {[0,2,4,6,8].map(v => {
        const y = baseY - v * scl;
        return (
          <g key={v}>
            <text x={padL-4} y={y+3.5} fontSize="9" fill="#9a8a82" textAnchor="end">{v}</text>
            <line x1={padL} y1={y} x2={VW-padR} y2={y} stroke="#f0e8e0" strokeWidth="1"/>
          </g>
        );
      })}

      {days.map((d, i) => {
        const x = padL + i * colW + barOff;
        const totalH = (d.bottom + d.cap) * scl;
        const capH = d.cap * scl;
        const topY = baseY - totalH;
        return (
          <g key={i} clipPath={`url(#ccp${i})`}>
            <rect x={x} y={topY} width={barW} height={totalH} fill="#b89090"/>
            <rect x={x} y={topY} width={barW} height={capH} fill="#ddc090"/>
          </g>
        );
      })}

      {days.map((d, i) => {
        const cx = padL + i * colW + colW / 2;
        return (
          <g key={i}>
            <text x={cx} y={baseY+13} fontSize="8.5" fill="#9a8a82" textAnchor="middle">{d.day}</text>
            <text x={cx} y={baseY+24} fontSize="8" fill="#b0a098" textAnchor="middle">{d.date}</text>
          </g>
        );
      })}

      <line x1={padL} y1={padT} x2={padL} y2={baseY} stroke="#ece4da" strokeWidth="1"/>
      <line x1={padL} y1={baseY} x2={VW-padR} y2={baseY} stroke="#ece4da" strokeWidth="1"/>
    </svg>
  );
}

/* ── Top content data ── */
const TOP_POSTS = [
  { title: 'Morning rituals, softer days', date: 'Apr 21', cat: 'Lifestyle',      type: 'Reel',     typeBg: '#fce7dc', typeColor: '#e06d45', rate: '8.4%', delta: '↑ 3.2%', thumbBg: '#e8d8c4' },
  { title: 'Small spaces, big mood',       date: 'Apr 22', cat: 'Lifestyle',      type: 'Carousel', typeBg: '#f2e4e8', typeColor: '#9e5872', rate: '7.1%', delta: '↑ 2.6%', thumbBg: '#d8c4b8' },
  { title: "Today's inspo",               date: 'Apr 23', cat: 'Behind the scenes', type: 'Story', typeBg: '#e5eff5', typeColor: '#56819a', rate: '6.8%', delta: '↑ 1.9%', thumbBg: '#c8d4dc' },
  { title: 'New on the blog',             date: 'Apr 24', cat: 'Announcement',    type: 'Static',   typeBg: '#ececed', typeColor: '#666b70', rate: '6.2%', delta: '↑ 1.5%', thumbBg: '#d8d0c8' },
  { title: 'Golden hour in the city',     date: 'Apr 25', cat: 'Lifestyle',       type: 'Reel',     typeBg: '#fce7dc', typeColor: '#e06d45', rate: '5.9%', delta: '↑ 1.1%', thumbBg: '#e8c8a0' },
];

function PlatformIcon({ name, cx, cy }: { name: string; cx: number; cy: number }) {
  const s = 9;
  if (name === 'TikTok') return (
    <g transform={`translate(${cx},${cy})`}>
      <rect x={-s} y={-s} width={s*2} height={s*2} rx="4" fill="#010101"/>
      <text x="0" y="4" fontSize="11" fontWeight="900" fill="white" textAnchor="middle" fontFamily="Arial, sans-serif">T</text>
    </g>
  );
  if (name === 'Instagram') return (
    <g transform={`translate(${cx},${cy})`}>
      <rect x={-s} y={-s} width={s*2} height={s*2} rx="5" fill="none" stroke="#e44637" strokeWidth="1.8"/>
      <circle cx="0" cy="0" r="4" fill="none" stroke="#e44637" strokeWidth="1.8"/>
      <circle cx="4.5" cy="-4.5" r="1.2" fill="#e44637"/>
    </g>
  );
  if (name === 'Pinterest') return (
    <g transform={`translate(${cx},${cy})`}>
      <circle cx="0" cy="0" r={s} fill="#c8253a"/>
      <text x="0" y="4.5" fontSize="13" fontWeight="800" fill="white" textAnchor="middle" fontFamily="Georgia, serif">P</text>
    </g>
  );
  return (
    <g transform={`translate(${cx},${cy})`}>
      <rect x={-s} y={-s} width={s*2} height={s*2} rx="4" fill="#1877f2"/>
      <text x="1" y="5" fontSize="12" fontWeight="700" fill="white" textAnchor="middle" fontFamily="Georgia, serif">f</text>
    </g>
  );
}

function PlatformChart() {
  const VW = 290, VH = 168;
  const padL = 34, padB = 52, padT = 10, padR = 8;
  const chartW = VW - padL - padR;
  const chartH = VH - padB - padT;
  const scl = chartH / 50;
  const baseY = padT + chartH;
  const R = 3;

  const plats = [
    { name: 'TikTok',    pct: 48, color: '#d97856' },
    { name: 'Instagram', pct: 32, color: '#9e6080' },
    { name: 'Pinterest', pct: 12, color: '#7a9db5' },
    { name: 'Facebook',  pct: 8,  color: '#d4a843' },
  ];
  const colW = chartW / plats.length;
  const barW = Math.floor(colW * 0.62);
  const barOff = (colW - barW) / 2;

  return (
    <svg width="100%" viewBox={`0 0 ${VW} ${VH}`} style={{ display: 'block' }}>
      {[0,10,20,30,40,50].map(v => {
        const y = baseY - v * scl;
        return (
          <g key={v}>
            <text x={padL-4} y={y+3.5} fontSize="8.5" fill="#9a8a82" textAnchor="end">{v}%</text>
            <line x1={padL} y1={y} x2={VW-padR} y2={y} stroke="#f0e8e0" strokeWidth="1"/>
          </g>
        );
      })}

      {plats.map((p, i) => {
        const x = padL + i * colW + barOff;
        const barH = p.pct * scl;
        const topY = baseY - barH;
        return (
          <g key={i}>
            <path
              d={`M${x+R},${topY} H${x+barW-R} Q${x+barW},${topY} ${x+barW},${topY+R} V${baseY} H${x} V${topY+R} Q${x},${topY} ${x+R},${topY}Z`}
              fill={p.color}
            />
            <text x={x+barW/2} y={topY-5} fontSize="10" fontWeight="700" fill="#1a2428" textAnchor="middle">{p.pct}%</text>
          </g>
        );
      })}

      {plats.map((p, i) => {
        const cx = padL + i * colW + colW / 2;
        return (
          <g key={i}>
            <PlatformIcon name={p.name} cx={cx} cy={baseY+18}/>
            <text x={cx} y={baseY+35} fontSize="8.5" fill="#9a8a82" textAnchor="middle">{p.name}</text>
          </g>
        );
      })}

      <line x1={padL} y1={padT} x2={padL} y2={baseY} stroke="#ece4da" strokeWidth="1"/>
      <line x1={padL} y1={baseY} x2={VW-padR} y2={baseY} stroke="#ece4da" strokeWidth="1"/>
    </svg>
  );
}

/* ── Key insights ── */
const INSIGHTS = [
  { iconBg: '#fce3dc', iconColor: '#d97856', symbol: '↗', title: 'Reels are driving growth', text: 'Reels get 43% of your posts and 48% of total engagement. Keep leaning into short-form video.' },
  { iconBg: '#fce4ec', iconColor: '#c05d7a', symbol: '♡', title: 'Midweek momentum', text: 'Engagement peaks on Wednesdays and Saturdays. Consider scheduling more high-priority posts then.' },
  { iconBg: '#ddeaf3', iconColor: '#3a6f92', symbol: '⬜', title: 'Lifestyle content wins', text: 'Your top 3 performing posts are lifestyle-focused. Continue mixing behind-the-scenes and day-to-day moments.' },
  { iconBg: '#fef3c0', iconColor: '#a07a00', symbol: '✦', title: 'Consistency matters', text: 'Posting 3–4 times per week correlates with stronger engagement. Stick to your weekly rhythm.' },
];

export default function Analytics() {
  const [platformFilter, setPlatformFilter] = useState('All platforms');
  const [typeFilter, setTypeFilter] = useState('All content types');
  const [periodFilter, setPeriodFilter] = useState('This week');
  const [showPostMenu, setShowPostMenu] = useState(false);

  return (
    <>
      <style>{PAGE_CSS}</style>
      <div className="cc-an-page">

        {/* ── Header ── */}
        <div className="cc-an-header">
          <div>
            <div className="cc-an-heading-row">
              <h1 className="cc-an-heading">Notice what is working.</h1>
              <Sparkles size={22} style={{ color: '#e6ad3f', transform: 'rotate(-10deg)', flexShrink: 0 }} />
            </div>
            <span className="cc-an-swoop" />
          </div>
          <div className="cc-an-header-right">
            <div className="cc-an-meta">
              <span className="cc-an-date">
                <CalendarDays size={14} color="#c27b6a" />
                Apr 21 – Apr 27, 2025
              </span>
              <span className="cc-an-local">
                <MapPin size={11} />
                Local only
              </span>
            </div>
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div className="cc-an-toolbar">
          <div className="cc-an-search">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Search posts, ideas, or hashtags...
          </div>
          <div className="cc-an-select-wrap">
            <select className="cc-an-select" value={platformFilter} onChange={e => setPlatformFilter(e.target.value)}>
              <option>All platforms</option><option>Instagram</option><option>TikTok</option>
            </select>
            <ChevronDown size={10} />
          </div>
          <div className="cc-an-select-wrap">
            <select className="cc-an-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option>All content types</option><option>Reel</option><option>Carousel</option><option>Story</option>
            </select>
            <ChevronDown size={10} />
          </div>
          <div className="cc-an-select-wrap">
            <select className="cc-an-select" value={periodFilter} onChange={e => setPeriodFilter(e.target.value)}>
              <option>This week</option><option>This month</option><option>Last 30 days</option>
            </select>
            <ChevronDown size={10} />
          </div>
          <div style={{ position: 'relative' }}>
            <button className="cc-an-create-btn" onClick={() => setShowPostMenu(v => !v)}>
              <Plus size={13} strokeWidth={2.5} />
              Create post
              <ChevronDown size={11} />
            </button>
            {showPostMenu && (
              <div style={{ position:'absolute',top:'calc(100% + 5px)',right:0,background:'#fff',border:'1px solid #ece4da',borderRadius:10,boxShadow:'0 4px 16px rgba(0,0,0,.10)',minWidth:120,zIndex:100,overflow:'hidden' }}>
                {['Reel','Carousel','Story','Static'].map(t => (
                  <button key={t} onClick={() => setShowPostMenu(false)} style={{ display:'flex',alignItems:'center',gap:8,padding:'9px 14px',fontSize:12.5,color:'#3d2f2f',cursor:'pointer',border:'none',background:'transparent',width:'100%',textAlign:'left',fontFamily:'inherit' }}
                    onMouseEnter={e => (e.currentTarget.style.background='#f9f5f0')}
                    onMouseLeave={e => (e.currentTarget.style.background='transparent')}
                  >
                    {t === 'Reel' && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>}
                    {t === 'Carousel' && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>}
                    {t === 'Story' && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
                    {t === 'Static' && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>}
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div className="cc-an-stats">
          <div className="cc-an-stat">
            <div className="cc-an-stat-icon" style={{ background: '#fce3dc' }}>
              <CalendarDays size={18} color="#c27b6a" />
            </div>
            <div>
              <div className="cc-an-stat-label">Posts published</div>
              <div className="cc-an-stat-value">14</div>
              <div className="cc-an-stat-sub">+27% vs. previous week</div>
            </div>
          </div>
          <div className="cc-an-stat">
            <div className="cc-an-stat-icon" style={{ background: '#ddeaf3' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3a6f92" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </div>
            <div>
              <div className="cc-an-stat-label">Best format</div>
              <div className="cc-an-stat-value reels">Reels</div>
              <div className="cc-an-stat-sub">43% of total posts</div>
            </div>
          </div>
          <div className="cc-an-stat">
            <div className="cc-an-stat-icon" style={{ background: '#1a1a2e' }}>
              <svg width="16" height="17" viewBox="0 0 24 24" fill="white">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.79 1.54V6.79a4.85 4.85 0 0 1-1.02-.1z"/>
              </svg>
            </div>
            <div>
              <div className="cc-an-stat-label">Best platform</div>
              <div className="cc-an-stat-value reels">TikTok</div>
              <div className="cc-an-stat-sub">48% of total engagement</div>
            </div>
          </div>
          <div className="cc-an-stat">
            <div className="cc-an-stat-icon" style={{ background: '#fdf3d5' }}>
              <TrendingUp size={18} color="#c8a000" />
            </div>
            <div>
              <div className="cc-an-stat-label">Engagement trend</div>
              <div className="cc-an-stat-value" style={{ color: '#56a48a' }}>+62%</div>
              <div className="cc-an-stat-sub">vs. previous week</div>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="cc-an-body">

          {/* 2×2 chart grid */}
          <div className="cc-an-main">

            {/* Posts by Type */}
            <div className="cc-an-card">
              <div className="cc-an-card-hdr">
                <h3 className="cc-an-card-title">
                  Posts by Type
                  <Sparkles size={14} color="#e6ad3f" />
                </h3>
                <button className="cc-an-details-btn">View details →</button>
              </div>
              <DonutChart />
            </div>

            {/* Publishing Consistency */}
            <div className="cc-an-card">
              <div className="cc-an-card-hdr">
                <h3 className="cc-an-card-title">
                  Publishing Consistency
                  <Sparkles size={14} color="#e6ad3f" />
                </h3>
                <button className="cc-an-details-btn">View details →</button>
              </div>
              <ConsistencyChart />
            </div>

            {/* Top-Performing Content */}
            <div className="cc-an-card">
              <div className="cc-an-card-hdr">
                <h3 className="cc-an-card-title">
                  Top-Performing Content
                  <Sparkles size={14} color="#e6ad3f" />
                </h3>
                <button className="cc-an-details-btn">View all →</button>
              </div>
              <div className="cc-an-table-hdr">
                <span>Post</span><span>Type</span><span style={{ textAlign: 'right' }}>Engagement rate</span>
              </div>
              {TOP_POSTS.map((p, i) => (
                <div key={i} className="cc-an-table-row">
                  <div className="cc-an-post-info">
                    <div className="cc-an-post-thumb" style={{ background: p.thumbBg }} />
                    <div style={{ minWidth: 0 }}>
                      <div className="cc-an-post-title">{p.title}</div>
                      <div className="cc-an-post-meta">{p.date} · {p.cat}</div>
                    </div>
                  </div>
                  <span className="cc-an-type-pill" style={{ background: p.typeBg, color: p.typeColor }}>{p.type}</span>
                  <div className="cc-an-rate-col">
                    <span className="cc-an-rate">{p.rate}</span>
                    <span className="cc-an-delta">{p.delta}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Engagement by Platform */}
            <div className="cc-an-card">
              <div className="cc-an-card-hdr">
                <h3 className="cc-an-card-title">
                  Engagement by Platform
                  <Sparkles size={14} color="#e6ad3f" />
                </h3>
                <button className="cc-an-details-btn">View details →</button>
              </div>
              <PlatformChart />
            </div>

          </div>

          {/* Key Insights sidebar */}
          <div className="cc-an-insights">
            <div className="cc-an-insights-hdr">
              <h3 className="cc-an-insights-title">
                Key Insights
                <Sparkles size={14} color="#e6ad3f" />
              </h3>
              <Lightbulb size={15} color="#d4a843" />
            </div>
            {INSIGHTS.map((ins, i) => (
              <div key={i} className="cc-an-insight-card">
                <div className="cc-an-insight-row">
                  <div
                    className="cc-an-insight-icon"
                    style={{ background: ins.iconBg, color: ins.iconColor, fontSize: 14, fontWeight: 700 }}
                  >
                    {ins.symbol}
                  </div>
                  <div className="cc-an-insight-body">
                    <div className="cc-an-insight-title">{ins.title}</div>
                    <div className="cc-an-insight-text">{ins.text}</div>
                    <div className="cc-an-insight-line" />
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}
