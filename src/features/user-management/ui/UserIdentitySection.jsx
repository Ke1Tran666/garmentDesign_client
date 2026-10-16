import { useEffect, useState } from "react";
import {
  CalendarDays,
  Pencil,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { useNotification } from "@/app/providers/NotificationProvider";
import { roleApi } from "@/entities/user/api/roleApi";
import { userApi } from "@/entities/user/api/userApi";
import {
  AdminDetailInfoRow,
  AdminDetailSection,
} from "@/shared/ui/admin-detail/AdminDetailLayout";
import AvatarPicker from "@/shared/ui/upload/AvatarPicker";

import {
  EMPTY_VALUE,
  formatDate,
  formatGender,
  getInitials,
  getRoleName,
  normalizeUserDetail,
} from "../lib/userDetail";
import Select from "@/shared/ui/select/Select";

const createIdentityForm = (user, phone = "") => ({
  fullName: user?.fullName || "",
  birthday: user?.birthday ? String(user.birthday).slice(0, 10) : "",
  gender: user?.gender || "Unknown",
  phone,
  roleId: String(user?.role?.idRole || ""),
});

const normalizePhoneInput = (value) =>
  String(value || "")
    .trim()
    .replace(/[\s.-]/g, "");

const getControlClassName = (hasError) =>
  `h-9 w-full rounded-lg border bg-surface px-3 text-sm font-medium text-text-default transition outline-none disabled:cursor-not-allowed disabled:bg-surface-muted ${
    hasError
      ? "border-danger focus:border-danger focus:ring-3 focus:ring-danger/10"
      : "border-input focus:border-brand focus:ring-3 focus:ring-brand/10"
  }`;

const EditableValue = ({ editing, value, error, hint = "", children }) => {
  if (!editing) {
    return value || EMPTY_VALUE;
  }

  return (
    <div>
      {children}

      {error ? (
        <p className="mt-1 text-xs font-normal text-danger">{error}</p>
      ) : (
        hint && (
          <p className="mt-1 text-xs font-normal text-text-muted">{hint}</p>
        )
      )}
    </div>
  );
};

const UserIdentitySection = ({
  user,
  phoneProvider,
  email,
  isAdmin,
  isCurrentUser,
  canEditUser,
  onUserChange,
}) => {
  const { showNotification } = useNotification();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(() =>
    createIdentityForm(user, phoneProvider?.phone),
  );
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [updateError, setUpdateError] = useState("");

  const [roles, setRoles] = useState([]);
  const [roleLoading, setRoleLoading] = useState(false);

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");
  const [avatarDeleted, setAvatarDeleted] = useState(false);

  useEffect(() => {
    return () => {
      if (avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const resetEditor = () => {
    setForm(createIdentityForm(user, phoneProvider?.phone || ""));
    setErrors({});
    setUpdateError("");
    setAvatarFile(null);
    setAvatarPreview(user.avatar || "");
    setAvatarDeleted(false);
  };

  const handleStartEdit = async () => {
    if (!canEditUser || user.deletedAt || roleLoading) return;

    setUpdateError("");

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

    resetEditor();
    setEditing(true);
  };

  const handleCancel = () => {
    if (submitting) return;

    resetEditor();
    setEditing(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));

    setUpdateError("");
  };

  const validate = () => {
    const nextErrors = {};
    const fullName = form.fullName.trim();

    if (!fullName) {
      nextErrors.fullName = "Họ tên không được để trống.";
    }

    if (isAdmin && !form.roleId) {
      nextErrors.roleId = "Vui lòng chọn vai trò.";
    }

    if (!form.birthday) {
      nextErrors.birthday = "Vui lòng chọn ngày sinh.";
    } else {
      const birthday = new Date(`${form.birthday}T00:00:00`);
      const today = new Date();

      today.setHours(0, 0, 0, 0);

      if (Number.isNaN(birthday.getTime()) || birthday >= today) {
        nextErrors.birthday = "Ngày sinh phải nhỏ hơn ngày hiện tại.";
      }
    }

    if (!["Male", "Female", "Unknown"].includes(form.gender)) {
      nextErrors.gender = "Giới tính không hợp lệ.";
    }

    const normalizedPhone = normalizePhoneInput(form.phone);

    if (phoneProvider?.phone && !normalizedPhone) {
      nextErrors.phone = "Số điện thoại không được để trống.";
    } else if (
      normalizedPhone &&
      !/^(0\d{9}|\+84\d{9}|84\d{9})$/.test(normalizedPhone)
    ) {
      nextErrors.phone = "Số điện thoại không hợp lệ.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleAvatarSelect = (file) => {
    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setUpdateError("Chỉ chấp nhận ảnh JPEG hoặc PNG.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUpdateError("Ảnh đại diện không được vượt quá 5 MB.");
      return;
    }

    if (avatarPreview.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatarFile(file);
    setAvatarDeleted(false);
    setAvatarPreview(URL.createObjectURL(file));
    setUpdateError("");
  };

  const handleAvatarRemove = () => {
    if (avatarPreview.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatarFile(null);
    setAvatarPreview("");
    setAvatarDeleted(Boolean(user.avatar));
    setUpdateError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canEditUser || submitting || !validate()) return;

    const initialForm = createIdentityForm(user, phoneProvider?.phone || "");

    const normalizedPhone = normalizePhoneInput(form.phone);
    const initialPhone = normalizePhoneInput(initialForm.phone);
    const phoneChanged = normalizedPhone !== initialPhone;

    const profileChanged =
      form.fullName.trim() !== initialForm.fullName.trim() ||
      form.birthday !== initialForm.birthday ||
      form.gender !== initialForm.gender ||
      phoneChanged;

    const roleChanged =
      isAdmin && Number(form.roleId) !== Number(user.role?.idRole);

    const avatarChanged = Boolean(avatarFile) || avatarDeleted;

    if (!profileChanged && !roleChanged && !avatarChanged) {
      setUpdateError("Thông tin chưa có thay đổi.");
      return;
    }

    try {
      setSubmitting(true);
      setUpdateError("");

      if (profileChanged) {
        await userApi.updateById(user.idUser, {
          fullName: form.fullName.trim(),
          birthday: form.birthday,
          gender: form.gender,
          phone: phoneChanged ? normalizedPhone : null,
        });
      }

      if (avatarDeleted) {
        await userApi.removeAvatarById(user.idUser);
      } else if (avatarFile) {
        await userApi.uploadAvatarById(user.idUser, avatarFile);
      }

      if (roleChanged) {
        await userApi.updateRole(user.idUser, Number(form.roleId));
      }

      if (roleChanged && isCurrentUser) {
        window.location.replace("/login");
        return;
      }

      const refreshedData = await userApi.getById(user.idUser);
      const refreshedUser = normalizeUserDetail(refreshedData);

      onUserChange(refreshedUser);
      setEditing(false);
      setErrors({});
      setAvatarFile(null);
      setAvatarPreview(refreshedUser?.avatar || "");
      setAvatarDeleted(false);

      showNotification(
        "success",
        "Cập nhật thành công",
        "Thông tin danh tính đã được cập nhật.",
      );
    } catch (error) {
      setUpdateError(
        error.response?.data?.message ||
          "Không thể cập nhật thông tin danh tính.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminDetailSection
      title="Danh tính"
      action={
        canEditUser && !user.deletedAt ? (
          editing ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={submitting}
                className="h-8 rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-text-muted transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                Hủy
              </button>

              <button
                type="submit"
                form="user-identity-inline-form"
                disabled={submitting}
                className="h-8 rounded-lg bg-brand! px-3 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleStartEdit}
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
          preview={editing ? avatarPreview : user.avatar || ""}
          alt={user.fullName || "Người dùng"}
          initials={getInitials(editing ? form.fullName : user.fullName)}
          disabled={!editing || submitting}
          removable={Boolean(avatarPreview)}
          onSelect={handleAvatarSelect}
          onRemove={handleAvatarRemove}
        />

        <div className="min-w-0">
          <p className="truncate font-medium text-text-strong">
            {editing
              ? form.fullName || "Chưa cập nhật tên"
              : user.fullName || EMPTY_VALUE}
          </p>

          <p className="truncate text-sm text-text-muted">
            {email || EMPTY_VALUE}
          </p>
        </div>
      </div>

      <form id="user-identity-inline-form" onSubmit={handleSubmit}>
        <AdminDetailInfoRow icon={UserRound} label="Họ tên">
          <EditableValue
            editing={editing}
            value={user.fullName}
            error={errors.fullName}
          >
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              disabled={submitting}
              placeholder="Nhập họ và tên"
              autoComplete="name"
              aria-label="Họ và tên"
              aria-invalid={Boolean(errors.fullName)}
              className={getControlClassName(Boolean(errors.fullName))}
            />
          </EditableValue>
        </AdminDetailInfoRow>

        <AdminDetailInfoRow icon={CalendarDays} label="Ngày sinh">
          <EditableValue
            editing={editing}
            value={formatDate(user.birthday)}
            error={errors.birthday}
          >
            <input
              type="date"
              name="birthday"
              value={form.birthday}
              onChange={handleChange}
              disabled={submitting}
              aria-label="Ngày sinh"
              aria-invalid={Boolean(errors.birthday)}
              className={getControlClassName(Boolean(errors.birthday))}
            />
          </EditableValue>
        </AdminDetailInfoRow>

        <AdminDetailInfoRow icon={UserRound} label="Giới tính">
          <EditableValue
            editing={editing}
            value={formatGender(user.gender)}
            error={errors.gender}
          >
            <Select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              disabled={submitting}
              ariaLabel="Giới tính"
              error={Boolean(errors.gender)}
              size="sm"
              options={[
                {
                  value: "Male",
                  label: "Nam",
                },
                {
                  value: "Female",
                  label: "Nữ",
                },
                {
                  value: "Unknown",
                  label: "Không xác định",
                },
              ]}
            />
          </EditableValue>
        </AdminDetailInfoRow>

        <AdminDetailInfoRow icon={Phone} label="Điện thoại">
          <EditableValue
            editing={editing}
            value={phoneProvider?.phone}
            error={errors.phone}
            hint="Ví dụ: 0912345678"
          >
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              disabled={submitting}
              placeholder="Nhập số điện thoại"
              autoComplete="tel"
              inputMode="tel"
              aria-label="Số điện thoại"
              aria-invalid={Boolean(errors.phone)}
              className={getControlClassName(Boolean(errors.phone))}
            />
          </EditableValue>
        </AdminDetailInfoRow>

        <AdminDetailInfoRow icon={ShieldCheck} label="Vai trò">
          {editing && isAdmin ? (
            <EditableValue editing error={errors.roleId}>
              <Select
                name="roleId"
                value={form.roleId}
                onChange={handleChange}
                disabled={submitting}
                ariaLabel="Vai trò"
                error={Boolean(errors.roleId)}
                placeholder="Chọn vai trò"
                size="sm"
                options={roles.map((role) => ({
                  value: role.idRole,
                  label: role.nameRole,
                }))}
              />
            </EditableValue>
          ) : (
            <span className="inline-flex rounded-md bg-info-soft px-2 py-1 text-xs font-semibold text-info">
              {getRoleName(user)}
            </span>
          )}
        </AdminDetailInfoRow>

        {updateError && (
          <p
            role="alert"
            className="mt-2 rounded-lg bg-danger-soft px-3 py-2 text-sm font-normal text-danger"
          >
            {updateError}
          </p>
        )}
      </form>
    </AdminDetailSection>
  );
};

export default UserIdentitySection;
