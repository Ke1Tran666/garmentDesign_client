import {memo, useCallback, useEffect,useMemo,useState} from "react";
import { AlertCircle, LoaderCircle, MapPin, PackagePlus, Save, X } from "lucide-react";
import { serviceApi } from "@/api/serviceApi";
import { addressApi } from "@/api/addressApi";
import { serviceOrderApi } from "@/api/serviceOrderApi";
import { serviceOrderFileApi } from "@/api/serviceOrderFileApi";
import { authStorage } from "@/lib/authStorage";
import { useFileUpload } from "@/hooks/useFileUpload";
import ProductImagePicker from "@/components/ui/FileUpload/ProductImagePicker";
import AttachmentPicker from "@/components/ui/FileUpload/AttachmentPicker";

const initialForm = {
  serviceId: "",
  addressId: "",
  productName: "",
  quantity: "",
  customerRequest: "",
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
            : "border-border-subtle bg-surface-subtle hover:border-brand/30"
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
          <p className="font-semibold text-text-strong">
            {address.companyName ||
              "Địa chỉ cá nhân"}
          </p>

          <p className="mt-1 text-sm leading-6 text-text-muted">
            {address.address}
          </p>

          {address.note && (
            <p className="mt-1 text-xs text-text-subtle">
              Ghi chú: {address.note}
            </p>
          )}
        </div>
      </label>
    );
  }
);

