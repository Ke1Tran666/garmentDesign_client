import { useState } from "react";

import FormInput from "@/shared/ui/input/FormInput";
import FormModal from "@/shared/ui/modal/FormModal";

const EMPTY_FORM = {
  serviceCode: "",
  serviceName: "",
  unitType: "",
  basePrice: "",
  description: "",
  tags: "",
  status: "active",
};

const createInitialForm = (service) => {
  if (!service) {
    return { ...EMPTY_FORM };
  }

  return {
    serviceCode: service.serviceCode || "",
    serviceName: service.serviceName || "",
    unitType: service.unitType || "",
    basePrice: service.basePrice ?? "",
    description: service.description || "",
    tags: service.tags || "",
    status: service.status || "active",
  };
};

const ServiceFormModal = ({
  service = null,
  submitting = false,
  errorMessage = "",
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState(() =>
    createInitialForm(service),
  );

  const [validationError, setValidationError] =
    useState("");

  const editing = Boolean(service);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setValidationError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const serviceCode = form.serviceCode.trim();
    const serviceName = form.serviceName.trim();
    const unitType = form.unitType.trim();
    const priceText = String(form.basePrice).trim();
    const basePrice = Number(priceText);

    if (!serviceCode || !serviceName || !unitType) {
      setValidationError(
        "Vui lòng nhập đầy đủ mã, tên và đơn vị dịch vụ.",
      );
      return;
    }

    if (!priceText || !Number.isFinite(basePrice) || basePrice < 0) {
      setValidationError(
        "Giá cơ bản phải là một số lớn hơn hoặc bằng 0.",
      );
      return;
    }

    onSubmit?.({
      serviceCode,
      serviceName,
      unitType,
      basePrice,
      description: form.description.trim(),
      tags: form.tags.trim(),
      status: form.status,
    });
  };

  return (
    <FormModal
      open
      title={editing ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}
      description="Cập nhật thông tin hiển thị, giá và trạng thái dịch vụ."
      submitting={submitting}
      errorMessage={validationError || errorMessage}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitText={editing ? "Lưu thay đổi" : "Thêm dịch vụ"}
      loadingText="Đang lưu..."
      cancelText="Hủy"
      maxWidthClassName="max-w-2xl"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FormInput
          id="service-code"
          name="serviceCode"
          label="Mã dịch vụ"
          value={form.serviceCode}
          onChange={handleChange}
          disabled={submitting}
          required
          maxLength={50}
          placeholder="Ví dụ: DES001"
          autoFocus
        />

        <FormInput
          id="service-name"
          name="serviceName"
          label="Tên dịch vụ"
          value={form.serviceName}
          onChange={handleChange}
          disabled={submitting}
          required
          maxLength={255}
          placeholder="Nhập tên dịch vụ"
        />

        <FormInput
          id="service-unit-type"
          name="unitType"
          label="Đơn vị tính"
          value={form.unitType}
          onChange={handleChange}
          disabled={submitting}
          required
          maxLength={100}
          placeholder="Ví dụ: Sản phẩm"
        />

        <FormInput
          id="service-base-price"
          type="number"
          name="basePrice"
          label="Giá cơ bản"
          value={form.basePrice}
          onChange={handleChange}
          disabled={submitting}
          required
          min="0"
          step="1000"
          placeholder="0"
        />
      </div>

      <FormInput
        id="service-tags"
        name="tags"
        label="Thẻ dịch vụ"
        value={form.tags}
        onChange={handleChange}
        disabled={submitting}
        placeholder="Thiết kế, Rập, May mặc"
        hint="Phân cách các thẻ bằng dấu phẩy."
      />

      <div>
        <label
          htmlFor="service-description"
          className="mb-2 block text-sm font-semibold text-text-default"
        >
          Mô tả
        </label>

        <textarea
          id="service-description"
          name="description"
          value={form.description}
          onChange={handleChange}
          disabled={submitting}
          rows={4}
          maxLength={1000}
          placeholder="Mô tả ngắn về dịch vụ..."
          className="
            w-full resize-y rounded-xl
            border border-input bg-surface
            px-4 py-3 text-sm text-text-default
            outline-none transition
            focus:border-brand
            focus:ring-4 focus:ring-brand/10
            disabled:cursor-not-allowed
            disabled:bg-surface-muted
          "
        />
      </div>

      <div>
        <label
          htmlFor="service-status"
          className="mb-2 block text-sm font-semibold text-text-default"
        >
          Trạng thái
        </label>

        <select
          id="service-status"
          name="status"
          value={form.status}
          onChange={handleChange}
          disabled={submitting}
          className="
            h-11 w-full rounded-xl
            border border-input bg-surface
            px-4 text-sm text-text-default
            outline-none transition
            focus:border-brand
            focus:ring-4 focus:ring-brand/10
            disabled:cursor-not-allowed
            disabled:bg-surface-muted
          "
        >
          <option value="active">
            Đang hoạt động
          </option>

          <option value="inactive">
            Tạm ngừng
          </option>
        </select>
      </div>
    </FormModal>
  );
};

export default ServiceFormModal;