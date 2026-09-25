import { useContentCalendarStore } from './store';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Pipeline from './pages/Pipeline';
import Ideas from './pages/Ideas';
import MediaLibrary from './pages/MediaLibrary';
import Composer from './pages/Composer';
import Templates from './pages/Templates';
import Campaigns from './pages/Campaigns';
import Hashtags from './pages/Hashtags';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

import type { ContentCalendarView } from './types';
import underlineImg from '../../assets/budget-assets/stationery-accents/stationery-accents-02.png';

const CC_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Caveat:wght@400;600;700&display=swap');

.cc-app {
  display: flex;
  min-height: 100%;
  background: #f9f5f0;
  font-family: 'Nunito', -apple-system, sans-serif;
  color: #3d2f2f;
}

.cc-sidebar {
  width: 190px;
  flex-shrink: 0;
  background: #f3ede6;
  border-right: 1px solid #ece4da;
  display: flex;
  flex-direction: column;
  padding: 0 0 16px;
  overflow-y: auto;
}

.cc-sidebar-logo {
  padding: 20px 20px 38px;
  margin-bottom: 8px;
}

.cc-sidebar-logo-title {
  font-size: 22px;
  font-weight: 700;
  color: #3d2f2f;
  line-height: 1.15;
  font-family: 'Caveat', cursive;
}

.cc-nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 15px;
  font-size: 13px;
  font-weight: 500;
  color: #6b5a52;
  cursor: pointer;
  border: none;
  background: transparent;
  width: calc(100% - 24px);
  margin: 2px 12px;
  text-align: left;
  border-radius: 7px;
  transition: background 0.12s, color 0.12s;
}

.cc-nav-item:hover {
  background: #ece4da;
  color: #3d2f2f;
}

.cc-nav-item.active {
  background: #fce8e3;
  color: #3d2f2f;
  font-weight: 700;
}

.cc-sidebar-footer {
  margin-top: auto;
  padding: 12px 16px 0;
}

.cc-local-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  background: #fff;
  border: 1px solid #ece4da;
  border-radius: 99px;
  font-size: 10.5px;
  color: #8a7a72;
  white-space: nowrap;
}

.cc-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.cc-header {
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 22px 14px;
  border-bottom: 1px solid #ece4da;
}

.cc-header-left {
  flex-shrink: 0;
}

.cc-header-title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 28px;
  font-weight: 400;
  color: #3d2f2f;
  line-height: 1.15;
  margin: 0;
}

.cc-header-title-row2 {
  display: flex;
  align-items: center;
  gap: 6px;
}

.cc-header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  flex-shrink: 0;
}

.cc-header-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cc-date-range {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b5a52;
  font-weight: 500;
}

.cc-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cc-search {
  display: flex;
  align-items: center;
  gap: 7px;
  background: #fff;
  border: 1px solid #ece4da;
  border-radius: 8px;
  padding: 6px 11px;
  font-size: 12px;
  color: #8a7a72;
  width: 200px;
}

.cc-filter-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: #fff;
  border: 1px solid #ece4da;
  border-radius: 8px;
  font-size: 11.5px;
  color: #6b5a52;
  cursor: pointer;
  font-weight: 500;
  white-space: nowrap;
}

.cc-create-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 13px;
  background: #c17b6a;
  border: none;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  white-space: nowrap;
}

.cc-create-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  background: #fff;
  border: 1px solid #ece4da;
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.10);
  min-width: 140px;
  z-index: 100;
  overflow: hidden;
}

.cc-create-dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px;
  font-size: 13px;
  color: #3d2f2f;
  cursor: pointer;
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
}

.cc-create-dropdown-item:hover {
  background: #f9f5f0;
}

.cc-content {
  flex: 1;
}

.cc-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 22px;
  color: #8a7a72;
  gap: 12px;
}

/* Calendar page styles */
.cc-cal-toggle {
  display: flex;
  border: 1px solid #ece4da;
  border-radius: 8px;
  overflow: hidden;
}

.cc-cal-toggle-btn {
  padding: 6px 18px;
  font-size: 12.5px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  font-family: 'Nunito', sans-serif;
}

.cc-cal-toggle-btn.active {
  background: #e8d5c0;
  color: #3d2f2f;
}

.cc-cal-toggle-btn:not(.active) {
  background: transparent;
  color: #8a7a72;
}

.cc-cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-left: 1px solid #ece4da;
  border-top: 1px solid #ece4da;
}

.cc-cal-day-header {
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  color: #8a7a72;
  padding: 8px 4px;
  border-right: 1px solid #ece4da;
  border-bottom: 1px solid #ece4da;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.cc-cal-day {
  min-height: 130px;
  padding: 6px 6px 4px;
  border-right: 1px solid #ece4da;
  border-bottom: 1px solid #ece4da;
  vertical-align: top;
}

.cc-cal-day.other-month {
  background: #faf7f4;
}

