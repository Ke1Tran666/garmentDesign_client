import { ClipboardList, Globe, MapPin, User, UserCheck } from "lucide-react";
import { PortalUserDropdown } from "@/shared/ui/portal-shell";

export const UserUserDropdown = ({ user, onLogout }) => {
  const displayName = user?.fullName || user?.userCode || "Khách hàng";
  const roleLabel = "Khách hàng";

  const menuItems = [
    {
      id: "profile",
      type: "link",
      to: "/user/profile",
      label: "Hồ sơ cá nhân",
      icon: User,
    },
    {
      id: "service-orders",
      type: "link",
      to: "/user/service-order",
      label: "Đơn dịch vụ của tôi",
      icon: ClipboardList,
    },
    {
      id: "address",
      type: "link",
      to: "/user/address",
      label: "Sổ địa chỉ",
      icon: MapPin,
    },
    {
      id: "website",
      type: "link",
      to: "/",
      label: "Xem trang web",
      icon: Globe,
    },
  ];

  return (
    <PortalUserDropdown
      avatarSrc={user?.avatar}
      displayName={displayName}
      roleLabel={roleLabel}
      RoleBadgeIcon={UserCheck}
      triggerAriaLabel="Menu tài khoản người dùng"
      fallbackInitials="US"
      menuItems={menuItems}
      onLogout={onLogout}
    />
  );
};

export default UserUserDropdown;
