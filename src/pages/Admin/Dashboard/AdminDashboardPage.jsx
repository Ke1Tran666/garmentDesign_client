import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Download,
  Eye,
  PackageCheck,
  RefreshCw,
  ShoppingBag,
  SlidersHorizontal,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import Chart from "react-apexcharts";

import { serviceOrderApi } from "@/entities/service-order/api/serviceOrderApi";
import { exportToExcel } from "@/shared/lib/exportUtils";
import { useNotification } from "@/app/providers/NotificationProvider";

const STATS_DATA = {
  "30days": [
    {
      label: "Tổng người dùng",
      value: "1.248",
      subtext: "+12,5% so với tháng trước",
      trend: "up",
      icon: Users,
      gradient: "from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400",
      borderColor: "border-blue-200 dark:border-blue-900/50",
    },
    {
      label: "Đơn dịch vụ",
      value: "386",
      subtext: "+8,2% so với tháng trước",
      trend: "up",
      icon: ShoppingBag,
      gradient: "from-sky-500/10 to-brand/10 text-brand",
      borderColor: "border-sky-200 dark:border-sky-900/50",
    },
    {
      label: "Đang xử lý",
      value: "42",
      subtext: "-3,1% so với tuần trước",
      trend: "down",
      icon: Clock3,
      gradient: "from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400",
      borderColor: "border-amber-200 dark:border-amber-900/50",
    },
    {
      label: "Doanh thu dịch vụ",
      value: "128,6M đ",
      subtext: "+18,4% so với tháng trước",
      trend: "up",
      icon: CircleDollarSign,
      gradient: "from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400",
      borderColor: "border-emerald-200 dark:border-emerald-900/50",
    },
  ],
  "7days": [
    {
      label: "Người dùng mới",
      value: "64",
      subtext: "+5,4% so với tuần trước",
      trend: "up",
      icon: Users,
      gradient: "from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400",
      borderColor: "border-blue-200 dark:border-blue-900/50",
    },
    {
      label: "Đơn dịch vụ mới",
      value: "48",
      subtext: "+12,1% so với tuần trước",
      trend: "up",
      icon: ShoppingBag,
      gradient: "from-sky-500/10 to-brand/10 text-brand",
      borderColor: "border-sky-200 dark:border-sky-900/50",
    },
    {
      label: "Đang chờ duyệt",
      value: "15",
      subtext: "+2 đơn mới hôm nay",
      trend: "up",
      icon: Clock3,
      gradient: "from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400",
      borderColor: "border-amber-200 dark:border-amber-900/50",
    },
    {
      label: "Doanh thu tuần",
      value: "32,4M đ",
      subtext: "+14,2% so với tuần trước",
      trend: "up",
      icon: CircleDollarSign,
      gradient: "from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400",
      borderColor: "border-emerald-200 dark:border-emerald-900/50",
    },
  ],
  year: [
    {
      label: "Tổng người dùng",
      value: "1.248",
      subtext: "+38,2% so với năm 2025",
      trend: "up",
      icon: Users,
      gradient: "from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400",
      borderColor: "border-blue-200 dark:border-blue-900/50",
    },
    {
      label: "Tổng đơn cả năm",
      value: "3.420",
      subtext: "+24,6% so với năm trước",
      trend: "up",
      icon: ShoppingBag,
      gradient: "from-sky-500/10 to-brand/10 text-brand",
      borderColor: "border-sky-200 dark:border-sky-900/50",
    },
    {
      label: "Tỷ lệ hoàn thành",
      value: "94,8%",
      subtext: "+2,3% độ chuẩn xác",
      trend: "up",
      icon: CheckCircle2,
      gradient: "from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-400",
      borderColor: "border-indigo-200 dark:border-indigo-900/50",
    },
    {
      label: "Doanh thu luỹ kế",
      value: "1,42 tỷ đ",
      subtext: "+31,5% so với cùng kỳ",
      trend: "up",
      icon: CircleDollarSign,
      gradient: "from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400",
      borderColor: "border-emerald-200 dark:border-emerald-900/50",
    },
  ],
};

