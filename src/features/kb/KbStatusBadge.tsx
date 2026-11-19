import type { KbArticleStatus } from './kb-api'

const styles: Record<KbArticleStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-amber-100 text-amber-800' },
  published: { label: 'Dipublikasikan', className: 'bg-emerald-100 text-emerald-800' },
}

export function KbStatusBadge({ status }: { status: KbArticleStatus }) {
  const style = styles[status]

  return (
    <span className={`rounded px-2 py-0.5 text-xs font-medium whitespace-nowrap ${style.className}`}>
      {style.label}
    </span>
  )
}