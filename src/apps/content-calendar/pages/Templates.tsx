import { useState } from 'react';
import type { FormEvent } from 'react';
import { CalendarDays, ChevronDown, MapPin, Search, Sparkles } from 'lucide-react';
import underlineImg from '../../../assets/budget-assets/stationery-accents/stationery-accents-02.png';

const TEMPLATES_CSS = `
.cc-tmpl{min-width:1080px;background:#faf7f2;color:#3d2f2f;min-height:100%;padding-bottom:24px;font-family:'Nunito',-apple-system,sans-serif}

/* ── Header (matches Ideas page pattern) ───────────────────────────────── */
.cc-tmpl-head{display:flex;justify-content:space-between;align-items:flex-start;padding:18px 22px 3px}
.cc-tmpl-title-row{display:flex;gap:10px;align-items:center}
.cc-tmpl-title{font:400 31px/1 'DM Serif Display',Georgia,serif;margin:0}
.cc-tmpl-star{color:#e8af45;transform:rotate(-8deg)}
.cc-tmpl-line{width:170px;border-top:3px solid #d87956;border-radius:50%;margin-top:10px;transform:rotate(-2deg)}
.cc-tmpl-meta{display:flex;align-items:center;gap:20px;font-size:12px;font-weight:650}
.cc-tmpl-local{display:flex;align-items:center;gap:7px;padding:6px 14px;background:#fae7c5;border-radius:99px;font-size:11px}

/* ── Toolbar ────────────────────────────────────────────────────────────── */
.cc-tmpl-toolbar{display:flex;align-items:center;gap:8px;padding:10px 22px 12px}
.cc-tmpl-toolbar-spacer{flex:0 0 155px}
.cc-tmpl-search{height:31px;display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.85);border:1px solid #ece5de;border-radius:10px;padding:0 12px;flex:0 0 220px}
.cc-tmpl-search input{width:100%;border:0;outline:0;background:transparent;font-size:10.5px;color:#3d2f2f}
.cc-tmpl-search input::placeholder{color:#b0a098}
.cc-tmpl-sel-wrap{position:relative}
.cc-tmpl-sel{height:31px;appearance:none;padding:0 28px 0 12px;border:1px solid #ece5de;border-radius:10px;background:rgba(255,255,255,.85);font-size:10.5px;color:#3d2f2f;cursor:pointer;outline:0}
.cc-tmpl-sel-wrap svg{position:absolute;right:9px;top:10px;pointer-events:none;color:#8a7a72}
.cc-tmpl-plus-btn{margin-left:auto;width:32px;height:32px;background:#f9ede6;border:1px solid #f0d5c8;border-radius:9px;font-size:18px;font-weight:400;color:#d97856;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0}
.cc-tmpl-plus-btn:hover{background:#f5d4c0}

/* ── Body: 2-column grid ────────────────────────────────────────────────── */
.cc-tmpl-body{display:grid;grid-template-columns:1fr 230px;gap:16px;padding:0 16px}

/* ── Section header: title left, info card right ────────────────────────── */
.cc-tmpl-section-hdr{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:14px}
.cc-tmpl-section-title-area{flex-shrink:0}
.cc-tmpl-section-title{font:400 21px/1 'DM Serif Display',Georgia,serif;margin:0;display:flex;align-items:center;gap:8px}
.cc-tmpl-arrows{color:#d97856;font-size:17px;letter-spacing:-1px}
.cc-tmpl-section-sub{font-size:10px;color:#8a7a72;margin:5px 0 0}
.cc-tmpl-info-card{display:flex;align-items:center;justify-content:space-between;background:rgba(225,240,252,.6);border:1px solid #c8dff0;border-radius:10px;padding:11px 14px;flex:1;max-width:360px}
.cc-tmpl-info-icon{width:34px;height:34px;background:#d3e8f5;border-radius:8px;display:flex;align-items:center;justify-content:center;margin-right:11px;flex-shrink:0}
.cc-tmpl-info-left{display:flex;align-items:center}
.cc-tmpl-info-text strong{display:block;font-size:12.5px;font-weight:700;margin-bottom:2px}
.cc-tmpl-info-text span{font-size:9.5px;color:#5a8a9f}
.cc-tmpl-info-arrow{color:#5a8a9f;font-size:15px}

/* ── Format rows: View all → on top, then [category | cards] sub-row ───── */
.cc-tmpl-format-row{display:flex;flex-direction:column;margin-bottom:16px}
.cc-tmpl-row-body{display:flex;gap:12px;align-items:stretch}
.cc-tmpl-cat{flex:0 0 155px;padding:14px;border-radius:10px;background:rgba(255,255,255,.7);border:1px solid #ece4da;cursor:pointer;transition:box-shadow .15s;text-align:left}
.cc-tmpl-cat:hover{box-shadow:0 2px 8px rgba(60,40,30,.09)}
.cc-tmpl-cat.active{border-color:#d97856;background:rgba(255,255,255,.97)}
.cc-tmpl-cat-icon{width:40px;height:40px;border-radius:99px;display:flex;align-items:center;justify-content:center;margin-bottom:9px;font-size:18px}
.cc-tmpl-cat-icon.reel{background:#fce8e3;color:#c27b6a}
.cc-tmpl-cat-icon.carousel{background:#f2e4e8;color:#9e5872}
.cc-tmpl-cat-icon.story{background:#e5eff5;color:#56819a}
.cc-tmpl-cat-icon.static{background:#ececed;color:#666b70}
.cc-tmpl-cat-name{font:400 17px/1 'DM Serif Display',Georgia,serif;margin-bottom:5px}
.cc-tmpl-cat-desc{font-size:9px;color:#8a7a72;line-height:1.4}
/* curved underline inside category cards — reuses cc-tmpl-line style but shorter + colored per format */
.cc-tmpl-cat .cc-tmpl-line{width:50px;margin-top:10px}
.cc-tmpl-cat.reel .cc-tmpl-line{border-color:#c27b6a}
.cc-tmpl-cat.carousel .cc-tmpl-line{border-color:#9e5872}
.cc-tmpl-cat.story .cc-tmpl-line{border-color:#56819a}
.cc-tmpl-cat.static .cc-tmpl-line{border-color:#888888}

/* ── "View all" row above, cards grid below ─────────────────────────────── */
.cc-tmpl-row-head{display:flex;justify-content:flex-end;margin-bottom:7px}
.cc-tmpl-cards-col{flex:1;min-width:0}
.cc-tmpl-view-all{font-size:10.5px;color:#d97856;font-weight:700;cursor:pointer;background:none;border:none;padding:0}
.cc-tmpl-view-all:hover{text-decoration:underline}
.cc-tmpl-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}

/* ── Template card: HORIZONTAL (image LEFT, content RIGHT) ──────────────── */
.cc-tmpl-card{background:rgba(255,255,255,.82);border:1px solid #ece4da;border-radius:9px;overflow:hidden;display:flex;flex-direction:row}
.cc-tmpl-thumb{width:95px;flex-shrink:0}
.cc-tmpl-thumb.reel{background:linear-gradient(160deg,#fce8e3,#f0c9be)}
.cc-tmpl-thumb.carousel{background:linear-gradient(160deg,#f2e4e8,#e3cdd5)}
.cc-tmpl-thumb.story{background:linear-gradient(160deg,#e5eff5,#c8dced)}
.cc-tmpl-thumb.static{background:linear-gradient(160deg,#ececed,#d8d8da)}
.cc-tmpl-card-body{flex:1;padding:9px 10px;display:flex;flex-direction:column;min-width:0}
.cc-tmpl-card-name{font-size:11px;font-weight:700;color:#3d2f2f;margin-bottom:6px;line-height:1.2}
.cc-tmpl-card-struct{display:flex;flex-direction:column;gap:3px;margin-bottom:6px}
.cc-tmpl-struct-row{display:flex;align-items:center;gap:4px;font-size:8.5px;color:#6b5a52}
.cc-tmpl-struct-icon{color:#b0a098;flex-shrink:0}
.cc-tmpl-card-foot{margin-top:auto;display:flex;flex-direction:column;gap:4px}
.cc-tmpl-badges{display:flex;align-items:center;gap:4px;flex-wrap:wrap}
.cc-tmpl-platform-badge{display:flex;align-items:center;gap:3px;padding:2px 6px;border-radius:99px;font-size:7.5px;background:#fde8e0;color:#a05040}
.cc-tmpl-type-badge{padding:2px 6px;border-radius:99px;font-size:7.5px;font-weight:600}
.cc-tmpl-type-badge.reel{background:#fce8e3;color:#c27b6a}
.cc-tmpl-type-badge.carousel{background:#f2e4e8;color:#9e5872}
.cc-tmpl-type-badge.story{background:#e5eff5;color:#56819a}
.cc-tmpl-type-badge.static{background:#ececed;color:#666b70}
.cc-tmpl-use-btn{align-self:flex-start;padding:3px 8px;border-radius:99px;background:#fbdcc9;color:#b55335;font-size:7.5px;font-weight:700;border:none;cursor:pointer;white-space:nowrap}
.cc-tmpl-use-btn:hover{background:#f5c8aa}
.cc-tmpl-empty{text-align:center;padding:24px;color:#8a7a72;font-size:12px;grid-column:1/-1}

/* ── Right panel ─────────────────────────────────────────────────────────── */
.cc-tmpl-right{display:flex;flex-direction:column;gap:12px;padding-top:0}
.cc-tmpl-create-panel{background:rgba(255,255,255,.82);border:1px solid #ece4da;border-radius:10px;padding:14px}
.cc-tmpl-create-panel-title{display:flex;align-items:center;gap:8px;font:400 20px/1 'DM Serif Display',Georgia,serif;margin-bottom:4px}
.cc-tmpl-create-plus{width:22px;height:22px;background:#fbdcc9;color:#d97856;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;flex-shrink:0}
.cc-tmpl-create-sub{font-size:9px;color:#8a7a72;margin-bottom:12px;line-height:1.4}
.cc-tmpl-field{display:flex;flex-direction:column;gap:4px;margin-bottom:9px}
.cc-tmpl-field label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#806f66}
.cc-tmpl-field label span{color:#d97856}
.cc-tmpl-field textarea{border:1px solid #e0d6ce;border-radius:7px;background:white;padding:7px 9px;font-size:10px;outline:0;resize:none;font-family:inherit;color:#3d2f2f}
.cc-tmpl-field textarea::placeholder{color:#c0b0a8}
.cc-tmpl-field textarea:focus{border-color:#d97856}
.cc-tmpl-field-count{font-size:8px;color:#c0b0a8;text-align:right;margin-top:1px}
.cc-tmpl-sel-field{border:1px solid #e0d6ce;border-radius:7px;background:white;padding:7px 9px;font-size:10px;outline:0;appearance:none;width:100%;color:#3d2f2f;font-family:inherit;cursor:pointer}
.cc-tmpl-sel-field:focus{border-color:#d97856}
.cc-tmpl-save-btn{width:100%;height:36px;background:#d97856;color:white;border-radius:8px;font-size:11px;font-weight:700;border:none;cursor:pointer;margin-top:4px}
.cc-tmpl-save-btn:hover{background:#c9674a}
.cc-tmpl-encourage{background:rgba(255,255,255,.7);border:1px solid #ece4da;border-radius:10px;padding:14px;text-align:center}
.cc-tmpl-encourage-star{margin-bottom:6px;display:flex;justify-content:center}
.cc-tmpl-encourage-text{font:600 14px/1.3 'Caveat',cursive;color:#3d2f2f;margin-bottom:4px}
.cc-tmpl-encourage-sub{font-size:9px;color:#8a7a72;line-height:1.4}
`;

