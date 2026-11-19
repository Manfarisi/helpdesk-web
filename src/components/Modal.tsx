import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

/**
 * Dialog modal. Dipasang (di-render) hanya saat perlu tampil, dan langsung terbuka.
 * Menutup lewat tombol X, tombol Esc, atau klik di luar kotak, semuanya memanggil onClose.
 */
export function Modal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current

    if (dialog !== null && !dialog.open) dialog.showModal()
  }, [])

  return (
    <dialog
      ref={ref}
      aria-labelledby="modal-title"
      onClose={onClose}
      onClick={(event) => {
        // Klik di area gelap di luar kotak mengenai elemen dialog itu sendiri.
        if (event.target === event.currentTarget) onClose()
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-md bg-white p-0 text-ink shadow-xl backdrop:bg-slate-900/50"
    >
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <h2 id="modal-title" className="text-base font-semibold">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup"
          className="rounded p-1 text-muted hover:bg-slate-100 hover:text-ink"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
      <div className="max-h-[75vh] overflow-y-auto p-5">{children}</div>
    </dialog>
  )
}