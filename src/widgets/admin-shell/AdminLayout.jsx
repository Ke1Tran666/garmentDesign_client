import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  ClipboardList,
  ExternalLink,
  House,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

import defaultAvatar from "@/shared/assets/images/avatar-default.jpg";
import { useAuth } from "@/features/auth/model/useAuth";
import NotificationButton from "@/shared/ui/notification/NotificationButton";

const NAV_GROUPS = [
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

const BREADCRUMB_MAP = {
  "/admin": "Admin",
  "/admin/dashboard": "Bảng điều khiển",
  "/admin/service-orders": "Đơn dịch vụ",
  "/admin/services": "Dịch vụ thiết kế",
  "/admin/users": "Người dùng",
  "/admin/users/create": "Thêm tài khoản",
};

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("admin-sidebar-collapsed") === "true";
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);

  const quickCreateRef = useRef(null);
  const userDropdownRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("admin-sidebar-collapsed", String(isCollapsed));
  }, [isCollapsed]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        quickCreateRef.current &&
        !quickCreateRef.current.contains(event.target)
      ) {
        setQuickCreateOpen(false);
      }
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const isCurrentActive = (path) => {
    if (path === "/admin/dashboard") {
      return (
        location.pathname === "/admin" ||
        location.pathname === "/admin/dashboard"
      );
    }
    return location.pathname.startsWith(path);
  };

  // Determine breadcrumb trail
  const currentPathKey = Object.keys(BREADCRUMB_MAP).find(
    (p) =>
      location.pathname === p ||
      (p !== "/admin" && location.pathname.startsWith(`${p}/`)),
  );
  const currentBreadcrumb = BREADCRUMB_MAP[currentPathKey] || "Chi tiết";

  const closeMobileAndDropdowns = () => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setQuickCreateOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-slate-50/70 font-sans text-slate-800 antialiased dark:bg-slate-950 dark:text-slate-100">
      {/* =========================================
          DESKTOP SIDEBAR (COLLAPSIBLE FROM SIDEBAR BUTTON)
          ========================================= */}
      <aside
        className={`sticky top-0 z-40 hidden h-screen flex-col border-r border-slate-200/80 bg-white/95 shadow-xs backdrop-blur-md transition-all duration-300 md:flex dark:border-slate-800 dark:bg-slate-900/95 ${
          isCollapsed ? "w-20 px-3 py-5" : "w-72 px-5 py-6"
        }`}
      >
        {/* Brand header with Sidebar-only Toggle Button */}
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
            <Link
              to="/admin/dashboard"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-tr from-brand to-sky-400 text-white shadow-md shadow-brand/20 transition-transform hover:scale-105"
              title="Garment Admin"
            >
              <ShieldCheck size={22} className="stroke-[2.2]" />
            </Link>
            <button
              type="button"
              onClick={() => setIsCollapsed(false)}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 cursor-pointer dark:hover:bg-slate-800 dark:hover:text-slate-200"
              title="Mở rộng sidebar"
              aria-label="Mở rộng sidebar"
            >
              <PanelLeftOpen size={18} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-5 dark:border-slate-800">
            <Link
              to="/admin/dashboard"
              className="group flex min-w-0 items-center gap-3 overflow-hidden"
              title="Garment Design Admin"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-tr from-brand to-sky-400 text-white shadow-md shadow-brand/20 transition-transform group-hover:scale-105">
                <ShieldCheck size={22} className="stroke-[2.2]" />
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="truncate font-heading text-base leading-tight font-extrabold tracking-tight text-slate-900 dark:text-white">
                  GARMENT ADMIN
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-medium tracking-wider text-brand uppercase">
                  <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  Management Suite
                </span>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 cursor-pointer dark:hover:bg-slate-800 dark:hover:text-slate-200"
              title="Thu gọn sidebar"
              aria-label="Thu gọn sidebar"
            >
              <PanelLeftClose size={18} />
            </button>
          </div>
        )}

        {/* Navigation Groups */}
        <div className="scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 flex-1 space-y-6 overflow-x-hidden overflow-y-auto py-5">
          {NAV_GROUPS.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1.5">
              {!isCollapsed ? (
                <div className="px-3 text-[11px] font-bold tracking-wider text-slate-400/90 uppercase dark:text-slate-500">
                  {group.title}
                </div>
              ) : (
                <div className="my-2 h-px bg-slate-100 dark:bg-slate-800" />
              )}

              {group.items.map((item) => {
                const active = isCurrentActive(item.path);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    title={isCollapsed ? item.label : undefined}
                    className={`relative flex items-center gap-3.5 rounded-xl transition-all duration-200 ${
                      isCollapsed
                        ? "mx-auto h-11 w-11 justify-center"
                        : "px-3.5 py-2.5"
                    } ${
                      active
                        ? "bg-brand/10 font-semibold text-brand shadow-xs dark:bg-brand/20 dark:text-brand"
                        : "font-medium text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-200"
                    }`}
                  >
                    <Icon
                      size={isCollapsed ? 20 : 19}
                      className={`shrink-0 transition-transform ${
                        active
                          ? "text-brand"
                          : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500"
                      }`}
                    />
                    {!isCollapsed && (
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-sm leading-tight">
                          {item.label}
                        </span>
                        {item.sublabel && (
                          <span className="truncate text-[11px] font-normal text-slate-400 dark:text-slate-500">
                            {item.sublabel}
                          </span>
                        )}
                      </div>
                    )}
                    {active && (
                      <span className="absolute top-2 bottom-2 -left-1 w-1 rounded-r-md bg-brand" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="flex flex-col gap-2.5 border-t border-slate-100 pt-4 dark:border-slate-800">
          {!isCollapsed && (
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-700/50 dark:bg-slate-800/50">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </span>
                <span className="truncate text-xs font-medium text-slate-600 dark:text-slate-300">
                  Hệ thống hoạt động
                </span>
              </div>
              <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                99.9%
              </span>
            </div>
          )}

          {isCollapsed ? (
            <div className="flex flex-col items-center gap-2 pt-1">
              <img
                src={user?.avatar || defaultAvatar}
                alt={user?.fullName || "Admin"}
                title={user?.fullName || "Administrator"}
                className="h-10 w-10 rounded-xl object-cover ring-2 ring-slate-200 dark:ring-slate-700"
              />
              <button
                type="button"
                onClick={handleLogout}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 cursor-pointer dark:hover:bg-rose-950/40"
                title="Đăng xuất"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-xl p-1.5">
              <img
                src={user?.avatar || defaultAvatar}
                alt={user?.fullName || "Admin"}
                className="h-9 w-9 shrink-0 rounded-xl object-cover ring-2 ring-slate-200 dark:ring-slate-700"
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-bold text-slate-900 dark:text-white">
                  {user?.fullName || user?.userCode || "Quản trị viên"}
                </div>
                <div className="truncate text-[11px] text-slate-400">
                  {user?.email || "admin@garment.vn"}
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 cursor-pointer dark:hover:bg-rose-950/40"
                title="Đăng xuất"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* =========================================
          MOBILE DRAWER BACKDROP & SIDEBAR
          ========================================= */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="flex h-full w-72 max-w-[85vw] flex-col bg-white p-5 shadow-2xl dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white">
                  <ShieldCheck size={20} />
                </div>
                <span className="font-heading text-sm font-extrabold text-slate-900 dark:text-white">
                  GARMENT ADMIN
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 cursor-pointer dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto py-4">
              {NAV_GROUPS.map((group, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                    {group.title}
                  </div>
                  {group.items.map((item) => {
                    const active = isCurrentActive(item.path);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={closeMobileAndDropdowns}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                          active
                            ? "bg-brand/10 font-semibold text-brand"
                            : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        }`}
                      >
                        <Icon size={18} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
              <div className="flex min-w-0 items-center gap-2.5">
                <img
                  src={user?.avatar || defaultAvatar}
                  alt={user?.fullName || "Admin"}
                  className="h-8 w-8 rounded-lg object-cover"
                />
                <span className="truncate text-xs font-semibold">
                  {user?.fullName || "Admin"}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 cursor-pointer"
              >
                <LogOut size={14} />
                <span>Thoát</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          MAIN WRAPPER & TOPBAR
          ========================================= */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200/80 bg-white/90 px-4 shadow-xs backdrop-blur-md md:px-8 dark:border-slate-800 dark:bg-slate-900/90">
          {/* Left: Mobile hamburger & Breadcrumb ONLY (No sidebar toggle in header) */}
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="-ml-2 rounded-xl p-2 text-slate-500 hover:bg-slate-100 md:hidden cursor-pointer dark:hover:bg-slate-800"
              aria-label="Mở menu"
            >
              <Menu size={20} />
            </button>

            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-2 text-xs text-slate-500 md:text-sm dark:text-slate-400">
              <Link
                to="/admin/dashboard"
                className="flex items-center gap-1.5 transition-colors hover:text-brand"
              >
                <House size={15} />
                <span className="hidden sm:inline font-medium">Admin</span>
              </Link>
              <ChevronRight
                size={14}
                className="text-slate-300 dark:text-slate-600"
              />
              <span className="truncate font-semibold text-slate-800 dark:text-white">
                {currentBreadcrumb}
              </span>
            </nav>
          </div>

          {/* Right: Search, Quick actions, View Site, Notifications, Profile */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* Search Input in Topbar */}
            <div className="relative hidden w-64 lg:block xl:w-76">
              <Search
                size={16}
                className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Tìm kiếm dữ liệu toàn hệ thống..."
                className="h-9.5 w-full rounded-xl border border-slate-200 bg-slate-50/70 pr-8 pl-9.5 text-xs text-slate-800 transition-all placeholder:text-slate-400 focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/10 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
              />
              {searchKeyword && (
                <button
                  type="button"
                  onClick={() => setSearchKeyword("")}
                  className="absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Quick Action Button with Dropdown */}
            <div className="relative" ref={quickCreateRef}>
              <button
                type="button"
                onClick={() => setQuickCreateOpen((prev) => !prev)}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-brand! px-3.5 text-xs font-semibold text-white! shadow-sm shadow-brand/25 transition-all hover:bg-brand-hover! active:scale-95 cursor-pointer"
              >
                <Plus size={15} className="stroke-[2.5]" />
                <span className="hidden sm:inline">Thêm nhanh</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${quickCreateOpen ? "rotate-180" : ""}`}
                />
              </button>

              {quickCreateOpen && (
                <div className="animate-in fade-in slide-in-from-top-2 absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl ring-1 ring-black/5 dark:border-slate-800 dark:bg-slate-900">
                  <div className="px-3 py-1.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                    Tác vụ nhanh
                  </div>
                  <Link
                    to="/admin/users/create"
                    onClick={() => setQuickCreateOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-brand dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-brand dark:bg-blue-950/50">
                      <UserPlus size={15} />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-white">
                        Tạo người dùng
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Thêm tài khoản mới
                      </div>
                    </div>
                  </Link>
                  <Link
                    to="/admin/services"
                    onClick={() => setQuickCreateOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-brand dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                      <SlidersHorizontal size={15} />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-white">
                        Dịch vụ thiết kế
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Quản lý bảng giá
                      </div>
                    </div>
                  </Link>
                  <Link
                    to="/admin/service-orders"
                    onClick={() => setQuickCreateOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-brand dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                      <ClipboardList size={15} />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-white">
                        Đơn dịch vụ
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Theo dõi tiến độ đơn
                      </div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* View Client Portal Link */}
            <Link
              to="/"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-3 text-xs font-medium text-slate-600 shadow-2xs transition-colors hover:border-brand/40 hover:bg-slate-50 hover:text-brand dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              title="Mở giao diện khách hàng"
            >
              <ExternalLink size={14} />
              <span>Xem trang web</span>
            </Link>

            {/* Notification Bell */}
            <NotificationButton />

            {/* Admin User Menu Dropdown */}
            <div className="relative" ref={userDropdownRef}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2.5 rounded-xl p-1 transition-colors hover:bg-slate-100 cursor-pointer dark:hover:bg-slate-800"
              >
                <img
                  src={user?.avatar || defaultAvatar}
                  alt={user?.fullName || "Admin"}
                  className="h-8.5 w-8.5 rounded-xl object-cover ring-2 ring-brand/20"
                />
                <span className="hidden max-w-28 truncate text-xs font-bold text-slate-800 xl:inline dark:text-white">
                  {user?.fullName || "Administrator"}
                </span>
                <ChevronDown
                  size={14}
                  className={`hidden text-slate-400 sm:inline transition-transform duration-200 ${userDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {userDropdownOpen && (
                <div className="animate-in fade-in slide-in-from-top-2 absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl ring-1 ring-black/5 dark:border-slate-800 dark:bg-slate-900">
                  <div className="mb-1 border-b border-slate-100 px-3 py-2 dark:border-slate-800">
                    <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                      {user?.fullName || "Administrator"}
                    </p>
                    <p className="truncate text-[11px] text-slate-400">
                      {user?.email || "admin@garment.vn"}
                    </p>
                    <span className="mt-1.5 inline-block rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-semibold tracking-wider text-brand uppercase dark:bg-brand/20">
                      Quản trị viên
                    </span>
                  </div>

                  <Link
                    to="/user/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-brand dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <User size={15} />
                    <span>Hồ sơ cá nhân</span>
                  </Link>

                  <Link
                    to="/user/dashboard"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-brand dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <LayoutDashboard size={15} />
                    <span>Khu vực khách hàng</span>
                  </Link>

                  <div className="my-1 h-px bg-slate-100 dark:bg-slate-800" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 cursor-pointer dark:hover:bg-rose-950/40"
                  >
                    <LogOut size={15} />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 md:p-8">
          <Outlet
            context={{
              searchKeyword,
              adminUser: user,
            }}
          />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
