import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import AdminBrand from "./AdminBrand";
import AdminNavList from "./AdminNavList";
import AdminUserProfile from "./AdminUserProfile";

export const AdminSidebar = ({
  isCollapsed,
  onToggleCollapse,
  user,
  onLogout,
}) => {
  return (
    <aside
      className={`sticky top-0 z-40 hidden h-screen flex-col border-r border-slate-200/80 bg-white/95 shadow-xs backdrop-blur-md transition-all duration-300 md:flex dark:border-slate-800 dark:bg-slate-900/95 ${
        isCollapsed ? "w-20 px-3 py-5" : "w-72 px-5 py-6"
      }`}
    >
      {/* Brand header with Sidebar Toggle Button */}
      {isCollapsed ? (
        <div className="flex flex-col items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
          <AdminBrand isCollapsed={true} />
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            title="Mở rộng sidebar"
            aria-label="Mở rộng sidebar"
          >
            <PanelLeftOpen size={18} />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-5 dark:border-slate-800">
          <AdminBrand isCollapsed={false} />
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            title="Thu gọn sidebar"
            aria-label="Thu gọn sidebar"
          >
            <PanelLeftClose size={18} />
          </button>
        </div>
      )}

      {/* Navigation Groups */}
      <div className="scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 flex-1 space-y-6 overflow-x-hidden overflow-y-auto py-5">
        <AdminNavList isCollapsed={isCollapsed} />
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

        <AdminUserProfile
          user={user}
          onLogout={onLogout}
          isCollapsed={isCollapsed}
          variant="sidebar"
        />
      </div>
    </aside>
  );
};

export default AdminSidebar;
