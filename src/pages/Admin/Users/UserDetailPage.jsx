import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Clock3,
  EllipsisVertical,
  Hash,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Trash2,
  UserRound,
  VenusAndMars,
} from "lucide-react";
import {
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router-dom";

import defaultAvatar from "@/assets/images/avatar-default.jpg";
import { userApi } from "@/api/userApi";
import { normalizeRole } from "@/lib/authRole";

import ConfirmModal from "@/components/ui/Modal/ConfirmModal";
import { useNotification } from "@/components/ui/Notification/NotificationContext";

const EMPTY_VALUE = "Chưa có dữ liệu";

const formatDate = (value) => {
  if (!value) return EMPTY_VALUE;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

const formatActivityDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
};

const formatTime = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const getStatusInfo = (user) => {
  if (user?.deletedAt) {
    return {
      label: "Đã xóa",
      dotClassName: "bg-danger",
      badgeClassName: "bg-danger-soft text-danger",
    };
  }

  const status = String(user?.status || "").toLowerCase();

  if (status === "active") {
    return {
      label: "Hoạt động",
      dotClassName: "bg-success",
      badgeClassName: "bg-success-soft text-success",
    };
  }

  if (status === "pending") {
    return {
      label: "Chờ hoàn thiện",
      dotClassName: "bg-warning",
      badgeClassName: "bg-warning-soft text-warning",
    };
  }

  if (status === "inactive" || status === "banned") {
    return {
      label: "Đã khóa",
      dotClassName: "bg-danger",
      badgeClassName: "bg-danger-soft text-danger",
    };
  }

  return {
    label: status || "Không xác định",
    dotClassName: "bg-text-subtle",
    badgeClassName: "bg-surface-muted text-text-muted",
  };
};

const getRoleName = (user) =>
  user?.role?.nameRole || "Chưa phân quyền";

const SidebarInfoRow = ({
  icon: Icon,
  label,
  children,
}) => (
  <div className="grid grid-cols-[18px_105px_minmax(0,1fr)] items-start gap-3 py-2.5">
    <Icon
      size={16}
      className="mt-0.5 text-text-subtle"
    />

    <span className="text-sm text-text-muted">
      {label}
    </span>

    <div className="wrap-break-word text-sm font-medium text-text-default">
      {children || EMPTY_VALUE}
    </div>
  </div>
);

const SummaryRow = ({
  icon: Icon,
  title,
  description,
  status,
  statusClassName,
}) => (
  <div className="flex items-center gap-3 border-b border-border-subtle px-4 py-3 last:border-b-0">
    <Icon
      size={17}
      className="shrink-0 text-text-muted"
    />

    <div className="min-w-0 flex-1">
      <span className="text-sm font-semibold text-text-default">
        {title}
      </span>

      {description && (
        <span className="ml-2 text-xs text-text-muted">
          {description}
        </span>
      )}
    </div>

    <span
      className={`
        shrink-0 rounded-md px-2 py-1
        text-xs font-semibold
        ${statusClassName}
      `}
    >
      {status}
    </span>

    <ChevronDown
      size={15}
      className="shrink-0 text-text-subtle"
    />
  </div>
);

const SidebarSection = ({
  title,
  action,
  children,
}) => (
  <section className="border-b border-border-subtle py-5 last:border-b-0">
    <div className="mb-2 flex items-center justify-between gap-4">
      <h2 className="text-sm font-bold text-text-strong">
        {title}
      </h2>

      {action}
    </div>

    {children}
  </section>
);

const UserDetailPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { adminUser } = useOutletContext();
  const { showNotification } = useNotification();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [actionOpen, setActionOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const isAdmin =
    normalizeRole(adminUser?.role) === "admin";

  const isCurrentUser =
    user?.idUser === adminUser?.idUser;

  useEffect(() => {
    let active = true;

    const loadUser = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const data = await userApi.getById(userId);

        if (active) {
          const userData = data?.user;

          setUser({
            ...userData,
            authProviders: Array.isArray(data?.authProviders)
              ? data.authProviders
              : [],
            addresses: Array.isArray(data?.addresses)
              ? data.addresses
              : [],
            defaultAddress:
              data?.defaultAddress ||
              userData?.defaultAddress ||
              null,
          });
        }
      } catch (error) {
        if (!active) return;

        setUser(null);
        setErrorMessage(
          error.response?.data?.message ||
            "Không thể tải thông tin người dùng.",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      active = false;
    };
  }, [userId]);

  const authProviders = Array.isArray(user?.authProviders)
    ? user.authProviders.filter((item) => !item.deletedAt)
    : [];

  const loginEmailProvider = authProviders.find((item) => {
    const provider = String(
      item.provider || "",
    ).toLowerCase();

    return (
      item.email &&
      (provider === "local" || provider === "google")
    );
  });

  const getProviderInfo = (providerValue) => {
    const provider = String(
      providerValue || "",
    ).toLowerCase();

    if (provider === "local") {
      return {
        label: "Local",
        className: "bg-info-soft text-info",
      };
    }

    if (provider === "google") {
      return {
        label: "Google",
        className: "bg-danger-soft text-danger",
      };
    }

    return {
      label: providerValue || "Không xác định",
      className: "bg-surface-muted text-text-muted",
    };
  };

  const loginProviderInfo = loginEmailProvider
    ? getProviderInfo(loginEmailProvider.provider)
    : null;

  const phoneProvider = authProviders.find(
    (item) => item.phone,
  );

  const providerNames = authProviders
    .map((item) => item.provider)
    .filter(Boolean);

  const permissions = Array.isArray(user?.role?.permissions)
    ? user.role.permissions
    : [];

  const recentActivities = useMemo(() => {
    if (!user) return [];

    return [
      user.lastLogin
        ? {
            id: "last-login",
            date: user.lastLogin,
            title: "Đăng nhập gần nhất",
          }
        : null,
      user.updatedAt
        ? {
            id: "updated",
            date: user.updatedAt,
            title: "Cập nhật tài khoản",
          }
        : null,
      user.createdAt
        ? {
            id: "created",
            date: user.createdAt,
            title: "Tạo tài khoản",
          }
        : null,
    ]
      .filter(Boolean)
      .sort(
        (first, second) =>
          new Date(second.date) - new Date(first.date),
      );
  }, [user]);

  const handleDelete = async () => {
    if (!user) return;

    try {
      setDeleting(true);
      setDeleteError("");

      await userApi.remove(user.idUser);

      showNotification(
        "success",
        "Đã xóa người dùng",
        "Tài khoản đã bị vô hiệu hóa.",
      );

      navigate("/admin/users", {
        replace: true,
      });
    } catch (error) {
      setDeleteError(
        error.response?.data?.message ||
          "Không thể xóa người dùng.",
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-44 animate-pulse rounded bg-surface-muted" />
        <div className="h-24 animate-pulse rounded-2xl bg-surface-muted" />
        <div className="h-72 animate-pulse rounded-2xl bg-surface-muted" />
      </div>
    );
  }

  if (errorMessage || !user) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate("/admin/users")}
          className="inline-flex items-center gap-2 text-sm font-semibold text-text-muted transition hover:text-brand"
        >
          <ArrowLeft size={18} />
          Quay lại Người dùng
        </button>

        <div className="rounded-2xl border border-danger-border bg-danger-soft p-6 text-danger">
          {errorMessage || "Không tìm thấy người dùng."}
        </div>
      </div>
    );
  }

  const status = getStatusInfo(user);

  return (
    <>
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate("/admin/users")}
          className="
            inline-flex items-center gap-2
            text-sm font-semibold text-text-muted
            transition hover:text-brand
          "
        >
          <ArrowLeft size={18} />
          Quay lại Người dùng
        </button>

        <div className="overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-sm">
          {/* Breadcrumb */}
          <nav className="flex h-13 items-center gap-2 border-b border-border-subtle px-5 text-sm sm:px-6">
            <button
              type="button"
              onClick={() => navigate("/admin/users")}
              className="text-text-muted transition hover:text-brand"
            >
              Người dùng
            </button>

            <ChevronRight
              size={15}
              className="text-text-subtle"
            />

            <span className="truncate font-medium text-text-default">
              {user.userCode || user.idUser}
            </span>
          </nav>

          {/* User header */}
          <header className="flex flex-col gap-4 border-b border-border-subtle px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <h1 className="truncate text-2xl font-semibold text-text-strong">
                {user.fullName || "Chưa cập nhật tên"}
              </h1>

              <span className="rounded-md bg-surface-muted px-2 py-1 text-xs font-semibold text-text-default">
                {user.userCode || user.idUser}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg border border-border bg-surface-subtle px-3 py-2 text-xs font-semibold text-text-default">
                {getRoleName(user)}
              </span>

              {providerNames.map((provider) => (
                <span
                  key={provider}
                  className="rounded-lg border border-border bg-surface-subtle px-3 py-2 text-xs font-semibold capitalize text-text-default"
                >
                  {provider}
                </span>
              ))}

              <div className="relative">
                <button
                  type="button"
                  aria-label="Mở thao tác"
                  aria-haspopup="menu"
                  aria-expanded={actionOpen}
                  onClick={() =>
                    setActionOpen((current) => !current)
                  }
                  className="flex h-9 w-10 items-center justify-center rounded-lg border border-border bg-surface-subtle text-text-muted transition hover:bg-surface-muted hover:text-text-default"
                >
                  <EllipsisVertical size={17} />
                </button>

                {actionOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full z-30 mt-2 w-52 rounded-xl border border-border bg-surface p-1.5 shadow-xl"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      disabled={
                        !isAdmin ||
                        isCurrentUser ||
                        Boolean(user.deletedAt)
                      }
                      onClick={() => {
                        setActionOpen(false);
                        setDeleteError("");
                        setDeleteOpen(true);
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-danger transition hover:bg-danger-soft disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2 size={17} />
                      Xóa tài khoản
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Hai cột theo thiết kế ảnh */}
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.65fr)_minmax(340px,0.95fr)]">
            {/* Cột trái */}
            <main className="min-w-0 space-y-7 p-5 sm:p-6 xl:border-r xl:border-border-subtle">
              {/* Trạng thái tài khoản */}
              <section>
                <h2 className="mb-3 text-sm font-bold text-text-strong">
                  Tài khoản & bảo mật
                </h2>

                <div className="overflow-hidden rounded-xl border border-border bg-surface-subtle">
                  <SummaryRow
                    icon={BadgeCheck}
                    title="Trạng thái tài khoản"
                    description={formatDate(user.updatedAt)}
                    status={status.label}
                    statusClassName={status.badgeClassName}
                  />

                  <SummaryRow
                    icon={ShieldCheck}
                    title="Vai trò"
                    status={getRoleName(user)}
                    statusClassName="bg-info-soft text-info"
                  />

                  <SummaryRow
                    icon={Mail}
                    title="Xác thực email"
                    status={
                      loginEmailProvider
                        ? loginEmailProvider.emailVerifiedAt
                          ? "Đã xác thực"
                          : "Chưa xác thực"
                        : "Chưa có"
                    }
                    statusClassName={
                      loginEmailProvider?.emailVerifiedAt
                        ? "bg-success-soft text-success"
                        : "bg-warning-soft text-warning"
                    }
                  />

                  <SummaryRow
                    icon={Phone}
                    title="Xác thực điện thoại"
                    status={
                      phoneProvider
                        ? phoneProvider.phoneVerifiedAt
                          ? "Đã xác thực"
                          : "Chưa xác thực"
                        : "Chưa có"
                    }
                    statusClassName={
                      phoneProvider?.phoneVerifiedAt
                        ? "bg-success-soft text-success"
                        : "bg-warning-soft text-warning"
                    }
                  />

                  <SummaryRow
                    icon={LockKeyhole}
                    title="Xác thực hai lớp"
                    status="Chưa hỗ trợ"
                    statusClassName="bg-surface-muted text-text-muted"
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
                        {providerNames.length > 0
                          ? providerNames.join(", ")
                          : EMPTY_VALUE}
                      </span>
                    </p>

                    <p className="mt-2">
                      Permission:{" "}
                      <span className="font-semibold text-text-default">
                        {permissions.length > 0
                          ? permissions
                              .map(
                                (permission) =>
                                  permission.name ||
                                  permission.code ||
                                  permission,
                              )
                              .join(", ")
                          : EMPTY_VALUE}
                      </span>
                    </p>
                  </div>
                </details>
              </section>

              {/* Hoạt động */}
              <section>
                <div className="mb-3 flex items-center justify-between gap-4">
                  <h2 className="text-sm font-bold text-text-strong">
                    Hoạt động
                  </h2>

                  <span className="text-xs text-text-muted">
                    {recentActivities.length} hoạt động
                  </span>
                </div>

                <div className="space-y-3">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity) => (
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
                            {formatActivityDate(activity.date)}{" "}
                            {formatTime(activity.date)}
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

              {/* Địa chỉ */}
              <section>
                <div className="mb-3 flex items-center justify-between gap-4">
                  <h2 className="text-sm font-bold text-text-strong">
                    Địa chỉ
                  </h2>

                  <span className="text-xs text-text-muted">
                    {Array.isArray(user.addresses)
                      ? user.addresses.length
                      : 0}{" "}
                    địa chỉ
                  </span>
                </div>

                {Array.isArray(user.addresses) &&
                user.addresses.length > 0 ? (
                  <div className="space-y-3">
                    {user.addresses.map((address) => (
                      <div
                        key={address.addressId}
                        className="flex items-start gap-4 rounded-xl border border-border bg-surface-subtle p-4"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-text-muted">
                          <MapPin size={17} />
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-text-default">
                            {address.companyName ||
                              "Địa chỉ người dùng"}
                          </p>

                          <p className="mt-1 text-sm leading-6 text-text-muted">
                            {address.address || EMPTY_VALUE}
                          </p>
                        </div>

                        {user.defaultAddress?.addressId ===
                          address.addressId && (
                          <span className="rounded-md bg-success-soft px-2 py-1 text-xs font-semibold text-success">
                            Mặc định
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-text-muted">
                    Người dùng chưa có địa chỉ.
                  </div>
                )}
              </section>
            </main>

            {/* Cột phải */}
            <aside className="min-w-0 px-5 sm:px-6">
              <SidebarSection title="Thông tin cơ bản">
                <SidebarInfoRow
                  icon={Hash}
                  label="ID"
                >
                  {user.idUser}
                </SidebarInfoRow>

                <SidebarInfoRow
                  icon={Mail}
                  label="Email"
                >
                  <div className="flex w-full min-w-0 items-center gap-3">
                    <span
                      title={loginEmailProvider?.email || ""}
                      className="
                        block min-w-0 max-w-40 flex-1
                        truncate sm:max-w-48
                      "
                    >
                      {loginEmailProvider?.email || EMPTY_VALUE}
                    </span>

                    {loginProviderInfo && (
                      <span
                        className={`
                          shrink-0 rounded-md px-2 py-1
                          text-xs font-semibold
                          ${loginProviderInfo.className}
                        `}
                      >
                        {loginProviderInfo.label}
                      </span>
                    )}
                  </div>
                </SidebarInfoRow>

                <SidebarInfoRow
                  icon={UserRound}
                  label="Mã"
                >
                  {user.userCode || EMPTY_VALUE}
                </SidebarInfoRow>

                <SidebarInfoRow
                  icon={CalendarDays}
                  label="Ngày tạo"
                >
                  {formatDate(user.createdAt)}
                </SidebarInfoRow>

                <SidebarInfoRow
                  icon={Clock3}
                  label="Đăng nhập"
                >
                  {formatDate(user.lastLogin)}
                </SidebarInfoRow>

                <SidebarInfoRow
                  icon={BadgeCheck}
                  label="Trạng thái"
                >
                  <span
                    className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${status.badgeClassName}`}
                  >
                    {status.label}
                  </span>
                </SidebarInfoRow>
              </SidebarSection>

              <SidebarSection title="Danh tính">
                <div className="mb-4 flex items-center gap-3 rounded-xl bg-surface-subtle p-3">
                  <img
                    src={user.avatar || defaultAvatar}
                    alt={user.fullName || "Người dùng"}
                    className="h-12 w-12 rounded-xl object-cover"
                  />

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text-default">
                      {user.fullName ||
                        "Chưa cập nhật tên"}
                    </p>

                    <p className="mt-1 text-xs text-text-muted">
                      {getRoleName(user)}
                    </p>
                  </div>
                </div>

                <SidebarInfoRow
                  icon={UserRound}
                  label="Họ tên"
                >
                  {user.fullName || EMPTY_VALUE}
                </SidebarInfoRow>

                <SidebarInfoRow
                  icon={CalendarDays}
                  label="Ngày sinh"
                >
                  {formatDate(user.birthday)}
                </SidebarInfoRow>

                <SidebarInfoRow
                  icon={VenusAndMars}
                  label="Giới tính"
                >
                  {user.gender || EMPTY_VALUE}
                </SidebarInfoRow>

                <SidebarInfoRow
                  icon={Phone}
                  label="Điện thoại"
                >
                  {phoneProvider?.phone || EMPTY_VALUE}
                </SidebarInfoRow>

                <SidebarInfoRow
                  icon={MapPin}
                  label="Địa chỉ"
                >
                  {user.defaultAddress?.address ||
                    EMPTY_VALUE}
                </SidebarInfoRow>
              </SidebarSection>

              <SidebarSection title="Số điện thoại">
                {phoneProvider ? (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-subtle px-3 py-3">
                    <span className="truncate text-sm font-medium text-text-default">
                      {phoneProvider.phone}
                    </span>

                    <span className="shrink-0 text-xs font-semibold text-success">
                      Chính
                    </span>
                  </div>
                ) : (
                  <p className="py-2 text-sm text-text-muted">
                    Chưa có số điện thoại.
                  </p>
                )}
              </SidebarSection>

              <SidebarSection title="Địa chỉ mặc định">
                {user.defaultAddress ? (
                  <div className="rounded-xl border border-border bg-surface-subtle px-3 py-3">
                    <p className="text-sm font-medium text-text-default">
                      {user.defaultAddress.companyName ||
                        "Địa chỉ người dùng"}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-text-muted">
                      {user.defaultAddress.address ||
                        EMPTY_VALUE}
                    </p>
                  </div>
                ) : (
                  <p className="py-2 text-sm text-text-muted">
                    Chưa có địa chỉ mặc định.
                  </p>
                )}
              </SidebarSection>
            </aside>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={deleteOpen}
        title="Xóa tài khoản?"
        confirmText="Xóa tài khoản"
        loadingText="Đang xóa..."
        confirmVariant="danger"
        submitting={deleting}
        onClose={() => {
          if (deleting) return;

          setDeleteOpen(false);
          setDeleteError("");
        }}
        onConfirm={handleDelete}
      >
        <p>
          Tài khoản{" "}
          <strong className="text-text-default">
            {user.fullName || user.userCode}
          </strong>{" "}
          sẽ bị vô hiệu hóa và tất cả phiên đăng nhập sẽ kết thúc.
        </p>

        {deleteError && (
          <p className="mt-3 rounded-lg bg-danger-soft px-3 py-2 text-danger">
            {deleteError}
          </p>
        )}
      </ConfirmModal>
    </>
  );
};

export default UserDetailPage;