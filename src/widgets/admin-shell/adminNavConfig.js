import {
  ClipboardList,
  LayoutDashboard,
  SlidersHorizontal,
  UserPlus,
  Users,
} from "lucide-react";

export const NAV_GROUPS = [
  {
    title: "Tổng quan",
    items: [
      {
        path: "/admin/dashboard",
        label: "Bảng điều khiển",
        sublabel: "Chỉ số & thống kê",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Kinh doanh & Vận hành",
    items: [
      {
        path: "/admin/service-orders",
        label: "Đơn dịch vụ",
        sublabel: "Quy trình & xử lý đơn",
        icon: ClipboardList,
      },
      {
        path: "/admin/services",
        label: "Dịch vụ thiết kế",
        sublabel: "Bảng giá & danh mục",
        icon: SlidersHorizontal,
      },
    ],
  },
  {
    title: "Người dùng & Phân quyền",
    items: [
      {
        path: "/admin/users",
        label: "Danh sách người dùng",
        sublabel: "Khách hàng & nhân sự",
        icon: Users,
      },
      {
        path: "/admin/users/create",
        label: "Thêm tài khoản",
        sublabel: "Khởi tạo thành viên",
        icon: UserPlus,
      },
    ],
  },
];

export const BREADCRUMB_MAP = {
  "/admin": "Admin",
  "/admin/dashboard": "Bảng điều khiển",
  "/admin/service-orders": "Đơn dịch vụ",
  "/admin/services": "Dịch vụ thiết kế",
  "/admin/users": "Người dùng",
  "/admin/users/create": "Thêm tài khoản",
};

export const QUICK_ACTIONS = [
  {
    path: "/admin/users/create",
    title: "Tạo người dùng",
    subtitle: "Thêm tài khoản mới",
    icon: UserPlus,
    colorClass: "bg-blue-50 text-brand dark:bg-blue-950/50",
  },
  {
    path: "/admin/services",
    title: "Dịch vụ thiết kế",
    subtitle: "Quản lý bảng giá",
    icon: SlidersHorizontal,
    colorClass:
      "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400",
  },
  {
    path: "/admin/service-orders",
    title: "Đơn dịch vụ",
    subtitle: "Theo dõi tiến độ đơn",
    icon: ClipboardList,
    colorClass:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
  },
];

export const isPathActive = (currentPath, targetPath) => {
  if (targetPath === "/admin/dashboard") {
    return currentPath === "/admin" || currentPath === "/admin/dashboard";
  }
  return currentPath.startsWith(targetPath);
};

export const getBreadcrumbTitle = (pathname) => {
  const match = Object.keys(BREADCRUMB_MAP).find(
    (p) => pathname === p || (p !== "/admin" && pathname.startsWith(`${p}/`)),
  );
  return BREADCRUMB_MAP[match] || "Chi tiết";
};
