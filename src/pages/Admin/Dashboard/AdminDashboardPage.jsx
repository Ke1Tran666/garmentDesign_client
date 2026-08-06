import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  PackageCheck,
  ShoppingBag,
  Users,
} from "lucide-react";

const DASHBOARD_STATS = [
  {
    label: "Tổng người dùng",
    value: "1.248",
    change: "+12,5%",
    trend: "up",
    description: "so với tháng trước",
    icon: Users,
    color: "bg-info-soft text-info",
  },
  {
    label: "Đơn dịch vụ",
    value: "386",
    change: "+8,2%",
    trend: "up",
    description: "so với tháng trước",
    icon: ShoppingBag,
    color: "bg-brand-soft text-brand",
  },
  {
    label: "Đang xử lý",
    value: "42",
    change: "-3,1%",
    trend: "down",
    description: "so với tuần trước",
    icon: Clock3,
    color: "bg-warning-soft text-warning",
  },
  {
    label: "Doanh thu",
    value: "128,6M",
    change: "+18,4%",
    trend: "up",
    description: "so với tháng trước",
    icon: CircleDollarSign,
    color: "bg-success-soft text-success",
  },
];

const MONTHLY_ORDERS = [
  { month: "T1", value: 38 },
  { month: "T2", value: 52 },
  { month: "T3", value: 45 },
  { month: "T4", value: 68 },
  { month: "T5", value: 61 },
  { month: "T6", value: 84 },
  { month: "T7", value: 73 },
  { month: "T8", value: 92 },
  { month: "T9", value: 78 },
  { month: "T10", value: 105 },
  { month: "T11", value: 96 },
  { month: "T12", value: 118 },
];

const RECENT_ORDERS = [
  {
    id: "ORD-1028",
    customer: "Nguyễn Minh Anh",
    service: "Thiết kế rập",
    date: "05/08/2026",
    amount: "2.500.000đ",
    status: "processing",
  },
  {
    id: "ORD-1027",
    customer: "Trần Ngọc Linh",
    service: "Nhảy size",
    date: "05/08/2026",
    amount: "1.800.000đ",
    status: "pending",
  },
  {
    id: "ORD-1026",
    customer: "Fashion Lab VN",
    service: "Thiết kế mẫu",
    date: "04/08/2026",
    amount: "5.200.000đ",
    status: "completed",
  },
  {
    id: "ORD-1025",
    customer: "Xưởng may ABC",
    service: "In sơ đồ",
    date: "04/08/2026",
    amount: "980.000đ",
    status: "completed",
  },
];

const ORDER_STATUS = {
  pending: {
    label: "Chờ tiếp nhận",
    className: "bg-warning-soft text-warning",
  },
  processing: {
    label: "Đang xử lý",
    className: "bg-info-soft text-info",
  },
  completed: {
    label: "Hoàn thành",
    className: "bg-success-soft text-success",
  },
};

const ACTIVITY_ITEMS = [
  {
    title: "Đơn hàng mới được tạo",
    description: "ORD-1028 · Nguyễn Minh Anh",
    time: "5 phút trước",
    icon: ShoppingBag,
    color: "bg-brand-soft text-brand",
  },
  {
    title: "Đơn hàng đã hoàn thành",
    description: "ORD-1026 · Fashion Lab VN",
    time: "32 phút trước",
    icon: CheckCircle2,
    color: "bg-success-soft text-success",
  },
  {
    title: "Có người dùng mới đăng ký",
    description: "hung.tran@example.com",
    time: "1 giờ trước",
    icon: Users,
    color: "bg-info-soft text-info",
  },
  {
    title: "Đơn hàng đang chờ xử lý",
    description: "ORD-1027 · Trần Ngọc Linh",
    time: "2 giờ trước",
    icon: Clock3,
    color: "bg-warning-soft text-warning",
  },
];

