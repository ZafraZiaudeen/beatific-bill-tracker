import { useState, useRef } from "react";
import {
  Search, Filter, SlidersHorizontal, LayoutGrid, List, Heart, PenLine, FileText,
  Archive, ChevronDown, Plus, BookOpen, X, Shield, Database, WifiOff, Lock,
  RefreshCw, CloudUpload, Cloud, RotateCcw,
} from "lucide-react";
import { isBookSearchUnavailable, searchBooks, type SearchResult } from "./bookSearch";

const C = {
  bg: "#f4efe6",
  white: "#ffffff",
  green: "#2d4a3e",
  greenFaint: "#e8f0eb",
  border: "#e8e2d8",
  borderCard: "#ede8df",
  muted: "#8a8a8a",
  text: "#1a1a1a",
  shadow: "0 1px 4px rgba(0,0,0,.05), 0 2px 8px rgba(0,0,0,.04)",
} as const;

const SERIF = { fontFamily: "'Lora', Georgia, 'Times New Roman', serif" } as const;

// ── Status styles ──────────────────────────────────────────────
const STATUS: Record<string, { bg: string; text: string; dot: string }> = {
  Reading:  { bg: "#e6f4ec", text: "#2d7a4a", dot: "#3d9e5f" },
  Finished: { bg: "#eeece8", text: "#5a5550", dot: "#8a8580" },
  Paused:   { bg: "#fef5e0", text: "#9a6f00", dot: "#c89000" },
  DNF:      { bg: "#fdecea", text: "#c0392b", dot: "#c0392b" },
};
const STATUS_OPTIONS: Book["status"][] = ["Reading", "Finished", "Paused", "DNF"];

type SortKey = "title" | "author" | "rating" | "dateAdded";

interface Book {
  id: number;
  title: string;
  author: string;
  status: "Reading" | "Finished" | "Paused" | "DNF";
  rating: number;
  pages: number;
  currentPage: number;
  coverFrom: string;
  coverTo: string;
  coverUrl?: string;
  format: string;
  isbn: string;
  published: string;
  source: string;
  dateAdded: string;
  location: string;
  tags: string[];
  notes: string;
}

const INITIAL_BOOKS: Book[] = [
  {
    id: 1, title: "The Left Hand of Darkness", author: "Ursula K. Le Guin",
    status: "Reading", rating: 4.5, pages: 304, currentPage: 211,
    coverFrom: "#1c2e4a", coverTo: "#0a1520",
    format: "Paperback", isbn: "978-0-441-47812-5", published: "Mar 1, 1969",
    source: "Purchased", dateAdded: "Jan 3, 2025", location: "Home library",
    tags: ["Sci-fi", "Classic", "Gender"],
    notes: "A haunting, genre-defying novel. Le Guin's worldbuilding is unmatched — Gethen feels like a real place.",
  },
  {
    id: 2, title: "The Employees", author: "Olga Ravn",
    status: "Reading", rating: 4.2, pages: 256, currentPage: 156,
    coverFrom: "#3a3028", coverTo: "#1a150e",
    format: "Hardcover", isbn: "978-0-593-12345-6", published: "Mar 8, 2022",
    source: "Purchased", dateAdded: "May 14, 2025", location: "Home library",
    tags: ["Sci-fi", "Dystopia", "AI"],
    notes: "Haunting and precise. A quiet exploration of identity, surveillance, and the systems we inherit.\n\nMemorable line: \"We're always already replaceable.\"",
  },
  {
    id: 3, title: "The Dispossessed", author: "Ursula K. Le Guin",
    status: "Finished", rating: 4.6, pages: 342, currentPage: 342,
    coverFrom: "#2e3f5c", coverTo: "#162030",
    format: "Paperback", isbn: "978-0-06-051275-9", published: "May 1, 1974",
    source: "Library", dateAdded: "Mar 2, 2025", location: "Home library",
    tags: ["Sci-fi", "Utopia", "Classic"],
    notes: "Shevek's physics of time mirrors the novel's own recursive structure.",
  },
  {
    id: 4, title: "Piranesi", author: "Susanna Clarke",
    status: "Finished", rating: 4.5, pages: 272, currentPage: 272,
    coverFrom: "#5a4020", coverTo: "#2a1808",
    format: "Hardcover", isbn: "978-1-63557-563-5", published: "Sep 15, 2020",
    source: "Purchased", dateAdded: "Feb 18, 2025", location: "Home library",
    tags: ["Fantasy", "Mystery", "Magical realism"],
    notes: "The House is one of the most original settings in contemporary fiction.",
  },
  {
    id: 5, title: "Solaris", author: "Stanisław Lem",
    status: "Paused", rating: 4.1, pages: 256, currentPage: 98,
    coverFrom: "#1a3a3a", coverTo: "#0a1e1e",
    format: "Paperback", isbn: "978-0-15-683750-5", published: "Jun 1, 1961",
    source: "Purchased", dateAdded: "Apr 10, 2025", location: "Home library",
    tags: ["Sci-fi", "Philosophy", "Classic"],
    notes: "Dense and hypnotic. Paused to sit with the ideas.",
  },
  {
    id: 6, title: "The Fifth Season", author: "N.K. Jemisin",
    status: "Finished", rating: 4.7, pages: 512, currentPage: 512,
    coverFrom: "#4a1a10", coverTo: "#1e0a06",
    format: "Paperback", isbn: "978-0-316-22924-8", published: "Aug 4, 2015",
    source: "Purchased", dateAdded: "Jan 20, 2025", location: "Home library",
    tags: ["Fantasy", "Sci-fi", "Hugo Award"],
    notes: "The second-person POV is disorienting in the best possible way.",
  },
  {
    id: 7, title: "The Vanishing Half", author: "Brit Bennett",
    status: "Finished", rating: 4.3, pages: 352, currentPage: 352,
    coverFrom: "#4a2828", coverTo: "#1e1010",
    format: "Hardcover", isbn: "978-0-525-53629-1", published: "Jun 2, 2020",
    source: "Gift", dateAdded: "Dec 5, 2024", location: "Home library",
    tags: ["Literary fiction", "Race", "Identity"],
    notes: "Generational trauma rendered in gorgeous, unhurried prose.",
  },
  {
    id: 8, title: "The Long Way to a Small, Angry Planet", author: "Becky Chambers",
    status: "Reading", rating: 4.4, pages: 404, currentPage: 180,
    coverFrom: "#1a3a2a", coverTo: "#0a1e14",
    format: "Paperback", isbn: "978-1-500-45309-4", published: "Jul 29, 2014",
    source: "Purchased", dateAdded: "Jun 1, 2025", location: "Home library",
    tags: ["Sci-fi", "Found family", "Cozy"],
    notes: "Exactly what it says on the tin — a cozy journey with a found family in space.",
  },
  {
    id: 9, title: "Klara and the Sun", author: "Kazuo Ishiguro",
    status: "DNF", rating: 3.2, pages: 288, currentPage: 87,
    coverFrom: "#4a3810", coverTo: "#1e1808",
    format: "Hardcover", isbn: "978-0-593-31817-1", published: "Mar 2, 2021",
    source: "Library", dateAdded: "May 30, 2025", location: "-",
    tags: ["Literary fiction", "AI", "Dystopia"],
    notes: "Ishiguro's prose is beautiful as always but the pacing lost me by page 87.",
  },
  {
    id: 10, title: "A Wizard of Earthsea", author: "Ursula K. Le Guin",
    status: "Finished", rating: 4.8, pages: 183, currentPage: 183,
    coverFrom: "#1e3a3a", coverTo: "#0a1a1a",
    format: "Paperback", isbn: "978-0-547-73480-4", published: "Nov 1, 1968",
    source: "Purchased", dateAdded: "Nov 15, 2024", location: "Home library",
    tags: ["Fantasy", "Classic", "YA"],
    notes: "The original and still unsurpassed.",
  },
];


