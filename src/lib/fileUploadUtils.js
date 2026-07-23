export const MAX_FILE_SIZE =
  50 * 1024 * 1024;

export const MAX_REQUEST_SIZE =
  200 * 1024 * 1024;

export const getFileKey = (file) =>
  [
    file.name,
    file.size,
    file.lastModified,
  ].join("-");

export const formatFileSize = (size) => {
  if (!Number.isFinite(size)) return "0 B";
  if (size < 1024) return `${size} B`;

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(
    size /
    (1024 * 1024)
  ).toFixed(1)} MB`;
};