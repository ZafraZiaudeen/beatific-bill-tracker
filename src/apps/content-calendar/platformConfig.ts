// ─── Preview Layout ───────────────────────────────────────────────────────────
export type PreviewLayout = 'feed' | 'fullscreen' | 'card' | 'text-only'

// ─── Field Set ────────────────────────────────────────────────────────────────
// Controls exactly which form sections appear for a given platform + post type.
export interface PlatformFieldSet {
  // Text content
  caption: boolean
  captionLabel: string       // "Caption" | "Post text" | "Description"
  captionMaxLength: number
  headline: boolean          // title field (YouTube video title, Pinterest pin title)
  headlineLabel: string      // "Video title" | "Pin title"
  headlineMaxLength: number
  description: boolean       // long-form description (YouTube)
  descriptionMaxLength: number
  // Discovery
  hashtags: boolean
  hashtagsMax: number
  // Metadata
  altText: boolean
  hook: boolean
  cta: boolean
  // Media
  media: boolean
  mediaMax: number
  // Engagement
  firstComment: boolean
  // Story-specific
  sticker: boolean
  frames: boolean
  expiry: boolean
  // Carousel-specific
  slides: boolean
  coverSlide: boolean
  // YouTube-specific
  thumbnail: boolean
  playlist: boolean
  visibility: boolean
  audience: boolean
  endScreens: boolean
  chapters: boolean
  subtitles: boolean
  // Pinterest-specific
  board: boolean
  destinationUrl: boolean
}

// ─── Post Type ────────────────────────────────────────────────────────────────
export interface PlatformPostType {
  id: string
  label: string
  fields: PlatformFieldSet
  previewLayout: PreviewLayout
}

// ─── Platform Config ──────────────────────────────────────────────────────────
export interface PlatformConfig {
  label: string
  icon: string
  color: string
  postTypes: PlatformPostType[]
  isCustom?: boolean
}

export interface PlatformTemplate extends PlatformConfig {
  id: string
  domains: string[]
}

export interface PlatformUrlInfo {
  hostname: string
  rootDomain: string
  label: string
  url: string
}

export type PlatformDiscoverySource = 'template' | 'metadata' | 'manual'
export type PlatformFetchStatus = 'success' | 'failed' | 'skipped'

export interface PlatformDiscoveryResult {
  source: PlatformDiscoverySource
  confidence: 'high' | 'medium' | 'low'
  identity: {
    id: string
    label: string
    icon: string
    color: string
    url: string
    hostname: string
    rootDomain: string
  }
  postTypes: PlatformPostType[]
  fetchStatus: PlatformFetchStatus
  message: string
}

// ─── Field Set Helpers ────────────────────────────────────────────────────────
const EMPTY_FIELDS: PlatformFieldSet = {
  caption: false, captionLabel: 'Caption', captionMaxLength: 2200,
  headline: false, headlineLabel: 'Title', headlineMaxLength: 100,
  description: false, descriptionMaxLength: 0,
  hashtags: false, hashtagsMax: 30,
  altText: false, hook: false, cta: false,
  media: false, mediaMax: 10, firstComment: false,
  sticker: false, frames: false, expiry: false,
  slides: false, coverSlide: false,
  thumbnail: false, playlist: false, visibility: false,
  audience: false, endScreens: false, chapters: false, subtitles: false,
  board: false, destinationUrl: false,
}

function fields(overrides: Partial<PlatformFieldSet>): PlatformFieldSet {
  return { ...EMPTY_FIELDS, ...overrides }
}

// ─── Instagram / TikTok field presets ────────────────────────────────────────
const IG_REEL_FIELDS = fields({
  caption: true, captionMaxLength: 2200,
  hashtags: true, hashtagsMax: 30,
  altText: true, hook: true, cta: true,
  media: true, mediaMax: 1, firstComment: true,
})

const IG_CAROUSEL_FIELDS = fields({
  caption: true, captionMaxLength: 2200,
  hashtags: true, hashtagsMax: 30,
  altText: true, cta: true,
  media: true, mediaMax: 10, firstComment: true,
  slides: true, coverSlide: true,
})

