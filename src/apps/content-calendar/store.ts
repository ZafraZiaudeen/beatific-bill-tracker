import { create } from 'zustand';
import type {
  ComposerDraft, ContentCalendarView, ContentPost, Draft,
  HashtagSet, IdeaItem, PipelineFilters, PipelineItem, PipelineStage,
} from './types';

interface RhythmEntry { type: string; targetPerWeek: number; color: string; }

interface ContentCalendarStore {
  activeView: ContentCalendarView;
  setActiveView: (v: ContentCalendarView) => void;
  composerDrafts: ComposerDraft[];
  activeComposerId: string | null;
  composerReturnView: ContentCalendarView;
  openComposer: (options?: { postType?: ComposerDraft['postType']; pipelineId?: string; returnView?: ContentCalendarView; resumeLatest?: boolean }) => void;
  closeComposer: () => void;
  saveComposerDraft: (draft: ComposerDraft) => ComposerDraft;
  scheduleComposer: (draft: ComposerDraft) => ComposerDraft;

  weekOf: string;
  currentMonth: string;
  setCurrentMonth: (m: string) => void;
  posts: ContentPost[];
  drafts: Draft[];
  ideas: IdeaItem[];
  addIdea: (idea: Omit<IdeaItem, 'id'>) => void;
  updateIdea: (id: string, updates: Partial<Omit<IdeaItem, 'id'>>) => void;
  convertIdeaToPipeline: (id: string) => void;
  hashtagSets: HashtagSet[];
  contentRhythm: RhythmEntry[];
  stats: { planned: number; scheduled: number; published: number; ideas: number };

  pipelineItems: PipelineItem[];
  pipelineFilters: PipelineFilters;
  setPipelineFilters: (filters: Partial<PipelineFilters>) => void;
  clearPipelineFilters: () => void;
  addPipelineItem: (item: Omit<PipelineItem, 'id' | 'order'>) => void;
  updatePipelineItem: (id: string, updates: Partial<Omit<PipelineItem, 'id'>>) => void;
  movePipelineItem: (id: string, stage: PipelineStage, index: number) => void;
}

const PIPELINE_STORAGE_KEY = 'content-edit.pipeline.v1';
const IDEAS_STORAGE_KEY = 'content-edit.ideas.v1';
const COMPOSER_STORAGE_KEY = 'content-edit.composer.v1';
const COMPOSER_POSTS_STORAGE_KEY = 'content-edit.composer-posts.v1';
const DEFAULT_PIPELINE_FILTERS: PipelineFilters = {
  search: '', platform: 'all', contentType: 'all', campaign: 'all', stage: 'all',
};

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
  if (typeof window === 'undefined') return PIPELINE_SEED;
  try {
    const saved = window.localStorage.getItem(PIPELINE_STORAGE_KEY);
    if (!saved) return PIPELINE_SEED;
    const parsed = JSON.parse(saved) as PipelineItem[];
    return Array.isArray(parsed) && parsed.length ? parsed : PIPELINE_SEED;
  } catch {
    return PIPELINE_SEED;
  }
}

function persistPipelineItems(items: PipelineItem[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PIPELINE_STORAGE_KEY, JSON.stringify(items));
}

function normalizeOrders(items: PipelineItem[]): PipelineItem[] {
  const stages: PipelineStage[] = ['ideas', 'drafting', 'ready', 'published'];
  return stages.flatMap(stage => items
    .filter(item => item.stage === stage)
    .sort((a, b) => a.order - b.order)
    .map((item, order) => ({ ...item, order })));
}

function readComposerDrafts(): ComposerDraft[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(COMPOSER_STORAGE_KEY) ?? '[]') as ComposerDraft[];
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function persistComposerDrafts(drafts: ComposerDraft[]) {
  if (typeof window !== 'undefined') window.localStorage.setItem(COMPOSER_STORAGE_KEY, JSON.stringify(drafts));
}

function readComposerPosts(): ContentPost[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(COMPOSER_POSTS_STORAGE_KEY) ?? '[]') as ContentPost[];
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function persistComposerPosts(posts: ContentPost[]) {
  if (typeof window !== 'undefined') window.localStorage.setItem(COMPOSER_POSTS_STORAGE_KEY, JSON.stringify(posts.filter(post => post.composerId)));
}

