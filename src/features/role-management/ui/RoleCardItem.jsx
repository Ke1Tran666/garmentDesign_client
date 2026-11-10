import {
  CheckSquare,
  Eye,
  Lock,
  Pencil,
  Square,
  Trash2,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  canDeleteRole,
  canEditRole,
  getRoleActiveUserCount,
  getRoleProfile,
  getRoleUserCount,
} from "../lib/roleUtils";

const RoleCardItem = ({
  role,
  allRoles = [],
  isSelected = false,
  isAdmin = false,
  onToggleSelect,
  onOpenView,
  onOpenEdit,
  onDelete,
}) => {
  if (!role) return null;

  const profile = getRoleProfile(role);
  const RoleIcon = profile.icon;
  const userCount = getRoleUserCount(role);
  const activeCount = getRoleActiveUserCount(role);
  const editable = isAdmin && canEditRole(role);
  const deletable = isAdmin && canDeleteRole(role, allRoles);

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-xs transition-all hover:shadow-md dark:bg-slate-900 ${
        isSelected
          ? "border-brand ring-2 ring-brand/10 dark:border-brand"
          : "border-slate-200/80 hover:border-slate-300 dark:border-slate-800"
      }`}
    >
      <div>
        {/* Top Header: Checkbox, ID & System Badge */}
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleSelect?.(role.idRole)}
              className="cursor-pointer text-slate-400 hover:text-brand"
              title={isSelected ? "Bỏ chọn" : "Chọn vai trò này"}
            >
              {isSelected ? (
                <CheckSquare size={16} className="text-brand" />
              ) : (
                <Square size={16} />
              )}
            </button>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              #{role.idRole}
            </span>
          </div>

          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold whitespace-nowrap ${
              profile.isSystem
                ? "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300"
                : "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-300"
            }`}
          >
            {profile.isSystem && <Lock size={10} />}
            {profile.isSystem ? "Mặc định hệ thống" : "Tùy chỉnh"}
          </span>
        </div>

        {/* Role Identity */}
        <div className="flex items-start gap-3.5">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${profile.iconBgClassName}`}
          >
            <RoleIcon size={20} />
          </div>

          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => onOpenView?.(role)}
              className="block max-w-full cursor-pointer truncate text-left font-heading text-sm font-bold text-slate-900 transition-colors hover:text-brand dark:text-white dark:hover:text-brand"
            >
              {profile.label}
            </button>
            {role.nameRole &&
              profile.label.toLowerCase() !==
                String(role.nameRole).trim().toLowerCase() && (
                <span className="mt-0.5 inline-block rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {role.nameRole}
                </span>
              )}
          </div>
        </div>

        <p
          className={`mt-3 line-clamp-2 text-xs leading-relaxed ${
            profile.description
              ? "text-slate-500 dark:text-slate-400"
              : "text-slate-400 italic"
          }`}
        >
          {profile.description || "Chưa có mô tả vai trò."}
        </p>

        {/* Scope Status */}
        <div className="mt-3.5 flex items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/40">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Phạm vi quyền hạn
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold whitespace-nowrap text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
            Đang phát triển
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3.5 dark:border-slate-800">
        <Link
          to={`/admin/users?role=${encodeURIComponent(role.nameRole)}`}
          className="group/users inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 transition-colors hover:text-brand dark:text-slate-300"
          title="Xem các tài khoản thuộc vai trò này"
        >
          <Users
            size={13}
            className="text-slate-400 group-hover/users:text-brand"
          />
          <span>{userCount} tài khoản</span>
          {userCount > 0 && (
            <span className="text-[10px] font-normal text-slate-400">
              ({activeCount} hoạt động)
            </span>
          )}
        </Link>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onOpenView?.(role)}
            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-brand dark:hover:bg-slate-800"
            title="Xem chi tiết vai trò"
          >
            <Eye size={16} />
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={() => editable && onOpenEdit?.(role)}
              disabled={!editable}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${
                editable
                  ? "cursor-pointer text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/40"
                  : "cursor-not-allowed text-slate-300 dark:text-slate-700"
              }`}
              title="Chỉnh sửa vai trò"
            >
              <Pencil size={15} />
            </button>
          )}

          {isAdmin && (
            <button
              type="button"
              onClick={() => deletable && onDelete?.(role)}
              disabled={!deletable}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${
                deletable
                  ? "cursor-pointer text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                  : "cursor-not-allowed text-slate-300 dark:text-slate-700"
              }`}
              title={
                profile.isSystem
                  ? "Vai trò mặc định của hệ thống không thể xóa"
                  : !deletable
                    ? "Cần có vai trò thay thế trước khi xóa"
                    : "Xóa vai trò"
              }
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleCardItem;
