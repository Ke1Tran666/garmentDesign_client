// Button icon số 1
export const ButtonIcon = ({
  icon: Icon,
  onClick,
  onMouseEnter,
  className = "",
  classNameIcon,
  sizeIcon = 20,
  type = "button",
  children,
  ...props
}) => {
  return (
    <button
      type={type}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      className={`
        flex h-10 w-10 items-center justify-center
        rounded-full shadow-lg
        transition-all duration-300
        hover:scale-110
        ${className}
      `}
      {...props}
    >
      {Icon && <Icon size={sizeIcon} className={`${classNameIcon}`}/>}

      {children}
    </button>
  );
};

// Button hành động số 1

export const HandleButton = ({
    className,
    onClick,
    children,
    
}) => {
  return (
    <button
        type="button"
        onClick={onClick}
        className={`
            rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 ${className}
        `}
    >
        {children}
    </button>
  )
}