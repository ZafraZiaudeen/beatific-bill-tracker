export const bookTrackerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Book Tracker</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root {
  --bg: #f4efe6; --sidebar-bg: #ffffff; --card-bg: #ffffff;
  --green-dark: #2d4a3e; --green-mid: #4a7c5f; --green-light: #c8ddd2; --green-faint: #e8f0eb;
  --text-primary: #1a1a1a; --text-muted: #8a8a8a; --border: #e8e2d8; --border-card: #ede8df;
  --shadow: 0 1px 4px rgba(0,0,0,.05), 0 2px 8px rgba(0,0,0,.04); --radius: 12px;
  --font-serif: 'Lora', Georgia, serif; --font-sans: 'Inter', -apple-system, sans-serif;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;overflow:hidden}
body{font-family:var(--font-sans);background:var(--bg);color:var(--text-primary);font-size:13px;line-height:1.5;-webkit-font-smoothing:antialiased}
button{cursor:pointer;font:inherit;border:none;background:none;color:inherit}
input{font:inherit}
svg{display:block;flex-shrink:0}
.app{display:grid;grid-template-columns:180px 1fr;height:100vh;overflow:hidden}
.sidebar{background:var(--sidebar-bg);border-right:1px solid var(--border);display:flex;flex-direction:column;overflow:hidden}
.sb-logo{padding:18px 14px 14px;display:flex;align-items:center;gap:9px}
.sb-logo-icon{width:30px;height:30px;background:var(--green-dark);border-radius:7px;display:flex;align-items:center;justify-content:center}
.sb-logo-icon svg{width:16px;height:16px}
.sb-nav{flex:1;padding:2px 8px;display:flex;flex-direction:column;gap:1px;overflow-y:auto}
.nav-item{display:flex;align-items:center;gap:8px;padding:7.5px 10px;border-radius:8px;color:#5a5a5a;font-size:13px;font-weight:500;transition:background .13s,color .13s;cursor:pointer;width:100%;text-align:left}
.nav-item svg{width:15px;height:15px}
.nav-item:hover{background:var(--green-faint);color:var(--green-dark)}
.nav-item.active{background:var(--green-dark);color:#fff}
.sb-footer{padding:10px 13px 13px;border-top:1px solid var(--border);display:flex;align-items:flex-start;gap:6px;color:var(--text-muted);font-size:11px;line-height:1.45}
.sb-footer svg{width:13px;height:13px;margin-top:1px;flex-shrink:0;color:#aaa}
.main{display:flex;flex-direction:column;overflow:hidden;background:var(--bg)}
.topbar{display:flex;align-items:center;gap:8px;padding:20px 28px 14px;flex-shrink:0}
.topbar-heading{font-family:var(--font-serif);font-size:28px;font-weight:400;flex:1;letter-spacing:-0.2px}
.search-wrap{position:relative;flex-shrink:0}
.search-wrap svg{position:absolute;left:10px;top:50%;transform:translateY(-50%);width:13px;height:13px;color:#bbb;pointer-events:none}
.search-wrap input{border:1px solid var(--border);border-radius:20px;padding:6.5px 14px 6.5px 30px;font-size:12.5px;background:#fff;width:220px;outline:none;transition:border-color .15s}
.search-wrap input::placeholder{color:#c0bbb4}
.search-wrap input:focus{border-color:var(--green-light)}
.btn-icon{width:33px;height:33px;border-radius:7px;border:1px solid var(--border);background:#fff;display:flex;align-items:center;justify-content:center;color:#666;transition:background .13s}
.btn-icon:hover{background:var(--green-faint);color:var(--green-dark)}
.btn-icon svg{width:15px;height:15px}
.btn-outline{border:1px solid var(--border);background:#fff;padding:6.5px 13px;border-radius:7px;font-size:12.5px;font-weight:500;color:#555;display:flex;align-items:center;gap:5px;transition:background .13s}
.btn-outline:hover{background:var(--green-faint)}
.btn-outline svg{width:13px;height:13px}
.btn-primary{background:var(--green-dark);color:#fff;padding:6.5px 13px;border-radius:7px;font-size:12.5px;font-weight:500;display:flex;align-items:center;gap:5px;cursor:pointer;transition:background .13s}
.btn-primary:hover{background:#243d32}
.btn-primary svg{width:13px;height:13px}
.content{flex:1;overflow-y:auto;padding:0 28px 28px;display:flex;flex-direction:column;gap:13px;scrollbar-width:thin;scrollbar-color:#d8d2c8 transparent}
.content::-webkit-scrollbar{width:5px}
.content::-webkit-scrollbar-thumb{background:#d8d2c8;border-radius:99px}
.card{background:var(--card-bg);border-radius:var(--radius);border:1px solid var(--border-card);box-shadow:var(--shadow);padding:20px 22px}
.card-label{font-size:9.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--text-muted);margin-bottom:14px}
.goal-inner{display:flex;align-items:center}
.goal-ring-section{display:flex;align-items:center;gap:20px;padding-right:24px;border-right:1px solid var(--border);margin-right:24px;flex-shrink:0}
.goal-ring-wrap{position:relative;width:114px;height:114px;flex-shrink:0}
.goal-ring-wrap svg{width:114px;height:114px}
.goal-ring-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1.15}
.goal-ring-num{font-size:20px;font-weight:700;letter-spacing:-0.5px}
.goal-ring-unit{font-size:11px;color:var(--text-muted)}
.goal-pace-lede{font-size:12px;color:var(--text-muted)}
.goal-pace-main{font-size:20px;font-weight:700;color:var(--green-dark);line-height:1.1}
.goal-pace-date{font-size:12.5px;color:var(--text-muted)}
.goal-stats{flex:1;display:grid;grid-template-columns:repeat(4,1fr);gap:8px 12px;align-content:center}
.stat-tile{display:flex;flex-direction:column;align-items:center;text-align:center;gap:5px}
.stat-icon{width:36px;height:36px;border-radius:50%;background:var(--green-faint);display:flex;align-items:center;justify-content:center;color:var(--green-dark)}
.stat-icon svg{width:17px;height:17px}
.stat-key{font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--text-muted)}
.stat-val{font-size:18px;font-weight:700;line-height:1;letter-spacing:-0.3px}
.stat-note{font-size:10.5px;color:var(--text-muted)}
.row3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:13px;align-items:start}
.cur-book{display:flex;gap:13px;align-items:flex-start;margin-bottom:14px}
.book-cover-main{width:72px;height:108px;border-radius:5px;flex-shrink:0;background:linear-gradient(155deg,#334e6a 0%,#1e3248 40%,#0f1e2e 75%,#0a131c 100%);position:relative;overflow:hidden;box-shadow:2px 3px 10px rgba(0,0,0,.3)}
.book-cover-main::after{content:'';position:absolute;left:0;top:0;bottom:0;width:5px;background:linear-gradient(to right,rgba(0,0,0,.25),transparent)}
.cur-title{font-size:14px;font-weight:600;line-height:1.3;margin-bottom:3px}
.cur-author{font-size:12px;color:var(--text-muted);margin-bottom:12px}
.cur-pages-row{display:flex;align-items:center;justify-content:space-between;font-size:12px;color:#555;margin-bottom:6px}
.progress-bar{height:5px;background:var(--green-faint);border-radius:99px;overflow:hidden}
.progress-bar-fill{height:100%;background:var(--green-dark);border-radius:99px}
.status-pill{display:inline-flex;align-items:center;gap:6px;padding:5px 11px;border-radius:20px;border:1px solid var(--border);font-size:12px;font-weight:500;color:#444;background:#fafaf8;cursor:pointer}
.status-dot{width:7px;height:7px;border-radius:50%;background:#3d7a58;flex-shrink:0}
.heatmap-months-row{display:flex;padding-left:28px;margin-bottom:3px}
.heatmap-month-lbl{font-size:10px;color:var(--text-muted)}
.heatmap-body{display:flex;gap:3px}
.heatmap-day-labels{display:flex;flex-direction:column;gap:2px;margin-right:2px}
.heatmap-day-lbl{font-size:8.5px;color:var(--text-muted);height:10px;line-height:10px;width:22px;text-align:right}
.heatmap-cols{display:flex;gap:2px}
.heatmap-col{display:flex;flex-direction:column;gap:2px}
.heatmap-cell{width:10px;height:10px;border-radius:2px}
.h0{background:#e4e9e5}.h1{background:#b8d4c4}.h2{background:#7aaa90}.h3{background:#4a7c5f}.h4{background:#2d4a3e}
.heatmap-legend{display:flex;align-items:center;gap:3px;font-size:10px;color:var(--text-muted);margin-top:6px;justify-content:flex-end}
.legend-cell{width:10px;height:10px;border-radius:2px}
.queue-list{display:flex;flex-direction:column;gap:10px;margin-bottom:12px}
.queue-item{display:flex;align-items:center;gap:10px}
.queue-cover{width:38px;height:56px;border-radius:4px;flex-shrink:0;box-shadow:1px 2px 6px rgba(0,0,0,.18)}
.qc1{background:linear-gradient(145deg,#2e4a62 0%,#1a2d3d 100%)}
.qc2{background:linear-gradient(145deg,#3a5040 0%,#1e3020 100%)}
.qc3{background:linear-gradient(145deg,#4a3050 0%,#281828 100%)}
.queue-title{font-size:12.5px;font-weight:600;line-height:1.3}
.queue-author{font-size:11px;color:var(--text-muted)}
.queue-handle{color:#d0ccc8;font-size:14px;cursor:grab;flex-shrink:0;user-select:none}
.btn-ghost{width:100%;border:1px solid var(--border);background:transparent;padding:8px;border-radius:8px;font-size:12.5px;font-weight:500;color:#666;text-align:center;cursor:pointer}
.btn-ghost:hover{background:var(--green-faint);color:var(--green-dark)}
.backup-inner{display:flex;align-items:center;gap:16px}
.backup-icon-circle{width:48px;height:48px;border-radius:50%;background:var(--green-faint);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--green-dark)}
.backup-icon-circle svg{width:22px;height:22px}
.backup-text{flex:1}
.backup-title{font-size:14px;font-weight:600;margin-bottom:3px}
.backup-desc{font-size:12px;color:var(--text-muted);line-height:1.5}
.backup-right{display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0}
.backup-date{font-size:11.5px;color:var(--text-muted)}
</style>
</head>
<body>
<div class="app">
  <aside class="sidebar">
    <div class="sb-logo">
      <div class="sb-logo-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
      </div>
    </div>
    <nav class="sb-nav">
      <button class="nav-item active">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
        Overview
      </button>
      <button class="nav-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
        Library
      </button>
      <button class="nav-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        Reading log
      </button>
      <button class="nav-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
        Wishlist
      </button>
      <button class="nav-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
        Insights
      </button>
      <button class="nav-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        Notes
      </button>
      <button class="nav-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
        Settings
      </button>
    </nav>
    <div class="sb-footer">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
      <div><div style="font-weight:600;color:#666">Offline by default</div><div>Nothing sent to any server</div></div>
    </div>
  </aside>
  <main class="main">
    <div class="topbar">
      <h1 class="topbar-heading">Good books, well kept.</h1>
      <div class="search-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" placeholder="Search books, authors, tags…">
      </div>
      <button class="btn-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg></button>
      <button class="btn-outline"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>Export</button>
      <button class="btn-primary"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Add book</button>
    </div>
    <div class="content">
      <div class="card">
        <div class="card-label">Yearly Goal</div>
        <div class="goal-inner">
          <div class="goal-ring-section">
            <div class="goal-ring-wrap">
              <svg viewBox="0 0 114 114"><circle cx="57" cy="57" r="47" fill="none" stroke="#e4e9e5" stroke-width="8.5"/><circle cx="57" cy="57" r="47" fill="none" stroke="#2d4a3e" stroke-width="8.5" stroke-dasharray="295.31" stroke-dashoffset="73.83" stroke-linecap="round" transform="rotate(-90 57 57)"/></svg>
              <div class="goal-ring-center"><span class="goal-ring-num">18 / 24</span><span class="goal-ring-unit">books</span></div>
            </div>
            <div class="goal-pace"><div class="goal-pace-lede">On pace to finish</div><div class="goal-pace-main">2 books ahead</div><div class="goal-pace-date">Sep 14</div></div>
          </div>
          <div class="goal-stats">
            <div class="stat-tile"><div class="stat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div><div class="stat-key">Reading Time</div><div class="stat-val">143h 28m</div><div class="stat-note">this year</div></div>
            <div class="stat-tile"><div class="stat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></div><div class="stat-key">Pages Read</div><div class="stat-val">5,482</div><div class="stat-note">this year</div></div>
            <div class="stat-tile"><div class="stat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg></div><div class="stat-key">Day Streak</div><div class="stat-val">27</div><div class="stat-note">days</div></div>
            <div class="stat-tile"><div class="stat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div><div class="stat-key">Avg Rating</div><div class="stat-val">4.23</div><div class="stat-note">from 13 books</div></div>
          </div>
        </div>
      </div>
      <div class="row3">
        <div class="card">
          <div class="card-label">Current Read</div>
          <div class="cur-book"><div class="book-cover-main"></div><div><div class="cur-title">The Left Hand<br>of Darkness</div><div class="cur-author">Ursula K. Le Guin</div><div class="cur-pages-row"><span>211 / 304 pages</span><span style="font-weight:600">69%</span></div><div class="progress-bar"><div class="progress-bar-fill" style="width:69%"></div></div></div></div>
          <button class="status-pill"><span class="status-dot"></span>Reading<span style="color:#bbb;font-size:9px;margin-left:2px">&#9660;</span></button>
        </div>
        <div class="card">
          <div class="card-label">Reading Activity</div>
          <div id="heatmap-container"></div>
        </div>
        <div class="card">
          <div class="card-label">Next Up</div>
          <div class="queue-list">
            <div class="queue-item"><div class="queue-cover qc1"></div><div class="queue-info"><div class="queue-title">The Dispossessed</div><div class="queue-author">Ursula K. Le Guin</div></div><div class="queue-handle">&#10783;</div></div>
            <div class="queue-item"><div class="queue-cover qc2"></div><div class="queue-info"><div class="queue-title">A Wizard of Earthsea</div><div class="queue-author">Ursula K. Le Guin</div></div><div class="queue-handle">&#10783;</div></div>
            <div class="queue-item"><div class="queue-cover qc3"></div><div class="queue-info"><div class="queue-title">The Telling</div><div class="queue-author">Ursula K. Le Guin</div></div><div class="queue-handle">&#10783;</div></div>
          </div>
          <button class="btn-ghost">View full queue</button>
        </div>
      </div>
      <div class="card">
        <div class="backup-inner">
          <div class="backup-icon-circle"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg></div>
          <div class="backup-text"><div class="backup-title">Backup reminder</div><div class="backup-desc">Your data lives only on this device.<br>Keep regular backups so your library is always safe.</div></div>
          <div class="backup-right"><button class="btn-outline">Back up now</button><div class="backup-date">Last backup: May 14, 2025</div></div>
        </div>
      </div>
    </div>
  </main>
</div>
<script>
(function(){
  var months=['Jan','Feb','Mar','Apr','May'],colsPerMonth=[4,4,5,4,4],days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  var preset=[[0,0,1,0,0,0,0],[0,1,0,0,1,0,0],[0,0,0,1,0,0,1],[1,0,0,0,1,0,0],[0,0,1,1,0,0,1],[0,1,0,0,1,0,0],[1,0,1,0,0,1,0],[0,1,0,1,0,1,0],[0,1,2,0,1,0,1],[1,2,0,1,0,1,0],[0,1,1,2,1,1,0],[2,0,1,2,1,0,2],[0,2,1,2,2,1,0],[2,1,1,2,1,2,1],[1,2,3,1,2,1,2],[2,3,2,1,3,2,1],[1,2,2,3,1,3,2],[3,2,3,2,3,1,2],[2,3,4,2,3,2,3],[3,4,3,3,2,3,2],[2,3,3,4,3,2,3]];
  var c=document.getElementById('heatmap-container');
  var mr=document.createElement('div');mr.className='heatmap-months-row';
  months.forEach(function(m,i){var el=document.createElement('div');el.className='heatmap-month-lbl';var n=colsPerMonth[i];el.style.width=(n*10+(n-1)*2)+'px';el.style.flexShrink='0';if(i>0)el.style.marginLeft='2px';el.textContent=m;mr.appendChild(el);});
  c.appendChild(mr);
  var body=document.createElement('div');body.className='heatmap-body';
  var dl=document.createElement('div');dl.className='heatmap-day-labels';
  days.forEach(function(d,i){var el=document.createElement('div');el.className='heatmap-day-lbl';el.textContent=[0,2,4].includes(i)?d:'';dl.appendChild(el);});
  body.appendChild(dl);
  var cw=document.createElement('div');cw.className='heatmap-cols';
  preset.forEach(function(col){var ce=document.createElement('div');ce.className='heatmap-col';col.forEach(function(v){var cell=document.createElement('div');cell.className='heatmap-cell h'+v;ce.appendChild(cell);});cw.appendChild(ce);});
  body.appendChild(cw);c.appendChild(body);
  var leg=document.createElement('div');leg.className='heatmap-legend';
  var ls=document.createElement('span');ls.textContent='Less';leg.appendChild(ls);
  [0,1,2,3,4].forEach(function(v){var el=document.createElement('div');el.className='legend-cell h'+v;leg.appendChild(el);});
  var ms=document.createElement('span');ms.textContent='More';leg.appendChild(ms);
  c.appendChild(leg);
})();
</script>
</body>
</html>`;
