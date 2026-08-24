import { useRef, useState } from "react";
import { format, parseISO } from "date-fns";
import { Bell, Heart, MoreVertical, Pencil, Star, Trash2 } from "lucide-react";
import type { Note, NoteType } from "@/types/note";

import sprig from "@/assets/doodle-sprig.png";
import flowerImg from "@/assets/doodle-sprig.png";

const TYPE_CFG: Record<
  NoteType,
  {
    washi: string;
    icon: React.ElementType;
    iconCls: string;
    bulletCls: string;
    bulletChar: string;
    titleSuffix: string;
  }
> = {
  journal: {
    washi: "bg-lilac/60",
    icon: Heart,
    iconCls: "text-lilac-deep",
    bulletCls: "",
    bulletChar: "",
    titleSuffix: " ♡",
  },
  reminder: {
    washi: "bg-blush/60",
    icon: Bell,
    iconCls: "text-blush-deep",
    bulletCls: "text-blush-deep",
    bulletChar: "●",
    titleSuffix: " ♡",
  },
  dreams: {
    washi: "bg-mint/60",
    icon: Star,
    iconCls: "text-mint-deep",
    bulletCls: "text-mint-deep",
    bulletChar: "●",
    titleSuffix: " ☆",
  },
  affirmation: {
    washi: "bg-lilac/40",
    icon: Heart,
    iconCls: "text-lilac-deep/70",
    bulletCls: "text-lilac-deep/80",
    bulletChar: "♡",
    titleSuffix: " ♡",
  },
};

interface Props {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
}

export function NoteCard({ note, onEdit, onDelete }: Props) {
  const cfg = TYPE_CFG[note.type];
  const Icon = cfg.icon;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const lines = note.content.split("\n").filter(Boolean);

  return (
    <article className="paper-card relative flex overflow-hidden rounded-3xl bg-white/85">
      {/* Spring binding holes */}
      <div className="flex shrink-0 flex-col items-center gap-3 px-2.5 pt-8 pb-4">
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className="block h-2 w-2 rounded-full bg-ink/15" />
        ))}
      </div>

      {/* Body */}
      <div className="relative min-w-0 flex-1 px-4 pt-4 pb-5">
        {/* Washi tape */}
        <div className={`absolute left-0 top-0 h-4 w-24 rounded-b-sm ${cfg.washi} opacity-80`} />

        {/* Header */}
        <div className="mt-3 flex items-start gap-1 min-w-0">
          <div className="flex min-w-0 flex-1 items-center gap-1.5">
            <Icon className={`h-4 w-4 shrink-0 ${cfg.iconCls}`} strokeWidth={1.5} />
            <p className="font-script text-lg leading-tight truncate">
              {note.title}{cfg.titleSuffix}
            </p>
          </div>
          {note.type === "journal" && (
            <span className="ml-1 shrink-0 font-hand text-[0.55rem] text-ink-soft">
              {format(parseISO(note.date), "MMM d, yyyy")}
            </span>
          )}
          {/* ⋮ menu */}
          <div className="relative ml-1 shrink-0" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              onBlur={(e) => {
                if (!menuRef.current?.contains(e.relatedTarget as Node)) setMenuOpen(false);
              }}
              className="flex h-6 w-6 items-center justify-center rounded-lg hover:bg-ink/8"
              aria-label="Note options"
            >
              <MoreVertical className="h-4 w-4 text-ink/40" strokeWidth={1.8} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-7 z-20 min-w-[110px] rounded-2xl border border-ink/10 bg-paper shadow-lg py-1">
                <button
                  onClick={() => { setMenuOpen(false); onEdit(note); }}
                  className="flex w-full items-center gap-2 px-3 py-2 font-hand text-sm text-ink hover:bg-ink/5"
                >
                  <Pencil className="h-3.5 w-3.5 text-ink/50" strokeWidth={1.6} /> Edit
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onDelete(note); }}
                  className="flex w-full items-center gap-2 px-3 py-2 font-hand text-sm text-blush-deep hover:bg-blush/10"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.6} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {note.type === "journal" ? (
          <p className="mt-2 font-hand text-sm leading-relaxed text-ink/80 line-clamp-6">
            {note.content}
          </p>
        ) : (
          <ul className="mt-2 space-y-1">
            {lines.slice(0, 6).map((line, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className={`mt-0.5 shrink-0 text-xs leading-none ${cfg.bulletCls}`}>
                  {cfg.bulletChar}
                </span>
                <span className="font-hand text-sm text-ink/80 leading-snug">{line}</span>
              </li>
            ))}
            {lines.length > 6 && (
              <li className="font-hand text-xs text-ink-soft pl-4">+{lines.length - 6} more…</li>
            )}
          </ul>
        )}

        {/* Decorative doodle */}
        <img
          src={note.type === "dreams" ? flowerImg : sprig}
          alt=""
          aria-hidden
          loading="lazy"
          className="pointer-events-none absolute bottom-2 right-2 h-10 w-10 object-contain opacity-40"
        />
      </div>
    </article>
  );
}
