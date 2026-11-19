import { useState, type FormEvent } from 'react'
import { Pencil, Plus, Search, X } from 'lucide-react'
import { InlineError, Spinner } from '../components/feedback'
import { Pagination } from '../components/Pagination'
import { Button, PageHeader } from '../components/ui'
import type { AdminUser, UserFilters } from '../features/admin/admin-api'
import { USERS_PER_PAGE } from '../features/admin/admin-api'
import { useUsers } from '../features/admin/hooks'
import { UserFormModal } from '../features/admin/UserFormModal'
import { useAuth } from '../features/auth/useAuth'
import { describeError } from '../lib/error'
import { formatDateTime } from '../lib/format'
import { roleLabel } from '../lib/labels'
import { controlClass } from '../lib/styles'
import { useParamPatch } from '../lib/useParamPatch'
import type { UserRole } from '../types/api'

const roleOptions: UserRole[] = ['admin', 'agent', 'requester']

const columns = ['Nama', 'Email', 'Peran', 'Status', 'Dibuat', '']

function parseFilters(params: URLSearchParams): UserFilters {
  const role = params.get('role')
  const status = params.get('status')
  const page = Number(params.get('page'))
  const search = params.get('q')?.trim()

  let isActive: boolean | undefined

  if (status === 'active') isActive = true
  if (status === 'inactive') isActive = false

  return {
    search: search === undefined || search === '' ? undefined : search,
    role: roleOptions.find((option) => option === role),
    isActive,
    page: Number.isInteger(page) && page > 0 ? page : 1,
  }
}

function statusParam(isActive: boolean | undefined): string {
  if (isActive === undefined) return ''

  return isActive ? 'active' : 'inactive'
}

export function AdminUsersPage() {
  const { user: me } = useAuth()
  const [params, patch] = useParamPatch()
  const filters = parseFilters(params)
  const [searchInput, setSearchInput] = useState(filters.search ?? '')
  // null = dialog tertutup. { user: null } = tambah pengguna. { user } = edit pengguna.
  const [dialog, setDialog] = useState<{ user: AdminUser | null } | null>(null)

  const query = useUsers(filters)
  const users = query.data?.data ?? []
  const meta = query.data?.meta

  const hasActiveFilters =
    filters.search !== undefined || filters.role !== undefined || filters.isActive !== undefined

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    patch({ q: searchInput.trim() })
  }

  function resetFilters() {
    setSearchInput('')
    patch({ q: undefined, role: undefined, status: undefined })
  }

  return (
    <>
      <PageHeader
        title="Pengguna"
        subtitle="Kelola akun, peran, dan status aktif"
        actions={
          <Button onClick={() => setDialog({ user: null })}>
            <Plus className="size-4" aria-hidden="true" />
            Tambah Pengguna
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-white px-6 py-3">
        <form onSubmit={submitSearch} className="flex w-full gap-2 sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              type="search"
              aria-label="Cari pengguna"
              placeholder="Cari nama atau email…"
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
          aria-label="Filter peran"
          value={filters.role ?? ''}
          onChange={(event) => patch({ role: event.target.value })}
          className={`${controlClass} sm:w-auto`}
        >
          <option value="">Semua peran</option>
          {roleOptions.map((role) => (
            <option key={role} value={role}>
              {roleLabel[role]}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter status"
          value={statusParam(filters.isActive)}
          onChange={(event) => patch({ status: event.target.value })}
          className={`${controlClass} sm:w-auto`}
        >
          <option value="">Semua status</option>
          <option value="active">Aktif</option>
          <option value="inactive">Nonaktif</option>
        </select>

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

      {query.data !== undefined && users.length === 0 && (
        <div className="bg-white p-10 text-center">
          <p className="text-sm text-muted">Tidak ada pengguna yang cocok dengan filter.</p>
          {hasActiveFilters && (
            <Button variant="secondary" className="mt-3" onClick={resetFilters}>
              Reset filter
            </Button>
          )}
        </div>
      )}

      {users.length > 0 && (
        <div
          className={`overflow-x-auto bg-white transition-opacity ${
            query.isPlaceholderData ? 'opacity-60' : ''
          }`}
        >
          <table className="w-full min-w-[46rem] text-left text-sm">
            <thead>
              <tr className="border-b border-line">
                {columns.map((column, index) => (
                  <th key={column === '' ? `col-${index}` : column} scope="col" className="px-4 py-3 font-semibold">
                    {column === '' ? <span className="sr-only">Aksi</span> : column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-line last:border-b-0 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">
                    {user.name}
                    {me?.id === user.id && (
                      <span className="ml-2 text-xs font-normal text-muted">(kamu)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-[13px]">{user.email}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{roleLabel[user.role]}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${
                        user.is_active
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {user.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted">
                    {formatDateTime(user.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="secondary"
                      className="px-2 py-1 text-xs"
                      onClick={() => setDialog({ user })}
                    >
                      <Pencil className="size-3.5" aria-hidden="true" />
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {meta !== undefined && (
        <Pagination
          page={meta.current_page}
          lastPage={meta.last_page}
          total={meta.total}
          perPage={USERS_PER_PAGE}
          unit="pengguna"
          onPageChange={(page) => patch({ page: page === 1 ? undefined : String(page) })}
        />
      )}

      {dialog !== null && (
        <UserFormModal
          key={dialog.user?.id ?? 'new'}
          user={dialog.user}
          onClose={() => setDialog(null)}
        />
      )}
    </>
  )
}