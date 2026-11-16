export function Spinner() {
  return (
    <span
      role="status"
      aria-label="Memuat"
      className="inline-block size-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600"
    />
  )
}

export function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <Spinner />
        <span>Memuat…</span>
      </div>
    </div>
  )
}

export function InlineError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {message}
    </div>
  )
}

export function ConnectionError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-lg font-semibold">Tidak bisa memuat sesi</h1>
        <p className="mt-2 text-sm text-slate-600">
          Server API tidak merespons. Pastikan API sudah berjalan, lalu coba lagi.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Coba lagi
        </button>
      </div>
    </div>
  )
}