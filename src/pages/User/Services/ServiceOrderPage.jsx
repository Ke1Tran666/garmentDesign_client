import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CheckCircle2,
  ClipboardList,
  Clock,
  Clock3,
  Eye,
  MoreVertical,
  Package,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { useOutletContext, useSearchParams } from "react-router-dom";

import { serviceOrderApi } from "@/entities/service-order/api/serviceOrderApi";
import ServiceOrderCreateModal from "@/features/service-orders/ui/ServiceOrderCreateModal";
import ServiceOrderDetailModal from "@/features/service-orders/ui/ServiceOrderDetailModal";
import { BACKEND_URL } from "@/shared/config/apiConfig";
import { StatusBadge } from "@/shared/ui/badge/StatusBadge";
import PageHeader from "@/shared/ui/heading/PageHeader";
import MenuTable from "@/shared/ui/menu/MenuTable";
import ConfirmModal from "@/shared/ui/modal/ConfirmModal";
import { TableSkeleton } from "@/shared/ui/skeleton";
import StatCard from "@/shared/ui/stats/StatCard";
import DataTable from "@/shared/ui/table/DataTable";
import Pagination from "@/shared/ui/table/Pagination";

const hasEmployeeReceiver = (order) => {
  const createdBy = String(order?.createdBy || "").trim();
  const updatedBy = String(order?.updatedBy || "").trim();
  return Boolean(createdBy || updatedBy);
};

const isCancelledOrder = (order) => {
  const databaseStatus = String(
    order?.databaseStatus || order?.status || "",
  ).toLowerCase();

  return databaseStatus === "inactive" && Boolean(order?.deletedAt);
};

const getProgressByStatus = (status) => {
  const text = String(status || "").toLowerCase();
  if (text === "pending") return 35;
  if (text === "active") return 65;
  if (text === "completed") return 100;
  return 0;
};

const getStatusMeta = (order) => {
  if (isCancelledOrder(order)) {
    return {
      filterKey: "cancelled",
      label: "Đã hủy đơn hàng",
      tone: "danger",
    };
  }

  const text = String(
    order?.databaseStatus || order?.status || "",
  ).toLowerCase();

  if (text === "pending") {
    return {
      filterKey: "pending",
      label: "Chờ tiếp nhận",
      tone: "warning",
    };
  }

  if (text === "active") {
    return {
      filterKey: "active",
      label: "Đang xử lý",
      tone: "info",
    };
  }

  if (text === "completed") {
    return {
      filterKey: "completed",
      label: "Hoàn tất",
      tone: "success",
    };
  }

  return {
    filterKey: "other",
    label: order?.status || "Không xác định",
    tone: "neutral",
  };
};

const formatDate = (dateValue) => {
  if (!dateValue) return "Chưa có";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue;

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

const formatCurrency = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return "Đang báo giá";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(num);
};

const resolveImageUrl = (value) => {
  if (!value) return "";
  if (/^(https?:\/\/|blob:|data:)/i.test(value)) return value;
  return `${BACKEND_URL}${value.startsWith("/") ? value : `/${value}`}`;
};

const mapOrderToTable = (order) => {
  const databaseStatus = String(order.status || "pending").toLowerCase();
  const cancelled = databaseStatus === "inactive" && Boolean(order.deletedAt);

  return {
    ...order,
    id: order.serviceOrderId,
    orderCode: `ORD-${order.serviceOrderId}`,
    customer: order.user?.fullName || "Không rõ",
    serviceName: order.service?.serviceName || "Không rõ dịch vụ",
    deadline: formatDate(order.completedDate || order.receivedDate),
    databaseStatus,
    status: cancelled ? "Đã hủy đơn hàng" : databaseStatus,
    progress: cancelled ? 0 : getProgressByStatus(databaseStatus),
  };
};

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chờ tiếp nhận" },
  { value: "active", label: "Đang xử lý" },
  { value: "completed", label: "Hoàn tất" },
  { value: "cancelled", label: "Đã hủy" },
];

const initialActionMenuState = {
  open: false,
  x: 0,
  y: 0,
  order: null,
};

