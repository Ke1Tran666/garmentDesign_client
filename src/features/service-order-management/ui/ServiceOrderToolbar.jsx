import { Kanban, List, Search, X } from "lucide-react";
import FilterSelect from "@/shared/ui/select/FilterSelect";
import {
  ORDER_SORT_OPTIONS,
  STATUS_FILTER_CHIPS,
} from "../lib/serviceOrderUtils";

const ServiceOrderToolbar = ({
  search = "",
  onSearchChange,
  statusFilter = "all",
  onStatusFilterChange,
  sortBy = "newest",
  onSortChange,
  viewMode = "table",
  onViewModeChange,
}) => {
  return (
    <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        {/* Search box */}
        <div className="relative max-w-md flex-1">
          <Search
            size={16}
            className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Tìm theo mã đơn (ORD-xxx), khách hàng, dịch vụ, mẫu..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 pr-8 pl-9.5 text-xs text-slate-800 transition-all placeholder:text-slate-400 focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/10 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange?.("")}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600"
              title="Xóa tìm kiếm"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Sort selector */}
          <FilterSelect
            value={sortBy}
            onValueChange={onSortChange}
            options={ORDER_SORT_OPTIONS}
            ariaLabel="Sắp xếp danh sách đơn hàng"
            className="h-10 w-full sm:w-44"
          />

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <button
              type="button"
              onClick={() => onViewModeChange?.("table")}
              className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                viewMode === "table"
                  ? "bg-white text-brand shadow-xs dark:bg-slate-700 dark:text-white"
                  : "hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Bảng dữ liệu"
            >
              <List size={15} />
              <span>Bảng</span>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange?.("kanban")}
              className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                viewMode === "kanban"
                  ? "bg-white text-brand shadow-xs dark:bg-slate-700 dark:text-white"
                  : "hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Kanban Pipeline"
            >
              <Kanban size={15} />
              <span>Quy trình (Kanban)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Status Filter Chips */}
      <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-2 dark:border-slate-800">
        <span className="mr-1 text-xs font-medium text-slate-400">
          Trạng thái:
        </span>
        {STATUS_FILTER_CHIPS.map((chip) => {
          const isActive = statusFilter === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => onStatusFilterChange?.(chip.id)}
              className={`cursor-pointer rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                isActive
                  ? "bg-brand! text-white! shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ServiceOrderToolbar;
