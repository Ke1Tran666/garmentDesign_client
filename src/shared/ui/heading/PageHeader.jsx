const PageHeader = ({ title, badge, description, actions, className = "" }) => {
  return (
    <div
      className={`flex flex-col justify-between gap-4 border-b border-slate-200/60 pb-3 sm:flex-row sm:items-center dark:border-slate-800 ${className}`}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-2.5">{actions}</div>
      )}
    </div>
  );
};

export default PageHeader;
