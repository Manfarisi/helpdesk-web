import { ButtonLink, PageHeader } from '../components/ui'

export function NotFoundPage() {
  return (
    <>
      <PageHeader title="Halaman tidak ditemukan" />
      <div className="flex flex-col items-center px-6 py-16 text-center">
        <p className="text-6xl font-bold text-brand">404</p>
        <h2 className="mt-3 text-lg font-semibold">Halaman ini nggak ada</h2>
        <p className="mt-1 max-w-sm text-sm text-muted">
          Alamatnya mungkin salah ketik, atau halamannya sudah dipindahkan.
        </p>
        <ButtonLink to="/tickets" className="mt-6">
          Kembali ke daftar tiket
        </ButtonLink>
      </div>
    </>
  )
}