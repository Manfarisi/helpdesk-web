import type { TicketPriority, TicketStatus } from '../types/api'
import type { SlaTone } from './sla'

export const statusLabel: Record<TicketStatus, string> = {
  new: 'Baru',
  open: 'Terbuka',
  in_progress: 'Dikerjakan',
  pending: 'Menunggu',
  resolved: 'Selesai',
  closed: 'Ditutup',
  cancelled: 'Dibatalkan',
}

// Titik kecil berwarna di samping nama status.
export const statusDot: Record<TicketStatus, string> = {
  new: 'bg-sky-500',
  open: 'bg-indigo-500',
  in_progress: 'bg-violet-500',
  pending: 'bg-amber-500',
  resolved: 'bg-emerald-500',
  closed: 'bg-slate-400',
  cancelled: 'bg-slate-300',
}

export const priorityLabel: Record<TicketPriority, string> = {
  low: 'Rendah',
  medium: 'Sedang',
  high: 'Tinggi',
  urgent: 'Mendesak',
}

// Penomoran P1 (paling mendesak) sampai P4, seperti di konsol help desk umumnya.
export const priorityRank: Record<TicketPriority, number> = {
  urgent: 1,
  high: 2,
  medium: 3,
  low: 4,
}

export const priorityText: Record<TicketPriority, string> = {
  urgent: 'font-semibold text-red-700',
  high: 'font-medium text-orange-700',
  medium: 'text-ink',
  low: 'text-muted',
}

export const slaToneClass: Record<SlaTone, string> = {
  danger: 'font-semibold text-red-700',
  warning: 'font-semibold text-amber-700',
  ok: 'text-emerald-700',
  muted: 'text-muted',
  normal: 'text-ink',
}