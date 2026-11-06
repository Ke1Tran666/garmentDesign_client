import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Globe, House, Menu, Search, X } from "lucide-react";
import NotificationButton from "@/shared/ui/notification/NotificationButton";
import { getBreadcrumbTitle } from "../adminNavConfig";
import AdminQuickCreateDropdown from "./AdminQuickCreateDropdown";
import AdminUserDropdown from "./AdminUserDropdown";

export const AdminHeader = ({
  user,
  onLogout,
  onOpenMobileMenu,
  searchKeyword,
  onSearchKeywordChange,
}) => {
  const location = useLocation();
  const currentBreadcrumb = getBreadcrumbTitle(location.pathname);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200/80 bg-white/90 px-4 shadow-xs backdrop-blur-md md:px-8 dark:border-slate-800 dark:bg-slate-900/90">
      {/* Left: Mobile hamburger & Breadcrumb */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="-ml-2 cursor-pointer rounded-xl p-2 text-slate-500 hover:bg-slate-100 md:hidden dark:hover:bg-slate-800"
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
            <span className="hidden font-medium sm:inline">Admin</span>
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
            onChange={(e) => onSearchKeywordChange(e.target.value)}
            placeholder="Tìm kiếm dữ liệu toàn hệ thống..."
            className="h-9.5 w-full rounded-xl border border-slate-200 bg-slate-50/70 pr-8 pl-9.5 text-xs text-slate-800 transition-all placeholder:text-slate-400 focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/10 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
          />
          {searchKeyword && (
            <button
              type="button"
              onClick={() => onSearchKeywordChange("")}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Quick Action Button with Dropdown */}
        <AdminQuickCreateDropdown />

        {/* View Client Portal Link */}
        <Link
          to="/"
          className="hidden h-9 items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-3 text-xs font-medium text-slate-600 shadow-2xs transition-colors hover:border-brand/40 hover:bg-slate-50 hover:text-brand sm:inline-flex dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          title="Xem trang web"
        >
          <Globe size={14} />
          <span>Xem trang web</span>
        </Link>

        {/* Notification Bell */}
        <NotificationButton />

        {/* Admin User Menu Dropdown */}
        <AdminUserDropdown user={user} onLogout={onLogout} />
      </div>
    </header>
  );
};

export default AdminHeader;
