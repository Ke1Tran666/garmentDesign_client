import { PortalQuickActionDropdown } from "@/shared/ui/portal-shell";
import { USER_QUICK_ACTIONS } from "../userNavConfig";

export const UserQuickActionDropdown = () => (
  <PortalQuickActionDropdown
    actions={USER_QUICK_ACTIONS}
    buttonLabel="Thao tác nhanh"
    sectionTitle="Tác vụ nhanh"
  />
);

export default UserQuickActionDropdown;
