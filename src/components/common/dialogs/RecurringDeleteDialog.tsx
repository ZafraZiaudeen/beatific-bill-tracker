import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useBillStore } from "@/stores/billStore";
import { useUIStore } from "@/stores/uiStore";

export function RecurringDeleteDialog() {
  const deleteTarget = useUIStore((s) => s.deleteTarget);
  const setDeleteTarget = useUIStore((s) => s.setDeleteTarget);
  const deleteBillById = useBillStore((s) => s.deleteBillById);
  const deleteSeries = useBillStore((s) => s.deleteSeries);

  if (!deleteTarget) return null;

  return (
    <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
      <DialogContent className="max-w-sm rounded-3xl border-0 bg-paper p-0 shadow-xl">
        <div className="p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="font-script text-2xl text-ink">
              Delete Bill
            </DialogTitle>
          </DialogHeader>
          <p className="mb-5 font-hand text-sm text-ink-soft">
            "{deleteTarget.name}" is a recurring bill. What would you like to
            delete?
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                deleteBillById(deleteTarget.id);
                setDeleteTarget(null);
              }}
              className="rounded-2xl bg-blush/30 px-4 py-3 text-left font-hand text-sm text-blush-deep hover:bg-blush/50"
            >
              🗑️ Delete only this occurrence
            </button>
            <button
              onClick={() => {
                deleteSeries(deleteTarget.seriesId);
                setDeleteTarget(null);
              }}
              className="rounded-2xl bg-blush-deep/20 px-4 py-3 text-left font-hand text-sm text-blush-deep hover:bg-blush-deep/30"
            >
              ⚠️ Delete entire series (all unpaid)
            </button>
          </div>
          <button
            onClick={() => setDeleteTarget(null)}
            className="mt-3 w-full rounded-full border border-ink/15 bg-white/60 py-2 font-hand text-sm text-ink-soft hover:bg-ink/5"
          >
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
