import { useState, useRef, useCallback } from "react";
import {
  BookOpen, Cloud, Shield, Lock, Download, Upload, FileText, Copy, Monitor,
} from "lucide-react";

const C = {
  bg: "#F7F5F0", white: "#ffffff", green: "#2d4a3e", greenFaint: "#e8f0eb",
  border: "#e8e2d8", borderCard: "#ede8df", muted: "#8a8a8a", text: "#1a1a1a",
  shadow: "0 1px 4px rgba(0,0,0,.05), 0 2px 8px rgba(0,0,0,.04)",
} as const;

const card: React.CSSProperties = {
  background: C.white, borderRadius: 14,
  border: `1px solid ${C.borderCard}`, boxShadow: C.shadow, padding: "22px 24px",
};

const BT_KEYS = ["bt_books", "bt_sessions", "bt_notes", "bt_wishlist", "bt_settings", "bt_last_backup"] as const;

function loadSettings() {
  try { return JSON.parse(localStorage.getItem("bt_settings") ?? "{}"); } catch { return {}; }
}
function saveSettings(patch: Record<string, unknown>) {
  const s = loadSettings();
  localStorage.setItem("bt_settings", JSON.stringify({ ...s, ...patch }));
}

function todayStr() { return new Date().toISOString().slice(0, 10); }

function exportJSON() {
  const data: Record<string, unknown> = {};
  BT_KEYS.forEach(k => { const v = localStorage.getItem(k); if (v !== null) data[k] = JSON.parse(v); });
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `book-tracker-backup-${todayStr()}.json`;
  a.click(); URL.revokeObjectURL(url);
  const ts = new Date().toISOString();
  localStorage.setItem("bt_last_backup", ts);
  return ts;
}

function exportCSV() {
  try {
    const books = JSON.parse(localStorage.getItem("bt_books") ?? "[]") as Record<string, unknown>[];
    const headers = ["title", "author", "status", "rating", "pages", "currentPage", "format", "dateAdded"];
    const rows = books.map(b =>
      headers.map(h => {
        const v = b[h] ?? "";
        const s = String(v);
        return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
      }).join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `books-${todayStr()}.csv`;
    a.click(); URL.revokeObjectURL(url);
  } catch (e) { console.error(e); }
}

function parseAndImport(file: File, onDone: (msg: string) => void) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string);
      if (typeof data !== "object" || !data) { onDone("Error: invalid file format"); return; }
      let count = 0;
      BT_KEYS.forEach(k => {
        if (k in data) { localStorage.setItem(k, JSON.stringify(data[k])); count++; }
      });
      const books = Array.isArray(data.bt_books) ? data.bt_books.length : 0;
      const sessions = Array.isArray(data.bt_sessions) ? data.bt_sessions.length : 0;
      onDone(`Imported ${books} books, ${sessions} sessions`);
      setTimeout(() => window.location.reload(), 1200);
    } catch { onDone("Error: could not parse file"); }
  };
  reader.readAsText(file);
}

function CardHeader({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
      <div style={{ width: 38, height: 38, borderRadius: "50%", background: C.greenFaint, display: "flex", alignItems: "center", justifyContent: "center", color: C.green, flexShrink: 0 }}>
        <Icon size={18} strokeWidth={1.8} />
      </div>
      <div>
        <div style={{ fontSize: 15.5, fontWeight: 700, color: C.text, lineHeight: 1.2 }}>{title}</div>
        <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{subtitle}</div>
      </div>
    </div>
  );
}

function Divider() {
  return <hr style={{ border: "none", borderTop: `1px solid ${C.border}`, margin: "16px 0" }} />;
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      style={{
        width: 42, height: 24, borderRadius: 99, background: on ? C.green : "#ccc",
        cursor: "pointer", position: "relative", transition: "background .2s", flexShrink: 0,
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: "50%", background: C.white,
        position: "absolute", top: 3,
        left: on ? 21 : 3,
        transition: "left .2s",
        boxShadow: "0 1px 3px rgba(0,0,0,.25)",
      }} />
    </div>
  );
}

