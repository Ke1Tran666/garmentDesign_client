const StatCard = ({
  title,
  value,
  subtitle,
  badge,
  icon: Icon,
  iconColorClass = "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400",
  hoverBorderClass = "hover:border-brand/40",
  onClick,
  className = "",
}) => {
  const isClickable = Boolean(onClick);

  return (
    <div
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (isClickable && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition-all dark:border-slate-800 dark:bg-slate-900 ${
        isClickable ? `cursor-pointer hover:shadow-md ${hoverBorderClass}` : ""
      } ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {title}
        </span>
        {Icon && (
          <div
            className={`flex h-8.5 w-8.5 items-center justify-center rounded-xl ${iconColorClass}`}
          >
            <Icon size={17} />
          </div>
        )}
      </div>

      <div className="mt-2.5">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-slate-900 dark:text-white">
            {value ?? 0}
          </span>
          {badge}
        </div>
        {subtitle && (
          <p
            className="mt-1 text-[11px] font-medium text-slate-400 truncate"
            title={typeof subtitle === "string" ? subtitle : undefined}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
