import { useState, useMemo } from "react";
import {
  PieChart as RPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  format,
  parseISO,
  startOfMonth,
  addMonths,
  subMonths,
  getDaysInMonth,
  getDate,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Sprout,
  Heart,
  CalendarDays,
  Star,
  Plus,
  Circle,
} from "lucide-react";
import { useExpenseStore } from "@/stores/expenseStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useUIStore } from "@/stores/uiStore";
import { EXPENSE_CATEGORIES, EXPENSE_ICON_MAP } from "@/lib/constants";
import type { Expense } from "@/types/expense";
import { AddEditExpenseDialog } from "./components/AddEditExpenseDialog";
import { AllExpensesModal } from "./components/AllExpensesModal";
import { HeaderDatePicker } from "@/components/common/HeaderDatePicker";

function fmt(amount: number, currency: string, pos: "before" | "after") {
  const s = amount.toFixed(2);
  return pos === "before" ? `${currency}${s}` : `${s}${currency}`;
}

function ExpIcon({ iconKey, className = "h-4 w-4" }: { iconKey: string; className?: string }) {
  const Icon = EXPENSE_ICON_MAP[iconKey] ?? EXPENSE_ICON_MAP["Wallet"]!;
  return <Icon className={className} strokeWidth={1.6} />;
}

function getCategoryMeta(label: string) {
  return EXPENSE_CATEGORIES.find((c) => c.label === label) ?? EXPENSE_CATEGORIES[8]!;
}