type TemplateFormat = 'Reel' | 'Carousel' | 'Story' | 'Static';
type TemplatePlatform = 'instagram' | 'tiktok' | 'facebook';

interface Template {
  id: string;
  name: string;
  format: TemplateFormat;
  platform: TemplatePlatform;
  structure: { hook: string; body: string; cta: string };
}

const TEMPLATES: Template[] = [
  { id: 't1', name: 'Quick Tip Reel', format: 'Reel', platform: 'instagram', structure: { hook: '2–5 lines', body: '3–6 bullets', cta: '1 line' } },
  { id: 't2', name: 'Day in the Life', format: 'Reel', platform: 'tiktok', structure: { hook: '1 line', body: '4–8 bullets', cta: '1 line' } },
  { id: 't3', name: 'Behind the Scenes', format: 'Reel', platform: 'instagram', structure: { hook: '1 line', body: '3–6 bullets', cta: '1 line' } },
  { id: 't4', name: 'How-To Carousel', format: 'Carousel', platform: 'instagram', structure: { hook: '1 line', body: '5–7 images', cta: '1 line' } },
  { id: 't5', name: 'Tips & Tricks', format: 'Carousel', platform: 'tiktok', structure: { hook: '1 line', body: '4–6 images', cta: '1 line' } },
  { id: 't6', name: 'Product Spotlight', format: 'Carousel', platform: 'instagram', structure: { hook: '1 line', body: '4–6 images', cta: '1 line' } },
  { id: 't7', name: 'Poll / Question', format: 'Story', platform: 'instagram', structure: { hook: '1 line', body: '1–3 slides', cta: '1 line' } },
  { id: 't8', name: 'Daily Moment', format: 'Story', platform: 'instagram', structure: { hook: '1 line', body: '2–4 slides', cta: '1 line' } },
  { id: 't9', name: 'Text Overlay', format: 'Story', platform: 'tiktok', structure: { hook: '1 line', body: '1–2 slides', cta: '1 line' } },
  { id: 't10', name: 'Quote Graphic', format: 'Static', platform: 'instagram', structure: { hook: '1 line', body: '1–3 lines', cta: '0–1 line' } },
  { id: 't11', name: 'Product Feature', format: 'Static', platform: 'instagram', structure: { hook: '1 line', body: '3–5 lines', cta: '1 line' } },
  { id: 't12', name: 'Brand Quote', format: 'Static', platform: 'facebook', structure: { hook: '1 line', body: '2 lines', cta: '0–1 line' } },
];

