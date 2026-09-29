import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
} from "react"
import {
  Archive,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Copy,
  Eye,
  ImagePlus,
  MapPin,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react"
import { useContentCalendarStore } from "../store"
import { formatContentDate } from "../settings"
import type { ComposerChecklist, ContentTemplate, Platform } from "../types"
import {
  getActivePlatformOptions,
  getActivePostTypes,
  getPlatformConfig,
} from "../platformConfig"
import { MediaAssetPicker } from "../components/MediaAssetPicker"
import { useMediaAssets } from "../components/useMediaAssets"
import { mediaUrl } from "../mediaStorage"

const CSS = `
.cc-template-page{min-height:100%;background:var(--cc-bg);color:#243136;padding:0 18px 24px;font-family:'Nunito',-apple-system,sans-serif}.cc-template-head{display:flex;justify-content:space-between;align-items:flex-start;padding:18px 4px 12px}.cc-template-title-row{display:flex;align-items:center;gap:10px}.cc-template-title{font:400 31px/1 'DM Serif Display',Georgia,serif;margin:0;color:var(--cc-text)}.cc-template-star{color:#e8af45;transform:rotate(-8deg)}.cc-template-line{width:150px;border-top:3px solid #d87956;border-radius:50%;margin-top:10px;transform:rotate(-2deg)}.cc-template-meta{display:flex;align-items:center;gap:20px;font-size:12px;font-weight:650;color:var(--cc-text-2)}.cc-template-local{display:flex;align-items:center;gap:7px;padding:6px 14px;background:#fae7c5;border-radius:99px;font-size:11px}.cc-template-toolbar{display:grid;grid-template-columns:minmax(220px,1fr) repeat(4,auto);gap:8px;margin:0 0 14px}.cc-template-search{height:31px;display:flex;align-items:center;gap:8px;background:var(--cc-card);border:1px solid #ece5de;border-radius:10px;padding:0 10px}.cc-template-search input{width:100%;border:0;outline:0;background:transparent;font-size:10.5px}.cc-template-select-wrap{position:relative}.cc-template-select{height:31px;appearance:none;padding:0 28px 0 12px;border:1px solid #ece5de;border-radius:10px;background:var(--cc-card);font-size:10.5px;color:var(--cc-text);cursor:pointer;outline:0}.cc-template-select-wrap svg{position:absolute;right:9px;top:10px;pointer-events:none;color:var(--cc-text-3)}.cc-template-add{height:31px;width:35px;border:1px solid #f0d5c8;border-radius:9px;background:#f9ede6;color:#d97856;display:grid;place-items:center;cursor:pointer}.cc-template-section{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin:4px 0 14px}.cc-template-section-title{font:400 21px/1 'DM Serif Display',Georgia,serif;color:var(--cc-text);margin:0}.cc-template-section-sub{font-size:10px;color:var(--cc-text-3);margin:5px 0 0}.cc-template-count{display:flex;align-items:center;gap:10px;background:rgba(225,240,252,.6);border:1px solid #c8dff0;border-radius:10px;padding:9px 12px;color:#5a8a9f;font-size:9px}.cc-template-count strong{display:block;color:var(--cc-text);font-size:11px;margin-bottom:2px}.cc-template-count-icon{width:30px;height:30px;display:grid;place-items:center;background:#d3e8f5;border-radius:8px}.cc-template-platform-group{margin-bottom:18px}.cc-template-platform-heading{display:flex;align-items:center;gap:8px;margin-bottom:8px}.cc-template-platform-heading h3{font:400 18px/1 'DM Serif Display',Georgia,serif;margin:0;color:var(--cc-text)}.cc-template-platform-heading span{font-size:9px;color:var(--cc-text-3)}.cc-template-platform-rule{height:1px;background:#e9dfd7;flex:1}.cc-template-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.cc-template-card{min-height:286px;background:rgba(255,255,255,.76);border:1px solid #ece4dc;border-radius:8px;overflow:hidden;display:flex;flex-direction:column;cursor:pointer;transition:box-shadow .15s,transform .15s}.cc-template-card:hover{box-shadow:0 5px 16px rgba(60,40,30,.1);transform:translateY(-1px)}.cc-template-image{height:108px;min-height:108px;overflow:hidden;background:linear-gradient(135deg,#fce8e3,#ead7cc);position:relative;display:grid;place-items:center;color:var(--cc-accent)}.cc-template-image img{display:block;width:100%;height:100%;object-fit:cover;object-position:center 40%}.cc-template-placeholder{display:grid;place-items:center;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.55)}.cc-template-status{position:absolute;right:7px;top:7px;padding:3px 9px;border-radius:99px;background:#fff3dc;color:#97722f;font-size:8px}.cc-template-content{display:flex;flex-direction:column;flex:1;padding:10px 11px}.cc-template-name{font:400 16px/1.15 'DM Serif Display',Georgia,serif;margin:0 0 8px;color:var(--cc-text)}.cc-template-badges{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:8px}.cc-template-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:99px;font-size:8px;background:#faeef0;color:#995067}.cc-template-badge.type{background:#edf2f4;color:#4f7d92}.cc-template-description{font-size:9.5px;line-height:1.4;color:#667074;min-height:28px;margin:0 0 7px}.cc-template-structure{display:grid;gap:4px;font-size:8.5px;color:var(--cc-text-2)}.cc-template-structure div{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.cc-template-structure b{color:var(--cc-text)}.cc-template-foot{margin-top:auto;padding-top:9px;display:flex;align-items:center;justify-content:space-between;gap:7px}.cc-template-check{display:flex;align-items:center;gap:4px;color:#8b9293;font-size:8px}.cc-template-actions{display:flex;align-items:center;gap:3px}.cc-template-icon-btn{width:24px;height:24px;border:1px solid #eadfd6;border-radius:7px;background:#fffaf6;color:#8a6b5d;display:grid;place-items:center;cursor:pointer}.cc-template-use{border:0;border-radius:99px;background:#ffe4cd;color:#b55335;padding:5px 9px;font-size:8px;font-weight:700;cursor:pointer}.cc-template-empty{background:rgba(255,255,255,.76);border:1px dashed #decfc4;border-radius:10px;padding:38px 18px;text-align:center;color:var(--cc-text-3);font-size:11px}.cc-template-empty strong{display:block;color:var(--cc-text);font:400 20px 'DM Serif Display',Georgia,serif;margin-bottom:7px}.cc-template-overlay{position:fixed;inset:0;background:rgba(35,31,29,.28);z-index:1000;display:grid;place-items:center;padding:20px}.cc-template-dialog{width:min(620px,100%);max-height:92vh;overflow:auto;background:#fffaf6;border:1px solid #e9ddd3;border-radius:14px;padding:20px;box-shadow:0 18px 60px rgba(48,39,34,.2)}.cc-template-dialog-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:14px}.cc-template-dialog-title{font:400 24px/1 'DM Serif Display',Georgia,serif;margin:0;color:var(--cc-text)}.cc-template-dialog-sub{font-size:10px;color:var(--cc-text-3);margin:6px 0 0}.cc-template-close{width:28px;height:28px;border:1px solid #e0d6ce;border-radius:8px;background:var(--cc-card);color:#806f66;display:grid;place-items:center;cursor:pointer}.cc-template-form{display:grid;grid-template-columns:1fr 1fr;gap:11px}.cc-template-field{display:flex;flex-direction:column;gap:5px}.cc-template-field.full{grid-column:1/-1}.cc-template-field label,.cc-template-detail-label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#806f66}.cc-template-field label span{color:var(--cc-accent)}.cc-template-input,.cc-template-textarea{border:1px solid #e0d6ce;border-radius:8px;background:white;padding:9px;font-size:11px;outline:0;color:var(--cc-text);font-family:inherit}.cc-template-textarea{min-height:60px;resize:vertical}.cc-template-input:focus,.cc-template-textarea:focus{border-color:var(--cc-accent)}.cc-template-dialog-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:16px}.cc-template-dialog-actions button{padding:8px 14px;border-radius:8px;font-size:10px;border:1px solid #dfd5cd;background:var(--cc-card);color:#806f66;cursor:pointer}.cc-template-dialog-actions .primary{background:var(--cc-accent);color:#fff;border-color:var(--cc-accent)}.cc-template-error{color:#ad5144;font-size:10px;grid-column:1/-1}.cc-template-checklist{display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:10px;color:#806f66}.cc-template-checklist label{display:flex;align-items:center;gap:5px}.cc-template-detail{display:grid;gap:12px}.cc-template-detail-value{font-size:11px;color:#4f5b5d;line-height:1.45;white-space:pre-wrap}.cc-template-detail-media{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}.cc-template-detail-media img,.cc-template-detail-placeholder{width:100%;height:76px;object-fit:cover;border-radius:7px;background:#f0e8e0}.cc-template-detail-placeholder{display:grid;place-items:center;color:#bca99d}.cc-template-detail-actions{display:flex;flex-wrap:wrap;gap:6px}.cc-template-detail-actions button{padding:7px 10px;border:1px solid #dfd5cd;border-radius:7px;background:var(--cc-card);color:#806f66;font-size:10px;cursor:pointer}.cc-template-detail-actions .primary{background:var(--cc-accent);color:#fff;border-color:var(--cc-accent)}.cc-template-note{margin-top:14px;background:rgba(255,255,255,.7);border:1px solid var(--cc-border);border-radius:10px;padding:14px;text-align:center}.cc-template-note-title{font:600 15px/1.3 'Caveat',cursive;color:var(--cc-text)}.cc-template-note-copy{font-size:9px;line-height:1.4;color:var(--cc-text-3);margin-top:4px}@media(max-width:900px){.cc-template-page{min-width:0}.cc-template-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.cc-template-toolbar{grid-template-columns:1fr 1fr}.cc-template-search{grid-column:1/-1}.cc-template-count{display:none}}@media(max-width:520px){.cc-template-grid{grid-template-columns:1fr}.cc-template-head{gap:10px}.cc-template-meta{display:none}.cc-template-form{grid-template-columns:1fr}.cc-template-field.full{grid-column:auto}.cc-template-detail-media{grid-template-columns:repeat(2,1fr)}}
`

const EMPTY_CHECKLIST: ComposerChecklist = {
  captionOnBrand: false,
  hashtagsRelevant: false,
  mediaHighQuality: false,
  altTextAdded: false,
  firstCommentIncluded: false,
  ctaClear: false,
}
const CHECKLIST_LABELS: Record<keyof ComposerChecklist, string> = {
  captionOnBrand: "Caption on brand",
  hashtagsRelevant: "Hashtags relevant",
  mediaHighQuality: "Media high quality",
  altTextAdded: "Alt text added",
  firstCommentIncluded: "First comment included",
  ctaClear: "CTA is clear",
}
type DialogMode = "create" | "edit" | "view"

function platformLabel(platform: Platform) {
  return getPlatformConfig(platform).label
}

function templateForm(template?: ContentTemplate) {
  const platform = template?.platform ?? getActivePlatformOptions()[0]?.id ?? "instagram"
  return {
    name: template?.name ?? "",
    description: template?.description ?? "",
    platform,
    postType:
      template?.postType ?? getPlatformConfig(platform).postTypes[0]?.id ?? "Post",
    hook: template?.hook ?? "",
    body: template?.body ?? "",
    cta: template?.cta ?? "",
    hashtags: template?.hashtags.map((tag) => `#${tag}`).join(" ") ?? "",
    mediaIds: [...(template?.mediaIds ?? [])],
    checklist: { ...(template?.checklist ?? EMPTY_CHECKLIST) },
  }
}

function TemplateImage({
  template,
  items,
  urls,
}: {
  template: ContentTemplate
  items: ReturnType<typeof useMediaAssets>["items"]
  urls: Record<string, string>
}) {
  const media = template.mediaIds
    .map((id) => items.find((item) => item.id === id))
    .find(Boolean)
  const src = media ? mediaUrl(media, urls) : ""
  return (
    <div className="cc-template-image">
      {src ? (
        <img
          src={src}
          alt={media?.description || media?.filename || template.name}
        />
      ) : (
        <span className="cc-template-placeholder">
          <ImagePlus size={19} />
        </span>
      )}
      {template.archived && (
        <span className="cc-template-status">Archived</span>
      )}
    </div>
  )
}

function TemplateCard({
  template,
  items,
  urls,
  onView,
  onEdit,
  onUse,
  onDuplicate,
  onArchive,
  onDelete,
}: {
  template: ContentTemplate
  items: ReturnType<typeof useMediaAssets>["items"]
  urls: Record<string, string>
  onView: () => void
  onEdit: () => void
  onUse: () => void
  onDuplicate: () => void
  onArchive: () => void
  onDelete: () => void
}) {
  const complete = Object.values(template.checklist).filter(Boolean).length
  const stop = (event: MouseEvent) => event.stopPropagation()
  return (
    <article
      className="cc-template-card"
      role="button"
      tabIndex={0}
      onClick={onView}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onView()
        }
      }}
    >
      <TemplateImage template={template} items={items} urls={urls} />
      <div className="cc-template-content">
        <h3 className="cc-template-name">{template.name}</h3>
        <div className="cc-template-badges">
          <span className="cc-template-badge">
            {platformLabel(template.platform)}
          </span>
          <span className="cc-template-badge type">
            {getPlatformConfig(template.platform).postTypes.find(
              (type) => type.id === template.postType
            )?.label || template.postType}
          </span>
        </div>
        <p className="cc-template-description">
          {template.description || "Platform-specific reusable content."}
        </p>
        <div className="cc-template-structure">
          <div>
            <b>Hook</b> · {template.hook || "Not set"}
          </div>
          <div>
            <b>Body</b> · {template.body || "Not set"}
          </div>
          <div>
            <b>CTA</b> · {template.cta || "Not set"}
          </div>
        </div>
        <div className="cc-template-foot">
          <span className="cc-template-check">
            <CheckCircle2 size={11} />
            {complete}/6 checklist · {template.hashtags.length} tags
          </span>
          <div className="cc-template-actions" onClick={stop}>
            <button className="cc-template-use" onClick={onUse}>
              Use
            </button>
            <button
              className="cc-template-icon-btn"
              onClick={onView}
              aria-label={`View ${template.name}`}
            >
              <Eye size={12} />
            </button>
            <button
              className="cc-template-icon-btn"
              onClick={onEdit}
              aria-label={`Edit ${template.name}`}
            >
              <Pencil size={12} />
            </button>
            <button
              className="cc-template-icon-btn"
              onClick={onDuplicate}
              aria-label={`Duplicate ${template.name}`}
            >
              <Copy size={12} />
            </button>
            <button
              className="cc-template-icon-btn"
              onClick={onArchive}
              aria-label={
                template.archived
                  ? `Unarchive ${template.name}`
                  : `Archive ${template.name}`
              }
            >
              <Archive size={12} />
            </button>
            <button
              className="cc-template-icon-btn"
              onClick={onDelete}
              aria-label={`Delete ${template.name}`}
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

