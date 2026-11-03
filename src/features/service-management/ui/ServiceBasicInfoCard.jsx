import { Check, Copy, DollarSign, Layers, RefreshCw, Ruler, Tag } from "lucide-react";
import { formatVND } from "../hooks/useServiceSuggestions";

const ServiceBasicInfoCard = ({
  isViewMode = false,
  service,
  form,
  onFormChange,
  onSetFormValue,
  unitSuggestions = [],
  priceSuggestions = [],
  tagSuggestions = [],
  copiedCode = false,
  onCopyCode,
  onGenerateCode,
  submitting = false,
  className = "",
}) => {
  const currentTags = isViewMode
    ? service?.tags
      ? service.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : []
    : form.tags
      ? form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

  const handleToggleTag = (tag) => {
    const existing = form.tags
      ? form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];
    if (existing.includes(tag)) {
      onSetFormValue?.("tags", existing.filter((t) => t !== tag).join(", "));
    } else {
      onSetFormValue?.("tags", [...existing, tag].join(", "));
    }
  };

  return (
    <div
      className={`space-y-5 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
          <Layers size={17} className="text-brand" />
          <span>Thông tin dịch vụ & Phân loại</span>
        </div>

        {/* Service Code Display & Copy */}
        {isViewMode && (
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1 font-mono text-xs font-bold text-slate-800 shadow-2xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            <span>{service?.serviceCode || `SRV-${service?.serviceId}`}</span>
            <button
              type="button"
              onClick={onCopyCode}
              className="cursor-pointer text-slate-400 transition-colors hover:text-brand"
              title={copiedCode ? "Đã sao chép!" : "Sao chép mã dịch vụ"}
            >
              {copiedCode ? (
                <Check size={14} className="stroke-3 text-emerald-500" />
              ) : (
                <Copy size={14} />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Service Code (Edit / Create) */}
      {!isViewMode && (
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Mã dịch vụ <span className="text-rose-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              name="serviceCode"
              value={form.serviceCode}
              onChange={onFormChange}
              placeholder="VD: DES-VEST01"
              disabled={submitting}
              className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 font-mono text-xs font-bold tracking-wider text-slate-900 uppercase focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
            {onGenerateCode && (
              <button
                type="button"
                onClick={onGenerateCode}
                disabled={submitting}
                className="flex h-10 shrink-0 cursor-pointer items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                title="Tạo mã dịch vụ tự động"
              >
                <RefreshCw size={13} />
                <span>Tự tạo</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Service Name */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Tên dịch vụ thiết kế <span className="text-rose-500">*</span>
        </label>
        {isViewMode ? (
          <div className="font-heading text-lg font-bold text-slate-900 dark:text-white">
            {service?.serviceName}
          </div>
        ) : (
          <input
            type="text"
            name="serviceName"
            value={form.serviceName}
            onChange={onFormChange}
            placeholder="VD: Thiết kế may đo Vest Nam Cao Cấp"
            disabled={submitting}
            className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        )}
      </div>

      {/* Unit Type & Base Price */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Unit Type */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Đơn vị tính <span className="text-rose-500">*</span>
          </label>
          {isViewMode ? (
            <div className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 shadow-2xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <Ruler size={13} className="text-brand" />
              <span>{service?.unitType || "Chưa thiết lập"}</span>
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                name="unitType"
                value={form.unitType}
                onChange={onFormChange}
                placeholder="VD: Sản phẩm, Bộ, Mẫu rập..."
                disabled={submitting}
                className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs font-medium text-slate-900 focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
              {/* Quick suggestion pills */}
              <div className="flex flex-wrap gap-1">
                {unitSuggestions.map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => onSetFormValue?.("unitType", unit)}
                    className={`cursor-pointer rounded-lg border px-2 py-0.5 text-[10px] font-semibold transition-all ${
                      form.unitType === unit
                        ? "border-brand bg-brand text-white shadow-xs"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {unit}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Base Price */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Giá cơ bản (VNĐ) <span className="text-rose-500">*</span>
          </label>
          {isViewMode ? (
            <div className="inline-flex items-center gap-1.5 font-heading text-xl font-extrabold text-brand">
              <DollarSign size={18} />
              <span>{formatVND(service?.basePrice)}</span>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="1000"
                  name="basePrice"
                  value={form.basePrice}
                  onChange={onFormChange}
                  placeholder="0"
                  disabled={submitting}
                  className="h-10 w-full rounded-xl border border-slate-300 bg-white pr-9 pl-3.5 font-heading text-xs font-bold text-slate-900 focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
                <span className="absolute top-1/2 right-3 -translate-y-1/2 text-xs font-bold text-slate-400">
                  đ
                </span>
              </div>

              {/* Formatted VND live preview */}
              {Number(form.basePrice) > 0 && (
                <div className="text-[11px] font-bold text-brand">
                  ≈ {formatVND(form.basePrice)}
                </div>
              )}

              {/* Quick price presets */}
              <div className="flex flex-wrap gap-1">
                {priceSuggestions.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => onSetFormValue?.("basePrice", item.value)}
                    className={`cursor-pointer rounded-lg border px-2 py-0.5 text-[10px] font-semibold transition-all ${
                      Number(form.basePrice) === item.value
                        ? "border-brand bg-brand text-white shadow-xs"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tags */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Thẻ phân loại & Từ khóa tìm kiếm
          </label>
          <span className="text-[10px] text-slate-400">
            {currentTags.length} thẻ
          </span>
        </div>

        {isViewMode ? (
          currentTags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {currentTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  <Tag size={11} className="text-brand" />
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-xs text-slate-400">Chưa gắn thẻ phân loại</span>
          )
        ) : (
          <div className="space-y-2">
            <input
              type="text"
              name="tags"
              value={form.tags}
              onChange={onFormChange}
              placeholder="Nhập các thẻ cách nhau bởi dấu phẩy (VD: May đo cao cấp, Vest nam, 3D...)"
              disabled={submitting}
              className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs font-medium text-slate-900 focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
            {/* Tag suggestions */}
            <div>
              <span className="mb-1 block text-[10px] font-medium text-slate-400">
                Gợi ý thẻ phổ biến (bấm để thêm/bỏ nhanh):
              </span>
              <div className="flex flex-wrap gap-1">
                {tagSuggestions.map((tag) => {
                  const isSelected = currentTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleToggleTag(tag)}
                      className={`cursor-pointer rounded-lg border px-2 py-0.5 text-[10px] font-semibold transition-all ${
                        isSelected
                          ? "border-brand bg-brand text-white shadow-xs"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {isSelected ? "✓" : "+"} {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Mô tả chi tiết quy trình & dịch vụ
        </label>
        {isViewMode ? (
          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 text-xs leading-relaxed text-slate-700 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300">
            {service?.description || (
              <span className="text-slate-400 italic">
                Chưa có thông tin mô tả chi tiết cho dịch vụ này.
              </span>
            )}
          </div>
        ) : (
          <textarea
            rows={4}
            name="description"
            value={form.description}
            onChange={onFormChange}
            placeholder="Mô tả các công đoạn thiết kế, chất liệu tư vấn, quy trình bàn giao cho khách hàng..."
            disabled={submitting}
            className="w-full resize-y rounded-xl border border-slate-300 bg-white p-3.5 text-xs font-medium text-slate-900 focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        )}
      </div>
    </div>
  );
};

export default ServiceBasicInfoCard;
