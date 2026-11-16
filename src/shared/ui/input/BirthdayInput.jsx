import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import Select from "../select/Select";
import { cn } from "@/shared/lib/utils";

const VIETNAMESE_MONTHS = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

/**
 * Chuyển YYYY-MM-DD -> DD/MM/YYYY
 */
const isoToDisplay = (isoStr) => {
  if (!isoStr || typeof isoStr !== "string") return "";
  const parts = isoStr.trim().split("-");
  if (parts.length !== 3) return "";
  const [y, m, d] = parts;
  if (!y || !m || !d) return "";
  const cleanD = String(Number(d)).padStart(2, "0");
  const cleanM = String(Number(m)).padStart(2, "0");
  const cleanY = String(y).padStart(4, "0");
  return `${cleanD}/${cleanM}/${cleanY}`;
};

/**
 * Kiểm tra và chuyển DD/MM/YYYY -> YYYY-MM-DD (ISO)
 */
const displayToIso = (displayStr) => {
  if (!displayStr || typeof displayStr !== "string") return "";
  const parts = displayStr.trim().split("/");
  if (parts.length !== 3) return "";
  const [dStr, mStr, yStr] = parts;
  if (dStr.length !== 2 || mStr.length !== 2 || yStr.length !== 4) return "";

  const d = Number(dStr);
  const m = Number(mStr);
  const y = Number(yStr);

  if (isNaN(d) || isNaN(m) || isNaN(y)) return "";
  if (m < 1 || m > 12) return "";
  if (y < 1900) return "";

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (y > today.getFullYear()) return "";

  const maxDays = new Date(y, m, 0).getDate();
  if (d < 1 || d > maxDays) return "";

  const dateObj = new Date(y, m - 1, d);
  if (
    dateObj.getFullYear() !== y ||
    dateObj.getMonth() !== m - 1 ||
    dateObj.getDate() !== d
  ) {
    return "";
  }

  if (dateObj > today) return ""; // Ngày sinh không được ở tương lai

  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
};

/**
 * Định dạng mask cho ngày tháng: DD/MM/YYYY
 */
const formatMask = (value) => {
  if (!value) return "";
  const endsWithSlash = value.endsWith("/") || value.endsWith(".");
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (!digits) return "";

  if (digits.length === 1) {
    return endsWithSlash ? `0${digits}/` : digits;
  }
  if (digits.length === 2) {
    return endsWithSlash ? `${digits}/` : digits;
  }
  if (digits.length === 3) {
    const d = digits.slice(0, 2);
    const m = digits.slice(2);
    return endsWithSlash ? `${d}/0${m}/` : `${d}/${m}`;
  }
  if (digits.length === 4) {
    const d = digits.slice(0, 2);
    const m = digits.slice(2);
    return endsWithSlash ? `${d}/${m}/` : `${d}/${m}`;
  }

  const d = digits.slice(0, 2);
  const m = digits.slice(2, 4);
  const y = digits.slice(4);
  return `${d}/${m}/${y}`;
};

