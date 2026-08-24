import { format, parseISO } from "date-fns";
import { Check, Trash2, Wallet } from "lucide-react";
import type { Bill } from "@/types/bill";
import { ICON_MAP } from "@/lib/constants";
import {
  getBillDisplayDate,
  getBillStatusLabel,
  getDueBadge,
  fmtCurrency,
} from "@/lib/billUtils";
import { useSettingsStore } from "@/stores/settingsStore";
import { useUIStore } from "@/stores/uiStore";
import { startOfDay } from "date-fns";

interface BillRowProps {
  bill: Bill;
  onTogglePaid: (id: string) => void;
  onDelete: (bill: Bill) => void;
}

export function BillRow({ bill, onTogglePaid, onDelete }: BillRowProps) {
  const settings = useSettingsStore((s) => s.settings);
  const today = startOfDay(useUIStore((s) => s.referenceDate));
  const BillIcon = ICON_MAP[bill.iconKey] ?? Wallet;
  const status = getBillStatusLabel(bill, today);
  const dueBadge = getDueBadge(bill, today);

  const fmt = (n: number) =>
    fmtCurrency(n, settings.currency, settings.currencyPosition);

  return (
    <li
      className={`group flex items-center gap-3 border-b border-ink/10 py-3 last:border-0 ${bill.paid ? "opacity-60" : ""}`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${bill.tint}`}
      >
        <BillIcon className="h-5 w-5" strokeWidth={1.6} />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={`block font-script text-xl leading-tight ${bill.paid ? "line-through" : ""}`}
        >
          {bill.name}
        </span>
        <span className="block font-hand text-xs text-ink-soft">
          {format(parseISO(getBillDisplayDate(bill)), "MMM d, yyyy")}
        </span>
        <span
          className={`mt-1 inline-block rounded-md px-2 py-0.5 font-hand text-[0.65rem] ${dueBadge.className}`}
        >
          {dueBadge.label}
        </span>
      </span>
      <span className="text-right">
        <span className="block font-sans text-sm font-bold">
          {fmt(bill.amount)}
        </span>
        <span
          className={`mt-1 inline-block rounded-md px-2 py-0.5 font-hand text-[0.7rem] ${
            status === "Paid"
              ? "bg-lilac text-lilac-deep"
              : status === "Overdue"
                ? "bg-blush text-blush-deep"
                : "bg-mint text-mint-deep"
          }`}
        >
          {status}
        </span>
      </span>
      <span className="flex shrink-0 flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={() => onTogglePaid(bill.id)}
          className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors ${
            bill.paid
              ? "bg-lilac text-lilac-deep hover:bg-lilac-deep hover:text-white"
              : "bg-mint text-mint-deep hover:bg-mint-deep hover:text-white"
          }`}
          aria-label={bill.paid ? "Mark as unpaid" : "Mark as paid"}
        >
          <Check className="h-3 w-3" strokeWidth={2.5} />
        </button>
        <button
          onClick={() => onDelete(bill)}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-blush text-blush-deep transition-colors hover:bg-blush-deep hover:text-white"
          aria-label="Delete bill"
        >
          <Trash2 className="h-3 w-3" strokeWidth={2} />
        </button>
      </span>
    </li>
  );
}
