import { useState } from "react";
import { Heart, Mail, ShoppingBag } from "lucide-react";
import { Washi } from "@/components/common/Washi";
import { HeaderDatePicker } from "@/components/common/HeaderDatePicker";

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
    <div className="min-w-0">
      <p className="font-script text-2xl leading-none sm:text-3xl">{label}</p>
      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
          className="mt-2 w-full border-0 border-b border-lilac-deep/25 bg-transparent pb-1.5 font-hand text-base text-ink outline-none transition-colors focus:border-lilac-deep/60 sm:text-lg"
          placeholder={placeholder}
        />
      ) : (
        <button
          type="button"
          onClick={() => { setDraft(value); setEditing(true); }}
          className="mt-2 block w-full cursor-text truncate border-b border-lilac-deep/20 bg-transparent pb-1.5 text-left font-hand text-base text-ink-soft transition-colors hover:border-lilac-deep/45 sm:text-lg"
          aria-label={`Edit ${label}`}
        >
          {value || <span className="opacity-40">{placeholder}</span>}
        </button>
      )}
    </div>
  );
}

export function Contact() {
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
            A little note for us ✨
          </h2>
          <p className="mt-1 font-hand text-sm text-ink-soft">
            Where you can find us, whenever you need.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <HeaderDatePicker />
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blush shadow-sm">
            <img src={cloudImg} alt="" aria-hidden loading="lazy" className="h-8 w-8 object-contain opacity-80" />
          </div>
        </div>
      </header>

      {/* Main notebook card */}
      <div className="notebook-paper-card relative mx-auto max-w-5xl pt-4">
        <Washi className="notebook-paper-tape absolute left-1/2 top-0 z-20 h-11 w-40 -translate-x-1/2 -rotate-6" />

        <div className="notebook-paper-sheet relative flex min-h-[30rem]">
        {/* Punched notebook holes */}
        <div className="notebook-paper-binding flex w-12 shrink-0 flex-col items-center justify-evenly py-10 sm:w-14">
          {[0,1,2,3,4,5,6,7,8].map((i) => (
            <span key={i} className="notebook-paper-hole block h-4 w-4 rounded-full sm:h-[1.125rem] sm:w-[1.125rem]" />
          ))}
        </div>

        {/* Paper body */}
        <div className="contact-notebook-body relative min-w-0 flex-1 px-6 pb-12 pt-12 sm:px-12 sm:pb-14 sm:pt-14 lg:px-16">

          {/* Find us here heading */}
          <div className="flex flex-col items-center text-center">
            <p className="font-script text-3xl leading-none sm:text-4xl">Find us here</p>
            <div className="mt-2.5 flex w-48 items-center gap-2.5 text-ink/65 sm:w-56">
              <span className="h-px flex-1 bg-ink/55" />
              <Heart className="h-4 w-4 shrink-0 fill-blush/70 text-blush-deep/60" strokeWidth={1.3} />
              <span className="h-px flex-1 bg-ink/55" />
            </div>
          </div>

          {/* Contact rows */}
          <div className="mx-auto mt-10 max-w-2xl space-y-10 pb-5 sm:mt-12 sm:space-y-12">
            {/* Email row */}
            <div className="grid grid-cols-[4rem_minmax(0,1fr)] items-center gap-5 sm:grid-cols-[5rem_minmax(0,1fr)] sm:gap-8">
              <div className="relative flex h-16 w-16 items-center justify-center sm:h-20 sm:w-20">
                <Mail className="h-12 w-12 text-ink sm:h-16 sm:w-16" strokeWidth={1.25} />
                <span className="absolute bottom-1.5 left-1/2 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full bg-paper sm:bottom-2">
                  <Heart className="h-5 w-5 fill-blush text-blush-deep/75" strokeWidth={1.35} />
                </span>
              </div>
              {/* Fields */}
              <div className="min-w-0">
                <InlineField
                  label="Email"
                  value={email}
                  onChange={handleEmail}
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {/* Etsy row */}
            <div className="grid grid-cols-[4rem_minmax(0,1fr)] items-center gap-5 sm:grid-cols-[5rem_minmax(0,1fr)] sm:gap-8">
              <div className="relative flex h-16 w-16 items-center justify-center sm:h-20 sm:w-20">
                <ShoppingBag className="h-12 w-12 text-ink sm:h-16 sm:w-16" strokeWidth={1.25} />
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center pb-1 pt-3 font-script text-3xl leading-none text-ink sm:text-4xl">e</span>
                <span className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-paper sm:right-1">
                  <Heart className="h-5 w-5 fill-blush text-blush-deep/75" strokeWidth={1.35} />
                </span>
              </div>
              {/* Fields */}
              <div className="min-w-0">
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
            className="pointer-events-none absolute bottom-5 right-7 h-16 w-16 object-contain opacity-60 sm:bottom-6 sm:right-9 sm:h-20 sm:w-20" />
        </div>
        </div>
      </div>

      {/* Footer decorations */}
      <div className="relative mx-auto mt-6 flex max-w-5xl items-end justify-between px-4">
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
