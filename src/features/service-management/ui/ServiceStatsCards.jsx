import { CheckCircle2, Layers, SlidersHorizontal, Tag } from "lucide-react";
import { formatPrice } from "../lib/serviceUtils";

const ServiceStatsCards = ({ stats, onFilterStatus }) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {/* Card 1: Total */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onFilterStatus?.("all")}
        onKeyDown={(e) => e.key === "Enter" && onFilterStatus?.("all")}
        className="cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition-all hover:border-brand/40 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Tổng số dịch vụ
          </span>
          <div className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
            <Layers size={17} />
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-2xl font-black text-slate-900 dark:text-white">
            {stats.total ?? 0}
          </span>
          <span className="text-[11px] font-medium text-slate-400">
            mục đang quản lý
          </span>
        </div>
      </div>

      {/* Card 2: Active */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onFilterStatus?.("active")}
        onKeyDown={(e) => e.key === "Enter" && onFilterStatus?.("active")}
        className="cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition-all hover:border-emerald-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Đang cung cấp
          </span>
          <div className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
            <CheckCircle2 size={17} />
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {stats.activeCount ?? 0}
          </span>
          <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:bg-emerald-950/50">
            {stats.activeRate ?? 0}% hoạt động
          </span>
        </div>
      </div>

      {/* Card 3: Inactive */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onFilterStatus?.("inactive")}
        onKeyDown={(e) => e.key === "Enter" && onFilterStatus?.("inactive")}
        className="cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition-all hover:border-amber-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Tạm ngừng
          </span>
          <div className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
            <SlidersHorizontal size={17} />
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {stats.inactiveCount ?? 0}
          </span>
          <span className="text-[11px] font-medium text-slate-400">
            tạm ẩn trên sàn
          </span>
        </div>
      </div>

      {/* Card 4: Avg Price */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Đơn giá trung bình
          </span>
          <div className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <Tag size={17} />
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-xl font-black tracking-tight text-brand">
            {formatPrice(stats.avgPrice)}
          </span>
          <span className="text-[10px] text-slate-400">/ đơn vị</span>
        </div>
      </div>
    </div>
  );
};

export default ServiceStatsCards;
