import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSettingsStore } from "@/stores/settingsStore";
import { useUIStore } from "@/stores/uiStore";

export function UnlockModal() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const showUnlockModal = useUIStore((s) => s.showUnlockModal);
  const setShowUnlockModal = useUIStore((s) => s.setShowUnlockModal);
  const tryUnlock = useSettingsStore((s) => s.tryUnlock);

  const handleSubmit = async () => {
    const ok = await tryUnlock(code.trim());
    if (!ok) setError("Invalid code. Please try again.");
    else setShowUnlockModal(false);
  };

  return (
    <Dialog open={showUnlockModal} onOpenChange={setShowUnlockModal}>
      <DialogContent className="max-w-sm rounded-3xl border-0 bg-paper p-0 shadow-xl">
        <div className="p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="font-script text-2xl text-ink">
              🔓 Unlock Full Version
            </DialogTitle>
          </DialogHeader>
          <p className="mb-4 font-hand text-sm text-ink-soft">
            Free plan allows 2 bill series. Enter your unlock code to get
            unlimited access.
          </p>
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError("");
            }}
            placeholder="Enter unlock code..."
            className="w-full rounded-2xl border border-ink/15 bg-white/70 px-4 py-2.5 font-hand text-sm text-ink outline-none focus:border-lilac-deep/40"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          {error && (
            <p className="mt-2 font-hand text-sm text-blush-deep">{error}</p>
          )}
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleSubmit}
              className="flex-1 rounded-full bg-lilac-deep/80 py-2.5 font-script text-base text-white hover:bg-lilac-deep"
            >
              Unlock
            </button>
            <button
              onClick={() => setShowUnlockModal(false)}
              className="flex-1 rounded-full border border-ink/15 bg-white/60 py-2.5 font-hand text-sm text-ink-soft hover:bg-ink/5"
            >
              Cancel
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
