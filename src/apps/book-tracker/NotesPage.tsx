import { useState, useEffect, useRef } from "react";
import {
  Search, Star, MoreHorizontal, Edit3, Copy, Trash2,
  ChevronDown, X, Shuffle, ArrowLeft, FileText, Quote,
  Cloud, CheckCircle2, BookOpen,
} from "lucide-react";

const C = {
  bg: "#F7F5F0",
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
const SHADOW = C.shadow;

const MOOD_COLOR: Record<string, string> = {
  thoughtful: "#6b5b93",
  strange: "#4a90a4",
  "slow burn": "#e8a44a",
  political: "#3d9e5f",
  melancholic: "#8b6f47",
  other: "#aaaaaa",
};
function moodColor(m: string) { return MOOD_COLOR[m] ?? "#aaaaaa"; }

interface BookNote {
  id: number;
  bookId: number;
  bookTitle: string;
  bookAuthor: string;
  bookCoverFrom: string;
  bookCoverTo: string;
  bookCoverUrl?: string;
  type: "Quote" | "Reflection" | "Summary" | "Question";
  text: string;
  speaker?: string;
  page?: number;
  moods: string[];
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
  personalNote?: string;
}

function loadLibraryBooks(): Array<{ id: number; title: string; author: string; coverFrom: string; coverTo: string; coverUrl?: string }> {
  try {
    const raw = localStorage.getItem("bt_books");
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr.map((b: Record<string, unknown>) => ({
        id: Number(b.id),
        title: String(b.title ?? ""),
        author: String(b.author ?? ""),
        coverFrom: String(b.coverFrom ?? "#2d4a3e"),
        coverTo: String(b.coverTo ?? "#1a2e24"),
        coverUrl: b.coverUrl ? String(b.coverUrl) : undefined,
      }));
    }
  } catch {}
  return [];
}

const INITIAL_NOTES: BookNote[] = [];

const STORAGE_KEY = "bt_notes";
function loadNotes(): BookNote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as BookNote[];
  } catch {}
  return INITIAL_NOTES;
}
function saveNotes(notes: BookNote[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(notes)); } catch {}
}

function MiniCover({ from, to, size = 40, coverUrl }: { from: string; to: string; size?: number; coverUrl?: string }) {
  if (coverUrl) {
    return (
      <img src={coverUrl} alt=""
        style={{ width: size, height: size * 1.4, borderRadius: 4, objectFit: "cover", flexShrink: 0,
          boxShadow: "0 1px 4px rgba(0,0,0,.3)" }} />
    );
  }
  return (
    <div style={{
      width: size, height: size * 1.4, borderRadius: 4, flexShrink: 0,
      background: `linear-gradient(160deg, ${from} 0%, ${to} 100%)`,
      boxShadow: "inset -1px 0 0 rgba(255,255,255,.08), 0 1px 4px rgba(0,0,0,.3)",
    }} />
  );
}

function MoodPill({ mood, onClick, active }: { mood: string; onClick?: () => void; active?: boolean }) {
  const color = moodColor(mood);
  return (
    <span
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        padding: "2.5px 8px", borderRadius: 20,
        background: active ? color + "22" : "transparent",
        border: `1px solid ${color}44`,
        fontSize: 11, color: color, cursor: onClick ? "pointer" : "default",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0 }} />
      {mood}
    </span>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: C.muted, marginBottom: 10 }}>
      {children}
    </div>
  );
}

function DeleteDialog({ note, onCancel, onConfirm }: { note: BookNote; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onCancel}>
      <div style={{ background: C.white, borderRadius: 14, width: "min(460px, 92vw)", boxShadow: "0 8px 40px rgba(0,0,0,.18)", padding: "28px 28px 24px" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#f0edf8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Quote size={18} style={{ color: "#6b5b93" }} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 4 }}>Delete this note?</div>
          </div>
          <button onClick={onCancel} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: C.muted, flexShrink: 0 }}><X size={18} /></button>
        </div>

        <div style={{ background: C.bg, borderRadius: 10, padding: "14px 16px", marginBottom: 16, display: "flex", gap: 12, alignItems: "center" }}>
          <MiniCover from={note.bookCoverFrom} to={note.bookCoverTo} size={36} coverUrl={note.bookCoverUrl} />
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: C.text, lineHeight: 1.35, marginBottom: 3 }}>
              {note.text.length > 60 ? note.text.slice(0, 57) + "…" : note.text}
            </div>
            <div style={{ fontSize: 11.5, color: C.muted }}>{note.bookTitle} · p. {note.page}</div>
          </div>
        </div>

        <p style={{ fontSize: 13, color: "#666", marginBottom: 22, lineHeight: 1.5 }}>
          This note will be permanently removed from your local reading journal.
        </p>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={{ padding: "9px 20px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", fontSize: 13.5, fontWeight: 500, color: "#555", cursor: "pointer" }}>Cancel</button>
          <button onClick={onConfirm} style={{ padding: "9px 20px", borderRadius: 8, border: "1px solid #c0392b", background: "transparent", fontSize: 13.5, fontWeight: 500, color: "#c0392b", cursor: "pointer" }}>Delete note</button>
        </div>
      </div>
    </div>
  );
}

