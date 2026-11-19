import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './ui'

export function Pagination({
  page,
  lastPage,
  total,
  perPage,
  unit = 'data',
  onPageChange,
}: {
  page: number
  lastPage: number
  total: number
  perPage: number
  unit?: string
  onPageChange: (page: number) => void
}) {
  if (total === 0) return null

  const to = Math.min(page * perPage, total)
  const from = Math.min((page - 1) * perPage + 1, to)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-white px-6 py-3 text-sm">
      <p className="text-muted">
        Menampilkan {from}–{to} dari {total} {unit}
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          disabled={page <= 1}
          onClick={() => onPageChange(Math.min(page - 1, lastPage))}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Sebelumnya
        </Button>
        <span className="text-muted">
          Halaman {page} dari {lastPage}
        </span>
        <Button
          variant="secondary"
          disabled={page >= lastPage}
          onClick={() => onPageChange(page + 1)}
        >
          Berikutnya
          <ChevronRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}