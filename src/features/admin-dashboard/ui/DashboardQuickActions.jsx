import { PackageCheck, SlidersHorizontal, TrendingUp, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";

export const DashboardQuickActions = () => {
  return (
    <div className="rounded-2xl border border-brand/20 bg-linear-to-r from-brand/5 via-sky-500/5 to-indigo-500/5 p-4 sm:p-5 dark:border-slate-800 dark:from-slate-900 dark:to-slate-900/60">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-white shadow-sm">
            <TrendingUp size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Thao tác quản trị nhanh
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Các phím tắt điều hướng nhanh giúp tối ưu thời gian thao tác hàng ngày.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/admin/users/create"
            className="inline-flex h-8.5 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 hover:text-brand dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <UserPlus size={14} className="text-brand" />
            <span>Thêm người dùng</span>
          </Link>
          <Link
            to="/admin/services"
            className="inline-flex h-8.5 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 hover:text-brand dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <SlidersHorizontal size={14} className="text-indigo-500" />
            <span>Cập nhật bảng giá</span>
          </Link>
          <Link
            to="/admin/service-orders"
            className="inline-flex h-8.5 items-center gap-1.5 rounded-xl bg-brand px-3 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-brand-hover"
          >
            <PackageCheck size={14} />
            <span>Xử lý đơn mới</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardQuickActions;
