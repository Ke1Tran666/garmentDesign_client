import { PortalMobileDrawer } from "@/shared/ui/portal-shell";
import UserBrand from "./UserBrand";
import UserNavList from "./UserNavList";
import UserUserProfile from "./UserUserProfile";

export const UserMobileDrawer = ({ isOpen, onClose, user, onLogout }) => (
  <PortalMobileDrawer
    isOpen={isOpen}
    onClose={onClose}
    brandSlot={<UserBrand showBadge={false} />}
    navSlot={<UserNavList onItemClick={onClose} showWebsiteLink={true} />}
    profileSlot={
      <UserUserProfile
        user={user}
        onLogout={onLogout}
        onProfileClick={onClose}
        variant="drawer"
      />
    }
  />
);

export default UserMobileDrawer;