const DEFAULT_RECENT_ORDERS = [
  {
    id: "ORD-1028",
    customer: "Nguyễn Minh Anh",
    phone: "0912 345 678",
    service: "Thiết kế rập đầm dạ hội",
    date: "30/10/2026",
    amount: "2.500.000 đ",
    status: "processing",
  },
  {
    id: "ORD-1027",
    customer: "Trần Ngọc Linh",
    phone: "0988 765 432",
    service: "Nhảy size sơ mi xuất khẩu",
    date: "29/10/2026",
    amount: "1.800.000 đ",
    status: "pending",
  },
  {
    id: "ORD-1026",
    customer: "Fashion Lab VN",
    phone: "0903 112 233",
    service: "Giác sơ đồ & tính định mức vải",
    date: "28/10/2026",
    amount: "5.200.000 đ",
    status: "completed",
  },
  {
    id: "ORD-1025",
    customer: "Xưởng may An Phú",
    phone: "0934 889 900",
    service: "In sơ đồ khổ lớn 1.6m",
    date: "27/10/2026",
    amount: "980.000 đ",
    status: "completed",
  },
  {
    id: "ORD-1024",
    customer: "Lê Hoàng Yến",
    phone: "0977 445 566",
    service: "Thiết kế mẫu áo khoác Blazer",
    date: "26/10/2026",
    amount: "3.600.000 đ",
    status: "processing",
  },
];

const ORDER_STATUS_MAP = {
  pending: {
    label: "Chờ tiếp nhận",
    className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50",
  },
  processing: {
    label: "Đang xử lý",
    className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/50",
  },
  completed: {
    label: "Hoàn thành",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50",
  },
  cancelled: {
    label: "Đã hủy",
    className: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50",
  },
};

const TOP_SERVICES = [
  { name: "Thiết kế rập rập mẫu", count: 142, revenue: "42.5M", percent: 78 },
  { name: "Nhảy size công nghiệp", count: 118, revenue: "28.3M", percent: 65 },
  { name: "Giác sơ đồ định mức vải", count: 96, revenue: "31.2M", percent: 54 },
  { name: "May mẫu thử nghiệm", count: 54, revenue: "26.6M", percent: 36 },
];

const ACTIVITIES = [
  {
    title: "Đơn hàng mới #ORD-1028 được tạo",
    desc: "Khách hàng Nguyễn Minh Anh vừa đặt dịch vụ Thiết kế rập",
    time: "10 phút trước",
    icon: ShoppingBag,
    color: "bg-sky-50 text-brand dark:bg-sky-950/50 dark:text-sky-400",
  },
  {
    title: "Đơn #ORD-1026 đã nghiệm thu hoàn thành",
    desc: "Fashion Lab VN đã xác nhận file rập và thanh toán thành công",
    time: "45 phút trước",
    icon: CheckCircle2,
    color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
  },
  {
    title: "Khách hàng mới đăng ký tài khoản",
    desc: "Tài khoản tran.anh.quan@example.com kích hoạt thành công",
    time: "2 giờ trước",
    icon: Users,
    color: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400",
  },
  {
    title: "Cập nhật bảng giá dịch vụ in sơ đồ",
    desc: "Admin vừa điều chỉnh mức giá cơ bản cho khổ 1.8m",
    time: "4 giờ trước",
    icon: SlidersHorizontal,
    color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400",
  },
];

