import { Globe, Settings, ShieldCheck, User } from "lucide-react";
import { normalizeRole, resolveAppRole } from "@/features/auth/lib/authRole";
import { PortalUserDropdown } from "@/shared/ui/portal-shell";

const getRoleLabel = (user) => {
  const rawName = user?.role || user?.roleName || "";
  const normalized = normalizeRole(rawName);
  if (normalized === "admin") return "Quản trị viên";
  if (normalized === "staff") return "Nhân viên";
  if (rawName) return rawName;
  return resolveAppRole(user) === "staff" ? "Nhân viên" : "Quản trị viên";
};

export const AdminUserDropdown = ({ user, onLogout }) => {
  const displayName = user?.fullName || user?.userCode || "Administrator";
  const roleLabel = getRoleLabel(user?.role || user?.roleName);
  const profilePath = user?.idUser
    ? `/admin/users/${encodeURIComponent(user.idUser)}`
    : "/admin/users";

  const menuItems = [
    {
      id: "profile",
      type: "link",
      to: profilePath,
      label: "Hồ sơ cá nhân",
      icon: User,
    },
    {
      id: "settings",
      type: "disabled",
      label: "Cài đặt",
      icon: Settings,
      badgeText: "Đang phát triển",
    },
    {
      id: "website",
      type: "link",
      to: "/",
      label: "Xem trang web",
      icon: Globe,
    },
  ];

  return (
    <PortalUserDropdown
      avatarSrc={user?.avatar}
      displayName={displayName}
      roleLabel={roleLabel}
      RoleBadgeIcon={ShieldCheck}
      triggerAriaLabel="Menu tài khoản quản trị"
      fallbackInitials="AD"
      menuItems={menuItems}
      onLogout={onLogout}
    />
  );
};

export default AdminUserDropdown;
