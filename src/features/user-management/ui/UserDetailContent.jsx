import {
  Activity,
  BadgeCheck,
  ChevronDown,
  ClipboardList,
  ExternalLink,
  LockKeyhole,
  Mail,
  Phone,
} from "lucide-react";
import { Link } from "react-router-dom";

import { AdminDetailSummaryRow } from "@/shared/ui/admin-detail/AdminDetailLayout";

import {
  EMPTY_VALUE,
  formatActivityDate,
  formatDate,
  formatTime,
} from "../lib/userDetail";
import UserAddressSection from "./UserAddressSection";

const UserSecuritySection = ({
  user,
  status,
  loginEmailProvider,
  phoneProvider,
  providerNames,
  permissions,
}) => (
  <section>
    <h2 className="mb-3 text-sm font-bold text-text-strong">
      Tài khoản & bảo mật
    </h2>

    <div className="overflow-hidden rounded-xl border border-border bg-surface-subtle">
      <AdminDetailSummaryRow
        icon={BadgeCheck}
        title="Trạng thái tài khoản"
        description={formatDate(user.updatedAt)}
        value={status.label}
        valueClassName={status.badgeClassName}
        showChevron
      />

      <AdminDetailSummaryRow
        icon={Mail}
        title="Xác thực email"
        value={
          loginEmailProvider
            ? loginEmailProvider.emailVerifiedAt
              ? "Đã xác thực"
              : "Chưa xác thực"
            : "Chưa có"
        }
        valueClassName={
          loginEmailProvider?.emailVerifiedAt
            ? "bg-success-soft text-success"
            : "bg-warning-soft text-warning"
        }
        showChevron
      />

      <AdminDetailSummaryRow
        icon={Phone}
        title="Xác thực điện thoại"
        value={
          phoneProvider
            ? phoneProvider.phoneVerifiedAt
              ? "Đã xác thực"
              : "Chưa xác thực"
            : "Chưa có"
        }
        valueClassName={
          phoneProvider?.phoneVerifiedAt
            ? "bg-success-soft text-success"
            : "bg-warning-soft text-warning"
        }
        showChevron
      />

      <AdminDetailSummaryRow
        icon={LockKeyhole}
        title="Xác thực hai lớp"
        value="Chưa hỗ trợ"
        valueClassName="bg-surface-muted text-text-muted"
        showChevron
      />
    </div>

    <details className="group mt-3 overflow-hidden rounded-xl border border-border bg-surface">
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-4 text-sm font-semibold text-text-default">
        Chi tiết xác thực
        <ChevronDown
          size={16}
          className="text-text-muted transition group-open:rotate-180"
        />
      </summary>

      <div className="border-t border-border-subtle px-4 py-3 text-sm text-text-muted">
        <p>
          Provider:{" "}
          <span className="font-semibold text-text-default">
            {providerNames.length ? providerNames.join(", ") : EMPTY_VALUE}
          </span>
        </p>

        <p className="mt-2">
          Permission:{" "}
          <span className="font-semibold text-text-default">
            {permissions.length
              ? permissions
                  .map(
                    (permission) =>
                      permission.name || permission.code || permission,
                  )
                  .join(", ")
              : EMPTY_VALUE}
          </span>
        </p>
      </div>
    </details>
  </section>
);

const UserActivitySection = ({ activities }) => (
  <section>
    <div className="mb-3 flex items-center justify-between gap-4">
      <h2 className="text-sm font-bold text-text-strong">Hoạt động</h2>

      <span className="text-xs text-text-muted">
        {activities.length} hoạt động
      </span>
    </div>

    <div className="space-y-3">
      {activities.length > 0 ? (
        activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center gap-4 rounded-xl border border-border bg-surface-subtle px-4 py-4"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-text-muted">
              <Activity size={17} />
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-text-default">
                {activity.title}
              </p>

              <p className="mt-1 text-xs text-text-muted">
                {formatActivityDate(activity.date)} {formatTime(activity.date)}
              </p>
            </div>

            <span className="text-xs text-text-subtle">
              {formatDate(activity.date)}
            </span>
          </div>
        ))
      ) : (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-text-muted">
          Chưa có hoạt động nào được ghi nhận.
        </div>
      )}
    </div>
  </section>
);

const UserRelatedOrdersSection = ({ orders = [] }) => {
  const visibleOrders = orders.slice(0, 5);

  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-text-strong">
            Đơn dịch vụ liên quan
          </h2>
          <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-semibold text-text-muted">
            {orders.length}
          </span>
        </div>

        <Link
          to="/admin/service-orders"
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
        >
          <span>Quản lý đơn dịch vụ</span>
          <ExternalLink size={12} />
        </Link>
      </div>

      {visibleOrders.length > 0 ? (
        <div className="space-y-2.5">
          {visibleOrders.map((order) => (
            <Link
              key={order.id}
              to={`/admin/service-orders/${order.id}`}
              className="flex flex-col justify-between gap-2 rounded-xl border border-border bg-surface-subtle px-4 py-3.5 transition-colors hover:border-brand/40 hover:bg-surface sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-text-muted">
                  <ClipboardList size={16} />
                </span>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-surface-muted px-1.5 py-0.5 font-mono text-[11px] font-bold text-text-default">
                      {order.code}
                    </span>
                    <span className="truncate text-sm font-semibold text-text-default">
                      {order.productName}
                    </span>
                    {order.relationLabel && (
                      <span className="rounded-md bg-brand-soft px-2 py-0.5 text-[10px] font-semibold text-brand">
                        {order.relationLabel}
                      </span>
                    )}
                  </div>

                  <p className="mt-1 truncate text-xs text-text-muted">
                    {order.serviceName} • {formatDate(order.date)}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center justify-between gap-2.5 sm:justify-end">
                <span className="text-xs font-bold text-text-default">
                  {order.formattedPrice}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${order.statusClassName}`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${order.statusDot}`}
                  />
                  {order.statusLabel}
                </span>
              </div>
            </Link>
          ))}

          {orders.length > visibleOrders.length && (
            <p className="pt-1 text-center text-xs text-text-muted">
              Đang hiển thị {visibleOrders.length}/{orders.length} đơn dịch vụ
              gần nhất.
            </p>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-text-muted">
          Chưa có đơn dịch vụ liên quan.
        </div>
      )}
    </section>
  );
};

const UserDetailContent = ({
  user,
  status,
  loginEmailProvider,
  phoneProvider,
  providerNames,
  permissions,
  activities,
  relatedOrders = [],
  canEditUser,
  onUserChange,
}) => (
  <>
    <UserSecuritySection
      user={user}
      status={status}
      loginEmailProvider={loginEmailProvider}
      phoneProvider={phoneProvider}
      providerNames={providerNames}
      permissions={permissions}
    />

    <UserActivitySection activities={activities} />

    <UserAddressSection
      user={user}
      canEditUser={canEditUser}
      onUserChange={onUserChange}
    />

    <UserRelatedOrdersSection orders={relatedOrders} />
  </>
);

export default UserDetailContent;
