import { useState, useEffect, useCallback } from "react"
import {
  Plus, Edit2, Trash2, Globe, Check, X, ChevronRight,
  ChevronLeft, AlertTriangle,
} from "lucide-react"
import {
  PLATFORM_CONFIG,
  DEFAULT_ACTIVE_PLATFORMS,
  discoverPlatformFromUrl,
  loadCustomPlatforms,
  saveCustomPlatform,
  deleteCustomPlatform,
  getActivePlatformIds,
  saveActivePlatformIds,
  type PlatformConfig,
  type PlatformFieldSet,
  type PlatformPostType,
  type PreviewLayout,
  type CustomPlatformConfig,
} from "../platformConfig"

// ─── CSS ──────────────────────────────────────────────────────────────────────
const PLATFORMS_CSS = `
.pl-page{background:var(--cc-bg);color:#263338;min-height:100%;padding:20px 22px 32px}
.pl-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:20px}
.pl-heading{font:400 31px/1 'DM Serif Display',Georgia,serif;margin:0}
.pl-subhead{font-size:10.5px;color:#617176;margin-top:5px}
.pl-heading-line{width:110px;border-top:3px solid #d87755;border-radius:50%;margin-top:8px;transform:rotate(-2deg)}
.pl-add-btn{height:36px;padding:0 18px;border-radius:10px;background:linear-gradient(90deg,#d86e4a,#dc7b57);color:#fff;border:0;display:flex;align-items:center;gap:8px;font-size:10.5px;font:inherit}

.pl-section-label{font-size:9px;font-weight:700;letter-spacing:.08em;color:#8a9598;text-transform:uppercase;margin:20px 0 10px}
.pl-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-bottom:8px}

.pl-card{border:1px solid #ece5de;border-radius:10px;background:var(--cc-card);overflow:hidden}
.pl-card-head{display:flex;align-items:center;gap:10px;padding:12px 14px 10px;border-bottom:1px solid #f0ebe4}
.pl-card-icon{width:36px;height:36px;border-radius:9px;display:grid;place-items:center;font-size:18px;flex-shrink:0}
.pl-logo-preview{width:24px;height:24px;object-fit:contain;border-radius:5px}.pl-logo-upload{display:flex;align-items:center;gap:8px}.pl-logo-upload .pl-input{width:auto;flex:1}
.pl-card-name{font-size:12px;font-weight:600;line-height:1.2}
.pl-card-meta{font-size:8.5px;color:#7a8588;margin-top:2px}
.pl-card-body{padding:10px 14px}
.pl-post-type-row{display:flex;align-items:center;gap:6px;padding:4px 0;font-size:8.5px;border-bottom:1px solid #f4ede7}
.pl-post-type-row:last-child{border-bottom:0}
.pl-post-type-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
.pl-post-type-name{flex:1;font-weight:500}
.pl-post-type-fields{color:#7a8588;font-size:8px}
.pl-card-footer{padding:8px 14px;border-top:1px solid #f0ebe4;display:flex;align-items:center;gap:8px}
.pl-active-toggle{display:flex;align-items:center;gap:6px;font-size:8.5px;flex:1}
.pl-toggle-track{width:28px;height:15px;border-radius:99px;position:relative;transition:background .2s;cursor:pointer;border:0}
.pl-toggle-track.on{background:#d87756}
.pl-toggle-track.off{background:#cbd6d9}
.pl-toggle-thumb{position:absolute;top:2px;width:11px;height:11px;border-radius:50%;background:#fff;transition:left .2s}
.pl-toggle-track.on .pl-toggle-thumb{left:15px}
.pl-toggle-track.off .pl-toggle-thumb{left:2px}
.pl-icon-btn{width:28px;height:28px;border-radius:7px;border:1px solid #e5ddd6;background:white;display:grid;place-items:center;color:#617176}
.pl-icon-btn:hover{background:#fbe4df;border-color:#d4857a;color:#a94e3b}
.pl-icon-btn.edit:hover{background:#e8f0f4;border-color:#7aa8c0;color:#3d7595}
.pl-built-in-badge{font-size:7px;padding:2px 6px;border-radius:4px;background:#e8eef0;color:#617176;margin-left:auto}

.pl-overlay{position:fixed;inset:0;background:rgba(29,34,35,.32);z-index:1000;display:grid;place-items:center;padding:20px}
.pl-modal{width:min(560px,100%);max-height:90vh;overflow:auto;background:#fffaf6;border:1px solid #e6dbd2;border-radius:14px;box-shadow:0 20px 60px rgba(40,34,30,.22)}
.pl-modal-head{padding:20px 22px 14px;border-bottom:1px solid #ece5de;display:flex;align-items:center;justify-content:space-between}
.pl-modal-title{font:400 22px 'DM Serif Display',Georgia,serif}
.pl-modal-close{width:30px;height:30px;border-radius:7px;border:1px solid #e5ddd6;background:white;display:grid;place-items:center}
.pl-step-bar{display:flex;gap:0;padding:14px 22px;border-bottom:1px solid #ece5de}
.pl-step{display:flex;align-items:center;gap:8px;flex:1;font-size:9px;color:#8a9598}
.pl-step.done{color:#52848a}
.pl-step.active{color:#c36343;font-weight:600}
.pl-step-num{width:18px;height:18px;border-radius:50%;border:1.5px solid currentColor;display:grid;place-items:center;font-size:8px;flex-shrink:0}
.pl-step.done .pl-step-num{background:#52848a;border-color:#52848a;color:#fff}
.pl-step-sep{flex:1;height:1px;background:#e3dcd5;margin:0 4px}
.pl-modal-body{padding:20px 22px}
.pl-form-label{font-size:9.5px;font-weight:600;margin-bottom:6px;display:block}
.pl-form-group{margin-bottom:16px}
.pl-input{width:100%;border:1px solid #e6dfd8;border-radius:7px;background:var(--cc-card);outline:none;font:inherit;font-size:9.5px;padding:8px 10px;height:34px}
.pl-emoji-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:4px}
.pl-emoji-opt{width:34px;height:34px;border-radius:7px;border:1px solid #e5ddd6;background:white;font-size:18px;display:grid;place-items:center;cursor:pointer}
.pl-emoji-opt.active{border-color:#d87756;background:#fff0e8}
.pl-color-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:4px}
.pl-color-swatch{width:28px;height:28px;border-radius:6px;border:2px solid transparent;cursor:pointer}
.pl-color-swatch.active{border-color:#263338}
.pl-color-input{height:28px;padding:0 6px;border:1px solid #e5ddd6;border-radius:6px;font:inherit;font-size:9px;width:90px}
.pl-type-list{display:flex;flex-direction:column;gap:8px}
.pl-type-item{border:1px solid #ece5de;border-radius:8px;overflow:hidden}
.pl-type-item-head{display:flex;align-items:center;gap:8px;padding:8px 10px;background:rgba(255,255,255,.6);cursor:pointer}
.pl-type-item-name{flex:1;font-size:9.5px;font-weight:600}
.pl-type-item-chevron{transition:transform .2s}
.pl-type-item-chevron.open{transform:rotate(90deg)}
.pl-type-fields{padding:8px 10px 10px;background:#f7f4f0;border-top:1px solid #ece5de}
.pl-fields-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px 20px}
.pl-field-check{display:flex;align-items:center;gap:7px;font-size:8.5px;padding:3px 0}
.pl-field-check input{accent-color:#52848a}
.pl-limit-row{display:flex;gap:8px;margin-top:8px}
.pl-limit-input{height:28px;width:80px;border:1px solid #e5ddd6;border-radius:5px;padding:0 8px;font:inherit;font-size:8.5px}
.pl-layout-row{display:flex;gap:8px;margin-top:6px}
.pl-layout-opt{flex:1;border:1px solid #e5ddd6;border-radius:7px;padding:8px 6px;text-align:center;font-size:8px;background:white;cursor:pointer}
.pl-layout-opt.active{border-color:#d87756;background:#fff0e8}
.pl-layout-icon{font-size:18px;display:block;margin-bottom:4px}
.pl-add-type-btn{height:30px;border:1px dashed #c8bdb5;border-radius:6px;background:transparent;color:#7c8587;font-size:8.5px;width:100%;margin-top:6px;font:inherit}
.pl-remove-type-btn{width:22px;height:22px;border-radius:5px;border:1px solid #e5ddd6;background:white;display:grid;place-items:center;color:#a07878;flex-shrink:0}
.pl-url-row{display:flex;gap:8px}
.pl-url-row .pl-input{flex:1}
.pl-fetch-btn{height:34px;padding:0 14px;border-radius:7px;border:1px solid #d4c8be;background:white;font:inherit;font-size:9px;display:flex;align-items:center;gap:6px;white-space:nowrap}
.pl-fetch-btn:disabled{opacity:.5}
.pl-fetch-note{font-size:8px;color:#7c8587;margin-top:5px}
.pl-fetch-result{padding:8px 10px;border-radius:6px;font-size:8.5px;margin-top:8px}
.pl-fetch-result.success{background:#e7f1ec;color:#3d7558}
.pl-fetch-result.error{background:#fbe4df;color:#a94e3b}
.pl-method-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.pl-method-card{border:1px solid #e6dfd8;border-radius:8px;background:rgba(255,255,255,.74);padding:14px;text-align:left;cursor:pointer;min-height:104px;display:flex;flex-direction:column;gap:8px}
.pl-method-card:hover,.pl-method-card.active{border-color:#d87756;background:#fff0e8}
.pl-method-icon{width:34px;height:34px;border-radius:8px;background:#e8f0f4;color:#52848a;display:grid;place-items:center}
.pl-method-title{font-size:11px;font-weight:700;color:#263338}
.pl-method-copy{font-size:8.5px;color:#617176;line-height:1.45}
.pl-step-copy{font-size:9px;color:#617176;line-height:1.5;margin:0 0 14px}
.pl-modal-footer{padding:14px 22px;border-top:1px solid #ece5de;display:flex;align-items:center;justify-content:space-between}
.pl-back-btn{height:32px;padding:0 14px;border:1px solid #e5ddd6;border-radius:8px;background:white;font:inherit;font-size:9.5px;display:flex;align-items:center;gap:6px}
.pl-next-btn{height:32px;padding:0 16px;border-radius:8px;background:linear-gradient(90deg,#d86e4a,#dc7b57);color:#fff;border:0;font:inherit;font-size:9.5px;display:flex;align-items:center;gap:6px}
.pl-save-btn{height:32px;padding:0 16px;border-radius:8px;background:linear-gradient(90deg,#3d7595,#52848a);color:#fff;border:0;font:inherit;font-size:9.5px}

.pl-confirm-overlay{position:fixed;inset:0;background:rgba(29,34,35,.32);z-index:1010;display:grid;place-items:center}
.pl-confirm-box{width:360px;background:#fffaf6;border:1px solid #e6dbd2;border-radius:12px;padding:22px;box-shadow:0 12px 40px rgba(40,34,30,.18)}
.pl-confirm-box h3{font:400 20px 'DM Serif Display',Georgia,serif;margin:0 0 10px}
.pl-confirm-box p{font-size:9.5px;color:#617176;margin:0 0 16px}
.pl-confirm-actions{display:flex;justify-content:flex-end;gap:8px}
.pl-confirm-cancel{height:30px;padding:0 14px;border:1px solid #e5ddd6;border-radius:7px;background:white;font:inherit;font-size:9px}
.pl-confirm-delete{height:30px;padding:0 14px;border-radius:7px;background:#c85a50;color:#fff;border:0;font:inherit;font-size:9px}

.pl-empty{text-align:center;padding:30px;border:2px dashed #ddd5cb;border-radius:10px;color:#8a9598;font-size:9.5px}
`

