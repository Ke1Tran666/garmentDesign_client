import { ShieldAlert, ShieldCheck, UserCheck, Users } from "lucide-react";
import StatCard from "@/shared/ui/stats/StatCard";

const ACTIVE_RING = "border-brand/70 ring-2 ring-brand/15";

const UserStatsCards = ({
  stats,
  roleFilter = "all",
  statusFilter = "all",
  onQuickFilter,
}) => {
  if (!stats) return null;

  const isAllActive = roleFilter === "all" && statusFilter === "all";
  const isCustomerActive = roleFilter === "user" && statusFilter === "all";
  const isStaffActive = roleFilter === "internal" && statusFilter === "all";
  const isDisabledActive = roleFilter === "all" && statusFilter === "disabled";

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard
        title="Tổng người dùng"
        value={stats.total}
        subtitle={`${stats.activeCount} đang hoạt động`}
        icon={Users}
        iconColorClass="bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
        className={isAllActive ? ACTIVE_RING : ""}
        onClick={() => onQuickFilter?.({ role: "all", status: "all" })}
      />

      <StatCard
        title="Khách hàng"
        value={stats.customerCount}
        badge={
          <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:bg-emerald-950/50">
            {stats.customerRate}%
          </span>
        }
        subtitle="tài khoản mua & đặt dịch vụ"
        icon={UserCheck}
        iconColorClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
        hoverBorderClass="hover:border-emerald-300"
        className={
          isCustomerActive
            ? "border-emerald-500 ring-2 ring-emerald-500/15"
            : ""
        }
        onClick={() =>
          onQuickFilter?.(
            isCustomerActive
              ? { role: "all", status: "all" }
              : { role: "user", status: "all" },
          )
        }
      />

      <StatCard
        title="Quản trị & Nhân viên"
        value={stats.staffCount}
        subtitle="nhân sự vận hành hệ thống"
        icon={ShieldCheck}
        iconColorClass="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
        hoverBorderClass="hover:border-indigo-300"
        className={
          isStaffActive ? "border-indigo-500 ring-2 ring-indigo-500/15" : ""
        }
        onClick={() =>
          onQuickFilter?.(
            isStaffActive
              ? { role: "all", status: "all" }
              : { role: "internal", status: "all" },
          )
        }
      />

      <StatCard
        title="Khóa & Đã xóa"
        value={stats.disabledCount}
        subtitle={`${stats.lockedCount} khóa · ${stats.deletedCount} đã xóa`}
        icon={ShieldAlert}
        iconColorClass="bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400"
        hoverBorderClass="hover:border-rose-300"
        className={
          isDisabledActive ? "border-rose-500 ring-2 ring-rose-500/15" : ""
        }
        onClick={() =>
          onQuickFilter?.(
            isDisabledActive
              ? { role: "all", status: "all" }
              : { role: "all", status: "disabled" },
          )
        }
      />
    </div>
  );
};

export default UserStatsCards;
