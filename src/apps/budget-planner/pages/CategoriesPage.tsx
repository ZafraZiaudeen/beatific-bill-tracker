import { useMemo, useState } from 'react';
import { PageIntroBanner } from '../components/PageIntroBanner';
import { useLedgerlyStore } from '../store/useLedgerlyStore';
import type { BudgetCategory } from '../types';
import { fmt } from '../utils/formatters';
import heart04 from '../../../assets/budget-assets/hearts/heart-04.png';
import sprig02 from '../../../assets/budget-assets/botanical-sprigs/botanical-sprigs-02.png';
import flower04 from '../../../assets/budget-assets/flowers-and-leaves/flowers-and-leaves-04.png';

const GROUPS = ['Income', 'Needs', 'Wants', 'Savings', 'Debt', 'Other'];
const KINDS: NonNullable<BudgetCategory['kind']>[] = ['income', 'need', 'want', 'saving', 'debt', 'other'];
const COLORS = ['#7a9e7e', '#c48a8a', '#c4a35a', '#9e8abe', '#6b9ec4', '#e89e6e', '#8a9e8b'];

interface CategoryDraft {
  name: string;
  group: string;
  kind: NonNullable<BudgetCategory['kind']>;
  color: string;
  icon: string;
  budget: string;
}

function emptyDraft(): CategoryDraft {
  return {
    name: '',
    group: 'Needs',
    kind: 'need',
    color: COLORS[0],
    icon: '📌',
    budget: '0',
  };
}

function draftFromCategory(category: BudgetCategory): CategoryDraft {
  return {
    name: category.name,
    group: category.group ?? 'Other',
    kind: category.kind ?? 'other',
    color: category.color,
    icon: category.icon ?? '📌',
    budget: String(category.budget),
  };
}

