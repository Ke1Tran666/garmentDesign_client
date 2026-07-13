import axios from "axios";
import { memo, useEffect, useMemo, useState } from "react";
import {
  Building2,
  CalendarDays,
  CreditCard,
  FileText,
  LoaderCircle,
  MapPin,
  Package,
  Pencil,
  Save,
  User,
  X,
} from "lucide-react";
import { BASE_URL_API, USER_API } from "@/api/config";

const EMPTY_VALUE = "Chưa có thông tin";

const employeeNameCache = new Map();

const DATE_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const CURRENCY_FORMATTER = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

const hasValue = (value) =>
  value !== null && value !== undefined && value !== "";

const formatDate = (value, includeTime = false) => {
  if (!value) return EMPTY_VALUE;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return includeTime
    ? DATE_TIME_FORMATTER.format(date)
    : DATE_FORMATTER.format(date);
};

const formatCurrency = (value) => {
  if (!hasValue(value)) return EMPTY_VALUE;

  const number = Number(value);

  return Number.isNaN(number)
    ? String(value)
    : CURRENCY_FORMATTER.format(number);
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

    <dd className="mt-1.5 wrap-break-word text-sm font-medium leading-6 text-gray-800">
      {hasValue(value) ? value : EMPTY_VALUE}
    </dd>
  </div>
);

