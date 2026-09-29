import { useState } from "react"
import { CalendarDays, Pencil, Plus, Sparkles } from "lucide-react"
import { useContentCalendarStore } from "../store"
import type { Campaign } from "../types"
import { getActivePlatformOptions, getPlatformConfig } from "../platformConfig"
import { mediaUrl } from "../mediaStorage"
import { useMediaAssets } from "../components/useMediaAssets"
import { formatContentDate } from "../settings"
import {
  CampaignDetail,
  CampaignForm,
  PAGE_CSS,
  CAMPAIGN_STATUSES,
  todayKey,
} from "./Campaigns"

const MODAL_CSS = `.cc-camp-cover-picker{display:grid;gap:8px}.cc-camp-clear-cover{border:0;background:transparent;color:#ae4c3f;font-size:10px;text-align:left;cursor:pointer}.cc-camp-card-actions{display:flex;align-items:center;gap:6px}.cc-camp-img{position:relative;overflow:hidden}.cc-camp-img img{width:100%;height:100%;display:block;object-fit:cover}.cc-camp-img-placeholder{width:100%;height:100%;background:linear-gradient(155deg,#f2e8da,#e4d0b8)}.cc-camp-detail-cover{width:100%;height:150px;object-fit:cover;border-radius:9px;margin:4px 0 12px}.cc-camp-modal-overlay{position:fixed;inset:0;background:rgba(29,34,35,.32);z-index:1000;display:grid;place-items:center;padding:20px}.cc-camp-modal,.cc-camp-detail-modal{width:min(620px,100%);max-height:90vh;overflow:auto;background:#fffaf6;border:1px solid #e6dbd2;border-radius:14px;padding:22px;box-shadow:0 18px 60px rgba(48,39,34,.2)}.cc-camp-modal-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}.cc-camp-modal-head h2{font:400 24px 'DM Serif Display',Georgia,serif;margin:6px 0 15px}.cc-camp-modal-head button{border:0;background:transparent;cursor:pointer}.cc-camp-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.cc-camp-form-grid label{display:flex;flex-direction:column;gap:5px;font-size:10px;font-weight:700;color:#806f66}.cc-camp-form-grid .full{grid-column:1/-1}.cc-camp-form-grid input,.cc-camp-form-grid select,.cc-camp-form-grid textarea{border:1px solid #e0d6ce;border-radius:8px;padding:9px;font:inherit;font-weight:400;background:#fff}.cc-camp-form-grid textarea{min-height:58px;resize:vertical}.cc-camp-platform-checks{display:flex;gap:7px;flex-wrap:wrap}.cc-camp-platform-checks button{padding:7px 11px;border:1px solid #dfd5cd;border-radius:99px;background:white;cursor:pointer}.cc-camp-platform-checks button.selected{background:#ffe4d2;border-color:#d97856;color:#9e4f38}.cc-camp-timeline-inputs{display:flex;flex-direction:column;gap:6px}.cc-camp-timeline-inputs div{display:flex;gap:6px}.cc-camp-timeline-inputs input{flex:1}.cc-camp-timeline-inputs button{border:0;background:transparent;color:#b34e44;cursor:pointer}.cc-camp-form-error{color:#b34e44;font-size:11px}.cc-camp-modal-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:18px}.cc-camp-modal-actions button{display:flex;align-items:center;gap:6px;padding:9px 13px;border-radius:8px;border:1px solid #ddd3cb;cursor:pointer}.cc-camp-primary{background:#d97856;color:white;border-color:#d97856!important}.cc-camp-secondary{background:white}.cc-camp-danger{background:#fff0ed;color:#ae4c3f}.cc-camp-detail-meta{font-size:11px;color:#7a6a62}.cc-camp-detail-stats{display:flex;align-items:baseline;gap:8px;padding:12px;background:#f5ede5;border-radius:9px}.cc-camp-detail-stats strong{font:400 28px 'DM Serif Display',Georgia,serif}.cc-camp-detail-stats span{font-size:11px;color:#7a6a62}.cc-camp-detail-platforms{display:flex;gap:7px;flex-wrap:wrap;margin:12px 0}.cc-camp-detail-platforms span{padding:5px 9px;border-radius:99px;background:#e7f0f4;font-size:10px}.cc-camp-detail-modal h3{font-size:12px;margin:16px 0 7px}.cc-camp-detail-modal ul{margin:0;padding-left:18px;font-size:11px;color:#6b5a52}.cc-camp-linked-list{display:flex;flex-direction:column;gap:5px;font-size:11px;color:#6b5a52}.cc-camp-linked-list div{padding:7px 9px;background:#f8f3ee;border-radius:6px}`

