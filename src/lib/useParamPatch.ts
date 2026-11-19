import { useSearchParams } from 'react-router-dom'

type ParamChanges = Record<string, string | undefined>

/**
 * Filter disimpan di URL (?q=...&category=...), jadi bisa di-refresh, dibagikan,
 * dan tombol Back di browser tetap bekerja. Nilai kosong menghapus parameternya.
 * Setiap perubahan filter mengembalikan ke halaman 1, kecuali yang diubah halamannya.
 */
export function useParamPatch(): [URLSearchParams, (changes: ParamChanges) => void] {
  const [params, setParams] = useSearchParams()

  function patch(changes: ParamChanges) {
    const next = new URLSearchParams(params)

    for (const [key, value] of Object.entries(changes)) {
      if (value === undefined || value === '') {
        next.delete(key)
      } else {
        next.set(key, value)
      }
    }

    const changesPage = 'page' in changes

    if (!changesPage) next.delete('page')

    // Pindah halaman dicatat di riwayat browser, perubahan filter menimpa.
    setParams(next, { replace: !changesPage })
  }

  return [params, patch]
}