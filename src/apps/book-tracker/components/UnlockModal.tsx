import { useState } from "react";
import { KeyRound, X } from "lucide-react";

declare global {
  interface Window { __BTK_LICENSE_HASH__: string; }
}

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

const SALT = "btk-lic-v1";

interface Props {
  onActivate: () => void;
  onClose: () => void;
}

export default function UnlockModal({ onActivate, onClose }: Props) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  const isDevMode = !window.__BTK_LICENSE_HASH__;

  const handleUnlock = async () => {
    const trimmed = code.trim();
    if (!trimmed) { setError("Please enter a license code."); return; }
    setChecking(true);
    setError("");
    try {
      const hash = await sha256(SALT + trimmed);
      if (hash === window.__BTK_LICENSE_HASH__) {
        localStorage.setItem("btk_activated", "1");
        onActivate();
      } else {
        setError("Invalid license code. Please check and try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px",
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 24,
        padding: "40px 32px",
        maxWidth: 420,
        width: "100%",
        boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
        textAlign: "center",
        position: "relative",
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: 16, right: 16,
          background: "none", border: "none", cursor: "pointer",
          color: "#8a8a8a", padding: 4,
        }}>
          <X size={18} />
        </button>

        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: "#e8f0eb", display: "flex",
          alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
        }}>
          <KeyRound size={24} color="#2d4a3e" strokeWidth={1.6} />
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a", marginBottom: 8 }}>
          Unlock Full Access
        </h2>
        <p style={{ fontSize: 14, color: "#8a8a8a", marginBottom: 24, lineHeight: 1.5 }}>
          You've reached the 3-book free tier limit.<br />
          Enter your license code to unlock unlimited books.
        </p>

        <input
          type="text"
          value={code}
          onChange={e => { setCode(e.target.value); setError(""); }}
          onKeyDown={e => e.key === "Enter" && handleUnlock()}
          placeholder="Enter license code…"
          style={{
            width: "100%",
            border: error ? "1.5px solid #e05c5c" : "1.5px solid #e0dbd2",
            borderRadius: 12,
            padding: "10px 14px",
            fontSize: 14,
            color: "#1a1a1a",
            background: "#faf8f5",
            outline: "none",
            marginBottom: error ? 8 : 16,
            boxSizing: "border-box",
          }}
        />

        {error && (
          <p style={{ fontSize: 12, color: "#c0392b", marginBottom: 16, textAlign: "left" }}>
            {error}
          </p>
        )}

        <button
          onClick={handleUnlock}
          disabled={checking}
          style={{
            width: "100%",
            background: checking ? "#4a7a64" : "#2d4a3e",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            padding: "12px 0",
            fontSize: 15,
            fontWeight: 600,
            cursor: checking ? "not-allowed" : "pointer",
            transition: "background 0.2s",
          }}
        >
          {checking ? "Checking…" : "Unlock"}
        </button>
      </div>
    </div>
  );
}
