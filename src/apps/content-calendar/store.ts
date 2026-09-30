import { create } from 'zustand';
import type {
  ComposerChecklist, ComposerDraft, ContentCalendarView, ContentPost, Draft,
  AnalyticsPerformanceRecord, Campaign, ContentTemplate, IdeaItem, PipelineFilters, PipelineItem, PipelineStage,
  Platform, PlatformSlot, ContentCalendarAccent, ContentCalendarSettings, ContentCalendarTheme,
} from './types';
import { getActivePlatformIds, getPlatformConfig } from './platformConfig';
import { clearMediaStorage, recalculateMediaUsage } from './mediaStorage';
import {
  LEGACY_ACCENT_STORAGE_KEY,
  LEGACY_THEME_STORAGE_KEY,
  SETTINGS_STORAGE_KEY,
  normalizeContentCalendarSettings,
  readContentCalendarSettings,
  writeContentCalendarSettings,
} from './settings';
import type { ScheduleCsvRecord } from './workspaceTransfer';

interface ContentCalendarStore {
  userName: string;
  setUserName: (name: string) => void;
  activeView: ContentCalendarView;
  setActiveView: (v: ContentCalendarView) => void;
  composerDrafts: ComposerDraft[];
  activeComposerId: string | null;
  composerReturnView: ContentCalendarView;
  openComposer: (options?: { postType?: ComposerDraft['postType']; pipelineId?: string; returnView?: ContentCalendarView; resumeLatest?: boolean; publishDate?: string; platforms?: Platform[]; sourcePost?: ContentPost; sourceTemplate?: ContentTemplate }) => void;
  closeComposer: () => void;
  saveComposerDraft: (draft: ComposerDraft) => ComposerDraft;
  scheduleComposer: (draft: ComposerDraft) => ComposerDraft;
  deletePost: (id: string) => void;
  movePost: (id: string, newDate: string) => void;
  campaigns: Campaign[];
  addCampaign: (campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) => Campaign;
  updateCampaign: (id: string, updates: Partial<Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteCampaign: (id: string) => void;
  templates: ContentTemplate[];
  addTemplate: (template: Omit<ContentTemplate, 'id' | 'createdAt' | 'updatedAt'>) => ContentTemplate;
  updateTemplate: (id: string, updates: Partial<Omit<ContentTemplate, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteTemplate: (id: string) => void;
  duplicateTemplate: (id: string) => ContentTemplate | undefined;
  useTemplate: (id: string) => void;
  performanceRecords: AnalyticsPerformanceRecord[];
  addPerformanceRecord: (record: Omit<AnalyticsPerformanceRecord, 'id' | 'createdAt' | 'updatedAt' | 'source'>) => AnalyticsPerformanceRecord;
  updatePerformanceRecord: (id: string, updates: Partial<Omit<AnalyticsPerformanceRecord, 'id' | 'createdAt' | 'updatedAt' | 'source'>>) => void;
  deletePerformanceRecord: (id: string) => void;
  removeMediaReferences: (id: string) => void;
  clearWorkspaceData: () => Promise<void>;

  weekOf: string;
  currentMonth: string;
  setCurrentMonth: (m: string) => void;
  posts: ContentPost[];
  drafts: Draft[];
  ideas: IdeaItem[];
  addIdea: (idea: Omit<IdeaItem, 'id'>) => void;
  updateIdea: (id: string, updates: Partial<Omit<IdeaItem, 'id'>>) => void;
  deleteIdea: (id: string) => void;
  convertIdeaToPipeline: (id: string) => void;
  stats: { planned: number; scheduled: number; published: number; ideas: number };

  pipelineItems: PipelineItem[];
  pipelineFilters: PipelineFilters;
  setPipelineFilters: (filters: Partial<PipelineFilters>) => void;
  clearPipelineFilters: () => void;
  addPipelineItem: (item: Omit<PipelineItem, 'id' | 'order'>) => void;
  updatePipelineItem: (id: string, updates: Partial<Omit<PipelineItem, 'id'>>) => void;
  deletePipelineItem: (id: string) => void;
  movePipelineItem: (id: string, stage: PipelineStage, index: number) => void;
  importScheduleRecords: (records: ScheduleCsvRecord[]) => void;

  settings: ContentCalendarSettings;
  updateSettings: (updates: Partial<ContentCalendarSettings>) => void;
  recordSuccessfulBackup: () => void;
  dismissBackupReminder: () => void;
  reloadWorkspaceData: () => void;
  theme: ContentCalendarTheme;
  accent: string;
  setTheme: (theme: ContentCalendarTheme) => void;
  setAccent: (accent: ContentCalendarAccent) => void;
}

const PIPELINE_STORAGE_KEY = 'content-edit.pipeline.v2';
const LEGACY_PIPELINE_STORAGE_KEY = 'content-edit.pipeline.v1';
const IDEAS_STORAGE_KEY = 'content-edit.ideas.v1';
const COMPOSER_STORAGE_KEY = 'content-edit.composer.v1';
const COMPOSER_POSTS_STORAGE_KEY = 'content-edit.composer-posts.v1';
const CAMPAIGNS_STORAGE_KEY = 'content-edit.campaigns.v2';
const LEGACY_CAMPAIGNS_STORAGE_KEY = 'content-edit.campaigns.v1';
const TEMPLATES_STORAGE_KEY = 'content-edit.templates.v1';
const TEMPLATES_V2_STORAGE_KEY = 'content-edit.templates.v2';
const ANALYTICS_STORAGE_KEY = 'content-edit.analytics.v1';
const DEFAULT_PIPELINE_FILTERS: PipelineFilters = {
  search: '', platform: 'all', contentType: 'all', campaign: 'all', stage: 'all',
};

function readCampaigns(): Campaign[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = window.localStorage.getItem(CAMPAIGNS_STORAGE_KEY);
    const legacy = current === null ? window.localStorage.getItem(LEGACY_CAMPAIGNS_STORAGE_KEY) : null;
    const parsed = JSON.parse(current ?? legacy ?? '[]');
    const seededIds = new Set(['spring-launch', 'weekly-newsletter', 'behind-brand', 'brand-story', 'slow-living', 'community']);
    const campaigns = Array.isArray(parsed) ? parsed.filter(item => item && typeof item.id === 'string' && !seededIds.has(item.id)) : [];
    window.localStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify(campaigns));
    return campaigns;
  } catch { return []; }
}

function persistCampaigns(campaigns: Campaign[]) {
  if (typeof window !== 'undefined') window.localStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify(campaigns));
}

function readTemplates(): ContentTemplate[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = window.localStorage.getItem(TEMPLATES_V2_STORAGE_KEY);
    if (current !== null) {
      const parsed = JSON.parse(current);
      const normalized = Array.isArray(parsed) ? parsed.filter(item => item && typeof item.id === 'string' && !isSeededTemplateId(item.id)).map(normalizeTemplateRecord) : [];
      persistTemplates(normalized);
      return normalized;
    }
    const legacy = JSON.parse(window.localStorage.getItem(TEMPLATES_STORAGE_KEY) ?? '[]');
    const source = Array.isArray(legacy) ? legacy.filter(item => item && typeof item.id === 'string') : [];
    const migrated = source.flatMap(item => {
      const platforms = Array.isArray(item.platforms) ? item.platforms.filter(Boolean) : [item.platform].filter(Boolean);
      return platforms.length ? platforms.map((platform: Platform, index: number) => normalizeTemplateRecord({ ...item, id: platforms.length === 1 ? item.id : `${item.id}-${platform}-${index}`, name: platforms.length === 1 ? item.name : `${item.name} · ${platform}`, platform })) : [];
    }).filter(item => !isSeededTemplateId(item.id));
    window.localStorage.setItem(TEMPLATES_V2_STORAGE_KEY, JSON.stringify(migrated));
    return migrated;
  } catch { return []; }
}

function isSeededTemplateId(id: unknown) {
  return typeof id === 'string' && (/^template-demo/i.test(id) || /^t(?:[1-9]|1[0-2])$/i.test(id));
}

function normalizeTemplateRecord(item: Record<string, unknown>): ContentTemplate {
  const platform = typeof item.platform === 'string' ? item.platform : getActivePlatformIds()[0] ?? 'instagram';
  const postTypes = getPlatformConfig(platform).postTypes;
  const requestedType = typeof item.postType === 'string' ? item.postType : '';
  const postType = postTypes.some(type => type.id === requestedType) ? requestedType : postTypes[0]?.id ?? 'Post';
  const checklist = item.checklist && typeof item.checklist === 'object' ? item.checklist as Partial<ComposerChecklist> : {};
  const now = new Date().toISOString();
  return {
    id: String(item.id),
    name: typeof item.name === 'string' ? item.name : 'Untitled template',
    description: typeof item.description === 'string' ? item.description : '',
    platform,
    postType,
    hook: typeof item.hook === 'string' ? item.hook : '',
    body: typeof item.body === 'string' ? item.body : '',
    cta: typeof item.cta === 'string' ? item.cta : '',
    hashtags: Array.isArray(item.hashtags) ? item.hashtags.map(String).map(tag => tag.replace(/^#+/, '').trim()).filter(Boolean) : [],
    mediaIds: Array.isArray(item.mediaIds) ? item.mediaIds.filter((id): id is string => typeof id === 'string') : [],
    checklist: {
      captionOnBrand: Boolean(checklist.captionOnBrand),
      hashtagsRelevant: Boolean(checklist.hashtagsRelevant),
      mediaHighQuality: Boolean(checklist.mediaHighQuality),
      altTextAdded: Boolean(checklist.altTextAdded),
      firstCommentIncluded: Boolean(checklist.firstCommentIncluded),
      ctaClear: Boolean(checklist.ctaClear),
    },
    createdAt: typeof item.createdAt === 'string' ? item.createdAt : now,
    updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : now,
    archived: Boolean(item.archived),
  };
}

function persistTemplates(templates: ContentTemplate[]) {
  if (typeof window !== 'undefined') window.localStorage.setItem(TEMPLATES_V2_STORAGE_KEY, JSON.stringify(templates));
}

// Hashtag sets were a separate page-level entity. Remove only that legacy key;
// hashtag arrays inside Composer drafts, posts, and templates are preserved.
if (typeof window !== 'undefined') window.localStorage.removeItem('content-edit.hashtags.v1');

function readPerformanceRecords(): AnalyticsPerformanceRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(ANALYTICS_STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter(item => item && typeof item.id === 'string' && typeof item.postId === 'string').map(item => ({ ...item, views: Math.max(0, Number(item.views) || 0), likes: Math.max(0, Number(item.likes) || 0), comments: Math.max(0, Number(item.comments) || 0), saves: Math.max(0, Number(item.saves) || 0), shares: Math.max(0, Number(item.shares) || 0), clicks: Math.max(0, Number(item.clicks) || 0), note: typeof item.note === 'string' ? item.note : '', source: 'manual' as const, createdAt: item.createdAt ?? new Date().toISOString(), updatedAt: item.updatedAt ?? new Date().toISOString() })) as AnalyticsPerformanceRecord[] : [];
  } catch { return []; }
}

function persistPerformanceRecords(records: AnalyticsPerformanceRecord[]) {
  if (typeof window !== 'undefined') window.localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(records));
}

