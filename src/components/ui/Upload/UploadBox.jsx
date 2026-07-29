const UploadBox = ({
  variant = "avatar", // avatar | image | file
  preview,
  fallback,
  accept = "image/*",
  uploadText = "Upload",
  deleteText = "Delete",
  onUpload,
  onDelete,
  className,
}) => {
  const isAvatar = variant === "avatar";
  const isImage = variant === "image";

  return (
    <div 
      className={`
        overflow-hidden rounded-xl border border-border ${className}
      `}
    >
      <div className="grid grid-cols-1 md:grid-cols-[1fr_220px]">
        <div
          className={`
            flex min-h-32 items-center justify-center
            ${
              isAvatar
                ? "bg-[radial-gradient(circle,#e5e7eb_1px,transparent_1px)] bg-size-[18px_18px]"
                : "bg-surface-subtle"
            }
          `}
        >
          {isAvatar && (
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-border bg-surface">
              <img
                src={preview || fallback}
                alt="image"
                className={
                    isAvatar ? "h-20 w-20 rounded-full object-cover" : "object-cover"
                }
                onError={(e) => {
                  e.currentTarget.src = fallback;
                }}
              />
            </div>
          )}

          {isImage && (
            <img
              src={preview || fallback}
              alt="preview"
              className="h-full max-h-40 w-full object-cover"
              onError={(e) => {
                e.currentTarget.src = fallback;
              }}
            />
          )}
        </div>

        <div className="grid border-t border-border md:border-l md:border-t-0">
          <label
            htmlFor="upload-box-input"
            className="flex cursor-pointer items-center justify-center border-b border-border text-sm font-semibold text-brand transition hover:bg-surface-subtle"
          >
            {uploadText}
          </label>

          <input
            id="upload-box-input"
            type="file"
            accept={accept}
            className="hidden"
            onChange={onUpload}
          />

          <button
            type="button"
            onClick={onDelete}
            className="text-sm font-semibold text-red-500 transition hover:bg-red-50"
          >
            {deleteText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadBox;