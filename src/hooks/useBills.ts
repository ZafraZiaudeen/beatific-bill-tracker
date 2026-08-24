import { useMemo } from "react";
import { parseISO } from "date-fns";
import { useBillStore } from "@/stores/billStore";
import { useUIStore } from "@/stores/uiStore";
import { sortBills, getBillStatus, getBillDisplayDate } from "@/lib/billUtils";

export function useBills() {
  const bills = useBillStore((s) => s.bills);
  const billFilter = useUIStore((s) => s.billFilter);
  const listMonthFilter = useUIStore((s) => s.listMonthFilter);
  const listYearFilter = useUIStore((s) => s.listYearFilter);
  const listPriorityFilter = useUIStore((s) => s.listPriorityFilter);
  const listCategoryFilter = useUIStore((s) => s.listCategoryFilter);
  const referenceDate = useUIStore((s) => s.referenceDate);

  const sortedBills = useMemo(() => sortBills(bills), [bills]);

  const filteredBills = useMemo(() => {
    let result = sortedBills;
    if (billFilter !== "All") {
      if (billFilter === "Paid") result = result.filter((b) => b.paid);
      else {
        const target = billFilter.toLowerCase() as "upcoming" | "overdue";
        result = result.filter((b) => getBillStatus(b, referenceDate) === target);
      }
    }
    if (listMonthFilter !== "all") {
      result = result.filter(
        (b) =>
          (parseISO(getBillDisplayDate(b)).getMonth() + 1).toString() ===
          listMonthFilter,
      );
    }
    if (listYearFilter !== "all") {
      result = result.filter(
        (b) =>
          parseISO(getBillDisplayDate(b)).getFullYear().toString() ===
          listYearFilter,
      );
    }
    if (listPriorityFilter !== "all") {
      result = result.filter((b) => String(b.priority) === listPriorityFilter);
    }
    if (listCategoryFilter !== "all") {
      result = result.filter((b) => b.category === listCategoryFilter);
    }
    return result;
  }, [
    sortedBills,
    billFilter,
    listMonthFilter,
    listYearFilter,
    listPriorityFilter,
    listCategoryFilter,
    referenceDate,
  ]);

  const uniqueSeriesCount = useMemo(
    () => new Set(bills.map((b) => b.seriesId)).size,
    [bills],
  );

  const billYears = useMemo(() => {
    const years = new Set(
      bills.map((b) =>
        parseISO(getBillDisplayDate(b)).getFullYear().toString(),
      ),
    );
    return Array.from(years).sort();
  }, [bills]);

  return { bills, sortedBills, filteredBills, uniqueSeriesCount, billYears };
}
