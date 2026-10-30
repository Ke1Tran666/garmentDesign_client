import { useEffect, useState } from "react";
import { ArrowLeft, LoaderCircle, ShieldCheck, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { roleApi } from "@/entities/user/api/roleApi";
import { userApi } from "@/entities/user/api/userApi";
import { useNotification } from "@/app/providers/NotificationProvider";
import FormInput from "@/shared/ui/input/FormInput";
import PageHeading from "@/shared/ui/heading/PageHeading";
import FormSelect from "@/shared/ui/select/FormSelect";

const EMPTY_FORM = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
  birthday: "",
  gender: "Unknown",
  roleId: "",
};

const UserCreatePage = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [form, setForm] = useState(() => ({ ...EMPTY_FORM }));
  const [roles, setRoles] = useState([]);
  const [errors, setErrors] = useState({});

  const [rolesLoading, setRolesLoading] = useState(true);
  const [roleError, setRoleError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    roleApi
      .getAll()
      .then((data) => {
        if (!active) return;

        setRoles(Array.isArray(data) ? data : []);
        setRoleError("");
      })
      .catch((error) => {
        if (!active) return;

        setRoles([]);
        setRoleError(
          error.response?.data?.message || "Không thể tải danh sách vai trò.",
        );
      })
      .finally(() => {
        if (active) {
          setRolesLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

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

    setSubmitError("");
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.fullName.trim()) {
      nextErrors.fullName = "Họ và tên không được để trống.";
    } else if (form.fullName.trim().length > 100) {
      nextErrors.fullName = "Họ và tên không được vượt quá 100 ký tự.";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Email không được để trống.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = "Email không hợp lệ.";
    }

    if (!form.password) {
      nextErrors.password = "Mật khẩu không được để trống.";
    } else if (form.password.length < 8) {
      nextErrors.password = "Mật khẩu phải có ít nhất 8 ký tự.";
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword = "Vui lòng xác nhận mật khẩu.";
    } else if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";
    }

    if (!form.birthday) {
      nextErrors.birthday = "Ngày sinh không được để trống.";
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

    const normalizedPhone = form.phone
      .trim()
      .replaceAll(" ", "")
      .replaceAll("-", "")
      .replaceAll(".", "");

    if (
      normalizedPhone &&
      !/^(0\d{9}|\+84\d{9}|84\d{9})$/.test(normalizedPhone)
    ) {
      nextErrors.phone = "Số điện thoại không hợp lệ.";
    }

    if (!form.roleId) {
      nextErrors.roleId = "Vui lòng chọn vai trò.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting || rolesLoading || !validate()) return;

    try {
      setSubmitting(true);
      setSubmitError("");

      const createdUser = await userApi.create({
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: form.phone.trim() || null,
        birthday: form.birthday,
        gender: form.gender,
        roleId: Number(form.roleId),
      });

      showNotification(
        "success",
        "Đã thêm người dùng",
        `Tài khoản ${
          createdUser.fullName || createdUser.userCode
        } đã được tạo.`,
      );

      navigate(`/admin/users/${createdUser.idUser}`, {
        replace: true,
      });
    } catch (error) {
      setSubmitError(
        error.response?.data?.message || "Không thể thêm người dùng.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (submitting) return;

    navigate("/admin/users");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <button
        type="button"
        onClick={handleCancel}
        disabled={submitting}
        className="inline-flex items-center gap-2 text-sm font-semibold text-text-muted transition hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ArrowLeft size={18} />
        Quay lại Người dùng
      </button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeading
          title="Thêm người dùng"
          description="Tạo tài khoản mới và phân quyền cho người dùng."
        />

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand">
          <UserPlus size={21} />
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-sm"
      >
        <div className="border-b border-border-subtle px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
              <ShieldCheck size={20} />
            </div>

            <div>
              <h2 className="font-bold text-text-strong">
                Thông tin tài khoản
              </h2>

              <p className="mt-0.5 text-sm text-text-muted">
                Thông tin đăng nhập, hồ sơ và vai trò trong hệ thống.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 px-5 py-6 sm:px-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormInput
              name="fullName"
              label="Họ và tên"
              value={form.fullName}
              onChange={handleChange}
              error={errors.fullName}
              placeholder="Nhập họ và tên"
              disabled={submitting}
              autoFocus
            />

            <FormInput
              name="email"
              label="Email"
              type="email"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="example@gmail.com"
              disabled={submitting}
              autoComplete="off"
            />

            <FormInput
              name="password"
              label="Mật khẩu"
              type="password"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              hint="Mật khẩu phải có ít nhất 8 ký tự."
              placeholder="Nhập mật khẩu"
              disabled={submitting}
              autoComplete="new-password"
            />

            <FormInput
              name="confirmPassword"
              label="Xác nhận mật khẩu"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              placeholder="Nhập lại mật khẩu"
              disabled={submitting}
              autoComplete="new-password"
            />

            <FormInput
              name="birthday"
              label="Ngày sinh"
              type="date"
              value={form.birthday}
              onChange={handleChange}
              error={errors.birthday}
              disabled={submitting}
            />

            <FormInput
              name="phone"
              label="Số điện thoại"
              value={form.phone}
              onChange={handleChange}
              error={errors.phone}
              hint="Thông tin này không bắt buộc."
              placeholder="Ví dụ: 0912345678"
              disabled={submitting}
              inputMode="tel"
            />

            <FormSelect
              name="gender"
              label="Giới tính"
              value={form.gender}
              onChange={handleChange}
              error={errors.gender}
              disabled={submitting}
              options={[
                {
                  value: "Unknown",
                  label: "Không xác định",
                },
                {
                  value: "Male",
                  label: "Nam",
                },
                {
                  value: "Female",
                  label: "Nữ",
                },
              ]}
            />

            <FormSelect
              name="roleId"
              label="Vai trò"
              value={form.roleId}
              onChange={handleChange}
              error={errors.roleId}
              required
              disabled={submitting || rolesLoading || Boolean(roleError)}
              placeholder={
                rolesLoading ? "Đang tải vai trò..." : "Chọn vai trò"
              }
              options={roles.map((role) => ({
                value: role.idRole,
                label: role.nameRole,
              }))}
            />
          </div>

          {(roleError || submitError) && (
            <p
              role="alert"
              className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger"
            >
              {roleError || submitError}
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-border-subtle px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={handleCancel}
            disabled={submitting}
            className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-text-muted transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Hủy
          </button>

          <button
            type="submit"
            disabled={
              submitting ||
              rolesLoading ||
              Boolean(roleError) ||
              roles.length === 0
            }
            className="inline-flex min-w-40 items-center justify-center gap-2 rounded-xl bg-brand! px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <LoaderCircle size={18} className="animate-spin" />
            ) : (
              <UserPlus size={18} />
            )}

            {submitting ? "Đang tạo..." : "Thêm người dùng"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserCreatePage;
