import type { ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { InlineError, Spinner } from '../components/feedback'
import { Button, Card, PageHeader } from '../components/ui'
import {
  DEFAULT_RANGE_DAYS,
  periodFor,
  rangeOptions,
  type DashboardData,
} from '../features/dashboard/dashboard-api'
import { useDashboard } from '../features/dashboard/hooks'
import { describeError } from '../lib/error'
import { formatDate, formatDuration, formatNumber } from '../lib/format'
import { priorityLabel, roleLabel, statusDot, statusLabel } from '../lib/labels'
import { useNow } from '../lib/useNow'
import type { TicketPriority, TicketStatus } from '../types/api'

type Tone = 'normal' | 'ok' | 'warning' | 'danger'

const toneClass: Record<Tone, string> = {
  normal: 'text-ink',
  ok: 'text-emerald-700',
  warning: 'text-amber-700',
  danger: 'text-red-700',
}

const statusOrder: TicketStatus[] = [
  'new',
  'open',
  'in_progress',
  'pending',
  'resolved',
  'closed',
  'cancelled',
]

const priorityOrder: TicketPriority[] = ['urgent', 'high', 'medium', 'low']

const priorityBar: Record<TicketPriority, string> = {
  urgent: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-sky-500',
  low: 'bg-slate-400',
}

function parseDays(value: string | null): number {
  return rangeOptions.find((option) => String(option) === value) ?? DEFAULT_RANGE_DAYS
}

function complianceTone(percent: number | null): Tone {
  if (percent === null) return 'normal'
  if (percent >= 90) return 'ok'
  if (percent >= 75) return 'warning'

  return 'danger'
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">{children}</h2>
  )
}

