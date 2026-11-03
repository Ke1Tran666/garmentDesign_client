import { CheckSquare, Eye, Pencil, Square, Tag, Trash2 } from "lucide-react";
import { formatPrice, getStatusInfo } from "../lib/serviceUtils";

const ServiceCardItem = ({
  service,
  isSelected = false,
  isAdmin = false,
  onToggleSelect,
  onToggleStatus,
  onOpenView,
  onOpenEdit,
  onDelete,
}) => {
  if (!service) return null;

  const statusInfo = getStatusInfo(service);
  const tagList = service.tags
    ? service.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-xs transition-all hover:shadow-md dark:bg-slate-900 ${
        isSelected
          ? "border-brand ring-2 ring-brand/10 dark:border-brand"
          : "border-slate-200/80 hover:border-slate-300 dark:border-slate-800"
      }`}
    >
      <div>
        {/* Top Header: Code, Checkbox & Status */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleSelect?.(service.serviceId)}
              className="cursor-pointer text-slate-400 hover:text-brand"
              title={isSelected ? "Bỏ chọn" : "Chọn dịch vụ này"}
            >
              {isSelected ? (
                <CheckSquare size={16} className="text-brand" />
              ) : (
                <Square size={16} />
              )}
            </button>
            <span className="rounded-md bg-slate-100 px-2.5 py-0.5 font-mono text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {service.serviceCode || `SRV-${service.serviceId}`}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onToggleStatus?.(service)}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold transition-all hover:opacity-85 ${statusInfo.className}`}
            title="Nhấn để đổi trạng thái hoạt động"
          >
            <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.dot}`} />
            {statusInfo.label}
          </button>
        </div>

        {/* Title & Description */}
        <button
          type="button"
          onClick={() => onOpenView?.(service)}
          className="line-clamp-2 block cursor-pointer text-left font-heading text-base leading-snug font-bold text-slate-900 transition-colors hover:text-brand dark:text-white dark:hover:text-brand"
        >
          {service.serviceName}
        </button>

        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          {service.description || "Chưa có mô tả chi tiết cho dịch vụ này."}
        </p>

        {/* Tags */}
        {tagList.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {tagList.slice(0, 3).map((tagItem) => (
              <span
                key={tagItem}
                className="inline-flex items-center gap-0.5 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              >
                <Tag size={9} />
                {tagItem}
              </span>
            ))}
            {tagList.length > 3 && (
              <span className="self-center text-[10px] text-slate-400">
                +{tagList.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer: Price & Actions */}
      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3.5 dark:border-slate-800">
        <div>
          <span className="block text-[10px] font-medium text-slate-400">
            Đơn giá / {service.unitType || "sản phẩm"}
          </span>
          <span className="text-base font-extrabold tracking-tight text-brand">
            {formatPrice(service.basePrice)}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onOpenView?.(service)}
            className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-brand dark:hover:bg-slate-800"
            title="Xem chi tiết dịch vụ"
          >
            <Eye size={16} />
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={() => onOpenEdit?.(service)}
              className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/40"
              title="Chỉnh sửa dịch vụ"
            >
              <Pencil size={16} />
            </button>
          )}

          {isAdmin && !service.deletedAt && (
            <button
              type="button"
              onClick={() => onDelete?.(service)}
              className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
              title="Xóa dịch vụ"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceCardItem;
