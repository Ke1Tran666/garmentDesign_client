import { ArrowRight, CheckCircle2 } from "lucide-react";
import { formatDate, formatPrice } from "../lib/serviceOrderUtils";

const ServiceOrderKanbanCard = ({
  order,
  columnId,
  onSelectOrder,
  onQuickAdvanceStatus,
}) => {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelectOrder?.(order)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelectOrder?.(order);
        }
      }}
      className="group cursor-pointer space-y-2.5 rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] font-bold text-brand">
          ORD-{order.serviceOrderId}
        </span>
        <span className="text-[10px] text-slate-400">
          {formatDate(order.createdAt).split(" ")[0]}
        </span>
      </div>

      <div>
        <h4 className="line-clamp-1 text-xs font-bold text-slate-900 transition-colors group-hover:text-brand dark:text-white">
          {order.productName || "Sản phẩm may mặc"}
        </h4>
        <p className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-slate-400">
          {order.service?.serviceName || "Dịch vụ rập"}
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-xs dark:border-slate-800">
        <span className="max-w-28 truncate text-[11px] text-slate-500 dark:text-slate-400">
          {order.user?.fullName || "Khách hàng"}
        </span>
        <span className="font-bold text-slate-900 dark:text-white">
          {formatPrice(order.totalPrice)}
        </span>
      </div>

      {/* Quick Kanban Action button */}
      {columnId === "pending" && onQuickAdvanceStatus && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onQuickAdvanceStatus(order, "active");
          }}
          className="mt-1 flex w-full cursor-pointer items-center justify-center gap-1 rounded-lg bg-blue-50 py-1 text-[11px] font-semibold text-brand transition-colors hover:bg-brand hover:text-white dark:bg-blue-950/40 dark:text-blue-400 dark:hover:bg-brand dark:hover:text-white"
        >
          <span>Tiếp nhận & Xử lý</span>
          <ArrowRight size={12} />
        </button>
      )}

      {columnId === "active" && onQuickAdvanceStatus && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onQuickAdvanceStatus(order, "completed");
          }}
          className="mt-1 flex w-full cursor-pointer items-center justify-center gap-1 rounded-lg bg-emerald-50 py-1 text-[11px] font-semibold text-emerald-600 transition-colors hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-600 dark:hover:text-white"
        >
          <span>Hoàn tất nghiệm thu</span>
          <CheckCircle2 size={12} />
        </button>
      )}
    </div>
  );
};

export default ServiceOrderKanbanCard;
