import { useState } from "react";
import { format, startOfMonth, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, NotebookPen } from "lucide-react";

export function Notes() {
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(new Date()));

  const monthKey = format(viewMonth, "yyyy-MM");
  const monthLabel = format(viewMonth, "MMMM yyyy");
  const lsKey = `pdj-notes-${monthKey}`;

  const [text, setText] = useState(() => localStorage.getItem(lsKey) ?? "");

  function handleChange(val: string) {
    setText(val);
    localStorage.setItem(lsKey, val);
  }

  function changeMonth(dir: 1 | -1) {
    const next = dir === 1 ? addMonths(viewMonth, 1) : subMonths(viewMonth, 1);
    const nextStart = startOfMonth(next);
    setViewMonth(nextStart);
    const key = `pdj-notes-${format(nextStart, "yyyy-MM")}`;
    setText(localStorage.getItem(key) ?? "");
  }

  return (
    <main className="dot-grid min-w-0 flex-1 px-5 py-8 sm:px-8">
      {/* Header */}
      <header className="mb-6 flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-butter/40">
          <NotebookPen className="h-7 w-7 text-[oklch(0.62_0.1_80)]" strokeWidth={1.6} />
        </div>
        <div>
          <h2 className="font-script text-5xl sm:text-6xl">Notes ♡</h2>
          <p className="mt-1 font-hand text-sm text-ink-soft">Your monthly journal &amp; thoughts</p>
        </div>
      </header>

      {/* Month nav */}
      <div className="mb-5 flex items-center gap-3">
        <button
          onClick={() => changeMonth(-1)}
          className="rounded-full border border-ink/15 bg-white/60 p-1.5 hover:bg-white/80"
        >
          <ChevronLeft className="h-4 w-4 text-ink-soft" strokeWidth={2} />
        </button>
        <span className="min-w-[130px] text-center font-hand text-sm font-bold text-ink">{monthLabel}</span>
        <button
          onClick={() => changeMonth(1)}
          className="rounded-full border border-ink/15 bg-white/60 p-1.5 hover:bg-white/80"
        >
          <ChevronRight className="h-4 w-4 text-ink-soft" strokeWidth={2} />
        </button>
      </div>

      {/* Notes card */}
      <div className="paper-card rounded-3xl bg-white/85 p-6 sm:p-8">
        <p className="mb-6 font-hand text-xs uppercase tracking-widest text-ink-soft">
          {format(viewMonth, "MMMM yyyy")} Journal
        </p>
        <textarea
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={`Write your thoughts for ${monthLabel}...\n\nReflect on your spending, set intentions, or just journal freely.`}
          className="min-h-[480px] w-full resize-none rounded-2xl border-0 bg-transparent font-hand text-sm text-ink outline-none placeholder:text-ink/25 leading-[2rem]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(transparent, transparent 30px, oklch(0.75 0.01 240 / 0.2) 30px, oklch(0.75 0.01 240 / 0.2) 31px)",
            lineHeight: "2rem",
          }}
          autoFocus
        />
        <p className="mt-3 font-hand text-[0.65rem] text-ink/30 text-right">
          {text.length} characters · auto-saved
        </p>
      </div>
    </main>
  );
}
