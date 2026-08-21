import { useState, useEffect } from "react";
import { Copy, Download, KeyRound, RefreshCw, Trash2, Terminal } from "lucide-react";
import { sha256, HASH_SALT } from "@/lib/crypto";

interface LicenseEntry {
  id: string;
  customerName: string;
  code: string;
  hash: string;
  date: string;
}

const LS_KEY = "pdj-license-registry";

function loadRegistry(): LicenseEntry[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]"); } catch { return []; }
}
function saveRegistry(entries: LicenseEntry[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(entries));
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => chars[b % chars.length])
    .join("");
}

async function buildProtectedHtml(hash: string): Promise<string> {
  const res = await fetch("/customer-build/index.html");
  if (!res.ok) {
    throw new Error(
      "Customer build not found. Run: npm run build:customer"
    );
  }
  const html = await res.text();
  const hashScript = `<script>window.__PDJ_LICENSE_HASH__="${hash}";<\/script>`;
  return html.replace("</head>", `${hashScript}\n</head>`);
}

function downloadHtml(html: string, filename: string) {
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function Management() {
  const [tab, setTab] = useState<"generate" | "history">("generate");
  const [customerName, setCustomerName] = useState("");
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [registry, setRegistry] = useState<LicenseEntry[]>([]);

  useEffect(() => { setRegistry(loadRegistry()); }, []);

  const handleAutoGenerate = () => {
    setCode(generateCode());
    setCopied(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleGenerate = async () => {
    if (!code.trim()) return;
    setGenerating(true);
    setError("");
    try {
      const hash = await sha256(HASH_SALT + code.trim());
      const html = await buildProtectedHtml(hash);
      const name = customerName.trim() || "customer";
      const filename = `bill-tracker-${name.toLowerCase().replace(/\s+/g, "-")}.html`;
      downloadHtml(html, filename);

      const entry: LicenseEntry = {
        id: crypto.randomUUID(),
        customerName: customerName.trim() || "—",
        code: code.trim(),
        hash,
        date: new Date().toISOString(),
      };
      const next = [entry, ...registry];
      setRegistry(next);
      saveRegistry(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate HTML");
    } finally {
      setGenerating(false);
    }
  };

  const handleReDownload = async (entry: LicenseEntry) => {
    try {
      const html = await buildProtectedHtml(entry.hash);
      const name = entry.customerName === "—" ? "customer" : entry.customerName;
      downloadHtml(html, `bill-tracker-${name.toLowerCase().replace(/\s+/g, "-")}.html`);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to re-download HTML");
    }
  };

  const handleDelete = (id: string) => {
    const next = registry.filter((e) => e.id !== id);
    setRegistry(next);
    saveRegistry(next);
  };

  const inputClass =
    "w-full rounded-2xl border border-ink/15 bg-white/70 px-4 py-2.5 font-hand text-sm text-ink outline-none focus:border-lilac-deep/40";
  const btnPrimary =
    "flex items-center gap-2 rounded-full bg-lilac-deep/80 px-5 py-2.5 font-script text-base text-white transition-colors hover:bg-lilac-deep disabled:opacity-50";
  const btnSecondary =
    "flex items-center gap-2 rounded-full border border-ink/15 bg-white/60 px-4 py-2 font-hand text-sm text-ink-soft transition-colors hover:bg-ink/5";

  return (
    <main className="dot-grid min-w-0 flex-1 px-5 py-8 sm:px-8">
      {/* Header */}
      <header className="mb-6 flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-lilac/40">
          <KeyRound className="h-7 w-7 text-lilac-deep" strokeWidth={1.6} />
        </div>
        <div>
          <h2 className="font-script text-5xl sm:text-6xl">Management</h2>
          <p className="mt-1 font-hand text-sm text-ink-soft">
            Generate code-protected HTML files for your customers
          </p>
        </div>
      </header>

      {/* Info banner */}
      <div className="paper-card mb-3 rounded-3xl bg-lilac/15 px-6 py-4">
        <p className="font-hand text-sm text-ink">
          <span className="font-bold text-lilac-deep">How it works:</span> Enter a license code → click Generate &amp; Download → the customer receives an HTML file that only unlocks when they enter that exact code. The code is stored as a SHA-256 hash — it cannot be read from the HTML source.
        </p>
      </div>

      {/* Build reminder */}
      <div className="mb-5 flex items-start gap-3 rounded-2xl border border-ink/10 bg-white/60 px-5 py-3">
        <Terminal className="mt-0.5 h-4 w-4 shrink-0 text-ink-soft" strokeWidth={1.8} />
        <p className="font-hand text-xs text-ink-soft">
          <span className="font-bold text-ink/70">Before generating:</span> Run{" "}
          <code className="rounded bg-ink/8 px-1.5 py-0.5 font-mono text-xs">npm run build:customer</code>{" "}
          once (or after adding new features) to refresh the customer build.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-2">
        {(["generate", "history"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-5 py-2 font-hand text-sm capitalize transition-colors ${
              tab === t
                ? "bg-lilac-deep text-white shadow-sm"
                : "border border-ink/15 bg-white/60 text-ink-soft hover:bg-white/80"
            }`}
          >
            {t === "generate" ? "Generate License" : `History (${registry.length})`}
          </button>
        ))}
      </div>

      {/* Generate tab */}
      {tab === "generate" && (
        <div className="paper-card rounded-3xl bg-white/85 p-6 sm:p-8">
          <p className="mb-6 font-script text-2xl">✧ Create a new license</p>

          <div className="mb-5 space-y-4">
            <div>
              <label className="mb-1.5 block font-hand text-xs uppercase tracking-widest text-ink-soft">
                Customer name (optional)
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Acme Corp"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1.5 block font-hand text-xs uppercase tracking-widest text-ink-soft">
                License code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => { setCode(e.target.value); setCopied(false); }}
                  placeholder="Enter or auto-generate a code..."
                  className={`${inputClass} flex-1`}
                />
                <button
                  type="button"
                  onClick={handleAutoGenerate}
                  title="Auto-generate"
                  className="flex shrink-0 items-center gap-1.5 rounded-2xl border border-ink/15 bg-white/60 px-3 py-2 font-hand text-sm text-ink-soft hover:bg-ink/5"
                >
                  <RefreshCw className="h-4 w-4" strokeWidth={1.8} />
                  Auto
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy(code)}
                  title="Copy code"
                  disabled={!code}
                  className="flex shrink-0 items-center gap-1.5 rounded-2xl border border-ink/15 bg-white/60 px-3 py-2 font-hand text-sm text-ink-soft hover:bg-ink/5 disabled:opacity-40"
                >
                  <Copy className="h-4 w-4" strokeWidth={1.8} />
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleGenerate}
              disabled={!code.trim() || generating}
              className={btnPrimary}
            >
              <Download className="h-4 w-4" strokeWidth={2} />
              {generating ? "Generating…" : "Generate & Download HTML"}
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-2xl bg-blush/15 px-4 py-3">
              <p className="font-hand text-sm text-blush-deep">{error}</p>
            </div>
          )}

          <div className="mt-6 rounded-2xl bg-ink/[0.03] p-4">
            <p className="font-hand text-xs text-ink-soft">
              <span className="font-bold text-ink/60">Security note:</span> The downloaded HTML embeds only the SHA-256 hash of your code — the original code is never stored in the file. Customers cannot reverse-engineer the code from the HTML source.
            </p>
          </div>
        </div>
      )}

      {/* History tab */}
      {tab === "history" && (
        <div className="paper-card rounded-3xl bg-white/85 p-6">
          <p className="mb-4 font-script text-2xl">✧ Generated licenses</p>
          {registry.length === 0 ? (
            <p className="py-6 text-center font-hand text-sm text-ink-soft">
              No licenses generated yet. Switch to the Generate tab to create one.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left">
                <thead>
                  <tr className="border-b border-ink/10">
                    {["Customer", "Code", "Date", "Actions"].map((h) => (
                      <th key={h} className="pb-2 pr-4 font-hand text-[0.65rem] uppercase tracking-widest text-ink-soft last:pr-0">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {registry.map((entry) => (
                    <tr key={entry.id} className="border-b border-ink/5 last:border-0">
                      <td className="py-3 pr-4 font-hand text-sm text-ink">{entry.customerName}</td>
                      <td className="py-3 pr-4">
                        <code className="rounded-lg bg-ink/5 px-2 py-1 font-mono text-xs text-ink">
                          {entry.code}
                        </code>
                      </td>
                      <td className="py-3 pr-4 font-hand text-xs text-ink-soft">
                        {new Date(entry.date).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleCopy(entry.code)}
                            title="Copy code"
                            className={btnSecondary}
                          >
                            <Copy className="h-3.5 w-3.5" strokeWidth={1.8} />
                            Copy
                          </button>
                          <button
                            onClick={() => handleReDownload(entry)}
                            title="Re-download HTML"
                            className={btnSecondary}
                          >
                            <Download className="h-3.5 w-3.5" strokeWidth={1.8} />
                            HTML
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            title="Delete"
                            className="flex items-center rounded-full border border-blush/30 bg-blush/10 px-3 py-1.5 font-hand text-sm text-blush-deep transition-colors hover:bg-blush/20"
                          >
                            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.8} />
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
    </main>
  );
}
