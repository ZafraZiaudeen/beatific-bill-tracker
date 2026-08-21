import { useBillStore } from "@/stores/billStore";
import { useSettingsStore } from "@/stores/settingsStore";

export function useBackup() {
  const bills = useBillStore((s) => s.bills);
  const importBills = useBillStore((s) => s.importBills);
  const resetBillsToDefaults = useBillStore((s) => s.resetToDefaults);

  const settings = useSettingsStore((s) => s.settings);
  const billGroups = useSettingsStore((s) => s.billGroups);
  const budgetLimits = useSettingsStore((s) => s.budgetLimits);
  const monthlyNotes = useSettingsStore((s) => s.monthlyNotes);
  const activated = useSettingsStore((s) => s.activated);
  const importData = useSettingsStore((s) => s.importData);
  const resetSettingsToDefaults = useSettingsStore((s) => s.resetToDefaults);

  const exportJSON = () => {
    const data = {
      settings,
      bills,
      billGroups,
      monthlyNotes,
      budgetLimits,
      _activated: activated,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pdj-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const raw = JSON.parse(e.target!.result as string);
        if (raw.bills)
          importBills(raw.bills as Record<string, unknown>[]);
        importData({
          settings: raw.settings,
          billGroups: raw.billGroups,
          monthlyNotes: raw.monthlyNotes,
          budgetLimits: raw.budgetLimits,
          _activated: raw._activated,
        });
        alert("Data imported successfully!");
      } catch {
        alert("Invalid backup file.");
      }
    };
    reader.readAsText(file);
  };

  const exportCSV = () => {
    const headers = [
      "Name",
      "Category",
      "Type",
      "Priority",
      "Frequency",
      "Amount",
      "Actual Amount",
      "Due Date",
      "Actual Date",
      "Paid",
      "Notes",
    ];
    const rows = bills.map((b) => [
      b.name,
      b.category,
      b.type,
      settings.priorityNames[b.priority] ?? String(b.priority),
      b.frequency,
      b.amount,
      b.actualAmount ?? "",
      b.dueDate,
      b.actualDate ?? "",
      b.paid ? "Yes" : "No",
      b.notes,
    ]);
    const csv = [headers, ...rows]
      .map((r) =>
        r.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "pdj-bills.csv";
    a.click();
  };

  const clearAll = () => {
    if (
      !window.confirm(
        "Delete ALL bills and reset to defaults? This cannot be undone.",
      )
    )
      return;
    resetBillsToDefaults();
    resetSettingsToDefaults();
  };

  return { exportJSON, importJSON, exportCSV, clearAll };
}
