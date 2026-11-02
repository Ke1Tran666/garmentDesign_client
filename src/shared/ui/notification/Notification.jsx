import { useEffect, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";
import "@/shared/styles/notification.css";

const NOTIFICATION_CONFIGS = {
  success: {
    icon: CheckCircle2,
    wrapClass:
      "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 ring-1 ring-emerald-500/20",
    borderClass: "border-emerald-200/80 dark:border-emerald-900/50",
    barColor: "bg-emerald-500",
    defaultTitle: "Thành công!",
    defaultDescription: "Thao tác đã được thực hiện thành công.",
  },
  error: {
    icon: AlertCircle,
    wrapClass:
      "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 ring-1 ring-rose-500/20",
    borderClass: "border-rose-200/80 dark:border-rose-900/50",
    barColor: "bg-rose-500",
    defaultTitle: "Đã xảy ra lỗi!",
    defaultDescription: "Vui lòng kiểm tra lại thông tin và thử lại sau.",
  },
  warning: {
    icon: AlertTriangle,
    wrapClass:
      "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 ring-1 ring-amber-500/20",
    borderClass: "border-amber-200/80 dark:border-amber-900/50",
    barColor: "bg-amber-500",
    defaultTitle: "Cảnh báo",
    defaultDescription: "Vui lòng lưu ý thao tác này trước khi tiếp tục.",
  },
  info: {
    icon: Info,
    wrapClass:
      "bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400 ring-1 ring-sky-500/20",
    borderClass: "border-sky-200/80 dark:border-sky-900/50",
    barColor: "bg-sky-500",
    defaultTitle: "Thông tin",
    defaultDescription: "Thông báo cập nhật mới từ hệ thống.",
  },
};

const Notification = ({
  type = "success",
  message,
  description,
  onClose,
  visible = true,
  duration = 3500,
}) => {
  const [progress, setProgress] = useState(100);
  const [isHovered, setIsHovered] = useState(false);

  const config = NOTIFICATION_CONFIGS[type] || NOTIFICATION_CONFIGS.success;
  const Icon = config.icon;

  const displayTitle = message || config.defaultTitle;
  const displayDescription = description || config.defaultDescription;

  // Countdown timer progress bar
  useEffect(() => {
    if (!visible || isHovered || !duration) return;

    const intervalTime = 25; // update every 25ms
    const decrement = (intervalTime / duration) * 100;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev - decrement;
        return next <= 0 ? 0 : next;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [visible, isHovered, duration]);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="status"
      aria-live="polite"
      className={`notification ${
        visible ? "show" : ""
      } relative overflow-hidden rounded-2xl border bg-white/95 p-4 shadow-xl shadow-slate-900/10 backdrop-blur-md transition-all duration-300 dark:bg-slate-900/95 dark:shadow-black/40 ${
        config.borderClass
      } flex items-start gap-3.5`}
    >
      {/* Icon with soft illuminated ring */}
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 ${config.wrapClass}`}
      >
        <Icon className="h-5 w-5 stroke-[2.2]" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 pt-0.5">
        <h4 className="text-xs font-bold tracking-tight text-slate-900 dark:text-white">
          {displayTitle}
        </h4>
        {displayDescription && (
          <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            {displayDescription}
          </p>
        )}
      </div>

      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Đóng thông báo"
        className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Animated countdown progress bar */}
      {duration > 0 && (
        <div className="absolute right-0 bottom-0 left-0 h-1 bg-slate-100/70 dark:bg-slate-800">
          <div
            className={`h-full transition-all ease-linear ${config.barColor}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default Notification;
