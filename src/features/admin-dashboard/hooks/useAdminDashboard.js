import { useCallback, useEffect, useMemo, useState } from "react";
import { useNotification } from "@/app/providers/NotificationProvider";
import { serviceApi } from "@/entities/service/api/serviceApi";
import { serviceOrderApi } from "@/entities/service-order/api/serviceOrderApi";
import { userApi } from "@/entities/user/api/userApi";
import {
  formatDate,
  formatPrice,
  getOrderStatusValue,
  getStatusInfo,
} from "@/features/service-order-management";
import { exportToExcel } from "@/shared/lib/exportUtils";

const MONTH_NAMES = [
  "T1",
  "T2",
  "T3",
  "T4",
  "T5",
  "T6",
  "T7",
  "T8",
  "T9",
  "T10",
  "T11",
  "T12",
];

export const useAdminDashboard = () => {
  const { showNotification } = useNotification();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState("year"); // "7days", "30days", "year", "all"

  // Real data state from Backend
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);

  // Fetch all dashboard data from Backend APIs on manual refresh
  const handleManualRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      const config = { forceRefresh: true };

      const [ordersRes, usersRes, servicesRes] = await Promise.allSettled([
        serviceOrderApi.getAll(config),
        userApi.getAll(config),
        serviceApi.getAdminAll(config),
      ]);

      if (ordersRes.status === "fulfilled" && Array.isArray(ordersRes.value)) {
        setOrders(ordersRes.value);
      }

      if (usersRes.status === "fulfilled" && Array.isArray(usersRes.value)) {
        setUsers(usersRes.value);
      }

      if (
        servicesRes.status === "fulfilled" &&
        Array.isArray(servicesRes.value)
      ) {
        setServices(servicesRes.value);
      }

      showNotification({
        type: "success",
        title: "Làm mới thành công",
        message: "Dữ liệu bảng điều khiển đã được đồng bộ từ Backend.",
      });
    } catch (err) {
      showNotification({
        type: "error",
        title: "Lỗi đồng bộ dữ liệu",
        message:
          err.response?.data?.message || "Không thể tải dữ liệu bảng điều khiển.",
      });
    } finally {
      setRefreshing(false);
    }
  }, [showNotification]);

  // Initial load from Backend
  useEffect(() => {
    let active = true;

    const loadInitialData = async () => {
      try {
        const [ordersRes, usersRes, servicesRes] = await Promise.allSettled([
          serviceOrderApi.getAll(),
          userApi.getAll(),
          serviceApi.getAdminAll(),
        ]);

        if (!active) return;

        setOrders(
          ordersRes.status === "fulfilled" && Array.isArray(ordersRes.value)
            ? ordersRes.value
            : [],
        );
        setUsers(
          usersRes.status === "fulfilled" && Array.isArray(usersRes.value)
            ? usersRes.value
            : [],
        );
        setServices(
          servicesRes.status === "fulfilled" && Array.isArray(servicesRes.value)
            ? servicesRes.value
            : [],
        );
      } catch {
        if (!active) return;
        setOrders([]);
        setUsers([]);
        setServices([]);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadInitialData();

    return () => {
      active = false;
    };
  }, []);

  // Filter orders by selected period
  const filteredOrders = useMemo(() => {
    if (!orders || orders.length === 0) return [];
    if (period === "all") return orders;

    const now = new Date();
    const currentYear = now.getFullYear();

    return orders.filter((order) => {
      const dateVal = order.createdAt || order.receivedDate;
      if (!dateVal) return true;
      const orderDate = new Date(dateVal);
      if (Number.isNaN(orderDate.getTime())) return true;

      if (period === "7days") {
        return now.getTime() - orderDate.getTime() <= 7 * 24 * 60 * 60 * 1000;
      }
      if (period === "30days") {
        return now.getTime() - orderDate.getTime() <= 30 * 24 * 60 * 60 * 1000;
      }
      if (period === "year") {
        return orderDate.getFullYear() === currentYear;
      }
      return true;
    });
  }, [orders, period]);

  // Dynamic KPI Stats calculations
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const totalOrders = filteredOrders.length;

    let pendingCount = 0;
    let activeCount = 0;
    let completedCount = 0;
    let cancelledCount = 0;
    let totalRevenue = 0;

    filteredOrders.forEach((order) => {
      const status = getOrderStatusValue(order);
      if (status === "pending") pendingCount += 1;
      else if (status === "active") activeCount += 1;
      else if (status === "completed") {
        completedCount += 1;
        totalRevenue += Number(order.totalPrice) || 0;
      } else if (status === "cancelled") {
        cancelledCount += 1;
      }
    });

    return {
      totalUsers,
      totalOrders,
      pendingCount,
      activeCount,
      completedCount,
      cancelledCount,
      totalRevenue,
    };
  }, [users, filteredOrders]);

  // Monthly Revenue & Order Volume Data (ApexCharts Spline Area Chart)
  const { monthlyRevenue, monthlyOrdersCount } = useMemo(() => {
    const revenueArr = Array(12).fill(0);
    const orderCountArr = Array(12).fill(0);
    const currentYear = new Date().getFullYear();

    orders.forEach((order) => {
      const dateVal = order.createdAt || order.receivedDate;
      if (!dateVal) return;
      const date = new Date(dateVal);
      if (Number.isNaN(date.getTime())) return;

      if (period === "year" && date.getFullYear() !== currentYear) return;

      const monthIndex = date.getMonth();
      if (monthIndex >= 0 && monthIndex < 12) {
        orderCountArr[monthIndex] += 1;
        if (getOrderStatusValue(order) === "completed") {
          revenueArr[monthIndex] += Number(order.totalPrice) || 0;
        }
      }
    });

    const revenueInMillions = revenueArr.map((val) =>
      Number((val / 1_000_000).toFixed(2)),
    );

    return {
      monthlyRevenue: revenueInMillions,
      monthlyOrdersCount: orderCountArr,
    };
  }, [orders, period]);

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
        categories: MONTH_NAMES,
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
            formatter: (val) => `${Math.round(val)}`,
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
            formatter: (val) => `${val} đơn hàng`,
          },
        ],
      },
    }),
    [],
  );

  const revenueChartSeries = useMemo(
    () => [
      {
        name: "Doanh thu",
        data: monthlyRevenue,
      },
      {
        name: "Số đơn hàng",
        data: monthlyOrdersCount,
      },
    ],
    [monthlyRevenue, monthlyOrdersCount],
  );

  // Status Donut Chart Config & Data
  const statusDonutSeries = useMemo(
    () => [
      stats.completedCount,
      stats.activeCount,
      stats.pendingCount,
      stats.cancelledCount,
    ],
    [stats],
  );

  const statusDonutOptions = useMemo(
    () => ({
      chart: {
        type: "donut",
        fontFamily: "Inter, sans-serif",
      },
      labels: ["Hoàn thành", "Đang xử lý", "Chờ tiếp nhận", "Đã hủy"],
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
                formatter: () => `${filteredOrders.length}`,
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
    [filteredOrders.length],
  );

  // Dynamic Top Services by Order Volume & Revenue
  const topServices = useMemo(() => {
    const serviceMap = new Map();

    services.forEach((s) => {
      serviceMap.set(s.serviceId, {
        id: s.serviceId,
        name: s.serviceName,
        count: 0,
        revenue: 0,
      });
    });

    orders.forEach((o) => {
      const sId = o.service?.serviceId;
      const sName = o.service?.serviceName || "Dịch vụ khác";
      if (sId && serviceMap.has(sId)) {
        const item = serviceMap.get(sId);
        item.count += 1;
        item.revenue += Number(o.totalPrice) || 0;
      } else {
        const key = sId || sName;
        const existing = serviceMap.get(key) || {
          id: key,
          name: sName,
          count: 0,
          revenue: 0,
        };
        existing.count += 1;
        existing.revenue += Number(o.totalPrice) || 0;
        serviceMap.set(key, existing);
      }
    });

    const list = Array.from(serviceMap.values());
    list.sort((a, b) => b.count - a.count || b.revenue - a.revenue);

    const maxCount = Math.max(1, orders.length);
    return list.slice(0, 4).map((item) => ({
      ...item,
      percent: Math.min(100, Math.round((item.count / maxCount) * 100)),
    }));
  }, [orders, services]);

  // Dynamic Activity Feed (Built from latest orders and users)
  const activities = useMemo(() => {
    const items = [];

    orders.forEach((o) => {
      const status = getOrderStatusValue(o);
      const isCompleted = status === "completed";
      const ts = o.updatedAt
        ? new Date(o.updatedAt).getTime()
        : o.createdAt
          ? new Date(o.createdAt).getTime()
          : 0;

      items.push({
        id: `order-${o.serviceOrderId}-${status}`,
        timestamp: ts,
        title: isCompleted
          ? `Đơn ORD-${o.serviceOrderId} đã hoàn tất`
          : `Đơn ORD-${o.serviceOrderId} được ghi nhận`,
        desc: isCompleted
          ? `Đã hoàn thành ${o.meterCount ? `${o.meterCount} mét in` : o.productName || "đơn hàng"}. Tổng tiền: ${formatPrice(o.totalPrice)}`
          : `Khách hàng ${o.user?.fullName || "vãng lai"} đặt ${o.service?.serviceName || o.productName || "dịch vụ"}`,
        isCompleted,
        link: `/admin/service-orders/${o.serviceOrderId}`,
      });
    });

    users.forEach((u) => {
      if (u.createdAt) {
        items.push({
          id: `user-${u.userId}`,
          timestamp: new Date(u.createdAt).getTime(),
          title: "Khách hàng mới đăng ký tài khoản",
          desc: `Tài khoản ${u.fullName || u.email} đã gia nhập hệ thống.`,
          isUser: true,
          link: `/admin/users/${u.userId}`,
        });
      }
    });

    items.sort((a, b) => b.timestamp - a.timestamp);
    return items.slice(0, 5);
  }, [orders, users]);

  // Export Real Dashboard Summary to Excel
  const handleExportDashboard = useCallback(() => {
    const exportData = orders.map((o) => ({
      "Mã đơn": `ORD-${o.serviceOrderId}`,
      "Khách hàng": o.user?.fullName || "Khách vãng lai",
      "Số điện thoại": o.user?.phone || "---",
      "Email": o.user?.email || "---",
      "Dịch vụ": o.service?.serviceName || "---",
      "Sản phẩm / Mẫu": o.productName || "---",
      "Ngày tạo": formatDate(o.createdAt, true),
      "Tổng tiền": formatPrice(o.totalPrice),
      "Trạng thái": getStatusInfo(o).label,
    }));

    const success = exportToExcel(
      exportData,
      `Bao_Cao_Dashboard_Don_Hang_${new Date().toISOString().slice(0, 10)}`,
      "ServiceOrders",
    );

    if (success) {
      showNotification({
        type: "success",
        title: "Xuất dữ liệu thành công",
        message: "Tệp Excel báo cáo số liệu đơn hàng đã được tải về máy của bạn.",
      });
    }
  }, [orders, showNotification]);

  return {
    loading,
    refreshing,
    period,
    setPeriod,
    orders,
    users,
    services,
    filteredOrders,
    stats,
    revenueChartOptions,
    revenueChartSeries,
    statusDonutOptions,
    statusDonutSeries,
    topServices,
    activities,
    handleManualRefresh,
    handleExportDashboard,
  };
};

export default useAdminDashboard;
