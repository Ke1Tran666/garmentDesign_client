import {
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ClipboardList,
  Eye,
  MoreVertical,
  Trash2,
} from "lucide-react";
import { useOutletContext } from "react-router-dom";

import { serviceOrderApi } from "@/entities/service-order/api/serviceOrderApi";
import { useNotification } from "@/app/providers/NotificationProvider";

import CountBadge from "@/shared/ui/badge/CountBadge";
import PageHeading from "@/shared/ui/heading/PageHeading";
import MenuTable from "@/shared/ui/menu/MenuTable";
import ConfirmModal from "@/shared/ui/modal/ConfirmModal";
import { SearchInput } from "@/shared/ui/search/search-input";
import FilterSelect from "@/shared/ui/select/FilterSelect";
import DataTable from "@/shared/ui/table/DataTable";
import Pagination from "@/shared/ui/table/Pagination";
import AdminServiceOrderDetailModal from "@/features/service-order-management/ui/AdminServiceOrderDetailModal";

const PAGE_SIZE = 15;

const COLUMNS = [
  {
    key: "order",
    title: "Đơn hàng",
  },
  {
    key: "customer",
    title: "Khách hàng",
  },
  {
    key: "service",
    title: "Dịch vụ",
  },
  {
    key: "totalPrice",
    title: "Tổng tiền",
  },
  {
    key: "createdAt",
    title: "Ngày tạo",
  },
  {
    key: "status",
    title: "Trạng thái",
  },
  {
    key: "action",
    title: "Thao tác",
    className: "text-center",
  },
];

const STATUS_OPTIONS = [
  {
    value: "all",
    label: "Tất cả trạng thái",
  },
  {
    value: "pending",
    label: "Chờ tiếp nhận",
  },
  {
    value: "active",
    label: "Đang xử lý",
  },
  {
    value: "inactive",
    label: "Ngừng xử lý",
  },
  {
    value: "cancelled",
    label: "Đã hủy",
  },
];

const INITIAL_MENU = {
  open: false,
  x: 0,
  y: 0,
  order: null,
};

const getErrorMessage = (error, fallback) => {
  const responseData = error.response?.data;

  if (typeof responseData === "string") {
    return responseData;
  }

  return responseData?.message || fallback;
};

const getOrderStatusValue = (order) => {
  const status = String(order?.status || "")
    .trim()
    .toLowerCase();

  if (status === "inactive" && order?.deletedAt) {
    return "cancelled";
  }

  return status;
};

const getStatusInfo = (order) => {
  const status = getOrderStatusValue(order);

  if (status === "pending") {
    return {
      label: "Chờ tiếp nhận",
      className: "bg-warning-soft text-warning",
    };
  }

  if (status === "active") {
    return {
      label: "Đang xử lý",
      className: "bg-info-soft text-info",
    };
  }

  if (status === "cancelled") {
    return {
      label: "Đã hủy",
      className: "bg-danger-soft text-danger",
    };
  }

  if (status === "inactive") {
    return {
      label: "Ngừng xử lý",
      className: "bg-surface-muted text-text-muted",
    };
  }

  return {
    label: status || "Chưa xác định",
    className: "bg-surface-muted text-text-muted",
  };
};

const formatPrice = (value) => {
  const price = Number(value);

  if (!Number.isFinite(price)) {
    return "Chưa thiết lập";
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price);
};

