export const APP_ROLE = {
  ADMIN: "admin",
  STAFF: "staff",
  USER: "user",
};

export const normalizeRole = (role) => {
  return String(role ?? "")
    .trim()
    .toLowerCase()
    .replace(/^role[_-]?/, "");
};

export const isAdminRole = ( role ) => {
  const normalizedRole = normalizeRole(role);

  return (
    normalizedRole === APP_ROLE.ADMIN || normalizedRole === APP_ROLE.STAFF
  );
};

export const getAccountPathByRole = (role) => {
  const normalizedRole =
    normalizeRole(role);

  if (normalizedRole === APP_ROLE.ADMIN || normalizedRole === APP_ROLE.STAFF) {
    return "/admin";
  }

  if (normalizedRole === APP_ROLE.USER) {
    return "/user";
  }

  return "/";
};