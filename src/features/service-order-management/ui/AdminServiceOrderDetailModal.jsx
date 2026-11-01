import { useState } from "react";
import {
  MapPin,
  Package,
  UserRound,
  Wrench,
  X,
} from "lucide-react";
import { serviceOrderApi } from "@/entities/service-order/api/serviceOrderApi";
import { useNotification } from "@/app/providers/NotificationProvider";

const formatPrice = (value) => {
  const price = Number(value);
  if (!Number.isFinite(price)) return "Chưa thiết lập";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price);
};

const formatDate = (value, includeTime = false) => {
  if (!value) return "Chưa có";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
};

const getStatusInfo = (statusString) => {
  const status = String(statusString || "").trim().toLowerCase();
  if (status === "inactive" || status === "deleted") {
    return {
      label: "Đã hủy",
      className: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900",
      dot: "bg-rose-500",
    };
  }
  if (status === "pending") {
    return {
      label: "Chờ tiếp nhận",
      className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900",
      dot: "bg-amber-500",
    };
  }
  if (status === "active") {
    return {
      label: "Đang xử lý",
      className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900",
      dot: "bg-blue-500",
    };
  }
  if (status === "completed") {
    return {
      label: "Hoàn tất",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900",
      dot: "bg-emerald-500",
    };
  }
  return {
    label: "Ngừng xử lý",
    className: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
    dot: "bg-slate-400",
  };
};

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
      <h3 className="font-heading text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
        {title}
      </h3>
    </div>
    {children}
  </section>
);

const AdminServiceOrderDetailModal = ({ open, order, onClose }) => {
  const { showNotification } = useNotification();
  const [currentStatus, setCurrentStatus] = useState(order?.status || "pending");
  const [updating, setUpdating] = useState(false);

  if (!open || !order) return null;

  const status = getStatusInfo(currentStatus);
  const address = [order.address?.companyName, order.address?.address].filter(Boolean).join(" - ");
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
      setCurrentStatus(newStatus);
      showNotification({
        type: "success",
        title: "Cập nhật thành công",
        message: `Đơn ORD-${order.serviceOrderId} đã chuyển sang "${
          newStatus === "active" ? "Đang xử lý" : newStatus === "completed" ? "Hoàn tất" : newStatus
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs px-4 py-6 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 flex flex-col max-h-[90vh]"
      >
        {/* Top accent line */}
        <div className="h-1.5 w-full bg-linear-to-r from-brand via-sky-400 to-indigo-500" />

        {/* Modal Header */}
        <header className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand font-bold text-sm">
              ORD
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="font-heading text-lg font-extrabold text-slate-900 dark:text-white">
                  Đơn dịch vụ #{order.serviceOrderId}
                </h2>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${status.className}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                  {status.label}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Khởi tạo ngày {formatDate(order.createdAt, true)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </header>

        {/* Workflow Progress Stepper */}
        <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-100 dark:bg-slate-800/40 dark:border-slate-800">
          <div className="flex items-center justify-between max-w-xl mx-auto">
            {[
              { num: 1, label: "Tiếp nhận đơn" },
              { num: 2, label: "Đang thiết kế" },
              { num: 3, label: "Nghiệm thu hoàn tất" },
            ].map((step, idx) => {
              const isPast = stepIndex >= step.num;
              const isCurrent = stepIndex === step.num;
              return (
                <div key={idx} className="flex items-center flex-1 last:flex-none">
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
                          ? "text-brand font-bold"
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
                      className={`h-0.5 flex-1 mx-2 transition-all ${
                        stepIndex > step.num ? "bg-brand" : "bg-slate-200 dark:bg-slate-700"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Section: Khách hàng & Dịch vụ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <DetailItem label="Tên dịch vụ" value={order.service?.serviceName} />
                <DetailItem label="Tên sản phẩm / Mẫu" value={order.productName} />
                <DetailItem label="Số lượng yêu cầu" value={quantity} />
              </div>
            </DetailSection>
          </div>

          {/* Section: Chi phí & Thanh toán */}
          <DetailSection icon={Package} title="Chi tiết giá trị đơn hàng">
            <div className="grid grid-cols-3 gap-4">
              <DetailItem label="Đơn giá" value={formatPrice(order.unitPrice)} />
              <DetailItem label="Giảm giá" value={formatPrice(order.discountAmount || 0)} />
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
            <DetailItem label="Địa chỉ" value={address || "Nhận file kỹ thuật số trực tuyến"} />
            {order.address?.note && (
              <DetailItem label="Ghi chú giao hàng" value={order.address.note} className="mt-2" />
            )}
          </DetailSection>

          {/* Customer notes */}
          <section className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <DetailItem
              label="Yêu cầu kỹ thuật từ khách hàng"
              value={order.customerRequest || "Khách hàng không nhập ghi chú bổ sung."}
            />
          </section>
        </div>

        {/* Modal Footer with Status Change Dropdown */}
        <footer className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 px-6 py-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-500">Đổi trạng thái:</span>
            <select
              value={currentStatus}
              disabled={updating}
              onChange={(e) => handleUpdateStatus(e.target.value)}
              className="h-8.5 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:border-brand focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="pending">Chờ tiếp nhận</option>
              <option value="active">Đang xử lý</option>
              <option value="completed">Hoàn tất</option>
              <option value="cancelled">Hủy đơn hàng</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors shadow-2xs"
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
