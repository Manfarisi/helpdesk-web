import { InlineError, Spinner } from '../../components/feedback'
import { Card } from '../../components/ui'
import { describeError } from '../../lib/error'
import { formatDateTime } from '../../lib/format'
import type { Ticket } from '../../types/api'
import { describeEntry, type HistoryTone } from './history'
import { useAssignableUsers, useTicketHistory } from './hooks'

const dotClass: Record<HistoryTone, string> = {
  normal: 'bg-brand',
  system: 'bg-slate-400',
  warning: 'bg-amber-500',
  danger: 'bg-red-600',
}

export function HistoryCard({ ticket }: { ticket: Ticket }) {
  const history = useTicketHistory(ticket.id, true)
  const agents = useAssignableUsers(true)

  // Audit log menyimpan id penanggung jawab, bukan namanya. Nama dikumpulkan dari
  // beberapa sumber, dan id yang nggak dikenal (mis. akun yang sudah nonaktif) tampil
  // sebagai "Pengguna #id".
  const names = new Map<number, string>()

  for (const person of agents.data ?? []) names.set(person.id, person.name)

  names.set(ticket.requester.id, ticket.requester.name)

  if (ticket.assignee !== null) names.set(ticket.assignee.id, ticket.assignee.name)

  for (const entry of history.data ?? []) {
    if (entry.actor !== null) names.set(entry.actor.id, entry.actor.name)
  }

  const resolveUser = (id: number) => names.get(id) ?? `Pengguna #${id}`

  // API mengirim dari yang paling lama, di sini dibalik supaya yang terbaru di atas.
  const entries = [...(history.data ?? [])].reverse()

  return (
    <Card title={history.data === undefined ? 'Riwayat tiket' : `Riwayat tiket (${entries.length})`}>
      {history.isPending && (
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      )}

      {history.isError && <InlineError message={describeError(history.error)} />}

      {history.data !== undefined && entries.length === 0 && (
        <p className="text-sm text-muted">Belum ada riwayat.</p>
      )}

      {entries.length > 0 && (
        <ol className="relative ml-2 space-y-4 border-l border-line pl-5">
          {entries.map((entry) => {
            const item = describeEntry(entry, resolveUser)

            return (
              <li key={entry.id} className="relative">
                <span
                  aria-hidden="true"
                  className={`absolute top-1.5 -left-[1.6rem] size-2.5 rounded-full ring-4 ring-white ${dotClass[item.tone]}`}
                />
                <p className="text-sm [overflow-wrap:anywhere]">
                  <span className="font-semibold">{item.actor}</span> {item.text}
                </p>
                <p className="text-xs text-muted">{formatDateTime(entry.created_at)}</p>
              </li>
            )
          })}
        </ol>
      )}
    </Card>
  )
}