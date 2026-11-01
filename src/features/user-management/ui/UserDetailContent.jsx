import {
  Activity,
  BadgeCheck,
  ChevronDown,
  LockKeyhole,
  Mail,
  Phone,
} from "lucide-react";

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

const UserDetailContent = ({
  user,
  status,
  loginEmailProvider,
  phoneProvider,
  providerNames,
  permissions,
  activities,
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
  </>
);

export default UserDetailContent;
