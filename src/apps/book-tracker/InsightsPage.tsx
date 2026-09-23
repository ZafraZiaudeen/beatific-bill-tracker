import { useState, useMemo } from "react";
import {
  BookOpen, Cloud, ChevronLeft, ChevronRight, ChevronDown,
  Calendar, Clock, TrendingUp, BarChart2, Target,
  Printer, Download, FileText, Copy, Edit3,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, Tooltip,
  CartesianGrid, ReferenceLine, LabelList,
} from "recharts";

// ── Tokens ─────────────────────────────────────────────────────
const C = {
  bg: "#F7F5F0",
  white: "#ffffff",
  green: "#2d4a3e",
  greenFaint: "#e8f0eb",
  border: "#e8e2d8",
  borderCard: "#ede8df",
  muted: "#8a8a8a",
  text: "#1a1a1a",
  shadow: "0 1px 4px rgba(0,0,0,.05), 0 2px 8px rgba(0,0,0,.04)",
  terra: "#c0634a",
  terraFaint: "#f8ece9",
} as const;


const card: React.CSSProperties = {
  background: C.white,
  borderRadius: 12,
  border: `1px solid ${C.borderCard}`,
  boxShadow: C.shadow,
  padding: "20px 22px",
};


const GENRE_COLORS: Record<string, string> = {
  "Sci-fi": "#2d4a3e",
  "Fantasy": "#5a8a7a",
  "Literary Fiction": "#c0634a",
  "Non-fiction": "#7a9a8a",
  "Mystery": "#8a6a5a",
  "Other": "#c8c0b0",
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
  pages: number;
  currentPage: number;
  coverFrom: string;
  coverTo: string;
  status: string;
  rating?: number;
  genre?: string;
}

const SEED_SESSIONS: Session[] = [];

const SEED_BOOKS: BookRef[] = [];

// ── Utilities ──────────────────────────────────────────────────
function durationToSec(dur: string): number {
  const p = dur.split(":").map(Number);
  return p.length === 3 ? p[0]*3600 + p[1]*60 + p[2] : p[0]*60 + (p[1] || 0);
}
function formatTime(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
function loadSessions(): Session[] {
  try { const d = JSON.parse(localStorage.getItem("bt_sessions") ?? "[]"); return d.length ? d : SEED_SESSIONS; }
  catch { return SEED_SESSIONS; }
}
function loadBooks(): BookRef[] {
  try {
    const d = JSON.parse(localStorage.getItem("bt_books") ?? "[]");
    if (d.length) return d.map((b: Record<string, unknown>) => ({
      id: Number(b.id), title: String(b.title ?? ""), author: String(b.author ?? ""),
      pages: Number(b.pages ?? 0), currentPage: Number(b.currentPage ?? 0),
      coverFrom: String(b.coverFrom ?? "#888"), coverTo: String(b.coverTo ?? "#444"),
      status: String(b.status ?? "Reading"),
      rating: Number(b.rating ?? 0),
      genre: Array.isArray(b.tags) && (b.tags as string[]).length ? String((b.tags as string[])[0]) : "Other",
    }));
  } catch {}
  return SEED_BOOKS;
}

const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTH_FULL  = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_SHORT   = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

// ── Small UI helpers ──────────────────────────────────────────
function SectionLabel({ children }: { children: string }) {
  return (
    <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: C.muted, marginBottom: 12 }}>
      {children}
    </div>
  );
}


// ── Custom Tooltip ─────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", fontSize: 12, boxShadow: C.shadow }}>
      {label && <div style={{ fontWeight: 600, marginBottom: 4, color: C.text }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, marginBottom: 2 }}>{p.name}: <strong>{p.value}</strong></div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  YEAR TAB
