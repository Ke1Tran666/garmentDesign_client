export const EMPTY_VALUE = "Chưa có dữ liệu";

export const formatDate = (value) => {
  if (!value) return EMPTY_VALUE;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
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

export const getInitials = (fullName) => {
  const normalizedName = String(fullName || "").trim();

  if (!normalizedName) return "U";

  const nameParts = normalizedName.split(/\s+/);

  if (nameParts.length === 1) {
    return nameParts[0].slice(0, 2).toUpperCase();
  }

  const firstName = nameParts[0];
  const lastName = nameParts[nameParts.length - 1];

  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

export const getRoleName = (user) => user?.role?.nameRole || "Chưa phân quyền";

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

export const getStatusInfo = (user) => {
  if (user?.deletedAt) {
    return {
      label: "Đã xóa",
      dotClassName: "bg-danger",
      badgeClassName: "bg-danger-soft text-danger",
    };
  }

  const status = String(user?.status || "").toLowerCase();

  if (status === "active") {
    return {
      label: "Hoạt động",
      dotClassName: "bg-success",
      badgeClassName: "bg-success-soft text-success",
    };
  }

  if (status === "pending") {
    return {
      label: "Chờ hoàn thiện",
      dotClassName: "bg-warning",
      badgeClassName: "bg-warning-soft text-warning",
    };
  }

  if (status === "inactive" || status === "banned") {
    return {
      label: "Đã khóa",
      dotClassName: "bg-danger",
      badgeClassName: "bg-danger-soft text-danger",
    };
  }

  return {
    label: status || "Không xác định",
    dotClassName: "bg-text-subtle",
    badgeClassName: "bg-surface-muted text-text-muted",
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
