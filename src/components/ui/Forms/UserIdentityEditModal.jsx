import { useState } from "react";
import {
  LoaderCircle,
  Save,
  X,
} from "lucide-react";

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
  const [form, setForm] = useState(() =>
    createInitialForm(user, phone),
  );

  const [validationError, setValidationError] =
    useState("");

  if (!user) return null;

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
    });
  };

  const handleBackdropClick = () => {
    if (!submitting) {
      onClose?.();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="identity-edit-title"
      onClick={handleBackdropClick}
      className="
        fixed inset-0 z-70 flex items-center
        justify-center bg-black/40 px-4 py-6
      "
    >
      <div
        onClick={(event) =>
          event.stopPropagation()
        }
        className="
          relative w-full max-w-xl
          overflow-hidden rounded-2xl
          border border-border-subtle
          bg-surface shadow-2xl
        "
      >

        <div className="h-1 w-full bg-brand" />

        <header className="flex items-center justify-between border-b border-border-subtle px-5 py-4 sm:px-6">
          <div>
            <h2
              id="identity-edit-title"
              className="text-lg font-bold text-text-strong"
            >
              Chỉnh sửa danh tính
            </h2>

            <p className="mt-1 text-sm text-text-muted">
              Cập nhật thông tin của{" "}
              {user.fullName || user.userCode}.
            </p>
          </div>

            <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Đóng form chỉnh sửa"
            className="
                group flex h-9 w-9 items-center
                justify-center rounded-lg
                text-text-muted transition-colors
                duration-300
                hover:bg-danger-soft
                hover:text-danger
                disabled:opacity-50
            "
            >
            <X
                size={19}
                className="
                transition-transform duration-300
                ease-in-out
                group-hover:rotate-180
                "
            />
            </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[70vh] space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
            <div>
              <label
                htmlFor="edit-full-name"
                className="mb-2 block text-sm font-semibold text-text-default"
              >
                Họ tên
              </label>

              <input
                id="edit-full-name"
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                disabled={submitting}
                placeholder="Nhập họ tên"
                autoFocus
                className="
                  h-11 w-full rounded-xl
                  border border-input bg-surface
                  px-4 text-sm text-text-default
                  outline-none transition
                  focus:border-brand
                  focus:ring-4 focus:ring-brand/10
                  disabled:bg-surface-muted
                "
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="edit-birthday"
                  className="mb-2 block text-sm font-semibold text-text-default"
                >
                  Ngày sinh
                </label>

                <input
                  id="edit-birthday"
                  type="date"
                  name="birthday"
                  value={form.birthday}
                  onChange={handleChange}
                  disabled={submitting}
                  className="
                    h-11 w-full rounded-xl
                    border border-input bg-surface
                    px-4 text-sm text-text-default
                    outline-none transition
                    focus:border-brand
                    focus:ring-4 focus:ring-brand/10
                    disabled:bg-surface-muted
                  "
                />
              </div>

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

            <div>
              <label
                htmlFor="edit-phone"
                className="mb-2 block text-sm font-semibold text-text-default"
              >
                Số điện thoại
              </label>

              <input
                id="edit-phone"
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                disabled={submitting}
                placeholder="Nhập số điện thoại"
                className="
                  h-11 w-full rounded-xl
                  border border-input bg-surface
                  px-4 text-sm text-text-default
                  outline-none transition
                  focus:border-brand
                  focus:ring-4 focus:ring-brand/10
                  disabled:bg-surface-muted
                "
              />
            </div>

            {(validationError || errorMessage) && (
              <p className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
                {validationError || errorMessage}
              </p>
            )}
          </div>

          <footer className="flex justify-end gap-3 border-t border-border-subtle px-5 py-4 sm:px-6">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="
                rounded-xl border border-border
                px-4 py-2.5 text-sm font-semibold
                text-text-muted transition
                hover:bg-surface-muted
                disabled:opacity-50
              "
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="
                inline-flex min-w-32 items-center
                justify-center gap-2 rounded-xl
                bg-brand! px-4 py-2.5
                text-sm font-semibold text-white
                transition hover:opacity-90
                disabled:opacity-50
              "
            >
              {submitting ? (
                <LoaderCircle
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <Save size={17} />
              )}

              {submitting
                ? "Đang lưu..."
                : "Lưu thay đổi"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default UserIdentityEditModal;