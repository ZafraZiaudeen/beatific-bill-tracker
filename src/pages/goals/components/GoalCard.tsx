import { useRef, useState } from "react";
import {
  Car, GraduationCap, Heart, Home, Laptop, Luggage, MoreVertical, Pencil, Plane, Star, Trash2, Umbrella,
} from "lucide-react";
import type { Goal, GoalColor, GoalPriority } from "@/types/goal";
import { fmtCurrency } from "@/lib/billUtils";
import { useSettingsStore } from "@/stores/settingsStore";

const ICON_MAP: Record<string, React.ElementType> = {
  Umbrella, Luggage, Laptop, Home, Car, GraduationCap, Plane, Star, Heart,
};

const COLOR_CFG: Record<GoalColor, {
  iconCls: string; barHex: string; barCls: string;
  sticky: string; washi: string; labelCls: string; pctCls: string;
  dotFill: string;
}> = {
  mint:   { iconCls: "bg-mint/40 text-mint-deep",   barHex: "#5aaa88", barCls: "bg-mint-deep",   sticky: "bg-mint/15",   washi: "bg-mint/60",   labelCls: "text-mint-deep",  pctCls: "text-mint-deep",  dotFill: "bg-mint-deep border-mint-deep"   },
  blush:  { iconCls: "bg-blush/40 text-blush-deep", barHex: "#c97b7d", barCls: "bg-blush-deep",  sticky: "bg-blush/15",  washi: "bg-blush/60",  labelCls: "text-blush-deep", pctCls: "text-blush-deep", dotFill: "bg-blush-deep border-blush-deep" },
  lilac:  { iconCls: "bg-lilac/40 text-lilac-deep", barHex: "#9b7ecc", barCls: "bg-lilac-deep",  sticky: "bg-lilac/15",  washi: "bg-lilac/60",  labelCls: "text-lilac-deep", pctCls: "text-lilac-deep", dotFill: "bg-lilac-deep border-lilac-deep" },
  butter: { iconCls: "bg-butter/50 text-[oklch(0.58_0.12_80)]", barHex: "#c5a44a", barCls: "bg-[#c5a44a]", sticky: "bg-butter/20", washi: "bg-butter/70", labelCls: "text-[oklch(0.58_0.12_80)]", pctCls: "text-[oklch(0.58_0.12_80)]", dotFill: "bg-[#c5a44a] border-[#c5a44a]" },
};

const PRIORITY_CFG: Record<GoalPriority, { label: string; cls: string }> = {
  high:   { label: "High Priority",   cls: "bg-blush/30 text-blush-deep"    },
  medium: { label: "Medium Priority", cls: "bg-butter/40 text-[oklch(0.58_0.12_80)]" },
  low:    { label: "Low Priority",    cls: "bg-mint/30 text-mint-deep"      },
};

const MILESTONES = [0, 0.25, 0.5, 0.75, 1];

interface Props {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (goal: Goal) => void;
}

