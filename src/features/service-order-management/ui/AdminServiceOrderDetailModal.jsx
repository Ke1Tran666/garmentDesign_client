import { useState } from "react";
import {
  ExternalLink,
  MapPin,
  Package,
  UserRound,
  Wrench,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useNotification } from "@/app/providers/NotificationProvider";
import { serviceOrderApi } from "@/entities/service-order/api/serviceOrderApi";
import FilterSelect from "@/shared/ui/select/FilterSelect";
import {
  formatDate,
  formatPrice,
  getStatusInfo,
  STATUS_SELECT_OPTIONS,
} from "../lib/serviceOrderUtils";

const DetailItem = ({ label, value, className = "" }) => (
  <div className={className}>
    <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
      {label}
    </p>
    <p className="mt-1 text-xs font-medium whitespace-pre-wrap text-slate-800 dark:text-slate-200">
      {value || "Chưa có"}
    </p>
  </div>
);

const DetailSection = ({ icon: Icon, title, children }) => (
  <section className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
    <div className="mb-3 flex items-center gap-2">
      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand/10 text-brand">
        <Icon size={14} />
      </div>
      <h3 className="font-heading text-xs font-bold tracking-wider text-slate-900 uppercase dark:text-white">
        {title}
      </h3>
    </div>
    {children}
  </section>
);

