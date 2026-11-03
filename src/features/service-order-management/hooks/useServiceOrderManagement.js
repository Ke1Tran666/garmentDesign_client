import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNotification } from "@/app/providers/NotificationProvider";
import { serviceOrderApi } from "@/entities/service-order/api/serviceOrderApi";
import { exportToExcel } from "@/shared/lib/exportUtils";
import {
  formatDate,
  formatPrice,
  getOrderStatusValue,
  getStatusInfo,
  PAGE_SIZE,
} from "../lib/serviceOrderUtils";

export const useServiceOrderManagement = (searchKeyword = "") => {
  const { showNotification } = useNotification();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [localSearch, setLocalSearch] = useState("");
  const deferredSearch = useDeferredValue(localSearch || searchKeyword);

  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("table"); // "table" or "kanban"
  const [currentPage, setCurrentPage] = useState(1);

  // Selected Order for detail modal
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Delete modal state
  const [removingOrder, setRemovingOrder] = useState(null);
  const [removing, setRemoving] = useState(false);

  // Batch selection
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Fetch all orders
  const fetchOrders = useCallback(() => {
    setLoading(true);
    serviceOrderApi
      .getAll()
      .then((data) => {
        setOrders(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        setOrders([]);
        showNotification({
          type: "error",
          title: "Lỗi tải dữ liệu",
          message:
            error.response?.data?.message ||
            "Không thể tải danh sách đơn dịch vụ.",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [showNotification]);

  // Initial load
  useEffect(() => {
    let active = true;
    serviceOrderApi
      .getAll()
      .then((data) => {
        if (!active) return;
        setOrders(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!active) return;
        setOrders([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // Compute Order Stats
  const stats = useMemo(() => {
    const total = orders.length;
    let pendingCount = 0;
    let activeCount = 0;
    let completedCount = 0;
    let totalRevenue = 0;

    orders.forEach((o) => {
      const st = getOrderStatusValue(o);
      if (st === "pending") pendingCount++;
      else if (st === "active") activeCount++;
      else if (st === "completed") completedCount++;

      const price = Number(o.totalPrice);
      if (Number.isFinite(price) && st !== "cancelled") totalRevenue += price;
    });

    return { total, pendingCount, activeCount, completedCount, totalRevenue };
  }, [orders]);

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    const keyword = deferredSearch.trim().toLowerCase();

    const result = orders.filter((order) => {
      const matchesKeyword =
        !keyword ||
        [
          `ORD-${order.serviceOrderId}`,
          order.productName,
          order.user?.fullName,
          order.user?.userCode,
          order.user?.phone,
          order.service?.serviceName,
          order.service?.serviceCode,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(keyword);

      const orderStatus = getOrderStatusValue(order);
      const matchesStatus =
        statusFilter === "all" || orderStatus === statusFilter;

      return matchesKeyword && matchesStatus;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "price-desc") {
        return (Number(b.totalPrice) || 0) - (Number(a.totalPrice) || 0);
      }
      if (sortBy === "price-asc") {
        return (Number(a.totalPrice) || 0) - (Number(b.totalPrice) || 0);
      }
      if (sortBy === "oldest") {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeA - timeB;
      }
      // default "newest"
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });

    return result;
  }, [orders, deferredSearch, statusFilter, sortBy]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const visibleOrders = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredOrders.slice(start, start + PAGE_SIZE);
  }, [filteredOrders, safeCurrentPage]);

  // Fast status transition in Kanban
  const handleQuickAdvanceStatus = async (order, targetStatus) => {
    try {
      await serviceOrderApi.update(order.serviceOrderId, {
        status: targetStatus,
      });
      setOrders((prev) =>
        prev.map((o) =>
          o.serviceOrderId === order.serviceOrderId
            ? { ...o, status: targetStatus }
            : o,
        ),
      );
      showNotification({
        type: "success",
        title: "Cập nhật tiến độ đơn",
        message: `Đơn ORD-${order.serviceOrderId} đã chuyển trạng thái sang "${
          targetStatus === "active"
            ? "Đang xử lý"
            : targetStatus === "completed"
              ? "Hoàn tất"
              : targetStatus
        }".`,
      });
    } catch {
      showNotification({
        type: "error",
        title: "Thất bại",
        message: "Không thể cập nhật trạng thái đơn hàng.",
      });
    }
  };

  // Export to Excel
  const handleExport = () => {
    const exportData = filteredOrders.map((o) => ({
      "Mã đơn": `ORD-${o.serviceOrderId}`,
      "Khách hàng": o.user?.fullName || "---",
      "Số điện thoại": o.user?.phone || "---",
      "Sản phẩm / Mẫu": o.productName || "---",
      "Dịch vụ": o.service?.serviceName || "---",
      "Tổng tiền": formatPrice(o.totalPrice),
      "Trạng thái": getStatusInfo(o).label,
      "Ngày tạo": formatDate(o.createdAt),
    }));

    const success = exportToExcel(
      exportData,
      "Danh_Sach_Don_Dich_Vu",
      "Orders",
    );
    if (success) {
      showNotification({
        type: "success",
        title: "Xuất dữ liệu thành công",
        message: "Tệp Excel danh sách đơn dịch vụ đã được tải về.",
      });
    }
  };

  // Confirm delete
  const confirmRemove = async () => {
    if (!removingOrder) return;
    try {
      setRemoving(true);
      await serviceOrderApi.removeByAdmin(removingOrder.serviceOrderId);
      setOrders((current) =>
        current.filter(
          (o) => o.serviceOrderId !== removingOrder.serviceOrderId,
        ),
      );
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(removingOrder.serviceOrderId);
        return next;
      });
      showNotification({
        type: "success",
        title: "Đã xóa đơn dịch vụ",
        message: `Đơn ORD-${removingOrder.serviceOrderId} đã được xóa thành công.`,
      });
      setRemovingOrder(null);
    } catch (error) {
      showNotification({
        type: "error",
        title: "Xóa thất bại",
        message: error.response?.data?.message || "Không thể xóa đơn dịch vụ.",
      });
    } finally {
      setRemoving(false);
    }
  };

  // Group orders for Kanban
  const kanbanColumns = useMemo(() => {
    return [
      {
        id: "pending",
        title: "Chờ tiếp nhận",
        orders: filteredOrders.filter(
          (o) => getOrderStatusValue(o) === "pending",
        ),
        color: "bg-amber-500",
        badge:
          "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900",
      },
      {
        id: "active",
        title: "Đang xử lý / Thiết kế",
        orders: filteredOrders.filter(
          (o) => getOrderStatusValue(o) === "active",
        ),
        color: "bg-blue-500",
        badge:
          "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900",
      },
      {
        id: "completed",
        title: "Nghiệm thu & Hoàn tất",
        orders: filteredOrders.filter(
          (o) => getOrderStatusValue(o) === "completed",
        ),
        color: "bg-emerald-500",
        badge:
          "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900",
      },
      {
        id: "cancelled",
        title: "Đã hủy / Tạm ngừng",
        orders: filteredOrders.filter((o) => {
          const st = getOrderStatusValue(o);
          return st === "cancelled" || st === "inactive";
        }),
        color: "bg-slate-400",
        badge:
          "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
      },
    ];
  }, [filteredOrders]);

  // Selection handlers
  const toggleSelectItem = (orderId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const isAllCurrentSelected = useMemo(() => {
    if (visibleOrders.length === 0) return false;
    return visibleOrders.every((o) => selectedIds.has(o.serviceOrderId));
  }, [visibleOrders, selectedIds]);

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (isAllCurrentSelected) {
        visibleOrders.forEach((o) => next.delete(o.serviceOrderId));
      } else {
        visibleOrders.forEach((o) => next.add(o.serviceOrderId));
      }
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  // Reset filters
  const resetFilters = () => {
    setLocalSearch("");
    setStatusFilter("all");
    setSortBy("newest");
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleSearchChange = (value) => {
    setLocalSearch(value);
    setCurrentPage(1);
  };

  return {
    orders,
    loading,
    localSearch,
    setLocalSearch,
    deferredSearch,
    statusFilter,
    setStatusFilter: handleStatusFilterChange,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    currentPage: safeCurrentPage,
    setCurrentPage,
    totalPages,
    selectedOrder,
    setSelectedOrder,
    removingOrder,
    setRemovingOrder,
    removing,
    selectedIds,
    selectedCount: selectedIds.size,
    isAllCurrentSelected,
    stats,
    filteredOrders,
    visibleOrders,
    kanbanColumns,
    fetchOrders,
    handleQuickAdvanceStatus,
    handleExport,
    confirmRemove,
    toggleSelectItem,
    toggleSelectAll,
    clearSelection,
    resetFilters,
    handleSearchChange,
  };
};
