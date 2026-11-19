import { api } from '../../lib/api'
import type { TicketPriority, TicketStatus, UserRole } from '../../types/api'

export interface DashboardData {
  period: { from: string; to: string }
  // Kondisi saat ini, nggak terpengaruh rentang tanggal.
  snapshot: {
    by_status: Record<TicketStatus, number>
    by_priority: Record<TicketPriority, number>
    active: number
    unassigned: number
    sla_warning: number
    sla_breached: number
  }
  // Dihitung hanya untuk rentang tanggal yang dipilih.
  period_metrics: {
    created: number
    resolved: number
    resolved_within_sla: number
    sla_compliance_percent: number | null
    avg_first_response_minutes: number | null
    avg_resolution_minutes: number | null
  }
  agents: {
    id: number
    name: string
    role: UserRole
    active_tickets: number
    resolved_in_period: number
  }[]
}

export const rangeOptions = [7, 30, 90] as const

export const DEFAULT_RANGE_DAYS = 30

/**
 * Rentang tanggal "N hari terakhir termasuk hari ini". Dihitung dalam UTC supaya
 * sama dengan batas hari yang dipakai API.
 */
export function periodFor(days: number, now: number): { from: string; to: string } {
  return {
    from: new Date(now - (days - 1) * 86_400_000).toISOString().slice(0, 10),
    to: new Date(now).toISOString().slice(0, 10),
  }
}

export async function fetchDashboard(from: string, to: string): Promise<DashboardData> {
  const response = await api.get<{ data: DashboardData }>('/dashboard', { from, to })

  return response.data
}