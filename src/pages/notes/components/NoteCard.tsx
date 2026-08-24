import { useRef, useState } from "react"
import { format, parseISO } from "date-fns"
import { Bell, Heart, MoreVertical, Pencil, Star, Trash2 } from "lucide-react"
import type { Note, NoteType } from "@/types/note"
import { Washi } from "@/components/common/Washi"

import sprig from "@/assets/doodle-sprig.png"
import flowerImg from "@/assets/doodle-sprig.png"

const TYPE_CFG: Record<
  NoteType,
  {
    icon: React.ElementType
    iconCls: string
    bulletCls: string
    bulletChar: string
    titleSuffix: string
  }
> = {
  journal: {
    icon: Heart,
    iconCls: "text-lilac-deep",
    bulletCls: "",
    bulletChar: "",
    titleSuffix: " ♡",
  },
  reminder: {
    icon: Bell,
    iconCls: "text-blush-deep",
    bulletCls: "text-blush-deep",
    bulletChar: "●",
    titleSuffix: " ♡",
  },
  dreams: {
    icon: Star,
    iconCls: "text-mint-deep",
    bulletCls: "text-mint-deep",
    bulletChar: "●",
    titleSuffix: " ☆",
  },
  affirmation: {
    icon: Heart,
    iconCls: "text-lilac-deep/70",
    bulletCls: "text-lilac-deep/80",
    bulletChar: "♡",
    titleSuffix: " ♡",
  },
}

interface Props {
  note: Note
  onEdit: (note: Note) => void
  onDelete: (note: Note) => void
}

export function NoteCard({ note, onEdit, onDelete }: Props) {
  const cfg = TYPE_CFG[note.type]
  const Icon = cfg.icon
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const lines = note.content.split("\n").filter(Boolean)

  return (
    <article className="notebook-paper-card relative pt-3">
      <Washi className="notebook-paper-tape top-0 left-1/2 z-20 h-8 w-28 -translate-x-1/2" />

      <div className="notebook-paper-sheet relative flex min-h-[13.5rem]">
        {/* Punched notebook holes */}
        <div className="notebook-paper-binding flex w-11 shrink-0 flex-col items-center justify-evenly py-7">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="notebook-paper-hole block h-3.5 w-3.5 rounded-full"
            />
          ))}
        </div>

        {/* Ruled paper body */}
        <div className="notebook-paper-body relative min-w-0 flex-1 pt-8 pr-5 pb-7 pl-2 sm:pr-6">
          {/* Header */}
          <div className="relative z-10 flex min-w-0 items-start gap-1">
            <div className="flex min-w-0 flex-1 items-center gap-1.5">
              <Icon
                className={`h-4 w-4 shrink-0 ${cfg.iconCls}`}
                strokeWidth={1.5}
              />
              <p className="truncate font-script text-lg leading-tight">
                {note.title}
                {cfg.titleSuffix}
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
                  if (!menuRef.current?.contains(e.relatedTarget as Node))
                    setMenuOpen(false)
                }}
                className="flex h-6 w-6 items-center justify-center rounded-lg hover:bg-ink/8"
                aria-label="Note options"
              >
                <MoreVertical
                  className="h-4 w-4 text-ink/40"
                  strokeWidth={1.8}
                />
              </button>
              {menuOpen && (
                <div className="absolute top-7 right-0 z-30 min-w-[110px] rounded-2xl border border-ink/10 bg-paper py-1 shadow-lg">
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      onEdit(note)
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 font-hand text-sm text-ink hover:bg-ink/5"
                  >
                    <Pencil
                      className="h-3.5 w-3.5 text-ink/50"
                      strokeWidth={1.6}
                    />{" "}
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      onDelete(note)
                    }}
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
            <p className="relative z-10 mt-2 line-clamp-6 font-hand text-sm leading-7 text-ink/80">
              {note.content}
            </p>
          ) : (
            <ul className="relative z-10 mt-2 space-y-0">
              {lines.slice(0, 6).map((line, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span
                    className={`mt-0.5 shrink-0 text-xs leading-none ${cfg.bulletCls}`}
                  >
                    {cfg.bulletChar}
                  </span>
                  <span className="font-hand text-sm leading-7 text-ink/80">
                    {line}
                  </span>
                </li>
              ))}
              {lines.length > 6 && (
                <li className="pl-4 font-hand text-xs text-ink-soft">
                  +{lines.length - 6} more…
                </li>
              )}
            </ul>
          )}

          {/* Decorative doodle */}
          <img
            src={note.type === "dreams" ? flowerImg : sprig}
            alt=""
            aria-hidden
            loading="lazy"
            className="pointer-events-none absolute right-3 bottom-3 z-0 h-12 w-12 object-contain opacity-40"
          />
        </div>
      </div>
    </article>
  )
}
