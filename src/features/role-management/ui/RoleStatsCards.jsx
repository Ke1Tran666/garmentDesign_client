import { KeyRound, ShieldCheck, ShieldPlus, Users } from "lucide-react";

import StatCard from "@/shared/ui/stats/StatCard";

const ACTIVE_RING = "border-brand/70 ring-2 ring-brand/15";

const RoleStatsCards = ({
  stats,
  typeFilter = "all",
  usageFilter = "all",
  onQuickFilter,
}) => {
  if (!stats) return null;

  const isAllActive = typeFilter === "all" && usageFilter === "all";
  const isSystemActive = typeFilter === "system" && usageFilter === "all";
  const isCustomActive = typeFilter === "custom" && usageFilter === "all";
  const isAssignedActive = typeFilter === "all" && usageFilter === "assigned";

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard
        title="Tổng vai trò"
        value={stats.total}
        subtitle={`${stats.unusedCount} vai trò chưa gán user`}
        icon={ShieldCheck}
        iconColorClass="bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
        className={isAllActive ? ACTIVE_RING : ""}
        onClick={() => onQuickFilter?.({ type: "all", usage: "all" })}
      />

      <StatCard
        title="Vai trò hệ thống"
        value={stats.systemCount}
        subtitle="3 vai trò mặc định hệ thống"
        icon={KeyRound}
        iconColorClass="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
        hoverBorderClass="hover:border-indigo-300"
        className={
          isSystemActive ? "border-indigo-500 ring-2 ring-indigo-500/15" : ""
        }
        onClick={() =>
          onQuickFilter?.(
            isSystemActive
              ? { type: "all", usage: "all" }
              : { type: "system", usage: "all" },
          )
        }
      />

      <StatCard
        title="Vai trò tùy chỉnh"
        value={stats.customCount}
        subtitle="mở rộng theo nhu cầu vận hành"
        icon={ShieldPlus}
        iconColorClass="bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400"
        hoverBorderClass="hover:border-violet-300"
        className={
          isCustomActive ? "border-violet-500 ring-2 ring-violet-500/15" : ""
        }
        onClick={() =>
          onQuickFilter?.(
            isCustomActive
              ? { type: "all", usage: "all" }
              : { type: "custom", usage: "all" },
          )
        }
      />

      <StatCard
        title="Tài khoản đã gán"
        value={stats.totalAssignedUsers}
        subtitle={`${stats.totalActiveUsers} tài khoản đang hoạt động`}
        icon={Users}
        iconColorClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
        hoverBorderClass="hover:border-emerald-300"
        className={
          isAssignedActive
            ? "border-emerald-500 ring-2 ring-emerald-500/15"
            : ""
        }
        onClick={() =>
          onQuickFilter?.(
            isAssignedActive
              ? { type: "all", usage: "all" }
              : { type: "all", usage: "assigned" },
          )
        }
      />
    </div>
  );
};

export default RoleStatsCards;
