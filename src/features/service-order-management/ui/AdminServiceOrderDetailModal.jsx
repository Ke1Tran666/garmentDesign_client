import {
  CalendarDays,
  MapPin,
  Package,
  UserRound,
  Wrench,
  X,
} from "lucide-react";

const formatPrice = (value) => {
  const price = Number(value);

  if (!Number.isFinite(price)) {
    return "Chưa thiết lập";
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price);
};

const formatDate = (value, includeTime = false) => {
  if (!value) return "Chưa có";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(includeTime
      ? {
          hour: "2-digit",
          minute: "2-digit",
        }
      : {}),
  }).format(date);
};

const getStatusInfo = (order) => {
  const status = String(order?.status || "")
    .trim()
    .toLowerCase();

  if (status === "inactive" && order?.deletedAt) {
    return {
      label: "Đã hủy",
      className: "bg-danger-soft text-danger",
    };
  }

  if (status === "pending") {
    return {
      label: "Chờ tiếp nhận",
      className: "bg-warning-soft text-warning",
    };
  }

  if (status === "active") {
    return {
      label: "Đang xử lý",
      className: "bg-info-soft text-info",
    };
  }

  if (status === "inactive") {
    return {
      label: "Ngừng xử lý",
      className: "bg-surface-muted text-text-muted",
    };
  }

  return {
    label: status || "Chưa xác định",
    className: "bg-surface-muted text-text-muted",
  };
};

const DetailItem = ({ label, value, className = "" }) => (
  <div className={className}>
    <p className="text-xs font-medium tracking-wide text-text-subtle uppercase">
      {label}
    </p>

    <p className="mt-1 text-sm font-medium whitespace-pre-wrap text-text-default">
      {value || "Chưa có"}
    </p>
  </div>
);

const DetailSection = ({ icon: Icon, title, children }) => (
  <section className="rounded-xl border border-border-subtle p-4">
    <div className="mb-4 flex items-center gap-2">
      <Icon size={18} className="shrink-0 text-brand" aria-hidden="true" />

      <h3 className="font-semibold text-text-strong">{title}</h3>
    </div>

    {children}
  </section>
);

const AdminServiceOrderDetailModal = ({ open, order, onClose }) => {
  if (!open || !order) return null;

  const status = getStatusInfo(order);

  const address = [order.address?.companyName, order.address?.address]
    .filter(Boolean)
    .join(" - ");

  const quantity = [order.quantity, order.unitType]
    .filter((value) => value !== undefined && value !== null && value !== "")
    .join(" ");

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="service-order-detail-title"
      onClick={onClose}
      className="fixed inset-0 z-70 flex items-center justify-center bg-black/40 px-4 py-6"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-2xl"
      >
        <div className="h-1 w-full bg-brand" />

        <header className="flex items-start justify-between border-b border-border-subtle px-5 py-4 sm:px-6">
          <div className="min-w-0 pr-4">
            <div className="flex flex-wrap items-center gap-3">
              <h2
                id="service-order-detail-title"
                className="text-lg font-bold text-text-strong"
              >
                Chi tiết đơn ORD-
                {order.serviceOrderId}
              </h2>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className} `}
              >
                {status.label}
              </span>
            </div>

            <p className="mt-1 text-sm text-text-muted">
              Thông tin chi tiết của đơn dịch vụ.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="group flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-text-muted transition hover:bg-danger-soft hover:text-danger"
          >
            <X
              size={19}
              className="transition-transform duration-300 group-hover:rotate-180"
            />
          </button>
        </header>

        <div className="max-h-[75vh] space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
          <DetailSection icon={UserRound} title="Khách hàng">
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailItem label="Họ và tên" value={order.user?.fullName} />

              <DetailItem
                label="Mã người dùng"
                value={order.user?.userCode || order.user?.idUser}
              />
            </div>
          </DetailSection>

          <DetailSection icon={Wrench} title="Thông tin dịch vụ">
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailItem
                label="Tên dịch vụ"
                value={order.service?.serviceName}
              />

              <DetailItem
                label="Mã dịch vụ"
                value={
                  order.service?.serviceCode ||
                  (order.service?.serviceId
                    ? `#${order.service.serviceId}`
                    : "")
                }
              />

              <DetailItem label="Tên sản phẩm" value={order.productName} />

              <DetailItem label="Số lượng" value={quantity} />
            </div>
          </DetailSection>

          <DetailSection icon={Package} title="Giá trị đơn hàng">
            <div className="grid gap-4 sm:grid-cols-3">
              <DetailItem
                label="Đơn giá"
                value={formatPrice(order.unitPrice)}
              />

              <DetailItem
                label="Giảm giá"
                value={formatPrice(order.discountAmount)}
              />

              <DetailItem
                label="Tổng tiền"
                value={formatPrice(order.totalPrice)}
              />
            </div>
          </DetailSection>

          <DetailSection icon={MapPin} title="Địa chỉ nhận hàng">
            <DetailItem label="Địa chỉ" value={address} />

            {order.address?.note && (
              <DetailItem
                label="Ghi chú địa chỉ"
                value={order.address.note}
                className="mt-4"
              />
            )}
          </DetailSection>

          <DetailSection icon={CalendarDays} title="Thời gian xử lý">
            <div className="grid gap-4 sm:grid-cols-3">
              <DetailItem
                label="Ngày tạo"
                value={formatDate(order.createdAt, true)}
              />

              <DetailItem
                label="Ngày tiếp nhận"
                value={formatDate(order.receivedDate)}
              />

              <DetailItem
                label="Ngày hoàn thành"
                value={formatDate(order.completedDate)}
              />
            </div>
          </DetailSection>

          <section className="rounded-xl border border-border-subtle p-4">
            <DetailItem
              label="Yêu cầu của khách hàng"
              value={
                order.customerRequest ||
                "Khách hàng không nhập yêu cầu bổ sung."
              }
            />

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <DetailItem label="Người tiếp nhận" value={order.createdBy} />

              <DetailItem label="Người cập nhật" value={order.updatedBy} />
            </div>
          </section>
        </div>

        <footer className="flex justify-end border-t border-border-subtle px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-brand! px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Đóng
          </button>
        </footer>
      </div>
    </div>
  );
};

export default AdminServiceOrderDetailModal;
