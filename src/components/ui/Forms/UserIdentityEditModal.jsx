import { useEffect, useState } from "react";
import FormModal from "./FormModal";
import UploadBox from "@/components/ui/Upload/UploadBox";
import defaultAvatar from "@/assets/images/avatar-default.jpg";
import FormInput from "../Input/FormInput";

const createInitialForm = (user, phone) => ({
  fullName: user?.fullName || "",
  birthday: user?.birthday || "",
  gender: user?.gender || "Unknown",
  phone: phone || "",
});

const UserIdentityEditModal = ({
  user,
  phone,
  submitting = false,
  errorMessage = "",
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState(() => createInitialForm(user, phone));

  const [validationError, setValidationError] = useState("");

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(
    () => user?.avatar || "",
  );
  const [avatarDeleted, setAvatarDeleted] = useState(false);
  
  useEffect(() => {
    return () => {
      if (avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  if (!user) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setValidationError("");
  };

  const handleAvatarUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
    ];

    if (!allowedTypes.includes(file.type)) {
      setValidationError(
        "Chỉ chấp nhận ảnh JPEG hoặc PNG.",
      );

      event.target.value = "";
      return;
    }

    const maxFileSize = 5 * 1024 * 1024;

    if (file.size > maxFileSize) {
      setValidationError(
        "Ảnh đại diện không được vượt quá 5 MB.",
      );

      event.target.value = "";
      return;
    }

    setAvatarFile(file);
    setAvatarDeleted(false);
    setAvatarPreview(URL.createObjectURL(file));
    setValidationError("");

    event.target.value = "";
  };

  const handleAvatarDelete = () => {
    setAvatarFile(null);
    setAvatarPreview("");
    setAvatarDeleted(Boolean(user.avatar));
    setValidationError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const fullName = form.fullName.trim();
    const normalizedPhone = form.phone
      .trim()
      .replace(/[\s.-]/g, "");

    if (!fullName) {
      setValidationError(
        "Họ tên không được để trống.",
      );
      return;
    }

    if (!form.birthday) {
      setValidationError(
        "Vui lòng chọn ngày sinh.",
      );
      return;
    }

    const birthday = new Date(
      `${form.birthday}T00:00:00`,
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (
      Number.isNaN(birthday.getTime()) ||
      birthday >= today
    ) {
      setValidationError(
        "Ngày sinh phải nhỏ hơn ngày hiện tại.",
      );
      return;
    }

    if (
      normalizedPhone &&
      !/^(0\d{9}|\+84\d{9}|84\d{9})$/.test(
        normalizedPhone,
      )
    ) {
      setValidationError(
        "Số điện thoại không hợp lệ.",
      );
      return;
    }

    onSubmit?.({
      fullName,
      birthday: form.birthday,
      gender: form.gender,
      phone: normalizedPhone,
      avatarFile,
      avatarDeleted,
    });
  };

  return (
    <FormModal
      open
      title="Chỉnh sửa danh tính"
      description={`Cập nhật thông tin của ${
        user.fullName || user.userCode
      }.`}
      submitting={submitting}
      errorMessage={validationError || errorMessage}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitText="Lưu thay đổi"
      loadingText="Đang lưu..."
      cancelText="Hủy"
    >
      <div>
        <label className="mb-2 block text-sm font-semibold text-text-default">
          Ảnh đại diện
        </label>

        <UploadBox
          variant="avatar"
          preview={avatarPreview}
          fallback={defaultAvatar}
          accept="image/jpeg,image/png"
          uploadText={
            avatarPreview
              ? "Thay đổi ảnh"
              : "Chọn ảnh"
          }
          deleteText="Xóa ảnh"
          onUpload={handleAvatarUpload}
          onDelete={handleAvatarDelete}
        />

        <p className="mt-2 text-xs text-text-muted">
          Chấp nhận JPEG hoặc PNG, dung lượng tối đa
          5 MB.
        </p>
      </div>

      <FormInput
        id="edit-full-name"
        label="Họ tên"
        name="fullName"
        value={form.fullName}
        onChange={handleChange}
        disabled={submitting}
        placeholder="Nhập họ tên"
        autoComplete="name"
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormInput
          id="edit-birthday"
          label="Ngày sinh"
          type="date"
          name="birthday"
          value={form.birthday}
          onChange={handleChange}
          disabled={submitting}
        />

        <div>
          <label
            htmlFor="edit-gender"
            className="mb-2 block text-sm font-semibold text-text-default"
          >
            Giới tính
          </label>

          <select
            id="edit-gender"
            name="gender"
            value={form.gender}
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
            <option value="Male">Nam</option>
            <option value="Female">Nữ</option>
            <option value="Unknown">
              Không xác định
            </option>
          </select>
        </div>
      </div>

      <FormInput
        id="edit-phone"
        label="Số điện thoại"
        type="tel"
        name="phone"
        value={form.phone}
        onChange={handleChange}
        disabled={submitting}
        placeholder="Nhập số điện thoại"
        autoComplete="tel"
        inputMode="tel"
        hint="Ví dụ: 0912345678"
      />
    </FormModal>
  );
};

export default UserIdentityEditModal;