const STATUS_FILTERS = ["All books", "Reading", "Finished", "Paused", "DNF", "Favorites", "Archived"];
const TODAY = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "dateAdded", label: "Date added" },
  { key: "title",    label: "Title A–Z" },
  { key: "author",   label: "Author A–Z" },
  { key: "rating",   label: "Rating" },
];

function Stars({ rating }: { rating: number }) {
  const filled = Math.round(rating);
  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} style={{ color: i < filled ? "#d4a017" : "#ddd", fontSize: 12 }}>★</span>
      ))}
    </span>
  );
}

function BookCover({ from, to, title, height = 200, coverUrl }: { from: string; to: string; title: string; height?: number; coverUrl?: string }) {
  if (coverUrl) {
    return (
      <div style={{ width: "100%", height, flexShrink: 0, overflow: "hidden", position: "relative" }}>
        <img src={coverUrl} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      </div>
    );
  }
  const fontSize = Math.max(9, Math.min(13, 130 / Math.max(title.length, 10)));
  return (
    <div style={{
      width: "100%", height, flexShrink: 0,
      background: `linear-gradient(155deg, ${from} 0%, ${to} 100%)`,
      position: "relative", overflow: "hidden",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 6, background: "linear-gradient(to right, rgba(0,0,0,0.28), transparent)" }} />
      <div style={{ padding: "12px 14px", textAlign: "center", fontSize, fontStyle: "italic", fontWeight: 600, color: "rgba(255,255,255,0.92)", fontFamily: "Georgia, serif", lineHeight: 1.45, textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>
        {title}
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted, marginBottom: 7 }}>{label}</div>
      {children}
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "3px 0", fontSize: 12 }}>
      <span style={{ color: C.muted, flexShrink: 0 }}>{label}</span>
      <span style={{ color: C.text, textAlign: "right" }}>{value}</span>
    </div>
  );
}

function parseDate(s: string): number {
  const d = new Date(s);
  return isNaN(d.getTime()) ? 0 : d.getTime();
}