// ─── Known-platform lookup table ──────────────────────────────────────────────
const KNOWN_PLATFORMS: Record<string, { name: string; icon: string; color: string; types: string[] }> = {
  "linkedin.com":  { name: "LinkedIn",    icon: "💼", color: "#0A66C2", types: ["Post", "Article", "Newsletter"] },
  "threads.net":   { name: "Threads",     icon: "🧵", color: "#010101", types: ["Post"] },
  "x.com":         { name: "X (Twitter)", icon: "🐦", color: "#000000", types: ["Post", "Thread"] },
  "twitter.com":   { name: "X (Twitter)", icon: "🐦", color: "#000000", types: ["Post", "Thread"] },
  "snapchat.com":  { name: "Snapchat",    icon: "👻", color: "#FFFC00", types: ["Snap", "Story", "Spotlight"] },
  "reddit.com":    { name: "Reddit",      icon: "🔴", color: "#FF4500", types: ["Post", "Link", "Poll"] },
  "discord.com":   { name: "Discord",     icon: "🎮", color: "#5865F2", types: ["Message", "Announcement"] },
  "twitch.tv":     { name: "Twitch",      icon: "🟣", color: "#9146FF", types: ["Stream", "Clip"] },
  "tumblr.com":    { name: "Tumblr",      icon: "🌀", color: "#35465C", types: ["Post", "Photo", "Video"] },
  "substack.com":  { name: "Substack",    icon: "📧", color: "#FF6719", types: ["Newsletter", "Post"] },
  "medium.com":    { name: "Medium",      icon: "📝", color: "#000000", types: ["Article", "Story"] },
  "lemon8.app":    { name: "Lemon8",      icon: "🍋", color: "#FFCB3F", types: ["Post"] },
  "bereal.com":    { name: "BeReal",      icon: "📸", color: "#000000", types: ["BeReal"] },
  "bluesky.app":   { name: "Bluesky",     icon: "🦋", color: "#0085FF", types: ["Post", "Thread"] },
  "bsky.app":      { name: "Bluesky",     icon: "🦋", color: "#0085FF", types: ["Post", "Thread"] },
}

