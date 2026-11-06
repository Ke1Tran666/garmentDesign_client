import { Link } from "react-router-dom";
import { Scissors } from "lucide-react";

export const AdminBrand = ({
  isCollapsed = false,
  showBadge = true,
  className = "",
}) => {
  if (isCollapsed) {
    return (
      <Link
        to="/admin/dashboard"
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand text-white shadow-md shadow-brand/25 transition-transform hover:scale-105 ${className}`}
        title="HoaTran maymac Admin"
      >
        <Scissors size={20} className="stroke-[2.2]" />
      </Link>
    );
  }

  return (
    <Link
      to="/admin/dashboard"
      className={`group flex min-w-0 items-center gap-3 overflow-hidden ${className}`}
      title="HoaTran maymac Admin"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-white shadow-md shadow-brand/25 transition-transform group-hover:scale-105">
        <Scissors size={20} className="stroke-[2.2]" />
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="truncate font-brand text-base leading-tight font-extrabold tracking-tight text-slate-900 dark:text-white">
          HoaTran <span className="text-brand">maymac</span>
        </span>
        {showBadge && (
          <span className="flex items-center gap-1.5 text-[11px] font-medium tracking-wider text-slate-400 uppercase">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            Admin Portal
          </span>
        )}
      </div>
    </Link>
  );
};

export default AdminBrand;
