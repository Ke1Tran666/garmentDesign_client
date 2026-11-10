import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit3,
  Eye,
  EyeOff,
  MessageSquare,
  PackageCheck,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  Trash2,
  X,
  ZoomIn,
} from "lucide-react";
import { useOutletContext } from "react-router-dom";

import { useNotification } from "@/app/providers/NotificationProvider";
import { serviceReviewApi } from "@/features/service-reviews/api/serviceReviewApi";
import { BACKEND_URL } from "@/shared/config/apiConfig";
import { StatusBadge } from "@/shared/ui/badge/StatusBadge";
import PageHeader from "@/shared/ui/heading/PageHeader";
import ConfirmModal from "@/shared/ui/modal/ConfirmModal";
import { GridSkeleton } from "@/shared/ui/skeleton";
import StatCard from "@/shared/ui/stats/StatCard";
import Switch from "@/shared/ui/switch/Switch";

const EMPTY_FORM = {
  rating: 0,
  reviewContent: "",
  companyName: "",
  isPublic: true,
};

const FILTERS = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chưa đánh giá" },
  { value: "reviewed", label: "Đã đánh giá" },
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

  return `${BACKEND_URL}${value.startsWith("/") ? value : `/${value}`}`;
};

const RatingStars = ({ value, editable = false, onChange, size = 21 }) => (
  <div className="flex items-center gap-1" aria-label={`${value} trên 5 sao`}>
    {[1, 2, 3, 4, 5].map((star) => {
      const selected = star <= value;

      return (
        <button
          key={star}
          type="button"
          disabled={!editable}
          onClick={() => onChange?.(star)}
          aria-label={`Đánh giá ${star} sao`}
          className={`rounded-md p-0.5 transition ${
            editable
              ? "cursor-pointer hover:-translate-y-0.5 hover:scale-110"
              : "cursor-default"
          }`}
        >
          <Star
            size={size}
            strokeWidth={1.8}
            className={
              selected
                ? "fill-amber-400 text-amber-400"
                : "text-slate-300 dark:text-slate-700"
            }
          />
        </button>
      );
    })}
  </div>
);

