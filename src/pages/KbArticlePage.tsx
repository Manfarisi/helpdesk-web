import { useState } from 'react'
import { ArrowLeft, Pencil } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { InlineError, Spinner } from '../components/feedback'
import { DetailRow } from '../components/ticket-parts'
import { Button, ButtonLink, Card, PageHeader } from '../components/ui'
import { useAuth } from '../features/auth/useAuth'
import { useArticle, useArticleAction, useDeleteArticle } from '../features/kb/hooks'
import { KbStatusBadge } from '../features/kb/KbStatusBadge'
import { canEditArticle, canManageArticle } from '../features/kb/permissions'
import { describeActionError, describeError } from '../lib/error'
import { formatDateTime } from '../lib/format'
import { NotFoundPage } from './NotFoundPage'

function ArticleView({ slug }: { slug: string }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const query = useArticle(slug)
  const statusAction = useArticleAction(slug)
  const remove = useDeleteArticle(slug)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const backButton = (
    <ButtonLink to="/kb" variant="secondary">
      <ArrowLeft className="size-4" aria-hidden="true" />
      Knowledge Base
    </ButtonLink>
  )

  if (query.isPending) {
    return (
      <>
        <PageHeader title="Memuat artikel…" actions={backButton} />
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      </>
    )
  }

  if (query.isError) {
    return (
      <>
        <PageHeader title="Artikel" actions={backButton} />
        <div className="p-6">
          <InlineError message={describeError(query.error)} />
        </div>
      </>
    )
  }

  if (user === null) return null

  const article = query.data
  const isStaff = user.role !== 'requester'
  const editable = canEditArticle(user, article)
  const manageable = canManageArticle(user)
  const busy = statusAction.isPending || remove.isPending
  const actionError = statusAction.error ?? remove.error

  function deleteArticle() {
    remove.mutate(undefined, {
      onSuccess: () => {
        void navigate('/kb', { replace: true })
      },
    })
  }

  return (
    <>
      <PageHeader
        title={article.title}
        subtitle={article.category.name}
        actions={
          <div className="flex gap-2">
            {editable && (
              <ButtonLink to={`/kb/${slug}/edit`}>
                <Pencil className="size-4" aria-hidden="true" />
                Edit
              </ButtonLink>
            )}
            {backButton}
          </div>
        }
      />

      <div className="grid gap-4 p-4 md:p-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-4">
          {isStaff && article.status === 'draft' && (
            <div className="rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Artikel ini masih draft dan belum terlihat oleh pemohon. Admin yang mempublikasikannya.
            </div>
          )}

          <Card>
            <div className="text-[15px] leading-7 whitespace-pre-wrap [overflow-wrap:anywhere]">
              {article.body}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Info artikel">
            <dl>
              {isStaff && (
                <DetailRow label="Status">
                  <KbStatusBadge status={article.status} />
                </DetailRow>
              )}
              <DetailRow label="Kategori">{article.category.name}</DetailRow>
              <DetailRow label="Penulis">{article.author.name}</DetailRow>
              {article.published_at !== null && (
                <DetailRow label="Dipublikasikan">{formatDateTime(article.published_at)}</DetailRow>
              )}
              <DetailRow label="Dibuat">{formatDateTime(article.created_at)}</DetailRow>
              <DetailRow label="Diperbarui">{formatDateTime(article.updated_at)}</DetailRow>
            </dl>
          </Card>

          {manageable && (
            <Card title="Pengelolaan">
              <div className="space-y-3">
                {actionError !== null && <InlineError message={describeActionError(actionError)} />}

                {article.status === 'draft' ? (
                  <Button
                    className="w-full"
                    disabled={busy}
                    onClick={() => statusAction.mutate('publish')}
                  >
                    {statusAction.isPending ? 'Memproses…' : 'Publikasikan'}
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    className="w-full"
                    disabled={busy}
                    onClick={() => statusAction.mutate('unpublish')}
                  >
                    {statusAction.isPending ? 'Memproses…' : 'Tarik ke draft'}
                  </Button>
                )}

                {confirmingDelete ? (
                  <div className="rounded border border-red-200 bg-red-50 p-3">
                    <p className="text-sm">Artikel yang dihapus nggak bisa dikembalikan.</p>
                    <div className="mt-2 flex gap-2">
                      <Button variant="danger" disabled={busy} onClick={deleteArticle}>
                        {remove.isPending ? 'Menghapus…' : 'Ya, hapus'}
                      </Button>
                      <Button
                        variant="secondary"
                        disabled={busy}
                        onClick={() => setConfirmingDelete(false)}
                      >
                        Batal
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="danger"
                    className="w-full"
                    disabled={busy}
                    onClick={() => setConfirmingDelete(true)}
                  >
                    Hapus artikel
                  </Button>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}

export function KbArticlePage() {
  const { slug } = useParams<{ slug: string }>()

  if (slug === undefined || slug === '') return <NotFoundPage />

  return <ArticleView slug={slug} />
}