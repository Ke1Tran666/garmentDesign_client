import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  Eye,
  MoreVertical,
  Trash2,
  UserRound,
} from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";

import defaultAvatar from "@/shared/assets/images/avatar-default.jpg";
import { userApi } from "@/entities/user/api/userApi";
import { normalizeRole } from "@/features/auth/lib/authRole";

import DataTable from "@/shared/ui/table/DataTable";
import Pagination from "@/shared/ui/table/Pagination";
import MenuTable from "@/shared/ui/menu/MenuTable";
import ConfirmModal from "@/shared/ui/modal/ConfirmModal";
import { useNotification } from "@/app/providers/NotificationProvider";
import FilterSelect from "@/shared/ui/select/FilterSelect";
import { SearchInput } from "@/shared/ui/search/search-input";
import CountBadge from "@/shared/ui/badge/CountBadge";
import PageHeading from "@/shared/ui/heading/PageHeading";

const PAGE_SIZE = 15;

const COLUMNS = [
  { key: "user", title: "Người dùng" },
  { key: "userCode", title: "Mã người dùng" },
  { key: "role", title: "Vai trò" },
  { key: "status", title: "Trạng thái" },
  { key: "createdAt", title: "Ngày tạo" },
  {
    key: "action",
    title: "Thao tác",
    className: "text-center",
  },
];

const USER_STATUS_OPTIONS = [
  {
    value: "all",
    label: "Tất cả trạng thái",
  },
  {
    value: "active",
    label: "Hoạt động",
  },
  {
    value: "pending",
    label: "Chờ hoàn thiện",
  },
  {
    value: "inactive",
    label: "Đã khóa",
  },
  {
    value: "deleted",
    label: "Đã xóa",
  },
];

const initialMenu = {
  open: false,
  x: 0,
  y: 0,
  user: null,
};

