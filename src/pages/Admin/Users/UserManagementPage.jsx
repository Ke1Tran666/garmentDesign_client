import { Download, RefreshCw, UserPlus } from "lucide-react";
import { Link, useOutletContext } from "react-router-dom";

import {
  PAGE_SIZE,
  UserGridView,
  UserStatsCards,
  UserTableView,
  UserToolbar,
  useUserManagement,
} from "@/features/user-management";
import BatchActionBar from "@/shared/ui/action-bar/BatchActionBar";
import ConfirmModal from "@/shared/ui/modal/ConfirmModal";
import { GridSkeleton, TableSkeleton } from "@/shared/ui/skeleton";
import Pagination from "@/shared/ui/table/Pagination";

const UserManagementPage = () => {
  const { adminUser, searchKeyword = "" } = useOutletContext() || {};

  const {
    isAdmin,
    currentUserId,
    loading,
    localSearch,
    roleFilter,
    statusFilter,
    sortBy,
    viewMode,
    setViewMode,
    currentPage,
    setCurrentPage,
    totalPages,
    stats,
    roleOptions,
    filteredUsers,
    visibleUsers,
    selectedIds,
    selectedCount,
    isAllCurrentSelected,
    removingUser,
    setRemovingUser,
    removing,
    fetchUsers,
    toggleSelectItem,
    toggleSelectAll,
    clearSelection,
    handleSearchChange,
    handleRoleFilterChange,
    handleStatusFilterChange,
    handleSortChange,
    applyQuickFilter,
    resetFilters,
    handleExport,
    confirmRemove,
  } = useUserManagement({ adminUser, searchKeyword });

  const showingStart = (currentPage - 1) * PAGE_SIZE + 1;
  const showingEnd = Math.min(currentPage * PAGE_SIZE, filteredUsers.length);

  return (
    <div className="animate-in space-y-6 duration-200 fade-in">
      {/* =========================================
          PAGE HEADER & CALL TO ACTION
          ========================================= */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200/60 pb-2 sm:flex-row sm:items-center dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              Quản lý người dùng
            </h1>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {filteredUsers.length} tài khoản
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Xem danh sách, phân quyền vai trò và quản lý tình trạng tài khoản
            toàn hệ thống.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={fetchUsers}
            disabled={loading}
            className="flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            title="Làm mới dữ liệu"
          >
            <RefreshCw
              size={14}
              className={loading ? "animate-spin text-brand" : "text-slate-400"}
            />
            <span className="hidden sm:inline">Làm mới</span>
          </button>

          <button
            type="button"
            onClick={() => handleExport()}
            className="flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            title="Xuất file Excel"
          >
            <Download size={14} className="text-slate-400" />
            <span>Xuất Excel</span>
          </button>

          {isAdmin && (
            <Link
              to="/admin/users/create"
              className="flex h-9 items-center gap-1.5 rounded-xl bg-brand! px-3.5 text-xs font-semibold text-white! shadow-xs transition-colors hover:bg-brand-hover!"
            >
              <UserPlus size={15} />
              <span>Thêm người dùng</span>
            </Link>
          )}
        </div>
      </div>

      {/* =========================================
          TOP METRIC STAT CARDS
          ========================================= */}
      <UserStatsCards
        stats={stats}
        roleFilter={roleFilter}
        statusFilter={statusFilter}
        onQuickFilter={applyQuickFilter}
      />

      {/* =========================================
          SEARCH, FILTER & VIEW MODE TOOLBAR
          ========================================= */}
      <UserToolbar
        search={localSearch}
        onSearchChange={handleSearchChange}
        roleFilter={roleFilter}
        onRoleFilterChange={handleRoleFilterChange}
        roleOptions={roleOptions}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        hasVisibleItems={visibleUsers.length > 0}
        isAllCurrentSelected={isAllCurrentSelected}
        onToggleSelectAll={toggleSelectAll}
      />

      {/* =========================================
          MAIN CONTENT: TABLE VIEW OR GRID VIEW
          ========================================= */}
      {loading ? (
        viewMode === "grid" ? (
          <GridSkeleton />
        ) : (
          <TableSkeleton variant="user" />
        )
      ) : viewMode === "grid" ? (
        <UserGridView
          users={visibleUsers}
          selectedIds={selectedIds}
          isAdmin={isAdmin}
          currentUserId={currentUserId}
          onToggleSelect={toggleSelectItem}
          onDelete={setRemovingUser}
          onResetFilters={resetFilters}
        />
      ) : (
        <UserTableView
          users={visibleUsers}
          selectedIds={selectedIds}
          isAllCurrentSelected={isAllCurrentSelected}
          isAdmin={isAdmin}
          currentUserId={currentUserId}
          onToggleSelectAll={toggleSelectAll}
          onToggleSelect={toggleSelectItem}
          onDelete={setRemovingUser}
          onResetFilters={resetFilters}
        />
      )}

      {/* =========================================
          PAGINATION
          ========================================= */}
      {!loading && filteredUsers.length > 0 && (
        <div className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            showingStart={showingStart}
            showingEnd={showingEnd}
            totalItems={filteredUsers.length}
            showOnSinglePage
          />
        </div>
      )}

      {/* =========================================
          FLOATING BATCH ACTION BAR
          ========================================= */}
      <BatchActionBar
        selectedCount={selectedCount}
        entityLabel="người dùng"
        onClearSelection={clearSelection}
      >
        <button
          type="button"
          onClick={() => handleExport()}
          className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/20"
        >
          <Download size={14} />
          <span>Xuất {selectedCount} tài khoản</span>
        </button>
      </BatchActionBar>

      {/* =========================================
          CONFIRM DELETE MODAL
          ========================================= */}
      <ConfirmModal
        open={Boolean(removingUser)}
        title="Xóa tài khoản người dùng"
        confirmText="Xác nhận xóa"
        confirmVariant="danger"
        submitting={removing}
        onClose={() => setRemovingUser(null)}
        onConfirm={confirmRemove}
      >
        <p>
          Bạn có chắc chắn muốn xóa tài khoản của{" "}
          <strong className="text-slate-900 dark:text-white">
            {removingUser?.fullName || removingUser?.userCode}
          </strong>
          ? Hành động này sẽ vô hiệu hóa quyền đăng nhập của người dùng.
        </p>
      </ConfirmModal>
    </div>
  );
};

export default UserManagementPage;
