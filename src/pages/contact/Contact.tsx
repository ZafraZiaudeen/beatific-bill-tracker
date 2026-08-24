import { useState } from "react";
import { format } from "date-fns";
import { CalendarDays, ChevronDown, Heart, Mail, ShoppingBag } from "lucide-react";

import flowerImg from "@/assets/doodle-flower.png";
import vaseImg from "@/assets/doodle-vase.png";
import cloudImg from "@/assets/cloud (1).png";

const EMAIL_KEY = "pdj-contact-email";
const ETSY_KEY  = "pdj-contact-etsy";

function load(key: string, fallback: string) {
  try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
}

function save(key: string, val: string) {
  try { localStorage.setItem(key, val); } catch { /* noop */ }
}

interface InlineFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

function InlineField({ label, value, onChange, placeholder }: InlineFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  function commit() {
    onChange(draft);
    setEditing(false);
  }

  return (
    <div>
      <p className="font-script text-2xl">{label}</p>
      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
          className="mt-0.5 w-full border-0 border-b border-dashed border-ink/30 bg-transparent font-hand text-sm text-ink-soft outline-none"
          placeholder={placeholder}
        />
      ) : (
        <p
          onClick={() => { setDraft(value); setEditing(true); }}
          className="mt-0.5 cursor-text border-b border-dashed border-ink/20 font-hand text-sm text-ink-soft"
        >
          {value || <span className="opacity-40">{placeholder}</span>}
        </p>
      )}
    </div>
  );
}

export function Contact() {
  const now = new Date();
  const [email, setEmail] = useState(() => load(EMAIL_KEY, "hello@pasteldreamjournal.com"));
  const [etsy,  setEtsy]  = useState(() => load(ETSY_KEY,  "etsy.com/shop/pasteldreamjournal"));

  function handleEmail(v: string) { setEmail(v); save(EMAIL_KEY, v); }
  function handleEtsy(v: string)  { setEtsy(v);  save(ETSY_KEY, v); }

  return (
    <main className="dot-grid min-w-0 flex-1 px-5 py-8 sm:px-8">
      {/* Header */}
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-script text-4xl leading-tight sm:text-5xl">
            A little note for us ✦
          </h2>
          <p className="mt-1 font-hand text-sm text-ink-soft">
            Where you can find us, whenever you need.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="paper-card flex items-center gap-2 rounded-full bg-white/85 px-4 py-2.5 sm:px-5 sm:py-3">
            <CalendarDays className="h-5 w-5 shrink-0 text-lilac-deep" strokeWidth={1.6} />
            <span className="font-script text-lg sm:text-xl">{format(now, "MMMM d, yyyy")}</span>
            <ChevronDown className="h-4 w-4 text-ink-soft" strokeWidth={1.8} />
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blush shadow-sm">
            <img src={cloudImg} alt="" aria-hidden loading="lazy" className="h-8 w-8 object-contain opacity-80" />
          </div>
        </div>
      </header>

      {/* Main notebook card */}
      <div className="paper-card relative flex overflow-hidden rounded-3xl bg-white/88">
        {/* Spring holes strip */}
        <div className="flex shrink-0 flex-col items-center gap-3.5 bg-ink/4 px-2.5 pb-8 pt-10">
          {[0,1,2,3,4,5,6,7,8,9].map((i) => (
            <span key={i} className="block h-2.5 w-2.5 rounded-full border border-ink/20 bg-paper" />
          ))}
        </div>

        {/* Body */}
        <div className="relative min-w-0 flex-1 px-8 py-8 sm:px-12">
          {/* Pink washi tape top-center */}
          <div className="absolute left-1/2 top-0 h-5 w-24 -translate-x-1/2 rounded-b-sm bg-blush/60 opacity-85" />

          {/* Find us here heading */}
          <div className="mt-4 flex flex-col items-center gap-1 text-center">
            <Heart className="h-6 w-6 text-blush-deep/50" strokeWidth={1.3} />
            <div className="flex items-center gap-2">
              <p className="font-script text-3xl underline decoration-ink/20 underline-offset-4">
                Find us here
              </p>
              <Heart className="h-4 w-4 text-blush-deep/50" strokeWidth={1.3} />
            </div>
          </div>

          <div className="dashed-rule mb-8 mt-6" />

          {/* Contact rows */}
          <div className="space-y-10 pb-4">
            {/* Email row */}
            <div className="flex items-start gap-5">
              {/* Icon box */}
              <div className="relative shrink-0">
                <div className="flex h-[60px] w-[60px] items-center justify-center rounded-xl border border-ink/20 bg-blush/20">
                  <Mail className="h-9 w-9 text-blush-deep/70" strokeWidth={1.4} />
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blush-deep/20">
                  <Heart className="h-3 w-3 text-blush-deep/70" strokeWidth={1.5} />
                </span>
              </div>
              {/* Fields */}
              <div className="min-w-0 flex-1 pt-1">
                <InlineField
                  label="Email"
                  value={email}
                  onChange={handleEmail}
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {/* Etsy row */}
            <div className="flex items-start gap-5">
              {/* Icon box */}
              <div className="relative shrink-0">
                <div className="relative flex h-[60px] w-[60px] items-center justify-center rounded-xl border border-ink/20 bg-mint/20">
                  <ShoppingBag className="h-9 w-9 text-mint-deep/60" strokeWidth={1.4} />
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center font-hand text-xs font-bold text-mint-deep/90">E</span>
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-mint-deep/20">
                  <Heart className="h-3 w-3 text-mint-deep/60" strokeWidth={1.5} />
                </span>
              </div>
              {/* Fields */}
              <div className="min-w-0 flex-1 pt-1">
                <InlineField
                  label="Etsy shop"
                  value={etsy}
                  onChange={handleEtsy}
                  placeholder="etsy.com/shop/..."
                />
              </div>
            </div>
          </div>

          {/* Flower doodle bottom-right */}
          <img src={flowerImg} alt="" aria-hidden loading="lazy"
            className="pointer-events-none absolute bottom-4 right-6 h-20 w-20 object-contain opacity-40" />
        </div>
      </div>

      {/* Footer decorations */}
      <div className="relative mt-6 flex items-end justify-between px-4">
        <div className="flex gap-3">
          <Heart className="h-5 w-5 text-blush-deep/30" strokeWidth={1.2} />
          <Heart className="h-4 w-4 translate-y-1 text-lilac-deep/30" strokeWidth={1.2} />
          <Heart className="h-5 w-5 text-mint-deep/30" strokeWidth={1.2} />
        </div>
        <img src={vaseImg} alt="" aria-hidden loading="lazy"
          className="h-24 w-auto object-contain opacity-60 sm:h-28" />
      </div>
    </main>
  );
}
