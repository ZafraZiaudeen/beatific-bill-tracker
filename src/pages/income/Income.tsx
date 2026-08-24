import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { format, subMonths, startOfMonth, parseISO } from "date-fns";
import {
  Heart,
  Pencil,
  PiggyBank,
  Plus,
  ShoppingCart,
  Star,
  Trash2,
  Wallet,
} from "lucide-react";
import { useIncomeStore } from "@/stores/incomeStore";
import { useBillStore } from "@/stores/billStore";
import { useExpenseStore } from "@/stores/expenseStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useUIStore } from "@/stores/uiStore";
import { getBillDisplayDate, fmtCurrency, sumBills } from "@/lib/billUtils";
import { AddIncomeDialog } from "@/pages/income/components/AddIncomeDialog";
import type { IncomeEntry } from "@/types/income";
import { HeaderDatePicker } from "@/components/common/HeaderDatePicker";

import sprig from "@/assets/doodle-sprig.png";
import vase from "@/assets/doodle-vase.png";
import cloudImg from "@/assets/cloud (1).png";
import springBinding from "@/assets/springFourX.png";

const TOOLTIP_STYLE = {
  fontFamily: "inherit",
  fontSize: 12,
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.08)",
  background: "oklch(0.98 0.002 240)",
};

export function Income() {
  const entries = useIncomeStore((s) => s.entries);
  const deleteEntry = useIncomeStore((s) => s.deleteEntry);
  const bills = useBillStore((s) => s.bills);
  const expenses = useExpenseStore((s) => s.expenses);
  const settings = useSettingsStore((s) => s.settings);

  const now = useUIStore((s) => s.referenceDate);
  const cur = settings.currency;
  const curPos = settings.currencyPosition as "before" | "after";
  const fmt = (n: number) => fmtCurrency(n, cur, curPos);
  const currentKey = format(now, "yyyy-MM");

  const [addOpen, setAddOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<IncomeEntry | undefined>();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // This month stats
  const { thisMonthIncome, trackedBills, variableExpenses, availableToSave } = useMemo(() => {
    const thisMonthIncome = entries
      .filter((e) => e.date.startsWith(currentKey))
      .reduce((s, e) => s + e.amount, 0);
    const trackedBills = Math.abs(sumBills(bills.filter((b) => getBillDisplayDate(b).startsWith(currentKey))));
    const variableExpenses = expenses.filter((e) => e.date.startsWith(currentKey)).reduce((s, e) => s + e.amount, 0);
    const availableToSave = thisMonthIncome - trackedBills - variableExpenses;
    return { thisMonthIncome, trackedBills, variableExpenses, availableToSave };
  }, [entries, bills, expenses, currentKey]);

  // 6-month savings rate chart
  const savingsChartData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const m = startOfMonth(subMonths(now, 5 - i));
      const key = format(m, "yyyy-MM");
      const inc = entries.filter((e) => e.date.startsWith(key)).reduce((s, e) => s + e.amount, 0);
      const bill = Math.abs(sumBills(bills.filter((b) => getBillDisplayDate(b).startsWith(key))));
      const exp = expenses.filter((e) => e.date.startsWith(key)).reduce((s, e) => s + e.amount, 0);
      const totalOut = bill + exp;
      const rate = inc > 0 ? Math.max(0, Math.min(100, Math.round(((inc - totalOut) / inc) * 100))) : 0;
      return { month: format(m, "MMM"), rate, hasIncome: inc > 0 };
    });
  }, [entries, bills, expenses, now]);

  const hasAnyIncome = entries.length > 0;
  const thisMonthEntries = entries
    .filter((e) => e.date.startsWith(currentKey))
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <main className="dot-grid min-w-0 flex-1 px-5 py-8 sm:px-8">
      {/* Header */}
      <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <h2 className="flex min-w-0 items-center gap-2 font-script text-4xl leading-none sm:gap-3 sm:text-[3.25rem]">
          Income & Savings
          <img src={sprig} alt="" aria-hidden loading="lazy"
            className="h-10 w-10 shrink-0 object-contain sm:h-12 sm:w-12" />
        </h2>
        <div className="flex items-center gap-3">
          <HeaderDatePicker />
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-lilac shadow-sm">
            <img src={cloudImg} alt="" aria-hidden loading="lazy" className="h-8 w-8 object-contain opacity-80" />
          </div>
        </div>
      </header>

      {/* Tagline banner */}
      <div className="paper-card relative mb-6 overflow-hidden rounded-[2rem] bg-blush/50 px-8 py-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Heart className="h-5 w-5 shrink-0 text-blush-deep/60" strokeWidth={1.4} />
            <p className="font-script text-xl text-ink sm:text-2xl">
              Give every rupee a purpose, one gentle step at a time.
            </p>
          </div>
          <button
            onClick={() => { setEditingEntry(undefined); setAddOpen(true); }}
            className="shrink-0 flex items-center gap-2 rounded-full bg-lilac-deep/80 px-5 py-2.5 font-hand text-sm text-white hover:bg-lilac-deep shadow-sm">
            <Plus className="h-4 w-4" strokeWidth={2} /> Add Income
          </button>
        </div>
      </div>

      {/* 4 Stat cards */}
      <div className="paper-card relative mb-6 overflow-hidden rounded-[2rem] bg-white/85">
        <div className="grid grid-cols-2 divide-x divide-y divide-ink/8 xl:grid-cols-4 xl:divide-y-0">
          {/* Income This Month */}
          <div className="px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mint/40">
                <Heart className="h-4.5 w-4.5 text-mint-deep" strokeWidth={1.6} />
              </div>
              <div className="min-w-0">
                <p className="font-script text-lg leading-tight">Income This Month</p>
                <div className="dashed-rule mt-0.5" />
              </div>
            </div>
            {thisMonthIncome > 0 ? (
              <p className="font-sans text-2xl font-extrabold text-mint-deep">{fmt(thisMonthIncome)}</p>
            ) : (
              <p className="font-script text-lg italic text-mint-deep/70">Not added yet</p>
            )}
          </div>

          {/* Tracked Bills */}
          <div className="px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blush/40">
                <Wallet className="h-4.5 w-4.5 text-blush-deep" strokeWidth={1.6} />
              </div>
              <div className="min-w-0">
                <p className="font-script text-lg leading-tight">Tracked Bills</p>
                <div className="dashed-rule mt-0.5" />
              </div>
            </div>
            <p className="font-sans text-2xl font-extrabold text-blush-deep">{fmt(trackedBills)}</p>
          </div>

          {/* Variable Expenses */}
          <div className="px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lilac/40">
                <ShoppingCart className="h-4.5 w-4.5 text-lilac-deep" strokeWidth={1.6} />
              </div>
              <div className="min-w-0">
                <p className="font-script text-lg leading-tight">Variable Expenses</p>
                <div className="dashed-rule mt-0.5" />
              </div>
            </div>
            <p className="font-sans text-2xl font-extrabold text-lilac-deep">{fmt(variableExpenses)}</p>
          </div>

          {/* Available to Save */}
          <div className="px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-butter/50">
                <PiggyBank className="h-4.5 w-4.5 text-[oklch(0.58_0.12_80)]" strokeWidth={1.6} />
              </div>
              <div className="min-w-0">
                <p className="font-script text-lg leading-tight">Available to Save</p>
                <div className="dashed-rule mt-0.5" />
              </div>
            </div>
            <p className={`font-sans text-2xl font-extrabold ${availableToSave >= 0 ? "text-[oklch(0.58_0.12_80)]" : "text-blush-deep"}`}>
              {availableToSave < 0 ? "−" : ""}{fmt(Math.abs(availableToSave))}
            </p>
          </div>
        </div>
        <img src={sprig} alt="" aria-hidden loading="lazy"
          className="absolute -right-1 top-2 h-16 w-16 object-contain opacity-60 pointer-events-none hidden xl:block" />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_0.8fr]">
        {/* LEFT */}
        <div className="space-y-5">
          {/* How savings are calculated */}
          <div className="paper-card relative flex overflow-hidden rounded-3xl bg-white/85">
            {/* Spring binding */}
            <div className="shrink-0 flex items-center justify-center py-4 pl-2 pr-1">
              <img src={springBinding} alt="" aria-hidden loading="lazy"
                className="h-24 w-20 object-contain" />
            </div>
            {/* Content */}
            <div className="min-w-0 flex-1 px-5 py-6">
              {/* Washi tape decoration */}
              <div className="absolute left-16 top-0 h-4 w-24 rounded-b-sm bg-lilac/60 opacity-70" />
              <p className="mb-4 font-script text-xl">How savings are calculated ♡</p>
              <div className="rounded-2xl border border-lilac/30 bg-lilac/10 px-5 py-3 mb-4">
                <p className="font-hand text-sm text-lilac-deep text-center">
                  Savings rate = (Income − tracked outflow) ÷ Income × 100
                </p>
              </div>
              <div className="text-center">
                <span className="inline-block rounded-full border border-mint/40 bg-mint/15 px-5 py-2 font-hand text-sm italic text-mint-deep">
                  {hasAnyIncome ? `Your current rate: ${savingsChartData[5]!.rate}%` : "Add income to see your personal rate ♡"}
                </span>
              </div>
            </div>
            {/* Bullet decoration */}
            <div className="absolute left-[4.5rem] top-1/2 -translate-y-1/2 flex flex-col gap-2.5">
              {[0, 1, 2].map((i) => (
                <span key={i} className="block h-2 w-2 rounded-full bg-ink/15" />
              ))}
            </div>
          </div>

          {/* Income entries */}
          <div className="paper-card rounded-3xl bg-white/85 p-6">
            <div className="mb-4 flex items-center gap-2">
              <img src={sprig} alt="" aria-hidden className="h-6 w-6 object-contain opacity-70" />
              <p className="font-script text-xl">Income entries ♡</p>
            </div>

            {/* Table header */}
            <div className="mb-2 grid grid-cols-[auto_1fr_auto_auto_auto] gap-x-3 border-b border-ink/10 pb-2">
              {["Date", "Source", "Amount", "Notes", ""].map((h) => (
                <span key={h} className="font-hand text-[0.6rem] uppercase tracking-widest text-ink/40">{h}</span>
              ))}
            </div>

            {/* Rows */}
            {thisMonthEntries.length === 0 ? (
              <div className="py-8 text-center">
                <p className="font-script text-xl text-ink/40">No income added yet ♡</p>
              </div>
            ) : (
              <div className="space-y-1">
                {thisMonthEntries.map((e) => {
                  const isConfirm = confirmDeleteId === e.id;
                  if (isConfirm) {
                    return (
                      <div key={e.id} className="flex items-center justify-between rounded-2xl border border-blush/30 bg-blush/10 px-4 py-3">
                        <p className="font-hand text-sm text-blush-deep">Delete "{e.source}" entry?</p>
                        <div className="flex gap-2">
                          <button onClick={() => { deleteEntry(e.id); setConfirmDeleteId(null); }}
                            className="rounded-full bg-blush-deep/80 px-3 py-1 font-hand text-xs text-white hover:bg-blush-deep">
                            Delete
                          </button>
                          <button onClick={() => setConfirmDeleteId(null)}
                            className="rounded-full border border-ink/15 bg-white/60 px-3 py-1 font-hand text-xs text-ink-soft hover:bg-white">
                            Cancel
                          </button>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={e.id}
                      className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-x-3 items-center rounded-2xl px-2 py-2.5 hover:bg-ink/4">
                      <span className="font-hand text-xs text-ink-soft whitespace-nowrap">
                        {format(parseISO(e.date), "MMM d")}
                      </span>
                      <span className="font-hand text-sm text-ink truncate">{e.source}</span>
                      <span className="font-hand text-sm font-bold text-mint-deep whitespace-nowrap">{fmt(e.amount)}</span>
                      <span className="font-hand text-xs text-ink/40 truncate max-w-[80px]">{e.notes ?? "—"}</span>
                      <div className="flex gap-1">
                        <button onClick={() => { setEditingEntry(e); setAddOpen(true); }}
                          className="flex h-6 w-6 items-center justify-center rounded-lg hover:bg-ink/8">
                          <Pencil className="h-3 w-3 text-ink/40" strokeWidth={1.8} />
                        </button>
                        <button onClick={() => setConfirmDeleteId(e.id)}
                          className="flex h-6 w-6 items-center justify-center rounded-lg hover:bg-blush/20">
                          <Trash2 className="h-3 w-3 text-blush-deep/60" strokeWidth={1.8} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-5 text-center">
              <button
                onClick={() => { setEditingEntry(undefined); setAddOpen(true); }}
                className="inline-flex items-center gap-2 rounded-full bg-blush/60 px-6 py-2.5 font-hand text-sm text-blush-deep hover:bg-blush/80 border border-blush/40">
                <Plus className="h-3.5 w-3.5" strokeWidth={2} /> Add Income
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-5">
          {/* Savings rate chart */}
          <div className="paper-card relative overflow-hidden rounded-3xl bg-white/85 p-6">
            <p className="mb-1 font-script text-xl">Savings rate over time ♡</p>
            <p className="mb-4 font-hand text-xs text-ink-soft">% of income saved each month</p>
            <div className="h-52 relative">
              {!hasAnyIncome && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-1">
                  <p className="font-script text-lg text-ink/40">Your first month</p>
                  <p className="font-script text-lg text-ink/40">will appear here. ♡</p>
                  <span className="mt-1 text-ink/30">↓</span>
                </div>
              )}
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={savingsChartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false}
                    tick={{ fontFamily: "inherit", fontSize: 10, fill: "oklch(0.55 0.01 240)" }} />
                  <YAxis axisLine={false} tickLine={false} width={36} domain={[0, 100]}
                    tick={{ fontFamily: "inherit", fontSize: 9, fill: "oklch(0.55 0.01 240)" }}
                    tickFormatter={(v) => `${v}%`} />
                  <Tooltip contentStyle={TOOLTIP_STYLE}
                    formatter={(v: unknown) => [`${Number(v ?? 0)}%`, "Savings Rate"]} />
                  <Line type="monotone" dataKey="rate" stroke="#9b7ecc" strokeWidth={2}
                    strokeDasharray={hasAnyIncome ? undefined : "4 4"}
                    dot={{ r: hasAnyIncome ? 4 : 3, fill: "#9b7ecc", strokeWidth: 0 }}
                    activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <img src={sprig} alt="" aria-hidden loading="lazy"
              className="absolute bottom-3 right-3 h-12 w-12 object-contain opacity-50 pointer-events-none" />
          </div>

          {/* Dreamer Tip */}
          <div className="paper-card relative overflow-hidden rounded-3xl bg-mint/20 p-6">
            <div className="mb-3 flex items-center gap-2">
              <Star className="h-5 w-5 text-mint-deep" strokeWidth={1.5} />
              <p className="font-script text-xl underline decoration-mint-deep/40 underline-offset-4">
                Dreamer Tip
              </p>
            </div>
            <p className="font-hand text-sm leading-relaxed text-ink/70 pr-10">
              Your savings rate becomes available only after you add your income. Track every source — salary, freelance, or side hustle — to see the full picture.
            </p>
            <Heart className="absolute right-5 top-5 h-8 w-8 text-blush-deep/30" strokeWidth={1.2} />
          </div>
        </div>
      </div>

      {/* Footer quote banner */}
      <footer className="paper-card relative mt-6 overflow-hidden rounded-[1.6rem] bg-blush/50 px-6 py-4 sm:px-8 sm:py-5">
        <div className="relative z-10 flex items-center gap-2 pr-0 sm:gap-4 sm:pr-44">
          <span className="font-script text-5xl leading-none text-blush-deep/70 sm:text-6xl">"</span>
          <p className="font-script text-lg leading-snug sm:text-xl">
            The secret of getting ahead is getting{" "}
            <span className="underline decoration-ink/40 underline-offset-4">started</span>.
          </p>
          <Heart className="h-5 w-5 shrink-0 -rotate-12 text-blush-deep/60" strokeWidth={1.4} />
        </div>
        <img src={vase} alt="" aria-hidden loading="lazy"
          className="absolute bottom-0 right-4 hidden h-24 w-auto object-contain sm:right-8 sm:block sm:h-28" />
      </footer>

      <AddIncomeDialog
        open={addOpen}
        onOpenChange={(o) => { setAddOpen(o); if (!o) setEditingEntry(undefined); }}
        entry={editingEntry}
      />
    </main>
  );
}
