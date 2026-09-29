import { useRef, useState, type FormEvent } from 'react';
import { useLedgerlyStore } from '../store/useLedgerlyStore';
import { fmt } from '../utils/formatters';
import type { Debt, DebtPayment } from '../types';

interface Props {
  debt: Debt;
  onClose: () => void;
  onSaved: (payment: DebtPayment) => void;
}

export function DebtPaymentDialog({ debt, onClose, onSaved }: Props) {
  const accounts = useLedgerlyStore(s => s.accounts);
  const recordDebtPayment = useLedgerlyStore(s => s.recordDebtPayment);
  const today = new Date().toISOString().slice(0, 10);
  const paymentAccounts = accounts.filter(account => ['Checking', 'Savings', 'Cash'].includes(account.type));
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(today);
  const [accountId, setAccountId] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return;
    const paymentAmount = Number(amount);
    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) return setError('Enter a positive payment amount.');
    if (paymentAmount > debt.balance) return setError(`Payment cannot be greater than the ${fmt(debt.balance)} remaining balance.`);
    if (!date || Number.isNaN(Date.parse(`${date}T00:00:00`))) return setError('Choose a valid payment date.');
    if (date > today) return setError('Payment date cannot be in the future.');
    submittingRef.current = true;
    setSubmitting(true);
    try {
      const selectedAccount = paymentAccounts.find(item => item.id === Number(accountId));
      const payment = recordDebtPayment({ debtId: debt.id, amount: paymentAmount, date, account: selectedAccount?.name, accountId: selectedAccount?.id, notes: notes.trim() });
      onSaved(payment);
      onClose();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Payment could not be recorded. Please try again.');
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <div className="ldg-debt-dialog-backdrop" onClick={event => { if (event.target === event.currentTarget && !submitting) onClose(); }}>
      <form className="ldg-debt-dialog ldg-debt-payment-dialog" role="dialog" aria-modal="true" aria-labelledby="debt-payment-title" onSubmit={save} noValidate>
        <div className="ldg-debt-dialog-header">
          <div><span id="debt-payment-title">Record payment</span><small>{debt.name} · {fmt(debt.balance)} remaining</small></div>
          <button type="button" onClick={onClose} disabled={submitting} aria-label="Close payment dialog">×</button>
        </div>
        <div className="ldg-debt-dialog-body">
          <div className="ldg-debt-payment-explainer">This records a real payment, reduces this debt’s current balance, and adds a Debt transaction. It is separate from the payoff forecast.</div>
          <label>Payment amount <b>*</b><input value={amount} onChange={event => { setAmount(event.target.value); setError(''); }} type="number" min="0.01" max={debt.balance} step="0.01" inputMode="decimal" placeholder="0.00" autoFocus /><small>Maximum payment: {fmt(debt.balance)}</small></label>
          <label>Payment date <b>*</b><input value={date} onChange={event => { setDate(event.target.value); setError(''); }} type="date" max={today} /></label>
          <label>Pay from account<select value={accountId} onChange={event => { setAccountId(event.target.value); setError(''); }}><option value="">Unlinked — do not change an account balance</option>{paymentAccounts.map(item => <option key={item.id} value={item.id}>{item.name} · {fmt(item.balance)}</option>)}</select><small>Choosing an account subtracts this payment from its balance.</small></label>
          <label>Notes<textarea value={notes} onChange={event => setNotes(event.target.value)} rows={3} placeholder="Confirmation number or payment note" /></label>
        </div>
        <div className="ldg-debt-dialog-footer">
          {error && <div className="ldg-debt-dialog-error" role="alert">{error}</div>}
          <div>
            <button type="button" className="ldg-budget-secondary-btn" onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" className="ldg-budget-primary-btn" disabled={submitting}>{submitting ? 'Recording…' : 'Record payment'}</button>
          </div>
        </div>
      </form>
    </div>
  );
}