const IG_STORY_FIELDS = fields({
  caption: true, captionLabel: 'Caption / Story note', captionMaxLength: 300,
  hashtags: true, hashtagsMax: 30,
  altText: true, hook: false, cta: true,
  media: true, mediaMax: 10,
  sticker: true, frames: true, expiry: true,
})

const IG_STATIC_FIELDS = fields({
  caption: true, captionMaxLength: 2200,
  hashtags: true, hashtagsMax: 30,
  altText: true, cta: true,
  media: true, mediaMax: 1, firstComment: true,
})

// ─── Pinterest field presets ──────────────────────────────────────────────────
const PIN_BASE = fields({
  headline: true, headlineLabel: 'Pin title', headlineMaxLength: 100,
  description: true, descriptionMaxLength: 500,
  hashtags: true, hashtagsMax: 20,
  altText: true, cta: true,
  media: true, mediaMax: 1,
  board: true, destinationUrl: true,
})

const PIN_IDEA_FIELDS = fields({
  ...PIN_BASE,
  frames: true,
  media: true, mediaMax: 20,
})

// ─── YouTube field presets ────────────────────────────────────────────────────
const YT_LONGFORM_FIELDS = fields({
  headline: true, headlineLabel: 'Video title', headlineMaxLength: 100,
  description: true, descriptionMaxLength: 5000,
  hashtags: true, hashtagsMax: 500,
  hook: true, cta: true,
  media: true, mediaMax: 1, firstComment: true,
  thumbnail: true, playlist: true, visibility: true,
  audience: true, endScreens: true, chapters: true, subtitles: true,
})

const YT_SHORT_FIELDS = fields({
  headline: true, headlineLabel: 'Video title', headlineMaxLength: 100,
  description: true, descriptionMaxLength: 500,
  hashtags: true, hashtagsMax: 30,
  hook: true, cta: true,
  media: true, mediaMax: 1,
})

const YT_COMMUNITY_FIELDS = fields({
  caption: true, captionLabel: 'Post text', captionMaxLength: 5000,
  media: true, mediaMax: 1,
  cta: true,
})

const SOCIAL_TEXT_FIELDS = fields({
  caption: true, captionLabel: 'Post text', captionMaxLength: 3000,
  hashtags: true, hashtagsMax: 10,
  media: true, mediaMax: 4,
  cta: true,
})

const SHORT_TEXT_FIELDS = fields({
  caption: true, captionLabel: 'Post text', captionMaxLength: 280,
  hashtags: true, hashtagsMax: 6,
  media: true, mediaMax: 4,
})

const THREAD_FIELDS = fields({
  caption: true, captionLabel: 'Thread starter', captionMaxLength: 280,
  hashtags: true, hashtagsMax: 6,
  media: true, mediaMax: 4,
  hook: true,
})

const ARTICLE_FIELDS = fields({
  headline: true, headlineLabel: 'Article title', headlineMaxLength: 120,
  description: true, descriptionMaxLength: 10000,
  media: true, mediaMax: 1,
  cta: true,
})

const NEWSLETTER_FIELDS = fields({
  headline: true, headlineLabel: 'Subject line', headlineMaxLength: 120,
  description: true, descriptionMaxLength: 12000,
  cta: true,
})

const LINK_POST_FIELDS = fields({
  headline: true, headlineLabel: 'Link title', headlineMaxLength: 120,
  caption: true, captionLabel: 'Post text', captionMaxLength: 3000,
  destinationUrl: true,
  cta: true,
})

const POLL_FIELDS = fields({
  caption: true, captionLabel: 'Poll question', captionMaxLength: 300,
  cta: true,
})

const STREAM_FIELDS = fields({
  headline: true, headlineLabel: 'Stream title', headlineMaxLength: 140,
  description: true, descriptionMaxLength: 5000,
  thumbnail: true,
  visibility: true,
})

