import { memo, useEffect, useMemo, useState } from "react";
import {
  Building2,
  CalendarDays,
  CreditCard,
  Download,
  FileText,
  ImagePlus,
  LoaderCircle,
  MapPin,
  Paperclip,
  Pencil,
  Save,
  Trash2,
  User,
  X,
} from "lucide-react";
import { BACKEND_URL } from "@/api/config";
import { authStorage } from "@/lib/authStorage";
import { userApi } from "@/api/userApi";
import { addressApi } from "@/api/addressApi";
import { serviceOrderFileApi } from "@/api/serviceOrderFileApi";
import { serviceOrderApi } from "@/api/serviceOrderApi";
import { useFileUpload } from "@/hooks/useFileUpload";
import ProductImagePicker from "@/components/ui/FileUpload/ProductImagePicker";
import AttachmentPicker from "@/components/ui/FileUpload/AttachmentPicker";

const EMPTY_VALUE = "Chưa có thông tin";

const employeeNameCache = new Map();

const DATE_FORMATTER = new Intl.DateTimeFormat(
  "vi-VN",
  {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }
);

const DATE_TIME_FORMATTER =
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const CURRENCY_FORMATTER =
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  });

const hasValue = (value) =>
  value !== null &&
  value !== undefined &&
  value !== "";

const formatDate = (
  value,
  includeTime = false
) => {
  if (!value) return EMPTY_VALUE;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return includeTime
    ? DATE_TIME_FORMATTER.format(date)
    : DATE_FORMATTER.format(date);
};

const formatCurrency = (value) => {
  if (!hasValue(value)) return EMPTY_VALUE;

  const number = Number(value);

  return Number.isNaN(number)
    ? String(value)
    : CURRENCY_FORMATTER.format(number);
};

const resolveBackendUrl = (url) => {
  if (!url) return "";

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return `${BACKEND_URL}${
    url.startsWith("/") ? url : `/${url}`
  }`;
};

const getStatusStyle = (status) => {
  const text = String(status || "").toLowerCase();

  if (
    text.includes("hoàn") ||
    text.includes("complete")
  ) {
    return {
      badge:
        "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
      dot: "bg-emerald-500",
    };
  }

  if (
    text.includes("hủy") ||
    text.includes("cancel")
  ) {
    return {
      badge:
        "bg-red-50 text-red-700 ring-red-600/20",
      dot: "bg-red-500",
    };
  }

  if (
    text.includes("chờ") ||
    text.includes("pending")
  ) {
    return {
      badge:
        "bg-amber-50 text-amber-700 ring-amber-600/20",
      dot: "bg-amber-500",
    };
  }

  return {
    badge:
      "bg-blue-50 text-blue-700 ring-blue-600/20",
    dot: "bg-blue-500",
  };
};

const InfoItem = ({
  label,
  value,
  fullWidth = false,
}) => (
  <div
    className={
      fullWidth ? "sm:col-span-2" : ""
    }
  >
    <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
      {label}
    </dt>

    <dd className="mt-1.5 wrap-break-word text-sm font-medium leading-6 text-gray-800">
      {hasValue(value)
        ? value
        : EMPTY_VALUE}
    </dd>
  </div>
);