export function Expenses() {
  const expenses = useExpenseStore((s) => s.expenses);
  const addExpense = useExpenseStore((s) => s.addExpense);
  const updateExpense = useExpenseStore((s) => s.updateExpense);
  const deleteExpense = useExpenseStore((s) => s.deleteExpense);
  const settings = useSettingsStore((s) => s.settings);

  const referenceDate = useUIStore((s) => s.referenceDate);
  const setReferenceDate = useUIStore((s) => s.setReferenceDate);
  const viewMonth = startOfMonth(referenceDate);
  const [addOpen, setAddOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [allOpen, setAllOpen] = useState(false);
  const [notesByMonth, setNotesByMonth] = useState<Record<string, string>>(() => {
    const key = `pdj-expense-notes-${format(startOfMonth(referenceDate), "yyyy-MM")}`;
    return { [format(startOfMonth(referenceDate), "yyyy-MM")]: localStorage.getItem(key) ?? "" };
  });

  const monthKey = format(viewMonth, "yyyy-MM");
  const monthLabel = format(viewMonth, "MMMM yyyy");

  const notes = notesByMonth[monthKey] ?? localStorage.getItem(`pdj-expense-notes-${monthKey}`) ?? "";

  const monthExpenses = useMemo(
    () => expenses.filter((e) => e.date.startsWith(monthKey)).sort((a, b) => b.date.localeCompare(a.date)),
    [expenses, monthKey]
  );

  const totalExpenses = useMemo(
    () => monthExpenses.reduce((sum, e) => sum + e.amount, 0),
    [monthExpenses]
  );

  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of monthExpenses) {
      map[e.category] = (map[e.category] ?? 0) + e.amount;
    }
    return Object.entries(map)
      .map(([label, total]) => ({ label, total, meta: getCategoryMeta(label) }))
      .sort((a, b) => b.total - a.total);
  }, [monthExpenses]);

  const pieData = useMemo(
    () =>
      byCategory.length > 0
        ? byCategory.map((c) => ({ name: c.label, value: c.total, color: c.meta.chartColor }))
        : [{ name: "empty", value: 1, color: "#e5e7eb" }],
    [byCategory]
  );

  const avgPerDay = useMemo(() => {
    const daysElapsed = Math.min(Math.max(getDate(referenceDate), 1), getDaysInMonth(viewMonth));
    return totalExpenses / daysElapsed;
  }, [referenceDate, totalExpenses, viewMonth]);

  const highestDay = useMemo(() => {
    const byDay: Record<string, number> = {};
    for (const e of monthExpenses) {
      byDay[e.date] = (byDay[e.date] ?? 0) + e.amount;
    }
    const entries = Object.entries(byDay);
    if (entries.length === 0) return null;
    const [date, amount] = entries.sort((a, b) => b[1] - a[1])[0]!;
    return { date: format(parseISO(date), "MMM d"), amount };
  }, [monthExpenses]);

  const recentRows = monthExpenses.slice(0, 10);

  const cur = settings.currency;
  const curPos = settings.currencyPosition as "before" | "after";

  function handleSaveExpense(e: Expense) {
    if (editingExpense) {
      updateExpense(e.id, e);
    } else {
      addExpense(e);
    }
    setAddOpen(false);
    setEditingExpense(null);
  }

  function handleEditFromAll(e: Expense) {
    setEditingExpense(e);
    setAddOpen(true);
  }

  function handleNotesChange(val: string) {
    setNotesByMonth((current) => ({ ...current, [monthKey]: val }));
    const key = `pdj-expense-notes-${monthKey}`;
    localStorage.setItem(key, val);
  }

  function changeMonth(dir: 1 | -1) {
    const next = dir === 1 ? addMonths(viewMonth, 1) : subMonths(viewMonth, 1);
    setReferenceDate(next);
  }

  return (
    <main className="dot-grid min-w-0 flex-1 px-5 py-8 sm:px-8">
      {/* Header */}
      <header className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blush/30">
            <Sprout className="h-7 w-7 text-blush-deep" strokeWidth={1.6} />
          </div>
          <div>
            <h2 className="font-script text-5xl sm:text-6xl">Expenses</h2>
            <p className="mt-1 font-hand text-sm text-ink-soft">Track your daily & variable spending</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <HeaderDatePicker />
          <button
            onClick={() => { setEditingExpense(null); setAddOpen(true); }}
            className="flex items-center gap-2 rounded-full bg-blush-deep/80 px-4 py-2.5 font-hand text-sm text-white transition-colors hover:bg-blush-deep"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            Add Expense
          </button>
        </div>
      </header>

      {/* Total Variable Expenses card */}
      <div className="paper-card mb-5 flex items-center justify-between rounded-3xl bg-white/85 px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blush/25">
            <ExpIcon iconKey="Wallet" className="h-6 w-6 text-blush-deep" />
          </div>
          <div>
            <p className="font-hand text-xs uppercase tracking-widest text-ink-soft">Total Variable Expenses</p>
            <p className="font-script text-4xl text-ink">{fmt(totalExpenses, cur, curPos)}</p>
          </div>
        </div>
        <div className="hidden items-end gap-3 sm:flex">
          <p className="text-right font-hand text-sm italic text-ink-soft leading-relaxed">
            Tracking today's choices,<br />building tomorrow's freedom.
          </p>
          <Heart className="h-5 w-5 shrink-0 text-blush-deep/60" strokeWidth={1.5} />
        </div>
      </div>

      {/* Month nav */}
      <div className="mb-5 flex items-center gap-3">
        <button
          onClick={() => changeMonth(-1)}
          className="rounded-full border border-ink/15 bg-white/60 p-1.5 hover:bg-white/80"
        >
          <ChevronLeft className="h-4 w-4 text-ink-soft" strokeWidth={2} />
        </button>
        <span className="min-w-[120px] text-center font-hand text-sm font-bold text-ink">{monthLabel}</span>
        <button
          onClick={() => changeMonth(1)}
          className="rounded-full border border-ink/15 bg-white/60 p-1.5 hover:bg-white/80"
        >
          <ChevronRight className="h-4 w-4 text-ink-soft" strokeWidth={2} />
        </button>
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
        {/* LEFT */}
        <div className="flex flex-col gap-5">
          {/* Daily & Variable Spending table */}
          <div className="paper-card rounded-3xl bg-white/85 p-6">
            <p className="mb-4 font-script text-2xl">Daily &amp; Variable Spending ♡</p>

            {recentRows.length === 0 ? (
              <p className="py-6 text-center font-hand text-sm text-ink-soft">
                No expenses for {monthLabel}. Add one above!
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px]">
                  <thead>
                    <tr className="border-b border-ink/10">
                      {["DATE", "DESCRIPTION", "CATEGORY", "AMOUNT"].map((h) => (
                        <th key={h} className="pb-2 pr-4 text-left font-hand text-[0.6rem] uppercase tracking-widest text-ink-soft last:pr-0 last:text-right">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentRows.map((e) => {
                      const meta = getCategoryMeta(e.category);
                      return (
                        <tr
                          key={e.id}
                          className="group border-b border-ink/5 last:border-0 hover:bg-ink/[0.015]"
                        >
                          <td className="py-2.5 pr-4">
                            <span className="font-hand text-xs text-ink-soft">
                              {format(parseISO(e.date), "MMM d, yyyy")}
                            </span>
                          </td>
                          <td className="py-2.5 pr-4">
                            <div className="flex items-center gap-2">
                              <Circle className="h-3 w-3 shrink-0 text-ink/20" strokeWidth={1.5} />
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-ink/5 text-ink-soft">
                                <ExpIcon iconKey={e.iconKey} className="h-3.5 w-3.5" />
                              </span>
                              <span className="font-hand text-sm text-ink">{e.description}</span>
                            </div>
                          </td>
                          <td className="py-2.5 pr-4">
                            <span className={`rounded-full px-2.5 py-0.5 font-hand text-xs italic ${meta.tint}`}>
                              {e.category}
                            </span>
                          </td>
                          <td className="py-2.5 text-right">
                            <span className="font-hand text-sm font-bold text-ink">
                              {fmt(e.amount, cur, curPos)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* View All button */}
            <div className="mt-5 flex items-center justify-center gap-3">
              <span className="font-hand text-lg text-ink/20">❀</span>
              <button
                onClick={() => setAllOpen(true)}
                className="font-hand text-sm text-lilac-deep underline-offset-2 hover:underline"
              >
                View All Expenses →
              </button>
              <span className="font-hand text-lg text-ink/20">❀</span>
            </div>
          </div>

          {/* Notes */}
          <div className="paper-card rounded-3xl bg-white/85 p-6">
            <p className="mb-4 font-script text-2xl">Notes ♡</p>
            <textarea
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Jot down your spending thoughts for this month..."
              rows={5}
              className="w-full resize-none rounded-2xl border border-ink/10 bg-transparent px-0 py-1 font-hand text-sm text-ink outline-none placeholder:text-ink/30"
              style={{
                backgroundImage: "repeating-linear-gradient(transparent, transparent 27px, oklch(0.75 0.01 240 / 0.25) 27px, oklch(0.75 0.01 240 / 0.25) 28px)",
                lineHeight: "28px",
                paddingBottom: "4px",
              }}
            />
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-5">
          {/* Spending by Category */}
          <div className="paper-card rounded-3xl bg-white/85 p-6">
            <p className="mb-4 font-script text-2xl">Spending by Category ♡</p>

            {byCategory.length === 0 ? (
              <p className="py-4 text-center font-hand text-sm text-ink-soft">No data yet</p>
            ) : (
              <div className="flex items-center gap-4">
                {/* Pie chart */}
                <div className="h-44 w-44 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <RPieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={78}
                        dataKey="value"
                        paddingAngle={pieData.length > 1 ? 1 : 0}
                        strokeWidth={0}
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v: unknown) => [fmt(Number(v ?? 0), cur, curPos), ""]}
                        contentStyle={{ fontFamily: "inherit", fontSize: 12, borderRadius: 12, border: "1px solid rgba(0,0,0,0.1)" }}
                      />
                    </RPieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div className="flex-1 space-y-1.5">
                  {byCategory.map((c) => (
                    <div key={c.label} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: c.meta.chartColor }}
                        />
                        <span className="truncate font-hand text-xs text-ink-soft">{c.label}</span>
                      </div>
                      <span className="font-hand text-xs font-bold text-ink shrink-0">
                        {fmt(c.total, cur, curPos)}
                      </span>
                    </div>
                  ))}
                  <div className="mt-2 border-t border-ink/10 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="font-hand text-sm font-bold text-ink">Total</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-hand text-sm font-bold text-lilac-deep">
                          {fmt(totalExpenses, cur, curPos)}
                        </span>
                        <Heart className="h-3.5 w-3.5 text-blush-deep/60" strokeWidth={1.5} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Spending Snapshot */}
          <div className="paper-card rounded-3xl bg-white/85 p-6">
            <p className="mb-4 font-script text-2xl">✦ Spending Snapshot</p>
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 shrink-0 text-blush-deep" strokeWidth={1.5} />
                  <span className="font-hand text-sm text-ink-soft">Average per day</span>
                </div>
                <span className="font-hand text-sm font-bold text-ink">
                  {fmt(avgPerDay, cur, curPos)}
                </span>
              </div>

              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 shrink-0 text-lilac-deep" strokeWidth={1.5} />
                  <span className="font-hand text-sm text-ink-soft">Highest spending day</span>
                </div>
                {highestDay ? (
                  <div className="text-right">
                    <p className="font-hand text-xs text-ink-soft">{highestDay.date}</p>
                    <p className="font-hand text-sm font-bold text-ink">
                      {fmt(highestDay.amount, cur, curPos)}
                    </p>
                  </div>
                ) : (
                  <span className="font-hand text-sm text-ink-soft">—</span>
                )}
              </div>

              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 shrink-0 text-butter-deep" strokeWidth={1.5} />
                  <span className="font-hand text-sm text-ink-soft">Most spent category</span>
                </div>
                {byCategory[0] ? (
                  <div className="text-right">
                    <p className="font-hand text-xs text-ink-soft">{byCategory[0].label}</p>
                    <p className="font-hand text-sm font-bold text-ink">
                      {fmt(byCategory[0].total, cur, curPos)}
                    </p>
                  </div>
                ) : (
                  <span className="font-hand text-sm text-ink-soft">—</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <AddEditExpenseDialog
        open={addOpen}
        onOpenChange={(o) => { setAddOpen(o); if (!o) setEditingExpense(null); }}
        expense={editingExpense ?? undefined}
        onSave={handleSaveExpense}
      />
      <AllExpensesModal
        open={allOpen}
        onOpenChange={setAllOpen}
        onEdit={handleEditFromAll}
        onDelete={deleteExpense}
        onAdd={() => { setEditingExpense(null); setAddOpen(true); }}
      />
    </main>
  );
}
