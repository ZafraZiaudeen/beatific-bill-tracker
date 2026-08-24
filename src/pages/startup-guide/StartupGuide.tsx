import { useState } from "react";
import { ArrowRight, ChevronRight, Heart } from "lucide-react";
import { useUIStore } from "@/stores/uiStore";
import type { Section } from "@/types/bill";
import { HeaderDatePicker } from "@/components/common/HeaderDatePicker";
import { Washi } from "@/components/common/Washi";

import flowerImg from "@/assets/doodle-flower.png";
import cloudImg from "@/assets/cloud (1).png";
import plantWatering from "@/assets/plant-watering.png";

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
    color: "bg-lilac-deep/60",
    checkColor: "bg-lilac-deep/60 border-lilac-deep/60",
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
          <HeaderDatePicker />
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
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_480px] lg:items-start">
        {/* LEFT — Notebook step card */}
        <div className="notebook-paper-card relative self-start pt-3">
          <Washi className="notebook-paper-tape absolute left-1/2 top-0 z-20 h-9 w-32 -translate-x-1/2 -rotate-2" />
          <div className="notebook-paper-sheet relative flex min-h-[27rem] overflow-hidden">
          {/* Punched notebook holes */}
          <div className="notebook-paper-binding flex w-11 shrink-0 flex-col items-center justify-evenly py-8 sm:w-12">
            {[0,1,2,3,4,5,6,7].map((i) => (
              <span key={i} className="notebook-paper-hole block h-3.5 w-3.5 rounded-full sm:h-4 sm:w-4" />
            ))}
          </div>

          {/* Ruled paper body */}
          <div className="notebook-paper-body relative min-w-0 flex-1 pb-7 pl-3 pr-5 pt-8 sm:pl-4 sm:pr-7">
            {/* Step card header */}
            <div className="relative z-10 mb-3 flex justify-center">
              <span className="rounded-full bg-lilac/35 px-5 py-1.5 font-script text-xl text-lilac-deep shadow-sm">Your first little steps ♡</span>
            </div>
            <div className="relative z-10 dashed-rule mb-2" />

            {/* Steps */}
            <div className="relative z-10 space-y-0">
              {STEPS.map((step, i) => (
                <div key={i}
                  className="group flex cursor-pointer items-start gap-3 rounded-xl border-b border-dashed border-ink/12 py-2.5 last:border-b-0 hover:bg-ink/[0.03] transition-colors"
                  onClick={() => setActiveSection(step.navigateTo)}
                >
                  {/* Number circle */}
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${step.color}`}>
                    <span className="font-hand text-sm font-bold text-white">{i + 1}</span>
                  </div>
                  {/* Text */}
                  <div className="min-w-0 flex-1">
                    <p className="font-script text-lg leading-snug">{step.title}</p>
                    <p className="font-hand text-xs text-ink-soft leading-snug">{step.description}</p>
                  </div>
                  {/* Nav arrow + Checkbox */}
                  <div className="mt-1 flex shrink-0 items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-ink/30 opacity-0 transition-opacity group-hover:opacity-100" strokeWidth={2} />
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleStep(i); }}
                      className="shrink-0"
                      aria-label={completed[i] ? "Mark incomplete" : "Mark complete"}
                    >
                      <span className={`block h-5 w-5 rounded-full border-2 transition-colors ${
                        completed[i] ? step.checkColor : "border-ink/30 bg-paper/80"
                      }`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* "Open next step" button */}
            <div className="relative z-10 mt-4 text-center">
              <button
                onClick={openNextStep}
                className="inline-flex items-center gap-2 rounded-full bg-lilac-deep/80 px-6 py-2.5 font-hand text-sm text-white hover:bg-lilac-deep"
              >
                Open next step <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>

            {/* Flower doodle */}
            <img src={flowerImg} alt="" aria-hidden loading="lazy"
              className="pointer-events-none absolute bottom-3 right-3 hidden h-14 w-14 object-contain opacity-35 sm:block" />
          </div>
          </div>
        </div>

        {/* RIGHT — Mint sticky note */}
        <div className="paper-card relative flex self-start flex-col overflow-hidden rounded-3xl bg-mint/15 px-6 py-5">
          {/* Washi tape top-center */}
          <div className="absolute left-1/2 top-0 h-4 w-20 -translate-x-1/2 rounded-b-sm bg-mint/60 opacity-80" />

          <div className="mt-2 flex flex-col items-start gap-3">
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
          <div className="mt-6 flex items-end justify-between gap-3 pt-4">
            <Heart className="h-6 w-6 text-blush-deep/40" strokeWidth={1.2} />
            <img
              src={plantWatering}
              alt=""
              aria-hidden
              loading="lazy"
              className="h-44 min-w-0 flex-[1.35] object-contain object-bottom opacity-75 sm:h-52 lg:h-64 xl:h-72"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
