import { X } from "lucide-react";

const ConfirmModal = ({
  open,
  title,
  children,
  confirmText = "Xác nhận",
  loadingText = "Đang xử lý...",
  confirmVariant = "primary",
  submitting = false,
  onClose,
  onConfirm,
}) => {
  if (!open) return null;

  const confirmClassName =
    confirmVariant === "danger"
      ? "bg-danger! hover:bg-danger/90!"
      : "bg-brand! hover:opacity-90";

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/30 px-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-xl bg-surface p-6 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="
            absolute right-4 top-4
            flex h-9 w-9 items-center justify-center
            rounded-full text-text-muted transition
            hover:bg-surface-muted hover:text-text-default
            disabled:cursor-not-allowed disabled:opacity-60
          "
        >
          <X size={20} />
        </button>

        <h3 className="pr-10 text-lg font-bold text-text-strong">
          {title}
        </h3>

        <div className="mt-3 text-sm leading-6 text-text-muted">
          {children}
        </div>

        <div className="mt-6 flex justify-end">
            <button
                type="button"
                onClick={onConfirm}
                disabled={submitting}
                className={`
                rounded-lg px-4 py-2
                text-sm font-semibold text-white
                transition disabled:cursor-not-allowed disabled:opacity-60
                ${confirmClassName}
                `}
            >
                {submitting ? loadingText : confirmText}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;