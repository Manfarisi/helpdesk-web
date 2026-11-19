export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'sidebar'

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-hover',
  secondary: 'border border-line bg-white text-ink hover:bg-slate-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  sidebar: 'border border-sidebar-border text-slate-200 hover:bg-sidebar-hover hover:text-white',
}

/**
 * Kelas tombol, dipakai bersama oleh <Button> (tombol) dan <ButtonLink> (tautan
 * yang tampil seperti tombol).
 */
export function buttonClass(variant: ButtonVariant = 'primary'): string {
  return `inline-flex items-center justify-center gap-2 rounded px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60 ${buttonVariants[variant]}`
}

export const controlClass =
  'w-full rounded border border-line bg-white px-3 py-2 text-sm focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none disabled:bg-slate-50 disabled:text-muted'