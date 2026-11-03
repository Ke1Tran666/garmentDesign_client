import { CheckSquare, Eye, Pencil, Square, Trash2 } from "lucide-react";
import { formatDate, formatPrice, getStatusInfo } from "../lib/serviceUtils";

const ServiceTableView = ({
  services = [],
  selectedIds = [],
  isAllCurrentSelected = false,
  isAdmin = false,
  onToggleSelectAll,
  onToggleSelect,
  onToggleStatus,
  onOpenView,
  onOpenEdit,
  onDelete,
}) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full min-w-220 text-left">
          <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold tracking-wider text-slate-500 uppercase dark:border-slate-800 dark:bg-slate-800/40">
            <tr>
              <th className="w-10 px-4 py-3.5">
                <button
                  type="button"
                  onClick={onToggleSelectAll}
                  className="cursor-pointer text-slate-400 hover:text-brand"
                  title={isAllCurrentSelected ? "Bỏ chọn tất cả" : "Chọn tất cả trang này"}
                >
                  {isAllCurrentSelected ? (
                    <CheckSquare size={15} className="text-brand" />
                  ) : (
                    <Square size={15} />
                  )}
                </button>
              </th>
              <th className="px-4 py-3.5">Mã dịch vụ</th>
              <th className="px-4 py-3.5">Tên dịch vụ & Thẻ</th>
              <th className="px-4 py-3.5">Đơn vị tính</th>
              <th className="px-4 py-3.5">Giá niêm yết</th>
              <th className="px-4 py-3.5">Trạng thái</th>
              <th className="px-4 py-3.5">Cập nhật lúc</th>
              <th className="px-4 py-3.5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
            {services.map((service) => {
              const statusInfo = getStatusInfo(service);
              const isSelected = selectedIds.includes(service.serviceId);

              return (
                <tr
                  key={service.serviceId}
                  className={`transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/50 ${
                    isSelected ? "bg-brand/5 dark:bg-brand/10" : ""
                  }`}
                >
                  <td className="px-4 py-3.5">
                    <button
                      type="button"
                      onClick={() => onToggleSelect?.(service.serviceId)}
                      className="cursor-pointer text-slate-400 hover:text-brand"
                    >
                      {isSelected ? (
                        <CheckSquare size={15} className="text-brand" />
                      ) : (
                        <Square size={15} />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {service.serviceCode || `SRV-${service.serviceId}`}
                  </td>
                  <td className="px-4 py-3.5">
                    <button
                      type="button"
                      onClick={() => onOpenView?.(service)}
                      className="block cursor-pointer text-left font-bold text-slate-900 transition-colors hover:text-brand dark:text-white dark:hover:text-brand"
                    >
                      {service.serviceName}
                    </button>
                    {service.tags && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {service.tags
                          .split(",")
                          .slice(0, 2)
                          .map((t) => (
                            <span
                              key={t}
                              className="py-0.2 rounded bg-slate-100 px-1.5 text-[9px] text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                            >
                              {t.trim()}
                            </span>
                          ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-600 dark:text-slate-300">
                    {service.unitType || "---"}
                  </td>
                  <td className="px-4 py-3.5 font-extrabold text-brand">
                    {formatPrice(service.basePrice)}
                  </td>
                  <td className="px-4 py-3.5">
                    <button
                      type="button"
                      onClick={() => onToggleStatus?.(service)}
                      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold transition-all ${statusInfo.className}`}
                      title="Đổi trạng thái"
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${statusInfo.dot}`}
                      />
                      {statusInfo.label}
                    </button>
                  </td>
                  <td className="px-4 py-3.5 text-[11px] text-slate-500 dark:text-slate-400">
                    {formatDate(service.updatedAt || service.createdAt)}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onOpenView?.(service)}
                        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-brand dark:hover:bg-slate-800"
                        title="Xem chi tiết"
                      >
                        <Eye size={15} />
                      </button>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => onOpenEdit?.(service)}
                          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/40"
                          title="Chỉnh sửa"
                        >
                          <Pencil size={15} />
                        </button>
                      )}
                      {isAdmin && !service.deletedAt && (
                        <button
                          type="button"
                          onClick={() => onDelete?.(service)}
                          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                          title="Xóa dịch vụ"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ServiceTableView;
