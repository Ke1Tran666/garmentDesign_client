export { useRoleManagement } from "./hooks/useRoleManagement";
export {
  PAGE_SIZE,
  RESERVED_NAME_SLOTS,
  ROLE_NAME_REGEX,
  ROLE_NAME_SUGGESTIONS,
  ROLE_SORT_OPTIONS,
  ROLE_TYPE_CHIPS,
  ROLE_USAGE_OPTIONS,
  SYSTEM_ROLE_IDS,
  SYSTEM_ROLE_NAMES,
  canDeleteRole,
  canEditRole,
  getRoleActiveUserCount,
  getRoleProfile,
  getRoleScopes,
  getRoleUserCount,
  isSystemRole,
  normalizeRoleCode,
  normalizeRoleCompareKey,
  normalizeRoleNameInput,
  validateRoleName,
} from "./lib/roleUtils";
export { default as RoleCardItem } from "./ui/RoleCardItem";
export { default as RoleDeleteModal } from "./ui/RoleDeleteModal";
export { default as RoleDetailEditModal } from "./ui/RoleDetailEditModal";
export { default as RoleGridView } from "./ui/RoleGridView";
export { default as RoleStatsCards } from "./ui/RoleStatsCards";
export { default as RoleTableView } from "./ui/RoleTableView";
export { default as RoleToolbar } from "./ui/RoleToolbar";
