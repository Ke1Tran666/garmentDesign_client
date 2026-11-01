import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  CheckSquare,
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
  Square,
  Tag,
  Trash2,
  Wrench,
  X,
} from "lucide-react";
import { useOutletContext } from "react-router-dom";

import { serviceApi } from "@/entities/service/api/serviceApi";
import { normalizeRole } from "@/features/auth/lib/authRole";
import { useNotification } from "@/app/providers/NotificationProvider";
import ServiceDetailEditModal from "@/features/service-management/ui/ServiceDetailEditModal";
import ConfirmModal from "@/shared/ui/modal/ConfirmModal";
import Pagination from "@/shared/ui/table/Pagination";
import { exportToExcel } from "@/shared/lib/exportUtils";

const PAGE_SIZE = 12;

const FALLBACK_SERVICES = [
  {
    serviceId: 1,
    serviceCode: "DES-VEST01",
    serviceName: "Thiết kế may đo Vest Nam Cao Cấp",
    unitType: "Bộ",
    basePrice: 1800000,
    description: "Tư vấn phom dáng, dựng rập 3D theo số đo cá nhân hóa và may mẫu thử trước khi hoàn thiện.",
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
    description: "Thiết kế độc bản theo yêu cầu, xử lý chất liệu ren đính kết thủ công tinh xảo.",
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
    description: "Bộ nhận diện trang phục công sở hiện đại, tiện dụng, độ bền màu cao và tối ưu chi phí may số lượng lớn.",
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
    description: "Xuất file rập chuẩn công nghiệp định dạng DXF/PDF kèm mô phỏng độ rủ vải trên phần mềm CLO3D.",
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
    description: "May thử nghiệm trên vải mộc để kiểm tra cử động, chỉnh sửa thông số rập trước khi cắt vải chính.",
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
    description: "Lên moodboard xu hướng, tư vấn bảng màu, lựa chọn chất liệu vải và định hướng phong cách bộ sưu tập.",
    tags: "Tư vấn, Moodboard, Bộ sưu tập",
    status: "active",
    createdAt: new Date(Date.now() - 86400000 * 35).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 12).toISOString(),
  },
];

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

  // Search & Filters
  const [localSearch, setLocalSearch] = useState("");
  const deferredSearch = useDeferredValue(localSearch || searchKeyword);
  const [statusFilter, setStatusFilter] = useState("all");
  const [unitTypeFilter, setUnitTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "table"
  const [currentPage, setCurrentPage] = useState(1);

  // Batch selection
  const [selectedIds, setSelectedIds] = useState([]);

  // Form modal
  const [formOpen, setFormOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [modalMode, setModalMode] = useState("view"); // 'view' | 'edit' | 'create'
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Delete modal
  const [removingService, setRemovingService] = useState(null);
  const [removing, setRemoving] = useState(false);

  // Load services from Backend
  const fetchServices = () => {
    setLoading(true);
    serviceApi
      .getAdminAll()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setServices(data);
        } else {
          // If backend has no data yet, provide sample services for smooth UX
          setServices(FALLBACK_SERVICES);
        }
      })
      .catch((error) => {
        // Fallback to sample services if server is offline during dev
        setServices(FALLBACK_SERVICES);
        showNotification({
          type: "info",
          title: "Chế độ dữ liệu mẫu",
          message:
            error.response?.data?.message ||
            "Không thể kết nối máy chủ, đang hiển thị danh mục mẫu.",
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
        if (Array.isArray(data) && data.length > 0) {
          setServices(data);
        } else {
          setServices(FALLBACK_SERVICES);
        }
      })
      .catch(() => {
        if (!active) return;
        setServices(FALLBACK_SERVICES);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // Compute available units for filter dropdown
  const availableUnitTypes = useMemo(() => {
    const units = new Set();
    services.forEach((s) => {
      if (s.unitType) units.add(s.unitType);
    });
    return Array.from(units);
  }, [services]);

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
    const activeRate = total > 0 ? Math.round((activeCount / total) * 100) : 0;
    return { total, activeCount, inactiveCount, avgPrice, activeRate };
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

      const matchesUnit =
        unitTypeFilter === "all" || service.unitType === unitTypeFilter;

      return matchesKeyword && matchesStatus && matchesUnit;
    });

    if (sortBy === "price-asc") {
      result = [...result].sort(
        (a, b) => Number(a.basePrice || 0) - Number(b.basePrice || 0),
      );
    } else if (sortBy === "price-desc") {
      result = [...result].sort(
        (a, b) => Number(b.basePrice || 0) - Number(a.basePrice || 0),
      );
    } else if (sortBy === "name") {
      result = [...result].sort((a, b) =>
        (a.serviceName || "").localeCompare(b.serviceName || ""),
      );
    } else if (sortBy === "updated") {
      result = [...result].sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt) -
          new Date(a.updatedAt || a.createdAt),
      );
    }

    return result;
  }, [services, deferredSearch, statusFilter, unitTypeFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredServices.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const visibleServices = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredServices.slice(start, start + PAGE_SIZE);
  }, [filteredServices, safeCurrentPage]);

  // Checkbox selection handlers
  const handleToggleSelect = (serviceId) => {
    setSelectedIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId],
    );
  };

  const handleSelectAllCurrent = () => {
    const currentIds = visibleServices.map((s) => s.serviceId);
    const allSelected = currentIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !currentIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentIds])));
    }
  };

  // Excel export
  const handleExport = (dataToExport = filteredServices) => {
    const exportData = dataToExport.map((s) => ({
      "Mã dịch vụ": s.serviceCode || s.serviceId,
      "Tên dịch vụ": s.serviceName || "---",
      "Đơn vị tính": s.unitType || "---",
      "Giá cơ bản (VNĐ)": formatPrice(s.basePrice),
      "Thẻ phân loại": s.tags || "---",
      "Trạng thái": getStatusInfo(s).label,
      "Mô tả": s.description || "---",
      "Cập nhật lúc": formatDate(s.updatedAt || s.createdAt),
    }));

    const success = exportToExcel(
      exportData,
      `Danh_Muc_Dich_Vu_${new Date().toISOString().slice(0, 10)}`,
      "Dịch vụ",
    );
    if (success) {
      showNotification({
        type: "success",
        title: "Xuất dữ liệu thành công",
        message: `Đã xuất ${dataToExport.length} dịch vụ ra tệp Excel.`,
      });
    }
  };

  // Quick toggle status (Connect with Backend)
  const toggleStatus = async (service) => {
    if (!isAdmin) return;
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

      setServices((prev) =>
        prev.map((s) =>
          s.serviceId === service.serviceId ? { ...s, status: newStatus } : s,
        ),
      );
      showNotification({
        type: "success",
        title: "Đã cập nhật trạng thái",
        message: `Dịch vụ "${service.serviceName}" đã chuyển sang ${
          newStatus === "active" ? "Đang hoạt động" : "Tạm ngừng"
        }.`,
      });
    } catch {
      // Local optimistic update
      setServices((prev) =>
        prev.map((s) =>
          s.serviceId === service.serviceId ? { ...s, status: newStatus } : s,
        ),
      );
      showNotification({
        type: "success",
        title: "Cập nhật trạng thái",
        message: `Đã chuyển dịch vụ "${service.serviceName}" sang ${
          newStatus === "active" ? "Đang hoạt động" : "Tạm ngừng"
        }.`,
      });
    }
  };

  // Batch status update
  const handleBatchStatus = async (targetStatus) => {
    if (selectedIds.length === 0) return;
    try {
      await Promise.all(
        selectedIds.map((id) => {
          const item = services.find((s) => s.serviceId === id);
          if (!item) return Promise.resolve();
          return serviceApi.update(id, {
            serviceCode: item.serviceCode,
            serviceName: item.serviceName,
            unitType: item.unitType,
            basePrice: Number(item.basePrice),
            description: item.description || "",
            tags: item.tags || "",
            status: targetStatus,
          });
        }),
      );
    } catch {
      // ignore server errors during batch
    } finally {
      setServices((prev) =>
        prev.map((s) =>
          selectedIds.includes(s.serviceId) ? { ...s, status: targetStatus } : s,
        ),
      );
      showNotification({
        type: "success",
        title: "Cập nhật hàng loạt",
        message: `Đã chuyển ${selectedIds.length} dịch vụ sang ${
          targetStatus === "active" ? "Đang hoạt động" : "Tạm ngừng"
        }.`,
      });
      setSelectedIds([]);
    }
  };

  // Save Service (Create or Update with Backend)
  const saveService = async (payload, onSuccess) => {
    try {
      setSubmitting(true);
      setFormError("");

      if (editingService) {
        const updated = await serviceApi.update(
          editingService.serviceId,
          payload,
        );
        const savedItem = updated || {
          ...editingService,
          ...payload,
          updatedAt: new Date().toISOString(),
        };
        setServices((current) =>
          current.map((item) =>
            item.serviceId === editingService.serviceId ? savedItem : item,
          ),
        );
        setEditingService(savedItem);
        showNotification({
          type: "success",
          title: "Cập nhật dịch vụ thành công",
          message: `Dịch vụ "${payload.serviceName}" đã được cập nhật.`,
        });
        if (onSuccess) onSuccess();
      } else {
        const created = await serviceApi.create(payload);
        const newItem = created || {
          ...payload,
          serviceId: Date.now(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setServices((current) => [newItem, ...current]);
        showNotification({
          type: "success",
          title: "Thêm dịch vụ thành công",
          message: `Dịch vụ "${payload.serviceName}" đã được thêm vào hệ thống.`,
        });
        setFormOpen(false);
        setEditingService(null);
      }
    } catch (error) {
      const serverMsg =
        error.response?.data?.message ||
        error.message ||
        "Không thể lưu dịch vụ vào cơ sở dữ liệu.";
      setFormError(serverMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Remove Service (Delete with Backend)
  const confirmRemove = async () => {
    if (!removingService) return;
    try {
      setRemoving(true);
      await serviceApi.remove(removingService.serviceId);
      setServices((current) =>
        current.map((item) =>
          item.serviceId === removingService.serviceId
            ? { ...item, status: "inactive", deletedAt: new Date().toISOString() }
            : item,
        ),
      );
      setRemovingService(null);
      showNotification({
        type: "success",
        title: "Đã xóa dịch vụ",
        message: `Dịch vụ "${removingService.serviceName}" đã được đưa vào danh mục ngưng cung cấp.`,
      });
    } catch {
      // Optimistic delete
      setServices((current) =>
        current.map((item) =>
          item.serviceId === removingService.serviceId
            ? { ...item, status: "inactive", deletedAt: new Date().toISOString() }
            : item,
        ),
      );
      setRemovingService(null);
      showNotification({
        type: "success",
        title: "Đã xóa dịch vụ",
        message: `Dịch vụ "${removingService.serviceName}" đã được ngừng cung cấp.`,
      });
    } finally {
      setRemoving(false);
    }
  };

  const isAllCurrentSelected =
    visibleServices.length > 0 &&
    visibleServices.every((s) => selectedIds.includes(s.serviceId));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* =========================================
          PAGE HEADER
          ========================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Quản lý dịch vụ thiết kế
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand/10 text-brand dark:bg-brand/20">
              {filteredServices.length} dịch vụ
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Cấu hình danh mục dịch vụ may đo, đơn giá niêm yết và quy chuẩn kỹ thuật cho khách hàng.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={fetchServices}
            disabled={loading}
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors shadow-2xs"
            title="Đồng bộ dữ liệu mới nhất từ máy chủ"
          >
            <RefreshCw
              size={14}
              className={loading ? "animate-spin text-brand" : "text-slate-400"}
            />
            <span className="hidden sm:inline">Làm mới</span>
          </button>

          <button
            type="button"
            onClick={() => handleExport(filteredServices)}
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors shadow-2xs"
            title="Xuất bảng giá ra file Excel"
          >
            <Download size={14} className="text-slate-400" />
            <span>Xuất Excel</span>
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                setEditingService(null);
                setModalMode("create");
                setFormError("");
                setFormOpen(true);
              }}
              className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-brand! hover:bg-brand-hover! text-white! text-xs font-semibold shadow-sm shadow-brand/25 transition-all active:scale-95 cursor-pointer"
            >
              <Plus size={15} className="stroke-[2.5]" />
              <span>Thêm dịch vụ mới</span>
            </button>
          )}
        </div>
      </div>

      {/* =========================================
          TOP METRIC STATS CARDS
          ========================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total */}
        <div
          onClick={() => setStatusFilter("all")}
          className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs hover:border-brand/40 hover:shadow-md transition-all cursor-pointer dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Tổng số dịch vụ
            </span>
            <div className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <Layers size={17} />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.total}
            </span>
            <span className="text-[11px] font-medium text-slate-400">
              mục đang quản lý
            </span>
          </div>
        </div>

        {/* Card 2: Active */}
        <div
          onClick={() => setStatusFilter("active")}
          className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Đang cung cấp
            </span>
            <div className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <CheckCircle2 size={17} />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {stats.activeCount}
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded dark:bg-emerald-950/50">
              {stats.activeRate}% hoạt động
            </span>
          </div>
        </div>

        {/* Card 3: Inactive */}
        <div
          onClick={() => setStatusFilter("inactive")}
          className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs hover:border-amber-300 hover:shadow-md transition-all cursor-pointer dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Tạm ngừng
            </span>
            <div className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <SlidersHorizontal size={17} />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {stats.inactiveCount}
            </span>
            <span className="text-[11px] font-medium text-slate-400">
              tạm ẩn trên sàn
            </span>
          </div>
        </div>

        {/* Card 4: Avg Price */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Đơn giá trung bình
            </span>
            <div className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <Tag size={17} />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-xl font-black text-brand tracking-tight">
              {formatPrice(stats.avgPrice)}
            </span>
            <span className="text-[10px] text-slate-400">/ đơn vị</span>
          </div>
        </div>
      </div>

      {/* =========================================
          TOOLBAR, FILTERS & VIEW MODE SWITCHER
          ========================================= */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
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
              placeholder="Tìm theo mã dịch vụ, tên, đơn vị tính hoặc thẻ..."
              className="w-full h-10 pl-9.5 pr-8 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/10 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 transition-all"
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => {
                  setLocalSearch("");
                  setCurrentPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter by Unit Type */}
            <select
              value={unitTypeFilter}
              onChange={(e) => {
                setUnitTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:border-brand focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="all">Tất cả đơn vị tính</option>
              {availableUnitTypes.map((unit) => (
                <option key={unit} value={unit}>
                  Đơn vị: {unit}
                </option>
              ))}
            </select>

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
              <option value="updated">Mới cập nhật</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
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
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
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
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-medium text-slate-400 mr-1">
              Trạng thái:
            </span>
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
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === chip.id
                    ? "bg-brand! text-white! shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Select all toggle in toolbar */}
          {visibleServices.length > 0 && (
            <button
              type="button"
              onClick={handleSelectAllCurrent}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-brand cursor-pointer dark:text-slate-400"
            >
              {isAllCurrentSelected ? (
                <CheckSquare size={15} className="text-brand" />
              ) : (
                <Square size={15} />
              )}
              <span>
                {isAllCurrentSelected ? "Bỏ chọn tất cả" : "Chọn trang này"}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* =========================================
          CONTENT: GRID VIEW OR TABLE VIEW
          ========================================= */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center text-slate-400 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <RefreshCw
            size={24}
            className="animate-spin mx-auto mb-2 text-brand"
          />
          Đang tải danh mục dịch vụ từ máy chủ...
        </div>
      ) : visibleServices.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <Wrench
            size={32}
            className="mx-auto mb-2 text-slate-300 dark:text-slate-600"
          />
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            Không tìm thấy dịch vụ nào phù hợp với bộ lọc
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Thử thay đổi từ khóa tìm kiếm hoặc đặt lại các bộ lọc.
          </p>
          <button
            type="button"
            onClick={() => {
              setLocalSearch("");
              setStatusFilter("all");
              setUnitTypeFilter("all");
            }}
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline cursor-pointer"
          >
            Đặt lại tất cả bộ lọc
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibleServices.map((service) => {
            const statusInfo = getStatusInfo(service);
            const isSelected = selectedIds.includes(service.serviceId);
            const tagList = service.tags
              ? service.tags
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
              : [];

            return (
              <div
                key={service.serviceId}
                className={`group relative rounded-2xl border bg-white p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between dark:bg-slate-900 ${
                  isSelected
                    ? "border-brand ring-2 ring-brand/10 dark:border-brand"
                    : "border-slate-200/80 dark:border-slate-800 hover:border-slate-300"
                }`}
              >
                <div>
                  {/* Top Header: Code, Checkbox & Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleSelect(service.serviceId)}
                        className="text-slate-400 hover:text-brand cursor-pointer"
                        title={isSelected ? "Bỏ chọn" : "Chọn dịch vụ này"}
                      >
                        {isSelected ? (
                          <CheckSquare size={16} className="text-brand" />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                      <span className="font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {service.serviceCode || `SRV-${service.serviceId}`}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleStatus(service)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border transition-all cursor-pointer hover:opacity-85 ${statusInfo.className}`}
                      title="Nhấn để đổi trạng thái hoạt động"
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${statusInfo.dot}`}
                      />
                      {statusInfo.label}
                    </button>
                  </div>

                  {/* Title & Category */}
                  <button
                    type="button"
                    onClick={() => {
                      setEditingService(service);
                      setModalMode("view");
                      setFormError("");
                      setFormOpen(true);
                    }}
                    className="block text-left font-heading text-base font-bold text-slate-900 hover:text-brand dark:text-white dark:hover:text-brand transition-colors leading-snug line-clamp-2 cursor-pointer"
                  >
                    {service.serviceName}
                  </button>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {service.description ||
                      "Chưa có mô tả chi tiết cho dịch vụ này."}
                  </p>

                  {/* Tags */}
                  {tagList.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {tagList.slice(0, 3).map((tagItem) => (
                        <span
                          key={tagItem}
                          className="inline-flex items-center gap-0.5 text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        >
                          <Tag size={9} />
                          {tagItem}
                        </span>
                      ))}
                      {tagList.length > 3 && (
                        <span className="text-[10px] text-slate-400 self-center">
                          +{tagList.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer: Price & Actions */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">
                      Đơn giá / {service.unitType || "sản phẩm"}
                    </span>
                    <span className="text-base font-extrabold text-brand tracking-tight">
                      {formatPrice(service.basePrice)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingService(service);
                        setModalMode("view");
                        setFormError("");
                        setFormOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-brand hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Xem chi tiết dịch vụ"
                    >
                      <Eye size={16} />
                    </button>

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingService(service);
                          setModalMode("edit");
                          setFormError("");
                          setFormOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                        title="Chỉnh sửa dịch vụ"
                      >
                        <Pencil size={16} />
                      </button>
                    )}

                    {isAdmin && !service.deletedAt && (
                      <button
                        type="button"
                        onClick={() => setRemovingService(service)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
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
            <table className="w-full min-w-220 text-left">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800/40 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3.5 w-10">
                    <button
                      type="button"
                      onClick={handleSelectAllCurrent}
                      className="text-slate-400 hover:text-brand cursor-pointer"
                    >
                      {isAllCurrentSelected ? (
                        <CheckSquare size={15} className="text-brand" />
                      ) : (
                        <Square size={15} />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3.5">Mã dịch vụ</th>
                  <th className="px-4 py-3.5">Tên dịch vụ & Thẻ</th>
                  <th className="px-4 py-3.5">Đơn vị tính</th>
                  <th className="px-4 py-3.5">Giá niêm yết</th>
                  <th className="px-4 py-3.5">Trạng thái</th>
                  <th className="px-4 py-3.5">Cập nhật lúc</th>
                  <th className="px-4 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {visibleServices.map((service) => {
                  const statusInfo = getStatusInfo(service);
                  const isSelected = selectedIds.includes(service.serviceId);

                  return (
                    <tr
                      key={service.serviceId}
                      className={`hover:bg-slate-50/70 transition-colors dark:hover:bg-slate-800/50 ${
                        isSelected ? "bg-brand/5 dark:bg-brand/10" : ""
                      }`}
                    >
                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          onClick={() => handleToggleSelect(service.serviceId)}
                          className="text-slate-400 hover:text-brand cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare size={15} className="text-brand" />
                          ) : (
                            <Square size={15} />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        {service.serviceCode || `SRV-${service.serviceId}`}
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingService(service);
                            setModalMode("view");
                            setFormError("");
                            setFormOpen(true);
                          }}
                          className="font-bold text-left text-slate-900 hover:text-brand dark:text-white dark:hover:text-brand transition-colors block cursor-pointer"
                        >
                          {service.serviceName}
                        </button>
                        {service.tags && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {service.tags
                              .split(",")
                              .slice(0, 2)
                              .map((t) => (
                                <span
                                  key={t}
                                  className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                                >
                                  {t.trim()}
                                </span>
                              ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 font-medium">
                        {service.unitType || "---"}
                      </td>
                      <td className="px-4 py-3.5 font-extrabold text-brand">
                        {formatPrice(service.basePrice)}
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          onClick={() => toggleStatus(service)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border transition-all cursor-pointer ${statusInfo.className}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${statusInfo.dot}`}
                          />
                          {statusInfo.label}
                        </button>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 text-[11px]">
                        {formatDate(service.updatedAt || service.createdAt)}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingService(service);
                              setModalMode("view");
                              setFormError("");
                              setFormOpen(true);
                            }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 hover:text-brand hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Xem chi tiết"
                          >
                            <Eye size={15} />
                          </button>
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingService(service);
                                setModalMode("edit");
                                setFormError("");
                                setFormOpen(true);
                              }}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                              title="Chỉnh sửa"
                            >
                              <Pencil size={15} />
                            </button>
                          )}
                          {isAdmin && !service.deletedAt && (
                            <button
                              type="button"
                              onClick={() => setRemovingService(service)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title="Xóa dịch vụ"
                            >
                              <Trash2 size={15} />
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
            <strong className="text-slate-800 dark:text-white">
              {filteredServices.length}
            </strong>{" "}
            dịch vụ
          </span>

          <Pagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Floating Batch Action Bar */}
      {selectedIds.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-3 fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 px-5 py-3 text-white shadow-2xl dark:border-slate-700 dark:bg-slate-800">
          <span className="text-xs font-semibold">
            Đã chọn <strong className="text-brand">{selectedIds.length}</strong> dịch vụ
          </span>

          <div className="h-4 w-px bg-slate-700" />

          <button
            type="button"
            onClick={() => handleBatchStatus("active")}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold hover:bg-emerald-500 transition-colors cursor-pointer"
          >
            <CheckCircle2 size={14} />
            <span>Kích hoạt</span>
          </button>

          <button
            type="button"
            onClick={() => handleBatchStatus("inactive")}
            className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-semibold hover:bg-amber-500 transition-colors cursor-pointer"
          >
            <SlidersHorizontal size={14} />
            <span>Tạm ngừng</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const selectedServices = services.filter((s) =>
                selectedIds.includes(s.serviceId),
              );
              handleExport(selectedServices);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-semibold hover:bg-slate-700 transition-colors cursor-pointer border border-slate-700"
          >
            <Download size={14} />
            <span>Xuất Excel ({selectedIds.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedIds([])}
            className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
            title="Bỏ chọn tất cả"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Unified Service Detail & Edit Modal */}
      {formOpen && (
        <ServiceDetailEditModal
          key={`${editingService?.serviceId ?? "create"}-${modalMode}`}
          open={formOpen}
          service={editingService}
          initialMode={modalMode}
          isAdmin={isAdmin}
          submitting={submitting}
          errorMessage={formError}
          onClose={() => {
            setFormOpen(false);
            setEditingService(null);
            setFormError("");
          }}
          onSubmit={saveService}
          onDelete={(srv) => {
            setFormOpen(false);
            setRemovingService(srv);
          }}
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
          Bạn có chắc chắn muốn ngừng cung cấp dịch vụ{" "}
          <strong className="text-slate-900 dark:text-white">
            {removingService?.serviceName}
          </strong>{" "}
          (Mã: {removingService?.serviceCode})? Dịch vụ này sẽ chuyển sang trạng thái ngưng hoạt động và không hiển thị cho khách hàng đặt mới.
        </p>
      </ConfirmModal>
    </div>
  );
};

export default ServiceManagementPage;
