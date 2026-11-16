import { PortalUserAvatar } from "@/shared/ui/portal-shell";

export const UserUserAvatar = ({
  src,
  name = "Khách hàng",
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
    fallbackInitials="US"
  />
);

export default UserUserAvatar;
