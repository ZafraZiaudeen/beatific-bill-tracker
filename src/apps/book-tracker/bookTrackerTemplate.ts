export const bookTrackerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Book Tracker</title>
<script>window.__BTK_LICENSE_HASH__="";</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{
  --bg:#f4efe6;--sidebar:#fff;--card:#fff;--border:#e8e2d8;--border-card:#ede8df;
  --green:#2d4a3e;--green-faint:#e8f0eb;--green-mid:#4a7c5f;
  --text:#1a1a1a;--muted:#8a8a8a;--shadow:0 1px 4px rgba(0,0,0,.05),0 2px 8px rgba(0,0,0,.04);
  --serif:'Lora',Georgia,serif;--sans:'Inter',-apple-system,sans-serif;--radius:12px;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;overflow:hidden}
body{font-family:var(--sans);background:var(--bg);color:var(--text);font-size:13px;line-height:1.5;-webkit-font-smoothing:antialiased}
button{cursor:pointer;font:inherit;background:none;border:none;color:inherit}
input,textarea,select{font:inherit}
/* Layout */
.app{display:grid;grid-template-columns:180px 1fr;height:100vh;overflow:hidden}
.sidebar{background:var(--sidebar);border-right:1px solid var(--border);display:flex;flex-direction:column}
.sb-brand{padding:18px 14px 14px;display:flex;align-items:center;gap:9px}
.sb-icon{width:30px;height:30px;background:var(--green);border-radius:7px;display:flex;align-items:center;justify-content:center}
.sb-icon svg{width:16px;height:16px}
.sb-title{font-weight:700;font-size:14px;color:var(--text)}
.sb-nav{flex:1;padding:2px 8px;display:flex;flex-direction:column;gap:1px;overflow-y:auto}
.nav-btn{display:flex;align-items:center;gap:8px;padding:7.5px 10px;border-radius:8px;color:#5a5a5a;font-size:13px;font-weight:500;transition:background .13s,color .13s;width:100%;text-align:left}
.nav-btn svg{width:15px;height:15px;flex-shrink:0}
.nav-btn:hover{background:var(--green-faint);color:var(--green)}
.nav-btn.active{background:var(--green);color:#fff}
.sb-footer{padding:10px 13px 13px;border-top:1px solid var(--border);font-size:11px;color:var(--muted);line-height:1.45}
.main{display:flex;flex-direction:column;overflow:hidden}
.topbar{display:flex;align-items:center;gap:8px;padding:20px 28px 14px;flex-shrink:0}
.topbar h1{font-family:var(--serif);font-size:26px;font-weight:400;flex:1;letter-spacing:-0.2px}
.content{flex:1;overflow-y:auto;padding:0 28px 28px;display:flex;flex-direction:column;gap:13px}
/* Cards */
.card{background:var(--card);border-radius:var(--radius);border:1px solid var(--border-card);box-shadow:var(--shadow);padding:20px 22px}
.card-label{font-size:9.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:12px}
/* Buttons */
.btn-primary{background:var(--green);color:#fff;padding:8px 16px;border-radius:8px;font-size:13px;font-weight:600;display:inline-flex;align-items:center;gap:6px;transition:background .13s}
.btn-primary:hover{background:#1f3329}
.btn-outline{border:1px solid var(--border);background:#fff;padding:7px 14px;border-radius:8px;font-size:12.5px;font-weight:500;color:#555;display:inline-flex;align-items:center;gap:6px;transition:background .13s}
.btn-outline:hover{background:var(--green-faint)}
.btn-ghost{border:1px solid var(--border);background:transparent;padding:7px 14px;border-radius:8px;font-size:12.5px;font-weight:500;color:#666;width:100%;text-align:center;transition:background .13s}
.btn-ghost:hover{background:var(--green-faint);color:var(--green)}
.btn-danger{border:1px solid #f5c6cb;background:#fff0f0;padding:6px 13px;border-radius:7px;font-size:12px;font-weight:500;color:#c0392b}
/* Forms */
.field{display:flex;flex-direction:column;gap:5px;margin-bottom:14px}
.field label{font-size:11px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.08em}
.field input,.field select,.field textarea{width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:8px;font-size:13px;outline:none;background:#fff;transition:border-color .15s}
.field input:focus,.field select:focus,.field textarea:focus{border-color:var(--green-mid)}
/* Modal overlay */
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:500}
.modal{background:#fff;border-radius:16px;width:min(580px,92vw);max-height:90vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.22)}
.modal-header{padding:24px 28px 0;flex-shrink:0;display:flex;align-items:flex-start;justify-content:space-between}
.modal-header h2{font-family:var(--serif);font-size:24px;font-weight:400}
.modal-body{flex:1;overflow-y:auto;padding:20px 28px}
.modal-footer{padding:0 28px 24px;display:flex;gap:10px;flex-shrink:0}
/* Full-screen modals */
.fullscreen{position:fixed;inset:0;background:var(--bg);display:flex;align-items:center;justify-content:center;z-index:1000}
.fullscreen-card{background:#fff;border-radius:20px;padding:48px 52px;max-width:440px;width:90%;box-shadow:0 24px 72px rgba(0,0,0,.14);text-align:center}
/* Status badges */
.status-reading{background:#e6f4ec;color:#2d7a4a}
.status-finished{background:#eeece8;color:#5a5550}
.status-paused{background:#fef5e0;color:#9a6f00}
.status-dnf{background:#fdecea;color:#c0392b}
.status-pill{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:20px;font-size:11.5px;font-weight:600}
/* Stars */
.stars{display:inline-flex;gap:1px;font-size:12px}
/* Progress bar */
.progress-wrap{height:5px;background:#e4e9e5;border-radius:99px;overflow:hidden;margin-top:8px}
.progress-fill{height:100%;background:var(--green);border-radius:99px;transition:width .3s}
/* Notifications */
.toast{position:fixed;bottom:24px;right:24px;background:#1a1a1a;color:#fff;padding:10px 18px;border-radius:10px;font-size:13px;z-index:9999;opacity:0;transition:opacity .3s;pointer-events:none}
.toast.show{opacity:1}
/* Unlock screen */
.unlock-wrap{display:flex;flex-direction:column;align-items:center;gap:20px;padding:32px}
/* Book grid */
.book-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:14px}
.book-card{background:var(--card);border:1px solid var(--border-card);border-radius:10px;overflow:hidden;cursor:pointer;transition:box-shadow .15s}
.book-card:hover{box-shadow:0 4px 16px rgba(0,0,0,.1)}
.book-cover{width:100%;height:170px;object-fit:cover;display:block}
.book-cover-grad{width:100%;height:170px;display:flex;align-items:center;justify-content:center;padding:12px;font-family:var(--serif);font-style:italic;font-weight:600;font-size:11px;color:rgba(255,255,255,0.9);text-align:center;text-shadow:0 1px 3px rgba(0,0,0,.5);position:relative;overflow:hidden}
.book-cover-grad::before{content:'';position:absolute;left:0;top:0;bottom:0;width:5px;background:linear-gradient(to right,rgba(0,0,0,.25),transparent)}
.book-info{padding:10px 11px 12px}
.book-title{font-size:12.5px;font-weight:600;line-height:1.3;margin-bottom:2px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.book-author{font-size:11px;color:var(--muted);overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
/* Wishlist */
.wish-item{display:flex;align-items:center;gap:12px;padding:12px 14px;background:#fff;border:1px solid var(--border-card);border-radius:10px;margin-bottom:8px}
.wish-cover{width:36px;height:52px;border-radius:4px;flex-shrink:0;box-shadow:1px 2px 5px rgba(0,0,0,.15)}
/* Insights tiles */
.tile-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.tile{background:#fff;border:1px solid var(--border-card);border-radius:10px;padding:16px;text-align:center}
.tile-icon{width:34px;height:34px;border-radius:50%;background:var(--green-faint);color:var(--green);display:flex;align-items:center;justify-content:center;margin:0 auto 8px}
.tile-val{font-size:22px;font-weight:700;letter-spacing:-0.5px;line-height:1}
.tile-lbl{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-top:4px}
/* Free limit banner */
.limit-banner{background:#fff3cd;border:1px solid #ffc107;border-radius:10px;padding:12px 16px;font-size:13px;color:#856404;display:flex;align-items:center;gap:10px;margin-bottom:13px}
</style>
</head>
<body>

<!-- Name Entry (shown first open) -->
<div id="name-screen" class="fullscreen" style="display:none">
  <div class="fullscreen-card">
    <div style="width:56px;height:56px;border-radius:50%;background:var(--green-faint);display:flex;align-items:center;justify-content:center;margin:0 auto 22px">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="1.8" stroke-linecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
    </div>
    <h2 style="font-family:var(--serif);font-size:28px;font-weight:400;margin-bottom:10px">Welcome to Book Tracker</h2>
    <p style="font-size:14px;color:var(--muted);margin-bottom:28px;line-height:1.6">Your personal reading library, stored right here on your device. Before we begin — what should we call you?</p>
    <input id="name-input" type="text" placeholder="Your name…" style="width:100%;padding:11px 16px;border:1.5px solid var(--border);border-radius:10px;font-size:15px;outline:none;margin-bottom:18px">
    <div id="name-error" style="font-size:12px;color:#e74c3c;margin-bottom:10px;display:none">Please enter your name to continue.</div>
    <button onclick="submitName()" class="btn-primary" style="width:100%;justify-content:center;padding:12px 0;font-size:15px;border-radius:10px">Get started →</button>
  </div>
</div>

<!-- Onboarding (3 steps, shown after name) -->
<div id="onboarding-screen" class="fullscreen" style="display:none">
  <div class="fullscreen-card" style="max-width:500px">
    <div id="ob-steps"></div>
    <div style="display:flex;gap:8px;justify-content:center;margin:22px 0 0">
      <div id="ob-dot-0" style="width:7px;height:7px;border-radius:50%;background:var(--green);transition:background .2s"></div>
      <div id="ob-dot-1" style="width:7px;height:7px;border-radius:50%;background:#ddd;transition:background .2s"></div>
      <div id="ob-dot-2" style="width:7px;height:7px;border-radius:50%;background:#ddd;transition:background .2s"></div>
    </div>
    <div style="display:flex;gap:10px;margin-top:22px">
      <button id="ob-back" onclick="obBack()" class="btn-outline" style="flex:1;justify-content:center">Back</button>
      <button id="ob-next" onclick="obNext()" class="btn-primary" style="flex:2;justify-content:center">Next →</button>
    </div>
  </div>
</div>

<!-- Unlock screen (license gate) -->
<div id="unlock-screen" class="fullscreen" style="display:none">
  <div class="fullscreen-card">
    <div style="width:56px;height:56px;border-radius:50%;background:var(--green-faint);display:flex;align-items:center;justify-content:center;margin:0 auto 20px">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
    </div>
    <h2 style="font-family:var(--serif);font-size:26px;font-weight:400;margin-bottom:10px">Unlock Full Access</h2>
    <p id="unlock-msg" style="font-size:14px;color:var(--muted);margin-bottom:24px;line-height:1.6">You've reached the 10-book limit for the free tier. Enter your license code to unlock unlimited books.</p>
    <input id="unlock-input" type="text" placeholder="License code…" style="width:100%;padding:11px 16px;border:1.5px solid var(--border);border-radius:10px;font-size:15px;outline:none;margin-bottom:10px;letter-spacing:1px">
    <div id="unlock-error" style="font-size:12px;color:#e74c3c;margin-bottom:12px;min-height:16px"></div>
    <button onclick="tryUnlock()" class="btn-primary" style="width:100%;justify-content:center;padding:11px 0;font-size:14px;border-radius:10px;margin-bottom:12px">Unlock →</button>
    <button id="unlock-skip" onclick="closeUnlock()" style="font-size:12px;color:var(--muted);background:none;border:none;text-decoration:underline;cursor:pointer">Maybe later</button>
  </div>
</div>

<!-- Main App -->
<div id="app" class="app" style="display:none">
  <aside class="sidebar">
    <div class="sb-brand">
      <div class="sb-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
      </div>
      <span class="sb-title">Book Tracker</span>
    </div>
    <nav class="sb-nav" id="sidebar-nav">
      <button class="nav-btn active" data-tab="overview" onclick="switchTab('overview',this)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
        Overview
      </button>
      <button class="nav-btn" data-tab="library" onclick="switchTab('library',this)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
        Library
      </button>
      <button class="nav-btn" data-tab="wishlist" onclick="switchTab('wishlist',this)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
        Wishlist
      </button>
      <button class="nav-btn" data-tab="log" onclick="switchTab('log',this)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        Reading log
      </button>
      <button class="nav-btn" data-tab="insights" onclick="switchTab('insights',this)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
        Insights
      </button>
      <button class="nav-btn" data-tab="settings" onclick="switchTab('settings',this)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93A10 10 0 1 1 4.93 19.07M12 1v3M12 20v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M1 12h3M20 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></svg>
        Settings
      </button>
    </nav>
    <div class="sb-footer">Offline by default · Nothing sent to any server</div>
  </aside>

  <main class="main">
    <!-- Overview Tab -->
    <div id="tab-overview" class="tab-content">
      <div class="topbar">
        <h1 id="greeting-text"></h1>
        <button onclick="showAddBook()" class="btn-primary"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Add book</button>
      </div>
      <div class="content">
        <div class="card">
          <div class="card-label">Your Library</div>
          <div style="display:flex;gap:24px;flex-wrap:wrap">
            <div id="ov-total" style="text-align:center"><div style="font-size:28px;font-weight:700" id="ov-total-n">0</div><div style="font-size:11px;color:var(--muted)">Total books</div></div>
            <div id="ov-reading" style="text-align:center"><div style="font-size:28px;font-weight:700;color:var(--green)" id="ov-reading-n">0</div><div style="font-size:11px;color:var(--muted)">Reading now</div></div>
            <div id="ov-finished" style="text-align:center"><div style="font-size:28px;font-weight:700" id="ov-finished-n">0</div><div style="font-size:11px;color:var(--muted)">Finished</div></div>
            <div id="ov-wishlist" style="text-align:center"><div style="font-size:28px;font-weight:700" id="ov-wishlist-n">0</div><div style="font-size:11px;color:var(--muted)">On wishlist</div></div>
          </div>
        </div>
        <div class="card" id="ov-current-card" style="display:none">
          <div class="card-label">Currently Reading</div>
          <div id="ov-current-content"></div>
        </div>
        <div class="card">
          <div class="card-label">Recent Sessions</div>
          <div id="ov-sessions"></div>
          <button onclick="switchTab('log',document.querySelector('[data-tab=log]'))" class="btn-ghost" style="margin-top:10px">View all sessions</button>
        </div>
      </div>
    </div>

    <!-- Library Tab -->
    <div id="tab-library" class="tab-content" style="display:none">
      <div class="topbar">
        <h1>Library</h1>
        <select id="lib-filter" onchange="renderLibrary()" style="padding:6px 10px;border:1px solid var(--border);border-radius:8px;font-size:12.5px;background:#fff;outline:none">
          <option value="all">All books</option>
          <option value="Reading">Reading</option>
          <option value="Finished">Finished</option>
          <option value="Paused">Paused</option>
          <option value="DNF">DNF</option>
        </select>
        <button onclick="showAddBook()" class="btn-primary"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Add book</button>
      </div>
      <div class="content" id="lib-free-banner-wrap"></div>
      <div class="content" id="library-grid"></div>
    </div>

    <!-- Wishlist Tab -->
    <div id="tab-wishlist" class="tab-content" style="display:none">
      <div class="topbar">
        <h1>Wishlist</h1>
        <button onclick="showAddWish()" class="btn-primary"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Add to wishlist</button>
      </div>
      <div class="content" id="wishlist-list"></div>
    </div>

    <!-- Log Tab -->
    <div id="tab-log" class="tab-content" style="display:none">
      <div class="topbar">
        <h1>Reading Log</h1>
        <button onclick="showLogSession()" class="btn-primary"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Log session</button>
      </div>
      <div class="content" id="log-list"></div>
    </div>

    <!-- Insights Tab -->
    <div id="tab-insights" class="tab-content" style="display:none">
      <div class="topbar"><h1>Insights</h1></div>
      <div class="content">
        <div class="card">
          <div class="card-label">This Year</div>
          <div class="tile-grid" id="insights-tiles"></div>
        </div>
        <div class="card" id="insights-genres-card">
          <div class="card-label">By Genre</div>
          <div id="insights-genres"></div>
        </div>
      </div>
    </div>

    <!-- Settings Tab -->
    <div id="tab-settings" class="tab-content" style="display:none">
      <div class="topbar"><h1>Settings</h1></div>
      <div class="content">
        <div class="card">
          <div class="card-label">Profile</div>
          <div class="field">
            <label>Your name</label>
            <input id="settings-name" type="text" oninput="saveSettingName()">
          </div>
        </div>
        <div class="card">
          <div class="card-label">Reading Goal</div>
          <div class="field">
            <label>Books to read this year</label>
            <input id="settings-goal" type="number" min="0" max="999" style="width:100px" oninput="saveSettingGoal()">
          </div>
        </div>
        <div class="card">
          <div class="card-label">Data</div>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <button onclick="exportData()" class="btn-outline">Export JSON</button>
            <button onclick="document.getElementById('import-file').click()" class="btn-outline">Import JSON</button>
            <input id="import-file" type="file" accept=".json" style="display:none" onchange="importData(event)">
          </div>
        </div>
        <div class="card" id="settings-unlock-card" style="display:none">
          <div class="card-label">License</div>
          <button onclick="showUnlockScreen(true)" class="btn-outline">Enter unlock code</button>
          <p id="settings-license-status" style="font-size:12px;color:var(--muted);margin-top:8px"></p>
        </div>
        <div class="card" style="border-color:#f5c6cb;background:#fff8f8">
          <div style="font-size:13.5px;font-weight:600;color:#c0392b;margin-bottom:6px">Clear all data</div>
          <div style="font-size:12px;color:var(--muted);margin-bottom:12px">Permanently delete all books, sessions, and settings from this file.</div>
          <button onclick="clearAllData()" class="btn-danger">Clear all data</button>
        </div>
      </div>
    </div>
  </main>
</div>

<!-- Add / Edit Book Modal -->
<div id="book-modal" class="overlay" style="display:none" onclick="if(event.target===this)closeBookModal()">
  <div class="modal">
    <div class="modal-header">
      <h2 id="book-modal-title">Add a book</h2>
      <button onclick="closeBookModal()" style="width:30px;height:30px;border-radius:50%;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;color:var(--muted)">✕</button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="book-id">
      <div class="field"><label>Title *</label><input id="book-title" type="text" placeholder="Book title"></div>
      <div class="field"><label>Author *</label><input id="book-author" type="text" placeholder="Author name"></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="field"><label>Status</label>
          <select id="book-status">
            <option>Reading</option><option>Finished</option><option>Paused</option><option>DNF</option>
          </select>
        </div>
        <div class="field"><label>Rating (0–5)</label><input id="book-rating" type="number" min="0" max="5" step="0.5" placeholder="0"></div>
        <div class="field"><label>Pages</label><input id="book-pages" type="number" min="0" placeholder="0"></div>
        <div class="field"><label>Current page</label><input id="book-current" type="number" min="0" placeholder="0"></div>
        <div class="field"><label>Genre / tag</label><input id="book-genre" type="text" placeholder="e.g. Fiction"></div>
        <div class="field"><label>Format</label>
          <select id="book-format">
            <option>Paperback</option><option>Hardcover</option><option>Ebook</option><option>Audiobook</option>
          </select>
        </div>
      </div>
      <div class="field"><label>Notes</label><textarea id="book-notes" rows="3" placeholder="Any thoughts…"></textarea></div>
    </div>
    <div class="modal-footer">
      <button onclick="closeBookModal()" class="btn-outline" style="flex:1;justify-content:center">Cancel</button>
      <button onclick="saveBook()" class="btn-primary" style="flex:2;justify-content:center">Save book</button>
    </div>
  </div>
</div>

<!-- Add Wishlist Item Modal -->
<div id="wish-modal" class="overlay" style="display:none" onclick="if(event.target===this)closeWishModal()">
  <div class="modal">
    <div class="modal-header">
      <h2 id="wish-modal-title">Add to wishlist</h2>
      <button onclick="closeWishModal()" style="width:30px;height:30px;border-radius:50%;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;color:var(--muted)">✕</button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="wish-id">
      <div class="field"><label>Title *</label><input id="wish-title" type="text" placeholder="Book title"></div>
      <div class="field"><label>Author</label><input id="wish-author" type="text" placeholder="Author name"></div>
      <div class="field"><label>Priority</label>
        <select id="wish-priority">
          <option value="next-up">Next up</option>
          <option value="high">High</option>
          <option value="someday">Someday</option>
        </select>
      </div>
      <div class="field"><label>Notes</label><textarea id="wish-notes" rows="2" placeholder="Why you want to read it…"></textarea></div>
    </div>
    <div class="modal-footer">
      <button onclick="closeWishModal()" class="btn-outline" style="flex:1;justify-content:center">Cancel</button>
      <button onclick="saveWish()" class="btn-primary" style="flex:2;justify-content:center">Save</button>
    </div>
  </div>
</div>

<!-- Log Session Modal -->
<div id="log-modal" class="overlay" style="display:none" onclick="if(event.target===this)closeLogModal()">
  <div class="modal">
    <div class="modal-header">
      <h2>Log a reading session</h2>
      <button onclick="closeLogModal()" style="width:30px;height:30px;border-radius:50%;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;color:var(--muted)">✕</button>
    </div>
    <div class="modal-body">
      <div class="field"><label>Book</label>
        <select id="log-book"><option value="">— Select a book —</option></select>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="field"><label>Pages read</label><input id="log-pages" type="number" min="0" placeholder="0"></div>
        <div class="field"><label>Minutes read</label><input id="log-minutes" type="number" min="1" placeholder="30"></div>
        <div class="field"><label>Date</label><input id="log-date" type="date"></div>
      </div>
      <div class="field"><label>Note (optional)</label><textarea id="log-note" rows="2" placeholder="How did the reading go?"></textarea></div>
    </div>
    <div class="modal-footer">
      <button onclick="closeLogModal()" class="btn-outline" style="flex:1;justify-content:center">Cancel</button>
      <button onclick="saveSession()" class="btn-primary" style="flex:2;justify-content:center">Save session</button>
    </div>
  </div>
</div>

<div id="toast" class="toast"></div>

<script>
(function(){
"use strict";

// ── Storage keys ──────────────────────────────────────────────
var KEYS = { books:'btk_books', wishlist:'btk_wishlist', sessions:'btk_sessions', settings:'btk_settings', activated:'btk_activated' };
var FREE_LIMIT = 10;
var SALT = "btk-lic-v1";

// ── Crypto ────────────────────────────────────────────────────
async function sha256(text) {
  var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

// ── State helpers ─────────────────────────────────────────────
function load(key) { try { return JSON.parse(localStorage.getItem(key)||'null'); } catch { return null; } }
function save(key,val) { try { localStorage.setItem(key,JSON.stringify(val)); } catch {} }
function getBooks() { return load(KEYS.books)||[]; }
function getWish()  { return load(KEYS.wishlist)||[]; }
function getSessions(){ return load(KEYS.sessions)||[]; }
function getSettings(){ return load(KEYS.settings)||{}; }
function saveSettings(patch){ save(KEYS.settings,Object.assign(getSettings(),patch)); }
function isActivated(){ return !!load(KEYS.activated) || localStorage.getItem(KEYS.activated)==='1'; }
function activeBooks() { return getBooks().filter(b=>!b.archived); }

// ── Onboarding steps ──────────────────────────────────────────
var OB_STEPS = [
  {
    icon:'<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="1.5" stroke-linecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
    title:'Your personal library',
    body:'Track every book you read, are reading, or want to read. Rate them, tag them, log your sessions — everything in one place.'
  },
  {
    icon:'<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    title:'Log your reading time',
    body:'Record sessions as you go — pages read, minutes spent, your mood. Watch your reading habits grow over time in Insights.'
  },
  {
    icon:'<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="1.5" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    title:'Private by default',
    body:'Everything is stored on this device — nothing is sent anywhere. Export your data anytime in Settings to keep a backup.'
  }
];
var obStep = 0;

function renderOb() {
  var s = OB_STEPS[obStep];
  document.getElementById('ob-steps').innerHTML =
    '<div style="margin-bottom:20px">' + s.icon + '</div>' +
    '<h2 style="font-family:var(--serif);font-size:24px;font-weight:400;margin-bottom:12px">' + s.title + '</h2>' +
    '<p style="font-size:14px;color:var(--muted);line-height:1.6">' + s.body + '</p>';
  [0,1,2].forEach(function(i){
    document.getElementById('ob-dot-'+i).style.background = i===obStep?'var(--green)':'#ddd';
  });
  document.getElementById('ob-back').style.display = obStep===0?'none':'';
  document.getElementById('ob-next').textContent = obStep===2?'Start reading →':'Next →';
}
function obNext() {
  if (obStep < 2) { obStep++; renderOb(); }
  else { document.getElementById('onboarding-screen').style.display='none'; showApp(); }
}
function obBack() { if (obStep > 0) { obStep--; renderOb(); } }
window.obNext = obNext;
window.obBack = obBack;

// ── Name entry ────────────────────────────────────────────────
function submitName() {
  var n = document.getElementById('name-input').value.trim();
  if (!n) { document.getElementById('name-error').style.display='block'; return; }
  document.getElementById('name-error').style.display='none';
  saveSettings({ userName: n });
  document.getElementById('name-screen').style.display='none';
  // first time: show onboarding
  obStep = 0;
  renderOb();
  document.getElementById('onboarding-screen').style.display='flex';
}
document.getElementById('name-input').addEventListener('keydown',function(e){ if(e.key==='Enter') submitName(); });
window.submitName = submitName;

// ── Unlock ────────────────────────────────────────────────────
var unlockMandatory = false;
function showUnlockScreen(optional) {
  unlockMandatory = !optional;
  document.getElementById('unlock-skip').style.display = optional ? '' : 'none';
  document.getElementById('unlock-msg').textContent = optional
    ? 'Enter your license code to unlock unlimited books and features.'
    : "You've reached the 10-book limit for the free tier. Enter your license code to unlock unlimited books.";
  document.getElementById('unlock-input').value = '';
  document.getElementById('unlock-error').textContent = '';
  document.getElementById('unlock-screen').style.display='flex';
}
function closeUnlock() {
  document.getElementById('unlock-screen').style.display='none';
}
async function tryUnlock() {
  var code = document.getElementById('unlock-input').value.trim();
  if (!code) { document.getElementById('unlock-error').textContent = 'Please enter your license code.'; return; }
  var hash = await sha256(SALT + code);
  var expected = window.__BTK_LICENSE_HASH__;
  if (!expected || hash !== expected) {
    document.getElementById('unlock-error').textContent = 'Invalid code. Please check and try again.';
    return;
  }
  localStorage.setItem(KEYS.activated, '1');
  document.getElementById('unlock-screen').style.display='none';
  updateLicenseStatus();
  renderAll();
  toast('Unlocked! Full access activated.');
}
window.showUnlockScreen = showUnlockScreen;
window.closeUnlock = closeUnlock;
window.tryUnlock = tryUnlock;

// ── App initialization ────────────────────────────────────────
function showApp() {
  document.getElementById('app').style.display='grid';
  renderAll();
}
function renderAll() {
  renderOverview();
  renderLibrary();
  renderWishlist();
  renderLog();
  renderInsights();
  renderSettings();
  updateLicenseStatus();
}

// ── Overview ──────────────────────────────────────────────────
function renderOverview() {
  var s = getSettings();
  var name = s.userName || 'reader';
  document.getElementById('greeting-text').textContent = 'Good books, ' + name + '.';
  var books = getBooks();
  var wish = getWish();
  var sessions = getSessions();
  document.getElementById('ov-total-n').textContent = String(books.filter(function(b){return !b.archived}).length);
  document.getElementById('ov-reading-n').textContent = String(books.filter(function(b){return b.status==='Reading'&&!b.archived}).length);
  document.getElementById('ov-finished-n').textContent = String(books.filter(function(b){return b.status==='Finished'}).length);
  document.getElementById('ov-wishlist-n').textContent = String(wish.length);
  // current read
  var cur = books.find(function(b){return b.status==='Reading'&&!b.archived});
  var cc = document.getElementById('ov-current-card');
  if (cur) {
    cc.style.display='';
    var pct = cur.pages>0 ? Math.round(cur.currentPage/cur.pages*100) : 0;
    document.getElementById('ov-current-content').innerHTML =
      '<div style="font-size:15px;font-weight:600;margin-bottom:3px">' + esc(cur.title) + '</div>' +
      '<div style="font-size:12px;color:var(--muted);margin-bottom:10px">' + esc(cur.author) + '</div>' +
      '<div style="display:flex;justify-content:space-between;font-size:12px;color:#555;margin-bottom:5px"><span>Page ' + (cur.currentPage||0) + ' of ' + (cur.pages||0) + '</span><span>' + pct + '%</span></div>' +
      '<div class="progress-wrap"><div class="progress-fill" style="width:' + pct + '%"></div></div>';
  } else { cc.style.display='none'; }
  // recent sessions
  var recent = sessions.slice(0,5);
  var sl = document.getElementById('ov-sessions');
  if (!recent.length) { sl.innerHTML='<p style="color:var(--muted);font-size:13px">No sessions yet. Start reading!</p>'; return; }
  sl.innerHTML = recent.map(function(s){
    return '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">' +
      '<div><div style="font-size:13px;font-weight:600">' + esc(s.bookTitle||'') + '</div>' +
      '<div style="font-size:11.5px;color:var(--muted)">' + esc(s.date) + ' · ' + (s.pages||0) + ' pages · ' + (s.minutes||0) + ' min</div></div>' +
    '</div>';
  }).join('');
}

// ── Library ────────────────────────────────────────────────────
var bookColors = ['#2d4a3e,#162030','#4a2a60,#1a0a2a','#603020,#2a1000','#205060,#0a2030','#4a4020,#1a1800','#204a30,#0a2010'];
function coverColor(id) { return bookColors[id%bookColors.length]; }
function renderLibrary() {
  var filter = document.getElementById('lib-filter').value;
  var books = getBooks().filter(function(b){return !b.archived});
  var activated = isActivated();
  var grid = document.getElementById('library-grid');
  var banner = document.getElementById('lib-free-banner-wrap');
  if (!activated && books.length >= FREE_LIMIT) {
    banner.innerHTML = '<div class="limit-banner">⚠️ Free limit reached (' + FREE_LIMIT + ' books). <button onclick="showUnlockScreen(false)" class="btn-primary" style="margin-left:auto;padding:5px 12px;font-size:12px">Enter code</button></div>';
  } else {
    banner.innerHTML = '';
  }
  var filtered = filter==='all' ? books : books.filter(function(b){return b.status===filter});
  if (!filtered.length) {
    grid.innerHTML = '<div class="content"><p style="color:var(--muted);font-size:13px;padding:20px 0">No books yet. Click "Add book" to get started!</p></div>';
    return;
  }
  grid.innerHTML = '<div class="content"><div class="book-grid">' + filtered.map(function(b){
    var colors = coverColor(b.id).split(',');
    var statusClass = 'status-' + b.status.toLowerCase();
    return '<div class="book-card" onclick="editBook(' + b.id + ')">' +
      '<div class="book-cover-grad" style="background:linear-gradient(155deg,' + colors[0] + ' 0%,' + colors[1] + ' 100%)">' + esc(b.title) + '</div>' +
      '<div class="book-info">' +
        '<div class="book-title">' + esc(b.title) + '</div>' +
        '<div class="book-author">' + esc(b.author||'') + '</div>' +
        '<div style="margin-top:6px"><span class="status-pill ' + statusClass + '">' + esc(b.status) + '</span></div>' +
      '</div>' +
    '</div>';
  }).join('') + '</div></div>';
}
window.renderLibrary = renderLibrary;

// ── Wishlist ────────────────────────────────────────────────────
var PRIO_LABEL = {'next-up':'Next up','high':'High','someday':'Someday'};
function renderWishlist() {
  var items = getWish();
  var el = document.getElementById('wishlist-list');
  if (!items.length) { el.innerHTML='<p style="color:var(--muted);font-size:13px;padding:20px 28px">No books on your wishlist yet.</p>'; return; }
  el.innerHTML = '<div style="padding:0 28px 28px">' + items.map(function(w){
    var colors = bookColors[w.id%bookColors.length].split(',');
    return '<div class="wish-item">' +
      '<div class="wish-cover" style="background:linear-gradient(145deg,' + colors[0] + ' 0%,' + colors[1] + ' 100%)"></div>' +
      '<div style="flex:1;min-width:0">' +
        '<div style="font-size:13.5px;font-weight:600">' + esc(w.title) + '</div>' +
        '<div style="font-size:12px;color:var(--muted)">' + esc(w.author||'') + '</div>' +
        '<div style="font-size:11.5px;color:var(--green);font-weight:600;margin-top:3px">' + (PRIO_LABEL[w.priority]||w.priority) + '</div>' +
      '</div>' +
      '<div style="display:flex;gap:6px">' +
        '<button onclick="moveWishToLibrary(' + w.id + ')" class="btn-outline" style="font-size:12px;padding:5px 10px">Start reading</button>' +
        '<button onclick="deleteWish(' + w.id + ')" style="color:var(--muted);padding:5px 8px;border:1px solid var(--border);border-radius:7px;background:#fff;font-size:12px">✕</button>' +
      '</div>' +
    '</div>';
  }).join('') + '</div>';
}
window.renderWishlist = renderWishlist;

function moveWishToLibrary(id) {
  var items = getWish();
  var w = items.find(function(x){return x.id===id});
  if (!w) return;
  var books = getBooks();
  var activated = isActivated();
  var active = books.filter(function(b){return !b.archived}).length;
  if (!activated && active >= FREE_LIMIT) { showUnlockScreen(false); return; }
  var newBook = { id: Date.now(), title: w.title, author: w.author||'', status: 'Reading', rating: 0, pages: 0, currentPage: 0, genre: '', format: 'Paperback', notes: '', dateAdded: today(), archived: false };
  save(KEYS.books, books.concat([newBook]));
  save(KEYS.wishlist, items.filter(function(x){return x.id!==id}));
  renderAll();
  toast('Moved to Library!');
}
window.moveWishToLibrary = moveWishToLibrary;

function deleteWish(id) {
  save(KEYS.wishlist, getWish().filter(function(w){return w.id!==id}));
  renderWishlist();
}
window.deleteWish = deleteWish;

// ── Log ────────────────────────────────────────────────────────
function renderLog() {
  var sessions = getSessions();
  var el = document.getElementById('log-list');
  if (!sessions.length) { el.innerHTML='<p style="color:var(--muted);font-size:13px;padding:20px 28px">No sessions logged yet.</p>'; return; }
  el.innerHTML = '<div style="padding:0 28px 28px;display:flex;flex-direction:column;gap:8px">' + sessions.map(function(s){
    return '<div class="card" style="display:flex;justify-content:space-between;align-items:center">' +
      '<div><div style="font-size:13.5px;font-weight:600">' + esc(s.bookTitle||'Unknown') + '</div>' +
      '<div style="font-size:12px;color:var(--muted);margin-top:3px">' + esc(s.date) + ' · ' + (s.pages||0) + ' pages read · ' + (s.minutes||0) + ' min</div>' +
      (s.note ? '<div style="font-size:12px;color:#555;margin-top:5px;font-style:italic">' + esc(s.note) + '</div>' : '') +
      '</div>' +
      '<button onclick="deleteSession(' + s.id + ')" style="color:var(--muted);padding:5px 8px;border:1px solid var(--border);border-radius:7px;background:#fff;font-size:12px;flex-shrink:0">✕</button>' +
    '</div>';
  }).join('') + '</div>';
}
window.renderLog = renderLog;

function deleteSession(id) {
  save(KEYS.sessions, getSessions().filter(function(s){return s.id!==id}));
  renderLog();
  renderOverview();
  renderInsights();
}
window.deleteSession = deleteSession;

// ── Insights ────────────────────────────────────────────────────
function renderInsights() {
  var year = new Date().getFullYear();
  var sessions = getSessions().filter(function(s){return new Date(s.date).getFullYear()===year});
  var books = getBooks().filter(function(b){return b.status==='Finished'});
  var totalPages = sessions.reduce(function(a,s){return a+(s.pages||0)},0);
  var totalMins  = sessions.reduce(function(a,s){return a+(s.minutes||0)},0);
  var avgRating = books.filter(function(b){return b.rating>0}).reduce(function(a,b,_,arr){return a+b.rating/arr.length},0);
  var streak = calcStreak(getSessions());
  document.getElementById('insights-tiles').innerHTML =
    tile('📚','Books this year',String(books.length)) +
    tile('📄','Pages this year',totalPages.toLocaleString()) +
    tile('⏱️','Reading time',fmtMins(totalMins)) +
    tile('🔥','Day streak',String(streak));
  // genre breakdown
  var allBooks = getBooks();
  var genreCounts = {};
  allBooks.forEach(function(b){ var g=b.genre||'Other'; genreCounts[g]=(genreCounts[g]||0)+1; });
  var genres = Object.entries(genreCounts).sort(function(a,b){return b[1]-a[1]});
  var max = genres.length ? genres[0][1] : 1;
  document.getElementById('insights-genres').innerHTML = genres.map(function(pair){
    var w = Math.round(pair[1]/max*100);
    return '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">' +
      '<div style="width:90px;font-size:12px;color:var(--muted);text-align:right;flex-shrink:0">' + esc(pair[0]) + '</div>' +
      '<div style="flex:1;height:8px;background:#e4e9e5;border-radius:99px;overflow:hidden"><div style="width:' + w + '%;height:100%;background:var(--green);border-radius:99px"></div></div>' +
      '<div style="width:24px;font-size:12px;font-weight:600">' + pair[1] + '</div>' +
    '</div>';
  }).join('') || '<p style="color:var(--muted);font-size:13px">Add books to see genre breakdown.</p>';
}
function tile(icon,label,val) {
  return '<div class="tile"><div style="font-size:26px;margin-bottom:6px">' + icon + '</div><div class="tile-val">' + val + '</div><div class="tile-lbl">' + label + '</div></div>';
}
function fmtMins(m) { if(m<60) return m+'m'; return Math.floor(m/60)+'h '+(m%60)+'m'; }
function calcStreak(sessions) {
  var dates = new Set(sessions.map(function(s){return s.date}));
  var streak=0; var d=new Date();
  for(var i=0;i<365;i++){
    var key=d.toISOString().slice(0,10);
    if(dates.has(key)){streak++;}else if(i>0){break;}
    d.setDate(d.getDate()-1);
  }
  return streak;
}

// ── Settings ────────────────────────────────────────────────────
function renderSettings() {
  var s = getSettings();
  document.getElementById('settings-name').value = s.userName||'';
  document.getElementById('settings-goal').value = s.yearlyGoal||'';
  var unlockCard = document.getElementById('settings-unlock-card');
  unlockCard.style.display = '';
  updateLicenseStatus();
}
function saveSettingName() {
  var v = document.getElementById('settings-name').value.trim();
  saveSettings({userName:v});
  document.getElementById('greeting-text').textContent = 'Good books, ' + v + '.';
}
function saveSettingGoal() { saveSettings({yearlyGoal:Number(document.getElementById('settings-goal').value)||0}); }
function updateLicenseStatus() {
  var el = document.getElementById('settings-license-status');
  if (!el) return;
  el.textContent = isActivated() ? '✓ Full access activated' : 'Free tier — up to ' + FREE_LIMIT + ' books';
  el.style.color = isActivated() ? 'var(--green)' : 'var(--muted)';
}
function clearAllData() {
  if (!confirm('This will permanently delete ALL your books, sessions, and settings. Cannot be undone. Continue?')) return;
  Object.values(KEYS).forEach(function(k){localStorage.removeItem(k)});
  location.reload();
}
function exportData() {
  var data = {};
  Object.entries(KEYS).forEach(function(e){var v=localStorage.getItem(e[1]);if(v!==null)data[e[1]]=JSON.parse(v);});
  var blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href=url; a.download='book-tracker-backup-'+today()+'.json'; a.click();
  URL.revokeObjectURL(url);
  toast('Data exported!');
}
function importData(e) {
  var file = e.target.files[0]; if(!file) return;
  var reader = new FileReader();
  reader.onload = function(ev){
    try {
      var data = JSON.parse(ev.target.result);
      Object.entries(KEYS).forEach(function(pair){ if(pair[1] in data) save(pair[1],data[pair[1]]); });
      toast('Data imported!');
      setTimeout(function(){location.reload()},1000);
    } catch { toast('Error: invalid file'); }
  };
  reader.readAsText(file);
  e.target.value='';
}
window.saveSettingName = saveSettingName;
window.saveSettingGoal = saveSettingGoal;
window.clearAllData = clearAllData;
window.exportData = exportData;
window.importData = importData;
window.updateLicenseStatus = updateLicenseStatus;

// ── Tab switching ────────────────────────────────────────────────
var currentTab = 'overview';
function switchTab(id, btn) {
  document.querySelectorAll('.tab-content').forEach(function(el){el.style.display='none'});
  document.querySelectorAll('.nav-btn').forEach(function(el){el.classList.remove('active')});
  document.getElementById('tab-'+id).style.display='flex';
  document.getElementById('tab-'+id).style.flexDirection='column';
  if(btn) btn.classList.add('active');
  currentTab = id;
  if(id==='overview') renderOverview();
  if(id==='library')  renderLibrary();
  if(id==='wishlist') renderWishlist();
  if(id==='log')      renderLog();
  if(id==='insights') renderInsights();
  if(id==='settings') renderSettings();
}
window.switchTab = switchTab;

// ── Book modal ────────────────────────────────────────────────
var editingBookId = null;
function showAddBook() {
  var books = getBooks().filter(function(b){return !b.archived});
  var activated = isActivated();
  if (!activated && books.length >= FREE_LIMIT) { showUnlockScreen(false); return; }
  editingBookId = null;
  document.getElementById('book-modal-title').textContent = 'Add a book';
  document.getElementById('book-id').value = '';
  ['book-title','book-author','book-genre','book-notes'].forEach(function(id){document.getElementById(id).value='';});
  document.getElementById('book-rating').value='0';
  document.getElementById('book-pages').value='0';
  document.getElementById('book-current').value='0';
  document.getElementById('book-status').value='Reading';
  document.getElementById('book-format').value='Paperback';
  document.getElementById('book-modal').style.display='flex';
}
function editBook(id) {
  var b = getBooks().find(function(x){return x.id===id});
  if (!b) return;
  editingBookId = id;
  document.getElementById('book-modal-title').textContent = 'Edit book';
  document.getElementById('book-title').value = b.title||'';
  document.getElementById('book-author').value = b.author||'';
  document.getElementById('book-status').value = b.status||'Reading';
  document.getElementById('book-rating').value = b.rating||0;
  document.getElementById('book-pages').value = b.pages||0;
  document.getElementById('book-current').value = b.currentPage||0;
  document.getElementById('book-genre').value = b.genre||'';
  document.getElementById('book-format').value = b.format||'Paperback';
  document.getElementById('book-notes').value = b.notes||'';
  document.getElementById('book-modal').style.display='flex';
}
function closeBookModal() { document.getElementById('book-modal').style.display='none'; }
function saveBook() {
  var title = document.getElementById('book-title').value.trim();
  var author = document.getElementById('book-author').value.trim();
  if (!title || !author) { toast('Title and author are required'); return; }
  var books = getBooks();
  var entry = {
    id: editingBookId || Date.now(),
    title: title, author: author,
    status: document.getElementById('book-status').value,
    rating: parseFloat(document.getElementById('book-rating').value)||0,
    pages: parseInt(document.getElementById('book-pages').value)||0,
    currentPage: parseInt(document.getElementById('book-current').value)||0,
    genre: document.getElementById('book-genre').value.trim(),
    format: document.getElementById('book-format').value,
    notes: document.getElementById('book-notes').value.trim(),
    dateAdded: today(),
    archived: false,
  };
  if (editingBookId) {
    save(KEYS.books, books.map(function(b){return b.id===editingBookId?Object.assign({},b,entry):b}));
  } else {
    save(KEYS.books, books.concat([entry]));
  }
  closeBookModal();
  renderAll();
  toast(editingBookId ? 'Book updated!' : 'Book added!');
}
window.showAddBook = showAddBook;
window.editBook = editBook;
window.closeBookModal = closeBookModal;
window.saveBook = saveBook;

// ── Wishlist modal ────────────────────────────────────────────
function showAddWish() {
  document.getElementById('wish-modal-title').textContent = 'Add to wishlist';
  ['wish-title','wish-author','wish-notes'].forEach(function(id){document.getElementById(id).value='';});
  document.getElementById('wish-priority').value='high';
  document.getElementById('wish-id').value='';
  document.getElementById('wish-modal').style.display='flex';
}
function closeWishModal() { document.getElementById('wish-modal').style.display='none'; }
function saveWish() {
  var title = document.getElementById('wish-title').value.trim();
  if (!title) { toast('Title is required'); return; }
  var items = getWish();
  var id = parseInt(document.getElementById('wish-id').value)||null;
  var entry = {
    id: id||Date.now(), title: title,
    author: document.getElementById('wish-author').value.trim(),
    priority: document.getElementById('wish-priority').value,
    notes: document.getElementById('wish-notes').value.trim(),
  };
  save(KEYS.wishlist, id ? items.map(function(w){return w.id===id?entry:w}) : items.concat([entry]));
  closeWishModal();
  renderWishlist();
  toast('Added to wishlist!');
}
window.showAddWish = showAddWish;
window.closeWishModal = closeWishModal;
window.saveWish = saveWish;

// ── Log modal ────────────────────────────────────────────────
function showLogSession() {
  var books = getBooks().filter(function(b){return !b.archived&&b.status==='Reading'});
  var sel = document.getElementById('log-book');
  sel.innerHTML = '<option value="">— Select a book —</option>' +
    books.map(function(b){return '<option value="' + b.id + '">' + esc(b.title) + '</option>'}).join('');
  document.getElementById('log-pages').value='';
  document.getElementById('log-minutes').value='';
  document.getElementById('log-date').value=today();
  document.getElementById('log-note').value='';
  document.getElementById('log-modal').style.display='flex';
}
function closeLogModal() { document.getElementById('log-modal').style.display='none'; }
function saveSession() {
  var bookId = parseInt(document.getElementById('log-book').value)||0;
  var pages = parseInt(document.getElementById('log-pages').value)||0;
  var minutes = parseInt(document.getElementById('log-minutes').value)||0;
  var date = document.getElementById('log-date').value;
  if (!bookId || !date) { toast('Please select a book and date'); return; }
  var books = getBooks();
  var book = books.find(function(b){return b.id===bookId});
  if (!book) return;
  var session = { id: Date.now(), bookId: bookId, bookTitle: book.title, pages: pages, minutes: minutes, date: date, note: document.getElementById('log-note').value.trim() };
  save(KEYS.sessions, [session].concat(getSessions()));
  // update currentPage
  if (pages > 0) {
    save(KEYS.books, books.map(function(b){ return b.id===bookId ? Object.assign({},b,{currentPage:Math.min(b.pages||0,(b.currentPage||0)+pages)}) : b; }));
  }
  closeLogModal();
  renderAll();
  toast('Session logged!');
}
window.showLogSession = showLogSession;
window.closeLogModal = closeLogModal;
window.saveSession = saveSession;

// ── Utils ────────────────────────────────────────────────────
function esc(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function today() { return new Date().toISOString().slice(0,10); }
function toast(msg) {
  var el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(function(){el.classList.remove('show')},2500);
}

// ── Boot ────────────────────────────────────────────────────
(function boot() {
  var s = getSettings();
  if (!s.userName) {
    document.getElementById('name-screen').style.display='flex';
  } else {
    showApp();
  }
})();

})();
</script>
</body>
</html>`;
