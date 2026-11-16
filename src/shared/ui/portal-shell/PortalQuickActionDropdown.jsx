import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Plus } from "lucide-react";
import { useClickOutside } from "@/shared/hooks/useClickOutside";

export const PortalQuickActionDropdown = ({
  actions = [],
  buttonLabel = "Thêm nhanh",
  sectionTitle = "Tác vụ nhanh",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useClickOutside(containerRef, () => setIsOpen(false), isOpen);

  if (actions.length === 0) return null;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl bg-brand! px-3.5 text-xs font-semibold text-white! shadow-sm shadow-brand/25 transition-all hover:bg-brand-hover! active:scale-95"
      >
        <Plus size={15} className="stroke-[2.5]" />
        <span className="hidden sm:inline">{buttonLabel}</span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-60 animate-in rounded-2xl border border-slate-100 bg-white p-2 shadow-xl ring-1 ring-black/5 fade-in slide-in-from-top-2 dark:border-slate-800 dark:bg-slate-900">
          <div className="px-3 py-1.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            {sectionTitle}
          </div>
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.path}
                to={action.path}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-brand dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${action.colorClass}`}
                >
                  <Icon size={15} />
                </div>
                <div className="min-w-0">
                  <div className="truncate font-semibold text-slate-800 dark:text-white">
                    {action.title}
                  </div>
                  <div className="truncate text-[11px] text-slate-400">
                    {action.subtitle}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PortalQuickActionDropdown;