AddressOption.displayName = "AddressOption";

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
  const [createdOrder,setCreatedOrder] = useState(null);

  const {
    productImageFile,
    productImagePreview,
    attachmentFiles,
    hasUpload,
    handleProductImageChange,
    handleAttachmentChange,
    removeProductImage,
    removeAttachment,
    resetFiles,
    validateTotalSize,
    buildFormData,
  } = useFileUpload({
    onError: setSubmitError,
  });

  const currentUserId = authStorage.getUserId();

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
          serviceData,
          addressData,
        ] = await Promise.all([
          serviceApi.getAll({
            signal: controller.signal,
          }),
          addressApi.getByUser(
            currentUserId,
            {
              signal: controller.signal,
            },
          ),
        ]);

        const availableServices = (
          serviceData || []
        ).filter((service) => {
          if (service.deletedAt) return false;

          const status = String(
            service.status || "",
          ).toLowerCase();

          return (
            !status.includes("inactive") &&
            !status.includes("ngừng")
          );
        });

        setOptionState({
          idUser: currentUserId,
          services: availableServices,
          addresses: addressData || [],
          error: "",
        });

        if (controller.signal.aborted) {
          return;
        }
        
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

      resetFiles();
      setForm(initialForm);
      setSubmitError("");
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
  }, [open, submitting, onClose, resetFiles]);

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

  const resetCreateForm = () => {
    resetFiles();
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

  const handleClose = () => {
    if (submitting) return;

    resetCreateForm();
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateTotalSize()) {
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
          await serviceOrderApi.create({
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
            });

        orderResult = createResponse;

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
        const uploadData = buildFormData(
          "File do khách hàng cung cấp khi tạo đơn",
        );

        try {
          const uploadResult =
            await serviceOrderFileApi.upload(
              orderId,
              currentUserId,
              uploadData,
            );

          orderResult = uploadResult?.order || orderResult;
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
        className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-surface shadow-xl"
      >
        <header className="relative shrink-0 border-b border-border-subtle px-6 pb-5 pt-6 sm:px-8">
          <div className="absolute inset-x-0 top-0 h-1 bg-brand" />

          <div className="flex items-start justify-between gap-5">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand text-white shadow-sm">
                <PackagePlus size={23} />
              </div>

              <div className="min-w-0">
                <h2
                  id="create-service-order-title"
                  className="text-xl font-bold text-text-strong"
                >
                  Thêm đơn hàng dịch vụ
                </h2>

                <p className="mt-1 text-sm text-text-muted">
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
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border text-text-muted transition hover:border-danger-border hover:bg-danger-soft hover:text-danger disabled:cursor-not-allowed disabled:opacity-50"
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
              <div className="flex min-h-72 items-center justify-center gap-3 text-sm text-text-muted">
                <LoaderCircle
                  size={20}
                  className="animate-spin text-brand"
                />

                Đang tải dữ liệu...
              </div>
            ) : optionState.error ? (
              <div className="flex items-start gap-3 rounded-2xl border border-danger-border bg-danger-soft p-4 text-sm text-danger">
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
                      className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-muted"
                    >
                      Dịch vụ
                    </label>

                    <select
                      id="serviceId"
                      name="serviceId"
                      value={form.serviceId}
                      onChange={handleChange}
                      disabled={ submitting || Boolean(createdOrder)}
                      className="h-12 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-text-default outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10 disabled:bg-surface-subtle"
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
                      className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-muted"
                    >
                      Số lượng
                    </label>

                    <div className="flex overflow-hidden rounded-xl border border-border focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10">
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
                        className="h-12 min-w-0 flex-1 px-3.5 text-sm text-text-default outline-none disabled:bg-surface-subtle"
                      />

                      <span className="flex items-center border-l border-border bg-surface-subtle px-3 text-xs font-semibold text-text-muted">
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
                    className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-muted"
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
                    className="h-12 w-full rounded-xl border border-border px-3.5 text-sm text-text-default outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10 disabled:bg-surface-subtle"
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                      Địa chỉ nhận hàng
                    </label>

                    <span className="text-xs text-text-subtle">
                      Chỉ chọn địa chỉ đã có
                    </span>
                  </div>

                  {addresses.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border bg-surface-subtle px-5 py-8 text-center">
                      <MapPin
                        size={27}
                        className="mx-auto text-text-subtle"
                      />

                      <p className="mt-2 text-sm font-semibold text-text-muted">
                        Bạn chưa có địa chỉ
                      </p>

                      <p className="mt-1 text-xs text-text-subtle">
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
                    className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-muted"
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
                    className="w-full resize-none rounded-xl border border-border px-3.5 py-3 text-sm leading-6 text-text-default outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10 disabled:bg-surface-subtle"
                  />
                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  {/* Ảnh đại diện */}
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <label className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                        Ảnh đại diện sản phẩm
                      </label>

                      <span className="text-xs text-text-subtle">
                        Tối đa 50MB
                      </span>
                    </div>

                    <ProductImagePicker
                      imageUrl={productImagePreview}
                      selectedFile={productImageFile}
                      disabled={submitting}
                      onChange={handleProductImageChange}
                      onRemove={removeProductImage}
                    />
                  </div>

                  {/* File bổ sung */}
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <label className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                        File khách hàng
                      </label>

                      <span className="text-xs text-text-subtle">
                        Có thể chọn nhiều file
                      </span>
                    </div>

                    <AttachmentPicker
                      files={attachmentFiles}
                      disabled={submitting}
                      onChange={handleAttachmentChange}
                      onRemove={removeAttachment}
                    />
                  </div>
                </div>

                {createdOrder && (
                  <div className="rounded-xl border border-warning-border bg-warning-soft px-4 py-3 text-sm leading-6 text-warning">
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
                        <p className="text-xs font-semibold uppercase tracking-wide text-text-subtle">
                          Đơn giá
                        </p>

                        <p className="mt-2 text-base font-bold">
                          {formatCurrency(
                            selectedService.basePrice
                          )}
                          <span className="ml-1 text-xs font-normal text-text-subtle">
                            /{" "}
                            {selectedService.unitType ||
                              "đơn vị"}
                          </span>
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-semibold uppercase tracking-wide text-text-subtle">
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
                  <div className="flex items-start gap-3 rounded-xl border border-danger-border bg-danger-soft px-4 py-3 text-sm text-danger">
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

          <footer className="flex shrink-0 justify-end gap-3 border-t border-border-subtle bg-surface px-6 py-4 sm:px-8">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-text-muted transition hover:bg-surface-subtle disabled:cursor-not-allowed disabled:opacity-50"
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