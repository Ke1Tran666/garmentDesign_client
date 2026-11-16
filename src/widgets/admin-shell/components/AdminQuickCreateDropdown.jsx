import { PortalQuickActionDropdown } from "@/shared/ui/portal-shell";
import { QUICK_ACTIONS } from "../adminNavConfig";

export const AdminQuickCreateDropdown = () => (
  <PortalQuickActionDropdown
    actions={QUICK_ACTIONS}
    buttonLabel="Thêm nhanh"
    sectionTitle="Tác vụ nhanh"
  />
);

export default AdminQuickCreateDropdown;
