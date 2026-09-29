import { useEffect, useMemo, useState } from 'react';
import { PageIntroBanner } from '../components/PageIntroBanner';
import { useLedgerlyStore } from '../store/useLedgerlyStore';
import { fmt, fmtYMFull } from '../utils/formatters';
import { getAllBillOccurrencesForMonth, getBillOccurrencesForMonth, monthlyBillEquivalent } from '../utils/bills';
import { BillEditorDialog, type BillDialogSaveResult } from '../dialogs/BillEditorDialog';
import type { Bill } from '../types';
import sprig02 from '../../../assets/budget-assets/botanical-sprigs/botanical-sprigs-02.png';
import sprig03 from '../../../assets/budget-assets/botanical-sprigs/botanical-sprigs-03.png';
import flower01 from '../../../assets/budget-assets/flowers-and-leaves/flowers-and-leaves-01.png';
import flower03 from '../../../assets/budget-assets/flowers-and-leaves/flowers-and-leaves-03.png';
import flower05 from '../../../assets/budget-assets/flowers-and-leaves/flowers-and-leaves-05.png';
import heart01 from '../../../assets/budget-assets/hearts/heart-01.png';

const REFLECTIONS = [
  'Paying your bills on time builds the life you want.',
  'Every payment is a promise kept to your future self.',
  'Financial peace starts with knowing what is due and when.',
  'Staying on top of bills is how you protect your peace.',
  'Small consistent actions create lasting financial freedom.',
];

const BILLS_PER_PAGE = 10;
const SCHEDULES_PER_PAGE = 10;

function fmtDate(iso: string, year = true) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(year ? { year: 'numeric' } : {}),
  });
}

function dueLabel(daysUntil: number) {
  if (daysUntil === 0) return 'due today';
  if (daysUntil > 0) return `in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`;
  return `${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? 's' : ''} ago`;
}

function scheduleSummary(bill: Bill): string {
  const cadence = bill.cadence || 'Monthly';
  if (cadence === 'Monthly') return `Monthly on day ${bill.dueDay}`;
  if (!bill.startDate) return `${cadence} · Anchor not set`;
  if (cadence === 'Weekly') return `Every 7 days from ${fmtDate(bill.startDate)}`;
  if (cadence === 'Bi-weekly') return `Every 14 days from ${fmtDate(bill.startDate)}`;
  return `Yearly on ${fmtDate(bill.startDate, false)}`;
}

function scheduleState(bill: Bill, todayIso: string): 'Active' | 'Paused' | 'Ended' {
  if (bill.active === false) return 'Paused';
  if (bill.endDate && bill.endDate < todayIso) return 'Ended';
  return 'Active';
}

