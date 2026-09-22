import { useMemo, useRef, useState } from 'react';
import { useLedgerlyStore } from '../store/useLedgerlyStore';

type HelpArticle = {
  id: string;
  title: string;
  summary: string;
  icon: IconName;
  tone: 'green' | 'blue' | 'orange';
  body: string[];
};

type IconName = 'article' | 'arrow' | 'shield' | 'keyboard' | 'print' | 'restore' | 'mail' | 'search' | 'tag' | 'message' | 'sync';
type Modal = { kind: 'article'; article: HelpArticle } | { kind: 'shortcuts' } | null;

const ARTICLES: HelpArticle[] = [
  {
    id: 'local-storage',
    title: 'How local storage works',
    summary: 'Your data is stored directly on your device, keeping your information private and under your control.',
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
    summary: 'Learn how to create and save a backup of your data, and what is included in the export.',
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
    summary: 'Understand how manual sync codes help you move your data between devices without server sync.',
    icon: 'sync',
    tone: 'orange',
    body: [
      'Sync codes are a manual transfer helper. They do not create a cloud account and do not send your data to a Ledgerly server.',
      'For full device migration, a backup file is still the most complete option because it includes your full Ledgerly data set.',
      'If you enable sync-code support, treat generated codes like private financial data.',
    ],
  },
];

const TOPICS = ['Question', 'Bug report', 'Feature idea', 'Backup help', 'Privacy question'];

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
      {name === 'mail' && <><rect {...common} x="3" y="5" width="18" height="14" rx="2" /><path {...common} d="M3 7l9 6 9-6" /></>}
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
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return ARTICLES;
    return ARTICLES.filter(article => {
      const haystack = [article.title, article.summary, ...article.body].join(' ').toLowerCase();
      return haystack.includes(needle);
    });
  }, [query]);

  const openMailDraft = () => {
    setStatus('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStatus('Enter a valid email address before sending.');
      return;
    }
    if (!message.trim()) {
      setStatus('Add a short message before sending.');
      return;
    }
    const subject = encodeURIComponent(`Ledgerly ${topic}`);
    const body = encodeURIComponent(`From: ${email.trim()}\nTopic: ${topic}\n\n${message.trim()}`);
    window.location.href = `mailto:support@example.com?subject=${subject}&body=${body}`;
    setStatus('Opening your email app.');
  };

  return (
    <div className="help-page">
      <header className="help-header">
        <div>
          <h1>Help & privacy</h1>
          <p>Find answers, manage your data, and get in touch.</p>
        </div>
        <label className="help-search">
          <Icon name="search" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search help articles"
            aria-label="Search help articles"
          />
        </label>
      </header>

      {status && <div className="help-status">{status}</div>}

      <section className="help-article-grid" aria-label="Help articles">
        {results.map(article => (
          <button key={article.id} className="help-article-card" onClick={() => setModal({ kind: 'article', article })}>
            <span className={`help-card-icon ${article.tone}`}><Icon name={article.icon} /></span>
            <span className="help-card-copy">
              <strong>{article.title}</strong>
              <small>{article.summary}</small>
            </span>
            <span className="help-arrow"><Icon name="arrow" /></span>
          </button>
        ))}
        {results.length === 0 && (
          <div className="help-empty">
            <strong>No articles found</strong>
            <span>Try searching for backup, storage, privacy, or sync.</span>
          </div>
        )}
      </section>

      <div className="help-main-grid">
        <section className="help-privacy-panel">
          <div className="help-privacy-icon"><Icon name="shield" /></div>
          <div>
            <h2>Your financial data stays on this device.</h2>
            <p>Nothing is sent to any server. Backups and restores happen from files you choose.</p>
          </div>
        </section>

        <section className="help-quick-links">
          <h2>Quick links</h2>
          <button onClick={() => setModal({ kind: 'shortcuts' })}>
            <span><Icon name="keyboard" />Keyboard shortcuts</span>
            <Icon name="arrow" />
          </button>
          <button onClick={() => setView('reports')}>
            <span><Icon name="print" />Print a report</span>
            <Icon name="arrow" />
          </button>
          <button onClick={() => fileInputRef.current?.click()}>
            <span><Icon name="restore" />Restore a backup</span>
            <Icon name="arrow" />
          </button>
        </section>
      </div>

      <section className="help-contact-card">
        <div className="help-contact-intro">
          <span className="help-contact-icon"><Icon name="mail" /></span>
          <div>
            <h2>Contact / feedback</h2>
            <p>Have a question, found a bug, or have a suggestion? Send a message from your email app.</p>
          </div>
        </div>
        <div className="help-contact-form">
          <label>
            <Icon name="mail" />
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email address" type="email" />
          </label>
          <label>
            <Icon name="tag" />
            <select value={topic} onChange={e => setTopic(e.target.value)}>
              {TOPICS.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="help-message-field">
            <Icon name="message" />
            <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Your message" rows={5} />
          </label>
          <button className="help-send-btn" onClick={openMailDraft}>Send message</button>
        </div>
      </section>

      <footer className="help-footer">
        <span>Ledgerly 1.0</span>
        <span>Offline by default</span>
        <span>{settings.syncCodeEnabled ? 'Sync code helper enabled' : 'Local backup ready'}</span>
      </footer>

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

      {modal && (
        <div className="security-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="security-modal help-modal">
            <div className="security-modal-header">
              <h2>{modal.kind === 'shortcuts' ? 'Keyboard shortcuts' : modal.article.title}</h2>
              <button onClick={() => setModal(null)} aria-label="Close">x</button>
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
