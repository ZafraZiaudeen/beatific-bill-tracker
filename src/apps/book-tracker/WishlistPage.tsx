import { useState, useEffect, useRef } from "react";
import {
  Bookmark, Search, ChevronDown, Star, Plus, MoreVertical,
  Shuffle, Play, X, Cloud, Info,
} from "lucide-react";

const C = {
  bg: "#f4efe6",
  white: "#ffffff",
  green: "#2d4a3e",
  greenFaint: "#e8f0eb",
  border: "#e8e2d8",
  muted: "#8a8a8a",
  text: "#1a1a1a",
  gold: "#f5a623",
  blue: "#3b82f6",
  red: "#c0392b",
} as const;

const SERIF: React.CSSProperties = { fontFamily: "'Lora', Georgia, 'Times New Roman', serif" };

const INP: React.CSSProperties = {
  border: `1px solid ${C.border}`,
  borderRadius: 8,
  padding: "10px 14px",
  fontSize: 14,
  background: C.white,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
  fontFamily: "inherit",
  color: C.text,
};

type Priority = "next-up" | "high" | "someday";

interface WishlistBook {
  id: number;
  title: string;
  author: string;
  series?: string;
  seriesBook?: string;
  pages: number;
  priority: Priority;
  genres: string[];
  coverFrom: string;
  coverTo: string;
  coverUrl?: string;
  addedDate: string;
  blurb?: string;
  order: number;
}

const PRIORITY_LABELS: Record<Priority, string> = {
  "next-up": "Next up",
  "high": "High priority",
  "someday": "Someday",
};

const PRIORITY_ORDER: Priority[] = ["next-up", "high", "someday"];

const PRIORITY_BADGE: Record<Priority, { bg: string; text: string; dot?: string; star?: boolean }> = {
  "next-up": { bg: "#e6f4ec", text: "#2d7a4a", dot: "#3d9e5f" },
  "high":    { bg: "#fef9ec", text: "#9a6f00", star: true },
  "someday": { bg: "#eef4fe", text: "#1d4ed8", dot: "#3b82f6" },
};

const INITIAL_WISHLIST: WishlistBook[] = [];

const LS_KEY = "bt_wishlist";
const LIBRARY_KEY = "bt_books";

function loadWishlist(): WishlistBook[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr) && arr.length) return arr;
    }
  } catch {}
  return INITIAL_WISHLIST;
}

function persist(books: WishlistBook[]) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(books)); } catch {}
}

