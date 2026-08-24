export type NoteType = "journal" | "reminder" | "dreams" | "affirmation";

export interface Note {
  id: string;
  type: NoteType;
  title: string;
  content: string;
  date: string;       // YYYY-MM-DD creation date
  updatedAt?: string; // YYYY-MM-DD last edited
}
