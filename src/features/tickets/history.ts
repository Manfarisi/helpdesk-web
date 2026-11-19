import { priorityLabel, statusLabel } from '../../lib/labels'
import type { TicketPriority, TicketStatus } from '../../types/api'

export interface AuditLogEntry {
  id: number
  action: string
  // null = dilakukan sistem (scheduler), bukan user.
  actor: { id: number; name: string } | null
  target: { type: string; id: number }
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  created_at: string
}

export type HistoryTone = 'normal' | 'system' | 'warning' | 'danger'

export interface HistoryItem {
  actor: string
  text: string
  tone: HistoryTone
}

type Values = Record<string, unknown> | null

function readString(values: Values, key: string): string | null {
  const value = values?.[key]

  return typeof value === 'string' ? value : null
}

function readNumber(values: Values, key: string): number | null {
  const value = values?.[key]

  return typeof value === 'number' ? value : null
}

function readBoolean(values: Values, key: string): boolean {
  return values?.[key] === true
}

function statusName(value: string | null): string {
  if (value === null) return '—'

  return Object.keys(statusLabel).includes(value) ? statusLabel[value as TicketStatus] : value
}

function priorityName(value: string | null): string | null {
  if (value === null) return null

  return Object.keys(priorityLabel).includes(value) ? priorityLabel[value as TicketPriority] : value
}

/**
 * Terjemahkan satu baris audit log jadi kalimat yang enak dibaca.
 * `resolveUser` mengubah id user (mis. assignee) jadi nama.
 */
export function describeEntry(
  entry: AuditLogEntry,
  resolveUser: (id: number) => string,
): HistoryItem {
  const actor = entry.actor?.name ?? 'Sistem'

  switch (entry.action) {
    case 'ticket.created': {
      const priority = priorityName(readString(entry.new_values, 'priority'))

      return {
        actor,
        text: priority === null ? 'membuat tiket' : `membuat tiket dengan prioritas ${priority}`,
        tone: 'normal',
      }
    }

    case 'ticket.assigned': {
      const newId = readNumber(entry.new_values, 'assignee_id')
      const oldId = readNumber(entry.old_values, 'assignee_id')

      if (newId === null) {
        return { actor, text: 'mengubah penanggung jawab tiket', tone: 'normal' }
      }

      if (entry.actor?.id === newId) {
        return { actor, text: 'mengambil tiket (claim)', tone: 'normal' }
      }

      if (oldId === null) {
        return { actor, text: `meng-assign tiket ke ${resolveUser(newId)}`, tone: 'normal' }
      }

      return {
        actor,
        text: `mengalihkan tiket dari ${resolveUser(oldId)} ke ${resolveUser(newId)}`,
        tone: 'normal',
      }
    }

    case 'ticket.status_changed':
      return {
        actor,
        text: `mengubah status dari ${statusName(readString(entry.old_values, 'status'))} menjadi ${statusName(readString(entry.new_values, 'status'))}`,
        tone: 'normal',
      }

    case 'ticket.commented':
      return {
        actor,
        text: readBoolean(entry.new_values, 'is_internal')
          ? 'menulis catatan internal'
          : 'menulis balasan',
        tone: 'normal',
      }

    case 'ticket.sla_warning':
      return {
        actor,
        text: 'menandai peringatan SLA: waktu penyelesaian hampir habis',
        tone: 'warning',
      }

    case 'ticket.sla_breached':
      return {
        actor,
        text: 'menandai SLA terlewat: batas waktu penyelesaian sudah lewat',
        tone: 'danger',
      }

    default:
      return { actor, text: entry.action, tone: entry.actor === null ? 'system' : 'normal' }
  }
}