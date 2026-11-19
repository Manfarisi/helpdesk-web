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