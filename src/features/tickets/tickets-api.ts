import { api } from '../../lib/api'
import type {
  Category,
  Ticket,
  TicketComment,
  TicketGroup,
  TicketListResponse,
  TicketPriority,
  TicketStatus,
  User,
} from '../../types/api'
import type { AuditLogEntry } from './history'

export type AssignmentFilter = 'all' | 'mine' | 'unassigned'

export interface TicketFilters {
  group: TicketGroup
  status?: TicketStatus
  priority?: TicketPriority
  categoryId?: number
  assignment: AssignmentFilter
  search?: string
  page: number
}

export interface CreateTicketInput {
  subject: string
  description: string
  category_id: number
  priority: TicketPriority
}

export const TICKETS_PER_PAGE = 15

export function fetchTickets(filters: TicketFilters): Promise<TicketListResponse> {
  return api.get<TicketListResponse>('/tickets', {
    group: filters.group,
    status: filters.status,
    priority: filters.priority,
    category_id: filters.categoryId,
    mine: filters.assignment === 'mine' ? true : undefined,
    unassigned: filters.assignment === 'unassigned' ? true : undefined,
    search: filters.search,
    page: filters.page,
    per_page: TICKETS_PER_PAGE,
  })
}

export async function fetchTicket(id: number): Promise<Ticket> {
  const response = await api.get<{ data: Ticket }>(`/tickets/${id}`)

  return response.data
}

export async function createTicket(input: CreateTicketInput): Promise<Ticket> {
  const response = await api.post<{ data: Ticket }>('/tickets', input)

  return response.data
}

export async function claimTicket(id: number): Promise<Ticket> {
  const response = await api.post<{ data: Ticket }>(`/tickets/${id}/claim`)

  return response.data
}

export async function assignTicket(id: number, assigneeId: number): Promise<Ticket> {
  const response = await api.post<{ data: Ticket }>(`/tickets/${id}/assign`, {
    assignee_id: assigneeId,
  })

  return response.data
}

export async function transitionTicket(id: number, status: TicketStatus): Promise<Ticket> {
  const response = await api.post<{ data: Ticket }>(`/tickets/${id}/transition`, { status })

  return response.data
}

export async function fetchHistory(ticketId: number): Promise<AuditLogEntry[]> {
  const response = await api.get<{ data: AuditLogEntry[] }>(`/tickets/${ticketId}/history`)

  return response.data
}

export async function fetchComments(ticketId: number): Promise<TicketComment[]> {
  const response = await api.get<{ data: TicketComment[] }>(`/tickets/${ticketId}/comments`)

  return response.data
}

export async function addComment(
  ticketId: number,
  input: { body: string; isInternal: boolean },
): Promise<TicketComment> {
  const response = await api.post<{ data: TicketComment }>(`/tickets/${ticketId}/comments`, {
    body: input.body,
    is_internal: input.isInternal,
  })

  return response.data
}

export async function fetchCategories(): Promise<Category[]> {
  const response = await api.get<{ data: Category[] }>('/categories')

  return response.data
}

// Agent dan admin aktif yang bisa jadi penanggung jawab. API hanya mengizinkan staff.
export async function fetchAssignableUsers(): Promise<User[]> {
  const response = await api.get<{ data: User[] }>('/agents')

  return response.data
}