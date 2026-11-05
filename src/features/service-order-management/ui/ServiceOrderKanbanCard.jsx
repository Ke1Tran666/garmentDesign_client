import { ArrowRight, CheckCircle2, Printer } from "lucide-react";
import {
  formatDate,
  formatMeterCount,
  formatPrice,
  getOrderUnitLabel,
  isPrintService,
} from "../lib/serviceOrderUtils";

const ServiceOrderKanbanCard = ({
  order,
  columnId,
  onSelectOrder,
  onQuickAdvanceStatus,
}) => {
  const isPrint = isPrintService(order);
  const unitLabel = getOrderUnitLabel(order);

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
        <div className="mt-0.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span className="truncate">{order.service?.serviceName || "Dịch vụ"}</span>
          <span className="shrink-0 font-medium text-slate-600 dark:text-slate-300">
            {order.quantity || 1} {unitLabel}
            {isPrint && order.meterCount
              ? ` (${formatMeterCount(order.meterCount)}m)`
              : ""}
          </span>
        </div>
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
          className={`mt-1 flex w-full cursor-pointer items-center justify-center gap-1 rounded-lg py-1 text-[11px] font-semibold transition-colors ${
            isPrint
              ? "bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white dark:bg-amber-950/40 dark:text-amber-400 dark:hover:bg-amber-600 dark:hover:text-white"
              : "bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-600 dark:hover:text-white"
          }`}
        >
          {isPrint ? (
            <>
              <span>Nhập số mét & Hoàn tất</span>
              <Printer size={12} />
            </>
          ) : (
            <>
              <span>Hoàn tất nghiệm thu</span>
              <CheckCircle2 size={12} />
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default ServiceOrderKanbanCard;
