export const PAGE_SIZE = 12;

export const formatPrice = (value) => {
  const price = Number(value);
  if (!Number.isFinite(price)) return "Chưa thiết lập";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price);
};

export const formatDate = (value, includeTime = false) => {
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

export const getOrderStatusValue = (orderOrStatus) => {
  if (!orderOrStatus) return "pending";
  const status = (
    typeof orderOrStatus === "string"
      ? orderOrStatus
      : orderOrStatus?.status || ""
  )
    .trim()
    .toLowerCase();

  if (
    typeof orderOrStatus === "object" &&
    status === "inactive" &&
    orderOrStatus?.deletedAt
  ) {
    return "cancelled";
  }

  if (status === "inactive" || status === "deleted") return "cancelled";
  if (status === "completed" || status === "done") return "completed";
  return status || "pending";
};

export const getStatusInfo = (orderOrStatus) => {
  const status = getOrderStatusValue(orderOrStatus);

  if (status === "pending") {
    return {
      label: "Chờ tiếp nhận",
      className:
        "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900",
      dot: "bg-amber-500",
    };
  }

  if (status === "active") {
    return {
      label: "Đang xử lý",
      className:
        "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900",
      dot: "bg-blue-500",
    };
  }

  if (status === "completed") {
    return {
      label: "Hoàn tất",
      className:
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900",
      dot: "bg-emerald-500",
    };
  }

  if (status === "cancelled") {
    return {
      label: "Đã hủy",
      className:
        "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900",
      dot: "bg-rose-500",
    };
  }

  return {
    label: "Ngừng xử lý",
    className:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
    dot: "bg-slate-400",
  };
};

export const STATUS_FILTER_CHIPS = [
  { id: "all", label: "Tất cả" },
  { id: "pending", label: "Chờ tiếp nhận" },
  { id: "active", label: "Đang xử lý" },
  { id: "completed", label: "Hoàn tất" },
  { id: "cancelled", label: "Đã hủy" },
];

export const STATUS_SELECT_OPTIONS = [
  { value: "pending", label: "Chờ tiếp nhận" },
  { value: "active", label: "Đang xử lý" },
  { value: "completed", label: "Hoàn tất" },
  { value: "cancelled", label: "Hủy đơn hàng" },
];

export const ORDER_SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất trước" },
  { value: "oldest", label: "Cũ nhất trước" },
  { value: "price-desc", label: "Giá cao nhất" },
  { value: "price-asc", label: "Giá thấp nhất" },
];

/**
 * Kiểm tra xem đơn dịch vụ có phải là dịch vụ in sơ đồ hoặc in rập hay không
 */
export const isPrintService = (orderOrService) => {
  if (!orderOrService) return false;
  const name = String(
    orderOrService.service?.serviceName ||
      orderOrService.serviceName ||
      "",
  ).toLowerCase();
  const code = String(
    orderOrService.service?.serviceCode ||
      orderOrService.serviceCode ||
      "",
  ).toUpperCase();
  const unit = String(
    orderOrService.unitType ||
      orderOrService.service?.unitType ||
      "",
  ).toLowerCase();

  return (
    name.includes("in sơ đồ") ||
    name.includes("in rập") ||
    name.includes("in so do") ||
    name.includes("in rap") ||
    code.startsWith("MAR") ||
    code.startsWith("PAT") ||
    unit === "meter" ||
    unit === "mét"
  );
};

/**
 * Trả về đơn vị hiển thị cho số lượng yêu cầu của khách hàng
 * Đối với dịch vụ in sơ đồ/in rập: hiển thị là "bản in" thay vì "meter"
 */
export const getOrderUnitLabel = (orderOrService) => {
  if (isPrintService(orderOrService)) {
    return "bản in";
  }
  return orderOrService?.unitType || "sản phẩm";
};

/**
 * Format số mét in thực tế, hiển thị tối đa 4 chữ số sau dấu phẩy
 */
export const formatMeterCount = (value) => {
  if (value === null || value === undefined || value === "") return "";
  const num = Number(value);
  if (!Number.isFinite(num)) return String(value);
  return new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  }).format(num);
};
