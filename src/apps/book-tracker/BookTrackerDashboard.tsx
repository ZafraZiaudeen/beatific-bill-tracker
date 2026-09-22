import { useState, useMemo } from "react";
import {
  LayoutGrid, BookOpen, Clock, Bookmark, BarChart2,
  PenLine, Settings, CloudUpload, Search, Moon, Upload,
  Plus, Flame, Star,
} from "lucide-react";
import Heatmap from "./components/Heatmap";
import LibraryPage from "./LibraryPage";
import ReadingLogPage from "./ReadingLogPage";
import WishlistPage from "./WishlistPage";
import NotesPage from "./NotesPage";
import InsightsPage from "./InsightsPage";
import SettingsPage from "./SettingsPage";

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

function durationToSec(d: string): number {
  if (!d) return 0;
  const parts = d.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
}

function fmtTime(secs: number): string {
  if (secs <= 0) return "0m";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function calcStreak(sessions: Array<{ date: string }>): number {
  const dates = new Set(sessions.map(s => s.date));
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (dates.has(key)) streak++;
    else if (i > 0) break;
  }
  return streak;
}

function exportJSONAndRecord(): string {
  const keys = ["bt_books", "bt_sessions", "bt_notes", "bt_wishlist", "bt_settings", "bt_last_backup"] as const;
  const data: Record<string, unknown> = {};
  keys.forEach(k => { const v = localStorage.getItem(k); if (v !== null) data[k] = JSON.parse(v); });
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `book-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click(); URL.revokeObjectURL(url);
  const ts = new Date().toISOString();
  localStorage.setItem("bt_last_backup", ts);
  return ts;
}

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

function Overview({ onNavigate }: { onNavigate: (id: string) => void }) {
  const [lastBackup, setLastBackup] = useState<string | null>(() => localStorage.getItem("bt_last_backup"));

  const books   = useMemo(() => { try { return JSON.parse(localStorage.getItem("bt_books")    ?? "[]") as Record<string,unknown>[]; } catch { return []; } }, []);
  const sessions = useMemo(() => { try { return JSON.parse(localStorage.getItem("bt_sessions") ?? "[]") as Record<string,unknown>[]; } catch { return []; } }, []);
  const wishlist = useMemo(() => { try { return JSON.parse(localStorage.getItem("bt_wishlist") ?? "[]") as Record<string,unknown>[]; } catch { return []; } }, []);
  const settings = useMemo(() => { try { return JSON.parse(localStorage.getItem("bt_settings") ?? "{}") as Record<string,unknown>; } catch { return {}; } }, []);

  const currentYear = new Date().getFullYear();
  const yearlyGoal  = Number(settings.yearlyGoal ?? 0);
  const booksFinished = books.filter(b => b.status === "Finished").length;

  const yearSessions = useMemo(() =>
    sessions.filter(s => new Date(String(s.date)).getFullYear() === currentYear),
    [sessions, currentYear]
  );
  const totalSecs  = yearSessions.reduce((acc, s) => acc + durationToSec(String(s.duration ?? "")), 0);
  const totalPages = yearSessions.reduce((acc, s) => acc + Number(s.pages ?? 0), 0);
  const streak     = calcStreak(sessions as Array<{date:string}>);

  const ratedBooks = books.filter(b => Number(b.rating) > 0);
  const avgRating  = ratedBooks.length
    ? (ratedBooks.reduce((a, b) => a + Number(b.rating), 0) / ratedBooks.length).toFixed(2)
    : "—";

  const circ = 295.31;
  const goalSet = yearlyGoal > 0;
  const progress  = goalSet ? Math.min(1, booksFinished / yearlyGoal) : 0;
  const dashOffset = circ * (1 - progress);

  const monthsElapsed = new Date().getMonth() + 1;
  const expectedByNow = goalSet ? yearlyGoal * monthsElapsed / 12 : 0;
  const paceAhead = booksFinished - expectedByNow;
  const paceLabel = !goalSet
    ? "Set a goal in Settings"
    : Math.abs(paceAhead) < 0.5
      ? "On pace"
      : paceAhead > 0
        ? `${Math.round(paceAhead)} book${Math.round(paceAhead) !== 1 ? "s" : ""} ahead`
        : `${Math.round(-paceAhead)} book${Math.round(-paceAhead) !== 1 ? "s" : ""} behind`;

  const currentRead = books.find(b => b.status === "Reading") ?? null;
  const currentProgress = currentRead
    ? Math.round((Number(currentRead.currentPage ?? 0) / Math.max(1, Number(currentRead.pages ?? 1))) * 100)
    : 0;

  const nextUp = useMemo(() => {
    const order = { "next-up": 0, "high": 1, "someday": 2 };
    return [...wishlist]
      .sort((a, b) => {
        const pa = order[a.priority as keyof typeof order] ?? 99;
        const pb = order[b.priority as keyof typeof order] ?? 99;
        if (pa !== pb) return pa - pb;
        return Number(a.order ?? 0) - Number(b.order ?? 0);
      })
      .slice(0, 3);
  }, [wishlist]);

  const fmtLastBackup = (iso: string | null) => {
    if (!iso) return "Never";
    try { return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }); }
    catch { return "Never"; }
  };

  const handleBackupNow = () => {
    const ts = exportJSONAndRecord();
    setLastBackup(ts);
  };

  return (
    <>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "20px 28px 14px", flexShrink: 0 }}>
        <h1 style={{ ...SERIF, fontSize: 28, fontWeight: 400, flex: 1, color: C.text, letterSpacing: -0.2 }}>
          Good books, well kept.
        </h1>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#bbb", pointerEvents: "none" }} />
          <input
            type="text"
            placeholder="Search books, authors, tags…"
            style={{ border: `1px solid ${C.border}`, borderRadius: 20, padding: "6.5px 14px 6.5px 30px", fontSize: 12.5, background: C.white, width: 220, outline: "none" }}
          />
        </div>
        <button style={{ width: 33, height: 33, borderRadius: 7, border: `1px solid ${C.border}`, background: C.white, display: "flex", alignItems: "center", justifyContent: "center", color: "#666" }}>
          <Moon size={15} />
        </button>
        <button onClick={() => { exportJSONAndRecord(); }} style={{ border: `1px solid ${C.border}`, background: C.white, padding: "6.5px 13px", borderRadius: 7, fontSize: 12.5, fontWeight: 500, color: "#555", display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
          <Upload size={13} />
          Export
        </button>
        <button onClick={() => onNavigate("library")} style={{ background: C.green, color: "#fff", padding: "6.5px 13px", borderRadius: 7, fontSize: 12.5, fontWeight: 500, display: "flex", alignItems: "center", gap: 5, cursor: "pointer", border: "none" }}>
          <Plus size={13} />
          Add book
        </button>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 28px 28px", display: "flex", flexDirection: "column", gap: 13 }}>

        {/* Yearly Goal */}
        <div style={card}>
          <SectionLabel>Yearly Goal</SectionLabel>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20, paddingRight: 24, borderRight: `1px solid ${C.border}`, marginRight: 24, flexShrink: 0 }}>
              <div style={{ position: "relative", width: 114, height: 114, flexShrink: 0 }}>
                <svg width={114} height={114} viewBox="0 0 114 114">
                  <circle cx={57} cy={57} r={47} fill="none" stroke="#e4e9e5" strokeWidth={8.5} />
                  <circle cx={57} cy={57} r={47} fill="none" stroke={C.green} strokeWidth={8.5}
                    strokeDasharray="295.31"
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                    transform="rotate(-90 57 57)" />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1.15 }}>
                  <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.5 }}>{goalSet ? `${booksFinished} / ${yearlyGoal}` : String(booksFinished)}</span>
                  <span style={{ fontSize: 11, color: C.muted }}>books</span>
                </div>
              </div>
              <div style={{ lineHeight: 1.5 }}>
                <div style={{ fontSize: 12, color: C.muted }}>{!goalSet ? "Yearly goal" : paceAhead >= 0 ? "On pace to finish" : "Pace check"}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: goalSet ? C.green : C.muted, lineHeight: 1.1 }}>{paceLabel}</div>
                <div style={{ fontSize: 12.5, color: C.muted }}>{new Date().getFullYear()}</div>
              </div>
            </div>
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px 12px", alignContent: "center" }}>
              <StatTile icon={Clock}    label="Reading Time" value={fmtTime(totalSecs)} note="this year" />
              <StatTile icon={BookOpen} label="Pages Read"   value={totalPages > 999 ? `${(totalPages/1000).toFixed(1)}k` : String(totalPages)} note="this year" />
              <StatTile icon={Flame}    label="Day Streak"   value={String(streak)} note="days" />
              <StatTile icon={Star}     label="Avg Rating"   value={avgRating} note={ratedBooks.length > 0 ? `from ${ratedBooks.length} book${ratedBooks.length !== 1 ? "s" : ""}` : "no ratings yet"} />
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 13, alignItems: "start" }}>

          {/* Current Read */}
          <div style={card}>
            <SectionLabel>Current Read</SectionLabel>
            {currentRead ? (
              <>
                <div style={{ display: "flex", gap: 13, alignItems: "flex-start", marginBottom: 14 }}>
                  {currentRead.coverUrl ? (
                    <img src={String(currentRead.coverUrl)} alt={String(currentRead.title)}
                      style={{ width: 72, height: 108, borderRadius: 5, objectFit: "cover", flexShrink: 0,
                        boxShadow: "2px 3px 10px rgba(0,0,0,.3)" }} />
                  ) : (
                    <div style={{
                      width: 72, height: 108, borderRadius: 5, flexShrink: 0,
                      background: `linear-gradient(155deg, ${currentRead.coverFrom ?? "#334e6a"} 0%, ${currentRead.coverTo ?? "#0a131c"} 100%)`,
                      position: "relative", overflow: "hidden",
                      boxShadow: "2px 3px 10px rgba(0,0,0,.3)",
                    }}>
                      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 5, background: "linear-gradient(to right, rgba(0,0,0,.25), transparent)" }} />
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3, marginBottom: 3 }}>{String(currentRead.title)}</div>
                    <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>{String(currentRead.author)}</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, color: "#555", marginBottom: 6 }}>
                      <span>{Number(currentRead.currentPage)} / {Number(currentRead.pages)} pages</span>
                      <span style={{ fontWeight: 600 }}>{currentProgress}%</span>
                    </div>
                    <div style={{ height: 5, background: C.greenFaint, borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${currentProgress}%`, background: C.green, borderRadius: 99 }} />
                    </div>
                  </div>
                </div>
                <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 11px", borderRadius: 20, border: `1px solid ${C.border}`, fontSize: 12, fontWeight: 500, color: "#444", background: "#fafaf8", cursor: "pointer" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#3d7a58", flexShrink: 0 }} />
                  Reading
                  <span style={{ color: "#bbb", fontSize: 9 }}>▾</span>
                </button>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "24px 0", color: C.muted }}>
                <BookOpen size={28} style={{ marginBottom: 10, opacity: 0.4 }} />
                <div style={{ fontSize: 13, marginBottom: 8 }}>No book in progress</div>
                <button
                  onClick={() => onNavigate("library")}
                  style={{ fontSize: 12.5, color: C.green, background: "none", border: `1px solid ${C.green}`, borderRadius: 20, padding: "4px 14px", cursor: "pointer" }}
                >
                  Start reading
                </button>
              </div>
            )}
          </div>

          {/* Reading Activity */}
          <div style={card}>
            <SectionLabel>Reading Activity</SectionLabel>
            <Heatmap />
          </div>

          {/* Next Up */}
          <div style={card}>
            <SectionLabel>Next Up</SectionLabel>
            {nextUp.length > 0 ? (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
                  {nextUp.map((w) => (
                    <div key={String(w.id)} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 38, height: 56, borderRadius: 4, flexShrink: 0,
                        background: `linear-gradient(145deg, ${w.coverFrom ?? "#2e4a62"}, ${w.coverTo ?? "#1a2d3d"})`,
                        boxShadow: "1px 2px 6px rgba(0,0,0,.18)",
                      }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{String(w.title)}</div>
                        <div style={{ fontSize: 11, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{String(w.author)}</div>
                      </div>
                      <div style={{ color: "#d0ccc8", fontSize: 14, cursor: "grab", userSelect: "none" }}>⠿</div>
                    </div>
                  ))}
                </div>
                <button onClick={() => onNavigate("wishlist")} style={{ width: "100%", border: `1px solid ${C.border}`, background: "transparent", padding: 8, borderRadius: 8, fontSize: 12.5, fontWeight: 500, color: "#666", textAlign: "center", cursor: "pointer" }}>
                  View full queue
                </button>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "24px 0", color: C.muted }}>
                <Bookmark size={28} style={{ marginBottom: 10, opacity: 0.4 }} />
                <div style={{ fontSize: 13, marginBottom: 8 }}>Your wishlist is empty</div>
                <button
                  onClick={() => onNavigate("wishlist")}
                  style={{ fontSize: 12.5, color: C.green, background: "none", border: `1px solid ${C.green}`, borderRadius: 20, padding: "4px 14px", cursor: "pointer" }}
                >
                  Add to wishlist
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Backup reminder */}
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
              <button
                onClick={handleBackupNow}
                style={{ border: `1px solid ${C.border}`, background: C.white, padding: "6.5px 13px", borderRadius: 7, fontSize: 12.5, fontWeight: 500, color: "#555", cursor: "pointer" }}
              >
                Back up now
              </button>
              <div style={{ fontSize: 11.5, color: C.muted }}>Last backup: {fmtLastBackup(lastBackup)}</div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}

