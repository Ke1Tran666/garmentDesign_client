import { Shield, ShieldCheck, UserRound } from "lucide-react";
import { normalizeRole, resolveAppRole } from "@/features/auth/lib/authRole";
export { getInitials } from "@/shared/lib/avatarUtils";

export const PAGE_SIZE = 12;
export const EMPTY_VALUE = "Chưa có dữ liệu";

export const USER_SORT_OPTIONS = [
  { value: "newest", label: "Mới tạo gần đây" },
  { value: "oldest", label: "Cũ nhất trước" },
  { value: "name-asc", label: "Tên (A - Z)" },
  { value: "name-desc", label: "Tên (Z - A)" },
  { value: "last-login", label: "Đăng nhập gần nhất" },
];

export const STATUS_FILTER_CHIPS = [
  { id: "all", label: "Tất cả" },
  { id: "active", label: "Hoạt động" },
  { id: "pending", label: "Chờ hoàn thiện" },
  { id: "inactive", label: "Đã khóa" },
  { id: "deleted", label: "Đã xóa" },
  { id: "disabled", label: "Khóa & Xóa" },
];

export const formatDate = (
  value,
  includeTime = false,
  fallback = EMPTY_VALUE,
) => {
  if (!value) return fallback;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
};

export const formatActivityDate = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
};

export const formatTime = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const formatGender = (gender) => {
  const normalizedGender = String(gender || "")
    .trim()
    .toLowerCase();

  if (normalizedGender === "male") return "Nam";
  if (normalizedGender === "female") return "Nữ";
  if (normalizedGender === "unknown") return "Không xác định";

  return EMPTY_VALUE;
};

export const getRoleName = (user) => user?.role?.nameRole || "Chưa phân quyền";

export const getRoleBadge = (roleOrUser) => {
  const isRoleObject =
    typeof roleOrUser === "object" &&
    roleOrUser !== null &&
    !("role" in roleOrUser);

  const roleId =
    typeof roleOrUser === "object" && roleOrUser !== null
      ? isRoleObject
        ? (roleOrUser.idRole ?? roleOrUser.roleId)
        : (roleOrUser.role?.idRole ?? roleOrUser.roleId ?? roleOrUser.idRole)
      : null;

  const rawName =
    typeof roleOrUser === "string"
      ? roleOrUser
      : isRoleObject
        ? roleOrUser.nameRole || ""
        : getRoleName(roleOrUser);

  const norm = normalizeRole(rawName);
  const resolved = resolveAppRole(rawName, roleId);

  if (resolved === "admin") {
    return {
      label: norm === "admin" || !rawName ? "Quản trị viên" : rawName,
      className:
        "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800",
      icon: ShieldCheck,
    };
  }

  if (resolved === "staff") {
    return {
      label: norm === "staff" || !rawName ? "Nhân viên" : rawName,
      className:
        "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800",
      icon: Shield,
    };
  }

  return {
    label:
      resolved === "user" && (norm === "user" || !rawName)
        ? "Khách hàng"
        : rawName || "Khách hàng",
    className:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    icon: UserRound,
  };
};

export const getUserStatusValue = (user) => {
  const status = String(user?.status || "")
    .trim()
    .toLowerCase();

  if (user?.deletedAt || status === "delete") {
    return "deleted";
  }
  if (status === "banned" || status === "inactive") {
    return "inactive";
  }
  if (status === "active" || status === "pending") {
    return status;
  }
  return status || "unknown";
};

export const getStatusInfo = (user) => {
  const status = getUserStatusValue(user);

  if (status === "deleted") {
    return {
      code: "deleted",
      label: "Đã xóa",
      className:
        "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900",
      dot: "bg-rose-500",
      dotClassName: "bg-danger",
      badgeClassName: "bg-danger-soft text-danger",
    };
  }

  if (status === "active") {
    return {
      code: "active",
      label: "Hoạt động",
      className:
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900",
      dot: "bg-emerald-500",
      dotClassName: "bg-success",
      badgeClassName: "bg-success-soft text-success",
    };
  }

  if (status === "pending") {
    return {
      code: "pending",
      label: "Chờ hoàn thiện",
      className:
        "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900",
      dot: "bg-amber-500",
      dotClassName: "bg-warning",
      badgeClassName: "bg-warning-soft text-warning",
    };
  }

  if (status === "inactive") {
    return {
      code: "inactive",
      label: "Đã khóa",
      className:
        "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
      dot: "bg-slate-400",
      dotClassName: "bg-danger",
      badgeClassName: "bg-danger-soft text-danger",
    };
  }

  return {
    code: status,
    label: user?.status || "Không xác định",
    className:
      "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
    dot: "bg-slate-400",
    dotClassName: "bg-text-subtle",
    badgeClassName: "bg-surface-muted text-text-muted",
  };
};

export const getUserContact = (user) => {
  const activeProviders = Array.isArray(user?.authProviders)
    ? user.authProviders.filter((item) => !item.deletedAt)
    : [];

  const emailProvider =
    activeProviders.find(
      (item) =>
        item.email && String(item.provider || "").toLowerCase() === "local",
    ) || activeProviders.find((item) => Boolean(item.email));

  const phoneProvider =
    activeProviders.find(
      (item) =>
        item.phone && String(item.provider || "").toLowerCase() === "phone",
    ) || activeProviders.find((item) => Boolean(item.phone));

  return {
    email: user?.email || emailProvider?.email || "",
    phone: user?.phone || phoneProvider?.phone || "",
  };
};

export const getPasswordStrength = (pwd) => {
  if (!pwd) return { score: 0, label: "Chưa nhập", color: "bg-slate-200" };

  let score = 0;
  if (pwd.length >= 8) score += 1;
  if (/[A-Z]/.test(pwd)) score += 1;
  if (/[0-9]/.test(pwd)) score += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

  if (score <= 1) {
    return {
      score: 1,
      label: "Yếu",
      color: "bg-rose-500",
      text: "text-rose-600",
    };
  }

  if (score <= 3) {
    return {
      score: 2,
      label: "Trung bình",
      color: "bg-amber-500",
      text: "text-amber-600",
    };
  }

  return {
    score: 3,
    label: "Mạnh",
    color: "bg-emerald-500",
    text: "text-emerald-600",
  };
};
