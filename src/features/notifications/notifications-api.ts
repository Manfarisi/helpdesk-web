import { api } from '../../lib/api'
import type { Paginated } from '../../types/api'

export interface NotificationItem {
  id: string
  // ticket.assigned, ticket.commented, ticket.sla_warning, atau ticket.sla_breached.
  type: string | null
  message: string | null
  ticket_id: number | null
  ticket_number: string | null
  is_read: boolean
  read_at: string | null
  created_at: string
}

export interface NotificationListResponse extends Paginated<NotificationItem> {
  unread_count: number
}

export const NOTIFICATION_PREVIEW_SIZE = 10

export function fetchNotifications(): Promise<NotificationListResponse> {
  return api.get<NotificationListResponse>('/notifications', {
    per_page: NOTIFICATION_PREVIEW_SIZE,
  })
}

export async function markNotificationRead(id: string): Promise<void> {
  await api.post<{ data: NotificationItem }>(`/notifications/${id}/read`)
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.post<void>('/notifications/read-all')
}