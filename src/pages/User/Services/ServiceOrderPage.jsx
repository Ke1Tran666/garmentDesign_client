import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Clock, Eye, MoreVertical, Plus, Search, Trash2 } from "lucide-react";
import { BASE_URL_API } from "@/api/config";
import { SectionCard } from "@/components/ui/Section/Section";
import MenuTable from "@/components/ui/Menu/MenuTable";
import ServiceOrderDetailModal from "@/components/ui/ServiceOrder/ServiceOrderDetailModal";
import ServiceOrderCreateModal from "@/components/ui/ServiceOrder/ServiceOrderCreateModal";

const getProgressByStatus = (status) => {
  const text = String(status || "").toLowerCase();

  if (text.includes("hoàn") || text.includes("complete")) return 100;
  if (text.includes("chờ") || text.includes("pending")) return 35;
  if (text.includes("hủy") || text.includes("cancel")) return 0;

  return 65;
};

const getStatusClass = (status) => {
  const text = String(status || "").toLowerCase();

  if (text.includes("hoàn") || text.includes("complete")) {
    return "bg-emerald-50 text-emerald-600";
  }

  if (text.includes("hủy") || text.includes("cancel")) {
    return "bg-red-50 text-red-600";
  }

  if (text.includes("chờ") || text.includes("pending")) {
    return "bg-amber-50 text-amber-600";
  }

  return "bg-brand-light text-brand";
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

const mapOrderToTable = (order) => ({
  ...order,
  id: order.serviceOrderId,
  orderCode: `ORD-${order.serviceOrderId}`,
  customer:
    order.user?.fullName || "Không rõ",
  serviceName:
    order.service?.serviceName ||
    "Không rõ dịch vụ",
  deadline: formatDate(
    order.completedDate ||
      order.receivedDate
  ),
  status: order.status || "Đang xử lý",
  progress: getProgressByStatus(
    order.status
  ),
});

const initialActionMenuState = {
  open: false,
  x: 0,
  y: 0,
  order: null,
};

const PAGE_SIZE = 15;

const ServiceOrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const deferredSearchValue = useDeferredValue(searchValue);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [createModalOpen,setCreateModalOpen] = useState(false);
  const [actionMenu, setActionMenu] = useState(initialActionMenuState);
  const [currentPage,setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchServiceOrders = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const idUser = localStorage.getItem("idUser");

        if (!idUser) {
          setOrders([]);
          setErrorMessage("Không tìm thấy thông tin người dùng.");
          return;
        }

        const response = await axios.get(
          `${BASE_URL_API}/service-orders/user/${idUser}`
        );

        setOrders((response.data || []).map(mapOrderToTable));
      } catch (error) {
        console.error("Lỗi tải danh sách đơn hàng:", error);
        setOrders([]);
        setErrorMessage(
          error.response?.data?.message || "Không thể tải danh sách đơn hàng."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchServiceOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const keyword =
      deferredSearchValue
        .trim()
        .toLowerCase();

    if (!keyword) return orders;

    return orders.filter((order) =>
      [
        order.orderCode,
        order.customer,
        order.serviceName,
        order.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [
    orders,
    deferredSearchValue,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredOrders.length / PAGE_SIZE
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const visibleOrders = useMemo(() => {
    const start =
      (safeCurrentPage - 1) *
      PAGE_SIZE;

    return filteredOrders.slice(
      start,
      start + PAGE_SIZE
    );
  }, [filteredOrders,safeCurrentPage]);


  // HANDLE
  const handleCloseActionMenu = useCallback(() => {
    setActionMenu(initialActionMenuState);
  }, []);

  const handleOpenActionMenu = (event, order) => {
    event.stopPropagation();

    const buttonRect = event.currentTarget.getBoundingClientRect();
    const menuWidth = 176;
    const menuHeight = 96;
    const screenPadding = 12;

    let x = buttonRect.right - menuWidth;
    let y = buttonRect.bottom + 8;

    if (x < screenPadding) {
      x = screenPadding;
    }

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
    console.log("Gỡ bỏ đơn hàng:", order);

    // Sau này có thể:
    // setSelectedOrder(order);
    // setOpenRemoveConfirm(true);
  };

  const handleCloseDetail = useCallback(() => {
    setSelectedOrder(null);
  }, []);

  const handleOrderUpdated = useCallback(
    (updatedOrder) => {
      const mappedOrder =
        mapOrderToTable(updatedOrder);

      setOrders((previousOrders) =>
        previousOrders.map((item) =>
          item.serviceOrderId ===
          mappedOrder.serviceOrderId
            ? mappedOrder
            : item
        )
      );

      setSelectedOrder(mappedOrder);
    },
    []
  );

  const handleOpenCreateModal = () => {
    handleCloseActionMenu();
    setCreateModalOpen(true);
  };

  const handleCloseCreateModal =
    useCallback(() => {
      setCreateModalOpen(false);
    }, []);

  const handleOrderCreated = useCallback((createdOrder) => {
      const mappedOrder =
        mapOrderToTable(createdOrder);

      setOrders((previousOrders) => {
        const existed =
          previousOrders.some(
            (item) =>
              item.serviceOrderId ===
              mappedOrder.serviceOrderId
          );

        if (existed) {
          return previousOrders.map(
            (item) =>
              item.serviceOrderId ===
              mappedOrder.serviceOrderId
                ? mappedOrder
                : item
          );
        }

        return [
          mappedOrder,
          ...previousOrders,
        ];
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
      label: "Gỡ bỏ",
      icon: Trash2,
      danger: true,
      onClick: () => {
        if (actionMenu.order) {
          handleRemoveOrder(actionMenu.order);
        }
      },
    },
  ];

  return (
    <SectionCard
      title="Services Order List"
      desc="Theo dõi danh sách, trạng thái và tiến độ các đơn hàng dịch vụ của bạn."
    >
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700">
            Tổng số đơn hàng: {orders.length}
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Hiển thị {filteredOrders.length} kết quả
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 sm:w-80">
            <Search
              size={18}
              className="shrink-0 text-gray-400"
            />

            <input
              type="text"
              placeholder="Tìm mã đơn, dịch vụ, trạng thái..."
              value={searchValue}
              onChange={(event) => {
                setSearchValue(event.target.value);

                setCurrentPage(1);
              }}
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-brand! px-5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            <Plus size={18} />
            Thêm đơn hàng
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full min-w-200 text-left">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-sm text-gray-500">
              <th className="px-4 py-3 font-medium">Mã đơn</th>
              <th className="px-4 py-3 font-medium">Khách hàng</th>
              <th className="px-4 py-3 font-medium">Dịch vụ</th>
              <th className="px-4 py-3 font-medium">Deadline</th>
              <th className="px-4 py-3 font-medium">Tiến độ</th>
              <th className="px-4 py-3 font-medium">Trạng thái</th>
              <th className="px-4 py-3 text-center font-medium">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-sm text-gray-500"
                >
                  Đang tải danh sách đơn hàng...
                </td>
              </tr>
            ) : errorMessage ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-sm text-red-500"
                >
                  {errorMessage}
                </td>
              </tr>
            ) : filteredOrders.length > 0 ? (
              visibleOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-gray-100 text-sm transition last:border-b-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-4 font-semibold text-gray-900">
                    {order.orderCode}
                  </td>

                  <td className="px-4 py-4 text-gray-700">
                    {order.customer}
                  </td>

                  <td className="px-4 py-4 text-gray-700">
                    {order.serviceName}
                  </td>

                  <td className="px-4 py-4 text-gray-700">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="shrink-0 text-gray-400" />
                      {order.deadline}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-28 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-brand transition-all"
                          style={{ width: `${order.progress}%` }}
                        />
                      </div>

                      <span className="min-w-9 text-xs font-medium text-gray-500">
                        {order.progress}%
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-center">
                    <button
                      type="button"
                      onClick={(event) =>
                        handleOpenActionMenu(event, order)
                      }
                      aria-label={`Mở thao tác cho ${order.orderCode}`}
                      aria-haspopup="menu"
                      aria-expanded={
                        actionMenu.open &&
                        actionMenu.order?.id === order.id
                      }
                      className={`
                        rounded-lg border p-2 transition
                        ${
                          actionMenu.open &&
                          actionMenu.order?.id === order.id
                            ? "border-brand bg-brand-light text-brand"
                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        }
                      `}
                    >
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-sm text-gray-500"
                >
                  {deferredSearchValue.trim()
                    ? "Không tìm thấy đơn hàng phù hợp."
                    : "Chưa có đơn hàng dịch vụ."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredOrders.length >
        PAGE_SIZE && (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            Trang{" "}
            <span className="font-semibold text-gray-700">
              {safeCurrentPage}
            </span>{" "}
            / {totalPages}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setCurrentPage(
                  (previousPage) =>
                    Math.max(
                      1,
                      previousPage - 1
                    )
                )
              }
              disabled={
                safeCurrentPage <= 1
              }
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Trước
            </button>

            <div className="flex items-center gap-1">
              {Array.from(
                {
                  length: totalPages,
                },
                (_, index) => index + 1
              )
                .filter((pageNumber) => {
                  return (
                    pageNumber === 1 ||
                    pageNumber ===
                      totalPages ||
                    Math.abs(
                      pageNumber -
                        safeCurrentPage
                    ) <= 1
                  );
                })
                .map(
                  (
                    pageNumber,
                    index,
                    displayedPages
                  ) => {
                    const previousPage =
                      displayedPages[
                        index - 1
                      ];

                    const hasGap =
                      previousPage &&
                      pageNumber -
                        previousPage >
                        1;

                    return (
                      <div
                        key={pageNumber}
                        className="flex items-center gap-1"
                      >
                        {hasGap && (
                          <span className="px-1 text-gray-400">
                            ...
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            setCurrentPage(
                              pageNumber
                            )
                          }
                          className={`flex h-9 min-w-9 items-center justify-center rounded-xl px-2 text-sm font-semibold ${
                            pageNumber ===
                            safeCurrentPage
                              ? "bg-brand text-white"
                              : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      </div>
                    );
                  }
                )}
            </div>

            <button
              type="button"
              onClick={() =>
                setCurrentPage(
                  (previousPage) =>
                    Math.min(
                      totalPages,
                      previousPage + 1
                    )
                )
              }
              disabled={
                safeCurrentPage >=
                totalPages
              }
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Sau
            </button>
          </div>
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

      <ServiceOrderCreateModal
        open={createModalOpen}
        onClose={handleCloseCreateModal}
        onCreated={handleOrderCreated}
      />
      
      <ServiceOrderDetailModal
        open={Boolean(selectedOrder)}
        order={selectedOrder}
        onClose={handleCloseDetail}
        onUpdated={handleOrderUpdated}
      />
    </SectionCard>
  );
};

export default ServiceOrderPage;
