import { ShoppingBag, TrendingUp } from "lucide-react";

const ServiceMetricsCard = ({ className = "" }) => {
  return (
    <div
      className={`space-y-4 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 dark:border-slate-800">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
          <TrendingUp size={17} className="text-brand" />
          <span>Chỉ số kinh doanh ước tính</span>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
          Đang phát triển
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="mb-1 flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-medium">Doanh số ước tính</span>
            <TrendingUp size={14} className="text-slate-400" />
          </div>
          <span className="mt-1 block text-xs font-semibold text-amber-600 dark:text-amber-400">
            Đang phát triển
          </span>
          <span className="mt-1 block text-[10px] text-slate-400">
            Số liệu thực tế sẽ cập nhật sau
          </span>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="mb-1 flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-medium">Tổng lượt tiếp nhận</span>
            <ShoppingBag size={14} className="text-slate-400" />
          </div>
          <span className="mt-1 block text-xs font-semibold text-amber-600 dark:text-amber-400">
            Đang phát triển
          </span>
          <span className="mt-1 block text-[10px] text-slate-400">
            Đang kết nối hệ thống đơn hàng
          </span>
        </div>
      </div>
    </div>
  );
};

export default ServiceMetricsCard;
