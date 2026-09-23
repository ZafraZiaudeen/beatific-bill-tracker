import { useState } from "react";

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

function loadSettings() {
  try { return JSON.parse(localStorage.getItem("bt_settings") ?? "{}"); } catch { return {}; }
}
function saveSettings(patch: Record<string, unknown>) {
  const s = loadSettings();
  localStorage.setItem("bt_settings", JSON.stringify({ ...s, ...patch }));
}

interface NameEntryModalProps {
  onComplete: (name: string) => void;
}

export default function NameEntryModal({ onComplete }: NameEntryModalProps) {
  const [name, setName] = useState("");
  const [touched, setTouched] = useState(false);

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) { setTouched(true); return; }
    saveSettings({ userName: trimmed });
    onComplete(trimmed);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}>
      <div style={{ background: C.white, borderRadius: 20, padding: "48px 52px", maxWidth: 440, width: "90%", boxShadow: "0 24px 72px rgba(0,0,0,0.14)", textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: C.greenFaint, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="1.8" strokeLinecap="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
        </div>
        <h2 style={{ ...SERIF, fontSize: 30, fontWeight: 400, color: C.text, margin: "0 0 10px" }}>Welcome to Book Tracker</h2>
        <p style={{ fontSize: 14, color: C.muted, margin: "0 0 32px", lineHeight: 1.6 }}>
          Your personal reading library, stored right here on your device.<br />
          Before we begin — what should we call you?
        </p>
        <input
          autoFocus
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          placeholder="Your name…"
          style={{
            width: "100%", padding: "11px 16px",
            border: `1.5px solid ${touched && !name.trim() ? "#e74c3c" : C.border}`,
            borderRadius: 10, fontSize: 15, outline: "none",
            boxSizing: "border-box" as const,
            marginBottom: touched && !name.trim() ? 6 : 18,
          }}
        />
        {touched && !name.trim() && (
          <div style={{ fontSize: 12, color: "#e74c3c", marginBottom: 14, textAlign: "left" as const }}>
            Please enter your name to continue.
          </div>
        )}
        <button
          onClick={handleSubmit}
          style={{
            width: "100%", padding: "12px 0",
            background: C.green, color: "#fff",
            border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer",
          }}
        >
          Get started →
        </button>
      </div>
    </div>
  );
}
