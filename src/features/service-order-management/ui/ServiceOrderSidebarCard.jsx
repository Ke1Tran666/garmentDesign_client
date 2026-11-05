import {
  Calendar,
  CreditCard,
  ExternalLink,
  Printer,
  ShieldCheck,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";
import FilterSelect from "@/shared/ui/select/FilterSelect";
import {
  formatDate,
  formatMeterCount,
  formatPrice,
  getOrderStatusValue,
  getOrderUnitLabel,
  getStatusInfo,
  isPrintService,
  STATUS_SELECT_OPTIONS,
} from "../lib/serviceOrderUtils";

const ServiceOrderSidebarCard = ({
  order,
  onStatusChange,
  onOpenPrintModal,
  updating = false,
  className = "",
}) => {
  if (!order) return null;

  const currentStatus = getOrderStatusValue(order);
  const statusInfo = getStatusInfo(currentStatus);
  const isPrint = isPrintService(order);
  const unitLabel = getOrderUnitLabel(order);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Status Management Card */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-brand" />
            <h3 className="font-heading text-sm font-bold tracking-tight text-slate-900 dark:text-white">
              Trạng thái đơn hàng
            </h3>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusInfo.className}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.dot}`} />
            {statusInfo.label}
          </span>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
            Cập nhật trạng thái tiến trình:
          </label>
          <FilterSelect
            value={currentStatus}
            onValueChange={onStatusChange}
            options={STATUS_SELECT_OPTIONS}
            disabled={updating}
            ariaLabel="Chọn trạng thái đơn hàng"
            className="h-10 w-full"
          />
          <p className="text-[11px] text-slate-400">
            Hệ thống sẽ tự động cập nhật tiến độ tương ứng trong quy trình xử lý.
          </p>
        </div>
      </div>

      {/* Customer Info Card */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <User size={18} className="text-brand" />
            <h3 className="font-heading text-sm font-bold tracking-tight text-slate-900 dark:text-white">
              Thông tin khách hàng
            </h3>
          </div>
          {order.user?.idUser && (
            <Link
              to={`/admin/users/${order.user.idUser}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
            >
              <span>Hồ sơ</span>
              <ExternalLink size={12} />
            </Link>
          )}
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand/10 font-bold text-brand">
              {order.user?.fullName?.charAt(0) || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="truncate font-bold text-slate-900 dark:text-white">
                {order.user?.fullName || "Khách hàng"}
              </h4>
              <p className="truncate text-slate-400">
                {order.user?.userCode || `USR-${order.user?.idUser || "---"}`}
              </p>
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-400">Số điện thoại:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {order.user?.phone || "Chưa có"}
              </span>
            </div>
            {order.user?.email && (
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {order.user.email}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment & Financial Card */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <CreditCard size={18} className="text-brand" />
            <h3 className="font-heading text-sm font-bold tracking-tight text-slate-900 dark:text-white">
              Giá trị đơn hàng
            </h3>
          </div>
          {isPrint && onOpenPrintModal && order.status !== "cancelled" && (
            <button
              type="button"
              onClick={onOpenPrintModal}
              className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-brand hover:underline"
            >
              <Printer size={13} />
              <span>{order.meterCount ? "Sửa số mét" : "Nhập số mét"}</span>
            </button>
          )}
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Đơn giá dịch vụ:</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {formatPrice(order.unitPrice)}
              {isPrint ? " / mét" : ` / ${unitLabel}`}
            </span>
          </div>

          {isPrint ? (
            <>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Số bản yêu cầu:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {order.quantity || 1} bản in
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Số mét in thực tế:</span>
                <span className="font-bold text-brand">
                  {order.meterCount
                    ? `${formatMeterCount(order.meterCount)} mét`
                    : "Chưa nhập (đo khi in)"}
                </span>
              </div>
            </>
          ) : (
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Số lượng yêu cầu:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {order.quantity || 1} {unitLabel}
              </span>
            </div>
          )}

          <div className="flex items-baseline justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white">
              Tổng tiền thanh toán:
            </span>
            <span className="font-heading text-lg font-black text-brand">
              {formatPrice(order.totalPrice)}
            </span>
          </div>
        </div>
      </div>

      {/* Metadata Card */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex items-center gap-2">
          <Calendar size={16} className="text-slate-400" />
          <h4 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
            Mốc thời gian
          </h4>
        </div>

        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex justify-between">
            <span>Ngày tiếp nhận:</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {formatDate(order.createdAt, true)}
            </span>
          </div>
          {order.updatedAt && (
            <div className="flex justify-between">
              <span>Cập nhật gần nhất:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {formatDate(order.updatedAt, true)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceOrderSidebarCard;
