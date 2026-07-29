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

const getProgressByStatus = (status) => {
  const text = String(status || "").toLowerCase();

  if (text.includes("hoàn") || text.includes("complete")) return 100;
  if (text.includes("chờ") || text.includes("pending")) return 35;
  if (text.includes("hủy") || text.includes("cancel")) return 0;

  return 65;
};

const mapOrderToTask = (order) => ({
  id: `ORD-${order.serviceOrderId}`,
  customer: order.user?.fullName || "Không rõ",
  service: order.service?.serviceName || "Không rõ dịch vụ",
  deadline: order.completedDate || order.receivedDate || "Chưa có",
  status: order.status || "Đang xử lý",
  progress: getProgressByStatus(order.status),
});

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

const DashboardPage = () => {
  const [orders, setOrders] = useState([]);
  const [files, setFiles] = useState([]);
  const [taskOrder, setTaskOrder] = useState([]);
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
    const fetchDashboardData = async () => {
      try {
        const idUser = authStorage.getUserId();

        if (!idUser) {
          setOrders([]);
          setFiles([]);
          setTaskOrder([]);
          return;
        }

        const [orderData, fileData] =
          await Promise.all([
            serviceOrderApi.getByUser(idUser),
            serviceOrderFileApi.getAll()
          ]);

        const orderList = orderData || [];

        setOrders(orderList);
        setFiles(fileData || []);
        setTaskOrder(orderList.map(mapOrderToTask));
      } catch (error) {
        console.error("Lỗi tải dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    localStorage.setItem("dashboard-layout", JSON.stringify(dashboardItems));
  }, [dashboardItems]);

  const userOrderIds = useMemo(
    () => orders.map((item) => item.serviceOrderId),
    [orders]
  );

  const userFiles = useMemo(
    () =>
      files.filter((file) =>
        userOrderIds.includes(file.serviceOrder?.serviceOrderId)
      ),
    [files, userOrderIds]
  );

  const fileStats = useMemo(() => {
    const grouped = userFiles.reduce((result, file) => {
      const type = file.fileType || "Khác";

      if (!result[type]) {
        result[type] = {
          label: type,
          value: 0,
        };
      }

      result[type].value += 1;
      return result;
    }, {});

    return Object.values(grouped).map((item, index) => ({
      ...item,
      color: fileColors[index % fileColors.length],
    }));
  }, [userFiles]);

  const monthlyOrders = useMemo(() => {
    const result = monthLabels.map((month) => ({
      month,
      orders: 0,
    }));

    orders.forEach((order) => {
      const dateValue = order.createdAt || order.receivedDate;
      if (!dateValue) return;

      const date = new Date(dateValue);
      const monthIndex = date.getMonth();

      if (monthIndex >= 0 && monthIndex < 12) {
        result[monthIndex].orders += 1;
      }
    });

    return result;
  }, [orders]);

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

  const totalFiles = userFiles.length;

  const currentMonth = new Date().getMonth();
  const currentMonthOrders = monthlyOrders[currentMonth]?.orders || 0;
  const previousMonthOrders =
    monthlyOrders[currentMonth - 1 < 0 ? 11 : currentMonth - 1]?.orders || 0;

  const orderPercent =
    previousMonthOrders === 0
      ? currentMonthOrders > 0
        ? 100
        : 0
      : Math.round(
          ((currentMonthOrders - previousMonthOrders) / previousMonthOrders) *
            100
        );

  const completedTasks = taskOrder.filter((task) => task.progress === 100).length;

  const completedPercent =
    taskOrder.length === 0
      ? 0
      : Math.round((completedTasks / taskOrder.length) * 100);

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
    colors: ["#0192F5"],
    dataLabels: {
      enabled: false,
    },
    grid: {
      borderColor: "#f1f5f9",
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
          colors: "#6b7280",
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#6b7280",
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
                orderPercent >= 0 ? "text-emerald-500" : "text-red-500"
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
              <p className="font-semibold text-text-strong">Task hoàn thành</p>
              <CheckCircle2 className="text-brand" size={22} />
            </div>

            <h2 className="text-3xl font-bold text-text-strong">
              {completedPercent}%
            </h2>

            <p className="mt-1 text-sm text-text-muted">
              Tiến độ xử lý đơn hàng
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
                          <span className="rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand">
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