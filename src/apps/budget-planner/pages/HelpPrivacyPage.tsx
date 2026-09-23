import { useMemo, useRef, useState } from 'react';
import { PageIntroBanner } from '../components/PageIntroBanner';
import { useLedgerlyStore } from '../store/useLedgerlyStore';
import flower01 from '../../../assets/budget-assets/flowers-and-leaves/flowers-and-leaves-01.png';
import flower03 from '../../../assets/budget-assets/flowers-and-leaves/flowers-and-leaves-03.png';
import sprig01 from '../../../assets/budget-assets/botanical-sprigs/botanical-sprigs-01.png';
import sprig02 from '../../../assets/budget-assets/botanical-sprigs/botanical-sprigs-02.png';
import heart01 from '../../../assets/budget-assets/hearts/heart-01.png';

type HelpArticle = {
  id: string;
  title: string;
  summary: string;
  icon: IconName;
  tone: 'green' | 'blue' | 'orange';
  body: string[];
};

type IconName = 'article' | 'arrow' | 'shield' | 'keyboard' | 'print' | 'restore' | 'search' | 'tag' | 'message' | 'sync';
type Modal = { kind: 'article'; article: HelpArticle } | { kind: 'shortcuts' } | null;

const ARTICLES: HelpArticle[] = [
  {
    id: 'local-storage',
    title: 'How local storage works',
    summary: 'Your data is saved directly on this device using your browser\'s local storage.',
    icon: 'article',
    tone: 'blue',
    body: [
      'Ledgerly stores budget planner data in this browser on this device. It is not uploaded to a Ledgerly account or server.',
      'Because the data is local, clearing browser storage can remove your Ledgerly records. Export a backup before resetting your browser or moving devices.',
      'Use Data & Security to create a JSON backup whenever you want a copy you control.',
    ],
  },
  {
    id: 'export-backup',
    title: 'How to export a backup',
    summary: 'Save a copy of your data as a file to keep it safe or move it to another device.',
    icon: 'shield',
    tone: 'green',
    body: [
      'Open Data & Security and choose Export backup. Ledgerly downloads a readable JSON file with accounts, transactions, budgets, bills, goals, reports data, and security preferences.',
      'Keep the file somewhere safe. Anyone with access to the file can read the exported data.',
      'To restore, use Restore backup and select the Ledgerly JSON file.',
    ],
  },
  {
    id: 'sync-codes',
    title: 'How sync codes work',
    summary: 'Sync codes help you move data between devices on your local network.',
    icon: 'sync',
    tone: 'orange',
    body: [
      'Sync codes are a manual transfer helper. They do not create a cloud account and do not send your data to a Ledgerly server.',
      'For full device migration, a backup file is still the most complete option because it includes your full Ledgerly data set.',
      'If you enable sync-code support, treat generated codes like private financial data.',
    ],
  },
];

const ARTICLE_TINTS = ['ldg-stat-cream', 'ldg-stat-blush', 'ldg-stat-white'];
const ARTICLE_DECOS = [flower01, flower03, sprig02];
const ARTICLE_ICON_COLORS = [
  { bg: 'rgba(122,158,126,.15)', color: '#4a7060' },
  { bg: 'rgba(196,138,138,.15)', color: '#a05050' },
  { bg: 'rgba(196,163,90,.15)', color: '#8a6020' },
];
const QL_ICON_COLORS = [
  { bg: 'rgba(122,158,126,.12)', color: '#4a7060' },
  { bg: 'rgba(196,138,138,.12)', color: '#a05050' },
  { bg: 'rgba(107,158,196,.12)', color: '#3a6e96' },
];