function StatCard({
  label,
  value,
  hint,
  tone = 'normal',
  to,
}: {
  label: string
  value: string
  hint?: string
  tone?: Tone
  to?: string
}) {
  const content = (
    <>
      <p className="text-xs font-semibold tracking-wide text-muted uppercase">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${toneClass[tone]}`}>{value}</p>
      {hint !== undefined && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </>
  )

  const base = 'block rounded-md border border-line bg-white p-4'

  if (to !== undefined) {
    return (
      <Link to={to} className={`${base} hover:border-brand`}>
        {content}
      </Link>
    )
  }

  return <div className={base}>{content}</div>
}

interface BarRow {
  key: string
  label: string
  value: number
  barClass: string
}

function BarList({ rows }: { rows: BarRow[] }) {
  const max = Math.max(1, ...rows.map((row) => row.value))
  const total = rows.reduce((sum, row) => sum + row.value, 0)

  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <li key={row.key}>
          <div className="flex items-baseline justify-between text-sm">
            <span>{row.label}</span>
            <span className="font-medium">
              {row.value}
              <span className="ml-1 text-xs font-normal text-muted">
                ({total === 0 ? 0 : Math.round((row.value / total) * 100)}%)
              </span>
            </span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded bg-slate-100">
            <div
              className={`h-full ${row.barClass}`}
              style={{ width: `${(row.value / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}

function DashboardView({ data }: { data: DashboardData }) {
  const { snapshot, period_metrics: metrics } = data

  const statusRows: BarRow[] = statusOrder.map((status) => ({
    key: status,
    label: statusLabel[status],
    value: snapshot.by_status[status],
    barClass: statusDot[status],
  }))

  const priorityRows: BarRow[] = priorityOrder.map((priority) => ({
    key: priority,
    label: priorityLabel[priority],
    value: snapshot.by_priority[priority],
    barClass: priorityBar[priority],
  }))

  // Yang paling sibuk di atas, nama jadi pembeda kalau jumlahnya sama.
  const agents = [...data.agents].sort(
    (a, b) => b.active_tickets - a.active_tickets || a.name.localeCompare(b.name),
  )

  const compliance = metrics.sla_compliance_percent

  return (
    <div className="space-y-6">
      <section>
        <SectionTitle>Kondisi saat ini</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Tiket aktif"
            value={String(snapshot.active)}
            hint="Baru, terbuka, dikerjakan, menunggu"
            to="/tickets"
          />
          <StatCard
            label="Belum di-assign"
            value={String(snapshot.unassigned)}
            hint="Tiket aktif tanpa penanggung jawab"
            tone={snapshot.unassigned > 0 ? 'warning' : 'normal'}
            to="/tickets?assignment=unassigned"
          />
          <StatCard
            label="SLA hampir habis"
            value={String(snapshot.sla_warning)}
            hint="Waktu penyelesaian terpakai 80% atau lebih"
            tone={snapshot.sla_warning > 0 ? 'warning' : 'normal'}
          />
          <StatCard
            label="SLA terlewat"
            value={String(snapshot.sla_breached)}
            hint="Tiket aktif yang melewati batas waktu"
            tone={snapshot.sla_breached > 0 ? 'danger' : 'normal'}
          />
        </div>
      </section>

      <section>
        <SectionTitle>Dalam periode terpilih</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="Tiket dibuat" value={String(metrics.created)} />
          <StatCard
            label="Tiket selesai"
            value={String(metrics.resolved)}
            hint={`${metrics.resolved_within_sla} selesai sesuai SLA`}
          />
          <StatCard
            label="SLA compliance"
            value={compliance === null ? '—' : `${formatNumber(compliance)}%`}
            hint={compliance === null ? 'Belum ada tiket selesai' : 'Dari tiket selesai di periode'}
            tone={complianceTone(compliance)}
          />
          <StatCard
            label="Rata-rata respons pertama"
            value={formatDuration(metrics.avg_first_response_minutes)}
            hint="Sejak tiket dibuat"
          />
          <StatCard
            label="Rata-rata penyelesaian"
            value={formatDuration(metrics.avg_resolution_minutes)}
            hint="Tanpa waktu menunggu pemohon"
          />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card title="Tiket per status">
          <BarList rows={statusRows} />
        </Card>
        <Card title="Tiket per prioritas">
          <BarList rows={priorityRows} />
        </Card>
      </section>

      <Card title="Beban kerja agent">
        {agents.length === 0 ? (
          <p className="text-sm text-muted">Belum ada agent aktif.</p>
        ) : (
          <div className="-mx-4 -my-4 overflow-x-auto">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Nama
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">
                    Tiket aktif
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">
                    Selesai di periode
                  </th>
                </tr>
              </thead>
              <tbody>
                {agents.map((agent) => (
                  <tr key={agent.id} className="border-b border-line last:border-b-0">
                    <td className="px-4 py-3">
                      <span className="font-medium">{agent.name}</span>
                      <span className="ml-2 text-xs text-muted">{roleLabel[agent.role]}</span>
                    </td>
                    <td className="px-4 py-3 text-right">{agent.active_tickets}</td>
                    <td className="px-4 py-3 text-right">{agent.resolved_in_period}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <p className="text-xs text-muted">
        Metrik periode dihitung per hari UTC (hari baru mulai pukul 07.00 WIB). Tiket per status
        dan prioritas mencakup semua tiket, bukan hanya yang dibuat di periode. Data diperbarui
        otomatis tiap menit.
      </p>
    </div>
  )
}

export function DashboardPage() {
  const [params, setParams] = useSearchParams()
  const now = useNow()

  const days = parseDays(params.get('days'))
  const period = periodFor(days, now)
  const query = useDashboard(period.from, period.to)

  const shown = query.data?.period ?? period

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle={`Periode ${formatDate(shown.from)} – ${formatDate(shown.to)}`}
        actions={
          <div role="group" aria-label="Rentang periode" className="flex gap-1">
            {rangeOptions.map((option) => (
              <Button
                key={option}
                variant={option === days ? 'primary' : 'secondary'}
                aria-pressed={option === days}
                onClick={() =>
                  setParams(option === DEFAULT_RANGE_DAYS ? {} : { days: String(option) }, {
                    replace: true,
                  })
                }
              >
                {option} hari
              </Button>
            ))}
          </div>
        }
      />

      <div className="p-4 md:p-6">
        {query.isPending && (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        )}

        {query.isError && query.data === undefined && (
          <InlineError message={describeError(query.error)} />
        )}

        {query.data !== undefined && (
          <div className={`transition-opacity ${query.isPlaceholderData ? 'opacity-60' : ''}`}>
            <DashboardView data={query.data} />
          </div>
        )}
      </div>
    </>
  )
}