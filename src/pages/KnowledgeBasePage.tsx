import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, X } from 'lucide-react'
import { InlineError, Spinner } from '../components/feedback'
import { Pagination } from '../components/Pagination'
import { Button, ButtonLink, PageHeader } from '../components/ui'
import { useAuth } from '../features/auth/useAuth'
import { useArticleList } from '../features/kb/hooks'
import { KbStatusBadge } from '../features/kb/KbStatusBadge'
import { KB_PER_PAGE, type KbArticle, type KbFilters } from '../features/kb/kb-api'
import { canWriteArticles } from '../features/kb/permissions'
import { useCategories } from '../features/tickets/hooks'
import { describeError } from '../lib/error'
import { formatRelative } from '../lib/format'
import { controlClass } from '../lib/styles'
import { useNow } from '../lib/useNow'
import { useParamPatch } from '../lib/useParamPatch'

/**
 * Nilai di URL yang nggak valid diabaikan. Filter status hanya berlaku untuk staff,
 * karena yang lain memang cuma bisa melihat artikel yang sudah dipublikasikan.
 */
function parseFilters(params: URLSearchParams, isStaff: boolean): KbFilters {
  const status = params.get('status')
  const validStatus = status === 'draft' || status === 'published' ? status : undefined
  const category = Number(params.get('category'))
  const page = Number(params.get('page'))
  const search = params.get('q')?.trim()

  return {
    search: search === undefined || search === '' ? undefined : search,
    categoryId: Number.isInteger(category) && category > 0 ? category : undefined,
    status: isStaff ? validStatus : undefined,
    page: Number.isInteger(page) && page > 0 ? page : 1,
  }
}

function ArticleCard({
  article,
  showDraftBadge,
  now,
}: {
  article: KbArticle
  showDraftBadge: boolean
  now: number
}) {
  return (
    <Link
      to={`/kb/${article.slug}`}
      className="flex h-full flex-col rounded-md border border-line bg-white p-4 hover:border-brand"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="rounded bg-tint px-2 py-0.5 text-xs font-medium text-brand">
          {article.category.name}
        </span>
        {showDraftBadge && article.status === 'draft' && <KbStatusBadge status="draft" />}
      </div>

      <h2 className="mt-3 text-base font-semibold [overflow-wrap:anywhere]">{article.title}</h2>
      <p className="mt-2 line-clamp-3 text-sm text-muted [overflow-wrap:anywhere]">
        {article.excerpt}
      </p>

      <p className="mt-auto pt-4 text-xs text-muted">
        {article.author.name} · diperbarui {formatRelative(article.updated_at, now)}
      </p>
    </Link>
  )
}

export function KnowledgeBasePage() {
  const { user } = useAuth()
  const isStaff = user !== null && canWriteArticles(user)
  const [params, patch] = useParamPatch()
  const filters = parseFilters(params, isStaff)
  const [searchInput, setSearchInput] = useState(filters.search ?? '')
  const now = useNow()

  const query = useArticleList(filters)
  const categoriesQuery = useCategories()

  const articles = query.data?.data ?? []
  const meta = query.data?.meta

  const hasActiveFilters =
    filters.search !== undefined || filters.categoryId !== undefined || filters.status !== undefined

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    patch({ q: searchInput.trim() })
  }

  function resetFilters() {
    setSearchInput('')
    patch({ q: undefined, category: undefined, status: undefined })
  }

  return (
    <>
      <PageHeader
        title="Knowledge Base"
        subtitle="Panduan dan solusi untuk masalah umum"
        actions={
          isStaff ? (
            <ButtonLink to="/kb/new">
              <Plus className="size-4" aria-hidden="true" />
              Tulis Artikel
            </ButtonLink>
          ) : undefined
        }
      />

      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-white px-6 py-3">
        <form onSubmit={submitSearch} className="flex w-full gap-2 sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              type="search"
              aria-label="Cari artikel"
              placeholder="Cari judul atau isi artikel…"
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
            aria-label="Filter status"
            value={filters.status ?? ''}
            onChange={(event) => patch({ status: event.target.value })}
            className={`${controlClass} sm:w-auto`}
          >
            <option value="">Semua status</option>
            <option value="published">Dipublikasikan</option>
            <option value="draft">Draft</option>
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
          <InlineError message={describeError(query.error)} />
        </div>
      )}

      {query.data !== undefined && articles.length === 0 && (
        <div className="bg-white p-10 text-center">
          <p className="text-sm text-muted">
            {hasActiveFilters
              ? 'Tidak ada artikel yang cocok dengan filter.'
              : 'Belum ada artikel.'}
          </p>
          {hasActiveFilters && (
            <Button variant="secondary" className="mt-3" onClick={resetFilters}>
              Reset filter
            </Button>
          )}
        </div>
      )}

      {articles.length > 0 && (
        <div
          className={`grid gap-4 p-4 transition-opacity sm:grid-cols-2 md:p-6 xl:grid-cols-3 ${
            query.isPlaceholderData ? 'opacity-60' : ''
          }`}
        >
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} showDraftBadge={isStaff} now={now} />
          ))}
        </div>
      )}

      {meta !== undefined && (
        <Pagination
          page={meta.current_page}
          lastPage={meta.last_page}
          total={meta.total}
          perPage={KB_PER_PAGE}
          unit="artikel"
          onPageChange={(page) => patch({ page: page === 1 ? undefined : String(page) })}
        />
      )}
    </>
  )
}