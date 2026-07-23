import { Paperclip } from "lucide-react";
import SelectedFileItem from "./SelectedFileItem";
import { getFileKey } from "@/lib/fileUploadUtils";

const AttachmentPicker = ({ files, disabled, onChange, onRemove}) => (
  <div>
    <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 px-5 py-7 text-center transition hover:border-brand/40 hover:bg-brand-light/30">
      <Paperclip
        size={28}
        className="text-brand"
      />

      <span className="mt-2 text-sm font-semibold text-gray-800">
        Chọn file đính kèm
      </span>

      <span className="mt-1 text-xs text-gray-500">
        Nhận mọi định dạng, tối đa 50MB mỗi file
      </span>

      <input
        type="file"
        multiple
        onChange={onChange}
        disabled={disabled}
        className="hidden"
      />
    </label>

    {files.length > 0 && (
      <div className="mt-4 max-h-48 space-y-2 overflow-y-auto">
        {files.map((file) => (
          <SelectedFileItem
            key={getFileKey(file)}
            file={file}
            disabled={disabled}
            onRemove={onRemove}
          />
        ))}
      </div>
    )}
  </div>
);

export default AttachmentPicker;