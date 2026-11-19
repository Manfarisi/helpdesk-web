import type { ReactNode } from 'react'
import { priorityLabel, priorityRank, priorityText, statusDot, statusLabel } from '../lib/labels'
import type { TicketPriority, TicketStatus } from '../types/api'

export function StatusLabel({ status }: { status: TicketStatus }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`size-2 rounded-full ${statusDot[status]}`} />
      {statusLabel[status]}
    </span>
  )
}

export function PriorityLabel({ priority }: { priority: TicketPriority }) {
  return (
    <span className={priorityText[priority]}>
      P{priorityRank[priority]} {priorityLabel[priority]}
    </span>
  )
}

/**
 * Satu baris label-nilai di kartu detail. Kalau `wide`, baris memanjang ke dua kolom.
 */
export function DetailRow({
  label,
  children,
  wide = false,
}: {
  label: string
  children: ReactNode
  wide?: boolean
}) {
  return (
    <div
      className={`flex items-baseline justify-between gap-4 border-b border-line py-2 text-sm last:border-b-0 ${
        wide ? 'sm:col-span-2' : ''
      }`}
    >
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd className="min-w-0 text-right font-medium [overflow-wrap:anywhere]">{children}</dd>
    </div>
  )
}