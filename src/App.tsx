import { useEffect } from "react";
import { Menu } from "lucide-react";
import { useUIStore } from "@/stores/uiStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { Sidebar } from "@/components/common/Sidebar";
import { AddBillDialog } from "@/components/common/dialogs/AddBillDialog";
import { RecurringEditDialog } from "@/components/common/dialogs/RecurringEditDialog";
import { RecurringDeleteDialog } from "@/components/common/dialogs/RecurringDeleteDialog";
import { UnlockModal } from "@/components/common/dialogs/UnlockModal";
import { Dashboard } from "@/pages/dashboard/Dashboard";
import { Bills } from "@/pages/bills/Bills";
import { CalendarView } from "@/pages/calendar/CalendarView";
import { Budget } from "@/pages/budget/Budget";
import { Yearly } from "@/pages/yearly/Yearly";
import { Backup } from "@/pages/backup/Backup";
import { Settings } from "@/pages/settings/Settings";
import { Management } from "@/pages/management/Management";
import { Expenses } from "@/pages/expenses/Expenses";
import { Income } from "@/pages/income/Income";
import { Reports } from "@/pages/reports/Reports";
import { StartupGuide } from "@/pages/startup-guide/StartupGuide";
import { OnboardingModal } from "@/pages/startup-guide/OnboardingModal";
import { Contact } from "@/pages/contact/Contact";
import { Goals } from "@/pages/goals/Goals";
import { Notes } from "@/pages/notes/Notes";

export default function App() {
  const activeSection = useUIStore((s) => s.activeSection);
  const setActiveSection = useUIStore((s) => s.setActiveSection);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const settings = useSettingsStore((s) => s.settings);

  useEffect(() => {
    const hiddenByMenu = !settings.menuVisible && activeSection !== "Dashboard" && activeSection !== "Settings";
    const hiddenGuide = !settings.quickStartVisible && activeSection === "Startup Guide";
    const hiddenContact = !settings.contactVisible && activeSection === "Contact";
    if (hiddenByMenu || hiddenGuide || hiddenContact) setActiveSection("Dashboard");
  }, [activeSection, setActiveSection, settings.contactVisible, settings.menuVisible, settings.quickStartVisible]);

  const page = (() => {
    switch (activeSection) {
      case "Dashboard":        return <Dashboard />;
      case "Bills":            return <Bills />;
      case "Calendar":         return <CalendarView />;
      case "Budget":           return <Budget />;
      case "Expenses":         return <Expenses />;
      case "Income":           return <Income />;
      case "Reports":          return <Reports />;
      case "Goals":            return <Goals />;
      case "Notes":            return <Notes />;
      case "Yearly Overview":  return <Yearly />;
      case "Backup":           return <Backup />;
      case "Settings":         return <Settings />;
      case "Startup Guide":   return <StartupGuide />;
      case "Contact":         return <Contact />;
      case "Management":       return import.meta.env.VITE_CUSTOMER_BUILD === "true" ? <Dashboard /> : <Management />;
      default:                 return <Dashboard />;
    }
  })();

  return (
    <div className="flex h-screen overflow-hidden bg-paper font-sans text-ink">
      <button
        type="button"
        onClick={toggleSidebar}
        className="fixed left-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-lilac-deep/80 text-white shadow-md transition-colors hover:bg-lilac-deep lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" strokeWidth={1.8} />
      </button>
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        {page}
      </div>
      <AddBillDialog />
      <RecurringEditDialog />
      <RecurringDeleteDialog />
      <UnlockModal />
      <OnboardingModal />
    </div>
  );
}
