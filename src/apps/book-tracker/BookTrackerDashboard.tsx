import { useState } from "react";
import {
  LayoutGrid, BookOpen, Clock, Bookmark, BarChart2,
  PenLine, Settings, CloudUpload, Search, Moon, Upload,
  Plus, Flame, Star,
} from "lucide-react";
import Heatmap from "./components/Heatmap";
import LibraryPage from "./LibraryPage";
import ReadingLogPage from "./ReadingLogPage";

const C = {
  bg: "#f4efe6",
  white: "#ffffff",
  green: "#2d4a3e",
  greenFaint: "#e8f0eb",
  border: "#e8e2d8",
  borderCard: "#ede8df",
  muted: "#8a8a8a",
  text: "#1a1a1a",
  shadow: "0 1px 4px rgba(0,0,0,.05), 0 2px 8px rgba(0,0,0,.04)",
} as const;

const card = {
  background: C.white,
  borderRadius: 12,
  border: `1px solid ${C.borderCard}`,
  boxShadow: C.shadow,
  padding: "20px 22px",
} as const;

const SERIF = { fontFamily: "'Lora', Georgia, 'Times New Roman', serif" } as const;

function SectionLabel({ children }: { children: string }) {
  return (
    <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, marginBottom: 14 }}>
      {children}
    </div>
  );
}

function StatTile({ icon: Icon, label, value, note }: { icon: React.ElementType; label: string; value: string; note: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 5 }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.greenFaint, display: "flex", alignItems: "center", justifyContent: "center", color: C.green }}>
        <Icon size={17} strokeWidth={1.8} />
      </div>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1, letterSpacing: -0.3 }}>{value}</div>
      <div style={{ fontSize: 10.5, color: C.muted }}>{note}</div>
    </div>
  );
}

const NAV = [
  { id: "overview", label: "Overview", Icon: LayoutGrid },
  { id: "library", label: "Library", Icon: BookOpen },
  { id: "log", label: "Reading log", Icon: Clock },
  { id: "wishlist", label: "Wishlist", Icon: Bookmark },
  { id: "insights", label: "Insights", Icon: BarChart2 },
  { id: "notes", label: "Notes", Icon: PenLine },
  { id: "settings", label: "Settings", Icon: Settings },
];