export const PLATFORM_TEMPLATES: Record<string, PlatformTemplate> = {
  linkedin: {
    id: 'linkedin', domains: ['linkedin.com'],
    label: 'LinkedIn', icon: 'in', color: '#0A66C2',
    postTypes: [
      { id: 'Post', label: 'Post', fields: SOCIAL_TEXT_FIELDS, previewLayout: 'feed' },
      { id: 'Article', label: 'Article', fields: ARTICLE_FIELDS, previewLayout: 'card' },
      { id: 'Newsletter', label: 'Newsletter', fields: NEWSLETTER_FIELDS, previewLayout: 'card' },
    ],
  },
  x: {
    id: 'x', domains: ['x.com', 'twitter.com'],
    label: 'X', icon: 'X', color: '#111111',
    postTypes: [
      { id: 'Post', label: 'Post', fields: SHORT_TEXT_FIELDS, previewLayout: 'text-only' },
      { id: 'Thread', label: 'Thread', fields: THREAD_FIELDS, previewLayout: 'text-only' },
    ],
  },
  threads: {
    id: 'threads', domains: ['threads.net'],
    label: 'Threads', icon: '@', color: '#111111',
    postTypes: [
      { id: 'Post', label: 'Post', fields: SOCIAL_TEXT_FIELDS, previewLayout: 'text-only' },
      { id: 'Thread', label: 'Thread', fields: THREAD_FIELDS, previewLayout: 'text-only' },
    ],
  },
  reddit: {
    id: 'reddit', domains: ['reddit.com'],
    label: 'Reddit', icon: 'R', color: '#FF4500',
    postTypes: [
      { id: 'Text Post', label: 'Text Post', fields: fields({ headline: true, headlineLabel: 'Post title', headlineMaxLength: 300, description: true, descriptionMaxLength: 40000 }), previewLayout: 'card' },
      { id: 'Link Post', label: 'Link Post', fields: LINK_POST_FIELDS, previewLayout: 'card' },
      { id: 'Image/Video Post', label: 'Image/Video Post', fields: fields({ headline: true, headlineLabel: 'Post title', headlineMaxLength: 300, media: true, mediaMax: 20, caption: true, captionLabel: 'Body text', captionMaxLength: 40000 }), previewLayout: 'feed' },
      { id: 'Poll', label: 'Poll', fields: POLL_FIELDS, previewLayout: 'text-only' },
    ],
  },
  substack: {
    id: 'substack', domains: ['substack.com'],
    label: 'Substack', icon: 'S', color: '#FF6719',
    postTypes: [
      { id: 'Newsletter', label: 'Newsletter', fields: NEWSLETTER_FIELDS, previewLayout: 'card' },
      { id: 'Post', label: 'Post', fields: ARTICLE_FIELDS, previewLayout: 'card' },
    ],
  },
  medium: {
    id: 'medium', domains: ['medium.com'],
    label: 'Medium', icon: 'M', color: '#111111',
    postTypes: [
      { id: 'Article', label: 'Article', fields: ARTICLE_FIELDS, previewLayout: 'card' },
      { id: 'Story', label: 'Story', fields: ARTICLE_FIELDS, previewLayout: 'card' },
    ],
  },
  discord: {
    id: 'discord', domains: ['discord.com', 'discord.gg'],
    label: 'Discord', icon: 'D', color: '#5865F2',
    postTypes: [
      { id: 'Message', label: 'Message', fields: fields({ caption: true, captionLabel: 'Message text', captionMaxLength: 4000, media: true, mediaMax: 10 }), previewLayout: 'text-only' },
      { id: 'Announcement', label: 'Announcement', fields: fields({ headline: true, headlineLabel: 'Announcement title', headlineMaxLength: 120, caption: true, captionLabel: 'Announcement text', captionMaxLength: 4000, media: true, mediaMax: 10, cta: true }), previewLayout: 'card' },
    ],
  },
  twitch: {
    id: 'twitch', domains: ['twitch.tv'],
    label: 'Twitch', icon: 'T', color: '#9146FF',
    postTypes: [
      { id: 'Stream', label: 'Stream', fields: STREAM_FIELDS, previewLayout: 'card' },
      { id: 'Clip', label: 'Clip', fields: fields({ headline: true, headlineLabel: 'Clip title', headlineMaxLength: 100, media: true, mediaMax: 1, caption: true, captionLabel: 'Clip note', captionMaxLength: 500 }), previewLayout: 'fullscreen' },
    ],
  },
  snapchat: {
    id: 'snapchat', domains: ['snapchat.com'],
    label: 'Snapchat', icon: 'S', color: '#FFFC00',
    postTypes: [
      { id: 'Snap', label: 'Snap', fields: fields({ caption: true, captionLabel: 'Caption', captionMaxLength: 250, media: true, mediaMax: 1, sticker: true }), previewLayout: 'fullscreen' },
      { id: 'Story', label: 'Story', fields: fields({ caption: true, captionLabel: 'Story note', captionMaxLength: 250, media: true, mediaMax: 10, frames: true, sticker: true, expiry: true }), previewLayout: 'fullscreen' },
      { id: 'Spotlight', label: 'Spotlight', fields: fields({ caption: true, captionLabel: 'Caption', captionMaxLength: 250, media: true, mediaMax: 1, hashtags: true, hashtagsMax: 20 }), previewLayout: 'fullscreen' },
    ],
  },
  bluesky: {
    id: 'bluesky', domains: ['bsky.app', 'bluesky.app'],
    label: 'Bluesky', icon: 'B', color: '#0085FF',
    postTypes: [
      { id: 'Post', label: 'Post', fields: SHORT_TEXT_FIELDS, previewLayout: 'text-only' },
      { id: 'Thread', label: 'Thread', fields: THREAD_FIELDS, previewLayout: 'text-only' },
    ],
  },
  tumblr: {
    id: 'tumblr', domains: ['tumblr.com'],
    label: 'Tumblr', icon: 't', color: '#35465C',
    postTypes: [
      { id: 'Post', label: 'Post', fields: SOCIAL_TEXT_FIELDS, previewLayout: 'feed' },
      { id: 'Photo', label: 'Photo', fields: fields({ caption: true, captionLabel: 'Caption', captionMaxLength: 4000, media: true, mediaMax: 10, hashtags: true, hashtagsMax: 30, altText: true }), previewLayout: 'feed' },
      { id: 'Video', label: 'Video', fields: fields({ caption: true, captionLabel: 'Caption', captionMaxLength: 4000, media: true, mediaMax: 1, hashtags: true, hashtagsMax: 30 }), previewLayout: 'fullscreen' },
    ],
  },
  lemon8: {
    id: 'lemon8', domains: ['lemon8-app.com', 'lemon8.app'],
    label: 'Lemon8', icon: 'L8', color: '#FFCB3F',
    postTypes: [
      { id: 'Post', label: 'Post', fields: fields({ headline: true, headlineLabel: 'Post title', headlineMaxLength: 100, caption: true, captionLabel: 'Caption', captionMaxLength: 2200, media: true, mediaMax: 10, hashtags: true, hashtagsMax: 30, altText: true }), previewLayout: 'feed' },
    ],
  },
}