const PAGE_SIZE = 15;

const SERVICE_ORDER_COLUMNS = [
  { key: "orderCode", title: "Mã đơn" },
  { key: "serviceName", title: "Dịch vụ & Sản phẩm" },
  { key: "deadline", title: "Ngày hẹn / Hoàn thành" },
  { key: "totalPrice", title: "Chi phí" },
  { key: "progress", title: "Tiến độ" },
  { key: "status", title: "Trạng thái" },
  { key: "action", title: "Thao tác", className: "text-center" },
];

const ServiceOrderPage = () => {
  const { searchKeyword: topbarSearch = "" } = useOutletContext() || {};
  const [searchParams, setSearchParams] = useSearchParams();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const deferredSearchValue = useDeferredValue(searchValue || topbarSearch);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(
    () => searchParams.get("create") === "1",
  );
  const [actionMenu, setActionMenu] = useState(initialActionMenuState);
  const [currentPage, setCurrentPage] = useState(1);

  const [removingOrder, setRemovingOrder] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState("");

  const isCreateModalOpen =
    createModalOpen || searchParams.get("create") === "1";

  const reloadServiceOrders = useCallback(async () => {
    try {
      setRefreshing(true);
      setErrorMessage("");

      const orderData = await serviceOrderApi.getMine();
      setOrders((orderData || []).map(mapOrderToTable));
    } catch (error) {
      console.error("Lỗi tải danh sách đơn hàng:", error);
      setOrders([]);
      setErrorMessage(
        error.response?.data?.message || "Không thể tải danh sách đơn hàng.",
      );
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    serviceOrderApi
      .getMine()
      .then((orderData) => {
        if (!active) return;
        setOrders((orderData || []).map(mapOrderToTable));
      })
      .catch((error) => {
        if (!active) return;
        console.error("Lỗi tải danh sách đơn hàng:", error);
        setOrders([]);
        setErrorMessage(
          error.response?.data?.message || "Không thể tải danh sách đơn hàng.",
        );
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    let pending = 0;
    let active = 0;
    let completed = 0;
    let cancelled = 0;

    orders.forEach((order) => {
      const meta = getStatusMeta(order);
      if (meta.filterKey === "pending") pending += 1;
      else if (meta.filterKey === "active") active += 1;
      else if (meta.filterKey === "completed") completed += 1;
      else if (meta.filterKey === "cancelled") cancelled += 1;
    });

    return {
      total: orders.length,
      pending,
      active,
      completed,
      cancelled,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const keyword = deferredSearchValue.trim().toLowerCase();

    return orders.filter((order) => {
      const statusMeta = getStatusMeta(order);
      if (statusFilter !== "all" && statusMeta.filterKey !== statusFilter) {
        return false;
      }

      if (!keyword) return true;

      return [
        order.orderCode,
        order.customer,
        order.serviceName,
        order.productName,
        statusMeta.label,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    });
  }, [orders, deferredSearchValue, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const visibleOrders = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredOrders.slice(start, start + PAGE_SIZE);
  }, [filteredOrders, safeCurrentPage]);

  const hasActiveFilters =
    Boolean(searchValue.trim()) || statusFilter !== "all";

  const handleResetFilters = () => {
    setSearchValue("");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  const handleCloseActionMenu = useCallback(() => {
    setActionMenu(initialActionMenuState);
  }, []);

  const handleOpenActionMenu = (event, order) => {
    event.stopPropagation();

    const buttonRect = event.currentTarget.getBoundingClientRect();
    const menuWidth = 184;
    const menuHeight = 96;
    const screenPadding = 12;

    let x = buttonRect.right - menuWidth;
    let y = buttonRect.bottom + 8;

    if (x < screenPadding) x = screenPadding;
    if (x + menuWidth > window.innerWidth - screenPadding) {
      x = window.innerWidth - menuWidth - screenPadding;
    }
    if (y + menuHeight > window.innerHeight - screenPadding) {
      y = buttonRect.top - menuHeight - 8;
    }

    setActionMenu({
      open: true,
      x,
      y,
      order,
    });
  };

  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    handleCloseActionMenu();
  };

  const handleRemoveOrder = (order) => {
    if (!order || isCancelledOrder(order)) return;
    setRemoveError("");
    setRemovingOrder(order);
    handleCloseActionMenu();
  };

  const handleCloseRemoveModal = useCallback(() => {
    if (removing) return;
    setRemovingOrder(null);
    setRemoveError("");
  }, [removing]);

  const handleConfirmRemove = async () => {
    if (!removingOrder || removing) return;

    try {
      setRemoving(true);
      setRemoveError("");

      const result = await serviceOrderApi.remove(removingOrder.serviceOrderId);

      if (result.action === "DELETED") {
        setOrders((previousOrders) =>
          previousOrders.filter(
            (order) => order.serviceOrderId !== result.orderId,
          ),
        );

        if (selectedOrder?.serviceOrderId === result.orderId) {
          setSelectedOrder(null);
        }
      }

      if (result.action === "CANCELLED" && result.order) {
        const cancelledOrder = mapOrderToTable(result.order);

        setOrders((previousOrders) =>
          previousOrders.map((order) =>
            order.serviceOrderId === result.orderId ? cancelledOrder : order,
          ),
        );

        if (selectedOrder?.serviceOrderId === result.orderId) {
          setSelectedOrder(cancelledOrder);
        }
      }

      setRemovingOrder(null);
      setCurrentPage(1);
    } catch (error) {
      console.error("Không thể xử lý đơn hàng:", error);

      setRemoveError(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Không thể xử lý đơn hàng. Vui lòng thử lại.",
      );
    } finally {
      setRemoving(false);
    }
  };

  const removingOrderHasReceiver = hasEmployeeReceiver(removingOrder);

  const handleCloseDetail = useCallback(() => {
    setSelectedOrder(null);
  }, []);

  const handleOrderUpdated = useCallback((updatedOrder) => {
    const mappedOrder = mapOrderToTable(updatedOrder);

    setOrders((previousOrders) =>
      previousOrders.map((item) =>
        item.serviceOrderId === mappedOrder.serviceOrderId ? mappedOrder : item,
      ),
    );

    setSelectedOrder(mappedOrder);
  }, []);

  const handleOpenCreateModal = () => {
    handleCloseActionMenu();
    setCreateModalOpen(true);
  };

  const handleCloseCreateModal = useCallback(() => {
    setCreateModalOpen(false);
    if (searchParams.get("create") === "1") {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("create");
      setSearchParams(nextParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleOrderCreated = useCallback((createdOrder) => {
    const mappedOrder = mapOrderToTable(createdOrder);

    setOrders((previousOrders) => {
      const existed = previousOrders.some(
        (item) => item.serviceOrderId === mappedOrder.serviceOrderId,
      );

      if (existed) {
        return previousOrders.map((item) =>
          item.serviceOrderId === mappedOrder.serviceOrderId
            ? mappedOrder
            : item,
        );
      }

      return [mappedOrder, ...previousOrders];
    });

    setCurrentPage(1);
  }, []);

  const actionMenuItems = [
    {
      id: "detail",
      label: "Chi tiết",
      icon: Eye,
      onClick: () => {
        if (actionMenu.order) {
          handleViewDetail(actionMenu.order);
        }
      },
    },
    {
      id: "remove",
      label: isCancelledOrder(actionMenu.order)
        ? "Đơn hàng đã hủy"
        : hasEmployeeReceiver(actionMenu.order)
          ? "Hủy đơn hàng"
          : "Gỡ bỏ vĩnh viễn",
      icon: Trash2,
      danger: true,
      disabled: isCancelledOrder(actionMenu.order),
      onClick: () => {
        if (actionMenu.order) {
          handleRemoveOrder(actionMenu.order);
        }
      },
    },
  ];

  return (
    <div className="animate-in space-y-6 duration-200 fade-in">
      {/* 1. Page Header */}
      <PageHeader
        title="Đơn dịch vụ của tôi"
        badge={
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {filteredOrders.length} đơn hàng
          </span>
        }
        description="Theo dõi danh sách, trạng thái và tiến độ xử lý các đơn hàng dịch vụ may mặc của bạn."
        actions={
          <>
            <button
              type="button"
              onClick={reloadServiceOrders}
              disabled={refreshing || loading}
              className="flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              title="Làm mới danh sách"
            >
              <RefreshCw
                size={14}
                className={
                  refreshing ? "animate-spin text-brand" : "text-slate-400"
                }
              />
              <span className="hidden sm:inline">Làm mới</span>
            </button>

            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl bg-brand! px-3.5 text-xs font-semibold text-white! shadow-sm shadow-brand/25 transition-all hover:bg-brand-hover! active:scale-95"
            >
              <Plus size={15} className="stroke-[2.5]" />
              <span>Thêm đơn hàng</span>
            </button>
          </>
        }
      />

      {/* 2. Metric Stats Cards */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Tổng đơn hàng"
          value={stats.total}
          subtitle="tất cả đơn đã tạo"
          icon={ShoppingBag}
          iconColorClass="bg-blue-50 text-brand dark:bg-blue-950/50 dark:text-blue-400"
          hoverBorderClass="hover:border-blue-300"
          onClick={() => {
            setStatusFilter("all");
            setCurrentPage(1);
          }}
        />

        <StatCard
          title="Chờ tiếp nhận"
          value={stats.pending}
          subtitle="đang chờ xác nhận"
          icon={Clock3}
          iconColorClass="bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
          hoverBorderClass="hover:border-amber-300"
          onClick={() => {
            setStatusFilter("pending");
            setCurrentPage(1);
          }}
        />

        <StatCard
          title="Đang xử lý"
          value={stats.active}
          subtitle="đang thiết kế / in sơ đồ"
          icon={ClipboardList}
          iconColorClass="bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400"
          hoverBorderClass="hover:border-sky-300"
          onClick={() => {
            setStatusFilter("active");
            setCurrentPage(1);
          }}
        />

        <StatCard
          title="Hoàn tất"
          value={stats.completed}
          subtitle="đã nghiệm thu bàn giao"
          icon={CheckCircle2}
          iconColorClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
          hoverBorderClass="hover:border-emerald-300"
          onClick={() => {
            setStatusFilter("completed");
            setCurrentPage(1);
          }}
        />
      </section>

      {/* 3. Toolbar & Filter Pills */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs lg:flex-row lg:items-center lg:justify-between dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-1.5">
          {STATUS_FILTER_OPTIONS.map((option) => {
            const active = statusFilter === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setStatusFilter(option.value);
                  setCurrentPage(1);
                }}
                className={`cursor-pointer rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  active
                    ? "bg-brand! text-white! shadow-xs"
                    : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-60 flex-1 sm:w-72">
            <Search
              size={15}
              className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Tìm mã đơn, dịch vụ, sản phẩm..."
              value={searchValue}
              onChange={(event) => {
                setSearchValue(event.target.value);
                setCurrentPage(1);
              }}
              className="h-9.5 w-full rounded-xl border border-slate-200 bg-slate-50/70 pr-3 pl-9.5 text-xs text-slate-800 transition-all placeholder:text-slate-400 focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/10 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
            />
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex h-9.5 cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <RotateCcw size={13} />
              <span>Đặt lại</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. Data Table */}
      {loading ? (
        <TableSkeleton />
      ) : (
        <div className="space-y-4">
          <DataTable
            columns={SERVICE_ORDER_COLUMNS}
            data={visibleOrders}
            minWidth="min-w-215"
            loading={false}
            error={errorMessage}
            emptyText={
              deferredSearchValue.trim() || statusFilter !== "all"
                ? "Không tìm thấy đơn hàng phù hợp với bộ lọc hiện tại."
                : "Bạn chưa có đơn hàng dịch vụ nào."
            }
            renderRow={(order) => {
              const statusMeta = getStatusMeta(order);
              const thumbUrl = resolveImageUrl(order.productImage);

              return (
                <tr
                  key={order.id}
                  onClick={() => handleViewDetail(order)}
                  className="cursor-pointer text-xs transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                >
                  <td className="px-4 py-3.5 font-bold whitespace-nowrap text-brand">
                    {order.orderCode}
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200/80 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                        {thumbUrl ? (
                          <img
                            src={thumbUrl}
                            alt={order.productName || order.serviceName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package size={16} className="text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-slate-900 dark:text-white">
                          {order.serviceName}
                        </div>
                        <div className="truncate text-[11px] text-slate-400">
                          {order.productName || "Chưa đặt tên sản phẩm"}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="shrink-0 text-slate-400" />
                      <span>{order.deadline}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 font-semibold whitespace-nowrap text-slate-900 dark:text-white">
                    {formatCurrency(order.totalPrice)}
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-brand transition-all"
                          style={{ width: `${order.progress}%` }}
                        />
                      </div>

                      <span className="min-w-8 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        {order.progress}%
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <StatusBadge
                      label={statusMeta.label}
                      tone={statusMeta.tone}
                    />
                  </td>

                  <td
                    className="px-4 py-3.5 text-center whitespace-nowrap"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={(event) => handleOpenActionMenu(event, order)}
                      aria-label={`Mở thao tác cho ${order.orderCode}`}
                      aria-haspopup="menu"
                      aria-expanded={
                        actionMenu.open && actionMenu.order?.id === order.id
                      }
                      className={`inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border transition ${
                        actionMenu.open && actionMenu.order?.id === order.id
                          ? "border-brand bg-brand-soft text-brand"
                          : "border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                      }`}
                    >
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              );
            }}
          />

          <Pagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            showOnSinglePage
          />
        </div>
      )}

      <MenuTable
        open={actionMenu.open}
        position={{
          x: actionMenu.x,
          y: actionMenu.y,
        }}
        items={actionMenuItems}
        onClose={handleCloseActionMenu}
      />

      <ConfirmModal
        open={Boolean(removingOrder)}
        title={removingOrderHasReceiver ? "Hủy đơn hàng" : "Gỡ bỏ đơn hàng"}
        confirmText={
          removingOrderHasReceiver ? "Hủy đơn hàng" : "Xóa vĩnh viễn"
        }
        loadingText="Đang xử lý..."
        confirmVariant="danger"
        submitting={removing}
        onClose={handleCloseRemoveModal}
        onConfirm={handleConfirmRemove}
      >
        {removingOrderHasReceiver ? (
          <>
            <p>
              Bạn có chắc muốn hủy đơn hàng{" "}
              <span className="font-semibold text-text-strong">
                {removingOrder?.orderCode}
              </span>
              ?
            </p>

            <p className="mt-2 text-xs text-text-muted">
              Đơn hàng đã có nhân viên tiếp nhận nên dữ liệu vẫn được giữ lại và
              trạng thái sẽ chuyển thành “Đã hủy đơn hàng”.
            </p>
          </>
        ) : (
          <>
            <p>
              Bạn có chắc muốn xóa vĩnh viễn đơn hàng{" "}
              <span className="font-semibold text-text-strong">
                {removingOrder?.orderCode}
              </span>
              ?
            </p>

            <p className="mt-2 text-xs text-danger">
              Đơn chưa có nhân viên tiếp nhận. Đơn hàng, ảnh đại diện và toàn bộ
              file bổ sung sẽ bị xóa vĩnh viễn.
            </p>
          </>
        )}

        {removeError && (
          <div className="mt-4 rounded-lg border border-danger-border bg-danger-soft px-3 py-2.5 text-sm text-danger">
            {removeError}
          </div>
        )}
      </ConfirmModal>

      <ServiceOrderCreateModal
        open={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onCreated={handleOrderCreated}
      />

      <ServiceOrderDetailModal
        open={Boolean(selectedOrder)}
        order={selectedOrder}
        onClose={handleCloseDetail}
        onUpdated={handleOrderUpdated}
      />
    </div>
  );
};

export default ServiceOrderPage;
