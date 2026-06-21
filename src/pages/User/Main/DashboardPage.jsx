import {
  BarChart3,
  CheckCircle2,
  Clock,
  FileText,
  MoreVertical,
  PackageCheck,
  Search,
} from "lucide-react";

const fileStats = [
  { label: "Thiết kế", value: 45, color: "#8b5cf6" },
  { label: "Ảnh mẫu", value: 30, color: "#38bdf8" },
  { label: "File in", value: 25, color: "#14b8a6" },
];

const monthlyOrders = [
  { month: "Jan", orders: 18 },
  { month: "Feb", orders: 24 },
  { month: "Mar", orders: 36 },
  { month: "Apr", orders: 28 },
  { month: "May", orders: 45 },
  { month: "Jun", orders: 32 },
  { month: "Jul", orders: 40 },
  { month: "Aug", orders: 52 },
  { month: "Sep", orders: 38 },
  { month: "Oct", orders: 48 },
  { month: "Nov", orders: 34 },
  { month: "Dec", orders: 42 },
];

const orderTasks = [
  {
    id: "ORD-001",
    customer: "Justin Vetrovs",
    service: "Thiết kế mẫu áo",
    deadline: "20 Sep 2024",
    status: "Đang xử lý",
    progress: 65,
  },
  {
    id: "ORD-002",
    customer: "Ahmad Kenter",
    service: "Tăng size rập",
    deadline: "22 Sep 2024",
    status: "Chờ duyệt",
    progress: 35,
  },
  {
    id: "ORD-003",
    customer: "Marcus George",
    service: "Xuất file in",
    deadline: "25 Sep 2024",
    status: "Hoàn thành",
    progress: 100,
  },
];

const DashboardPage = () => {
  const totalFiles = fileStats.reduce((sum, item) => sum + item.value, 0);
  const maxOrder = Math.max(...monthlyOrders.map((item) => item.orders));

  return (
    <div className="min-h-screen">
      <div className="mb-6 flex items-center justify-end">
        <button className="rounded-xl bg-brand! px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark!">
          Export Data
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-semibold text-gray-900">Tổng file</p>
            <FileText className="text-brand" size={22} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">{totalFiles}</h2>
          <p className="mt-1 text-sm text-gray-500">File đang quản lý</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-semibold text-gray-900">Đơn hàng tháng này</p>
            <PackageCheck className="text-brand" size={22} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">52</h2>
          <p className="mt-1 text-sm text-emerald-500">+12% so với tháng trước</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-semibold text-gray-900">Task hoàn thành</p>
            <CheckCircle2 className="text-brand" size={22} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">78%</h2>
          <p className="mt-1 text-sm text-gray-500">Tiến độ xử lý đơn hàng</p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Thống kê file</h2>
            <MoreVertical size={18} className="text-gray-400" />
          </div>

          <div className="flex items-center justify-center">
            <div
              className="flex h-44 w-44 items-center justify-center rounded-full"
              style={{
                background:
                  "conic-gradient(#8b5cf6 0% 45%, #38bdf8 45% 75%, #14b8a6 75% 100%)",
              }}
            >
              <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white">
                <span className="text-3xl font-bold text-gray-900">
                  {totalFiles}
                </span>
                <span className="text-sm text-gray-500">Files</span>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {fileStats.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600">{item.label}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">
                Thống kê đơn hàng theo tháng
              </h2>
              <p className="text-sm text-gray-500">Số lượng đơn hàng mỗi tháng</p>
            </div>
            <BarChart3 size={22} className="text-brand" />
          </div>

          <div className="flex h-72 items-end gap-4 border-b border-l border-gray-200 px-4 pb-4">
            {monthlyOrders.map((item) => (
              <div key={item.month} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-56 w-full items-end justify-center">
                  <div
                    className="w-full max-w-10 rounded-t-xl bg-brand"
                    style={{ height: `${(item.orders / maxOrder) * 100}%` }}
                    title={`${item.orders} đơn hàng`}
                  />
                </div>
                <span className="text-xs text-gray-500">{item.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="font-semibold text-gray-900">Task đơn hàng</h2>

          <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Tìm task..."
              className="outline-none text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-sm text-gray-500">
                <th className="px-4 py-3">Mã đơn</th>
                <th className="px-4 py-3">Khách hàng</th>
                <th className="px-4 py-3">Dịch vụ</th>
                <th className="px-4 py-3">Deadline</th>
                <th className="px-4 py-3">Tiến độ</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {orderTasks.map((task) => (
                <tr key={task.id} className="border-b border-gray-100 text-sm">
                  <td className="px-4 py-4 font-semibold text-gray-900">
                    {task.id}
                  </td>
                  <td className="px-4 py-4 text-gray-700">{task.customer}</td>
                  <td className="px-4 py-4 text-gray-700">{task.service}</td>
                  <td className="px-4 py-4 text-gray-700">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-gray-400" />
                      {task.deadline}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-2 w-32 rounded-full bg-gray-100">
                      <div
                        className="h-2 rounded-full bg-brand"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand">
                      {task.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <button className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;