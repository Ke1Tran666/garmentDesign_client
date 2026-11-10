const TONE_STYLES = {
  success: {
    pill: "border-emerald-200/80 bg-emerald-50 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  warning: {
    pill: "border-amber-200/80 bg-amber-50 text-amber-700 dark:border-amber-800/60 dark:bg-amber-950/50 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  danger: {
    pill: "border-rose-200/80 bg-rose-50 text-rose-700 dark:border-rose-800/60 dark:bg-rose-950/50 dark:text-rose-400",
    dot: "bg-rose-500",
  },
  info: {
    pill: "border-sky-200/80 bg-sky-50 text-sky-700 dark:border-sky-800/60 dark:bg-sky-950/50 dark:text-sky-400",
    dot: "bg-sky-500",
  },
  brand: {
    pill: "border-brand/30 bg-brand-soft text-brand dark:bg-brand/20",
    dot: "bg-brand",
  },
  neutral: {
    pill: "border-slate-200/80 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
    dot: "bg-slate-400",
  },
};

export const StatusBadge = ({
  label,
  tone = "neutral",
  showDot = true,
  className = "",
}) => {
  const styles = TONE_STYLES[tone] || TONE_STYLES.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${styles.pill} ${className}`}
    >
      {showDot && (
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${styles.dot}`} />
      )}
      <span>{label}</span>
    </span>
  );
};

export default StatusBadge;
