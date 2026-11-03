export const FALLBACK_SERVICES = [
  {
    serviceId: 1,
    serviceCode: "DES-VEST01",
    serviceName: "Thiết kế may đo Vest Nam Cao Cấp",
    unitType: "Bộ",
    basePrice: 1800000,
    description:
      "Tư vấn phom dáng, dựng rập 3D theo số đo cá nhân hóa và may mẫu thử trước khi hoàn thiện.",
    tags: "May đo cao cấp, Vest nam, Thiết kế 3D",
    status: "active",
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    serviceId: 2,
    serviceCode: "DES-DRESS02",
    serviceName: "Thiết kế Đầm Dạ Hội & Váy Cưới",
    unitType: "Sản phẩm",
    basePrice: 2500000,
    description:
      "Thiết kế độc bản theo yêu cầu, xử lý chất liệu ren đính kết thủ công tinh xảo.",
    tags: "May đo cao cấp, Đầm dạ hội, Váy cưới",
    status: "active",
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    serviceId: 3,
    serviceCode: "DES-UNIFORM03",
    serviceName: "Thiết kế Đồng Phục Doanh Nghiệp",
    unitType: "Bộ",
    basePrice: 650000,
    description:
      "Bộ nhận diện trang phục công sở hiện đại, tiện dụng, độ bền màu cao và tối ưu chi phí may số lượng lớn.",
    tags: "Đồng phục, Công sở, May công nghiệp",
    status: "active",
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    serviceId: 4,
    serviceCode: "DES-3DPATTERN04",
    serviceName: "Dựng Rập & Mô Phỏng 3D CLO",
    unitType: "Mẫu rập",
    basePrice: 500000,
    description:
      "Xuất file rập chuẩn công nghiệp định dạng DXF/PDF kèm mô phỏng độ rủ vải trên phần mềm CLO3D.",
    tags: "Thiết kế 3D, Làm rập, File số",
    status: "active",
    createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
  {
    serviceId: 5,
    serviceCode: "DES-SAMPLE05",
    serviceName: "May Mẫu Thử & Chỉnh Phom Dáng",
    unitType: "Sản phẩm",
    basePrice: 400000,
    description:
      "May thử nghiệm trên vải mộc để kiểm tra cử động, chỉnh sửa thông số rập trước khi cắt vải chính.",
    tags: "May mẫu thử, Chỉnh sửa phom, Kỹ thuật",
    status: "inactive",
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
  {
    serviceId: 6,
    serviceCode: "DES-CONSULT06",
    serviceName: "Tư Vấn Phong Cách & Định Hình BST",
    unitType: "Gói dịch vụ",
    basePrice: 3000000,
    description:
      "Lên moodboard xu hướng, tư vấn bảng màu, lựa chọn chất liệu vải và định hướng phong cách bộ sưu tập.",
    tags: "Tư vấn, Moodboard, Bộ sưu tập",
    status: "active",
    createdAt: new Date(Date.now() - 86400000 * 35).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 12).toISOString(),
  },
];

export const SORT_OPTIONS = [
  { value: "default", label: "Sắp xếp: Mặc định" },
  { value: "price-asc", label: "Giá: Thấp đến cao" },
  { value: "price-desc", label: "Giá: Cao đến thấp" },
  { value: "name", label: "Tên dịch vụ (A-Z)" },
  { value: "updated", label: "Mới cập nhật" },
];

export const STATUS_FILTER_CHIPS = [
  { id: "all", label: "Tất cả" },
  { id: "active", label: "Đang hoạt động" },
  { id: "inactive", label: "Tạm ngừng" },
  { id: "deleted", label: "Đã xóa" },
];

export const formatPrice = (value) => {
  const price = Number(value);
  if (!Number.isFinite(price)) return "Chưa thiết lập";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price);
};

export const formatDate = (value) => {
  if (!value) return "---";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const getStatusInfo = (service) => {
  if (service?.deletedAt) {
    return {
      label: "Đã xóa",
      className:
        "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900",
      dot: "bg-rose-500",
    };
  }

  const status = String(service?.status || "")
    .trim()
    .toLowerCase();
  if (status === "active") {
    return {
      label: "Đang hoạt động",
      className:
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900",
      dot: "bg-emerald-500",
    };
  }

  if (status === "inactive") {
    return {
      label: "Tạm ngừng",
      className:
        "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900",
      dot: "bg-amber-500",
    };
  }

  return {
    label: status || "Chưa xác định",
    className:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
    dot: "bg-slate-400",
  };
};
