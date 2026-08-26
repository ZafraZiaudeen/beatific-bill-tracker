import { CalendarDays, ChevronDown, CircleDollarSign, MoveHorizontal } from "lucide-react";
import { useSettingsStore } from "@/stores/settingsStore";
import { useUIStore } from "@/stores/uiStore";
import { FULL_CURRENCIES } from "@/lib/constants";

import sprig from "@/assets/doodle-sprig.png";
import leaves from "@/assets/doodle-leaves.png";
import flower from "@/assets/doodle-flower.png";
import stars from "@/assets/stars.png";
import vase from "@/assets/doodle-vase.png";

const SETTINGS_CAT_COLORS = [
  { text: "text-mint-deep",              bg: "bg-mint/15",   border: "border-mint/30" },
  { text: "text-lilac-deep",             bg: "bg-lilac/15",  border: "border-lilac/30" },
  { text: "text-[oklch(0.62_0.1_80)]",  bg: "bg-butter/20", border: "border-butter/50" },
  { text: "text-blush-deep",             bg: "bg-blush/15",  border: "border-blush/30" },
  { text: "text-blush-deep",             bg: "bg-blush/15",  border: "border-blush/30" },
];

const PRIORITY_CARD_STYLES = [
  { text: "text-blush-deep",            bg: "bg-blush/15",   border: "border-blush/30",  doodle: flower },
  { text: "text-[oklch(0.62_0.1_80)]", bg: "bg-butter/20",  border: "border-butter/50", doodle: stars },
  { text: "text-[oklch(0.62_0.1_80)]", bg: "bg-butter/15",  border: "border-butter/40", doodle: flower },
  { text: "text-mint-deep",             bg: "bg-mint/15",    border: "border-mint/30",   doodle: sprig },
  { text: "text-lilac-deep",            bg: "bg-lilac/15",   border: "border-lilac/30",  doodle: flower },
];

const CAT_DOODLES = [sprig, sprig, leaves, sprig, flower];

