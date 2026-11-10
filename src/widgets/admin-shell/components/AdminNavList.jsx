import { Link, useLocation } from "react-router-dom";
import { Globe } from "lucide-react";

import { normalizeRole, resolveAppRole } from "@/features/auth/lib/authRole";

import { NAV_GROUPS, isPathActive } from "../adminNavConfig";

export const AdminNavList = ({
  isCollapsed = false,
  userRole = "",
  onItemClick,
  showWebsiteLink = false,
}) => {
  const location = useLocation();
  const normalizedUserRole = resolveAppRole(userRole);

  return (
    <div className="space-y-6">
      {NAV_GROUPS.map((group, groupIdx) => {
        const visibleItems = group.items.filter((item) => {
          if (
            !Array.isArray(item.allowedRoles) ||
            item.allowedRoles.length === 0
          ) {
            return true;
          }

          return item.allowedRoles
            .map(normalizeRole)
            .includes(normalizedUserRole);
        });

        if (visibleItems.length === 0) {
          return null;
        }

        return (
          <div key={groupIdx} className="space-y-1.5">
            {!isCollapsed ? (
              <div className="px-3 text-[11px] font-bold tracking-wider text-slate-400/90 uppercase dark:text-slate-500">
                {group.title}
              </div>
            ) : (
              <div className="my-2 h-px bg-slate-100 dark:bg-slate-800" />
            )}

            {visibleItems.map((item) => {
              const active = isPathActive(location.pathname, item.path);
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onItemClick}
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
        );
      })}

      {showWebsiteLink && (
        <div className="space-y-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
          <div className="px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            Website
          </div>
          <Link
            to="/"
            onClick={onItemClick}
            className="flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Globe size={19} className="text-slate-400" />
            <span>Xem trang web</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default AdminNavList;
