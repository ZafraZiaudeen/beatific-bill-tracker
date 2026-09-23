import { useEffect, useRef, useState } from "react"
import { PageIntroBanner } from '../components/PageIntroBanner'
import type { BudgetCategory, BudgetMethod } from "../types"
import { useLedgerlyStore } from "../store/useLedgerlyStore"
import { fmt } from "../utils/formatters"
import { getAllBillOccurrencesForMonth } from "../utils/bills"
import flower01 from "../../../assets/budget-assets/flowers-and-leaves/flowers-and-leaves-01.png"
import sprig02 from "../../../assets/budget-assets/botanical-sprigs/botanical-sprigs-02.png"
import heart01 from "../../../assets/budget-assets/hearts/heart-01.png"
import sparkle04 from "../../../assets/budget-assets/sun-sparkles/sun-sparkles-04.png"
import stationery05 from "../../../assets/budget-assets/stationery-accents/stationery-accents-05.png"

const METHODS: { id: BudgetMethod; name: string; desc: string; tag: string }[] =
  [
    {
      id: "zero",
      name: "Zero-Based",
      desc: "Assign every dollar a purpose until income minus planned spending equals zero.",
      tag: "Most popular",
    },
    {
      id: "503020",
      name: "50/30/20",
      desc: "Split income into needs, wants, and savings with an easy-to-follow ratio.",
      tag: "Simple & effective",
    },
    {
      id: "paycheck",
      name: "Paycheck Plan",
      desc: "Plan each payday around the bills, goals, and spending it needs to fund.",
      tag: "Payday-focused",
    },
  ]

const GROUP_COLORS: Record<string, string> = {
  Housing: "#c4a35a",
  Food: "#c48a8a",
  Transport: "#9e8abe",
  Essentials: "#7a9e7e",
  Lifestyle: "#6b9ec4",
  Savings: "#5f8d68",
  Debt: "#e89e6e",
  Other: "#8a9e8b",
}

const STEPS = ["Profile", "Income plan", "Categories", "Ready"]

function monthRange(ym: string) {
  const [year, month] = ym.split("-").map(Number)
  const start = new Date(year, month - 1, 1)
  const end = new Date(year, month, 0)
  return { start, end }
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

function buildPaydays(
  firstPayday: string,
  currentMonth: string,
  cadence: "weekly" | "biweekly"
) {
  const { start, end } = monthRange(currentMonth)
  const step = cadence === "weekly" ? 7 : 14
  const seed = firstPayday ? new Date(`${firstPayday}T00:00:00`) : start
  const cursor = new Date(seed)

  while (cursor > start) cursor.setDate(cursor.getDate() - step)
  while (cursor < start) cursor.setDate(cursor.getDate() + step)

  const paydays: Date[] = []
  while (cursor <= end) {
    paydays.push(new Date(cursor))
    cursor.setDate(cursor.getDate() + step)
  }

  if (paydays.length === 0) paydays.push(start)
  return paydays
}

function formatShortDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="m4 10.5 3.6 3.5L16 6" />
    </svg>
  )
}

function ArrowIcon({ direction = "right" }: { direction?: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className={direction === "left" ? "ldg-budget-arrow-left" : undefined}
    >
      <path d="M4 10h12M11 5l5 5-5 5" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4 6h12M8 3h4l1 3H7l1-3Zm-2 3 1 11h6l1-11M9 9v5m2-5v5" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <rect x="3" y="5" width="14" height="12" rx="2" />
      <path d="M6 3v4m8-4v4M3 9h14" />
    </svg>
  )
}

function ProgressRing({ pct }: { pct: number }) {
  const safePct = Math.max(0, Math.min(100, pct))
  const radius = 39
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - safePct / 100)

  return (
    <svg
      className="ldg-budget-ring"
      viewBox="0 0 96 96"
      aria-label={`${Math.round(pct)}% allocated`}
    >
      <circle className="ldg-budget-ring-track" cx="48" cy="48" r={radius} />
      <circle
        className="ldg-budget-ring-fill"
        cx="48"
        cy="48"
        r={radius}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
      <text x="48" y="52" textAnchor="middle">
        {Math.round(pct)}%
      </text>
    </svg>
  )
}

function InlineCatInput({
  placeholder,
  onConfirm,
  onCancel,
}: {
  placeholder: string
  onConfirm: (name: string) => void
  onCancel: () => void
}) {
  const [value, setValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const submit = () => {
    const trimmed = value.trim()
    if (trimmed) onConfirm(trimmed)
  }

  return (
    <div className="ldg-budget-inline-form">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") submit()
          if (event.key === "Escape") onCancel()
        }}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      <button
        type="button"
        className="ldg-budget-icon-btn ldg-budget-icon-confirm"
        onClick={submit}
        disabled={!value.trim()}
        aria-label="Add category"
      >
        <CheckIcon />
      </button>
      <button
        type="button"
        className="ldg-budget-icon-btn"
        onClick={onCancel}
        aria-label="Cancel adding category"
      >
        ×
      </button>
    </div>
  )
}

function MethodCards({
  value,
  onChange,
  compact = false,
}: {
  value: BudgetMethod
  onChange: (method: BudgetMethod) => void
  compact?: boolean
}) {
  return (
    <div
      className={
        compact ? "ldg-budget-method-grid is-compact" : "ldg-budget-method-grid"
      }
    >
      {METHODS.map((method) => {
        const selected = value === method.id
        return (
          <button
            type="button"
            key={method.id}
            className={
              selected
                ? "ldg-budget-method-card is-selected"
                : "ldg-budget-method-card"
            }
            onClick={() => onChange(method.id)}
            aria-pressed={selected}
          >
            <span className="ldg-budget-method-topline">
              <span className="ldg-budget-method-radio" aria-hidden="true" />
              <span className="ldg-budget-method-name">{method.name}</span>
            </span>
            <span className="ldg-budget-method-desc">{method.desc}</span>
            <span className="ldg-budget-method-tag">{method.tag}</span>
          </button>
        )
      })}
    </div>
  )
}

