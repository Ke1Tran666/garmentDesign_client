import { formatFileSize } from "@/lib/fileUploadUtils";
import {
  ImagePlus,
  Package,
  Trash2,
} from "lucide-react";

const ProductImagePicker = ({
  imageUrl = "",
  selectedFile = null,
  disabled = false,
  editable = true,
  onChange,
  onRemove,
  variant = "card",
  alt = "Ảnh sản phẩm",
}) => {
  /*
   * Dùng trong ServiceOrderDetailModal.
   */
  if (variant === "overlay") {
    return (
      <div className="relative min-h-72 overflow-hidden bg-gray-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={alt}
            decoding="async"
            draggable={false}
            className="h-full min-h-72 w-full object-cover"
          />
        ) : (
          <div className="flex h-full min-h-72 flex-col items-center justify-center gap-4 text-gray-400">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-sm">
              <Package size={34} />
            </div>

            <span className="text-sm font-medium">
              Chưa có hình ảnh
            </span>
          </div>
        )}

        {editable && (
          <label
            className={`absolute inset-x-4 bottom-4 flex items-center justify-center gap-2 rounded-xl bg-gray-950/85 px-4 py-3 text-sm font-semibold text-white transition ${
              disabled
                ? "cursor-not-allowed opacity-60"
                : "cursor-pointer hover:bg-gray-950"
            }`}
          >
            <ImagePlus size={18} />

            Chọn ảnh đại diện

            <input
              type="file"
              accept="image/*"
              onChange={onChange}
              disabled={disabled}
              className="hidden"
            />
          </label>
        )}
      </div>
    );
  }

  /*
   * Dùng trong ServiceOrderCreateModal.
   */
  return imageUrl ? (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
      <img
        src={imageUrl}
        alt={alt}
        decoding="async"
        draggable={false}
        className="h-52 w-full object-cover"
      />

      <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-xl bg-gray-950/85 px-3 py-2 text-white">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold">
            {selectedFile?.name}
          </p>

          <p className="mt-0.5 text-[11px] text-gray-300">
            {formatFileSize(
              selectedFile?.size,
            )}
          </p>
        </div>

        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            aria-label="Xóa ảnh đã chọn"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-red-500 disabled:opacity-50"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </div>
  ) : (
    <label
      className={`flex h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 text-center transition ${
        disabled
          ? "cursor-not-allowed opacity-60"
          : "cursor-pointer hover:border-brand hover:bg-brand-light"
      }`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand shadow-sm">
        <ImagePlus size={22} />
      </div>

      <p className="mt-3 text-sm font-semibold text-gray-700">
        Chọn ảnh đại diện
      </p>

      <p className="mt-1 text-xs text-gray-400">
        JPG, PNG, WEBP...
      </p>

      <input
        type="file"
        accept="image/*"
        onChange={onChange}
        disabled={disabled}
        className="hidden"
      />
    </label>
  );
};

export default ProductImagePicker;