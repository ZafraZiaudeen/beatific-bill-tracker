import { useMemo } from "react";
import { parseISO } from "date-fns";
import { useBillStore } from "@/stores/billStore";
import { getBillDisplayDate, getBillDisplayAmount, sumBills } from "@/lib/billUtils";
import { BUDGET_CHART_COLORS, MONTHS_SHORT } from "@/lib/constants";

export function useYearly(yearlyYear: number) {
  const bills = useBillStore((s) => s.bills);

  const yearBills = useMemo(
    () =>
      bills.filter(
        (b) => parseISO(getBillDisplayDate(b)).getFullYear() === yearlyYear,
      ),
    [bills, yearlyYear],
  );

  const yearExpected = useMemo(() => sumBills(yearBills), [yearBills]);
  const yearPaid = useMemo(
    () => sumBills(yearBills.filter((b) => b.paid)),
    [yearBills],
  );
  const yearPct = useMemo(
    () =>
      yearExpected > 0
        ? Math.round((Math.abs(yearPaid) / Math.abs(yearExpected)) * 100)
        : 0,
    [yearExpected, yearPaid],
  );

  const getCatYearBills = (cat: string) =>
    yearBills.filter((b) => b.category === cat);

  const getCatMonthlyData = (cat: string) =>
    MONTHS_SHORT.map((month, idx) => {
      const mb = yearBills.filter(
        (b) =>
          b.category === cat &&
          parseISO(getBillDisplayDate(b)).getMonth() === idx,
      );
      return {
        month,
        expected: Math.abs(sumBills(mb)),
        paid: Math.abs(sumBills(mb.filter((b) => b.paid))),
      };
    });

  const top5Bills = useMemo(
    () =>
      [...yearBills]
        .sort((a, b) => getBillDisplayAmount(b) - getBillDisplayAmount(a))
        .slice(0, 5),
    [yearBills],
  );

  const top5PieData = useMemo(
    () =>
      top5Bills.length > 0
        ? top5Bills.map((b, i) => ({
            name: b.name,
            value: getBillDisplayAmount(b),
            color: BUDGET_CHART_COLORS[i % BUDGET_CHART_COLORS.length]!,
          }))
        : [{ name: "empty", value: 1, color: "#e5e5e5" }],
    [top5Bills],
  );

  return {
    yearBills,
    yearExpected,
    yearPaid,
    yearPct,
    getCatYearBills,
    getCatMonthlyData,
    top5Bills,
    top5PieData,
  };
}
