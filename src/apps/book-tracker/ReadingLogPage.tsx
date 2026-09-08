import { useState } from "react";
import { BookOpen, Clock, ChevronLeft, ChevronRight, Play, Cloud, Gauge } from "lucide-react";

const C = {
  bg: "#f4efe6",
  white: "#ffffff",
  green: "#2d4a3e",
  greenFaint: "#e8f0eb",
  border: "#e8e2d8",
  muted: "#8a8a8a",
  text: "#1a1a1a",
  shadow: "0 1px 4px rgba(0,0,0,.05), 0 2px 8px rgba(0,0,0,.04)",
} as const;

const SERIF = { fontFamily: "'Lora', Georgia, 'Times New Roman', serif" } as const;

interface Session {
  id: number;
  date: string;
  pages: number;
  duration: string;
  rangeStart: number;
  rangeEnd: number;
  mood: string;
  moodColor: string;
}

const SESSIONS: Session[] = [
  // Visible in screenshot list (most-recent first)
  { id: 1,  date: "2026-05-14", pages: 24, duration: "24:18", rangeStart: 187, rangeEnd: 211, mood: "thoughtful", moodColor: "#9b59b6" },
  { id: 2,  date: "2026-05-13", pages: 28, duration: "31:42", rangeStart: 156, rangeEnd: 187, mood: "strange",    moodColor: "#3498db" },
  { id: 3,  date: "2026-05-12", pages: 36, duration: "28:05", rangeStart: 120, rangeEnd: 156, mood: "slow burn",  moodColor: "#e67e22" },
  { id: 4,  date: "2026-05-11", pages: 37, duration: "26:40", rangeStart: 83,  rangeEnd: 120, mood: "thoughtful", moodColor: "#9b59b6" },
  { id: 5,  date: "2026-05-10", pages: 35, duration: "22:31", rangeStart: 1,   rangeEnd: 83,  mood: "curious",   moodColor: "#2980b9" },
  { id: 6,  date: "2026-05-09", pages: 30, duration: "26:00", rangeStart: 240, rangeEnd: 270, mood: "focused",   moodColor: "#27ae60" },
  { id: 7,  date: "2026-05-08", pages: 25, duration: "22:15", rangeStart: 215, rangeEnd: 240, mood: "curious",   moodColor: "#2980b9" },
  { id: 8,  date: "2026-05-15", pages: 22, duration: "19:50", rangeStart: 211, rangeEnd: 233, mood: "focused",   moodColor: "#27ae60" },
  { id: 9,  date: "2026-05-16", pages: 28, duration: "25:20", rangeStart: 233, rangeEnd: 261, mood: "strange",   moodColor: "#3498db" },
  { id: 10, date: "2026-05-17", pages: 20, duration: "18:10", rangeStart: 261, rangeEnd: 281, mood: "curious",   moodColor: "#2980b9" },
  { id: 11, date: "2026-05-18", pages: 23, duration: "20:40", rangeStart: 281, rangeEnd: 304, mood: "thoughtful", moodColor: "#9b59b6" },
  { id: 12, date: "2026-05-18", pages: 18, duration: "16:30", rangeStart: 1,   rangeEnd: 19,  mood: "excited",   moodColor: "#e74c3c" },
  { id: 13, date: "2026-05-18", pages: 30, duration: "27:00", rangeStart: 19,  rangeEnd: 49,  mood: "slow burn", moodColor: "#e67e22" },
  { id: 14, date: "2026-05-19", pages: 35, duration: "31:15", rangeStart: 49,  rangeEnd: 84,  mood: "focused",   moodColor: "#27ae60" },
  { id: 15, date: "2026-05-19", pages: 29, duration: "26:40", rangeStart: 84,  rangeEnd: 113, mood: "thoughtful", moodColor: "#9b59b6" },
  { id: 16, date: "2026-05-19", pages: 27, duration: "24:00", rangeStart: 113, rangeEnd: 140, mood: "curious",   moodColor: "#2980b9" },
  { id: 17, date: "2026-05-20", pages: 32, duration: "28:30", rangeStart: 140, rangeEnd: 172, mood: "strange",   moodColor: "#3498db" },
  { id: 18, date: "2026-05-20", pages: 24, duration: "21:45", rangeStart: 172, rangeEnd: 196, mood: "slow burn", moodColor: "#e67e22" },
  { id: 19, date: "2026-05-21", pages: 30, duration: "27:10", rangeStart: 196, rangeEnd: 226, mood: "excited",   moodColor: "#e74c3c" },
  { id: 20, date: "2026-05-21", pages: 26, duration: "23:20", rangeStart: 226, rangeEnd: 252, mood: "thoughtful", moodColor: "#9b59b6" },
  { id: 21, date: "2026-05-22", pages: 22, duration: "19:55", rangeStart: 252, rangeEnd: 274, mood: "focused",   moodColor: "#27ae60" },
  { id: 22, date: "2026-05-22", pages: 30, duration: "27:30", rangeStart: 274, rangeEnd: 304, mood: "curious",   moodColor: "#2980b9" },
  { id: 23, date: "2026-05-23", pages: 28, duration: "25:00", rangeStart: 1,   rangeEnd: 29,  mood: "slow burn", moodColor: "#e67e22" },
  { id: 24, date: "2026-05-23", pages: 34, duration: "30:15", rangeStart: 29,  rangeEnd: 63,  mood: "thoughtful", moodColor: "#9b59b6" },
  { id: 25, date: "2026-05-23", pages: 31, duration: "28:00", rangeStart: 63,  rangeEnd: 94,  mood: "strange",   moodColor: "#3498db" },
  { id: 26, date: "2026-05-24", pages: 26, duration: "23:40", rangeStart: 94,  rangeEnd: 120, mood: "curious",   moodColor: "#2980b9" },
  { id: 27, date: "2026-05-25", pages: 33, duration: "29:50", rangeStart: 120, rangeEnd: 153, mood: "focused",   moodColor: "#27ae60" },
  { id: 28, date: "2026-05-26", pages: 28, duration: "25:10", rangeStart: 153, rangeEnd: 181, mood: "excited",   moodColor: "#e74c3c" },
  { id: 29, date: "2026-05-27", pages: 25, duration: "22:40", rangeStart: 181, rangeEnd: 206, mood: "thoughtful", moodColor: "#9b59b6" },
  { id: 30, date: "2026-05-27", pages: 30, duration: "27:20", rangeStart: 206, rangeEnd: 236, mood: "slow burn", moodColor: "#e67e22" },
  { id: 31, date: "2026-05-28", pages: 22, duration: "19:30", rangeStart: 236, rangeEnd: 258, mood: "curious",   moodColor: "#2980b9" },
  { id: 32, date: "2026-05-28", pages: 27, duration: "24:15", rangeStart: 258, rangeEnd: 285, mood: "strange",   moodColor: "#3498db" },
  { id: 33, date: "2026-05-28", pages: 19, duration: "17:00", rangeStart: 285, rangeEnd: 304, mood: "focused",   moodColor: "#27ae60" },
  { id: 34, date: "2026-05-29", pages: 35, duration: "31:40", rangeStart: 1,   rangeEnd: 36,  mood: "excited",   moodColor: "#e74c3c" },
  { id: 35, date: "2026-05-30", pages: 28, duration: "25:30", rangeStart: 36,  rangeEnd: 64,  mood: "thoughtful", moodColor: "#9b59b6" },
  { id: 36, date: "2026-04-30", pages: 24, duration: "21:20", rangeStart: 120, rangeEnd: 144, mood: "curious",   moodColor: "#2980b9" },
  { id: 37, date: "2026-04-29", pages: 30, duration: "27:00", rangeStart: 90,  rangeEnd: 120, mood: "slow burn", moodColor: "#e67e22" },
  { id: 38, date: "2026-04-28", pages: 27, duration: "24:10", rangeStart: 63,  rangeEnd: 90,  mood: "thoughtful", moodColor: "#9b59b6" },
];

