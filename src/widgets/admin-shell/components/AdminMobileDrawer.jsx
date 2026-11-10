import { PortalMobileDrawer } from "@/shared/ui/portal-shell";
import AdminBrand from "./AdminBrand";
import AdminNavList from "./AdminNavList";
import AdminUserProfile from "./AdminUserProfile";

export const AdminMobileDrawer = ({ isOpen, onClose, user, onLogout }) => (
  <PortalMobileDrawer
    isOpen={isOpen}
    onClose={onClose}
    brandSlot={<AdminBrand showBadge={false} />}
    navSlot={<AdminNavList onItemClick={onClose} showWebsiteLink={true} />}
    profileSlot={
      <AdminUserProfile
        user={user}
        onLogout={onLogout}
        onProfileClick={onClose}
        variant="drawer"
      />
    }
  />
);

export default AdminMobileDrawer;
