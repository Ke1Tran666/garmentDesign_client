import { useEffect,useState} from "react";
import {
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  House,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import { Outlet, useLocation, useNavigate} from "react-router-dom";

import Logo from "@/components/common/Logo/Logo";
import { ButtonIcon } from "@/components/ui/Button/Button";
import GooeySearchBar from "@/components/ui/Search/GooeyInput/GooeySearchBar";

import defaultAvatar from "@/assets/images/avatar-default.jpg";
import { useAuth } from "@/components/auth/useAuth";
import { LAYOUT_GROUP_THEME } from "@/lib/layoutTheme";

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
        available: false,
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
        available: false,
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

const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 10) {
    return "Chào buổi sáng";
  }

  if (hour >= 10 && hour < 13) {
    return "Chào buổi trưa";
  }

  if (hour >= 13 && hour < 18) {
    return "Chào buổi chiều";
  }

  return "Chào buổi tối";
};

const findActiveRoute = (
  pathname,
  preferredGroupIndex,
) => {
  const preferredGroup =
    ADMIN_GROUPS[preferredGroupIndex];

  const preferredItemIndex =
    preferredGroup.items.findIndex(
      (item) =>
        item.path === pathname,
    );

  if (preferredItemIndex !== -1) {
    return {
      groupIndex:
        preferredGroupIndex,
      itemIndex:
        preferredItemIndex,
    };
  }

  for (
    let groupIndex = 0;
    groupIndex < ADMIN_GROUPS.length;
    groupIndex += 1
  ) {
    const itemIndex =
      ADMIN_GROUPS[
        groupIndex
      ].items.findIndex(
        (item) =>
          item.path === pathname,
      );

    if (itemIndex !== -1) {
      return {
        groupIndex,
        itemIndex,
      };
    }
  }

  return null;
};

