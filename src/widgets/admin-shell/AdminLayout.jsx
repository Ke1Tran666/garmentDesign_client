import {
  ClipboardList,
  LayoutDashboard,
  MessageSquareText,
  Settings,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import { LAYOUT_GROUP_THEME } from "@/shared/config/layoutTheme";
import DashboardLayout from "../dashboard-shell/DashboardLayout";

const ADMIN_GROUPS = [
  {
    btn: {
      icon: LayoutDashboard,
      ...LAYOUT_GROUP_THEME.main,
    },
    label: "Tổng quan",
    items: [
      {
        icon: LayoutDashboard,
        label: "Dashboard",
        text: "Theo dõi hoạt động và hiệu suất hệ thống.",
        path: "/admin/dashboard",
        available: true,
      },
    ],
    defaultItem: 0,
  },
  {
    btn: {
      icon: ShoppingBag,
      ...LAYOUT_GROUP_THEME.management,
    },
    label: "Quản lý",
    items: [
      {
        icon: Users,
        label: "Người dùng",
        text: "Quản lý tài khoản người dùng.",
        path: "/admin/users",
        available: true,
      },
      {
        icon: ClipboardList,
        label: "Đơn dịch vụ",
        text: "Theo dõi và xử lý đơn hàng.",
        path: "/admin/service-orders",
        available: false,
      },
      {
        icon: SlidersHorizontal,
        label: "Dịch vụ",
        text: "Thiết lập danh mục dịch vụ.",
        path: "/admin/services",
        available: true,
      },
      {
        icon: MessageSquareText,
        label: "Đánh giá",
        text: "Quản lý đánh giá khách hàng.",
        path: "/admin/reviews",
        available: false,
      },
    ],
    defaultItem: 0,
  },
  {
    btn: {
      icon: ShieldCheck,
      ...LAYOUT_GROUP_THEME.brand,
    },
    label: "Hệ thống",
    items: [
      {
        icon: ShieldCheck,
        label: "Vai trò & quyền",
        text: "Thiết lập quyền truy cập.",
        path: "/admin/roles",
        available: false,
      },
      {
        icon: Settings,
        label: "Cài đặt",
        text: "Cấu hình hệ thống.",
        path: "/admin/settings",
        available: false,
      },
    ],
    defaultItem: 0,
  },
];

const getAdminOutletContext = ({ searchKeyword, user }) => ({
  searchKeyword,
  adminUser: user,
});

const AdminLayout = ({ title = "Admin Panel" }) => (
  <DashboardLayout
    title={title}
    groups={ADMIN_GROUPS}
    initialGroup={0}
    storageKey="admin-aside-collapsed"
    sidebarId="admin-sidebar"
    fallbackName="Administrator"
    getOutletContext={getAdminOutletContext}
    breadcrumbLabel="Admin"
    roleLabel="Khu vực quản trị"
    RoleIcon={ShieldCheck}
  />
);

export default AdminLayout;
