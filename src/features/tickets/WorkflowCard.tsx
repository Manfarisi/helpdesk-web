import { useState } from 'react'
import { InlineError } from '../../components/feedback'
import { DetailRow, StatusLabel } from '../../components/ticket-parts'
import { Button, Card } from '../../components/ui'
import { describeActionError } from '../../lib/error'
import { roleLabel, statusLabel } from '../../lib/labels'
import { controlClass } from '../../lib/styles'
import type { Ticket, TicketStatus, User } from '../../types/api'
import { useAssignableUsers, useTicketAction, type TicketAction } from './hooks'
import { availableActions, canAssign, canClaim } from './workflow'

function idleHint(user: User, ticket: Ticket): string {
  if (ticket.status === 'resolved' || ticket.status === 'closed' || ticket.status === 'cancelled') {
    return `Tiket sudah ${statusLabel[ticket.status].toLowerCase()}, nggak ada tindakan lagi.`
  }

  if (user.role === 'agent' && ticket.assignee !== null) {
    return `Tiket ini dipegang ${ticket.assignee.name}. Hanya penanggung jawab dan admin yang bisa mengubahnya.`
  }

  return 'Nggak ada tindakan yang tersedia.'
}

export function WorkflowCard({ ticket, user }: { ticket: Ticket; user: User }) {
  const [confirming, setConfirming] = useState<TicketStatus | null>(null)
  const [assigneeId, setAssigneeId] = useState('')
  const mutation = useTicketAction(ticket.id)

  const isStaff = user.role !== 'requester'
  const actions = availableActions(user, ticket)
  const claimable = canClaim(user, ticket)
  const assignable = canAssign(user, ticket)
  const agents = useAssignableUsers(assignable)

  // Requester tanpa tindakan nggak perlu melihat kartu ini sama sekali.
  if (!isStaff && actions.length === 0) return null

  const busy = mutation.isPending
  const candidates = (agents.data ?? []).filter((person) => person.id !== ticket.assignee?.id)
  const nothingToDo = !claimable && !assignable && actions.length === 0

  function run(action: TicketAction) {
    setConfirming(null)
    mutation.mutate(action, { onSuccess: () => setAssigneeId('') })
  }

  return (
    <Card title={isStaff ? 'Workflow' : 'Tindakan'}>
      <div className="space-y-4">
        {mutation.isError && <InlineError message={describeActionError(mutation.error)} />}

        {isStaff && (
          <dl>
            <DetailRow label="Status">
              <StatusLabel status={ticket.status} />
            </DetailRow>
            <DetailRow label="Penanggung jawab">
              {ticket.assignee?.name ?? 'Belum di-assign'}
            </DetailRow>
          </dl>
        )}

        {claimable && (
          <div>
            <Button className="w-full" disabled={busy} onClick={() => run({ type: 'claim' })}>
              {busy ? 'Memproses…' : 'Ambil tiket (claim)'}
            </Button>
            <p className="mt-1 text-xs text-muted">
              Tiket ini belum punya penanggung jawab. Setelah diambil, status berubah jadi Terbuka.
            </p>
          </div>
        )}

        {assignable && (
          <div>
            <label htmlFor="assignee" className="block text-sm font-medium">
              {ticket.assignee === null ? 'Assign ke' : 'Alihkan ke'}
            </label>
            <div className="mt-1 flex gap-2">
              <select
                id="assignee"
                value={assigneeId}
                disabled={busy || agents.isPending}
                onChange={(event) => setAssigneeId(event.target.value)}
                className={`${controlClass} min-w-0 flex-1`}
              >
                <option value="">Pilih agent…</option>
                {candidates.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name} ({roleLabel[person.role]})
                  </option>
                ))}
              </select>
              <Button
                className="shrink-0"
                disabled={busy || assigneeId === ''}
                onClick={() => run({ type: 'assign', assigneeId: Number(assigneeId) })}
              >
                Assign
              </Button>
            </div>
            {agents.isError && (
              <p className="mt-1 text-sm text-red-600">Daftar agent gagal dimuat. Coba muat ulang halaman.</p>
            )}
          </div>
        )}

        {actions.length > 0 && (
          <div className="space-y-2">
            {isStaff && <p className="text-sm font-medium">Ubah status</p>}

            {actions.map((action) =>
              confirming === action.to ? (
                <div key={action.to} className="rounded border border-red-200 bg-red-50 p-3">
                  <p className="text-sm">{action.confirm}</p>
                  <div className="mt-2 flex gap-2">
                    <Button
                      variant={action.tone}
                      disabled={busy}
                      onClick={() => run({ type: 'transition', to: action.to })}
                    >
                      Ya, {action.label.toLowerCase()}
                    </Button>
                    <Button variant="secondary" disabled={busy} onClick={() => setConfirming(null)}>
                      Batal
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  key={action.to}
                  variant={action.tone}
                  className="w-full"
                  disabled={busy}
                  onClick={() => {
                    if (action.confirm === undefined) {
                      run({ type: 'transition', to: action.to })
                    } else {
                      setConfirming(action.to)
                    }
                  }}
                >
                  {action.label}
                </Button>
              ),
            )}
          </div>
        )}

        {nothingToDo && <p className="text-sm text-muted">{idleHint(user, ticket)}</p>}
      </div>
    </Card>
  )
}