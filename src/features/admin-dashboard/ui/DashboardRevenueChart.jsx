import Chart from "react-apexcharts";

export const DashboardRevenueChart = ({ options, series }) => {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6 lg:col-span-2 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
              Biểu đồ Doanh thu & Đơn dịch vụ
            </h3>
            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:bg-emerald-950/40">
              Dữ liệu thực tế
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Thống kê doanh số hoàn tất và số lượng đơn hàng qua các tháng trong năm.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-medium text-slate-600 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-brand" /> Doanh thu (triệu đ)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Số đơn hàng
          </span>
        </div>
      </div>

      <div className="h-80 w-full">
        {options && series ? (
          <Chart options={options} series={series} type="area" height="100%" />
        ) : null}
      </div>
    </div>
  );
};

export default DashboardRevenueChart;
