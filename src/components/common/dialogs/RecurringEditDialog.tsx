/* eslint-disable react-hooks/set-state-in-effect -- Copy the selected bill into an editable draft when the dialog opens. */
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useBillStore } from "@/stores/billStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useUIStore } from "@/stores/uiStore";
import type { Bill } from "@/types/bill";

export function RecurringEditDialog() {
  const editingBill = useUIStore((s) => s.editingBill);
  const setEditingBill = useUIStore((s) => s.setEditingBill);
  const updateBill = useBillStore((s) => s.updateBill);
  const settings = useSettingsStore((s) => s.settings);

  const [mode, setMode] = useState<"choose" | "edit">("choose");
  const [scope, setScope] = useState<"this" | "fromHere">("this");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState("2");
  const [actualAmount, setActualAmount] = useState("");
  const [actualDate, setActualDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (editingBill) {
      setNotes(editingBill.notes);
      setPriority(String(editingBill.priority));
      setActualAmount(
        editingBill.actualAmount != null ? String(editingBill.actualAmount) : ""
      );
      setActualDate(editingBill.actualDate ?? "");
      setEndDate(editingBill.endDate ?? "");
      setScope("this");
      setMode(editingBill.frequency === "one-time" ? "edit" : "choose");
    }
  }, [editingBill]);

  const bill = editingBill;
  if (!bill) return null;

  const handleClose = () => {
    setEditingBill(null);
    setMode("choose");
  };

  const handleSave = () => {
    const changes: Partial<Bill> = {
      notes,
      priority: parseInt(priority) || 2,
      actualAmount: actualAmount ? parseFloat(actualAmount) : null,
      actualDate: actualDate || null,
      endDate: endDate || null,
    };
    const effectiveScope = scope === "fromHere" && actualDate ? "this" : scope;
    updateBill(bill.id, changes, effectiveScope);
    handleClose();
  };

  const inputClass =
    "w-full rounded-2xl border border-ink/15 bg-white/70 px-4 py-2.5 font-hand text-sm text-ink outline-none placeholder:text-ink/30 focus:border-lilac-deep/40";
  const selectClass =
    "w-full rounded-2xl border border-ink/15 bg-white/70 px-3 py-2.5 font-hand text-sm text-ink outline-none focus:border-lilac-deep/40";
  const readOnlyClass =
    "w-full rounded-2xl border border-ink/15 bg-ink/[0.04] px-4 py-2.5 font-hand text-sm text-ink/45 outline-none";
  const readOnlySelectClass =
    "w-full rounded-2xl border border-ink/15 bg-ink/[0.04] px-3 py-2.5 font-hand text-sm text-ink/45 outline-none";
  const labelClass =
    "mb-1.5 block font-hand text-xs uppercase tracking-widest text-ink-soft";

  if (mode === "choose") {
    return (
      <Dialog open={!!bill} onOpenChange={handleClose}>
        <DialogContent className="max-w-sm rounded-3xl border-0 bg-paper p-0 shadow-xl">
          <div className="p-6">
            <DialogHeader className="mb-4">
              <DialogTitle className="font-script text-2xl text-ink">
                Edit Recurring Bill
              </DialogTitle>
            </DialogHeader>
            <p className="mb-5 font-hand text-sm text-ink-soft">
              "{bill.name}" repeats {bill.frequency}. How would you like to
              edit?
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setScope("this");
                  setMode("edit");
                }}
                className="rounded-2xl bg-blush/30 px-4 py-3 text-left font-hand text-sm text-blush-deep transition-colors hover:bg-blush/50"
              >
                Edit this occurrence only
              </button>
              <button
                onClick={() => {
                  setScope("fromHere");
                  setMode("edit");
                }}
                className="rounded-2xl bg-lilac/30 px-4 py-3 text-left font-hand text-sm text-lilac-deep transition-colors hover:bg-lilac/50"
              >
                Edit this and all future occurrences
              </button>
            </div>
            <button
              onClick={handleClose}
              className="mt-3 w-full rounded-full border border-ink/15 bg-white/60 py-2 font-hand text-sm text-ink-soft hover:bg-ink/5"
            >
              Cancel
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={!!bill} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl rounded-3xl border-0 bg-paper p-0 shadow-xl">
        <div className="p-6 sm:p-7">
          <DialogHeader className="mb-5">
            <DialogTitle className="font-script text-3xl text-ink">
              Edit bill
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className={labelClass}>Category</label>
              <select
                value={bill.category}
                disabled
                className={readOnlySelectClass}
              >
                <option value={bill.category}>{bill.category || "Other"}</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Bill name</label>
              <select value={bill.name} disabled className={readOnlySelectClass}>
                <option value={bill.name}>{bill.name}</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Type</label>
              <select value={bill.type} disabled className={readOnlySelectClass}>
                <option value="payment">Payment</option>
                <option value="refund">Refund</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Planned Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-hand text-sm text-ink/35">
                  {settings.currency}
                </span>
                <input
                  type="number"
                  value={bill.amount}
                  disabled
                  className={`${readOnlyClass} pl-8`}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Due date</label>
              <input
                type="date"
                value={bill.dueDate}
                disabled
                className={readOnlyClass}
              />
            </div>
            <div>
              <label className={labelClass}>Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className={selectClass}
              >
                {settings.priorityNames.map((p, i) => (
                  <option key={i} value={String(i)}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>New/Paid Amount</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={actualAmount}
                onChange={(e) => setActualAmount(e.target.value)}
                placeholder="0.00"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>New/Paid Date</label>
              <input
                type="date"
                value={actualDate}
                onChange={(e) => setActualDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Frequency</label>
              <select
                value={bill.frequency}
                disabled
                className={readOnlySelectClass}
              >
                <option value="one-time">One-time</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Interval</label>
              <input
                type="number"
                value={bill.interval}
                disabled
                className={readOnlyClass}
              />
            </div>
            <div>
              <label className={labelClass}>End date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className={labelClass}>Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Optional note..."
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button
              onClick={handleSave}
              className="rounded-full bg-blush-deep/70 px-8 py-2.5 font-script text-base text-white hover:bg-blush-deep"
            >
              Save
            </button>
            <button
              onClick={handleClose}
              className="rounded-full border border-ink/15 bg-white/60 px-6 py-2.5 font-hand text-sm text-ink-soft hover:bg-ink/5"
            >
              Cancel
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
