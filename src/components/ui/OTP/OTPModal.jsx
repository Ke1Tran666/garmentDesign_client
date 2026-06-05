import { X } from "lucide-react";
import { useEffect, useState } from "react";

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

  const OTP_LENGTH = 6;

  const createEmptyOtp = () => Array(OTP_LENGTH).fill("");
  const [otp, setOtp] = useState(createEmptyOtp);

  const resetOtp = () => {
    setOtp(createEmptyOtp());
    };

    useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
        document.getElementById("otp-modal-0")?.focus();
    }, 100);

    return () => clearTimeout(timer);
    }, [open]);  

  if (!open) return null;

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      document.getElementById(`otp-modal-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-modal-${index - 1}`)?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();

    const pastedOtp = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    if (!pastedOtp) return;

    const newOtp = Array(OTP_LENGTH).fill("");

    pastedOtp.split("").forEach((digit, index) => {
      newOtp[index] = digit;
    });

    setOtp(newOtp);

    document
      .getElementById(`otp-modal-${Math.min(pastedOtp.length, OTP_LENGTH) - 1}`)
      ?.focus();
  };

  const handleClose = () => {
    resetOtp();
    onClose?.();
    };

    const handleVerify = () => {
    const otpCode = otp.join("");

    if (otpCode.length !== OTP_LENGTH) {
        onVerify?.("");
        return;
    }

    onVerify?.(otpCode);
    };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      onMouseDown={onClose}
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

        <div className="mb-5 flex justify-between gap-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-modal-${index}`}
              type="text"
              inputMode="numeric"
              maxLength="1"
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(index, e)}
              onPaste={handleOtpPaste}
              className="
                h-12 w-12 rounded-xl border-2 border-gray-300
                bg-white text-center text-lg font-semibold text-gray-900
                outline-none transition-all duration-300
                focus:border-brand
                focus:shadow-[0_0_0_3px_rgba(1,146,245,0.12)]
              "
            />
          ))}
        </div>

        <div className="mb-5 flex items-center justify-between">
            <button
                type="button"
                onClick={() => {
                    resetOtp();
                    onResend?.();
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