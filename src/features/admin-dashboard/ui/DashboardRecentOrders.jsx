import { Eye, Package } from "lucide-react";
import { Link } from "react-router-dom";
import {
  formatDate,
  formatPrice,
  getStatusInfo,
} from "@/features/service-order-management";
import EmptyState from "@/shared/ui/empty-state/EmptyState";

export const DashboardRecentOrders = ({ orders = [], maxDisplay = 6 }) => {
  const visibleOrders = orders.slice(0, maxDisplay);

  return (
    <div className="h-fit overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs lg:col-span-2 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <div>
          <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
            Đơn dịch vụ gần đây
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Các đơn thiết kế rập và in sơ đồ may mẫu thực tế trên hệ thống
          </p>
        </div>
        <Link
          to="/admin/service-orders"
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand-hover"
        >
          Xem tất cả đơn &rarr;
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="p-8">
          <EmptyState
            icon={Package}
            title="Chưa có đơn dịch vụ nào"
            description="Khi có khách hàng đặt dịch vụ thiết kế rập hoặc in sơ đồ, đơn hàng sẽ hiển thị ở đây."
          />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-185 text-left">
              <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold tracking-wider text-slate-500 uppercase dark:border-slate-800 dark:bg-slate-800/40">
                <tr>
                  <th className="px-4 py-3 whitespace-nowrap sm:px-5">Mã đơn</th>
                  <th className="px-4 py-3 whitespace-nowrap sm:px-5">Khách hàng</th>
                  <th className="px-4 py-3 whitespace-nowrap sm:px-5">Dịch vụ</th>
                  <th className="px-4 py-3 whitespace-nowrap sm:px-5">Ngày tạo</th>
                  <th className="px-4 py-3 whitespace-nowrap sm:px-5">Tổng tiền</th>
                  <th className="px-4 py-3 whitespace-nowrap sm:px-5">Trạng thái</th>
                  <th className="px-4 py-3 text-right whitespace-nowrap sm:px-5">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
                {visibleOrders.map((order) => {
                  const statusInfo = getStatusInfo(order);
                  return (
                    <tr
                      key={order.serviceOrderId}
                      className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/50"
                    >
                      <td className="px-4 py-3.5 font-bold text-brand whitespace-nowrap sm:px-5">
                        <Link
                          to={`/admin/service-orders/${order.serviceOrderId}`}
                          className="hover:underline"
                        >
                          ORD-{order.serviceOrderId}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap sm:px-5">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {order.user?.fullName || "Khách vãng lai"}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {order.user?.phone || order.user?.email || "---"}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 sm:px-5">
                        <div className="font-medium text-slate-700 whitespace-nowrap dark:text-slate-300">
                          {order.service?.serviceName || "Dịch vụ may mặc"}
                        </div>
                        {order.productName && (
                          <div className="text-[11px] text-slate-400 whitespace-nowrap">
                            {order.productName}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap sm:px-5 dark:text-slate-400">
                        {formatDate(order.createdAt, false)}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-900 whitespace-nowrap sm:px-5 dark:text-white">
                        {formatPrice(order.totalPrice)}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap sm:px-5">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${statusInfo.className}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap sm:px-5">
                        <Link
                          to={`/admin/service-orders/${order.serviceOrderId}`}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-brand dark:hover:bg-slate-800"
                          title="Xem chi tiết đơn"
                        >
                          <Eye size={15} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-5 py-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-800/30 dark:text-slate-400">
            <span>
              Hiển thị {Math.min(maxDisplay, orders.length)} / {orders.length} đơn hàng mới nhất
            </span>
            <Link
              to="/admin/service-orders"
              className="font-semibold text-brand hover:underline"
            >
              Quản lý toàn bộ đơn hàng &rarr;
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardRecentOrders;
