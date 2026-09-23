import { useState, useEffect, useRef } from 'react';
import { useLedgerlyStore } from '../store/useLedgerlyStore';
import { fmt } from '../utils/formatters';

const METHODS: { id: 'zero' | '503020' | 'payself'; name: string; desc: string; tag: string }[] = [
  { id: 'zero',    name: 'Zero-Based',        desc: 'Assign every dollar a job until income minus expenses equals zero.',    tag: 'Most popular'       },
  { id: '503020',  name: '50/30/20',           desc: 'Split income into needs (50%), wants (30%), and savings (20%).',        tag: 'Simple & effective' },
  { id: 'payself', name: 'Pay Yourself First', desc: 'Save a set amount first, then spend the rest freely.',                 tag: 'Savings-focused'    },
];

const GROUP_COLORS: Record<string, string> = {
  Housing:   '#f97316',
  Food:      '#22c55e',
  Transport: '#1e293b',
  Essentials:'#3b82f6',
  Lifestyle: '#60a5fa',
  Savings:   '#22c55e',
  Debt:      '#94a3b8',
  Other:     '#8b5cf6',
};

function progressRing(pct: number, size: number, sw: number, color: string) {
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.max(0, Math.min(1, pct / 100)));
  const cx = size / 2, cy = size / 2;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#e5e2db" stroke-width="${sw}"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${sw}"
      stroke-dasharray="${circ}" stroke-dashoffset="${offset}"
      stroke-linecap="round" transform="rotate(-90 ${cx} ${cy})"/>
    <text x="${cx}" y="${cy + 5}" text-anchor="middle" font-size="14" font-weight="700" fill="#1a1f2e">${Math.round(pct)}%</text>
  </svg>`;
}

// Inline form for adding a new category name (replaces prompt())
function InlineCatInput({
  placeholder,
  onConfirm,
  onCancel,
}: {
  placeholder: string;
  onConfirm: (name: string) => void;
  onCancel: () => void;
}) {
  const [val, setVal] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);

  const submit = () => {
    const trimmed = val.trim();
    if (trimmed) onConfirm(trimmed);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
      <input
        ref={ref}
        type="text"
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') onCancel(); }}
        placeholder={placeholder}
        style={{
          flex: 1, padding: '5px 8px', border: '1px solid #d1d5db', borderRadius: 6,
          fontSize: 13, outline: 'none', background: '#fff',
        }}
      />
      <button
        onClick={submit}
        style={{ padding: '5px 10px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
      >✓</button>
      <button
        onClick={onCancel}
        style={{ padding: '5px 8px', background: 'transparent', color: '#9ca3af', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}
      >×</button>
    </div>
  );
}

// Shared category group editor used both in wizard and manage view
function CategoryGroups({
  groups,
  unusedGroups,
  income,
  onUpdateCategory,
  onDeleteCategory,
  onAddCategory,
}: {
  groups: Record<string, { id: number; name: string; budget: number; spent: number; color: string; group?: string }[]>;
  unusedGroups: string[];
  income: number;
  onUpdateCategory: (id: number, patch: { budget: number }) => void;
  onDeleteCategory: (id: number, name: string) => void;
  onAddCategory: (name: string, group: string) => void;
}) {
  // addingTo: group name to add a category to, or '__new_group__' for new group, null = hidden
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupStep, setNewGroupStep] = useState<'group' | 'cat'>('group');
  const newGroupRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (addingTo === '__new_group__' && newGroupStep === 'group') {
      newGroupRef.current?.focus();
    }
  }, [addingTo, newGroupStep]);

  const allGroupNames = Object.keys(GROUP_COLORS);
  const usedGroups = Object.keys(groups);
  const filteredUnused = unusedGroups.filter(g => !usedGroups.includes(g));

  return (
    <>
      {Object.entries(groups).map(([groupName, cats]) => {
        const groupTotal = cats.reduce((s, c) => s + c.budget, 0);
        const dotColor = GROUP_COLORS[groupName] ?? cats[0]?.color ?? '#94a3b8';

        return (
          <div className="cat-group" key={groupName}>
            <div className="cat-group-header">
              <div className="cat-group-dot" style={{ background: dotColor }} />
              <div className="cat-group-name">{groupName}</div>
              <div className="cat-group-total">{fmt(groupTotal)}</div>
            </div>

            {cats.map(cat => (
              <div className="cat-row" key={cat.id}>
                <div className="cat-row-name" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
                  {cat.name}
                </div>
                <div style={{ flex: 1, marginLeft: 12 }}>
                  <div style={{ height: 4, background: '#e5e2db', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${income > 0 ? Math.min(100, cat.budget / income * 100) : 0}%`,
                      background: cat.color,
                      borderRadius: 2,
                      transition: 'width .3s',
                    }} />
                  </div>
                  <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>
                    {income > 0 ? Math.round(cat.budget / income * 100) : 0}% of income
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#9ca3af', fontSize: 13 }}>$</span>
                  <input
                    className="cat-row-input"
                    type="number"
                    min="0"
                    step="10"
                    value={cat.budget}
                    onChange={e => {
                      const v = parseFloat(e.target.value);
                      if (!isNaN(v) && v >= 0) onUpdateCategory(cat.id, { budget: v });
                    }}
                  />
                </div>
                <button
                  className="remove-cat-btn"
                  onClick={() => onDeleteCategory(cat.id, cat.name)}
                  title="Remove category"
                >×</button>
              </div>
            ))}

            {addingTo === groupName ? (
              <InlineCatInput
                placeholder={`Category name in ${groupName}…`}
                onConfirm={name => { onAddCategory(name, groupName); setAddingTo(null); }}
                onCancel={() => setAddingTo(null)}
              />
            ) : (
              <button className="add-cat-btn" onClick={() => setAddingTo(groupName)}>
                + Add category to {groupName}
              </button>
            )}
          </div>
        );
      })}

      {/* Add new group section */}
      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.04em' }}>
          Add a group
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {filteredUnused.map(g => (
            <div key={g} style={{ display: 'flex', flexDirection: 'column' }}>
              {addingTo === `__predefined__${g}` ? (
                <InlineCatInput
                  placeholder={`First category in ${g}…`}
                  onConfirm={name => { onAddCategory(name, g); setAddingTo(null); }}
                  onCancel={() => setAddingTo(null)}
                />
              ) : (
                <button
                  onClick={() => setAddingTo(`__predefined__${g}`)}
                  style={{
                    padding: '5px 12px', border: '1px dashed #d1d5db', borderRadius: 99,
                    background: 'transparent', cursor: 'pointer', fontSize: 12, color: '#6b7280',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: GROUP_COLORS[g], display: 'inline-block' }} />
                  + {g}
                </button>
              )}
            </div>
          ))}

          {/* Custom group */}
          {addingTo === '__new_group__' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 220 }}>
              {newGroupStep === 'group' ? (
                <>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>New group name:</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input
                      ref={newGroupRef}
                      type="text"
                      value={newGroupName}
                      onChange={e => setNewGroupName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && newGroupName.trim()) setNewGroupStep('cat');
                        if (e.key === 'Escape') { setAddingTo(null); setNewGroupName(''); setNewGroupStep('group'); }
                      }}
                      placeholder="e.g. Education"
                      style={{ flex: 1, padding: '5px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, outline: 'none' }}
                    />
                    <button
                      onClick={() => { if (newGroupName.trim()) setNewGroupStep('cat'); }}
                      style={{ padding: '5px 10px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                    >→</button>
                    <button
                      onClick={() => { setAddingTo(null); setNewGroupName(''); setNewGroupStep('group'); }}
                      style={{ padding: '5px 8px', background: 'transparent', color: '#9ca3af', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}
                    >×</button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>First category in <strong>{newGroupName}</strong>:</div>
                  <InlineCatInput
                    placeholder="Category name…"
                    onConfirm={name => {
                      onAddCategory(name, newGroupName.trim());
                      setAddingTo(null);
                      setNewGroupName('');
                      setNewGroupStep('group');
                    }}
                    onCancel={() => { setAddingTo(null); setNewGroupName(''); setNewGroupStep('group'); }}
                  />
                </>
              )}
            </div>
          ) : (
            <button
              onClick={() => { setAddingTo('__new_group__'); setNewGroupName(''); setNewGroupStep('group'); }}
              style={{
                padding: '5px 12px', border: '1px dashed #d1d5db', borderRadius: 99,
                background: 'transparent', cursor: 'pointer', fontSize: 12, color: '#6b7280',
              }}
            >
              + Custom group
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export function BudgetPage() {
  const income            = useLedgerlyStore(s => s.income);
  const budgetMethod      = useLedgerlyStore(s => s.budgetMethod);
  const categories        = useLedgerlyStore(s => s.categories);
  const budgetConfigured  = useLedgerlyStore(s => s.budgetConfigured);
  const setView           = useLedgerlyStore(s => s.setView);
  const setIncome         = useLedgerlyStore(s => s.setIncome);
  const setBudgetMethod   = useLedgerlyStore(s => s.setBudgetMethod);
  const setBudgetConfigured = useLedgerlyStore(s => s.setBudgetConfigured);
  const updateCategory    = useLedgerlyStore(s => s.updateCategory);
  const addCategory       = useLedgerlyStore(s => s.addCategory);
  const deleteCategory    = useLedgerlyStore(s => s.deleteCategory);

  const [step, setStep]           = useState(1);
  const [incomeVal, setIncomeVal] = useState(String(income || ''));
  const [cadence, setCadence]     = useState<'monthly' | 'biweekly'>('monthly');
  const [payday, setPayday]       = useState('');
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [editIncomeVal, setEditIncomeVal] = useState('');

  useEffect(() => { setIncomeVal(String(income || '')); }, [income]);

  const parsedIncome = parseFloat(incomeVal) || 0;
  const totalBudget  = categories.reduce((s, c) => s + c.budget, 0);
  const unassigned   = (parsedIncome || income) - totalBudget;

  const saveIncome = () => {
    const n = parseFloat(incomeVal);
    if (!isNaN(n) && n >= 0 && n !== income) setIncome(n);
  };

  const groups: Record<string, typeof categories> = {};
  for (const c of categories) {
    const g = c.group ?? 'Other';
    if (!groups[g]) groups[g] = [];
    groups[g].push(c);
  }

  const allGroupNames = Object.keys(GROUP_COLORS);
  const usedGroups = Object.keys(groups);
  const unusedGroups = allGroupNames.filter(g => !usedGroups.includes(g));

  const steps = ['Profile', 'Income Plan', 'Categories', 'Ready'];

  const goNext = (nextStep: number) => {
    if (nextStep > 1) saveIncome();
    setStep(nextStep);
  };

  const handleAddCategory = (name: string, group: string) => {
    const dotColor = GROUP_COLORS[group] ?? '#94a3b8';
    addCategory({ name, budget: 0, color: dotColor, group });
  };

  const handleDeleteCategory = (id: number, name: string) => {
    if (confirm(`Delete "${name}"?`)) deleteCategory(id);
  };

  // ── Manage view (budget already configured) ──────────────────────────────
  if (budgetConfigured) {
    const effectiveIncome = income;
    const manageTotalBudget = categories.reduce((s, c) => s + c.budget, 0);
    const manageUnassigned = effectiveIncome - manageTotalBudget;

    const manageGroups: Record<string, typeof categories> = {};
    for (const c of categories) {
      const g = c.group ?? 'Other';
      if (!manageGroups[g]) manageGroups[g] = [];
      manageGroups[g].push(c);
    }
    const manageUsedGroups = Object.keys(manageGroups);
    const manageUnusedGroups = allGroupNames.filter(g => !manageUsedGroups.includes(g));

    return (
      <div className="budget-wizard">
        {/* Header summary */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h2 className="wiz-title" style={{ marginBottom: 4 }}>Monthly Budget</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', fontSize: 13, color: '#6b7280' }}>
              <span>
                Income: <strong style={{ color: '#1a1f2e' }}>{fmt(effectiveIncome)}/mo</strong>
              </span>
              <span>·</span>
              <span>
                Method: <strong style={{ color: '#1a1f2e' }}>{METHODS.find(m => m.id === budgetMethod)?.name}</strong>
              </span>
              <button
                onClick={() => { setEditIncomeVal(String(income || '')); setShowEditPanel(v => !v); }}
                style={{ padding: '2px 10px', border: '1px solid #d1d5db', borderRadius: 99, background: '#fff', cursor: 'pointer', fontSize: 12, color: '#374151' }}
              >
                Edit
              </button>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, color: '#6b7280' }}>
              Budgeted: <strong style={{ color: '#1a1f2e' }}>{fmt(manageTotalBudget)}</strong>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: manageUnassigned < 0 ? '#ef4444' : '#16a34a' }}>
              {manageUnassigned >= 0 ? `${fmt(manageUnassigned)} unassigned` : `${fmt(Math.abs(manageUnassigned))} over budget`}
            </div>
          </div>
        </div>

        {/* Inline edit panel */}
        {showEditPanel && (
          <div className="wiz-card" style={{ marginBottom: 16 }}>
            <div className="wiz-section-label">Budgeting method</div>
            <div className="method-cards">
              {METHODS.map(m => (
                <label
                  key={m.id}
                  className={`method-card${budgetMethod === m.id ? ' selected' : ''}`}
                  onClick={() => setBudgetMethod(m.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="method-card-header">
                    <div className="method-radio" />
                    <div className="method-name">{m.name}</div>
                  </div>
                  <div className="method-desc">{m.desc}</div>
                  <div className="method-tag">{m.tag}</div>
                </label>
              ))}
            </div>
            <div style={{ marginTop: 16 }}>
              <div className="field-label">Monthly take-home income</div>
              <div className="income-input-wrap" style={{ maxWidth: 220 }}>
                <span className="currency-symbol">$</span>
                <input
                  type="number"
                  min="0"
                  value={editIncomeVal}
                  onChange={e => setEditIncomeVal(e.target.value)}
                  onBlur={() => {
                    const n = parseFloat(editIncomeVal);
                    if (!isNaN(n) && n >= 0) setIncome(n);
                  }}
                  placeholder="0"
                />
              </div>
            </div>
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowEditPanel(false)}
                style={{ padding: '6px 16px', background: '#1a1f2e', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* Category groups */}
        <CategoryGroups
          groups={manageGroups}
          unusedGroups={manageUnusedGroups}
          income={effectiveIncome}
          onUpdateCategory={(id, patch) => updateCategory(id, patch)}
          onDeleteCategory={handleDeleteCategory}
          onAddCategory={handleAddCategory}
        />

        {/* Empty state */}
        {categories.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af', fontSize: 14 }}>
            No categories yet. Add a group above to get started.
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={() => { setBudgetConfigured(false); setStep(1); }}
            style={{ padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 13, color: '#6b7280' }}
          >
            Re-run setup wizard
          </button>
          <button
            className="wiz-open-btn"
            onClick={() => setView('dashboard')}
          >
            Open Dashboard →
          </button>
        </div>
      </div>
    );
  }

  // ── Budget setup wizard ───────────────────────────────────────────────────
  return (
    <div className="budget-wizard">

      {/* Stepper */}
      <div className="wiz-stepper">
        {steps.map((label, i) => {
          const n = i + 1;
          const isDone   = step > n;
          const isActive = step === n;
          const cls = `wiz-step${isActive ? ' active' : ''}${isDone ? ' done' : ''}`;
          return (
            <span key={n} style={{ display: 'contents' }}>
              <div className={cls} style={{ cursor: isDone ? 'pointer' : undefined }} onClick={() => isDone && setStep(n)}>
                <span>{isDone ? '✓' : n}</span>
                {label}
              </div>
              {i < steps.length - 1 && <div className="wiz-connector" />}
            </span>
          );
        })}
      </div>

      {/* ── Step 1: Method + Income ── */}
      <div className={step !== 1 ? 'hidden' : ''}>
        <h2 className="wiz-title">Set up your budget</h2>
        <p className="wiz-subtitle">Choose a budgeting method and enter your monthly take-home income.</p>

        <div className="wiz-card">
          <div className="wiz-section-label">Budgeting method</div>
          <div className="method-cards">
            {METHODS.map(m => (
              <label
                key={m.id}
                className={`method-card${budgetMethod === m.id ? ' selected' : ''}`}
                onClick={() => setBudgetMethod(m.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="method-card-header">
                  <div className="method-radio" />
                  <div className="method-name">{m.name}</div>
                </div>
                <div className="method-desc">{m.desc}</div>
                <div className="method-tag">{m.tag}</div>
              </label>
            ))}
          </div>

          <div className="income-row">
            <div>
              <div className="field-label">Monthly take-home income</div>
              <div className="cadence-toggle">
                <button className={`cadence-btn${cadence === 'monthly' ? ' active' : ''}`} onClick={() => setCadence('monthly')}>Monthly</button>
                <button className={`cadence-btn${cadence === 'biweekly' ? ' active' : ''}`} onClick={() => setCadence('biweekly')}>Bi-weekly</button>
              </div>
              <div className="income-input-wrap">
                <span className="currency-symbol">$</span>
                <input
                  type="number"
                  min="0"
                  value={incomeVal}
                  onChange={e => setIncomeVal(e.target.value)}
                  onBlur={saveIncome}
                  placeholder="0"
                />
              </div>
              {cadence === 'biweekly' && parsedIncome > 0 && (
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 6 }}>
                  ≈ {fmt(parsedIncome * 26 / 12)}/month
                </div>
              )}
            </div>

            <div className="payday-field">
              <div className="field-label">Next payday</div>
              <div className="payday-input-wrap">
                📅
                <input
                  type="date"
                  value={payday}
                  onChange={e => setPayday(e.target.value)}
                  style={{ border: 'none', outline: 'none', fontSize: 14, color: '#374151', background: 'transparent', flex: 1 }}
                />
              </div>
            </div>

            <div className="first-budget-preview">
              <div className="fbp-header">📋 Your first budget will include</div>
              <ul className="fbp-list">
                <li>✓ Income: {parsedIncome > 0 ? fmt(parsedIncome) : '—'}</li>
                <li>✓ {categories.length} spending categories</li>
                <li>✓ Method: {METHODS.find(m => m.id === budgetMethod)?.name}</li>
                <li>✓ Cadence: {cadence === 'monthly' ? 'Monthly' : 'Bi-weekly'}</li>
                <li>✓ {Object.keys(groups).length} spending groups</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="wiz-footer">
          <span />
          <button className="wiz-continue-btn" onClick={() => goNext(2)}>Continue →</button>
        </div>
      </div>

      {/* ── Step 2: Income Plan ── */}
      <div className={step !== 2 ? 'hidden' : ''}>
        <h2 className="wiz-title">Your income plan</h2>
        <p className="wiz-subtitle">
          Based on the <strong>{METHODS.find(m => m.id === budgetMethod)?.name}</strong> method, here's how your{' '}
          <strong>{fmt(parsedIncome || income)}</strong> breaks down.
        </p>

        <div className="wiz-card">
          <div className="income-plan-grid">
            {budgetMethod === '503020' ? (
              <>
                <div className="income-plan-tile">
                  <div className="tile-pct">50%</div>
                  <div className="tile-label">Needs (housing, food, transport)</div>
                  <div className="tile-amount">{fmt((parsedIncome || income) * 0.5)}</div>
                </div>
                <div className="income-plan-tile">
                  <div className="tile-pct">30%</div>
                  <div className="tile-label">Wants (dining, entertainment)</div>
                  <div className="tile-amount">{fmt((parsedIncome || income) * 0.3)}</div>
                </div>
                <div className="income-plan-tile">
                  <div className="tile-pct">20%</div>
                  <div className="tile-label">Savings & debt repayment</div>
                  <div className="tile-amount">{fmt((parsedIncome || income) * 0.2)}</div>
                </div>
              </>
            ) : budgetMethod === 'payself' ? (
              <>
                <div className="income-plan-tile">
                  <div className="tile-pct">20%</div>
                  <div className="tile-label">Savings (pay yourself first)</div>
                  <div className="tile-amount">{fmt((parsedIncome || income) * 0.2)}</div>
                </div>
                <div className="income-plan-tile">
                  <div className="tile-pct">80%</div>
                  <div className="tile-label">Free to spend as needed</div>
                  <div className="tile-amount">{fmt((parsedIncome || income) * 0.8)}</div>
                </div>
                <div className="income-plan-tile">
                  <div className="tile-pct">{(parsedIncome || income) > 0 ? Math.round(((parsedIncome || income) - totalBudget) / (parsedIncome || income) * 100) : 0}%</div>
                  <div className="tile-label">Currently unallocated</div>
                  <div className="tile-amount" style={{ color: unassigned < 0 ? '#ef4444' : undefined }}>
                    {fmt(Math.abs(unassigned))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="income-plan-tile">
                  <div className="tile-pct">100%</div>
                  <div className="tile-label">Total income to assign</div>
                  <div className="tile-amount">{fmt(parsedIncome || income)}</div>
                </div>
                <div className="income-plan-tile">
                  <div className="tile-pct">{(parsedIncome || income) > 0 ? Math.round(totalBudget / (parsedIncome || income) * 100) : 0}%</div>
                  <div className="tile-label">Currently budgeted</div>
                  <div className="tile-amount">{fmt(totalBudget)}</div>
                </div>
                <div className="income-plan-tile">
                  <div className="tile-pct">{(parsedIncome || income) > 0 ? Math.max(0, Math.round(unassigned / (parsedIncome || income) * 100)) : 0}%</div>
                  <div className="tile-label">Unassigned — to allocate</div>
                  <div className="tile-amount" style={{ color: unassigned < 0 ? '#ef4444' : '#22c55e' }}>
                    {fmt(Math.abs(unassigned))} {unassigned < 0 ? 'over' : 'left'}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="wiz-footer">
          <button className="wiz-back-btn" onClick={() => setStep(1)}>← Back</button>
          <button className="wiz-continue-btn" onClick={() => goNext(3)}>Continue →</button>
        </div>
      </div>

      {/* ── Step 3: Categories ── */}
      <div className={step !== 3 ? 'hidden' : ''}>
        <h2 className="wiz-title">Set your spending targets</h2>
        <p className="wiz-hint">
          Income: <strong>{fmt(parsedIncome || income)}</strong> &nbsp;·&nbsp;
          Budgeted: <strong>{fmt(totalBudget)}</strong> &nbsp;·&nbsp;
          <span style={{ color: unassigned < 0 ? '#ef4444' : '#16a34a', fontWeight: 700 }}>
            {unassigned >= 0 ? `${fmt(unassigned)} unassigned` : `${fmt(Math.abs(unassigned))} over budget`}
          </span>
        </p>

        <CategoryGroups
          groups={groups}
          unusedGroups={unusedGroups}
          income={parsedIncome || income}
          onUpdateCategory={(id, patch) => updateCategory(id, patch)}
          onDeleteCategory={handleDeleteCategory}
          onAddCategory={handleAddCategory}
        />

        {categories.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af', fontSize: 14 }}>
            No categories yet. Add a group above to get started.
          </div>
        )}

        <div className="wiz-footer">
          <button className="wiz-back-btn" onClick={() => setStep(2)}>← Back</button>
          <button className="wiz-continue-btn" onClick={() => goNext(4)}>Continue →</button>
        </div>
      </div>

      {/* ── Step 4: Ready ── */}
      <div className={step !== 4 ? 'hidden' : ''}>
        <h2 className="wiz-title">You're all set! 🎉</h2>
        <p className="wiz-subtitle">Your budget is saved. Here's a summary before you open the dashboard.</p>

        <div className="wiz-card">
          {[
            { label: 'Budgeting method', value: METHODS.find(m => m.id === budgetMethod)?.name ?? '' },
            { label: 'Monthly income',   value: fmt(parsedIncome || income) },
            { label: 'Total budgeted',   value: fmt(totalBudget) },
            {
              label: 'Budget balance',
              value: unassigned === 0
                ? '✓ Perfectly balanced!'
                : unassigned > 0
                  ? `${fmt(unassigned)} unassigned`
                  : `${fmt(Math.abs(unassigned))} over budget`,
            },
            {
              label: 'Categories',
              value: `${categories.length} categories across ${Object.keys(groups).length} group${Object.keys(groups).length !== 1 ? 's' : ''}`,
            },
          ].map(row => (
            <div className="ready-row" key={row.label}>
              <div className="ready-check">✓</div>
              <div>
                <div className="ready-label">{row.label}</div>
                <div className="ready-value">{row.value}</div>
              </div>
            </div>
          ))}

          {/* Allocation ring */}
          <div className="ready-row">
            <div className="ready-check" style={{ background: '#3b82f6', flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" width="14" height="14">
                <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div className="ready-label">Budget allocation</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
                <div
                  dangerouslySetInnerHTML={{
                    __html: progressRing(
                      (parsedIncome || income) > 0 ? Math.min(100, totalBudget / (parsedIncome || income) * 100) : 0,
                      60, 6, '#22c55e'
                    ),
                  }}
                />
                <div>
                  <div className="ready-value">
                    {(parsedIncome || income) > 0
                      ? `${Math.round(totalBudget / (parsedIncome || income) * 100)}% of income allocated`
                      : 'No income set'}
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                    {fmt(totalBudget)} budgeted of {fmt(parsedIncome || income)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Category bars */}
          {Object.keys(groups).length > 0 && (
            <div className="ready-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 10 }}>
              <div className="ready-label" style={{ marginBottom: 4 }}>Breakdown by group</div>
              {Object.entries(groups).map(([g, cats]) => {
                const total = cats.reduce((s, c) => s + c.budget, 0);
                const pct = (parsedIncome || income) > 0 ? Math.min(100, total / (parsedIncome || income) * 100) : 0;
                const color = GROUP_COLORS[g] ?? '#94a3b8';
                return (
                  <div key={g} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 80, fontSize: 12, color: '#374151', fontWeight: 600, flexShrink: 0 }}>{g}</div>
                    <div style={{ flex: 1, height: 6, background: '#e5e2db', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width .3s' }} />
                    </div>
                    <div style={{ width: 70, textAlign: 'right', fontSize: 12, color: '#6b7280', flexShrink: 0 }}>{fmt(total)}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="wiz-footer">
          <button className="wiz-back-btn" onClick={() => setStep(3)}>← Back</button>
          <button
            className="wiz-open-btn"
            onClick={() => { setBudgetConfigured(true); setView('dashboard'); }}
          >
            Open Dashboard →
          </button>
        </div>
      </div>

    </div>
  );
}
