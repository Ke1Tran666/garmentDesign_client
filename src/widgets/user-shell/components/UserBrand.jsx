import { PortalBrand } from "@/shared/ui/portal-shell";

export const UserBrand = ({
  isCollapsed = false,
  showBadge = true,
  className = "",
}) => (
  <PortalBrand
    to="/user/dashboard"
    title="HoaTran maymac"
    portalLabel="Khách hàng"
    isCollapsed={isCollapsed}
    showBadge={showBadge}
    className={className}
  />
);

export default UserBrand;