const AdminLayout = ({
  title = "Admin Panel",
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {user: adminUser,logout} = useAuth();

  const [activeGroup, setActiveGroup] = useState(0);

  const [activeItem, setActiveItem] = useState(0);

  const [searchKeyword, setSearchKeyword] = useState("");

  const [openMobileMenu, setOpenMobileMenu] = useState(false);

  const [openUserMenu,setOpenUserMenu] = useState(false);

  const [isNotificationExpanded,setIsNotificationExpanded] = useState(false);

  const [isAsideCollapsed,setIsAsideCollapsed] = useState(() => {
    return (
      localStorage.getItem(
        "admin-aside-collapsed",
      ) === "true"
    );
  });

  const activeRoute = findActiveRoute(
    location.pathname,
    activeGroup,
  );

  const displayGroupIndex =
    activeRoute?.groupIndex ??
    activeGroup;

  const displayItemIndex =
    activeRoute?.itemIndex ??
    activeItem;

  const currentGroup =
    ADMIN_GROUPS[
      displayGroupIndex
    ];

  const currentItem =
    currentGroup.items[
      displayItemIndex
    ];

  const CurrentGroupIcon =
    currentGroup.btn.icon;

  useEffect(() => {
    localStorage.setItem(
      "admin-aside-collapsed",
      String(isAsideCollapsed),
    );
  }, [isAsideCollapsed]);

  useEffect(() => {
    const handleClickOutside = () => {
      setOpenUserMenu(false);
    };

    if (openUserMenu) {
      document.addEventListener(
        "click",
        handleClickOutside,
      );
    }

    return () => {
      document.removeEventListener(
        "click",
        handleClickOutside,
      );
    };
  }, [openUserMenu]);

  const navigateToItem = (
    item,
    groupIndex,
    itemIndex,
  ) => {
    setActiveGroup(groupIndex);
    setActiveItem(itemIndex);
    setOpenMobileMenu(false);

    if (item.available) {
      navigate(item.path);
      return;
    }

    navigate("/not-found", {
      state: {
        feature: item.label,
      },
    });
  };

  const handleGroupChange = (
    groupIndex,
  ) => {
    const selectedGroup =
      ADMIN_GROUPS[groupIndex];

    const itemIndex =
      selectedGroup.defaultItem;

    const item =
      selectedGroup.items[
        itemIndex
      ];

    navigateToItem(
      item,
      groupIndex,
      itemIndex,
    );
  };

  const handleLogout = async () => {
    setOpenUserMenu(false);

    try {
      await logout();
    } finally {
      navigate("/login", {
        replace: true,
      });
    }
  };

  return (
    <div
      className="
        mx-auto flex min-h-screen
        w-full bg-surface-subtle
        pb-[calc(4.75rem+env(safe-area-inset-bottom))]
        md:pb-0
      "
    >
      <aside
        id="admin-sidebar"
        className={`
          fixed inset-x-0 bottom-0 z-50
          flex h-auto w-full shrink-0
          flex-col border-t border-border
          bg-surface-overlay px-2 pt-2
          pb-[calc(0.5rem+env(safe-area-inset-bottom))]
          shadow-(--layout-mobile-navigation-shadow)
          backdrop-blur-xl

          transition-[width,padding]
          duration-300 ease-in-out

          md:sticky md:inset-auto
          md:top-0 md:h-screen
          md:border-r md:border-t-0
          md:border-border-subtle
          md:bg-surface-subtle
          md:py-8 md:shadow-none
          md:backdrop-blur-none

          ${
            isAsideCollapsed
              ? "md:w-20 md:px-3"
              : "md:w-72 md:px-6"
          }
        `}
      >
        <div className="hidden shrink-0 md:block">
          <Logo
            className={
              isAsideCollapsed
                ? "[&>span]:hidden"
                : ""
            }
          />
        </div>

        <div className="hidden md:contents">
          {!isAsideCollapsed && (
            <div className="mb-10 mt-10 flex flex-col items-center justify-center">
              <span
                className="
                  mb-4 flex h-12 w-12
                  items-center justify-center
                  rounded-2xl bg-brand
                  text-white
                  shadow-lg shadow-brand/20
                "
              >
                <ShieldCheck size={23} />
              </span>

              <h2 className="text-xl font-semibold text-text-strong">
                {getGreeting()}
              </h2>

              <h3 className="mt-2 text-base font-semibold text-brand">
                {adminUser?.fullName ||
                  adminUser?.userCode ||
                  "Administrator"}
              </h3>

              <p className="mt-2 text-xs font-medium uppercase tracking-wider text-text-muted">
                Quản trị viên
              </p>

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
        </div>

        {openMobileMenu && (
          <div
            className="
              absolute bottom-full
              left-3 right-3 mb-3
              grid grid-cols-2 gap-2
              rounded-2xl
              border border-border
              bg-surface p-3
              shadow-xl md:hidden
            "
          >
            <button
              type="button"
              onClick={() => {
                setOpenMobileMenu(false);
                navigate("/");
              }}
              className="
                flex min-w-0 items-center
                gap-3 rounded-xl
                px-3 py-3 text-left
                text-sm font-medium
                text-text-muted
                transition-colors
                hover:bg-surface-muted
                hover:text-brand
              "
            >
              <span
                className="
                  flex h-9 w-9 shrink-0
                  items-center justify-center
                  rounded-full bg-surface-muted
                "
              >
                <House size={17} />
              </span>

              <span className="truncate">
                Trang chủ
              </span>
            </button>

            {ADMIN_GROUPS.map(
              (group, groupIndex) => {
                const Icon =
                  group.btn.icon;

                const isActive =
                  displayGroupIndex ===
                  groupIndex;

                return (
                  <button
                    key={group.label}
                    type="button"
                    onClick={() =>
                      handleGroupChange(
                        groupIndex,
                      )
                    }
                    className={`
                      flex min-w-0 items-center
                      gap-3 rounded-xl
                      px-3 py-3 text-left
                      text-sm font-medium
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
                        backgroundColor:
                          isActive
                            ? group.btn.bg
                            : "var(--color-surface-muted)",
                        color:
                          isActive &&
                          !group.btn.dark
                            ? "#ffffff"
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
              },
            )}
          </div>
        )}

        <div
          className="
            w-full overflow-x-auto
            overflow-y-hidden
            md:min-h-0 md:flex-1
            md:overflow-y-auto
            md:overflow-x-hidden
          "
        >
          <nav
            className={`
              flex w-full items-stretch
              gap-1 md:block
              md:space-y-1

              ${
                isAsideCollapsed
                  ? "md:mt-2"
                  : "md:mt-4"
              }
            `}
          >
            {currentGroup.items.map(
              (item, itemIndex) => {
                const Icon = item.icon;

                return (
                  <AdminSidebarItem
                    key={item.label}
                    icon={
                      <Icon size={19} />
                    }
                    label={item.label}
                    available={
                      item.available
                    }
                    active={
                      displayItemIndex ===
                        itemIndex &&
                      location.pathname ===
                        item.path
                    }
                    collapsed={
                      isAsideCollapsed
                    }
                    onClick={() =>
                      navigateToItem(
                        item,
                        displayGroupIndex,
                        itemIndex,
                      )
                    }
                  />
                );
              },
            )}

            <button
              type="button"
              aria-label="Mở menu"
              aria-expanded={
                openMobileMenu
              }
              onClick={() =>
                setOpenMobileMenu(
                  (current) =>
                    !current,
                )
              }
              className={`
                relative flex min-h-14
                min-w-17 flex-1
                flex-col items-center
                justify-center gap-1
                rounded-xl px-2 py-1
                text-[11px] font-medium
                transition-colors
                md:hidden

                ${
                  openMobileMenu
                    ? `
                      text-brand
                      after:absolute
                      after:-top-2
                      after:left-1/2
                      after:h-1
                      after:w-10
                      after:-translate-x-1/2
                      after:rounded-full
                      after:bg-brand
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

        <div
          className={`
            mt-4 hidden shrink-0
            items-center justify-center
            gap-3 md:flex

            ${
              isAsideCollapsed
                ? "flex-col"
                : "flex-row"
            }
          `}
        >
          {ADMIN_GROUPS.map(
            (group, groupIndex) => {
              const isActive =
                displayGroupIndex ===
                groupIndex;

              const GroupIcon =
                group.btn.icon;

              return (
                <button
                  key={group.label}
                  type="button"
                  title={group.label}
                  aria-label={group.label}
                  onClick={() =>
                    handleGroupChange(
                      groupIndex,
                    )
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
                          h-9 w-9 bg-surface text-text-subtle shadow-sm
                          hover:bg-surface-muted
                        `
                    }
                  `}
                >
                  <GroupIcon
                    size={
                      isActive ? 18 : 16
                    }
                  />
                </button>
              );
            },
          )}
        </div>

        {!isAsideCollapsed && (
          <p
            className="
              mt-3 hidden shrink-0
              text-center text-sm
              font-medium
              transition-all
              duration-300 md:block
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
          onClick={() =>
            setIsAsideCollapsed(
              (current) => !current,
            )
          }
          aria-label={
            isAsideCollapsed
              ? "Mở rộng menu"
              : "Thu gọn menu"
          }
          aria-controls="admin-sidebar"
          aria-expanded={
            !isAsideCollapsed
          }
          title={
            isAsideCollapsed
              ? "Mở rộng menu"
              : "Thu gọn menu"
          }
          className="
            absolute -right-3 bottom-8
            z-20 hidden h-7 w-7
            items-center justify-center
            rounded-full
            border border-border
            bg-surface text-text-muted
            shadow-md transition
            hover:border-brand
            hover:text-brand
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

      <main
        className="
          m-2 min-w-0 flex-1
          rounded-xl bg-surface
          p-4 transition-all
          duration-300 md:p-8
        "
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="mb-4 flex min-w-0 items-center gap-2 text-sm text-text-subtle">
            <span
              className="
                inline-flex items-center
                md:hidden
              "
              aria-label="Trang chủ"
            >
              <House size={17} />
            </span>

            <span className="hidden md:inline">
              Admin
            </span>

            <ChevronRight
              size={14}
              className="shrink-0"
            />

            <span
              className="
                inline-flex shrink-0
                items-center
                text-text-default
                md:hidden
              "
              aria-label={
                currentGroup.label
              }
            >
              <CurrentGroupIcon
                size={17}
              />
            </span>

            <span className="hidden font-medium text-text-default md:inline">
              {currentGroup.label}
            </span>

            <ChevronRight
              size={14}
              className="shrink-0"
            />

            <span className="truncate font-medium text-text-default">
              {currentItem?.label}
            </span>
          </div>

          <div className="flex items-center justify-center gap-4">
            <div
              className={`
                fixed right-0
                bottom-[calc(5.25rem+env(safe-area-inset-bottom))]
                z-40 flex items-center
                gap-2 rounded-l-full
                border border-r-0
                border-border
                bg-surface p-2 pl-1
                shadow-lg
                transition-transform
                duration-300 ease-in-out

                ${
                  isNotificationExpanded
                    ? "translate-x-0"
                    : "translate-x-[calc(100%-3rem)]"
                }

                md:static
                md:translate-x-0
                md:border-0
                md:bg-transparent
                md:p-0 md:shadow-none
              `}
            >
              <button
                type="button"
                aria-label={
                  isNotificationExpanded
                    ? "Thu nút thông báo"
                    : "Mở nút thông báo"
                }
                aria-expanded={
                  isNotificationExpanded
                }
                onClick={() =>
                  setIsNotificationExpanded(
                    (current) =>
                      !current,
                  )
                }
                className="
                  flex h-10 w-10
                  shrink-0 items-center
                  justify-center
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
                    transition-transform
                    duration-300
                    ${
                      isNotificationExpanded
                        ? "rotate-180"
                        : ""
                    }
                  `}
                />
              </button>

              <ButtonIcon
                icon={Bell}
                sizeIcon={22}
                aria-label="Xem thông báo"
                className="
                  relative shrink-0
                  bg-linear-to-br
                  from-indigo-500
                  to-brand shadow-lg
                  hover:from-indigo-600
                  hover:to-brand
                  hover:shadow-xl
                  active:scale-95
                "
                classNameIcon="text-white"
              >
                <span
                  className="
                    absolute right-2 top-2
                    h-2.5 w-2.5
                    animate-pulse
                    rounded-full bg-warning
                    shadow-lg
                    shadow-warning/50
                  "
                />
              </ButtonIcon>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();

                  setOpenUserMenu(
                    (current) =>
                      !current,
                  );
                }}
                className="
                  flex items-center gap-3
                  rounded-xl px-2 py-1
                  transition
                  hover:bg-surface-subtle
                "
              >
                <img
                  src={
                    adminUser?.avatar ||
                    defaultAvatar
                  }
                  alt={
                    adminUser?.fullName ||
                    "Admin"
                  }
                  className="
                    h-10 w-10
                    rounded-xl object-cover
                  "
                />

                <span className="hidden max-w-40 truncate font-semibold text-text-default md:inline">
                  {adminUser?.fullName ||
                    "Administrator"}
                </span>

                <ChevronDown
                  size={16}
                  className={`
                    transition
                    ${
                      openUserMenu
                        ? "rotate-180"
                        : ""
                    }
                  `}
                />
              </button>

              {openUserMenu && (
                <div
                  onClick={(event) =>
                    event.stopPropagation()
                  }
                  className="
                    absolute right-0 top-full
                    z-50 mt-2 w-52
                    rounded-xl
                    border border-border
                    bg-surface p-2
                    shadow-lg
                  "
                >

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="
                      flex w-full
                      items-center gap-3
                      rounded-lg px-3 py-2
                      text-sm text-danger
                      hover:bg-danger-soft
                    "
                  >
                    <LogOut size={16} />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <header
          className="
            flex flex-col gap-5
            border-b-3
            border-border-subtle
            py-6 lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >
          <div className="flex min-w-0 flex-col justify-center gap-2">
            <h2 className="truncate text-2xl font-bold text-text-strong md:text-3xl">
              {currentItem?.label ||
                title}
            </h2>

            <p className="text-sm text-text-muted md:text-base">
              {currentItem?.text}
            </p>
          </div>

          <GooeySearchBar
            value={searchKeyword}
            onSearch={
              setSearchKeyword
            }
          />
        </header>

        <section className="p-2 md:p-4">
          <Outlet
            context={{
              searchKeyword,
              adminUser,
            }}
          />
        </section>
      </main>
    </div>
  );
};

const AdminSidebarItem = ({
  icon,
  label,
  active,
  available = true,
  collapsed = false,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      title={
        collapsed
          ? label
          : undefined
      }
      aria-label={label}
      aria-current={
        active
          ? "page"
          : undefined
      }
      className={`
        relative mb-0
        flex min-h-14 min-w-17
        flex-1 flex-col
        items-center gap-1
        rounded-xl px-2 py-1
        text-[11px] font-medium
        transition-all duration-200

        md:mb-2 md:min-h-0
        md:min-w-0 md:w-full
        md:flex-none md:flex-row
        md:text-sm

        ${
          collapsed
            ? `
              md:h-11
              md:justify-center
              md:gap-0 md:px-0
            `
            : `
              md:gap-3
              md:px-4 md:py-3
            `
        }

        ${
          active
            ? `
              text-brand
              after:absolute
              after:-top-2
              after:left-1/2
              after:h-1 after:w-10
              after:-translate-x-1/2
              after:rounded-full
              after:bg-brand
              md:bg-surface
              md:shadow-sm
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
          min-w-0 max-w-full
          truncate
          ${
            collapsed
              ? "md:hidden"
              : ""
          }
        `}
      >
        {label}
      </span>

      {!available && !collapsed && (
        <span
          className="
            ml-auto hidden shrink-0
            rounded-full
            bg-warning-soft
            px-2 py-0.5
            text-[10px]
            font-semibold text-warning
            md:inline-flex
          "
        >
          Sắp có
        </span>
      )}
    </button>
  );
};

export default AdminLayout;