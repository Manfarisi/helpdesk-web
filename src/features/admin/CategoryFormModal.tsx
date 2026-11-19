import { useState, type FormEvent } from 'react'
import { InlineError } from '../../components/feedback'
import { Modal } from '../../components/Modal'
import { Button, Field } from '../../components/ui'
import { ApiError } from '../../lib/api'
import { describeActionError } from '../../lib/error'
import { controlClass } from '../../lib/styles'
import type { Category } from '../../types/api'
import { useSaveCategory } from './hooks'

/**
 * Dialog tambah (category null) atau ubah kategori.
 */
export function CategoryFormModal({
  category,
  onClose,
}: {
  category: Category | null
  onClose: () => void
}) {
  const mutation = useSaveCategory(category?.id ?? null)
  const [name, setName] = useState(category?.name ?? '')
  const [description, setDescription] = useState(category?.description ?? '')

  const isEdit = category !== null
  const apiError = mutation.error instanceof ApiError ? mutation.error : null
  const fieldErrors = apiError?.errors ?? {}
  const hasFieldErrors = Object.keys(fieldErrors).length > 0

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmed = description.trim()

    mutation.mutate(
      { name: name.trim(), description: trimmed === '' ? null : trimmed },
      { onSuccess: onClose },
    )
  }

  return (
    <Modal title={isEdit ? 'Ubah kategori' : 'Tambah kategori'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {mutation.isError && !hasFieldErrors && (
          <InlineError message={describeActionError(mutation.error)} />
        )}

        <Field
          label="Nama"
          htmlFor="category-name"
          error={fieldErrors.name?.[0]}
          hint="Alamat internal (slug) dibuat otomatis dari nama dan ikut berubah kalau nama diganti."
        >
          <input
            id="category-name"
            type="text"
            required
            maxLength={100}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={controlClass}
          />
        </Field>

        <Field
          label="Deskripsi (opsional)"
          htmlFor="category-description"
          error={fieldErrors.description?.[0]}
        >
          <textarea
            id="category-description"
            rows={3}
            maxLength={500}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className={controlClass}
          />
        </Field>

        <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={mutation.isPending || name.trim() === ''}>
            {mutation.isPending ? 'Menyimpan…' : isEdit ? 'Simpan perubahan' : 'Tambah kategori'}
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Batal
          </Button>
        </div>
      </form>
    </Modal>
  )
}