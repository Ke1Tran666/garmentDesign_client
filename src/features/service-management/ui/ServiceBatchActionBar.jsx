import { CheckCircle2, Download, SlidersHorizontal } from "lucide-react";
import BatchActionBar from "@/shared/ui/action-bar/BatchActionBar";

const ServiceBatchActionBar = ({
  selectedCount = 0,
  onBatchActivate,
  onBatchDeactivate,
  onBatchExport,
  onClearSelection,
}) => {
  return (
    <BatchActionBar
      selectedCount={selectedCount}
      entityLabel="dịch vụ"
      onClearSelection={onClearSelection}
    >
      <button
        type="button"
        onClick={onBatchActivate}
        className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-emerald-500"
      >
        <CheckCircle2 size={14} />
        <span>Kích hoạt</span>
      </button>

      <button
        type="button"
        onClick={onBatchDeactivate}
        className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-amber-500"
      >
        <SlidersHorizontal size={14} />
        <span>Tạm ngừng</span>
      </button>

      <button
        type="button"
        onClick={onBatchExport}
        className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-slate-700"
      >
        <Download size={14} />
        <span>Xuất Excel ({selectedCount})</span>
      </button>
    </BatchActionBar>
  );
};

export default ServiceBatchActionBar;
