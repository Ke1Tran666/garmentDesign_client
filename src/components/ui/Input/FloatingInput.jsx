const FloatingInput = ({
  type = "text",
  value,
  onChange,
  label,
  icon: Icon,
  containerClassName = "",
  className = "",
  labelClassName = "",
  iconClassName = "",
  ...props
}) => {
  return (
    <div className={`relative w-full ${containerClassName}`}>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={label}
        className={`
          peer w-full rounded-xl border-2 border-white/25
          bg-transparent px-4 pt-5 pb-2
          ${Icon ? "pr-12" : ""}
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
        className={`
          pointer-events-none absolute left-4 top-1/2
          -translate-y-1/2 text-sm text-white/55
          transition-all duration-300
          peer-valid:top-2 peer-valid:translate-y-0
          peer-valid:text-xs peer-valid:text-[#80d0ff]
          peer-focus:top-2 peer-focus:translate-y-0
          peer-focus:text-xs peer-focus:text-[#80d0ff]
          ${labelClassName}
        `}
      >
        {label}
      </label>

      {Icon && (
        <Icon
          className={`
            absolute right-4 top-1/2 h-5 w-5
            -translate-y-1/2 text-white/45
            ${iconClassName}
          `}
        />
      )}
    </div>
  );
};

export default FloatingInput;