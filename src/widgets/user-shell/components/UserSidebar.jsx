import { PortalSidebar } from "@/shared/ui/portal-shell";
import UserBrand from "./UserBrand";
import UserNavList from "./UserNavList";
import UserUserProfile from "./UserUserProfile";

export const UserSidebar = ({
  isCollapsed,
  onToggleCollapse,
  user,
  onLogout,
}) => (
  <PortalSidebar
    isCollapsed={isCollapsed}
    onToggleCollapse={onToggleCollapse}
    brandSlot={<UserBrand isCollapsed={isCollapsed} />}
    navSlot={<UserNavList isCollapsed={isCollapsed} userRole={user} />}
    statusBadgeText="Tài khoản khách hàng"
    statusLabel="Hoạt động"
    profileSlot={
      <UserUserProfile
        user={user}
        onLogout={onLogout}
        isCollapsed={isCollapsed}
        variant="sidebar"
      />
    }
  />
);

export default UserSidebar;
