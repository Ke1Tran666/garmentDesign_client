import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Info,
  Trash2,
  Users,
  X,
} from "lucide-react";

import Select from "@/shared/ui/select/Select";

import {
  getRoleActiveUserCount,
  getRoleProfile,
  getRoleUserCount,
} from "../lib/roleUtils";

const RoleDeleteModal = ({
  open = false,
  role = null,
  allRoles = [],
  submitting = false,
  errorMessage = "",
  onClose,
  onConfirm,
}) => {
  const [replacementRoleId, setReplacementRoleId] = useState("");
  const [localError, setLocalError] = useState("");

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

  const replacementOptions = useMemo(() => {
    if (!role) return [];

    return allRoles
      .filter((item) => Number(item?.idRole) !== Number(role.idRole))
      .map((item) => {
        const profile = getRoleProfile(item);
        const suffix =
          profile.label &&
          profile.label.toLowerCase() !==
            String(item.nameRole || "")
              .trim()
              .toLowerCase()
            ? ` (${profile.label})`
            : "";

        return {
          value: String(item.idRole),
          label: `#${item.idRole} · ${item.nameRole}${suffix}`,
        };
      });
  }, [allRoles, role]);

  if (!open || !role) return null;

  const userCount = getRoleUserCount(role);
  const activeUserCount = getRoleActiveUserCount(role);
  const selectedReplacement = replacementOptions.find(
    (opt) => opt.value === String(replacementRoleId),
  );
  const displayedError = localError || errorMessage;

  const handleConfirm = (event) => {
    event.preventDefault();
    if (submitting) return;

    if (!replacementRoleId) {
      setLocalError("Vui lòng chọn vai trò thay thế trước khi xóa.");
      return;
    }

    setLocalError("");
    onConfirm?.(Number(replacementRoleId));
  };

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center overflow-y-auto p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="role-delete-modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200"
        onClick={submitting ? undefined : onClose}
      />

      {/* Modal Dialog */}
      <form
        onSubmit={handleConfirm}
        className="relative z-10 my-auto w-full max-w-lg animate-in overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xl transition-all duration-200 zoom-in-95 fade-in dark:border-slate-800 dark:bg-slate-900"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 bg-rose-50/50 px-5 py-4 sm:px-6 dark:border-slate-800 dark:bg-rose-950/20">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/70 dark:text-rose-400">
              <Trash2 size={19} />
            </div>
            <div>
              <span className="text-[11px] font-bold tracking-wider text-rose-600 uppercase dark:text-rose-400">
                Xác nhận thao tác xóa
              </span>
              <h2
                id="role-delete-modal-title"
                className="font-heading text-base font-bold text-slate-900 sm:text-lg dark:text-white"
              >
                Xóa vai trò{" "}
                <span className="font-mono text-rose-600 dark:text-rose-400">
                  {role.nameRole}
                </span>
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="cursor-pointer rounded-xl p-1.5 text-slate-400 transition-colors hover:bg-white hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Đóng hộp thoại xóa"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 px-5 py-5 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-white px-2 py-0.5 font-mono text-xs font-bold text-slate-700 shadow-2xs dark:bg-slate-800 dark:text-slate-200">
                #{role.idRole}
              </span>
              <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                {role.nameRole}
              </span>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <Users size={12} className="text-slate-400" />
              {userCount} tài khoản ({activeUserCount} hoạt động)
            </span>
          </div>

          {userCount > 0 ? (
            <div className="flex items-start gap-2.5 rounded-2xl border border-amber-200/90 bg-amber-50/80 p-3.5 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
              <AlertTriangle
                size={16}
                className="mt-0.5 shrink-0 text-amber-500"
              />
              <p className="leading-relaxed">
                Vai trò <strong>{role.nameRole}</strong> hiện đang được gán cho{" "}
                <strong>{userCount}</strong> tài khoản. Toàn bộ tài khoản này sẽ
                được chuyển tự động sang vai trò thay thế trước khi xóa.
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-2.5 rounded-2xl border border-sky-200/80 bg-sky-50/70 p-3.5 text-xs text-sky-800 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-300">
              <Info size={16} className="mt-0.5 shrink-0 text-sky-500" />
              <p className="leading-relaxed">
                Hiện chưa có tài khoản nào gán vai trò này. Vui lòng chọn một
                vai trò thay thế để đảm bảo an toàn phân quyền trước khi xóa.
              </p>
            </div>
          )}

          <div>
            <label
              htmlFor="replacementRoleId"
              className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Vai trò thay thế <span className="text-rose-500">*</span>
            </label>

            <Select
              id="replacementRoleId"
              name="replacementRoleId"
              ariaLabel="Vai trò thay thế"
              value={replacementRoleId}
              onValueChange={(nextValue) => {
                setReplacementRoleId(nextValue);
                setLocalError("");
              }}
              options={replacementOptions}
              placeholder="Chọn vai trò thay thế..."
              disabled={submitting || replacementOptions.length === 0}
              error={Boolean(displayedError)}
              required
            />

            <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              {selectedReplacement
                ? userCount > 0
                  ? `${userCount} tài khoản thuộc "${role.nameRole}" sẽ được chuyển sang ${selectedReplacement.label}.`
                  : `Đã chọn vai trò thay thế: ${selectedReplacement.label}.`
                : "Chỉ khi chọn vai trò thay thế thì nút Xác nhận xóa mới khả dụng."}
            </p>
          </div>

          {displayedError && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs font-medium text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
            >
              <AlertCircle
                size={16}
                className="mt-0.5 shrink-0 text-rose-500"
              />
              <span className="flex-1">{displayedError}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 bg-slate-50/80 px-5 py-3.5 sm:px-6 dark:border-slate-800 dark:bg-slate-800/50">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Hủy bỏ
          </button>

          <button
            type="submit"
            disabled={submitting || !replacementRoleId}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-sm shadow-rose-600/20 transition-all hover:bg-rose-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Đang xóa...</span>
              </>
            ) : (
              <>
                <Trash2 size={14} />
                <span>Xác nhận xóa</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoleDeleteModal;
