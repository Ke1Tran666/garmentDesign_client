import { PortalSidebar } from "@/shared/ui/portal-shell";
import AdminBrand from "./AdminBrand";
import AdminNavList from "./AdminNavList";
import AdminUserProfile from "./AdminUserProfile";

export const AdminSidebar = ({
  isCollapsed,
  onToggleCollapse,
  user,
  onLogout,
}) => (
  <PortalSidebar
    isCollapsed={isCollapsed}
    onToggleCollapse={onToggleCollapse}
    brandSlot={<AdminBrand isCollapsed={isCollapsed} />}
    navSlot={<AdminNavList isCollapsed={isCollapsed} userRole={user} />}
    statusBadgeText="Hệ thống hoạt động"
    statusLabel="Trực tuyến"
    profileSlot={
      <AdminUserProfile
        user={user}
        onLogout={onLogout}
        isCollapsed={isCollapsed}
        variant="sidebar"
      />
    }
  />
);

export default AdminSidebar;
