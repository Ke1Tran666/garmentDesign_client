import { CheckCircle2, Download, SlidersHorizontal, X } from "lucide-react";

const ServiceBatchActionBar = ({
  selectedCount = 0,
  onBatchActivate,
  onBatchDeactivate,
  onBatchExport,
  onClearSelection,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 animate-in items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 px-5 py-3 text-white shadow-2xl fade-in slide-in-from-bottom-3 dark:border-slate-700 dark:bg-slate-800">
      <span className="text-xs font-semibold">
        Đã chọn <strong className="text-brand">{selectedCount}</strong> dịch vụ
      </span>

      <div className="h-4 w-px bg-slate-700" />

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

      <button
        type="button"
        onClick={onClearSelection}
        className="cursor-pointer rounded-lg p-1 text-slate-400 hover:text-white"
        title="Bỏ chọn tất cả"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default ServiceBatchActionBar;