export function GoalCard({ goal, onEdit, onDelete }: Props) {
  const settings = useSettingsStore((s) => s.settings);
  const fmt = (n: number) => fmtCurrency(n, settings.currency, settings.currencyPosition as "before" | "after");

  const cfg = COLOR_CFG[goal.color];
  const pCfg = PRIORITY_CFG[goal.priority];
  const Icon = ICON_MAP[goal.icon] ?? Umbrella;
  const pct = goal.target > 0 ? Math.min(100, Math.round((goal.saved / goal.target) * 100)) : 0;

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  return (
    <article className="paper-card relative overflow-hidden rounded-3xl bg-white/85">
      {/* ⋮ menu */}
      <div className="absolute right-2 top-2 z-10" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((o) => !o)}
          onBlur={(e) => { if (!menuRef.current?.contains(e.relatedTarget as Node)) setMenuOpen(false); }}
          className="flex h-7 w-7 items-center justify-center rounded-xl hover:bg-ink/8"
        >
          <MoreVertical className="h-4 w-4 text-ink/40" strokeWidth={1.8} />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-8 z-20 min-w-[110px] rounded-2xl border border-ink/10 bg-paper shadow-lg py-1">
            <button onClick={() => { setMenuOpen(false); onEdit(goal); }}
              className="flex w-full items-center gap-2 px-3 py-2 font-hand text-sm text-ink hover:bg-ink/5">
              <Pencil className="h-3.5 w-3.5 text-ink/50" strokeWidth={1.6} /> Edit
            </button>
            <button onClick={() => { setMenuOpen(false); onDelete(goal); }}
              className="flex w-full items-center gap-2 px-3 py-2 font-hand text-sm text-blush-deep hover:bg-blush/10">
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.6} /> Delete
            </button>
          </div>
        )}
      </div>

      {/* 4-zone grid */}
      <div className="grid grid-cols-1 sm:grid-cols-[minmax(200px,auto)_120px_1fr_140px]">

        {/* Zone 1 — Icon + title + desc + priority */}
        <div className="flex items-center gap-4 border-b border-r border-ink/8 px-5 py-5 sm:border-b-0">
          <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full ${cfg.iconCls}`}>
            <Icon className="h-8 w-8" strokeWidth={1.3} />
          </div>
          <div className="min-w-0">
            <p className="font-script text-xl leading-snug">{goal.title} ♡</p>
            <p className="font-hand text-xs italic text-ink-soft leading-snug mt-0.5 line-clamp-2">{goal.description}</p>
            <span className={`mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1 font-hand text-[0.65rem] ${pCfg.cls}`}>
              ☆ {pCfg.label}
            </span>
          </div>
        </div>

        {/* Zone 2 — Saved / Target */}
        <div className="flex flex-col justify-center border-b border-r border-ink/8 px-5 py-4 sm:border-b-0">
          <p className={`font-hand text-[0.6rem] uppercase tracking-widest ${cfg.labelCls}`}>Saved</p>
          <p className={`font-sans text-base font-extrabold leading-tight ${cfg.labelCls}`}>{fmt(goal.saved)}</p>
          <div className="dashed-rule my-1.5" />
          <p className="font-hand text-[0.6rem] uppercase tracking-widest text-ink-soft">Target</p>
          <p className="font-sans text-sm text-ink">{fmt(goal.target)}</p>
        </div>

        {/* Zone 3 — % + progress bar + milestones */}
        <div className="flex flex-col justify-center border-b border-r border-ink/8 px-5 py-4 sm:border-b-0 min-w-0">
          <div className="flex items-center mb-2">
            <span className={`font-sans text-3xl font-extrabold leading-none ${cfg.pctCls}`}>{pct}%</span>
            <Heart className="ml-auto h-4 w-4 text-ink/20 shrink-0" strokeWidth={1.2} />
          </div>
          {/* Bar */}
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-ink/10">
            <div className={`h-full rounded-full transition-all ${cfg.barCls}`} style={{ width: `${pct}%` }} />
          </div>
          {/* Milestone dots + amounts */}
          <div className="mt-2 flex justify-between">
            {MILESTONES.map((frac) => {
              const reached = goal.saved >= goal.target * frac;
              return (
                <div key={frac} className="flex flex-col items-center gap-0.5">
                  <span className={`block h-2.5 w-2.5 rounded-full border ${reached ? cfg.dotFill : "border-ink/25 bg-white"}`} />
                  <span className="font-hand text-[0.5rem] text-ink/50 whitespace-nowrap">
                    {fmt(goal.target * frac)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Zone 4 — Sticky note */}
        <div className={`relative flex flex-col justify-center overflow-hidden px-4 py-5 ${cfg.sticky}`}>
          {/* Washi tape */}
          <div className={`absolute left-2 top-0 h-3.5 w-14 rounded-b-sm ${cfg.washi} opacity-70`} />
          <p className="mt-4 font-script text-sm leading-relaxed text-ink">{goal.motivation}</p>
          <Heart className={`mt-3 h-4 w-4 ${cfg.labelCls} opacity-60`} strokeWidth={1.2} />
        </div>
      </div>
    </article>
  );
}
