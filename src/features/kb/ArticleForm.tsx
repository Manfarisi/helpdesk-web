import { useState, type FormEvent } from 'react'
import { InlineError } from '../../components/feedback'
import { Button, ButtonLink, Card, Field } from '../../components/ui'
import { ApiError } from '../../lib/api'
import { describeActionError, describeError } from '../../lib/error'
import { controlClass } from '../../lib/styles'
import { useCategories } from '../tickets/hooks'
import type { ArticleInput } from './kb-api'

const MAX_BODY = 20000

interface ArticleFormProps {
  initial?: ArticleInput
  submitLabel: string
  pendingLabel: string
  isPending: boolean
  error: Error | null
  cancelTo: string
  onSubmit: (input: ArticleInput) => void
}

/**
 * Formulir artikel, dipakai bersama oleh halaman tulis baru dan halaman edit.
 */
export function ArticleForm({
  initial,
  submitLabel,
  pendingLabel,
  isPending,
  error,
  cancelTo,
  onSubmit,
}: ArticleFormProps) {
  const categories = useCategories()
  const [title, setTitle] = useState(initial?.title ?? '')
  const [body, setBody] = useState(initial?.body ?? '')
  const [categoryId, setCategoryId] = useState(
    initial === undefined ? '' : String(initial.category_id),
  )

  const apiError = error instanceof ApiError ? error : null
  const fieldErrors = apiError?.errors ?? {}
  const hasFieldErrors = Object.keys(fieldErrors).length > 0
  const incomplete = title.trim() === '' || body.trim() === '' || categoryId === ''

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    onSubmit({
      title: title.trim(),
      body: body.trim(),
      category_id: Number(categoryId),
    })
  }

  return (
    <Card className="max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error !== null && !hasFieldErrors && <InlineError message={describeActionError(error)} />}
        {categories.isError && <InlineError message={describeError(categories.error)} />}

        <Field label="Judul" htmlFor="title" error={fieldErrors.title?.[0]}>
          <input
            id="title"
            type="text"
            required
            maxLength={150}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className={controlClass}
          />
        </Field>

        <Field label="Kategori" htmlFor="category" error={fieldErrors.category_id?.[0]}>
          <select
            id="category"
            required
            disabled={categories.isPending}
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className={controlClass}
          >
            <option value="">Pilih kategori…</option>
            {categories.data?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Isi artikel"
          htmlFor="body"
          error={fieldErrors.body?.[0]}
          hint={`Tulis langkah-langkahnya satu per baris. Format Markdown belum didukung, teks tampil apa adanya. ${body.length}/${MAX_BODY} karakter.`}
        >
          <textarea
            id="body"
            required
            rows={16}
            maxLength={MAX_BODY}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            className={controlClass}
          />
        </Field>

        <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={isPending || incomplete}>
            {isPending ? pendingLabel : submitLabel}
          </Button>
          <ButtonLink to={cancelTo} variant="secondary">
            Batal
          </ButtonLink>
        </div>
      </form>
    </Card>
  )
}