const CardHeader = ({
  icon: Icon,
  title,
  description,
  iconClassName = "bg-gray-100 text-gray-600",
  action,
}) => (
  <div className="flex items-start justify-between gap-4">
    <div className="flex min-w-0 items-center gap-3">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${iconClassName}`}
      >
        <Icon size={21} />
      </div>

      <div className="min-w-0">
        <h4 className="font-bold text-gray-950">
          {title}
        </h4>

        {description && (
          <p className="mt-0.5 text-xs text-gray-500">
            {description}
          </p>
        )}
      </div>
    </div>

    {action && (
      <div className="shrink-0">
        {action}
      </div>
    )}
  </div>
);

const ServiceOrderDetailModal = ({
  open,
  order,
  onClose,
  onUpdated,
  title = "Chi tiết đơn hàng",
}) => {
  const [employeeNames, setEmployeeNames] = useState({});

  const [isEditingProduct, setIsEditingProduct] = useState(false);

  const [editForm, setEditForm] = useState({
    productName: "",
    unitType: "",
    quantity: "",
    customerRequest: "",
  });

  const [deletingFileId, setDeletingFileId] = useState(null);

  const [fileError, setFileError] = useState("");

  const [updateError, setUpdateError] = useState("");

  const {
    productImageFile,
    productImagePreview,
    attachmentFiles,
    hasUpload,
    handleProductImageChange,
    handleAttachmentChange,
    removeAttachment,
    resetFiles,
    validateTotalSize,
    buildFormData,
  } = useFileUpload({
    onError: setUpdateError,
  });

  const [fileState, setFileState] = useState({orderId: null,items: []});

  const [updating, setUpdating] = useState(false);



  const [addressState, setAddressState] = useState({
    idUser: null,
    items: [],
    error: "",
  });

  const [isEditingAddress, setIsEditingAddress] =
    useState(false);

  const [selectedAddressId, setSelectedAddressId] =
    useState("");

  const [updatingAddress, setUpdatingAddress] =
    useState(false);

  const [addressError, setAddressError] =
    useState("");

  const currentUserId = authStorage.getUserId();

  const userAddresses =
    addressState.idUser === currentUserId
      ? addressState.items
      : [];

  const addressesLoading =
    isEditingAddress &&
    Boolean(currentUserId) &&
    addressState.idUser !== currentUserId;

  const defaultAddressId =
    order?.user?.defaultAddress?.addressId;

  useEffect(() => {
    if (
      !open ||
      !isEditingAddress ||
      !currentUserId ||
      addressState.idUser === currentUserId
    ) {
      return undefined;
    }

    const controller = new AbortController();

    const fetchUserAddresses = async () => {
      try {
        const addresses = await addressApi.getByUser(
          currentUserId,
          {
            signal: controller.signal,
          },
        );

        if (controller.signal.aborted) return;

        setAddressState({
          idUser: currentUserId,
          items: addresses || [],
          error: "",
        });
      } catch (error) {
        if (
          error.code === "ERR_CANCELED" ||
          error.name === "CanceledError"
        ) {
          return;
        }

        console.error(
          "Không thể tải địa chỉ:",
          error
        );

        setAddressState({
          idUser: currentUserId,
          items: [],
          error:
            error.response?.data?.message ||
            "Không thể tải danh sách địa chỉ.",
        });
      }
    };

    fetchUserAddresses();

    return () => controller.abort();
  }, [
    open,
    isEditingAddress,
    currentUserId,
    addressState.idUser,
  ]);

  const orderId = order?.serviceOrderId;
  const createdBy = order?.createdBy;
  const updatedBy = order?.updatedBy;
  const serviceTags = order?.service?.tags;

  const tags = useMemo(() => {
    if (!serviceTags) return [];

    return String(serviceTags)
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }, [serviceTags]);

  /*
   * Ghép ảnh đại diện từ Service_Orders
   * với file bổ sung từ Service_Order_Files.
   */
  const displayFiles = useMemo(() => {
    const uploadedFiles =
      fileState.orderId === orderId
        ? fileState.items
        : [];

    const productImage =
      order?.productImage;

    const productImageItem =
      productImage
        ? {
            fileId: `product-image-${orderId}`,
            fileName: order.productName
              ? `Ảnh đại diện - ${order.productName}`
              : "Ảnh đại diện sản phẩm",
            fileType: "image/product",
            contentUrl: productImage,
            uploadedAt:
              order.updatedAt ||
              order.createdAt,
            isProductImage: true,
          }
        : null;

    /*
     * Loại record cũ nếu phiên bản trước
     * từng lưu ảnh đại diện trong order-files.
     */
    const additionalFiles =
      uploadedFiles.filter(
        (file) =>
          !productImage ||
          file.contentUrl !== productImage
      );

    return productImageItem
      ? [
          productImageItem,
          ...additionalFiles,
        ]
      : additionalFiles;
  }, [fileState, order, orderId]);

  /*
  * Khóa scroll trang và xử lý phím ESC.
  */
  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow =
      document.body.style.overflow;

    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;

      if (updating || updatingAddress) {
        return;
      }

      if (isEditingProduct) {
        resetFiles();
        setIsEditingProduct(false);
        setUpdateError("");
        return;
      }

      if (isEditingAddress) {
        setIsEditingAddress(false);
        setSelectedAddressId("");
        setAddressError("");
        return;
      }

      onClose();
    };

    document.body.style.overflow = "hidden";

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    open,
    onClose,
    isEditingProduct,
    isEditingAddress,
    updating,
    updatingAddress,
    resetFiles,
  ]);

  /*
   * Lấy tên người nhận và người cập nhật.
   */
  useEffect(() => {
    if (!open) return undefined;

    const employeeIds = [
      ...new Set(
        [createdBy, updatedBy].filter(Boolean)
      ),
    ];

    const missingIds = employeeIds.filter(
      (id) => !employeeNameCache.has(id)
    );

    if (missingIds.length === 0) {
      return undefined;
    }

    const controller = new AbortController();

    const fetchEmployeeNames = async () => {
      const results =
        await Promise.allSettled(
          missingIds.map((id) =>
            userApi.getById(id, {
              signal: controller.signal,
            })
          )
        );

      if (controller.signal.aborted) return;

      const loadedNames = {};

      results.forEach((result, index) => {
        const employeeId =
          missingIds[index];

        const employeeName =
          result.status === "fulfilled"
            ? result.value?.fullName ||
              "Không xác định"
            : "Không xác định";

        employeeNameCache.set(
          employeeId,
          employeeName
        );

        loadedNames[employeeId] =
          employeeName;
      });

      setEmployeeNames(
        (previousNames) => ({
          ...previousNames,
          ...loadedNames,
        })
      );
    };

    fetchEmployeeNames();

    return () => {
      controller.abort();
    };
  }, [open, createdBy, updatedBy]);

  /*
   * Lấy file bổ sung của đơn hàng.
   */
  useEffect(() => {
    if (!open || !orderId) {
      return undefined;
    }

    const controller = new AbortController();

    const fetchFiles = async () => {
      try {
        const files = await serviceOrderFileApi.getByOrder(
          orderId,
          {
            signal: controller.signal,
          },
        );

        if (controller.signal.aborted) return;

        setFileState({
          orderId,
          items: files || [],
        });
      } catch (error) {
        if (
          error.code !== "ERR_CANCELED" &&
          error.name !== "CanceledError"
        ) {
          console.error(
            "Không thể tải danh sách file:",
            error
          );

          setFileState({
            orderId,
            items: [],
          });
        }
      }
    };

    fetchFiles();

    return () => {
      controller.abort();
    };
  }, [open, orderId]);

  if (!open || !order) return null;

  const user = order.user || {};
  const service = order.service || {};
  const address = order.address || {};

  const statusStyle = getStatusStyle(
    order.status
  );

  const orderCode = `ORD-${orderId}`;

  const unitType =
    order.unitType ||
    service.unitType ||
    "";

  const currentProductImage =
    productImagePreview ||
    resolveBackendUrl(order.productImage);

  const getEmployeeName = (employeeId) => {
    if (!employeeId) return EMPTY_VALUE;

    return (
      employeeNames[employeeId] ||
      employeeNameCache.get(employeeId) ||
      "Đang tải..."
    );
  };

  const receiverName =
    getEmployeeName(createdBy);

  const updaterName =
    getEmployeeName(updatedBy);

  const handleStartEditProduct = () => {
    if (
      isEditingAddress ||
      updatingAddress ||
      updating
    ) {
      return;
    }

    resetFiles();

    setEditForm({
      productName: order.productName || "",
      unitType,
      quantity: order.quantity ?? "",
      customerRequest:
        order.customerRequest || "",
    });

    setUpdateError("");
    setIsEditingProduct(true);
  };

  const handleCancelEditProduct = () => {
    if (updating) return;

    resetFiles();

    setIsEditingProduct(false);
    setUpdateError("");
  };

  const handleRequestClose = () => {
    if (updating || updatingAddress) {
      return;
    }

    if (isEditingProduct) {
      handleCancelEditProduct();
      return;
    }

    if (isEditingAddress) {
      handleCancelEditAddress();
      return;
    }

    onClose();
  };

  const handleEditFormChange = (event) => {
    const { name, value } = event.target;

    setEditForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  const handleDeleteUploadedFile = async (
    file
  ) => {
    /*
    * Ảnh đại diện là dữ liệu tổng hợp từ
    * Service_Orders nên không xóa ở đây.
    */
    if (
      file.isProductImage ||
      !file.fileId
    ) {
      return;
    }

    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa file "${file.fileName}" không?`
    );

    if (!confirmed) return;

    const idUser = authStorage.getUserId();

    if (!idUser) {
      setFileError(
        "Không tìm thấy thông tin người dùng."
      );
      return;
    }

    try {
      setDeletingFileId(file.fileId);
      setFileError("");

      await serviceOrderFileApi.remove(file.fileId,idUser);

      setFileState((previousState) => ({
        ...previousState,
        items: previousState.items.filter(
          (item) =>
            item.fileId !== file.fileId
        ),
      }));
    } catch (error) {
      console.error(
        "Không thể xóa file:",
        error
      );

      setFileError(
        error.response?.data?.message ||
          "Không thể xóa file. Vui lòng thử lại."
      );
    } finally {
      setDeletingFileId(null);
    }
  };

  const handleUpdateProduct = async (
    event
  ) => {
    event.preventDefault();

    const productName =
      editForm.productName.trim();

    const unitTypeValue =
      editForm.unitType.trim();

    const quantity = Number(
      editForm.quantity
    );

    const customerRequest =
      editForm.customerRequest.trim();

    if (!productName) {
      setUpdateError(
        "Vui lòng nhập tên sản phẩm."
      );
      return;
    }

    if (!unitTypeValue) {
      setUpdateError(
        "Vui lòng nhập đơn vị tính."
      );
      return;
    }

    if (
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      setUpdateError(
        "Số lượng phải lớn hơn 0."
      );
      return;
    }

    const idUser =authStorage.getUserId();

    if (!idUser) {
      setUpdateError(
        "Không tìm thấy thông tin người dùng."
      );
      return;
    }

    if (!validateTotalSize()) {
      return;
    }

    try {
      setUpdating(true);
      setUpdateError("");

      /*
       * Cập nhật thông tin đơn hàng trước.
       * Endpoint này không cập nhật audit fields.
       */
      let updatedOrder =
        await serviceOrderApi.updateForUser(
          orderId,
          idUser,
          {
            productName,
            unitType: unitTypeValue,
            quantity,
            customerRequest,
          },
        );

      /*
       * Upload ảnh đại diện và file bổ sung.
       */
      if (hasUpload) {
        const uploadData = buildFormData(
          "File do khách hàng cung cấp",
        );

        try {
          const uploadResult =
            await serviceOrderFileApi.upload(
              orderId,
              idUser,
              uploadData,
            );

          updatedOrder =
            uploadResult?.order || updatedOrder;

          const newFiles =
            uploadResult?.files || [];

          setFileState(
            (previousState) => {
              const previousItems =
                previousState.orderId === orderId
                  ? previousState.items
                  : [];

              const fileMap = new Map();

              [
                ...previousItems,
                ...newFiles,
              ].forEach((file) => {
                fileMap.set(
                  file.fileId,
                  file
                );
              });

              return {
                orderId,
                items: Array.from(
                  fileMap.values()
                ),
              };
            }
          );
        } catch (uploadError) {
          /*
           * Thông tin đã cập nhật thành công,
           * nhưng ảnh/file upload thất bại.
           */
          onUpdated?.(updatedOrder);

          setUpdateError(
            uploadError.response?.data?.message ||
              "Thông tin đã được cập nhật, nhưng ảnh hoặc file tải lên thất bại."
          );

          return;
        }
      }

      onUpdated?.(updatedOrder);

      resetFiles();

      setIsEditingProduct(false);
    } catch (error) {
      console.error(
        "Không thể cập nhật đơn hàng:",
        error
      );

      setUpdateError(
        error.response?.data?.message ||
          "Không thể cập nhật đơn hàng. Vui lòng thử lại."
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleStartEditAddress = () => {
    if (
      updatingAddress ||
      updating ||
      isEditingProduct
    ) {
      return;
    }

    setSelectedAddressId(
      order.address?.addressId != null
        ? String(order.address.addressId)
        : ""
    );

    setAddressError("");
    setIsEditingAddress(true);
  };

  const handleCancelEditAddress = () => {
    if (updatingAddress) return;

    setSelectedAddressId("");
    setAddressError("");
    setIsEditingAddress(false);
  };

  const handleUpdateAddress = async () => {
    const addressId = Number(
      selectedAddressId
    );

    if (
      !Number.isInteger(addressId) ||
      addressId <= 0
    ) {
      setAddressError(
        "Vui lòng chọn một địa chỉ nhận hàng."
      );
      return;
    }

    if (!currentUserId) {
      setAddressError(
        "Không tìm thấy thông tin người dùng."
      );
      return;
    }

    /*
    * Không gọi API nếu người dùng vẫn chọn
    * đúng địa chỉ hiện tại.
    */
    if (
      String(order.address?.addressId) ===
      String(addressId)
    ) {
      setSelectedAddressId("");
      setAddressError("");
      setIsEditingAddress(false);
      return;
    }

    try {
      setUpdatingAddress(true);
      setAddressError("");

      const updatedOrder =
        await serviceOrderApi.updateAddress(
          orderId,
          currentUserId,
          addressId,
        );

      onUpdated?.(updatedOrder);

      setSelectedAddressId("");
      setAddressError("");
      setIsEditingAddress(false);
    } catch (error) {
      console.error(
        "Không thể cập nhật địa chỉ:",
        error
      );

      setAddressError(
        error.response?.data?.message ||
          "Không thể cập nhật địa chỉ. Vui lòng thử lại."
      );
    } finally {
      setUpdatingAddress(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-70 flex items-center justify-center bg-gray-950/45 px-3 py-4 animate-in fade-in duration-150 sm:px-6"
      onClick={handleRequestClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="service-order-title"
        onClick={(event) =>
          event.stopPropagation()
        }
        className="flex max-h-[96vh] w-[96vw] max-w-360 flex-col overflow-hidden rounded-3xl bg-gray-50 shadow-xl animate-in zoom-in-95 slide-in-from-bottom-2 duration-200 ease-out"
      >
        {/* Header */}
        <header className="relative shrink-0 overflow-hidden border-b border-gray-100 bg-white">
          <div className="absolute inset-x-0 top-0 h-1 bg-brand" />

          <div className="relative flex items-start justify-between gap-5 px-5 pb-5 pt-6 sm:px-7">
            <div className="flex min-w-0 items-start gap-4">
              <div className="hidden h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-brand text-white shadow-sm sm:flex">
                <FileText size={23} />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded-lg bg-brand-light px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-brand">
                    {orderCode}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyle.badge}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}
                    />

                    {order.status ||
                      "Đang xử lý"}
                  </span>
                </div>

                <div className="mt-2.5 flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-5">
                  <h2
                    id="service-order-title"
                    className="shrink-0 text-xl font-bold tracking-tight text-gray-950 sm:text-2xl"
                  >
                    {title}
                  </h2>

                  <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-gray-500">
                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                      <CalendarDays
                        size={15}
                        className="shrink-0 text-gray-400"
                      />

                      Tạo ngày{" "}
                      {formatDate(
                        order.createdAt,
                        true
                      )}
                    </span>

                    <span className="h-1 w-1 shrink-0 rounded-full bg-gray-300" />

                    <span className="truncate">
                      Khách hàng:{" "}
                      <span className="font-semibold text-gray-700">
                        {user.fullName ||
                          "Chưa xác định"}
                      </span>
                    </span>

                    {service.serviceName && (
                      <>
                        <span className="hidden h-1 w-1 shrink-0 rounded-full bg-gray-300 xl:block" />

                        <span className="hidden truncate xl:block">
                          Dịch vụ:{" "}
                          <span className="font-semibold text-gray-700">
                            {
                              service.serviceName
                            }
                          </span>
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRequestClose}
              disabled={updating || updatingAddress}
              aria-label="Đóng chi tiết đơn hàng"
              className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X
                size={19}
                className="transition-transform duration-200 group-hover:rotate-90"
              />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="overflow-y-auto">
          <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 xl:grid-cols-[minmax(0,1fr)_420px]">
            {/* Left */}
            <main className="min-w-0 space-y-6">
              <form
                id="product-edit-form"
                onSubmit={handleUpdateProduct}
                className="space-y-6"
              >
                {/* Product */}
                <section
                  className={`overflow-hidden rounded-3xl border bg-white shadow-sm transition ${
                    isEditingProduct
                      ? "border-brand/30 ring-4 ring-brand/5"
                      : "border-gray-100"
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-[320px_minmax(0,1fr)]">
                    {/* Product image */}
                    <ProductImagePicker
                      variant="overlay"
                      imageUrl={currentProductImage}
                      selectedFile={productImageFile}
                      editable={isEditingProduct}
                      disabled={updating || updatingAddress}
                      onChange={handleProductImageChange}
                      alt={order.productName || "Sản phẩm"}
                    />

                    {/* Product information */}
                    <div className="flex min-w-0 flex-col p-6 sm:p-7">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
                            {service.serviceName ||
                              "Dịch vụ"}
                          </p>

                          {isEditingProduct ? (
                            <div className="mt-3">
                              <label
                                htmlFor="productName"
                                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400"
                              >
                                Tên sản phẩm
                              </label>

                              <input
                                id="productName"
                                type="text"
                                name="productName"
                                value={
                                  editForm.productName
                                }
                                onChange={
                                  handleEditFormChange
                                }
                                disabled={updating || updatingAddress}
                                autoFocus
                                className="h-11 w-full rounded-xl border border-gray-200 px-3.5 text-base font-semibold text-gray-900 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10 disabled:bg-gray-50"
                              />
                            </div>
                          ) : (
                            <h3 className="mt-3 text-2xl font-bold leading-tight text-gray-950">
                              {order.productName ||
                                "Chưa có tên sản phẩm"}
                            </h3>
                          )}

                          <p className="mt-2 text-sm text-gray-500">
                            Mã đơn hàng{" "}
                            <span className="font-semibold text-gray-800">
                              {orderCode}
                            </span>
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          {!isEditingProduct ? (
                            <>
                              <span
                                className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold ring-1 ring-inset ${statusStyle.badge}`}
                              >
                                <span
                                  className={`h-2 w-2 rounded-full ${statusStyle.dot}`}
                                />

                                {order.status ||
                                  "Đang xử lý"}
                              </span>

                              <button
                                type="button"
                                onClick={handleStartEditProduct}
                                disabled={
                                  isEditingAddress ||
                                  updatingAddress ||
                                  updating
                                }
                                title={
                                  isEditingAddress
                                    ? "Hãy hoàn tất chỉnh sửa địa chỉ trước"
                                    : "Chỉnh sửa đơn hàng"
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition hover:border-brand/30 hover:bg-brand-light hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                <Pencil size={17} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="submit"
                                disabled={updating || updatingAddress}
                                className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-brand! px-3.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {updating ? (
                                  <LoaderCircle
                                    size={15}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Save
                                    size={15}
                                  />
                                )}

                                {updating
                                  ? "Đang cập nhật"
                                  : "Cập nhật"}
                              </button>

                              <button
                                type="button"
                                onClick={
                                  handleCancelEditProduct
                                }
                                disabled={updating || updatingAddress}
                                title="Hủy chỉnh sửa"
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                              >
                                <X size={17} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="my-6 h-px bg-gray-100" />

                      {isEditingProduct ? (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                          <div>
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400">
                              Mã dịch vụ
                            </label>

                            <div className="flex h-11 items-center rounded-xl bg-gray-100 px-3.5 text-sm font-medium text-gray-500">
                              {service.serviceCode ||
                                EMPTY_VALUE}
                            </div>
                          </div>

                          <div>
                            <label
                              htmlFor="unitType"
                              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400"
                            >
                              Đơn vị tính
                            </label>

                            <input
                              id="unitType"
                              type="text"
                              name="unitType"
                              value={
                                editForm.unitType
                              }
                              onChange={
                                handleEditFormChange
                              }
                              disabled={updating || updatingAddress}
                              className="h-11 w-full rounded-xl border border-gray-200 px-3.5 text-sm font-medium outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10 disabled:bg-gray-50"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="quantity"
                              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400"
                            >
                              Số lượng
                            </label>

                            <input
                              id="quantity"
                              type="number"
                              name="quantity"
                              min="0.01"
                              step="0.01"
                              value={
                                editForm.quantity
                              }
                              onChange={
                                handleEditFormChange
                              }
                              disabled={updating || updatingAddress}
                              className="h-11 w-full rounded-xl border border-gray-200 px-3.5 text-sm font-medium outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10 disabled:bg-gray-50"
                            />
                          </div>

                          <div>
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400">
                              Ngày tạo
                            </label>

                            <div className="flex h-11 items-center rounded-xl bg-gray-100 px-3.5 text-sm font-medium text-gray-500">
                              {formatDate(
                                order.createdAt
                              )}
                            </div>
                          </div>

                          <div className="sm:col-span-2">
                            <label
                              htmlFor="customerRequest"
                              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400"
                            >
                              Yêu cầu khách hàng
                            </label>

                            <textarea
                              id="customerRequest"
                              name="customerRequest"
                              rows={4}
                              value={
                                editForm.customerRequest
                              }
                              onChange={
                                handleEditFormChange
                              }
                              disabled={updating || updatingAddress}
                              className="w-full resize-none rounded-xl border border-gray-200 px-3.5 py-3 text-sm leading-6 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10 disabled:bg-gray-50"
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          <dl className="grid grid-cols-2 gap-x-6 gap-y-5">
                            <InfoItem
                              label="Mã dịch vụ"
                              value={
                                service.serviceCode
                              }
                            />

                            <InfoItem
                              label="Đơn vị tính"
                              value={unitType}
                            />

                            <InfoItem
                              label="Số lượng"
                              value={
                                order.quantity
                              }
                            />

                            <InfoItem
                              label="Ngày tạo"
                              value={formatDate(
                                order.createdAt
                              )}
                            />
                          </dl>

                          <div className="mt-auto pt-6">
                            <div className="rounded-2xl bg-brand-light/60 p-4">
                              <p className="text-xs font-semibold uppercase tracking-wide text-brand">
                                Yêu cầu của khách hàng
                              </p>

                              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-700">
                                {order.customerRequest ||
                                  EMPTY_VALUE}
                              </p>
                            </div>
                          </div>
                        </>
                      )}

                      {updateError && (
                        <div
                          role="alert"
                          className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
                        >
                          {updateError}
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* Files */}
                <section
                  className={`rounded-3xl border bg-white p-6 shadow-sm transition ${
                    isEditingProduct
                      ? "border-brand/20"
                      : "border-gray-100"
                  }`}
                >
                  <CardHeader
                    icon={Paperclip}
                    title="File khách hàng"
                    description="Ảnh bổ sung, tài liệu và file đính kèm"
                    iconClassName="bg-cyan-50 text-cyan-600"
                  />

                  {isEditingProduct && (
                    <div className="mt-6">
                      <AttachmentPicker
                        files={attachmentFiles}
                        disabled={
                          updating || updatingAddress
                        }
                        onChange={handleAttachmentChange}
                        onRemove={removeAttachment}
                      />
                    </div>
                  )}

                  <div className="mt-6">
                    {fileError && (
                      <div
                        role="alert"
                        className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
                      >
                        {fileError}
                      </div>
                    )}

                    {displayFiles.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {displayFiles.map((file) => {
                          const isImage =
                            String(file.fileType || "")
                              .toLowerCase()
                              .startsWith("image/");

                          const isDeleting =
                            deletingFileId === file.fileId;

                          return (
                            <div
                              key={file.fileId}
                              className="group flex min-w-0 items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-3 transition hover:border-brand/20 hover:bg-brand-light/30"
                            >
                              {/* File icon */}
                              <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ${
                                  isImage
                                    ? "text-violet-600"
                                    : "text-brand"
                                }`}
                              >
                                {isImage ? (
                                  <ImagePlus size={18} />
                                ) : (
                                  <FileText size={18} />
                                )}
                              </div>

                              {/* File information */}
                              <div className="min-w-0 flex-1">
                                <div className="flex min-w-0 items-center gap-2">
                                  <p className="truncate text-sm font-semibold text-gray-700">
                                    {file.fileName}
                                  </p>

                                  {file.isProductImage && (
                                    <span className="shrink-0 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-600">
                                      Ảnh đại diện
                                    </span>
                                  )}
                                </div>

                                <p className="mt-0.5 text-xs text-gray-400">
                                  {file.isProductImage
                                    ? "Ảnh chính của đơn hàng"
                                    : formatDate(
                                        file.uploadedAt,
                                        true
                                      )}
                                </p>
                              </div>

                              {/* Actions */}
                              <div className="flex shrink-0 items-center gap-1">
                                <a
                                  href={resolveBackendUrl(
                                    file.contentUrl
                                  )}
                                  target="_blank"
                                  rel="noreferrer"
                                  title={
                                    isImage
                                      ? "Xem ảnh"
                                      : "Tải file"
                                  }
                                  aria-label={
                                    isImage
                                      ? `Xem ${file.fileName}`
                                      : `Tải ${file.fileName}`
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-brand-light hover:text-brand"
                                >
                                  <Download size={17} />
                                </a>

                                {!file.isProductImage && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteUploadedFile(file)
                                    }
                                    disabled={
                                      isDeleting || updating
                                    }
                                    title="Xóa file"
                                    aria-label={`Xóa ${file.fileName}`}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    {isDeleting ? (
                                      <LoaderCircle
                                        size={17}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <Trash2 size={17} />
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="rounded-2xl bg-gray-50 px-5 py-7 text-center">
                        <FileText
                          size={26}
                          className="mx-auto text-gray-300"
                        />

                        <p className="mt-2 text-sm text-gray-500">
                          Chưa có file đính kèm
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              </form>

              {/* Service */}
              <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                <CardHeader
                  icon={FileText}
                  title="Thông tin dịch vụ"
                  description="Chi tiết dịch vụ khách hàng đã lựa chọn"
                  iconClassName="bg-violet-50 text-violet-600"
                />

                <dl className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <InfoItem
                    label="Tên dịch vụ"
                    value={service.serviceName}
                  />

                  <InfoItem
                    label="Mã dịch vụ"
                    value={service.serviceCode}
                  />

                  <InfoItem
                    label="Giá cơ bản"
                    value={formatCurrency(
                      service.basePrice
                    )}
                  />
                </dl>

                <div className="my-6 h-px bg-gray-100" />

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Mô tả dịch vụ
                    </p>

                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-700">
                      {service.description ||
                        EMPTY_VALUE}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Tags
                    </p>

                    {tags.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-gray-500">
                        {EMPTY_VALUE}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* Customer and address */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                  <CardHeader
                    icon={User}
                    title="Khách hàng"
                    description="Người đặt dịch vụ"
                    iconClassName="bg-blue-50 text-blue-600"
                  />

                  <dl className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <InfoItem
                      label="Họ và tên"
                      value={user.fullName}
                    />

                    <InfoItem
                      label="Mã khách hàng"
                      value={
                        user.userCode ||
                        user.idUser
                      }
                    />

                    <InfoItem
                      label="Giới tính"
                      value={user.gender}
                    />

                    <InfoItem
                      label="Ngày sinh"
                      value={formatDate(
                        user.birthday
                      )}
                    />

                    <InfoItem
                      label="Trạng thái"
                      value={user.status}
                    />
                  </dl>
                </section>

                <section
                  className={`rounded-3xl border bg-white p-6 shadow-sm transition ${
                    isEditingAddress
                      ? "border-orange-200 ring-4 ring-orange-50"
                      : "border-gray-100"
                  }`}
                >
                  <CardHeader
                    icon={MapPin}
                    title="Địa chỉ"
                    description={
                      isEditingAddress
                        ? "Chọn một địa chỉ đã thêm trước đó"
                        : "Địa chỉ tiếp nhận hoặc giao sản phẩm"
                    }
                    iconClassName="bg-orange-50 text-orange-600"
                    action={
                      isEditingAddress ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleUpdateAddress}
                            disabled={
                              updatingAddress ||
                              addressesLoading ||
                              userAddresses.length === 0 ||
                              !selectedAddressId
                            }
                            className="inline-flex h-9 items-center gap-2 rounded-xl bg-orange-500! px-3.5 text-xs font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {updatingAddress ? (
                              <LoaderCircle
                                size={15}
                                className="animate-spin"
                              />
                            ) : (
                              <Save size={15} />
                            )}

                            {updatingAddress
                              ? "Đang cập nhật"
                              : "Cập nhật"}
                          </button>

                          <button
                            type="button"
                            onClick={
                              handleCancelEditAddress
                            }
                            disabled={updatingAddress}
                            aria-label="Hủy chỉnh sửa địa chỉ"
                            title="Hủy chỉnh sửa"
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={
                            handleStartEditAddress
                          }
                          disabled={
                            isEditingProduct ||
                            updating ||
                            updatingAddress
                          }
                          className="inline-flex h-9 items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3.5 text-xs font-semibold text-orange-600 transition hover:border-orange-300 hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Pencil size={15} />
                        </button>
                      )
                    }
                  />

                  {isEditingAddress ? (
                    <div className="mt-6">
                      {addressesLoading ? (
                        <div className="flex items-center justify-center gap-2 rounded-2xl bg-gray-50 px-4 py-8 text-sm text-gray-500">
                          <LoaderCircle
                            size={18}
                            className="animate-spin"
                          />

                          Đang tải danh sách địa chỉ...
                        </div>
                      ) : addressState.error ? (
                        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                          {addressState.error}
                        </div>
                      ) : userAddresses.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-5 py-8 text-center">
                          <MapPin
                            size={26}
                            className="mx-auto text-gray-300"
                          />

                          <p className="mt-2 text-sm font-medium text-gray-600">
                            Bạn chưa có địa chỉ nào
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            Vui lòng thêm địa chỉ tại
                            trang quản lý địa chỉ.
                          </p>
                        </div>
                      ) : (
                        <div
                          role="radiogroup"
                          aria-label="Chọn địa chỉ cho đơn hàng"
                          className="max-h-80 space-y-3 overflow-y-auto pr-1"
                        >
                          {userAddresses.map((item) => {
                            const itemAddressId =
                              String(item.addressId);

                            const isSelected =
                              itemAddressId ===
                              String(selectedAddressId);

                            const isCurrentAddress =
                              itemAddressId ===
                              String(
                                order.address?.addressId
                              );

                            const isDefault =
                              itemAddressId ===
                              String(defaultAddressId);

                            return (
                              <label
                                key={item.addressId}
                                className={`relative flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                                  isSelected
                                    ? "border-orange-400 bg-orange-50/70 ring-4 ring-orange-100/60"
                                    : "border-gray-100 bg-gray-50 hover:border-orange-200 hover:bg-orange-50/30"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="selectedOrderAddress"
                                  value={item.addressId}
                                  checked={isSelected}
                                  onChange={(event) => {
                                    setSelectedAddressId(
                                      event.target.value
                                    );

                                    setAddressError("");
                                  }}
                                  disabled={
                                    updatingAddress
                                  }
                                  className="mt-1 h-4 w-4 shrink-0 accent-orange-500"
                                />

                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-semibold text-gray-900">
                                      {item.companyName ||
                                        "Địa chỉ cá nhân"}
                                    </p>

                                    {isCurrentAddress && (
                                      <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-orange-600">
                                        Đang sử dụng
                                      </span>
                                    )}

                                    {isDefault && (
                                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                                        Mặc định
                                      </span>
                                    )}

                                    {isSelected &&
                                      !isCurrentAddress && (
                                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-600">
                                          Đang chọn
                                        </span>
                                      )}
                                  </div>

                                  <p className="mt-1 text-sm leading-6 text-gray-600">
                                    {item.address ||
                                      EMPTY_VALUE}
                                  </p>

                                  {item.note && (
                                    <p className="mt-1 text-xs text-gray-400">
                                      Ghi chú: {item.note}
                                    </p>
                                  )}
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      )}

                      {addressError && (
                        <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                          {addressError}
                        </div>
                      )}

                      <p className="mt-4 text-xs leading-5 text-gray-400">
                        Địa chỉ này chỉ áp dụng cho đơn
                        hàng hiện tại, không thay đổi địa
                        chỉ mặc định của tài khoản.
                      </p>
                    </div>
                  ) : (
                    <dl className="mt-6 space-y-5">
                      <InfoItem
                        label="Tên công ty"
                        value={address.companyName}
                      />

                      <InfoItem
                        label="Địa chỉ chi tiết"
                        value={address.address}
                      />

                      <InfoItem
                        label="Ghi chú"
                        value={address.note}
                      />
                    </dl>
                  )}
                </section>
              </div>
            </main>

            {/* Right sidebar */}
            <aside className="space-y-6 xl:sticky xl:top-0 xl:self-start">
              {/* Payment */}
              <section className="overflow-hidden rounded-3xl bg-gray-950 text-white shadow-sm">
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
                        Tổng thanh toán
                      </p>

                      <p className="mt-3 text-3xl font-bold tracking-tight">
                        {formatCurrency(
                          order.totalPrice
                        )}
                      </p>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                      <CreditCard size={23} />
                    </div>
                  </div>

                  <div className="my-6 h-px bg-white/10" />

                  <dl className="space-y-4">
                    <div className="flex justify-between gap-4">
                      <dt className="text-sm text-gray-400">
                        Đơn giá
                      </dt>

                      <dd className="text-sm font-semibold">
                        {formatCurrency(
                          order.unitPrice
                        )}
                      </dd>
                    </div>

                    <div className="flex justify-between gap-4">
                      <dt className="text-sm text-gray-400">
                        Số lượng
                      </dt>

                      <dd className="text-sm font-semibold">
                        {hasValue(
                          order.quantity
                        )
                          ? `${order.quantity} ${unitType}`.trim()
                          : EMPTY_VALUE}
                      </dd>
                    </div>

                    <div className="flex justify-between gap-4">
                      <dt className="text-sm text-gray-400">
                        Giảm giá
                      </dt>

                      <dd className="text-sm font-semibold text-emerald-400">
                        {formatCurrency(
                          order.discountAmount
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="flex justify-between bg-white/5 px-6 py-4">
                  <span className="text-xs text-gray-400">
                    Thành tiền sau giảm giá
                  </span>

                  <span className="text-sm font-bold">
                    {formatCurrency(
                      order.totalPrice
                    )}
                  </span>
                </div>
              </section>

              {/* Timeline */}
              <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                <CardHeader
                  icon={CalendarDays}
                  title="Thời gian thực hiện"
                  description="Tiến trình đơn hàng"
                  iconClassName="bg-blue-50 text-blue-600"
                />

                <div className="relative mt-7 space-y-8 pl-9">
                  <div className="absolute bottom-3 left-2 top-3 w-px bg-gray-200" />

                  <div className="relative">
                    <span className="absolute -left-9 top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full border border-blue-200 bg-white">
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                    </span>

                    <p className="text-xs text-gray-400">
                      Ngày tiếp nhận
                    </p>

                    <p className="mt-1 font-bold text-gray-900">
                      {formatDate(
                        order.receivedDate
                      )}
                    </p>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-9 top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full border border-emerald-200 bg-white">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    </span>

                    <p className="text-xs text-gray-400">
                      Ngày hoàn thành
                    </p>

                    <p className="mt-1 font-bold text-gray-900">
                      {formatDate(
                        order.completedDate
                      )}
                    </p>
                  </div>
                </div>
              </section>

              {/* System */}
              <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                <CardHeader
                  icon={Building2}
                  title="Thông tin hệ thống"
                  description="Lịch sử của đơn hàng"
                />

                <div className="mt-6">
                  <dl className="grid grid-cols-2 gap-6">
                    <InfoItem
                      label="Người nhận"
                      value={receiverName}
                    />

                    <InfoItem
                      label="Người cập nhật"
                      value={updaterName}
                    />
                  </dl>

                  <div className="my-5 h-px bg-gray-100" />

                  <dl className="grid grid-cols-2 gap-6">
                    <InfoItem
                      label="Thời gian nhận"
                      value={formatDate(
                        order.createdAt,
                        true
                      )}
                    />

                    <InfoItem
                      label="Cập nhật gần nhất"
                      value={formatDate(
                        order.updatedAt,
                        true
                      )}
                    />
                  </dl>
                </div>
              </section>
            </aside>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex shrink-0 items-center justify-between gap-4 border-t border-gray-100 bg-white px-5 py-4 sm:px-7">
          <p className="hidden text-xs text-gray-400 sm:block">
            {isEditingProduct
              ? "Bạn đang chỉnh sửa thông tin đơn hàng"
              : isEditingAddress
                ? "Bạn đang thay đổi địa chỉ của đơn hàng"
                : "Nhấn ESC hoặc bên ngoài để đóng"}
          </p>

          <button
            type="button"
            onClick={handleRequestClose}
            disabled={
              updating || updatingAddress
            }
            className="ml-auto min-w-28 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {updating || updatingAddress
              ? "Đang xử lý..."
              : isEditingProduct ||
                  isEditingAddress
                ? "Hủy chỉnh sửa"
                : "Đóng"}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default memo(ServiceOrderDetailModal);