const FORMAT_META: Record<TemplateFormat, { tagline: string; desc: string; iconClass: string; lineClass: string; icon: string }> = {
  Reel:     { tagline: 'Short, punchy, high', desc: 'engagement.',      iconClass: 'reel',     lineClass: 'reel',     icon: '⏺' },
  Carousel: { tagline: 'Deeper storytelling.', desc: 'More value.',     iconClass: 'carousel', lineClass: 'carousel', icon: '⊞' },
  Story:    { tagline: 'Quick updates.',       desc: 'Real connection.', iconClass: 'story',    lineClass: 'story',    icon: '◷' },
  Static:   { tagline: 'Clean, classic,',      desc: 'evergreen.',       iconClass: 'static',   lineClass: 'static',   icon: '⊡' },
};

const FORMATS: TemplateFormat[] = ['Reel', 'Carousel', 'Story', 'Static'];

function PlatformIcon({ platform }: { platform: TemplatePlatform }) {
  if (platform === 'instagram') return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#e04f44" strokeWidth="2.2">
      <rect x="3" y="3" width="18" height="18" rx="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="1" fill="#e04f44" stroke="none"/>
    </svg>
  );
  if (platform === 'tiktok') return <span style={{ fontWeight: 900, color: '#17272d', fontSize: 9 }}>♪</span>;
  return <span style={{ color: '#1877f2', fontWeight: 900, fontSize: 8 }}>f</span>;
}

