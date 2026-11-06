import { CheckCircle2, ShoppingBag, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDate } from "@/features/service-order-management";

const formatRelativeTime = (timestamp) => {
  if (!timestamp) return "Vừa xong";
  const diffMs = Date.now() - timestamp;
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));
  if (diffSec < 60) return "Vừa xong";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  const diffDays = Math.floor(diffHour / 24);
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return formatDate(new Date(timestamp), false);
};

export const DashboardActivityFeed = ({ activities = [] }) => {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-1 font-heading text-base font-bold text-slate-900 dark:text-white">
        Nhật ký hoạt động gần đây
      </h3>
      <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
        Sự kiện đơn hàng và tài khoản từ Backend
      </p>

      {activities.length === 0 ? (
        <p className="py-4 text-center text-xs text-slate-400">
          Chưa có hoạt động nào được ghi nhận
        </p>
      ) : (
        <div className="space-y-4">
          {activities.map((act) => {
            const Icon = act.isCompleted
              ? CheckCircle2
              : act.isUser
                ? Users
                : ShoppingBag;
            const colorClass = act.isCompleted
              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
              : act.isUser
                ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
                : "bg-sky-50 text-brand dark:bg-sky-950/50 dark:text-sky-400";

            return (
              <div key={act.id} className="flex gap-3">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${colorClass}`}
                >
                  <Icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  {act.link ? (
                    <Link
                      to={act.link}
                      className="text-xs leading-tight font-semibold text-slate-800 hover:text-brand hover:underline dark:text-slate-200 dark:hover:text-brand"
                    >
                      {act.title}
                    </Link>
                  ) : (
                    <p className="text-xs leading-tight font-semibold text-slate-800 dark:text-slate-200">
                      {act.title}
                    </p>
                  )}
                  <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-500 dark:text-slate-400">
                    {act.desc}
                  </p>
                  <span className="mt-1 block text-[10px] text-slate-400">
                    {formatRelativeTime(act.timestamp)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DashboardActivityFeed;
