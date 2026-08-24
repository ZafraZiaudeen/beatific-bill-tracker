import { Heart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNoteStore } from "@/stores/noteStore";

import sprig from "@/assets/doodle-sprig.png";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  noteId: string;
  noteTitle: string;
}

export function DeleteNoteDialog({ open, onOpenChange, noteId, noteTitle }: Props) {
  const deleteNote = useNoteStore((s) => s.deleteNote);

  function handleDelete() {
    deleteNote(noteId);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs rounded-3xl border-0 bg-paper p-6 shadow-xl text-center">
        <DialogHeader className="items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blush/40 mx-auto mb-1">
            <Heart className="h-6 w-6 text-blush-deep/70" strokeWidth={1.4} />
          </div>
          <DialogTitle className="font-script text-2xl text-ink">
            Delete this note?
          </DialogTitle>
        </DialogHeader>
        <p className="mt-2 font-hand text-sm text-ink-soft leading-relaxed">
          This will remove '{noteTitle}' from your journal.
        </p>
        <img
          src={sprig}
          alt=""
          aria-hidden
          loading="lazy"
          className="mx-auto my-3 h-14 w-14 object-contain opacity-60"
        />
        <div className="flex gap-3 mt-1">
          <button
            onClick={() => onOpenChange(false)}
            className="flex-1 rounded-full bg-lilac-deep/80 py-2.5 font-hand text-sm text-white hover:bg-lilac-deep"
          >
            Keep Note
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 rounded-full border border-ink/15 bg-white/60 py-2.5 font-hand text-sm text-ink-soft hover:bg-white"
          >
            Delete Note
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
