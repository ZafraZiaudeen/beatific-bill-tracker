import { useMemo, useState } from "react"
import type { FormEvent } from "react"
import {
  CalendarDays,
  ChevronDown,
  Grid2X2,
  List,
  MapPin,
  NotebookPen,
  Plus,
  Search,
  Sparkles,
} from "lucide-react"
import { useContentCalendarStore } from "../store"
import type { IdeaItem, IdeaStatus, Platform, PostType } from "../types"
import placeholderMedia from "../../../assets/content-calendar/placeholder-media.svg"

const IDEA_CSS = `
.cc-ideas{min-width:1030px;background:#faf7f2;color:#243136;min-height:100%;padding-bottom:20px}.cc-ideas-head{display:flex;justify-content:space-between;align-items:flex-start;padding:18px 22px 3px}.cc-ideas-title{font:400 31px/1 'DM Serif Display',Georgia,serif;margin:0}.cc-ideas-title-row{display:flex;gap:10px;align-items:center}.cc-ideas-star{color:#e8af45;transform:rotate(-8deg)}.cc-ideas-line{width:150px;border-top:3px solid #d87956;border-radius:50%;margin-top:10px;transform:rotate(-2deg)}.cc-ideas-meta{display:flex;align-items:center;gap:20px;font-size:12px;font-weight:650}.cc-ideas-local{display:flex;align-items:center;gap:7px;padding:6px 14px;background:#fae7c5;border-radius:99px;font-size:11px}
.cc-ideas-layout{display:flex;gap:14px;padding:0 18px 0 18px;align-items:stretch}.cc-ideas-main{flex:1;min-width:0}.cc-ideas-toolbar{display:grid;grid-template-columns:minmax(270px,1fr) repeat(4,auto);gap:8px;margin:0 0 12px}.cc-ideas-search{height:31px;display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.8);border:1px solid #ece5de;border-radius:10px;padding:0 10px}.cc-ideas-search input{width:100%;border:0;outline:0;background:transparent;font-size:10.5px}.cc-ideas-select-wrap{position:relative}.cc-ideas-select{height:31px;appearance:none;padding:0 28px 0 12px;border:1px solid #ece5de;border-radius:10px;background:rgba(255,255,255,.8);font-size:10.5px;color:#263238}.cc-ideas-select-wrap svg{position:absolute;right:9px;top:10px;pointer-events:none}.cc-ideas-switch{display:flex;align-items:center;margin-bottom:14px}.cc-ideas-switch button{height:28px;padding:0 15px;display:flex;align-items:center;gap:7px;border-radius:15px;font-size:10px}.cc-ideas-switch button.active{background:#fbdcc9;color:#9e4f38}
.cc-ideas-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.cc-idea-card{min-height:286px;background:rgba(255,255,255,.76);border:1px solid #ece4dc;border-radius:8px;overflow:hidden;display:flex;flex-direction:column}.cc-idea-image{height:96px;background-repeat:no-repeat;position:relative}.cc-theme-pill{position:absolute;right:5px;top:5px;padding:3px 14px;border-radius:99px;font-size:9px}.cc-theme-Brand,.cc-theme-Community,.cc-theme-Personal{background:#f1dfe4;color:#9b4e6d}.cc-theme-Lifestyle,.cc-theme-Visual{background:#dfedf3;color:#3d738d}.cc-idea-content{display:flex;flex-direction:column;flex:1;padding:9px 11px 9px}.cc-idea-name{font:400 16px/1.15 'DM Serif Display',Georgia,serif;margin-bottom:8px}.cc-idea-badges{display:flex;align-items:center;gap:7px;margin-bottom:8px}.cc-idea-badge{display:flex;align-items:center;gap:4px;padding:2px 8px;border-radius:99px;font-size:8px}.cc-badge-type{background:#edf2f4;color:#4f7d92}.cc-badge-platform{background:#faeef0;color:#995067}.cc-badge-status{background:#f1f0ed;color:#777}.cc-badge-status.Draft{background:#fff0d5;color:#8f6d27}.cc-badge-status.Planned{background:#e8f0f4;color:#52758a}.cc-idea-desc{font-size:9.5px;line-height:1.4;color:#667074;min-height:42px}.cc-idea-foot{margin-top:auto;display:flex;gap:6px;color:#8b9293;font-size:7.8px;line-height:1.35}.cc-idea-foot span{flex:1}.cc-convert{align-self:flex-end;margin-top:7px;padding:5px 10px;border-radius:99px;background:#ffe4cd;color:#b55335;font-size:7.8px}.cc-convert:disabled{background:#e7efeb;color:#5a8171}.cc-idea-list{display:flex;flex-direction:column;gap:7px}.cc-idea-list .cc-idea-card{min-height:110px;display:grid;grid-template-columns:180px 1fr}.cc-idea-list .cc-idea-image{height:100%}.cc-idea-list .cc-idea-content{padding:10px 13px}.cc-idea-list .cc-idea-desc{min-height:0}.cc-idea-list .cc-convert{position:absolute;right:12px;bottom:10px}.cc-idea-list .cc-idea-content{position:relative}
.cc-prompts{width:250px;flex:0 0 250px;background:rgba(255,255,255,.72);border:1px solid #eee6df;border-radius:8px;padding:14px;display:flex;flex-direction:column}.cc-prompts h2{font:400 19px/1 'DM Serif Display',Georgia,serif;margin:0;display:flex;align-items:center;gap:8px}.cc-prompts-sub{font-size:9.5px;color:#697579;margin:9px 0 14px}.cc-prompt{min-height:70px;border-radius:7px;margin-bottom:10px;padding:11px 10px;display:grid;grid-template-columns:31px 1fr 14px;gap:8px;align-items:center;text-align:left}.cc-prompt:nth-of-type(1){background:#fbe6de}.cc-prompt:nth-of-type(2){background:#e7f0f4}.cc-prompt:nth-of-type(3){background:#f3e6ea}.cc-prompt:nth-of-type(4){background:#fff0d7}.cc-prompt:nth-of-type(5){background:#e6eff3}.cc-prompt:nth-of-type(6){background:#f2e5e9}.cc-prompt-icon{font-size:23px;color:#c96746}.cc-prompt strong{display:block;font-size:10.5px;margin-bottom:4px}.cc-prompt small{font-size:8.5px;color:#798184;line-height:1.35}.cc-add-idea{margin-top:auto;height:33px;border-radius:7px;background:linear-gradient(90deg,#d76c48,#d77957);color:white;font-size:11px;display:flex;align-items:center;justify-content:center;gap:8px}
.cc-idea-overlay{position:fixed;inset:0;background:rgba(30,35,35,.28);z-index:1000;display:grid;place-items:center;padding:20px}.cc-idea-modal{width:min(500px,100%);max-height:90vh;overflow:auto;background:#fffaf6;border:1px solid #e9ddd3;border-radius:14px;padding:22px;box-shadow:0 18px 60px rgba(48,39,34,.2)}.cc-idea-modal h2{font:400 24px 'DM Serif Display',Georgia,serif;margin:0 0 15px}.cc-idea-form{display:grid;grid-template-columns:1fr 1fr;gap:11px}.cc-idea-field{display:flex;flex-direction:column;gap:5px}.cc-idea-field.full{grid-column:1/-1}.cc-idea-field label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#806f66}.cc-idea-field input,.cc-idea-field select,.cc-idea-field textarea{border:1px solid #e0d6ce;border-radius:8px;background:white;padding:9px;font-size:11px;outline:0}.cc-idea-field textarea{min-height:65px;resize:vertical}.cc-idea-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:16px}.cc-idea-actions button{padding:8px 14px;border-radius:8px;font-size:10px}.cc-idea-cancel{border:1px solid #dfd5cd;background:white}.cc-idea-save{background:#d97856;color:white}
@media(max-width:1120px){.cc-ideas{min-width:1020px}.cc-ideas-grid{gap:8px}.cc-prompts{width:225px;flex-basis:225px}}
`