function composerTemplate(postType: ComposerDraft['postType'] = 'Reel'): ComposerDraft {
  const now = new Date().toISOString();
  return {
    id: `composer-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    postType, platforms: ['instagram', 'tiktok', 'pinterest'],
    caption: "Small spaces, big mood ✨\nThis corner proves that good design doesn’t need a lot — just the right pieces. #SmallSpaceBigDreams",
    hashtags: ['smallspace', 'homedecor', 'interiorinspo', 'apartmentliving'],
    altText: 'Cozy coffee table with a ceramic mug, book, and neutral textile.',
    publishDate: '2025-04-28', publishTime: '10:00', hook: 'Small spaces, big mood ✨',
    cta: 'Shop the look', mediaIds: ['seed-media-3', 'seed-media-1', 'seed-media-9'],
    firstComment: 'Which detail is your favorite? 💛',
    checklist: { captionOnBrand: true, hashtagsRelevant: true, mediaHighQuality: true, altTextAdded: true, firstCommentIncluded: false, ctaClear: false },
    status: 'working', createdAt: now, updatedAt: now,
  };
}

function composerTitle(draft: ComposerDraft) {
  return (draft.hook || draft.caption.split('\n')[0] || 'Untitled post').replaceAll('✨', '').replaceAll('💛', '').trim() || 'Untitled post';
}

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

const DEMO_DRAFTS: Draft[] = [
  { id: 'd1', title: 'Spring wardrobe picks', type: 'Carousel', updatedAt: '2 days ago' },
  { id: 'd2', title: 'Q&A session teaser', type: 'Reel', updatedAt: '3 days ago' },
  { id: 'd3', title: 'Brand values graphic', type: 'Static', updatedAt: '4 days ago' },
  { id: 'd4', title: 'Weekend plans', type: 'Story', updatedAt: '5 days ago' },
];

const IDEA_SEED: IdeaItem[] = [
  { id: 'idea-1', title: 'Behind the scenes: packaging', type: 'Story', category: 'Brand', theme: 'Brand', platform: 'tiktok', status: 'Idea', description: 'Show the process of packing orders — from product to the final touch. Keep it natural, warm and a little messy.', notes: '3 ideas for angles: hands, details, final packed box.', thumbnail: { x: 206, y: 159, source: 'ideas' } },
  { id: 'idea-2', title: 'Minimal workspace tour', type: 'Reel', category: 'Lifestyle', theme: 'Lifestyle', platform: 'instagram', status: 'Idea', description: 'A quick tour of my minimal workspace and the tools I use. Keep it simple, cozy and authentic.', notes: 'Show desk setup, favorite tools, lighting.', thumbnail: { x: 476, y: 159, source: 'ideas' } },
  { id: 'idea-3', title: 'Questions I get every week', type: 'Carousel', category: 'Community', theme: 'Community', platform: 'instagram', status: 'Idea', description: 'Answer the most common questions I get about content, business, and daily routines. Keep it friendly and straight to the point.', notes: 'List top 5 questions from DMs and comments.', thumbnail: { x: 749, y: 159, source: 'ideas' } },
  { id: 'idea-4', title: 'Golden hour in the city', type: 'Story', category: 'Visual', theme: 'Visual', platform: 'instagram', status: 'Draft', description: 'Quick shots from a recent golden hour walk. Focus on light, color and little details.', notes: 'Capture 5–8 vertical shots. Use natural sound if possible.', thumbnail: { x: 206, y: 458, source: 'ideas' } },
  { id: 'idea-5', title: 'Current favorites', type: 'Carousel', category: 'Lifestyle', theme: 'Lifestyle', platform: 'instagram', status: 'Planned', description: "Share 5 things I'm loving right now: products, tools, books, or small habits.", notes: 'Include a mix of practical + personal. Keep it authentic.', thumbnail: { x: 476, y: 458, source: 'ideas' } },
  { id: 'idea-6', title: 'Week in my life', type: 'Reel', category: 'Personal', theme: 'Personal', platform: 'tiktok', status: 'Idea', description: 'A quick, honest look at the highs, lows and in-between moments from this week.', notes: 'Include 3–5 short clips + voiceover or captions.', thumbnail: { x: 749, y: 458, source: 'ideas' } },
];

function readIdeas(): IdeaItem[] {
  if (typeof window === 'undefined') return IDEA_SEED;
  try {
    const raw = window.localStorage.getItem(IDEAS_STORAGE_KEY);
    if (!raw) return IDEA_SEED;
    const parsed = JSON.parse(raw) as IdeaItem[];
    return Array.isArray(parsed) && parsed.length ? parsed : IDEA_SEED;
  } catch {
    return IDEA_SEED;
  }
}

function persistIdeas(ideas: IdeaItem[]) {
  if (typeof window !== 'undefined') window.localStorage.setItem(IDEAS_STORAGE_KEY, JSON.stringify(ideas));
}

const DEMO_HASHTAG_SETS: HashtagSet[] = [
  { id: 'h1', name: 'Brand & Lifestyle', tags: ['#mybrand', '#authentic', '#lifestyle', '#contentcreator', '#aestheticlife'], count: 12, variant: 'default' },
  { id: 'h2', name: 'Travel & Experiences', tags: ['#travel', '#wanderlust', '#adventure', '#explore', '#travelgram'], count: 10, variant: 'travel' },
  { id: 'h3', name: 'Wellness & Mindset', tags: ['#wellness', '#mindset', '#selfcare', '#growthmindset', '#slowliving'], count: 9, variant: 'wellness' },
  { id: 'h4', name: 'Product & Launch', tags: ['#newproduct', '#launch', '#shopnow', '#limitededition', '#musthave'], count: 11, variant: 'product' },
];

const DEMO_RHYTHM: RhythmEntry[] = [
  { type: 'Reels', targetPerWeek: 3, color: '#c27b6a' },
  { type: 'Carousels', targetPerWeek: 2, color: '#9b7ec8' },
  { type: 'Stories', targetPerWeek: 3, color: '#4a7c5f' },
  { type: 'Static posts', targetPerWeek: 2, color: '#555f72' },
];

export const useContentCalendarStore = create<ContentCalendarStore>()((set, get) => ({
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
    if (options.resumeLatest) {
      draft = [...get().composerDrafts].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
    }
    if (options.pipelineId) {
      const pipelineItem = get().pipelineItems.find(item => item.id === options.pipelineId);
      draft = get().composerDrafts.find(item => item.pipelineId === options.pipelineId || item.id === pipelineItem?.composerId);
      if (!draft && pipelineItem) {
        draft = {
          ...composerTemplate(pipelineItem.contentType),
          postType: pipelineItem.contentType,
          platforms: pipelineItem.platforms,
          caption: pipelineItem.title,
          hook: pipelineItem.title,
          publishDate: pipelineItem.scheduledDate,
          publishTime: pipelineItem.scheduledTime ?? '10:00',
          mediaIds: pipelineItem.mediaIds ?? ['seed-media-3', 'seed-media-1', 'seed-media-9'],
          pipelineId: pipelineItem.id,
          status: pipelineItem.stage === 'ready' ? 'scheduled' : 'draft',
        };
      }
    }
    draft ??= composerTemplate(options.postType);
    const drafts = [...get().composerDrafts.filter(item => item.id !== draft.id), draft];
    persistComposerDrafts(drafts);
    set({ composerDrafts: drafts, activeComposerId: draft.id, composerReturnView: returnView, activeView: 'composer' });
  },
  closeComposer: () => set(state => ({ activeView: state.composerReturnView, activeComposerId: null })),
  saveComposerDraft: (draft) => {
    const now = new Date().toISOString();
    let pipelineId = draft.pipelineId;
    const existing = pipelineId ? get().pipelineItems.find(item => item.id === pipelineId) : undefined;
    if (!pipelineId) pipelineId = `pipeline-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const order = existing?.stage === 'drafting' ? existing.order : get().pipelineItems.filter(item => item.stage === 'drafting' && item.id !== pipelineId).length;
    const saved: ComposerDraft = { ...draft, pipelineId, status: 'draft', updatedAt: now };
    const pipeline: PipelineItem = {
      ...existing,
      id: pipelineId, title: composerTitle(saved), stage: 'drafting', order,
      platforms: saved.platforms, contentType: saved.postType, campaign: existing?.campaign ?? 'Composer',
      scheduledDate: saved.publishDate, scheduledTime: saved.publishTime,
      thumbnail: existing?.thumbnail ?? { x: 953, y: 176, source: 'composer' },
      checklistComplete: Object.values(saved.checklist).filter(Boolean).length,
      checklistTotal: 6, mediaIds: saved.mediaIds, composerId: saved.id,
    };
    const pipelineItems = normalizeOrders([...get().pipelineItems.filter(item => item.id !== pipelineId), pipeline]);
    const composerDrafts = [...get().composerDrafts.filter(item => item.id !== saved.id), saved];
    persistPipelineItems(pipelineItems); persistComposerDrafts(composerDrafts);
    set({ pipelineItems, composerDrafts, activeComposerId: saved.id });
    return saved;
  },
  scheduleComposer: (draft) => {
    const now = new Date().toISOString();
    let pipelineId = draft.pipelineId;
    const existingPipeline = pipelineId ? get().pipelineItems.find(item => item.id === pipelineId) : undefined;
    if (!pipelineId) pipelineId = `pipeline-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const calendarPostId = draft.calendarPostId ?? `composer-post-${draft.id}`;
    const order = existingPipeline?.stage === 'ready' ? existingPipeline.order : get().pipelineItems.filter(item => item.stage === 'ready' && item.id !== pipelineId).length;
    const saved: ComposerDraft = { ...draft, pipelineId, calendarPostId, status: 'scheduled', updatedAt: now };
    const pipeline: PipelineItem = {
      ...existingPipeline,
      id: pipelineId, title: composerTitle(saved), stage: 'ready', order,
      platforms: saved.platforms, contentType: saved.postType, campaign: existingPipeline?.campaign ?? 'Composer',
      scheduledDate: saved.publishDate, scheduledTime: saved.publishTime,
      thumbnail: existingPipeline?.thumbnail ?? { x: 953, y: 176, source: 'composer' },
      checklistComplete: Object.values(saved.checklist).filter(Boolean).length,
      checklistTotal: 6, mediaIds: saved.mediaIds, composerId: saved.id,
    };
    const calendarPost: ContentPost = {
      id: calendarPostId, title: composerTitle(saved), type: saved.postType, status: 'Scheduled',
      date: saved.publishDate, time: saved.publishTime, platforms: saved.platforms,
      category: 'Composer', thumbnailBg: '#d6b59e', composerId: saved.id,
    };
    const pipelineItems = normalizeOrders([...get().pipelineItems.filter(item => item.id !== pipelineId), pipeline]);
    const posts = [...get().posts.filter(post => post.id !== calendarPostId), calendarPost];
    const composerDrafts = [...get().composerDrafts.filter(item => item.id !== saved.id), saved];
    persistPipelineItems(pipelineItems); persistComposerDrafts(composerDrafts); persistComposerPosts(posts);
    set({ pipelineItems, posts, composerDrafts, activeComposerId: saved.id, activeView: 'calendar' });
    return saved;
  },

  weekOf: '2025-04-21',
  currentMonth: '2025-04',
  setCurrentMonth: (m) => useContentCalendarStore.setState({ currentMonth: m }),
  posts: [...DEMO_POSTS, ...readComposerPosts()],
  drafts: DEMO_DRAFTS,
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
  convertIdeaToPipeline: (id) => {
    const idea = get().ideas.find(candidate => candidate.id === id);
    if (!idea || idea.linkedPipelineId) return;
    const pipelineId = `pipeline-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const order = get().pipelineItems.filter(item => item.stage === 'drafting').length;
    const pipelineItem: PipelineItem = {
      id: pipelineId, title: idea.title, stage: 'drafting', order,
      platforms: [idea.platform], contentType: idea.type, campaign: idea.theme,
      scheduledDate: '2025-04-27', thumbnail: idea.thumbnail,
      checklistComplete: 1, checklistTotal: 3,
    };
    const pipelineItems = [...get().pipelineItems, pipelineItem];
    const ideas = get().ideas.map(candidate => candidate.id === id ? { ...candidate, status: 'Planned' as const, linkedPipelineId: pipelineId } : candidate);
    persistPipelineItems(pipelineItems);
    persistIdeas(ideas);
    set({ pipelineItems, ideas });
  },
  hashtagSets: DEMO_HASHTAG_SETS,
  contentRhythm: DEMO_RHYTHM,
  stats: { planned: 12, scheduled: 8, published: 14, ideas: 27 },

  pipelineItems: readPipelineItems(),
  pipelineFilters: DEFAULT_PIPELINE_FILTERS,
  setPipelineFilters: (filters) => set(state => ({
    pipelineFilters: { ...state.pipelineFilters, ...filters },
  })),
  clearPipelineFilters: () => set({ pipelineFilters: DEFAULT_PIPELINE_FILTERS }),
  addPipelineItem: (item) => {
    const siblings = get().pipelineItems.filter(existing => existing.stage === item.stage);
    const next = [...get().pipelineItems, {
      ...item,
      id: `pipeline-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      order: siblings.length,
    }];
    persistPipelineItems(next);
    set({ pipelineItems: next });
  },
  updatePipelineItem: (id, updates) => {
    const next = normalizeOrders(get().pipelineItems.map(item => item.id === id ? { ...item, ...updates } : item));
    persistPipelineItems(next);
    set({ pipelineItems: next });
  },
  movePipelineItem: (id, stage, index) => {
    const moving = get().pipelineItems.find(item => item.id === id);
    if (!moving) return;
    const without = get().pipelineItems.filter(item => item.id !== id);
    const target = without.filter(item => item.stage === stage).sort((a, b) => a.order - b.order);
    target.splice(Math.max(0, Math.min(index, target.length)), 0, { ...moving, stage });
    const other = without.filter(item => item.stage !== stage);
    const next = normalizeOrders([...other, ...target]);
    persistPipelineItems(next);
    set({ pipelineItems: next });
  },
}));
