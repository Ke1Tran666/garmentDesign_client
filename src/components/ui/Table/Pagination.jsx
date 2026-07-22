const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  showingStart,
  showingEnd,
  totalItems,
  showOnSinglePage = false,
}) => {
  if (!showOnSinglePage && totalPages <= 1) {
    return null;
  }

  const displayedPages = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  ).filter(
    (pageNumber) =>
      pageNumber === 1 ||
      pageNumber === totalPages ||
      Math.abs(pageNumber - currentPage) <= 1,
  );

  const hasItemSummary =
    Number.isFinite(showingStart) &&
    Number.isFinite(showingEnd) &&
    Number.isFinite(totalItems);

  const changePage = (page) => {
    const safePage = Math.max(1, Math.min(page, totalPages));

    onPageChange(safePage);
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-gray-500">
        {hasItemSummary ? (
          <>
            Hiển thị{" "}
            <span className="font-semibold text-gray-700">
              {showingStart}-{showingEnd}
            </span>{" "}
            trong số {totalItems} bản ghi
          </>
        ) : (
          <>
            Trang{" "}
            <span className="font-semibold text-gray-700">
              {currentPage}
            </span>{" "}
            / {totalPages}
          </>
        )}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => changePage(currentPage - 1)}
          disabled={currentPage <= 1}
          className="
            rounded-xl border border-gray-200
            px-4 py-2 text-sm font-semibold text-gray-600
            transition hover:bg-gray-50
            disabled:cursor-not-allowed disabled:opacity-40
          "
        >
          Trước
        </button>

        <div className="flex items-center gap-1">
          {displayedPages.map((pageNumber, index) => {
            const previousPage = displayedPages[index - 1];
            const hasGap =
              previousPage && pageNumber - previousPage > 1;

            return (
              <div
                key={pageNumber}
                className="flex items-center gap-1"
              >
                {hasGap && (
                  <span className="px-1 text-gray-400">
                    ...
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => changePage(pageNumber)}
                  aria-current={
                    pageNumber === currentPage ? "page" : undefined
                  }
                  className={`
                    flex h-9 min-w-9 items-center justify-center
                    rounded-xl px-2 text-sm font-semibold transition
                    ${
                      pageNumber === currentPage
                        ? "bg-brand! text-white"
                        : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }
                  `}
                >
                  {pageNumber}
                </button>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => changePage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="
            rounded-xl border border-gray-200
            px-4 py-2 text-sm font-semibold text-gray-600
            transition hover:bg-gray-50
            disabled:cursor-not-allowed disabled:opacity-40
          "
        >
          Sau
        </button>
      </div>
    </div>
  );
};

export default Pagination;