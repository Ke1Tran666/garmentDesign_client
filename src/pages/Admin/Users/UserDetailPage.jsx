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
import AdminDetailLayout, {
  AdminDetailInfoRow,
  AdminDetailSection,
  AdminDetailSummaryRow,
} from "@/shared/ui/admin-detail/AdminDetailLayout";
import AvatarPicker from "@/shared/ui/upload/AvatarPicker";
import { roleApi } from "@/entities/user/api/roleApi";

const EMPTY_VALUE = "Chưa có dữ liệu";

const createIdentityForm = (user, phone = "") => ({
  fullName: user?.fullName || "",
  birthday: user?.birthday ? String(user.birthday).slice(0, 10) : "",
  gender: user?.gender || "Unknown",
  phone,
  roleId: String(user?.role?.idRole || ""),
});

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

const normalizePhoneInput = (value) =>
  String(value || "")
    .trim()
    .replace(/[\s.-]/g, "");

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
  const [identityEditing, setIdentityEditing] = useState(false);

  const [identityForm, setIdentityForm] = useState(() =>
    createIdentityForm(null),
  );

  const [identityErrors, setIdentityErrors] = useState({});
  const [identitySubmitting, setIdentitySubmitting] = useState(false);
  const [identityUpdateError, setIdentityUpdateError] = useState("");

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarDeleted, setAvatarDeleted] = useState(false);

  const currentRole = normalizeRole(adminUser?.role);

  const targetRole = normalizeRole(user?.role?.nameRole);

  const isCurrentUser = user?.idUser === adminUser?.idUser;

  const isAdmin = currentRole === "admin";

  const isStaff = currentRole === "staff";

  const canEditUser =
    isAdmin || (isStaff && (targetRole === "user" || isCurrentUser));

  const [roles, setRoles] = useState([]);
  const [roleLoading, setRoleLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

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

  const handleStartIdentityEdit = async () => {
    if (!canEditUser || user.deletedAt || roleLoading) {
      return;
    }

    setIdentityUpdateError("");

    /*
     * Chỉ Admin cần tải danh sách vai trò.
     */
    if (isAdmin && roles.length === 0) {
      try {
        setRoleLoading(true);

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
        setRoleLoading(false);
      }
    }

    setIdentityForm(createIdentityForm(user, phoneProvider?.phone || ""));
    setIdentityErrors({});

    setAvatarFile(null);
    setAvatarPreview(user.avatar || "");
    setAvatarDeleted(false);

    setIdentityEditing(true);
  };

  const handleCancelIdentityEdit = () => {
    if (identitySubmitting) {
      return;
    }

    setIdentityForm(createIdentityForm(user, phoneProvider?.phone || ""));
    setIdentityErrors({});
    setIdentityUpdateError("");

    setAvatarFile(null);
    setAvatarPreview(user.avatar || "");
    setAvatarDeleted(false);

    setIdentityEditing(false);
  };

  const handleIdentityChange = (event) => {
    const { name, value } = event.target;

    setIdentityForm((current) => ({
      ...current,
      [name]: value,
    }));

    setIdentityErrors((current) => ({
      ...current,
      [name]: "",
    }));

    setIdentityUpdateError("");
  };

  const validateIdentityForm = () => {
    const errors = {};
    const fullName = identityForm.fullName.trim();

    if (!fullName) {
      errors.fullName = "Họ tên không được để trống.";
    }

    if (isAdmin && !identityForm.roleId) {
      errors.roleId = "Vui lòng chọn vai trò.";
    }

    if (!identityForm.birthday) {
      errors.birthday = "Vui lòng chọn ngày sinh.";
    } else {
      const birthday = new Date(`${identityForm.birthday}T00:00:00`);
      const today = new Date();

      today.setHours(0, 0, 0, 0);

      if (Number.isNaN(birthday.getTime()) || birthday >= today) {
        errors.birthday = "Ngày sinh phải nhỏ hơn ngày hiện tại.";
      }
    }

    if (!["Male", "Female", "Unknown"].includes(identityForm.gender)) {
      errors.gender = "Giới tính không hợp lệ.";
    }

    const normalizedPhone = normalizePhoneInput(identityForm.phone);

    if (phoneProvider?.phone && !normalizedPhone) {
      errors.phone = "Số điện thoại không được để trống.";
    } else if (
      normalizedPhone &&
      !/^(0\d{9}|\+84\d{9}|84\d{9})$/.test(normalizedPhone)
    ) {
      errors.phone = "Số điện thoại không hợp lệ.";
    }

    setIdentityErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleAvatarSelect = (file) => {
    if (!file) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png"];

    if (!allowedTypes.includes(file.type)) {
      setIdentityUpdateError("Chỉ chấp nhận ảnh JPEG hoặc PNG.");
      return;
    }

    const maxFileSize = 5 * 1024 * 1024;

    if (file.size > maxFileSize) {
      setIdentityUpdateError("Ảnh đại diện không được vượt quá 5 MB.");
      return;
    }

    setAvatarFile(file);
    setAvatarDeleted(false);
    setAvatarPreview(URL.createObjectURL(file));
    setIdentityUpdateError("");
  };

  const handleAvatarRemove = () => {
    setAvatarFile(null);
    setAvatarPreview("");
    setAvatarDeleted(Boolean(user.avatar));
    setIdentityUpdateError("");
  };

  const handleIdentitySubmit = async (event) => {
    event.preventDefault();

    if (!canEditUser || identitySubmitting) {
      return;
    }

    if (!validateIdentityForm()) {
      return;
    }

    const initialForm = createIdentityForm(user, phoneProvider?.phone || "");

    const normalizedPhone = normalizePhoneInput(identityForm.phone);

    const initialPhone = normalizePhoneInput(initialForm.phone);

    const phoneChanged = normalizedPhone !== initialPhone;

    const profileChanged =
      identityForm.fullName.trim() !== initialForm.fullName.trim() ||
      identityForm.birthday !== initialForm.birthday ||
      identityForm.gender !== initialForm.gender ||
      phoneChanged;

    const roleChanged =
      isAdmin && Number(identityForm.roleId) !== Number(user.role?.idRole);

    const avatarChanged = Boolean(avatarFile) || avatarDeleted;

    if (!profileChanged && !avatarChanged && !roleChanged) {
      setIdentityUpdateError("Thông tin chưa có thay đổi.");
      return;
    }

    try {
      setIdentitySubmitting(true);
      setIdentityUpdateError("");

      if (profileChanged) {
        await userApi.updateById(user.idUser, {
          fullName: identityForm.fullName.trim(),
          birthday: identityForm.birthday,
          gender: identityForm.gender,
          phone: phoneChanged ? normalizedPhone : null,
        });
      }

      if (avatarDeleted) {
        await userApi.removeAvatarById(user.idUser);
      } else if (avatarFile) {
        await userApi.uploadAvatarById(user.idUser, avatarFile);
      }

      if (roleChanged) {
        await userApi.updateRole(user.idUser, Number(identityForm.roleId));
      }

      if (roleChanged && isCurrentUser) {
        window.location.replace("/login");
        return;
      }

      const refreshedData = await userApi.getById(user.idUser);

      const normalizedUser = normalizeUserDetail(refreshedData);

      setUser(normalizedUser);

      setAvatarFile(null);
      setAvatarPreview(normalizedUser?.avatar || "");
      setAvatarDeleted(false);

      setIdentityEditing(false);
      setIdentityErrors({});

      showNotification(
        "success",
        "Cập nhật thành công",
        "Thông tin danh tính đã được cập nhật.",
      );
    } catch (error) {
      setIdentityUpdateError(
        error.response?.data?.message ||
          "Không thể cập nhật thông tin danh tính.",
      );
    } finally {
      setIdentitySubmitting(false);
    }
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
                      handleStartIdentityEdit();
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
                  identityEditing ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCancelIdentityEdit}
                        disabled={identitySubmitting}
                        className="h-8 rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-text-muted transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Hủy
                      </button>

                      <button
                        type="submit"
                        form="user-identity-inline-form"
                        disabled={identitySubmitting}
                        className="h-8 rounded-lg bg-brand! px-3 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {identitySubmitting ? "Đang lưu..." : "Lưu"}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStartIdentityEdit}
                      disabled={roleLoading}
                      className="rounded-md p-1.5 text-text-subtle transition hover:bg-surface-muted hover:text-text-default disabled:cursor-wait disabled:opacity-50"
                      aria-label="Chỉnh sửa danh tính"
                      title="Chỉnh sửa danh tính"
                    >
                      <Pencil size={14} />
                    </button>
                  )
                ) : null
              }
            >
              <div className="mb-5 flex items-center gap-3">
                <AvatarPicker
                  variant="compact"
                  preview={identityEditing ? avatarPreview : user.avatar || ""}
                  alt={user.fullName || "Người dùng"}
                  initials={getInitials(
                    identityEditing ? identityForm.fullName : user.fullName,
                  )}
                  disabled={!identityEditing || identitySubmitting}
                  removable={Boolean(avatarPreview)}
                  onSelect={handleAvatarSelect}
                  onRemove={handleAvatarRemove}
                />

                <div className="min-w-0">
                  <p className="truncate font-medium text-text-strong">
                    {identityEditing
                      ? identityForm.fullName || "Chưa cập nhật tên"
                      : user.fullName || EMPTY_VALUE}
                  </p>

                  <p className="truncate text-sm text-text-muted">
                    {loginEmailProvider?.email || EMPTY_VALUE}
                  </p>
                </div>
              </div>

              <form
                id="user-identity-inline-form"
                onSubmit={handleIdentitySubmit}
              >
                <AdminDetailInfoRow icon={UserRound} label="Họ tên">
                  {identityEditing ? (
                    <div>
                      <input
                        type="text"
                        name="fullName"
                        value={identityForm.fullName}
                        onChange={handleIdentityChange}
                        disabled={identitySubmitting}
                        placeholder="Nhập họ và tên"
                        autoComplete="name"
                        aria-label="Họ và tên"
                        aria-invalid={Boolean(identityErrors.fullName)}
                        className={`h-9 w-full rounded-lg border bg-surface px-3 text-sm font-medium text-text-default transition outline-none disabled:cursor-not-allowed disabled:bg-surface-muted ${
                          identityErrors.fullName
                            ? "border-danger focus:border-danger focus:ring-3 focus:ring-danger/10"
                            : "border-input focus:border-brand focus:ring-3 focus:ring-brand/10"
                        }`}
                      />

                      {identityErrors.fullName && (
                        <p className="mt-1 text-xs font-normal text-danger">
                          {identityErrors.fullName}
                        </p>
                      )}
                    </div>
                  ) : (
                    user.fullName || EMPTY_VALUE
                  )}
                </AdminDetailInfoRow>

                <AdminDetailInfoRow icon={CalendarDays} label="Ngày sinh">
                  {identityEditing ? (
                    <div>
                      <input
                        type="date"
                        name="birthday"
                        value={identityForm.birthday}
                        onChange={handleIdentityChange}
                        disabled={identitySubmitting}
                        aria-label="Ngày sinh"
                        aria-invalid={Boolean(identityErrors.birthday)}
                        className={`h-9 w-full rounded-lg border bg-surface px-3 text-sm font-medium text-text-default transition outline-none disabled:cursor-not-allowed disabled:bg-surface-muted ${
                          identityErrors.birthday
                            ? "border-danger focus:border-danger focus:ring-3 focus:ring-danger/10"
                            : "border-input focus:border-brand focus:ring-3 focus:ring-brand/10"
                        }`}
                      />

                      {identityErrors.birthday && (
                        <p className="mt-1 text-xs font-normal text-danger">
                          {identityErrors.birthday}
                        </p>
                      )}
                    </div>
                  ) : (
                    formatDate(user.birthday)
                  )}
                </AdminDetailInfoRow>

                <AdminDetailInfoRow icon={UserRound} label="Giới tính">
                  {identityEditing ? (
                    <div>
                      <select
                        name="gender"
                        value={identityForm.gender}
                        onChange={handleIdentityChange}
                        disabled={identitySubmitting}
                        aria-label="Giới tính"
                        aria-invalid={Boolean(identityErrors.gender)}
                        className={`h-9 w-full rounded-lg border bg-surface px-3 text-sm font-medium text-text-default transition outline-none disabled:cursor-not-allowed disabled:bg-surface-muted ${
                          identityErrors.gender
                            ? "border-danger focus:border-danger focus:ring-3 focus:ring-danger/10"
                            : "border-input focus:border-brand focus:ring-3 focus:ring-brand/10"
                        }`}
                      >
                        <option value="Male">Nam</option>
                        <option value="Female">Nữ</option>
                        <option value="Unknown">Không xác định</option>
                      </select>

                      {identityErrors.gender && (
                        <p className="mt-1 text-xs font-normal text-danger">
                          {identityErrors.gender}
                        </p>
                      )}
                    </div>
                  ) : (
                    formatGender(user.gender)
                  )}
                </AdminDetailInfoRow>

                <AdminDetailInfoRow icon={Phone} label="Điện thoại">
                  {identityEditing ? (
                    <div>
                      <input
                        type="tel"
                        name="phone"
                        value={identityForm.phone}
                        onChange={handleIdentityChange}
                        disabled={identitySubmitting}
                        placeholder="Nhập số điện thoại"
                        autoComplete="tel"
                        inputMode="tel"
                        aria-label="Số điện thoại"
                        aria-invalid={Boolean(identityErrors.phone)}
                        className={`h-9 w-full rounded-lg border bg-surface px-3 text-sm font-medium text-text-default transition outline-none disabled:cursor-not-allowed disabled:bg-surface-muted ${
                          identityErrors.phone
                            ? "border-danger focus:border-danger focus:ring-3 focus:ring-danger/10"
                            : "border-input focus:border-brand focus:ring-3 focus:ring-brand/10"
                        }`}
                      />

                      {identityErrors.phone && (
                        <p className="mt-1 text-xs font-normal text-danger">
                          {identityErrors.phone}
                        </p>
                      )}

                      {!identityErrors.phone && (
                        <p className="mt-1 text-xs font-normal text-text-muted">
                          Ví dụ: 0912345678
                        </p>
                      )}
                    </div>
                  ) : (
                    phoneProvider?.phone || EMPTY_VALUE
                  )}
                </AdminDetailInfoRow>

                <AdminDetailInfoRow icon={ShieldCheck} label="Vai trò">
                  {identityEditing && isAdmin ? (
                    <div>
                      <select
                        name="roleId"
                        value={identityForm.roleId}
                        onChange={handleIdentityChange}
                        disabled={identitySubmitting}
                        aria-label="Vai trò"
                        aria-invalid={Boolean(identityErrors.roleId)}
                        className={`h-9 w-full rounded-lg border bg-surface px-3 text-sm font-medium text-text-default transition outline-none disabled:cursor-not-allowed disabled:bg-surface-muted ${
                          identityErrors.roleId
                            ? "border-danger focus:border-danger focus:ring-3 focus:ring-danger/10"
                            : "border-input focus:border-brand focus:ring-3 focus:ring-brand/10"
                        }`}
                      >
                        <option value="" disabled>
                          Chọn vai trò
                        </option>

                        {roles.map((role) => (
                          <option key={role.idRole} value={String(role.idRole)}>
                            {role.nameRole}
                          </option>
                        ))}
                      </select>

                      {identityErrors.roleId && (
                        <p className="mt-1 text-xs font-normal text-danger">
                          {identityErrors.roleId}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="inline-flex rounded-md bg-info-soft px-2 py-1 text-xs font-semibold text-info">
                      {getRoleName(user)}
                    </span>
                  )}
                </AdminDetailInfoRow>

                {identityUpdateError && (
                  <p
                    role="alert"
                    className="mt-2 rounded-lg bg-danger-soft px-3 py-2 text-sm font-normal text-danger"
                  >
                    {identityUpdateError}
                  </p>
                )}
              </form>
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
