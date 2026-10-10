import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";

import { useNotification } from "@/app/providers/NotificationProvider";
import { userApi } from "@/entities/user/api/userApi";
import { normalizeRole } from "@/features/auth/lib/authRole";
import UserDetailContent from "@/features/user-management/ui/UserDetailContent";
import UserDetailSidebar from "@/features/user-management/ui/UserDetailSidebar";
import {
  createRecentActivities,
  getInitials,
  getProviderInfo,
  getRoleName,
  getStatusInfo,
  normalizeUserDetail,
} from "@/features/user-management/lib/userDetail";
import AdminDetailLayout from "@/shared/ui/admin-detail/AdminDetailLayout";
import AdminActionMenu from "@/shared/ui/menu/AdminActionMenu";
import ConfirmModal from "@/shared/ui/modal/ConfirmModal";

const UserDetailPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { adminUser } = useOutletContext();
  const { showNotification } = useNotification();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
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

        const data = await userApi.getById(userId);

        if (active) {
          setUser(normalizeUserDetail(data));
        }
      } catch (error) {
        if (!active) return;

        setUser(null);
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

  const activities = useMemo(() => createRecentActivities(user), [user]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-44 animate-pulse rounded bg-surface-muted" />
        <div className="h-24 animate-pulse rounded-2xl bg-surface-muted" />
        <div className="h-72 animate-pulse rounded-2xl bg-surface-muted" />
      </div>
    );
  }

  if (errorMessage || !user) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate("/admin/users")}
          className="inline-flex items-center gap-2 text-sm font-semibold text-text-muted transition hover:text-brand"
        >
          <ArrowLeft size={18} />
          Quay lại Người dùng
        </button>

        <div className="rounded-2xl border border-danger-border bg-danger-soft p-6 text-danger">
          {errorMessage || "Không tìm thấy người dùng."}
        </div>
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

  const currentRole = normalizeRole(adminUser?.role);
  const targetRole = normalizeRole(user.role?.nameRole);

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

      showNotification(
        "success",
        "Đã xóa người dùng",
        "Tài khoản đã bị vô hiệu hóa.",
      );

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
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-soft text-sm font-semibold text-brand">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.fullName || "Người dùng"}
                className="h-full w-full object-cover"
              />
            ) : (
              getInitials(user.fullName)
            )}
          </div>
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
        actions={isAdmin ? <AdminActionMenu items={actionItems} /> : null}
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
            onUserChange={setUser}
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
          canEditUser={canEditUser}
          onUserChange={setUser}
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
