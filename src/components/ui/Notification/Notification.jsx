import { CircleCheck, XCircle, CircleAlert, X } from "lucide-react";
import '../../../css/notification.css'

const TYPES = {
  success: {
    icon: CircleCheck,
    iconClass: "text-success",
    wrapClass: "bg-success-soft",
    borderClass: "border-success-border",
  },
  error: {
    icon: XCircle,
    iconClass: "text-danger",
    wrapClass: "bg-danger-soft",
    borderClass: "border-danger-border",
  },
  warning: {
    icon: CircleAlert,
    iconClass: "text-warning",
    wrapClass: "bg-warning-soft",
    borderClass: "border-warning-border",
  }
};

const DEFAULT_MESSAGES = {
  success: { title: "Thành công!", msg: "Chúng tôi sẽ liên hệ bạn sớm nhất." },
  error:   { title: "Có lỗi xảy ra!", msg: "Vui lòng thử lại sau." },
  warning: { title: "Cảnh báo", msg: "Hành động này không thể hoàn tác." },
};

const Notification = ({type = "success",message,description, onClose, visible}) => {

  const config = TYPES[type] ?? TYPES.success;
  const defaults = DEFAULT_MESSAGES[type] ?? DEFAULT_MESSAGES.success;
  const Icon = config.icon;

  return (
    <div className={`notification ${visible ? "show" : ""} bg-surface border ${config.borderClass} rounded-2xl px-6 py-4 flex items-center gap-3 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.15)]`}
    >
      <div className={`w-8 h-8 rounded-full ${config.wrapClass} flex items-center justify-center shrink-0`}>
        <Icon className={`w-4 h-4 ${config.iconClass}`} />
      </div>
      <div className="flex-1">
        <div className="text-sm font-heading font-500 text-text-strong">
          {message ?? defaults.title}
        </div>
        <div className="text-xs text-text-subtle">
          {description ?? defaults.msg}
        </div>
      </div>
      <button onClick={onClose} className="w-8 h-8 rounded-full bg-surface-muted text-text-muted flex items-center justify-center shrink-0 transition-opacity ease-linear hover:opacity-70">
        <X className="w-6 h-6" />
      </button>
    </div>
  );
};

export default Notification;