import {useEffect,useState} from "react";
import {
  CalendarDays,
  Edit3,
  MessageSquare,
  Star,
  Trash2,
  X,
} from "lucide-react";

import { authStorage } from "@/lib/authStorage";
import { serviceReviewApi } from "@/api/serviceReviewApi";
import { useNotification } from "@/components/ui/Notification/NotificationContext";
import ConfirmModal from "@/components/ui/Modal/ConfirmModal";

const EMPTY_FORM = {
  rating: 0,
  reviewContent: "",
  companyName: "",
  isPublic: true,
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

const getErrorMessage = (error) =>
  error?.response?.data?.detail ||
  error?.response?.data?.message ||
  error?.response?.data ||
  "Không thể xử lý yêu cầu.";

const RatingStars = ({
  value,
  editable = false,
  onChange,
}) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        disabled={!editable}
        onClick={() => onChange?.(star)}
        className={`
          rounded-md transition
          ${
            editable
              ? "cursor-pointer hover:scale-110"
              : "cursor-default"
          }
        `}
        aria-label={`${star} sao`}
      >
        <Star
          size={22}
          className={
            star <= value
              ? "fill-warning text-warning"
              : "text-border"
          }
        />
      </button>
    ))}
  </div>
);

const ServiceReviewPage = () => {
    const { showNotification } = useNotification();

  const userId = authStorage.getUserId();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(Boolean(userId));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => {if (!userId) {return undefined;}

    let active = true;

    serviceReviewApi
        .getReviewableOrders(userId)
        .then((data) => {
        if (!active) return;

        setOrders(
            Array.isArray(data)
            ? data
            : [],
        );
        })
        .catch((error) => {
        if (!active) return;

        showNotification(
            "error",
            "Không thể tải đánh giá",
            getErrorMessage(error),
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
    }, [showNotification, userId]);

  const openEditor = (order) => {
    const review = order.review;

    setEditingOrderId(
      order.serviceOrderId,
    );

    setForm({
      rating: review?.rating || 0,
      reviewContent:
        review?.reviewContent || "",
      companyName:
        review?.companyName || "",
      isPublic:
        review?.isPublic ?? true,
    });
  };

  const closeEditor = () => {
    if (saving) return;

    setEditingOrderId(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async (order) => {
    if (form.rating < 1) {
      showNotification(
        "warning",
        "Chưa chọn số sao",
        "Vui lòng chọn từ 1 đến 5 sao.",
      );
      return;
    }

    if (!form.reviewContent.trim()) {
      showNotification(
        "warning",
        "Thiếu nội dung",
        "Vui lòng nhập nội dung đánh giá.",
      );
      return;
    }

    const payload = {
      rating: form.rating,
      reviewContent:
        form.reviewContent.trim(),
      companyName:
        form.companyName.trim() || null,
      isPublic: form.isPublic,
    };

    try {
    setSaving(true);

    const savedReview = order.review
        ? await serviceReviewApi.update(
            order.review.reviewId,
            userId,
            payload,
        )
        : await serviceReviewApi.create(
            order.serviceOrderId,
            userId,
            payload,
        );

    setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
        currentOrder.serviceOrderId ===
        order.serviceOrderId
            ? {
                ...currentOrder,
                review: savedReview,
            }
            : currentOrder,
        ),
    );

    setEditingOrderId(null);
    setForm(EMPTY_FORM);

    showNotification(
        "success",
        order.review
        ? "Đã cập nhật đánh giá"
        : "Đã gửi đánh giá",
        "Cảm ơn bạn đã chia sẻ trải nghiệm.",
    );
    } catch (error) {
    showNotification(
        "error",
        "Không thể lưu đánh giá",
        getErrorMessage(error),
    );
    } finally {
    setSaving(false);
    }
  };

    const handleDelete = async () => {
        const reviewId =
            deleteTarget?.review?.reviewId;

        const orderId =
            deleteTarget?.serviceOrderId;

        if (!reviewId || !orderId) {
            return;
        }

        try {
            setDeleting(true);

            await serviceReviewApi.remove(
            reviewId,
            userId,
            );

            setOrders((currentOrders) =>
            currentOrders.map((order) =>
                order.serviceOrderId === orderId
                ? {
                    ...order,
                    review: null,
                    }
                : order,
            ),
            );

            setDeleteTarget(null);

            showNotification(
            "success",
            "Đã xóa đánh giá",
            "Bạn có thể đánh giá lại đơn hàng này.",
            );
        } catch (error) {
            showNotification(
            "error",
            "Không thể xóa đánh giá",
            getErrorMessage(error),
            );
        } finally {
            setDeleting(false);
        }
    };

  if (loading) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <p className="text-sm text-text-muted">
          Đang tải danh sách đánh giá...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wider text-brand">
          Đánh giá dịch vụ
        </p>

        <h1 className="mt-1 text-2xl font-bold text-text-strong">
          Đánh giá đơn hàng
        </h1>

        <p className="mt-2 text-sm text-text-muted">
          Bạn có thể đánh giá những đơn hàng
          đã đến ngày hoàn thành.
        </p>
      </header>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface px-6 py-16 text-center shadow-sm">
          <MessageSquare
            size={42}
            className="mx-auto text-text-subtle"
          />

          <h2 className="mt-4 font-semibold text-text-strong">
            Chưa có đơn hàng cần đánh giá
          </h2>

          <p className="mt-2 text-sm text-text-muted">
            Đơn hàng sẽ xuất hiện tại đây khi
            đến ngày hoàn thành.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {orders.map((order) => {
            const isEditing =
              editingOrderId ===
              order.serviceOrderId;

            return (
              <article
                key={order.serviceOrderId}
                className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm"
              >
                <div className="flex items-start justify-between gap-4 border-b border-border-subtle p-5">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-brand">
                      {order.orderCode}
                    </span>

                    <h2 className="mt-1 text-lg font-bold text-text-strong">
                      {order.productName ||
                        "Đơn hàng dịch vụ"}
                    </h2>

                    <p className="mt-1 text-sm text-text-muted">
                      {order.serviceName ||
                        "Chưa có tên dịch vụ"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-text-muted">
                    <CalendarDays size={17} />

                    {formatDate(
                      order.completedDate,
                    )}
                  </div>
                </div>

                <div className="p-5">
                  {!isEditing ? (
                    order.review ? (
                      <div>
                        <div className="flex items-center justify-between gap-4">
                          <RatingStars
                            value={
                              order.review.rating
                            }
                          />

                          <span
                            className={`
                              rounded-full px-3 py-1
                              text-xs font-semibold
                              ${
                                order.review.isPublic
                                  ? "bg-success-soft text-success"
                                  : "bg-surface-muted text-text-muted"
                              }
                            `}
                          >
                            {order.review.isPublic
                              ? "Công khai"
                              : "Riêng tư"}
                          </span>
                        </div>

                        <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-text-default">
                          {
                            order.review
                              .reviewContent
                          }
                        </p>

                        {order.review.companyName && (
                          <p className="mt-3 text-xs text-text-muted">
                            Công ty:{" "}
                            {
                              order.review
                                .companyName
                            }
                          </p>
                        )}

                        <div className="mt-5 flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openEditor(order)
                            }
                            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-text-default transition hover:bg-surface-subtle"
                          >
                            <Edit3 size={16} />
                            Chỉnh sửa
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setDeleteTarget(
                                order,
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-xl bg-danger-soft px-4 py-2 text-sm font-semibold text-danger transition hover:opacity-80"
                          >
                            <Trash2 size={16} />
                            Xóa
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-text-strong">
                            Chưa đánh giá
                          </p>

                          <p className="mt-1 text-sm text-text-muted">
                            Chia sẻ trải nghiệm của
                            bạn về đơn hàng này.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            openEditor(order)
                          }
                          className="rounded-xl bg-brand! px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                        >
                          Đánh giá ngay
                        </button>
                      </div>
                    )
                  ) : (
                    <div className="space-y-5">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-text-strong">
                          Mức độ hài lòng
                        </label>

                        <button
                          type="button"
                          onClick={closeEditor}
                          disabled={saving}
                          className="rounded-lg p-2 text-text-muted hover:bg-surface-muted"
                        >
                          <X size={18} />
                        </button>
                      </div>

                      <RatingStars
                        value={form.rating}
                        editable
                        onChange={(rating) =>
                          setForm((current) => ({
                            ...current,
                            rating,
                          }))
                        }
                      />

                      <textarea
                        rows={5}
                        maxLength={2000}
                        value={
                          form.reviewContent
                        }
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            reviewContent:
                              event.target.value,
                          }))
                        }
                        placeholder="Chia sẻ trải nghiệm của bạn..."
                        className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-default outline-none transition focus:border-brand"
                      />

                      <input
                        type="text"
                        maxLength={150}
                        value={form.companyName}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            companyName:
                              event.target.value,
                          }))
                        }
                        placeholder="Tên công ty (không bắt buộc)"
                        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-default outline-none transition focus:border-brand"
                      />

                      <label className="flex cursor-pointer items-center gap-3 text-sm text-text-default">
                        <input
                          type="checkbox"
                          checked={form.isPublic}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              isPublic:
                                event.target
                                  .checked,
                            }))
                          }
                          className="h-4 w-4 accent-brand"
                        />

                        Cho phép hiển thị công khai
                      </label>

                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={closeEditor}
                          disabled={saving}
                          className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-text-default"
                        >
                          Hủy
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleSubmit(order)
                          }
                          disabled={saving}
                          className="rounded-xl bg-brand! px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {saving
                            ? "Đang lưu..."
                            : order.review
                              ? "Cập nhật"
                              : "Gửi đánh giá"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Xóa đánh giá?"
        confirmText="Xóa đánh giá"
        loadingText="Đang xóa..."
        confirmVariant="danger"
        submitting={deleting}
        onClose={() => {
          if (!deleting) {
            setDeleteTarget(null);
          }
        }}
        onConfirm={handleDelete}
      >
        Đánh giá sẽ được ẩn khỏi hệ thống.
        Bạn vẫn có thể đánh giá lại đơn hàng này.
      </ConfirmModal>
    </div>
  );
};

export default ServiceReviewPage;