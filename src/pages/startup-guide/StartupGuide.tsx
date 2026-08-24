import { useState } from "react";
import { format } from "date-fns";
import { ArrowRight, CalendarDays, ChevronDown, Heart } from "lucide-react";
import { useUIStore } from "@/stores/uiStore";
import type { Section } from "@/types/bill";

import sprig from "@/assets/doodle-sprig.png";
import flowerImg from "@/assets/doodle-flower.png";
import cloudImg from "@/assets/cloud (1).png";

const GUIDE_KEY = "pdj-guide-steps";

interface Step {
  title: string;
  description: string;
  color: string;
  checkColor: string;
  navigateTo: Section;
}

const STEPS: Step[] = [
  {
    title: "Add your first bill",
    description: "Start by adding a bill you pay regularly.",
    color: "bg-lilac-deep/70",
    checkColor: "bg-lilac-deep/70 border-lilac-deep/70",
    navigateTo: "Bills",
  },
  {
    title: "Add a variable expense",
    description: "Add something like groceries, dining out, or anything that changes.",
    color: "bg-lilac/80",
    checkColor: "bg-lilac/80 border-lilac/80",
    navigateTo: "Expenses",
  },
  {
    title: "Choose your categories",
    description: "Review and adjust categories to match your life.",
    color: "bg-mint-deep/70",
    checkColor: "bg-mint-deep/70 border-mint-deep/70",
    navigateTo: "Budget",
  },
  {
    title: "Set your monthly budget",
    description: "Plan your income and spending for the month ahead.",
    color: "bg-[#c5a44a]",
    checkColor: "bg-[#c5a44a] border-[#c5a44a]",
    navigateTo: "Income",
  },
  {
    title: "Review your dashboard",
    description: "Check your dashboard and celebrate this first step! ♡",
    color: "bg-blush-deep/70",
    checkColor: "bg-blush-deep/70 border-blush-deep/70",
    navigateTo: "Dashboard",
  },
];

function loadSteps(): boolean[] {
  try {
    const raw = localStorage.getItem(GUIDE_KEY);
    if (raw) return JSON.parse(raw) as boolean[];
  } catch { /* noop */ }
  return [false, false, false, false, false];
}

