import {
  CheckCircle2,
  Clock3,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "@/features/service-order-management";
import StatCard from "@/shared/ui/stats/StatCard";

export const AdminDashboardStatsCards = ({ stats }) => {
  const navigate = useNavigate();

  if (!stats) return null;

  return (
    <section className="grid grid-cols-2 gap-4 lg:grid-cols-5">
      {/* Card 1: Users */}
      <StatCard
        title="Tổng người dùng"
        value={stats.totalUsers}
        subtitle="khách hàng & tài khoản"
        icon={Users}
        iconColorClass="bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
        hoverBorderClass="hover:border-blue-300"
        onClick={() => navigate("/admin/users")}
      />

      {/* Card 2: Total Orders */}
      <StatCard
        title="Tổng số đơn"
        value={stats.totalOrders}
        subtitle="đơn dịch vụ ghi nhận"
        icon={ShoppingBag}
        iconColorClass="bg-sky-50 text-brand dark:bg-sky-950/50 dark:text-sky-400"
        hoverBorderClass="hover:border-sky-300"
        onClick={() => navigate("/admin/service-orders")}
      />

      {/* Card 3: In Progress (Pending + Active) */}
      <StatCard
        title="Đang xử lý"
        value={stats.activeCount + stats.pendingCount}
        subtitle={`${stats.pendingCount} chờ duyệt, ${stats.activeCount} đang làm`}
        icon={Clock3}
        iconColorClass="bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
        hoverBorderClass="hover:border-amber-300"
        onClick={() => navigate("/admin/service-orders")}
      />

      {/* Card 4: Completed Orders */}
      <StatCard
        title="Đơn hoàn tất"
        value={stats.completedCount}
        subtitle="đã nghiệm thu & bàn giao"
        icon={CheckCircle2}
        iconColorClass="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
        hoverBorderClass="hover:border-indigo-300"
        onClick={() => navigate("/admin/service-orders")}
      />

      {/* Card 5: Total Revenue */}
      <StatCard
        title="Doanh thu từ đơn"
        value={formatPrice(stats.totalRevenue)}
        subtitle="tổng giá trị thực tế"
        icon={TrendingUp}
        iconColorClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
        hoverBorderClass="hover:border-emerald-300"
        className="col-span-2 lg:col-span-1"
      />
    </section>
  );
};

export default AdminDashboardStatsCards;
