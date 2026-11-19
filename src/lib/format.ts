const dateTimeFormat = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

// Tanggal tanpa jam (YYYY-MM-DD dari API) selalu dibaca sebagai UTC, supaya
// harinya nggak bergeser oleh zona waktu browser.
const dateFormat = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

const numberFormat = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 })

/**
 * API mengirim waktu dalam UTC (ISO 8601). Di sini otomatis tampil
 * dalam zona waktu browser (WIB untuk pengguna di Jakarta).
 */
export function formatDateTime(iso: string): string {
  return dateTimeFormat.format(new Date(iso))
}

export function formatDate(isoDate: string): string {
  return dateFormat.format(new Date(`${isoDate}T00:00:00Z`))
}

export function formatNumber(value: number): string {
  return numberFormat.format(value)
}

/**
 * Waktu relatif ("5 menit lalu"). `now` dalam milidetik, diambil dari useNow()
 * supaya tampilannya ikut diperbarui tanpa refresh.
 */
export function formatRelative(iso: string, now: number): string {
  const minutes = Math.floor((now - Date.parse(iso)) / 60_000)

  if (minutes < 1) return 'baru saja'
  if (minutes < 60) return `${minutes} menit lalu`

  const hours = Math.floor(minutes / 60)

  if (hours < 24) return `${hours} jam lalu`

  const days = Math.floor(hours / 24)

  if (days < 7) return `${days} hari lalu`

  return formatDateTime(iso)
}

/**
 * Durasi dari menit: "45 mnt", "1,5 jam", atau "2,3 hari". null jadi "—".
 */
export function formatDuration(minutes: number | null): string {
  if (minutes === null) return '—'
  if (minutes < 60) return `${numberFormat.format(minutes)} mnt`
  if (minutes < 1440) return `${numberFormat.format(minutes / 60)} jam`

  return `${numberFormat.format(minutes / 1440)} hari`
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