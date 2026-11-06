import { Link } from "react-router-dom";
import Chart from "react-apexcharts";

export const DashboardStatusChart = ({
  options,
  series,
  hasOrders = true,
}) => {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6 dark:border-slate-800 dark:bg-slate-900">
      <div>
        <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
          Trạng thái đơn hàng
        </h3>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Tỷ lệ phân bổ trạng thái các đơn dịch vụ trên hệ thống.
        </p>
      </div>

      <div className="my-auto py-4">
        {hasOrders && options && series ? (
          <Chart options={options} series={series} type="donut" height={260} />
        ) : (
          <div className="py-12 text-center text-xs text-slate-400">
            Chưa có đơn hàng nào trong khoảng thời gian này
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 pt-3 text-center dark:border-slate-800">
        <Link
          to="/admin/service-orders"
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
        >
          Xem chi tiết tiến trình tại Kanban &rarr;
        </Link>
      </div>
    </div>
  );
};

export default DashboardStatusChart;