function moveToLibrary(book: WishlistBook) {
  try {
    const raw = localStorage.getItem(LIBRARY_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    const newBook = {
      id: Date.now(),
      title: book.title,
      author: book.author,
      status: "Reading",
      rating: 0,
      pages: book.pages,
      currentPage: 0,
      coverFrom: book.coverFrom,
      coverTo: book.coverTo,
      coverUrl: book.coverUrl,
      format: "Paperback",
      isbn: "",
      published: "",
      source: "Wishlist",
      dateAdded: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      location: "",
      tags: book.genres,
      notes: "",
    };
    localStorage.setItem(LIBRARY_KEY, JSON.stringify([...existing, newBook]));
  } catch {}
}

function allGenres(books: WishlistBook[]): string[] {
  const set = new Set<string>();
  books.forEach(b => b.genres.forEach(g => set.add(g)));
  return Array.from(set).sort();
}

function defaultSidebar(books: WishlistBook[]): WishlistBook | null {
  return books.find(b => b.priority === "next-up") ?? books[0] ?? null;
}

function BookCover({ book, w = 60, h = 90, showText = false }: {
  book: WishlistBook; w?: number; h?: number; showText?: boolean;
}) {
  if (book.coverUrl) {
    return (
      <div style={{ width: w, height: h, borderRadius: 6, overflow: "hidden", flexShrink: 0,
        boxShadow: "1px 2px 8px rgba(0,0,0,.3)" }}>
        <img src={book.coverUrl} alt={book.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    );
  }
  return (
    <div style={{ width: w, height: h, borderRadius: 6, flexShrink: 0, position: "relative", overflow: "hidden",
      background: `linear-gradient(155deg, ${book.coverFrom} 0%, ${book.coverTo} 100%)`,
      boxShadow: "1px 2px 8px rgba(0,0,0,.3)" }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4,
        background: "linear-gradient(to right, rgba(0,0,0,.3), transparent)" }} />
      {showText && (
        <div style={{ position: "absolute", inset: 0, padding: "12px 10px",
          display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <div style={{ fontSize: Math.max(9, Math.round(w * 0.09)), fontWeight: 700,
            color: "rgba(255,255,255,.9)", lineHeight: 1.2, textTransform: "uppercase",
            letterSpacing: "0.04em", wordBreak: "break-word" }}>
            {book.title}
          </div>
          <div style={{ fontSize: Math.max(8, Math.round(w * 0.07)), color: "rgba(255,255,255,.65)",
            marginTop: 4, lineHeight: 1.2 }}>
            {book.author}
          </div>
        </div>
      )}
    </div>
  );
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose?: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      onClick={e => { if (e.target === e.currentTarget) onClose?.(); }}>
      {children}
    </div>
  );
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const cfg = PRIORITY_BADGE[priority];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 500,
      background: cfg.bg, color: cfg.text, whiteSpace: "nowrap", flexShrink: 0 }}>
      {cfg.star
        ? <Star size={9} fill={C.gold} stroke="none" />
        : <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />}
      {PRIORITY_LABELS[priority]}
    </span>
  );
}

