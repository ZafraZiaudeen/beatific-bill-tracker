import { useState, useEffect, useRef } from "react";
import { Washi } from "@/components/common/Washi";
import { useSettingsStore } from "@/stores/settingsStore";

const SEEN_KEY = "pdj-onboarding-seen";

const STEPS = [
  {
    emoji: "✨",
    title: "Welcome to Pastel Dream Journal",
    body: "Your cosy bill tracker — pretty, simple, and always yours.",
  },
  {
    emoji: "💸",
    title: "Add your first bill",
    body: 'Tap "+ Add Bill", fill in the name, amount and due date. That\'s all it takes!',
  },
  {
    emoji: "📅",
    title: "Track on the Calendar",
    body: "Switch to Calendar in the sidebar to see every bill laid out by date at a glance.",
  },
  {
    emoji: "💰",
    title: "Set a Budget",
    body: "Head to Budget to set monthly spending limits per category and watch your progress.",
  },
  {
    emoji: "🌸",
    title: "You're all set!",
    body: "Your Dashboard shows totals, upcoming bills and savings. Enjoy your journal!",
  },
];

export function OnboardingModal() {
  const settings = useSettingsStore((s) => s.settings);
  const setSettings = useSettingsStore((s) => s.setSettings);

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  // Track the quickStartVisible value we've already processed to avoid re-opening
  // when *we* set it to true on mount (would otherwise double-fire the effect).
  const handledQsv = useRef(false);

  useEffect(() => {
    const seen = localStorage.getItem(SEEN_KEY);
    if (!seen) {
      // Fix legacy state: old dismiss() incorrectly set quickStartVisible: false
      setSettings((prev) => ({ ...prev, quickStartVisible: true }));
      handledQsv.current = true; // mark so the qsv effect below ignores this change
      setOpen(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-open when Settings explicitly re-enables Quick Start Guide
  useEffect(() => {
    if (handledQsv.current) { handledQsv.current = false; return; }
    if (settings.quickStartVisible && !localStorage.getItem(SEEN_KEY)) setOpen(true);
  }, [settings.quickStartVisible]);

  if (!open) return null;

  const isLast = step === STEPS.length - 1;
  const s = STEPS[step]!;

  function dismiss() {
    localStorage.setItem(SEEN_KEY, "1");
    setOpen(false);
  }

  function next() {
    if (isLast) { dismiss(); return; }
    setStep((n) => n + 1);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/20 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-sm overflow-visible rounded-3xl bg-paper shadow-2xl">

        {/* Hole-punch rings */}
        <div className="absolute -left-3 top-1/2 flex -translate-y-1/2 flex-col gap-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-3 w-3 rounded-full border-2 border-ink/20 bg-paper shadow-inner" />
          ))}
        </div>

        {/* Step content */}
        <div className="px-8 pb-6 pt-12 text-center">
          <div className="mb-4 text-5xl">{s.emoji}</div>
          <p className="mb-3 font-script text-2xl leading-snug">{s.title}</p>
          <p className="font-hand text-sm leading-relaxed text-ink-soft">{s.body}</p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 pb-5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step ? "w-5 bg-blush-deep" : "w-2 bg-ink/20"
              }`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 px-6 pb-7">
          <button
            onClick={dismiss}
            className="flex-1 rounded-2xl border border-ink/20 py-2.5 font-hand text-sm text-ink-soft transition-colors hover:bg-ink/5"
          >
            Don't show again
          </button>
          <button
            onClick={next}
            className="flex-1 rounded-2xl bg-blush py-2.5 font-hand text-sm text-blush-deep shadow-sm transition-colors hover:bg-blush/80"
          >
            {isLast ? "Get Started 🌸" : "Next →"}
          </button>
        </div>

        {/* Washi tape — rendered last so it paints on top of the card */}
        <Washi className="absolute -top-4 left-1/2 h-9 w-36 -translate-x-1/2 -rotate-1" />
      </div>
    </div>
  );
}
