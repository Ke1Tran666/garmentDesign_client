import { useState } from "react";
import defaultAvatar from "@/shared/assets/images/avatar-default.jpg";

/**
 * Extract 1-2 uppercase letters from full name.
 * e.g. "Staff System" -> "SS", "Admin" -> "AD", "Nguyen Van A" -> "NA"
 */
const getInitials = (name) => {
  if (!name || typeof name !== "string") return "AD";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "AD";
  if (parts.length === 1) {
    const single = parts[0];
    return single.length >= 2
      ? single.slice(0, 2).toUpperCase()
      : single.toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const SIZE_MAP = {
  xs: {
    box: "h-7 w-7",
    text: "text-[11px]",
    dot: "h-2 w-2 -bottom-0.5 -right-0.5",
  },
  sm: {
    box: "h-8.5 w-8.5",
    text: "text-xs",
    dot: "h-2.5 w-2.5 -bottom-0.5 -right-0.5",
  },
  md: {
    box: "h-10 w-10",
    text: "text-sm",
    dot: "h-3 w-3 -bottom-0.5 -right-0.5",
  },
  lg: {
    box: "h-12 w-12",
    text: "text-base",
    dot: "h-3.5 w-3.5 -bottom-0.5 -right-0.5",
  },
};

export const AdminUserAvatar = ({
  src,
  name = "Admin",
  size = "sm",
  className = "",
  ring = true,
  showStatus = false,
  statusColor = "bg-emerald-500",
}) => {
  const [failedSrc, setFailedSrc] = useState(null);
  const [triedFallback, setTriedFallback] = useState(false);

  const initials = getInitials(name);
  const currentSize = SIZE_MAP[size] || SIZE_MAP.sm;
  const ringStyle = ring ? "ring-2 ring-brand/20 dark:ring-brand/30" : "";

  const isFailed = failedSrc === src;

  const handleImageError = () => {
    if (!triedFallback && defaultAvatar && src !== defaultAvatar) {
      setTriedFallback(true);
    } else {
      setFailedSrc(src);
    }
  };

  const imageSrc = triedFallback ? defaultAvatar : src;

  return (
    <div className={`relative inline-flex shrink-0 ${currentSize.box}`}>
      {!imageSrc || isFailed ? (
        <div
          className={`flex h-full w-full select-none items-center justify-center rounded-xl bg-gradient-to-tr from-brand to-sky-400 font-bold tracking-wider text-white shadow-2xs ${currentSize.text} ${ringStyle} ${className}`}
          title={name}
        >
          {initials}
        </div>
      ) : (
        <img
          src={imageSrc}
          alt={name}
          onError={handleImageError}
          className={`h-full w-full shrink-0 rounded-xl object-cover shadow-2xs ${ringStyle} ${className}`}
        />
      )}

      {showStatus && (
        <span
          className={`absolute rounded-full border-2 border-white shadow-2xs dark:border-slate-900 ${currentSize.dot} ${statusColor}`}
        />
      )}
    </div>
  );
};

export default AdminUserAvatar;
