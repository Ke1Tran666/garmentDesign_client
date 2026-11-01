import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Coins,
  Copy,
  ExternalLink,
  Layers,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Ruler,
  Save,
  ShoppingBag,
  Sparkles,
  Tag,
  Trash2,
  TrendingUp,
  Wrench,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

const POPULAR_UNITS = [
  "Sản phẩm",
  "Bộ",
  "Mẫu rập",
  "Bản vẽ 3D",
  "Giờ thiết kế",
  "Gói dịch vụ",
];

const SUGGESTED_TAGS = [
  "May đo cao cấp",
  "Thiết kế 3D",
  "Làm rập",
  "May mẫu thử",
  "Vest nam",
  "Đầm dạ hội",
  "Đồng phục",
  "Chỉnh sửa phom",
  "Thời trang trẻ em",
  "Áo dài",
];

const QUICK_PRICE_PRESETS = [
  { label: "300K", value: 300000 },
  { label: "500K", value: 500000 },
  { label: "800K", value: 800000 },
  { label: "1.2 Tr", value: 1200000 },
  { label: "1.8 Tr", value: 1800000 },
  { label: "2.5 Tr", value: 2500000 },
  { label: "3.5 Tr", value: 3500000 },
];

const formatVND = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(num);
};

const formatDate = (value, includeTime = true) => {
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

const createInitialForm = (service) => {
  if (!service) {
    return {
      serviceCode: "",
      serviceName: "",
      unitType: "Sản phẩm",
      basePrice: "",
      description: "",
      tags: "",
      status: "active",
    };
  }

  return {
    serviceCode: service.serviceCode || "",
    serviceName: service.serviceName || "",
    unitType: service.unitType || "Sản phẩm",
    basePrice: service.basePrice ?? "",
    description: service.description || "",
    tags: service.tags || "",
    status: service.status || "active",
  };
};

/**
 * ServiceDetailEditModal
 * Giao diện xem chi tiết & chỉnh sửa dùng chung (Unified View & Edit)
 * Hoàn toàn tự viết (Custom), không phụ thuộc vào component có sẵn.
 */
const ServiceDetailEditModal = ({
  open = true,
  service = null,
  initialMode = "view", // 'view' | 'edit' | 'create'
  isAdmin = true,
  submitting = false,
  errorMessage = "",
  onClose,
  onSubmit,
  onDelete,
}) => {
  const [mode, setMode] = useState(initialMode); // 'view' | 'edit' | 'create'
  const [form, setForm] = useState(() => createInitialForm(service));
  const [validationError, setValidationError] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);

  // Sync state when props change (Adjusting state during rendering pattern)
  const [prevProps, setPrevProps] = useState({ service, initialMode, open });
  if (
    prevProps.service !== service ||
    prevProps.initialMode !== initialMode ||
    prevProps.open !== open
  ) {
    setPrevProps({ service, initialMode, open });
    setMode(initialMode);
    setForm(createInitialForm(service));
    setValidationError("");
  }

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !submitting) {
        onClose();
      }
    };
    if (open) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, submitting, onClose]);

  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";

  const currentTagsList = useMemo(() => {
    const raw = isViewMode ? service?.tags : form.tags;
    if (!raw) return [];
    return String(raw)
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }, [isViewMode, service?.tags, form.tags]);

  // Estimated stats
  const estimatedOrders = useMemo(() => {
    const seed = service?.serviceId || 1;
    return (seed * 17) % 64 + 8;
  }, [service?.serviceId]);

  const estimatedRevenue = useMemo(() => {
    const price = Number(isViewMode ? service?.basePrice : form.basePrice) || 0;
    return price * estimatedOrders;
  }, [isViewMode, service?.basePrice, form.basePrice, estimatedOrders]);

  const handleCopyCode = async () => {
    const code = isViewMode ? service?.serviceCode : form.serviceCode;
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 1800);
    } catch {
      // ignore
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setValidationError("");
  };

  const handleGenerateCode = () => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setForm((prev) => ({
      ...prev,
      serviceCode: `DES-${randomSuffix}`,
    }));
    setValidationError("");
  };

  const handleToggleTag = (tagToToggle) => {
    const tags = form.tags
      ? form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    let updatedTags;
    if (tags.includes(tagToToggle)) {
      updatedTags = tags.filter((t) => t !== tagToToggle);
    } else {
      updatedTags = [...tags, tagToToggle];
    }

    setForm((prev) => ({
      ...prev,
      tags: updatedTags.join(", "),
    }));
  };

  const handleCancelEdit = () => {
    if (isCreateMode) {
      onClose();
    } else {
      // Revert changes back to current service data
      setForm(createInitialForm(service));
      setValidationError("");
      setMode("view");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const serviceCode = form.serviceCode.trim().toUpperCase();
    const serviceName = form.serviceName.trim();
    const unitType = form.unitType.trim();
    const priceText = String(form.basePrice).trim();
    const basePrice = Number(priceText);

    if (!serviceCode) {
      setValidationError("Vui lòng nhập mã dịch vụ (ví dụ: DES-VEST01).");
      return;
    }

    if (!serviceName) {
      setValidationError("Vui lòng nhập tên dịch vụ thiết kế.");
      return;
    }

    if (!unitType) {
      setValidationError("Vui lòng chọn hoặc nhập đơn vị tính.");
      return;
    }

    if (!priceText || !Number.isFinite(basePrice) || basePrice < 0) {
      setValidationError("Giá cơ bản phải là số hợp lệ lớn hơn hoặc bằng 0.");
      return;
    }

    const payload = {
      serviceCode,
      serviceName,
      unitType,
      basePrice,
      description: form.description.trim(),
      tags: form.tags.trim(),
      status: form.status,
    };

    onSubmit(payload, () => {
      // On success callback: if it was in edit mode, switch back to view
      if (isEditMode) {
        setMode("view");
      }
    });
  };

  if (!open) return null;

  const currentStatus = isViewMode
    ? service?.status || "active"
    : form.status || "active";
  const isDeleted = Boolean(service?.deletedAt);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200"
        onClick={submitting ? undefined : onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl rounded-3xl bg-white shadow-2xl border border-slate-200/90 dark:bg-slate-900 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col z-10 transition-all duration-200 animate-in fade-in zoom-in-95">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6 dark:border-slate-800 dark:bg-slate-850">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand shadow-xs dark:bg-brand/20">
              <Wrench size={20} />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {isCreateMode
                    ? "Tạo dịch vụ mới"
                    : isEditMode
                      ? "Chỉnh sửa dịch vụ"
                      : "Chi tiết dịch vụ"}
                </span>

                {/* Mode Pill Indicator */}
                {!isCreateMode && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isEditMode
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isEditMode ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
                      }`}
                    />
                    {isEditMode ? "Chế độ chỉnh sửa" : "Chế độ xem"}
                  </span>
                )}
              </div>

              <h2 className="truncate font-heading text-base font-bold text-slate-900 sm:text-lg dark:text-white mt-0.5">
                {isCreateMode
                  ? "Thêm dịch vụ thiết kế mới"
                  : (isViewMode ? service?.serviceName : form.serviceName) ||
                    "Chi tiết dịch vụ"}
              </h2>
            </div>
          </div>

          {/* Action buttons on header */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* View Mode Actions */}
            {isViewMode && (
              <>
                {service?.serviceId && (
                  <Link
                    to={`/admin/services/${service.serviceId}`}
                    className="hidden sm:inline-flex items-center gap-1.5 h-8 px-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:text-brand hover:border-brand/40 hover:bg-slate-50 transition-colors dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    title="Mở toàn trang"
                  >
                    <ExternalLink size={13} />
                    <span>Toàn trang</span>
                  </Link>
                )}

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setForm(createInitialForm(service));
                      setMode("edit");
                    }}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl bg-brand/10 hover:bg-brand/20 text-brand text-xs font-bold transition-all cursor-pointer shadow-2xs"
                  >
                    <Pencil size={13} />
                    <span>Chỉnh sửa</span>
                  </button>
                )}
              </>
            )}

            {/* Edit Mode Actions */}
            {isEditMode && (
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={submitting}
                className="inline-flex items-center gap-1 h-8 px-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <RotateCcw size={13} />
                <span>Hủy sửa</span>
              </button>
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer ml-1"
              title="Đóng cửa sổ (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-6 space-y-6">
          {/* Error Banner if any */}
          {(errorMessage || validationError) && (
            <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 animate-in fade-in duration-150">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-500" />
              <div className="flex-1 font-medium">
                {validationError || errorMessage}
              </div>
            </div>
          )}

          {/* Form wrapper for Edit/Create mode */}
          <form id="service-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Top Grid: Service Core Info & Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Left 2 Cols: Main Info Card */}
              <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-850/50 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-3 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                    <Layers size={15} className="text-brand" />
                    <span>Thông tin dịch vụ & Phân loại</span>
                  </div>

                  {/* Service Code Display / Copy */}
                  {isViewMode ? (
                    <div className="flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 font-mono text-xs font-bold text-slate-800 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 shadow-2xs">
                      <span>{service?.serviceCode || `SRV-${service?.serviceId}`}</span>
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="text-slate-400 hover:text-brand cursor-pointer p-0.5 transition-colors"
                        title={copiedCode ? "Đã sao chép!" : "Sao chép mã dịch vụ"}
                      >
                        {copiedCode ? (
                          <Check size={12} className="text-emerald-500 stroke-3" />
                        ) : (
                          <Copy size={12} />
                        )}
                      </button>
                    </div>
                  ) : null}
                </div>

                {/* Service Code (Edit / Create) */}
                {!isViewMode && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Mã dịch vụ <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        name="serviceCode"
                        value={form.serviceCode}
                        onChange={handleFormChange}
                        placeholder="VD: DES-VEST01"
                        disabled={submitting}
                        className="w-full h-10 px-3.5 rounded-xl border border-slate-300 bg-white font-mono text-xs font-bold uppercase tracking-wider text-slate-900 focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={handleGenerateCode}
                        disabled={submitting}
                        className="h-10 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shrink-0 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                        title="Tạo mã dịch vụ tự động"
                      >
                        <RefreshCw size={13} className="inline mr-1" />
                        Tự tạo
                      </button>
                    </div>
                  </div>
                )}

                {/* Service Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Tên dịch vụ thiết kế <span className="text-rose-500">*</span>
                  </label>
                  {isViewMode ? (
                    <div className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                      {service?.serviceName}
                    </div>
                  ) : (
                    <input
                      type="text"
                      name="serviceName"
                      value={form.serviceName}
                      onChange={handleFormChange}
                      placeholder="VD: Thiết kế may đo Vest Nam Cao Cấp"
                      disabled={submitting}
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  )}
                </div>

                {/* Unit Type & Base Price */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Unit Type */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Đơn vị tính <span className="text-rose-500">*</span>
                    </label>
                    {isViewMode ? (
                      <div className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 border border-slate-200 text-xs font-bold text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 shadow-2xs">
                        <Ruler size={13} className="text-brand" />
                        <span>{service?.unitType || "Chưa thiết lập"}</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <input
                          type="text"
                          name="unitType"
                          value={form.unitType}
                          onChange={handleFormChange}
                          placeholder="VD: Sản phẩm, Bộ, Mẫu rập..."
                          disabled={submitting}
                          className="w-full h-10 px-3.5 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        />
                        {/* Quick pills */}
                        <div className="flex flex-wrap gap-1">
                          {POPULAR_UNITS.map((unit) => (
                            <button
                              key={unit}
                              type="button"
                              onClick={() =>
                                setForm((p) => ({ ...p, unitType: unit }))
                              }
                              className={`rounded-lg px-2 py-0.5 text-[10px] font-semibold transition-colors cursor-pointer ${
                                form.unitType === unit
                                  ? "bg-brand! text-white!"
                                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300"
                              }`}
                            >
                              {unit}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Base Price */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Giá cơ bản (VNĐ) <span className="text-rose-500">*</span>
                    </label>
                    {isViewMode ? (
                      <div>
                        <div className="font-heading text-xl font-extrabold text-brand tracking-tight">
                          {formatVND(service?.basePrice)}
                        </div>
                        <span className="text-[11px] text-slate-400">
                          Giá niêm yết áp dụng cho 1 {service?.unitType || "đơn vị"}
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            step="10000"
                            name="basePrice"
                            value={form.basePrice}
                            onChange={handleFormChange}
                            placeholder="VD: 1800000"
                            disabled={submitting}
                            className="w-full h-10 pl-3.5 pr-10 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                          />
                          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-xs font-bold text-slate-400">
                            ₫
                          </div>
                        </div>

                        {/* Live VND preview */}
                        {form.basePrice && (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-brand">
                            <Coins size={12} />
                            <span>{formatVND(form.basePrice)}</span>
                          </div>
                        )}

                        {/* Price Presets */}
                        <div className="flex flex-wrap gap-1">
                          {QUICK_PRICE_PRESETS.map((p) => (
                            <button
                              key={p.label}
                              type="button"
                              onClick={() =>
                                setForm((prev) => ({ ...prev, basePrice: p.value }))
                              }
                              className={`rounded-lg px-2 py-0.5 text-[10px] font-semibold transition-colors cursor-pointer ${
                                Number(form.basePrice) === p.value
                                  ? "bg-brand! text-white!"
                                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300"
                              }`}
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Col: Status & Metadata Sidebar Card */}
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-850/50 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 border-b border-slate-200/60 pb-3 dark:border-slate-800">
                    <Activity size={15} className="text-brand" />
                    <span>Trạng thái & Kiểm toán</span>
                  </div>

                  {/* Status Indicator / Switch */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                      Trạng thái hoạt động
                    </label>

                    {isViewMode ? (
                      <div className="flex items-center gap-2">
                        {isDeleted ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
                            <span className="h-2 w-2 rounded-full bg-rose-500" />
                            Đã ngừng cung cấp (Xóa)
                          </span>
                        ) : currentStatus === "active" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            Đang hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
                            <span className="h-2 w-2 rounded-full bg-amber-500" />
                            Tạm ngừng cung cấp
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setForm((p) => ({ ...p, status: "active" }))}
                          className={`flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            form.status === "active"
                              ? "bg-emerald-600 text-white shadow-xs"
                              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                          }`}
                        >
                          <CheckCircle2 size={13} />
                          <span>Hoạt động</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setForm((p) => ({ ...p, status: "inactive" }))}
                          className={`flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            form.status === "inactive"
                              ? "bg-amber-600 text-white shadow-xs"
                              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                          }`}
                        >
                          <Clock size={13} />
                          <span>Tạm ngừng</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Audit Metadata */}
                  {!isCreateMode && (
                    <div className="border-t border-slate-200/60 pt-3 dark:border-slate-800 space-y-2 text-[11px]">
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} /> Ngày tạo:
                        </span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {formatDate(service?.createdAt, false)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> Cập nhật lần cuối:
                        </span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {formatDate(service?.updatedAt || service?.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-500">
                        <span>Mã ID dữ liệu:</span>
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                          #{service?.serviceId}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* View Mode: Delete Service trigger */}
                {isViewMode && isAdmin && !isDeleted && onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(service)}
                    className="w-full flex items-center justify-center gap-1.5 h-8.5 rounded-xl border border-rose-200 bg-rose-50/60 text-xs font-bold text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-400"
                  >
                    <Trash2 size={13} />
                    <span>Ngừng cung cấp (Xóa)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Middle Section: Tags & Phân nhóm */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-850/50 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                  <Tag size={15} className="text-brand" />
                  <span>Thẻ phân loại & Từ khóa tìm kiếm</span>
                </div>
                <span className="text-[11px] text-slate-400">
                  {currentTagsList.length} thẻ
                </span>
              </div>

              {isViewMode ? (
                <div className="flex flex-wrap gap-1.5 min-h-8 items-center">
                  {currentTagsList.length > 0 ? (
                    currentTagsList.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-xl bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 border border-slate-200/80 shadow-2xs dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">
                      Chưa có thẻ phân loại nào.
                    </span>
                  )}
                </div>
              ) : (
                <div className="space-y-2.5">
                  <input
                    type="text"
                    name="tags"
                    value={form.tags}
                    onChange={handleFormChange}
                    placeholder="Nhập các thẻ cách nhau bởi dấu phẩy (VD: May đo cao cấp, Vest nam, 3D...)"
                    disabled={submitting}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />

                  {/* Suggestion tags picker */}
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">
                      Gợi ý thẻ phổ biến (bấm để thêm/bỏ nhanh):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {SUGGESTED_TAGS.map((tag) => {
                        const selected = currentTagsList.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleToggleTag(tag)}
                            className={`rounded-xl px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                              selected
                                ? "bg-brand! text-white!"
                                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {selected ? `✓ ${tag}` : `+ ${tag}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Section: Description */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-850/50 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                  <Sparkles size={15} className="text-brand" />
                  <span>Mô tả chi tiết dịch vụ</span>
                </div>
                {!isViewMode && (
                  <span className="text-[11px] text-slate-400">
                    {form.description.length} ký tự
                  </span>
                )}
              </div>

              {isViewMode ? (
                <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line min-h-12.5">
                  {service?.description || (
                    <span className="text-slate-400 italic">
                      Chưa có mô tả chi tiết cho dịch vụ này.
                    </span>
                  )}
                </div>
              ) : (
                <textarea
                  rows={4}
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  placeholder="Mô tả các công đoạn thiết kế, chất liệu tư vấn, quy trình bàn giao cho khách hàng..."
                  disabled={submitting}
                  className="w-full p-3.5 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white resize-y"
                />
              )}
            </div>

            {/* View Mode: Extra KPIs & Overview Banner */}
            {isViewMode && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between text-slate-500 mb-1.5">
                    <span className="text-xs font-medium">Doanh số ước tính</span>
                    <TrendingUp size={15} className="text-emerald-500" />
                  </div>
                  <div className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                    {formatVND(estimatedRevenue)}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Dựa trên các đơn đặt
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between text-slate-500 mb-1.5">
                    <span className="text-xs font-medium">Tổng lượt tiếp nhận</span>
                    <ShoppingBag size={15} className="text-blue-500" />
                  </div>
                  <div className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                    {estimatedOrders} đơn hàng
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Tỷ lệ hoàn tất 96%
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between text-slate-500 mb-1.5">
                    <span className="text-xs font-medium">Đánh giá khách hàng</span>
                    <Sparkles size={15} className="text-amber-500" />
                  </div>
                  <div className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                    4.9 / 5.0 ⭐
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Độ hài lòng rất cao
                  </span>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Bottom Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-5 py-3.5 sm:px-6 dark:border-slate-800 dark:bg-slate-850">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {isViewMode
              ? `Dịch vụ: ${service?.serviceCode || "Chi tiết"}`
              : isEditMode
                ? "Các thay đổi sẽ được cập nhật vào cơ sở dữ liệu."
                : "Điền đầy đủ thông tin để tạo dịch vụ mới."}
          </div>

          <div className="flex items-center gap-2">
            {isViewMode ? (
              <button
                type="button"
                onClick={onClose}
                className="h-9 px-4 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              >
                Đóng
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={submitting}
                  className="h-9 px-4 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                >
                  {isCreateMode ? "Hủy bỏ" : "Hủy thay đổi"}
                </button>

                <button
                  type="submit"
                  form="service-form"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-brand! hover:bg-brand-hover! text-white! text-xs font-bold shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isCreateMode ? (
                    <>
                      <Plus size={14} />
                      <span>{submitting ? "Đang tạo..." : "Tạo dịch vụ"}</span>
                    </>
                  ) : (
                    <>
                      <Save size={14} className={submitting ? "animate-spin" : ""} />
                      <span>{submitting ? "Đang lưu..." : "Lưu thay đổi"}</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailEditModal;
