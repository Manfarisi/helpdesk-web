import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'sidebar'

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-hover',
  secondary: 'border border-line bg-white text-ink hover:bg-slate-50',
  sidebar: 'border border-sidebar-border text-slate-200 hover:bg-sidebar-hover hover:text-white',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

export function Button({
  variant = 'primary',
  type = 'button',
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60 ${buttonVariants[variant]} ${className}`}
      {...props}
    />
  )
}

/**
 * Bar judul halaman (putih, di bawah garis aksen biru). Tombol aksi halaman
 * ditaruh lewat prop `actions`, di sisi kanan.
 */
export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-white px-6 py-3">
      <div className="min-w-0">
        <h1 className="truncate text-base font-semibold">{title}</h1>
        {subtitle !== undefined && <p className="text-xs text-muted">{subtitle}</p>}
      </div>
      {actions}
    </header>
  )
}

export function Card({
  title,
  children,
  className = '',
}: {
  title?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`rounded-md border border-line bg-white ${className}`}>
      {title !== undefined && (
        <h2 className="border-b border-line px-4 py-3 text-sm font-semibold">{title}</h2>
      )}
      <div className="p-4">{children}</div>
    </section>
  )
}