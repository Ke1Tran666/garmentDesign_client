import { KeyRound, Shield, ShieldCheck, UserRound } from "lucide-react";
import {
  APP_ROLE,
  SYSTEM_ROLE_ID,
  resolveAppRole,
} from "@/features/auth/lib/authRole";

export const PAGE_SIZE = 12;

export const SYSTEM_ROLE_IDS = [
  SYSTEM_ROLE_ID.ADMIN,
  SYSTEM_ROLE_ID.STAFF,
  SYSTEM_ROLE_ID.USER,
];
export const SYSTEM_ROLE_NAMES = ["ADMIN", "STAFF", "USER"];
export const RESERVED_NAME_SLOTS = {
  ADMIN: SYSTEM_ROLE_ID.ADMIN,
  STAFF: SYSTEM_ROLE_ID.STAFF,
  USER: SYSTEM_ROLE_ID.USER,
};

export const ROLE_NAME_REGEX = /^[\p{L}\p{N}][\p{L}\p{N}\s_\-&/().,]{1,49}$/u;

export const ROLE_SORT_OPTIONS = [
  { value: "id-asc", label: "Mã ID (Tăng dần)" },
  { value: "id-desc", label: "Mã ID (Giảm dần)" },
  { value: "users-desc", label: "Nhiều tài khoản nhất" },
  { value: "name-asc", label: "Tên vai trò (A - Z)" },
  { value: "name-desc", label: "Tên vai trò (Z - A)" },
];

export const ROLE_USAGE_OPTIONS = [
  { value: "all", label: "Tất cả tình trạng gán" },
  { value: "assigned", label: "Đang có tài khoản" },
  { value: "unassigned", label: "Chưa gán tài khoản" },
];

export const ROLE_TYPE_CHIPS = [
  { id: "all", label: "Tất cả" },
  { id: "system", label: "Mặc định hệ thống" },
  { id: "custom", label: "Tùy chỉnh" },
];

export const ROLE_NAME_SUGGESTIONS = [
  "Thiết kế rập",
  "Thợ may",
  "Kiểm soát chất lượng",
  "Chăm sóc khách hàng",
  "Kế toán",
];

export const normalizeRoleNameInput = (value) =>
  String(value ?? "")
    .trim()
    .replace(/\s+/g, " ");

export const normalizeRoleCompareKey = (value) =>
  normalizeRoleNameInput(value).toUpperCase();

export const normalizeRoleCode = (value) =>
  normalizeRoleNameInput(value).replace(/\s+/g, "_").toUpperCase();

export const validateRoleName = (
  value,
  { disallowSystem = false, editingRoleId = null, currentRoleName = "" } = {},
) => {
  const raw = String(value ?? "");
  if (/[\r\n]/.test(raw)) {
    return "Tên vai trò không được chứa ký tự xuống dòng.";
  }

  const normalized = normalizeRoleNameInput(raw);
  const compareKey = normalized.toUpperCase();

  if (!normalized) {
    return "Vui lòng nhập tên vai trò.";
  }

  if (normalized.length < 2 || normalized.length > 50) {
    return "Tên vai trò phải có độ dài từ 2 đến 50 ký tự.";
  }

  if (!ROLE_NAME_REGEX.test(normalized)) {
    return "Tên vai trò phải bắt đầu bằng chữ cái hoặc số và không chứa ký tự đặc biệt không hợp lệ.";
  }

  if (disallowSystem && SYSTEM_ROLE_NAMES.includes(compareKey)) {
    return `Không thể sử dụng tên vai trò mặc định của hệ thống (${normalized}).`;
  }

  if (editingRoleId !== null && editingRoleId !== undefined) {
    const reservedSlot = RESERVED_NAME_SLOTS[compareKey];
    if (
      reservedSlot &&
      reservedSlot !== Number(editingRoleId) &&
      compareKey !== normalizeRoleCompareKey(currentRoleName)
    ) {
      return `Tên vai trò "${normalized}" chỉ dành cho vai trò mặc định tương ứng của hệ thống.`;
    }
  }

  return "";
};

