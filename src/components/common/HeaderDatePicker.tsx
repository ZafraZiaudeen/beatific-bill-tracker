import { useEffect, useMemo, useRef, useState } from "react";
import {
  addDays,
  addMonths,
  format,
  getDay,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  subMonths,
} from "date-fns";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useSettingsStore } from "@/stores/settingsStore";
import { useUIStore } from "@/stores/uiStore";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function HeaderDatePicker() {
  const referenceDate = useUIStore((s) => s.referenceDate);
  const setReferenceDate = useUIStore((s) => s.setReferenceDate);
  const weekStart = useSettingsStore((s) => s.settings.weekStart);
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(referenceDate));
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      window.requestAnimationFrame(() => selectedRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handlePointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const days = useMemo(() => {
    const first = startOfMonth(viewMonth);
    const offset = (getDay(first) - (weekStart === "Monday" ? 1 : 0) + 7) % 7;
    const gridStart = addDays(first, -offset);
    return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
  }, [viewMonth, weekStart]);

  const year = viewMonth.getFullYear();
  const years = useMemo(
    () => Array.from({ length: 101 }, (_, index) => year - 50 + index),
    [year],
  );
  const dayHeaders = weekStart === "Monday"
    ? ["M", "T", "W", "T", "F", "S", "S"]
    : ["S", "M", "T", "W", "T", "F", "S"];

  const chooseDate = (date: Date) => {
    setReferenceDate(startOfDay(date));
    setOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div ref={rootRef} className="relative z-30">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (!open) setViewMonth(startOfMonth(referenceDate));
          setOpen((value) => !value);
        }}
        className="paper-card flex items-center gap-2 rounded-full bg-white/85 px-4 py-2.5 transition-colors hover:bg-white sm:px-5 sm:py-3"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Choose date, currently ${format(referenceDate, "MMMM d, yyyy")}`}
      >
        <CalendarDays className="h-5 w-5 shrink-0 text-lilac-deep" strokeWidth={1.6} />
        <span className="whitespace-nowrap font-script text-lg sm:text-xl">
          {format(referenceDate, "MMMM d, yyyy")}
        </span>
        <ChevronDown className={`h-4 w-4 text-ink-soft transition-transform ${open ? "rotate-180" : ""}`} strokeWidth={1.8} />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Choose a date"
          className="paper-card absolute right-0 top-[calc(100%+0.65rem)] z-50 w-[min(20rem,calc(100vw-2rem))] rounded-3xl border border-lilac-deep/15 bg-paper/95 p-4 shadow-xl backdrop-blur-sm"
        >
          <div className="mb-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMonth((month) => subMonths(month, 1))}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-lilac/35 text-lilac-deep hover:bg-lilac/60"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.8} />
            </button>
            <select
              value={viewMonth.getMonth()}
              onChange={(event) => setViewMonth(new Date(year, Number(event.target.value), 1))}
              className="min-w-0 flex-1 rounded-xl border border-ink/10 bg-white/75 px-2 py-2 font-hand text-sm outline-none focus:border-lilac-deep/40"
              aria-label="Month"
            >
              {MONTHS.map((month, index) => <option key={month} value={index}>{month}</option>)}
            </select>
            <select
              value={year}
              onChange={(event) => setViewMonth(new Date(Number(event.target.value), viewMonth.getMonth(), 1))}
              className="w-24 rounded-xl border border-ink/10 bg-white/75 px-2 py-2 font-hand text-sm outline-none focus:border-lilac-deep/40"
              aria-label="Year"
            >
              {years.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
            <button
              type="button"
              onClick={() => setViewMonth((month) => addMonths(month, 1))}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-lilac/35 text-lilac-deep hover:bg-lilac/60"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={1.8} />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7">
            {dayHeaders.map((label, index) => (
              <span key={`${label}-${index}`} className="py-1 text-center font-hand text-[0.65rem] font-bold text-ink-soft">
                {label}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const selected = isSameDay(day, referenceDate);
              const inMonth = isSameMonth(day, viewMonth);
              const realToday = isSameDay(day, new Date());
              return (
                <button
                  key={format(day, "yyyy-MM-dd")}
                  ref={selected ? selectedRef : undefined}
                  type="button"
                  onClick={() => chooseDate(day)}
                  className={`relative flex aspect-square items-center justify-center rounded-full font-hand text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-lilac-deep/45 ${
                    selected
                      ? "bg-lilac-deep text-white shadow-sm"
                      : inMonth
                        ? "text-ink hover:bg-blush/45"
                        : "text-ink/30 hover:bg-lilac/20"
                  }`}
                  aria-label={format(day, "MMMM d, yyyy")}
                  aria-pressed={selected}
                >
                  {day.getDate()}
                  {realToday && !selected && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-blush-deep" />}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-dashed border-ink/15 pt-3">
            <p className="font-script text-base text-ink-soft">Choose your journal day ♡</p>
            <button
              type="button"
              onClick={() => chooseDate(new Date())}
              className="rounded-full bg-blush/50 px-4 py-1.5 font-hand text-xs text-blush-deep hover:bg-blush/70"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
