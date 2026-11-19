import { api } from '../../lib/api'
import type { Category, Paginated, TicketPriority, UserRole } from '../../types/api'
import type { AuditLogEntry } from '../tickets/history'

// ---- pengguna ----

export interface AdminUser {
  id: number
  name: string
  email: string
  role: UserRole
  is_active: boolean
  created_at: string
}

export interface UserFilters {
  search?: string
  role?: UserRole
  isActive?: boolean
  page: number
}

export interface UserInput {
  name: string
  email: string
  role: UserRole
  // Wajib saat membuat. Saat mengedit, hanya dikirim kalau mau diganti.
  password?: string
  // Hanya dikirim saat mengedit.
  is_active?: boolean
}

export const USERS_PER_PAGE = 15

export function fetchUsers(filters: UserFilters): Promise<Paginated<AdminUser>> {
  return api.get<Paginated<AdminUser>>('/users', {
    search: filters.search,
    role: filters.role,
    is_active: filters.isActive,
    page: filters.page,
    per_page: USERS_PER_PAGE,
  })
}

// Untuk dropdown filter pelaku di audit log (100 pengguna teratas urut nama).
export async function fetchUserOptions(): Promise<AdminUser[]> {
  const response = await api.get<Paginated<AdminUser>>('/users', { per_page: 100 })

  return response.data
}

export async function createUser(input: UserInput): Promise<AdminUser> {
  const response = await api.post<{ data: AdminUser }>('/users', input)

  return response.data
}

export async function updateUser(id: number, input: UserInput): Promise<AdminUser> {
  const response = await api.patch<{ data: AdminUser }>(`/users/${id}`, input)

  return response.data
}

// ---- kategori ----

export interface CategoryInput {
  name: string
  description: string | null
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  const response = await api.post<{ data: Category }>('/categories', input)

  return response.data
}

export async function updateCategory(id: number, input: CategoryInput): Promise<Category> {
  const response = await api.patch<{ data: Category }>(`/categories/${id}`, input)

  return response.data
}

export async function deleteCategory(id: number): Promise<void> {
  await api.delete<void>(`/categories/${id}`)
}

// ---- target SLA ----

export interface SlaPolicy {
  id: number
  priority: TicketPriority
  first_response_minutes: number
  resolution_minutes: number
  updated_at: string
}

export interface SlaPolicyInput {
  first_response_minutes: number
  resolution_minutes: number
}

export async function fetchSlaPolicies(): Promise<SlaPolicy[]> {
  const response = await api.get<{ data: SlaPolicy[] }>('/sla-policies')

  return response.data
}

export async function updateSlaPolicy(id: number, input: SlaPolicyInput): Promise<SlaPolicy> {
  const response = await api.patch<{ data: SlaPolicy }>(`/sla-policies/${id}`, input)

  return response.data
}

// ---- audit log ----

export interface AuditFilters {
  action?: string
  actorId?: number
  targetType?: string
  from?: string
  to?: string
  page: number
}

export const AUDIT_PER_PAGE = 20

export function fetchAuditLogs(filters: AuditFilters): Promise<Paginated<AuditLogEntry>> {
  return api.get<Paginated<AuditLogEntry>>('/audit-logs', {
    action: filters.action,
    actor_id: filters.actorId,
    target_type: filters.targetType,
    from: filters.from,
    to: filters.to,
    page: filters.page,
    per_page: AUDIT_PER_PAGE,
  })
}