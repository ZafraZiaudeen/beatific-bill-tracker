import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { useLedgerlyStore } from '../store/useLedgerlyStore';
import type { Debt } from '../types';

const DEBT_TYPES = ['Credit Card', 'Personal Loan', 'Student Loan', 'Auto Loan', 'Mortgage', 'Medical', 'Other'];
const PRESET_ICONS: Record<string, string> = {
  'Credit Card': '💳', 'Personal Loan': '🏦', 'Student Loan': '🎓',
  'Auto Loan': '🚗', Mortgage: '🏠', Medical: '🏥', Other: '💰',
};
const PRESET_COLORS = [
  { color: '#c48a8a', bg: 'rgba(196,138,138,.15)' },
  { color: '#c4a35a', bg: 'rgba(196,163,90,.15)' },
  { color: '#9e8abe', bg: 'rgba(158,138,190,.15)' },
  { color: '#6b9ec4', bg: 'rgba(107,158,196,.15)' },
  { color: '#7a9e7e', bg: 'rgba(122,158,126,.15)' },
];

interface Props {
  debt: Debt | null;
  onClose: () => void;
  onSaved?: (debt: Debt) => void;
}

interface Draft {
  name: string;
  institution: string;
  accountNumber: string;
  type: string;
  balance: string;
  apr: string;
  minimumPayment: string;
  extraPayment: string;
  icon: string;
  openedDate: string;
  targetPayoffDate: string;
  notes: string;
}