// Legacy sample declarations remain only for backwards source compatibility; runtime state is empty.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PIPELINE_SEED: PipelineItem[] = [
  { id: 'pi-1', title: 'Morning rituals, softer days', stage: 'ideas', order: 0, platforms: ['instagram', 'pinterest'], contentType: 'Carousel', badgeLabel: 'Lifestyle', campaign: 'Slow Living', scheduledDate: '2025-04-22', thumbnail: { x: 216, y: 175 }, checklistComplete: 1, checklistTotal: 3 },
  { id: 'pi-2', title: 'Small spaces, big mood', stage: 'ideas', order: 1, platforms: ['instagram', 'tiktok', 'youtube'], contentType: 'Reel', badgeLabel: 'Lifestyle', campaign: 'Spring Launch', scheduledDate: '2025-04-23', scheduledTime: '10:00', thumbnail: { x: 216, y: 276 }, checklistComplete: 2, checklistTotal: 3, featuredSlot: true },
  { id: 'pi-3', title: "Today's inspo", stage: 'ideas', order: 2, platforms: ['instagram', 'pinterest'], contentType: 'Story', campaign: 'Slow Living', scheduledDate: '2025-04-23', thumbnail: { x: 216, y: 369 }, checklistComplete: 1, checklistTotal: 3 },
  { id: 'pi-4', title: 'New on the blog', stage: 'ideas', order: 3, platforms: ['instagram', 'pinterest'], contentType: 'Static', campaign: 'Brand Story', scheduledDate: '2025-04-24', thumbnail: { x: 216, y: 447 }, checklistComplete: 1, checklistTotal: 3 },
  { id: 'pi-5', title: 'Golden hour in the city', stage: 'ideas', order: 4, platforms: ['instagram', 'pinterest'], contentType: 'Reel', campaign: 'Slow Living', scheduledDate: '2025-04-25', thumbnail: { x: 216, y: 523 }, checklistComplete: 2, checklistTotal: 3 },
  { id: 'pi-6', title: 'Color moodboard', stage: 'ideas', order: 5, platforms: ['pinterest'], contentType: 'Carousel', campaign: 'Spring Launch', scheduledDate: '2025-04-26', thumbnail: { x: 216, y: 605 }, checklistComplete: 1, checklistTotal: 3 },

  { id: 'pi-7', title: 'Weekend reset', stage: 'drafting', order: 0, platforms: ['instagram', 'tiktok'], contentType: 'Reel', campaign: 'Slow Living', scheduledDate: '2025-04-27', thumbnail: { x: 460, y: 175 }, checklistComplete: 2, checklistTotal: 3 },
  { id: 'pi-8', title: 'Behind the scenes: packaging', stage: 'drafting', order: 1, platforms: ['instagram', 'tiktok'], contentType: 'Story', campaign: 'Brand Story', scheduledDate: '2025-04-24', thumbnail: { x: 460, y: 276 }, checklistComplete: 1, checklistTotal: 3 },
  { id: 'pi-9', title: 'Wellness & Mindset', stage: 'drafting', order: 2, platforms: ['instagram', 'pinterest'], contentType: 'Carousel', campaign: 'Slow Living', scheduledDate: '2025-04-25', thumbnail: { x: 460, y: 378 }, checklistComplete: 1, checklistTotal: 3 },
  { id: 'pi-10', title: 'Product launch teaser', stage: 'drafting', order: 3, platforms: ['tiktok', 'youtube'], contentType: 'Reel', campaign: 'Spring Launch', scheduledDate: '2025-04-27', thumbnail: { x: 460, y: 475 }, checklistComplete: 2, checklistTotal: 3 },

  { id: 'pi-11', title: 'Brand values graphic', stage: 'ready', order: 0, platforms: ['instagram', 'pinterest'], contentType: 'Static', campaign: 'Brand Story', scheduledDate: '2025-04-22', thumbnail: { x: 688, y: 175 }, checklistComplete: 3, checklistTotal: 3 },
  { id: 'pi-12', title: 'Weekend plans', stage: 'ready', order: 1, platforms: ['instagram', 'tiktok'], contentType: 'Story', campaign: 'Slow Living', scheduledDate: '2025-04-24', thumbnail: { x: 688, y: 278 }, checklistComplete: 2, checklistTotal: 3 },
  { id: 'pi-13', title: 'Q&A session teaser', stage: 'ready', order: 2, platforms: ['instagram', 'youtube'], contentType: 'Reel', campaign: 'Brand Story', scheduledDate: '2025-04-25', thumbnail: { x: 688, y: 380 }, checklistComplete: 1, checklistTotal: 3 },

  { id: 'pi-14', title: 'Spring wardrobe picks', stage: 'published', order: 0, platforms: ['instagram', 'pinterest'], contentType: 'Carousel', campaign: 'Spring Launch', scheduledDate: '2025-04-21', thumbnail: { x: 913, y: 175 }, checklistComplete: 3, checklistTotal: 3 },
  { id: 'pi-15', title: 'Shoreline energy', stage: 'published', order: 1, platforms: ['tiktok', 'youtube'], contentType: 'Reel', campaign: 'Slow Living', scheduledDate: '2025-04-20', thumbnail: { x: 913, y: 278 }, checklistComplete: 3, checklistTotal: 3 },
  { id: 'pi-16', title: 'Brand story', stage: 'published', order: 2, platforms: ['instagram', 'pinterest'], contentType: 'Static', campaign: 'Brand Story', scheduledDate: '2025-04-18', thumbnail: { x: 913, y: 378 }, checklistComplete: 3, checklistTotal: 3 },
  { id: 'pi-17', title: 'New collection drop', stage: 'published', order: 3, platforms: ['instagram', 'pinterest'], contentType: 'Carousel', campaign: 'Spring Launch', scheduledDate: '2025-04-16', thumbnail: { x: 913, y: 477 }, checklistComplete: 3, checklistTotal: 3 },
  { id: 'pi-18', title: 'Community spotlight', stage: 'published', order: 4, platforms: ['instagram', 'tiktok'], contentType: 'Story', campaign: 'Community', scheduledDate: '2025-04-15', thumbnail: { x: 913, y: 574 }, checklistComplete: 3, checklistTotal: 3 },
  { id: 'pi-19', title: 'Sunday studio notes', stage: 'published', order: 5, platforms: ['instagram'], contentType: 'Static', campaign: 'Brand Story', scheduledDate: '2025-04-14', thumbnail: { x: 216, y: 175 }, checklistComplete: 3, checklistTotal: 3 },
];

function readPipelineItems(): PipelineItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = window.localStorage.getItem(PIPELINE_STORAGE_KEY) ?? window.localStorage.getItem(LEGACY_PIPELINE_STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved) as PipelineItem[];
    const items = Array.isArray(parsed) ? parsed.filter(item => item && typeof item.id === 'string' && !item.id.startsWith('pi-')).map(item => ({
      ...cleanLegacyMediaReferences(item) as PipelineItem,
      mediaIds: Array.isArray(item.mediaIds) ? item.mediaIds : [],
    })) : [];
    if (!window.localStorage.getItem(PIPELINE_STORAGE_KEY)) window.localStorage.setItem(PIPELINE_STORAGE_KEY, JSON.stringify(items));
    return items;
  } catch {
    return [];
  }
}

function persistPipelineItems(items: PipelineItem[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PIPELINE_STORAGE_KEY, JSON.stringify(items));
}

function cleanLegacyMediaReferences(value: unknown): unknown {
  if (Array.isArray(value)) return value.filter(item => !(typeof item === 'string' && item.startsWith('seed-media-'))).map(cleanLegacyMediaReferences);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).flatMap(([key, child]) => {
    if (key === 'mediaId' && typeof child === 'string' && child.startsWith('seed-media-')) return [];
    return [[key, cleanLegacyMediaReferences(child)]];
  }));
  return value;
}

function normalizeOrders(items: PipelineItem[]): PipelineItem[] {
  const stages: PipelineStage[] = ['ideas', 'drafting', 'ready', 'published'];
  return stages.flatMap(stage => items
    .filter(item => item.stage === stage)
    .sort((a, b) => a.order - b.order)
    .map((item, order) => ({ ...item, order })));
}

