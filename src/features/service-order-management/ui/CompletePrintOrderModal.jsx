import { useState } from "react";
import { CheckCircle2, DollarSign, Printer, Ruler, X } from "lucide-react";
import { formatPrice } from "../lib/serviceOrderUtils";

const CompletePrintOrderModal = ({
  open,
  order,
  onClose,
  onConfirm,
  submitting = false,
}) => {
  const [prevKey, setPrevKey] = useState(null);
  const [meterCount, setMeterCount] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [error, setError] = useState("");

  const unitPrice = Number(order?.unitPrice || 0);

  const currentKey = open && order ? `${order.serviceOrderId}_${open}` : null;
  if (currentKey && currentKey !== prevKey) {
    setPrevKey(currentKey);
    const initialMeters = order?.meterCount ? String(order.meterCount) : "";
    setMeterCount(initialMeters);

    if (initialMeters && Number(initialMeters) > 0) {
      const calculated = Math.round(Number(initialMeters) * unitPrice);
      setTotalPrice(String(calculated));
    } else if (order?.totalPrice) {
      setTotalPrice(String(order.totalPrice));
    } else {
      setTotalPrice("");
    }
    setError("");
  }

  if (!open || !order) return null;

  const handleMeterChange = (e) => {
    const val = e.target.value;
    setMeterCount(val);
    setError("");

    const meters = Number(val);
    if (Number.isFinite(meters) && meters > 0) {
      const calculated = Math.round(meters * unitPrice);
      setTotalPrice(String(calculated));
    }
  };

  const handleTotalPriceChange = (e) => {
    setTotalPrice(e.target.value);
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const rawMeters = Number(meterCount);
    if (!meterCount || !Number.isFinite(rawMeters) || rawMeters <= 0) {
      setError("Vui lòng nhập số mét đã in hợp lệ (lớn hơn 0).");
      return;
    }

    // Giữ tối đa 4 chữ số thập phân sau dấu phẩy
    const meters = Number(rawMeters.toFixed(4));

    const price = Number(totalPrice);
    if (!Number.isFinite(price) || price < 0) {
      setError("Tổng tiền không hợp lệ.");
      return;
    }

    onConfirm?.({
      meterCount: meters,
      totalPrice: price,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-slate-900/60 px-4 py-6 backdrop-blur-xs duration-150 fade-in"
    >
      <div
        role="presentation"
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
      >
        {/* Accent top line */}
        <div className="h-1.5 w-full bg-linear-to-r from-brand via-sky-400 to-emerald-500" />

        {/* Modal Header */}
        <header className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <Printer size={20} />
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                Xác nhận hoàn tất in sơ đồ / in rập
              </h3>
              <p className="mt-0.5 text-xs text-slate-400">
                Nhập số mét thực tế đã in để hoàn thành đơn hàng
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </header>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Order Info Card */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-xs space-y-2 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Mã đơn:</span>
              <span className="font-mono font-bold text-brand">
                ORD-{order.serviceOrderId}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Mẫu sản phẩm:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {order.productName || "Sản phẩm may mặc"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Số bản khách yêu cầu:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {order.quantity || 1} bản in
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-slate-200/60 pt-2 dark:border-slate-700">
              <span className="text-slate-500">Đơn giá niêm yết:</span>
              <span className="font-semibold text-brand">
                {formatPrice(unitPrice)} / mét
              </span>
            </div>
          </div>

          {/* Input: Số mét đã in */}
          <div>
            <label className="mb-1.5 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Ruler size={14} className="text-brand" />
                <span>Số mét in thực tế (meter)</span>
              </span>
              <span className="text-[11px] font-normal text-rose-500">
                * Bắt buộc
              </span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="0.0001"
                required
                value={meterCount}
                onChange={handleMeterChange}
                placeholder="Ví dụ: 7.356 hoặc 15.5..."
                className="h-10.5 w-full rounded-xl border border-slate-200 bg-white pr-14 pl-3.5 text-sm font-semibold text-slate-900 transition-all placeholder:font-normal placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/10 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <span className="absolute top-1/2 right-3 -translate-y-1/2 text-xs font-bold text-slate-400">
                mét
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Đo chiều dài thực tế đã in trên giấy (hỗ trợ nhập tối đa 4 chữ số sau dấu phẩy, ví dụ: 7.356 hoặc 7.3562).
            </p>
          </div>

          {/* Input: Tổng tiền thanh toán */}
          <div>
            <label className="mb-1.5 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <DollarSign size={14} className="text-emerald-500" />
                <span>Tổng tiền thanh toán (VND)</span>
              </span>
              <span className="text-[11px] text-slate-400">
                (Tự động = Số mét × Đơn giá)
              </span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={totalPrice}
                onChange={handleTotalPriceChange}
                className="h-10.5 w-full rounded-xl border border-slate-200 bg-white pr-12 pl-3.5 text-sm font-bold text-brand transition-all focus:border-brand focus:ring-2 focus:ring-brand/10 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800"
              />
              <span className="absolute top-1/2 right-3 -translate-y-1/2 text-xs font-bold text-slate-400">
                đ
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Mức giá dự kiến: {formatPrice(totalPrice)}
            </p>
          </div>

          {/* Error Message if any */}
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-600 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400">
              {error}
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-emerald-500 disabled:opacity-50"
            >
              <CheckCircle2 size={15} />
              <span>
                {submitting ? "Đang xử lý..." : "Xác nhận & Hoàn tất đơn"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompletePrintOrderModal;
