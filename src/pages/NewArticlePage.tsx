import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ButtonLink, PageHeader } from '../components/ui'
import { ArticleForm } from '../features/kb/ArticleForm'
import { useCreateArticle } from '../features/kb/hooks'

export function NewArticlePage() {
  const navigate = useNavigate()
  const mutation = useCreateArticle()

  return (
    <>
      <PageHeader
        title="Tulis Artikel"
        subtitle="Artikel baru disimpan sebagai draft sampai admin mempublikasikannya"
        actions={
          <ButtonLink to="/kb" variant="secondary">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Knowledge Base
          </ButtonLink>
        }
      />

      <div className="p-4 md:p-6">
        <ArticleForm
          submitLabel="Simpan draft"
          pendingLabel="Menyimpan…"
          isPending={mutation.isPending}
          error={mutation.error}
          cancelTo="/kb"
          onSubmit={(input) =>
            mutation.mutate(input, {
              onSuccess: (article) => {
                void navigate(`/kb/${article.slug}`)
              },
            })
          }
        />
      </div>
    </>
  )
}