.cc-cal-day-num {
  font-size: 12px;
  font-weight: 600;
  color: #3d2f2f;
  margin-bottom: 4px;
  display: inline-block;
  width: 22px;
  height: 22px;
  line-height: 22px;
  text-align: center;
  border-radius: 50%;
}

.cc-cal-day.other-month .cc-cal-day-num {
  color: #c8bdb5;
}

.cc-post-mini {
  background: #fff;
  border: 1px solid #ece4da;
  border-radius: 5px;
  padding: 4px 5px;
  margin-bottom: 4px;
  display: flex;
  flex-direction: row;
  gap: 6px;
  align-items: stretch;
}

.cc-week-post-item {
  display: flex;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #f0e8e0;
  align-items: flex-start;
}

.cc-week-post-item:last-child {
  border-bottom: none;
}
`;

const NAV_ITEMS: { id: ContentCalendarView; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'campaigns', label: 'Campaigns' },
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'ideas', label: 'Ideas' },
  { id: 'hashtags', label: 'Hashtags' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'templates', label: 'Templates' },
  { id: 'media', label: 'Media Library' },
  { id: 'composer', label: 'Post Composer' },
  { id: 'settings', label: 'Settings' },
];

const NAV_ICONS: Record<ContentCalendarView, React.ReactNode> = {
  dashboard: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  calendar: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  pipeline: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  ),
  ideas: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/>
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
    </svg>
  ),
  hashtags: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/>
      <line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>
    </svg>
  ),
  media: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  ),
  templates: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="7" rx="1"/>
      <rect x="3" y="14" width="8" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  analytics: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
      <line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  ),
  campaigns: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 11l19-9-9 19-2-8-8-2z"/>
    </svg>
  ),
  settings: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  composer: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z"/>
    </svg>
  ),
};

const VIEW_LABELS: Record<ContentCalendarView, string> = {
  dashboard: 'Dashboard', calendar: 'Calendar', pipeline: 'Pipeline',
  ideas: 'Ideas', hashtags: 'Hashtags', media: 'Media Library',
  templates: 'Templates', analytics: 'Analytics', campaigns: 'Campaigns',
  settings: 'Settings',
  composer: 'Post Composer',
};

function PlaceholderView({ view }: { view: ContentCalendarView }) {
  return (
    <div className="cc-placeholder">
      <div style={{ fontSize: 40 }}>🗓</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: '#3d2f2f' }}>{VIEW_LABELS[view]}</div>
      <div style={{ fontSize: 13, color: '#8a7a72' }}>Coming soon — dashboard and calendar are fully implemented.</div>
    </div>
  );
}

export default function ContentCalendarApp() {
  const { activeView, setActiveView, openComposer, composerReturnView } = useContentCalendarStore();

  return (
    <>
      <style>{CC_CSS}</style>
      <div className="cc-app">

        {/* Sidebar */}
        <aside className="cc-sidebar">
          <div className="cc-sidebar-logo">
            <div className="cc-sidebar-logo-title">The Content<br />Edit</div>
          </div>

          <nav>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                className={`cc-nav-item${activeView === item.id ? ' active' : ''}`}
                onClick={() => item.id === 'composer'
                  ? openComposer({ resumeLatest: true, returnView: activeView === 'composer' ? composerReturnView : activeView })
                  : setActiveView(item.id)}
              >
                <span style={{ opacity: 0.7 }}>{NAV_ICONS[item.id]}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="cc-sidebar-footer">
            <div style={{ fontSize: 9, fontWeight: 700, color: '#b0a098', textAlign: 'center', lineHeight: 1.8, letterSpacing: '0.1em', marginBottom: 8, textTransform: 'uppercase' }}>
              Better content<br />builds a brighter<br />tomorrow
            </div>
            <img
              src={underlineImg}
              alt=""
              style={{ display: 'block', width: 80, height: 10, objectFit: 'cover', objectPosition: 'center bottom', opacity: 0.4, margin: '0 auto' }}
            />
          </div>
        </aside>

        {/* Main area */}
        <div className="cc-main">
          <div className="cc-content">
            {activeView === 'dashboard' ? (
              <Dashboard />
            ) : activeView === 'campaigns' ? (
              <Campaigns />
            ) : activeView === 'calendar' ? (
              <Calendar />
            ) : activeView === 'pipeline' ? (
              <Pipeline />
            ) : activeView === 'ideas' ? (
              <Ideas />
            ) : activeView === 'media' ? (
              <MediaLibrary />
            ) : activeView === 'hashtags' ? (
              <Hashtags />
            ) : activeView === 'analytics' ? (
              <Analytics />
            ) : activeView === 'templates' ? (
              <Templates />
            ) : activeView === 'composer' ? (
              <Composer />
            ) : activeView === 'settings' ? (
              <Settings />
            ) : (
              <PlaceholderView view={activeView} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
