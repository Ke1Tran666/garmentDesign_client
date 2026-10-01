import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  EllipsisVertical,
  Hash,
  Pencil,
  Ruler,
  Tag,
  Trash2,
  Wrench,
} from "lucide-react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";

import { serviceApi } from "@/entities/service/api/serviceApi";
import { normalizeRole } from "@/features/auth/lib/authRole";
import ServiceFormModal from "@/features/service-management/ui/ServiceFormModal";
import ConfirmModal from "@/shared/ui/modal/ConfirmModal";
import { useNotification } from "@/app/providers/NotificationProvider";

import AdminDetailLayout, {
  AdminDetailInfoRow,
  AdminDetailSection,
  AdminDetailSummaryRow,
} from "@/shared/ui/admin-detail/AdminDetailLayout";

const EMPTY_VALUE = "Chưa có dữ liệu";

const formatDate = (value, includeTime = false) => {
  if (!value) return EMPTY_VALUE;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(includeTime
      ? {
          hour: "2-digit",
          minute: "2-digit",
        }
      : {}),
  }).format(date);
};

const formatPrice = (value) => {
  const price = Number(value);

  if (!Number.isFinite(price)) {
    return EMPTY_VALUE;
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price);
};

const getStatusInfo = (service) => {
  if (service?.deletedAt) {
    return {
      label: "Đã xóa",
      className: "bg-danger-soft text-danger",
    };
  }

  if (String(service?.status || "").toLowerCase() === "active") {
    return {
      label: "Đang hoạt động",
      className: "bg-success-soft text-success",
    };
  }

  return {
    label: "Tạm ngừng",
    className: "bg-warning-soft text-warning",
  };
};

