import { Download, Trash2, Unlock, Upload } from "lucide-react";
import { useBackup } from "@/hooks/useBackup";
import { useSettingsStore } from "@/stores/settingsStore";
import { useUIStore } from "@/stores/uiStore";

export function Backup() {
  const { exportJSON, importJSON, exportCSV, clearAll } = useBackup();
  const activated = useSettingsStore((s) => s.activated);
  const setShowUnlockModal = useUIStore((s) => s.setShowUnlockModal);

  return (
    <main className="dot-grid min-w-0 flex-1 px-5 py-8 sm:px-8">
      <header className="mb-6">
        <h2 className="font-script text-5xl sm:text-6xl">Backup <span className="text-2xl">💾</span></h2>
        <p className="mt-1 font-hand text-sm text-ink-soft">Export, import, or reset your bill tracker data</p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2">
        {/* Export JSON */}
        <div className="paper-card rounded-3xl bg-mint/10 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-mint/30">
              <Download className="h-5 w-5 text-mint-deep" strokeWidth={1.6} />
            </div>
            <div>
              <p className="font-script text-2xl">Export JSON</p>
              <p className="font-hand text-xs text-ink-soft">Full backup of all your data</p>
            </div>
          </div>
          <button onClick={exportJSON}
            className="w-full rounded-full bg-mint-deep/80 py-2.5 font-script text-lg text-white transition-colors hover:bg-mint-deep">
            Download Backup
          </button>
        </div>

        {/* Import JSON */}
        <div className="paper-card rounded-3xl bg-lilac/10 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-lilac/30">
              <Upload className="h-5 w-5 text-lilac-deep" strokeWidth={1.6} />
            </div>
            <div>
              <p className="font-script text-2xl">Import JSON</p>
              <p className="font-hand text-xs text-ink-soft">Restore from a backup file</p>
            </div>
          </div>
          <label className="block w-full cursor-pointer rounded-full bg-lilac-deep/80 py-2.5 text-center font-script text-lg text-white transition-colors hover:bg-lilac-deep">
            Choose File
            <input
              type="file"
              accept=".json"
              className="sr-only"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) importJSON(f); }}
            />
          </label>
        </div>

        {/* Export CSV */}
        <div className="paper-card rounded-3xl bg-butter/10 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-butter/30">
              <Download className="h-5 w-5 text-[oklch(0.62_0.1_80)]" strokeWidth={1.6} />
            </div>
            <div>
              <p className="font-script text-2xl">Export CSV</p>
              <p className="font-hand text-xs text-ink-soft">Download bills as a spreadsheet</p>
            </div>
          </div>
          <button onClick={exportCSV}
            className="w-full rounded-full bg-[oklch(0.62_0.1_80)]/80 py-2.5 font-script text-lg text-white transition-colors hover:bg-[oklch(0.62_0.1_80)]">
            Download CSV
          </button>
        </div>

        {/* Clear All Data */}
        <div className="paper-card rounded-3xl bg-blush/10 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blush/30">
              <Trash2 className="h-5 w-5 text-blush-deep" strokeWidth={1.6} />
            </div>
            <div>
              <p className="font-script text-2xl text-blush-deep">Clear All Data</p>
              <p className="font-hand text-xs text-ink-soft">Reset everything to defaults</p>
            </div>
          </div>
          <button onClick={clearAll}
            className="w-full rounded-full border-2 border-blush-deep/50 bg-transparent py-2.5 font-script text-lg text-blush-deep transition-colors hover:bg-blush/30">
            Reset to Defaults
          </button>
        </div>
      </div>

      {/* Activation status */}
      <div className="mt-6 paper-card rounded-3xl bg-white/80 p-6">
        <p className="font-script text-2xl mb-2">🔓 Version Status</p>
        {activated ? (
          <p className="font-hand text-sm text-mint-deep">✓ Full version activated — unlimited bills</p>
        ) : (
          <div>
            <p className="font-hand text-sm text-ink-soft mb-3">Free plan: 2 bill series. Activate for unlimited.</p>
            <button onClick={() => setShowUnlockModal(true)}
              className="flex items-center gap-2 rounded-full bg-lilac-deep/80 px-5 py-2.5 font-script text-lg text-white hover:bg-lilac-deep">
              <Unlock className="h-4 w-4" /> Enter Unlock Code
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
