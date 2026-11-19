import type { Ticket, TicketStatus, User } from '../../types/api'

/**
 * Cerminan TicketStatus::allowedTransitions di API. API tetap penjaga sebenarnya
 * (422 kalau transisinya nggak valid), ini cuma supaya tombol yang nggak mungkin berhasil
 * nggak ditampilkan.
 */
export const allowedTransitions: Record<TicketStatus, TicketStatus[]> = {
  new: ['open', 'cancelled'],
  open: ['in_progress', 'cancelled'],
  in_progress: ['pending', 'resolved'],
  pending: ['in_progress'],
  resolved: ['closed', 'open'],
  closed: [],
  cancelled: [],
}

// Status di mana tiket masih bisa di-assign atau di-claim (timer SLA masih relevan).
const activeStatuses: TicketStatus[] = ['new', 'open', 'in_progress', 'pending']

/**
 * Cerminan TicketPolicy::transition di API: siapa boleh mengubah status ke mana.
 */
export function mayTransition(user: User, ticket: Ticket, to: TicketStatus): boolean {
  if (user.role === 'admin') return true

  if (user.role === 'agent') {
    return (
      ticket.assignee?.id === user.id &&
      (to === 'in_progress' || to === 'pending' || to === 'resolved')
    )
  }

  // Requester: hanya tiket miliknya sendiri.
  if (ticket.requester.id !== user.id) return false

  switch (to) {
    case 'cancelled':
      return ticket.status === 'new' || ticket.status === 'open'
    case 'closed':
    case 'open':
      return ticket.status === 'resolved'
    case 'in_progress':
      return ticket.status === 'pending'
    default:
      return false
  }
}

export type ActionTone = 'primary' | 'secondary' | 'danger'

export interface WorkflowAction {
  to: TicketStatus
  label: string
  tone: ActionTone
  // Kalau diisi, tombol meminta konfirmasi dulu dengan teks ini.
  confirm?: string
}

function describeAction(
  from: TicketStatus,
  to: TicketStatus,
): { label: string; tone: ActionTone; confirm?: string } {
  if (to === 'cancelled') {
    return {
      label: 'Batalkan tiket',
      tone: 'danger',
      confirm: 'Tiket yang dibatalkan nggak bisa dibuka lagi.',
    }
  }

  if (to === 'closed') {
    return {
      label: 'Tutup tiket',
      tone: 'secondary',
      confirm: 'Tiket yang sudah ditutup nggak bisa dibuka lagi.',
    }
  }

  if (from === 'open' && to === 'in_progress') {
    return { label: 'Mulai kerjakan', tone: 'primary' }
  }

  if (from === 'pending' && to === 'in_progress') {
    return { label: 'Lanjutkan pengerjaan', tone: 'primary' }
  }

  if (to === 'pending') {
    return { label: 'Menunggu pemohon', tone: 'secondary' }
  }

  if (to === 'resolved') {
    return { label: 'Tandai selesai', tone: 'primary' }
  }

  if (from === 'resolved' && to === 'open') {
    return { label: 'Buka kembali', tone: 'secondary' }
  }

  return { label: `Ubah ke ${to}`, tone: 'secondary' }
}

/**
 * Daftar tombol perubahan status yang boleh dipakai user ini pada tiket ini.
 */
export function availableActions(user: User, ticket: Ticket): WorkflowAction[] {
  const actions: WorkflowAction[] = []

  for (const to of allowedTransitions[ticket.status]) {
    if (!mayTransition(user, ticket, to)) continue

    // Selain menutup dan membatalkan, tiket harus punya penanggung jawab (aturan TicketService).
    if (ticket.assignee === null && to !== 'closed' && to !== 'cancelled') continue

    // Requester melanjutkan tiket yang menunggu dengan membalas percakapan (otomatis),
    // bukan lewat tombol.
    if (user.role === 'requester' && to === 'in_progress') continue

    actions.push({ to, ...describeAction(ticket.status, to) })
  }

  return actions
}

/**
 * Cerminan TicketPolicy::claim: staff boleh mengambil tiket yang belum punya penanggung jawab.
 */
export function canClaim(user: User, ticket: Ticket): boolean {
  return (
    user.role !== 'requester' && ticket.assignee === null && activeStatuses.includes(ticket.status)
  )
}

/**
 * Cerminan TicketPolicy::assign: hanya admin, dan hanya untuk tiket yang masih berjalan.
 */
export function canAssign(user: User, ticket: Ticket): boolean {
  return user.role === 'admin' && activeStatuses.includes(ticket.status)
}