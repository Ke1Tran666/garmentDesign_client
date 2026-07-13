import { useEffect } from "react";
import {
  Building2,
  CalendarDays,
  CreditCard,
  FileText,
  MapPin,
  Package,
  User,
  X,
} from "lucide-react";

const EMPTY_VALUE = "Chưa có thông tin";

const hasValue = (value) =>
  value !== null && value !== undefined && value !== "";

const formatDate = (value, includeTime = false) => {
  if (!value) return EMPTY_VALUE;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(includeTime && {
      hour: "2-digit",
      minute: "2-digit",
    }),
  }).format(date);
};

const formatCurrency = (value) => {
  if (!hasValue(value)) return EMPTY_VALUE;

  const number = Number(value);

  if (Number.isNaN(number)) {
    return String(value);
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(number);
};

const getStatusStyle = (status) => {
  const normalizedStatus = String(status || "").toLowerCase();

  if (
    normalizedStatus.includes("hoàn") ||
    normalizedStatus.includes("complete")
  ) {
    return {
      badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
      dot: "bg-emerald-500",
    };
  }

  if (
    normalizedStatus.includes("hủy") ||
    normalizedStatus.includes("cancel")
  ) {
    return {
      badge: "bg-red-50 text-red-700 ring-red-600/20",
      dot: "bg-red-500",
    };
  }

  if (
    normalizedStatus.includes("chờ") ||
    normalizedStatus.includes("pending")
  ) {
    return {
      badge: "bg-amber-50 text-amber-700 ring-amber-600/20",
      dot: "bg-amber-500",
    };
  }

  return {
    badge: "bg-blue-50 text-blue-700 ring-blue-600/20",
    dot: "bg-blue-500",
  };
};

const InfoItem = ({ label, value, fullWidth = false }) => (
  <div className={fullWidth ? "sm:col-span-2" : ""}>
    <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
      {label}
    </dt>

    <dd className="mt-1.5 wrap=break-words text-sm font-medium leading-6 text-gray-800">
      {hasValue(value) ? value : EMPTY_VALUE}
    </dd>
  </div>
);

const ServiceOrderDetailModal = ({
  open,
  order,
  onClose,
  title = "Chi tiết đơn hàng",
}) => {
  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || !order) return null;

  const user = order.user || {};
  const service = order.service || {};
  const address = order.address || {};
  const statusStyle = getStatusStyle(order.status);

  const orderCode = `ORD-${order.serviceOrderId}`;
  const unitType = order.unitType || service.unitType;

  return (
    <div
      className="fixed inset-0 z-70 flex items-center justify-center bg-gray-950/50 px-3 py-4 backdrop-blur-[2px] sm:px-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="service-order-title"
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[96vh] w-[96vw] max-w-360 flex-col overflow-hidden rounded-3xl bg-gray-50 shadow-2xl"
      >
        {/* Header */}
        <header className="relative shrink-0 overflow-hidden border-b border-gray-100 bg-white">
        {/* Accent phía trên */}
        <div className="absolute inset-x-0 top-0 h-1 bg-brand" />

        {/* Background trang trí */}
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-brand/5 blur-3xl" />

        <div className="relative flex items-start justify-between gap-5 px-3 pb-3 pt-5 sm:px-6">
            {/* Header information */}
            <div className="flex min-w-0 items-start gap-4">
            {/* Icon */}
            <div className="hidden h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-brand text-white shadow-lg shadow-brand/20 sm:flex">
                <FileText size={23} />
            </div>

            <div className="min-w-0">
                {/* Order code and status */}
                <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-lg bg-brand-light px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-brand">
                    {orderCode}
                </span>

                <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyle.badge}`}
                >
                    <span
                    className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}
                    />

                    {order.status || "Đang xử lý"}
                </span>
                </div>

                {/* Title and metadata */}
                <div className="mt-2.5 flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-5">
                <h2
                    id="service-order-title"
                    className="shrink-0 text-xl font-bold tracking-tight text-gray-950 sm:text-2xl"
                >
                    {title}
                </h2>

                <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-gray-500">
                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                    <CalendarDays
                        size={15}
                        className="shrink-0 text-gray-400"
                    />

                    Tạo ngày {formatDate(order.createdAt, true)}
                    </span>

                    <span className="h-1 w-1 shrink-0 rounded-full bg-gray-300" />

                    <span className="truncate">
                    Khách hàng:{" "}
                    <span className="font-semibold text-gray-700">
                        {user.fullName || "Chưa xác định"}
                    </span>
                    </span>

                    {service.serviceName && (
                    <>
                        <span className="hidden h-1 w-1 shrink-0 rounded-full bg-gray-300 xl:block" />

                        <span className="hidden truncate xl:block">
                        Dịch vụ:{" "}
                        <span className="font-semibold text-gray-700">
                            {service.serviceName}
                        </span>
                        </span>
                    </>
                    )}
                </div>
                </div>
            </div>
            </div>

            {/* Close button */}
            <button
            type="button"
            onClick={onClose}
            aria-label="Đóng chi tiết đơn hàng"
            className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
            <X
                size={19}
                className="transition-transform duration-200 group-hover:rotate-90"
            />
            </button>
        </div>
        </header>

        {/* Content */}
        <div className="overflow-y-auto">
        <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 xl:grid-cols-[minmax(0,1fr)_420px]">
            {/* LEFT CONTENT */}
            <main className="min-w-0 space-y-6">
            {/* Product overview */}
            <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-[320px_minmax(0,1fr)]">
                <div className="min-h-72 bg-gray-100">
                    {order.productImage ? (
                    <img
                        src={order.productImage}
                        alt={order.productName || "Sản phẩm"}
                        className="h-full min-h-72 w-full object-cover"
                    />
                    ) : (
                    <div className="flex h-full min-h-72 flex-col items-center justify-center gap-4 text-gray-400">
                        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-sm">
                        <Package size={34} />
                        </div>

                        <span className="text-sm font-medium">
                        Chưa có hình ảnh sản phẩm
                        </span>
                    </div>
                    )}
                </div>

                <div className="flex flex-col p-6 sm:p-7">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
                        {service.serviceName || "Dịch vụ"}
                        </p>

                        <h3 className="mt-3 text-2xl font-bold leading-tight text-gray-950">
                        {order.productName || "Chưa có tên sản phẩm"}
                        </h3>

                        <p className="mt-2 text-sm text-gray-500">
                        Mã đơn hàng{" "}
                        <span className="font-semibold text-gray-800">
                            {orderCode}
                        </span>
                        </p>
                    </div>

                    <span
                        className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold ring-1 ring-inset ${statusStyle.badge}`}
                    >
                        <span
                        className={`h-2 w-2 rounded-full ${statusStyle.dot}`}
                        />

                        {order.status || "Đang xử lý"}
                    </span>
                    </div>

                    <div className="my-6 h-px bg-gray-100" />

                    <dl className="grid grid-cols-2 gap-x-6 gap-y-5">
                    <InfoItem
                        label="Mã dịch vụ"
                        value={service.serviceCode}
                    />

                    <InfoItem
                        label="Đơn vị tính"
                        value={unitType}
                    />

                    <InfoItem
                        label="Số lượng"
                        value={order.quantity}
                    />

                    <InfoItem
                        label="Ngày tạo"
                        value={formatDate(order.createdAt)}
                    />
                    </dl>

                    <div className="mt-auto pt-6">
                    <div className="rounded-2xl bg-brand-light/60 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-brand">
                        Yêu cầu của khách hàng
                        </p>

                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-700">
                        {order.customerRequest || EMPTY_VALUE}
                        </p>
                    </div>
                    </div>
                </div>
                </div>
            </section>

            {/* Service information */}
            <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                    <FileText size={21} />
                </div>

                <div>
                    <h4 className="font-bold text-gray-950">
                    Thông tin dịch vụ
                    </h4>

                    <p className="mt-0.5 text-xs text-gray-500">
                    Chi tiết dịch vụ khách hàng đã lựa chọn
                    </p>
                </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
                <InfoItem
                    label="Tên dịch vụ"
                    value={service.serviceName}
                />

                <InfoItem
                    label="Mã dịch vụ"
                    value={service.serviceCode}
                />

                <InfoItem
                    label="Giá cơ bản"
                    value={formatCurrency(service.basePrice)}
                />
                </div>

                <div className="my-6 h-px bg-gray-100" />

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Mô tả dịch vụ
                    </p>

                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-700">
                    {service.description || EMPTY_VALUE}
                    </p>
                </div>

                <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Tags
                    </p>

                    {service.tags ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                        {String(service.tags)
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter(Boolean)
                        .map((tag) => (
                            <span
                            key={tag}
                            className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
                            >
                            {tag}
                            </span>
                        ))}
                    </div>
                    ) : (
                    <p className="mt-2 text-sm text-gray-500">
                        {EMPTY_VALUE}
                    </p>
                    )}
                </div>
                </div>
            </section>

            {/* Customer and address */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Customer */}
                <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <User size={21} />
                    </div>

                    <div>
                    <h4 className="font-bold text-gray-950">
                        Khách hàng
                    </h4>

                    <p className="mt-0.5 text-xs text-gray-500">
                        Người đặt dịch vụ
                    </p>
                    </div>
                </div>

                <dl className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2">
                    <InfoItem
                    label="Họ và tên"
                    value={user.fullName}
                    />

                    <InfoItem
                    label="Mã khách hàng"
                    value={user.userCode || user.idUser}
                    />

                    <InfoItem
                    label="Giới tính"
                    value={user.gender}
                    />

                    <InfoItem
                    label="Ngày sinh"
                    value={formatDate(user.birthday)}
                    />

                    <InfoItem
                    label="Trạng thái"
                    value={user.status}
                    />
                </dl>
                </section>

                {/* Address */}
                <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                    <MapPin size={21} />
                    </div>

                    <div>
                    <h4 className="font-bold text-gray-950">
                        Địa chỉ
                    </h4>

                    <p className="mt-0.5 text-xs text-gray-500">
                        Địa chỉ tiếp nhận hoặc giao sản phẩm
                    </p>
                    </div>
                </div>

                <dl className="mt-6 space-y-5">
                    <InfoItem
                    label="Tên công ty"
                    value={address.companyName}
                    />

                    <InfoItem
                    label="Địa chỉ chi tiết"
                    value={address.address}
                    />

                    <InfoItem
                    label="Ghi chú"
                    value={address.note}
                    />
                </dl>
                </section>
            </div>
            </main>

            {/* RIGHT SIDEBAR */}
            <aside className="space-y-6 xl:sticky xl:top-0 xl:self-start">
            {/* Payment */}
            <section className="overflow-hidden rounded-3xl bg-gray-950 text-white shadow-lg">
                <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
                        Tổng thanh toán
                    </p>

                    <p className="mt-3 text-3xl font-bold tracking-tight">
                        {formatCurrency(order.totalPrice)}
                    </p>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                    <CreditCard size={23} />
                    </div>
                </div>

                <div className="my-6 h-px bg-white/10" />

                <dl className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                    <dt className="text-sm text-gray-400">Đơn giá</dt>

                    <dd className="text-sm font-semibold">
                        {formatCurrency(order.unitPrice)}
                    </dd>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                    <dt className="text-sm text-gray-400">Số lượng</dt>

                    <dd className="text-sm font-semibold">
                        {hasValue(order.quantity)
                        ? `${order.quantity} ${unitType || ""}`.trim()
                        : EMPTY_VALUE}
                    </dd>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                    <dt className="text-sm text-gray-400">Giảm giá</dt>

                    <dd className="text-sm font-semibold text-emerald-400">
                        {formatCurrency(order.discountAmount)}
                    </dd>
                    </div>
                </dl>
                </div>

                <div className="flex items-center justify-between bg-white/5 px-6 py-4">
                <span className="text-xs text-gray-400">
                    Thành tiền sau giảm giá
                </span>

                <span className="text-sm font-bold text-white">
                    {formatCurrency(order.totalPrice)}
                </span>
                </div>
            </section>

            {/* Timeline */}
            <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <CalendarDays size={21} />
                </div>

                <div>
                    <h4 className="font-bold text-gray-950">
                    Thời gian thực hiện
                    </h4>

                    <p className="mt-0.5 text-xs text-gray-500">
                    Tiến trình đơn hàng
                    </p>
                </div>
                </div>

                <div className="relative mt-7 space-y-8 pl-9">
                <div className="absolute bottom-3 left-2 top-3 w-px bg-gray-200" />

                <div className="relative">
                    <span className="absolute -left-9 top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full border border-blue-200 bg-white">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    </span>

                    <p className="text-xs font-medium text-gray-400">
                    Ngày tiếp nhận
                    </p>

                    <p className="mt-1 text-base font-bold text-gray-900">
                    {formatDate(order.receivedDate)}
                    </p>
                </div>

                <div className="relative">
                    <span className="absolute -left-9 top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full border border-emerald-200 bg-white">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    </span>

                    <p className="text-xs font-medium text-gray-400">
                    Ngày hoàn thành
                    </p>

                    <p className="mt-1 text-base font-bold text-gray-900">
                    {formatDate(order.completedDate)}
                    </p>
                </div>
                </div>
            </section>

                {/* System information */}
                <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-100 text-gray-600">
                    <Building2 size={21} />
                    </div>

                    <div>
                    <h4 className="font-bold text-gray-950">
                        Thông tin hệ thống
                    </h4>

                    <p className="mt-0.5 text-xs text-gray-500">
                        Lịch sử của đơn hàng
                    </p>
                    </div>
                </div>

                <div className="mt-6">
                    {/* Người thực hiện */}
                    <dl className="grid grid-cols-2 gap-6">
                    <InfoItem
                        label="Người tạo"
                        value={order.createdBy}
                    />

                    <InfoItem
                        label="Người cập nhật"
                        value={order.updatedBy}
                    />
                    </dl>

                    <div className="my-5 h-px bg-gray-100" />

                    {/* Thời gian */}
                    <dl className="grid grid-cols-2 gap-6">
                    <InfoItem
                        label="Thời gian tạo"
                        value={formatDate(order.createdAt, true)}
                    />

                    <InfoItem
                        label="Cập nhật gần nhất"
                        value={formatDate(order.updatedAt, true)}
                    />
                    </dl>
                </div>
                </section>
            </aside>
        </div>
        </div>

        {/* Footer */}
        <footer className="flex shrink-0 items-center justify-between gap-4 border-t border-gray-100 bg-white px-5 py-4 sm:px-7">
          <p className="hidden text-xs text-gray-400 sm:block">
            Nhấn phím ESC hoặc bên ngoài để đóng
          </p>

          <button
            type="button"
            onClick={onClose}
            className="ml-auto min-w-28 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700"
          >
            Đóng
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ServiceOrderDetailModal;