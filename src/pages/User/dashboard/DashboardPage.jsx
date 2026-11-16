import { useCallback, useEffect, useMemo, useState } from "react";
import Chart from "react-apexcharts";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Eye,
  FileText,
  MapPin,
  Package,
  PackagePlus,
  RefreshCw,
  Search,
  ShoppingBag,
  Star,
  User,
} from "lucide-react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";

import { serviceOrderApi } from "@/entities/service-order/api/serviceOrderApi";
import { serviceOrderFileApi } from "@/entities/service-order/api/serviceOrderFileApi";
import { useAuth } from "@/features/auth/model/useAuth";
import { StatusBadge } from "@/shared/ui/badge/StatusBadge";
import EmptyState from "@/shared/ui/empty-state/EmptyState";
import PageHeader from "@/shared/ui/heading/PageHeader";
import { PortalSectionCard } from "@/shared/ui/section/Section";
import { DashboardSkeleton } from "@/shared/ui/skeleton";
import StatCard from "@/shared/ui/stats/StatCard";

const MONTH_LABELS = [
  "Th1",
  "Th2",
  "Th3",
  "Th4",
  "Th5",
  "Th6",
  "Th7",
  "Th8",
  "Th9",
  "Th10",
  "Th11",
  "Th12",
];

const FILE_COLORS = ["#0284c7", "#6366f1", "#10b981", "#f59e0b", "#ec4899"];

const isCancelledOrder = (order) =>
  String(order?.status || "").toLowerCase() === "inactive" &&
  Boolean(order?.deletedAt);

