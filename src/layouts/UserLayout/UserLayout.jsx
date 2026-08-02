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
  Star,
  Settings,
  BellRing,
  Monitor,
  Settings2,
  Globe,
  PanelLeftOpen,
  PanelLeftClose,
} from "lucide-react";

import Logo from "../../components/common/Logo/Logo";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import defaultAvatar from "@/assets/images/avatar-default.jpg";
import { ButtonIcon } from "@/components/ui/Button/Button";
import GooeySearchBar from "@/components/ui/Search/GooeyInput/GooeySearchBar";
import { authStorage } from "@/lib/authStorage";
import { userApi } from "@/api/userApi";

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
    authStorage.clear();
    navigate("/");
  };

  const [isAsideCollapsed,setIsAsideCollapsed] = useState(() => {
    return (
      localStorage.getItem(
        "user-aside-collapsed",
      ) === "true"
    );
  });

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
    localStorage.setItem(
      "user-aside-collapsed",
      String(isAsideCollapsed),
    );
  }, [isAsideCollapsed]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const idUser = authStorage.getUserId();

        if (!idUser) return;

        const data = await userApi.getMe(idUser);

        setUser(data?.user);
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
    <div className="mx-auto flex min-h-screen w-full bg-surface-subtle">
      <aside
        id="user-sidebar"
        className={`
          sticky top-0 flex h-screen shrink-0 flex-col border-r border-border-subtle bg-surface-subtle py-8 
          transition-[width,padding] duration-300 ease-in-out
          ${isAsideCollapsed ? "w-20 px-3" : "w-72 px-6"}
        `}
      >
        <div className="shrink-0">
          <Logo className={isAsideCollapsed ? "[&>span]:hidden" : ""}
          />
        </div>

        {isAsideCollapsed ? (
          <button
            type="button"
            onClick={() =>
              navigate("/user/profile")
            }
            title={user?.fullName || user?.userCode || "Guest"}
            className="
              mx-auto mb-7 mt-8 flex h-11 w-11 items-center justify-center
              overflow-hidden rounded-2xl border-2 border-surface bg-surface 
              shadow-sm transition hover:scale-105
            "
          >
            <img
              src={user?.avatar || defaultAvatar}
              alt={user?.fullName || "User"}
              className="h-full w-full object-cover"
            />
          </button>
        ) : (
          <div className="mb-10 mt-10 flex flex-col items-center justify-center">
            <h2 className="text-xl font-semibold text-text-strong">
              {getGreeting()}
            </h2>

            <h3 className="mt-2 text-base font-semibold text-brand">
              {user?.fullName || user?.userCode || "Guest"}
            </h3>

            <p className="mt-3 text-sm text-text-muted">
              {new Date().toLocaleDateString(
                "vi-VN",
                {
                  weekday: "short",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                },
              )}
            </p>
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <nav
            className={`
              space-y-1
              ${isAsideCollapsed ? "mt-2" : "mt-4"}
            `}
          >
            {currentGroup.items.map((item, index) => {
                const Icon = item.icon;

                return (
                  <SidebarItem
                    key={item.label}
                    icon={<Icon size={19} />}
                    label={item.label}
                    active={displayItemIndex === index}
                    collapsed={isAsideCollapsed}
                    onClick={() => {
                      setActiveGroup(displayGroupIndex);

                      setActiveItem(index);

                      if (item.path) {
                        navigate(item.path);
                      }
                    }}
                  />
                );
              },
            )}
          </nav>
        </div>

        <div
          className={`
            mt-4 flex shrink-0 items-center justify-center gap-3
            ${isAsideCollapsed ? "flex-col" : "flex-row"}
          `}
        >
          {GROUPS.map(
            (group, gIndex) => {
              const isActive = displayGroupIndex === gIndex;

              const BtnIcon = group.btn.icon;

              return (
                <button
                  key={group.label}
                  type="button"
                  title={group.label}
                  aria-label={group.label}
                  onClick={() =>
                    handleGroupChange(gIndex)
                  }
                  style={
                    isActive
                      ? {
                          backgroundColor:
                            group.btn.bg,
                          boxShadow:
                            `0 10px 25px ${group.btn.shadow}`,
                        }
                      : {}
                  }
                  className={`
                    flex items-center justify-center rounded-full transition-all
                    duration-300 hover:-translate-y-0.5 hover:scale-105
                    ${isActive 
                      ? `h-11 w-11 ${group.btn.dark ? "text-text-default" : "text-white"}`
                      : `
                          h-9 w-9 bg-surface text-text-subtle shadow-sm hover:bg-surface-muted
                        `
                    }
                  `}
                >
                  <BtnIcon size={isActive ? 18 : 16}/>
                </button>
              );
            },
          )}
        </div>

        {!isAsideCollapsed && (
          <p
            className="mt-3 shrink-0 text-center text-sm font-medium transition-all duration-300"
            style={{
              color:
                currentGroup.btn.bg === 
                  "#ffffff" ? "#64748b" : currentGroup.btn.bg,
            }}
          >
            {currentGroup.label}
          </p>
        )}

        <button
          type="button"
          onClick={() =>setIsAsideCollapsed((current) => !current)}
          aria-label={isAsideCollapsed ? "Mở rộng menu" : "Thu gọn menu"}
          aria-controls="user-sidebar"
          aria-expanded={!isAsideCollapsed}
          title={isAsideCollapsed ? "Mở rộng menu" : "Thu gọn menu"}
          className="
            absolute -right-3 bottom-8 z-20 flex h-7 w-7
            items-center justify-center rounded-full
            border border-border bg-surface
            text-text-muted shadow-md transition
            hover:border-brand hover:text-brand
          "
        >
          {isAsideCollapsed ? (
            <PanelLeftOpen size={15} />
          ) : (
            <PanelLeftClose size={15} />
          )}
        </button>
      </aside>

      <main className="m-2 min-w-0 flex-1 rounded-xl bg-surface p-4 transition-all duration-300 md:p-8">
        <div className="mb-4 flex items-center justify-between">
          <div className="mb-4 flex items-center gap-2 text-sm text-text-subtle">
            <span>Home</span>

            <ChevronRight size={14} />

            <span className="font-medium text-text-default">
              {currentGroup.label}
            </span>

            <ChevronRight size={14} />

            <span className="font-medium text-text-default">
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
                  absolute right-2 top-2 h-2.5 w-2.5 animate-pulse rounded-full bg-warning shadow-lg shadow-warning/50
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
                  hover:bg-surface-subtle
                  transition
                "
              >
                <img
                  src={user?.avatar || defaultAvatar}
                  alt={user?.fullName || "User"}
                  className="h-10 w-10 rounded-xl object-cover"
                />

                <span className="font-semibold text-text-default">
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
                    w-48 rounded-xl border border-border
                    bg-surface p-2 shadow-lg z-50
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
                      text-sm text-text-default
                      hover:bg-surface-muted
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
                      text-sm text-danger
                      hover:bg-danger-soft
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

        <header className="flex items-center justify-between border-b-3 border-border-subtle py-6">
          <div className="flex flex-col justify-center gap-2">
            <h2 className="text-3xl font-bold text-text-strong">
              {currentItem?.label || title}
            </h2>

            <p className="text-m text-text-muted">
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

const SidebarItem = ({icon, label, active, collapsed = false, onClick}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      title={collapsed ? label : undefined}
      aria-label={label}
      style={active ? { color: BRAND } : {}}
      className={`
        mb-2 flex w-full items-center rounded-2xl text-sm font-medium
        transition-all duration-200
        ${collapsed ? "h-11 justify-center px-0" : "gap-3 px-4 py-3"}
        ${active ? "bg-surface shadow-sm" : "text-text-muted hover:bg-surface hover:text-text-default"}
      `}
    >
      <span className="flex shrink-0 items-center justify-center">
        {icon}
      </span>

      {!collapsed && (
        <span className="truncate">
          {label}
        </span>
      )}
    </button>
  );
};

export default UserLayout;