import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  PieChart as RPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
} from "recharts";
import { useSettingsStore } from "@/stores/settingsStore";
import { useUIStore } from "@/stores/uiStore";
import { useYearly } from "@/hooks/useYearly";
import { fmtCurrency, sumBills, getBillDisplayAmount } from "@/lib/billUtils";
import {
  BUDGET_CHART_COLORS,
  YEARLY_CAT_HEADER,
  YEARLY_CAT_BAR_FILL,
} from "@/lib/constants";
import { Washi } from "@/components/common/Washi";

import cloudImg from "@/assets/cloud (1).png";
import leaves from "@/assets/doodle-leaves.png";
import sprig from "@/assets/doodle-sprig.png";
import vase from "@/assets/doodle-vase.png";

export function Yearly() {
  const settings = useSettingsStore((s) => s.settings);
  const monthlyNotes = useSettingsStore((s) => s.monthlyNotes);
  const setMonthlyNote = useSettingsStore((s) => s.setMonthlyNote);

  const yearlyYear = useUIStore((s) => s.yearlyYear);
  const setYearlyYear = useUIStore((s) => s.setYearlyYear);

  const {
    yearBills,
    yearExpected,
    yearPaid,
    yearPct,
    getCatYearBills,
    getCatMonthlyData,
    top5Bills,
    top5PieData,
  } = useYearly(yearlyYear);

  const fmt = (n: number) => fmtCurrency(n, settings.currency, settings.currencyPosition);
  const yearlyNote = monthlyNotes[`notes_${yearlyYear}_yearly`] ?? "";

  const breakdownData = settings.categoryNames.map((cat, i) => ({
    cat,
    expected: Math.abs(sumBills(getCatYearBills(cat))),
    paid: Math.abs(sumBills(getCatYearBills(cat).filter((b) => b.paid))),
    color: BUDGET_CHART_COLORS[i % BUDGET_CHART_COLORS.length]!,
  }));

  const breakdownPieData = yearExpected > 0
    ? breakdownData.filter((e) => e.expected > 0).map((e) => ({ name: e.cat, value: e.expected, color: e.color }))
    : [{ name: "empty", value: 1, color: "#e5e5e5" }];

  const top5Expected = Math.abs(sumBills(top5Bills));
  const top5Paid = Math.abs(sumBills(top5Bills.filter((b) => b.paid)));

  const renderCatOverviewCard = (cat: string, idx: number) => {
    const md = getCatMonthlyData(cat);
    const catExp = Math.abs(sumBills(getCatYearBills(cat)));
    const catPaid = Math.abs(sumBills(getCatYearBills(cat).filter((b) => b.paid)));
    const barFill = YEARLY_CAT_BAR_FILL[idx] ?? "#9b7ecc";
    const headerBg = YEARLY_CAT_HEADER[idx] ?? "bg-lilac-deep text-white";
    return (
      <div key={cat} className="paper-card flex flex-col overflow-hidden rounded-2xl bg-white/85">
        <div className={`${headerBg} px-4 py-2 text-center`}>
          <p className="font-hand text-xs uppercase tracking-widest">{cat} OVERVIEW</p>
          <p className="font-hand text-[0.6rem] opacity-80 uppercase">Monthly {cat} Trends In {yearlyYear}</p>
        </div>
        <ResponsiveContainer width="100%" height={90}>
          <BarChart data={md} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
            <XAxis dataKey="month" tick={{ fontSize: 7, fontFamily: "Kalam" }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <RTooltip
              formatter={(v: number) => [fmt(v), "Expected"]}
              contentStyle={{ fontFamily: "Kalam", fontSize: 11, borderRadius: 12, border: "none", background: "rgba(255,255,255,0.95)" }}
            />
            <Bar dataKey="expected" fill={barFill} radius={[3, 3, 0, 0]} barSize={8} />
          </BarChart>
        </ResponsiveContainer>
        <table className="w-full border-t border-ink/10 text-left">
          <thead>
            <tr className="bg-ink/[0.03]">
              <th className="px-3 py-1.5 font-hand text-[0.6rem] uppercase tracking-widest text-ink-soft">Month</th>
              <th className="px-3 py-1.5 text-right font-hand text-[0.6rem] uppercase tracking-widest text-ink-soft">Expected</th>
              <th className="px-3 py-1.5 text-right font-hand text-[0.6rem] uppercase tracking-widest text-ink-soft">Paid</th>
            </tr>
          </thead>
          <tbody>
            {md.map((row) => (
              <tr key={row.month} className="border-t border-ink/5">
                <td className="px-3 py-1 font-hand text-xs">{row.month}</td>
                <td className="px-3 py-1 text-right font-sans text-[0.7rem]">
                  {row.expected > 0 ? fmt(row.expected) : <span className="text-ink/30">—</span>}
                </td>
                <td className="px-3 py-1 text-right font-sans text-[0.7rem]">
                  {row.paid > 0 ? <span style={{ color: barFill }}>{fmt(row.paid)}</span> : <span className="text-ink/30">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-ink/15">
              <td className="px-3 py-1.5 font-hand text-[0.6rem] uppercase tracking-widest text-ink">Total</td>
              <td className="px-3 py-1.5 text-right font-sans text-xs font-bold">{fmt(catExp)}</td>
              <td className="px-3 py-1.5 text-right font-sans text-xs font-bold" style={{ color: barFill }}>{fmt(catPaid)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    );
  };

  const renderCompactCatCard = (cat: string, idx: number) => {
    const catBills = getCatYearBills(cat);
    const catExp = Math.abs(sumBills(catBills));
    const catPaid = Math.abs(sumBills(catBills.filter((b) => b.paid)));
    const hasBills = catBills.length > 0;
    const headerBg = YEARLY_CAT_HEADER[idx] ?? "bg-lilac-deep text-white";
    const barFill = YEARLY_CAT_BAR_FILL[idx] ?? "#9b7ecc";
    const pieData = hasBills
      ? catBills.map((b, i) => ({ name: b.name, value: getBillDisplayAmount(b), color: BUDGET_CHART_COLORS[i % BUDGET_CHART_COLORS.length]! }))
      : [{ name: "empty", value: 1, color: "#e5e5e5" }];
    return (
      <div key={cat} className="paper-card flex flex-col overflow-hidden rounded-2xl bg-white/85">
        <div className={`${headerBg} px-3 py-2 text-center`}>
          <p className="font-hand text-[0.7rem] uppercase tracking-widest leading-tight">{cat}</p>
          <p className="font-hand text-[0.55rem] opacity-80">{yearlyYear}</p>
        </div>
        <div className="relative flex h-24 items-center justify-center px-2 py-2">
          <ResponsiveContainer width={88} height={88}>
            <RPieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={26} outerRadius={42} dataKey="value" strokeWidth={0}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
            </RPieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-hand text-[0.55rem] font-bold text-ink/60">{catExp > 0 ? fmt(catExp) : "—"}</span>
          </div>
        </div>
        <table className="w-full border-t border-ink/10 text-left">
          <thead>
            <tr className="bg-ink/[0.03]">
              <th className="px-2 py-1 font-hand text-[0.55rem] uppercase tracking-widest text-ink-soft">Bill</th>
              <th className="px-2 py-1 text-right font-hand text-[0.55rem] uppercase tracking-widest text-ink-soft">Exp</th>
              <th className="px-2 py-1 text-right font-hand text-[0.55rem] uppercase tracking-widest text-ink-soft">Paid</th>
            </tr>
          </thead>
          <tbody>
            {!hasBills && (
              <tr><td colSpan={3} className="py-2 text-center font-hand text-[0.65rem] text-ink-soft">No bills</td></tr>
            )}
            {catBills.map((b) => (
              <tr key={b.id} className="border-t border-ink/5">
                <td className="max-w-[5rem] truncate px-2 py-1 font-hand text-[0.65rem] leading-tight">{b.name}</td>
                <td className="px-2 py-1 text-right font-sans text-[0.6rem]">{fmt(getBillDisplayAmount(b))}</td>
                <td className="px-2 py-1 text-right font-sans text-[0.6rem]">
                  {b.paid ? <span style={{ color: barFill }}>{fmt(getBillDisplayAmount(b))}</span> : <span className="text-ink/30">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-ink/15">
              <td className="px-2 py-1 font-hand text-[0.55rem] uppercase text-ink">Total</td>
              <td className="px-2 py-1 text-right font-sans text-[0.6rem] font-bold">{fmt(catExp)}</td>
              <td className="px-2 py-1 text-right font-sans text-[0.6rem] font-bold" style={{ color: barFill }}>{fmt(catPaid)}</td>
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
          <img src={leaves} alt="" aria-hidden="true" loading="lazy" className="h-10 w-10 shrink-0 object-contain" />
          {yearlyYear} Overview
          <span className="text-xl">✨</span>
        </h2>
        <div className="flex items-center gap-3">
          <div className="paper-card flex items-center gap-1.5 rounded-full bg-white/85 px-4 py-2.5">
            <button onClick={() => setYearlyYear((y) => y - 1)}
              className="rounded-full p-0.5 transition-colors hover:bg-ink/10" aria-label="Previous year">
              <ChevronLeft className="h-4 w-4 text-ink-soft" strokeWidth={1.8} />
            </button>
            <span className="min-w-16 text-center font-script text-xl">{yearlyYear}</span>
            <button onClick={() => setYearlyYear((y) => y + 1)}
              className="rounded-full p-0.5 transition-colors hover:bg-ink/10" aria-label="Next year">
              <ChevronRight className="h-4 w-4 text-ink-soft" strokeWidth={1.8} />
            </button>
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
            const catExp = Math.abs(sumBills(getCatYearBills(cat)));
            return (
              <div key={cat} className="px-4 py-4 text-center">
                <p className="font-hand text-[0.65rem] uppercase tracking-widest text-ink-soft">{cat}</p>
                <p className="mt-1 font-script text-2xl text-lilac-deep">{fmt(catExp)}</p>
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-ink/10 px-6 py-3">
          <span className="font-hand text-sm text-ink-soft">
            paid <span className="font-bold text-lilac-deep">{fmt(Math.abs(yearPaid))}</span>
            {" "}of{" "}
            <span className="font-bold text-blush-deep">{fmt(Math.abs(yearExpected))}</span>
          </span>
          <div className="flex items-center gap-3">
            <span className="font-hand text-sm font-bold text-blush-deep">{yearPct}% paid ♥</span>
            <span className="text-2xl" aria-hidden="true">☀️</span>
          </div>
        </div>
      </div>

      {/* Row 1: Breakdown + cat 0 + cat 1 */}
      <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-3">
        {/* Breakdown card */}
        <div className="paper-card flex flex-col overflow-hidden rounded-2xl bg-white/85">
          <div className="bg-blush-deep px-4 py-2 text-center">
            <p className="font-hand text-xs text-white uppercase tracking-widest">{yearlyYear} BILL BREAKDOWN</p>
            <p className="font-hand text-[0.6rem] text-white/80 uppercase">Expected vs Paid by Category in {yearlyYear}</p>
          </div>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart layout="vertical" data={breakdownData} margin={{ left: 4, right: 16, top: 8, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="cat" width={96} tick={{ fontSize: 9, fontFamily: "Kalam" }} axisLine={false} tickLine={false} />
              <RTooltip
                formatter={(v: number) => [fmt(v), "Expected"]}
                contentStyle={{ fontFamily: "Kalam", fontSize: 11, borderRadius: 12, border: "none", background: "rgba(255,255,255,0.95)" }}
              />
              <Bar dataKey="expected" radius={[0, 3, 3, 0]} barSize={10}>
                {breakdownData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="px-4 py-1 text-center">
            <span className="font-hand text-[0.65rem] text-ink-soft">planned {fmt(yearExpected)}</span>
            <span className="font-hand text-[0.65rem] text-lilac-deep"> • paid {fmt(yearPaid)}</span>
          </div>
          {yearExpected > 0 && (
            <p className="pb-1 text-center font-hand text-[0.65rem] text-mint-deep">
              {Math.round(((yearExpected - yearPaid) / yearExpected) * 100)}% remaining ✓
            </p>
          )}
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="relative h-28 w-28 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <RPieChart>
                  <Pie data={breakdownPieData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} dataKey="value" strokeWidth={0}>
                    {breakdownPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </RPieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-hand text-[0.55rem] uppercase text-ink/60">{yearlyYear}</span>
                <span className="font-hand text-[0.45rem] uppercase tracking-wide text-ink/50">BREAKDOWN</span>
              </div>
            </div>
            <div className="flex min-w-0 flex-col gap-1">
              {breakdownData.filter((e) => e.expected > 0).map((e, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: e.color }} />
                  <span className="truncate font-hand text-[0.65rem] uppercase text-ink-soft">{e.cat}</span>
                </div>
              ))}
            </div>
          </div>
          <table className="w-full border-t border-ink/10 text-left">
            <thead>
              <tr className="bg-ink/[0.03]">
                <th className="px-4 py-2 font-hand text-[0.6rem] uppercase tracking-widest text-ink-soft">Category</th>
                <th className="px-4 py-2 text-right font-hand text-[0.6rem] uppercase tracking-widest text-ink-soft">Expected</th>
                <th className="px-4 py-2 text-right font-hand text-[0.6rem] uppercase tracking-widest text-ink-soft">Paid</th>
              </tr>
            </thead>
            <tbody>
              {breakdownData.map((e) => (
                <tr key={e.cat} className="border-t border-ink/5">
                  <td className="px-4 py-1.5 font-hand text-sm uppercase" style={{ color: e.color }}>{e.cat}</td>
                  <td className="px-4 py-1.5 text-right font-sans text-xs">{fmt(e.expected)}</td>
                  <td className="px-4 py-1.5 text-right font-sans text-xs" style={{ color: e.color }}>{fmt(e.paid)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-ink/15">
                <td className="px-4 py-2 font-hand text-[0.6rem] uppercase tracking-widest text-ink">Total</td>
                <td className="px-4 py-2 text-right font-sans text-xs font-bold">{fmt(yearExpected)}</td>
                <td className="px-4 py-2 text-right font-sans text-xs font-bold text-blush-deep">{fmt(yearPaid)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        {renderCatOverviewCard(settings.categoryNames[0]!, 0)}
        {renderCatOverviewCard(settings.categoryNames[1]!, 1)}
      </div>

      {/* Row 2 */}
      <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {renderCatOverviewCard(settings.categoryNames[2]!, 2)}
        {renderCatOverviewCard(settings.categoryNames[3]!, 3)}
        {renderCatOverviewCard(settings.categoryNames[4]!, 4)}

        {/* Top 5 Bills */}
        <div className="paper-card flex flex-col overflow-hidden rounded-2xl bg-white/85">
          <div className="bg-lilac-deep px-4 py-2 text-center">
            <p className="font-hand text-xs text-white uppercase tracking-widest">Top 5 Bills In {yearlyYear}</p>
            <p className="font-hand text-[0.6rem] text-white/80 uppercase">Highest bills of the year</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="relative h-28 w-28 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <RPieChart>
                  <Pie data={top5PieData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} dataKey="value" strokeWidth={0}>
                    {top5PieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </RPieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-hand text-[0.55rem] text-ink/60">{yearlyYear}</span>
                <span className="font-hand text-[0.45rem] text-ink/50 uppercase">TOP 5</span>
              </div>
            </div>
            <div className="flex min-w-0 flex-col gap-1">
              {top5Bills.map((b, i) => (
                <div key={b.id} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: BUDGET_CHART_COLORS[i % BUDGET_CHART_COLORS.length] }} />
                  <span className="truncate font-hand text-[0.65rem] text-ink-soft">{b.name}</span>
                </div>
              ))}
              {top5Bills.length === 0 && <span className="font-hand text-xs text-ink-soft">No bills this year</span>}
            </div>
          </div>
          <table className="w-full border-t border-ink/10 text-left">
            <thead>
              <tr className="bg-ink/[0.03]">
                <th className="px-4 py-2 font-hand text-[0.6rem] uppercase tracking-widest text-ink-soft">Bill Name</th>
                <th className="px-4 py-2 text-right font-hand text-[0.6rem] uppercase tracking-widest text-ink-soft">Expected</th>
                <th className="px-4 py-2 text-right font-hand text-[0.6rem] uppercase tracking-widest text-ink-soft">Paid</th>
              </tr>
            </thead>
            <tbody>
              {top5Bills.length === 0 && (
                <tr><td colSpan={3} className="py-3 text-center font-hand text-xs text-ink-soft">No bills this year</td></tr>
              )}
              {top5Bills.map((b) => (
                <tr key={b.id} className="border-t border-ink/5">
                  <td className="px-4 py-1.5 font-script text-lg leading-tight">{b.name}</td>
                  <td className="px-4 py-1.5 text-right font-sans text-xs">{fmt(b.amount)}</td>
                  <td className="px-4 py-1.5 text-right font-sans text-xs">
                    {b.paid ? <span className="text-lilac-deep">{fmt(b.amount)}</span> : <span className="text-ink/40">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-ink/15">
                <td className="px-4 py-2 font-hand text-[0.6rem] uppercase tracking-widest text-ink">Total</td>
                <td className="px-4 py-2 text-right font-sans text-xs font-bold">{fmt(top5Expected)}</td>
                <td className="px-4 py-2 text-right font-sans text-xs font-bold text-blush-deep">{fmt(top5Paid)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Row 3: 5 compact category cards */}
      <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {settings.categoryNames.map((cat, i) => renderCompactCatCard(cat, i))}
      </div>

      {/* Yearly notes */}
      <div className="paper-card relative overflow-hidden rounded-[2rem] bg-white/80 px-6 py-5 sm:px-8 sm:py-6">
        <Washi className="-left-2 -top-3 h-9 w-40 -rotate-2 opacity-70" />
        <p className="relative font-script text-2xl sm:text-3xl">
          This year's thoughts – {yearlyYear} ♥
        </p>
        <textarea
          value={yearlyNote}
          onChange={(e) => setMonthlyNote(`notes_${yearlyYear}_yearly`, e.target.value)}
          rows={3}
          placeholder="Jot your thoughts for this year..."
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
