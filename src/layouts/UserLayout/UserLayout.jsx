import { useEffect, useState } from "react";
import {
  Bell,
  User,
  LayoutDashboard,
  ClipboardList,
  FileText,
  BarChart2,
  ChevronDown,
  Shield,
  Lock,
  LineChart,
  FolderDown,
  Plug,
  HelpCircle,
  CircleDot,
  ChevronRight,
  MapPin,
  ShoppingBag,
  PackageCheck,
  Star,
  Settings,
  BellRing,
  Monitor,
  Settings2,
  Globe,
  CreditCard,
} from "lucide-react";

import Logo from "../../components/common/Logo/Logo";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

import defaultAvatar from "@/assets/images/avatar-default.jpg";
import { USER_API } from "@/api/config";
import { ButtonIcon } from "@/components/ui/Button/Button";
import GooeySearchBar from "@/components/ui/Search/GooeyInput/GooeySearchBar";

const BRAND = "var(--color-brand)";
const BRAND_SHADOW = "rgba(1,146,245,0.35)";

const GROUPS = [
  {
    btn: {
      icon: ChevronDown,
      bg: "#202124",
      shadow: "rgba(0,0,0,0.25)",
      dark: false,
    },
    label: "Main",
    items: [
      { 
        icon: LayoutDashboard,
        label: "Dashboard",
        text: "Tổng quan file, đơn hàng và task cần xử lý",
        path: "/user/dashboard",
      },
      { icon: ClipboardList, label: "Appoint List" },
      { 
        icon: User, 
        label: "My Profile",
        text: "Personal Information",
        path: "/user/profile", 
      },
      { icon: FileText, label: "Reports" },
      { icon: BarChart2, label: "Clinic Overview" },
    ],
    defaultItem: 0,
  },
  {
    btn: {
      icon: ShoppingBag,
      bg: "#7C3AED",
      shadow: "rgba(124,58,237,0.35)",
      dark: false,
    },
    label: "Dịch vụ",
    items: [
      {
        icon: ShoppingBag,
        label: "Đặt dịch vụ",
        text: "Tạo đơn hàng thiết kế, chỉnh sửa hoặc yêu cầu dịch vụ mới",
        path: "/user/services",
      },
      {
        icon: PackageCheck,
        label: "Đơn hàng của tôi",
        text: "Quản lý các đơn hàng dịch vụ đã đặt",
        path: "/user/service-orders",
      },
      {
        icon: Star,
        label: "Đánh giá dịch vụ",
        text: "Đánh giá đơn hàng sau khi hoàn tất",
        path: "/user/service-reviews",
      },
    ],
    defaultItem: 0,
  },
  {
    btn: {
      icon: CircleDot,
      bg: BRAND,
      shadow: BRAND_SHADOW,
      dark: false,
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
      { icon: Lock, label: "Privacy" },
      { icon: CreditCard, label: "Billing" },
    ],
    defaultItem: 0,
  },
  {
    btn: {
      icon: Settings,
      bg: "#ffffff",
      shadow: "rgba(15,23,42,0.08)",
      dark: true,
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

const UserLayout = ({ title = "My Account" }) => {
  const [activeGroup, setActiveGroup] = useState(2);
  const [activeItem, setActiveItem] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [user, setUser] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  
  const [openUserMenu, setOpenUserMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("idUser");
    localStorage.removeItem("user");
    localStorage.removeItem("authProviders");

    navigate("/");
  };

  const findActiveRoute = () => {
    const currentGroupItemIndex = GROUPS[activeGroup].items.findIndex(
      (item) => item.path === location.pathname
    );

    if (currentGroupItemIndex !== -1) {
      return { gIndex: activeGroup, itemIndex: currentGroupItemIndex };
    }

    for (let gIndex = 0; gIndex < GROUPS.length; gIndex++) {
      const itemIndex = GROUPS[gIndex].items.findIndex(
        (item) => item.path === location.pathname
      );

      if (itemIndex !== -1) {
        return { gIndex, itemIndex };
      }
    }

    return null;
  };

  const activeRoute = findActiveRoute();

  const displayGroupIndex = activeRoute?.gIndex ?? activeGroup;
  const displayItemIndex = activeRoute?.itemIndex ?? activeItem;

  const currentGroup = GROUPS[displayGroupIndex];
  const currentItem = currentGroup.items[displayItemIndex];

  useEffect(() => {
    const loadUser = async () => {
      try {
        const idUser = localStorage.getItem("idUser");

        if (!idUser) return;

        const response = await axios.get(`${USER_API}/me/${idUser}`);

        setUser(response.data?.user);
      } catch (error) {
        console.error("Không thể tải thông tin user:", error);
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = () => {
      setOpenUserMenu(false);
    };

    if (openUserMenu) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [openUserMenu]);

  const handleGroupChange = (gIndex) => {
    const defaultItem = GROUPS[gIndex].defaultItem;
    const defaultPath = GROUPS[gIndex].items[defaultItem]?.path;

    setActiveGroup(gIndex);
    setActiveItem(defaultItem);

    if (defaultPath) {
      navigate(defaultPath);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 10) return "Chào buổi sáng";
    if (hour >= 10 && hour < 13) return "Chào buổi trưa";
    if (hour >= 13 && hour < 18) return "Chào buổi chiều";

    return "Chào buổi tối";
  };

  return (
    <div className="mx-auto flex min-h-screen w-full overflow-hidden bg-zinc-50">
      <aside className="flex w-72 flex-col px-6 py-8">
        <Logo />

        <div className="mb-10 mt-10 flex flex-col items-center justify-center">
          <h2 className="text-xl font-semibold text-[#101828]">
            {getGreeting()}
          </h2>

          <h3 className="mt-2 text-base font-semibold text-[#1570EF]">
            {user?.fullName || user?.userCode || "Guest"}
          </h3>

          <p className="mt-3 text-sm text-[#667085]">
            {new Date().toLocaleDateString("vi-VN", {
              weekday: "short",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </p>
        </div>

        <nav className="mt-4 space-y-1">
          {currentGroup.items.map((item, index) => {
            const Icon = item.icon;

            return (
              <SidebarItem
                key={item.label}
                icon={<Icon size={18} />}
                label={item.label}
                active={displayItemIndex === index}
                onClick={() => {
                  setActiveGroup(displayGroupIndex);
                  setActiveItem(index);

                  if (item.path) {
                    navigate(item.path);
                  }
                }}
              />
            );
          })}
        </nav>

        <div className="mt-3 flex items-center justify-center gap-3">
          {GROUPS.map((group, gIndex) => {
            const isActive = displayGroupIndex === gIndex;
            const BtnIcon = group.btn.icon;

            return (
              <button
                key={group.label}
                type="button"
                onClick={() => handleGroupChange(gIndex)}
                style={
                  isActive
                    ? {
                        backgroundColor: group.btn.bg,
                        boxShadow: `0 10px 25px ${group.btn.shadow}`,
                      }
                    : {}
                }
                className={`flex items-center justify-center rounded-full transition-all duration-300 hover:-translate-y-1 hover:scale-105 ${
                  isActive
                    ? `h-12 w-12 ${
                        group.btn.dark ? "text-gray-700" : "text-white"
                      }`
                    : "h-10 w-10 bg-white text-gray-400 shadow-[0_4px_12px_rgba(15,23,42,0.08)] hover:bg-gray-50"
                }`}
              >
                <BtnIcon size={isActive ? 18 : 16} />
              </button>
            );
          })}
        </div>

        <p
          className="mt-3 text-center text-sm font-medium transition-all duration-300"
          style={{
            color:
              currentGroup.btn.bg === "#ffffff"
                ? "#64748b"
                : currentGroup.btn.bg,
          }}
        >
          {currentGroup.label}
        </p>
      </aside>

      <main className="m-2 flex-1 rounded-xl bg-white p-8">
        <div className="mb-4 flex items-center justify-between">
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-400">
            <span>Home</span>

            <ChevronRight size={14} />

            <span className="font-medium text-gray-700">
              {currentGroup.label}
            </span>

            <ChevronRight size={14} />

            <span className="font-medium text-gray-700">
              {currentItem?.label}
            </span>
          </div>

          <div className="flex items-center justify-center gap-4">
            <ButtonIcon
              icon={Bell}
              sizeIcon={22}
              className="
                relative
                bg-linear-to-br from-indigo-500 to-brand shadow-lg
                hover:from-indigo-600 hover:to-brand hover:shadow-xl
                active:scale-95
              "
              classNameIcon="text-white"
            >
              <span
                className="
                  absolute right-2 top-2 h-2.5 w-2.5 animate-pulse rounded-full bg-yellow-300 shadow-lg shadow-yellow-300/50
                "
              />
            </ButtonIcon>

            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenUserMenu((prev) => !prev);
                }}
                className="
                  flex items-center gap-3
                  rounded-xl px-2 py-1
                  hover:bg-gray-50
                  transition
                "
              >
                <img
                  src={user?.avatar || defaultAvatar}
                  alt={user?.fullName || "User"}
                  className="h-10 w-10 rounded-xl object-cover"
                />

                <span className="font-semibold text-gray-800">
                  {user?.fullName || "Guest"}
                </span>

                <ChevronDown
                  size={16}
                  className={`transition ${
                    openUserMenu ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openUserMenu && (
                <div
                  className="
                    absolute right-0 top-full mt-2
                    w-48 rounded-xl border border-gray-200
                    bg-white p-2 shadow-lg z-50
                  "
                >
                  <button
                    onClick={() => {
                      navigate("/user/profile");
                      setOpenUserMenu(false);
                    }}
                    className="
                      flex w-full items-center gap-3
                      rounded-lg px-3 py-2
                      text-sm text-gray-700
                      hover:bg-gray-100
                    "
                  >
                    <User size={16} />
                    My Profile
                  </button>

                  <button
                    onClick={handleLogout}
                    className="
                      flex w-full items-center gap-3
                      rounded-lg px-3 py-2
                      text-sm text-red-600
                      hover:bg-red-50
                    "
                  >
                    <Lock size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <header className="flex items-center justify-between border-b-3 border-zinc-50 py-6">
          <div className="flex flex-col justify-center gap-2">
            <h2 className="text-3xl font-bold text-gray-900">
              {currentItem?.label || title}
            </h2>

            <p className="text-m text-[#667085]">
              {currentItem?.text}
            </p>
          </div>

          <GooeySearchBar
            value={searchKeyword}
            onSearch={setSearchKeyword}
          />
        </header>

        <section className="p-4">
          <Outlet context={{ searchKeyword }} />
        </section>
      </main>
    </div>
  );
};

const SidebarItem = ({ icon, label, active, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      style={active ? { color: BRAND } : {}}
      className={`mb-2 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-white shadow-sm"
          : "text-gray-500 hover:bg-white hover:text-gray-700"
      }`}
    >
      {icon}
      {label}
    </button>
  );
};

export default UserLayout;