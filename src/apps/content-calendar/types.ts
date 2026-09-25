export type Platform = 'instagram' | 'tiktok' | 'youtube' | 'pinterest';
export type PostType = 'Reel' | 'Carousel' | 'Story' | 'Static';
export type PostStatus = 'Scheduled' | 'Planned' | 'Published' | 'Idea';
export type PipelineStage = 'ideas' | 'drafting' | 'ready' | 'published';
export type ContentCalendarView =
  | 'dashboard' | 'calendar' | 'pipeline'
  | 'ideas' | 'hashtags' | 'media'
  | 'templates' | 'analytics' | 'campaigns'
  | 'settings' | 'composer';

export interface ContentPost {
  id: string;
  title: string;
  type: PostType;
  status: PostStatus;
  date: string;
  time?: string;
  platforms: Platform[];
  category: string;
  thumbnailBg: string;
  imageCount?: number;
  duration?: string;
  composerId?: string;
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
  campaign: string;
  scheduledDate: string;
  scheduledTime?: string;
  thumbnail: PipelineThumbnail;
  checklistComplete: number;
  checklistTotal: number;
  featuredSlot?: boolean;
  mediaIds?: string[];
  composerId?: string;
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

export interface HashtagSet {
  id: string;
  name: string;
  tags: string[];
  count: number;
  variant: 'default' | 'travel' | 'wellness' | 'product';
}

export interface ContentRhythmItem {
  type: PostType;
  targetPerWeek: number;
  color: string;
}
