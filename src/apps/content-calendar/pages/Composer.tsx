import { useEffect, useMemo, useRef, useState } from "react"
import type { KeyboardEvent } from "react"
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Eye,
  Expand,
  Hash,
  Image as ImageIcon,
  MessageCircle,
  MousePointer2,
  Plus,
  Save,
  Smartphone,
  Sparkles,
  Upload,
  X,
} from "lucide-react"
import { useContentCalendarStore } from "../store"
import type {
  ComposerChecklist,
  ComposerDraft,
  Platform,
  PostType,
} from "../types"
import { loadMedia, MEDIA_SEED } from "../mediaStorage"
import type { StoredMediaItem } from "../mediaStorage"
import placeholderMedia from "../../../assets/content-calendar/placeholder-media.svg"

const COMPOSER_CSS = `
.cc-composer{min-width:1040px;background:#faf7f2;color:#263338;min-height:100%;padding:16px 18px 24px}.cc-composer-head{display:flex;align-items:flex-start;gap:16px;margin-bottom:14px}.cc-composer-heading{font:400 31px/1 'DM Serif Display',Georgia,serif;margin:0}.cc-composer-heading-row{display:flex;align-items:center;gap:10px}.cc-composer-star{color:#e8af44;transform:rotate(-8deg)}.cc-composer-line{width:118px;border-top:3px solid #d87755;border-radius:50%;margin-top:10px;transform:rotate(-2deg)}.cc-composer-actions{margin-left:auto;display:flex;gap:12px}.cc-composer-action{height:32px;border-radius:10px;padding:0 16px;display:flex;align-items:center;gap:8px;font-size:10px;border:1px solid #edd8ca;background:#fff4ea}.cc-composer-action.primary{background:linear-gradient(90deg,#d86e4a,#dc7b57);color:#fff;border:0}.cc-composer-action.preview{background:#e6eff3;border:0}.cc-composer-body{display:flex;gap:17px;align-items:flex-start}.cc-composer-form{flex:1;min-width:0}.cc-type-row{height:52px;background:rgba(255,255,255,.7);border:1px solid #ede6df;border-radius:8px;padding:8px 10px;display:grid;grid-template-columns:80px repeat(4,1fr);gap:12px;align-items:center;margin-bottom:10px}.cc-type-label{font-size:10px;font-weight:600}.cc-type-choice{height:34px;border:1px solid #e7e0d9;border-radius:7px;display:flex;align-items:center;justify-content:center;gap:8px;font-size:10.5px;background:rgba(255,255,255,.45)}.cc-type-choice.active{border:1.5px solid #d66d4a;background:#fff0e8;box-shadow:inset 0 0 0 1px #f1c4b2}.cc-type-choice.active:after{content:'✓';width:10px;height:10px;border-radius:50%;background:#c56a4e;color:#fff;font-size:7px;display:grid;place-items:center;margin-left:auto;margin-right:7px}
.cc-details-panel{border:1px solid #ece5de;border-radius:8px;background:rgba(255,255,255,.65);overflow:hidden}.cc-details-title{height:42px;border-bottom:1px solid #ece5de;padding:13px 11px 0;font:400 18px 'DM Serif Display',Georgia,serif}.cc-details-title span{color:#e7ad43;margin-left:8px}.cc-form-columns{display:grid;grid-template-columns:1fr 1fr}.cc-form-col{padding:10px 11px}.cc-form-col:first-child{border-right:1px solid #ece5de}.cc-field-block{margin-bottom:11px;padding-bottom:10px;border-bottom:1px solid #eee7e0}.cc-field-block:last-child{border-bottom:0}.cc-field-title{display:flex;align-items:center;gap:8px;font-size:10px;font-weight:650;margin-bottom:7px}.cc-field-title svg{color:#bd7249}.cc-platform-row{display:flex;gap:7px;border:1px solid #e9e2db;border-radius:7px;padding:8px}.cc-platform-toggle{height:29px;flex:1;border:1px solid #e3ddd7;border-radius:7px;display:flex;align-items:center;justify-content:center;gap:6px;font-size:9px;background:white}.cc-platform-toggle.active{background:#ffe1cc;border-color:#f7d8c2}.cc-input-wrap{position:relative}.cc-composer textarea,.cc-composer input,.cc-composer select{font:inherit;color:inherit}.cc-textarea,.cc-text-input,.cc-select{width:100%;border:1px solid #e6dfd8;border-radius:7px;background:rgba(255,255,255,.82);outline:none;font-size:9px;padding:9px}.cc-textarea{height:93px;resize:none;line-height:1.45}.cc-text-input{height:30px}.cc-select{height:30px;appearance:none}.cc-counter{position:absolute;right:8px;bottom:5px;font-size:7.5px;color:#6f7b7e}.cc-hashtags{min-height:72px;border:1px solid #e5ded7;border-radius:7px;padding:7px}.cc-hashtag-list{display:flex;flex-wrap:wrap;gap:6px}.cc-hashtag{padding:4px 8px;border-radius:99px;background:#e8f0f4;color:#52748a;font-size:8px}.cc-hashtag button{margin-left:5px}.cc-hashtag-entry{border:0!important;background:transparent!important;height:25px!important;padding:3px!important;width:120px!important;font-size:8px!important;outline:0}.cc-hash-count{float:right;font-size:8px;color:#7c8587}.cc-publish-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}.cc-select-arrow{position:absolute;right:8px;top:9px;pointer-events:none}.cc-publish-help{font-size:7.5px;color:#869092;margin-top:5px}.cc-media-box{border:1px dashed #d6dee0;border-radius:7px;padding:8px}.cc-media-items{display:flex;gap:6px}.cc-media-attachment{width:60px;height:54px;border-radius:5px;background-size:cover;background-position:center;position:relative}.cc-media-attachment.reference{background-size:1280px 720px}.cc-remove-media{position:absolute;right:2px;top:2px;width:11px;height:11px;border-radius:50%;background:rgba(255,255,255,.65);display:grid;place-items:center}.cc-add-media{width:58px;height:54px;border-radius:5px;background:#f7f5f1;display:grid;place-items:center;color:#74909d}.cc-media-note{text-align:center;font-size:7.5px;color:#859093;margin-top:7px}.cc-checklist{grid-column:1/-1;margin:0 11px 12px;padding-top:0}.cc-checklist-box{background:#eef4f6;border-radius:7px;padding:9px 14px;display:grid;grid-template-columns:1fr 1fr;gap:6px 35px}.cc-check{display:flex;align-items:center;gap:8px;font-size:8.5px}.cc-check input{accent-color:#54849b}.cc-composer-error{padding:7px 10px;background:#fbe4df;color:#a94e3b;border-radius:6px;font-size:8.5px;margin:0 11px 10px}.cc-composer-success{padding:7px 10px;background:#e7f1ec;color:#477664;border-radius:6px;font-size:8.5px;margin:0 11px 10px}
.cc-preview-panel{width:370px;flex:0 0 370px;border:1px solid #ece5de;border-radius:8px;background:rgba(255,255,255,.68);padding:14px 16px}.cc-preview-title{font:400 19px 'DM Serif Display',Georgia,serif;display:flex;align-items:center;gap:8px}.cc-preview-tabs{display:flex;justify-content:flex-end;gap:5px;margin:5px 0 12px}.cc-preview-tab{height:28px;padding:0 12px;border:1px solid #e7e0da;border-radius:14px;display:flex;align-items:center;gap:6px;font-size:9px}.cc-preview-tab.active{background:#ffe1cc;border-color:transparent}.cc-phone{width:248px;height:478px;margin:0 auto 14px;background:#080b0d;border:5px solid #151719;border-radius:39px;padding:10px;box-shadow:0 0 0 2px #aeb1b1,0 8px 18px rgba(33,27,23,.16);position:relative;overflow:hidden}.cc-phone-notch{position:absolute;top:5px;left:50%;transform:translateX(-50%);width:90px;height:17px;background:#030405;border-radius:0 0 12px 12px;z-index:4}.cc-phone-media{position:absolute;inset:10px;border-radius:28px;background-size:cover;background-position:center;overflow:hidden}.cc-phone-media.reference{background-size:1280px 720px}.cc-phone-shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.18),transparent 42%,rgba(0,0,0,.8))}.cc-phone-status{position:absolute;top:13px;left:27px;color:#fff;font-size:9px;font-weight:700;z-index:3}.cc-phone-type{position:absolute;top:42px;left:21px;color:#fff;font-size:11px;font-weight:650;z-index:3}.cc-phone-social{position:absolute;right:18px;bottom:92px;color:#fff;display:flex;flex-direction:column;gap:12px;align-items:center;z-index:3}.cc-phone-copy{position:absolute;left:20px;right:40px;bottom:50px;color:#fff;font-size:8px;line-height:1.35;z-index:3}.cc-phone-copy strong{display:block;margin-bottom:5px}.cc-phone-copy p{white-space:pre-line;max-height:45px;overflow:hidden}.cc-phone-nav{position:absolute;left:10px;right:10px;bottom:10px;height:31px;background:rgba(3,5,6,.88);display:flex;align-items:center;justify-content:space-around;color:white;z-index:3}.cc-platform-label{position:absolute;top:55px;left:20px;color:white;font-size:10px;z-index:3;text-transform:capitalize}.cc-device-row{display:flex;gap:10px}.cc-device-select{height:31px;border:1px solid #e5ded7;border-radius:7px;flex:1;display:flex;align-items:center;gap:8px;padding:0 12px;font-size:9px}.cc-expand{width:39px;border:1px solid #e5ded7;border-radius:7px;display:grid;place-items:center}.cc-media-overlay{position:fixed;inset:0;background:rgba(29,34,35,.28);z-index:1000;display:grid;place-items:center;padding:20px}.cc-media-modal{width:min(520px,100%);max-height:85vh;overflow:auto;background:#fffaf6;border:1px solid #e6dbd2;border-radius:14px;padding:21px;box-shadow:0 18px 60px rgba(40,34,30,.2)}.cc-media-modal h2{font:400 23px 'DM Serif Display',Georgia,serif;margin:0 0 13px}.cc-media-modal-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;max-height:360px;overflow:auto}.cc-media-choice{aspect-ratio:1;border-radius:6px;background-size:cover;background-position:center;position:relative}.cc-media-choice.reference{background-size:1280px 720px}.cc-media-choice.selected{box-shadow:inset 0 0 0 3px #d46d4a}.cc-media-check{position:absolute;left:6px;top:6px;width:14px;height:14px;border-radius:3px;background:rgba(255,255,255,.88);display:grid;place-items:center;font-size:9px}.cc-media-modal-count{font-size:9px;color:#778184;margin:-8px 0 12px}.cc-media-modal-actions{display:flex;justify-content:flex-end;margin-top:14px}.cc-media-modal-actions button{padding:8px 14px;border:1px solid #ddd3cb;border-radius:8px;background:white;font-size:10px}
@media(max-width:1120px){.cc-composer{min-width:1020px}.cc-preview-panel{width:335px;flex-basis:335px}.cc-platform-toggle{font-size:8px}.cc-composer-actions{gap:6px}}
.cc-select{height:34px;box-sizing:border-box;line-height:normal;padding:0 28px 0 9px}
.cc-type-choice{position:relative}.cc-type-choice.active{border-color:#DA7652}.cc-type-choice.active:after{position:absolute;right:7px;top:50%;margin-left:0;margin-right:0;transform:translateY(-50%)}
.cc-platform-toggle.active{border-color:#DA7652}
.cc-cta-select{position:relative}.cc-cta-trigger{width:100%;height:34px;display:flex;align-items:center;justify-content:space-between;border:1px solid #e6dfd8;border-radius:7px;background:rgba(255,255,255,.82);color:#263338;padding:0 9px;font:inherit;font-size:9px;text-align:left}.cc-cta-trigger svg{color:#69787b}.cc-cta-menu{position:absolute;left:0;right:0;top:38px;z-index:10;padding:4px;background:#fffaf6;border:1px solid #e2d5ca;border-radius:7px;box-shadow:0 8px 18px rgba(45,37,32,.14)}.cc-cta-option{width:100%;padding:7px 8px;border-radius:4px;color:#263338;font:inherit;font-size:9px;text-align:left}.cc-cta-option:hover,.cc-cta-option.selected{background:#fbe1d5;color:#a94e3b}
`

