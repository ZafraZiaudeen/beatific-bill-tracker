import { useState } from "react";
import { ArrowLeft, Download, Layers } from "lucide-react";
import BookTrackerDashboard from "./book-tracker/BookTrackerDashboard";
import { bookTrackerHtml } from "./book-tracker/bookTrackerTemplate";
import BillTrackerTab from "./bill-tracker-tab/BillTrackerTab";

type AppId = "bill-tracker" | "book-tracker";

interface AppDef {
  id: AppId;
  name: string;
  description: string;
  html?: string;
  Preview: React.ComponentType;
  Component: React.ComponentType;
}

function exportHtml(html: string, filename: string) {
  const blob = new Blob([html], { type: "text/html" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function BillTrackerPreview() {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", overflow: "hidden", pointerEvents: "none", userSelect: "none" }}>
      {/* Sidebar strip */}
      <div style={{
        width: 52, flexShrink: 0,
        background: "linear-gradient(160deg, #ede0f5 0%, #d8c4ea 100%)",
        display: "flex", flexDirection: "column", alignItems: "center",
        padding: "10px 6px", gap: 8,
      }}>
        <div style={{ width: 24, height: 24, borderRadius: 6, background: "linear-gradient(135deg, #c9a6d8, #b08ece)", marginBottom: 4 }} />
        {[1,2,3,4,5,6].map(i => (
          <div key={i} style={{ width: 32, height: 7, borderRadius: 99, background: i === 1 ? "#b08ece" : "rgba(160,120,190,0.25)" }} />
        ))}
      </div>
      {/* Main area */}
      <div style={{ flex: 1, background: "#faf8f5", padding: "10px 10px 8px", display: "flex", flexDirection: "column", gap: 8 }}>
        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <div style={{ fontSize: 8, fontWeight: 700, color: "#c9a0d8", fontFamily: "Georgia, serif" }}>Pastel Dream</div>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#b08ece", fontFamily: "Georgia, serif", lineHeight: 1 }}>Journal</div>
          <div style={{ fontSize: 6, letterSpacing: "0.12em", color: "#ccc", textTransform: "uppercase" }}>Bill Tracker</div>
        </div>
        {/* Greeting */}
        <div style={{ fontSize: 9, fontWeight: 600, color: "#555" }}>Good afternoon, Dreamer! ✦</div>
        {/* Stat tiles */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
          {[
            { label: "Total Bills", color: "#fce8f3", accent: "#e8a0c8" },
            { label: "Due This Month", color: "#e8f3e8", accent: "#8ec88e" },
            { label: "Paid This Month", color: "#fdf0e8", accent: "#e8b88e" },
            { label: "Total Overdue", color: "#f3e8e8", accent: "#e89090" },
          ].map(({ label, color }) => (
            <div key={label} style={{ background: color, borderRadius: 6, padding: "5px 7px" }}>
              <div style={{ fontSize: 5.5, color: "#999", marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#333" }}>$0.00</div>
            </div>
          ))}
        </div>
        {/* Calendar mock */}
        <div style={{ background: "#fff", borderRadius: 6, padding: "5px 7px", flex: 1 }}>
          <div style={{ fontSize: 6, fontWeight: 600, color: "#888", marginBottom: 4 }}>September 2026</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
            {Array.from({ length: 30 }, (_, i) => (
              <div key={i} style={{ height: 7, borderRadius: 2, background: i === 6 ? "#c9a0d8" : "rgba(0,0,0,0.05)" }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BookTrackerPreview() {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", overflow: "hidden", pointerEvents: "none", userSelect: "none" }}>
      {/* Sidebar strip */}
      <div style={{
        width: 44, flexShrink: 0,
        background: "#2d4a3e",
        display: "flex", flexDirection: "column", alignItems: "center",
        padding: "10px 6px", gap: 6,
      }}>
        <div style={{ width: 22, height: 22, borderRadius: 5, background: "#4a7c5f", marginBottom: 4 }} />
        {[1,2,3,4,5,6,7].map(i => (
          <div key={i} style={{ width: 28, height: 6, borderRadius: 99, background: i === 1 ? "#4a7c5f" : "rgba(255,255,255,0.12)" }} />
        ))}
      </div>
      {/* Main area */}
      <div style={{ flex: 1, background: "#f4efe6", padding: "8px 10px", display: "flex", flexDirection: "column", gap: 7 }}>
        {/* Title */}
        <div style={{ fontSize: 9, fontWeight: 500, color: "#1a1a1a", fontFamily: "Georgia, serif" }}>Good books, well kept.</div>
        {/* Goal card */}
        <div style={{ background: "#fff", borderRadius: 6, padding: "6px 8px", display: "flex", alignItems: "center", gap: 8 }}>
          {/* Ring */}
          <svg width={36} height={36} viewBox="0 0 36 36" style={{ flexShrink: 0 }}>
            <circle cx={18} cy={18} r={14} fill="none" stroke="#e4e9e5" strokeWidth={3} />
            <circle cx={18} cy={18} r={14} fill="none" stroke="#2d4a3e" strokeWidth={3}
              strokeDasharray="87.96" strokeDashoffset="21.99"
              strokeLinecap="round" transform="rotate(-90 18 18)" />
            <text x={18} y={19} textAnchor="middle" dominantBaseline="middle" fontSize={6} fontWeight={700} fill="#1a1a1a">18/24</text>
          </svg>
          <div>
            <div style={{ fontSize: 6, color: "#8a8a8a" }}>On pace to finish</div>
            <div style={{ fontSize: 8, fontWeight: 700, color: "#2d4a3e" }}>2 books ahead</div>
          </div>
        </div>
        {/* Three columns */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5, flex: 1 }}>
          {["Current Read", "Activity", "Next Up"].map((label, i) => (
            <div key={label} style={{ background: "#fff", borderRadius: 5, padding: "5px 5px" }}>
              <div style={{ fontSize: 5, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{label}</div>
              {i === 0 && (
                <div style={{ display: "flex", gap: 4 }}>
                  <div style={{ width: 20, height: 30, borderRadius: 2, background: "linear-gradient(155deg, #334e6a, #0a131c)" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ width: "100%", height: 4, borderRadius: 2, background: "#e8f0eb", overflow: "hidden" }}>
                      <div style={{ width: "69%", height: "100%", background: "#2d4a3e", borderRadius: 2 }} />
                    </div>
                  </div>
                </div>
              )}
              {i === 1 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 1.5 }}>
                  {Array.from({ length: 25 }, (_, j) => (
                    <div key={j} style={{ height: 4, borderRadius: 1, background: ["#e4e9e5","#b8d4c4","#7aaa90","#4a7c5f","#2d4a3e"][Math.floor(Math.random() * 5)] }} />
                  ))}
                </div>
              )}
              {i === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {["#2e4a62","#3a5040","#4a3050"].map((c) => (
                    <div key={c} style={{ display: "flex", gap: 3, alignItems: "center" }}>
                      <div style={{ width: 12, height: 18, borderRadius: 2, background: `linear-gradient(145deg, ${c}, ${c}88)`, flexShrink: 0 }} />
                      <div style={{ height: 4, borderRadius: 2, background: "#eee", flex: 1 }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const APPS: AppDef[] = [
  {
    id: "bill-tracker",
    name: "Bill Tracker",
    description: "Track bills, budget, expenses, and financial goals in one cozy dashboard.",
    Preview: BillTrackerPreview,
    Component: BillTrackerTab,
  },
  {
    id: "book-tracker",
    name: "Book Tracker",
    description: "Track your yearly reading goal, current book, activity heatmap, and queue.",
    html: bookTrackerHtml,
    Preview: BookTrackerPreview,
    Component: BookTrackerDashboard,
  },
];

const S = {
  bg: "#f7f5f0",
  white: "#ffffff",
  border: "#e8e3db",
  green: "#2d4a3e",
  greenFaint: "#e8f0eb",
  muted: "#8a8a8a",
  text: "#1a1a1a",
  shadow: "0 1px 3px rgba(0,0,0,.06), 0 2px 8px rgba(0,0,0,.04)",
} as const;

export default function AppStudio() {
  const [activeId, setActiveId] = useState<AppId | null>(null);
  const active = activeId ? APPS.find((a) => a.id === activeId) ?? null : null;

  // ── App view ──
  if (active) {
    const { Component } = active;
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
        {/* Thin top bar */}
        <div style={{
          height: 40, flexShrink: 0,
          background: S.white, borderBottom: `1px solid ${S.border}`,
          display: "flex", alignItems: "center", padding: "0 16px", gap: 10,
        }}>
          <button
            onClick={() => setActiveId(null)}
            style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: S.muted, cursor: "pointer", padding: "3px 8px", borderRadius: 6, border: "none", background: "transparent", transition: "background .13s" }}
            onMouseEnter={e => (e.currentTarget.style.background = S.greenFaint)}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <ArrowLeft size={13} /> Launcher
          </button>
          <span style={{ fontSize: 12, color: "#ccc" }}>·</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: S.text }}>{active.name}</span>
          <div style={{ flex: 1 }} />
          {active.html && (
            <button
              onClick={() => exportHtml(active.html!, `${active.id}.html`)}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "5px 11px", borderRadius: 6,
                border: `1px solid ${S.border}`, background: S.white,
                fontSize: 12, fontWeight: 500, color: "#555", cursor: "pointer",
                transition: "background .13s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = S.greenFaint)}
              onMouseLeave={e => (e.currentTarget.style.background = S.white)}
            >
              <Download size={12} /> Export HTML
            </button>
          )}
        </div>
        <div style={{ flex: 1, overflow: "hidden" }}>
          <Component />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: S.bg, fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* Header */}
      <div style={{ padding: "40px 48px 32px", borderBottom: `1px solid ${S.border}`, background: S.white }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div style={{ width: 32, height: 32, background: S.green, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Layers size={16} stroke="white" strokeWidth={2} />
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, color: S.text }}>App Studio</span>
        </div>
        <p style={{ fontSize: 13.5, color: S.muted, maxWidth: 480 }}>
          Your apps, all in one place. Click any card to open the full experience.
        </p>
      </div>

      {/* Card grid */}
      <div style={{ padding: "36px 48px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: S.muted, marginBottom: 16 }}>
          My Apps
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20, maxWidth: 1000 }}>
          {APPS.map((app) => (
            <div
              key={app.id}
              style={{
                background: S.white,
                border: `1px solid ${S.border}`,
                borderRadius: 14,
                boxShadow: S.shadow,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Preview thumbnail */}
              <div
                style={{
                  height: 160, overflow: "hidden",
                  background: "#f0ece4",
                  borderBottom: `1px solid ${S.border}`,
                  cursor: "pointer",
                }}
                onClick={() => setActiveId(app.id)}
              >
                <app.Preview />
              </div>

              {/* Card body */}
              <div style={{ padding: "16px 18px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: S.text, marginBottom: 4 }}>{app.name}</div>
                  <div style={{ fontSize: 12.5, color: S.muted, lineHeight: 1.5 }}>{app.description}</div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => setActiveId(app.id)}
                    style={{
                      flex: 1, padding: "8px 0", borderRadius: 8,
                      background: S.green, color: "#fff", border: "none",
                      fontSize: 13, fontWeight: 500, cursor: "pointer",
                      transition: "background .13s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#243d32")}
                    onMouseLeave={e => (e.currentTarget.style.background = S.green)}
                  >
                    Open
                  </button>

                  {app.html && (
                    <button
                      onClick={() => exportHtml(app.html!, `${app.id}.html`)}
                      style={{
                        padding: "8px 13px", borderRadius: 8,
                        border: `1px solid ${S.border}`, background: "transparent",
                        fontSize: 12.5, fontWeight: 500, color: "#555", cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 5,
                        transition: "background .13s",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = S.greenFaint)}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <Download size={12} /> HTML
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
