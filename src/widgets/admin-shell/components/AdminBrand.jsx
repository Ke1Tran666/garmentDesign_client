import { PortalBrand } from "@/shared/ui/portal-shell";

export const AdminBrand = ({
  isCollapsed = false,
  showBadge = true,
  className = "",
}) => (
  <PortalBrand
    to="/admin/dashboard"
    title="HoaTran maymac Admin"
    portalLabel="Admin Portal"
    isCollapsed={isCollapsed}
    showBadge={showBadge}
    className={className}
  />
);

export default AdminBrand;
