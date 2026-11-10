export const PortalSectionCard = ({
  title,
  description,
  icon: Icon,
  iconClassName = "bg-brand-soft text-brand dark:bg-brand/20",
  badge,
  action,
  highlight = false,
  className = "",
  bodyClassName = "",
  children,
}) => {
  return (
    <section
      className={`rounded-2xl border bg-white p-5 shadow-xs transition-all sm:p-6 dark:bg-slate-900 ${
        highlight
          ? "border-brand/50 ring-2 ring-brand/15"
          : "border-slate-200/80 dark:border-slate-800"
      } ${className}`}
    >
      {(title || description || action || badge) && (
        <div className="mb-5 flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center dark:border-slate-800">
          <div className="flex min-w-0 items-start gap-3">
            {Icon && (
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}
              >
                <Icon size={19} />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {title && (
                  <h2 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                    {title}
                  </h2>
                )}
                {badge}
              </div>
              {description && (
                <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm dark:text-slate-400">
                  {description}
                </p>
              )}
            </div>
          </div>

          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      <div className={bodyClassName}>{children}</div>
    </section>
  );
};

export default PortalSectionCard;
