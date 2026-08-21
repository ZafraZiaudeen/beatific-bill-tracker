import { useMemo } from "react";
import {
  AlertCircle,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  Plus,
  Wallet,
} from "lucide-react";
import { addMonths, format, isSameMonth, parseISO, startOfDay, subMonths } from "date-fns";
import { useBillStore } from "@/stores/billStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useUIStore } from "@/stores/uiStore";
import { useCalendar } from "@/hooks/useCalendar";
import {
  getBillDisplayDate,
  getBillDisplayAmount,
  getBillStatus,
  fmtCurrency,
  sumBills,
} from "@/lib/billUtils";
import { ICON_MAP } from "@/lib/constants";
import { BillRow } from "@/components/common/BillRow";
import { Washi } from "@/components/common/Washi";
import type { Bill } from "@/types/bill";

import cloudImg from "@/assets/cloud (1).png";
import sprig from "@/assets/doodle-sprig.png";
import flower from "@/assets/doodle-flower.png";
import vase from "@/assets/doodle-vase.png";

export function CalendarView() {
  const today = useMemo(() => startOfDay(new Date()), []);
  const bills = useBillStore((s) => s.bills);
  const togglePaid = useBillStore((s) => s.togglePaid);
  const deleteBillById = useBillStore((s) => s.deleteBillById);
  const rescheduleBill = useBillStore((s) => s.rescheduleBill);
  const settings = useSettingsStore((s) => s.settings);

  const calendarMonth = useUIStore((s) => s.calendarMonth);
  const setCalendarMonth = useUIStore((s) => s.setCalendarMonth);
  const selectedDay = useUIStore((s) => s.selectedDay);
  const setSelectedDay = useUIStore((s) => s.setSelectedDay);
  const draggedBillId = useUIStore((s) => s.draggedBillId);
  const setDraggedBillId = useUIStore((s) => s.setDraggedBillId);
  const setAddOpen = useUIStore((s) => s.setAddOpen);
  const setAddDefaultDate = useUIStore((s) => s.setAddDefaultDate);
  const setDeleteTarget = useUIStore((s) => s.setDeleteTarget);

  const { calendarCells, calendarDayBillsMap, selectedDayBills } = useCalendar();

  const fmt = (n: number) => fmtCurrency(n, settings.currency, settings.currencyPosition);

  const calendarStats = useMemo(() => {
    const monthBills = bills.filter((b) => isSameMonth(parseISO(getBillDisplayDate(b)), calendarMonth));
    const monthUnpaid = monthBills.filter((b) => !b.paid);
    const monthPaid = monthBills.filter((b) => b.paid);
    const monthOverdue = monthBills.filter((b) => getBillStatus(b) === "overdue");
    return {
      total: { amount: Math.abs(sumBills(monthBills)), count: monthBills.length },
      due: { amount: Math.abs(sumBills(monthUnpaid)), count: monthUnpaid.length },
      paid: { amount: Math.abs(sumBills(monthPaid)), count: monthPaid.length },
      overdue: { amount: Math.abs(sumBills(monthOverdue)), count: monthOverdue.length },
    };
  }, [bills, calendarMonth]);

  const overdueBills = useMemo(() => bills.filter((b) => getBillStatus(b) === "overdue"), [bills]);

  const handleDelete = (bill: Bill) => {
    if (bill.frequency !== "one-time") {
      setDeleteTarget(bill);
    } else {
      deleteBillById(bill.id);
    }
  };

  const DAY_HEADERS = settings.weekStart === "Monday"
    ? ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]
    : ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  return (
    <main className="dot-grid flex-1 px-5 py-8 sm:px-8">
      {/* Header */}
      <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-script text-5xl sm:text-6xl">
          Calendar <span className="text-blush-deep">♡</span>
        </h2>
        <div className="flex items-center gap-3">
          <div className="paper-card flex items-center gap-1.5 rounded-full bg-white/85 px-4 py-2.5">
            <CalendarDays className="h-5 w-5 text-lilac-deep" strokeWidth={1.6} />
            <button
              onClick={() => { setCalendarMonth((m) => subMonths(m, 1)); setSelectedDay(null); }}
              className="rounded-full p-0.5 transition-colors hover:bg-ink/10"
              aria-label="Previous month">
              <ChevronLeft className="h-4 w-4 text-ink-soft" strokeWidth={1.8} />
            </button>
            <span className="min-w-36 text-center font-script text-xl">
              {format(calendarMonth, "MMMM yyyy")}
            </span>
            <button
              onClick={() => { setCalendarMonth((m) => addMonths(m, 1)); setSelectedDay(null); }}
              className="rounded-full p-0.5 transition-colors hover:bg-ink/10"
              aria-label="Next month">
              <ChevronRight className="h-4 w-4 text-ink-soft" strokeWidth={1.8} />
            </button>
            <ChevronDown className="h-4 w-4 text-ink-soft" strokeWidth={1.8} />
          </div>
          <button onClick={() => setAddOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-lilac-deep/80 text-white shadow-sm transition-colors hover:bg-lilac-deep"
            aria-label="Add bill">
            <Plus className="h-5 w-5" strokeWidth={2} />
          </button>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-lilac shadow-sm">
            <img src={cloudImg} alt="" aria-hidden="true" loading="lazy" className="h-7 w-7 object-contain opacity-80" />
          </div>
        </div>
      </header>

      {/* Stat cards */}
      <section className="mb-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="paper-card relative rounded-3xl bg-lilac/50 p-5">
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
          <p className="mt-4 text-center font-sans text-4xl font-extrabold tracking-tight">{fmt(calendarStats.total.amount)}</p>
          <p className="mt-1 text-center font-hand text-sm text-ink-soft">{calendarStats.total.count} {calendarStats.total.count === 1 ? "bill" : "bills"}</p>
          <img src={sprig} alt="" loading="lazy" className="absolute bottom-2 right-3 h-14 w-14 object-contain" />
        </div>

        <div className="paper-card relative rounded-3xl bg-mint/60 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/70">
              <Heart className="h-5 w-5 text-mint-deep" strokeWidth={1.6} />
            </div>
            <div className="flex-1">
              <p className="font-script text-2xl">Paid This Month</p>
              <div className="dashed-rule mt-1 text-ink-soft" />
            </div>
          </div>
          <p className="mt-4 text-center font-sans text-4xl font-extrabold tracking-tight">{fmt(calendarStats.paid.amount)}</p>
          <p className="mt-1 text-center font-hand text-sm text-ink-soft">{calendarStats.paid.count} {calendarStats.paid.count === 1 ? "bill" : "bills"}</p>
          {calendarStats.paid.count > 0 && (
            <p className="mx-auto mt-3 w-fit rounded-full bg-mint px-4 py-1 font-script text-base text-mint-deep">
              You're doing great! ✨
            </p>
          )}
        </div>

        <div className="paper-card relative rounded-3xl bg-white/85 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blush/60">
              <AlertCircle className="h-5 w-5 text-blush-deep" strokeWidth={1.6} />
            </div>
            <div className="flex-1">
              <p className="font-script text-2xl">Total Overdue</p>
              <div className="dashed-rule mt-1 text-ink-soft" />
            </div>
          </div>
          <p className="mt-4 text-center font-sans text-4xl font-extrabold tracking-tight">{fmt(calendarStats.overdue.amount)}</p>
          <p className="mt-1 text-center font-hand text-sm text-ink-soft">{calendarStats.overdue.count} {calendarStats.overdue.count === 1 ? "bill" : "bills"}</p>
          <Heart className="mx-auto mt-3 h-7 w-7 text-blush-deep/50" strokeWidth={1.4} />
        </div>

        <div className="paper-card relative rounded-3xl bg-butter/60 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/70">
              <CalendarDays className="h-5 w-5 text-[oklch(0.62_0.1_80)]" strokeWidth={1.6} />
            </div>
            <div className="flex-1">
              <p className="font-script text-2xl">Due This Month</p>
              <div className="dashed-rule mt-1 text-ink-soft" />
            </div>
          </div>
          <p className="mt-4 text-center font-sans text-4xl font-extrabold tracking-tight">{fmt(calendarStats.due.amount)}</p>
          <p className="mt-1 text-center font-hand text-sm text-ink-soft">{calendarStats.due.count} {calendarStats.due.count === 1 ? "bill" : "bills"}</p>
          <img src={flower} alt="" loading="lazy" className="absolute bottom-2 right-3 h-12 w-12 object-contain" />
        </div>
      </section>

      {/* Calendar grid */}
      <div className="paper-card mb-6 overflow-hidden rounded-3xl bg-white/85">
        <div className="grid grid-cols-7 border-b border-ink/10 bg-lilac/15">
          {DAY_HEADERS.map((d) => (
            <div key={d} className="py-3 text-center font-hand text-[0.68rem] italic tracking-widest text-ink-soft">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {calendarCells.map((cell, i) => {
            const dayBills = !cell.muted ? (calendarDayBillsMap[cell.day] ?? []) : [];
            const isToday = !cell.muted && isSameMonth(today, calendarMonth) && today.getDate() === cell.day;
            const isSelected = !cell.muted && selectedDay === cell.day;
            const isLastCol = i % 7 === 6;
            const cellDateStr = !cell.muted
              ? `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, "0")}-${String(cell.day).padStart(2, "0")}`
              : "";
            return (
              <div key={i}
                onClick={() => !cell.muted && setSelectedDay((d) => d === cell.day ? null : cell.day)}
                onDoubleClick={() => {
                  if (!cell.muted) { setAddDefaultDate(cellDateStr); setAddOpen(true); }
                }}
                onDragOver={(e) => { if (!cell.muted) e.preventDefault(); }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (!cell.muted && draggedBillId) {
                    rescheduleBill(draggedBillId, cellDateStr);
                    setDraggedBillId(null);
                  }
                }}
                className={`min-h-[7.5rem] border-b p-2 transition-colors ${isLastCol ? "" : "border-r"} border-ink/[0.08] ${
                  cell.muted ? "cursor-default bg-ink/[0.02]" : "cursor-pointer hover:bg-lilac/10"
                } ${isSelected ? "bg-lilac/20 ring-inset ring-2 ring-lilac-deep/30" : ""}`}>
                <div className={`mb-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full font-sans text-sm ${
                  cell.muted ? "text-ink/25"
                  : isToday ? "bg-mint-deep font-bold text-white"
                  : "text-ink"
                }`}>
                  {cell.day}
                </div>
                <div className="space-y-1">
                  {dayBills.map((b) => {
                    const BillIcon = ICON_MAP[b.iconKey] ?? Wallet;
                    const status = getBillStatus(b);
                    return (
                      <div key={b.id}
                        draggable
                        onDragStart={(e) => { e.stopPropagation(); setDraggedBillId(b.id); }}
                        onDragEnd={() => setDraggedBillId(null)}
                        className={`rounded-xl bg-white/90 px-1.5 py-1 shadow-sm cursor-grab active:cursor-grabbing ${b.paid ? "opacity-55" : ""} ${draggedBillId === b.id ? "opacity-30" : ""}`}>
                        <div className="flex items-center gap-1.5">
                          <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${b.tint}`}>
                            <BillIcon className="h-3 w-3" strokeWidth={1.8} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-script text-xs leading-tight">{b.name}</p>
                            <p className="font-sans text-[0.6rem] font-bold text-ink-soft">{fmt(getBillDisplayAmount(b))}</p>
                          </div>
                        </div>
                        {status === "overdue" && (
                          <span className="mt-0.5 inline-block rounded-full bg-blush px-1.5 py-px font-hand text-[0.55rem] leading-tight text-blush-deep">
                            Overdue
                          </span>
                        )}
                        {b.actualDate && (
                          <span className="mt-0.5 inline-block rounded-full bg-mint/30 px-1.5 py-px font-hand text-[0.55rem] leading-tight text-mint-deep">
                            rescheduled
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected day detail */}
      {selectedDay !== null && (
        <div className="paper-card mb-6 rounded-3xl bg-white/85 p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-script text-2xl">
              {format(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), selectedDay), "MMMM d")} ♡
            </p>
            <button onClick={() => setSelectedDay(null)} className="font-hand text-xs text-ink-soft hover:text-ink">clear</button>
          </div>
          {selectedDayBills.length === 0 ? (
            <p className="py-4 text-center font-hand text-sm text-ink-soft">No bills on this day. ♡</p>
          ) : (
            <ul>
              {selectedDayBills.map((b) => (
                <BillRow key={b.id} bill={b} onTogglePaid={togglePaid} onDelete={handleDelete} />
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Bottom row */}
      <div className="grid gap-6 sm:grid-cols-[5fr_8fr]">
        {/* Don't forget! */}
        <div className="relative pt-9">
          <Washi className="absolute left-1/2 top-2 z-10 h-9 w-36 -translate-x-1/2 -rotate-2" />
          <div className="paper-card relative -rotate-1 rounded-2xl bg-blush/35 px-5 pb-8 pt-5 shadow-sm">
            <p className="mb-3 font-script text-2xl">Don't forget! ♡</p>
            {overdueBills.length === 0 ? (
              <p className="font-hand text-sm text-ink-soft">You're all caught up! Great job ✨</p>
            ) : (
              <ul className="space-y-2">
                {overdueBills.map((b) => (
                  <li key={b.id} className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0 text-blush-deep">•</span>
                    <p className="font-hand text-sm text-ink">
                      <span className="font-semibold">{b.name}</span> is overdue. Please make payment soon.
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <img src={flower} alt="" loading="lazy" className="absolute -bottom-2 right-2 h-10 w-10 object-contain" />
          </div>
        </div>

        {/* Quote */}
        <div className="paper-card relative overflow-hidden rounded-3xl bg-blush/60 px-8 py-8">
          <div className="flex items-center gap-4">
            <span className="font-script text-6xl leading-none text-blush-deep">"</span>
            <p className="font-script text-xl sm:text-3xl">
              The secret of getting ahead is getting{" "}
              <span className="underline decoration-ink/40 underline-offset-4">started</span>.
            </p>
            <Heart className="h-7 w-7 shrink-0 text-blush-deep" strokeWidth={1.4} />
          </div>
          <img src={vase} alt="" loading="lazy" className="absolute bottom-0 right-16 h-40 w-auto object-contain" />
        </div>
      </div>
    </main>
  );
}
