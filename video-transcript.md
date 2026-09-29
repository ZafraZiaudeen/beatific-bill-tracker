# Video Transcript — Book Tracker, Budget Planner & Content Calendar

> **Recording notes:**
> - Each `[ACTION]` line is a screen cue — do the action, then speak the next line.
> - Pause 1–2 seconds after each `[ACTION]` before speaking.
> - Sections marked `---` are natural cut/edit points.

---

## INTRO

[ACTION: Show project landing page or file list in VS Code / browser tab bar]

Hey everyone, welcome back.

Today I'm doing a full walkthrough of three apps I built — a **Book Tracker**, a **Budget Planner**, and a **Content Calendar**. All three run entirely in the browser, with zero accounts, zero sign-ups, and zero data sent to any server. Everything lives on your device.

Let's jump straight in.

---

## APP 1 — BOOK TRACKER (Blush Bookroom)

---

### Opening & First Launch

[ACTION: Open book-tracker-app.html in the browser — first time, no data]

This is the **Book Tracker** — your private, offline reading journal. No accounts, no cloud sync, no subscriptions. Everything lives right here in your browser.

[ACTION: Show the name entry screen]

On first launch you get a simple welcome screen asking for your name. Type it in and hit "Get started" — or press Enter — and you're in.

The app has seven sections: **Overview, Library, Reading Log, Wishlist, Insights, Notes,** and **Settings.** Let me take you through each one.

---

### Overview Page

