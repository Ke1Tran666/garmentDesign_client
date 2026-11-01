import { ArrowLeft, ChevronDown, ChevronRight } from "lucide-react";

const EMPTY_VALUE = "Chưa có dữ liệu";

export const AdminDetailInfoRow = ({
  icon: Icon,
  label,
  children,
  emptyText = EMPTY_VALUE,
}) => (
  <div className="grid grid-cols-[18px_110px_minmax(0,1fr)] items-start gap-3 border-b border-slate-100/60 py-2.5 last:border-b-0 dark:border-slate-800/60">
    {Icon ? (
      <Icon size={16} className="mt-0.5 text-slate-400 dark:text-slate-500" />
    ) : (
      <span />
    )}

    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
      {label}
    </span>

    <div className="text-xs font-medium wrap-break-word text-slate-800 dark:text-slate-200">
      {children ?? emptyText}
    </div>
  </div>
);

export const AdminDetailSection = ({
  title,
  action,
  children,
  className = "",
}) => (
  <section
    className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 ${className}`}
  >
    <div className="mb-4 flex items-center justify-between gap-4 border-b border-slate-100 pb-3 dark:border-slate-800">
      <h2 className="font-heading text-sm font-bold tracking-wider text-slate-900 uppercase dark:text-white">
        {title}
      </h2>
      {action}
    </div>

    {children}
  </section>
);

export const AdminDetailSummaryRow = ({
  icon: Icon,
  title,
  description,
  value,
  valueClassName = "bg-slate-100 text-slate-700",
  showChevron = false,
}) => (
  <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 transition-colors last:border-b-0 hover:bg-slate-50/50 dark:border-slate-800 dark:hover:bg-slate-800/40">
    {Icon && <Icon size={16} className="shrink-0 text-slate-400" />}

    <div className="min-w-0 flex-1">
      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
        {title}
      </span>

      {description && (
        <span className="ml-2 text-[11px] text-slate-400">{description}</span>
      )}
    </div>

    <span
      className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${valueClassName}`}
    >
      {value ?? EMPTY_VALUE}
    </span>

    {showChevron && (
      <ChevronDown size={14} className="shrink-0 text-slate-400" />
    )}
  </div>
);

const AdminDetailLayout = ({
  backLabel,
  breadcrumbLabel,
  breadcrumbValue,
  title,
  code,
  subtitle,
  leading,
  badges,
  actions,
  sidebar,
  children,
  onBack,
}) => (
  <div className="animate-in space-y-5 duration-200 fade-in">
    <button
      type="button"
      onClick={onBack}
      className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition-colors hover:text-brand"
    >
      <ArrowLeft size={16} />
      <span>{backLabel}</span>
    </button>

    <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
      {/* Breadcrumb nav inside layout */}
      <nav className="flex h-12 items-center gap-2 border-b border-slate-100 bg-slate-50/60 px-5 text-xs text-slate-500 sm:px-6 dark:border-slate-800 dark:bg-slate-800/40">
        <button
          type="button"
          onClick={onBack}
          className="font-medium transition-colors hover:text-brand"
        >
          {breadcrumbLabel}
        </button>

        <ChevronRight
          size={14}
          className="text-slate-300 dark:text-slate-600"
        />

        <span className="truncate font-semibold text-slate-800 dark:text-white">
          {breadcrumbValue}
        </span>
      </nav>

      {/* Header banner */}
      <header className="flex flex-col gap-4 border-b border-slate-100 px-5 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between dark:border-slate-800">
        <div className="flex min-w-0 items-center gap-4">
          {leading}

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="truncate font-heading text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
                {title}
              </h1>

              {code && (
                <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {code}
                </span>
              )}
            </div>

            {subtitle && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {(badges || actions) && (
          <div className="flex flex-wrap items-center gap-2.5">
            {badges}
            {actions}
          </div>
        )}
      </header>

      {/* Content 2-Column layout */}
      <div className="grid grid-cols-1 divide-y divide-slate-100 xl:grid-cols-[minmax(0,1.65fr)_minmax(340px,0.95fr)] xl:divide-x xl:divide-y-0 dark:divide-slate-800">
        <main className="min-w-0 space-y-6 p-5 sm:p-6">{children}</main>

        <aside className="min-w-0 space-y-5 bg-slate-50/40 p-5 sm:p-6 dark:bg-slate-900/40">
          {sidebar}
        </aside>
      </div>
    </div>
  </div>
);

export default AdminDetailLayout;