function Icon({ name }: { name: IconName }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {name === 'article' && <><path {...common} d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path {...common} d="M14 2v6h6" /><path {...common} d="M8 13h8M8 17h5" /></>}
      {name === 'arrow' && <><path {...common} d="M5 12h14" /><path {...common} d="M13 6l6 6-6 6" /></>}
      {name === 'shield' && <><path {...common} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path {...common} d="M9 12l2 2 4-4" /></>}
      {name === 'keyboard' && <><rect {...common} x="3" y="5" width="18" height="14" rx="2" /><path {...common} d="M7 9h.01M11 9h.01M15 9h.01M7 13h10" /></>}
      {name === 'print' && <><path {...common} d="M6 9V3h12v6" /><path {...common} d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><path {...common} d="M6 14h12v7H6z" /></>}
      {name === 'restore' && <><path {...common} d="M3 12a9 9 0 1 0 3-6.7" /><path {...common} d="M3 4v5h5" /><path {...common} d="M12 8v5l3 2" /></>}
      {name === 'search' && <><circle {...common} cx="11" cy="11" r="7" /><path {...common} d="M20 20l-3.5-3.5" /></>}
      {name === 'tag' && <><path {...common} d="M20 10l-8.5 8.5a2 2 0 0 1-2.8 0L3 12.8V4h8.8L20 12.2a2 2 0 0 1 0 2.8z" /><path {...common} d="M7.5 7.5h.01" /></>}
      {name === 'message' && <><path {...common} d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" /></>}
      {name === 'sync' && <><path {...common} d="M21 12a9 9 0 0 1-15.4 6.4L3 16" /><path {...common} d="M3 12A9 9 0 0 1 18.4 5.6L21 8" /><path {...common} d="M3 21v-5h5M21 3v5h-5" /></>}
    </svg>
  );
}

function readBackupFile(file: File, onDone: (message: string) => void, importBackupData: (raw: unknown) => boolean) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const raw = JSON.parse(String(reader.result));
      if (!raw || typeof raw !== 'object' || !('version' in raw)) {
        onDone('This does not look like a Ledgerly backup.');
        return;
      }
      onDone(importBackupData(raw) ? 'Backup restored successfully.' : 'Could not restore backup.');
    } catch {
      onDone('Invalid backup file.');
    }
  };
  reader.readAsText(file);
}

