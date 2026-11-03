import { Download, Plus, RefreshCw } from "lucide-react";
import { useOutletContext } from "react-router-dom";

import ConfirmModal from "@/shared/ui/modal/ConfirmModal";
import Pagination from "@/shared/ui/table/Pagination";

import {
  SORT_OPTIONS,
  ServiceBatchActionBar,
  ServiceDetailEditModal,
  ServiceEmptyState,
  ServiceGridView,
  ServiceStatsCards,
  ServiceTableView,
  ServiceToolbar,
  useServiceManagement,
} from "@/features/service-management";

const ServiceManagementPage = () => {
  const { adminUser, searchKeyword = "" } = useOutletContext() || {};

  const {
    isAdmin,
    services,
    loading,
    submitting,
    removing,
    localSearch,
    setLocalSearch,
    statusFilter,
    setStatusFilter,
    unitTypeFilter,
    setUnitTypeFilter,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    setCurrentPage,
    selectedIds,
    setSelectedIds,
    filteredServices,
    visibleServices,
    totalPages,
    safeCurrentPage,
    stats,
    unitTypeOptions,
    isAllCurrentSelected,
    formOpen,
    setFormOpen,
    editingService,
    setEditingService,
    modalMode,
    formError,
    setFormError,
    removingService,
    setRemovingService,
    fetchServices,
    handleExport,
    toggleStatus,
    handleBatchStatus,
    saveService,
    confirmRemove,
    resetFilters,
    handleOpenCreate,
    handleOpenView,
    handleOpenEdit,
    handleToggleSelect,
    handleSelectAllCurrent,
    PAGE_SIZE,
  } = useServiceManagement({ adminUser, searchKeyword });

  return (
    <div className="animate-in space-y-6 duration-200 fade-in">
      {/* =========================================
          PAGE HEADER
          ========================================= */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200/80 pb-2 sm:flex-row sm:items-center dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              Quản lý dịch vụ thiết kế
            </h1>
            <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-semibold text-brand dark:bg-brand/20">
              {filteredServices.length} dịch vụ
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
            Cấu hình danh mục dịch vụ may đo, đơn giá niêm yết và quy chuẩn kỹ
            thuật cho khách hàng.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={fetchServices}
            disabled={loading}
            className="flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            title="Đồng bộ dữ liệu mới nhất từ máy chủ"
          >
            <RefreshCw
              size={14}
              className={loading ? "animate-spin text-brand" : "text-slate-400"}
            />
            <span className="hidden sm:inline">Làm mới</span>
          </button>

          <button
            type="button"
            onClick={() => handleExport(filteredServices)}
            className="flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            title="Xuất bảng giá ra file Excel"
          >
            <Download size={14} className="text-slate-400" />
            <span>Xuất Excel</span>
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="flex h-9 cursor-pointer items-center gap-1.5 rounded-xl bg-brand! px-3.5 text-xs font-semibold text-white! shadow-sm shadow-brand/25 transition-all hover:bg-brand-hover! active:scale-95"
            >
              <Plus size={15} className="stroke-[2.5]" />
              <span>Thêm dịch vụ mới</span>
            </button>
          )}
        </div>
      </div>

      {/* =========================================
          TOP METRIC STATS CARDS
          ========================================= */}
      <ServiceStatsCards
        stats={stats}
        onFilterStatus={(st) => {
          setStatusFilter(st);
          setCurrentPage(1);
        }}
      />

      {/* =========================================
          TOOLBAR, FILTERS & VIEW MODE SWITCHER
          ========================================= */}
      <ServiceToolbar
        search={localSearch}
        onSearchChange={(val) => {
          setLocalSearch(val);
          setCurrentPage(1);
        }}
        unitTypeFilter={unitTypeFilter}
        onUnitTypeChange={(val) => {
          setUnitTypeFilter(val);
          setCurrentPage(1);
        }}
        unitTypeOptions={unitTypeOptions}
        sortBy={sortBy}
        onSortChange={setSortBy}
        sortOptions={SORT_OPTIONS}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        statusFilter={statusFilter}
        onStatusFilterChange={(st) => {
          setStatusFilter(st);
          setCurrentPage(1);
        }}
        hasVisibleItems={visibleServices.length > 0}
        isAllCurrentSelected={isAllCurrentSelected}
        onToggleSelectAll={handleSelectAllCurrent}
      />

      {/* =========================================
          CONTENT: GRID VIEW OR TABLE VIEW
          ========================================= */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center text-slate-400 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <RefreshCw
            size={24}
            className="mx-auto mb-2 animate-spin text-brand"
          />
          Đang tải danh mục dịch vụ từ máy chủ...
        </div>
      ) : visibleServices.length === 0 ? (
        <ServiceEmptyState onResetFilters={resetFilters} />
      ) : viewMode === "grid" ? (
        <ServiceGridView
          services={visibleServices}
          selectedIds={selectedIds}
          isAdmin={isAdmin}
          onToggleSelect={handleToggleSelect}
          onToggleStatus={toggleStatus}
          onOpenView={handleOpenView}
          onOpenEdit={handleOpenEdit}
          onDelete={setRemovingService}
        />
      ) : (
        <ServiceTableView
          services={visibleServices}
          selectedIds={selectedIds}
          isAllCurrentSelected={isAllCurrentSelected}
          isAdmin={isAdmin}
          onToggleSelectAll={handleSelectAllCurrent}
          onToggleSelect={handleToggleSelect}
          onToggleStatus={toggleStatus}
          onOpenView={handleOpenView}
          onOpenEdit={handleOpenEdit}
          onDelete={setRemovingService}
        />
      )}

      {/* =========================================
          PAGINATION
          ========================================= */}
      {!loading && filteredServices.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-xs sm:flex-row dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs text-slate-500">
            Hiển thị {(safeCurrentPage - 1) * PAGE_SIZE + 1} -{" "}
            {Math.min(safeCurrentPage * PAGE_SIZE, filteredServices.length)}{" "}
            trên tổng số{" "}
            <strong className="text-slate-800 dark:text-white">
              {filteredServices.length}
            </strong>{" "}
            dịch vụ
          </span>

          <Pagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* =========================================
          FLOATING BATCH ACTION BAR
          ========================================= */}
      <ServiceBatchActionBar
        selectedCount={selectedIds.length}
        onBatchActivate={() => handleBatchStatus("active")}
        onBatchDeactivate={() => handleBatchStatus("inactive")}
        onBatchExport={() => {
          const selectedServices = services.filter((s) =>
            selectedIds.includes(s.serviceId),
          );
          handleExport(selectedServices);
        }}
        onClearSelection={() => setSelectedIds([])}
      />

      {/* =========================================
          UNIFIED SERVICE DETAIL & EDIT MODAL
          ========================================= */}
      {formOpen && (
        <ServiceDetailEditModal
          key={`${editingService?.serviceId ?? "create"}-${modalMode}`}
          open={formOpen}
          service={editingService}
          allServices={services}
          initialMode={modalMode}
          isAdmin={isAdmin}
          submitting={submitting}
          errorMessage={formError}
          onClose={() => {
            setFormOpen(false);
            setEditingService(null);
            setFormError("");
          }}
          onSubmit={saveService}
          onDelete={(srv) => {
            setFormOpen(false);
            setRemovingService(srv);
          }}
        />
      )}

      {/* =========================================
          CONFIRM DELETE MODAL
          ========================================= */}
      <ConfirmModal
        open={Boolean(removingService)}
        title="Xóa dịch vụ thiết kế"
        confirmText="Xác nhận xóa"
        confirmVariant="danger"
        submitting={removing}
        onClose={() => setRemovingService(null)}
        onConfirm={confirmRemove}
      >
        <p>
          Bạn có chắc chắn muốn ngừng cung cấp dịch vụ{" "}
          <strong className="text-slate-900 dark:text-white">
            {removingService?.serviceName}
          </strong>{" "}
          (Mã: {removingService?.serviceCode})? Dịch vụ này sẽ chuyển sang trạng
          thái ngưng hoạt động và không hiển thị cho khách hàng đặt mới.
        </p>
      </ConfirmModal>
    </div>
  );
};

export default ServiceManagementPage;
