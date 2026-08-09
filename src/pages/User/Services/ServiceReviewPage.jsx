import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit3,
  Eye,
  EyeOff,
  MessageSquare,
  PackageCheck,
  Sparkles,
  Star,
  Trash2,
  X,
  ZoomIn,
} from "lucide-react";

import { BACKEND_URL } from "@/api/config";
import { serviceReviewApi } from "@/api/serviceReviewApi";

import ConfirmModal from "@/components/ui/Modal/ConfirmModal";
import { SectionCard } from "@/components/ui/Section/Section";
import Switch from "@/components/ui/Switch/Switch";
import { useNotification } from "@/components/ui/Notification/NotificationContext";
import { SearchInput } from "@/components/ui/Search/SearchInput";

const EMPTY_FORM = {
  rating: 0,
  reviewContent: "",
  companyName: "",
  isPublic: true,
};

const FILTERS = [
  {
    value: "all",
    label: "Tất cả",
  },
  {
    value: "pending",
    label: "Chưa đánh giá",
  },
  {
    value: "reviewed",
    label: "Đã đánh giá",
  },
];

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

const resolveProductImage = (value) => {
  if (!value) return "";

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("blob:") ||
    value.startsWith("data:")
  ) {
    return value;
  }

  return `${BACKEND_URL}${
    value.startsWith("/") ? value : `/${value}`
  }`;
};

const RatingStars = ({
  value,
  editable = false,
  onChange,
  size = 23,
}) => (
  <div
    className="flex items-center gap-1"
    aria-label={`${value} trên 5 sao`}
  >
    {[1, 2, 3, 4, 5].map((star) => {
      const selected = star <= value;

      return (
        <button
          key={star}
          type="button"
          disabled={!editable}
          onClick={() => onChange?.(star)}
          aria-label={`Đánh giá ${star} sao`}
          className={`
            rounded-md p-0.5 transition
            ${
              editable
                ? "cursor-pointer hover:-translate-y-0.5 hover:scale-110"
                : "cursor-default"
            }
          `}
        >
          <Star
            size={size}
            strokeWidth={1.8}
            className={
              selected
                ? "fill-warning text-warning"
                : "text-border"
            }
          />
        </button>
      );
    })}
  </div>
);

const StatisticCard = ({
  icon: Icon,
  label,
  value,
  description,
  iconClassName,
}) => (
  <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-text-subtle">
          {label}
        </p>

        <p className="mt-2 text-2xl font-bold text-text-strong">
          {value}
        </p>

        <p className="mt-1 text-xs text-text-muted">
          {description}
        </p>
      </div>

      <span
        className={`
          flex h-10 w-10 shrink-0 items-center
          justify-center rounded-xl
          ${iconClassName}
        `}
      >
        <Icon size={20} />
      </span>
    </div>
  </div>
);

const LoadingState = () => (
  <div className="space-y-5">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="h-30 animate-pulse rounded-2xl bg-surface-muted"
        />
      ))}
    </div>

    <div className="grid gap-5 xl:grid-cols-2">
      {[1, 2].map((item) => (
        <div
          key={item}
          className="h-72 animate-pulse rounded-2xl bg-surface-muted"
        />
      ))}
    </div>
  </div>
);

