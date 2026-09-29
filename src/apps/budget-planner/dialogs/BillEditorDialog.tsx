import { useRef, useState, type FormEvent } from 'react';
import { useLedgerlyStore } from '../store/useLedgerlyStore';
import type { Bill } from '../types';

const C = { border: '#e5e2db', text2: '#6b7280', accent: '#6f8f72' };
const CADENCES = ['Monthly', 'Weekly', 'Bi-weekly', 'Yearly'] as const;
type BillCadence = typeof CADENCES[number];

interface BillDraft {
  name: string;
  amount: string;
  cadence: BillCadence;
  dueDay: string;
  category: string;
  account: string;
  startDate: string;
  endDate: string;
  icon: string;
  notes: string;
  autopay: boolean;
  active: boolean;
}

type FieldErrors = Partial<Record<'name' | 'amount' | 'dueDay' | 'startDate' | 'endDate', string>>;

export interface BillDialogSaveResult {
  mode: 'created' | 'updated';
  bill: Bill;
}

interface Props {
  bill: Bill | null;
  onClose: () => void;
  onSaved: (result: BillDialogSaveResult) => void;
}

const labelStyle = { fontSize: 12, fontWeight: 600, color: C.text2, display: 'block', marginBottom: 5 } as const;
const helpStyle = { display: 'block', marginTop: 5, color: '#8a8f98', fontSize: 11, lineHeight: 1.35 } as const;
const inputStyle = { width: '100%', border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box', background: 'var(--surface)', color: 'var(--text)' } as const;

function initialDraft(bill: Bill | null, fallbackCategory: string): BillDraft {
  return {
    name: bill?.name ?? '',
    amount: bill ? String(bill.amount) : '',
    cadence: CADENCES.includes(bill?.cadence as BillCadence) ? bill?.cadence as BillCadence : 'Monthly',
    dueDay: bill ? String(bill.dueDay) : '',
    category: bill?.category ?? fallbackCategory,
    account: bill?.account ?? '',
    startDate: bill?.startDate ?? '',
    endDate: bill?.endDate ?? '',
    icon: bill?.icon ?? '',
    notes: bill?.notes ?? '',
    autopay: Boolean(bill?.autopay),
    active: bill?.active !== false,
  };
}

function cadenceHelp(cadence: BillCadence): string {
  if (cadence === 'Weekly') return 'Repeats every 7 days from the first due date.';
  if (cadence === 'Bi-weekly') return 'Repeats every 14 days from the first due date.';
  if (cadence === 'Yearly') return 'Repeats once each year on the first due date’s month and day.';
  return 'Repeats once each month on the selected due day.';
}

export function BillEditorDialog({ bill, onClose, onSaved }: Props) {
  const addBill = useLedgerlyStore(s => s.addBill);
  const updateBill = useLedgerlyStore(s => s.updateBill);
  const categories = useLedgerlyStore(s => s.categories);
  const accounts = useLedgerlyStore(s => s.accounts);
  const categoryNames = categories.filter(category => !category.archived).map(category => category.name);
  const categoriesForSelect = categoryNames.length ? categoryNames : ['Other'];
  const [draft, setDraft] = useState(() => initialDraft(bill, categoriesForSelect[0]));
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const savingRef = useRef(false);
  const isMonthly = draft.cadence === 'Monthly';

  const updateDraft = (patch: Partial<BillDraft>) => {
    setDraft(current => ({ ...current, ...patch }));
    setFieldErrors(current => {
      const next = { ...current };
      Object.keys(patch).forEach(key => delete next[key as keyof FieldErrors]);
      return next;
    });
    setSubmitError('');
  };

  const fieldInputStyle = (field: keyof FieldErrors) => ({
    ...inputStyle,
    borderColor: fieldErrors[field] ? '#c46060' : C.border,
  });

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (savingRef.current) return;

    const errors: FieldErrors = {};
    const name = draft.name.trim();
    const amount = Number(draft.amount);
    const startDate = draft.startDate;
    const endDate = draft.endDate;
    let dueDay = Number(draft.dueDay);

    if (!name) errors.name = 'Enter a bill name.';
    if (!Number.isFinite(amount) || amount <= 0) errors.amount = 'Enter an amount greater than zero.';
    if (isMonthly) {
      if (!Number.isInteger(dueDay) || dueDay < 1 || dueDay > 31) {
        errors.dueDay = 'Enter a whole-number due day from 1 to 31.';
      }
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      errors.startDate = `Choose the first due date for this ${draft.cadence.toLowerCase()} bill.`;
    } else {
      dueDay = Number(startDate.slice(8, 10));
    }
    if (endDate && startDate && endDate < startDate) {
      errors.endDate = 'End date must be on or after the start or first due date.';
    }

    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      setSubmitError(Object.values(errors)[0] ?? 'Check the highlighted fields.');
      return;
    }

    const data = {
      name,
      amount,
      cadence: draft.cadence,
      dueDay,
      category: draft.category || 'Other',
      account: draft.account,
      startDate,
      endDate,
      icon: draft.icon.trim() || '💸',
      notes: draft.notes.trim(),
      autopay: draft.autopay,
      active: draft.active,
      status: bill?.status ?? 'scheduled',
      lastPaidDate: bill?.lastPaidDate ?? '',
      paymentTransactionId: bill?.paymentTransactionId,
    };

    savingRef.current = true;
    setIsSaving(true);
    setSubmitError('');
    try {
      const saved = bill ? updateBill(bill.id, data) : addBill(data);
      if (!saved) throw new Error('This bill no longer exists. Close the dialog and try again.');
      if (!useLedgerlyStore.getState().bills.some(item => item.id === saved.id)) {
        throw new Error('The bill could not be confirmed after saving. Please try again.');
      }
      savingRef.current = false;
      onSaved({ mode: bill ? 'updated' : 'created', bill: saved });
    } catch (error) {
      savingRef.current = false;
      setIsSaving(false);
      setSubmitError(error instanceof Error && error.message
        ? error.message
        : 'Unable to save this bill locally. Check your browser storage and try again.');
    }
  };

  const fieldError = (field: keyof FieldErrors) => fieldErrors[field]
    ? <span style={{ ...helpStyle, color: '#b44747', fontWeight: 600 }}>{fieldErrors[field]}</span>
    : null;

  return (
    <div
      role="presentation"
      onClick={event => { if (event.target === event.currentTarget && !isSaving) onClose(); }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    >
      <form role="dialog" aria-modal="true" aria-labelledby="bill-dialog-title" onSubmit={save} noValidate style={{ background: 'var(--surface)', borderRadius: 16, width: '100%', maxWidth: 620, boxShadow: '0 8px 40px rgba(0,0,0,.18)', overflow: 'hidden', color: 'var(--text)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: `1px solid ${C.border}` }}>
          <span id="bill-dialog-title" style={{ fontWeight: 700, fontSize: 16 }}>{bill ? 'Edit Bill' : 'Add Recurring Bill'}</span>
          <button type="button" disabled={isSaving} onClick={onClose} aria-label="Close bill dialog" style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: C.text2, lineHeight: 1 }}>×</button>
        </div>

        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '62vh', overflowY: 'auto' }}>
          <div>
            <label htmlFor="bill-name" style={labelStyle}>Bill name *</label>
            <input id="bill-name" autoFocus value={draft.name} onChange={event => updateDraft({ name: event.target.value })} placeholder="e.g. Rent" style={fieldInputStyle('name')} aria-invalid={Boolean(fieldErrors.name)} />
            {fieldError('name')}
            {!fieldErrors.name && <span style={helpStyle}>The company, service, or payment name shown in your bill list.</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            <div>
              <label htmlFor="bill-amount" style={labelStyle}>Amount *</label>
              <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${fieldErrors.amount ? '#c46060' : C.border}`, borderRadius: 8, overflow: 'hidden' }}>
                <span style={{ padding: '0 10px', color: C.text2, fontSize: 13 }}>$</span>
                <input id="bill-amount" value={draft.amount} onChange={event => updateDraft({ amount: event.target.value })} type="number" min="0" step="0.01" style={{ flex: 1, border: 'none', padding: '9px 8px', fontSize: 14, outline: 'none', minWidth: 0, background: 'var(--surface)', color: 'var(--text)' }} aria-invalid={Boolean(fieldErrors.amount)} />
              </div>
              {fieldError('amount')}
              {!fieldErrors.amount && <span style={helpStyle}>The amount due each time this bill occurs.</span>}
            </div>
            <div>
              <label htmlFor="bill-cadence" style={labelStyle}>Cadence *</label>
              <select id="bill-cadence" value={draft.cadence} onChange={event => updateDraft({ cadence: event.target.value as BillCadence })} style={inputStyle}>
                {CADENCES.map(cadence => <option key={cadence}>{cadence}</option>)}
              </select>
              <span style={helpStyle}>{cadenceHelp(draft.cadence)}</span>
            </div>

            {isMonthly ? (
              <div>
                <label htmlFor="bill-due-day" style={labelStyle}>Due day of month *</label>
                <input id="bill-due-day" value={draft.dueDay} onChange={event => updateDraft({ dueDay: event.target.value })} type="number" min="1" max="31" step="1" placeholder="1-31" style={fieldInputStyle('dueDay')} aria-invalid={Boolean(fieldErrors.dueDay)} />
                {fieldError('dueDay')}
                {!fieldErrors.dueDay && <span style={helpStyle}>Days 29–31 use the month’s final day when needed.</span>}
              </div>
            ) : (
              <div>
                <label htmlFor="bill-first-due" style={labelStyle}>First due date *</label>
                <input id="bill-first-due" value={draft.startDate} onChange={event => updateDraft({ startDate: event.target.value })} type="date" style={fieldInputStyle('startDate')} aria-invalid={Boolean(fieldErrors.startDate)} />
                {fieldError('startDate')}
                {!fieldErrors.startDate && <span style={helpStyle}>Anchors every future {draft.cadence.toLowerCase()} occurrence.</span>}
              </div>
            )}

            <div>
              <label htmlFor="bill-category" style={labelStyle}>Category</label>
              <select id="bill-category" value={draft.category} onChange={event => updateDraft({ category: event.target.value })} style={inputStyle}>
                {categoriesForSelect.map(category => <option key={category}>{category}</option>)}
              </select>
              <span style={helpStyle}>Used in budgets, reports, and calendar colors.</span>
            </div>
            <div>
              <label htmlFor="bill-account" style={labelStyle}>Pay from account <span style={{ fontWeight: 400 }}>(optional)</span></label>
              <select id="bill-account" value={draft.account} onChange={event => updateDraft({ account: event.target.value })} style={inputStyle}>
                <option value="">No linked account</option>
                {accounts.map(account => <option key={account.id} value={account.name}>{account.name}</option>)}
              </select>
              <span style={helpStyle}>Recording a payment updates this account. Leave unlinked to avoid a balance change.</span>
            </div>
            <div>
              <label htmlFor="bill-icon" style={labelStyle}>Icon <span style={{ fontWeight: 400 }}>(optional)</span></label>
              <input id="bill-icon" value={draft.icon} onChange={event => updateDraft({ icon: event.target.value })} maxLength={4} placeholder="e.g. 🏠" style={inputStyle} />
              <span style={helpStyle}>A visual marker shown beside the bill. Defaults to 💸.</span>
            </div>

            {isMonthly && (
              <div>
                <label htmlFor="bill-start-date" style={labelStyle}>Start date <span style={{ fontWeight: 400 }}>(optional)</span></label>
                <input id="bill-start-date" value={draft.startDate} onChange={event => updateDraft({ startDate: event.target.value })} type="date" style={fieldInputStyle('startDate')} />
                <span style={helpStyle}>The earliest date this monthly schedule can generate an occurrence.</span>
              </div>
            )}
            <div>
              <label htmlFor="bill-end-date" style={labelStyle}>End date <span style={{ fontWeight: 400 }}>(optional)</span></label>
              <input id="bill-end-date" value={draft.endDate} onChange={event => updateDraft({ endDate: event.target.value })} type="date" style={fieldInputStyle('endDate')} aria-invalid={Boolean(fieldErrors.endDate)} />
              {fieldError('endDate')}
              {!fieldErrors.endDate && <span style={helpStyle}>No new occurrences are generated after this date.</span>}
            </div>
          </div>

          <div>
            <label htmlFor="bill-notes" style={labelStyle}>Notes <span style={{ fontWeight: 400 }}>(optional)</span></label>
            <textarea id="bill-notes" value={draft.notes} onChange={event => updateDraft({ notes: event.target.value })} rows={3} placeholder="Confirmation number, reminder, or payment note" style={{ ...inputStyle, resize: 'vertical' }} />
            <span style={helpStyle}>Store schedule details, confirmation numbers, or reminders.</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
              <input type="checkbox" checked={draft.autopay} onChange={event => updateDraft({ autopay: event.target.checked })} style={{ width: 16, height: 16, marginTop: 2, accentColor: C.accent }} />
              <span><strong style={{ display: 'block', fontSize: 13 }}>Autopay enabled</strong><small style={helpStyle}>Tracking label only. Payments are created when you record them.</small></span>
            </label>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
              <input type="checkbox" checked={draft.active} onChange={event => updateDraft({ active: event.target.checked })} style={{ width: 16, height: 16, marginTop: 2, accentColor: C.accent }} />
              <span><strong style={{ display: 'block', fontSize: 13 }}>Active schedule</strong><small style={helpStyle}>Paused bills remain saved but do not create monthly occurrences.</small></span>
            </label>
          </div>
        </div>

        {submitError && <div role="alert" aria-live="assertive" style={{ margin: '12px 22px 0', padding: '10px 12px', borderRadius: 8, background: '#fdf0ee', border: '1px solid rgba(196,96,96,.28)', color: '#a33d3d', fontSize: 13, fontWeight: 600 }}>{submitError}</div>}

        <div style={{ display: 'flex', gap: 10, padding: '14px 22px', borderTop: `1px solid ${C.border}`, justifyContent: 'flex-end', marginTop: submitError ? 12 : 0 }}>
          <button type="button" disabled={isSaving} onClick={onClose} style={{ padding: '9px 20px', border: `1px solid ${C.border}`, borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: isSaving ? 'not-allowed' : 'pointer', background: 'var(--surface)', color: 'var(--text)', opacity: isSaving ? .6 : 1 }}>Cancel</button>
          <button type="submit" disabled={isSaving} style={{ padding: '9px 20px', background: C.accent, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: isSaving ? 'wait' : 'pointer', opacity: isSaving ? .7 : 1 }}>{isSaving ? 'Saving…' : bill ? 'Save Changes' : 'Add Bill'}</button>
        </div>
      </form>
    </div>
  );
}
