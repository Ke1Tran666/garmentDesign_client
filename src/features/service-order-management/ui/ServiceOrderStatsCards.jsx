import {
  CheckCircle2,
  Clock3,
  Package,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import StatCard from "@/shared/ui/stats/StatCard";
import { formatPrice } from "../lib/serviceOrderUtils";

const ServiceOrderStatsCards = ({ stats, onFilterStatus }) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
      {/* Total Orders */}
      <StatCard
        title="Tổng số đơn"
        value={stats.total}
        subtitle="đơn hàng ghi nhận"
        icon={ShoppingBag}
        iconColorClass="bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
        onClick={() => onFilterStatus?.("all")}
      />

      {/* Pending Orders */}
      <StatCard
        title="Chờ tiếp nhận"
        value={stats.pendingCount}
        subtitle="cần phân công xử lý"
        icon={Clock3}
        iconColorClass="bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
        hoverBorderClass="hover:border-amber-300"
        onClick={() => onFilterStatus?.("pending")}
      />

      {/* Active Orders */}
      <StatCard
        title="Đang xử lý"
        value={stats.activeCount}
        subtitle="đang thiết kế & may mẫu"
        icon={Package}
        iconColorClass="bg-sky-50 text-brand dark:bg-sky-950/50 dark:text-sky-400"
        hoverBorderClass="hover:border-brand/40"
        onClick={() => onFilterStatus?.("active")}
      />

      {/* Completed Orders */}
      <StatCard
        title="Đơn hoàn tất"
        value={stats.completedCount}
        subtitle="nghiệm thu & bàn giao"
        icon={CheckCircle2}
        iconColorClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
        hoverBorderClass="hover:border-emerald-300"
        onClick={() => onFilterStatus?.("completed")}
      />

      {/* Total Revenue */}
      <StatCard
        title="Doanh thu từ đơn"
        value={formatPrice(stats.totalRevenue)}
        subtitle="tổng giá trị thực tế"
        icon={TrendingUp}
        iconColorClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
        className="col-span-2 lg:col-span-1"
      />
    </div>
  );
};

export default ServiceOrderStatsCards;