function lookupByUrl(raw: string): { name: string; icon: string; color: string; types: string[] } | null {
  try {
    const url = raw.startsWith("http") ? raw : `https://${raw}`
    const hostname = new URL(url).hostname.replace(/^www\./, "")
    if (KNOWN_PLATFORMS[hostname]) return KNOWN_PLATFORMS[hostname]
    // partial match (e.g. linkedin.co.uk → linkedin.com)
    const base = Object.keys(KNOWN_PLATFORMS).find(k => hostname.endsWith(k) || hostname.includes(k.split(".")[0]))
    return base ? KNOWN_PLATFORMS[base] : null
  } catch { return null }
}

function domainLabel(raw: string): string {
  try {
    const url = raw.startsWith("http") ? raw : `https://${raw}`
    const hostname = new URL(url).hostname.replace(/^www\./, "").split(".")[0]
    return hostname.charAt(0).toUpperCase() + hostname.slice(1)
  } catch { return "" }
}

// ─── Types ─────────────────────────────────────────────────────────────────────
const EMOJI_PRESETS = ["🔵", "📰", "💼", "🎵", "📸", "🎬", "✍️", "🌐", "📱", "🎥", "💡", "🔗"]
const COLOR_PRESETS = ["#0A66C2", "#E1306C", "#FF0000", "#1DA1F2", "#4267B2", "#25D366", "#010101", "#E60023", "#d86e4a", "#52848a"]
const LAYOUT_OPTIONS: { value: PreviewLayout; label: string; icon: string }[] = [
  { value: "feed", label: "Feed post", icon: "📲" },
  { value: "fullscreen", label: "Full-screen", icon: "📱" },
  { value: "card", label: "Card / Link", icon: "🃏" },
  { value: "text-only", label: "Text only", icon: "📝" },
]

const ALL_FIELDS: { key: keyof PlatformFieldSet; label: string }[] = [
  { key: "caption", label: "Caption / text" },
  { key: "description", label: "Long description" },
  { key: "media", label: "Media (image/video)" },
  { key: "hashtags", label: "Hashtags" },
  { key: "headline", label: "Headline / title" },
  { key: "destinationUrl", label: "Link / URL" },
  { key: "altText", label: "Alt text" },
  { key: "hook", label: "Hook line" },
  { key: "cta", label: "CTA button" },
  { key: "firstComment", label: "First comment" },
  { key: "slides", label: "Carousel slides" },
  { key: "coverSlide", label: "Cover slide picker" },
  { key: "frames", label: "Story frames" },
  { key: "expiry", label: "Story expiry" },
  { key: "audience", label: "Audience / visibility" },
  { key: "visibility", label: "Public/private setting" },
  { key: "thumbnail", label: "Custom thumbnail" },
  { key: "playlist", label: "Playlist / collection" },
  { key: "endScreens", label: "End screens / cards" },
  { key: "chapters", label: "Chapters / timestamps" },
  { key: "subtitles", label: "Subtitles / captions" },
  { key: "board", label: "Board (Pinterest)" },
  { key: "sticker", label: "Interactive sticker" },
]

interface ContentTypeBuilder {
  id: string
  label: string
  fieldSet?: PlatformFieldSet
  fields: Partial<Record<keyof PlatformFieldSet, boolean>>
  captionMaxLength: number
  headlineMaxLength: number
  previewLayout: PreviewLayout
  expanded: boolean
}

interface WizardState {
  step: 1 | 2 | 3
  method?: "website" | "manual" | null
  platformId?: string
  name: string
  icon: string
  color: string
  contentTypes: ContentTypeBuilder[]
  lookupUrl: string
  lookupMessage: string
  lookupKind: "none" | "recognized" | "metadata" | "unknown" | "error"
}

function makeManualType(label = "Post"): ContentTypeBuilder {
  return {
    id: Math.random().toString(36).slice(2),
    label,
    fields: {},
    captionMaxLength: 2200,
    headlineMaxLength: 100,
    previewLayout: "feed",
    expanded: true,
  }
}

function makeEmptyType(): ContentTypeBuilder {
  return makeManualType("")
}

function postTypeToBuilder(postType: PlatformPostType, expanded = false): ContentTypeBuilder {
  return {
    id: postType.id,
    label: postType.label,
    fieldSet: postType.fields,
    fields: Object.fromEntries(
      Object.entries(postType.fields).filter(([, value]) => typeof value === "boolean" && value) as [keyof PlatformFieldSet, boolean][]
    ),
    captionMaxLength: postType.fields.captionMaxLength,
    headlineMaxLength: postType.fields.headlineMaxLength,
    previewLayout: postType.previewLayout,
    expanded,
  }
}

function fieldCountOf(fields: Partial<Record<keyof PlatformFieldSet, boolean>>) {
  return Object.values(fields).filter(Boolean).length
}