// ─── Built-in Platform Configs ────────────────────────────────────────────────
export const PLATFORM_CONFIG: Record<string, PlatformConfig> = {
  instagram: {
    label: 'Instagram', icon: 'instagram', color: '#e24b3d',
    postTypes: [
      { id: 'Reel',     label: 'Reel',     fields: IG_REEL_FIELDS,     previewLayout: 'fullscreen' },
      { id: 'Carousel', label: 'Carousel', fields: IG_CAROUSEL_FIELDS, previewLayout: 'feed' },
      { id: 'Story',    label: 'Story',    fields: IG_STORY_FIELDS,    previewLayout: 'fullscreen' },
      { id: 'Static',   label: 'Static',   fields: IG_STATIC_FIELDS,   previewLayout: 'feed' },
    ],
  },
  tiktok: {
    label: 'TikTok', icon: 'tiktok', color: '#010101',
    postTypes: [
      { id: 'Reel',   label: 'Video', fields: IG_REEL_FIELDS,   previewLayout: 'fullscreen' },
      { id: 'Story',  label: 'Story', fields: IG_STORY_FIELDS,  previewLayout: 'fullscreen' },
      { id: 'Static', label: 'Photo', fields: IG_STATIC_FIELDS, previewLayout: 'feed' },
    ],
  },
  pinterest: {
    label: 'Pinterest', icon: 'pinterest', color: '#c92f3e',
    postTypes: [
      { id: 'Standard Pin', label: 'Standard Pin', fields: PIN_BASE,       previewLayout: 'feed' },
      { id: 'Video Pin',    label: 'Video Pin',    fields: PIN_BASE,       previewLayout: 'feed' },
      { id: 'Idea Pin',     label: 'Idea Pin',     fields: PIN_IDEA_FIELDS, previewLayout: 'feed' },
    ],
  },
  youtube: {
    label: 'YouTube', icon: 'youtube', color: '#cf352f',
    postTypes: [
      { id: 'Long-form Video', label: 'Long-form Video', fields: YT_LONGFORM_FIELDS, previewLayout: 'feed' },
      { id: 'Short',           label: 'Short',           fields: YT_SHORT_FIELDS,    previewLayout: 'fullscreen' },
      { id: 'Community Post',  label: 'Community Post',  fields: YT_COMMUNITY_FIELDS, previewLayout: 'feed' },
    ],
  },
  facebook: {
    label: 'Facebook', icon: 'facebook', color: '#1877f2',
    postTypes: [
      { id: 'Post',     label: 'Post',    fields: IG_STATIC_FIELDS,   previewLayout: 'feed' },
      { id: 'Reel',     label: 'Reel',    fields: IG_REEL_FIELDS,     previewLayout: 'fullscreen' },
      { id: 'Story',    label: 'Story',   fields: IG_STORY_FIELDS,    previewLayout: 'fullscreen' },
    ],
  },
}

