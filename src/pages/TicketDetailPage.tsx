import { useState, type FormEvent } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { InlineError, Spinner } from '../components/feedback'
import { DetailRow, PriorityLabel, StatusLabel } from '../components/ticket-parts'
import { Button, ButtonLink, Card, PageHeader } from '../components/ui'
import { useAuth } from '../features/auth/useAuth'
import { HistoryCard } from '../features/tickets/HistoryCard'
import { useAddComment, useComments, useTicket } from '../features/tickets/hooks'
import { WorkflowCard } from '../features/tickets/WorkflowCard'
import { ApiError } from '../lib/api'
import { describeError } from '../lib/error'
import { formatDateTime, initials } from '../lib/format'
import { roleLabel, slaToneClass } from '../lib/labels'
import { describeSla, type SlaTone } from '../lib/sla'
import { controlClass } from '../lib/styles'
import { useNow } from '../lib/useNow'
import type { Ticket, TicketComment, User } from '../types/api'
import { NotFoundPage } from './NotFoundPage'

const barClass: Record<SlaTone, string> = {
  danger: 'bg-red-600',
  warning: 'bg-amber-500',
  ok: 'bg-emerald-500',
  normal: 'bg-brand',
  muted: 'bg-slate-400',
}

const escalationLabel = ['Normal', 'Peringatan', 'Terlewat']

/**
 * Cerminan aturan TicketPolicy::comment di API. Ini cuma menentukan apakah formulir
 * ditampilkan, penjaga sebenarnya tetap API.
 */
function canComment(user: User, ticket: Ticket): boolean {
  if (user.role === 'admin') return true
  if (user.role === 'agent') return ticket.assignee?.id === user.id

  return ticket.requester.id === user.id
}