const TYPES: { id: PostType; icon: string }[] = [
  { id: "Reel", icon: "▣" },
  { id: "Carousel", icon: "▧" },
  { id: "Story", icon: "⊕" },
  { id: "Static", icon: "▧" },
]
const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  pinterest: "Pinterest",
}
const CHECKS: { key: keyof ComposerChecklist; label: string }[] = [
  { key: "captionOnBrand", label: "Caption is on brand" },
  { key: "altTextAdded", label: "Alt text added" },
  { key: "hashtagsRelevant", label: "Hashtags are relevant" },
  { key: "firstCommentIncluded", label: "First comment included" },
  { key: "mediaHighQuality", label: "Media is high quality" },
  { key: "ctaClear", label: "CTA is clear" },
]

function PlatformIcon({ platform }: { platform: Platform }) {
  if (platform === "instagram")
    return (
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#e24b3d"
        strokeWidth="2.2"
      >
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="#e24b3d" />
      </svg>
    )
  if (platform === "tiktok") return <b style={{ fontSize: 14 }}>♪</b>
  if (platform === "pinterest")
    return (
      <b style={{ fontFamily: "Georgia", fontSize: 14, color: "#c92f3e" }}>P</b>
    )
  return <b style={{ color: "#cf352f" }}>▶</b>
}
function mediaStyle(
  item: StoredMediaItem | undefined,
  urls: Record<string, string>
) {
  if (!item) return {}
  if (item.source.kind === "reference")
    return {
      backgroundImage: `url(${placeholderMedia})`,
      backgroundPosition: `-${item.source.crop.x}px -${item.source.crop.y}px`,
    }
  return { backgroundImage: `url(${urls[item.id] ?? ""})` }
}

