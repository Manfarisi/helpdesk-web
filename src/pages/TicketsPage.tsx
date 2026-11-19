import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Plus, Search, X } from 'lucide-react'
import { InlineError, Spinner } from '../components/feedback'
import { Pagination } from '../components/Pagination'
import { PriorityLabel, StatusLabel } from '../components/ticket-parts'
import { Button, ButtonLink, PageHeader } from '../components/ui'
import { useAuth } from '../features/auth/useAuth'
import { useCategories, useTicketList } from '../features/tickets/hooks'
import { TICKETS_PER_PAGE, type TicketFilters } from '../features/tickets/tickets-api'
import { formatDateTime } from '../lib/format'
import { priorityLabel, slaToneClass, statusLabel } from '../lib/labels'
import { describeSla } from '../lib/sla'
import { controlClass } from '../lib/styles'
import { useNow } from '../lib/useNow'
import type { TicketGroup, TicketPriority, TicketStatus } from '../types/api'

const tabs: { key: TicketGroup; label: string }[] = [
  { key: 'active', label: 'Aktif' },
  { key: 'finished', label: 'Selesai' },
]

const statusOptions: Record<TicketGroup, TicketStatus[]> = {
  active: ['new', 'open', 'in_progress', 'pending'],
  finished: ['resolved', 'closed', 'cancelled'],
}

const priorityOptions: TicketPriority[] = ['urgent', 'high', 'medium', 'low']

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

/**
 * Filter disimpan di URL (?tab=...&priority=...), jadi bisa di-refresh, dibagikan,
 * dan tombol Back di browser tetap bekerja. Nilai yang nggak valid diabaikan.
 */
function parseFilters(params: URLSearchParams): TicketFilters {
  const group: TicketGroup = params.get('tab') === 'finished' ? 'finished' : 'active'
  const status = params.get('status')
  const priority = params.get('priority')
  const category = Number(params.get('category'))
  const assignment = params.get('assignment')
  const page = Number(params.get('page'))
  const search = params.get('q')?.trim()

  return {
    group,
    status: statusOptions[group].find((option) => option === status),
    priority: priorityOptions.find((option) => option === priority),
    categoryId: Number.isInteger(category) && category > 0 ? category : undefined,
    assignment: assignment === 'mine' || assignment === 'unassigned' ? assignment : 'all',
    search: search === undefined || search === '' ? undefined : search,
    page: Number.isInteger(page) && page > 0 ? page : 1,
  }
}

