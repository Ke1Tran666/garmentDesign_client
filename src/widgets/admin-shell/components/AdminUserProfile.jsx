import { normalizeRole, resolveAppRole } from "@/features/auth/lib/authRole";
import { PortalUserProfile } from "@/shared/ui/portal-shell";

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

  return (
    <PortalUserProfile
      avatarSrc={user?.avatar}
      displayName={displayName}
      roleLabel={roleLabel}
      profilePath={profilePath}
      fallbackInitials="AD"
      onLogout={onLogout}
      onProfileClick={onProfileClick}
      isCollapsed={isCollapsed}
      variant={variant}
    />
  );
};

export default AdminUserProfile;
