import axios from "axios";
import {memo, useCallback, useEffect,useMemo,useState} from "react";
import {
  AlertCircle,
  FileText,
  ImagePlus,
  LoaderCircle,
  MapPin,
  PackagePlus,
  Paperclip,
  Save,
  Trash2,
  X,
} from "lucide-react";
import {
  BASE_URL_API,
  SERVICE_API,
  USER_ADDRESS_API,
} from "@/api/config";

const initialForm = {
  serviceId: "",
  addressId: "",
  productName: "",
  quantity: "",
  customerRequest: "",
};

const createImageThumbnailUrl = async (file) => {
  try {
    const bitmap =
      await createImageBitmap(file, {
        imageOrientation: "from-image",
      });

    const maxPreviewSize = 1200;

    const scale = Math.min(
      1,
      maxPreviewSize /
        Math.max(
          bitmap.width,
          bitmap.height
        )
    );

    const width = Math.max(
      1,
      Math.round(bitmap.width * scale)
    );

    const height = Math.max(
      1,
      Math.round(bitmap.height * scale)
    );

    const canvas =
      document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;

    const context =
      canvas.getContext("2d", {
        alpha: false,
      });

    if (!context) {
      bitmap.close();
      return URL.createObjectURL(file);
    }

    context.drawImage(
      bitmap,
      0,
      0,
      width,
      height
    );

    bitmap.close();

    const previewBlob =
      await new Promise((resolve) => {
        canvas.toBlob(
          resolve,
          "image/jpeg",
          0.82
        );
      });

    return URL.createObjectURL(
      previewBlob || file
    );
  } catch {
    return URL.createObjectURL(file);
  }
};

const MAX_FILE_SIZE =
  50 * 1024 * 1024;

const MAX_REQUEST_SIZE =
  200 * 1024 * 1024;

const formatFileSize = (size) => {
  if (!Number.isFinite(size)) {
    return "0 B";
  }

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(
    size /
    (1024 * 1024)
  ).toFixed(1)} MB`;
};

const currencyFormatter =
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  });

const formatCurrency = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0 ₫";
  }

  return currencyFormatter.format(number);
};

const AddressOption = memo(({address,selected,disabled,onSelect}) => {
    const addressId = String(
      address.addressId
    );

    return (
      <label
        className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 ${
          selected
            ? "border-brand bg-brand-light ring-2 ring-brand/10"
            : "border-gray-100 bg-gray-50 hover:border-brand/30"
        } ${
          disabled
            ? "cursor-not-allowed opacity-60"
            : ""
        }`}
      >
        <input
          type="radio"
          name="addressId"
          value={addressId}
          checked={selected}
          disabled={disabled}
          onChange={() =>
            onSelect(addressId)
          }
          className="mt-1 h-4 w-4 shrink-0 accent-brand"
        />

        <div className="min-w-0">
          <p className="font-semibold text-gray-900">
            {address.companyName ||
              "Địa chỉ cá nhân"}
          </p>

          <p className="mt-1 text-sm leading-6 text-gray-600">
            {address.address}
          </p>

          {address.note && (
            <p className="mt-1 text-xs text-gray-400">
              Ghi chú: {address.note}
            </p>
          )}
        </div>
      </label>
    );
  }
);

AddressOption.displayName = "AddressOption";

const AttachmentFileItem = memo(
  ({
    file,
    disabled,
    onRemove,
  }) => (
    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <FileText size={17} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-gray-700">
          {file.name}
        </p>

        <p className="mt-0.5 text-[11px] text-gray-400">
          {formatFileSize(file.size)}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onRemove(file)}
        disabled={disabled}
        aria-label={`Xóa ${file.name}`}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
      >
        <Trash2 size={15} />
      </button>
    </div>
  )
);

AttachmentFileItem.displayName = "AttachmentFileItem";

