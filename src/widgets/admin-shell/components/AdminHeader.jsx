import { useLocation } from "react-router-dom";
import { PortalHeader } from "@/shared/ui/portal-shell";
import { getBreadcrumbTitle } from "../adminNavConfig";
import AdminQuickCreateDropdown from "./AdminQuickCreateDropdown";
import AdminUserDropdown from "./AdminUserDropdown";

export const AdminHeader = ({
  user,
  onLogout,
  onOpenMobileMenu,
  searchKeyword,
  onSearchKeywordChange,
}) => {
  const location = useLocation();
  const currentBreadcrumb = getBreadcrumbTitle(location.pathname);

  return (
    <PortalHeader
      homeTo="/admin/dashboard"
      homeLabel="Admin"
      breadcrumbTitle={currentBreadcrumb}
      onOpenMobileMenu={onOpenMobileMenu}
      searchKeyword={searchKeyword}
      onSearchKeywordChange={onSearchKeywordChange}
      searchPlaceholder="Tìm kiếm dữ liệu toàn hệ thống..."
      quickActionsSlot={<AdminQuickCreateDropdown />}
      userDropdownSlot={<AdminUserDropdown user={user} onLogout={onLogout} />}
    />
  );
};

export default AdminHeader;
