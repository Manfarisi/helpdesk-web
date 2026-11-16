import { useQuery } from '@tanstack/react-query'
import { InlineError, Spinner } from '../components/feedback'
import { api } from '../lib/api'
import { priorityLabel, priorityStyle, statusLabel, statusStyle } from '../lib/labels'
import type { Paginated, Ticket } from '../types/api'

export function TicketsPage() {
  const query = useQuery({
    queryKey: ['tickets', { perPage: 10 }],
    queryFn: () => api.get<Paginated<Ticket>>('/tickets', { per_page: 10 }),
  })

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h1 className="text-xl font-semibold">Tiket</h1>
        {query.data !== undefined && (
          <p className="text-sm text-slate-500">{query.data.meta.total} tiket</p>
        )}
      </div>

      <div className="mt-4">
        {query.isPending && (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        )}

        {query.isError && <InlineError message={query.error.message} />}

        {query.data !== undefined && query.data.data.length === 0 && (
          <p className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
            Belum ada tiket.
          </p>
        )}

        {query.data !== undefined && query.data.data.length > 0 && (
          <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
            {query.data.data.map((ticket) => (
              <li
                key={ticket.id}
                className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-500">{ticket.number}</p>
                  <p className="truncate font-medium">{ticket.subject}</p>
                  <p className="text-sm text-slate-500">
                    {ticket.category.name} ·{' '}
                    {ticket.assignee !== null ? ticket.assignee.name : 'Belum di-assign'}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {ticket.sla.is_breached && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                      SLA terlewat
                    </span>
                  )}
                  {!ticket.sla.is_breached && ticket.sla.is_warning && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                      SLA hampir habis
                    </span>
                  )}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityStyle[ticket.priority]}`}
                  >
                    {priorityLabel[ticket.priority]}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle[ticket.status]}`}
                  >
                    {statusLabel[ticket.status]}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}