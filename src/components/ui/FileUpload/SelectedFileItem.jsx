import { FileText, Trash2 } from "lucide-react";
import { memo } from "react";
import { formatFileSize } from "@/lib/fileUploadUtils";

const SelectedFileItem = ({
  file,
  disabled,
  onRemove,
}) => (
  <div className="flex items-center gap-3 rounded-xl border border-border-subtle bg-surface p-3">
    <FileText
      size={17}
      className="shrink-0 text-brand"
    />

    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-medium text-text-default">
        {file.name}
      </p>

      <p className="text-xs text-text-subtle">
        {formatFileSize(file.size)}
      </p>
    </div>

    <button
      type="button"
      onClick={() => onRemove(file)}
      disabled={disabled}
      aria-label={`Xóa ${file.name}`}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-text-subtle hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
    >
      <Trash2 size={15} />
    </button>
  </div>
);

export default memo(SelectedFileItem);