// ─────────────────────────────────────────────────────────────
function YearTab({ sessions, books }: { sessions: Session[]; books: BookRef[] }) {
  const [exportOpen, setExportOpen] = useState(false);
  const TODAY_MONTH = new Date().getMonth();
  const goalBooks = (() => {
    try { return Number(JSON.parse(localStorage.getItem("bt_settings") ?? "{}").yearlyGoal ?? 0); }
    catch { return 0; }
  })();

  const byMonth = useMemo(() => {
    const map: Record<number, { pages: number; sessions: number; secs: number }> = {};
    for (let i = 0; i < 12; i++) map[i] = { pages: 0, sessions: 0, secs: 0 };
    sessions.forEach(s => {
      const m = new Date(s.date).getMonth();
      map[m].pages += s.pages;
      map[m].sessions += 1;
      map[m].secs += durationToSec(s.duration);
    });
    return map;
  }, [sessions]);

  const { finishedMonthMap, monthlyBooks, cumBooksData, monthBooksBarData, pagesTimeData, totalPagesYear, totalHrsYear, booksPerMonth } = useMemo(() => {
    // Which month each finished book was completed
    const fmm: Record<string, number> = {};
    books.filter(b => b.status === "Finished").forEach(b => {
      const bs = sessions.filter(s => s.bookTitle === b.title);
      if (!bs.length) return;
      const lastDate = bs.map(s => s.date).sort().at(-1)!;
      fmm[b.title] = new Date(lastDate).getMonth();
    });

    // Count per month
    const mb = Array(12).fill(0) as number[];
    Object.values(fmm).forEach(m => mb[m]++);

    // Cumulative actuals Jan→TODAY_MONTH
    let cum = 0;
    const cumActual: (number | null)[] = mb.map((b, i) => {
      if (i > TODAY_MONTH) return null;
      cum += b;
      return cum;
    });

    // Projected slope
    const booksPerMonth = cum / (TODAY_MONTH + 1);
    const cbd = MONTH_SHORT.map((m, i) => ({
      month: m,
      current: i <= TODAY_MONTH ? cumActual[i] : null,
      projected: i >= TODAY_MONTH ? Math.min(goalBooks, Math.round(cum + booksPerMonth * (i - TODAY_MONTH))) : null,
    }));

    // Bar data: completed (past) + projected (future)
    const mbbd = MONTH_SHORT.map((m, i) => ({
      month: m,
      completed: i <= TODAY_MONTH ? mb[i] : 0,
      projected: i > TODAY_MONTH ? Math.round(booksPerMonth) : 0,
    }));

    // Cumulative pages + hours for dual-line chart
    let cumPg = 0, cumHr = 0;
    const ptd = MONTH_SHORT.slice(0, TODAY_MONTH + 1).map((m, i) => {
      cumPg += byMonth[i].pages;
      cumHr += byMonth[i].secs / 3600;
      return { month: m, pages: cumPg, hrs: Math.round(cumHr * 10) / 10 };
    });

    return { finishedMonthMap: fmm, monthlyBooks: mb, cumBooksData: cbd, monthBooksBarData: mbbd, pagesTimeData: ptd, totalPagesYear: cumPg, totalHrsYear: cumHr, booksPerMonth };
  }, [sessions, books, byMonth, goalBooks]);

  const projectedFinishLabel = (() => {
    if (booksPerMonth <= 0 || goalBooks <= 0) return null;
    const monthsNeeded = goalBooks / booksPerMonth;
    const d = new Date(new Date().getFullYear(), 0, 1);
    d.setMonth(d.getMonth() + Math.round(monthsNeeded));
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  })();

  const { genrePieData, totalGenreBooks, topGenreEntry } = useMemo(() => {
    const gbb: Record<string, number> = {};
    books.filter(b => b.status === "Finished").forEach(b => {
      const g = b.genre ?? "Other";
      gbb[g] = (gbb[g] ?? 0) + 1;
    });
    const gpd = Object.entries(gbb).map(([name, value]) => ({ name, value }));
    const tgb = gpd.reduce((a, b) => a + b.value, 0);
    const tge = [...gpd].sort((a, b) => b.value - a.value)[0] ?? { name: "—", value: 0 };
    return { genrePieData: gpd, totalGenreBooks: tgb, topGenreEntry: tge };
  }, [books]);

  const { weekdayGrid, maxCell } = useMemo(() => {
    const grid: number[][] = Array.from({ length: 7 }, () => Array(4).fill(0));
    sessions.forEach(s => {
      const d = new Date(s.date);
      const wd = (d.getDay() + 6) % 7;
      const q = Math.floor(d.getMonth() / 3);
      grid[wd][q] += durationToSec(s.duration) / 60;
    });
    const mc = Math.max(...grid.flat()) || 1;
    return { weekdayGrid: grid, maxCell: mc };
  }, [sessions]);

  const totalBooks = books.filter(b => b.status === "Finished").length;
  const totalSecs = sessions.reduce((a, s) => a + durationToSec(s.duration), 0);
  const totalPageCount = sessions.reduce((a, s) => a + s.pages, 0);

  // suppress unused warning — finishedMonthMap used for derivation only
  void finishedMonthMap;
  void monthlyBooks;
  void totalGenreBooks;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "0 28px 28px" }}>
      {/* Controls row — Export only */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10, flexShrink: 0 }}>
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setExportOpen(o => !o)}
            style={{ display: "flex", alignItems: "center", gap: 6, border: `1px solid ${C.border}`, background: C.white, color: "#555", padding: "6px 13px", borderRadius: 7, fontSize: 12.5, fontWeight: 500, cursor: "pointer" }}
          >
            <Download size={13} />
            Export report
            <ChevronDown size={12} />
          </button>
          {exportOpen && (
            <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, boxShadow: "0 4px 16px rgba(0,0,0,.1)", zIndex: 100, minWidth: 190, overflow: "hidden" }}>
              {[
                { icon: Printer, label: "Print-friendly report" },
                { icon: Download, label: "Export as PDF" },
                { icon: FileText, label: "Export as CSV" },
                { icon: Copy, label: "Copy summary" },
              ].map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  onClick={() => { alert("Coming soon"); setExportOpen(false); }}
                  style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 14px", width: "100%", background: "none", border: "none", fontSize: 13, color: C.text, cursor: "pointer", textAlign: "left" as const }}
                  onMouseEnter={e => (e.currentTarget.style.background = C.greenFaint)}
                  onMouseLeave={e => (e.currentTarget.style.background = "none")}
                >
                  <Icon size={13} style={{ color: C.muted }} />
                  {label}
                </button>
              ))}
              <div style={{ borderTop: `1px solid ${C.border}`, padding: "7px 14px", fontSize: 10.5, color: C.muted }}>Reports are generated locally</div>
            </div>
          )}
        </div>
      </div>

      {/* PACE PROJECTION — full width */}
      <div style={card}>
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 28, alignItems: "center" }}>
          {/* Left */}
          <div>
            <SectionLabel>Pace Projection</SectionLabel>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 6 }}>At your current rate, you'll reach</div>
            <div style={{ fontSize: 48, fontWeight: 700, letterSpacing: -2, color: goalBooks > 0 ? C.green : C.muted, lineHeight: 1 }}>{goalBooks > 0 ? `${goalBooks} books` : "—"}</div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 6, marginBottom: 16 }}>{goalBooks <= 0 ? "set a goal in Settings" : projectedFinishLabel ? `on ${projectedFinishLabel}` : "add sessions to project"}</div>
            <div style={{ display: "flex", gap: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: C.muted }}>
                <div style={{ width: 20, height: 2.5, background: C.green, borderRadius: 2 }} />
                Current pace
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: C.muted }}>
                <svg width={20} height={4}><line x1={0} y1={2} x2={20} y2={2} stroke={C.terra} strokeWidth={2.5} strokeDasharray="5 3" /></svg>
                Projected
              </div>
            </div>
          </div>
          {/* Right — LineChart */}
          <div style={{ height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cumBooksData} margin={{ top: 18, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 30]} tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} width={24} />
                <Tooltip content={<ChartTooltip />} />
                {projectedFinishLabel && <ReferenceLine x={projectedFinishLabel.slice(0, 3)} stroke={C.terra} strokeDasharray="4 2" label={{ value: `${projectedFinishLabel.slice(0, 6)} / ${goalBooks} books`, position: "top", fontSize: 9.5, fill: C.terra }} />}
                <Line type="monotone" dataKey="current" stroke={C.green} strokeWidth={2} dot={{ r: 4, fill: C.green, strokeWidth: 0 }} connectNulls={false} name="Current" />
                <Line type="monotone" dataKey="projected" stroke={C.terra} strokeWidth={2} dot={false} strokeDasharray="5 3" connectNulls={false} name="Projected" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Three-column row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1.7fr 1.3fr", gap: 14, alignItems: "start" }}>

        {/* Col 1: BOOKS FINISHED BY MONTH */}
        <div style={card}>
          <SectionLabel>Books Finished by Month</SectionLabel>
          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthBooksBarData} margin={{ top: 20, right: 8, bottom: 0, left: 0 }} barSize={14} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} width={18} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="completed" name="Completed" fill={C.green} radius={[3, 3, 0, 0]} stackId="a">
                  <LabelList dataKey="completed" position="top" style={{ fontSize: 10, fill: C.text, fontWeight: 700 }} formatter={(v: unknown) => (typeof v === 'number' && v > 0) ? v : ""} />
                </Bar>
                <Bar dataKey="projected" name="Projected" fill="#c8ddd5" radius={[3, 3, 0, 0]} stackId="b">
                  <LabelList dataKey="projected" position="top" style={{ fontSize: 10, fill: C.muted, fontWeight: 700 }} formatter={(v: unknown) => (typeof v === 'number' && v > 0) ? v : ""} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: C.muted }}>
              <div style={{ width: 9, height: 9, borderRadius: 2, background: C.green }} /> Completed
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: C.muted }}>
              <div style={{ width: 9, height: 9, borderRadius: 2, background: "#c8ddd5", border: `1px solid #a8c8c0` }} /> Projected
            </div>
          </div>
        </div>

        {/* Col 2: PAGES VS READING TIME */}
        <div style={card}>
          <SectionLabel>Pages vs Reading Time</SectionLabel>
          <div style={{ height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pagesTimeData} margin={{ top: 5, right: 18, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="pages" domain={[0, 10000]} tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} width={32} tickFormatter={v => v >= 1000 ? `${v/1000}K` : String(v)} />
                <YAxis yAxisId="hrs" orientation="right" domain={[0, 60]} tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} width={22} />
                <Tooltip content={<ChartTooltip />} />
                <Line yAxisId="pages" type="monotone" dataKey="pages" stroke={C.green} strokeWidth={2} dot={{ r: 4, fill: C.green, strokeWidth: 0 }} name="Pages" />
                <Line yAxisId="hrs" type="monotone" dataKey="hrs" stroke={C.terra} strokeWidth={2} dot={{ r: 4, fill: C.terra, strokeWidth: 0 }} name="Hrs" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{totalPagesYear.toLocaleString()}</div>
              <div style={{ fontSize: 10.5, color: C.muted }}>Pages read</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{formatTime(Math.round(totalHrsYear * 3600))}</div>
              <div style={{ fontSize: 10.5, color: C.muted }}>Reading time</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: C.muted }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.green }} /> Pages
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: C.muted }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.terra }} /> Reading time
            </div>
          </div>
        </div>

        {/* Col 3: GENRE BREAKDOWN */}
        <div style={card}>
          <SectionLabel>Genre Breakdown</SectionLabel>
          <div style={{ display: "flex", justifyContent: "center", position: "relative" }}>
            <div style={{ width: 150, height: 150 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={genrePieData} cx="50%" cy="50%" innerRadius={42} outerRadius={65} dataKey="value" paddingAngle={2}>
                    {genrePieData.map((entry, i) => (
                      <Cell key={i} fill={GENRE_COLORS[entry.name] ?? "#aaa"} />
                    ))}
                  </Pie>
                  <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 9, fill: C.muted }}>% of</text>
                  <text x="50%" y="57%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 9, fill: C.muted }}>books</text>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          {topGenreEntry && (
            <div style={{ textAlign: "center" as const, fontSize: 11.5, color: C.muted, marginTop: 6 }}>
              Top genre: <strong style={{ color: C.text }}>{topGenreEntry.name}</strong> / {topGenreEntry.value} books
            </div>
          )}
        </div>
      </div>

      {/* Two-column row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 14, alignItems: "start" }}>

        {/* Col 1: WEEKDAY READING RHYTHM */}
        <div style={card}>
          <SectionLabel>Weekday Reading Rhythm</SectionLabel>
          {/* Day headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 10 }}>
            {DAY_SHORT.map(d => (
              <div key={d} style={{ textAlign: "center" as const, fontSize: 10, color: C.muted }}>{d}</div>
            ))}
          </div>
          {/* 4 rows of dots (Q3 on top, Q0 on bottom) */}
          {[3, 2, 1, 0].map(q => (
            <div key={q} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 8 }}>
              {DAY_SHORT.map((_, wd) => {
                const val = weekdayGrid[wd][q];
                const ratio = val / maxCell;
                const size = Math.max(6, Math.round(ratio * 24));
                const alpha = 0.12 + ratio * 0.78;
                return (
                  <div key={wd} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: size, height: size, borderRadius: "50%", background: `rgba(45,74,62,${alpha})` }} />
                  </div>
                );
              })}
            </div>
          ))}
          {/* Legend */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            <span style={{ fontSize: 10, color: C.muted }}>Less time ←</span>
            <span style={{ fontSize: 10, color: C.muted }}>→ More time</span>
          </div>
        </div>

        {/* Col 2: YOUR READING PROFILE */}
        <div style={card}>
          <SectionLabel>Your Reading Profile</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 8 }}>
            {([
              { icon: BookOpen,  label: "Books Finished",     value: String(totalBooks),             delta: "" },
              { icon: Clock,     label: "Reading Time",        value: formatTime(totalSecs),           delta: "" },
              { icon: BarChart2, label: "Pages Read",          value: totalPageCount.toLocaleString(), delta: "" },
            ] as { icon: React.ElementType; label: string; value: string; delta: string }[]).map(({ icon: Icon, label, value, delta }) => (
              <div key={label} style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", textAlign: "center" as const, gap: 5, padding: "14px 8px" }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: C.greenFaint, display: "flex", alignItems: "center", justifyContent: "center", color: C.green, flexShrink: 0 }}>
                  <Icon size={15} strokeWidth={1.8} />
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: C.text, lineHeight: 1, letterSpacing: -0.5 }}>{value}</div>
                <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: C.muted }}>{label}</div>
                {delta && <div style={{ fontSize: 11, color: "#3d9e5f" }}>↑ {delta}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center" as const, fontSize: 11.5, color: C.muted, paddingTop: 2 }}>
        All data stored only on this device.
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  MONTH TAB
// ─────────────────────────────────────────────────────────────
function MonthTab({ sessions, books }: { sessions: Session[]; books: BookRef[] }) {
  const [year, setYear]   = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth());

  const go = (delta: number) => {
    let m = month + delta;
    let y = year;
    if (m > 11) { m = 0; y++; }
    if (m < 0)  { m = 11; y--; }
    setMonth(m);
    setYear(y);
  };

  const monthSessions = useMemo(() =>
    sessions.filter(s => {
      const d = new Date(s.date);
      return d.getFullYear() === year && d.getMonth() === month;
    }),
    [sessions, year, month]
  );

  const daysInMonth    = new Date(year, month + 1, 0).getDate();
  const prevMonthDays  = new Date(year, month, 0).getDate();
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7; // 0=Mon

  const sessionByDay: Record<number, number> = {};
  monthSessions.forEach(s => {
    const day = new Date(s.date).getDate();
    sessionByDay[day] = (sessionByDay[day] ?? 0) + s.pages;
  });

  const totalPages = monthSessions.reduce((a, s) => a + s.pages, 0);
  const totalSecs  = monthSessions.reduce((a, s) => a + durationToSec(s.duration), 0);
  const pph        = totalSecs > 0 ? Math.round(totalPages / (totalSecs / 3600)) : 0;

  const booksFinished = books.filter(b => {
    if (b.status !== "Finished") return false;
    return monthSessions.some(s => s.bookTitle === b.title);
  });

  // Sessions by week
  const weeksInMonth = Math.ceil((firstDayOfWeek + daysInMonth) / 7);
  const weekData: { week: string; sessions: number }[] = [];
  for (let w = 0; w < weeksInMonth; w++) {
    const startDay = w * 7 - firstDayOfWeek + 1;
    const endDay   = Math.min(startDay + 6, daysInMonth);
    const s1       = Math.max(1, startDay);
    const label    = s1 === endDay ? `${MONTH_SHORT[month]} ${s1}` : `${MONTH_SHORT[month]} ${s1}–${endDay}`;
    const count    = monthSessions.filter(s => {
      const d = new Date(s.date).getDate();
      return d >= s1 && d <= endDay;
    }).length;
    weekData.push({ week: label, sessions: count });
  }

  const reflKey = `bt_reflections_${year}_${month}`;
  const [reflection, setReflection] = useState(() => {
    try { return localStorage.getItem(reflKey) ?? ""; } catch { return ""; }
  });
  const saveReflection = (v: string) => {
    setReflection(v);
    try { localStorage.setItem(reflKey, v); } catch {}
  };

  const topMood = useMemo(() => {
    const mc: Record<string, { count: number; color: string }> = {};
    monthSessions.forEach(s => {
      mc[s.mood] = { count: (mc[s.mood]?.count ?? 0) + 1, color: s.moodColor };
    });
    const top = Object.entries(mc).sort((a, b) => b[1].count - a[1].count)[0];
    return top ? { mood: top[0], color: top[1].color } : null;
  }, [monthSessions]);

  const _today = new Date(); const todayYear = _today.getFullYear(); const todayMonth = _today.getMonth(); const todayDate = _today.getDate();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "0 28px 28px" }}>

      {/* Month navigator pill */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 16px" }}>
          <button onClick={() => go(-1)} style={{ background: "none", border: "none", cursor: "pointer", color: "#777", padding: 0, display: "flex", alignItems: "center" }}>
            <ChevronLeft size={16} />
          </button>
          <Calendar size={14} style={{ color: C.green }} />
          <span style={{ fontSize: 13.5, fontWeight: 500, color: C.text, minWidth: 120, textAlign: "center" as const }}>
            {MONTH_FULL[month]} {year}
          </span>
          <button onClick={() => go(1)} style={{ background: "none", border: "none", cursor: "pointer", color: "#777", padding: 0, display: "flex", alignItems: "center" }}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {([
          { icon: BookOpen,   label: "Books Finished", value: String(booksFinished.length), sub: "books"         },
          { icon: FileText,   label: "Pages",           value: totalPages.toLocaleString(),  sub: "pages"         },
          { icon: Clock,      label: "Reading Time",    value: formatTime(totalSecs),         sub: "total time"   },
          { icon: TrendingUp, label: "Pages Per Hour",  value: pph > 0 ? String(pph) : "—",  sub: "pages / hour" },
        ] as { icon: React.ElementType; label: string; value: string; sub: string }[]).map(({ icon: Icon, label, value, sub }) => (
          <div key={label} style={{ background: C.white, border: `1px solid ${C.borderCard}`, borderRadius: 12, boxShadow: C.shadow, padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.greenFaint, display: "flex", alignItems: "center", justifyContent: "center", color: C.green, flexShrink: 0 }}>
                <Icon size={15} strokeWidth={1.8} />
              </div>
              <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: C.muted }}>{label}</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5, color: C.text, lineHeight: 1.1 }}>{value}</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Calendar + Books */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

        {/* Calendar */}
        <div style={{ background: C.white, border: `1px solid ${C.borderCard}`, borderRadius: 12, boxShadow: C.shadow, padding: "20px 22px" }}>
          <SectionLabel>Monthly Reading Calendar</SectionLabel>
          {/* Day headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 6 }}>
            {DAY_SHORT.map(d => (
              <div key={d} style={{ textAlign: "center" as const, fontSize: 11, fontWeight: 500, color: C.muted }}>{d}</div>
            ))}
          </div>
          {/* Rows */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", rowGap: 2 }}>
            {/* Prev month tail */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`p${i}`} style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 4, padding: "4px 0" }}>
                <span style={{ fontSize: 12, color: "#ccc" }}>{prevMonthDays - firstDayOfWeek + i + 1}</span>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "transparent" }} />
              </div>
            ))}
            {/* This month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day     = i + 1;
              const hasRead = (sessionByDay[day] ?? 0) > 0;
              const isToday = year === todayYear && month === todayMonth && day === todayDate;
              const isPast  = year < todayYear || (year === todayYear && (month < todayMonth || (month === todayMonth && day <= todayDate)));
              const dotBg   = hasRead ? C.green : isPast ? "#d8d4cc" : "#eceae5";
              return (
                <div key={day} style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 4, padding: "4px 0" }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: "50%",
                    background: isToday ? C.green : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ fontSize: 12, lineHeight: 1, color: isToday ? "#fff" : C.text, fontWeight: isToday ? 700 : 400 }}>{day}</span>
                  </div>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: dotBg }} />
                </div>
              );
            })}
          </div>
          {/* Legend */}
          <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 11.5, color: C.muted }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.green }} /> Read
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#d8d4cc" }} /> Planned
            </div>
          </div>
        </div>

        {/* Books Finished */}
        <div style={{ background: C.white, border: `1px solid ${C.borderCard}`, borderRadius: 12, boxShadow: C.shadow, padding: "20px 22px" }}>
          <SectionLabel>Books Finished This Month</SectionLabel>
          {booksFinished.length === 0 ? (
            <div style={{ fontSize: 13, color: C.muted, paddingTop: 4 }}>No books finished this month.</div>
          ) : (
            <div>
              {booksFinished.map((b, i) => {
                const rating = b.rating ?? 0;
                return (
                  <div key={b.id}>
                    {i > 0 && <hr style={{ border: "none", borderTop: `1px solid ${C.border}`, margin: "14px 0" }} />}
                    <div style={{ display: "flex", gap: 14 }}>
                      <div style={{ width: 54, height: 78, borderRadius: 6, flexShrink: 0, background: `linear-gradient(155deg, ${b.coverFrom} 0%, ${b.coverTo} 100%)`, boxShadow: "2px 3px 8px rgba(0,0,0,.22)" }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 700, lineHeight: 1.3, marginBottom: 2, color: C.text }}>{b.title}</div>
                        <div style={{ fontSize: 12, color: C.muted, marginBottom: 2 }}>{b.author}</div>
                        <div style={{ fontSize: 11.5, color: C.muted, marginBottom: 8 }}>{b.genre ?? "Other"} · {b.pages} pages</div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", gap: 1 }}>
                            {[1,2,3,4,5].map(s => (
                              <span key={s} style={{ fontSize: 14, color: s <= Math.round(rating) ? "#f5b742" : "#ddd", lineHeight: 1 }}>★</span>
                            ))}
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 600, color: C.muted }}>{rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Sessions by week + Reflection */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: C.white, border: `1px solid ${C.borderCard}`, borderRadius: 12, boxShadow: C.shadow, padding: "20px 22px" }}>
          <SectionLabel>Reading Sessions by Week</SectionLabel>
          <div style={{ height: 195 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekData} margin={{ top: 24, right: 8, bottom: 0, left: 0 }} barSize={38}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} width={20} />
                <Bar dataKey="sessions" name="Sessions" fill={C.green} radius={[5, 5, 0, 0]}>
                  <LabelList dataKey="sessions" position="top" style={{ fontSize: 11, fill: C.text, fontWeight: 700 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ background: C.white, border: `1px solid ${C.borderCard}`, borderRadius: 12, boxShadow: C.shadow, padding: "20px 22px" }}>
          <SectionLabel>Month Reflection</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1px 1fr", alignItems: "start", minHeight: 160 }}>
            {/* Sentence */}
            <div style={{ paddingRight: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <Edit3 size={12} style={{ color: "#6a8a7a" }} />
                <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#6a8a7a" }}>
                  Your {MONTH_FULL[month]} in a sentence
                </span>
              </div>
              <textarea
                value={reflection}
                onChange={e => saveReflection(e.target.value)}
                placeholder="How was your reading this month?"
                style={{ width: "100%", border: "none", background: "none", fontSize: 16, fontStyle: "italic", lineHeight: 1.6, fontFamily: "'Lora', Georgia, serif", color: C.text, resize: "none", outline: "none", minHeight: 90, boxSizing: "border-box", padding: 0 }}
              />
            </div>
            {/* Divider */}
            <div style={{ background: C.border, alignSelf: "stretch" }} />
            {/* Top mood */}
            <div style={{ paddingLeft: 20, display: "flex", flexDirection: "column" as const, alignItems: "center", textAlign: "center" as const, gap: 7, paddingTop: 4 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: C.bg, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                🙂
              </div>
              <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: C.muted }}>Top Mood</span>
              {topMood ? (
                <>
                  <span style={{ fontSize: 22, fontWeight: 700, color: C.text, textTransform: "capitalize" as const, lineHeight: 1.1 }}>{topMood.mood}</span>
                  <span style={{ fontSize: 11, color: C.muted, lineHeight: 1.4 }}>Most common mood this month</span>
                </>
              ) : (
                <span style={{ fontSize: 12, color: C.muted }}>Log sessions to see your mood</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center" as const, fontSize: 11.5, color: C.muted, paddingTop: 2 }}>
        All data stored only on this device.
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  PACE TAB
// ─────────────────────────────────────────────────────────────
function PaceTab({ sessions }: { sessions: Session[] }) {
  const goalBooks = (() => {
    try { return Number(JSON.parse(localStorage.getItem("bt_settings") ?? "{}").yearlyGoal ?? 0); }
    catch { return 0; }
  })();
  const totalSecs  = sessions.reduce((a, s) => a + durationToSec(s.duration), 0);
  const totalPages = sessions.reduce((a, s) => a + s.pages, 0);
  const pph        = totalSecs > 0 ? Math.round(totalPages / (totalSecs / 3600)) : 0;
  const avgSession = sessions.length > 0 ? Math.round(totalSecs / sessions.length / 60) : 0;
  const avgPages   = sessions.length > 0 ? Math.round(totalPages / sessions.length) : 0;

  // Pace by book
  const bookPace: Record<string, { pages: number; secs: number }> = {};
  sessions.forEach(s => {
    const t = s.bookTitle ?? "Unknown";
    bookPace[t] = bookPace[t] ?? { pages: 0, secs: 0 };
    bookPace[t].pages += s.pages;
    bookPace[t].secs  += durationToSec(s.duration);
  });
  const paceByBook = Object.entries(bookPace)
    .map(([title, { pages, secs }]) => ({ title, pph: secs > 0 ? Math.round(pages / (secs / 3600)) : 0 }))
    .sort((a, b) => b.pph - a.pph);
  const maxPPH = paceByBook[0]?.pph ?? 1;

  // Monthly avg pages per session for bar chart
  const monthAvgData = MONTH_SHORT.map((m, i) => {
    const ms = sessions.filter(s => new Date(s.date).getMonth() === i);
    const ap = ms.length > 0 ? Math.round(ms.reduce((a, s) => a + s.pages, 0) / ms.length) : 0;
    return { month: m, pages: ap };
  });

  // Pace line chart — monthly pph
  const paceLine = MONTH_SHORT.map((m, i) => {
    const ms = sessions.filter(s => new Date(s.date).getMonth() === i);
    const pps = ms.reduce((a, s) => a + durationToSec(s.duration), 0);
    const pgs = ms.reduce((a, s) => a + s.pages, 0);
    return { month: m, pace: pps > 0 ? Math.round(pgs / (pps / 3600)) : 0, goal: 65 };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "0 28px 28px" }}>
      {/* Pace card */}
      <div style={card}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24, alignItems: "center" }}>
          <div>
            <SectionLabel>Your Reading Pace</SectionLabel>
            <div style={{ fontSize: 48, fontWeight: 700, letterSpacing: -2, color: C.green, lineHeight: 1 }}>{pph}</div>
            <div style={{ fontSize: 14, color: C.muted, marginBottom: 10 }}>pages per hour</div>
            <div style={{ fontSize: 12.5, color: "#555", lineHeight: 1.55 }}>
              Based on {sessions.length} session{sessions.length !== 1 ? "s" : ""}. {sessions.length > 0 ? <>At this pace you&apos;ll finish your <strong>{goalBooks}-book</strong> goal for the year.</> : "Log sessions to see your projected finish date."}
            </div>
            <div style={{ display: "flex", gap: 14, marginTop: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: C.muted }}>
                <div style={{ width: 14, height: 2.5, background: C.green, borderRadius: 2 }} /> Current
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: C.muted }}>
                <div style={{ width: 14, height: 2.5, background: C.terra, borderRadius: 2 }} /> Goal pace
              </div>
            </div>
          </div>
          <div style={{ height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={paceLine} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} width={28} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="pace" stroke={C.green} strokeWidth={2.5} dot={{ r: 3, fill: C.green }} name="Pages/hr" />
                <Line type="monotone" dataKey="goal" stroke={C.terra} strokeWidth={2} dot={false} strokeDasharray="5 3" name="Goal" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3 columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 14 }}>
        {/* Avg pages/session */}
        <div style={card}>
          <SectionLabel>Average Pages Per Session</SectionLabel>
          <div style={{ height: 150 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthAvgData} margin={{ top: 16, right: 8, bottom: 0, left: 0 }} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} width={24} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="pages" name="Pages" fill={C.green} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Session length tile */}
        <div style={{ ...card, display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", gap: 8, minWidth: 160, textAlign: "center" as const }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: C.greenFaint, display: "flex", alignItems: "center", justifyContent: "center", color: C.green }}>
            <Clock size={20} strokeWidth={1.8} />
          </div>
          <SectionLabel>Avg Session Length</SectionLabel>
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.8, color: C.text, lineHeight: 1 }}>{avgSession}</div>
          <div style={{ fontSize: 12.5, color: C.muted }}>minutes per session</div>
          <div style={{ fontSize: 11.5, color: "#3d9e5f", fontWeight: 600 }}>↑ +12m vs last year</div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>Avg {avgPages} pages/session</div>
        </div>

        {/* Pace by book */}
        <div style={card}>
          <SectionLabel>Pace by Book</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
            {paceByBook.slice(0, 5).map(({ title, pph: p }) => (
              <div key={title}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 11.5, color: C.text, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const, marginRight: 8 }}>{title}</span>
                  <span style={{ fontSize: 11, color: C.muted, flexShrink: 0 }}>{p} pg/hr</span>
                </div>
                <div style={{ height: 5, background: C.bg, borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(p / maxPPH) * 100}%`, background: C.green, borderRadius: 99 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div style={{ ...card, background: "#eef6f1", border: `1px solid #c8ddd5` }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div style={{ width: 38, height: 38, borderRadius: 9, background: C.white, border: `1px solid #b8d5c5`, display: "flex", alignItems: "center", justifyContent: "center", color: C.green, flexShrink: 0 }}>
            <Target size={18} strokeWidth={1.8} />
          </div>
          <div>
            <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#4a7a5a", marginBottom: 5 }}>Recommendation</div>
            <div style={{ fontSize: 14.5, fontWeight: 600, color: C.text, marginBottom: 5 }}>
              Keep your current pace to hit your yearly goal by <strong style={{ color: C.green }}>September 14</strong>.
            </div>
            <div style={{ fontSize: 12.5, color: "#4a6a54", lineHeight: 1.55 }}>
              You're reading at {pph} pages/hour across {sessions.length} sessions. That puts you <strong>2 books ahead of pace</strong>.
              Consider logging sessions on Wednesdays — your lightest weekday — to maintain your streak.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export default function InsightsPage() {
  const [tab, setTab]         = useState<"year" | "month" | "pace">("year");
  const [sessions]            = useState<Session[]>(() => loadSessions());
  const [books]               = useState<BookRef[]>(() => loadBooks());

  const tabs: { id: "year" | "month" | "pace"; label: string }[] = [
    { id: "year",  label: "Year"  },
    { id: "month", label: "Month" },
    { id: "pace",  label: "Pace"  },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: C.bg }}>
      {/* Header */}
      <div style={{ flexShrink: 0 }}>
        <div style={{ padding: "14px 24px 0", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 22, height: 22, background: C.green, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <BookOpen size={12} stroke="white" strokeWidth={2.2} />
          </div>
          <span style={{ fontSize: 13, color: C.muted }}>Library</span>
          <span style={{ fontSize: 13, color: C.muted }}>/</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Insights</span>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Cloud size={13} style={{ color: "#aaa" }} />
            <div>
              <div style={{ fontWeight: 600, color: "#555", fontSize: 11.5 }}>Save locally</div>
              <div style={{ fontSize: 11, color: C.muted }}>Just now</div>
            </div>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#3d9e5f", marginLeft: 3 }} />
          </div>
        </div>
        <div style={{ padding: "8px 24px 4px" }}>
          <h1 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 32, fontWeight: 400, color: "#1a1a1a", letterSpacing: -0.3, margin: 0 }}>
            Read the shape of your year
          </h1>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 0, padding: "0 24px", borderBottom: `1px solid ${C.border}` }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: "10px 18px",
                background: "none",
                border: "none",
                borderBottom: tab === t.id ? `2px solid ${C.green}` : "2px solid transparent",
                marginBottom: -1,
                fontSize: 13.5,
                fontWeight: tab === t.id ? 600 : 400,
                color: tab === t.id ? C.green : C.muted,
                cursor: "pointer",
                transition: "color .15s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", paddingTop: 16 }}>
        {tab === "year"  && <YearTab  sessions={sessions} books={books} />}
        {tab === "month" && <MonthTab sessions={sessions} books={books} />}
        {tab === "pace"  && <PaceTab  sessions={sessions} />}
      </div>
    </div>
  );
}