const BirthdayInput = ({
  value = "",
  onChange = () => {},

  label = "",
  placeholder = "DD/MM/YYYY",
  variant = "default", // "default" | "auth"
  disabled = false,
  readOnly = false,
  error = "",
  name = "birthday",
  id,
  ariaLabel,

  containerClassName = "",
  inputClassName = "",
  calendarButtonClassName = "",
  popupClassName = "",
  popupHeaderClassName = "",
  selectedDateClassName = "",
  ...restProps
}) => {
  const today = useMemo(() => new Date(), []);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const inputId = id || name;

  const [openCalendar, setOpenCalendar] = useState(false);
  const [displayValue, setDisplayValue] = useState(() => isoToDisplay(value));

  const [currentMonth, setCurrentMonth] = useState(() => {
    if (value && typeof value === "string") {
      const parts = value.split("-");
      if (parts.length === 3) {
        const m = Number(parts[1]) - 1;
        if (!isNaN(m) && m >= 0 && m <= 11) return m;
      }
    }
    return today.getMonth();
  });

  const [currentYear, setCurrentYear] = useState(() => {
    if (value && typeof value === "string") {
      const parts = value.split("-");
      if (parts.length === 3) {
        const y = Number(parts[0]);
        if (!isNaN(y)) return y;
      }
    }
    return today.getFullYear();
  });

  const [prevValue, setPrevValue] = useState(value);

  // Điều chỉnh displayValue khi prop `value` thay đổi từ bên ngoài (tránh cascading render trong useEffect)
  if (value !== prevValue) {
    setPrevValue(value);
    const formatted = isoToDisplay(value);
    setDisplayValue(formatted);

    if (value && typeof value === "string" && value.includes("-")) {
      const parts = value.split("-");
      if (parts.length === 3) {
        const y = Number(parts[0]);
        const m = Number(parts[1]) - 1;
        if (!isNaN(y)) setCurrentYear(y);
        if (!isNaN(m) && m >= 0 && m <= 11) setCurrentMonth(m);
      }
    }
  }

  // Đóng calendar khi click ra ngoài hoặc nhấn phím Escape
  useEffect(() => {
    if (!openCalendar) return;

    const handleClickOutside = (e) => {
      const target = e.target;
      if (!target) return;

      // 1. Nếu click vào bên trong container của BirthdayInput (input, nút mở lịch, popup lịch)
      if (containerRef.current && containerRef.current.contains(target)) {
        return;
      }

      // 2. Nếu click vào dropdown menu portal của Radix Select (chọn tháng hoặc chọn năm)
      if (
        target.closest?.("[data-radix-popper-content-wrapper]") ||
        target.closest?.("[data-radix-select-viewport]") ||
        target.closest?.('[role="listbox"]') ||
        target.closest?.('[role="option"]') ||
        target.closest?.("[data-radix-focus-guard]")
      ) {
        return;
      }

      setOpenCalendar(false);
    };

    const handleEscKey = (e) => {
      if (e.key === "Escape") {
        // Nếu có dropdown Select đang mở, để Radix tự đóng dropdown trước
        const isSelectOpen = Boolean(
          document.querySelector(
            "[data-radix-popper-content-wrapper], [data-radix-select-viewport]",
          ),
        );
        if (isSelectOpen) {
          return;
        }
        setOpenCalendar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleEscKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [openCalendar]);

  const years = useMemo(() => {
    return Array.from(
      { length: 101 },
      (_, index) => today.getFullYear() - index,
    );
  }, [today]);

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

  const selectedDate = useMemo(() => {
    const iso = displayToIso(displayValue);
    if (!iso) return null;
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d);
  }, [displayValue]);

  const isNextMonthDisabled = useMemo(() => {
    return (
      currentYear > today.getFullYear() ||
      (currentYear === today.getFullYear() && currentMonth >= today.getMonth())
    );
  }, [currentYear, currentMonth, today]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (isNextMonthDisabled) return;
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const handleInputChange = (e) => {
    const inputVal = e.target.value;
    const masked = formatMask(inputVal);
    setDisplayValue(masked);

    if (!masked) {
      onChange("");
      return;
    }

    const iso = displayToIso(masked);
    if (iso) {
      onChange(iso);
      const [y, m] = iso.split("-");
      setCurrentYear(Number(y));
      setCurrentMonth(Number(m) - 1);
    } else {
      onChange("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Backspace") {
      const input = e.target;
      const { selectionStart, selectionEnd, value: currentVal } = input;
      // Nếu con trỏ đứng ngay sau dấu "/" (vị trí 3 hoặc 6), xóa cả dấu "/" và ký tự số trước đó
      if (
        selectionStart === selectionEnd &&
        (selectionStart === 3 || selectionStart === 6)
      ) {
        e.preventDefault();
        const nextVal =
          currentVal.slice(0, selectionStart - 2) +
          currentVal.slice(selectionStart);
        const masked = formatMask(nextVal);
        setDisplayValue(masked);
        const iso = displayToIso(masked);
        onChange(iso);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    if (!pasted) return;

    if (/^\d{4}-\d{2}-\d{2}$/.test(pasted.trim())) {
      const formatted = isoToDisplay(pasted.trim());
      setDisplayValue(formatted);
      const iso = displayToIso(formatted);
      onChange(iso);
      return;
    }

    const masked = formatMask(pasted);
    setDisplayValue(masked);
    const iso = displayToIso(masked);
    onChange(iso);
  };

  const handleSelectDate = (date) => {
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const y = String(date.getFullYear());

    const formatted = `${d}/${m}/${y}`;
    setDisplayValue(formatted);

    const iso = `${y}-${m}-${d}`;
    onChange(iso);
    setOpenCalendar(false);
  };

  const handleToggleCalendar = () => {
    if (disabled || readOnly) return;

    if (!openCalendar) {
      if (selectedDate) {
        setCurrentMonth(selectedDate.getMonth());
        setCurrentYear(selectedDate.getFullYear());
      } else if (value && value.includes("-")) {
        const [y, m] = value.split("-").map(Number);
        if (!isNaN(y)) setCurrentYear(y);
        if (!isNaN(m) && m >= 1 && m <= 12) setCurrentMonth(m - 1);
      }
    }
    setOpenCalendar((prev) => !prev);
  };

  const isAuth = variant === "auth";
  const hasValue = Boolean(displayValue && displayValue.trim() !== "");

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full", containerClassName)}
    >
      {/* Label cho variant mặc định (non-auth) */}
      {label && !isAuth && (
        <label
          htmlFor={inputId}
          className="mb-2 block text-sm font-semibold text-text-default"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        <input
          {...restProps}
          ref={inputRef}
          id={inputId}
          name={name}
          type="text"
          inputMode="numeric"
          maxLength={10}
          value={displayValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          disabled={disabled}
          readOnly={readOnly}
          placeholder={isAuth && label ? " " : placeholder}
          aria-label={ariaLabel || label || "Ngày sinh (DD/MM/YYYY)"}
          aria-invalid={Boolean(error)}
          className={cn(
            isAuth
              ? "peer min-h-13 w-full rounded-xl border-2 border-white/25 bg-transparent px-4 pr-12 text-sm text-white transition-all duration-300 outline-none placeholder:text-white/45 focus:border-auth-accent focus:shadow-[0_0_18px_rgba(128,208,255,0.35)]"
              : "h-11 w-full rounded-xl border border-input bg-surface px-4 pr-11 text-sm text-text-default transition outline-none placeholder:text-text-subtle focus:border-brand focus:ring-4 focus:ring-brand/10 disabled:cursor-not-allowed disabled:bg-surface-muted",
            isAuth && label && "pt-5 pb-2 placeholder:text-transparent",
            Boolean(error) &&
              (isAuth
                ? "border-red-400 focus:border-red-400"
                : "border-danger focus:border-danger focus:ring-danger/10"),
            inputClassName,
          )}
        />

        {/* Floating Label cho variant auth */}
        {isAuth && label && (
          <label
            htmlFor={inputId}
            className={cn(
              "pointer-events-none absolute left-4 -translate-y-1/2 text-sm text-white/55 transition-all duration-300 peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-auth-accent",
              hasValue
                ? "top-2 translate-y-0 text-xs text-auth-accent"
                : "top-1/2",
            )}
          >
            {label}
          </label>
        )}

        {/* Nút bấm mở popup lịch */}
        <button
          type="button"
          disabled={disabled || readOnly}
          onClick={handleToggleCalendar}
          aria-label="Mở lịch chọn ngày sinh"
          className={cn(
            "absolute flex items-center justify-center rounded-lg transition disabled:cursor-not-allowed disabled:opacity-50",
            isAuth
              ? "top-1/2 right-3 h-8 w-8 -translate-y-1/2 text-white/50 hover:bg-white/10 hover:text-white"
              : "top-1/2 right-2.5 h-7 w-7 -translate-y-1/2 text-text-muted hover:bg-surface-muted hover:text-text-default",
            calendarButtonClassName,
          )}
        >
          <CalendarDays className={isAuth ? "h-5 w-5" : "h-4.5 w-4.5"} />
        </button>
      </div>

      {/* Thông báo lỗi nếu có */}
      {typeof error === "string" && error && (
        <p className="mt-1.5 text-xs text-danger">{error}</p>
      )}

      {/* Popup chọn ngày */}
      {openCalendar && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label="Chọn ngày sinh"
          className={cn(
            "absolute top-[calc(100%+8px)] left-0 z-50 w-82.5 max-w-[calc(100vw-32px)] rounded-2xl border p-3.5 shadow-xl",
            isAuth
              ? "border-white/20 bg-slate-900/95 text-white shadow-2xl backdrop-blur-xl"
              : "border-border bg-surface text-text-default shadow-xl",
            popupClassName,
          )}
        >
          {/* Header tháng / năm */}
          <div
            className={cn(
              "flex w-full items-center justify-between gap-1.5 pb-3",
              popupHeaderClassName,
            )}
          >
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Tháng trước"
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition",
                isAuth
                  ? "text-white/70 hover:bg-white/10 hover:text-white"
                  : "text-text-muted hover:bg-surface-muted hover:text-text-default",
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex min-w-0 flex-1 items-center gap-1.5">
              <div className="min-w-0 flex-1">
                <Select
                  size="xs"
                  modal={false}
                  value={String(currentMonth)}
                  onValueChange={(val) => setCurrentMonth(Number(val))}
                  ariaLabel="Chọn tháng"
                  options={VIETNAMESE_MONTHS.map((m, idx) => ({
                    value: String(idx),
                    label: m,
                  }))}
                />
              </div>

              <div className="w-20.5 shrink-0">
                <Select
                  size="xs"
                  modal={false}
                  value={String(currentYear)}
                  onValueChange={(val) => setCurrentYear(Number(val))}
                  ariaLabel="Chọn năm"
                  options={years.map((y) => ({
                    value: String(y),
                    label: String(y),
                  }))}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              disabled={isNextMonthDisabled}
              aria-label="Tháng sau"
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition",
                isAuth
                  ? "text-white/70 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                  : "text-text-muted hover:bg-surface-muted hover:text-text-default disabled:cursor-not-allowed disabled:opacity-30",
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Thứ trong tuần */}
          <div
            className={cn(
              "grid grid-cols-7 py-1 text-center text-xs font-semibold",
              isAuth ? "text-white/60" : "text-text-muted",
            )}
          >
            {WEEKDAYS.map((day) => (
              <div key={day} className="py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Lưới các ngày trong tháng */}
          <div className="grid grid-cols-7 gap-1 pt-1 text-center">
            {calendarDays.map((date, idx) => {
              const isCurrentMonth = date.getMonth() === currentMonth;
              const isFuture = date > today;
              const isSelected =
                selectedDate &&
                date.getDate() === selectedDate.getDate() &&
                date.getMonth() === selectedDate.getMonth() &&
                date.getFullYear() === selectedDate.getFullYear();

              const isTodayDate =
                date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear();

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isFuture}
                  onClick={() => handleSelectDate(date)}
                  className={cn(
                    "relative mx-auto flex h-8 w-8 items-center justify-center rounded-lg text-xs transition",
                    isSelected
                      ? cn(
                          isAuth
                            ? "bg-auth-accent font-bold text-slate-900 shadow-sm shadow-auth-accent/40"
                            : "bg-brand font-semibold text-white shadow-sm shadow-brand/30 hover:bg-brand-hover",
                          selectedDateClassName,
                        )
                      : isCurrentMonth
                        ? isAuth
                          ? "text-white hover:bg-white/15"
                          : "text-text-default hover:bg-surface-muted"
                        : isAuth
                          ? "text-white/25 hover:bg-white/5"
                          : "text-text-subtle hover:bg-surface-muted/50",
                    isTodayDate &&
                      !isSelected &&
                      "font-bold ring-1 ring-brand/50",
                    isFuture &&
                      "cursor-not-allowed opacity-25 hover:bg-transparent",
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Footer popup */}
          <div
            className={cn(
              "mt-3 flex items-center justify-between border-t pt-2.5 text-xs",
              isAuth ? "border-white/10" : "border-border",
            )}
          >
            <button
              type="button"
              onClick={() => {
                setDisplayValue("");
                onChange("");
              }}
              className={cn(
                "font-medium transition",
                isAuth
                  ? "text-white/60 hover:text-white"
                  : "text-text-muted hover:text-danger",
              )}
            >
              Xóa ngày
            </button>

            <button
              type="button"
              onClick={() => setOpenCalendar(false)}
              className={cn(
                "font-semibold transition",
                isAuth
                  ? "text-auth-accent hover:underline"
                  : "text-brand hover:underline",
              )}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BirthdayInput;