function PlatformLabel({ platform }: { platform: TemplatePlatform }) {
  if (platform === 'instagram') return <>Instagram</>;
  if (platform === 'tiktok') return <>TikTok</>;
  return <>Facebook</>;
}

function HookIcon() {
  return (
    <svg className="cc-tmpl-struct-icon" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <rect x="3" y="4" width="18" height="4" rx="1"/>
    </svg>
  );
}

function BodyIcon() {
  return (
    <svg className="cc-tmpl-struct-icon" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <line x1="7" y1="9" x2="17" y2="9"/><line x1="7" y1="13" x2="14" y2="13"/>
    </svg>
  );
}

function CtaIcon() {
  return (
    <svg className="cc-tmpl-struct-icon" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  );
}

function TemplateCard({ template }: { template: Template }) {
  const fmt = template.format.toLowerCase() as 'reel' | 'carousel' | 'story' | 'static';
  const bodyLabel = template.format === 'Carousel' ? 'Slides' : 'Body';
  return (
    <div className="cc-tmpl-card">
      {/* image on LEFT */}
      <div className={`cc-tmpl-thumb ${fmt}`} />
      {/* content on RIGHT */}
      <div className="cc-tmpl-card-body">
        <div className="cc-tmpl-card-name">{template.name}</div>
        <div className="cc-tmpl-card-struct">
          <div className="cc-tmpl-struct-row"><HookIcon /><span><b>Hook</b> · {template.structure.hook}</span></div>
          <div className="cc-tmpl-struct-row"><BodyIcon /><span><b>{bodyLabel}</b> · {template.structure.body}</span></div>
          <div className="cc-tmpl-struct-row"><CtaIcon /><span><b>CTA</b> · {template.structure.cta}</span></div>
        </div>
        <div className="cc-tmpl-card-foot">
          <div className="cc-tmpl-badges">
            <span className="cc-tmpl-platform-badge">
              <PlatformIcon platform={template.platform} />
              <PlatformLabel platform={template.platform} />
            </span>
            <span className={`cc-tmpl-type-badge ${fmt}`}>{template.format}</span>
          </div>
          <button className="cc-tmpl-use-btn">Use template →</button>
        </div>
      </div>
    </div>
  );
}

