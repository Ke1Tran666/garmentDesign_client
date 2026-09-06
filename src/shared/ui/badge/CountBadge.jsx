const CountBadge = ({
  count,
  label,
  icon: Icon,
  className = "",
}) => (
  <div
    className={`
      flex items-center gap-2 rounded-xl
      bg-info-soft px-4 py-2
      text-sm font-medium text-info
      ${className}
    `}
  >
    {Icon && (
      <Icon size={18} className="shrink-0" aria-hidden="true" />
    )}

    <span>
      {count} {label}
    </span>
  </div>
);

export default CountBadge;