[ACTION: You're already on Overview — point to the page]

The Overview is your reading dashboard — a snapshot of everything at once.

[ACTION: Point to the reading goal ring]

At the top left is your **Yearly Reading Goal** — a circular progress ring showing how many books you've finished this year versus your target. Underneath the ring it tells you whether you're on pace, ahead, or behind based on how many months have passed. So if your goal is 24 books and it's halfway through the year, you'd need 12 done to be on pace.

[ACTION: Point to the four stat tiles]

Below that are four stat tiles: **Reading Time** in hours this year, **Pages Read** this year, your current **Day Streak** — consecutive days where you read at least something — and your **Average Rating** across all books.

[ACTION: Point to the Currently Reading card]

The **Currently Reading** card shows the book you're actively in — the cover, title, author, your current page out of the total, and a progress bar with the percentage. If you're not reading anything right now it'll nudge you to pick something.

[ACTION: Point to the heatmap]

Then there's a **Reading Activity Heatmap** — 21 weeks by 7 days, just like GitHub's contribution graph. Each dot gets darker green the more sessions you had that day. It's a really satisfying visual of your reading consistency over the past five months.

[ACTION: Point to the Next Up widget]

The **Next Up** widget shows the top three books from your wishlist sorted by priority — so your "read next" picks are always one click away.

[ACTION: Point to the Backup reminder]

And at the bottom, a **Backup reminder** card. Since your data lives locally, this reminds you to export every 30 days. Hit "Back up now" and it downloads a JSON file of your entire library, sessions, notes, and wishlist.

---

### Library Page

[ACTION: Click Library in the sidebar]

The **Library** is where all your books live.

[ACTION: Show the filter tabs at the top]

Across the top are **status filter tabs**: All Books, Reading, Finished, Paused, DNF — "Did Not Finish" — Favorites, and Archived. Click any tab to filter down instantly.

[ACTION: Show the sort dropdown and search bar]

You can **sort** by date added, title A to Z, author A to Z, or rating. And there's a **search bar** for finding a specific book by title or author. There's also a **genre filter** dropdown that's populated from the tags on your books.

[ACTION: Toggle between grid and list view]

You can view your library as a **grid** — showing cover art in a nice masonry-style layout — or switch to a **list view** if you prefer the tabular format.

[ACTION: Click on a book to show the right detail panel]

Click on any book and a **detail panel** slides open on the right. You see the cover, title, author, status badge, your star rating, and a page progress bar. Below that is metadata — format, ISBN, publication year, total pages — then ownership info like where you got the book and when you added it, your tags, and your notes.

From the detail panel you can edit the book, change its status, or archive it. **Archiving** is a soft delete — the book disappears from your main view but you can always bring it back from the Archived tab.

---

### Adding a Book

[ACTION: Click the "Add book" button]

Hit the **Add Book** button in the top bar to open the book modal.

[ACTION: Show the Search Online tab]

There are two tabs. The first is **Search Online** — you type a title or author and it searches Open Library first, then falls back to Google Books if needed. Results come back with cover art, author, publication year, and page count. Hit Add on any result and it fills everything in for you automatically, including downloading the cover.

[ACTION: Switch to the Add Manually tab]

The second tab is **Add Manually** — for books not in the database or if you prefer doing it yourself. Fill in the title, author, page count, status, your rating, genre, series, where you got it, and any notes. You can also **upload a cover image** — drag and drop or click to browse — and it's stored right in your browser as a base64 image, no upload to any server.

[ACTION: Show the star rating]

The star rating goes from 0 to 5 in half-star increments. Click the star you want.

---

### Logging Pages

[ACTION: Click "Log pages" on a book in the library]

From any book you can hit **Log Pages** to record a reading session.

[ACTION: Show the log session modal]

The modal shows your current page and total pages. You update your current page — the "pages read this session" counter updates automatically. Add how many minutes you read, pick the date, and choose a **mood** for the session: thoughtful, curious, focused, slow burn, strange, inspired — or type in your own custom mood.

There's also a short **session note** field if you want to capture a thought while it's fresh.

Hit Save and the session is logged, your current page updates, and if you've reached the last page the book automatically gets marked as **Finished.**

---

### Reading Log Page

[ACTION: Click Reading Log in the sidebar]

The **Reading Log** is a full history of every reading session you've ever had.

[ACTION: Point to the date strip at the top]

At the top there's a **19-day scrollable date strip**. Each day shows green dots for how many sessions you had. Click a day to filter the session list below to just that day.

[ACTION: Point to the session table]

The main table shows each session with the date, book title, pages read, duration, page range, and mood. Click any row for a **session detail** — pace in pages per hour, your note, everything.

[ACTION: Point to the right sidebar]

The right sidebar shows your **This Week** stats — total pages, total time, and average reading pace — plus a mini full-month calendar where days you read are highlighted green.

---

### Live Reading Timer

[ACTION: Click "Start a live session" button]

You can also start a **live reading session** directly from the Reading Log.

[ACTION: Show the Start Session dialog]

Pick your book from the dropdown, set what page you're starting at, choose a starting mood, and hit **Start timer.**

[ACTION: Show the Active Session dialog with the running timer]

A timer starts counting — hours, minutes, seconds — in large monospace text. As you read, you update your current page using the input field or the quick-add buttons: **+5, +10, +25 pages.** You can pause and resume the timer if you take a break.

[ACTION: Click Finish Session]

When you're done, hit **Finish Session.** A save dialog lets you confirm your final page, add a mood and a note, then saves the session with the exact duration the timer recorded.

You can also **log a past session** if you forgot to track in real time — pick the book, start page, end page, duration, and date.

---

### Wishlist Page

[ACTION: Click Wishlist in the sidebar]

The **Wishlist** is your "to be read" list — all the books you want to get to.

[ACTION: Show the three priority groups]

Books are organized into three priority groups: **Next Up** — your immediate picks — **High Priority**, and **Someday**. Within each group you can reorder books by moving them up or down.

[ACTION: Show the right sidebar]

The right sidebar shows a selected book with its cover, title, author, and a "why do I want to read this?" blurb you can write when adding it. There's a **Start Reading** button to instantly move it into your library as your active read.

There's also a **Shuffle** button — if you can't decide what's next, hit Shuffle and it picks a random book from your wishlist.

[ACTION: Show the Add to Wishlist form]

When adding a book to your wishlist you fill in title, author, series, page count, priority, genres, and a blurb about why you want to read it.

[ACTION: Right-click or show the 3-dot menu]

The three-dot menu on each book lets you edit it, start reading it, move it between priority groups, reorder it, or remove it. If you remove it you get the option to move it to your library instead of just deleting it.

---

### Insights Page

[ACTION: Click Insights in the sidebar]

The **Insights page** is your reading analytics — three tabs covering different time frames.

---

#### Year Tab

[ACTION: Stay on or click the Year tab]

The **Year** tab gives you the full picture of your reading year.

[ACTION: Point to the pace projection chart]

The **Pace Projection** is a line chart showing your actual cumulative books read versus where you need to be to hit your yearly goal. If the lines are diverging you know you need to pick up the pace.

[ACTION: Point to the bar chart]

**Books Finished by Month** is a bar chart — green for actual finished books, light green for your projected finish based on current pace. Great for seeing your most productive reading months.

[ACTION: Point to the dual-axis chart]

**Pages vs Reading Time** is a dual-axis line chart — pages on the left axis, hours on the right — so you can see if your pace in pages per hour is improving.

[ACTION: Point to the donut chart]

The **Genre Breakdown** is a donut pie chart showing what genres you actually read versus what you think you read. Always humbling.

[ACTION: Point to the dot grid]

**Weekday Reading Rhythm** is a 7-by-4 dot grid — days of the week across, quarters of the day down. Dot size and opacity tell you when you tend to read. Are you a morning reader? Late night? The data will tell you.

---

#### Month Tab

[ACTION: Click the Month tab]

The **Month** tab zooms into a single month. Use the navigation arrows to move between months.

You get four stat tiles — books finished, pages, reading time, and pages per hour — plus a full calendar view of that month with green dots on days you read.

There's a list of books you finished that month, a bar chart of sessions broken down by week, and a **Month Reflection** text area where you can write a free-form note about your reading that month. Each month gets its own reflection saved separately.

---

#### Pace Tab

[ACTION: Click the Pace tab]

The **Pace** tab is all about your reading speed.

Your current **pages per hour** sits large at the top. Below that is a monthly line chart of your pace over time, a bar chart of average pages per session by month, and your top 5 books ranked by reading pace — useful for seeing which books you flew through versus which ones made you slow down.

---

### Notes Page

[ACTION: Click Notes in the sidebar]

The **Notes page** is your reading notebook — a place to save quotes, reflections, summaries, and questions from your books.

[ACTION: Show the three-panel layout]

The layout is three panels: a list of notes on the left, the selected note in the center, and a sidebar on the right.

[ACTION: Show the filter tabs and mood filter]

Filter tabs at the top let you view All notes, just Quotes, just Reflections, or your Favorites. There's also a **mood filter** dropdown — if you tagged a note with "melancholic" you can pull up all your melancholic readings at once. And a full-text search across note text and book titles.

[ACTION: Click Add Note]

Hit **Add Note** to open the note editor. Pick the book from a dropdown, choose the note type — Quote, Reflection, Summary, or Question — optionally add a page number, write the note text, and add a personal reaction note in a handwritten-style font.

[ACTION: Show the mood chips]

Choose one or more **moods** for the note: thoughtful, strange, slow burn, political, melancholic, other — or type a custom mood. Toggle the **Favorite** star if it's a passage you'll want to find again.

[ACTION: Show a note in the center panel]

In the center panel, selected notes display with large serif quote marks and italic text, the book attribution below, and your personal note in the handwritten font. You can copy the quote to your clipboard with one button — great for sharing a passage or pasting it somewhere.

[ACTION: Point to the right sidebar]

The right sidebar has a **Random Note** widget — it picks a note at random from your collection and shows it to you. Great for rediscovering things you'd forgotten. Hit Shuffle to get a different one.

---

### Settings Page

[ACTION: Click Settings in the sidebar]

The **Settings page** covers your data, privacy, and preferences.

[ACTION: Show the name input]

You can update your **name** at any time.

[ACTION: Show the PIN section]

You can set a **PIN** to lock the app when you walk away from your computer. The PIN is stored as a cryptographic hash — the raw PIN is never saved anywhere.

[ACTION: Show the export/import section]

The **Portability** section has three export options:

- **Export JSON** — a full backup of everything: books, sessions, notes, wishlist, settings. One file, download it anywhere.
- **Export CSV** — exports just your book list as a spreadsheet-friendly file.
- **Import** — drag and drop a JSON or CSV file to restore your data or migrate from another device.

[ACTION: Show the yearly goal input]

Under **Backup & Goal** you set your **Yearly Reading Goal** — the number that drives the progress ring on the Overview. You can also toggle a reminder to back up every 30 days.

[ACTION: Show the Danger Zone]

At the bottom is the **Danger Zone** — a "Clear all data" button that wipes everything after a confirmation dialog. Useful if you want a fresh start.

---

That's the full Book Tracker. A private, offline reading journal with a live timer, full analytics, a wishlist, a quote notebook, and everything you need to build a serious reading habit. Now let's look at the Budget Planner.

---
---

## APP 2 — LEDGERLY (Budget Planner)

---

### Opening & Onboarding

[ACTION: Open budget-planner-app.html in the browser]

This is **Ledgerly** — a full personal finance app. Budget, bills, goals, debt, net worth — it's all here.

[ACTION: If first run, show the onboarding modal]

On first launch, it asks you a few quick setup questions: your name, your monthly income, and which budget method you want to use. We'll cover those methods in a moment.

Fill those in and you're taken straight to the dashboard.

---

### Sidebar

[ACTION: Point to the sidebar]

The sidebar has the Ledgerly logo and name at the top, and navigation links for every section of the app — Dashboard, Budget, Transactions, Bills, Accounts, Goals, Debt Planner, Net Worth, Reports, Categories, Security, and Help.

At the bottom there's the privacy note again: "Offline · data stays on this device."

On mobile, the sidebar collapses to a hamburger menu so it works on smaller screens too.

---

### Dashboard

[ACTION: Click Dashboard in the sidebar]

The **Dashboard** gives you a bird's-eye view of your finances.

At the top there's a greeting with the current month. Then you get a **cash flow bar chart** — green bars for income, rose-colored bars for spending — so you can see at a glance whether you're earning more than you're spending month by month.

Alongside that is a **net worth sparkline** — a mini line chart showing how your total net worth has trended over time.

Below those charts you see your **sinking funds** with color-coded progress bars, this month's **upcoming bills** with due dates, and your **account balances** at a glance.

---

### Budget Page

[ACTION: Click Budget in the sidebar]

The **Budget page** is the heart of Ledgerly. It supports three different budget methods, and you can switch between them.

[ACTION: Show the budget method selector if visible]

**Zero-based budgeting** — every dollar of your income is assigned a job. You allocate money to categories until you hit zero. Nothing unaccounted for.

**50/30/20** — splits your income automatically: 50% to needs, 30% to wants, and 20% to savings. Great if you want a simple structure without micro-managing categories.

**Paycheck budgeting** — useful if you're paid bi-weekly or weekly. You set your first pay date and it syncs your budget cycle to your actual paychecks.

Whichever method you choose, you see your **budget categories** laid out with progress bars showing how much you've budgeted versus how much you've actually spent. Categories are grouped — Income, Needs, Wants, Savings, Debt, Other.

---

### Transactions

[ACTION: Click Transactions in the sidebar]

The **Transactions page** is your spending log.

[ACTION: Click Add Transaction or show the transaction form]

You can add a new transaction by filling in: the merchant name, the date, the category it belongs to, which account it came from, and the amount. You can also add notes.

Positive amounts are income, negative amounts are expenses. Transactions automatically feed into your budget totals and your account balances.

You can edit or delete any transaction, and they all sync with your budget categories in real time.

---

### Bills

[ACTION: Click Bills in the sidebar]

**Bills** are recurring payments — rent, subscriptions, utilities, anything that comes out on a regular schedule.

[ACTION: Click Add Bill or show the bill form]

When you add a bill you give it a name, a category, the amount, the due day of the month, and whether it's on autopay. You can also set start and end dates for bills that aren't permanent.

[ACTION: Show the Mark Paid button or record payment flow]

When a bill is due, you can hit **Mark Paid** directly from this page. Ledgerly will automatically create a transaction for that payment and deduct it from the linked account balance — so you don't have to do it twice.

---

### Accounts

[ACTION: Click Accounts in the sidebar]

The **Accounts page** tracks all your financial accounts — checking, savings, credit cards, investments, loans, mortgage, whatever you have.

[ACTION: Click Add Account or show the account form]

For each account you enter the name, institution, account number, type, and opening balance. Ledgerly groups them automatically by type.

You can toggle visibility per account to control whether it shows up on the dashboard, in reports, or in your net worth calculation. There's also a reconcile option to mark when you've verified the balance against your actual statement.

---

### Goals

[ACTION: Click Goals in the sidebar]

The **Goals page** is for saving toward specific targets — an emergency fund, a vacation, a big purchase, or a sinking fund for irregular expenses.

[ACTION: Click Add Goal or show a goal card]

You give each goal a name, a target amount, a monthly contribution, and a target date. Ledgerly automatically figures out the goal type — emergency fund, vacation, purchase — and applies the right icon and color.

[ACTION: Click on a goal to open the detail view]

Click into any goal to see the **Goal Detail view** — a full contribution history and a projected finish date based on your current monthly contribution. You can add individual contributions here too, manually logging money you've put toward the goal.

---

### Debt Planner

[ACTION: Click Debt Planner in the sidebar]

The **Debt Planner** helps you map out and pay off debt strategically.

[ACTION: Click Add Debt or show a debt entry]

You can add each debt — credit cards, student loans, car payments — with the balance, APR, minimum payment, and any extra payment you want to throw at it.

[ACTION: Show the strategy toggle if visible]

Then you choose a payoff strategy:

**Snowball** — pay off the smallest balance first for quick psychological wins.

**Avalanche** — attack the highest interest rate first to save the most money overall.

Ledgerly runs a simulation and shows you your projected payoff timeline so you can see exactly when you'll be debt-free.

---

### Net Worth

[ACTION: Click Net Worth in the sidebar]

The **Net Worth page** calculates your total financial picture — assets minus liabilities — in real time based on your account balances.

It breaks down exactly which accounts are counting as assets and which are liabilities, and you can save a monthly snapshot so you can track how your net worth grows over time.

---

### Reports

[ACTION: Click Reports in the sidebar]

The **Reports page** shows your cashflow history — income versus spending — across multiple months so you can spot trends over time.

---

### Categories

[ACTION: Click Categories in the sidebar]

**Categories** is where you manage your budget categories.

[ACTION: Click Add Category or show the category form]

You can create custom categories with a name, a color, an icon, and assign it to a group — Needs, Wants, Savings, and so on. Starter categories are pre-loaded so you don't have to build from scratch.

If you rename a category, Ledgerly automatically updates every transaction and bill that was using it — no orphaned data.

---

### Security & Data

[ACTION: Click Security in the sidebar]

The **Security and Data page** gives you control over your data.

You can set a **PIN** to lock the app when you step away from your computer. The PIN is stored as a secure hash, never in plain text.

You can toggle **light or dark theme**, set a backup reminder interval, export a full **JSON backup** of all your data, and import a backup to restore it. There's also a full reset option if you want to start fresh.

---

That's Ledgerly — a complete, private, offline-first personal finance app. Now let's look at the Content Calendar.

---
---

## APP 3 — THE CONTENT EDIT (Content Calendar)

---

### Opening & Onboarding

[ACTION: Open content-calendar-app.html in the browser]

This is **The Content Edit** — a content planning and scheduling app for creators and social media managers.

[ACTION: If first run, show the onboarding modal]

On first launch it asks for your name and sets up your workspace. That's it — no account, no email, you're straight in.

---

### Sidebar

[ACTION: Point to the sidebar]

The sidebar has all your navigation: Dashboard, Calendar, Pipeline, Ideas, Templates, Analytics, Campaigns, Platforms, and Settings.

There's also a **Composer** — the post editor — which you can open from almost anywhere in the app.

---

### Dashboard

[ACTION: Click Dashboard in the sidebar]

The **Dashboard** gives you a content overview at a glance.

At the top there's a stats row showing your counts for planned, scheduled, published, and idea posts. You can filter these by the current week, this month, or the last 30 days.

Below that there's a **week schedule panel** showing every post planned for the current week — with platform icons, content type, and status.

There's a **drafts panel** with your recent composer drafts so you can jump back into anything in progress.

A **feed preview grid** shows a visual layout of your posts for the period — so you can see how your grid or feed will look.

And a **saved ideas panel** for quick access to your idea list.

The search bar at the top searches across post titles, categories, types, and platforms — all at once.

---

### Calendar

[ACTION: Click Calendar in the sidebar]

The **Calendar page** is a monthly grid view of all your scheduled content.

[ACTION: Navigate months forward/backward]

You can move between months with the navigation arrows. Posts appear overlaid on their scheduled day.

[ACTION: Click on a day or drag a post]

You can open the Composer directly from any calendar day to plan a post for that date. And you can drag posts from one day to another to reschedule them — the change is reflected immediately across the calendar, the pipeline, and your drafts.

---

### Pipeline

[ACTION: Click Pipeline in the sidebar]

The **Pipeline** is a kanban board — four columns that represent your content workflow.

The stages are: **Ideas**, **Drafting**, **Ready**, and **Published**.

[ACTION: Drag a card between columns]

You move posts through the stages by dragging cards between columns. When you move something to "Ready" it shows up as Scheduled on the calendar. When you move it to "Published," it's marked as done.

[ACTION: Show the filters at the top]

You can filter the pipeline by platform, content type, campaign, or stage. There's also a search bar.

[ACTION: Show a pipeline card]

Each card shows the post title, platform icons, content type, scheduled date, and a checklist progress indicator — so you can see at a glance how complete a piece of content is.

You can also **import a schedule via CSV** if you're migrating from a spreadsheet.

---

### Composer

[ACTION: Click on a pipeline card or click New Post to open the Composer]

The **Composer** is where you actually create your posts.

[ACTION: Show the platform selector]

First you pick which platforms you're posting to — Instagram, TikTok, YouTube, Pinterest, or any custom platforms you've added.

If you're posting to multiple compatible platforms, you write one caption and it applies everywhere. If the platforms need different content, you switch to multi-slot mode and write independent versions for each.

[ACTION: Show the caption/hashtag fields]

For each post you write the **caption**, add your **hashtags**, write **alt text** for accessibility, set a **hook** and a **call to action**, and add a **first comment** for hashtags if you want to keep captions clean.

[ACTION: Show the media section]

You can attach media from your **Media Library** — photos and videos you've uploaded — and arrange them for a carousel or reel.

[ACTION: Show the preview]

The **Preview designer** shows a live visual mock of how your post will look — you can see the layout with your media, text, and overlays before you schedule it.

[ACTION: Show the pre-publish checklist]

Before scheduling there's a **pre-publication checklist**: caption is on-brand, hashtags are relevant, media is high quality, alt text is added, first comment included, and CTA is clear. Six green checkboxes and you're good to go.

[ACTION: Click Schedule]

Hit **Schedule** and the post is moved to the Ready stage in the pipeline and placed on the calendar at your chosen date and time.

---

### Ideas

[ACTION: Click Ideas in the sidebar]

The **Ideas page** is your content brainstorm board.

[ACTION: Click Add Idea]

You can capture an idea with a title, content type, category, theme, platform, and a description or notes. Ideas start with a status of "Idea."

[ACTION: Show the Convert to Pipeline button]

When you're ready to develop an idea into real content, hit **Convert to Pipeline** and it moves automatically into the Drafting stage in the kanban board — the idea and the pipeline card stay linked so you can trace it back.

You can filter ideas by status: Idea, Draft, or Planned.

---

### Templates

[ACTION: Click Templates in the sidebar]

**Templates** let you save your best-performing post structures so you can reuse them.

[ACTION: Click Add Template or show a template card]

Each template stores a post type, platform, hook, body copy, call to action, and hashtags. You can create templates for different content formats — educational posts, promotional content, engagement hooks, whatever works for you.

[ACTION: Click Use Template]

Hit **Use Template** on any template and the Composer opens pre-filled with all that content — ready to customize for your next post.

You can also duplicate, archive, or delete templates.

---

### Campaigns

[ACTION: Click Campaigns in the sidebar]

**Campaigns** group related posts together under one umbrella — a product launch, a seasonal push, a themed content series.

[ACTION: Click Add Campaign or show a campaign card]

Each campaign has a name, a status — draft, active, or completed — a start and end date, a goal, and the platforms it covers.

When you delete a campaign, Ledgerly cleanly unlinks it from all the posts and drafts that were part of it — no orphaned data.

---

### Analytics

[ACTION: Click Analytics in the sidebar]

The **Analytics page** is for tracking how your posts actually performed after publishing.

[ACTION: Show the performance record form]

Since this is a local app with no platform API connections, you enter performance data manually: views, likes, comments, saves, shares, and clicks for each post.

Over time this builds a picture of what content types and formats work best for you, without handing your data to any third party.

---

### Platforms

[ACTION: Click Platforms in the sidebar]

The **Platforms page** lets you configure which social platforms are active in your workspace.

Default platforms include Instagram, TikTok, YouTube, and Pinterest. Each platform has a list of supported post types — reels, carousels, stories, static posts — so the Composer knows what options to show when you select that platform.

You can also add **custom platforms** if you're posting somewhere not in the default list.

---

### Settings

[ACTION: Click Settings in the sidebar]

The **Settings page** has everything for personalizing the app.

[ACTION: Show the theme toggle]

Toggle between **light and dark theme**. You can also pick from four accent colors to match your brand aesthetic.

[ACTION: Show other settings]

Set your **date format**, choose what day the week starts on, and configure your **monthly content goal** — how many posts you want to publish each month.

You can set **per-platform posting targets** so the dashboard can show you how on-track you are for each platform separately.

The **backup settings** let you configure a reminder interval — every 3, 7, 14, or 30 days — so you never lose your content plans. You can export a full workspace backup as a JSON file and import it on any device.

And if you want a clean slate, **Clear Workspace Data** wipes everything including your media library.

---
---

## OUTRO

[ACTION: Show all three apps side by side, or return to a neutral screen]

And that's it — three complete, offline-first apps.

A **Book Tracker** for readers who want to build a reading habit and keep their library private.

A **Budget Planner** for anyone who wants full visibility of their finances without handing their data to a subscription service.

And a **Content Calendar** for creators who want to plan, schedule, and track content without being locked into a platform's ecosystem.

Everything runs locally in your browser. No accounts. No tracking. No subscriptions. Just tools that work for you.

If you want to check these out, I'll link them in the description below. Thanks for watching, and I'll see you in the next one.

---

*End of transcript.*