const ServiceReviewPage = () => {
  const { showNotification } = useNotification();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingOrderId,setEditingOrderId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const [deleteTarget,setDeleteTarget] = useState(null);

  const [filter, setFilter] = useState("all");

  const [searchValue, setSearchValue] = useState("");

 const [previewImage, setPreviewImage] = useState(null);

 const deferredSearchValue = useDeferredValue(searchValue);

  useEffect(() => {
    let active = true;

    serviceReviewApi
      .getReviewableOrders()
      .then((data) => {
        if (!active) return;

        setOrders(
          Array.isArray(data) ? data : []
        );
      })
      .catch((error) => {
        if (!active) return;

        console.error(
          "Không thể tải danh sách đánh giá:",
          error,
        );

        setOrders([]);

        showNotification(
          "error",
          "Không thể tải dữ liệu",
          error.response?.data?.message ||
            "Không thể tải danh sách đơn hàng có thể đánh giá.",
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
  }, [showNotification]);

  useEffect(() => {
    if (!previewImage) {
      return undefined;
    }

    const previousOverflow =
      document.body.style.overflow;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setPreviewImage(null);
      }
    };

    document.body.style.overflow =
      "hidden";

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [previewImage]);

  const statistics = useMemo(() => {
    const reviewed = orders.filter(
      (order) => Boolean(order.review),
    );

    const pending =
      orders.length - reviewed.length;

    const totalRating = reviewed.reduce(
      (total, order) =>
        total +
        Number(order.review?.rating || 0),
      0,
    );

    const average =
      reviewed.length === 0
        ? "0.0"
        : (
            totalRating /
            reviewed.length
          ).toFixed(1);

    return {
      total: orders.length,
      reviewed: reviewed.length,
      pending,
      average,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const keyword = deferredSearchValue.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "reviewed" &&
          Boolean(order.review)) ||
        (filter === "pending" &&
          !order.review);

      if (!matchesFilter) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      const searchableContent = [
        order.orderCode,
        order.productName,
        order.serviceName,
        order.review?.reviewContent,
        order.review?.companyName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableContent.includes(
        keyword,
      );
    });
  }, [deferredSearchValue,filter,orders]);

  const hasSearch = deferredSearchValue.trim().length > 0;

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
            payload
          )
        : await serviceReviewApi.create(
            order.serviceOrderId,
            payload
          );

      setOrders((currentOrders) =>
        currentOrders.map(
          (currentOrder) =>
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
    const reviewId = deleteTarget?.review?.reviewId;

    const orderId = deleteTarget?.serviceOrderId;

    if (!reviewId || !orderId) {
      return;
    }

    try {
      setDeleting(true);

      await serviceReviewApi.remove(reviewId);

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

  return (
    <>
      <SectionCard
        title="Đánh giá đơn hàng"
        desc="Chia sẻ trải nghiệm của bạn đối với những đơn hàng đã hoàn thành."
        highlight
      >
        {loading ? (
          <LoadingState />
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatisticCard
                icon={PackageCheck}
                label="Đơn hoàn thành"
                value={statistics.total}
                description="Đủ điều kiện đánh giá"
                iconClassName="bg-brand-light text-brand"
              />

              <StatisticCard
                icon={CheckCircle2}
                label="Đã đánh giá"
                value={statistics.reviewed}
                description="Đánh giá đã gửi"
                iconClassName="bg-success-soft text-success"
              />

              <StatisticCard
                icon={Clock3}
                label="Đang chờ"
                value={statistics.pending}
                description="Chưa gửi đánh giá"
                iconClassName="bg-warning-soft text-warning"
              />

              <StatisticCard
                icon={Sparkles}
                label="Điểm trung bình"
                value={`${statistics.average}/5`}
                description="Mức độ hài lòng"
                iconClassName="bg-warning-soft text-warning"
              />
            </div>

            <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="shrink-0">
                  <h2 className="font-semibold text-text-strong">
                    Ds đơn hàng
                  </h2>

                  <p className="mt-1 text-sm text-text-muted">
                    {filteredOrders.length} đơn hàng
                  </p>
                </div>

                <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <SearchInput
                    value={searchValue}
                    onChange={setSearchValue}
                    placeholder="Tìm mã đơn, sản phẩm..."
                    className="w-full sm:max-w-xs"
                  />

                  <div className="flex flex-wrap gap-1">
                    {FILTERS.map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() =>
                          setFilter(item.value)
                        }
                        className={`
                          rounded-xl border px-3.5 py-2
                          text-sm font-semibold transition
                          ${
                            filter === item.value
                              ? "border-brand bg-brand! text-white"
                              : "border-border bg-surface text-text-muted hover:border-brand hover:text-brand"
                          }
                        `}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-muted text-text-subtle">
                  <MessageSquare size={28} />
                </span>

                <h2 className="mt-4 font-semibold text-text-strong">
                  {hasSearch
                    ? "Không tìm thấy đơn hàng"
                    : orders.length === 0
                      ? "Chưa có đơn hàng đủ điều kiện"
                      : "Không có đơn hàng trong mục này"}
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-muted">
                  {hasSearch
                    ? `Không có kết quả phù hợp với “${deferredSearchValue.trim()}”.`
                    : orders.length === 0
                      ? "Đơn hàng sẽ xuất hiện khi ngày hoàn thành nhỏ hơn hoặc bằng ngày hiện tại."
                      : "Hãy chọn một bộ lọc khác để xem danh sách đơn hàng."}
                </p>
                {hasSearch && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearchValue("")
                    }
                    className="
                      mt-5 rounded-xl bg-brand!
                      px-4 py-2
                      text-sm font-semibold text-white
                      transition hover:opacity-90
                    "
                  >
                    Xóa tìm kiếm
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-5 xl:grid-cols-2">
                {filteredOrders.map(
                  (order) => {
                    const isEditing =
                      editingOrderId ===
                      order.serviceOrderId;

                    const productImage =
                      resolveProductImage(
                        order.productImage,
                      );

                    return (
                      <article
                        key={
                          order.serviceOrderId
                        }
                        className={`
                          overflow-hidden rounded-3xl
                          border bg-surface shadow-sm
                          transition duration-300
                          ${
                            isEditing
                              ? "border-brand shadow-lg"
                              : "border-border hover:-translate-y-0.5 hover:shadow-md"
                          }
                        `}
                      >
                        <div className="flex gap-4 border-b border-border-subtle bg-surface-subtle p-5">
                          <button
                            type="button"
                            disabled={!productImage}
                            onClick={() => {
                              if (!productImage) return;

                              setPreviewImage({
                                src: productImage,
                                alt:
                                  order.productName ||
                                  "Ảnh sản phẩm",
                                orderCode: order.orderCode,
                                productName:
                                  order.productName ||
                                  "Đơn hàng dịch vụ",
                              });
                            }}
                            aria-label={
                              productImage
                                ? `Xem ảnh ${order.productName || "sản phẩm"}`
                                : "Đơn hàng chưa có ảnh"
                            }
                            className={`
                              group relative flex h-20 w-20
                              shrink-0 items-center justify-center
                              overflow-hidden rounded-2xl
                              border border-border bg-surface
                              ${
                                productImage
                                  ? "cursor-zoom-in"
                                  : "cursor-default"
                              }
                            `}
                          >
                            {productImage ? (
                              <>
                                <img
                                  src={productImage}
                                  alt={
                                    order.productName ||
                                    "Sản phẩm"
                                  }
                                  className="
                                    h-full w-full object-cover
                                    transition duration-300
                                    group-hover:scale-110
                                  "
                                />

                                <span
                                  className="
                                    absolute inset-0
                                    flex items-center justify-center
                                    bg-black/0 text-white
                                    opacity-0 transition
                                    group-hover:bg-black/35
                                    group-hover:opacity-100
                                  "
                                >
                                  <ZoomIn size={22} />
                                </span>
                              </>
                            ) : (
                              <PackageCheck
                                size={28}
                                className="text-text-subtle"
                              />
                            )}
                          </button>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-xs font-bold uppercase tracking-wider text-brand">
                                {order.orderCode}
                              </span>

                              <span
                                className={`
                                  rounded-full px-3 py-1
                                  text-xs font-semibold
                                  ${
                                    order.review
                                      ? "bg-success-soft text-success"
                                      : "bg-warning-soft text-warning"
                                  }
                                `}
                              >
                                {order.review
                                  ? "Đã đánh giá"
                                  : "Chờ đánh giá"}
                              </span>
                            </div>

                            <h2 className="mt-2 truncate text-lg font-bold text-text-strong">
                              {order.productName ||
                                "Đơn hàng dịch vụ"}
                            </h2>

                            <p className="mt-1 truncate text-sm text-text-muted">
                              {order.serviceName ||
                                "Chưa có tên dịch vụ"}
                            </p>
                          </div>
                        </div>

                        <div className="p-5">
                          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-sm text-text-muted">
                              <CalendarDays
                                size={17}
                                className="text-brand"
                              />

                              <span>
                                Hoàn thành{" "}
                                <strong className="font-semibold text-text-default">
                                  {formatDate(
                                    order.completedDate,
                                  )}
                                </strong>
                              </span>
                            </div>

                            {order.review && (
                              <RatingStars
                                value={
                                  order.review.rating
                                }
                                size={20}
                              />
                            )}
                          </div>

                          {isEditing ? (
                            <div className="rounded-2xl border border-brand/20 bg-brand-light/40 p-4">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <p className="font-semibold text-text-strong">
                                    {order.review
                                      ? "Chỉnh sửa đánh giá"
                                      : "Đánh giá trải nghiệm"}
                                  </p>

                                  <p className="mt-1 text-xs text-text-muted">
                                    Chọn số sao và chia sẻ cảm nhận của bạn.
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={closeEditor}
                                  disabled={saving}
                                  className="flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition hover:bg-surface hover:text-text-strong disabled:opacity-50"
                                  aria-label="Đóng form đánh giá"
                                >
                                  <X size={18} />
                                </button>
                              </div>

                              <div className="mt-5">
                                <label className="mb-2 block text-sm font-semibold text-text-default">
                                  Mức độ hài lòng
                                </label>

                                <RatingStars
                                  value={form.rating}
                                  editable
                                  size={28}
                                  onChange={(rating) =>
                                    setForm(
                                      (current) => ({
                                        ...current,
                                        rating,
                                      }),
                                    )
                                  }
                                />

                                <p className="mt-2 text-xs text-text-muted">
                                  {form.rating > 0
                                    ? `${form.rating}/5 sao`
                                    : "Chưa chọn số sao"}
                                </p>
                              </div>

                              <div className="mt-5">
                                <div className="mb-2 flex items-center justify-between gap-3">
                                  <label className="text-sm font-semibold text-text-default">
                                    Nội dung đánh giá
                                  </label>

                                  <span className="text-xs text-text-subtle">
                                    {
                                      form
                                        .reviewContent
                                        .length
                                    }
                                    /2000
                                  </span>
                                </div>

                                <textarea
                                  rows={5}
                                  maxLength={2000}
                                  value={
                                    form.reviewContent
                                  }
                                  onChange={(event) =>
                                    setForm(
                                      (current) => ({
                                        ...current,
                                        reviewContent:
                                          event.target
                                            .value,
                                      }),
                                    )
                                  }
                                  placeholder="Hãy chia sẻ chất lượng sản phẩm, thời gian thực hiện hoặc trải nghiệm phục vụ..."
                                  className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-sm leading-6 text-text-default outline-none transition placeholder:text-text-subtle focus:border-brand focus:ring-2 focus:ring-brand/10"
                                />
                              </div>

                              <div className="mt-4">
                                <label className="mb-2 block text-sm font-semibold text-text-default">
                                  Tên công ty
                                  <span className="ml-1 font-normal text-text-subtle">
                                    (không bắt buộc)
                                  </span>
                                </label>

                                <input
                                  type="text"
                                  maxLength={150}
                                  value={
                                    form.companyName
                                  }
                                  onChange={(event) =>
                                    setForm(
                                      (current) => ({
                                        ...current,
                                        companyName:
                                          event.target
                                            .value,
                                      }),
                                    )
                                  }
                                  placeholder="Nhập tên công ty"
                                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-default outline-none transition placeholder:text-text-subtle focus:border-brand focus:ring-2 focus:ring-brand/10"
                                />
                              </div>

                              <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-border bg-surface p-3">
                                <div className="flex items-center gap-3">
                                  <span
                                    className={`
                                      flex h-9 w-9 items-center
                                      justify-center rounded-xl
                                      ${
                                        form.isPublic
                                          ? "bg-success-soft text-success"
                                          : "bg-surface-muted text-text-muted"
                                      }
                                    `}
                                  >
                                    {form.isPublic ? (
                                      <Eye size={18} />
                                    ) : (
                                      <EyeOff size={18} />
                                    )}
                                  </span>

                                  <div>
                                    <p className="text-sm font-semibold text-text-default">
                                      Hiển thị công khai
                                    </p>

                                    <p className="text-xs text-text-muted">
                                      Cho phép hiển thị đánh giá trên website.
                                    </p>
                                  </div>
                                </div>

                                <Switch
                                  checked={
                                    form.isPublic
                                  }
                                  onChange={(
                                    isPublic,
                                  ) =>
                                    setForm(
                                      (current) => ({
                                        ...current,
                                        isPublic,
                                      }),
                                    )
                                  }
                                />
                              </div>

                              <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <button
                                  type="button"
                                  onClick={closeEditor}
                                  disabled={saving}
                                  className="rounded-xl border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-text-default transition hover:bg-surface-subtle disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  Hủy
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleSubmit(order)
                                  }
                                  disabled={saving}
                                  className="rounded-xl bg-brand! px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {saving
                                    ? "Đang lưu..."
                                    : order.review
                                      ? "Cập nhật đánh giá"
                                      : "Gửi đánh giá"}
                                </button>
                              </div>
                            </div>
                          ) : order.review ? (
                            <div>
                              <div className="rounded-2xl bg-surface-subtle p-4">
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-2">
                                    <MessageSquare
                                      size={17}
                                      className="text-brand"
                                    />

                                    <p className="text-sm font-semibold text-text-strong">
                                      Đánh giá của bạn
                                    </p>
                                  </div>

                                  <span
                                    className={`
                                      inline-flex items-center gap-1.5
                                      rounded-full px-2.5 py-1
                                      text-xs font-semibold
                                      ${
                                        order.review
                                          .isPublic
                                          ? "bg-success-soft text-success"
                                          : "bg-surface-muted text-text-muted"
                                      }
                                    `}
                                  >
                                    {order.review
                                      .isPublic ? (
                                      <Eye size={13} />
                                    ) : (
                                      <EyeOff size={13} />
                                    )}

                                    {order.review
                                      .isPublic
                                      ? "Công khai"
                                      : "Riêng tư"}
                                  </span>
                                </div>

                                <p className="mt-3 whitespace-pre-wrap wrap-break-word text-sm leading-6 text-text-default">
                                  {
                                    order.review
                                      .reviewContent
                                  }
                                </p>

                                {order.review
                                  .companyName && (
                                  <p className="mt-3 border-t border-border-subtle pt-3 text-xs text-text-muted">
                                    Công ty:{" "}
                                    <strong className="font-semibold text-text-default">
                                      {
                                        order.review
                                          .companyName
                                      }
                                    </strong>
                                  </p>
                                )}
                              </div>

                              <div className="mt-4 flex flex-wrap justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    openEditor(order)
                                  }
                                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-text-default transition hover:border-brand hover:text-brand"
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
                                  Xóa đánh giá
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-border bg-surface-subtle p-5 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="font-semibold text-text-strong">
                                  Bạn chưa đánh giá đơn hàng này
                                </p>

                                <p className="mt-1 text-sm leading-6 text-text-muted">
                                  Chia sẻ trải nghiệm để giúp chúng tôi cải thiện dịch vụ.
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  openEditor(order)
                                }
                                className="shrink-0 rounded-xl bg-brand! px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                              >
                                Đánh giá ngay
                              </button>
                            </div>
                          )}
                        </div>
                      </article>
                    );
                  },
                )}
              </div>
            )}
          </div>
        )}
      </SectionCard>

      {previewImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Xem ảnh sản phẩm"
          onClick={() =>
            setPreviewImage(null)
          }
          className="
            fixed inset-0 z-70
            flex items-center justify-center
            bg-black/75 p-4
            backdrop-blur-sm
          "
        >
          <div
            onClick={(event) =>
              event.stopPropagation()
            }
            className="
              relative flex max-h-[92vh]
              w-full max-w-5xl
              flex-col overflow-hidden
              rounded-3xl bg-surface
              shadow-2xl
            "
          >
            <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-brand">
                  {previewImage.orderCode}
                </p>

                <h3 className="mt-1 truncate font-semibold text-text-strong">
                  {previewImage.productName}
                </h3>
              </div>

              <button
                type="button"
                onClick={() =>
                  setPreviewImage(null)
                }
                aria-label="Đóng ảnh"
                className="
                  flex h-10 w-10 shrink-0
                  items-center justify-center
                  rounded-full text-text-muted
                  transition
                  hover:bg-surface-muted
                  hover:text-text-strong
                "
              >
                <X size={21} />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 items-center justify-center bg-black/5 p-4">
              <img
                src={previewImage.src}
                alt={previewImage.alt}
                className="
                  max-h-[78vh]
                  max-w-full
                  rounded-xl
                  object-contain
                "
              />
            </div>
          </div>
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
        Bạn vẫn có thể gửi đánh giá mới cho
        đơn hàng này sau khi xóa.
      </ConfirmModal>
    </>
  );
};

export default ServiceReviewPage;