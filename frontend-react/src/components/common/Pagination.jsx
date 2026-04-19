export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        className="btn-secondary px-3 py-1.5 text-sm"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        Previous
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
            p === page ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          {p}
        </button>
      ))}
      <button
        className="btn-secondary px-3 py-1.5 text-sm"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
      >
        Next
      </button>
    </div>
  )
}
