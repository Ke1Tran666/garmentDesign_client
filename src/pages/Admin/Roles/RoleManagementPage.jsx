import { Download, Plus, RefreshCw } from "lucide-react";
import { useOutletContext } from "react-router-dom";

import {
  PAGE_SIZE,
  RoleDeleteModal,
  RoleDetailEditModal,
  RoleGridView,
  RoleStatsCards,
  RoleTableView,
  RoleToolbar,
  useRoleManagement,
} from "@/features/role-management";
import BatchActionBar from "@/shared/ui/action-bar/BatchActionBar";
import { GridSkeleton, TableSkeleton } from "@/shared/ui/skeleton";
import Pagination from "@/shared/ui/table/Pagination";

const RoleManagementPage = () => {
  const {
    adminUser,
    searchKeyword = "",
    refreshSession,
  } = useOutletContext() || {};

  const {
    isAdmin,
    roles,
    loading,
    submitting,
    removing,
    deleteError,
    localSearch,
    typeFilter,
    usageFilter,
    sortBy,
    viewMode,
    setViewMode,
    currentPage,
    setCurrentPage,
    totalPages,
    stats,
    filteredRoles,
    visibleRoles,
    selectedIds,
    selectedCount,
    isAllCurrentSelected,
    modalOpen,
    modalMode,
    activeRole,
    formError,
    assignedUsers,
    assignedUsersLoading,
    removingRole,
    setRemovingRole,
    fetchRoles,
    toggleSelectItem,
    toggleSelectAll,
    clearSelection,
    handleSearchChange,
    handleTypeFilterChange,
    handleUsageFilterChange,
    handleSortChange,
    applyQuickFilter,
    resetFilters,
    openCreateModal,
    openViewModal,
    openEditModal,
    closeModal,
    saveRole,
    confirmRemove,
    handleExport,
  } = useRoleManagement({ adminUser, searchKeyword, refreshSession });

  const showingStart = (currentPage - 1) * PAGE_SIZE + 1;
  const showingEnd = Math.min(currentPage * PAGE_SIZE, filteredRoles.length);

  return (
    <div className="animate-in space-y-6 duration-200 fade-in">
      {/* =========================================
          PAGE HEADER & CALL TO ACTION
          ========================================= */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200/60 pb-2 sm:flex-row sm:items-center dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              Quản lý vai trò
            </h1>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {filteredRoles.length} vai trò
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Quản trị danh mục vai trò phân quyền, theo dõi số lượng tài khoản và
            bảo vệ các nhóm quyền cốt lõi của hệ thống.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={fetchRoles}
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
            <button
              type="button"
              onClick={openCreateModal}
              className="flex h-9 cursor-pointer items-center gap-1.5 rounded-xl bg-brand! px-3.5 text-xs font-semibold text-white! shadow-xs transition-colors hover:bg-brand-hover!"
            >
              <Plus size={15} className="stroke-[2.5]" />
              <span>Thêm vai trò</span>
            </button>
          )}
        </div>
      </div>

      {/* =========================================
          TOP METRIC STAT CARDS
          ========================================= */}
      <RoleStatsCards
        stats={stats}
        typeFilter={typeFilter}
        usageFilter={usageFilter}
        onQuickFilter={applyQuickFilter}
      />

      {/* =========================================
          SEARCH, FILTER & VIEW MODE TOOLBAR
          ========================================= */}
      <RoleToolbar
        search={localSearch}
        onSearchChange={handleSearchChange}
        usageFilter={usageFilter}
        onUsageFilterChange={handleUsageFilterChange}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        typeFilter={typeFilter}
        onTypeFilterChange={handleTypeFilterChange}
        hasVisibleItems={visibleRoles.length > 0}
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
          <TableSkeleton variant="role" />
        )
      ) : viewMode === "grid" ? (
        <RoleGridView
          roles={visibleRoles}
          allRoles={roles}
          selectedIds={selectedIds}
          isAdmin={isAdmin}
          onToggleSelect={toggleSelectItem}
          onOpenView={openViewModal}
          onOpenEdit={openEditModal}
          onDelete={setRemovingRole}
          onResetFilters={resetFilters}
        />
      ) : (
        <RoleTableView
          roles={visibleRoles}
          allRoles={roles}
          selectedIds={selectedIds}
          isAllCurrentSelected={isAllCurrentSelected}
          isAdmin={isAdmin}
          onToggleSelectAll={toggleSelectAll}
          onToggleSelect={toggleSelectItem}
          onOpenView={openViewModal}
          onOpenEdit={openEditModal}
          onDelete={setRemovingRole}
          onResetFilters={resetFilters}
        />
      )}

      {/* =========================================
          PAGINATION
          ========================================= */}
      {!loading && filteredRoles.length > 0 && (
        <div className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            showingStart={showingStart}
            showingEnd={showingEnd}
            totalItems={filteredRoles.length}
            showOnSinglePage
          />
        </div>
      )}

      {/* =========================================
          FLOATING BATCH ACTION BAR
          ========================================= */}
      <BatchActionBar
        selectedCount={selectedCount}
        entityLabel="vai trò"
        onClearSelection={clearSelection}
      >
        <button
          type="button"
          onClick={() => handleExport()}
          className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/20"
        >
          <Download size={14} />
          <span>Xuất {selectedCount} vai trò</span>
        </button>
      </BatchActionBar>

      {/* =========================================
          UNIFIED DETAIL & CREATE/EDIT MODAL
          ========================================= */}
      {modalOpen && (
        <RoleDetailEditModal
          key={`${modalMode}-${activeRole?.idRole ?? "create"}`}
          open={modalOpen}
          role={activeRole}
          allRoles={roles}
          initialMode={modalMode}
          isAdmin={isAdmin}
          submitting={submitting}
          errorMessage={formError}
          assignedUsers={assignedUsers}
          assignedUsersLoading={assignedUsersLoading}
          onClose={closeModal}
          onSubmit={saveRole}
          onDelete={(role) => {
            closeModal();
            setRemovingRole(role);
          }}
        />
      )}

      {/* =========================================
          DELETE WITH REPLACEMENT MODAL
          ========================================= */}
      <RoleDeleteModal
        key={removingRole?.idRole ?? "delete-none"}
        open={Boolean(removingRole)}
        role={removingRole}
        allRoles={roles}
        submitting={removing}
        errorMessage={deleteError}
        onClose={() => !removing && setRemovingRole(null)}
        onConfirm={confirmRemove}
      />
    </div>
  );
};

export default RoleManagementPage;
