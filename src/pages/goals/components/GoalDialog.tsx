import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Car, GraduationCap, Heart, Home, Laptop, Luggage, Plane, Star, Umbrella,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useGoalStore } from "@/stores/goalStore";
import { useSettingsStore } from "@/stores/settingsStore";
import type { Goal, GoalColor, GoalPriority } from "@/types/goal";

const ICONS: { key: string; Icon: React.ElementType }[] = [
  { key: "Umbrella",      Icon: Umbrella      },
  { key: "Luggage",       Icon: Luggage       },
  { key: "Laptop",        Icon: Laptop        },
  { key: "Home",          Icon: Home          },
  { key: "Car",           Icon: Car           },
  { key: "GraduationCap", Icon: GraduationCap },
  { key: "Plane",         Icon: Plane         },
  { key: "Star",          Icon: Star          },
  { key: "Heart",         Icon: Heart         },
];

const COLORS: { key: GoalColor; cls: string; label: string }[] = [
  { key: "mint",   cls: "bg-mint-deep/70",   label: "Mint"   },
  { key: "blush",  cls: "bg-blush-deep/70",  label: "Blush"  },
  { key: "lilac",  cls: "bg-lilac-deep/70",  label: "Lilac"  },
  { key: "butter", cls: "bg-butter/80 border border-ink/15", label: "Butter" },
];

const PRIORITIES: { key: GoalPriority; label: string }[] = [
  { key: "high",   label: "High Priority"   },
  { key: "medium", label: "Medium Priority" },
  { key: "low",    label: "Low Priority"    },
];

const PRIORITY_ACTIVE: Record<GoalPriority, string> = {
  high:   "bg-blush/30 border-blush-deep/40 text-blush-deep",
  medium: "bg-butter/40 border-ink/20 text-ink",
  low:    "bg-mint/30 border-mint-deep/40 text-mint-deep",
};

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  goal?: Goal;
  onDeleteRequest?: (goal: Goal) => void;
}

const EMPTY = {
  title: "", description: "", icon: "Umbrella", color: "mint" as GoalColor,
  priority: "medium" as GoalPriority, saved: "", target: "", monthlyContribution: "", motivation: "",
};

const inputCls = "w-full rounded-2xl border border-ink/15 bg-white/70 px-4 py-2.5 font-hand text-sm text-ink outline-none focus:border-lilac-deep/40";
const labelCls = "font-hand text-[0.65rem] uppercase tracking-widest text-ink-soft mb-1.5 block";