export default function CampaignsLive() {
  const { campaigns, pipelineItems, posts, settings } = useContentCalendarStore()
  const { items, urls } = useMediaAssets()
  const [status, setStatus] = useState("all")
  const [platform, setPlatform] = useState("all")
  const [period, setPeriod] = useState("all")
  const [search, setSearch] = useState("")
  const [editing, setEditing] = useState<Campaign | undefined>()
  const [showForm, setShowForm] = useState(false)
  const [viewing, setViewing] = useState<Campaign | undefined>()
  const [today] = useState(() => new Date())
  const options = getActivePlatformOptions()
  const filtered = campaigns.filter((campaign) => {
    const linkedText = [
      ...pipelineItems
        .filter((item) => item.campaignId === campaign.id)
        .map((item) => item.title),
      ...posts
        .filter((post) => post.campaignId === campaign.id)
        .map((post) => post.title),
    ].join(" ")
    if (
      search &&
      !`${campaign.name} ${campaign.goal} ${campaign.badge} ${campaign.platforms.join(" ")} ${linkedText}`
        .toLowerCase()
        .includes(search.toLowerCase())
    )
      return false
    if (status !== "all" && campaign.status !== status) return false
    if (platform !== "all" && !campaign.platforms.includes(platform))
      return false
    if (period !== "all") {
      const now = new Date()
      const start = new Date(now)
      const end = new Date(now)
      if (period === "month") {
        start.setDate(1)
        end.setMonth(end.getMonth() + 1, 0)
      }
      if (period === "30") start.setDate(start.getDate() - 30)
      if (!(
        campaign.endDate >= todayKey(start) &&
        campaign.startDate <= todayKey(end)
      ))
        return false
    }
    return true
  })
  return (
    <>
      <style>{PAGE_CSS}</style>
      <style>{MODAL_CSS}</style>
      <div className="cc-camp-page">
        <div className="cc-camp-header">
          <div>
            <div className="cc-camp-heading-row">
              <h1 className="cc-camp-heading">
                Give every post a reason to belong.
              </h1>
              <Sparkles size={22} className="cc-camp-star" />
            </div>
            <span className="cc-camp-swoop" />
          </div>
          <div className="cc-camp-header-right">
            <div className="cc-camp-meta">
              <div className="cc-date-range">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                {formatContentDate(today, settings.dateFormat)}
              </div>
              <span className="cc-local-badge">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                Local only
              </span>
            </div>
            <div className="cc-camp-toolbar">
              <input
                className="cc-camp-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search campaigns..."
              />
              <select
                className="cc-camp-select"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="all">All statuses</option>
                {CAMPAIGN_STATUSES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <select
                className="cc-camp-select"
                value={platform}
                onChange={(event) => setPlatform(event.target.value)}
              >
                <option value="all">All platforms</option>
                {options.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
              <select
                className="cc-camp-select"
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
              >
                <option value="all">All time</option>
                <option value="month">This month</option>
                <option value="30">Last 30 days</option>
              </select>
              <button
                className="cc-camp-add-btn"
                onClick={() => {
                  setEditing(undefined)
                  setShowForm(true)
                }}
              >
                <Plus size={13} />
                Add campaign
              </button>
            </div>
          </div>
        </div>
        <div className="cc-camp-body">
          <div>
            <h2 className="cc-camp-section-title">
              Campaigns <Sparkles size={16} color="#e6ad3f" />
            </h2>
            {filtered.length ? (
              filtered.map((campaign) => {
                const linked = pipelineItems.filter(
                  (item) => item.campaignId === campaign.id
                )
                const complete = linked.filter(
                  (item) => item.stage === "published"
                ).length
                const pct = linked.length
                  ? Math.round((complete / linked.length) * 100)
                  : 0
                const cover = campaign.coverMediaId
                  ? items.find((item) => item.id === campaign.coverMediaId)
                  : undefined
                return (
                  <div className="cc-camp-card" key={campaign.id}>
                    <div className="cc-camp-img-wrap">
                      <div className="cc-camp-img">
                        {cover ? (
                          <img
                            src={mediaUrl(cover, urls)}
                            alt={cover.description || `${campaign.name} cover`}
                          />
                        ) : (
                          <div
                            className="cc-camp-img-placeholder"
                            aria-hidden="true"
                          />
                        )}
                        <span className="cc-camp-badge launch">
                          {campaign.badge}
                        </span>
                      </div>
                    </div>
                    <div className="cc-camp-content">
                      <div className="cc-camp-top-row">
                        <span
                          className={`cc-camp-badge ${campaign.status === "active" ? "launch" : campaign.status === "completed" ? "growth" : "brand"}`}
                        >
                          {campaign.status}
                        </span>
                        <div className="cc-camp-card-actions">
                          <button
                            className="cc-camp-view-btn"
                            onClick={() => setViewing(campaign)}
                          >
                            View campaign
                          </button>
                          <button
                            className="cc-camp-view-btn"
                            onClick={() => {
                              setEditing(campaign)
                              setShowForm(true)
                            }}
                            aria-label={`Edit ${campaign.name}`}
                          >
                            <Pencil size={12} />
                          </button>
                        </div>
                      </div>
                      <div className="cc-camp-cols">
                        <div className="cc-camp-col-info">
                          <h3 className="cc-camp-name">{campaign.name}</h3>
                          <div className="cc-camp-date-row">
                            <CalendarDays size={12} color="#c27b6a" />
                            {formatContentDate(campaign.startDate, settings.dateFormat)} - {formatContentDate(campaign.endDate, settings.dateFormat)}
                          </div>
                          <div className="cc-camp-goal-text">
                            {campaign.goal || "No goal added yet."}
                          </div>
                        </div>
                        <div className="cc-camp-col-platforms">
                          <div className="cc-camp-col-label">Platforms</div>
                          {campaign.platforms.map((item) => (
                            <div className="cc-camp-platform-row" key={item}>
                              {getPlatformConfig(item).label}
                            </div>
                          ))}
                        </div>
                        <div className="cc-camp-col-posts">
                          <div className="cc-camp-col-label">Published</div>
                          <div className="cc-camp-posts-count">
                            {complete}
                            <span className="cc-camp-posts-total">
                              / {linked.length}
                            </span>
                          </div>
                          <div className="cc-camp-progress-wrap">
                            <div
                              className="cc-camp-progress-bar"
                              style={{
                                width: `${pct}%`,
                                background: "#d97856",
                              }}
                            />
                          </div>
                          <div className="cc-camp-pct">{pct}%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="cc-camp-empty">
                No campaigns yet. Add your first campaign to organize content.
              </div>
            )}
          </div>
          <div>
            <div className="cc-camp-timeline-card">
              <h2 className="cc-camp-tl-title">
                Campaign Timeline <Sparkles size={15} color="#e6ad3f" />
              </h2>
              {filtered.map((campaign) => (
                <div className="cc-camp-tl-item" key={campaign.id}>
                  <div
                    className="cc-camp-tl-dot"
                    style={{ background: "#d97856" }}
                  />
                  <div className="cc-camp-tl-body">
                    <div className="cc-camp-tl-top">
                      <span className="cc-camp-tl-name">{campaign.name}</span>
                      <span className="cc-camp-tl-count">
                        {campaign.timelineItems.length} milestones
                      </span>
                    </div>
                    <div className="cc-camp-tl-date">
                      {formatContentDate(campaign.startDate, settings.dateFormat)} - {formatContentDate(campaign.endDate, settings.dateFormat)}
                    </div>
                    <ul className="cc-camp-tl-items">
                      {campaign.timelineItems.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
              {!filtered.length && (
                <div className="cc-camp-empty">
                  Your timeline will appear here.
                </div>
              )}
            </div>
          </div>
        </div>
        {showForm && (
          <CampaignForm initial={editing} onClose={() => setShowForm(false)} />
        )}
        {viewing && (
          <CampaignDetail
            campaign={
              campaigns.find((item) => item.id === viewing.id) ?? viewing
            }
            onClose={() => setViewing(undefined)}
            onEdit={() => {
              setEditing(viewing)
              setViewing(undefined)
              setShowForm(true)
            }}
          />
        )}
      </div>
    </>
  )
}