function CategoryGroups({
  groups,
  unusedGroups,
  income,
  onUpdateCategory,
  onDeleteCategory,
  onAddCategory,
}: {
  groups: Record<string, BudgetCategory[]>
  unusedGroups: string[]
  income: number
  onUpdateCategory: (id: number, patch: { budget: number }) => void
  onDeleteCategory: (id: number, name: string) => void
  onAddCategory: (name: string, group: string) => void
}) {
  const [addingTo, setAddingTo] = useState<string | null>(null)
  const [newGroupName, setNewGroupName] = useState("")
  const [newGroupStep, setNewGroupStep] = useState<"group" | "category">(
    "group"
  )
  const newGroupRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (addingTo === "__new_group__" && newGroupStep === "group") {
      newGroupRef.current?.focus()
    }
  }, [addingTo, newGroupStep])

  const filteredUnused = unusedGroups.filter(
    (group) => !Object.keys(groups).includes(group)
  )

  const cancelCustomGroup = () => {
    setAddingTo(null)
    setNewGroupName("")
    setNewGroupStep("group")
  }

  return (
    <div className="ldg-budget-category-editor">
      {Object.entries(groups).map(([groupName, groupCategories]) => {
        const groupTotal = groupCategories.reduce(
          (sum, category) => sum + category.budget,
          0
        )
        const dotColor =
          GROUP_COLORS[groupName] ?? groupCategories[0]?.color ?? "#8a9e8b"

        return (
          <article className="ldg-budget-group-card" key={groupName}>
            <header className="ldg-budget-group-header">
              <span
                className="ldg-budget-group-mark"
                style={{ background: dotColor }}
              />
              <div>
                <h3>{groupName}</h3>
                <p>
                  {groupCategories.length}{" "}
                  {groupCategories.length === 1 ? "category" : "categories"}
                </p>
              </div>
              <strong>{fmt(groupTotal)}</strong>
            </header>

            <div className="ldg-budget-setup-category-list">
              {groupCategories.map((category) => {
                const categoryPct =
                  income > 0
                    ? Math.min(100, (category.budget / income) * 100)
                    : 0
                return (
                  <div className="ldg-budget-setup-category" key={category.id}>
                    <div className="ldg-budget-category-identity">
                      <span
                        className="ldg-budget-category-dot"
                        style={{ background: category.color }}
                      />
                      <div>
                        <span>{category.name}</span>
                        <small>{Math.round(categoryPct)}% of income</small>
                      </div>
                    </div>
                    <div className="ldg-budget-category-allocation">
                      <div className="ldg-budget-progress-track">
                        <span
                          style={{
                            width: `${categoryPct}%`,
                            background: category.color,
                          }}
                        />
                      </div>
                    </div>
                    <label className="ldg-budget-money-input ldg-budget-money-input-sm">
                      <span>$</span>
                      <input
                        type="number"
                        min="0"
                        step="10"
                        value={category.budget}
                        onChange={(event) => {
                          const nextValue = parseFloat(event.target.value)
                          if (!Number.isNaN(nextValue) && nextValue >= 0) {
                            onUpdateCategory(category.id, { budget: nextValue })
                          }
                        }}
                        aria-label={`${category.name} planned amount`}
                      />
                    </label>
                    <button
                      type="button"
                      className="ldg-budget-delete-btn"
                      onClick={() =>
                        onDeleteCategory(category.id, category.name)
                      }
                      aria-label={`Delete ${category.name}`}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                )
              })}
            </div>

            <div className="ldg-budget-group-add">
              {addingTo === groupName ? (
                <InlineCatInput
                  placeholder={`Category name in ${groupName}`}
                  onConfirm={(name) => {
                    onAddCategory(name, groupName)
                    setAddingTo(null)
                  }}
                  onCancel={() => setAddingTo(null)}
                />
              ) : (
                <button
                  type="button"
                  className="ldg-budget-add-link"
                  onClick={() => setAddingTo(groupName)}
                >
                  <span>+</span> Add category to {groupName}
                </button>
              )}
            </div>
          </article>
        )
      })}

      <section className="ldg-budget-add-group-card">
        <div className="ldg-budget-section-kicker">Add another group</div>
        <div className="ldg-budget-group-options">
          {filteredUnused.map((group) => (
            <div key={group}>
              {addingTo === `__predefined__${group}` ? (
                <InlineCatInput
                  placeholder={`First category in ${group}`}
                  onConfirm={(name) => {
                    onAddCategory(name, group)
                    setAddingTo(null)
                  }}
                  onCancel={() => setAddingTo(null)}
                />
              ) : (
                <button
                  type="button"
                  className="ldg-budget-group-option"
                  onClick={() => setAddingTo(`__predefined__${group}`)}
                >
                  <span style={{ background: GROUP_COLORS[group] }} /> + {group}
                </button>
              )}
            </div>
          ))}

          {addingTo === "__new_group__" ? (
            <div className="ldg-budget-custom-group">
              {newGroupStep === "group" ? (
                <>
                  <label htmlFor="budget-new-group">New group name</label>
                  <div className="ldg-budget-inline-form">
                    <input
                      id="budget-new-group"
                      ref={newGroupRef}
                      type="text"
                      value={newGroupName}
                      onChange={(event) => setNewGroupName(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && newGroupName.trim())
                          setNewGroupStep("category")
                        if (event.key === "Escape") cancelCustomGroup()
                      }}
                      placeholder="e.g. Education"
                    />
                    <button
                      type="button"
                      className="ldg-budget-icon-btn ldg-budget-icon-confirm"
                      onClick={() =>
                        newGroupName.trim() && setNewGroupStep("category")
                      }
                      disabled={!newGroupName.trim()}
                      aria-label="Continue to category name"
                    >
                      <ArrowIcon />
                    </button>
                    <button
                      type="button"
                      className="ldg-budget-icon-btn"
                      onClick={cancelCustomGroup}
                      aria-label="Cancel custom group"
                    >
                      ×
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <label>First category in {newGroupName}</label>
                  <InlineCatInput
                    placeholder="Category name"
                    onConfirm={(name) => {
                      onAddCategory(name, newGroupName.trim())
                      cancelCustomGroup()
                    }}
                    onCancel={cancelCustomGroup}
                  />
                </>
              )}
            </div>
          ) : (
            <button
              type="button"
              className="ldg-budget-group-option"
              onClick={() => {
                setAddingTo("__new_group__")
                setNewGroupName("")
                setNewGroupStep("group")
              }}
            >
              + Custom group
            </button>
          )}
        </div>
      </section>
    </div>
  )
}

