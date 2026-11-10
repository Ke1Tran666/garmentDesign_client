import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNotification } from "@/app/providers/NotificationProvider";
import { roleApi } from "@/entities/user/api/roleApi";
import { userApi } from "@/entities/user/api/userApi";
import { APP_ROLE, resolveAppRole } from "@/features/auth/lib/authRole";
import { exportToExcel } from "@/shared/lib/exportUtils";

import {
  getRoleActiveUserCount,
  getRoleProfile,
  getRoleUserCount,
  isSystemRole,
  normalizeRoleCompareKey,
  PAGE_SIZE,
} from "../lib/roleUtils";

export const useRoleManagement = ({
  adminUser,
  searchKeyword = "",
  refreshSession,
} = {}) => {
  const { showNotification } = useNotification();
  const isAdmin = resolveAppRole(adminUser) === APP_ROLE.ADMIN;

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [localSearch, setLocalSearch] = useState("");
  const deferredSearch = useDeferredValue(localSearch || searchKeyword);

  const [typeFilter, setTypeFilter] = useState("all");
  const [usageFilter, setUsageFilter] = useState("all");
  const [sortBy, setSortBy] = useState("id-asc");
  const [viewMode, setViewMode] = useState("table");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedIds, setSelectedIds] = useState(() => new Set());

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("view");
  const [activeRole, setActiveRole] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [assignedUsers, setAssignedUsers] = useState([]);
  const [assignedUsersLoading, setAssignedUsersLoading] = useState(false);

  const [removingRole, setRemovingRoleState] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const setRemovingRole = useCallback((role) => {
    setDeleteError("");
    setRemovingRoleState(role);
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      const data = await roleApi.getAll({ forceRefresh: true });
      setRoles(Array.isArray(data) ? data : []);
      showNotification({
        type: "success",
        title: "Làm mới thành công",
        message: "Danh sách vai trò đã được đồng bộ từ máy chủ.",
      });
    } catch (error) {
      showNotification({
        type: "error",
        title: "Lỗi tải dữ liệu",
        message:
          error.response?.data?.message || "Không thể tải danh sách vai trò.",
      });
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    let active = true;

    roleApi
      .getAll()
      .then((data) => {
        if (active) {
          setRoles(Array.isArray(data) ? data : []);
        }
      })
      .catch(() => {
        if (active) setRoles([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const total = roles.length;
    let systemCount = 0;
    let customCount = 0;
    let totalAssignedUsers = 0;
    let totalActiveUsers = 0;
    let unusedCount = 0;

    roles.forEach((role) => {
      if (isSystemRole(role)) systemCount += 1;
      else customCount += 1;

      const userCount = getRoleUserCount(role);
      const activeCount = getRoleActiveUserCount(role);
      totalAssignedUsers += userCount;
      totalActiveUsers += activeCount;

      if (userCount === 0) unusedCount += 1;
    });

    return {
      total,
      systemCount,
      customCount,
      totalAssignedUsers,
      totalActiveUsers,
      unusedCount,
    };
  }, [roles]);

  const filteredRoles = useMemo(() => {
    const keyword = deferredSearch.trim().toLowerCase();

    const result = roles.filter((role) => {
      const profile = getRoleProfile(role);
      const system = isSystemRole(role);
      const userCount = getRoleUserCount(role);

      const matchesKeyword =
        !keyword ||
        [
          String(role.idRole ?? ""),
          role.nameRole,
          profile.label,
          profile.description,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(keyword);

      const matchesType =
        typeFilter === "all"
          ? true
          : typeFilter === "system"
            ? system
            : !system;

      const matchesUsage =
        usageFilter === "all"
          ? true
          : usageFilter === "assigned"
            ? userCount > 0
            : userCount === 0;

      return matchesKeyword && matchesType && matchesUsage;
    });

    result.sort((a, b) => {
      if (sortBy === "id-desc") {
        return Number(b.idRole ?? 0) - Number(a.idRole ?? 0);
      }

      if (sortBy === "users-desc") {
        const diff = getRoleUserCount(b) - getRoleUserCount(a);
        return diff !== 0
          ? diff
          : Number(a.idRole ?? 0) - Number(b.idRole ?? 0);
      }

      if (sortBy === "name-asc") {
        return String(a.nameRole || "").localeCompare(
          String(b.nameRole || ""),
          "vi",
        );
      }

      if (sortBy === "name-desc") {
        return String(b.nameRole || "").localeCompare(
          String(a.nameRole || ""),
          "vi",
        );
      }

      return Number(a.idRole ?? 0) - Number(b.idRole ?? 0);
    });

    return result;
  }, [roles, deferredSearch, typeFilter, usageFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredRoles.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const visibleRoles = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredRoles.slice(start, start + PAGE_SIZE);
  }, [filteredRoles, safeCurrentPage]);

  const isAllCurrentSelected = useMemo(() => {
    if (visibleRoles.length === 0) return false;
    return visibleRoles.every((role) => selectedIds.has(role.idRole));
  }, [visibleRoles, selectedIds]);

  const toggleSelectItem = useCallback((roleId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(roleId)) {
        next.delete(roleId);
      } else {
        next.add(roleId);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (isAllCurrentSelected) {
        visibleRoles.forEach((role) => next.delete(role.idRole));
      } else {
        visibleRoles.forEach((role) => next.add(role.idRole));
      }
      return next;
    });
  }, [visibleRoles, isAllCurrentSelected]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleSearchChange = useCallback((value) => {
    setLocalSearch(value);
    setCurrentPage(1);
  }, []);

  const handleTypeFilterChange = useCallback((value) => {
    setTypeFilter(value);
    setCurrentPage(1);
  }, []);

  const handleUsageFilterChange = useCallback((value) => {
    setUsageFilter(value);
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((value) => {
    setSortBy(value);
    setCurrentPage(1);
  }, []);

  const applyQuickFilter = useCallback(
    ({ type = "all", usage = "all" } = {}) => {
      setTypeFilter(type);
      setUsageFilter(usage);
      setCurrentPage(1);
    },
    [],
  );

  const resetFilters = useCallback(() => {
    setLocalSearch("");
    setTypeFilter("all");
    setUsageFilter("all");
    setSortBy("id-asc");
    setCurrentPage(1);
  }, []);

  const loadAssignedUsersPreview = useCallback((role) => {
    if (!role?.idRole) {
      setAssignedUsers([]);
      setAssignedUsersLoading(false);
      return;
    }

    setAssignedUsersLoading(true);
    userApi
      .getAll()
      .then((users) => {
        const list = Array.isArray(users) ? users : [];
        const matched = list.filter(
          (u) => Number(u?.role?.idRole) === Number(role.idRole),
        );
        setAssignedUsers(matched);
      })
      .catch(() => {
        setAssignedUsers([]);
      })
      .finally(() => {
        setAssignedUsersLoading(false);
      });
  }, []);

  const openCreateModal = useCallback(() => {
    setActiveRole(null);
    setModalMode("create");
    setFormError("");
    setAssignedUsers([]);
    setAssignedUsersLoading(false);
    setModalOpen(true);
  }, []);

  const openViewModal = useCallback(
    (role) => {
      setActiveRole(role);
      setModalMode("view");
      setFormError("");
      setModalOpen(true);
      loadAssignedUsersPreview(role);
    },
    [loadAssignedUsersPreview],
  );

  const openEditModal = useCallback(
    (role) => {
      if (!role) return;
      setActiveRole(role);
      setModalMode("edit");
      setFormError("");
      setModalOpen(true);
      loadAssignedUsersPreview(role);
    },
    [loadAssignedUsersPreview],
  );

  const closeModal = useCallback(() => {
    if (submitting) return;
    setModalOpen(false);
    setActiveRole(null);
    setFormError("");
    setAssignedUsers([]);
  }, [submitting]);

  const saveRole = useCallback(
    async (payload, onSuccess) => {
      try {
        setSubmitting(true);
        setFormError("");

        if (modalMode === "create") {
          const created = await roleApi.create(payload);
          setRoles((prev) =>
            [...prev, created].sort(
              (a, b) => Number(a.idRole ?? 0) - Number(b.idRole ?? 0),
            ),
          );
          setModalOpen(false);
          setActiveRole(null);
          showNotification({
            type: "success",
            title: "Tạo vai trò thành công",
            message: `Đã thêm vai trò "${created?.nameRole || payload.nameRole}" vào hệ thống.`,
          });
          onSuccess?.(created);
          return;
        }

        if (activeRole?.idRole) {
          const updated = await roleApi.update(activeRole.idRole, payload);
          setRoles((prev) =>
            prev.map((item) =>
              item.idRole === activeRole.idRole ? updated : item,
            ),
          );
          setActiveRole(updated);

          const updatedCurrentUserRole =
            Number(adminUser?.roleId) === Number(activeRole.idRole) ||
            normalizeRoleCompareKey(adminUser?.role) ===
              normalizeRoleCompareKey(activeRole.nameRole);

          if (updatedCurrentUserRole && refreshSession) {
            await refreshSession().catch(() => {});
          }

          showNotification({
            type: "success",
            title: "Cập nhật thành công",
            message: `Đã cập nhật vai trò "${updated?.nameRole || payload.nameRole}".`,
          });
          onSuccess?.(updated);
        }
      } catch (error) {
        setFormError(
          error.response?.data?.message ||
            "Không thể lưu thông tin vai trò. Vui lòng thử lại.",
        );
      } finally {
        setSubmitting(false);
      }
    },
    [modalMode, activeRole, adminUser, refreshSession, showNotification],
  );

  const confirmRemove = useCallback(
    async (replacementRoleId) => {
      if (!removingRole) return;

      if (!replacementRoleId) {
        setDeleteError("Vui lòng chọn vai trò thay thế trước khi xóa.");
        return;
      }

      try {
        setRemoving(true);
        setDeleteError("");

        const targetId = Number(replacementRoleId);
        await roleApi.remove(removingRole.idRole, targetId);

        const deletedId = removingRole.idRole;
        const deletedName = removingRole.nameRole;
        const migratedUsers = getRoleUserCount(removingRole);
        const migratedActive = getRoleActiveUserCount(removingRole);
        const targetRole = roles.find(
          (item) => Number(item.idRole) === targetId,
        );

        setRoles((prev) =>
          prev
            .filter((item) => item.idRole !== deletedId)
            .map((item) =>
              Number(item.idRole) === targetId
                ? {
                    ...item,
                    userCount: getRoleUserCount(item) + migratedUsers,
                    activeUserCount:
                      getRoleActiveUserCount(item) + migratedActive,
                  }
                : item,
            ),
        );

        setSelectedIds((prev) => {
          if (!prev.has(deletedId)) return prev;
          const next = new Set(prev);
          next.delete(deletedId);
          return next;
        });

        if (activeRole?.idRole === deletedId) {
          setModalOpen(false);
          setActiveRole(null);
        }

        try {
          const latestRoles = await roleApi.getAll({ forceRefresh: true });
          if (
            Array.isArray(latestRoles) &&
            !latestRoles.some(
              (item) => Number(item.idRole) === Number(deletedId),
            )
          ) {
            setRoles(latestRoles);
          }
        } catch {
          // Giữ trạng thái đã đồng bộ cục bộ nếu lần tải lại thất bại tạm thời
        }

        setRemovingRoleState(null);
        showNotification({
          type: "success",
          title: "Đã xóa vai trò",
          message:
            migratedUsers > 0
              ? `Đã xóa vai trò "${deletedName}" và chuyển ${migratedUsers} tài khoản sang "${targetRole?.nameRole || `#${targetId}`}".`
              : `Vai trò "${deletedName}" đã được xóa khỏi hệ thống (thay thế: "${targetRole?.nameRole || `#${targetId}`}").`,
        });
      } catch (error) {
        const message =
          error.response?.data?.message || "Không thể xóa vai trò này.";
        setDeleteError(message);
        showNotification({
          type: "error",
          title: "Xóa thất bại",
          message,
        });
      } finally {
        setRemoving(false);
      }
    },
    [removingRole, roles, activeRole, showNotification],
  );

  const handleExport = useCallback(
    (explicitList) => {
      const targetRoles = Array.isArray(explicitList)
        ? explicitList
        : selectedIds.size > 0
          ? roles.filter((role) => selectedIds.has(role.idRole))
          : filteredRoles;

      const dataToExport = targetRoles.map((role) => {
        const profile = getRoleProfile(role);
        return {
          "ID Vai trò": role.idRole,
          "Tên vai trò": role.nameRole,
          "Tên hiển thị": profile.label,
          "Phân loại": isSystemRole(role) ? "Mặc định hệ thống" : "Tùy chỉnh",
          "Mô tả": profile.description,
          "Số tài khoản": getRoleUserCount(role),
          "Tài khoản hoạt động/khả dụng": getRoleActiveUserCount(role),
          "Phạm vi quyền hạn": "Đang phát triển",
        };
      });

      const success = exportToExcel(dataToExport, "Danh_Sach_Vai_Tro", "Roles");

      if (success) {
        showNotification({
          type: "success",
          title: "Xuất file Excel thành công",
          message: `Đã xuất ${dataToExport.length} vai trò ra file Excel.`,
        });
      }
    },
    [selectedIds, roles, filteredRoles, showNotification],
  );

  return {
    isAdmin,
    roles,
    loading,
    submitting,
    removing,
    deleteError,
    localSearch,
    typeFilter,
    usageFilter,
    sortBy,
    viewMode,
    setViewMode,
    currentPage: safeCurrentPage,
    setCurrentPage,
    totalPages,
    stats,
    filteredRoles,
    visibleRoles,
    selectedIds,
    selectedCount: selectedIds.size,
    isAllCurrentSelected,
    modalOpen,
    modalMode,
    activeRole,
    formError,
    setFormError,
    assignedUsers,
    assignedUsersLoading,
    removingRole,
    setRemovingRole,
    fetchRoles,
    toggleSelectItem,
    toggleSelectAll,
    clearSelection,
    handleSearchChange,
    handleTypeFilterChange,
    handleUsageFilterChange,
    handleSortChange,
    applyQuickFilter,
    resetFilters,
    openCreateModal,
    openViewModal,
    openEditModal,
    closeModal,
    saveRole,
    confirmRemove,
    handleExport,
  };
};

export default useRoleManagement;
