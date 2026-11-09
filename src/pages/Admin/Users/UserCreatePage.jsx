import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  LoaderCircle,
  Lock,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
  UserPlus,
  UserRound,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useNotification } from "@/app/providers/NotificationProvider";
import { roleApi } from "@/entities/user/api/roleApi";
import { userApi } from "@/entities/user/api/userApi";
import {
  UserCreatePreviewCard,
  getInitials,
  getPasswordStrength,
} from "@/features/user-management";
import Select from "@/shared/ui/select/Select";
import AvatarPicker from "@/shared/ui/upload/AvatarPicker";

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

const GENDER_OPTIONS = [
  { value: "Male", label: "Nam" },
  { value: "Female", label: "Nữ" },
  { value: "Unknown", label: "Chưa xác định" },
];

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png"];

const getInputClassName = (hasError) =>
  `h-10 w-full rounded-xl border px-3.5 text-xs text-slate-800 transition-all placeholder:text-slate-400 focus:outline-hidden dark:bg-slate-800/60 dark:text-slate-100 ${
    hasError
      ? "border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
      : "border-slate-200 bg-slate-50/50 focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/10 dark:border-slate-700"
  }`;

const UserCreatePage = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [form, setForm] = useState(() => ({ ...EMPTY_FORM }));
  const [roles, setRoles] = useState([]);
  const [errors, setErrors] = useState({});

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  const [rolesLoading, setRolesLoading] = useState(true);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    return () => {
      if (avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  useEffect(() => {
    let active = true;
    roleApi
      .getAll()
      .then((data) => {
        if (!active) return;
        const roleList = Array.isArray(data) ? data : [];
        setRoles(roleList);
        if (roleList.length > 0) {
          const defaultRole =
            roleList.find((r) => r.nameRole?.toLowerCase().includes("user")) ||
            roleList[0];
          setForm((prev) =>
            prev.roleId
              ? prev
              : { ...prev, roleId: String(defaultRole.idRole) },
          );
        }
      })
      .catch(() => {
        if (!active) return;
        setRoles([]);
      })
      .finally(() => {
        if (active) setRolesLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSubmitError("");
  };

  const handleAvatarSelect = (file) => {
    if (!file) return;

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        avatar: "Chỉ chấp nhận ảnh JPEG hoặc PNG.",
      }));
      return;
    }

    if (file.size > MAX_AVATAR_BYTES) {
      setErrors((prev) => ({
        ...prev,
        avatar: "Ảnh đại diện không được vượt quá 5 MB.",
      }));
      return;
    }

    if (avatarPreview.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, avatar: "" }));
    setSubmitError("");
  };

  const handleAvatarRemove = () => {
    if (avatarPreview.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatarFile(null);
    setAvatarPreview("");
    setErrors((prev) => ({ ...prev, avatar: "" }));
  };

  const selectedRole = useMemo(() => {
    return roles.find((r) => String(r.idRole) === String(form.roleId));
  }, [roles, form.roleId]);

  const passwordStrength = useMemo(
    () => getPasswordStrength(form.password),
    [form.password],
  );

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

    if (form.phone.trim()) {
      const normalizedPhone = form.phone
        .trim()
        .replaceAll(" ", "")
        .replaceAll("-", "")
        .replaceAll(".", "");
      if (!/^(0\d{9}|\+84\d{9}|84\d{9})$/.test(normalizedPhone)) {
        nextErrors.phone = "Số điện thoại không đúng định dạng.";
      }
    }

    if (!form.roleId) {
      nextErrors.roleId = "Vui lòng chọn vai trò cho tài khoản.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

      let avatarWarning = "";
      if (avatarFile && createdUser?.idUser) {
        try {
          await userApi.uploadAvatarById(createdUser.idUser, avatarFile);
        } catch (avatarError) {
          avatarWarning =
            avatarError.response?.data?.message ||
            "Tài khoản đã được tạo nhưng chưa thể tải ảnh đại diện lên. Bạn có thể cập nhật lại trong trang chi tiết.";
        }
      }

      if (avatarWarning) {
        showNotification({
          type: "warning",
          title: "Đã tạo tài khoản, ảnh đại diện chưa lưu",
          message: avatarWarning,
        });
      } else {
        showNotification({
          type: "success",
          title: "Tạo tài khoản thành công",
          message: `Đã tạo tài khoản cho ${createdUser.fullName || form.fullName}.`,
        });
      }

      navigate(`/admin/users/${createdUser.idUser}`, { replace: true });
    } catch (error) {
      setSubmitError(
        error.response?.data?.message ||
          "Không thể tạo người dùng. Vui lòng kiểm tra lại thông tin.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl animate-in space-y-6 duration-200 fade-in">
      {/* Header with back navigation */}
      <div className="flex items-center gap-3 border-b border-slate-200/60 pb-3 dark:border-slate-800">
        <Link
          to="/admin/users"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-2xs transition-colors hover:border-brand/40 hover:text-brand dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          title="Quay lại danh sách"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Thêm tài khoản người dùng
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Khởi tạo người dùng mới hoặc gán quyền nhân sự trực tiếp vào hệ
            thống.
          </p>
        </div>
      </div>

      {submitError && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-400">
          <ShieldAlert size={16} className="shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Main 2-Column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Form */}
        <form onSubmit={handleSubmit} className="space-y-6 lg:col-span-2">
          {/* Card 1: Thông tin cá nhân */}
          <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-brand dark:bg-blue-950/50">
                <User size={18} />
              </div>
              <h2 className="font-heading text-sm font-bold text-slate-900 dark:text-white">
                1. Thông tin cá nhân & Liên hệ
              </h2>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Ảnh đại diện{" "}
                <span className="font-normal text-slate-400">
                  (Không bắt buộc)
                </span>
              </label>
              <AvatarPicker
                variant="card"
                preview={avatarPreview}
                alt={form.fullName.trim() || "Ảnh đại diện tài khoản"}
                title={form.fullName.trim() || "Ảnh đại diện tài khoản"}
                hint="JPEG hoặc PNG, tối đa 5 MB. Có thể bỏ qua hoặc cập nhật sau."
                initials={getInitials(form.fullName, "U")}
                disabled={submitting}
                removable={Boolean(avatarFile)}
                onSelect={handleAvatarSelect}
                onRemove={handleAvatarRemove}
              />
              {errors.avatar && (
                <p className="mt-1.5 text-[11px] text-rose-600">
                  {errors.avatar}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Họ và tên <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  className={getInputClassName(Boolean(errors.fullName))}
                />
                {errors.fullName && (
                  <p className="mt-1 text-[11px] text-rose-600">
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Địa chỉ Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="user@garment.vn"
                  className={getInputClassName(Boolean(errors.email))}
                />
                {errors.email && (
                  <p className="mt-1 text-[11px] text-rose-600">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="0912 345 678"
                  className={getInputClassName(Boolean(errors.phone))}
                />
                {errors.phone && (
                  <p className="mt-1 text-[11px] text-rose-600">
                    {errors.phone}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Ngày sinh <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  name="birthday"
                  value={form.birthday}
                  onChange={handleChange}
                  className={getInputClassName(Boolean(errors.birthday))}
                />
                {errors.birthday && (
                  <p className="mt-1 text-[11px] text-rose-600">
                    {errors.birthday}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Giới tính
                </label>
                <Select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  options={GENDER_OPTIONS}
                  ariaLabel="Giới tính"
                  size="filter"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Vai trò & Phân quyền */}
          <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50">
                <ShieldCheck size={18} />
              </div>
              <h2 className="font-heading text-sm font-bold text-slate-900 dark:text-white">
                2. Phân quyền vai trò hệ thống
              </h2>
            </div>

            {rolesLoading ? (
              <div className="py-4 text-center text-xs text-slate-400">
                <LoaderCircle
                  size={20}
                  className="mx-auto mb-1 animate-spin text-brand"
                />
                Đang nạp danh mục vai trò...
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {roles.map((r) => {
                  const isChecked = String(form.roleId) === String(r.idRole);
                  const isAdm = r.nameRole?.toLowerCase().includes("admin");
                  const isStaff = r.nameRole?.toLowerCase().includes("staff");
                  return (
                    <label
                      key={r.idRole}
                      className={`relative flex cursor-pointer flex-col rounded-2xl border p-4 transition-all ${
                        isChecked
                          ? "border-brand bg-brand/5 shadow-xs dark:bg-brand/15"
                          : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
                      }`}
                    >
                      <input
                        type="radio"
                        name="roleId"
                        value={r.idRole}
                        checked={isChecked}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="mb-2 flex items-center justify-between">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                            isAdm
                              ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                              : isStaff
                                ? "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300"
                                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {isAdm ? (
                            <ShieldCheck size={17} />
                          ) : isStaff ? (
                            <Shield size={17} />
                          ) : (
                            <UserRound size={17} />
                          )}
                        </div>
                        {isChecked && (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-white">
                            <Check size={12} className="stroke-3" />
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {r.nameRole}
                      </span>
                      <span className="mt-1 line-clamp-2 text-[11px] text-slate-500 dark:text-slate-400">
                        {r.descriptionRole ||
                          "Quyền hạn tài khoản trong hệ thống"}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
            {errors.roleId && (
              <p className="text-[11px] text-rose-600">{errors.roleId}</p>
            )}
          </div>

          {/* Card 3: Mật khẩu khởi tạo */}
          <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50">
                <Lock size={18} />
              </div>
              <h2 className="font-heading text-sm font-bold text-slate-900 dark:text-white">
                3. Mật khẩu khởi tạo
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Mật khẩu <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Tối thiểu 8 ký tự"
                    className={`${getInputClassName(Boolean(errors.password))} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-[11px] text-rose-600">
                    {errors.password}
                  </p>
                )}

                {form.password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">Độ an toàn:</span>
                      <span className={`font-bold ${passwordStrength.text}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="flex h-1.5 w-full gap-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className={`h-full flex-1 rounded-full ${
                          passwordStrength.score >= 1
                            ? passwordStrength.color
                            : "bg-slate-200"
                        }`}
                      />
                      <div
                        className={`h-full flex-1 rounded-full ${
                          passwordStrength.score >= 2
                            ? passwordStrength.color
                            : "bg-slate-200"
                        }`}
                      />
                      <div
                        className={`h-full flex-1 rounded-full ${
                          passwordStrength.score >= 3
                            ? passwordStrength.color
                            : "bg-slate-200"
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Xác nhận mật khẩu <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Nhập lại mật khẩu"
                    className={`${getInputClassName(Boolean(errors.confirmPassword))} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={15} />
                    ) : (
                      <Eye size={15} />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-[11px] text-rose-600">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              to="/admin/users"
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Hủy bỏ
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand! px-6 py-2.5 text-xs font-semibold text-white! shadow-xs transition-colors hover:bg-brand-hover! disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <LoaderCircle size={15} className="animate-spin" />
                  Đang khởi tạo...
                </>
              ) : (
                <>
                  <UserPlus size={15} />
                  Khởi tạo tài khoản
                </>
              )}
            </button>
          </div>
        </form>

        {/* Right Column: Live Profile Preview Card */}
        <UserCreatePreviewCard
          avatar={avatarPreview}
          fullName={form.fullName}
          email={form.email}
          phone={form.phone}
          birthday={form.birthday}
          gender={form.gender}
          selectedRole={selectedRole}
        />
      </div>
    </div>
  );
};

export default UserCreatePage;