export function GoalDialog({ open, onOpenChange, goal, onDeleteRequest }: Props) {
  const addGoal    = useGoalStore((s) => s.addGoal);
  const updateGoal = useGoalStore((s) => s.updateGoal);
  const settings   = useSettingsStore((s) => s.settings);
  const cur = settings.currency;

  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (open) {
      if (goal) {
        setForm({
          title: goal.title, description: goal.description, icon: goal.icon,
          color: goal.color, priority: goal.priority,
          saved: String(goal.saved), target: String(goal.target),
          monthlyContribution: String(goal.monthlyContribution),
          motivation: goal.motivation,
        });
      } else {
        setForm(EMPTY);
      }
    }
  }, [open, goal]);

  function set<K extends keyof typeof EMPTY>(k: K, v: typeof EMPTY[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const saved = parseFloat(form.saved) || 0;
    const target = parseFloat(form.target);
    const monthlyContribution = parseFloat(form.monthlyContribution) || 0;
    if (!form.title.trim() || isNaN(target) || target <= 0) return;
    const today = format(new Date(), "yyyy-MM-dd");
    if (goal) {
      updateGoal(goal.id, {
        title: form.title.trim(), description: form.description.trim(),
        icon: form.icon, color: form.color, priority: form.priority,
        saved, target, monthlyContribution, motivation: form.motivation.trim(),
      });
    } else {
      addGoal({
        id: `goal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: form.title.trim(), description: form.description.trim(),
        icon: form.icon, color: form.color, priority: form.priority,
        saved, target, monthlyContribution, motivation: form.motivation.trim(),
        date: today,
      });
    }
    onOpenChange(false);
  }

  const isEdit = !!goal;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-3xl border-0 bg-paper p-0 shadow-xl overflow-hidden flex max-h-[90vh]">
        {/* Spring holes */}
        <div className="flex shrink-0 flex-col items-center gap-3 bg-ink/4 px-2.5 py-6 pt-10">
          {[0,1,2,3,4,5,6].map((i) => (
            <span key={i} className="block h-2.5 w-2.5 rounded-full border border-ink/20 bg-paper" />
          ))}
        </div>

        {/* Content */}
        <div className="relative min-w-0 flex-1 overflow-y-auto px-6 py-5">
          {/* Washi tape */}
          <div className="absolute left-4 top-0 h-4 w-24 rounded-b-sm bg-lilac/60 opacity-80" />

          <DialogHeader className="mt-3 mb-5">
            <DialogTitle className="font-script text-2xl text-ink">
              {isEdit ? "✧ Edit Goal" : "✧ Add Goal"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className={labelCls}>Title</label>
              <input type="text" required placeholder="e.g. Emergency Fund"
                value={form.title} onChange={(e) => set("title", e.target.value)}
                className={inputCls} />
            </div>

            {/* Description */}
            <div>
              <label className={labelCls}>Description</label>
              <input type="text" placeholder="A short inspiring subtitle…"
                value={form.description} onChange={(e) => set("description", e.target.value)}
                className={inputCls} />
            </div>

            {/* Icon */}
            <div>
              <label className={labelCls}>Icon</label>
              <div className="flex flex-wrap gap-2">
                {ICONS.map(({ key, Icon }) => (
                  <button key={key} type="button"
                    onClick={() => set("icon", key)}
                    className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${
                      form.icon === key
                        ? "border-lilac-deep/50 bg-lilac/30 text-lilac-deep"
                        : "border-ink/15 bg-white/60 text-ink-soft hover:bg-white"
                    }`}>
                    <Icon className="h-4 w-4" strokeWidth={1.6} />
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <label className={labelCls}>Color</label>
              <div className="flex gap-3">
                {COLORS.map(({ key, cls, label }) => (
                  <button key={key} type="button"
                    onClick={() => set("color", key)}
                    title={label}
                    className={`h-7 w-7 rounded-full ${cls} ring-offset-1 transition-all ${
                      form.color === key ? "ring-2 ring-lilac-deep" : ""
                    }`} />
                ))}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className={labelCls}>Priority</label>
              <div className="flex gap-2">
                {PRIORITIES.map(({ key, label }) => (
                  <button key={key} type="button"
                    onClick={() => set("priority", key)}
                    className={`flex-1 rounded-full border px-2 py-1.5 font-hand text-xs transition-colors ${
                      form.priority === key
                        ? PRIORITY_ACTIVE[key]
                        : "border-ink/15 bg-white/60 text-ink-soft hover:bg-white"
                    }`}>
                    ☆ {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Amounts row */}
            <div className="grid grid-cols-3 gap-3">
              {([
                ["Target", "target"],
                ["Saved So Far", "saved"],
                ["Monthly", "monthlyContribution"],
              ] as [string, keyof typeof EMPTY][]).map(([lbl, key]) => (
                <div key={key}>
                  <label className={labelCls}>{lbl}</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-hand text-sm text-ink-soft">{cur}</span>
                    <input type="number" min={0} step={0.01} placeholder="0.00"
                      value={form[key] as string}
                      onChange={(e) => set(key, e.target.value)}
                      className={`${inputCls} pl-7`} />
                  </div>
                </div>
              ))}
            </div>

            {/* Motivation */}
            <div>
              <label className={labelCls}>Sticky Note Motivation</label>
              <textarea rows={2} placeholder="A short inspiring message for this goal…"
                value={form.motivation} onChange={(e) => set("motivation", e.target.value)}
                className={`${inputCls} resize-none`} />
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-1">
              <button type="submit"
                className="flex-1 rounded-full bg-lilac-deep/80 py-2.5 font-hand text-sm text-white hover:bg-lilac-deep">
                {isEdit ? "Save Changes ♡" : "Add Goal ♡"}
              </button>
              {isEdit && onDeleteRequest && (
                <button type="button"
                  onClick={() => { onOpenChange(false); onDeleteRequest(goal!); }}
                  className="rounded-full px-4 py-2.5 font-hand text-sm text-blush-deep hover:bg-blush/20">
                  Delete
                </button>
              )}
              <button type="button" onClick={() => onOpenChange(false)}
                className="flex-1 rounded-full border border-ink/15 bg-white/60 py-2.5 font-hand text-sm text-ink-soft hover:bg-white">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
