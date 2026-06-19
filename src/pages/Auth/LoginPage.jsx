import { ArrowRight, Mail, Phone } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

import '../../index.css'

import { Link } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { useGoogleLogin } from "@react-oauth/google";

import { useNotification } from "../../components/ui/Notification/NotificationContext";

import PrimaryButton from "../../components/ui/Button/PrimaryButton";
import FloatingInput from "../../components/ui/Input/FloatingInput";
import PasswordInput from "../../components/ui/Input/PasswordInput";
import BrandHeader from "@/components/common/Logo/BrandHeader";
import { AUTH_API } from "@/api/config";

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
      <Icon className="h-5 w-5 shrink-0 text-[#80d0ff]" />
      {children}
    </button>
  );
};

const LoginPage = () => {

  const [loginType, setLoginType] = useState("account");
  const [loginStep, setLoginStep] = useState("input");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  const saveAuthData = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("idUser", data.idUser);
  };

  // Xử lý đăng nhập Google
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);

        const response = await axios.post(
          `${AUTH_API}/google-login`,
          {
            accessToken: tokenResponse.access_token,
          }
        );

        saveAuthData(response.data);

        showNotification(
          "success",
          "Đăng nhập thành công",
          "Đăng nhập Google thành công"
        );

        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      } catch (err) {
        showNotification(
          "error",
          "Đăng nhập Google thất bại",
          err.response?.data?.message || "Không thể đăng nhập bằng Google"
        );
      } finally {
        setLoading(false);
      }
    },

    onError: () => {
      showNotification(
        "error",
        "Đăng nhập Google thất bại",
        "Bạn đã hủy hoặc Google không thể xác thực"
      );
    },
  });

  const resetPhoneLogin = () => {
    setLoginStep("input");
    setOtp(["", "", "", "", "", ""]);
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
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
    document.getElementById(`otp-${Math.min(pastedOtp.length, 6) - 1}`)?.focus();
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // 1. Login bằng email + password
      if (loginType === "account") {
        const response = await axios.post(
          `${AUTH_API}/login`,
          {
            email,
            password,
          }
        );

        saveAuthData(response.data);

        showNotification(
          "success",
          "Đăng nhập thành công",
          "Chào mừng bạn quay trở lại"
        );

        setTimeout(() => {
          window.location.href = "/";
        }, 1000);

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

        await axios.post(`${AUTH_API}/send-otp`, {
          phone,
        });

        showNotification(
          "success",
          "Đã gửi mã OTP",
          "Vui lòng xem OTP trong console BE"
        );

        setLoginStep("otp");

        setTimeout(() => {
          document.getElementById("otp-0")?.focus();
        }, 100);

        return;
      }

      // 3. Bước nhập OTP -> xác nhận OTP
      if (loginType === "phone" && loginStep === "otp") {
        const otpCode = otp.join("");

        if (otpCode.length !== 6) {
          showNotification(
            "warning",
            "OTP chưa hợp lệ",
            "Vui lòng nhập đủ 6 số OTP"
          );
          return;
        }

        const response = await axios.post(
          `${AUTH_API}/verify-otp`,
          {
            phone,
            otp: otpCode,
          }
        );

        saveAuthData(response.data);

        showNotification(
          "success",
          "Đăng nhập thành công",
          "Xác thực OTP thành công"
        );

        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      }

    } catch (err) {

      showNotification(
        "error",
        "Đăng nhập thất bại",
        err.response?.data?.message || "Thông tin đăng nhập không đúng"
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
                      className="text-sm text-[#80d0ff] hover:text-white transition"
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
                  <span className="font-medium text-[#80d0ff]">{phone}</span>
                </p>

                <div className="flex justify-between gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={handleOtpPaste}
                      className="
                        h-12 w-12 rounded-xl border-2 border-white/25 
                        bg-white/10 text-center text-lg font-semibold text-white 
                        outline-none transition-all duration-300 placeholder:text-transparent
                        focus:border-[#80d0ff] 
                        focus:shadow-[0_0_18px_rgba(128,208,255,0.35)]
                      "
                    />
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={resetPhoneLogin}
                    className="text-xs text-[#80d0ff] transition hover:text-white"
                  >
                    Đổi số điện thoại
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await axios.post(`${AUTH_API}/send-otp`, {
                          phone,
                        });

                        showNotification(
                          "success",
                          "Đã gửi lại OTP",
                          "Vui lòng xem OTP mới trong console BE"
                        );

                        setOtp(["", "", "", "", "", ""]);

                        setTimeout(() => {
                          document.getElementById("otp-0")?.focus();
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
        <SocialLoginButton icon={FcGoogle} onClick={handleGoogleLogin}>
          Đăng nhập với Google
        </SocialLoginButton>

        <p className="mt-5 text-center text-[13px] text-white/45">
          Chưa có tài khoản?{" "}
          <Link
            to="/register"
            className="font-medium text-[#80d0ff] hover:text-white"
          >
            Đăng ký miễn phí
          </Link>
        </p>
      </div>
    </>
  );
};

export default LoginPage;