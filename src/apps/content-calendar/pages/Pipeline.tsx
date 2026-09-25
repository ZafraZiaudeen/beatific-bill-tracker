import { useMemo, useState } from 'react';
import type { DragEvent, FormEvent, KeyboardEvent } from 'react';
import {
  CalendarDays, Check, CheckCircle2, ChevronDown,
  Lightbulb, MapPin, MoreHorizontal, Music2, Plus, Search,
  Send, Sparkles,
} from 'lucide-react';
import { useContentCalendarStore } from '../store';
import type { PipelineItem, PipelineStage, Platform, PostType } from '../types';

const STAGES: { id: PipelineStage; label: string; progress: string; color: string; bg: string; icon: typeof Lightbulb }[] = [
  { id: 'ideas', label: 'Ideas', progress: 'Ideas', color: '#e5a31f', bg: '#f8efe1', icon: Lightbulb },
  { id: 'drafting', label: 'Drafting', progress: 'Drafting', color: '#af4968', bg: '#f5e9ea', icon: Send },
  { id: 'ready', label: 'Ready to publish', progress: 'Review', color: '#56819a', bg: '#e9f0f3', icon: CheckCircle2 },
  { id: 'published', label: 'Published', progress: 'Published', color: '#66a28d', bg: '#eaf0e7', icon: Sparkles },
];

const PLATFORMS: { id: Platform; label: string }[] = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'pinterest', label: 'Pinterest' },
];

const CONTENT_TYPES: PostType[] = ['Reel', 'Carousel', 'Story', 'Static'];
const THUMBNAILS = [
  { x: 216, y: 175 }, { x: 216, y: 276 }, { x: 216, y: 369 },
  { x: 460, y: 175 }, { x: 460, y: 276 }, { x: 688, y: 175 },
  { x: 913, y: 175 }, { x: 913, y: 278 }, { x: 913, y: 574 },
];