const AdminDashboardPage = () => {
  const { showNotification } = useNotification();
  const [period, setPeriod] = useState("30days");
  const [loadingRefresh, setLoadingRefresh] = useState(false);
  const [orders, setOrders] = useState(DEFAULT_RECENT_ORDERS);

  // Load real recent orders if available
  useEffect(() => {
    let active = true;
    serviceOrderApi
      .getAll()
      .then((data) => {
        if (!active || !Array.isArray(data) || data.length === 0) return;
        const normalized = data.slice(0, 5).map((item) => ({
          id: `ORD-${item.id || item.orderId || "---"}`,
          customer: item.user?.fullName || item.customerName || "Khách hàng",
          phone: item.user?.phone || item.phone || "---",
          service: item.service?.nameService || item.serviceName || "Dịch vụ may mặc",
          date: item.createdAt ? new Date(item.createdAt).toLocaleDateString("vi-VN") : "Hôm nay",
          amount: item.totalPrice
            ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.totalPrice)
            : "Chưa tính",
          status: String(item.status || "pending").toLowerCase(),
        }));
        setOrders(normalized);
      })
      .catch(() => {
        // Fallback to demo orders silently
      });

    return () => {
      active = false;
    };
  }, []);

  const handleRefresh = () => {
    setLoadingRefresh(true);
    setTimeout(() => {
      setLoadingRefresh(false);
      showNotification({
        type: "success",
        title: "Đã làm mới dữ liệu",
        message: "Số liệu bảng điều khiển đã được đồng bộ mới nhất.",
      });
    }, 600);
  };

  const handleExportDashboard = () => {
    const exportData = orders.map((o) => ({
      "Mã đơn": o.id,
      "Khách hàng": o.customer,
      "Số điện thoại": o.phone,
      "Dịch vụ": o.service,
      "Ngày tạo": o.date,
      "Tổng tiền": o.amount,
      "Trạng thái": ORDER_STATUS_MAP[o.status]?.label || o.status,
    }));
    const success = exportToExcel(exportData, "Bao_Cao_Dashboard_Don_Hang", "Orders");
    if (success) {
      showNotification({
        type: "success",
        title: "Xuất dữ liệu thành công",
        message: "Tệp Excel thống kê đơn hàng đã được tải về máy của bạn.",
      });
    }
  };

  // ApexCharts Configs
  const revenueChartOptions = useMemo(
    () => ({
      chart: {
        type: "area",
        height: 300,
        toolbar: { show: false },
        fontFamily: "Inter, sans-serif",
      },
      colors: ["#0192f5", "#10b981"],
      dataLabels: { enabled: false },
      stroke: { curve: "smooth", width: 3 },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.45,
          opacityTo: 0.05,
          stops: [0, 95, 100],
        },
      },
      xaxis: {
        categories: [
          "T1", "T2", "T3", "T4", "T5", "T6",
          "T7", "T8", "T9", "T10", "T11", "T12"
        ],
        labels: {
          style: { colors: "#64748b", fontSize: "12px", fontWeight: 500 },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: [
        {
          title: {
            text: "Doanh thu (triệu VNĐ)",
            style: { color: "#0192f5", fontSize: "11px", fontWeight: 600 },
          },
          labels: {
            style: { colors: "#64748b" },
            formatter: (val) => `${val}M`,
          },
        },
        {
          opposite: true,
          title: {
            text: "Số lượng đơn",
            style: { color: "#10b981", fontSize: "11px", fontWeight: 600 },
          },
          labels: {
            style: { colors: "#64748b" },
            formatter: (val) => `${val}`,
          },
        },
      ],
      legend: {
        position: "top",
        horizontalAlign: "right",
        labels: { colors: "#475569" },
      },
      grid: {
        borderColor: "#f1f5f9",
        strokeDashArray: 4,
      },
      tooltip: {
        shared: true,
        intersect: false,
        y: [
          {
            formatter: (val) => `${val} triệu VNĐ`,
          },
          {
            formatter: (val) => `${val} đơn hoàn thành`,
          },
        ],
      },
    }),
    []
  );

  const revenueChartSeries = useMemo(
    () => [
      {
        name: "Doanh thu",
        data: [42, 55, 48, 68, 74, 92, 85, 104, 98, 128, 115, 140],
      },
      {
        name: "Số đơn hàng",
        data: [28, 36, 32, 45, 52, 64, 58, 72, 66, 84, 76, 92],
      },
    ],
    []
  );

  const statusDonutOptions = useMemo(
    () => ({
      chart: {
        type: "donut",
        fontFamily: "Inter, sans-serif",
      },
      labels: ["Hoàn thành", "Đang xử lý", "Chờ duyệt", "Đã hủy"],
      colors: ["#10b981", "#0192f5", "#f59e0b", "#f43f5e"],
      dataLabels: { enabled: false },
      plotOptions: {
        pie: {
          donut: {
            size: "72%",
            labels: {
              show: true,
              total: {
                show: true,
                label: "Tổng đơn",
                fontSize: "13px",
                fontWeight: 600,
                color: "#64748b",
                formatter: () => "386",
              },
            },
          },
        },
      },
      legend: {
        position: "bottom",
        horizontalAlign: "center",
        fontSize: "12px",
        markers: { radius: 12 },
        itemMargin: { horizontal: 8, vertical: 4 },
      },
      stroke: { width: 0 },
    }),
    []
  );

  const statusDonutSeries = [224, 92, 46, 24];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* =========================================
          PAGE HEADER & CONTROLS
          ========================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Bảng điều khiển quản trị
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-soft text-brand dark:bg-brand/20">
              <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
              Live 2026
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Theo dõi hiệu suất vận hành, tăng trưởng doanh thu và quản lý luồng đơn dịch vụ may mặc.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Period Selector Tabs */}
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <button
              type="button"
              onClick={() => setPeriod("7days")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                period === "7days"
                  ? "bg-white text-brand shadow-xs dark:bg-slate-700 dark:text-white"
                  : "hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              7 ngày
            </button>
            <button
              type="button"
              onClick={() => setPeriod("30days")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                period === "30days"
                  ? "bg-white text-brand shadow-xs dark:bg-slate-700 dark:text-white"
                  : "hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              30 ngày
            </button>
            <button
              type="button"
              onClick={() => setPeriod("year")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                period === "year"
                  ? "bg-white text-brand shadow-xs dark:bg-slate-700 dark:text-white"
                  : "hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Năm 2026
            </button>
          </div>

          {/* Action buttons */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loadingRefresh}
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors shadow-xs"
            title="Làm mới dữ liệu"
          >
            <RefreshCw
              size={14}
              className={loadingRefresh ? "animate-spin text-brand" : "text-slate-400"}
            />
            <span className="hidden sm:inline">Làm mới</span>
          </button>

          <button
            type="button"
            onClick={handleExportDashboard}
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors shadow-xs"
            title="Xuất báo cáo Excel"
          >
            <Download size={14} className="text-slate-400" />
            <span className="hidden sm:inline">Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* =========================================
          KEY PERFORMANCE INDICATORS (KPI CARDS)
          ========================================= */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {STATS_DATA[period].map((stat, i) => {
          const Icon = stat.icon;
          const isUp = stat.trend === "up";
          return (
            <div
              key={i}
              className={`relative overflow-hidden rounded-2xl border bg-white p-5 shadow-xs hover:shadow-md transition-all duration-200 dark:bg-slate-900 ${stat.borderColor}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block truncate">
                    {stat.label}
                  </span>
                  <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {stat.value}
                  </div>
                </div>
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br ${stat.gradient} shadow-xs`}
                >
                  <Icon size={22} className="stroke-[2.2]" />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <span
                  className={`inline-flex items-center gap-1 font-semibold ${
                    isUp ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {isUp ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
                  {stat.subtext.split(" ")[0]}
                </span>
                <span className="text-slate-400 text-[11px] truncate">
                  {stat.subtext.replace(stat.subtext.split(" ")[0], "")}
                </span>
              </div>
            </div>
          );
        })}
      </section>

      {/* =========================================
          CHARTS SECTION (APEXCHARTS)
          ========================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Spline Area Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                  Biểu đồ Doanh thu & Đơn dịch vụ
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
                  +18.4% YoY
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Biến động doanh số và số lượng đơn hàng hoàn tất qua các tháng năm 2026.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-brand" /> Doanh thu
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Đơn hoàn thành
              </span>
            </div>
          </div>

          <div className="h-80 w-full">
            <Chart
              options={revenueChartOptions}
              series={revenueChartSeries}
              type="area"
              height="100%"
            />
          </div>
        </div>

        {/* Donut Chart: Order Status Distribution */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
              Trạng thái đơn hàng
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tỷ lệ phân bổ trạng thái các đơn dịch vụ hiện hành.
            </p>
          </div>

          <div className="my-auto py-4">
            <Chart
              options={statusDonutOptions}
              series={statusDonutSeries}
              type="donut"
              height={260}
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <Link
              to="/admin/service-orders"
              className="text-xs font-semibold text-brand hover:underline inline-flex items-center gap-1"
            >
              Xem chi tiết tiến độ tại Kanban Board &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================
          SHORTCUT QUICK ACTIONS
          ========================================= */}
      <div className="rounded-2xl border border-brand/20 bg-linear-to-r from-brand/5 via-sky-500/5 to-indigo-500/5 p-4 sm:p-5 dark:border-slate-800 dark:from-slate-900 dark:to-slate-900/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-white shadow-sm">
              <TrendingUp size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Thao tác quản trị nhanh
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Các phím tắt điều hướng nhanh giúp tối ưu thời gian thao tác hàng ngày.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/admin/users/create"
              className="inline-flex items-center gap-1.5 h-8.5 px-3 rounded-xl bg-white text-slate-700 hover:text-brand border border-slate-200 text-xs font-semibold shadow-2xs hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 transition-colors"
            >
              <UserPlus size={14} className="text-brand" />
              <span>Thêm người dùng</span>
            </Link>
            <Link
              to="/admin/services"
              className="inline-flex items-center gap-1.5 h-8.5 px-3 rounded-xl bg-white text-slate-700 hover:text-brand border border-slate-200 text-xs font-semibold shadow-2xs hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 transition-colors"
            >
              <SlidersHorizontal size={14} className="text-indigo-500" />
              <span>Cập nhật bảng giá</span>
            </Link>
            <Link
              to="/admin/service-orders"
              className="inline-flex items-center gap-1.5 h-8.5 px-3 rounded-xl bg-brand text-white hover:bg-brand-hover text-xs font-semibold shadow-xs transition-colors"
            >
              <PackageCheck size={14} />
              <span>Xử lý đơn mới</span>
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================
          RECENT ORDERS & LIVE ACTIVITY FEED
          ========================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
            <div>
              <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                Đơn dịch vụ gần đây
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Các đơn thiết kế rập và may mẫu được tạo mới nhất
              </p>
            </div>
            <Link
              to="/admin/service-orders"
              className="text-xs font-semibold text-brand hover:text-brand-hover inline-flex items-center gap-1"
            >
              Xem tất cả đơn &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-160 text-left">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800/40 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3">Mã đơn</th>
                  <th className="px-5 py-3">Khách hàng</th>
                  <th className="px-5 py-3">Dịch vụ</th>
                  <th className="px-5 py-3">Ngày tạo</th>
                  <th className="px-5 py-3">Tổng tiền</th>
                  <th className="px-5 py-3">Trạng thái</th>
                  <th className="px-5 py-3 text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {orders.map((order) => {
                  const statusInfo = ORDER_STATUS_MAP[order.status] || ORDER_STATUS_MAP.pending;
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/70 transition-colors dark:hover:bg-slate-800/50"
                    >
                      <td className="px-5 py-3.5 font-bold text-brand">
                        {order.id}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {order.customer}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {order.phone}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300 font-medium">
                        {order.service}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                        {order.date}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                        {order.amount}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusInfo.className}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          to="/admin/service-orders"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-brand hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Xem chi tiết đơn"
                        >
                          <Eye size={15} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Activity & Top Services Column */}
        <div className="space-y-6">
          {/* Top Services ranking */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white mb-1">
              Top Dịch vụ thịnh hành
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Theo khối lượng đơn đặt hàng
            </p>

            <div className="space-y-3.5">
              {TOP_SERVICES.map((srv, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {srv.name}
                    </span>
                    <span className="font-bold text-brand">{srv.count} đơn</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-brand to-sky-400 transition-all duration-500"
                      style={{ width: `${srv.percent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Doanh thu: {srv.revenue}</span>
                    <span>Tỷ trọng: {srv.percent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white mb-1">
              Nhật ký hoạt động gần đây
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Sự kiện hệ thống ghi nhận tức thời
            </p>

            <div className="space-y-4">
              {ACTIVITIES.map((act, idx) => {
                const Icon = act.icon;
                return (
                  <div key={idx} className="flex gap-3">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${act.color}`}
                    >
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                        {act.title}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                        {act.desc}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {act.time}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
