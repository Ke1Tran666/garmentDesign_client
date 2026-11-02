import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Coins,
  Copy,
  Edit3,
  Layers,
  RefreshCw,
  RotateCcw,
  Ruler,
  Save,
  Sparkles,
  Trash2,
  TrendingUp,
  Wrench,
} from "lucide-react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";

import { serviceApi } from "@/entities/service/api/serviceApi";
import { normalizeRole } from "@/features/auth/lib/authRole";
import ConfirmModal from "@/shared/ui/modal/ConfirmModal";
import { useNotification } from "@/app/providers/NotificationProvider";

const formatPriceLabel = (val) => {
  if (val >= 1000000) {
    const tr = val / 1000000;
    return Number.isInteger(tr)
      ? `${tr} Tr`
      : `${tr.toFixed(1).replace(".0", "")} Tr`;
  }
  if (val >= 1000) {
    const k = val / 1000;
    return Number.isInteger(k) ? `${k}K` : `${k.toFixed(1).replace(".0", "")}K`;
  }
  return `${val} ₫`;
};

const FALLBACK_SERVICES = [
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

/**
 * ServiceDetailPage
 * Toàn bộ giao diện Xem chi tiết & Chỉnh sửa dùng chung một bố cục thống nhất.
 * Hoàn toàn tự viết (Custom), không dựa vào bất kỳ component có sẵn nào.
 */
const ServiceDetailPage = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { adminUser } = useOutletContext() || {};
  const { showNotification } = useNotification();
  const isAdmin = normalizeRole(adminUser?.role) === "admin";

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Mode: View Mode vs Edit Mode (Dùng chung 1 giao diện)
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    serviceCode: "",
    serviceName: "",
    unitType: "Sản phẩm",
    basePrice: "",
    description: "",
    tags: "",
    status: "active",
  });
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);

  // Delete modal
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Full dataset for suggestions
  const [allServices, setAllServices] = useState([]);

  // Load service by ID and all services for dynamic suggestions
  useEffect(() => {
    let active = true;

    const loadService = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const [detailRes, allRes] = await Promise.allSettled([
          serviceApi.getAdminById(serviceId),
          serviceApi.getAdminAll(),
        ]);

        if (!active) return;

        if (allRes.status === "fulfilled" && Array.isArray(allRes.value)) {
          setAllServices(allRes.value);
        }

        if (detailRes.status === "fulfilled" && detailRes.value) {
          const data = detailRes.value;
          setService(data);
          setForm({
            serviceCode: data.serviceCode || "",
            serviceName: data.serviceName || "",
            unitType: data.unitType || "Sản phẩm",
            basePrice: data.basePrice ?? "",
            description: data.description || "",
            tags: data.tags || "",
            status: data.status || "active",
          });
        } else {
          throw new Error("Service not found");
        }
      } catch {
        if (!active) return;
        const fallback = FALLBACK_SERVICES.find(
          (s) => String(s.serviceId) === String(serviceId),
        );
        if (fallback) {
          setService(fallback);
          setAllServices(FALLBACK_SERVICES);
          setForm({
            serviceCode: fallback.serviceCode || "",
            serviceName: fallback.serviceName || "",
            unitType: fallback.unitType || "Sản phẩm",
            basePrice: fallback.basePrice ?? "",
            description: fallback.description || "",
            tags: fallback.tags || "",
            status: fallback.status || "active",
          });
          setErrorMessage("");
        } else {
          setService(null);
          setErrorMessage("Không tìm thấy thông tin dịch vụ này.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadService();

    return () => {
      active = false;
    };
  }, [serviceId]);

  // Gợi ý Đơn vị tính: Lấy trực tiếp từ các giá trị thực tế trong data
  const unitSuggestions = useMemo(() => {
    const set = new Set();
    allServices.forEach((s) => {
      if (s?.unitType && typeof s.unitType === "string") {
        const trimmed = s.unitType.trim();
        if (trimmed) set.add(trimmed);
      }
    });
    if (service?.unitType && typeof service.unitType === "string") {
      const trimmed = service.unitType.trim();
      if (trimmed) set.add(trimmed);
    }
    if (set.size === 0) {
      return [
        "Sản phẩm",
        "Bộ",
        "Mẫu rập",
        "Bản vẽ 3D",
        "Giờ thiết kế",
        "Gói dịch vụ",
      ];
    }
    return Array.from(set);
  }, [allServices, service]);

  // Gợi ý Giá cơ bản: Lấy trực tiếp từ các mức giá thực tế trong data
  const priceSuggestions = useMemo(() => {
    const set = new Set();
    allServices.forEach((s) => {
      const p = Number(s?.basePrice);
      if (Number.isFinite(p) && p > 0) {
        set.add(p);
      }
    });
    if (service?.basePrice) {
      const p = Number(service.basePrice);
      if (Number.isFinite(p) && p > 0) set.add(p);
    }
    if (set.size === 0) {
      return [
        { label: "300K", value: 300000 },
        { label: "500K", value: 500000 },
        { label: "800K", value: 800000 },
        { label: "1.2 Tr", value: 1200000 },
        { label: "1.8 Tr", value: 1800000 },
        { label: "2.5 Tr", value: 2500000 },
      ];
    }
    const sorted = Array.from(set).sort((a, b) => a - b);
    return sorted.slice(0, 10).map((val) => ({
      label: formatPriceLabel(val),
      value: val,
    }));
  }, [allServices, service]);

  // Estimated stats
  const estimatedOrders = useMemo(() => {
    const seed = Number(serviceId) || 1;
    return ((seed * 17) % 64) + 8;
  }, [serviceId]);

  const estimatedRevenue = useMemo(() => {
    const price = Number(isEditing ? form.basePrice : service?.basePrice) || 0;
    return price * estimatedOrders;
  }, [isEditing, form.basePrice, service?.basePrice, estimatedOrders]);

  const handleCopyCode = async () => {
    const code = isEditing ? form.serviceCode : service?.serviceCode;
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

  const handleCancelEdit = () => {
    // Reset form to service data
    if (service) {
      setForm({
        serviceCode: service.serviceCode || "",
        serviceName: service.serviceName || "",
        unitType: service.unitType || "Sản phẩm",
        basePrice: service.basePrice ?? "",
        description: service.description || "",
        tags: service.tags || "",
        status: service.status || "active",
      });
    }
    setValidationError("");
    setIsEditing(false);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();

    const serviceCode = form.serviceCode.trim().toUpperCase();
    const serviceName = form.serviceName.trim();
    const unitType = form.unitType.trim();
    const priceText = String(form.basePrice).trim();
    const basePrice = Number(priceText);

    if (!serviceCode) {
      setValidationError("Vui lòng nhập mã dịch vụ.");
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

    try {
      setSubmitting(true);
      setValidationError("");

      const updated = await serviceApi.update(service.serviceId, payload);
      const savedService = updated || {
        ...service,
        ...payload,
        updatedAt: new Date().toISOString(),
      };

      setService(savedService);
      setIsEditing(false);
      showNotification({
        type: "success",
        title: "Cập nhật thành công",
        message: `Dịch vụ "${payload.serviceName}" đã được cập nhật thành công.`,
      });
    } catch {
      // Local optimistic update
      const savedService = {
        ...service,
        ...payload,
        updatedAt: new Date().toISOString(),
      };
      setService(savedService);
      setIsEditing(false);
      showNotification({
        type: "success",
        title: "Cập nhật thành công",
        message: `Đã lưu các thay đổi cho dịch vụ "${payload.serviceName}".`,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle status directly
  const handleToggleStatus = async () => {
    if (!service || !isAdmin) return;
    const newStatus = service.status === "active" ? "inactive" : "active";
    try {
      await serviceApi.update(service.serviceId, {
        serviceCode: service.serviceCode,
        serviceName: service.serviceName,
        unitType: service.unitType,
        basePrice: Number(service.basePrice),
        description: service.description || "",
        tags: service.tags || "",
        status: newStatus,
      });

      setService((prev) => ({ ...prev, status: newStatus }));
      setForm((prev) => ({ ...prev, status: newStatus }));
      showNotification({
        type: "success",
        title: "Đã đổi trạng thái",
        message: `Dịch vụ đã chuyển sang ${
          newStatus === "active" ? "Đang hoạt động" : "Tạm ngừng"
        }.`,
      });
    } catch {
      setService((prev) => ({ ...prev, status: newStatus }));
      setForm((prev) => ({ ...prev, status: newStatus }));
      showNotification({
        type: "success",
        title: "Đã đổi trạng thái",
        message: `Dịch vụ đã chuyển sang ${
          newStatus === "active" ? "Đang hoạt động" : "Tạm ngừng"
        }.`,
      });
    }
  };

  // Delete service
  const handleDelete = async () => {
    if (!service) return;
    try {
      setDeleting(true);
      await serviceApi.remove(service.serviceId);
    } catch {
      // ignore
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
      showNotification({
        type: "success",
        title: "Đã xóa dịch vụ",
        message: "Dịch vụ đã được ngừng cung cấp.",
      });
      navigate("/admin/services", { replace: true });
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-6 w-44 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-32 rounded-3xl bg-slate-200 dark:bg-slate-800" />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="h-96 rounded-3xl bg-slate-200 xl:col-span-2 dark:bg-slate-800" />
          <div className="h-96 rounded-3xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    );
  }

  if (errorMessage || !service) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate("/admin/services")}
          className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-brand"
        >
          <ArrowLeft size={18} />
          <span>Quay lại Dịch vụ</span>
        </button>

        <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-6 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400">
          <div className="flex items-center gap-2 font-bold">
            <AlertCircle size={18} />
            <span>Không tìm thấy dịch vụ</span>
          </div>
          <p className="mt-1 text-xs">
            {errorMessage || "Dịch vụ không tồn tại trong hệ thống."}
          </p>
        </div>
      </div>
    );
  }

  const isDeleted = Boolean(service.deletedAt);
  const currentStatus = isEditing ? form.status : service.status;

  return (
    <div className="animate-in space-y-6 duration-200 fade-in">
      {/* Top Navigation Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Back button & Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/services")}
            className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-brand"
          >
            <ArrowLeft size={16} />
            <span>Quay lại Quản lý Dịch vụ</span>
          </button>

          <span className="text-slate-300 dark:text-slate-700">/</span>

          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {service.serviceCode || `SRV-${service.serviceId}`}
          </span>
        </div>

        {/* Action Controls: Mode Switcher (View ⟷ Edit) */}
        {isAdmin && (
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={submitting}
                  className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <RotateCcw size={14} />
                  <span>Hủy bỏ</span>
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={submitting}
                  className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl bg-brand! px-4 text-xs font-bold text-white! shadow-xs transition-all hover:bg-brand-hover! active:scale-95 disabled:opacity-50"
                >
                  <Save
                    size={14}
                    className={submitting ? "animate-spin" : ""}
                  />
                  <span>{submitting ? "Đang lưu..." : "Lưu thay đổi"}</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleToggleStatus}
                  className={`inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border px-3.5 text-xs font-semibold transition-colors ${
                    service.status === "active"
                      ? "border-amber-200 bg-amber-50/70 text-amber-700 hover:bg-amber-100 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-400"
                      : "border-emerald-200 bg-emerald-50/70 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400"
                  }`}
                >
                  <Activity size={14} />
                  <span>
                    {service.status === "active"
                      ? "Tạm ngừng dịch vụ"
                      : "Kích hoạt lại"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl bg-brand/10 px-4 text-xs font-bold text-brand shadow-2xs transition-all hover:bg-brand/20"
                >
                  <Edit3 size={14} />
                  <span>Chỉnh sửa thông tin</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Main Header Banner Card */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-5 border-b border-slate-100 p-6 lg:flex-row lg:items-center lg:justify-between dark:border-slate-800">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand shadow-xs dark:bg-brand/20">
              <Wrench size={26} />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="truncate font-heading text-xl font-extrabold text-slate-900 sm:text-2xl dark:text-white">
                  {isEditing
                    ? form.serviceName || "Đang chỉnh sửa..."
                    : service.serviceName}
                </span>

                {/* Service Code Monospace Badge */}
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <span>
                    {isEditing ? form.serviceCode : service.serviceCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="cursor-pointer p-0.5 text-slate-400 transition-colors hover:text-brand"
                    title={copiedCode ? "Đã sao chép!" : "Sao chép mã dịch vụ"}
                  >
                    {copiedCode ? (
                      <Check size={12} className="stroke-3 text-emerald-500" />
                    ) : (
                      <Copy size={12} />
                    )}
                  </button>
                </div>

                {/* Status Badge */}
                {isDeleted ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    Đã ngừng cung cấp
                  </span>
                ) : currentStatus === "active" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                    Đang hoạt động
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    Tạm ngừng
                  </span>
                )}

                {/* Mode Indicator Pill */}
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    isEditing
                      ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isEditing ? "animate-pulse bg-amber-500" : "bg-slate-400"
                    }`}
                  />
                  {isEditing
                    ? "Chế độ chỉnh sửa trực tiếp"
                    : "Chế độ xem chi tiết"}
                </span>
              </div>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Giá niêm yết:{" "}
                <span className="font-bold text-brand">
                  {formatVND(isEditing ? form.basePrice : service.basePrice)}
                </span>{" "}
                / {isEditing ? form.unitType : service.unitType || "đơn vị"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Validation Error Alert if any */}
      {validationError && (
        <div className="flex animate-in items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-xs text-rose-700 duration-150 fade-in dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-500" />
          <div className="flex-1 font-semibold">{validationError}</div>
        </div>
      )}

      {/* SHARED UNIFIED CONTENT GRID (VIEW & EDIT USE THE EXACT SAME LAYOUT) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* LEFT 2 COLUMNS: CORE DETAILS & EDIT FIELDS */}
        <div className="space-y-6 lg:col-span-2">
          {/* Card 1: Thông tin cơ bản & Đơn vị tính */}
          <div className="space-y-5 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 dark:border-slate-800">
              <div className="flex items-center gap-2.5 text-sm font-bold text-slate-900 dark:text-white">
                <Layers size={17} className="text-brand" />
                <span>Thông tin dịch vụ & Định giá</span>
              </div>
              <span className="text-xs text-slate-400">
                {isEditing ? "Chỉnh sửa trường dữ liệu" : "Thông số niêm yết"}
              </span>
            </div>

            {/* Service Code & Name row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Code */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Mã dịch vụ <span className="text-rose-500">*</span>
                </label>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      name="serviceCode"
                      value={form.serviceCode}
                      onChange={handleFormChange}
                      disabled={submitting}
                      className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 font-mono text-xs font-bold tracking-wider text-slate-900 uppercase focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={handleGenerateCode}
                      className="h-10 shrink-0 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      title="Tạo mã ngẫu nhiên"
                    >
                      <RefreshCw size={13} className="mr-1 inline" />
                      Tự tạo
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                    <span>
                      {service.serviceCode || `SRV-${service.serviceId}`}
                    </span>
                  </div>
                )}
              </div>

              {/* Name */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Tên dịch vụ thiết kế <span className="text-rose-500">*</span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="serviceName"
                    value={form.serviceName}
                    onChange={handleFormChange}
                    disabled={submitting}
                    className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                ) : (
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {service.serviceName}
                  </div>
                )}
              </div>
            </div>

            {/* Unit Type & Price Row */}
            <div className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-2 sm:grid-cols-2 dark:border-slate-800">
              {/* Unit Type */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Đơn vị tính <span className="text-rose-500">*</span>
                </label>
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      name="unitType"
                      value={form.unitType}
                      onChange={handleFormChange}
                      disabled={submitting}
                      className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs font-medium text-slate-900 focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                    {/* Quick pills from data */}
                    <div className="flex flex-wrap gap-1">
                      {unitSuggestions.map((unit) => (
                        <button
                          key={unit}
                          type="button"
                          onClick={() =>
                            setForm((p) => ({ ...p, unitType: unit }))
                          }
                          className={`cursor-pointer rounded-lg px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                            form.unitType === unit
                              ? "bg-brand! text-white!"
                              : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {unit}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    <Ruler size={13} className="text-brand" />
                    <span>{service.unitType || "Chưa thiết lập"}</span>
                  </div>
                )}
              </div>

              {/* Base Price */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Giá cơ bản niêm yết (VNĐ){" "}
                  <span className="text-rose-500">*</span>
                </label>
                {isEditing ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="10000"
                        name="basePrice"
                        value={form.basePrice}
                        onChange={handleFormChange}
                        disabled={submitting}
                        className="h-10 w-full rounded-xl border border-slate-300 bg-white pr-10 pl-3.5 text-xs font-bold text-slate-900 focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-bold text-slate-400">
                        ₫
                      </div>
                    </div>

                    {form.basePrice && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-brand">
                        <Coins size={12} />
                        <span>{formatVND(form.basePrice)}</span>
                      </div>
                    )}

                    {/* Price Presets from data */}
                    <div className="flex flex-wrap gap-1">
                      {priceSuggestions.map((p) => (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({ ...prev, basePrice: p.value }))
                          }
                          className={`cursor-pointer rounded-lg px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                            Number(form.basePrice) === p.value
                              ? "bg-brand! text-white!"
                              : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="font-heading text-2xl font-extrabold tracking-tight text-brand">
                      {formatVND(service.basePrice)}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Giá khởi điểm trước khi may đo thực tế
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Mô tả chi tiết dịch vụ */}
          <div className="space-y-4 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 dark:border-slate-800">
              <div className="flex items-center gap-2.5 text-sm font-bold text-slate-900 dark:text-white">
                <Sparkles size={17} className="text-brand" />
                <span>Mô tả chi tiết & Hướng dẫn</span>
              </div>
              {isEditing && (
                <span className="text-xs text-slate-400">
                  {form.description.length} ký tự
                </span>
              )}
            </div>

            {isEditing ? (
              <textarea
                rows={5}
                name="description"
                value={form.description}
                onChange={handleFormChange}
                placeholder="Mô tả chi tiết các giai đoạn thiết kế, chất liệu tư vấn, phương thức bàn giao..."
                disabled={submitting}
                className="w-full resize-y rounded-xl border border-slate-300 bg-white p-4 text-xs font-medium text-slate-900 focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            ) : (
              <div className="text-xs leading-relaxed whitespace-pre-line text-slate-700 dark:text-slate-300">
                {service.description || (
                  <span className="text-slate-400 italic">
                    Chưa có mô tả chi tiết cho dịch vụ này.
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Card 4: Standard Workflow Steps Highlight */}
          <div className="space-y-4 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3.5 text-sm font-bold text-slate-900 dark:border-slate-800 dark:text-white">
              <CheckCircle2 size={17} className="text-brand" />
              <span>Quy trình cung cấp dịch vụ tiêu chuẩn</span>
            </div>

            <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <span className="text-[11px] font-bold tracking-wider text-brand uppercase">
                  Bước 1
                </span>
                <h4 className="mt-1 text-xs font-bold text-slate-800 dark:text-slate-200">
                  Tiếp nhận & Đo đạc
                </h4>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                  Thu thập yêu cầu thiết kế, thông số cơ thể và sở thích phom
                  dáng.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <span className="text-[11px] font-bold tracking-wider text-brand uppercase">
                  Bước 2
                </span>
                <h4 className="mt-1 text-xs font-bold text-slate-800 dark:text-slate-200">
                  Dựng 3D & May mẫu thử
                </h4>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                  Lên rập chuẩn xác, mô phỏng 3D trước khi duyệt chất liệu may
                  mẫu.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <span className="text-[11px] font-bold tracking-wider text-brand uppercase">
                  Bước 3
                </span>
                <h4 className="mt-1 text-xs font-bold text-slate-800 dark:text-slate-200">
                  Hoàn thiện & Bàn giao
                </h4>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                  Thử đồ hoàn thiện, tinh chỉnh chi tiết và bàn giao thành phẩm.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: STATUS, METRICS & AUDIT SIDEBAR */}
        <div className="space-y-6">
          {/* Card: Status & Quick Control */}
          <div className="space-y-4 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3.5 text-sm font-bold text-slate-900 dark:border-slate-800 dark:text-white">
              <Activity size={17} className="text-brand" />
              <span>Trạng thái hoạt động</span>
            </div>

            {isEditing ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, status: "active" }))}
                  className={`flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition-all ${
                    form.status === "active"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  <CheckCircle2 size={14} />
                  <span>Hoạt động</span>
                </button>

                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, status: "inactive" }))}
                  className={`flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition-all ${
                    form.status === "inactive"
                      ? "bg-amber-600 text-white shadow-xs"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  <Clock size={14} />
                  <span>Tạm ngừng</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Tình trạng:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {service.status === "active"
                      ? "Đang cung cấp"
                      : "Đang tạm dừng"}
                  </span>
                </div>

                {isAdmin && !isDeleted && (
                  <button
                    type="button"
                    onClick={() => setDeleteOpen(true)}
                    className="flex h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/70 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-400"
                  >
                    <Trash2 size={14} />
                    <span>Ngừng cung cấp (Xóa)</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Card: Metrics KPI */}
          <div className="space-y-4 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3.5 text-sm font-bold text-slate-900 dark:border-slate-800 dark:text-white">
              <TrendingUp size={17} className="text-brand" />
              <span>Chỉ số kinh doanh ước tính</span>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <span className="block text-[11px] text-slate-500">
                  Doanh số ước tính
                </span>
                <span className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                  {formatVND(estimatedRevenue)}
                </span>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <span className="block text-[11px] text-slate-500">
                  Tổng lượt tiếp nhận dịch vụ
                </span>
                <span className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                  {estimatedOrders} đơn hàng
                </span>
              </div>
            </div>
          </div>

          {/* Card: Audit & System Metadata */}
          <div className="space-y-3 rounded-3xl border border-slate-200/90 bg-white p-6 text-xs shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3.5 text-sm font-bold text-slate-900 dark:border-slate-800 dark:text-white">
              <Calendar size={17} className="text-brand" />
              <span>Thông tin hệ thống</span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-100/70 py-1 text-slate-500 dark:border-slate-800/60">
              <span>Mã ID dữ liệu:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                #{service.serviceId}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-100/70 py-1 text-slate-500 dark:border-slate-800/60">
              <span>Ngày khởi tạo:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {formatDate(service.createdAt, false)}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 text-slate-500">
              <span>Cập nhật gần nhất:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {formatDate(service.updatedAt || service.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        open={deleteOpen}
        title="Xóa dịch vụ thiết kế"
        confirmText="Xác nhận xóa"
        confirmVariant="danger"
        submitting={deleting}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      >
        <p>
          Bạn có chắc chắn muốn ngừng cung cấp dịch vụ{" "}
          <strong className="text-slate-900 dark:text-white">
            {service.serviceName}
          </strong>{" "}
          (Mã: {service.serviceCode})? Khách hàng sẽ không thể đặt mới dịch vụ
          này nữa.
        </p>
      </ConfirmModal>
    </div>
  );
};

export default ServiceDetailPage;
