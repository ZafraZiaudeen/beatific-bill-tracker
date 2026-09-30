import { useEffect, useMemo, useRef, useState, type FormEvent } from "react"
import { Plus, Search, Sparkles, TrendingUp, X } from "lucide-react"
import { useContentCalendarStore } from "../store"
import type { AnalyticsPerformanceRecord, ContentPost, PipelineItem, Platform } from "../types"
import { getPlatformConfig } from "../platformConfig"
import { useMediaAssets } from "../components/useMediaAssets"
import { mediaUrl } from "../mediaStorage"

const CSS = `
.cc-perf-page{background:radial-gradient(circle at 75% 8%,rgba(255,255,255,.7),transparent 28%),var(--cc-bg);color:var(--cc-text);min-height:100%;padding-bottom:32px}
.cc-perf-header{display:flex;align-items:flex-start;justify-content:space-between;gap:24px;padding:16px 22px 14px;border-bottom:1px solid var(--cc-border)}
.cc-perf-heading{font-family:'DM Serif Display',Georgia,serif;font-weight:400;font-size:29px;line-height:1;letter-spacing:-.02em;margin:0;color:var(--cc-text)}
.cc-perf-swoop{display:block;width:130px;height:11px;margin-top:8px;border-top:3px solid var(--cc-accent);border-radius:50%;transform:rotate(-3deg)}
.cc-perf-toolbar{display:flex;align-items:center;gap:8px;padding:10px 22px 12px;border-bottom:1px solid var(--cc-border);flex-wrap:wrap}
.cc-perf-search{height:31px;min-width:220px;flex:1;display:flex;align-items:center;gap:8px;padding:0 11px;background:var(--cc-card);border:1px solid var(--cc-border);border-radius:11px;font-size:10.5px;color:var(--cc-text-3)}
.cc-perf-search input{border:0;outline:0;width:100%;background:transparent;font:inherit;color:var(--cc-text)}
.cc-perf-add-btn{height:32px;display:flex;align-items:center;gap:6px;padding:0 16px;border-radius:18px;background:linear-gradient(90deg,#d96d49,#dc815f);color:#fff;font-size:11px;font-weight:700;border:none;cursor:pointer;white-space:nowrap;flex-shrink:0}
.cc-perf-body{padding:16px 22px 0}
.cc-perf-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
.cc-perf-stat{background:rgba(255,255,255,.88);border:1px solid var(--cc-border);border-radius:11px;padding:14px 16px}
.cc-perf-stat-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--cc-text-3);margin-bottom:4px}
.cc-perf-stat-value{font-family:'DM Serif Display',Georgia,serif;font-size:28px;font-weight:400;color:var(--cc-text);line-height:1}
.cc-perf-stat-sub{font-size:10px;color:var(--cc-text-3);margin-top:3px}
.cc-perf-table-wrap{background:rgba(255,255,255,.88);border:1px solid var(--cc-border);border-radius:11px;overflow:hidden}
.cc-perf-table-title{display:flex;align-items:center;gap:8px;padding:14px 16px 12px;border-bottom:1px solid var(--cc-border);font-family:'DM Serif Display',Georgia,serif;font-size:17px;font-weight:400;color:var(--cc-text)}
.cc-perf-col-hdr{display:grid;grid-template-columns:1fr 70px 60px 60px 60px 60px 60px 90px 80px;gap:8px;padding:8px 16px;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--cc-text-3);border-bottom:1px solid var(--cc-border);background:rgba(0,0,0,.02)}
.cc-perf-row{display:grid;grid-template-columns:1fr 70px 60px 60px 60px 60px 60px 90px 80px;gap:8px;padding:10px 16px;align-items:center;border-bottom:1px solid #f5ede6;font-size:11px;color:var(--cc-text)}
.cc-perf-row:last-child{border-bottom:0}
.cc-perf-row:hover{background:rgba(0,0,0,.015)}
.cc-perf-post-info{display:flex;align-items:center;gap:9px;min-width:0}
.cc-perf-thumb{width:32px;height:32px;border-radius:6px;flex-shrink:0;object-fit:cover;background:#eee3d9}
.cc-perf-post-title{font-size:11px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--cc-text)}
.cc-perf-post-meta{font-size:9px;color:var(--cc-text-3)}
.cc-perf-metric{font-size:11px;font-weight:600;color:var(--cc-text);text-align:center}
.cc-perf-rate{font-size:11px;font-weight:700;color:#5a9a6e;text-align:center}
.cc-perf-row-actions{display:flex;gap:4px;justify-content:flex-end}
.cc-perf-pagination{display:flex;align-items:center;justify-content:center;gap:8px;padding:11px 16px;border-top:1px solid var(--cc-border);background:rgba(0,0,0,.015)}
.cc-perf-page-btn{min-width:28px;height:26px;padding:0 8px;border:1px solid var(--cc-border);border-radius:7px;background:var(--cc-card);color:var(--cc-text-2);font-size:10px;font-weight:700;cursor:pointer}
.cc-perf-page-btn:disabled{opacity:.45;cursor:default}
.cc-perf-page-label{font-size:10px;color:var(--cc-text-3);min-width:78px;text-align:center}
.cc-perf-btn{height:24px;padding:0 8px;border-radius:6px;font-size:9px;font-weight:700;cursor:pointer;border:1px solid var(--cc-border);background:var(--cc-card);color:var(--cc-text-2)}
.cc-perf-btn.edit{background:#fdf0e8;color:#b5612a;border-color:#f0d0b0}
.cc-perf-btn.del{background:#fde8e8;color:#b53535;border-color:#f0b0b0}
.cc-perf-empty{padding:60px 20px;text-align:center;color:var(--cc-text-3);font-size:12px}
.cc-perf-empty-icon{width:48px;height:48px;border-radius:50%;background:rgba(217,120,86,.1);display:flex;align-items:center;justify-content:center;margin:0 auto 12px}
.cc-perf-type-pill{display:inline-block;padding:2px 7px;border-radius:99px;font-size:9px;font-weight:800;background:#fce7dc;color:#e06d45;white-space:nowrap}
.cc-perf-overlay{position:fixed;inset:0;background:rgba(35,31,29,.28);z-index:1000;display:grid;place-items:center;padding:20px}
.cc-perf-dialog{width:min(560px,100%);max-height:92vh;overflow:auto;background:#fffaf6;border:1px solid #e9ddd3;border-radius:14px;padding:20px;box-shadow:0 18px 60px rgba(48,39,34,.2)}
.cc-perf-dialog-head{display:flex;justify-content:space-between;gap:12px;margin-bottom:14px}
.cc-perf-dialog-title{font:400 24px 'DM Serif Display',Georgia,serif;margin:0;color:var(--cc-text)}
.cc-perf-dialog-sub{font-size:10px;color:var(--cc-text-3);margin:6px 0 0}
.cc-perf-close{width:28px;height:28px;border:1px solid #e0d6ce;border-radius:8px;background:var(--cc-card);color:#806f66;display:grid;place-items:center;cursor:pointer}
.cc-perf-form{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.cc-perf-field{display:flex;flex-direction:column;gap:5px}
.cc-perf-field.full{grid-column:1/-1}
.cc-perf-field label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#806f66}
.cc-perf-field input,.cc-perf-field select,.cc-perf-field textarea{border:1px solid #e0d6ce;border-radius:8px;background:var(--cc-card);padding:9px;font-size:11px;outline:0;font-family:inherit;color:var(--cc-text)}
.cc-perf-field input:focus,.cc-perf-field select:focus,.cc-perf-field textarea:focus{border-color:var(--cc-accent)}
.cc-perf-field textarea{min-height:70px;resize:vertical}
.cc-perf-error{font-size:10px;color:#ad5144;grid-column:1/-1}
.cc-perf-dialog-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:16px;grid-column:1/-1}
.cc-perf-dialog-actions button{padding:8px 13px;border-radius:8px;border:1px solid #dfd5cd;background:var(--cc-card);color:#806f66;font-size:10px;cursor:pointer;font-family:inherit}
.cc-perf-dialog-actions .primary{background:var(--cc-accent);border-color:var(--cc-accent);color:#fff}
.cc-perf-dialog-actions .danger{background:#ffe4e4;border-color:#f5c5c5;color:#b53535}
.cc-perf-view-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;font-size:11px}
.cc-perf-view-grid p{margin:0;line-height:1.5}
.cc-perf-view-grid b{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--cc-text-3);display:block;margin-bottom:2px}
@media(max-width:900px){.cc-perf-stats{grid-template-columns:1fr 1fr}.cc-perf-col-hdr,.cc-perf-row{grid-template-columns:1fr 60px 60px 60px 80px}}
@media(max-width:600px){.cc-perf-stats{grid-template-columns:1fr}.cc-perf-col-hdr,.cc-perf-row{grid-template-columns:1fr 60px 80px}}
`

