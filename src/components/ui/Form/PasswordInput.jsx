import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const PasswordInput = ({
  value,
  onChange,
  label = "Password",
  containerClassName = "",
  className = "",
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={`relative ${containerClassName}`}>
      <input
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={label}
        className={`
          peer w-full rounded-xl border-2 border-white/25
          bg-transparent px-4 pt-5 pb-2 pr-12
          text-sm text-white outline-none
          transition-all duration-300
          placeholder:text-transparent
          focus:border-[#80d0ff]
          focus:shadow-[0_0_18px_rgba(128,208,255,0.35)]
          ${className}
        `}
        {...props}
      />

      <label
        className="
          pointer-events-none absolute left-4 top-1/2
          -translate-y-1/2 text-sm text-white/55
          transition-all duration-300
          peer-valid:top-2 peer-valid:translate-y-0
          peer-valid:text-xs peer-valid:text-[#80d0ff]
          peer-focus:top-2 peer-focus:translate-y-0
          peer-focus:text-xs peer-focus:text-[#80d0ff]
        "
      >
        {label}
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
  );
};

export default PasswordInput;