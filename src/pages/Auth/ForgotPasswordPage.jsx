import { ArrowRight, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

import "../../index.css";

import PrimaryButton from "../../components/ui/Button/PrimaryButton";
import BackHomeButton from "../../components/ui/Button/BackHomeButton";

import { useNotification } from "../../components/ui/Notification/NotificationContext";

import Logo from "../../components/common/Logo/Logo";
import AuthBackground from "../../components/layout/AuthBackground";
import FloatingInput from "../../components/ui/Form/FloatingInput";
import PasswordInput from "../../components/ui/Form/PasswordInput";

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
                        ? "border-[#80d0ff] bg-[#80d0ff] text-[#0038a0]"
                        : "border-white/35 bg-white/10 text-white/60"
                    }
                  `}
                >
                  {stepNumber}
                </div>

                <span
                  className={`
                    mt-2 text-center text-[11px] leading-4 transition-all duration-300
                    ${active ? "text-[#80d0ff]" : "text-white/50"}
                  `}
                >
                  {label}
                </span>
              </div>

              {stepNumber < steps.length && (
                <div
                  className={`
                    mt-3 h-px flex-1 transition-all duration-300
                    ${done ? "bg-[#80d0ff]" : "bg-white/25"}
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
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`forgot-otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`forgot-otp-${index - 1}`)?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();

    const pastedOtp = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pastedOtp) return;

    const newOtp = ["", "", "", "", "", ""];
    pastedOtp.split("").forEach((digit, index) => {
      newOtp[index] = digit;
    });

    setOtp(newOtp);

    document
      .getElementById(`forgot-otp-${Math.min(pastedOtp.length, 6) - 1}`)
      ?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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

        await axios.post("http://localhost:8080/api/auth/forgot-password", {
          email,
        });

        showNotification(
          "success",
          "Đã gửi OTP",
          "Vui lòng kiểm tra email của bạn"
        );

        setStep(2);

        setTimeout(() => {
          document.getElementById("forgot-otp-0")?.focus();
        }, 100);

        return;
      }

      if (step === 2) {
        const otpCode = otp.join("");

        if (otpCode.length !== 6) {
          showNotification(
            "warning",
            "OTP chưa hợp lệ",
            "Vui lòng nhập đủ 6 số OTP"
          );
          return;
        }

        await axios.post("http://localhost:8080/api/auth/verify-forgot-otp", {
          email,
          otp: otpCode,
        });

        showNotification(
          "success",
          "Xác thực thành công",
          "Vui lòng đổi mật khẩu mới"
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

        await axios.post("http://localhost:8080/api/auth/reset-password", {
          email,
          newPassword,
        });

        showNotification(
          "success",
          "Đổi mật khẩu thành công",
          "Bạn sẽ được chuyển về trang đăng nhập"
        );

        setStep(4);

        setTimeout(() => {
          window.location.href = "/login";
        }, 6000);
      }
    } catch (err) {
      showNotification(
        "error",
        "Thao tác thất bại",
        err.response?.data?.message || "Vui lòng thử lại"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-brand font-brand">
      {/* BACKGROUND */}
      <AuthBackground />

      {/* CONTENT */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-8">
        <div className="w-full max-w-115 rounded-3xl border border-white/20 bg-white/10 px-10 py-10 shadow-[0_8px_40px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-[18px] animate-slide-up">
          {/* LOGO */}
          <div className="mb-7 text-center">
            <Logo className="justify-center" />

            <p className="mt-2 text-xs font-light tracking-[0.4px] text-white/55">
              Khôi phục tài khoản của bạn
            </p>
          </div>

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
                    <span className="font-medium text-[#80d0ff]">
                      {email}
                    </span>
                  </p>

                  <div className="flex justify-between gap-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`forgot-otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength="1"
                        value={digit}
                        onChange={(e) =>
                          handleOtpChange(index, e.target.value)
                        }
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={handleOtpPaste}
                        className="
                          h-12 w-12 rounded-xl border-2 border-white/25 
                          bg-white/10 text-center text-lg font-semibold text-white 
                          outline-none transition-all duration-300
                          focus:border-[#80d0ff] 
                          focus:shadow-[0_0_18px_rgba(128,208,255,0.35)]
                        "
                      />
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setStep(1);
                        setOtp(["", "", "", "", "", ""]);
                      }}
                      className="text-xs text-[#80d0ff] transition hover:text-white"
                    >
                      Đổi email
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await axios.post(
                            "http://localhost:8080/api/auth/forgot-password",
                            { email }
                          );

                          showNotification(
                            "success",
                            "Đã gửi lại OTP",
                            "Vui lòng kiểm tra email"
                          );

                          setOtp(["", "", "", "", "", ""]);

                          setTimeout(() => {
                            document.getElementById("forgot-otp-0")?.focus();
                          }, 100);
                        } catch (err) {
                          showNotification(
                            "error",
                            "Gửi lại OTP thất bại",
                            err.response?.data?.message || "Vui lòng thử lại"
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
                <div className="mb-5 rounded-2xl border border-[#80d0ff]/30 bg-white/10 p-5 text-center">
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
              className="font-medium text-[#80d0ff] hover:text-white"
            >
              Quay lại đăng nhập
            </Link>
          </p>
        </div>
      </div>

      <BackHomeButton />
    </div>
  );
};

export default ForgotPasswordPage;