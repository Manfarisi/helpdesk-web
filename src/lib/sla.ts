import type { Ticket } from '../types/api'

export type SlaTone = 'danger' | 'warning' | 'ok' | 'muted' | 'normal'

export interface SlaDisplay {
  text: string
  tone: SlaTone
  flagged: boolean
}

function formatRemaining(ms: number): string {
  const minutes = Math.floor(ms / 60_000)

  if (minutes < 60) return `${minutes}m`

  return `${Math.floor(minutes / 60)}j`
}

/**
 * Teks SLA untuk satu tiket. Tiket yang sudah selesai menampilkan hasil akhirnya,
 * tiket aktif menampilkan sisa waktu resolution. Untuk tiket yang jamnya sedang
 * berjalan, due date di tiket sudah memperhitungkan lama pause, jadi
 * sisa waktu cukup dihitung dari due date dikurangi sekarang.
 */
export function describeSla(ticket: Ticket, now: number): SlaDisplay {
  if (ticket.status === 'cancelled') {
    return { text: '—', tone: 'muted', flagged: false }
  }

  if (ticket.status === 'resolved' || ticket.status === 'closed') {
    return ticket.sla.is_breached
      ? { text: 'Terlewat', tone: 'danger', flagged: false }
      : { text: 'Terpenuhi', tone: 'ok', flagged: false }
  }

  if (ticket.sla.is_breached) {
    return { text: 'Terlewat', tone: 'danger', flagged: true }
  }

  if (ticket.sla.is_paused) {
    return { text: 'Dijeda', tone: 'muted', flagged: false }
  }

  const remaining = Date.parse(ticket.sla.resolution_due_at) - now

  // Scheduler jalan tiap menit, jadi bisa ada jeda singkat sebelum tiket ditandai breach.
  if (remaining <= 0) {
    return { text: 'Terlewat', tone: 'danger', flagged: true }
  }

  return {
    text: formatRemaining(remaining),
    tone: ticket.sla.is_warning ? 'warning' : 'normal',
    flagged: false,
  }
}