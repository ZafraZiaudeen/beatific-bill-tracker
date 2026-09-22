import { useState, useEffect } from "react";
import {
  BookOpen, Clock, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Play, Pause, Cloud, Gauge, X, Lock, Plus,
} from "lucide-react";

// ── Tokens ─────────────────────────────────────────────────────
const C = {
  bg: "#f4efe6",
  white: "#ffffff",
  green: "#2d4a3e",
  greenFaint: "#e8f0eb",
  border: "#e8e2d8",
  muted: "#8a8a8a",
  text: "#1a1a1a",
} as const;

const SERIF = { fontFamily: "'Lora', Georgia, 'Times New Roman', serif" } as const;

const INP: React.CSSProperties = {
  border: `1px solid ${C.border}`,
  borderRadius: 8,
  padding: "10px 14px",
  fontSize: 14,
  background: C.white,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
  fontFamily: "inherit",
  color: C.text,
};

// ── Types ──────────────────────────────────────────────────────
interface Session {
  id: number;
  bookTitle?: string;
  date: string;
  pages: number;
  duration: string;
  rangeStart: number;
  rangeEnd: number;
  mood: string;
  moodColor: string;
  note?: string;
}

interface BookRef {
  id: number;
  title: string;
  author: string;
  series?: string;
  pages: number;
  currentPage: number;
  coverFrom: string;
  coverTo: string;
  status: string;
  coverUrl?: string;
}

interface ActiveSession {
  book: BookRef;
  startPage: number;
  startTime: Date;
  currentPage: number;
  elapsed: number;
  paused: boolean;
  mood: string;
  moodColor: string;
  note: string;
  noteOpen: boolean;
}

interface PendingFinish {
  book: BookRef;
  startPage: number;
  currentPage: number;
  elapsed: number;
  startTime: Date;
}

// ── Constants ──────────────────────────────────────────────────
const MOOD_OPTIONS = [
  { label: "thoughtful", color: "#9b59b6" },
  { label: "strange",    color: "#3498db" },
  { label: "slow burn",  color: "#e67e22" },
  { label: "curious",    color: "#2980b9" },
  { label: "focused",    color: "#27ae60" },
  { label: "excited",    color: "#e74c3c" },
];

const FALLBACK_BOOK: BookRef = {
  id: 0,
  title: "Unknown book",
  author: "",
  pages: 0,
  currentPage: 0,
  coverFrom: "#888888",
  coverTo: "#444444",
  status: "Reading",
};

const FALLBACK_BOOKS: BookRef[] = [];

const LS_KEY      = "bt_sessions";
const BOOKS_LS    = "bt_books";
const TODAY       = localIsoDate();
const BASE        = addDays(parseLocalDate(TODAY), -9);
const SESSION_GRID = "70px minmax(280px, 1fr) 92px 108px 118px 128px";
const SESSION_ACTION_WIDTH = 124;

const DAY_NAMES   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const FALLBACK_SESSIONS: Session[] = [];

// ── Helpers ────────────────────────────────────────────────────
function loadSessions(): Session[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]"); } catch { return []; }
}
function persistSessions(s: Session[]) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch {}
}
function persistBookProgress(bookTitle: string, rangeEnd: number) {
  try {
    const raw = localStorage.getItem(BOOKS_LS);
    if (!raw) return;
    const all = JSON.parse(raw) as Record<string, unknown>[];
    localStorage.setItem(BOOKS_LS, JSON.stringify(
      all.map(b =>
        String(b.title ?? "") === bookTitle && rangeEnd > Number(b.currentPage ?? 0)
          ? { ...b, currentPage: rangeEnd }
          : b
      )
    ));
  } catch {}
}
function normalizeBook(b: Record<string, unknown>): BookRef {
  return {
    id: Number(b.id),
    title: String(b.title ?? ""),
    author: String(b.author ?? ""),
    series: b.series ? String(b.series) : undefined,
    pages: Number(b.pages ?? 300),
    currentPage: Number(b.currentPage ?? 0),
    coverFrom: String(b.coverFrom ?? "#1c2e4a"),
    coverTo: String(b.coverTo ?? "#0a1520"),
    status: String(b.status ?? "Reading"),
    coverUrl: b.coverUrl ? String(b.coverUrl) : undefined,
  };
}
function loadBooks(): BookRef[] {
  try {
    const raw = localStorage.getItem(BOOKS_LS);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr) && arr.length) {
        return arr.map(normalizeBook).filter(b => Number.isFinite(b.id));
      }
    }
  } catch {}
  return [];
}

