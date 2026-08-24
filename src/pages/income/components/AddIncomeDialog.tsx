/* eslint-disable react-hooks/set-state-in-effect -- Reset the controlled form from the selected record when opening. */
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useIncomeStore } from "@/stores/incomeStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useUIStore } from "@/stores/uiStore";
import { toLocalDateString } from "@/lib/billUtils";
import type { IncomeEntry } from "@/types/income";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  entry?: IncomeEntry;
}

const EMPTY = { date: "", source: "", amount: "", notes: "" };

export function AddIncomeDialog({ open, onOpenChange, entry }: Props) {
  const addEntry = useIncomeStore((s) => s.addEntry);
  const updateEntry = useIncomeStore((s) => s.updateEntry);
  const settings = useSettingsStore((s) => s.settings);
  const referenceDate = useUIStore((s) => s.referenceDate);
  const cur = settings.currency;

  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (open) {
      if (entry) {
        setForm({
          date: entry.date,
          source: entry.source,
          amount: String(entry.amount),
          notes: entry.notes ?? "",
        });
      } else {
        setForm({ ...EMPTY, date: toLocalDateString(referenceDate) });
      }
    }
  }, [open, entry, referenceDate]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!form.date || !form.source || isNaN(amount) || amount <= 0) return;
    if (entry) {
      updateEntry(entry.id, {
        date: form.date,
        source: form.source,
        amount,
        notes: form.notes || undefined,
      });
    } else {
      addEntry({
        id: `inc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        date: form.date,
        source: form.source,
        amount,
        notes: form.notes || undefined,
      });
    }
    onOpenChange(false);
  }

  const inputClass =
    "w-full rounded-2xl border border-ink/15 bg-white/70 px-4 py-2.5 font-hand text-sm text-ink outline-none focus:border-lilac-deep/40";
  const labelClass = "font-hand text-[0.65rem] uppercase tracking-widest text-ink-soft mb-1.5 block";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-3xl border-0 bg-paper p-6 shadow-xl">
        <DialogHeader>
          <DialogTitle className="font-script text-3xl text-ink">
            {entry ? "✧ Edit Income" : "✧ Add Income"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className={labelClass}>Date</label>
            <input type="date" required value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Source</label>
            <input type="text" required placeholder="e.g. Salary, Freelance, Rental"
              value={form.source}
              onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
              className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Amount</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-hand text-sm text-ink-soft">
                {cur}
              </span>
              <input type="number" required min={0.01} step={0.01} placeholder="0.00"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                className={`${inputClass} pl-8`} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Notes (optional)</label>
            <textarea rows={2} placeholder="Any notes..."
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className={`${inputClass} resize-none`} />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="submit"
              className="flex-1 rounded-full bg-mint-deep/80 py-2.5 font-hand text-sm text-white hover:bg-mint-deep">
              {entry ? "Save Changes" : "Add Income"}
            </button>
            <button type="button" onClick={() => onOpenChange(false)}
              className="flex-1 rounded-full border border-ink/15 bg-white/60 py-2.5 font-hand text-sm text-ink-soft hover:bg-white">
              Cancel
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
