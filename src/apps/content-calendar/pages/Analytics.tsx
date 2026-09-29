import { useEffect, useMemo, useRef, useState, type FormEvent } from "react"
import {
  CalendarDays,
  ChevronDown,
  Lightbulb,
  MapPin,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react"
import { useContentCalendarStore } from "../store"
import type {
  AnalyticsPerformanceRecord,
  ContentPost,
  PipelineItem,
  Platform,
  PostStatus,
} from "../types"
import {
  getActivePlatformOptions,
  getActivePostTypes,
  getPlatformConfig,
} from "../platformConfig"
import { mediaUrl } from "../mediaStorage"
import { useMediaAssets } from "../components/useMediaAssets"
import { formatContentDate } from "../settings"
import type { WeekStartPreference } from "../types"

const CSS = `
.cc-an-page{background:radial-gradient(circle at 75% 8%,rgba(255,255,255,.7),transparent 28%),var(--cc-bg);color:var(--cc-text);min-height:100%;padding-bottom:32px}.cc-an-header{display:flex;align-items:flex-start;justify-content:space-between;gap:24px;padding:16px 22px 14px;border-bottom:1px solid var(--cc-border)}.cc-an-heading-row{display:flex;align-items:center;gap:9px}.cc-an-heading{font-family:'DM Serif Display',Georgia,serif;font-weight:400;font-size:29px;line-height:1;letter-spacing:-.02em;margin:0;color:var(--cc-text);white-space:nowrap}.cc-an-swoop{display:block;width:115px;height:11px;margin-top:8px;border-top:3px solid var(--cc-accent);border-radius:50%;transform:rotate(-3deg)}.cc-an-header-right{flex-shrink:0;display:flex;flex-direction:column;align-items:flex-end;gap:10px}.cc-an-meta{display:flex;align-items:center;gap:18px;font-weight:650;font-size:12px}.cc-an-date{display:flex;align-items:center;gap:7px;color:var(--cc-text)}.cc-an-local{display:flex;align-items:center;gap:7px;padding:6px 14px;background:#fae7c5;border-radius:99px;font-size:11px;color:#7a5a2a}.cc-an-toolbar{display:flex;align-items:center;gap:8px;padding:10px 22px 12px;border-bottom:1px solid var(--cc-border);justify-content:flex-end;flex-wrap:wrap}.cc-an-search{height:31px;min-width:220px;display:flex;align-items:center;gap:8px;padding:0 11px;background:var(--cc-card);border:1px solid var(--cc-border);border-radius:11px;font-size:10.5px;color:var(--cc-text-3)}.cc-an-search input{border:0;outline:0;width:100%;background:transparent;font:inherit;color:var(--cc-text)}.cc-an-select-wrap{position:relative}.cc-an-select{appearance:none;height:31px;padding:0 26px 0 11px;border:1px solid var(--cc-border);border-radius:11px;background:var(--cc-card);font-size:10.5px;color:var(--cc-text);outline:0;cursor:pointer;font-family:inherit}.cc-an-select-wrap>svg{position:absolute;right:8px;top:10px;pointer-events:none;color:var(--cc-text-2)}.cc-an-create-btn{height:32px;display:flex;align-items:center;gap:6px;padding:0 16px;border-radius:18px;background:linear-gradient(90deg,#d96d49,#dc815f);color:#fff;font-size:11px;font-weight:700;border:none;cursor:pointer;white-space:nowrap}.cc-an-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;padding:16px 22px 0}.cc-an-stat{background:rgba(255,255,255,.88);border:1px solid var(--cc-border);border-radius:11px;padding:14px 16px;display:flex;gap:13px;align-items:flex-start}.cc-an-stat-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}.cc-an-stat-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--cc-text-3);margin-bottom:4px}.cc-an-stat-value{font-family:'DM Serif Display',Georgia,serif;font-size:28px;font-weight:400;color:var(--cc-text);line-height:1;margin-bottom:3px}.cc-an-stat-sub{font-size:10px;color:var(--cc-text-3);line-height:1.3}.cc-an-body{display:grid;grid-template-columns:1fr 258px;gap:16px;padding:16px 22px 0;align-items:start}.cc-an-main{display:grid;grid-template-columns:1fr 1fr;gap:14px}.cc-an-card,.cc-an-insights{background:rgba(255,255,255,.88);border:1px solid var(--cc-border);border-radius:11px;padding:16px}.cc-an-card-hdr,.cc-an-insights-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}.cc-an-card-title,.cc-an-insights-title{font-family:'DM Serif Display',Georgia,serif;font-weight:400;font-size:16px;color:var(--cc-text);margin:0;display:flex;align-items:center;gap:7px}.cc-an-details-btn{font-size:10.5px;font-weight:700;color:var(--cc-accent);background:none;border:none;cursor:pointer;padding:0;font-family:inherit}.cc-an-donut-wrap{display:flex;align-items:center;gap:12px}.cc-an-legend{display:flex;flex-direction:column;gap:10px;flex:1}.cc-an-legend-row{display:flex;align-items:center;gap:8px;font-size:11px;color:var(--cc-text-2)}.cc-an-legend-dot{width:11px;height:11px;border-radius:50%;flex-shrink:0}.cc-an-legend-label{flex:1}.cc-an-legend-count{font-weight:700;color:var(--cc-text)}.cc-an-legend-pct{color:var(--cc-text-3);min-width:34px;text-align:right}.cc-an-chart-empty{height:150px;display:grid;place-items:center;color:#9a8a82;font-size:11px;text-align:center;border:1px dashed #eadfd6;border-radius:8px}.cc-an-table-hdr,.cc-an-table-row{display:grid;grid-template-columns:1fr 70px 82px;gap:8px}.cc-an-table-hdr{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--cc-text-3);margin-bottom:8px}.cc-an-table-row{align-items:center;padding:8px 2px;border-top:1px solid #f0e8e0}.cc-an-post-info{display:flex;align-items:center;gap:9px;min-width:0}.cc-an-post-thumb{width:36px;height:36px;border-radius:6px;flex-shrink:0;object-fit:cover;background:#eee3d9}.cc-an-post-title{font-size:11px;font-weight:600;color:var(--cc-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.cc-an-post-meta{font-size:9.5px;color:var(--cc-text-3)}.cc-an-type-pill{display:inline-block;padding:2px 7px;border-radius:99px;font-size:9px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.cc-an-rate-col{display:flex;flex-direction:column;align-items:flex-end;gap:2px}.cc-an-rate{font-size:11px;font-weight:700;color:var(--cc-text)}.cc-an-rate-sub{font-size:9px;color:var(--cc-text-3)}.cc-an-insights-title{font-size:17px}.cc-an-insight-card{margin-bottom:14px}.cc-an-insight-row{display:flex;align-items:flex-start;gap:10px}.cc-an-insight-icon{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}.cc-an-insight-body{flex:1;min-width:0}.cc-an-insight-title{font-size:12px;font-weight:700;color:var(--cc-text);margin-bottom:4px}.cc-an-insight-text{font-size:10.5px;color:var(--cc-text-3);line-height:1.45}.cc-an-insight-line{width:28px;border-top:2px solid var(--cc-border);border-radius:50%;margin-top:8px;transform:rotate(-2deg)}.cc-an-overlay{position:fixed;inset:0;background:rgba(35,31,29,.28);z-index:1000;display:grid;place-items:center;padding:20px}.cc-an-dialog{width:min(560px,100%);max-height:92vh;overflow:auto;background:#fffaf6;border:1px solid #e9ddd3;border-radius:14px;padding:20px;box-shadow:0 18px 60px rgba(48,39,34,.2)}.cc-an-dialog-head{display:flex;justify-content:space-between;gap:12px;margin-bottom:14px}.cc-an-dialog-title{font:400 24px 'DM Serif Display',Georgia,serif;margin:0;color:var(--cc-text)}.cc-an-dialog-sub{font-size:10px;color:var(--cc-text-3);margin:6px 0 0}.cc-an-close{width:28px;height:28px;border:1px solid #e0d6ce;border-radius:8px;background:var(--cc-card);color:#806f66;display:grid;place-items:center;cursor:pointer}.cc-an-form{display:grid;grid-template-columns:1fr 1fr;gap:10px}.cc-an-field{display:flex;flex-direction:column;gap:5px}.cc-an-field.full{grid-column:1/-1}.cc-an-field label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#806f66}.cc-an-field input,.cc-an-field select,.cc-an-field textarea{border:1px solid #e0d6ce;border-radius:8px;background:var(--cc-card);padding:9px;font-size:11px;outline:0;font-family:inherit;color:var(--cc-text)}.cc-an-field textarea{min-height:70px;resize:vertical}.cc-an-field input:focus,.cc-an-field select:focus,.cc-an-field textarea:focus{border-color:var(--cc-accent)}.cc-an-error{font-size:10px;color:#ad5144;grid-column:1/-1}.cc-an-dialog-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:16px}.cc-an-dialog-actions button{padding:8px 13px;border-radius:8px;border:1px solid #dfd5cd;background:var(--cc-card);color:#806f66;font-size:10px;cursor:pointer}.cc-an-dialog-actions .primary{background:var(--cc-accent);border-color:var(--cc-accent);color:#fff}@media(max-width:1050px){.cc-an-page{min-width:900px}}@media(max-width:800px){.cc-an-page{min-width:0}.cc-an-stats{grid-template-columns:1fr 1fr}.cc-an-body{grid-template-columns:1fr}.cc-an-insights{order:-1}.cc-an-main{grid-template-columns:1fr}}@media(max-width:520px){.cc-an-stats{grid-template-columns:1fr}.cc-an-toolbar{justify-content:flex-start}.cc-an-search{min-width:100%;order:-1}.cc-an-form{grid-template-columns:1fr}.cc-an-field.full{grid-column:auto}}
`

type Period = "week" | "month" | "30days" | "custom"
type DialogMode = "create" | "edit" | "view"
interface AnalyticsItem {
  id: string
  title: string
  type: string
  status: PostStatus
  date: string
  platforms: Platform[]
  campaignId?: string
  campaignName?: string
  mediaIds: string[]
  composerId?: string
  pipelineId?: string
  source: "post" | "pipeline" | "draft"
  text: string
}
const COLORS = [
  "#d97856",
  "#9e6080",
  "#7a9db5",
  "#d4a843",
  "#8ba77d",
  "#9b7eb5",
]

function localKey(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}
function startOfPeriod(period: Period, customStart: string, weekStartsOn: WeekStartPreference, now: Date) {
  if (period === "custom" && customStart) return customStart
  if (period === "30days") {
    const start = new Date(now)
    start.setDate(now.getDate() - 29)
    return localKey(start)
  }
  if (period === "month")
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`
  const start = new Date(now)
  const dayOffset = (start.getDay() - weekStartsOn + 7) % 7
  start.setDate(now.getDate() - dayOffset)
  return localKey(start)
}
function endOfPeriod(period: Period, customEnd: string, now: Date) {
  if (period === "custom" && customEnd) return customEnd
  return localKey(now)
}
function platformName(platform: Platform) {
  return getPlatformConfig(platform).label
}
function itemKey(item: {
  id: string
  composerId?: string
  pipelineId?: string
}) {
  return item.composerId
    ? `composer:${item.composerId}`
    : item.pipelineId
      ? `pipeline:${item.pipelineId}`
      : `id:${item.id}`
}
function buildItems(
  posts: ContentPost[],
  pipeline: PipelineItem[],
  campaigns: { id: string; name: string }[],
  drafts: {
    id: string
    pipelineId?: string
    postType: string
    platforms: Platform[]
    publishDate: string
    status: string
    caption: string
    mediaIds: string[]
    campaignId?: string
  }[]
) {
  const campaignMap = new Map(
    campaigns.map((campaign) => [campaign.id, campaign.name])
  )
  const items: AnalyticsItem[] = []
  const keys = new Set<string>()
  posts.forEach((post) => {
    const key = itemKey(post)
    if (keys.has(key)) return
    keys.add(key)
    items.push({
      id: post.id,
      title: post.title || "Untitled post",
      type: post.type,
      status: post.status,
      date: post.date,
      platforms: post.platforms,
      campaignId: post.campaignId,
      campaignName: post.campaignId
        ? campaignMap.get(post.campaignId)
        : undefined,
      mediaIds: post.mediaIds ?? [],
      composerId: post.composerId,
      pipelineId: post.pipelineId,
      source: "post",
      text: post.title,
    })
  })
  pipeline.forEach((item) => {
    const existingIndex = items.findIndex(
      (candidate) =>
        candidate.pipelineId === item.id ||
        (item.composerId && candidate.composerId === item.composerId) ||
        candidate.id === item.id
    )
    const status: PostStatus =
      item.stage === "published"
        ? "Published"
        : item.stage === "ready"
          ? "Scheduled"
          : item.stage === "drafting"
            ? "Draft"
            : "Planned"
    if (existingIndex >= 0) {
      const existing = items[existingIndex]
      items[existingIndex] = {
        ...existing,
        id: existing.id,
        title: item.title || existing.title,
        type: item.contentType || existing.type,
        status,
        date: item.scheduledDate || existing.date,
        platforms: item.platforms.length ? item.platforms : existing.platforms,
        campaignId: item.campaignId ?? existing.campaignId,
        campaignName: item.campaignId
          ? campaignMap.get(item.campaignId)
          : existing.campaignName,
        mediaIds: item.mediaIds?.length ? item.mediaIds : existing.mediaIds,
        composerId: item.composerId ?? existing.composerId,
        pipelineId: item.id,
        source: "pipeline",
        text: `${existing.text} ${item.notes ?? ""}`.trim(),
      }
      keys.add(itemKey(item))
      return
    }
    const key = itemKey(item)
    if (keys.has(key)) return
    keys.add(key)
    items.push({
      id: item.id,
      title: item.title || "Untitled pipeline item",
      type: item.contentType,
      status,
      date: item.scheduledDate,
      platforms: item.platforms,
      campaignId: item.campaignId,
      campaignName: item.campaignId
        ? campaignMap.get(item.campaignId)
        : undefined,
      mediaIds: item.mediaIds ?? [],
      composerId: item.composerId,
      pipelineId: item.id,
      source: "pipeline",
      text: item.notes ?? "",
    })
  })
  drafts.forEach((draft) => {
    const key = draft.pipelineId
      ? `pipeline:${draft.pipelineId}`
      : `composer:${draft.id}`
    if (keys.has(key) || draft.status !== "scheduled" || !draft.publishDate)
      return
    keys.add(key)
    items.push({
      id: draft.id,
      title: draft.caption || "Untitled draft",
      type: draft.postType,
      status: draft.status === "scheduled" ? "Scheduled" : "Draft",
      date: draft.publishDate,
      platforms: draft.platforms,
      campaignId: draft.campaignId,
      campaignName: draft.campaignId
        ? campaignMap.get(draft.campaignId)
        : undefined,
      mediaIds: draft.mediaIds ?? [],
      composerId: draft.id,
      pipelineId: draft.pipelineId,
      source: "draft",
      text: draft.caption,
    })
  })
  return items
}

function DonutChart({
  values,
}: {
  values: { label: string; count: number }[]
}) {
  const total = values.reduce((sum, value) => sum + value.count, 0)
  const cx = 90
  const cy = 90
  const radius = 67
  const circumference = 2 * Math.PI * radius
  return total ? (
    <div className="cc-an-donut-wrap">
      <svg width="180" height="180" viewBox="0 0 180 180">
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="#f0e8e0"
          strokeWidth="25"
        />
        {values.map((value, index) => {
          const pct = value.count / total
          const dash = pct * circumference
          const offset = values
            .slice(0, index)
            .reduce(
              (sum, previous) => sum + (previous.count / total) * circumference,
              0
            )
          return (
            <circle
              key={value.label}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={COLORS[index % COLORS.length]}
              strokeWidth="25"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          )
        })}
        <text
          x={cx}
          y={cy - 5}
          textAnchor="middle"
          fontSize="26"
          fontFamily="'DM Serif Display',Georgia,serif"
          fill="var(--cc-text)"
        >
          {total}
        </text>
        <text
          x={cx}
          y={cy + 15}
          textAnchor="middle"
          fontSize="10"
          fill="var(--cc-text-3)"
        >
          posts
        </text>
      </svg>
      <div className="cc-an-legend">
        {values.map((value, index) => (
          <div className="cc-an-legend-row" key={value.label}>
            <span
              className="cc-an-legend-dot"
              style={{ background: COLORS[index % COLORS.length] }}
            />
            <span className="cc-an-legend-label">{value.label}</span>
            <span className="cc-an-legend-count">{value.count}</span>
            <span className="cc-an-legend-pct">
              {Math.round((value.count / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  ) : (
    <div className="cc-an-chart-empty">No content in this period.</div>
  )
}

function BarChart({ values }: { values: { label: string; count: number }[] }) {
  const max = Math.max(...values.map((value) => value.count), 1)
  return values.length ? (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 8,
        height: 160,
        padding: "8px 4px 0",
        borderBottom: "1px solid var(--cc-border)",
      }}
    >
      {values.map((value) => (
        <div
          key={value.label}
          style={{
            flex: 1,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 5,
          }}
        >
          <span style={{ fontSize: 9, color: "#1a2428", fontWeight: 700 }}>
            {value.count || ""}
          </span>
          <div
            style={{
              width: "70%",
              maxWidth: 28,
              height: `${Math.max((value.count / max) * 112, value.count ? 5 : 1)}px`,
              background: "#b89090",
              borderRadius: "4px 4px 0 0",
            }}
          />
          <span
            style={{ fontSize: 8.5, color: "#9a8a82", whiteSpace: "nowrap" }}
          >
            {value.label}
          </span>
        </div>
      ))}
    </div>
  ) : (
    <div className="cc-an-chart-empty">
      No published content in this period.
    </div>
  )
}

function PerformanceDialog({
  mode,
  record,
  items,
  onClose,
  onSave,
  onDelete,
  onEdit,
  onOpenPost,
}: {
  mode: DialogMode
  record?: AnalyticsPerformanceRecord
  items: AnalyticsItem[]
  onClose: () => void
  onSave: (
    value: Omit<
      AnalyticsPerformanceRecord,
      "id" | "createdAt" | "updatedAt" | "source"
    >
  ) => void
  onDelete?: () => void
  onEdit?: () => void
  onOpenPost?: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [form, setForm] = useState({
    postId: record?.postId ?? items[0]?.id ?? "",
    views: String(record?.views ?? 0),
    likes: String(record?.likes ?? 0),
    comments: String(record?.comments ?? 0),
    saves: String(record?.saves ?? 0),
    shares: String(record?.shares ?? 0),
    clicks: String(record?.clicks ?? 0),
    note: record?.note ?? "",
  })
  const [error, setError] = useState("")
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    ref.current?.focus()
    const close = (event: KeyboardEvent) => event.key === "Escape" && onClose()
    window.addEventListener("keydown", close)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener("keydown", close)
    }
  }, [onClose])
  function submit(event: FormEvent) {
    event.preventDefault()
    const keys = [
      "views",
      "likes",
      "comments",
      "saves",
      "shares",
      "clicks",
    ] as const
    if (!form.postId) return setError("Choose a post.")
    if (keys.some((key) => !/^\d+$/.test(form[key])))
      return setError("Performance metrics must be nonnegative whole numbers.")
    onSave({
      postId: form.postId,
      views: Number(form.views),
      likes: Number(form.likes),
      comments: Number(form.comments),
      saves: Number(form.saves),
      shares: Number(form.shares),
      clicks: Number(form.clicks),
      note: form.note.trim(),
    })
  }
  const title =
    mode === "create"
      ? "Add performance"
      : mode === "edit"
        ? "Edit performance"
        : "Performance details"
  return (
    <div
      className="cc-an-overlay"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        className="cc-an-dialog"
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
      >
        <div className="cc-an-dialog-head">
          <div>
            <h2 className="cc-an-dialog-title">{title}</h2>
            <p className="cc-an-dialog-sub">
              Record real performance without changing the content itself.
            </p>
          </div>
          <button
            className="cc-an-close"
            onClick={onClose}
            aria-label="Close performance dialog"
          >
            <X size={14} />
          </button>
        </div>
        {mode === "view" && record ? (
          <div>
            <div
              className="cc-an-detail-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 10,
              }}
            >
              <p>
                <b>Post</b>
                <br />
                {items.find((item) => item.id === record.postId)?.title ??
                  record.postId}
              </p>
              <p>
                <b>Views</b>
                <br />
                {record.views}
              </p>
              <p>
                <b>Likes</b>
                <br />
                {record.likes}
              </p>
              <p>
                <b>Comments</b>
                <br />
                {record.comments}
              </p>
              <p>
                <b>Saves</b>
                <br />
                {record.saves}
              </p>
              <p>
                <b>Shares</b>
                <br />
                {record.shares}
              </p>
              <p>
                <b>Clicks</b>
                <br />
                {record.clicks}
              </p>
              <p>
                <b>Note</b>
                <br />
                {record.note || "No note added."}
              </p>
              <div className="cc-an-dialog-actions">
                <button onClick={onClose}>Close</button>
                {onEdit && <button onClick={onEdit}>Edit</button>}
                {onOpenPost && (
                  <button className="primary" onClick={onOpenPost}>
                    Open post
                  </button>
                )}
                {onDelete && <button onClick={onDelete}>Delete</button>}
              </div>
            </div>
          </div>
        ) : (
          <form className="cc-an-form" onSubmit={submit}>
            <div className="cc-an-field full">
              <label>Post</label>
              <select
                value={form.postId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    postId: event.target.value,
                  }))
                }
              >
                <option value="">Choose a post</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title} · {item.date}
                  </option>
                ))}
              </select>
            </div>
            {(
              [
                "views",
                "likes",
                "comments",
                "saves",
                "shares",
                "clicks",
              ] as const
            ).map((key) => (
              <div className="cc-an-field" key={key}>
                <label>{key}</label>
                <input
                  inputMode="numeric"
                  value={form[key]}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      [key]: event.target.value,
                    }))
                  }
                />
              </div>
            ))}
            <div className="cc-an-field full">
              <label>Note</label>
              <textarea
                value={form.note}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    note: event.target.value,
                  }))
                }
              />
            </div>
            {error && (
              <div className="cc-an-error" role="alert">
                {error}
              </div>
            )}
            <div className="cc-an-dialog-actions full">
              <button type="button" onClick={onClose}>
                Cancel
              </button>
              <button className="primary">
                {mode === "edit" ? "Save changes" : "Save performance"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default function AnalyticsDataPage() {
  const {
    posts,
    pipelineItems,
    campaigns,
    composerDrafts,
    performanceRecords,
    addPerformanceRecord,
    updatePerformanceRecord,
    deletePerformanceRecord,
    openComposer,
    settings,
  } = useContentCalendarStore()
  const { items: mediaItems, urls: mediaUrls } = useMediaAssets()
  const [query, setQuery] = useState("")
  const [platform, setPlatform] = useState("all")
  const [type, setType] = useState("all")
  const [campaign, setCampaign] = useState("all")
  const [status, setStatus] = useState("all")
  const [period, setPeriod] = useState<Period>("week")
  const [customStart, setCustomStart] = useState("")
  const [customEnd, setCustomEnd] = useState("")
  const [dialog, setDialog] = useState<{ mode: DialogMode; id?: string }>()
  const [createMenu, setCreateMenu] = useState(false)
  const [now] = useState(() => new Date())
  const platformOptions = getActivePlatformOptions()
  const availableTypes =
    platform === "all"
      ? getActivePostTypes()
      : getPlatformConfig(platform).postTypes
  const allItems = useMemo(
    () => buildItems(posts, pipelineItems, campaigns, composerDrafts),
    [posts, pipelineItems, campaigns, composerDrafts]
  )
  const from = startOfPeriod(period, customStart, settings.weekStartsOn, now)
  const to = endOfPeriod(period, customEnd, now)
  const filtered = useMemo(
    () =>
      allItems.filter((item) => {
        const haystack =
          `${item.title} ${item.text} ${item.type} ${item.platforms.join(" ")} ${item.campaignName ?? ""}`.toLowerCase()
        return (
          (!query.trim() || haystack.includes(query.trim().toLowerCase())) &&
          (platform === "all" || item.platforms.includes(platform)) &&
          (type === "all" || item.type === type) &&
          (campaign === "all" || item.campaignId === campaign) &&
          (status === "all" || item.status === status) &&
          item.date >= from &&
          item.date <= to
        )
      }),
    [allItems, query, platform, type, campaign, status, from, to]
  )
  const published = filtered.filter((item) => item.status === "Published")
  const typeCounts = Array.from(new Set(filtered.map((item) => item.type)))
    .map((label) => ({
      label,
      count: filtered.filter((item) => item.type === label).length,
    }))
    .sort((a, b) => b.count - a.count)
  const platformCounts = Array.from(
    new Set(filtered.flatMap((item) => item.platforms))
  )
    .map((label) => ({
      label,
      count: filtered.filter((item) => item.platforms.includes(label)).length,
    }))
    .sort((a, b) => b.count - a.count)
  const consistency = Array.from(
    { length: period === "month" ? 4 : 7 },
    (_, index) => {
      const dayIndex = (settings.weekStartsOn + index) % 7
      const label = period === "month"
        ? `W${index + 1}`
        : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dayIndex]
      return {
        label,
        count: published.filter((item) => {
          const date = new Date(`${item.date}T12:00:00`)
          if (period === "month")
            return Math.floor((date.getDate() - 1) / 7) === index
          return date.getDay() === dayIndex
        }).length,
      }
    }
  )
  const recordsForFiltered = performanceRecords.filter((record) =>
    filtered.some(
      (item) =>
        item.id === record.postId ||
        item.composerId === record.postId ||
        item.pipelineId === record.postId
    )
  )
  const top = recordsForFiltered
    .map((record) => {
      const item = filtered.find(
        (candidate) =>
          candidate.id === record.postId ||
          candidate.composerId === record.postId ||
          candidate.pipelineId === record.postId
      )
      const interactions =
        record.likes + record.comments + record.saves + record.shares
      return {
        record,
        item,
        interactions,
        rate: record.views ? (interactions / record.views) * 100 : 0,
      }
    })
    .filter((entry) => entry.item)
    .sort((a, b) => b.rate - a.rate || b.interactions - a.interactions)
    .slice(0, 5)
  const selectedRecord = dialog?.id
    ? performanceRecords.find((record) => record.id === dialog.id)
    : undefined
  const selectedItem = selectedRecord
    ? filtered.find(
        (item) =>
          item.id === selectedRecord.postId ||
          item.composerId === selectedRecord.postId ||
          item.pipelineId === selectedRecord.postId
      )
    : undefined
  const insights = useMemo(() => {
    const next: {
      title: string
      text: string
      bg: string
      color: string
      symbol: string
    }[] = []
    if (platformCounts[0])
      next.push({
        title: `${platformName(platformCounts[0].label)} has the most output`,
        text: `${platformCounts[0].count} filtered content item${platformCounts[0].count === 1 ? "" : "s"} use this platform.`,
        bg: "#fce3dc",
        color: "#d97856",
        symbol: "↗",
      })
    if (typeCounts[0])
      next.push({
        title: `${typeCounts[0].label} is your leading format`,
        text: `${typeCounts[0].count} filtered item${typeCounts[0].count === 1 ? "" : "s"} use this platform-specific content type.`,
        bg: "#ddeaf3",
        color: "#3a6f92",
        symbol: "✦",
      })
    const busiest = consistency.reduce(
      (best, current) => (current.count > best.count ? current : best),
      consistency[0]
    )
    if (busiest?.count)
      next.push({
        title: "Publishing has a clear peak",
        text: `${busiest.label} has the highest publishing count in this period.`,
        bg: "#fef3c0",
        color: "#a07a00",
        symbol: "◷",
      })
    if (top[0]?.item)
      next.push({
        title: "Performance data is available",
        text: `${top[0].item.title} currently leads the recorded performance results.`,
        bg: "#fce4ec",
        color: "#c05d7a",
        symbol: "♡",
      })
    return next
  }, [platformCounts, typeCounts, consistency, top])
  function savePerformance(
    value: Omit<
      AnalyticsPerformanceRecord,
      "id" | "createdAt" | "updatedAt" | "source"
    >
  ) {
    if (dialog?.mode === "edit" && dialog.id)
      updatePerformanceRecord(dialog.id, value)
    else addPerformanceRecord(value)
    setDialog(undefined)
  }
  function deleteRecord(record: AnalyticsPerformanceRecord) {
    if (
      window.confirm(
        "Delete this performance record? The content will remain unchanged."
      )
    ) {
      deletePerformanceRecord(record.id)
      setDialog(undefined)
    }
  }
  const periodLabel =
    period === "week"
      ? "This week"
      : period === "month"
        ? "This month"
        : period === "30days"
          ? "Last 30 days"
          : "Custom range"
  return (
    <div className="cc-an-page">
      <style>{CSS}</style>
      <div className="cc-an-header">
        <div>
          <div className="cc-an-heading-row">
            <h1 className="cc-an-heading">Notice what is working.</h1>
            <Sparkles
              size={22}
              style={{
                color: "#e6ad3f",
                transform: "rotate(-10deg)",
                flexShrink: 0,
              }}
            />
          </div>
          <span className="cc-an-swoop" />
        </div>
        <div className="cc-an-header-right">
          <div className="cc-an-meta">
            <span className="cc-an-date">
              <CalendarDays size={14} color="#c27b6a" />
              <span>{formatContentDate(from, settings.dateFormat)} - {formatContentDate(to, settings.dateFormat)}</span>
            </span>
            <span className="cc-an-local">
              <MapPin size={11} />
              Local only
            </span>
          </div>
        </div>
      </div>
      <div className="cc-an-toolbar">
        <label className="cc-an-search">
          <Search size={12} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search posts, campaigns, or platforms..."
          />
        </label>
        <div className="cc-an-select-wrap">
          <select
            className="cc-an-select"
            value={platform}
            onChange={(event) => {
              setPlatform(event.target.value)
              setType("all")
            }}
          >
            <option value="all">All platforms</option>
            {platformOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown size={10} />
        </div>
        <div className="cc-an-select-wrap">
          <select
            className="cc-an-select"
            value={type}
            onChange={(event) => setType(event.target.value)}
          >
            <option value="all">All content types</option>
            {availableTypes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
          <ChevronDown size={10} />
        </div>
        <div className="cc-an-select-wrap">
          <select
            className="cc-an-select"
            value={campaign}
            onChange={(event) => setCampaign(event.target.value)}
          >
            <option value="all">All campaigns</option>
            {campaigns.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <ChevronDown size={10} />
        </div>
        <div className="cc-an-select-wrap">
          <select
            className="cc-an-select"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="all">All statuses</option>
            {(
              ["Planned", "Scheduled", "Published", "Draft"] as PostStatus[]
            ).map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <ChevronDown size={10} />
        </div>
        <div className="cc-an-select-wrap">
          <select
            className="cc-an-select"
            value={period}
            onChange={(event) => setPeriod(event.target.value as Period)}
          >
            <option value="week">This week</option>
            <option value="month">This month</option>
            <option value="30days">Last 30 days</option>
            <option value="custom">Custom range</option>
          </select>
          <ChevronDown size={10} />
        </div>
        {period === "custom" && (
          <>
            <input
              className="cc-an-select"
              type="date"
              value={customStart}
              onChange={(event) => setCustomStart(event.target.value)}
              aria-label="Start date"
            />
            <input
              className="cc-an-select"
              type="date"
              value={customEnd}
              onChange={(event) => setCustomEnd(event.target.value)}
              aria-label="End date"
            />
          </>
        )}
        <div style={{ position: "relative" }}>
          <button
            className="cc-an-create-btn"
            onClick={() => setCreateMenu((value) => !value)}
          >
            <Plus size={13} />
            Create post
            <ChevronDown size={11} />
          </button>
          {createMenu && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 5px)",
                zIndex: 20,
                background: "#fff",
                border: "1px solid var(--cc-border)",
                borderRadius: 10,
                padding: 5,
                minWidth: 150,
              }}
            >
              {platformOptions.flatMap((option) =>
                option.config.postTypes.slice(0, 3).map((postType) => (
                  <button
                    key={`${option.id}-${postType.id}`}
                    onClick={() => {
                      setCreateMenu(false)
                      openComposer({
                        platforms: [option.id],
                        postType: postType.id,
                        returnView: "analytics",
                      })
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      border: 0,
                      background: "transparent",
                      textAlign: "left",
                      padding: "7px 9px",
                      fontSize: 10,
                      cursor: "pointer",
                    }}
                  >
                    {option.label} · {postType.label}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>
      <div className="cc-an-stats">
        <div className="cc-an-stat">
          <div className="cc-an-stat-icon" style={{ background: "#fce3dc" }}>
            <CalendarDays size={18} color="#c27b6a" />
          </div>
          <div>
            <div className="cc-an-stat-label">Posts published</div>
            <div className="cc-an-stat-value">{published.length}</div>
            <div className="cc-an-stat-sub">
              {published.length
                ? `${published.length} in ${periodLabel.toLowerCase()}`
                : "No published content"}
            </div>
          </div>
        </div>
        <div className="cc-an-stat">
          <div className="cc-an-stat-icon" style={{ background: "#ddeaf3" }}>
            <TrendingUp size={18} color="#3a6f92" />
          </div>
          <div>
            <div className="cc-an-stat-label">Most-used format</div>
            <div className="cc-an-stat-value" style={{ fontSize: 21 }}>
              {typeCounts[0]?.label ?? "No data"}
            </div>
            <div className="cc-an-stat-sub">
              {typeCounts[0]
                ? `${typeCounts[0].count} item${typeCounts[0].count === 1 ? "" : "s"}`
                : "Create content to compare"}
            </div>
          </div>
        </div>
        <div className="cc-an-stat">
          <div className="cc-an-stat-icon" style={{ background: "#1a1a2e" }}>
            <Sparkles size={17} color="#fff" />
          </div>
          <div>
            <div className="cc-an-stat-label">Most-used platform</div>
            <div className="cc-an-stat-value" style={{ fontSize: 21 }}>
              {platformCounts[0]
                ? platformName(platformCounts[0].label)
                : "No data"}
            </div>
            <div className="cc-an-stat-sub">
              {platformCounts[0]
                ? `${platformCounts[0].count} item${platformCounts[0].count === 1 ? "" : "s"}`
                : "Create content to compare"}
            </div>
          </div>
        </div>
        <div className="cc-an-stat">
          <div className="cc-an-stat-icon" style={{ background: "#fdf3d5" }}>
            <TrendingUp size={18} color="#c8a000" />
          </div>
          <div>
            <div className="cc-an-stat-label">Publishing consistency</div>
            <div className="cc-an-stat-value">
              {published.length ? published.length : "—"}
            </div>
            <div className="cc-an-stat-sub">
              {published.length
                ? `${new Set(published.map((item) => item.date)).size} publishing day${new Set(published.map((item) => item.date)).size === 1 ? "" : "s"}`
                : "No published content"}
            </div>
          </div>
        </div>
      </div>
      <div className="cc-an-body">
        <div className="cc-an-main">
          <div className="cc-an-card">
            <div className="cc-an-card-hdr">
              <h3 className="cc-an-card-title">
                Posts by Type <Sparkles size={14} color="#e6ad3f" />
              </h3>
              <button
                className="cc-an-details-btn"
                onClick={() => setType("all")}
              >
                View details →
              </button>
            </div>
            <DonutChart values={typeCounts} />
          </div>
          <div className="cc-an-card">
            <div className="cc-an-card-hdr">
              <h3 className="cc-an-card-title">
                Publishing Consistency <Sparkles size={14} color="#e6ad3f" />
              </h3>
              <button
                className="cc-an-details-btn"
                onClick={() => setStatus("Published")}
              >
                Published only →
              </button>
            </div>
            <BarChart values={consistency} />
          </div>
          <div className="cc-an-card">
            <div className="cc-an-card-hdr">
              <h3 className="cc-an-card-title">
                Top-Performing Content <Sparkles size={14} color="#e6ad3f" />
              </h3>
              <button
                className="cc-an-details-btn"
                onClick={() => setDialog({ mode: "create" })}
              >
                Add performance →
              </button>
            </div>
            {top.length ? (
              <>
                <div className="cc-an-table-hdr">
                  <span>Post</span>
                  <span>Type</span>
                  <span style={{ textAlign: "right" }}>Engagement</span>
                </div>
                {top.map((entry) => {
                  const media = entry.item?.mediaIds
                    .map((id) => mediaItems.find((item) => item.id === id))
                    .find(Boolean)
                  const src = media ? mediaUrl(media, mediaUrls) : ""
                  return (
                    <div key={entry.record.id} className="cc-an-table-row">
                      <div className="cc-an-post-info">
                        {src ? (
                          <img
                            className="cc-an-post-thumb"
                            src={src}
                            alt={media?.filename || ""}
                          />
                        ) : (
                          <div className="cc-an-post-thumb" />
                        )}
                        <div style={{ minWidth: 0 }}>
                          <div className="cc-an-post-title">
                            {entry.item?.title}
                          </div>
                          <div className="cc-an-post-meta">
                            {entry.item?.date} ·{" "}
                            {entry.item?.campaignName || "No campaign"}
                          </div>
                        </div>
                      </div>
                      <span
                        className="cc-an-type-pill"
                        style={{ background: "#fce7dc", color: "#e06d45" }}
                      >
                        {entry.item?.type}
                      </span>
                      <div className="cc-an-rate-col">
                        <span className="cc-an-rate">
                          {entry.record.views
                            ? `${entry.rate.toFixed(1)}%`
                            : `${entry.interactions} interactions`}
                        </span>
                        <button
                          className="cc-an-details-btn"
                          onClick={() =>
                            setDialog({ mode: "view", id: entry.record.id })
                          }
                        >
                          View
                        </button>
                      </div>
                    </div>
                  )
                })}
              </>
            ) : (
              <div className="cc-an-chart-empty">
                No performance data recorded.
                <br />
                Planning metrics are still available.
              </div>
            )}
          </div>
          <div className="cc-an-card">
            <div className="cc-an-card-hdr">
              <h3 className="cc-an-card-title">
                Content by Platform <Sparkles size={14} color="#e6ad3f" />
              </h3>
              <button
                className="cc-an-details-btn"
                onClick={() => setPlatform("all")}
              >
                View details →
              </button>
            </div>
            {platformCounts.length ? (
              <div style={{ display: "grid", gap: 10 }}>
                {platformCounts.map((entry, index) => (
                  <div key={entry.label}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 10,
                        color: "var(--cc-text-2)",
                        marginBottom: 4,
                      }}
                    >
                      <span>{platformName(entry.label)}</span>
                      <b>{entry.count}</b>
                    </div>
                    <div
                      style={{
                        height: 10,
                        background: "#f0e8e0",
                        borderRadius: 99,
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${(entry.count / Math.max(platformCounts[0].count, 1)) * 100}%`,
                          background: COLORS[index % COLORS.length],
                          borderRadius: 99,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="cc-an-chart-empty">
                No platform data in this period.
              </div>
            )}
          </div>
        </div>
        <div className="cc-an-insights">
          <div className="cc-an-insights-hdr">
            <h3 className="cc-an-insights-title">
              Key Insights <Sparkles size={14} color="#e6ad3f" />
            </h3>
            <Lightbulb size={15} color="#d4a843" />
          </div>
          {insights.length ? (
            insights.map((insight) => (
              <div className="cc-an-insight-card" key={insight.title}>
                <div className="cc-an-insight-row">
                  <div
                    className="cc-an-insight-icon"
                    style={{
                      background: insight.bg,
                      color: insight.color,
                      fontSize: 14,
                      fontWeight: 700,
                    }}
                  >
                    {insight.symbol}
                  </div>
                  <div className="cc-an-insight-body">
                    <div className="cc-an-insight-title">{insight.title}</div>
                    <div className="cc-an-insight-text">{insight.text}</div>
                    <div className="cc-an-insight-line" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="cc-an-insight-text">
              Add or schedule content to generate insights from your current
              workspace.
            </div>
          )}
          <button
            className="cc-an-details-btn"
            onClick={() => setDialog({ mode: "create" })}
          >
            Add performance →
          </button>
        </div>
      </div>
      {dialog && (
        <PerformanceDialog
          key={`${dialog.mode}-${dialog.id ?? "new"}`}
          mode={dialog.mode}
          record={selectedRecord}
          items={allItems}
          onClose={() => setDialog(undefined)}
          onSave={savePerformance}
          onDelete={
            selectedRecord ? () => deleteRecord(selectedRecord) : undefined
          }
          onEdit={
            selectedRecord
              ? () => setDialog({ mode: "edit", id: selectedRecord.id })
              : undefined
          }
          onOpenPost={
            selectedItem
              ? () => {
                  openComposer({
                    pipelineId: selectedItem.pipelineId,
                    sourcePost:
                      selectedItem.source === "post"
                        ? posts.find((post) => post.id === selectedItem.id)
                        : undefined,
                    returnView: "analytics",
                  })
                  setDialog(undefined)
                }
              : undefined
          }
        />
      )}
    </div>
  )
}
