import { Wrench } from "lucide-react";

const ServiceEmptyState = ({ onResetFilters }) => {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <Wrench
        size={32}
        className="mx-auto mb-2 text-slate-300 dark:text-slate-600"
      />
      <p className="font-semibold text-slate-700 dark:text-slate-300">
        Không tìm thấy dịch vụ nào phù hợp với bộ lọc
      </p>
      <p className="mt-1 text-xs text-slate-400">
        Thử thay đổi từ khóa tìm kiếm hoặc đặt lại các bộ lọc.
      </p>
      {onResetFilters && (
        <button
          type="button"
          onClick={onResetFilters}
          className="mt-3 inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-brand hover:underline"
        >
          Đặt lại tất cả bộ lọc
        </button>
      )}
    </div>
  );
};

export default ServiceEmptyState;
