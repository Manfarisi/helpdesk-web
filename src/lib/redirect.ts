/**
 * Tujuan setelah login: halaman yang tadi dicoba dibuka (disimpan di location.state.from),
 * atau "/" kalau nggak ada. Hanya path internal yang diterima.
 */
export function redirectTarget(state: unknown): string {
  if (typeof state === 'object' && state !== null && 'from' in state) {
    const from = state.from

    if (
      typeof from === 'string' &&
      from.startsWith('/') &&
      !from.startsWith('//') &&
      from !== '/login'
    ) {
      return from
    }
  }

  return '/'
}