import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
  Cell,
  LabelList,
} from "recharts";
import { format, subMonths, startOfMonth } from "date-fns";
import { Heart, Wallet } from "lucide-react";
import { useBillStore } from "@/stores/billStore";
import { useExpenseStore } from "@/stores/expenseStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useIncomeStore } from "@/stores/incomeStore";
import { useUIStore } from "@/stores/uiStore";
import { getBillDisplayDate, getBillDisplayAmount, fmtCurrency, sumBills } from "@/lib/billUtils";
import { HeaderDatePicker } from "@/components/common/HeaderDatePicker";

import sprig from "@/assets/doodle-sprig.png";
import cloudImg from "@/assets/cloud (1).png";

const CAT_COLORS = ["#9b7ecc", "#c97b7d", "#5aaa88", "#c5a44a", "#8ab0cc", "#b0c0a8"];

const TOOLTIP_STYLE = {
  fontFamily: "inherit",
  fontSize: 12,
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.08)",
  background: "oklch(0.98 0.002 240)",
};

const toChartNumber = (value: unknown) => Number(value ?? 0);

const SAVINGS_RATE_DOMAIN = [
  (dataMin: number) => Math.min(0, Math.floor(dataMin / 10) * 10),
  100,
] as const;

function loadReflection(key: string): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(key) ?? "{}") as Record<string, string>; }
  catch { return {}; }
}

