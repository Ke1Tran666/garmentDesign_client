import { useEffect, useMemo, useState } from "react";
import { ShieldCheck, UserRound } from "lucide-react";

import defaultAvatar from "@/shared/assets/images/avatar-default.jpg";
import FormInput from "@/shared/ui/input/FormInput";
import FormModal from "@/shared/ui/modal/FormModal";
import AvatarPicker from "@/shared/ui/upload/AvatarPicker";
import FilterSelect from "@/shared/ui/select/FilterSelect";

const createInitialForm = (user) => ({
  fullName: user?.fullName || "",
  birthday: user?.birthday || "",
  gender: user?.gender || "Unknown",
  roleId: String(user?.role?.idRole || ""),
});

const UserIdentityEditModal = ({
  user,
  roles = [],
  canAssignRole = false,
  submitting = false,
  errorMessage = "",
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState(() => createInitialForm(user));

  const [fieldErrors, setFieldErrors] = useState({});
  const [validationError, setValidationError] = useState("");

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(() => user?.avatar || "");
  const [avatarDeleted, setAvatarDeleted] = useState(false);

  const initialForm = useMemo(() => createInitialForm(user), [user]);

  const hasChanges = useMemo(() => {
    return (
      form.fullName.trim() !== initialForm.fullName.trim() ||
      form.birthday !== initialForm.birthday ||
      form.gender !== initialForm.gender ||
      form.roleId !== initialForm.roleId ||
      Boolean(avatarFile) ||
      avatarDeleted
    );
  }, [form, initialForm, avatarFile, avatarDeleted]);

  const roleOptions = useMemo(
    () => [
      {
        value: "",
        label: "Chọn vai trò",
        disabled: true,
      },
      ...roles.map((role) => ({
        value: String(role.idRole),
        label: role.nameRole,
      })),
    ],
    [roles],
  );

  useEffect(() => {
    return () => {
      if (avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  if (!user) return null;

  const clearFieldError = (name) => {
    setFieldErrors((current) => ({
      ...current,
      [name]: "",
    }));

    setValidationError("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    clearFieldError(name);
  };

  const handleAvatarUpload = (file) => {
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png"];

    if (!allowedTypes.includes(file.type)) {
      setValidationError("Chỉ chấp nhận ảnh JPEG hoặc PNG.");
      return;
    }

    const maxFileSize = 5 * 1024 * 1024;

    if (file.size > maxFileSize) {
      setValidationError("Ảnh đại diện không được vượt quá 5 MB.");
      return;
    }

    if (avatarPreview.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatarFile(file);
    setAvatarDeleted(false);
    setAvatarPreview(URL.createObjectURL(file));
    setValidationError("");
  };

  const handleAvatarDelete = () => {
    if (avatarPreview.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatarFile(null);
    setAvatarPreview("");
    setAvatarDeleted(Boolean(user.avatar));
    setValidationError("");
  };

  const validate = () => {
    const errors = {};
    const fullName = form.fullName.trim();

    if (!fullName) {
      errors.fullName = "Họ tên không được để trống.";
    }

    if (!form.birthday) {
      errors.birthday = "Vui lòng chọn ngày sinh.";
    } else {
      const birthday = new Date(`${form.birthday}T00:00:00`);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (Number.isNaN(birthday.getTime()) || birthday >= today) {
        errors.birthday = "Ngày sinh phải nhỏ hơn ngày hiện tại.";
      }
    }

    if (canAssignRole && !form.roleId) {
      errors.roleId = "Vui lòng chọn vai trò.";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!hasChanges) {
      setValidationError("Thông tin chưa có thay đổi.");
      return;
    }

    if (!validate()) {
      return;
    }

    onSubmit?.({
      fullName: form.fullName.trim(),
      birthday: form.birthday,
      gender: form.gender,

      /*
       * Staff không thể thay đổi vai trò.
       * Parent cũng cần kiểm tra lại.
       */
      roleId: canAssignRole ? Number(form.roleId) : undefined,

      avatarFile,
      avatarDeleted,
    });
  };

  return (
    <FormModal
      open
      title="Chỉnh sửa người dùng"
      description={`Cập nhật thông tin của ${
        user.fullName || user.userCode || user.idUser
      }.`}
      submitting={submitting}
      errorMessage={validationError || errorMessage}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitText="Lưu thay đổi"
      loadingText="Đang lưu..."
      cancelText="Hủy"
      maxWidthClassName="max-w-3xl"
    >
      <div className="space-y-6">
        {/* Profile compact */}
        <AvatarPicker
          preview={avatarPreview}
          fallback={defaultAvatar}
          alt={user.fullName || "Người dùng"}
          title={form.fullName || "Chưa cập nhật tên"}
          code={user.userCode || user.idUser}
          disabled={submitting}
          removable={Boolean(avatarPreview || user.avatar)}
          onSelect={handleAvatarUpload}
          onRemove={handleAvatarDelete}
        />

        {/* Thông tin cá nhân */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <UserRound size={17} className="text-brand" />

            <h3 className="text-sm font-bold text-text-strong">
              Thông tin cá nhân
            </h3>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormInput
              id="edit-full-name"
              label="Họ và tên"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              disabled={submitting}
              error={fieldErrors.fullName}
              placeholder="Nhập họ và tên"
              autoComplete="name"
              containerClassName="sm:col-span-2"
            />

            <FormInput
              id="edit-birthday"
              label="Ngày sinh"
              type="date"
              name="birthday"
              value={form.birthday}
              onChange={handleChange}
              disabled={submitting}
              error={fieldErrors.birthday}
            />

            <div>
              <label
                htmlFor="edit-gender"
                className="mb-2 block text-sm font-semibold text-text-default"
              >
                Giới tính
              </label>

              <select
                id="edit-gender"
                name="gender"
                value={form.gender}
                onChange={handleChange}
                disabled={submitting}
                className="h-11 w-full rounded-xl border border-input bg-surface px-4 text-sm text-text-default transition outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 disabled:cursor-not-allowed disabled:bg-surface-muted"
              >
                <option value="Male">Nam</option>

                <option value="Female">Nữ</option>

                <option value="Unknown">Không xác định</option>
              </select>
            </div>
          </div>
        </section>

        {/* Phân quyền */}
        <section className="rounded-2xl border border-border-subtle p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-info-soft text-info">
              <ShieldCheck size={18} />
            </span>

            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-text-strong">
                Vai trò và quyền truy cập
              </h3>

              <p className="mt-1 text-xs leading-5 text-text-muted">
                Chỉ quản trị viên mới có thể thay đổi vai trò của người dùng.
              </p>

              <div className="mt-4">
                <label
                  htmlFor="edit-role"
                  className="mb-2 block text-sm font-semibold text-text-default"
                >
                  Vai trò
                </label>

                {canAssignRole ? (
                  <>
                    <FilterSelect
                      value={form.roleId}
                      options={roleOptions}
                      disabled={submitting}
                      ariaLabel="Chọn vai trò người dùng"
                      onValueChange={(value) => {
                        setForm((current) => ({
                          ...current,
                          roleId: value,
                        }));

                        clearFieldError("roleId");
                      }}
                      className={fieldErrors.roleId ? "border-danger" : ""}
                    />

                    {fieldErrors.roleId && (
                      <p className="mt-1.5 text-xs text-danger">
                        {fieldErrors.roleId}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="flex h-11 items-center justify-between rounded-xl border border-border bg-surface-muted px-4">
                    <span className="text-sm font-medium text-text-default">
                      {user.role?.nameRole || "Chưa phân quyền"}
                    </span>

                    <span className="text-xs font-semibold text-text-muted">
                      Chỉ xem
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </FormModal>
  );
};

export default UserIdentityEditModal;
