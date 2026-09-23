import { useState } from 'react';
import type { LedgerlyView } from '../types';

const LS_KEY = 'ldg-page-intros';
const LS_HINTS_KEY = 'ldg-hints-enabled';

type IntroConfig = {
  emoji: string;
  title: string;
  description: string;
  tip: string;
  accentColor: string;
};

const PAGE_INTROS: Partial<Record<LedgerlyView, IntroConfig>> = {
  dashboard: {
    emoji: '🏠',
    title: 'Your Financial Overview',
    description: 'See your account balances, upcoming bills, spending vs budget and monthly cashflow - all at a glance.',
    tip: 'Add transactions daily to keep your numbers accurate.',
    accentColor: '#4a7060',
  },
  budget: {
    emoji: '📊',
    title: 'Your Budget Planner',
    description: 'Create a zero-based, 50/30/20, or pay-yourself-first budget. Assign every dollar a job and see what\'s left.',
    tip: 'Run the guided 4-step wizard to set up your income and spending categories.',
    accentColor: '#4a7060',
  },
  transactions: {
    emoji: '💳',
    title: 'Transaction Log',
    description: 'Every income and expense in one place, sorted by date. Your spending categories update automatically as you log entries.',
    tip: 'Use the filter bar to find transactions by category, account, or date range.',
    accentColor: '#3a6e96',
  },
  bills: {
    emoji: '📅',
    title: 'Recurring Bills',
    description: 'Track your bills by due date, see autopay status, and mark them paid. Never miss a payment or forget a recurring charge.',
    tip: 'Link a bill to a transaction to auto-mark it paid when you log the payment.',
    accentColor: '#8a6020',
  },
  accounts: {
    emoji: '🏦',
    title: 'Accounts & Balances',
    description: 'All your bank, credit card, savings, and asset accounts with running balances. Control which accounts appear in each report.',
    tip: 'Reconcile accounts monthly - tap the ✓ icon to confirm the balance matches your statement.',
    accentColor: '#3a6e96',
  },
  goals: {
    emoji: '🎯',
    title: 'Goals & Debt',
    description: 'Track savings goals and debt payoff plans in one place. Set a target amount, a date, and a monthly contribution.',
    tip: 'Watch the progress bar grow as you log contributions. Switch to the Debt Planner for avalanche or snowball strategies.',
    accentColor: '#7a6090',
  },
  networth: {
    emoji: '📈',
    title: 'Net Worth Tracker',
    description: 'Total assets minus liabilities, plotted over time. See your financial position grow month by month.',
    tip: 'A net worth snapshot is taken automatically each month when you visit this page.',
    accentColor: '#4a7060',
  },
  reports: {
    emoji: '📋',
    title: 'Reports & Charts',
    description: 'Spending breakdowns by category, income vs expenses, and month-over-month trends. Understand where your money actually goes.',
    tip: 'Use the date picker to compare any two months side by side.',
    accentColor: '#3a6e96',
  },
  categories: {
    emoji: '🗂️',
    title: 'Budget Categories',
    description: 'Create and organise the spending categories your budget uses. Assign colours, icons, and groups to keep things tidy.',
    tip: 'Archive categories you no longer need instead of deleting - your history stays intact.',
    accentColor: '#8a6020',
  },
  security: {
    emoji: '🔒',
    title: 'Data & Security',
    description: 'Manage your backup schedule, set up a PIN lock, adjust auto-lock timing, and choose your theme. Your data never leaves this device.',
    tip: 'Export a full JSON backup regularly - it restores everything including your history.',
    accentColor: '#4a7060',
  },
  help: {
    emoji: '💬',
    title: 'Help & Privacy',
    description: 'Answers to common questions, keyboard shortcuts, and your privacy rights. Ledgerly stores everything locally - nothing is ever sent to a server.',
    tip: 'Press Ctrl/Cmd+P to print or save any page as a PDF.',
    accentColor: '#7a6090',
  },
};

function getSeenPages(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, boolean>;
  } catch {
    return {};
  }
}

function markSeen(view: string) {
  try {
    const seen = getSeenPages();
    localStorage.setItem(LS_KEY, JSON.stringify({ ...seen, [view]: true }));
  } catch {
    // localStorage unavailable
  }
}

export function PageIntroBanner({ view }: { view: LedgerlyView }) {
  const config = PAGE_INTROS[view];
  const [dismissed, setDismissed] = useState(() => {
    if (localStorage.getItem(LS_HINTS_KEY) === 'false') return true;
    return getSeenPages()[view] === true;
  });

  if (!config || dismissed) return null;

  const dismiss = () => {
    markSeen(view);
    setDismissed(true);
  };

  return (
    <div
      className="ldg-intro-backdrop"
      onClick={dismiss}
      style={{ '--ldg-intro-accent': config.accentColor } as React.CSSProperties}
    >
      <div className="ldg-intro-dialog" onClick={e => e.stopPropagation()}>
        <div className="ldg-intro-dialog-accent" />
        <button className="ldg-intro-close" onClick={dismiss} aria-label="Close">×</button>

        <div className="ldg-intro-dialog-body">
          <div className="ldg-intro-icon-wrap" style={{ background: `${config.accentColor}18` }}>
            <span className="ldg-intro-icon">{config.emoji}</span>
          </div>
          <div className="ldg-intro-body">
            <div className="ldg-intro-title">{config.title}</div>
            <div className="ldg-intro-desc">{config.description}</div>
            <div className="ldg-intro-tip">
              <span className="ldg-intro-tip-chip">💡 Tip</span>
              {config.tip}
            </div>
          </div>
        </div>

        <div className="ldg-intro-dialog-footer">
          <button className="ldg-intro-dismiss" onClick={dismiss}>Got it ✓</button>
        </div>
      </div>
    </div>
  );
}
