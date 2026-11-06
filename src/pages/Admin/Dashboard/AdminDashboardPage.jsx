import {
  AdminDashboardHeader,
  AdminDashboardStatsCards,
  DashboardActivityFeed,
  DashboardQuickActions,
  DashboardRecentOrders,
  DashboardRevenueChart,
  DashboardStatusChart,
  DashboardTopServices,
  useAdminDashboard,
} from "@/features/admin-dashboard";
import { DashboardSkeleton } from "@/shared/ui/skeleton";

const AdminDashboardPage = () => {
  const {
    loading,
    refreshing,
    period,
    setPeriod,
    orders,
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
  } = useAdminDashboard();

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="animate-in space-y-6 duration-200 fade-in">
      {/* 1. Page Header & Controls */}
      <AdminDashboardHeader
        period={period}
        onPeriodChange={setPeriod}
        onRefresh={handleManualRefresh}
        onExport={handleExportDashboard}
        refreshing={refreshing}
      />

      {/* 2. Key Performance Indicators (5 Stats Cards) */}
      <AdminDashboardStatsCards stats={stats} />

      {/* 3. Charts Section: Spline Area Chart & Donut Chart */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <DashboardRevenueChart
          options={revenueChartOptions}
          series={revenueChartSeries}
        />
        <DashboardStatusChart
          options={statusDonutOptions}
          series={statusDonutSeries}
          hasOrders={filteredOrders.length > 0}
        />
      </div>

      {/* 4. Shortcut Quick Actions */}
      <DashboardQuickActions />

      {/* 5. Recent Orders Table & Sidebar (Top Services + Live Activity Feed) */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <DashboardRecentOrders orders={orders} />
        <div className="space-y-6">
          <DashboardTopServices services={topServices} />
          <DashboardActivityFeed activities={activities} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