const ServiceReviewPage = () => {
  const { showNotification } = useNotification();
  const { searchKeyword: topbarSearch = "" } = useOutletContext() || {};

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchValue, setSearchValue] = useState("");
  const [previewImage, setPreviewImage] = useState(null);

  const deferredSearchValue = useDeferredValue(searchValue || topbarSearch);

  const reloadReviewableOrders = useCallback(async () => {
    try {
      setRefreshing(true);

      const data = await serviceReviewApi.getReviewableOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Không thể tải danh sách đánh giá:", error);
      setOrders([]);

      showNotification(
        "error",
        "Không thể tải dữ liệu",
        error.response?.data?.message ||
          "Không thể tải danh sách đơn hàng có thể đánh giá.",
      );
    } finally {
      setRefreshing(false);
    }
  }, [showNotification]);

  useEffect(() => {
    let active = true;

    serviceReviewApi
      .getReviewableOrders()
      .then((data) => {
        if (!active) return;
        setOrders(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        if (!active) return;
        console.error("Không thể tải danh sách đánh giá:", error);
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
    if (!previewImage) return undefined;

    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setPreviewImage(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [previewImage]);

  const statistics = useMemo(() => {
    const reviewed = orders.filter((order) => Boolean(order.review));
    const pending = orders.length - reviewed.length;

    const totalRating = reviewed.reduce(
      (total, order) => total + Number(order.review?.rating || 0),
      0,
    );

    const average =
      reviewed.length === 0
        ? "0.0"
        : (totalRating / reviewed.length).toFixed(1);

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
        (filter === "reviewed" && Boolean(order.review)) ||
        (filter === "pending" && !order.review);

      if (!matchesFilter) return false;
      if (!keyword) return true;

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

      return searchableContent.includes(keyword);
    });
  }, [deferredSearchValue, filter, orders]);

  const hasSearch = deferredSearchValue.trim().length > 0;

  const openEditor = (order) => {
    const review = order.review;
    setEditingOrderId(order.serviceOrderId);

    setForm({
      rating: review?.rating || 0,
      reviewContent: review?.reviewContent || "",
      companyName: review?.companyName || "",
      isPublic: review?.isPublic ?? true,
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
      reviewContent: form.reviewContent.trim(),
      companyName: form.companyName.trim() || null,
      isPublic: form.isPublic,
    };

    try {
      setSaving(true);

      const savedReview = order.review
        ? await serviceReviewApi.update(order.review.reviewId, payload)
        : await serviceReviewApi.create(order.serviceOrderId, payload);

      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          currentOrder.serviceOrderId === order.serviceOrderId
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
        order.review ? "Đã cập nhật đánh giá" : "Đã gửi đánh giá",
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

    if (!reviewId || !orderId) return;

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
    <div className="animate-in space-y-6 duration-200 fade-in">
      {/* 1. Page Header */}
      <PageHeader
        title="Đánh giá dịch vụ"
        badge={
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {orders.length} đơn hoàn thành
          </span>
        }
        description="Chia sẻ trải nghiệm và mức độ hài lòng của bạn đối với các đơn hàng đã nghiệm thu."
        actions={
          <button
            type="button"
            onClick={reloadReviewableOrders}
            disabled={refreshing || loading}
            className="flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            title="Làm mới dữ liệu"
          >
            <RefreshCw
              size={14}
              className={
                refreshing ? "animate-spin text-brand" : "text-slate-400"
              }
            />
            <span className="hidden sm:inline">Làm mới</span>
          </button>
        }
      />

      {/* 2. Metric Stats Cards */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Đơn hoàn thành"
          value={statistics.total}
          subtitle="đủ điều kiện đánh giá"
          icon={PackageCheck}
          iconColorClass="bg-blue-50 text-brand dark:bg-blue-950/50 dark:text-blue-400"
          hoverBorderClass="hover:border-blue-300"
          onClick={() => setFilter("all")}
        />

        <StatCard
          title="Đã đánh giá"
          value={statistics.reviewed}
          subtitle="đánh giá đã gửi"
          icon={CheckCircle2}
          iconColorClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
          hoverBorderClass="hover:border-emerald-300"
          onClick={() => setFilter("reviewed")}
        />

        <StatCard
          title="Chờ đánh giá"
          value={statistics.pending}
          subtitle="chưa gửi phản hồi"
          icon={Clock3}
          iconColorClass="bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
          hoverBorderClass="hover:border-amber-300"
          onClick={() => setFilter("pending")}
        />

        <StatCard
          title="Điểm trung bình"
          value={`${statistics.average} / 5`}
          subtitle="mức độ hài lòng"
          icon={Sparkles}
          iconColorClass="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
        />
      </section>

      {/* 3. Toolbar & Filter Pills */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs lg:flex-row lg:items-center lg:justify-between dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTERS.map((item) => {
            const active = filter === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                className={`cursor-pointer rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  active
                    ? "bg-brand! text-white! shadow-xs"
                    : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-72">
          <Search
            size={15}
            className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Tìm mã đơn, sản phẩm..."
            className="h-9.5 w-full rounded-xl border border-slate-200 bg-slate-50/70 pr-3 pl-9.5 text-xs text-slate-800 transition-all placeholder:text-slate-400 focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/10 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
          />
        </div>
      </div>

      {/* 4. Review Cards Grid */}
      {loading ? (
        <GridSkeleton count={4} columns="grid-cols-1 xl:grid-cols-2" />
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center dark:border-slate-800 dark:bg-slate-900">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
            <MessageSquare size={26} />
          </span>

          <h2 className="mt-4 font-heading text-base font-bold text-slate-900 dark:text-white">
            {hasSearch
              ? "Không tìm thấy đơn hàng"
              : orders.length === 0
                ? "Chưa có đơn hàng đủ điều kiện"
                : "Không có đơn hàng trong mục này"}
          </h2>

          <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-slate-500 sm:text-sm dark:text-slate-400">
            {hasSearch
              ? `Không có kết quả phù hợp với “${deferredSearchValue.trim()}”.`
              : orders.length === 0
                ? "Đơn hàng sẽ xuất hiện tại đây khi đã được hoàn thành và bàn giao."
                : "Hãy chọn một bộ lọc khác để xem danh sách đơn hàng."}
          </p>

          {hasSearch && (
            <button
              type="button"
              onClick={() => setSearchValue("")}
              className="mt-5 cursor-pointer rounded-xl bg-brand! px-4 py-2 text-xs font-semibold text-white! shadow-xs transition hover:bg-brand-hover!"
            >
              Xóa tìm kiếm
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {filteredOrders.map((order) => {
            const isEditing = editingOrderId === order.serviceOrderId;
            const productImage = resolveProductImage(order.productImage);

            return (
              <article
                key={order.serviceOrderId}
                className={`overflow-hidden rounded-2xl border bg-white shadow-xs transition-all duration-200 dark:bg-slate-900 ${
                  isEditing
                    ? "border-brand ring-2 ring-brand/15"
                    : "border-slate-200/80 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:hover:border-slate-700"
                }`}
              >
                <div className="flex gap-4 border-b border-slate-100 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-800/40">
                  <button
                    type="button"
                    disabled={!productImage}
                    onClick={() => {
                      if (!productImage) return;

                      setPreviewImage({
                        src: productImage,
                        alt: order.productName || "Ảnh sản phẩm",
                        orderCode: order.orderCode,
                        productName: order.productName || "Đơn hàng dịch vụ",
                      });
                    }}
                    aria-label={
                      productImage
                        ? `Xem ảnh ${order.productName || "sản phẩm"}`
                        : "Đơn hàng chưa có ảnh"
                    }
                    className={`group relative flex h-18 w-18 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200/80 bg-white dark:border-slate-700 dark:bg-slate-900 ${
                      productImage ? "cursor-zoom-in" : "cursor-default"
                    }`}
                  >
                    {productImage ? (
                      <>
                        <img
                          src={productImage}
                          alt={order.productName || "Sản phẩm"}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                        />
                        <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition group-hover:bg-black/35 group-hover:opacity-100">
                          <ZoomIn size={20} />
                        </span>
                      </>
                    ) : (
                      <PackageCheck size={24} className="text-slate-400" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold tracking-wider text-brand uppercase">
                        {order.orderCode}
                      </span>

                      <StatusBadge
                        label={order.review ? "Đã đánh giá" : "Chờ đánh giá"}
                        tone={order.review ? "success" : "warning"}
                      />
                    </div>

                    <h2 className="mt-1.5 truncate font-heading text-base font-bold text-slate-900 dark:text-white">
                      {order.productName || "Đơn hàng dịch vụ"}
                    </h2>

                    <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                      {order.serviceName || "Chưa có tên dịch vụ"}
                    </p>
                  </div>
                </div>

                <div className="p-5">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <CalendarDays size={15} className="text-brand" />
                      <span>
                        Hoàn thành:{" "}
                        <strong className="font-semibold text-slate-800 dark:text-slate-200">
                          {formatDate(order.completedDate)}
                        </strong>
                      </span>
                    </div>

                    {order.review && (
                      <RatingStars value={order.review.rating} size={18} />
                    )}
                  </div>

                  {isEditing ? (
                    <div className="rounded-2xl border border-brand/20 bg-brand-light/40 p-4 dark:bg-brand/10">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            {order.review
                              ? "Chỉnh sửa đánh giá"
                              : "Đánh giá trải nghiệm"}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            Chọn số sao và chia sẻ cảm nhận của bạn.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={closeEditor}
                          disabled={saving}
                          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-slate-700 disabled:opacity-50 dark:hover:bg-slate-800"
                          aria-label="Đóng form đánh giá"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <div className="mt-4">
                        <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                          Mức độ hài lòng
                        </label>

                        <RatingStars
                          value={form.rating}
                          editable
                          size={26}
                          onChange={(rating) =>
                            setForm((current) => ({
                              ...current,
                              rating,
                            }))
                          }
                        />

                        <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                          {form.rating > 0
                            ? `${form.rating}/5 sao`
                            : "Chưa chọn số sao"}
                        </p>
                      </div>

                      <div className="mt-4">
                        <div className="mb-1.5 flex items-center justify-between gap-3">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                            Nội dung đánh giá
                          </label>
                          <span className="text-[11px] text-slate-400">
                            {form.reviewContent.length}/2000
                          </span>
                        </div>

                        <textarea
                          rows={4}
                          maxLength={2000}
                          value={form.reviewContent}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              reviewContent: event.target.value,
                            }))
                          }
                          placeholder="Hãy chia sẻ chất lượng sản phẩm, thời gian thực hiện hoặc trải nghiệm phục vụ..."
                          className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs leading-6 text-slate-800 transition outline-none placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        />
                      </div>

                      <div className="mt-3.5">
                        <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                          Tên công ty{" "}
                          <span className="font-normal text-slate-400">
                            (không bắt buộc)
                          </span>
                        </label>

                        <input
                          type="text"
                          maxLength={150}
                          value={form.companyName}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              companyName: event.target.value,
                            }))
                          }
                          placeholder="Nhập tên công ty"
                          className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs text-slate-800 transition outline-none placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        />
                      </div>

                      <div className="mt-3.5 flex items-center justify-between gap-4 rounded-xl border border-slate-200/80 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                              form.isPublic
                                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
                                : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                            }`}
                          >
                            {form.isPublic ? (
                              <Eye size={16} />
                            ) : (
                              <EyeOff size={16} />
                            )}
                          </span>

                          <div>
                            <p className="text-xs font-semibold text-slate-800 dark:text-white">
                              Hiển thị công khai
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Cho phép hiển thị đánh giá trên trang chủ.
                            </p>
                          </div>
                        </div>

                        <Switch
                          checked={form.isPublic}
                          onChange={(isPublic) =>
                            setForm((current) => ({
                              ...current,
                              isPublic,
                            }))
                          }
                        />
                      </div>

                      <div className="mt-4 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
                        <button
                          type="button"
                          onClick={closeEditor}
                          disabled={saving}
                          className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                          Hủy
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSubmit(order)}
                          disabled={saving}
                          className="cursor-pointer rounded-xl bg-brand! px-4 py-2 text-xs font-semibold text-white! shadow-xs transition hover:bg-brand-hover! disabled:cursor-not-allowed disabled:opacity-60"
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
                      <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <MessageSquare size={15} className="text-brand" />
                            <p className="text-xs font-bold text-slate-900 dark:text-white">
                              Đánh giá của bạn
                            </p>
                          </div>

                          <StatusBadge
                            label={
                              order.review.isPublic ? "Công khai" : "Riêng tư"
                            }
                            tone={order.review.isPublic ? "success" : "neutral"}
                          />
                        </div>

                        <p className="mt-2.5 text-xs leading-6 wrap-break-word whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                          {order.review.reviewContent}
                        </p>

                        {order.review.companyName && (
                          <p className="mt-3 border-t border-slate-200/60 pt-2.5 text-[11px] text-slate-500 dark:border-slate-700 dark:text-slate-400">
                            Công ty:{" "}
                            <strong className="font-semibold text-slate-800 dark:text-slate-200">
                              {order.review.companyName}
                            </strong>
                          </p>
                        )}
                      </div>

                      <div className="mt-3.5 flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditor(order)}
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:border-brand hover:text-brand dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                        >
                          <Edit3 size={14} />
                          <span>Chỉnh sửa</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteTarget(order)}
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400"
                        >
                          <Trash2 size={14} />
                          <span>Xóa đánh giá</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-800/30">
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-white">
                          Bạn chưa đánh giá đơn hàng này
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          Chia sẻ trải nghiệm để giúp chúng tôi nâng cao chất
                          lượng dịch vụ.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => openEditor(order)}
                        className="shrink-0 cursor-pointer rounded-xl bg-brand! px-4 py-2 text-xs font-semibold text-white! shadow-xs transition hover:bg-brand-hover!"
                      >
                        Đánh giá ngay
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {previewImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Xem ảnh sản phẩm"
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-70 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900"
          >
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
              <div className="min-w-0">
                <p className="font-mono text-xs font-bold tracking-wider text-brand uppercase">
                  {previewImage.orderCode}
                </p>
                <h3 className="mt-1 truncate font-heading font-bold text-slate-900 dark:text-white">
                  {previewImage.productName}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                aria-label="Đóng ảnh"
                className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 items-center justify-center bg-slate-950/5 p-4">
              <img
                src={previewImage.src}
                alt={previewImage.alt}
                className="max-h-[78vh] max-w-full rounded-xl object-contain"
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
        Đánh giá sẽ được ẩn khỏi hệ thống. Bạn vẫn có thể gửi đánh giá mới cho
        đơn hàng này sau khi xóa.
      </ConfirmModal>
    </div>
  );
};

export default ServiceReviewPage;
