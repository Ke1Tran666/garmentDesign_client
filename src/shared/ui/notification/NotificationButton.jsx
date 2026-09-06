import { useState } from "react";
import { Bell, ChevronLeft } from "lucide-react";
import { ButtonIcon } from "@/shared/ui/button/Button";

const NotificationButton = ({
  onClick,
  hasUnread = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`
        fixed right-0
        bottom-[calc(5.25rem+env(safe-area-inset-bottom))]
        z-40 flex items-center gap-2
        rounded-l-full border border-r-0 border-border
        bg-surface p-2 pl-1 shadow-lg
        transition-transform duration-300 ease-in-out

        ${
          isExpanded
            ? "translate-x-0"
            : "translate-x-[calc(100%-3rem)]"
        }

        md:static md:translate-x-0
        md:border-0 md:bg-transparent
        md:p-0 md:shadow-none
      `}
    >
      <button
        type="button"
        aria-label={
          isExpanded ? "Thu nút thông báo" : "Mở nút thông báo"
        }
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded((current) => !current)}
        className="
          flex h-10 w-10 shrink-0
          items-center justify-center rounded-full
          text-text-muted transition-colors
          hover:bg-surface-muted hover:text-brand
          md:hidden
        "
      >
        <ChevronLeft
          size={20}
          aria-hidden="true"
          className={`
            transition-transform duration-300
            ${isExpanded ? "rotate-180" : ""}
          `}
        />
      </button>

      <ButtonIcon
        icon={Bell}
        sizeIcon={22}
        onClick={onClick}
        aria-label={
          hasUnread
            ? "Xem thông báo, có thông báo chưa đọc"
            : "Xem thông báo"
        }
        className="
          relative shrink-0
          bg-linear-to-br from-indigo-500 to-brand
          shadow-lg hover:from-indigo-600
          hover:to-brand hover:shadow-xl
          active:scale-95
        "
        classNameIcon="text-white"
      >
        {hasUnread && (
          <span
            aria-hidden="true"
            className="
              absolute right-2 top-2
              h-2.5 w-2.5 animate-pulse
              rounded-full bg-warning
              shadow-lg shadow-warning/50
            "
          />
        )}
      </ButtonIcon>
    </div>
  );
};

export default NotificationButton;