export function DebtEditorDialog({ debt, onClose, onSaved }: Props) {
  const addDebt = useLedgerlyStore(s => s.addDebt);
  const updateDebt = useLedgerlyStore(s => s.updateDebt);
  const [draft, setDraft] = useState<Draft>({
    name: debt?.name ?? '', institution: debt?.institution ?? '', accountNumber: debt?.accountNumber ?? '',
    type: debt?.type ?? 'Credit Card', balance: debt ? String(debt.balance) : '', apr: debt ? String(debt.apr) : '',
    minimumPayment: debt ? String(debt.minimumPayment) : '', extraPayment: debt ? String(debt.extraPayment) : '',
    icon: debt?.icon ?? '', openedDate: debt?.openedDate ?? '', targetPayoffDate: debt?.targetPayoffDate ?? '', notes: debt?.notes ?? '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const update = (field: keyof Draft, value: string) => {
    setDraft(current => ({ ...current, [field]: value }));
    setError('');
  };
  const bind = (name: keyof Draft) => ({
    value: draft[name],
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => update(name, event.target.value),
  });

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return;
    const name = draft.name.trim();
    const balance = Number(draft.balance);
    const apr = draft.apr === '' ? 0 : Number(draft.apr);
    const minimumPayment = draft.minimumPayment === '' ? 0 : Number(draft.minimumPayment);
    const extraPayment = draft.extraPayment === '' ? 0 : Number(draft.extraPayment);
    if (!name) return setError('Enter a debt name.');
    if (!Number.isFinite(balance) || balance < 0 || (!debt && balance === 0)) return setError(debt ? 'Current balance must be zero or greater.' : 'Starting balance must be greater than zero.');
    if (!Number.isFinite(apr) || apr < 0) return setError('APR must be zero or greater.');
    if (!Number.isFinite(minimumPayment) || minimumPayment < 0) return setError('Minimum payment must be zero or greater.');
    if (!Number.isFinite(extraPayment) || extraPayment < 0) return setError('Planned extra payment must be zero or greater.');
    if (draft.openedDate && Number.isNaN(Date.parse(`${draft.openedDate}T00:00:00`))) return setError('Enter a valid opened date.');
    if (draft.targetPayoffDate && !/^\d{4}-\d{2}$/.test(draft.targetPayoffDate)) return setError('Enter a valid target payoff month.');
    if (draft.openedDate && draft.targetPayoffDate && draft.targetPayoffDate < draft.openedDate.slice(0, 7)) return setError('Target payoff month cannot be before the opened date.');

    const preset = debt ? { color: debt.color, bg: debt.bg } : PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)];
    submittingRef.current = true;
    setSubmitting(true);
    try {
      const saved = debt ? updateDebt(debt.id, {
        name, institution: draft.institution.trim(), accountNumber: draft.accountNumber.trim(), type: draft.type,
        balance, apr, minimumPayment, extraPayment, icon: draft.icon.trim() || PRESET_ICONS[draft.type] || '💰',
        color: preset.color, bg: preset.bg, openedDate: draft.openedDate, targetPayoffDate: draft.targetPayoffDate, notes: draft.notes.trim(),
      }) : addDebt({
        name, institution: draft.institution.trim(), accountNumber: draft.accountNumber.trim(), type: draft.type,
        balance, apr, minimumPayment, extraPayment, icon: draft.icon.trim() || PRESET_ICONS[draft.type] || '💰',
        color: preset.color, bg: preset.bg, openedDate: draft.openedDate, targetPayoffDate: draft.targetPayoffDate, notes: draft.notes.trim(),
      });
      if (!saved) throw new Error('This debt no longer exists. Refresh the list and try again.');
      onSaved?.(saved);
      onClose();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Debt could not be saved. Please try again.');
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <div className="ldg-debt-dialog-backdrop" onClick={event => { if (event.target === event.currentTarget && !submitting) onClose(); }}>
      <form className="ldg-debt-dialog" role="dialog" aria-modal="true" aria-labelledby="debt-dialog-title" onSubmit={save} noValidate>
        <div className="ldg-debt-dialog-header">
          <span id="debt-dialog-title">{debt ? 'Edit debt' : 'Add debt'}</span>
          <button type="button" onClick={onClose} disabled={submitting} aria-label="Close debt dialog">×</button>
        </div>
        <div className="ldg-debt-dialog-body">
          <label>Debt name <b>*</b><input {...bind('name')} type="text" placeholder="e.g. Visa card" autoFocus /><small>The lender or account name shown throughout the payoff planner.</small></label>
          <div className="ldg-debt-dialog-grid">
            <label>Institution<input {...bind('institution')} type="text" placeholder="e.g. Chase" /></label>
            <label>Account # (last 4)<input {...bind('accountNumber')} type="text" placeholder="4291" maxLength={4} inputMode="numeric" /></label>
            <label>Debt type<select {...bind('type')}>{DEBT_TYPES.map(type => <option key={type}>{type}</option>)}</select></label>
            <label>Icon<input {...bind('icon')} type="text" placeholder={PRESET_ICONS[draft.type]} maxLength={8} /></label>
          </div>
          <div className="ldg-debt-dialog-grid">
            <label>Current balance <b>*</b><input {...bind('balance')} type="number" min="0" step="0.01" inputMode="decimal" placeholder="0.00" /><small>What you owe now. Use Record payment for real payments; edit this only for corrections.</small></label>
            <label>APR (%)<input {...bind('apr')} type="number" min="0" step="0.01" inputMode="decimal" placeholder="0.00" /><small>The annual interest rate used in payoff projections.</small></label>
            <label>Minimum payment / month<input {...bind('minimumPayment')} type="number" min="0" step="0.01" inputMode="decimal" placeholder="0.00" /></label>
            <label>Planned extra / month<input {...bind('extraPayment')} type="number" min="0" step="0.01" inputMode="decimal" placeholder="0.00" /><small>This planned amount is included in projections; it does not record a payment.</small></label>
            <label>Opened date<input {...bind('openedDate')} type="date" /></label>
            <label>Target payoff month<input {...bind('targetPayoffDate')} type="month" /></label>
          </div>
          <label>Notes<textarea {...bind('notes')} rows={3} placeholder="Promo APR, payoff reminder, or lender note" /></label>
        </div>
        <div className="ldg-debt-dialog-footer">
          {error && <div className="ldg-debt-dialog-error" role="alert">{error}</div>}
          <div>
            <button type="button" className="ldg-budget-secondary-btn" onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" className="ldg-budget-primary-btn" disabled={submitting}>{submitting ? 'Saving…' : debt ? 'Save changes' : 'Add debt'}</button>
          </div>
        </div>
      </form>
    </div>
  );
}
