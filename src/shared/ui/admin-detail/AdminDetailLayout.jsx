import { ArrowLeft, ChevronDown, ChevronRight } from "lucide-react";

const EMPTY_VALUE = "Chưa có dữ liệu";

export const AdminDetailInfoRow = ({
  icon: Icon,
  label,
  children,
  emptyText = EMPTY_VALUE,
}) => (
  <div className="grid grid-cols-[18px_105px_minmax(0,1fr)] items-start gap-3 py-2.5">
    {Icon ? <Icon size={16} className="mt-0.5 text-text-subtle" /> : <span />}

    <span className="text-sm text-text-muted">{label}</span>

    <div className="text-sm font-medium wrap-break-word text-text-default">
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
    className={`border-b border-border-subtle py-5 last:border-b-0 ${className}`}
  >
    <div className="mb-2 flex items-center justify-between gap-4">
      <h2 className="text-sm font-bold text-text-strong">{title}</h2>

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
  valueClassName = "bg-surface-muted text-text-default",
  showChevron = false,
}) => (
  <div className="flex items-center gap-3 border-b border-border-subtle px-4 py-3 last:border-b-0">
    {Icon && <Icon size={17} className="shrink-0 text-text-muted" />}

    <div className="min-w-0 flex-1">
      <span className="text-sm font-semibold text-text-default">{title}</span>

      {description && (
        <span className="ml-2 text-xs text-text-muted">{description}</span>
      )}
    </div>

    <span
      className={`shrink-0 rounded-md px-2 py-1 text-xs font-semibold ${valueClassName} `}
    >
      {value ?? EMPTY_VALUE}
    </span>

    {showChevron && (
      <ChevronDown size={15} className="shrink-0 text-text-subtle" />
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
  <div className="space-y-4">
    <button
      type="button"
      onClick={onBack}
      className="inline-flex items-center gap-2 text-sm font-semibold text-text-muted transition hover:text-brand"
    >
      <ArrowLeft size={18} />
      {backLabel}
    </button>

    <div className="overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-sm">
      <nav className="flex h-13 items-center gap-2 border-b border-border-subtle px-5 text-sm sm:px-6">
        <button
          type="button"
          onClick={onBack}
          className="text-text-muted transition hover:text-brand"
        >
          {breadcrumbLabel}
        </button>

        <ChevronRight size={15} className="text-text-subtle" />

        <span className="truncate font-medium text-text-default">
          {breadcrumbValue}
        </span>
      </nav>

      <header className="flex flex-col gap-4 border-b border-border-subtle px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          {leading}

          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-3">
              <h1 className="truncate text-2xl font-semibold text-text-strong">
                {title}
              </h1>

              {code && (
                <span className="shrink-0 rounded-md bg-surface-muted px-2 py-1 text-xs font-semibold text-text-default">
                  {code}
                </span>
              )}
            </div>

            {subtitle && (
              <p className="mt-1 text-sm text-text-muted">{subtitle}</p>
            )}
          </div>
        </div>

        {(badges || actions) && (
          <div className="flex flex-wrap items-center gap-2">
            {badges}
            {actions}
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.65fr)_minmax(340px,0.95fr)]">
        <main className="min-w-0 space-y-7 p-5 sm:p-6 xl:border-r xl:border-border-subtle">
          {children}
        </main>

        <aside className="min-w-0 px-5 sm:px-6">{sidebar}</aside>
      </div>
    </div>
  </div>
);

export default AdminDetailLayout;
