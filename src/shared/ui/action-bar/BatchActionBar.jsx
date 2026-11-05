import { X } from "lucide-react";

const BatchActionBar = ({
  selectedCount = 0,
  entityLabel = "mục",
  children,
  onClearSelection,
  className = "",
}) => {
  if (selectedCount === 0) return null;

  return (
    <div
      className={`fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 animate-in items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 px-5 py-3 text-white shadow-2xl fade-in slide-in-from-bottom-3 dark:border-slate-700 dark:bg-slate-800 ${className}`}
    >
      <span className="text-xs font-semibold whitespace-nowrap">
        Đã chọn <strong className="text-brand">{selectedCount}</strong>{" "}
        {entityLabel}
      </span>

      <div className="h-4 w-px bg-slate-700" />

      <div className="flex items-center gap-2">{children}</div>

      {onClearSelection && (
        <button
          type="button"
          onClick={onClearSelection}
          className="cursor-pointer rounded-lg p-1 text-slate-400 hover:text-white"
          title="Bỏ chọn tất cả"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default BatchActionBar;
