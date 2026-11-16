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