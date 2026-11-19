import { isRouteErrorResponse, useRouteError } from 'react-router-dom'
import { Card } from '../components/ui'
import { buttonClass } from '../lib/styles'

/**
 * Ditampilkan kalau ada halaman yang gagal dirender (bug di kode), supaya
 * pengguna nggak melihat layar putih kosong.
 */
export function ErrorPage() {
  const error = useRouteError()
  const notFound = isRouteErrorResponse(error) && error.status === 404
  const detail = error instanceof Error ? error.message : null

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <p className="text-5xl font-bold text-brand">{notFound ? '404' : 'Oops'}</p>
        <h1 className="mt-3 text-lg font-semibold">
          {notFound ? 'Halaman nggak ditemukan' : 'Terjadi kesalahan di aplikasi'}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {notFound
            ? 'Alamat yang kamu buka nggak ada.'
            : 'Ada yang nggak beres saat menampilkan halaman ini. Coba muat ulang. Kalau tetap sama, kembali ke beranda.'}
        </p>

        {import.meta.env.DEV && detail !== null && (
          <pre className="mt-3 overflow-x-auto rounded bg-slate-100 p-3 text-left text-xs">
            {detail}
          </pre>
        )}

        <div className="mt-5 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className={buttonClass('primary')}
          >
            Muat ulang
          </button>
          <a href="/" className={buttonClass('secondary')}>
            Ke beranda
          </a>
        </div>
      </Card>
    </div>
  )
}