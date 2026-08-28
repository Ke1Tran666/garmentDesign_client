import { ArrowRight, Mail, Phone } from "lucide-react";

import "@/shared/styles/index.css";

import { Link, useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";

import { useNotification } from "@/app/providers/NotificationProvider";

import PrimaryButton from "@/shared/ui/button/PrimaryButton";
import FloatingInput from "@/shared/ui/input/FloatingInput";
import PasswordInput from "@/shared/ui/input/PasswordInput";
import BrandHeader from "@/shared/ui/brand/BrandHeader";
import { createEmptyOtp, isOtpComplete, toOtpCode } from "@/features/auth/ui/otp";

import OtpInput from "@/features/auth/ui/OtpInput";
import { authApi } from "@/features/auth/api/authApi";
import { getAccountPathByRole } from "@/features/auth/lib/authRole";
import { useAuth } from "@/features/auth/model/useAuth";

const SocialLoginButton = ({ icon: Icon, children, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        mb-3 flex w-full items-center justify-center gap-2.5
        rounded-xl border border-white/20 bg-white/10! px-5 py-3
        text-sm font-medium text-white/85 backdrop-blur-xl
        transition-all duration-300 hover:-translate-y-1
        hover:bg-white/20 hover:border-white/30
      "
    >
      <Icon className="h-5 w-5 shrink-0 text-auth-accent" />
      {children}
    </button>
  );
};

const LoginPage = () => {

  const [loginType, setLoginType] = useState("account");
  const [loginStep, setLoginStep] = useState("input");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(createEmptyOtp);
  const otpInputRef = useRef(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const { refreshSession } = useAuth();

  // component login
  const completeLogin = async (message) => {
    // Spring có thể đổi CSRF token sau login.
    await authApi.csrf();

    const currentUser = await refreshSession();

    if (!currentUser) {
      throw new Error("Không thể lấy phiên đăng nhập");
    }

    showNotification(
      "success",
      "Đăng nhập thành công",
      message,
    );

    const destination = getAccountPathByRole(currentUser.role);

    setTimeout(() => {
      navigate(destination, {
        replace: true,
      });
    }, 1000);
  };

  // Xử lý đăng nhập Google
  const handleGoogleSuccess = async (
    credentialResponse,
  ) => {
    try {
      setLoading(true);

      const credential =
        credentialResponse?.credential;

      if (!credential) {
        throw new Error(
          "Google không trả về ID token",
        );
      }

      await authApi.googleLogin(
        credential,
      );

      await completeLogin(
        "Đăng nhập Google thành công",
      );
    } catch (err) {
      showNotification(
        "error",
        "Đăng nhập Google thất bại",
        err.response?.data?.message ||
          err.message ||
          "Không thể đăng nhập bằng Google",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    showNotification(
      "error",
      "Đăng nhập Google thất bại",
      "Bạn đã hủy hoặc Google không thể xác thực",
    );
  };

  const resetPhoneLogin = () => {
    setLoginStep("input");
    setOtp(createEmptyOtp());
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading) return;

    try {
      setLoading(true);

      // 1. Login bằng email + password
      if (loginType === "account") {
        const result = await authApi.login({ email, password });

        await completeLogin(result?.message || "Chào mừng bạn quay trở lại");

        return;
      }
      // 2. Bước nhập số điện thoại -> gửi OTP
      if (loginType === "phone" && loginStep === "input") {
        if (!phone.trim()) {
          showNotification(
            "warning",
            "Thiếu số điện thoại",
            "Vui lòng nhập số điện thoại"
          );
          return;
        }

        await authApi.sendPhoneOtp(phone);

        showNotification(
          "success",
          "Đã gửi mã OTP",
          "Vui lòng xem OTP trong console BE"
        );

        setLoginStep("otp");

        return;
      }

      // 3. Bước nhập OTP -> xác nhận OTP
      if (loginType === "phone" && loginStep === "otp") {
        const otpCode = toOtpCode(otp);

        if (!isOtpComplete(otp)) {
          showNotification(
            "warning",
            "OTP chưa hợp lệ",
            "Vui lòng nhập đủ 6 số OTP"
          );
          return;
        }

        await authApi.verifyPhoneOtp({ phone, otp: otpCode });

        await completeLogin("Xác thực OTP thành công");
      }

    } catch (error) {
      let message = "Không thể đăng nhập. Vui lòng thử lại";

      if (error.code === "ECONNABORTED") {
        message =
          "Máy chủ phản hồi quá lâu. Vui lòng thử lại";
      } else if (!error.response) {
        message =
          error.message === "Không thể lấy phiên đăng nhập"
            ? "Đăng nhập thành công nhưng không thể tải thông tin người dùng"
            : "Không thể kết nối đến máy chủ";
      } else if (error.response.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }

      showNotification(
        "error",
        "Đăng nhập thất bại",
        message,
      );
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      {/* CONTENT */}
      <div 
        className="w-full max-w-105 rounded-3xl border border-white/20 
        bg-white/10 px-10 py-10 shadow-[0_8px_40px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-[18px]
        animate-slide-up
        "
      >
        
        {/* LOGO */}
        <BrandHeader subtitle="Giải pháp thiết kế may mặc chuyên nghiệp"/>

        <hr className="mb-6 border-white/10" />

        <h1 className="mb-2 text-[22px] font-semibold text-white">
          {loginType === "phone" && loginStep === "otp" ? "Xác thực OTP" : "Đăng nhập"}
        </h1>

        <p className="mb-6 text-[13px] font-light text-white/55">
          {loginType === "phone" && loginStep === "otp"
            ? "Nhập mã OTP 6 số được gửi đến điện thoại của bạn."
            : "Chào mừng trở lại! Vui lòng nhập thông tin của bạn."}
        </p>

        {/* FORM */}
        <form onSubmit={handleLogin}>
          <div
            key={`${loginType}-${loginStep}`}
            className="animate-formSwitch"
          >
            {loginType === "account" ? (
              <>
                {/* Email */}
                <FloatingInput
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  label="Email đăng nhập"
                  required
                  containerClassName="mb-5"
                />

                {/* Password */}
                <div className="mb-4">
                  <PasswordInput
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    label="Mật Khẩu"
                    required
                    containerClassName="mb-5"
                  />

                  {/* Forgot password */}
                  <div className="flex justify-end mb-2">
                    <Link
                      to="/forgot-password"
                      className="text-sm text-auth-accent hover:text-white transition"
                    >
                      Quên mật khẩu?
                    </Link>
                  </div>
                </div>
              </>
            ) : loginStep === "input" ? (
              <FloatingInput
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                label="Số điện thoại"
                required
                containerClassName="mb-5"
              />
            ) : (
              <div className="mb-5">
                <p className="mb-4 text-center text-sm text-white/60">
                  Mã OTP đã gửi đến{" "}
                  <span className="font-medium text-auth-accent">{phone}</span>
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
                    onClick={resetPhoneLogin}
                    className="text-xs text-auth-accent transition hover:text-white"
                  >
                    Đổi số điện thoại
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await authApi.sendPhoneOtp(phone);

                        showNotification(
                          "success",
                          "Đã gửi lại OTP",
                          "Vui lòng xem OTP mới trong console BE"
                        );

                        setOtp(createEmptyOtp());

                        requestAnimationFrame(() => {
                          otpInputRef.current?.focus();
                        });
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
          </div>
          
          {/* button submit */}
          <PrimaryButton
            type="submit"
            disabled={loading}
            className="mt-2"
            icon={ArrowRight}
          >
            {loading
              ? "Đang xử lý..."
              : loginType === "account"
                ? "Đăng nhập"
                : loginStep === "input"
                  ? "Gửi mã OTP"
                  : "Xác nhận OTP"}
          </PrimaryButton>
        </form>

        {/* OR */}
        <div className="my-5 flex items-center gap-2.5">
          <div className="h-px flex-1 bg-white/15" />
          <span className="whitespace-nowrap text-xs text-white/40">
            hoặc tiếp tục với
          </span>
          <div className="h-px flex-1 bg-white/15" />
        </div>

        {/* BUTTON PHONE */}
        <SocialLoginButton
          icon={loginType === "account" ? Phone : Mail}
          onClick={() => {
            setLoginType(loginType === "account" ? "phone" : "account");
            resetPhoneLogin();
          }}
        >
          <span key={loginType} className="animate-fadeText">
            {loginType === "account"
              ? "Đăng nhập với số điện thoại"
              : "Đăng nhập bằng tài khoản đã đăng ký"}
          </span>
        </SocialLoginButton>
        
        {/* BUTTON GOOGLE */}
        <div className="mb-3 flex w-full justify-center">
          <div className="w-85 overflow-hidden rounded-xl">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              type="standard"
              theme="outline"
              size="large"
              text="continue_with"
              shape="rectangular"
              logo_alignment="left"
              width="340"
              useOneTap={false}

              use_fedcm_for_prompt={true}
              use_fedcm_for_button={true}
            />
          </div>
        </div>

        <p className="mt-5 text-center text-[13px] text-white/45">
          Chưa có tài khoản?{" "}
          <Link
            to="/register"
            className="font-medium text-auth-accent hover:text-white"
          >
            Đăng ký miễn phí
          </Link>
        </p>
      </div>
    </>
  );
};

export default LoginPage;
