import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  Kanban,
  List,
  Package,
  RefreshCw,
  Search,
  ShoppingBag,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import { useOutletContext } from "react-router-dom";

import { serviceOrderApi } from "@/entities/service-order/api/serviceOrderApi";
import { useNotification } from "@/app/providers/NotificationProvider";
import AdminServiceOrderDetailModal from "@/features/service-order-management/ui/AdminServiceOrderDetailModal";
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

const getOrderStatusValue = (order) => {
  const status = String(order?.status || "").trim().toLowerCase();
  if (status === "inactive" && order?.deletedAt) return "cancelled";
  if (status === "completed" || status === "done") return "completed";
  return status;
};

const getStatusInfo = (order) => {
  const status = getOrderStatusValue(order);

  if (status === "pending") {
    return {
      label: "Chờ tiếp nhận",
      className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900",
      dot: "bg-amber-500",
    };
  }

  if (status === "active") {
    return {
      label: "Đang xử lý",
      className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900",
      dot: "bg-blue-500",
    };
  }

  if (status === "completed") {
    return {
      label: "Hoàn tất",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900",
      dot: "bg-emerald-500",
    };
  }

  if (status === "cancelled") {
    return {
      label: "Đã hủy",
      className: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900",
      dot: "bg-rose-500",
    };
  }

  return {
    label: "Ngừng xử lý",
    className: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
    dot: "bg-slate-400",
  };
};

