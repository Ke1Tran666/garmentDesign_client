import { useEffect, useState } from "react";
import {
  Bell,
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
  Menu,
  ChevronLeft,
  House,
} from "lucide-react";

import Logo from "../../components/common/Logo/Logo";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import defaultAvatar from "@/assets/images/avatar-default.jpg";
import { ButtonIcon } from "@/components/ui/Button/Button";
import GooeySearchBar from "@/components/ui/Search/GooeyInput/GooeySearchBar";
import { authStorage } from "@/lib/authStorage";
import { userApi } from "@/api/userApi";
import { LAYOUT_GROUP_THEME } from "@/lib/layoutTheme";

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

const UserLayout = ({ title = "My Account" }) => {
  const [activeGroup, setActiveGroup] = useState(2);
  const [activeItem, setActiveItem] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [user, setUser] = useState(null);
  const [openMobileMenu, setOpenMobileMenu] = useState(false);
  const [isNotificationExpanded, setIsNotificationExpanded] = useState(false);

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
  const CurrentGroupIcon = currentGroup.btn.icon;

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
    const selectedGroup = GROUPS[gIndex];
    const defaultItem = selectedGroup.defaultItem;
    const defaultPath =
      selectedGroup.items[defaultItem]?.path;

    setActiveGroup(gIndex);
    setActiveItem(defaultItem);
    setOpenMobileMenu(false);

    if (defaultPath) {
      navigate(defaultPath);
    } else {
      navigate("/not-found", {
        state: {
          feature: selectedGroup.label,
        },
      });
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
    <div
      className="
        mx-auto flex min-h-screen w-full bg-surface-subtle
        pb-[calc(4.75rem+env(safe-area-inset-bottom))]
        md:pb-0
      "
    >
      <aside
        id="user-sidebar"
        className={`
          fixed inset-x-0 bottom-0 z-50
          flex h-auto w-full shrink-0 flex-col
          border-t border-border
          bg-surface-overlay px-2 pt-2
          pb-[calc(0.5rem+env(safe-area-inset-bottom))]
          shadow-(--layout-mobile-navigation-shadow)
          backdrop-blur-xl

          md:sticky md:inset-auto md:top-0
          md:h-screen md:border-r md:border-t-0
          md:border-border-subtle md:bg-surface-subtle
          md:py-8 md:shadow-none md:backdrop-blur-none

          transition-[width,padding] duration-300 ease-in-out

          ${isAsideCollapsed ? "md:w-20 md:px-3" : "md:w-72 md:px-6"}
        `}
      >
        <div className="hidden shrink-0 md:block">
          <Logo className={isAsideCollapsed ? "[&>span]:hidden" : ""}
          />
        </div>

        <div className="hidden md:contents">
          {!isAsideCollapsed && (
            <div className="mb-10 mt-10 flex flex-col items-center justify-center">
              <h2 className="text-xl font-semibold text-text-strong">
                {getGreeting()}
              </h2>

              <h3 className="mt-2 text-base font-semibold text-brand">
                {user?.fullName || user?.userCode || "Guest"}
              </h3>

              <p className="mt-3 text-sm text-text-muted">
                {new Date().toLocaleDateString("vi-VN", {
                  weekday: "short",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </p>
            </div>
          )}
        </div>

        {openMobileMenu && (
          <div
            className="
              absolute bottom-full left-3 right-3 mb-3
              grid grid-cols-2 gap-2
              rounded-2xl border border-border
              bg-surface p-3 shadow-xl
              md:hidden
            "
          >
            {/* Chuyển về trang chủ */}
            <button
              type="button"
              onClick={() => {
                setOpenMobileMenu(false);
                navigate("/");
              }}
              className="
                flex min-w-0 items-center gap-3 rounded-xl px-3 py-3
                text-left text-sm font-medium text-text-muted
                transition-colors
                hover:bg-surface-muted hover:text-brand
              "
            >
              <span
                className="
                  flex h-9 w-9 shrink-0 items-center justify-center
                  rounded-full bg-surface-muted
                "
              >
                <House
                  size={17}
                  aria-hidden="true"
                />
              </span>

              <span className="truncate">
                Trang chủ
              </span>
            </button>

            {GROUPS.map((group, gIndex) => {
              const Icon = group.btn.icon;
              const isActive = displayGroupIndex === gIndex;

              return (
                <button
                  key={group.label}
                  type="button"
                  onClick={() => {
                    handleGroupChange(gIndex);
                    setOpenMobileMenu(false);
                  }}
                  className={`
                    flex min-w-0 items-center gap-3
                    rounded-xl px-3 py-3
                    text-left text-sm font-medium
                    transition-colors

                    ${
                      isActive
                        ? "bg-brand-soft text-brand"
                        : "text-text-muted hover:bg-surface-muted"
                    }
                  `}
                >
                  <span
                    className="
                      flex h-9 w-9 shrink-0
                      items-center justify-center
                      rounded-full
                    "
                    style={{
                      backgroundColor: isActive
                        ? group.btn.bg
                        : "var(--color-surface-muted)",
                    color: isActive
                      ? group.btn.foreground
                      : "var(--color-text-default)",
                    }}
                  >
                    <Icon size={17} />
                  </span>

                  <span className="truncate">
                    {group.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
        <div
          className="
            w-full overflow-x-auto overflow-y-hidden
            md:min-h-0 md:flex-1
            md:overflow-y-auto md:overflow-x-hidden
          "
        >
          <nav
            className={`
              flex w-full items-stretch gap-1
              md:block md:space-y-1

              ${isAsideCollapsed ? "md:mt-2" : "md:mt-4"}
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
                    setOpenMobileMenu(false);
                    setActiveGroup(displayGroupIndex);
                    setActiveItem(index);

                    if (item.path) {
                        navigate(item.path);
                      } else {
                        navigate("/not-found", {
                          state: {
                            feature: item.label,
                          },
                        });
                      }
                  }}
                />
              );
            })}

            <button
              type="button"
              aria-label="Mở menu"
              aria-expanded={openMobileMenu}
              onClick={() => {
                setOpenMobileMenu((current) => !current);
              }}
              className={`
                relative flex min-h-14 min-w-17 flex-1
                flex-col items-center justify-center gap-1
                rounded-xl px-2 py-1
                text-[11px] font-medium
                transition-colors md:hidden

                ${
                  openMobileMenu
                    ? `
                        text-brand
                        after:absolute after:-top-2
                        after:left-1/2 after:h-1 after:w-10
                        after:-translate-x-1/2
                        after:rounded-full after:bg-brand
                      `
                    : "text-text-muted"
                }
              `}
            >
              <Menu size={20} />

              <span>Menu</span>
            </button>
          </nav>
        </div>

        {/* Danh sách nút nhóm */}
        <div
          className={`
            mt-4 hidden shrink-0 items-center
            justify-center gap-3 md:flex

            ${isAsideCollapsed ? "flex-col" : "flex-row"}
          `}
        >
          {GROUPS.map((group, gIndex) => {
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
                          backgroundColor: group.btn.bg,
                          boxShadow: `0 10px 25px ${group.btn.shadow}`,
                          color: group.btn.foreground,
                        }
                      : undefined
                  }
                  className={`
                    flex items-center justify-center rounded-full 
                    transition-all duration-300
                    hover:-translate-y-0.5 hover:scale-105

                    ${
                      isActive
                        ? "h-11 w-11"
                        : `
                          h-9 w-9 bg-surface text-text-subtle
                          shadow-sm hover:bg-surface-muted
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

        {/* Tên nhóm */}
        {!isAsideCollapsed && (
          <p
            className="
              mt-3 hidden shrink-0 text-center text-sm font-medium
              transition-all duration-300 md:block
              "
            style={{
              color: currentGroup.btn.labelColor,
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
            absolute -right-3 bottom-8 z-20
            hidden h-7 w-7 items-center justify-center
            rounded-full border border-border
            bg-surface text-text-muted shadow-md
            transition hover:border-brand hover:text-brand
            md:flex
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
            <span
              className="inline-flex items-center md:hidden"
              aria-label="Home"
            >
              <House
                size={17}
                aria-hidden="true"
              />
            </span>

            <span className="hidden md:inline">
              Home
            </span>

            <ChevronRight size={14} />

            <span
              className="
                inline-flex items-center
                text-text-default
                md:hidden
              "
              aria-label={currentGroup.label}
            >
              <CurrentGroupIcon size={17} aria-hidden="true"/>
            </span>

            <span className="hidden font-medium text-text-default md:inline">
              {currentGroup.label}
            </span>

            <ChevronRight size={14} />

            <span className="font-medium text-text-default">
              {currentItem?.label}
            </span>
          </div>

          <div className="flex items-center justify-center gap-4">
            <div
              className={`
                fixed right-0
                bottom-[calc(5.25rem+env(safe-area-inset-bottom))]
                z-40

                flex items-center gap-2
                rounded-l-full border border-r-0 border-border
                bg-surface p-2 pl-1
                shadow-lg

                transition-transform duration-300 ease-in-out

                ${
                  isNotificationExpanded
                    ? "translate-x-0"
                    : "translate-x-[calc(100%-3rem)]"
                }

                md:static md:translate-x-0
                md:border-0 md:bg-transparent
                md:p-0 md:shadow-none
              `}
            >
              {/* Nút kéo ra/thu vào — chỉ hiện trên mobile */}
              <button
                type="button"
                aria-label={
                  isNotificationExpanded
                    ? "Thu nút thông báo"
                    : "Mở nút thông báo"
                }
                aria-expanded={isNotificationExpanded}
                onClick={() => {
                  setIsNotificationExpanded((current) => !current);
                }}
                className="
                  flex h-10 w-10 shrink-0
                  items-center justify-center
                  rounded-full
                  text-text-muted
                  transition-colors
                  hover:bg-surface-muted
                  hover:text-brand
                  md:hidden
                "
              >
                <ChevronLeft
                  size={20}
                  className={`
                    transition-transform duration-300

                    ${isNotificationExpanded ? "rotate-180" : ""}
                  `}
                />
              </button>

              {/* Nút thông báo */}
              <ButtonIcon
                icon={Bell}
                sizeIcon={22}
                aria-label="Xem thông báo"
                className="
                  relative shrink-0
                  bg-linear-to-br from-indigo-500 to-brand
                  shadow-lg
                  hover:from-indigo-600 hover:to-brand
                  hover:shadow-xl
                  active:scale-95
                "
                classNameIcon="text-white"
              >
                <span
                  className="
                    absolute right-2 top-2
                    h-2.5 w-2.5
                    animate-pulse rounded-full
                    bg-warning
                    shadow-lg shadow-warning/50
                  "
                />
              </ButtonIcon>
            </div>

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

                <span className="hidden font-semibold text-text-default md:inline">
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
      className={`
        relative mb-0
        flex min-h-14 min-w-17 flex-1
        flex-col items-center gap-1
        rounded-xl px-2 py-1
        text-[11px] font-medium
        transition-all duration-200

        md:mb-2 md:min-h-0 md:min-w-0
        md:w-full md:flex-none md:flex-row
        md:text-sm

        ${
          collapsed
            ? "md:h-11 md:justify-center md:gap-0 md:px-0"
            : "md:gap-3 md:px-4 md:py-3"
        }

        ${
          active
            ? `
                text-brand
                after:absolute after:-top-2
                after:left-1/2 after:h-1 after:w-10
                after:-translate-x-1/2
                after:rounded-full after:bg-brand
                md:bg-surface md:shadow-sm
                md:after:hidden
              `
            : `
                text-text-muted
                hover:bg-surface
                hover:text-text-default
              `
        }
      `}
    >
      <span className="flex shrink-0 items-center justify-center">
        {icon}
      </span>

      <span
        className={`
          max-w-full truncate
          ${collapsed ? "md:hidden" : ""}
        `}
      >
        {label}
      </span>
    </button>
  );
};

export default UserLayout;