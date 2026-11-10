import { PortalUserAvatar } from "@/shared/ui/portal-shell";

export const AdminUserAvatar = ({
  src,
  name = "Admin",
  size = "sm",
  className = "",
  ring = true,
  showStatus = false,
  statusColor = "bg-emerald-500",
}) => (
  <PortalUserAvatar
    src={src}
    name={name}
    size={size}
    className={className}
    ring={ring}
    showStatus={showStatus}
    statusColor={statusColor}
    fallbackInitials="AD"
  />
);

export default AdminUserAvatar;