function CtaSelect({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const options = [
    "Shop the look",
    "Learn more",
    "Save for later",
    "Share your thoughts",
    "None",
  ]
  return (
    <div className="cc-cta-select">
      <button
        type="button"
        className="cc-cta-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{value}</span>
        <ChevronDown size={11} />
      </button>
      {open && (
        <div className="cc-cta-menu" role="listbox" aria-label="CTA options">
          {options.map((option) => (
            <button
              type="button"
              role="option"
              aria-selected={value === option}
              className={`cc-cta-option${value === option ? " selected" : ""}`}
              key={option}
              onClick={() => {
                onChange(option)
                setOpen(false)
              }}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function MediaPicker({
  items,
  selected,
  urls,
  onChange,
  onClose,
}: {
  items: StoredMediaItem[]
  selected: string[]
  urls: Record<string, string>
  onChange: (ids: string[]) => void
  onClose: () => void
}) {
  function toggle(id: string) {
    if (selected.includes(id)) onChange(selected.filter((item) => item !== id))
    else if (selected.length < 10) onChange([...selected, id])
  }
  return (
    <div
      className="cc-media-overlay"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="cc-media-modal" role="dialog" aria-modal="true">
        <h2>Select media</h2>
        <div className="cc-media-modal-count">
          {selected.length}/10 selected
        </div>
        <div className="cc-media-modal-grid">
          {items.map((item) => (
            <button
              key={item.id}
              className={`cc-media-choice ${item.source.kind === "reference" ? "reference" : ""}${selected.includes(item.id) ? "selected" : ""}`}
              style={mediaStyle(item, urls)}
              onClick={() => toggle(item.id)}
            >
              <span className="cc-media-check">
                {selected.includes(item.id) ? "✓" : ""}
              </span>
            </button>
          ))}
        </div>
        <div className="cc-media-modal-actions">
          <button onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  )
}

export default function Composer() {
  const {
    composerDrafts,
    activeComposerId,
    saveComposerDraft,
    scheduleComposer,
    closeComposer,
  } = useContentCalendarStore()
  const stored = composerDrafts.find((item) => item.id === activeComposerId)
  const [draft, setDraft] = useState<ComposerDraft | undefined>(stored)
  const [activePreview, setActivePreview] = useState<Platform>("instagram")
  const [hashtag, setHashtag] = useState("")
  const [media, setMedia] = useState<StoredMediaItem[]>([])
  const [urls, setUrls] = useState<Record<string, string>>({})
  const [picker, setPicker] = useState(false)
  const [message, setMessage] = useState<{
    kind: "error" | "success"
    text: string
  } | null>(null)
  const previewRef = useRef<HTMLElement>(null)
  const urlRef = useRef<string[]>([])
  useEffect(() => {
    let active = true
    loadMedia(MEDIA_SEED)
      .then((items) => {
        if (!active) return
        const next: Record<string, string> = {}
        for (const item of items) {
          if (item.blob) {
            const url = URL.createObjectURL(item.blob)
            next[item.id] = url
            urlRef.current.push(url)
          }
        }
        setMedia(items)
        setUrls(next)
      })
      .catch(() =>
        setMessage({
          kind: "error",
          text: "Media Library could not be loaded. Your form is still safe.",
        })
      )
    return () => {
      active = false
      urlRef.current.forEach(URL.revokeObjectURL)
      urlRef.current = []
    }
  }, [])
  const attached = useMemo(
    () =>
      draft
        ? draft.mediaIds
            .map((id) => media.find((item) => item.id === id))
            .filter((item): item is StoredMediaItem => Boolean(item))
        : [],
    [draft, media]
  )
  if (!draft)
    return (
      <div className="cc-placeholder">
        <div>No composer draft is open.</div>
        <button onClick={closeComposer}>Return</button>
      </div>
    )
  function update<K extends keyof ComposerDraft>(
    key: K,
    value: ComposerDraft[K]
  ) {
    setDraft((current) => (current ? { ...current, [key]: value } : current))
    setMessage(null)
  }
  function togglePlatform(platform: Platform) {
    const next = draft!.platforms.includes(platform)
      ? draft!.platforms.filter((item) => item !== platform)
      : [...draft!.platforms, platform]
    update("platforms", next)
    if (!next.includes(activePreview) && next[0]) setActivePreview(next[0])
  }
  function addHashtag(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter" && event.key !== ",") return
    event.preventDefault()
    const value = hashtag.replace(/^#/, "").trim()
    if (
      value &&
      draft!.hashtags.length < 30 &&
      !draft!.hashtags.includes(value)
    )
      update("hashtags", [...draft!.hashtags, value])
    setHashtag("")
  }
  function save() {
    const saved = saveComposerDraft(draft!)
    setDraft(saved)
    setMessage({
      kind: "success",
      text: "Draft saved locally and added to Drafting.",
    })
  }
  function schedule() {
    const missing = []
    if (!draft!.platforms.length) missing.push("a platform")
    if (!draft!.caption.trim()) missing.push("a caption")
    if (!draft!.mediaIds.length) missing.push("media")
    if (!draft!.publishDate) missing.push("a date")
    if (!draft!.publishTime) missing.push("a time")
    if (missing.length) {
      setMessage({
        kind: "error",
        text: `Add ${missing.join(", ")} before scheduling.`,
      })
      return
    }
    scheduleComposer(draft!)
  }
  const useReferencePreview =
    draft.mediaIds.join(",") === "seed-media-3,seed-media-1,seed-media-9" &&
    draft.caption ===
      "Small spaces, big mood ✨\nThis corner proves that good design doesn’t need a lot — just the right pieces. #SmallSpaceBigDreams" &&
    draft.hook === "Small spaces, big mood ✨" &&
    draft.postType === "Reel" &&
    activePreview === "instagram"
  const previewItem = attached[0]
  const previewStyle = useReferencePreview
    ? {
        backgroundImage: `url(${placeholderMedia})`,
        backgroundPosition: "-958px -176px",
      }
    : mediaStyle(previewItem, urls)
  return (
    <div className="cc-composer">
      <style>{COMPOSER_CSS}</style>
      <header className="cc-composer-head">
        <div>
          <div className="cc-composer-heading-row">
            <h1 className="cc-composer-heading">
              Create something worth saving.
            </h1>
            <Sparkles className="cc-composer-star" size={28} />
          </div>
          <div className="cc-composer-line" />
        </div>
        <div className="cc-composer-actions">
          <button className="cc-composer-action" onClick={save}>
            <Save size={13} />
            Save draft
          </button>
          <button className="cc-composer-action primary" onClick={schedule}>
            <CalendarDays size={13} />
            Add to calendar
          </button>
          <button
            className="cc-composer-action preview"
            onClick={() =>
              previewRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              })
            }
          >
            <Eye size={14} />
            Preview
          </button>
        </div>
      </header>
      <div className="cc-composer-body">
        <main className="cc-composer-form">
          <section className="cc-type-row">
            <span className="cc-type-label">Post type</span>
            {TYPES.map((type) => (
              <button
                key={type.id}
                className={`cc-type-choice${draft.postType === type.id ? " active" : ""}`}
                onClick={() => update("postType", type.id)}
              >
                <span>{type.icon}</span>
                {type.id}
              </button>
            ))}
          </section>
          <section className="cc-details-panel">
            <div className="cc-details-title">
              {draft.postType} Details <span>☆</span>
            </div>
            <div className="cc-form-columns">
              <div className="cc-form-col">
                <div className="cc-field-block">
                  <div className="cc-field-title">
                    <Upload size={13} />
                    Platforms
                  </div>
                  <div className="cc-platform-row">
                    {(["instagram", "tiktok", "pinterest"] as Platform[]).map(
                      (platform) => (
                        <button
                          key={platform}
                          className={`cc-platform-toggle${draft.platforms.includes(platform) ? " active" : ""}`}
                          onClick={() => togglePlatform(platform)}
                        >
                          <PlatformIcon platform={platform} />
                          {PLATFORM_LABELS[platform]}
                        </button>
                      )
                    )}
                  </div>
                </div>
                <div className="cc-field-block">
                  <div className="cc-field-title">
                    <MessageCircle size={13} />
                    Caption
                  </div>
                  <div className="cc-input-wrap">
                    <textarea
                      className="cc-textarea"
                      maxLength={2200}
                      value={draft.caption}
                      onChange={(event) =>
                        update("caption", event.target.value)
                      }
                    />
                    <span className="cc-counter">
                      {draft.caption.length}/2200
                    </span>
                  </div>
                </div>
                <div className="cc-field-block">
                  <div className="cc-field-title">
                    <Hash size={15} />
                    Hashtags
                  </div>
                  <div className="cc-hashtags">
                    <div className="cc-hashtag-list">
                      {draft.hashtags.map((item) => (
                        <span key={item} className="cc-hashtag">
                          #{item}
                          <button
                            onClick={() =>
                              update(
                                "hashtags",
                                draft.hashtags.filter((value) => value !== item)
                              )
                            }
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      <input
                        className="cc-hashtag-entry"
                        value={hashtag}
                        onChange={(event) => setHashtag(event.target.value)}
                        onKeyDown={addHashtag}
                        placeholder="Add hashtag..."
                      />
                    </div>
                    <span className="cc-hash-count">
                      {draft.hashtags.length}/30
                    </span>
                  </div>
                </div>
                <div className="cc-field-block">
                  <div className="cc-field-title">
                    <Sparkles size={13} />
                    Alt text
                  </div>
                  <div className="cc-input-wrap">
                    <input
                      className="cc-text-input"
                      maxLength={125}
                      value={draft.altText}
                      onChange={(event) =>
                        update("altText", event.target.value)
                      }
                    />
                    <span className="cc-counter">
                      {draft.altText.length}/125
                    </span>
                  </div>
                </div>
              </div>
              <div className="cc-form-col">
                <div className="cc-field-block">
                  <div className="cc-field-title">
                    <CalendarDays size={13} />
                    Publish date &amp; time
                  </div>
                  <div className="cc-publish-row">
                    <input
                      className="cc-text-input"
                      type="date"
                      value={draft.publishDate}
                      onChange={(event) =>
                        update("publishDate", event.target.value)
                      }
                    />
                    <input
                      className="cc-text-input"
                      type="time"
                      value={draft.publishTime}
                      onChange={(event) =>
                        update("publishTime", event.target.value)
                      }
                    />
                  </div>
                  <div className="cc-publish-help">
                    ◷ Your post will publish on the selected local date
                  </div>
                </div>
                <div className="cc-field-block">
                  <div className="cc-field-title">
                    <Sparkles size={13} />
                    Hook
                  </div>
                  <div className="cc-input-wrap">
                    <input
                      className="cc-text-input"
                      maxLength={80}
                      value={draft.hook}
                      onChange={(event) => update("hook", event.target.value)}
                    />
                    <span className="cc-counter">{draft.hook.length}/80</span>
                  </div>
                </div>
                <div className="cc-field-block">
                  <div className="cc-field-title">
                    <MousePointer2 size={13} />
                    CTA
                  </div>
                  <div className="cc-input-wrap">
                    <CtaSelect
                      value={draft.cta}
                      onChange={(value) => update("cta", value)}
                    />
                  </div>
                </div>
                <div className="cc-field-block">
                  <div className="cc-field-title">
                    <ImageIcon size={13} />
                    Media attachments
                  </div>
                  <div className="cc-media-box">
                    <div className="cc-media-items">
                      {attached.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className={`cc-media-attachment ${item.source.kind === "reference" ? "reference" : ""}`}
                          style={mediaStyle(item, urls)}
                        >
                          <button
                            className="cc-remove-media"
                            onClick={() =>
                              update(
                                "mediaIds",
                                draft.mediaIds.filter((id) => id !== item.id)
                              )
                            }
                          >
                            <X size={7} />
                          </button>
                        </div>
                      ))}
                      {draft.mediaIds.length < 10 && (
                        <button
                          className="cc-add-media"
                          onClick={() => setPicker(true)}
                        >
                          <Plus size={21} />
                        </button>
                      )}
                    </div>
                    <div className="cc-media-note">
                      Add more media (up to 10)
                    </div>
                  </div>
                </div>
                <div className="cc-field-block">
                  <div className="cc-field-title">
                    <MessageCircle size={13} />
                    First comment
                  </div>
                  <div className="cc-input-wrap">
                    <input
                      className="cc-text-input"
                      maxLength={280}
                      value={draft.firstComment}
                      onChange={(event) =>
                        update("firstComment", event.target.value)
                      }
                    />
                    <span className="cc-counter">
                      {draft.firstComment.length}/280
                    </span>
                  </div>
                </div>
              </div>
              <div className="cc-checklist">
                <div className="cc-field-title">
                  <CheckCircle2 size={15} />
                  Checklist
                </div>
                <div className="cc-checklist-box">
                  {CHECKS.map((item) => (
                    <label className="cc-check" key={item.key}>
                      <input
                        type="checkbox"
                        checked={draft.checklist[item.key]}
                        onChange={(event) =>
                          update("checklist", {
                            ...draft.checklist,
                            [item.key]: event.target.checked,
                          })
                        }
                      />
                      {item.label}
                    </label>
                  ))}
                </div>
              </div>
              {message && (
                <div
                  className={
                    message.kind === "error"
                      ? "cc-composer-error"
                      : "cc-composer-success"
                  }
                >
                  {message.text}
                </div>
              )}
            </div>
          </section>
        </main>
        <aside className="cc-preview-panel" ref={previewRef}>
          <div className="cc-preview-title">
            Preview <span style={{ color: "#e7ad42" }}>☆</span>
          </div>
          <div className="cc-preview-tabs">
            {draft.platforms.map((platform) => (
              <button
                key={platform}
                className={`cc-preview-tab${activePreview === platform ? "active" : ""}`}
                onClick={() => setActivePreview(platform)}
              >
                <PlatformIcon platform={platform} />
                {PLATFORM_LABELS[platform]}
              </button>
            ))}
          </div>
          <div className="cc-phone">
            {!useReferencePreview && <div className="cc-phone-notch" />}
            <div
              className={`cc-phone-media${useReferencePreview ? "reference" : ""}`}
              style={previewStyle}
            >
              {!useReferencePreview && <div className="cc-phone-shade" />}
            </div>
            {!useReferencePreview && (
              <>
                <div className="cc-phone-status">9:41</div>
                <div className="cc-phone-type">{draft.postType}s</div>
                <div className="cc-platform-label">{activePreview}</div>
                <div className="cc-phone-social">
                  <span>♡</span>
                  <span>◯</span>
                  <span>➤</span>
                  <small>2.4K</small>
                </div>
                <div className="cc-phone-copy">
                  <strong>thecontentedit</strong>
                  <p>{draft.caption}</p>
                  <span>
                    {draft.hashtags.map((item) => `#${item}`).join(" ")}
                  </span>
                </div>
                <div className="cc-phone-nav">
                  <span>◆</span>
                  <span>⌕</span>
                  <Plus size={15} />
                  <span>▣</span>
                  <span>●</span>
                </div>
              </>
            )}
          </div>
          <div className="cc-device-row">
            <div className="cc-device-select">
              <Smartphone size={13} />
              iPhone 14/15 Pro{" "}
              <ChevronDown size={11} style={{ marginLeft: "auto" }} />
            </div>
            <button className="cc-expand">
              <Expand size={14} />
            </button>
          </div>
        </aside>
      </div>
      {picker && (
        <MediaPicker
          items={media}
          selected={draft.mediaIds}
          urls={urls}
          onChange={(ids) => update("mediaIds", ids)}
          onClose={() => setPicker(false)}
        />
      )}
    </div>
  )
}
