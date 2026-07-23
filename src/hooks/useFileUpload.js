import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getFileKey, MAX_FILE_SIZE, MAX_REQUEST_SIZE} from "@/lib/fileUploadUtils";

const createImagePreview = (file) =>
  URL.createObjectURL(file);

export const useFileUpload = ({
  onError,
  maxFileSize = MAX_FILE_SIZE,
  maxRequestSize = MAX_REQUEST_SIZE,
} = {}) => {
  const [productImageFile, setProductImageFile] =
    useState(null);

  const [productImagePreview, setProductImagePreview] =
    useState("");

  const [attachmentFiles, setAttachmentFiles] =
    useState([]);

  const previewRef = useRef("");

  const clearPreview = useCallback(() => {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = "";
    }

    setProductImagePreview("");
  }, []);

  useEffect(() => {
    return () => {
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
      }
    };
  }, []);

  const handleProductImageChange =
    useCallback(
      (event) => {
        const file = event.target.files?.[0];
        event.target.value = "";

        if (!file) return;

        if (!file.type.startsWith("image/")) {
          onError?.(
            "Vui lòng chọn đúng định dạng ảnh.",
          );
          return;
        }

        if (file.size > maxFileSize) {
          onError?.(
            "Ảnh không được vượt quá 50MB.",
          );
          return;
        }

        clearPreview();

        const preview = createImagePreview(file);

        previewRef.current = preview;

        setProductImageFile(file);
        setProductImagePreview(preview);
        onError?.("");
      },
      [clearPreview, maxFileSize, onError],
    );

  const removeProductImage = useCallback(() => {
    clearPreview();
    setProductImageFile(null);
    onError?.("");
  }, [clearPreview, onError]);

  const handleAttachmentChange =
    useCallback(
      (event) => {
        const selectedFiles = Array.from(
          event.target.files || [],
        );

        event.target.value = "";

        if (selectedFiles.length === 0) return;

        const oversizedFile =
          selectedFiles.find(
            (file) => file.size > maxFileSize,
          );

        if (oversizedFile) {
          onError?.(
            `File "${oversizedFile.name}" vượt quá 50MB.`,
          );
          return;
        }

        setAttachmentFiles((previousFiles) => {
          const fileMap = new Map();

          [
            ...previousFiles,
            ...selectedFiles,
          ].forEach((file) => {
            fileMap.set(getFileKey(file), file);
          });

          return Array.from(fileMap.values());
        });

        onError?.("");
      },
      [maxFileSize, onError],
    );

  const removeAttachment = useCallback(
    (removingFile) => {
      setAttachmentFiles((previousFiles) =>
        previousFiles.filter(
          (file) =>
            getFileKey(file) !==
            getFileKey(removingFile),
        ),
      );

      onError?.("");
    },
    [onError],
  );

  const resetFiles = useCallback(() => {
    clearPreview();
    setProductImageFile(null);
    setAttachmentFiles([]);
  }, [clearPreview]);

  const totalUploadSize = useMemo(
    () =>
      (productImageFile?.size || 0) +
      attachmentFiles.reduce(
        (total, file) => total + file.size,
        0,
      ),
    [attachmentFiles, productImageFile],
  );

  const hasUpload =
    Boolean(productImageFile) ||
    attachmentFiles.length > 0;

  const validateTotalSize = useCallback(() => {
    if (totalUploadSize <= maxRequestSize) {
      return true;
    }

    onError?.(
      "Tổng dung lượng ảnh và file không được vượt quá 200MB.",
    );

    return false;
  }, [
    maxRequestSize,
    onError,
    totalUploadSize,
  ]);

  const buildFormData = useCallback(
    (note = "") => {
      const formData = new FormData();

      if (productImageFile) {
        formData.append(
          "image",
          productImageFile,
        );
      }

      attachmentFiles.forEach((file) => {
        formData.append("files", file);
      });

      if (note) {
        formData.append("note", note);
      }

      return formData;
    },
    [attachmentFiles, productImageFile],
  );

  return {
    productImageFile,
    productImagePreview,
    attachmentFiles,
    hasUpload,
    totalUploadSize,
    handleProductImageChange,
    handleAttachmentChange,
    removeProductImage,
    removeAttachment,
    resetFiles,
    validateTotalSize,
    buildFormData,
  };
};