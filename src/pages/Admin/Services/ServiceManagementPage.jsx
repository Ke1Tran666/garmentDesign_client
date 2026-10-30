import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Download,
  Eye,
  Grid,
  Layers,
  List,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Tag,
  Trash2,
  Wrench,
  X,
} from "lucide-react";
import { Link, useOutletContext } from "react-router-dom";

import { serviceApi } from "@/entities/service/api/serviceApi";
import { normalizeRole } from "@/features/auth/lib/authRole";
import { useNotification } from "@/app/providers/NotificationProvider";
import ServiceFormModal from "@/features/service-management/ui/ServiceFormModal";
import ConfirmModal from "@/shared/ui/modal/ConfirmModal";
import Pagination from "@/shared/ui/table/Pagination";
import { exportToExcel } from "@/shared/lib/exportUtils";

const PAGE_SIZE = 12;

const formatPrice = (value) => {
  const price = Number(value);
  if (!Number.isFinite(price)) return "Chưa thiết lập";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price);
};

const formatDate = (value) => {
  if (!value) return "Chưa có";
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

const getStatusInfo = (service) => {
  if (service?.deletedAt) {
    return {
      label: "Đã xóa",
      className: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900",
      dot: "bg-rose-500",
    };
  }

  const status = String(service?.status || "").trim().toLowerCase();
  if (status === "active") {
    return {
      label: "Đang hoạt động",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900",
      dot: "bg-emerald-500",
    };
  }

  if (status === "inactive") {
    return {
      label: "Tạm ngừng",
      className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900",
      dot: "bg-amber-500",
    };
  }

  return {
    label: status || "Chưa xác định",
    className: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
    dot: "bg-slate-400",
  };
};

const ServiceManagementPage = () => {
  const { adminUser, searchKeyword = "" } = useOutletContext() || {};
  const { showNotification } = useNotification();
  const isAdmin = normalizeRole(adminUser?.role) === "admin";

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [localSearch, setLocalSearch] = useState("");
  const deferredSearch = useDeferredValue(localSearch || searchKeyword);

  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "table"
  const [sortBy, setSortBy] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);

  // Form modal
  const [formOpen, setFormOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Delete modal
  const [removingService, setRemovingService] = useState(null);
  const [removing, setRemoving] = useState(false);

  const fetchServices = () => {
    setLoading(true);
    serviceApi
      .getAdminAll()
      .then((data) => {
        setServices(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        setServices([]);
        showNotification({
          type: "error",
          title: "Lỗi",
          message: error.response?.data?.message || "Không thể tải danh sách dịch vụ.",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    let active = true;
    serviceApi
      .getAdminAll()
      .then((data) => {
        if (!active) return;
        setServices(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!active) return;
        setServices([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // Compute Stats
  const stats = useMemo(() => {
    const total = services.length;
    let activeCount = 0;
    let inactiveCount = 0;
    let totalPrice = 0;

    services.forEach((s) => {
      const st = String(s.status || "").toLowerCase();
      if (st === "active" && !s.deletedAt) activeCount++;
      else inactiveCount++;

      const p = Number(s.basePrice);
      if (Number.isFinite(p)) totalPrice += p;
    });

    const avgPrice = total > 0 ? Math.round(totalPrice / total) : 0;
    return { total, activeCount, inactiveCount, avgPrice };
  }, [services]);

  // Filtered & Sorted services
  const filteredServices = useMemo(() => {
    const keyword = deferredSearch.trim().toLowerCase();

    let result = services.filter((service) => {
      const status = String(service.status || "").toLowerCase();

      const matchesKeyword =
        !keyword ||
        [
          service.serviceCode,
          service.serviceName,
          service.unitType,
          service.description,
          service.tags,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(keyword);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "deleted"
          ? Boolean(service.deletedAt)
          : !service.deletedAt && status === statusFilter);

      return matchesKeyword && matchesStatus;
    });

    if (sortBy === "price-asc") {
      result = [...result].sort((a, b) => Number(a.basePrice || 0) - Number(b.basePrice || 0));
    } else if (sortBy === "price-desc") {
      result = [...result].sort((a, b) => Number(b.basePrice || 0) - Number(a.basePrice || 0));
    } else if (sortBy === "name") {
      result = [...result].sort((a, b) =>
        (a.serviceName || "").localeCompare(b.serviceName || "")
      );
    }

    return result;
  }, [services, deferredSearch, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredServices.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const visibleServices = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredServices.slice(start, start + PAGE_SIZE);
  }, [filteredServices, safeCurrentPage]);

  // Excel export
  const handleExport = () => {
    const exportData = filteredServices.map((s) => ({
      "Mã dịch vụ": s.serviceCode || s.serviceId,
      "Tên dịch vụ": s.serviceName || "---",
      "Đơn vị tính": s.unitType || "---",
      "Giá cơ bản": formatPrice(s.basePrice),
      "Trạng thái": getStatusInfo(s).label,
      "Mô tả": s.description || "---",
      "Cập nhật": formatDate(s.updatedAt || s.createdAt),
    }));

    const success = exportToExcel(exportData, "Danh_Muc_Dich_Vu", "Services");
    if (success) {
      showNotification({
        type: "success",
        title: "Xuất dữ liệu thành công",
        message: "Tệp Excel danh mục dịch vụ đã được tải về.",
      });
    }
  };

  // Quick toggle status
  const toggleStatus = async (service) => {
    if (!isAdmin) return;
    const newStatus = service.status === "active" ? "inactive" : "active";
    try {
      await serviceApi.update(service.serviceId, {
        ...service,
        status: newStatus,
      });
      setServices((prev) =>
        prev.map((s) => (s.serviceId === service.serviceId ? { ...s, status: newStatus } : s))
      );
      showNotification({
        type: "success",
        title: "Cập nhật trạng thái",
        message: `Dịch vụ "${service.serviceName}" đã chuyển sang ${
          newStatus === "active" ? "Đang hoạt động" : "Tạm ngừng"
        }.`,
      });
    } catch {
      showNotification({
        type: "error",
        title: "Thất bại",
        message: "Không thể đổi trạng thái dịch vụ này.",
      });
    }
  };

  // Save Service (Create or Update)
  const saveService = async (payload) => {
    try {
      setSubmitting(true);
      setFormError("");

      if (editingService) {
        const updated = await serviceApi.update(editingService.serviceId, {
          ...editingService,
          ...payload,
          serviceId: editingService.serviceId,
        });
        setServices((current) =>
          current.map((item) =>
            item.serviceId === editingService.serviceId ? updated : item
          )
        );
        showNotification({
          type: "success",
          title: "Cập nhật thành công",
          message: `Dịch vụ "${payload.serviceName}" đã được cập nhật.`,
        });
      } else {
        const created = await serviceApi.create(payload);
        setServices((current) => [created, ...current]);
        showNotification({
          type: "success",
          title: "Thêm dịch vụ thành công",
          message: `Dịch vụ "${payload.serviceName}" đã được thêm vào hệ thống.`,
        });
      }
      setFormOpen(false);
      setEditingService(null);
    } catch (error) {
      setFormError(error.response?.data?.message || "Không thể lưu dịch vụ. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  // Remove Service
  const confirmRemove = async () => {
    if (!removingService) return;
    try {
      setRemoving(true);
      await serviceApi.remove(removingService.serviceId);
      setServices((current) =>
        current.map((item) =>
          item.serviceId === removingService.serviceId
            ? { ...item, status: "deleted", deletedAt: new Date().toISOString() }
            : item
        )
      );
      setRemovingService(null);
      showNotification({
        type: "success",
        title: "Đã xóa dịch vụ",
        message: "Dịch vụ đã được xóa khỏi danh mục hoạt động.",
      });
    } catch (error) {
      showNotification({
        type: "error",
        title: "Xóa thất bại",
        message: error.response?.data?.message || "Không thể xóa dịch vụ này.",
      });
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* =========================================
          PAGE HEADER
          ========================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Quản lý dịch vụ thiết kế
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {filteredServices.length} dịch vụ
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Thiết lập bảng giá, quy cách tính và danh mục dịch vụ may mặc khách hàng có thể đặt.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={fetchServices}
            disabled={loading}
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors shadow-xs"
            title="Làm mới"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-brand" : "text-slate-400"} />
            <span className="hidden sm:inline">Làm mới</span>
          </button>

          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors shadow-xs"
            title="Xuất file Excel"
          >
            <Download size={14} className="text-slate-400" />
            <span>Xuất Excel</span>
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                setEditingService(null);
                setFormError("");
                setFormOpen(true);
              }}
              className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-brand text-white text-xs font-semibold hover:bg-brand-hover shadow-xs transition-colors"
            >
              <Plus size={15} />
              <span>Thêm dịch vụ mới</span>
            </button>
          )}
        </div>
      </div>

      {/* =========================================
          TOP METRIC STATS
          ========================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Tổng số dịch vụ
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <Layers size={17} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {stats.total}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Đang cung cấp
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <CheckCircle2 size={17} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {stats.activeCount}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Tạm ngừng
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <SlidersHorizontal size={17} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {stats.inactiveCount}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Giá trung bình
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <Tag size={17} />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
            {formatPrice(stats.avgPrice)}
          </div>
        </div>
      </div>

      {/* =========================================
          TOOLBAR & VIEW MODE SWITCHER
          ========================================= */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm theo mã, tên dịch vụ hoặc đơn vị tính..."
              className="w-full h-10 pl-9.5 pr-8 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/10 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 transition-all"
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => {
                  setLocalSearch("");
                  setCurrentPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Sort selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:border-brand focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="default">Sắp xếp: Mặc định</option>
              <option value="price-asc">Giá: Thấp đến cao</option>
              <option value="price-desc">Giá: Cao đến thấp</option>
              <option value="name">Tên dịch vụ (A-Z)</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "grid"
                    ? "bg-white text-brand shadow-xs dark:bg-slate-700 dark:text-white"
                    : "hover:text-slate-900"
                }`}
                title="Dạng lưới Card"
              >
                <Grid size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "table"
                    ? "bg-white text-brand shadow-xs dark:bg-slate-700 dark:text-white"
                    : "hover:text-slate-900"
                }`}
                title="Dạng bảng Danh sách"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-medium text-slate-400 mr-1">Trạng thái:</span>
          {[
            { id: "all", label: "Tất cả" },
            { id: "active", label: "Đang hoạt động" },
            { id: "inactive", label: "Tạm ngừng" },
            { id: "deleted", label: "Đã xóa" },
          ].map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => {
                setStatusFilter(chip.id);
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === chip.id
                  ? "bg-brand text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* =========================================
          CONTENT: GRID VIEW OR TABLE VIEW
          ========================================= */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center text-slate-400 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-brand" />
          Đang tải danh mục dịch vụ...
        </div>
      ) : visibleServices.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <Wrench size={32} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
          <p className="font-semibold text-slate-600 dark:text-slate-300">
            Không tìm thấy dịch vụ nào phù hợp
          </p>
          <button
            type="button"
            onClick={() => {
              setLocalSearch("");
              setStatusFilter("all");
            }}
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
          >
            Xóa bộ lọc tìm kiếm
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibleServices.map((service) => {
            const statusInfo = getStatusInfo(service);
            return (
              <div
                key={service.serviceId}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="font-mono text-[11px] font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {service.serviceCode || "SRV-00"}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleStatus(service)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors ${statusInfo.className}`}
                      title="Nhấn để đổi trạng thái"
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.dot}`} />
                      {statusInfo.label}
                    </button>
                  </div>

                  <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {service.serviceName}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {service.description || "Chưa có mô tả chi tiết cho dịch vụ này."}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Đơn giá / {service.unitType || "sản phẩm"}</span>
                    <span className="text-base font-extrabold text-brand">
                      {formatPrice(service.basePrice)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Link
                      to={`/admin/services/${service.serviceId}`}
                      className="p-2 rounded-xl text-slate-400 hover:text-brand hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Xem chi tiết"
                    >
                      <Eye size={16} />
                    </Link>

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingService(service);
                          setFormError("");
                          setFormOpen(true);
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Pencil size={16} />
                      </button>
                    )}

                    {isAdmin && !service.deletedAt && (
                      <button
                        type="button"
                        onClick={() => setRemovingService(service)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Xóa dịch vụ"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full min-w-200 text-left">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800/40 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Mã dịch vụ</th>
                  <th className="px-4 py-3.5">Tên dịch vụ</th>
                  <th className="px-4 py-3.5">Đơn vị tính</th>
                  <th className="px-4 py-3.5">Giá niêm yết</th>
                  <th className="px-4 py-3.5">Trạng thái</th>
                  <th className="px-4 py-3.5">Cập nhật</th>
                  <th className="px-4 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {visibleServices.map((service) => {
                  const statusInfo = getStatusInfo(service);
                  return (
                    <tr
                      key={service.serviceId}
                      className="hover:bg-slate-50/70 transition-colors dark:hover:bg-slate-800/50"
                    >
                      <td className="px-5 py-3.5 font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        {service.serviceCode || service.serviceId}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                        {service.serviceName}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                        {service.unitType || "---"}
                      </td>
                      <td className="px-4 py-3.5 font-extrabold text-brand">
                        {formatPrice(service.basePrice)}
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          onClick={() => toggleStatus(service)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusInfo.className}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.dot}`} />
                          {statusInfo.label}
                        </button>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">
                        {formatDate(service.updatedAt || service.createdAt)}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/admin/services/${service.serviceId}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 hover:text-brand hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye size={16} />
                          </Link>
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingService(service);
                                setFormError("");
                                setFormOpen(true);
                              }}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                              title="Chỉnh sửa"
                            >
                              <Pencil size={16} />
                            </button>
                          )}
                          {isAdmin && !service.deletedAt && (
                            <button
                              type="button"
                              onClick={() => setRemovingService(service)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              title="Xóa dịch vụ"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && filteredServices.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs text-slate-500">
            Hiển thị {(safeCurrentPage - 1) * PAGE_SIZE + 1} -{" "}
            {Math.min(safeCurrentPage * PAGE_SIZE, filteredServices.length)} trên tổng số{" "}
            <strong className="text-slate-800 dark:text-white">{filteredServices.length}</strong>
          </span>

          <Pagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Service Add/Edit Form Modal */}
      {formOpen && (
        <ServiceFormModal
          service={editingService}
          submitting={submitting}
          errorMessage={formError}
          onClose={() => setFormOpen(false)}
          onSubmit={saveService}
        />
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        open={Boolean(removingService)}
        title="Xóa dịch vụ thiết kế"
        confirmText="Xác nhận xóa"
        confirmVariant="danger"
        submitting={removing}
        onClose={() => setRemovingService(null)}
        onConfirm={confirmRemove}
      >
        <p>
          Bạn có chắc chắn muốn xóa dịch vụ{" "}
          <strong className="text-slate-900 dark:text-white">
            {removingService?.serviceName}
          </strong>
          ? Dịch vụ này sẽ không còn hiển thị cho khách hàng đặt mới.
        </p>
      </ConfirmModal>
    </div>
  );
};

export default ServiceManagementPage;
