import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Heart, Bell, Star, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNoteStore } from "@/stores/noteStore";
import type { Note, NoteType } from "@/types/note";

import sprig from "@/assets/doodle-sprig.png";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  note?: Note;
  onDeleteRequest?: (note: Note) => void;
}

const TYPE_OPTIONS: {
  key: NoteType;
  label: string;
  icon: React.ElementType;
  marker: string;
  activeCls: string;
}[] = [
  { key: "journal",     label: "Journal Entry",  icon: Heart,  marker: "♡", activeCls: "bg-lilac/30 border-lilac-deep/40 text-lilac-deep" },
  { key: "reminder",    label: "Reminder",        icon: Bell,   marker: "●", activeCls: "bg-blush/30 border-blush-deep/40 text-blush-deep" },
  { key: "dreams",      label: "Dreams & Goals",  icon: Star,   marker: "☆", activeCls: "bg-mint/30 border-mint-deep/40 text-mint-deep"   },
  { key: "affirmation", label: "Affirmation",     icon: Heart,  marker: "♡", activeCls: "bg-lilac/20 border-lilac/60 text-lilac-deep/80"  },
];

const EMPTY = { type: "journal" as NoteType, title: "", content: "" };

const inputClass =
  "w-full rounded-2xl border border-ink/15 bg-white/70 px-4 py-2.5 font-hand text-sm text-ink outline-none focus:border-lilac-deep/40";
const labelClass = "font-hand text-[0.65rem] uppercase tracking-widest text-ink-soft mb-1.5 block";

export function NoteDialog({ open, onOpenChange, note, onDeleteRequest }: Props) {
  const addNote = useNoteStore((s) => s.addNote);
  const updateNote = useNoteStore((s) => s.updateNote);

  const [form, setForm] = useState(EMPTY);
  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    if (open) {
      if (note) {
        setForm({ type: note.type, title: note.title, content: note.content });
      } else {
        setForm(EMPTY);
      }
    }
  }, [open, note]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    if (note) {
      updateNote(note.id, { type: form.type, title: form.title.trim(), content: form.content.trim(), updatedAt: today });
    } else {
      addNote({
        id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: form.type,
        title: form.title.trim(),
        content: form.content.trim(),
        date: today,
      });
    }
    onOpenChange(false);
  }

  const isEdit = !!note;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl border-0 bg-paper p-0 shadow-xl overflow-hidden flex">
        {/* Spring binding holes */}
        <div className="flex shrink-0 flex-col items-center justify-start gap-3 bg-ink/4 px-2.5 py-6 pt-10">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <span key={i} className="block h-2.5 w-2.5 rounded-full border border-ink/20 bg-paper" />
          ))}
        </div>

        {/* Content */}
        <div className="relative min-w-0 flex-1 px-6 py-5">
          {/* Washi tape */}
          <div className="absolute left-4 top-0 h-4 w-24 rounded-b-sm bg-blush/60 opacity-80" />

          <DialogHeader className="mt-3 mb-4">
            <div className="flex items-start justify-between gap-2">
              <DialogTitle className="font-script text-2xl text-ink">
                {isEdit ? "✧ Edit Note" : "✧ Add a Note"}
              </DialogTitle>
              {isEdit && note.updatedAt && (
                <span className="mt-1 shrink-0 font-hand text-[0.6rem] text-ink-soft">
                  last edited {format(new Date(note.updatedAt), "MMM d, yyyy")}
                </span>
              )}
              <img src={sprig} alt="" aria-hidden loading="lazy"
                className="h-10 w-10 shrink-0 object-contain opacity-70" />
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Note type pills */}
            <div>
              <span className={labelClass}>Note type</span>
              <div className="flex flex-wrap gap-2">
                {TYPE_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const active = form.type === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, type: opt.key }))}
                      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-hand text-xs transition-colors ${
                        active
                          ? `${opt.activeCls} font-bold`
                          : "border-ink/15 bg-white/60 text-ink-soft hover:bg-white"
                      }`}
                    >
                      <Icon className="h-3 w-3" strokeWidth={1.6} />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className={labelClass.replace("mb-1.5 block", "")}>Title</span>
                <span className="font-hand text-[0.6rem] text-ink-soft">{format(new Date(), "MMM d, yyyy")}</span>
              </div>
              <input
                type="text"
                required
                placeholder="Give your note a title…"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className={inputClass}
              />
            </div>

            {/* Content */}
            <div className="relative">
              <span className={labelClass}>What's on your heart?</span>
              <textarea
                required
                rows={5}
                placeholder={
                  form.type === "journal"
                    ? "Write freely…"
                    : "One item per line…"
                }
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                className={`${inputClass} resize-none`}
              />
              <Pencil className="pointer-events-none absolute bottom-3 right-3 h-5 w-5 text-ink/20" strokeWidth={1.4} />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 rounded-full bg-lilac-deep/80 py-2.5 font-hand text-sm text-white hover:bg-lilac-deep"
              >
                {isEdit ? "Save Changes ♡" : "Save Note ♡"}
              </button>
              {isEdit && onDeleteRequest && (
                <button
                  type="button"
                  onClick={() => { onOpenChange(false); onDeleteRequest(note!); }}
                  className="rounded-full px-4 py-2.5 font-hand text-sm text-blush-deep hover:bg-blush/20"
                >
                  Delete Note
                </button>
              )}
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex-1 rounded-full border border-ink/15 bg-white/60 py-2.5 font-hand text-sm text-ink-soft hover:bg-white"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