function localIsoDate(d = new Date()): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}
function isoDate(d: Date): string {
  return localIsoDate(d);
}
function addDays(d: Date, n: number): Date {
  const r = new Date(d); r.setDate(r.getDate() + n); return r;
}
function daysBetweenBase(dateStr: string): number {
  return Math.round((parseLocalDate(dateStr).getTime() - BASE.getTime()) / 86400000);
}
function formatElapsed(sec: number): string {
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
function formatStartedAt(d: Date): string {
  let h = d.getHours(); const m = d.getMinutes();
  const ap = h >= 12 ? "PM" : "AM"; h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, "0")} ${ap}`;
}
function durationToSec(dur: string): number {
  const p = dur.split(":").map(Number);
  return p.length === 3 ? p[0]*3600+p[1]*60+p[2] : p[0]*60+(p[1]||0);
}
function formatTotalTime(sec: number): string {
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
function getStripDays(startOffset: number) {
  return Array.from({ length: 19 }, (_, i) => {
    const d = addDays(BASE, startOffset + i);
    return { dateStr: isoDate(d), dayName: DAY_NAMES[d.getDay()].toUpperCase(), dayNum: d.getDate(), month: d.getMonth(), year: d.getFullYear() };
  });
}
function getDotCount(dateStr: string, sessions: Session[]): number {
  return Math.min(3, sessions.filter(s => s.date === dateStr).length);
}
function getCalendarGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const dow = first.getDay();
  const adj = dow === 0 ? 6 : dow - 1;
  const mon = addDays(first, -adj);
  const rows: Array<Array<{ dateStr: string; day: number; inMonth: boolean }>> = [];
  for (let w = 0; w < 6; w++) {
    const row = Array.from({ length: 7 }, (_, d) => {
      const c = addDays(mon, w*7+d);
      return { dateStr: isoDate(c), day: c.getDate(), inMonth: c.getMonth() === month };
    });
    if (row.some(c => c.inMonth)) rows.push(row);
  }
  return rows;
}
function formatMonthDate(dateStr: string): string {
  const d = parseLocalDate(dateStr);
  return `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`;
}
function dayName(dateStr: string): string {
  return DAY_NAMES[parseLocalDate(dateStr).getDay()];
}
function getWeekMonday(dateStr: string): string {
  const d = parseLocalDate(dateStr);
  const dow = d.getDay();
  return isoDate(addDays(d, dow === 0 ? -6 : 1 - dow));
}

// ── Mini book cover ────────────────────────────────────────────
function BookCover({ book, w = 46, h = 68 }: { book: BookRef; w?: number; h?: number }) {
  if (book.coverUrl) {
    return (
      <img src={book.coverUrl} alt={book.title}
        style={{ width: w, height: h, borderRadius: 4, objectFit: "cover", flexShrink: 0,
          boxShadow: "1px 2px 6px rgba(0,0,0,.25)" }} />
    );
  }
  return (
    <div style={{ width: w, height: h, borderRadius: 4, flexShrink: 0,
      background: `linear-gradient(155deg, ${book.coverFrom} 0%, ${book.coverTo} 100%)`,
      position: "relative", overflow: "hidden", boxShadow: "1px 2px 6px rgba(0,0,0,.25)" }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4,
        background: "linear-gradient(to right, rgba(0,0,0,.28), transparent)" }} />
    </div>
  );
}

// ── Modal overlay ──────────────────────────────────────────────
function Overlay({ children, onClose }: { children: React.ReactNode; onClose?: () => void }) {
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", display: "flex",
        alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 24 }}
      onClick={e => { if (e.target === e.currentTarget) onClose?.(); }}
    >{children}</div>
  );
}

// ── Book selector (used in both Start + Log Past dialogs) ──────
function BookSelector({ books, value, onChange }: {
  books: BookRef[];
  value: BookRef;
  onChange: (b: BookRef) => void;
}) {
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px",
      display: "flex", alignItems: "center", gap: 12, position: "relative", cursor: "pointer" }}>
      <BookCover book={value} w={40} h={58} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: C.text, paddingRight: 24, whiteSpace: "nowrap",
          overflow: "hidden", textOverflow: "ellipsis" }}>{value.title}</div>
        <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{value.author}</div>
        <select
          aria-label="Choose book"
          value={value.id}
          onChange={e => {
            const found = books.find(b => b.id === Number(e.target.value));
            if (found) onChange(found);
          }}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0,
            cursor: "pointer", appearance: "none", WebkitAppearance: "none", MozAppearance: "none" }}
        >
          {books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
        </select>
      </div>
      <ChevronDown size={16} color={C.muted} style={{ flexShrink: 0, pointerEvents: "none" }} />
    </div>
  );
}

// ── DIALOG 1: Start Session ────────────────────────────────────
function StartSessionDialog({ books, onStart, onLogPast, onClose }: {
  books: BookRef[];
  onStart: (book: BookRef, startPage: number, mood: string, moodColor: string) => void;
  onLogPast: () => void;
  onClose: () => void;
}) {
  const readingBooks = books.filter(b => b.status === "Reading");
  const defaultBook = readingBooks[0] ?? books[0] ?? FALLBACK_BOOK;
  const [selBook, setSelBook]   = useState<BookRef>(defaultBook);
  const [startPage, setStartPage] = useState(defaultBook.currentPage || 1);
  const [mood, setMood]           = useState("");
  const [moodColor, setMoodColor] = useState("");

  function handleBookChange(b: BookRef) {
    setSelBook(b);
    setStartPage(b.currentPage || 1);
  }

  const lastSessionEnd = selBook.currentPage || 1;

  return (
    <Overlay onClose={onClose}>
      <div style={{ background: C.white, borderRadius: 16, width: "min(460px,92vw)",
        maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,.22)" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "26px 28px 18px" }}>
          <div>
            <div style={{ ...SERIF, fontSize: 22, fontWeight: 400, color: C.text, marginBottom: 6 }}>Start reading session</div>
            <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
              Opened from the "Start session" button in This Week<br />or from a book's "Log pages" action.
            </div>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, display: "flex", alignItems: "center",
            justifyContent: "center", background: "none", border: "none", cursor: "pointer", color: C.muted, flexShrink: 0 }}>
            <X size={18} strokeWidth={1.8} />
          </button>
        </div>

        {/* Book selector */}
        <div style={{ margin: "0 28px" }}>
          <BookSelector books={readingBooks.length ? readingBooks : books} value={selBook} onChange={handleBookChange} />
          <div style={{ fontSize: 13, color: C.green, fontWeight: 600, marginTop: 8, paddingLeft: 2 }}>
            {selBook.currentPage} / {selBook.pages} pages
          </div>
        </div>

        <div style={{ padding: "20px 28px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Start at page */}
          <div>
            <label style={{ fontSize: 11.5, fontWeight: 700, color: C.muted, textTransform: "uppercase",
              letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Start at page</label>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ position: "relative", flex: 1 }}>
                <input type="text" inputMode="numeric" value={startPage}
                  onChange={e => {
                    const next = Number(e.target.value);
                    if (!Number.isNaN(next)) setStartPage(Math.max(1, Math.min(selBook.pages, next || 1)));
                  }}
                  style={{ ...INP, paddingRight: 28 }} />
                <div style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                  display: "flex", flexDirection: "column", gap: 1 }}>
                  <button onClick={() => setStartPage(p => Math.min(selBook.pages, p+1))}
                    style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 0, fontSize: 9, lineHeight: 1 }}>▲</button>
                  <button onClick={() => setStartPage(p => Math.max(1, p-1))}
                    style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 0, fontSize: 9, lineHeight: 1 }}>▼</button>
                </div>
              </div>
              {startPage === lastSessionEnd && (
                <div style={{ padding: "5px 10px", borderRadius: 20, border: `1px solid ${C.green}`,
                  fontSize: 11, color: C.green, fontWeight: 500, whiteSpace: "nowrap", flexShrink: 0 }}>
                  Last session ended here
                </div>
              )}
            </div>
          </div>

          {/* Mood */}
          <div>
            <label style={{ fontSize: 11.5, fontWeight: 700, color: C.muted, textTransform: "uppercase",
              letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>
              Choose a mood <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
            </label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {MOOD_OPTIONS.slice(0, 3).map(m => {
                const active = mood === m.label;
                return (
                  <button key={m.label} onClick={() => { setMood(active ? "" : m.label); setMoodColor(active ? "" : m.color); }}
                    style={{ padding: "7px 16px", borderRadius: 20, fontSize: 12.5, fontWeight: 500, cursor: "pointer",
                      border: `1px solid ${active ? m.color : C.border}`,
                      background: active ? m.color+"22" : C.white,
                      color: active ? m.color : C.muted, transition: "all .12s" }}>
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button onClick={() => onStart(selBook, startPage, mood, moodColor)} style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "13px 0", borderRadius: 8, border: "none",
            background: C.green, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            <Play size={14} fill="#fff" /> Start timer
          </button>

          <button onClick={onLogPast} style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            padding: "11px 0", borderRadius: 8, border: `1px solid ${C.border}`,
            background: C.white, fontSize: 13, color: C.muted, cursor: "pointer" }}>
            <Clock size={13} /> Log past session
          </button>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 11.5, color: C.muted }}>
            <Lock size={12} /> Your session is stored locally on this device.
          </div>
        </div>
      </div>
    </Overlay>
  );
}

// ── DIALOG 2: Active Session ───────────────────────────────────
function ActiveSessionDialog({ session, onPauseResume, onFinish, onUpdatePage, onToggleNote, onUpdateNote, onUpdateMood }: {
  session: ActiveSession;
  onPauseResume: () => void;
  onFinish: () => void;
  onUpdatePage: (p: number) => void;
  onToggleNote: () => void;
  onUpdateNote: (n: string) => void;
  onUpdateMood: (mood: string, color: string) => void;
}) {
  const pagesThisSession = Math.max(0, session.currentPage - session.startPage);
  const book = session.book;

  return (
    <Overlay>
      <div style={{ background: C.white, borderRadius: 16, width: "min(500px,92vw)",
        maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,.22)" }}>
        <div style={{ ...SERIF, fontSize: 22, fontWeight: 400, color: C.text, textAlign: "center", padding: "28px 28px 16px" }}>
          Reading now
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "0 28px 20px" }}>
          <BookCover book={book} w={62} h={90} />
          <div>
            <div style={{ ...SERIF, fontSize: 18, fontWeight: 500, color: C.text, lineHeight: 1.3 }}>{book.title}</div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{book.author}</div>
            {book.series && <div style={{ fontSize: 12, color: C.muted, fontStyle: "italic", marginTop: 2 }}>{book.series}</div>}
          </div>
        </div>

        <div style={{ height: 1, background: C.border, margin: "0 28px" }} />

        {/* Timer + stats */}
        <div style={{ padding: "22px 28px 18px", display: "flex", alignItems: "center", gap: 28 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 52, fontWeight: 700, color: C.text,
              fontFamily: "'Courier New', monospace", lineHeight: 1, letterSpacing: "-1px" }}>
              {formatElapsed(session.elapsed)}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#27ae60", display: "inline-block" }} />
              <span style={{ fontSize: 12, color: C.muted }}>Session active</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                <Clock size={12} color={C.muted} />
                <span style={{ fontSize: 11, color: C.muted }}>Started at</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{formatStartedAt(session.startTime)}</div>
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                <BookOpen size={12} color={C.muted} />
                <span style={{ fontSize: 11, color: C.muted }}>Pages this session</span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: C.text }}>{pagesThisSession}</div>
            </div>
          </div>
        </div>

        <div style={{ padding: "0 28px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input type="number" value={session.currentPage}
              min={session.startPage} max={book.pages}
              onChange={e => {
                const v = Number(e.target.value);
                if (!isNaN(v)) onUpdatePage(Math.max(session.startPage, Math.min(book.pages, v)));
              }}
              style={{ ...INP, fontSize: 18, fontWeight: 700, textAlign: "center", flex: 1 }} />
            <span style={{ fontSize: 14, color: C.muted, flexShrink: 0 }}>/ {book.pages}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
            {[5, 10, 25].map(n => (
              <button key={n} onClick={() => onUpdatePage(Math.min(book.pages, session.currentPage + n))}
                style={{ padding: "9px 0", borderRadius: 8, border: `1px solid ${C.border}`,
                  background: C.white, fontSize: 13, fontWeight: 600, color: C.text, cursor: "pointer" }}>
                +{n}
              </button>
            ))}
            <button onClick={onPauseResume} style={{
              padding: "9px 0", borderRadius: 8, border: `1px solid ${C.border}`,
              background: C.white, fontSize: 12.5, fontWeight: 500, color: C.muted, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
              {session.paused ? <><Play size={11} /> Resume</> : <><Pause size={11} /> Pause</>}
            </button>
          </div>
          <button onClick={onFinish} style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "13px 0", borderRadius: 8, border: "none", marginTop: 4,
            background: C.green, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            ✓ Finish session
          </button>
        </div>

        <div style={{ borderTop: `1px solid ${C.border}` }}>
          <div style={{ padding: "0 28px" }}>
            <button onClick={onToggleNote} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              width: "100%", background: "none", border: "none", cursor: "pointer",
              padding: "14px 0", borderBottom: session.noteOpen ? `1px solid ${C.border}` : "none" }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: C.text }}>Add a note</span>
              {session.noteOpen ? <ChevronUp size={16} color={C.muted} /> : <ChevronDown size={16} color={C.muted} />}
            </button>
            {session.noteOpen && (
              <div style={{ paddingBottom: 20, paddingTop: 14, display: "flex", flexDirection: "column", gap: 14 }}>
                <textarea value={session.note} onChange={e => onUpdateNote(e.target.value)}
                  placeholder="What are you noticing?" rows={3}
                  style={{ ...INP, resize: "vertical", lineHeight: 1.6 }} />
                <div>
                  <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>How's it going?</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {MOOD_OPTIONS.slice(0, 4).map(m => {
                      const active = session.mood === m.label;
                      return (
                        <button key={m.label} onClick={() => onUpdateMood(active ? "" : m.label, active ? "" : m.color)}
                          style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: "pointer",
                            border: `1px solid ${active ? m.color : C.border}`,
                            background: active ? m.color+"22" : C.white,
                            color: active ? m.color : C.muted }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: m.color,
                            display: "inline-block", marginRight: 5, verticalAlign: "middle" }} />
                          {m.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Overlay>
  );
}

// ── DIALOG 3: Log Past Session ─────────────────────────────────
function LogPastSessionDialog({ books, onSave, onClose }: {
  books: BookRef[];
  onSave: (session: Session) => void;
  onClose: () => void;
}) {
  const defaultBook = books.find(b => b.status === "Reading") ?? books[0] ?? FALLBACK_BOOK;
  const [selBook, setSelBook] = useState<BookRef>(defaultBook);
  const [startPage, setStartPage] = useState("0");
  const [endPage, setEndPage]     = useState("0");
  const [date, setDate]           = useState(TODAY);
  const [minutes, setMinutes]     = useState(30);
  const [mood, setMood]           = useState("");
  const [moodColor, setMoodColor] = useState("");
  const [note, setNote]           = useState("");

  const startPageNum = startPage.trim() === "" ? NaN : Number(startPage);
  const endPageNum   = endPage.trim() === "" ? NaN : Number(endPage);
  const hasValidPageNumbers = Number.isFinite(startPageNum) && Number.isFinite(endPageNum);
  const pageError =
    startPage.trim() === "" || endPage.trim() === ""
      ? "Enter started and finished page numbers."
      : !hasValidPageNumbers
        ? "Enter valid page numbers."
        : startPageNum < 0 || endPageNum < 0
          ? "Page numbers cannot be below 0."
          : startPageNum > selBook.pages || endPageNum > selBook.pages
            ? `This book only has ${selBook.pages} pages.`
            : endPageNum <= startPageNum
              ? "Finished page must be higher than started page."
              : "";
  const pagesRead = hasValidPageNumbers ? Math.max(0, endPageNum - startPageNum) : 0;
  const canSave   = !pageError && pagesRead > 0;

  function handleSave() {
    if (!canSave) return;
    const session: Session = {
      id: Date.now(), bookTitle: selBook.title, date,
      pages: pagesRead,
      duration: `${String(minutes).padStart(2,"0")}:00`,
      rangeStart: startPageNum, rangeEnd: endPageNum,
      mood: mood || "thoughtful", moodColor: moodColor || "#9b59b6",
      note: note.trim() || undefined,
    };
    onSave(session);
  }

  return (
    <Overlay onClose={onClose}>
      <div style={{ background: C.white, borderRadius: 16, width: "min(460px,92vw)",
        maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,.22)" }}>
        <div style={{ ...SERIF, fontSize: 22, fontWeight: 400, color: C.text, textAlign: "center", padding: "28px 28px 20px" }}>
          Log a past session
        </div>

        <div style={{ padding: "0 28px 28px", display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Book */}
          <div>
            <label style={{ fontSize: 11.5, fontWeight: 700, color: C.muted, textTransform: "uppercase",
              letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Choose book</label>
            <BookSelector books={books} value={selBook} onChange={b => { setSelBook(b); setStartPage("0"); setEndPage("0"); }} />
          </div>

          {/* Date */}
          <div>
            <label style={{ fontSize: 11.5, fontWeight: 700, color: C.muted, textTransform: "uppercase",
              letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Date</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                <Clock size={14} color={C.muted} />
              </span>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                style={{ ...INP, paddingLeft: 36 }} />
            </div>
          </div>

          {/* Pages */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: C.muted, textTransform: "uppercase",
                letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Started at page</label>
              <input type="number" value={startPage} min={0} max={selBook.pages}
                onChange={e => setStartPage(e.target.value)} style={INP} />
            </div>
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: C.muted, textTransform: "uppercase",
                letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Finished at page</label>
              <input type="number" value={endPage} min={0} max={selBook.pages}
                onChange={e => setEndPage(e.target.value)} style={INP} />
            </div>
          </div>
          {pageError && (
            <div style={{ marginTop: -10, fontSize: 12, color: "#b24a3b", lineHeight: 1.4 }}>
              {pageError}
            </div>
          )}

          {/* Reading time */}
          <div>
            <label style={{ fontSize: 11.5, fontWeight: 700, color: C.muted, textTransform: "uppercase",
              letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Reading time</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ position: "relative", flex: 1 }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                  <Clock size={14} color={C.muted} />
                </span>
                <input type="number" value={minutes} min={1} max={999}
                  onChange={e => setMinutes(Math.max(1, Number(e.target.value)||1))}
                  style={{ ...INP, paddingLeft: 36 }} />
              </div>
              <span style={{ fontSize: 13, color: C.muted, flexShrink: 0 }}>min</span>
            </div>
          </div>

          {/* Mood */}
          <div>
            <label style={{ fontSize: 11.5, fontWeight: 700, color: C.muted, textTransform: "uppercase",
              letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Mood</label>
            <div style={{ position: "relative" }}>
              <select value={mood} onChange={e => {
                const lbl = e.target.value;
                const opt = MOOD_OPTIONS.find(m => m.label === lbl);
                setMood(lbl); setMoodColor(opt?.color ?? "#8a8a8a");
              }} style={{ ...INP, appearance: "none", paddingRight: 36, cursor: "pointer" }}>
                <option value="">Select mood…</option>
                {MOOD_OPTIONS.map(m => <option key={m.label} value={m.label}>{m.label}</option>)}
              </select>
              <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                <ChevronDown size={16} color={C.muted} />
              </span>
            </div>
          </div>

          {/* Note */}
          <div>
            <label style={{ fontSize: 11.5, fontWeight: 700, color: C.muted, textTransform: "uppercase",
              letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Optional note</label>
            <textarea value={note} onChange={e => setNote(e.target.value)}
              placeholder="Add a note (optional)" rows={3}
              style={{ ...INP, resize: "vertical", lineHeight: 1.6 }} />
          </div>

          {/* Summary */}
          <div style={{ background: C.greenFaint, borderRadius: 8, padding: "12px 16px", textAlign: "center" }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: C.green }}>
              {pagesRead} pages · p. {startPage} — {endPage}
            </span>
          </div>
          <div style={{ fontSize: 12, color: C.muted, textAlign: "center" }}>
            Past sessions are added to your local reading history.
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{ flex: 1, padding: "11px 0", borderRadius: 8,
              border: `1px solid ${C.border}`, background: C.white,
              fontSize: 13.5, fontWeight: 500, color: C.text, cursor: "pointer" }}>Cancel</button>
            <button onClick={handleSave} disabled={!canSave} style={{ flex: 1, padding: "11px 0", borderRadius: 8, border: "none",
              background: canSave ? C.green : "#c4d4cc", color: "#fff",
              fontSize: 13.5, fontWeight: 600, cursor: canSave ? "pointer" : "not-allowed" }}>
              Add to log
            </button>
          </div>
        </div>
      </div>
    </Overlay>
  );
}

// ── DIALOG 4: Save Session ─────────────────────────────────────
function SaveSessionDialog({ pf, onSave, onDiscard }: {
  pf: PendingFinish;
  onSave: (session: Session) => void;
  onDiscard: () => void;
}) {
  const [finPage, setFinPage]     = useState(pf.currentPage);
  const date = TODAY;
  const [mood, setMood]           = useState("");
  const [moodColor, setMoodColor] = useState("");
  const [note, setNote]           = useState("");
  const book = pf.book;

  const pagesRead   = Math.max(0, finPage - pf.startPage);
  const elapsed     = formatElapsed(pf.elapsed);
  const durationStr = `${String(Math.floor(pf.elapsed/60)).padStart(2,"0")}:${String(pf.elapsed%60).padStart(2,"0")}`;

  function handleSave() {
    const session: Session = {
      id: Date.now(), bookTitle: book.title, date,
      pages: pagesRead, duration: durationStr,
      rangeStart: pf.startPage, rangeEnd: finPage,
      mood: mood || "thoughtful", moodColor: moodColor || "#9b59b6",
      note: note.trim() || undefined,
    };
    onSave(session);
  }

  return (
    <Overlay>
      <div style={{ background: C.white, borderRadius: 16, width: "min(460px,92vw)",
        maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,.22)" }}>
        <div style={{ ...SERIF, fontSize: 22, fontWeight: 400, color: C.text, textAlign: "center", padding: "28px 28px 18px" }}>
          Save reading session
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "0 28px 20px" }}>
          <BookCover book={book} w={56} h={80} />
          <div>
            <div style={{ ...SERIF, fontSize: 15, fontWeight: 500, color: C.text }}>{book.title}</div>
            <div style={{ fontSize: 12.5, color: C.muted, marginTop: 3 }}>{book.author}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginTop: 8 }}>{pagesRead} pages · {elapsed}</div>
          </div>
        </div>

        <div style={{ height: 1, background: C.border }} />

        <div style={{ padding: "20px 28px 28px", display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: C.muted, textTransform: "uppercase",
                letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Finished at page</label>
              <input type="number" value={finPage} min={pf.startPage} max={book.pages}
                onChange={e => setFinPage(Math.max(pf.startPage, Number(e.target.value)||pf.startPage))}
                style={INP} />
            </div>
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: C.muted, textTransform: "uppercase",
                letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Date</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                  <Clock size={14} color={C.muted} />
                </span>
                <div style={{ ...INP, paddingLeft: 36, color: C.text, background: "#f8f6f1" }}>
                  {date}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11.5, fontWeight: 700, color: C.muted, textTransform: "uppercase",
              letterSpacing: "0.08em", display: "block", marginBottom: 10 }}>Mood</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {MOOD_OPTIONS.slice(0, 4).map(m => {
                const active = mood === m.label;
                return (
                  <button key={m.label} onClick={() => { setMood(active ? "" : m.label); setMoodColor(active ? "" : m.color); }}
                    style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12.5, fontWeight: 500, cursor: "pointer",
                      border: `1px solid ${active ? m.color : C.border}`,
                      background: active ? m.color+"22" : C.white,
                      color: active ? m.color : C.muted, transition: "all .12s" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: m.color,
                      display: "inline-block", marginRight: 5, verticalAlign: "middle" }} />
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11.5, fontWeight: 700, color: C.muted, textTransform: "uppercase",
              letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Session note</label>
            <textarea value={note} onChange={e => setNote(e.target.value)}
              placeholder="The atmosphere is getting sharper."
              rows={3} style={{ ...INP, resize: "vertical", lineHeight: 1.6 }} />
          </div>

          <div>
            <label style={{ fontSize: 11.5, fontWeight: 700, color: C.muted, textTransform: "uppercase",
              letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Range</label>
            <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 14, color: C.muted }}>
              p. {pf.startPage} — {finPage}
            </div>
          </div>

          <div style={{ fontSize: 12, color: C.muted, textAlign: "center" }}>
            This will appear in your reading log and update your pace insights.
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onDiscard} style={{ flex: 1, padding: "11px 0", borderRadius: 8,
              border: `1px solid ${C.border}`, background: C.white,
              fontSize: 13.5, fontWeight: 500, color: C.text, cursor: "pointer" }}>Discard</button>
            <button onClick={handleSave} style={{ flex: 1, padding: "11px 0", borderRadius: 8, border: "none",
              background: C.green, color: "#fff", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>
              Save session
            </button>
          </div>
        </div>
      </div>
    </Overlay>
  );
}

// ── Main page ──────────────────────────────────────────────────
function SessionDetailDialog({ session, book, onClose }: {
  session: Session;
  book: BookRef;
  onClose: () => void;
}) {
  const seconds = durationToSec(session.duration);
  const pace = seconds > 0 ? Math.round(session.pages / (seconds / 3600)) : 0;

  return (
    <Overlay onClose={onClose}>
      <div style={{ background: C.white, borderRadius: 16, width: "min(520px,92vw)",
        maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,.22)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          padding: "26px 28px 18px", borderBottom: `1px solid ${C.border}` }}>
          <div>
            <div style={{ ...SERIF, fontSize: 22, fontWeight: 400, color: C.text }}>Reading session</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>
              {formatMonthDate(session.date)} · {dayName(session.date)}
            </div>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, display: "flex", alignItems: "center",
            justifyContent: "center", background: "none", border: "none", cursor: "pointer", color: C.muted, flexShrink: 0 }}>
            <X size={18} strokeWidth={1.8} />
          </button>
        </div>

        <div style={{ padding: "22px 28px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <BookCover book={book} w={62} h={90} />
            <div style={{ minWidth: 0 }}>
              <div style={{ ...SERIF, fontSize: 18, fontWeight: 500, color: C.text, lineHeight: 1.3 }}>{session.bookTitle ?? book.title}</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{book.author}</div>
              {book.series && <div style={{ fontSize: 12, color: C.muted, fontStyle: "italic", marginTop: 2 }}>{book.series}</div>}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              ["Date", `${formatMonthDate(session.date)}, ${dayName(session.date)}`],
              ["Pages read", `${session.pages} pages`],
              ["Duration", session.duration],
              ["Range", `p. ${session.rangeStart} - ${session.rangeEnd}`],
              ["Mood", session.mood],
              ["Pace", pace ? `${pace} pages/hour` : "-"],
            ].map(([label, value]) => (
              <div key={label} style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                  color: C.muted, marginBottom: 6 }}>{label}</div>
                <div style={{ fontSize: 14, color: C.text, fontWeight: 500 }}>{value}</div>
              </div>
            ))}
          </div>

          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
              color: C.muted, marginBottom: 8 }}>Session note</div>
            <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px",
              minHeight: 72, fontSize: 13.5, color: session.note ? C.text : C.muted, lineHeight: 1.6 }}>
              {session.note || "No note added."}
            </div>
          </div>
        </div>
      </div>
    </Overlay>
  );
}

export default function ReadingLogPage() {
  const [sessions, setSessions] = useState<Session[]>(() => {
    const stored = loadSessions();
    return stored.length > 0 ? stored : FALLBACK_SESSIONS;
  });
  const [books, setBooks] = useState<BookRef[]>(() => loadBooks());
  const [stripStart, setStripStart]     = useState(0);
  const [calMonth, setCalMonth]         = useState(() => {
    const today = parseLocalDate(TODAY);
    return { year: today.getFullYear(), month: today.getMonth() };
  });
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [showStart, setShowStart]       = useState(false);
  const [showLogPast, setShowLogPast]   = useState(false);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [pendingFinish, setPendingFinish] = useState<PendingFinish | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  // Live timer
  useEffect(() => {
    if (!activeSession || activeSession.paused) return;
    const id = setInterval(() => {
      setActiveSession(prev => prev && !prev.paused ? { ...prev, elapsed: prev.elapsed + 1 } : prev);
    }, 1000);
    return () => clearInterval(id);
  }, [!!activeSession, activeSession?.paused]);

  // Derived stats
  const totalSec = sessions.reduce((a, s) => a + durationToSec(s.duration), 0);
  const refDate  = selectedDate;
  const weekMon  = getWeekMonday(refDate);
  const weekSun  = isoDate(addDays(parseLocalDate(weekMon), 6));
  const weekSess = sessions.filter(s => s.date >= weekMon && s.date <= weekSun);
  const weekPages = weekSess.reduce((a, s) => a + s.pages, 0);
  const weekSec   = weekSess.reduce((a, s) => a + durationToSec(s.duration), 0);
  const weekPace  = weekSec > 0 ? Math.round(weekPages / (weekSec / 3600)) : 0;
  const weekLabel = `${formatMonthDate(weekMon)} – ${formatMonthDate(weekSun)}`;

  const displaySessions = sessions.filter(s => s.date === selectedDate);

  const stripDays = getStripDays(stripStart);
  const calGrid   = getCalendarGrid(calMonth.year, calMonth.month);
  const calLabel  = `${MONTH_NAMES[calMonth.month].toUpperCase()} ${calMonth.year}`;

  // Handlers
  function selectDate(dateStr: string) {
    setSelectedDate(dateStr);
    const d = parseLocalDate(dateStr);
    setCalMonth({ year: d.getFullYear(), month: d.getMonth() });
  }

  function selectCalDate(dateStr: string) {
    setSelectedDate(dateStr);
    const diff = daysBetweenBase(dateStr);
    setStripStart(Math.round((diff - 9) / 7) * 7);
  }

  function handleStartSession(book: BookRef, startPage: number, mood: string, moodColor: string) {
    setShowStart(false);
    setActiveSession({ book, startPage, startTime: new Date(), currentPage: startPage, elapsed: 0, paused: false, mood, moodColor, note: "", noteOpen: false });
  }

  function handleFinish() {
    if (!activeSession) return;
    setPendingFinish({ book: activeSession.book, startPage: activeSession.startPage, currentPage: activeSession.currentPage, elapsed: activeSession.elapsed, startTime: activeSession.startTime });
    setActiveSession(null);
  }

  function saveSession(session: Session) {
    const updated = [session, ...sessions];
    setSessions(updated); persistSessions(updated);
    if (session.bookTitle) {
      persistBookProgress(session.bookTitle, session.rangeEnd);
      setBooks(prev => prev.map(b =>
        b.title === session.bookTitle && session.rangeEnd > b.currentPage
          ? { ...b, currentPage: session.rangeEnd }
          : b
      ));
    }
    setSelectedDate(session.date);
    const diff = daysBetweenBase(session.date);
    setStripStart(Math.round((diff - 9) / 7) * 7);
    const d = parseLocalDate(session.date);
    setCalMonth({ year: d.getFullYear(), month: d.getMonth() });
    setPendingFinish(null);
  }

  function saveLoggedSession(session: Session) {
    const updated = [session, ...sessions];
    setSessions(updated); persistSessions(updated);
    if (session.bookTitle) {
      persistBookProgress(session.bookTitle, session.rangeEnd);
      setBooks(prev => prev.map(b =>
        b.title === session.bookTitle && session.rangeEnd > b.currentPage
          ? { ...b, currentPage: session.rangeEnd }
          : b
      ));
    }
    setSelectedDate(session.date);
    const diff = daysBetweenBase(session.date);
    setStripStart(Math.round((diff - 9) / 7) * 7);
    const d = parseLocalDate(session.date);
    setCalMonth({ year: d.getFullYear(), month: d.getMonth() });
    setShowLogPast(false);
  }

  function openLogPast() { setShowStart(false); setShowLogPast(true); }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: C.bg }}>

      {/* Dialogs */}
      {showStart && !activeSession && (
        <StartSessionDialog books={books} onStart={handleStartSession} onLogPast={openLogPast} onClose={() => setShowStart(false)} />
      )}
      {activeSession && (
        <ActiveSessionDialog
          session={activeSession}
          onPauseResume={() => setActiveSession(prev => prev ? { ...prev, paused: !prev.paused } : null)}
          onFinish={handleFinish}
          onUpdatePage={p => setActiveSession(prev => prev ? { ...prev, currentPage: p } : null)}
          onToggleNote={() => setActiveSession(prev => prev ? { ...prev, noteOpen: !prev.noteOpen } : null)}
          onUpdateNote={n => setActiveSession(prev => prev ? { ...prev, note: n } : null)}
          onUpdateMood={(mood, moodColor) => setActiveSession(prev => prev ? { ...prev, mood, moodColor } : null)}
        />
      )}
      {showLogPast && (
        <LogPastSessionDialog books={books} onSave={saveLoggedSession} onClose={() => setShowLogPast(false)} />
      )}
      {pendingFinish && (
        <SaveSessionDialog pf={pendingFinish} onSave={saveSession} onDiscard={() => setPendingFinish(null)} />
      )}
      {selectedSession && (
        <SessionDetailDialog
          session={selectedSession}
          book={books.find(b => b.title === selectedSession.bookTitle) ?? FALLBACK_BOOK}
          onClose={() => setSelectedSession(null)}
        />
      )}

      {/* ── Header ── */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "16px 28px 14px",
        flexShrink: 0, display: "flex", alignItems: "flex-start", gap: 16 }}>
        <div style={{ flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <BookOpen size={20} color={C.green} strokeWidth={2} />
            <h2 style={{ ...SERIF, fontSize: 26, fontWeight: 400, color: C.text, margin: 0 }}>Reading log</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 10px",
              border: `1px solid ${C.border}`, borderRadius: 20, fontSize: 12.5, color: C.text, cursor: "default" }}>
              2026 <ChevronDown size={11} color={C.muted} />
            </div>
          </div>
          <div style={{ fontSize: 12, color: C.muted, paddingLeft: 30 }}>
            {sessions.length} sessions · {formatTotalTime(totalSec)}
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setShowLogPast(true)} style={{
              display: "flex", alignItems: "center", gap: 7, padding: "8px 16px",
              borderRadius: 20, border: `1px solid ${C.border}`, background: C.white,
              fontSize: 13, fontWeight: 500, color: C.text, cursor: "pointer" }}>
              <Clock size={13} /> Log past session
            </button>
            <button onClick={() => setShowStart(true)} disabled={!!activeSession} style={{
              display: "flex", alignItems: "center", gap: 7, padding: "8px 18px",
              borderRadius: 20, border: "none", background: activeSession ? "#8aaa96" : C.green,
              color: "#fff", fontSize: 13, fontWeight: 600, cursor: activeSession ? "not-allowed" : "pointer" }}>
              <Play size={13} fill="#fff" /> Start session
            </button>
          </div>
          <div style={{ fontSize: 12, color: C.muted }}>Track a live session or add pages you read earlier.</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.muted, flexShrink: 0, paddingTop: 4 }}>
          <Cloud size={13} color={C.green} />
          <span>Save locally</span>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.green, display: "inline-block" }} />
          <span style={{ color: "#aaa" }}>Just now</span>
        </div>
      </div>

      {/* ── Date strip ── */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "10px 12px",
        flexShrink: 0, display: "flex", alignItems: "center", gap: 2 }}>
        <button onClick={() => setStripStart(s => s - 7)} style={{ width: 28, height: 28, display: "flex",
          alignItems: "center", justifyContent: "center", border: "none", background: "transparent",
          color: C.muted, cursor: "pointer", borderRadius: 6, flexShrink: 0 }}>
          <ChevronLeft size={16} />
        </button>

        <div style={{ flex: 1, display: "flex", gap: 0 }}>
          {stripDays.map(({ dateStr, dayName: dn, dayNum }) => {
            const isToday    = dateStr === TODAY;
            const isSelected = selectedDate === dateStr && !isToday;
            const dots       = getDotCount(dateStr, sessions);
            return (
              <div key={dateStr} onClick={() => selectDate(dateStr)}
                style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
                  gap: 3, padding: "2px 0", cursor: "pointer" }}>
                <span style={{ fontSize: 8.5, fontWeight: 600, letterSpacing: "0.05em", color: C.muted }}>{dn}</span>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: isToday ? C.green : "transparent",
                  border: isSelected ? `2px solid ${C.green}` : "2px solid transparent",
                  color: isToday ? "#fff" : C.text,
                  fontSize: 12.5, fontWeight: isToday || isSelected ? 700 : 400,
                  transition: "all .1s",
                }}>{dayNum}</div>
                <div style={{ display: "flex", gap: 2, height: 6, alignItems: "center" }}>
                  {Array.from({ length: dots }, (_, i) => (
                    <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: C.green, display: "inline-block" }} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={() => setStripStart(s => s + 7)} style={{ width: 28, height: 28, display: "flex",
          alignItems: "center", justifyContent: "center", border: "none", background: "transparent",
          color: C.muted, cursor: "pointer", borderRadius: 6, flexShrink: 0 }}>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* ── Main: list + sidebar ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Session list */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Column headers */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 14px",
            borderBottom: `1px solid ${C.border}`, background: C.white, flexShrink: 0 }}>
            <div style={{ flex: 1, minWidth: 0, display: "grid", gridTemplateColumns: SESSION_GRID, columnGap: 22 }}>
              {["DATE", "BOOK", "PAGES", "DURATION", "RANGE", "MOOD"].map(h => (
                <div key={h} style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", color: C.muted }}>{h}</div>
              ))}
            </div>
            <button onClick={() => setShowLogPast(true)} style={{
              width: SESSION_ACTION_WIDTH,
              display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 20,
              border: `1px solid ${C.border}`, background: C.white,
              fontSize: 11.5, fontWeight: 500, color: C.muted, cursor: "pointer", flexShrink: 0,
              justifyContent: "center", whiteSpace: "nowrap" }}>
              <Plus size={11} /> Add session
            </button>
          </div>

          {/* Session rows */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {displaySessions.length === 0 && selectedDate && (
              <div style={{ padding: "48px 28px", textAlign: "center", color: C.muted }}>
                <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>No sessions on {formatMonthDate(selectedDate)}</div>
                <div style={{ fontSize: 12 }}>Choose another date, or log a new session.</div>
              </div>
            )}
            {displaySessions.map(s => {
              const sessionBook = books.find(b => b.title === s.bookTitle) ?? FALLBACK_BOOK;
              return (
                <div key={s.id} role="button" tabIndex={0} onClick={() => setSelectedSession(s)}
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedSession(s);
                    }
                  }}
                  style={{ display: "flex", alignItems: "center", gap: 12,
                  padding: "16px 14px", borderBottom: `1px solid ${C.border}`,
                  background: C.white, cursor: "pointer" }}>
                  <div style={{ flex: 1, minWidth: 0, display: "grid", gridTemplateColumns: SESSION_GRID, columnGap: 22,
                    alignItems: "center" }}>

                  {/* DATE */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.green, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{formatMonthDate(s.date)}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>{dayName(s.date)}</div>
                    </div>
                  </div>

                  {/* BOOK */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <BookCover book={sessionBook} w={46} h={68} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text, lineHeight: 1.3 }}>{s.bookTitle ?? sessionBook.title}</div>
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{sessionBook.author}</div>
                      {sessionBook.series && <div style={{ fontSize: 11, color: C.muted, fontStyle: "italic", marginTop: 1 }}>{sessionBook.series}</div>}
                    </div>
                  </div>

                  {/* PAGES */}
                  <div style={{ fontSize: 12, color: C.text }}>{s.pages} pages</div>

                  {/* DURATION */}
                  <div style={{ fontSize: 12, color: C.text, fontFamily: "'Courier New', monospace" }}>{s.duration}</div>

                  {/* RANGE */}
                  <div style={{ fontSize: 12, color: C.text }}>p. {s.rangeStart} – {s.rangeEnd}</div>

                  {/* MOOD */}
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.moodColor, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: C.text }}>{s.mood}</span>
                  </div>
                  </div>
                  <div style={{ width: SESSION_ACTION_WIDTH, flexShrink: 0 }} />
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{ padding: "10px 28px 6px", borderTop: `1px solid ${C.border}`, background: C.white, flexShrink: 0 }}>
            <div style={{ fontSize: 12, color: C.muted, textAlign: "center" }}>
              {displaySessions.length} session{displaySessions.length !== 1 ? "s" : ""} on {formatMonthDate(selectedDate)}
            </div>
            <div style={{ fontSize: 11, color: "#bbb", textAlign: "center", marginTop: 4 }}>All data stored only on this device.</div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div style={{ width: 280, flexShrink: 0, borderLeft: `1px solid ${C.border}`,
          background: C.white, display: "flex", flexDirection: "column", overflowY: "auto" }}>

          {/* Week stats */}
          <div style={{ padding: "18px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", color: C.muted }}>THIS WEEK</span>
              <span style={{ fontSize: 11, color: C.muted }}>{weekLabel}</span>
            </div>

            {[
              { icon: BookOpen, value: String(weekPages), label: "Pages read" },
              { icon: Clock,    value: formatTotalTime(weekSec), label: "Time read" },
              { icon: Gauge,    value: String(weekPace), label: "Avg. pace (ppm)" },
            ].map(({ icon: Icon, value, label }, i) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0",
                borderBottom: i < 2 ? `1px solid ${C.border}` : "none" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.greenFaint,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={15} color={C.green} strokeWidth={2} />
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: C.text, lineHeight: 1 }}>{value}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{label}</div>
                </div>
              </div>
            ))}

            <button onClick={() => setShowStart(true)} disabled={!!activeSession} style={{
              width: "100%", marginTop: 16,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "11px 0", borderRadius: 8, border: "none",
              background: activeSession ? "#8aaa96" : C.green, color: "#fff",
              fontSize: 13.5, fontWeight: 600, cursor: activeSession ? "not-allowed" : "pointer" }}>
              <Play size={14} fill="#fff" /> Start a live session
            </button>
          </div>

          <div style={{ borderTop: `1px solid ${C.border}` }} />

          {/* Mini calendar */}
          <div style={{ padding: "16px 20px 12px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{calLabel}</span>
              <div style={{ display: "flex", gap: 2 }}>
                <button onClick={() => setCalMonth(({ year, month }) => month === 0 ? { year: year-1, month: 11 } : { year, month: month-1 })}
                  style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center",
                    border: "none", background: "transparent", color: C.muted, cursor: "pointer", borderRadius: 4 }}>
                  <ChevronLeft size={13} />
                </button>
                <button onClick={() => setCalMonth(({ year, month }) => month === 11 ? { year: year+1, month: 0 } : { year, month: month+1 })}
                  style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center",
                    border: "none", background: "transparent", color: C.muted, cursor: "pointer", borderRadius: 4 }}>
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 4 }}>
              {["Mo","Tu","We","Th","Fr","Sa","Su"].map(d => (
                <div key={d} style={{ textAlign: "center", fontSize: 9.5, color: C.muted, fontWeight: 600, padding: "2px 0" }}>{d}</div>
              ))}
            </div>

            {calGrid.map((row, ri) => (
              <div key={ri} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 2 }}>
                {row.map(({ dateStr, day, inMonth }) => {
                  const isToday    = dateStr === TODAY;
                  const isSelected = selectedDate === dateStr && !isToday;
                  const hasSess    = inMonth && getDotCount(dateStr, sessions) > 0;
                  return (
                    <div key={dateStr} onClick={() => inMonth && selectCalDate(dateStr)}
                      style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "2px 0",
                        cursor: inMonth ? "pointer" : "default" }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: isToday ? C.green : "transparent",
                        border: isSelected ? `2px solid ${C.green}` : "2px solid transparent",
                        color: isToday ? "#fff" : inMonth ? C.text : "#ccc",
                        fontSize: 12, fontWeight: isToday || isSelected ? 700 : 400,
                        transition: "all .1s",
                      }}>{day}</div>
                      {hasSess && (
                        <span style={{ width: 4, height: 4, borderRadius: "50%",
                          background: isToday ? C.greenFaint : C.green, marginTop: 1 }} />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Log past session button */}
          <div style={{ padding: "0 20px 20px", marginTop: "auto" }}>
            <button onClick={() => setShowLogPast(true)} style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "9px 0", border: `1px solid ${C.border}`, borderRadius: 8,
              background: "transparent", fontSize: 12, color: C.muted, cursor: "pointer" }}>
              <Clock size={13} /> Log a past session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