const ServiceOrderCreateModal = ({
  open,
  onClose,
  onCreated,
}) => {
  const [form, setForm] =
    useState(initialForm);

  const [optionState, setOptionState] =
    useState({
      idUser: null,
      services: [],
      addresses: [],
      error: "",
    });

  const [submitting, setSubmitting] = useState(false);

  const [submitError, setSubmitError] = useState("");
  const [productImageFile,setProductImageFile] = useState(null);
  const [productImagePreview,setProductImagePreview] = useState("");
  const [attachmentFiles,setAttachmentFiles] = useState([]);
  const [createdOrder,setCreatedOrder] = useState(null);

  const currentUserId = localStorage.getItem("idUser");

  const optionsLoading =
    Boolean(open && currentUserId) &&
    optionState.idUser !== currentUserId;

  const services = useMemo(
    () =>
      optionState.idUser === currentUserId
        ? optionState.services
        : [],
    [
      optionState.idUser,
      optionState.services,
      currentUserId,
    ]
  );

  const addresses = useMemo(
    () =>
      optionState.idUser === currentUserId
        ? optionState.addresses
        : [],
    [
      optionState.idUser,
      optionState.addresses,
      currentUserId,
    ]
  );

  const selectedService = useMemo(
    () =>
      services.find(
        (item) =>
          String(item.serviceId) ===
          String(form.serviceId)
      ),
    [services, form.serviceId]
  );

  const quantity = Number(form.quantity);

  const estimatedTotal =
    selectedService &&
    Number.isFinite(quantity) &&
    quantity > 0
      ? Number(selectedService.basePrice || 0) *
        quantity
      : 0;

  useEffect(() => {
    if (
      !open ||
      !currentUserId ||
      optionState.idUser === currentUserId
    ) {
      return undefined;
    }

    const controller =
      new AbortController();

    const fetchOptions = async () => {
      try {
        const [
          serviceResponse,
          addressResponse,
        ] = await Promise.all([
          axios.get(SERVICE_API, {
            signal: controller.signal,
          }),
          axios.get(
            `${USER_ADDRESS_API}/user/${currentUserId}`,
            {
              signal: controller.signal,
            }
          ),
        ]);

        if (controller.signal.aborted) {
          return;
        }

        const availableServices = (
          serviceResponse.data || []
        ).filter((service) => {
          if (service.deletedAt) return false;

          const status = String(
            service.status || ""
          ).toLowerCase();

          return (
            !status.includes("inactive") &&
            !status.includes("ngừng")
          );
        });

        setOptionState({
          idUser: currentUserId,
          services: availableServices,
          addresses:
            addressResponse.data || [],
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
          "Không thể tải dữ liệu tạo đơn:",
          error
        );

        setOptionState({
          idUser: currentUserId,
          services: [],
          addresses: [],
          error:
            error.response?.data?.message ||
            "Không thể tải dịch vụ hoặc địa chỉ.",
        });
      }
    };

    fetchOptions();

    return () => {
      controller.abort();
    };
  }, [
    open,
    currentUserId,
    optionState.idUser,
  ]);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow =
      document.body.style.overflow;

    const handleKeyDown = (event) => {
      if (
        event.key !== "Escape" ||
        submitting
      ) {
        return;
      }

      if (productImagePreview) {
        URL.revokeObjectURL(
          productImagePreview
        );
      }

      setForm(initialForm);
      setSubmitError("");
      setProductImageFile(null);
      setProductImagePreview("");
      setAttachmentFiles([]);
      setCreatedOrder(null);

      onClose();
    };

    document.body.style.overflow =
      "hidden";

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
  }, [open, submitting, productImagePreview, onClose]);

  useEffect(() => {
    return () => {
      if (productImagePreview) {
        URL.revokeObjectURL(
          productImagePreview
        );
      }
    };
  }, [productImagePreview]);

  const handleChange = useCallback(
    (event) => {
      const { name, value } =
        event.target;

      setForm((previousForm) => ({
        ...previousForm,
        [name]: value,
      }));

      setSubmitError("");
    },
    []
  );

  const resetSelectedFiles = () => {
    if (productImagePreview) {
      URL.revokeObjectURL(
        productImagePreview
      );
    }

    setProductImageFile(null);
    setProductImagePreview("");
    setAttachmentFiles([]);
  };

  const resetCreateForm = () => {
    resetSelectedFiles();

    setForm(initialForm);
    setSubmitError("");
    setCreatedOrder(null);
  };

  const handleSelectAddress = useCallback((addressId) => {
    setForm((previousForm) => ({
      ...previousForm,
      addressId,
    }));

    setSubmitError("");
  }, []);

  const handleProductImageChange = async (event) => {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    if (
      !file.type.startsWith("image/")
    ) {
      setSubmitError(
        "Ảnh đại diện không đúng định dạng."
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setSubmitError(
        "Ảnh đại diện không được vượt quá 50MB."
      );
      return;
    }

    try {
      const nextPreview =
        await createImageThumbnailUrl(
          file
        );

      if (productImagePreview) {
        URL.revokeObjectURL(
          productImagePreview
        );
      }

      setProductImageFile(file);
      setProductImagePreview(
        nextPreview
      );
      setSubmitError("");
    } catch {
      setSubmitError(
        "Không thể tạo ảnh xem trước."
      );
    }
  };

  const handleRemoveProductImage = () => {
    if (submitting) return;

    if (productImagePreview) {
      URL.revokeObjectURL(
        productImagePreview
      );
    }

    setProductImageFile(null);
    setProductImagePreview("");
    setSubmitError("");
  };

  const handleAttachmentChange = (
    event
  ) => {
    const selectedFiles = Array.from(
      event.target.files || []
    );

    event.target.value = "";

    if (selectedFiles.length === 0) {
      return;
    }

    const oversizedFile =
      selectedFiles.find(
        (file) =>
          file.size > MAX_FILE_SIZE
      );

    if (oversizedFile) {
      setSubmitError(
        `File "${oversizedFile.name}" vượt quá 50MB.`
      );
      return;
    }

    setAttachmentFiles(
      (previousFiles) => {
        const fileMap = new Map();

        [
          ...previousFiles,
          ...selectedFiles,
        ].forEach((file) => {
          const key = [
            file.name,
            file.size,
            file.lastModified,
          ].join("-");

          fileMap.set(key, file);
        });

        return Array.from(
          fileMap.values()
        );
      }
    );

    setSubmitError("");
  };

  const handleRemoveAttachment = useCallback((removingFile) => {
      setAttachmentFiles(
        (previousFiles) =>
          previousFiles.filter(
            (file) =>
              !(
                file.name ===
                  removingFile.name &&
                file.size ===
                  removingFile.size &&
                file.lastModified ===
                  removingFile.lastModified
              )
          )
      );

      setSubmitError("");
    }, []);

  const handleClose = () => {
    if (submitting) return;

    resetCreateForm();
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const hasUpload =
      Boolean(productImageFile) ||
      attachmentFiles.length > 0;

    const totalUploadSize =
      (productImageFile?.size || 0) +
      attachmentFiles.reduce(
        (total, file) =>
          total + file.size,
        0
      );

    if (
      totalUploadSize >
      MAX_REQUEST_SIZE
    ) {
      setSubmitError(
        "Tổng dung lượng ảnh và file không được vượt quá 200MB."
      );
      return;
    }

    if (!currentUserId) {
      setSubmitError(
        "Không tìm thấy thông tin người dùng."
      );
      return;
    }

    /*
    * Khi đơn đã tạo nhưng upload lỗi,
    * bỏ qua validate form và không POST
    * tạo đơn lần thứ hai.
    */
    if (!createdOrder) {
      const serviceId = Number(
        form.serviceId
      );

      const addressId = Number(
        form.addressId
      );

      const productName =
        form.productName.trim();

      const orderQuantity = Number(
        form.quantity
      );

      if (
        !Number.isInteger(serviceId) ||
        serviceId <= 0
      ) {
        setSubmitError(
          "Vui lòng chọn dịch vụ."
        );
        return;
      }

      if (
        !Number.isInteger(addressId) ||
        addressId <= 0
      ) {
        setSubmitError(
          "Vui lòng chọn địa chỉ."
        );
        return;
      }

      if (!productName) {
        setSubmitError(
          "Vui lòng nhập tên sản phẩm."
        );
        return;
      }

      if (
        !Number.isFinite(orderQuantity) ||
        orderQuantity <= 0
      ) {
        setSubmitError(
          "Số lượng phải lớn hơn 0."
        );
        return;
      }

      if (!selectedService) {
        setSubmitError(
          "Dịch vụ đã chọn không tồn tại."
        );
        return;
      }
    }

    try {
      setSubmitting(true);
      setSubmitError("");

      let orderResult = createdOrder;

      /*
      * Bước 1: tạo đơn hàng.
      */
      if (!orderResult) {
        const serviceId = Number(
          form.serviceId
        );

        const addressId = Number(
          form.addressId
        );

        const orderQuantity = Number(
          form.quantity
        );

        const unitPrice = Number(
          selectedService.basePrice || 0
        );

        const totalPrice =
          unitPrice * orderQuantity;

        const createResponse =
          await axios.post(
            `${BASE_URL_API}/service-orders`,
            {
              user: {
                idUser: currentUserId,
              },
              service: {
                serviceId,
              },
              address: {
                addressId,
              },
              productName:
                form.productName.trim(),
              unitType:
                selectedService.unitType ||
                "",
              quantity: orderQuantity,
              unitPrice,
              discountAmount: 0,
              totalPrice,
              status: "pending",
            }
          );

        orderResult =
          createResponse.data;

        /*
        * Lưu lại để nếu upload lỗi,
        * lần thử lại không tạo đơn mới.
        */
        setCreatedOrder(orderResult);
      }

      const orderId =
        orderResult?.serviceOrderId;

      if (!orderId) {
        throw new Error(
          "Không nhận được mã đơn hàng."
        );
      }

      /*
      * Bước 2: upload ảnh đại diện
      * và file bổ sung.
      */
      if (hasUpload) {
        const uploadData =
          new FormData();

        if (productImageFile) {
          uploadData.append(
            "image",
            productImageFile
          );
        }

        attachmentFiles.forEach(
          (file) => {
            uploadData.append(
              "files",
              file
            );
          }
        );

        uploadData.append(
          "note",
          "File do khách hàng cung cấp khi tạo đơn"
        );

        try {
          const uploadResponse =
            await axios.post(
              `${BASE_URL_API}/service-order-files/order/${orderId}/user/${currentUserId}`,
              uploadData
            );

          /*
          * Response order đã chứa
          * productImage vừa cập nhật.
          */
          orderResult =
            uploadResponse.data?.order ||
            orderResult;
        } catch (uploadError) {
          /*
          * Đơn đã được tạo nên phải đưa
          * vào danh sách trước.
          */
          onCreated?.(orderResult);

          setSubmitError(
            uploadError.response?.data
              ?.message ||
              "Đơn hàng đã được tạo nhưng tải ảnh hoặc file thất bại. Bạn có thể nhấn thử lại mà không tạo trùng đơn."
          );

          return;
        }
      }

      onCreated?.(orderResult);

      resetCreateForm();
      onClose();
    } catch (error) {
      console.error(
        "Không thể tạo đơn hàng:",
        error
      );

      setSubmitError(
        error.response?.data?.message ||
          error.message ||
          "Không thể tạo đơn hàng. Vui lòng thử lại."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-80 flex items-center justify-center bg-gray-950/50 px-3 py-5"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          handleClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-service-order-title"
        className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-xl"
      >
        <header className="relative shrink-0 border-b border-gray-100 px-6 pb-5 pt-6 sm:px-8">
          <div className="absolute inset-x-0 top-0 h-1 bg-brand" />

          <div className="flex items-start justify-between gap-5">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand text-white shadow-sm">
                <PackagePlus size={23} />
              </div>

              <div className="min-w-0">
                <h2
                  id="create-service-order-title"
                  className="text-xl font-bold text-gray-950"
                >
                  Thêm đơn hàng dịch vụ
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Chọn dịch vụ và địa chỉ
                  đã thêm trước đó
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              aria-label="Đóng form tạo đơn"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X size={19} />
            </button>
          </div>
        </header>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="overflow-y-auto px-6 py-6 sm:px-8">
            {optionsLoading ? (
              <div className="flex min-h-72 items-center justify-center gap-3 text-sm text-gray-500">
                <LoaderCircle
                  size={20}
                  className="animate-spin text-brand"
                />

                Đang tải dữ liệu...
              </div>
            ) : optionState.error ? (
              <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
                <AlertCircle
                  size={19}
                  className="mt-0.5 shrink-0"
                />

                {optionState.error}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="serviceId"
                      className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500"
                    >
                      Dịch vụ
                    </label>

                    <select
                      id="serviceId"
                      name="serviceId"
                      value={form.serviceId}
                      onChange={handleChange}
                      disabled={ submitting || Boolean(createdOrder)}
                      className="h-12 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-800 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10 disabled:bg-gray-50"
                    >
                      <option value="">
                        Chọn dịch vụ
                      </option>

                      {services.map(
                        (service) => (
                          <option
                            key={
                              service.serviceId
                            }
                            value={
                              service.serviceId
                            }
                          >
                            {service.serviceName}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="quantity"
                      className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500"
                    >
                      Số lượng
                    </label>

                    <div className="flex overflow-hidden rounded-xl border border-gray-200 focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10">
                      <input
                        id="quantity"
                        type="number"
                        name="quantity"
                        min="0.01"
                        step="0.01"
                        value={form.quantity}
                        onChange={handleChange}
                        disabled={ submitting || Boolean(createdOrder)}
                        placeholder="Nhập số lượng"
                        className="h-12 min-w-0 flex-1 px-3.5 text-sm text-gray-800 outline-none disabled:bg-gray-50"
                      />

                      <span className="flex items-center border-l border-gray-200 bg-gray-50 px-3 text-xs font-semibold text-gray-500">
                        {selectedService
                          ?.unitType ||
                          "Đơn vị"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="productName"
                    className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500"
                  >
                    Tên sản phẩm
                  </label>

                  <input
                    id="productName"
                    type="text"
                    name="productName"
                    value={form.productName}
                    onChange={handleChange}
                    disabled={ submitting || Boolean(createdOrder)}
                    placeholder="Ví dụ: Áo thun local brand"
                    className="h-12 w-full rounded-xl border border-gray-200 px-3.5 text-sm text-gray-800 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10 disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Địa chỉ nhận hàng
                    </label>

                    <span className="text-xs text-gray-400">
                      Chỉ chọn địa chỉ đã có
                    </span>
                  </div>

                  {addresses.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-5 py-8 text-center">
                      <MapPin
                        size={27}
                        className="mx-auto text-gray-300"
                      />

                      <p className="mt-2 text-sm font-semibold text-gray-600">
                        Bạn chưa có địa chỉ
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        Hãy thêm địa chỉ tại
                        trang quản lý tài khoản.
                      </p>
                    </div>
                  ) : (
                    <div
                      role="radiogroup"
                      aria-label="Chọn địa chỉ nhận hàng"
                      className="max-h-64 space-y-3 overflow-y-auto pr-1"
                    >
                      {addresses.map((address) => (
                        <AddressOption
                          key={address.addressId}
                          address={address}
                          selected={
                            String(form.addressId) ===
                            String(address.addressId)
                          }
                          disabled={
                            submitting ||
                            Boolean(createdOrder)
                          }
                          onSelect={
                            handleSelectAddress
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="customerRequest"
                    className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500"
                  >
                    Yêu cầu của khách hàng
                  </label>

                  <textarea
                    id="customerRequest"
                    name="customerRequest"
                    rows={4}
                    value={
                      form.customerRequest
                    }
                    onChange={handleChange}
                    disabled={ submitting || Boolean(createdOrder)}
                    placeholder="Nhập kích thước, màu sắc, kiểu in hoặc yêu cầu khác..."
                    className="w-full resize-none rounded-xl border border-gray-200 px-3.5 py-3 text-sm leading-6 text-gray-800 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10 disabled:bg-gray-50"
                  />
                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  {/* Ảnh đại diện */}
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Ảnh đại diện sản phẩm
                      </label>

                      <span className="text-xs text-gray-400">
                        Tối đa 50MB
                      </span>
                    </div>

                    {productImagePreview ? (
                      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
                        <img
                          src={productImagePreview}
                          alt="Xem trước ảnh sản phẩm"
                          className="h-52 w-full object-cover"
                        />

                        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-xl bg-gray-950/85 px-3 py-2 text-white">
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold">
                              {productImageFile?.name}
                            </p>

                            <p className="mt-0.5 text-[11px] text-gray-300">
                              {formatFileSize(
                                productImageFile?.size
                              )}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={
                              handleRemoveProductImage
                            }
                            disabled={submitting}
                            aria-label="Xóa ảnh đã chọn"
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-red-500 disabled:opacity-50"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex h-52 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 text-center transition hover:border-brand hover:bg-brand-light">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand shadow-sm">
                          <ImagePlus size={22} />
                        </div>

                        <p className="mt-3 text-sm font-semibold text-gray-700">
                          Chọn ảnh đại diện
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          JPG, PNG, WEBP...
                        </p>

                        <input
                          type="file"
                          accept="image/*"
                          onChange={
                            handleProductImageChange
                          }
                          disabled={submitting}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* File bổ sung */}
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        File khách hàng
                      </label>

                      <span className="text-xs text-gray-400">
                        Có thể chọn nhiều file
                      </span>
                    </div>

                    <label className="flex min-h-28 cursor-pointer items-center gap-4 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4 transition hover:border-brand hover:bg-brand-light">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-brand shadow-sm">
                        <Paperclip size={20} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-700">
                          Chọn file bổ sung
                        </p>

                        <p className="mt-1 text-xs leading-5 text-gray-400">
                          Nhận mọi định dạng file,
                          tối đa 50MB mỗi file
                        </p>
                      </div>

                      <input
                        type="file"
                        multiple
                        onChange={
                          handleAttachmentChange
                        }
                        disabled={submitting}
                        className="hidden"
                      />
                    </label>

                    {attachmentFiles.length > 0 && (
                      <div className="mt-3 max-h-48 space-y-2 overflow-y-auto pr-1">
                        {attachmentFiles.map((file) => {
                          const fileKey = [
                            file.name,
                            file.size,
                            file.lastModified,
                          ].join("-");

                          return (
                            <AttachmentFileItem
                              key={fileKey}
                              file={file}
                              disabled={submitting}
                              onRemove={
                                handleRemoveAttachment
                              }
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {createdOrder && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-700">
                    Đơn hàng{" "}
                    <span className="font-bold">
                      ORD-
                      {createdOrder.serviceOrderId}
                    </span>{" "}
                    đã được tạo. Bạn đang thử tải
                    lại ảnh hoặc file, hệ thống sẽ
                    không tạo thêm đơn mới.
                  </div>
                )}

                {selectedService && (
                  <div className="rounded-2xl bg-gray-950 p-5 text-white">
                    <div className="flex items-start justify-between gap-5">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Đơn giá
                        </p>

                        <p className="mt-2 text-base font-bold">
                          {formatCurrency(
                            selectedService.basePrice
                          )}
                          <span className="ml-1 text-xs font-normal text-gray-400">
                            /{" "}
                            {selectedService.unitType ||
                              "đơn vị"}
                          </span>
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Tạm tính
                        </p>

                        <p className="mt-2 text-xl font-bold">
                          {formatCurrency(
                            estimatedTotal
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {submitError && (
                  <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                    <AlertCircle
                      size={18}
                      className="mt-0.5 shrink-0"
                    />

                    {submitError}
                  </div>
                )}
              </div>
            )}
          </div>

          <footer className="flex shrink-0 justify-end gap-3 border-t border-gray-100 bg-white px-6 py-4 sm:px-8">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={
                submitting ||
                optionsLoading ||
                Boolean(optionState.error) ||
                (!createdOrder &&
                  addresses.length === 0)
              }
              className="inline-flex min-w-40 items-center justify-center gap-2 rounded-xl bg-brand! px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <LoaderCircle
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <Save size={18} />
              )}

              {submitting
                ? createdOrder
                  ? "Đang tải file..."
                  : "Đang tạo..."
                : createdOrder
                  ? "Thử tải file lại"
                  : "Tạo đơn hàng"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default ServiceOrderCreateModal;