const AdminDashboardPage = () => {
  const maxOrderValue = Math.max(
    ...MONTHLY_ORDERS.map((item) => item.value),
  );

  return (
    <div className="space-y-6">
      {/* Heading */}
      <section
        className="
          flex flex-col justify-between gap-4
          sm:flex-row sm:items-end
        "
      >
        <div>
          <h2
            className="
              font-heading text-2xl
              font-bold text-text-strong
              sm:text-3xl
            "
          >
            Tổng quan hệ thống
          </h2>

          <p className="mt-2 text-sm text-text-muted">
            Theo dõi hoạt động và hiệu suất của hệ thống.
          </p>
        </div>

        <span
          className="
            self-start rounded-full
            border border-warning-border
            bg-warning-soft
            px-3 py-1.5
            text-xs font-semibold text-warning
            sm:self-auto
          "
        >
          Dữ liệu minh họa
        </span>
      </section>

      {/* Stats */}
      <section
        className="
          grid grid-cols-1 gap-4
          sm:grid-cols-2 xl:grid-cols-4
        "
      >
        {DASHBOARD_STATS.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon =
            stat.trend === "up"
              ? ArrowUpRight
              : ArrowDownRight;

          return (
            <article
              key={stat.label}
              className="
                rounded-2xl border
                border-border
                bg-surface p-5
                shadow-sm
              "
            >
              <div
                className="
                  flex items-start
                  justify-between gap-4
                "
              >
                <div>
                  <p className="text-sm text-text-muted">
                    {stat.label}
                  </p>

                  <p
                    className="
                      mt-2 font-heading
                      text-3xl font-bold
                      text-text-strong
                    "
                  >
                    {stat.value}
                  </p>
                </div>

                <span
                  className={`
                    flex h-11 w-11
                    items-center justify-center
                    rounded-xl
                    ${stat.color}
                  `}
                >
                  <Icon size={21} />
                </span>
              </div>

              <div
                className="
                  mt-4 flex items-center
                  gap-1.5 text-xs
                "
              >
                <span
                  className={`
                    inline-flex items-center
                    gap-0.5 font-semibold
                    ${
                      stat.trend === "up"
                        ? "text-success"
                        : "text-danger"
                    }
                  `}
                >
                  <TrendIcon size={14} />
                  {stat.change}
                </span>

                <span className="text-text-subtle">
                  {stat.description}
                </span>
              </div>
            </article>
          );
        })}
      </section>

      <section
        className="
          grid grid-cols-1 gap-6
          xl:grid-cols-3
        "
      >
        {/* Chart */}
        <article
          className="
            rounded-2xl border
            border-border bg-surface
            p-5 shadow-sm
            xl:col-span-2
          "
        >
          <div
            className="
              flex items-start
              justify-between gap-4
            "
          >
            <div>
              <h3
                className="
                  font-heading text-lg
                  font-semibold text-text-strong
                "
              >
                Đơn dịch vụ theo tháng
              </h3>

              <p className="mt-1 text-sm text-text-muted">
                Số lượng đơn trong năm 2026
              </p>
            </div>

            <span
              className="
                flex h-10 w-10
                items-center justify-center
                rounded-xl bg-brand-soft
                text-brand
              "
            >
              <PackageCheck size={20} />
            </span>
          </div>

          <div
            className="
              mt-8 flex h-64
              items-end gap-2
              overflow-x-auto pb-1
              sm:gap-3
            "
          >
            {MONTHLY_ORDERS.map((item) => {
              const height =
                (item.value / maxOrderValue) * 100;

              return (
                <div
                  key={item.month}
                  className="
                    flex h-full min-w-8
                    flex-1 flex-col
                    items-center justify-end
                    gap-2
                  "
                >
                  <span
                    className="
                      text-[11px] font-semibold
                      text-text-muted
                    "
                  >
                    {item.value}
                  </span>

                  <div
                    className="
                      relative flex h-48
                      w-full items-end
                      overflow-hidden
                      rounded-lg
                      bg-surface-muted
                    "
                  >
                    <div
                      className="
                        w-full rounded-lg
                        bg-linear-to-t
                        from-brand
                        to-indigo-400
                        transition-all
                        hover:opacity-80
                      "
                      style={{
                        height: `${height}%`,
                      }}
                    />
                  </div>

                  <span
                    className="
                      text-[11px]
                      text-text-subtle
                    "
                  >
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        </article>

        {/* Activity */}
        <article
          className="
            rounded-2xl border
            border-border bg-surface
            p-5 shadow-sm
          "
        >
          <h3
            className="
              font-heading text-lg
              font-semibold text-text-strong
            "
          >
            Hoạt động gần đây
          </h3>

          <div className="mt-5 space-y-5">
            {ACTIVITY_ITEMS.map((activity) => {
              const Icon = activity.icon;

              return (
                <div
                  key={`${activity.title}-${activity.time}`}
                  className="flex gap-3"
                >
                  <span
                    className={`
                      flex h-10 w-10
                      shrink-0 items-center
                      justify-center rounded-xl
                      ${activity.color}
                    `}
                  >
                    <Icon size={18} />
                  </span>

                  <div className="min-w-0">
                    <p
                      className="
                        truncate text-sm
                        font-semibold
                        text-text-default
                      "
                    >
                      {activity.title}
                    </p>

                    <p
                      className="
                        mt-0.5 truncate
                        text-xs text-text-muted
                      "
                    >
                      {activity.description}
                    </p>

                    <p
                      className="
                        mt-1 text-[11px]
                        text-text-subtle
                      "
                    >
                      {activity.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      {/* Recent orders */}
      <section
        className="
          overflow-hidden rounded-2xl
          border border-border
          bg-surface shadow-sm
        "
      >
        <div
          className="
            flex items-center
            justify-between gap-4
            border-b border-border
            px-5 py-4
          "
        >
          <div>
            <h3
              className="
                font-heading text-lg
                font-semibold text-text-strong
              "
            >
              Đơn dịch vụ gần đây
            </h3>

            <p className="mt-1 text-sm text-text-muted">
              Các đơn hàng mới nhất trong hệ thống
            </p>
          </div>

          <button
            type="button"
            className="
              shrink-0 text-sm
              font-semibold text-brand
              hover:text-brand-hover
            "
          >
            Xem tất cả
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-200">
            <thead className="bg-surface-subtle">
              <tr
                className="
                  text-left text-xs
                  uppercase tracking-wider
                  text-text-subtle
                "
              >
                <th className="px-5 py-3 font-semibold">
                  Mã đơn
                </th>

                <th className="px-5 py-3 font-semibold">
                  Khách hàng
                </th>

                <th className="px-5 py-3 font-semibold">
                  Dịch vụ
                </th>

                <th className="px-5 py-3 font-semibold">
                  Ngày tạo
                </th>

                <th className="px-5 py-3 font-semibold">
                  Giá trị
                </th>

                <th className="px-5 py-3 font-semibold">
                  Trạng thái
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border-subtle">
              {RECENT_ORDERS.map((order) => {
                const status =
                  ORDER_STATUS[order.status];

                return (
                  <tr
                    key={order.id}
                    className="
                      transition-colors
                      hover:bg-surface-subtle
                    "
                  >
                    <td
                      className="
                        px-5 py-4 text-sm
                        font-semibold text-brand
                      "
                    >
                      {order.id}
                    </td>

                    <td
                      className="
                        px-5 py-4 text-sm
                        font-medium
                        text-text-default
                      "
                    >
                      {order.customer}
                    </td>

                    <td
                      className="
                        px-5 py-4 text-sm
                        text-text-muted
                      "
                    >
                      {order.service}
                    </td>

                    <td
                      className="
                        px-5 py-4 text-sm
                        text-text-muted
                      "
                    >
                      {order.date}
                    </td>

                    <td
                      className="
                        px-5 py-4 text-sm
                        font-semibold
                        text-text-default
                      "
                    >
                      {order.amount}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`
                          inline-flex rounded-full
                          px-2.5 py-1
                          text-xs font-semibold
                          ${status.className}
                        `}
                      >
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboardPage;