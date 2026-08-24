import { useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Heart,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  Wallet,
} from "lucide-react";
import { format, parseISO, startOfDay } from "date-fns";
import { useBillStore } from "@/stores/billStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useUIStore } from "@/stores/uiStore";
import { useBills } from "@/hooks/useBills";
import {
  getBillDisplayDate,
  getBillDisplayAmount,
  getBillStatus,
  getDueBadge,
  fmtCurrency,
  sumBills,
  tintToDot,
} from "@/lib/billUtils";
import { ICON_MAP, ICON_TINT_MAP } from "@/lib/constants";
import type { Bill, BillFilter } from "@/types/bill";

import cloudImg from "@/assets/cloud (1).png";
import sprig from "@/assets/doodle-sprig.png";
import vase from "@/assets/doodle-vase.png";
import springBinding from "@/assets/springFourX.png";

const BILLS_PER_PAGE = 8;

export function Bills() {
  const today = useMemo(() => startOfDay(new Date()), []);
  const bills = useBillStore((s) => s.bills);
  const togglePaid = useBillStore((s) => s.togglePaid);
  const deleteBillById = useBillStore((s) => s.deleteBillById);
  const settings = useSettingsStore((s) => s.settings);

  const billFilter = useUIStore((s) => s.billFilter);
  const setBillFilter = useUIStore((s) => s.setBillFilter);
  const listCategoryFilter = useUIStore((s) => s.listCategoryFilter);
  const setListCategoryFilter = useUIStore((s) => s.setListCategoryFilter);
  const listMonthFilter = useUIStore((s) => s.listMonthFilter);
  const setListMonthFilter = useUIStore((s) => s.setListMonthFilter);
  const setAddOpen = useUIStore((s) => s.setAddOpen);
  const setEditingBill = useUIStore((s) => s.setEditingBill);
  const setDeleteTarget = useUIStore((s) => s.setDeleteTarget);

  const { filteredBills } = useBills();
  const [currentPage, setCurrentPage] = useState(1);

  const fmt = (n: number) => fmtCurrency(n, settings.currency, settings.currencyPosition);

  const totalAmt = Math.abs(sumBills(bills));
  const paidList = bills.filter((b) => b.paid);
  const overList = bills.filter((b) => getBillStatus(b) === "overdue");
  const unpaidList = bills.filter((b) => getBillStatus(b) === "upcoming");
  const pageCount = Math.max(1, Math.ceil(filteredBills.length / BILLS_PER_PAGE));
  const activePage = Math.min(currentPage, pageCount);
  const pageStart = filteredBills.length === 0 ? 0 : (activePage - 1) * BILLS_PER_PAGE + 1;
  const pageEnd = Math.min(activePage * BILLS_PER_PAGE, filteredBills.length);
  const visibleBills = filteredBills.slice((activePage - 1) * BILLS_PER_PAGE, activePage * BILLS_PER_PAGE);
  const pageNumbers = useMemo(() => {
    const pages = new Set<number>([1, pageCount]);
    for (let page = activePage - 1; page <= activePage + 1; page += 1) {
      if (page >= 1 && page <= pageCount) pages.add(page);
    }
    return Array.from(pages).sort((a, b) => a - b);
  }, [activePage, pageCount]);

  const handleDelete = (bill: Bill) => {
    if (bill.frequency !== "one-time") {
      setDeleteTarget(bill);
    } else {
      deleteBillById(bill.id);
    }
  };

  return (
    <main className="dot-grid min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8 xl:px-12">
      {/* Header */}
      <header className="mb-7 flex flex-wrap items-center justify-between gap-4 xl:mb-9">
        <h2 className="flex min-w-0 items-center gap-2 font-script text-4xl leading-none sm:gap-3 sm:text-[3.25rem]">
          Bill List
          <span className="text-ink/40"> — </span>
          <span className="truncate italic text-ink/60">All Bills</span>
          <img src={sprig} alt="" aria-hidden="true" loading="lazy"
            className="h-10 w-10 shrink-0 object-contain sm:h-12 sm:w-12" />
        </h2>
        <div className="flex items-center gap-3">
          <div className="paper-card flex items-center gap-2 rounded-full bg-white/85 px-4 py-2.5 sm:px-5 sm:py-3">
            <CalendarDays className="h-5 w-5 shrink-0 text-lilac-deep" strokeWidth={1.6} />
            <span className="font-script text-lg sm:text-xl">{format(new Date(), "MMMM d, yyyy")}</span>
            <ChevronDown className="h-4 w-4 text-ink-soft" strokeWidth={1.8} />
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-lilac shadow-sm">
            <img src={cloudImg} alt="" aria-hidden="true" loading="lazy" className="h-8 w-8 object-contain opacity-80" />
          </div>
        </div>
      </header>

      {/* Stat cards */}
      <div className="relative mb-6 pt-3">
        <div className="paper-card overflow-hidden rounded-[2rem] bg-blush/20 pr-0 sm:pr-16">
          <div className="grid grid-cols-1 divide-y divide-ink/10 sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
            <div className="px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-lilac/40">
                  <Wallet className="h-5 w-5 text-lilac-deep" strokeWidth={1.6} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-script text-xl leading-tight">Total Bills</p>
                  <div className="dashed-rule mt-0.5 text-ink-soft" />
                </div>
              </div>
              <p className="mt-3 font-sans text-3xl font-extrabold">{fmt(totalAmt)}</p>
              <p className="mt-0.5 font-hand text-xs text-ink-soft">{bills.length} bills</p>
            </div>
            <div className="px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mint/50">
                  <Heart className="h-5 w-5 text-mint-deep" strokeWidth={1.6} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-script text-xl leading-tight">Paid</p>
                  <div className="dashed-rule mt-0.5 text-ink-soft" />
                </div>
              </div>
              <p className="mt-3 font-sans text-3xl font-extrabold text-mint-deep">{fmt(Math.abs(sumBills(paidList)))}</p>
              <p className="mt-0.5 font-hand text-xs text-ink-soft">{paidList.length} bills</p>
            </div>
            <div className="px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-butter/60">
                  <AlertCircle className="h-5 w-5 text-[oklch(0.62_0.1_80)]" strokeWidth={1.6} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-script text-xl leading-tight">Unpaid</p>
                  <div className="dashed-rule mt-0.5 text-ink-soft" />
                </div>
              </div>
              <p className="mt-3 font-sans text-3xl font-extrabold text-[oklch(0.62_0.1_80)]">{fmt(Math.abs(sumBills(unpaidList)))}</p>
              <p className="mt-0.5 font-hand text-xs text-ink-soft">{unpaidList.length} bills</p>
            </div>
            <div className="px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blush/50">
                  <AlertCircle className="h-5 w-5 text-blush-deep" strokeWidth={1.6} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-script text-xl leading-tight">Overdue</p>
                  <div className="dashed-rule mt-0.5 text-ink-soft" />
                </div>
              </div>
              <p className="mt-3 font-sans text-3xl font-extrabold text-blush-deep">{fmt(Math.abs(sumBills(overList)))}</p>
              <p className="mt-0.5 font-hand text-xs text-ink-soft">{overList.length} {overList.length === 1 ? "bill" : "bills"}</p>
            </div>
          </div>
        </div>
        <img src={sprig} alt="" loading="lazy"
          className="absolute -right-1 top-4 h-20 w-20 object-contain sm:h-24 sm:w-24" />
      </div>

      {/* Filter pills + Add Bill */}
      <div className="mb-6 flex flex-wrap items-center gap-3 xl:mb-7">
        <div className="relative">
          <select value={billFilter} onChange={(e) => { setBillFilter(e.target.value as BillFilter); setCurrentPage(1); }}
            className="min-w-44 appearance-none cursor-pointer rounded-full border border-lilac/50 bg-lilac/60 py-2.5 pl-5 pr-10 font-hand text-base text-lilac-deep outline-none transition-colors hover:bg-lilac/80">
            <option value="All">All Statuses</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Overdue">Overdue</option>
            <option value="Paid">Paid</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-lilac-deep" strokeWidth={2} />
        </div>
        <div className="relative">
          <select value={listCategoryFilter} onChange={(e) => { setListCategoryFilter(e.target.value); setCurrentPage(1); }}
            className="min-w-44 appearance-none cursor-pointer rounded-full border border-mint/50 bg-mint/50 py-2.5 pl-5 pr-10 font-hand text-base text-mint-deep outline-none transition-colors hover:bg-mint/70">
            <option value="all">All Categories</option>
            {settings.categoryNames.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mint-deep" strokeWidth={2} />
        </div>
        <div className="relative">
          <select value={listMonthFilter} onChange={(e) => { setListMonthFilter(e.target.value); setCurrentPage(1); }}
            className="min-w-44 appearance-none cursor-pointer rounded-full border border-blush/50 bg-blush/50 py-2.5 pl-5 pr-10 font-hand text-base text-blush-deep outline-none transition-colors hover:bg-blush/70">
            <option value="all">All Months</option>
            {["January","February","March","April","May","June","July","August","September","October","November","December"].map((m, idx) => (
              <option key={idx + 1} value={String(idx + 1)}>{m}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-blush-deep" strokeWidth={2} />
        </div>
        <div className="flex-1" />
        <button onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 rounded-full bg-lilac-deep/80 px-6 py-3 font-script text-xl text-white shadow-sm transition-colors hover:bg-lilac-deep">
          <Plus className="h-5 w-5" strokeWidth={1.8} /> Add Bill
        </button>
      </div>

      {/* Bill rows */}
      <div className="space-y-3">
        {filteredBills.length === 0 && (
          <div className="py-12 text-center font-hand text-sm text-ink-soft">No bills match your filters. ♡</div>
        )}
        {visibleBills.map((b) => {
          const BillIcon = ICON_MAP[b.iconKey] ?? Wallet;
          const iconTint = ICON_TINT_MAP[b.iconKey] ?? "bg-lilac/40 text-lilac-deep";
          const status = getBillStatus(b);
          const statusLabel = b.paid ? "Paid" : status === "overdue" ? "Overdue" : "Upcoming";
          const dueBadge = getDueBadge(b, today);
          const rowBg = b.paid ? "bg-mint/15" : status === "overdue" ? "bg-blush/10" : "bg-white/75";
          const displayAmt = getBillDisplayAmount(b);
          const isRecurring = b.frequency !== "one-time";
          return (
            <div key={b.id} className={`bill-row paper-card rounded-[1.5rem] px-4 py-4 sm:px-5 ${rowBg}`}>
              <div className="bill-binding flex items-center justify-start">
                <img src={springBinding} alt="" aria-hidden="true" loading="lazy"
                  className="h-14 w-22 max-w-none object-contain sm:h-15 sm:w-24" />
              </div>
              <div className="bill-identity flex min-w-0 items-center gap-2.5">
                <span className={`h-3 w-3 shrink-0 rounded-full ${tintToDot(b.tint)}`} />
                <div className="min-w-0">
                  <p className={`truncate font-script text-xl leading-tight ${b.paid ? "opacity-60 line-through" : ""}`}>
                    {b.name}
                    {isRecurring && <span className="ml-1 text-ink/30 text-sm" title={`Repeats ${b.frequency}`}><RefreshCw className="inline h-3 w-3" /></span>}
                    {b.type === "refund" && <span className="ml-1 text-xs text-mint-deep">(refund)</span>}
                  </p>
                  <p className="font-hand text-xs text-ink-soft">{format(parseISO(getBillDisplayDate(b)), "MMM d, yyyy")}</p>
                  <span className={`mt-1 inline-block rounded-md px-2 py-0.5 font-hand text-[0.65rem] ${dueBadge.className}`}>
                    {dueBadge.label}
                  </span>
                </div>
              </div>
              <div className="bill-category flex items-center gap-2">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${iconTint}`}>
                  <BillIcon className="h-5 w-5" strokeWidth={1.6} />
                </span>
                <span className="font-hand text-sm text-ink-soft">{b.category || "Other"}</span>
              </div>
              <div className="bill-amount text-center">
                <span className={`font-sans text-base font-bold ${b.type === "refund" ? "text-mint-deep" : ""}`}>{fmt(displayAmt)}</span>
                {b.actualAmount != null && b.actualAmount !== b.amount && (
                  <p className="font-hand text-[0.6rem] text-ink/40">planned {fmt(b.amount)}</p>
                )}
              </div>
              <div className="bill-status flex items-center gap-2">
                <button
                  onClick={() => togglePaid(b.id)}
                  aria-label={b.paid ? "Mark as unpaid" : "Mark as paid"}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                    b.paid ? "bg-mint-deep" : status === "overdue" ? "bg-blush-deep" : "bg-ink/20"
                  }`}>
                  <span className={`absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-all duration-200 ${
                    b.paid ? "left-[23px]" : "left-[3px]"
                  }`} />
                </button>
                <span className={`font-hand text-sm ${
                  b.paid ? "text-mint-deep" : status === "overdue" ? "text-blush-deep" : "text-ink-soft"
                }`}>{statusLabel}</span>
              </div>
              <div className="bill-actions flex shrink-0 gap-1">
                <button onClick={() => setEditingBill(b)}
                  className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-ink/5"
                  aria-label="Edit bill">
                  <Pencil className="h-4 w-4 text-ink/40" strokeWidth={1.5} />
                </button>
                <button onClick={() => handleDelete(b)}
                  className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-blush/30"
                  aria-label="Delete bill">
                  <Trash2 className="h-4 w-4 text-ink/40" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredBills.length > 0 && (
        <div className="paper-card mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] bg-white/80 px-4 py-3 sm:px-5">
          <p className="font-hand text-sm text-ink-soft">
            Showing <span className="font-bold text-lilac-deep">{pageStart}-{pageEnd}</span> of{" "}
            <span className="font-bold text-blush-deep">{filteredBills.length}</span> bills
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={activePage === 1}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-lilac/60 text-lilac-deep transition-colors hover:bg-lilac disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.8} />
            </button>
            {pageNumbers.map((page, idx) => {
              const previousPage = pageNumbers[idx - 1];
              const showGap = previousPage != null && page - previousPage > 1;
              return (
                <span key={page} className="flex items-center gap-2">
                  {showGap && <span className="font-hand text-sm text-ink/35">...</span>}
                  <button
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`h-9 min-w-9 rounded-full px-3 font-hand text-sm transition-colors ${
                      activePage === page
                        ? "bg-lilac-deep/75 text-white shadow-sm"
                        : "bg-blush/35 text-blush-deep hover:bg-blush/60"
                    }`}
                    aria-current={activePage === page ? "page" : undefined}
                  >
                    {page}
                  </button>
                </span>
              );
            })}
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
              disabled={activePage === pageCount}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-lilac/60 text-lilac-deep transition-colors hover:bg-lilac disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={1.8} />
            </button>
          </div>
        </div>
      )}

      {/* Quote banner */}
      <footer className="paper-card relative mt-6 overflow-hidden rounded-[1.6rem] bg-blush/50 px-6 py-4 sm:px-8 sm:py-5">
        <div className="relative z-10 flex items-center gap-2 pr-20 sm:gap-4 sm:pr-44">
          <span className="font-script text-5xl leading-none text-blush-deep/70 sm:text-6xl">"</span>
          <p className="font-script text-lg leading-snug sm:text-xl">
            The secret of getting ahead is getting{" "}
            <span className="underline decoration-ink/40 underline-offset-4">started</span>.
          </p>
          <Heart className="h-5 w-5 shrink-0 -rotate-12 text-blush-deep/60" strokeWidth={1.4} />
        </div>
        <img src={vase} alt="" aria-hidden="true" loading="lazy"
          className="absolute bottom-0 right-4 h-24 w-auto object-contain sm:right-8 sm:h-28" />
      </footer>
    </main>
  );
}