export default function BookTrackerDashboard() {
  const [activeNav, setActiveNav] = useState("overview");

  return (
    <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", height: "100%", overflow: "hidden" }}>

      <aside style={{ background: C.white, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "18px 14px 14px", display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 30, height: 30, background: C.green, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <BookOpen size={16} stroke="white" strokeWidth={2} />
          </div>
        </div>

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
                  border: "none",
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

        <div style={{ padding: "10px 13px 13px", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "flex-start", gap: 6, color: C.muted, fontSize: 11, lineHeight: 1.45 }}>
          <CloudUpload size={13} style={{ marginTop: 1, flexShrink: 0, color: "#aaa" }} />
          <div>
            <div style={{ fontWeight: 600, color: "#666" }}>Offline by default</div>
            <div>Nothing sent to any server</div>
          </div>
        </div>
      </aside>

      <main style={{ display: "flex", flexDirection: "column", overflow: "hidden", background: C.bg }}>
        {activeNav === "library"   ? <LibraryPage />    :
         activeNav === "log"       ? <ReadingLogPage /> :
         activeNav === "wishlist"  ? <WishlistPage />   :
         activeNav === "notes"     ? <NotesPage />      :
         activeNav === "insights"  ? <InsightsPage />   :
         activeNav === "settings"  ? <SettingsPage />   :
         <Overview onNavigate={setActiveNav} />}
      </main>
    </div>
  );
}
