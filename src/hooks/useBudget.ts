import { useMemo } from "react";
import { isSameMonth, parseISO } from "date-fns";
import { useBillStore } from "@/stores/billStore";
import { getBillDisplayDate, sumBills } from "@/lib/billUtils";

export function useBudget(budgetMonth: Date) {
  const bills = useBillStore((s) => s.bills);

  const monthBills = useMemo(
    () =>
      bills.filter((b) =>
        isSameMonth(parseISO(getBillDisplayDate(b)), budgetMonth),
      ),
    [bills, budgetMonth],
  );

  const totalExpected = useMemo(() => sumBills(monthBills), [monthBills]);
  const totalPaid = useMemo(
    () => sumBills(monthBills.filter((b) => b.paid)),
    [monthBills],
  );
  const paidPct = useMemo(
    () =>
      totalExpected > 0
        ? Math.round(
            (Math.abs(totalPaid) / Math.abs(totalExpected)) * 100,
          )
        : 0,
    [totalExpected, totalPaid],
  );

  const getCatBills = (cat: string) =>
    monthBills.filter((b) => b.category === cat);

  return { monthBills, totalExpected, totalPaid, paidPct, getCatBills };
}
