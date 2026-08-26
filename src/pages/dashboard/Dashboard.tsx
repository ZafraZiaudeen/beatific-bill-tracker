import { useMemo } from "react";
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Heart,
  Plus,
  Star,
  Wallet,
} from "lucide-react";
import { addMonths, format, isSameMonth, parseISO, startOfMonth, subMonths } from "date-fns";
import { useBillStore } from "@/stores/billStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useIncomeStore } from "@/stores/incomeStore";
import { useUIStore } from "@/stores/uiStore";
import { useBills } from "@/hooks/useBills";
import { useCalendar } from "@/hooks/useCalendar";
import { getBillDisplayDate, getBillStatus, fmtCurrency, sumBills, tintToDot, getGreeting } from "@/lib/billUtils";
import { BillRow } from "@/components/common/BillRow";
import { Washi } from "@/components/common/Washi";
import { HeaderDatePicker } from "@/components/common/HeaderDatePicker";
import type { Bill } from "@/types/bill";

import sprig from "@/assets/doodle-sprig.png";
import leaves from "@/assets/doodle-leaves.png";
import stars from "@/assets/stars.png";
import vase from "@/assets/doodle-vase.png";
import cloudImg from "@/assets/cloud (1).png";

export function Dashboard() {
  const bills = useBillStore((s) => s.bills);
  const togglePaid = useBillStore((s) => s.togglePaid);
  const deleteBillById = useBillStore((s) => s.deleteBillById);
  const settings = useSettingsStore((s) => s.settings);

  const calendarMonth = useUIStore((s) => s.calendarMonth);
  const setCalendarMonth = useUIStore((s) => s.setCalendarMonth);
  const setSelectedDay = useUIStore((s) => s.setSelectedDay);
  const setAddOpen = useUIStore((s) => s.setAddOpen);
  const setActiveSection = useUIStore((s) => s.setActiveSection);
  const setDeleteTarget = useUIStore((s) => s.setDeleteTarget);
  const setBillFilter = useUIStore((s) => s.setBillFilter);
  const referenceDate = useUIStore((s) => s.referenceDate);

  const { sortedBills } = useBills();
  const { calendarCells, calendarMarks, calendarAgenda } = useCalendar();

  const fmt = (n: number) => fmtCurrency(n, settings.currency, settings.currencyPosition);

  const incomeEntries = useIncomeStore((s) => s.entries);

  const stats = useMemo(() => {
    const thisMonth = startOfMonth(referenceDate);
    const thisMonthBills = bills.filter((b) => isSameMonth(parseISO(getBillDisplayDate(b)), thisMonth));
    const thisMonthUnpaid = thisMonthBills.filter((b) => !b.paid);
    const thisMonthPaid = thisMonthBills.filter((b) => b.paid);
    const overdue = bills.filter((b) => getBillStatus(b, referenceDate) === "overdue");
    return {
      total: { amount: Math.abs(sumBills(thisMonthBills)), count: thisMonthBills.length },
      due: { amount: Math.abs(sumBills(thisMonthUnpaid)), count: thisMonthUnpaid.length },
      paid: { amount: Math.abs(sumBills(thisMonthPaid)), count: thisMonthPaid.length },
      overdue: { amount: Math.abs(sumBills(overdue)), count: overdue.length },
    };
  }, [bills, referenceDate]);

  const income = useMemo(() => {
    const key = format(startOfMonth(referenceDate), "yyyy-MM");
    return incomeEntries.filter((e) => e.date.startsWith(key)).reduce((s, e) => s + e.amount, 0);
  }, [incomeEntries, referenceDate]);
  const expenses = stats.due.amount + stats.paid.amount;
  const remaining = income - expenses;
  const savingsPercent = income > 0 ? Math.max(0, Math.min(100, Math.round((remaining / income) * 100))) : 0;
  const actionBillList = useMemo(
    () => sortedBills.filter((b) => getBillStatus(b, referenceDate) !== "paid"),
    [sortedBills, referenceDate],
  );
  const actionBills = actionBillList.slice(0, 5);
  const hiddenActionBillCount = Math.max(0, actionBillList.length - actionBills.length);

  const handleDelete = (bill: Bill) => {
    if (bill.frequency !== "one-time") {
      setDeleteTarget(bill);
    } else {
      deleteBillById(bill.id);
    }
  };

  return (
    <main className="dot-grid flex-1 px-5 py-8 sm:px-8">
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-script text-4xl sm:text-5xl">
            {getGreeting()}, Dreamer!{" "}
            <img src={stars} alt="" aria-hidden="true" className="relative -mt-1 inline-block h-10 w-10 align-middle sm:h-20 sm:w-20" />
          </h2>
          <p className="mt-1 font-hand text-sm text-ink-soft">Here's your financial overview for today.</p>
        </div>
        <div className="flex items-center gap-3">
          <HeaderDatePicker />
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-lilac shadow-sm">
            <img src={cloudImg} alt="" aria-hidden="true" loading="lazy" className="h-8 w-8 object-contain opacity-80" />
          </div>
        </div>
      </header>

      {/* Stat cards */}
      <section className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="paper-card relative rounded-3xl bg-lilac/60 p-5">
          <Washi className="-top-2 left-4 h-8 w-28 -rotate-12" />
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/70">
              <Wallet className="h-5 w-5 text-lilac-deep" strokeWidth={1.6} />
            </div>
            <div className="flex-1">
              <p className="font-script text-2xl">Total Bills</p>
              <div className="dashed-rule mt-1 text-ink-soft" />
            </div>
          </div>
          <p className="mt-4 text-center font-sans text-4xl font-extrabold tracking-tight">{fmt(stats.total.amount)}</p>
          <p className="mt-1 text-center font-hand text-sm text-ink-soft">{stats.total.count} {stats.total.count === 1 ? "bill" : "bills"}</p>
          <img src={sprig} alt="" loading="lazy" className="absolute bottom-2 right-3 h-14 w-14 object-contain" />
        </div>

        <div className="paper-card relative rounded-3xl bg-blush/70 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/70">
              <CalendarDays className="h-5 w-5 text-blush-deep" strokeWidth={1.6} />
            </div>
            <div className="flex-1">
              <p className="font-script text-2xl">Due This Month</p>
              <div className="dashed-rule mt-1 text-ink-soft" />
            </div>
          </div>
          <p className="mt-4 text-center font-sans text-4xl font-extrabold tracking-tight">{fmt(stats.due.amount)}</p>
          <p className="mt-1 text-center font-hand text-sm text-ink-soft">{stats.due.count} {stats.due.count === 1 ? "bill" : "bills"}</p>
          <button onClick={() => setActiveSection("Bills")}
            className="mx-auto mt-4 flex items-center gap-2 rounded-full bg-blush px-5 py-2 font-script text-lg text-blush-deep transition-colors hover:bg-blush/70">
            View Bills <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </div>

        <div className="paper-card relative rounded-3xl bg-mint/70 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/70">
              <Heart className="h-5 w-5 text-mint-deep" strokeWidth={1.6} />
            </div>
            <div className="flex-1">
              <p className="font-script text-2xl">Paid This Month</p>
              <div className="dashed-rule mt-1 text-ink-soft" />
            </div>
          </div>
          <p className="mt-4 text-center font-sans text-4xl font-extrabold tracking-tight">{fmt(stats.paid.amount)}</p>
          <p className="mt-1 text-center font-hand text-sm text-ink-soft">{stats.paid.count} {stats.paid.count === 1 ? "bill" : "bills"}</p>
          {stats.paid.count > 0 && (
            <p className="mx-auto mt-4 w-fit rounded-full bg-mint px-4 py-1.5 font-script text-base text-mint-deep">
              You're doing great! ✨
            </p>
          )}
        </div>

        <div className="paper-card relative rounded-3xl bg-blush/70 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/70">
              <AlertCircle className="h-5 w-5 text-blush-deep" strokeWidth={1.6} />
            </div>
            <div className="flex-1">
              <p className="font-script text-2xl">Total Overdue</p>
              <div className="dashed-rule mt-1 text-ink-soft" />
            </div>
          </div>
          <p className="mt-4 text-center font-sans text-4xl font-extrabold tracking-tight">{fmt(stats.overdue.amount)}</p>
          <p className="mt-1 text-center font-hand text-sm text-ink-soft">{stats.overdue.count} {stats.overdue.count === 1 ? "bill" : "bills"}</p>
          {stats.overdue.count > 0 && (
            <button onClick={() => { setActiveSection("Bills"); setBillFilter("Overdue"); }}
              className="mx-auto mt-4 flex items-center gap-2 rounded-full bg-blush px-5 py-2 font-script text-lg text-blush-deep transition-colors hover:bg-blush/70">
              View Overdue <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
            </button>
          )}
        </div>
      </section>

      {/* Middle section */}
      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr_0.9fr]">
        {/* Upcoming Bills */}
        <div className="notebook-paper-card relative flex h-full flex-col pt-3">
          <Washi className="notebook-paper-tape absolute left-1/2 top-0 z-20 h-8 w-28 -translate-x-1/2" />
          <div className="notebook-paper-sheet relative flex flex-1">
          <div className="notebook-paper-binding flex w-11 shrink-0 flex-col items-center justify-evenly py-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className="notebook-paper-hole h-3.5 w-3.5 rounded-full" />
            ))}
          </div>
          <div className="notebook-paper-body relative min-w-0 flex-1 py-7 pl-3 pr-6">
          <div className="flex items-end gap-3">
            <div className="relative -rotate-1 rounded-sm px-6 py-1.5">
              <p className="font-script text-2xl">Upcoming Bills ♡</p>
            </div>
            <div className="dashed-rule flex-1 text-ink-soft" />
            <button onClick={() => setAddOpen(true)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lilac/50 text-lilac-deep transition-colors hover:bg-lilac/70"
              aria-label="Add bill">
              <Plus className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
          <ul className="mt-4">
            {actionBills.length === 0 && (
              <li className="py-6 text-center font-hand text-sm text-ink-soft">No upcoming or overdue bills. ♡</li>
            )}
            {actionBills.map((b) => (
              <BillRow key={b.id} bill={b} onTogglePaid={togglePaid} onDelete={handleDelete} />
            ))}
          </ul>
          {hiddenActionBillCount > 0 && (
            <p className="mt-3 text-center font-hand text-xs text-ink-soft">
              {hiddenActionBillCount} more need attention
            </p>
          )}
          <button onClick={() => setActiveSection("Bills")}
            className="mx-auto mt-4 flex items-center gap-2 rounded-full bg-lilac/50 px-5 py-2 font-script text-lg text-lilac-deep transition-colors hover:bg-lilac/70">
            View All Bills <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
          </button>
          <img src={sprig} alt="" loading="lazy" className="absolute -bottom-3 right-2 h-16 w-16 object-contain" />
          </div>
          </div>
        </div>

        {/* Calendar widget */}
        <div className="paper-card relative rounded-3xl bg-white/85 p-6">
          <div className="flex items-center justify-between">
            <img src={leaves} alt="" loading="lazy" className="h-10 w-10 object-contain" />
            <p className="font-script text-3xl">{format(calendarMonth, "MMMM yyyy")}</p>
            <div className="flex gap-2 text-ink-soft">
              <button onClick={() => { setCalendarMonth((m) => subMonths(m, 1)); setSelectedDay(null); }}
                className="rounded-full p-0.5 transition-colors hover:bg-ink/10" aria-label="Previous month">
                <ChevronLeft className="h-5 w-5" strokeWidth={1.8} />
              </button>
              <button onClick={() => { setCalendarMonth((m) => addMonths(m, 1)); setSelectedDay(null); }}
                className="rounded-full p-0.5 transition-colors hover:bg-ink/10" aria-label="Next month">
                <ChevronRight className="h-5 w-5" strokeWidth={1.8} />
              </button>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-7 gap-y-2 text-center font-hand text-[0.7rem] tracking-widest text-ink-soft">
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => <span key={d}>{d}</span>)}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-y-2 text-center font-sans text-sm">
            {calendarCells.map((cell, i) => {
              const mark = !cell.muted ? calendarMarks[cell.day] : undefined;
              return (
                <span key={i} className="flex items-center justify-center">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full ${mark ?? (cell.muted ? "text-ink/25" : "text-ink")}`}>
                    {cell.day}
                  </span>
                </span>
              );
            })}
          </div>
          <div className="mt-6 rounded-2xl bg-blush/25 p-4">
            {calendarAgenda.length === 0 && (
              <p className="py-2 text-center font-hand text-xs text-ink-soft">No bills this month ♡</p>
            )}
            {calendarAgenda.map((b) => (
              <div key={b.id} className="flex items-center gap-3 py-1.5">
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${tintToDot(b.tint)}`} />
                <span className="w-20 font-script text-lg">{format(parseISO(b.dueDate), "MMM d")}</span>
                <span className="min-w-0 flex-1 truncate font-script text-lg">{b.name}</span>
                <span className="font-sans text-sm font-bold">{fmt(b.amount)}</span>
              </div>
            ))}
          </div>
          <button onClick={() => setActiveSection("Calendar")}
            className="mx-auto mt-4 flex items-center gap-2 rounded-full bg-blush/40 px-5 py-2 font-script text-lg text-blush-deep transition-colors hover:bg-blush/60">
            Full Calendar <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
          </button>
          <img src={sprig} alt="" loading="lazy" className="absolute -bottom-4 right-4 h-14 w-14 object-contain" />
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <div className="paper-card relative rounded-3xl bg-white/85 p-6">
            <Washi className="-right-2 -top-2 h-8 w-28 rotate-45" />
            <div className="relative -rotate-1 rounded-sm px-5 py-2 text-center">
              <p className="font-script text-2xl">This Month at a Glance ♡</p>
            </div>
            <div className="mt-5 space-y-3 font-script text-xl">
              <div className="flex items-center justify-between">
                <span className="text-mint-deep">Income</span>
                <span className="font-sans text-base font-bold">{fmt(income)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blush-deep">Expenses</span>
                <span className="font-sans text-base font-bold">{fmt(expenses)}</span>
              </div>
            </div>
            <div className="dashed-rule my-4 text-ink-soft" />
            <p className="font-script text-xl">Remaining</p>
            <div className="flex items-center justify-between">
              <p className={`font-sans text-3xl font-extrabold ${remaining >= 0 ? "text-mint-deep" : "text-blush-deep"}`}>
                {fmt(Math.abs(remaining))}
              </p>
              <Heart className="h-8 w-8 text-blush-deep" strokeWidth={1.4} />
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-ink/10">
                <div className="h-full rounded-full bg-mint-deep/70 transition-all duration-500" style={{ width: `${savingsPercent}%` }} />
              </div>
              <span className="font-hand text-xs text-ink-soft">{savingsPercent}%</span>
            </div>
          </div>

          <div className="paper-card rounded-3xl bg-mint/50 p-6">
            <div className="flex items-center gap-3">
              <Star className="h-6 w-6 text-mint-deep" strokeWidth={1.5} />
              <p className="font-script text-2xl underline decoration-ink/30 underline-offset-4">Dreamer Tip</p>
            </div>
            <p className="mt-4 font-script text-xl leading-relaxed">
              Pay yourself first. Saving a little today leads to freedom tomorrow.
            </p>
            <Heart className="mt-2 ml-auto h-9 w-9 text-lilac-deep" strokeWidth={1.4} />
          </div>
        </div>
      </section>

      {/* Quote banner */}
      <section className="paper-card relative mt-6 overflow-hidden rounded-3xl bg-blush/60 px-6 py-5 sm:px-8 sm:py-8">
        <div className="flex items-center gap-4">
          <span className="font-script text-6xl leading-none text-blush-deep">"</span>
          <p className="font-script text-xl sm:text-3xl">
            The secret of getting ahead is getting{" "}
            <span className="underline decoration-ink/40 underline-offset-4">started</span>.
          </p>
          <Heart className="h-7 w-7 text-blush-deep" strokeWidth={1.4} />
        </div>
        <img src={vase} alt="" loading="lazy" className="absolute bottom-0 right-24 hidden h-40 w-100 object-contain sm:block" />
      </section>
    </main>
  );
}
