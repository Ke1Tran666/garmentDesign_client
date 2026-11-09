export {
  EMPTY_VALUE,
  formatActivityDate,
  formatDate,
  formatGender,
  formatTime,
  getInitials,
  getRoleName,
  getStatusInfo,
} from "./userUtils";

export const getProviderInfo = (providerValue) => {
  const provider = String(providerValue || "").toLowerCase();

  if (provider === "local") {
    return {
      label: "Local",
      className: "bg-info-soft text-info",
    };
  }

  if (provider === "google") {
    return {
      label: "Google",
      className: "bg-danger-soft text-danger",
    };
  }

  return {
    label: providerValue || "Không xác định",
    className: "bg-surface-muted text-text-muted",
  };
};

export const normalizeUserDetail = (data) => {
  const userData = data?.user;

  if (!userData) return null;

  return {
    ...userData,
    authProviders: Array.isArray(data.authProviders) ? data.authProviders : [],
    addresses: Array.isArray(data.addresses) ? data.addresses : [],
    defaultAddress: data.defaultAddress || userData.defaultAddress || null,
  };
};

export const createRecentActivities = (user) => {
  if (!user) return [];

  return [
    user.lastLogin
      ? {
          id: "last-login",
          date: user.lastLogin,
          title: "Đăng nhập gần nhất",
        }
      : null,
    user.updatedAt
      ? {
          id: "updated",
          date: user.updatedAt,
          title: "Cập nhật tài khoản",
        }
      : null,
    user.createdAt
      ? {
          id: "created",
          date: user.createdAt,
          title: "Tạo tài khoản",
        }
      : null,
  ]
    .filter(Boolean)
    .sort((first, second) => new Date(second.date) - new Date(first.date));
};
