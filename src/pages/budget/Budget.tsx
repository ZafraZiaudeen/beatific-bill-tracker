import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Wallet } from "lucide-react";
import { addMonths, format, subMonths } from "date-fns";
import {
  PieChart as RPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { useSettingsStore } from "@/stores/settingsStore";
import { useUIStore } from "@/stores/uiStore";
import { useBudget } from "@/hooks/useBudget";
import { fmtCurrency, sumBills, getBillDisplayAmount } from "@/lib/billUtils";
import { BUDGET_CAT_ICONS, BUDGET_CAT_BG, BUDGET_CHART_COLORS } from "@/lib/constants";
import { Washi } from "@/components/common/Washi";

import cloudImg from "@/assets/cloud (1).png";
import sprig from "@/assets/doodle-sprig.png";
import vase from "@/assets/doodle-vase.png";

export function Budget() {
  const settings = useSettingsStore((s) => s.settings);
  const budgetLimits = useSettingsStore((s) => s.budgetLimits);
  const monthlyNotes = useSettingsStore((s) => s.monthlyNotes);
  const setBudgetLimit = useSettingsStore((s) => s.setBudgetLimit);
  const setMonthlyNote = useSettingsStore((s) => s.setMonthlyNote);

  const budgetMonth = useUIStore((s) => s.budgetMonth);
  const setBudgetMonth = useUIStore((s) => s.setBudgetMonth);

  const { totalExpected, totalPaid, paidPct, getCatBills } = useBudget(budgetMonth);

  const fmt = (n: number) => fmtCurrency(n, settings.currency, settings.currencyPosition);

  const budgetNote = monthlyNotes[`notes_${budgetMonth.getFullYear()}_${budgetMonth.getMonth()}`] ?? "";

  const renderCatCard = (cat: string, idx: number) => {
    const CatIcon = BUDGET_CAT_ICONS[idx] ?? Wallet;
    const catBillList = getCatBills(cat);
    const expected = sumBills(catBillList);
    const paid = sumBills(catBillList.filter((b) => b.paid));
    const limit = budgetLimits[cat] ?? 0;
    const hasBills = catBillList.length > 0;

    const pieData = hasBills
      ? catBillList.map((b, i) => ({ name: b.name, value: getBillDisplayAmount(b), color: BUDGET_CHART_COLORS[i % BUDGET_CHART_COLORS.length]! }))
      : [{ name: "empty", value: 1, color: "#e5e5e5" }];

    const pcts = hasBills && expected > 0
      ? catBillList.map((b) => Math.round((getBillDisplayAmount(b) / Math.abs(expected)) * 100))
      : [];

    const iconBg = BUDGET_CAT_BG[idx] ?? "bg-lilac/20";

    return (
      <div key={cat} className="paper-card flex flex-col overflow-hidden rounded-2xl bg-white/85">
        <div className="flex items-center gap-3 border-b border-ink/10 px-5 py-4">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
            <CatIcon className="h-5 w-5 text-ink/60" strokeWidth={1.6} />
          </div>
          <span className="font-script text-2xl italic">{cat}</span>
        </div>

        <div className="flex items-center justify-between px-5 pt-4">
          <span className="font-hand text-xs text-ink-soft">Monthly Budget</span>
          <div className="flex items-center gap-1">
            <span className="font-hand text-sm text-ink-soft">{settings.currency}</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={limit}
              onChange={(e) => setBudgetLimit(cat, parseFloat(e.target.value) || 0)}
              className="w-24 rounded-xl border border-ink/15 bg-white/70 px-2 py-1 text-right font-sans text-sm text-ink outline-none focus:border-lilac-deep/40"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 px-5 pb-1 pt-2">
          <span className="flex items-center gap-1 font-hand text-[0.7rem] text-ink-soft">
            <span className="inline-block h-2 w-2 rounded-full bg-mint-deep" /> paid {fmt(paid)}
          </span>
          <span className="font-hand text-[0.7rem] text-ink/40">—</span>
          <span className="flex items-center gap-1 font-hand text-[0.7rem] text-ink-soft">
            <span className="inline-block h-2 w-2 rounded-full bg-blush-deep" /> actual {fmt(expected)}
          </span>
          <span className="font-hand text-[0.7rem] text-ink/40">---- budget</span>
        </div>

        <div className="flex items-center gap-2 px-4 py-3">
          <div className="relative h-36 w-36 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <RPieChart>
                <Pie
                  data={pieData}
                  cx="50%" cy="50%"
                  innerRadius={40} outerRadius={60}
                  dataKey="value"
                  paddingAngle={catBillList.length > 1 ? 2 : 0}
                  strokeWidth={0}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </RPieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-hand text-xs font-bold text-ink/60">{format(budgetMonth, "MMM")}</span>
              <span className="font-hand text-[0.5rem] uppercase tracking-wide text-ink/40">
                {cat.length > 10 ? cat.substring(0, 10) : cat}
              </span>
            </div>
          </div>
          <div className="themed-scrollbar max-h-[6rem] min-w-0 flex-1 space-y-1.5 overflow-y-auto pr-1">
            {!hasBills && <p className="font-hand text-xs text-ink-soft">No bills<br />this month</p>}
            {catBillList.map((b, i) => (
              <div key={b.id} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: BUDGET_CHART_COLORS[i % BUDGET_CHART_COLORS.length] }} />
                <span className="min-w-0 flex-1 truncate font-hand text-sm">{b.name}</span>
                <span className="ml-auto font-hand text-sm text-ink-soft">{pcts[i] ?? 0}%</span>
              </div>
            ))}
          </div>
        </div>

        <table className="w-full border-t border-ink/10 text-left">
          <colgroup>
            <col className="w-1/2" />
            <col className="w-1/4" />
            <col className="w-1/4" />
          </colgroup>
          <thead>
            <tr className="bg-ink/[0.03]">
              <th className="px-4 py-2 font-hand text-[0.65rem] uppercase tracking-widest text-ink-soft">Bill Name</th>
              <th className="px-4 py-2 text-right font-hand text-[0.65rem] uppercase tracking-widest text-ink-soft">Expected</th>
              <th className="px-4 py-2 text-right font-hand text-[0.65rem] uppercase tracking-widest text-ink-soft">Paid</th>
            </tr>
          </thead>
        </table>
        <div className="themed-scrollbar max-h-[8.25rem] overflow-y-auto">
          <table className="w-full text-left">
          <colgroup>
            <col className="w-1/2" />
            <col className="w-1/4" />
            <col className="w-1/4" />
          </colgroup>
          <tbody>
            {!hasBills && (
              <tr><td colSpan={3} className="py-3 text-center font-hand text-xs text-ink-soft">No bills this month</td></tr>
            )}
            {catBillList.map((b) => (
              <tr key={b.id} className="h-11 border-t border-ink/5">
                <td className="px-4 py-2 font-script text-lg leading-tight">
                  {b.name}{b.type === "refund" && <span className="ml-1 text-xs text-mint-deep">(refund)</span>}
                </td>
                <td className="px-4 py-2 text-right font-sans text-sm">{fmt(b.amount)}</td>
                <td className="px-4 py-2 text-right font-sans text-sm">
                  {b.paid
                    ? <span className="text-blush-deep">{fmt(getBillDisplayAmount(b))}</span>
                    : <span className="text-ink/40">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
        <table className="w-full text-left">
          <colgroup>
            <col className="w-1/2" />
            <col className="w-1/4" />
            <col className="w-1/4" />
          </colgroup>
          <tfoot>
            <tr className="border-t border-ink/15">
              <td className="px-4 py-2 font-hand text-[0.65rem] uppercase tracking-widest text-ink">Total</td>
              <td className="px-4 py-2 text-right font-sans text-sm font-bold">{fmt(Math.abs(expected))}</td>
              <td className="px-4 py-2 text-right font-sans text-sm font-bold text-blush-deep">{fmt(Math.abs(paid))}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    );
  };

  return (
    <main className="dot-grid min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8 xl:px-12">
      {/* Header */}
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="flex items-center gap-3 font-script text-4xl leading-none sm:text-[3rem]">
          <img src={sprig} alt="" aria-hidden="true" loading="lazy" className="h-10 w-10 shrink-0 object-contain" />
          {format(budgetMonth, "MMMM yyyy")} Insights
          <span className="text-xl">✨</span>
        </h2>
        <div className="flex items-center gap-3">
          <div className="paper-card flex items-center gap-1.5 rounded-full bg-white/85 px-4 py-2.5">
            <CalendarDays className="h-5 w-5 text-lilac-deep" strokeWidth={1.6} />
            <button onClick={() => setBudgetMonth((m) => subMonths(m, 1))}
              className="rounded-full p-0.5 transition-colors hover:bg-ink/10" aria-label="Previous month">
              <ChevronLeft className="h-4 w-4 text-ink-soft" strokeWidth={1.8} />
            </button>
            <span className="min-w-36 text-center font-script text-xl">{format(budgetMonth, "MMMM yyyy")}</span>
            <button onClick={() => setBudgetMonth((m) => addMonths(m, 1))}
              className="rounded-full p-0.5 transition-colors hover:bg-ink/10" aria-label="Next month">
              <ChevronRight className="h-4 w-4 text-ink-soft" strokeWidth={1.8} />
            </button>
            <ChevronDown className="h-4 w-4 text-ink-soft" strokeWidth={1.8} />
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-lilac shadow-sm">
            <img src={cloudImg} alt="" aria-hidden="true" loading="lazy" className="h-7 w-7 object-contain opacity-80" />
          </div>
        </div>
      </header>

      {/* Summary bar */}
      <div className="paper-card mb-5 overflow-hidden rounded-[2rem] bg-white/80">
        <div className="grid grid-cols-2 divide-x divide-ink/10 sm:grid-cols-3 xl:grid-cols-5">
          {settings.categoryNames.map((cat) => {
            const catExp = sumBills(getCatBills(cat));
            return (
              <div key={cat} className="px-4 py-4 text-center">
                <p className="font-hand text-[0.65rem] uppercase tracking-widest text-ink-soft">{cat}</p>
                <p className="mt-1 font-script text-2xl text-lilac-deep">{fmt(Math.abs(catExp))}</p>
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-4 border-t border-ink/10 px-6 py-3">
          <span className="font-hand text-sm text-ink-soft">
            paid <span className="font-bold text-lilac-deep">{fmt(Math.abs(totalPaid))}</span>
            {" "}of{" "}
            <span className="font-bold text-blush-deep">{fmt(Math.abs(totalExpected))}</span>
          </span>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-ink/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blush-deep to-lilac-deep/70 transition-all duration-500"
              style={{ width: `${paidPct}%` }}
            />
          </div>
          <span className="font-hand text-sm font-bold text-blush-deep">{paidPct}% paid ♥</span>
        </div>
      </div>

      {/* Category cards top 3 */}
      <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-3">
        {settings.categoryNames.slice(0, 3).map((cat, i) => renderCatCard(cat, i))}
      </div>

      {/* Category cards bottom 2 */}
      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2">
        {settings.categoryNames.slice(3, 5).map((cat, i) => renderCatCard(cat, i + 3))}
      </div>

      {/* Monthly notes */}
      <div className="paper-card relative overflow-hidden rounded-[2rem] bg-white/80 px-6 py-5 sm:px-8 sm:py-6">
        <Washi className="-left-2 -top-3 h-9 w-40 -rotate-2 opacity-70" />
        <p className="relative font-script text-2xl sm:text-3xl">
          This month's thoughts — {format(budgetMonth, "MMMM yyyy")} ♥
        </p>
        <textarea
          value={budgetNote}
          onChange={(e) => {
            const key = `notes_${budgetMonth.getFullYear()}_${budgetMonth.getMonth()}`;
            setMonthlyNote(key, e.target.value);
          }}
          rows={3}
          placeholder="Jot your thoughts for this month..."
          className="relative mt-3 w-full resize-none bg-transparent font-hand text-sm text-ink outline-none placeholder:text-ink/30"
        />
        <img src={vase} alt="" aria-hidden="true" loading="lazy"
          className="absolute bottom-0 right-24 h-32 w-auto object-contain opacity-80 sm:right-36 sm:h-40" />
        <img src={sprig} alt="" aria-hidden="true" loading="lazy"
          className="absolute -bottom-1 right-4 h-16 w-16 object-contain sm:right-8" />
      </div>
    </main>
  );
}
