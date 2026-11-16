import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { InlineError, Spinner } from '../components/feedback'
import { PageHeader } from '../components/ui'
import { api } from '../lib/api'
import { formatDateTime } from '../lib/format'
import {
  priorityLabel,
  priorityRank,
  priorityText,
  slaToneClass,
  statusDot,
  statusLabel,
} from '../lib/labels'
import { describeSla } from '../lib/sla'
import { useNow } from '../lib/useNow'
import type { Paginated, Ticket, TicketStatus } from '../types/api'

type Tab = 'open' | 'completed'

const PAGE_SIZE = 100
const openStatuses: TicketStatus[] = ['new', 'open', 'in_progress', 'pending']
const columns = [
  'Nomor',
  'Kategori',
  'Ringkasan',
  'Prioritas',
  'Status',
  'Penanggung jawab',
  'SLA',
  'Dibuat',
]

export function TicketsPage() {
  const [tab, setTab] = useState<Tab>('open')
  const now = useNow()

  const query = useQuery({
    queryKey: ['tickets', 'list', { perPage: PAGE_SIZE }],
    queryFn: () => api.get<Paginated<Ticket>>('/tickets', { per_page: PAGE_SIZE }),
  })

  const tickets = query.data?.data ?? []
  const total = query.data?.meta.total ?? 0
  const openTickets = tickets.filter((ticket) => openStatuses.includes(ticket.status))
  const completedTickets = tickets.filter((ticket) => !openStatuses.includes(ticket.status))
  const visible = tab === 'open' ? openTickets : completedTickets

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'open', label: 'Aktif', count: openTickets.length },
    { key: 'completed', label: 'Selesai', count: completedTickets.length },
  ]

  return (
    <>
      <PageHeader title="Service Desk — Tiket" />

      <div role="tablist" className="flex gap-1 border-b border-line bg-canvas px-6 pt-3">
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={tab === item.key}
            onClick={() => setTab(item.key)}
            className={`-mb-px flex items-center gap-2 rounded-t border px-4 py-2 text-sm ${
              tab === item.key
                ? 'border-line border-b-white bg-white font-semibold text-ink'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            {item.label}
            <span className="rounded bg-slate-200 px-1.5 text-xs font-medium text-slate-600">
              {item.count}
            </span>
          </button>
        ))}
      </div>

      {query.isPending && (
        <div className="flex justify-center bg-white py-16">
          <Spinner />
        </div>
      )}

      {query.isError && (
        <div className="p-6">
          <InlineError message={query.error.message} />
        </div>
      )}

      {query.data !== undefined && visible.length === 0 && (
        <p className="bg-white p-6 text-center text-sm text-muted">Tidak ada tiket di tab ini.</p>
      )}

      {query.data !== undefined && visible.length > 0 && (
        <div className="overflow-x-auto bg-white">
          <table className="w-full min-w-[60rem] text-left text-sm">
            <thead>
              <tr className="border-b border-line">
                {columns.map((column) => (
                  <th key={column} scope="col" className="px-4 py-3 font-semibold">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((ticket) => {
                const sla = describeSla(ticket, now)

                return (
                  <tr
                    key={ticket.id}
                    className="border-b border-line last:border-b-0 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 font-mono text-[13px] whitespace-nowrap text-brand">
                      {ticket.number}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{ticket.category.name}</td>
                    <td className="px-4 py-3">
                      <p className="max-w-md truncate" title={ticket.subject}>
                        {ticket.subject}
                      </p>
                      <p className="text-xs text-muted">Pemohon: {ticket.requester.name}</p>
                    </td>
                    <td
                      className={`px-4 py-3 whitespace-nowrap ${priorityText[ticket.priority]}`}
                    >
                      P{priorityRank[ticket.priority]} {priorityLabel[ticket.priority]}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-2">
                        <span className={`size-2 rounded-full ${statusDot[ticket.status]}`} />
                        {statusLabel[ticket.status]}
                      </span>
                    </td>
                    <td
                      className={`px-4 py-3 whitespace-nowrap ${
                        ticket.assignee === null ? 'text-muted' : ''
                      }`}
                    >
                      {ticket.assignee?.name ?? 'Belum di-assign'}
                    </td>
                    <td
                      className={`border-l-2 px-4 py-3 whitespace-nowrap ${
                        sla.flagged ? 'border-red-600' : 'border-transparent'
                      } ${slaToneClass[sla.tone]}`}
                    >
                      {sla.text}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted">
                      {formatDateTime(ticket.created_at)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {query.data !== undefined && total > tickets.length && (
        <p className="px-6 py-3 text-xs text-muted">
          Menampilkan {tickets.length} tiket terbaru dari {total}. Filter lengkap menyusul.
        </p>
      )}
    </>
  )
}