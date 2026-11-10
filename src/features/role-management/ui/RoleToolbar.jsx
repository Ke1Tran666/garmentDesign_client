import { CheckSquare, Grid, List, Search, Square, X } from "lucide-react";

import FilterSelect from "@/shared/ui/select/FilterSelect";

import {
  ROLE_SORT_OPTIONS,
  ROLE_TYPE_CHIPS,
  ROLE_USAGE_OPTIONS,
} from "../lib/roleUtils";

const RoleToolbar = ({
  search = "",
  onSearchChange,
  usageFilter = "all",
  onUsageFilterChange,
  sortBy = "id-asc",
  onSortChange,
  viewMode = "table",
  onViewModeChange,
  typeFilter = "all",
  onTypeFilterChange,
  hasVisibleItems = false,
  isAllCurrentSelected = false,
  onToggleSelectAll,
}) => {
  return (
    <div className="space-y-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
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
            placeholder="Tìm theo ID, tên vai trò hoặc mô tả..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/70 pr-8 pl-9.5 text-xs text-slate-800 transition-all placeholder:text-slate-400 focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/10 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
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
          {/* Usage Filter Select */}
          <FilterSelect
            value={usageFilter}
            onValueChange={onUsageFilterChange}
            options={ROLE_USAGE_OPTIONS}
            ariaLabel="Lọc theo tình trạng gán tài khoản"
            className="h-10 w-full sm:w-48"
          />

          {/* Sort Select */}
          <FilterSelect
            value={sortBy}
            onValueChange={onSortChange}
            options={ROLE_SORT_OPTIONS}
            ariaLabel="Sắp xếp danh sách vai trò"
            className="h-10 w-full sm:w-48"
          />

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <button
              type="button"
              onClick={() => onViewModeChange?.("table")}
              className={`cursor-pointer rounded-lg p-1.5 transition-colors ${
                viewMode === "table"
                  ? "bg-white text-brand shadow-xs dark:bg-slate-700 dark:text-white"
                  : "hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Dạng bảng Danh sách"
            >
              <List size={16} />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange?.("grid")}
              className={`cursor-pointer rounded-lg p-1.5 transition-colors ${
                viewMode === "grid"
                  ? "bg-white text-brand shadow-xs dark:bg-slate-700 dark:text-white"
                  : "hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Dạng lưới Card"
            >
              <Grid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Chips & Select-page Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-medium text-slate-400">
            Phân loại:
          </span>
          {ROLE_TYPE_CHIPS.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => onTypeFilterChange?.(chip.id)}
              className={`cursor-pointer rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                typeFilter === chip.id
                  ? "bg-brand! text-white! shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {hasVisibleItems && (
          <button
            type="button"
            onClick={onToggleSelectAll}
            className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-brand dark:text-slate-400"
          >
            {isAllCurrentSelected ? (
              <CheckSquare size={15} className="text-brand" />
            ) : (
              <Square size={15} />
            )}
            <span>
              {isAllCurrentSelected ? "Bỏ chọn tất cả" : "Chọn trang này"}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

export default RoleToolbar;
