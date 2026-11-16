import UserAvatar from "@/shared/ui/avatar/UserAvatar";

export const PortalUserAvatar = ({
  src,
  name = "User",
  size = "sm",
  className = "",
  ring = true,
  showStatus = false,
  statusColor = "bg-emerald-500",
  fallbackInitials = "US",
}) => (
  <UserAvatar
    src={src}
    name={name}
    size={size}
    className={className}
    ring={ring}
    showStatus={showStatus}
    statusColor={statusColor}
    fallbackInitials={fallbackInitials}
  />
);

export default PortalUserAvatar;