const PROMPTS = [
  {
    title: "Spring refresh",
    description: "New season, new routines, new inspiration.",
    icon: "❀",
    theme: "Lifestyle",
  },
  {
    title: "Summer essentials",
    description: "What you can’t live without this season.",
    icon: "☼",
    theme: "Lifestyle",
  },
  {
    title: "Back to basics",
    description: "Simplicity, slow living, less but better.",
    icon: "◉",
    theme: "Brand",
  },
  {
    title: "Client love",
    description: "Share a testimonial, result or kind message.",
    icon: "♡",
    theme: "Community",
  },
  {
    title: "Winter cozy",
    description: "Warm spaces, comfort, and little luxuries.",
    icon: "❄",
    theme: "Lifestyle",
  },
  {
    title: "Year ahead",
    description: "Goals, plans and what’s next.",
    icon: "☆",
    theme: "Personal",
  },
]

const PLATFORMS: { id: Platform; label: string }[] = [
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
  { id: "youtube", label: "YouTube" },
  { id: "pinterest", label: "Pinterest" },
]
const TYPES: PostType[] = ["Reel", "Carousel", "Story", "Static"]
const STATUSES: IdeaStatus[] = ["Idea", "Draft", "Planned"]

function IdeaImage({ idea }: { idea: IdeaItem }) {
  const cropWidth = 250
  const cropHeight = 96
  const x = (idea.thumbnail.x / (1280 - cropWidth)) * 100
  const y = (idea.thumbnail.y / (720 - cropHeight)) * 100
  const isReferenceCard = /^idea-[1-6]$/.test(idea.id)
  return (
    <div
      className="cc-idea-image"
      style={{
        backgroundImage: `url(${placeholderMedia})`,
        backgroundSize: `${(1280 / cropWidth) * 100}% ${(720 / cropHeight) * 100}%`,
        backgroundPosition: `${x}% ${y}%`,
      }}
    >
      {!isReferenceCard && (
        <span className={`cc-theme-pill cc-theme-${idea.theme}`}>
          {idea.theme}
        </span>
      )}
    </div>
  )
}

