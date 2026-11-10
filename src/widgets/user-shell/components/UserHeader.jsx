import { useLocation } from "react-router-dom";
import { PortalHeader } from "@/shared/ui/portal-shell";
import { getUserBreadcrumbTitle } from "../userNavConfig";
import UserQuickActionDropdown from "./UserQuickActionDropdown";
import UserUserDropdown from "./UserUserDropdown";

export const UserHeader = ({
  user,
  onLogout,
  onOpenMobileMenu,
  searchKeyword,
  onSearchKeywordChange,
}) => {
  const location = useLocation();
  const currentBreadcrumb = getUserBreadcrumbTitle(location.pathname);

  return (
    <PortalHeader
      homeTo="/user/dashboard"
      homeLabel="Tài khoản"
      breadcrumbTitle={currentBreadcrumb}
      onOpenMobileMenu={onOpenMobileMenu}
      searchKeyword={searchKeyword}
      onSearchKeywordChange={onSearchKeywordChange}
      searchPlaceholder="Tìm đơn hàng, địa chỉ, hồ sơ..."
      quickActionsSlot={<UserQuickActionDropdown />}
      userDropdownSlot={<UserUserDropdown user={user} onLogout={onLogout} />}
    />
  );
};

export default UserHeader;
