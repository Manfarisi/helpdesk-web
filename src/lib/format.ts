const dateTimeFormat = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

/**
 * API mengirim waktu dalam UTC (ISO 8601). Di sini otomatis tampil
 * dalam zona waktu browser (WIB untuk pengguna di Jakarta).
 */
export function formatDateTime(iso: string): string {
  return dateTimeFormat.format(new Date(iso))
}

/**
 * Inisial untuk avatar: huruf pertama nama depan dan nama belakang.
 */
export function initials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter((part) => part !== '')

  const first = parts[0]?.charAt(0) ?? '?'
  const last = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? '') : ''

  return `${first}${last}`.toUpperCase()
}