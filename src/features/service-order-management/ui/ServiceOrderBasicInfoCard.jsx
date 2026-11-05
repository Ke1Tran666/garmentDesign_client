import { FileText, MapPin, Printer, Ruler, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import {
  formatMeterCount,
  formatPrice,
  getOrderUnitLabel,
  isPrintService,
} from "../lib/serviceOrderUtils";

const ServiceOrderBasicInfoCard = ({
  order,
  onOpenPrintModal,
  className = "",
}) => {
  if (!order) return null;

  const address = [order.address?.companyName, order.address?.address]
    .filter(Boolean)
    .join(" - ");

  const isPrint = isPrintService(order);
  const unitLabel = getOrderUnitLabel(order);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Product & Service Specifications */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Wrench size={18} className="text-brand" />
            <h3 className="font-heading text-sm font-bold tracking-tight text-slate-900 dark:text-white">
              Thông tin dịch vụ & Mẫu thiết kế
            </h3>
          </div>
          {order.service?.serviceId && (
            <Link
              to={`/admin/services/${order.service.serviceId}`}
              className="text-xs font-semibold text-brand hover:underline"
            >
              Xem thông tin gốc dịch vụ →
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/30">
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Dịch vụ áp dụng
            </span>
            <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
              {order.service?.serviceName || "Dịch vụ thiết kế rập"}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Mã DV: {order.service?.serviceCode || `SRV-${order.serviceId || "---"}`}
              {" • "}Đơn giá: {formatPrice(order.unitPrice)}
              {isPrint ? " / mét" : ` / ${unitLabel}`}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/30">
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Tên sản phẩm / Mẫu may
            </span>
            <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
              {order.productName || "Sản phẩm may mặc"}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Số lượng yêu cầu:{" "}
              <strong className="text-slate-800 dark:text-slate-200">
                {order.quantity || 1} {unitLabel}
              </strong>
            </p>
          </div>
        </div>

        {/* Special Banner for Printing Services (In sơ đồ / In rập) */}
        {isPrint && (
          <div className="mt-4 rounded-2xl border border-sky-200 bg-sky-50/60 p-4 dark:border-sky-900/60 dark:bg-sky-950/30">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-brand dark:bg-sky-900/50">
                  <Printer size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Thông số in sơ đồ / in rập
                  </h4>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
                    <span>
                      Số bản cần in:{" "}
                      <strong className="text-slate-900 dark:text-white">
                        {order.quantity || 1} bản
                      </strong>
                    </span>
                    <span>
                      Số mét đã in thực tế:{" "}
                      <strong className="text-brand font-bold">
                        {order.meterCount
                          ? `${formatMeterCount(order.meterCount)} mét`
                          : "Chờ nhân viên in xong nhập vào"}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              {onOpenPrintModal && order.status !== "cancelled" && (
                <button
                  type="button"
                  onClick={onOpenPrintModal}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-white px-3.5 py-1.5 text-xs font-bold text-brand shadow-2xs hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <Ruler size={14} />
                  <span>
                    {order.meterCount ? "Sửa số mét in" : "Nhập số mét in"}
                  </span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Customer Specifications / Instructions */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex items-center gap-2">
          <FileText size={18} className="text-brand" />
          <h3 className="font-heading text-sm font-bold tracking-tight text-slate-900 dark:text-white">
            Yêu cầu kỹ thuật từ khách hàng
          </h3>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4.5 text-xs leading-relaxed text-slate-700 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-200">
          {order.customerRequest ? (
            <p className="whitespace-pre-wrap">{order.customerRequest}</p>
          ) : (
            <p className="italic text-slate-400">
              Khách hàng không đính kèm ghi chú kỹ thuật đặc biệt cho đơn hàng này.
            </p>
          )}
        </div>
      </div>

      {/* Delivery & Address */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex items-center gap-2">
          <MapPin size={18} className="text-brand" />
          <h3 className="font-heading text-sm font-bold tracking-tight text-slate-900 dark:text-white">
            Địa chỉ giao nhận & Gửi mẫu thử
          </h3>
        </div>

        <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-4.5 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-200">
          <div>
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Địa chỉ nhận bàn giao
            </span>
            <p className="mt-1 font-medium">
              {address || "Bàn giao file kỹ thuật số trực tuyến qua hệ thống"}
            </p>
          </div>

          {order.address?.note && (
            <div className="border-t border-slate-200/60 pt-2.5 dark:border-slate-700">
              <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                Ghi chú vận chuyển
              </span>
              <p className="mt-1 italic text-slate-600 dark:text-slate-300">
                {order.address.note}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceOrderBasicInfoCard;
