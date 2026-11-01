import * as XLSX from "xlsx";

/**
 * Export JSON array to Excel (.xlsx) file
 * @param {Array<Object>} data
 * @param {string} fileName
 * @param {string} sheetName
 */
export const exportToExcel = (
  data,
  fileName = "export",
  sheetName = "Sheet1",
) => {
  if (!Array.isArray(data) || data.length === 0) {
    return false;
  }

  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Auto fit column widths
    const colWidths = Object.keys(data[0] || {}).map((key) => {
      const maxLen = Math.max(
        key.length,
        ...data.map((item) => String(item[key] ?? "").length),
      );
      return { wch: Math.min(Math.max(maxLen + 2, 10), 50) };
    });
    worksheet["!cols"] = colWidths;

    XLSX.writeFile(
      workbook,
      `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
    return true;
  } catch (err) {
    console.error("Export to Excel error:", err);
    return false;
  }
};
