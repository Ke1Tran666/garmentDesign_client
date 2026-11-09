import { useState } from "react";
import defaultAvatar from "@/shared/assets/images/avatar-default.jpg";
import { getInitials } from "@/shared/lib/avatarUtils";
import { cn } from "@/shared/lib/utils";

const SIZE_MAP = {
  xs: {
    box: "h-7 w-7",
    text: "text-[11px]",
    radius: "rounded-lg",
    dot: "h-2 w-2 -bottom-0.5 -right-0.5",
  },
  sm: {
    box: "h-8.5 w-8.5",
    text: "text-xs",
    radius: "rounded-xl",
    dot: "h-2.5 w-2.5 -bottom-0.5 -right-0.5",
  },
  md: {
    box: "h-10 w-10",
    text: "text-sm",
    radius: "rounded-xl",
    dot: "h-3 w-3 -bottom-0.5 -right-0.5",
  },
  lg: {
    box: "h-12 w-12",
    text: "text-base",
    radius: "rounded-xl",
    dot: "h-3.5 w-3.5 -bottom-0.5 -right-0.5",
  },
  xl: {
    box: "h-20 w-20",
    text: "text-2xl",
    radius: "rounded-2xl",
    dot: "h-4 w-4 -bottom-0.5 -right-0.5",
  },
};

export const UserAvatar = ({
  src,
  name = "Người dùng",
  size = "md",
  shape = "rounded",
  ring = true,
  showStatus = false,
  statusColor = "bg-emerald-500",
  fallbackInitials = "U",
  className = "",
}) => {
  const [failure, setFailure] = useState({ src: null, stage: 0 });

  const stage = src && failure.src === src ? failure.stage : 0;
  const initials = getInitials(name, fallbackInitials);
  const currentSize = SIZE_MAP[size] || SIZE_MAP.md;
  const radiusClass = shape === "circle" ? "rounded-full" : currentSize.radius;
  const ringStyle = ring ? "ring-2 ring-brand/20 dark:ring-brand/30" : "";

  const handleImageError = () => {
    if (stage === 0 && defaultAvatar && src !== defaultAvatar) {
      setFailure({ src, stage: 1 });
    } else {
      setFailure({ src, stage: 2 });
    }
  };

  const imageSrc = stage === 1 ? defaultAvatar : src;
  const showImage = Boolean(imageSrc) && stage < 2;

  return (
    <div className={cn("relative inline-flex shrink-0", currentSize.box)}>
      {showImage ? (
        <img
          src={imageSrc}
          alt={name || "Ảnh đại diện"}
          onError={handleImageError}
          className={cn(
            "h-full w-full shrink-0 object-cover shadow-2xs",
            radiusClass,
            ringStyle,
            className,
          )}
        />
      ) : (
        <div
          className={cn(
            "flex h-full w-full items-center justify-center bg-linear-to-tr from-brand to-sky-400 font-bold tracking-wider text-white shadow-2xs select-none",
            radiusClass,
            currentSize.text,
            ringStyle,
            className,
          )}
          title={name}
        >
          {initials}
        </div>
      )}

      {showStatus && (
        <span
          className={cn(
            "absolute rounded-full border-2 border-white shadow-2xs dark:border-slate-900",
            currentSize.dot,
            statusColor,
          )}
        />
      )}
    </div>
  );
};

export default UserAvatar;
