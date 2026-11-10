export const APP_ROLE = {
  ADMIN: "admin",
  STAFF: "staff",
  USER: "user",
};

export const SYSTEM_ROLE_ID = {
  ADMIN: 1,
  STAFF: 2,
  USER: 3,
};

export const normalizeRole = (role) => {
  return String(role ?? "")
    .trim()
    .toLowerCase()
    .replace(/^role[_-]?/, "");
};

export const resolveAppRole = (roleOrUser, explicitRoleId = null) => {
  const roleId =
    typeof roleOrUser === "object" && roleOrUser !== null
      ? (roleOrUser.roleId ??
        roleOrUser.idRole ??
        roleOrUser.role?.idRole ??
        explicitRoleId)
      : explicitRoleId;

  const numericRoleId = Number(roleId);
  if (numericRoleId === SYSTEM_ROLE_ID.ADMIN) return APP_ROLE.ADMIN;
  if (numericRoleId === SYSTEM_ROLE_ID.STAFF) return APP_ROLE.STAFF;
  if (numericRoleId === SYSTEM_ROLE_ID.USER) return APP_ROLE.USER;

  const rawRole =
    typeof roleOrUser === "object" && roleOrUser !== null
      ? (roleOrUser.role?.nameRole ??
        roleOrUser.role ??
        roleOrUser.roleName ??
        roleOrUser.nameRole ??
        "")
      : roleOrUser;

  return normalizeRole(rawRole);
};

export const isAdminRole = (roleOrUser, explicitRoleId = null) => {
  const resolvedRole = resolveAppRole(roleOrUser, explicitRoleId);

  return resolvedRole === APP_ROLE.ADMIN || resolvedRole === APP_ROLE.STAFF;
};

export const getAccountPathByRole = (roleOrUser, explicitRoleId = null) => {
  const resolvedRole = resolveAppRole(roleOrUser, explicitRoleId);

  if (resolvedRole === APP_ROLE.ADMIN || resolvedRole === APP_ROLE.STAFF) {
    return "/admin";
  }

  if (resolvedRole === APP_ROLE.USER) {
    return "/user";
  }

  return "/";
};
