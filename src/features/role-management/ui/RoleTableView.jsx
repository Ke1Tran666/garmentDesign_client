import {
  CheckSquare,
  Eye,
  Lock,
  Pencil,
  ShieldCheck,
  Square,
  Trash2,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

import EmptyState from "@/shared/ui/empty-state/EmptyState";

import {
  canDeleteRole,
  canEditRole,
  getRoleActiveUserCount,
  getRoleProfile,
  getRoleUserCount,
} from "../lib/roleUtils";

const RoleTableView = ({
  roles = [],
  allRoles = roles,
  selectedIds = new Set(),
  isAllCurrentSelected = false,
  isAdmin = false,
  onToggleSelectAll,
  onToggleSelect,
  onOpenView,
  onOpenEdit,
  onDelete,
  onResetFilters,
}) => {
  if (roles.length === 0) {
    return (
      <EmptyState
        icon={ShieldCheck}
        title="Không tìm thấy vai trò nào phù hợp"
        description="Thử thay đổi từ khóa tìm kiếm hoặc đặt lại các bộ lọc."
        actionText="Đặt lại tất cả bộ lọc"
        onAction={onResetFilters}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full min-w-220 text-left">
          <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold tracking-wider text-slate-500 uppercase dark:border-slate-800 dark:bg-slate-800/40">
            <tr>
              <th className="w-10 px-4 py-3.5">
                <button
                  type="button"
                  onClick={onToggleSelectAll}
                  className="flex cursor-pointer items-center text-slate-400 hover:text-brand"
                  title={
                    isAllCurrentSelected
                      ? "Bỏ chọn tất cả"
                      : "Chọn tất cả trang này"
                  }
                >
                  {isAllCurrentSelected ? (
                    <CheckSquare size={16} className="text-brand" />
                  ) : (
                    <Square size={16} />
                  )}
                </button>
              </th>
              <th className="px-4 py-3.5">ID</th>
              <th className="px-4 py-3.5">Vai trò</th>
              <th className="px-4 py-3.5">Phân loại</th>
              <th className="px-4 py-3.5">Phạm vi quyền hạn</th>
              <th className="px-4 py-3.5">Tài khoản</th>
              <th className="px-4 py-3.5 text-right">Thao tác</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
            {roles.map((role) => {
              const profile = getRoleProfile(role);
              const RoleIcon = profile.icon;
              const userCount = getRoleUserCount(role);
              const activeCount = getRoleActiveUserCount(role);
              const isSelected = selectedIds.has(role.idRole);
              const editable = isAdmin && canEditRole(role);
              const deletable = isAdmin && canDeleteRole(role, allRoles);

              return (
                <tr
                  key={role.idRole}
                  className={`transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/50 ${
                    isSelected ? "bg-brand/5 dark:bg-brand/10" : ""
                  }`}
                >
                  <td className="w-10 px-4 py-3.5">
                    <button
                      type="button"
                      onClick={() => onToggleSelect?.(role.idRole)}
                      className="flex cursor-pointer items-center text-slate-400 hover:text-brand"
                    >
                      {isSelected ? (
                        <CheckSquare size={16} className="text-brand" />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </td>

                  <td className="px-4 py-3.5 font-mono text-[11px] font-bold whitespace-nowrap text-slate-600 dark:text-slate-300">
                    <span className="rounded-md bg-slate-100 px-2 py-1 dark:bg-slate-800">
                      #{role.idRole}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${profile.iconBgClassName}`}
                      >
                        <RoleIcon size={17} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onOpenView?.(role)}
                            className="cursor-pointer truncate font-bold text-slate-900 transition-colors hover:text-brand dark:text-white dark:hover:text-brand"
                          >
                            {profile.label}
                          </button>
                          {role.nameRole &&
                            profile.label.toLowerCase() !==
                              String(role.nameRole).trim().toLowerCase() && (
                              <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                {role.nameRole}
                              </span>
                            )}
                        </div>
                        <div
                          className={`max-w-72 truncate text-[11px] ${
                            profile.description
                              ? "text-slate-400"
                              : "text-slate-400/80 italic"
                          }`}
                          title={profile.description || "Chưa có mô tả vai trò"}
                        >
                          {profile.description || "Chưa có mô tả vai trò"}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${
                        profile.isSystem
                          ? "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300"
                          : "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-300"
                      }`}
                    >
                      {profile.isSystem && <Lock size={11} />}
                      {profile.isSystem ? "Hệ thống" : "Tùy chỉnh"}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold whitespace-nowrap text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                      Đang phát triển
                    </span>
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <Link
                      to={`/admin/users?role=${encodeURIComponent(role.nameRole)}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition-colors hover:border-brand/40 hover:text-brand dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      title="Xem danh sách tài khoản thuộc vai trò này"
                    >
                      <Users size={12} className="text-slate-400" />
                      <span>{userCount} tài khoản</span>
                    </Link>
                    {userCount > 0 && (
                      <div className="mt-1 pl-1 text-[10px] text-slate-400">
                        {activeCount} chưa xóa
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoleTableView;
