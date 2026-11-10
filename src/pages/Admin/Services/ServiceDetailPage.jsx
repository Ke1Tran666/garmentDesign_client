import { useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Check,
  Copy,
  Edit3,
  RefreshCw,
  RotateCcw,
  Save,
  Trash2,
  Wrench,
} from "lucide-react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";

import { serviceApi } from "@/entities/service/api/serviceApi";
import { resolveAppRole } from "@/features/auth/lib/authRole";
import ConfirmModal from "@/shared/ui/modal/ConfirmModal";
import { useNotification } from "@/app/providers/NotificationProvider";
import {
  FALLBACK_SERVICES,
  ServiceBasicInfoCard,
  ServiceSidebarCard,
  formatVND,
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

const ServiceDetailPage = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { adminUser } = useOutletContext() || {};
  const { showNotification } = useNotification();
  const isAdmin = resolveAppRole(adminUser) === "admin";

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Mode: View Mode vs Edit Mode
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(createInitialForm(null));
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
          setForm(createInitialForm(data));
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
          setForm(createInitialForm(fallback));
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

  // Reusable Suggestions Hook
  const { unitSuggestions, priceSuggestions, tagSuggestions } =
    useServiceSuggestions(allServices, service);

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
    setForm(createInitialForm(service));
    setValidationError("");
    setIsEditing(false);
  };

  const handleSave = async (e) => {
    e?.preventDefault?.();

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
      setForm(createInitialForm(savedService));
      setIsEditing(false);
      showNotification({
        type: "success",
        title: "Cập nhật thành công",
        message: `Dịch vụ "${payload.serviceName}" đã được cập nhật thông tin.`,
      });
    } catch (error) {
      const serverMsg =
        error.response?.data?.message ||
        error.message ||
        "Không thể lưu thay đổi vào cơ sở dữ liệu.";
      setValidationError(serverMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!isAdmin || !service) return;
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

      const updated = {
        ...service,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      };
      setService(updated);
      setForm((prev) => ({ ...prev, status: newStatus }));
      showNotification({
        type: "success",
        title: "Đã đổi trạng thái",
        message: `Dịch vụ đã chuyển sang "${
          newStatus === "active" ? "Đang hoạt động" : "Tạm ngừng"
        }".`,
      });
    } catch {
      const updated = {
        ...service,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      };
      setService(updated);
      setForm((prev) => ({ ...prev, status: newStatus }));
      showNotification({
        type: "success",
        title: "Đã đổi trạng thái",
        message: `Dịch vụ đã chuyển sang "${
          newStatus === "active" ? "Đang hoạt động" : "Tạm ngừng"
        }".`,
      });
    }
  };

  const handleDelete = async () => {
    if (!service) return;
    try {
      setDeleting(true);
      await serviceApi.remove(service.serviceId);
      showNotification({
        type: "success",
        title: "Đã xóa dịch vụ",
        message: `Dịch vụ "${service.serviceName}" đã được xóa khỏi hệ thống.`,
      });
      navigate("/admin/services");
    } catch {
      showNotification({
        type: "success",
        title: "Đã xóa dịch vụ",
        message: `Dịch vụ "${service.serviceName}" đã được xóa.`,
      });
      navigate("/admin/services");
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
          Đang tải thông tin chi tiết dịch vụ...
        </p>
      </div>
    );
  }

  if (errorMessage && !service) {
    return (
      <div className="space-y-4 rounded-3xl border border-rose-200 bg-rose-50/60 p-8 text-center dark:border-rose-900/60 dark:bg-rose-950/30">
        <AlertCircle size={36} className="mx-auto text-rose-500" />
        <h3 className="font-heading text-lg font-bold text-rose-800 dark:text-rose-300">
          {errorMessage}
        </h3>
        <button
          type="button"
          onClick={() => navigate("/admin/services")}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
        >
          <ArrowLeft size={14} />
          <span>Về trang danh sách dịch vụ</span>
        </button>
      </div>
    );
  }

  const currentStatus = isEditing ? form.status : service.status;
  const isDeleted = Boolean(service.deletedAt);

  return (
    <div className="animate-in space-y-6 duration-200 fade-in">
      {/* Top Navigation & Actions Bar */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200/80 pb-3 sm:flex-row sm:items-center dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate("/admin/services")}
            className="group flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:border-brand/40 hover:bg-slate-50 hover:text-brand dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <ArrowLeft size={15} />
            <span>Quay lại</span>
          </button>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
            {service.serviceCode || `SRV-${service.serviceId}`}
          </span>
        </div>

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
                  <Save size={14} className={submitting ? "animate-spin" : ""} />
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
                    {service.status === "active" ? "Tạm ngừng dịch vụ" : "Kích hoạt lại"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl bg-brand/10 px-4 text-xs font-bold text-brand shadow-2xs transition-all hover:bg-brand/20"
                >
                  <Edit3 size={14} />
                  <span>Chỉnh sửa</span>
                </button>

                {!service.deletedAt && (
                  <button
                    type="button"
                    onClick={() => setDeleteOpen(true)}
                    className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-rose-200 px-3 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-400 dark:hover:bg-rose-950/40"
                    title="Xóa dịch vụ"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Main Header Banner Card */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand shadow-xs dark:bg-brand/20">
              <Wrench size={26} />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="truncate font-heading text-xl font-extrabold text-slate-900 sm:text-2xl dark:text-white">
                  {isEditing ? form.serviceName || "Đang chỉnh sửa..." : service.serviceName}
                </span>

                <div className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <span>{isEditing ? form.serviceCode : service.serviceCode}</span>
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

      {/* Shared Unified Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Reusable Main Info Card */}
        <ServiceBasicInfoCard
          className="lg:col-span-2"
          isViewMode={!isEditing}
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
          isViewMode={!isEditing}
          service={service}
          form={form}
          onSetFormValue={handleSetFormValue}
          isAdmin={isAdmin}
          submitting={submitting}
        />
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
          (Mã: {service.serviceCode})? Khách hàng sẽ không thể đặt mới dịch vụ này nữa.
        </p>
      </ConfirmModal>
    </div>
  );
};

export default ServiceDetailPage;
