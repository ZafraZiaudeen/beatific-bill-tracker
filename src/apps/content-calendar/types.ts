// Open string types — all known values live in platformConfig.ts.
// Using string instead of a fixed union lets custom platforms and post types
// be added at runtime without TypeScript changes.
export type Platform = string;
export type PostType = string;
export type PostStatus = 'Scheduled' | 'Planned' | 'Published' | 'Draft' | 'Idea';
export type PipelineStage = 'ideas' | 'drafting' | 'ready' | 'published';
export type CampaignStatus = 'draft' | 'active' | 'completed';
export type ContentCalendarView =
  | 'dashboard' | 'calendar' | 'pipeline'
  | 'ideas'
  | 'templates' | 'analytics' | 'campaigns'
  | 'performance'
  | 'settings' | 'composer' | 'platforms' | 'management';

declare global {
  interface Window {
    __CC_LICENSE_HASH__?: string;
    __CC_LOCKED_VIEWS__?: string[];
  }
}

export interface ContentPost {
  id: string;
  title: string;
  type: PostType;
  status: PostStatus;
  date: string;
  time?: string;
  platforms: Platform[];
  category: string;
  thumbnailBg?: string;
  mediaIds?: string[];
  imageCount?: number;
  duration?: string;
  composerId?: string;
  pipelineId?: string;
  campaignId?: string;
}

export interface PipelineThumbnail {
  /** Coordinates in the 1280 x 720 CSS-sized reference artwork. */
  x: number;
  y: number;
  source?: 'pipeline' | 'ideas' | 'media' | 'composer';
}

export interface PipelineItem {
  id: string;
  title: string;
  stage: PipelineStage;
  order: number;
  platforms: Platform[];
  contentType: PostType;
  badgeLabel?: string;
  campaign?: string;
  campaignId?: string;
  scheduledDate: string;
  scheduledTime?: string;
  thumbnail: PipelineThumbnail;
  checklistComplete: number;
  checklistTotal: number;
  featuredSlot?: boolean;
  mediaIds?: string[];
  composerId?: string;
  notes?: string;
}

export type ComposerStatus = 'working' | 'draft' | 'scheduled';

export interface ComposerChecklist {
  captionOnBrand: boolean;
  hashtagsRelevant: boolean;
  mediaHighQuality: boolean;
  altTextAdded: boolean;
  firstCommentIncluded: boolean;
  ctaClear: boolean;
}

export type PreviewLayerType = 'media' | 'text' | 'icon' | 'shape';
export type PreviewLayerBinding = 'username' | 'caption' | 'hashtags' | 'headline' | 'platform';

// Positions are normalized to the preview canvas (0-100), so designs scale with the phone.
export interface PreviewLayer {
  id: string;
  type: PreviewLayerType;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity?: number;
  color?: string;
  fontSize?: number;
  binding?: PreviewLayerBinding;
  text?: string;
  icon?: string;
  mediaId?: string;
  visible?: boolean;
  zIndex?: number;
  borderRadius?: number;
}

export interface PreviewDesign {
  version: 1;
  template: 'social-feed' | 'social-reel' | 'social-card' | 'social-text';
  layers: PreviewLayer[];
}

export type PreviewDesignMap = Record<string, PreviewDesign>;

// Per-platform content slot — used in incompatible multi-platform mode
// where Pinterest + YouTube each need completely independent form data.
export interface PlatformSlot {
  postType: PostType;
  caption: string;
  hashtags: string[];
  altText: string;
  hook: string;
  cta: string;
  mediaIds: string[];
  firstComment: string;
  // Flexible bag for platform-specific extras (headline, board, playlist, etc.)
  extras: Record<string, unknown>;
  previewDesign?: PreviewDesign;
  previewDesigns?: PreviewDesignMap;
}

