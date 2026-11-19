import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { InlineError, Spinner } from '../components/feedback'
import { Pagination } from '../components/Pagination'
import { Button, PageHeader } from '../components/ui'
import { AUDIT_PER_PAGE, type AuditFilters } from '../features/admin/admin-api'
import { actionLabels, describeChanges, targetTypeLabels } from '../features/admin/audit-format'
import { useAuditLogs, useUserOptions } from '../features/admin/hooks'
import type { AuditLogEntry } from '../features/tickets/history'
import { describeError } from '../lib/error'
import { formatDateTime } from '../lib/format'
import { controlClass } from '../lib/styles'
import { useParamPatch } from '../lib/useParamPatch'

const actionOptions = Object.keys(actionLabels)
const targetTypeOptions = Object.keys(targetTypeLabels)
const datePattern = /^\d{4}-\d{2}-\d{2}$/

const columns = ['Waktu', 'Pelaku', 'Aksi', 'Target', 'Perubahan']

function validDate(value: string | null): string | undefined {
  return value !== null && datePattern.test(value) ? value : undefined
}

/**
 * Nilai di URL yang nggak valid diabaikan.
 */
function parseFilters(params: URLSearchParams): AuditFilters {
  const action = params.get('action')
  const type = params.get('type')
  const actor = Number(params.get('actor'))
  const page = Number(params.get('page'))

  return {
    action: action !== null && actionOptions.includes(action) ? action : undefined,
    actorId: Number.isInteger(actor) && actor > 0 ? actor : undefined,
    targetType: type !== null && targetTypeOptions.includes(type) ? type : undefined,
    from: validDate(params.get('from')),
    to: validDate(params.get('to')),
    page: Number.isInteger(page) && page > 0 ? page : 1,
  }
}

function TargetCell({ entry }: { entry: AuditLogEntry }) {
  const label = targetTypeLabels[entry.target.type] ?? entry.target.type
  const text = `${label} #${entry.target.id}`

  if (entry.target.type === 'ticket') {
    return (
      <Link to={`/tickets/${entry.target.id}`} className="text-brand hover:underline">
        {text}
      </Link>
    )
  }

  return <span>{text}</span>
}

export function AdminAuditPage() {
  const [params, patch] = useParamPatch()
  const filters = parseFilters(params)

  const query = useAuditLogs(filters)
  const users = useUserOptions()

  const entries = query.data?.data ?? []
  const meta = query.data?.meta

  const hasActiveFilters =
    filters.action !== undefined ||
    filters.actorId !== undefined ||
    filters.targetType !== undefined ||
    filters.from !== undefined ||
    filters.to !== undefined

  function resetFilters() {
    patch({
      action: undefined,
      actor: undefined,
      type: undefined,
      from: undefined,
      to: undefined,
    })
  }

  return (
    <>
      <PageHeader title="Audit Log" subtitle="Catatan perubahan penting di seluruh sistem" />

      <div className="flex flex-wrap items-end gap-2 border-b border-line bg-white px-6 py-3">
        <select
          aria-label="Filter aksi"
          value={filters.action ?? ''}
          onChange={(event) => patch({ action: event.target.value })}
          className={`${controlClass} sm:w-auto`}
        >
          <option value="">Semua aksi</option>
          {actionOptions.map((action) => (
            <option key={action} value={action}>
              {actionLabels[action]}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter pelaku"
          value={filters.actorId?.toString() ?? ''}
          onChange={(event) => patch({ actor: event.target.value })}
          className={`${controlClass} sm:w-auto`}
        >
          <option value="">Semua pelaku</option>
          {users.data?.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter jenis target"
          value={filters.targetType ?? ''}
          onChange={(event) => patch({ type: event.target.value })}
          className={`${controlClass} sm:w-auto`}
        >
          <option value="">Semua target</option>
          {targetTypeOptions.map((type) => (
            <option key={type} value={type}>
              {targetTypeLabels[type]}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-sm text-muted">
          Dari
          <input
            type="date"
            value={filters.from ?? ''}
            max={filters.to}
            onChange={(event) => patch({ from: event.target.value })}
            className={`${controlClass} sm:w-auto`}
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-muted">
          Sampai
          <input
            type="date"
            value={filters.to ?? ''}
            min={filters.from}
            onChange={(event) => patch({ to: event.target.value })}
            className={`${controlClass} sm:w-auto`}
          />
        </label>

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
          <InlineError message={describeError(query.error)} />
        </div>
      )}

      {query.data !== undefined && entries.length === 0 && (
        <div className="bg-white p-10 text-center">
          <p className="text-sm text-muted">Nggak ada catatan yang cocok dengan filter.</p>
          {hasActiveFilters && (
            <Button variant="secondary" className="mt-3" onClick={resetFilters}>
              Reset filter
            </Button>
          )}
        </div>
      )}

      {entries.length > 0 && (
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
              {entries.map((entry) => {
                const changes = describeChanges(entry)

                return (
                  <tr key={entry.id} className="border-b border-line align-top last:border-b-0">
                    <td className="px-4 py-3 whitespace-nowrap text-muted">
                      {formatDateTime(entry.created_at)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {entry.actor?.name ?? <span className="text-muted">Sistem</span>}
                    </td>
                    <td className="px-4 py-3">
                      <p>{actionLabels[entry.action] ?? entry.action}</p>
                      <p className="font-mono text-xs text-muted">{entry.action}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <TargetCell entry={entry} />
                    </td>
                    <td className="px-4 py-3">
                      {changes.length === 0 ? (
                        <span className="text-muted">—</span>
                      ) : (
                        <ul className="space-y-0.5 text-xs [overflow-wrap:anywhere]">
                          {changes.map((change) => (
                            <li key={change}>{change}</li>
                          ))}
                        </ul>
                      )}
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
          perPage={AUDIT_PER_PAGE}
          unit="catatan"
          onPageChange={(page) => patch({ page: page === 1 ? undefined : String(page) })}
        />
      )}
    </>
  )
}