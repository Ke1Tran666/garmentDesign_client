const DataTable = ({
  columns,
  data = [],
  colGroup = [],
  minWidth = "min-w-200",
  tableClassName = "",
  containerClassName = "",
  loading = false,
  loadingText = "Đang tải dữ liệu...",
  error = "",
  emptyText = "Không có dữ liệu",
  renderRow,
}) => {
  const renderStateRow = (message, isError = false) => (
    <tr>
      <td
        colSpan={columns.length}
        className={`
          px-4 py-10 text-center text-sm
          ${isError ? "text-red-500" : "text-text-muted"}
        `}
      >
        {message}
      </td>
    </tr>
  );

  return (
    <div
      className={`
        overflow-x-auto rounded-xl border border-border-subtle
        ${containerClassName}
      `}
    >
      <table
        className={`
          w-full text-left
          ${minWidth}
          ${colGroup.length > 0 ? "table-fixed" : ""}
          ${tableClassName}
        `}
      >
        {colGroup.length > 0 && (
          <colgroup>
            {colGroup.map((className, index) => (
              <col key={index} className={className} />
            ))}
          </colgroup>
        )}

        <thead>
          <tr className="border-b border-border-subtle bg-surface-subtle text-sm text-text-muted">
            {columns.map((column) => (
              <th
                key={column.key}
                className={`
                  px-4 py-3 font-medium
                  ${column.className || ""}
                `}
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {loading
            ? renderStateRow(loadingText)
            : error
              ? renderStateRow(error, true)
              : data.length > 0
                ? data.map(renderRow)
                : renderStateRow(emptyText)}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;