export interface ComposerDraft {
  id: string;
  postType: PostType;
  platforms: Platform[];
  caption: string;
  hashtags: string[];
  altText: string;
  publishDate: string;
  publishTime: string;
  hook: string;
  cta: string;
  mediaIds: string[];
  firstComment: string;
  checklist: ComposerChecklist;
  status: ComposerStatus;
  pipelineId?: string;
  calendarPostId?: string;
  createdAt: string;
  updatedAt: string;
  campaignId?: string;
  // Composer mode — set automatically when platforms change
  composerMode?: 'single' | 'compatible' | 'incompatible';
  // Active platform tab in incompatible mode
  activePlatformTab?: string;
  // Per-platform independent content (incompatible mode)
  platformSlots?: Record<string, PlatformSlot>;
  // Per-platform + per-post-type content. Key format: `${platform}::${postType}`.
  contentSlots?: Record<string, PlatformSlot>;
  // Platform-specific extras for compatible/single mode
  // Key = field name (e.g. 'headline', 'board', 'playlist', 'pinTitle', etc.)
  platformExtras?: Record<string, unknown>;
  previewDesign?: PreviewDesign;
  previewDesigns?: PreviewDesignMap;
}

export interface PipelineFilters {
  search: string;
  platform: Platform | 'all';
  contentType: PostType | 'all';
  campaign: string | 'all';
  stage: PipelineStage | 'all';
}

export interface Draft {
  id: string;
  title: string;
  type: PostType;
  updatedAt: string;
}

export interface SavedIdea {
  id: string;
  title: string;
  type: PostType;
  category: string;
}

export type IdeaStatus = 'Idea' | 'Draft' | 'Planned';

export interface IdeaItem extends SavedIdea {
  theme: string;
  platform: Platform;
  status: IdeaStatus;
  description: string;
  notes: string;
  thumbnail: PipelineThumbnail;
  linkedPipelineId?: string;
}

export type MediaFolder = 'brand' | 'campaigns' | 'reels' | 'carousels';

export interface MediaItem {
  id: string;
  filename: string;
  description: string;
  mimeType: string;
  extension: string;
  width: number;
  height: number;
  size: number;
  folder: MediaFolder;
  createdAt: string;
  tags: string[];
  usedInIds: string[];
  source: { kind: 'reference'; crop: PipelineThumbnail } | { kind: 'upload' };
}

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  goal: string;
  platforms: Platform[];
  badge: string;
  timelineItems: string[];
  coverMediaId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  postType: PostType;
  platform: Platform;
  // Core content fields (kept for back-compat; empty string when not applicable)
  hook: string;
  body: string;
  cta: string;
  // Platform-specific text fields
  caption?: string;
  altText?: string;
  firstComment?: string;
  // Arbitrary platform extras (headline, contentDescription, board, destinationUrl, playlist, visibility, audience, sticker…)
  platformExtras?: Record<string, string>;
  hashtags: string[];
  mediaIds: string[];
  checklist: ComposerChecklist;
  createdAt: string;
  updatedAt: string;
  archived?: boolean;
}

export interface AnalyticsPerformanceRecord {
  id: string;
  postId: string;
  views: number;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  clicks: number;
  note: string;
  source: 'manual';
  createdAt: string;
  updatedAt: string;
}

export type ContentCalendarTheme = 'light' | 'dark';
export type ContentCalendarAccent = '#d97856' | '#9e6080' | '#7a9db5' | '#d4a843';
export type DateFormatPreference = 'medium' | 'day-first' | 'month-first' | 'iso';
export type WeekStartPreference = 0 | 1 | 6;

export interface ContentCalendarSettings {
  version: 1;
  theme: ContentCalendarTheme;
  accent: ContentCalendarAccent;
  backupIntervalDays: 3 | 7 | 14 | 30;
  lastBackupAt?: string;
  backupReminderDismissedUntil?: string;
  workspaceStartedAt: string;
  dateFormat: DateFormatPreference;
  weekStartsOn: WeekStartPreference;
  monthlyContentGoal: number;
  platformTargets: Record<string, number>;
}

export interface ContentCalendarWorkspaceBackup {
  kind: 'content-edit-workspace';
  version: 1;
  exportedAt: string;
  settings: ContentCalendarSettings;
  storage: Record<string, unknown>;
  media: Array<{
    metadata: Omit<MediaItem, 'usedInIds'> & { usedInIds: string[] };
    dataUrl?: string;
  }>;
}
