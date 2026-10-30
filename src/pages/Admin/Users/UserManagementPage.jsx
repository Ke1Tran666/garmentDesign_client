import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Eye, MoreVertical, Trash2, UserPlus, UserRound } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";

import defaultAvatar from "@/shared/assets/images/avatar-default.jpg";
import { userApi } from "@/entities/user/api/userApi";
import { normalizeRole } from "@/features/auth/lib/authRole";
import { useNotification } from "@/app/providers/NotificationProvider";
import ConfirmModal from "@/shared/ui/modal/ConfirmModal";
import Pagination from "@/shared/ui/table/Pagination";
import { exportToExcel } from "@/shared/lib/exportUtils";

const PAGE_SIZE = 12;

const formatDate = (value) => {
  if (!value) return "Chưa có";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

const getRoleName = (user) => user?.role?.nameRole || "Chưa phân quyền";

const getStatusInfo = (user) => {
  if (user?.deletedAt) {
    return {
      label: "Đã xóa",
      className: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900",
      dot: "bg-rose-500",
    };
  }

  const status = String(user?.status || "").toLowerCase();
  if (status === "active") {
    return {
      label: "Hoạt động",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900",
      dot: "bg-emerald-500",
    };
  }

  if (status === "pending") {
    return {
      label: "Chờ hoàn thiện",
      className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900",
      dot: "bg-amber-500",
    };
  }

  if (status === "banned" || status === "inactive") {
    return {
      label: "Đã khóa",
      className: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
      dot: "bg-slate-400",
    };
  }

  return {
    label: status || "Không xác định",
    className: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
    dot: "bg-slate-400",
  };
};

const getRoleBadge = (roleName) => {
  const norm = normalizeRole(roleName);
  if (norm === "admin") {
    return {
      label: "Quản trị viên",
      className: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800",
      icon: ShieldCheck,
    };
  }
  if (norm === "staff") {
    return {
      label: "Nhân viên",
      className: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800",
      icon: Shield,
    };
  }
  return {
    label: "Khách hàng",
    className: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    icon: UserRound,
  };
};

const UserManagementPage = () => {
  const { adminUser, searchKeyword = "" } = useOutletContext() || {};
  const { showNotification } = useNotification();
  const isAdmin = normalizeRole(adminUser?.role) === "admin";

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [localSearch, setLocalSearch] = useState("");
  const deferredSearch = useDeferredValue(localSearch || searchKeyword);

  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Row selection for batch export
  const [selectedIds, setSelectedIds] = useState([]);

  // Action menu / Modal states
  const [removingUser, setRemovingUser] = useState(null);
  const [removing, setRemoving] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    userApi
      .getAll()
      .then((data) => {
        setUsers(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        setUsers([]);
        showNotification({
          type: "error",
          title: "Lỗi tải dữ liệu",
          message: error.response?.data?.message || "Không thể tải danh sách người dùng.",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

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

  // Compute available roles
  const availableRoles = useMemo(() => {
    return Array.from(new Set(users.map((u) => getRoleName(u)).filter(Boolean)));
  }, [users]);

  // Compute Metric Stats
  const stats = useMemo(() => {
    const total = users.length;
    let customerCount = 0;
    let staffCount = 0;
    let inactiveCount = 0;

    users.forEach((u) => {
      const norm = normalizeRole(getRoleName(u));
      if (norm === "admin" || norm === "staff") staffCount++;
      else customerCount++;

      const st = String(u.status || "").toLowerCase();
      if (st === "banned" || st === "inactive" || u.deletedAt) inactiveCount++;
    });

    return { total, customerCount, staffCount, inactiveCount };
  }, [users]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    const keyword = deferredSearch.trim().toLowerCase();

    return users.filter((user) => {
      const role = getRoleName(user);
      const status = getStatusInfo(user);

      const matchesKeyword =
        !keyword ||
        [user.idUser, user.userCode, user.fullName, user.email, user.phone, role, status.label]
          .join(" ")
          .toLowerCase()
          .includes(keyword);

      const matchesRole =
        roleFilter === "all" || normalizeRole(role) === normalizeRole(roleFilter);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "deleted"
          ? Boolean(user.deletedAt)
          : !user.deletedAt && String(user.status || "").toLowerCase() === statusFilter);

      return matchesKeyword && matchesRole && matchesStatus;
    });
  }, [users, deferredSearch, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const visibleUsers = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, safeCurrentPage]);

  // Selection handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(visibleUsers.map((u) => u.idUser));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Export
  const handleExport = () => {
    const targetUsers =
      selectedIds.length > 0
        ? users.filter((u) => selectedIds.includes(u.idUser))
        : filteredUsers;

    const dataToExport = targetUsers.map((u) => ({
      "Mã User": u.userCode || u.idUser,
      "Họ và tên": u.fullName || "Chưa đặt",
      "Email": u.email || "---",
      "Số điện thoại": u.phone || "---",
      "Vai trò": getRoleName(u),
      "Trạng thái": getStatusInfo(u).label,
      "Ngày tạo": formatDate(u.createdAt),
    }));

    const success = exportToExcel(dataToExport, "Danh_Sach_Nguoi_Dung", "Users");
    if (success) {
      showNotification({
        type: "success",
        title: "Xuất file Excel thành công",
        message: `Đã xuất ${dataToExport.length} người dùng ra file Excel.`,
      });
    }
  };

  // Delete User
  const confirmRemove = async () => {
    if (!removingUser) return;
    try {
      setRemoving(true);
      await userApi.remove(removingUser.idUser);
      setUsers((current) =>
        current.map((u) =>
          u.idUser === removingUser.idUser
            ? { ...u, status: "delete", deletedAt: new Date().toISOString() }
            : u
        )
      );
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
        message: error.response?.data?.message || "Không thể xóa người dùng này.",
      });
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* =========================================
          PAGE HEADER & CALL TO ACTION
          ========================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Quản lý người dùng
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {filteredUsers.length} tài khoản
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Xem danh sách, phân quyền vai trò và quản lý tình trạng tài khoản toàn hệ thống.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors shadow-xs"
            title="Tải lại danh sách"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-brand" : "text-slate-400"} />
            <span className="hidden sm:inline">Làm mới</span>
          </button>

          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors shadow-xs"
            title="Xuất file Excel"
          >
            <Download size={14} className="text-slate-400" />
            <span>Xuất Excel</span>
          </button>

          {isAdmin && (
            <Link
              to="/admin/users/create"
              className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-brand text-white text-xs font-semibold hover:bg-brand-hover shadow-xs transition-colors"
            >
              <UserPlus size={15} />
              <span>Thêm người dùng</span>
            </Link>
          )}
        </div>
      </div>

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <PageHeading
            title="Quản lý người dùng"
            description="Xem và quản lý tài khoản trong hệ thống."
          />

          <div className="flex flex-wrap items-center gap-3">
            <CountBadge
              count={filteredUsers.length}
              label="người dùng"
              icon={UserRound}
            />

            {isAdmin && (
              <button
                type="button"
                onClick={() => navigate("/admin/users/create")}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand! px-4 text-sm font-semibold text-white transition hover:opacity-90"
              >
                <UserPlus size={18} />
                Thêm người dùng
              </button>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Quản trị & Nhân viên
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <ShieldCheck size={17} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {stats.staffCount}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Tài khoản bị khóa
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
              <ShieldAlert size={17} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {stats.inactiveCount}
          </div>
        </div>
      </div>

      {/* =========================================
          SEARCH & FILTER TOOLBAR
          ========================================= */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm theo tên, email, số điện thoại hoặc mã user..."
              className="w-full h-10 pl-9.5 pr-8 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/10 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 transition-all"
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => {
                  setLocalSearch("");
                  setCurrentPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

            <FilterSelect
              value={roleFilter}
              ariaLabel="Lọc người dùng theo vai trò"
              options={[
                {
                  value: "all",
                  label: "Tất cả vai trò",
                },
                ...availableRoles.map((role) => ({
                  value: role,
                  label: role,
                })),
              ]}
              onValueChange={(value) => {
                setRoleFilter(value);
                setCurrentPage(1);
              }}
            />

        {/* Status Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-medium text-slate-400 mr-1">Trạng thái:</span>
          {[
            { id: "all", label: "Tất cả" },
            { id: "active", label: "Hoạt động" },
            { id: "pending", label: "Chờ hoàn thiện" },
            { id: "inactive", label: "Đã khóa" },
            { id: "deleted", label: "Đã xóa" },
          ].map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => {
                setStatusFilter(chip.id);
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === chip.id
                  ? "bg-brand text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* =========================================
          MAIN USERS TABLE
          ========================================= */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-220 text-left">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800/40 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={
                      visibleUsers.length > 0 &&
                      visibleUsers.every((u) => selectedIds.includes(u.idUser))
                    }
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-brand focus:ring-brand/20 h-4 w-4"
                  />
                </th>
                <th className="px-4 py-3.5">Người dùng</th>
                <th className="px-4 py-3.5">Mã người dùng</th>
                <th className="px-4 py-3.5">Vai trò</th>
                <th className="px-4 py-3.5">Trạng thái</th>
                <th className="px-4 py-3.5">Ngày tham gia</th>
                <th className="px-4 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-brand" />
                    Đang tải danh sách người dùng...
                  </td>
                </tr>
              ) : visibleUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Users size={32} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    <p className="font-semibold text-slate-600 dark:text-slate-300">
                      Không tìm thấy người dùng nào phù hợp
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Thử đổi từ khóa tìm kiếm hoặc đặt lại các bộ lọc.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setLocalSearch("");
                        setRoleFilter("all");
                        setStatusFilter("all");
                      }}
                      className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
                    >
                      Xóa toàn bộ bộ lọc
                    </button>
                  </td>
                </tr>
              ) : (
                visibleUsers.map((user) => {
                  const roleName = getRoleName(user);
                  const roleBadge = getRoleBadge(roleName);
                  const statusInfo = getStatusInfo(user);
                  const RoleIcon = roleBadge.icon;
                  const isSelected = selectedIds.includes(user.idUser);

                  return (
                    <tr
                      key={user.idUser}
                      className={`hover:bg-slate-50/70 transition-colors dark:hover:bg-slate-800/50 ${
                        isSelected ? "bg-brand/5 dark:bg-brand/10" : ""
                      }`}
                    >
                      <td className="px-5 py-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(user.idUser)}
                          className="rounded border-slate-300 text-brand focus:ring-brand/20 h-4 w-4"
                        />
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar || defaultAvatar}
                            alt={user.fullName || "User"}
                            className="h-10 w-10 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 dark:text-white truncate">
                              {user.fullName || "Chưa đặt tên"}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {user.email || user.phone || "Không có thông tin liên hệ"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                        <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800">
                          {user.userCode || user.idUser?.slice(0, 8)}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${roleBadge.className}`}
                        >
                          <RoleIcon size={13} />
                          {roleBadge.label}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusInfo.className}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.dot}`} />
                          {statusInfo.label}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">
                        {formatDate(user.createdAt)}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/admin/users/${user.idUser}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 hover:text-brand hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Xem chi tiết người dùng"
                          >
                            <Eye size={16} />
                          </Link>

                          {isAdmin && !user.deletedAt && (
                            <button
                              type="button"
                              onClick={() => setRemovingUser(user)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              title="Xóa tài khoản"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {!loading && filteredUsers.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500">
              Hiển thị {(safeCurrentPage - 1) * PAGE_SIZE + 1} -{" "}
              {Math.min(safeCurrentPage * PAGE_SIZE, filteredUsers.length)} trên tổng số{" "}
              <strong className="text-slate-800 dark:text-white">{filteredUsers.length}</strong>
            </span>

            <Pagination
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Floating Batch Selection Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-5">
          <span className="text-xs font-semibold">
            Đã chọn <strong className="text-brand">{selectedIds.length}</strong> người dùng
          </span>
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand text-white text-xs font-semibold hover:bg-brand-hover transition-colors"
          >
            <Download size={14} />
            <span>Xuất đã chọn</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedIds([])}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            Bỏ chọn
          </button>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        open={Boolean(removingUser)}
        title="Xóa tài khoản người dùng"
        confirmText="Xác nhận xóa"
        confirmVariant="danger"
        submitting={removing}
        onClose={() => setRemovingUser(null)}
        onConfirm={confirmRemove}
      >
        <p>
          Bạn có chắc chắn muốn xóa tài khoản của{" "}
          <strong className="text-slate-900 dark:text-white">
            {removingUser?.fullName || removingUser?.userCode}
          </strong>
          ? Hành động này sẽ vô hiệu hóa quyền đăng nhập của người dùng.
        </p>
      </ConfirmModal>
    </div>
  );
};

export default UserManagementPage;
