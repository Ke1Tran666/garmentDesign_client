import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ExternalLink,
  Info,
  KeyRound,
  Lock,
  Pencil,
  RotateCcw,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

import UserAvatar from "@/shared/ui/avatar/UserAvatar";

import {
  ROLE_NAME_SUGGESTIONS,
  canDeleteRole,
  canEditRole,
  getRoleActiveUserCount,
  getRoleProfile,
  getRoleUserCount,
  normalizeRoleCompareKey,
  normalizeRoleNameInput,
  validateRoleName,
} from "../lib/roleUtils";

const createInitialForm = (role) => ({
  nameRole: role?.nameRole || "",
  description: role?.description || "",
});

const RoleDetailEditModal = ({
  open = true,
  role = null,
  allRoles = [],
  initialMode = "view",
  isAdmin = true,
  submitting = false,
  errorMessage = "",
  assignedUsers = [],
  assignedUsersLoading = false,
  onClose,
  onSubmit,
  onDelete,
}) => {
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState(() => createInitialForm(role));
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !submitting) {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, submitting, onClose]);

  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";

  const profile = useMemo(() => getRoleProfile(role), [role]);
  const RoleIcon = isCreateMode ? KeyRound : profile.icon;

  const unusedSuggestions = useMemo(() => {
    const existingKeys = new Set(
      allRoles.map((item) => normalizeRoleCompareKey(item.nameRole)),
    );
    return ROLE_NAME_SUGGESTIONS.filter(
      (name) => !existingKeys.has(normalizeRoleCompareKey(name)),
    );
  }, [allRoles]);

  const editable = isAdmin && canEditRole(role);
  const deletable = isAdmin && canDeleteRole(role, allRoles);
  const userCount = getRoleUserCount(role);
  const activeUserCount = getRoleActiveUserCount(role);

  const handleNameChange = (event) => {
    setForm((prev) => ({ ...prev, nameRole: event.target.value }));
    setValidationError("");
  };

  const handleDescriptionChange = (event) => {
    setForm((prev) => ({ ...prev, description: event.target.value }));
    setValidationError("");
  };

  const handleCancelEdit = () => {
    if (isCreateMode) {
      onClose?.();
    } else {
      setForm(createInitialForm(role));
      setValidationError("");
      setMode("view");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const baseError = validateRoleName(form.nameRole, {
      disallowSystem: isCreateMode,
      editingRoleId: isEditMode ? role?.idRole : null,
      currentRoleName: role?.nameRole || "",
    });
    if (baseError) {
      setValidationError(baseError);
      return;
    }

    const cleanName = normalizeRoleNameInput(form.nameRole);
    const nameKey = normalizeRoleCompareKey(cleanName);
    const duplicateExists = allRoles.some(
      (item) =>
        normalizeRoleCompareKey(item.nameRole) === nameKey &&
        Number(item.idRole) !== Number(role?.idRole),
    );

    if (duplicateExists) {
      setValidationError(`Vai trò "${cleanName}" đã tồn tại.`);
      return;
    }

    const cleanDescription = String(form.description ?? "").trim();
    if (cleanDescription.length > 500) {
      setValidationError("Mô tả vai trò không được vượt quá 500 ký tự.");
      return;
    }

    if (
      isEditMode &&
      nameKey === normalizeRoleCompareKey(role?.nameRole) &&
      cleanDescription === String(role?.description ?? "").trim()
    ) {
      setValidationError("Thông tin vai trò chưa có thay đổi.");
      return;
    }

    onSubmit?.(
      {
        nameRole: cleanName,
        description: cleanDescription,
      },
      () => {
        if (isEditMode) {
          setMode("view");
        }
      },
    );
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200"
        onClick={submitting ? undefined : onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 my-auto flex max-h-[90vh] w-full max-w-2xl animate-in flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xl transition-all duration-200 zoom-in-95 fade-in dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6 dark:border-slate-800 dark:bg-slate-800/50">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-xs ${
                isCreateMode
                  ? "bg-brand/10 text-brand dark:bg-brand/20"
                  : profile.iconBgClassName
              }`}
            >
              <RoleIcon size={20} />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                  {isCreateMode
                    ? "Tạo vai trò mới"
                    : isEditMode
                      ? "Chỉnh sửa vai trò"
                      : "Chi tiết vai trò"}
                </span>

                {!isCreateMode && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isEditMode
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isEditMode
                          ? "animate-pulse bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                    />
                    {isEditMode ? "Chế độ chỉnh sửa" : "Chế độ xem"}
                  </span>
                )}
              </div>

              <h2 className="mt-0.5 truncate font-heading text-base font-bold text-slate-900 sm:text-lg dark:text-white">
                {isCreateMode
                  ? "Thêm vai trò phân quyền"
                  : profile.label.toLowerCase() !==
                        String(role?.nameRole || "")
                          .trim()
                          .toLowerCase() && role?.nameRole
                    ? `${profile.label} (${role.nameRole})`
                    : profile.label}
              </h2>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {isViewMode && editable && (
              <button
                type="button"
                onClick={() => {
                  setForm(createInitialForm(role));
                  setValidationError("");
                  setMode("edit");
                }}
                className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-xl bg-brand/10 px-3 text-xs font-bold text-brand shadow-2xs transition-all hover:bg-brand/20"
              >
                <Pencil size={13} />
                <span>Chỉnh sửa</span>
              </button>
            )}

            {isEditMode && (
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={submitting}
                className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-xl border border-slate-200 px-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <RotateCcw size={13} />
                <span>Hủy sửa</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="ml-1 cursor-pointer rounded-xl p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              title="Đóng cửa sổ (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-6 sm:px-6">
          {(errorMessage || validationError) && (
            <div
              role="alert"
              className="flex animate-in items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-700 duration-150 fade-in dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
            >
              <AlertCircle
                size={16}
                className="mt-0.5 shrink-0 text-rose-500"
              />
              <div className="flex-1 font-medium">
                {validationError || errorMessage}
              </div>
            </div>
          )}

          {isViewMode ? (
            <div className="space-y-5">
              {/* Role Overview Grid */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                  <span className="text-[11px] font-medium text-slate-400">
                    Mã ID vai trò
                  </span>
                  <div className="mt-1 font-mono text-base font-extrabold text-slate-900 dark:text-white">
                    #{role?.idRole}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                  <span className="text-[11px] font-medium text-slate-400">
                    Tên vai trò
                  </span>
                  <div className="mt-1 text-base font-extrabold text-brand">
                    {role?.nameRole}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                  <span className="text-[11px] font-medium text-slate-400">
                    Tài khoản đang gán
                  </span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-base font-extrabold text-slate-900 dark:text-white">
                      {userCount}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      ({activeUserCount} hoạt động)
                    </span>
                  </div>
                </div>
              </div>

              {/* Classification & Description */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-white">
                    <ShieldCheck size={16} className="text-brand" />
                    <span>Mô tả & Phạm vi quyền hạn</span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${
                      profile.isSystem
                        ? "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300"
                        : "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-300"
                    }`}
                  >
                    {profile.isSystem && <Lock size={10} />}
                    {profile.isSystem
                      ? "Mặc định hệ thống"
                      : "Vai trò tùy chỉnh"}
                  </span>
                </div>

                <p
                  className={`mt-2.5 text-xs leading-relaxed ${
                    profile.description
                      ? "text-slate-600 dark:text-slate-300"
                      : "text-slate-400 italic"
                  }`}
                >
                  {profile.description || "Chưa có mô tả vai trò."}
                </p>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/40">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Phạm vi quyền hạn
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                    Đang phát triển
                  </span>
                </div>

                {profile.isSystem && (
                  <p className="mt-3 flex items-center gap-1.5 rounded-xl bg-amber-50/70 px-3 py-2 text-[11px] text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
                    <Lock size={13} className="shrink-0" />
                    <span>
                      Vai trò mặc định gắn với cơ chế bảo mật cốt lõi của hệ
                      thống nên không thể xóa, nhưng bạn có thể chỉnh sửa tên và
                      mô tả vai trò khi cần.
                    </span>
                  </p>
                )}
              </div>

              {/* Assigned Users Preview */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-white">
                    <Users size={16} className="text-brand" />
                    <span>Tài khoản thuộc vai trò này</span>
                  </div>

                  <Link
                    to={`/admin/users?role=${encodeURIComponent(role?.nameRole || "")}`}
                    onClick={onClose}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand hover:underline"
                  >
                    <span>Mở trong Quản lý người dùng</span>
                    <ExternalLink size={12} />
                  </Link>
                </div>

                {assignedUsersLoading ? (
                  <div className="space-y-2 py-2">
                    <div className="h-10 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
                    <div className="h-10 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
                  </div>
                ) : assignedUsers.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-200 px-4 py-5 text-center text-xs text-slate-400 dark:border-slate-700">
                    Chưa có tài khoản nào được gán vai trò này.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {assignedUsers.slice(0, 5).map((item) => (
                      <Link
                        key={item.idUser}
                        to={`/admin/users/${item.idUser}`}
                        onClick={onClose}
                        className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-3 py-2 transition-colors hover:border-brand/30 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <UserAvatar
                            src={item.avatar}
                            name={item.fullName || item.userCode}
                            size="sm"
                            showStatus={item.status === "active"}
                          />
                          <div className="min-w-0">
                            <div className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                              {item.fullName || item.userCode}
                            </div>
                            <div className="truncate text-[11px] text-slate-400">
                              {item.email || item.userCode}
                            </div>
                          </div>
                        </div>

                        <span className="shrink-0 font-mono text-[10px] font-semibold text-slate-400">
                          {item.userCode}
                        </span>
                      </Link>
                    ))}
                    {assignedUsers.length > 5 && (
                      <p className="pt-1 text-center text-[11px] text-slate-400">
                        Và {assignedUsers.length - 5} tài khoản khác...
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <form id="role-form" onSubmit={handleSubmit} className="space-y-5">
              {/* Role Name */}
              <div>
                <label
                  htmlFor="nameRole"
                  className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Tên vai trò <span className="text-rose-500">*</span>
                </label>
                <input
                  id="nameRole"
                  name="nameRole"
                  type="text"
                  maxLength={50}
                  value={form.nameRole}
                  onChange={handleNameChange}
                  disabled={submitting}
                  placeholder="Ví dụ: Thiết kế rập hoặc QA Manager"
                  autoFocus
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 text-sm font-semibold text-slate-900 transition-all placeholder:font-normal placeholder:text-slate-400 focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/10 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-white"
                />

                <p className="mt-1.5 text-[11px] text-slate-400">
                  Dài 2-50 ký tự, cho phép chữ có dấu, số và khoảng trắng.
                </p>
              </div>

              {isCreateMode && unusedSuggestions.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <Sparkles size={13} className="text-brand" />
                    <span>Gợi ý tên vai trò nhanh:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {unusedSuggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => {
                          setForm((prev) => ({
                            ...prev,
                            nameRole: suggestion,
                          }));
                          setValidationError("");
                        }}
                        disabled={submitting}
                        className="cursor-pointer rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition-colors hover:border-brand/50 hover:bg-brand/5 hover:text-brand dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Role Description */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="roleDescription"
                    className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Mô tả vai trò
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {form.description.length}/500
                  </span>
                </div>
                <textarea
                  id="roleDescription"
                  name="description"
                  rows={2}
                  maxLength={500}
                  value={form.description}
                  onChange={handleDescriptionChange}
                  disabled={submitting}
                  placeholder="Mô tả nhiệm vụ chính hoặc phạm vi phụ trách của vai trò..."
                  className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-xs font-medium text-slate-900 transition-all placeholder:font-normal placeholder:text-slate-400 focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/10 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-white"
                />
              </div>

              <div className="flex items-start gap-2.5 rounded-2xl border border-sky-200/80 bg-sky-50/70 p-3.5 text-xs text-sky-800 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-300">
                <Info size={16} className="mt-0.5 shrink-0 text-sky-500" />
                <div className="space-y-1 leading-relaxed">
                  {isEditMode && profile.isSystem ? (
                    <>
                      <p className="font-semibold">
                        Lưu ý khi sửa vai trò mặc định (#{role?.idRole})
                      </p>
                      <p className="text-[11px] opacity-90">
                        Tên và mô tả vai trò sẽ được cập nhật trực tiếp vào cơ
                        sở dữ liệu. Các tài khoản đang gán và nhóm quyền cốt lõi
                        vẫn được bảo vệ khỏi thao tác xóa.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold">Lưu ý tạo & gán vai trò</p>
                      <p className="text-[11px] opacity-90">
                        Sau khi lưu, vai trò mới sẽ hiển thị ngay trong danh
                        sách và biểu mẫu phân quyền người dùng. Phân quyền chi
                        tiết theo từng chức năng sẽ được bổ sung ở giai đoạn
                        tiếp theo.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/80 px-5 py-3.5 sm:px-6 dark:border-slate-800 dark:bg-slate-800/50">
          <div>
            {isViewMode && deletable && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(role)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-400 dark:hover:bg-rose-950/40"
              >
                <Trash2 size={14} />
                <span>Xóa vai trò</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={isEditMode ? handleCancelEdit : onClose}
              disabled={submitting}
              className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              {isViewMode ? "Đóng" : "Hủy bỏ"}
            </button>

            {!isViewMode && (
              <button
                type="submit"
                form="role-form"
                disabled={submitting}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-brand px-5 py-2 text-xs font-bold text-white shadow-sm shadow-brand/25 transition-all hover:bg-brand-hover active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>{isCreateMode ? "Tạo vai trò" : "Lưu thay đổi"}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleDetailEditModal;
