import { CheckCircle2, Layers, SlidersHorizontal, Tag } from "lucide-react";
import StatCard from "@/shared/ui/stats/StatCard";
import { formatPrice } from "../lib/serviceUtils";

const ServiceStatsCards = ({ stats, onFilterStatus }) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {/* Card 1: Total */}
      <StatCard
        title="Tổng số dịch vụ"
        value={stats.total}
        subtitle="mục đang quản lý"
        icon={Layers}
        iconColorClass="bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
        onClick={() => onFilterStatus?.("all")}
      />

      {/* Card 2: Active */}
      <StatCard
        title="Đang cung cấp"
        value={stats.activeCount}
        badge={
          <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:bg-emerald-950/50">
            {stats.activeRate ?? 0}% hoạt động
          </span>
        }
        icon={CheckCircle2}
        iconColorClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
        hoverBorderClass="hover:border-emerald-300"
        onClick={() => onFilterStatus?.("active")}
      />

      {/* Card 3: Inactive */}
      <StatCard
        title="Tạm ngừng"
        value={stats.inactiveCount}
        subtitle="tạm ẩn trên sàn"
        icon={SlidersHorizontal}
        iconColorClass="bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
        hoverBorderClass="hover:border-amber-300"
        onClick={() => onFilterStatus?.("inactive")}
      />

      {/* Card 4: Avg Price */}
      <StatCard
        title="Đơn giá trung bình"
        value={formatPrice(stats.avgPrice)}
        subtitle="mức giá tham chiếu"
        icon={Tag}
        iconColorClass="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
      />
    </div>
  );
};

export default ServiceStatsCards;
