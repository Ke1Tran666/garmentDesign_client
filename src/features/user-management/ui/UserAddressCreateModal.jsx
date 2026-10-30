import { useState } from "react";

import { addressApi } from "@/entities/address/api/addressApi";
import FormModal from "@/shared/ui/modal/FormModal";

const EMPTY_FORM = {
  companyName: "",
  address: "",
  note: "",
};

const addressFields = [
  {
    name: "companyName",
    placeholder: "Tên người nhận hoặc công ty",
  },
  {
    name: "address",
    placeholder: "Địa chỉ chi tiết",
    type: "textarea",
    rows: 3,
  },
  {
    name: "note",
    placeholder: "Ghi chú",
    type: "textarea",
    rows: 3,
  },
];

const UserAddressCreateModal = ({ user, onClose, onCreated }) => {
  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM,
  }));
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setErrorMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting || !user) return;

    if (!form.companyName.trim()) {
      setErrorMessage("Tên người nhận hoặc công ty không được để trống.");
      return;
    }

    if (!form.address.trim()) {
      setErrorMessage("Địa chỉ không được để trống.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");

      const createdAddress = await addressApi.createForUser(user.idUser, {
        companyName: form.companyName.trim(),
        address: form.address.trim(),
        note: form.note.trim() || null,
      });

      onCreated?.(createdAddress);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Không thể thêm địa chỉ cho người dùng.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormModal
      open
      title="Thêm địa chỉ"
      description={`Thêm địa chỉ cho ${
        user?.fullName || user?.userCode || "người dùng"
      }.`}
      fields={addressFields}
      form={form}
      onChange={handleChange}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitText="Thêm địa chỉ"
      loadingText="Đang thêm..."
      submitting={submitting}
      errorMessage={errorMessage}
    />
  );
};

export default UserAddressCreateModal;
