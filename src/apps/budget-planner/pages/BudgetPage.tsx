import { useState } from 'react';
import { useLedgerlyStore } from '../store/useLedgerlyStore';
import { fmt } from '../utils/formatters';

const METHODS = [
  { id: 'zero', name: 'Zero-Based', desc: 'Assign every dollar a job until income minus expenses equals zero.', tag: 'Most popular' },
  { id: '503020', name: '50/30/20', desc: 'Split income into needs (50%), wants (30%), and savings (20%).', tag: 'Simple & effective' },
  { id: 'payself', name: 'Pay Yourself First', desc: 'Save a set amount first, then spend the rest freely.', tag: 'Savings-focused' },
];

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

export function BudgetPage() {
  const income         = useLedgerlyStore(s => s.income);
  const categories     = useLedgerlyStore(s => s.categories);
  const setView        = useLedgerlyStore(s => s.setView);
  const updateCategory = useLedgerlyStore(s => s.updateCategory);
  const addCategory    = useLedgerlyStore(s => s.addCategory);
  const deleteCategory = useLedgerlyStore(s => s.deleteCategory);

  const [step, setStep]       = useState(1);
  const [method, setMethod]   = useState('zero');
  const [incomeVal, setIncome] = useState(String(income));
  const [cadence, setCadence] = useState<'monthly' | 'biweekly'>('monthly');

  const parsedIncome = parseFloat(incomeVal) || 0;
  const totalBudget  = categories.reduce((s, c) => s + c.budget, 0);
  const unassigned   = parsedIncome - totalBudget;

  // Group categories
  const groups: Record<string, typeof categories> = {};
  for (const c of categories) {
    const g = c.group ?? 'Other';
    if (!groups[g]) groups[g] = [];
    groups[g].push(c);
  }

  const steps = ['Profile', 'Income Plan', 'Categories', 'Ready'];

  return (
    <div className="budget-wizard">
      {/* Stepper */}
      <div className="wiz-stepper">
        {steps.map((label, i) => {
          const n = i + 1;
          const cls = `wiz-step${step === n ? ' active' : step > n ? ' done' : ''}`;
          return (
            <span key={n} style={{ display: 'contents' }}>
              <div className={cls}>
                <span>{step > n ? '✓' : n}</span>
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
        <p className="wiz-subtitle">Choose a budgeting method and enter your monthly income.</p>

        <div className="wiz-card">
          <div className="wiz-section-label">Budgeting method</div>
          <div className="method-cards">
            {METHODS.map(m => (
              <label key={m.id} className={`method-card${method === m.id ? ' selected' : ''}`} onClick={() => setMethod(m.id)}>
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
                  onChange={e => setIncome(e.target.value)}
                  placeholder="5,200"
                />
              </div>
            </div>

            <div className="payday-field">
              <div className="field-label">Next payday</div>
              <div className="payday-input-wrap">
                📅
                <input type="date" defaultValue="2026-10-01" />
              </div>
            </div>

            <div className="first-budget-preview">
              <div className="fbp-header">📋 Your first budget will include</div>
              <ul className="fbp-list">
                <li>✓ Income: {fmt(parsedIncome || income)}</li>
                <li>✓ {categories.length} spending categories</li>
                <li>✓ Method: {METHODS.find(m2 => m2.id === method)?.name}</li>
                <li>✓ Cadence: {cadence === 'monthly' ? 'Monthly' : 'Bi-weekly'}</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="wiz-footer">
          <span />
          <button className="wiz-continue-btn" onClick={() => setStep(2)}>Continue →</button>
        </div>
      </div>

      {/* ── Step 2: Income Plan ── */}
      <div className={step !== 2 ? 'hidden' : ''}>
        <h2 className="wiz-title">Your income plan</h2>
        <p className="wiz-subtitle">Based on your {METHODS.find(m2 => m2.id === method)?.name} method, here's how your income breaks down.</p>

        <div className="wiz-card">
          <div className="income-plan-grid">
            {method === '503020' ? (
              <>
                <div className="income-plan-tile">
                  <div className="tile-pct">50%</div>
                  <div className="tile-label">Needs (housing, food, transport)</div>
                  <div className="tile-amount">{fmt(parsedIncome * 0.5)}</div>
                </div>
                <div className="income-plan-tile">
                  <div className="tile-pct">30%</div>
                  <div className="tile-label">Wants (dining, entertainment)</div>
                  <div className="tile-amount">{fmt(parsedIncome * 0.3)}</div>
                </div>
                <div className="income-plan-tile">
                  <div className="tile-pct">20%</div>
                  <div className="tile-label">Savings & debt repayment</div>
                  <div className="tile-amount">{fmt(parsedIncome * 0.2)}</div>
                </div>
              </>
            ) : method === 'payself' ? (
              <>
                <div className="income-plan-tile">
                  <div className="tile-pct">20%</div>
                  <div className="tile-label">Savings (pay yourself first)</div>
                  <div className="tile-amount">{fmt(parsedIncome * 0.2)}</div>
                </div>
                <div className="income-plan-tile">
                  <div className="tile-pct">80%</div>
                  <div className="tile-label">Free to spend as needed</div>
                  <div className="tile-amount">{fmt(parsedIncome * 0.8)}</div>
                </div>
                <div className="income-plan-tile">
                  <div className="tile-pct">0%</div>
                  <div className="tile-label">Unallocated — your choice</div>
                  <div className="tile-amount">{fmt(0)}</div>
                </div>
              </>
            ) : (
              <>
                <div className="income-plan-tile">
                  <div className="tile-pct">100%</div>
                  <div className="tile-label">Total income assigned</div>
                  <div className="tile-amount">{fmt(parsedIncome)}</div>
                </div>
                <div className="income-plan-tile">
                  <div className="tile-pct">{parsedIncome > 0 ? Math.round((totalBudget / parsedIncome) * 100) : 0}%</div>
                  <div className="tile-label">Currently budgeted</div>
                  <div className="tile-amount">{fmt(totalBudget)}</div>
                </div>
                <div className="income-plan-tile">
                  <div className="tile-pct">{parsedIncome > 0 ? Math.max(0, Math.round((unassigned / parsedIncome) * 100)) : 0}%</div>
                  <div className="tile-label">Unassigned — to allocate</div>
                  <div className="tile-amount" style={{ color: unassigned < 0 ? '#ef4444' : undefined }}>{fmt(Math.max(0, unassigned))}</div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="wiz-footer">
          <button className="wiz-back-btn" onClick={() => setStep(1)}>← Back</button>
          <button className="wiz-continue-btn" onClick={() => setStep(3)}>Continue →</button>
        </div>
      </div>

      {/* ── Step 3: Categories ── */}
      <div className={step !== 3 ? 'hidden' : ''}>
        <h2 className="wiz-title">Set your spending targets</h2>
        <p className="wiz-hint">
          Income: <strong>{fmt(parsedIncome)}</strong> &nbsp;·&nbsp;
          Budgeted: <strong>{fmt(totalBudget)}</strong> &nbsp;·&nbsp;
          <span style={{ color: unassigned < 0 ? '#ef4444' : '#16a34a', fontWeight: 700 }}>
            {unassigned >= 0 ? `${fmt(unassigned)} unassigned` : `${fmt(Math.abs(unassigned))} over`}
          </span>
        </p>

        {Object.entries(groups).map(([groupName, cats]) => {
          const groupTotal = cats.reduce((s, c) => s + c.budget, 0);
          const dotColors: Record<string, string> = {
            Essentials: '#3b82f6', Housing: '#f97316', Food: '#22c55e',
            Transport: '#1e293b', Lifestyle: '#60a5fa', Debt: '#94a3b8', Other: '#8b5cf6',
          };
          const dotColor = dotColors[groupName] ?? cats[0]?.color ?? '#94a3b8';

          return (
            <div className="cat-group" key={groupName}>
              <div className="cat-group-header">
                <div className="cat-group-dot" style={{ background: dotColor }} />
                <div className="cat-group-name">{groupName}</div>
                <div className="cat-group-total">{fmt(groupTotal)}</div>
              </div>
              {cats.map(cat => (
                <div className="cat-row" key={cat.id}>
                  <div className="cat-row-name">{cat.name}</div>
                  <input
                    className="cat-row-input"
                    type="number"
                    min="0"
                    value={cat.budget}
                    onChange={e => {
                      const v = parseFloat(e.target.value);
                      if (!isNaN(v) && v >= 0) updateCategory(cat.id, { budget: v });
                    }}
                  />
                  <button
                    className="remove-cat-btn"
                    onClick={() => { if (confirm(`Delete "${cat.name}"?`)) deleteCategory(cat.id); }}
                    title="Remove"
                  >×</button>
                </div>
              ))}
              <button
                className="add-cat-btn"
                onClick={() => {
                  const name = prompt('New category name:');
                  if (name?.trim()) addCategory({ name: name.trim(), budget: 0, color: dotColor, group: groupName });
                }}
              >
                + Add category to {groupName}
              </button>
            </div>
          );
        })}

        <div className="wiz-footer">
          <button className="wiz-back-btn" onClick={() => setStep(2)}>← Back</button>
          <button className="wiz-continue-btn" onClick={() => setStep(4)}>Continue →</button>
        </div>
      </div>

      {/* ── Step 4: Ready ── */}
      <div className={step !== 4 ? 'hidden' : ''}>
        <h2 className="wiz-title">You're all set! 🎉</h2>
        <p className="wiz-subtitle">Your budget is configured. Here's a summary before you dive in.</p>

        <div className="wiz-card">
          {[
            { label: 'Budgeting method', value: METHODS.find(m2 => m2.id === method)?.name ?? '' },
            { label: 'Monthly income', value: fmt(parsedIncome || income) },
            { label: 'Total budgeted', value: fmt(totalBudget) },
            { label: 'Unassigned', value: fmt(Math.abs(unassigned)), note: unassigned < 0 ? ' (over budget)' : ' remaining' },
            { label: 'Categories', value: `${categories.length} categories across ${Object.keys(groups).length} groups` },
          ].map(row => (
            <div className="ready-row" key={row.label}>
              <div className="ready-check">✓</div>
              <div>
                <div className="ready-label">{row.label}</div>
                <div className="ready-value">{row.value}{row.note ?? ''}</div>
              </div>
            </div>
          ))}

          <div className="ready-row">
            <div className="ready-check" style={{ background: '#3b82f6' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" width="14" height="14">
                <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
              </svg>
            </div>
            <div>
              <div className="ready-label">Progress ring</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                <div
                  dangerouslySetInnerHTML={{
                    __html: progressRing(
                      (parsedIncome || income) > 0 ? Math.min(100, (totalBudget / (parsedIncome || income)) * 100) : 0,
                      56, 6, '#22c55e'
                    )
                  }}
                />
                <span className="ready-value">
                  {(parsedIncome || income) > 0
                    ? `${Math.round((totalBudget / (parsedIncome || income)) * 100)}% of income allocated`
                    : 'Budget ready'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="wiz-footer">
          <button className="wiz-back-btn" onClick={() => setStep(3)}>← Back</button>
          <button className="wiz-open-btn" onClick={() => setView('dashboard')}>Open Dashboard →</button>
        </div>
      </div>
    </div>
  );
}
