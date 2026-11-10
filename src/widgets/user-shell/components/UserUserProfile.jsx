import { PortalUserProfile } from "@/shared/ui/portal-shell";

export const UserUserProfile = ({
  user,
  onLogout,
  onProfileClick,
  isCollapsed = false,
  variant = "sidebar",
}) => {
  const displayName = user?.fullName || user?.userCode || "Khách hàng";
  const roleLabel = user?.userCode ? `Mã KH: ${user.userCode}` : "Khách hàng";

  return (
    <PortalUserProfile
      avatarSrc={user?.avatar}
      displayName={displayName}
      roleLabel={roleLabel}
      profilePath="/user/profile"
      profileTitle="Hồ sơ cá nhân"
      fallbackInitials="US"
      onLogout={onLogout}
      onProfileClick={onProfileClick}
      isCollapsed={isCollapsed}
      variant={variant}
    />
  );
};

export default UserUserProfile;