const AdminServiceOrderDetailModal = ({
  open,
  order,
  onClose,
  onStatusChange,
}) => {
  const { showNotification } = useNotification();

  const [overrideStatus, setOverrideStatus] = useState(null);
  const [prevOrderId, setPrevOrderId] = useState(order?.serviceOrderId);
  const [updating, setUpdating] = useState(false);

  if (order?.serviceOrderId !== prevOrderId) {
    setPrevOrderId(order?.serviceOrderId);
    setOverrideStatus(null);
  }

  if (!open || !order) return null;

  const currentStatus = overrideStatus ?? (order?.status || "pending");
  const status = getStatusInfo(currentStatus);
  const address = [order.address?.companyName, order.address?.address]
    .filter(Boolean)
    .join(" - ");
  const quantity = [order.quantity, order.unitType].filter(Boolean).join(" ");

  // Step indicator state
  const stepIndex =
    currentStatus === "completed"
      ? 3
      : currentStatus === "active"
        ? 2
        : currentStatus === "cancelled"
          ? 0
          : 1;

  const handleUpdateStatus = async (newStatus) => {
    try {
      setUpdating(true);
      await serviceOrderApi.update(order.serviceOrderId, { status: newStatus });
      setOverrideStatus(newStatus);
      onStatusChange?.(order.serviceOrderId, newStatus);
      showNotification({
        type: "success",
        title: "Cập nhật thành công",
        message: `Đơn ORD-${order.serviceOrderId} đã chuyển sang "${
          newStatus === "active"
            ? "Đang xử lý"
            : newStatus === "completed"
              ? "Hoàn tất"
              : newStatus === "cancelled"
                ? "Đã hủy"
                : newStatus
        }".`,
      });
    } catch {
      showNotification({
        type: "error",
        title: "Thất bại",
        message: "Không thể đổi trạng thái đơn hàng.",
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-slate-900/60 px-4 py-6 backdrop-blur-xs duration-150 fade-in"
    >
      <div
        role="presentation"
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
      >
        {/* Top accent line */}
        <div className="h-1.5 w-full bg-linear-to-r from-brand via-sky-400 to-indigo-500" />

        {/* Modal Header */}
        <header className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-sm font-bold text-brand">
              ORD
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="font-heading text-lg font-extrabold text-slate-900 dark:text-white">
                  Đơn dịch vụ #{order.serviceOrderId}
                </h2>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${status.className}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                  {status.label}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-400">
                Khởi tạo ngày {formatDate(order.createdAt, true)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </header>

        {/* Workflow Progress Stepper */}
        <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="mx-auto flex max-w-xl items-center justify-between">
            {[
              { num: 1, label: "Tiếp nhận đơn" },
              { num: 2, label: "Đang thiết kế" },
              { num: 3, label: "Nghiệm thu hoàn tất" },
            ].map((step, idx) => {
              const isPast = stepIndex >= step.num;
              const isCurrent = stepIndex === step.num;
              return (
                <div
                  key={idx}
                  className="flex flex-1 items-center last:flex-none"
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                        isPast
                          ? "bg-brand text-white shadow-xs"
                          : "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                      }`}
                    >
                      {step.num}
                    </div>
                    <span
                      className={`mt-1 text-[11px] font-medium ${
                        isCurrent
                          ? "font-bold text-brand"
                          : isPast
                            ? "text-slate-700 dark:text-slate-200"
                            : "text-slate-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {idx < 2 && (
                    <div
                      className={`mx-2 h-0.5 flex-1 transition-all ${
                        stepIndex > step.num
                          ? "bg-brand"
                          : "bg-slate-200 dark:bg-slate-700"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {/* Section: Khách hàng & Dịch vụ */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <DetailSection icon={UserRound} title="Khách hàng">
              <div className="space-y-2">
                <DetailItem label="Họ và tên" value={order.user?.fullName} />
                <DetailItem label="Số điện thoại" value={order.user?.phone} />
                <DetailItem
                  label="Mã người dùng"
                  value={order.user?.userCode || order.user?.idUser}
                />
              </div>
            </DetailSection>

            <DetailSection icon={Wrench} title="Dịch vụ & Sản phẩm">
              <div className="space-y-2">
                <DetailItem
                  label="Tên dịch vụ"
                  value={order.service?.serviceName}
                />
                <DetailItem
                  label="Tên sản phẩm / Mẫu"
                  value={order.productName}
                />
                <DetailItem label="Số lượng yêu cầu" value={quantity} />
              </div>
            </DetailSection>
          </div>

          {/* Section: Chi phí & Thanh toán */}
          <DetailSection icon={Package} title="Chi tiết giá trị đơn hàng">
            <div className="grid grid-cols-3 gap-4">
              <DetailItem
                label="Đơn giá"
                value={formatPrice(order.unitPrice)}
              />
              <DetailItem
                label="Giảm giá"
                value={formatPrice(order.discountAmount || 0)}
              />
              <div>
                <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                  Tổng tiền
                </p>
                <p className="mt-1 text-sm font-extrabold text-brand">
                  {formatPrice(order.totalPrice)}
                </p>
              </div>
            </div>
          </DetailSection>

          {/* Section: Địa chỉ giao nhận */}
          <DetailSection icon={MapPin} title="Địa chỉ giao nhận">
            <DetailItem
              label="Địa chỉ"
              value={address || "Nhận file kỹ thuật số trực tuyến"}
            />
            {order.address?.note && (
              <DetailItem
                label="Ghi chú giao hàng"
                value={order.address.note}
                className="mt-2"
              />
            )}
          </DetailSection>

          {/* Customer notes */}
          <section className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <DetailItem
              label="Yêu cầu kỹ thuật từ khách hàng"
              value={
                order.customerRequest ||
                "Khách hàng không nhập ghi chú bổ sung."
              }
            />
          </section>
        </div>

        {/* Modal Footer with Status Change Dropdown */}
        <footer className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4 sm:flex-row dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex w-full items-center gap-2.5 sm:w-auto">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Đổi trạng thái:
            </span>
            <FilterSelect
              value={currentStatus}
              disabled={updating}
              onValueChange={handleUpdateStatus}
              options={STATUS_SELECT_OPTIONS}
              ariaLabel="Đổi trạng thái đơn hàng"
              className="h-9 w-44"
            />
          </div>

          <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
            <Link
              to={`/admin/service-orders/${order.serviceOrderId}`}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:border-brand/40 hover:bg-slate-50 hover:text-brand dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <span>Mở toàn trang</span>
              <ExternalLink size={13} />
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-xl border border-slate-200 bg-white px-5 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Đóng
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminServiceOrderDetailModal;