export default function BookTrackerDashboard() {
  const [activeNav, setActiveNav] = useState("overview");

  return (
    <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", height: "100%", overflow: "hidden" }}>

      <aside style={{ background: C.white, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Logo */}
        <div style={{ padding: "18px 14px 14px", display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 30, height: 30, background: C.green, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <BookOpen size={16} stroke="white" strokeWidth={2} />
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "2px 8px", display: "flex", flexDirection: "column", gap: 1, overflowY: "auto" }}>
          {NAV.map(({ id, label, Icon }) => {
            const active = id === activeNav;
            return (
              <button
                key={id}
                onClick={() => setActiveNav(id)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "7.5px 10px", borderRadius: 8,
                  background: active ? C.green : "transparent",
                  color: active ? "#fff" : "#5a5a5a",
                  fontSize: 13, fontWeight: 500,
                  transition: "background .13s, color .13s",
                  width: "100%", textAlign: "left", cursor: "pointer",
                }}
                onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = C.greenFaint; (e.currentTarget as HTMLElement).style.color = C.green; }}}
                onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#5a5a5a"; }}}
              >
                <Icon size={15} strokeWidth={2} />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: "10px 13px 13px", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "flex-start", gap: 6, color: C.muted, fontSize: 11, lineHeight: 1.45 }}>
          <CloudUpload size={13} style={{ marginTop: 1, flexShrink: 0, color: "#aaa" }} />
          <div>
            <div style={{ fontWeight: 600, color: "#666" }}>Offline by default</div>
            <div>Nothing sent to any server</div>
          </div>
        </div>
      </aside>

      <main style={{ display: "flex", flexDirection: "column", overflow: "hidden", background: C.bg }}>

        {activeNav === "library"  ? <LibraryPage />    :
         activeNav === "log"      ? <ReadingLogPage /> :
         (<>

        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "20px 28px 14px", flexShrink: 0 }}>
          <h1 style={{ ...SERIF, fontSize: 28, fontWeight: 400, flex: 1, color: C.text, letterSpacing: -0.2 }}>
            Good books, well kept.
          </h1>

          {/* Search */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#bbb", pointerEvents: "none" }} />
            <input
              type="text"
              placeholder="Search books, authors, tags…"
              style={{ border: `1px solid ${C.border}`, borderRadius: 20, padding: "6.5px 14px 6.5px 30px", fontSize: 12.5, background: C.white, width: 220, outline: "none" }}
            />
          </div>

          {/* Moon */}
          <button style={{ width: 33, height: 33, borderRadius: 7, border: `1px solid ${C.border}`, background: C.white, display: "flex", alignItems: "center", justifyContent: "center", color: "#666" }}>
            <Moon size={15} />
          </button>

          {/* Export */}
          <button style={{ border: `1px solid ${C.border}`, background: C.white, padding: "6.5px 13px", borderRadius: 7, fontSize: 12.5, fontWeight: 500, color: "#555", display: "flex", alignItems: "center", gap: 5 }}>
            <Upload size={13} />
            Export
          </button>

          {/* Add book */}
          <button style={{ background: C.green, color: "#fff", padding: "6.5px 13px", borderRadius: 7, fontSize: 12.5, fontWeight: 500, display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
            <Plus size={13} />
            Add book
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 28px 28px", display: "flex", flexDirection: "column", gap: 13 }}>

          <div style={card}>
            <SectionLabel>Yearly Goal</SectionLabel>
            <div style={{ display: "flex", alignItems: "center" }}>

              {/* Ring + pace */}
              <div style={{ display: "flex", alignItems: "center", gap: 20, paddingRight: 24, borderRight: `1px solid ${C.border}`, marginRight: 24, flexShrink: 0 }}>
                {/* SVG ring: r=47, circ=295.31, 75% fill, dashoffset=73.83 */}
                <div style={{ position: "relative", width: 114, height: 114, flexShrink: 0 }}>
                  <svg width={114} height={114} viewBox="0 0 114 114">
                    <circle cx={57} cy={57} r={47} fill="none" stroke="#e4e9e5" strokeWidth={8.5} />
                    <circle cx={57} cy={57} r={47} fill="none" stroke={C.green} strokeWidth={8.5}
                      strokeDasharray="295.31" strokeDashoffset="73.83"
                      strokeLinecap="round"
                      transform="rotate(-90 57 57)" />
                  </svg>
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1.15 }}>
                    <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.5 }}>18 / 24</span>
                    <span style={{ fontSize: 11, color: C.muted }}>books</span>
                  </div>
                </div>

                {/* Pace */}
                <div style={{ lineHeight: 1.5 }}>
                  <div style={{ fontSize: 12, color: C.muted }}>On pace to finish</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: C.green, lineHeight: 1.1 }}>2 books ahead</div>
                  <div style={{ fontSize: 12.5, color: C.muted }}>Sep 14</div>
                </div>
              </div>

              {/* Stats */}
              <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px 12px", alignContent: "center" }}>
                <StatTile icon={Clock}   label="Reading Time" value="143h 28m"  note="this year"      />
                <StatTile icon={BookOpen} label="Pages Read"   value="5,482"    note="this year"      />
                <StatTile icon={Flame}   label="Day Streak"   value="27"        note="days"           />
                <StatTile icon={Star}    label="Avg Rating"   value="4.23"      note="from 13 books"  />
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 13, alignItems: "start" }}>

            {/* Current Read */}
            <div style={card}>
              <SectionLabel>Current Read</SectionLabel>
              <div style={{ display: "flex", gap: 13, alignItems: "flex-start", marginBottom: 14 }}>
                {/* Book cover placeholder */}
                <div style={{
                  width: 72, height: 108, borderRadius: 5, flexShrink: 0,
                  background: "linear-gradient(155deg, #334e6a 0%, #1e3248 40%, #0f1e2e 75%, #0a131c 100%)",
                  position: "relative", overflow: "hidden",
                  boxShadow: "2px 3px 10px rgba(0,0,0,.3)",
                }}>
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 5, background: "linear-gradient(to right, rgba(0,0,0,.25), transparent)" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3, marginBottom: 3 }}>The Left Hand<br />of Darkness</div>
                  <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>Ursula K. Le Guin</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, color: "#555", marginBottom: 6 }}>
                    <span>211 / 304 pages</span>
                    <span style={{ fontWeight: 600 }}>69%</span>
                  </div>
                  <div style={{ height: 5, background: C.greenFaint, borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: "69%", background: C.green, borderRadius: 99 }} />
                  </div>
                </div>
              </div>
              <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 11px", borderRadius: 20, border: `1px solid ${C.border}`, fontSize: 12, fontWeight: 500, color: "#444", background: "#fafaf8", cursor: "pointer" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#3d7a58", flexShrink: 0 }} />
                Reading
                <span style={{ color: "#bbb", fontSize: 9 }}>▾</span>
              </button>
            </div>

            {/* Reading Activity */}
            <div style={card}>
              <SectionLabel>Reading Activity</SectionLabel>
              <Heatmap />
            </div>

            {/* Next Up */}
            <div style={card}>
              <SectionLabel>Next Up</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
                {[
                  { title: "The Dispossessed", gradient: "linear-gradient(145deg, #2e4a62, #1a2d3d)" },
                  { title: "A Wizard of Earthsea", gradient: "linear-gradient(145deg, #3a5040, #1e3020)" },
                  { title: "The Telling", gradient: "linear-gradient(145deg, #4a3050, #281828)" },
                ].map(({ title, gradient }) => (
                  <div key={title} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 38, height: 56, borderRadius: 4, flexShrink: 0, background: gradient, boxShadow: "1px 2px 6px rgba(0,0,0,.18)" }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.3 }}>{title}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>Ursula K. Le Guin</div>
                    </div>
                    <div style={{ color: "#d0ccc8", fontSize: 14, cursor: "grab", userSelect: "none" }}>⠿</div>
                  </div>
                ))}
              </div>
              <button style={{ width: "100%", border: `1px solid ${C.border}`, background: "transparent", padding: 8, borderRadius: 8, fontSize: 12.5, fontWeight: 500, color: "#666", textAlign: "center", cursor: "pointer" }}>
                View full queue
              </button>
            </div>
          </div>

          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: C.greenFaint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: C.green }}>
                <CloudUpload size={22} strokeWidth={1.8} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>Backup reminder</div>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>
                  Your data lives only on this device.<br />
                  Keep regular backups so your library is always safe.
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                <button style={{ border: `1px solid ${C.border}`, background: C.white, padding: "6.5px 13px", borderRadius: 7, fontSize: 12.5, fontWeight: 500, color: "#555", cursor: "pointer" }}>
                  Back up now
                </button>
                <div style={{ fontSize: 11.5, color: C.muted }}>Last backup: May 14, 2025</div>
              </div>
            </div>
          </div>

        </div>{/* /content */}
        </>)}
      </main>
    </div>
  );
}
