/**
 * Trích xuất 1-2 chữ cái đầu từ họ tên.
 * Ví dụ: "Staff System" -> "SS", "Admin" -> "AD", "Nguyễn Văn An" -> "NA"
 */
export const getInitials = (name, fallback = "U") => {
  if (!name || typeof name !== "string") return fallback;

  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fallback;

  if (parts.length === 1) {
    const single = parts[0];
    return single.length >= 2
      ? single.slice(0, 2).toUpperCase()
      : single.toUpperCase();
  }

  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
};