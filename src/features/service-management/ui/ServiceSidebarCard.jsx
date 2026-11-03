import {
  Calendar,
  Clock,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { formatDate, getStatusInfo } from "../lib/serviceUtils";
import ServiceMetricsCard from "./ServiceMetricsCard";

const ServiceSidebarCard = ({
  isViewMode = false,
  service,
  form,
  onSetFormValue,
  isAdmin = false,
  submitting = false,
  className = "",
}) => {
  const statusInfo = getStatusInfo(isViewMode ? service : { status: form.status });

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Status & Control Card */}
      <div className="space-y-4 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3.5 text-sm font-bold text-slate-900 dark:border-slate-800 dark:text-white">
          <SlidersHorizontal size={17} className="text-brand" />
          <span>Trạng thái dịch vụ</span>
        </div>

        <div>
          <span className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Trạng thái hiện tại
          </span>
          <div
            className={`inline-flex items-center gap-2 rounded-2xl border px-3.5 py-2 text-xs font-bold ${statusInfo.className}`}
          >
            <span className={`h-2 w-2 rounded-full ${statusInfo.dot}`} />
            <span>{statusInfo.label}</span>
          </div>
        </div>

        {/* Change status toggle in Edit mode */}
        {!isViewMode && (
          <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
            <span className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Chuyển đổi trạng thái
            </span>
            <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              <button
                type="button"
                disabled={submitting}
                onClick={() => onSetFormValue?.("status", "active")}
                className={`flex-1 cursor-pointer rounded-lg py-1.5 text-xs font-semibold transition-all ${
                  form.status === "active"
                    ? "bg-white text-emerald-600 shadow-xs dark:bg-slate-700 dark:text-emerald-400"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                Hoạt động
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => onSetFormValue?.("status", "inactive")}
                className={`flex-1 cursor-pointer rounded-lg py-1.5 text-xs font-semibold transition-all ${
                  form.status === "inactive"
                    ? "bg-white text-amber-600 shadow-xs dark:bg-slate-700 dark:text-amber-400"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                Tạm ngừng
              </button>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
              Dịch vụ tạm ngừng sẽ không xuất hiện trong danh sách tạo đơn hàng mới của khách.
            </p>
          </div>
        )}
      </div>

      {/* Estimated Metrics Card */}
      <ServiceMetricsCard />

      {/* Audit & System Metadata Card */}
      {service && (
        <div className="space-y-3.5 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-sm font-bold text-slate-900 dark:border-slate-800 dark:text-white">
            <Clock size={16} className="text-brand" />
            <span>Thông tin nhật ký hệ thống</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="flex items-center gap-1.5">
                <Calendar size={13} />
                <span>Ngày tạo</span>
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {formatDate(service.createdAt)}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-500">
              <span className="flex items-center gap-1.5">
                <Clock size={13} />
                <span>Cập nhật gần nhất</span>
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {formatDate(service.updatedAt || service.createdAt)}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-slate-500 dark:border-slate-800">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-emerald-500" />
                <span>Phân quyền</span>
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {isAdmin ? "Quản trị viên (Admin)" : "Nhân viên (Staff)"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceSidebarCard;
