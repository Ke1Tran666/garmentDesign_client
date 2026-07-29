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

// Button Icon text 1
export const ButtonIconText = ({ 
  text, 
  onClick, 
  icon: Icon,
  className,
  classNameIcon 
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        inline-flex items-center gap-2
        rounded-lg border! border-input!
        bg-surface px-4 py-2
        text-sm font-semibold text-text-default
        transition-all duration-300 ease-out
        animate-slideInRight
        hover:border-brand hover:bg-surface-subtle hover:text-brand
        ${className}
      `}
    >
      <span 
        className={`
          flex h-5 w-5 items-center justify-center rounded-full border-2 border-brand text-brand ${classNameIcon}
          `}
      >
        {Icon && <Icon size={13} strokeWidth={3}/>}
      </span>

      {text}
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
            flex item-center justify-center gap-3
            rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 
            ${className}
            
        `}
    >
        {children}
    </button>
  )
}

export const HandleButtonIcon = ({
    className,
    classNameIcon,
    onClick,
    children,
    icon:Icon,
}) => {
  return (
    <button
        type="button"
        onClick={onClick}
        className={`
            flex item-center justify-center gap-3
            rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 
            ${className}
            
        `}
    >
        <span 
          className={`
            flex h-5 w-5 items-center justify-center rounded-full border-2 border-white text-white ${classNameIcon}
            `}
        >
          {Icon && <Icon size={13} strokeWidth={3}/>}
        </span>
        {children}
    </button>
  )
}