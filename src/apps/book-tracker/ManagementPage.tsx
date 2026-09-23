import { useState } from "react";
import { KeyRound, Copy, Download, Trash2, RefreshCw, Check } from "lucide-react";
import { sha256 } from "@/lib/crypto";

const BTK_HASH_SALT = "btk-lic-v1";
const REGISTRY_KEY = "btk-license-registry";

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

interface LicenseRecord {
  id: string;
  customer: string;
  code: string;
  hash: string;
  date: string;
}

function loadRegistry(): LicenseRecord[] {
  try { return JSON.parse(localStorage.getItem(REGISTRY_KEY) ?? "[]"); } catch { return []; }
}
function saveRegistry(records: LicenseRecord[]) {
  localStorage.setItem(REGISTRY_KEY, JSON.stringify(records));
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 16 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

async function buildBookTrackerHtml(hash: string): Promise<string> {
  const res = await fetch("/customer-book-build/book-tracker-app.html");
  if (!res.ok) throw new Error("Book Tracker customer build not found. Run: npm run build:customer-book");
  const html = await res.text();
  const hashScript = `<script>window.__BTK_LICENSE_HASH__="${hash}";<\/script>`;
  const idx = html.lastIndexOf("</head>");
  return html.slice(0, idx) + hashScript + "\n" + html.slice(idx);
}

function triggerDownload(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/html" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function ManagementPage() {
  const [tab, setTab] = useState<"generate" | "history">("generate");
  const [customer, setCustomer] = useState("");
  const [code, setCode] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [copied, setCopied] = useState(false);
  const [records, setRecords] = useState<LicenseRecord[]>(() => loadRegistry());

  function refreshRecords() {
    setRecords(loadRegistry());
  }

  function handleAutoCode() {
    setCode(generateCode());
  }

  function handleCopyCode() {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  async function handleGenerate() {
    const trimmedCode = code.trim();
    if (!trimmedCode) { setGenerateError("Enter a license code first."); return; }
    setGenerating(true);
    setGenerateError("");
    try {
      const hash = await sha256(BTK_HASH_SALT + trimmedCode);
      const html = await buildBookTrackerHtml(hash);
      const filename = customer.trim()
        ? `book-tracker-${customer.trim().toLowerCase().replace(/\s+/g, "-")}.html`
        : "book-tracker-customer.html";
      triggerDownload(html, filename);
      const record: LicenseRecord = {
        id: crypto.randomUUID(),
        customer: customer.trim() || "—",
        code: trimmedCode,
        hash,
        date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
      };
      const updated = [record, ...loadRegistry()];
      saveRegistry(updated);
      setRecords(updated);
      setCode("");
      setCustomer("");
      setTab("history");
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : "Failed to generate. Is the customer build ready?");
    } finally {
      setGenerating(false);
    }
  }

  async function handleReDownload(r: LicenseRecord) {
    try {
      const html = await buildBookTrackerHtml(r.hash);
      const filename = r.customer !== "—"
        ? `book-tracker-${r.customer.toLowerCase().replace(/\s+/g, "-")}.html`
        : "book-tracker-customer.html";
      triggerDownload(html, filename);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Download failed.");
    }
  }

  function handleDelete(id: string) {
    const updated = loadRegistry().filter(r => r.id !== id);
    saveRegistry(updated);
    setRecords(updated);
  }

  function handleCopyEntry(text: string) {
    navigator.clipboard.writeText(text);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 14,
    color: C.text,
    background: "#faf8f5",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  };

  const btnPrimary: React.CSSProperties = {
    background: C.green,
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "10px 20px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  };

  const btnSecondary: React.CSSProperties = {
    background: C.white,
    color: C.green,
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    padding: "9px 14px",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 5,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: C.bg }}>
      {/* Header */}
      <div style={{ padding: "20px 28px 0", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: C.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <KeyRound size={16} stroke="#fff" strokeWidth={2} />
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: C.text }}>License Management</div>
            <div style={{ fontSize: 12, color: C.muted }}>Generate customer HTML files with embedded license codes</div>
          </div>
        </div>

        {/* Build banner */}
        <div style={{ background: "#fffbe6", border: "1px solid #e8d88a", borderRadius: 8, padding: "9px 14px", marginBottom: 18, fontSize: 12.5, color: "#7a6100" }}>
          Build the customer HTML before generating: <code style={{ background: "rgba(0,0,0,0.06)", padding: "1px 5px", borderRadius: 4 }}>npm run build:customer-book</code>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${C.border}` }}>
          {(["generate", "history"] as const).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); if (t === "history") refreshRecords(); }}
              style={{
                padding: "8px 18px",
                fontSize: 13.5,
                fontWeight: tab === t ? 600 : 400,
                color: tab === t ? C.green : C.muted,
                background: "none",
                border: "none",
                borderBottom: tab === t ? `2px solid ${C.green}` : "2px solid transparent",
                cursor: "pointer",
                marginBottom: -1,
              }}
            >
              {t === "generate" ? "Generate License" : `History (${records.length})`}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "20px 28px 28px" }}>

        {/* Generate tab */}
        {tab === "generate" && (
          <div style={{ maxWidth: 520 }}>
            <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.borderCard}`, boxShadow: C.shadow, padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Customer Name (optional)
                </label>
                <input
                  value={customer}
                  onChange={e => setCustomer(e.target.value)}
                  placeholder="e.g. Jane Smith"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  License Code
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    value={code}
                    onChange={e => { setCode(e.target.value.toUpperCase()); setGenerateError(""); }}
                    placeholder="Enter or auto-generate a code"
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <button onClick={handleAutoCode} style={btnSecondary} title="Auto-generate">
                    <RefreshCw size={13} />
                    Auto
                  </button>
                  <button onClick={handleCopyCode} disabled={!code} style={{ ...btnSecondary, opacity: code ? 1 : 0.4 }} title="Copy code">
                    {copied ? <Check size={13} color={C.green} /> : <Copy size={13} />}
                  </button>
                </div>
              </div>

              {generateError && (
                <div style={{ fontSize: 12.5, color: "#c0392b", background: "#fdecea", border: "1px solid #f5c6cb", borderRadius: 7, padding: "8px 12px" }}>
                  {generateError}
                </div>
              )}

              <button onClick={handleGenerate} disabled={generating} style={{ ...btnPrimary, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, opacity: generating ? 0.7 : 1 }}>
                <Download size={15} />
                {generating ? "Building…" : "Generate & Download HTML"}
              </button>

              <div style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.6, background: C.bg, borderRadius: 8, padding: "10px 13px" }}>
                The license code is hashed with SHA-256 before being embedded. It cannot be read from the HTML source — only the hash is stored. The customer enters the exact code to unlock.
              </div>
            </div>
          </div>
        )}

        {/* History tab */}
        {tab === "history" && (
          <div>
            {records.length === 0 ? (
              <div style={{ textAlign: "center", color: C.muted, padding: "48px 0", fontSize: 14 }}>
                No licenses generated yet.
              </div>
            ) : (
              <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.borderCard}`, boxShadow: C.shadow, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                      {["Customer", "Code", "Date", "Actions"].map(h => (
                        <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontWeight: 600, color: C.muted, fontSize: 11.5, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r, i) => (
                      <tr key={r.id} style={{ borderBottom: i < records.length - 1 ? `1px solid ${C.border}` : "none" }}>
                        <td style={{ padding: "10px 16px", color: C.text, fontWeight: 500 }}>{r.customer}</td>
                        <td style={{ padding: "10px 16px" }}>
                          <code style={{ fontSize: 12, background: C.bg, padding: "2px 7px", borderRadius: 5, letterSpacing: "0.04em" }}>{r.code}</code>
                        </td>
                        <td style={{ padding: "10px 16px", color: C.muted }}>{r.date}</td>
                        <td style={{ padding: "10px 16px" }}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => handleCopyEntry(r.code)} title="Copy code" style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 4, borderRadius: 5 }}>
                              <Copy size={13} />
                            </button>
                            <button onClick={() => handleReDownload(r)} title="Re-download" style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 4, borderRadius: 5 }}>
                              <Download size={13} />
                            </button>
                            <button onClick={() => handleDelete(r.id)} title="Delete record" style={{ background: "none", border: "none", cursor: "pointer", color: "#c0392b", padding: 4, borderRadius: 5 }}>
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