// Default platforms shown when the user has not customised the active list.
// To add a new built-in platform: add it to PLATFORM_CONFIG above, then add its key here.
export const DEFAULT_ACTIVE_PLATFORMS: string[] = ['instagram', 'tiktok', 'pinterest', 'youtube']
export const ACTIVE_PLATFORMS = DEFAULT_ACTIVE_PLATFORMS

// ─── Generic Fallback ─────────────────────────────────────────────────────────
// Used when a platform ID is not found in PLATFORM_CONFIG or custom platforms.
export const GENERIC_PLATFORM_CONFIG: PlatformConfig = {
  label: 'Other', icon: 'generic', color: '#7c8587',
  postTypes: [
    { id: 'Post',  label: 'Post',  fields: IG_STATIC_FIELDS, previewLayout: 'feed' },
    { id: 'Video', label: 'Video', fields: IG_REEL_FIELDS,   previewLayout: 'fullscreen' },
    { id: 'Story', label: 'Story', fields: IG_STORY_FIELDS,  previewLayout: 'fullscreen' },
  ],
}

// ─── Custom Platform Storage ──────────────────────────────────────────────────
function slugifyPlatformId(value: string): string {
  return value.toLowerCase().replace(/^www\./, '').replace(/\.[a-z]{2,}$/i, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'custom-platform'
}

export function normalizePlatformUrl(raw: string): PlatformUrlInfo {
  const url = raw.trim().match(/^https?:\/\//i) ? raw.trim() : `https://${raw.trim()}`
  const parsed = new URL(url)
  const hostname = parsed.hostname.replace(/^www\./, '').toLowerCase()
  const parts = hostname.split('.').filter(Boolean)
  const rootDomain = parts.length > 2 ? parts.slice(-2).join('.') : hostname
  const labelBase = hostname.split('.')[0] || rootDomain.split('.')[0] || 'Platform'
  const label = labelBase.charAt(0).toUpperCase() + labelBase.slice(1)
  return { hostname, rootDomain, label, url: parsed.href }
}

export function getTemplateForDomain(domain: string): PlatformTemplate | null {
  const normalized = domain.replace(/^www\./, '').toLowerCase()
  return Object.values(PLATFORM_TEMPLATES).find(template =>
    template.domains.some(templateDomain =>
      normalized === templateDomain || normalized.endsWith(`.${templateDomain}`) || normalized.includes(templateDomain.split('.')[0])
    )
  ) ?? null
}

async function fetchWebsiteMetadata(url: string): Promise<Partial<Pick<PlatformConfig, 'label' | 'icon' | 'color'>> | null> {
  if (typeof fetch === 'undefined') return null
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null
  const timeout = controller && typeof window !== 'undefined' ? window.setTimeout(() => controller.abort(), 3500) : null
  try {
    const response = await fetch(url, { signal: controller?.signal, mode: 'cors' })
    if (!response.ok) return null
    const html = await response.text()
    const readMeta = (name: string) => {
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const propertyMatch = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["']`, 'i'))
      if (propertyMatch?.[1]) return propertyMatch[1].trim()
      const reversedMatch = html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escaped}["']`, 'i'))
      return reversedMatch?.[1]?.trim()
    }
    const readLink = (rel: string) => {
      const escaped = rel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const linkMatch = html.match(new RegExp(`<link[^>]+rel=["'][^"']*${escaped}[^"']*["'][^>]+href=["']([^"']+)["']`, 'i'))
      return linkMatch?.[1]?.trim()
    }
    const title = readMeta('og:site_name') || readMeta('application-name') || html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim()
    const icon = readLink('icon')
    const color = readMeta('theme-color')
    return {
      label: title ? title.replace(/\s*[|-].*$/, '').trim() : undefined,
      icon: icon ?? undefined,
      color: color && /^#[0-9a-f]{3,8}$/i.test(color) ? color : undefined,
    }
  } catch {
    return null
  } finally {
    if (timeout && typeof window !== 'undefined') window.clearTimeout(timeout)
  }
}

export async function discoverPlatformFromUrl(raw: string): Promise<PlatformDiscoveryResult> {
  const info = normalizePlatformUrl(raw)
  const template = getTemplateForDomain(info.hostname) ?? getTemplateForDomain(info.rootDomain)
  const metadata = await fetchWebsiteMetadata(info.url)
  if (template) {
    return {
      source: 'template',
      confidence: 'high',
      identity: {
        id: template.id,
        label: template.label,
        icon: metadata?.icon ?? template.icon,
        color: metadata?.color ?? template.color,
        url: info.url,
        hostname: info.hostname,
        rootDomain: info.rootDomain,
      },
      postTypes: template.postTypes,
      fetchStatus: metadata ? 'success' : 'failed',
      message: metadata
        ? `${template.label} template matched and site metadata was loaded.`
        : `${template.label} template matched. Site metadata could not be fetched, so template details were used.`,
    }
  }
  const label = metadata?.label || info.label
  return {
    source: metadata ? 'metadata' : 'manual',
    confidence: metadata ? 'medium' : 'low',
    identity: {
      id: slugifyPlatformId(info.rootDomain),
      label,
      icon: metadata?.icon ?? label.charAt(0).toUpperCase(),
      color: metadata?.color ?? '#52848a',
      url: info.url,
      hostname: info.hostname,
      rootDomain: info.rootDomain,
    },
    postTypes: [],
    fetchStatus: metadata ? 'success' : 'failed',
    message: metadata
      ? 'Website metadata was loaded. Choose fields manually because no trusted platform template exists for this domain.'
      : 'This site is not in the template library and metadata could not be fetched. Choose fields manually.',
  }
}

const CUSTOM_PLATFORMS_KEY = 'content-edit.custom-platforms.v1'
const ACTIVE_PLATFORMS_KEY = 'content-edit.active-platforms.v1'

export interface CustomPlatformPostType {
  id: string
  label: string
  previewLayout: PreviewLayout
  fields: PlatformFieldSet
}

export interface CustomPlatformConfig extends PlatformConfig {
  id: string
  isCustom: true
  createdAt: string
}

export function loadCustomPlatforms(): Record<string, CustomPlatformConfig> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(CUSTOM_PLATFORMS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, CustomPlatformConfig>
    return typeof parsed === 'object' && parsed !== null ? parsed : {}
  } catch { return {} }
}

export function saveCustomPlatform(config: CustomPlatformConfig): void {
  if (typeof window === 'undefined') return
  const current = loadCustomPlatforms()
  window.localStorage.setItem(CUSTOM_PLATFORMS_KEY, JSON.stringify({
    ...current,
    [config.id]: config,
  }))
  const active = getActivePlatformIds()
  if (!active.includes(config.id)) saveActivePlatformIds([...active, config.id])
}

export function deleteCustomPlatform(id: string): void {
  if (typeof window === 'undefined') return
  const current = loadCustomPlatforms()
  delete current[id]
  window.localStorage.setItem(CUSTOM_PLATFORMS_KEY, JSON.stringify(current))
  const active = getActivePlatformIds().filter(platformId => platformId !== id)
  saveActivePlatformIds(active.length ? active : DEFAULT_ACTIVE_PLATFORMS)
}

export function getAllPlatforms(): Record<string, PlatformConfig> {
  return { ...PLATFORM_CONFIG, ...loadCustomPlatforms() }
}

export function getPlatformConfig(id: string): PlatformConfig {
  return getAllPlatforms()[id] ?? { ...GENERIC_PLATFORM_CONFIG, label: id }
}

export function getActivePlatformIds(): string[] {
  if (typeof window === 'undefined') return DEFAULT_ACTIVE_PLATFORMS
  try {
    const raw = window.localStorage.getItem(ACTIVE_PLATFORMS_KEY)
    if (!raw) return DEFAULT_ACTIVE_PLATFORMS
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return DEFAULT_ACTIVE_PLATFORMS
    const all = getAllPlatforms()
    const ids = parsed.filter((id): id is string => typeof id === 'string' && Boolean(all[id]))
    return ids.length ? ids : DEFAULT_ACTIVE_PLATFORMS
  } catch {
    return DEFAULT_ACTIVE_PLATFORMS
  }
}

export function saveActivePlatformIds(ids: string[]): void {
  if (typeof window === 'undefined') return
  const all = getAllPlatforms()
  const unique = Array.from(new Set(ids)).filter(id => Boolean(all[id]))
  window.localStorage.setItem(ACTIVE_PLATFORMS_KEY, JSON.stringify(unique))
}

export function getActivePlatformOptions(): { id: string; label: string; config: PlatformConfig }[] {
  const all = getAllPlatforms()
  return getActivePlatformIds()
    .filter(id => Boolean(all[id]))
    .map(id => ({ id, label: all[id].label, config: all[id] }))
}

export function getActivePostTypes(): PlatformPostType[] {
  const seen = new Set<string>()
  return getActivePlatformOptions().flatMap(({ config }) => config.postTypes).filter(postType => {
    if (seen.has(postType.id)) return false
    seen.add(postType.id)
    return true
  })
}

export function getPostTypeConfig(platformId: string, postTypeId: string): PlatformPostType {
  const platform = getPlatformConfig(platformId)
  return platform.postTypes.find(pt => pt.id === postTypeId) ?? platform.postTypes[0] ?? {
    id: postTypeId, label: postTypeId, fields: EMPTY_FIELDS, previewLayout: 'feed',
  }
}

// ─── Mode Detection ───────────────────────────────────────────────────────────
export type ComposerMode = 'single' | 'compatible' | 'incompatible'

export function getComposerMode(platforms: string[]): ComposerMode {
  if (platforms.length <= 1) return 'single'
  const all = getAllPlatforms()
  const allTypes = platforms.map(p => (all[p] ?? GENERIC_PLATFORM_CONFIG).postTypes.map(pt => pt.id))
  const intersection = allTypes.reduce((common, types) => common.filter(t => types.includes(t)))
  return intersection.length > 0 ? 'compatible' : 'incompatible'
}

export function getCompatiblePostTypes(platforms: string[]): string[] {
  if (platforms.length === 0) return PLATFORM_CONFIG.instagram.postTypes.map(pt => pt.id)
  const all = getAllPlatforms()
  const allTypes = platforms.map(p => (all[p] ?? GENERIC_PLATFORM_CONFIG).postTypes.map(pt => pt.id))
  return allTypes.reduce((common, types) => common.filter(t => types.includes(t)))
}
