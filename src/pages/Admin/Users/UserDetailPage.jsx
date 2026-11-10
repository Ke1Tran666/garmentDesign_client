import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, ArrowLeft, RefreshCw, Trash2 } from "lucide-react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";

import { useNotification } from "@/app/providers/NotificationProvider";
import { serviceOrderApi } from "@/entities/service-order/api/serviceOrderApi";
import { userApi } from "@/entities/user/api/userApi";
import { resolveAppRole } from "@/features/auth/lib/authRole";
import {
  formatPrice,
  getStatusInfo as getOrderStatusInfo,
} from "@/features/service-order-management/lib/serviceOrderUtils";
import {
  UserDetailContent,
  UserDetailSidebar,
  createRecentActivities,
  getProviderInfo,
  getRoleName,
  getStatusInfo,
  normalizeUserDetail,
} from "@/features/user-management";
import AdminDetailLayout from "@/shared/ui/admin-detail/AdminDetailLayout";
import UserAvatar from "@/shared/ui/avatar/UserAvatar";
import AdminActionMenu from "@/shared/ui/menu/AdminActionMenu";
import ConfirmModal from "@/shared/ui/modal/ConfirmModal";
import { DetailPageSkeleton } from "@/shared/ui/skeleton";

const buildRelatedOrders = (orders, targetUserId) => {
  if (!Array.isArray(orders) || !targetUserId) return [];

  return orders
    .filter((order) => {
      const isOwner = order?.user?.idUser === targetUserId;
      const isHandler =
        order?.createdBy === targetUserId || order?.updatedBy === targetUserId;
      return isOwner || isHandler;
    })
    .sort((a, b) => {
      const timeDiff =
        new Date(b?.updatedAt || b?.createdAt || 0).getTime() -
        new Date(a?.updatedAt || a?.createdAt || 0).getTime();
      if (timeDiff !== 0) return timeDiff;
      return Number(b?.serviceOrderId ?? 0) - Number(a?.serviceOrderId ?? 0);
    })
    .map((order) => {
      const isOwner = order?.user?.idUser === targetUserId;
      const isHandler =
        order?.createdBy === targetUserId || order?.updatedBy === targetUserId;
      const orderStatus = getOrderStatusInfo(order);

      return {
        id: order.serviceOrderId,
        code: `ORD-${order.serviceOrderId}`,
        productName: order.productName || "Sản phẩm may đo",
        serviceName: order.service?.serviceName || "Dịch vụ thiết kế",
        date: order.updatedAt || order.createdAt,
        formattedPrice: formatPrice(order.totalPrice),
        statusLabel: orderStatus.label,
        statusClassName: orderStatus.className,
        statusDot: orderStatus.dot,
        relationLabel:
          isOwner && isHandler
            ? "Khách đặt & xử lý"
            : isOwner
              ? "Khách đặt đơn"
              : "Phụ trách xử lý",
      };
    });
};

const UserDetailPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { adminUser, refreshSession } = useOutletContext() || {};
  const currentAdminUserId = adminUser?.idUser;
  const { showNotification } = useNotification();

  const [user, setUser] = useState(null);
  const [relatedOrders, setRelatedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    let active = true;

    const loadUser = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const fetchProfile =
          userId === "me" ? userApi.getMe() : userApi.getById(userId);
        const fetchOrders =
          typeof serviceOrderApi?.getAll === "function"
            ? serviceOrderApi.getAll().catch(() => [])
            : Promise.resolve([]);

        const [data, ordersData] = await Promise.all([
          fetchProfile,
          fetchOrders,
        ]);

        if (active) {
          const normalized = normalizeUserDetail(data);
          setUser(normalized);
          setRelatedOrders(buildRelatedOrders(ordersData, normalized?.idUser));
        }
      } catch (error) {
        if (!active) return;

        setUser(null);
        setRelatedOrders([]);
        setErrorMessage(
          error.response?.data?.message ||
            "Không thể tải thông tin người dùng.",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      active = false;
    };
  }, [userId]);

  const handleUserChange = useCallback(
    (nextUser) => {
      setUser(nextUser);
      if (nextUser?.idUser && nextUser.idUser === currentAdminUserId) {
        refreshSession?.().catch(() => {});
      }
    },
    [currentAdminUserId, refreshSession],
  );

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      setErrorMessage("");

      const fetchProfile =
        userId === "me"
          ? userApi.getMe()
          : userApi.getById(userId, { forceRefresh: true });
      const fetchOrders =
        typeof serviceOrderApi?.getAll === "function"
          ? serviceOrderApi.getAll({ forceRefresh: true }).catch(() => [])
          : Promise.resolve([]);

      const [data, ordersData] = await Promise.all([fetchProfile, fetchOrders]);
      const normalized = normalizeUserDetail(data);
      setUser(normalized);
      setRelatedOrders(buildRelatedOrders(ordersData, normalized?.idUser));

      if (normalized?.idUser && normalized.idUser === currentAdminUserId) {
        refreshSession?.().catch(() => {});
      }

      showNotification({
        type: "success",
        title: "Làm mới thành công",
        message: "Thông tin người dùng đã được đồng bộ từ máy chủ.",
      });
    } catch (error) {
      showNotification({
        type: "error",
        title: "Làm mới thất bại",
        message:
          error.response?.data?.message ||
          "Không thể làm mới thông tin người dùng.",
      });
    } finally {
      setRefreshing(false);
    }
  }, [userId, currentAdminUserId, refreshSession, showNotification]);

  const activities = useMemo(() => createRecentActivities(user), [user]);

  if (loading) {
    return <DetailPageSkeleton />;
  }

  if (errorMessage || !user) {
    return (
      <div className="space-y-4 rounded-3xl border border-rose-200 bg-rose-50/60 p-8 text-center dark:border-rose-900/60 dark:bg-rose-950/30">
        <AlertCircle size={36} className="mx-auto text-rose-500" />
        <h3 className="font-heading text-lg font-bold text-rose-800 dark:text-rose-300">
          {errorMessage || "Không tìm thấy người dùng."}
        </h3>
        <button
          type="button"
          onClick={() => navigate("/admin/users")}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
        >
          <ArrowLeft size={14} />
          <span>Về danh sách người dùng</span>
        </button>
      </div>
    );
  }

  const authProviders = Array.isArray(user.authProviders)
    ? user.authProviders.filter((provider) => !provider.deletedAt)
    : [];

  const loginEmailProvider = authProviders.find((item) => {
    const provider = String(item.provider || "").toLowerCase();

    return item.email && (provider === "local" || provider === "google");
  });

  const phoneProvider = authProviders.find((item) => item.phone);

  const loginProviderInfo = loginEmailProvider
    ? getProviderInfo(loginEmailProvider.provider)
    : null;

  const providerNames = authProviders
    .map((provider) => provider.provider)
    .filter(Boolean);

  const permissions = Array.isArray(user.role?.permissions)
    ? user.role.permissions
    : [];

  const currentRole = resolveAppRole(adminUser);
  const targetRole = resolveAppRole(user.role);

  const isAdmin = currentRole === "admin";
  const isStaff = currentRole === "staff";
  const isCurrentUser = user.idUser === adminUser?.idUser;

  const canEditUser =
    isAdmin || (isStaff && (targetRole === "user" || isCurrentUser));

  const status = getStatusInfo(user);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      setDeleteError("");

      await userApi.remove(user.idUser);

      showNotification({
        type: "success",
        title: "Đã xóa người dùng",
        message: "Tài khoản đã bị vô hiệu hóa.",
      });

      navigate("/admin/users", {
        replace: true,
      });
    } catch (error) {
      setDeleteError(
        error.response?.data?.message || "Không thể xóa người dùng.",
      );
    } finally {
      setDeleting(false);
    }
  };

  const actionItems = [
    {
      id: "delete-user",
      label: "Xóa tài khoản",
      icon: Trash2,
      variant: "danger",
      disabled: isCurrentUser || Boolean(user.deletedAt),
      onClick: () => {
        setDeleteError("");
        setDeleteOpen(true);
      },
    },
  ];

  return (
    <>
      <AdminDetailLayout
        backLabel="Quay lại Người dùng"
        breadcrumbLabel="Người dùng"
        breadcrumbValue={user.userCode || user.idUser}
        title={user.fullName || "Chưa cập nhật tên"}
        code={user.userCode || user.idUser}
        subtitle={loginEmailProvider?.email}
        onBack={() => navigate("/admin/users")}
        leading={
          <UserAvatar
            src={user.avatar}
            name={user.fullName || user.userCode}
            size="lg"
            showStatus={status.code === "active"}
          />
        }
        badges={
          <>
            <span
              className={`rounded-lg px-3 py-2 text-xs font-semibold ${status.badgeClassName}`}
            >
              {status.label}
            </span>

            <span className="rounded-lg border border-border bg-surface-subtle px-3 py-2 text-xs font-semibold text-text-default">
              {getRoleName(user)}
            </span>

            {isCurrentUser && (
              <span className="rounded-lg border border-brand/30 bg-brand-soft px-3 py-2 text-xs font-semibold text-brand">
                Hồ sơ cá nhân
              </span>
            )}

            {providerNames.map((provider) => (
              <span
                key={provider}
                className="rounded-lg border border-border bg-surface-subtle px-3 py-2 text-xs font-semibold text-text-default capitalize"
              >
                {provider}
              </span>
            ))}
          </>
        }
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-surface-subtle px-3 text-xs font-semibold text-text-default transition hover:bg-surface-muted disabled:opacity-50"
              title="Làm mới thông tin người dùng"
            >
              <RefreshCw
                size={14}
                className={
                  refreshing ? "animate-spin text-brand" : "text-text-muted"
                }
              />
              <span className="hidden sm:inline">Làm mới</span>
            </button>
            {isAdmin && <AdminActionMenu items={actionItems} />}
          </div>
        }
        sidebar={
          <UserDetailSidebar
            user={user}
            status={status}
            loginEmailProvider={loginEmailProvider}
            loginProviderInfo={loginProviderInfo}
            phoneProvider={phoneProvider}
            isAdmin={isAdmin}
            isCurrentUser={isCurrentUser}
            canEditUser={canEditUser}
            onUserChange={handleUserChange}
          />
        }
      >
        <UserDetailContent
          user={user}
          status={status}
          loginEmailProvider={loginEmailProvider}
          phoneProvider={phoneProvider}
          providerNames={providerNames}
          permissions={permissions}
          activities={activities}
          relatedOrders={relatedOrders}
          canEditUser={canEditUser}
          onUserChange={handleUserChange}
        />
      </AdminDetailLayout>

      <ConfirmModal
        open={deleteOpen}
        title="Xóa tài khoản?"
        confirmText="Xóa tài khoản"
        loadingText="Đang xóa..."
        confirmVariant="danger"
        submitting={deleting}
        onClose={() => {
          if (deleting) return;

          setDeleteOpen(false);
          setDeleteError("");
        }}
        onConfirm={handleDelete}
      >
        <p>
          Tài khoản{" "}
          <strong className="text-text-default">
            {user.fullName || user.userCode}
          </strong>{" "}
          sẽ bị vô hiệu hóa và tất cả phiên đăng nhập sẽ kết thúc.
        </p>

        {deleteError && (
          <p className="mt-3 rounded-lg bg-danger-soft px-3 py-2 text-danger">
            {deleteError}
          </p>
        )}
      </ConfirmModal>
    </>
  );
};

export default UserDetailPage;
