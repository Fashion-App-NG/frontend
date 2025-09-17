// Pagination.js
const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.totalPages <= 1) return null; // no pagination needed

  return (
    <div className="mt-6 flex justify-between items-center">
      <span className="text-sm text-gray-500">
        Page {pagination.currentPage} of {pagination.totalPages}
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(pagination.currentPage - 1)}
          disabled={!pagination.hasPrevPage}
          className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(pagination.currentPage + 1)}
          disabled={!pagination.hasNextPage}
          className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
