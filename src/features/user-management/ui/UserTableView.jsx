import { CheckSquare, Eye, Square, Trash2, Users } from "lucide-react";
import { Link } from "react-router-dom";

import UserAvatar from "@/shared/ui/avatar/UserAvatar";
import EmptyState from "@/shared/ui/empty-state/EmptyState";

import {
  formatDate,
  getRoleBadge,
  getStatusInfo,
  getUserContact,
} from "../lib/userUtils";

const UserTableView = ({
  users = [],
  selectedIds = new Set(),
  isAllCurrentSelected = false,
  isAdmin = false,
  currentUserId = null,
  onToggleSelectAll,
  onToggleSelect,
  onDelete,
  onResetFilters,
}) => {
  if (users.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Không tìm thấy người dùng nào phù hợp"
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
              <th className="px-4 py-3.5">Người dùng</th>
              <th className="px-4 py-3.5">Mã người dùng</th>
              <th className="px-4 py-3.5">Vai trò</th>
              <th className="px-4 py-3.5">Trạng thái</th>
              <th className="px-4 py-3.5">Ngày tham gia</th>
              <th className="px-4 py-3.5 text-right">Thao tác</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
            {users.map((user) => {
              const roleBadge = getRoleBadge(user);
              const statusInfo = getStatusInfo(user);
              const contact = getUserContact(user);
              const RoleIcon = roleBadge.icon;
              const isSelected = selectedIds.has(user.idUser);
              const isCurrentUser = Boolean(
                currentUserId && user.idUser === currentUserId,
              );
              const canDelete =
                isAdmin && !isCurrentUser && statusInfo.code !== "deleted";

              const contactDisplay =
                contact.email && contact.phone
                  ? `${contact.email} · ${contact.phone}`
                  : contact.email || contact.phone || "Chưa có liên hệ";

              return (
                <tr
                  key={user.idUser}
                  className={`transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/50 ${
                    isSelected ? "bg-brand/5 dark:bg-brand/10" : ""
                  }`}
                >
                  <td className="w-10 px-4 py-3.5">
                    <button
                      type="button"
                      onClick={() => onToggleSelect?.(user.idUser)}
                      className="flex cursor-pointer items-center text-slate-400 hover:text-brand"
                    >
                      {isSelected ? (
                        <CheckSquare size={16} className="text-brand" />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        src={user.avatar}
                        name={user.fullName || user.userCode}
                        size="md"
                        showStatus={statusInfo.code === "active"}
                      />

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Link
                            to={`/admin/users/${user.idUser}`}
                            className="truncate font-bold text-slate-900 transition-colors hover:text-brand dark:text-white dark:hover:text-brand"
                          >
                            {user.fullName || "Chưa đặt tên"}
                          </Link>
                          {isCurrentUser && (
                            <span className="shrink-0 rounded bg-brand/10 px-1.5 py-0.5 text-[10px] font-bold text-brand">
                              Bạn
                            </span>
                          )}
                        </div>
                        <div
                          className="max-w-60 truncate text-[11px] text-slate-400"
                          title={contactDisplay}
                        >
                          {contactDisplay}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 font-mono text-[11px] font-semibold whitespace-nowrap text-slate-600 dark:text-slate-300">
                    <span className="rounded-md bg-slate-100 px-2 py-1 dark:bg-slate-800">
                      {user.userCode || user.idUser?.slice(0, 8)}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${roleBadge.className}`}
                    >
                      <RoleIcon size={13} />
                      {roleBadge.label}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${statusInfo.className}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${statusInfo.dot}`}
                      />
                      {statusInfo.label}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap text-slate-500 dark:text-slate-400">
                    <div>{formatDate(user.createdAt, false, "Chưa có")}</div>
                    {user.lastLogin && (
                      <div className="text-[10px] text-slate-400">
                        Đăng nhập: {formatDate(user.lastLogin, false, "")}
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        to={`/admin/users/${user.idUser}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-brand dark:hover:bg-slate-800"
                        title="Xem chi tiết người dùng"
                      >
                        <Eye size={16} />
                      </Link>

                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete?.(user)}
                          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                          title="Xóa tài khoản"
                        >
                          <Trash2 size={16} />
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

export default UserTableView;
