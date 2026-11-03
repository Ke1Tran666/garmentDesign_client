import { Download, RefreshCw } from "lucide-react";
import { useOutletContext } from "react-router-dom";

import {
  AdminServiceOrderDetailModal,
  ServiceOrderKanbanView,
  ServiceOrderStatsCards,
  ServiceOrderTableView,
  ServiceOrderToolbar,
  useServiceOrderManagement,
} from "@/features/service-order-management";
import BatchActionBar from "@/shared/ui/action-bar/BatchActionBar";
import ConfirmModal from "@/shared/ui/modal/ConfirmModal";

const ServiceOrderManagementPage = () => {
  const { searchKeyword = "" } = useOutletContext() || {};

  const {
    loading,
    localSearch,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    currentPage,
    setCurrentPage,
    totalPages,
    selectedOrder,
    setSelectedOrder,
    removingOrder,
    setRemovingOrder,
    removing,
    selectedIds,
    selectedCount,
    isAllCurrentSelected,
    stats,
    filteredOrders,
    visibleOrders,
    kanbanColumns,
    fetchOrders,
    handleQuickAdvanceStatus,
    handleExport,
    confirmRemove,
    toggleSelectItem,
    toggleSelectAll,
    clearSelection,
    resetFilters,
    handleSearchChange,
  } = useServiceOrderManagement(searchKeyword);

  return (
    <div className="animate-in space-y-6 duration-200 fade-in">
      {/* =========================================
          PAGE HEADER
          ========================================= */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200/60 pb-2 sm:flex-row sm:items-center dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              Quản lý đơn dịch vụ
            </h1>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {filteredOrders.length} đơn hàng
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Theo dõi tiến trình thiết kế rập, nhảy size và kiểm duyệt đơn hàng
            dịch vụ khách hàng.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={fetchOrders}
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
            onClick={handleExport}
            className="flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            title="Xuất file Excel"
          >
            <Download size={14} className="text-slate-400" />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* =========================================
          TOP METRIC STATS CARDS
          ========================================= */}
      <ServiceOrderStatsCards stats={stats} onFilterStatus={setStatusFilter} />

      {/* =========================================
          TOOLBAR & FILTERS
          ========================================= */}
      <ServiceOrderToolbar
        search={localSearch}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* =========================================
          MAIN CONTENT: TABLE VIEW OR KANBAN BOARD
          ========================================= */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center text-slate-400 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <RefreshCw
            size={24}
            className="mx-auto mb-2 animate-spin text-brand"
          />
          Đang tải danh sách đơn dịch vụ...
        </div>
      ) : viewMode === "kanban" ? (
        <ServiceOrderKanbanView
          columns={kanbanColumns}
          totalCount={filteredOrders.length}
          onSelectOrder={setSelectedOrder}
          onQuickAdvanceStatus={handleQuickAdvanceStatus}
          onResetFilters={resetFilters}
        />
      ) : (
        <ServiceOrderTableView
          orders={visibleOrders}
          totalCount={filteredOrders.length}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onSelectOrder={setSelectedOrder}
          onRemoveOrder={setRemovingOrder}
          selectedIds={selectedIds}
          onToggleSelectItem={toggleSelectItem}
          isAllCurrentSelected={isAllCurrentSelected}
          onToggleSelectAll={toggleSelectAll}
          onResetFilters={resetFilters}
        />
      )}

      {/* =========================================
          FLOATING BATCH ACTION BAR
          ========================================= */}
      <BatchActionBar
        selectedCount={selectedCount}
        entityLabel="đơn hàng"
        onClearSelection={clearSelection}
      >
        <button
          type="button"
          onClick={handleExport}
          className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/20"
        >
          <Download size={14} />
          <span>Xuất {selectedCount} đơn</span>
        </button>
      </BatchActionBar>

      {/* =========================================
          ORDER DETAIL MODAL
          ========================================= */}
      {selectedOrder && (
        <AdminServiceOrderDetailModal
          open={Boolean(selectedOrder)}
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={() => {
            fetchOrders();
          }}
        />
      )}

      {/* =========================================
          CONFIRM DELETE MODAL
          ========================================= */}
      <ConfirmModal
        open={Boolean(removingOrder)}
        title="Xóa đơn dịch vụ"
        confirmText="Xác nhận xóa"
        confirmVariant="danger"
        submitting={removing}
        onClose={() => setRemovingOrder(null)}
        onConfirm={confirmRemove}
      >
        <p>
          Bạn có chắc chắn muốn xóa đơn dịch vụ{" "}
          <strong className="text-slate-900 dark:text-white">
            ORD-{removingOrder?.serviceOrderId}
          </strong>
          ? Thao tác này sẽ xóa vĩnh viễn đơn hàng này khỏi cơ sở dữ liệu.
        </p>
      </ConfirmModal>
    </div>
  );
};

export default ServiceOrderManagementPage;
