const DataTable = ({
  columns,
  data,
  colGroup = [],
  minWidth = "min-w-205",
  emptyText = "Không có dữ liệu",
  renderRow,
}) => {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <div className="overflow-x-auto">
        <table className={`w-full table-fixed ${minWidth}`}>
          {colGroup.length > 0 && (
            <colgroup>
              {colGroup.map((className, index) => (
                <col key={index} className={className} />
              ))}
            </colgroup>
          )}

          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`
                    px-4 py-3 text-left text-xs
                    font-bold uppercase tracking-wide text-gray-600
                    ${column.className || ""}
                  `}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {data.length > 0 ? (
              data.map(renderRow)
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="
                    px-4 py-10 text-center
                    text-sm text-gray-500
                  "
                >
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;