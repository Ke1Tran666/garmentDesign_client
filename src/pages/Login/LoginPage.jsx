import { ArrowLeft, ArrowRight, Eye, EyeOff, Mail, Phone, Scissors } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

import '../../index.css'

import { Link } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { useNotification } from "../../components/ui/Notification/NotificationContext";

const LoginPage = () => {

  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState("account");
  const [loginStep, setLoginStep] = useState("input");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

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
          "http://localhost:8080/api/auth/login",
          {
            email,
            password,
          }
        );

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

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

        await axios.post("http://localhost:8080/api/auth/send-otp", {
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
          "http://localhost:8080/api/auth/verify-otp",
          {
            phone,
            otp: otpCode,
          }
        );

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

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
    <div 
      className="
        relative min-h-screen overflow-hidden bg-brand font-brand
        "
    >
      {/* BACKGROUND */}
      <div 
        className="
          fixed inset-0 z-0 
          bg-[radial-gradient(ellipse_at_20%_50%,#1a6fe8_0%,#0a52c4_40%,#0038a0_100%)]
          "
      >
        <div 
          className="
            absolute left-[8%] top-[5%] h-50 w-50 
            rounded-[40%_60%_70%_30%/50%_60%_40%_50%] 
            bg-[#3a9fff] opacity-25 animate-float1
            " 
        />
        <div 
          className="
            absolute right-[10%] top-[15%] h-35 w-35 
            rounded-[60%_40%_30%_70%/60%_30%_70%_40%] 
            bg-[#60baff] opacity-25 animate-float2
            " 
        />
        <div 
          className="
            absolute bottom-[20%] left-[15%] h-25 w-25 
            rounded-[50%_60%_40%_70%/40%_50%_60%_50%] 
            bg-[#2080ff] opacity-25 
            animate-[float1_12s_ease-in-out_infinite_reverse]
            " 
        />
        <div 
          className="
            absolute bottom-[10%] right-[8%] h-20 w-45 
            rounded-[60%_40%_50%_60%/40%_60%_40%_60%] 
            bg-[#80d0ff] opacity-25 
            animate-[float2_9s_ease-in-out_infinite]
            " 
        />
        <div 
          className="
            absolute left-[5%] top-[40%] h-30 w-17.5 
            rounded-[40%_60%_50%_50%/60%_40%_60%_40%] 
            bg-[#50a8ff] opacity-25 
            animate-[float1_11s_ease-in-out_infinite_2s]
            " 
        />
        <div 
          className="
            absolute right-[5%] top-[55%] h-22.5 w-22.5 rounded-full 
            bg-[#90ccff] opacity-25 animate-[float2_7s_ease-in-out_infinite_1s]" 
        />
      </div>
      {/* CONTENT */}
      <div 
        className="
          relative z-10 flex min-h-screen items-center justify-center p-8
          "
      >
        <div 
          className="w-full max-w-105 rounded-3xl border border-white/20 
          bg-white/10 px-10 py-10 shadow-[0_8px_40px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-[18px]
          animate-slide-up
          "
        >
          
          {/* LOGO */}
          <div 
            className="
              mb-7 text-center
              "
          >
            <a 
              href="#" 
              className="
                flex justify-center items-center gap-2.5 font-brand
                "
            >
                <div 
                  className="
                    w-9 h-9 bg-brand rounded-xl flex justify-center 
                    items-center shadow-[0_4px_15px_rgba(1,146,245,0.3)]
                    "
                >
                    <Scissors className="text-white" />
                </div>
                <span 
                  className="
                    text-text-primary font-brand font-semibold text-xl
                    "
                >
                  HoaTran
                  <span className="text-brand"> maymac</span>
                </span>
            </a>

            <p 
              className="
                text-xs font-light tracking-[0.4px] text-white/55 mt-2
                "
            >
              Giải pháp thiết kế may mặc chuyên nghiệp
            </p>
          </div>

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
                  <div className="relative mb-5">
                    <input 
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="
                        peer w-full rounded-xl border-2 border-white/25 
                        bg-transparent px-4 pt-5 pb-2 text-sm text-white outline-none 
                        transition-all duration-300 placeholder:text-transparent 
                        focus:border-[#80d0ff] 
                        focus:shadow-[0_0_18px_rgba(128,208,255,0.35)]
                        "
                      placeholder="Email"
                    />
                    <label
                      className="
                        pointer-events-none absolute left-4 top-1/2 -translate-y-1/2
                        bg-transparent text-sm text-white/55 transition-all duration-300 peer-valid:top-2 peer-valid:translate-y-0 
                        peer-valid:text-xs peer-valid:text-[#80d0ff] peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-[#80d0ff]
                      "
                    >
                      Email
                    </label>
                  </div>

                  {/* Password */}
                  <div className="mb-4">
                    <div className="mb-1.5 flex justify-end">
                      <a
                        href="#"
                        className="
                          text-xs text-[#80d0ff] transition hover:text-white
                          "
                      >
                        Quên mật khẩu?
                      </a>
                    </div>

                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="
                          peer w-full rounded-xl border-2 border-white/25 bg-transparent px-4 pt-5 pb-2 pr-12 text-sm text-white outline-none transition-all duration-300 placeholder:text-transparent focus:border-[#80d0ff]
                          focus:shadow-[0_0_18px_rgba(128,208,255,0.35)]
                          "
                        placeholder="Mật khẩu"
                      />

                      <label
                        className="
                          pointer-events-none absolute left-4 top-1/2 -translate-y-1/2
                          bg-transparent text-sm text-white/55 transition-all duration-300 peer-valid:top-2 peer-valid:translate-y-0 peer-valid:text-xs peer-valid:text-[#80d0ff]
                          peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-[#80d0ff]
                          "
                      >
                        Mật khẩu
                      </label>

                      {/* TOGGLE PASSWORD */}
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="
                          absolute right-4 top-1/2 -translate-y-1/2
                          text-white/45 transition hover:text-white
                          "
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : loginStep === "input" ? (
                <div className="relative mb-5">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="
                      peer w-full rounded-xl border-2 border-white/25 
                      bg-transparent px-4 pt-5 pb-2 text-sm text-white outline-none 
                      transition-all duration-300 placeholder:text-transparent 
                      focus:border-[#80d0ff] 
                      focus:shadow-[0_0_18px_rgba(128,208,255,0.35)]
                    "
                    placeholder="Số điện thoại"
                  />

                  <label
                    className="
                      pointer-events-none absolute left-4 top-1/2 -translate-y-1/2
                      bg-transparent text-sm text-white/55 transition-all duration-300 
                      peer-valid:top-2 peer-valid:translate-y-0 
                      peer-valid:text-xs peer-valid:text-[#80d0ff] 
                      peer-focus:top-2 peer-focus:translate-y-0 
                      peer-focus:text-xs peer-focus:text-[#80d0ff]
                    "
                  >
                    Số điện thoại
                  </label>
                </div>
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
                          await axios.post("http://localhost:8080/api/auth/send-otp", {
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
            <button
              type="submit"
              disabled={loading}
              className="
                mt-2 w-full flex items-center justify-center gap-2
                rounded-xl border border-white/20 bg-brand! px-5 py-3.25
                text-[15px] font-semibold tracking-[0.2px] text-white
                backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-brand-dark
                hover:shadow-[0_8px_25px_rgba(1,146,245,0.35)]
                disabled:cursor-not-allowed disabled:opacity-70
                "
            >
              {loading
                ? "Đang xử lý..."
                : loginType === "account"
                  ? "Đăng nhập"
                  : loginStep === "input"
                    ? "Gửi mã OTP"
                    : "Xác nhận OTP"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* OR */}
          <div className="my-5 flex items-center gap-2.5">
            <div className="h-px flex-1 bg-white/15" />
            <span className="whitespace-nowrap text-xs text-white/40">
              hoặc tiếp tục với
            </span>
            <div className="h-px flex-1 bg-white/15" />
          </div>

          {/* PHONE */}
          <button
            type="button"
            onClick={() => {
              setLoginType(loginType === "account" ? "phone" : "account");
              resetPhoneLogin();
            }}
            className="
              mb-3 flex w-full items-center justify-center gap-2.5 
              rounded-xl border border-white/20 bg-white/10! px-5 py-3 
              text-sm font-medium text-white/85 backdrop-blur-xl 
              transition-all duration-300 hover:-translate-y-1 
              hover:bg-white/20 hover:border-white/30
            "
          >
            {loginType === "account" ? (
              <Phone className="h-5 w-5 shrink-0 text-[#80d0ff]" />
            ) : (
              <Mail className="h-5 w-5 shrink-0 text-[#80d0ff]" />
            )}

            <span
              key={loginType}
              className="animate-fadeText"
            >
              {loginType === "account"
                ? "Đăng nhập với số điện thoại"
                : "Đăng nhập bằng tài khoản đã đăng ký"}
            </span>
          </button>

          {/* GOOGLE */}
          <button 
            type="button"
            className="
              flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/20 bg-white/10! px-5 py-3 text-sm font-medium text-white/85 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/20 hover:border-white/30
              "
          >
            <FcGoogle className="h-5 w-5 shrink-0" />
            Đăng nhập với Google
          </button>

          <p className="mt-5 text-center text-[13px] text-white/45">
            Chưa có tài khoản?{" "}
            <a href="#" className="font-medium text-[#80d0ff] hover:text-white">
              Đăng ký miễn phí
            </a>
          </p>
        </div>
      </div>
      {/* BUTTON TRỞ VỀ */}
      <Link
        to="/"
        className="
          fixed bottom-6 left-6 z-50 flex items-center gap-2
          rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-medium text-white backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/20
          "
      >
        <ArrowLeft className="w-4 h-4" />
        Trở về trang chủ
      </Link>
    </div>
  );
};

export default LoginPage;