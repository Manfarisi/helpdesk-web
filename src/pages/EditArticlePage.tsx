import { ArrowLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { InlineError, Spinner } from '../components/feedback'
import { ButtonLink, Card, PageHeader } from '../components/ui'
import { useAuth } from '../features/auth/useAuth'
import { ArticleForm } from '../features/kb/ArticleForm'
import { useArticle, useUpdateArticle } from '../features/kb/hooks'
import { canEditArticle } from '../features/kb/permissions'
import { describeError } from '../lib/error'
import { NotFoundPage } from './NotFoundPage'

function EditArticle({ slug }: { slug: string }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const query = useArticle(slug)
  const mutation = useUpdateArticle(slug)

  const backTo = `/kb/${slug}`

  const backButton = (
    <ButtonLink to={backTo} variant="secondary">
      <ArrowLeft className="size-4" aria-hidden="true" />
      Kembali ke artikel
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
        <PageHeader title="Edit artikel" actions={backButton} />
        <div className="p-6">
          <InlineError message={describeError(query.error)} />
        </div>
      </>
    )
  }

  if (user === null) return null

  const article = query.data

  if (!canEditArticle(user, article)) {
    return (
      <>
        <PageHeader title="Edit artikel" actions={backButton} />
        <div className="p-4 md:p-6">
          <Card className="max-w-3xl">
            <p className="text-sm text-muted">
              Kamu nggak bisa mengedit artikel ini. Agent hanya bisa mengedit draft miliknya
              sendiri. Artikel yang sudah dipublikasikan diubah oleh admin.
            </p>
          </Card>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader title={`Edit: ${article.title}`} subtitle={article.category.name} actions={backButton} />

      <div className="p-4 md:p-6">
        <ArticleForm
          initial={{ title: article.title, body: article.body, category_id: article.category.id }}
          submitLabel="Simpan perubahan"
          pendingLabel="Menyimpan…"
          isPending={mutation.isPending}
          error={mutation.error}
          cancelTo={backTo}
          onSubmit={(input) =>
            mutation.mutate(input, {
              onSuccess: () => {
                void navigate(backTo)
              },
            })
          }
        />
      </div>
    </>
  )
}

export function EditArticlePage() {
  const { slug } = useParams<{ slug: string }>()

  if (slug === undefined || slug === '') return <NotFoundPage />

  return <EditArticle slug={slug} />
}