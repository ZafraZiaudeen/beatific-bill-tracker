import { Target, Sparkles } from "lucide-react";

export function Goals() {
  return (
    <main className="dot-grid min-w-0 flex-1 px-5 py-8 sm:px-8">
      {/* Header */}
      <header className="mb-6 flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-mint/40">
          <Target className="h-7 w-7 text-mint-deep" strokeWidth={1.6} />
        </div>
        <div>
          <h2 className="font-script text-5xl sm:text-6xl">Goals</h2>
          <p className="mt-1 font-hand text-sm text-ink-soft">Your financial dreams &amp; milestones</p>
        </div>
      </header>

      <div className="paper-card flex flex-col items-center rounded-3xl bg-white/85 px-8 py-14 text-center">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-mint/25">
          <Sparkles className="h-10 w-10 text-mint-deep" strokeWidth={1.4} />
        </div>
        <p className="mb-2 font-script text-4xl text-ink">✦ Coming Soon</p>
        <p className="mb-6 max-w-sm font-hand text-sm text-ink-soft leading-relaxed">
          Set savings goals, track milestones, and celebrate your financial wins.
          This feature is in the works — beautiful things take time!
        </p>
        <div className="rounded-2xl bg-mint/15 px-6 py-3">
          <p className="font-hand text-sm italic text-mint-deep">
            "A goal without a plan is just a wish." — Antoine de Saint-Exupéry
          </p>
        </div>
      </div>
    </main>
  );
}
