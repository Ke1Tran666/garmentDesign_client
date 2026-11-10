import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNotification } from "@/app/providers/NotificationProvider";
import { userApi } from "@/entities/user/api/userApi";
import { normalizeRole, resolveAppRole } from "@/features/auth/lib/authRole";
import { exportToExcel } from "@/shared/lib/exportUtils";

import {
  formatDate,
  getRoleBadge,
  getRoleName,
  getStatusInfo,
  getUserContact,
  getUserStatusValue,
  PAGE_SIZE,
} from "../lib/userUtils";

export const useUserManagement = ({
  adminUser,
  searchKeyword = "",
  initialRoleFilter = "all",
} = {}) => {
  const { showNotification } = useNotification();
  const isAdmin = resolveAppRole(adminUser) === "admin";
  const currentUserId = adminUser?.idUser || null;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [localSearch, setLocalSearch] = useState("");
  const deferredSearch = useDeferredValue(localSearch || searchKeyword);

  const [roleFilter, setRoleFilter] = useState(
    () => initialRoleFilter || "all",
  );
  const [prevInitialRole, setPrevInitialRole] = useState(initialRoleFilter);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("table");
  const [currentPage, setCurrentPage] = useState(1);

  if (prevInitialRole !== initialRoleFilter) {
    setPrevInitialRole(initialRoleFilter);
    setRoleFilter(initialRoleFilter || "all");
    setCurrentPage(1);
  }

  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [removingUser, setRemovingUser] = useState(null);
  const [removing, setRemoving] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await userApi.getAll({ forceRefresh: true });
      setUsers(Array.isArray(data) ? data : []);
      showNotification({
        type: "success",
        title: "Làm mới thành công",
        message: "Danh sách người dùng đã được đồng bộ từ máy chủ.",
      });
    } catch (error) {
      showNotification({
        type: "error",
        title: "Lỗi tải dữ liệu",
        message:
          error.response?.data?.message ||
          "Không thể tải danh sách người dùng.",
      });
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    let active = true;

    userApi
      .getAll()
      .then((data) => {
        if (!active) return;
        setUsers(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!active) return;
        setUsers([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const roleOptions = useMemo(() => {
    const distinctRoles = Array.from(
      new Set(
        users
          .map((u) => u?.role?.nameRole)
          .filter((name) => Boolean(name && String(name).trim())),
      ),
    );

    if (
      roleFilter &&
      roleFilter !== "all" &&
      roleFilter !== "internal" &&
      !distinctRoles.some((r) => normalizeRole(r) === normalizeRole(roleFilter))
    ) {
      distinctRoles.push(roleFilter);
    }

    return [
      { value: "all", label: "Tất cả vai trò" },
      { value: "internal", label: "Quản trị & Nhân viên" },
      ...distinctRoles.map((role) => {
        const badge = getRoleBadge(role);
        return {
          value: role,
          label:
            badge.label.toLowerCase() === String(role).toLowerCase()
              ? role
              : `${badge.label} (${role})`,
        };
      }),
    ];
  }, [users, roleFilter]);

  const stats = useMemo(() => {
    const total = users.length;
    let customerCount = 0;
    let staffCount = 0;
    let activeCount = 0;
    let lockedCount = 0;
    let deletedCount = 0;

    users.forEach((u) => {
      const normRole = resolveAppRole(u?.role);
      if (normRole === "admin" || normRole === "staff") {
        staffCount += 1;
      } else {
        customerCount += 1;
      }

      const st = getUserStatusValue(u);
      if (st === "active") activeCount += 1;
      else if (st === "inactive") lockedCount += 1;
      else if (st === "deleted") deletedCount += 1;
    });

    const disabledCount = lockedCount + deletedCount;
    const customerRate =
      total > 0 ? Math.round((customerCount / total) * 100) : 0;

    return {
      total,
      customerCount,
      customerRate,
      staffCount,
      activeCount,
      lockedCount,
      deletedCount,
      disabledCount,
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const keyword = deferredSearch.trim().toLowerCase();

    const result = users.filter((user) => {
      const roleName = getRoleName(user);
      const roleBadge = getRoleBadge(user);
      const statusInfo = getStatusInfo(user);
      const statusVal = statusInfo.code;
      const contact = getUserContact(user);

      const matchesKeyword =
        !keyword ||
        [
          user.idUser,
          user.userCode,
          user.fullName,
          contact.email,
          contact.phone,
          roleName,
          roleBadge.label,
          statusInfo.label,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(keyword);

      const resolvedRole = resolveAppRole(user?.role);
      const normRole = normalizeRole(roleName);
      const matchesRole =
        roleFilter === "all"
          ? true
          : roleFilter === "internal"
            ? resolvedRole === "admin" || resolvedRole === "staff"
            : normRole === normalizeRole(roleFilter) ||
              (normalizeRole(roleFilter) === "user" && resolvedRole === "user");

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "disabled"
            ? statusVal === "inactive" || statusVal === "deleted"
            : statusVal === statusFilter;

      return matchesKeyword && matchesRole && matchesStatus;
    });

    result.sort((a, b) => {
      if (sortBy === "oldest") {
        return (
          new Date(a.createdAt || 0).getTime() -
          new Date(b.createdAt || 0).getTime()
        );
      }

      if (sortBy === "name-asc") {
        return (a.fullName || "").localeCompare(b.fullName || "", "vi");
      }

      if (sortBy === "name-desc") {
        return (b.fullName || "").localeCompare(a.fullName || "", "vi");
      }

      if (sortBy === "last-login") {
        return (
          new Date(b.lastLogin || 0).getTime() -
          new Date(a.lastLogin || 0).getTime()
        );
      }

      return (
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
      );
    });

    return result;
  }, [users, deferredSearch, roleFilter, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const visibleUsers = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, safeCurrentPage]);

  const isAllCurrentSelected = useMemo(() => {
    if (visibleUsers.length === 0) return false;
    return visibleUsers.every((u) => selectedIds.has(u.idUser));
  }, [visibleUsers, selectedIds]);

  const toggleSelectItem = useCallback((userId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (isAllCurrentSelected) {
        visibleUsers.forEach((u) => next.delete(u.idUser));
      } else {
        visibleUsers.forEach((u) => next.add(u.idUser));
      }
      return next;
    });
  }, [visibleUsers, isAllCurrentSelected]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleSearchChange = useCallback((value) => {
    setLocalSearch(value);
    setCurrentPage(1);
  }, []);

  const handleRoleFilterChange = useCallback((value) => {
    setRoleFilter(value);
    setCurrentPage(1);
  }, []);

  const handleStatusFilterChange = useCallback((value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((value) => {
    setSortBy(value);
    setCurrentPage(1);
  }, []);

  const applyQuickFilter = useCallback(
    ({ role = "all", status = "all" } = {}) => {
      setRoleFilter(role);
      setStatusFilter(status);
      setCurrentPage(1);
    },
    [],
  );

  const resetFilters = useCallback(() => {
    setLocalSearch("");
    setRoleFilter("all");
    setStatusFilter("all");
    setSortBy("newest");
    setCurrentPage(1);
  }, []);

  const handleExport = useCallback(
    (explicitList) => {
      const targetUsers = Array.isArray(explicitList)
        ? explicitList
        : selectedIds.size > 0
          ? users.filter((u) => selectedIds.has(u.idUser))
          : filteredUsers;

      const dataToExport = targetUsers.map((u) => {
        const contact = getUserContact(u);
        return {
          "Mã người dùng": u.userCode || u.idUser,
          "Họ và tên": u.fullName || "Chưa đặt tên",
          Email: contact.email || "---",
          "Số điện thoại": contact.phone || "---",
          "Vai trò": getRoleName(u),
          "Trạng thái": getStatusInfo(u).label,
          "Đăng nhập gần nhất": formatDate(u.lastLogin, true, "Chưa đăng nhập"),
          "Ngày tham gia": formatDate(u.createdAt, true, "Chưa có"),
        };
      });

      const success = exportToExcel(
        dataToExport,
        "Danh_Sach_Nguoi_Dung",
        "Users",
      );

      if (success) {
        showNotification({
          type: "success",
          title: "Xuất file Excel thành công",
          message: `Đã xuất ${dataToExport.length} người dùng ra file Excel.`,
        });
      }
    },
    [selectedIds, users, filteredUsers, showNotification],
  );

  const confirmRemove = useCallback(async () => {
    if (!removingUser || removingUser.idUser === currentUserId) return;

    try {
      setRemoving(true);
      await userApi.remove(removingUser.idUser);

      setUsers((current) =>
        current.map((u) =>
          u.idUser === removingUser.idUser
            ? { ...u, status: "delete", deletedAt: new Date().toISOString() }
            : u,
        ),
      );

      setSelectedIds((prev) => {
        if (!prev.has(removingUser.idUser)) return prev;
        const next = new Set(prev);
        next.delete(removingUser.idUser);
        return next;
      });

      setRemovingUser(null);
      showNotification({
        type: "success",
        title: "Đã xóa người dùng",
        message: "Tài khoản người dùng đã bị vô hiệu hóa thành công.",
      });
    } catch (error) {
      showNotification({
        type: "error",
        title: "Xóa thất bại",
        message:
          error.response?.data?.message || "Không thể xóa người dùng này.",
      });
    } finally {
      setRemoving(false);
    }
  }, [removingUser, currentUserId, showNotification]);

  return {
    isAdmin,
    currentUserId,
    users,
    loading,
    localSearch,
    roleFilter,
    statusFilter,
    sortBy,
    viewMode,
    setViewMode,
    currentPage: safeCurrentPage,
    setCurrentPage,
    totalPages,
    stats,
    roleOptions,
    filteredUsers,
    visibleUsers,
    selectedIds,
    selectedCount: selectedIds.size,
    isAllCurrentSelected,
    removingUser,
    setRemovingUser,
    removing,
    fetchUsers,
    toggleSelectItem,
    toggleSelectAll,
    clearSelection,
    handleSearchChange,
    handleRoleFilterChange,
    handleStatusFilterChange,
    handleSortChange,
    applyQuickFilter,
    resetFilters,
    handleExport,
    confirmRemove,
  };
};

export default useUserManagement;
