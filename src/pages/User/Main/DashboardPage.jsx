import { useEffect, useMemo, useState } from "react";
import Chart from "react-apexcharts";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  BarChart3,
  CheckCircle2,
  Clock,
  FileText,
  MoreVertical,
  PackageCheck,
  Search,
} from "lucide-react";
import { serviceOrderFileApi } from "@/api/serviceOrderFileApi";
import { serviceOrderApi } from "@/api/serviceOrderApi";
import { authStorage } from "@/lib/authStorage";

const monthLabels = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const fileColors = ["#8b5cf6", "#38bdf8", "#14b8a6", "#f97316", "#22c55e"];

const defaultDashboardItems = [
  { id: "total-files", size: "small" },
  { id: "month-orders", size: "small" },
  { id: "completed-task", size: "small" },
  { id: "file-chart", size: "medium" },
  { id: "order-chart", size: "large" },
  { id: "task-table", size: "full" },
];

const isCancelledOrder = (order) =>
  String(order?.status || "").toLowerCase() === "inactive" &&
  Boolean(order?.deletedAt);

const getOrderStatus = (order) => {
  const status = String(
    order?.status || "pending",
  ).toLowerCase();

  if (isCancelledOrder(order)) {
    return {
      code: "inactive",
      label: "Đã hủy đơn hàng",
      progress: 0,
      className: "bg-danger-soft text-danger",
    };
  }

  if (status === "pending") {
    return {
      code: "pending",
      label: "Chờ tiếp nhận",
      progress: 35,
      className: "bg-warning-soft text-warning",
    };
  }

  if (status === "active") {
    return {
      code: "active",
      label: "Đang xử lý",
      progress: 65,
      className: "bg-info-soft text-info",
    };
  }

  return {
    code: status,
    label: "Không xác định",
    progress: 0,
    className: "bg-surface-muted text-text-muted",
  };
};