interface PostLike {
  id: string
  title: string
  type: string
  date: string
  platforms: Platform[]
  composerId?: string
  pipelineId?: string
}

function buildAllPosts(posts: ContentPost[], pipeline: PipelineItem[]): PostLike[] {
  const seen = new Set<string>()
  const items: PostLike[] = []
  posts.forEach((p) => {
    if (seen.has(p.id)) return
    seen.add(p.id)
    if (p.pipelineId) seen.add(`pl-${p.pipelineId}`)
    items.push({ id: p.id, title: p.title || "Untitled", type: p.type, date: p.date, platforms: p.platforms, composerId: p.composerId, pipelineId: p.pipelineId })
  })
  pipeline.forEach((p) => {
    const key = `pl-${p.id}`
    if (seen.has(key)) return
    seen.add(key)
    items.push({ id: p.id, title: p.title || "Untitled", type: p.contentType, date: p.scheduledDate ?? "", platforms: p.platforms ?? [], pipelineId: p.id })
  })
  return items.sort((a, b) => b.date.localeCompare(a.date))
}

type DialogMode = "create" | "edit" | "view"

function PerformanceFormDialog({
  mode,
  record,
  allPosts,
  onClose,
  onSave,
  onDelete,
  onEdit,
}: {
  mode: DialogMode
  record?: AnalyticsPerformanceRecord
  allPosts: PostLike[]
  onClose: () => void
  onSave: (value: Omit<AnalyticsPerformanceRecord, "id" | "createdAt" | "updatedAt" | "source">) => void
  onDelete?: () => void
  onEdit?: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [form, setForm] = useState({
    postId: record?.postId ?? allPosts[0]?.id ?? "",
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
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    ref.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey) }
  }, [onClose])

  function submit(e: FormEvent) {
    e.preventDefault()
    const keys = ["views", "likes", "comments", "saves", "shares", "clicks"] as const
    if (!form.postId) return setError("Choose a post.")
    if (keys.some((k) => !/^\d+$/.test(form[k])))
      return setError("All metrics must be nonnegative whole numbers.")
    onSave({
      postId: form.postId,
      views: Number(form.views), likes: Number(form.likes),
      comments: Number(form.comments), saves: Number(form.saves),
      shares: Number(form.shares), clicks: Number(form.clicks),
      note: form.note.trim(),
    })
  }

  const linked = allPosts.find((p) => p.id === record?.postId)
  const title = mode === "create" ? "Add performance record" : mode === "edit" ? "Edit performance record" : "Performance details"

  return (
    <div className="cc-perf-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="cc-perf-dialog" ref={ref} tabIndex={-1} role="dialog" aria-modal="true">
        <div className="cc-perf-dialog-head">
          <div>
            <h2 className="cc-perf-dialog-title">{title}</h2>
            <p className="cc-perf-dialog-sub">Record real engagement metrics without changing the content itself.</p>
          </div>
          <button className="cc-perf-close" onClick={onClose} aria-label="Close">
            <X size={14} />
          </button>
        </div>

        {mode === "view" && record ? (
          <div>
            <div className="cc-perf-view-grid">
              <p><b>Post</b>{linked?.title ?? record.postId}</p>
              <p><b>Date</b>{linked?.date ?? "—"}</p>
              <p><b>Views</b>{record.views.toLocaleString()}</p>
              <p><b>Likes</b>{record.likes.toLocaleString()}</p>
              <p><b>Comments</b>{record.comments.toLocaleString()}</p>
              <p><b>Saves</b>{record.saves.toLocaleString()}</p>
              <p><b>Shares</b>{record.shares.toLocaleString()}</p>
              <p><b>Clicks</b>{record.clicks.toLocaleString()}</p>
              {record.note && <p style={{ gridColumn: "1/-1" }}><b>Note</b>{record.note}</p>}
            </div>
            <div className="cc-perf-dialog-actions" style={{ gridColumn: "1/-1" }}>
              {onDelete && <button className="danger" onClick={onDelete}>Delete</button>}
              <button onClick={onClose}>Close</button>
              {onEdit && <button className="primary" onClick={onEdit}>Edit</button>}
            </div>
          </div>
        ) : (
          <form className="cc-perf-form" onSubmit={submit}>
            <div className="cc-perf-field full">
              <label>Post</label>
              <select value={form.postId} onChange={(e) => setForm((s) => ({ ...s, postId: e.target.value }))}>
                <option value="">Choose a post…</option>
                {allPosts.map((p) => (
                  <option key={p.id} value={p.id}>{p.title} · {p.date}</option>
                ))}
              </select>
            </div>
            {(["views", "likes", "comments", "saves", "shares", "clicks"] as const).map((key) => (
              <div className="cc-perf-field" key={key}>
                <label>{key[0].toUpperCase() + key.slice(1)}</label>
                <input inputMode="numeric" value={form[key]} onChange={(e) => setForm((s) => ({ ...s, [key]: e.target.value }))} />
              </div>
            ))}
            <div className="cc-perf-field full">
              <label>Note (optional)</label>
              <textarea value={form.note} onChange={(e) => setForm((s) => ({ ...s, note: e.target.value }))} />
            </div>
            {error && <div className="cc-perf-error" role="alert">{error}</div>}
            <div className="cc-perf-dialog-actions">
              <button type="button" onClick={onClose}>Cancel</button>
              <button className="primary">{mode === "edit" ? "Save changes" : "Save record"}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default function PerformancePage() {
  const {
    posts,
    pipelineItems,
    performanceRecords,
    addPerformanceRecord,
    updatePerformanceRecord,
    deletePerformanceRecord,
  } = useContentCalendarStore()
  const { items: mediaItems, urls: mediaUrls } = useMediaAssets()

  const [query, setQuery] = useState("")
  const [dialog, setDialog] = useState<{ mode: DialogMode; id?: string }>()
  const [page, setPage] = useState(1)

  const allPosts = useMemo(() => buildAllPosts(posts, pipelineItems), [posts, pipelineItems])

  const enriched = useMemo(() => {
    return performanceRecords
      .map((record) => {
        const post = allPosts.find((p) => p.id === record.postId || p.composerId === record.postId || p.pipelineId === record.postId)
        const interactions = record.likes + record.comments + record.saves + record.shares
        const rate = record.views ? (interactions / record.views) * 100 : 0
        return { record, post, interactions, rate }
      })
      .filter((e) => {
        if (!query.trim()) return true
        const q = query.toLowerCase()
        return (e.post?.title ?? "").toLowerCase().includes(q) || (e.record.note ?? "").toLowerCase().includes(q)
      })
      .sort((a, b) => b.rate - a.rate || b.interactions - a.interactions)
  }, [performanceRecords, allPosts, query])

  const pageSize = 10
  const totalPages = Math.max(1, Math.ceil(enriched.length / pageSize))
  const visibleRecords = enriched.slice((page - 1) * pageSize, page * pageSize)

  useEffect(() => {
    setPage(1)
  }, [query])

  useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, totalPages))
  }, [totalPages])

  const totalViews = performanceRecords.reduce((s, r) => s + r.views, 0)
  const totalEngagement = performanceRecords.reduce((s, r) => s + r.likes + r.comments + r.saves + r.shares, 0)
  const avgRate = performanceRecords.length
    ? performanceRecords.reduce((s, r) => {
        const inter = r.likes + r.comments + r.saves + r.shares
        return s + (r.views ? (inter / r.views) * 100 : 0)
      }, 0) / performanceRecords.length
    : 0

  const selectedRecord = dialog?.id ? performanceRecords.find((r) => r.id === dialog.id) : undefined

  function saveRecord(value: Omit<AnalyticsPerformanceRecord, "id" | "createdAt" | "updatedAt" | "source">) {
    if (dialog?.mode === "edit" && dialog.id) updatePerformanceRecord(dialog.id, value)
    else addPerformanceRecord(value)
    setDialog(undefined)
  }

  function confirmDelete(record: AnalyticsPerformanceRecord) {
    if (window.confirm("Delete this performance record? The content will remain unchanged.")) {
      deletePerformanceRecord(record.id)
      setDialog(undefined)
    }
  }

  return (
    <div className="cc-perf-page">
      <style>{CSS}</style>

      <div className="cc-perf-header">
        <div>
          <h1 className="cc-perf-heading">Performance <TrendingUp size={22} style={{ verticalAlign: "middle", color: "var(--cc-accent)", marginBottom: 4 }} /></h1>
          <span className="cc-perf-swoop" />
        </div>
      </div>

      <div className="cc-perf-toolbar">
        <label className="cc-perf-search">
          <Search size={13} />
          <input
            placeholder="Search by post title or note…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <button className="cc-perf-add-btn" onClick={() => setDialog({ mode: "create" })}>
          <Plus size={13} /> Add record
        </button>
      </div>

      <div className="cc-perf-body">
        <div className="cc-perf-stats">
          <div className="cc-perf-stat">
            <div className="cc-perf-stat-label">Total records</div>
            <div className="cc-perf-stat-value">{performanceRecords.length}</div>
            <div className="cc-perf-stat-sub">across all content</div>
          </div>
          <div className="cc-perf-stat">
            <div className="cc-perf-stat-label">Total views</div>
            <div className="cc-perf-stat-value">{totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}k` : totalViews}</div>
            <div className="cc-perf-stat-sub">combined impressions</div>
          </div>
          <div className="cc-perf-stat">
            <div className="cc-perf-stat-label">Total engagement</div>
            <div className="cc-perf-stat-value">{totalEngagement >= 1000 ? `${(totalEngagement / 1000).toFixed(1)}k` : totalEngagement}</div>
            <div className="cc-perf-stat-sub">likes · comments · saves · shares</div>
          </div>
          <div className="cc-perf-stat">
            <div className="cc-perf-stat-label">Avg. eng. rate</div>
            <div className="cc-perf-stat-value">{avgRate.toFixed(1)}%</div>
            <div className="cc-perf-stat-sub">across tracked posts</div>
          </div>
        </div>

        <div className="cc-perf-table-wrap">
          <div className="cc-perf-table-title">
            All Records <Sparkles size={14} color="#e6ad3f" style={{ marginLeft: 4 }} />
            {enriched.length > 0 && (
              <span style={{ marginLeft: "auto", fontSize: 10, fontFamily: "Nunito, sans-serif", color: "var(--cc-text-3)", fontWeight: 600 }}>
                {enriched.length} record{enriched.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {enriched.length > 0 ? (
            <>
              <div className="cc-perf-col-hdr">
                <span>Post</span>
                <span style={{ textAlign: "center" }}>Type</span>
                <span style={{ textAlign: "center" }}>Views</span>
                <span style={{ textAlign: "center" }}>Likes</span>
                <span style={{ textAlign: "center" }}>Comments</span>
                <span style={{ textAlign: "center" }}>Saves</span>
                <span style={{ textAlign: "center" }}>Shares</span>
                <span style={{ textAlign: "center" }}>Eng. Rate</span>
                <span style={{ textAlign: "right" }}>Actions</span>
              </div>
              {visibleRecords.map(({ record, post, rate }) => {
                const media = post?.platforms
                  ? mediaItems.find((m) => posts.find((p) => p.id === post.id)?.mediaIds?.includes(m.id))
                  : undefined
                const src = media ? mediaUrl(media, mediaUrls) : ""
                const platformLabel = post?.platforms?.[0] ? getPlatformConfig(post.platforms[0]).label : ""
                return (
                  <div className="cc-perf-row" key={record.id}>
                    <div className="cc-perf-post-info">
                      {src ? (
                        <img className="cc-perf-thumb" src={src} alt="" />
                      ) : (
                        <div className="cc-perf-thumb" />
                      )}
                      <div style={{ minWidth: 0 }}>
                        <div className="cc-perf-post-title">{post?.title ?? record.postId}</div>
                        <div className="cc-perf-post-meta">{post?.date ?? "—"}{platformLabel ? ` · ${platformLabel}` : ""}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <span className="cc-perf-type-pill">{post?.type ?? "—"}</span>
                    </div>
                    <div className="cc-perf-metric">{record.views.toLocaleString()}</div>
                    <div className="cc-perf-metric">{record.likes.toLocaleString()}</div>
                    <div className="cc-perf-metric">{record.comments.toLocaleString()}</div>
                    <div className="cc-perf-metric">{record.saves.toLocaleString()}</div>
                    <div className="cc-perf-metric">{record.shares.toLocaleString()}</div>
                    <div className="cc-perf-rate">
                      {record.views ? `${rate.toFixed(1)}%` : `${(record.likes + record.comments + record.saves + record.shares).toLocaleString()} interactions`}
                    </div>
                    <div className="cc-perf-row-actions">
                      <button className="cc-perf-btn" onClick={() => setDialog({ mode: "view", id: record.id })}>View</button>
                      <button className="cc-perf-btn edit" onClick={() => setDialog({ mode: "edit", id: record.id })}>Edit</button>
                      <button className="cc-perf-btn del" onClick={() => confirmDelete(record)}>Del</button>
                    </div>
                  </div>
                )
              })}
              {totalPages > 1 && (
                <div className="cc-perf-pagination" aria-label="Performance records pagination">
                  <button className="cc-perf-page-btn" onClick={() => setPage((currentPage) => currentPage - 1)} disabled={page === 1}>
                    Previous
                  </button>
                  <span className="cc-perf-page-label">Page {page} of {totalPages}</span>
                  <button className="cc-perf-page-btn" onClick={() => setPage((currentPage) => currentPage + 1)} disabled={page === totalPages}>
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="cc-perf-empty">
              <div className="cc-perf-empty-icon">
                <TrendingUp size={22} color="var(--cc-accent)" />
              </div>
              <div style={{ fontWeight: 700, marginBottom: 6, color: "var(--cc-text)" }}>
                {query ? "No records match your search." : "No performance records yet."}
              </div>
              <div>
                {query
                  ? "Try a different search term."
                  : "Add your first record to start tracking engagement across your content."}
              </div>
              {!query && (
                <button
                  onClick={() => setDialog({ mode: "create" })}
                  style={{ marginTop: 14, padding: "8px 16px", borderRadius: 8, background: "var(--cc-accent)", color: "#fff", border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                >
                  Add first record
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {dialog && (
        <PerformanceFormDialog
          key={`${dialog.mode}-${dialog.id ?? "new"}`}
          mode={dialog.mode}
          record={selectedRecord}
          allPosts={allPosts}
          onClose={() => setDialog(undefined)}
          onSave={saveRecord}
          onDelete={selectedRecord ? () => confirmDelete(selectedRecord) : undefined}
          onEdit={selectedRecord ? () => setDialog({ mode: "edit", id: selectedRecord.id }) : undefined}
        />
      )}
    </div>
  )
}
