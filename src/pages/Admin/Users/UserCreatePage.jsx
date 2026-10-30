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
  Sparkles,
  User,
  UserPlus,
  UserRound,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { roleApi } from "@/entities/user/api/roleApi";
import { userApi } from "@/entities/user/api/userApi";
import { useNotification } from "@/app/providers/NotificationProvider";

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

const getPasswordStrength = (pwd) => {
  if (!pwd) return { score: 0, label: "Chưa nhập", color: "bg-slate-200" };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  if (score <= 1) return { score: 1, label: "Yếu", color: "bg-rose-500", text: "text-rose-600" };
  if (score <= 3) return { score: 2, label: "Trung bình", color: "bg-amber-500", text: "text-amber-600" };
  return { score: 3, label: "Mạnh", color: "bg-emerald-500", text: "text-emerald-600" };
};

const UserCreatePage = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [form, setForm] = useState(() => ({ ...EMPTY_FORM }));
  const [roles, setRoles] = useState([]);
  const [errors, setErrors] = useState({});

  const [rolesLoading, setRolesLoading] = useState(true);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
          setForm((prev) => (prev.roleId ? prev : { ...prev, roleId: String(defaultRole.idRole) }));
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

  const selectedRole = useMemo(() => {
    return roles.find((r) => String(r.idRole) === String(form.roleId));
  }, [roles, form.roleId]);

  const passwordStrength = useMemo(
    () => getPasswordStrength(form.password),
    [form.password]
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

    if (form.birthday) {
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
        birthday: form.birthday || null,
        gender: form.gender,
        roleId: Number(form.roleId),
      });

      showNotification({
        type: "success",
        title: "Tạo tài khoản thành công",
        message: `Đã tạo tài khoản cho ${createdUser.fullName || form.fullName}.`,
      });

      navigate(`/admin/users/${createdUser.idUser}`, { replace: true });
    } catch (error) {
      setSubmitError(
        error.response?.data?.message ||
          "Không thể tạo người dùng. Vui lòng kiểm tra lại thông tin."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      {/* Header with back navigation */}
      <div className="flex items-center gap-3 pb-3 border-b border-slate-200/60 dark:border-slate-800">
        <Link
          to="/admin/users"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-brand hover:border-brand/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 transition-colors shadow-2xs"
          title="Quay lại danh sách"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Thêm tài khoản người dùng
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Khởi tạo người dùng mới hoặc gán quyền nhân sự trực tiếp vào hệ thống.
          </p>
        </div>
      </div>

      {submitError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-400 flex items-center gap-2">
          <ShieldAlert size={16} className="shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Main 2-Column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          {/* Card 1: Thông tin cá nhân */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-brand dark:bg-blue-950/50">
                <User size={18} />
              </div>
              <h2 className="font-heading text-sm font-bold text-slate-900 dark:text-white">
                1. Thông tin cá nhân & Liên hệ
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Họ và tên <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  className={`w-full h-10 px-3.5 rounded-xl border text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden transition-all dark:bg-slate-800/60 dark:text-slate-100 ${
                    errors.fullName
                      ? "border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                      : "border-slate-200 bg-slate-50/50 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/10 dark:border-slate-700"
                  }`}
                />
                {errors.fullName && (
                  <p className="mt-1 text-[11px] text-rose-600">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Địa chỉ Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="user@garment.vn"
                  className={`w-full h-10 px-3.5 rounded-xl border text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden transition-all dark:bg-slate-800/60 dark:text-slate-100 ${
                    errors.email
                      ? "border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                      : "border-slate-200 bg-slate-50/50 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/10 dark:border-slate-700"
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-[11px] text-rose-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="0912 345 678"
                  className={`w-full h-10 px-3.5 rounded-xl border text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden transition-all dark:bg-slate-800/60 dark:text-slate-100 ${
                    errors.phone
                      ? "border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                      : "border-slate-200 bg-slate-50/50 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/10 dark:border-slate-700"
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-[11px] text-rose-600">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Ngày sinh
                </label>
                <input
                  type="date"
                  name="birthday"
                  value={form.birthday}
                  onChange={handleChange}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/10 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
                />
                {errors.birthday && (
                  <p className="mt-1 text-[11px] text-rose-600">{errors.birthday}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Giới tính
                </label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/10 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
                >
                  <option value="Male">Nam</option>
                  <option value="Female">Nữ</option>
                  <option value="Unknown">Chưa xác định</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 2: Vai trò & Phân quyền */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50">
                <ShieldCheck size={18} />
              </div>
              <h2 className="font-heading text-sm font-bold text-slate-900 dark:text-white">
                2. Phân quyền vai trò hệ thống
              </h2>
            </div>

            {rolesLoading ? (
              <div className="py-4 text-center text-xs text-slate-400">
                <LoaderCircle size={20} className="animate-spin mx-auto mb-1 text-brand" />
                Đang nạp danh mục vai trò...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {roles.map((r) => {
                  const isChecked = String(form.roleId) === String(r.idRole);
                  const isAdm = r.nameRole?.toLowerCase().includes("admin");
                  const isStaff = r.nameRole?.toLowerCase().includes("staff");
                  return (
                    <label
                      key={r.idRole}
                      className={`relative flex flex-col p-4 rounded-2xl border cursor-pointer transition-all ${
                        isChecked
                          ? "border-brand bg-brand/5 dark:bg-brand/15 shadow-xs"
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
                      <div className="flex items-center justify-between mb-2">
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
                          <div className="h-5 w-5 rounded-full bg-brand text-white flex items-center justify-center">
                            <Check size={12} className="stroke-3" />
                          </div>
                        )}
                      </div>
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {r.nameRole}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {r.descriptionRole || "Quyền hạn tài khoản trong hệ thống"}
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
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50">
                <Lock size={18} />
              </div>
              <h2 className="font-heading text-sm font-bold text-slate-900 dark:text-white">
                3. Mật khẩu khởi tạo
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Mật khẩu <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Tối thiểu 8 ký tự"
                    className="w-full h-10 pl-3.5 pr-10 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/10 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-[11px] text-rose-600">{errors.password}</p>
                )}

                {/* Password strength indicator */}
                {form.password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">Độ an toàn:</span>
                      <span className={`font-bold ${passwordStrength.text}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex gap-1">
                      <div
                        className={`h-full flex-1 rounded-full ${
                          passwordStrength.score >= 1 ? passwordStrength.color : "bg-slate-200"
                        }`}
                      />
                      <div
                        className={`h-full flex-1 rounded-full ${
                          passwordStrength.score >= 2 ? passwordStrength.color : "bg-slate-200"
                        }`}
                      />
                      <div
                        className={`h-full flex-1 rounded-full ${
                          passwordStrength.score >= 3 ? passwordStrength.color : "bg-slate-200"
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Xác nhận mật khẩu <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Nhập lại mật khẩu"
                    className="w-full h-10 pl-3.5 pr-10 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/10 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-[11px] text-rose-600">{errors.confirmPassword}</p>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              to="/admin/users"
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
              Hủy bỏ
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand text-white text-xs font-semibold hover:bg-brand-hover disabled:opacity-50 transition-colors shadow-xs"
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
        <div className="space-y-6">
          <div className="sticky top-24 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Xem trước hồ sơ
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand">
                <Sparkles size={13} />
                Thời gian thực
              </span>
            </div>

            <div className="pt-6 flex flex-col items-center text-center">
              <div className="h-20 w-20 rounded-2xl bg-linear-to-tr from-brand to-sky-400 text-white flex items-center justify-center font-heading text-2xl font-black shadow-lg shadow-brand/20">
                {form.fullName ? form.fullName.charAt(0).toUpperCase() : "U"}
              </div>

              <h3 className="mt-4 font-heading text-base font-extrabold text-slate-900 dark:text-white">
                {form.fullName || "Tên người dùng mới"}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 truncate max-w-full">
                {form.email || "email@garment.vn"}
              </p>

              <div className="mt-3">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-brand-soft text-brand dark:bg-brand/20">
                  <ShieldCheck size={14} />
                  {selectedRole?.nameRole || "Chưa chọn vai trò"}
                </span>
              </div>

              <div className="w-full mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5 text-left text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Số điện thoại:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {form.phone || "Chưa nhập"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Giới tính:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {form.gender === "Male"
                      ? "Nam"
                      : form.gender === "Female"
                        ? "Nữ"
                        : "Chưa xác định"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Trạng thái:</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Kích hoạt ngay
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCreatePage;
