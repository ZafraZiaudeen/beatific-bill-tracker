import { useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarDays, ChevronDown, Heart, Plus } from "lucide-react";
import { useGoalStore } from "@/stores/goalStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { fmtCurrency } from "@/lib/billUtils";
import type { Goal } from "@/types/goal";
import { GoalCard } from "@/pages/goals/components/GoalCard";
import { GoalDialog } from "@/pages/goals/components/GoalDialog";
import { DeleteGoalDialog } from "@/pages/goals/components/DeleteGoalDialog";

import sprig from "@/assets/doodle-sprig.png";
import vase from "@/assets/doodle-vase.png";
import flowerImg from "@/assets/doodle-flower.png";
import cloudImg from "@/assets/cloud (1).png";

const REFLECTION_KEY = "pdj-goals-reflection";

export function Goals() {
  const goals    = useGoalStore((s) => s.goals);
  const settings = useSettingsStore((s) => s.settings);
  const now      = new Date();
  const fmt = (n: number) => fmtCurrency(n, settings.currency, settings.currencyPosition as "before" | "after");

  const [addOpen,     setAddOpen]     = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>();
  const [deletingGoal, setDeletingGoal] = useState<Goal | undefined>();
  const [reflection, setReflection]   = useState<string>(() => {
    try { return localStorage.getItem(REFLECTION_KEY) ?? ""; } catch { return ""; }
  });

  function closeDialog(o: boolean) {
    setAddOpen(o);
    if (!o) setEditingGoal(undefined);
  }

  function handleReflection(v: string) {
    setReflection(v);
    try { localStorage.setItem(REFLECTION_KEY, v); } catch { /* noop */ }
  }

  const { totalSaved, monthlyTotal, activeCount } = useMemo(() => ({
    totalSaved:   goals.reduce((s, g) => s + g.saved, 0),
    monthlyTotal: goals.reduce((s, g) => s + g.monthlyContribution, 0),
    activeCount:  goals.filter((g) => g.saved < g.target).length,
  }), [goals]);

  return (
    <main className="dot-grid min-w-0 flex-1 px-5 py-8 sm:px-8">
      {/* Header */}
      <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <h2 className="flex min-w-0 items-center gap-2 font-script text-4xl leading-none sm:gap-3 sm:text-[3.25rem]">
          Financial Goals ✦
          <img src={sprig} alt="" aria-hidden loading="lazy"
            className="h-10 w-10 shrink-0 object-contain sm:h-12 sm:w-12" />
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
      <div className="paper-card relative mb-6 overflow-hidden rounded-[2rem] bg-blush/40">
        {/* Washi tape */}
        <div className="absolute left-5 top-0 h-5 w-20 rounded-b-sm bg-blush/70 opacity-80" />
        <Heart className="absolute left-6 top-5 h-4 w-4 text-blush-deep/60" strokeWidth={1.4} />

        <div className="flex flex-col gap-4 px-7 pb-5 pt-6 sm:flex-row sm:items-center">
          {/* Left text */}
          <div className="min-w-0 flex-1 pl-6">
            <p className="font-script text-xl sm:text-2xl">Goals Today, Freedom Tomorrow</p>
            <p className="mt-1 font-hand text-sm text-ink-soft leading-relaxed">
              Stay focused on what matters most. Small, consistent actions lead to big, beautiful outcomes.
            </p>
          </div>

          {/* Stats */}
          <div className="flex shrink-0 divide-x divide-ink/15">
            <div className="px-5 text-center">
              <p className="font-hand text-[0.6rem] uppercase tracking-widest text-ink-soft">Total Saved</p>
              <p className="font-sans text-lg font-extrabold text-mint-deep">{fmt(totalSaved)}</p>
              <div className="dashed-rule mt-0.5" />
            </div>
            <div className="px-5 text-center">
              <p className="font-hand text-[0.6rem] uppercase tracking-widest text-ink-soft">Monthly Savings</p>
              <p className="font-sans text-lg font-extrabold text-lilac-deep">{fmt(monthlyTotal)}</p>
              <div className="dashed-rule mt-0.5" />
            </div>
            <div className="px-5 text-center">
              <p className="font-hand text-[0.6rem] uppercase tracking-widest text-ink-soft">Active Goals</p>
              <p className="font-sans text-lg font-extrabold text-blush-deep">{activeCount}</p>
              <div className="dashed-rule mt-0.5" />
            </div>
          </div>

          {/* Sprig doodle */}
          <img src={sprig} alt="" aria-hidden loading="lazy"
            className="hidden h-14 w-14 shrink-0 object-contain opacity-60 xl:block" />
        </div>
      </div>

      {/* Section heading row */}
      <div className="mb-4 flex items-center gap-3">
        <Heart className="h-5 w-5 shrink-0 text-lilac-deep/70" strokeWidth={1.4} />
        <p className="shrink-0 font-script text-2xl">My Savings Goals</p>
        {/* Dashed fill line */}
        <div className="min-w-0 flex-1 border-t border-dashed border-ink/25" />
        <button
          onClick={() => { setEditingGoal(undefined); setAddOpen(true); }}
          className="shrink-0 flex items-center gap-1.5 rounded-full border border-lilac-deep/40 bg-lilac/20 px-4 py-2 font-hand text-sm text-lilac-deep hover:bg-lilac/40"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.2} /> Add Goal
        </button>
      </div>

      {/* Goal cards */}
      {goals.length === 0 ? (
        <div className="paper-card flex flex-col items-center justify-center rounded-3xl bg-white/85 py-14 text-center">
          <Heart className="mb-3 h-10 w-10 text-lilac/50" strokeWidth={1.2} />
          <p className="font-script text-2xl text-ink/50">No goals yet ♡</p>
          <p className="mt-1 font-hand text-sm text-ink-soft">Click "+ Add Goal" to set your first savings target.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={(g) => { setEditingGoal(g); setAddOpen(true); }}
              onDelete={(g) => setDeletingGoal(g)}
            />
          ))}
        </div>
      )}

      {/* Reflection section */}
      <div className="paper-card relative mt-6 overflow-hidden rounded-3xl bg-white/85 px-6 py-5">
        {/* Doodle decorations */}
        <img src={flowerImg} alt="" aria-hidden loading="lazy"
          className="pointer-events-none absolute bottom-3 left-4 h-16 w-16 object-contain opacity-40" />
        <img src={vase} alt="" aria-hidden loading="lazy"
          className="pointer-events-none absolute bottom-0 right-6 h-20 w-auto object-contain opacity-40" />
        <Heart className="absolute right-28 top-4 h-5 w-5 text-lilac/50" strokeWidth={1.2} />
        <Heart className="absolute right-20 top-8 h-3 w-3 text-blush/50" strokeWidth={1.2} />

        <div className="flex items-center gap-3 mb-3">
          <span className="rounded-full bg-lilac/40 px-4 py-1.5 font-script text-base text-lilac-deep">
            Reflection ♡
          </span>
          <p className="font-hand text-sm text-ink-soft">Why are these goals important to you?</p>
        </div>
        <div className="dashed-rule mb-3" />
        <textarea
          rows={4}
          placeholder="Write your thoughts here…"
          value={reflection}
          onChange={(e) => handleReflection(e.target.value)}
          className="w-full resize-none rounded-2xl border border-dashed border-ink/20 bg-transparent px-4 py-3 font-hand text-sm text-ink outline-none placeholder:text-ink/30 focus:border-lilac/60"
          style={{ minHeight: "7rem" }}
        />
      </div>

      {/* Footer quote */}
      <footer className="paper-card relative mt-6 overflow-hidden rounded-[1.6rem] bg-blush/50 px-6 py-4 sm:px-8 sm:py-5">
        <div className="relative z-10 flex items-center gap-2 pr-20 sm:gap-4 sm:pr-44">
          <span className="font-script text-5xl leading-none text-blush-deep/70 sm:text-6xl">"</span>
          <p className="font-script text-lg leading-snug sm:text-xl">
            A goal without a plan is just a wish. Start planning today.
          </p>
          <Heart className="h-5 w-5 shrink-0 -rotate-12 text-blush-deep/60" strokeWidth={1.4} />
        </div>
        <img src={vase} alt="" aria-hidden loading="lazy"
          className="absolute bottom-0 right-4 h-24 w-auto object-contain sm:right-8 sm:h-28" />
      </footer>

      <GoalDialog
        open={addOpen}
        onOpenChange={closeDialog}
        goal={editingGoal}
        onDeleteRequest={(g) => setDeletingGoal(g)}
      />

      {deletingGoal && (
        <DeleteGoalDialog
          open={!!deletingGoal}
          onOpenChange={(o) => { if (!o) setDeletingGoal(undefined); }}
          goalId={deletingGoal.id}
          goalTitle={deletingGoal.title}
        />
      )}
    </main>
  );
}