function AddEditDialog({ initial, existingBooks, onSave, onClose }: {
  initial?: WishlistBook;
  existingBooks: WishlistBook[];
  onSave: (book: WishlistBook) => void;
  onClose: () => void;
}) {
  const [title, setTitle]         = useState(initial?.title ?? "");
  const [author, setAuthor]       = useState(initial?.author ?? "");
  const [series, setSeries]       = useState(initial?.series ?? "");
  const [seriesBook, setSeriesBook] = useState(initial?.seriesBook ?? "");
  const [pages, setPages]         = useState(initial?.pages ?? 300);
  const [priority, setPriority]   = useState<Priority>(initial?.priority ?? "someday");
  const [genres, setGenres]       = useState(initial?.genres.join(", ") ?? "");
  const [blurb, setBlurb]         = useState(initial?.blurb ?? "");

  const isEdit = !!initial;
  const canSave = title.trim().length > 0 && author.trim().length > 0;

  function handleSave() {
    if (!canSave) return;
    const genreArr = genres.split(",").map(g => g.trim()).filter(Boolean);
    const groupBooks = existingBooks.filter(b => b.priority === priority && b.id !== (initial?.id ?? -1));
    const maxOrder = groupBooks.reduce((m, b) => Math.max(m, b.order), -1);

    const book: WishlistBook = {
      id: initial?.id ?? Date.now(),
      title: title.trim(),
      author: author.trim(),
      series: series.trim() || undefined,
      seriesBook: seriesBook.trim() || undefined,
      pages: Math.max(1, pages),
      priority,
      genres: genreArr,
      coverFrom: initial?.coverFrom ?? "#2d4a3e",
      coverTo: initial?.coverTo ?? "#1a2e26",
      coverUrl: initial?.coverUrl,
      addedDate: initial?.addedDate ?? new Date().toISOString().split("T")[0],
      blurb: blurb.trim() || undefined,
      order: isEdit && initial.priority === priority ? initial.order : maxOrder + 1,
    };
    onSave(book);
  }

  return (
    <Overlay onClose={onClose}>
      <div style={{ background: C.white, borderRadius: 16, width: "min(500px,92vw)",
        maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,.22)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "24px 28px 18px" }}>
          <div style={{ ...SERIF, fontSize: 22, fontWeight: 400, color: C.text }}>
            {isEdit ? "Edit book" : "Add to wishlist"}
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, display: "flex", alignItems: "center",
            justifyContent: "center", background: "none", border: "none", cursor: "pointer", color: C.muted }}>
            <X size={18} strokeWidth={1.8} />
          </button>
        </div>

        <div style={{ padding: "0 28px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase",
                letterSpacing: "0.08em", display: "block", marginBottom: 7 }}>Title *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Book title"
                style={INP} autoFocus />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase",
                letterSpacing: "0.08em", display: "block", marginBottom: 7 }}>Author *</label>
              <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Author name"
                style={INP} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase",
                letterSpacing: "0.08em", display: "block", marginBottom: 7 }}>Series</label>
              <input value={series} onChange={e => setSeries(e.target.value)} placeholder="Series name"
                style={INP} />
            </div>
            <div style={{ width: 90 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase",
                letterSpacing: "0.08em", display: "block", marginBottom: 7 }}>Book #</label>
              <input value={seriesBook} onChange={e => setSeriesBook(e.target.value)} placeholder="Book 1"
                style={INP} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase",
                letterSpacing: "0.08em", display: "block", marginBottom: 7 }}>Pages</label>
              <input type="number" value={pages} min={1}
                onChange={e => setPages(Math.max(1, Number(e.target.value) || 1))} style={INP} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase",
                letterSpacing: "0.08em", display: "block", marginBottom: 7 }}>Priority</label>
              <div style={{ position: "relative" }}>
                <select value={priority} onChange={e => setPriority(e.target.value as Priority)}
                  style={{ ...INP, appearance: "none", paddingRight: 32, cursor: "pointer" }}>
                  <option value="next-up">Next up</option>
                  <option value="high">High priority</option>
                  <option value="someday">Someday</option>
                </select>
                <ChevronDown size={14} color={C.muted} style={{ position: "absolute", right: 10,
                  top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              </div>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase",
              letterSpacing: "0.08em", display: "block", marginBottom: 7 }}>Genres / Tags</label>
            <input value={genres} onChange={e => setGenres(e.target.value)}
              placeholder="sci-fi, philosophical, classic…" style={INP} />
            <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>Separate with commas</div>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase",
              letterSpacing: "0.08em", display: "block", marginBottom: 7 }}>Why read it? <span style={{ fontWeight: 400, textTransform: "none" }}>(optional)</span></label>
            <textarea value={blurb} onChange={e => setBlurb(e.target.value)}
              placeholder="A short note about why this book interests you…"
              rows={3} style={{ ...INP, resize: "vertical", lineHeight: 1.6 }} />
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button onClick={onClose} style={{ flex: 1, padding: "11px 0", borderRadius: 8,
              border: `1px solid ${C.border}`, background: C.white,
              fontSize: 13.5, fontWeight: 500, color: C.text, cursor: "pointer" }}>Cancel</button>
            <button onClick={handleSave} disabled={!canSave} style={{ flex: 1, padding: "11px 0", borderRadius: 8,
              border: "none", background: canSave ? C.green : "#c4d4cc",
              color: "#fff", fontSize: 13.5, fontWeight: 600,
              cursor: canSave ? "pointer" : "not-allowed" }}>
              {isEdit ? "Save changes" : "Add to wishlist"}
            </button>
          </div>
        </div>
      </div>
    </Overlay>
  );
}

