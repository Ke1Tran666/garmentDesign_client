import { ArrowRight, ChevronDown } from "lucide-react";

import "../../index.css";

import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useNotification } from "../../components/ui/Notification/NotificationContext";
import PrimaryButton from "../../components/ui/Button/PrimaryButton";
import BirthdayInput from "../../components/ui/Input/BirthdayInput";
import FloatingInput from "../../components/ui/Input/FloatingInput";
import PasswordInput from "../../components/ui/Input/PasswordInput";
import BrandHeader from "@/components/common/Logo/BrandHeader";
import { authApi } from "@/api/authApi";

const RegisterPage = () => {

  const [openGender, setOpenGender] = useState(false);

  const genderRef = useRef(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("");
  const [birthday, setBirthday] = useState("");

  const [loading, setLoading] = useState(false);

  const { showNotification } = useNotification();

  useEffect(() => {
    const handleClickOutside = (e) => {
        if (genderRef.current && !genderRef.current.contains(e.target)) {
        setOpenGender(false);
      } 
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await authApi.register({
        email,
        password,
        fullName,
        gender,
        birthday,
      });

      showNotification(
        "success",
        "Đăng ký thành công",
        "Tài khoản của bạn đã được tạo"
      );

      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
    } catch (err) {
      showNotification(
        "error",
        "Đăng ký thất bại",
        err.response?.data?.message || "Vui lòng thử lại"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="w-full max-w-140 rounded-3xl border border-white/20 bg-white/10 px-10 py-10 shadow-[0_8px_40px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-[18px] animate-slide-up">
        {/* LOGO */}
        <BrandHeader subtitle="Tạo tài khoản để bắt đầu sử dụng hệ thống"/>

        <hr className="mb-6 border-white/10" />

        <h1 className="mb-2 text-[22px] font-semibold text-white">
          Đăng ký
        </h1>

        <p className="mb-6 text-[13px] font-light text-white/55">
          Điền đầy đủ thông tin để tạo tài khoản mới.
        </p>

        <form onSubmit={handleRegister}>
          {/* EMAIL */}
          <FloatingInput
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            label="Email đăng nhập"
            required
            containerClassName="mb-5"
          />

          {/* PASSWORD */}
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            label="Mật Khẩu"
            required
            containerClassName="mb-5"
          />

          <div className="mb-5 flex gap-3">
              {/* FULL NAME */}
              <FloatingInput
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                label="Họ và Tên"
                required
                className="min-h-13"
                containerClassName="flex-1"
              />

              {/* GENDER */}
              <div ref={genderRef} className="relative w-45">
                  <button
                      type="button"
                      onClick={() => setOpenGender(!openGender)}
                      className="
                          flex w-full min-h-13 items-center justify-between
                          rounded-xl border-2! border-white/25!
                          bg-transparent px-4
                          text-left text-sm text-white
                          outline-none transition-all duration-300
                          hover:border-white/40!
                          focus:border-[#80d0ff]!
                          focus:shadow-[0_0_18px_rgba(128,208,255,0.35)]
                      "
                  >
                      <span className={gender ? "text-white" : "text-white/55"}>
                          {gender === "Male"
                              ? "Nam"
                              : gender === "Female"
                              ? "Nữ"
                              : gender === "Unknown"
                              ? "Không muốn chọn"
                              : "Chọn giới tính"}
                      </span>

                      <ChevronDown
                          className={`
                              h-5 w-5 text-white/70 transition duration-300
                              ${openGender ? "rotate-180" : ""}
                          `}
                      />
                  </button>

                  {openGender && (
                      <div
                          className="
                              absolute left-0 top-[calc(100%+10px)] z-50
                              w-full overflow-hidden rounded-2xl
                              border border-white/15
                              bg-surface backdrop-blur-xl
                              shadow-[0_10px_40px_rgba(0,0,0,0.25)]
                          "
                      >
                          {[
                              { value: "Male", label: "Nam" },
                              { value: "Female", label: "Nữ" },
                              { value: "Unknown", label: "Không muốn chọn" },
                          ].map((item) => (
                              <button
                                  key={item.value}
                                  type="button"
                                  onClick={() => {
                                      setGender(item.value);
                                      setOpenGender(false);
                                  }}
                                  className={`
                                      flex w-full items-center px-4 py-3
                                      text-left text-sm text-text-default
                                      transition-all duration-200
                                      hover:bg-surface-muted
                                      ${gender === item.value ? "bg-surface-muted" : ""}
                                  `}
                              >
                                  {item.label}
                              </button>
                          ))}
                      </div>
                  )}
              </div>
              
          </div>

          {/* BIRTHDAY */}
          <BirthdayInput 
            onChange={setBirthday} 
            containerClassName="mb-6"
          />
          
          {/* button submit */}
          <PrimaryButton
            type="submit"
            disabled={loading}
            icon={ArrowRight}
          >
            {loading ? "Đang xử lý..." : "Đăng ký"}
          </PrimaryButton>
        </form>

        <p className="mt-5 text-center text-[13px] text-white/45">
          Đã có tài khoản?{" "}
          <Link
            to="/login"
            className="font-medium text-[#80d0ff] hover:text-white"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </>
  );
};

export default RegisterPage;