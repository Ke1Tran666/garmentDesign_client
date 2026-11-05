import { CheckSquare, Eye, Package, Square, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import EmptyState from "@/shared/ui/empty-state/EmptyState";
import Pagination from "@/shared/ui/table/Pagination";
import {
  formatDate,
  formatMeterCount,
  formatPrice,
  getOrderUnitLabel,
  getStatusInfo,
  isPrintService,
  PAGE_SIZE,
} from "../lib/serviceOrderUtils";

const ServiceOrderTableView = ({
  orders = [],
  totalCount = 0,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onSelectOrder,
  onRemoveOrder,
  selectedIds = new Set(),
  onToggleSelectItem,
  isAllCurrentSelected = false,
  onToggleSelectAll,
  onResetFilters,
}) => {
  if (orders.length === 0) {
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

  const startRecord = (currentPage - 1) * PAGE_SIZE + 1;
  const endRecord = Math.min(currentPage * PAGE_SIZE, totalCount);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full min-w-240 text-left">
          <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold tracking-wider text-slate-500 uppercase dark:border-slate-800 dark:bg-slate-800/40">
            <tr>
              {onToggleSelectAll && (
                <th className="w-10 px-4 py-3.5">
                  <button
                    type="button"
                    onClick={onToggleSelectAll}
                    className="flex cursor-pointer items-center text-slate-400 hover:text-brand"
                    title={
                      isAllCurrentSelected
                        ? "Bỏ chọn tất cả"
                        : "Chọn tất cả trang này"
                    }
                  >
                    {isAllCurrentSelected ? (
                      <CheckSquare size={16} className="text-brand" />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>
                </th>
              )}
              <th className="px-5 py-3.5">Mã đơn & Mẫu</th>
              <th className="px-4 py-3.5">Khách hàng</th>
              <th className="px-4 py-3.5">Dịch vụ</th>
              <th className="px-4 py-3.5">Tổng tiền</th>
              <th className="px-4 py-3.5">Ngày tạo</th>
              <th className="px-4 py-3.5">Trạng thái</th>
              <th className="px-4 py-3.5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
            {orders.map((order) => {
              const statusInfo = getStatusInfo(order);
              const isSelected = selectedIds.has(order.serviceOrderId);

              return (
                <tr
                  key={order.serviceOrderId}
                  className={`transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/50 ${
                    isSelected ? "bg-brand/5 dark:bg-brand/10" : ""
                  }`}
                >
                  {onToggleSelectItem && (
                    <td className="w-10 px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => onToggleSelectItem(order.serviceOrderId)}
                        className="flex cursor-pointer items-center text-slate-400 hover:text-brand"
                      >
                        {isSelected ? (
                          <CheckSquare size={16} className="text-brand" />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                    </td>
                  )}
                  <td className="px-5 py-3.5">
                    <Link
                      to={`/admin/service-orders/${order.serviceOrderId}`}
                      className="group block cursor-pointer text-left"
                    >
                      <div className="font-mono text-xs font-bold text-brand group-hover:underline">
                        ORD-{order.serviceOrderId}
                      </div>
                      <div className="max-w-50 truncate text-[11px] font-medium text-slate-700 transition-colors group-hover:text-brand dark:text-slate-300">
                        {order.productName || "Mẫu chưa đặt tên"}
                      </div>
                    </Link>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="truncate font-bold text-slate-900 dark:text-white">
                      {order.user?.fullName || "Khách hàng"}
                    </div>
                    <div className="truncate text-[11px] text-slate-400">
                      {order.user?.phone || order.user?.userCode || "---"}
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="font-medium text-slate-800 dark:text-slate-200">
                      {order.service?.serviceName || "Dịch vụ may mặc"}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      <span>
                        {order.quantity || 1} {getOrderUnitLabel(order)}
                      </span>
                      {isPrintService(order) && order.meterCount ? (
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {" "}• {formatMeterCount(order.meterCount)}m
                        </span>
                      ) : null}
                    </div>
                  </td>

                  <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                    {formatPrice(order.totalPrice)}
                  </td>

                  <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">
                    {formatDate(order.createdAt)}
                  </td>

                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusInfo.className}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${statusInfo.dot}`}
                      />
                      {statusInfo.label}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onSelectOrder?.(order)}
                        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-brand dark:hover:bg-slate-800"
                        title="Xem chi tiết đơn"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveOrder?.(order)}
                        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                        title="Xóa đơn hàng"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination bar */}
      {totalCount > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row dark:border-slate-800">
          <span className="text-xs text-slate-500">
            Hiển thị {startRecord} - {endRecord} trên tổng số{" "}
            <strong className="text-slate-800 dark:text-white">
              {totalCount}
            </strong>
          </span>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default ServiceOrderTableView;
