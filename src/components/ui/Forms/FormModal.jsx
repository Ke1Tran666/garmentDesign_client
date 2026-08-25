import { LoaderCircle, Save, X } from "lucide-react";

const FormModal = ({
  open = true,
  title,
  description,
  children,
  fields = [],
  form = {},
  onChange,
  onClose,
  onSubmit,
  submitText = "Lưu thay đổi",
  loadingText = "Đang lưu...",
  cancelText = "Hủy",
  submitting = false,
  errorMessage = "",
}) => {
  if (!open) return null;

  const handleBackdropClick = () => {
    if (!submitting) {
      onClose?.();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="form-modal-title"
      onClick={handleBackdropClick}
      className="
        fixed inset-0 z-70 flex items-center
        justify-center bg-black/40 px-4 py-6
      "
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="
          relative w-full max-w-xl
          overflow-hidden rounded-2xl
          border border-border-subtle
          bg-surface shadow-2xl
        "
      >
        <div className="h-1 w-full bg-brand" />

        <header className="flex items-center justify-between border-b border-border-subtle px-5 py-4 sm:px-6">
          <div className="min-w-0 pr-4">
            <h2
              id="form-modal-title"
              className="text-lg font-bold text-text-strong"
            >
              {title}
            </h2>

            {description && (
              <p className="mt-1 text-sm text-text-muted">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Đóng"
            className="
              group flex h-9 w-9 shrink-0
              items-center justify-center rounded-lg
              text-text-muted transition-colors
              duration-300 hover:bg-danger-soft
              hover:text-danger disabled:opacity-50
            "
          >
            <X
              size={19}
              className="
                transition-transform duration-300
                ease-in-out group-hover:rotate-180
              "
            />
          </button>
        </header>

        <form onSubmit={onSubmit}>
          <div className="max-h-[70vh] space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
            {children ??
              fields.map((field) => {
                const commonProps = {
                  id: field.name,
                  name: field.name,
                  value: form[field.name] || "",
                  onChange,
                  disabled: submitting,
                  placeholder: field.placeholder,
                };

                if (field.type === "textarea") {
                  return (
                    <textarea
                      key={field.name}
                      {...commonProps}
                      rows={field.rows || 4}
                      className="
                        w-full rounded-xl border
                        border-input bg-surface
                        px-4 py-3 text-sm
                        text-text-default outline-none
                        transition focus:border-brand
                        focus:ring-4 focus:ring-brand/10
                        disabled:bg-surface-muted
                      "
                    />
                  );
                }

                return (
                  <input
                    key={field.name}
                    {...commonProps}
                    type={field.type || "text"}
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
                );
              })}

            {errorMessage && (
              <p className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
                {errorMessage}
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
              {cancelText}
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

              {submitting ? loadingText : submitText}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default FormModal;