const PIPELINE_CSS = `
.cc-pipeline-page{min-width:1060px;padding-bottom:24px;background:radial-gradient(circle at 78% 12%,rgba(255,255,255,.72),transparent 28%),#faf7f2;color:#1f2c31}
.cc-pipeline-header{display:flex;align-items:flex-start;justify-content:space-between;gap:24px;padding:16px 22px 12px}
.cc-pipeline-heading{font-family:'DM Serif Display',Georgia,serif;font-weight:400;font-size:29px;line-height:.98;letter-spacing:-.02em;margin:0;color:#202e33}
.cc-pipeline-heading-row{display:flex;align-items:center;gap:8px}.cc-pipeline-star{color:#e6ad3f;transform:rotate(-10deg)}
.cc-pipeline-swoop{display:block;width:102px;height:11px;margin-top:8px;border-top:3px solid #d97957;border-radius:50%;transform:rotate(-3deg)}
.cc-pipeline-header-right{flex:1;display:flex;flex-direction:column;align-items:flex-end;gap:26px;min-width:0}
.cc-pipeline-meta{display:flex;align-items:center;gap:22px;font-weight:650;font-size:12px}.cc-pipeline-date{display:flex;align-items:center;gap:7px}
.cc-pipeline-local{display:flex;align-items:center;gap:7px;padding:6px 14px;background:#fae7c5;border-radius:99px;font-size:11px}
.cc-pipeline-toolbar{display:flex;align-items:center;gap:7px;width:100%;justify-content:flex-end}
.cc-pipeline-search{height:31px;min-width:240px;max-width:310px;flex:1;display:flex;align-items:center;gap:8px;padding:0 10px;background:rgba(255,255,255,.78);border:1px solid #ece6df;border-radius:11px}
.cc-pipeline-search input{border:0;outline:0;background:transparent;width:100%;font-size:10.5px;color:#263238}.cc-pipeline-search input::placeholder{color:#909399}
.cc-pipeline-select-wrap{position:relative}.cc-pipeline-select{appearance:none;height:31px;padding:0 28px 0 11px;border:1px solid #ece6df;border-radius:11px;background:rgba(255,255,255,.78);font-size:10.5px;color:#263238;outline:0;min-width:92px}
.cc-pipeline-select-wrap svg{position:absolute;right:9px;top:10px;pointer-events:none}.cc-pipeline-add{height:32px;display:flex;align-items:center;justify-content:center;gap:8px;padding:0 18px;border-radius:18px;background:linear-gradient(90deg,#d96d49,#dc815f);color:#fff;font-size:10.5px;box-shadow:0 4px 10px rgba(201,99,65,.18);white-space:nowrap}
.cc-pipeline-layout{display:flex;gap:11px;padding:0 18px 0 18px;align-items:flex-start}.cc-pipeline-board{display:grid;grid-template-columns:repeat(4,minmax(205px,1fr));gap:8px;flex:1;min-width:0}.cc-pipeline-column{border-radius:8px;padding:10px 8px 11px;min-height:582px;transition:box-shadow .15s,transform .15s}.cc-pipeline-column.is-over{box-shadow:inset 0 0 0 2px rgba(74,124,113,.45);transform:translateY(-2px)}
.cc-pipeline-column-head{height:39px;display:flex;align-items:flex-start;gap:9px;padding:2px 3px 0}.cc-pipeline-column-head h2{font-family:'DM Serif Display',Georgia,serif;font-weight:400;font-size:15.5px;margin:1px 0 0;white-space:nowrap}.cc-pipeline-column-icon{margin-top:0}.cc-pipeline-count{margin-left:auto;margin-top:2px;width:17px;height:17px;display:grid;place-items:center;border-radius:50%;background:rgba(39,56,58,.14);font-size:9px;color:#536363}
.cc-pipeline-title-line{width:43px;height:2px;border-radius:50%;margin-top:5px;transform:rotate(-5deg)}.cc-pipeline-stack{display:flex;flex-direction:column;gap:1px}.cc-pipeline-empty{text-align:center;color:#927f75;font-size:11px;padding:36px 8px}
.cc-pipeline-card{display:flex;gap:9px;min-height:96px;padding:10px 9px;background:rgba(255,255,255,.84);border:1px solid rgba(230,224,215,.72);border-radius:6px;cursor:grab;transition:opacity .15s,box-shadow .15s,transform .15s;outline:none}.cc-pipeline-card:hover,.cc-pipeline-card:focus-visible{box-shadow:0 5px 15px rgba(67,54,45,.09);transform:translateY(-1px)}.cc-pipeline-card.is-dragging{opacity:.35}
.cc-pipeline-thumb{width:53px;height:53px;flex:0 0 53px;border:1px solid rgba(121,105,91,.16);border-radius:6px;background-color:#e8dfd4;background-image:linear-gradient(135deg,rgba(255,255,255,.55) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.55) 50%,rgba(255,255,255,.55) 75%,transparent 75%);background-size:12px 12px}.cc-pipeline-thumb-ideas{background-color:#f1e4d3}.cc-pipeline-thumb-media{background-color:#dfe8e6}.cc-pipeline-thumb-composer{background-color:#eadfe5}.cc-pipeline-card-body{flex:1;min-width:0;display:flex;flex-direction:column}.cc-pipeline-card-top{display:flex;align-items:flex-start;gap:4px}.cc-pipeline-card-title{font-size:10.5px;line-height:1.25;font-weight:650;min-height:26px;flex:1;color:#17262c}.cc-pipeline-more{padding:0;color:#26363b}
.cc-pipeline-card-meta{display:flex;align-items:center;gap:7px;height:22px}.cc-pipeline-socials{display:flex;align-items:center;gap:6px}.cc-social{display:inline-flex;align-items:center;justify-content:center}.cc-social.instagram{color:#ef442f}.cc-social.tiktok{color:#17262c}.cc-social.youtube{color:#d6312f}.cc-social.pinterest{color:#d83839;font-weight:800;font-family:Georgia,serif;font-size:13px}
.cc-type-pill{padding:2px 11px;border-radius:99px;font-size:8.5px;line-height:14px;white-space:nowrap}.cc-type-Reel{background:#fce7dc;color:#e06d45}.cc-type-Carousel{background:#f2e4e8;color:#9e5872}.cc-type-Story{background:#e5eff5;color:#56819a}.cc-type-Static{background:#ececed;color:#666b70}.cc-type-Lifestyle{background:#f8e9e8;color:#c06773}
.cc-pipeline-card-date{display:flex;align-items:center;gap:5px;font-size:9px;color:#3e4b4e;margin-top:0}.cc-pipeline-progress{margin-top:auto;display:flex;align-items:center;gap:5px;font-size:7.8px;color:#71807f;white-space:nowrap}.cc-progress-label{max-width:54px;overflow:hidden;text-overflow:ellipsis}.cc-progress-dot{width:9px;height:9px;border:1px solid #b9c7c5;border-radius:50%;display:grid;place-items:center}.cc-progress-dot.done{border-color:#69a69b;background:#69a69b;color:white}.cc-progress-count{color:#a9afb1;margin-left:1px}
.cc-pipeline-aside{width:132px;flex:0 0 132px}.cc-next-card{background:rgba(255,255,255,.8);border:1px solid #eee7df;border-radius:7px;padding:9px 12px 13px;min-height:282px}.cc-next-card h3{font-family:'DM Serif Display',Georgia,serif;font-weight:400;font-size:13px;margin:5px 0 9px}.cc-next-underline{width:44px;height:2px;background:#d97957;border-radius:50%;transform:rotate(-2deg);margin-top:5px}.cc-next-thumb{width:61px;height:61px;border-radius:6px;background-repeat:no-repeat;background-size:1280px 720px;margin-bottom:10px}.cc-next-title{font-size:10.5px;font-weight:650;line-height:1.35;margin-bottom:6px}.cc-next-platforms{display:flex;gap:8px;margin:6px 0}.cc-next-date{display:flex;gap:5px;align-items:center;font-size:9px;margin:10px 0 13px}.cc-view-details{width:100%;padding:7px;border-radius:99px;background:#f7eee5;color:#985e51;font-size:9px}.cc-note{width:132px;height:106px;margin-top:18px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;background:#fff0e4;border-radius:47% 53% 50% 41%;transform:rotate(-4deg);color:#af6145;font-family:'Caveat',cursive;font-size:14px;line-height:1.05}.cc-note span{width:85px}.cc-note-line{width:38px;border-top:2px solid #dc7957;margin-top:8px}
.cc-pipeline-overlay{position:fixed;inset:0;background:rgba(28,33,34,.28);display:grid;place-items:center;z-index:1000;padding:20px}.cc-pipeline-modal{width:min(470px,100%);max-height:90vh;overflow:auto;background:#fffaf6;border:1px solid #eadfd5;border-radius:15px;box-shadow:0 18px 70px rgba(45,37,32,.22);padding:22px}.cc-pipeline-modal h2{font-family:'DM Serif Display',Georgia,serif;font-weight:400;font-size:25px;margin:0 0 16px}.cc-modal-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.cc-field{display:flex;flex-direction:column;gap:5px}.cc-field.full{grid-column:1/-1}.cc-field label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#7d6e65}.cc-field input,.cc-field select{height:37px;border:1px solid #dfd6cf;background:white;border-radius:8px;padding:0 10px;outline:none;font-size:12px}.cc-platform-checks{display:flex;flex-wrap:wrap;gap:7px}.cc-platform-checks label{display:flex;align-items:center;gap:5px;padding:6px 8px;background:white;border:1px solid #e7ded7;border-radius:8px;text-transform:none;letter-spacing:0;font-weight:500}.cc-modal-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:18px}.cc-modal-secondary,.cc-modal-primary{padding:8px 14px;border-radius:9px;font-size:11px}.cc-modal-secondary{border:1px solid #ddd2c9;background:white}.cc-modal-primary{background:#d97857;color:white}.cc-details-list{display:grid;grid-template-columns:110px 1fr;gap:9px;font-size:12px}.cc-details-list dt{color:#8b7a70}.cc-details-list dd{margin:0;font-weight:600}.cc-filter-empty{display:flex;align-items:center;justify-content:center;gap:10px;padding:8px 18px 0;color:#8d7b71;font-size:11px}.cc-clear-filters{color:#bc684d;text-decoration:underline}
@media(max-width:1150px){.cc-pipeline-page{min-width:1020px}.cc-pipeline-header{flex-direction:column}.cc-pipeline-header-right{width:100%;gap:10px}.cc-pipeline-meta{align-self:flex-end}.cc-pipeline-board{grid-template-columns:repeat(4,205px)}.cc-pipeline-search{min-width:180px}.cc-pipeline-column{min-height:560px}}
`;