function buildPlatformConfig(state: WizardState, existingId?: string): CustomPlatformConfig {
  const id = existingId ?? state.platformId ?? state.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
  return {
    id,
    label: state.name,
    icon: state.icon,
    color: state.color,
    isCustom: true as const,
    createdAt: new Date().toISOString(),
    postTypes: state.contentTypes.map(ct => {
      const emptyFields: PlatformFieldSet = {
        caption: false, captionLabel: "Caption", captionMaxLength: ct.captionMaxLength,
        headline: false, headlineLabel: "Title", headlineMaxLength: ct.headlineMaxLength,
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
      const merged: PlatformFieldSet = {
        ...emptyFields,
        ...(ct.fieldSet ?? {}),
        captionMaxLength: ct.captionMaxLength,
        headlineMaxLength: ct.headlineMaxLength,
      }
      for (const key of ALL_FIELDS.map(field => field.key)) {
        ;(merged as unknown as Record<string, unknown>)[key] = !!ct.fields[key]
      }
      for (const [key, val] of Object.entries(ct.fields)) {
        if (key in merged) (merged as unknown as Record<string, unknown>)[key] = val
      }
      return {
        id: ct.label || ct.id,
        label: ct.label || "Post",
        fields: merged,
        previewLayout: ct.previewLayout,
      }
    }),
  }
}

function configToWizard(cfg: CustomPlatformConfig): WizardState {
  return {
    step: 2,
    method: "manual",
    platformId: cfg.id,
    name: cfg.label,
    icon: cfg.icon,
    color: cfg.color,
    lookupUrl: "",
    lookupMessage: "",
    lookupKind: "none",
    contentTypes: cfg.postTypes.map(pt => postTypeToBuilder(pt, false)),
  }
}

function isLogoSource(value: string): boolean {
  return value.startsWith("data:image/") || value.startsWith("https://") || value.startsWith("http://")
}

async function loadLogoLocally(source: string, websiteUrl: string): Promise<string | null> {
  const candidates = [
    isLogoSource(source) ? source : "",
    (() => {
      try { return new URL("/favicon.ico", websiteUrl).href } catch { return "" }
    })(),
  ].filter(Boolean)

  for (const candidate of candidates) {
    if (candidate.startsWith("data:image/")) return candidate
    try {
      const response = await fetch(candidate, { mode: "cors" })
      if (!response.ok) continue
      const blob = await response.blob()
      if (!blob.type.startsWith("image/")) continue
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result))
        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(blob)
      })
    } catch {
      // Some websites block browser-side favicon requests; the text fallback remains usable.
    }
  }
  return null
}

function readLogoFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