export function HelpPrivacyPage() {
  const setView = useLedgerlyStore(s => s.setView);
  const importBackupData = useLedgerlyStore(s => s.importBackupData);
  const settings = useLedgerlyStore(s => s.securitySettings);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState<Modal>(null);
  const [status, setStatus] = useState('');

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return ARTICLES;
    return ARTICLES.filter(article => {
      const haystack = [article.title, article.summary, ...article.body].join(' ').toLowerCase();
      return haystack.includes(needle);
    });
  }, [query]);

  const ARTICLE_IDX = results.map(r => ARTICLES.indexOf(r));

  return (
    <div className="ldg-hlp-page">
      <PageIntroBanner view="help" />
      {/* Header */}
      <div className="ldg-hlp-header">
        <div>
          <div className="ldg-hlp-title">Help &amp; Privacy <img src={heart01} alt="" /></div>
          <div className="ldg-hlp-subtitle">Find answers and manage your data privacy.</div>
        </div>
      </div>

      {/* Search bar */}
      <div className="ldg-hlp-search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
        </svg>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search help articles..."
          aria-label="Search help articles"
        />
      </div>

      {/* Status */}
      {status && <div className="ldg-hlp-status">{status}</div>}

      {/* 3 article cards */}
      <div className="ldg-hlp-article-grid">
        {results.map((article, i) => {
          const origIdx = ARTICLE_IDX[i];
          const tint = ARTICLE_TINTS[origIdx % 3];
          const deco = ARTICLE_DECOS[origIdx % 3];
          const iconStyle = ARTICLE_ICON_COLORS[origIdx % 3];
          return (
            <button
              key={article.id}
              className={`ldg-stat-card ${tint} ldg-hlp-article-card`}
              onClick={() => setModal({ kind: 'article', article })}
            >
              <div className="ldg-hlp-article-icon" style={{ background: iconStyle.bg, color: iconStyle.color }}>
                <Icon name={article.icon} />
              </div>
              <div className="ldg-hlp-article-title">{article.title}</div>
              <div className="ldg-hlp-article-summary">{article.summary}</div>
              <div className="ldg-hlp-article-arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14" /><path d="M13 6l6 6-6 6" />
                </svg>
                →
              </div>
              <img src={deco} alt="" className="ldg-stat-deco" />
            </button>
          );
        })}
        {results.length === 0 && (
          <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '32px', color: 'var(--text3)', fontSize: '.85rem' }}>
            No articles found - try searching for backup, storage, privacy, or sync.
          </div>
        )}
      </div>

      {/* Privacy banner — full width */}
      <div className="ldg-hlp-privacy-card" style={{ marginBottom: 20 }}>
        <div className="ldg-hlp-privacy-icon">
          <Icon name="shield" />
        </div>
        <div style={{ flex: 1 }}>
          <div className="ldg-hlp-privacy-title">Your financial data stays on this device.</div>
          <div className="ldg-hlp-privacy-sub">Nothing is sent to any server.</div>
        </div>
        <img src={flower03} alt="" style={{ position: 'absolute', bottom: -4, right: 12, width: 90, height: 90, opacity: .55, pointerEvents: 'none' }} />
      </div>

      {/* Quick links */}
      <div className="ldg-hlp-ql-section">
        <div className="ldg-hlp-ql-title">
          <img src={sprig01} alt="" />
          Quick links
        </div>
        <div className="ldg-hlp-ql-grid">
          {[
            { icon: 'keyboard' as IconName, name: 'Keyboard shortcuts', desc: 'Speed up your workflow.', onClick: () => setModal({ kind: 'shortcuts' }) },
            { icon: 'restore' as IconName, name: 'Restore a backup', desc: 'Load a previous version of your data.', onClick: () => fileInputRef.current?.click() },
            { icon: 'print' as IconName, name: 'Print a report', desc: 'Create a clean, printable summary.', onClick: () => setView('reports') },
          ].map((ql, i) => (
            <button key={ql.name} className={`ldg-hlp-ql-card ${i === 0 ? 'ldg-stat-blush' : i === 1 ? 'ldg-stat-cream' : ''}`} onClick={ql.onClick}
              style={{ border: '1px solid var(--border)' }}>
              <div className="ldg-hlp-ql-icon" style={{ background: QL_ICON_COLORS[i].bg, color: QL_ICON_COLORS[i].color }}>
                <Icon name={ql.icon} />
              </div>
              <div className="ldg-hlp-ql-name">{ql.name}</div>
              <div className="ldg-hlp-ql-desc">{ql.desc}</div>
              <div className="ldg-hlp-ql-arrow">→</div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="ldg-hlp-footer">
        <span>Ledgerly 1.0</span>
        <span>Offline by default</span>
        <span>{settings.syncCodeEnabled ? 'Sync code helper enabled' : 'Local backup ready'}</span>
      </footer>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) readBackupFile(file, setStatus, importBackupData);
          e.currentTarget.value = '';
        }}
      />

      {/* Modal */}
      {modal && (
        <div className="security-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="security-modal help-modal">
            <div className="security-modal-header">
              <h2>{modal.kind === 'shortcuts' ? 'Keyboard shortcuts' : modal.article.title}</h2>
              <button onClick={() => setModal(null)} aria-label="Close">×</button>
            </div>
            {modal.kind === 'shortcuts' ? (
              <div className="security-help-list">
                <p><strong>Esc</strong> closes modals and menus.</p>
                <p><strong>Tab</strong> moves between controls.</p>
                <p><strong>Ctrl/Cmd + P</strong> prints reports or saves them as PDF.</p>
              </div>
            ) : (
              <div className="security-help-list">
                {modal.article.body.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
