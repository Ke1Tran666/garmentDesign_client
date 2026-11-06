import { formatPrice } from "@/features/service-order-management";

export const DashboardTopServices = ({ services = [] }) => {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-1 font-heading text-base font-bold text-slate-900 dark:text-white">
        Top Dịch vụ thịnh hành
      </h3>
      <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
        Xếp hạng theo khối lượng đơn đặt hàng thực tế
      </p>

      {services.length === 0 ? (
        <p className="py-4 text-center text-xs text-slate-400">
          Chưa có dữ liệu dịch vụ
        </p>
      ) : (
        <div className="space-y-3.5">
          {services.map((srv) => (
            <div key={srv.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {srv.name}
                </span>
                <span className="font-bold text-brand">{srv.count} đơn</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-linear-to-r from-brand to-sky-400 transition-all duration-500"
                  style={{ width: `${srv.percent}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Doanh thu: {formatPrice(srv.revenue)}</span>
                <span>Tỷ trọng: {srv.percent}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardTopServices;