export function Reports() {
  const bills = useBillStore((s) => s.bills);
  const expenses = useExpenseStore((s) => s.expenses);
  const settings = useSettingsStore((s) => s.settings);

  const now = useUIStore((s) => s.referenceDate);
  const incomeEntries = useIncomeStore((s) => s.entries);
  const cur = settings.currency;
  const curPos = settings.currencyPosition as "before" | "after";
  const fmt = (n: number) => fmtCurrency(n, cur, curPos);

  const currentKey = format(now, "yyyy-MM");

  // Reflection notes — always current month
  const reflectionKey = `pdj-reports-reflection-${currentKey}`;
  const [reflections, setReflections] = useState<Record<string, Record<string, string>>>(() => ({
    [currentKey]: loadReflection(reflectionKey),
  }));
  const reflection = reflections[currentKey] ?? loadReflection(reflectionKey);
  function updateReflection(field: string, val: string) {
    const next = { ...reflection, [field]: val };
    setReflections((current) => ({ ...current, [currentKey]: next }));
    localStorage.setItem(reflectionKey, JSON.stringify(next));
  }

  // 6-month trend data
  const monthlyData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const m = startOfMonth(subMonths(now, 5 - i));
      const key = format(m, "yyyy-MM");
      const billAmt = Math.abs(sumBills(bills.filter((b) => getBillDisplayDate(b).startsWith(key))));
      const expAmt = expenses.filter((e) => e.date.startsWith(key)).reduce((s, e) => s + e.amount, 0);
      const totalExp = billAmt + expAmt;
      const entryIncome = incomeEntries.filter((e) => e.date.startsWith(key)).reduce((s, e) => s + e.amount, 0);
      const income = entryIncome;
      const net = income - totalExp;
      return {
        month: format(m, "MMM"),
        key,
        income,
        expenses: totalExp,
        savings: income > 0 ? Math.min(100, Math.round((net / income) * 100)) : 0,
      };
    });
  }, [bills, expenses, incomeEntries, now]);

  const thisMonthData = monthlyData[5]!;
  const lastMonthData = monthlyData[4]!;
  const thisMonthIncome = thisMonthData.income;
  const thisMonthExp = thisMonthData.expenses;
  const lastMonthExp = lastMonthData.expenses;
  const netCashFlow = thisMonthIncome - thisMonthExp;
  const lastSavingsRate = thisMonthData.savings;
  const isSavingsRateNegative = lastSavingsRate < 0;
  const pctChange = lastMonthExp > 0 ? ((thisMonthExp - lastMonthExp) / lastMonthExp) * 100 : 0;

  // Top spending categories — current month only
  const topCategories = useMemo(() => {
    const totals: Record<string, number> = {};
    bills.filter((b) => getBillDisplayDate(b).startsWith(currentKey)).forEach((b) => {
      const cat = b.category || "Other";
      totals[cat] = (totals[cat] ?? 0) + Math.abs(getBillDisplayAmount(b));
    });
    expenses.filter((e) => e.date.startsWith(currentKey)).forEach((e) => {
      totals[e.category] = (totals[e.category] ?? 0) + e.amount;
    });
    return Object.entries(totals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [bills, expenses, currentKey]);

  return (
    <main className="dot-grid min-w-0 flex-1 px-5 py-8 sm:px-8">
      {/* Header */}
      <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <h2 className="flex min-w-0 items-center gap-2 font-script text-4xl leading-none sm:gap-3 sm:text-[3.25rem]">
          Reports
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
        <div className="flex items-center gap-3">
          <Heart className="h-5 w-5 shrink-0 text-blush-deep/60" strokeWidth={1.4} />
          <p className="font-script text-xl text-ink sm:text-2xl">
            Here's your financial summary and insights.
          </p>
        </div>
        <img src={sprig} alt="" aria-hidden loading="lazy"
          className="absolute -right-1 -top-1 h-20 w-20 object-contain opacity-70" />
      </div>

      {/* Row 1 — 3-column */}
      <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Financial Overview */}
        <div className="paper-card rounded-3xl bg-white/85 p-6">
          <p className="mb-5 font-script text-xl leading-tight">Financial Overview (This Month) ♡</p>
          <div className="grid grid-cols-3 divide-x divide-ink/10">
            <div className="pr-3 text-center">
              <p className="font-hand text-[0.6rem] uppercase tracking-widest text-mint-deep mb-1">Income</p>
              <div className="dashed-rule mb-2" />
              <p className="font-sans text-base font-bold text-mint-deep leading-tight">{fmt(thisMonthIncome)}</p>
            </div>
            <div className="px-3 text-center">
              <p className="font-hand text-[0.6rem] uppercase tracking-widest text-blush-deep mb-1">Expenses</p>
              <div className="dashed-rule mb-2" />
              <p className="font-sans text-base font-bold text-blush-deep leading-tight">{fmt(thisMonthExp)}</p>
            </div>
            <div className="pl-3 text-center">
              <p className="font-hand text-[0.6rem] uppercase tracking-widest text-mint-deep mb-1">Net Savings</p>
              <div className="dashed-rule mb-2" />
              <p className={`font-sans text-base font-bold leading-tight ${netCashFlow >= 0 ? "text-mint-deep" : "text-blush-deep"}`}>
                {fmt(Math.abs(netCashFlow))}
              </p>
            </div>
          </div>
          <div className="mt-5 text-center">
            <span className="inline-block rounded-full bg-mint/25 px-5 py-2 font-hand text-sm text-mint-deep">
              {netCashFlow >= 0 ? "You're doing amazing! +" : "Keep tracking your spending ♡"}
            </span>
          </div>
        </div>

        {/* Income vs Expenses Trend */}
        <div className="paper-card rounded-3xl bg-white/85 p-6">
          <p className="mb-2 font-script text-xl leading-tight">Income vs Expenses Trend ♡</p>
          <div className="mb-3 flex items-center gap-5">
            <span className="flex items-center gap-1.5 font-hand text-xs text-ink-soft">
              <span className="inline-block h-2 w-5 rounded-full bg-[#5aaa88]" /> Income
            </span>
            <span className="flex items-center gap-1.5 font-hand text-xs text-ink-soft">
              <span className="inline-block h-2 w-5 rounded-full bg-[#c97b7d]" /> Expenses
            </span>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <XAxis dataKey="month" axisLine={false} tickLine={false}
                  tick={{ fontFamily: "inherit", fontSize: 10, fill: "oklch(0.55 0.01 240)" }} />
                <YAxis axisLine={false} tickLine={false} width={42}
                  tick={{ fontFamily: "inherit", fontSize: 9, fill: "oklch(0.55 0.01 240)" }}
                  tickFormatter={(v) => `${cur}${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`} />
                <Tooltip contentStyle={TOOLTIP_STYLE}
                  formatter={(value, name) => [fmt(toChartNumber(value)), name === "income" ? "Income" : "Expenses"]} />
                <Line type="monotone" dataKey="income" stroke="#5aaa88" strokeWidth={2}
                  dot={{ r: 4, fill: "#5aaa88", strokeWidth: 0 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="expenses" stroke="#c97b7d" strokeWidth={2}
                  dot={{ r: 4, fill: "#c97b7d", strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Savings Rate Over Time */}
        <div className="paper-card rounded-3xl bg-white/85 p-6">
          <div className="mb-2 flex items-start justify-between gap-2">
            <p className="font-script text-xl leading-tight">Savings Rate Over Time ♡</p>
            <span className={`shrink-0 rounded-full px-3 py-0.5 font-hand text-sm font-bold ${isSavingsRateNegative ? "bg-blush/25 text-blush-deep" : "bg-lilac/50 text-lilac-deep"}`}>
              {lastSavingsRate}%
            </span>
          </div>
          <p className="mb-3 font-hand text-xs text-ink-soft">% of income saved monthly</p>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <XAxis dataKey="month" axisLine={false} tickLine={false}
                  tick={{ fontFamily: "inherit", fontSize: 10, fill: "oklch(0.55 0.01 240)" }} />
                <YAxis axisLine={false} tickLine={false} width={36} domain={SAVINGS_RATE_DOMAIN}
                  tick={{ fontFamily: "inherit", fontSize: 9, fill: "oklch(0.55 0.01 240)" }}
                  tickFormatter={(v) => `${v}%`} />
                <ReferenceLine y={0} stroke="oklch(0.55 0.01 240)" strokeOpacity={0.25} strokeDasharray="3 3" />
                <Tooltip contentStyle={TOOLTIP_STYLE}
                  formatter={(value) => [`${toChartNumber(value)}%`, "Savings Rate"]} />
                <Line type="monotone" dataKey="savings" stroke="#9b7ecc" strokeWidth={2}
                  dot={{ r: 4, fill: "#9b7ecc", strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2 — 3-column */}
      <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Spending Comparison */}
        <div className="paper-card rounded-3xl bg-white/85 p-6">
          <p className="mb-5 font-script text-xl leading-tight">Spending Comparison ♡</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-mint/40 bg-mint/10 p-4 text-center">
              <p className="mb-1 font-hand text-xs text-ink-soft">Last Month</p>
              <p className="font-sans text-xl font-bold text-mint-deep">{fmt(lastMonthExp)}</p>
            </div>
            <div className="rounded-2xl border border-blush/40 bg-blush/10 p-4 text-center">
              <p className="mb-1 font-hand text-xs text-ink-soft">This Month</p>
              <p className="font-sans text-xl font-bold text-blush-deep">{fmt(thisMonthExp)}</p>
            </div>
          </div>
          <div className="mt-4 text-center">
            {lastMonthExp > 0 ? (
              <p className={`font-hand text-sm font-bold ${pctChange > 0 ? "text-blush-deep" : "text-mint-deep"}`}>
                {pctChange > 0 ? "↑" : "↓"} {Math.abs(pctChange).toFixed(1)}% {pctChange > 0 ? "increase" : "decrease"}
              </p>
            ) : (
              <p className="font-hand text-sm text-ink/40">No data from last month.</p>
            )}
          </div>
          <div className="mt-4 rounded-2xl bg-lilac/15 px-4 py-2.5">
            <p className="font-hand text-xs italic text-lilac-deep">Tip: Review your variable expenses. ♡</p>
          </div>
        </div>

        {/* Top Spending Categories */}
        <div className="paper-card rounded-3xl bg-white/85 p-6">
          <p className="mb-1 font-script text-xl leading-tight">Top Spending Categories ♡</p>
          <p className="mb-3 font-hand text-xs text-ink-soft">{format(now, "MMMM yyyy")}</p>
          {topCategories.length === 0 ? (
            <p className="py-8 text-center font-hand text-sm text-ink-soft">No spending data this month.</p>
          ) : (
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topCategories} layout="vertical"
                  margin={{ top: 0, right: 56, bottom: 0, left: 4 }} barSize={12}>
                  <XAxis type="number" axisLine={false} tickLine={false} hide />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={82}
                    tick={{ fontFamily: "inherit", fontSize: 9, fill: "oklch(0.45 0.01 240)" }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE}
                    formatter={(value) => [fmt(toChartNumber(value)), "Amount"]} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {topCategories.map((_, i) => (
                      <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]!} fillOpacity={0.8} />
                    ))}
                    <LabelList dataKey="value" position="right"
                      formatter={(value) => fmt(toChartNumber(value))}
                      style={{ fontFamily: "inherit", fontSize: 9, fill: "oklch(0.45 0.01 240)" }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Monthly Cash Flow Summary */}
        <div className="paper-card rounded-3xl bg-white/85 p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lilac/30">
              <Wallet className="h-5 w-5 text-lilac-deep" strokeWidth={1.6} />
            </div>
            <p className="font-script text-xl leading-tight">Monthly Cash Flow Summary</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-hand text-sm text-ink">Total Income</span>
              <div className="flex items-center gap-2">
                <span className="font-hand text-xs font-bold text-mint-deep">+</span>
                <span className="font-hand text-sm font-bold text-mint-deep">{fmt(thisMonthIncome)}</span>
              </div>
            </div>
            <div className="h-px bg-ink/8" />
            <div className="flex items-center justify-between">
              <span className="font-hand text-sm text-ink">Total Expenses</span>
              <div className="flex items-center gap-2">
                <span className="font-hand text-xs font-bold text-blush-deep">−</span>
                <span className="font-hand text-sm font-bold text-blush-deep">{fmt(thisMonthExp)}</span>
              </div>
            </div>
            <div className="h-px bg-ink/8" />
            <div className="flex items-center justify-between">
              <span className="font-hand text-sm font-bold text-ink">Net Cash Flow</span>
              <div className="flex items-center gap-2">
                <span className={`font-hand text-xs font-bold ${netCashFlow >= 0 ? "text-mint-deep" : "text-blush-deep"}`}>=</span>
                <span className={`font-hand text-sm font-bold ${netCashFlow >= 0 ? "text-mint-deep" : "text-blush-deep"}`}>
                  {netCashFlow < 0 ? "−" : ""}{fmt(Math.abs(netCashFlow))}
                </span>
              </div>
            </div>
          </div>
          <div className={`mt-5 rounded-2xl px-4 py-2.5 text-center ${netCashFlow >= 0 ? "bg-mint/15" : "bg-blush/15"}`}>
            <p className={`font-hand text-xs italic ${netCashFlow >= 0 ? "text-mint-deep" : "text-blush-deep"}`}>
              {netCashFlow >= 0 ? "Positive cash flow! Keep it up!" : "Budget carefully this month ♡"}
            </p>
          </div>
        </div>
      </div>

      {/* Row 3 — Reflection & Notes */}
      <div className="paper-card relative overflow-hidden rounded-3xl bg-white/85 p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <Heart className="h-5 w-5 text-blush-deep/60" strokeWidth={1.4} />
          <p className="font-script text-2xl">Reflection & Notes ♡</p>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:pr-36">
          {([
            { field: "wellThisMonth", label: "What went well this month? ♡" },
            { field: "improve",       label: "What can I improve? ✦" },
            { field: "goalNextMonth", label: "My goal for next month: ♡" },
          ] as const).map(({ field, label }) => (
            <div key={field}>
              <p className="mb-3 font-hand text-sm text-ink/60">{label}</p>
              <textarea
                value={reflection[field] ?? ""}
                onChange={(e) => updateReflection(field, e.target.value)}
                rows={3}
                placeholder="Write here..."
                className="w-full resize-none border-0 border-b-2 border-ink/15 bg-transparent pb-2 font-hand text-sm text-ink outline-none transition-colors focus:border-lilac-deep/40 placeholder:text-ink/20"
              />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