const getOrderStatusMeta = (order) => {
  const status = String(order?.status || "pending").toLowerCase();

  if (isCancelledOrder(order)) {
    return {
      code: "inactive",
      label: "Đã hủy đơn hàng",
      tone: "danger",
      progress: 0,
    };
  }

  if (status === "pending") {
    return {
      code: "pending",
      label: "Chờ tiếp nhận",
      tone: "warning",
      progress: 35,
    };
  }

  if (status === "active") {
    return {
      code: "active",
      label: "Đang xử lý",
      tone: "info",
      progress: 65,
    };
  }

  if (status === "completed") {
    return {
      code: "completed",
      label: "Hoàn tất",
      tone: "success",
      progress: 100,
    };
  }

  return {
    code: status,
    label: "Không xác định",
    tone: "neutral",
    progress: 0,
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

const getFileCategory = (file) => {
  const type = String(file?.fileType || "").toLowerCase();

  if (type.startsWith("image/")) return "Ảnh bổ sung";
  if (type.includes("pdf")) return "Tài liệu PDF";
  if (type.includes("word") || type.includes("document"))
    return "Tài liệu Word";
  if (type.includes("excel") || type.includes("spreadsheet"))
    return "Bảng tính Excel";
  return "Tệp khác";
};

const getOrderCreatedDate = (order) => {
  const value = order?.createdAt || order?.receivedDate;
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { searchKeyword: topbarSearch = "" } = useOutletContext() || {};

  const [orders, setOrders] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [localSearch, setLocalSearch] = useState("");

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [orderResult, fileResult] = await Promise.allSettled([
        serviceOrderApi.getMine(),
        serviceOrderFileApi.getMine(),
      ]);

      setOrders(
        orderResult.status === "fulfilled" && Array.isArray(orderResult.value)
          ? orderResult.value
          : [],
      );

      setFiles(
        fileResult.status === "fulfilled" && Array.isArray(fileResult.value)
          ? fileResult.value
          : [],
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData(false);
  }, [fetchDashboardData]);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const metrics = useMemo(() => {
    let pendingCount = 0;
    let activeCount = 0;
    let completedCount = 0;
    let currentMonthOrders = 0;

    orders.forEach((order) => {
      if (isCancelledOrder(order)) return;

      const status = String(order?.status || "pending").toLowerCase();
      if (status === "pending") pendingCount += 1;
      else if (status === "active") activeCount += 1;
      else if (status === "completed") completedCount += 1;

      const createdDate = getOrderCreatedDate(order);
      if (
        createdDate &&
        createdDate.getFullYear() === currentYear &&
        createdDate.getMonth() === currentMonth
      ) {
        currentMonthOrders += 1;
      }
    });

    const productImageCount = orders.reduce(
      (total, order) => total + (order.productImage ? 1 : 0),
      0,
    );

    return {
      totalOrders: orders.length,
      pendingCount,
      activeCount,
      inProgressCount: pendingCount + activeCount,
      completedCount,
      currentMonthOrders,
      productImageCount,
      totalFiles: files.length + productImageCount,
    };
  }, [orders, files.length, currentYear, currentMonth]);

  const fileStats = useMemo(() => {
    const grouped = {};

    if (metrics.productImageCount > 0) {
      grouped["Ảnh sản phẩm"] = metrics.productImageCount;
    }

    files.forEach((file) => {
      const category = getFileCategory(file);
      grouped[category] = (grouped[category] || 0) + 1;
    });

    return Object.entries(grouped).map(([label, value], index) => ({
      label,
      value,
      color: FILE_COLORS[index % FILE_COLORS.length],
    }));
  }, [files, metrics.productImageCount]);

  const monthlyOrders = useMemo(() => {
    const result = MONTH_LABELS.map((month) => ({
      month,
      orders: 0,
    }));

    orders.forEach((order) => {
      const date = getOrderCreatedDate(order);
      if (!date || date.getFullYear() !== currentYear) return;
      result[date.getMonth()].orders += 1;
    });

    return result;
  }, [orders, currentYear]);

  const recentTasks = useMemo(() => {
    const effectiveKeyword = (localSearch || topbarSearch).trim().toLowerCase();

    const mapped = [...orders]
      .sort(
        (a, b) =>
          Number(b?.serviceOrderId ?? 0) - Number(a?.serviceOrderId ?? 0),
      )
      .map((order) => {
        const statusMeta = getOrderStatusMeta(order);
        return {
          id: `ORD-${order.serviceOrderId}`,
          orderId: order.serviceOrderId,
          productName: order.productName || "Sản phẩm may đo",
          serviceName: order.service?.serviceName || "Dịch vụ thiết kế",
          deadline: formatDate(order.completedDate || order.receivedDate),
          statusLabel: statusMeta.label,
          statusTone: statusMeta.tone,
          progress: statusMeta.progress,
        };
      });

    if (!effectiveKeyword) return mapped.slice(0, 8);

    return mapped
      .filter((task) =>
        [task.id, task.productName, task.serviceName, task.statusLabel]
          .join(" ")
          .toLowerCase()
          .includes(effectiveKeyword),
      )
      .slice(0, 8);
  }, [orders, localSearch, topbarSearch]);

  const orderChartOptions = useMemo(
    () => ({
      chart: {
        type: "bar",
        toolbar: { show: false },
        fontFamily: "inherit",
      },
      colors: ["#0284c7"],
      dataLabels: { enabled: false },
      grid: {
        borderColor: "rgba(148, 163, 184, 0.2)",
        strokeDashArray: 4,
      },
      plotOptions: {
        bar: {
          borderRadius: 8,
          columnWidth: "44%",
        },
      },
      xaxis: {
        categories: monthlyOrders.map((item) => item.month),
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          style: {
            colors: "#94a3b8",
            fontSize: "12px",
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: "#94a3b8",
            fontSize: "12px",
          },
        },
      },
      tooltip: {
        y: {
          formatter: (value) => `${value} đơn hàng`,
        },
      },
    }),
    [monthlyOrders],
  );

  const orderChartSeries = useMemo(
    () => [
      {
        name: "Đơn dịch vụ",
        data: monthlyOrders.map((item) => item.orders),
      },
    ],
    [monthlyOrders],
  );

  const fileChartOptions = useMemo(
    () => ({
      chart: {
        type: "donut",
        fontFamily: "inherit",
      },
      labels: fileStats.map((item) => item.label),
      colors: fileStats.map((item) => item.color),
      legend: {
        position: "bottom",
        fontSize: "12px",
        labels: { colors: "#64748b" },
      },
      dataLabels: { enabled: false },
      stroke: { width: 0 },
      plotOptions: {
        pie: {
          donut: {
            size: "72%",
            labels: {
              show: true,
              total: {
                show: true,
                label: "Tổng tệp",
                formatter: () => metrics.totalFiles,
              },
            },
          },
        },
      },
    }),
    [fileStats, metrics.totalFiles],
  );

  const fileChartSeries = useMemo(
    () => fileStats.map((item) => item.value),
    [fileStats],
  );

  if (loading) {
    return <DashboardSkeleton />;
  }

  const displayName = user?.fullName || user?.userCode || "Khách hàng";

  return (
    <div className="animate-in space-y-6 duration-200 fade-in">
      {/* 1. Page Header */}
      <PageHeader
        title="Bảng điều khiển"
        badge={<StatusBadge label="Cổng khách hàng" tone="brand" />}
        description={`Xin chào ${displayName}, theo dõi tiến độ đơn dịch vụ may mặc và quản lý tài khoản của bạn.`}
        actions={
          <>
            <button
              type="button"
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
              className="flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              title="Làm mới dữ liệu"
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
              onClick={() => navigate("/user/service-order?create=1")}
              className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl bg-brand! px-3.5 text-xs font-semibold text-white! shadow-sm shadow-brand/25 transition-all hover:bg-brand-hover! active:scale-95"
            >
              <PackagePlus size={15} />
              <span>Tạo đơn dịch vụ</span>
            </button>
          </>
        }
      />

      {/* 2. Top KPI Metric Cards */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Tổng đơn dịch vụ"
          value={metrics.totalOrders}
          subtitle={`${metrics.currentMonthOrders} đơn trong tháng ${currentMonth + 1}`}
          icon={ShoppingBag}
          iconColorClass="bg-blue-50 text-brand dark:bg-blue-950/50 dark:text-blue-400"
          hoverBorderClass="hover:border-blue-300"
          onClick={() => navigate("/user/service-order")}
        />

        <StatCard
          title="Đang xử lý"
          value={metrics.inProgressCount}
          subtitle={`${metrics.pendingCount} chờ tiếp nhận, ${metrics.activeCount} đang làm`}
          icon={Clock3}
          iconColorClass="bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
          hoverBorderClass="hover:border-amber-300"
          onClick={() => navigate("/user/service-order")}
        />

        <StatCard
          title="Đơn hoàn tất"
          value={metrics.completedCount}
          subtitle="đã nghiệm thu & bàn giao"
          icon={CheckCircle2}
          iconColorClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
          hoverBorderClass="hover:border-emerald-300"
          onClick={() => navigate("/user/service-reviews")}
        />

        <StatCard
          title="Tệp tin & hình ảnh"
          value={metrics.totalFiles}
          subtitle="ảnh mẫu & tài liệu đính kèm"
          icon={FileText}
          iconColorClass="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
          hoverBorderClass="hover:border-indigo-300"
          onClick={() => navigate("/user/service-order")}
        />
      </section>

      {/* 3. Analytics Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <PortalSectionCard
          title="Thống kê đơn hàng theo tháng"
          description={`Biểu đồ số lượng đơn dịch vụ của bạn trong năm ${currentYear}`}
          icon={BarChart3}
          className="lg:col-span-2"
        >
          <Chart
            options={orderChartOptions}
            series={orderChartSeries}
            type="bar"
            height={295}
          />
        </PortalSectionCard>

        <PortalSectionCard
          title="Phân loại tệp đính kèm"
          description="Ảnh sản phẩm và tài liệu kỹ thuật đã tải lên"
          icon={FileText}
          iconClassName="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
        >
          {fileStats.length > 0 ? (
            <Chart
              options={fileChartOptions}
              series={fileChartSeries}
              type="donut"
              height={295}
            />
          ) : (
            <div className="flex h-72 items-center justify-center">
              <EmptyState
                icon={FileText}
                title="Chưa có tệp đính kèm"
                description="Hình ảnh sản phẩm và tài liệu thiết kế sẽ thống kê tại đây."
              />
            </div>
          )}
        </PortalSectionCard>
      </div>

      {/* 4. Quick Shortcuts */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          to="/user/service-order?create=1"
          className="group flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition-all hover:border-brand/40 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-brand dark:bg-blue-950/50">
              <PackagePlus size={19} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 group-hover:text-brand dark:text-white">
                Đặt đơn dịch vụ
              </p>
              <p className="text-[11px] text-slate-400">
                Thiết kế rập & in sơ đồ
              </p>
            </div>
          </div>
          <ArrowRight
            size={15}
            className="text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-brand"
          />
        </Link>

        <Link
          to="/user/service-reviews"
          className="group flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition-all hover:border-amber-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <Star size={19} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 group-hover:text-amber-600 dark:text-white">
                Đánh giá dịch vụ
              </p>
              <p className="text-[11px] text-slate-400">
                Nhận xét đơn đã hoàn thành
              </p>
            </div>
          </div>
          <ArrowRight
            size={15}
            className="text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-amber-600"
          />
        </Link>

        <Link
          to="/user/address"
          className="group flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition-all hover:border-emerald-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <MapPin size={19} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 dark:text-white">
                Sổ địa chỉ
              </p>
              <p className="text-[11px] text-slate-400">
                Địa chỉ giao nhận mặc định
              </p>
            </div>
          </div>
          <ArrowRight
            size={15}
            className="text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-emerald-600"
          />
        </Link>

        <Link
          to="/user/profile"
          className="group flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition-all hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <User size={19} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white">
                Hồ sơ cá nhân
              </p>
              <p className="text-[11px] text-slate-400">
                Thông tin & xác thực tài khoản
              </p>
            </div>
          </div>
          <ArrowRight
            size={15}
            className="text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-indigo-600"
          />
        </Link>
      </section>

      {/* 5. Recent Service Orders */}
      <PortalSectionCard
        title="Đơn dịch vụ gần đây"
        description="Danh sách đơn hàng dịch vụ mới nhất và tiến độ xử lý"
        icon={ClipboardList}
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative w-56">
              <Search
                size={15}
                className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Lọc mã đơn, dịch vụ..."
                className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/70 pr-3 pl-8.5 text-xs text-slate-800 transition-all placeholder:text-slate-400 focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/10 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
              />
            </div>

            <Link
              to="/user/service-order"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
            >
              Xem tất cả &rarr;
            </Link>
          </div>
        }
      >
        {recentTasks.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Chưa có đơn dịch vụ nào"
            description="Bắt đầu đặt đơn thiết kế rập hoặc in sơ đồ may mặc ngay hôm nay."
            action={
              <button
                type="button"
                onClick={() => navigate("/user/service-order?create=1")}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-brand! px-4 py-2 text-xs font-semibold text-white! shadow-xs transition hover:bg-brand-hover!"
              >
                <PackagePlus size={15} />
                <span>Tạo đơn dịch vụ đầu tiên</span>
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-180 text-left">
              <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold tracking-wider text-slate-500 uppercase dark:border-slate-800 dark:bg-slate-800/40">
                <tr>
                  <th className="px-4 py-3 whitespace-nowrap">Mã đơn</th>
                  <th className="px-4 py-3 whitespace-nowrap">
                    Dịch vụ & Sản phẩm
                  </th>
                  <th className="px-4 py-3 whitespace-nowrap">
                    Ngày hẹn / Hoàn thành
                  </th>
                  <th className="px-4 py-3 whitespace-nowrap">Tiến độ</th>
                  <th className="px-4 py-3 whitespace-nowrap">Trạng thái</th>
                  <th className="px-4 py-3 text-right whitespace-nowrap">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
                {recentTasks.map((task) => (
                  <tr
                    key={task.id}
                    className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/50"
                  >
                    <td className="px-4 py-3.5 font-bold whitespace-nowrap text-brand">
                      <Link
                        to="/user/service-order"
                        className="hover:underline"
                      >
                        {task.id}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {task.serviceName}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {task.productName}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-500 dark:text-slate-400">
                      {task.deadline}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className="h-full rounded-full bg-brand transition-all"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                          {task.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <StatusBadge
                        label={task.statusLabel}
                        tone={task.statusTone}
                      />
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <Link
                        to="/user/service-order"
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-brand dark:hover:bg-slate-800"
                        title="Xem danh sách đơn"
                      >
                        <Eye size={15} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PortalSectionCard>
    </div>
  );
};

export default DashboardPage;
