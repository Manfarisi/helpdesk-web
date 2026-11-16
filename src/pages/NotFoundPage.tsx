import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold">Halaman tidak ditemukan</h1>
      <p className="mt-2 text-sm text-slate-600">Alamat yang kamu buka nggak ada.</p>
      <Link to="/tickets" className="mt-4 inline-block text-sm font-medium text-slate-900 underline">
        Kembali ke daftar tiket
      </Link>
    </div>
  )
}