export function BillsPage() {
  const bills = useLedgerlyStore(s => s.bills);
  const categories = useLedgerlyStore(s => s.categories);
  const accounts = useLedgerlyStore(s => s.accounts);
  const deleteBill = useLedgerlyStore(s => s.deleteBill);
  const updateBill = useLedgerlyStore(s => s.updateBill);
  const toggleAutopay = useLedgerlyStore(s => s.toggleAutopay);
  const recordBillPayment = useLedgerlyStore(s => s.recordBillPayment);
  const markBillPaid = useLedgerlyStore(s => s.markBillPaid);
  const currentMonth = useLedgerlyStore(s => s.currentMonth);
  const [showDialog, setShowDialog] = useState(false);
  const [editBill, setEditBill] = useState<Bill | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [accountFilter, setAccountFilter] = useState('all');
  const [autopayFilter, setAutopayFilter] = useState('all');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [saveMessage, setSaveMessage] = useState('');
  const [scheduleDrawerOpen, setScheduleDrawerOpen] = useState(false);
  const [scheduleSearch, setScheduleSearch] = useState('');
  const [schedulePage, setSchedulePage] = useState(1);
  const [highlightedBillId, setHighlightedBillId] = useState<number | null>(null);

  useEffect(() => {
    if (!saveMessage) return;
    const timeout = window.setTimeout(() => {
      setSaveMessage('');
      setHighlightedBillId(null);
    }, 4500);
    return () => window.clearTimeout(timeout);
  }, [saveMessage]);

  const categoryColor = useMemo(() => {
    const map = new Map(categories.map(category => [category.name, category.color]));
    return (name: string) => map.get(name) ?? '#9ca3af';
  }, [categories]);

  const occurrences = useMemo(() => getAllBillOccurrencesForMonth(bills, currentMonth), [bills, currentMonth]);
  const filteredOccurrences = occurrences.filter(occ => {
    const term = search.trim().toLowerCase();
    const b = occ.bill;
    const matchesTerm = !term
      || b.name.toLowerCase().includes(term)
      || b.category.toLowerCase().includes(term)
      || (b.account || '').toLowerCase().includes(term)
      || (b.notes || '').toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'all' || occ.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || b.category === categoryFilter;
    const matchesAccount = accountFilter === 'all' || (accountFilter === 'unlinked' ? !b.account : b.account === accountFilter);
    const matchesAutopay = autopayFilter === 'all' || (autopayFilter === 'on' ? b.autopay : !b.autopay);
    const matchesDay = selectedDay === null || occ.dueDay === selectedDay;
    return matchesTerm && matchesStatus && matchesCategory && matchesAccount && matchesAutopay && matchesDay;
  });
  const totalPages = Math.max(1, Math.ceil(filteredOccurrences.length / BILLS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const visibleOccurrences = filteredOccurrences.slice((safePage - 1) * BILLS_PER_PAGE, safePage * BILLS_PER_PAGE);
  const pageStart = filteredOccurrences.length === 0 ? 0 : (safePage - 1) * BILLS_PER_PAGE + 1;
  const pageEnd = Math.min(safePage * BILLS_PER_PAGE, filteredOccurrences.length);
  const filteredSchedules = useMemo(() => {
    const term = scheduleSearch.trim().toLowerCase();
    return [...bills]
      .filter(bill => !term
        || bill.name.toLowerCase().includes(term)
        || bill.category.toLowerCase().includes(term)
        || (bill.account || '').toLowerCase().includes(term)
        || (bill.notes || '').toLowerCase().includes(term))
      .sort((a, b) => b.id - a.id);
  }, [bills, scheduleSearch]);
  const scheduleTotalPages = Math.max(1, Math.ceil(filteredSchedules.length / SCHEDULES_PER_PAGE));
  const safeSchedulePage = Math.min(schedulePage, scheduleTotalPages);
  const visibleSchedules = filteredSchedules.slice((safeSchedulePage - 1) * SCHEDULES_PER_PAGE, safeSchedulePage * SCHEDULES_PER_PAGE);

  const totalDue = occurrences.reduce((sum, occ) => sum + occ.bill.amount, 0);
  const autopayTotal = occurrences.filter(occ => occ.bill.autopay).reduce((sum, occ) => sum + occ.bill.amount, 0);
  const averageMonthly = bills.filter(b => b.active !== false).reduce((sum, bill) => sum + monthlyBillEquivalent(bill), 0);
  const nextDue = occurrences.filter(occ => occ.daysUntil >= 0 && occ.status !== 'paid').sort((a, b) => a.daysUntil - b.daysUntil)[0] ?? null;
  const overdueCount = occurrences.filter(occ => occ.status === 'overdue').length;

  const [y, m] = currentMonth.split('-').map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const firstDay = new Date(y, m - 1, 1).getDay();
  const now = new Date();
  const isCurrentYM = now.getFullYear() === y && now.getMonth() === m - 1;
  const todayD = isCurrentYM ? now.getDate() : -1;

  const calBills: Record<number, typeof occurrences> = {};
  occurrences.forEach(occ => {
    (calBills[occ.dueDay] ??= []).push(occ);
  });

  const catMap: Record<string, { amount: number; icon: string }> = {};
  occurrences.forEach(occ => {
    const b = occ.bill;
    if (!catMap[b.category]) catMap[b.category] = { amount: 0, icon: b.icon };
    catMap[b.category].amount += b.amount;
  });
  const legendCats = Object.keys(catMap).slice(0, 5);

  const handleEdit = (b: Bill) => { setEditBill(b); setShowDialog(true); setMenuId(null); };
  const handleDelete = (id: number) => {
    if (confirm('Delete this recurring bill?')) {
      deleteBill(id);
      setMenuId(null);
      if (highlightedBillId === id) setHighlightedBillId(null);
    }
  };
  const handleRecordPayment = (bill: Bill, date: string) => {
    const confirmed = confirm(`Record ${bill.name} as paid on ${fmtDate(date)}? This will create one transaction${bill.account ? ` and update ${bill.account}` : ''}.`);
    if (!confirmed) return;
    if (!recordBillPayment(bill.id, date)) alert('Unable to record this payment.');
    setMenuId(null);
  };
  const handleMarkPaidOnly = (bill: Bill, date: string) => {
    markBillPaid(bill.id, date);
    setMenuId(null);
  };
  const handleCalendarDay = (day: number) => {
    setSelectedDay(current => current === day ? null : day);
    setPage(1);
  };
  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setAccountFilter('all');
    setAutopayFilter('all');
    setSelectedDay(null);
    setPage(1);
  };
  const handleDialogSaved = ({ mode, bill }: BillDialogSaveResult) => {
    setShowDialog(false);
    setEditBill(null);
    setHighlightedBillId(bill.id);
    if (mode === 'created') {
      clearFilters();
      const savedBills = useLedgerlyStore.getState().bills;
      const monthOccurrences = getAllBillOccurrencesForMonth(savedBills, currentMonth);
      const firstOccurrenceIndex = monthOccurrences.findIndex(occurrence => occurrence.bill.id === bill.id);
      const hasCurrentMonthOccurrence = getBillOccurrencesForMonth(bill, currentMonth).length > 0;
      if (hasCurrentMonthOccurrence && firstOccurrenceIndex >= 0) {
        setPage(Math.floor(firstOccurrenceIndex / BILLS_PER_PAGE) + 1);
        setSaveMessage(`${bill.name} was saved and is visible in ${fmtYMFull(currentMonth)}.`);
      } else {
        setScheduleSearch('');
        setSchedulePage(1);
        setScheduleDrawerOpen(true);
        setSaveMessage(`${bill.name} was saved, but it has no occurrence in ${fmtYMFull(currentMonth)}. It is highlighted in saved schedules.`);
      }
    } else {
      setSaveMessage(`${bill.name} was updated successfully.`);
    }
  };
  const handleToggleSchedule = (bill: Bill) => {
    try {
      const updated = updateBill(bill.id, { active: bill.active === false });
      if (!updated) throw new Error('This saved schedule no longer exists.');
      setHighlightedBillId(updated.id);
      setSaveMessage(`${updated.name} is now ${updated.active === false ? 'paused' : 'active'}.`);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to update this schedule.');
    }
  };

  const reflection = REFLECTIONS[now.getDate() % REFLECTIONS.length];
  const todayIso = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
  const selectedDate = selectedDay === null
    ? ''
    : `${currentMonth}-${String(selectedDay).padStart(2, '0')}`;
  const filterPillStyle = { border: '1px solid var(--border)', borderRadius: 999, padding: '8px 12px', background: 'var(--surface)', color: 'var(--text2)', fontWeight: 600, fontSize: '.78rem' } as const;

  return (
    <div className="ldg-bills-page" onClick={() => setMenuId(null)}>
      <PageIntroBanner view="bills" />
      <div className="ldg-bills-header">
        <div>
          <div className="ldg-bills-title">
            Bills <img src={heart01} alt="" />
          </div>
          <div className="ldg-bills-subtitle">Recurring obligations, autopay, and due dates in one calm place.</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="ldg-month-chip">📅 {fmtYMFull(currentMonth)}</div>
          <div className="ldg-privacy-badge">🔒 Local only · Nothing sent to any server</div>
        </div>
      </div>

      {saveMessage && (
        <div className="ldg-bills-save-message" role="status" aria-live="polite">
          ✓ {saveMessage}
        </div>
      )}

      <div className="ldg-bills-stat-row">
        <div className="ldg-stat-card ldg-stat-cream">
          <img src={flower01} alt="" className="ldg-stat-deco" />
          <div className="ldg-stat-inner">
            <div className="ldg-stat-icon ldg-stat-icon-leaf">♡</div>
            <div className="ldg-stat-label">Due this month</div>
            <div className="ldg-stat-amount">{fmt(totalDue)}</div>
            <div className="ldg-stat-sub">{occurrences.length} occurrence{occurrences.length !== 1 ? 's' : ''}</div>
          </div>
        </div>
        <div className="ldg-stat-card ldg-stat-blush">
          <img src={flower03} alt="" className="ldg-stat-deco" />
          <div className="ldg-stat-inner">
            <div className="ldg-stat-icon ldg-stat-icon-cal">↻</div>
            <div className="ldg-stat-label">On autopay</div>
            <div className="ldg-stat-amount">{fmt(autopayTotal)}</div>
            <div className="ldg-stat-sub">{occurrences.filter(occ => occ.bill.autopay).length} scheduled automatically</div>
          </div>
        </div>
        <div className="ldg-stat-card ldg-stat-white">
          <img src={sprig03} alt="" className="ldg-stat-deco" />
          <div className="ldg-stat-inner">
            <div className="ldg-stat-icon ldg-stat-icon-shield">≈</div>
            <div className="ldg-stat-label">Average monthly</div>
            <div className="ldg-stat-amount">{fmt(averageMonthly)}</div>
            <div className="ldg-stat-sub">normalized across cadences</div>
          </div>
        </div>
        <div className="ldg-stat-card ldg-bills-stat-salmon">
          <img src={flower05} alt="" className="ldg-stat-deco" />
          <div className="ldg-stat-inner">
            <div className="ldg-stat-icon ldg-stat-icon-cal" style={{ background: 'rgba(196,96,96,.12)', color: '#c04040' }}>!</div>
            <div className="ldg-stat-label">{nextDue ? 'Next due' : 'Overdue'}</div>
            <div className="ldg-stat-amount">{nextDue ? fmt(nextDue.bill.amount) : fmt(occurrences.filter(occ => occ.status === 'overdue').reduce((s, occ) => s + occ.bill.amount, 0))}</div>
            <div className="ldg-stat-sub">{nextDue ? `${nextDue.bill.name} · ${dueLabel(nextDue.daysUntil)}` : `${overdueCount} overdue`}</div>
          </div>
        </div>
      </div>

      <div className="ldg-bills-body">
        <div className="ldg-card ldg-bills-table-wrap">
          <div className="ldg-bills-table-header">
            <div>
              <div className="ldg-card-title">🌿 Recurring Bills</div>
              <div style={{ fontSize: '.76rem', color: 'var(--text3)', marginTop: 2 }}>Edit schedules freely. Transactions are created only when you record a payment.</div>
            </div>
            <div className="ldg-bills-header-actions">
              <button
                type="button"
                className="ldg-bills-manage-btn"
                onClick={event => { event.stopPropagation(); setScheduleDrawerOpen(true); }}
              >
                Manage saved schedules ({bills.length})
              </button>
              <button className="ldg-bills-add-btn" onClick={() => { setEditBill(null); setShowDialog(true); }}>
                + Add bill
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '0 16px 14px' }} onClick={e => e.stopPropagation()}>
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search bill, category, account, notes"
              style={{ ...filterPillStyle, minWidth: 220, flex: '1 1 220px' }}
            />
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} style={filterPillStyle}>
              <option value="all">All statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
            <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }} style={filterPillStyle}>
              <option value="all">All categories</option>
              {categories.filter(c => !c.archived).map(category => <option key={category.id} value={category.name}>{category.name}</option>)}
            </select>
            <select value={accountFilter} onChange={e => { setAccountFilter(e.target.value); setPage(1); }} style={filterPillStyle}>
              <option value="all">All accounts</option>
              <option value="unlinked">Unlinked</option>
              {accounts.map(account => <option key={account.id} value={account.name}>{account.name}</option>)}
            </select>
            <select value={autopayFilter} onChange={e => { setAutopayFilter(e.target.value); setPage(1); }} style={filterPillStyle}>
              <option value="all">Autopay: all</option>
              <option value="on">Autopay on</option>
              <option value="off">Autopay off</option>
            </select>
          </div>

          {occurrences.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text2)', fontSize: '.85rem' }}>
              No bills due in this month yet, add a recurring bill to get started.
            </div>
          ) : filteredOccurrences.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text2)', fontSize: '.85rem' }}>
              {selectedDay !== null
                ? (calBills[selectedDay]?.length ?? 0) === 0
                  ? `No bills are due on ${fmtDate(selectedDate)}.`
                  : `No bills due on ${fmtDate(selectedDate)} match the other filters.`
                : 'No bills match those filters.'}
            </div>
          ) : (
            <>
              <table className="ldg-bills-table">
                <thead>
                  <tr>
                    <th className="ldg-bills-th">Bill</th>
                    <th className="ldg-bills-th">Amount</th>
                    <th className="ldg-bills-th">Cadence</th>
                    <th className="ldg-bills-th">Next due</th>
                    <th className="ldg-bills-th">Category</th>
                    <th className="ldg-bills-th">Account</th>
                    <th className="ldg-bills-th">Autopay</th>
                    <th className="ldg-bills-th">Status</th>
                    <th className="ldg-bills-th" style={{ width: 40 }} />
                  </tr>
                </thead>
                <tbody>
                {visibleOccurrences.map(occ => {
                  const b = occ.bill;
                  const rowKey = `${b.id}-${occ.dueDate}`;
                  return (
                    <tr key={rowKey} className={`ldg-bills-tr${b.id === highlightedBillId ? ' highlighted' : ''}`}>
                      <td className="ldg-bills-td">
                        <div className="ldg-bills-icon-cell">
                          <div className="ldg-bills-avatar">{b.icon}</div>
                          <div>
                            <div className="ldg-bills-name">{b.name}</div>
                            <div className="ldg-bills-sub">{b.active === false ? 'Paused' : 'Active'} · {b.notes || 'No notes'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="ldg-bills-td" style={{ fontWeight: 600 }}>{fmt(b.amount)}</td>
                      <td className="ldg-bills-td">{b.cadence}</td>
                      <td className="ldg-bills-td">
                        <div className="ldg-bills-due-main">{fmtDate(occ.dueDate)}</div>
                        <div className="ldg-bills-due-sub">{dueLabel(occ.daysUntil)}</div>
                      </td>
                      <td className="ldg-bills-td">
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '.80rem' }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: categoryColor(b.category), display: 'inline-block', flexShrink: 0 }} />
                          {b.category}
                        </span>
                      </td>
                      <td className="ldg-bills-td">{b.account || <span style={{ color: 'var(--text3)' }}>Unlinked</span>}</td>
                      <td className="ldg-bills-td">
                        <span className={`ldg-scheduled-badge${b.autopay ? ' autopay' : ''}`}>{b.autopay ? 'Autopay' : 'Manual'}</span>
                      </td>
                      <td className="ldg-bills-td">
                        <span className={`ldg-bills-badge${occ.status !== 'scheduled' ? ' ' + occ.status : ''}`}>
                          {occ.status === 'paid' ? 'Paid' : occ.status === 'overdue' ? 'Overdue' : 'Scheduled'}
                        </span>
                      </td>
                      <td className="ldg-bills-td" style={{ position: 'relative' }}>
                        <button
                          className="ldg-bills-ctx-btn"
                          onClick={e => { e.stopPropagation(); setMenuId(menuId === rowKey ? null : rowKey); }}
                        >···</button>
                        {menuId === rowKey && (
                          <div className="ldg-bills-ctx-menu" onClick={e => e.stopPropagation()}>
                            <button className="ldg-bills-ctx-item" onClick={() => handleEdit(b)}>✏️ Edit bill</button>
                            <button className="ldg-bills-ctx-item" onClick={() => handleRecordPayment(b, occ.dueDate)}>✓ Record payment</button>
                            <button className="ldg-bills-ctx-item" onClick={() => handleMarkPaidOnly(b, occ.dueDate)}>Mark paid only</button>
                            <button className="ldg-bills-ctx-item" onClick={() => { toggleAutopay(b.id); setMenuId(null); }}>{b.autopay ? 'Turn off autopay' : 'Turn on autopay'}</button>
                            <button className="ldg-bills-ctx-item ldg-bills-ctx-delete" onClick={() => handleDelete(b.id)}>🗑️ Delete</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
              <div className="ldg-bills-footer">
                <span className="ldg-bills-page-count">
                  Showing {pageStart}-{pageEnd} of {filteredOccurrences.length} occurrence{filteredOccurrences.length === 1 ? '' : 's'}
                </span>
                {totalPages > 1 && (
                  <div className="ldg-bills-pagination" aria-label="Bill occurrence pages">
                    <button className="ldg-bills-page-btn" type="button" disabled={safePage === 1} onClick={() => setPage(safePage - 1)} aria-label="Previous page">‹</button>
                    {Array.from({ length: totalPages }, (_, index) => index + 1).map(pageNumber => (
                      <button
                        key={pageNumber}
                        className={`ldg-bills-page-btn${pageNumber === safePage ? ' active' : ''}`}
                        type="button"
                        onClick={() => setPage(pageNumber)}
                        aria-label={`Page ${pageNumber}`}
                        aria-current={pageNumber === safePage ? 'page' : undefined}
                      >
                        {pageNumber}
                      </button>
                    ))}
                    <button className="ldg-bills-page-btn" type="button" disabled={safePage === totalPages} onClick={() => setPage(safePage + 1)} aria-label="Next page">›</button>
                  </div>
                )}
              </div>
            </>
          )}
          <img src={sprig02} alt="" className="ldg-bills-table-deco" />
        </div>

        <div className="ldg-bills-right-col">
          <div className="ldg-card">
            <div className="ldg-bills-cal-header">
              <div className="ldg-card-title">📅 Monthly Bill Calendar</div>
              {selectedDay !== null && (
                <button
                  type="button"
                  className="ldg-bills-cal-clear"
                  onClick={event => { event.stopPropagation(); setSelectedDay(null); setPage(1); }}
                >
                  Clear date
                </button>
              )}
            </div>
            <div style={{ padding: '0 12px 4px', fontSize: '.80rem', fontWeight: 600, color: 'var(--text2)' }}>
              {fmtYMFull(currentMonth)}
            </div>
            <div className="ldg-bills-cal-grid">
              {['SUN','MON','TUE','WED','THU','FRI','SAT'].map(d => (
                <div key={d} className="ldg-bills-cal-day-hdr">{d}</div>
              ))}
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayBills = calBills[day] ?? [];
                return (
                  <button
                    key={day}
                    type="button"
                    className={`ldg-bills-cal-day${day === selectedDay ? ' selected' : ''}`}
                    onClick={event => { event.stopPropagation(); handleCalendarDay(day); }}
                    title={dayBills.length ? dayBills.map(occ => occ.bill.name).join(', ') : 'No bills due'}
                    aria-label={`${fmtDate(`${currentMonth}-${String(day).padStart(2, '0')}`)}${dayBills.length ? `: ${dayBills.map(occ => occ.bill.name).join(', ')}` : ': no bills due'}`}
                    aria-pressed={day === selectedDay}
                  >
                    <div className={`ldg-bills-cal-num${day === todayD ? ' today' : ''}${dayBills.length > 0 ? ' has-bill' : ''}${day === selectedDay ? ' selected' : ''}`}>
                      {day}
                    </div>
                    {dayBills.length > 0 && (
                      <div className="ldg-bills-dots">
                        {dayBills.slice(0, 3).map((occ, idx) => (
                          <div key={idx} className="ldg-bills-dot" style={{ background: categoryColor(occ.bill.category) }} />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {legendCats.length > 0 && (
              <div className="ldg-bills-cal-legend">
                {legendCats.map(cat => (
                  <div key={cat} className="ldg-bills-legend-item">
                    <div className="ldg-bills-dot" style={{ background: categoryColor(cat), width: 6, height: 6, borderRadius: '50%', flexShrink: 0, display: 'inline-block' }} />
                    {cat}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="ldg-card">
            <div style={{ padding: '14px 16px 8px' }}>
              <div className="ldg-card-title">📊 Bill Categories</div>
            </div>
            <div className="ldg-bills-cats-list">
              {Object.entries(catMap).map(([cat, { amount, icon }]) => {
                const pct = totalDue > 0 ? Math.round((amount / totalDue) * 100) : 0;
                return (
                  <div key={cat} className="ldg-bills-cat-row">
                    <div className="ldg-bills-cat-icon">{icon}</div>
                    <div className="ldg-bills-cat-info">
                      <div className="ldg-bills-cat-name-row">
                        <span className="ldg-bills-cat-name">{cat}</span>
                        <span className="ldg-bills-cat-pct">{fmt(amount)}&nbsp;&nbsp;{pct}%</span>
                      </div>
                      <div className="ldg-bills-bar-track">
                        <div className="ldg-bills-bar-fill" style={{ width: `${pct}%`, background: categoryColor(cat) }} />
                      </div>
                    </div>
                  </div>
                );
              })}
              {Object.keys(catMap).length === 0 && (
                <div style={{ color: 'var(--text3)', fontSize: '.80rem', padding: '4px 0' }}>No bills yet</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="ldg-reflection" style={{ marginTop: 20 }}>
        <img src={sprig02} alt="" className="ldg-reflection-deco-l" />
        <div className="ldg-reflection-inner">
          <div className="ldg-reflection-label">♡ Small steps, big progress.</div>
          <div className="ldg-reflection-quote">{reflection}</div>
        </div>
        <img src={heart01} alt="" className="ldg-reflection-heart" />
      </div>

      {scheduleDrawerOpen && (
        <div className="ldg-bills-drawer-backdrop" onClick={() => setScheduleDrawerOpen(false)}>
          <aside className="ldg-bills-drawer" role="dialog" aria-modal="true" aria-labelledby="saved-schedules-title" onClick={event => event.stopPropagation()}>
            <div className="ldg-bills-drawer-header">
              <div>
                <span className="ldg-budget-section-kicker">Recurring bill library</span>
                <h2 id="saved-schedules-title">Manage saved schedules</h2>
                <p>Every saved bill stays available here, even when it has no occurrence this month.</p>
              </div>
              <button type="button" onClick={() => setScheduleDrawerOpen(false)} aria-label="Close saved schedules">×</button>
            </div>

            {saveMessage && (
              <div className="ldg-bills-drawer-message" role="status" aria-live="polite">✓ {saveMessage}</div>
            )}

            <input
              className="ldg-bills-drawer-search"
              value={scheduleSearch}
              onChange={event => { setScheduleSearch(event.target.value); setSchedulePage(1); }}
              placeholder="Search saved schedules"
              aria-label="Search saved schedules"
            />

            <div className="ldg-bills-schedule-list">
              {visibleSchedules.map(bill => {
                const state = scheduleState(bill, todayIso);
                const lacksAnchor = bill.cadence !== 'Monthly' && !bill.startDate;
                return (
                  <article key={bill.id} className={`ldg-bills-schedule-card${bill.id === highlightedBillId ? ' highlighted' : ''}`}>
                    <div className="ldg-bills-schedule-main">
                      <div className="ldg-bills-avatar">{bill.icon || '💸'}</div>
                      <div className="ldg-bills-schedule-copy">
                        <div className="ldg-bills-schedule-title-row">
                          <strong>{bill.name}</strong>
                          <span className={`ldg-bills-schedule-state ${state.toLowerCase()}`}>{state}</span>
                        </div>
                        <div className="ldg-bills-schedule-summary">{scheduleSummary(bill)} · {fmt(bill.amount)} per occurrence</div>
                        <div className="ldg-bills-schedule-meta">
                          <span>{bill.category}</span>
                          <span>{bill.account || 'Unlinked'}</span>
                          <span>{bill.autopay ? 'Autopay label' : 'Manual'}</span>
                        </div>
                        <div className="ldg-bills-schedule-dates">
                          {bill.startDate ? `Starts ${fmtDate(bill.startDate)}` : 'No start boundary'}
                          {' · '}
                          {bill.endDate ? `Ends ${fmtDate(bill.endDate)}` : 'No end date'}
                        </div>
                        {lacksAnchor && <div className="ldg-bills-schedule-warning">Anchor not set. Choose a first due date the next time you edit this legacy schedule.</div>}
                      </div>
                    </div>
                    <div className="ldg-bills-schedule-actions">
                      <button type="button" onClick={() => handleEdit(bill)}>Edit</button>
                      <button type="button" onClick={() => handleToggleSchedule(bill)}>{bill.active === false ? 'Activate' : 'Pause'}</button>
                      <button type="button" className="danger" onClick={() => handleDelete(bill.id)}>Delete</button>
                    </div>
                  </article>
                );
              })}
              {filteredSchedules.length === 0 && (
                <div className="ldg-bills-drawer-empty">{bills.length === 0 ? 'No saved schedules yet.' : 'No saved schedules match that search.'}</div>
              )}
            </div>

            {filteredSchedules.length > 0 && (
              <div className="ldg-bills-drawer-footer">
                <span>
                  Showing {(safeSchedulePage - 1) * SCHEDULES_PER_PAGE + 1}-{Math.min(safeSchedulePage * SCHEDULES_PER_PAGE, filteredSchedules.length)} of {filteredSchedules.length}
                </span>
                {scheduleTotalPages > 1 && (
                  <div className="ldg-bills-pagination" aria-label="Saved schedule pages">
                    <button className="ldg-bills-page-btn" type="button" disabled={safeSchedulePage === 1} onClick={() => setSchedulePage(safeSchedulePage - 1)} aria-label="Previous schedules page">‹</button>
                    {Array.from({ length: scheduleTotalPages }, (_, index) => index + 1).map(pageNumber => (
                      <button key={pageNumber} className={`ldg-bills-page-btn${pageNumber === safeSchedulePage ? ' active' : ''}`} type="button" onClick={() => setSchedulePage(pageNumber)} aria-current={pageNumber === safeSchedulePage ? 'page' : undefined}>{pageNumber}</button>
                    ))}
                    <button className="ldg-bills-page-btn" type="button" disabled={safeSchedulePage === scheduleTotalPages} onClick={() => setSchedulePage(safeSchedulePage + 1)} aria-label="Next schedules page">›</button>
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>
      )}

      {showDialog && (
        <BillEditorDialog
          bill={editBill}
          onClose={() => { setShowDialog(false); setEditBill(null); }}
          onSaved={handleDialogSaved}
        />
      )}
    </div>
  );
}
