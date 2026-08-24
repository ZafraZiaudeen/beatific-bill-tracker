import {
  differenceInCalendarDays,
  getDaysInMonth,
  getDay,
  isBefore,
  parseISO,
  startOfDay,
  startOfMonth,
  subMonths,
} from "date-fns";
import type { Bill, BillStatus } from "@/types/bill";
import { DEFAULT_SETTINGS, SEED_BILLS } from "@/lib/constants";

export function parseLocalDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year!, month! - 1, day!);
}

export function toLocalDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function getBillDisplayDate(bill: Bill): string {
  return bill.actualDate ?? bill.dueDate;
}

export function getBillDisplayAmount(bill: Bill): number {
  return bill.actualAmount ?? bill.amount;
}

export function getBillStatus(bill: Bill, referenceDate = new Date()): BillStatus {
  if (bill.paid) return "paid";
  const today = startOfDay(referenceDate);
  const due = parseLocalDate(getBillDisplayDate(bill));
  return due < today ? "overdue" : "upcoming";
}

export function getBillStatusLabel(
  bill: Bill,
  today: Date,
): "Upcoming" | "Overdue" | "Paid" {
  if (bill.paid) return "Paid";
  return isBefore(parseISO(getBillDisplayDate(bill)), today)
    ? "Overdue"
    : "Upcoming";
}

export function getDueBadge(
  bill: Bill,
  today: Date,
): { label: string; className: string } {
  if (bill.paid) {
    return { label: "Paid", className: "bg-mint text-mint-deep" };
  }
  const days = differenceInCalendarDays(
    parseLocalDate(getBillDisplayDate(bill)),
    today,
  );
  if (days === 0) {
    return {
      label: "Due today",
      className: "bg-peach text-[oklch(0.55_0.1_55)]",
    };
  }
  if (days < 0) {
    const overdueDays = Math.abs(days);
    return {
      label: `${overdueDays} ${overdueDays === 1 ? "day" : "days"} overdue`,
      className: "bg-blush text-blush-deep",
    };
  }
  return {
    label: `${days} ${days === 1 ? "day" : "days"} left`,
    className: "bg-lilac text-lilac-deep",
  };
}

export function sortBills(arr: Bill[]): Bill[] {
  return [...arr].sort((a, b) => {
    const da = getBillDisplayDate(a);
    const db = getBillDisplayDate(b);
    if (da !== db) return da.localeCompare(db);
    return (a.priority ?? 2) - (b.priority ?? 2);
  });
}

export function sumBills(billList: Bill[]): number {
  return billList.reduce((total, bill) => {
    const amount = getBillDisplayAmount(bill);
    return bill.type === "refund" ? total - amount : total + amount;
  }, 0);
}

export function generateRecurringBills(bill: Bill): Bill[] {
  if (bill.frequency === "one-time") return [bill];
  const results: Bill[] = [];
  const endOfNextYear = new Date(new Date().getFullYear() + 1, 11, 31);
  const hardEnd = bill.endDate
    ? parseLocalDate(bill.endDate)
    : endOfNextYear;
  const current = parseLocalDate(bill.dueDate);
  const originalDay = current.getDate();
  let isFirst = true;
  while (current <= hardEnd && results.length < 500) {
    results.push({
      ...bill,
      id: isFirst ? bill.id : crypto.randomUUID(),
      dueDate: toLocalDateString(current),
      paid: isFirst ? bill.paid : false,
      actualAmount: isFirst ? bill.actualAmount : null,
      actualDate: isFirst ? bill.actualDate : null,
    });
    isFirst = false;
    switch (bill.frequency) {
      case "daily":
        current.setDate(current.getDate() + bill.interval);
        break;
      case "weekly":
        current.setDate(current.getDate() + 7 * bill.interval);
        break;
      case "monthly": {
        current.setDate(1);
        current.setMonth(current.getMonth() + bill.interval);
        const lastDay = new Date(
          current.getFullYear(),
          current.getMonth() + 1,
          0,
        ).getDate();
        current.setDate(Math.min(originalDay, lastDay));
        break;
      }
      case "yearly":
        current.setFullYear(current.getFullYear() + bill.interval);
        break;
    }
  }
  return results;
}

export function extendRecurringSeries(billList: Bill[]): Bill[] {
  const seriesMap = new Map<string, Bill[]>();
  for (const b of billList) {
    if (!seriesMap.has(b.seriesId)) seriesMap.set(b.seriesId, []);
    seriesMap.get(b.seriesId)!.push(b);
  }
  const result: Bill[] = [];
  for (const [, series] of seriesMap) {
    const template = series[0]!;
    if (template.frequency === "one-time" || template.endDate) {
      result.push(...series);
      continue;
    }
    const endOfNextYear = new Date(new Date().getFullYear() + 1, 11, 31);
    const lastDate = parseLocalDate(
      series.reduce(
        (max, b) => (b.dueDate > max ? b.dueDate : max),
        series[0]!.dueDate,
      ),
    );
    if (lastDate >= endOfNextYear) {
      result.push(...series);
      continue;
    }
    const generated = generateRecurringBills(template);
    const existingIds = new Set(series.map((b) => b.id));
    const newOnes = generated.filter(
      (b) => !existingIds.has(b.id) && parseLocalDate(b.dueDate) > lastDate,
    );
    result.push(...series, ...newOnes);
  }
  return result;
}