function pipelineStagePostStatus(stage: PipelineStage): ContentPost['status'] {
  if (stage === 'published') return 'Published';
  if (stage === 'ready') return 'Scheduled';
  if (stage === 'drafting') return 'Draft';
  return 'Planned';
}

function syncPipelinePosts(posts: ContentPost[], item: PipelineItem): ContentPost[] {
  const status = pipelineStagePostStatus(item.stage);
  return posts.map(post => (
    post.pipelineId === item.id || (item.composerId && post.composerId === item.composerId)
      ? { ...post, status }
      : post
  ));
}

function readComposerDrafts(): ComposerDraft[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(COMPOSER_STORAGE_KEY) ?? '[]') as ComposerDraft[];
    return Array.isArray(parsed) ? parsed.map(item => cleanLegacyMediaReferences(item) as ComposerDraft) : [];
  } catch { return []; }
}

function persistComposerDrafts(drafts: ComposerDraft[]) {
  if (typeof window !== 'undefined') window.localStorage.setItem(COMPOSER_STORAGE_KEY, JSON.stringify(drafts));
}

function readComposerPosts(): ContentPost[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(COMPOSER_POSTS_STORAGE_KEY) ?? '[]') as ContentPost[];
    if (!Array.isArray(parsed)) return [];
    // For posts sharing a pipelineId, keep only the last (most recently added = up-to-date)
    const lastIdx = new Map<string, number>();
    parsed.forEach((p, i) => { if (p.pipelineId) lastIdx.set(p.pipelineId, i); });
    const deduped = parsed.filter((p, i) => !p.pipelineId || lastIdx.get(p.pipelineId) === i);
    // Permanently remove old duplicates from localStorage
    if (deduped.length < parsed.length) {
      window.localStorage.setItem(COMPOSER_POSTS_STORAGE_KEY, JSON.stringify(deduped));
    }
    return deduped;
  } catch { return []; }
}

function persistComposerPosts(posts: ContentPost[]) {
  if (typeof window !== 'undefined') window.localStorage.setItem(COMPOSER_POSTS_STORAGE_KEY, JSON.stringify(posts));
}

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function currentWeekStartKey() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());
  return localDateKey(start);
}

