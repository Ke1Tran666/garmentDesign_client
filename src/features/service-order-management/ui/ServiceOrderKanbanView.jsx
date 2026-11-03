import { Package } from "lucide-react";
import EmptyState from "@/shared/ui/empty-state/EmptyState";
import ServiceOrderKanbanCard from "./ServiceOrderKanbanCard";

const ServiceOrderKanbanView = ({
  columns = [],
  totalCount = 0,
  onSelectOrder,
  onQuickAdvanceStatus,
  onResetFilters,
}) => {
  if (totalCount === 0) {
    return (
      <EmptyState
        icon={Package}
        title="Không tìm thấy đơn hàng nào phù hợp"
        description="Thử thay đổi từ khóa tìm kiếm hoặc lọc theo trạng thái khác."
        actionText="Đặt lại bộ lọc"
        onAction={onResetFilters}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-4">
      {columns.map((col) => (
        <div
          key={col.id}
          className="flex min-h-120 flex-col gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-900/60"
        >
          {/* Column Header */}
          <div className="flex items-center justify-between border-b border-slate-200/60 px-1 pb-2 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${col.color}`} />
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {col.title}
              </span>
            </div>
            <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-slate-600 shadow-2xs dark:bg-slate-800 dark:text-slate-300">
              {col.orders?.length || 0}
            </span>
          </div>

          {/* Cards List */}
          <div className="flex-1 space-y-3 overflow-y-auto">
            {!col.orders || col.orders.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Không có đơn trong bước này
              </div>
            ) : (
              col.orders.map((order) => (
                <ServiceOrderKanbanCard
                  key={order.serviceOrderId}
                  order={order}
                  columnId={col.id}
                  onSelectOrder={onSelectOrder}
                  onQuickAdvanceStatus={onQuickAdvanceStatus}
                />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ServiceOrderKanbanView;
