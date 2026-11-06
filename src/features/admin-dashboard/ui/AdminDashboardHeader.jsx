import { Download, RefreshCw } from "lucide-react";

export const AdminDashboardHeader = ({
  period = "year",
  onPeriodChange,
  onRefresh,
  onExport,
  refreshing = false,
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex flex-col justify-between gap-4 border-b border-slate-200/60 pb-3 sm:flex-row sm:items-center dark:border-slate-800">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Bảng điều khiển quản trị
          </h1>
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-semibold text-brand dark:bg-brand/20">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
            Live Backend
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Theo dõi hiệu suất vận hành, doanh thu dịch vụ và điều phối luồng đơn
          hàng may mặc.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {/* Period Selector Tabs */}
        <div className="inline-flex items-center rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <button
            type="button"
            onClick={() => onPeriodChange?.("7days")}
            className={`cursor-pointer rounded-lg px-3 py-1.5 transition-all ${
              period === "7days"
                ? "bg-white text-brand shadow-xs dark:bg-slate-700 dark:text-white"
                : "hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            7 ngày
          </button>
          <button
            type="button"
            onClick={() => onPeriodChange?.("30days")}
            className={`cursor-pointer rounded-lg px-3 py-1.5 transition-all ${
              period === "30days"
                ? "bg-white text-brand shadow-xs dark:bg-slate-700 dark:text-white"
                : "hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            30 ngày
          </button>
          <button
            type="button"
            onClick={() => onPeriodChange?.("year")}
            className={`cursor-pointer rounded-lg px-3 py-1.5 transition-all ${
              period === "year"
                ? "bg-white text-brand shadow-xs dark:bg-slate-700 dark:text-white"
                : "hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Năm {currentYear}
          </button>
          <button
            type="button"
            onClick={() => onPeriodChange?.("all")}
            className={`cursor-pointer rounded-lg px-3 py-1.5 transition-all ${
              period === "all"
                ? "bg-white text-brand shadow-xs dark:bg-slate-700 dark:text-white"
                : "hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Tất cả
          </button>
        </div>

        {/* Action buttons */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          title="Làm mới dữ liệu từ Backend"
        >
          <RefreshCw
            size={14}
            className={refreshing ? "animate-spin text-brand" : "text-slate-400"}
          />
          <span className="hidden sm:inline">Làm mới</span>
        </button>

        <button
          type="button"
          onClick={onExport}
          className="flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          title="Xuất báo cáo Excel"
        >
          <Download size={14} className="text-slate-400" />
          <span className="hidden sm:inline">Xuất Excel</span>
        </button>
      </div>
    </div>
  );
};

export default AdminDashboardHeader;