function composerTemplate(postType: ComposerDraft['postType'] = 'Reel', options: { publishDate?: string; platforms?: Platform[] } = {}): ComposerDraft {
  const now = new Date().toISOString();
  const firstActivePlatform = getActivePlatformIds()[0];
  const platforms = options.platforms?.length ? options.platforms : (firstActivePlatform ? [firstActivePlatform] : ['instagram']);
  return {
    id: `composer-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    postType, platforms: platforms.length ? platforms : ['instagram'],
    caption: "Small spaces, big mood ✨\nThis corner proves that good design doesn’t need a lot — just the right pieces. #SmallSpaceBigDreams",
    hashtags: ['smallspace', 'homedecor', 'interiorinspo', 'apartmentliving'],
    altText: 'Cozy coffee table with a ceramic mug, book, and neutral textile.',
    publishDate: options.publishDate ?? localDateKey(), publishTime: '10:00', hook: 'Small spaces, big mood ✨',
    cta: '', mediaIds: [],
    firstComment: 'Which detail is your favorite? 💛',
    checklist: { captionOnBrand: false, hashtagsRelevant: false, mediaHighQuality: false, altTextAdded: false, firstCommentIncluded: false, ctaClear: false },
    status: 'working', createdAt: now, updatedAt: now,
  };
}

function composerTitle(draft: ComposerDraft) {
  const slot = composerPrimarySlot(draft);
  const headline = (slot?.extras.headline as string | undefined)?.trim();
  const title = headline || slot?.hook || slot?.caption.split('\n')[0] || draft.hook || draft.caption.split('\n')[0] || 'Untitled post';
  return title.replaceAll('✨', '').replaceAll('💛', '').trim() || 'Untitled post';
}

function contentSlotKey(platform: Platform, postType: string) {
  return `${platform}::${postType}`;
}

function selectedSlotForPlatform(draft: ComposerDraft, platform: Platform): PlatformSlot | undefined {
  const selectedType = draft.platformSlots?.[platform]?.postType ?? draft.postType;
  return draft.contentSlots?.[contentSlotKey(platform, selectedType)]
    ?? draft.platformSlots?.[platform]
    ?? (platform === draft.platforms[0] ? {
      postType: draft.postType,
      caption: draft.caption,
      hashtags: draft.hashtags,
      altText: draft.altText,
      hook: draft.hook,
      cta: draft.cta,
      mediaIds: draft.mediaIds,
      firstComment: draft.firstComment,
      extras: draft.platformExtras ?? {},
      previewDesign: draft.previewDesign,
      previewDesigns: draft.previewDesigns,
    } : undefined);
}

function composerPrimarySlot(draft: ComposerDraft): PlatformSlot | undefined {
  return draft.platforms
    .map(platform => selectedSlotForPlatform(draft, platform))
    .find(slot => Boolean(slot && ((slot.extras.headline as string | undefined)?.trim() || slot.hook.trim() || slot.caption.trim() || slot.mediaIds.length)))
    ?? selectedSlotForPlatform(draft, draft.platforms[0] ?? 'instagram');
}

function composerSlotTitle(slot: PlatformSlot | undefined): string {
  if (!slot) return '';
  const headline = (slot.extras.headline as string | undefined)?.trim();
  return (headline || slot.hook || slot.caption.split('\n')[0] || '').replaceAll('✨', '').replaceAll('💛', '').trim();
}

function composerContentType(draft: ComposerDraft) {
  const slot = composerPrimarySlot(draft);
  if (!slot) return draft.postType;
  const slotTypes = new Set(draft.platforms.map(platform => selectedSlotForPlatform(draft, platform)?.postType ?? draft.postType));
  return slotTypes.size > 1 ? 'Multi-platform' : slot.postType;
}

function composerMediaIds(draft: ComposerDraft) {
  return composerPrimarySlot(draft)?.mediaIds ?? draft.mediaIds;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DEMO_POSTS: ContentPost[] = [
  // Week of Apr 21–27 (shown in "This Week's Posts" sidebar)
  {
    id: 'p1',
    title: 'Morning rituals, softer days',
    type: 'Carousel',
    status: 'Scheduled',
    date: '2025-04-21',
    platforms: ['instagram', 'pinterest'],
    category: 'Lifestyle',
    thumbnailBg: '#d4bfb0',
    imageCount: 3,
  },
  {
    id: 'p2',
    title: 'Small spaces, big mood',
    type: 'Reel',
    status: 'Scheduled',
    date: '2025-04-22',
    platforms: ['instagram', 'tiktok', 'youtube'],
    category: 'Lifestyle',
    thumbnailBg: '#b8a898',
    duration: '15s',
  },
  {
    id: 'p3',
    title: "Today's inspo",
    type: 'Story',
    status: 'Planned',
    date: '2025-04-23',
    platforms: ['instagram', 'tiktok'],
    category: 'Behind the scenes',
    thumbnailBg: '#c8b8a8',
    duration: '1–3 frames',
  },
  {
    id: 'p4',
    title: 'New on the blog',
    type: 'Static',
    status: 'Scheduled',
    date: '2025-04-24',
    platforms: ['instagram', 'pinterest'],
    category: 'Announcement',
    thumbnailBg: '#e8d8c8',
    imageCount: 1,
  },
  {
    id: 'p5',
    title: 'Golden hour in the city',
    type: 'Reel',
    status: 'Planned',
    date: '2025-04-25',
    platforms: ['instagram', 'tiktok'],
    category: 'Lifestyle',
    thumbnailBg: '#c8a878',
    duration: '12s',
  },
  {
    id: 'p6',
    title: 'Color moodboard',
    type: 'Carousel',
    status: 'Scheduled',
    date: '2025-04-26',
    platforms: ['instagram', 'pinterest'],
    category: 'Inspiration',
    thumbnailBg: '#d8b8a0',
    imageCount: 4,
  },
  {
    id: 'p7',
    title: 'Weekend reset',
    type: 'Story',
    status: 'Planned',
    date: '2025-04-27',
    platforms: ['instagram', 'tiktok'],
    category: 'Lifestyle',
    thumbnailBg: '#c0b0a8',
    duration: '1–3 frames',
  },
  // Earlier April posts for calendar grid
  {
    id: 'p8',
    title: 'Morning rituals, softer days',
    type: 'Reel',
    status: 'Scheduled',
    date: '2025-04-02',
    platforms: ['instagram', 'tiktok', 'youtube'],
    category: 'Lifestyle',
    thumbnailBg: '#d8c8b8',
    duration: '12s',
  },
  {
    id: 'p9',
    title: 'Small spaces, big mood',
    type: 'Carousel',
    status: 'Planned',
    date: '2025-04-03',
    platforms: ['instagram', 'pinterest'],
    category: 'Interior',
    thumbnailBg: '#b8c8d8',
    imageCount: 3,
  },
  {
    id: 'p10',
    title: 'Weekend reset',
    type: 'Story',
    status: 'Planned',
    date: '2025-04-05',
    platforms: ['instagram', 'tiktok'],
    category: 'Lifestyle',
    thumbnailBg: '#d0c8c0',
    duration: '1–3 frames',
  },
  {
    id: 'p11',
    title: 'New on the blog',
    type: 'Static',
    status: 'Planned',
    date: '2025-04-07',
    platforms: ['instagram'],
    category: 'Content',
    thumbnailBg: '#e8d8c8',
    imageCount: 1,
  },
  {
    id: 'p12',
    title: 'Golden hour in the city',
    type: 'Reel',
    status: 'Scheduled',
    date: '2025-04-08',
    platforms: ['instagram', 'tiktok', 'youtube'],
    category: 'Lifestyle',
    thumbnailBg: '#d8a870',
    duration: '15s',
  },
  {
    id: 'p13',
    title: 'Q&A session highlights',
    type: 'Carousel',
    status: 'Scheduled',
    date: '2025-04-10',
    platforms: ['instagram'],
    category: 'Engagement',
    thumbnailBg: '#c8c0d8',
    imageCount: 5,
  },
  {
    id: 'p14',
    title: 'Behind the scenes',
    type: 'Story',
    status: 'Planned',
    date: '2025-04-11',
    platforms: ['instagram'],
    category: 'BTS',
    thumbnailBg: '#c0b8b0',
    duration: '1–3 frames',
  },
  {
    id: 'p15',
    title: 'Brand values',
    type: 'Static',
    status: 'Published',
    date: '2025-04-14',
    platforms: ['instagram'],
    category: 'Brand',
    thumbnailBg: '#d8d0c8',
    imageCount: 1,
  },
  {
    id: 'p16',
    title: 'Weekend plans',
    type: 'Carousel',
    status: 'Planned',
    date: '2025-04-16',
    platforms: ['instagram', 'tiktok'],
    category: 'Lifestyle',
    thumbnailBg: '#c0c8d0',
    imageCount: 4,
  },
  {
    id: 'p17',
    title: 'New collection drop',
    type: 'Reel',
    status: 'Scheduled',
    date: '2025-04-18',
    platforms: ['instagram', 'tiktok', 'youtube'],
    category: 'Product',
    thumbnailBg: '#c8a898',
    duration: '20s',
  },
  // Late April posts
  {
    id: 'p18',
    title: 'Quotes for slow living',
    type: 'Static',
    status: 'Planned',
    date: '2025-04-28',
    platforms: ['instagram'],
    category: 'Inspiration',
    thumbnailBg: '#d0c8c0',
    imageCount: 1,
  },
  {
    id: 'p19',
    title: 'New this week',
    type: 'Story',
    status: 'Planned',
    date: '2025-04-29',
    platforms: ['instagram', 'tiktok'],
    category: 'Updates',
    thumbnailBg: '#c8c0b8',
    duration: '1–3 frames',
  },
  {
    id: 'p20',
    title: 'Weekend reset',
    type: 'Reel',
    status: 'Scheduled',
    date: '2025-04-30',
    platforms: ['instagram', 'tiktok', 'youtube'],
    category: 'Lifestyle',
    thumbnailBg: '#b8c8b8',
    duration: '12s',
  },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DEMO_DRAFTS: Draft[] = [
  { id: 'd1', title: 'Spring wardrobe picks', type: 'Carousel', updatedAt: '2 days ago' },
  { id: 'd2', title: 'Q&A session teaser', type: 'Reel', updatedAt: '3 days ago' },
  { id: 'd3', title: 'Brand values graphic', type: 'Static', updatedAt: '4 days ago' },
  { id: 'd4', title: 'Weekend plans', type: 'Story', updatedAt: '5 days ago' },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const IDEA_SEED: IdeaItem[] = [
  { id: 'idea-1', title: 'Behind the scenes: packaging', type: 'Story', category: 'Brand', theme: 'Brand', platform: 'tiktok', status: 'Idea', description: 'Show the process of packing orders — from product to the final touch. Keep it natural, warm and a little messy.', notes: '3 ideas for angles: hands, details, final packed box.', thumbnail: { x: 206, y: 159, source: 'ideas' } },
  { id: 'idea-2', title: 'Minimal workspace tour', type: 'Reel', category: 'Lifestyle', theme: 'Lifestyle', platform: 'instagram', status: 'Idea', description: 'A quick tour of my minimal workspace and the tools I use. Keep it simple, cozy and authentic.', notes: 'Show desk setup, favorite tools, lighting.', thumbnail: { x: 476, y: 159, source: 'ideas' } },
  { id: 'idea-3', title: 'Questions I get every week', type: 'Carousel', category: 'Community', theme: 'Community', platform: 'instagram', status: 'Idea', description: 'Answer the most common questions I get about content, business, and daily routines. Keep it friendly and straight to the point.', notes: 'List top 5 questions from DMs and comments.', thumbnail: { x: 749, y: 159, source: 'ideas' } },
  { id: 'idea-4', title: 'Golden hour in the city', type: 'Story', category: 'Visual', theme: 'Visual', platform: 'instagram', status: 'Draft', description: 'Quick shots from a recent golden hour walk. Focus on light, color and little details.', notes: 'Capture 5–8 vertical shots. Use natural sound if possible.', thumbnail: { x: 206, y: 458, source: 'ideas' } },
  { id: 'idea-5', title: 'Current favorites', type: 'Carousel', category: 'Lifestyle', theme: 'Lifestyle', platform: 'instagram', status: 'Planned', description: "Share 5 things I'm loving right now: products, tools, books, or small habits.", notes: 'Include a mix of practical + personal. Keep it authentic.', thumbnail: { x: 476, y: 458, source: 'ideas' } },
  { id: 'idea-6', title: 'Week in my life', type: 'Reel', category: 'Personal', theme: 'Personal', platform: 'tiktok', status: 'Idea', description: 'A quick, honest look at the highs, lows and in-between moments from this week.', notes: 'Include 3–5 short clips + voiceover or captions.', thumbnail: { x: 749, y: 458, source: 'ideas' } },
];

function readIdeas(): IdeaItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(IDEAS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as IdeaItem[];
    return Array.isArray(parsed) ? parsed.filter(idea => !/^idea-[1-6]$/.test(idea.id)) : [];
  } catch {
    return [];
  }
}

function persistIdeas(ideas: IdeaItem[]) {
  if (typeof window !== 'undefined') window.localStorage.setItem(IDEAS_STORAGE_KEY, JSON.stringify(ideas));
}

// Content rhythm was removed from the active Content Calendar experience.

// These legacy demo records remain in source for migration compatibility, but are not loaded.
void PIPELINE_SEED;
void DEMO_POSTS;
void DEMO_DRAFTS;
void IDEA_SEED;

function draftTimestamp(draft: ComposerDraft) {
  const parsed = Date.parse(draft.updatedAt);
  return Number.isFinite(parsed) ? parsed : 0;
}

function matchesComposerLinks(draft: ComposerDraft, links: { composerId?: string; calendarPostId?: string; pipelineId?: string }) {
  return Boolean(
    (links.composerId && draft.id === links.composerId) ||
    (links.calendarPostId && draft.calendarPostId === links.calendarPostId) ||
    (links.pipelineId && draft.pipelineId === links.pipelineId)
  );
}

function chooseComposerDraft(drafts: ComposerDraft[], links: { composerId?: string; calendarPostId?: string; pipelineId?: string }) {
  return drafts
    .filter(draft => matchesComposerLinks(draft, links))
    .sort((a, b) => {
      const score = (draft: ComposerDraft) =>
        (links.composerId && draft.id === links.composerId ? 1000 : 0) +
        (links.calendarPostId && draft.calendarPostId === links.calendarPostId ? 100 : 0) +
        (links.pipelineId && draft.pipelineId === links.pipelineId ? 10 : 0);
      return score(b) - score(a) || draftTimestamp(b) - draftTimestamp(a);
    })[0];
}

function findComposerDraftForPost(post: ContentPost, drafts: ComposerDraft[], pipelineItems: PipelineItem[]) {
  const linkedPipeline = post.pipelineId ? pipelineItems.find(item => item.id === post.pipelineId) : undefined;
  return chooseComposerDraft(drafts, {
    composerId: post.composerId ?? linkedPipeline?.composerId,
    calendarPostId: post.id,
    pipelineId: post.pipelineId,
  });
}

function findComposerDraftForPipelineItem(item: PipelineItem, drafts: ComposerDraft[], posts: ContentPost[]) {
  const linkedPost = posts.find(post => post.pipelineId === item.id);
  return chooseComposerDraft(drafts, {
    composerId: item.composerId ?? linkedPost?.composerId,
    calendarPostId: linkedPost?.id,
    pipelineId: item.id,
  });
}

function composerDraftFromPost(post: ContentPost): ComposerDraft {
  const platforms = post.platforms.length ? post.platforms : undefined;
  return {
    ...composerTemplate(post.type, { publishDate: post.date, platforms }),
    postType: post.type,
    platforms: platforms ?? ['instagram'],
    caption: post.title,
    hook: post.title,
    publishDate: post.date,
    publishTime: post.time ?? '10:00',
    mediaIds: post.mediaIds ?? [],
    campaignId: post.campaignId,
    pipelineId: post.pipelineId,
    calendarPostId: post.id,
    status: post.status === 'Scheduled' || post.status === 'Published' ? 'scheduled' : 'draft',
  };
}

function composerDraftFromPipelineItem(item: PipelineItem, linkedPost?: ContentPost): ComposerDraft {
  const platforms = item.platforms.length ? item.platforms : undefined;
  return {
    ...composerTemplate(item.contentType, { publishDate: item.scheduledDate, platforms }),
    postType: item.contentType,
    platforms: platforms ?? ['instagram'],
    caption: item.title,
    hook: item.title,
    publishDate: item.scheduledDate,
    publishTime: item.scheduledTime ?? '10:00',
    mediaIds: item.mediaIds ?? linkedPost?.mediaIds ?? [],
    campaignId: item.campaignId ?? linkedPost?.campaignId,
    pipelineId: item.id,
    calendarPostId: linkedPost?.id,
    status: item.stage === 'ready' || item.stage === 'published' ? 'scheduled' : 'draft',
  };
}

function repairComposerDraftLinks(draft: ComposerDraft, links: { pipelineId?: string; calendarPostId?: string }) {
  return {
    ...draft,
    pipelineId: links.pipelineId ?? draft.pipelineId,
    calendarPostId: links.calendarPostId ?? draft.calendarPostId,
  };
}

function rootSlotFromComposerDraft(draft: ComposerDraft, postType = draft.postType): PlatformSlot {
  return {
    postType,
    caption: draft.caption,
    hashtags: draft.hashtags,
    altText: draft.altText,
    hook: draft.hook,
    cta: draft.cta,
    mediaIds: draft.mediaIds,
    firstComment: draft.firstComment,
    extras: draft.platformExtras ?? {},
    previewDesign: draft.previewDesign,
    previewDesigns: draft.previewDesigns,
  };
}

function syncComposerDraftPrimarySlot(draft: ComposerDraft, updates: {
  title?: string;
  postType?: string;
  platforms?: Platform[];
  publishDate?: string;
  publishTime?: string;
  mediaIds?: string[];
  campaignId?: string;
  status?: ComposerDraft['status'];
  updatedAt?: string;
}) {
  const platforms = updates.platforms?.length ? updates.platforms : (draft.platforms.length ? draft.platforms : ['instagram']);
  const postType = updates.postType ?? draft.postType;
  const platform = platforms[0] ?? 'instagram';
  const existingSlot = draft.contentSlots?.[contentSlotKey(platform, postType)]
    ?? draft.platformSlots?.[platform]
    ?? selectedSlotForPlatform(draft, platform)
    ?? rootSlotFromComposerDraft(draft, postType);
  const nextSlot: PlatformSlot = {
    ...existingSlot,
    postType,
    caption: updates.title !== undefined ? updates.title : existingSlot.caption,
    hook: updates.title !== undefined ? updates.title : existingSlot.hook,
    mediaIds: updates.mediaIds ?? existingSlot.mediaIds,
  };
  const contentSlots = { ...(draft.contentSlots ?? {}), [contentSlotKey(platform, postType)]: nextSlot };
  const platformSlots = platforms.length > 1
    ? { ...(draft.platformSlots ?? {}), [platform]: nextSlot }
    : draft.platformSlots;
  const hasCampaignUpdate = Object.prototype.hasOwnProperty.call(updates, 'campaignId');
  return {
    ...draft,
    postType,
    platforms,
    caption: nextSlot.caption,
    hook: nextSlot.hook,
    mediaIds: nextSlot.mediaIds,
    publishDate: updates.publishDate ?? draft.publishDate,
    publishTime: updates.publishTime ?? draft.publishTime,
    campaignId: hasCampaignUpdate ? updates.campaignId : draft.campaignId,
    status: updates.status ?? draft.status,
    updatedAt: updates.updatedAt ?? draft.updatedAt,
    platformExtras: nextSlot.extras,
    previewDesign: nextSlot.previewDesign,
    previewDesigns: nextSlot.previewDesigns,
    contentSlots,
    platformSlots,
    activePlatformTab: draft.activePlatformTab && platforms.includes(draft.activePlatformTab) ? draft.activePlatformTab : platform,
  };
}

function syncComposerDraftFromPost(draft: ComposerDraft, post: ContentPost, forceTitle = false) {
  return syncComposerDraftPrimarySlot(repairComposerDraftLinks(draft, { pipelineId: post.pipelineId, calendarPostId: post.id }), {
    title: forceTitle || composerTitle(draft) !== post.title ? post.title : undefined,
    postType: post.type,
    platforms: post.platforms,
    publishDate: post.date,
    publishTime: post.time,
    mediaIds: post.mediaIds ?? [],
    campaignId: post.campaignId,
    status: post.status === 'Scheduled' || post.status === 'Published' ? 'scheduled' : draft.status,
  });
}

function syncComposerDraftFromPipelineItem(draft: ComposerDraft, item: PipelineItem, linkedPost?: ContentPost, forceTitle = false, updatedAt?: string) {
  const linked = repairComposerDraftLinks(draft, { pipelineId: item.id, calendarPostId: linkedPost?.id });
  return syncComposerDraftPrimarySlot(linked, {
    title: forceTitle || composerTitle(linked) !== item.title ? item.title : undefined,
    postType: item.contentType,
    platforms: item.platforms,
    publishDate: item.scheduledDate,
    publishTime: item.scheduledTime,
    mediaIds: item.mediaIds ?? linkedPost?.mediaIds ?? [],
    campaignId: item.campaignId ?? linkedPost?.campaignId,
    status: item.stage === 'ready' || item.stage === 'published' ? 'scheduled' : linked.status,
    updatedAt,
  });
}

function mergeDuplicateComposerDrafts(canonical: ComposerDraft, duplicates: ComposerDraft[]) {
  return duplicates.reduce((merged, duplicate) => ({
    ...merged,
    contentSlots: { ...(duplicate.contentSlots ?? {}), ...(merged.contentSlots ?? {}) },
    platformSlots: { ...(duplicate.platformSlots ?? {}), ...(merged.platformSlots ?? {}) },
    previewDesign: merged.previewDesign ?? duplicate.previewDesign,
    previewDesigns: { ...(duplicate.previewDesigns ?? {}), ...(merged.previewDesigns ?? {}) },
  }), canonical);
}

function upsertComposerDraft(drafts: ComposerDraft[], draft: ComposerDraft) {
  const duplicates = drafts.filter(item =>
    item.id !== draft.id &&
    ((draft.pipelineId && item.pipelineId === draft.pipelineId) || (draft.calendarPostId && item.calendarPostId === draft.calendarPostId))
  );
  const merged = mergeDuplicateComposerDrafts(draft, duplicates);
  return [...drafts.filter(item => item.id !== draft.id && !duplicates.some(duplicate => duplicate.id === item.id)), merged];
}

const initialSettings = readContentCalendarSettings();

export const useContentCalendarStore = create<ContentCalendarStore>()((set, get) => ({
  userName: (typeof window !== 'undefined' ? localStorage.getItem('cc-user-name') : null) ?? '',
  setUserName: (name) => {
    if (typeof window !== 'undefined') localStorage.setItem('cc-user-name', name);
    set({ userName: name });
  },
  activeView: 'dashboard',
  setActiveView: (v) => {
    if (v === 'composer') {
      const state = useContentCalendarStore.getState();
      state.openComposer({ resumeLatest: true, returnView: state.activeView === 'composer' ? state.composerReturnView : state.activeView });
      return;
    }
    useContentCalendarStore.setState({ activeView: v });
  },
  composerDrafts: readComposerDrafts(),
  activeComposerId: null,
  composerReturnView: 'dashboard',
  openComposer: (options = {}) => {
    const returnView = options.returnView ?? get().activeView;
    let draft: ComposerDraft | undefined;
    const currentDrafts = get().composerDrafts;
    const currentPosts = get().posts;
    const currentPipelineItems = get().pipelineItems;
    if (options.resumeLatest) {
      draft = [...currentDrafts].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
    }
    if (options.sourcePost) {
      const post = options.sourcePost;
      draft = findComposerDraftForPost(post, currentDrafts, currentPipelineItems);
      if (!draft) {
        draft = composerDraftFromPost(post);
      } else {
        draft = syncComposerDraftFromPost(draft, post);
      }
    }
    if (options.pipelineId) {
      const pipelineItem = currentPipelineItems.find(item => item.id === options.pipelineId);
      const linkedPost = pipelineItem ? currentPosts.find(p => p.pipelineId === pipelineItem.id) : undefined;
      draft = pipelineItem ? findComposerDraftForPipelineItem(pipelineItem, currentDrafts, currentPosts) : undefined;
      if (!draft && pipelineItem) {
        draft = composerDraftFromPipelineItem(pipelineItem, linkedPost);
      }
      if (draft && pipelineItem) {
        draft = syncComposerDraftFromPipelineItem(draft, pipelineItem, linkedPost);
      }
    }
    if (options.sourceTemplate) {
      const template = options.sourceTemplate;
      const platform = template.platform;
      draft = {
        ...composerTemplate(template.postType, { platforms: [platform] }),
        caption: template.body,
        hook: template.hook,
        cta: template.cta,
        hashtags: template.hashtags,
        mediaIds: template.mediaIds,
        checklist: template.checklist,
        postType: template.postType,
        platforms: [platform],
      };
    }
    const openedExistingDraft = Boolean(draft);
    draft ??= composerTemplate(options.postType, { publishDate: options.publishDate, platforms: options.platforms });
    if (!openedExistingDraft && !options.sourcePost && !options.pipelineId && !options.sourceTemplate) {
      draft = { ...draft, caption: '', hashtags: [], altText: '', hook: '', firstComment: '' };
    }
    if (options.publishDate || options.platforms?.length) {
      draft = {
        ...draft,
        publishDate: options.publishDate ?? draft.publishDate,
        platforms: options.platforms?.length ? options.platforms : draft.platforms,
      };
    }
    const drafts = upsertComposerDraft(currentDrafts, draft);
    let posts = currentPosts;
    let pipelineItems = currentPipelineItems;
    if (draft.calendarPostId) {
      posts = posts.map(post => post.id === draft.calendarPostId
        ? { ...post, composerId: draft.id, pipelineId: draft.pipelineId ?? post.pipelineId }
        : post);
    }
    if (draft.pipelineId) {
      pipelineItems = pipelineItems.map(item => item.id === draft.pipelineId
        ? { ...item, composerId: draft.id }
        : item);
    }
    persistComposerDrafts(drafts);
    if (posts !== currentPosts) persistComposerPosts(posts);
    if (pipelineItems !== currentPipelineItems) persistPipelineItems(pipelineItems);
    set({ composerDrafts: drafts, posts, pipelineItems, activeComposerId: draft.id, composerReturnView: returnView, activeView: 'composer' });
  },
  closeComposer: () => set(state => ({ activeView: state.composerReturnView, activeComposerId: null })),
  saveComposerDraft: (draft) => {
    const now = new Date().toISOString();
    const currentPipelineItems = get().pipelineItems;
    const currentPosts = get().posts;
    const linkedCalendarPost = draft.calendarPostId ? currentPosts.find(post => post.id === draft.calendarPostId) : undefined;
    let pipelineId = draft.pipelineId ?? linkedCalendarPost?.pipelineId;
    let existing = pipelineId ? currentPipelineItems.find(item => item.id === pipelineId) : undefined;
    existing ??= currentPipelineItems.find(item => item.composerId === draft.id);
    pipelineId ??= existing?.id;
    const shouldUpsertPipeline = Boolean(pipelineId || !draft.calendarPostId);
    if (shouldUpsertPipeline && !pipelineId) pipelineId = `pipeline-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const saved: ComposerDraft = {
      ...draft,
      ...(pipelineId ? { pipelineId } : {}),
      status: draft.calendarPostId ? draft.status : 'draft',
      updatedAt: now,
    };
    let pipelineItems = currentPipelineItems;
    if (shouldUpsertPipeline && pipelineId) {
      const targetStage = existing?.stage ?? 'drafting';
      const order = existing?.order ?? currentPipelineItems.filter(item => item.stage === targetStage && item.id !== pipelineId).length;
      const pipeline: PipelineItem = {
        ...existing,
        id: pipelineId, title: composerTitle(saved), stage: targetStage, order,
        platforms: saved.platforms, contentType: composerContentType(saved), campaign: saved.campaignId ? existing?.campaign : undefined, campaignId: saved.campaignId,
        scheduledDate: saved.publishDate, scheduledTime: saved.publishTime,
        thumbnail: existing?.thumbnail ?? { x: 953, y: 176, source: 'composer' },
        checklistComplete: Object.values(saved.checklist).filter(Boolean).length,
        checklistTotal: 6, mediaIds: composerMediaIds(saved), composerId: saved.id,
      };
      pipelineItems = normalizeOrders([...currentPipelineItems.filter(item => item.id !== pipelineId), pipeline]);
    }
    const composerDrafts = upsertComposerDraft(get().composerDrafts, saved);
    let posts = currentPosts;
    if (saved.calendarPostId) {
      posts = posts.map(p =>
        p.id === saved.calendarPostId
          ? {
              ...p,
              title: composerTitle(saved), type: composerContentType(saved),
              platforms: saved.platforms, date: saved.publishDate ?? p.date, time: saved.publishTime,
              mediaIds: composerMediaIds(saved), composerId: saved.id, pipelineId: pipelineId ?? p.pipelineId,
              campaignId: saved.campaignId,
            }
          : p
      );
      persistComposerPosts(posts);
    }
    // Sync other per-platform pipeline items and posts for this draft
    const otherPlatformItems = pipelineItems.filter(item => item.composerId === saved.id && item.id !== pipelineId);
    if (otherPlatformItems.length) {
      pipelineItems = pipelineItems.map(item => {
        if (item.composerId !== saved.id || item.id === pipelineId) return item;
        const platform = item.platforms[0];
        if (!platform) return item;
        const slot = selectedSlotForPlatform(saved, platform);
        const postType = slot?.postType ?? saved.postType;
        const title = composerSlotTitle(slot) || composerTitle(saved);
        const mediaIds = slot?.mediaIds ?? saved.mediaIds;
        return { ...item, title, contentType: postType, scheduledDate: saved.publishDate, scheduledTime: saved.publishTime, mediaIds, campaignId: saved.campaignId };
      });
      posts = posts.map(p => {
        if (p.composerId !== saved.id || p.id === saved.calendarPostId) return p;
        const platform = p.platforms[0];
        if (!platform) return p;
        const slot = selectedSlotForPlatform(saved, platform);
        const postType = slot?.postType ?? saved.postType;
        const title = composerSlotTitle(slot) || composerTitle(saved);
        const mediaIds = slot?.mediaIds ?? saved.mediaIds;
        return { ...p, title, type: postType, date: saved.publishDate ?? p.date, time: saved.publishTime, mediaIds, campaignId: saved.campaignId };
      });
      persistComposerPosts(posts);
    }
    if (pipelineItems !== currentPipelineItems) persistPipelineItems(pipelineItems);
    persistComposerDrafts(composerDrafts);
    set({ pipelineItems, composerDrafts, posts, drafts: composerDrafts.map(item => ({ id: item.id, title: composerTitle(item), type: composerContentType(item), updatedAt: item.updatedAt })), activeComposerId: saved.id });
    return saved;
  },
  scheduleComposer: (draft) => {
    const now = new Date().toISOString();
    const isNewPipeline = !draft.pipelineId;
    const oldPipelineId = draft.pipelineId;
    const oldCalendarPostId = draft.calendarPostId;

    let pipelineItems = get().pipelineItems.filter(item => item.composerId !== draft.id && item.id !== oldPipelineId);
    let posts = get().posts.filter(post => {
      if (post.composerId === draft.id) return false;
      if (post.id === oldCalendarPostId) return false;
      if (oldPipelineId && post.pipelineId === oldPipelineId) return false;
      return true;
    });

    let firstPipelineId: string | undefined;
    let firstCalendarPostId: string | undefined;
    const checklistComplete = Object.values(draft.checklist).filter(Boolean).length;
    const baseOrder = pipelineItems.filter(item => item.stage === 'ready').length;

    for (let i = 0; i < draft.platforms.length; i++) {
      const platform = draft.platforms[i];
      const platPipelineId = `pipeline-${draft.id}-${platform}`;
      const platCalendarPostId = `cpost-${draft.id}-${platform}`;
      if (!firstPipelineId) firstPipelineId = platPipelineId;
      if (!firstCalendarPostId) firstCalendarPostId = platCalendarPostId;

      const slot = selectedSlotForPlatform(draft, platform);
      const postType = slot?.postType ?? draft.postType;
      const title = composerSlotTitle(slot) || composerTitle(draft);
      const mediaIds = slot?.mediaIds ?? draft.mediaIds;

      pipelineItems.push({
        id: platPipelineId, title, stage: 'ready', order: baseOrder + i,
        platforms: [platform], contentType: postType, campaignId: draft.campaignId,
        scheduledDate: draft.publishDate, scheduledTime: draft.publishTime,
        thumbnail: { x: 953, y: 176, source: 'composer' as const },
        checklistComplete, checklistTotal: 6, mediaIds, composerId: draft.id,
      });

      // Remove orphaned Pipeline-placeholder posts
      if (isNewPipeline) {
        posts = posts.filter(post => !(
          post.category === 'Pipeline' && !post.composerId
          && post.date === draft.publishDate
          && post.platforms.includes(platform)
        ));
      }

      posts.push({
        id: platCalendarPostId, title, type: postType, status: 'Scheduled',
        date: draft.publishDate, time: draft.publishTime, platforms: [platform],
        category: 'Composer', mediaIds, composerId: draft.id, pipelineId: platPipelineId, campaignId: draft.campaignId,
      });
    }

    pipelineItems = normalizeOrders(pipelineItems);
    const saved: ComposerDraft = { ...draft, pipelineId: firstPipelineId, calendarPostId: firstCalendarPostId, status: 'scheduled', updatedAt: now };
    const composerDrafts = [...get().composerDrafts.filter(item => item.id !== saved.id), saved];
    persistPipelineItems(pipelineItems); persistComposerDrafts(composerDrafts); persistComposerPosts(posts);
    set({ pipelineItems, posts, composerDrafts, drafts: composerDrafts.map(item => ({ id: item.id, title: composerTitle(item), type: composerContentType(item), updatedAt: item.updatedAt })), activeComposerId: saved.id, activeView: 'calendar' });
    return saved;
  },
  deletePost: (id) => {
    const post = get().posts.find(p => p.id === id);
    const posts = get().posts.filter(p => p.id !== id);
    let pipelineItems = get().pipelineItems;
    let composerDrafts = get().composerDrafts;
    if (post?.pipelineId) {
      pipelineItems = pipelineItems.filter(item => item.id !== post.pipelineId);
      persistPipelineItems(pipelineItems);
    }
    if (post?.composerId) {
      const remaining = pipelineItems.filter(item => item.composerId === post.composerId);
      if (remaining.length === 0) {
        composerDrafts = composerDrafts.map(d =>
          d.id === post.composerId ? { ...d, pipelineId: undefined, calendarPostId: undefined, status: 'draft' } : d
        );
      }
    } else {
      composerDrafts = composerDrafts.map(d =>
        d.calendarPostId === id ? { ...d, calendarPostId: undefined, status: 'draft' } : d
      );
    }
    persistComposerDrafts(composerDrafts);
    persistComposerPosts(posts);
    set({ posts, pipelineItems, composerDrafts, drafts: composerDrafts.map(d => ({ id: d.id, title: composerTitle(d), type: composerContentType(d), updatedAt: d.updatedAt })) });
  },
  movePost: (id, newDate) => {
    const post = get().posts.find(p => p.id === id);
    const posts = get().posts.map(p => p.id === id ? { ...p, date: newDate } : p);
    persistComposerPosts(posts);
    if (post?.composerId) {
      const composerDrafts = get().composerDrafts.map(d =>
        d.id === post.composerId ? { ...d, publishDate: newDate } : d
      );
      persistComposerDrafts(composerDrafts);
      set({ posts, composerDrafts });
    } else {
      set({ posts });
    }
  },
  addCampaign: (campaign) => {
    const now = new Date().toISOString();
    const created: Campaign = { ...campaign, id: `campaign-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, createdAt: now, updatedAt: now };
    const campaigns = [...get().campaigns, created];
    persistCampaigns(campaigns);
    recalculateMediaUsage();
    set({ campaigns });
    return created;
  },
  updateCampaign: (id, updates) => {
    const campaigns = get().campaigns.map(campaign => campaign.id === id
      ? { ...campaign, ...updates, updatedAt: new Date().toISOString() }
      : campaign);
    persistCampaigns(campaigns);
    recalculateMediaUsage();
    set({ campaigns });
  },
  deleteCampaign: (id) => {
    const campaigns = get().campaigns.filter(campaign => campaign.id !== id);
    const pipelineItems = get().pipelineItems.map(item => item.campaignId === id ? { ...item, campaignId: undefined, campaign: undefined } : item);
    const posts = get().posts.map(post => post.campaignId === id ? { ...post, campaignId: undefined } : post);
    const composerDrafts = get().composerDrafts.map(draft => draft.campaignId === id ? { ...draft, campaignId: undefined } : draft);
    persistCampaigns(campaigns); persistPipelineItems(pipelineItems); persistComposerPosts(posts); persistComposerDrafts(composerDrafts);
    recalculateMediaUsage();
    set({ campaigns, pipelineItems, posts, composerDrafts, drafts: composerDrafts.map(draft => ({ id: draft.id, title: composerTitle(draft), type: composerContentType(draft), updatedAt: draft.updatedAt })) });
  },
  templates: readTemplates(),
  addTemplate: (template) => {
    const now = new Date().toISOString();
    const created: ContentTemplate = { ...template, id: `template-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, createdAt: now, updatedAt: now };
    const templates = [...get().templates, created];
    persistTemplates(templates);
    recalculateMediaUsage();
    set({ templates });
    return created;
  },
  updateTemplate: (id, updates) => {
    const templates = get().templates.map(template => template.id === id ? { ...template, ...updates, updatedAt: new Date().toISOString() } : template);
    persistTemplates(templates);
    recalculateMediaUsage();
    set({ templates });
  },
  deleteTemplate: (id) => {
    const templates = get().templates.filter(template => template.id !== id);
    persistTemplates(templates);
    recalculateMediaUsage();
    set({ templates });
  },
  duplicateTemplate: (id) => {
    const source = get().templates.find(template => template.id === id);
    if (!source) return undefined;
    const now = new Date().toISOString();
    const copy: ContentTemplate = { ...source, id: `template-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, name: `${source.name} copy`, createdAt: now, updatedAt: now, archived: false };
    const templates = [...get().templates, copy];
    persistTemplates(templates);
    recalculateMediaUsage();
    set({ templates });
    return copy;
  },
  useTemplate: (id) => {
    const template = get().templates.find(item => item.id === id);
    if (template) get().openComposer({ sourceTemplate: template, returnView: 'templates' });
  },
  performanceRecords: readPerformanceRecords(),
  addPerformanceRecord: (record) => {
    const now = new Date().toISOString();
    const created: AnalyticsPerformanceRecord = { ...record, id: `analytics-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, source: 'manual', createdAt: now, updatedAt: now };
    const performanceRecords = [...get().performanceRecords, created];
    persistPerformanceRecords(performanceRecords);
    set({ performanceRecords });
    return created;
  },
  updatePerformanceRecord: (id, updates) => {
    const performanceRecords = get().performanceRecords.map(item => item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item);
    persistPerformanceRecords(performanceRecords);
    set({ performanceRecords });
  },
  deletePerformanceRecord: (id) => {
    const performanceRecords = get().performanceRecords.filter(item => item.id !== id);
    persistPerformanceRecords(performanceRecords);
    set({ performanceRecords });
  },
  removeMediaReferences: (id) => {
    const clean = (value: unknown): unknown => {
      if (Array.isArray(value)) return value.filter(item => item !== id).map(item => clean(item));
      if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).flatMap(([childKey, childValue]) => {
        if ((childKey === 'mediaId' && childValue === id)) return [];
        return [[childKey, clean(childValue)]];
      }));
      return value;
    };
    const pipelineItems = get().pipelineItems.map(item => ({ ...item, mediaIds: (item.mediaIds ?? []).filter(mediaId => mediaId !== id) }));
    const posts = get().posts.map(post => ({ ...post, mediaIds: (post.mediaIds ?? []).filter(mediaId => mediaId !== id) }));
    const composerDrafts = get().composerDrafts.map(draft => clean(draft) as ComposerDraft);
    const campaigns = get().campaigns.map(campaign => campaign.coverMediaId === id ? { ...campaign, coverMediaId: undefined } : campaign);
    const templates = get().templates.map(template => ({ ...template, mediaIds: template.mediaIds.filter(mediaId => mediaId !== id) }));
    persistPipelineItems(pipelineItems); persistComposerPosts(posts); persistComposerDrafts(composerDrafts); persistCampaigns(campaigns); persistTemplates(templates);
    recalculateMediaUsage();
    set({ campaigns, templates, pipelineItems, posts, composerDrafts, drafts: composerDrafts.map(draft => ({ id: draft.id, title: composerTitle(draft), type: composerContentType(draft), updatedAt: draft.updatedAt })) });
  },
  clearWorkspaceData: async () => {
    if (typeof window !== 'undefined') {
      [PIPELINE_STORAGE_KEY, LEGACY_PIPELINE_STORAGE_KEY, IDEAS_STORAGE_KEY, COMPOSER_STORAGE_KEY, COMPOSER_POSTS_STORAGE_KEY, CAMPAIGNS_STORAGE_KEY, LEGACY_CAMPAIGNS_STORAGE_KEY, TEMPLATES_STORAGE_KEY, TEMPLATES_V2_STORAGE_KEY, ANALYTICS_STORAGE_KEY, 'content-edit.custom-platforms.v1', 'content-edit.active-platforms.v1'].forEach(key => window.localStorage.removeItem(key));
    }
    await clearMediaStorage().catch(() => undefined);
    set({ campaigns: [], templates: [], posts: [], composerDrafts: [], drafts: [], ideas: [], pipelineItems: [], performanceRecords: [], activeComposerId: null });
  },

  weekOf: currentWeekStartKey(),
  currentMonth: localDateKey().slice(0, 7),
  setCurrentMonth: (m) => useContentCalendarStore.setState({ currentMonth: m }),
  campaigns: readCampaigns(),
  posts: readComposerPosts(),
  drafts: readComposerDrafts().map(draft => ({ id: draft.id, title: composerTitle(draft), type: composerContentType(draft), updatedAt: draft.updatedAt })),
  ideas: readIdeas(),
  addIdea: (idea) => {
    const next = [...get().ideas, { ...idea, id: `idea-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }];
    persistIdeas(next);
    set({ ideas: next });
  },
  updateIdea: (id, updates) => {
    const next = get().ideas.map(idea => idea.id === id ? { ...idea, ...updates } : idea);
    persistIdeas(next);
    set({ ideas: next });
  },
  deleteIdea: (id) => {
    const next = get().ideas.filter(idea => idea.id !== id);
    persistIdeas(next);
    set({ ideas: next });
  },
  convertIdeaToPipeline: (id) => {
    const idea = get().ideas.find(candidate => candidate.id === id);
    if (!idea || idea.linkedPipelineId) return;
    const pipelineId = `pipeline-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const order = get().pipelineItems.filter(item => item.stage === 'drafting').length;
    const pipelineItem: PipelineItem = {
      id: pipelineId, title: idea.title, stage: 'drafting', order,
      platforms: [idea.platform], contentType: idea.type, campaign: idea.theme,
      scheduledDate: localDateKey(), thumbnail: idea.thumbnail,
      checklistComplete: 1, checklistTotal: 3,
    };
    const pipelineItems = [...get().pipelineItems, pipelineItem];
    const calendarPost: ContentPost = {
      id: `pipeline-post-${pipelineId}`,
      title: idea.title, type: idea.type, status: pipelineStagePostStatus('drafting'),
      date: localDateKey(), platforms: [idea.platform],
      category: 'Pipeline', mediaIds: [],
      pipelineId,
    };
    const posts = [...get().posts, calendarPost];
    const ideas = get().ideas.map(candidate => candidate.id === id ? { ...candidate, status: 'Planned' as const, linkedPipelineId: pipelineId } : candidate);
    persistPipelineItems(pipelineItems);
    persistComposerPosts(posts);
    persistIdeas(ideas);
    set({ pipelineItems, posts, ideas });
  },
  stats: { planned: 0, scheduled: 0, published: 0, ideas: 0 },

  pipelineItems: readPipelineItems(),
  pipelineFilters: DEFAULT_PIPELINE_FILTERS,
  setPipelineFilters: (filters) => set(state => ({
    pipelineFilters: { ...state.pipelineFilters, ...filters },
  })),
  clearPipelineFilters: () => set({ pipelineFilters: DEFAULT_PIPELINE_FILTERS }),
  addPipelineItem: (item) => {
    const siblings = get().pipelineItems.filter(existing => existing.stage === item.stage);
    const newId = `pipeline-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newItem: PipelineItem = { ...item, id: newId, order: siblings.length };
    const pipelineItems = [...get().pipelineItems, newItem];
    const calendarPost: ContentPost = {
      id: `pipeline-post-${newId}`,
      title: item.title, type: item.contentType, status: pipelineStagePostStatus(item.stage),
      date: item.scheduledDate ?? new Date().toISOString().slice(0, 10),
      time: item.scheduledTime, platforms: item.platforms ?? [],
      category: 'Pipeline', mediaIds: item.mediaIds ?? [],
      pipelineId: newId, campaignId: item.campaignId,
    };
    const posts = [...get().posts, calendarPost];
    persistPipelineItems(pipelineItems); persistComposerPosts(posts);
    recalculateMediaUsage();
    set({ pipelineItems, posts });
  },
  updatePipelineItem: (id, updates) => {
    const next = normalizeOrders(get().pipelineItems.map(item => item.id === id ? { ...item, ...updates } : item));
    const updatedItem = next.find(item => item.id === id);
    let posts = updatedItem
      ? get().posts.map(p =>
          p.pipelineId === id
            ? {
                ...p,
                title: updatedItem.title ?? p.title,
                type: updatedItem.contentType ?? p.type,
                status: pipelineStagePostStatus(updatedItem.stage),
                date: updatedItem.scheduledDate ?? p.date,
                time: updatedItem.scheduledTime ?? p.time,
                platforms: updatedItem.platforms ?? p.platforms,
                mediaIds: updatedItem.mediaIds ?? p.mediaIds,
                campaignId: updatedItem.campaignId,
              }
            : p
        )
      : get().posts;
    let pipelineItems = next;
    let composerDrafts = get().composerDrafts;
    if (updatedItem) {
      const linkedPost = posts.find(post => post.pipelineId === id);
      const draft = findComposerDraftForPipelineItem(updatedItem, composerDrafts, posts);
      if (draft) {
        const syncedDraft = syncComposerDraftFromPipelineItem(draft, updatedItem, linkedPost, updates.title !== undefined, new Date().toISOString());
        composerDrafts = upsertComposerDraft(composerDrafts, syncedDraft);
        pipelineItems = pipelineItems.map(item => item.id === id ? { ...item, composerId: syncedDraft.id } : item);
        posts = posts.map(post => post.pipelineId === id ? { ...post, composerId: syncedDraft.id } : post);
      }
    }
    persistPipelineItems(pipelineItems); persistComposerPosts(posts); persistComposerDrafts(composerDrafts);
    recalculateMediaUsage();
    set({ pipelineItems, posts, composerDrafts, drafts: composerDrafts.map(d => ({ id: d.id, title: composerTitle(d), type: composerContentType(d), updatedAt: d.updatedAt })) });
  },
  deletePipelineItem: (id) => {
    const deletedItem = get().pipelineItems.find(item => item.id === id);
    const next = get().pipelineItems.filter(item => item.id !== id);
    const posts = get().posts.filter(post => post.pipelineId !== id);
    let composerDrafts = get().composerDrafts;
    if (deletedItem?.composerId) {
      const remaining = next.filter(item => item.composerId === deletedItem.composerId);
      if (remaining.length === 0) {
        composerDrafts = composerDrafts.map(draft =>
          draft.id === deletedItem.composerId ? { ...draft, pipelineId: undefined, calendarPostId: undefined, status: 'draft' } : draft
        );
      }
    } else {
      composerDrafts = composerDrafts.map(draft => {
        let updated = draft;
        if (draft.pipelineId === id) updated = { ...updated, pipelineId: undefined };
        const deletedPostIds = new Set(get().posts.filter(p => p.pipelineId === id).map(p => p.id));
        if (draft.calendarPostId && deletedPostIds.has(draft.calendarPostId)) updated = { ...updated, calendarPostId: undefined, status: 'draft' };
        return updated;
      });
    }
    persistPipelineItems(next); persistComposerDrafts(composerDrafts); persistComposerPosts(posts);
    recalculateMediaUsage();
    set({ pipelineItems: normalizeOrders(next), composerDrafts, posts, drafts: composerDrafts.map(draft => ({ id: draft.id, title: composerTitle(draft), type: composerContentType(draft), updatedAt: draft.updatedAt })) });
  },
  movePipelineItem: (id, stage, index) => {
    const moving = get().pipelineItems.find(item => item.id === id);
    if (!moving) return;
    const without = get().pipelineItems.filter(item => item.id !== id);
    const target = without.filter(item => item.stage === stage).sort((a, b) => a.order - b.order);
    target.splice(Math.max(0, Math.min(index, target.length)), 0, { ...moving, stage });
    const other = without.filter(item => item.stage !== stage);
    const next = normalizeOrders([...other, ...target]);
    const updatedItem = next.find(item => item.id === id);
    const posts = updatedItem ? syncPipelinePosts(get().posts, updatedItem) : get().posts;
    persistPipelineItems(next);
    persistComposerPosts(posts);
    recalculateMediaUsage();
    set({ pipelineItems: next, posts });
  },
  importScheduleRecords: (records) => {
    const createdAt = Date.now();
    const stageCounts = new Map<PipelineStage, number>(['ideas', 'drafting', 'ready', 'published'].map(stage => [stage as PipelineStage, get().pipelineItems.filter(item => item.stage === stage).length]));
    const pipelineItems = [...get().pipelineItems];
    const posts = [...get().posts];
    records.forEach((record, index) => {
      const pipelineId = `pipeline-import-${createdAt}-${index}-${Math.random().toString(36).slice(2, 6)}`;
      const postId = `post-import-${createdAt}-${index}-${Math.random().toString(36).slice(2, 6)}`;
      const order = stageCounts.get(record.stage) ?? 0;
      stageCounts.set(record.stage, order + 1);
      pipelineItems.push({
        id: pipelineId, title: record.title, stage: record.stage, order,
        platforms: record.platforms, contentType: record.contentType,
        campaignId: record.campaignId, scheduledDate: record.scheduledDate,
        scheduledTime: record.scheduledTime, thumbnail: { x: 0, y: 0, source: 'pipeline' },
        checklistComplete: 0, checklistTotal: 6, mediaIds: [], notes: record.notes,
      });
      posts.push({
        id: postId, title: record.title, status: record.status, type: record.contentType,
        date: record.scheduledDate, time: record.scheduledTime, platforms: record.platforms,
        category: 'CSV import', mediaIds: [], pipelineId, campaignId: record.campaignId,
      });
    });
    const normalizedPipeline = normalizeOrders(pipelineItems);
    persistPipelineItems(normalizedPipeline);
    persistComposerPosts(posts);
    set({ pipelineItems: normalizedPipeline, posts });
  },

  settings: initialSettings,
  updateSettings: (updates) => {
    const settings = normalizeContentCalendarSettings({ ...get().settings, ...updates, version: 1 });
    writeContentCalendarSettings(settings);
    set({ settings, theme: settings.theme, accent: settings.accent });
  },
  recordSuccessfulBackup: () => {
    const settings = normalizeContentCalendarSettings({ ...get().settings, lastBackupAt: new Date().toISOString(), backupReminderDismissedUntil: undefined });
    writeContentCalendarSettings(settings);
    set({ settings });
  },
  dismissBackupReminder: () => {
    const dismissed = new Date();
    dismissed.setHours(dismissed.getHours() + 24);
    const settings = normalizeContentCalendarSettings({ ...get().settings, backupReminderDismissedUntil: dismissed.toISOString() });
    writeContentCalendarSettings(settings);
    set({ settings });
  },
  reloadWorkspaceData: () => {
    const composerDrafts = readComposerDrafts();
    const settings = readContentCalendarSettings();
    set({
      campaigns: readCampaigns(), templates: readTemplates(), posts: readComposerPosts(),
      composerDrafts, drafts: composerDrafts.map(draft => ({ id: draft.id, title: composerTitle(draft), type: composerContentType(draft), updatedAt: draft.updatedAt })),
      ideas: readIdeas(), pipelineItems: readPipelineItems(), performanceRecords: readPerformanceRecords(),
      settings, theme: settings.theme, accent: settings.accent, activeComposerId: null,
    });
  },
  theme: initialSettings.theme,
  accent: initialSettings.accent,
  setTheme: (theme) => {
    const settings = normalizeContentCalendarSettings({ ...get().settings, theme });
    writeContentCalendarSettings(settings);
    set({ theme, settings });
  },
  setAccent: (accent) => {
    const settings = normalizeContentCalendarSettings({ ...get().settings, accent });
    writeContentCalendarSettings(settings);
    set({ accent: settings.accent, settings });
  },
}));

if (typeof window !== 'undefined') {
  window.addEventListener('storage', event => {
    if (!event.key) return;
    if ([CAMPAIGNS_STORAGE_KEY, LEGACY_CAMPAIGNS_STORAGE_KEY].includes(event.key)) useContentCalendarStore.setState({ campaigns: readCampaigns() });
    if ([TEMPLATES_STORAGE_KEY, TEMPLATES_V2_STORAGE_KEY].includes(event.key)) useContentCalendarStore.setState({ templates: readTemplates() });
    if (event.key === ANALYTICS_STORAGE_KEY) useContentCalendarStore.setState({ performanceRecords: readPerformanceRecords() });
    if ([PIPELINE_STORAGE_KEY, LEGACY_PIPELINE_STORAGE_KEY].includes(event.key)) useContentCalendarStore.setState({ pipelineItems: readPipelineItems() });
    if (event.key === COMPOSER_POSTS_STORAGE_KEY) useContentCalendarStore.setState({ posts: readComposerPosts() });
    if (event.key === COMPOSER_STORAGE_KEY) { const composerDrafts = readComposerDrafts(); useContentCalendarStore.setState({ composerDrafts, drafts: composerDrafts.map(draft => ({ id: draft.id, title: composerTitle(draft), type: composerContentType(draft), updatedAt: draft.updatedAt })) }); }
    if ([SETTINGS_STORAGE_KEY, LEGACY_THEME_STORAGE_KEY, LEGACY_ACCENT_STORAGE_KEY].includes(event.key)) {
      const settings = readContentCalendarSettings();
      useContentCalendarStore.setState({ settings, theme: settings.theme, accent: settings.accent });
    }
  });
}