function PlatformIcon({ platform, size = 12 }: { platform: Platform; size?: number }) {
  if (platform === 'instagram') return <span className="cc-social instagram"><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg></span>;
  if (platform === 'tiktok') return <span className="cc-social tiktok"><Music2 size={size} strokeWidth={2.8} /></span>;
  if (platform === 'youtube') return <span className="cc-social youtube"><svg width={size + 1} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><path d="m9.75 15.02 5.75-3.02-5.75-3.02z" fill="white"/></svg></span>;
  return <span className="cc-social pinterest" style={{ fontSize: size + 2 }}>P</span>;
}

function Thumbnail({ item, className = 'cc-pipeline-thumb' }: { item: PipelineItem; className?: string }) {
  const source = item.thumbnail.source ?? 'pipeline';
  return <div className={`${className} cc-pipeline-thumb-${source}`} aria-hidden="true" />;
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function TypePill({ item }: { item: PipelineItem }) {
  const label = item.badgeLabel ?? item.contentType;
  const cls = label === 'Lifestyle' ? 'Lifestyle' : item.contentType;
  return <span className={`cc-type-pill cc-type-${cls}`}>{label}</span>;
}

function Progress({ item }: { item: PipelineItem }) {
  const stage = STAGES.find(candidate => candidate.id === item.stage)!;
  return (
    <div className="cc-pipeline-progress">
      <span className="cc-progress-dot done"><Check size={6} strokeWidth={3} /></span>
      <span className="cc-progress-label">{stage.progress}</span>
      {Array.from({ length: item.checklistTotal }, (_, index) => (
        <span key={index} className={`cc-progress-dot${index < item.checklistComplete ? ' done' : ''}`}>
          {index < item.checklistComplete && <Check size={6} strokeWidth={3} />}
        </span>
      ))}
      <span className="cc-progress-count">{item.checklistComplete}/{item.checklistTotal}</span>
    </div>
  );
}

function PipelineCard({
  item, index, draggingId, onDragStart, onDragEnd, onDrop, onOpen, onKeyboardMove,
}: {
  item: PipelineItem; index: number; draggingId: string | null;
  onDragStart: (id: string) => void; onDragEnd: () => void;
  onDrop: (id: string, stage: PipelineStage, index: number) => void;
  onOpen: (item: PipelineItem) => void;
  onKeyboardMove: (item: PipelineItem, event: KeyboardEvent<HTMLDivElement>) => void;
}) {
  return (
    <div
      className={`cc-pipeline-card${draggingId === item.id ? ' is-dragging' : ''}`}
      draggable
      tabIndex={0}
      role="button"
      aria-label={`${item.title}. Drag to move, or use Control and arrow keys.`}
      onDragStart={(event) => { event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', item.id); onDragStart(item.id); }}
      onDragEnd={onDragEnd}
      onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; }}
      onDrop={(event) => { event.preventDefault(); event.stopPropagation(); onDrop(event.dataTransfer.getData('text/plain'), item.stage, index); }}
      onDoubleClick={() => onOpen(item)}
      onKeyDown={(event) => onKeyboardMove(item, event)}
    >
      <Thumbnail item={item} />
      <div className="cc-pipeline-card-body">
        <div className="cc-pipeline-card-top">
          <div className="cc-pipeline-card-title">{item.title}</div>
          <button className="cc-pipeline-more" aria-label={`Open ${item.title}`} onClick={() => onOpen(item)}><MoreHorizontal size={13} /></button>
        </div>
        <div className="cc-pipeline-card-meta">
          <div className="cc-pipeline-socials">{item.platforms.map(platform => <PlatformIcon key={platform} platform={platform} />)}</div>
          <TypePill item={item} />
        </div>
        <div className="cc-pipeline-card-date"><CalendarDays size={10} />{formatDate(item.scheduledDate)}</div>
        <Progress item={item} />
      </div>
    </div>
  );
}

function SelectFilter({ value, label, onChange, children }: { value: string; label: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return (
    <div className="cc-pipeline-select-wrap">
      <select className="cc-pipeline-select" aria-label={label} value={value} onChange={event => onChange(event.target.value)}>{children}</select>
      <ChevronDown size={11} />
    </div>
  );
}

function AddPipelineModal({ onClose }: { onClose: () => void }) {
  const addItem = useContentCalendarStore(state => state.addPipelineItem);
  const [title, setTitle] = useState('');
  const [stage, setStage] = useState<PipelineStage>('ideas');
  const [contentType, setContentType] = useState<PostType>('Reel');
  const [campaign, setCampaign] = useState('Spring Launch');
  const [scheduledDate, setScheduledDate] = useState('2025-04-27');
  const [scheduledTime, setScheduledTime] = useState('10:00');
  const [platforms, setPlatforms] = useState<Platform[]>(['instagram']);
  const [thumbnailIndex, setThumbnailIndex] = useState(1);

  function togglePlatform(platform: Platform) {
    setPlatforms(current => current.includes(platform) ? current.filter(item => item !== platform) : [...current, platform]);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() || platforms.length === 0) return;
    addItem({
      title: title.trim(), stage, platforms, contentType, campaign, scheduledDate, scheduledTime,
      thumbnail: THUMBNAILS[thumbnailIndex], checklistComplete: stage === 'published' ? 3 : 1,
      checklistTotal: 3,
    });
    onClose();
  }

  return (
    <div className="cc-pipeline-overlay" role="presentation" onMouseDown={event => event.target === event.currentTarget && onClose()}>
      <form className="cc-pipeline-modal" onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="add-pipeline-title">
        <h2 id="add-pipeline-title">Add to pipeline</h2>
        <div className="cc-modal-grid">
          <div className="cc-field full"><label htmlFor="pipeline-title">Title</label><input id="pipeline-title" autoFocus required value={title} onChange={event => setTitle(event.target.value)} placeholder="What are you creating?" /></div>
          <div className="cc-field"><label htmlFor="pipeline-stage">Stage</label><select id="pipeline-stage" value={stage} onChange={event => setStage(event.target.value as PipelineStage)}>{STAGES.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></div>
          <div className="cc-field"><label htmlFor="pipeline-type">Content type</label><select id="pipeline-type" value={contentType} onChange={event => setContentType(event.target.value as PostType)}>{CONTENT_TYPES.map(type => <option key={type}>{type}</option>)}</select></div>
          <div className="cc-field"><label htmlFor="pipeline-campaign">Campaign</label><select id="pipeline-campaign" value={campaign} onChange={event => setCampaign(event.target.value)}>{['Spring Launch', 'Slow Living', 'Brand Story', 'Community'].map(item => <option key={item}>{item}</option>)}</select></div>
          <div className="cc-field"><label htmlFor="pipeline-thumbnail">Thumbnail</label><select id="pipeline-thumbnail" value={thumbnailIndex} onChange={event => setThumbnailIndex(Number(event.target.value))}>{THUMBNAILS.map((_, index) => <option key={index} value={index}>Image {index + 1}</option>)}</select></div>
          <div className="cc-field"><label htmlFor="pipeline-date">Publishing date</label><input id="pipeline-date" type="date" required value={scheduledDate} onChange={event => setScheduledDate(event.target.value)} /></div>
          <div className="cc-field"><label htmlFor="pipeline-time">Time</label><input id="pipeline-time" type="time" value={scheduledTime} onChange={event => setScheduledTime(event.target.value)} /></div>
          <div className="cc-field full"><label>Platforms</label><div className="cc-platform-checks">{PLATFORMS.map(platform => <label key={platform.id}><input type="checkbox" checked={platforms.includes(platform.id)} onChange={() => togglePlatform(platform.id)} />{platform.label}</label>)}</div></div>
        </div>
        <div className="cc-modal-actions"><button type="button" className="cc-modal-secondary" onClick={onClose}>Cancel</button><button type="submit" className="cc-modal-primary">Add item</button></div>
      </form>
    </div>
  );
}

function DetailsModal({ item, onClose }: { item: PipelineItem; onClose: () => void }) {
  const updateItem = useContentCalendarStore(state => state.updatePipelineItem);
  const openComposer = useContentCalendarStore(state => state.openComposer);
  return (
    <div className="cc-pipeline-overlay" role="presentation" onMouseDown={event => event.target === event.currentTarget && onClose()}>
      <div className="cc-pipeline-modal" role="dialog" aria-modal="true" aria-labelledby="pipeline-details-title">
        <h2 id="pipeline-details-title">{item.title}</h2>
        <dl className="cc-details-list">
          <dt>Stage</dt><dd><select value={item.stage} onChange={event => updateItem(item.id, { stage: event.target.value as PipelineStage })}>{STAGES.map(stage => <option key={stage.id} value={stage.id}>{stage.label}</option>)}</select></dd>
          <dt>Content type</dt><dd>{item.contentType}</dd>
          <dt>Campaign</dt><dd>{item.campaign}</dd>
          <dt>Platforms</dt><dd>{item.platforms.map(platform => PLATFORMS.find(option => option.id === platform)?.label).join(', ')}</dd>
          <dt>Publishing</dt><dd>{formatDate(item.scheduledDate)}{item.scheduledTime ? ` · ${item.scheduledTime}` : ''}</dd>
          <dt>Checklist</dt><dd>{item.checklistComplete} of {item.checklistTotal} complete</dd>
        </dl>
        <div className="cc-modal-actions"><button className="cc-modal-secondary" onClick={() => { onClose(); openComposer({ pipelineId: item.id, returnView: 'pipeline' }); }}>Edit post</button><button className="cc-modal-primary" onClick={onClose}>Done</button></div>
      </div>
    </div>
  );
}

export default function Pipeline() {
  const { pipelineItems, pipelineFilters, setPipelineFilters, clearPipelineFilters, movePipelineItem } = useContentCalendarStore();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<PipelineStage | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [detailsItem, setDetailsItem] = useState<PipelineItem | null>(null);

  const campaigns = useMemo(() => Array.from(new Set(pipelineItems.map(item => item.campaign))).sort(), [pipelineItems]);
  const filteredItems = useMemo(() => {
    const query = pipelineFilters.search.trim().toLowerCase();
    return pipelineItems.filter(item => {
      if (query && !`${item.title} ${item.campaign} ${item.contentType} ${item.badgeLabel ?? ''} ${item.platforms.join(' ')}`.toLowerCase().includes(query)) return false;
      if (pipelineFilters.platform !== 'all' && !item.platforms.includes(pipelineFilters.platform)) return false;
      if (pipelineFilters.contentType !== 'all' && item.contentType !== pipelineFilters.contentType) return false;
      if (pipelineFilters.campaign !== 'all' && item.campaign !== pipelineFilters.campaign) return false;
      if (pipelineFilters.stage !== 'all' && item.stage !== pipelineFilters.stage) return false;
      return true;
    });
  }, [pipelineItems, pipelineFilters]);

  const nextItem = useMemo(() => pipelineItems.find(item => item.featuredSlot && item.stage !== 'published') ?? pipelineItems
    .filter(item => item.stage !== 'published')
    .sort((a, b) => `${a.scheduledDate}${a.scheduledTime ?? ''}`.localeCompare(`${b.scheduledDate}${b.scheduledTime ?? ''}`))[0], [pipelineItems]);
  const hasFilters = Object.entries(pipelineFilters).some(([key, value]) => key === 'search' ? Boolean(value) : value !== 'all');

  function drop(id: string, stage: PipelineStage, index: number) {
    if (id) movePipelineItem(id, stage, index);
    setDraggingId(null);
    setOverStage(null);
  }

  function keyboardMove(item: PipelineItem, event: KeyboardEvent<HTMLDivElement>) {
    if (!event.ctrlKey && !event.metaKey) return;
    const stageIndex = STAGES.findIndex(stage => stage.id === item.stage);
    const siblings = pipelineItems.filter(candidate => candidate.stage === item.stage).sort((a, b) => a.order - b.order);
    if (event.key === 'ArrowLeft' && stageIndex > 0) { event.preventDefault(); movePipelineItem(item.id, STAGES[stageIndex - 1].id, 0); }
    if (event.key === 'ArrowRight' && stageIndex < STAGES.length - 1) { event.preventDefault(); movePipelineItem(item.id, STAGES[stageIndex + 1].id, 0); }
    if (event.key === 'ArrowUp') { event.preventDefault(); movePipelineItem(item.id, item.stage, Math.max(0, siblings.findIndex(candidate => candidate.id === item.id) - 1)); }
    if (event.key === 'ArrowDown') { event.preventDefault(); movePipelineItem(item.id, item.stage, Math.min(siblings.length - 1, siblings.findIndex(candidate => candidate.id === item.id) + 1)); }
    if (event.key === 'Enter') setDetailsItem(item);
  }

  return (
    <div className="cc-pipeline-page">
      <style>{PIPELINE_CSS}</style>
      <header className="cc-pipeline-header">
        <div>
          <h1 className="cc-pipeline-heading">Move ideas<br /><span className="cc-pipeline-heading-row">into motion. <Sparkles className="cc-pipeline-star" size={27} /></span></h1>
          <span className="cc-pipeline-swoop" />
        </div>
        <div className="cc-pipeline-header-right">
          <div className="cc-pipeline-meta"><div className="cc-pipeline-date">Apr 21 – Apr 27, 2025 <CalendarDays size={13} /></div><div className="cc-pipeline-local"><MapPin size={11} fill="currentColor" /> Local only</div></div>
          <div className="cc-pipeline-toolbar">
            <label className="cc-pipeline-search"><Search size={13} /><input aria-label="Search pipeline" value={pipelineFilters.search} onChange={event => setPipelineFilters({ search: event.target.value })} placeholder="Search posts, ideas, or hashtags..." /></label>
            <SelectFilter label="Platform" value={pipelineFilters.platform} onChange={value => setPipelineFilters({ platform: value as Platform | 'all' })}><option value="all">All platforms</option>{PLATFORMS.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</SelectFilter>
            <SelectFilter label="Content type" value={pipelineFilters.contentType} onChange={value => setPipelineFilters({ contentType: value as PostType | 'all' })}><option value="all">All content types</option>{CONTENT_TYPES.map(item => <option key={item}>{item}</option>)}</SelectFilter>
            <SelectFilter label="Campaign" value={pipelineFilters.campaign} onChange={value => setPipelineFilters({ campaign: value })}><option value="all">All campaigns</option>{campaigns.map(item => <option key={item}>{item}</option>)}</SelectFilter>
            <SelectFilter label="Stage" value={pipelineFilters.stage} onChange={value => setPipelineFilters({ stage: value as PipelineStage | 'all' })}><option value="all">All statuses</option>{STAGES.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</SelectFilter>
            <button className="cc-pipeline-add" onClick={() => setShowAdd(true)}><Plus size={14} />Add to pipeline</button>
          </div>
        </div>
      </header>
      <div className="cc-pipeline-layout">
        <main className="cc-pipeline-board">
          {STAGES.map(stage => {
            const items = filteredItems.filter(item => item.stage === stage.id).sort((a, b) => a.order - b.order);
            const total = pipelineItems.filter(item => item.stage === stage.id).length;
            const Icon = stage.icon;
            return (
              <section
                key={stage.id}
                className={`cc-pipeline-column${overStage === stage.id ? ' is-over' : ''}`}
                style={{ background: stage.bg }}
                onDragOver={(event: DragEvent) => { event.preventDefault(); setOverStage(stage.id); }}
                onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setOverStage(null); }}
                onDrop={event => { event.preventDefault(); drop(event.dataTransfer.getData('text/plain'), stage.id, items.length); }}
              >
                <div className="cc-pipeline-column-head"><Icon className="cc-pipeline-column-icon" size={22} color={stage.color} /><div><h2>{stage.label}</h2><div className="cc-pipeline-title-line" style={{ background: stage.color }} /></div><span className="cc-pipeline-count">{total}</span></div>
                <div className="cc-pipeline-stack">
                  {items.map((item, index) => <PipelineCard key={item.id} item={item} index={index} draggingId={draggingId} onDragStart={setDraggingId} onDragEnd={() => { setDraggingId(null); setOverStage(null); }} onDrop={drop} onOpen={setDetailsItem} onKeyboardMove={keyboardMove} />)}
                  {!items.length && <div className="cc-pipeline-empty">Drop an item here</div>}
                </div>
              </section>
            );
          })}
        </main>
        <aside className="cc-pipeline-aside">
          {nextItem && <div className="cc-next-card"><Send size={22} color="#df7753" /><h3>Next publishing slot</h3><div className="cc-next-underline" /><div style={{ height: 12 }} /><Thumbnail item={nextItem} className="cc-next-thumb" /><div className="cc-next-title">{nextItem.title}</div><div className="cc-next-platforms">{nextItem.platforms.map(platform => <PlatformIcon key={platform} platform={platform} size={14} />)}</div><TypePill item={nextItem} /><div className="cc-next-date"><CalendarDays size={10} />{formatDate(nextItem.scheduledDate)}{nextItem.scheduledTime ? ` · ${nextItem.scheduledTime}` : ''}</div><button className="cc-view-details" onClick={() => setDetailsItem(nextItem)}>View details →</button></div>}
          <div className="cc-note"><span>Short, focused content creates lasting impact.</span><div className="cc-note-line" /><Sparkles size={17} /></div>
        </aside>
      </div>
      {hasFilters && <div className="cc-filter-empty">Showing {filteredItems.length} of {pipelineItems.length} items <button className="cc-clear-filters" onClick={clearPipelineFilters}>Clear filters</button></div>}
      {showAdd && <AddPipelineModal onClose={() => setShowAdd(false)} />}
      {detailsItem && <DetailsModal item={pipelineItems.find(item => item.id === detailsItem.id) ?? detailsItem} onClose={() => setDetailsItem(null)} />}
    </div>
  );
}
