import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { LoaderCircle, Save, X } from "lucide-react";

const FOCUSABLE_SELECTOR = [
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "a[href]",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

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
  maxWidthClassName = "max-w-xl",
}) => {
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const submittingRef = useRef(submitting);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    submittingRef.current = submitting;
  }, [submitting]);

  useEffect(() => {
    if (!open) return undefined;

    const previousActiveElement = document.activeElement;

    const previousOverflow = document.body.style.overflow;

    const previousPaddingRight = document.body.style.paddingRight;

    const appRoot = document.getElementById("root");

    const previousRootInert = appRoot?.inert ?? false;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    if (appRoot) {
      appRoot.inert = true;
    }

    const focusFrame = window.requestAnimationFrame(() => {
      const firstFocusable =
        dialogRef.current?.querySelector(FOCUSABLE_SELECTOR);

      firstFocusable?.focus();
    });

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !submittingRef.current) {
        event.preventDefault();
        onCloseRef.current?.();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = Array.from(
        dialogRef.current?.querySelectorAll(FOCUSABLE_SELECTOR) || [],
      );

      if (focusableElements.length === 0) {
        event.preventDefault();
        dialogRef.current?.focus();
        return;
      }

      const first = focusableElements[0];

      const last = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);

      document.removeEventListener("keydown", handleKeyDown);

      document.body.style.overflow = previousOverflow;

      document.body.style.paddingRight = previousPaddingRight;

      if (appRoot) {
        appRoot.inert = previousRootInert;
      }

      previousActiveElement?.focus?.();
    };
  }, [open]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget && !submitting) {
      onClose?.();
    }
  };

  const modal = (
    <div
      role="presentation"
      onMouseDown={handleBackdropClick}
      className="fixed inset-0 z-70 flex items-center justify-center overscroll-contain bg-black/40 px-4 py-6"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-modal-title"
        aria-describedby={description ? "form-modal-description" : undefined}
        tabIndex={-1}
        className={`relative flex max-h-[calc(100dvh-3rem)] w-full flex-col overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-2xl ${maxWidthClassName} `}
      >
        <div className="h-1 w-full shrink-0 bg-brand" />

        <header className="flex shrink-0 items-center justify-between border-b border-border-subtle px-5 py-4 sm:px-6">
          <div className="min-w-0 pr-4">
            <h2
              id="form-modal-title"
              className="text-lg font-bold text-text-strong"
            >
              {title}
            </h2>

            {description && (
              <p
                id="form-modal-description"
                className="mt-1 text-sm text-text-muted"
              >
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Đóng"
            className="group flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-text-muted transition-colors duration-300 hover:bg-danger-soft hover:text-danger disabled:opacity-50"
          >
            <X
              size={19}
              className="transition-transform duration-300 ease-in-out group-hover:rotate-180"
            />
          </button>
        </header>

        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
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
                      className="w-full rounded-xl border border-input bg-surface px-4 py-3 text-sm text-text-default transition outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 disabled:bg-surface-muted"
                    />
                  );
                }

                return (
                  <input
                    key={field.name}
                    {...commonProps}
                    type={field.type || "text"}
                    className="h-11 w-full rounded-xl border border-input bg-surface px-4 text-sm text-text-default transition outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 disabled:bg-surface-muted"
                  />
                );
              })}

            {errorMessage && (
              <p
                role="alert"
                className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger"
              >
                {errorMessage}
              </p>
            )}
          </div>

          <footer className="flex shrink-0 justify-end gap-3 border-t border-border-subtle px-5 py-4 sm:px-6">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-text-muted transition hover:bg-surface-muted disabled:opacity-50"
            >
              {cancelText}
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex min-w-32 items-center justify-center gap-2 rounded-xl bg-brand! px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? (
                <LoaderCircle size={17} className="animate-spin" />
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

  return createPortal(modal, document.body);
};

export default FormModal;
