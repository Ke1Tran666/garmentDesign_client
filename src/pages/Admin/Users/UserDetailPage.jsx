import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  ChevronDown,
  EllipsisVertical,
  Hash,
  LockKeyhole,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";

import { userApi } from "@/entities/user/api/userApi";
import { normalizeRole } from "@/features/auth/lib/authRole";

import ConfirmModal from "@/shared/ui/modal/ConfirmModal";
import { useNotification } from "@/app/providers/NotificationProvider";
import UserIdentityEditModal from "@/features/user-management/ui/UserIdentityEditModal";
import UserPhoneEditModal from "@/features/user-management/ui/UserPhoneEditModal";
import AdminDetailLayout, {
  AdminDetailInfoRow,
  AdminDetailSection,
  AdminDetailSummaryRow,
} from "@/shared/ui/admin-detail/AdminDetailLayout";
import { roleApi } from "@/entities/user/api/roleApi";

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

const formatGender = (gender) => {
  const normalizedGender = String(gender || "")
    .trim()
    .toLowerCase();

  if (normalizedGender === "male") {
    return "Nam";
  }

  if (normalizedGender === "female") {
    return "Nữ";
  }

  if (normalizedGender === "unknown") {
    return "Không xác định";
  }

  return EMPTY_VALUE;
};

