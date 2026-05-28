import {
  ArrowRight,
  Eye,
  EyeOff,
  CalendarDays,
  ChevronDown,
} from "lucide-react";

import "../../index.css";

import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useNotification } from "../../components/ui/Notification/NotificationContext";
import Logo from "../../components/ui/Logo/Logo";
import PrimaryButton from "../../components/ui/Button/PrimaryButton";
import BackHomeButton from "../../components/ui/Button/BackHomeButton";

const RegisterPage = () => {
  const today = new Date();

  const [showPassword, setShowPassword] = useState(false);
  const [openBirthday, setOpenBirthday] = useState(false);
  const [openGender, setOpenGender] = useState(false);
  const birthdayPickerRef = useRef(null);
  const genderRef = useRef(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("");
  const [birthday, setBirthday] = useState("");

  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const [loading, setLoading] = useState(false);

  const { showNotification } = useNotification();

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  // Dùng ref để đọc birthDay mới nhất mà không cần đưa vào dependency array
  const birthDayRef = useRef(birthDay);
  useEffect(() => {
    birthDayRef.current = birthDay;
  }, [birthDay]);

  // Chỉ trigger khi tháng/năm thay đổi — tránh setState loop với birthDay
  useEffect(() => {
    if (!birthMonth || !birthYear || !birthDayRef.current) return;

    const month = Number(birthMonth);
    const year = Number(birthYear);
    const day = Number(birthDayRef.current);
    const maxDays = new Date(year, month, 0).getDate();

    if (day > maxDays) {
      setBirthDay(String(maxDays));
    }

  }, [birthMonth, birthYear]);

  useEffect(() => {
    const handleClickOutside = (e) => {
        if (
        birthdayPickerRef.current &&
        !birthdayPickerRef.current.contains(e.target)
        ) {
        setOpenBirthday(false);
        }

        if (genderRef.current && !genderRef.current.contains(e.target)) {
        setOpenGender(false);
      } 
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const years = Array.from(
    { length: 101 },
    (_, index) => today.getFullYear() - index
  );

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const startDate = new Date(firstDay);

    const offset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    startDate.setDate(firstDay.getDate() - offset);

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + index);
      return date;
    });
  }, [currentYear, currentMonth]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleSelectDate = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    setBirthDay(String(day));
    setBirthMonth(String(month));
    setBirthYear(String(year));
    setBirthday(
      `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    );
    setOpenBirthday(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await axios.post("http://localhost:8080/api/auth/register", {
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
    <div className="relative min-h-screen overflow-hidden bg-brand font-brand">
      {/* BACKGROUND */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_20%_50%,#1a6fe8_0%,#0a52c4_40%,#0038a0_100%)]">
        <div className="absolute left-[8%] top-[5%] h-50 w-50 rounded-[40%_60%_70%_30%/50%_60%_40%_50%] bg-[#3a9fff] opacity-25 animate-float1" />
        <div className="absolute right-[10%] top-[15%] h-35 w-35 rounded-[60%_40%_30%_70%/60%_30%_70%_40%] bg-[#60baff] opacity-25 animate-float2" />
        <div className="absolute bottom-[20%] left-[15%] h-25 w-25 rounded-[50%_60%_40%_70%/40%_50%_60%_50%] bg-[#2080ff] opacity-25 animate-[float1_12s_ease-in-out_infinite_reverse]" />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-8">
        <div className="w-full max-w-140 rounded-3xl border border-white/20 bg-white/10 px-10 py-10 shadow-[0_8px_40px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-[18px] animate-slide-up">
          {/* LOGO */}
          <div className="mb-7 text-center">
            <Logo className="justify-center" />

            <p className="mt-2 text-xs font-light tracking-[0.4px] text-white/55">
              Tạo tài khoản để bắt đầu sử dụng hệ thống
            </p>
          </div>

          <hr className="mb-6 border-white/10" />

          <h1 className="mb-2 text-[22px] font-semibold text-white">
            Đăng ký
          </h1>

          <p className="mb-6 text-[13px] font-light text-white/55">
            Điền đầy đủ thông tin để tạo tài khoản mới.
          </p>

          <form onSubmit={handleRegister}>
            {/* EMAIL */}
            <div className="relative mb-5">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="peer w-full rounded-xl border-2 border-white/25 bg-transparent px-4 pt-5 pb-2 text-sm text-white outline-none transition-all duration-300 placeholder:text-transparent focus:border-[#80d0ff] focus:shadow-[0_0_18px_rgba(128,208,255,0.35)]"
              />

              <label className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white/55 transition-all duration-300 peer-valid:top-2 peer-valid:translate-y-0 peer-valid:text-xs peer-valid:text-[#80d0ff] peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-[#80d0ff]">
                Email đăng nhập
              </label>
            </div>

            {/* PASSWORD */}
            <div className="relative mb-5">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mật khẩu"
                className="peer w-full rounded-xl border-2 border-white/25 bg-transparent px-4 pt-5 pb-2 pr-12 text-sm text-white outline-none transition-all duration-300 placeholder:text-transparent focus:border-[#80d0ff] focus:shadow-[0_0_18px_rgba(128,208,255,0.35)]"
              />

              <label className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white/55 transition-all duration-300 peer-valid:top-2 peer-valid:translate-y-0 peer-valid:text-xs peer-valid:text-[#80d0ff] peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-[#80d0ff]">
                Password
              </label>

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/45 transition hover:text-white"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            <div className="mb-5 flex gap-3">
                {/* FULL NAME */}
                <div className="relative flex-1">
                <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full name"
                    className="peer min-h-13 w-full rounded-xl border-2 border-white/25 bg-transparent px-4 pt-5 pb-2 text-sm text-white outline-none transition-all duration-300 placeholder:text-transparent focus:border-[#80d0ff] focus:shadow-[0_0_18px_rgba(128,208,255,0.35)]"
                />

                <label className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white/55 transition-all duration-300 peer-valid:top-2 peer-valid:translate-y-0 peer-valid:text-xs peer-valid:text-[#80d0ff] peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-[#80d0ff]">
                    Full name
                </label>
                </div>

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
                                bg-white backdrop-blur-xl
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
                                        text-left text-sm text-gray-800
                                        transition-all duration-200
                                        hover:bg-gray-100
                                        ${gender === item.value ? "bg-gray-100" : ""}
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
            <div ref={birthdayPickerRef} className="relative mb-6">
              <div className="flex items-end gap-3">
                {/* DAY */}
                <input
                    type="text"
                    inputMode="numeric"
                    maxLength={2}
                    value={birthDay}
                    onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, "");

                        if (value === "") {
                        setBirthDay("");
                        return;
                        }

                        let number = Number(value);

                        if (number > 31) {
                        number = 31;
                        }

                        setBirthDay(String(number));
                    }}
                    placeholder="Day"
                    className="
                        h-13 w-full rounded-xl border-2 border-white/25
                        bg-transparent px-4
                        text-center text-sm text-white
                        outline-none transition-all duration-300
                        placeholder:text-white/45
                        focus:border-[#80d0ff]
                        focus:shadow-[0_0_18px_rgba(128,208,255,0.35)]
                        flex-1
                    "
                />

                {/* MONTH */}
                <input
                    type="text"
                    inputMode="numeric"
                    maxLength={2}
                    value={birthMonth}
                    onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, "");

                        if (value === "") {
                        setBirthMonth("");
                        return;
                        }

                        let number = Number(value);

                        if (number > 12) {
                        number = 12;
                        }

                        setBirthMonth(String(number));
                    }}
                    placeholder="Month"
                    className="
                        h-13 w-full rounded-xl border-2 border-white/25
                        bg-transparent px-4
                        text-center text-sm text-white
                        outline-none transition-all duration-300
                        placeholder:text-white/45
                        focus:border-[#80d0ff]
                        focus:shadow-[0_0_18px_rgba(128,208,255,0.35)]
                        flex-1
                    "   
                />

                {/* YEAR */}
                <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={birthYear}
                    onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        setBirthYear(value);
                    }}
                    placeholder="Year"
                    className="
                        h-13 w-full rounded-xl border-2 border-white/25
                        bg-transparent px-4
                        text-center text-sm text-white
                        outline-none transition-all duration-300
                        placeholder:text-white/45
                        focus:border-[#80d0ff]
                        focus:shadow-[0_0_18px_rgba(128,208,255,0.35)]
                        flex-2
                    "
                />

                {/* BUTTON */}
                <button
                    type="button"
                    onClick={() => {
                        if (!openBirthday) {
                        if (birthMonth) setCurrentMonth(Number(birthMonth) - 1);
                        if (birthYear) setCurrentYear(Number(birthYear));
                        }

                        setOpenBirthday(!openBirthday);
                    }}
                    className="
                        flex h-14.5 min-w-14.5 items-center justify-center
                        rounded-xl border-2 border-white/25
                        bg-white/10 text-white
                        transition-all duration-300
                        hover:bg-white/20
                        hover:border-white/35
                        px-4
                    "
                    >
                    <CalendarDays className="h-5 w-5" />
                </button>

                </div>

              {openBirthday && (
                <div className="absolute right-0 bottom-[calc(100%+12px)] z-50 w-full overflow-hidden rounded-2xl border-2 border-[#e5d84c] bg-white text-black shadow-2xl">
                    <div className="flex items-center justify-between gap-3 bg-gray-100 px-4 py-4">
                    <button
                        type="button"
                        onClick={handlePrevMonth}
                        className="text-3xl text-gray-700"
                    >
                        ‹
                    </button>

                    <div className="flex flex-1 gap-2">
                        <div className="relative w-full">
                            <select
                                value={currentMonth}
                                onChange={(e) => setCurrentMonth(Number(e.target.value))}
                                className="
                                h-11 w-full appearance-none rounded-lg
                                border border-gray-300 bg-white
                                px-3 pr-10
                                text-sm font-semibold leading-none
                                outline-none
                                "
                            >
                                {months.map((month, index) => (
                                <option key={month} value={index}>
                                    {month}
                                </option>
                                ))}
                            </select>

                            <ChevronDown
                                className="
                                pointer-events-none absolute right-3 top-1/2
                                h-4 w-4 -translate-y-1/2 text-gray-500
                                "
                            />
                        </div>

                        <div className="relative w-full">
                            <select
                                value={currentYear}
                                onChange={(e) => setCurrentYear(Number(e.target.value))}
                                className="
                                h-11 w-full appearance-none rounded-lg
                                border border-gray-300 bg-white
                                px-3 pr-10
                                text-sm font-semibold leading-none
                                outline-none
                                "
                            >
                                {years.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                                ))}
                            </select>

                            <ChevronDown
                                className="
                                pointer-events-none absolute right-3 top-1/2
                                h-4 w-4 -translate-y-1/2 text-gray-500
                                "
                            />
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleNextMonth}
                        className="text-3xl text-gray-700"
                    >
                        ›
                    </button>
                    </div>

                    <div className="grid grid-cols-7 px-4 pt-4 text-center text-sm font-bold text-gray-700">
                    {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
                        <div key={day}>{day}</div>
                    ))}
                    </div>

                    <div className="grid grid-cols-7 gap-y-2 px-4 py-4 text-center">
                    {calendarDays.map((date, index) => {
                        const isCurrentMonth = date.getMonth() === currentMonth;

                        const isSelected =
                        date.getDate() === Number(birthDay) &&
                        date.getMonth() + 1 === Number(birthMonth) &&
                        date.getFullYear() === Number(birthYear);

                        return (
                        <button
                            type="button"
                            key={index}
                            onClick={() => handleSelectDate(date)}
                            className={`
                            mx-auto flex h-9 w-9 items-center justify-center rounded-lg
                            text-sm transition
                            ${
                                isSelected
                                ? "bg-brand text-white"
                                : isCurrentMonth
                                ? "text-gray-800 hover:bg-gray-100"
                                : "text-gray-300"
                            }
                            `}
                        >
                            {date.getDate()}
                        </button>
                        );
                    })}
                    </div>
                </div>
                )}
            </div>
            
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
      </div>
      
      {/* BUTTON TRỞ VỀ HOME */}
      <BackHomeButton />
    </div>
  );
};

export default RegisterPage;