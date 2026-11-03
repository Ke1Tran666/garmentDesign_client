import { Package } from "lucide-react";

const EmptyState = ({
  icon: Icon = Package,
  title = "Không tìm thấy dữ liệu phù hợp",
  description = "Thử thay đổi từ khóa tìm kiếm hoặc đặt lại các bộ lọc.",
  actionText = "Đặt lại tất cả bộ lọc",
  onAction,
  className = "",
}) => {
  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      <Icon
        size={36}
        className="mx-auto mb-2.5 text-slate-300 dark:text-slate-600"
      />
      <p className="font-semibold text-slate-700 dark:text-slate-300">
        {title}
      </p>
      {description && (
        <p className="mt-1 text-xs text-slate-400">{description}</p>
      )}
      {onAction && actionText && (
        <button
          type="button"
          onClick={onAction}
          className="mt-3.5 inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-brand hover:underline"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
