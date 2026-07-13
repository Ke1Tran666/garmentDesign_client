import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Clock, Eye, MoreVertical, Search, Trash2 } from "lucide-react";
import { BASE_URL_API } from "@/api/config";
import { SectionCard } from "@/components/ui/Section/Section";
import MenuTable from "@/components/ui/Menu/MenuTable";
import ServiceOrderDetailModal from "@/components/ui/ServiceOrder/ServiceOrderDetailModal";

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
  customer: order.user?.fullName || "Không rõ",
  service: order.service?.serviceName || "Không rõ dịch vụ",
  deadline: formatDate(order.completedDate || order.receivedDate),
  status: order.status || "Đang xử lý",
  progress: getProgressByStatus(order.status),
});

const initialActionMenuState = {
  open: false,
  x: 0,
  y: 0,
  order: null,
};

const ServiceOrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [actionMenu, setActionMenu] = useState(
    initialActionMenuState
  );
  

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
    const keyword = searchValue.trim().toLowerCase();

    if (!keyword) return orders;

    return orders.filter((order) =>
      [order.orderCode, order.customer, order.service, order.status]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [orders, searchValue]);


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
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700">
            Tổng số đơn hàng: {orders.length}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Hiển thị {filteredOrders.length} kết quả
          </p>
        </div>

        <div className="flex w-full items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 md:w-80">
          <Search size={18} className="shrink-0 text-gray-400" />

          <input
            type="text"
            placeholder="Tìm mã đơn, dịch vụ, trạng thái..."
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            className="w-full bg-transparent text-sm outline-none"
          />
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
              filteredOrders.map((order) => (
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
                    {order.service}
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
                  {searchValue.trim()
                    ? "Không tìm thấy đơn hàng phù hợp."
                    : "Chưa có đơn hàng dịch vụ."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <MenuTable
        open={actionMenu.open}
        position={{
          x: actionMenu.x,
          y: actionMenu.y,
        }}
        items={actionMenuItems}
        onClose={handleCloseActionMenu}
      />
      <ServiceOrderDetailModal
        open={Boolean(selectedOrder)}
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </SectionCard>
  );
};

export default ServiceOrderPage;