function CommentItem({ comment, ticket }: { comment: TicketComment; ticket: Ticket }) {
  const isRequester = comment.author.id === ticket.requester.id

  return (
    <li
      className={`flex gap-3 rounded border p-3 ${
        comment.is_internal ? 'border-amber-200 bg-amber-50' : 'border-line bg-white'
      }`}
    >
      <span
        aria-hidden="true"
        className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
          isRequester ? 'bg-slate-200 text-slate-700' : 'bg-brand/10 text-brand'
        }`}
      >
        {initials(comment.author.name)}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <span className="font-semibold">{comment.author.name}</span>
          <span className="text-xs text-muted">
            {isRequester ? 'Pemohon' : roleLabel[comment.author.role]}
          </span>
          {comment.is_internal && (
            <span className="rounded bg-amber-200 px-1.5 py-0.5 text-[11px] font-semibold text-amber-900">
              Catatan internal
            </span>
          )}
          <span className="text-xs text-muted">· {formatDateTime(comment.created_at)}</span>
        </div>
        <p className="mt-1 text-sm whitespace-pre-wrap [overflow-wrap:anywhere]">{comment.body}</p>
      </div>
    </li>
  )
}

function CommentForm({ ticket, user }: { ticket: Ticket; user: User }) {
  const [body, setBody] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const mutation = useAddComment(ticket.id)

  const isStaff = user.role !== 'requester'
  const error = mutation.error instanceof ApiError ? mutation.error : null
  const bodyError = error?.errors.body?.[0]

  if (ticket.status === 'closed' || ticket.status === 'cancelled') {
    return (
      <p className="text-sm text-muted">
        Tiket sudah ditutup atau dibatalkan, jadi percakapan dikunci.
      </p>
    )
  }

  if (!canComment(user, ticket)) {
    return (
      <p className="text-sm text-muted">
        Kamu belum bisa membalas tiket ini. Percakapan hanya bisa ditulis oleh pemohon,
        penanggung jawab tiket, dan admin.
      </p>
    )
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    mutation.mutate(
      { body: body.trim(), isInternal },
      {
        onSuccess: () => {
          setBody('')
          setIsInternal(false)
        },
      },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error !== null && bodyError === undefined && <InlineError message={error.message} />}

      <div>
        <label htmlFor="comment-body" className="sr-only">
          Tulis balasan
        </label>
        <textarea
          id="comment-body"
          rows={4}
          maxLength={5000}
          required
          placeholder={isInternal ? 'Tulis catatan internal…' : 'Tulis balasan…'}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          className={`${controlClass} ${isInternal ? 'border-amber-300 bg-amber-50' : ''}`}
        />
        {bodyError !== undefined && <p className="mt-1 text-sm text-red-600">{bodyError}</p>}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        {isStaff ? (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isInternal}
              onChange={(event) => setIsInternal(event.target.checked)}
              className="size-4 rounded border-line"
            />
            Catatan internal (tidak terlihat oleh pemohon)
          </label>
        ) : (
          <span />
        )}

        <Button type="submit" disabled={mutation.isPending || body.trim() === ''}>
          {mutation.isPending ? 'Mengirim…' : isInternal ? 'Simpan catatan' : 'Kirim balasan'}
        </Button>
      </div>
    </form>
  )
}

function RequesterCard({ ticket }: { ticket: Ticket }) {
  return (
    <Card title="Pemohon">
      <dl>
        <DetailRow label="Nama">{ticket.requester.name}</DetailRow>
        <DetailRow label="Email">
          <span className="font-mono text-[13px]">{ticket.requester.email}</span>
        </DetailRow>
        <DetailRow label="Peran">{roleLabel[ticket.requester.role]}</DetailRow>
      </dl>
    </Card>
  )
}

function SlaCard({ ticket }: { ticket: Ticket }) {
  const now = useNow()
  const sla = describeSla(ticket, now)
  const progress = ticket.sla.progress_percent
  const finished = ['resolved', 'closed', 'cancelled'].includes(ticket.status)

  let timer = 'Berjalan'

  if (finished) {
    timer = 'Berhenti'
  } else if (ticket.sla.is_paused) {
    timer = 'Dijeda'
  }

  return (
    <Card title="SLA">
      <p className={`text-2xl ${slaToneClass[sla.tone]}`}>{sla.text}</p>

      {progress !== null && (
        <div className="mt-3">
          <div
            role="progressbar"
            aria-label="Waktu SLA terpakai"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.min(100, Math.round(progress))}
            className="h-2 overflow-hidden rounded bg-slate-200"
          >
            <div
              className={`h-full ${barClass[sla.tone]}`}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-muted">
            {Math.round(progress)}% waktu penyelesaian terpakai
          </p>
        </div>
      )}

      <dl className="mt-3">
        <DetailRow label="Respons pertama">
          {ticket.sla.first_responded_at !== null
            ? formatDateTime(ticket.sla.first_responded_at)
            : 'Belum dibalas'}
        </DetailRow>
        <DetailRow label="Timer">{timer}</DetailRow>
        <DetailRow label="Eskalasi">
          {escalationLabel[ticket.sla.escalation_level] ?? 'Normal'}
        </DetailRow>
      </dl>
    </Card>
  )
}

function TicketDetail({ id }: { id: number }) {
  const { user } = useAuth()
  const ticketQuery = useTicket(id)
  const commentsQuery = useComments(id)

  const backButton = (
    <ButtonLink to="/tickets" variant="secondary">
      <ArrowLeft className="size-4" aria-hidden="true" />
      Daftar tiket
    </ButtonLink>
  )

  if (ticketQuery.isPending) {
    return (
      <>
        <PageHeader title="Memuat tiket…" actions={backButton} />
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      </>
    )
  }

  if (ticketQuery.isError) {
    return (
      <>
        <PageHeader title="Tiket" actions={backButton} />
        <div className="p-6">
          <InlineError message={describeError(ticketQuery.error)} />
        </div>
      </>
    )
  }

  if (user === null) return null

  const ticket = ticketQuery.data
  const isStaff = user.role !== 'requester'
  const comments = commentsQuery.data

  return (
    <>
      <PageHeader
        title={`${ticket.number} — ${ticket.subject}`}
        subtitle={ticket.category.name}
        actions={backButton}
      />

      <div className="grid gap-4 p-4 md:p-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="space-y-4">
          <Card title="Detail tiket">
            <dl className="grid gap-x-8 sm:grid-cols-2">
              <DetailRow label="Ringkasan" wide>
                {ticket.subject}
              </DetailRow>
              <DetailRow label="Nomor">
                <span className="font-mono text-[13px]">{ticket.number}</span>
              </DetailRow>
              <DetailRow label="Prioritas">
                <PriorityLabel priority={ticket.priority} />
              </DetailRow>
              <DetailRow label="Status">
                <StatusLabel status={ticket.status} />
              </DetailRow>
              <DetailRow label="Kategori">{ticket.category.name}</DetailRow>
              <DetailRow label="Dibuat">{formatDateTime(ticket.created_at)}</DetailRow>
              <DetailRow label="Penanggung jawab">
                {ticket.assignee?.name ?? 'Belum di-assign'}
              </DetailRow>
              <DetailRow label="Target respons">
                {formatDateTime(ticket.sla.first_response_due_at)}
              </DetailRow>
              <DetailRow label="Target selesai">
                {formatDateTime(ticket.sla.resolution_due_at)}
              </DetailRow>
              {ticket.sla.resolved_at !== null && (
                <DetailRow label="Diselesaikan">{formatDateTime(ticket.sla.resolved_at)}</DetailRow>
              )}
              {ticket.sla.closed_at !== null && (
                <DetailRow label="Ditutup">{formatDateTime(ticket.sla.closed_at)}</DetailRow>
              )}
            </dl>

            <div className="mt-4 rounded border border-brand/20 bg-tint p-4">
              <p className="text-xs font-semibold tracking-wide text-muted uppercase">
                Deskripsi (pemohon)
              </p>
              <p className="mt-1 text-sm whitespace-pre-wrap [overflow-wrap:anywhere]">
                {ticket.description}
              </p>
            </div>
          </Card>

          <Card title={comments === undefined ? 'Percakapan' : `Percakapan (${comments.length})`}>
            {commentsQuery.isPending && (
              <div className="flex justify-center py-6">
                <Spinner />
              </div>
            )}

            {commentsQuery.isError && (
              <InlineError message={describeError(commentsQuery.error)} />
            )}

            {comments !== undefined &&
              (comments.length === 0 ? (
                <p className="text-sm text-muted">Belum ada percakapan.</p>
              ) : (
                <ul className="space-y-3">
                  {comments.map((comment) => (
                    <CommentItem key={comment.id} comment={comment} ticket={ticket} />
                  ))}
                </ul>
              ))}

            <div className="mt-4 border-t border-line pt-4">
              <CommentForm ticket={ticket} user={user} />
            </div>
          </Card>

          {isStaff && <HistoryCard ticket={ticket} />}
        </div>

        <div className="space-y-4">
          <WorkflowCard ticket={ticket} user={user} />

          {isStaff ? (
            <>
              <RequesterCard ticket={ticket} />
              <SlaCard ticket={ticket} />
            </>
          ) : (
            <Card title="Info">
              <p className="text-sm text-muted">
                Tim IT akan membalas lewat percakapan di samping. Kamu bisa menambahkan
                informasi kapan saja selama tiket belum ditutup.
              </p>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}

export function TicketDetailPage() {
  const { ticketId } = useParams<{ ticketId: string }>()
  const id = Number(ticketId)

  if (!Number.isInteger(id) || id <= 0) return <NotFoundPage />

  return <TicketDetail id={id} />
}