import { ApiError } from './api'

/**
 * Pesan error yang ramah untuk halaman yang gagal memuat data.
 */
export function describeError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 403) return 'Kamu nggak punya akses ke halaman ini.'
    if (error.status === 404) return 'Data yang kamu cari nggak ditemukan.'

    return error.message
  }

  return 'Terjadi kesalahan. Coba lagi.'
}

/**
 * Pesan error untuk tindakan (claim, assign, ubah status). Error 422 membawa pesan
 * aturan bisnis dari API yang sudah berbahasa Indonesia, jadi ditampilkan apa adanya.
 */
export function describeActionError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 403) return 'Kamu nggak punya izin untuk tindakan ini.'
    if (error.status === 404) return 'Tiket nggak ditemukan. Mungkin sudah dihapus.'

    return error.message
  }

  return 'Terjadi kesalahan. Coba lagi.'
}