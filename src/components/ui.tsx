import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { buttonClass, type ButtonVariant } from '../lib/styles'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

export function Button({
  variant = 'primary',
  type = 'button',
  className = '',
  ...props
}: ButtonProps) {
  return <button type={type} className={`${buttonClass(variant)} ${className}`} {...props} />
}

interface ButtonLinkProps extends Omit<LinkProps, 'className'> {
  variant?: ButtonVariant
  className?: string
}

/**
 * Tautan antar halaman yang tampil seperti tombol.
 */
export function ButtonLink({ variant = 'primary', className = '', ...props }: ButtonLinkProps) {
  return <Link className={`${buttonClass(variant)} ${className}`} {...props} />
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
        <h1 className="truncate text-base font-semibold" title={title}>
          {title}
        </h1>
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

/**
 * Satu kolom form: label, kontrol (input, select, textarea), petunjuk, dan pesan error.
 */
export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium">
        {label}
      </label>
      <div className="mt-1">{children}</div>
      {error !== undefined ? (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      ) : (
        hint !== undefined && <p className="mt-1 text-xs text-muted">{hint}</p>
      )}
    </div>
  )
}