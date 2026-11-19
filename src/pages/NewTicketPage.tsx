import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { InlineError } from '../components/feedback'
import { Button, ButtonLink, Card, Field, PageHeader } from '../components/ui'
import { useCategories, useCreateTicket } from '../features/tickets/hooks'
import { ApiError } from '../lib/api'
import { describeError } from '../lib/error'
import { priorityLabel } from '../lib/labels'
import { controlClass } from '../lib/styles'
import type { TicketPriority } from '../types/api'

const priorities: { value: TicketPriority; hint: string }[] = [
  { value: 'low', hint: 'Pertanyaan atau permintaan biasa yang nggak mengganggu pekerjaan.' },
  { value: 'medium', hint: 'Ada gangguan, tapi masih ada cara lain untuk tetap bekerja.' },
  { value: 'high', hint: 'Pekerjaan terhambat dan butuh penanganan hari ini.' },
  { value: 'urgent', hint: 'Banyak orang terdampak atau operasional berhenti total.' },
]

export function NewTicketPage() {
  const navigate = useNavigate()
  const categories = useCategories()
  const mutation = useCreateTicket()

  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [priority, setPriority] = useState<TicketPriority>('medium')

  const error = mutation.error instanceof ApiError ? mutation.error : null
  const fieldErrors = error?.errors ?? {}
  const hasFieldErrors = Object.keys(fieldErrors).length > 0
  const priorityHint = priorities.find((item) => item.value === priority)?.hint

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    mutation.mutate(
      {
        subject: subject.trim(),
        description: description.trim(),
        category_id: Number(categoryId),
        priority,
      },
      {
        onSuccess: (ticket) => {
          void navigate(`/tickets/${ticket.id}`)
        },
      },
    )
  }

  return (
    <>
      <PageHeader
        title="Buat Tiket Baru"
        actions={
          <ButtonLink to="/tickets" variant="secondary">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Daftar tiket
          </ButtonLink>
        }
      />

      <div className="p-4 md:p-6">
        <Card className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error !== null && !hasFieldErrors && <InlineError message={error.message} />}
            {categories.isError && <InlineError message={describeError(categories.error)} />}

            <Field
              label="Ringkasan masalah"
              htmlFor="subject"
              error={fieldErrors.subject?.[0]}
              hint="Satu kalimat singkat, misalnya: VPN tidak bisa connect dari rumah."
            >
              <input
                id="subject"
                type="text"
                required
                maxLength={150}
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className={controlClass}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
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
                label="Prioritas"
                htmlFor="priority"
                error={fieldErrors.priority?.[0]}
                hint={priorityHint}
              >
                <select
                  id="priority"
                  value={priority}
                  onChange={(event) => {
                    const selected = priorities.find((item) => item.value === event.target.value)

                    if (selected !== undefined) setPriority(selected.value)
                  }}
                  className={controlClass}
                >
                  {priorities.map((item) => (
                    <option key={item.value} value={item.value}>
                      {priorityLabel[item.value]}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field
              label="Deskripsi"
              htmlFor="description"
              error={fieldErrors.description?.[0]}
              hint="Jelaskan apa yang terjadi, sejak kapan, dan apa yang sudah kamu coba."
            >
              <textarea
                id="description"
                required
                rows={7}
                maxLength={5000}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className={controlClass}
              />
            </Field>

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Mengirim…' : 'Kirim tiket'}
              </Button>
              <ButtonLink to="/tickets" variant="secondary">
                Batal
              </ButtonLink>
            </div>
          </form>
        </Card>
      </div>
    </>
  )
}