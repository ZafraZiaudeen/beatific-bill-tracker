import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart2,
  BookOpen,
  Clock3,
  Library,
  LockKeyhole,
  Moon,
  NotebookPen,
} from "lucide-react";

type Destination = "overview" | "library" | "log";

interface BookTrackerOnboardingProps {
  initialName?: string;
  onComplete: (name: string, destination: Destination) => string | null;
}

const STEPS = [
  {
    eyebrow: "Welcome",
    title: "Build a reading life you can see.",
    body: "Book Tracker keeps your library, sessions, notes, wishlist, and reading progress together — privately on this device.",
    Icon: BookOpen,
  },
  {
    eyebrow: "Your library",
    title: "Give every book a place.",
    body: "Add books you own or want to read, update their status, and keep page progress and ratings close at hand.",
    Icon: Library,
  },
  {
    eyebrow: "Reading rhythm",
    title: "Turn reading time into momentum.",
    body: "Log a timed session or enter one later. Your dashboard turns those sessions into streaks, pages, and useful insights.",
    Icon: Clock3,
  },
  {
    eyebrow: "Ready when you are",
    title: "Your next chapter starts here.",
    body: "Capture notes as you read, review your patterns, and switch between the warm light theme and focused dark mode anytime.",
    Icon: NotebookPen,
  },
] as const;

const featureItems = [
  { Icon: NotebookPen, title: "Remember the good parts", text: "Save quotes, thoughts, and page references." },
  { Icon: BarChart2, title: "See your progress", text: "Track goals, streaks, genres, and reading pace." },
  { Icon: Moon, title: "Read comfortably", text: "Dark mode is available from the header or Settings." },
];

