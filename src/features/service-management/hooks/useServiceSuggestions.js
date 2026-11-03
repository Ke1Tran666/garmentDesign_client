import { useMemo } from "react";

export const formatPriceLabel = (val) => {
  if (val >= 1000000) {
    const tr = val / 1000000;
    return `${Number.isInteger(tr) ? tr : tr.toFixed(1)} Tr`;
  }
  if (val >= 1000) {
    return `${Math.round(val / 1000)}K`;
  }
  return `${val}đ`;
};

export const formatVND = (value) => {
  const price = Number(value);
  if (!Number.isFinite(price) || price === 0) return "0 đ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price);
};

export const useServiceSuggestions = (allServices = [], currentService = null) => {
  // Gợi ý Đơn vị tính: Lấy trực tiếp từ các giá trị thực tế trong data
  const unitSuggestions = useMemo(() => {
    const set = new Set();
    if (Array.isArray(allServices)) {
      allServices.forEach((s) => {
        if (s?.unitType && typeof s.unitType === "string") {
          const trimmed = s.unitType.trim();
          if (trimmed) set.add(trimmed);
        }
      });
    }
    if (currentService?.unitType && typeof currentService.unitType === "string") {
      const trimmed = currentService.unitType.trim();
      if (trimmed) set.add(trimmed);
    }
    if (set.size === 0) {
      return [
        "Sản phẩm",
        "Bộ",
        "Mẫu rập",
        "Bản vẽ 3D",
        "Giờ thiết kế",
        "Gói dịch vụ",
      ];
    }
    return Array.from(set);
  }, [allServices, currentService]);

  // Gợi ý Giá cơ bản: Lấy trực tiếp từ các mức giá thực tế trong data
  const priceSuggestions = useMemo(() => {
    const set = new Set();
    if (Array.isArray(allServices)) {
      allServices.forEach((s) => {
        const p = Number(s?.basePrice);
        if (Number.isFinite(p) && p > 0) {
          set.add(p);
        }
      });
    }
    if (currentService?.basePrice) {
      const p = Number(currentService.basePrice);
      if (Number.isFinite(p) && p > 0) set.add(p);
    }
    if (set.size === 0) {
      return [
        { label: "300K", value: 300000 },
        { label: "500K", value: 500000 },
        { label: "800K", value: 800000 },
        { label: "1.2 Tr", value: 1200000 },
        { label: "1.8 Tr", value: 1800000 },
        { label: "2.5 Tr", value: 2500000 },
      ];
    }
    const sorted = Array.from(set).sort((a, b) => a - b);
    return sorted.slice(0, 10).map((val) => ({
      label: formatPriceLabel(val),
      value: val,
    }));
  }, [allServices, currentService]);

  // Gợi ý Thẻ phân loại: Tách các tag thực tế từ danh sách dịch vụ
  const tagSuggestions = useMemo(() => {
    const set = new Set();
    if (Array.isArray(allServices)) {
      allServices.forEach((s) => {
        if (s?.tags && typeof s.tags === "string") {
          s.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
            .forEach((t) => set.add(t));
        }
      });
    }
    if (currentService?.tags && typeof currentService.tags === "string") {
      currentService.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .forEach((t) => set.add(t));
    }
    if (set.size === 0) {
      return [
        "May đo cao cấp",
        "Thiết kế 3D",
        "Làm rập",
        "May mẫu thử",
        "Vest nam",
        "Đầm dạ hội",
        "Đồng phục",
        "Chỉnh sửa phom",
        "Thời trang trẻ em",
        "Áo dài",
      ];
    }
    return Array.from(set).slice(0, 15);
  }, [allServices, currentService]);

  return {
    unitSuggestions,
    priceSuggestions,
    tagSuggestions,
    formatPriceLabel,
    formatVND,
  };
};
