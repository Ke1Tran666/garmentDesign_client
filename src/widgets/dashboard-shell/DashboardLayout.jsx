import { useEffect,useState} from "react";
import {
  ChevronDown,
  ChevronRight,
  House,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  User,
} from "lucide-react";
import { Outlet, useLocation, useNavigate} from "react-router-dom";

import Logo from "@/shared/ui/brand/Logo";
import GooeySearchBar from "@/shared/ui/search/gooey-input/GooeySearchBar";

import defaultAvatar from "@/shared/assets/images/avatar-default.jpg";
import { useAuth } from "@/features/auth/model/useAuth";
import NotificationButton from "@/shared/ui/notification/NotificationButton";
import MenuTable from "@/shared/ui/menu/MenuTable";

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

const matchesItemPath = (pathname, itemPath) => {
  if (!itemPath) return false;

  const normalizedPath = itemPath.replace(/\/+$/, "") || "/";
  const currentPath = pathname.replace(/\/+$/, "") || "/";

  return (
    currentPath === normalizedPath ||
    (normalizedPath !== "/" &&
      currentPath.startsWith(`${normalizedPath}/`))
  );
};

const findActiveRoute = (groups, pathname, preferredGroupIndex) => {
  let bestMatch = null;

  groups.forEach((group, groupIndex) => {
    group.items.forEach((item, itemIndex) => {
      if (!matchesItemPath(pathname, item.path)) return;

      const pathLength = item.path.replace(/\/+$/, "").length;

      const isMoreSpecific =
        !bestMatch || pathLength > bestMatch.pathLength;

      const isPreferredTie =
        bestMatch &&
        pathLength === bestMatch.pathLength &&
        groupIndex === preferredGroupIndex &&
        bestMatch.groupIndex !== preferredGroupIndex;

      if (isMoreSpecific || isPreferredTie) {
        bestMatch = { groupIndex, itemIndex, pathLength };
      }
    });
  });

  return bestMatch;
};

const DashboardLayout = ({
  title,
  groups,
  initialGroup = 0,
  storageKey,
  sidebarId,
  fallbackName = "Guest",
  profilePath,
  logoutLabel = "Đăng xuất",
  LogoutIcon = LogOut,
  getOutletContext,
  breadcrumbLabel = "Home",
  roleLabel,
  RoleIcon,
}) => {

  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [activeGroup, setActiveGroup] = useState(initialGroup);

  const [activeItem, setActiveItem] = useState(0);

  const [searchKeyword, setSearchKeyword] = useState("");

  const [openMobileMenu, setOpenMobileMenu] = useState(false);

  const [openUserMenu,setOpenUserMenu] = useState(false);

  const [isAsideCollapsed, setIsAsideCollapsed] = useState(
    () => localStorage.getItem(storageKey) === "true",
  );

  const [userMenuPosition, setUserMenuPosition] = useState({x: 0, y: 0});

  const userMenuWidth = 208;

  const handleToggleUserMenu = (event) => {
    event.stopPropagation();

    if (openUserMenu) {
      setOpenUserMenu(false);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();

    setUserMenuPosition({
      x: Math.max(
        8,
        Math.min(
          rect.right - userMenuWidth,
          window.innerWidth - userMenuWidth - 8,
        ),
      ),
      y: rect.bottom + 8,
    });

    setOpenUserMenu(true);
  };

  useEffect(() => {
    localStorage.setItem(storageKey, String(isAsideCollapsed));
  }, [isAsideCollapsed, storageKey]);

  const activeRoute = findActiveRoute(
    groups,
    location.pathname,
    activeGroup,
  );

  const displayGroupIndex = activeRoute?.groupIndex ?? activeGroup;

  const displayItemIndex = activeRoute?.itemIndex ?? activeItem;

  const currentGroup =
    groups[
      displayGroupIndex
    ];

  const currentItem =
    currentGroup.items[
      displayItemIndex
    ];

  const CurrentGroupIcon = currentGroup.btn.icon;

  const navigateToItem = (
    item,
    groupIndex,
    itemIndex,
  ) => {
    setActiveGroup(groupIndex);
    setActiveItem(itemIndex);
    setOpenMobileMenu(false);

    if (item.path && item.available !== false) {
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
      groups[groupIndex];

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
        id={sidebarId}
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
              {RoleIcon && (
                <span
                    className="
                    mb-4 flex h-12 w-12
                    items-center justify-center
                    rounded-2xl bg-brand text-white
                    shadow-lg shadow-brand/20
                    "
                >
                    <RoleIcon size={23} />
                </span>
              )}

              <h2 className="text-xl font-semibold text-text-strong">
                {getGreeting()}
              </h2>

              <h3 className="mt-2 text-base font-semibold text-brand">
                {user?.fullName || user?.userCode || fallbackName}
              </h3>

              {roleLabel && (
                <p className="mt-2 text-xs font-medium uppercase tracking-wider text-text-muted">
                    {roleLabel}
                </p>
              )}

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

            {groups.map(
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
                    displayItemIndex === itemIndex &&
                    matchesItemPath(location.pathname, item.path)
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
          {groups.map(
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
          aria-controls={sidebarId}
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
                {breadcrumbLabel}
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
            <NotificationButton />

            <div className="relative">
              <button
                type="button"
                aria-label="Menu tài khoản"
                aria-haspopup="menu"
                aria-expanded={openUserMenu}
                onMouseDown={(event) => event.stopPropagation()}
                onClick={handleToggleUserMenu}
                className="
                  flex items-center gap-3
                  rounded-xl px-2 py-1
                  transition hover:bg-surface-subtle
                "
              >
                <img
                  src={user?.avatar || defaultAvatar}
                  alt={user?.fullName || fallbackName}
                  className="h-10 w-10 rounded-xl object-cover"
                />

                <span className="hidden max-w-40 truncate font-semibold text-text-default md:inline">
                  {user?.fullName || fallbackName}
                </span>

                <ChevronDown
                  size={16}
                  aria-hidden="true"
                  className={`transition ${openUserMenu ? "rotate-180" : ""}`}
                />
              </button>

              <MenuTable
                open={openUserMenu}
                position={userMenuPosition}
                width={userMenuWidth}
                onClose={() => setOpenUserMenu(false)}
                items={[
                  {
                    id: "profile",
                    label: "My Profile",
                    icon: User,
                    hidden: !profilePath,
                    onClick: () => navigate(profilePath),
                  },
                  {
                    id: "logout",
                    label: logoutLabel,
                    icon: LogoutIcon,
                    danger: true,
                    onClick: handleLogout,
                  },
                ]}
              />
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
                context={
                    getOutletContext
                    ? getOutletContext({ searchKeyword, user })
                    : { searchKeyword }
                }
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

export default DashboardLayout;