export function StartupGuide() {
  const setActiveSection = useUIStore((s) => s.setActiveSection);
  const now = new Date();

  const [completed, setCompleted] = useState<boolean[]>(loadSteps);

  function toggleStep(i: number) {
    const next = completed.map((v, idx) => (idx === i ? !v : v));
    setCompleted(next);
    try { localStorage.setItem(GUIDE_KEY, JSON.stringify(next)); } catch { /* noop */ }
  }

  function openNextStep() {
    const nextIdx = completed.findIndex((v) => !v);
    const target = nextIdx === -1 ? "Dashboard" : STEPS[nextIdx]!.navigateTo;
    setActiveSection(target);
  }

  return (
    <main className="dot-grid min-w-0 flex-1 px-5 py-8 sm:px-8">
      {/* Header */}
      <header className="mb-2 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-script text-4xl leading-tight sm:text-5xl">
            Start softly, Dreamer ✦
          </h2>
          <p className="mt-1 font-hand text-sm text-ink-soft">
            Let's set things up together, one little step at a time.
          </p>
        </div>
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

      {/* Welcome banner */}
      <div className="paper-card relative mb-6 mt-5 overflow-hidden rounded-[2rem] bg-blush/40 px-8 py-6">
        {/* Washi tape */}
        <div className="absolute left-6 top-0 h-5 w-20 rounded-b-sm bg-blush/70 opacity-80" />
        <Heart className="absolute left-7 top-5 h-4 w-4 text-blush-deep/60" strokeWidth={1.4} />

        <div className="flex items-center justify-between gap-6">
          <div className="min-w-0 pl-5">
            <p className="font-script text-2xl sm:text-3xl">Welcome to Pastel Dream Journal! ♡</p>
            <p className="mt-2 font-hand text-sm text-ink-soft leading-relaxed max-w-lg">
              This quick guide will help you set up your journal so you can start tracking,
              planning, and dreaming with ease.
            </p>
          </div>
          <img src={flowerImg} alt="" aria-hidden loading="lazy"
            className="hidden h-16 w-16 shrink-0 object-contain opacity-60 sm:block" />
        </div>
      </div>

      {/* Two-column */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px]">
        {/* LEFT — Notebook step card */}
        <div className="paper-card relative flex overflow-hidden rounded-3xl bg-white/85">
          {/* Spring holes */}
          <div className="flex shrink-0 flex-col items-center gap-3 bg-ink/4 px-2.5 py-6 pt-8">
            {[0,1,2,3,4,5,6,7].map((i) => (
              <span key={i} className="block h-2.5 w-2.5 rounded-full border border-ink/20 bg-paper" />
            ))}
          </div>

          {/* Body */}
          <div className="relative min-w-0 flex-1 px-6 py-5">
            {/* Step card header */}
            <div className="mb-3 inline-flex items-center rounded-full bg-lilac/40 px-4 py-1.5">
              <span className="font-script text-lg text-lilac-deep">Your first little steps ♡</span>
            </div>
            <div className="dashed-rule mb-4" />

            {/* Steps */}
            <div className="space-y-0">
              {STEPS.map((step, i) => (
                <div key={i} className="flex items-start gap-3 border-b border-ink/8 py-3 last:border-b-0">
                  {/* Number circle */}
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${step.color}`}>
                    <span className="font-hand text-sm font-bold text-white">{i + 1}</span>
                  </div>
                  {/* Text */}
                  <div className="min-w-0 flex-1">
                    <p className="font-script text-lg leading-snug">{step.title}</p>
                    <p className="font-hand text-xs text-ink-soft leading-snug">{step.description}</p>
                  </div>
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleStep(i)}
                    className="mt-1 shrink-0"
                    aria-label={completed[i] ? "Mark incomplete" : "Mark complete"}
                  >
                    <span className={`block h-5 w-5 rounded-full border-2 transition-colors ${
                      completed[i] ? step.checkColor : "border-ink/30 bg-white"
                    }`} />
                  </button>
                </div>
              ))}
            </div>

            {/* "Open next step" button */}
            <div className="mt-5 text-center">
              <button
                onClick={openNextStep}
                className="inline-flex items-center gap-2 rounded-full bg-lilac-deep/80 px-6 py-2.5 font-hand text-sm text-white hover:bg-lilac-deep"
              >
                Open next step <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>

            {/* Mint washi tape bottom-left */}
            <div className="absolute bottom-0 left-0 h-4 w-28 rounded-tr-sm bg-mint/50 opacity-70" />
            {/* Flower doodle */}
            <img src={flowerImg} alt="" aria-hidden loading="lazy"
              className="pointer-events-none absolute bottom-4 left-8 h-14 w-14 object-contain opacity-40" />
          </div>
        </div>

        {/* RIGHT — Mint sticky note */}
        <div className="paper-card relative overflow-hidden rounded-3xl bg-mint/15 px-6 py-7">
          {/* Washi tape top-center */}
          <div className="absolute left-1/2 top-0 h-4 w-20 -translate-x-1/2 rounded-b-sm bg-mint/60 opacity-80" />

          <div className="mt-4 flex flex-col items-start gap-3">
            <Heart className="h-6 w-6 text-mint-deep/60" strokeWidth={1.4} />
            <p className="font-script text-2xl text-mint-deep underline decoration-mint-deep/40 underline-offset-4">
              A gentle beginning ♡
            </p>
            <p className="font-hand text-sm leading-relaxed text-ink/75">
              Pastel Dream Journal lives right here in your browser. Your data is saved only on
              your device — private, personal, and always in your control.
            </p>
          </div>

          {/* Bottom decorations */}
          <div className="mt-8 flex items-end justify-between">
            <Heart className="h-6 w-6 text-blush-deep/40" strokeWidth={1.2} />
            <img src={sprig} alt="" aria-hidden loading="lazy"
              className="h-14 w-14 object-contain opacity-50" />
          </div>
        </div>
      </div>
    </main>
  );
}
