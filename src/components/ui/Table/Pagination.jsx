import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  showingStart,
  showingEnd,
  totalItems,
}) => {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-gray-500!">
        Hiển thị {showingStart}-{showingEnd} trong số {totalItems} bản ghi
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="
            inline-flex h-9 items-center gap-1
            rounded-lg border border-gray-300
            bg-white px-3 text-sm font-semibold
            text-gray-600 transition
            hover:border-brand hover:text-brand
          "
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        {Array.from(
          { length: totalPages },
          (_, index) => index + 1
        ).map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`h-9 min-w-9 rounded-lg border px-3 text-sm font-semibold transition ${
              page === currentPage
                ? "border-brand bg-brand text-subtle"
                : "border-gray-300 bg-white text-gray-600 hover:border-brand hover:text-brand"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="
            inline-flex h-9 items-center gap-1
            rounded-lg border border-gray-300
            bg-white px-3 text-sm font-semibold
            text-gray-600 transition
            hover:border-brand hover:text-brand
          "
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;