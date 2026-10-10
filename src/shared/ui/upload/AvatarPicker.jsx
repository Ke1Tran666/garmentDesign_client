import { useId } from "react";
import { Camera, Trash2, UserRound } from "lucide-react";

const AvatarPicker = ({
  preview = "",
  fallback = "",
  alt = "Ảnh đại diện",
  code = "",
  title = "",
  hint = "JPEG hoặc PNG, tối đa 5 MB.",
  accept = "image/jpeg,image/png",
  disabled = false,
  removable = false,
  onSelect,
  onRemove,
  variant = "card",
  initials = "U",
}) => {
  const generatedId = useId();
  const inputId = `avatar-picker-${generatedId}`;

  const handleChange = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      onSelect?.(file);
    }

    /*
     * Cho phép chọn lại cùng một file.
     */
    event.target.value = "";
  };

  if (variant === "compact") {
    const imageSource = preview || fallback;

    return (
      <div className="relative h-12 w-12 shrink-0">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-surface-muted text-sm font-semibold text-text-muted">
          {imageSource ? (
            <img
              src={imageSource}
              alt={alt}
              className="h-full w-full object-cover"
            />
          ) : (
            initials
          )}
        </div>

        {!disabled && (
          <>
            <label
              htmlFor={inputId}
              title="Thay đổi ảnh đại diện"
              className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/45 text-white opacity-0 transition focus-within:opacity-100 hover:opacity-100"
            >
              <Camera size={16} />

              <span className="sr-only">Chọn ảnh đại diện</span>
            </label>

            <input
              id={inputId}
              type="file"
              accept={accept}
              onChange={handleChange}
              className="sr-only"
            />
          </>
        )}

        {!disabled && (
          <span className="pointer-events-none absolute -right-1 -bottom-1 z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface bg-brand text-white">
            <UserRound size={12} />
          </span>
        )}

        {!disabled && removable && (
          <button
            type="button"
            onClick={onRemove}
            title="Xóa ảnh đại diện"
            aria-label="Xóa ảnh đại diện"
            className="absolute -top-1 -right-1 z-20 flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface bg-danger text-white transition hover:opacity-85"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-border-subtle bg-surface-subtle p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative shrink-0">
          <div className="flex h-22 w-22 items-center justify-center overflow-hidden rounded-2xl border border-border bg-surface text-xl font-semibold text-text-muted">
            <img
              src={preview || fallback}
              alt={alt}
              className="h-full w-full object-cover"
              onError={(event) => {
                if (fallback) {
                  event.currentTarget.src = fallback;
                }
              }}
            />
          </div>

          <span className="absolute -right-1 -bottom-1 flex h-7 w-7 items-center justify-center rounded-lg border-2 border-surface bg-brand text-white">
            <UserRound size={14} />
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-text-strong">
            {title || "Chưa cập nhật tên"}
          </p>

          {code && <p className="mt-1 text-sm text-text-muted">{code}</p>}

          <p className="mt-2 text-xs text-text-subtle">{hint}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <label
            htmlFor={inputId}
            aria-disabled={disabled}
            className={`inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm font-semibold text-text-default transition ${
              disabled
                ? "pointer-events-none cursor-not-allowed opacity-50"
                : "cursor-pointer hover:bg-surface-muted"
            } `}
          >
            <Camera size={16} />

            {preview ? "Thay ảnh" : "Chọn ảnh"}
          </label>

          <input
            id={inputId}
            type="file"
            accept={accept}
            disabled={disabled}
            onChange={handleChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={onRemove}
            disabled={disabled || !removable}
            className="inline-flex items-center gap-2 rounded-xl border border-danger-border bg-surface px-3 py-2 text-sm font-semibold text-danger transition hover:bg-danger-soft disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 size={16} />
            Xóa ảnh
          </button>
        </div>
      </div>
    </section>
  );
};

export default AvatarPicker;