const getInitials = (fullName) => {
  const normalizedName = String(fullName || "").trim();

  if (!normalizedName) {
    return "U";
  }

  const nameParts = normalizedName.split(/\s+/);

  if (nameParts.length === 1) {
    return nameParts[0].slice(0, 2).toUpperCase();
  }

  const firstName = nameParts[0];
  const lastName = nameParts[nameParts.length - 1];

  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
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

const getRoleName = (user) => user?.role?.nameRole || "Chưa phân quyền";

const normalizeUserDetail = (data) => {
  const userData = data?.user;

  if (!userData) {
    return null;
  }

  return {
    ...userData,

    authProviders: Array.isArray(data.authProviders) ? data.authProviders : [],

    addresses: Array.isArray(data.addresses) ? data.addresses : [],

    defaultAddress: data.defaultAddress || userData.defaultAddress || null,
  };
};

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

  const [identityEditOpen, setIdentityEditOpen] = useState(false);
  const [identitySubmitting, setIdentitySubmitting] = useState(false);
  const [identityUpdateError, setIdentityUpdateError] = useState("");

  const [phoneEditOpen, setPhoneEditOpen] = useState(false);
  const [phoneSubmitting, setPhoneSubmitting] = useState(false);
  const [phoneUpdateError, setPhoneUpdateError] = useState("");
  const [roles, setRoles] = useState([]);

  const [rolesLoading, setRolesLoading] = useState(false);

  const currentRole = normalizeRole(adminUser?.role);

  const targetRole = normalizeRole(user?.role?.nameRole);

  const isCurrentUser = user?.idUser === adminUser?.idUser;

  const isAdmin = currentRole === "admin";

  const isStaff = currentRole === "staff";

  const canEditUser =
    isAdmin || (isStaff && (targetRole === "user" || isCurrentUser));

  /*
   * Chỉ Admin được cấp vai trò.
   */
  const canAssignRole = isAdmin;

  useEffect(() => {
    let active = true;

    const loadUser = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const data = await userApi.getById(userId);

        if (active) {
          setUser(normalizeUserDetail(data));
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
    const provider = String(item.provider || "").toLowerCase();

    return item.email && (provider === "local" || provider === "google");
  });

  const getProviderInfo = (providerValue) => {
    const provider = String(providerValue || "").toLowerCase();

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

  const phoneProvider = authProviders.find((item) => item.phone);

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
      .sort((first, second) => new Date(second.date) - new Date(first.date));
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
        error.response?.data?.message || "Không thể xóa người dùng.",
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

  const handleIdentitySubmit = async ({
    fullName,
    birthday,
    gender,
    roleId,
    avatarFile,
    avatarDeleted,
  }) => {
    if (!canEditUser) {
      return;
    }

    try {
      setIdentitySubmitting(true);
      setIdentityUpdateError("");

      await userApi.updateById(user.idUser, {
        fullName,
        birthday,
        gender,

        /*
         * Không gửi phone ở đây.
         * Phone dùng modal riêng.
         */
        phone: null,
      });

      if (avatarDeleted) {
        await userApi.removeAvatarById(user.idUser);
      } else if (avatarFile) {
        await userApi.uploadAvatarById(user.idUser, avatarFile);
      }

      const currentRoleId = user.role?.idRole;

      if (canAssignRole && roleId && Number(roleId) !== Number(currentRoleId)) {
        await userApi.updateRole(user.idUser, roleId);
      }

      const refreshedData = await userApi.getById(user.idUser);

      setUser(normalizeUserDetail(refreshedData));

      setIdentityEditOpen(false);

      showNotification(
        "success",
        "Cập nhật thành công",
        canAssignRole
          ? "Thông tin và quyền người dùng đã được cập nhật."
          : "Thông tin người dùng đã được cập nhật.",
      );
    } catch (error) {
      setIdentityUpdateError(
        error.response?.data?.message ||
          "Không thể cập nhật thông tin người dùng.",
      );
    } finally {
      setIdentitySubmitting(false);
    }
  };

  const handleOpenPhoneEdit = () => {
    setPhoneUpdateError("");
    setPhoneEditOpen(true);
  };

  const handlePhoneSubmit = async (phone) => {
    try {
      setPhoneSubmitting(true);
      setPhoneUpdateError("");

      await userApi.updatePhoneById(user.idUser, phone);

      const refreshedData = await userApi.getById(user.idUser);

      setUser(normalizeUserDetail(refreshedData));

      setPhoneEditOpen(false);

      showNotification(
        "success",
        "Cập nhật thành công",
        "Số điện thoại đã được cập nhật.",
      );
    } catch (error) {
      setPhoneUpdateError(
        error.response?.data?.message || "Không thể cập nhật số điện thoại.",
      );
    } finally {
      setPhoneSubmitting(false);
    }
  };

  const handleOpenIdentityEdit = async () => {
    if (!canEditUser) {
      return;
    }

    setIdentityUpdateError("");

    /*
     * Chỉ Admin cần tải danh sách role.
     * Staff không được gọi /api/roles.
     */
    if (canAssignRole && roles.length === 0) {
      try {
        setRolesLoading(true);

        const roleData = await roleApi.getAll();

        setRoles(Array.isArray(roleData) ? roleData : []);
      } catch (error) {
        showNotification(
          "error",
          "Không thể tải vai trò",
          error.response?.data?.message || "Không thể tải danh sách vai trò.",
        );

        return;
      } finally {
        setRolesLoading(false);
      }
    }

    setIdentityEditOpen(true);
  };

  return (
    <>
      <AdminDetailLayout
        backLabel="Quay lại Người dùng"
        breadcrumbLabel="Người dùng"
        breadcrumbValue={user.userCode || user.idUser}
        title={user.fullName || "Chưa cập nhật tên"}
        code={user.userCode || user.idUser}
        subtitle={loginEmailProvider?.email}
        onBack={() => navigate("/admin/users")}
        leading={
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-soft text-sm font-semibold text-brand">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.fullName || "Người dùng"}
                className="h-full w-full object-cover"
              />
            ) : (
              getInitials(user.fullName)
            )}
          </div>
        }
        badges={
          <>
            <span
              className={`rounded-lg px-3 py-2 text-xs font-semibold ${status.badgeClassName}`}
            >
              {status.label}
            </span>

            <span className="rounded-lg border border-border bg-surface-subtle px-3 py-2 text-xs font-semibold text-text-default">
              {getRoleName(user)}
            </span>

            {providerNames.map((provider) => (
              <span
                key={provider}
                className="rounded-lg border border-border bg-surface-subtle px-3 py-2 text-xs font-semibold text-text-default capitalize"
              >
                {provider}
              </span>
            ))}
          </>
        }
        actions={
          isAdmin ? (
            <div className="relative">
              <button
                type="button"
                aria-label="Mở thao tác"
                aria-haspopup="menu"
                aria-expanded={actionOpen}
                onClick={() => setActionOpen((current) => !current)}
                className="flex h-9 w-10 items-center justify-center rounded-lg border border-border bg-surface-subtle text-text-muted transition hover:bg-surface-muted hover:text-text-default"
              >
                <EllipsisVertical size={17} />
              </button>

              {actionOpen && (
                <div
                  role="menu"
                  className="absolute top-full right-0 z-30 mt-2 w-52 rounded-xl border border-border bg-surface p-1.5 shadow-xl"
                >
                  <button
                    type="button"
                    role="menuitem"
                    disabled={Boolean(user.deletedAt)}
                    onClick={() => {
                      setActionOpen(false);
                      handleOpenIdentityEdit();
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-text-default transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Pencil size={17} />
                    Chỉnh sửa thông tin
                  </button>

                  <div className="my-1 border-t border-border-subtle" />

                  <button
                    type="button"
                    role="menuitem"
                    disabled={isCurrentUser || Boolean(user.deletedAt)}
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
          ) : null
        }
        sidebar={
          <>
            <AdminDetailSection title="Thông tin cơ bản">
              <AdminDetailInfoRow icon={Hash} label="ID">
                {user.idUser}
              </AdminDetailInfoRow>

              <AdminDetailInfoRow icon={Mail} label="Email">
                <div className="flex w-full min-w-0 items-center gap-3">
                  <span
                    title={loginEmailProvider?.email || ""}
                    className="block max-w-40 min-w-0 flex-1 truncate sm:max-w-48"
                  >
                    {loginEmailProvider?.email || EMPTY_VALUE}
                  </span>

                  {loginProviderInfo && (
                    <span
                      className={`shrink-0 rounded-md px-2 py-1 text-xs font-semibold ${loginProviderInfo.className}`}
                    >
                      {loginProviderInfo.label}
                    </span>
                  )}
                </div>
              </AdminDetailInfoRow>

              <AdminDetailInfoRow icon={UserRound} label="Mã">
                {user.userCode || EMPTY_VALUE}
              </AdminDetailInfoRow>

              <AdminDetailInfoRow icon={CalendarDays} label="Ngày tạo">
                {formatDate(user.createdAt)}
              </AdminDetailInfoRow>

              <AdminDetailInfoRow icon={CalendarDays} label="Cập nhật">
                {formatDate(user.updatedAt)}
              </AdminDetailInfoRow>

              <AdminDetailInfoRow icon={BadgeCheck} label="Trạng thái">
                <span
                  className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${status.badgeClassName}`}
                >
                  {status.label}
                </span>
              </AdminDetailInfoRow>
            </AdminDetailSection>

            <AdminDetailSection
              title="Danh tính"
              action={
                canEditUser && !user.deletedAt ? (
                  <button
                    type="button"
                    onClick={handleOpenIdentityEdit}
                    className="rounded-md p-1.5 text-text-subtle transition hover:bg-surface-muted hover:text-text-default"
                    aria-label="Chỉnh sửa người dùng"
                    title="Chỉnh sửa người dùng"
                  >
                    <Pencil size={14} />
                  </button>
                ) : null
              }
            >
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-muted text-sm font-semibold text-text-muted">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.fullName || "Người dùng"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    getInitials(user.fullName)
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate font-medium text-text-strong">
                    {user.fullName || EMPTY_VALUE}
                  </p>

                  <p className="truncate text-sm text-text-muted">
                    {loginEmailProvider?.email || EMPTY_VALUE}
                  </p>
                </div>
              </div>

              <AdminDetailInfoRow icon={UserRound} label="Họ tên">
                {user.fullName || EMPTY_VALUE}
              </AdminDetailInfoRow>

              <AdminDetailInfoRow icon={CalendarDays} label="Ngày sinh">
                {formatDate(user.birthday)}
              </AdminDetailInfoRow>

              <AdminDetailInfoRow icon={UserRound} label="Giới tính">
                {formatGender(user.gender)}
              </AdminDetailInfoRow>

              <AdminDetailInfoRow icon={Phone} label="Điện thoại">
                {phoneProvider?.phone || EMPTY_VALUE}
              </AdminDetailInfoRow>

              <AdminDetailInfoRow icon={MapPin} label="Địa chỉ">
                {user.defaultAddress?.address || EMPTY_VALUE}
              </AdminDetailInfoRow>
            </AdminDetailSection>

            <AdminDetailSection
              title="Số điện thoại"
              action={
                canEditUser && !user.deletedAt ? (
                  <button
                    type="button"
                    onClick={handleOpenPhoneEdit}
                    className="rounded-md p-1.5 text-text-subtle transition hover:bg-surface-muted hover:text-text-default"
                    aria-label="Chỉnh sửa số điện thoại"
                    title="Chỉnh sửa số điện thoại"
                  >
                    <Pencil size={14} />
                  </button>
                ) : null
              }
            >
              {phoneProvider ? (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-subtle px-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text-default">
                      {phoneProvider.phone}
                    </p>

                    <p className="mt-1 text-xs text-text-muted">
                      {phoneProvider.phoneVerifiedAt
                        ? "Đã xác thực"
                        : "Chưa xác thực"}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-md px-2 py-1 text-xs font-semibold ${
                      phoneProvider.phoneVerifiedAt
                        ? "bg-success-soft text-success"
                        : "bg-warning-soft text-warning"
                    }`}
                  >
                    Chính
                  </span>
                </div>
              ) : (
                <p className="py-2 text-sm text-text-muted">
                  Chưa có số điện thoại.
                </p>
              )}
            </AdminDetailSection>

            <AdminDetailSection title="Địa chỉ mặc định">
              {user.defaultAddress ? (
                <div className="rounded-xl border border-border bg-surface-subtle px-3 py-3">
                  <p className="text-sm font-medium text-text-default">
                    {user.defaultAddress.companyName || "Địa chỉ người dùng"}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-text-muted">
                    {user.defaultAddress.address || EMPTY_VALUE}
                  </p>
                </div>
              ) : (
                <p className="py-2 text-sm text-text-muted">
                  Chưa có địa chỉ mặc định.
                </p>
              )}
            </AdminDetailSection>
          </>
        }
      >
        {/* Tài khoản và bảo mật */}
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
              icon={ShieldCheck}
              title="Vai trò"
              value={getRoleName(user)}
              valueClassName="bg-info-soft text-info"
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
                            permission.name || permission.code || permission,
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
            <h2 className="text-sm font-bold text-text-strong">Hoạt động</h2>

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
            <h2 className="text-sm font-bold text-text-strong">Địa chỉ</h2>

            <span className="text-xs text-text-muted">
              {Array.isArray(user.addresses) ? user.addresses.length : 0} địa
              chỉ
            </span>
          </div>

          {Array.isArray(user.addresses) && user.addresses.length > 0 ? (
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
                      {address.companyName || "Địa chỉ người dùng"}
                    </p>

                    <p className="mt-1 text-sm leading-6 text-text-muted">
                      {address.address || EMPTY_VALUE}
                    </p>

                    {address.note && (
                      <p className="mt-1 text-xs text-text-subtle">
                        {address.note}
                      </p>
                    )}
                  </div>

                  {user.defaultAddress?.addressId === address.addressId && (
                    <span className="shrink-0 rounded-md bg-success-soft px-2 py-1 text-xs font-semibold text-success">
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
      </AdminDetailLayout>

      {identityEditOpen && (
        <UserIdentityEditModal
          user={user}
          roles={roles}
          canAssignRole={canAssignRole}
          submitting={identitySubmitting || rolesLoading}
          errorMessage={identityUpdateError}
          onClose={() => {
            if (identitySubmitting || rolesLoading) {
              return;
            }

            setIdentityEditOpen(false);
            setIdentityUpdateError("");
          }}
          onSubmit={handleIdentitySubmit}
        />
      )}

      {phoneEditOpen && (
        <UserPhoneEditModal
          phone={phoneProvider?.phone || ""}
          submitting={phoneSubmitting}
          errorMessage={phoneUpdateError}
          onClose={() => {
            if (phoneSubmitting) return;

            setPhoneEditOpen(false);
            setPhoneUpdateError("");
          }}
          onSubmit={handlePhoneSubmit}
        />
      )}

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
