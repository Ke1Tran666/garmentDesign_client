import { useEffect, useState } from "react";
import {
  AlertCircle,
  ExternalLink,
  Pencil,
  RotateCcw,
  Save,
  Trash2,
  Wrench,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { serviceApi } from "@/entities/service/api/serviceApi";
import {
  ServiceBasicInfoCard,
  ServiceSidebarCard,
  useServiceSuggestions,
} from "@/features/service-management";

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
 */
const ServiceDetailEditModal = ({
  open = true,
  service = null,
  allServices = [],
  initialMode = "view", // 'view' | 'edit' | 'create'
  isAdmin = true,
  submitting = false,
  errorMessage = "",
  onClose,
  onSubmit,
  onDelete,
}) => {
  const [fetchedServices, setFetchedServices] = useState([]);
  const [mode, setMode] = useState(initialMode); // 'view' | 'edit' | 'create'
  const [form, setForm] = useState(() => createInitialForm(service));
  const [validationError, setValidationError] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);

  // Fetch full services dataset from backend if not provided as prop
  useEffect(() => {
    if (Array.isArray(allServices) && allServices.length > 0) return;
    let active = true;
    serviceApi
      .getAdminAll()
      .then((data) => {
        if (active && Array.isArray(data)) {
          setFetchedServices(data);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [allServices]);

  const sourceServices =
    Array.isArray(allServices) && allServices.length > 0
      ? allServices
      : fetchedServices;

  // Reusable Suggestions Hook
  const { unitSuggestions, priceSuggestions, tagSuggestions } =
    useServiceSuggestions(sourceServices, service);

  // Sync state when props change
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

  const handleSetFormValue = (name, value) => {
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

  const handleCancelEdit = () => {
    if (isCreateMode) {
      onClose();
    } else {
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
      if (isEditMode) {
        setMode("view");
      }
    });
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200"
        onClick={submitting ? undefined : onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 my-auto flex max-h-[92vh] w-full max-w-4xl animate-in flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xl transition-all duration-200 zoom-in-95 fade-in dark:border-slate-800 dark:bg-slate-900">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6 dark:border-slate-800 dark:bg-slate-800/50">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand shadow-xs dark:bg-brand/20">
              <Wrench size={20} />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
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
                        isEditMode
                          ? "animate-pulse bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                    />
                    {isEditMode ? "Chế độ chỉnh sửa" : "Chế độ xem"}
                  </span>
                )}
              </div>

              <h2 className="mt-0.5 truncate font-heading text-base font-bold text-slate-900 sm:text-lg dark:text-white">
                {isCreateMode
                  ? "Thêm dịch vụ thiết kế mới"
                  : (isViewMode ? service?.serviceName : form.serviceName) ||
                    "Chi tiết dịch vụ"}
              </h2>
            </div>
          </div>

          {/* Action buttons on header */}
          <div className="flex shrink-0 items-center gap-1.5">
            {/* View Mode Actions */}
            {isViewMode && (
              <>
                {service?.serviceId && (
                  <Link
                    to={`/admin/services/${service.serviceId}`}
                    className="hidden h-8 items-center gap-1.5 rounded-xl border border-slate-200 px-2.5 text-xs font-semibold text-slate-600 transition-colors hover:border-brand/40 hover:bg-slate-50 hover:text-brand sm:inline-flex dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
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
                    className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-xl bg-brand/10 px-3 text-xs font-bold text-brand shadow-2xs transition-all hover:bg-brand/20"
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
                className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-xl border border-slate-200 px-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
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
              className="ml-1 cursor-pointer rounded-xl p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              title="Đóng cửa sổ (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-6 sm:px-6">
          {/* Error Banner if any */}
          {(errorMessage || validationError) && (
            <div className="flex animate-in items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-700 duration-150 fade-in dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
              <AlertCircle
                size={16}
                className="mt-0.5 shrink-0 text-rose-500"
              />
              <div className="flex-1 font-medium">
                {validationError || errorMessage}
              </div>
            </div>
          )}

          {/* Form wrapper for Edit/Create mode */}
          <form id="service-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              {/* Left 2 Cols: Reusable Main Info Card */}
              <ServiceBasicInfoCard
                className="lg:col-span-2"
                isViewMode={isViewMode}
                service={service}
                form={form}
                onFormChange={handleFormChange}
                onSetFormValue={handleSetFormValue}
                unitSuggestions={unitSuggestions}
                priceSuggestions={priceSuggestions}
                tagSuggestions={tagSuggestions}
                copiedCode={copiedCode}
                onCopyCode={handleCopyCode}
                onGenerateCode={handleGenerateCode}
                submitting={submitting}
              />

              {/* Right Col: Reusable Status, Metrics & Metadata Card */}
              <ServiceSidebarCard
                isViewMode={isViewMode}
                service={service}
                form={form}
                onSetFormValue={handleSetFormValue}
                isAdmin={isAdmin}
                submitting={submitting}
              />
            </div>
          </form>
        </div>

        {/* Sticky Footer Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/80 px-5 py-3.5 sm:px-6 dark:border-slate-800 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            {isViewMode && isAdmin && service && !service.deletedAt && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(service)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-400 dark:hover:bg-rose-950/40"
              >
                <Trash2 size={14} />
                <span>Xóa dịch vụ</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              {isViewMode ? "Đóng" : "Hủy bỏ"}
            </button>

            {!isViewMode && (
              <button
                type="submit"
                form="service-form"
                disabled={submitting}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-brand px-5 py-2 text-xs font-bold text-white shadow-sm shadow-brand/25 transition-all hover:bg-brand-hover active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>{isCreateMode ? "Tạo dịch vụ" : "Lưu thay đổi"}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailEditModal;