function PlatformMark({ platform }: { platform: Platform }) {
  if (platform === "instagram")
    return (
      <svg
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#e04f44"
        strokeWidth="2.2"
      >
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="#e04f44" stroke="none" />
      </svg>
    )
  if (platform === "tiktok")
    return <span style={{ fontWeight: 900, color: "#17272d" }}>♪</span>
  if (platform === "youtube") return <span style={{ color: "#cf3732" }}>▶</span>
  return (
    <span style={{ color: "#c33c43", fontFamily: "Georgia", fontWeight: 700 }}>
      P
    </span>
  )
}

function SelectBox({
  label,
  value,
  onChange,
  children,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  children: React.ReactNode
}) {
  return (
    <div className="cc-ideas-select-wrap">
      <select
        className="cc-ideas-select"
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </select>
      <ChevronDown size={11} />
    </div>
  )
}

function IdeaCard({ idea, convert }: { idea: IdeaItem; convert: () => void }) {
  const platformName = PLATFORMS.find(
    (item) => item.id === idea.platform
  )?.label
  return (
    <article className="cc-idea-card">
      <IdeaImage idea={idea} />
      <div className="cc-idea-content">
        <h3 className="cc-idea-name">{idea.title}</h3>
        <div className="cc-idea-badges">
          <span className="cc-idea-badge cc-badge-type">✧ {idea.type}</span>
          <span className="cc-idea-badge cc-badge-platform">
            <PlatformMark platform={idea.platform} />
            {platformName}
          </span>
          <span className={`cc-idea-badge cc-badge-status ${idea.status}`}>
            ● {idea.status}
          </span>
        </div>
        <p className="cc-idea-desc">{idea.description}</p>
        <div className="cc-idea-foot">
          <NotebookPen size={11} />
          <span>
            <b>Notes</b> &nbsp; {idea.notes}
          </span>
        </div>
        <button
          className="cc-convert"
          disabled={Boolean(idea.linkedPipelineId)}
          onClick={convert}
        >
          <Sparkles size={9} />{" "}
          {idea.linkedPipelineId ? "Added to pipeline" : "Convert to post →"}
        </button>
      </div>
    </article>
  )
}