export function BudgetPage() {
  const income = useLedgerlyStore((state) => state.income)
  const budgetMethod = useLedgerlyStore((state) => state.budgetMethod)
  const budgetSettings = useLedgerlyStore((state) => state.budgetSettings)
  const categories = useLedgerlyStore((state) => state.categories)
  const budgetConfigured = useLedgerlyStore((state) => state.budgetConfigured)
  const bills = useLedgerlyStore((state) => state.bills)
  const goals = useLedgerlyStore((state) => state.goals)
  const setView = useLedgerlyStore((state) => state.setView)
  const setIncome = useLedgerlyStore((state) => state.setIncome)
  const setBudgetMethod = useLedgerlyStore((state) => state.setBudgetMethod)
  const updateBudgetSettings = useLedgerlyStore(
    (state) => state.updateBudgetSettings
  )
  const setBudgetConfigured = useLedgerlyStore(
    (state) => state.setBudgetConfigured
  )
  const updateCategory = useLedgerlyStore((state) => state.updateCategory)
  const addCategory = useLedgerlyStore((state) => state.addCategory)
  const deleteCategory = useLedgerlyStore((state) => state.deleteCategory)
  const transactions = useLedgerlyStore((state) => state.transactions)
  const currentMonth = useLedgerlyStore((state) => state.currentMonth)

  const [step, setStep] = useState(1)
  const [incomeValue, setIncomeValue] = useState(String(income || ""))
  const [cadence, setCadence] = useState<"monthly" | "biweekly">("monthly")
  const [payday, setPayday] = useState(budgetSettings.firstPayday)
  const [showEditPanel, setShowEditPanel] = useState(false)
  const [editIncomeValue, setEditIncomeValue] = useState("")
  const [addingToManage, setAddingToManage] = useState<string | null>(null)
  const [activePaydayIndex, setActivePaydayIndex] = useState(0)

  const parsedIncome = parseFloat(incomeValue) || 0
  const totalBudget = categories.reduce(
    (sum, category) => sum + category.budget,
    0
  )
  const unassigned = (parsedIncome || income) - totalBudget
  const activeIncome = parsedIncome || income
  const allocationPct =
    activeIncome > 0 ? Math.min(100, (totalBudget / activeIncome) * 100) : 0
  const setupPaydays = buildPaydays(
    payday || budgetSettings.firstPayday,
    currentMonth,
    budgetSettings.paycheckCadence
  )

  const saveIncome = () => {
    const nextIncome = parseFloat(incomeValue)
    if (!Number.isNaN(nextIncome) && nextIncome >= 0 && nextIncome !== income)
      setIncome(nextIncome)
  }

  const groups: Record<string, BudgetCategory[]> = {}
  for (const category of categories) {
    const groupName = category.group ?? "Other"
    if (!groups[groupName]) groups[groupName] = []
    groups[groupName].push(category)
  }

  const unusedGroups = Object.keys(GROUP_COLORS).filter(
    (groupName) => !Object.keys(groups).includes(groupName)
  )

  const goNext = (nextStep: number) => {
    if (nextStep > 1) {
      saveIncome()
      if (payday) updateBudgetSettings({ firstPayday: payday })
    }
    setStep(nextStep)
  }

  const handleAddCategory = (name: string, group: string) => {
    addCategory({
      name,
      budget: 0,
      color: GROUP_COLORS[group] ?? "#8a9e8b",
      group,
    })
  }

  const handleDeleteCategory = (id: number, name: string) => {
    if (window.confirm(`Delete "${name}"?`)) deleteCategory(id)
  }

  const restartSetup = () => {
    setIncomeValue(String(income || ""))
    setBudgetConfigured(false)
    setStep(1)
  }

  const methodName =
    METHODS.find((method) => method.id === budgetMethod)?.name ?? ""

  if (budgetConfigured) {
    const manageTotalBudget = categories.reduce(
      (sum, category) => sum + category.budget,
      0
    )
    const manageUnassigned = income - manageTotalBudget
    const manageAllocationPct =
      income > 0 ? Math.min(100, (manageTotalBudget / income) * 100) : 0
    const manageGroups: Record<string, BudgetCategory[]> = {}

    for (const category of categories) {
      const groupName = category.group ?? "Other"
      if (!manageGroups[groupName]) manageGroups[groupName] = []
      manageGroups[groupName].push(category)
    }

    const spentMap: Record<string, number> = {}
    for (const transaction of transactions) {
      if (transaction.date.startsWith(currentMonth) && transaction.amount < 0) {
        spentMap[transaction.category] =
          (spentMap[transaction.category] ?? 0) + Math.abs(transaction.amount)
      }
    }

    const paydays = buildPaydays(
      budgetSettings.firstPayday,
      currentMonth,
      budgetSettings.paycheckCadence
    )
    const safeActivePaydayIndex = Math.min(activePaydayIndex, paydays.length - 1)
    const activePayday = paydays[safeActivePaydayIndex]
    const { end: monthEnd } = monthRange(currentMonth)
    const nextPayday = paydays[safeActivePaydayIndex + 1]
    const payPeriodEnd = nextPayday
      ? new Date(nextPayday.getFullYear(), nextPayday.getMonth(), nextPayday.getDate() - 1)
      : monthEnd
    const periodStartKey = toDateKey(activePayday)
    const periodEndKey = toDateKey(payPeriodEnd)
    const periodBillOccurrences = getAllBillOccurrencesForMonth(
      bills,
      currentMonth
    ).filter(
      (occurrence) =>
        occurrence.dueDate >= periodStartKey &&
        occurrence.dueDate <= periodEndKey
    )
    const periodTransactions = transactions.filter(
      (transaction) =>
        transaction.date >= periodStartKey && transaction.date <= periodEndKey
    )
    const periodIncome = income / Math.max(1, paydays.length)
    const periodBillTotal = periodBillOccurrences.reduce(
      (sum, occurrence) => sum + occurrence.bill.amount,
      0
    )
    const periodGoalTotal =
      goals.reduce((sum, goal) => sum + goal.monthlyContribution, 0) /
      Math.max(1, paydays.length)
    const periodActual = Math.abs(
      periodTransactions
        .filter((transaction) => transaction.amount < 0)
        .reduce((sum, transaction) => sum + transaction.amount, 0)
    )
    const periodPlanned = periodBillTotal + periodGoalTotal
    const periodAvailable = periodIncome - periodPlanned - periodActual

    return (
      <div className="ldg-budget-page">
        <PageIntroBanner view="budget" />
        <header className="ldg-budget-hero">
          <img src={stationery05} alt="" className="ldg-budget-hero-deco" />
          <div className="ldg-budget-hero-copy">
            <span className="ldg-budget-eyebrow">Monthly planning</span>
            <h1>
              Budget <img src={heart01} alt="" />
            </h1>
            <p>
              Give every dollar a thoughtful place and keep your month feeling
              beautifully balanced.
            </p>
          </div>
          <div className="ldg-budget-hero-actions">
            <span className="ldg-budget-method-pill">{methodName} method</span>
            <button
              type="button"
              className="ldg-budget-primary-btn"
              onClick={() => {
                setEditIncomeValue(String(income || ""))
                setShowEditPanel((current) => !current)
              }}
              aria-expanded={showEditPanel}
            >
              {showEditPanel ? "Close editor" : "Edit budget plan"}
            </button>
          </div>
        </header>

        {showEditPanel && (
          <section
            className="ldg-budget-plan-editor"
            aria-label="Edit budget plan"
          >
            <div className="ldg-budget-panel-heading">
              <div>
                <span className="ldg-budget-section-kicker">Plan settings</span>
                <h2>Shape your monthly plan</h2>
                <p>
                  Update your budgeting approach or monthly take-home income.
                </p>
              </div>
              <img src={sparkle04} alt="" />
            </div>
            <MethodCards
              value={budgetMethod}
              onChange={setBudgetMethod}
              compact
            />
            {budgetMethod === "paycheck" && (
              <div className="ldg-budget-paycheck-settings">
                <label className="ldg-budget-field">
                  <span>Pay cadence</span>
                  <select
                    value={budgetSettings.paycheckCadence}
                    onChange={(event) =>
                      updateBudgetSettings({
                        paycheckCadence: event.target.value as
                          | "weekly"
                          | "biweekly",
                      })
                    }
                  >
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                  </select>
                </label>
                <label className="ldg-budget-field">
                  <span>First payday</span>
                  <input
                    type="date"
                    value={budgetSettings.firstPayday}
                    onChange={(event) =>
                      updateBudgetSettings({ firstPayday: event.target.value })
                    }
                  />
                </label>
              </div>
            )}
            <div className="ldg-budget-editor-footer">
              <label className="ldg-budget-field">
                <span>Monthly take-home income</span>
                <span className="ldg-budget-money-input">
                  <span>$</span>
                  <input
                    type="number"
                    min="0"
                    value={editIncomeValue}
                    onChange={(event) => setEditIncomeValue(event.target.value)}
                    onBlur={() => {
                      const nextIncome = parseFloat(editIncomeValue)
                      if (!Number.isNaN(nextIncome) && nextIncome >= 0) {
                        setIncome(nextIncome)
                        setIncomeValue(String(nextIncome))
                      }
                    }}
                  />
                </span>
              </label>
              <button
                type="button"
                className="ldg-budget-primary-btn"
                onClick={() => setShowEditPanel(false)}
              >
                Save changes <CheckIcon />
              </button>
            </div>
          </section>
        )}

        <section
          className="ldg-budget-summary-grid"
          aria-label="Budget summary"
        >
          <article className="ldg-budget-summary-card is-cream">
            <div className="ldg-budget-summary-icon">
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path d="M3 6.5h14v9H3zM5 4h10v2.5M6 10h4" />
              </svg>
            </div>
            <span>Monthly income</span>
            <strong>{fmt(income)}</strong>
            <small>Take-home income</small>
            <img src={flower01} alt="" />
          </article>
          <article className="ldg-budget-summary-card is-white">
            <div className="ldg-budget-summary-icon">
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path d="M4 16V8m6 8V4m6 12v-6" />
              </svg>
            </div>
            <span>Planned</span>
            <strong>{fmt(manageTotalBudget)}</strong>
            <small>{Math.round(manageAllocationPct)}% of income assigned</small>
            <img src={sprig02} alt="" />
          </article>
          <article
            className={
              manageUnassigned < 0
                ? "ldg-budget-summary-card is-blush is-over"
                : "ldg-budget-summary-card is-blush"
            }
          >
            <div className="ldg-budget-summary-icon">
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <circle cx="10" cy="10" r="7" />
                <path d="M10 6v8M7.5 8h3.7a1.6 1.6 0 0 1 0 3.2H8.8a1.6 1.6 0 0 0 0 3.2h3.7" />
              </svg>
            </div>
            <span>{manageUnassigned < 0 ? "Over budget" : "Unassigned"}</span>
            <strong>{fmt(Math.abs(manageUnassigned))}</strong>
            <small>
              {manageUnassigned < 0
                ? "Reduce a few categories"
                : "Still available to assign"}
            </small>
            <img src={sparkle04} alt="" />
          </article>
        </section>

        <section className="ldg-budget-allocation-banner">
          <div className="ldg-budget-allocation-ring-wrap">
            <ProgressRing pct={manageAllocationPct} />
          </div>
          <div className="ldg-budget-allocation-copy">
            <span className="ldg-budget-section-kicker">
              Allocation check-in
            </span>
            <h2>
              {manageUnassigned === 0
                ? "Everything has a place."
                : "Your plan is taking shape."}
            </h2>
            <p>
              {manageUnassigned === 0
                ? "Your monthly income is fully assigned across your budget categories."
                : manageUnassigned > 0
                  ? `${fmt(manageUnassigned)} is ready to be assigned to a category.`
                  : `${fmt(Math.abs(manageUnassigned))} needs to be trimmed from the plan.`}
            </p>
          </div>
          <div className="ldg-budget-allocation-total">
            <span>Planned of income</span>
            <strong>
              {fmt(manageTotalBudget)} / {fmt(income)}
            </strong>
          </div>
        </section>

        {budgetMethod === "paycheck" && (
          <section className="ldg-budget-paycheck-panel">
            <div className="ldg-budget-section-heading">
              <div>
                <span className="ldg-budget-section-kicker">
                  Paycheck plan
                </span>
                <h2>Fund this month by payday</h2>
                <p>
                  See which bills, goals, and actual spending land in each pay
                  window.
                </p>
              </div>
              <span className="ldg-budget-count-pill">
                {budgetSettings.paycheckCadence === "weekly"
                  ? "Weekly"
                  : "Bi-weekly"}
              </span>
            </div>

            <div className="ldg-budget-payday-tabs" role="tablist">
              {paydays.map((paydayDate, index) => (
                <button
                  type="button"
                  key={toDateKey(paydayDate)}
                  className={index === safeActivePaydayIndex ? "active" : ""}
                  onClick={() => setActivePaydayIndex(index)}
                  role="tab"
                  aria-selected={index === safeActivePaydayIndex}
                >
                  Payday {index + 1}
                  <span>{formatShortDate(paydayDate)}</span>
                </button>
              ))}
            </div>

            <div className="ldg-budget-paycheck-grid">
              {[
                ["Pay period income", periodIncome],
                ["Bills funded", periodBillTotal],
                ["Goal funding", periodGoalTotal],
                ["Actual spending", periodActual],
                ["Available", periodAvailable],
              ].map(([label, value]) => (
                <article
                  key={label}
                  className={
                    Number(value) < 0
                      ? "ldg-budget-paycheck-stat is-negative"
                      : "ldg-budget-paycheck-stat"
                  }
                >
                  <span>{label}</span>
                  <strong>{fmt(Math.abs(Number(value)))}</strong>
                </article>
              ))}
            </div>

            <div className="ldg-budget-paycheck-lists">
              <article>
                <h3>
                  Bills from {formatShortDate(activePayday)} to{" "}
                  {formatShortDate(payPeriodEnd)}
                </h3>
                {periodBillOccurrences.length === 0 ? (
                  <p>No bills due in this pay window.</p>
                ) : (
                  periodBillOccurrences.map((occurrence) => (
                    <div key={`${occurrence.bill.id}-${occurrence.dueDate}`} className="ldg-budget-paycheck-row">
                      <span>{occurrence.bill.icon} {occurrence.bill.name}</span>
                      <strong>{fmt(occurrence.bill.amount)}</strong>
                    </div>
                  ))
                )}
              </article>
              <article>
                <h3>Goals funded by this paycheck</h3>
                {goals.filter((goal) => goal.monthlyContribution > 0).length ===
                0 ? (
                  <p>No monthly goal contributions yet.</p>
                ) : (
                  goals
                    .filter((goal) => goal.monthlyContribution > 0)
                    .map((goal) => (
                      <div key={goal.id} className="ldg-budget-paycheck-row">
                        <span>{goal.icon} {goal.name}</span>
                        <strong>
                          {fmt(goal.monthlyContribution / Math.max(1, paydays.length))}
                        </strong>
                      </div>
                    ))
                )}
              </article>
            </div>
          </section>
        )}

        <section className="ldg-budget-categories-section">
          <div className="ldg-budget-section-heading">
            <div>
              <span className="ldg-budget-section-kicker">
                Your spending plan
              </span>
              <h2>Budget categories</h2>
              <p>
                Adjust planned amounts and see how this month’s spending is
                tracking.
              </p>
            </div>
            <span className="ldg-budget-count-pill">
              {categories.length}{" "}
              {categories.length === 1 ? "category" : "categories"}
            </span>
          </div>

          {Object.keys(manageGroups).length > 0 ? (
            <div className="ldg-budget-manage-groups">
              {Object.entries(manageGroups).map(
                ([groupName, groupCategories]) => {
                  const groupBudget = groupCategories.reduce(
                    (sum, category) => sum + category.budget,
                    0
                  )
                  const groupSpent = groupCategories.reduce(
                    (sum, category) =>
                      sum + (spentMap[category.name] ?? 0),
                    0
                  )
                  const groupColor =
                    GROUP_COLORS[groupName] ??
                    groupCategories[0]?.color ??
                    "#8a9e8b"

                  return (
                    <article className="ldg-budget-manage-card" key={groupName}>
                      <header className="ldg-budget-manage-header">
                        <div className="ldg-budget-manage-title">
                          <span style={{ background: groupColor }} />
                          <div>
                            <h3>{groupName}</h3>
                            <p>
                              {groupCategories.length}{" "}
                              {groupCategories.length === 1
                                ? "category"
                                : "categories"}
                            </p>
                          </div>
                        </div>
                        <div className="ldg-budget-group-totals">
                          <span>
                            <small>Planned</small>
                            {fmt(groupBudget)}
                          </span>
                          <span>
                            <small>Spent</small>
                            {fmt(groupSpent)}
                          </span>
                        </div>
                      </header>

                      <div
                        className="ldg-budget-manage-labels"
                        aria-hidden="true"
                      >
                        <span>Category</span>
                        <span>Planned</span>
                        <span>Spent</span>
                        <span>Available</span>
                        <span>Progress</span>
                        <span />
                      </div>

                      <div className="ldg-budget-manage-list">
                        {groupCategories.map((category) => {
                          const spent = spentMap[category.name] ?? 0
                          const available = category.budget - spent
                          const progress =
                            category.budget > 0
                              ? Math.min(100, (spent / category.budget) * 100)
                              : 0

                          return (
                            <div
                              className="ldg-budget-manage-row"
                              key={category.id}
                            >
                              <div
                                className="ldg-budget-manage-name"
                                data-label="Category"
                              >
                                <span style={{ background: category.color }} />
                                <strong>{category.name}</strong>
                              </div>
                              <div data-label="Planned">
                                <label className="ldg-budget-money-input ldg-budget-money-input-sm">
                                  <span>$</span>
                                  <input
                                    type="number"
                                    min="0"
                                    step="10"
                                    value={category.budget}
                                    onChange={(event) => {
                                      const nextValue = parseFloat(
                                        event.target.value
                                      )
                                      if (
                                        !Number.isNaN(nextValue) &&
                                        nextValue >= 0
                                      ) {
                                        updateCategory(category.id, {
                                          budget: nextValue,
                                        })
                                      }
                                    }}
                                    aria-label={`${category.name} planned amount`}
                                  />
                                </label>
                              </div>
                              <strong
                                className="ldg-budget-manage-value"
                                data-label="Spent"
                              >
                                {fmt(spent)}
                              </strong>
                              <strong
                                className={
                                  available < 0
                                    ? "ldg-budget-manage-value is-negative"
                                    : "ldg-budget-manage-value is-positive"
                                }
                                data-label="Available"
                              >
                                {fmt(available)}
                              </strong>
                              <div
                                className="ldg-budget-manage-progress"
                                data-label="Progress"
                              >
                                <div className="ldg-budget-progress-track">
                                  <span
                                    style={{
                                      width: `${progress}%`,
                                      background: category.color,
                                    }}
                                  />
                                </div>
                                <small>{Math.round(progress)}%</small>
                              </div>
                              <button
                                type="button"
                                className="ldg-budget-delete-btn"
                                onClick={() =>
                                  handleDeleteCategory(
                                    category.id,
                                    category.name
                                  )
                                }
                                aria-label={`Delete ${category.name}`}
                              >
                                <TrashIcon />
                              </button>
                            </div>
                          )
                        })}
                      </div>

                      <div className="ldg-budget-manage-add">
                        {addingToManage === groupName ? (
                          <InlineCatInput
                            placeholder={`Category name in ${groupName}`}
                            onConfirm={(name) => {
                              handleAddCategory(name, groupName)
                              setAddingToManage(null)
                            }}
                            onCancel={() => setAddingToManage(null)}
                          />
                        ) : (
                          <button
                            type="button"
                            className="ldg-budget-add-link"
                            onClick={() => setAddingToManage(groupName)}
                          >
                            <span>+</span> Add category to {groupName}
                          </button>
                        )}
                      </div>
                    </article>
                  )
                }
              )}
            </div>
          ) : (
            <div className="ldg-budget-empty-state">
              <img src={flower01} alt="" />
              <span className="ldg-budget-section-kicker">A fresh page</span>
              <h3>Your budget is ready for its first category.</h3>
              <p>
                Run the guided setup again to add spending groups and create
                your plan.
              </p>
              <button
                type="button"
                className="ldg-budget-primary-btn"
                onClick={restartSetup}
              >
                Start guided setup <ArrowIcon />
              </button>
            </div>
          )}
        </section>

        <footer className="ldg-budget-page-footer">
          <button
            type="button"
            className="ldg-budget-secondary-btn"
            onClick={restartSetup}
          >
            Re-run setup wizard
          </button>
          <button
            type="button"
            className="ldg-budget-primary-btn"
            onClick={() => setView("dashboard")}
          >
            Open dashboard <ArrowIcon />
          </button>
        </footer>
      </div>
    )
  }

  return (
    <div className="ldg-budget-setup-page">
      <header className="ldg-budget-setup-hero">
        <img src={flower01} alt="" className="ldg-budget-setup-flower" />
        <img src={sparkle04} alt="" className="ldg-budget-setup-sparkle" />
        <span className="ldg-budget-eyebrow">A plan for your priorities</span>
        <h1>
          Build your budget <img src={heart01} alt="" />
        </h1>
        <p>
          A calm, guided setup to help every dollar support the life you’re
          creating.
        </p>
      </header>

      <nav className="ldg-budget-stepper" aria-label="Budget setup progress">
        {STEPS.map((label, index) => {
          const stepNumber = index + 1
          const isComplete = step > stepNumber
          const isActive = step === stepNumber
          return (
            <div className="ldg-budget-step-wrap" key={label}>
              <button
                type="button"
                className={[
                  "ldg-budget-step",
                  isActive ? "is-active" : "",
                  isComplete ? "is-complete" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => isComplete && setStep(stepNumber)}
                disabled={!isComplete && !isActive}
                aria-current={isActive ? "step" : undefined}
              >
                <span>{isComplete ? <CheckIcon /> : stepNumber}</span>
                <small>{label}</small>
              </button>
              {index < STEPS.length - 1 && (
                <span
                  className={
                    isComplete
                      ? "ldg-budget-step-line is-complete"
                      : "ldg-budget-step-line"
                  }
                />
              )}
            </div>
          )
        })}
      </nav>

      {step === 1 && (
        <main className="ldg-budget-wizard-panel">
          <div className="ldg-budget-wizard-heading">
            <span className="ldg-budget-section-kicker">Step 1 of 4</span>
            <h2>Choose a rhythm that feels right</h2>
            <p>
              Start with a budgeting method, then tell us what you bring home
              and when you’re paid.
            </p>
          </div>

          <section className="ldg-budget-wizard-card">
            <div className="ldg-budget-card-heading">
              <h3>Budgeting method</h3>
              <p>You can change this later without losing your categories.</p>
            </div>
            <MethodCards value={budgetMethod} onChange={setBudgetMethod} />

            <div className="ldg-budget-profile-grid">
              <div className="ldg-budget-income-block">
                <label className="ldg-budget-field">
                  <span>Take-home income</span>
                  <span
                    className="ldg-budget-cadence-toggle"
                    role="group"
                    aria-label="Income cadence"
                  >
                    <button
                      type="button"
                      className={cadence === "monthly" ? "is-active" : ""}
                      onClick={() => setCadence("monthly")}
                    >
                      Monthly
                    </button>
                    <button
                      type="button"
                      className={cadence === "biweekly" ? "is-active" : ""}
                      onClick={() => {
                        setCadence("biweekly")
                        updateBudgetSettings({ paycheckCadence: "biweekly" })
                      }}
                    >
                      Bi-weekly
                    </button>
                  </span>
                  <span className="ldg-budget-money-input">
                    <span>$</span>
                    <input
                      type="number"
                      min="0"
                      value={incomeValue}
                      onChange={(event) => setIncomeValue(event.target.value)}
                      onBlur={saveIncome}
                      placeholder="0"
                    />
                  </span>
                </label>
                {cadence === "biweekly" && parsedIncome > 0 && (
                  <small className="ldg-budget-field-note">
                    ≈ {fmt((parsedIncome * 26) / 12)} per month
                  </small>
                )}
              </div>

              <label className="ldg-budget-field">
                <span>Next payday</span>
                <span className="ldg-budget-date-input">
                  <CalendarIcon />
                  <input
                    type="date"
                    value={payday}
                    onChange={(event) => {
                      setPayday(event.target.value)
                      updateBudgetSettings({ firstPayday: event.target.value })
                    }}
                  />
                </span>
              </label>

              <aside className="ldg-budget-preview-card">
                <img src={sprig02} alt="" />
                <span className="ldg-budget-section-kicker">
                  Your first plan
                </span>
                <h4>A gentle starting point</h4>
                <ul>
                  <li>
                    <CheckIcon /> Income:{" "}
                    {parsedIncome > 0 ? fmt(parsedIncome) : "Not set"}
                  </li>
                  <li>
                    <CheckIcon /> {categories.length} spending categories
                  </li>
                  <li>
                    <CheckIcon /> {methodName} method
                  </li>
                  <li>
                    <CheckIcon />{" "}
                    {cadence === "monthly" ? "Monthly" : "Bi-weekly"} cadence
                  </li>
                </ul>
              </aside>
            </div>
          </section>

          <div className="ldg-budget-wizard-footer is-end">
            <button
              type="button"
              className="ldg-budget-primary-btn"
              onClick={() => goNext(2)}
            >
              Continue to income plan <ArrowIcon />
            </button>
          </div>
        </main>
      )}

      {step === 2 && (
        <main className="ldg-budget-wizard-panel">
          <div className="ldg-budget-wizard-heading">
            <span className="ldg-budget-section-kicker">Step 2 of 4</span>
            <h2>See the shape of your income</h2>
            <p>
              Your {methodName} plan turns {fmt(activeIncome)} into a clear
              monthly guide.
            </p>
          </div>

          <section className="ldg-budget-wizard-card">
            <div className="ldg-budget-income-plan-grid">
              {budgetMethod === "503020" ? (
                <>
                  <div className="ldg-budget-plan-tile is-sage">
                    <span>50%</span>
                    <h3>Needs</h3>
                    <p>Housing, food and transport</p>
                    <strong>{fmt(activeIncome * 0.5)}</strong>
                  </div>
                  <div className="ldg-budget-plan-tile is-blush">
                    <span>30%</span>
                    <h3>Wants</h3>
                    <p>Dining and entertainment</p>
                    <strong>{fmt(activeIncome * 0.3)}</strong>
                  </div>
                  <div className="ldg-budget-plan-tile is-lavender">
                    <span>20%</span>
                    <h3>Future you</h3>
                    <p>Savings and debt repayment</p>
                    <strong>{fmt(activeIncome * 0.2)}</strong>
                  </div>
                </>
              ) : budgetMethod === "paycheck" ? (
                <>
                  <div className="ldg-budget-plan-tile is-sage">
                    <span>{setupPaydays.length}</span>
                    <h3>Paydays</h3>
                    <p>Funding windows this month</p>
                    <strong>{budgetSettings.paycheckCadence}</strong>
                  </div>
                  <div className="ldg-budget-plan-tile is-cream">
                    <span>
                      {activeIncome > 0 && setupPaydays.length > 0
                        ? Math.round(activeIncome / setupPaydays.length / 100) /
                          10
                        : 0}
                      k
                    </span>
                    <h3>Per paycheck</h3>
                    <p>Estimated income per funding window</p>
                    <strong>
                      {fmt(activeIncome / Math.max(1, setupPaydays.length))}
                    </strong>
                  </div>
                  <div
                    className={
                      unassigned < 0
                        ? "ldg-budget-plan-tile is-warning"
                        : "ldg-budget-plan-tile is-blush"
                    }
                  >
                    <span>
                      {activeIncome > 0
                        ? Math.round((unassigned / activeIncome) * 100)
                        : 0}
                      %
                    </span>
                    <h3>Unallocated</h3>
                    <p>Still waiting for a purpose this month</p>
                    <strong>{fmt(Math.abs(unassigned))}</strong>
                  </div>
                </>
              ) : (
                <>
                  <div className="ldg-budget-plan-tile is-cream">
                    <span>100%</span>
                    <h3>Income</h3>
                    <p>Total ready to assign</p>
                    <strong>{fmt(activeIncome)}</strong>
                  </div>
                  <div className="ldg-budget-plan-tile is-sage">
                    <span>
                      {activeIncome > 0
                        ? Math.round((totalBudget / activeIncome) * 100)
                        : 0}
                      %
                    </span>
                    <h3>Planned</h3>
                    <p>Already assigned</p>
                    <strong>{fmt(totalBudget)}</strong>
                  </div>
                  <div
                    className={
                      unassigned < 0
                        ? "ldg-budget-plan-tile is-warning"
                        : "ldg-budget-plan-tile is-blush"
                    }
                  >
                    <span>
                      {activeIncome > 0
                        ? Math.max(
                            0,
                            Math.round((unassigned / activeIncome) * 100)
                          )
                        : 0}
                      %
                    </span>
                    <h3>{unassigned < 0 ? "Over plan" : "Unassigned"}</h3>
                    <p>
                      {unassigned < 0
                        ? "Needs a little trimming"
                        : "Ready for a purpose"}
                    </p>
                    <strong>{fmt(Math.abs(unassigned))}</strong>
                  </div>
                </>
              )}
            </div>
            <div className="ldg-budget-plan-note">
              <img src={stationery05} alt="" />
              <p>
                <strong>A budget is a guide, not a restriction.</strong> You’ll
                fine-tune these amounts in the next step.
              </p>
            </div>
          </section>

          <div className="ldg-budget-wizard-footer">
            <button
              type="button"
              className="ldg-budget-secondary-btn"
              onClick={() => setStep(1)}
            >
              <ArrowIcon direction="left" /> Back
            </button>
            <button
              type="button"
              className="ldg-budget-primary-btn"
              onClick={() => goNext(3)}
            >
              Set category targets <ArrowIcon />
            </button>
          </div>
        </main>
      )}

      {step === 3 && (
        <main className="ldg-budget-wizard-panel is-wide">
          <div className="ldg-budget-wizard-heading">
            <span className="ldg-budget-section-kicker">Step 3 of 4</span>
            <h2>Give your spending a home</h2>
            <p>
              Adjust each target so your plan reflects the month you actually
              want to live.
            </p>
          </div>

          <section
            className={
              unassigned < 0
                ? "ldg-budget-status-strip is-warning"
                : "ldg-budget-status-strip"
            }
          >
            <div>
              <span>Income</span>
              <strong>{fmt(activeIncome)}</strong>
            </div>
            <div>
              <span>Planned</span>
              <strong>{fmt(totalBudget)}</strong>
            </div>
            <div>
              <span>{unassigned < 0 ? "Over budget" : "Unassigned"}</span>
              <strong>{fmt(Math.abs(unassigned))}</strong>
            </div>
            <div className="ldg-budget-status-progress">
              <span>{Math.round(allocationPct)}% allocated</span>
              <div className="ldg-budget-progress-track">
                <span style={{ width: `${allocationPct}%` }} />
              </div>
            </div>
          </section>

          <CategoryGroups
            groups={groups}
            unusedGroups={unusedGroups}
            income={activeIncome}
            onUpdateCategory={(id, patch) => updateCategory(id, patch)}
            onDeleteCategory={handleDeleteCategory}
            onAddCategory={handleAddCategory}
          />

          {categories.length === 0 && (
            <div className="ldg-budget-inline-empty">
              Choose a group above and add your first category to get started.
            </div>
          )}

          <div className="ldg-budget-wizard-footer">
            <button
              type="button"
              className="ldg-budget-secondary-btn"
              onClick={() => setStep(2)}
            >
              <ArrowIcon direction="left" /> Back
            </button>
            <button
              type="button"
              className="ldg-budget-primary-btn"
              onClick={() => goNext(4)}
            >
              Review your plan <ArrowIcon />
            </button>
          </div>
        </main>
      )}

      {step === 4 && (
        <main className="ldg-budget-wizard-panel">
          <div className="ldg-budget-wizard-heading is-centered">
            <span className="ldg-budget-section-kicker">Step 4 of 4</span>
            <h2>Your thoughtful plan is ready</h2>
            <p>
              Take one last look, then open your dashboard and put the plan into
              practice.
            </p>
          </div>

          <section className="ldg-budget-ready-card">
            <img src={flower01} alt="" className="ldg-budget-ready-flower" />
            <div className="ldg-budget-ready-summary">
              <div className="ldg-budget-ready-ring">
                <ProgressRing pct={allocationPct} />
              </div>
              <div>
                <span className="ldg-budget-section-kicker">
                  Monthly allocation
                </span>
                <h3>{fmt(totalBudget)} planned</h3>
                <p>of {fmt(activeIncome)} monthly income</p>
              </div>
            </div>

            <div className="ldg-budget-ready-details">
              {[
                ["Budgeting method", methodName],
                ["Monthly income", fmt(activeIncome)],
                ["Total planned", fmt(totalBudget)],
                [
                  "Budget balance",
                  unassigned === 0
                    ? "Perfectly balanced"
                    : unassigned > 0
                      ? `${fmt(unassigned)} unassigned`
                      : `${fmt(Math.abs(unassigned))} over budget`,
                ],
                [
                  "Categories",
                  `${categories.length} across ${Object.keys(groups).length} ${Object.keys(groups).length === 1 ? "group" : "groups"}`,
                ],
              ].map(([label, value]) => (
                <div className="ldg-budget-ready-row" key={label}>
                  <span className="ldg-budget-ready-check">
                    <CheckIcon />
                  </span>
                  <span>
                    <small>{label}</small>
                    <strong>{value}</strong>
                  </span>
                </div>
              ))}
            </div>

            {Object.keys(groups).length > 0 && (
              <div className="ldg-budget-breakdown">
                <h4>Breakdown by group</h4>
                {Object.entries(groups).map(([groupName, groupCategories]) => {
                  const groupTotal = groupCategories.reduce(
                    (sum, category) => sum + category.budget,
                    0
                  )
                  const groupPct =
                    activeIncome > 0
                      ? Math.min(100, (groupTotal / activeIncome) * 100)
                      : 0
                  return (
                    <div className="ldg-budget-breakdown-row" key={groupName}>
                      <span>{groupName}</span>
                      <div className="ldg-budget-progress-track">
                        <span
                          style={{
                            width: `${groupPct}%`,
                            background: GROUP_COLORS[groupName] ?? "#8a9e8b",
                          }}
                        />
                      </div>
                      <strong>{fmt(groupTotal)}</strong>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          <div className="ldg-budget-wizard-footer">
            <button
              type="button"
              className="ldg-budget-secondary-btn"
              onClick={() => setStep(3)}
            >
              <ArrowIcon direction="left" /> Back
            </button>
            <button
              type="button"
              className="ldg-budget-primary-btn"
              onClick={() => {
                setBudgetConfigured(true)
                setView("dashboard")
              }}
            >
              Open dashboard <ArrowIcon />
            </button>
          </div>
        </main>
      )}
    </div>
  )
}
