/* eslint-disable react-hooks/set-state-in-effect -- Reset the controlled form from the selected record when opening. */
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EXPENSE_CATEGORIES, EXPENSE_ICON_MAP } from "@/lib/constants";
import { useSettingsStore } from "@/stores/settingsStore";
import { useUIStore } from "@/stores/uiStore";
import type { Expense, ExpenseCategory } from "@/types/expense";
import { toLocalDateString } from "@/lib/billUtils";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  expense?: Expense;
  onSave: (e: Expense) => void;
}

const EMPTY = {
  date: "",
  description: "",
  category: "Food & Drinks" as ExpenseCategory,
  iconKey: "Coffee",
  amount: "",
  notes: "",
};

function ExpIcon({ iconKey }: { iconKey: string }) {
  const Icon = EXPENSE_ICON_MAP[iconKey] ?? EXPENSE_ICON_MAP["Wallet"]!;
  return <Icon className="h-4 w-4" strokeWidth={1.6} />;
}

export function AddEditExpenseDialog({ open, onOpenChange, expense, onSave }: Props) {
  const settings = useSettingsStore((s) => s.settings);
  const referenceDate = useUIStore((s) => s.referenceDate);
  const [form, setForm] = useState({ ...EMPTY });

  useEffect(() => {
    if (open) {
      if (expense) {
        setForm({
          date: expense.date,
          description: expense.description,
          category: expense.category,
          iconKey: expense.iconKey,
          amount: String(expense.amount),
          notes: expense.notes ?? "",
        });
      } else {
        setForm({ ...EMPTY, date: toLocalDateString(referenceDate) });
      }
    }
  }, [open, expense, referenceDate]);

  function handleCategoryChange(cat: ExpenseCategory) {
    const meta = EXPENSE_CATEGORIES.find((c) => c.label === cat);
    setForm((f) => ({ ...f, category: cat, iconKey: meta?.iconKey ?? "Wallet" }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!form.description.trim() || isNaN(amount) || amount <= 0) return;
    onSave({
      id: expense?.id ?? crypto.randomUUID(),
      date: form.date,
      description: form.description.trim(),
      category: form.category,
      iconKey: form.iconKey,
      amount,
      notes: form.notes.trim() || undefined,
    });
  }

  const inputClass =
    "w-full rounded-2xl border border-ink/15 bg-white/70 px-4 py-2.5 font-hand text-sm text-ink outline-none focus:border-lilac-deep/40";
  const labelClass = "mb-1.5 block font-hand text-xs uppercase tracking-widest text-ink-soft";

  const selectedMeta = EXPENSE_CATEGORIES.find((c) => c.label === form.category);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl border-0 bg-paper p-0 shadow-xl">
        <div className="p-6">
          <DialogHeader className="mb-5">
            <DialogTitle className="font-script text-3xl text-ink">
              {expense ? "✎ Edit Expense" : "✧ Add Expense"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Date */}
            <div>
              <label className={labelClass}>Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className={inputClass}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className={labelClass}>Description</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="e.g. Morning Coffee"
                className={inputClass}
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className={labelClass}>Category</label>
              <div className="relative">
                <select
                  value={form.category}
                  onChange={(e) => handleCategoryChange(e.target.value as ExpenseCategory)}
                  className={`${inputClass} cursor-pointer appearance-none pr-8`}
                >
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c.label} value={c.label}>{c.label}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft">
                  <span className="text-xs">▾</span>
                </div>
              </div>
              {selectedMeta && (
                <div className="mt-1.5 flex items-center gap-2">
                  <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-hand text-xs ${selectedMeta.tint}`}>
                    <ExpIcon iconKey={form.iconKey} />
                    {form.category}
                  </span>
                </div>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className={labelClass}>Amount</label>
              <div className="relative">
                {settings.currencyPosition === "before" && (
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-hand text-sm text-ink-soft">
                    {settings.currency}
                  </span>
                )}
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  placeholder="0.00"
                  className={`${inputClass} ${settings.currencyPosition === "before" ? "pl-8" : "pr-8"}`}
                  required
                />
                {settings.currencyPosition === "after" && (
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-hand text-sm text-ink-soft">
                    {settings.currency}
                  </span>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className={labelClass}>Notes (optional)</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Any extra details..."
                rows={2}
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 rounded-full bg-blush-deep/80 py-2.5 font-script text-base text-white hover:bg-blush-deep"
              >
                {expense ? "Save Changes" : "Add Expense"}
              </button>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex-1 rounded-full border border-ink/15 bg-white/60 py-2.5 font-hand text-sm text-ink-soft hover:bg-ink/5"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