export const isSystemRole = (role) => {
  if (!role) return false;
  if (typeof role === "object" && role.systemRole === true) return true;

  if (
    typeof role === "object" &&
    SYSTEM_ROLE_IDS.includes(Number(role.idRole))
  ) {
    return true;
  }

  const compareKey =
    typeof role === "string"
      ? normalizeRoleCompareKey(role)
      : normalizeRoleCompareKey(role.nameRole);

  return SYSTEM_ROLE_NAMES.includes(compareKey);
};

export const getRoleUserCount = (role) => {
  const count = Number(role?.userCount ?? 0);
  return Number.isFinite(count) && count >= 0 ? count : 0;
};

export const getRoleActiveUserCount = (role) => {
  const count = Number(role?.activeUserCount ?? 0);
  return Number.isFinite(count) && count >= 0 ? count : 0;
};

export const getRoleScopes = (role) => {
  if (!role || typeof role !== "object") return [];

  if (Array.isArray(role.scopes) && role.scopes.length > 0) {
    return role.scopes
      .map((item) => normalizeRoleNameInput(item))
      .filter(Boolean);
  }

  if (Array.isArray(role.permissions) && role.permissions.length > 0) {
    return role.permissions
      .map((perm) =>
        typeof perm === "string"
          ? normalizeRoleNameInput(perm)
          : normalizeRoleNameInput(perm?.name ?? perm?.code ?? ""),
      )
      .filter(Boolean);
  }

  return [];
};

export const canEditRole = (role) => Boolean(role);

export const canDeleteRole = (role, allRoles = []) => {
  if (!role || isSystemRole(role)) return false;

  if (Array.isArray(allRoles) && allRoles.length > 0) {
    return allRoles.some(
      (item) => Number(item?.idRole) !== Number(role.idRole),
    );
  }

  return true;
};

export const getRoleProfile = (roleOrName) => {
  const roleId =
    typeof roleOrName === "object" && roleOrName !== null
      ? (roleOrName.idRole ?? roleOrName.roleId)
      : null;
  const rawName =
    typeof roleOrName === "string"
      ? normalizeRoleNameInput(roleOrName)
      : normalizeRoleNameInput(roleOrName?.nameRole || "");
  const code = normalizeRoleCode(rawName);
  const resolved = resolveAppRole(rawName, roleId);
  const system =
    typeof roleOrName === "object"
      ? isSystemRole(roleOrName)
      : SYSTEM_ROLE_NAMES.includes(code);
  const dynamicDescription =
    typeof roleOrName === "object" && roleOrName !== null
      ? String(roleOrName.description ?? "").trim()
      : "";
  const dynamicScopes = getRoleScopes(roleOrName);

  if (resolved === APP_ROLE.ADMIN) {
    return {
      code: rawName || "ADMIN",
      label: !code || code === "ADMIN" ? "Quản trị viên" : rawName,
      description: dynamicDescription,
      badgeClassName:
        "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800",
      iconBgClassName:
        "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300",
      icon: ShieldCheck,
      isSystem: true,
      scopes: dynamicScopes,
    };
  }

  if (resolved === APP_ROLE.STAFF) {
    return {
      code: rawName || "STAFF",
      label: !code || code === "STAFF" ? "Nhân viên" : rawName,
      description: dynamicDescription,
      badgeClassName:
        "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800",
      iconBgClassName:
        "bg-sky-100 text-sky-700 dark:bg-sky-950/70 dark:text-sky-300",
      icon: Shield,
      isSystem: true,
      scopes: dynamicScopes,
    };
  }

  if (resolved === APP_ROLE.USER) {
    return {
      code: rawName || "USER",
      label: !code || code === "USER" ? "Khách hàng" : rawName,
      description: dynamicDescription,
      badgeClassName:
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
      iconBgClassName:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300",
      icon: UserRound,
      isSystem: true,
      scopes: dynamicScopes,
    };
  }

  return {
    code: rawName || "Vai trò tùy chỉnh",
    label: rawName || "Vai trò tùy chỉnh",
    description: dynamicDescription,
    badgeClassName:
      "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800",
    iconBgClassName:
      "bg-violet-100 text-violet-700 dark:bg-violet-950/70 dark:text-violet-300",
    icon: KeyRound,
    isSystem: system,
    scopes: dynamicScopes,
  };
};
