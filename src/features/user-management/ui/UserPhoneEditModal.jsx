import { useState } from "react";

import FormInput from "@/shared/ui/input/FormInput";

import FormModal from "./FormModal";

const UserPhoneEditModal = ({
  phone = "",
  submitting = false,
  errorMessage = "",
  onClose,
  onSubmit,
}) => {
  const [phoneValue, setPhoneValue] = useState(
    () => phone,
  );

  const [validationError, setValidationError] =
    useState("");

  const handleChange = (event) => {
    setPhoneValue(event.target.value);
    setValidationError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const normalizedPhone = phoneValue
      .trim()
      .replace(/[\s.-]/g, "");

    if (!normalizedPhone) {
      setValidationError(
        "Vui lòng nhập số điện thoại.",
      );
      return;
    }

    if (
      !/^(0\d{9}|\+84\d{9}|84\d{9})$/.test(
        normalizedPhone,
      )
    ) {
      setValidationError(
        "Số điện thoại không hợp lệ.",
      );
      return;
    }

    onSubmit?.(normalizedPhone);
  };

  return (
    <FormModal
      open
      title="Chỉnh sửa số điện thoại"
      description="Cập nhật số điện thoại của người dùng."
      submitting={submitting}
      errorMessage={
        validationError || errorMessage
      }
      onClose={onClose}
      onSubmit={handleSubmit}
      submitText="Lưu thay đổi"
      loadingText="Đang lưu..."
      cancelText="Hủy"
    >
      <FormInput
        id="edit-user-phone"
        label="Số điện thoại"
        type="tel"
        name="phone"
        value={phoneValue}
        onChange={handleChange}
        disabled={submitting}
        placeholder="Nhập số điện thoại"
        autoComplete="tel"
        inputMode="tel"
        hint="Ví dụ: 0912345678"
        autoFocus
      />
    </FormModal>
  );
};

export default UserPhoneEditModal;