export function Settings() {
  const settings = useSettingsStore((s) => s.settings);
  const billGroups = useSettingsStore((s) => s.billGroups);
  const setSettings = useSettingsStore((s) => s.setSettings);
  const setBillGroups = useSettingsStore((s) => s.setBillGroups);
  const activeSection = useUIStore((s) => s.activeSection);
  const setActiveSection = useUIStore((s) => s.setActiveSection);

  const sSelectClass = "w-full cursor-pointer appearance-none rounded-2xl border border-lilac/35 bg-white/75 px-4 py-3 pr-12 font-hand text-sm text-ink shadow-sm outline-none transition-colors hover:border-lilac-deep/35 hover:bg-white/90 focus:border-lilac-deep/50 focus:bg-white";
  const sLabelClass = "font-hand text-[0.65rem] uppercase tracking-widest text-ink-soft mb-1.5 flex items-center gap-1.5";
  const sSelectWrapClass = "relative rounded-2xl bg-lilac/10 p-1 shadow-[inset_0_0_0_1px_oklch(0.9_0.04_300_/_45%)]";
  const sSelectIconClass = "pointer-events-none absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-lilac/45 text-lilac-deep shadow-sm";

  return (
    <main className="dot-grid min-w-0 flex-1 px-5 py-8 sm:px-8">
      {/* Header */}
      <header className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="font-script text-5xl sm:text-6xl">Settings <span className="text-2xl">✧ +</span></h2>
          <p className="mt-1 font-hand text-sm text-ink-soft">Personalize your Pastel Dream Journal</p>
        </div>
        <div className="relative hidden sm:block h-20 w-24 shrink-0">
          <img src={vase} alt="" aria-hidden className="absolute bottom-0 right-4 h-16 w-auto object-contain opacity-80" />
          <img src={flower} alt="" aria-hidden className="absolute -top-2 right-0 h-8 w-8 object-contain opacity-70" />
        </div>
      </header>

      {/* Hero tagline */}
      <div className="paper-card relative mb-5 overflow-hidden rounded-3xl bg-blush/20 px-8 py-6">
        <span className="absolute left-4 top-3 select-none font-script text-[5rem] leading-none text-blush-deep/20">"</span>
        <p className="relative font-hand text-base italic text-ink sm:text-lg">
          Customize your budget and app experience to fit your dreamy life. ♡
        </p>
        <img src={vase} alt="" aria-hidden className="absolute bottom-0 right-24 hidden h-24 w-auto object-contain opacity-70 sm:right-32 sm:block" />
        <img src={flower} alt="" aria-hidden className="absolute right-8 top-4 h-8 w-8 object-contain opacity-60" />
      </div>

      {/* Card 1: Budget customization */}
      <div className="paper-card mb-5 rounded-3xl bg-white/85 p-6">
        <p className="mb-4 font-script text-2xl">✧ Customize your budget the way you need</p>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div>
            <p className={sLabelClass}>
              <CircleDollarSign className="h-3.5 w-3.5 text-lilac-deep" strokeWidth={1.7} />
              Currency symbol
            </p>
            <div className={sSelectWrapClass}>
              <select
                value={settings.currency}
                onChange={(e) => setSettings((s) => ({ ...s, currency: e.target.value }))}
                className={sSelectClass}>
                {FULL_CURRENCIES.map((c) => (
                  <option key={c.symbol} value={c.symbol}>{c.label}</option>
                ))}
              </select>
              <span className={sSelectIconClass}>
                <ChevronDown className="h-4 w-4" strokeWidth={1.8} />
              </span>
            </div>
          </div>
          <div>
            <p className={sLabelClass}>
              <MoveHorizontal className="h-3.5 w-3.5 text-mint-deep" strokeWidth={1.7} />
              Currency position
            </p>
            <div className={sSelectWrapClass}>
              <select
                value={settings.currencyPosition}
                onChange={(e) => setSettings((s) => ({ ...s, currencyPosition: e.target.value as "before" | "after" }))}
                className={sSelectClass}>
                <option value="before">Before amount</option>
                <option value="after">After amount</option>
              </select>
              <span className={sSelectIconClass}>
                <ChevronDown className="h-4 w-4" strokeWidth={1.8} />
              </span>
            </div>
          </div>
          <div>
            <p className={sLabelClass}>
              <CalendarDays className="h-3.5 w-3.5 text-blush-deep" strokeWidth={1.7} />
              Week start
            </p>
            <div className={sSelectWrapClass}>
              <select
                value={settings.weekStart}
                onChange={(e) => setSettings((s) => ({ ...s, weekStart: e.target.value as "Sunday" | "Monday" }))}
                className={sSelectClass}>
                <option value="Sunday">Sunday</option>
                <option value="Monday">Monday</option>
              </select>
              <span className={sSelectIconClass}>
                <ChevronDown className="h-4 w-4" strokeWidth={1.8} />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Bill name groups */}
      <div className="paper-card mb-5 rounded-3xl bg-white/85 p-6">
        <p className="mb-1 font-script text-2xl">🖊 Bill name templates</p>
        <p className="mb-4 font-hand text-xs text-ink-soft">Names shown in the Bill Name dropdown when adding a bill.</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          {billGroups.map((group, idx) => {
            const style = SETTINGS_CAT_COLORS[idx % SETTINGS_CAT_COLORS.length]!;
            const doodle = CAT_DOODLES[idx % CAT_DOODLES.length]!;
            return (
              <div key={group.title} className={`relative flex min-h-48 flex-col overflow-hidden rounded-2xl border ${style.border} ${style.bg} p-3`}>
                <input
                  type="text"
                  value={group.title}
                  onChange={(e) => {
                    const oldTitle = group.title;
                    const newTitle = e.target.value;
                    setBillGroups((prev) => prev.map((g) => g.title === oldTitle ? { ...g, title: newTitle } : g));
                    setSettings((s) => {
                      const names = [...s.categoryNames] as [string, string, string, string, string];
                      names[idx] = newTitle;
                      return { ...s, categoryNames: names };
                    });
                  }}
                  className={`font-hand text-[0.65rem] font-bold uppercase tracking-widest ${style.text} mb-2 w-full cursor-text border-none bg-transparent outline-none hover:opacity-80`}
                  placeholder="Category name"
                />
                <ul className="mb-2 flex-1 space-y-1">
                  {group.names.map((name) => (
                    <li key={name} className={`font-hand text-xs ${style.text} flex items-center justify-between gap-1`}>
                      <span><span className="text-ink/40">·</span> {name}</span>
                      <button
                        onClick={() => setBillGroups((prev) => prev.map((g) =>
                          g.title === group.title ? { ...g, names: g.names.filter((n) => n !== name) } : g
                        ))}
                        className="ml-1 leading-none text-ink/30 transition-colors hover:text-blush-deep">×</button>
                    </li>
                  ))}
                  {group.names.length === 0 && (
                    <li className="font-hand text-xs italic text-ink/30">No names yet</li>
                  )}
                </ul>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const input = (e.currentTarget.elements.namedItem("newName") as HTMLInputElement);
                    const val = input.value.trim();
                    if (!val || group.names.includes(val)) { input.value = ""; return; }
                    setBillGroups((prev) => prev.map((g) =>
                      g.title === group.title ? { ...g, names: [...g.names, val] } : g
                    ));
                    input.value = "";
                  }}
                  className="mt-auto flex gap-1">
                  <input name="newName" type="text" placeholder="Add name…"
                    className={`min-w-0 flex-1 rounded-lg border border-ink/10 bg-white/50 px-2 py-1 font-hand text-xs ${style.text} outline-none`} />
                  <button type="submit" className={`shrink-0 font-hand text-xs ${style.text} hover:opacity-70`}>+</button>
                </form>
                <img src={doodle} alt="" aria-hidden className="pointer-events-none absolute bottom-8 right-1 h-10 w-10 object-contain opacity-30" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Card 3: Priority names */}
      <div className="paper-card mb-5 rounded-3xl bg-white/85 p-6">
        <p className="mb-1 font-script text-2xl">⚙ Add your priority level names</p>
        <p className="mb-4 font-hand text-xs text-ink-soft">Click a name to rename your priority levels.</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          {([0, 1, 2, 3, 4] as const).map((n) => {
            const style = PRIORITY_CARD_STYLES[n]!;
            return (
              <div key={n} className={`relative flex min-h-32 flex-col overflow-hidden rounded-2xl border ${style.border} ${style.bg} p-3`}>
                <p className={`font-hand text-[0.6rem] font-bold uppercase tracking-widest ${style.text} mb-1`}>
                  Priority {n + 1}
                </p>
                <input
                  type="text"
                  value={settings.priorityNames[n]}
                  onChange={(e) => {
                    const names = [...settings.priorityNames] as [string, string, string, string, string];
                    names[n] = e.target.value;
                    setSettings((s) => ({ ...s, priorityNames: names }));
                  }}
                  className={`mt-1 w-full border-none bg-transparent font-script text-xl ${style.text} outline-none`}
                  placeholder={`Priority ${n + 1}`}
                />
                <img src={style.doodle} alt="" aria-hidden className="pointer-events-none absolute bottom-1 right-1 h-12 w-12 object-contain opacity-50" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Card 4: App settings */}
      <div className="paper-card rounded-3xl bg-white/85 p-6">
        <p className="mb-4 font-script text-2xl">⚙ App Settings</p>
        <div className="divide-y divide-ink/10">
          {([
            { label: "Menu Visibility", key: "menuVisible" as const },
            { label: "Quick Start Guide", key: "quickStartVisible" as const },
            { label: "Contact", key: "contactVisible" as const },
          ]).map(({ label, key }) => (
            <div key={key} className="flex items-center justify-between py-3">
              <span className="font-hand text-sm text-ink">{label}</span>
              <div className="flex items-center gap-3">
                <span className={`font-hand text-sm ${settings[key] ? "text-ink" : "text-ink/40"}`}>
                  {settings[key] ? "Visible" : "Hidden"}
                </span>
                <button
                  onClick={() => {
                    const nextVisible = !settings[key];
                    setSettings((s) => ({ ...s, [key]: nextVisible }));
                    if (key === "quickStartVisible" && nextVisible) {
                      localStorage.removeItem("pdj-onboarding-seen");
                    }
                    if (!nextVisible) {
                      const hiddenByMenu = key === "menuVisible" && activeSection !== "Dashboard" && activeSection !== "Settings";
                      const hiddenGuide = key === "quickStartVisible" && activeSection === "Startup Guide";
                      const hiddenContact = key === "contactVisible" && activeSection === "Contact";
                      if (hiddenByMenu || hiddenGuide || hiddenContact) setActiveSection("Dashboard");
                    }
                  }}
                  className={`font-hand text-sm underline transition-colors ${settings[key] ? "text-blush-deep hover:text-blush-deep/70" : "text-mint-deep hover:text-mint-deep/70"}`}>
                  {settings[key] ? "Hide" : "Show"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
