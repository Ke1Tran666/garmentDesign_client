import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Package,
  Printer,
  RefreshCw,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { useNotification } from "@/app/providers/NotificationProvider";
import { serviceOrderApi } from "@/entities/service-order/api/serviceOrderApi";
import {
  CompletePrintOrderModal,
  formatDate,
  formatMeterCount,
  formatPrice,
  getOrderStatusValue,
  getOrderUnitLabel,
  getStatusInfo,
  isPrintService,
  ServiceOrderBasicInfoCard,
  ServiceOrderSidebarCard,
} from "@/features/service-order-management";
import { exportToExcel } from "@/shared/lib/exportUtils";
import ConfirmModal from "@/shared/ui/modal/ConfirmModal";

const ServiceOrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [updating, setUpdating] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Complete Print Order Modal
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printSubmitting, setPrintSubmitting] = useState(false);

  // Delete modal
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        setErrorMessage("");
        let data = null;

        try {
          data = await serviceOrderApi.getById(orderId);
        } catch {
          const all = await serviceOrderApi.getAll();
          if (Array.isArray(all)) {
            data = all.find(
              (o) =>
                String(o.serviceOrderId) === String(orderId) ||
                `ORD-${o.serviceOrderId}` === String(orderId),
            );
          }
        }

        if (!active) return;
        if (data) {
          setOrder(data);
        } else {
          setErrorMessage(`Không tìm thấy đơn dịch vụ #${orderId}.`);
        }
      } catch (err) {
        if (!active) return;
        setErrorMessage(
          err.response?.data?.message || "Không thể tải thông tin đơn dịch vụ.",
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [orderId]);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      let data = null;

      try {
        data = await serviceOrderApi.getById(orderId);
      } catch {
        const all = await serviceOrderApi.getAll();
        if (Array.isArray(all)) {
          data = all.find(
            (o) =>
              String(o.serviceOrderId) === String(orderId) ||
              `ORD-${o.serviceOrderId}` === String(orderId),
          );
        }
      }

      if (data) {
        setOrder(data);
      } else {
        setErrorMessage(`Không tìm thấy đơn dịch vụ #${orderId}.`);
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || "Không thể tải thông tin đơn dịch vụ.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (!order) return;
    const code = `ORD-${order.serviceOrderId}`;
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 1800);
    } catch {
      // ignore
    }
  };

  const isPrint = isPrintService(order);

  const handleStatusChange = async (newStatus) => {
    if (!order) return;

    // Nếu là dịch vụ in sơ đồ/in rập và chuyển sang hoàn tất -> mở modal nhập số mét
    if (newStatus === "completed" && isPrint) {
      setPrintModalOpen(true);
      return;
    }

    try {
      setUpdating(true);
      const updated = await serviceOrderApi.updateByAdmin(order.serviceOrderId, {
        status: newStatus,
      });
      setOrder(updated || { ...order, status: newStatus });
      showNotification({
        type: "success",
        title: "Cập nhật tiến trình",
        message: `Đơn ORD-${order.serviceOrderId} đã chuyển trạng thái sang "${
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
        message: "Không thể cập nhật trạng thái đơn dịch vụ.",
      });
    } finally {
      setUpdating(false);
    }
  };

  // Confirm Complete Print with actual meters
  const handleConfirmPrintComplete = async ({ meterCount, totalPrice }) => {
    if (!order) return;
    try {
      setPrintSubmitting(true);
      const updated = await serviceOrderApi.updateByAdmin(order.serviceOrderId, {
        status: "completed",
        meterCount,
        totalPrice,
      });
      setOrder(
        updated || {
          ...order,
          status: "completed",
          meterCount,
          totalPrice,
        },
      );
      setPrintModalOpen(false);
      showNotification({
        type: "success",
        title: "Hoàn tất in đơn hàng",
        message: `Đơn ORD-${order.serviceOrderId} đã hoàn tất với ${formatMeterCount(meterCount)} mét in (Tổng tiền: ${formatPrice(totalPrice)}).`,
      });
    } catch {
      showNotification({
        type: "error",
        title: "Thất bại",
        message: "Không thể cập nhật số mét và hoàn tất đơn hàng.",
      });
    } finally {
      setPrintSubmitting(false);
    }
  };

  const handleExport = () => {
    if (!order) return;
    const exportData = [
      {
        "Mã đơn": `ORD-${order.serviceOrderId}`,
        "Khách hàng": order.user?.fullName || "---",
        "Số điện thoại": order.user?.phone || "---",
        "Mã khách hàng": order.user?.userCode || "---",
        "Sản phẩm / Mẫu": order.productName || "---",
        "Dịch vụ": order.service?.serviceName || "---",
        "Số lượng yêu cầu": `${order.quantity || 1} ${getOrderUnitLabel(order)}`,
        "Số mét in thực tế": order.meterCount
          ? `${formatMeterCount(order.meterCount)} mét`
          : "---",
        "Tổng tiền": formatPrice(order.totalPrice),
        "Trạng thái": getStatusInfo(order).label,
        "Ngày tạo": formatDate(order.createdAt, true),
      },
    ];

    const success = exportToExcel(
      exportData,
      `Don_Dich_Vu_ORD_${order.serviceOrderId}`,
      "OrderDetail",
    );
    if (success) {
      showNotification({
        type: "success",
        title: "Xuất dữ liệu thành công",
        message: `Đơn ORD-${order.serviceOrderId} đã được tải về.`,
      });
    }
  };

  const handleDelete = async () => {
    if (!order) return;
    try {
      setDeleting(true);
      await serviceOrderApi.removeByAdmin(order.serviceOrderId);
      showNotification({
        type: "success",
        title: "Đã xóa đơn hàng",
        message: `Đơn ORD-${order.serviceOrderId} đã được xóa thành công.`,
      });
      navigate("/admin/service-orders");
    } catch (error) {
      showNotification({
        type: "error",
        title: "Xóa thất bại",
        message: error.response?.data?.message || "Không thể xóa đơn hàng.",
      });
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center text-slate-400">
        <RefreshCw size={28} className="mb-3 animate-spin text-brand" />
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          Đang tải thông tin chi tiết đơn dịch vụ...
        </p>
      </div>
    );
  }

  if (errorMessage && !order) {
    return (
      <div className="space-y-4 rounded-3xl border border-rose-200 bg-rose-50/60 p-8 text-center dark:border-rose-900/60 dark:bg-rose-950/30">
        <AlertCircle size={36} className="mx-auto text-rose-500" />
        <h3 className="font-heading text-lg font-bold text-rose-800 dark:text-rose-300">
          {errorMessage}
        </h3>
        <button
          type="button"
          onClick={() => navigate("/admin/service-orders")}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
        >
          <ArrowLeft size={14} />
          <span>Về danh sách đơn dịch vụ</span>
        </button>
      </div>
    );
  }

  const currentStatus = getOrderStatusValue(order);
  const statusInfo = getStatusInfo(currentStatus);

  return (
    <div className="animate-in space-y-6 duration-200 fade-in">
      {/* Top Navigation & Actions Bar */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200/80 pb-3 sm:flex-row sm:items-center dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate("/admin/service-orders")}
            className="group flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:border-brand/40 hover:bg-slate-50 hover:text-brand dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <ArrowLeft size={15} />
            <span>Quay lại</span>
          </button>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
            ORD-{order.serviceOrderId}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {currentStatus === "pending" && (
            <button
              type="button"
              disabled={updating}
              onClick={() => handleStatusChange("active")}
              className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl bg-brand! px-3.5 text-xs font-bold text-white! shadow-xs transition-colors hover:bg-brand-hover!"
            >
              <Package size={14} />
              <span>Tiếp nhận đơn hàng</span>
            </button>
          )}

          {currentStatus === "active" && (
            isPrint ? (
              <button
                type="button"
                disabled={updating}
                onClick={() => setPrintModalOpen(true)}
                className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-emerald-500"
              >
                <Printer size={14} />
                <span>Nhập số mét & Hoàn tất</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={updating}
                onClick={() => handleStatusChange("completed")}
                className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-emerald-500"
              >
                <CheckCircle2 size={14} />
                <span>Hoàn tất nghiệm thu</span>
              </button>
            )
          )}

          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            title="Làm mới thông tin"
          >
            <RefreshCw
              size={14}
              className={loading ? "animate-spin text-brand" : "text-slate-400"}
            />
            <span className="hidden sm:inline">Làm mới</span>
          </button>

          <button
            type="button"
            onClick={handleExport}
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            title="Xuất file Excel"
          >
            <Download size={14} className="text-slate-400" />
            <span className="hidden sm:inline">Xuất Excel</span>
          </button>

          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-rose-200 px-3 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-400 dark:hover:bg-rose-950/40"
            title="Xóa đơn hàng"
          >
            <Trash2 size={14} />
            <span className="hidden sm:inline">Xóa đơn</span>
          </button>
        </div>
      </div>

      {/* Main Header Banner Card */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand shadow-xs dark:bg-brand/20">
              <ShoppingBag size={26} />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="truncate font-heading text-xl font-extrabold text-slate-900 sm:text-2xl dark:text-white">
                  Đơn dịch vụ #{order.serviceOrderId}
                </span>

                <div className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <span>ORD-{order.serviceOrderId}</span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="cursor-pointer p-0.5 text-slate-400 transition-colors hover:text-brand"
                    title={copiedCode ? "Đã sao chép!" : "Sao chép mã đơn"}
                  >
                    {copiedCode ? (
                      <Check size={12} className="stroke-3 text-emerald-500" />
                    ) : (
                      <Copy size={12} />
                    )}
                  </button>
                </div>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${statusInfo.className}`}
                >
                  <span className={`h-2 w-2 rounded-full ${statusInfo.dot}`} />
                  {statusInfo.label}
                </span>
              </div>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Sản phẩm:{" "}
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {order.productName || "Sản phẩm may mặc"}
                </span>{" "}
                • Dịch vụ:{" "}
                <span className="font-semibold text-brand">
                  {order.service?.serviceName || "Dịch vụ rập"}
                </span>{" "}
                {isPrint && order.meterCount ? (
                  <>
                    • Đã in:{" "}
                    <span className="font-bold text-brand">
                      {formatMeterCount(order.meterCount)} mét
                    </span>{" "}
                  </>
                ) : null}
                • Tổng giá trị:{" "}
                <span className="font-extrabold text-brand">
                  {formatPrice(order.totalPrice)}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Unified Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Main Info Card */}
        <ServiceOrderBasicInfoCard
          order={order}
          onOpenPrintModal={() => setPrintModalOpen(true)}
          className="lg:col-span-2"
        />

        {/* Right Col: Sidebar Card */}
        <ServiceOrderSidebarCard
          order={order}
          onStatusChange={handleStatusChange}
          onOpenPrintModal={() => setPrintModalOpen(true)}
          updating={updating}
        />
      </div>

      {/* Complete Print Order Modal (Nhập số mét in thực tế) */}
      <CompletePrintOrderModal
        open={printModalOpen}
        order={order}
        onClose={() => setPrintModalOpen(false)}
        onConfirm={handleConfirmPrintComplete}
        submitting={printSubmitting}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        open={deleteOpen}
        title="Xóa đơn dịch vụ"
        confirmText="Xác nhận xóa"
        confirmVariant="danger"
        submitting={deleting}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      >
        <p>
          Bạn có chắc chắn muốn xóa đơn dịch vụ{" "}
          <strong className="text-slate-900 dark:text-white">
            ORD-{order.serviceOrderId}
          </strong>
          ? Thao tác này sẽ xóa vĩnh viễn đơn hàng khỏi cơ sở dữ liệu.
        </p>
      </ConfirmModal>
    </div>
  );
};

export default ServiceOrderDetailPage;
