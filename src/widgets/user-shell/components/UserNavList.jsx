import { PortalNavList } from "@/shared/ui/portal-shell";
import { USER_NAV_GROUPS, isUserPathActive } from "../userNavConfig";

export const UserNavList = ({
  isCollapsed = false,
  userRole = "",
  onItemClick,
  showWebsiteLink = false,
}) => (
  <PortalNavList
    groups={USER_NAV_GROUPS}
    isPathActive={isUserPathActive}
    isCollapsed={isCollapsed}
    userRole={userRole}
    onItemClick={onItemClick}
    showWebsiteLink={showWebsiteLink}
  />
);

export default UserNavList;
