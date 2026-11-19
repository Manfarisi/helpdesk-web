export type UserRole = 'admin' | 'agent' | 'requester'

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
}

export type TicketStatus =
  | 'new'
  | 'open'
  | 'in_progress'
  | 'pending'
  | 'resolved'
  | 'closed'
  | 'cancelled'

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'

// "active" = new, open, in_progress, pending. "finished" = resolved, closed, cancelled.
export type TicketGroup = 'active' | 'finished'

export interface Category {
  id: number
  name: string
  slug: string
  description: string | null
}

export interface TicketSla {
  first_response_due_at: string
  resolution_due_at: string
  first_responded_at: string | null
  resolved_at: string | null
  closed_at: string | null
  is_paused: boolean
  escalation_level: number
  progress_percent: number | null
  is_warning: boolean
  is_breached: boolean
}

export interface Ticket {
  id: number
  number: string
  subject: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  category: Category
  requester: User
  assignee: User | null
  sla: TicketSla
  created_at: string
  updated_at: string
}

export interface TicketComment {
  id: number
  ticket_id: number
  body: string
  is_internal: boolean
  author: User
  created_at: string
}

export interface Paginated<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export interface TicketListCounts {
  active: number
  finished: number
}

export interface TicketListResponse extends Paginated<Ticket> {
  counts: TicketListCounts
}