import {
  ClipboardList,
  LayoutDashboard,
  Lock,
  MapPin,
  PackagePlus,
  ShieldCheck,
  Star,
  User,
} from "lucide-react";

export const USER_NAV_GROUPS = [
  {
    title: "Tổng quan",
    items: [
      {
        path: "/user/dashboard",
        label: "Bảng điều khiển",
        sublabel: "Đơn hàng & tệp tin",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Dịch vụ may mặc",
    items: [
      {
        path: "/user/service-order",
        label: "Đơn dịch vụ",
        sublabel: "Đặt đơn & theo dõi tiến độ",
        icon: ClipboardList,
      },
      {
        path: "/user/service-reviews",
        label: "Đánh giá dịch vụ",
        sublabel: "Phản hồi đơn đã hoàn tất",
        icon: Star,
      },
    ],
  },
  {
    title: "Tài khoản & Bảo mật",
    items: [
      {
        path: "/user/profile",
        label: "Hồ sơ cá nhân",
        sublabel: "Thông tin, SĐT & email",
        icon: User,
      },
      {
        path: "/user/address",
        label: "Sổ địa chỉ",
        sublabel: "Địa chỉ giao nhận hàng",
        icon: MapPin,
      },
      {
        path: "/user/security",
        label: "Bảo mật",
        sublabel: "Mật khẩu & xác thực",
        icon: ShieldCheck,
      },
      {
        path: "/user/privacy",
        label: "Quyền riêng tư",
        sublabel: "Dữ liệu & trạng thái tài khoản",
        icon: Lock,
      },
    ],
  },
];

export const USER_BREADCRUMB_MAP = {
  "/user": "Tài khoản",
  "/user/dashboard": "Bảng điều khiển",
  "/user/service-order": "Đơn dịch vụ",
  "/user/service-reviews": "Đánh giá dịch vụ",
  "/user/profile": "Hồ sơ cá nhân",
  "/user/address": "Sổ địa chỉ",
  "/user/security": "Bảo mật",
  "/user/privacy": "Quyền riêng tư",
};

export const USER_QUICK_ACTIONS = [
  {
    path: "/user/service-order?create=1",
    title: "Tạo đơn dịch vụ",
    subtitle: "Đặt thiết kế rập / in sơ đồ",
    icon: PackagePlus,
    colorClass: "bg-blue-50 text-brand dark:bg-blue-950/50",
  },
  {
    path: "/user/service-reviews",
    title: "Đánh giá dịch vụ",
    subtitle: "Gửi nhận xét đơn hoàn tất",
    icon: Star,
    colorClass:
      "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
  },
  {
    path: "/user/address",
    title: "Quản lý địa chỉ",
    subtitle: "Thêm hoặc đặt địa chỉ mặc định",
    icon: MapPin,
    colorClass:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
  },
];

export const isUserPathActive = (currentPath, targetPath) => {
  if (targetPath === "/user/dashboard") {
    return currentPath === "/user/dashboard";
  }

  return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
};

export const getUserBreadcrumbTitle = (pathname) => {
  const keys = Object.keys(USER_BREADCRUMB_MAP);
  const match =
    keys.find((p) => pathname === p) ||
    keys.find((p) => p !== "/user" && pathname.startsWith(`${p}/`));
  return USER_BREADCRUMB_MAP[match] || "Tài khoản";
};