const formatDate = (value) => {
  if (!value) return "Chưa có";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const ServiceOrderManagementPage = () => {
  const { searchKeyword = "" } = useOutletContext();
  const { showNotification } = useNotification();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [localSearch, setLocalSearch] = useState("");
  const deferredSearch = useDeferredValue(
    localSearch || searchKeyword,
  );

  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [menu, setMenu] = useState(INITIAL_MENU);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [removingOrder, setRemovingOrder] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState("");

  useEffect(() => {
    let active = true;

    serviceOrderApi
      .getAll()
      .then((data) => {
        if (!active) return;

        setOrders(Array.isArray(data) ? data : []);
        setLoadError("");
      })
      .catch((error) => {
        console.error(
          "Không thể tải danh sách đơn dịch vụ:",
          error,
        );

        if (!active) return;

        setOrders([]);
        setLoadError(
          getErrorMessage(
            error,
            "Không thể tải danh sách đơn dịch vụ.",
          ),
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

  const filteredOrders = useMemo(() => {
    const keyword = deferredSearch
      .trim()
      .toLowerCase();

    return orders.filter((order) => {
      const matchesKeyword =
        !keyword ||
        [
          `ORD-${order.serviceOrderId}`,
          order.productName,
          order.user?.fullName,
          order.user?.userCode,
          order.user?.idUser,
          order.service?.serviceName,
          order.service?.serviceCode,
          order.createdBy,
          order.updatedBy,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(keyword);

      const orderStatus =
        getOrderStatusValue(order);

      const matchesStatus =
        statusFilter === "all" ||
        orderStatus === statusFilter;

      return matchesKeyword && matchesStatus;
    });
  }, [
    orders,
    deferredSearch,
    statusFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredOrders.length / PAGE_SIZE),
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages,
  );

  const visibleOrders = useMemo(() => {
    const start =
      (safeCurrentPage - 1) * PAGE_SIZE;

    return filteredOrders.slice(
      start,
      start + PAGE_SIZE,
    );
  }, [filteredOrders, safeCurrentPage]);

  const showingStart =
    filteredOrders.length === 0
      ? 0
      : (safeCurrentPage - 1) *
          PAGE_SIZE +
        1;

  const showingEnd = Math.min(
    safeCurrentPage * PAGE_SIZE,
    filteredOrders.length,
  );

  const openActionMenu = (event, order) => {
    event.stopPropagation();

    const rect =
      event.currentTarget.getBoundingClientRect();

    const menuWidth = 176;
    const menuHeight = 132;

    setMenu({
      open: true,
      order,
      x: Math.max(
        12,
        Math.min(
          rect.right - menuWidth,
          window.innerWidth -
            menuWidth -
            12,
        ),
      ),
      y: Math.max(
        12,
        Math.min(
          rect.bottom + 6,
          window.innerHeight -
            menuHeight -
            12,
        ),
      ),
    });
  };

  const confirmRemove = async () => {
    if (!removingOrder) return;

    try {
      setRemoving(true);
      setRemoveError("");

      await serviceOrderApi.removeByAdmin(
        removingOrder.serviceOrderId,
      );

      setOrders((current) =>
        current.filter(
          (order) =>
            order.serviceOrderId !==
            removingOrder.serviceOrderId,
        ),
      );

      showNotification(
        "success",
        "Đã xóa đơn dịch vụ",
        `Đơn ORD-${removingOrder.serviceOrderId} đã được xóa khỏi hệ thống.`,
      );

      setRemovingOrder(null);
    } catch (error) {
      setRemoveError(
        getErrorMessage(
          error,
          "Không thể xóa đơn dịch vụ.",
        ),
      );
    } finally {
      setRemoving(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <PageHeading
            title="Quản lý đơn dịch vụ"
            description="Theo dõi và quản lý các đơn dịch vụ trong hệ thống."
          />

          <CountBadge
            count={filteredOrders.length}
            label="đơn dịch vụ"
            icon={ClipboardList}
          />
        </div>

        <div className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[1fr_220px]">
            <SearchInput
              value={localSearch}
              onChange={(value) => {
                setLocalSearch(value);
                setCurrentPage(1);
              }}
              placeholder="Tìm mã đơn, khách hàng, sản phẩm..."
              className="w-full"
            />

            <FilterSelect
              value={statusFilter}
              options={STATUS_OPTIONS}
              ariaLabel="Lọc đơn dịch vụ theo trạng thái"
              onValueChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="mt-5">
            <DataTable
              columns={COLUMNS}
              data={visibleOrders}
              loading={loading}
              loadingText="Đang tải danh sách đơn dịch vụ..."
              error={loadError}
              emptyText="Không tìm thấy đơn dịch vụ"
              minWidth="min-w-240"
              renderRow={(order) => {
                const status =
                  getStatusInfo(order);

                return (
                  <tr
                    key={order.serviceOrderId}
                    className="transition hover:bg-surface-subtle"
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-text-strong">
                        ORD-{order.serviceOrderId}
                      </p>

                      <p className="mt-1 max-w-55 truncate text-xs text-text-muted">
                        {order.productName ||
                          "Chưa có tên sản phẩm"}
                      </p>
                    </td>

                    <td className="px-4 py-3">
                      <p className="max-w-50 truncate text-sm font-medium text-text-default">
                        {order.user?.fullName ||
                          "Không rõ khách hàng"}
                      </p>

                      <p className="mt-1 text-xs text-text-muted">
                        {order.user?.userCode ||
                          order.user?.idUser ||
                          "Chưa có mã"}
                      </p>
                    </td>

                    <td className="px-4 py-3">
                      <p className="max-w-50 truncate text-sm text-text-default">
                        {order.service?.serviceName ||
                          "Không rõ dịch vụ"}
                      </p>

                      <p className="mt-1 text-xs text-text-muted">
                        {order.service?.serviceCode ||
                          order.unitType ||
                          "Chưa có mã"}
                      </p>
                    </td>

                    <td className="px-4 py-3 text-sm font-semibold text-text-strong">
                      {formatPrice(order.totalPrice)}
                    </td>

                    <td className="px-4 py-3 text-sm text-text-muted">
                      {formatDate(order.createdAt)}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`
                          rounded-full px-3 py-1
                          text-xs font-semibold
                          ${status.className}
                        `}
                      >
                        {status.label}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        aria-label={`Mở thao tác cho đơn ORD-${order.serviceOrderId}`}
                        aria-haspopup="menu"
                        onClick={(event) =>
                          openActionMenu(
                            event,
                            order,
                          )
                        }
                        className="
                          inline-flex h-9 w-9
                          items-center justify-center
                          rounded-lg text-text-muted
                          transition
                          hover:bg-surface-muted
                          hover:text-text-default
                        "
                      >
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                );
              }}
            />
          </div>

          <div className="mt-5">
            <Pagination
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              showingStart={showingStart}
              showingEnd={showingEnd}
              totalItems={filteredOrders.length}
              showOnSinglePage
            />
          </div>
        </div>
      </div>

      <MenuTable
        open={menu.open}
        position={{
          x: menu.x,
          y: menu.y,
        }}
        onClose={() =>
          setMenu(INITIAL_MENU)
        }
        items={[
          {
            id: "detail",
            label: "Xem chi tiết",
            icon: Eye,
            onClick: () => {
              if (!menu.order) return;

              setSelectedOrder(menu.order);
            },
          },
          {
            id: "divider",
            type: "divider",
          },
          {
            id: "delete",
            label: "Xóa đơn",
            icon: Trash2,
            danger: true,
            disabled: !menu.order,
            onClick: () => {
              if (!menu.order) return;

              setRemoveError("");
              setRemovingOrder(menu.order);
            },
          },
        ]}
      />

      <AdminServiceOrderDetailModal
        open={Boolean(selectedOrder)}
        order={selectedOrder}
        onClose={() =>
          setSelectedOrder(null)
        }
      />

      <ConfirmModal
        open={Boolean(removingOrder)}
        title="Xóa đơn dịch vụ?"
        confirmText="Xóa đơn"
        loadingText="Đang xóa..."
        confirmVariant="danger"
        submitting={removing}
        onClose={() => {
          if (removing) return;

          setRemovingOrder(null);
          setRemoveError("");
        }}
        onConfirm={confirmRemove}
      >
        <p>
          Bạn có chắc muốn xóa đơn{" "}
          <strong className="text-text-default">
            ORD-{removingOrder?.serviceOrderId}
          </strong>
          ?
        </p>

        <p className="mt-2 text-xs text-danger">
          Backend hiện đang xóa trực tiếp đơn khỏi cơ sở dữ
          liệu. Thao tác này không thể hoàn tác.
        </p>

        {removeError && (
          <p className="mt-3 rounded-lg bg-danger-soft px-3 py-2 text-danger">
            {removeError}
          </p>
        )}
      </ConfirmModal>
    </>
  );
};

export default ServiceOrderManagementPage;