import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

export const PortalSidebar = ({
  isCollapsed = false,
  onToggleCollapse,
  brandSlot,
  navSlot,
  statusBadgeText = "Hệ thống hoạt động",
  statusLabel = "Trực tuyến",
  profileSlot,
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
          {brandSlot}
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
          {brandSlot}
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
        {navSlot}
      </div>

      {/* Sidebar Footer */}
      <div className="flex flex-col gap-2 border-t border-slate-100 pt-3.5 dark:border-slate-800">
        {!isCollapsed && statusBadgeText && (
          <div className="dark:bg-slate-850/50 flex items-center justify-between rounded-xl border border-slate-200/70 bg-slate-50/70 px-3 py-2 text-xs transition-colors dark:border-slate-800">
            <div className="flex min-w-0 items-center gap-2">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="truncate text-xs font-medium text-slate-600 dark:text-slate-300">
                {statusBadgeText}
              </span>
            </div>
            {statusLabel && (
              <span className="inline-flex shrink-0 items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                {statusLabel}
              </span>
            )}
          </div>
        )}

        {profileSlot}
      </div>
    </aside>
  );
};

export default PortalSidebar;
