import { Link } from 'react-router-dom'
import { Card, PageHeader } from '../components/ui'

export function NotFoundPage() {
  return (
    <>
      <PageHeader title="Halaman tidak ditemukan" />
      <div className="p-6">
        <Card>
          <p className="text-sm text-muted">Alamat yang kamu buka nggak ada.</p>
          <Link to="/tickets" className="mt-3 inline-block text-sm font-medium text-brand hover:underline">
            Kembali ke daftar tiket
          </Link>
        </Card>
      </div>
    </>
  )
}