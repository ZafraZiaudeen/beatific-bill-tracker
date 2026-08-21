import { useMemo } from "react";
import { isSameMonth, parseISO } from "date-fns";
import { useBillStore } from "@/stores/billStore";
import { useUIStore } from "@/stores/uiStore";
import {
  buildCalendarCells,
  getBillDisplayDate,
  getBillStatus,
  tintToMark,
} from "@/lib/billUtils";
import type { Bill } from "@/types/bill";

export function useCalendar() {
  const bills = useBillStore((s) => s.bills);
  const calendarMonth = useUIStore((s) => s.calendarMonth);
  const calStatusFilter = useUIStore((s) => s.calStatusFilter);
  const selectedDay = useUIStore((s) => s.selectedDay);

  const calendarCells = useMemo(
    () => buildCalendarCells(calendarMonth),
    [calendarMonth],
  );

  const calendarMarks = useMemo(() => {
    const marks: Record<number, string> = {};
    bills.forEach((b) => {
      const d = parseISO(getBillDisplayDate(b));
      if (isSameMonth(d, calendarMonth)) {
        const day = d.getDate();
        if (!marks[day]) marks[day] = tintToMark(b.tint);
      }
    });
    return marks;
  }, [bills, calendarMonth]);

  const calendarAgenda: Bill[] = useMemo(
    () =>
      bills
        .filter((b) =>
          isSameMonth(parseISO(getBillDisplayDate(b)), calendarMonth),
        )
        .sort((a, b) =>
          getBillDisplayDate(a).localeCompare(getBillDisplayDate(b)),
        ),
    [bills, calendarMonth],
  );

  const calendarDayBillsMap: Record<number, Bill[]> = useMemo(() => {
    const map: Record<number, Bill[]> = {};
    calendarAgenda.forEach((b) => {
      if (calStatusFilter !== "all") {
        const status = getBillStatus(b);
        if (calStatusFilter === "paid" && !b.paid) return;
        if (calStatusFilter === "upcoming" && status !== "upcoming") return;
        if (calStatusFilter === "overdue" && status !== "overdue") return;
      }
      const displayDate = getBillDisplayDate(b);
      const d = parseISO(displayDate);
      if (isSameMonth(d, calendarMonth)) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(b);
      }
    });
    return map;
  }, [calendarAgenda, calStatusFilter, calendarMonth]);

  const selectedDayBills: Bill[] = useMemo(() => {
    if (!selectedDay) return [];
    return bills.filter((b) => {
      const d = parseISO(getBillDisplayDate(b));
      return isSameMonth(d, calendarMonth) && d.getDate() === selectedDay;
    });
  }, [bills, calendarMonth, selectedDay]);

  return {
    calendarCells,
    calendarMarks,
    calendarAgenda,
    calendarDayBillsMap,
    selectedDayBills,
  };
}