const BOOK = {
  title: "The Left Hand of Darkness",
  author: "Ursula K. Le Guin",
  series: "Book 5 of the Hainish Cycle",
  coverFrom: "#1c2e4a",
  coverTo: "#0a1520",
};

const TODAY = "2026-05-14";
// Base: Monday May 11, 2026
const BASE = new Date("2026-05-11T00:00:00");

function isoDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getStripDays(startOffset: number) {
  return Array.from({ length: 19 }, (_, i) => {
    const d = addDays(BASE, startOffset + i);
    return { dateStr: isoDate(d), dayName: DAY_NAMES[d.getDay()].toUpperCase(), dayNum: d.getDate(), month: MONTH_SHORT[d.getMonth()] };
  });
}

function getDotCount(dateStr: string): number {
  return Math.min(3, SESSIONS.filter(s => s.date === dateStr).length);
}

function getCalendarGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  // Adjust so week starts Monday (0=Mon,6=Sun)
  const dow = first.getDay(); // 0=Sun,1=Mon,...
  const adjustedDow = dow === 0 ? 6 : dow - 1;
  const firstMonday = addDays(first, -adjustedDow);
  const rows: Array<Array<{ dateStr: string; day: number; inMonth: boolean }>> = [];
  for (let w = 0; w < 6; w++) {
    const row = Array.from({ length: 7 }, (_, d) => {
      const cell = addDays(firstMonday, w * 7 + d);
      return { dateStr: isoDate(cell), day: cell.getDate(), inMonth: cell.getMonth() === month };
    });
    if (row.some(c => c.inMonth)) rows.push(row);
  }
  return rows;
}

function formatMonthDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`;
}

function dayName(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return DAY_NAMES[d.getDay()];
}

export default function ReadingLogPage() {
  const [stripStart, setStripStart] = useState(0);
  const [calMonth, setCalMonth] = useState({ year: 2026, month: 4 }); // month 4 = May

  const stripDays = getStripDays(stripStart);
  const calGrid = getCalendarGrid(calMonth.year, calMonth.month);
  const calLabel = `${MONTH_NAMES[calMonth.month].toUpperCase()} ${calMonth.year}`;

  function prevMonth() {
    setCalMonth(({ year, month }) => month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 });
  }
  function nextMonth() {
    setCalMonth(({ year, month }) => month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 });
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: C.bg }}>

      {/* ── Header ── */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "20px 28px 14px", flexShrink: 0, display: "flex", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <BookOpen size={20} color={C.green} strokeWidth={2} />
            <h2 style={{ ...SERIF, fontSize: 26, fontWeight: 400, color: C.text, margin: 0 }}>Reading log</h2>
          </div>
          <div style={{ fontSize: 12, color: C.muted }}>38 sessions · 46h 20m</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.muted, paddingTop: 4 }}>
          <Cloud size={13} color={C.green} />
          <span>Save locally</span>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.green, display: "inline-block" }} />
          <span style={{ color: "#aaa" }}>Just now</span>
        </div>
      </div>

      {/* ── Date strip ── */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "10px 12px", flexShrink: 0, display: "flex", alignItems: "center", gap: 2 }}>
        <button onClick={() => setStripStart(s => s - 7)} style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", color: C.muted, cursor: "pointer", borderRadius: 6, flexShrink: 0 }}>
          <ChevronLeft size={16} />
        </button>

        <div style={{ flex: 1, display: "flex", gap: 0 }}>
          {stripDays.map(({ dateStr, dayName: dn, dayNum }) => {
            const isToday = dateStr === TODAY;
            const dots = getDotCount(dateStr);
            return (
              <div key={dateStr} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "2px 0" }}>
                <span style={{ fontSize: 8.5, fontWeight: 600, letterSpacing: "0.05em", color: C.muted }}>{dn}</span>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: isToday ? C.green : "transparent",
                  color: isToday ? "#fff" : C.text,
                  fontSize: 12.5, fontWeight: isToday ? 700 : 400,
                }}>
                  {dayNum}
                </div>
                <div style={{ display: "flex", gap: 2, height: 6, alignItems: "center" }}>
                  {Array.from({ length: dots }, (_, i) => (
                    <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: C.green, display: "inline-block" }} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={() => setStripStart(s => s + 7)} style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", color: C.muted, cursor: "pointer", borderRadius: 6, flexShrink: 0 }}>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* ── Main (list + sidebar) ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Session list */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Column headers */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "108px 1fr 80px 92px 132px 120px",
            padding: "8px 28px",
            borderBottom: `1px solid ${C.border}`,
            background: C.white,
            flexShrink: 0,
          }}>
            {["DATE", "BOOK", "PAGES", "DURATION", "RANGE", "MOOD"].map(h => (
              <div key={h} style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", color: C.muted }}>{h}</div>
            ))}
          </div>

          {/* Rows */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {SESSIONS.slice(0, 5).map(s => (
              <div key={s.id} style={{
                display: "grid",
                gridTemplateColumns: "108px 1fr 80px 92px 132px 120px",
                padding: "16px 28px",
                borderBottom: `1px solid ${C.border}`,
                background: C.white,
                alignItems: "center",
              }}>
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
                  {/* Cover thumbnail */}
                  <div style={{
                    width: 46, height: 68, borderRadius: 4, flexShrink: 0,
                    background: `linear-gradient(155deg, ${BOOK.coverFrom} 0%, ${BOOK.coverTo} 100%)`,
                    position: "relative", overflow: "hidden",
                    boxShadow: "1px 2px 6px rgba(0,0,0,.25)",
                  }}>
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: "linear-gradient(to right, rgba(0,0,0,.28), transparent)" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text, lineHeight: 1.3 }}>{BOOK.title}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{BOOK.author}</div>
                    <div style={{ fontSize: 11, color: C.muted, fontStyle: "italic", marginTop: 1 }}>{BOOK.series}</div>
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
            ))}
          </div>

          {/* Footer */}
          <div style={{ padding: "10px 28px 6px", borderTop: `1px solid ${C.border}`, background: C.white, flexShrink: 0 }}>
            <div style={{ fontSize: 12, color: C.muted, textAlign: "center" }}>Showing 5 of 38 sessions</div>
            <div style={{ fontSize: 11, color: "#bbb", textAlign: "center", marginTop: 4 }}>All data stored only on this device.</div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div style={{ width: 280, flexShrink: 0, borderLeft: `1px solid ${C.border}`, background: C.white, display: "flex", flexDirection: "column", overflowY: "auto" }}>

          {/* Week stats */}
          <div style={{ padding: "18px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", color: C.muted }}>THIS WEEK</span>
              <span style={{ fontSize: 11, color: C.muted }}>May 12 – May 18</span>
            </div>

            {[
              { icon: BookOpen, value: "160",    label: "Pages read" },
              { icon: Clock,    value: "2h 13m", label: "Minutes read" },
              { icon: Gauge,    value: "72",     label: "Avg. pace (ppm)" },
            ].map(({ icon: Icon, value, label }, i) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: i < 2 ? `1px solid ${C.border}` : "none" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.greenFaint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={15} color={C.green} strokeWidth={2} />
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: C.text, lineHeight: 1 }}>{value}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{label}</div>
                </div>
              </div>
            ))}

            {/* Start session button */}
            <button style={{
              width: "100%", marginTop: 16,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "11px 0", borderRadius: 8, border: "none",
              background: C.green, color: "#fff",
              fontSize: 13.5, fontWeight: 600, cursor: "pointer",
            }}>
              <Play size={14} fill="#fff" />
              Start session
            </button>
          </div>

          {/* Divider */}
          <div style={{ borderTop: `1px solid ${C.border}` }} />

          {/* Mini calendar */}
          <div style={{ padding: "16px 20px 12px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{calLabel}</span>
              <div style={{ display: "flex", gap: 2 }}>
                <button onClick={prevMonth} style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", color: C.muted, cursor: "pointer", borderRadius: 4 }}>
                  <ChevronLeft size={13} />
                </button>
                <button onClick={nextMonth} style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", color: C.muted, cursor: "pointer", borderRadius: 4 }}>
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>

            {/* Day headers */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 4 }}>
              {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map(d => (
                <div key={d} style={{ textAlign: "center", fontSize: 9.5, color: C.muted, fontWeight: 600, padding: "2px 0" }}>{d}</div>
              ))}
            </div>

            {/* Calendar rows */}
            {calGrid.map((row, ri) => (
              <div key={ri} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 2 }}>
                {row.map(({ dateStr, day, inMonth }) => {
                  const isToday = dateStr === TODAY;
                  const hasSessions = getDotCount(dateStr) > 0;
                  return (
                    <div key={dateStr} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "2px 0" }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: isToday ? C.green : "transparent",
                        color: isToday ? "#fff" : inMonth ? C.text : "#ccc",
                        fontSize: 12, fontWeight: isToday ? 700 : 400,
                        cursor: "default",
                      }}>
                        {day}
                      </div>
                      {hasSessions && inMonth && (
                        <span style={{ width: 4, height: 4, borderRadius: "50%", background: isToday ? C.greenFaint : C.green, marginTop: 1 }} />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Log past session button */}
          <div style={{ padding: "0 20px 20px", marginTop: "auto" }}>
            <button style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "9px 0", border: `1px solid ${C.border}`, borderRadius: 8,
              background: "transparent", fontSize: 12, color: C.muted, cursor: "pointer",
            }}>
              <Clock size={13} />
              Log a past session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