const CardHeader = ({
  icon: Icon,
  title,
  description,
  iconClassName = "bg-gray-100 text-gray-600",
}) => (
  <div className="flex items-center gap-3">
    <div
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${iconClassName}`}
    >
      <Icon size={21} />
    </div>

    <div className="min-w-0">
      <h4 className="font-bold text-gray-950">{title}</h4>

      {description && (
        <p className="mt-0.5 text-xs text-gray-500">
          {description}
        </p>
      )}
    </div>
  </div>
);

const ServiceOrderDetailModal = ({
  open,
  order,
  onClose,
  onUpdated,
  title = "Chi tiết đơn hàng",
}) => {
  const [employeeNames, setEmployeeNames] = useState({});
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");

  const createdBy = order?.createdBy;
  const updatedBy = order?.updatedBy;
  const serviceTags = order?.service?.tags;

  const tags = useMemo(() => {
    if (!serviceTags) return [];

    return String(serviceTags)
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }, [serviceTags]);

    useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (event) => {
        if (event.key !== "Escape") return;

        if (isEditingProduct) {
        setIsEditingProduct(false);
        setEditForm(null);
        setUpdateError("");
        return;
        }

        onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
        document.body.style.overflow = previousOverflow;
        window.removeEventListener("keydown", handleKeyDown);
    };
    }, [open, onClose, isEditingProduct]);

    useEffect(() => {
    if (!open || !order) return undefined;

    const employeeIds = [
        ...new Set([createdBy, updatedBy].filter(Boolean)),
    ];

    const missingIds = employeeIds.filter(
        (id) => !employeeNameCache.has(id)
    );

    if (missingIds.length === 0) {
        return undefined;
    }

    const controller = new AbortController();

    const fetchEmployeeNames = async () => {
        const results = await Promise.allSettled(
        missingIds.map((id) =>
            axios.get(`${USER_API}/${id}`, {
            signal: controller.signal,
            })
        )
        );

        if (controller.signal.aborted) return;

        const loadedNames = {};

        results.forEach((result, index) => {
        const employeeId = missingIds[index];

        const employeeName =
            result.status === "fulfilled"
            ? result.value.data?.fullName || "Không xác định"
            : "Không xác định";

        employeeNameCache.set(employeeId, employeeName);
        loadedNames[employeeId] = employeeName;
        });

        setEmployeeNames((previousNames) => ({
        ...previousNames,
        ...loadedNames,
        }));
    };

    fetchEmployeeNames();

    return () => {
        controller.abort();
    };
    }, [open, createdBy, updatedBy, order]);

  if (!open || !order) return null;

  const user = order.user || {};
  const service = order.service || {};
  const address = order.address || {};
  const statusStyle = getStatusStyle(order.status);

  const orderCode = `ORD-${order.serviceOrderId}`;
  const unitType = order.unitType || service.unitType;

    const getEmployeeName = (employeeId) => {
    if (!employeeId) return EMPTY_VALUE;

    return (
        employeeNames[employeeId] ||
        employeeNameCache.get(employeeId) ||
        "Đang tải..."
    );
    };

  const receiverName = getEmployeeName(createdBy);
  const updaterName = getEmployeeName(updatedBy);

  const handleStartEditProduct = () => {
    setEditForm({
        productName: order.productName || "",
        unitType: order.unitType || service.unitType || "",
        quantity: order.quantity ?? "",
        customerRequest: order.customerRequest || "",
    });

    setUpdateError("");
    setIsEditingProduct(true);
    };

    const handleCancelEditProduct = () => {
    if (updating) return;

    setIsEditingProduct(false);
    setEditForm(null);
    setUpdateError("");
    };

    const handleEditFormChange = (event) => {
    const { name, value } = event.target;

    setEditForm((previousForm) => ({
        ...previousForm,
        [name]: value,
    }));
    };

    const handleUpdateProduct = async (event) => {
    event.preventDefault();

    const productName = editForm?.productName?.trim();
    const unitTypeValue = editForm?.unitType?.trim();
    const quantity = Number(editForm?.quantity);
    const customerRequest =
        editForm?.customerRequest?.trim() || "";

    if (!productName) {
        setUpdateError("Vui lòng nhập tên sản phẩm.");
        return;
    }

    if (!unitTypeValue) {
        setUpdateError("Vui lòng nhập đơn vị tính.");
        return;
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
        setUpdateError("Số lượng phải lớn hơn 0.");
        return;
    }

    try {
        setUpdating(true);
        setUpdateError("");

        const unitPrice = Number(order.unitPrice) || 0;
        const discountAmount = Number(order.discountAmount) || 0;

        const totalPrice = Math.max(
        unitPrice * quantity - discountAmount,
        0
        );

        /*
        * Backend hiện sử dụng PUT và BeanUtils.copyProperties,
        * vì vậy cần gửi đầy đủ dữ liệu của ServiceOrder.
        */
        const payload = {
        serviceOrderId: order.serviceOrderId,

        user: order.user || null,
        service: order.service || null,
        address: order.address || null,

        productName,
        productImage: order.productImage || null,
        customerRequest,
        unitType: unitTypeValue,

        quantity,
        unitPrice: order.unitPrice,
        discountAmount: order.discountAmount,
        totalPrice,

        status: order.status,
        receivedDate: order.receivedDate,
        completedDate: order.completedDate,

        createdBy: order.createdBy,
        updatedBy:
            localStorage.getItem("idUser") || order.updatedBy,

        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        deletedAt: order.deletedAt,
        };

        const response = await axios.put(
        `${BASE_URL_API}/service-orders/${order.serviceOrderId}`,
        payload
        );

        onUpdated?.(response.data);

        setIsEditingProduct(false);
        setEditForm(null);
    } catch (error) {
        console.error("Không thể cập nhật đơn hàng:", error);

        setUpdateError(
        error.response?.data?.message ||
            "Không thể cập nhật đơn hàng. Vui lòng thử lại."
        );
    } finally {
        setUpdating(false);
    }
    };

  return (
    <div
      className="fixed inset-0 z-70 flex items-center justify-center bg-gray-950/45 px-3 py-4 animate-in fade-in duration-150 sm:px-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="service-order-title"
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[96vh] w-[96vw] max-w-360 flex-col overflow-hidden rounded-3xl bg-gray-50 shadow-xl animate-in zoom-in-95 slide-in-from-bottom-2 duration-200 ease-out"
      >
        {/* Header */}
        <header className="relative shrink-0 overflow-hidden border-b border-gray-100 bg-white">
          <div className="absolute inset-x-0 top-0 h-1 bg-brand" />

          <div className="relative flex items-start justify-between gap-5 px-5 pb-5 pt-6 sm:px-7">
            <div className="flex min-w-0 items-start gap-4">
              <div className="hidden h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-brand text-white shadow-sm sm:flex">
                <FileText size={23} />
              </div>

              <div className="min-w-0">
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
            {/* Left content */}
            <main className="min-w-0 space-y-6">
              {/* Product overview */}
                <section
                className={`overflow-hidden rounded-3xl border bg-white shadow-sm transition-colors ${
                    isEditingProduct
                    ? "border-brand/30 ring-4 ring-brand/5"
                    : "border-gray-100"
                }`}
                >
                <div className="grid grid-cols-1 md:grid-cols-[320px_minmax(0,1fr)]">
                    {/* Product image */}
                    <div className="min-h-72 bg-gray-100">
                    {order.productImage ? (
                        <img
                        src={order.productImage}
                        alt={order.productName || "Sản phẩm"}
                        loading="lazy"
                        decoding="async"
                        draggable={false}
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

                    {/* Product information */}
                    <form
                    id="product-edit-form"
                    onSubmit={handleUpdateProduct}
                    className="flex min-w-0 flex-col p-6 sm:p-7"
                    >
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
                            {service.serviceName || "Dịch vụ"}
                        </p>

                        {isEditingProduct ? (
                            <div className="mt-3">
                            <label
                                htmlFor="edit-product-name"
                                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400"
                            >
                                Tên sản phẩm
                            </label>

                            <input
                                id="edit-product-name"
                                type="text"
                                name="productName"
                                value={editForm?.productName || ""}
                                onChange={handleEditFormChange}
                                autoFocus
                                disabled={updating}
                                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-base font-semibold text-gray-900 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10 disabled:bg-gray-50"
                            />
                            </div>
                        ) : (
                            <h3 className="mt-3 text-2xl font-bold leading-tight text-gray-950">
                            {order.productName || "Chưa có tên sản phẩm"}
                            </h3>
                        )}

                        <p className="mt-2 text-sm text-gray-500">
                            Mã đơn hàng{" "}
                            <span className="font-semibold text-gray-800">
                            {orderCode}
                            </span>
                        </p>
                        </div>

                        {/* Actions */}
                        <div className="flex shrink-0 items-center gap-2">
                        {!isEditingProduct && (
                            <>
                            <span
                                className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold ring-1 ring-inset ${statusStyle.badge}`}
                            >
                                <span
                                className={`h-2 w-2 rounded-full ${statusStyle.dot}`}
                                />

                                {order.status || "Đang xử lý"}
                            </span>

                            <button
                                type="button"
                                onClick={handleStartEditProduct}
                                title="Chỉnh sửa thông tin"
                                aria-label="Chỉnh sửa thông tin sản phẩm"
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:border-brand/30 hover:bg-brand-light hover:text-brand"
                            >
                                <Pencil size={17} />
                            </button>
                            </>
                        )}

                        {isEditingProduct && (
                            <>
                            <button
                                type="submit"
                                disabled={updating}
                                className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-brand! px-3.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {updating ? (
                                <LoaderCircle
                                    size={15}
                                    className="animate-spin"
                                />
                                ) : (
                                <Save size={15} />
                                )}

                                {updating ? "Đang cập nhật" : "Cập nhật"}
                            </button>

                            <button
                                type="button"
                                onClick={handleCancelEditProduct}
                                disabled={updating}
                                title="Hủy chỉnh sửa"
                                aria-label="Hủy chỉnh sửa"
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <X size={17} />
                            </button>
                            </>
                        )}
                        </div>
                    </div>

                    <div className="my-6 h-px bg-gray-100" />

                    {isEditingProduct ? (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        {/* Service code */}
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Mã dịch vụ
                            </label>

                            <div className="flex h-11 items-center rounded-xl bg-gray-100 px-3.5 text-sm font-medium text-gray-500">
                            {service.serviceCode || EMPTY_VALUE}
                            </div>
                        </div>

                        {/* Unit type */}
                        <div>
                            <label
                            htmlFor="edit-unit-type"
                            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400"
                            >
                            Đơn vị tính
                            </label>

                            <input
                            id="edit-unit-type"
                            type="text"
                            name="unitType"
                            value={editForm?.unitType || ""}
                            onChange={handleEditFormChange}
                            disabled={updating}
                            placeholder="Ví dụ: meter, cái..."
                            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm font-medium text-gray-900 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10 disabled:bg-gray-50"
                            />
                        </div>

                        {/* Quantity */}
                        <div>
                            <label
                            htmlFor="edit-quantity"
                            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400"
                            >
                            Số lượng
                            </label>

                            <input
                            id="edit-quantity"
                            type="number"
                            name="quantity"
                            min="0.01"
                            step="0.01"
                            value={editForm?.quantity ?? ""}
                            onChange={handleEditFormChange}
                            disabled={updating}
                            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm font-medium text-gray-900 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10 disabled:bg-gray-50"
                            />
                        </div>

                        {/* Created date */}
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Ngày tạo
                            </label>

                            <div className="flex h-11 items-center rounded-xl bg-gray-100 px-3.5 text-sm font-medium text-gray-500">
                            {formatDate(order.createdAt)}
                            </div>
                        </div>

                        {/* Customer request */}
                        <div className="sm:col-span-2">
                            <label
                            htmlFor="edit-customer-request"
                            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400"
                            >
                            Yêu cầu của khách hàng
                            </label>

                            <textarea
                            id="edit-customer-request"
                            name="customerRequest"
                            value={editForm?.customerRequest || ""}
                            onChange={handleEditFormChange}
                            disabled={updating}
                            rows={4}
                            placeholder="Nhập yêu cầu của khách hàng..."
                            className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm leading-6 text-gray-900 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10 disabled:bg-gray-50"
                            />
                        </div>
                        </div>
                    ) : (
                        <>
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
                        </>
                    )}

                    {updateError && (
                        <div
                        role="alert"
                        className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
                        >
                        {updateError}
                        </div>
                    )}
                    </form>
                </div>
                </section>

              {/* Service */}
              <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                <CardHeader
                  icon={FileText}
                  title="Thông tin dịch vụ"
                  description="Chi tiết dịch vụ khách hàng đã lựa chọn"
                  iconClassName="bg-violet-50 text-violet-600"
                />

                <dl className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
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
                </dl>

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

                    {tags.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {tags.map((tag) => (
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
                <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                  <CardHeader
                    icon={User}
                    title="Khách hàng"
                    description="Người đặt dịch vụ"
                    iconClassName="bg-blue-50 text-blue-600"
                  />

                  <dl className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
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

                <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                  <CardHeader
                    icon={MapPin}
                    title="Địa chỉ"
                    description="Địa chỉ tiếp nhận hoặc giao sản phẩm"
                    iconClassName="bg-orange-50 text-orange-600"
                  />

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

            {/* Right sidebar */}
            <aside className="space-y-6 xl:sticky xl:top-0 xl:self-start">
              {/* Payment */}
              <section className="overflow-hidden rounded-3xl bg-gray-950 text-white shadow-sm">
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
                      <dt className="text-sm text-gray-400">
                        Đơn giá
                      </dt>

                      <dd className="text-sm font-semibold">
                        {formatCurrency(order.unitPrice)}
                      </dd>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-sm text-gray-400">
                        Số lượng
                      </dt>

                      <dd className="text-sm font-semibold">
                        {hasValue(order.quantity)
                          ? `${order.quantity} ${unitType || ""}`.trim()
                          : EMPTY_VALUE}
                      </dd>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-sm text-gray-400">
                        Giảm giá
                      </dt>

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
                <CardHeader
                  icon={CalendarDays}
                  title="Thời gian thực hiện"
                  description="Tiến trình đơn hàng"
                  iconClassName="bg-blue-50 text-blue-600"
                />

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
                <CardHeader
                  icon={Building2}
                  title="Thông tin hệ thống"
                  description="Lịch sử của đơn hàng"
                />

                <div className="mt-6">
                  <dl className="grid grid-cols-2 gap-6">
                    <InfoItem
                      label="Người nhận"
                      value={receiverName}
                    />

                    <InfoItem
                      label="Người cập nhật"
                      value={updaterName}
                    />
                  </dl>

                  <div className="my-5 h-px bg-gray-100" />

                  <dl className="grid grid-cols-2 gap-6">
                    <InfoItem
                      label="Thời gian nhận"
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

export default memo(ServiceOrderDetailModal);