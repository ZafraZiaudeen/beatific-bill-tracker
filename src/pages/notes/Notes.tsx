import { useState } from "react";
import { format } from "date-fns";
import { CalendarDays, ChevronDown, Heart, Plus } from "lucide-react";
import { useNoteStore } from "@/stores/noteStore";
import type { Note } from "@/types/note";
import { NoteCard } from "@/pages/notes/components/NoteCard";
import { NoteDialog } from "@/pages/notes/components/NoteDialog";
import { DeleteNoteDialog } from "@/pages/notes/components/DeleteNoteDialog";

import sprig from "@/assets/doodle-sprig.png";
import vase from "@/assets/doodle-vase.png";
import cloudImg from "@/assets/cloud (1).png";
import flowerDoodle from "@/assets/doodle-sprig.png";

export function Notes() {
  const notes = useNoteStore((s) => s.notes);
  const now = new Date();

  const [addOpen, setAddOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | undefined>();
  const [deletingNote, setDeletingNote] = useState<Note | undefined>();

  function openEdit(note: Note) {
    setEditingNote(note);
    setAddOpen(true);
  }

  function closeDialog(o: boolean) {
    setAddOpen(o);
    if (!o) setEditingNote(undefined);
  }

  return (
    <main className="dot-grid min-w-0 flex-1 px-5 py-8 sm:px-8">
      {/* Header */}
      <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <h2 className="flex min-w-0 items-center gap-2 font-script text-4xl leading-none sm:gap-3 sm:text-[3.25rem]">
          Notes &amp; Journal ♡
          <img
            src={sprig}
            alt=""
            aria-hidden
            loading="lazy"
            className="h-10 w-10 shrink-0 object-contain sm:h-12 sm:w-12"
          />
        </h2>
        <div className="flex items-center gap-3">
          <div className="paper-card flex items-center gap-2 rounded-full bg-white/85 px-4 py-2.5 sm:px-5 sm:py-3">
            <CalendarDays className="h-5 w-5 shrink-0 text-lilac-deep" strokeWidth={1.6} />
            <span className="font-script text-lg sm:text-xl">{format(now, "MMMM d, yyyy")}</span>
            <ChevronDown className="h-4 w-4 text-ink-soft" strokeWidth={1.8} />
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-lilac shadow-sm">
            <img src={cloudImg} alt="" aria-hidden loading="lazy" className="h-8 w-8 object-contain opacity-80" />
          </div>
        </div>
      </header>

      {/* Tagline banner */}
      <div className="paper-card relative mb-6 overflow-hidden rounded-[2rem] bg-blush/40 px-7 py-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <Heart className="mt-0.5 h-5 w-5 shrink-0 text-blush-deep/60" strokeWidth={1.4} />
            <div className="min-w-0">
              <p className="font-script text-xl text-ink sm:text-2xl">
                Capture your thoughts, reflect on your journey, and stay inspired.
              </p>
              <p className="font-script text-xl text-ink sm:text-2xl">
                Every note you write brings you closer to your dreams.
              </p>
            </div>
          </div>
          <img
            src={flowerDoodle}
            alt=""
            aria-hidden
            loading="lazy"
            className="hidden shrink-0 h-14 w-14 object-contain opacity-60 sm:block"
          />
          <button
            onClick={() => { setEditingNote(undefined); setAddOpen(true); }}
            className="shrink-0 flex items-center gap-2 rounded-full bg-lilac-deep/80 px-5 py-2.5 font-hand text-sm text-white hover:bg-lilac-deep shadow-sm"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            Add Note
          </button>
        </div>
      </div>

      {/* Notes grid */}
      {notes.length === 0 ? (
        <div className="paper-card flex flex-col items-center justify-center rounded-3xl bg-white/85 py-16 text-center">
          <Heart className="mb-3 h-10 w-10 text-lilac/60" strokeWidth={1.2} />
          <p className="font-script text-2xl text-ink/50">No notes yet ♡</p>
          <p className="mt-1 font-hand text-sm text-ink-soft">Click "+ Add Note" to capture your first thought.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={openEdit}
              onDelete={(n) => setDeletingNote(n)}
            />
          ))}
        </div>
      )}

      {/* Footer quote banner */}
      <footer className="paper-card relative mt-6 overflow-hidden rounded-[1.6rem] bg-blush/50 px-6 py-4 sm:px-8 sm:py-5">
        <div className="relative z-10 flex items-center gap-2 pr-20 sm:gap-4 sm:pr-44">
          <span className="font-script text-5xl leading-none text-blush-deep/70 sm:text-6xl">"</span>
          <p className="font-script text-lg leading-snug sm:text-xl">
            Dream big, plan well, and take action. Your future self will thank you.
          </p>
          <Heart className="h-5 w-5 shrink-0 -rotate-12 text-blush-deep/60" strokeWidth={1.4} />
        </div>
        <img
          src={vase}
          alt=""
          aria-hidden
          loading="lazy"
          className="absolute bottom-0 right-4 h-24 w-auto object-contain sm:right-8 sm:h-28"
        />
      </footer>

      <NoteDialog
        open={addOpen}
        onOpenChange={closeDialog}
        note={editingNote}
        onDeleteRequest={(n) => { setDeletingNote(n); }}
      />

      {deletingNote && (
        <DeleteNoteDialog
          open={!!deletingNote}
          onOpenChange={(o) => { if (!o) setDeletingNote(undefined); }}
          noteId={deletingNote.id}
          noteTitle={deletingNote.title}
        />
      )}
    </main>
  );
}
