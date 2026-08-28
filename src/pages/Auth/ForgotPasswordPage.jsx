import { ArrowRight, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useRef, useState } from "react";

import "@/shared/styles/index.css";

import PrimaryButton from "@/shared/ui/button/PrimaryButton";

import { useNotification } from "@/app/providers/NotificationProvider";

import FloatingInput from "@/shared/ui/input/FloatingInput";
import PasswordInput from "@/shared/ui/input/PasswordInput";
import BrandHeader from "@/shared/ui/brand/BrandHeader";
import { createEmptyOtp, isOtpComplete, toOtpCode } from "@/features/auth/ui/otp";
import OtpInput from "@/features/auth/ui/OtpInput";
import { authApi } from "@/features/auth/api/authApi";

const getErrorMessage = (
  error,
  fallback = "Vui lòng thử lại",
) => {
  if (error.code === "ECONNABORTED") {
    return "Máy chủ phản hồi quá lâu. Vui lòng thử lại";
  }

  if (!error.response) {
    return error.message || "Không thể kết nối đến máy chủ";
  }

  return error.response.data?.message || fallback;
};

const ForgotPasswordSteps = ({ currentStep }) => {
  const steps = ["Nhập Email", "Xác thực OTP", "Đổi mật khẩu", "Hoàn thành"];

  return (
    <div className="mb-7">
      <div className="flex items-start justify-between">
        {steps.map((label, index) => {
          const stepNumber = index + 1;
          const active = currentStep === stepNumber;
          const done = currentStep > stepNumber;

          return (
            <div key={label} className="flex flex-1 items-start">
              <div className="flex min-w-16 flex-col items-center">
                <div
                  className={`
                    flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold transition-all duration-300
                    ${
                      active || done
                        ? "border-auth-accent bg-auth-accent text-auth-accent-foreground"
                        : "border-white/35 bg-white/10 text-white/60"
                    }
                  `}
                >
                  {stepNumber}
                </div>

                <span
                  className={`
                    mt-2 text-center text-[11px] leading-4 transition-all duration-300
                    ${active ? "text-auth-accent" : "text-white/50"}
                  `}
                >
                  {label}
                </span>
              </div>

              {stepNumber < steps.length && (
                <div
                  className={`
                    mt-3 h-px flex-1 transition-all duration-300
                    ${done ? "bg-auth-accent" : "bg-white/25"}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(createEmptyOtp);
  const otpInputRef = useRef(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();
  const [resetToken, setResetToken] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    try {
      setLoading(true);

      if (step === 1) {
        if (!email.trim()) {
          showNotification(
            "warning",
            "Thiếu email",
            "Vui lòng nhập email của bạn"
          );
          return;
        }

        const result =
          await authApi.forgotPassword(email);

        setResetToken("");

        showNotification(
          "success",
          "Đã gửi OTP",
          result?.message || "Vui lòng kiểm tra email của bạn",
        );

        setStep(2);

        return;
      }

      if (step === 2) {
        const otpCode = toOtpCode(otp);

        if (!isOtpComplete(otp)) {
          showNotification(
            "warning",
            "OTP chưa hợp lệ",
            "Vui lòng nhập đủ 6 số OTP",
          );
          return;
        }

        const result = await authApi.verifyForgotOtp({ email, otp: otpCode });

        if (!result?.resetToken) {
          throw new Error(
            "Không nhận được phiên đổi mật khẩu",
          );
        }

        /*
        * Chỉ giữ token trong React state.
        * Không lưu localStorage hoặc sessionStorage.
        */
        setResetToken(result.resetToken);

        showNotification(
          "success",
          "Xác thực thành công",
          result?.message || "Vui lòng đổi mật khẩu mới",
        );

        setStep(3);
        return;
      }

      if (step === 3) {
        if (!newPassword.trim() || !confirmPassword.trim()) {
          showNotification(
            "warning",
            "Thiếu mật khẩu",
            "Vui lòng nhập đầy đủ mật khẩu"
          );
          return;
        }

        if (newPassword !== confirmPassword) {
          showNotification(
            "warning",
            "Mật khẩu không khớp",
            "Vui lòng nhập lại mật khẩu"
          );
          return;
        }

        if (newPassword.length < 8) {
          showNotification(
            "warning",
            "Mật khẩu chưa hợp lệ",
            "Mật khẩu phải có ít nhất 8 ký tự",
          );

          return;
        }

        if (!resetToken) {
          showNotification(
            "error",
            "Phiên đã hết hạn",
            "Vui lòng xác thực OTP lại",
          );

          setStep(2);
          return;
        }

        const result =
          await authApi.resetPassword({
            email,
            newPassword,
            resetToken,
          });

        setResetToken("");

        showNotification(
          "success",
          "Đổi mật khẩu thành công",
          result?.message
            || "Bạn sẽ được chuyển về trang đăng nhập",
        );

        setStep(4);

        setTimeout(() => {
          window.location.href = "/login";
        }, 6000);
      }
    } catch (error) {
      showNotification(
        "error",
        "Thao tác thất bại",
        getErrorMessage(
          error,
          "Không thể thực hiện yêu cầu",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="w-full max-w-115 rounded-3xl border border-white/20 bg-white/10 px-10 py-10 shadow-[0_8px_40px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-[18px] animate-slide-up">
        {/* LOGO */}
        <BrandHeader subtitle="Khôi phục tài khoản của bạn"/>

        <hr className="mb-6 border-white/10" />

        <h1 className="mb-2 text-[22px] font-semibold text-white">
          {step === 1 && "Quên mật khẩu?"}
          {step === 2 && "Xác thực OTP"}
          {step === 3 && "Đổi mật khẩu"}
          {step === 4 && "Hoàn thành"}
        </h1>

        <p className="mb-6 text-[13px] font-light text-white/55">
          {step === 1 &&
            "Nhập email đã đăng ký để nhận mã xác thực OTP."}
          {step === 2 &&
            "Nhập mã OTP 6 số đã được gửi đến email của bạn."}
          {step === 3 &&
            "Tạo mật khẩu mới để tiếp tục sử dụng tài khoản."}
          {step === 4 &&
            "Đổi mật khẩu thành công. Hệ thống sẽ tự chuyển về đăng nhập."}
        </p>

        <form onSubmit={handleSubmit}>
          <ForgotPasswordSteps currentStep={step} />

          <div key={step} className="animate-formSwitch">
            {step === 1 && (
              <FloatingInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                label="Email"
                icon={Mail}
                containerClassName="mb-5"
                required
              />
            )}

            {step === 2 && (
              <div className="mb-5">
                <p className="mb-4 text-center text-sm text-white/60">
                  Mã OTP đã gửi đến{" "}
                  <span className="font-medium text-auth-accent">
                    {email}
                  </span>
                </p>

                <OtpInput
                  ref={otpInputRef}
                  value={otp}
                  onChange={setOtp}
                  variant="dark"
                  autoFocus
                  disabled={loading}
                />

                <div className="mt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setOtp(createEmptyOtp());
                      setResetToken("");
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                    className="text-xs text-auth-accent transition hover:text-white"
                  >
                    Đổi email
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await authApi.forgotPassword(email);

                        showNotification(
                          "success",
                          "Đã gửi lại OTP",
                          "Vui lòng kiểm tra email"
                        );

                        setResetToken("");
                        setOtp(createEmptyOtp());

                        requestAnimationFrame(() => {
                          otpInputRef.current?.focus();
                        });
                      } catch (error) {
                        showNotification(
                          "error",
                          "Gửi lại OTP thất bại",
                          getErrorMessage(
                            error,
                            "Không thể gửi lại OTP",
                          ),
                        );
                      }
                    }}
                    className="text-xs text-white/55 transition hover:text-white"
                  >
                    Gửi lại mã
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <>
                <PasswordInput
                  containerClassName="mb-5"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  label="Mật khẩu mới"
                  required
                />

                <PasswordInput
                  containerClassName="mb-5"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  label="Nhập lại mật khẩu"
                  required
                />
              </>
            )}

            {step === 4 && (
              <div className="mb-5 rounded-2xl border border-auth-accent/30 bg-white/10 p-5 text-center">
                <h2 className="mb-2 text-lg font-semibold text-white">
                  Đổi mật khẩu thành công
                </h2>

                <p className="text-sm text-white/60">
                  Bạn sẽ được chuyển về trang đăng nhập sau 5 - 8 giây.
                </p>
              </div>
            )}
          </div>

          {step !== 4 && (
            <PrimaryButton
              type="submit"
              disabled={loading}
              className="mt-2"
              icon={ArrowRight}
            >
              {loading
                ? "Đang xử lý..."
                : step === 1
                  ? "Gửi mã OTP"
                  : step === 2
                    ? "Xác thực OTP"
                    : "Đổi mật khẩu"}
            </PrimaryButton>
          )}
        </form>

        <p className="mt-5 text-center text-[13px] text-white/45">
          Đã nhớ mật khẩu?{" "}
          <Link
            to="/login"
            className="font-medium text-auth-accent hover:text-white"
          >
            Quay lại đăng nhập
          </Link>
        </p>
      </div>
    </>
  );
};

export default ForgotPasswordPage;
