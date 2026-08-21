import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Washi } from "@/components/common/Washi";
import {
  CATEGORY_TINT,
  ICON_OPTIONS,
  TINT_OPTIONS,
} from "@/lib/constants";
import { generateRecurringBills } from "@/lib/billUtils";
import { useSettingsStore } from "@/stores/settingsStore";
import { useUIStore } from "@/stores/uiStore";
import { useBillStore } from "@/stores/billStore";
import { useBills } from "@/hooks/useBills";
import type { Bill } from "@/types/bill";

const EMPTY_FORM = {
  name: "",
  amount: "",
  dueDate: "",
  iconKey: "Wifi",
  tint: TINT_OPTIONS[0]!.value,
  notes: "",
  category: "",
  type: "payment",
  priority: "2",
  frequency: "one-time",
  interval: "1",
  endDate: "",
  actualAmount: "",
  actualDate: "",
};

export function AddBillDialog() {
  const addOpen = useUIStore((s) => s.addOpen);
  const setAddOpen = useUIStore((s) => s.setAddOpen);
  const addDefaultCategory = useUIStore((s) => s.addDefaultCategory);
  const addDefaultDate = useUIStore((s) => s.addDefaultDate);
  const setShowUnlockModal = useUIStore((s) => s.setShowUnlockModal);

  const settings = useSettingsStore((s) => s.settings);
  const billGroups = useSettingsStore((s) => s.billGroups);
  const activated = useSettingsStore((s) => s.activated);

  const addBills = useBillStore((s) => s.addBills);
  const { uniqueSeriesCount } = useBills();

  const [form, setForm] = useState({ ...EMPTY_FORM });

  useEffect(() => {
    if (addOpen) {
      setForm({
        ...EMPTY_FORM,
        category: addDefaultCategory,
        dueDate: addDefaultDate,
        tint: addDefaultCategory
          ? (CATEGORY_TINT[addDefaultCategory] ?? TINT_OPTIONS[0]!.value)
          : TINT_OPTIONS[0]!.value,
      });
    }
  }, [addOpen, addDefaultCategory, addDefaultDate]);

  const selectClass =
    "w-full rounded-2xl border border-ink/15 bg-white/70 px-3 py-2.5 font-hand text-sm text-ink outline-none focus:border-lilac-deep/40";
  const inputClass =
    "w-full rounded-2xl border border-ink/15 bg-white/70 px-4 py-2.5 font-hand text-sm text-ink outline-none placeholder:text-ink/30 focus:border-lilac-deep/40";
  const labelClass =
    "mb-1.5 block font-hand text-xs uppercase tracking-widest text-ink-soft";

  const handleCategoryChange = (cat: string) => {
    setForm((f) => ({
      ...f,
      category: cat,
      tint: CATEGORY_TINT[cat] ?? TINT_OPTIONS[0]!.value,
      name: "",
    }));
  };

  const catGroup = billGroups.find((g) => g.title === form.category);
  const nameOptions = catGroup?.names ?? [];

  const canSave = !!(form.category && form.name.trim() && form.amount && form.dueDate);
  const isRecurring = form.frequency !== "one-time";
  const blockedByLimit = !activated && uniqueSeriesCount >= 2;

  const buildBills = (paid: boolean): Bill[] | null => {
    const name = form.name.trim();
    const amount = parseFloat(form.amount);
    if (!name || isNaN(amount) || amount <= 0 || !form.dueDate) return null;
    const id = crypto.randomUUID();
    const baseBill: Bill = {
      id,
      seriesId: id,
      name,
      category: form.category || "Other",
      type: form.type as "payment" | "refund",
      amount,
      actualAmount: null,
      dueDate: form.dueDate,
      actualDate: null,
      priority: parseInt(form.priority) || 2,
      frequency: form.frequency as Bill["frequency"],
      interval: parseInt(form.interval) || 1,
      endDate: form.endDate || null,
      paid,
      notes: form.notes.trim(),
      iconKey: form.iconKey,
      tint: form.tint,
    };
    return generateRecurringBills(baseBill);
  };

  const handleSave = (paid = false, another = false) => {
    if (!canSave) return;
    if (!activated && uniqueSeriesCount >= 2) {
      setShowUnlockModal(true);
      return;
    }
    const bills = buildBills(paid);
    if (!bills) return;
    addBills(bills);
    if (!another) setAddOpen(false);
    else setForm((f) => ({ ...EMPTY_FORM, category: f.category, tint: f.tint }));
  };

  return (
    <Dialog open={addOpen} onOpenChange={setAddOpen}>
      <DialogContent className="max-w-lg rounded-3xl border-0 bg-paper p-0 shadow-xl">
        <div className="relative overflow-hidden rounded-3xl">
          <Washi className="-right-4 -top-3 h-10 w-40 rotate-45 opacity-70" />
          <div className="p-6 sm:p-7">
            <DialogHeader className="mb-5">
              <DialogTitle className="font-script text-3xl text-ink">
                🗒️ Add a Bill
              </DialogTitle>
            </DialogHeader>

            {blockedByLimit && (
              <div className="mb-4 rounded-2xl bg-blush/30 px-4 py-3 text-center">
                <p className="font-hand text-sm text-blush-deep">
                  Free plan: 2 bill series max.
                </p>
                <button
                  onClick={() => setShowUnlockModal(true)}
                  className="mt-1 font-hand text-sm underline text-lilac-deep hover:text-lilac-deep/70"
                >
                  Unlock full version →
                </button>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>📁 Category</label>
                <select
                  value={form.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className={selectClass}
                >
                  <option value="">Category</option>
                  {settings.categoryNames.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>🏷️ Bill Name</label>
                {form.category ? (
                  <select
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    className={selectClass}
                    disabled={nameOptions.length === 0}
                  >
                    <option value="">
                      {nameOptions.length === 0
                        ? "Add names in Settings"
                        : "Select name"}
                    </option>
                    {nameOptions.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select value="" disabled className={selectClass}>
                    <option>Select category first</option>
                  </select>
                )}
              </div>
              <div>
                <label className={labelClass}>🎨 Icon</label>
                <select
                  value={form.iconKey}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, iconKey: e.target.value }))
                  }
                  className={selectClass}
                >
                  {ICON_OPTIONS.map((o) => (
                    <option key={o.key} value={o.key}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>💸 Type</label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, type: e.target.value }))
                  }
                  className={selectClass}
                >
                  <option value="payment">Payment</option>
                  <option value="refund">Refund</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>💰 Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-hand text-sm text-ink-soft">
                    {settings.currency}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, amount: e.target.value }))
                    }
                    placeholder="0.00"
                    className={`${inputClass} pl-8`}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>📅 Due Date</label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, dueDate: e.target.value }))
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>🚨 Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, priority: e.target.value }))
                  }
                  className={selectClass}
                >
                  {settings.priorityNames.map((p, i) => (
                    <option key={i} value={String(i)}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className={labelClass}>⏱️ Frequency</label>
                <div className="flex gap-2">
                  <select
                    value={form.frequency}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, frequency: e.target.value }))
                    }
                    className={selectClass}
                  >
                    <option value="one-time">One-time</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                  {isRecurring && (
                    <input
                      type="number"
                      min="1"
                      value={form.interval}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, interval: e.target.value }))
                      }
                      className={`${inputClass} w-16`}
                      title="Every N intervals"
                    />
                  )}
                </div>
              </div>

              {isRecurring && (
                <div className="col-span-3">
                  <label className={labelClass}>🔚 End Date (optional)</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, endDate: e.target.value }))
                    }
                    className={inputClass}
                  />
                </div>
              )}

              <div className="col-span-3">
                <label className={labelClass}>🥕 Notes (optional)</label>
                <textarea
                  value={form.notes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, notes: e.target.value }))
                  }
                  placeholder="Optional note..."
                  rows={2}
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => handleSave(false)}
                disabled={!canSave}
                className="flex-1 rounded-full bg-blush-deep/80 py-2.5 font-script text-base text-white transition-colors hover:bg-blush-deep disabled:cursor-not-allowed disabled:opacity-40"
              >
                Save Bill
              </button>
              <button
                type="button"
                onClick={() => handleSave(false, true)}
                disabled={!canSave}
                className="flex-1 rounded-full bg-lilac-deep/80 py-2.5 font-script text-base text-white transition-colors hover:bg-lilac-deep disabled:cursor-not-allowed disabled:opacity-40"
              >
                Save &amp; Add Another
              </button>
              <button
                type="button"
                onClick={() => handleSave(true)}
                disabled={!canSave}
                className="flex-1 rounded-full bg-mint-deep/80 py-2.5 font-script text-base text-white transition-colors hover:bg-mint-deep disabled:cursor-not-allowed disabled:opacity-40"
              >
                Save &amp; Mark Paid
              </button>
            </div>
            <button
              type="button"
              onClick={() => setAddOpen(false)}
              className="mt-2 w-full rounded-full border border-ink/15 bg-white/60 py-2 font-hand text-sm text-ink-soft transition-colors hover:bg-ink/5"
            >
              Cancel
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