interface NoteFormData {
  bookId: number;
  type: "Quote" | "Reflection" | "Summary" | "Question";
  text: string;
  speaker: string;
  page: string;
  moods: string[];
  favorite: boolean;
  personalNote: string;
}

function NoteDialog({
  mode, initial, onCancel, onSave, noteCreatedAt, libraryBooks,
}: {
  mode: "add" | "edit";
  initial: NoteFormData;
  onCancel: () => void;
  onSave: (data: NoteFormData) => void;
  noteCreatedAt?: string;
  libraryBooks: Array<{ id: number; title: string; author: string; coverFrom: string; coverTo: string; coverUrl?: string }>;
}) {
  const [form, setForm] = useState<NoteFormData>(initial);
  const [addingMood, setAddingMood] = useState(false);
  const [newMood, setNewMood] = useState("");
  const [showBookDrop, setShowBookDrop] = useState(false);

  const PLACEHOLDER_BOOK = { id: 0, title: "Select a book", author: "", coverFrom: "#2d4a3e", coverTo: "#1a2e24", coverUrl: undefined as string | undefined };
  const books = libraryBooks.length > 0 ? libraryBooks : [PLACEHOLDER_BOOK];
  const selectedBook = books.find(b => b.id === form.bookId) ?? books[0];
  const existingMoods = Object.keys(MOOD_COLOR);
  const allMoods = [...new Set([...existingMoods, ...form.moods])];
  const noteTypes: Array<"Quote" | "Reflection" | "Summary" | "Question"> = ["Quote", "Reflection", "Summary", "Question"];

  function toggleMood(m: string) {
    setForm(f => ({ ...f, moods: f.moods.includes(m) ? f.moods.filter(x => x !== m) : [...f.moods, m] }));
  }

  function addMood() {
    const m = newMood.trim().toLowerCase();
    if (m && !form.moods.includes(m)) setForm(f => ({ ...f, moods: [...f.moods, m] }));
    setNewMood(""); setAddingMood(false);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onCancel}>
      <div style={{ background: C.white, borderRadius: 14, width: "min(560px, 92vw)", boxShadow: "0 8px 40px rgba(0,0,0,.18)", padding: "28px 28px 24px", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, flex: 1 }}>{mode === "add" ? "Add a note" : "Edit note"}</h2>
          <button onClick={onCancel} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted }}><X size={18} /></button>
        </div>

        {/* Book selector */}
        <div style={{ marginBottom: 18 }}>
          {mode === "add" && <div style={{ fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 6 }}>Choose book</div>}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowBookDrop(b => !b)}
              style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 12, background: C.white, cursor: "pointer", textAlign: "left" }}
            >
              <MiniCover from={selectedBook.coverFrom} to={selectedBook.coverTo} size={36} coverUrl={selectedBook.coverUrl} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: C.text }}>{selectedBook.title}</div>
                <div style={{ fontSize: 12, color: C.muted }}>{selectedBook.author}</div>
              </div>
              {mode === "edit" && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                  <div style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>Page</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{form.page || "—"}</div>
                </div>
              )}
              {mode === "add" && <ChevronDown size={15} style={{ color: C.muted }} />}
            </button>
            {showBookDrop && mode === "add" && (
              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, boxShadow: SHADOW, zIndex: 10, marginTop: 4, overflow: "hidden" }}>
                {books.length === 0 && (
                  <div style={{ padding: "12px 14px", fontSize: 13, color: C.muted }}>Add books to your library first</div>
                )}
                {books.map(b => (
                  <button key={b.id} onClick={() => { setForm(f => ({ ...f, bookId: b.id })); setShowBookDrop(false); }}
                    style={{ width: "100%", padding: "9px 14px", display: "flex", alignItems: "center", gap: 10, background: form.bookId === b.id ? C.greenFaint : "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
                    <MiniCover from={b.coverFrom} to={b.coverTo} size={28} coverUrl={b.coverUrl} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{b.title}</div>
                      <div style={{ fontSize: 11.5, color: C.muted }}>{b.author}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Note type + page row */}
        <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 6 }}>Note type</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
              {noteTypes.map(t => (
                <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                  style={{ padding: "6px 14px", borderRadius: 20, border: `1px solid ${form.type === t ? C.green : C.border}`, background: form.type === t ? C.green : "transparent", color: form.type === t ? "#fff" : "#555", fontSize: 12.5, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                  {form.type === t && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff", display: "inline-block" }} />}
                  {t}
                </button>
              ))}
            </div>
          </div>
          {mode === "add" && (
            <div style={{ flexShrink: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 6 }}>Page (optional)</div>
              <input type="number" placeholder="211" value={form.page} onChange={e => setForm(f => ({ ...f, page: e.target.value }))}
                style={{ width: 90, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 10px", fontSize: 13, outline: "none" }} />
            </div>
          )}
        </div>

        {mode === "edit" && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 6 }}>Page</div>
            <input type="number" placeholder="211" value={form.page} onChange={e => setForm(f => ({ ...f, page: e.target.value }))}
              style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none" }} />
          </div>
        )}

        {/* Note */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 6 }}>Note</div>
          <textarea value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
            placeholder="Write what you're thinking..."
            style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", fontSize: 13.5, outline: "none", resize: "vertical", minHeight: 110, lineHeight: 1.55, boxSizing: "border-box" }} />
        </div>

        {/* Personal note */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 6 }}>My note (optional)</div>
          <textarea value={form.personalNote} onChange={e => setForm(f => ({ ...f, personalNote: e.target.value }))}
            placeholder="Write your personal reflection..."
            style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", fontSize: 13.5, outline: "none", resize: "vertical", minHeight: 90, lineHeight: 1.55, boxSizing: "border-box", fontFamily: "'Kalam', cursive, sans-serif" }} />
        </div>

        {/* Mood */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 8 }}>Mood {mode === "add" ? "(optional)" : ""}</div>
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6, alignItems: "center" }}>
            {allMoods.map(m => (
              <button key={m} onClick={() => toggleMood(m)}
                style={{ padding: "5px 12px", borderRadius: 20, border: `1px solid ${moodColor(m)}44`, background: form.moods.includes(m) ? moodColor(m) + "22" : "transparent", color: moodColor(m), fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                {form.moods.includes(m) && <span style={{ fontSize: 10 }}>✓</span>}
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: moodColor(m), display: "inline-block" }} />
                {m}
              </button>
            ))}
            {addingMood ? (
              <input autoFocus value={newMood} onChange={e => setNewMood(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") addMood(); if (e.key === "Escape") { setAddingMood(false); setNewMood(""); } }}
                onBlur={addMood}
                placeholder="mood name"
                style={{ border: `1px solid ${C.border}`, borderRadius: 20, padding: "4px 10px", fontSize: 12, outline: "none", width: 100 }} />
            ) : (
              <button onClick={() => setAddingMood(true)} style={{ padding: "5px 12px", borderRadius: 20, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontSize: 12, cursor: "pointer" }}>+ Add mood</button>
            )}
          </div>
        </div>

        {/* Favorite */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
          <label style={{ position: "relative", display: "inline-block", width: 40, height: 22, cursor: "pointer" }}>
            <input type="checkbox" checked={form.favorite} onChange={e => setForm(f => ({ ...f, favorite: e.target.checked }))} style={{ opacity: 0, width: 0, height: 0, position: "absolute" }} />
            <span style={{ position: "absolute", inset: 0, borderRadius: 20, background: form.favorite ? C.green : "#ccc", transition: "background .2s" }} />
            <span style={{ position: "absolute", top: 3, left: form.favorite ? 21 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.2)" }} />
          </label>
          <span style={{ fontSize: 13.5, color: C.text }}>{mode === "edit" ? "Mark as favorite" : "Mark as favorite"}</span>
        </div>

        {/* Footer */}
        {noteCreatedAt && (
          <div style={{ fontSize: 11.5, color: C.muted, marginBottom: 14, display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ color: "#aaa" }}>ⓘ</span> Created {noteCreatedAt} · Edited just now
          </div>
        )}

        {mode === "add" && (
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 14, display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ color: "#aaa" }}>ⓘ</span> Your note will be stored locally on this device.
          </div>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={{ padding: "9px 20px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", fontSize: 13.5, fontWeight: 500, color: "#555", cursor: "pointer" }}>Cancel</button>
          <button onClick={() => onSave(form)} style={{ padding: "9px 22px", borderRadius: 8, background: C.green, color: "#fff", fontSize: 13.5, fontWeight: 600, cursor: "pointer", border: "none" }}>
            {mode === "add" ? "Save note" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ContextMenu({ x, y, onEdit, onCopy, onFavorite, onDelete, onClose }: {
  x: number; y: number;
  onEdit: () => void; onCopy: () => void; onFavorite: () => void; onDelete: () => void; onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handler(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const item = (icon: React.ReactNode, label: string, onClick: () => void, danger = false) => (
    <button onClick={() => { onClick(); onClose(); }}
      style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", padding: "8px 14px", background: "transparent", border: "none", cursor: "pointer", fontSize: 13, color: danger ? "#c0392b" : C.text, textAlign: "left" }}
      onMouseEnter={e => (e.currentTarget.style.background = danger ? "#fdecea" : C.bg)}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
    >{icon} {label}</button>
  );

  return (
    <div ref={ref} style={{ position: "fixed", top: y, left: x, background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, boxShadow: "0 4px 20px rgba(0,0,0,.14)", zIndex: 500, minWidth: 180, overflow: "hidden", paddingTop: 4, paddingBottom: 4 }}>
      {item(<Edit3 size={14} />, "Edit note", onEdit)}
      {item(<Copy size={14} />, "Copy quote", onCopy)}
      {item(<Star size={14} />, "Mark as favorite", onFavorite)}
      <div style={{ borderTop: `1px solid ${C.border}`, margin: "4px 0" }} />
      {item(<Trash2 size={14} />, "Delete note", onDelete, true)}
    </div>
  );
}

function NoteDetailPage({ note, onBack, onEdit, onCopy, onDelete, copied }: {
  note: BookNote; onBack: () => void; onEdit: () => void; onCopy: () => void; onDelete: () => void; copied: boolean;
}) {
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: C.green, fontSize: 13.5, fontWeight: 500, marginBottom: 18, padding: 0 }}>
        <ArrowLeft size={15} /> Back to notes
      </button>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 22 }}>Note details</h2>

      <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.borderCard}`, boxShadow: SHADOW, padding: "28px 32px" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 22 }}>
          <button onClick={onEdit} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, cursor: "pointer", fontSize: 12.5, color: "#555" }}>
            <Edit3 size={13} /> Edit note
          </button>
          <button onClick={onCopy} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, cursor: "pointer", fontSize: 12.5, color: copied ? C.green : "#555" }}>
            {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />} {copied ? "Copied!" : "Copy quote"}
          </button>
          <button onClick={onDelete} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "1px solid #e8c5c5", background: "#fff5f5", cursor: "pointer", fontSize: 12.5, color: "#c0392b" }}>
            <Trash2 size={13} /> Delete note
          </button>
        </div>

        <div style={{ display: "flex", gap: 28, alignItems: "flex-start" }}>
          <MiniCover from={note.bookCoverFrom} to={note.bookCoverTo} size={90} coverUrl={note.bookCoverUrl} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
              <span style={{ ...SERIF, fontSize: 52, color: C.green, lineHeight: 0.8, marginTop: 8 }}>"</span>
              <p style={{ ...SERIF, fontSize: 22, lineHeight: 1.55, color: C.text, fontStyle: "italic" }}>{note.text}"</p>
            </div>
            {note.speaker && <p style={{ ...SERIF, fontSize: 15, color: C.muted, marginBottom: 16 }}>— {note.speaker}</p>}

            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 18, marginTop: 8 }}>
              <div style={{ fontSize: 13, color: "#555", marginBottom: 4 }}><b style={{ color: C.text }}>{note.bookTitle}</b></div>
              <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 14 }}>{note.bookAuthor} · {note.createdAt}{note.page ? ` · p. ${note.page}` : ""}</div>

              {note.type && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: C.muted, marginBottom: 6 }}>Note type</div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, border: `1px solid ${C.border}`, fontSize: 12.5, color: "#555" }}>
                    {note.type === "Quote" ? <Quote size={12} /> : <FileText size={12} />} {note.type}
                  </span>
                </div>
              )}

              {note.moods.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: C.muted, marginBottom: 6 }}>Mood</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
                    {note.moods.map(m => <MoodPill key={m} mood={m} />)}
                  </div>
                </div>
              )}

              {note.favorite && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#e8a44a" }}>
                  <Star size={16} fill="#e8a44a" /> <span style={{ fontSize: 13, fontWeight: 500 }}>Favorite</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NotesPage() {
  const [notes, setNotes] = useState<BookNote[]>(() => loadNotes());
  const [libraryBooks] = useState(() => loadLibraryBooks());
  const [selectedId, setSelectedId] = useState<number | null>(notes[0]?.id ?? null);
  const [view, setView] = useState<"list" | "detail">("list");
  const [filterTab, setFilterTab] = useState<"all" | "quotes" | "reflections" | "favorites">("all");
  const [moodFilter, setMoodFilter] = useState<string | null>(null);
  const [searchQ, setSearchQ] = useState("");
  const [showMoodDrop, setShowMoodDrop] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ noteId: number; x: number; y: number } | null>(null);
  const [copyToast, setCopyToast] = useState(false);
  const [centerCopied, setCenterCopied] = useState(false);
  const [detailCopied, setDetailCopied] = useState(false);
  const [newNoteToast, setNewNoteToast] = useState(false);
  const [randomNote, setRandomNote] = useState<BookNote | null>(() =>
    notes.length > 0 ? notes[Math.floor(Math.random() * notes.length)] : null
  );

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function persistNotes(updated: BookNote[]) { setNotes(updated); saveNotes(updated); }

  // Filtered list
  const filtered = notes.filter(n => {
    if (filterTab === "quotes" && n.type !== "Quote") return false;
    if (filterTab === "reflections" && n.type !== "Reflection") return false;
    if (filterTab === "favorites" && !n.favorite) return false;
    if (moodFilter && !n.moods.includes(moodFilter)) return false;
    if (searchQ) {
      const q = searchQ.toLowerCase();
      if (!n.text.toLowerCase().includes(q) && !n.bookTitle.toLowerCase().includes(q) && !n.bookAuthor.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const selectedNote = notes.find(n => n.id === selectedId) ?? null;

  // Mood counts
  const moodCounts: Record<string, number> = {};
  notes.forEach(n => n.moods.forEach(m => { moodCounts[m] = (moodCounts[m] ?? 0) + 1; }));

  function doCopy(text: string) {
    try { navigator.clipboard.writeText(text); } catch {}
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setCopyToast(true);
    toastTimer.current = setTimeout(() => setCopyToast(false), 2500);
  }

  function handleCopy(note: BookNote) {
    doCopy(note.text);
    setCenterCopied(true);
    setTimeout(() => setCenterCopied(false), 2000);
  }

  function handleShuffle() {
    if (notes.length === 0) return;
    const others = randomNote ? notes.filter(n => n.id !== randomNote.id) : notes;
    const pool = others.length > 0 ? others : notes;
    setRandomNote(pool[Math.floor(Math.random() * pool.length)]);
    setNewNoteToast(true);
    setTimeout(() => setNewNoteToast(false), 2500);
  }

  function handleSaveNote(data: NoteFormData) {
    const book = libraryBooks.find(b => b.id === data.bookId) ?? libraryBooks[0] ?? { id: 0, title: "Unknown", author: "", coverFrom: "#2d4a3e", coverTo: "#1a2e24" };
    const now = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const newNote: BookNote = {
      id: Date.now(), bookId: data.bookId, bookTitle: book.title, bookAuthor: book.author,
      bookCoverFrom: book.coverFrom, bookCoverTo: book.coverTo, bookCoverUrl: book.coverUrl,
      type: data.type, text: data.text, speaker: data.speaker || undefined,
      page: data.page ? parseInt(data.page) : undefined, moods: data.moods, favorite: data.favorite,
      createdAt: now, updatedAt: now, personalNote: data.personalNote || undefined,
    };
    const updated = [newNote, ...notes];
    persistNotes(updated);
    setSelectedId(newNote.id);
    setShowAddDialog(false);
  }

  function handleEditNote(data: NoteFormData) {
    if (!selectedId) return;
    const book = libraryBooks.find(b => b.id === data.bookId) ?? libraryBooks[0] ?? { id: 0, title: "Unknown", author: "", coverFrom: "#2d4a3e", coverTo: "#1a2e24" };
    const now = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    persistNotes(notes.map(n => n.id === selectedId ? {
      ...n, bookId: data.bookId, bookTitle: book.title, bookAuthor: book.author,
      bookCoverFrom: book.coverFrom, bookCoverTo: book.coverTo, bookCoverUrl: book.coverUrl,
      type: data.type, text: data.text, speaker: data.speaker || undefined,
      page: data.page ? parseInt(data.page) : undefined, moods: data.moods, favorite: data.favorite,
      updatedAt: now, personalNote: data.personalNote || undefined,
    } : n));
    setShowEditDialog(false);
  }

  function handleDeleteNote() {
    if (!selectedId) return;
    const updated = notes.filter(n => n.id !== selectedId);
    persistNotes(updated);
    setSelectedId(updated[0]?.id ?? null);
    setShowDeleteDialog(false);
    if (view === "detail") setView("list");
  }

  function toggleFavorite(id: number) {
    persistNotes(notes.map(n => n.id === id ? { ...n, favorite: !n.favorite } : n));
  }

  const addFormDefault: NoteFormData = { bookId: 1, type: "Reflection", text: "", speaker: "", page: "", moods: [], favorite: false, personalNote: "" };
  const editFormDefault: NoteFormData = selectedNote ? {
    bookId: selectedNote.bookId, type: selectedNote.type, text: selectedNote.text,
    speaker: selectedNote.speaker ?? "", page: selectedNote.page?.toString() ?? "",
    moods: [...selectedNote.moods], favorite: selectedNote.favorite,
    personalNote: selectedNote.personalNote ?? "",
  } : addFormDefault;

  const tabStyle = (active: boolean) => ({
    padding: "5px 14px", borderRadius: 20, fontSize: 13, fontWeight: 500,
    background: active ? C.green : "transparent",
    color: active ? "#fff" : "#555",
    border: `1px solid ${active ? C.green : C.border}`,
    cursor: "pointer",
  });

  if (view === "detail" && selectedNote) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: C.bg }}>
        <PageHeader onNewNote={() => setShowAddDialog(true)} />
        <NoteDetailPage
          note={selectedNote}
          onBack={() => setView("list")}
          onEdit={() => setShowEditDialog(true)}
          onCopy={() => { doCopy(selectedNote.text); setDetailCopied(true); setTimeout(() => setDetailCopied(false), 2000); }}
          onDelete={() => setShowDeleteDialog(true)}
          copied={detailCopied}
        />
        {showEditDialog && <NoteDialog mode="edit" initial={editFormDefault} onCancel={() => setShowEditDialog(false)} onSave={handleEditNote} noteCreatedAt={selectedNote.createdAt} libraryBooks={libraryBooks} />}
        {showDeleteDialog && <DeleteDialog note={selectedNote} onCancel={() => setShowDeleteDialog(false)} onConfirm={handleDeleteNote} />}
        <CopyToast visible={copyToast} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: C.bg }}>
      <PageHeader onNewNote={() => setShowAddDialog(true)} />

      {/* Search + filter bar */}
      <div style={{ padding: "0 24px 10px", flexShrink: 0, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#bbb", pointerEvents: "none" }} />
          <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
            placeholder="Search your notes, quotes, and books..."
            style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 22, padding: "8px 14px 8px 32px", fontSize: 13, background: C.white, outline: "none", boxSizing: "border-box" }} />
        </div>
        <button onClick={() => setShowAddDialog(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: C.green, color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}>
          <Edit3 size={14} /> New note
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ padding: "0 24px 12px", display: "flex", gap: 6, alignItems: "center", flexShrink: 0, flexWrap: "wrap" as const }}>
        <button style={tabStyle(filterTab === "all")} onClick={() => setFilterTab("all")}>All</button>
        <button style={tabStyle(filterTab === "quotes")} onClick={() => setFilterTab("quotes")}>Quotes</button>
        <button style={tabStyle(filterTab === "reflections")} onClick={() => setFilterTab("reflections")}>Reflections</button>
        <button style={{ ...tabStyle(filterTab === "favorites"), display: "flex", alignItems: "center", gap: 5 }} onClick={() => setFilterTab("favorites")}>
          <Star size={12} fill={filterTab === "favorites" ? "#fff" : "none"} stroke={filterTab === "favorites" ? "#fff" : "#e8a44a"} /> Favorites
        </button>
        {moodFilter && (
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowMoodDrop(b => !b)}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px 5px 10px", borderRadius: 20, border: `1px solid ${moodColor(moodFilter)}55`, background: moodColor(moodFilter) + "15", color: moodColor(moodFilter), fontSize: 13, cursor: "pointer" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: moodColor(moodFilter), display: "inline-block" }} />
              Mood: {moodFilter}
              <X size={12} onClick={e => { e.stopPropagation(); setMoodFilter(null); setShowMoodDrop(false); }} />
            </button>
            {showMoodDrop && (
              <MoodDropdown moodCounts={moodCounts} active={moodFilter} onSelect={m => { setMoodFilter(m); setShowMoodDrop(false); }} onClear={() => { setMoodFilter(null); setShowMoodDrop(false); }} onClose={() => setShowMoodDrop(false)} />
            )}
          </div>
        )}
      </div>

      {/* Three-panel body */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "0.85fr 1fr 340px", overflow: "hidden", borderTop: `1px solid ${C.border}` }}>

        {/* LEFT: Note list */}
        <div style={{ borderRight: `1px solid ${C.border}`, overflowY: "auto", background: C.white }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: C.muted, fontSize: 13, marginTop: 32 }}>No notes found</div>
          ) : filtered.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              selected={note.id === selectedId}
              onClick={() => setSelectedId(note.id)}
              onStar={() => toggleFavorite(note.id)}
              onMenu={(x, y) => setContextMenu({ noteId: note.id, x, y })}
            />
          ))}
        </div>

        {/* CENTER: Selected note detail */}
        <div style={{ overflowY: "auto", background: C.white, display: "flex", flexDirection: "column" }}>
          {selectedNote ? (
            <div style={{ padding: "20px 24px", flex: 1 }}>
              {/* Center header */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: C.muted, flex: 1 }}>Selected note</span>
                <button onClick={() => setShowEditDialog(true)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 7, border: `1px solid ${C.border}`, background: C.white, fontSize: 12, color: "#555", cursor: "pointer" }}>
                  <Edit3 size={12} /> Edit note
                </button>
                <button onClick={() => handleCopy(selectedNote)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 7, border: `1px solid ${C.border}`, background: C.white, fontSize: 12, color: centerCopied ? C.green : "#555", cursor: "pointer" }}>
                  {centerCopied ? <CheckCircle2 size={12} style={{ color: C.green }} /> : <Copy size={12} />} Copy quote
                </button>
              </div>

              {/* Quote */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                  <span style={{ ...SERIF, fontSize: 36, color: C.green, lineHeight: 0.8, marginTop: 6, flexShrink: 0 }}>"</span>
                  <p style={{ ...SERIF, fontSize: 17, lineHeight: 1.65, color: C.text, fontStyle: "italic", margin: 0 }}>{selectedNote.text}"</p>
                </div>
                {selectedNote.speaker && <p style={{ ...SERIF, fontSize: 13.5, color: C.muted, marginLeft: 44 }}>— {selectedNote.speaker}</p>}
              </div>

              {/* Separator */}
              <hr style={{ border: "none", borderTop: `1px solid ${C.border}`, margin: "0 0 16px 0" }} />

              {/* Book info */}
              <div style={{ display: "flex", gap: 12, alignItems: "center", background: C.white, borderRadius: 10, border: `1px solid ${C.borderCard}`, padding: "12px 14px", marginBottom: 16 }}>
                <MiniCover from={selectedNote.bookCoverFrom} to={selectedNote.bookCoverTo} size={44} coverUrl={selectedNote.bookCoverUrl} />
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: C.text }}>{selectedNote.bookTitle}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{selectedNote.bookAuthor}</div>
                  <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>{selectedNote.page ? `p. ${selectedNote.page}` : ""}{selectedNote.page && selectedNote.createdAt ? " · " : ""}{selectedNote.createdAt}</div>
                </div>
              </div>

              {/* Mood chips */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const, marginBottom: 20 }}>
                {selectedNote.moods.map(m => <MoodPill key={m} mood={m} />)}
                <button style={{ padding: "3px 10px", borderRadius: 20, border: `1px dashed ${C.border}`, background: "transparent", fontSize: 11.5, color: C.muted, cursor: "pointer" }}>+ Add mood</button>
              </div>

              {/* Personal note */}
              {selectedNote.personalNote && (
                <div>
                  <div style={{ ...SERIF, fontSize: 17, fontStyle: "italic", color: C.text, marginBottom: 10 }}>My note</div>
                  <p style={{ fontFamily: "'Kalam', cursive, sans-serif", fontSize: 14.5, lineHeight: 1.75, color: "#333", whiteSpace: "pre-line" as const }}>{selectedNote.personalNote}</p>
                </div>
              )}

              {/* Timestamps */}
              <div style={{ marginTop: "auto", paddingTop: 20, borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", fontSize: 11, color: C.muted }}>
                <span>Created: {selectedNote.createdAt}</span>
                <span>Updated: {selectedNote.updatedAt}</span>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, fontSize: 13 }}>
              Select a note to view it
            </div>
          )}
        </div>

        {/* RIGHT: Sidebar */}
        <div style={{ borderLeft: `1px solid ${C.border}`, overflowY: "auto", padding: "20px 16px", background: C.white, display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Random note */}
          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: C.muted }}>Random Note</div>
              <button onClick={handleShuffle} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 2 }}>
                <Shuffle size={14} />
              </button>
            </div>
            {randomNote ? (
              <>
                {newNoteToast && (
                  <div style={{ position: "absolute", top: -32, left: 0, right: 0, background: C.green, color: "#fff", borderRadius: 8, padding: "5px 10px", fontSize: 11.5, fontWeight: 500, textAlign: "center", display: "flex", alignItems: "center", gap: 5, justifyContent: "center" }}>
                    <Edit3 size={11} /> A new note to revisit
                  </div>
                )}
                <div style={{ background: C.white, border: `1px solid ${C.borderCard}`, borderRadius: 10, padding: "14px 14px 12px", boxShadow: SHADOW }}>
                  <div style={{ display: "flex", gap: 5, alignItems: "flex-start", marginBottom: 10 }}>
                    <span style={{ ...SERIF, fontSize: 22, color: C.green, lineHeight: 0.7, flexShrink: 0, marginTop: 4 }}>"</span>
                    <p style={{ ...SERIF, fontSize: 12.5, lineHeight: 1.6, color: C.text, fontStyle: "italic", margin: 0 }}>
                      {randomNote.text.length > 120 ? randomNote.text.slice(0, 117) + "…" : randomNote.text}"
                    </p>
                  </div>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: C.text, marginBottom: 1 }}>{randomNote.bookTitle}</div>
                  {randomNote.page && <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>p. {randomNote.page}</div>}
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>{randomNote.createdAt}</div>
                  {randomNote.moods[0] && <MoodPill mood={randomNote.moods[0]} />}
                  <button onClick={() => setSelectedId(randomNote.id)}
                    style={{ display: "block", width: "100%", marginTop: 12, padding: "7px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", fontSize: 12, color: "#555", cursor: "pointer" }}>
                    View in notes
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "20px 12px", color: C.muted, fontSize: 12.5, border: `1px dashed ${C.border}`, borderRadius: 10 }}>
                Add a note to see a random one here
              </div>
            )}
          </div>

          {/* Notes by mood */}
          <div>
            <SectionLabel>Notes by Mood</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {Object.entries(moodCounts).sort((a, b) => b[1] - a[1]).map(([mood, count]) => (
                <button key={mood} onClick={() => setMoodFilter(moodFilter === mood ? null : mood)}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 8px", borderRadius: 7, border: "none", background: moodFilter === mood ? moodColor(mood) + "18" : "transparent", cursor: "pointer", textAlign: "left" }}
                  onMouseEnter={e => { if (moodFilter !== mood) (e.currentTarget as HTMLElement).style.background = C.bg; }}
                  onMouseLeave={e => { if (moodFilter !== mood) (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: moodColor(mood), display: "inline-block", flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13, color: C.text }}>{mood}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.muted }}>{count}</span>
                </button>
              ))}
              <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 6, paddingTop: 8, display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12.5, color: "#555", fontWeight: 500 }}>Total notes</span>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: C.text }}>{notes.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlays */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x} y={contextMenu.y}
          onEdit={() => { setSelectedId(contextMenu.noteId); setShowEditDialog(true); }}
          onCopy={() => { const n = notes.find(x => x.id === contextMenu.noteId); if (n) handleCopy(n); }}
          onFavorite={() => toggleFavorite(contextMenu.noteId)}
          onDelete={() => { setSelectedId(contextMenu.noteId); setShowDeleteDialog(true); }}
          onClose={() => setContextMenu(null)}
        />
      )}
      {showAddDialog && <NoteDialog mode="add" initial={addFormDefault} onCancel={() => setShowAddDialog(false)} onSave={handleSaveNote} libraryBooks={libraryBooks} />}
      {showEditDialog && selectedNote && <NoteDialog mode="edit" initial={editFormDefault} onCancel={() => setShowEditDialog(false)} onSave={handleEditNote} noteCreatedAt={selectedNote.createdAt} libraryBooks={libraryBooks} />}
      {showDeleteDialog && selectedNote && <DeleteDialog note={selectedNote} onCancel={() => setShowDeleteDialog(false)} onConfirm={handleDeleteNote} />}
      <CopyToast visible={copyToast} />

      {/* Mood filter dropdown (when no active mood filter, opened from sidebar) */}
      {showMoodDrop && !moodFilter && (
        <MoodDropdown moodCounts={moodCounts} active={null} onSelect={m => { setMoodFilter(m); setShowMoodDrop(false); }} onClear={() => { setMoodFilter(null); setShowMoodDrop(false); }} onClose={() => setShowMoodDrop(false)} />
      )}
    </div>
  );
}

function PageHeader({ onNewNote }: { onNewNote: () => void }) {
  void onNewNote;
  return (
    <div style={{ flexShrink: 0 }}>
      {/* Breadcrumb row */}
      <div style={{ padding: "14px 24px 0", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 22, height: 22, background: C.green, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <BookOpen size={12} stroke="white" strokeWidth={2.2} />
        </div>
        <span style={{ fontSize: 13, color: C.muted }}>Library</span>
        <span style={{ fontSize: 13, color: C.muted }}>/</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Notes &amp; highlights</span>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <Cloud size={13} style={{ color: "#aaa" }} />
          <div>
            <div style={{ fontWeight: 600, color: "#555", fontSize: 11.5 }}>Save locally</div>
            <div style={{ fontSize: 11, color: C.muted }}>Just now</div>
          </div>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#3d9e5f", marginLeft: 3 }} />
        </div>
      </div>
      {/* Title row */}
      <div style={{ padding: "8px 24px 14px" }}>
        <h1 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 32, fontWeight: 400, color: "#1a1a1a", letterSpacing: -0.3, margin: 0 }}>Notes &amp; highlights</h1>
      </div>
    </div>
  );
}

function NoteCard({ note, selected, onClick, onStar, onMenu }: {
  note: BookNote; selected: boolean; onClick: () => void; onStar: () => void; onMenu: (x: number, y: number) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "14px 16px",
        ...(selected
          ? { border: `2px solid ${C.green}`, borderRadius: 8, margin: "3px 4px", boxShadow: "0 2px 8px rgba(45,74,62,.12)" }
          : { borderBottom: `1px solid ${C.border}`, borderRadius: 0, margin: "0" }),
        background: selected ? "#f0f7f2" : hovered ? C.bg : C.white,
        cursor: "pointer", transition: "background .1s",
        display: "flex", gap: 11, position: "relative",
      }}
    >
      <MiniCover from={note.bookCoverFrom} to={note.bookCoverTo} size={34} coverUrl={note.bookCoverUrl} />
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Type icon + text */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 5, marginBottom: 5 }}>
          {note.type === "Quote"
            ? <span style={{ ...SERIF, fontSize: 18, color: C.green, lineHeight: 0.9, marginTop: 2, flexShrink: 0 }}>"</span>
            : <FileText size={13} style={{ color: C.green, flexShrink: 0, marginTop: 2 }} />}
          <p style={{ fontSize: 13, lineHeight: 1.45, color: C.text, margin: 0, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as "vertical" }}>
            {note.text}
          </p>
        </div>
        {/* Book info */}
        <div style={{ fontSize: 11.5, fontWeight: 600, color: "#555", marginBottom: 2 }}>{note.bookTitle}</div>
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 7 }}>
          {note.page ? `p. ${note.page}` : ""}
          {note.page && note.createdAt ? " · " : ""}
          {note.createdAt}
        </div>
        {/* Mood pills */}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" as const, alignItems: "center" }}>
          {note.moods.map(m => <MoodPill key={m} mood={m} />)}
          <button onClick={e => e.stopPropagation()} style={{ padding: "2px 7px", borderRadius: 20, border: `1px dashed ${C.border}`, background: "transparent", fontSize: 10.5, color: C.muted, cursor: "pointer" }}>+ Add mood</button>
        </div>
      </div>
      {/* Star + three-dot */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
        <button onClick={e => { e.stopPropagation(); onMenu(e.clientX, e.clientY); }}
          style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, opacity: hovered ? 1 : 0, transition: "opacity .15s", padding: 2 }}>
          <MoreHorizontal size={15} />
        </button>
        <button onClick={e => { e.stopPropagation(); onStar(); }}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
          <Star size={14} fill={note.favorite ? "#e8a44a" : "none"} stroke={note.favorite ? "#e8a44a" : "#ccc"} />
        </button>
      </div>
    </div>
  );
}

function MoodDropdown({ moodCounts, active, onSelect, onClear, onClose }: {
  moodCounts: Record<string, number>; active: string | null;
  onSelect: (m: string) => void; onClear: () => void; onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);

  return (
    <div ref={ref} style={{ position: "absolute", top: 120, left: 280, background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, boxShadow: "0 4px 24px rgba(0,0,0,.13)", zIndex: 400, minWidth: 200, padding: "10px 0", overflow: "hidden" }}>
      <div style={{ padding: "2px 14px 8px", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: C.muted }}>Filter by mood</div>
      {Object.entries(moodCounts).sort((a, b) => b[1] - a[1]).map(([mood, count]) => (
        <button key={mood} onClick={() => onSelect(mood)}
          style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "7px 16px", background: active === mood ? moodColor(mood) + "18" : "transparent", border: "none", cursor: "pointer", fontSize: 13, color: C.text }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: moodColor(mood), display: "inline-block" }} />
          <span style={{ flex: 1, textAlign: "left" }}>{mood}</span>
          <span style={{ fontWeight: 600, color: C.muted }}>{count}</span>
        </button>
      ))}
      <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 4 }}>
        <button onClick={onClear} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 16px", background: "transparent", border: "none", cursor: "pointer", fontSize: 13, color: "#c0392b" }}>
          <Trash2 size={13} /> Clear filter
        </button>
      </div>
    </div>
  );
}

function CopyToast({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, background: C.green, color: "#fff", borderRadius: 10, padding: "12px 18px", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 4px 20px rgba(0,0,0,.2)", zIndex: 900, fontSize: 13.5, fontWeight: 500 }}>
      <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CheckCircle2 size={14} />
      </div>
      <div>
        <div style={{ fontWeight: 700 }}>Quote copied</div>
        <div style={{ fontSize: 11.5, opacity: 0.85 }}>Ready to paste anywhere</div>
      </div>
    </div>
  );
}
