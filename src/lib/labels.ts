import type { TicketPriority, TicketStatus } from '../types/api'

export const statusLabel: Record<TicketStatus, string> = {
  new: 'Baru',
  open: 'Terbuka',
  in_progress: 'Dikerjakan',
  pending: 'Menunggu',
  resolved: 'Selesai',
  closed: 'Ditutup',
  cancelled: 'Dibatalkan',
}

export const statusStyle: Record<TicketStatus, string> = {
  new: 'bg-sky-100 text-sky-800',
  open: 'bg-indigo-100 text-indigo-800',
  in_progress: 'bg-violet-100 text-violet-800',
  pending: 'bg-amber-100 text-amber-800',
  resolved: 'bg-emerald-100 text-emerald-800',
  closed: 'bg-slate-200 text-slate-700',
  cancelled: 'bg-slate-100 text-slate-500',
}

export const priorityLabel: Record<TicketPriority, string> = {
  low: 'Rendah',
  medium: 'Sedang',
  high: 'Tinggi',
  urgent: 'Mendesak',
}

export const priorityStyle: Record<TicketPriority, string> = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-sky-100 text-sky-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
}