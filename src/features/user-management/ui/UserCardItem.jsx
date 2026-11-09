import { CheckSquare, Eye, Mail, Phone, Square, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import UserAvatar from "@/shared/ui/avatar/UserAvatar";

import {
  formatDate,
  formatGender,
  getRoleBadge,
  getStatusInfo,
  getUserContact,
} from "../lib/userUtils";

const UserCardItem = ({
  user,
  isSelected = false,
  isAdmin = false,
  isCurrentUser = false,
  onToggleSelect,
  onDelete,
}) => {
  if (!user) return null;

  const roleBadge = getRoleBadge(user);
  const RoleIcon = roleBadge.icon;
  const statusInfo = getStatusInfo(user);
  const contact = getUserContact(user);
  const canDelete = isAdmin && !isCurrentUser && statusInfo.code !== "deleted";

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-xs transition-all hover:shadow-md dark:bg-slate-900 ${
        isSelected
          ? "border-brand ring-2 ring-brand/10 dark:border-brand"
          : "border-slate-200/80 hover:border-slate-300 dark:border-slate-800"
      }`}
    >
      <div>
        {/* Top Header: Checkbox, User Code & Status */}
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleSelect?.(user.idUser)}
              className="cursor-pointer text-slate-400 hover:text-brand"
              title={isSelected ? "Bỏ chọn" : "Chọn người dùng này"}
            >
              {isSelected ? (
                <CheckSquare size={16} className="text-brand" />
              ) : (
                <Square size={16} />
              )}
            </button>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {user.userCode || user.idUser?.slice(0, 8)}
            </span>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold whitespace-nowrap ${statusInfo.className}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.dot}`} />
            {statusInfo.label}
          </span>
        </div>

        {/* Profile Identity */}
        <div className="flex items-center gap-3.5">
          <UserAvatar
            src={user.avatar}
            name={user.fullName || user.userCode}
            size="lg"
            showStatus={statusInfo.code === "active"}
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <Link
                to={`/admin/users/${user.idUser}`}
                className="truncate font-heading text-sm font-bold text-slate-900 transition-colors hover:text-brand dark:text-white dark:hover:text-brand"
              >
                {user.fullName || "Chưa đặt tên"}
              </Link>
              {isCurrentUser && (
                <span className="shrink-0 rounded bg-brand/10 px-1.5 py-0.5 text-[10px] font-bold text-brand">
                  Bạn
                </span>
              )}
            </div>

            <div className="mt-1 space-y-0.5 text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5 truncate">
                <Mail size={11} className="shrink-0 text-slate-400" />
                <span className="truncate">
                  {contact.email || "Chưa có email"}
                </span>
              </div>
              {contact.phone && (
                <div className="flex items-center gap-1.5 truncate">
                  <Phone size={11} className="shrink-0 text-slate-400" />
                  <span>{contact.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap ${roleBadge.className}`}
          >
            <RoleIcon size={12} />
            {roleBadge.label}
          </span>

          {user.gender && user.gender !== "Unknown" && (
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {formatGender(user.gender)}
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3.5 dark:border-slate-800">
        <div className="text-[11px] text-slate-500 dark:text-slate-400">
          <span className="block text-[10px] text-slate-400">
            Ngày tham gia
          </span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {formatDate(user.createdAt, false, "Chưa có")}
          </span>
        </div>

        <div className="flex items-center gap-1">
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
      </div>
    </div>
  );
};

export default UserCardItem;
