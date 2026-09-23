import { useMemo, useState } from 'react';
import { PageIntroBanner } from '../components/PageIntroBanner';
import { useLedgerlyStore } from '../store/useLedgerlyStore';
import { fmt, fmtYMFull } from '../utils/formatters';
import { getAllBillOccurrencesForMonth, monthlyBillEquivalent } from '../utils/bills';
import { BillDialog } from '../dialogs/BillDialog';
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

export function BillsPage() {
  const bills = useLedgerlyStore(s => s.bills);
  const categories = useLedgerlyStore(s => s.categories);
  const accounts = useLedgerlyStore(s => s.accounts);
  const deleteBill = useLedgerlyStore(s => s.deleteBill);
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
    return matchesTerm && matchesStatus && matchesCategory && matchesAccount && matchesAutopay;
  });

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
  const handleDelete = (id: number) => { if (confirm('Delete this recurring bill?')) { deleteBill(id); setMenuId(null); } };
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

  const reflection = REFLECTIONS[now.getDate() % REFLECTIONS.length];
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
            <button className="ldg-bills-add-btn" onClick={() => { setEditBill(null); setShowDialog(true); }}>
              + Add bill
            </button>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '0 16px 14px' }} onClick={e => e.stopPropagation()}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search bill, category, account, notes"
              style={{ ...filterPillStyle, minWidth: 220, flex: '1 1 220px' }}
            />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={filterPillStyle}>
              <option value="all">All statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={filterPillStyle}>
              <option value="all">All categories</option>
              {categories.filter(c => !c.archived).map(category => <option key={category.id} value={category.name}>{category.name}</option>)}
            </select>
            <select value={accountFilter} onChange={e => setAccountFilter(e.target.value)} style={filterPillStyle}>
              <option value="all">All accounts</option>
              <option value="unlinked">Unlinked</option>
              {accounts.map(account => <option key={account.id} value={account.name}>{account.name}</option>)}
            </select>
            <select value={autopayFilter} onChange={e => setAutopayFilter(e.target.value)} style={filterPillStyle}>
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
              No bills match those filters.
            </div>
          ) : (
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
                {filteredOccurrences.map(occ => {
                  const b = occ.bill;
                  const rowKey = `${b.id}-${occ.dueDate}`;
                  return (
                    <tr key={rowKey} className="ldg-bills-tr">
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
          )}
          <img src={sprig02} alt="" className="ldg-bills-table-deco" />
        </div>

        <div className="ldg-bills-right-col">
          <div className="ldg-card">
            <div className="ldg-bills-cal-header">
              <div className="ldg-card-title">📅 Monthly Bill Calendar</div>
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
                    className="ldg-bills-cal-day"
                    onClick={e => { e.stopPropagation(); if (dayBills.length) setSearch(dayBills[0].bill.name); }}
                    title={dayBills.map(occ => occ.bill.name).join(', ')}
                    style={{ border: 0, background: 'transparent', cursor: dayBills.length ? 'pointer' : 'default' }}
                  >
                    <div className={`ldg-bills-cal-num${day === todayD ? ' today' : ''}${dayBills.length > 0 && day !== todayD ? ' has-bill' : ''}`}>
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

      {showDialog && (
        <BillDialog bill={editBill} onClose={() => { setShowDialog(false); setEditBill(null); }} />
      )}
    </div>
  );
}
