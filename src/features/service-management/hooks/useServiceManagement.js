import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { serviceApi } from "@/entities/service/api/serviceApi";
import { resolveAppRole } from "@/features/auth/lib/authRole";
import { useNotification } from "@/app/providers/NotificationProvider";
import { exportToExcel } from "@/shared/lib/exportUtils";
import {
  FALLBACK_SERVICES,
  formatDate,
  formatPrice,
  getStatusInfo,
} from "../lib/serviceUtils";

const PAGE_SIZE = 12;

export const useServiceManagement = ({ adminUser, searchKeyword = "" } = {}) => {
  const { showNotification } = useNotification();
  const isAdmin = resolveAppRole(adminUser) === "admin";

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [localSearch, setLocalSearch] = useState("");
  const deferredSearch = useDeferredValue(localSearch || searchKeyword);
  const [statusFilter, setStatusFilter] = useState("all");
  const [unitTypeFilter, setUnitTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);

  // Batch selection
  const [selectedIds, setSelectedIds] = useState([]);

  // Form modal
  const [formOpen, setFormOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [modalMode, setModalMode] = useState("view");
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
          setServices(FALLBACK_SERVICES);
        }
      })
      .catch((error) => {
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

  const unitTypeOptions = useMemo(
    () => [
      { value: "all", label: "Tất cả đơn vị tính" },
      ...availableUnitTypes.map((unit) => ({
        value: unit,
        label: `Đơn vị: ${unit}`,
      })),
    ],
    [availableUnitTypes],
  );

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

  const totalPages = Math.max(
    1,
    Math.ceil(filteredServices.length / PAGE_SIZE),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const visibleServices = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredServices.slice(start, start + PAGE_SIZE);
  }, [filteredServices, safeCurrentPage]);

  // Selection handlers
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

  const isAllCurrentSelected =
    visibleServices.length > 0 &&
    visibleServices.every((s) => selectedIds.includes(s.serviceId));

  // Export
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

  // Status toggle
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
          selectedIds.includes(s.serviceId)
            ? { ...s, status: targetStatus }
            : s,
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

  // Save Service
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

  // Remove Service
  const confirmRemove = async () => {
    if (!removingService) return;
    try {
      setRemoving(true);
      await serviceApi.remove(removingService.serviceId);
      setServices((current) =>
        current.map((item) =>
          item.serviceId === removingService.serviceId
            ? {
                ...item,
                status: "inactive",
                deletedAt: new Date().toISOString(),
              }
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
      setServices((current) =>
        current.map((item) =>
          item.serviceId === removingService.serviceId
            ? {
                ...item,
                status: "inactive",
                deletedAt: new Date().toISOString(),
              }
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

  const resetFilters = () => {
    setLocalSearch("");
    setStatusFilter("all");
    setUnitTypeFilter("all");
    setCurrentPage(1);
  };

  const handleOpenCreate = () => {
    setEditingService(null);
    setModalMode("create");
    setFormError("");
    setFormOpen(true);
  };

  const handleOpenView = (service) => {
    setEditingService(service);
    setModalMode("view");
    setFormError("");
    setFormOpen(true);
  };

  const handleOpenEdit = (service) => {
    setEditingService(service);
    setModalMode("edit");
    setFormError("");
    setFormOpen(true);
  };

  return {
    isAdmin,
    services,
    loading,
    submitting,
    removing,
    localSearch,
    setLocalSearch,
    statusFilter,
    setStatusFilter,
    unitTypeFilter,
    setUnitTypeFilter,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    currentPage,
    setCurrentPage,
    selectedIds,
    setSelectedIds,
    filteredServices,
    visibleServices,
    totalPages,
    safeCurrentPage,
    stats,
    unitTypeOptions,
    isAllCurrentSelected,
    formOpen,
    setFormOpen,
    editingService,
    setEditingService,
    modalMode,
    formError,
    setFormError,
    removingService,
    setRemovingService,
    fetchServices,
    handleExport,
    toggleStatus,
    handleBatchStatus,
    saveService,
    confirmRemove,
    resetFilters,
    handleOpenCreate,
    handleOpenView,
    handleOpenEdit,
    handleToggleSelect,
    handleSelectAllCurrent,
    PAGE_SIZE,
  };
};
