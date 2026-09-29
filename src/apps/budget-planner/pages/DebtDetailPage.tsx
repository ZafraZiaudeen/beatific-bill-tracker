import { useMemo, useState } from 'react';
import { DebtEditorDialog } from '../dialogs/DebtEditorDialog';
import { DebtPaymentDialog } from '../dialogs/DebtPaymentDialog';
import { useLedgerlyStore } from '../store/useLedgerlyStore';
import type { DebtPayment } from '../types';
import { fmt, fmtYM } from '../utils/formatters';
import { simulateDebtPayoff } from '../utils/debtSimulator';
import heart01 from '../../../assets/budget-assets/hearts/heart-01.png';

const PAYMENTS_PER_PAGE = 10;

export function DebtDetailPage() {
  const debts = useLedgerlyStore(s => s.debts);
  const debtPayments = useLedgerlyStore(s => s.debtPayments);
  const debtPlan = useLedgerlyStore(s => s.debtPlan);
  const currentMonth = useLedgerlyStore(s => s.currentMonth);
  const selectedDebtId = useLedgerlyStore(s => s.selectedDebtId);
  const closeDebtDetail = useLedgerlyStore(s => s.closeDebtDetail);
  const setView = useLedgerlyStore(s => s.setView);
  const deleteDebt = useLedgerlyStore(s => s.deleteDebt);
  const removeDebtPayment = useLedgerlyStore(s => s.removeDebtPayment);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [page, setPage] = useState(1);

  const debt = debts.find(item => item.id === selectedDebtId) ?? null;
  const startMonth = debtPlan.startMonth || currentMonth;
  const projection = useMemo(
    () => simulateDebtPayoff(debts, debtPlan.strategy, debtPlan.extraPayment, startMonth),
    [debtPlan.extraPayment, debtPlan.strategy, debts, startMonth],
  );
  const payoff = debt ? projection.payoffOrder.find(item => item.id === debt.id) : null;
  const payments = useMemo(
    () => debt
      ? debtPayments.filter(payment => payment.debtId === debt.id).sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
      : [],
    [debt, debtPayments],
  );
  const totalPages = Math.max(1, Math.ceil(payments.length / PAYMENTS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pagePayments = payments.slice((safePage - 1) * PAYMENTS_PER_PAGE, safePage * PAYMENTS_PER_PAGE);
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);

  if (!debt) {
    return (
      <div className="ldg-debt-detail-backdrop" onClick={event => { if (event.target === event.currentTarget) closeDebtDetail(); }}>
        <section className="ldg-debt-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="debt-detail-missing-title">
          <div className="ldg-debt-detail-dialog-header"><h2 id="debt-detail-missing-title">Debt unavailable</h2><button onClick={closeDebtDetail} aria-label="Close debt details">×</button></div>
          <div className="ldg-long-empty">This debt is no longer available.</div>
        </section>
      </div>
    );
  }

  const handlePaymentSaved = (payment: DebtPayment) => {
    setPage(1);
    setStatusMessage(`${fmt(payment.amount)} payment recorded. Remaining balance: ${fmt(Math.max(0, debt.balance - payment.amount))}.`);
  };

  const handleRemovePayment = (payment: DebtPayment) => {
    if (!confirm(`Remove the ${fmt(payment.amount)} payment from ${payment.date}? The debt and linked account balances will be restored.`)) return;
    try {
      if (!removeDebtPayment(payment.id)) throw new Error('This payment is no longer available.');
      setStatusMessage(`${fmt(payment.amount)} payment removed and balances restored.`);
    } catch (reason) {
      setStatusMessage(reason instanceof Error ? reason.message : 'Payment could not be removed.');
    }
  };

  const handleDelete = () => {
    const detail = payments.length
      ? ` Its ${payments.length} debt payment record${payments.length === 1 ? '' : 's'} will be removed; generated transactions will remain in the ledger.`
      : '';
    if (!confirm(`Delete "${debt.name}"?${detail}`)) return;
    deleteDebt(debt.id);
    closeDebtDetail();
  };

  return (
    <div className="ldg-debt-detail-backdrop" onClick={event => { if (event.target === event.currentTarget) closeDebtDetail(); }}>
      <section className="ldg-debt-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="debt-detail-title" onClick={event => event.stopPropagation()}>
      <div className="ldg-debt-detail-dialog-header">
        <div>
          <h2 id="debt-detail-title">{debt.name} <img src={heart01} alt="" /></h2>
          <p>{debt.institution || 'Manual debt'}{debt.accountNumber ? ` · ••••${debt.accountNumber}` : ''}</p>
        </div>
        <div className="ldg-debt-detail-dialog-actions">
          <button className="ldg-budget-secondary-btn" onClick={() => setShowEditDialog(true)}>Edit debt</button>
          <button className="ldg-budget-primary-btn" disabled={debt.balance <= 0} onClick={() => setShowPaymentDialog(true)}>{debt.balance <= 0 ? 'Paid off' : 'Add payment'}</button>
          <button className="ldg-debt-detail-close" onClick={closeDebtDetail} aria-label="Close debt details">×</button>
        </div>
      </div>

      <div className="ldg-debt-detail-dialog-body">

      {statusMessage && <div className="ldg-bills-save-message" role="status" aria-live="polite">✓ {statusMessage}</div>}

      <section className="ldg-card ldg-debt-detail-summary">
        <div className="ldg-debt-focus-summary">
          <div className="ldg-long-icon" style={{ background: debt.bg, color: debt.color }}>{debt.icon}</div>
          <div>
            <span className={`ldg-debt-state${debt.balance <= 0 ? ' is-paid' : ''}`}>{debt.balance <= 0 ? 'Paid off' : 'In progress'}</span>
            <h2>{fmt(debt.balance)} remaining</h2>
            <p>{debt.institution || 'Manual debt'}{debt.accountNumber ? ` · ••••${debt.accountNumber}` : ''}{totalPaid > 0 ? ` · ${fmt(totalPaid)} paid since tracking` : ''}</p>
          </div>
          <button className="ldg-debt-planner-link" onClick={() => { closeDebtDetail(); setView('debt-planner'); }}>View payoff planner →</button>
        </div>
        <div className="ldg-debt-focus-metrics">
          <div><span>Current balance</span><strong>{fmt(debt.balance)}</strong></div>
          <div><span>APR</span><strong>{debt.apr.toFixed(2)}%</strong></div>
          <div><span>Monthly payment</span><strong>{fmt(debt.minimumPayment + debt.extraPayment)}</strong><small>{fmt(debt.minimumPayment)} minimum{debt.extraPayment ? ` + ${fmt(debt.extraPayment)} planned extra` : ''}</small></div>
          <div><span>Projected payoff</span><strong>{debt.balance <= 0 ? 'Paid off' : payoff?.payoffDate ? fmtYM(payoff.payoffDate) : 'Needs review'}</strong><small>Using the saved {debtPlan.strategy} plan</small></div>
        </div>
      </section>

      <section className="ldg-card ldg-goal-detail-history ldg-debt-detail-history">
        <div className="ldg-card-hdr">
          <div>
            <div className="ldg-card-title">Payment history</div>
            <div className="ldg-card-sub">{payments.length} recorded payment{payments.length === 1 ? '' : 's'}</div>
          </div>
          {debt.balance > 0 && <button className="ldg-goals-add-btn" onClick={() => setShowPaymentDialog(true)}>+ Add payment</button>}
        </div>
        {payments.length === 0 ? (
          <div className="ldg-long-empty">No payments yet. Add a payment to start reducing this balance.</div>
        ) : (
          <>
            <div className="ldg-debt-payment-list">
              {pagePayments.map(payment => (
                <div key={payment.id} className="ldg-debt-payment-row">
                  <span>{new Date(`${payment.date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <strong>−{fmt(payment.amount)}</strong>
                  <em>{payment.account || 'Unlinked'}{payment.notes ? ` · ${payment.notes}` : ''}</em>
                  <button onClick={() => handleRemovePayment(payment)}>Remove</button>
                </div>
              ))}
            </div>
            <div className="ldg-txn-footer ldg-debt-payment-footer">
              <span className="ldg-txn-count">Showing {(safePage - 1) * PAYMENTS_PER_PAGE + 1}–{Math.min(safePage * PAYMENTS_PER_PAGE, payments.length)} of {payments.length} payments</span>
              {totalPages > 1 && (
                <div className="ldg-txn-pagination">
                  <button className="ldg-txn-page-btn" disabled={safePage === 1} onClick={() => setPage(value => Math.max(1, value - 1))}>‹</button>
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map(pageNumber => <button key={pageNumber} className={`ldg-txn-page-btn${safePage === pageNumber ? ' active' : ''}`} onClick={() => setPage(pageNumber)}>{pageNumber}</button>)}
                  <button className="ldg-txn-page-btn" disabled={safePage === totalPages} onClick={() => setPage(value => Math.min(totalPages, value + 1))}>›</button>
                </div>
              )}
            </div>
          </>
        )}
      </section>

      <div className="ldg-debt-detail-danger"><button className="ldg-sec-btn ldg-sec-btn-danger" onClick={handleDelete}>Delete debt</button></div>
      </div>

      {showEditDialog && <DebtEditorDialog debt={debt} onSaved={saved => setStatusMessage(`${saved.name} was updated.`)} onClose={() => setShowEditDialog(false)} />}
      {showPaymentDialog && <DebtPaymentDialog debt={debt} onSaved={handlePaymentSaved} onClose={() => setShowPaymentDialog(false)} />}
      </section>
    </div>
  );
}
