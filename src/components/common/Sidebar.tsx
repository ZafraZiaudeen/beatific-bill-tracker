import { Unlock, X } from "lucide-react";
import { useUIStore } from "@/stores/uiStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { NAV_ITEMS } from "@/lib/constants";
import type { Section } from "@/types/bill";
import cloudImg from "@/assets/cloud (1).png";
import flowerImg from "@/assets/doodle-flower.png";
import washiImg from "@/assets/washi.png";

export function Sidebar() {
  const activeSection = useUIStore((s) => s.activeSection);
  const setActiveSection = useUIStore((s) => s.setActiveSection);
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);
  const setShowUnlockModal = useUIStore((s) => s.setShowUnlockModal);
  const activated = useSettingsStore((s) => s.activated);

  const renderContent = (closeOnNavigate = false) => (
    <>
      <div className="relative px-2 text-center">
        <span className="absolute -left-1 top-2 text-lilac-deep">♡</span>
        <span className="absolute left-8 -top-2 text-lilac-deep">♡</span>
        <img
          src={cloudImg}
          alt=""
          aria-hidden="true"
          loading="lazy"
          width={512}
          height={512}
          className="absolute right-2 top-2 h-8 w-8 object-contain opacity-70"
        />
        <h1 className="font-script text-[2.35rem] leading-tight">
          Pastel
          <br />
          <span className="text-blush-deep">Dream</span>
          <br />
          Journal
        </h1>
        <div className="mx-auto mt-1 h-px w-28 bg-ink/40" />
        <p className="mt-3 font-hand text-[0.7rem] tracking-[0.25em] text-ink-soft">
          BILL TRACKER
        </p>
      </div>

      <nav className="mt-6 space-y-1">
        {NAV_ITEMS.map(({ label, icon: Icon }) => (
          <button
            key={label}
            onClick={() => {
              setActiveSection(label as Section);
              if (closeOnNavigate) setSidebarOpen(false);
            }}
            className={`flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 font-script text-[1.35rem] leading-tight transition-colors ${
              activeSection === label
                ? "bg-lilac-deep/60 text-white shadow-sm"
                : "text-ink hover:bg-white/40"
            }`}
          >
            <Icon className="h-4.5 w-4.5" strokeWidth={1.6} />
            {label}
          </button>
        ))}
      </nav>

      {!activated && (
        <button
          onClick={() => {
            setShowUnlockModal(true);
            if (closeOnNavigate) setSidebarOpen(false);
          }}
          className="mt-4 flex w-full items-center gap-2 rounded-2xl border border-lilac-deep/30 bg-white/30 px-4 py-2.5 font-hand text-sm text-lilac-deep transition-colors hover:bg-white/50"
        >
          <Unlock className="h-4 w-4" strokeWidth={1.6} />
          Unlock Full Version
        </button>
      )}

      <div className="relative mt-6 pt-9">
        <img
          src={washiImg}
          alt=""
          aria-hidden="true"
          loading="lazy"
          width={1600}
          height={320}
          className="absolute left-1/2 top-4 h-9 w-36 -translate-x-1/2 -rotate-2 object-contain opacity-90"
        />
        <div className="relative rotate-[-1.5deg] rounded-sm bg-lilac/80 px-5 py-5 text-center shadow-sm">
          <p className="font-script text-xl leading-snug">
            Small steps
            <br />
            big dreams
            <br />
            bright future
          </p>
          <img
            src={flowerImg}
            alt=""
            loading="lazy"
            width={512}
            height={512}
            className="absolute -bottom-2 right-1 h-10 w-10 object-contain"
          />
        </div>
      </div>
    </>
  );

  return (
    <>
      <aside className="themed-scrollbar hidden h-screen w-64 shrink-0 flex-col overflow-y-auto bg-lilac/70 px-5 py-6 lg:flex">
        {renderContent()}
      </aside>

      <div
        className={`fixed inset-0 z-40 bg-ink/25 transition-opacity lg:hidden ${
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`themed-scrollbar fixed inset-y-0 left-0 z-50 flex w-[min(18rem,88vw)] flex-col overflow-y-auto bg-lilac/90 px-5 py-5 shadow-xl transition-transform duration-300 lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Navigation"
        aria-hidden={!sidebarOpen}
      >
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="mb-4 ml-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/65 text-ink-soft shadow-sm transition-colors hover:bg-white"
          aria-label="Close navigation"
        >
          <X className="h-5 w-5" strokeWidth={1.8} />
        </button>
        {renderContent(true)}
      </aside>
    </>
  );
}
