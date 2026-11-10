import { Link } from "react-router-dom";
import { LogOut } from "lucide-react";
import { normalizeRole, resolveAppRole } from "@/features/auth/lib/authRole";
import AdminUserAvatar from "./AdminUserAvatar";

const getRoleLabel = (user) => {
  const rawName = user?.role || user?.roleName || "";
  const normalized = normalizeRole(rawName);
  if (normalized === "admin") return "Quản trị viên";
  if (normalized === "staff") return "Nhân viên";
  if (rawName) return rawName;
  return resolveAppRole(user) === "staff" ? "Nhân viên" : "Quản trị viên";
};

export const AdminUserProfile = ({
  user,
  onLogout,
  onProfileClick,
  isCollapsed = false,
  variant = "sidebar",
}) => {
  const displayName = user?.fullName || user?.userCode || "Administrator";
  const roleLabel = getRoleLabel(user?.role || user?.roleName);
  const profilePath = user?.idUser
    ? `/admin/users/${encodeURIComponent(user.idUser)}`
    : null;

  if (isCollapsed) {
    const avatarNode = (
      <AdminUserAvatar
        src={user?.avatar}
        name={displayName}
        size="md"
        ring={false}
        className="rounded-xl ring-2 ring-slate-200 dark:ring-slate-700"
      />
    );

    return (
      <div className="flex flex-col items-center gap-2 pt-1">
        {profilePath ? (
          <Link
            to={profilePath}
            onClick={onProfileClick}
            title="Hồ sơ cá nhân"
            className="rounded-xl transition-transform hover:scale-105"
          >
            {avatarNode}
          </Link>
        ) : (
          avatarNode
        )}
        <button
          type="button"
          onClick={onLogout}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
          title="Đăng xuất"
        >
          <LogOut size={16} />
        </button>
      </div>
    );
  }

  if (variant === "drawer") {
    const identityContent = (
      <>
        <AdminUserAvatar
          src={user?.avatar}
          name={displayName}
          size="xs"
          className="rounded-lg"
        />
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-semibold text-slate-800 group-hover:text-brand dark:text-white">
            {displayName}
          </div>
          <div className="truncate text-[10px] font-medium text-slate-400 dark:text-slate-500">
            {roleLabel}
          </div>
        </div>
      </>
    );

    return (
      <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
        {profilePath ? (
          <Link
            to={profilePath}
            onClick={onProfileClick}
            title="Hồ sơ cá nhân"
            className="group flex min-w-0 flex-1 items-center gap-2.5 rounded-lg p-1 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            {identityContent}
          </Link>
        ) : (
          <div className="flex min-w-0 items-center gap-2.5">
            {identityContent}
          </div>
        )}
        <button
          type="button"
          onClick={onLogout}
          className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
        >
          <LogOut size={14} />
          <span>Thoát</span>
        </button>
      </div>
    );
  }

  const sidebarIdentity = (
    <>
      <AdminUserAvatar
        src={user?.avatar}
        name={displayName}
        size="sm"
        className="rounded-xl ring-2 ring-slate-200 dark:ring-slate-700"
      />
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-bold text-slate-900 group-hover:text-brand dark:text-white">
          {displayName}
        </div>
        <div className="truncate text-[11px] font-medium text-slate-400 dark:text-slate-500">
          {roleLabel}
        </div>
      </div>
    </>
  );

  return (
    <div className="flex items-center gap-2 rounded-xl p-1">
      {profilePath ? (
        <Link
          to={profilePath}
          onClick={onProfileClick}
          title="Hồ sơ cá nhân"
          className="group flex min-w-0 flex-1 items-center gap-3 rounded-xl p-1 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/70"
        >
          {sidebarIdentity}
        </Link>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-3 p-1">
          {sidebarIdentity}
        </div>
      )}
      <button
        type="button"
        onClick={onLogout}
        className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
        title="Đăng xuất"
      >
        <LogOut size={16} />
      </button>
    </div>
  );
};

export default AdminUserProfile;
