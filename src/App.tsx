import { useUIStore } from "@/stores/uiStore";
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

export default function App() {
  const activeSection = useUIStore((s) => s.activeSection);

  const page = (() => {
    switch (activeSection) {
      case "Dashboard":        return <Dashboard />;
      case "Bills":            return <Bills />;
      case "Calendar":         return <CalendarView />;
      case "Budget":           return <Budget />;
      case "Yearly Overview":  return <Yearly />;
      case "Backup":           return <Backup />;
      case "Settings":         return <Settings />;
      default:                 return <Dashboard />;
    }
  })();

  return (
    <div className="flex h-screen overflow-hidden bg-paper font-sans text-ink">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        {page}
      </div>
      <AddBillDialog />
      <RecurringEditDialog />
      <RecurringDeleteDialog />
      <UnlockModal />
    </div>
  );
}