export default function BookTrackerOnboarding({ initialName = "", onComplete }: BookTrackerOnboardingProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState(initialName);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const current = STEPS[step];
  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;

  useEffect(() => {
    if (isFirst) inputRef.current?.focus();
  }, [isFirst]);

  const resolvedName = () => name.trim() || initialName.trim();

  const next = () => {
    if (isFirst && !resolvedName()) {
      setError("Enter your name so Book Tracker can personalize your dashboard.");
      inputRef.current?.focus();
      return;
    }
    setError("");
    setStep(value => Math.min(STEPS.length - 1, value + 1));
  };

  const finish = (destination: Destination) => {
    const saveError = onComplete(resolvedName() || "Reader", destination);
    if (saveError) setError(saveError);
  };

  return (
    <div className="bt-onboarding" role="presentation">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="bt-onboarding-title"
        aria-describedby="bt-onboarding-description"
        className="bt-onboarding-card"
      >
        <button className="bt-onboarding-skip" type="button" onClick={() => finish("overview")}>
          Skip tour
        </button>

        <div className="bt-onboarding-icon" aria-hidden="true">
          <current.Icon size={28} strokeWidth={1.8} />
        </div>
        <div className="bt-onboarding-eyebrow">{current.eyebrow}</div>
        <h1 id="bt-onboarding-title">{current.title}</h1>
        <p id="bt-onboarding-description">{current.body}</p>

        {isFirst && (
          <label className="bt-onboarding-name">
            <span>What should we call you?</span>
            <input
              ref={inputRef}
              value={name}
              maxLength={40}
              autoComplete="name"
              placeholder="Your name"
              onChange={event => { setName(event.target.value); setError(""); }}
              onKeyDown={event => { if (event.key === "Enter") next(); }}
              aria-invalid={Boolean(error)}
            />
          </label>
        )}

        {isLast && (
          <div className="bt-onboarding-features">
            {featureItems.map(({ Icon, title, text }) => (
              <div className="bt-onboarding-feature" key={title}>
                <Icon size={18} aria-hidden="true" />
                <div><strong>{title}</strong><span>{text}</span></div>
              </div>
            ))}
          </div>
        )}

        {error && <div className="bt-onboarding-error" role="alert">{error}</div>}

        <div className="bt-onboarding-progress" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
          {STEPS.map((item, index) => (
            <span className={index === step ? "active" : ""} key={item.eyebrow} />
          ))}
        </div>

        <div className="bt-onboarding-actions">
          {!isFirst && (
            <button type="button" className="secondary" onClick={() => { setError(""); setStep(value => value - 1); }}>
              <ArrowLeft size={15} /> Back
            </button>
          )}
          <div className="bt-onboarding-action-spacer" />
          {isLast ? (
            <>
              <button type="button" className="secondary" onClick={() => finish("overview")}>Explore dashboard</button>
              <button type="button" className="primary" onClick={() => finish("library")}>
                Add my first book <ArrowRight size={15} />
              </button>
            </>
          ) : (
            <button type="button" className="primary" onClick={next}>
              Continue <ArrowRight size={15} />
            </button>
          )}
        </div>

        <div className="bt-onboarding-privacy"><LockKeyhole size={12} /> Stored locally. Nothing is sent to a server.</div>
      </section>

      <style>{`
        .bt-onboarding { position: fixed; inset: 0; z-index: 3000; display: flex; align-items: center; justify-content: center; padding: 18px; box-sizing: border-box; background: var(--bt-overlay); backdrop-filter: blur(5px); }
        .bt-onboarding-card { position: relative; width: calc(100vw - 36px); max-width: 520px; min-width: 0; max-height: calc(100vh - 36px); overflow-y: auto; box-sizing: border-box; padding: 42px 38px 28px; border-radius: 22px; border: 1px solid var(--bt-border-card); background: var(--bt-surface); color: var(--bt-text); box-shadow: 0 28px 80px rgba(0,0,0,.28); text-align: center; }
        .bt-onboarding-skip { position: absolute; top: 16px; right: 18px; border: 0; background: transparent; color: var(--bt-muted); cursor: pointer; font-size: 12.5px; }
        .bt-onboarding-icon { width: 62px; height: 62px; margin: 2px auto 17px; display: grid; place-items: center; border-radius: 18px; background: var(--bt-green-faint); color: var(--bt-green); }
        .bt-onboarding-eyebrow { margin-bottom: 8px; color: var(--bt-green); font-size: 10.5px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; }
        .bt-onboarding h1 { margin: 0; color: var(--bt-text); font-family: 'Lora', Georgia, serif; font-size: clamp(25px, 5vw, 32px); font-weight: 500; line-height: 1.2; }
        .bt-onboarding p { margin: 13px auto 22px; max-width: 420px; color: var(--bt-muted); font-size: 14px; line-height: 1.65; }
        .bt-onboarding-name { display: block; text-align: left; margin: 0 auto 6px; max-width: 380px; }
        .bt-onboarding-name span { display: block; margin-bottom: 7px; color: var(--bt-text); font-size: 12.5px; font-weight: 700; }
        .bt-onboarding-name input { width: 100%; box-sizing: border-box; padding: 11px 13px; border: 1.5px solid var(--bt-border); border-radius: 10px; outline: 0; background: var(--bt-bg); }
        .bt-onboarding-name input:focus { border-color: var(--bt-green); }
        .bt-onboarding-features { display: grid; gap: 8px; margin: 2px 0 4px; text-align: left; }
        .bt-onboarding-feature { display: flex; gap: 11px; align-items: center; padding: 10px 12px; border: 1px solid var(--bt-border); border-radius: 10px; background: var(--bt-bg); color: var(--bt-green); }
        .bt-onboarding-feature div { display: grid; gap: 2px; }
        .bt-onboarding-feature strong { color: var(--bt-text); font-size: 12.5px; }
        .bt-onboarding-feature span { color: var(--bt-muted); font-size: 11.5px; line-height: 1.35; }
        .bt-onboarding-error { margin: 10px 0 0; padding: 8px 10px; border: 1px solid var(--bt-danger-border); border-radius: 8px; background: var(--bt-danger-bg); color: #d96c6c; font-size: 12px; text-align: left; }
        .bt-onboarding-progress { display: flex; justify-content: center; gap: 6px; margin: 22px 0 17px; }
        .bt-onboarding-progress span { width: 7px; height: 7px; border-radius: 99px; background: var(--bt-border); transition: width .18s, background .18s; }
        .bt-onboarding-progress span.active { width: 22px; background: var(--bt-green); }
        .bt-onboarding-actions { display: flex; align-items: center; gap: 8px; }
        .bt-onboarding-action-spacer { flex: 1; }
        .bt-onboarding-actions button { display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-height: 38px; padding: 8px 15px; border-radius: 9px; cursor: pointer; font-size: 12.5px; font-weight: 700; }
        .bt-onboarding-actions .secondary { border: 1px solid var(--bt-border); background: var(--bt-surface); color: var(--bt-text-secondary); }
        .bt-onboarding-actions .primary { border: 1px solid var(--bt-green); background: var(--bt-green); color: white; }
        .bt-onboarding-privacy { display: flex; justify-content: center; align-items: center; gap: 5px; margin-top: 17px; color: var(--bt-muted); font-size: 10.5px; }
        @media (max-width: 520px) { .bt-onboarding-card { padding: 42px 20px 22px; } .bt-onboarding-actions { flex-wrap: wrap; } .bt-onboarding-action-spacer { display: none; } .bt-onboarding-actions button { flex: 1 1 145px; } }
      `}</style>
    </div>
  );
}
