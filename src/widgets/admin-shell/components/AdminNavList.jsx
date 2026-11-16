import { PortalNavList } from "@/shared/ui/portal-shell";
import { NAV_GROUPS, isPathActive } from "../adminNavConfig";

export const AdminNavList = ({
  isCollapsed = false,
  userRole = "",
  onItemClick,
  showWebsiteLink = false,
}) => (
  <PortalNavList
    groups={NAV_GROUPS}
    isPathActive={isPathActive}
    isCollapsed={isCollapsed}
    userRole={userRole}
    onItemClick={onItemClick}
    showWebsiteLink={showWebsiteLink}
  />
);

export default AdminNavList;
