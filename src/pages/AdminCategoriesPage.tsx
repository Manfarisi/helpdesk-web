import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { InlineError, Spinner } from '../components/feedback'
import { Modal } from '../components/Modal'
import { Button, PageHeader } from '../components/ui'
import { CategoryFormModal } from '../features/admin/CategoryFormModal'
import { useDeleteCategory } from '../features/admin/hooks'
import { useCategories } from '../features/tickets/hooks'
import { describeActionError, describeError } from '../lib/error'
import type { Category } from '../types/api'

function DeleteCategoryModal({
  category,
  onClose,
}: {
  category: Category
  onClose: () => void
}) {
  const mutation = useDeleteCategory()

  return (
    <Modal title="Hapus kategori" onClose={onClose}>
      <div className="space-y-4">
        {mutation.isError && <InlineError message={describeActionError(mutation.error)} />}

        <p className="text-sm">
          Hapus kategori <span className="font-semibold">{category.name}</span>? Kategori yang
          masih dipakai tiket atau artikel nggak bisa dihapus.
        </p>

        <div className="flex gap-2">
          <Button
            variant="danger"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate(category.id, { onSuccess: onClose })}
          >
            {mutation.isPending ? 'Menghapus…' : 'Ya, hapus'}
          </Button>
          <Button variant="secondary" disabled={mutation.isPending} onClick={onClose}>
            Batal
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export function AdminCategoriesPage() {
  const query = useCategories()
  // null = dialog tertutup. { category: null } = tambah kategori. { category } = ubah kategori.
  const [formDialog, setFormDialog] = useState<{ category: Category | null } | null>(null)
  const [deleting, setDeleting] = useState<Category | null>(null)

  const categories = query.data ?? []

  return (
    <>
      <PageHeader
        title="Kategori"
        subtitle="Dipakai untuk mengelompokkan tiket dan artikel Knowledge Base"
        actions={
          <Button onClick={() => setFormDialog({ category: null })}>
            <Plus className="size-4" aria-hidden="true" />
            Tambah Kategori
          </Button>
        }
      />

      {query.isPending && (
        <div className="flex justify-center bg-white py-16">
          <Spinner />
        </div>
      )}

      {query.isError && (
        <div className="p-6">
          <InlineError message={describeError(query.error)} />
        </div>
      )}

      {query.data !== undefined && categories.length === 0 && (
        <p className="bg-white p-10 text-center text-sm text-muted">Belum ada kategori.</p>
      )}

      {categories.length > 0 && (
        <div className="overflow-x-auto bg-white">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className="px-4 py-3 font-semibold">
                  Nama
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Slug
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Deskripsi
                </th>
                <th scope="col" className="px-4 py-3">
                  <span className="sr-only">Aksi</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr
                  key={category.id}
                  className="border-b border-line last:border-b-0 hover:bg-slate-50"
                >
                  <td className="px-4 py-3 font-medium whitespace-nowrap">{category.name}</td>
                  <td className="px-4 py-3 font-mono text-[13px] text-muted">{category.slug}</td>
                  <td className="px-4 py-3 text-muted">{category.description ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="secondary"
                        className="px-2 py-1 text-xs"
                        onClick={() => setFormDialog({ category })}
                      >
                        <Pencil className="size-3.5" aria-hidden="true" />
                        Edit
                      </Button>
                      <Button
                        variant="secondary"
                        className="px-2 py-1 text-xs text-red-700"
                        onClick={() => setDeleting(category)}
                      >
                        <Trash2 className="size-3.5" aria-hidden="true" />
                        Hapus
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {formDialog !== null && (
        <CategoryFormModal
          key={formDialog.category?.id ?? 'new'}
          category={formDialog.category}
          onClose={() => setFormDialog(null)}
        />
      )}

      {deleting !== null && (
        <DeleteCategoryModal key={deleting.id} category={deleting} onClose={() => setDeleting(null)} />
      )}
    </>
  )
}