const formatDate = (value) => {
  if (!value) return "Chưa có";

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

const getRoleName = (user) =>
  user?.role?.nameRole || "Chưa phân quyền";

const getStatusInfo = (user) => {
  if (user?.deletedAt) {
    return {
      label: "Đã xóa",
      className: "bg-danger-soft text-danger",
    };
  }

  const status = String(user?.status || "").toLowerCase();

  if (status === "active") {
    return {
      label: "Hoạt động",
      className: "bg-success-soft text-success",
    };
  }

  if (status === "pending") {
    return {
      label: "Chờ hoàn thiện",
      className: "bg-warning-soft text-warning",
    };
  }

  if (status === "banned" || status === "inactive") {
    return {
      label: "Đã khóa",
      className: "bg-danger-soft text-danger",
    };
  }

  return {
    label: status || "Không xác định",
    className: "bg-surface-muted text-text-muted",
  };
};

const UserManagementPage = () => {
  const { adminUser, searchKeyword = "" } = useOutletContext();
  const { showNotification } = useNotification();

  const isAdmin = normalizeRole(adminUser?.role) === "admin";

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [localSearch, setLocalSearch] = useState("");
  const deferredSearch = useDeferredValue(
    localSearch || searchKeyword,
  );

  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [menu, setMenu] = useState(initialMenu);

  const [removingUser, setRemovingUser] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    userApi
      .getAll()
      .then((data) => {
        if (!active) return;

        setUsers(Array.isArray(data) ? data : []);
        setErrorMessage("");
      })
      .catch((error) => {
        console.error("Không thể tải người dùng:", error);

        if (!active) return;

        setUsers([]);
        setErrorMessage(
          error.response?.data?.message ||
            "Không thể tải danh sách người dùng.",
        );
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const availableRoles = useMemo(() => {
    return Array.from(
      new Set(
        users
          .map((user) => getRoleName(user))
          .filter(Boolean),
      ),
    );
  }, [users]);

  const filteredUsers = useMemo(() => {
    const keyword = deferredSearch.trim().toLowerCase();

    return users.filter((user) => {
      const role = getRoleName(user);
      const status = getStatusInfo(user);

      const matchesKeyword =
        !keyword ||
        [
          user.idUser,
          user.userCode,
          user.fullName,
          role,
          status.label,
        ]
          .join(" ")
          .toLowerCase()
          .includes(keyword);

      const matchesRole =
        roleFilter === "all" ||
        normalizeRole(role) === normalizeRole(roleFilter);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "deleted"
          ? Boolean(user.deletedAt)
          : !user.deletedAt &&
            String(user.status || "").toLowerCase() ===
              statusFilter);

      return matchesKeyword && matchesRole && matchesStatus;
    });
  }, [
    users,
    deferredSearch,
    roleFilter,
    statusFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / PAGE_SIZE),
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages,
  );

  const visibleUsers = useMemo(() => {
    const start =
      (safeCurrentPage - 1) * PAGE_SIZE;

    return filteredUsers.slice(
      start,
      start + PAGE_SIZE,
    );
  }, [filteredUsers, safeCurrentPage]);

  const openActionMenu = (event, user) => {
    event.stopPropagation();

    const rect =
      event.currentTarget.getBoundingClientRect();

    const width = 176;

    setMenu({
      open: true,
      user,
      x: Math.min(
        rect.right - width,
        window.innerWidth - width - 12,
      ),
      y: Math.min(
        rect.bottom + 6,
        window.innerHeight - 150,
      ),
    });
  };

  const openDetail = (user) => {
    setMenu(initialMenu);
    navigate(`/admin/users/${user.idUser}`);
  };

  const confirmRemove = async () => {
    if (!removingUser) return;

    try {
      setRemoving(true);
      setRemoveError("");

      await userApi.remove(removingUser.idUser);

      setUsers((current) =>
        current.map((user) =>
          user.idUser === removingUser.idUser
            ? {
                ...user,
                status: "delete",
                deletedAt: new Date().toISOString(),
              }
            : user,
        ),
      );

      setRemovingUser(null);

      showNotification(
        "success",
        "Đã xóa người dùng",
        "Tài khoản đã bị vô hiệu hóa và các phiên đăng nhập đã kết thúc.",
      );
    } catch (error) {
      setRemoveError(
        error.response?.data?.message ||
          "Không thể xóa người dùng.",
      );
    } finally {
      setRemoving(false);
    }
  };

  const showingStart =
    filteredUsers.length === 0
      ? 0
      : (safeCurrentPage - 1) * PAGE_SIZE + 1;

  const showingEnd = Math.min(
    safeCurrentPage * PAGE_SIZE,
    filteredUsers.length,
  );

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <PageHeading
            title="Quản lý người dùng"
            description="Xem và quản lý tài khoản trong hệ thống."
          />

          <CountBadge
            count={filteredUsers.length}
            label="người dùng"
            icon={UserRound}
          />
        </div>

        <div className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[1fr_180px_180px]">
            <SearchInput
              value={localSearch}
              onChange={(value) => {
                setLocalSearch(value);
                setCurrentPage(1);
              }}
              placeholder="Tìm theo tên, mã hoặc vai trò..."
              className="w-full"
            />

            <select
              value={roleFilter}
              onChange={(event) => {
                setRoleFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="h-11 rounded-xl border border-input bg-surface px-3 text-sm outline-none focus:border-brand"
            >
              <option value="all">Tất cả vai trò</option>

              {availableRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>

            <FilterSelect
              value={statusFilter}
              options={USER_STATUS_OPTIONS}
              ariaLabel="Lọc người dùng theo trạng thái"
              onValueChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="mt-5">
            <DataTable
              columns={COLUMNS}
              data={visibleUsers}
              loading={loading}
              error={errorMessage}
              emptyText="Không tìm thấy người dùng"
              minWidth="min-w-225"
              renderRow={(user) => {
                const status = getStatusInfo(user);
                const isCurrentUser =
                  user.idUser === adminUser?.idUser;

                return (
                  <tr
                    key={user.idUser}
                    className="transition hover:bg-surface-subtle"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar || defaultAvatar}
                          alt={user.fullName || "Người dùng"}
                          className="h-10 w-10 rounded-xl object-cover"
                        />

                        <div className="min-w-0">
                          <p className="max-w-55 truncate text-sm font-semibold text-text-default">
                            {user.fullName ||
                              "Chưa cập nhật tên"}
                          </p>

                          <p className="text-xs text-text-muted">
                            {user.idUser}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-sm text-text-muted">
                      {user.userCode || "Chưa có"}
                    </td>

                    <td className="px-4 py-3">
                      <span className="rounded-full bg-info-soft px-3 py-1 text-xs font-semibold text-info">
                        {getRoleName(user)}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-sm text-text-muted">
                      {formatDate(user.createdAt)}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        aria-label="Mở thao tác"
                        onClick={(event) =>
                          openActionMenu(event, user)
                        }
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-muted transition hover:bg-surface-muted hover:text-text-default"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {isCurrentUser && (
                        <span className="sr-only">
                          Tài khoản hiện tại
                        </span>
                      )}
                    </td>
                  </tr>
                );
              }}
            />
          </div>

          <div className="mt-5">
            <Pagination
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              showingStart={showingStart}
              showingEnd={showingEnd}
              totalItems={filteredUsers.length}
              showOnSinglePage
            />
          </div>
        </div>
      </div>

      <MenuTable
        open={menu.open}
        position={{ x: menu.x, y: menu.y }}
        onClose={() => setMenu(initialMenu)}
        items={[
          {
            id: "detail",
            label: "Xem chi tiết",
            icon: Eye,
            onClick: () => openDetail(menu.user),
          },
          {
            id: "divider",
            type: "divider",
            hidden: !isAdmin,
          },
          {
            id: "delete",
            label: "Xóa tài khoản",
            icon: Trash2,
            danger: true,
            hidden: !isAdmin,
            disabled:
              menu.user?.deletedAt ||
              menu.user?.idUser === adminUser?.idUser,
            onClick: () => {
              setRemoveError("");
              setRemovingUser(menu.user);
            },
          },
        ]}
      />

      <ConfirmModal
        open={Boolean(removingUser)}
        title="Xóa tài khoản?"
        confirmText="Xóa tài khoản"
        loadingText="Đang xóa..."
        confirmVariant="danger"
        submitting={removing}
        onClose={() => {
          if (removing) return;

          setRemovingUser(null);
          setRemoveError("");
        }}
        onConfirm={confirmRemove}
      >
        <p>
          Tài khoản{" "}
          <strong className="text-text-default">
            {removingUser?.fullName ||
              removingUser?.userCode}
          </strong>{" "}
          sẽ bị vô hiệu hóa và tất cả phiên đăng nhập sẽ kết thúc.
        </p>

        {removeError && (
          <p className="mt-3 rounded-lg bg-danger-soft px-3 py-2 text-danger">
            {removeError}
          </p>
        )}
      </ConfirmModal>
    </>
  );
};

export default UserManagementPage;
