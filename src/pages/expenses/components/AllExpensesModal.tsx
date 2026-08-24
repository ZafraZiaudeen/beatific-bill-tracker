import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  format,
  parseISO,
  startOfMonth,
  addMonths,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight, Search, Plus, Pencil, Trash2, X } from "lucide-react";
import { useExpenseStore } from "@/stores/expenseStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useUIStore } from "@/stores/uiStore";
import { EXPENSE_CATEGORIES, EXPENSE_ICON_MAP } from "@/lib/constants";
import type { Expense } from "@/types/expense";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onEdit: (e: Expense) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

function ExpIcon({ iconKey }: { iconKey: string }) {
  const Icon = EXPENSE_ICON_MAP[iconKey] ?? EXPENSE_ICON_MAP["Wallet"]!;
  return <Icon className="h-3.5 w-3.5" strokeWidth={1.6} />;
}

function getCategoryMeta(label: string) {
  return EXPENSE_CATEGORIES.find((c) => c.label === label) ?? EXPENSE_CATEGORIES[8]!;
}

export function AllExpensesModal({ open, onOpenChange, onEdit, onDelete, onAdd }: Props) {
  const expenses = useExpenseStore((s) => s.expenses);
  const settings = useSettingsStore((s) => s.settings);

  const referenceDate = useUIStore((s) => s.referenceDate);
  const setReferenceDate = useUIStore((s) => s.setReferenceDate);
  const viewMonth = startOfMonth(referenceDate);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const monthKey = format(viewMonth, "yyyy-MM");
  const monthLabel = format(viewMonth, "MMMM yyyy");

  const filtered = useMemo(() => {
    return expenses
      .filter((e) => e.date.startsWith(monthKey))
      .filter((e) => catFilter === "All" || e.category === catFilter)
      .filter((e) => e.description.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [expenses, monthKey, catFilter, search]);

  const total = useMemo(() => filtered.reduce((s, e) => s + e.amount, 0), [filtered]);

  const cur = settings.currency;
  const curPos = settings.currencyPosition as "before" | "after";

  function fmt(amount: number) {
    const s = amount.toFixed(2);
    return curPos === "before" ? `${cur}${s}` : `${s}${cur}`;
  }

  function handleDelete(id: string) {
    onDelete(id);
    setConfirmDeleteId(null);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-3xl border-0 bg-paper p-0 shadow-xl">
        {/* Header */}
        <div className="shrink-0 border-b border-ink/10 px-6 pt-6 pb-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <DialogHeader>
              <DialogTitle className="font-script text-3xl text-ink">All Expenses</DialogTitle>
            </DialogHeader>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { onAdd(); onOpenChange(false); }}
                className="flex items-center gap-1.5 rounded-full bg-blush-deep/80 px-4 py-2 font-hand text-sm text-white hover:bg-blush-deep"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                Add
              </button>
            </div>
          </div>

          {/* Month nav */}
          <div className="mb-3 flex items-center gap-2">
            <button
              onClick={() => setReferenceDate(subMonths(viewMonth, 1))}
              className="rounded-full border border-ink/15 bg-white/60 p-1.5 hover:bg-white/80"
            >
              <ChevronLeft className="h-3.5 w-3.5 text-ink-soft" strokeWidth={2} />
            </button>
            <span className="min-w-[110px] text-center font-hand text-sm font-bold text-ink">{monthLabel}</span>
            <button
              onClick={() => setReferenceDate(addMonths(viewMonth, 1))}
              className="rounded-full border border-ink/15 bg-white/60 p-1.5 hover:bg-white/80"
            >
              <ChevronRight className="h-3.5 w-3.5 text-ink-soft" strokeWidth={2} />
            </button>
            <span className="ml-auto font-hand text-sm font-bold text-lilac-deep">{fmt(total)}</span>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink/30" strokeWidth={1.8} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search expenses..."
                className="w-full rounded-2xl border border-ink/15 bg-white/70 py-2 pl-9 pr-4 font-hand text-sm text-ink outline-none focus:border-lilac-deep/40"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="h-3.5 w-3.5 text-ink/40" strokeWidth={2} />
                </button>
              )}
            </div>
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="rounded-2xl border border-ink/15 bg-white/70 px-3 py-2 font-hand text-sm text-ink outline-none focus:border-lilac-deep/40"
            >
              <option value="All">All Categories</option>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c.label} value={c.label}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {filtered.length === 0 ? (
            <p className="py-8 text-center font-hand text-sm text-ink-soft">
              No expenses found for {monthLabel}.
            </p>
          ) : (
            <div className="space-y-1">
              {filtered.map((e) => {
                const meta = getCategoryMeta(e.category);
                const isConfirm = confirmDeleteId === e.id;

                if (isConfirm) {
                  return (
                    <div
                      key={e.id}
                      className="flex items-center justify-between rounded-2xl border border-blush/30 bg-blush/10 px-4 py-3"
                    >
                      <p className="font-hand text-sm text-blush-deep">Delete "{e.description}"?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDelete(e.id)}
                          className="rounded-full bg-blush-deep/80 px-3 py-1 font-hand text-xs text-white hover:bg-blush-deep"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="rounded-full border border-ink/15 bg-white/60 px-3 py-1 font-hand text-xs text-ink-soft hover:bg-white"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={e.id}
                    className="flex items-center gap-3 rounded-2xl border border-transparent px-3 py-2.5 hover:border-ink/8 hover:bg-white/50"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-ink/5 text-ink-soft">
                      <ExpIcon iconKey={e.iconKey} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-hand text-sm text-ink">{e.description}</span>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 font-hand text-[0.6rem] italic ${meta.tint}`}>
                          {e.category}
                        </span>
                      </div>
                      <span className="font-hand text-xs text-ink/40">
                        {format(parseISO(e.date), "MMM d, yyyy")}
                        {e.notes ? ` · ${e.notes}` : ""}
                      </span>
                    </div>
                    <span className="font-hand text-sm font-bold text-ink shrink-0">{fmt(e.amount)}</span>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => { onEdit(e); onOpenChange(false); }}
                        className="rounded-xl border border-ink/10 bg-white/60 p-1.5 text-ink-soft hover:bg-white hover:text-ink"
                      >
                        <Pencil className="h-3 w-3" strokeWidth={1.8} />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(e.id)}
                        className="rounded-xl border border-blush/20 bg-blush/10 p-1.5 text-blush-deep hover:bg-blush/20"
                      >
                        <Trash2 className="h-3 w-3" strokeWidth={1.8} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-ink/10 px-6 py-3 text-center">
          <p className="font-hand text-xs text-ink-soft">{filtered.length} expense{filtered.length !== 1 ? "s" : ""}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
