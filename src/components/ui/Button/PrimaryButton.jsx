const PrimaryButton = ({
  children,
  type = "button",
  disabled = false,
  onClick,
  className = "",
  icon: Icon,
}) => {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`
        flex w-full items-center justify-center gap-2
        rounded-xl border border-white/20
        bg-brand! px-5 py-3.25
        text-[15px] font-semibold tracking-[0.2px]
        text-white backdrop-blur-xl
        transition-all duration-300
        hover:-translate-y-1
        hover:bg-brand-dark
        hover:shadow-[0_8px_25px_rgba(1,146,245,0.35)]
        disabled:cursor-not-allowed
        disabled:opacity-70
        ${className}
      `}
    >
      {children}

      {Icon && <Icon className="h-4 w-4" />}
    </button>
  );
};

export default PrimaryButton;