function RemoveDialog({ book, onRemove, onMoveToLibrary, onClose }: {
  book: WishlistBook;
  onRemove: () => void;
  onMoveToLibrary: () => void;
  onClose: () => void;
}) {
  return (
    <Overlay onClose={onClose}>
      <div style={{ background: C.white, borderRadius: 16, width: "min(440px,92vw)",
        padding: "32px 32px 28px", boxShadow: "0 24px 64px rgba(0,0,0,.22)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
        <div style={{ ...SERIF, fontSize: 22, fontWeight: 400, color: C.text, marginBottom: 22, textAlign: "center" }}>
          Remove from wishlist?
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 22, alignSelf: "stretch" }}>
          <BookCover book={book} w={70} h={100} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: C.text, lineHeight: 1.3 }}>{book.title}</div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{book.author}</div>
          </div>
        </div>

        <div style={{ fontSize: 13.5, color: C.muted, textAlign: "center", lineHeight: 1.6, marginBottom: 24 }}>
          This will remove the book from your reading queue.<br />Your library will not be affected.
        </div>

        <div style={{ display: "flex", gap: 10, width: "100%", marginBottom: 14 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "11px 0", borderRadius: 8,
            border: `1px solid ${C.border}`, background: C.white,
            fontSize: 13.5, fontWeight: 500, color: C.text, cursor: "pointer" }}>Cancel</button>
          <button onClick={onRemove} style={{ flex: 1, padding: "11px 0", borderRadius: 8,
            border: `1px solid ${C.red}`, background: C.white,
            fontSize: 13.5, fontWeight: 600, color: C.red, cursor: "pointer" }}>
            Remove from wishlist
          </button>
        </div>

        <button onClick={onMoveToLibrary} style={{ background: "none", border: "none",
          fontSize: 13, color: C.green, cursor: "pointer", textDecoration: "underline",
          textUnderlineOffset: 3, padding: 0 }}>
          Move to library instead
        </button>
      </div>
    </Overlay>
  );
}

function StartReadingDialog({ book, onStart, onClose }: {
  book: WishlistBook;
  onStart: (keepInWishlist: boolean) => void;
  onClose: () => void;
}) {
  const [keep, setKeep] = useState(false);

  return (
    <Overlay onClose={onClose}>
      <div style={{ background: C.white, borderRadius: 16, width: "min(440px,92vw)",
        maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,.22)" }}>
        <div style={{ ...SERIF, fontSize: 22, fontWeight: 400, color: C.text,
          textAlign: "center", padding: "28px 28px 20px" }}>
          Start reading
        </div>

        {/* Large cover */}
        <div style={{ margin: "0 28px", borderRadius: 10, overflow: "hidden",
          height: 220, position: "relative",
          background: `linear-gradient(155deg, ${book.coverFrom} 0%, ${book.coverTo} 100%)` }}>
          {book.coverUrl
            ? <img src={book.coverUrl} alt={book.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : (
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", padding: 24, gap: 8 }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: "rgba(255,255,255,.9)",
                  textAlign: "center", textTransform: "uppercase", letterSpacing: "0.06em", lineHeight: 1.3 }}>
                  {book.title}
                </div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,.65)", textAlign: "center" }}>
                  {book.author}
                </div>
              </div>
            )}
        </div>

        <div style={{ padding: "18px 28px 0", textAlign: "center" }}>
          <div style={{ fontSize: 17, fontWeight: 600, color: C.text }}>{book.title}</div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{book.author}</div>
        </div>

        <div style={{ padding: "20px 28px 28px", display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 14, color: C.text, textAlign: "center", lineHeight: 1.6 }}>
            Move this book from your wishlist to Reading?
          </div>

          {/* Keep in wishlist toggle */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 16px", border: `1px solid ${C.border}`, borderRadius: 10 }}>
            <span style={{ fontSize: 13.5, color: C.text }}>Keep in wishlist after starting</span>
            <button onClick={() => setKeep(k => !k)}
              style={{ width: 44, height: 24, borderRadius: 12, border: "none",
                background: keep ? C.green : "#ddd", transition: "background .15s",
                position: "relative", cursor: "pointer", flexShrink: 0 }}>
              <span style={{ position: "absolute", top: 2, left: keep ? 22 : 2,
                width: 20, height: 20, borderRadius: "50%", background: "#fff",
                transition: "left .15s", display: "block",
                boxShadow: "0 1px 3px rgba(0,0,0,.2)" }} />
            </button>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{ flex: 1, padding: "11px 0", borderRadius: 8,
              border: `1px solid ${C.border}`, background: C.white,
              fontSize: 13.5, fontWeight: 500, color: C.text, cursor: "pointer" }}>Cancel</button>
            <button onClick={() => onStart(keep)} style={{ flex: 1, padding: "11px 0", borderRadius: 8,
              border: "none", background: C.green, color: "#fff",
              fontSize: 13.5, fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
              <Play size={13} fill="#fff" stroke="none" /> Start reading
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            fontSize: 12, color: C.muted }}>
            <Info size={13} color={C.muted} />
            Your reading progress will begin at page 1.
          </div>
        </div>
      </div>
    </Overlay>
  );
}

