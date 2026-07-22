import { X } from "lucide-react";
import { useRef, useState } from "react";
import { createEmptyOtp, isOtpComplete, toOtpCode } from "./otp";
import OtpInput from "./OtpInput";

const OTPModal = ({
  open,
  title = "Xác thực OTP",
  desc = "Nhập mã OTP 6 số đã được gửi đến bạn.",
  target = "",
  loading = false,
  onClose,
  onVerify,
  onResend,
}) => {

  const [otp, setOtp] = useState(createEmptyOtp);
  const otpInputRef = useRef(null);

  const resetOtp = () => {
    setOtp(createEmptyOtp());
  };

  if (!open) return null;

  const handleClose = () => {
    resetOtp();
    onClose?.();
    };

  const handleVerify = () => {
    if (!isOtpComplete(otp)) {
      onVerify?.("");
      return;
    }

    onVerify?.(toOtpCode(otp));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      onMouseDown={handleClose}
    >
      <div
        className="w-full max-w-md animate-slide-up rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            <p className="mt-1 text-sm text-gray-500">{desc}</p>

            {target && (
              <p className="mt-2 text-sm font-semibold text-brand">
                {target}
              </p>
            )}
          </div>

            <button
                type="button"
                onClick={handleClose}
                className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            >
                <X size={18} />
            </button>
        </div>

        <OtpInput
          ref={otpInputRef}
          value={otp}
          onChange={setOtp}
          variant="light"
          autoFocus
          disabled={loading}
          className="mb-5"
        />

        <div className="mb-5 flex items-center justify-between">
            <button
                type="button"
                onClick={() => {
                  resetOtp();
                  onResend?.();

                  requestAnimationFrame(() => {
                    otpInputRef.current?.focus();
                  });
                }}
                className="text-sm font-medium text-gray-500 transition hover:text-brand"
            >
            Gửi lại mã
            </button>

            <button
                type="button"
                onClick={handleClose}
                className="text-sm font-medium text-gray-500 transition hover:text-gray-900"
            >
                Hủy
            </button>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={handleVerify}
          className="
            w-full rounded-xl bg-brand! px-5 py-3 text-sm font-semibold text-white
            shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60
          "
        >
          {loading ? "Đang xác thực..." : "Xác thực"}
        </button>
      </div>
    </div>
  );
};

export default OTPModal;