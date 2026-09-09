import { ChevronLeft, ChevronRight } from 'lucide-react'

function getVisiblePages(currentPage, totalPages) {
  const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4))
  const end = Math.min(totalPages, start + 4)
  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
}

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const pages = getVisiblePages(currentPage, totalPages)

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2" aria-label="Pagination artikel">
      <button
        type="button"
        className="focus-ring inline-flex size-11 cursor-pointer items-center justify-center rounded-xl border border-border bg-bg-secondary text-text-secondary transition-colors duration-200 hover:bg-bg-hover disabled:cursor-not-allowed disabled:opacity-40"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Halaman sebelumnya"
      >
        <ChevronLeft aria-hidden="true" size={18} />
      </button>

      {pages.map((page) => (
        <button
          type="button"
          key={page}
          className={`focus-ring size-11 cursor-pointer rounded-xl border text-sm font-semibold transition-colors duration-200 ${
            page === currentPage
              ? 'border-brand bg-brand text-brand-contrast'
              : 'border-border bg-bg-secondary text-text-secondary hover:bg-bg-hover hover:text-text-primary'
          }`}
          onClick={() => onPageChange(page)}
          aria-current={page === currentPage ? 'page' : undefined}
          aria-label={`Halaman ${page}`}
        >
          {page}
        </button>
      ))}

      <button
        type="button"
        className="focus-ring inline-flex size-11 cursor-pointer items-center justify-center rounded-xl border border-border bg-bg-secondary text-text-secondary transition-colors duration-200 hover:bg-bg-hover disabled:cursor-not-allowed disabled:opacity-40"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Halaman berikutnya"
      >
        <ChevronRight aria-hidden="true" size={18} />
      </button>
    </nav>
  )
}