export function syncRecurringSeriesEndDate(
  billList: Bill[],
  templateBill: Bill,
): Bill[] {
  if (templateBill.frequency === "one-time") return billList;

  let result = billList.map((b) =>
    b.seriesId === templateBill.seriesId
      ? { ...b, endDate: templateBill.endDate }
      : b,
  );

  if (templateBill.endDate) {
    const endLimit = parseLocalDate(templateBill.endDate);
    result = result.filter(
      (b) =>
        b.seriesId !== templateBill.seriesId ||
        b.paid ||
        parseLocalDate(b.dueDate) <= endLimit,
    );
  }

  const existingDates = new Set(
    result
      .filter((b) => b.seriesId === templateBill.seriesId)
      .map((b) => b.dueDate),
  );
  const missing = generateRecurringBills(templateBill).filter(
    (b) => !existingDates.has(b.dueDate),
  );
  return [...result, ...missing];
}

export function normalizeBill(b: Record<string, unknown>): Bill {
  const priority =
    typeof b["priority"] === "number"
      ? b["priority"]
      : typeof b["priority"] === "string" && !isNaN(Number(b["priority"]))
        ? Number(b["priority"])
        : 2;
  return {
    id: String(b["id"] ?? crypto.randomUUID()),
    seriesId: String(b["seriesId"] ?? b["id"] ?? crypto.randomUUID()),
    name: String(b["name"] ?? ""),
    category: String(b["category"] ?? "Other"),
    type: (b["type"] === "refund" ? "refund" : "payment") as
      | "payment"
      | "refund",
    amount: Number(b["amount"] ?? 0),
    actualAmount: b["actualAmount"] != null ? Number(b["actualAmount"]) : null,
    dueDate: String(b["dueDate"] ?? toLocalDateString(new Date())),
    actualDate: b["actualDate"] != null ? String(b["actualDate"]) : null,
    priority,
    frequency: (
      ["one-time", "daily", "weekly", "monthly", "yearly"].includes(
        String(b["frequency"]),
      )
        ? b["frequency"]
        : "one-time"
    ) as Bill["frequency"],
    interval: Number(b["interval"] ?? 1) || 1,
    endDate: b["endDate"] != null ? String(b["endDate"]) : null,
    paid: Boolean(b["paid"]),
    notes: String(b["notes"] ?? ""),
    iconKey: String(b["iconKey"] ?? "Wallet"),
    tint: String(b["tint"] ?? "bg-mint text-mint-deep"),
  };
}

export function tintToMark(tint: string): string {
  if (tint.includes("bg-mint")) return "bg-mint-deep/70 text-white";
  if (tint.includes("bg-blush")) return "bg-blush-deep/70 text-white";
  if (tint.includes("bg-lilac")) return "bg-lilac-deep text-white";
  return "bg-[oklch(0.62_0.1_80)] text-white";
}

export function tintToDot(tint: string): string {
  if (tint.includes("bg-mint")) return "bg-mint-deep";
  if (tint.includes("bg-blush")) return "bg-blush-deep";
  if (tint.includes("bg-lilac")) return "bg-lilac-deep";
  return "bg-[oklch(0.62_0.1_80)]";
}

export interface CalendarCell {
  day: number;
  muted?: true;
}

export function buildCalendarCells(month: Date): CalendarCell[] {
  const firstDay = startOfMonth(month);
  const startDow = getDay(firstDay);
  const daysInMonth = getDaysInMonth(month);
  const daysInPrev = getDaysInMonth(subMonths(month, 1));

  const cells: CalendarCell[] = [];
  for (let i = startDow - 1; i >= 0; i--)
    cells.push({ day: daysInPrev - i, muted: true });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d });
  const rem = cells.length % 7;
  if (rem > 0)
    for (let d = 1; d <= 7 - rem; d++) cells.push({ day: d, muted: true });
  return cells;
}

export function fmtCurrency(n: number, currency = "$", position: "before" | "after" = "before"): string {
  const num = n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return position === "after" ? `${num}${currency}` : `${currency}${num}`;
}

export function getGreeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Good morning";
  if (h >= 12 && h < 18) return "Good afternoon";
  return "Good evening";
}

export { DEFAULT_SETTINGS, SEED_BILLS };