export default function WishlistPage() {
  const [books, setBooks]             = useState<WishlistBook[]>(loadWishlist);
  const [search, setSearch]           = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterGenre, setFilterGenre] = useState<string>("all");
  const [showAdd, setShowAdd]         = useState(false);
  const [editBook, setEditBook]       = useState<WishlistBook | null>(null);
  const [removeBook, setRemoveBook]   = useState<WishlistBook | null>(null);
  const [startBook, setStartBook]     = useState<WishlistBook | null>(null);
  const [sidebarBook, setSidebarBook] = useState<WishlistBook | null>(() => defaultSidebar(loadWishlist()));
  const [menuOpen, setMenuOpen]       = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close 3-dot menu on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(null);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function update(updated: WishlistBook[]) {
    setBooks(updated);
    persist(updated);
    if (sidebarBook) {
      const still = updated.find(b => b.id === sidebarBook.id);
      setSidebarBook(still ?? defaultSidebar(updated));
    } else {
      setSidebarBook(defaultSidebar(updated));
    }
  }

  function handleSaveBook(book: WishlistBook) {
    const idx = books.findIndex(b => b.id === book.id);
    const updated = idx >= 0
      ? books.map(b => b.id === book.id ? book : b)
      : [...books, book];
    update(updated);
    setShowAdd(false);
    setEditBook(null);
  }

  function handleRemove(book: WishlistBook) {
    update(books.filter(b => b.id !== book.id));
    setRemoveBook(null);
  }

  function handleMoveToLibrary(book: WishlistBook) {
    moveToLibrary(book);
    update(books.filter(b => b.id !== book.id));
    setRemoveBook(null);
  }

  function handleStartReading(book: WishlistBook, keepInWishlist: boolean) {
    moveToLibrary(book);
    if (!keepInWishlist) update(books.filter(b => b.id !== book.id));
    setStartBook(null);
  }

  function handleMoveWithin(book: WishlistBook, dir: -1 | 1) {
    const group = books
      .filter(b => b.priority === book.priority)
      .sort((a, b2) => a.order - b2.order);
    const idx = group.findIndex(b => b.id === book.id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= group.length) return;
    const swapBook = group[swapIdx];
    const updated = books.map(b => {
      if (b.id === book.id) return { ...b, order: swapBook.order };
      if (b.id === swapBook.id) return { ...b, order: book.order };
      return b;
    });
    update(updated);
    setMenuOpen(null);
  }

  function handleChangePriority(book: WishlistBook, priority: Priority) {
    const groupBooks = books.filter(b => b.priority === priority && b.id !== book.id);
    const maxOrder = groupBooks.reduce((m, b) => Math.max(m, b.order), -1);
    const updated = books.map(b => b.id === book.id
      ? { ...b, priority, order: maxOrder + 1 } : b);
    update(updated);
    setMenuOpen(null);
  }

  // Filtering
  const genres = allGenres(books);
  const filtered = books.filter(b => {
    const q = search.toLowerCase();
    if (q && !b.title.toLowerCase().includes(q) && !b.author.toLowerCase().includes(q)) return false;
    if (filterPriority !== "all" && b.priority !== filterPriority) return false;
    if (filterGenre !== "all" && !b.genres.includes(filterGenre)) return false;
    return true;
  });

  function groupFor(priority: Priority) {
    return filtered.filter(b => b.priority === priority).sort((a, b) => a.order - b.order);
  }

  const sel = sidebarBook;
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: C.bg }}>

      {/* Dialogs */}
      {(showAdd || editBook) && (
        <AddEditDialog
          initial={editBook ?? undefined}
          existingBooks={books}
          onSave={handleSaveBook}
          onClose={() => { setShowAdd(false); setEditBook(null); }}
        />
      )}
      {removeBook && (
        <RemoveDialog
          book={removeBook}
          onRemove={() => handleRemove(removeBook)}
          onMoveToLibrary={() => handleMoveToLibrary(removeBook)}
          onClose={() => setRemoveBook(null)}
        />
      )}
      {startBook && (
        <StartReadingDialog
          book={startBook}
          onStart={keep => handleStartReading(startBook, keep)}
          onClose={() => setStartBook(null)}
        />
      )}

      {/* ── Header ── */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`,
        padding: "20px 28px 20px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <Bookmark size={13} color={C.muted} />
              <span style={{ fontSize: 12, color: C.muted }}>Library</span>
              <span style={{ fontSize: 12, color: C.muted }}>/</span>
              <span style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>The reading queue</span>
            </div>
            <h1 style={{ ...SERIF, fontSize: 32, fontWeight: 400, color: C.text, margin: "0 0 6px" }}>
              The reading queue
            </h1>
            <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>Books waiting for the right moment.</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.muted, paddingTop: 4 }}>
            <Cloud size={13} color={C.green} />
            <span>Save locally</span>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.green, display: "inline-block" }} />
            <span style={{ color: "#aaa" }}>Just now</span>
          </div>
        </div>

        {/* Search + filters */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
          {/* Search */}
          <div style={{ position: "relative", flex: "1 1 200px", minWidth: 160 }}>
            <Search size={13} color={C.muted}
              style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search wishlist"
              style={{ ...INP, paddingLeft: 34, borderRadius: 20 }} />
          </div>

          {/* Priority filter */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
              style={{ ...INP, width: "auto", paddingRight: 32, appearance: "none",
                cursor: "pointer", borderRadius: 20, fontSize: 13 }}>
              <option value="all">Priority: All</option>
              <option value="next-up">Next up</option>
              <option value="high">High priority</option>
              <option value="someday">Someday</option>
            </select>
            <ChevronDown size={13} color={C.muted}
              style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          </div>

          {/* Genre filter */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <select value={filterGenre} onChange={e => setFilterGenre(e.target.value)}
              style={{ ...INP, width: "auto", paddingRight: 32, appearance: "none",
                cursor: "pointer", borderRadius: 20, fontSize: 13 }}>
              <option value="all">Genre: All</option>
              {genres.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <ChevronDown size={13} color={C.muted}
              style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          </div>

          {/* Add button */}
          <button onClick={() => setShowAdd(true)}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px",
              borderRadius: 20, border: "none", background: C.green, color: "#fff",
              fontSize: 13, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}>
            <Plus size={14} /> Add to wishlist
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 28px 28px" }}>
          {books.length === 0 && (
            <div style={{ textAlign: "center", padding: "80px 0", color: C.muted }}>
              <Bookmark size={32} color={C.border} style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>Your wishlist is empty</div>
              <div style={{ fontSize: 13 }}>Click "+ Add to wishlist" to add your first book.</div>
            </div>
          )}

          {PRIORITY_ORDER.map(priority => {
            const group = groupFor(priority);
            if (filtered.length > 0 && group.length === 0) return null;
            if (books.filter(b => b.priority === priority).length === 0) return null;

            return (
              <div key={priority}>
                {/* Group header */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "20px 0 12px",
                  borderBottom: `1px solid ${C.border}` }}>
                  {priority === "next-up" && (
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#3d9e5f", display: "inline-block" }} />
                  )}
                  {priority === "high" && <Star size={16} fill={C.gold} stroke="none" />}
                  {priority === "someday" && (
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: C.blue, display: "inline-block" }} />
                  )}
                  <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{PRIORITY_LABELS[priority]}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.muted,
                    background: "#f0ece4", borderRadius: 20, padding: "1px 9px" }}>
                    {group.length}
                  </span>
                </div>

                {/* Book rows */}
                {group.map((book) => {
                  const isMenuOpen = menuOpen === book.id;
                  const groupBooks = books.filter(b => b.priority === priority).sort((a, b2) => a.order - b2.order);
                  const bookIdx = groupBooks.findIndex(b => b.id === book.id);
                  return (
                    <div key={book.id}
                      onClick={() => setSidebarBook(book)}
                      style={{ display: "flex", alignItems: "center", gap: 16,
                        borderBottom: `1px solid ${C.border}`,
                        cursor: "pointer", background: sidebarBook?.id === book.id ? C.greenFaint : "transparent",
                        margin: "0 -4px", padding: "16px 4px",
                        transition: "background .1s" }}>

                      <BookCover book={book} w={60} h={90} />

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: C.text, lineHeight: 1.3 }}>{book.title}</div>
                        <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>{book.author}</div>
                        {(book.series || book.seriesBook) && (
                          <div style={{ fontSize: 12, color: C.muted, marginTop: 2, display: "flex", alignItems: "center", gap: 5 }}>
                            <span style={{ width: 14, height: 14, borderRadius: "50%", border: `1.5px solid ${C.muted}`,
                              display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "transparent" }} />
                            </span>
                            {book.series}{book.seriesBook ? ` · ${book.seriesBook}` : ""}
                          </div>
                        )}
                      </div>

                      {/* Pages */}
                      <div style={{ fontSize: 12.5, color: C.muted, flexShrink: 0, minWidth: 70, textAlign: "right" }}>
                        {book.pages} pages
                      </div>

                      {/* Priority badge */}
                      <div style={{ flexShrink: 0 }}>
                        <PriorityBadge priority={book.priority} />
                      </div>

                      {/* Genre tags */}
                      <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap", maxWidth: 180 }}>
                        {book.genres.slice(0, 2).map(g => (
                          <span key={g} style={{ padding: "3px 10px", borderRadius: 20, border: `1px solid ${C.border}`,
                            fontSize: 11.5, color: C.text, background: C.white }}>
                            {g}
                          </span>
                        ))}
                      </div>

                      {/* 3-dot menu */}
                      <div style={{ position: "relative", flexShrink: 0 }}
                        ref={isMenuOpen ? menuRef : undefined}
                        onClick={e => e.stopPropagation()}>
                        <button onClick={() => setMenuOpen(isMenuOpen ? null : book.id)}
                          style={{ width: 30, height: 30, display: "flex", alignItems: "center",
                            justifyContent: "center", background: "none", border: "none",
                            cursor: "pointer", color: C.muted, borderRadius: 6 }}>
                          <MoreVertical size={16} />
                        </button>
                        {isMenuOpen && (
                          <div style={{ position: "absolute", right: 0, top: 36, zIndex: 100,
                            background: C.white, border: `1px solid ${C.border}`, borderRadius: 10,
                            boxShadow: "0 8px 24px rgba(0,0,0,.15)", minWidth: 180,
                            overflow: "hidden" }}>
                            {[
                              { label: "Edit", action: () => { setEditBook(book); setMenuOpen(null); } },
                              { label: "Start reading", action: () => { setStartBook(book); setMenuOpen(null); } },
                              null,
                              bookIdx > 0 ? { label: "Move up", action: () => handleMoveWithin(book, -1) } : null,
                              bookIdx < groupBooks.length - 1 ? { label: "Move down", action: () => handleMoveWithin(book, 1) } : null,
                              null,
                              priority !== "next-up" ? { label: "Set as Next up", action: () => handleChangePriority(book, "next-up") } : null,
                              priority !== "high"    ? { label: "Set as High priority", action: () => handleChangePriority(book, "high") } : null,
                              priority !== "someday" ? { label: "Set as Someday", action: () => handleChangePriority(book, "someday") } : null,
                              null,
                              { label: "Remove", action: () => { setRemoveBook(book); setMenuOpen(null); }, danger: true },
                            ].map((item, i) => {
                              if (item === null) return <div key={i} style={{ height: 1, background: C.border, margin: "2px 0" }} />;
                              if (!item) return null;
                              return (
                                <button key={item.label} onClick={item.action}
                                  style={{ display: "block", width: "100%", textAlign: "left",
                                    padding: "9px 14px", fontSize: 13, fontWeight: 400,
                                    color: (item as { danger?: boolean }).danger ? C.red : C.text,
                                    background: "none", border: "none", cursor: "pointer" }}
                                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.bg; }}
                                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "none"; }}>
                                  {item.label}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* ── Sidebar: Choose your next read ── */}
        <div style={{ width: 260, flexShrink: 0, borderLeft: `1px solid ${C.border}`,
          background: C.white, padding: 20, display: "flex", flexDirection: "column",
          gap: 16, overflowY: "auto" }}>

          <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Choose your next read</div>

          {sel ? (
            <>
              {/* Large cover */}
              <div style={{ borderRadius: 10, overflow: "hidden", height: 200, position: "relative",
                background: `linear-gradient(155deg, ${sel.coverFrom} 0%, ${sel.coverTo} 100%)`,
                flexShrink: 0 }}>
                {sel.coverUrl
                  ? <img src={sel.coverUrl} alt={sel.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : (
                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center", padding: 20, gap: 8 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,.9)",
                        textAlign: "center", textTransform: "uppercase", letterSpacing: "0.05em", lineHeight: 1.3 }}>
                        {sel.title}
                      </div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,.65)", textAlign: "center" }}>
                        {sel.author}
                      </div>
                    </div>
                  )}
              </div>

              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{sel.title}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>{sel.author}</div>
              </div>

              {sel.blurb && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase",
                    letterSpacing: "0.08em", marginBottom: 6 }}>Why this might be the one</div>
                  <div style={{ fontSize: 12.5, color: C.text, lineHeight: 1.6 }}>{sel.blurb}</div>
                </div>
              )}

              <button onClick={() => setStartBook(sel)}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "12px 0", borderRadius: 8, border: "none",
                  background: C.green, color: "#fff", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>
                <Play size={13} fill="#fff" stroke="none" /> Start reading
              </button>

              <button onClick={() => {
                const others = books.filter(b => b.id !== sel.id);
                if (others.length > 0) setSidebarBook(others[Math.floor(Math.random() * others.length)]);
              }} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                padding: "10px 0", borderRadius: 8, border: `1px solid ${C.border}`,
                background: C.white, fontSize: 13, fontWeight: 500, color: C.text, cursor: "pointer" }}>
                <Shuffle size={14} /> Shuffle
              </button>

              <div style={{ display: "flex", alignItems: "flex-start", gap: 8,
                padding: "10px 12px", borderRadius: 8, background: "#f8f6f2",
                border: `1px solid ${C.border}` }}>
                <Info size={13} color={C.muted} style={{ marginTop: 1, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>
                  Not sure what to read? Shuffle your queue or pick a different mood.
                </span>
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "24px 0", color: C.muted }}>
              <div style={{ fontSize: 13 }}>Add books to see recommendations here.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
