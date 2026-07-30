import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

const variantClasses = {
  dark: `
    border-white/25 bg-white/10 text-white
    focus:border-auth-accent
    focus:shadow-[0_0_18px_rgba(128,208,255,0.35)]
  `,
  light: `
    border-input bg-surface text-text-strong
    focus:border-brand
    focus:shadow-[0_0_0_3px_rgba(1,146,245,0.12)]
  `,
};

const OtpInput = forwardRef(
  (
    {
      value,
      onChange,
      length = 6,
      variant = "light",
      autoFocus = false,
      disabled = false,
      className = "",
      inputClassName = "",
    },
    ref,
  ) => {
    const inputRefs = useRef([]);

    const focusInput = (index = 0) => {
      const safeIndex = Math.max(0, Math.min(index, length - 1));

      inputRefs.current[safeIndex]?.focus();
      inputRefs.current[safeIndex]?.select();
    };

    useImperativeHandle(ref, () => ({
      focus: focusInput,
    }));

    useEffect(() => {
    if (!autoFocus) return;

    const timer = setTimeout(() => {
        inputRefs.current[0]?.focus();
        inputRefs.current[0]?.select();
    }, 100);

    return () => clearTimeout(timer);
    }, [autoFocus]);

    const updateValue = (index, rawValue) => {
      const digits = rawValue.replace(/\D/g, "");
      const nextOtp = Array.from(
        { length },
        (_, itemIndex) => value[itemIndex] || "",
      );

      if (!digits) {
        nextOtp[index] = "";
        onChange(nextOtp);
        return;
      }

      digits
        .slice(0, length - index)
        .split("")
        .forEach((digit, offset) => {
          nextOtp[index + offset] = digit;
        });

      onChange(nextOtp);

      const nextIndex = Math.min(index + digits.length, length - 1);
      requestAnimationFrame(() => focusInput(nextIndex));
    };

    const handleKeyDown = (index, event) => {
      if (event.key === "Backspace" && !value[index] && index > 0) {
        focusInput(index - 1);
        return;
      }

      if (event.key === "ArrowLeft" && index > 0) {
        event.preventDefault();
        focusInput(index - 1);
        return;
      }

      if (event.key === "ArrowRight" && index < length - 1) {
        event.preventDefault();
        focusInput(index + 1);
      }
    };

    const handlePaste = (index, event) => {
      event.preventDefault();

      const pastedDigits = event.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, length - index);

      if (!pastedDigits) return;

      updateValue(index, pastedDigits);
    };

    return (
      <div className={`flex justify-between gap-2 ${className}`}>
        {Array.from({ length }, (_, index) => (
          <input
            key={index}
            ref={(element) => {
              inputRefs.current[index] = element;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={length}
            value={value[index] || ""}
            disabled={disabled}
            aria-label={`Số OTP thứ ${index + 1}`}
            onChange={(event) => updateValue(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={(event) => handlePaste(index, event)}
            className={`
              h-12 w-12 rounded-xl border-2
              text-center text-lg font-semibold
              outline-none transition-all duration-300
              disabled:cursor-not-allowed disabled:opacity-60
              ${variantClasses[variant]}
              ${inputClassName}
            `}
          />
        ))}
      </div>
    );
  },
);

OtpInput.displayName = "OtpInput";

export default OtpInput;