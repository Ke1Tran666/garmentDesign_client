import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, LogOut, ShieldCheck } from "lucide-react";
import { useClickOutside } from "@/shared/hooks/useClickOutside";
import PortalUserAvatar from "./PortalUserAvatar";

export const PortalUserDropdown = ({
  avatarSrc,
  displayName = "Người dùng",
  roleLabel = "Thành viên",
  RoleBadgeIcon = ShieldCheck,
  triggerAriaLabel = "Menu tài khoản",
  fallbackInitials = "US",
  menuItems = [],
  onLogout,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useClickOutside(containerRef, () => setIsOpen(false), isOpen);

  const handleLogoutClick = () => {
    setIsOpen(false);
    onLogout?.();
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`group flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200/90 bg-white/95 p-1 shadow-2xs backdrop-blur-sm transition-all duration-200 hover:border-brand/40 hover:bg-slate-50 hover:shadow-xs active:scale-[0.98] sm:pr-2.5 sm:pl-1.5 dark:border-slate-800 dark:bg-slate-900/95 dark:hover:border-brand/40 dark:hover:bg-slate-800 ${
          isOpen
            ? "border-brand/50 bg-slate-50 ring-2 ring-brand/15 dark:border-brand/50 dark:bg-slate-800"
            : ""
        }`}
        aria-label={triggerAriaLabel}
        title={displayName}
      >
        <PortalUserAvatar
          src={avatarSrc}
          name={displayName}
          size="sm"
          showStatus={true}
          fallbackInitials={fallbackInitials}
          className="rounded-lg shadow-2xs"
        />

        <div className="hidden min-w-0 flex-col text-left sm:flex">
          <span className="max-w-27.5 truncate text-xs font-bold text-slate-800 group-hover:text-brand xl:max-w-32.5 dark:text-slate-100">
            {displayName}
          </span>
          <span className="text-[10px] font-medium tracking-tight text-slate-400 dark:text-slate-500">
            {roleLabel}
          </span>
        </div>

        <div className="flex h-5 w-5 items-center justify-center rounded-md text-slate-400 transition-colors group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300">
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${
              isOpen ? "rotate-180 text-brand dark:text-brand" : ""
            }`}
          />
        </div>
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-64 animate-in rounded-2xl border border-slate-200/90 bg-white p-2 shadow-xl ring-1 ring-black/5 fade-in slide-in-from-top-2 dark:border-slate-800 dark:bg-slate-900">
          {/* Header Summary Card */}
          <div className="dark:bg-slate-850/60 mb-2 flex items-center gap-3 rounded-xl bg-slate-50/80 p-2.5">
            <PortalUserAvatar
              src={avatarSrc}
              name={displayName}
              size="md"
              showStatus={true}
              fallbackInitials={fallbackInitials}
              className="rounded-xl shadow-xs"
            />
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-bold text-slate-900 dark:text-white">
                {displayName}
              </div>
              <div className="mt-1">
                <span className="inline-flex items-center gap-1 rounded-md bg-brand-soft px-1.5 py-0.5 text-[10px] font-semibold text-brand dark:bg-brand/20">
                  <RoleBadgeIcon size={11} className="stroke-[2.5]" />
                  {roleLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-0.5">
            {menuItems.map((item) => {
              const Icon = item.icon;

              if (item.type === "disabled") {
                return (
                  <div
                    key={item.id || item.label}
                    aria-disabled="true"
                    className="flex cursor-not-allowed items-center justify-between gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-500 select-none dark:text-slate-400"
                  >
                    <span className="flex items-center gap-2.5">
                      {Icon && <Icon size={15} className="text-slate-400" />}
                      <span>{item.label}</span>
                    </span>
                    {item.badgeText && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold whitespace-nowrap text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                        {item.badgeText}
                      </span>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.id || item.to}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-brand dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  {Icon && <Icon size={15} className="text-slate-400" />}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="my-1.5 h-px bg-slate-100 dark:bg-slate-800" />

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogoutClick}
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 dark:hover:bg-rose-950/40"
          >
            <LogOut size={15} />
            <span>Đăng xuất</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default PortalUserDropdown;