// ── Book Modal (2 tabs only) ───────────────────────────────────
function BookModal({ initial, onSave, onClose }: {
  initial?: Book;
  onSave: (data: Omit<Book, "id"> | Book) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"search" | "manual">(initial ? "manual" : "search");
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRequestId = useRef(0);
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    author: initial?.author ?? "",
    pages: initial?.pages ? String(initial.pages) : "",
    status: initial?.status ?? "Reading",
    rating: initial?.rating ?? 0,
    genre: initial?.tags[0] ?? "",
    series: "",
    ownership: initial?.source ?? "Owned",
    collection: "",
    format: initial?.format ?? "Paperback",
    isbn: initial?.isbn ?? "",
    published: initial?.published ?? "",
    location: initial?.location ?? "Home library",
    notes: initial?.notes ?? "",
  });

  const TABS = [
    { id: "search", label: "Search online", icon: Search },
    { id: "manual", label: "Add manually",  icon: PenLine },
  ] as const;

  function handleSave() {
    if (!form.title.trim() || !form.author.trim()) return;
    const base = {
      title: form.title.trim(),
      author: form.author.trim(),
      status: form.status as Book["status"],
      rating: form.rating,
      pages: Number(form.pages) || 0,
      currentPage: initial?.currentPage ?? 0,
      coverFrom: initial?.coverFrom ?? "#2d4a3e",
      coverTo: initial?.coverTo ?? "#162030",
      format: form.format,
      isbn: form.isbn,
      published: form.published,
      source: form.ownership,
      dateAdded: initial?.dateAdded ?? TODAY,
      location: form.location,
      tags: form.genre ? [form.genre] : (initial?.tags ?? []),
      notes: form.notes,
    };
    onSave(initial ? { ...initial, ...base } : base);
  }

  async function doSearch(q: string) {
    const trimmed = q.trim();
    const requestId = ++searchRequestId.current;

    if (trimmed.length < 2) {
      setSearchResults([]);
      setSearchError("");
      setSearching(false);
      return;
    }

    setSearching(true);
    setSearchError("");

    try {
      const items = await searchBooks(trimmed);
      if (requestId !== searchRequestId.current) return;
      setSearchResults(items);
      setSearchError(items.length ? "" : "No online results found. Try another title, author, or ISBN.");
    } catch (error) {
      if (requestId !== searchRequestId.current) return;
      setSearchResults([]);
      setSearchError(
        isBookSearchUnavailable(error)
          ? "Online search is temporarily unavailable. You can still add the book manually."
          : "Online search is temporarily unavailable. You can still add the book manually."
      );
    } finally {
      if (requestId === searchRequestId.current) setSearching(false);
    }
  }

  function handleQueryChange(val: string) {
    setQuery(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (val.trim().length < 2) {
      searchRequestId.current += 1;
      setSearchResults([]);
      setSearchError("");
      setSearching(false);
      return;
    }
    searchTimer.current = setTimeout(() => void doSearch(val), 800);
  }

  function handleAddSearchResult(r: SearchResult) {
    onSave({
      title: r.title, author: r.author, status: "Reading", rating: 0,
      pages: r.pages, currentPage: 0,
      coverFrom: "#2d4a3e", coverTo: "#162030",
      coverUrl: r.coverUrl || undefined,
      format: "Paperback", isbn: r.isbn, published: r.year,
      source: "Purchased", dateAdded: TODAY, location: "Home library",
      tags: r.tags, notes: "",
    });
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: 8,
    fontSize: 13, outline: "none", background: C.white, boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = { fontSize: 12, color: C.muted, marginBottom: 4, display: "block" };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: C.white, borderRadius: 14, width: "min(840px, 92vw)", maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,.22)" }}>

        {/* Header */}
        <div style={{ padding: "28px 32px 0", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <h2 style={{ ...SERIF, fontSize: 28, fontWeight: 400, color: C.text, margin: 0 }}>{initial ? "Edit book" : "Add a book"}</h2>
            <button onClick={onClose} style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${C.border}`, borderRadius: "50%", background: "transparent", color: C.muted, cursor: "pointer" }}>
              <X size={15} />
            </button>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 14px", borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: "pointer",
                border: tab === id ? `1.5px solid ${C.green}` : `1px solid ${C.border}`,
                color: tab === id ? C.green : C.muted,
                background: tab === id ? C.greenFaint : C.white,
              }}>
                <Icon size={13} /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex", minHeight: 0 }}>

          {/* Left content */}
          <div style={{ flex: 1, padding: "20px 32px 28px", overflowY: "auto" }}>

            {tab === "search" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ position: "relative" }}>
                  <Search size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#bbb", pointerEvents: "none" }} />
                  <input
                    value={query}
                    onChange={e => handleQueryChange(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { if (searchTimer.current) clearTimeout(searchTimer.current); void doSearch(query); } }}
                    placeholder="Search by title, author, or ISBN..."
                    style={{ ...inputStyle, paddingLeft: 34 }}
                    autoFocus
                  />
                </div>

                {/* Loading skeletons */}
                {searching && (
                  <div style={{ display: "flex", flexDirection: "column", border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
                    {[1,2,3].map(i => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 16px", borderBottom: i < 3 ? `1px solid ${C.border}` : "none" }}>
                        <div style={{ width: 46, height: 66, borderRadius: 4, background: "#f0ede8", flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ height: 12, borderRadius: 4, background: "#f0ede8", width: "70%", marginBottom: 8 }} />
                          <div style={{ height: 10, borderRadius: 4, background: "#f0ede8", width: "45%" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Error */}
                {searchError && !searching && (
                  <div style={{ fontSize: 13, color: "#c0392b", padding: "10px 0" }}>{searchError}</div>
                )}

                {/* Results */}
                {!searching && searchResults.length > 0 && (
                  <div>
                    <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted, marginBottom: 10 }}>
                      {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
                      {searchResults.map((r, i) => (
                        <div key={r.isbn + r.title + i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 16px", borderBottom: i < searchResults.length - 1 ? `1px solid ${C.border}` : "none", background: C.white }}>
                          {r.coverUrl ? (
                            <img src={r.coverUrl} alt={r.title} style={{ width: 46, height: 66, borderRadius: 4, flexShrink: 0, objectFit: "cover", boxShadow: "1px 2px 6px rgba(0,0,0,.2)" }} />
                          ) : (
                            <div style={{ width: 46, height: 66, borderRadius: 4, flexShrink: 0, background: "linear-gradient(155deg, #2d4a3e 0%, #162030 100%)", boxShadow: "1px 2px 6px rgba(0,0,0,.2)" }} />
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13.5, fontWeight: 600, color: C.text, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title}</div>
                            <div style={{ fontSize: 12, color: C.muted }}>{r.author} {r.year ? `· ${r.year}` : ""} {r.pages ? `· ${r.pages} pp` : ""}</div>
                          </div>
                          <button onClick={() => handleAddSearchResult(r)} style={{ padding: "6px 18px", border: "none", borderRadius: 8, background: C.green, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}>
                            Add
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty state when no search yet */}
                {!searching && !searchError && searchResults.length === 0 && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "32px 0", color: C.muted }}>
                    <Search size={36} strokeWidth={1.2} />
                    <div style={{ fontSize: 14, fontWeight: 500, color: "#555" }}>Search for a book</div>
                    <div style={{ fontSize: 12.5, textAlign: "center", maxWidth: 260, lineHeight: 1.6 }}>Type a title, author name, or ISBN above to find books from online book catalogs.</div>
                  </div>
                )}
              </div>
            )}

            {tab === "manual" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={labelStyle}>Title *</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. The Left Hand of Darkness" style={inputStyle} autoFocus />
                </div>
                <div>
                  <label style={labelStyle}>Author *</label>
                  <input value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} placeholder="e.g. Ursula K. Le Guin" style={inputStyle} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={labelStyle}>Pages</label>
                    <input type="number" value={form.pages} onChange={e => setForm(f => ({ ...f, pages: e.target.value }))} placeholder="304" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Status</label>
                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Book["status"] }))} style={{ ...inputStyle, appearance: "none" as const }}>
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Rating</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 2, height: 36, paddingLeft: 4 }}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} onClick={() => setForm(f => ({ ...f, rating: i + 1 }))} style={{ fontSize: 20, color: i < form.rating ? "#d4a017" : "#ddd", cursor: "pointer" }}>★</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Genre</label>
                    <select value={form.genre} onChange={e => setForm(f => ({ ...f, genre: e.target.value }))} style={{ ...inputStyle, appearance: "none" as const }}>
                      <option value="">Select genre</option>
                      {["Sci-fi", "Fantasy", "Literary fiction", "Mystery", "Non-fiction", "Biography", "History", "Classic", "Other"].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={labelStyle}>Series (optional)</label>
                    <input value={form.series} onChange={e => setForm(f => ({ ...f, series: e.target.value }))} placeholder="e.g. Hainish Cycle" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Ownership</label>
                    <select value={form.ownership} onChange={e => setForm(f => ({ ...f, ownership: e.target.value }))} style={{ ...inputStyle, appearance: "none" as const }}>
                      {["Owned", "Library", "Gift", "Borrowed", "E-book", "Audiobook"].map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Add to collection (optional)</label>
                    <input value={form.collection} onChange={e => setForm(f => ({ ...f, collection: e.target.value }))} placeholder="e.g. Classics" style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Notes (optional)</label>
                  <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Your thoughts about this book..." rows={3}
                    style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
                </div>
                <div>
                  <label style={labelStyle}>Cover (optional)</label>
                  <div style={{ border: `1.5px dashed ${C.border}`, borderRadius: 10, padding: "20px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, background: "#fafaf8", cursor: "pointer" }}>
                    <CloudUpload size={22} color={C.muted} strokeWidth={1.5} />
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#555" }}>Upload cover image</div>
                    <div style={{ fontSize: 11.5, color: C.muted }}>JPG, PNG up to 5MB</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right privacy panel */}
          <div style={{ width: 220, flexShrink: 0, borderLeft: `1px solid ${C.border}`, padding: "24px 20px", display: "flex", flexDirection: "column", background: "#f9f8f5" }}>
            <div style={{ flex: 1 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: C.greenFaint, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <Shield size={22} color={C.green} strokeWidth={1.8} />
              </div>
              <div style={{ ...SERIF, fontSize: 14, fontWeight: 500, color: C.text, lineHeight: 1.4, marginBottom: 16 }}>Your data stays on this device.</div>
              {[
                { icon: Database,  text: "All your books, notes, and reading data are stored locally." },
                { icon: WifiOff,   text: "No internet required to access your library." },
                { icon: Lock,      text: "No accounts. No tracking. Complete privacy." },
                { icon: RefreshCw, text: "Back up or export your data anytime." },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14 }}>
                  <Icon size={14} color={C.green} strokeWidth={1.8} style={{ marginTop: 1, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "#666", lineHeight: 1.5 }}>{text}</span>
                </div>
              ))}
            </div>
            {tab === "manual" && (
              <button onClick={handleSave} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", padding: "11px 0", borderRadius: 8, border: "none", background: C.green, color: "#fff", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>
                <Cloud size={14} /> Save locally
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────
export default function LibraryPage() {
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  const [archivedBooks, setArchivedBooks] = useState<Book[]>([]);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [activeFilter, setActiveFilter] = useState("All books");
  const [selectedId, setSelectedId] = useState<number>(2);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [moveToOpen, setMoveToOpen] = useState(false);
  const [addingTag, setAddingTag] = useState(false);
  const [newTagInput, setNewTagInput] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("dateAdded");
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [genreFilter, setGenreFilter] = useState("");

  // selected always refers to the clicked book (across active/archived lists)
  const allVisible = activeFilter === "Archived" ? archivedBooks : books;
  const selected = allVisible.find(b => b.id === selectedId)
    ?? books.find(b => b.id === selectedId)
    ?? books[0];
  const ss = STATUS[selected?.status ?? "Reading"];

  // all unique tags for genre filter
  const allTags = Array.from(new Set(books.flatMap(b => b.tags))).sort();

  // ── Handlers ──────────────────────────────────────────────────
  function changeStatus(id: number, status: Book["status"]) {
    setBooks(bs => bs.map(b => b.id === id ? { ...b, status } : b));
    setStatusDropdownOpen(false);
    setMoveToOpen(false);
  }

  function toggleFavorite(id: number) {
    setFavorites(prev => {
      const s = new Set(prev);
      if (s.has(id)) {
        s.delete(id);
      } else {
        s.add(id);
      }
      return s;
    });
  }

  function addBook(data: Omit<Book, "id">) {
    const newBook = { ...data, id: Date.now() };
    setBooks(bs => [...bs, newBook]);
    setSelectedId(newBook.id);
    setActiveFilter("All books");
    setShowAddModal(false);
    setEditingBook(null);
  }

  function updateBook(updated: Book) {
    setBooks(bs => bs.map(b => b.id === updated.id ? updated : b));
    setShowAddModal(false);
    setEditingBook(null);
  }

  function archiveBook(id: number) {
    const book = books.find(b => b.id === id);
    if (!book) return;
    setBooks(bs => bs.filter(b => b.id !== id));
    setArchivedBooks(ab => [...ab, book]);
    const remaining = books.filter(b => b.id !== id);
    if (selectedId === id) setSelectedId(remaining[0]?.id ?? -1);
    setMoveToOpen(false);
  }

  function unarchiveBook(id: number) {
    const book = archivedBooks.find(b => b.id === id);
    if (!book) return;
    setArchivedBooks(ab => ab.filter(b => b.id !== id));
    setBooks(bs => [book, ...bs]);
    setSelectedId(id);
    setActiveFilter("All books");
  }

  function switchFilter(f: string) {
    setActiveFilter(f);
    let base: Book[];
    if (f === "Archived") base = archivedBooks;
    else if (f === "Favorites") base = books.filter(b => favorites.has(b.id));
    else if (f === "All books") base = books;
    else base = books.filter(b => b.status === f);
    setSelectedId(base[0]?.id ?? -1);
  }

  function addTag(bookId: number, tag: string) {
    if (!tag.trim()) { setAddingTag(false); setNewTagInput(""); return; }
    setBooks(bs => bs.map(b => b.id === bookId && !b.tags.includes(tag.trim()) ? { ...b, tags: [...b.tags, tag.trim()] } : b));
    setAddingTag(false);
    setNewTagInput("");
  }

  function removeTag(bookId: number, tag: string) {
    setBooks(bs => bs.map(b => b.id === bookId ? { ...b, tags: b.tags.filter(t => t !== tag) } : b));
  }

  function openEditModal(book: Book) {
    setEditingBook(book);
    setShowAddModal(true);
  }

  // ── Filtered + sorted list ─────────────────────────────────────
  let baseList: Book[];
  if (activeFilter === "Archived") {
    baseList = archivedBooks;
  } else if (activeFilter === "Favorites") {
    baseList = books.filter(b => favorites.has(b.id));
  } else if (activeFilter === "All books") {
    baseList = books;
  } else {
    baseList = books.filter(b => b.status === activeFilter);
  }

  const filtered = baseList.filter(b => {
    const matchSearch = !search || b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase());
    const matchGenre = !genreFilter || b.tags.includes(genreFilter);
    return matchSearch && matchGenre;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "title")    return a.title.localeCompare(b.title);
    if (sortBy === "author")   return a.author.localeCompare(b.author);
    if (sortBy === "rating")   return b.rating - a.rating;
    return parseDate(b.dateAdded) - parseDate(a.dateAdded);
  });

  const isArchiveView = activeFilter === "Archived";

  return (
    <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

      {/* ══ LEFT: selected book panel ══ */}
      <div style={{ width: 220, flexShrink: 0, background: C.white, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {selected ? (
          <>
            <BookCover from={selected.coverFrom} to={selected.coverTo} title={selected.title} height={270} coverUrl={selected.coverUrl} />
            <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 9, flex: 1, overflowY: "auto" }}>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text, lineHeight: 1.35, marginBottom: 3 }}>{selected.title}</div>
                <div style={{ fontSize: 12, color: C.muted }}>{selected.author}</div>
              </div>

              {isArchiveView ? (
                <>
                  <div style={{ fontSize: 12, color: C.muted, fontStyle: "italic" }}>This book is archived.</div>
                  <button onClick={() => unarchiveBook(selected.id)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", borderRadius: 8, background: C.green, border: "none", fontSize: 12.5, fontWeight: 600, color: "#fff", cursor: "pointer" }}>
                    <RotateCcw size={14} /> Unarchive
                  </button>
                </>
              ) : (
                <>
                  {/* Status dropdown */}
                  <div style={{ position: "relative" }}>
                    <button onClick={() => setStatusDropdownOpen(o => !o)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 12px", borderRadius: 20, border: `1px solid ${C.border}`, background: C.white, fontSize: 12.5, fontWeight: 500, color: C.text, cursor: "pointer", width: "100%" }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: STATUS[selected.status].dot, flexShrink: 0 }} />
                      {selected.status}
                      <ChevronDown size={12} style={{ color: C.muted, marginLeft: "auto", transform: statusDropdownOpen ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
                    </button>
                    {statusDropdownOpen && (
                      <>
                        <div style={{ position: "fixed", inset: 0, zIndex: 9 }} onClick={() => setStatusDropdownOpen(false)} />
                        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, boxShadow: "0 4px 16px rgba(0,0,0,.12)", zIndex: 10, overflow: "hidden" }}>
                          {STATUS_OPTIONS.map(s => (
                            <button key={s} onClick={() => changeStatus(selected.id, s)} style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 14px", width: "100%", textAlign: "left", border: "none", background: selected.status === s ? C.greenFaint : "transparent", cursor: "pointer", fontSize: 13, color: C.text }}>
                              <span style={{ width: 7, height: 7, borderRadius: "50%", background: STATUS[s].dot, flexShrink: 0 }} />{s}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Favorite */}
                  <button onClick={() => toggleFavorite(selected.id)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, fontSize: 12.5, fontWeight: 500, color: C.text, cursor: "pointer" }}>
                    <Heart size={14} style={{ color: favorites.has(selected.id) ? "#d4a017" : C.muted }} fill={favorites.has(selected.id) ? "#d4a017" : "none"} />
                    {favorites.has(selected.id) ? "Unfavorite" : "Favorite"}
                  </button>

                  {/* Edit book */}
                  <button onClick={() => openEditModal(selected)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", borderRadius: 8, background: C.green, border: "none", fontSize: 12.5, fontWeight: 600, color: "#fff", cursor: "pointer" }}>
                    <PenLine size={14} /> Edit book
                  </button>

                  {/* Log pages */}
                  <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, fontSize: 12.5, fontWeight: 500, color: C.text, cursor: "pointer" }}>
                    <FileText size={14} style={{ color: C.muted }} /> Log pages
                  </button>
                </>
              )}
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, fontSize: 13 }}>
            Select a book
          </div>
        )}
      </div>

      {/* ══ CENTER ══ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#f7f5f0" }}>

        {/* Header */}
        <div style={{ padding: "20px 24px 0", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 3 }}>
            <h2 style={{ ...SERIF, fontSize: 26, fontWeight: 400, color: C.text, margin: 0 }}>Your library</h2>
            <button
              onClick={() => { setEditingBook(null); setShowAddModal(true); }}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: 7, background: C.green, border: "none", fontSize: 12, fontWeight: 600, color: "#fff", cursor: "pointer", marginLeft: "auto" }}
            >
              <Plus size={12} /> Add book
            </button>
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>{books.length} books · {archivedBooks.length} archived</div>

          {/* Filter tabs */}
          <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, marginBottom: 14, overflowX: "auto" }}>
            {STATUS_FILTERS.map(f => (
              <button key={f} onClick={() => switchFilter(f)} style={{
                padding: "7px 13px", fontSize: 12.5, fontWeight: 500, whiteSpace: "nowrap",
                color: f === activeFilter ? C.green : C.muted,
                background: "transparent", border: "none", cursor: "pointer",
                borderBottom: f === activeFilter ? `2px solid ${C.green}` : "2px solid transparent",
                marginBottom: -1,
              }}>
                {f === "Favorites" ? `♥ ${f}${favorites.size > 0 ? ` (${favorites.size})` : ""}` : f}
                {f === "Archived" && archivedBooks.length > 0 ? ` (${archivedBooks.length})` : ""}
              </button>
            ))}
          </div>

          {/* Toolbar */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 160, maxWidth: 300 }}>
              <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#bbb", pointerEvents: "none" }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search title, author..."
                style={{ width: "100%", padding: "7px 12px 7px 30px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12.5, background: C.white, outline: "none", boxSizing: "border-box" as const }} />
            </div>

            {/* Filter button */}
            <div style={{ position: "relative" }}>
              <button onClick={() => { setFilterOpen(o => !o); setSortOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", border: `1.5px solid ${genreFilter ? C.green : C.border}`, borderRadius: 8, background: genreFilter ? C.greenFaint : C.white, fontSize: 12.5, fontWeight: 500, color: genreFilter ? C.green : "#555", cursor: "pointer" }}>
                <Filter size={13} /> {genreFilter || "Filter"}
                {genreFilter && <span onClick={e => { e.stopPropagation(); setGenreFilter(""); }} style={{ marginLeft: 3, fontSize: 13, lineHeight: 1, color: C.green }}>×</span>}
              </button>
              {filterOpen && (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 9 }} onClick={() => setFilterOpen(false)} />
                  <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, boxShadow: "0 4px 16px rgba(0,0,0,.12)", zIndex: 10, overflow: "hidden", minWidth: 160 }}>
                    <div style={{ padding: "6px 10px", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted }}>Genre</div>
                    {allTags.map(tag => (
                      <button key={tag} onClick={() => { setGenreFilter(genreFilter === tag ? "" : tag); setFilterOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", width: "100%", border: "none", background: genreFilter === tag ? C.greenFaint : "transparent", cursor: "pointer", fontSize: 13, color: genreFilter === tag ? C.green : C.text, textAlign: "left" }}>
                        {genreFilter === tag && <span style={{ fontSize: 11, color: C.green }}>✓</span>} {tag}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Sort button */}
            <div style={{ position: "relative" }}>
              <button onClick={() => { setSortOpen(o => !o); setFilterOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", border: `1px solid ${C.border}`, borderRadius: 8, background: C.white, fontSize: 12.5, fontWeight: 500, color: "#555", cursor: "pointer" }}>
                <SlidersHorizontal size={13} /> {SORT_OPTIONS.find(o => o.key === sortBy)?.label ?? "Sort by"}
                <ChevronDown size={11} style={{ color: C.muted }} />
              </button>
              {sortOpen && (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 9 }} onClick={() => setSortOpen(false)} />
                  <div style={{ position: "absolute", top: "calc(100% + 4px)", right: 0, background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, boxShadow: "0 4px 16px rgba(0,0,0,.12)", zIndex: 10, overflow: "hidden", minWidth: 150 }}>
                    {SORT_OPTIONS.map(opt => (
                      <button key={opt.key} onClick={() => { setSortBy(opt.key); setSortOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", width: "100%", border: "none", background: sortBy === opt.key ? C.greenFaint : "transparent", cursor: "pointer", fontSize: 13, color: sortBy === opt.key ? C.green : C.text, textAlign: "left" }}>
                        {sortBy === opt.key && <span style={{ fontSize: 11, color: C.green }}>✓</span>} {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div style={{ display: "flex", border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
              <button onClick={() => setView("grid")} style={{ padding: "7px 10px", background: view === "grid" ? C.greenFaint : C.white, border: "none", cursor: "pointer", color: view === "grid" ? C.green : "#888" }}><LayoutGrid size={14} /></button>
              <button onClick={() => setView("list")} style={{ padding: "7px 10px", background: view === "list" ? C.greenFaint : C.white, border: "none", cursor: "pointer", color: view === "list" ? C.green : "#888", borderLeft: `1px solid ${C.border}` }}><List size={14} /></button>
            </div>
          </div>
        </div>

        {/* Book grid / list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 16px" }}>
          {sorted.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60%", gap: 10, color: C.muted }}>
              <BookOpen size={36} strokeWidth={1.2} />
              <div style={{ fontSize: 14 }}>
                {activeFilter === "Favorites" ? "No favorites yet — click the heart icon on a book." :
                 activeFilter === "Archived" ? "No archived books." :
                 "No books match this filter."}
              </div>
            </div>
          ) : view === "grid" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 16 }}>
              {sorted.map(book => {
                const bss = STATUS[book.status];
                const isActive = book.id === selectedId;
                const inProgress = book.status !== "Finished" && book.status !== "DNF" && book.currentPage < book.pages;
                return (
                  <div key={book.id} onClick={() => setSelectedId(book.id)} style={{ background: C.white, borderRadius: 10, border: isActive ? `2px solid ${C.green}` : `1px solid ${C.borderCard}`, boxShadow: isActive ? `0 0 0 3px ${C.greenFaint}` : C.shadow, overflow: "hidden", cursor: "pointer", transition: "border-color .13s, box-shadow .13s", opacity: isArchiveView ? 0.75 : 1 }}>
                    <BookCover from={book.coverFrom} to={book.coverTo} title={book.title} height={200} coverUrl={book.coverUrl} />
                    <div style={{ padding: "10px 12px 12px" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.text, lineHeight: 1.3, marginBottom: 2 }}>{book.title}</div>
                      <div style={{ fontSize: 11.5, color: C.muted, marginBottom: 7 }}>{book.author}</div>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 8px", borderRadius: 20, fontSize: 10.5, fontWeight: 600, background: bss.bg, color: bss.text, marginBottom: 6 }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: bss.dot }} />{book.status}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 3 }}>
                        <Stars rating={book.rating} />
                        <span style={{ fontSize: 11, color: C.muted }}>{book.rating.toFixed(1)}</span>
                      </div>
                      <div style={{ fontSize: 11, color: C.muted }}>{book.status === "Finished" ? `${book.pages} pages` : `${book.currentPage} / ${book.pages} pages`}</div>
                      {inProgress && (
                        <div style={{ height: 3, background: "#e4e9e5", borderRadius: 99, marginTop: 5, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${(book.currentPage / book.pages) * 100}%`, background: C.green, borderRadius: 99 }} />
                        </div>
                      )}
                      {isArchiveView && (
                        <button onClick={e => { e.stopPropagation(); unarchiveBook(book.id); }} style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: C.green, background: C.greenFaint, border: "none", borderRadius: 6, padding: "3px 8px", cursor: "pointer" }}>
                          <RotateCcw size={10} /> Unarchive
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", background: C.white, borderRadius: 10, border: `1px solid ${C.borderCard}`, overflow: "hidden" }}>
              {sorted.map((book, i) => {
                const bss = STATUS[book.status];
                const isActive = book.id === selectedId;
                const inProgress = book.status !== "Finished" && book.status !== "DNF" && book.currentPage < book.pages;
                return (
                  <div key={book.id} onClick={() => setSelectedId(book.id)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", borderBottom: i < sorted.length - 1 ? `1px solid ${C.border}` : "none", background: isActive ? C.greenFaint : C.white, cursor: "pointer", transition: "background .1s" }}>
                    <div style={{ width: 36, height: 52, borderRadius: 4, flexShrink: 0, background: `linear-gradient(155deg, ${book.coverFrom} 0%, ${book.coverTo} 100%)`, position: "relative", overflow: "hidden", boxShadow: "1px 1px 4px rgba(0,0,0,.18)" }}>
                      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: "linear-gradient(to right, rgba(0,0,0,.25), transparent)" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.text, lineHeight: 1.3 }}>{book.title}</div>
                      <div style={{ fontSize: 11.5, color: C.muted }}>{book.author}</div>
                    </div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 8px", borderRadius: 20, fontSize: 10.5, fontWeight: 600, background: bss.bg, color: bss.text, flexShrink: 0 }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: bss.dot }} />{book.status}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
                      <Stars rating={book.rating} />
                      <span style={{ fontSize: 11, color: C.muted, marginLeft: 3 }}>{book.rating.toFixed(1)}</span>
                    </div>
                    <div style={{ fontSize: 11, color: C.muted, flexShrink: 0, width: 80 }}>{book.status === "Finished" ? `${book.pages} pp` : `${book.currentPage}/${book.pages}`}</div>
                    {inProgress ? (
                      <div style={{ width: 72, height: 4, background: "#e4e9e5", borderRadius: 99, overflow: "hidden", flexShrink: 0 }}>
                        <div style={{ height: "100%", width: `${(book.currentPage / book.pages) * 100}%`, background: C.green, borderRadius: 99 }} />
                      </div>
                    ) : <div style={{ width: 72, flexShrink: 0 }} />}
                    <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                      {isArchiveView ? (
                        <button onClick={e => { e.stopPropagation(); unarchiveBook(book.id); }} style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${C.border}`, borderRadius: 6, background: C.white, color: C.green, cursor: "pointer" }}><RotateCcw size={13} /></button>
                      ) : (
                        <>
                          <button onClick={e => { e.stopPropagation(); openEditModal(book); }} style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${C.border}`, borderRadius: 6, background: C.white, color: C.muted, cursor: "pointer" }}><PenLine size={13} /></button>
                          <button onClick={e => { e.stopPropagation(); archiveBook(book.id); }} style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${C.border}`, borderRadius: 6, background: C.white, color: "#c0392b", cursor: "pointer" }}><Archive size={13} /></button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ padding: "8px 24px", borderTop: `1px solid ${C.border}`, fontSize: 11.5, color: "#bbb", textAlign: "center", flexShrink: 0 }}>
          All data stored only on this device.
        </div>
      </div>

      {/* ══ RIGHT: detail panel ══ */}
      {selected && (
        <div style={{ width: 244, flexShrink: 0, background: C.white, borderLeft: `1px solid ${C.border}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ flex: 1, overflowY: "auto" }}>
            <BookCover from={selected.coverFrom} to={selected.coverTo} title={selected.title} height={160} coverUrl={selected.coverUrl} />
            <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text, lineHeight: 1.3, marginBottom: 3 }}>{selected.title}</div>
                <div style={{ fontSize: 12.5, color: C.muted }}>{selected.author}</div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 20, fontSize: 11.5, fontWeight: 600, background: ss.bg, color: ss.text, alignSelf: "flex-start" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: ss.dot, flexShrink: 0 }} />
                  {selected.status}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <Stars rating={selected.rating} />
                  <span style={{ fontSize: 12, color: C.muted }}>{selected.rating.toFixed(1)}</span>
                </div>
                <div style={{ fontSize: 12, color: C.muted }}>{selected.currentPage} / {selected.pages} pages</div>
                {selected.status !== "Finished" && selected.status !== "DNF" && (
                  <div style={{ height: 4, background: "#e4e9e5", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(selected.currentPage / selected.pages) * 100}%`, background: C.green, borderRadius: 99 }} />
                  </div>
                )}
              </div>

              <Section label="Metadata">
                <MetaRow label="Format" value={selected.format} />
                <MetaRow label="ISBN" value={selected.isbn} />
                <MetaRow label="Published" value={selected.published} />
                <MetaRow label="Pages" value={String(selected.pages)} />
                <MetaRow label="Language" value="English" />
              </Section>

              <Section label="Ownership">
                <MetaRow label="Source" value={selected.source} />
                <MetaRow label="Date added" value={selected.dateAdded} />
                <MetaRow label="Location" value={selected.location} />
              </Section>

              {!isArchiveView && (
                <Section label="Tags">
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 4 }}>
                    {selected.tags.map(t => (
                      <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 20, fontSize: 11.5, background: C.greenFaint, color: C.green, fontWeight: 500 }}>
                        {t}
                        <span onClick={() => removeTag(selected.id, t)} style={{ cursor: "pointer", color: "#5a9060", fontSize: 13, lineHeight: 1 }}>×</span>
                      </span>
                    ))}
                    {addingTag ? (
                      <input
                        autoFocus
                        value={newTagInput}
                        onChange={e => setNewTagInput(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") addTag(selected.id, newTagInput); if (e.key === "Escape") { setAddingTag(false); setNewTagInput(""); } }}
                        onBlur={() => { setTimeout(() => addTag(selected.id, newTagInput), 100); }}
                        placeholder="tag name"
                        style={{ width: 80, padding: "2px 8px", borderRadius: 20, border: `1px solid ${C.green}`, fontSize: 11.5, outline: "none", color: C.green }}
                      />
                    ) : (
                      <button onClick={() => setAddingTag(true)} style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 9px", borderRadius: 20, fontSize: 11.5, border: `1px dashed ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer" }}>
                        <Plus size={10} /> Add tag
                      </button>
                    )}
                  </div>
                </Section>
              )}

              <Section label="Notes">
                <div style={{ fontSize: 12, color: "#444", lineHeight: 1.65, marginTop: 4, whiteSpace: "pre-line" }}>{selected.notes}</div>
              </Section>
            </div>
          </div>

          {/* Bottom actions */}
          <div style={{ padding: "10px 12px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 6, flexShrink: 0 }}>
            {isArchiveView ? (
              <button onClick={() => unarchiveBook(selected.id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "8px 4px", border: `1px solid ${C.green}`, borderRadius: 8, background: C.greenFaint, fontSize: 10.5, color: C.green, cursor: "pointer" }}>
                <RotateCcw size={14} /> Unarchive
              </button>
            ) : (
              <>
                <button onClick={() => openEditModal(selected)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "8px 4px", border: `1px solid ${C.border}`, borderRadius: 8, background: C.white, fontSize: 10.5, color: "#555", cursor: "pointer" }}>
                  <PenLine size={14} style={{ color: C.muted }} /> Edit book
                </button>

                {/* Move to... */}
                <div style={{ flex: 1, position: "relative" }}>
                  <button onClick={() => setMoveToOpen(o => !o)} style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "8px 4px", border: `1px solid ${C.border}`, borderRadius: 8, background: C.white, fontSize: 10.5, color: "#555", cursor: "pointer" }}>
                    <BookOpen size={14} style={{ color: C.muted }} /> Move to...
                  </button>
                  {moveToOpen && (
                    <>
                      <div style={{ position: "fixed", inset: 0, zIndex: 9 }} onClick={() => setMoveToOpen(false)} />
                      <div style={{ position: "absolute", bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)", background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, boxShadow: "0 4px 16px rgba(0,0,0,.14)", zIndex: 10, overflow: "hidden", minWidth: 140 }}>
                        {STATUS_OPTIONS.map(s => (
                          <button key={s} onClick={() => changeStatus(selected.id, s)} style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 14px", width: "100%", textAlign: "left", border: "none", background: selected.status === s ? C.greenFaint : "transparent", cursor: "pointer", fontSize: 12.5, color: C.text }}>
                            <span style={{ width: 7, height: 7, borderRadius: "50%", background: STATUS[s].dot, flexShrink: 0 }} />{s}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <button onClick={() => archiveBook(selected.id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "8px 4px", border: `1px solid ${C.border}`, borderRadius: 8, background: C.white, fontSize: 10.5, color: "#c0392b", cursor: "pointer" }}>
                  <Archive size={14} /> Archive
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ══ Modal ══ */}
      {showAddModal && (
        <BookModal
          initial={editingBook ?? undefined}
          onSave={editingBook ? b => updateBook(b as Book) : b => addBook(b as Omit<Book, "id">)}
          onClose={() => { setShowAddModal(false); setEditingBook(null); }}
        />
      )}
    </div>
  );
}