function TemplateDialog({
  mode,
  template,
  items,
  urls,
  onClose,
  onSave,
  onUse,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
}: {
  mode: DialogMode
  template?: ContentTemplate
  items: ReturnType<typeof useMediaAssets>["items"]
  urls: Record<string, string>
  onClose: () => void
  onSave: (
    value: Omit<ContentTemplate, "id" | "createdAt" | "updatedAt">
  ) => void
  onUse?: () => void
  onEdit?: () => void
  onDuplicate?: () => void
  onArchive?: () => void
  onDelete?: () => void
}) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const platformOptions = getActivePlatformOptions()
  const [form, setForm] = useState(() => templateForm(template))
  const [error, setError] = useState("")
  const [pickerOpen, setPickerOpen] = useState(false)

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    dialogRef.current?.focus()
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", close)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener("keydown", close)
    }
  }, [onClose])
  function save(event: FormEvent) {
    event.preventDefault()
    const tags = form.hashtags
      .split(/[\s,]+/)
      .map((tag) => tag.replace(/^#+/, "").trim())
      .filter(Boolean)
      .filter(
        (tag, index, all) =>
          all.findIndex((item) => item.toLowerCase() === tag.toLowerCase()) ===
          index
      )
    const validType = getPlatformConfig(form.platform).postTypes.some(
      (type) => type.id === form.postType
    )
    if (!form.name.trim()) return setError("Add a template name.")
    if (!validType)
      return setError("Choose a valid post type for this platform.")
    if (!form.hook.trim() || !form.body.trim() || !form.cta.trim())
      return setError("Complete the hook, body, and CTA fields.")
    onSave({
      name: form.name.trim(),
      description: form.description.trim(),
      platform: form.platform,
      postType: form.postType,
      hook: form.hook.trim(),
      body: form.body.trim(),
      cta: form.cta.trim(),
      hashtags: tags,
      mediaIds: Array.from(new Set(form.mediaIds)),
      checklist: form.checklist,
      archived: template?.archived ?? false,
    })
  }
  function changePlatform(platform: string) {
    const types = getPlatformConfig(platform).postTypes
    setForm((current) => ({
      ...current,
      platform,
      postType: types.some((type) => type.id === current.postType)
        ? current.postType
        : (types[0]?.id ?? "Post"),
    }))
  }
  const title =
    mode === "create"
      ? "Create template"
      : mode === "edit"
        ? "Edit template"
        : "View template"
  return (
    <div
      className="cc-template-overlay"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        className="cc-template-dialog"
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cc-template-dialog-title"
      >
        <div className="cc-template-dialog-head">
          <div>
            <h2
              id="cc-template-dialog-title"
              className="cc-template-dialog-title"
            >
              {title}
            </h2>
            <p className="cc-template-dialog-sub">
              One platform, one valid Composer content type, ready to reuse.
            </p>
          </div>
          <button
            className="cc-template-close"
            onClick={onClose}
            aria-label="Close template dialog"
          >
            <X size={14} />
          </button>
        </div>
        {mode === "view" && template ? (
          <div className="cc-template-detail">
            <div>
              <div className="cc-template-detail-label">Name</div>
              <div className="cc-template-detail-value">{template.name}</div>
            </div>
            <div>
              <div className="cc-template-detail-label">
                Platform · post type
              </div>
              <div className="cc-template-detail-value">
                {platformLabel(template.platform)} ·{" "}
                {getPlatformConfig(template.platform).postTypes.find(
                  (type) => type.id === template.postType
                )?.label || template.postType}
              </div>
            </div>
            <div>
              <div className="cc-template-detail-label">Description</div>
              <div className="cc-template-detail-value">
                {template.description || "No description added."}
              </div>
            </div>
            <div>
              <div className="cc-template-detail-label">Hook</div>
              <div className="cc-template-detail-value">{template.hook}</div>
            </div>
            <div>
              <div className="cc-template-detail-label">Body</div>
              <div className="cc-template-detail-value">{template.body}</div>
            </div>
            <div>
              <div className="cc-template-detail-label">CTA</div>
              <div className="cc-template-detail-value">{template.cta}</div>
            </div>
            <div>
              <div className="cc-template-detail-label">Hashtags</div>
              <div className="cc-template-detail-value">
                {template.hashtags.length
                  ? template.hashtags.map((tag) => `#${tag}`).join(" ")
                  : "None"}
              </div>
            </div>
            <div className="cc-template-detail-media">
              {template.mediaIds.length ? (
                template.mediaIds.map((id) => {
                  const media = items.find((item) => item.id === id)
                  const src = media ? mediaUrl(media, urls) : ""
                  return src ? (
                    <img key={id} src={src} alt={media?.filename || ""} />
                  ) : (
                    <span className="cc-template-detail-placeholder" key={id}>
                      <ImagePlus size={14} />
                    </span>
                  )
                })
              ) : (
                <span className="cc-template-detail-value">
                  No suggested media.
                </span>
              )}
            </div>
            <div className="cc-template-detail-actions">
              {onUse && (
                <button className="primary" onClick={onUse}>
                  Use template
                </button>
              )}
              {onEdit && <button onClick={onEdit}>Edit</button>}
              {onDuplicate && <button onClick={onDuplicate}>Duplicate</button>}
              {onArchive && (
                <button onClick={onArchive}>
                  {template.archived ? "Unarchive" : "Archive"}
                </button>
              )}
              {onDelete && <button onClick={onDelete}>Delete</button>}
              <button onClick={onClose}>Close</button>
            </div>
          </div>
        ) : (
          <form className="cc-template-form" onSubmit={save}>
            <div className="cc-template-field">
              <label>
                Name <span>*</span>
              </label>
              <input
                autoFocus
                className="cc-template-input"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="e.g. Quick tip"
              />
            </div>
            <div className="cc-template-field">
              <label>Description</label>
              <input
                className="cc-template-input"
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="What this template is for"
              />
            </div>
            <div className="cc-template-field">
              <label>
                Platform <span>*</span>
              </label>
              <select
                className="cc-template-input"
                value={form.platform}
                onChange={(event) => changePlatform(event.target.value)}
              >
                {platformOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="cc-template-field">
              <label>
                Post type <span>*</span>
              </label>
              <select
                className="cc-template-input"
                value={form.postType}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    postType: event.target.value,
                  }))
                }
              >
                {getPlatformConfig(form.platform).postTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="cc-template-field full">
              <label>
                Hook <span>*</span>
              </label>
              <textarea
                className="cc-template-textarea"
                value={form.hook}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    hook: event.target.value,
                  }))
                }
                maxLength={100}
              />
            </div>
            <div className="cc-template-field full">
              <label>
                Body <span>*</span>
              </label>
              <textarea
                className="cc-template-textarea"
                value={form.body}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    body: event.target.value,
                  }))
                }
                maxLength={500}
              />
            </div>
            <div className="cc-template-field full">
              <label>
                CTA <span>*</span>
              </label>
              <textarea
                className="cc-template-textarea"
                value={form.cta}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    cta: event.target.value,
                  }))
                }
                maxLength={100}
              />
            </div>
            <div className="cc-template-field full">
              <label>Hashtags</label>
              <input
                className="cc-template-input"
                value={form.hashtags}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    hashtags: event.target.value,
                  }))
                }
                placeholder="#launch #behindthescenes"
              />
            </div>
            <div className="cc-template-field full">
              <label>Suggested media</label>
              <button
                type="button"
                className="cc-template-dialog-actions"
                onClick={() => setPickerOpen((value) => !value)}
              >
                {pickerOpen
                  ? "Close media picker"
                  : `${form.mediaIds.length ? `${form.mediaIds.length} selected · edit media` : "Choose from library or upload"}`}
              </button>
              {pickerOpen && (
                <MediaAssetPicker
                  selectedIds={form.mediaIds}
                  onChange={(mediaIds) =>
                    setForm((current) => ({ ...current, mediaIds }))
                  }
                  onClose={() => setPickerOpen(false)}
                  multiple
                  title="Template media"
                />
              )}
            </div>
            <div className="cc-template-field full">
              <label>Checklist defaults</label>
              <div className="cc-template-checklist">
                {(
                  Object.keys(CHECKLIST_LABELS) as Array<
                    keyof ComposerChecklist
                  >
                ).map((key) => (
                  <label key={key}>
                    <input
                      type="checkbox"
                      checked={form.checklist[key]}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          checklist: {
                            ...current.checklist,
                            [key]: event.target.checked,
                          },
                        }))
                      }
                    />
                    {CHECKLIST_LABELS[key]}
                  </label>
                ))}
              </div>
            </div>
            {error && (
              <div className="cc-template-error" role="alert">
                {error}
              </div>
            )}
            <div className="cc-template-dialog-actions full">
              <button type="button" onClick={onClose}>
                Cancel
              </button>
              <button className="primary">
                {mode === "edit" ? "Save changes" : "Create template"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default function TemplatesModalPage() {
  const {
    templates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    useTemplate: applyTemplate,
    settings,
  } = useContentCalendarStore()
  const { items, urls } = useMediaAssets()
  const platformOptions = getActivePlatformOptions()
  const [query, setQuery] = useState("")
  const [platformFilter, setPlatformFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [archivedFilter, setArchivedFilter] = useState("active")
  const [sort, setSort] = useState("newest")
  const [today] = useState(() => new Date())
  const [dialog, setDialog] = useState<{ mode: DialogMode; id?: string }>()
  const allPostTypes = useMemo(() => getActivePostTypes(), [])
  const visible = useMemo(
    () =>
      templates
        .filter((template) => {
          const haystack =
            `${template.name} ${template.description} ${template.hook} ${template.body} ${template.cta} ${template.hashtags.join(" ")} ${template.platform} ${template.postType}`.toLowerCase()
          return (
            (!query.trim() || haystack.includes(query.trim().toLowerCase())) &&
            (platformFilter === "all" ||
              template.platform === platformFilter) &&
            (typeFilter === "all" || template.postType === typeFilter) &&
            (archivedFilter === "all" ||
              (archivedFilter === "archived"
                ? template.archived
                : !template.archived))
          )
        })
        .sort((a, b) =>
          sort === "name"
            ? a.name.localeCompare(b.name)
            : sort === "oldest"
              ? a.createdAt.localeCompare(b.createdAt)
              : b.createdAt.localeCompare(a.createdAt)
        ),
    [templates, query, platformFilter, typeFilter, archivedFilter, sort]
  )
  const groups = useMemo(
    () =>
      Array.from(new Set(visible.map((template) => template.platform)))
        .sort((a, b) => platformLabel(a).localeCompare(platformLabel(b)))
        .map((platform) => ({
          platform,
          templates: visible.filter(
            (template) => template.platform === platform
          ),
        })),
    [visible]
  )
  const selected = dialog?.id
    ? templates.find((template) => template.id === dialog.id)
    : undefined
  function remove(template: ContentTemplate) {
    if (
      window.confirm(
        `Delete “${template.name}”? Its media and content will remain available.`
      )
    ) {
      deleteTemplate(template.id)
      setDialog((current) =>
        current?.id === template.id ? undefined : current
      )
    }
  }
  function save(
    value: Omit<ContentTemplate, "id" | "createdAt" | "updatedAt">
  ) {
    if (dialog?.mode === "edit" && dialog.id) updateTemplate(dialog.id, value)
    else addTemplate(value)
    setDialog(undefined)
  }
  return (
    <div className="cc-template-page">
      <style>{CSS}</style>
      <header className="cc-template-head">
        <div>
          <div className="cc-template-title-row">
            <h1 className="cc-template-title">
              Start with a shape that works.
            </h1>
            <Sparkles className="cc-template-star" size={29} />
          </div>
          <div className="cc-template-line" />
        </div>
        <div className="cc-template-meta">
          <span>
            <CalendarDays size={13} style={{ verticalAlign: "middle" }} />{" "}
            {formatContentDate(today, settings.dateFormat)}
          </span>
          <span className="cc-template-local">
            <MapPin size={11} fill="currentColor" />
            Local only
          </span>
        </div>
      </header>
      <div className="cc-template-toolbar">
        <label className="cc-template-search">
          <Search size={13} color="#b0a098" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search templates, platforms, or content..."
          />
        </label>
        <div className="cc-template-select-wrap">
          <select
            className="cc-template-select"
            value={platformFilter}
            onChange={(event) => setPlatformFilter(event.target.value)}
          >
            <option value="all">All platforms</option>
            {platformOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown size={11} />
        </div>
        <div className="cc-template-select-wrap">
          <select
            className="cc-template-select"
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
          >
            <option value="all">All post types</option>
            {allPostTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.label}
              </option>
            ))}
          </select>
          <ChevronDown size={11} />
        </div>
        <div className="cc-template-select-wrap">
          <select
            className="cc-template-select"
            value={archivedFilter}
            onChange={(event) => setArchivedFilter(event.target.value)}
          >
            <option value="active">Active templates</option>
            <option value="archived">Archived templates</option>
            <option value="all">All templates</option>
          </select>
          <ChevronDown size={11} />
        </div>
        <div className="cc-template-select-wrap">
          <select
            className="cc-template-select"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="name">A-Z</option>
          </select>
          <ChevronDown size={11} />
        </div>
        <button
          className="cc-template-add"
          onClick={() => setDialog({ mode: "create" })}
          aria-label="Create template"
        >
          <Plus size={17} />
        </button>
      </div>
      <div className="cc-template-section">
        <div>
          <h2 className="cc-template-section-title">
            Reusable content templates{" "}
            <span style={{ color: "var(--cc-accent)" }}>»</span>
          </h2>
          <p className="cc-template-section-sub">
            One platform. One valid content type. Ready when you are.
          </p>
        </div>
        <div className="cc-template-count">
          <span className="cc-template-count-icon">
            <Sparkles size={15} />
          </span>
          <span>
            <strong>{templates.length} templates</strong>
            {platformOptions.length} active platforms · {allPostTypes.length}{" "}
            post types
          </span>
        </div>
      </div>
      {groups.length ? (
        groups.map((group) => (
          <section className="cc-template-platform-group" key={group.platform}>
            <div className="cc-template-platform-heading">
              <h3>{platformLabel(group.platform)}</h3>
              <span>
                {group.templates.length}{" "}
                {group.templates.length === 1 ? "template" : "templates"}
              </span>
              <span className="cc-template-platform-rule" />
            </div>
            <div className="cc-template-grid">
              {group.templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  items={items}
                  urls={urls}
                  onView={() => setDialog({ mode: "view", id: template.id })}
                  onEdit={() => setDialog({ mode: "edit", id: template.id })}
                  onUse={() => applyTemplate(template.id)}
                  onDuplicate={() => {
                    const copy = duplicateTemplate(template.id)
                    if (copy) setDialog({ mode: "edit", id: copy.id })
                  }}
                  onArchive={() =>
                    updateTemplate(template.id, {
                      archived: !template.archived,
                    })
                  }
                  onDelete={() => remove(template)}
                />
              ))}
            </div>
          </section>
        ))
      ) : (
        <div className="cc-template-empty">
          <strong>
            {templates.length
              ? "No templates match these filters."
              : "Your template library is ready."}
          </strong>
          {templates.length
            ? "Try another platform, post type, or search."
            : "Create your first platform-specific template."}
        </div>
      )}
      {dialog && (
        <TemplateDialog
          key={`${dialog.mode}-${dialog.id ?? "new"}`}
          mode={dialog.mode}
          template={selected}
          items={items}
          urls={urls}
          onClose={() => setDialog(undefined)}
          onSave={save}
          onUse={selected ? () => applyTemplate(selected.id) : undefined}
          onEdit={
            selected
              ? () => setDialog({ mode: "edit", id: selected.id })
              : undefined
          }
          onDuplicate={
            selected
              ? () => {
                  const copy = duplicateTemplate(selected.id)
                  if (copy) setDialog({ mode: "edit", id: copy.id })
                }
              : undefined
          }
          onArchive={
            selected
              ? () =>
                  updateTemplate(selected.id, { archived: !selected.archived })
              : undefined
          }
          onDelete={selected ? () => remove(selected) : undefined}
        />
      )}
    </div>
  )
}
