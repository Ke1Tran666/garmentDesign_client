import { X } from "lucide-react";

const FormModal = ({
  open,
  title,
  fields = [],
  form,
  onChange,
  onClose,
  onSubmit,
  submitText = "Lưu",
  loadingText = "Đang lưu...",
  submitting = false,
}) => {
  if (!open) return null;

  return (
    <div
        onClick={onClose}
        className={`
            fixed inset-0 z-60 flex items-center justify-center bg-black/30 px-4
        `}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl"
      >
        <button
        type="button"
        onClick={onClose}
        disabled={submitting}
        className="
            absolute right-4 top-4
            flex h-9 w-9 items-center justify-center
            rounded-full text-gray-500 transition
            hover:bg-gray-100 hover:text-gray-800
            disabled:cursor-not-allowed disabled:opacity-60
        "
        >
        <X size={20} />
        </button>
        <h3 className="text-lg font-bold text-gray-900">
          {title}
        </h3>

        <div className="mt-5 space-y-4">
          {fields.map((field) =>
            field.type === "textarea" ? (
              <textarea
                key={field.name}
                name={field.name}
                value={form[field.name] || ""}
                onChange={onChange}
                placeholder={field.placeholder}
                rows={field.rows || 4}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
              />
            ) : (
              <input
                key={field.name}
                type={field.type || "text"}
                name={field.name}
                value={form[field.name] || ""}
                onChange={onChange}
                placeholder={field.placeholder}
                className="h-11 w-full rounded-lg border border-gray-300 px-4 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
              />
            )
          )}
        </div>

        <div className="mt-6 flex justify-end">
            <button
                type="button"
                onClick={onSubmit}
                disabled={submitting}
                className="rounded-lg bg-brand! px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
                {submitting ? loadingText : submitText}
            </button>
        </div>
      </div>
    </div>
  );
};

export default FormModal;