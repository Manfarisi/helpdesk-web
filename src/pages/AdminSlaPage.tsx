import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { InlineError, Spinner } from '../components/feedback'
import { PriorityLabel } from '../components/ticket-parts'
import { Button, Card, PageHeader } from '../components/ui'
import type { SlaPolicy } from '../features/admin/admin-api'
import { useSlaPolicies } from '../features/admin/hooks'
import { SlaFormModal } from '../features/admin/SlaFormModal'
import { describeError } from '../lib/error'
import { formatDateTime, formatMinutes } from '../lib/format'

export function AdminSlaPage() {
  const query = useSlaPolicies()
  const [editing, setEditing] = useState<SlaPolicy | null>(null)

  const policies = query.data ?? []

  return (
    <>
      <PageHeader title="Target SLA" subtitle="Batas waktu respons dan penyelesaian per prioritas" />

      <div className="space-y-4 p-4 md:p-6">
        <Card>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
            <li>Jam SLA memakai jam kalender 24/7.</li>
            <li>Timer berhenti saat tiket berstatus Menunggu atau Selesai.</li>
            <li>Peringatan muncul saat 80% waktu penyelesaian terpakai, lalu SLA ditandai terlewat saat batasnya habis.</li>
            <li>Perubahan target hanya berlaku untuk tiket baru.</li>
          </ul>
        </Card>

        {query.isPending && (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        )}

        {query.isError && <InlineError message={describeError(query.error)} />}

        {policies.length > 0 && (
          <div className="overflow-x-auto rounded-md border border-line bg-white">
            <table className="w-full min-w-[42rem] text-left text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Prioritas
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Respons pertama
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Penyelesaian
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Terakhir diubah
                  </th>
                  <th scope="col" className="px-4 py-3">
                    <span className="sr-only">Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {policies.map((policy) => (
                  <tr key={policy.id} className="border-b border-line last:border-b-0">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <PriorityLabel priority={policy.priority} />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{formatMinutes(policy.first_response_minutes)}</p>
                      <p className="text-xs text-muted">{policy.first_response_minutes} menit</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{formatMinutes(policy.resolution_minutes)}</p>
                      <p className="text-xs text-muted">{policy.resolution_minutes} menit</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted">
                      {formatDateTime(policy.updated_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="secondary"
                        className="px-2 py-1 text-xs"
                        onClick={() => setEditing(policy)}
                      >
                        <Pencil className="size-3.5" aria-hidden="true" />
                        Ubah
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing !== null && (
        <SlaFormModal key={editing.id} policy={editing} onClose={() => setEditing(null)} />
      )}
    </>
  )
}