export function TicketsPage() {
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const filters = parseFilters(params)
  const [searchInput, setSearchInput] = useState(filters.search ?? '')
  const now = useNow()

  const query = useTicketList(filters)
  const categoriesQuery = useCategories()

  const isStaff = user !== null && user.role !== 'requester'
  const tickets = query.data?.data ?? []
  const counts = query.data?.counts
  const meta = query.data?.meta

  const hasActiveFilters =
    filters.status !== undefined ||
    filters.priority !== undefined ||
    filters.categoryId !== undefined ||
    filters.assignment !== 'all' ||
    filters.search !== undefined

  /**
   * Ubah satu atau beberapa parameter URL. Nilai kosong menghapus parameternya.
   * Setiap perubahan filter mengembalikan ke halaman 1, kecuali yang diubah halamannya.
   */
  function patch(changes: Record<string, string | undefined>) {
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

    setParams(next, { replace: !changesPage })
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    patch({ q: searchInput.trim() })
  }

  function resetFilters() {
    setSearchInput('')
    patch({
      status: undefined,
      priority: undefined,
      category: undefined,
      assignment: undefined,
      q: undefined,
    })
  }

  return (
    <>
      <PageHeader
        title="Service Desk — Tiket"
        actions={
          <ButtonLink to="/tickets/new">
            <Plus className="size-4" aria-hidden="true" />
            Buat Tiket
          </ButtonLink>
        }
      />

      <div role="tablist" className="flex gap-1 border-b border-line bg-canvas px-6 pt-3">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={filters.group === tab.key}
            onClick={() =>
              patch({ tab: tab.key === 'finished' ? 'finished' : undefined, status: undefined })
            }
            className={`-mb-px flex items-center gap-2 rounded-t border px-4 py-2 text-sm ${
              filters.group === tab.key
                ? 'border-line border-b-white bg-white font-semibold text-ink'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            {tab.label}
            {counts !== undefined && (
              <span className="rounded bg-slate-200 px-1.5 text-xs font-medium text-slate-600">
                {counts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-white px-6 py-3">
        <form onSubmit={submitSearch} className="flex w-full gap-2 sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              type="search"
              aria-label="Cari tiket"
              placeholder="Cari nomor atau ringkasan…"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              className={`${controlClass} pl-9`}
            />
          </div>
          <Button type="submit" variant="secondary">
            Cari
          </Button>
        </form>

        <select
          aria-label="Filter status"
          value={filters.status ?? ''}
          onChange={(event) => patch({ status: event.target.value })}
          className={`${controlClass} sm:w-auto`}
        >
          <option value="">Semua status</option>
          {statusOptions[filters.group].map((status) => (
            <option key={status} value={status}>
              {statusLabel[status]}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter prioritas"
          value={filters.priority ?? ''}
          onChange={(event) => patch({ priority: event.target.value })}
          className={`${controlClass} sm:w-auto`}
        >
          <option value="">Semua prioritas</option>
          {priorityOptions.map((priority) => (
            <option key={priority} value={priority}>
              {priorityLabel[priority]}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter kategori"
          value={filters.categoryId?.toString() ?? ''}
          onChange={(event) => patch({ category: event.target.value })}
          className={`${controlClass} sm:w-auto`}
        >
          <option value="">Semua kategori</option>
          {categoriesQuery.data?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        {isStaff && (
          <select
            aria-label="Filter penanggung jawab"
            value={filters.assignment === 'all' ? '' : filters.assignment}
            onChange={(event) => patch({ assignment: event.target.value })}
            className={`${controlClass} sm:w-auto`}
          >
            <option value="">Semua tiket</option>
            <option value="mine">Tiket saya</option>
            <option value="unassigned">Belum di-assign</option>
          </select>
        )}

        {hasActiveFilters && (
          <Button variant="secondary" onClick={resetFilters}>
            <X className="size-4" aria-hidden="true" />
            Reset
          </Button>
        )}
      </div>

      {query.isPending && (
        <div className="flex justify-center bg-white py-16">
          <Spinner />
        </div>
      )}

      {query.isError && query.data === undefined && (
        <div className="p-6">
          <InlineError message={query.error.message} />
        </div>
      )}

      {query.data !== undefined && tickets.length === 0 && (
        <div className="bg-white p-10 text-center">
          <p className="text-sm text-muted">
            {hasActiveFilters
              ? 'Tidak ada tiket yang cocok dengan filter.'
              : 'Belum ada tiket di tab ini.'}
          </p>
          {hasActiveFilters && (
            <Button variant="secondary" className="mt-3" onClick={resetFilters}>
              Reset filter
            </Button>
          )}
        </div>
      )}

      {query.data !== undefined && tickets.length > 0 && (
        <div
          className={`overflow-x-auto bg-white transition-opacity ${
            query.isPlaceholderData ? 'opacity-60' : ''
          }`}
        >
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
              {tickets.map((ticket) => {
                const sla = describeSla(ticket, now)

                return (
                  <tr
                    key={ticket.id}
                    className="border-b border-line last:border-b-0 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 font-mono text-[13px] whitespace-nowrap">
                      <Link to={`/tickets/${ticket.id}`} className="text-brand hover:underline">
                        {ticket.number}
                      </Link>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{ticket.category.name}</td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/tickets/${ticket.id}`}
                        title={ticket.subject}
                        className="block max-w-md truncate hover:text-brand hover:underline"
                      >
                        {ticket.subject}
                      </Link>
                      <p className="text-xs text-muted">Pemohon: {ticket.requester.name}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <PriorityLabel priority={ticket.priority} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusLabel status={ticket.status} />
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

      {meta !== undefined && (
        <Pagination
          page={meta.current_page}
          lastPage={meta.last_page}
          total={meta.total}
          perPage={TICKETS_PER_PAGE}
          unit="tiket"
          onPageChange={(page) => patch({ page: page === 1 ? undefined : String(page) })}
        />
      )}
    </>
  )
}