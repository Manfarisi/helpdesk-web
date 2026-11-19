import { useState, type FormEvent } from 'react'
import { InlineError } from '../../components/feedback'
import { Modal } from '../../components/Modal'
import { Button, Field } from '../../components/ui'
import { ApiError } from '../../lib/api'
import { describeActionError } from '../../lib/error'
import { formatMinutes } from '../../lib/format'
import { priorityLabel } from '../../lib/labels'
import { controlClass } from '../../lib/styles'
import type { SlaPolicy } from './admin-api'
import { useSaveSlaPolicy } from './hooks'

const MAX_MINUTES = 525600 // 1 tahun, sama dengan batas di API

function toMinutes(value: string): number | null {
  const parsed = Number(value)

  return value.trim() !== '' && Number.isInteger(parsed) && parsed >= 1 && parsed <= MAX_MINUTES
    ? parsed
    : null
}

export function SlaFormModal({ policy, onClose }: { policy: SlaPolicy; onClose: () => void }) {
  const mutation = useSaveSlaPolicy(policy.id)
  const [firstInput, setFirstInput] = useState(String(policy.first_response_minutes))
  const [resolutionInput, setResolutionInput] = useState(String(policy.resolution_minutes))

  const first = toMinutes(firstInput)
  const resolution = toMinutes(resolutionInput)
  const wrongOrder = first !== null && resolution !== null && resolution < first
  const apiError = mutation.error instanceof ApiError ? mutation.error : null
  const fieldErrors = apiError?.errors ?? {}
  const hasFieldErrors = Object.keys(fieldErrors).length > 0

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (first === null || resolution === null || wrongOrder) return

    mutation.mutate(
      { first_response_minutes: first, resolution_minutes: resolution },
      { onSuccess: onClose },
    )
  }

  return (
    <Modal title={`Target SLA — ${priorityLabel[policy.priority]}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {mutation.isError && !hasFieldErrors && (
          <InlineError message={describeActionError(mutation.error)} />
        )}

        <p className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Perubahan hanya berlaku untuk tiket yang dibuat setelah ini. Tiket yang sudah ada tetap
          memakai target lamanya.
        </p>

        <Field
          label="Target respons pertama (menit)"
          htmlFor="sla-first"
          error={fieldErrors.first_response_minutes?.[0]}
          hint={first === null ? 'Isi angka 1 sampai 525.600.' : `= ${formatMinutes(first)}`}
        >
          <input
            id="sla-first"
            type="number"
            inputMode="numeric"
            min={1}
            max={MAX_MINUTES}
            step={1}
            required
            value={firstInput}
            onChange={(event) => setFirstInput(event.target.value)}
            className={controlClass}
          />
        </Field>

        <Field
          label="Target penyelesaian (menit)"
          htmlFor="sla-resolution"
          error={
            fieldErrors.resolution_minutes?.[0] ??
            (wrongOrder
              ? 'Target penyelesaian nggak boleh lebih pendek dari target respons.'
              : undefined)
          }
          hint={
            resolution === null ? 'Isi angka 1 sampai 525.600.' : `= ${formatMinutes(resolution)}`
          }
        >
          <input
            id="sla-resolution"
            type="number"
            inputMode="numeric"
            min={1}
            max={MAX_MINUTES}
            step={1}
            required
            value={resolutionInput}
            onChange={(event) => setResolutionInput(event.target.value)}
            className={controlClass}
          />
        </Field>

        <div className="flex gap-2 pt-2">
          <Button
            type="submit"
            disabled={mutation.isPending || first === null || resolution === null || wrongOrder}
          >
            {mutation.isPending ? 'Menyimpan…' : 'Simpan target'}
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Batal
          </Button>
        </div>
      </form>
    </Modal>
  )
}