export default function Templates() {
  const [activeFormat, setActiveFormat] = useState<TemplateFormat | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [hookText, setHookText] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [formPlatform, setFormPlatform] = useState('instagram');
  const [formType, setFormType] = useState('Carousel');

  const filtered = TEMPLATES.filter(t => {
    if (activeFormat !== 'all' && t.format !== activeFormat) return false;
    if (searchQuery && !t.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedPlatform !== 'all' && t.platform !== selectedPlatform) return false;
    if (selectedType !== 'all' && t.format !== selectedType) return false;
    return true;
  });

  const formatsToShow = activeFormat === 'all' ? FORMATS : [activeFormat];

  function handleSave(e: FormEvent) {
    e.preventDefault();
    setHookText('');
    setBodyText('');
    setCtaText('');
  }

  return (
    <>
      <style>{TEMPLATES_CSS}</style>
      <div className="cc-tmpl">

        {/* ── Header (Ideas page pattern) ─────────────────────────── */}
        <header className="cc-tmpl-head">
          <div>
            <div className="cc-tmpl-title-row">
              <h1 className="cc-tmpl-title">Start with a shape that works.</h1>
              <Sparkles className="cc-tmpl-star" size={29} />
            </div>
            <div className="cc-tmpl-line" />
          </div>
          <div className="cc-tmpl-meta">
            <span style={{ color: '#6b5a52', fontSize: 12 }}>
              Apr 21 – Apr 27, 2025 &nbsp;<CalendarDays size={13} style={{ display: 'inline', verticalAlign: 'middle' }} />
            </span>
            <span className="cc-tmpl-local">
              <MapPin size={11} fill="currentColor" />Local only
            </span>
          </div>
        </header>

        {/* ── Toolbar (spacer aligns search with cards column) ──────── */}
        <div className="cc-tmpl-toolbar">
          <div className="cc-tmpl-toolbar-spacer" />
          <div className="cc-tmpl-search">
            <Search size={12} color="#b0a098" />
            <input
              placeholder="Search templates, keywords, or formats..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="cc-tmpl-sel-wrap">
            <select className="cc-tmpl-sel" value={selectedPlatform} onChange={e => setSelectedPlatform(e.target.value)}>
              <option value="all">All platforms</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="facebook">Facebook</option>
            </select>
            <ChevronDown size={11} />
          </div>
          <div className="cc-tmpl-sel-wrap">
            <select className="cc-tmpl-sel" value={selectedType} onChange={e => setSelectedType(e.target.value)}>
              <option value="all">All post types</option>
              <option value="Reel">Reel</option>
              <option value="Carousel">Carousel</option>
              <option value="Story">Story</option>
              <option value="Static">Static</option>
            </select>
            <ChevronDown size={11} />
          </div>
          <div className="cc-tmpl-sel-wrap">
            <select className="cc-tmpl-sel">
              <option>Sort: Newest</option>
              <option>Sort: Oldest</option>
              <option>Sort: A–Z</option>
            </select>
            <ChevronDown size={11} />
          </div>
          <button
            className="cc-tmpl-plus-btn"
            onClick={() => document.getElementById('cc-tmpl-hook')?.focus()}
          >+</button>
        </div>

        {/* ── Body: main | right panel ─────────────────────────────── */}
        <div className="cc-tmpl-body">

          {/* Main content */}
          <div>
            {/* Section header: title left + info card right */}
            <div className="cc-tmpl-section-hdr">
              <div className="cc-tmpl-section-title-area">
                <div className="cc-tmpl-section-title">
                  Reusable content templates
                  <span className="cc-tmpl-arrows">&gt;&gt;</span>
                </div>
                <p className="cc-tmpl-section-sub">Proven formats. Your brand. Ready to use.</p>
              </div>
              <div className="cc-tmpl-info-card">
                <div className="cc-tmpl-info-left">
                  <div className="cc-tmpl-info-icon">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#5a8a9f" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="7" rx="1"/>
                      <rect x="3" y="14" width="8" height="7" rx="1"/>
                      <rect x="14" y="14" width="7" height="7" rx="1"/>
                    </svg>
                  </div>
                  <div className="cc-tmpl-info-text">
                    <strong>Your repeatable formats</strong>
                    <span>12 templates · 4 post types · 3 platforms</span>
                  </div>
                </div>
                <span className="cc-tmpl-info-arrow">→</span>
              </div>
            </div>

            {/* Format rows: [category card left] + [cards right] */}
            {formatsToShow.map(fmt => {
              const meta = FORMAT_META[fmt];
              const cards = filtered.filter(t => t.format === fmt);
              if (cards.length === 0) return null;
              return (
                <div key={fmt} className="cc-tmpl-format-row">
                  {/* "View all →" sits above both category card and template cards */}
                  <div className="cc-tmpl-row-head">
                    <button className="cc-tmpl-view-all">View all →</button>
                  </div>

                  {/* Sub-row: category card LEFT, template cards RIGHT — same top edge */}
                  <div className="cc-tmpl-row-body">
                    <button
                      className={`cc-tmpl-cat ${meta.iconClass}${activeFormat === fmt ? ' active' : ''}`}
                      onClick={() => setActiveFormat(activeFormat === fmt ? 'all' : fmt)}
                    >
                      <div className={`cc-tmpl-cat-icon ${meta.iconClass}`}>{meta.icon}</div>
                      <div className="cc-tmpl-cat-name">{fmt}</div>
                      <div className="cc-tmpl-cat-desc">{meta.tagline}<br />{meta.desc}</div>
                      <div className="cc-tmpl-line" />
                    </button>

                    <div className="cc-tmpl-cards-col">
                      <div className="cc-tmpl-cards">
                        {cards.slice(0, 3).map(t => <TemplateCard key={t.id} template={t} />)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="cc-tmpl-cards">
                <div className="cc-tmpl-empty">No templates match your filters.</div>
              </div>
            )}
          </div>

          {/* Right panel: create form + encouragement */}
          <div className="cc-tmpl-right">
            <div className="cc-tmpl-create-panel">
              <div className="cc-tmpl-create-panel-title">
                <span className="cc-tmpl-create-plus">+</span>
                Create template
              </div>
              <p className="cc-tmpl-create-sub">Save time with your own reusable content template.</p>

              <form onSubmit={handleSave}>
                <div className="cc-tmpl-field">
                  <label>Hook <span>*</span></label>
                  <textarea
                    id="cc-tmpl-hook"
                    rows={2}
                    placeholder="e.g. 5 ways to..."
                    value={hookText}
                    onChange={e => setHookText(e.target.value)}
                    maxLength={100}
                  />
                  <div className="cc-tmpl-field-count">{hookText.length}/100</div>
                </div>
                <div className="cc-tmpl-field">
                  <label>Body <span>*</span></label>
                  <textarea
                    rows={3}
                    placeholder="e.g. 3 key points, tips, or steps..."
                    value={bodyText}
                    onChange={e => setBodyText(e.target.value)}
                    maxLength={500}
                  />
                  <div className="cc-tmpl-field-count">{bodyText.length}/500</div>
                </div>
                <div className="cc-tmpl-field">
                  <label>CTA <span>*</span></label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Save for later. Link in bio..."
                    value={ctaText}
                    onChange={e => setCtaText(e.target.value)}
                    maxLength={100}
                  />
                  <div className="cc-tmpl-field-count">{ctaText.length}/100</div>
                </div>
                <div className="cc-tmpl-field">
                  <label>Platform <span>*</span></label>
                  <select className="cc-tmpl-sel-field" value={formPlatform} onChange={e => setFormPlatform(e.target.value)}>
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="facebook">Facebook</option>
                  </select>
                </div>
                <div className="cc-tmpl-field">
                  <label>Post type <span>*</span></label>
                  <select className="cc-tmpl-sel-field" value={formType} onChange={e => setFormType(e.target.value)}>
                    {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <button type="submit" className="cc-tmpl-save-btn">Save template</button>
              </form>
            </div>

            {/* Encouragement card */}
            <div className="cc-tmpl-encourage">
              <div className="cc-tmpl-encourage-star">
                <Sparkles size={22} color="#e8af45" />
              </div>
              <div className="cc-tmpl-encourage-text">You're 12 templates<br />strong!</div>
              <div className="cc-tmpl-encourage-sub">Keep building your library of repeatable formats.</div>
              <img
                src={underlineImg}
                alt=""
                style={{ display: 'block', width: 90, height: 10, objectFit: 'cover', opacity: 0.4, margin: '8px auto 0' }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