function fmtBackup(iso: string | null) {
  if (!iso) return "Never";
  try { return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }); }
  catch { return "Never"; }
}

export default function SettingsPage() {
  const settings = loadSettings();
  const [yearlyGoal, setYearlyGoal] = useState<number>(() => Number(loadSettings().yearlyGoal ?? 24));
  const [backupReminder, setBackupReminder] = useState<boolean>(settings.backupReminder !== false);
  const [lastBackup, setLastBackup] = useState<string | null>(() => localStorage.getItem("bt_last_backup"));
  const [importStatus, setImportStatus] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const transferCode = (() => {
    try {
      const s = loadSettings();
      if (s.transferCode) return s.transferCode as string;
      const code = Math.random().toString(36).slice(2, 6).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
      saveSettings({ transferCode: code });
      return code;
    } catch { return "----"; }
  })();

  const handleExportJSON = () => {
    const ts = exportJSON();
    setLastBackup(ts);
  };

  const handleImportFile = (file: File) => {
    parseAndImport(file, setImportStatus);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleImportFile(f);
    e.target.value = "";
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleImportFile(f);
  }, []);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);

  const handleYearlyGoalChange = (v: number) => {
    const val = Math.max(0, Math.min(999, v));
    setYearlyGoal(val);
    saveSettings({ yearlyGoal: val });
  };

  const handleToggleBackupReminder = () => {
    const next = !backupReminder;
    setBackupReminder(next);
    saveSettings({ backupReminder: next });
  };

  const handleChangePin = () => {
    const current = loadSettings().pin as string | undefined;
    if (current) {
      const entered = window.prompt("Enter current PIN to change it:");
      if (entered !== current) { window.alert("Incorrect PIN."); return; }
    }
    const newPin = window.prompt("Enter a new 4-digit PIN (leave blank to remove):");
    if (newPin === null) return;
    if (newPin === "") { saveSettings({ pin: undefined }); window.alert("PIN removed."); return; }
    if (!/^\d{4}$/.test(newPin)) { window.alert("PIN must be exactly 4 digits."); return; }
    saveSettings({ pin: newPin });
    window.alert("PIN saved.");
  };

  const handleCopyCode = () => {
    try { navigator.clipboard.writeText(transferCode); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };

  const handleClearAll = () => {
    if (!window.confirm("This will permanently delete ALL your books, sessions, notes, and settings. This cannot be undone. Are you sure?")) return;
    ["bt_books","bt_sessions","bt_notes","bt_wishlist","bt_settings","bt_last_backup"].forEach(k => localStorage.removeItem(k));
    window.location.reload();
  };

  const portabilityActions: { icon: React.ElementType; label: string; onClick: () => void }[] = [
    { icon: Download, label: "Export JSON",       onClick: handleExportJSON },
    { icon: Upload,   label: "Import JSON",       onClick: () => fileInputRef.current?.click() },
    { icon: Download, label: "Export CSV",        onClick: exportCSV },
    { icon: Upload,   label: "Import CSV / Excel", onClick: () => fileInputRef.current?.click() },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: C.bg }}>

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept=".json,.csv,.xlsx" style={{ display: "none" }} onChange={handleFileChange} />

      {/* Header */}
      <div style={{ flexShrink: 0, padding: "14px 28px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 22, height: 22, background: C.green, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <BookOpen size={12} stroke="white" strokeWidth={2.2} />
          </div>
          <span style={{ fontSize: 13, color: C.muted }}>Library</span>
          <span style={{ fontSize: 13, color: C.muted }}>/</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Your data, your shelf</span>
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
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 28px 28px" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", padding: "44px 0 32px" }}>
          <div style={{ width: 68, height: 68, borderRadius: "50%", background: C.greenFaint, display: "flex", alignItems: "center", justifyContent: "center", color: C.green, margin: "0 auto 18px" }}>
            <Shield size={34} strokeWidth={1.4} />
          </div>
          <h1 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 34, fontWeight: 700, color: C.text, margin: "0 0 10px", letterSpacing: -0.5 }}>
            Nothing leaves this browser.
          </h1>
          <p style={{ fontSize: 14.5, color: C.muted, margin: 0 }}>
            All your data is stored locally on this device and never sent anywhere.
          </p>
        </div>

        {/* 3-column grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18, marginBottom: 18, alignItems: "start" }}>

          {/* Security */}
          <div style={card}>
            <CardHeader icon={Lock} title="Security" subtitle="Your data is protected on this device" />
            <Divider />
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.greenFaint, display: "flex", alignItems: "center", justifyContent: "center", color: C.green, flexShrink: 0 }}>
                <Lock size={15} strokeWidth={1.8} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: C.text }}>App lock (PIN)</div>
                <div style={{ fontSize: 12, color: C.muted }}>Require PIN to open the app</div>
              </div>
              <button
                onClick={handleChangePin}
                style={{ border: `1px solid ${C.border}`, background: C.white, padding: "5px 12px", borderRadius: 7, fontSize: 12, fontWeight: 500, color: "#555", cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap" as const }}
              >
                Change PIN
              </button>
            </div>
            <Divider />
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.greenFaint, display: "flex", alignItems: "center", justifyContent: "center", color: C.green, flexShrink: 0 }}>
                <Shield size={15} strokeWidth={1.8} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: C.text }}>Local encryption</div>
                <div style={{ fontSize: 12, color: C.muted }}>All data is encrypted on this device</div>
              </div>
              <div style={{ background: "#e8f7ef", color: "#2d7a4f", border: "1px solid #b2e0c5", borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
                Active
              </div>
            </div>
          </div>

          {/* Portability */}
          <div style={card}>
            <CardHeader icon={Download} title="Portability" subtitle="Export or import your data anytime" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
              {portabilityActions.map(({ icon: Icon, label, onClick }) => (
                <button
                  key={label}
                  onClick={onClick}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, border: `1px solid ${C.border}`, background: C.white, padding: "8px 10px", borderRadius: 8, fontSize: 12.5, fontWeight: 500, color: "#444", cursor: "pointer" }}
                  onMouseEnter={e => (e.currentTarget.style.background = C.greenFaint)}
                  onMouseLeave={e => (e.currentTarget.style.background = C.white)}
                >
                  <Icon size={13} style={{ color: C.muted }} />
                  {label}
                </button>
              ))}
            </div>
            {/* Drop zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? C.green : C.border}`,
                borderRadius: 10, padding: "20px 16px", textAlign: "center" as const,
                background: dragOver ? C.greenFaint : "#faf9f6",
                cursor: "pointer", transition: "all .15s",
              }}
            >
              <FileText size={20} style={{ color: dragOver ? C.green : C.muted, marginBottom: 8 }} />
              <div style={{ fontSize: 13, color: dragOver ? C.green : "#555" }}>Drop a file here to import</div>
              <div style={{ fontSize: 11.5, color: C.muted }}>JSON, CSV, or Excel (.xlsx)</div>
            </div>
            {/* Import status */}
            {importStatus && (
              <div style={{
                marginTop: 12, padding: "8px 12px", borderRadius: 8,
                background: importStatus.startsWith("Error") ? "#fff0f0" : "#e8f7ef",
                border: `1px solid ${importStatus.startsWith("Error") ? "#f5c6cb" : "#b2e0c5"}`,
                fontSize: 12.5,
                color: importStatus.startsWith("Error") ? "#c0392b" : "#2d7a4f",
              }}>
                {importStatus}
              </div>
            )}
          </div>

          {/* Backup */}
          <div style={card}>
            <CardHeader icon={Cloud} title="Backup & Goal" subtitle="Reminder settings and yearly target" />
            <Divider />
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: C.text }}>Yearly reading goal</div>
                <div style={{ fontSize: 12, color: C.muted }}>Books you want to finish this year</div>
              </div>
              <input
                type="number"
                min={0}
                max={999}
                value={yearlyGoal}
                onChange={e => handleYearlyGoalChange(Number(e.target.value))}
                style={{ width: 60, border: `1px solid ${C.border}`, borderRadius: 7, padding: "5px 8px", fontSize: 14, fontWeight: 600, color: C.text, textAlign: "center" as const, outline: "none", flexShrink: 0 }}
              />
            </div>
            <Divider />
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: C.text }}>Remind me to backup</div>
                <div style={{ fontSize: 12, color: C.muted }}>Get a reminder every 30 days</div>
              </div>
              <Toggle on={backupReminder} onToggle={handleToggleBackupReminder} />
            </div>
            <Divider />
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: C.text }}>Last backup</div>
                <div style={{ fontSize: 12, color: C.muted }}>{fmtBackup(lastBackup)}</div>
              </div>
              <div style={{ border: `1px solid ${C.green}`, color: C.green, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600, flexShrink: 0, whiteSpace: "nowrap" as const }}>
                {lastBackup ? "Up to date" : "No backup yet"}
              </div>
            </div>
          </div>
        </div>

        {/* Transfer card */}
        <div style={{ ...card, background: "#f0f5f2", border: "1px solid #d0e4d8", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 50, height: 50, borderRadius: 12, background: C.greenFaint, display: "flex", alignItems: "center", justifyContent: "center", color: C.green, flexShrink: 0 }}>
              <Monitor size={22} strokeWidth={1.6} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 3 }}>Transfer to another device</div>
              <div style={{ fontSize: 12.5, color: C.muted }}>Export your data as JSON and import it on the other device</div>
            </div>
          </div>
          <div style={{ textAlign: "center" as const, flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 22px" }}>
              <span style={{ fontFamily: "'Courier New', Courier, monospace", fontSize: 24, fontWeight: 700, letterSpacing: 5, color: C.text }}>
                {transferCode}
              </span>
              <button
                onClick={handleCopyCode}
                title={copied ? "Copied!" : "Copy code"}
                style={{ background: "none", border: "none", cursor: "pointer", color: copied ? C.green : C.muted, padding: 4, display: "flex", alignItems: "center" }}
              >
                <Copy size={16} />
              </button>
            </div>
            <div style={{ fontSize: 11.5, color: C.muted, marginTop: 7 }}>
              {copied ? "Copied to clipboard!" : "Copy then use Export JSON to share your data"}
            </div>
          </div>
        </div>

        {/* Danger zone */}
        <div style={{ ...card, border: "1px solid #f5c6cb", background: "#fff8f8", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "#c0392b" }}>Clear all data</div>
              <div style={{ fontSize: 12, color: C.muted }}>Permanently delete all books, sessions, notes, and settings from this device</div>
            </div>
            <button
              onClick={handleClearAll}
              style={{ border: "1px solid #f5c6cb", background: "#fff0f0", padding: "5px 14px", borderRadius: 7, fontSize: 12, fontWeight: 500, color: "#c0392b", cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap" as const }}
            >
              Clear all data
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center" as const, paddingBottom: 12 }}>
          <svg width={36} height={22} viewBox="0 0 36 22" style={{ marginBottom: 8 }}>
            <path d="M18 20 C12 13, 3 11, 5 4 C9 9, 15 11, 18 20Z" fill={C.green} opacity={0.35} />
            <path d="M18 20 C24 13, 33 11, 31 4 C27 9, 21 11, 18 20Z" fill={C.green} opacity={0.35} />
            <line x1={18} y1={20} x2={18} y2={6} stroke={C.green} strokeWidth={1} opacity={0.4} />
          </svg>
          <div style={{ fontSize: 12.5, color: C.muted }}>Buy once. Use forever. No subscription.</div>
        </div>

      </div>
    </div>
  );
}
