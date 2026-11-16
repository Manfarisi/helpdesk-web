import { Button, Card } from './ui'

export function Spinner() {
  return (
    <span
      role="status"
      aria-label="Memuat"
      className="inline-block size-5 animate-spin rounded-full border-2 border-line border-t-brand"
    />
  )
}

export function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-muted">
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
      className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {message}
    </div>
  )
}

export function ConnectionError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm text-center">
        <h1 className="text-lg font-semibold">Tidak bisa memuat sesi</h1>
        <p className="mt-2 text-sm text-muted">
          Server API tidak merespons. Pastikan API sudah berjalan, lalu coba lagi.
        </p>
        <Button onClick={onRetry} className="mt-4">
          Coba lagi
        </Button>
      </Card>
    </div>
  )
}