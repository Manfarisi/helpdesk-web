import { formatDateTime } from '../../lib/format'
import { priorityLabel, roleLabel, statusLabel } from '../../lib/labels'
import type { AuditLogEntry } from '../tickets/history'

// Kode aksi dari backend dan terjemahannya. Urutannya dipakai di dropdown filter.
export const actionLabels: Record<string, string> = {
  'ticket.created': 'Tiket dibuat',
  'ticket.assigned': 'Tiket di-assign',
  'ticket.status_changed': 'Status tiket berubah',
  'ticket.commented': 'Komentar ditambahkan',
  'ticket.sla_warning': 'Peringatan SLA',
  'ticket.sla_breached': 'SLA terlewat',
  'kb_article.created': 'Artikel dibuat',
  'kb_article.updated': 'Artikel diubah',
  'kb_article.published': 'Artikel dipublikasikan',
  'kb_article.unpublished': 'Artikel ditarik ke draft',
  'kb_article.deleted': 'Artikel dihapus',
  'category.created': 'Kategori dibuat',
  'category.updated': 'Kategori diubah',
  'category.deleted': 'Kategori dihapus',
  'sla_policy.updated': 'Target SLA diubah',
  'user.created': 'Pengguna dibuat',
  'user.updated': 'Pengguna diubah',
}

export const targetTypeLabels: Record<string, string> = {
  ticket: 'Tiket',
  kb_article: 'Artikel KB',
  user: 'Pengguna',
  category: 'Kategori',
  sla_policy: 'Target SLA',
}

const fieldLabels: Record<string, string> = {
  number: 'Nomor',
  priority: 'Prioritas',
  category_id: 'Kategori',
  status: 'Status',
  assignee_id: 'Penanggung jawab',
  escalation_level: 'Level eskalasi',
  sla_breached_at: 'SLA terlewat pada',
  comment_id: 'Komentar',
  is_internal: 'Catatan internal',
  title: 'Judul',
  changed_fields: 'Kolom diubah',
  name: 'Nama',
  email: 'Email',
  role: 'Peran',
  is_active: 'Aktif',
  password_changed: 'Password diganti',
  first_response_minutes: 'Target respons (menit)',
  resolution_minutes: 'Target selesai (menit)',
  description: 'Deskripsi',
  slug: 'Slug',
}

const kbStatusLabels: Record<string, string> = {
  draft: 'Draft',
  published: 'Dipublikasikan',
}

const escalationLabels = ['Normal', 'Peringatan', 'Terlewat']

function find(map: Record<string, string>, key: string): string | undefined {
  return Object.keys(map).includes(key) ? map[key] : undefined
}

function describeValue(key: string, value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'boolean') return value ? 'Ya' : 'Tidak'

  if (Array.isArray(value)) {
    return value.map((item) => find(fieldLabels, String(item)) ?? String(item)).join(', ')
  }

  if (typeof value === 'string') {
    if (key === 'status') return find(statusLabel, value) ?? find(kbStatusLabels, value) ?? value
    if (key === 'priority') return find(priorityLabel, value) ?? value
    if (key === 'role') return find(roleLabel, value) ?? value

    if (key.endsWith('_at') && !Number.isNaN(Date.parse(value))) return formatDateTime(value)

    return value
  }

  if (typeof value === 'number') {
    if (key === 'escalation_level') return escalationLabels[value] ?? String(value)
    if (key.endsWith('_id')) return `#${value}`

    return String(value)
  }

  return JSON.stringify(value)
}

/**
 * Ringkasan perubahan satu baris audit log, satu kalimat pendek per kolom
 * (mis. "Status: Baru → Terbuka"). Nilai lama nggak ada untuk kejadian pembuatan,
 * nilai baru nggak ada untuk penghapusan.
 */
export function describeChanges(entry: AuditLogEntry): string[] {
  const oldValues = entry.old_values ?? {}
  const newValues = entry.new_values ?? {}
  const keys = [...new Set([...Object.keys(oldValues), ...Object.keys(newValues)])]

  return keys.map((key) => {
    const label = find(fieldLabels, key) ?? key
    const hasOld = key in oldValues
    const hasNew = key in newValues

    if (hasOld && hasNew) {
      return `${label}: ${describeValue(key, oldValues[key])} → ${describeValue(key, newValues[key])}`
    }

    return `${label}: ${describeValue(key, hasNew ? newValues[key] : oldValues[key])}`
  })
}