const formatDate = (value) => {
  if (!value) return "Chưa có";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Chưa có";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

const mapOrderToTask = (order) => {
  const status = getOrderStatus(order);

  return {
    id: `ORD-${order.serviceOrderId}`,
    orderId: order.serviceOrderId,
    customer:
      order.user?.fullName || "Không rõ",
    service:
      order.service?.serviceName ||
      "Không rõ dịch vụ",
    deadline: formatDate(
      order.completedDate ||
        order.receivedDate,
    ),
    status: status.label,
    databaseStatus: status.code,
    statusClassName: status.className,
    progress: status.progress,
  };
};

const getSizeClass = (size) => {
  switch (size) {
    case "small":
      return "col-span-12 md:col-span-4";

    case "medium":
      return "col-span-12 lg:col-span-4";

    case "large":
      return "col-span-12 lg:col-span-8";

    case "full":
      return "col-span-12";

    default:
      return "col-span-12";
  }
};

const SortableDashboardItem = ({ item, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        ${getSizeClass(item.size)}
        ${isDragging ? "z-20 opacity-70" : ""}
      `}
    >
      <div
        {...attributes}
        {...listeners}
        className="h-full cursor-grab active:cursor-grabbing"
      >
        {children}
      </div>
    </div>
  );
};

const Card = ({ children, className = "" }) => {
  return (
    <div
      className={`
        h-full rounded-2xl border border-border bg-surface p-5 shadow-sm
        ${className}
      `}
    >
      {children}
    </div>
  );
};

const getFileCategory = (file) => {
  const type = String(
    file?.fileType || "",
  ).toLowerCase();

  if (type.startsWith("image/")) {
    return "Ảnh bổ sung";
  }

  if (type.includes("pdf")) {
    return "PDF";
  }

  if (
    type.includes("word") ||
    type.includes("document")
  ) {
    return "Word";
  }

  if (
    type.includes("excel") ||
    type.includes("spreadsheet")
  ) {
    return "Excel";
  }

  return "File khác";
};

const DashboardPage = () => {
  const [orders, setOrders] = useState([]);
  const [files, setFiles] = useState([]);
  const taskOrder = useMemo(
    () => orders.map(mapOrderToTask),
    [orders],
  );
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [dashboardItems, setDashboardItems] = useState(() => {
    const savedLayout = localStorage.getItem("dashboard-layout");

    if (!savedLayout) return defaultDashboardItems;

    try {
      const parsedLayout = JSON.parse(savedLayout);

      const validItems = parsedLayout.filter((savedItem) =>
        defaultDashboardItems.some((item) => item.id === savedItem.id)
      );

      const missingItems = defaultDashboardItems.filter(
        (item) => !validItems.some((savedItem) => savedItem.id === item.id)
      );

      return [...validItems, ...missingItems];
    } catch {
      return defaultDashboardItems;
    }
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    })
  );

  useEffect(() => {
    let active = true;

    const fetchDashboardData = async () => {
      const idUser = authStorage.getUserId();

      if (!idUser) {
        if (active) {
          setOrders([]);
          setFiles([]);
          setLoading(false);
        }

        return;
      }

      try {
        const [orderResult, fileResult] =
          await Promise.allSettled([
            serviceOrderApi.getByUser(idUser),
            serviceOrderFileApi.getByUser(idUser),
          ]);

        if (!active) return;

        setOrders(
          orderResult.status === "fulfilled" &&
            Array.isArray(orderResult.value)
            ? orderResult.value
            : [],
        );

        setFiles(
          fileResult.status === "fulfilled" &&
            Array.isArray(fileResult.value)
            ? fileResult.value
            : [],
        );

        if (orderResult.status === "rejected") {
          console.error(
            "Không thể tải đơn hàng:",
            orderResult.reason,
          );
        }

        if (fileResult.status === "rejected") {
          console.error(
            "Không thể tải file:",
            fileResult.reason,
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("dashboard-layout", JSON.stringify(dashboardItems));
  }, [dashboardItems]);

  const productImageCount = useMemo(
    () =>
      orders.reduce(
        (total, order) =>
          total + (order.productImage ? 1 : 0),
        0,
      ),
    [orders],
  );

  const fileStats = useMemo(() => {
    const grouped = {};

    if (productImageCount > 0) {
      grouped["Ảnh đại diện"] =
        productImageCount;
    }

    files.forEach((file) => {
      const category =
        getFileCategory(file);

      grouped[category] =
        (grouped[category] || 0) + 1;
    });

    return Object.entries(grouped).map(
      ([label, value], index) => ({
        label,
        value,
        color:
          fileColors[
            index % fileColors.length
          ],
      }),
    );
  }, [files, productImageCount]);

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  const getOrderCreatedDate = (order) => {
    const value =
      order.createdAt ||
      order.receivedDate;

    if (!value) return null;

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? null
      : date;
  };

  const monthlyOrders = useMemo(() => {
    const result = monthLabels.map(
      (month) => ({
        month,
        orders: 0,
      }),
    );

    orders.forEach((order) => {
      const date =
        getOrderCreatedDate(order);

      if (
        !date ||
        date.getFullYear() !== currentYear
      ) {
        return;
      }

      result[date.getMonth()].orders += 1;
    });

    return result;
  }, [orders, currentYear]);

  const filteredTasks = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();

    if (!keyword) return taskOrder;

    return taskOrder.filter((task) =>
      [task.id, task.customer, task.service, task.status]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [taskOrder, searchValue]);

  const totalFiles = files.length + productImageCount;

  const currentMonth = currentDate.getMonth();

  const previousMonthDate = new Date(
    currentYear,
    currentMonth - 1,
    1,
  );

  const countOrdersByMonth = (orderList,year,month) =>
    orderList.reduce((total, order) => {
      const date =
        getOrderCreatedDate(order);

      if (
        date &&
        date.getFullYear() === year &&
        date.getMonth() === month
      ) {
        return total + 1;
      }

      return total;
    }, 0);

  const activeOrders = useMemo(() => orders.filter(
        (order) =>
          String(order.status).toLowerCase() ===
            "active" &&
          !order.deletedAt,
      ).length,
    [orders],
  );

  const activePercent = orders.length === 0
      ? 0
      : Math.round((activeOrders / orders.length) * 100);

  const currentMonthOrders = countOrdersByMonth(
      orders,
      currentYear,
      currentMonth,
    );

  const previousMonthOrders = countOrdersByMonth(
      orders,
      previousMonthDate.getFullYear(),
      previousMonthDate.getMonth(),
    );

  const orderPercent = previousMonthOrders === 0 
        ? currentMonthOrders > 0
        ? 100 
        : 0 
        : Math.round(
          ((currentMonthOrders -
            previousMonthOrders) /
            previousMonthOrders) *
            100,
        );

  const fileChartOptions = {
    chart: {
      type: "donut",
    },
    labels: fileStats.map((item) => item.label),
    colors: fileStats.map((item) => item.color),
    legend: {
      position: "bottom",
      fontSize: "13px",
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 0,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "72%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Files",
              formatter: () => totalFiles,
            },
          },
        },
      },
    },
  };

  const fileChartSeries = fileStats.map((item) => item.value);

  const orderChartOptions = {
    chart: {
      type: "bar",
      toolbar: {
        show: false,
      },
    },
    colors: ["var(--chart-1)"],
    dataLabels: {
      enabled: false,
    },
    grid: {
      borderColor: "var(--border-subtle)",
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: "45%",
      },
    },
    xaxis: {
      categories: monthlyOrders.map((item) => item.month),
      labels: {
        style: {
          colors: "var(--text-muted)",
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "var(--text-muted)",
          fontSize: "12px",
        },
      },
    },
    tooltip: {
      y: {
        formatter: (value) => `${value} đơn hàng`,
      },
    },
  };

  const orderChartSeries = [
    {
      name: "Đơn hàng",
      data: monthlyOrders.map((item) => item.orders),
    },
  ];

  const handleDashboardDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    setDashboardItems((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const handleResetLayout = () => {
    setDashboardItems(defaultDashboardItems);
    localStorage.removeItem("dashboard-layout");
  };

  const renderWidget = (id) => {
    switch (id) {
      case "total-files":
        return (
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <p className="font-semibold text-text-strong">Tổng file</p>
              <FileText className="text-brand" size={22} />
            </div>

            <h2 className="text-3xl font-bold text-text-strong">{totalFiles}</h2>
            <p className="mt-1 text-sm text-text-muted">File đang quản lý</p>
          </Card>
        );

      case "month-orders":
        return (
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <p className="font-semibold text-text-strong">Đơn hàng tháng này</p>
              <PackageCheck className="text-brand" size={22} />
            </div>

            <h2 className="text-3xl font-bold text-text-strong">
              {currentMonthOrders}
            </h2>

            <p
              className={`mt-1 text-sm ${
                orderPercent >= 0 ? "text-success" : "text-danger"
              }`}
            >
              {orderPercent >= 0 ? "+" : ""}
              {orderPercent}% so với tháng trước
            </p>
          </Card>
        );

      case "completed-task":
        return (
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <p className="font-semibold text-text-strong">
                Đơn đang xử lý
              </p>

              <CheckCircle2
                className="text-brand"
                size={22}
              />
            </div>

            <h2 className="text-3xl font-bold text-text-strong">
              {activeOrders}
            </h2>

            <p className="mt-1 text-sm text-text-muted">
              Chiếm {activePercent}% tổng số đơn hàng
            </p>
          </Card>
        );

      case "file-chart":
        return (
          <Card>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-semibold text-text-strong">Thống kê file</h2>
              <MoreVertical size={18} className="text-text-subtle" />
            </div>

            {fileStats.length > 0 ? (
              <Chart
                options={fileChartOptions}
                series={fileChartSeries}
                type="donut"
                height={320}
              />
            ) : (
              <div className="flex h-80 items-center justify-center text-sm text-text-muted">
                Chưa có file
              </div>
            )}
          </Card>
        );

      case "order-chart":
        return (
          <Card>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-text-strong">
                  Thống kê đơn hàng theo tháng
                </h2>

                <p className="text-sm text-text-muted">
                  Số lượng đơn hàng mỗi tháng
                </p>
              </div>

              <BarChart3 size={22} className="text-brand" />
            </div>

            <Chart
              options={orderChartOptions}
              series={orderChartSeries}
              type="bar"
              height={320}
            />
          </Card>
        );

      case "task-table":
        return (
          <Card>
            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <h2 className="font-semibold text-text-strong">Task đơn hàng</h2>

              <div
                className="flex items-center gap-2 rounded-xl border border-border px-3 py-2"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <Search size={18} className="text-text-subtle" />

                <input
                  type="text"
                  placeholder="Tìm task..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="text-sm outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto" onPointerDown={(e) => e.stopPropagation()}>
              <table className="w-full min-w-200 text-left">
                <thead>
                  <tr className="border-b border-border-subtle bg-surface-subtle text-sm text-text-muted">
                    <th className="px-4 py-3">Mã đơn</th>
                    <th className="px-4 py-3">Khách hàng</th>
                    <th className="px-4 py-3">Dịch vụ</th>
                    <th className="px-4 py-3">Deadline</th>
                    <th className="px-4 py-3">Tiến độ</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => (
                      <tr
                        key={task.id}
                        className="border-b border-border-subtle text-sm transition hover:bg-surface-subtle"
                      >
                        <td className="px-4 py-4 font-semibold text-text-strong">
                          {task.id}
                        </td>

                        <td className="px-4 py-4 text-text-default">
                          {task.customer}
                        </td>

                        <td className="px-4 py-4 text-text-default">
                          {task.service}
                        </td>

                        <td className="px-4 py-4 text-text-default">
                          <div className="flex items-center gap-2">
                            <Clock size={16} className="text-text-subtle" />
                            {task.deadline}
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div className="h-2 w-32 rounded-full bg-surface-muted">
                            <div
                              className="h-2 rounded-full bg-brand"
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span 
                            className={` inline-flex rounded-full px-3 py-1 text-xs font-semibold ${task.statusClassName}`}>
                            {task.status}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <button className="rounded-lg border border-border p-2 hover:bg-surface-subtle">
                            <MoreVertical size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-sm text-text-muted"
                      >
                        Chưa có đơn hàng
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <p className="text-sm text-text-muted">Đang tải dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mb-6 flex items-center justify-end gap-3">
        <button
          onClick={handleResetLayout}
          className="rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold text-text-default shadow-sm hover:bg-surface-subtle"
        >
          Reset layout
        </button>

        <button className="rounded-xl bg-brand! px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark!">
          Export Data
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDashboardDragEnd}
      >
        <SortableContext
          items={dashboardItems.map((item) => item.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-12 gap-5">
            {dashboardItems.map((item) => (
              <SortableDashboardItem key={item.id} item={item}>
                {renderWidget(item.id)}
              </SortableDashboardItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default DashboardPage;