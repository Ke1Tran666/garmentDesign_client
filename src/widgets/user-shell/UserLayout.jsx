import {
  User,
  LayoutDashboard,
  ClipboardList,
  ChevronDown,
  Shield,
  Lock,
  LineChart,
  FolderDown,
  Plug,
  HelpCircle,
  CircleDot,
  MapPin,
  ShoppingBag,
  Star,
  Settings,
  BellRing,
  Monitor,
  Settings2,
  Globe,
} from "lucide-react";

import { LAYOUT_GROUP_THEME } from "@/shared/config/layoutTheme";
import DashboardLayout from "../dashboard-shell/DashboardLayout";

const GROUPS = [
  {
    btn: {
      icon: ChevronDown,
      ...LAYOUT_GROUP_THEME.main,
    },
    label: "Main",
    items: [
      { 
        icon: LayoutDashboard,
        label: "Dashboard",
        text: "Tổng quan file, đơn hàng và task cần xử lý",
        path: "/user/dashboard",
      },
      { 
        icon: ClipboardList, 
        label: "Service Orders",
        text:"",
        path: "/user/service-order"
      },
      { 
        icon: User, 
        label: "My Profile",
        text: "Personal Information",
        path: "/user/profile", 
      },
      {
        icon: Star,
        label: "Service Reviews",
        text: "",
        path: "/user/service-reviews",
      },
    ],
    defaultItem: 0,
  },
  {
    btn: {
      icon: ShoppingBag,
      ...LAYOUT_GROUP_THEME.management,
    },
    label: "Service",
    items: [
      { 
        icon: ClipboardList, 
        label: "Service Orders",
        text:"",
        path: "/user/service-order"
      },
      {
        icon: Star,
        label: "Service Reviews",
        text: "",
        path: "/user/service-reviews",
      },
    ],
    defaultItem: 0,
  },
  {
    btn: {
      icon: CircleDot,
      ...LAYOUT_GROUP_THEME.brand,
    },
    label: "Account",
    items: [
      {
        icon: User,
        label: "My Profile",
        text: "Personal Information",
        path: "/user/profile",
      },
      {
        icon: MapPin,
        label: "My Address",
        text: "Personal address",
        path: "/user/address",
      },
      { 
        icon: Shield, 
        label: "Security",
        text: "Personal security",
        path: "/user/security",
      },
      { 
        icon: Lock, 
        label: "Privacy",
        text: "Personal privacy",
        path: "/user/privacy",
      },
    ],
    defaultItem: 0,
  },
  {
    btn: {
      icon: Settings,
      ...LAYOUT_GROUP_THEME.surface,
    },
    label: "Settings",
    items: [
      { icon: Globe,label: "General" },
      { icon: BellRing, label: "Notifications" },
      { icon: Monitor, label: "Display" },
      { icon: Settings2, label: "Preferences" },
      { icon: LineChart, label: "Analytics" },
      { icon: FolderDown, label: "Export" },
      { icon: Plug, label: "Integrations" },
      { icon: HelpCircle, label: "Help" },
    ],
    defaultItem: 0,
  }
];

const UserLayout = ({ title = "My Account" }) => (
  <DashboardLayout
    title={title}
    groups={GROUPS}
    initialGroup={2}
    storageKey="user-aside-collapsed"
    sidebarId="user-sidebar"
    fallbackName="Guest"
    profilePath="/user/profile"
    logoutLabel="Logout"
    LogoutIcon={Lock}
    breadcrumbLabel="Home"
  />
);

export default UserLayout;