const ServiceDetailPage = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { adminUser } = useOutletContext();
  const { showNotification } = useNotification();

  const isAdmin = normalizeRole(adminUser?.role) === "admin";

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [actionOpen, setActionOpen] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editError, setEditError] = useState("");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    let active = true;

    const loadService = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const data = await serviceApi.getAdminById(serviceId);

        if (active) {
          setService(data);
        }
      } catch (error) {
        if (!active) return;

        setService(null);
        setErrorMessage(
          error.response?.data?.message || "Không thể tải thông tin dịch vụ.",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadService();

    return () => {
      active = false;
    };
  }, [serviceId]);

  const activities = useMemo(() => {
    if (!service) return [];

    return [
      service.updatedAt
        ? {
            id: "updated",
            title: "Cập nhật dịch vụ",
            date: service.updatedAt,
          }
        : null,
      service.createdAt
        ? {
            id: "created",
            title: "Tạo dịch vụ",
            date: service.createdAt,
          }
        : null,
      service.deletedAt
        ? {
            id: "deleted",
            title: "Xóa dịch vụ",
            date: service.deletedAt,
          }
        : null,
    ]
      .filter(Boolean)
      .sort((first, second) => new Date(second.date) - new Date(first.date));
  }, [service]);

  const handleUpdate = async (payload) => {
    if (!service) return;

    try {
      setSubmitting(true);
      setEditError("");

      const updated = await serviceApi.update(service.serviceId, payload);

      setService(updated);
      setEditOpen(false);

      showNotification(
        "success",
        "Đã cập nhật dịch vụ",
        `${updated.serviceName} đã được cập nhật.`,
      );
    } catch (error) {
      setEditError(
        error.response?.data?.message || "Không thể cập nhật dịch vụ.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!service) return;

    try {
      setDeleting(true);
      setDeleteError("");

      await serviceApi.remove(service.serviceId);

      showNotification(
        "success",
        "Đã xóa dịch vụ",
        "Dịch vụ đã được ngừng cung cấp.",
      );

      navigate("/admin/services", {
        replace: true,
      });
    } catch (error) {
      setDeleteError(error.response?.data?.message || "Không thể xóa dịch vụ.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-44 animate-pulse rounded bg-surface-muted" />
        <div className="h-24 animate-pulse rounded-2xl bg-surface-muted" />
        <div className="h-72 animate-pulse rounded-2xl bg-surface-muted" />
      </div>
    );
  }

  if (errorMessage || !service) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate("/admin/services")}
          className="inline-flex items-center gap-2 text-sm font-semibold text-text-muted transition hover:text-brand"
        >
          <ArrowLeft size={18} />
          Quay lại Dịch vụ
        </button>

        <div className="rounded-2xl border border-danger-border bg-danger-soft p-6 text-danger">
          {errorMessage || "Không tìm thấy dịch vụ."}
        </div>
      </div>
    );
  }

  const status = getStatusInfo(service);

  return (
    <>
      <AdminDetailLayout
        backLabel="Quay lại Dịch vụ"
        breadcrumbLabel="Dịch vụ"
        breadcrumbValue={service.serviceCode || service.serviceId}
        title={service.serviceName || "Chưa đặt tên"}
        subtitle={service.serviceCode}
        onBack={() => navigate("/admin/services")}
        leading={
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
            <Wrench size={20} />
          </span>
        }
        badges={
          <span
            className={`rounded-lg px-3 py-2 text-xs font-semibold ${status.className}`}
          >
            {status.label}
          </span>
        }
        actions={
          isAdmin ? (
            <div className="relative">
              <button
                type="button"
                aria-label="Mở thao tác"
                aria-haspopup="menu"
                aria-expanded={actionOpen}
                onClick={() => setActionOpen((current) => !current)}
                className="flex h-9 w-10 items-center justify-center rounded-lg border border-border bg-surface-subtle text-text-muted transition hover:bg-surface-muted hover:text-text-default"
              >
                <EllipsisVertical size={17} />
              </button>

              {actionOpen && (
                <div
                  role="menu"
                  className="absolute top-full right-0 z-30 mt-2 w-52 rounded-xl border border-border bg-surface p-1.5 shadow-xl"
                >
                  <button
                    type="button"
                    role="menuitem"
                    disabled={Boolean(service.deletedAt)}
                    onClick={() => {
                      setActionOpen(false);
                      setEditError("");
                      setEditOpen(true);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-text-default transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Pencil size={17} />
                    Chỉnh sửa
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    disabled={Boolean(service.deletedAt)}
                    onClick={() => {
                      setActionOpen(false);
                      setDeleteError("");
                      setDeleteOpen(true);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-danger transition hover:bg-danger-soft disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Trash2 size={17} />
                    Xóa dịch vụ
                  </button>
                </div>
              )}
            </div>
          ) : null
        }
        sidebar={
          <>
            <AdminDetailSection title="Thông tin cơ bản">
              <AdminDetailInfoRow icon={Hash} label="ID">
                {service.serviceId}
              </AdminDetailInfoRow>

              <AdminDetailInfoRow icon={Wrench} label="Mã">
                {service.serviceCode}
              </AdminDetailInfoRow>

              <AdminDetailInfoRow icon={CalendarDays} label="Ngày tạo">
                {formatDate(service.createdAt, true)}
              </AdminDetailInfoRow>

              <AdminDetailInfoRow icon={Clock3} label="Cập nhật">
                {formatDate(service.updatedAt, true)}
              </AdminDetailInfoRow>

              <AdminDetailInfoRow icon={BadgeCheck} label="Trạng thái">
                <span
                  className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${status.className}`}
                >
                  {status.label}
                </span>
              </AdminDetailInfoRow>
            </AdminDetailSection>

            <AdminDetailSection
              title="Thông tin dịch vụ"
              action={
                isAdmin &&
                !service.deletedAt && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditError("");
                      setEditOpen(true);
                    }}
                    className="rounded-md p-1.5 text-text-subtle transition hover:bg-surface-muted hover:text-text-default"
                    aria-label="Chỉnh sửa dịch vụ"
                  >
                    <Pencil size={14} />
                  </button>
                )
              }
            >
              <AdminDetailInfoRow icon={Wrench} label="Tên">
                {service.serviceName}
              </AdminDetailInfoRow>

              <AdminDetailInfoRow icon={Ruler} label="Đơn vị">
                {service.unitType}
              </AdminDetailInfoRow>

              <AdminDetailInfoRow icon={CircleDollarSign} label="Giá">
                {formatPrice(service.basePrice)}
              </AdminDetailInfoRow>

              <AdminDetailInfoRow icon={Tag} label="Thẻ">
                {service.tags}
              </AdminDetailInfoRow>
            </AdminDetailSection>
          </>
        }
      >
        <section>
          <h2 className="mb-3 text-sm font-bold text-text-strong">
            Dịch vụ & vận hành
          </h2>

          <div className="overflow-hidden rounded-xl border border-border bg-surface-subtle">
            <AdminDetailSummaryRow
              icon={BadgeCheck}
              title="Trạng thái dịch vụ"
              description={formatDate(service.updatedAt)}
              value={status.label}
              valueClassName={status.className}
            />

            <AdminDetailSummaryRow
              icon={Ruler}
              title="Đơn vị tính"
              value={service.unitType || EMPTY_VALUE}
            />

            <AdminDetailSummaryRow
              icon={CircleDollarSign}
              title="Giá cơ bản"
              value={formatPrice(service.basePrice)}
              valueClassName="bg-info-soft text-info"
            />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-bold text-text-strong">
            Mô tả dịch vụ
          </h2>

          <div className="rounded-xl border border-border bg-surface-subtle p-4">
            <p className="text-sm leading-6 whitespace-pre-wrap text-text-muted">
              {service.description || EMPTY_VALUE}
            </p>

            {service.tags && (
              <div className="mt-4 flex flex-wrap gap-2">
                {service.tags
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean)
                  .map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand"
                    >
                      {tag}
                    </span>
                  ))}
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between gap-4">
            <h2 className="text-sm font-bold text-text-strong">Hoạt động</h2>

            <span className="text-xs text-text-muted">
              {activities.length} hoạt động
            </span>
          </div>

          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-4 rounded-xl border border-border bg-surface-subtle px-4 py-4"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-text-muted">
                  <Activity size={17} />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-text-default">
                    {activity.title}
                  </p>

                  <p className="mt-1 text-xs text-text-muted">
                    {formatDate(activity.date, true)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </AdminDetailLayout>

      {editOpen && (
        <ServiceFormModal
          service={service}
          submitting={submitting}
          errorMessage={editError}
          onSubmit={handleUpdate}
          onClose={() => {
            if (submitting) return;

            setEditOpen(false);
            setEditError("");
          }}
        />
      )}

      <ConfirmModal
        open={deleteOpen}
        title="Xóa dịch vụ?"
        confirmText="Xóa dịch vụ"
        loadingText="Đang xóa..."
        confirmVariant="danger"
        submitting={deleting}
        onConfirm={handleDelete}
        onClose={() => {
          if (deleting) return;

          setDeleteOpen(false);
          setDeleteError("");
        }}
      >
        <p>
          Dịch vụ{" "}
          <strong className="text-text-default">{service.serviceName}</strong>{" "}
          sẽ ngừng hiển thị với người dùng nhưng dữ liệu lịch sử vẫn được giữ
          lại.
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

export default ServiceDetailPage;
