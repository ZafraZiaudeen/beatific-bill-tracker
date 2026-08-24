import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";
import { format, subMonths, startOfMonth } from "date-fns";
import { BarChart2 } from "lucide-react";
import { useExpenseStore } from "@/stores/expenseStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { EXPENSE_CATEGORIES } from "@/lib/constants";

function fmt(amount: number, currency: string, pos: "before" | "after") {
  const s = amount.toFixed(2);
  return pos === "before" ? `${currency}${s}` : `${s}${currency}`;
}

const BAR_COLORS = ["#9b7ecc", "#c97b7d", "#5aaa88", "#c5a44a", "#8ab0cc", "#b0c0a8"];

export function Reports() {
  const expenses = useExpenseStore((s) => s.expenses);
  const settings = useSettingsStore((s) => s.settings);
  const cur = settings.currency;
  const curPos = settings.currencyPosition as "before" | "after";

  const now = new Date();
  const currentMonthKey = format(now, "yyyy-MM");

  // 6-month bar data
  const monthlyData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const month = startOfMonth(subMonths(now, 5 - i));
      const key = format(month, "yyyy-MM");
      const total = expenses
        .filter((e) => e.date.startsWith(key))
        .reduce((s, e) => s + e.amount, 0);
      return { month: format(month, "MMM"), key, total };
    });
  }, [expenses]);

  // Current month category breakdown
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of expenses.filter((e) => e.date.startsWith(currentMonthKey))) {
      map[e.category] = (map[e.category] ?? 0) + e.amount;
    }
    return Object.entries(map)
      .map(([label, total]) => ({
        label,
        total,
        meta: EXPENSE_CATEGORIES.find((c) => c.label === label) ?? EXPENSE_CATEGORIES[8]!,
      }))
      .sort((a, b) => b.total - a.total);
  }, [expenses, currentMonthKey]);

  const currentTotal = categoryBreakdown.reduce((s, c) => s + c.total, 0);

  return (
    <main className="dot-grid min-w-0 flex-1 px-5 py-8 sm:px-8">
      {/* Header */}
      <header className="mb-6 flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-lilac/40">
          <BarChart2 className="h-7 w-7 text-lilac-deep" strokeWidth={1.6} />
        </div>
        <div>
          <h2 className="font-script text-5xl sm:text-6xl">Reports</h2>
          <p className="mt-1 font-hand text-sm text-ink-soft">Your spending trends at a glance</p>
        </div>
      </header>

      {/* 6-month bar chart */}
      <div className="paper-card mb-5 rounded-3xl bg-white/85 p-6">
        <p className="mb-1 font-script text-2xl">6-Month Spending ♡</p>
        <p className="mb-5 font-hand text-xs text-ink-soft">Monthly expense totals for the past 6 months</p>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} barSize={36} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontFamily: "inherit", fontSize: 11, fill: "oklch(0.55 0.01 240)" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontFamily: "inherit", fontSize: 10, fill: "oklch(0.55 0.01 240)" }}
                tickFormatter={(v) => `${cur}${v}`}
                width={50}
              />
              <Tooltip
                formatter={(v: number) => [fmt(v, cur, curPos), "Total"]}
                contentStyle={{
                  fontFamily: "inherit",
                  fontSize: 12,
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.1)",
                  background: "oklch(0.98 0.002 240)",
                }}
              />
              <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                {monthlyData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.key === currentMonthKey ? "#9b7ecc" : BAR_COLORS[i % BAR_COLORS.length]!}
                    fillOpacity={entry.key === currentMonthKey ? 0.9 : 0.65}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category breakdown this month */}
      <div className="paper-card rounded-3xl bg-white/85 p-6">
        <p className="mb-1 font-script text-2xl">This Month by Category ♡</p>
        <p className="mb-5 font-hand text-xs text-ink-soft">{format(now, "MMMM yyyy")}</p>

        {categoryBreakdown.length === 0 ? (
          <p className="py-6 text-center font-hand text-sm text-ink-soft">No expenses this month yet.</p>
        ) : (
          <div className="space-y-3">
            {categoryBreakdown.map((c) => {
              const pct = currentTotal > 0 ? (c.total / currentTotal) * 100 : 0;
              return (
                <div key={c.label}>
                  <div className="mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: c.meta.chartColor }}
                      />
                      <span className="font-hand text-sm text-ink">{c.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-hand text-xs text-ink-soft">{pct.toFixed(0)}%</span>
                      <span className="font-hand text-sm font-bold text-ink">
                        {fmt(c.total, cur, curPos)}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink/8">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: c.meta.chartColor, opacity: 0.75 }}
                    />
                  </div>
                </div>
              );
            })}
            <div className="mt-3 flex justify-between border-t border-ink/10 pt-3">
              <span className="font-hand text-sm font-bold text-ink">Total</span>
              <span className="font-hand text-sm font-bold text-lilac-deep">
                {fmt(currentTotal, cur, curPos)}
              </span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