function CategoryModal({
  title,
  draft,
  onChange,
  onClose,
  onSave,
}: {
  title: string;
  draft: CategoryDraft;
  onChange: (draft: CategoryDraft) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <div className="ldg-cat-modal-backdrop" onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="ldg-cat-modal">
        <div className="ldg-cat-modal-header">
          <span>{title}</span>
          <button onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="ldg-cat-modal-body">
          <label>
            <span>Name</span>
            <input value={draft.name} onChange={event => onChange({ ...draft, name: event.target.value })} placeholder="Category name" />
          </label>
          <div className="ldg-cat-form-grid">
            <label>
              <span>Group</span>
              <select value={draft.group} onChange={event => onChange({ ...draft, group: event.target.value })}>
                {GROUPS.map(group => <option key={group}>{group}</option>)}
              </select>
            </label>
            <label>
              <span>Kind</span>
              <select value={draft.kind} onChange={event => onChange({ ...draft, kind: event.target.value as CategoryDraft['kind'] })}>
                {KINDS.map(kind => <option key={kind} value={kind}>{kind}</option>)}
              </select>
            </label>
          </div>
          <div className="ldg-cat-form-grid">
            <label>
              <span>Monthly planned</span>
              <input type="number" min="0" step="10" value={draft.budget} onChange={event => onChange({ ...draft, budget: event.target.value })} />
            </label>
            <label>
              <span>Icon</span>
              <input value={draft.icon} maxLength={4} onChange={event => onChange({ ...draft, icon: event.target.value })} />
            </label>
          </div>
          <div>
            <span className="ldg-cat-modal-label">Color</span>
            <div className="ldg-cat-color-row">
              {COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  className={draft.color === color ? 'active' : ''}
                  style={{ background: color }}
                  onClick={() => onChange({ ...draft, color })}
                  aria-label={`Use color ${color}`}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="ldg-cat-modal-footer">
          <button className="ldg-budget-secondary-btn" onClick={onClose}>Cancel</button>
          <button className="ldg-budget-primary-btn" onClick={onSave}>Save category</button>
        </div>
      </div>
    </div>
  );
}

export function CategoriesPage() {
  const categories = useLedgerlyStore(s => s.categories);
  const transactions = useLedgerlyStore(s => s.transactions);
  const bills = useLedgerlyStore(s => s.bills);
  const addCategory = useLedgerlyStore(s => s.addCategory);
  const updateCategory = useLedgerlyStore(s => s.updateCategory);
  const deleteCategory = useLedgerlyStore(s => s.deleteCategory);
  const setView = useLedgerlyStore(s => s.setView);

  const [search, setSearch] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<CategoryDraft>(emptyDraft);

  const categoryStats = useMemo(() => {
    const map = new Map<string, { actual: number; transactions: number; bills: number }>();
    for (const category of categories) map.set(category.name, { actual: 0, transactions: 0, bills: 0 });
    for (const transaction of transactions) {
      const stats = map.get(transaction.category) ?? { actual: 0, transactions: 0, bills: 0 };
      if (transaction.amount < 0) stats.actual += Math.abs(transaction.amount);
      stats.transactions += 1;
      map.set(transaction.category, stats);
    }
    for (const bill of bills) {
      const stats = map.get(bill.category) ?? { actual: 0, transactions: 0, bills: 0 };
      stats.bills += 1;
      map.set(bill.category, stats);
    }
    return map;
  }, [bills, categories, transactions]);

  const filtered = categories.filter(category => {
    if (!showArchived && category.archived) return false;
    const query = search.trim().toLowerCase();
    return !query
      || category.name.toLowerCase().includes(query)
      || (category.group ?? '').toLowerCase().includes(query)
      || (category.kind ?? '').toLowerCase().includes(query);
  });

  const grouped = filtered.reduce<Record<string, BudgetCategory[]>>((acc, category) => {
    const group = category.group ?? 'Other';
    (acc[group] ??= []).push(category);
    return acc;
  }, {});

  const openAdd = () => {
    setEditingId(null);
    setDraft(emptyDraft());
    setModalMode('add');
  };

  const openEdit = (category: BudgetCategory) => {
    setEditingId(category.id);
    setDraft(draftFromCategory(category));
    setModalMode('edit');
  };

  const saveDraft = () => {
    const name = draft.name.trim();
    const budget = Number(draft.budget);
    if (!name || !Number.isFinite(budget) || budget < 0) {
      window.alert('Please enter a category name and a valid planned amount.');
      return;
    }
    const payload = {
      name,
      budget,
      color: draft.color,
      group: draft.group,
      kind: draft.kind,
      icon: draft.icon.trim() || '📌',
      archived: false,
    };
    if (modalMode === 'edit' && editingId) updateCategory(editingId, payload);
    else addCategory(payload);
    setModalMode(null);
  };

  return (
    <div className="ldg-cat-page">
      <PageIntroBanner view="categories" />
      <header className="ldg-cat-header">
        <img src={sprig02} alt="" className="ldg-cat-header-sprig" />
        <div>
          <span className="ldg-budget-eyebrow">Shared category center</span>
          <h1>Categories <img src={heart04} alt="" /></h1>
          <p>Manage the labels Budget, Transactions, Bills, Reports, and Dashboard all share.</p>
        </div>
        <button className="ldg-budget-primary-btn" onClick={openAdd}>+ Add category</button>
      </header>

      <section className="ldg-cat-toolbar">
        <div className="ldg-txn-search-wrap">
          <span>⌕</span>
          <input className="ldg-txn-search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search categories..." />
        </div>
        <label className="ldg-cat-toggle">
          <input type="checkbox" checked={showArchived} onChange={event => setShowArchived(event.target.checked)} />
          Show archived
        </label>
        <button className="ldg-budget-secondary-btn" onClick={() => setView('budget')}>Open budget</button>
        <button className="ldg-budget-secondary-btn" onClick={() => setView('transactions')}>Open transactions</button>
      </section>

      <section className="ldg-cat-summary-grid">
        <article>
          <span>Total categories</span>
          <strong>{categories.filter(category => !category.archived).length}</strong>
          <img src={flower04} alt="" />
        </article>
        <article>
          <span>Planned monthly</span>
          <strong>{fmt(categories.filter(category => !category.archived).reduce((sum, category) => sum + category.budget, 0))}</strong>
        </article>
        <article>
          <span>Linked transactions</span>
          <strong>{transactions.length}</strong>
        </article>
      </section>

      <section className="ldg-cat-groups">
        {Object.keys(grouped).length === 0 ? (
          <div className="ldg-budget-empty-state">
            <img src={flower04} alt="" />
            <span className="ldg-budget-section-kicker">No matches</span>
            <h3>No categories match your search.</h3>
            <p>Clear the search or add a new category to keep organizing your plan.</p>
          </div>
        ) : Object.entries(grouped).map(([group, groupCategories]) => (
          <article className="ldg-cat-group-card" key={group}>
            <header>
              <div>
                <h2>{group}</h2>
                <p>{groupCategories.length} {groupCategories.length === 1 ? 'category' : 'categories'}</p>
              </div>
              <strong>{fmt(groupCategories.reduce((sum, category) => sum + category.budget, 0))}</strong>
            </header>
            <div className="ldg-cat-list">
              {groupCategories.map(category => {
                const stats = categoryStats.get(category.name) ?? { actual: 0, transactions: 0, bills: 0 };
                return (
                  <div className={`ldg-cat-row${category.archived ? ' is-archived' : ''}`} key={category.id}>
                    <div className="ldg-cat-identity">
                      <span style={{ background: category.color }}>{category.icon ?? '📌'}</span>
                      <div>
                        <strong>{category.name}</strong>
                        <small>{category.kind ?? 'other'} · {stats.transactions} txns · {stats.bills} bills</small>
                      </div>
                    </div>
                    <div className="ldg-cat-money">
                      <span>Planned</span>
                      <strong>{fmt(category.budget)}</strong>
                    </div>
                    <div className="ldg-cat-money">
                      <span>Actual</span>
                      <strong>{fmt(stats.actual)}</strong>
                    </div>
                    <div className="ldg-cat-actions">
                      <button onClick={() => openEdit(category)}>Edit</button>
                      <button onClick={() => updateCategory(category.id, { archived: !category.archived })}>
                        {category.archived ? 'Restore' : 'Archive'}
                      </button>
                      <button
                        className="danger"
                        onClick={() => window.confirm(`Delete "${category.name}"? Existing transactions keep their label.`) && deleteCategory(category.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </article>
        ))}
      </section>

      {modalMode && (
        <CategoryModal
          title={modalMode === 'edit' ? 'Edit category' : 'Add category'}
          draft={draft}
          onChange={setDraft}
          onClose={() => setModalMode(null)}
          onSave={saveDraft}
        />
      )}
    </div>
  );
}