function AddIdeaModal({
  initialTitle = "",
  initialTheme = "Lifestyle",
  onClose,
}: {
  initialTitle?: string
  initialTheme?: string
  onClose: () => void
}) {
  const addIdea = useContentCalendarStore((state) => state.addIdea)
  const [title, setTitle] = useState(initialTitle)
  const [theme, setTheme] = useState(initialTheme)
  const [platform, setPlatform] = useState<Platform>("instagram")
  const [type, setType] = useState<PostType>("Reel")
  const [status, setStatus] = useState<IdeaStatus>("Idea")
  const [description, setDescription] = useState("")
  const [notes, setNotes] = useState("")
  function submit(event: FormEvent) {
    event.preventDefault()
    addIdea({
      title: title.trim(),
      theme,
      category: theme,
      platform,
      type,
      status,
      description: description.trim(),
      notes: notes.trim(),
      thumbnail: { x: 476, y: 159, source: "ideas" },
    })
    onClose()
  }
  return (
    <div
      className="cc-idea-overlay"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <form
        className="cc-idea-modal"
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
      >
        <h2>Add an idea</h2>
        <div className="cc-idea-form">
          <div className="cc-idea-field full">
            <label>Title</label>
            <input
              autoFocus
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <div className="cc-idea-field">
            <label>Theme</label>
            <select
              value={theme}
              onChange={(event) => setTheme(event.target.value)}
            >
              {["Brand", "Lifestyle", "Community", "Visual", "Personal"].map(
                (item) => (
                  <option key={item}>{item}</option>
                )
              )}
            </select>
          </div>
          <div className="cc-idea-field">
            <label>Platform</label>
            <select
              value={platform}
              onChange={(event) => setPlatform(event.target.value as Platform)}
            >
              {PLATFORMS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="cc-idea-field">
            <label>Post type</label>
            <select
              value={type}
              onChange={(event) => setType(event.target.value as PostType)}
            >
              {TYPES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
          <div className="cc-idea-field">
            <label>Status</label>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as IdeaStatus)}
            >
              {STATUSES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
          <div className="cc-idea-field full">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
          <div className="cc-idea-field full">
            <label>Notes</label>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>
        </div>
        <div className="cc-idea-actions">
          <button type="button" className="cc-idea-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="cc-idea-save">Add idea</button>
        </div>
      </form>
    </div>
  )
}

export default function Ideas() {
  const { ideas, convertIdeaToPipeline } = useContentCalendarStore()
  const [view, setView] = useState<"card" | "list">(() =>
    window.localStorage.getItem("content-edit.ideas-view") === "list"
      ? "list"
      : "card"
  )
  const [search, setSearch] = useState("")
  const [theme, setTheme] = useState("all")
  const [platform, setPlatform] = useState("all")
  const [type, setType] = useState("all")
  const [status, setStatus] = useState("all")
  const [modal, setModal] = useState<{ title?: string; theme?: string } | null>(
    null
  )
  const themes = useMemo(
    () => Array.from(new Set(ideas.map((idea) => idea.theme))),
    [ideas]
  )
  const shown = useMemo(
    () =>
      ideas.filter((idea) => {
        const haystack =
          `${idea.title} ${idea.theme} ${idea.description} ${idea.notes}`.toLowerCase()
        return (
          (!search || haystack.includes(search.toLowerCase())) &&
          (theme === "all" || idea.theme === theme) &&
          (platform === "all" || idea.platform === platform) &&
          (type === "all" || idea.type === type) &&
          (status === "all" || idea.status === status)
        )
      }),
    [ideas, search, theme, platform, type, status]
  )
  function changeView(next: "card" | "list") {
    setView(next)
    window.localStorage.setItem("content-edit.ideas-view", next)
  }
  return (
    <div className="cc-ideas">
      <style>{IDEA_CSS}</style>
      <header className="cc-ideas-head">
        <div>
          <div className="cc-ideas-title-row">
            <h1 className="cc-ideas-title">Keep the good ideas close.</h1>
            <Sparkles className="cc-ideas-star" size={29} />
          </div>
          <div className="cc-ideas-line" />
        </div>
        <div className="cc-ideas-meta">
          <span>
            Apr 21 – Apr 27, 2025 &nbsp;{" "}
            <CalendarDays size={13} style={{ display: "inline" }} />
          </span>
          <span className="cc-ideas-local">
            <MapPin size={11} fill="currentColor" />
            Local only
          </span>
        </div>
      </header>
      <div className="cc-ideas-layout">
        <main className="cc-ideas-main">
          <div className="cc-ideas-toolbar">
            <label className="cc-ideas-search">
              <Search size={13} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search ideas by keyword, theme, or note..."
              />
            </label>
            <SelectBox label="Theme" value={theme} onChange={setTheme}>
              <option value="all">All themes</option>
              {themes.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </SelectBox>
            <SelectBox label="Platform" value={platform} onChange={setPlatform}>
              <option value="all">All platforms</option>
              {PLATFORMS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </SelectBox>
            <SelectBox label="Post type" value={type} onChange={setType}>
              <option value="all">All post types</option>
              {TYPES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </SelectBox>
            <SelectBox label="Status" value={status} onChange={setStatus}>
              <option value="all">All statuses</option>
              {STATUSES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </SelectBox>
          </div>
          <div className="cc-ideas-switch">
            <button
              className={view === "card" ? "active" : ""}
              onClick={() => changeView("card")}
            >
              <Grid2X2 size={12} />
              Card view
            </button>
            <button
              className={view === "list" ? "active" : ""}
              onClick={() => changeView("list")}
            >
              <List size={13} />
              List view
            </button>
          </div>
          <div className={view === "card" ? "cc-ideas-grid" : "cc-idea-list"}>
            {shown.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                convert={() => convertIdeaToPipeline(idea.id)}
              />
            ))}
          </div>
        </main>
        <aside className="cc-prompts">
          <h2>
            Idea prompts <Sparkles size={21} color="#e7ad42" />
          </h2>
          <p className="cc-prompts-sub">
            Seasonal prompts to spark your next post.
          </p>
          {PROMPTS.map((prompt) => (
            <button
              className="cc-prompt"
              key={prompt.title}
              onClick={() =>
                setModal({ title: prompt.title, theme: prompt.theme })
              }
            >
              <span className="cc-prompt-icon">{prompt.icon}</span>
              <span>
                <strong>{prompt.title}</strong>
                <small>{prompt.description}</small>
              </span>
              <span>→</span>
            </button>
          ))}
          <button className="cc-add-idea" onClick={() => setModal({})}>
            <Plus size={14} />
            Add idea
          </button>
        </aside>
      </div>
      {modal && (
        <AddIdeaModal
          initialTitle={modal.title}
          initialTheme={modal.theme}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