// ─── Platform Icon (inline) ────────────────────────────────────────────────────
function PlatformIconBig({ platform, icon, color }: { platform?: string; icon: string; color: string }) {
  if (platform === "instagram")
    return (
      <div className="pl-card-icon" style={{ background: `${color}18` }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill={color} />
        </svg>
      </div>
    )
  return (
    <div className="pl-card-icon" style={{ background: `${color}18` }}>
      {isLogoSource(icon)
        ? <img className="pl-logo-preview" src={icon} alt="" />
        : <span style={{ fontSize: 20, color }}>{icon.length <= 2 ? icon : icon[0]}</span>}
    </div>
  )
}

// ─── Active Platforms in localStorage ─────────────────────────────────────────
// ─── Wizard ────────────────────────────────────────────────────────────────────
export function PlatformWizard({
  initial, editId, onClose, onSaved,
}: {
  initial?: CustomPlatformConfig
  editId?: string
  onClose: () => void
  onSaved: () => void
}) {
  const [state, setState] = useState<WizardState>(initial ? configToWizard(initial) : {
    step: 1, name: "", icon: "🌐", color: "#52848a",
    contentTypes: [makeManualType()],
    lookupUrl: "", lookupMessage: "", lookupKind: "none",
  })

  function setField<K extends keyof WizardState>(k: K, v: WizardState[K]) {
    setState(s => ({ ...s, [k]: v }))
  }

  function updateType(id: string, patch: Partial<ContentTypeBuilder>) {
    setState(s => ({ ...s, contentTypes: s.contentTypes.map(ct => ct.id === id ? { ...ct, ...patch } : ct) }))
  }

  function toggleField(typeId: string, fieldKey: keyof PlatformFieldSet, val: boolean) {
    setState(s => ({
      ...s,
      contentTypes: s.contentTypes.map(ct => ct.id === typeId
        ? { ...ct, fields: { ...ct.fields, [fieldKey]: val } }
        : ct),
    }))
  }

  function lookupPlatform() {
    const raw = state.lookupUrl.trim()
    if (!raw) return
    const match = lookupByUrl(raw)
    if (match) {
      const defaultTypes = match.types.map(label => ({
        ...makeEmptyType(), label,
        fields: { caption: true, media: true, hashtags: true } as Partial<Record<keyof PlatformFieldSet, boolean>>,
      }))
      setState(s => ({
        ...s,
        name: match.name,
        icon: match.icon,
        color: match.color,
        contentTypes: defaultTypes,
        lookupKind: "recognized",
        lookupMessage: `Recognised: ${match.name} — name, icon & color pre-filled. You can still edit everything.`,
      }))
    } else {
      const suggested = domainLabel(raw)
      setState(s => ({
        ...s,
        name: suggested || s.name,
        lookupKind: "unknown",
        lookupMessage: `Not recognised — "${suggested || raw}" set as name. Fill in the details below.`,
      }))
    }
  }

  function save() {
    if (!state.name.trim()) return
    const cfg = buildPlatformConfig(state, editId)
    saveCustomPlatform(cfg)
    onSaved()
    onClose()
  }

  const canNext1 = state.name.trim().length > 0
  const canSave = state.name.trim().length > 0 && state.contentTypes.length > 0 && state.contentTypes.every(ct => ct.label.trim().length > 0)

  const stepLabels = ["Identity", "Content types"]

  return (
    <div className="pl-overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="pl-modal" role="dialog">
        <div className="pl-modal-head">
          <div className="pl-modal-title">{editId ? "Edit platform" : "Add platform"}</div>
          <button className="pl-modal-close" onClick={onClose}><X size={14} /></button>
        </div>

        {/* Step bar */}
        <div className="pl-step-bar">
          {stepLabels.map((label, i) => {
            const num = (i + 1) as 1 | 2
            const isDone = state.step > num
            const isActive = state.step === num
            return (
              <div key={num} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                <div className={`pl-step${isDone ? " done" : isActive ? " active" : ""}`}>
                  <div className="pl-step-num">{isDone ? <Check size={9} /> : num}</div>
                  {label}
                </div>
                {i < stepLabels.length - 1 && <div className="pl-step-sep" />}
              </div>
            )
          })}
        </div>

        <div className="pl-modal-body">
          {/* ─ Step 1: Identity ─ */}
          {state.step === 1 && (
            <>
              {/* URL quick-setup */}
              <div className="pl-form-group" style={{ borderBottom: "1px solid #ece5de", paddingBottom: 14, marginBottom: 14 }}>
                <label className="pl-form-label">Platform website URL <span style={{ fontWeight: 400, color: "#8a9598" }}>(optional)</span></label>
                <div className="pl-url-row">
                  <input className="pl-input" placeholder="e.g. https://www.linkedin.com"
                    value={state.lookupUrl}
                    onChange={e => setField("lookupUrl", e.target.value)}
                    onKeyDown={e => e.key === "Enter" && lookupPlatform()} />
                  <button className="pl-fetch-btn" onClick={lookupPlatform}
                    disabled={!state.lookupUrl.trim()}>
                    <Globe size={12} />Look up
                  </button>
                </div>
                {state.lookupMessage && (
                  <div className={`pl-fetch-result ${state.lookupKind === "recognized" ? "success" : ""}`}
                    style={state.lookupKind === "unknown" ? { background: "#f0ede9", color: "#617176" } : {}}>
                    {state.lookupMessage}
                  </div>
                )}
                <div className="pl-fetch-note">Works with LinkedIn, Threads, X, Snapchat, Reddit and many more.</div>
              </div>

              <div className="pl-form-group">
                <label className="pl-form-label">Platform name *</label>
                <input className="pl-input" placeholder="e.g. LinkedIn, Threads, Snapchat…"
                  value={state.name} onChange={e => setField("name", e.target.value)} autoFocus />
              </div>
              <div className="pl-form-group">
                <label className="pl-form-label">Icon</label>
                <div className="pl-emoji-row">
                  {EMOJI_PRESETS.map(emoji => (
                    <button key={emoji} className={`pl-emoji-opt${state.icon === emoji ? " active" : ""}`}
                      onClick={() => setField("icon", emoji)}>{emoji}</button>
                  ))}
                  <input className="pl-input" style={{ width: 60, flex: "none" }} maxLength={2}
                    placeholder="✏️" value={EMOJI_PRESETS.includes(state.icon) ? "" : state.icon}
                    onChange={e => setField("icon", e.target.value || state.icon)} />
                </div>
              </div>
              <div className="pl-form-group">
                <label className="pl-form-label">Brand color</label>
                <div className="pl-color-row">
                  {COLOR_PRESETS.map(c => (
                    <button key={c} className={`pl-color-swatch${state.color === c ? " active" : ""}`}
                      style={{ background: c }} onClick={() => setField("color", c)} />
                  ))}
                  <input className="pl-color-input" type="color" value={state.color}
                    onChange={e => setField("color", e.target.value)} />
                </div>
              </div>
            </>
          )}

          {/* ─ Step 2: Content types ─ */}
          {state.step === 2 && (
            <div className="pl-type-list">
              {state.contentTypes.map((ct, i) => (
                <div key={ct.id} className="pl-type-item">
                  <div className="pl-type-item-head" onClick={() => updateType(ct.id, { expanded: !ct.expanded })}>
                    <span style={{ fontSize: 10, color: "#8a9598", minWidth: 16 }}>{i + 1}</span>
                    <input className="pl-input" style={{ flex: 1, height: 28 }} placeholder="Content type name, e.g. Post"
                      value={ct.label} onClick={e => e.stopPropagation()}
                      onChange={e => updateType(ct.id, { label: e.target.value })} />
                    <span style={{ fontSize: 8, color: "#8a9598", marginLeft: 6 }}>{fieldCountOf(ct.fields)} fields</span>
                    <ChevronRight size={12} className={`pl-type-item-chevron${ct.expanded ? " open" : ""}`} />
                    {state.contentTypes.length > 1 && (
                      <button className="pl-remove-type-btn" onClick={e => {
                        e.stopPropagation()
                        setState(s => ({ ...s, contentTypes: s.contentTypes.filter(c => c.id !== ct.id) }))
                      }}><X size={9} /></button>
                    )}
                  </div>
                  {ct.expanded && (
                    <div className="pl-type-fields">
                      <div className="pl-fields-grid">
                        {ALL_FIELDS.map(f => (
                          <label key={f.key} className="pl-field-check">
                            <input type="checkbox"
                              checked={!!(ct.fields as Record<string, unknown>)[f.key]}
                              onChange={e => toggleField(ct.id, f.key, e.target.checked)} />
                            {f.label}
                          </label>
                        ))}
                      </div>
                      <div className="pl-limit-row">
                        <div>
                          <div style={{ fontSize: 8, color: "#8a9598", marginBottom: 3 }}>Caption max chars</div>
                          <input className="pl-limit-input" type="number" min={50} max={50000}
                            value={ct.captionMaxLength}
                            onChange={e => updateType(ct.id, { captionMaxLength: Number(e.target.value) })} />
                        </div>
                        <div>
                          <div style={{ fontSize: 8, color: "#8a9598", marginBottom: 3 }}>Title max chars</div>
                          <input className="pl-limit-input" type="number" min={10} max={1000}
                            value={ct.headlineMaxLength}
                            onChange={e => updateType(ct.id, { headlineMaxLength: Number(e.target.value) })} />
                        </div>
                      </div>
                      <div style={{ marginTop: 10 }}>
                        <div style={{ fontSize: 8.5, fontWeight: 600, marginBottom: 5 }}>Preview layout in phone mockup</div>
                        <div className="pl-layout-row">
                          {LAYOUT_OPTIONS.map(opt => (
                            <button key={opt.value}
                              className={`pl-layout-opt${ct.previewLayout === opt.value ? " active" : ""}`}
                              onClick={() => updateType(ct.id, { previewLayout: opt.value })}>
                              <span className="pl-layout-icon">{opt.icon}</span>
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {state.contentTypes.length < 6 && (
                <button className="pl-add-type-btn"
                  onClick={() => setState(s => ({ ...s, contentTypes: [...s.contentTypes, makeEmptyType()] }))}>
                  + Add content type
                </button>
              )}
            </div>
          )}

        </div>

        <div className="pl-modal-footer">
          {state.step > 1 ? (
            <button className="pl-back-btn" onClick={() => setField("step", 1)}>
              <ChevronLeft size={12} />Back
            </button>
          ) : <div />}

          {state.step === 1 ? (
            <button className="pl-next-btn" disabled={!canNext1}
              onClick={() => setField("step", 2)}>
              Next<ChevronRight size={12} />
            </button>
          ) : (
            <button className="pl-save-btn" onClick={save} disabled={!canSave}>
              <Check size={12} style={{ marginRight: 4 }} />Save platform
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Delete Confirm ────────────────────────────────────────────────────────────
function PlatformWizardV2({
  initial, editId, onClose, onSaved,
}: {
  initial?: CustomPlatformConfig
  editId?: string
  onClose: () => void
  onSaved: () => void
}) {
  const [state, setState] = useState<WizardState>(initial ? configToWizard(initial) : {
    step: 1,
    method: null,
    name: "",
    icon: "P",
    color: "#52848a",
    contentTypes: [makeManualType()],
    lookupUrl: "",
    lookupMessage: "",
    lookupKind: "none",
  })
  const [lookupLoading, setLookupLoading] = useState(false)
  const [logoLoading, setLogoLoading] = useState(false)

  function setField<K extends keyof WizardState>(k: K, v: WizardState[K]) {
    setState(s => ({ ...s, [k]: v }))
  }

  function updateType(id: string, patch: Partial<ContentTypeBuilder>) {
    setState(s => ({ ...s, contentTypes: s.contentTypes.map(ct => ct.id === id ? { ...ct, ...patch } : ct) }))
  }

  function toggleField(typeId: string, fieldKey: keyof PlatformFieldSet, val: boolean) {
    setState(s => ({
      ...s,
      contentTypes: s.contentTypes.map(ct => ct.id === typeId
        ? { ...ct, fields: { ...ct.fields, [fieldKey]: val } }
        : ct),
    }))
  }

  async function lookupPlatform() {
    const raw = state.lookupUrl.trim()
    if (!raw) return
    setLookupLoading(true)
    try {
      const result = await discoverPlatformFromUrl(raw)
      const discoveredTypes = result.postTypes.length
        ? result.postTypes.map((postType, index) => postTypeToBuilder(postType, index === 0))
        : [makeManualType()]
      const localLogo = await loadLogoLocally(result.identity.icon, raw)
      setState(s => ({
        ...s,
        platformId: result.identity.id,
        name: result.identity.label,
        icon: localLogo ?? (result.identity.icon.length <= 2 ? result.identity.icon : result.identity.label.charAt(0).toUpperCase()),
        color: result.identity.color,
        contentTypes: discoveredTypes,
        lookupKind: result.source === "template" ? "recognized" : result.source === "metadata" ? "metadata" : "unknown",
        lookupMessage: result.message,
      }))
    } catch {
      setState(s => ({
        ...s,
        lookupKind: "error",
        lookupMessage: "That URL could not be read. Check the link or continue with manual setup.",
      }))
    } finally {
      setLookupLoading(false)
    }
  }

  async function handleLogoUpload(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return
    setLogoLoading(true)
    try {
      setField("icon", await readLogoFile(file))
    } finally {
      setLogoLoading(false)
    }
  }

  function chooseMethod(method: "website" | "manual") {
    setState(s => ({
      ...s,
      method,
      step: 2,
      contentTypes: method === "manual" ? [makeManualType()] : s.contentTypes,
      lookupMessage: "",
      lookupKind: "none",
    }))
  }

  function save() {
    if (!state.name.trim()) return
    const cfg = buildPlatformConfig(state, editId)
    saveCustomPlatform(cfg)
    onSaved()
    onClose()
  }

  const stepLabels: { num: 1 | 2 | 3; label: string }[] = initial
    ? [{ num: 2, label: "Identity" }, { num: 3, label: "Content types" }]
    : [{ num: 1, label: "Setup" }, { num: 2, label: "Identity" }, { num: 3, label: "Content types" }]
  const canMoveToContent = state.name.trim().length > 0
  const canSave = state.name.trim().length > 0 && state.contentTypes.length > 0 && state.contentTypes.every(ct => ct.label.trim().length > 0)

  return (
    <div className="pl-overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="pl-modal" role="dialog">
        <div className="pl-modal-head">
          <div className="pl-modal-title">{editId ? "Edit platform" : "Add platform"}</div>
          <button className="pl-modal-close" onClick={onClose}><X size={14} /></button>
        </div>

        <div className="pl-step-bar">
          {stepLabels.map((step, i) => {
            const isDone = state.step > step.num
            const isActive = state.step === step.num
            return (
              <div key={step.num} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                <div className={`pl-step${isDone ? " done" : isActive ? " active" : ""}`}>
                  <div className="pl-step-num">{isDone ? <Check size={9} /> : i + 1}</div>
                  {step.label}
                </div>
                {i < stepLabels.length - 1 && <div className="pl-step-sep" />}
              </div>
            )
          })}
        </div>

        <div className="pl-modal-body">
          {state.step === 1 && (
            <>
              <p className="pl-step-copy">Choose how you want to create the platform. Website setup uses trusted templates first; unknown sites stay editable without fake post types.</p>
              <div className="pl-method-grid">
                <button className={`pl-method-card${state.method === "website" ? " active" : ""}`} onClick={() => chooseMethod("website")}>
                  <span className="pl-method-icon"><Globe size={16} /></span>
                  <span className="pl-method-title">From website link</span>
                  <span className="pl-method-copy">Paste a platform URL to load a known template or basic website identity.</span>
                </button>
                <button className={`pl-method-card${state.method === "manual" ? " active" : ""}`} onClick={() => chooseMethod("manual")}>
                  <span className="pl-method-icon"><Edit2 size={16} /></span>
                  <span className="pl-method-title">Manual setup</span>
                  <span className="pl-method-copy">Start from a single editable Post type and choose every field yourself.</span>
                </button>
              </div>
            </>
          )}

          {state.step === 2 && (
            <>
              {state.method === "website" && (
                <div className="pl-form-group" style={{ borderBottom: "1px solid #ece5de", paddingBottom: 14, marginBottom: 14 }}>
                  <label className="pl-form-label">Platform website URL</label>
                  <div className="pl-url-row">
                    <input className="pl-input" placeholder="e.g. https://www.linkedin.com"
                      value={state.lookupUrl}
                      onChange={e => setField("lookupUrl", e.target.value)}
                      onKeyDown={e => e.key === "Enter" && lookupPlatform()} />
                    <button className="pl-fetch-btn" onClick={lookupPlatform}
                      disabled={!state.lookupUrl.trim() || lookupLoading}>
                      <Globe size={12} />{lookupLoading ? "Looking..." : "Look up"}
                    </button>
                  </div>
                  {state.lookupMessage && (
                    <div className={`pl-fetch-result ${state.lookupKind === "recognized" ? "success" : state.lookupKind === "error" ? "error" : ""}`}
                      style={state.lookupKind === "unknown" || state.lookupKind === "metadata" ? { background: "#f0ede9", color: "#617176" } : {}}>
                      {state.lookupMessage}
                    </div>
                  )}
                  <div className="pl-fetch-note">Known domains load curated content types. Unknown sites only fill identity details.</div>
                </div>
              )}

              <div className="pl-form-group">
                <label className="pl-form-label">Platform name *</label>
                <input className="pl-input" placeholder="e.g. LinkedIn, Threads, Your Community"
                  value={state.name} onChange={e => setField("name", e.target.value)} autoFocus />
              </div>
              <div className="pl-form-group">
                <label className="pl-form-label">Platform logo</label>
                <div className="pl-logo-upload">
                  <div className="pl-card-icon" style={{ background: `${state.color}18` }}>
                    {isLogoSource(state.icon)
                      ? <img className="pl-logo-preview" src={state.icon} alt="Logo preview" />
                      : <span style={{ fontSize: 20, color: state.color }}>{state.icon || state.name.charAt(0).toUpperCase()}</span>}
                  </div>
                  <input className="pl-input" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon"
                    onChange={e => handleLogoUpload(e.target.files?.[0])} disabled={logoLoading} />
                </div>
                <div className="pl-fetch-note">Upload a PNG, JPG, WEBP, SVG, or ICO logo. Website setup downloads the discovered logo locally when available.</div>
              </div>
              <div className="pl-form-group">
                <label className="pl-form-label">Brand color</label>
                <div className="pl-color-row">
                  {COLOR_PRESETS.map(c => (
                    <button key={c} className={`pl-color-swatch${state.color === c ? " active" : ""}`}
                      style={{ background: c }} onClick={() => setField("color", c)} />
                  ))}
                  <input className="pl-color-input" type="color" value={state.color}
                    onChange={e => setField("color", e.target.value)} />
                </div>
              </div>
            </>
          )}

          {state.step === 3 && (
            <div className="pl-type-list">
              {state.contentTypes.map((ct, i) => (
                <div key={ct.id} className="pl-type-item">
                  <div className="pl-type-item-head" onClick={() => updateType(ct.id, { expanded: !ct.expanded })}>
                    <span style={{ fontSize: 10, color: "#8a9598", minWidth: 16 }}>{i + 1}</span>
                    <input className="pl-input" style={{ flex: 1, height: 28 }} placeholder="Content type name, e.g. Post"
                      value={ct.label} onClick={e => e.stopPropagation()}
                      onChange={e => updateType(ct.id, { label: e.target.value })} />
                    <span style={{ fontSize: 8, color: "#8a9598", marginLeft: 6 }}>{fieldCountOf(ct.fields)} fields</span>
                    <ChevronRight size={12} className={`pl-type-item-chevron${ct.expanded ? " open" : ""}`} />
                    {state.contentTypes.length > 1 && (
                      <button className="pl-remove-type-btn" onClick={e => {
                        e.stopPropagation()
                        setState(s => ({ ...s, contentTypes: s.contentTypes.filter(c => c.id !== ct.id) }))
                      }}><X size={9} /></button>
                    )}
                  </div>
                  {ct.expanded && (
                    <div className="pl-type-fields">
                      <div className="pl-fields-grid">
                        {ALL_FIELDS.map(f => (
                          <label key={f.key} className="pl-field-check">
                            <input type="checkbox"
                              checked={!!ct.fields[f.key]}
                              onChange={e => toggleField(ct.id, f.key, e.target.checked)} />
                            {f.label}
                          </label>
                        ))}
                      </div>
                      <div className="pl-limit-row">
                        <div>
                          <div style={{ fontSize: 8, color: "#8a9598", marginBottom: 3 }}>Caption max chars</div>
                          <input className="pl-limit-input" type="number" min={50} max={50000}
                            value={ct.captionMaxLength}
                            onChange={e => updateType(ct.id, { captionMaxLength: Number(e.target.value) })} />
                        </div>
                        <div>
                          <div style={{ fontSize: 8, color: "#8a9598", marginBottom: 3 }}>Title max chars</div>
                          <input className="pl-limit-input" type="number" min={10} max={1000}
                            value={ct.headlineMaxLength}
                            onChange={e => updateType(ct.id, { headlineMaxLength: Number(e.target.value) })} />
                        </div>
                      </div>
                      <div style={{ marginTop: 10 }}>
                        <div style={{ fontSize: 8.5, fontWeight: 600, marginBottom: 5 }}>Preview layout in phone mockup</div>
                        <div className="pl-layout-row">
                          {LAYOUT_OPTIONS.map(opt => (
                            <button key={opt.value}
                              className={`pl-layout-opt${ct.previewLayout === opt.value ? " active" : ""}`}
                              onClick={() => updateType(ct.id, { previewLayout: opt.value })}>
                              <span className="pl-layout-icon">{opt.icon}</span>
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {state.contentTypes.length < 6 && (
                <button className="pl-add-type-btn"
                  onClick={() => setState(s => ({ ...s, contentTypes: [...s.contentTypes, makeManualType("")] }))}>
                  + Add content type
                </button>
              )}
            </div>
          )}
        </div>

        <div className="pl-modal-footer">
          {state.step > (initial ? 2 : 1) ? (
            <button className="pl-back-btn" onClick={() => setField("step", state.step === 3 ? 2 : 1)}>
              <ChevronLeft size={12} />Back
            </button>
          ) : <div />}

          {state.step === 1 ? (
            <button className="pl-next-btn" disabled={!state.method}
              onClick={() => state.method && setField("step", 2)}>
              Next<ChevronRight size={12} />
            </button>
          ) : state.step === 2 ? (
            <button className="pl-next-btn" disabled={!canMoveToContent}
              onClick={() => setField("step", 3)}>
              Next<ChevronRight size={12} />
            </button>
          ) : (
            <button className="pl-save-btn" onClick={save} disabled={!canSave}>
              <Check size={12} style={{ marginRight: 4 }} />Save platform
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function DeleteConfirm({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="pl-confirm-overlay">
      <div className="pl-confirm-box">
        <AlertTriangle size={20} color="#c85a50" style={{ marginBottom: 8 }} />
        <h3>Delete "{name}"?</h3>
        <p>This platform will be removed from the Composer and all its settings will be lost. This cannot be undone.</p>
        <div className="pl-confirm-actions">
          <button className="pl-confirm-cancel" onClick={onCancel}>Cancel</button>
          <button className="pl-confirm-delete" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  )
}

// ─── Platform Card ─────────────────────────────────────────────────────────────
function PlatformCard({
  id, config, isBuiltIn, isActive, onToggleActive, onEdit, onDelete,
}: {
  id: string; config: PlatformConfig; isBuiltIn: boolean
  isActive: boolean; onToggleActive: () => void
  onEdit?: () => void; onDelete?: () => void
}) {
  return (
    <div className="pl-card">
      <div className="pl-card-head">
        <PlatformIconBig platform={isBuiltIn ? id : undefined} icon={config.icon} color={config.color} />
        <div style={{ flex: 1 }}>
          <div className="pl-card-name">{config.label}</div>
          <div className="pl-card-meta">{config.postTypes.length} content type{config.postTypes.length !== 1 ? "s" : ""}</div>
        </div>
        {isBuiltIn && <span className="pl-built-in-badge">Built-in</span>}
      </div>
      <div className="pl-card-body">
        {config.postTypes.map(pt => {
          const fieldCount = Object.values(pt.fields).filter(v => typeof v === "boolean" && v).length
          return (
            <div key={pt.id} className="pl-post-type-row">
              <div className="pl-post-type-dot" style={{ background: config.color }} />
              <span className="pl-post-type-name">{pt.label}</span>
              <span className="pl-post-type-fields">{fieldCount} field{fieldCount !== 1 ? "s" : ""}</span>
            </div>
          )
        })}
      </div>
      <div className="pl-card-footer">
        <div className="pl-active-toggle">
          <button className={`pl-toggle-track ${isActive ? "on" : "off"}`} onClick={onToggleActive}>
            <div className="pl-toggle-thumb" />
          </button>
          <span style={{ color: isActive ? "#52848a" : "#8a9598" }}>{isActive ? "Active" : "Inactive"}</span>
        </div>
        {!isBuiltIn && onEdit && (
          <button className="pl-icon-btn edit" onClick={onEdit} title="Edit"><Edit2 size={12} /></button>
        )}
        {!isBuiltIn && onDelete && (
          <button className="pl-icon-btn" onClick={onDelete} title="Delete"><Trash2 size={12} /></button>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function Platforms() {
  const [customPlatforms, setCustomPlatforms] = useState<Record<string, CustomPlatformConfig>>({})
  const [activePlatforms, setActivePlatformsState] = useState<Set<string>>(() => new Set(getActivePlatformIds()))
  const [wizard, setWizard] = useState<{ open: boolean; editing?: CustomPlatformConfig; editId?: string }>({ open: false })
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null)

  const reload = useCallback(() => {
    setCustomPlatforms(loadCustomPlatforms())
    setActivePlatformsState(new Set(getActivePlatformIds()))
  }, [])

  useEffect(() => { reload() }, [reload])

  function toggleActive(id: string) {
    setActivePlatformsState(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      saveActivePlatformIds(next.size ? [...next] : DEFAULT_ACTIVE_PLATFORMS)
      return next
    })
  }

  function handleDelete(id: string) {
    deleteCustomPlatform(id)
    setConfirmDelete(null)
    reload()
  }

  const builtInEntries = Object.entries(PLATFORM_CONFIG)
  const customEntries = Object.entries(customPlatforms)

  return (
    <div className="pl-page">
      <style>{PLATFORMS_CSS}</style>

      <div className="pl-head">
        <div>
          <h1 className="pl-heading">Platforms</h1>
          <div className="pl-subhead">Manage which platforms appear in the Composer and add custom ones.</div>
          <div className="pl-heading-line" />
        </div>
        <button className="pl-add-btn" onClick={() => setWizard({ open: true })}>
          <Plus size={14} />Add platform
        </button>
      </div>

      {/* Built-in platforms */}
      <div className="pl-section-label">Built-in platforms</div>
      <div className="pl-grid">
        {builtInEntries.map(([id, cfg]) => (
          <PlatformCard key={id} id={id} config={cfg} isBuiltIn
            isActive={activePlatforms.has(id)}
            onToggleActive={() => toggleActive(id)}
          />
        ))}
      </div>

      {/* Custom platforms */}
      <div className="pl-section-label">Custom platforms</div>
      {customEntries.length === 0 ? (
        <div className="pl-empty">
          No custom platforms yet. Click "Add platform" to create one — or import a config from a URL.
        </div>
      ) : (
        <div className="pl-grid">
          {customEntries.map(([id, cfg]) => (
            <PlatformCard key={id} id={id} config={cfg} isBuiltIn={false}
              isActive={activePlatforms.has(id)}
              onToggleActive={() => toggleActive(id)}
              onEdit={() => setWizard({ open: true, editing: cfg, editId: id })}
              onDelete={() => setConfirmDelete({ id, name: cfg.label })}
            />
          ))}
        </div>
      )}

      {/* Wizard modal */}
      {wizard.open && (
        <PlatformWizardV2
          initial={wizard.editing}
          editId={wizard.editId}
          onClose={() => setWizard({ open: false })}
          onSaved={reload}
        />
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <DeleteConfirm
          name={confirmDelete.name}
          onConfirm={() => handleDelete(confirmDelete.id)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}