const ServiceOrderManagementPage = () => {
  const { searchKeyword = "" } = useOutletContext() || {};
  const { showNotification } = useNotification();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [localSearch, setLocalSearch] = useState("");
  const deferredSearch = useDeferredValue(localSearch || searchKeyword);

  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("table"); // "table" or "kanban"
  const [currentPage, setCurrentPage] = useState(1);

  // Selected Order for detail modal
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Delete modal
  const [removingOrder, setRemovingOrder] = useState(null);
  const [removing, setRemoving] = useState(false);

  const fetchOrders = () => {
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
          message: error.response?.data?.message || "Không thể tải danh sách đơn dịch vụ.",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

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

  // Filtered orders
  const filteredOrders = useMemo(() => {
    const keyword = deferredSearch.trim().toLowerCase();

    return orders.filter((order) => {
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
      const matchesStatus = statusFilter === "all" || orderStatus === statusFilter;

      return matchesKeyword && matchesStatus;
    });
  }, [orders, deferredSearch, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const visibleOrders = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredOrders.slice(start, start + PAGE_SIZE);
  }, [filteredOrders, safeCurrentPage]);

  // Fast Status advance in Kanban
  const handleQuickAdvanceStatus = async (order, targetStatus) => {
    try {
      await serviceOrderApi.update(order.serviceOrderId, {
        status: targetStatus,
      });
      setOrders((prev) =>
        prev.map((o) =>
          o.serviceOrderId === order.serviceOrderId ? { ...o, status: targetStatus } : o
        )
      );
      showNotification({
        type: "success",
        title: "Cập nhật tiến độ đơn",
        message: `Đơn ORD-${order.serviceOrderId} đã chuyển trạng thái sang "${
          targetStatus === "active" ? "Đang xử lý" : targetStatus === "completed" ? "Hoàn tất" : targetStatus
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

  // Export
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

    const success = exportToExcel(exportData, "Danh_Sach_Don_Dich_Vu", "Orders");
    if (success) {
      showNotification({
        type: "success",
        title: "Xuất dữ liệu thành công",
        message: "Tệp Excel danh sách đơn dịch vụ đã được tải về.",
      });
    }
  };

  // Remove order
  const confirmRemove = async () => {
    if (!removingOrder) return;
    try {
      setRemoving(true);
      await serviceOrderApi.removeByAdmin(removingOrder.serviceOrderId);
      setOrders((current) =>
        current.filter((o) => o.serviceOrderId !== removingOrder.serviceOrderId)
      );
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
        orders: filteredOrders.filter((o) => getOrderStatusValue(o) === "pending"),
        color: "bg-amber-500",
        badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900",
      },
      {
        id: "active",
        title: "Đang xử lý / Thiết kế",
        orders: filteredOrders.filter((o) => getOrderStatusValue(o) === "active"),
        color: "bg-blue-500",
        badge: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900",
      },
      {
        id: "completed",
        title: "Nghiệm thu & Hoàn tất",
        orders: filteredOrders.filter((o) => getOrderStatusValue(o) === "completed"),
        color: "bg-emerald-500",
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900",
      },
      {
        id: "cancelled",
        title: "Đã hủy / Tạm ngừng",
        orders: filteredOrders.filter(
          (o) => getOrderStatusValue(o) === "cancelled" || getOrderStatusValue(o) === "inactive"
        ),
        color: "bg-slate-400",
        badge: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
      },
    ];
  }, [filteredOrders]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* =========================================
          PAGE HEADER
          ========================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Quản lý đơn dịch vụ
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {filteredOrders.length} đơn hàng
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Theo dõi tiến trình thiết kế rập, nhảy size và kiểm duyệt đơn hàng dịch vụ khách hàng.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={fetchOrders}
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
        </div>
      </div>

      {/* =========================================
          TOP METRIC STATS
          ========================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Tổng số đơn
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <ShoppingBag size={17} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {stats.total}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Chờ tiếp nhận
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <Clock3 size={17} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {stats.pendingCount}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Đang xử lý
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-50 text-brand dark:bg-sky-950/50 dark:text-sky-400">
              <Package size={17} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {stats.activeCount}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Doanh thu từ đơn
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <TrendingUp size={17} />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
            {formatPrice(stats.totalRevenue)}
          </div>
        </div>
      </div>

      {/* =========================================
          TOOLBAR & VIEW MODE (LIST vs KANBAN)
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
              placeholder="Tìm theo mã đơn (ORD-xxx), khách hàng, dịch vụ, mẫu..."
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

          <div className="flex items-center gap-2.5">
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  viewMode === "table"
                    ? "bg-white text-brand shadow-xs dark:bg-slate-700 dark:text-white"
                    : "hover:text-slate-900"
                }`}
                title="Bảng dữ liệu"
              >
                <List size={15} />
                <span>Bảng</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("kanban")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  viewMode === "kanban"
                    ? "bg-white text-brand shadow-xs dark:bg-slate-700 dark:text-white"
                    : "hover:text-slate-900"
                }`}
                title="Kanban Pipeline"
              >
                <Kanban size={15} />
                <span>Quy trình (Kanban)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Status Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-medium text-slate-400 mr-1">Trạng thái:</span>
          {[
            { id: "all", label: "Tất cả" },
            { id: "pending", label: "Chờ tiếp nhận" },
            { id: "active", label: "Đang xử lý" },
            { id: "completed", label: "Hoàn tất" },
            { id: "cancelled", label: "Đã hủy" },
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
          CONTENT: TABLE VIEW OR KANBAN BOARD
          ========================================= */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center text-slate-400 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-brand" />
          Đang tải danh sách đơn dịch vụ...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <Package size={32} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
          <p className="font-semibold text-slate-600 dark:text-slate-300">
            Không tìm thấy đơn hàng nào phù hợp
          </p>
          <button
            type="button"
            onClick={() => {
              setLocalSearch("");
              setStatusFilter("all");
            }}
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
          >
            Xóa bộ lọc
          </button>
        </div>
      ) : viewMode === "kanban" ? (
        /* KANBAN PIPELINE VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {kanbanColumns.map((col) => (
            <div
              key={col.id}
              className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-900/60 flex flex-col gap-3 min-h-120"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800 px-1">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${col.color}`} />
                  <span className="font-bold text-xs text-slate-900 dark:text-white">
                    {col.title}
                  </span>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-2xs">
                  {col.orders.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {col.orders.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    Không có đơn trong bước này
                  </div>
                ) : (
                  col.orders.map((order) => {
                    return (
                      <div
                        key={order.serviceOrderId}
                        onClick={() => setSelectedOrder(order)}
                        className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs hover:shadow-md transition-all cursor-pointer dark:border-slate-800 dark:bg-slate-900 space-y-2.5 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] font-bold text-brand">
                            ORD-{order.serviceOrderId}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {formatDate(order.createdAt).split(" ")[0]}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1 group-hover:text-brand transition-colors">
                            {order.productName || "Sản phẩm may mặc"}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                            {order.service?.serviceName || "Dịch vụ rập"}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                          <span className="text-[11px] text-slate-500 truncate max-w-28">
                            {order.user?.fullName || "Khách hàng"}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {formatPrice(order.totalPrice)}
                          </span>
                        </div>

                        {/* Quick Kanban Action button */}
                        {col.id === "pending" && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickAdvanceStatus(order, "active");
                            }}
                            className="w-full mt-1 py-1 rounded-lg bg-blue-50 text-brand text-[11px] font-semibold hover:bg-brand hover:text-white transition-colors flex items-center justify-center gap-1"
                          >
                            <span>Tiếp nhận & Xử lý</span>
                            <ArrowRight size={12} />
                          </button>
                        )}
                        {col.id === "active" && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickAdvanceStatus(order, "completed");
                            }}
                            className="w-full mt-1 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[11px] font-semibold hover:bg-emerald-600 hover:text-white transition-colors flex items-center justify-center gap-1"
                          >
                            <span>Hoàn tất nghiệm thu</span>
                            <CheckCircle2 size={12} />
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full min-w-240 text-left">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800/40 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Mã đơn & Mẫu</th>
                  <th className="px-4 py-3.5">Khách hàng</th>
                  <th className="px-4 py-3.5">Dịch vụ</th>
                  <th className="px-4 py-3.5">Tổng tiền</th>
                  <th className="px-4 py-3.5">Ngày tạo</th>
                  <th className="px-4 py-3.5">Trạng thái</th>
                  <th className="px-4 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {visibleOrders.map((order) => {
                  const statusInfo = getStatusInfo(order);
                  return (
                    <tr
                      key={order.serviceOrderId}
                      className="hover:bg-slate-50/70 transition-colors dark:hover:bg-slate-800/50"
                    >
                      <td className="px-5 py-3.5">
                        <div className="font-mono text-xs font-bold text-brand">
                          ORD-{order.serviceOrderId}
                        </div>
                        <div className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate max-w-50">
                          {order.productName || "Mẫu chưa đặt tên"}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900 dark:text-white truncate">
                          {order.user?.fullName || "Khách hàng"}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {order.user?.phone || order.user?.userCode || "---"}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {order.service?.serviceName || "Dịch vụ may mặc"}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {order.service?.serviceCode || order.unitType || ""}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                        {formatPrice(order.totalPrice)}
                      </td>

                      <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">
                        {formatDate(order.createdAt)}
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusInfo.className}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.dot}`} />
                          {statusInfo.label}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 hover:text-brand hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Xem chi tiết đơn"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setRemovingOrder(order)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Xóa đơn hàng"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination bar */}
          {!loading && filteredOrders.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500">
                Hiển thị {(safeCurrentPage - 1) * PAGE_SIZE + 1} -{" "}
                {Math.min(safeCurrentPage * PAGE_SIZE, filteredOrders.length)} trên tổng số{" "}
                <strong className="text-slate-800 dark:text-white">{filteredOrders.length}</strong>
              </span>

              <Pagination
                currentPage={safeCurrentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <AdminServiceOrderDetailModal
          open={Boolean(selectedOrder)}
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        open={Boolean(removingOrder)}
        title="Xóa đơn dịch vụ"
        confirmText="Xác nhận xóa"
        confirmVariant="danger"
        submitting={removing}
        onClose={() => setRemovingOrder(null)}
        onConfirm={confirmRemove}
      >
        <p>
          Bạn có chắc chắn muốn xóa đơn dịch vụ{" "}
          <strong className="text-slate-900 dark:text-white">
            ORD-{removingOrder?.serviceOrderId}
          </strong>
          ? Thao tác này sẽ xóa vĩnh viễn đơn hàng này khỏi cơ sở dữ liệu.
        </p>
      </ConfirmModal>
    </div>
  );
};

export default ServiceOrderManagementPage;
